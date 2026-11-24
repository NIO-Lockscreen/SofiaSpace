const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const{BODIES,MOONS,SHIP_COLORS,BELT,PLAYS,duration,accelerate,relaxSpeed,formatTime,buildRoute,tripRoute,earnedRewards,shipPaint,shipColorsFor,moonsOf,playFor,quizChoiceCount,quizRound,mergeSaves,BED_JUMP_AGAIN,bedTap}=require('./game-core.js');
const byId=id=>BODIES.find(p=>p.id===id),earth=byId('earth');
assert.equal(duration(earth,byId('venus')),60);assert.equal(duration(earth,byId('pluto')),300);assert.equal(duration(earth,earth),0);
assert.equal(Math.min(...BODIES.filter(p=>p.id!=='earth').map(p=>duration(earth,p))),60);
for(const from of BODIES)for(const to of BODIES){assert.equal(duration(from,to),duration(to,from));const route=buildRoute(from,to);assert.equal(new Set(route.map(e=>e.body.id)).size,route.length);for(let i=0;i<route.length;i++){assert.ok(route[i].fraction>0&&route[i].fraction<1);if(i)assert.ok(route[i].fraction>route[i-1].fraction);assert.notEqual(route[i].body.id,to.id);assert.notEqual(route[i].body.id,from.id);}}
assert.deepEqual(buildRoute(earth,byId('pluto')).map(e=>e.body.id),['mars','jupiter','saturn','uranus','neptune']);
assert.deepEqual(buildRoute(byId('pluto'),earth).map(e=>e.body.id),['neptune','uranus','saturn','jupiter','mars']);
assert.deepEqual(buildRoute(earth,byId('sun')).map(e=>e.body.id),['venus','mercury']);assert.deepEqual(buildRoute(earth,byId('venus')),[]);
assert.ok(accelerate(1,true)>1);assert.ok(accelerate(1,false)<1);assert.equal(accelerate(.65,false),.65);
// There is no ceiling: keep spelling correctly and the rocket keeps gaining speed.
let climb=1;for(let i=0;i<40;i++)climb=accelerate(climb,true);assert.ok(climb>14,String(climb));assert.equal(accelerate(3,true),3.35);assert.equal(accelerate(20,true),20.35);
assert.equal(accelerate(1,false),.65);assert.ok(accelerate(20,false)<20);
let speed=3;for(let i=0;i<60;i++)speed=relaxSpeed(speed,.1);assert.equal(speed,1);assert.equal(relaxSpeed(3,1,1),3);
// A very fast rocket sheds the extra speed quickly and still settles at exactly 1, never below.
let zoom=20,ticks=0;while(zoom>1&&ticks<400){zoom=relaxSpeed(zoom,.05);ticks++;}assert.equal(zoom,1);assert.ok(ticks*.05<8.5,String(ticks*.05));assert.ok(ticks*.05>3,String(ticks*.05));
assert.ok(20-relaxSpeed(20,.05)>3*(3-relaxSpeed(3,.05)));assert.equal(relaxSpeed(20,1,1),20);
for(let i=0;i<30;i++)assert.ok(relaxSpeed(1,.1)<=1&&relaxSpeed(.7,.1)>.7);
assert.equal(formatTime(300),'5 min');assert.equal(formatTime(70),'1 min 10 sek');assert.equal(formatTime(59.1),'1 min');
// Ensure spoken letters queue, arrival facts interrupt old spelling, and new letters do not cut flyby narration.
const spoken=[],settings={muted:false,voice:true,paused:false},synth={getVoices:()=>[{lang:'nb-NO'}],addEventListener(){},cancel(){this.cancelled=(this.cancelled||0)+1;},speak(u){spoken.push(u);}};
const context=vm.createContext({window:{speechSynthesis:synth},document:{getElementById:()=>null},SpeechSynthesisUtterance:class{constructor(text){this.text=text;}},settings});
vm.runInContext(fs.readFileSync('audio.js','utf8'),context);const audio=vm.runInContext('new GameAudio(()=>settings)',context);
audio.letter('P');audio.letter('L');assert.equal(spoken.at(-1).text,'pe');spoken.at(-1).onend();assert.equal(spoken.at(-1).text,'ell');
audio.say('Velkommen til Mars!',{id:'fact-mars'});assert.equal(audio.queue.length,0);assert.equal(spoken.at(-1).text,'Velkommen til Mars!');
audio.say('Se! Vi passerer Jupiter!',{id:'flyby-jupiter'});const cancelled=synth.cancelled;audio.letter('U');assert.equal(synth.cancelled,cancelled);assert.equal(spoken.at(-1).text,'Se! Vi passerer Jupiter!');spoken.at(-1).onend();assert.equal(spoken.at(-1).text,'u');
settings.voice=false;audio.stopSpeech();audio.say('Les dette likevel',{force:true});assert.equal(spoken.at(-1).text,'Les dette likevel');settings.muted=true;const count=spoken.length;audio.letter('A');assert.equal(spoken.length,count);
console.log('Passed: 60 s nearest / 300 s Pluto, all 100 route combinations, flyby order, no repeated endpoints, boost recovery, time labels, Norwegian letter queue, narration priority, manual speech replay and mute.');

const start=new Set(['earth']);assert.equal(earnedRewards(start).graffiti,false);start.add('sun');assert.equal(earnedRewards(start).planets,0);start.add('venus');start.add('mars');assert.equal(earnedRewards(start).graffiti,true);assert.equal(earnedRewards(start).paint,false);start.add('mars');assert.equal(earnedRewards(start).planets,2);start.add('mercury');assert.equal(earnedRewards(start).paint,false);start.add('jupiter');assert.equal(earnedRewards(start).planets,4);assert.equal(earnedRewards(start).paint,true);assert.equal(earnedRewards(start).palette,false);start.add('saturn');assert.equal(earnedRewards(start).palette,false);start.add('uranus');assert.equal(earnedRewards(start).planets,6);assert.equal(earnedRewards(start).palette,true);assert.equal(earnedRewards(start).rainbow,false);assert.equal(earnedRewards(start).moonMode,false);for(const p of BODIES)start.add(p.id);assert.equal(earnedRewards(start).rainbow,true);assert.equal(earnedRewards(start).planets,8);assert.equal(earnedRewards(start).moonMode,true);assert.equal(earnedRewards(start).gold,false);
assert.equal(earnedRewards(start).duck,false);
for(const m of MOONS.slice(0,-1))start.add(m.id);assert.equal(earnedRewards(start).moons,MOONS.length-1);assert.equal(earnedRewards(start).gold,false);assert.equal(earnedRewards(start).duck,false);
start.add(MOONS.at(-1).id);assert.equal(earnedRewards(start).gold,true);assert.equal(earnedRewards(start).duck,true);assert.equal(earnedRewards(start).moons,MOONS.length);
const moonsOnly=new Set(['earth',...MOONS.map(m=>m.id)]);assert.equal(earnedRewards(moonsOnly).gold,false);assert.equal(earnedRewards(moonsOnly).duck,false);assert.equal(earnedRewards(moonsOnly).moonMode,false);
// Every planet without the Sun still opens the duck: the Sun is a star, and the duck asks for planets and moons.
const noSun=new Set([...BODIES.filter(p=>p.id!=='sun').map(p=>p.id),...MOONS.map(m=>m.id)]);assert.equal(earnedRewards(noSun).duck,true);assert.equal(earnedRewards(noSun).rainbow,false);
console.log('Passed: unique planet counts, graffiti at two, new paint at four, colour picker at six, rainbow for all destinations, moon mode for all eight planets, gold and the duck only for every planet and moon, and no reward for duplicate visits.');

// The chosen ship colour only applies once the picker is unlocked, and an unknown choice falls back safely.
const locked={paint:false,palette:false},painted={paint:true,palette:false},picking={paint:true,palette:true};
assert.equal(shipPaint(locked,'mint').id,'classic');assert.equal(shipPaint(locked).id,'classic');
assert.equal(shipPaint(painted,'mint').id,'star');assert.equal(shipPaint(painted).id,'star');
assert.equal(shipPaint(picking,'mint').id,'mint');assert.equal(shipPaint(picking,'sprinkles').id,'star');assert.equal(shipPaint(picking).id,'star');
for(const c of SHIP_COLORS){assert.match(c.body,/^#[0-9a-f]{6}$/);assert.match(c.accent,/^#[0-9a-f]{6}$/);assert.ok(c.name);}
for(const c of shipColorsFor(picking))assert.equal(shipPaint(picking,c.id).id,c.id);
assert.equal(new Set(SHIP_COLORS.map(c=>c.id)).size,SHIP_COLORS.length);assert.ok(SHIP_COLORS.length>=4);
const golden={paint:true,palette:true,gold:true};
assert.ok(!shipColorsFor(picking).some(c=>c.id==='gold'));assert.ok(shipColorsFor(golden).some(c=>c.id==='gold'));
assert.equal(shipPaint(picking,'gold').id,'star');assert.equal(shipPaint(golden).id,'gold');assert.equal(shipPaint(golden,'mint').id,'mint');
assert.equal(shipPaint({paint:true,palette:false,gold:true}).id,'gold');
console.log(`Passed: ${SHIP_COLORS.length} ship colours, locked and unlocked paint, and fallback for an unknown colour choice.`);

// Moons ride along with their planet, so travel times and the flyby route need no special cases.
const ids=new Set(BODIES.map(p=>p.id));assert.equal(MOONS.filter(m=>ids.has(m.id)).length,0);
assert.equal(new Set(MOONS.map(m=>m.id)).size,MOONS.length);assert.equal(new Set(MOONS.map(m=>m.word)).size,MOONS.length);
for(const m of MOONS){const parent=BODIES.find(p=>p.id===m.parent);assert.ok(parent,m.id);assert.equal(m.au,parent.au);assert.equal(m.type,'Måne · '+parent.name);assert.ok(m.fact.length>30);assert.match(m.word,/^[A-ZÆØÅ]+$/);assert.ok(m.bead>0&&m.size>0&&m.orbit>1.4&&m.speed>0);assert.equal(duration(parent,m),40);assert.equal(duration(earth,m),parent.id==='earth'?40:duration(earth,parent));assert.deepEqual(buildRoute(parent,m),[]);}
for(const id of ['mercury','venus','sun'])assert.deepEqual(moonsOf(id),[]);
for(const id of ['earth','mars','jupiter','saturn','uranus','neptune','pluto'])assert.ok(moonsOf(id).length>=1,id);
assert.equal(moonsOf('jupiter').length,4);
const europa=MOONS.find(m=>m.id==='europa');assert.deepEqual(buildRoute(earth,europa).map(e=>e.body.id),['mars']);
assert.equal(duration(europa,MOONS.find(m=>m.id==='io')),40);assert.equal(duration(earth,MOONS.find(m=>m.id==='moon')),40);assert.equal(duration(europa,earth),duration(earth,europa));
console.log(`Passed: ${MOONS.length} moons with real parents, 40 s hops inside a system, planet travel times reused, no moons for Mercury and Venus, and unique spelling words.`);

// The asteroid belt sits between Mars and Jupiter, in order, on every trip that crosses it and on no other.
assert.deepEqual(tripRoute(earth,byId('pluto')).map(e=>e.body.id),['mars','belt','jupiter','saturn','uranus','neptune']);
assert.deepEqual(tripRoute(byId('pluto'),earth).map(e=>e.body.id),['neptune','uranus','saturn','jupiter','belt','mars']);
assert.deepEqual(tripRoute(byId('jupiter'),byId('mars')).map(e=>e.body.id),['belt']);
assert.deepEqual(tripRoute(earth,byId('venus')),[]);assert.deepEqual(tripRoute(earth,byId('mars')),[]);
assert.deepEqual(tripRoute(MOONS.find(m=>m.id==='europa'),MOONS.find(m=>m.id==='io')),[]);
for(const from of [...BODIES,...MOONS])for(const to of [...BODIES,...MOONS]){const route=tripRoute(from,to),crosses=Math.min(from.au,to.au)<BELT.au&&Math.max(from.au,to.au)>BELT.au;
 assert.equal(route.some(e=>e.body.id==='belt'),crosses,from.id+'>'+to.id);for(let i=0;i<route.length;i++){assert.ok(route[i].fraction>0&&route[i].fraction<1);if(i)assert.ok(route[i].fraction>route[i-1].fraction);}
 assert.deepEqual(route.filter(e=>e.body.id!=='belt'),buildRoute(from,to));}
console.log('Passed: the asteroid belt between Mars and Jupiter on every crossing trip, in flight order both ways, and nowhere else.');

// Every planet and moon has a game, each planet its own; the Sun burns up and Earth is home.
assert.equal(playFor(byId('sun')),null);assert.equal(playFor(earth),null);
const planetGames=BODIES.filter(p=>!['sun','earth'].includes(p.id)).map(playFor);
assert.ok(planetGames.every(Boolean));assert.equal(new Set(planetGames.map(g=>g.kind)).size,planetGames.length);
for(const m of MOONS)assert.equal(playFor(m),PLAYS.moon);
for(const g of Object.values(PLAYS)){assert.ok(g.goal>0&&g.goal<=10,g.kind);for(const key of ['title','icon','task','intro','outro'])assert.ok(g[key],g.kind+' '+key);}
assert.equal(PLAYS.neptune.word,byId('neptune').word);assert.equal(PLAYS.neptune.goal,PLAYS.neptune.word.length);assert.equal(PLAYS.jupiter.goal,moonsOf('jupiter').length);
console.log(`Passed: ${planetGames.length} different planet games, one moon game for all ${MOONS.length} moons, and none for the Sun or home.`);

// The reading game: the answer is always among the choices, no name twice, and early rounds differ in the first letter.
let seed=7;const random=()=>(seed=(seed*16807)%2147483647)/2147483647;
assert.equal(quizChoiceCount(0),2);assert.equal(quizChoiceCount(6),3);assert.equal(quizChoiceCount(20),4);
for(const correct of [0,3,8,15,25,60])for(let k=0;k<300;k++){const recent=BODIES.slice(k%8,k%8+3).map(p=>p.id),{answer,choices}=quizRound(correct,recent,random);
 assert.equal(choices.length,quizChoiceCount(correct));assert.ok(choices.includes(answer));assert.equal(new Set(choices.map(p=>p.id)).size,choices.length);assert.ok(!recent.includes(answer.id));
 if(choices.length<4)assert.equal(new Set(choices.map(p=>p.word[0])).size,choices.length);}
const seen=new Set();for(let k=0;k<400;k++)seen.add(quizRound(0,[],random).answer.id);assert.equal(seen.size,BODIES.length);
console.log('Passed: reading game rounds with 2, 3 and 4 names, the answer always offered, no repeats of recent planets, and different first letters while the choices are few.');

// Undoing a reset brings everything back and keeps what was found after the reset too.
const before={visited:['earth','mars','venus'],played:['mars'],quizStars:3,quizCorrect:17,shipColor:'mint',moonMode:false,ship:'duck'};
const since={visited:['earth','pluto'],played:['pluto'],quizStars:1,quizCorrect:5,shipColor:'star',moonMode:true,ship:'rocket'};
const merged=mergeSaves(since,before);
assert.deepEqual([...merged.visited].sort(),['earth','mars','pluto','venus']);assert.deepEqual([...merged.played].sort(),['mars','pluto']);
assert.equal(merged.quizStars,4);assert.equal(merged.quizCorrect,22);assert.equal(merged.shipColor,'mint');assert.equal(merged.moonMode,false);assert.equal(merged.ship,'duck');assert.equal(mergeSaves({visited:['earth']},{visited:['earth']}).ship,undefined);
const fresh={visited:['earth'],played:[],quizStars:0,quizCorrect:0,shipColor:'star',moonMode:true},back=mergeSaves(fresh,before);
assert.deepEqual([...back.visited].sort(),[...before.visited].sort());assert.equal(back.quizStars,3);assert.equal(back.quizCorrect,17);
assert.deepEqual(mergeSaves(fresh,{visited:'nonsense',quizStars:'x'}).visited,['earth']);assert.equal(mergeSaves(fresh,null).quizStars,0);
console.log('Passed: undoing a reset restores every place, star and setting, adds what was found since, and ignores a damaged copy.');

// Tooth brushing stars are kept by an undo too, added to what was brushed since.
assert.equal(mergeSaves({...fresh,brushed:2},{...before,brushed:5}).brushed,7);assert.equal(mergeSaves(fresh,before).brushed,0);
// Tooth brushing (teeth.js, 23 November 2026): toothpaste first, every tooth needs a few seconds of brushing however fast the brush goes,
// the germs let go, the hint blinks when Sofia is stuck, a tap on the cup rinses, and the game says it is done exactly once.
{const ctx=vm.createContext({Math,performance:{now:()=>0}});vm.runInContext(fs.readFileSync('teeth.js','utf8')+';this.createToothGame=createToothGame;',ctx);
 const said=[],sounds=[],steps=[];let done=0,clock=0;const canvas={clientWidth:1024,clientHeight:510};
 const game=ctx.createToothGame({canvas,say:t=>said.push(t),sound:n=>sounds.push(n),onStep:s=>steps.push(s),onDone:()=>done++});
 const run=(sec,fn)=>{for(let i=0;i<Math.round(sec*60);i++){fn&&fn(clock);game.update(1/60);clock+=1/60;}};
 game.start({seed:7,loop:false,growth:1});assert.equal(game.step,'paste');assert.equal(game.teeth.length,16);assert.ok(game.teeth.every(t=>t.dirt>=.6&&!t.clean));
 assert.equal(game.teeth.filter(t=>t.germ).length,6);for(const row of ['up','down'])assert.ok(game.teeth.some(t=>t.row===row&&t.kind==='molar'&&t.germ),'a germ on a back tooth in the '+row+' row');
 const L=game.layout(),C=game.teeth.map(t=>game.centre(t));
 for(const t of game.teeth){const r=game.rect(t);assert.ok(r.x>L.cx-L.a&&r.x+r.w<L.cx+L.a&&r.w>20&&r.h>20,'every tooth inside the mouth and big enough to see');}
 game.press(L.cx,L.cy);assert.equal(game.step,'paste');assert.match(said.at(-1),/tuben/,'a tap beside the tube asks for toothpaste');
 game.press(L.tube.x,L.tube.y);assert.ok(sounds.includes('squeeze'));run(1.6);assert.equal(game.step,'brush');assert.ok(game.brush.paste>.9,'toothpaste on the brush');
 run(6);assert.ok(said.some(t=>/blinker/.test(t)),'stuck: the dirtiest tooth blinks and the voice says so');
 run(2,c=>game.move(L.cx+Math.sin(c*20)*80,L.cy));assert.ok(game.teeth.every(t=>t.dirt>=.6),'no finger on the brush, no brushing');
 const front=game.teeth.findIndex(t=>t.row==='up'&&t.kind==='central');let at=-1;game.press(C[front].x,C[front].y);
 run(6,c=>{game.move(C[front].x+(Math.round(c*60)%2?70:-70),C[front].y);if(at<0&&game.teeth[front].clean)at=c;});game.release();
 assert.ok(at-clock+6>2&&at-clock+6<5,'wild scrubbing still takes about four seconds a tooth ('+(at-clock+6).toFixed(2)+' s)');
 // A child brushing back and forth over three teeth at a time, two strokes a second: all clean in well under a minute.
 const t0=clock;for(const row of [0,1])for(const [i,j] of [[0,2],[2,5],[5,7]]){const a=C[row*8+i],b=C[row*8+j];game.press(a.x,a.y);const s0=clock;
  while(clock-s0<8&&!game.teeth.slice(row*8+i,row*8+j+1).every(t=>t.clean))run(1/60,c=>{const k=(Math.sin((c-s0)*Math.PI*4)+1)/2;game.move(a.x+(b.x-a.x)*k,a.y+(b.y-a.y)*k);});game.release();}
 assert.equal(game.cleanCount(),16,'every tooth clean');assert.equal(game.step,'rinse');assert.ok(clock-t0<45,'brushed in '+(clock-t0).toFixed(1)+' s');console.log('  (a child brushing three teeth at a time: '+(clock-t0).toFixed(1)+' s)');
 assert.ok(game.teeth.every(t=>!t.germ||t.germ.gone),'all the germs gone');assert.equal(sounds.filter(n=>n==='pop').length,6);assert.equal(sounds.filter(n=>n==='ding').length,16);assert.ok(said.includes('Hade, bakterie!'));
 game.press(L.cx,L.cy);assert.equal(game.step,'rinse');game.press(L.cup.x,L.cup.y-L.cup.h*.4);run(2.1);assert.equal(game.step,'done');assert.equal(done,0);
 run(4);assert.equal(done,1,'done after the smile');run(3);assert.equal(done,1,'and only once');assert.deepEqual(steps,['paste','brush','rinse','done']);
 game.stop();assert.equal(game.step,'idle');game.press(L.tube.x,L.tube.y);assert.equal(game.step,'idle');
 // Three taps anywhere also put toothpaste on, so a five-year-old cannot get stuck there.
 game.start({seed:3,loop:false,growth:1});for(let i=0;i<3;i++)game.press(10,10);run(1.6);assert.equal(game.step,'brush');}
console.log('Passed: tooth brushing with toothpaste first, about four seconds a tooth however wild the brushing, germs that let go, a blinking hint, rinsing, done once, and brushing stars kept by undo.');

// The bed (24 November 2026): the first tap each time the game is opened is a jump; after that a 20 % chance of another jump, otherwise bed.
assert.equal(BED_JUMP_AGAIN,.2);for(const r of [0,.5,.99])assert.equal(bedTap(false,r),'jump','the first time always');
assert.equal(bedTap(true,0),'jump');assert.equal(bedTap(true,.19),'jump');assert.equal(bedTap(true,.2),'sleep');assert.equal(bedTap(true,.6),'sleep');assert.equal(bedTap(true,.999),'sleep');
{let jumps=0;for(let i=0;i<10000;i++)if(bedTap(true,Math.random())==='jump')jumps++;assert.ok(jumps>1800&&jumps<2200,'about one in five: '+jumps);}
console.log('Passed: the first tap on the bed is a jump, and after it about one tap in five is another jump instead of bedtime.');

// The two new lower front teeth (24 November 2026): 5 % out on 24 November 2026, 0.44 % more each real day (0.04 mm a day of a 9 mm crown), whole days on the
// device's calendar, fully out at the end of June 2027; too small to brush until 40 %: no plaque, no germ, not counted. They show only the part that is out.
{const ctx=vm.createContext({Math,Date,performance:{now:()=>0}});vm.runInContext(fs.readFileSync('teeth.js','utf8')+';this.createToothGame=createToothGame;this.newToothGrowth=newToothGrowth;this.NEW_TEETH=NEW_TEETH;',ctx);
 const grow=(y,m,d,h=12)=>ctx.newToothGrowth(new Date(y,m-1,d,h));
 assert.equal(grow(2026,11,24),.05,'5 % today');assert.equal(grow(2026,11,24,0),.05);assert.equal(grow(2026,11,24,23),.05,'the same all day');assert.equal(grow(2026,10,1),.05,'never less');
 assert.ok(Math.abs(grow(2026,11,25)-.05-.04/9)<1e-9,'a little more the next day');assert.ok(Math.abs(grow(2026,12,24)-(.05+30*.04/9))<1e-9,'30 days: '+(grow(2026,12,24)*100).toFixed(1)+' %');
 let day=0;while(grow(2026,11,24+day)<1)day++;const full=new Date(2026,10,24+day);assert.ok(day>200&&day<230,'fully out after '+day+' days');assert.equal(full.getFullYear(),2027);assert.equal(full.getMonth(),5,'in June 2027');
 assert.equal(grow(2028,1,1),1,'and then they stay');let up=0;for(let d=0;d<260;d++){const g=grow(2026,11,24+d);assert.ok(g>=up);up=g;}
 const canvas={clientWidth:1024,clientHeight:510},game=ctx.createToothGame({canvas});
 game.start({seed:5,loop:false,growth:.05});const fresh=game.teeth.filter(t=>t.isNew);assert.equal(fresh.length,2);assert.ok(fresh.every(t=>t.row==='down'&&t.kind==='central'),'the two lower front teeth');
 assert.equal(game.total(),14,'only 14 to brush while they are small');assert.ok(fresh.every(t=>t.dirt===0&&!t.germ),'no plaque or germ on them');assert.equal(game.teeth.filter(t=>t.germ).length,6,'still six germs, elsewhere');
 const full1=game.teeth.find(t=>t.row==='down'&&t.kind==='lateral'),r1=game.rect(full1),r0=game.rect(fresh[0]);assert.ok(r0.h<r1.h*.3,'a small tooth: '+r0.h.toFixed(1)+' px against '+r1.h.toFixed(1));
 assert.equal(game.growth,.05);
 game.start({seed:5,loop:false,growth:.39});assert.equal(game.total(),14);game.start({seed:5,loop:false,growth:.4});assert.equal(game.total(),16,'from 40 % they are brushed too');assert.ok(fresh.every(t=>t.dirt>=.6));
 game.start({seed:5,loop:false,growth:1});const r2=game.rect(fresh[0]);assert.ok(Math.abs((r0.y+r0.h)-(r2.y+r2.h))<1e-6,'rooted in the same gum small and grown');assert.ok(Math.abs(r2.h-.37*game.layout().b)<1e-6,'fully out: as tall as before ('+r2.h.toFixed(1)+')');
 // brushing with them small: 14 clean is all clean
 const said=[],g2=ctx.createToothGame({canvas,say:t=>said.push(t)});g2.start({seed:9,loop:false,growth:.05});const L2=g2.layout();assert.match(said[0],/to nye tenner/,'the voice tells of them');
 for(const t of g2.teeth)if(g2.counts(t)){t.dirt=0;t.clean=true;}g2.press(L2.tube.x,L2.tube.y);for(let i=0;i<100;i++)g2.update(1/60);g2.press(L2.cx,L2.cy);g2.move(L2.cx+5,L2.cy);g2.update(1/60);assert.equal(g2.step,'rinse','14 of 14 clean: rinse');
 g2.start({seed:9,loop:false,growth:1});assert.doesNotMatch(said.at(-1),/nye tenner/,'grown: nothing to tell');}
console.log('Passed: two new lower front teeth, 5 % out today and growing 0.44 % a real day until the end of June 2027, not brushed until 40 %, rooted in the gum and as tall as the rest when grown.');

// The new Norwegian voice (24 November 2026): Piper clips play through Web Audio one sentence after another, letters wait behind
// narration, stopping cuts the sound at once, and the device voice reads whenever the new voice is off, not ready or fails.
{
 const started=[],stopped=[];let now=0;
 class FakeSource{connect(){}start(at){this.at=at;started.push(this);}stop(){stopped.push(this);}}
 const ctx={state:'running',get currentTime(){return now;},destination:{},createGain:()=>({gain:{value:1},connect(){}}),createBuffer:(ch,len,sr)=>{const d=new Float32Array(len);return{duration:len/sr,getChannelData:()=>d};},createBufferSource:()=>new FakeSource()};
 const jobs=[];
 class FakePiper{static supported(){return true;}constructor(){this.status='off';this.sampleRate=1000;}get ready(){return this.status==='ready';}onChange(fn){this.fn=fn;}load(){this.status='ready';this.fn?.(this);}prewarm(t,o){this.prewarmed=t;this.prewarmOpts=o;}speak(text,opts){const job={text,opts,cancelled:false,cancel(){job.cancelled=true;}};jobs.push(job);return job;}}
 const said=[],prefs={muted:false,voice:true,paused:false,neural:true},deviceSynth={getVoices:()=>[{lang:'nb-NO',name:'Nora'},{lang:'nb-NO',name:'Nora (Forbedret)',voiceURI:'com.apple.voice.enhanced.nb-NO.Nora'},{lang:'sv-SE',name:'Alva (Premium)'}],addEventListener(){},cancel(){},speak(u){said.push(u);}};
 const sandbox=vm.createContext({window:{speechSynthesis:deviceSynth},document:{getElementById:()=>null},navigator:{},SpeechSynthesisUtterance:class{constructor(t){this.text=t;}},PiperVoice:FakePiper,prefs,setTimeout,clearTimeout});
 vm.runInContext(fs.readFileSync('audio.js','utf8'),sandbox);const voice=vm.runInContext('new GameAudio(()=>prefs)',sandbox);
 assert.equal(voice.deviceVoice.voiceURI,'com.apple.voice.enhanced.nb-NO.Nora','the enhanced Norwegian device voice is chosen, not a Swedish premium one');
 voice.context=ctx;voice.neural.load();
 assert.ok(voice.neural.prewarmed.includes('jådd')&&voice.neural.prewarmed.includes('dobbelt ve')&&voice.neural.prewarmed.length===29,'all letter names are prepared');
 voice.say('Velkommen til Mars! Mars er rød.',{id:'fact-mars'});assert.equal(jobs.length,1);assert.equal(jobs[0].opts.lengthScale,1.12);
 voice.letter('M');assert.equal(jobs.length,1,'letters wait behind the arrival fact');
 jobs[0].onchunk(new Float32Array(1500));jobs[0].onchunk(new Float32Array(500));assert.equal(started.length,2);
 assert.ok(Math.abs(started[1].at-(started[0].at+1.5+.22))<1e-9,'sentences follow each other with a short pause');
 jobs[0].ondone();assert.equal(jobs.length,1,'still speaking');now=started[1].at+.5;started[1].onended();
 assert.equal(jobs.length,2,'then the letter');assert.equal(jobs[1].text,'emm');assert.equal(jobs[1].opts.lengthScale,voice.neural.prewarmOpts.lengthScale);
 jobs[1].onchunk(new Float32Array(300));voice.stopSpeech();assert.ok(jobs[1].cancelled);assert.ok(stopped.includes(started.at(-1)),'stopping cuts the sound at once');assert.equal(voice.current,null);
 voice.say('Hei, Sofia!');jobs[2].onerror();assert.equal(said.at(-1).text,'Hei, Sofia!','the device voice takes over when the new voice fails');
 voice.stopSpeech();prefs.neural=false;voice.say('Med enhetens stemme');assert.equal(jobs.length,3);assert.equal(said.at(-1).text,'Med enhetens stemme','the setting turns the new voice off');
 prefs.neural=true;ctx.state='suspended';voice.stopSpeech();voice.say('Før første trykk');assert.equal(jobs.length,3);assert.equal(said.at(-1).text,'Før første trykk','before sound is unlocked the device voice reads');
 voice.stopSpeech();prefs.muted=true;voice.say('Stille');assert.equal(said.at(-1).text,'Før første trykk','nothing when muted');
 // A worker the browser stopped without an error: after a short wait the device voice reads, and two stalls turn the new voice off.
 prefs.muted=false;ctx.state='running';voice.stallMs=15;voice.say('Ingen svar');const stuck=jobs.at(-1);assert.equal(stuck.text,'Ingen svar');
 setTimeout(()=>{assert.ok(stuck.cancelled);assert.equal(said.at(-1).text,'Ingen svar','the device voice reads after a stall');assert.equal(voice.neural.status,'ready');
  voice.neural.fail=reason=>{voice.neural.failedWith=reason;};voice.stopSpeech();voice.say('Igjen ingen svar');
  setTimeout(()=>{assert.equal(said.at(-1).text,'Igjen ingen svar');assert.equal(voice.neural.failedWith,'stalled','two stalls in a row switch the new voice off');console.log('Passed: a silent worker never blocks the speech queue: the device voice takes over after a stall.');},60);},60);
}
console.log('Passed: new Norwegian voice in the speech queue, sentence pauses, letters behind narration, instant stop, prepared letters, and the device voice (best Norwegian one) as fallback.');

// The browser phonemizer gives exactly the phoneme ids Python Piper 1.8 gives (with the game's pronunciation list), and clips are cached.
(async()=>{
 const core=await import('./tts/piper-core.mjs'),createEspeak=(await import('./tts/espeak-nb.mjs')).default;
 assert.equal(core.cleanText('🦆 Hei, ★ Sofia! ☀ [[x]]'),'Hei, Sofia! x');
 assert.deepEqual(core.mergeVowelClusters(['h','a','ɪ',' ','a','ʊ','a'],[['a','ɪ'],['a','ʊ']]),['h','aɪ',' ','aʊ','a']);
 assert.deepEqual(Array.from(core.trimSilence(Float32Array.from([0,0,0,.5,.25,0,0]),10,.01,0,0)),[.5,.25]);
 const data=fs.readFileSync('tts/espeak-nb.data');
 const espeak=await createEspeak({wasmBinary:fs.readFileSync('tts/espeak-nb.wasm'),getPreloadedPackage:()=>data.buffer.slice(data.byteOffset,data.byteOffset+data.byteLength),print(){},printErr(){}});
 assert.equal(espeak.ccall('ph_init','number',['string'],['nb']),0);
 const config=JSON.parse(fs.readFileSync('tts/no_NO-talesyntese-medium.onnx.json','utf8')),cases=JSON.parse(fs.readFileSync('tts/src/piper-fixture.json','utf8')).cases;
 for(const c of cases)assert.deepEqual(core.textToIdSentences(espeak,c.text,config),c.ids,c.text);
 const ipa=t=>{const p=espeak.stringToNewUTF8(t);try{return core.parseClauses(espeak.UTF8ToString(espeak._ph_text(p))).map(c=>c.phonemes).join(' ');}finally{espeak._free(p);}};
 for(const [word,expected] of [['Sofia','sʊfˈiːʲɑ'],['planeten','plɑnˈeːtən'],['Uranus','ʉrˈɑːnʉs'],['Neptun','nɛptˈʉːn'],['raketten','rɑkˈɛtːən'],['kometer','kʊmˈeːtər']])assert.equal(ipa(word),expected,word);
 const sandbox=vm.createContext({window:{AudioContext:function(){}},Worker:function(){},WebAssembly,BigInt64Array,caches:{},queueMicrotask});
 vm.runInContext(fs.readFileSync('tts.js','utf8'),sandbox);const piper=vm.runInContext('new PiperVoice()',sandbox);
 assert.equal(vm.runInContext('PiperVoice.supported()',sandbox),true);
 piper.remember('1|be',[new Float32Array(40)]);const got=await new Promise(done=>{const job=piper.speak('be'),lens=[];job.onchunk=c=>lens.push(c.length);job.ondone=()=>done(lens);});assert.deepEqual(got,[40],'a cached clip plays without the worker');
 const failed=await new Promise(done=>{const job=piper.speak('ikke laget');job.onerror=()=>done(true);job.ondone=()=>done(false);});assert.ok(failed,'not ready and not cached: the caller falls back');
 for(let i=0;i<9;i++)piper.remember('1|lang '+i,[new Float32Array(9e5)]);assert.ok(piper.cacheBytes<=24e6&&!piper.has('lang 0')&&piper.has('lang 8'),'the clip memory stays under 24 MB, oldest first out');
 console.log('Passed: browser phonemes identical to Python Piper for '+cases.length+' sentences, stress fixed for Sofia and the space words, emoji not read aloud, and a bounded clip cache.');
})().catch(err=>{console.error(err);process.exit(1);});
