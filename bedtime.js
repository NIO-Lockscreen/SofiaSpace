/* Bedtime in Sofia's room: tap the bed and she walks over, climbs in under the blanket and falls asleep.
   Z's float up from the pillow, and a dream bubble swells over the bed with planets and comets in it. Tap again to wake her. */
const sleep={on:false,k:0,dream:0,lastTap:-9,cometHit:-1,targets:[],eye:[0,8,10]};
// Where she stands in the room, where she stops by the bed, where she lies (feet towards the room, head on the pillow)
// and where the dream hangs, over the bed in front of the back wall.
const BED={idle:[1.7,0,2.05],side:[1.5,0,-.6],lying:[3.05,.93,-.66],tilt:-1.32,bubble:[2.05,3.1,-1.5]};
BED.head=[BED.lying[0],BED.lying[1]+1.035*Math.cos(BED.tilt),BED.lying[2]+1.035*Math.sin(BED.tilt)];
const bedEase=k=>k*k*(3-2*k),bedPop=k=>k<=0?0:1+2.70158*(k-1)**3+1.70158*(k-1)**2;
function mixHex(a,b,k){const x=rgb(a),y=rgb(b);return '#'+x.map((v,i)=>Math.round((v+(y[i]-v)*k)*255).toString(16).padStart(2,'0')).join('');}
function sleepText(){return 'Sofia sover og drømmer om planeter og kometer. Trykk på en planet i drømmen, eller på senga for å vekke henne.';}
function renderBedConsole(){$('wake-up').hidden=!sleep.on;$('open-quiz').hidden=sleep.on;$('inside-progress').textContent=sleep.on?sleepText():insideProgress();}
// Leaving the room, starting the planet game or coming back in always finds her awake and standing.
function resetSleep(){Object.assign(sleep,{on:false,k:0,dream:0,cometHit:-1,targets:[]});$('app').classList.remove('sleeping');renderBedConsole();}
function goToBed(){if(state.mode!=='inside'||sleep.on)return;Object.assign(sleep,{on:true,lastTap:state.clock,cometHit:-1});$('app').classList.add('sleeping');renderBedConsole();
 title('GOD NATT, SOFIA','Sofia sover','Hun drømmer om planeter og kometer.','💤 Sov godt');
 scene.setAttribute('aria-label','Sofia ligger i senga og sover. Over senga svever en drømmeboble med planeter og kometer.');
 gameAudio.effect('lullaby');gameAudio.say('God natt, Sofia! Sov godt, og drøm om planeter og kometer.',{id:'sleep'});}
function wakeUp(){if(!sleep.on)return;if(sleep.dream>1.5)burst(BED.bubble,['#ece6ff','#ffde71','#79e4e2','#ffffff'],22,3);
 Object.assign(sleep,{on:false,dream:0,lastTap:state.clock,targets:[]});$('app').classList.remove('sleeping');renderBedConsole();insideTitle();
 gameAudio.effect('sparkle');gameAudio.say('God morgen, Sofia! Nå er du uthvilt og klar for nye eventyr.',{id:'sleep'});}
// Going to bed takes about two and a half seconds, getting up a little less. The dream starts once she lies still.
function updateSleep(dt){if(sleep.k!==(sleep.on?1:0))sleep.k=sleep.on?Math.min(1,sleep.k+dt/2.6):Math.max(0,sleep.k-dt/1.8);if(sleep.on&&sleep.k===1)sleep.dream+=dt;}

// The camera glides in to the bed and the dream; dragging still turns it a little. Upright screens centre the bed,
// wide ones leave the top left to the title, and very wide, low ones come closer.
function bedCamera(eye,at,a,aspect){const k=bedEase(sleep.k);if(k>0){const look=[aspect<1.1?2.45:2.05,2.45,-1.2],dist=Math.max(aspect>2?6.4:8.4,2.45/(.354*aspect)),x=-.42,z=1,n=Math.hypot(x,.3,z),dir=[(x*Math.cos(a)+z*Math.sin(a))/n,.3/n,(z*Math.cos(a)-x*Math.sin(a))/n];
 for(let i=0;i<3;i++){eye[i]+=(look[i]+dir[i]*dist-eye[i])*k;at[i]+=(look[i]-at[i])*k;}}sleep.eye=eye;}
// Sofia herself: standing in the room, walking to the bed, hopping in, lying under the blanket with her eyes shut.
function sleeper(t){const k=sleep.k,[i,b,l]=[BED.idle,BED.side,BED.lying],idle=-.34+(state.reduced?0:Math.sin(t*.6)*.1);
 if(k===0){group(i,[.95,.95,.95],[0,idle,0],()=>character(t));return;}
 // On the way to bed she faces the bed; getting up she faces back into the room.
 const walkYaw=sleep.on?Math.atan2(b[0]-i[0],b[2]-i[2]):Math.atan2(i[0]-b[0],i[2]-b[2]);let pos,rot;
 if(k<.45){const w=bedEase(k/.45),steps=w*Math.PI*7,sway=state.reduced?0:Math.sin(steps);pos=[i[0]+(b[0]-i[0])*w,state.reduced?0:Math.abs(sway)*.07,i[2]+(b[2]-i[2])*w];rot=[0,idle+(walkYaw-idle)*bedEase(Math.min(1,w*4)),sway*.1];}
 else if(k<.8){const c=bedEase((k-.45)/.35);pos=[b[0]+(l[0]-b[0])*c,b[1]+(l[1]-b[1])*c+Math.sin(c*Math.PI)*.5,b[2]+(l[2]-b[2])*c];rot=[BED.tilt*c,walkYaw*(1-c),0];}
 else{pos=l;rot=[BED.tilt,0,0];}
 group(pos,[.95,.95,.95],rot,()=>character(t,sleep.on&&k>=.8));}
// The blanket lies at the foot end by day and is pulled up to her chin at night, rising and falling as she breathes.
function bedBlanket(t){const c=bedEase(Math.max(0,(sleep.k-.75)/.25)),breathe=c&&!state.reduced?Math.sin(t*1.5)*.012*c:0,z0=-.6-.7*c,top=.95+.25*c+breathe;
 d('box',[3.05,(.73+top)/2,(z0+1.3)/2],[1.05,(top-.73)/2,(1.3-z0)/2],'#79e4e2');if(c>0)d('box',[3.05,top-.03,z0+.06],[1.07,.05*c,.09],'#f5efe2');}
// Night in the window: dark blue glass, a crescent moon and a few stars.
function bedWindow(t){const n=bedEase(sleep.k);d('box',[-4.24,2.25,1.35],[.04,.72,.94],n?mixHex('#bfe4ef','#1c2858',n):'#bfe4ef',[],.55);if(n<.05)return;
 d('sphere',[-4.205,2.62,1.78],[.015,.15*n,.15*n],'#fff3c4',[],1);d('sphere',[-4.195,2.67,1.85],[.015,.13*n,.13*n],'#1c2858',[],.55);
 for(const [y,z,s]of [[2.82,.72,.05],[2.42,.62,.035],[1.84,.98,.04],[1.76,1.98,.03],[2.05,1.62,.045]])d('star',[-4.198,y,z],[s*n,s*n,s*n],'#fff1b8',[0,Math.PI/2,0],(state.reduced?.8:.6+.4*Math.sin(t*2+y*9))*n);}

// Z's float up from the pillow and fade, drawn as soft letters that always face the camera.
const ZLEVELS=5,zTiles=[];
function zTile(level){if(zTiles[level])return zTiles[level];const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');g.globalAlpha=(level+1)/ZLEVELS;
 g.font='900 52px "Arial Black",system-ui,sans-serif';g.textAlign='center';g.textBaseline='middle';g.lineJoin='round';g.lineWidth=8;g.strokeStyle='#3b3480';g.strokeText('Z',32,35);g.fillStyle='#ece6ff';g.fillText('Z',32,35);return zTiles[level]=c;}
function zzz(t){const z=sleep.dream-.3,h=BED.head;if(z<=0)return;const yaw=Math.atan2(sleep.eye[0]-h[0],sleep.eye[2]-h[2]);
 for(let i=0;i<3;i++){if(z*.42<i/3)continue;const f=(z*.42+1-i/3)%1,alpha=Math.min(1,f/.15,(1-f)/.35),size=.16+f*.32;if(alpha<=0)continue;
  renderer.decal(zTile(Math.max(0,Math.min(ZLEVELS-1,Math.ceil(alpha*ZLEVELS)-1))),[h[0]+.2+f*.55+(state.reduced?0:Math.sin(f*7+i)*.1),h[1]+.35+f*1.45,h[2]+.3],[size,size],[0,yaw,state.reduced?0:Math.sin(f*5+i)*.25]);}}

// The dream: three puffs rise from her head, then a bubble of night sky swells over the bed. Planets drift in it, one after another,
// and a comet streaks across now and then. The duck from the car game flies through too once she has it. Everything in it can be tapped.
const DREAM_PLANETS=BODIES.filter(p=>p.id!=='sun'),DREAM_STARS=Array.from({length:10},(_,i)=>[Math.sin(i*5.3)*.78,Math.cos(i*3.7)*.5,.025+(i%3)*.012]);
function dreamBubble(t){const g0=sleep.dream,B=BED.bubble,h=BED.head;sleep.targets=[];if(g0<=0)return;
 for(const [i,[f,r]]of [[.2,.07],[.45,.11],[.7,.15]].entries()){const show=Math.min(1,Math.max(0,(g0-i*.25)/.3)),s=r*bedPop(show);
  if(s>0)d('sphere',[h[0]+(B[0]+.5-h[0])*f,h[1]+.3+(B[1]-.85-h[1]-.3)*f,h[2]+(B[2]-h[2])*f],[s,s,s],'#ece6ff',[],.4);}
 const grow=bedPop(Math.min(1,Math.max(0,(g0-.7)/.8)));if(grow<=0)return;
 const yaw=Math.atan2(sleep.eye[0]-B[0],sleep.eye[2]-B[2]),cos=Math.cos(yaw),sin=Math.sin(yaw),world=([x,y,z])=>[B[0]+(x*cos+z*sin)*grow,B[1]+y*grow,B[2]+(z*cos-x*sin)*grow];
 group(B,[grow,grow,grow],[0,yaw,0],()=>{
  d('sphere',[0,0,-.08],[1.08,.74,.06],'#1b2152',[],.55);
  for(let i=0;i<14;i++){const a=i/14*Math.PI*2,r=.24+.07*Math.sin(i*2.7)+(state.reduced?0:.025*Math.sin(t*1.3+i));d('sphere',[Math.cos(a)*1.08,Math.sin(a)*.74,-.03],[r,r,r*.6],i%2?'#ece6ff':'#ddd5ff',[],.4);}
  for(const [i,[x,y,s]]of DREAM_STARS.entries()){const k=s*(state.reduced?1:.7+.3*Math.sin(t*3+i*1.9));d('star',[x,y,.02],[k,k,k],'#fff1b8',[0,0,i],1);}
  // Three planets at a time; each slot swaps to the next planet every seven seconds with a little pop.
  for(let j=0;j<3;j++){const time=g0+j*2.33,cycle=Math.floor(time/7),f=(time%7)/7,p=DREAM_PLANETS[(cycle*3+j)%DREAM_PLANETS.length],pop=bedPop(Math.min(1,f/.1))*bedEase(Math.min(1,(1-f)/.1));
   const pos=[[-.5,.14],[.06,-.22],[.55,.16]][j],at=[pos[0]+(state.reduced?0:Math.sin(t*.4+j*2)*.08),pos[1]+(state.reduced?0:Math.cos(t*.5+j)*.05),.1],s=(.15+(p.size-2)*.05)*pop;if(s<=.005)continue;
   renderer.draw('globe',at,[s,s,s],'#ffffff',[.3,(state.reduced?0:t*.5)+j,0],0,0,PlanetArt.get(p.id));
   for(const band of PlanetArt.rings(p.id))d('ringlet',at,[s*band.r,1,s*band.r],band.color,[.5,0,p.id==='uranus'?1.35:.32],.35);
   sleep.targets.push({p:world(at),r:s*grow*1.3,body:p});}
  // A comet every few seconds, across and down, from either side. Only the part inside the bubble shows.
  const cycle=Math.floor(g0/3.2),f=(g0%3.2)/1.6;if(f<1&&cycle!==sleep.cometHit){const dir=cycle%2?1:-1,y0=.5-(cycle%3)*.08,head=[-1.25*dir+2.5*dir*f,y0-.8*f,.14],tail=['#c9f6ff','#9fe3ff','#7ec8ff','#8aa6ff'],inside=([x,y])=>(x/.98)**2+(y/.66)**2<1;
   for(let i=8;i>0;i--){const p=[head[0]-dir*i*.07,head[1]+i*.022,.13],r=.06*(1-i/10);if(inside(p))d('sphere',p,[r,r,r],tail[i%4],[],1);}
   if(inside(head)){d('sphere',head,[.065,.065,.065],'#f2fdff',[],1);sleep.targets.push({p:world(head),r:.18*grow,comet:cycle});}}
  if(rewards.duck){const f=(g0%11)/5.5;if(f<1){const x=-1.05+2.1*f,s=.15*bedEase(Math.max(0,Math.min(1,(1-Math.abs(x)/1.05)*3))),at=[x,-.12+Math.sin(f*Math.PI*2)*.1,.12];
   if(s>.01){group(at,[s,s,s],[0,Math.PI/2,0],()=>duck(t,{fly:true,rider:true}));sleep.targets.push({p:world(at),r:.25*grow,duck:true});}}}
 });}
function bedScene(t){sleeper(t);if(sleep.on&&sleep.k===1){dreamBubble(t);zzz(t);}else sleep.targets=[];}
// Taps in the room: on the bed to sleep and wake, and on the planets, comets and duck in the dream.
function tapInside(x,y){if(state.clock-sleep.lastTap<.6)return true;
 const hit=sleep.targets.length?pickTarget(sleep.targets,x,y,o=>o.p,o=>o.r,34):null;
 if(hit){burst(hit.p,['#ffde71','#ffffff','#79e4e2','#ece6ff'],12,1.6,{size:.06});
  if(hit.comet!==undefined){sleep.cometHit=hit.comet;gameAudio.effect('sparkle');speak('En komet!');}else if(hit.duck){gameAudio.effect('quack');speak('Kvakk kvakk!');}else{gameAudio.effect('pop');speak(hit.body.name);}return true;}
 if(pickTarget([[3.05,.9,-1.6],[3.05,.9,-.5],[3.05,.9,.6]],x,y,p=>p,()=>.75)){if(sleep.on)wakeUp();else goToBed();return true;}
 return false;}
$('wake-up').onclick=wakeUp;
