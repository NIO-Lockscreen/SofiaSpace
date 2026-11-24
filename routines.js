/* Mealtime and tooth brushing in Sofia's room (23 November 2026).
   Two ways to eat, side by side and just as ordinary: with a spoon at her little table (a tap anywhere, or «🥄 En skje til», gives her the next spoonful
   until the bowl is empty), or through her PEG tube with the feeding pump in its backpack, made after the real one: a red front with black zips, blue
   sides, yellow loops with a blue elastic cord laced through them in X's, a small red pocket at the bottom and black straps. She puts it on, the tube is
   clicked onto the button on her tummy, a tap starts the pump, and drops of food run down the tube into her tummy while she is free to dance about.
   Three beeps when it is done. Tooth brushing opens the game in teeth.js over the room; each time she brushes, a star goes on the chart on the wall. */
// Where things are in the room: her chair (she sits facing the room), the seat's height, the table, where she stands beside the chair, the backpack
// on the floor by the table, where she stands with it on, the bowl and the brushing chart on the back wall over the bed.
const MEAL={chair:[-2.3,0,2.6],seat:.42,table:[-2.3,0,3.35],side:[-1.58,0,2.62],bag:[-1.36,0,3.3],stand:[-.86,0,3.02],bowl:[-2.22,.62,3.04],chart:[2.85,2.98,-3.25],speed:2.2};
const FOODS=[{name:'grøt med blåbær',color:'#efe0bb',dots:'#4b5fae'},{name:'pasta med tomatsaus',color:'#f2c35b',dots:'#d9452f'},{name:'yoghurt med jordbær',color:'#fff1f3',dots:'#e0304f'}];
const BITES=5,BITE=1.05,PUMP=16;
// Which steps each meal goes through. The walks take as long as they take; eating and the pump wait for Sofia; the rest have their own time (s).
const MEAL_STEPS={spoon:['walk','sit','eat','full','up','back'],peg:['walk','pick','plug','ready','pump','beep','unplug','drop','back']};
const MEAL_TIME={sit:.6,full:2,up:.5,pick:1.2,plug:.9,beep:1.5,unplug:.7,drop:1.1};
// kind: null, 'spoon' or 'peg'; s: seconds into the step; bite: seconds into a spoonful (−1 between); queued: taps waiting; pump: seconds the pump has run;
// dance: seconds into a twirl with the backpack (−1 when not); view: how far the camera has glided in to the meal (0..1); food: which food today.
const meal={kind:null,step:'',s:0,bites:0,bite:-1,queued:0,pump:0,dance:-1,view:0,food:-1,from:null,last:-9};
const mealEase=k=>k*k*(3-2*k);
// A box (or cylinder) from a to b, w thick: arms, straps, the spoon and the tube.
function limb(a,b,w,color,mesh='box',glow=0){const v=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],len=Math.hypot(...v)||1e-6;d(mesh,[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2],[w,len/2,w],color,[Math.atan2(v[2],v[1]),0,-Math.asin(Math.max(-1,Math.min(1,v[0]/len)))],glow);}
const mix3=(a,b,k)=>a.map((v,i)=>v+(b[i]-v)*k),bez=(p,u)=>{const k=1-u;return [0,1,2].map(i=>k*k*k*p[0][i]+3*k*k*u*p[1][i]+3*k*u*u*p[2][i]+u*u*u*p[3][i]);};
// ---- The PEG backpack, in its own coordinates: bottom in the middle at the origin, the front towards +z, about 0.6 high ----
function pegBag(t,o={}){const blue='#3b7fd8',red='#d62f35',black='#1c1c22',yellow='#f4d22a',cord='#2b7fe6';
 d('box',[0,.29,0],[.17,.21,.1],blue);d('sphere',[0,.5,0],[.17,.1,.1],blue);d('sphere',[0,.08,0],[.17,.08,.1],blue);
 d('box',[.175,.18,.01],[.014,.1,.075],black);d('box',[-.175,.2,.01],[.012,.11,.06],'#2a4f8f');
 // the red front with a black zip down each side, and the little pocket at the bottom with its own zip and a red pull
 d('box',[0,.31,.085],[.115,.21,.03],red);d('sphere',[0,.52,.075],[.115,.07,.04],red);
 for(const x of [-1,1])d('box',[x*.12,.31,.1],[.01,.21,.012],black);d('box',[0,.585,.095],[.08,.012,.012],black);
 d('box',[0,.13,.11],[.088,.066,.026],'#c9262d');d('box',[0,.197,.132],[.088,.007,.008],black);d('box',[.064,.168,.14],[.012,.03,.006],red);
 // yellow loops in two columns, with the blue elastic cord crossing between them, down to a cord lock
 const loops=[.46,.35,.24].flatMap(y=>[[-.075,y,.118],[.075,y,.118]]);for(const p of loops)d('box',p,[.024,.013,.013],yellow);
 for(let r=0;r<2;r++){const a=loops[r*2],b=loops[r*2+1],c=loops[r*2+2],e=loops[r*2+3];limb([a[0],a[1],.124],[e[0],e[1],.124],.007,cord);limb([b[0],b[1],.124],[c[0],c[1],.124],.007,cord);}
 limb([-.075,.46,.124],[.075,.46,.124],.007,cord);limb([-.075,.24,.124],[-.13,.16,.12],.007,cord);d('box',[-.135,.14,.12],[.018,.025,.015],black);
 // a little light on top: amber while the pump waits, blinking green while it runs
 if(o.light)d('sphere',[.06,.6,.06],[.022,.022,.022],o.light,[],1);
 // the carrying strap on top, when it is not on her back
 if(!o.worn){limb([-.1,.56,0],[-.05,.72,0],.018,black);limb([-.05,.72,0],[.05,.72,0],.018,black);limb([.05,.72,0],[.1,.56,0],.018,black);for(const x of [-.11,.11])d('box',[x,.57,0],[.03,.02,.035],'#3a3a40');}}
// Where a point in her own coordinates is in the room, for the backpack flying onto her back.
function sofiaPoint(pos,yaw,p){const c=Math.cos(yaw),s=Math.sin(yaw);return [pos[0]+.95*(p[0]*c+p[2]*s),pos[1]+.95*p[1],pos[2]+.95*(-p[0]*s+p[2]*c)];}
const BAG_ON=[0,.2,-.27]; // where the backpack sits on her back, in her coordinates (turned to face backwards)
// ---- The table, her chair, the bowl and spoon, the backpack when it is on the floor, and the brushing chart ----
function mealFurniture(t){const [tx,,tz]=MEAL.table,[cx,,cz]=MEAL.chair,wood='#d9a66c',leg='#a8743f';
 d('cylinder',[tx,.57,tz],[.66,.035,.6],wood);d('cylinder',[tx,.6,tz],[.62,.01,.56],'#f2d6ad');for(const [x,z] of [[-.4,-.36],[.4,-.36],[-.4,.36],[.4,.36]])d('box',[tx+x,.27,tz+z],[.04,.27,.04],leg);
 d('box',[cx,MEAL.seat-.03,cz],[.3,.04,.28],'#ff9ec4');d('box',[cx,MEAL.seat+.32,cz-.27],[.3,.3,.035],'#ff9ec4');d('box',[cx,MEAL.seat+.5,cz-.25],[.22,.08,.02],'#ffd1e2');
 for(const [x,z] of [[-.25,-.24],[.25,-.24],[-.25,.24],[.25,.24]])d('box',[cx+x,(MEAL.seat-.06)/2,cz+z],[.03,(MEAL.seat-.06)/2,.03],'#e07aa3');
 // the bowl: empty until a meal with the spoon, then full, emptied a spoonful at a time
 const [bx,by,bz]=MEAL.bowl;d('cylinder',[bx,by+.035,bz],[.17,.05,.17],'#79e4e2');d('cylinder',[bx,by+.08,bz],[.18,.012,.18],'#a9f0ee');
 const left=meal.kind==='spoon'&&meal.step!=='back'&&meal.food>=0?1-Math.min(BITES,meal.bites)/BITES:0;
 if(left>0){const f=FOODS[meal.food];d('cylinder',[bx,by+.05+.035*left,bz],[.155*(.6+.4*left),.02,.155*(.6+.4*left)],f.color);
  for(let i=0;i<Math.ceil(5*left);i++){const a=i*2.4;d('sphere',[bx+Math.cos(a)*.08*left,by+.08+.035*left,bz+Math.sin(a)*.08*left],[.025,.02,.025],f.dots);}}
 if(!spoonInHand())d('box',[bx+.27,by+.015,bz+.05],[.018,.008,.13],'#c9ced8',[0,.3,0]);
 d('cylinder',[bx-.38,by+.07,bz+.12],[.07,.08,.07],'#ffde71');
 // the backpack on the floor by the table, the light off
 if(bagOnFloor())group(MEAL.bag,[1,1,1],[0,-.25,0],()=>pegBag(t));
 // The brushing chart: a sheet with a big tooth on it and ten places for stars, one more each time she brushes.
 const [hx,hy,hz]=MEAL.chart;d('box',[hx,hy,hz],[.78,.5,.02],'#fffaf0');d('box',[hx,hy+.38,hz+.02],[.78,.12,.012],'#79e4e2');
 d('sphere',[hx-.55,hy+.03,hz+.04],[.15,.17,.03],'#ffffff');for(const x of [-.07,.07])d('sphere',[hx-.55+x,hy-.13,hz+.04],[.06,.08,.03],'#ffffff');
 for(let i=0;i<10;i++){const x=hx-.25+(i%5)*.23,y=hy+.1-Math.floor(i/5)*.3,on=i<Math.min(10,state.brushed);
  if(on)d('star',[x,y,hz+.04],[.1,.1,.1],'#79e4e2',[0,0,(i%3-1)*.2],.35+(state.reduced?0:.15*Math.sin(t*2+i)));else d('sphere',[x,y,hz+.03],[.06,.06,.01],'#e8e0d0');}}
const bagOnFloor=()=>!(meal.kind==='peg'&&MEAL_STEPS.peg.indexOf(meal.step)>=1&&MEAL_STEPS.peg.indexOf(meal.step)<=7);
const spoonInHand=()=>meal.kind==='spoon'&&['eat','full'].includes(meal.step);
// ---- Starting, the steps, and stopping ----
function mealBusy(){return sleep.on||sleep.jump>=0||sleep.k>0||!!meal.kind;}
function startMeal(kind){if(state.mode!=='inside'||mealBusy())return;const p=sleep.pose?.pos||BED.idle;
 Object.assign(meal,{kind,lastKind:kind,step:'walk',s:0,bites:0,bite:-1,queued:0,pump:0,dance:-1,from:[p[0],0,p[2]],fromYaw:sleep.pose?.rot?.[1]??-.34,last:state.clock});
 if(kind==='spoon'){meal.food=(meal.food+1)%FOODS.length;title('MATTID','Sofia skal spise',`I dag blir det ${FOODS[meal.food].name}!`,'🥄 Nam nam');gameAudio.say(`Mat! I dag blir det ${FOODS[meal.food].name}. Sofia setter seg ved bordet.`,{id:'meal'});}
 else{title('MATTID','Mat med PEG','Maten går gjennom slangen og rett i magen.','🎒 PEG-sekken');gameAudio.say('Nå skal Sofia få mat gjennom PEG-slangen. Hun tar på seg sekken med pumpen.',{id:'meal'});}
 tone(420,.08);renderBedConsole();}
function nextStep(){const list=MEAL_STEPS[meal.kind],i=list.indexOf(meal.step);meal.s=0;if(i>=list.length-1){endMeal();return;}meal.step=list[i+1];onStep(meal.step);renderBedConsole();}
function onStep(step){if(step==='eat')gameAudio.say('Trykk, så tar Sofia en skje!',{id:'meal',queue:true});
 if(step==='full'){gameAudio.effect('correct');burst([MEAL.chair[0],1.25,MEAL.chair[2]+.25],['#ffde71','#ff9ec4','#79e4e2','#ffffff'],14,1.6,{size:.06});gameAudio.say('Ferdig! Skåla er tom. Nå er magen god og mett, Sofia! Etter maten pusser vi tennene.',{id:'meal'});title('MATTID','Skåla er tom!','Nå er magen god og mett.','😋 Mett og god');}
 if(step==='plug'){gameAudio.effect('click');}
 if(step==='ready'){gameAudio.say('Klikk! Slangen er koblet til knappen på magen. Trykk på sekken for å starte pumpen.',{id:'meal'});title('MATTID','Slangen er koblet til','Trykk på sekken, så starter pumpen.','🎒 PEG-sekken');}
 if(step==='beep'){gameAudio.effect('pumpdone');burst(sofiaPoint(MEAL.stand,0,[0,.5,.25]),['#ffde71','#ff9ec4','#79e4e2','#ffffff'],14,1.6,{size:.06});gameAudio.say('Pip, pip, pip! Ferdig! Nå er magen god og mett, Sofia. Etter maten pusser vi tennene.',{id:'meal'});title('MATTID','Pumpen er ferdig','Nå er magen god og mett.','😋 Mett og god');}
 if(step==='unplug')gameAudio.effect('click');}
function startPump(){if(meal.kind!=='peg'||meal.step!=='ready')return;meal.step='pump';meal.s=0;meal.pump=0;gameAudio.effect('beep');renderBedConsole();
 title('MATTID','Pumpen går','Maten renner gjennom slangen og rett i magen. Trykk på Sofia, så danser hun!','🎒 Mat med PEG');
 gameAudio.say('Pip! Pumpen går. Maten renner gjennom slangen og rett i magen. Med sekken på ryggen kan Sofia leke mens hun spiser. Trykk på henne, så danser hun!',{id:'meal'});}
function takeBite(){if(meal.kind!=='spoon'||meal.step!=='eat')return;if(meal.bite>=0){meal.queued=Math.min(2,meal.queued+1);return;}meal.bite=0;}
function dance(){if(meal.kind!=='peg'||meal.step!=='pump'||meal.dance>=0)return;meal.dance=0;gameAudio.effect('boing');
 if(state.clock-meal.last>2.5){meal.last=state.clock;gameAudio.say(['Se, Sofia danser med sekken!','Sekken henger med!','Hopp og sprett!','Maten kommer likevel!'][Math.floor(Math.random()*4)],{id:'meal'});}}
// «Ferdig» before the end: with the spoon she says thank you and gets up; with the pump it stops, the tube comes off and the backpack goes back.
function finishMeal(){if(!meal.kind)return;
 if(meal.kind==='spoon'&&['walk','sit','eat'].includes(meal.step)){if(meal.step==='walk'){endMeal();return;}meal.step='up';meal.s=0;meal.bite=-1;meal.queued=0;gameAudio.say('Takk for maten!',{id:'meal'});renderBedConsole();return;}
 if(meal.kind==='peg'){const i=MEAL_STEPS.peg.indexOf(meal.step);if(meal.step==='walk'){endMeal();return;}if(i<=1)return;if(i<=4){meal.step=i<=3?'unplug':'beep';meal.s=0;onStep(meal.step);renderBedConsole();}}} // before the pump has run the tube just comes off
function endMeal(){if(!meal.kind)return;meal.kind=null;meal.step='';if(sleep.pose)sleep.blend={...sleep.pose,at:state.clock};renderBedConsole();insideTitle();}
function resetMeal(){Object.assign(meal,{kind:null,step:'',s:0,bites:0,bite:-1,queued:0,pump:0,dance:-1,view:0});stopBrushing(true);renderBedConsole();}
function stepTime(){if(meal.step==='walk'||meal.step==='back'){const [a,b]=walkEnds();return Math.max(.4,Math.hypot(b[0]-a[0],b[2]-a[2])/MEAL.speed);}return MEAL_TIME[meal.step]??Infinity;}
function walkEnds(){const spot=meal.kind==='spoon'?MEAL.side:MEAL.stand;return meal.step==='walk'?[meal.from,spot]:[spot,BED.idle];}
function updateMeal(dt){meal.view+=((meal.kind&&!['walk','back'].includes(meal.step)?1:0)-meal.view)*Math.min(1,dt*2.2);if(!meal.kind)return;meal.s+=dt;
 if(meal.step==='eat'&&meal.bite>=0){const was=meal.bite;meal.bite+=dt;if(was<.5&&meal.bite>=.5){meal.bites++;gameAudio.effect('nam');if(meal.bites<BITES&&state.clock-meal.last>1.8){meal.last=state.clock;gameAudio.say(['Nam!','Mmm, godt!','Nam nam!','Så godt!'][meal.bites%4],{id:'meal'});}renderBedConsole();}
  if(meal.bite>=BITE){meal.bite=-1;if(meal.bites>=BITES){nextStep();return;}if(meal.queued>0){meal.queued--;meal.bite=0;}}}
 if(meal.step==='pump'){meal.pump+=dt;if(Math.floor(meal.pump/2)!==Math.floor((meal.pump-dt)/2))burst(sofiaPoint(MEAL.stand,0,[.05,.5,.22]),['#fff3d2','#ffde71','#ff9ec4'],4,.8,{size:.04});
  if(meal.pump>=PUMP){meal.step='beep';meal.s=0;onStep('beep');renderBedConsole();}if(Math.floor(meal.pump)!==Math.floor(meal.pump-dt))renderBedConsole();}
 if(meal.dance>=0){meal.dance+=dt;if(meal.dance>=1.3)meal.dance=-1;}
 if(meal.s>=stepTime())nextStep();}
// ---- Sofia at the meal ----
// The walks: she turns towards where she goes, steps there with the same sway as on her way to bed, and turns to face the room at the end.
function mealWalk(a,b,k,yaw0,yaw1){const w=mealEase(Math.min(1,k)),dist=Math.hypot(b[0]-a[0],b[2]-a[2]),sway=state.reduced?0:Math.sin(w*dist*4.5),go=Math.atan2(b[0]-a[0],b[2]-a[2]),
  turnIn=mealEase(Math.min(1,k*5)),turnOut=mealEase(Math.max(0,(k-.8)/.2));let yaw=yaw0+bedAngle(go-yaw0)*turnIn;yaw+=bedAngle(yaw1-yaw)*turnOut;
 return {pos:[a[0]+(b[0]-a[0])*w,state.reduced?0:Math.abs(sway)*.07,a[2]+(b[2]-a[2])*w],rot:[0,yaw,sway*.1*(1-turnOut)]};}
const SEATED=[MEAL.chair[0],MEAL.seat-.18,MEAL.chair[2]],SHIN=.42;
const HAND={bowl:[.13,.52,.4],mouth:[.1,.93,.42],tipBowl:[-.06,-.07,.03],tipMouth:[-.08,.07,-.12]};
// Her arms while she eats with the spoon: the left hand by the bowl, the right lifting the spoon to her mouth; or both hands patting her full tummy.
function spoonArms(t){const b=meal.bite,lift=b<0?0:b<.4?mealEase(b/.4):b<.6?1:b<1?1-mealEase((b-.6)/.4):0,scoop=b>=0&&b<.15?Math.sin(b/.15*Math.PI)*.05:0,yellow='#efb749',skin='#f6d1a8';
 if(meal.step==='full'){const pat=state.reduced?0:Math.abs(Math.sin(meal.s*9))*.04;for(const x of [-1,1]){const h=[x*.1,.5+pat,.22];limb([x*.3,.78,0],h,.085,yellow);d('sphere',h,[.1,.1,.1],skin);}d('box',[.3,.47,.52],[.018,.008,.13],'#c9ced8',[0,-.4,0]);return;}
 limb([-.3,.78,0],[-.17,.52,.36],.085,yellow);d('sphere',[-.17,.52,.36],[.1,.1,.1],skin);
 const h=mix3(HAND.bowl,HAND.mouth,lift);h[1]-=scoop;limb([.3,.78,0],h,.085,yellow);d('sphere',h,[.1,.1,.1],skin);
 const tip=h.map((v,i)=>v+HAND.tipBowl[i]+(HAND.tipMouth[i]-HAND.tipBowl[i])*lift);limb(h,tip,.018,'#c9ced8');d('sphere',tip,[.05,.02,.04],'#c9ced8');
 if(b>=.1&&b<.52&&meal.food>=0)d('sphere',[tip[0],tip[1]+.02,tip[2]],[.04,.03,.035],FOODS[meal.food].color);}
// The backpack on her back with its straps over her shoulders, and the tube from its side round to the button on her tummy, drops running down it.
const TUBE=[[.17,.35,-.25],[.34,.42,-.08],[.3,.44,.2],[.07,.47,.18]];
// A flat band from a to b: hw wide along x, hd thick (on the front it lies flat on her shirt, over the shoulder flat on top),
// a little longer than the gap so the pieces meet at the corners.
function band(a,b,hw,hd,color){const v=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],len=Math.hypot(...v)||1e-6;d('box',[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2],[hw,len/2+.012,hd],color,[Math.atan2(v[2],v[1]),0,-Math.asin(Math.max(-1,Math.min(1,v[0]/len)))]);}
// Each strap lies on her body all the way: up from the bag, flat over the shoulder, down the front of her shirt, and round her side
// under the arm to the bottom of the bag. (Strap ends that stopped on her chest looked like two dark dots there.)
function wornBag(t,light){group(BAG_ON,[1,1,1],[0,Math.PI,0],()=>pegBag(t,{worn:true,light}));
 const c='#1c1c22',top=.862,front=.172,side=.234;
 for(const x of [-1,1]){band([x*.13,.74,-.185],[x*.16,top,-.165],.035,.012,c);band([x*.16,top,-.165],[x*.16,top,.165],.035,.012,c);
  band([x*.16,top,front],[x*.16,.5,front],.035,.012,c);band([x*.16,.5,front],[x*side,.42,.06],.025,.025,c);
  band([x*side,.42,.06],[x*side,.38,-.13],.012,.035,c);band([x*side,.38,-.13],[x*.16,.34,-.19],.025,.025,c);}}
function pegTube(t,grow,flow){const n=16,on=Math.max(0,Math.min(1,grow));let prev=bez(TUBE,0);for(let i=1;i<=n;i++){const u=i/n*on,p=bez(TUBE,u);limb(prev,p,.017,'#c8b4f0','cylinder');prev=p;}
 if(on>=1){d('cylinder',[.07,.47,.175],[.035,.015,.035],'#9a7fd8',[Math.PI/2,0,0]);if(flow)for(let i=0;i<7;i++){const u=((state.reduced?0:t*.42)+i/7)%1;d('sphere',bez(TUBE,u),[.024,.024,.024],'#fff3d2',[],1);}}}
// Her pose at each step of the meal: where she is, which way she faces, and what she does with her arms, legs, mouth and the backpack.
function mealPose(t){const st=meal.step,k=stepTime()<Infinity?Math.min(1,meal.s/stepTime()):0,spoon=meal.kind==='spoon';
 let P={pos:SEATED,rot:[0,0,0],o:{},bag:null,tube:0,flow:false,light:null,cheer:false};
 if(st==='walk'){const [a,b]=walkEnds();const yaw1=spoon?Math.atan2(MEAL.chair[0]-b[0],MEAL.chair[2]-b[2]):Math.atan2(MEAL.bag[0]-b[0],MEAL.bag[2]-b[2]);Object.assign(P,mealWalk(a,b,k,meal.fromYaw,yaw1));}
 else if(st==='back'){const [a,b]=walkEnds(),yaw0=spoon?Math.atan2(MEAL.chair[0]-a[0],MEAL.chair[2]-a[2]):Math.atan2(MEAL.bag[0]-a[0],MEAL.bag[2]-a[2]);Object.assign(P,mealWalk(a,b,k,yaw0,-.34));}
 else if(spoon){
  if(st==='sit'||st==='up'){const c=mealEase(st==='sit'?k:1-k),s=MEAL.side,yaw0=Math.atan2(MEAL.chair[0]-s[0],MEAL.chair[2]-s[2]);
   P.pos=[s[0]+(SEATED[0]-s[0])*c,s[1]+(SEATED[1]-s[1])*c+Math.sin(c*Math.PI)*.35,s[2]+(SEATED[2]-s[2])*c];P.rot=[0,yaw0*(1-c),0];if(c>.55)P.o={sit:SHIN};}
  else{P.o={sit:SHIN,arms:()=>spoonArms(t),mouth:st==='full'?'smile':meal.bite>=.36&&meal.bite<.58?'open':meal.bite>=.58&&meal.bite<.98?'chew':'smile'};
   if(st==='full'&&!state.reduced)P.pos=[SEATED[0],SEATED[1]+Math.abs(Math.sin(meal.s*4.5))*.05,SEATED[2]];}}
 else{const s=MEAL.stand;P.pos=[s[0],0,s[2]];P.bag='back';
  if(st==='pick'){const toBag=Math.atan2(MEAL.bag[0]-s[0],MEAL.bag[2]-s[2]),c=mealEase(Math.min(1,Math.max(0,(k-.25)/.6)));P.rot=[0,toBag*(1-mealEase(Math.max(0,(k-.3)/.6))),0];P.bag=c>=1?'back':'carry';P.carry=c;}
  if(st==='drop'){const toBag=Math.atan2(MEAL.bag[0]-s[0],MEAL.bag[2]-s[2]),c=mealEase(Math.min(1,Math.max(0,(k-.1)/.6)));P.rot=[0,toBag*mealEase(Math.min(1,k/.4)),0];P.bag=c<=0?'back':'carry';P.carry=1-c;}
  if(st==='ready')P.rot=[0,-2.5*mealEase(Math.min(1,meal.s/.7)),0];if(st==='pump')P.rot=[0,-2.5*(1-mealEase(Math.min(1,meal.s/.7))),0];
  P.tube=st==='plug'?k:st==='unplug'?1-k:['ready','pump','beep'].includes(st)?1:0;P.flow=st==='pump';P.light=st==='ready'?(Math.sin(t*6)>0?'#ffb43d':'#7a5a20'):st==='pump'?(Math.sin(t*5)>-.3?'#5be37a':'#2a7a3a'):st==='beep'?'#5be37a':null;
  if(meal.dance>=0){const c=meal.dance/1.3;P.rot=[0,state.reduced?0:mealEase(c)*Math.PI*2,0];P.pos=[s[0],(state.reduced?.4:1)*Math.sin(c*Math.PI)*.35,s[2]];P.cheer=true;}}
 return P;}
function mealSofia(t){if(!meal.kind)return false;const P=mealPose(t);
 group(P.pos,[.95,.95,.95],P.rot,()=>{character(t,false,P.cheer,P.o);if(P.bag==='back')wornBag(t,P.light);if(P.tube>0)pegTube(t,P.tube,P.flow);});
 // Picking the backpack up (or putting it down): it swings from the floor to her back in an arc, turning round as it goes.
 if(P.bag==='carry'){const c=P.carry,on=sofiaPoint(P.pos,P.rot[1],BAG_ON),pos=mix3(MEAL.bag,on,c);pos[1]+=Math.sin(c*Math.PI)*.45;group(pos,[1-.05*c,1-.05*c,1-.05*c],[0,-.25+bedAngle(P.rot[1]+Math.PI+.25)*c,0],()=>pegBag(t,{worn:c>.5}));}
 sleep.pose={pos:P.pos,rot:P.rot};return true;}
// The camera glides in to the table, or to Sofia with the backpack, and still turns a little when dragged.
function mealCamera(eye,at,a,aspect){const k=mealEase(Math.min(1,meal.view));if(k<=0)return;const spoon=meal.kind?meal.kind==='spoon':meal.lastKind==='spoon',look=spoon?[-2.25,.98,2.95]:[-1.05,.9,3.1],
 dist=Math.max(aspect>2?3:3.6,1.45/(.354*aspect)),x=.25,z=1,y=.5,n=Math.hypot(x,y,z),dir=[(x*Math.cos(a)+z*Math.sin(a))/n,y/n,(z*Math.cos(a)-x*Math.sin(a))/n];
 for(let i=0;i<3;i++){eye[i]+=(look[i]+dir[i]*dist-eye[i])*k;at[i]+=(look[i]+(i===1?.12:0)-at[i])*k;}}
// ---- Taps in the room: on the table or the bowl to eat, on the backpack for food through the tube; during a meal, a tap is the next spoonful,
// starts the pump, or makes her dance with the backpack on. Anything else during a meal does nothing (the bed waits until she is done). ----
function tapMeal(x,y){
 if(meal.kind){if(meal.step==='eat')takeBite();else if(meal.step==='ready')startPump();else if(meal.step==='pump')dance();return true;}
 if(mealBusy())return false;
 // The table and the backpack together, so a tap between them goes to the nearer; both answer at least 56 px round them, as the backpack is small.
 const hit=pickTarget([{kind:'spoon',p:[MEAL.table[0],.62,MEAL.table[2]],r:.6},{kind:'peg',p:[MEAL.bag[0],.3,MEAL.bag[2]],r:.5}],x,y,o=>o.p,o=>o.r,56);
 if(hit){startMeal(hit.kind);return true;}
 return false;}
// ---- The console: the three everyday buttons in the room, and during a meal what she can do next ----
function mealText(){const m=meal,f=FOODS[m.food]?.name||'mat';
 if(m.kind==='spoon')return m.step==='eat'?`Sofia spiser ${f}. Trykk, så tar hun en skje. ${BITES-m.bites} ${BITES-m.bites===1?'skje':'skjeer'} igjen.`:m.step==='full'||m.step==='up'||m.step==='back'?'Skåla er tom. Nå er magen god og mett!':`Sofia setter seg ved bordet. I dag blir det ${f}.`;
 if(m.kind==='peg')return m.step==='ready'?'Slangen er koblet til knappen på magen. Trykk på sekken for å starte pumpen.':m.step==='pump'?'Pumpen går. Maten renner gjennom slangen og rett i magen. Trykk på Sofia, så danser hun med sekken på!':['beep','unplug','drop','back'].includes(m.step)?'Ferdig! Nå er magen god og mett.':'Sofia tar på seg PEG-sekken og kobler slangen til knappen på magen.';
 return '';}
// Called at the end of renderBedConsole (bedtime.js), which sets the room's own text and buttons first.
function renderRoutine(){const m=meal.kind,busy=sleep.on||sleep.jump>=0;$('routine-row').hidden=busy||!!m;$('go-outside').hidden=!!m; // during a meal «Ferdig å spise» comes first, so the buttons still fit on a low screen
 if(!m){$('meal-action').hidden=true;$('meal-done').hidden=true;$('tummy').hidden=true;return;}
 $('open-quiz').hidden=true;$('inside-progress').textContent=mealText();const a=$('meal-action'),st=meal.step;
 a.hidden=!['eat','ready','pump'].includes(st);a.textContent=st==='eat'?'🥄 En skje til':st==='ready'?'▶ Start pumpen':'💃 Dans med sekken';
 $('meal-done').hidden=!(['walk','sit','eat'].includes(st)&&m==='spoon'||['walk','plug','ready','pump'].includes(st)&&m==='peg');
 const fill=m==='peg'?Math.min(1,meal.pump/PUMP+(['beep','unplug','drop','back'].includes(st)?1:0)):Math.min(1,meal.bites/BITES);$('tummy').hidden=false;$('tummy-fill').style.width=Math.round(fill*100)+'%';$('tummy').setAttribute('aria-label',`Magen er ${Math.round(fill*100)} prosent mett`);}
$('eat-spoon').onclick=()=>startMeal('spoon');$('eat-peg').onclick=()=>startMeal('peg');$('meal-done').onclick=finishMeal;
$('meal-action').onclick=()=>{if(meal.step==='eat')takeBite();else if(meal.step==='ready')startPump();else if(meal.step==='pump')dance();};
// ---- Tooth brushing: the game in teeth.js on its own canvas over the room. A star on the chart when the teeth are clean. ----
let toothGame=null;
const TEETH_TEXT={paste:['Tannkrem først','Trykk på tuben, så kommer det tannkrem på tannbørsten.'],brush:['Puss alle tennene','Dra tannbørsten fram og tilbake over tennene, både oppe og nede. Husk de bakerste!'],
 rinse:['Skyll munnen','Trykk på koppen med vann.'],done:['Så rene tenner!','Du pusset kjempebra. Stjernen kommer på tannpusskartet.']};
function startBrushing(){if(state.mode!=='inside'||mealBusy())return;
 if(!toothGame)toothGame=createToothGame({canvas:$('teeth'),reduced:()=>state.reduced,skin:'#f6d1a8',hair:'#77523c',say:text=>gameAudio.say(text,{id:'teeth'}),
  sound:(name,i)=>name==='ding'?gameAudio.note(i||0):name==='done'?gameAudio.effect('fanfare'):name==='tap'?gameAudio.effect('oops'):gameAudio.effect(name),
  onStep:step=>{const [h,p]=TEETH_TEXT[step]||['Tannpuss',''];$('teeth-title').textContent=h;$('teeth-tip').textContent=p;},onDone:brushed});
 state.mode='teeth';state.dragging=false;showConsole('teeth');$('teeth').hidden=false;$('app').classList.add('brushing');$('world-hint').hidden=true;
 scene.setAttribute('aria-label','Tannpuss. Sofias munn er vid åpen. Puss alle tennene til de skinner.');tone(520,.08);toothGame.start();}
function brushed(){state.brushed++;saveProgress();progressChanged();stopBrushing();notify('🪥 En ny stjerne på tannpusskartet!');
 gameAudio.say(`Så flink du er, Sofia! Nå har du ${state.brushed} ${state.brushed===1?'stjerne':'stjerner'} på tannpusskartet.`,{id:'teeth'});}
// Back to the room (the «Tilbake» button, Esc, or clean teeth). quiet: when the room itself is reset, nothing to say.
function stopBrushing(quiet=false){if(!toothGame||!toothGame.running&&state.mode!=='teeth'){$('app').classList.remove('brushing');return;}toothGame.stop();$('teeth').hidden=true;$('app').classList.remove('brushing');
 if(state.mode==='teeth'){state.mode='inside';showConsole('inside');$('world-hint').hidden=false;insideTitle();if(!quiet)gameAudio.stopSpeech();}}
$('brush-teeth').onclick=startBrushing;$('teeth-done').onclick=()=>stopBrushing();
$('teeth-speak').onclick=()=>{const s=toothGame?.step;gameAudio.say((TEETH_TEXT[s]||TEETH_TEXT.paste)[1],{force:true,id:'teeth'});};
