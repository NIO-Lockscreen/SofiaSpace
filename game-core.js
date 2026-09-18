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
function accelerate(speed,correct){return correct?Math.min(3,speed+.35):Math.max(.65,speed-.35);}
function relaxSpeed(speed,dt,hold=0){if(hold>0)return speed;return speed>1?Math.max(1,speed-dt*.48):Math.min(1,speed+dt*.16);}
function formatTime(seconds){const n=Math.max(0,Math.ceil(seconds)),m=Math.floor(n/60),s=n%60;return m?(s?`${m} min ${s} sek`:`${m} min`):`${s} sek`;}
// A scenic route follows orbital order, using compressed positions for readable flybys.
// Real planets are not lined up; these waypoints are a teaching model.
function buildRoute(from,to){if(from.id===to.id)return [];const lo=Math.min(from.au,to.au),hi=Math.max(from.au,to.au),direction=Math.sign(to.au-from.au);const start=Math.sqrt(from.au),end=Math.sqrt(to.au);return BODIES.filter(p=>p.au>lo&&p.au<hi).sort((a,b)=>(a.au-b.au)*direction).map(body=>({body,fraction:(Math.sqrt(body.au)-start)/(end-start)}));}
// Rocket paint jobs. The star rocket is the first new colour; the rest open with the colour picker.
const SHIP_COLORS = [
 {id:'star',name:'Stjernerakett',body:'#ad83ff',accent:'#ff78bd'},
 {id:'mint',name:'Mintrakett',body:'#9ef0c6',accent:'#2fae86'},
 {id:'ocean',name:'Havrakett',body:'#8ed2ff',accent:'#3d78d8'},
 {id:'sunny',name:'Solrakett',body:'#ffe58a',accent:'#f2a33c'},
 {id:'cherry',name:'Kirsebærrakett',body:'#ffa7b6',accent:'#dd4a5e'},
 {id:'classic',name:'Klassisk rakett',body:'#f4f0e5',accent:'#e78457'}
];
function earnedRewards(visited){const set=new Set(visited);const planets=BODIES.filter(p=>p.id!=='earth'&&p.id!=='sun'&&set.has(p.id)).length;return {planets,graffiti:planets>=2,paint:planets>=4,palette:planets>=6,rainbow:BODIES.every(p=>set.has(p.id))};}
// Before the paint reward the rocket stays cream white; the picker only decides once it is unlocked.
function shipPaint(rewards,choice){const fallback=SHIP_COLORS.find(c=>c.id===(rewards.paint?'star':'classic'));return rewards.palette&&SHIP_COLORS.some(c=>c.id===choice)?SHIP_COLORS.find(c=>c.id===choice):fallback;}
if(typeof module!=='undefined')module.exports={BODIES,SHIP_COLORS,duration,accelerate,relaxSpeed,formatTime,buildRoute,earnedRewards,shipPaint};
