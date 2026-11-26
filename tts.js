/* Norsk stemme: Piper «talesyntese» (no_NO-talesyntese-medium, Nasjonalbiblioteket, CC0), lest inn på forhånd (26. november 2026).
   Alt spillet kan si er laget som klipp, én setning per klipp, med tts/make-voice.mjs, og pakket i tts/voice/talesyntese.mp3 (MP3) med en
   liste i tts/voice/talesyntese.json. Spillet laster ned pakken én gang (ca. 8 MB, lagres i Cache Storage) og spiller klippene; det lager
   ingen tale selv. Stemmen er slik modellen lager den: tonehøyden er ikke endret. En setning som ikke har klipp (eller en replikk med en
   slik setning i), leses av enhetens egen stemme, og det gjør den også når «Piper-stemme» er slått av i innstillingene.
   Før: 22.–24. november 2026 Piper «talesyntese» laget på iPaden (fra 24. november gjort lysere med TD-PSOLA, som sprakte), 25. november
   Canora Norwegian «ingrid», lest inn på forhånd. Begge er fjernet; pakken med «ingrid» og de gamle Piper-filene slettes fra Cache Storage. */
const VOICE_CACHE='sofia-stemme',VOICE_NAME='talesyntese';

// Som tts/clips.mjs (testene sjekker at de er like): setningene i en tekst, og hva som leses for det som står.
function voiceSentences(text){const t=String(text??'').replace(/[\p{Extended_Pictographic}\p{So}\u{FE0F}\u{200D}\u{20E3}]/gu,' ').replace(/\s+/g,' ').trim();if(!t)return [];
 return t.replace(/([.!?…]["»”')\]]*)(?:\s+|(?=\p{Lu}))/gu,'$1\n').split('\n').map(s=>s.trim()).filter(s=>/[\p{L}\d]/u.test(s));}
// PEG (sonden på magen) sies som et ord, «pegg», ikke P-E-G, og ord med store bokstaver («FOR VARMT FOR EN AND») leses som ord, ikke stavet.
function spokenText(text){return String(text??'').replace(/\bPEG\b/g,'pegg').replace(/(^|[^\p{L}])(\p{Lu}{2,}(?:(?:,? |-)\p{Lu}{2,})+|\p{Lu}{6,})(?!\p{L})/gu,(m,pre,w)=>pre+w[0]+w.slice(1).toLowerCase());}

class ClipVoice{
 constructor(base='tts/voice/'){this.base=base;this.status='off';this.progress=0;this.sampleRate=22050;this.index=null;this.pack=null;this.cache=new Map();this.cacheBytes=0;this.listeners=new Set();this.error='';this.retries=0;this.decoder=null;this.missed=new Set();this.badClips=0;this.failedAt=0;
  // Kommer nettet tilbake, eller siden fram igjen, prøves en stemme som feilet med en gang (25. november 2026: den skal aldri måtte slås av og på).
  try{globalThis.addEventListener?.('online',()=>this.retry());globalThis.document?.addEventListener?.('visibilitychange',()=>{if(!document.hidden)this.retry();});}catch{}}
 static supported(){try{return typeof fetch==='function'&&!!(window.OfflineAudioContext||window.webkitOfflineAudioContext)&&!!(window.AudioContext||window.webkitAudioContext);}catch{return false;}}
 get ready(){return this.status==='ready';}
 onChange(fn){this.listeners.add(fn);return()=>this.listeners.delete(fn);}
 set(status){this.status=status;for(const fn of this.listeners)try{fn(this);}catch{}}
 // Listen hentes på nytt hver gang (så nye klipp kommer med), pakken bare når den er ny (adressen har pakkens hash). Uten nett brukes det som er lagret.
 async load({force=false}={}){if(this.status==='loading'||this.status==='ready')return;if(!ClipVoice.supported())return this.set('unsupported');
  if(this.index&&this.pack){this.error='';return this.set('ready');} // allerede lastet (etter en pause)
  this.progress=0;this.error='';this.set('loading');
  try{let cache=null;try{cache=await caches.open(VOICE_CACHE);}catch{}
   const indexUrl=new URL(this.base+VOICE_NAME+'.json',location.href).href;let res=null;
   try{res=await fetch(indexUrl,{cache:'no-cache'});if(!res.ok)res=null;}catch{}
   if(res){const copy=res.clone();cache?.put(indexUrl,copy).catch(()=>{});}else res=await cache?.match(indexUrl);
   if(!res)throw new Error('ingen liste');
   const index=await res.json(),packUrl=new URL(this.base+VOICE_NAME+'.mp3?v='+index.hash,location.href).href;
   let buf=null;const hit=await cache?.match(packUrl).catch(()=>null);
   if(hit)buf=await hit.arrayBuffer();
   else{const r=await fetch(packUrl);if(!r.ok)throw new Error(VOICE_NAME+'.mp3: HTTP '+r.status);const total=+r.headers.get('content-length')||index.bytes||1;
    if(r.body?.getReader){const reader=r.body.getReader(),parts=[];let size=0;for(;;){const {done,value}=await reader.read();if(done)break;parts.push(value);size+=value.byteLength;this.progress=Math.min(.99,size/total);this.set('loading');}
     const all=new Uint8Array(size);let at=0;for(const p of parts){all.set(p,at);at+=p.byteLength;}buf=all.buffer;}else buf=await r.arrayBuffer();
    if(cache){for(const k of await cache.keys().catch(()=>[]))if(k.url!==packUrl&&k.url!==indexUrl)cache.delete(k).catch(()=>{});await cache.put(packUrl,new Response(buf,{headers:{'Content-Type':'audio/mpeg'}})).catch(()=>{});}}
   dropOldVoices();this.index=index;this.pack=new Uint8Array(buf);this.sampleRate=index.sampleRate||22050;this.progress=1;this.retries=0;this.set('ready');}
  catch(err){this.fail(err);}}
 // Feiler nedlastingen (nettet borte), prøves den igjen av seg selv, uten grense: etter 10, 20, 40 … sekunder (høyst 2 minutter mellom), og med en gang
 // når nettet kommer tilbake, siden vises igjen eller noe skal leses. Stopper stemmen opp ('stalled') eller vil klippene ikke pakkes ut ('decode'),
 // leser enhetens stemme i 30 sekunder, og så er den nye stemmen tilbake av seg selv. Før 25. november 2026 ga den opp etter to forsøk.
 fail(err){this.error=String(err?.message||err||'');this.failedAt=Date.now();this.set('failed');clearTimeout(this.retryTimer);
  const rest=this.error==='stalled'||this.error==='decode',wait=rest?30000:Math.min(120000,10000*2**this.retries++);
  this.retryTimer=setTimeout(()=>{if(this.status==='failed'){this.badClips=0;this.load({force:true});}},wait);}
 retry(){if(this.status==='failed'&&this.error!=='stalled'&&this.error!=='decode'){clearTimeout(this.retryTimer);this.load({force:true});}}
 // Noe skal leses: er stemmen ikke startet, eller feilet den for mer enn fem sekunder siden, startes den nå.
 ensure(){if(this.status==='off'||this.status==='failed'&&this.error!=='stalled'&&this.error!=='decode'&&Date.now()-this.failedAt>5000)this.load({force:true});}
 has(text){const s=voiceSentences(text);return s.length>0&&s.every(x=>this.cache.has(x));}
 // Har alle setningene i teksten klipp?
 covers(text){const s=voiceSentences(text);return !!this.index&&s.length>0&&s.every(x=>this.index.clips[x]);}
 decode(sentence){const hit=this.cache.get(sentence);if(hit){this.cache.delete(sentence);this.cache.set(sentence,hit);return Promise.resolve(hit);}
  const [at,len]=this.index.clips[sentence],bytes=this.pack.slice(at,at+len).buffer;
  if(!this.decoder){const C=window.OfflineAudioContext||window.webkitOfflineAudioContext;this.decoder=new C(1,1,this.sampleRate);}
  return new Promise((done,fail)=>{const p=this.decoder.decodeAudioData(bytes,done,fail);p?.catch?.(()=>{});}).then(buf=>{const pcm=trimQuiet(buf.getChannelData(0),buf.sampleRate);this.sampleRate=buf.sampleRate;this.remember(sentence,pcm);return pcm;});}
 // Ett klipp per setning: onchunk for hver, ondone til slutt. Mangler et klipp, kommer onerror (og enhetens stemme leser replikken).
 speak(text){const job={chunks:[],finished:false,onchunk:null,ondone:null,onerror:null,cancel(){job.finished=true;},fail(){if(!job.finished){job.finished=true;job.onerror?.();}}};
  const list=voiceSentences(text);
  if(!this.ready||!list.length||!list.every(s=>this.index.clips[s])){for(const s of list)if(this.ready&&!this.index.clips[s]&&!this.missed.has(s)){this.missed.add(s);console.info('Ingen klipp for: «'+s+'» (node tts/make-voice.mjs)');}queueMicrotask(()=>job.fail());return job;}
  job.cached=list.every(s=>this.cache.has(s));
  // Et klipp som ikke vil pakkes ut: enhetens stemme leser den replikken. Tre på rad: en pause på 30 sekunder (fail('decode')).
  (async()=>{for(const s of list){if(job.finished)return;let pcm;try{pcm=await this.decode(s);this.badClips=0;}catch{if(!job.finished){if(++this.badClips>=3)this.fail('decode');job.fail();}return;}if(job.finished)return;job.chunks.push(pcm);job.onchunk?.(pcm);}
   if(!job.finished){job.finished=true;job.ondone?.();}})();
  return job;}
 // Pakk ut klipp på forhånd (for eksempel bokstavnavnene), så de kommer med en gang.
 prewarm(texts){(async()=>{for(const t of texts)for(const s of voiceSentences(t))if(this.ready&&this.index.clips[s]&&!this.cache.has(s))try{await this.decode(s);}catch{return;}})();}
 remember(key,pcm){if(this.cache.has(key))return;this.cache.set(key,pcm);this.cacheBytes+=pcm.byteLength;
  for(const [k,v] of this.cache){if(this.cacheBytes<=24e6)break;this.cache.delete(k);this.cacheBytes-=v.byteLength;}}
}
// Det den første Piper-stemmen la igjen i Cache Storage da den ble laget på iPaden (sofia-tts-*, 48 MB), slettes. Pakken med «ingrid» lå i
// samme lager som klippene nå, og tas bort når den nye pakken lagres.
function dropOldVoices(){try{caches.keys().then(keys=>{for(const k of keys)if(/^sofia-tts-/.test(k))caches.delete(k).catch(()=>{});}).catch(()=>{});}catch{}}
// Stillhet før og etter et klipp tas bort (MP3 legger til litt), med 20 ms igjen.
function trimQuiet(pcm,sr,threshold=.003,keep=.02){let a=0,b=pcm.length;while(a<b&&Math.abs(pcm[a])<threshold)a++;while(b>a&&Math.abs(pcm[b-1])<threshold)b--;const k=Math.round(keep*sr);return pcm.slice(Math.max(0,a-k),Math.min(pcm.length,b+k));}
