/* Painted maps that follow NASA mission images: Blue Marble (Earth), Viking and Mars Global Surveyor (Mars),
   Cassini, Hubble and Juno (Jupiter and Saturn), MESSENGER (Mercury), Voyager 2 (Uranus, Neptune and Triton),
   New Horizons (Pluto and Charon), Galileo (Jupiter's moons) and Lunar Reconnaissance Orbiter (the Moon).
   Named features sit at their real latitude and longitude, and colours follow the natural-colour pictures.
   The maps are painted in code once, so the whole game still works offline as a single file. */
const PlanetArt=(()=>{
 const cache=new Map(),TAU=Math.PI*2,W=512,H=256,RAD=Math.PI/180;
 // Moon mode paints its moons the same way, from the palette and style each moon carries.
 const moonLook=new Map(typeof MOONS!=='undefined'?MOONS.map(m=>[m.id,m]):[]);
 const hex=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
 const mix=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*Math.max(0,Math.min(1,t)));
 const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
 const css=(c,a=1)=>`rgba(${c.map(Math.round).join(',')},${a})`;
 const hash=(x,y)=>{let n=Math.imul(x,374761393)+Math.imul(y,668265263);n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967295;};
 function noise(x,y,period=256){const ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy,s=fx*fx*(3-2*fx),t=fy*fy*(3-2*fy),h=(a,b)=>hash(((a%period)+period)%period,b);return (h(ix,iy)*(1-s)+h(ix+1,iy)*s)*(1-t)+(h(ix,iy+1)*(1-s)+h(ix+1,iy+1)*s)*t;}
 function fb(u,v){let n=0,a=.55;for(let k=0;k<4;k++){const f=8*(1<<k);n+=a*noise(u*f,v*f,f);a*=.5;}return n;}
 // The globe shader and the thumbnails show u = .25 straight ahead. Each map turns its best-known face there,
 // and east lies to the right, as on a real globe seen from space with north up.
 const FACE={earth:15,mars:-65,jupiter:-30,mercury:-20,moon:0,pluto:175};
 const xOf=(id,lon)=>((FACE[id]||0)+90-lon)/360*W,yOf=lat=>(90-lat)/180*H;
 const lonOf=(id,u)=>(((FACE[id]||0)+90-u*360)%360+540)%360-180;
 // Draws something three times, one map-width apart, so shapes crossing the seam wrap round the globe.
 function wrap(g,fn){for(const dx of [-W,0,W]){g.save();g.translate(dx,0);fn();g.restore();}}
 // Soft patches placed by longitude and latitude, widened towards the poles so they stay round on the globe.
 function field(id,list){const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');
  for(const [lon,lat,rl,rt,a=1] of list){const x=xOf(id,lon),y=yOf(lat),rx=rl/360*W/Math.max(.2,Math.cos(lat*RAD)),ry=rt/180*H;
   wrap(g,()=>{g.translate(x,y);g.scale(rx/ry,1);const grad=g.createRadialGradient(0,0,0,0,0,ry);grad.addColorStop(0,`rgba(255,255,255,${a})`);grad.addColorStop(.6,`rgba(255,255,255,${a*.75})`);grad.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=grad;g.fillRect(-ry,-ry,ry*2,ry*2);});}
  const d=g.getImageData(0,0,W,H).data,out=new Float32Array(W*H);for(let i=0;i<out.length;i++)out[i]=d[i*4+3]/255;return out;}
 const polygons=[ // Simplified longitude/latitude coastlines, deliberately recognizable at child-friendly scale.
 [[-168,70],[-141,70],[-125,60],[-129,51],[-124,42],[-117,32],[-108,24],[-99,17],[-89,15],[-83,9],[-78,8],[-82,20],[-88,22],[-81,25],[-80,33],[-72,43],[-60,47],[-53,53],[-64,60],[-78,62],[-88,70],[-108,74],[-135,70]],
 [[-81,12],[-71,11],[-61,7],[-51,3],[-35,-6],[-40,-20],[-49,-28],[-58,-38],[-66,-55],[-74,-50],[-75,-30],[-81,-6]],
 [[-73,60],[-48,59],[-20,70],[-25,82],[-46,84],[-61,77]],
 [[-17,35],[0,37],[12,34],[25,32],[34,30],[35,20],[44,12],[51,12],[43,0],[40,-13],[32,-26],[19,-35],[12,-20],[8,-3],[-6,5],[-16,14]],
 [[-10,36],[-9,43],[-1,44],[-5,49],[5,51],[8,55],[6,58],[14,71],[29,71],[32,62],[45,68],[65,72],[93,77],[115,73],[140,72],[179,66],[175,54],[155,49],[143,43],[133,35],[122,30],[121,20],[110,19],[109,11],[103,1],[99,10],[94,17],[88,22],[80,8],[73,18],[67,25],[56,24],[51,15],[43,13],[36,29],[28,40],[21,37],[16,40],[12,45],[3,42]],
 [[112,-11],[129,-11],[137,-14],[145,-13],[153,-25],[150,-37],[137,-39],[130,-32],[114,-35]],
 [[47,-13],[51,-17],[48,-26],[44,-24]],[[130,32],[135,35],[141,41],[144,44],[142,35]],[[95,5],[106,-5],[119,-9],[112,-4]],[[109,6],[119,6],[119,-4],[110,-3]],[[131,-3],[150,-6],[146,-10],[136,-8]],[[166,-34],[178,-39],[169,-47],[166,-44]],[[ -8,50],[-6,59],[0,58],[2,52]],[[ -25,64],[-13,64],[-15,67],[-24,67]]
 ];
 // Water cut back out of the land: the Baltic and Skagerrak, the Black Sea, the Caspian, Hudson Bay and the Red Sea.
 const seas=[[[10,54],[14,54],[21,55],[24,57],[23,59],[30,60],[25,61],[22,65],[25,66],[20,63],[17,61],[19,59],[16,57],[12,56]],[[7,57.4],[11,57.8],[12.5,56],[13,55.4],[12,57.6],[11,59.2],[8,58.3]],
  [[28,42],[41,41],[41,44],[35,45],[30,46]],[[47,45],[53,46],[54,40],[52,37],[49,38]],[[-94,59],[-80,63],[-77,56],[-82,52],[-91,56]],[[33,29],[35,28],[39,21],[43,13],[42,14],[37,20]]];
 const ireland=[[-10,52],[-6,52],[-6,55],[-8,55.3]];
 function landMask(){const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d'),shape=poly=>{g.beginPath();poly.forEach(([lon,lat],i)=>g[i?'lineTo':'moveTo'](xOf('earth',lon),yOf(lat)));g.closePath();g.fill();};
  g.fillStyle='#fff';wrap(g,()=>{for(const poly of [...polygons,ireland])shape(poly);});g.globalCompositeOperation='destination-out';wrap(g,()=>{for(const poly of seas)shape(poly);});
  g.globalCompositeOperation='source-over';g.fillRect(0,H*.92,W,H*.08);return g.getImageData(0,0,W,H).data;}
 // Where each world is darker or lighter, as in the spacecraft maps.
 const PATCHES={
  // Sahara, Arabia, Iran and Thar, Taklamakan and Gobi, Australia, Kalahari and Namib, the American deserts, Patagonia and Atacama.
  earth:{dry:[[0,24,22,8],[15,22,18,8],[28,23,12,8],[-8,21,10,6],[5,18,20,5,.8],[46,22,12,8],[58,30,10,5],[71,27,5,4],[84,39,10,4],[104,42,10,4],[133,-25,14,8],[20,-24,7,6],[-111,32,8,6],[-68,-44,4,8],[-70,-23,2,7],[62,45,15,5,.6]]},
  // Syrtis Major, Sinus Sabaeus and Meridiani, Erythraeum, Acidalium, Tyrrhenum, Cimmerium and Sirenum, Solis Lacus and the dark northern collar.
  mars:{dark:[[70,8,9,14],[64,-6,13,9],[20,-8,26,6],[-3,-3,9,6],[-40,-24,24,10],[-28,-10,10,8],[-30,46,18,11],[115,-20,24,9],[150,-24,24,9],[-165,-28,24,9],[-125,-32,14,7],[-85,-26,7,5],[100,52,28,7,.7],[-160,56,25,6,.6],[40,60,40,6,.6]],
   light:[[70,-42,14,10],[-43,-50,8,6,.8],[20,22,30,14,.6],[147,25,12,10,.5],[-112,5,30,22,.5]]},
  // Oceanus Procellarum, the maria Imbrium, Serenitatis, Tranquillitatis, Crisium, Fecunditatis, Nectaris, Nubium, Humorum, Frigoris, Vaporum and Cognitum.
  moon:{dark:[[-57,18,24,28],[-40,32,14,12],[-16,33,16,12],[17,27,9,9],[24,17,7,7],[31,8,11,9],[42,-2,7,7],[59,17,7,6],[51,-7,8,10],[35,-15,6,6],[-17,-21,12,9],[-39,-24,7,6],[4,13,6,5],[-24,-8,11,9],[-8,5,8,6,.8],[-80,-20,4,6,.6],[150,-50,30,20,.25]]},
  // Low-reflectance material around old basins, and the pale floor of the huge Caloris basin.
  mercury:{dark:[[-30,-5,22,16,.7],[100,-40,25,15,.6],[60,20,15,10,.5],[-150,10,20,20,.5]],light:[[162,30,18,17]]},
  // Cthulhu Macula, the long dark «whale» west of the heart, and the smaller dark maculae east of it.
  pluto:{dark:[[30,-3,16,11],[50,-6,20,13],[72,-8,24,15],[95,-5,20,13],[115,-2,16,11],[132,2,10,8],[-140,-8,12,8,.8],[-105,-4,16,9,.8],[-70,-6,14,8,.7]]},
  // Ganymede's dark, cratered regions between the paler grooved terrain.
  ganymedes:{dark:[[-150,30,40,25],[40,-20,30,25,.8],[140,10,25,20,.7]]},
  charon:{dark:[[0,-5,60,10,.3]]}};
 // Cloud belts of the giants from pole to pole, following Hubble and Cassini: cream zones, red-brown belts.
 const JUPITER=[[90,[140,136,130]],[62,[160,150,136]],[50,[200,186,162]],[42,[168,134,104]],[36,[222,208,184]],[29,[162,114,82]],[23,[236,224,202]],[18,[150,92,62]],[9,[170,108,72]],[7,[222,200,164]],[0,[238,224,194]],[-7,[224,204,168]],[-9,[176,116,78]],[-18,[164,108,72]],[-21,[236,224,204]],[-29,[232,218,194]],[-31,[168,124,90]],[-36,[222,206,182]],[-46,[190,172,152]],[-62,[160,150,138]],[-90,[138,134,128]]];
 const SATURN=[[90,[98,112,122]],[80,[120,134,138]],[74,[170,160,126]],[62,[204,186,140]],[50,[214,196,150]],[40,[196,174,124]],[30,[228,210,160]],[20,[212,186,130]],[10,[236,220,174]],[0,[242,228,186]],[-10,[234,216,168]],[-20,[214,188,132]],[-32,[226,206,156]],[-45,[206,186,138]],[-60,[190,176,140]],[-75,[176,166,136]],[-90,[160,154,132]]];
 function belt(table,lat){for(let i=1;i<table.length;i++)if(lat>=table[i][0]){const [l0,c0]=table[i-1],[l1,c1]=table[i];return mix(c1,c0,smooth(0,1,(lat-l1)/(l0-l1)));}return table.at(-1)[1];}
 // Moons: a few carry their own colours, the rest paint from the colour and style in the moon list.
 const MOON_PAINT={io:{dark:[168,120,52],pale:[246,238,190]},europa:{dark:[196,178,150],pale:[240,234,220]},ganymedes:{dark:[120,108,96],pale:[196,188,176]},callisto:{dark:[74,66,58],pale:[132,120,106]},triton:{dark:[176,172,160],pale:[240,222,212]},charon:{dark:[112,108,104],pale:[196,192,186]},moon:{dark:[132,128,122],pale:[206,202,194]}};
 function get(id){if(cache.has(id))return cache.get(id);const canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;const ctx=canvas.getContext('2d'),img=ctx.createImageData(W,H),mask=id==='earth'?landMask():null,moon=moonLook.get(id);
 const patch=PATCHES[id]||{},dark=patch.dark?field(id,patch.dark):null,light=patch.light?field(id,patch.light):null,dry=patch.dry?field(id,patch.dry):null,paint=MOON_PAINT[id];
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){const u=x/W,v=y/H,n=fb(u,v),fine=noise(u*128,v*128,128),rough=noise(u*40,v*40,40)*.6+noise(u*96,v*96,96)*.4,lat=(.5-v)*180,alat=Math.abs(lat),i=y*W+x;let c;
 if(id==='earth'){const land=mask[i*4+3]>100,lon=lonOf(id,u);
  if(land){c=mix([66,106,52],[28,76,38],Math.exp(-((lat/12)**2))+(n-.5)*.5);if(alat>48)c=mix(c,[52,82,58],smooth(48,58,alat));if(alat>62)c=mix(c,[124,114,94],smooth(62,70,alat));
   c=mix(c,[214,180,124],smooth(.12,.45,dry[i]+(n-.5)*.35));c=mix(c,[190,126,80],smooth(.6,.95,dry[i])*fine*.6);
   if((lat>60&&lon>-75&&lon<-12)||lat<-62)c=mix(c,[238,243,246],.95);}
  else{c=mix([8,26,70],[22,64,126],n*.9);if(alat>75)c=mix(c,[226,234,240],smooth(75,83,alat)*.85);}
  const weather=.62+.3*Math.exp(-((lat/9)**2))+.38*Math.exp(-(((alat-55)/12)**2))-.25*Math.exp(-(((alat-24)/9)**2)),cloud=fb(u+.12*Math.sin(v*17),v*1.7)*weather;c=mix(c,[246,249,250],Math.max(0,cloud-.56)*3.4);}
 else if(id==='jupiter'){const lon=u*360,wobble=lat+1.4*Math.sin(lon*RAD*7+n*7)*smooth(0,12,alat)+(n-.5)*3.2;c=belt(JUPITER,wobble);
  const edge=Math.abs(Math.sin(wobble*RAD*18));c=mix(c,[250,240,222],Math.max(0,noise(u*48,v*96,48)-.72)*1.4*edge);if(alat>48)c=mix(c,[112,112,118],Math.max(0,noise(u*40,v*80,40)-.55)*.9);c=c.map(z=>z+(fine-.5)*10);}
 else if(id==='saturn'){const lon=lonOf(id,u),wob=lat+.5*Math.sin(u*TAU*5+n*4)+(n-.5)*1.5;c=belt(SATURN,wob);c=c.map(z=>z+(fine-.5)*6);
  // The hexagon-shaped jet stream around the north pole, as Cassini saw it.
  const phi=((lon%60)+60)%60-30,edge=90-11.3/Math.cos(phi*RAD);if(lat>edge-1.2&&lat<edge+1.2)c=mix(c,[150,138,104],.6);if(lat>88)c=mix(c,[70,82,96],.7);}
 else if(id==='venus'){const swirl=fb(u+.065*Math.sin(v*14+n*4),v*.65);c=mix([204,174,120],[250,236,198],.4+swirl*.75);c=c.map(z=>z+Math.sin(v*33+n*6)*4);if(alat>60)c=mix(c,[242,232,206],smooth(60,80,alat)*.5);}
 else if(id==='uranus'){c=mix([150,203,209],[190,226,228],.5+Math.sin(v*TAU*9+n*2)*.05+(n-.5)*.12);c=mix(c,[214,236,234],smooth(45,85,alat)*.7);}
 else if(id==='neptune'){c=mix([60,104,190],[116,160,222],.5+Math.sin(v*TAU*9+n*2)*.12+(n-.5)*.2);if(alat>60)c=mix(c,[52,88,170],smooth(60,85,alat)*.6);c=mix(c,[236,244,250],Math.max(0,noise(u*64,v*128,64)-.8)*.6*smooth(15,30,alat));}
 else if(id==='mars'){c=mix([174,96,60],[212,138,92],n);c=mix(c,[222,168,122],light[i]*.5);c=mix(c,[94,66,52],smooth(.22,.7,dark[i]+(n-.5)*.3+(rough-.5)*.4)*.85);c=c.map(z=>z+(fine-.5)*9);
  if(lat>80+noise(u*32,2,32)*5)c=mix(c,[242,238,230],.92);else if(lat>72)c=mix(c,[96,70,56],.25*smooth(72,80,lat));if(lat<-84-noise(u*32,5,32)*2)c=mix(c,[240,236,228],.9);}
 else if(id==='mercury'){c=mix([104,98,92],[170,160,146],n);c=mix(c,[184,162,128],light[i]*.35);c=mix(c,[78,78,82],smooth(.3,.8,dark[i]+(n-.5)*.4)*.5);c=c.map(z=>z+(fine-.5)*16);}
 else if(id==='pluto'){c=mix([160,122,94],[218,196,168],n);c=mix(c,[88,50,38],smooth(.25,.6,dark[i]+(rough-.5)*.6)*.92);if(lat>55)c=mix(c,[208,198,178],smooth(55,70,lat)*.6);if(lat>82)c=mix(c,[150,110,88],.4);}
 else if(moon){const base=hex(moon.color),low=paint?.dark||base.map(z=>z*.62),pale=paint?.pale||mix(base,[255,255,255],.34);
  c=mix(low,pale,.2+n*.85);
  if(dark)c=id==='moon'?mix(c,[88,88,86],smooth(.15,.5,dark[i]+(rough-.5)*.7)*.92):mix(c,[92,82,72],smooth(.2,.7,dark[i]+(n-.5)*.35)*.9);
  if(id==='io'){const blot=fb(u+.37,v*.92);c=mix(c,[250,244,206],Math.max(0,.45-blot)*1.4);c=mix(c,[196,104,44],Math.max(0,blot-.58)*1.6);if(alat>55)c=mix(c,[140,96,62],smooth(55,80,alat)*.7);}
  else if(moon.style==='spots'){const blot=fb(u+.37,v*.92);c=mix(c,[255,236,146],Math.max(0,.46-blot)*1.1);c=mix(c,[146,52,31],Math.max(0,blot-.58)*1.7);}
  if(moon.style==='haze')c=mix(base,pale,.45+Math.sin(v*TAU*4+n)*.13+(n-.5)*.35);
  if(id==='europa')c=mix(c,[172,120,86],Math.max(0,fb(u+.5,v)-.6)*1.4);else if(moon.style==='cracks')c=mix(pale,base,n*.55);
  if(id==='ganymedes'&&alat>55)c=mix(c,[226,224,220],smooth(55,75,alat)*.7);
  if(id==='charon'&&lat>62)c=mix(c,[122,70,52],smooth(62,78,lat)*.85);
  if(id==='triton')c=mix(mix(c,[160,168,150],.4+noise(u*64,v*64,64)*.3),[242,220,210],smooth(5,-22,lat+(n-.5)*8)*.85);
  else if(moon.style==='stripes')c=mix(c,[248,252,254],.42);
  c=c.map(z=>z+(fine-.5)*11);}
 else {const gran=noise(u*128,v*128,128),cell=Math.abs(gran-.5)*2;c=mix([236,128,24],[255,228,120],.35+n*.6+cell*.3);}
 const k=i*4;for(let j=0;j<3;j++)img.data[k+j]=c[j];img.data[k+3]=255;
 }ctx.putImageData(img,0,0);
 const X=lon=>xOf(id,lon);
 function ellipse(x,y,rx,ry,fill){ctx.fillStyle=fill;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,TAU);ctx.fill();}
 function oval(lon,lat,rl,rt,fill){const rx=rl/360*W/Math.max(.2,Math.cos(lat*RAD)),ry=rt/180*H;wrap(ctx,()=>ellipse(X(lon),yOf(lat),rx,ry,fill));}
 function path(points,width,stroke){wrap(ctx,()=>{ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();points.forEach(([lon,lat],k)=>ctx[k?'lineTo':'moveTo'](X(lon),yOf(lat)));ctx.stroke();});}
 // Bright young craters throw long rays of fresh dust across the surface.
 function rays(lon,lat,count,length,alpha){for(let k=0;k<count;k++){const a=k/count*TAU+hash(k,Math.round(lon))*.4,len=length*(.5+hash(k,Math.round(lat+99))*.7),end=[lon+Math.cos(a)*len/Math.max(.3,Math.cos(lat*RAD)),Math.max(-88,Math.min(88,lat+Math.sin(a)*len))];path([[lon,lat],end],1,`rgba(236,232,222,${alpha})`);}oval(lon,lat,1.6,1.6,'#f3efe6');}
 if(['mercury','mars','pluto'].includes(id)||moon?.style==='crater'){const count=id==='mercury'?240:id==='mars'?80:id==='moon'?80:moon?170:45;
  for(let k=0;k<count;k++){const x=hash(k,3)*W,south=id==='mars'&&k%3>0,y=south?H*.5+hash(k,9)*(H*.5-22):22+hash(k,9)*(H-44),r=1+hash(k,8)**3*(id==='mercury'?13:id==='moon'?5:7),sy=Math.max(.45,Math.sin(y/H*Math.PI));
   const bright=id==='callisto'&&k%3===0,g=ctx.createRadialGradient(x-r*.17,y-r*.22,.1,x,y,r);
   if(bright){g.addColorStop(0,'#f4f0e8ee');g.addColorStop(.6,'#d8d0c080');g.addColorStop(1,'#d8d0c000');}else if(id==='moon'){g.addColorStop(0,'#00000026');g.addColorStop(.72,'#00000014');g.addColorStop(.86,'#ffffff38');g.addColorStop(1,'#ffffff00');}else{g.addColorStop(0,id==='mercury'?'#39383780':'#35271945');g.addColorStop(.7,'#30291d45');g.addColorStop(.84,'#f2e0b95a');g.addColorStop(1,'#bda88700');}
   wrap(ctx,()=>ellipse(x,y,r/sy,r,g));}}
 if(id==='mercury'){for(const [lon,lat,n,len] of [[17,58,16,38],[-31,-11,12,22],[-12,-34,14,28],[-127,37,12,24],[-80,-60,10,20],[110,-5,10,18]])rays(lon,lat,n,len,.28);
  wrap(ctx,()=>{ctx.strokeStyle='#d6c8ae55';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(X(162),yOf(30),18/360*W/Math.cos(30*RAD),17/180*H,0,0,TAU);ctx.stroke();});}
 if(id==='moon'){rays(-11,-43,18,40,.32);rays(-20,10,14,18,.26);rays(-38,8,10,12,.22);}
 if(id==='mars'){
  // Olympus Mons and the three Tharsis volcanoes, with a dark cliff round Olympus and a caldera on top.
  oval(-134,18,5.6,5.2,'#7c4a3288');oval(-134,18,4.8,4.4,'#dca47a');oval(-134,18.3,1.2,1,'#8b5236');
  for(const [lon,lat] of [[-121,-9],[-113,1],[-104,11]]){oval(lon,lat,3,3,'#d49a70');oval(lon,lat,.8,.8,'#8b5236');}oval(-110,40,7,5,'#d8a07a66');
  // Valles Marineris, the giant canyon, with the tangled Noctis Labyrinthus at its western end.
  const canyon=[[-102,-7],[-92,-8],[-80,-9],[-70,-10],[-60,-12],[-50,-13],[-43,-10]];path(canyon.map(([a,b])=>[a,b+.8]),2.6,'#e0a98266');path(canyon,2.4,'#5e3424cc');path([[-66,-7],[-58,-6]],1.6,'#5e3424aa');
  for(let k=0;k<7;k++){const a=hash(k,77)*TAU;path([[-104,-7],[-104+Math.cos(a)*4,-7+Math.sin(a)*3]],1.2,'#6b3c2a99');}
  wrap(ctx,()=>{ctx.strokeStyle='#e8c4a077';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(X(70),yOf(-42),14/360*W/Math.cos(42*RAD),10/180*H,0,0,TAU);ctx.stroke();});}
 if(id==='jupiter'){const spot=-30;
  // Dark blue-grey festoons trailing from the North Equatorial Belt into the bright equator.
  for(let k=0;k<12;k++){const lon=k*30+hash(k,4)*12;path([[lon,7.6],[lon+4,5],[lon+9,2.5],[lon+14,1.5]],2.2,'#5f6a82aa');}
  // The Great Red Spot in its pale «hollow», Oval BA and the string of white ovals further south.
  oval(spot,-22.5,13,7.6,'#efe2cf');for(let k=10;k>=0;k--){const col=mix([184,84,56],[222,150,110],k/10);oval(spot,-22.5,10*(k+1)/11,6*(k+1)/11,css(col));}
  oval(spot+42,-33,3,2,'#ead8c6');oval(spot+42,-33,1.6,1.1,'#d9a88e');for(let k=0;k<6;k++)oval(spot+95+k*28,-40,1.8,1.2,'#f6eee0');
  for(let k=0;k<18;k++){const x=hash(k,51)*W,y=62+hash(k,32)*137;wrap(ctx,()=>ellipse(x,y,2+hash(k,15)*4,1.3,'#f8ebcf70'));}}
 if(id==='neptune'){
  // The Great Dark Spot Voyager 2 saw, with bright companion clouds, the «Scooter» and a second dark spot.
  oval(0,-22,15,7,'#2a4696');oval(0,-22,12,5.4,'#243c86');oval(4,-28.5,9,1.4,'#f2f6fbdd');oval(-12,-17,6,1,'#e8f0f8aa');
  oval(70,-42,5,1.6,'#f4f8fcdd');oval(110,-55,5,3,'#2c4a98');oval(110,-55,1.6,1.2,'#eef4fa');
  for(let k=0;k<5;k++)oval(hash(k,9)*360-180,24+hash(k,3)*8,10+hash(k,5)*12,.9,'#eef4f9aa');}
 if(id==='pluto'){
  // Tombaugh Regio, the bright heart, with the smooth ice plain Sputnik Planitia as its western lobe.
  const cx=X(175),cy=yOf(18),sx=2.4/360*W*1.05,sy=2.2/180*H;wrap(ctx,()=>{ctx.fillStyle='#ece3d0';ctx.beginPath();for(let k=0;k<=64;k++){const t=k/64*TAU,hx=16*Math.sin(t)**3,hy=13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t);ctx[k?'lineTo':'moveTo'](cx+hx*sx,cy-hy*sy);}ctx.fill();});
  oval(163,22,14,20,'#f4f1ea');for(let k=0;k<26;k++)oval(155+hash(k,7)*22,6+hash(k,8)*32,1.2,.9,'#d8d0c255');
  oval(-120,72,40,10,'#c8bca4');}
 if(id==='europa'||moon?.style==='cracks'){ctx.lineWidth=2.2;for(let k=0;k<30;k++){ctx.strokeStyle=k%3?'#a8714d7a':'#8c573899';const x0=hash(k,11)*W,y0=hash(k,5)*H,len=110+hash(k,7)*280,slope=(hash(k,3)-.5)*1.3;wrap(ctx,()=>{ctx.beginPath();for(let s=0;s<=12;s++)ctx[s?'lineTo':'moveTo'](x0+len*s/12,y0+slope*len*s/12+Math.sin(s*1.7+k)*5);ctx.stroke();});}}
 // Enceladus has four blue «tiger stripes» near its south pole; Triton has dark streaks from its geysers.
 if(id==='enceladus'){for(let k=0;k<4;k++)path([[-150+k*18,-66-k],[-60+k*18,-78-k*1.5],[30+k*18,-70-k]],2.6,'#6fa8cfcc');}
 if(id==='triton'){for(let k=0;k<22;k++){const lon=hash(k,12)*360-180,lat=-20-hash(k,13)*45;path([[lon,lat],[lon+6,lat+2.5]],1.6,'#8a6e66aa');}}
 if(moon?.style==='spots'){for(let k=0;k<44;k++){const x=hash(k,44)*W,y=18+hash(k,17)*(H-36),r=3+hash(k,29)**2*10;wrap(ctx,()=>ellipse(x,y,r,r*.82,id==='io'?(k%3?'#b8582a70':'#2a1a1288'):(k%3?'#8d301f7a':'#3b1e1466')));}
  if(id==='io')for(const [lon,lat,r] of [[-104,-19,11],[-60,12,6],[140,-30,7]]){wrap(ctx,()=>{ctx.strokeStyle='#c2502c99';ctx.lineWidth=2.5;ctx.beginPath();ctx.ellipse(X(lon),yOf(lat),r/360*W/Math.cos(lat*RAD),r/180*H,0,0,TAU);ctx.stroke();});}}
 if(id==='sun'){for(let k=0;k<8;k++){const x=hash(k,20)*W,y=H*(.3+hash(k,8)*.4);ellipse(x,y,3,2,'#b8691699');ellipse(x,y,1.3,1,'#653611bb');}}
 cache.set(id,canvas);return canvas;
 }
 // Saturn's rings from the inside out: the faint C ring, the bright B ring, the dark Cassini Division,
 // the A ring with the thin Encke Gap, and the narrow F ring. Uranus has thin, dark rings, the outer Epsilon ring brightest.
 function rings(id){const hexOf=c=>'#'+c.map(v=>Math.round(v).toString(16).padStart(2,'0')).join('');
  if(id==='saturn'){const out=[],add=(r,c)=>out.push({r,color:hexOf(c)});for(let r=1.24;r<1.52;r+=.035)add(r,mix([96,86,76],[130,116,100],hash(Math.round(r*1000),1)));
   for(let r=1.53;r<1.945;r+=.03)add(r,mix([214,196,158],[238,224,190],hash(Math.round(r*1000),2)));for(let r=2.03;r<2.27;r+=.03)if(Math.abs(r-2.21)>.012)add(r,mix([186,170,138],[210,196,164],hash(Math.round(r*1000),3)));add(2.33,[212,202,180]);return out;}
  return id==='uranus'?[[1.64,'#566365'],[1.75,'#5d6a6c'],[1.79,'#5d6a6c'],[1.86,'#617072'],[1.9,'#617072'],[2,'#8a9898']].map(([r,color])=>({r,color})):[];}
 function thumbnail(canvas,p,moons=[],opts={}){const w=opts.w||240,h=opts.h||130;canvas.width=w;canvas.height=h;const ctx=canvas.getContext('2d'),r=opts.r||(p.parent?24:p.id==='saturn'?29:p.id==='uranus'?31:p.id==='pluto'?28:42),cx=opts.cx===undefined?w/2:opts.cx,cy=opts.cy===undefined?h/2-1:opts.cy;ctx.clearRect(0,0,w,h);const ringlist=rings(p.id),tilt=p.id==='uranus'?1.3:-.28;
 function ringHalf(front){ctx.save();ctx.translate(cx,cy);ctx.rotate(tilt);for(const band of ringlist){ctx.strokeStyle=band.color;ctx.lineWidth=p.id==='saturn'?1.5:.65;ctx.beginPath();ctx.ellipse(0,0,r*band.r,r*band.r*.31,0,front?0:Math.PI,front?Math.PI:TAU);ctx.stroke();}ctx.restore();}
 ringHalf(false);if(p.id==='sun'){const glow=ctx.createRadialGradient(cx,cy,r*.85,cx,cy,r*1.45);glow.addColorStop(0,'#ffc54599');glow.addColorStop(1,'#ffc54500');ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);}
 const surface=get(p.id),data=surface.getContext('2d').getImageData(0,0,W,H).data,out=ctx.getImageData(0,0,w,h),ox=Math.round(cx),oy=Math.round(cy);for(let yy=-r;yy<=r;yy++)for(let xx=-r;xx<=r;xx++){const x=xx/r,y=-yy/r,z2=1-x*x-y*y;if(z2<0)continue;const px=ox+xx,py=oy+yy;if(px<0||py<0||px>=w||py>=h)continue;const z=Math.sqrt(z2),u=(Math.atan2(z,x)/TAU+1)%1,v=Math.acos(y)/Math.PI,si=(Math.min(H-1,Math.floor(v*H))*W+Math.floor(u*W))*4,i=(py*w+px)*4,light=p.id==='sun'?1:.24+.76*Math.max(0,(-x*.6+y+z*.8)/Math.sqrt(2));for(let k=0;k<3;k++)out.data[i+k]=data[si+k]*light;out.data[i+3]=255;}ctx.putImageData(out,0,0);ringHalf(true);
 for(const[i,m]of moons.entries()){const a=1.05+i*1.43,rad=r+9+(i%2)*7,x=cx+Math.cos(a)*rad*1.45,y=cy+Math.sin(a)*rad*.62,dot=Math.max(2.4,m.bead*16);ctx.fillStyle=m.color;ctx.beginPath();ctx.arc(x,y,dot,0,TAU);ctx.fill();ctx.fillStyle='#00000026';ctx.beginPath();ctx.arc(x+dot*.32,y+dot*.22,dot*.72,0,TAU);ctx.fill();}}
 return {get,rings,thumbnail};
})();
