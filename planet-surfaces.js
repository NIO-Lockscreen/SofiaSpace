/* Original, deterministic painted maps. These are educational illustrations, not spacecraft photographs.
   Visual reference: NASA Science planet pages. All maps are created once and work offline. */
const PlanetArt=(()=>{
 const cache=new Map(),TAU=Math.PI*2,W=512,H=256;
 // Moon mode paints its moons the same way, from the palette and style each moon carries.
 const moonLook=new Map(typeof MOONS!=='undefined'?MOONS.map(m=>[m.id,m]):[]);
 const hex=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
 const mix=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*Math.max(0,Math.min(1,t)));
 const hash=(x,y)=>{let n=Math.imul(x,374761393)+Math.imul(y,668265263);n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967295;};
 function noise(x,y,period=256){const ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy,s=fx*fx*(3-2*fx),t=fy*fy*(3-2*fy),h=(a,b)=>hash(((a%period)+period)%period,b);return (h(ix,iy)*(1-s)+h(ix+1,iy)*s)*(1-t)+(h(ix,iy+1)*(1-s)+h(ix+1,iy+1)*s)*t;}
 function fb(u,v){let n=0,a=.55;for(let k=0;k<4;k++){const f=8*(1<<k);n+=a*noise(u*f,v*f,f);a*=.5;}return n;}
 const polygons=[ // Simplified longitude/latitude coastlines, deliberately recognizable at child-friendly scale.
 [[-168,70],[-141,70],[-125,60],[-129,51],[-124,42],[-117,32],[-108,24],[-99,17],[-89,15],[-83,9],[-78,8],[-82,20],[-88,22],[-81,25],[-80,33],[-72,43],[-60,47],[-53,53],[-64,60],[-78,62],[-88,70],[-108,74],[-135,70]],
 [[-81,12],[-71,11],[-61,7],[-51,3],[-35,-6],[-40,-20],[-49,-28],[-58,-38],[-66,-55],[-74,-50],[-75,-30],[-81,-6]],
 [[-73,60],[-48,59],[-20,70],[-25,82],[-46,84],[-61,77]],
 [[-17,35],[0,37],[12,34],[25,32],[34,30],[35,20],[44,12],[51,12],[43,0],[40,-13],[32,-26],[19,-35],[12,-20],[8,-3],[-6,5],[-16,14]],
 [[-10,36],[-9,43],[-1,44],[-5,49],[5,51],[8,55],[6,58],[14,71],[29,71],[32,62],[45,68],[65,72],[93,77],[115,73],[140,72],[179,66],[175,54],[155,49],[143,43],[133,35],[122,30],[121,20],[110,19],[109,11],[103,1],[99,10],[94,17],[88,22],[80,8],[73,18],[67,25],[56,24],[51,15],[43,13],[36,29],[28,40],[21,37],[16,40],[12,45],[3,42]],
 [[112,-11],[129,-11],[137,-14],[145,-13],[153,-25],[150,-37],[137,-39],[130,-32],[114,-35]],
 [[47,-13],[51,-17],[48,-26],[44,-24]],[[130,32],[135,35],[141,41],[144,44],[142,35]],[[95,5],[106,-5],[119,-9],[112,-4]],[[109,6],[119,6],[119,-4],[110,-3]],[[131,-3],[150,-6],[146,-10],[136,-8]],[[166,-34],[178,-39],[169,-47],[166,-44]],[[ -8,50],[-6,59],[0,58],[2,52]],[[ -25,64],[-13,64],[-15,67],[-24,67]]
 ];
 function landMask(){const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');g.fillStyle='#fff';for(const poly of polygons){g.beginPath();poly.forEach(([lon,lat],i)=>g[i?'lineTo':'moveTo']((lon+180)/360*W,(90-lat)/180*H));g.closePath();g.fill();}g.fillRect(0,H*.92,W,H*.08);return g.getImageData(0,0,W,H).data;}
 function get(id){if(cache.has(id))return cache.get(id);const canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;const ctx=canvas.getContext('2d'),img=ctx.createImageData(W,H),mask=id==='earth'?landMask():null,moon=moonLook.get(id);
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){const u=x/W,v=y/H,n=fb(u,v),fine=noise(u*128,v*128,128),lat=(.5-v)*180;let c;
 if(id==='earth'){const land=mask[(y*W+x)*4+3]>100;const desert=Math.exp(-(((lat-24)/15)**2))*.85;c=land?mix([34,89,52],[193,158,98],Math.max(0,desert+n*.4-.18)):mix([13,49,98],[34,98,151],n);if(land&&Math.abs(lat)>64)c=mix(c,[227,237,235],Math.min(1,(Math.abs(lat)-64)/13));const cloud=fb(u+.12*Math.sin(v*17),v*1.7);c=mix(c,[245,249,248],Math.max(0,cloud-.59)*3.5);}
 else if(id==='jupiter'){const warp=v+.012*Math.sin(u*TAU*6+n*8)+.014*(n-.5),band=Math.sin(warp*TAU*11)+.35*Math.sin(warp*TAU*27);c=mix([156,99,67],[232,216,180],(band+1.4)/2.8);c=mix(c,[113,79,62],Math.max(0,n-.55)*.6);c=c.map(z=>z+(fine-.5)*12);}
 else if(id==='saturn'){const band=Math.sin((v+.004*Math.sin(u*TAU*5))*TAU*18);c=mix([181,158,113],[230,212,166],.5+band*.22+(n-.5)*.6);if(Math.abs(lat)>60)c=mix(c,[141,141,110],.15);}
 else if(id==='venus'){const swirl=fb(u+.065*Math.sin(v*14+n*4),v*.65);c=mix([192,165,112],[251,238,196],.35+swirl*.8);c=c.map(z=>z+Math.sin(v*33+n*6)*4);}
 else if(id==='uranus'||id==='neptune'){const ur=id==='uranus';c=mix(ur?[135,190,193]:[112,171,186],ur?[187,218,214]:[157,204,211],.5+Math.sin(v*TAU*9+n*2)*(ur?.06:.11)+(n-.5)*.15);if(ur)c=mix(c,[207,228,220],Math.max(0,(Math.abs(lat)-48)/55));if(!ur)c=mix(c,[230,242,241],Math.max(0,noise(u*64,v*128,64)-.78)*.55);}
 else if(id==='mars'){c=mix([113, 60,42],[205,135,88],n);const dark=fb(u+.2,v+.8);c=mix(c,[69,66,53],Math.max(0,dark-.57)*1.8);if(Math.abs(lat)>77+noise(u*32,2,32)*6)c=mix(c,[236,222,201],.85);}
 else if(id==='mercury'){c=mix([91,87,82],[168,159,145],n);c=c.map(z=>z+(fine-.5)*16);}
 else if(id==='pluto'){c=mix([119,89,74],[218,202,176],n);if(Math.abs(lat)<26)c=mix(c,[95,61,49],Math.max(0,n-.4)*1.1);if(lat>53)c=mix(c,[218,207,186],.35);}
 else if(moon){const base=hex(moon.color),dark=base.map(z=>z*.52),pale=mix(base,[255,255,255],.34);
 c=mix(dark,pale,.2+n*.85);
 if(moon.style==='spots'){const blot=fb(u+.37,v*.92);c=mix(c,[255,236,146],Math.max(0,.46-blot)*1.1);c=mix(c,[146,52,31],Math.max(0,blot-.58)*1.7);}
 if(moon.style==='haze'){c=mix(base,pale,.45+Math.sin(v*TAU*4+n)*.13+(n-.5)*.35);}
 if(moon.style==='cracks'){c=mix(pale,base,n*.55);}
 if(moon.style==='stripes'){c=mix(c,[248,252,254],.42);if(v>.63)c=mix(c,[121,173,201],Math.min(1,(v-.63)*4.5)*Math.max(0,Math.sin(u*TAU*9+n*3))*.55);}
 c=c.map(z=>z+(fine-.5)*11);}
 else {const gran=noise(u*128,v*128,128),cell=Math.abs(gran-.5)*2;c=mix([217, 90,8],[255,224, 90],.3+n*.6+cell*.3);}
 const i=(y*W+x)*4;for(let k=0;k<3;k++)img.data[i+k]=c[k];img.data[i+3]=255;
 }ctx.putImageData(img,0,0);
 function ellipse(x,y,rx,ry,fill){ctx.fillStyle=fill;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,TAU);ctx.fill();}
 if(['mercury','mars','pluto'].includes(id)||moon?.style==='crater'){const count=id==='mercury'?240:id==='mars'?65:moon?170:45;for(let i=0;i<count;i++){const x=hash(i,3)*W,y=22+hash(i,9)*(H-44),r=1+hash(i,8)**3*(id==='mercury'?13:7),sy=Math.max(.45,Math.sin(y/H*Math.PI));const g=ctx.createRadialGradient(x-r*.17,y-r*.22,.1,x,y,r);g.addColorStop(0,id==='mercury'?'#39383780':'#35271945');g.addColorStop(.7,'#30291d45');g.addColorStop(.84,'#f2e0b95a');g.addColorStop(1,'#bda88700');ellipse(x,y,r/sy,r,g);}}
 if(id==='mars'){ctx.strokeStyle='#76432e88';ctx.lineWidth=2.4;ctx.beginPath();for(let i=0;i<45;i++){const x=104+i*.9,y=139+Math.sin(i*.17)*2+Math.sin(i*1.4)*.7;ctx[i?'lineTo':'moveTo'](x,y);}ctx.stroke();}
 if(id==='jupiter'){for(let i=11;i>=0;i--){const color=mix([153,65,39],[220,157,101],i/11);ellipse(141+i*.17,160-i*.13,19*(i+1)/12,9*(i+1)/12,'rgb('+color.join(',')+')');}for(let i=0;i<18;i++){ellipse(hash(i,51)*W,62+hash(i,32)*137,2+hash(i,15)*4,1.3,'#f8ebcf85');}}
 if(id==='pluto'){ctx.fillStyle='#e9dfc8';ctx.beginPath();ctx.moveTo(127,169);ctx.bezierCurveTo(97,147,90,117,110,115);ctx.bezierCurveTo(119,113,124,121,127,126);ctx.bezierCurveTo(141,108,168,123,157,139);ctx.bezierCurveTo(147,151,135,162,127,169);ctx.fill();ctx.fillStyle='#c6bca52a';for(let i=0;i<40;i++)ellipse(107+hash(i,22)*43,124+hash(i,78)*21,1,.7,ctx.fillStyle);}
 if(moon?.style==='cracks'){ctx.lineWidth=2.2;for(let i=0;i<30;i++){ctx.strokeStyle=i%3?'#a8714d7a':'#8c573899';const x0=hash(i,11)*W,y0=hash(i,5)*H,len=110+hash(i,7)*280,slope=(hash(i,3)-.5)*1.3;ctx.beginPath();for(let k=0;k<=12;k++)ctx[k?'lineTo':'moveTo'](x0+len*k/12,y0+slope*len*k/12+Math.sin(k*1.7+i)*5);ctx.stroke();}}
 if(moon?.style==='stripes'){ctx.strokeStyle='#89b9d5aa';ctx.lineWidth=5;for(let i=0;i<8;i++){ctx.beginPath();ctx.moveTo(64+i*52,H*.68);ctx.lineTo(78+i*52,H);ctx.stroke();}}
 if(moon?.style==='spots'){for(let i=0;i<44;i++){const x=hash(i,44)*W,y=18+hash(i,17)*(H-36),r=3+hash(i,29)**2*10;ellipse(x,y,r,r*.82,i%3?'#8d301f7a':'#3b1e1466');}}
 if(id==='sun'){for(let i=0;i<8;i++){const x=hash(i,20)*W,y=H*(.3+hash(i,8)*.4);ellipse(x,y,3,2,'#b8691699');ellipse(x,y,1.3,1,'#653611bb');}}
 cache.set(id,canvas);return canvas;
 }
 function rings(id){if(id==='saturn'){const out=[];for(let i=0;i<30;i++){const r=1.22+i*.034;if(r>1.91&&r<2.01)continue;const fade=i<7?-.22:0;const col=mix([137,119,91],[222,207,167],.5+Math.sin(i*2.8)*.2+fade);out.push({r,color:'#'+col.map(v=>Math.round(v).toString(16).padStart(2,'0')).join('')});}return out;}return id==='uranus'?[1.62,1.73,1.85,2.0].map(r=>({r,color:'#718a89'})):[];}
 function thumbnail(canvas,p,moons=[],opts={}){const w=opts.w||240,h=opts.h||130;canvas.width=w;canvas.height=h;const ctx=canvas.getContext('2d'),r=opts.r||(p.parent?24:p.id==='saturn'?29:p.id==='uranus'?31:p.id==='pluto'?28:42),cx=opts.cx===undefined?w/2:opts.cx,cy=opts.cy===undefined?h/2-1:opts.cy;ctx.clearRect(0,0,w,h);const ringlist=rings(p.id),tilt=p.id==='uranus'?1.3:-.28;
 function ringHalf(front){ctx.save();ctx.translate(cx,cy);ctx.rotate(tilt);for(const band of ringlist){ctx.strokeStyle=band.color;ctx.lineWidth=p.id==='saturn'?1.5:.65;ctx.beginPath();ctx.ellipse(0,0,r*band.r,r*band.r*.31,0,front?0:Math.PI,front?Math.PI:TAU);ctx.stroke();}ctx.restore();}
 ringHalf(false);if(p.id==='sun'){const glow=ctx.createRadialGradient(cx,cy,r*.85,cx,cy,r*1.45);glow.addColorStop(0,'#ffc54599');glow.addColorStop(1,'#ffc54500');ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);}
 const surface=get(p.id),data=surface.getContext('2d').getImageData(0,0,W,H).data,out=ctx.getImageData(0,0,w,h),ox=Math.round(cx),oy=Math.round(cy);for(let yy=-r;yy<=r;yy++)for(let xx=-r;xx<=r;xx++){const x=xx/r,y=-yy/r,z2=1-x*x-y*y;if(z2<0)continue;const px=ox+xx,py=oy+yy;if(px<0||py<0||px>=w||py>=h)continue;const z=Math.sqrt(z2),u=(Math.atan2(z,x)/TAU+1)%1,v=Math.acos(y)/Math.PI,si=(Math.min(H-1,Math.floor(v*H))*W+Math.floor(u*W))*4,i=(py*w+px)*4,light=p.id==='sun'?1:.24+.76*Math.max(0,(-x*.6+y+z*.8)/Math.sqrt(2));for(let k=0;k<3;k++)out.data[i+k]=data[si+k]*light;out.data[i+3]=255;}ctx.putImageData(out,0,0);ringHalf(true);
 for(const[i,m]of moons.entries()){const a=1.05+i*1.43,rad=r+9+(i%2)*7,x=cx+Math.cos(a)*rad*1.45,y=cy+Math.sin(a)*rad*.62,dot=Math.max(2.4,m.bead*16);ctx.fillStyle=m.color;ctx.beginPath();ctx.arc(x,y,dot,0,TAU);ctx.fill();ctx.fillStyle='#00000026';ctx.beginPath();ctx.arc(x+dot*.32,y+dot*.22,dot*.72,0,TAU);ctx.fill();}}
 return {get,rings,thumbnail};
})();
