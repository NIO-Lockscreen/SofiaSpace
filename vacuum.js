/* The robot vacuum in Sofia's room (26 November 2026). The user: «vi har en svart roborock støvsuger med dock. Vi har anime øyne klistermerke på den.
   legge den i rommet og hvis man trykker på den så starter den å støvsuge opp all maten. Hvis man starter støvsugeren og går ut av huset så kommer man inn
   til rent hus.»
   A round black robot vacuum with a laser tower on top, standing in its black dock against the back wall under the planets, with an anime-eyes sticker on
   its lid («legg øyne på toppen av støvsugeren»): two big eyes with purple irises, shiny highlights and a thick line of lashes, looking forward. A tap on it, and it drives out of the dock and goes from dish to
   dish on the floor (always the nearest next), sucking each one up with a slurp, until the floor is clean; then it drives home, turns round and backs into the
   dock. A tap while it runs sends it home. With nothing on the floor it takes a little round of the rug. It cleans the floor only: the trolley's dishes stay.
   If Sofia goes out of the house while it runs, the floor is clean when she comes in again (vacuumAway, from resetMeal), and the voice says so.
   It drives straight, under the table and the bed as real ones do; she and the food on the floor are no obstacles to it. */
// Where things are: the dock (the middle of the robot in it; the tower is behind it, against the wall), the spot in front of it where it turns, its size
// (radius, the top's height), its speed (m/s), how fast it turns (rad/s), and how long a dish takes to suck up (s).
const VAC={dock:[-2.6,0,-2.73],out:[-2.6,0,-2.05],r:.28,h:.115,speed:2.2,turn:9,suck:.2,
 round:[[-2.6,0,-.9],[-2.6,0,2.75],[1.6,0,2.75],[1.6,0,-.9],[-2.6,0,-2.05]]}; // a little round of the rug, back to the spot in front of the dock
// mode: 'dock', 'out' (driving out), 'clean', 'round', 'home' (to the spot in front of the dock), 'back' (backing in); target: the place of the dish it is going
// to; suck: the dish it is sucking up {slot, id, t, base, yaw}; stop: a tap asked it home; cleaned: dishes so far; away: it cleaned while she was out.
const vac={mode:'dock',x:VAC.dock[0],z:VAC.dock[2],yaw:0,target:-1,suck:null,stop:false,round:[],cleaned:0,hum:0,brush:0,away:false};
const vacTurn=(a,b)=>Math.atan2(Math.sin(b-a),Math.cos(b-a));
// Drive towards p: turn first, then go forward (or backwards, reverse). Returns true when there.
function vacDrive(p,dt,reverse=false,near=.04){const dx=p[0]-vac.x,dz=p[2]-vac.z,dist=Math.hypot(dx,dz);if(dist<near)return true;
 const want=Math.atan2(dx,dz)+(reverse?Math.PI:0),turn=vacTurn(vac.yaw,want);vac.yaw+=Math.sign(turn)*Math.min(Math.abs(turn),VAC.turn*dt);
 if(Math.abs(turn)<.35){const step=Math.min(dist,VAC.speed*(reverse?.5:1)*dt);vac.x+=dx/dist*step;vac.z+=dz/dist*step;}return dist-VAC.speed*dt<near&&Math.abs(turn)<.35;}
// The nearest dish on the floor (floorDishes in routines.js: not those on their way, nor one on the table).
function vacNearest(){let best=null,d=Infinity;for(const o of floorDishes()){const e=Math.hypot(o.base[0]-vac.x,o.base[2]-vac.z);if(e<d){d=e;best=o;}}return best;}
function startVacuum(){if(vac.mode!=='dock')return;const any=floorDishes().length>0;Object.assign(vac,{mode:'out',target:-1,suck:null,stop:false,cleaned:0,hum:0,round:any?[]:VAC.round.map(p=>[...p])});
 gameAudio.effect('robot');gameAudio.say(any?'Støvsugeren starter! Den suger opp all maten på gulvet.':'Gulvet er rent allerede, men støvsugeren tar en liten runde.',{id:'vacuum'});}
function homeVacuum(){if(vac.mode==='dock'||vac.stop)return;vac.stop=true;gameAudio.effect('robot');gameAudio.say('Støvsugeren kjører hjem til laderen.',{id:'vacuum'});}
function updateVacuum(dt){if(vac.mode==='dock')return;vac.brush+=dt*(vac.mode==='back'?4:16);vac.hum-=dt;if(vac.hum<=0){vac.hum=.45;gameAudio.effect('vacuum');}
 if(vac.suck){vac.suck.t+=dt;if(vac.suck.t>=VAC.suck){state.food=eatFood(state.food,vac.suck.slot);saveProgress();vac.cleaned++;vac.suck=null;suckingSlot=-1;}return;}
 if(vac.mode==='out'){if(vacDrive(VAC.out,dt))vac.mode=vac.round.length?'round':'clean';return;}
 if(vac.mode==='clean'){if(vac.stop){vac.mode='home';return;}
  let dish=floorDishes().find(o=>o.slot===vac.target);if(!dish){dish=vacNearest();vac.target=dish?dish.slot:-1;}if(!dish){vac.mode='home';return;}
  if(vacDrive(dish.base,dt,false,.05)){vac.suck={slot:dish.slot,id:dish.id,t:0,base:dish.base,yaw:dish.yaw};suckingSlot=dish.slot;vac.target=-1;gameAudio.effect('slurp');}return;}
 if(vac.mode==='round'){if(vac.stop||!vac.round.length){vac.mode='home';return;}if(vacDrive(vac.round[0],dt,false,.08))vac.round.shift();return;}
 if(vac.mode==='home'){if(vacDrive(VAC.out,dt))vac.mode='back';return;}
 // backing into the dock: facing out of it, as it stands there
 if(vac.mode==='back'&&vacDrive(VAC.dock,dt,true,.02)){Object.assign(vac,{mode:'dock',x:VAC.dock[0],z:VAC.dock[2],yaw:0});gameAudio.effect('robot');
  gameAudio.say(vac.cleaned?'Ferdig! Nå er gulvet rent, og støvsugeren står i laderen igjen.':'Støvsugeren er tilbake i laderen.',{id:'vacuum'});}}
// A tap on the robot (or its dock): start it, or send it home.
function tapVacuum(x,y){if(state.mode!=='inside')return false;const hit=pickTarget([{p:[vac.x,.12,vac.z],r:VAC.r},{p:[VAC.dock[0],.3,VAC.dock[2]-.42],r:.25}],x,y,o=>o.p,o=>o.r,34);
 if(!hit)return false;if(vac.mode==='dock')startVacuum();else homeVacuum();return true;}
// Out of the house while it runs (or the room is reset): it finishes the floor at once and is back in its dock; she is told when she comes in.
function vacuumAway(){suckingSlot=-1;if(vac.mode==='dock')return;const had=floorDishes().length>0||!!vac.suck;state.food=clearFloor(state.food);saveProgress();
 Object.assign(vac,{mode:'dock',x:VAC.dock[0],z:VAC.dock[2],yaw:0,target:-1,suck:null,stop:false,round:[],away:vac.away||had});}
function vacuumWelcome(){if(!vac.away)return;vac.away=false;gameAudio.say('Mens du var ute, har støvsugeren støvsuget opp all maten på gulvet.',{id:'vacuum',queue:true});}
// ---- The robot and its dock ----
// The robot in its own coordinates: the middle of its bottom at the origin, the front towards +z.
function robotModel(t){const black='#1b1d22',lid='#2a2d34',dark='#111216',grey='#4a4e57',r=VAC.r,running=vac.mode!=='dock',spin=state.reduced?0:vac.brush;
 d('cylinder',[0,.06,0],[r,.05,r],black);d('cylinder',[0,.112,0],[r-.018,.004,r-.018],lid);
 // the bumper round the front half, a little darker
 for(let i=-4;i<=4;i++){const a=i*.34;d('box',[Math.sin(a)*(r+.004),.055,Math.cos(a)*(r+.004)],[.038,.035,.008],dark,[0,a,0]);}
 // the laser tower towards the back, its little window turning while it runs
 d('cylinder',[0,.14,-.07],[.075,.026,.075],'#15161a');d('cylinder',[0,.167,-.07],[.068,.003,.068],lid);
 d('box',[Math.sin(spin*.6)*.073,.142,-.07+Math.cos(spin*.6)*.073],[.022,.01,.004],'#3a6fd8',[0,spin*.6,0],running?.7:.2);
 // two buttons and a light: cyan while it runs, dim white at home
 d('box',[-.035,.117,.07],[.014,.003,.022],grey);d('box',[.035,.117,.07],[.014,.003,.022],grey);d('sphere',[0,.118,.105],[.012,.003,.012],running?'#79e4e2':'#cfd3da',[],running?1:.3);
 // the side brush at the front left, turning
 for(let k=0;k<3;k++){const a=spin+k*2.09;d('box',[-.17+Math.sin(a)*.05,.012,.17+Math.cos(a)*.05],[.004,.003,.05],'#8a8f99',[0,a,0]);}
 // The anime-eyes sticker on the lid, in front of the laser tower (made up: the real sticker's look is not known): each eye a tall oval with its top towards
 // the back, so the robot looks forward; a purple iris low in it, a dark pupil, two shiny highlights, and a thick line of lashes along the top with a flick
 // at the outer corner. A little bigger than a real sticker, as the room is seen from low down.
 for(const s of [-1,1])group([s*.085,.1165,.1],[1,1,1],[0,0,0],()=>{
  d('sphere',[0,0,0],[.062,.0025,.08],'#ffffff');d('sphere',[0,.0005,.016],[.046,.003,.058],'#7b4fe0');d('sphere',[0,.001,.024],[.036,.0035,.04],'#4a2aa8');
  d('sphere',[0,.0015,.018],[.019,.004,.025],'#140c2e');d('sphere',[-s*.015,.002,-.012],[.013,.0045,.013],'#ffffff',[],.6);d('sphere',[s*.016,.002,.042],[.006,.0045,.006],'#ffffff',[],.6);
  d('box',[0,.0015,-.075],[.066,.003,.007],'#0d0d12',[0,s*.12,0]);d('box',[s*.068,.0015,-.06],[.018,.003,.006],'#0d0d12',[0,-s*.6,0]);});}
// The dock: a black tower against the wall with a darker front and a light, and a ramp on the floor in front that the robot stands on.
function dockModel(){const [x,,z]=VAC.dock,back=z-VAC.r-.17;d('box',[x,.26,back],[.24,.26,.13],'#16171b');d('box',[x,.525,back],[.245,.012,.135],'#2a2d34');
 d('box',[x,.33,back+.132],[.17,.12,.004],'#0f1013');d('sphere',[x,.4,back+.136],[.014,.014,.004],vac.mode==='dock'?'#79e4e2':'#3a3d45',[],vac.mode==='dock'?1:.2);
 d('box',[x,.006,z-.06],[.3,.006,.3],'#24262c');}
function vacuumScene(t){dockModel();group([vac.x,0,vac.z],[1,1,1],[0,vac.yaw,0],()=>robotModel(t));
 // the dish it is sucking up: smaller and smaller, drawn into the robot
 const s=vac.suck;if(s){const k=Math.min(1,s.t/VAC.suck),e=k*k;group([s.base[0]+(vac.x-s.base[0])*e,s.base[1]+.03*Math.sin(k*Math.PI),s.base[2]+(vac.z-s.base[2])*e],[.9*(1-e),.9*(1-e),.9*(1-e)],[0,s.yaw+k*3,0],()=>dishModel(s.id,1,t));}}
