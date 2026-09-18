const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const{BODIES,MOONS,SHIP_COLORS,duration,accelerate,relaxSpeed,formatTime,buildRoute,earnedRewards,shipPaint,shipColorsFor,moonsOf}=require('./game-core.js');
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
for(const m of MOONS.slice(0,-1))start.add(m.id);assert.equal(earnedRewards(start).moons,MOONS.length-1);assert.equal(earnedRewards(start).gold,false);
start.add(MOONS.at(-1).id);assert.equal(earnedRewards(start).gold,true);assert.equal(earnedRewards(start).moons,MOONS.length);
const moonsOnly=new Set(['earth',...MOONS.map(m=>m.id)]);assert.equal(earnedRewards(moonsOnly).gold,false);assert.equal(earnedRewards(moonsOnly).moonMode,false);
console.log('Passed: unique planet counts, graffiti at two, new paint at four, colour picker at six, rainbow for all destinations, moon mode for all eight planets, gold only for every moon, and no reward for duplicate visits.');

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
