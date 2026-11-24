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
 prefs.neural=true;voice.context=null;voice.stopSpeech();voice.say('Før første trykk');assert.equal(jobs.length,3);assert.equal(said.at(-1).text,'Før første trykk','before the first touch (no sound yet) the device voice reads');voice.context=ctx;
 voice.stopSpeech();prefs.muted=true;voice.say('Stille');assert.equal(said.at(-1).text,'Før første trykk','nothing when muted');
 // A worker the browser stopped without an error: after a short wait the device voice reads, and two stalls turn the new voice off.
 prefs.muted=false;ctx.state='running';voice.stallMs=15;voice.say('Ingen svar');const stuck=jobs.at(-1);assert.equal(stuck.text,'Ingen svar');
 setTimeout(()=>{assert.ok(stuck.cancelled);assert.equal(said.at(-1).text,'Ingen svar','the device voice reads after a stall');assert.equal(voice.neural.status,'ready');
  voice.neural.fail=reason=>{voice.neural.failedWith=reason;};voice.stopSpeech();voice.say('Igjen ingen svar');
  setTimeout(()=>{assert.equal(said.at(-1).text,'Igjen ingen svar');assert.equal(voice.neural.failedWith,'stalled','two stalls in a row switch the new voice off');console.log('Passed: a silent worker never blocks the speech queue: the device voice takes over after a stall.');
   // iOS puts Web Audio on pause ('interrupted', 'suspended'): a touch wakes it, and the new voice waits a moment for it instead of giving way to the device voice.
   voice.stallMs=8000;voice.stalls=0;let resumed=0;ctx.state='interrupted';ctx.resume=()=>{resumed++;ctx.state='running';return Promise.resolve();};voice.unlock();assert.equal(resumed,1,'a touch wakes interrupted sound');
   ctx.state='interrupted';voice.stopSpeech();const n0=jobs.length,d0=said.length;voice.say('Vekket');assert.equal(jobs.length,n0,'waits for the sound to wake');
   setTimeout(()=>{assert.equal(jobs.length,n0+1);assert.equal(jobs.at(-1).text,'Vekket','the new voice reads once the sound is awake');assert.equal(said.length,d0,'not the device voice as well');
    ctx.state='suspended';ctx.resume=()=>new Promise(()=>{});voice.wakeMs=10;voice.stopSpeech();voice.say('Sover');
    setTimeout(()=>{assert.equal(said.at(-1).text,'Sover','the device voice reads when the sound does not wake');assert.equal(jobs.length,n0+1);
     ctx.state='suspended';voice.stopSpeech();voice.say('Avbrutt');voice.stopSpeech();setTimeout(()=>{assert.notEqual(said.at(-1).text,'Avbrutt','stopped while waking: nothing is read');
      console.log('Passed: sound on pause is woken by a touch, and the new voice waits for it.');},30);},40);},10);},60);},60);
}
console.log('Passed: new Norwegian voice in the speech queue, sentence pauses, letters behind narration, instant stop, prepared letters, and the device voice (best Norwegian one) as fallback.');

// The brushing stars after the chart (24 November 2026): no limit. Star 11 and on fill the chart's wall first, the nearest places first, then the other
// walls, then the gaps round after round; never on the name, the case, the chart, the bed, the reading stars, the window or the desk; the same every time.
{const {brushStarSpots}=require('./game-core.js'),src=fs.readFileSync('routines.js','utf8'),walls=eval(src.match(/const BRUSH_WALLS=(\[[\s\S]*?\]\]\}\]);/)[1]),from=[2.85,2.98];
 assert.deepEqual(brushStarSpots(0,{walls,from}),[]);
 const t0=performance.now(),many=brushStarSpots(5000,{walls,from}),ms=performance.now()-t0;assert.equal(many.length,5000,'no limit');assert.ok(ms<500,'quick: '+ms.toFixed(0)+' ms for 5000');
 assert.deepEqual(brushStarSpots(300,{walls,from}),many.slice(0,300),'the same places every time, and more stars only add to them');
 const onBack=many.findIndex(s=>s.wall!==0);assert.ok(onBack>60,'the chart\'s wall is filled first: '+onBack+' stars');assert.ok(many.slice(onBack,onBack+100).every(s=>s.wall!==0),'then the other walls');
 assert.ok(many[onBack].wall===1,'round the corner from the chart first (the right wall)');assert.ok(many.slice(0,onBack).every(s=>s.round<2)&&many.at(-1).round>6,'two rounds on the chart\'s wall, then many more');
 const d=s=>Math.hypot(s.p[0]-from[0],s.p[1]-from[1]);for(let i=1;i<onBack;i++)assert.ok(d(many[i])>=d(many[i-1])-1e-9,'nearest the chart first');
 const keys=new Set(many.map(s=>s.p.map(v=>v.toFixed(3)).join()));assert.equal(keys.size,many.length,'no two in the same place');
 for(const s of many){const w=walls[s.wall],u=[0,1,2].reduce((a,k)=>a+(s.p[k]-w.o[k])*w.u[k],0),v=s.p[1]-w.o[1],m=s.size;
  assert.ok(u>=m&&u<=w.w-m&&v>=m&&v<=w.h-m,'on its wall');for(const [u0,u1,v0,v1] of w.skip)assert.ok(!(u>u0-m&&u<u1+m&&v>v0-m&&v<v1+m),'clear of what is on the wall');
  assert.ok(s.colour>=0&&s.colour<5&&s.size>.07&&s.size<=.12);}
 for(let i=1;i<many.length;i++)if(many[i].round>many[i-1].round)assert.ok(many[i].size<=many[i-1].size+1e-9,'a little smaller each round');
 assert.ok(/const brushStarsOnWall=\(\)=>Math\.max\(0,state\.brushed-10\);/.test(src),'after the ten on the chart');
 console.log(`Passed: brushing stars without limit: ${onBack} fill the chart's wall first (the nearest first), then the right and left walls, then the gaps (5000 in ${ms.toFixed(0)} ms), clear of everything on the walls.`);}

// Sofia's look (sofia.js): her curls frame her face without covering her eyes or eyebrows, the ringlets in front hang beside her face, the long hair at
// the back is tucked away while the PEG backpack is on, and with calmer effects she does not blink. Every script is in the page, the build and the server.
{const draws=[],faces=[],g2d=new Proxy({},{get:()=>()=>({addColorStop(){}})});
 const ctx=vm.createContext({Math,state:{reduced:true},santaSeason:()=>false,d:(mesh,p,s)=>draws.push({mesh,p,s}),group:(p,s,r,fn)=>fn(),renderer:{draw:(...a)=>faces.push(a[7])},document:{createElement:()=>({getContext:()=>g2d})}});
 vm.runInContext(fs.readFileSync('sofia.js','utf8')+';this.SOFIA_HAIR=SOFIA_HAIR;this.sofiaHead=sofiaHead;this.sofiaFaces=sofiaFaces;',ctx);
 for(const h of ctx.SOFIA_HAIR.clumps)if(h.p[2]+h.s[2]>.15)assert.ok(Math.abs(h.p[0])-h.s[0]>=.15||h.p[1]-h.s[1]>=.07,'a curl over her eyes or eyebrows: '+h.p.join(','));
 for(const h of ctx.SOFIA_HAIR.curls.filter(c=>c.front))assert.ok(Math.abs(h.p[0])>.25);
 ctx.sofiaHead(1.3+4.1*3+.05,{});const loose=draws.length;assert.deepEqual([...ctx.sofiaFaces.keys()],['open|smile']);
 draws.length=0;ctx.sofiaHead(0,{tucked:1});assert.ok(draws.length<loose-20,String(draws.length));assert.equal(draws.filter(x=>x.p[2]<-.08&&x.p[1]<-.12).length,0);
 const html=[...fs.readFileSync('index.html','utf8').matchAll(/<script src="([\w.-]+\.js)"><\/script>/g)].map(m=>m[1]),build=fs.readFileSync('build.cjs','utf8'),server=fs.readFileSync('server.cjs','utf8');
 assert.ok(html.includes('sofia.js')&&html.indexOf('sofia.js')<html.indexOf('duck.js'));for(const f of html){assert.ok(build.includes(`'${f}'`),f+' in build.cjs');assert.ok(server.includes(`'${f}'`),f+' in server.cjs');}
 console.log(`Passed: Sofia's curls leave her eyes and eyebrows free, the hair at the back makes room for the backpack (${loose} → ${draws.length} pieces), no blinking with calmer effects, and all ${html.length} scripts are built and served.`);}

// The Santa hat (24 November 2026): all through December, from the device's calendar, or on any day with ?jul=1 (and never with ?jul=0). It sits on top of her
// curls well above her eyebrows, lies on the pillow in bed, and is on her in the rocket's window and on the space suit's helmet. The red part is a tube that
// stands up from the brim and flops over to the side, with the pompom at its tip.
{const {santaSeason}=require('./game-core.js');
 for(const [y,m,day,h,on] of [[2026,11,30,23,false],[2026,12,1,0,true],[2026,12,24,18,true],[2026,12,31,23,true],[2027,1,1,0,false],[2027,6,15,12,false]])assert.equal(santaSeason(new Date(y,m-1,day,h,59)),on,`${day}.${m}.${y}`);
 assert.equal(santaSeason(new Date(2027,5,1),true),true,'?jul=1 in June');assert.equal(santaSeason(new Date(2026,11,24),false),false,'?jul=0 on Christmas Eve');
 const ectx=vm.createContext({Math,Float32Array});vm.runInContext(fs.readFileSync('engine.js','utf8')+';this.SANTA_HAT=SANTA_HAT;this.SpaceRenderer=SpaceRenderer;this.M=M;',ectx);
 const meshes={};for(const software of [false,true])ectx.SpaceRenderer.prototype.makeMeshes.call({software,mesh:(n,a)=>meshes[n+(software?'-sw':'')]=a});
 for(const name of ['hat','hat-sw']){const a=meshes[name];assert.ok(a.length>0&&a.length%18===0,name);let minY=1e9,maxY=-1e9,maxX=-1e9;for(let i=0;i<a.length;i+=6){minY=Math.min(minY,a[i+1]);maxY=Math.max(maxY,a[i+1]);maxX=Math.max(maxX,a[i]);
  assert.ok(Math.abs(Math.hypot(a[i+3],a[i+4],a[i+5])-1)<1e-6,'unit normals');}
  assert.ok(minY>=-.2&&maxY>1.2&&maxY<1.9&&maxX>.9,`${name}: stands up from the brim and flops over (y ${minY.toFixed(2)} to ${maxY.toFixed(2)}, x to ${maxX.toFixed(2)})`);}
 const [tx,ty]=ectx.SANTA_HAT.tip;assert.ok(tx>.9&&ty>.6&&ty<1.5,'the pompom hangs off to the side: '+tx.toFixed(2)+', '+ty.toFixed(2));
 // Sofia drawn in a given month and address: every piece with its place in the head's own space (a real transform stack, from engine.js).
 const M=ectx.M,at=(m,p)=>[0,1,2].map(k=>m[k]*p[0]+m[4+k]*p[1]+m[8+k]*p[2]+m[12+k]);
 const sofia=(date,search='')=>{const draws=[];let root=M.identity();const now=date.getTime(),D=class extends Date{constructor(...a){super(...(a.length?a:[now]));}static now(){return now;}};
  const ctx=vm.createContext({Math,Date:D,URLSearchParams,location:{search},state:{reduced:true},santaSeason,SANTA_HAT:ectx.SANTA_HAT,d:(mesh,p,s,c)=>draws.push({mesh,c,p:at(root,p)}),
   group:(p,s,r,fn)=>{const prev=root;root=M.mul(prev,M.model(p,s,r));fn();root=prev;},renderer:{draw(){}},document:{createElement:()=>({getContext:()=>new Proxy({},{get:()=>()=>({addColorStop(){}})})})}});
  vm.runInContext(fs.readFileSync('sofia.js','utf8')+';this.sofiaHead=sofiaHead;this.sofiaWindow=sofiaWindow;this.SANTA_RED=SANTA_RED;this.SANTA_FUR=SANTA_FUR;',ctx);
  const hatOf=list=>list.filter(x=>x.c===ctx.SANTA_RED||x.c===ctx.SANTA_FUR);
  const head=o=>{draws.length=0;ctx.sofiaHead(0,o);return hatOf(draws);},standing=head({}),lying=head({lying:true}),win=(draws.length=0,ctx.sofiaWindow([0,0,0],.13,0),hatOf(draws));return {standing,lying,win};};
 const nov=sofia(new Date(2026,10,24,12)),dec=sofia(new Date(2026,11,1,0,0,30)),jul=sofia(new Date(2026,10,24,12),'?jul=1'),off=sofia(new Date(2026,11,24,12),'?jul=0'),jan=sofia(new Date(2027,0,1,0,0,30));
 for(const [name,s] of [['24 November',nov],['?jul=0 on Christmas Eve',off],['1 January',jan]])assert.ok(!s.standing.length&&!s.lying.length&&!s.win.length,name+': no hat');
 for(const [name,s] of [['1 December',dec],['?jul=1 in November',jul]]){assert.ok(s.standing.some(x=>x.mesh==='hat')&&s.lying.some(x=>x.mesh==='hat')&&s.win.some(x=>x.mesh==='hat'),name+': the hat on her head, in bed and in the window');
  const low=Math.min(...s.standing.filter(x=>x.p[2]>0).map(x=>x.p[1]));assert.ok(low>.2,name+': the front of the hat is above her eyebrows ('+low.toFixed(3)+')');
  assert.ok(s.standing.every(x=>x.p[1]>.1)&&Math.max(...s.standing.map(x=>x.p[1]))>.5,name+': the hat is on top of her head');
  assert.ok(Math.max(...s.lying.map(x=>x.p[2]))>.2,name+': in bed the hat stands up off the pillow');}
 const effects=fs.readFileSync('effects.js','utf8'),game=fs.readFileSync('game.js','utf8');assert.ok(/sofiaHead\(t,\{compact:true\}\)\);if\(santaOn\(\)\)group\(.*santaHatShape\(t\)/.test(effects),'the hat on the helmet');
 assert.equal((game.match(/sofiaWindow\([^)]*,t\)/g)||[]).length,2,'both windows pass the time for the hat');
 console.log('Passed: the Santa hat from 1 December to 31 December (and with ?jul=1, never with ?jul=0), above her eyebrows, off the pillow in bed, in the window and on the helmet.');}

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
 // The guard against a start the page did not survive (24 November 2026): one crash and the voice still starts by itself; only after two in a row it waits for
 // the switch. Closing or hiding the page while it starts is no crash. An old mark (a time) counts as one. A failure is tried again twice, after 20 and 40 s.
 {const store=new Map(),on={},timers=[],doc={hidden:false,addEventListener:(t,f)=>on[t]=f};
  const sb=vm.createContext({window:{AudioContext:function(){}},Worker:class{postMessage(){}terminate(){}},WebAssembly,BigInt64Array,caches:{},queueMicrotask,document:doc,addEventListener:(t,f)=>on[t]=f,
   setTimeout:(fn,ms)=>timers.push({fn,ms}),clearTimeout(){},localStorage:{getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)}});
  vm.runInContext(fs.readFileSync('tts.js','utf8'),sb);const fresh=()=>vm.runInContext('new PiperVoice()',sb),crashes=()=>vm.runInContext('PiperVoice.crashes()',sb);
  let v=fresh();v.load();v.message({type:'starting'});assert.equal(crashes(),1,'the page went while starting');
  v=fresh();v.load();assert.equal(v.status,'loading','after one crash it starts again by itself');v.message({type:'starting'});assert.equal(crashes(),2);
  v=fresh();v.load();assert.equal(v.status,'failed');assert.equal(v.error,'crash','after two in a row it waits');assert.equal(timers.length,0,'and is not tried again by itself');
  v.load({force:true});assert.equal(v.status,'loading','the switch tries again');v.message({type:'starting'});v.message({type:'ready'});assert.equal(v.status,'ready');assert.equal(crashes(),0,'a good start clears it');
  v=fresh();v.load();v.message({type:'starting'});on.pagehide();assert.equal(crashes(),0,'closing the page while it starts is no crash');
  v=fresh();v.load();v.message({type:'starting'});doc.hidden=true;on.visibilitychange();assert.equal(crashes(),0,'nor is hiding it');doc.hidden=false;on.visibilitychange();assert.equal(crashes(),1,'back while still starting: it counts again');v.message({type:'ready'});
  v=fresh();doc.hidden=true;v.load();v.message({type:'starting'});assert.equal(crashes(),0,'starting while hidden is not counted');doc.hidden=false;v.message({type:'ready'});
  store.set('sofias-romreise-stemme-starter','1732445000000');assert.equal(crashes(),1,'an old mark counts once');v=fresh();v.load();assert.equal(v.status,'loading');store.clear();
  v=fresh();v.load();v.fail('nett');assert.equal(timers.at(-1).ms,20000);timers.at(-1).fn();assert.equal(v.status,'loading','tried again after 20 s');v.fail('nett');assert.equal(timers.at(-1).ms,40000);timers.at(-1).fn();
  const n=timers.length;v.fail('nett');assert.equal(timers.length,n,'twice, then it rests');}
 for(let i=0;i<9;i++)piper.remember('1|lang '+i,[new Float32Array(9e5)]);assert.ok(piper.cacheBytes<=24e6&&!piper.has('lang 0')&&piper.has('lang 8'),'the clip memory stays under 24 MB, oldest first out');
 // The woman's voice (tts/voice-shift.mjs): a voiced sound at 120 Hz with a man's formants comes out at about 204 Hz (1.7 times) with its formants about 18 %
 // higher, the same length and the same peak; a hiss stays a hiss; and it is quick (a few per cent of the time it takes to say).
 {const {womanVoice,FORMANT,PITCH}=await import('./tts/voice-shift.mjs'),sr=22050,n=Math.round(1.3*sr),x=new Float32Array(n);
  const res=(f,bw)=>{const r=Math.exp(-Math.PI*bw/sr),c=2*r*Math.cos(2*Math.PI*f/sr);return {a1:c,a2:-r*r,y1:0,y2:0};},R=[res(600,80),res(1100,90),res(2500,120)];let seed=3;const rnd=()=>(seed=(seed*1664525+1013904223)>>>0)/4294967296-.5;
  for(let i=0;i<n;i++){let v=i<sr?(i%Math.round(sr/120)===0?1:0):rnd()*.3;for(const f of R){const y=v+f.a1*f.y1+f.a2*f.y2;f.y2=f.y1;f.y1=y;v=y;}x[i]=v;}
  let peak=0;for(const v of x)peak=Math.max(peak,Math.abs(v));for(let i=0;i<n;i++)x[i]/=peak*1.25;
  const t0=performance.now(),y=womanVoice(x,sr),ms=performance.now()-t0;
  assert.equal(y.length,x.length,'the same length');const pk=a=>a.reduce((m,v)=>Math.max(m,Math.abs(v)),0);assert.ok(Math.abs(pk(y)-pk(x))<1e-6,'the same peak');
  const period=(a,from,len)=>{const r=[];let best=0;for(let k=Math.floor(sr/500);k<sr/60;k++){let c=0,e0=0,e1=0;for(let i=from;i<from+len;i++){c+=a[i]*a[i+k];e0+=a[i]*a[i];e1+=a[i+k]*a[i+k];}r[k]=c/Math.sqrt(e0*e1);best=Math.max(best,r[k]);}
   for(let k=Math.floor(sr/500)+1;k<sr/60-1;k++)if(r[k]>=best*.9&&r[k]>=r[k-1]&&r[k]>=r[k+1])return {hz:sr/k,r:best};return {hz:0,r:best};}; // the shortest lag near the best, not a multiple of the period
  const before=period(x,4000,2000),after=period(y,4000,2000);assert.ok(Math.abs(before.hz-120)<3);assert.ok(Math.abs(after.hz/before.hz-PITCH)<.08,`pitch ${before.hz.toFixed(0)} -> ${after.hz.toFixed(0)} Hz`);
  // The formants from the LPC envelope (order 14 over 0.2 s): the peaks near F1 (600 Hz) and F2 (1100 Hz).
  const formants=(a,from,len)=>{const n=14,r=new Float64Array(n+1);for(let k=0;k<=n;k++)for(let i=from;i<from+len-k;i++){const w=i0=>.5-.5*Math.cos(2*Math.PI*(i0-from)/len);r[k]+=a[i]*w(i)*a[i+k]*w(i+k);}
   let e=r[0];const c=new Float64Array(n+1);c[0]=1;for(let i=1;i<=n;i++){let acc=r[i];for(let j=1;j<i;j++)acc+=c[j]*r[i-j];const k=-acc/e,prev=c.slice();for(let j=1;j<i;j++)c[j]=prev[j]+k*prev[i-j];c[i]=k;e*=1-k*k;}
   const env=f=>{let re=0,im=0;for(let j=0;j<=n;j++){re+=c[j]*Math.cos(2*Math.PI*f*j/sr);im-=c[j]*Math.sin(2*Math.PI*f*j/sr);}return 1/Math.hypot(re,im);};
   const peak=(lo,hi)=>{let best=0,bf=0;for(let f=lo;f<=hi;f+=5){const v=env(f);if(v>best){best=v;bf=f;}}return bf;};return [peak(350,900),peak(900,1700)];};
  // The pitch alone (formant 1) keeps the formants where they were; the woman's voice has them higher by about FORMANT.
  const only=womanVoice(x,sr,{formant:1}),f0=formants(x,4000,4400),f1=formants(only,4000,4400),f2=formants(y,4000,4400);
  for(let i=0;i<2;i++){assert.ok(Math.abs(f1[i]/f0[i]-1)<.1,`the pitch alone keeps F${i+1}: ${f0[i]} -> ${f1[i]} Hz`);assert.ok(Math.abs(f2[i]/f0[i]-FORMANT)<.1,`F${i+1} up about ${FORMANT}: ${f0[i]} -> ${f2[i]} Hz`);}
  assert.ok(period(y,sr+2000,2000).r<.5,'the hiss is still a hiss');
  assert.ok(ms<400,'quick: '+ms.toFixed(0)+' ms for 1.3 s');}
 console.log('Passed: browser phonemes identical to Python Piper for '+cases.length+' sentences, stress fixed for Sofia and the space words, emoji not read aloud, a bounded clip cache, a crash guard that only counts real crashes (two in a row), retries, and the woman\'s voice (pitch 1.7, formants 1.18, same length).');
})().catch(err=>{console.error(err);process.exit(1);});
