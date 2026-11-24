/* Norsk nevral stemme: Piper «talesyntese» (Nasjonalbiblioteket, CC0) som kjører i en Web Worker (tts/piper-worker.mjs).
   Første gang lastes ca. 48 MB ned (modell 32 MB, ONNX Runtime 15 MB, norsk espeak-ng 1 MB). Senere ligger filene i
   Cache Storage. Klippene som allerede er laget, huskes i minnet, så bokstavene kommer med en gang. */
const PIPER_VERSION='1',PIPER_GUARD='sofias-romreise-stemme-starter';
class PiperVoice{
 constructor(base='tts/'){this.base=base;this.status='off';this.progress=0;this.sampleRate=22050;this.worker=null;this.jobs=new Map();this.seq=0;this.cache=new Map();this.cacheBytes=0;this.listeners=new Set();this.error='';}
 static supported(){try{return typeof Worker==='function'&&typeof WebAssembly==='object'&&typeof BigInt64Array==='function'&&typeof caches!=='undefined'&&!!(window.AudioContext||window.webkitAudioContext);}catch{return false;}}
 get ready(){return this.status==='ready';}
 onChange(fn){this.listeners.add(fn);return()=>this.listeners.delete(fn);}
 set(status){this.status=status;for(const fn of this.listeners)try{fn(this);}catch{}}
 // Ble siden borte mens stemmen startet sist (typisk: for lite minne på en eldre iPad), startes den ikke av seg selv igjen.
 static crashedBefore(){try{return !!localStorage.getItem(PIPER_GUARD);}catch{return false;}}
 guard(on){try{on?localStorage.setItem(PIPER_GUARD,String(Date.now())):localStorage.removeItem(PIPER_GUARD);}catch{}}
 load({force=false}={}){if(this.status==='loading'||this.status==='ready')return;if(!PiperVoice.supported())return this.set('unsupported');if(!force&&PiperVoice.crashedBefore()){this.error='crash';return this.set('failed');}this.progress=0;this.error='';
  try{this.worker=new Worker(this.base+'piper-worker.mjs?v='+PIPER_VERSION,{type:'module'});}catch(err){return this.fail(err);}
  this.worker.onmessage=e=>this.message(e.data||{});this.worker.onerror=e=>{e.preventDefault?.();this.fail(e.message||'worker');};this.set('loading');this.worker.postMessage({type:'init'});}
 fail(err){this.error=String(err?.message||err||'');this.guard(false);try{this.worker?.terminate();}catch{}this.worker=null;for(const job of this.jobs.values())job.fail();this.jobs.clear();this.set('failed');}
 message(m){const job=m.id!=null?this.jobs.get(m.id):null;switch(m.type){
  case 'progress':this.progress=m.value;this.set('loading');break;
  case 'starting':this.guard(true);break;
  case 'ready':this.guard(false);this.sampleRate=m.sampleRate||22050;this.loadMs=m.ms;this.progress=1;this.set('ready');break;
  case 'failed':this.fail(m.message);break;
  case 'chunk':if(job){job.chunks.push(m.pcm);job.onchunk?.(m.pcm);}break;
  case 'done':if(job){this.jobs.delete(m.id);this.remember(job.key,job.chunks);job.finished=true;job.ondone?.();}break;
  case 'cancelled':this.jobs.delete(m.id);break;
  case 'error':if(job){this.jobs.delete(m.id);job.fail();}break;}}
 // Ett klipp per setning; onchunk kommer for hver setning så snart den er laget, ondone til slutt.
 speak(text,{lengthScale=1,low=false}={}){const key=lengthScale+'|'+text,job={key,chunks:[],finished:false,onchunk:null,ondone:null,onerror:null,cancel:()=>{},fail(){if(!job.finished){job.finished=true;job.onerror?.();}}};
  const hit=this.cache.get(key);if(hit){this.cache.delete(key);this.cache.set(key,hit);job.chunks=hit;job.cached=true;queueMicrotask(()=>{if(job.finished)return;for(const c of hit)job.onchunk?.(c);job.finished=true;job.ondone?.();});job.cancel=()=>{job.finished=true;};return job;}
  if(!this.ready||!this.worker){queueMicrotask(()=>job.fail());return job;}
  const id=++this.seq;this.jobs.set(id,job);this.worker.postMessage({type:'speak',id,text,lengthScale,low});
  job.cancel=()=>{if(job.finished)return;job.finished=true;this.jobs.delete(id);this.worker?.postMessage({type:'cancel',id});};return job;}
 // Lag klipp på forhånd (for eksempel bokstavnavnene), uten å forstyrre det som leses nå.
 prewarm(texts,opts={}){for(const text of texts)if(!this.cache.has((opts.lengthScale||1)+'|'+text))this.speak(text,{...opts,low:true});}
 has(text,lengthScale=1){return this.cache.has(lengthScale+'|'+text);}
 remember(key,chunks){const bytes=chunks.reduce((n,c)=>n+c.byteLength,0);if(!bytes||bytes>4e6||this.cache.has(key))return;this.cache.set(key,chunks);this.cacheBytes+=bytes;
  for(const [k,v] of this.cache){if(this.cacheBytes<=24e6)break;this.cache.delete(k);this.cacheBytes-=v.reduce((n,c)=>n+c.byteLength,0);}}
}
