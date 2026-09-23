/* Sofias romreise — gameplay and child-friendly facts. */
const BODIES = [
 {id:'sun',name:'Sola',word:'SOLA',au:0,color:'#ffb62e',type:'Stjerne',fact:'Sola er en stjerne! Den gir oss lys og varme. Den er altfor varm til å lande på.',effect:'solar',size:3.4},
 {id:'mercury',name:'Merkur',word:'MERKUR',au:.39,color:'#b7ada7',type:'Planet 1',fact:'Merkur er den minste planeten. Den er nærmest sola og har mange kratere.',effect:'crater',size:2.2},
 {id:'venus',name:'Venus',word:'VENUS',au:.72,color:'#efbb76',type:'Planet 2',fact:'Venus er den varmeste planeten. Et tykt teppe av skyer holder på varmen.',effect:'cloud',size:2.6},
 {id:'earth',name:'Jorda',word:'JORDA',au:1,color:'#54bcd1',type:'Planet 3 · Hjemme',fact:'Jorda er hjemmet vårt! Her finnes luft vi kan puste i, flytende vann, dyr og skoger.',effect:'home',size:2.7},
 {id:'mars',name:'Mars',word:'MARS',au:1.52,color:'#e57d57',type:'Planet 4',fact:'Mars kalles den røde planeten. Rust i støvet gjør den rød. Roboter utforsker Mars!',effect:'dust',size:2.4},
 {id:'jupiter',name:'Jupiter',word:'JUPITER',au:5.2,color:'#d6a376',type:'Planet 5',fact:'Jupiter er den største planeten! Den har en kjempestor storm som ser ut som en rød flekk.',effect:'storm',size:3.3},
 {id:'saturn',name:'Saturn',word:'SATURN',au:9.58,color:'#f2d99b',type:'Planet 6',fact:'Saturn har flotte ringer. Ringene er laget av mange små og store biter av is og stein.',effect:'rings',size:2.7},
 {id:'uranus',name:'Uranus',word:'URANUS',au:19.2,color:'#91dadb',type:'Planet 7',fact:'Uranus er en iskjempe. Den snurrer nesten på siden, som en ball som ruller!',effect:'tilt',size:2.8},
 {id:'neptune',name:'Neptun',word:'NEPTUN',au:30.05,color:'#568aec',type:'Planet 8',fact:'Neptun er planeten lengst fra sola. Her blåser det utrolig kraftige vinder!',effect:'wind',size:2.7},
 {id:'pluto',name:'Pluto',word:'PLUTO',au:39.48,color:'#c7b4ad',type:'Dvergplanet',fact:'Pluto er en dvergplanet. Den er mindre enn månen vår og har et lyst område som ligner et hjerte.',effect:'ice',size:2.1}
];
// A compressed game distance scale, five times the original journey durations.
// Venus is the nearest destination from Earth on this average-orbit model: 60 s.
// These are game times, not current Earth-to-planet distances or real travel times.
function duration(from,to){return from.id===to.id?0:5*Math.round(8+52*Math.sqrt(Math.abs(from.au-to.au)/38.48));}
function accelerate(speed,correct){return correct?speed+.35:Math.max(.65,speed-.35);}
function relaxSpeed(speed,dt,hold=0){if(hold>0)return speed;return speed>1?Math.max(1,speed-dt*(.48+Math.max(0,speed-3)*1.1)):Math.min(1,speed+dt*.16);}
function formatTime(seconds){const n=Math.max(0,Math.ceil(seconds)),m=Math.floor(n/60),s=n%60;return m?(s?`${m} min ${s} sek`:`${m} min`):`${s} sek`;}
// A scenic route follows orbital order, using compressed positions for readable flybys.
// Real planets are not lined up; these waypoints are a teaching model.
function buildRoute(from,to){if(from.id===to.id)return [];const lo=Math.min(from.au,to.au),hi=Math.max(from.au,to.au),direction=Math.sign(to.au-from.au);const start=Math.sqrt(from.au),end=Math.sqrt(to.au);return BODIES.filter(p=>p.au>lo&&p.au<hi).sort((a,b)=>(a.au-b.au)*direction).map(body=>({body,fraction:(Math.sqrt(body.au)-start)/(end-start)}));}
// Moon mode: the real moons of every planet that has one. Mercury and Venus have none,
// which is a fact worth meeting on the map. Each moon borrows its planet's orbit distance,
// so travel times and the flyby route work out of the box; hops inside a system take 40 s.
const MOONS = [
 {id:'moon',name:'Månen',word:'MÅNEN',parent:'earth',color:'#d5d1c6',style:'crater',size:1.9,bead:.26,orbit:2.2,speed:.46,fact:'Månen er vår egen måne. Den lyser fordi sola skinner på den, og den er full av store kratere.'},
 {id:'phobos',name:'Phobos',word:'PHOBOS',parent:'mars',color:'#9a8b7e',style:'crater',size:1.1,bead:.10,orbit:1.6,speed:.72,fact:'Phobos er den største av de to små månene til Mars. Den ser ut som en potet full av kratere.'},
 {id:'deimos',name:'Deimos',word:'DEIMOS',parent:'mars',color:'#b0a08c',style:'crater',size:1.0,bead:.09,orbit:2.2,speed:.48,fact:'Deimos er den minste månen til Mars. Den er liten, mørk og dekket av fint støv.'},
 {id:'io',name:'Io',word:'IO',parent:'jupiter',color:'#f2d66a',style:'spots',size:1.7,bead:.17,orbit:1.5,speed:.62,fact:'Io har flere vulkaner enn noe annet sted vi kjenner til. Den er gul og oransje av svovel.'},
 {id:'europa',name:'Europa',word:'EUROPA',parent:'jupiter',color:'#e6ddc9',style:'cracks',size:1.7,bead:.16,orbit:1.95,speed:.47,fact:'Europa har et skall av is med lange sprekker. Under isen tror forskerne det finnes et stort hav.'},
 {id:'ganymedes',name:'Ganymedes',word:'GANYMEDES',parent:'jupiter',color:'#b8ab9c',style:'crater',size:2.2,bead:.21,orbit:2.45,speed:.35,fact:'Ganymedes er den største månen i hele solsystemet. Den er faktisk større enn planeten Merkur!'},
 {id:'callisto',name:'Callisto',word:'CALLISTO',parent:'jupiter',color:'#8e8275',style:'crater',size:1.9,bead:.19,orbit:2.95,speed:.26,fact:'Callisto er dekket av kratere over alt. Overflaten er en av de eldste vi vet om.'},
 {id:'titan',name:'Titan',word:'TITAN',parent:'saturn',color:'#e8a94e',style:'haze',size:2.1,bead:.22,orbit:2.5,speed:.33,fact:'Titan er den største månen til Saturn. Den har tykk oransje luft og innsjøer som ikke er av vann.'},
 {id:'enceladus',name:'Enceladus',word:'ENCELADUS',parent:'saturn',color:'#eef4f6',style:'stripes',size:1.3,bead:.12,orbit:3.05,speed:.5,fact:'Enceladus er hvit og iskald. Fra sprekker ved sydpolen spruter den fontener av is ut i rommet!'},
 {id:'titania',name:'Titania',word:'TITANIA',parent:'uranus',color:'#c3b3aa',style:'crater',size:1.5,bead:.15,orbit:2.4,speed:.4,fact:'Titania er den største månen til Uranus. Den er iskald og har lange, dype daler.'},
 {id:'miranda',name:'Miranda',word:'MIRANDA',parent:'uranus',color:'#cfd4d6',style:'crater',size:1.2,bead:.11,orbit:2.95,speed:.56,fact:'Miranda ser ut som den er satt sammen av biter. Her finnes noen av de høyeste stupene i solsystemet.'},
 {id:'triton',name:'Triton',word:'TRITON',parent:'neptune',color:'#dfe9ee',style:'stripes',size:1.7,bead:.18,orbit:2.1,speed:.38,fact:'Triton går rundt Neptun motsatt vei av alle andre store måner. Den har gysere som spruter kald gass.'},
 {id:'charon',name:'Charon',word:'CHARON',parent:'pluto',color:'#a8a29b',style:'crater',size:1.6,bead:.20,orbit:2.2,speed:.34,fact:'Charon er nesten like stor som Pluto selv. De to snurrer rundt hverandre som et par som danser.'}
];
// Each moon travels with its planet and is labelled by it, so the data above stays short.
MOONS.forEach((m,i)=>{const parent=BODIES.find(p=>p.id===m.parent);m.au=parent.au;m.type='Måne · '+parent.name;m.phase=i*1.7;});
function moonsOf(id){return MOONS.filter(m=>m.parent===id);}
// Rocket paint jobs. The star rocket is the first new colour; the rest open with the colour picker.
const SHIP_COLORS = [
 {id:'star',name:'Stjernerakett',body:'#ad83ff',accent:'#ff78bd'},
 {id:'mint',name:'Mintrakett',body:'#9ef0c6',accent:'#2fae86'},
 {id:'ocean',name:'Havrakett',body:'#8ed2ff',accent:'#3d78d8'},
 {id:'sunny',name:'Solrakett',body:'#ffe58a',accent:'#f2a33c'},
 {id:'cherry',name:'Kirsebærrakett',body:'#ffa7b6',accent:'#dd4a5e'},
 {id:'classic',name:'Klassisk rakett',body:'#f4f0e5',accent:'#e78457'},
 {id:'gold',name:'Gullrakett',body:'#f7cf55',accent:'#b87d1e',needs:'gold'}
];
// A colour with a needs field only appears once that reward is earned.
function shipColorsFor(rewards){return SHIP_COLORS.filter(c=>!c.needs||rewards[c.needs]);}
function earnedRewards(visited){const set=new Set(visited);const planets=BODIES.filter(p=>p.id!=='earth'&&p.id!=='sun'&&set.has(p.id)).length,moons=MOONS.filter(m=>set.has(m.id)).length;return {planets,moons,graffiti:planets>=2,paint:planets>=4,palette:planets>=6,rainbow:BODIES.every(p=>set.has(p.id)),moonMode:planets>=8,gold:planets>=8&&moons===MOONS.length};}
// Before the paint reward the rocket stays cream white; the picker only decides once it is unlocked.
function shipPaint(rewards,choice){const open=shipColorsFor(rewards),fallback=open.find(c=>c.id===(rewards.gold?'gold':rewards.paint?'star':'classic'));return rewards.palette&&open.some(c=>c.id===choice)?open.find(c=>c.id===choice):fallback;}
// The asteroid belt lies between Mars and Jupiter. Trips that cross it fly straight through the rocks.
const BELT={id:'belt',name:'Asteroidebeltet',color:'#b89c7c',au:2.7};
function tripRoute(from,to){const route=buildRoute(from,to),lo=Math.min(from.au,to.au),hi=Math.max(from.au,to.au);if(!(lo<BELT.au&&hi>BELT.au))return route;const fraction=(Math.sqrt(BELT.au)-Math.sqrt(from.au))/(Math.sqrt(to.au)-Math.sqrt(from.au));return [...route,{body:BELT,fraction}].sort((a,b)=>a.fraction-b.fraction);}
// Something fun to do on every world. Gas and ice giants are played from orbit, the rest on the ground.
// Every game counts up and cannot be lost. Moons share one game: jumping high in weak gravity.
const PLAYS={
 mercury:{kind:'meteors',title:'Meteorregn',icon:'☄️',goal:8,task:'Trykk på meteorene!',intro:'Se, Sofia! Meteorer suser mot Merkur. Trykk på dem, så blir de til stjernestøv!',outro:'Så flott, Sofia! Merkur har nesten ingen luft som beskytter den. Derfor har den så mange kratere.'},
 venus:{kind:'clouds',title:'Blås bort skyene',icon:'☁️',goal:8,task:'Trykk på skyene!',intro:'Venus er dekket av tykke skyer. Trykk på skyene og blås dem bort!',outro:'Bra, Sofia! Under skyene er Venus varmere enn inni en stekeovn!'},
 mars:{kind:'rover',title:'Robotbilen',icon:'🪨',goal:6,task:'Trykk på steinene som glitrer!',intro:'Robotbilen på Mars samler steiner. Trykk på steinene som glitrer, så hopper de opp i bilen!',outro:'Supert, Sofia! Forskerne studerer steiner fra Mars. De tror det rant vann her for lenge, lenge siden.'},
 jupiter:{kind:'moons',title:'Tell månene',icon:'🌕',goal:4,task:'Trykk på de fire store månene og tell dem!',intro:'Jupiter har mange måner. Trykk på de fire store månene, så teller vi dem sammen!',outro:'Fire store måner! Og vet du hva? Jupiter har mer enn nitti måner til sammen!'},
 saturn:{kind:'ice',title:'Isbiter i ringene',icon:'🧊',goal:8,task:'Trykk på isbitene som glitrer!',intro:'Ringene til Saturn er laget av is og stein. Trykk på isbitene som glitrer!',outro:'Så mye is! Noen biter i ringene er små som støvkorn, og andre er store som fjell.'},
 uranus:{kind:'diamonds',title:'Diamantregn',icon:'💎',goal:10,task:'Fang diamantene!',intro:'Forskerne tror at det kanskje regner diamanter dypt inne i Uranus! Trykk på diamantene og fang dem!',outro:'For en skatt, Sofia! Uranus ruller rundt sola på siden, som en ball.'},
 neptune:{kind:'letters',title:'Bokstavstorm',icon:'🌬️',word:'NEPTUN',goal:6,task:'Fang bokstavene i riktig rekkefølge!',intro:'Oi! Den sterke vinden på Neptun har blåst bort bokstavene. Fang bokstavene i Neptun, én og én!',outro:'Du stavet Neptun, Sofia! Vinden på Neptun er den sterkeste i hele solsystemet.'},
 pluto:{kind:'snowman',title:'Snømann på Pluto',icon:'⛄',goal:6,task:'Trykk på det som glitrer, og bygg en snømann!',intro:'Pluto er full av is. La oss bygge en snømann! Trykk på snøballen som glitrer.',outro:'For en fin snømann, Sofia! Pluto er så langt borte at sola bare ser ut som en lys stjerne.'},
 moon:{kind:'hop',title:'Månehopp',icon:'⭐',goal:5,task:'Trykk på en stjerne, så hopper Sofia!',intro:'På en måne kan du hoppe kjempehøyt! Trykk på stjernene, så hopper Sofia opp og tar dem.',outro:'Så høyt du hoppet, Sofia! På en måne veier du mye mindre enn hjemme på jorda.'}
};
function playFor(p){return p?PLAYS[p.id]||(p.parent?PLAYS.moon:null):null;}
// The reading game in the house: two names to choose from at first, more as Sofia reads more.
// While there are few choices, the names start with different letters, so the first letter is enough.
function quizChoiceCount(correct){return correct<6?2:correct<20?3:4;}
function quizRound(correct,recent=[],rand=Math.random){const count=quizChoiceCount(correct),pool=BODIES.filter(p=>!recent.includes(p.id)),answer=pool[Math.floor(rand()*pool.length)%pool.length];const shuffle=list=>{const out=[...list];for(let i=out.length-1;i>0;i--){const j=Math.floor(rand()*(i+1))%(i+1);[out[i],out[j]]=[out[j],out[i]];}return out;};const others=BODIES.filter(p=>p.id!==answer.id&&(count===4||p.word[0]!==answer.word[0])),picked=[];for(const p of shuffle(others)){if(picked.length>=count-1)break;if(count===4||!picked.some(q=>q.word[0]===p.word[0]))picked.push(p);}return {answer,choices:shuffle([answer,...picked])};}
if(typeof module!=='undefined')module.exports={BODIES,MOONS,SHIP_COLORS,BELT,PLAYS,duration,accelerate,relaxSpeed,formatTime,buildRoute,tripRoute,earnedRewards,shipPaint,shipColorsFor,moonsOf,playFor,quizChoiceCount,quizRound};
