'use strict';
// Sofia herself (26 November 2026): the same girl as in Sofia's car game (Sofiatur, girl.js), which the user likes better («Jeg liker også sofia modellen
// fra bilturen bedre enn den nye i romspillet. Bytt så de er like, bruk den fra bilturen.»). Brown hair with a fringe and two pigtails tied with pink
// bobbles, dark oval eyes with a white glint, rosy cheeks and a smile; a raspberry top with short sleeves, a purple flared skirt with a lilac hem, white
// socks and purple shoes. Made with this game's own shapes, in its own sizes (the head is as big as before, as everything in this game, so she still
// fits the table, the bed, the duck, the space suit and the rocket's window, and the spoon still reaches her mouth). The face is painted on a picture
// wrapped round the head (one per expression, made once), so it stays sharp up close; it goes straight to renderer.draw, since d() does not pass a
// picture on. (24 November 2026 to today she had big curls and a butterfly jumper, after two photos; that is in the git history.)
// Every scene that shows her uses this: at home, in her room, at the table, in bed, in the planet quiz, on the duck, in the space suit and behind the
// rocket's window.
const SOFIA={skin:'#f4cba9',hair:'#6b4226',top:'#e5528f',skirt:'#8e4fd0',hem:'#b98cf0',sock:'#fbfbf6',shoe:'#6a3fb0',tie:'#ff8cc0',
 eye:'#2a1a14',cheek:'#ff9aa8',mouth:'#b83a4b'};

// ---- The face picture ----
// The sphere wraps the picture from +x round the front (+z) to −x, so the front of the head is a quarter of the way across. The painter works in
// radians on the head, x to the right and y up as you look at her, and mirrors the picture so it reads the right way round on the head.
// As in the car game: big dark oval eyes with a white glint (shut: two little arcs), round pink cheeks, and a smile (open when she laughs).
const sofiaFaces=new Map();
function sofiaFace(eyes='open',mouth='smile'){const key=eyes+'|'+mouth;if(sofiaFaces.has(key))return sofiaFaces.get(key);
 const W=1024,H=512,c=document.createElement('canvas');c.width=W;c.height=H;c.mipmap=true;const g=c.getContext('2d'),R=W/(Math.PI*2);
 g.fillStyle=SOFIA.skin;g.fillRect(0,0,W,H);g.setTransform(-R,0,0,-R,W/4,H/2);g.lineCap='round';g.lineJoin='round';
 const ellipse=(x,y,rx,ry,fill)=>{g.beginPath();g.ellipse(x,y,rx,ry,0,0,Math.PI*2);g.fillStyle=fill;g.fill();};
 for(const s of [-1,1])ellipse(s*.6,-.36,.22,.15,SOFIA.cheek);
 for(const s of [-1,1]){const ex=s*.38,ey=-.03;
  if(eyes==='open'){ellipse(ex,ey,.13,.19,SOFIA.eye);ellipse(ex+s*.04,ey+.065,.05,.065,'#ffffff');}
  else{g.beginPath();g.arc(ex,ey+.06,.15,Math.PI*1.15,Math.PI*1.85);g.strokeStyle=SOFIA.eye;g.lineWidth=.05;g.stroke();}}
 if(mouth==='open')ellipse(0,-.44,.23,.18,SOFIA.mouth);
 else if(mouth.startsWith('chew'))ellipse(0,-.45,.12,[.035,.06,.085][+mouth.slice(4)||0],SOFIA.mouth);
 else{const r=mouth==='rest'?.13:.25;g.beginPath();g.arc(0,-.36,r,Math.PI*1.08,Math.PI*1.92);g.strokeStyle=SOFIA.mouth;g.lineWidth=mouth==='rest'?.04:.06;g.stroke();}
 sofiaFaces.set(key,c);return c;}

// ---- The hair ----
// The car game's hair in this head's sizes: a cap over the top and back, the long hair at the back, a fringe over the forehead with a piece to each side,
// and a pigtail on each side tied with a pink bobble. pieces: {p, s, r (turned about z), back (the long hair at the back)}; pigtails: where each hangs from.
const SOFIA_HAIR={pieces:[{p:[0,.086,-.04],s:[.336,.3,.32]},{p:[0,-.074,-.18],s:[.31,.345,.17],back:true},{p:[0,.17,.235],s:[.29,.11,.11]},
 {p:[-.142,.155,.25],s:[.18,.1,.097],r:.5},{p:[.142,.155,.25],s:[.18,.1,.097],r:-.5}],pigtails:[-1,1].map(s=>({s,p:[s*.304,.074,-.073]}))};

// ---- The Santa hat (24 November 2026) ----
// All through December Sofia wears a Santa hat: at home, in her room, at the table, in bed, in the planet quiz, on the duck, on top of the space suit's helmet
// and behind the rocket's and the rescue capsule's window. When is the device's own calendar (santaSeason in game-core.js), looked at every half minute, so it
// comes on at midnight on 1 December and goes at midnight on 1 January even with the game open. ?jul=1 in the address puts it on any day, ?jul=0 takes it off.
const SANTA_FORCE=(()=>{try{const v=new URLSearchParams(location.search).get('jul');return v===null?null:v!=='0';}catch{return null;}})();
let santaNow={on:false,at:-Infinity};
function santaOn(){const now=Date.now();if(now-santaNow.at>30000||now<santaNow.at)santaNow={on:santaSeason(new Date(now),SANTA_FORCE),at:now};return santaNow.on;}
// The hat, standing up along +y from its brim (radius 1 at y = 0; the red part is the 'hat' mesh, SANTA_HAT in engine.js): a fluffy white brim, the red hat
// flopping over towards +x, and a white pompom at the tip. The top sways a little.
const SANTA_RED='#d8262f',SANTA_FUR='#fbf7ef';
function santaHatShape(t){d('cylinder',[0,.04,0],[1.04,.17,1.04],SANTA_FUR);
 for(let i=0;i<16;i++){const a=i/16*Math.PI*2;d('sphere',[Math.cos(a)*1.02,.05+(i%2)*.05,Math.sin(a)*1.02],[.21,.2,.21],SANTA_FUR);}
 group([0,0,0],[1,1,1],[0,0,state.reduced?-.05:-.05-Math.sin(t*1.8)*.05],()=>{d('hat',[0,0,0],[1,1,1],SANTA_RED);d('sphere',SANTA_HAT.tip,[.3,.3,.3],SANTA_FUR);});}
// On her head (centre at the origin, facing +z): sitting back on her curls so her forehead shows, the top falling over behind her to her left. Lying in bed
// (lying) it is tipped up off the pillow, and the top falls over to the side on the pillow.
function santaHat(t,lying=false){if(lying)group([0,.26,0],[.33,.33,.33],[.45,0,0],()=>santaHatShape(t));else group([0,.255,-.07],[.33,.33,.33],[-.32,Math.PI/4,0],()=>santaHatShape(t));}

// Her head, centred on the origin and facing +z. o.eyes: 'open' or 'shut'; o.mouth: 'smile', 'open', 'chew' or 'rest'; o.compact keeps the hair
// inside the space suit's helmet; o.tucked (0..1) draws the long hair at the back up out of the way of the PEG backpack; o.lying: in bed, for the Santa hat.
// She blinks now and then, and her pigtails swing a little.
function sofiaHead(t,o={}){const still=state.reduced,shut=o.eyes==='shut'||(!still&&(t+1.3)%4.1<.13),tuck=o.tucked||0;
 let mouth=o.mouth||'smile';if(mouth==='chew')mouth='chew'+(still?1:Math.min(2,Math.floor(Math.abs(Math.sin(t*14))*3)));
 renderer.draw('sphere',[0,0,0],[.31,.32,.29],SOFIA.skin,[0,0,0],.35,0,sofiaFace(shut?'shut':'open',mouth));
 for(const s of [-1,1])d('sphere',[s*.31,-.012,0],[.057,.074,.053],SOFIA.skin);
 for(const h of SOFIA_HAIR.pieces){if(h.back){const sy=h.s[1]*(1-.45*tuck)*(o.compact?.8:1);d('sphere',[h.p[0],h.p[1]+h.s[1]-sy,h.p[2]],[h.s[0],sy,h.s[2]],SOFIA.hair);}else d('sphere',h.p,h.s,SOFIA.hair,[0,0,h.r||0]);}
 for(const {s,p} of SOFIA_HAIR.pigtails)group(p,[1,1,1],[0,0,still||o.lying?0:Math.sin(t*2.2+s)*.08],()=>{d('sphere',[0,0,0],[.066,.066,.066],SOFIA.tie);
  d('sphere',[s*.026,-.185,0],[.11,o.compact?.17:.246,.11],SOFIA.hair);if(!o.compact)d('sphere',[s*.041,-.381,.01],[.093,.123,.093],SOFIA.hair);});
 if(o.compact)return;
 if(santaOn())santaHat(t,o.lying);}

// ---- The whole of her ----
// A box or cylinder from a to b, w thick: her arms and legs.
function sofiaLimb(a,b,w,color,mesh='cylinder'){const v=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],len=Math.hypot(...v)||1e-6;d(mesh,[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2],[w,len/2,w],color,[Math.atan2(v[2],v[1]),0,-Math.asin(Math.max(-1,Math.min(1,v[0]/len)))]);}
// An arm from the shoulder a to the hand h: a short raspberry sleeve, then her arm and hand.
function sofiaArm(a,h){const m=a.map((v,i)=>v+(h[i]-v)*.34);sofiaLimb(a,m,.085,SOFIA.top);sofiaLimb(m,h,.058,SOFIA.skin);d('sphere',h,[.08,.08,.08],SOFIA.skin);}
// The flared skirt: a cone cut off at the top (top radius .78 of the bottom), y from −1 to 1. Made the first time she is drawn.
function sofiaSkirtMesh(){if(renderer.meshes.skirt)return;const out=[],n=24,T=.78;
 const tri=(a,b,c,o)=>{if(dot(cross(sub(b,a),sub(c,a)),o)<0)[b,c]=[c,b];const nn=norm(cross(sub(b,a),sub(c,a)));for(const q of [a,b,c])out.push(...q,...nn);};
 for(let i=0;i<n;i++){const a0=i*Math.PI*2/n,a1=(i+1)*Math.PI*2/n,P=(a,y,r)=>[Math.cos(a)*r,y,Math.sin(a)*r],o=[Math.cos((a0+a1)/2),.2,Math.sin((a0+a1)/2)];
  tri(P(a0,-1,1),P(a1,-1,1),P(a1,1,T),o);tri(P(a0,-1,1),P(a1,1,T),P(a0,1,T),o);tri([0,-1,0],P(a1,-1,1),P(a0,-1,1),[0,-1,0]);}
 renderer.setMesh('skirt',out);}
// Her skirt from the waist (y) down to the hem (y − h), r wide at the hem.
function sofiaSkirt(y,h,r){sofiaSkirtMesh();d('skirt',[0,y-h/2,0],[r,h/2,r*.78],SOFIA.skirt);d('cylinder',[0,y-h+.02,0],[r*1.01,.022,r*.79],SOFIA.hem);d('box',[0,y+.012,0],[.228,.02,.168],SOFIA.hem);}
// A leg from the hip down: her leg, a white sock and a purple shoe (pointing +z). top: the hip; foot: the ankle.
function sofiaLeg(top,foot){const k=.55,m=top.map((v,i)=>v+(foot[i]-v)*k);sofiaLimb(top,m,.072,SOFIA.skin);sofiaLimb(m,foot,.078,SOFIA.sock);d('box',[foot[0],foot[1]-.005,foot[2]+.05],[.09,.045,.15],SOFIA.shoe);}
// Asleep, her eyes are shut and she stops waving. Cheering (jumping on the bed), both arms are up and she laughs.
// o (23 November 2026, mealtime): sit (her shins hang this far down from the seat), arms (draws her arms instead), mouth ('open', 'chew' or 'smile'),
// bag (0..1, the PEG backpack going on her back: her long hair at the back is tucked away so the backpack shows).
function character(t,asleep=false,cheer=false,o={}){const C=SOFIA;
 // the top from the waist up (a box, so the PEG backpack's straps lie flat on it), and the skirt
 d('box',[0,.65,0],[.22,.2,.16],C.top);sofiaSkirt(.44,.29,.3);
 group([0,1.09,0],[1,1,1],[0,0,0],()=>sofiaHead(t,{lying:asleep,eyes:asleep?'shut':'open',mouth:asleep?'rest':o.mouth||(cheer?'open':'smile'),tucked:o.bag}));
 if(o.sit)for(const x of [-.115,.115]){sofiaLimb([x,.215,0],[x,.215,.3],.078,C.skin);sofiaLeg([x,.215,.3],[x,.25-o.sit,.3]);}
 else for(const x of [-.115,.115])sofiaLeg([x,.36,0],[x,.05,0]);
 if(o.arms){o.arms();return;}
 const wave=state.reduced?0:Math.sin(t*3)*.04;
 sofiaArm([-.3,.78,0],cheer?[-.5,.96+wave,0]:[-.4,.36,0]);sofiaArm([.3,.78,0],asleep?[.4,.36,0]:[.5,.96-wave,0]);}

// Her face behind a round window (the rocket's, the rescue capsule's): her hair round it, the fringe over her forehead and the pigtails with their bobbles.
// p is the middle of her face, r its radius. In December her Santa hat is squeezed in above, flopping over to the side, and her face moves down to make room.
function sofiaWindow(p,r,t=0){if(santaOn()){p=[p[0],p[1]-r*.2,p[2]];r*=.85;group([p[0],p[1]+r*1.12,p[2]-.004*r/.13],[r*.95,r*.8,r*.3],[0,0,.15],()=>santaHatShape(t));}
 const [x,y,z]=p,k=r/.13;d('sphere',[x,y+.012*k,z-.008*k],[r*1.22,r*1.2,.02*k],SOFIA.hair);
 for(const s of [-1,1]){d('sphere',[x+s*r*1.18,y-r*.25,z-.004*k],[.038*k,.07*k,.02*k],SOFIA.hair);d('sphere',[x+s*r*1.08,y+r*.38,z-.002*k],[.022*k,.022*k,.014*k],SOFIA.tie);}
 renderer.draw('sphere',[x,y,z],[r*.95,r*1.05,r*.2],SOFIA.skin,[0,0,0],.35,0,sofiaFace());d('sphere',[x,y+r*.74,z+.006*k],[r*.88,r*.3,.03*k],SOFIA.hair);}
