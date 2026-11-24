'use strict';
// Sofia herself (24 November 2026), drawn after two photos of her. Big, curly, dark brown hair that is lighter towards the ends, pushed back from
// the forehead and falling in curls past her ears to her shoulders, with a few corkscrew ringlets; strong dark eyebrows; blue-grey eyes; rosy cheeks
// and a wide smile with her top teeth showing. She wears her raspberry jumper with the sequin butterfly on the front.
// The face is painted on a picture wrapped round the head (one per expression, made once), so the eyes, brows and smile stay sharp up close.
// It goes straight to renderer.draw, since d() does not pass a picture on.
// Every scene that shows her uses this: at home, in her room, at the table, in bed, in the planet quiz, on the duck, in the space suit and behind the
// rocket's window.
const SOFIA={skin:'#f3caa6',hair:'#533526',hairMid:'#6d4833',hairLight:'#8c6141',hairTip:'#ab7d51',brow:'#3b2418',
 top:'#c95f78',topDark:'#a94c63',legs:'#34426d',shoe:'#f6ede0'};

// ---- The face picture ----
// The sphere wraps the picture from +x round the front (+z) to −x, so the front of the head is a quarter of the way across. The painter works in
// radians on the head, x to the right and y up as you look at her, and mirrors the picture so it reads the right way round on the head.
const sofiaFaces=new Map();
function sofiaFace(eyes='open',mouth='smile'){const key=eyes+'|'+mouth;if(sofiaFaces.has(key))return sofiaFaces.get(key);
 const W=1024,H=512,c=document.createElement('canvas');c.width=W;c.height=H;c.mipmap=true;const g=c.getContext('2d'),R=W/(Math.PI*2);
 g.fillStyle=SOFIA.skin;g.fillRect(0,0,W,H);g.setTransform(-R,0,0,-R,W/4,H/2);g.lineCap='round';g.lineJoin='round';
 const ellipse=(x,y,rx,ry,fill)=>{g.beginPath();g.ellipse(x,y,rx,ry,0,0,Math.PI*2);g.fillStyle=fill;g.fill();};
 const glow=(x,y,r,color)=>{const f=g.createRadialGradient(x,y,0,x,y,r);f.addColorStop(0,color);f.addColorStop(1,color.slice(0,7)+'00');g.fillStyle=f;g.fillRect(x-r,y-r,r*2,r*2);};
 // Rosy cheeks and a soft shade under the hairline.
 for(const s of [-1,1])glow(s*.5,-.3,.19,'#f2848088');
 // The eyebrows: thick and dark, a gentle arch, thickest at the inner end.
 for(const s of [-1,1]){const ex=s*.33;g.beginPath();g.moveTo(ex-s*.115,.135);g.quadraticCurveTo(ex+s*.0,.21,ex+s*.13,.15);g.quadraticCurveTo(ex+s*.02,.175,ex-s*.115,.095);g.closePath();g.fillStyle=SOFIA.brow;g.fill();g.strokeStyle=SOFIA.brow;g.lineWidth=.02;g.stroke();}
 // The eyes: blue-grey with a dark rim, a white sparkle, and lashes along the top. Shut, they are two soft curves with lashes.
 for(const s of [-1,1]){const ex=s*.33,ey=-.05;
  if(eyes==='open'){ellipse(ex,ey,.105,.12,'#fdfbf7');g.save();g.beginPath();g.ellipse(ex,ey,.105,.12,0,0,Math.PI*2);g.clip();
   const iris=g.createRadialGradient(ex,ey-.02,.01,ex,ey-.015,.085);iris.addColorStop(0,'#b9ccd2');iris.addColorStop(.55,'#7f9caa');iris.addColorStop(1,'#465f6d');ellipse(ex,ey-.015,.082,.09,iris);
   ellipse(ex,ey-.015,.04,.045,'#151b21');g.restore();
   ellipse(ex-.032,ey+.03,.026,.028,'#ffffff');ellipse(ex+.03,ey-.05,.012,.012,'#ffffffcc');
   g.beginPath();g.ellipse(ex,ey,.11,.125,0,Math.PI*.08,Math.PI*.92);g.strokeStyle='#2a1812';g.lineWidth=.03;g.stroke();
   for(const k of [0,1]){const a=Math.PI*(s>0?.1+k*.1:.9-k*.1),x0=ex+Math.cos(a)*.11,y0=ey+Math.sin(a)*.125;g.beginPath();g.moveTo(x0,y0);g.lineTo(x0+s*(.045-k*.012),y0+.03+k*.01);g.lineWidth=.016;g.stroke();}
   g.beginPath();g.ellipse(ex,ey,.1,.115,0,Math.PI*1.2,Math.PI*1.8);g.strokeStyle='#c99a80';g.lineWidth=.008;g.stroke();}
  else{g.beginPath();g.moveTo(ex-.1,ey+.01);g.quadraticCurveTo(ex,ey-.085,ex+.1,ey+.01);g.strokeStyle='#2a1812';g.lineWidth=.026;g.stroke();
   for(const k of [-1,0,1]){const x0=ex+k*.055,y0=ey-.035-(k?0:.01);g.beginPath();g.moveTo(x0,y0);g.lineTo(x0+k*.02,y0-.035);g.lineWidth=.012;g.stroke();}}}
 // A small nose: a little shade and a curve underneath.
 glow(0,-.24,.06,'#d9967a55');g.beginPath();g.moveTo(-.038,-.255);g.quadraticCurveTo(0,-.29,.038,-.255);g.strokeStyle='#c98668';g.lineWidth=.014;g.stroke();ellipse(-.012,-.215,.014,.01,'#ffe6d2aa');
 // The mouth.
 const lip='#a8404d',dark='#6f2230';
 if(mouth==='smile'||mouth==='open'){const big=mouth==='open',top=-.375,w=big?.23:.26,low=big?-.79:-.64;
  const path=()=>{g.beginPath();g.moveTo(-w,top+.02);g.quadraticCurveTo(0,top-(big?.03:.06),w,top+.02);g.quadraticCurveTo(w*.72,low+.06,0,low+(big?.07:.09));g.quadraticCurveTo(-w*.72,low+.06,-w,top+.02);g.closePath();};
  path();g.fillStyle=dark;g.fill();g.save();path();g.clip();
  ellipse(0,low+.04,w*.62,big?.11:.075,'#e06f7c');
  g.fillStyle='#fffaf1';g.beginPath();g.moveTo(-w,top+.03);g.quadraticCurveTo(0,top-(big?.03:.06),w,top+.03);g.lineTo(w,top-.06);g.lineTo(-w,top-.06);g.closePath();g.fill();
  g.beginPath();g.moveTo(-w*.9,top-.005);g.quadraticCurveTo(0,top-(big?.115:.135),w*.9,top-.005);g.lineTo(w*.9,top+.05);g.lineTo(-w*.9,top+.05);g.closePath();g.fill();
  g.strokeStyle='#e6dccd';g.lineWidth=.006;for(const x of [-.13,-.045,.045,.13]){g.beginPath();g.moveTo(x,top+.02);g.lineTo(x,top-(big?.075:.095)+Math.abs(x)*.25);g.stroke();}
  g.restore();path();g.strokeStyle=lip;g.lineWidth=.018;g.stroke();
  for(const s of [-1,1]){g.beginPath();g.moveTo(s*(w+.005),top+.045);g.quadraticCurveTo(s*(w+.03),top+.01,s*(w+.012),top-.02);g.strokeStyle='#d89a82';g.lineWidth=.01;g.stroke();}}
 else if(mouth.startsWith('chew')){const h=[.022,.038,.055][+mouth.slice(4)||0];ellipse(0,-.46,.085,h,'#c75966');ellipse(0,-.46,.06,h*.45,dark);}
 else{g.beginPath();g.moveTo(-.14,-.43);g.quadraticCurveTo(0,-.51,.14,-.43);g.strokeStyle=lip;g.lineWidth=.024;g.stroke();}
 sofiaFaces.set(key,c);return c;}

// ---- The hair ----
// Curl clumps in rings round the back and sides, wider and lighter further down, leaving the face free; the scalp under them; small curls on top;
// corkscrew ringlets along the bottom edge and two in front of her ears. Worked out once; the head only moves them a little.
const SOFIA_HAIR=(()=>{const hash=i=>{const x=Math.sin(i*127.1+11.7)*43758.5453;return x-Math.floor(x);},tones=[SOFIA.hair,SOFIA.hairMid,SOFIA.hairLight,SOFIA.hairTip],clumps=[],curls=[];
 // y, radius out from the head, how many, the size of each clump, where the gap for the face starts (radians from straight ahead), and the tone.
 const rows=[[.27,.2,6,.11,.6,0],[.17,.3,10,.125,1.05,0],[.05,.35,11,.13,1.2,1],[-.08,.38,12,.135,1.22,1],[-.2,.4,12,.135,1.15,2],[-.31,.4,12,.13,.98,2],[-.41,.36,11,.115,1.0,3]];
 let n=0;for(const [y,r,count,size,gap,tone] of rows)for(let i=0;i<count;i++){const k=(i+.5)/count,phi=gap+(Math.PI*2-gap*2)*k,j=hash(++n),s=size*(.85+.3*hash(n+50));
  clumps.push({p:[Math.sin(phi)*r*(.96+.08*j),y+(hash(n+90)-.5)*.05,Math.cos(phi)*r*.82-.07],s:[s,s*(.9+.2*j),s],c:tones[Math.max(0,Math.min(3,tone+(j>.68?1:j<.12?-1:0)))],ph:j*6.28,y});}
 for(let i=0;i<9;i++){const phi=(i%2?.5:-.5)*(.35+i*.13),j=hash(i+300),r=.27;clumps.push({p:[Math.sin(phi)*r*.9,.3-i*.008+j*.03,Math.cos(phi)*r*.55-.12-i*.02],s:[.075+j*.02,.06,.075+j*.02],c:tones[j>.6?1:0],ph:j*6.28,y:.3});}
 // Small curls along the hairline, so it is soft and curly rather than a straight edge.
 for(let i=0;i<11;i++){const a=(i/10-.5)*2.5,j=hash(i+400),s=.042+j*.02;clumps.push({p:[Math.sin(a)*.3,.165-Math.abs(a)*.075+j*.02,Math.cos(a)*.245-.02],s:[s,s*.85,s*.8],c:tones[j>.55?1:0],ph:j*6.28,y:.16});}
 for(let i=0;i<12;i++){const k=(i+.5)/12,phi=1.05+(Math.PI*2-2.1)*k,j=hash(i+200),r=.33;curls.push({p:[Math.sin(phi)*r,-.44-j*.05,Math.cos(phi)*r*.82-.07],len:.15+j*.07,c:j>.5?SOFIA.hairTip:SOFIA.hairLight,ph:j*6.28,tilt:Math.sin(phi)*.25});}
 for(const s of [-1,1])curls.push({p:[s*.285,.02,.095],len:.27,c:SOFIA.hairLight,ph:s+1,tilt:s*.12,front:true});
 return {clumps,curls};})();

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
// She blinks now and then.
function sofiaHead(t,o={}){const still=state.reduced,shut=o.eyes==='shut'||(!still&&(t+1.3)%4.1<.13);
 let mouth=o.mouth||'smile';if(mouth==='chew')mouth='chew'+(still?1:Math.min(2,Math.floor(Math.abs(Math.sin(t*14))*3)));
 renderer.draw('sphere',[0,0,0],[.31,.32,.29],SOFIA.skin,[0,0,0],.35,0,sofiaFace(shut?'shut':'open',mouth));
 d('sphere',[0,.055,-.045],[.336,.315,.315],SOFIA.hair);
 const tuck=o.tucked||0;
 for(const h of SOFIA_HAIR.clumps){if(o.compact&&h.y<-.25)continue;const back=h.p[2]<-.08&&h.y<-.12?1-tuck:1;if(back<=0)continue;const b=still?0:Math.sin(t*1.9+h.ph)*.006,sq=o.compact?.86:1;d('sphere',[h.p[0]*sq,h.p[1]+b+(1-back)*.12,h.p[2]*sq],h.s.map(v=>v*back),h.c);}
 if(o.compact)return;
 if(santaOn())santaHat(t,o.lying);
 for(const h of SOFIA_HAIR.curls){const back=h.p[2]<-.05?1-tuck:1;if(back<=0)continue;const sway=still?0:Math.sin(t*1.6+h.ph)*.12;d('curl',h.p,[.055,h.len*back,.055],h.c,[sway*.6,(h.ph-3.1)*.3,h.tilt+sway*(h.front?.3:1)]);}}

// ---- The whole of her ----
// Asleep, her eyes are shut and she stops waving. Cheering (jumping on the bed), both arms are up and she laughs.
// o (23 November 2026, mealtime): sit (her shins hang this far down from the seat), arms (draws her arms instead), mouth ('open', 'chew' or 'smile'),
// bag (0..1, the PEG backpack going on her back: her long hair at the back is tucked away so the backpack shows).
function character(t,asleep=false,cheer=false,o={}){const C=SOFIA;
 d('box',[0,.52,0],[.22,.33,.16],C.top);d('box',[0,.215,0],[.228,.035,.168],C.topDark);sofiaButterfly(t);
 group([0,1.09,0],[1,1,1],[0,0,0],()=>sofiaHead(t,{lying:asleep,eyes:asleep?'shut':'open',mouth:asleep?'rest':o.mouth||(cheer?'open':'smile'),tucked:o.bag}));
 if(o.sit)for(const x of [-.115,.115]){d('box',[x,.215,.15],[.09,.085,.16],C.legs);d('box',[x,.215-o.sit/2,.3],[.085,o.sit/2,.09],C.legs);d('sphere',[x,.25-o.sit,.36],[.12,.07,.17],C.shoe);}
 else for(const x of [-.115,.115]){d('box',[x,.13,0],[.09,.19,.105],C.legs);d('sphere',[x,.015,.06],[.12,.07,.17],C.shoe);}
 if(o.arms){o.arms();return;}
 const arm=(x,y,rz,hx,hy,w=.08)=>{d('box',[x,y,0],[w,.24,.09],C.top,[0,0,rz]);d('box',[x+(hx-x)*.82,y+(hy-y)*.82,0],[w+.012,.035,.1],C.topDark,[0,0,rz]);d('sphere',[hx,hy,0],[.10,.10,.10],C.skin);};
 if(cheer)arm(-.36,.8,.65-Math.sin(t*3)*.15,-.5,.96);else arm(-.34,.59,-.3,-.4,.36,.09);
 if(asleep)arm(.34,.59,.3,.4,.36,.09);else arm(.36,.8,-.65+Math.sin(t*3)*.15,.5,.96);}

// The sequin butterfly on the front of her jumper: pink and coral wings, a golden body, and sequins that catch the light.
// dy moves it up or down (she sits lower on the duck); z is the front of her jumper.
function sofiaButterfly(t,dy=0,z=.162){for(const s of [-1,1]){d('sphere',[s*.058,.63+dy,z],[.06,.048,.008],'#ff8fbd',[0,0,s*.45]);d('sphere',[s*.046,.545+dy,z],[.042,.036,.008],'#f7a080',[0,0,-s*.5]);
  for(let i=0;i<2;i++){const tw=state.reduced?.4:.25+.5*Math.max(0,Math.sin(t*2.3+i*2+s));d('sphere',[s*(.055+i*.02),.64-i*.035+dy,z+.007],[.011,.011,.005],i?'#8fe3ff':'#fff2b0',[],tw);}}
 d('box',[0,.59+dy,z+.002],[.009,.055,.008],'#e5c46a',[],.3);}

// Her face behind a round window (the rocket's, the rescue capsule's), with her curls round it. p is the middle of her face, r its radius. In December her Santa
// hat is squeezed in above her curls, flopping over to the side, and her face moves down a little to make room.
function sofiaWindow(p,r,t=0){if(santaOn()){p=[p[0],p[1]-r*.2,p[2]];r*=.85;group([p[0],p[1]+r*1.12,p[2]-.004*r/.13],[r*.95,r*.8,r*.3],[0,0,.15],()=>santaHatShape(t));}
const [x,y,z]=p,k=r/.13;d('sphere',[x,y+.012*k,z-.008*k],[r*1.32,r*1.25,.02*k],SOFIA.hair);
 for(let i=0;i<9;i++){const a=-.5+i*(Math.PI+1)/8;d('sphere',[x+Math.cos(a)*r*1.17,y+Math.sin(a)*r*1.1,z-.004*k],[.046*k,.046*k,.02*k],i%2?SOFIA.hairLight:SOFIA.hairMid);}
 renderer.draw('sphere',[x,y,z],[r*.95,r*1.05,r*.2],SOFIA.skin,[0,0,0],.35,0,sofiaFace());}
