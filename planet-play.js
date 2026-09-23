/* Something fun on every world: short tap games that count up and cannot be lost. */
const play={def:null,body:null,kind:null,count:0,goal:0,done:false,doneTime:0,space:true,time:0,items:[],view:{hw:6,hh:4.5},center:[0,1,0]};
const NUMBER_WORDS=['null','én','to','tre','fire','fem','seks','sju','åtte','ni','ti'];
// A fixed camera that always fits a stage of w × h world units, in landscape and portrait alike.
function stage(w,h,look,bg,rise=.14){const aspect=scene.clientWidth/Math.max(1,scene.clientHeight),half=Math.max(h/2,w/2/aspect),dist=half*FOCAL,sway=state.reduced?0:Math.sin(play.time*.25)*.25;
 play.view={hw:half*aspect,hh:half};renderer.begin([look[0]+sway,look[1]+dist*rise,look[2]+dist],look,bg);}
// Ground for the worlds we can stand on: a wide, gently curved plain with darker patches.
const SPOTS=Array.from({length:16},(_,i)=>[Math.sin(i*7.13)*7.5,-7+((i*3.71)%10.5),.22+(i%4)*.16]);
function groundY(x,z){return -6+6*Math.sqrt(Math.max(0,1-(x/30)**2-((z+1)/20)**2));}
function surface(t,{sky,ground,dark,hills,stars=false}){const aspect=scene.clientWidth/Math.max(1,scene.clientHeight);stage(aspect<1?9:11,6.6,[0,1.1,0],sky,.32);if(stars)starScene(t);
 d('sphere',[0,-6,-1],[30,6,20],ground);for(const [x,z,r] of SPOTS)d('cylinder',[x,groundY(x,z)+.005,z],[r,.02,r*.8],dark);
 if(hills)for(const [x,s] of [[-11,5],[-3,6.5],[6,5.5],[14,6]])d('sphere',[x,groundY(x,-15)-.2,-15],[s,s*.14,1.6],hills);}
function parkedRocket(t,x,z){group([x,.36,z],[.7,.7,.7],[0,-.3,0],()=>rocket(t,false,0,false,false));}

function startPlay(){const p=state.location,def=playFor(p);if(state.mode!=='arrival'||!def)return;gameAudio.stopSpeech();resetFx();
 Object.assign(play,{def,body:p,kind:PLAY_KINDS[def.kind],count:0,goal:def.goal,done:false,doneTime:0,time:0,items:[],space:!['rover','snowman','hop'].includes(def.kind),center:[0,1,0]});
 state.mode='play';state.angle=0;play.kind.start();showConsole('play');$('play-title').textContent=`${def.icon} ${def.title}`;$('play-task').textContent=def.task;$('play-again').hidden=true;$('play-done').textContent='Tilbake';
 $('world-hint').hidden=true;$('scene-caption').hidden=true;title(p.parent?'MÅNELEK':'PLANETLEK',def.title,def.task,`${def.icon} ${p.name}`);renderPlayProgress();
 scene.setAttribute('aria-label',`${def.title} på ${p.name}. ${def.task}`);tone(520,.1);gameAudio.say(def.intro,{id:'fact-play'});}
function endPlay(){if(state.mode!=='play')return;gameAudio.stopSpeech();resetFx();showArrival();tone(300,.08);}
function renderPlayProgress(){const def=play.def,box=$('play-progress'),word=$('play-word'),letters=def.kind==='letters';word.hidden=!letters;box.hidden=letters;
 if(letters){word.replaceChildren();[...def.word].forEach((ch,i)=>{const s=document.createElement('span');s.className='slot'+(i<play.count?' done':i===play.count&&!play.done?' current':'');s.textContent=ch;word.append(s);});word.setAttribute('aria-label',`${def.word}. ${play.count} av ${def.word.length} bokstaver.`);return;}
 box.replaceChildren();for(let i=0;i<play.goal;i++){const s=document.createElement('span');s.className='play-dot'+(i<play.count?' got':'');s.textContent=def.icon;box.append(s);}box.setAttribute('aria-label',`${play.count} av ${play.goal}`);}
// One more caught, counted out loud in Norwegian. words=false keeps quiet, a string says something else.
function score(p,words){if(play.done)return;play.count++;burst(p,['#ffde71','#ffffff','#79e4e2','#ff9ed1'],16,3);renderPlayProgress();const said=words===false?'':words||NUMBER_WORDS[play.count]+'!';
 if(play.count>=play.goal)return finishPlay(said);if(said)gameAudio.say(said,{id:'letter-count'});}
function finishPlay(said){const p=play.body,first=!state.played.has(p.id);play.done=true;play.doneTime=0;state.played.add(p.id);saveProgress();renderPlayProgress();
 confetti(play.center,1.6,64);gameAudio.effect('fanfare');notify('⭐ Du klarte det, Sofia!');if(said)gameAudio.say(said,{id:'letter-count'});gameAudio.say(play.def.outro,{queue:true,id:'fact-play'});
 $('play-task').textContent=first&&!p.parent?`Du klarte det! ${p.name} får en gullstjerne i rommet ditt ⭐`:'Du klarte det! ⭐';$('play-again').hidden=false;$('play-done').textContent='Ferdig';
 title('HURRA, SOFIA!','Du klarte det!',play.def.title.includes(p.name)?play.def.title:`${play.def.title} · ${p.name}`,'⭐ '+p.name);}
function updatePlay(dt){play.time+=dt;if(play.done)play.doneTime+=dt;play.kind.update(dt);}
function playScene(t){play.kind.draw(t);}
function tapPlay(x,y){if(play.done){confetti(play.center,1.2,18);gameAudio.effect('sparkle');return;}play.kind.tap(x,y);}
function keyPlay(letter){return !play.done&&!!play.kind.key?.(letter);}
$('play-here').onclick=startPlay;$('play-done').onclick=endPlay;$('play-again').onclick=()=>{state.mode='arrival';startPlay();};
$('play-speak').onclick=()=>gameAudio.say(play.done?play.def.outro:play.def.intro,{force:true,id:'fact-play'});

// Each moon's ground carries its own look: Europa's cracks, Io's volcano spots, icy stripes on Enceladus and Triton.
const MARKS=Array.from({length:10},(_,i)=>({x:Math.sin(i*5.3)*6,z:-5.5+((i*2.9)%8),a:i*1.1,len:1.6+(i%3)*.9}));
function moonGround(p){for(const m of MARKS){const y=groundY(m.x,m.z)+.012;if(p.style==='cracks')d('box',[m.x,y,m.z],[m.len,.012,.035],'#a8714d',[0,m.a,0]);
 else if(p.style==='spots')d('cylinder',[m.x,y,m.z],[.3+(m.len-1.6)*.2,.015,.24],['#e0662c','#3b1e14','#fff1a0'][Math.round(m.a*3)%3]);
 else if(p.style==='stripes')d('box',[m.x,y,m.z],[m.len,.012,.06],'#8fbfdb',[0,.4+(m.a%.6),0]);
 else if(p.style==='haze')d('cylinder',[m.x,y,m.z],[.7,.012,.4],'#3d2a18');}}
const PUFF=[[0,0,.62,'#fff5dc'],[.55,-.1,.46,'#f7e2b5'],[-.55,-.1,.48,'#f7e2b5'],[.25,.35,.42,'#fffaf0'],[-.25,.3,.4,'#fffaf0']];
const SNOW=[{r:.55,at:[0,.5,0]},{r:.42,at:[0,1.28,0]},{r:.31,at:[0,1.9,0]},{kind:'eyes',at:[0,1.97,.27]},{kind:'nose',at:[0,1.88,.45]},{kind:'hat',at:[0,2.2,0]}];
const PLAY_KINDS={
 // Merkur: meteors rain down. Tapped ones turn to stardust; the rest leave new craters.
 meteors:{
  start(){play.craters=[];play.spawn=.5;play.core=[0,-4.4,-1];play.R=play.body.size*1.5;play.center=[0,0,0];},
  spawn(){const {hw,hh}=play.view,c=play.core,p=[rand(-hw*.8,hw*.8),hh+.8,rand(-.5,1)],aim=[c[0]+rand(-2.2,2.2),c[1]+play.R*.9,c[2]],way=sub(aim,p),sp=Math.hypot(...way)/rand(3.3,4.3);play.items.push({p,v:norm(way).map(v=>v*sp),spin:rand(0,6),size:rand(.32,.42)});},
  update(dt){play.spawn-=dt;if(!play.done&&play.spawn<=0&&play.items.length<3){this.spawn();play.spawn=rand(.9,1.6);}const c=play.core;
   for(const m of [...play.items]){for(let k=0;k<3;k++)m.p[k]+=m.v[k]*dt;m.spin+=dt*3;if(Math.hypot(...sub(m.p,c))<play.R+.15){play.items.splice(play.items.indexOf(m),1);play.craters.push({n:norm(sub(m.p,c)),size:rand(.22,.36)});if(play.craters.length>18)play.craters.shift();burst(m.p,['#ffb347','#ff7a3d','#fff1c1'],12,2.2,{mesh:'sphere',size:.12});gameAudio.effect('thud');}}},
  draw(t){stage(12,9,[0,0,0],'#0a0c1f');starScene(t);const c=play.core;planet(play.body,0,c,1.5,false);
   for(const cr of play.craters){d('sphere',c.map((v,i)=>v+cr.n[i]*(play.R-.24)),[cr.size*1.35,cr.size*1.35,cr.size*1.35],'#cfc6ba');d('sphere',c.map((v,i)=>v+cr.n[i]*(play.R-.1)),[cr.size,cr.size,cr.size],'#4a4540');}
   for(const m of play.items){const back=norm(m.v).map(v=>-v);for(let i=1;i<7;i++){const r=m.size*(1-i/8);d('sphere',m.p.map((v,k)=>v+back[k]*i*.28),[r,r,r],i<3?'#ffe08a':i<5?'#ff9a3d':'#e0552f',[],1);}d('sphere',m.p,[m.size,m.size*.85,m.size*.9],'#6b5b4d',[m.spin,m.spin*.7,0]);}},
  tap(x,y){const m=pickTarget(play.items,x,y,m=>m.p,m=>m.size*1.6);if(!m)return;play.items.splice(play.items.indexOf(m),1);burst(m.p,['#ffde71','#ffffff','#ffb347'],18,3.2);gameAudio.effect('pop');score(m.p);}},
 // Venus: puffy clouds drift across the planet. Tap to blow them away.
 clouds:{
  start(){play.core=[0,-.2,-3];play.center=[0,0,0];play.spawnT=0;for(let i=0;i<5;i++)this.spawn(true);},
  spawn(anywhere){const {hw,hh}=play.view;play.items.push({p:[anywhere?rand(-hw*.8,hw*.8):-hw-2,rand(-hh*.6,hh*.5),rand(.6,2)],vx:rand(.7,1.2),phase:rand(0,6),size:rand(.85,1.15)});},
  update(dt){const {hw}=play.view;for(const c of play.items){c.p[0]+=c.vx*dt;if(c.p[0]>hw+2.5)c.p[0]=-hw-2.5;}if(!play.done&&play.items.length<5&&(play.spawnT+=dt)>.8){play.spawnT=0;this.spawn(false);}},
  draw(t){stage(12,9,[0,0,0],'#120d1c');starScene(t);planet(play.body,t,play.core,1.3,false);for(const c of play.items){const y=c.p[1]+(state.reduced?0:Math.sin(t*.9+c.phase)*.15),s=c.size;for(const [dx,dy,r,col] of PUFF)d('sphere',[c.p[0]+dx*s,y+dy*s,c.p[2]+(dy>0?.05:0)],[r*s,r*s*.82,r*s*.8],col,[],.25);}},
  tap(x,y){const c=pickTarget(play.items,x,y,c=>c.p,c=>c.size*.9);if(!c)return;play.items.splice(play.items.indexOf(c),1);burst(c.p,['#fff4d6','#f6dca6','#ffffff'],16,2.4,{mesh:'sphere',size:.2,glow:.4,life:.7});gameAudio.swoosh(.45,.07);gameAudio.effect('pop');score(c.p);}},
 // Mars: a little rover drives around. Tapped stones hop up into its cargo bay.
 rover:{
  start(){play.a=0;play.cargo=0;play.spawnT=0;for(let i=0;i<3;i++)this.spawn();},
  spawn(){const lim=Math.min(4.4,play.view.hw*.8);let x=0,z=0;for(let i=0;i<24;i++){x=rand(-lim,lim);z=rand(-1.3,2.3);if(Math.hypot(x+3.4,z+1.4)>1.7&&Math.hypot(x+2.2,z+.5)>1&&!play.items.some(s=>Math.hypot(s.p[0]-x,s.p[2]-z)<1.3))break;}
   play.items.push({p:[x,groundY(x,z)+.13,z],flying:false,k:0,shine:rand(0,6),color:['#8c4a2f','#a0583a','#6e3a26'][Math.floor(rand(0,3))]});},
  at(){return [Math.cos(play.a)*2.9,0,Math.sin(play.a)*1.3+.3];},
  update(dt){play.a+=dt*(state.reduced?.18:.32);const r=this.at();play.center=[r[0],1,r[2]];
   for(const s of [...play.items]){if(!s.flying)continue;s.k=Math.min(1,s.k+dt/.8);const to=[r[0],.9,r[2]];s.p=s.from.map((v,i)=>v+(to[i]-v)*s.k+(i===1?Math.sin(s.k*Math.PI)*2.2:0));if(s.k>=1){play.items.splice(play.items.indexOf(s),1);play.cargo++;gameAudio.effect('thud');score(to);}}
   if(!play.done&&play.items.filter(s=>!s.flying).length<3&&(play.spawnT+=dt)>.9){play.spawnT=0;this.spawn();}},
  draw(t){surface(t,{sky:'#d8a27c',ground:'#b35c38',dark:'#8e4428',hills:'#9c4b2c'});d('sphere',[-8,8,-26],[.6,.6,.6],'#fff4e2',[],1);parkedRocket(t,-3.4,-1.4);group([-2.2,0,-.5],[.85,.85,.85],[0,.25,0],()=>astronaut(t));
   const r=this.at(),heading=Math.atan2(-Math.cos(play.a)*1.3,-Math.sin(play.a)*2.9);
   group([r[0],0,r[2]],[.62,.62,.62],[0,heading,0],()=>{d('box',[0,.62,0],[.85,.16,.5],'#e9e4d8');for(const x of [-.62,0,.62])for(const z of [-.58,.58])d('cylinder',[x,.25,z],[.24,.08,.24],'#3a3a42',[Math.PI/2,0,0]);d('box',[-.2,.82,0],[.62,.03,.62],'#2f4f8f');
    d('cylinder',[.55,1.05,-.2],[.04,.3,.04],'#cfcac0');d('box',[.62,1.42,-.2],[.16,.1,.15],'#e9e4d8');d('sphere',[.79,1.44,-.27],[.05,.05,.05],'#1b2a44');d('sphere',[.79,1.44,-.13],[.05,.05,.05],'#1b2a44');d('cylinder',[-.6,1.1,.35],[.015,.3,.015],'#cfcac0');d('sphere',[-.6,1.42,.35],[.05,.05,.05],'#ff6a4d',[],1);
    for(let i=0;i<play.cargo;i++)d('sphere',[-.45+(i%3)*.24,.93+Math.floor(i/3)*.14,-.12+(i%2)*.22],[.13,.1,.13],'#8c4a2f');});
   for(const s of play.items){d('sphere',s.p,[.28,.2,.26],s.color,[0,s.shine,0]);if(!s.flying){d('gem',[s.p[0],s.p[1]+.42+(state.reduced?0:Math.sin(t*3+s.shine)*.08),s.p[2]],[.1,.16,.1],'#fff6c4',[0,t*2,0],1);d('ringlet',[s.p[0],s.p[1]-.1,s.p[2]],[.46,1,.46],'#ffde71',[],1);}}
   // A dust devil wanders across the plain.
   if(!state.reduced){const dx=Math.sin(t*.08)*6,dz=-3.5,y0=groundY(dx,dz);for(let i=0;i<30;i++){const h=i*.065,a=t*5+i*1.9,rr=.06+h*.32,z=.035+h*.012;d('sphere',[dx+Math.cos(a)*rr,y0+h,dz+Math.sin(a)*rr],[z,z,z],i%2?'#e2b590':'#c98a62');}}},
  tap(x,y){const s=pickTarget(play.items.filter(s=>!s.flying),x,y,s=>s.p,()=>.45);if(!s)return;s.flying=true;s.k=0;s.from=[...s.p];gameAudio.effect('boing');}},
 // Jupiter: count the four big moons as they go round.
 moons:{
  start(){play.core=[0,0,-3];play.R=play.body.size*.95;play.center=[0,1,0];play.items=moonsOf('jupiter').map((m,i)=>({m,r:4.4+i*.85,a:i*1.9+.6,speed:.3-i*.045,size:[.5,.5,.62,.56][i],n:0,p:[0,0,0]}));},
  update(dt){for(const o of play.items){o.a+=dt*o.speed*(state.reduced?.5:1);o.p=[Math.cos(o.a)*o.r,.3+Math.sin(o.a)*o.r*.16,play.core[2]+Math.sin(o.a)*o.r*.55];}},
  // A moon behind Jupiter cannot be seen, so it cannot be tapped either.
  hidden(o){return o.p[2]<play.core[2]&&Math.hypot(o.p[0]-play.core[0],o.p[1]-play.core[1])<play.R+o.size*.5;},
  draw(t){stage(14.5,9,[0,0,-1],'#07091c');starScene(t);planet(play.body,t,play.core,.95,false);
   for(const o of play.items){renderer.draw('globe',o.p,[o.size,o.size,o.size],'#ffffff',[0,t*.2,0],0,0,PlanetArt.get(o.m.id));
    if(o.n){d('ringlet',o.p,[o.size*1.5,1,o.size*1.5],'#ffcf4a',[Math.PI/2,0,0],1);renderer.decal(letterTile(String(o.n),'#ffb43d'),[o.p[0],o.p[1]+o.size+.55,o.p[2]],[.8,.8]);}
    else if(!state.reduced&&!this.hidden(o))d('ringlet',o.p,[o.size*1.35,1,o.size*1.35],'#ffffff',[Math.PI/2,0,0],.3+.3*Math.sin(t*4));}},
  tap(x,y){const o=pickTarget(play.items.filter(o=>!this.hidden(o)),x,y,o=>o.p,o=>o.size*1.2);if(!o)return;if(o.n){gameAudio.effect('pop');gameAudio.say(o.m.name+'!',{id:'letter-moon'});return;}
   o.n=play.count+1;gameAudio.note(o.n-1);score(o.p,`${NUMBER_WORDS[o.n]}! ${o.m.name}!`);}},
 // Saturn: ice glitters in the rings. Catch the sparkly pieces.
 ice:{
  start(){play.core=[0,-.3,-2.5];play.scale=1.15;play.rot=[.42,0,.28];play.center=[0,1,0];play.spawnT=0;play.items=Array.from({length:renderer.software?24:48},()=>({a:rand(0,Math.PI*2),rr:rand(1.28,2.15),y:rand(-.03,.03),size:rand(.05,.12),sparkle:false,glint:rand(0,6),p:null}));},
  update(dt){const m=M.model(play.core,[play.scale,play.scale,play.scale],play.rot),s=play.body.size;
   for(const o of play.items){o.a+=dt*.16/o.rr;const l=[Math.cos(o.a)*o.rr*s,o.y*s,Math.sin(o.a)*o.rr*s];o.p=[0,1,2].map(i=>m[i]*l[0]+m[4+i]*l[1]+m[8+i]*l[2]+m[12+i]);if(o.sparkle&&o.p[2]<play.core[2]-.5)o.sparkle=false;}
   if(!play.done&&play.items.filter(o=>o.sparkle).length<3&&(play.spawnT+=dt)>.5){play.spawnT=0;const front=play.items.filter(o=>!o.sparkle&&o.p[2]>play.core[2]+1);if(front.length)front[Math.floor(rand(0,front.length))].sparkle=true;}},
  draw(t){stage(14,8.5,[0,0,-1],'#080a1c');starScene(t);planet(play.body,t,play.core,play.scale,false,play.rot);
   for(const o of play.items){if(!o.p)continue;if(o.sparkle){const k=1+.25*Math.sin(t*6+o.glint);d('gem',o.p,[.3*k,.44*k,.3*k],'#e8fbff',[0,t*2,0],1);d('star',[o.p[0],o.p[1],o.p[2]+.05],[.34*k,.34*k,.34*k],'#bdf3ff',[0,0,t],1);d('ringlet',o.p,[.6*k,1,.6*k],'#9fe8ff',[Math.PI/2,0,0],1);}else d('box',o.p,[o.size,o.size*.8,o.size],'#dfe6ea',[o.glint,o.a,0],.2);}},
  tap(x,y){const o=pickTarget(play.items.filter(o=>o.sparkle),x,y,o=>o.p,()=>.4);if(!o)return;o.sparkle=false;burst(o.p,['#e8fbff','#9fe8ff','#ffffff'],16,2.6);gameAudio.effect('sparkle');score(o.p);}},
 // Uranus: it may rain diamonds deep inside. Catch them as they fall; each one plays a note.
 diamonds:{
  start(){play.core=[0,-2.2,-4.5];play.center=[0,0,0];play.spawnT=0;},
  update(dt){const {hw,hh}=play.view;play.spawnT-=dt;if(!play.done&&play.spawnT<=0&&play.items.length<5){play.items.push({p:[rand(-hw*.8,hw*.8),hh+.7,rand(0,1.5)],vy:-rand(1.05,1.45),sway:rand(0,6),spin:rand(0,6),color:['#e8fbff','#ffc2e6','#c8b6ff','#b6f5ff','#fff3b0'][Math.floor(rand(0,5))]});play.spawnT=rand(.7,1.15);}
   for(const g of play.items){g.p[1]+=g.vy*dt;g.p[0]+=Math.sin(play.time*1.3+g.sway)*dt*.35;g.spin+=dt*2;}play.items=play.items.filter(g=>g.p[1]>-hh-1.2);},
  draw(t){stage(12,9,[0,0,0],'#060c1e');starScene(t);planet(play.body,t,play.core,1.2,false);
   for(const g of play.items){d('gem',g.p,[.34,.48,.34],g.color,[0,g.spin,0],.55);if(!state.reduced){const k=.5+.5*Math.sin(t*5+g.sway),at=[g.p[0]+.18,g.p[1]+.3,g.p[2]+.3];d('box',at,[.18*k,.02,.02],'#ffffff',[],1);d('box',at,[.02,.18*k,.02],'#ffffff',[],1);}}},
  tap(x,y){const g=pickTarget(play.items,x,y,g=>g.p,()=>.5);if(!g)return;play.items.splice(play.items.indexOf(g),1);burst(g.p,['#ff6389','#ffe36b','#64dce9','#c28eff','#ffffff'],18,3);gameAudio.note(play.count);score(g.p);}},
 // Neptun: the wind has blown the letters away. Catch N-E-P-T-U-N in order.
 letters:{
  start(){const word=play.def.word,colors=['#ff76ba','#ffb347','#3fc6c3','#9b7bff','#58c26b','#f2b200','#ff7f50'],set=[...new Set(word),...['A','O'].slice(0,renderer.software?1:2)];play.core=[0,-.6,-5];play.center=[0,0,0];
   play.items=set.map((ch,i)=>({ch,color:colors[i%colors.length],x0:rand(0,18),speed:rand(.9,1.3),phase:rand(0,6),shake:0,p:[0,0,0]})).sort(()=>Math.random()-.5);play.items.forEach((o,i)=>o.row=i);
   play.streaks=Array.from({length:18},()=>({x0:rand(0,30),y:rand(-4,4),z:rand(-2,1.5),len:rand(.8,2),speed:rand(5,8)}));$('play-task').textContent='Finn '+word[0]+'!';},
  update(dt){const {hw,hh}=play.view,span=hw*2+3,n=play.items.length;for(const o of play.items){o.shake=Math.max(0,o.shake-dt);const x=-hw-1.5+((o.x0+play.time*o.speed*(state.reduced?.6:1))%span);o.p=[x+Math.sin(o.shake*40)*o.shake*.5,(-.62+1.24*(o.row+.5)/n)*hh*.9+Math.sin(play.time*1.2+o.phase)*.3,1+(o.row%3)*.35];}},
  draw(t){stage(13,8.4,[0,0,0],'#050b22');starScene(t);planet(play.body,t,play.core,1.05,false);const {hw}=play.view,span=hw*2+6;
   if(!state.reduced)for(const s of play.streaks)d('box',[-hw-3+((s.x0+t*s.speed)%span),s.y,s.z],[s.len,.018,.018],'#bfe3ff',[],.8);
   const next=play.def.word[play.count];for(const o of play.items){if(state.hints&&!play.done&&o.ch===next)d('ringlet',[o.p[0],o.p[1],o.p[2]-.05],[.74,1,.74],'#ffde71',[Math.PI/2,0,0],1);renderer.decal(letterTile(o.ch,o.color),o.p,[1.25,1.25]);}},
  tap(x,y){const o=pickTarget(play.items,x,y,o=>o.p,()=>.62);if(o)this.pick(o);},
  key(ch){const o=play.items.find(o=>o.ch===ch);if(o)this.pick(o);return !!o;},
  pick(o){const word=play.def.word,next=word[play.count];
   if(o.ch===next){gameAudio.letter(o.ch,play.count+1===play.goal?word:'');burst(o.p,[o.color,'#ffffff','#ffde71'],16,3);score(o.p,false);if(!play.done)$('play-task').textContent='Bra! Finn '+word[play.count]+'!';return;}
   o.shake=.4;gameAudio.effect('oops');gameAudio.say(`Det er ${LETTER_NAMES[o.ch]||o.ch}. Finn ${LETTER_NAMES[next]||next}!`,{id:'letter-hint'});$('play-task').textContent=`Det er ${o.ch}. Finn ${next}!`;}},
 // Pluto: build a snowman, one glittering piece at a time.
 snowman:{
  start(){play.base=[1.3,0,.4];play.center=[1.3,1.4,.4];play.flakes=Array.from({length:renderer.software?14:40},()=>({p:[rand(-7,7),rand(0,8),rand(-4,3)],v:rand(.25,.5)}));this.spawn();},
  spawn(){const i=play.count;if(i>=SNOW.length)return;const lim=Math.min(4.2,play.view.hw*.8);let x=0,z=0;for(let k=0;k<24;k++){x=rand(-lim,lim);z=rand(-1,2.2);if(Math.hypot(x-play.base[0],z-play.base[2])>1.6&&Math.hypot(x+3.4,z+1.4)>1.6&&Math.hypot(x+.4,z-.9)>1)break;}
   const part=SNOW[i],lift=part.r?part.r:part.kind==='hat'?.1:.06;play.items=[{i,p:[x,groundY(x,z)+lift,z],flying:false,k:0}];},
  update(dt){for(const f of play.flakes){f.p[1]-=f.v*dt;if(f.p[1]<0)f.p[1]+=8;}const it=play.items[0];
   if(it?.flying){it.k=Math.min(1,it.k+dt/.75);const to=play.base.map((v,i)=>v+SNOW[it.i].at[i]);it.p=it.from.map((v,i)=>v+(to[i]-v)*it.k+(i===1?Math.sin(it.k*Math.PI)*1.6:0));if(it.k>=1){play.items=[];gameAudio.effect('thud');score(to);if(!play.done)this.spawn();}}},
  part(i,p,t,lying){const s=SNOW[i];if(s.r){d('sphere',p,[s.r,s.r*.95,s.r],'#f4f7fb');if(i===1&&!lying)for(const y of [.12,-.12])d('sphere',[p[0],p[1]+y,p[2]+s.r*.96],[.045,.045,.03],'#2b2b33');return;}
   if(s.kind==='eyes'){for(const x of [-.1,.1])d('sphere',[p[0]+x,p[1],p[2]],[.05,.05,.04],'#1d1d25');return;}
   if(s.kind==='nose'){d('cone',p,[.06,.2,.06],'#ff8a2a',lying?[0,0,Math.PI/2]:[Math.PI/2,0,0]);return;}
   d('cylinder',p,[.36,.03,.36],'#20222c');d('cylinder',[p[0],p[1]+.2,p[2]],[.23,.2,.23],'#20222c');d('cylinder',[p[0],p[1]+.07,p[2]],[.235,.045,.235],'#e0445a');},
  draw(t){surface(t,{sky:'#070a1c',ground:'#d9cdbf',dark:'#b8a594',stars:true});
   // Pluto's bright heart on the plain, the big moon Charon overhead and a far-away Sun.
   group([2.4,groundY(2.4,-3.8)+.02,-3.8],[1.7,1,1.7],[0,0,0],()=>{for(const x of [-.424,.424])d('cylinder',[x,0,-.424],[.6,.02,.6],'#f7f2ea');d('box',[0,.001,0],[.6,.02,.6],'#f7f2ea',[0,Math.PI/4,0]);});
   d('cylinder',[-4.8,groundY(-4.8,-3.6)+.005,-3.6],[2.2,.02,.9],'#7d4f40');renderer.draw('globe',[7,3.1,-24],[2.6,2.6,2.6],'#ffffff',[0,t*.02,0],0,0,PlanetArt.get('charon'));
   d('sphere',[-2,4.2,-30],[.3,.3,.3],'#fffbe8',[],1);d('box',[-2,4.2,-30],[.9,.03,.03],'#fffbe8',[],1);d('box',[-2,4.2,-30],[.03,.9,.03],'#fffbe8',[],1);
   parkedRocket(t,-3.6,-1.2);group([-.4,0,.9],[.85,.85,.85],[0,.4,0],()=>astronaut(t));
   for(let i=0;i<play.count;i++)this.part(i,play.base.map((v,k)=>v+SNOW[i].at[k]),t,false);
   if(play.done){for(const side of [-1,1])d('box',[play.base[0]+side*.62,1.45,play.base[2]],[.36,.03,.03],'#6b4a33',[0,0,side*(.5+(state.reduced?0:.15*Math.sin(t*3)))]);}
   const it=play.items[0];if(it){this.part(it.i,[it.p[0],it.p[1]+(it.flying||state.reduced?0:Math.abs(Math.sin(t*3))*.15),it.p[2]],t,!it.flying);if(!it.flying){d('ringlet',[it.p[0],groundY(it.p[0],it.p[2])+.03,it.p[2]],[.7,1,.7],'#79e4e2',[],1);d('gem',[it.p[0],it.p[1]+.75,it.p[2]],[.1,.16,.1],'#ffffff',[0,t*2,0],1);}}
   for(const f of play.flakes)d('sphere',f.p,[.035,.035,.035],'#ffffff',[],1);},
  tap(x,y){const it=play.items[0];if(!it||it.flying)return;if(!pickTarget([it],x,y,o=>o.p,()=>.6))return;it.flying=true;it.k=0;it.from=[...it.p];gameAudio.effect('boing');}},
 // Every moon: weak gravity, so Sofia can leap all the way up to the stars.
 hop:{
  start(){play.sofia={x:0,y:0,x0:0,x1:0,k:1,peak:1,target:null};play.queued=null;play.spawnT=0;play.flag=0;play.center=[0,1.5,0];for(let i=0;i<3;i++)this.spawn();},
  spawn(){const lim=Math.min(4.2,play.view.hw*.78);let x=0;for(let k=0;k<24;k++){x=rand(-lim,lim);if(Math.abs(x-play.sofia.x)>1&&Math.abs(x+3.4)>.8&&!play.items.some(s=>Math.abs(s.p[0]-x)<1.3))break;}play.items.push({p:[x,rand(2.5,3.6),rand(-.3,.4)],phase:rand(0,6)});},
  jump(star){const s=play.sofia;s.x0=s.x;s.x1=star.p[0];s.k=0;s.peak=Math.max(.9,star.p[1]-1.45);s.target=star;gameAudio.effect('boing');},
  update(dt){const s=play.sofia;for(const st of play.items)if(st!==s.target)st.p[1]+=Math.sin(play.time*1.5+st.phase)*dt*.12;
   if(s.k<1){s.k=Math.min(1,s.k+dt/1.7);s.x=s.x0+(s.x1-s.x0)*s.k;s.y=4*s.peak*s.k*(1-s.k);
    if(s.target&&s.k>=.5){const st=s.target;s.target=null;play.items.splice(play.items.indexOf(st),1);gameAudio.effect('sparkle');score(st.p);}
    if(s.k>=1){s.y=0;burst([s.x,.1,.2],['#c9c4bb','#e8e4dc'],10,1.2,{mesh:'sphere',size:.12,glow:.3,life:.9});const q=play.queued;play.queued=null;if(q&&play.items.includes(q)&&!play.done)this.jump(q);}}
   if(!play.done&&play.items.length<3&&(play.spawnT+=dt)>.8){play.spawnT=0;this.spawn();}if(play.done)play.flag=Math.min(1,play.flag+dt*.8);play.center=[s.x,1.5,.2];},
  draw(t){const p=play.body;surface(t,{sky:'#04060f',ground:shade(p.color,.9),dark:shade(p.color,.66),stars:true});planet(parentOf(p),t,[6.5,2.9,-24],1.3,false);moonGround(p);parkedRocket(t,-3.4,-1.5);
   const s=play.sofia,flying=s.k<1;group([s.x,s.y,.2],[.9,.9,.9],[0,flying?(s.x1>s.x0?.5:-.5):0,0],()=>astronaut(t,flying?1:0));
   for(const st of play.items){d('star',st.p,[.36,.36,.36],'#ffd84a',[0,state.reduced?0:Math.sin(t*2+st.phase)*.6,0],.7);if(!state.reduced)d('ringlet',st.p,[.55+.08*Math.sin(t*4+st.phase),1,.55],'#fff3b0',[Math.PI/2,0,0],1);}
   if(play.flag>0){const top=2.2*play.flag;d('cylinder',[-2.2,top/2,-.4],[.035,top/2,.035],'#dcdcdc');d('box',[-1.72,top-.3,-.4],[.46,.28,.02],'#ff76ba',[0,0,state.reduced?0:Math.sin(t*2)*.04]);renderer.decal(sofiaGraffiti,[-1.72,top-.3,-.37],[.86,.43]);}},
  tap(x,y){const st=pickTarget(play.items,x,y,s=>s.p,()=>.5);if(!st||st===play.sofia.target)return;if(play.sofia.k<1)play.queued=st;else this.jump(st);}}
};
