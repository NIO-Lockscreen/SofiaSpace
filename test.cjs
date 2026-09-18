const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const{BODIES,duration,accelerate,relaxSpeed,formatTime,buildRoute,earnedRewards}=require('./game-core.js');
const byId=id=>BODIES.find(p=>p.id===id),earth=byId('earth');
assert.equal(duration(earth,byId('venus')),60);assert.equal(duration(earth,byId('pluto')),300);assert.equal(duration(earth,earth),0);
assert.equal(Math.min(...BODIES.filter(p=>p.id!=='earth').map(p=>duration(earth,p))),60);
for(const from of BODIES)for(const to of BODIES){assert.equal(duration(from,to),duration(to,from));const route=buildRoute(from,to);assert.equal(new Set(route.map(e=>e.body.id)).size,route.length);for(let i=0;i<route.length;i++){assert.ok(route[i].fraction>0&&route[i].fraction<1);if(i)assert.ok(route[i].fraction>route[i-1].fraction);assert.notEqual(route[i].body.id,to.id);assert.notEqual(route[i].body.id,from.id);}}
assert.deepEqual(buildRoute(earth,byId('pluto')).map(e=>e.body.id),['mars','jupiter','saturn','uranus','neptune']);
assert.deepEqual(buildRoute(byId('pluto'),earth).map(e=>e.body.id),['neptune','uranus','saturn','jupiter','mars']);
assert.deepEqual(buildRoute(earth,byId('sun')).map(e=>e.body.id),['venus','mercury']);assert.deepEqual(buildRoute(earth,byId('venus')),[]);
assert.ok(accelerate(1,true)>1);assert.ok(accelerate(1,false)<1);assert.equal(accelerate(3,true),3);assert.equal(accelerate(.65,false),.65);
let speed=3;for(let i=0;i<60;i++)speed=relaxSpeed(speed,.1);assert.equal(speed,1);assert.equal(relaxSpeed(3,1,1),3);
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

const start=new Set(['earth']);assert.equal(earnedRewards(start).graffiti,false);start.add('sun');assert.equal(earnedRewards(start).planets,0);start.add('venus');start.add('mars');assert.equal(earnedRewards(start).graffiti,true);assert.equal(earnedRewards(start).paint,false);start.add('mars');assert.equal(earnedRewards(start).planets,2);for(const id of ['mercury','jupiter','saturn'])start.add(id);assert.equal(earnedRewards(start).paint,true);assert.equal(earnedRewards(start).rainbow,false);for(const p of BODIES)start.add(p.id);assert.equal(earnedRewards(start).rainbow,true);
console.log('Passed: unique planet counts, graffiti at two, paint at five, rainbow for all destinations, and no reward for duplicate visits.');
