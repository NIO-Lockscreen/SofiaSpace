/* Bedtime in Sofia's room: tap the bed and she walks over, climbs in under the blanket and falls asleep.
   Z's float up from the pillow, and a dream bubble swells over the bed with planets and comets in it. Tap again to wake her.
   The first tap on the bed after the game opens is different: she jumps on the bed instead (see JUMP below). */
// jump: seconds into the jump on the bed (-1 when she is not jumping); jumped: she has had her jump since the game opened.
// pose: where she was drawn last; blend: the pose to glide away from after she changes her mind halfway; hop: where she flops into bed from.
const sleep={on:false,k:0,dream:0,lastTap:-9,cometHit:-1,targets:[],eye:[0,8,10],jump:-1,jumped:false,pose:null,blend:null,hop:null,view:0};
// Where she stands in the room, where she stops by the bed, where she lies (feet towards the room, head on the pillow)
// and where the dream hangs, over the bed in front of the back wall.
const BED={idle:[1.7,0,2.05],side:[1.5,0,-.6],lying:[3.05,.93,-.66],tilt:-1.32,bubble:[2.05,3.1,-1.5]};
BED.head=[BED.lying[0],BED.lying[1]+1.035*Math.cos(BED.tilt),BED.lying[2]+1.035*Math.sin(BED.tilt)];
const bedEase=k=>k*k*(3-2*k),bedPop=k=>k<=0?0:1+2.70158*(k-1)**3+1.70158*(k-1)**2,bedAngle=a=>Math.atan2(Math.sin(a),Math.cos(a));
// Jumping on the bed, once each time the game is opened: she walks over, climbs up and turns to the room, bounces seven times with her
// arms in the air (spinning round on the highest bounce), hops down and walks back. Times in seconds; each bounce presses the mattress
// down for the first part of it and is in the air for the rest. The next tap on the bed puts her to bed as usual.
const JUMP={stand:[3.05,.92,-.85],face:-.25,walk:1.17,climb:.55,period:.64,press:.22,heights:[.55,.7,.85,.7,.9,1.1,.6],spin:5,down:.5,back:1.05};
JUMP.bounce=JUMP.walk+JUMP.climb;JUMP.off=JUMP.bounce+JUMP.heights.length*JUMP.period;JUMP.home=JUMP.off+JUMP.down;JUMP.end=JUMP.home+JUMP.back;
function mixHex(a,b,k){const x=rgb(a),y=rgb(b);return '#'+x.map((v,i)=>Math.round((v+(y[i]-v)*k)*255).toString(16).padStart(2,'0')).join('');}
function sleepText(){return 'Sofia sover og drømmer om planeter og kometer. Trykk på en planet i drømmen, eller på senga for å vekke henne.';}
function renderBedConsole(){$('wake-up').hidden=!sleep.on;$('open-quiz').hidden=sleep.on;$('inside-progress').textContent=sleep.on?sleepText():sleep.jump>=0?'Sofia hopper i senga! Trykk på senga igjen, så legger hun seg og sover.':insideProgress();}
// Leaving the room, starting the planet game or coming back in always finds her awake and standing. Her jump stays used up.
function resetSleep(){Object.assign(sleep,{on:false,k:0,dream:0,cometHit:-1,targets:[],jump:-1,blend:null,hop:null,view:0});$('app').classList.remove('sleeping');renderBedConsole();}
function startJump(){if(state.mode!=='inside'||sleep.on||sleep.jump>=0)return;Object.assign(sleep,{jump:0,jumped:true,lastTap:state.clock});renderBedConsole();
 title('HOPP OG SPRETT','Sofia hopper i senga!','Trykk på senga igjen, så legger hun seg.','🤸 Hopp, hopp!');
 scene.setAttribute('aria-label','Sofia hopper i senga med armene i været. Trykk på senga igjen, så legger hun seg.');
 gameAudio.say('Hopp, hopp, hopp! Sofia hopper i senga!',{id:'sleep'});}
// The bed tapped again while she is still jumping: on the floor she carries on to bed from where she is, and on the bed she flops
// straight down under the blanket from where she is in the air.
function goToBed(){if(state.mode!=='inside'||sleep.on)return;let k=0;
 if(sleep.jump>=0){const s=sleep.jump,onBed=s>=JUMP.walk&&s<JUMP.home;k=onBed?.45:s<JUMP.walk?.45*s/JUMP.walk:.45*Math.max(0,1-(s-JUMP.home)/JUMP.back);
  if(sleep.pose){if(onBed)sleep.hop=sleep.pose;sleep.blend={...sleep.pose,at:state.clock};}sleep.jump=-1;}
 Object.assign(sleep,{on:true,k,lastTap:state.clock,cometHit:-1});$('app').classList.add('sleeping');renderBedConsole();
 title('GOD NATT, SOFIA','Sofia sover','Hun drømmer om planeter og kometer.','💤 Sov godt');
 scene.setAttribute('aria-label','Sofia ligger i senga og sover. Over senga svever en drømmeboble med planeter og kometer.');
 gameAudio.effect('lullaby');gameAudio.say('God natt, Sofia! Sov godt, og drøm om planeter og kometer.',{id:'sleep'});}
function wakeUp(){if(!sleep.on)return;if(sleep.dream>1.5)burst(BED.bubble,['#ece6ff','#ffde71','#79e4e2','#ffffff'],22,3);
 // She always gets up by the side of the bed, wherever she flopped in from; woken halfway, she glides over to the way out.
 if(sleep.pose)sleep.blend={...sleep.pose,at:state.clock};
 Object.assign(sleep,{on:false,dream:0,lastTap:state.clock,targets:[],hop:null});$('app').classList.remove('sleeping');renderBedConsole();insideTitle();
 gameAudio.effect('sparkle');gameAudio.say('God morgen, Sofia! Nå er du uthvilt og klar for nye eventyr.',{id:'sleep'});}
// Going to bed takes about two and a half seconds, getting up a little less. The dream starts once she lies still.
function updateSleep(dt){if(sleep.k!==(sleep.on?1:0))sleep.k=sleep.on?Math.min(1,sleep.k+dt/2.6):Math.max(0,sleep.k-dt/1.8);if(sleep.on&&sleep.k===1)sleep.dream+=dt;
 // While she jumps, the camera moves part of the way to the bed and back again.
 const view=sleep.jump>=0&&sleep.jump<JUMP.home?1:0;sleep.view+=(view-sleep.view)*Math.min(1,dt*2.2);if(Math.abs(sleep.view-view)<.002)sleep.view=view;
 if(sleep.jump<0)return;const was=sleep.jump,s=sleep.jump+=dt,past=x=>was<x&&s>=x;
 // A boing every time she presses the mattress, sparkles at the top of the spin, and a word when she climbs down.
 JUMP.heights.forEach((h,n)=>{if(past(JUMP.bounce+n*JUMP.period))gameAudio.effect('boing');});
 const top=JUMP.bounce+(JUMP.spin+JUMP.press+(1-JUMP.press)/2)*JUMP.period,u=JUMP.stand;
 if(past(top)){gameAudio.effect('sparkle');burst([u[0],u[1]+JUMP.heights[JUMP.spin]*(state.reduced?.6:1)+.8,u[2]],['#ffde71','#ff9ec4','#79e4e2','#ffffff'],16,1.8,{size:.06});}
 if(past(JUMP.off))gameAudio.say('Det var gøy! Trykk på senga igjen når du er trøtt, Sofia.',{id:'sleep'});
 if(s>=JUMP.end){sleep.jump=-1;renderBedConsole();insideTitle();}}

// The camera glides in to the bed and the dream; dragging still turns it a little. Upright screens centre the bed,
// wide ones leave the top left to the title, and very wide, low ones come closer.
function bedCamera(eye,at,a,aspect){const k=Math.max(bedEase(sleep.k),bedEase(sleep.view)*.4);if(k>0){const look=[aspect<1.1?2.45:2.05,2.45,-1.2],dist=Math.max(aspect>2?6.4:8.4,2.45/(.354*aspect)),x=-.42,z=1,n=Math.hypot(x,.3,z),dir=[(x*Math.cos(a)+z*Math.sin(a))/n,.3/n,(z*Math.cos(a)-x*Math.sin(a))/n];
 for(let i=0;i<3;i++){eye[i]+=(look[i]+dir[i]*dist-eye[i])*k;at[i]+=(look[i]-at[i])*k;}}sleep.eye=eye;}
// Sofia herself: standing in the room, walking to the bed, hopping in, lying under the blanket with her eyes shut, or jumping on the bed.
function sleeper(t){const k=sleep.k,[i,b,l]=[BED.idle,BED.side,BED.lying],idle=-.34+(state.reduced?0:Math.sin(t*.6)*.1);let pos,rot,pose='awake';
 if(k===0&&sleep.jump>=0)({pos,rot,pose}=jumpPose(sleep.jump,t));
 else if(k===0){pos=i;rot=[0,idle,0];}
 else{
 // On the way to bed she faces the bed; getting up she faces back into the room.
 const walkYaw=sleep.on?Math.atan2(b[0]-i[0],b[2]-i[2]):Math.atan2(i[0]-b[0],i[2]-b[2]);
 if(k<.45){const w=bedEase(k/.45),steps=w*Math.PI*7,sway=state.reduced?0:Math.sin(steps);pos=[i[0]+(b[0]-i[0])*w,state.reduced?0:Math.abs(sway)*.07,i[2]+(b[2]-i[2])*w];rot=[0,idle+(walkYaw-idle)*bedEase(Math.min(1,w*4)),sway*.1];}
 // Hopping in from the side of the bed, or flopping down from where she was jumping on it.
 else if(k<.8){const c=bedEase((k-.45)/.35),h=sleep.on&&sleep.hop,from=h?h.pos:b,yaw=h?bedAngle(h.rot[1]):walkYaw;pos=[from[0]+(l[0]-from[0])*c,from[1]+(l[1]-from[1])*c+Math.sin(c*Math.PI)*.5,from[2]+(l[2]-from[2])*c];rot=[BED.tilt*c,yaw*(1-c),0];}
 else{pos=l;rot=[BED.tilt,0,0];}
 if(sleep.on&&k>=.8)pose='asleep';}
 // After a change of mind halfway she glides from where she was over a third of a second, instead of jumping there.
 const f=sleep.blend;if(f){const e=bedEase(Math.min(1,(state.clock-f.at)/.3));if(e<1){pos=pos.map((v,j)=>f.pos[j]+(v-f.pos[j])*e);rot=rot.map((v,j)=>f.rot[j]+bedAngle(v-f.rot[j])*e);}else sleep.blend=null;}
 sleep.pose={pos,rot};group(pos,[.95,.95,.95],rot,()=>character(t,pose==='asleep',pose==='cheer'));}
// How far the mattress is pressed down (0 to .22 of its thickness) as she lands on it jumping.
const jumpPress=f=>f<JUMP.press?Math.sin(f/JUMP.press*Math.PI)*.22:0;
function bedSquash(){const s=sleep.jump-JUMP.bounce;return sleep.k>0||s<0||s>=JUMP.off-JUMP.bounce?0:jumpPress(s/JUMP.period%1);}
// Draws the top of the bed squashed towards the bed frame (y .61) while it is pressed down.
function bedTop(draw){const q=bedSquash();if(q<=0)return draw();group([0,.61,0],[1,1-q,1],[0,0,0],()=>group([0,-.61,0],[1,1,1],[0,0,0],draw));}
// Where she is s seconds into her jump on the bed, which way she faces, and whether her arms are up ('cheer').
function jumpPose(s,t){const [i,b,u]=[BED.idle,BED.side,JUMP.stand],idle=-.34+(state.reduced?0:Math.sin(t*.6)*.1),toBed=Math.atan2(b[0]-i[0],b[2]-i[2]),toRoom=Math.atan2(i[0]-b[0],i[2]-b[2]),
 arc=(p,q,c,h)=>[p[0]+(q[0]-p[0])*c,p[1]+(q[1]-p[1])*c+Math.sin(c*Math.PI)*h,p[2]+(q[2]-p[2])*c],
 // Walking there and back is the same walk as going to bed and getting up: w is how far she is from her spot towards the bed.
 walk=(w,yaw)=>{const sway=state.reduced?0:Math.sin(w*Math.PI*7);return {pos:[i[0]+(b[0]-i[0])*w,state.reduced?0:Math.abs(sway)*.07,i[2]+(b[2]-i[2])*w],rot:[0,idle+(yaw-idle)*bedEase(Math.min(1,w*4)),sway*.1],pose:'awake'};};
 if(s<JUMP.walk)return walk(bedEase(s/JUMP.walk),toBed);
 if(s<JUMP.bounce){const c=bedEase((s-JUMP.walk)/JUMP.climb);return {pos:arc(b,u,c,.6),rot:[0,toBed+(JUMP.face-toBed)*c,0],pose:c>.5?'cheer':'awake'};}
 if(s<JUMP.off){const n=Math.floor((s-JUMP.bounce)/JUMP.period),f=(s-JUMP.bounce)/JUMP.period-n;
  if(f<JUMP.press)return {pos:[u[0],u[1]-.26*jumpPress(f),u[2]],rot:[0,JUMP.face,0],pose:'cheer'};
  const a=(f-JUMP.press)/(1-JUMP.press),spin=n===JUMP.spin&&!state.reduced?bedEase(a)*Math.PI*2:0;
  return {pos:[u[0],u[1]+JUMP.heights[n]*(state.reduced?.6:1)*4*a*(1-a),u[2]],rot:[state.reduced?0:Math.sin(a*Math.PI*2)*.08,JUMP.face+spin,0],pose:'cheer'};}
 if(s<JUMP.home){const c=bedEase((s-JUMP.off)/JUMP.down);return {pos:arc(u,b,c,.45),rot:[0,JUMP.face+(toRoom-JUMP.face)*c,0],pose:'awake'};}
 return walk(bedEase(Math.max(0,1-(s-JUMP.home)/JUMP.back)),toRoom);}
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
// Taps in the room: on the bed to jump (the first time), sleep and wake, and on the planets, comets and duck in the dream.
function tapInside(x,y){if(state.clock-sleep.lastTap<.6)return true;
 const hit=sleep.targets.length?pickTarget(sleep.targets,x,y,o=>o.p,o=>o.r,34):null;
 if(hit){burst(hit.p,['#ffde71','#ffffff','#79e4e2','#ece6ff'],12,1.6,{size:.06});
  if(hit.comet!==undefined){sleep.cometHit=hit.comet;gameAudio.effect('sparkle');speak('En komet!');}else if(hit.duck){gameAudio.effect('quack');speak('Kvakk kvakk!');}else{gameAudio.effect('pop');speak(hit.body.name);}return true;}
 if(pickTarget([[3.05,.9,-1.6],[3.05,.9,-.5],[3.05,.9,.6]],x,y,p=>p,()=>.75)){if(sleep.on)wakeUp();else if(!sleep.jumped)startJump();else goToBed();return true;}
 return false;}
$('wake-up').onclick=wakeUp;
