/* Mealtime and tooth brushing in Sofia's room (23 November 2026).
   Two ways to eat, side by side and just as ordinary: with a spoon at her little table (a tap anywhere, or «🥄 En skje til», gives her the next spoonful
   until the bowl is empty), or through her PEG tube with the feeding pump in its backpack, made after the real one: a red front with black zips, blue
   sides, yellow loops with a blue elastic cord laced through them in X's, a small red pocket at the bottom and black straps. She puts it on, the tube is
   clicked onto the button on her tummy, a tap starts the pump, and drops of food run down the tube into her tummy while she is free to dance about.
   Three beeps when it is done. Tooth brushing opens the game in teeth.js over the room; each time she brushes, a star goes on the chart on the wall.
   (24 November 2026) The food lies in a heap in the bowl that gets smaller with each spoonful, so the bowl is empty just as the last one is eaten, and a tap
   on the glass of water by the bowl makes her drink: she takes it with her free hand, lifts it to her mouth, tips it, «glugg glugg», and puts it back.
   (25 November 2026) A white mobile lies on the table in plain sight. A tap on it, and she orders pizza, a burger, sushi or an egg; the doorbell rings and
   the dish waits on a trolley by the table. «🥄 Spise» then asks what she wants: a dish she has ordered, or the bowl as before.
   (26 November 2026) Six on the trolley; after that the food goes on the floor, as much as there is room for (a limit nobody is told), and she walks through it. */
// Where things are in the room: her chair (she sits facing the room), the seat's height, the table, where she stands beside the chair, the backpack
// on the floor by the table, where she stands with it on, the bowl, the middle of the glass and the brushing chart on the back wall over the bed.
// The mobile lies at the front of the table on the side nearest the room, so it is on the screen even when the table is half off it (a phone held
// upright), turned a little as if put down in a hurry; the trolley with the food she orders stands at the front of the room, clear of her walks.
const MEAL={chair:[-2.3,0,2.6],seat:.42,table:[-2.3,0,3.35],side:[-1.58,0,2.62],bag:[-1.36,0,3.3],stand:[-.86,0,3.02],bowl:[-2.22,.62,3.04],cup:[-2.6,.69,3.16],chart:[2.85,2.98,-3.25],speed:2.2,
 top:.61,phone:[-1.86,.619,3.6],phoneYaw:.45,cart:[.3,0,3.36]};
const FOODS=[{name:'grøt med blåbær',color:'#efe0bb',dots:'#4b5fae'},{name:'pasta med tomatsaus',color:'#f2c35b',dots:'#d9452f'},{name:'yoghurt med jordbær',color:'#fff1f3',dots:'#e0304f'}];
const BITES=5,BITE=1.05,PUMP=16,DRINK=2;
// Which steps each meal goes through. The walks take as long as they take; eating and the pump wait for Sofia; the rest have their own time (s).
const MEAL_STEPS={spoon:['walk','sit','eat','full','up','back'],peg:['walk','pick','plug','ready','pump','beep','unplug','drop','back']};
const MEAL_TIME={sit:.6,full:2,up:.5,pick:1.2,plug:.9,beep:1.5,unplug:.7,drop:1.1};
// kind: null, 'spoon' or 'peg'; s: seconds into the step; bite: seconds into a spoonful (−1 between); queued: taps waiting; pump: seconds the pump has run;
// dance: seconds into a twirl with the backpack (−1 when not); view: how far the camera has glided in to the meal (0..1); food: which food today;
// drink: seconds into a drink from the glass (−1 when not); drinkNext: the glass was tapped while she was busy, so she drinks next; sips: how many so far.
// dish: the id of a dish she ordered, eaten instead of the bowl (null for the bowl); slot: its place (on the trolley or the floor); taken: it has left its
// place for good (at the first bite).
const meal={kind:null,step:'',s:0,bites:0,bite:-1,queued:0,pump:0,dance:-1,drink:-1,drinkNext:false,sips:0,view:0,food:-1,dish:null,slot:-1,taken:false,from:null,last:-9};
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
 // the bowl: empty until a meal with the spoon, then a heap of food that gets smaller with each spoonful and is gone with the last one.
 // (The bowl is solid, so the food lies on top of its rim, over a darker disc that is the inside of the bowl; food sunk below the rim could not be seen.)
 const [bx,by,bz]=MEAL.bowl,dish=mealDish(),left=foodLeft();
 // a dish she ordered stands where the bowl was while she eats it, and is gone when she gets up
 if(dish){if(meal.step!=='back')group([bx,MEAL.top,bz],[1,1,1],[0,0,0],()=>dishModel(dish.id,left,t));}
 else{d('cylinder',[bx,by+.035,bz],[.17,.05,.17],'#79e4e2');d('cylinder',[bx,by+.08,bz],[.18,.012,.18],'#a9f0ee');d('cylinder',[bx,by+.093,bz],[.155,.002,.155],'#5fc9c7');}
 if(left>0&&!dish){const f=FOODS[meal.food],r=.145*(.5+.5*left),h=.012+.05*left;d('sphere',[bx,by+.093,bz],[r,h,r],f.color);
  for(let i=0;i<Math.ceil(5*left);i++){const a=i*2.4;d('sphere',[bx+Math.cos(a)*.5*r,by+.093+.82*h,bz+Math.sin(a)*.5*r],[.025,.02,.025],f.dots);}}
 if(!spoonInHand())d('box',[bx+.27,by+.015,bz+.05],[.018,.008,.13],'#c9ced8',[0,.3,0]);
 // the glass of water, unless it is in her hand
 if(!drinkPose()?.held)group(MEAL.cup,[.95,.95,.95],[0,0,0],glassOfWater);
 // the backpack on the floor by the table, the light off
 if(bagOnFloor())group(MEAL.bag,[1,1,1],[0,-.25,0],()=>pegBag(t));
 // the white mobile, and the trolley with the food she has ordered
 group(MEAL.phone,[1,1,1],[0,MEAL.phoneYaw,0],()=>mobile(t));foodCart(t);floorFood();
 // the robot vacuum and its dock (vacuum.js)
 vacuumScene(t);
 // The brushing chart: a sheet with a big tooth on it and ten places for stars, one more each time she brushes. After ten they go on the walls (brushWall).
 const [hx,hy,hz]=MEAL.chart;d('box',[hx,hy,hz],[.78,.5,.02],'#fffaf0');d('box',[hx,hy+.38,hz+.02],[.78,.12,.012],'#79e4e2');
 d('sphere',[hx-.55,hy+.03,hz+.04],[.15,.17,.03],'#ffffff');for(const x of [-.07,.07])d('sphere',[hx-.55+x,hy-.13,hz+.04],[.06,.08,.03],'#ffffff');
 for(let i=0;i<10;i++){const x=hx-.25+(i%5)*.23,y=hy+.1-Math.floor(i/5)*.3,on=i<Math.min(10,state.brushed);
  if(on)d('star',[x,y,hz+.04],[.1,.1,.1],'#79e4e2',[0,0,(i%3-1)*.2],.35+(state.reduced?0:.15*Math.sin(t*2+i)));else d('sphere',[x,y,hz+.03],[.06,.06,.01],'#e8e0d0');}
 brushWall(t);}
// ---- The brushing stars after the chart (24 November 2026): no limit ----
// Star 11 and on spill out of the chart over the back wall, the nearest places first, until it is full; then over the right wall (round the corner from the
// chart) and the left wall; then round after round in the gaps, a little smaller each time (brushStarSpots in game-core.js). They keep clear of the name,
// the case with the planets, the chart, the bed, the reading stars, the window and the desk. In turquoise like the chart's, gold, pink, lilac and pale yellow.
// All but the newest are one mesh per colour (built again only when a star is added), so a wall with thousands still draws quickly; the newest twinkles.
const BRUSH_COLOURS=['#79e4e2','#ffcf4a','#ff8fbd','#b9a3ff','#fff3c4'];
const BRUSH_WALLS=[
 {o:[-4.28,0,-3.245],u:[1,0,0],v:[0,1,0],n:[0,0,1],yaw:0,w:8.56,h:3.7,at:(u,v)=>[u-4.28,v],skip:[[0,8.56,0,.3],[2.73,5.83,2.12,3.75],[.98,7.58,.68,2.28],[6.3,7.96,2.43,3.53]]},
 {o:[4.245,0,-3.28],u:[0,0,1],v:[0,1,0],n:[-1,0,0],yaw:-Math.PI/2,w:5.18,h:3.7,at:(u,v)=>[4.28+u,v],skip:[[0,5.18,0,.3],[.83,4.73,0,1.3],[.83,3.88,1.45,3.4]]},
 {o:[-4.245,0,1.9],u:[0,0,-1],v:[0,1,0],n:[1,0,0],yaw:Math.PI/2,w:5.18,h:3.7,at:(u,v)=>[-4.28-(5.18-u),v],skip:[[0,5.18,0,.3],[0,1.7,1.35,3.15],[0,1.9,0,1.9]]}];
const brushStarsOnWall=()=>Math.max(0,state.brushed-10);
let brushBuilt={n:-1,spots:[]};
function brushWall(t){const n=brushStarsOnWall();
 if(n!==brushBuilt.n){const spots=brushStarSpots(n,{walls:BRUSH_WALLS,from:[MEAL.chart[0],MEAL.chart[1]]}),data=BRUSH_COLOURS.map(()=>[]),pts=[];
  for(let i=0;i<10;i++){const a=Math.PI/2+i*Math.PI/5,r=i%2?.44:1;pts.push([Math.cos(a)*r,Math.sin(a)*r]);}
  // the same star as the engine's 'star' mesh, turned onto its wall
  const tri=(out,a,b,c)=>{const n=norm(cross(sub(b,a),sub(c,a)));for(const p of [a,b,c])out.push(...p,...n);};
  for(const s of spots.slice(0,-1)){const w=BRUSH_WALLS[s.wall],c=Math.cos(s.spin),sn=Math.sin(s.spin),out=data[s.colour],
    P=(x,y,z)=>{const X=(x*c-y*sn)*s.size,Y=(x*sn+y*c)*s.size,Z=z*s.size;return [0,1,2].map(k=>s.p[k]+w.u[k]*X+w.v[k]*Y+w.n[k]*Z);};
   // the back half faces the wall and is never seen; only WebGL gets it (the software renderer would only throw it away)
   for(let i=0;i<10;i++){const p=pts[i],q=pts[(i+1)%10];tri(out,P(0,0,.26),P(p[0],p[1],0),P(q[0],q[1],0));if(!renderer.software)tri(out,P(0,0,-.26),P(q[0],q[1],0),P(p[0],p[1],0));}}
  BRUSH_COLOURS.forEach((c,k)=>renderer.setMesh('brushStars'+k,data[k]));brushBuilt={n,spots};}
 BRUSH_COLOURS.forEach((c,k)=>{if(renderer.meshes['brushStars'+k])renderer.draw('brushStars'+k,[0,0,0],[1,1,1],c,[0,0,0],.3);});
 const s=brushBuilt.spots.at(-1);if(s)d('star',s.p,[s.size,s.size,s.size],BRUSH_COLOURS[s.colour],[0,BRUSH_WALLS[s.wall].yaw,s.spin],.4+(state.reduced?0:.25*Math.sin(t*3)));}

const bagOnFloor=()=>!(meal.kind==='peg'&&MEAL_STEPS.peg.indexOf(meal.step)>=1&&MEAL_STEPS.peg.indexOf(meal.step)<=7);
const spoonInHand=()=>meal.kind==='spoon'&&['eat','full'].includes(meal.step)&&!mealDish()?.hand;
// The dish she ordered that she is eating now (null with the bowl), what it is called, and the colour of a spoonful.
const mealDish=()=>meal.kind==='spoon'&&meal.dish?dishById(meal.dish):null;
const foodName=()=>mealDish()?.name||FOODS[meal.food]?.name||'mat';
const foodColor=()=>meal.dish==='egg'?'#ffd96a':FOODS[meal.food]?.color||'#efe0bb';
// How much food is left in the bowl (1 full, 0 empty): a spoonful leaves the bowl as the spoon scoops it up, before it reaches her mouth.
function foodLeft(){if(meal.kind!=='spoon'||meal.step==='back'||!meal.dish&&meal.food<0)return 0;const taken=meal.bites+(meal.step==='eat'&&meal.bite>=.1&&meal.bite<.5?1:0);return Math.max(0,1-taken/BITES);}
// The glass, in her coordinates (scaled .95 like her): yellow, full of water.
function glassOfWater(){d('cylinder',[0,0,0],[.074,.084,.074],'#ffde71');d('cylinder',[0,.083,0],[.061,.0025,.061],'#9fd8f0');}
// ---- Starting, the steps, and stopping ----
function mealBusy(){return sleep.on||sleep.jump>=0||sleep.k>0||!!meal.kind;}
// dish: the id of a dish she has ordered, to eat at the table instead of the bowl; slot: which one (a tap on it); pickFood takes one from the floor first.
function startMeal(kind,dish=null,slot=-1){if(state.mode!=='inside'||mealBusy())return;const p=sleep.pose?.pos||BED.idle;
 if(kind!=='spoon'||!dishById(dish))dish=null;else{slot=pickFood(state.food,dish,slot);if(slot<0)dish=null;}
 Object.assign(meal,{kind,lastKind:kind,step:'walk',s:0,bites:0,bite:-1,queued:0,pump:0,dance:-1,drink:-1,drinkNext:false,dish,slot:dish?slot:-1,taken:false,from:[p[0],0,p[2]],fromYaw:sleep.pose?.rot?.[1]??-.34,last:state.clock});
 if(kind==='spoon'){if(!dish)meal.food=(meal.food+1)%FOODS.length;title('MATTID','Sofia skal spise',`I dag blir det ${foodName()}!`,(mealDish()?.emoji||'🥄')+' Nam nam');gameAudio.say(`Mat! I dag blir det ${foodName()}. Sofia setter seg ved bordet.`,{id:'meal'});}
 else{title('MATTID','Mat med PEG','Maten går gjennom slangen og rett i magen.','🎒 PEG-sekken');gameAudio.say('Nå skal Sofia få mat gjennom PEG-slangen. Hun tar på seg sekken med pumpen.',{id:'meal'});}
 tone(420,.08);renderBedConsole();}
function nextStep(){const list=MEAL_STEPS[meal.kind],i=list.indexOf(meal.step);meal.s=0;if(i>=list.length-1){endMeal();return;}meal.step=list[i+1];onStep(meal.step);renderBedConsole();}
function onStep(step){if(step==='eat'){gameAudio.say(mealDish()?.hand?'Trykk, så tar Sofia en bit! Trykk på glasset, så drikker hun.':'Trykk, så tar Sofia en skje! Trykk på glasset, så drikker hun.',{id:'meal',queue:true});if(meal.drinkNext){meal.drinkNext=false;meal.drink=0;}}
 if(step==='full'){gameAudio.effect('correct');burst([MEAL.chair[0],1.25,MEAL.chair[2]+.25],['#ffde71','#ff9ec4','#79e4e2','#ffffff'],14,1.6,{size:.06});
  if(mealDish()){gameAudio.say('Ferdig! Alt er spist. Nå er magen god og mett, Sofia! Etter maten pusser vi tennene.',{id:'meal'});title('MATTID','Alt er spist!','Nå er magen god og mett.','😋 Mett og god');}
  else{gameAudio.say('Ferdig! Skåla er tom. Nå er magen god og mett, Sofia! Etter maten pusser vi tennene.',{id:'meal'});title('MATTID','Skåla er tom!','Nå er magen god og mett.','😋 Mett og god');}}
 if(step==='plug'){gameAudio.effect('click');}
 if(step==='ready'){gameAudio.say('Klikk! Slangen er koblet til knappen på magen. Trykk på sekken for å starte pumpen.',{id:'meal'});title('MATTID','Slangen er koblet til','Trykk på sekken, så starter pumpen.','🎒 PEG-sekken');}
 if(step==='beep'){gameAudio.effect('pumpdone');burst(sofiaPoint(MEAL.stand,0,[0,.5,.25]),['#ffde71','#ff9ec4','#79e4e2','#ffffff'],14,1.6,{size:.06});gameAudio.say('Pip, pip, pip! Ferdig! Nå er magen god og mett, Sofia. Etter maten pusser vi tennene.',{id:'meal'});title('MATTID','Pumpen er ferdig','Nå er magen god og mett.','😋 Mett og god');}
 if(step==='unplug')gameAudio.effect('click');}
function startPump(){if(meal.kind!=='peg'||meal.step!=='ready')return;meal.step='pump';meal.s=0;meal.pump=0;gameAudio.effect('beep');renderBedConsole();
 title('MATTID','Pumpen går','Maten renner gjennom slangen og rett i magen. Trykk på Sofia, så danser hun!','🎒 Mat med PEG');
 gameAudio.say('Pip! Pumpen går. Maten renner gjennom slangen og rett i magen. Med sekken på ryggen kan Sofia leke mens hun spiser. Trykk på henne, så danser hun!',{id:'meal'});}
function takeBite(){if(meal.kind!=='spoon'||meal.step!=='eat')return;if(meal.bite>=0||meal.drink>=0){meal.queued=Math.min(2,meal.queued+1);return;}meal.bite=0;}
// A tap on the glass: she drinks now, or as soon as this spoonful is eaten, or as soon as she has sat down at the table.
function drink(){if(meal.kind!=='spoon')return;if(meal.step==='walk'||meal.step==='sit'||meal.step==='eat'&&meal.bite>=0){meal.drinkNext=true;return;}if(meal.step==='eat'&&meal.drink<0)meal.drink=0;}
function dance(){if(meal.kind!=='peg'||meal.step!=='pump'||meal.dance>=0)return;meal.dance=0;gameAudio.effect('boing');
 if(state.clock-meal.last>2.5){meal.last=state.clock;gameAudio.say(['Se, Sofia danser med sekken!','Sekken henger med!','Hopp og sprett!','Maten kommer likevel!'][Math.floor(Math.random()*4)],{id:'meal'});}}
// «Ferdig» before the end: with the spoon she says thank you and gets up; with the pump it stops, the tube comes off and the backpack goes back.
function finishMeal(){if(!meal.kind)return;
 if(meal.kind==='spoon'&&['walk','sit','eat'].includes(meal.step)){if(meal.step==='walk'){endMeal();return;}meal.step='up';meal.s=0;meal.bite=-1;meal.queued=0;meal.drink=-1;meal.drinkNext=false;gameAudio.say('Takk for maten!',{id:'meal'});renderBedConsole();return;}
 if(meal.kind==='peg'){const i=MEAL_STEPS.peg.indexOf(meal.step);if(meal.step==='walk'){endMeal();return;}if(i<=1)return;if(i<=4){meal.step=i<=3?'unplug':'beep';meal.s=0;onStep(meal.step);renderBedConsole();}}} // before the pump has run the tube just comes off
function endMeal(){if(!meal.kind)return;meal.kind=null;meal.step='';if(sleep.pose)sleep.blend={...sleep.pose,at:state.clock};renderBedConsole();insideTitle();}
function resetMeal(){Object.assign(meal,{kind:null,step:'',s:0,bites:0,bite:-1,queued:0,pump:0,dance:-1,drink:-1,drinkNext:false,view:0,dish:null,slot:-1,taken:false});stopBrushing(true);
 deliveries.length=0;if(!$('phone-modal').hidden)closePhone();$('dish-modal').hidden=true;vacuumAway();renderBedConsole();}
function stepTime(){if(meal.step==='walk'||meal.step==='back'){const [a,b]=walkEnds();return Math.max(.4,Math.hypot(b[0]-a[0],b[2]-a[2])/MEAL.speed);}return MEAL_TIME[meal.step]??Infinity;}
function walkEnds(){const spot=meal.kind==='spoon'?MEAL.side:MEAL.stand;return meal.step==='walk'?[meal.from,spot]:[spot,BED.idle];}
function updateMeal(dt){updateOrders();updateVacuum(dt);meal.view+=((meal.kind&&!['walk','back'].includes(meal.step)?1:0)-meal.view)*Math.min(1,dt*2.2);if(!meal.kind)return;meal.s+=dt;
 // A drink from the glass: «glugg» while it is tipped at her mouth, «ahh» when it comes down, then any spoonful that was tapped meanwhile.
 if(meal.step==='eat'&&meal.drink>=0){const was=meal.drink;meal.drink+=dt;if(was<.8&&meal.drink>=.8)gameAudio.effect('glugg');
  if(was<1.45&&meal.drink>=1.45&&state.clock-meal.last>1.8){meal.last=state.clock;gameAudio.say(['Ahh, godt med vann!','Glugg, glugg!','Mmm, deilig vann!'][meal.sips%3],{id:'meal'});meal.sips++;}
  if(meal.drink>=DRINK){meal.drink=-1;if(meal.bites>=BITES){nextStep();return;}if(meal.queued>0){meal.queued--;meal.bite=0;}}}
 else if(meal.step==='eat'&&meal.bite>=0){const was=meal.bite;meal.bite+=dt;if(was<.5&&meal.bite>=.5){meal.bites++;gameAudio.effect('nam');if(meal.dish&&!meal.taken){meal.taken=true;state.food=eatFood(state.food,meal.slot);saveProgress();}if(meal.bites<BITES&&state.clock-meal.last>1.8){meal.last=state.clock;gameAudio.say(['Nam!','Mmm, godt!','Nam nam!','Så godt!'][meal.bites%4],{id:'meal'});}renderBedConsole();}
  if(meal.bite>=BITE){meal.bite=-1;if(meal.drinkNext){meal.drinkNext=false;meal.drink=0;}else if(meal.bites>=BITES){nextStep();return;}else if(meal.queued>0){meal.queued--;meal.bite=0;}}}
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
const HAND={bowl:[.13,.52,.4],mouth:[.1,.88,.42],tipBowl:[-.06,-.07,.03],tipMouth:[-.08,.07,-.12],rest:[-.17,.52,.36]};
// Drinking, in her coordinates: the glass where it stands on the table and at her mouth, and where her left hand holds it (by the side nearest her on the
// table, by its left side at her mouth). Over DRINK seconds she reaches for it, lifts it, tips it more while she drinks, puts it back and lets go.
const GLASS={table:MEAL.cup.map((v,i)=>(v-SEATED[i])/.95),mouth:[0,.925,.4],gripTable:[-.05,0,-.07],gripMouth:[-.085,-.01,0]};
function drinkPose(){const k=meal.drink;if(meal.kind!=='spoon'||meal.step!=='eat'||k<0)return null;
 const up=k<.35?0:k<.8?mealEase((k-.35)/.45):k<1.4?1:k<1.8?1-mealEase((k-1.4)/.4):0,sip=k<.8||k>=1.4?0:mealEase(Math.min(1,(k-.8)/.3)),
  c=mix3(GLASS.table,[GLASS.mouth[0],GLASS.mouth[1]+.04*sip,GLASS.mouth[2]],up),g=mix3(GLASS.gripTable,GLASS.gripMouth,up),hold=c.map((v,i)=>v+g[i]),
  free=k<.35?1-mealEase(k/.35):k>=1.8?mealEase(Math.min(1,(k-1.8)/.2)):0;
 return {c,tilt:up*(.6+.4*sip),hand:mix3(hold,HAND.rest,free),held:k>=.35&&k<1.8,mouth:k>=.7&&k<1.45};}
// Her arms while she eats with the spoon: the left hand by the bowl, the right lifting the spoon to her mouth; or both hands patting her full tummy.
function spoonArms(t){const b=meal.bite,lift=b<0?0:b<.4?mealEase(b/.4):b<.6?1:b<1?1-mealEase((b-.6)/.4):0,scoop=b>=0&&b<.15?Math.sin(b/.15*Math.PI)*.05:0,yellow=SOFIA.top,skin=SOFIA.skin;
 const dish=mealDish();
 if(meal.step==='full'){const pat=state.reduced?0:Math.abs(Math.sin(meal.s*9))*.04;for(const x of [-1,1]){const h=[x*.1,.5+pat,.22];sofiaArm([x*.3,.78,0],h);}if(!dish?.hand)d('box',[.3,.47,.52],[.018,.008,.13],'#c9ced8',[0,-.4,0]);return;}
 const dp=drinkPose(),lh=dp?dp.hand:HAND.rest;sofiaArm([-.3,.78,0],lh);
 if(dp?.held)group(dp.c,[1,1,1],[-dp.tilt,0,0],glassOfWater); // tipped towards her, the top to her mouth
 const h=mix3(HAND.bowl,HAND.mouth,lift);h[1]-=scoop;sofiaArm([.3,.78,0],h);
 // pizza, the burger and sushi she eats with her fingers: a bite in her hand on its way to her mouth
 // (held above her fist and a little in front of it, so the hand does not hide it)
 if(dish?.hand){if(b>=.1&&b<.52)dishBite(dish.id,[h[0]-.04*lift,h[1]+.075,h[2]+.04]);return;}
 const tip=h.map((v,i)=>v+HAND.tipBowl[i]+(HAND.tipMouth[i]-HAND.tipBowl[i])*lift);limb(h,tip,.018,'#c9ced8');d('sphere',tip,[.05,.02,.04],'#c9ced8');
 if(b>=.1&&b<.52&&(meal.food>=0||dish))d('sphere',[tip[0],tip[1]+.02,tip[2]],[.04,.03,.035],foodColor());}
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
  else{P.o={sit:SHIN,arms:()=>spoonArms(t),mouth:st==='full'?'smile':drinkPose()?.mouth||meal.bite>=.36&&meal.bite<.58?'open':meal.bite>=.58&&meal.bite<.98?'chew':'smile'};
   if(st==='full'&&!state.reduced)P.pos=[SEATED[0],SEATED[1]+Math.abs(Math.sin(meal.s*4.5))*.05,SEATED[2]];}}
 else{const s=MEAL.stand;P.pos=[s[0],0,s[2]];P.bag='back';
  if(st==='pick'){const toBag=Math.atan2(MEAL.bag[0]-s[0],MEAL.bag[2]-s[2]),c=mealEase(Math.min(1,Math.max(0,(k-.25)/.6)));P.rot=[0,toBag*(1-mealEase(Math.max(0,(k-.3)/.6))),0];P.bag=c>=1?'back':'carry';P.carry=c;}
  if(st==='drop'){const toBag=Math.atan2(MEAL.bag[0]-s[0],MEAL.bag[2]-s[2]),c=mealEase(Math.min(1,Math.max(0,(k-.1)/.6)));P.rot=[0,toBag*mealEase(Math.min(1,k/.4)),0];P.bag=c<=0?'back':'carry';P.carry=1-c;}
  if(st==='ready')P.rot=[0,-2.5*mealEase(Math.min(1,meal.s/.7)),0];if(st==='pump')P.rot=[0,-2.5*(1-mealEase(Math.min(1,meal.s/.7))),0];
  P.tube=st==='plug'?k:st==='unplug'?1-k:['ready','pump','beep'].includes(st)?1:0;P.flow=st==='pump';P.light=st==='ready'?(Math.sin(t*6)>0?'#ffb43d':'#7a5a20'):st==='pump'?(Math.sin(t*5)>-.3?'#5be37a':'#2a7a3a'):st==='beep'?'#5be37a':null;
  if(meal.dance>=0){const c=meal.dance/1.3;P.rot=[0,state.reduced?0:mealEase(c)*Math.PI*2,0];P.pos=[s[0],(state.reduced?.4:1)*Math.sin(c*Math.PI)*.35,s[2]];P.cheer=true;}}
 return P;}
function mealSofia(t){if(!meal.kind)return false;const P=mealPose(t);
 const bag=P.bag==='back'?1:P.bag==='carry'?P.carry:0;
 group(P.pos,[.95,.95,.95],P.rot,()=>{character(t,false,P.cheer,bag?{...P.o,bag}:P.o);if(P.bag==='back')wornBag(t,P.light);if(P.tube>0)pegTube(t,P.tube,P.flow);});
 // Picking the backpack up (or putting it down): it swings from the floor to her back in an arc, turning round as it goes.
 if(P.bag==='carry'){const c=P.carry,on=sofiaPoint(P.pos,P.rot[1],BAG_ON),pos=mix3(MEAL.bag,on,c);pos[1]+=Math.sin(c*Math.PI)*.45;group(pos,[1-.05*c,1-.05*c,1-.05*c],[0,-.25+bedAngle(P.rot[1]+Math.PI+.25)*c,0],()=>pegBag(t,{worn:c>.5}));}
 sleep.pose={pos:P.pos,rot:P.rot};return true;}
// The camera glides in to the table, or to Sofia with the backpack, and still turns a little when dragged.
function mealCamera(eye,at,a,aspect){const k=mealEase(Math.min(1,meal.view));if(k<=0)return;const spoon=meal.kind?meal.kind==='spoon':meal.lastKind==='spoon',look=spoon?[-2.25,.98,2.95]:[-1.05,.9,3.1],
 dist=Math.max(aspect>2?3:3.6,1.45/(.354*aspect)),x=.25,z=1,y=.5,n=Math.hypot(x,y,z),dir=[(x*Math.cos(a)+z*Math.sin(a))/n,y/n,(z*Math.cos(a)-x*Math.sin(a))/n];
 for(let i=0;i<3;i++){eye[i]+=(look[i]+dir[i]*dist-eye[i])*k;at[i]+=(look[i]+(i===1?.12:0)-at[i])*k;}}
// ---- Taps in the room: on the table or the bowl to eat, on the backpack for food through the tube; during a meal, a tap is the next spoonful,
// starts the pump, or makes her dance with the backpack on. Anything else during a meal does nothing (the bed waits until she is done).
// A tap on the glass is a drink: at the table she drinks, and before a meal she goes to the table and drinks as soon as she has sat down. ----
// The mobile opens the phone to order food, and a dish on the trolley is eaten straight away; the table asks what she wants when she has ordered something.
function tapMeal(x,y){const onGlass=()=>!!pickTarget([{p:MEAL.cup}],x,y,o=>o.p,()=>.1,meal.kind?44:30);
 if(meal.kind){if(meal.kind==='spoon'&&onGlass())drink();else if(meal.step==='eat')takeBite();else if(meal.step==='ready')startPump();else if(meal.step==='pump')dance();return true;}
 if(mealBusy())return false;
 if(tapVacuum(x,y))return true;
 // The glass and the mobile lie close on a small screen: the one nearer the finger.
 const near=pickTarget([{k:'glass',p:MEAL.cup,r:.1},{k:'phone',p:MEAL.phone,r:.13}],x,y,o=>o.p,o=>o.r,32);
 if(near?.k==='glass'){startMeal('spoon');if(meal.kind==='spoon')meal.drinkNext=true;return true;}
 if(near?.k==='phone'){openPhone(true);return true;}
 const dish=pickTarget(cartDishes(),x,y,o=>o.p,()=>.2,38)||pickTarget(floorDishes(),x,y,o=>o.p,()=>.2,26);if(dish){startMeal('spoon',dish.id,dish.slot);return true;}
 // The table and the backpack together, so a tap between them goes to the nearer; both answer at least 56 px round them, as the backpack is small.
 const hit=pickTarget([{kind:'spoon',p:[MEAL.table[0],.62,MEAL.table[2]],r:.6},{kind:'peg',p:[MEAL.bag[0],.3,MEAL.bag[2]],r:.5}],x,y,o=>o.p,o=>o.r,56);
 if(hit){if(hit.kind==='spoon')chooseMeal(true);else startMeal('peg');return true;}
 return false;}
// ---- The console: the three everyday buttons in the room, and during a meal what she can do next ----
function mealText(){const m=meal,f=foodName(),hand=mealDish()?.hand,n=BITES-m.bites;
 if(m.kind==='spoon')return m.step==='eat'?(hand?`Sofia spiser ${f}. Trykk, så tar hun en bit. Trykk på glasset, så drikker hun. ${n} ${n===1?'bit':'biter'} igjen.`:`Sofia spiser ${f}. Trykk, så tar hun en skje. Trykk på glasset, så drikker hun. ${n} ${n===1?'skje':'skjeer'} igjen.`)
  :m.step==='full'||m.step==='up'||m.step==='back'?(m.dish?'Alt er spist. Nå er magen god og mett!':'Skåla er tom. Nå er magen god og mett!'):`Sofia setter seg ved bordet. I dag blir det ${f}.`;
 if(m.kind==='peg')return m.step==='ready'?'Slangen er koblet til knappen på magen. Trykk på sekken for å starte pumpen.':m.step==='pump'?'Pumpen går. Maten renner gjennom slangen og rett i magen. Trykk på Sofia, så danser hun med sekken på!':['beep','unplug','drop','back'].includes(m.step)?'Ferdig! Nå er magen god og mett.':'Sofia tar på seg PEG-sekken og kobler slangen til knappen på magen.';
 return '';}
// Called at the end of renderBedConsole (bedtime.js), which sets the room's own text and buttons first.
function renderRoutine(){const m=meal.kind,busy=sleep.on||sleep.jump>=0;$('routine-row').hidden=busy||!!m;$('go-outside').hidden=!!m; // during a meal «Ferdig å spise» comes first, so the buttons still fit on a low screen
 if(!m){$('meal-action').hidden=true;$('meal-done').hidden=true;$('tummy').hidden=true;return;}
 $('open-quiz').hidden=true;$('inside-progress').textContent=mealText();const a=$('meal-action'),st=meal.step;
 a.hidden=!['eat','ready','pump'].includes(st);a.textContent=st==='eat'?(mealDish()?.hand?mealDish().emoji+' En bit til':'🥄 En skje til'):st==='ready'?'▶ Start pumpen':'💃 Dans med sekken';
 $('meal-done').hidden=!(['walk','sit','eat'].includes(st)&&m==='spoon'||['walk','plug','ready','pump'].includes(st)&&m==='peg');
 const fill=m==='peg'?Math.min(1,meal.pump/PUMP+(['beep','unplug','drop','back'].includes(st)?1:0)):Math.min(1,meal.bites/BITES);$('tummy').hidden=false;$('tummy-fill').style.width=Math.round(fill*100)+'%';$('tummy').setAttribute('aria-label',`Magen er ${Math.round(fill*100)} prosent mett`);}
$('eat-spoon').onclick=()=>chooseMeal();$('eat-peg').onclick=()=>startMeal('peg');$('meal-done').onclick=finishMeal;
$('meal-action').onclick=()=>{if(meal.step==='eat')takeBite();else if(meal.step==='ready')startPump();else if(meal.step==='pump')dance();};
// ---- The white mobile and the food she orders (25 November 2026) ----
// The mobile lies on the table in plain sight, and nothing says it is there: now and then its screen lights up, as if a message came in. A tap opens
// it (the phone in index.html), and she orders pizza, a burger, sushi or an egg. The order is saved at once; a moment later the doorbell rings and the
// dish stands on a trolley at the front of the room (the trolley rolls in with the first dish, and is gone again when its food is eaten). It holds
// FOOD_CART dishes; after that they go on the floor (26 November 2026), the places nearest the trolley first (FLOOR_FOOD), until the room is full (FOOD_LIMIT,
// which nobody is told). Each dish keeps its place; a new one takes the first empty one. She walks through the food on the floor.
// «🥄 Spise» or a tap on the table asks what she wants: a dish she has ordered or the bowl as before, and a tap on a dish on the trolley or the floor eats
// that one. The dish leaves its place for good at the first bite, so a meal stopped before that leaves it there.
const DELIVERY=2.2,PHONE_SENT=1.5; // seconds from the order to the doorbell; how long the phone shows «Bestilt!» before it is put away
const deliveries=[];let phoneTimer=0; // orders on their way: {id, slot, at: when the doorbell rings (state.clock)}
// The mobile, lying flat (its top towards −z): white, with a dark screen that glows now and then, and the camera at the top.
function mobile(t){const lit=!$('phone-modal').hidden?1:state.reduced?.3:Math.pow(Math.max(0,Math.sin(t*1.3)),8);
 d('box',[0,0,0],[.062,.009,.118],'#f8f9fc');d('box',[0,.0092,.006],[.052,.0012,.098],mixHex('#1d2540','#9fd3ff',lit),[0,0,0],lit*.8);
 d('sphere',[0,.0095,-.106],[.007,.002,.007],'#2a2f3a');}
// A slice of pizza (a fifth of a round), a mesh of its own: the tip at the middle, the crust towards +z, y from −1 to 1. Made the first time it is drawn.
function sliceData(){const out=[],seg=6,w=Math.PI*2/5,a0=-w/2,P=(a,y)=>[Math.sin(a),y,Math.cos(a)];
 const tri=(a,b,c)=>{const n=norm(cross(sub(b,a),sub(c,a)));for(const q of [a,b,c])out.push(...q,...n);};
 for(let i=0;i<seg;i++){const a=a0+i*w/seg,b=a0+(i+1)*w/seg;tri([0,1,0],P(a,1),P(b,1));tri([0,-1,0],P(b,-1),P(a,-1));tri(P(a,-1),P(b,-1),P(b,1));tri(P(a,-1),P(b,1),P(a,1));}
 tri([0,-1,0],P(a0,1),[0,1,0]);tri([0,-1,0],P(a0,-1),P(a0,1));tri([0,-1,0],[0,1,0],P(-a0,1));tri([0,-1,0],P(-a0,1),P(-a0,-1));return out;}
function sliceMesh(){if(!renderer.meshes.slice)renderer.setMesh('slice',sliceData());}
// A dish, standing on the table (y = 0) with its middle at the origin; left: how much is left (1 whole, 0 eaten). Pizza: five slices, one fewer each
// bite. The burger gets smaller. Sushi: five pieces on a board, maki and nigiri, eaten from her right. The egg: soft-boiled in a yellow egg cup, eaten
// from the top with the spoon, the yolk showing once it is opened.
function dishModel(id,left,t){const n=Math.ceil(BITES*left-1e-6);
 if(id==='pizza'){sliceMesh();d('cylinder',[0,.006,0],[.2,.006,.2],'#ffffff');
  for(let i=0;i<n;i++){const a=i*Math.PI*2/5+.3;group([Math.sin(a)*.006,.012,Math.cos(a)*.006],[1,1,1],[0,a,0],()=>{d('slice',[0,.009,0],[.175,.009,.175],'#dc9a4c');d('slice',[0,.019,.004],[.15,.003,.15],'#f7c948');
   for(const [x,z] of [[.026,.11],[-.022,.066],[-.03,.13]])d('cylinder',[x,.023,z],[.02,.002,.02],'#c8382b');});}}
 else if(id==='burger'){if(n){d('cylinder',[0,.006,0],[.16,.006,.16],'#ffffff');const k=.4+.6*left;group([0,.012,0],[k,k,k],[0,0,0],()=>{
  d('cylinder',[0,.02,0],[.115,.02,.115],'#d7934a');d('cylinder',[0,.05,0],[.122,.014,.122],'#6b3b22');d('box',[0,.066,0],[.088,.003,.088],'#ffc93a',[0,.7,0]);
  d('cylinder',[0,.071,0],[.128,.004,.128],'#6cc04a');d('cylinder',[0,.079,0],[.1,.004,.1],'#e5483a');d('sphere',[0,.083,0],[.12,.072,.12],'#e7a556');
  for(let i=0;i<7;i++){const a=i*2.4,r=.03+.05*(i%3)/2;d('sphere',[Math.cos(a)*r,.083+.072*Math.sqrt(1-(r/.12)**2),Math.sin(a)*r],[.01,.004,.006],'#fff4d6',[0,a,0]);}});}
  else d('cylinder',[0,.006,0],[.16,.006,.16],'#ffffff');}
 else if(id==='sushi'){d('box',[0,.012,0],[.21,.012,.075],'#8a5a34');for(const x of [-.17,.17])d('box',[x,-.004,0],[.02,.006,.07],'#6f4527');
  for(let i=0;i<n;i++)sushiPiece([-.15+i*.075,.024,0],i);}
 else if(id==='egg'){d('cylinder',[0,.005,0],[.08,.005,.08],'#ffffff');d('cylinder',[0,.022,0],[.03,.014,.03],'#ffd23f');d('cylinder',[0,.056,0],[.046,.022,.046],'#ffd23f');
  if(n){const h=.068*(.35+.65*left);d('sphere',[0,.07,0],[.043,h,.043],'#fff6e6');if(left<1)d('sphere',[0,.07+h-.005,0],[.026,.008,.026],'#ffb81c');}}}
// One piece of sushi standing on y: a maki roll (seaweed round rice with salmon in the middle) or a nigiri (rice with a slice of salmon over it).
function sushiPiece([x,y,z],i){if(i%2===0){d('cylinder',[x,y+.026,z],[.031,.026,.031],'#1f3a2a');d('cylinder',[x,y+.053,z],[.026,.002,.026],'#fbfbf5');d('cylinder',[x,y+.0545,z],[.011,.002,.011],'#ff8a5c');}
 else{d('box',[x,y+.016,z],[.024,.016,.042],'#fbfbf5');d('box',[x,y+.037,z],[.028,.006,.048],'#ff8a5c');for(const k of [-1,1])d('box',[x,y+.0435,z+k*.016],[.029,.0008,.003],'#ffd3bd');}}
// A bite on its way to her mouth, in her hand (in her coordinates): a slice of pizza standing up with its tip towards her mouth and the cheese to the room,
// a little burger, or a piece of sushi.
function dishBite(id,[x,y,z]){if(id==='pizza'){sliceMesh();group([x,y+.04,z],[1,1,1],[Math.PI/2-.25,0,0],()=>{d('slice',[0,0,0],[.075,.007,.075],'#dc9a4c');d('slice',[0,.005,.004],[.064,.003,.064],'#f7c948');
  for(const [px,pz,r] of [[0,.05,.012],[.012,.028,.009]])d('cylinder',[px,.009,pz],[r,.002,r],'#c8382b');});}
 else if(id==='burger'){d('sphere',[x,y+.014,z],[.042,.03,.042],'#e7a556');d('cylinder',[x,y-.008,z],[.045,.009,.045],'#6b3b22');d('cylinder',[x,y-.022,z],[.04,.008,.04],'#d7934a');}
 else if(id==='sushi')sushiPiece([x,y-.028,z],BITES-meal.bites);}
// The dishes there are to see, each in its place: not those still on their way, nor the one on the table, nor the one the robot vacuum is sucking up.
let suckingSlot=-1;
function shownFood(from,to){const out=[];for(let slot=from;slot<Math.min(to,state.food.length);slot++){const id=state.food[slot];
 if(id&&slot!==suckingSlot&&!deliveries.some(o=>o.slot===slot)&&!(meal.kind==='spoon'&&meal.dish&&!meal.taken&&meal.slot===slot))out.push({id,slot});}return out;}
// On the trolley: places 0–5, the top shelf first.
function cartDishes(){const [cx,,cz]=MEAL.cart;return shownFood(0,FOOD_CART).map(o=>{const base=[cx+(o.slot%3-1)*.4,o.slot<3?.605:.24,cz];return {...o,base,p:[base[0],base[1]+.07,base[2]]};});}
// On the floor: the places after those, in FLOOR_FOOD (on the rug a little higher).
function floorDishes(){return shownFood(FOOD_CART,FOOD_LIMIT).map(o=>{const f=FLOOR_FOOD[o.slot-FOOD_CART];return {...o,base:[f.x,f.y,f.z],yaw:f.yaw,p:[f.x,f.y+.07,f.z]};});}
// The trolley: white shelves with a mint rim, grey legs on little wheels and a pink handle; there while it has food on it, or while she eats a dish from it.
function foodCart(t){const items=cartDishes();if(!items.length&&!(mealDish()&&meal.slot<FOOD_CART))return;const [cx,,cz]=MEAL.cart,white='#fdfbf7',mint='#79e4e2',steel='#c9ced8';
 d('box',[cx,.58,cz],[.62,.025,.26],white);for(const k of [-1,1]){d('box',[cx,.615,cz+k*.255],[.62,.012,.01],mint);d('box',[cx+k*.615,.615,cz],[.01,.012,.26],mint);}
 d('box',[cx,.22,cz],[.6,.02,.24],white);
 for(const [x,z] of [[-.58,-.22],[.58,-.22],[-.58,.22],[.58,.22]]){d('cylinder',[cx+x,.34,cz+z],[.022,.27,.022],steel);d('sphere',[cx+x,.05,cz+z],[.05,.05,.05],'#3a3a40');}
 for(const k of [-1,1])d('box',[cx+.64,.7,cz+k*.2],[.014,.1,.014],steel);d('box',[cx+.66,.8,cz],[.022,.022,.24],'#ff9ec4');
 for(const o of items)group(o.base,[.85,.85,.85],[0,0,0],()=>dishModel(o.id,1,t));}
// ---- The food on the floor, as one mesh per colour ----
// A floor full of food is close to two hundred dishes of a dozen pieces or more: drawn one piece at a time that would be thousands of draws each frame.
// So the floor's dishes are made into one mesh per colour (as the brushing stars are), again only when a dish comes or goes. bakeShapes: the engine's
// shapes (box, sphere, cylinder) and the pizza slice, a little coarser; each triangle wound so that it faces out (the software renderer drops the back).
// The floor is made in pieces of FLOOR_CHUNK places, so a dish that goes (the robot vacuum takes one every half second) makes only its own piece again.
const FLOOR_CHUNK=32;let bakeShapes=null,floorBuilt=[];
function shapes(){if(bakeShapes)return bakeShapes;
 const tri=(out,a,b,c,na,nb,nc,o)=>{if(dot(cross(sub(b,a),sub(c,a)),o)<0){[b,c]=[c,b];[nb,nc]=[nc,nb];}out.push(...a,...na,...b,...nb,...c,...nc);};
 const flat=(out,a,b,c,n)=>tri(out,a,b,c,n,n,n,n),quad=(out,a,b,c,e,n)=>{flat(out,a,b,c,n);flat(out,a,c,e,n);};
 const box=[];for(const [ax,s] of [[0,1],[0,-1],[1,1],[1,-1],[2,1],[2,-1]]){const n=[0,0,0];n[ax]=s;const u=(ax+1)%3,v=(ax+2)%3,P=(i,j)=>{const p=[0,0,0];p[ax]=s;p[u]=i;p[v]=j;return p;};quad(box,P(-1,-1),P(1,-1),P(1,1),P(-1,1),n);}
 const sphere=(R,C)=>{const out=[],pt=(i,j)=>{const t=i*Math.PI/R,q=j*Math.PI*2/C;return [Math.sin(t)*Math.cos(q),Math.cos(t),Math.sin(t)*Math.sin(q)];};
  for(let i=0;i<R;i++)for(let j=0;j<C;j++){const a=pt(i,j),b=pt(i+1,j),c=pt(i+1,j+1),e=pt(i,j+1),m=norm(a.map((v,k)=>v+b[k]+c[k]+e[k]));tri(out,a,b,c,a,b,c,m);tri(out,a,c,e,a,c,e,m);}return out;};
 const cylinder=S=>{const out=[];for(let i=0;i<S;i++){const q0=i*Math.PI*2/S,q1=(i+1)*Math.PI*2/S,c0=[Math.cos(q0),0,Math.sin(q0)],c1=[Math.cos(q1),0,Math.sin(q1)],o=norm([c0[0]+c1[0],0,c0[2]+c1[2]]);
  tri(out,[c0[0],-1,c0[2]],[c1[0],-1,c1[2]],[c1[0],1,c1[2]],c0,c1,c1,o);tri(out,[c0[0],-1,c0[2]],[c1[0],1,c1[2]],[c0[0],1,c0[2]],c0,c1,c0,o);
  flat(out,[0,1,0],[c0[0],1,c0[2]],[c1[0],1,c1[2]],[0,1,0]);flat(out,[0,-1,0],[c1[0],-1,c1[2]],[c0[0],-1,c0[2]],[0,-1,0]);}return out;};
 // the small pieces (pepperoni, sesame seeds, the salmon in a roll) coarser still: on the floor they are a few pixels across
 return bakeShapes={box,sphere:sphere(6,10),cylinder:cylinder(10),sphereSmall:sphere(3,5),cylinderSmall:cylinder(6),slice:sliceData()};}
// The pieces of the given dishes (dishModel, run with d and group recording instead of drawing), by colour: Map colour → [x,y,z,nx,ny,nz, …].
function bakeDishes(items){const base=shapes(),by=new Map(),stack=[M.identity()],drawD=d,drawGroup=group;
 const record=(mesh,p,s,c,r=[0,0,0])=>{const data=Math.max(...s)<.035&&base[mesh+'Small']||base[mesh];if(!data)return;const m=M.mul(stack.at(-1),M.model(p,s,r));let out=by.get(c);if(!out)by.set(c,out=[]);
  for(let i=0;i<data.length;i+=6){const x=data[i],y=data[i+1],z=data[i+2],nx=data[i+3]/s[0],ny=data[i+4]/s[1],nz=data[i+5]/s[2];
   out.push(m[0]*x+m[4]*y+m[8]*z+m[12],m[1]*x+m[5]*y+m[9]*z+m[13],m[2]*x+m[6]*y+m[10]*z+m[14]);const n=norm([m[0]*nx+m[4]*ny+m[8]*nz,m[1]*nx+m[5]*ny+m[9]*nz,m[2]*nx+m[6]*ny+m[10]*nz]);out.push(...n);}};
 const nest=(p,s,r,fn)=>{stack.push(M.mul(stack.at(-1),M.model(p,s,r)));try{fn();}finally{stack.pop();}};
 d=record;group=nest;try{for(const o of items)nest(o.base,[.9,.9,.9],[0,o.yaw,0],()=>dishModel(o.id,1,0));}finally{d=drawD;group=drawGroup;}
 return by;}
function floorFood(){const items=floorDishes(),chunks=[];for(const o of items)(chunks[Math.floor((o.slot-FOOD_CART)/FLOOR_CHUNK)]??=[]).push(o);
 for(let c=0;c<Math.ceil(FLOOR_FOOD.length/FLOOR_CHUNK);c++){const list=chunks[c]||[],key=list.map(o=>o.slot+o.id).join(),b=floorBuilt[c]??={key:'',colours:[]};
  if(key!==b.key){b.colours.forEach((col,k)=>renderer.setMesh(`floorFood${c}_${k}`,[]));b.key=key;b.colours=[...bakeDishes(list)].map(([colour,data],k)=>{renderer.setMesh(`floorFood${c}_${k}`,data);return colour;});}
  b.colours.forEach((col,k)=>{const name=`floorFood${c}_${k}`;if(renderer.meshes[name])renderer.draw(name,[0,0,0],[1,1,1],col);});}}
// The doorbell for each order that has come: «Ding dong!», sparkles where it stands, on the trolley or the floor.
function updateOrders(){for(let i=deliveries.length-1;i>=0;i--){const o=deliveries[i];if(state.clock<o.at)continue;deliveries.splice(i,1);const dish=dishById(o.id),spot=[...cartDishes(),...floorDishes()].find(c=>c.slot===o.slot);
 gameAudio.effect('doorbell');if(spot)burst(spot.p,['#ffde71','#ffffff','#ff9ec4','#79e4e2'],14,1.5,{size:.06});
 gameAudio.say(`Ding dong! Her kommer ${dish.the}.`+(o.slot<FOOD_CART?' Maten står på trillebordet.':' Trillebordet er fullt, så maten står på gulvet.'),{id:'food',queue:true});notify(dish.emoji+' '+dish.word+' er levert!');}}
// The phone: the menu with a button for each dish, «Bestilt!» while the order is sent, how much there is (never how much there may be), and a note
// when the room is full.
function renderPhone(){const full=foodSlot(state.food)<0,cart=foodCount(state.food.slice(0,FOOD_CART)),floor=foodCount(state.food)-cart;$('phone-full').hidden=!full;
 for(const b of $('order-grid').children)b.disabled=full;$('phone-count').textContent=cart+floor?`På trillebordet: ${cart}`+(floor?` · På gulvet: ${floor}`:''):'';}
// A window opened by a tap in the room opens as the finger goes down (pointerdown); the click that follows when it is lifted would land in the window,
// on a button or on the shade round it. So the window ignores the finger until it is lifted (and a moment more), or for 1.5 s at most.
function guardTap(el){el.style.pointerEvents='none';let timer=0;const up=()=>{removeEventListener('pointerup',up,true);clearTimeout(timer);timer=setTimeout(()=>el.style.pointerEvents='',350);};
 addEventListener('pointerup',up,true);timer=setTimeout(up,1500);}
function openPhone(fromTap=false){if(state.mode!=='inside'||mealBusy()||!$('phone-modal').hidden)return;clearTimeout(phoneTimer);$('phone-menu').hidden=false;$('phone-sent').hidden=true;renderPhone();
 dialog('phone-modal',true);if(fromTap)guardTap($('phone-modal'));gameAudio.effect('phone');
 gameAudio.say(foodSlot(state.food)<0?'Nå er det ikke mer plass til mat i rommet. Spis litt av maten først!':'Mobilen! Hva vil du bestille? Pizza, burger, sushi eller egg?',{id:'food'});}
function closePhone(){clearTimeout(phoneTimer);if(!$('phone-modal').hidden)dialog('phone-modal',false);}
function orderDish(id){const dish=dishById(id);if(!dish||$('phone-modal').hidden||!$('phone-sent').hidden)return;
 const slot=foodSlot(state.food);if(slot<0){renderPhone();gameAudio.say('Nå er det ikke mer plass til mat i rommet. Spis litt av maten først!',{id:'food'});return;}
 state.food=orderFood(state.food,id);saveProgress();deliveries.push({id,slot,at:state.clock+DELIVERY});gameAudio.effect('order');
 gameAudio.say(`${dish.word} er bestilt! Maten er på vei.`,{id:'food'});
 $('sent-emoji').textContent=dish.emoji;$('sent-what').textContent=dish.word;$('phone-menu').hidden=true;$('phone-sent').hidden=false;phoneTimer=setTimeout(closePhone,PHONE_SENT*1000);}
// Eating: with nothing ordered she eats from the bowl as before; otherwise she chooses, each dish she has once (with how many) and the bowl last.
function chooseMeal(fromTap=false){if(state.mode!=='inside'||mealBusy())return;const list=foodChoices(state.food);if(!list.length){startMeal('spoon');return;}
 const box=$('dish-choices'),pick=dish=>{dialog('dish-modal',false);startMeal('spoon',dish);};box.replaceChildren();
 for(const d of [...list,{id:null,emoji:'🥣',word:'Skåla',n:0}]){const b=document.createElement('button');b.type='button';b.className='dish-choice'+(d.id?'':' bowl');
  b.innerHTML=`<span class="dish-emoji" aria-hidden="true">${d.emoji}</span><b>${d.word}</b>`+(d.n>1?`<small>× ${d.n}</small>`:d.id?'':`<small>${FOODS[(meal.food+1)%FOODS.length].name}</small>`);
  b.setAttribute('aria-label',d.id?`${d.word}${d.n>1?', '+d.n:''}`:`Skåla: ${FOODS[(meal.food+1)%FOODS.length].name}`);b.onclick=()=>pick(d.id);box.append(b);}
 dialog('dish-modal',true);if(fromTap)guardTap($('dish-modal'));tone(420,.08);gameAudio.say('Hva vil du spise?',{id:'meal'});}
for(const d of DISHES){const b=document.createElement('button');b.type='button';b.className='order';b.innerHTML=`<span aria-hidden="true">${d.emoji}</span><b>${d.word}</b>`;b.onclick=()=>orderDish(d.id);$('order-grid').append(b);}
$('phone-close').onclick=closePhone;$('phone-modal').onclick=e=>{if(e.target===e.currentTarget)closePhone();};$('close-dishes').onclick=()=>dialog('dish-modal',false);
// ---- Tooth brushing: the game in teeth.js on its own canvas over the room. A star on the chart when the teeth are clean. ----
let toothGame=null;
const TEETH_TEXT={paste:['Tannkrem først','Trykk på tuben, så kommer det tannkrem på tannbørsten.'],brush:['Puss alle tennene','Dra tannbørsten fram og tilbake over tennene, både oppe og nede. Husk de bakerste!'],
 rinse:['Skyll munnen','Trykk på koppen med vann.'],done:['Så rene tenner!','Du pusset kjempebra. Stjernen kommer på tannpusskartet.']};
function startBrushing(){if(state.mode!=='inside'||mealBusy())return;
 if(!toothGame)toothGame=createToothGame({canvas:$('teeth'),reduced:()=>state.reduced,skin:SOFIA.skin,hair:SOFIA.hair,say:text=>gameAudio.say(text,{id:'teeth'}),
  sound:(name,i)=>name==='ding'?gameAudio.note(i||0):name==='done'?gameAudio.effect('fanfare'):name==='tap'?gameAudio.effect('oops'):gameAudio.effect(name),
  onStep:step=>{const [h,p]=step==='done'&&state.brushed>=10?['Så rene tenner!','Du pusset kjempebra. Stjernen kommer på veggen.']:TEETH_TEXT[step]||['Tannpuss',''];$('teeth-title').textContent=h;$('teeth-tip').textContent=p;},onDone:brushed});
 state.mode='teeth';state.dragging=false;showConsole('teeth');$('teeth').hidden=false;$('app').classList.add('brushing');$('world-hint').hidden=true;
 scene.setAttribute('aria-label','Tannpuss. Sofias munn er vid åpen. Puss alle tennene til de skinner.');tone(520,.08);toothGame.start();}
// After ten the chart is full, and the stars go on the walls (brushWall).
function brushed(){state.brushed++;saveProgress();progressChanged();stopBrushing();const n=state.brushed;
 notify(n<=10?'🪥 En ny stjerne på tannpusskartet!':n===11?'🪥 Kartet er fullt! Nå kommer stjernene på veggen.':'🪥 En ny stjerne på veggen!');
 gameAudio.say(n<=10?`Så flink du er, Sofia! Nå har du ${n} ${n===1?'stjerne':'stjerner'} på tannpusskartet.`:n===11?'Så flink du er, Sofia! Tannpusskartet er fullt, så nå kommer stjernene på veggen. Nå har du 11 stjerner!'
  :`Så flink du er, Sofia! Nå har du ${n} stjerner på veggene.`,{id:'teeth'});}
// Back to the room (the «Tilbake» button, Esc, or clean teeth). quiet: when the room itself is reset, nothing to say.
function stopBrushing(quiet=false){if(!toothGame||!toothGame.running&&state.mode!=='teeth'){$('app').classList.remove('brushing');return;}toothGame.stop();$('teeth').hidden=true;$('app').classList.remove('brushing');
 if(state.mode==='teeth'){state.mode='inside';showConsole('inside');$('world-hint').hidden=false;insideTitle();if(!quiet)gameAudio.stopSpeech();}}
$('brush-teeth').onclick=startBrushing;$('teeth-done').onclick=()=>stopBrushing();
$('teeth-speak').onclick=()=>{const s=toothGame?.step;gameAudio.say((TEETH_TEXT[s]||TEETH_TEXT.paste)[1],{force:true,id:'teeth'});};
