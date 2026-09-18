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
if(typeof module!=='undefined')module.exports={BODIES,MOONS,SHIP_COLORS,duration,accelerate,relaxSpeed,formatTime,buildRoute,earnedRewards,shipPaint,shipColorsFor,moonsOf};
