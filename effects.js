/* Shared play effects: tapping things in 3D, sparkles and confetti, comets and the asteroid belt. */
const FOCAL=1/Math.tan(.34);
const fx={rocketWorld:[0,0,0],jump:0,wiggle:0,comet:null,cometTimer:12,cometsSeen:0,rocks:[],trail:0,space:false,nebulaKey:''};
const sparks=[];
const rand=(a,b)=>a+Math.random()*(b-a);
function shade(hex,k){return '#'+rgb(hex).map(v=>Math.round(v*255*k).toString(16).padStart(2,'0')).join('');}
// Where a point in the last drawn frame lands on the screen, in CSS pixels from the canvas corner.
function toScreen(p){const v=renderer?.vp;if(!v)return null;const x=v[0]*p[0]+v[4]*p[1]+v[8]*p[2]+v[12],y=v[1]*p[0]+v[5]*p[1]+v[9]*p[2]+v[13],w=v[3]*p[0]+v[7]*p[1]+v[11]*p[2]+v[15];if(w<.2)return null;return {x:(x/w*.5+.5)*scene.clientWidth,y:(.5-y/w*.5)*scene.clientHeight,w};}
function screenRadius(r,w){return r*FOCAL*scene.clientHeight/2/w;}
// The closest thing under a finger. Small hands get generous targets.
function pickTarget(list,x,y,at,radius,min=40){let best=null,score=1;for(const item of list){const s=toScreen(at(item));if(!s)continue;const r=Math.max(min,screenRadius(radius(item),s.w)*1.3),dist=Math.hypot(s.x-x,s.y-y)/r;if(dist<score){score=dist;best=item;}}return best;}

function burst(p,colors,n=14,power=2.4,opts={}){if(state.reduced)n=Math.ceil(n/2);if(renderer?.software)n=Math.min(n,8);
 for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,z=Math.random()*2-1,h=Math.sqrt(1-z*z),sp=power*rand(.45,1);
  sparks.push({p:[...p],v:[Math.cos(a)*h*sp,z*sp+(opts.lift||0),Math.sin(a)*h*sp],age:0,life:(opts.life||.8)*rand(.7,1.3),color:colors[i%colors.length],size:(opts.size||.09)*rand(.6,1.4),mesh:opts.mesh||'star',gravity:opts.gravity||0,drag:opts.drag??1.8,spin:rand(-5,5),glow:opts.glow??1});}}
// Paper confetti tumbles down; the stars keep glowing.
function confetti(center,radius,n=40){const colors=['#ff76ba','#ffde71','#79e4e2','#ba95ff','#ff9e6e','#8fe38f'];if(state.reduced)n=Math.ceil(n/3);if(renderer?.software)n=Math.min(n,16);
 for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,z=rand(-.2,1),h=Math.sqrt(1-z*z),sp=rand(2,4.2),star=i%4===0;
  sparks.push({p:[center[0]+Math.cos(a)*h*radius,center[1]+z*radius,center[2]+Math.sin(a)*h*radius],v:[Math.cos(a)*h*sp,z*sp+1.5,Math.sin(a)*h*sp],age:0,life:rand(1.6,2.6),color:colors[i%colors.length],size:star?.14:.13,mesh:star?'star':'box',gravity:star?.6:2.4,drag:1.1,spin:rand(-7,7),glow:star?1:.35});}}
function updateSparks(dt){for(let i=sparks.length-1;i>=0;i--){const s=sparks[i];s.age+=dt;if(s.age>=s.life){sparks.splice(i,1);continue;}const k=Math.exp(-s.drag*dt);s.v[1]-=s.gravity*dt;for(let j=0;j<3;j++){s.v[j]*=k;s.p[j]+=s.v[j]*dt;}}if(sparks.length>420)sparks.splice(0,sparks.length-420);}
function drawSparks(){for(const s of sparks){const k=1-s.age/s.life,z=s.size*(s.mesh==='box'?1:.35+.65*k);d(s.mesh,s.p,s.mesh==='box'?[z,z*.12,z*.7]:[z,z,z],s.color,[s.age*s.spin,s.age*s.spin*.7,s.spin],s.glow);}}
function resetFx(){sparks.length=0;fx.comet=null;fx.rocks=[];fx.jump=0;fx.wiggle=0;}
function updateFx(dt){updateSparks(dt);fx.jump=Math.max(0,fx.jump-dt);fx.wiggle=Math.max(0,fx.wiggle-dt*1.4);}
function homeJump(){return fx.jump>0?Math.sin((1-fx.jump/.8)*Math.PI)*.9:0;}

// Space gets a soft coloured nebula behind the HUD, tinted from where we leave towards where we go.
function updateSpace(){const m=state.mode,on=['flight','arrival','sun'].includes(m)||(m==='launch'&&state.origin.id!=='earth')||(m==='play'&&play.space);
 if(on!==fx.space){fx.space=on;$('app').classList.toggle('space',on);}
 const travelling=m==='flight'||m==='launch',from=travelling?state.origin:state.location,to=travelling?state.target:state.location,key=from.id+'>'+to.id;
 if(on&&key!==fx.nebulaKey){fx.nebulaKey=key;const neb=$('nebula');neb.style.setProperty('--neb-a',shade(from.color,.5));neb.style.setProperty('--neb-b',shade(to.color,.55));}}
function flash(){const el=$('warp-flash');el.classList.remove('go');void el.offsetWidth;el.classList.add('go');}
function arrivalFx(){sparks.length=0;flash();confetti([0,0,0],state.location.size+.35,46);gameAudio.effect('sparkle');}

// Letters pressed on the keyboard fly up into the rocket as fuel.
function flyLetter(letter,button){if(state.reduced)return;const key=button||[...$('keyboard').children].find(b=>b.textContent===letter),s=toScreen(fx.rocketWorld);if(!key?.animate||!s)return;
 const from=key.getBoundingClientRect(),box=scene.getBoundingClientRect(),el=document.createElement('span');el.className='letter-fly';el.textContent=letter;el.setAttribute('aria-hidden','true');$('app').append(el);
 const x0=from.left+from.width/2,y0=from.top+from.height/2,x1=box.left+s.x,y1=box.top+s.y,at=(x,y,sc)=>`translate(${x}px,${y}px) translate(-50%,-50%) scale(${sc})`;
 const anim=el.animate([{transform:at(x0,y0,1),opacity:1},{transform:at((x0+x1)/2,Math.min(y0,y1)-70,1.6),opacity:1,offset:.45},{transform:at(x1,y1,.35),opacity:.25}],{duration:680,easing:'cubic-bezier(.3,.1,.3,1)'});
 anim.onfinish=()=>{el.remove();if(['flight','launch'].includes(state.mode))burst(fx.rocketWorld,['#ffde71','#79e4e2','#ffffff'],10,2.2);};}

// Comets drift by now and then; asteroid rocks tumble past in the belt between Mars and Jupiter.
function startFlightFx(){fx.comet=null;fx.rocks=[];fx.cometTimer=rand(9,16);fx.trail=0;}
function spawnComet(){const aspect=scene.clientWidth/Math.max(1,scene.clientHeight),z=rand(-5,-2),half=(20-z)/FOCAL,edge=half*aspect+3;
 fx.comet={p:[edge,rand(3.2,5.6),z],v:[-rand(3.2,4.4),-rand(.25,.55),0],edge};fx.cometTimer=rand(14,26);
 if(!fx.cometsSeen++){notify('☄ En komet! Trykk på den!');gameAudio.say('Se, en komet! Trykk på den!',{queue:true,id:'flyby-comet'});}}
function startBelt(){const aspect=scene.clientWidth/Math.max(1,scene.clientHeight),colors=['#8b7a69','#a38f78','#6f655c','#b59f86','#7d6a5a'],n=state.reduced?12:renderer.software?14:28;fx.rocks=[];
 for(let i=0;i<n;i++){const z=rand(-5,5.5),half=(20-z)/FOCAL,edge=half*aspect+2;let y=rand(-.55,.65)*half;if(z>0&&z<4&&Math.abs(y)<1.4)y+=y<0?-1.5:1.5;
  fx.rocks.push({p:[edge+i/n*22,y,z],vx:-rand(4,6),size:rand(.25,.7),turn:rand(-2,2),spin:rand(0,6),color:colors[i%colors.length],edge});}}
function spawnExhaust(){const boosted=state.speed>1.6,colors=rewards.rainbow?['#ff6389','#ffe36b','#64dce9','#c28eff']:rewards.gold?['#ffd94f','#fff1a8','#8fd99a']:boosted?['#bff9ff','#79e4e2','#ffffff']:['#ffd66b','#ff9f4a','#fff1c1'],p=fx.rocketWorld;
 sparks.push({p:[p[0]-2.3+rand(-.1,.1),p[1]+rand(-.12,.12),p[2]+rand(-.12,.12)],v:[-(3+state.speed*2.2),rand(-.35,.35),rand(-.35,.35)],age:0,life:rand(.35,.6),color:colors[Math.floor(Math.random()*colors.length)],size:rand(.1,.17),mesh:'star',gravity:0,drag:.4,spin:0,glow:1});}
function updateFlightFx(dt){const rush=.4+state.speed*.6;
 if(fx.comet){const c=fx.comet;c.p[0]+=c.v[0]*dt*(.6+rush*.4);c.p[1]+=c.v[1]*dt;if(c.p[0]<-c.edge)fx.comet=null;}
 else{fx.cometTimer-=dt;const pr=state.elapsed/state.total;if(fx.cometTimer<=0&&!fx.rocks.length&&pr>.05&&pr<.88)spawnComet();}
 for(const r of fx.rocks){r.p[0]+=r.vx*dt*rush;r.spin+=dt*r.turn;}fx.rocks=fx.rocks.filter(r=>r.p[0]>-r.edge);
 fx.trail+=dt*(state.reduced?6:renderer.software?6:18+state.speed*7);while(fx.trail>=1){fx.trail--;spawnExhaust();}}
function drawFlightFx(t,rocketX,bob,boost){
 if(fx.comet){const c=fx.comet,dir=norm(c.v),tail=['#c9f6ff','#9fe3ff','#7ec8ff','#8aa6ff'];for(let i=1;i<15;i++){const k=i/15,back=i*.34,r=.32*(1-k*.8);d('sphere',[c.p[0]-dir[0]*back,c.p[1]-dir[1]*back+(state.reduced?0:Math.sin(t*6+i)*.05*k),c.p[2]-.02*i],[r,r,r],tail[i%4],[],1);}d('sphere',c.p,[.42,.42,.42],'#f2fdff',[],1);}
 for(const r of fx.rocks)d('sphere',r.p,[r.size,r.size*.74,r.size*.88],r.color,[r.spin,r.spin*.6,.4]);
 // A glowing tunnel opens around the rocket when Sofia spells really fast.
 if(!state.reduced&&state.speed>2.4){const n=Math.min(7,Math.floor((state.speed-2)*1.6)),colors=['#79e4e2','#ff9ed1','#ffde71','#b9a2ff'];for(let i=0;i<n;i++){const x=rocketX+7-((t*(6+state.speed*2.5)+i*2.1)%14),r=2+.35*Math.sin(i*1.7);d('ringlet',[x,bob,2],[r,1,r],colors[i%4],[0,.75,Math.PI/2],1);}}}
function flightTargets(){return !!fx.comet||fx.rocks.length>0;}
function tapFlight(x,y){
 if(fx.comet&&pickTarget([fx.comet],x,y,c=>c.p,()=>.8)){const c=fx.comet;fx.comet=null;burst(c.p,['#ffffff','#c9f6ff','#79e4e2','#ffde71'],26,4);gameAudio.effect('sparkle');state.speed=accelerate(state.speed,true);triggerBoost(false);$('boost-callout').textContent='☄ KOMETKRAFT!';notify('☄ Du fanget en komet, Sofia!');gameAudio.say('Du fanget en komet!',{queue:true,id:'flyby-comet'});updateFlight();return true;}
 const rock=pickTarget(fx.rocks,x,y,r=>r.p,r=>r.size*1.1);if(rock){fx.rocks.splice(fx.rocks.indexOf(rock),1);burst(rock.p,['#d8c3a5','#ffde71','#a88f75','#ffffff'],14,3);gameAudio.effect('pop');return true;}
 return false;}

// At home, Sofia hops when tapped and the rocket gives a little wiggle.
function tapHome(x,y){if(pickTarget([0],x,y,()=>[-.05,.72,1.85],()=>.62)!==null){fx.jump=.8;gameAudio.effect('boing');speak(['Hei, Sofia!','Hopp og sprett!','Klar for et nytt eventyr?'][Math.floor(Math.random()*3)]);return true;}
 if(pickTarget([0],x,y,()=>[2.6,1.3,0],()=>1)!==null){fx.wiggle=1;gameAudio.effect('pop');burst([2.6,.2,0],['#e3ebe0','#ffffff'],10,1.6,{mesh:'sphere',size:.14,glow:.4});speak('Raketten er klar! Trykk på den gule knappen for å reise.');return true;}return false;}
function tapScene(x,y){if(state.paused)return false;if(state.mode==='play'){tapPlay(x,y);return true;}if(state.mode==='quiz'){tapQuiz(x,y);return true;}if(state.mode==='flight')return tapFlight(x,y);if(state.mode==='home')return tapHome(x,y);return false;}
function allowDoubleTap(){return !['play','quiz'].includes(state.mode)&&!(state.mode==='flight'&&flightTargets());}
function keyScene(e){if([...document.querySelectorAll('.modal-shade')].some(el=>!el.hidden))return false;
 if(state.mode==='play'){if(e.key==='Escape'){endPlay();return true;}return /^[a-zæøå]$/i.test(e.key)&&keyPlay(e.key.toUpperCase());}
 if(state.mode==='quiz'){if(e.key==='Escape'){endQuiz();return true;}const n=Number(e.key);if(n>=1&&n<=4&&$('quiz-choices').children[n-1]){$('quiz-choices').children[n-1].click();return true;}}return false;}

// Sofia in a space suit for walks on other worlds. Arms reach up while she jumps.
function astronaut(t,reach=0){const suit='#f2f3f6',wave=state.reduced?0:Math.sin(t*4)*.35;
 d('box',[0,.55,0],[.26,.33,.19],suit);d('box',[0,.62,-.24],[.2,.26,.08],'#c9ced8');d('box',[0,.64,.2],[.11,.07,.02],'#79e4e2',[],.7);d('box',[0,.28,0],[.27,.05,.2],'#ff9ed1');
 for(const x of [-.12,.12]){d('box',[x,.14,0],[.1,.2,.12],suit);d('sphere',[x,.02,.06],[.13,.08,.18],'#8d96a8');}
 for(const side of [-1,1]){const ang=reach?2.75:side>0?2.2+wave:.3,L=.22,sx=side*.3,sy=.82,th=side*ang;d('box',[sx+L*Math.sin(th),sy-L*Math.cos(th),0],[.09,L,.1],suit,[0,0,th]);d('sphere',[sx+2*L*Math.sin(th),sy-2*L*Math.cos(th),0],[.1,.1,.1],'#8d96a8');}
 d('sphere',[0,1.1,-.2],[.42,.42,.3],'#f7f8fb');d('sphere',[0,1.1,0],[.27,.28,.25],'#f6d1a8');d('sphere',[0,1.25,-.06],[.28,.16,.22],'#77523c');
 d('sphere',[-.09,1.12,.24],[.032,.04,.016],'#1a2a3e');d('sphere',[.09,1.12,.24],[.032,.04,.016],'#1a2a3e');d('box',[0,1.03,.25],[.055,.016,.01],'#c5766c');
 d('ringlet',[0,1.1,.1],[.36,1,.36],'#79e4e2',[Math.PI/2,0,0],.6);d('sphere',[-.15,1.26,.22],[.04,.04,.02],'#ffffff',[],1);}
// Round, bright letter badges for the letter storm, painted once per letter and colour.
const tileCache=new Map();
function letterTile(ch,color){const key=ch+color;if(tileCache.has(key))return tileCache.get(key);const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');
 g.fillStyle='#1b2446';g.beginPath();g.arc(64,64,61,0,Math.PI*2);g.fill();g.fillStyle=color;g.beginPath();g.arc(64,64,53,0,Math.PI*2);g.fill();g.fillStyle='#ffffff4d';g.beginPath();g.ellipse(46,38,24,13,-.5,0,Math.PI*2);g.fill();
 g.font='900 74px "Arial Black",system-ui,sans-serif';g.textAlign='center';g.textBaseline='middle';g.lineJoin='round';g.lineWidth=10;g.strokeStyle='#1b2446';g.strokeText(ch,64,70);g.fillStyle='#ffffff';g.fillText(ch,64,70);tileCache.set(key,c);return c;}
