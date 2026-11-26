/* Synthesized, gesture-unlocked sound design and bounded Norwegian speech queue. */
// Norwegian letter names, read aloud when a letter is pressed or asked for.
const LETTER_NAMES={A:'a',B:'be',C:'se',D:'de',E:'e',F:'eff',G:'ge',H:'hå',I:'i',J:'jådd',K:'kå',L:'ell',M:'emm',N:'enn',O:'o',P:'pe',Q:'ku',R:'ærr',S:'ess',T:'te',U:'u',V:'ve',W:'dobbelt ve',X:'eks',Y:'y',Z:'sett',Æ:'æ',Ø:'ø',Å:'å'};
// En liten pause mellom setningene i Piper-stemmen (tempoet er lest inn i klippene: litt roligere enn vanlig, for en femåring).
const SENTENCE_GAP=.22;
// Beste norske stemme på enheten: Premium foran Forbedret foran vanlig, bokmål foran nynorsk.
function bestNorwegianVoice(voices){const score=v=>{const id=(v.voiceURI||'')+' '+(v.name||'');return(/^(nb|no)(-|_|$)/i.test(v.lang)?10:/^nn/i.test(v.lang)?5:-99)+(/premium/i.test(id)?3:/enhanced|forbedret/i.test(id)?2:0)+(v.localService?.5:0);};let best=null;for(const v of voices)if(score(v)>0&&(!best||score(v)>score(best)))best=v;return best;}
class GameAudio {
 constructor(getState){this.getState=getState;this.context=null;this.master=null;this.voiceOut=null;this.engine=null;this.queue=[];this.current=null;this.generation=0;this.voices=[];this.deviceVoice=null;this.synth=window.speechSynthesis;
  // Piper-stemmen «talesyntese» (tts.js: ferdige klipp). Er den slått av, mangler den, eller går den ikke på enheten, brukes enhetens egen stemme.
  this.neural=typeof ClipVoice==='function'&&ClipVoice.supported()?new ClipVoice():null;
  this.neural?.onChange(n=>{if(n.ready&&!this.warmed){this.warmed=true;n.prewarm([...new Set(Object.values(LETTER_NAMES))]);}this.updateVoiceNote();});
  this.refreshVoices=()=>{this.voices=this.synth?.getVoices()||[];this.deviceVoice=bestNorwegianVoice(this.voices);this.updateVoiceNote();};this.refreshVoices();this.synth?.addEventListener?.('voiceschanged',this.refreshVoices);
  this.stallMs=8000;this.stalls=0;this.hiddenAt=0;document.addEventListener?.('visibilitychange',()=>{if(document.hidden)this.hiddenAt=Date.now();});
  // Hvert trykk vekker lyden igjen. iOS kan sette Web Audio på pause («interrupted») etter en samtale, en annen app eller enhetens stemme.
  // På iPad teller bare slipp av fingeren (pointerup, touchend, click) som et trykk som kan starte lyd, ikke pointerdown (25. november 2026).
  this.waitMs=3000;for(const type of ['pointerdown','pointerup','touchend','click','keydown'])document.addEventListener?.(type,()=>this.unlock(),true);}
 // Start nedlastingen av Piper-stemmen litt etter oppstart, når 3D-scenen har fått lastet ferdig.
 // Stemmen er på fra start: den lastes uansett om lyden er av eller på, så den er klar når lyden slås på. Slått av lastes den ikke.
 startNeural(delay=2500){if(!this.neural)return;clearTimeout(this.neuralTimer);this.neuralTimer=setTimeout(()=>{if(this.getState().neural!==false&&!navigator.connection?.saveData)this.neural.load();},delay);}
 neuralOn(){return !!this.neural?.ready&&this.getState().neural!==false;}
 updateVoiceNote(){const label=document.getElementById('voice-note');if(!label)return;const n=this.neural,on=this.getState?.().neural!==false,device=this.voices.some(v=>/^(nb|no|nn)(-|_|$)/i.test(v.lang));
  label.textContent=on&&n?.ready?'Piper-stemmen er klar: «talesyntese» fra Nasjonalbiblioteket, lest inn på forhånd, så den virker også uten nett. Slå den av for å bruke iPadens eller nettleserens egen stemme.'
  :on&&n?.status==='loading'?`Laster ned Piper-stemmen: ${Math.round(n.progress*100)} % (ca. 8 MB, bare første gang). Imens leser enheten med sin egen stemme.`
  :on&&n?.status==='failed'&&(n.error==='stalled'||n.error==='decode')?'Piper-stemmen tar en liten pause, så enhetens egen stemme leser. Den er tilbake av seg selv om et halvt minutt.'
  :on&&n?.status==='failed'?'Piper-stemmen kunne ikke startes nå. '+(device?'Enhetens norske stemme leser i stedet.':'Legg gjerne til en norsk stemme i iPad-innstillingene.')
  :on&&(!n||n.status==='unsupported')?'Denne nettleseren kan ikke bruke Piper-stemmen. '+(device?'Enhetens norske stemme leser i stedet.':'Legg gjerne til en norsk stemme i iPad-innstillingene.')
  :!on?'Av: iPadens eller nettleserens egen stemme leser. '+(device?'Den beste norske stemmen på enheten brukes.':'Legg gjerne til en norsk stemme i iPad-innstillingene.')
  :device?'Norsk opplesning er klar. Bokstavene leses når du trykker, og fakta leses ved ankomst.':'Bokstaver og fakta leses med norsk stemme når den finnes på enheten. Du kan legge til en norsk stemme i iPad-innstillingene. Spillet fungerer også uten lyd.';}
 unlock(){if(this.getState().muted)return;try{if(!this.context){this.context=new(window.AudioContext||window.webkitAudioContext)();this.master=this.context.createGain();this.master.gain.value=.65;this.master.connect(this.context.destination);}if(this.context.state!=='running'&&this.context.state!=='closed')this.context.resume?.().catch?.(()=>{});}catch{}}
 tone(freq=500,length=.12,shape='sine',volume=.065,delay=0,endFreq=freq){if(this.getState().muted||this.getState().paused)return;this.unlock();if(!this.context)return;const ctx=this.context,o=ctx.createOscillator(),g=ctx.createGain(),t=ctx.currentTime+delay;o.type=shape;o.frequency.setValueAtTime(freq,t);o.frequency.exponentialRampToValueAtTime(Math.max(30,endFreq),t+length);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(volume,t+.015);g.gain.exponentialRampToValueAtTime(.0001,t+length);o.connect(g);g.connect(this.master);o.start(t);o.stop(t+length+.03);o.onended=()=>{o.disconnect();g.disconnect();};}
 swoosh(duration=.5,strength=.06,up=true){if(this.getState().muted||this.getState().paused)return;this.unlock();if(!this.context)return;const ctx=this.context,t=ctx.currentTime,buffer=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*duration),ctx.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();source.buffer=buffer;filter.type='bandpass';filter.Q.value=.7;filter.frequency.setValueAtTime(up?180:1600,t);filter.frequency.exponentialRampToValueAtTime(up?2500:160,t+duration);gain.gain.setValueAtTime(.0001,t);gain.gain.exponentialRampToValueAtTime(strength,t+duration*.2);gain.gain.exponentialRampToValueAtTime(.0001,t+duration);source.connect(filter);filter.connect(gain);gain.connect(this.master);source.start(t);source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();};}
 effect(name){switch(name){
 case 'letter':this.tone(600,.16,'sine',.045,0,900);break;
 case 'boost':this.swoosh(.38,.09);this.tone(150,.35,'triangle',.07,0,460);break;
 case 'super':this.swoosh(.85,.12);this.tone(140,.65,'triangle',.09,0,720);[659,830,988].forEach((f,i)=>this.tone(f,.28,'sine',.055,.08+i*.1));break;
 case 'wrong':this.tone(310,.20,'sine',.045,0,200);break;
 case 'launch':this.swoosh(1.3,.13);this.tone(70,1,'triangle',.085,0,230);break;
 case 'arrival':[523,659,784,1047].forEach((f,i)=>this.tone(f,.45,'sine',.06,i*.13));this.swoosh(.65,.04,false);break;
 case 'flyby':this.tone(440,.23,'sine',.05,0,660);this.tone(880,.35,'sine',.04,.16);this.swoosh(.7,.04);break;
 case 'sun':this.swoosh(1.2,.12,false);this.tone(95,.75,'triangle',.07,0,55);break;
 case 'rescue':[784,988,1175].forEach((f,i)=>this.tone(f,.3,'sine',.055,i*.12));break;
 case 'countdown':this.tone(420,.12,'sine',.065);break;
 case 'pop':this.tone(520,.09,'sine',.07,0,1150);this.swoosh(.18,.03);break;
 case 'sparkle':[1319,1568,2093].forEach((f,i)=>this.tone(f,.16,'sine',.04,i*.05));break;
 case 'thud':this.tone(120,.3,'triangle',.08,0,48);this.swoosh(.35,.05,false);break;
 case 'boing':this.tone(210,.42,'sine',.07,0,640);break;
 case 'correct':[784,1047].forEach((f,i)=>this.tone(f,.24,'sine',.06,i*.11));break;
 case 'oops':this.tone(330,.16,'sine',.04,0,260);this.tone(262,.2,'sine',.035,.12,230);break;
 // Two quacks for the duck, and a soft lullaby (the start of Brahms' Wiegenlied) when Sofia goes to bed.
 case 'quack':[0,.24].forEach(d=>{this.tone(560,.13,'sawtooth',.035,d,330);this.tone(1120,.1,'square',.008,d,640);});break;
 case 'lullaby':[[330,0],[330,.36],[392,.72],[330,1.3],[330,1.66],[392,2.02],[330,2.6],[392,2.96],[523,3.32],[494,3.9],[440,4.26],[440,4.62],[392,4.98]].forEach(([f,d],i)=>{this.tone(f,i===12?1.2:.62,'sine',.035,d);this.tone(f*2,.4,'sine',.008,d);});break;
 // Mealtime and tooth brushing (23 November 2026): a happy «nam», the click of the tube, the pump's beeps, brushing, toothpaste and rinsing.
 case 'nam':this.tone(330,.12,'sine',.07,0,260);this.tone(392,.15,'sine',.06,.14,300);break;
 case 'click':this.tone(1500,.035,'square',.025);this.tone(950,.05,'square',.022,.05);break;
 case 'beep':this.tone(1760,.13,'sine',.05);break;
 case 'pumpdone':[0,.24,.48].forEach(d=>this.tone(1760,.13,'sine',.05,d));break;
 // A drink from the glass (24 November 2026): three soft, low gulps.
 case 'glugg':[0,.22,.44].forEach((d,i)=>{this.tone(260-i*25,.13,'sine',.06,d,150);this.tone(520-i*50,.06,'sine',.015,d+.02,300);});break;
 // The white mobile (25 November 2026): two soft blips when it opens, a whoosh when an order is sent, and the doorbell when the food comes.
 case 'phone':[0,.09].forEach((d,i)=>this.tone(1175+i*392,.07,'sine',.035,d));break;
 case 'order':this.swoosh(.45,.045);this.tone(880,.14,'sine',.04,0,1320);break;
 case 'doorbell':[[659,0],[523,.42]].forEach(([f,d])=>{this.tone(f,.75,'sine',.07,d);this.tone(f*2,.4,'sine',.014,d);});break;
 case 'scrub':this.swoosh(.13,.028,true);break;
 case 'squeeze':this.tone(230,.32,'triangle',.05,0,140);this.swoosh(.35,.035,false);break;
 case 'rinse':this.swoosh(1.2,.06,false);[0,.22,.44,.66].forEach((d,i)=>this.tone(240+i*40,.12,'sine',.04,.3+d,170));break;
 case 'fanfare':[523,659,784,1047,784,1047].forEach((f,i)=>this.tone(f,i>3?.5:.2,'triangle',.06,i*.12));this.swoosh(.9,.05);break;
 }}
 // A cheerful five-note scale, so a row of catches plays a little tune.
 note(i){const scale=[523,587,659,784,880];this.tone(scale[i%5]*(1+Math.floor(i/5)),.3,'sine',.06);this.tone(scale[i%5]*2*(1+Math.floor(i/5)),.22,'sine',.02,.02);}
 makeEngine(){if(this.engine||!this.context)return;const ctx=this.context,o=ctx.createOscillator(),harmonic=ctx.createOscillator(),gain=ctx.createGain();o.type='sine';harmonic.type='triangle';o.frequency.value=65;harmonic.frequency.value=130;gain.gain.value=0;o.connect(gain);harmonic.connect(gain);gain.connect(this.master);o.start();harmonic.start();this.engine={o,harmonic,gain};}
 update(){if(!this.context)return;const s=this.getState(),active=s.mode==='flight'&&!s.muted&&!s.paused;this.master.gain.setTargetAtTime(s.muted||s.paused?0:this.current?.id?.startsWith('letter')?.36:(this.current?.id?.startsWith('fact')||this.current?.id?.startsWith('flyby'))?.20:.65,this.context.currentTime,.045);if(active)this.makeEngine();if(!this.engine)return;const t=this.context.currentTime;this.engine.gain.gain.setTargetAtTime(active?.012+Math.max(0,s.speed-1)*.014:0,t,.09);this.engine.o.frequency.setTargetAtTime(62+s.speed*18,t,.1);this.engine.harmonic.frequency.setTargetAtTime(125+s.speed*35,t,.1);}
 stopSpeech(){this.generation++;this.queue=[];const c=this.current;this.current=null;if(c?.job){clearTimeout(c.timer);c.job.cancel();for(const src of c.sources)try{src.stop();}catch{}}this.synth?.cancel();}
 say(text,{force=false,queue=false,id='info'}={}){const s=this.getState();if(s.muted||(!s.voice&&!force)||(!this.neuralOn()&&(!this.synth||typeof SpeechSynthesisUtterance==='undefined')))return;if(!queue)this.stopSpeech();if(this.queue.length>=8)this.queue.shift();this.queue.push({text,id,force,at:Date.now()});this.pump();}
 letter(letter,completedWord=''){const names=LETTER_NAMES;if(this.current&&!this.current.id.startsWith('letter')&&!this.current.id.startsWith('flyby')&&!this.current.id.startsWith('fact'))this.stopSpeech();this.say((names[letter]||letter)+(completedWord?'. '+completedWord.toLowerCase()+'! '+(['Bra, Sofia!','Kult, Sofia!','Supert, Sofia!'][Math.floor(Math.random()*3)]):''),{queue:true,id:'letter-'+letter});}
 pump(){if(this.current||!this.queue.length)return;const s=this.getState();if(s.muted||(!s.voice&&!this.queue[0].force)||s.paused)return;const item=this.queue.shift(),gen=this.generation;
  // Den nye stemmen er på, men ikke klar ennå (den lastes fra lageret eller nettet): start den om den ikke er i gang, og vent opptil tre sekunder
  // på den før enhetens stemme tar replikken. Så slipper den første replikken etter oppstart å bli lest av feil stemme.
  if(this.context&&this.neural&&s.neural!==false&&!this.neural.ready){this.neural.ensure?.();
   if(this.neural.status==='loading'&&Date.now()-(item.at||0)<this.waitMs){this.queue.unshift(item);clearTimeout(this.waitTimer);this.waitTimer=setTimeout(()=>this.pump(),150);return;}}
  if(!this.neuralOn()||!this.context)return this.speakDevice(item,gen);
  if(this.context.state==='running')return this.speakNeural(item,gen);
  // Står lyden på pause (iOS), vekkes den først. Våkner den innen et øyeblikk, leser den nye stemmen; ellers leser enhetens stemme.
  const cur={...item,waking:true};this.current=cur;let settled=false;
  const go=()=>{if(settled)return;settled=true;if(gen!==this.generation||this.current!==cur)return;this.current=null;this.context.state==='running'&&this.neuralOn()?this.speakNeural(item,gen):this.speakDevice(item,gen);};
  try{this.context.resume?.().then?.(go,go);}catch{}setTimeout(go,this.wakeMs??350);}
 speakDevice(item,gen){if(!this.synth||typeof SpeechSynthesisUtterance==='undefined'){this.current=null;return this.pump();}const u=new SpeechSynthesisUtterance(typeof spokenText==='function'?spokenText(item.text):item.text);this.refreshVoices();u.lang='nb-NO';u.rate=item.id.startsWith('letter')?.9:.83;u.pitch=1.04;if(this.deviceVoice)u.voice=this.deviceVoice;this.current={...item,utterance:u};const finish=()=>{if(gen!==this.generation)return;this.current=null;this.pump();};u.onend=finish;u.onerror=finish;this.synth.speak(u);}
 // Setningene spilles etter hverandre i Web Audio så snart de er pakket ut, med en liten pause mellom.
 speakNeural(item,gen){const ctx=this.context,job=this.neural.speak(item.text),cur={...item,job,sources:[],end:0,done:false,timer:0,since:Date.now()};this.current=cur;
  if(!this.voiceOut){this.voiceOut=ctx.createGain();this.voiceOut.gain.value=.95;this.voiceOut.connect(ctx.destination);}
  const live=()=>gen===this.generation&&this.current===cur;
  const finish=()=>{if(!live())return;clearTimeout(cur.timer);this.current=null;this.pump();};
  const check=()=>{if(cur.done&&ctx.currentTime>=cur.end-.03)finish();};
  // Vakthund: kommer det ingen setning på 8 sekunder (nettleseren kan ha stoppet utpakkingen), leser enhetens stemme
  // resten. Etter to slike stopp slås den nye stemmen av for denne økten. Tid med skjult side teller ikke.
  const stall=()=>{if(!live())return;if(document.hidden||this.hiddenAt>cur.since){cur.since=Date.now();cur.timer=setTimeout(stall,this.stallMs);return;}
   job.cancel();if(++this.stalls>=2)this.neural.fail('stalled');if(cur.sources.length){cur.done=true;check();cur.timer=setTimeout(finish,Math.max(0,cur.end-ctx.currentTime)*1000+700);}else{this.current=null;this.speakDevice(item,gen);}};
  cur.timer=setTimeout(stall,this.stallMs);
  job.onchunk=pcm=>{if(!live()||!pcm.length)return;const buf=ctx.createBuffer(1,pcm.length,this.neural.sampleRate);buf.getChannelData(0).set(pcm);const src=ctx.createBufferSource();src.buffer=buf;src.connect(this.voiceOut);
   const at=Math.max(ctx.currentTime+.02,cur.end+(cur.sources.length?SENTENCE_GAP:0));src.start(at);cur.end=at+buf.duration;src.onended=check;cur.sources.push(src);clearTimeout(cur.timer);cur.since=Date.now();cur.timer=setTimeout(stall,this.stallMs);};
  job.ondone=()=>{if(!live())return;this.stalls=0;cur.done=true;check();clearTimeout(cur.timer);cur.timer=setTimeout(finish,Math.max(0,cur.end-ctx.currentTime)*1000+700);};
  // Feiler den nye stemmen før noe er sagt, leser enhetens stemme det samme i stedet.
  job.onerror=()=>{if(!live())return;clearTimeout(cur.timer);if(cur.sources.length){cur.done=true;check();return;}this.current=null;this.speakDevice(item,gen);};}
}
