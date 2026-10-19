/* The duck from Sofia's car game (Sofiatur, rides.js): a mallard drake she can fly through space on, sitting on its back.
   It opens with every planet and moon visited. Built from the same parts, sizes and colours as the car game's duck, turned so
   that forward is +z like Sofia herself. The feet stand on y = 0; with Sofia on its back it is about as tall as the rocket. */
const DUCK={grey:'#9a9186',wing:'#7b7268',chestnut:'#6e3a26',green:'#17643a',white:'#f3f0e6',bill:'#e5b52b',mouth:'#b5524a',orange:'#f08a24',black:'#1c1f21',blue:'#3055b5'};
const duckClock={t:0,phase:0};
// The duck is the ship once it is earned and Sofia has picked it on the home screen.
function duckFlying(){return !!rewards.duck&&state.ship==='duck';}
// fly: wings spread and beating, legs tucked back. flap 0..1: wing beats on the ground. fire: the ship's glowing trail behind the tail.
// rider: Sofia on its back. quack 0..1 opens the bill.
function duck(t,{fly=false,flap=0,fire=false,rider=false,quack=0}={}){
 // The wings beat faster when Sofia spells fast. One clock for every duck in the frame, so a beat never jumps when the speed changes.
 if(t!==duckClock.t){duckClock.phase+=Math.max(0,Math.min(.1,t-duckClock.t))*(fly?6+Math.min(8,state.speed)*1.4:11);duckClock.t=t;}
 const ph=state.reduced?.6:duckClock.phase,c=DUCK,spread=fly?1:Math.min(1,flap),beat=fly||flap?Math.sin(ph):0,bob=fly&&!state.reduced?Math.sin(ph+1.4)*.08:0;
 group([0,bob,0],[.62,.62,.62],[0,0,0],()=>{
  // The grey body, the chestnut breast in front and the pale belly.
  d('sphere',[0,1.45,-.1],[.95,.78,1.55],c.grey);d('sphere',[0,1.65,1.05],[.82,.72,.75],c.chestnut);d('sphere',[0,1.15,-.2],[.7,.35,1.1],c.white);
  // Wings with the blue patch: folded along the flank on the ground, out to the sides and beating in flight.
  for(const s of [-1,1]){const lift=spread*(.3+(state.reduced?0:.5*beat)),mix=(a,b)=>a+(b-a)*spread;
   group([s*.76,1.7,-.2],[1,1,1],[0,0,s*lift],()=>{d('sphere',[s*mix(.1,.95),0,mix(-.2,-.1)],[mix(.26,1.05),mix(.42,.1),mix(1.2,.58)],c.wing);
    d('sphere',[s*mix(.34,1.05),mix(.05,.08),mix(-.5,-.38)],[mix(.05,.38),mix(.16,.05),mix(.4,.15)],c.blue);});}
  // The black tail with the drake's little curl, wagging.
  group([0,1.7,-1.55],[1,1,1],[0,state.reduced?0:Math.sin(t*6)*.2,0],()=>{d('sphere',[0,.12,-.25],[.5,.3,.45],c.black);
   for(let i=0;i<5;i++){const a=-.9+i*.85;d('sphere',[0,.48+Math.sin(a)*.14,-.2+Math.cos(a)*.14],[.06,.06,.06],c.black);}});
  // Neck and head: green with the white collar, the yellow bill that opens to quack, black eyes with a glint.
  // In flight the neck stretches forward; on the ground the duck looks around.
  group([0,2.05,1.35],[1,1,1],[fly?.5:quack*.2,fly||state.reduced?0:Math.sin(t*.7)*.3,0],()=>{
   d('sphere',[0,.42,.05],[.38,.55,.38],c.green);d('sphere',[0,.1,0],[.41,.09,.41],c.white);d('sphere',[0,.95,.2],[.48,.45,.52],c.green);
   d('sphere',[0,.84,.78],[.22,.08,.38],c.bill);d('sphere',[0,.78,.7],[.15,.02,.3],c.mouth);
   group([0,.78,.42],[1,1,1],[.55*quack,0,0],()=>d('sphere',[0,-.03,.3],[.19,.055,.32],c.bill));
   for(const s of [-1,1]){d('sphere',[s*.36,1.05,.47],[.07,.08,.07],c.black);d('sphere',[s*.4,1.08,.51],[.02,.025,.02],'#ffffff',[],.6);}});
  // Orange legs with webbed feet: standing on the ground, tucked back and paddling in flight.
  for(const s of [-1,1])group([s*.42,.95,-.15],[1,1,1],[fly?1.2+(state.reduced?0:Math.sin(ph*.5+s)*.12):0,0,0],()=>{
   d('cylinder',[0,-.45,0],[.08,.45,.08],c.orange);d('cone',[0,-.92,.12],[.3,.26,.035],c.orange,[-Math.PI/2,0,0]);});
  if(rider)group([0,2.18,-.2],[.9,.9,.9],[0,0,0],()=>duckRider(t,fly));
  // The same trail as the rocket's (flame, rainbow or gold coins), streaming back from the tail.
  if(fire)group([0,1.75,-1.65],[.9,.9,.9],[Math.PI/2,0,0],()=>shipFire(t,0,true));
 });}
// Sofia sitting on the duck's back with her legs out in front, holding on. Seat at y = 0, facing +z.
function duckRider(t,fly){const skin='#f6d1a8',hair='#77523c',top='#efb749',legs='#34426d',hold=fly&&!state.reduced?Math.sin(t*3)*.05:0;
 d('box',[0,.36,0],[.22,.3,.16],top);
 for(const s of [-1,1]){d('box',[s*.11,.06,.26],[.09,.08,.27],legs);d('sphere',[s*.11,.13,.58],[.1,.12,.08],'#f6ede0');
  d('box',[s*.29,.42,.13],[.08,.2,.08],top,[-.9+hold,0,s*.15]);d('sphere',[s*.27,.3,.34],[.1,.1,.1],skin);}
 d('sphere',[0,.93,0],[.31,.32,.29],skin);d('sphere',[0,1.05,-.08],[.33,.25,.28],hair);d('sphere',[.28,.92,-.09],[.12,.18,.12],hair);d('sphere',[-.28,.92,-.09],[.12,.18,.12],hair);
 d('sphere',[-.105,.95,.267],[.035,.043,.018],'#1a2a3e');d('sphere',[.105,.95,.267],[.035,.043,.018],'#1a2a3e');d('box',[0,.85,.284],[.07,.02,.012],'#c5766c');}
// On the home screen: a duck on the launch pad, or the rocket. The duck flaps, tips its bill up and climbs at take-off.
function homeShip(t,launch,ignite,wiggle){
 if(!duckFlying()){group([2.6,.44+launch,0],[.8,.8,.8],[wiggle,0,wiggle],()=>rocket(t,ignite>0));return;}
 const up=Math.min(1,ignite*.7),quack=fx.wiggle>0?Math.abs(Math.sin((1-fx.wiggle)*Math.PI*2)):0,aboard=state.mode!=='home'&&state.launchTime>=2;
 group([2.6,-.1+launch,0],[.8,.8,.8],[wiggle,.35*(1-up),wiggle],()=>group([0,0,0],[1,1,1],[-.85*up,0,0],()=>duck(t,{flap:ignite>0?1:0,fly:launch>.4,fire:ignite>.25,rider:aboard,quack})));}
// The ship flying through space, as big as the rocket and centred where the letters fly in.
function flyingShip(t,x,y,boost){
 if(!duckFlying()){group([x,y,2],[1.4,1.4,1.4],[0,0,-Math.PI/2+.09-boost*.08],()=>rocket(t,true,0,true));return;}
 group([x+1.26,y-1.26,2],[1.4,1.4,1.4],[0,Math.PI/2,0],()=>group([0,0,0],[1,1,1],[-.09+boost*.08,0,0],()=>duck(t,{fly:true,fire:true,rider:true})));}
// Circling the world we have come to; the duck flies round it with its bill pointing the way.
function orbitingShip(t,x,z,angle){
 if(!duckFlying()){group([x,.5,z],[.52,.52,.52],[.1,0,-.24],()=>rocket(t,true));return;}
 group([x,0,z],[.66,.66,.66],[0,-angle,0],()=>duck(t,{fly:true,fire:true,rider:true}));}
// Parked on the ground beside a planet game.
function parkedShip(t,x,z){if(duckFlying())group([x,-.05,z],[.7,.7,.7],[0,-.3,0],()=>duck(t));else group([x,.36,z],[.7,.7,.7],[0,-.3,0],()=>rocket(t,false,0,false,false));}
// At the Sun the duck does not burn: it feels the heat, turns round and flies Sofia home on its back.
function sunDuck(t,s){const turn=Math.min(1,Math.max(0,(s-.9)/.6)),e=turn*turn*(3-2*turn),away=Math.max(0,s-1.3);
 group([-3+.5*Math.min(s,1)-away*1.9,-.6+away*.5,2],[.8,.8,.8],[0,Math.PI/2-e*Math.PI,0],()=>duck(t,{fly:true,fire:true,rider:true}));}
