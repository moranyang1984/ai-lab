/* Painter — a small procedural "text-to-image / image-to-video" engine.
   Offline stand-in for a real generative model: prompt words switch scene elements on,
   style words switch palettes and brush treatments, and time t animates the elements a
   motion plan says should move. Logical canvas is 640×400. */
(function(){
const W=640,H=400;
function rng(seed){let a=seed>>>0||1;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const PAL={
 plain:{sky:['#7fb9ea','#e3f1ff'],far:'#8fae9e',near:'#5d7f68',rock:['#7d6e5c','#54493d'],water:['#f4fbff','#a6d6f2'],pool:['#9fd1ee','#4f93bf'],pine:'#2f5d3a',trunk:'#5a4330',cloud:'#ffffff',sun:'#ffe08a',night:['#0b1a45','#24407a'],sea:['#1d3c72','#0b1a3d'],moon:'#fff6d8'},
 ink:{sky:['#efe6d2','#efe6d2'],far:'rgba(60,60,60,.28)',near:'rgba(30,30,30,.62)',rock:['rgba(60,60,60,.42)','rgba(25,25,25,.72)'],water:['#fbf7ee','#d8d2c4'],pool:['#e4ddce','#c9c1b0'],pine:'#1d1d1d',trunk:'#2a2a2a',cloud:'rgba(255,255,255,.85)',sun:'rgba(190,60,40,.55)',night:['#d9d0bd','#bfb6a2'],sea:['#a9a294','#8a8477'],moon:'#f7f1e2'},
 oil:{sky:['#2f6cc0','#f3b25f'],far:'#5d7d9c',near:'#3d6b34',rock:['#8a5a33','#4b2f1d'],water:['#ffffff','#7cc4ef'],pool:['#3c8ec9','#1c4f86'],pine:'#1e4d22',trunk:'#4a2a14',cloud:'#fff1d6',sun:'#ffcf4a',night:['#0d1d5a','#3b4f9e'],sea:['#16408a','#071a45'],moon:'#ffe9a6'},
 water:{sky:['#a9d8f2','#fff6e8'],far:'rgba(120,170,150,.55)',near:'rgba(80,140,110,.7)',rock:['rgba(150,125,100,.75)','rgba(110,90,75,.8)'],water:['#ffffff','#bfe4f7'],pool:['#b8e0f4','#79b8dd'],pine:'rgba(50,110,70,.85)',trunk:'rgba(110,80,55,.85)',cloud:'rgba(255,255,255,.9)',sun:'#ffe3a0',night:['#2c3f7a','#7a8cc4'],sea:['#4b6fb0','#22397a'],moon:'#fff8e0'}
};
let paper=null;
function paperTex(){ if(paper) return paper; paper=document.createElement('canvas'); paper.width=paper.height=256; const c=paper.getContext('2d'); const id=c.createImageData(256,256); const r=rng(7);
  for(let i=0;i<id.data.length;i+=4){const v=225+r()*30; id.data[i]=v;id.data[i+1]=v-4;id.data[i+2]=v-14;id.data[i+3]=255;} c.putImageData(id,0,0); return paper; }
function lg(ctx,x0,y0,x1,y1,stops){const g=ctx.createLinearGradient(x0,y0,x1,y1);stops.forEach((s,i)=>g.addColorStop(i/(stops.length-1),s));return g;}
function ridge(ctx,base,amp,color,seed,peaks){const r=rng(seed);const ph=[r()*6,r()*6,r()*6];ctx.beginPath();ctx.moveTo(0,H);
  for(let x=0;x<=W;x+=6){let y=base-amp*(0.55*Math.sin(x/97+ph[0])+0.3*Math.sin(x/41+ph[1])+0.15*Math.sin(x/17+ph[2]));
    if(peaks)peaks.forEach(p=>{const d=(x-p.x)/p.w;y-=p.h*Math.exp(-d*d);});ctx.lineTo(x,y);} ctx.lineTo(W,H);ctx.closePath();ctx.fillStyle=color;ctx.fill();}
function cloud(ctx,x,y,s,color){ctx.fillStyle=color;ctx.beginPath();[[0,0,28],[26,-10,24],[52,0,26],[24,8,26],[-22,6,18],[74,8,16]].forEach(([dx,dy,r])=>{ctx.moveTo(x+dx*s+r*s,y+dy*s);ctx.arc(x+dx*s,y+dy*s,r*s,0,Math.PI*2);});ctx.fill();}
function pine(ctx,x,y,s,P,sway){ctx.save();ctx.translate(x,y);ctx.rotate(sway);ctx.strokeStyle=P.trunk;ctx.lineWidth=5*s;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(-10*s,-30*s,6*s,-60*s);ctx.stroke();
  ctx.fillStyle=P.pine;[[-22,-40,30,9],[14,-52,28,8],[-8,-66,24,8],[10,-30,22,7]].forEach(([dx,dy,w,hh])=>{ctx.beginPath();ctx.ellipse(dx*s,dy*s,w*s,hh*s,-0.15,0,Math.PI*2);ctx.fill();});ctx.restore();}
function seal(ctx){ctx.save();ctx.fillStyle='rgba(185,40,30,.85)';ctx.fillRect(578,30,30,38);ctx.fillStyle='#f5e9d6';ctx.font='bold 13px "Noto Serif SC","Songti SC",serif';ctx.textAlign='center';ctx.fillText('意',593,46);ctx.fillText('境',593,62);ctx.restore();}
function watermark(ctx){ctx.save();ctx.font='600 12px "Noto Sans SC",sans-serif';const t='AI 生成';const w=ctx.measureText(t).width+14;ctx.fillStyle='rgba(0,0,0,.55)';ctx.fillRect(W-w-8,H-26,w,20);ctx.fillStyle='#fff';ctx.textBaseline='middle';ctx.fillText(t,W-w+(-1),H-16);ctx.restore();}

/* ---------- scenes ---------- */
function waterfall(ctx,S,t){const P=PAL[S.style]||PAL.plain,E=S.el||{},M=S.move||{},sp=S.speed||1,Wr=S.wrong||{};
  ctx.fillStyle=lg(ctx,0,0,0,H,E.warm&&S.style!=='ink'?['#e9875a','#ffe2b8']:P.sky);ctx.fillRect(0,0,W,H);
  if(E.haze){ctx.fillStyle='rgba(255,255,255,.0)';}
  if(E.sun){const a=M.light?0.75+0.25*Math.sin(t*3*sp):1;ctx.save();ctx.globalAlpha=a;const g=ctx.createRadialGradient(530,78,6,530,78,120);g.addColorStop(0,P.sun);g.addColorStop(1,'rgba(255,230,150,0)');ctx.fillStyle=g;ctx.fillRect(400,0,240,220);ctx.fillStyle=P.sun;ctx.beginPath();ctx.arc(530,78,26,0,7);ctx.fill();
    if(S.style!=='ink'){ctx.globalAlpha=0.18*a;ctx.fillStyle='#fff6c8';ctx.beginPath();ctx.moveTo(530,78);ctx.lineTo(260,400);ctx.lineTo(380,400);ctx.closePath();ctx.fill();}ctx.restore();}
  const shake=Wr.mountainShake?Math.sin(t*14)*5:0;
  ctx.save();ctx.translate(shake,0);
  if(E.mountain||E.highpeak) ridge(ctx,215,40,P.far,11,E.highpeak?[{x:150,w:70,h:150},{x:470,w:60,h:120}]:[{x:470,w:90,h:40}]);
  if(E.highpeak) ridge(ctx,250,30,P.near,23,[{x:90,w:50,h:120},{x:560,w:45,h:95}]);
  ctx.restore();
  if(E.cloud){const v=(M.cloud?(Wr.fastCloud?90:14):0)*sp;[[60,95,1],[360,70,0.8],[210,150,0.65],[520,135,0.7]].forEach(([x,y,s],i)=>{const xx=((x+t*v*(1+i*0.2))%(W+160))-80;cloud(ctx,xx,y,s,P.cloud);});
    if(E.highpeak){ctx.save();ctx.globalAlpha=.75;cloud(ctx,((120+t*v*0.7)%(W+160))-60,175,0.9,P.cloud);ctx.restore();}}
  // cliffs
  const rush=E.rush?1:0, wl=272-rush*14, wr=366+rush*14;
  ctx.fillStyle=lg(ctx,0,165,0,350,P.rock);
  ctx.beginPath();ctx.moveTo(0,H);ctx.lineTo(0,205);ctx.bezierCurveTo(80,182,180,166,wl+6,170);ctx.lineTo(wl,330);ctx.lineTo(0,350);ctx.closePath();ctx.fill();
  ctx.beginPath();ctx.moveTo(W,H);ctx.lineTo(W,212);ctx.bezierCurveTo(560,184,450,166,wr-6,170);ctx.lineTo(wr,330);ctx.lineTo(W,352);ctx.closePath();ctx.fill();
  if(S.style==='ink'){ctx.strokeStyle='rgba(20,20,20,.5)';ctx.lineWidth=1.2;const r=rng(5);for(let i=0;i<26;i++){const x=r()*wl,y=200+r()*120;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+12+r()*20,y+4+r()*10);ctx.stroke();const x2=wr+r()*(W-wr);ctx.beginPath();ctx.moveTo(x2,y);ctx.lineTo(x2-12-r()*20,y+4+r()*10);ctx.stroke();}}
  // waterfall
  ctx.fillStyle=lg(ctx,wl,0,wr,0,[P.water[1],P.water[0],P.water[0],P.water[1]]);ctx.fillRect(wl,166,wr-wl,166);
  const dir=Wr.upflow?-1:1,vel=(M.water?(rush?240:140):0)*sp*dir;
  ctx.save();ctx.beginPath();ctx.rect(wl,166,wr-wl,166);ctx.clip();ctx.strokeStyle=S.style==='ink'?'rgba(80,80,80,.45)':'rgba(255,255,255,.9)';ctx.lineWidth=2;const r2=rng(9);
  for(let i=0;i<(rush?26:16);i++){const x=wl+4+r2()*(wr-wl-8),len=24+r2()*40,gap=30+r2()*40,off=(r2()*200+t*vel)%(len+gap);ctx.setLineDash([len,gap]);ctx.lineDashOffset=-off;ctx.beginPath();ctx.moveTo(x,166);ctx.lineTo(x+(r2()-.5)*6,332);ctx.stroke();}
  ctx.setLineDash([]);ctx.restore();
  // pool
  ctx.fillStyle=lg(ctx,0,320,0,H,P.pool);ctx.beginPath();ctx.moveTo(0,350);ctx.quadraticCurveTo(W/2,312,W,352);ctx.lineTo(W,H);ctx.lineTo(0,H);ctx.closePath();ctx.fill();
  ctx.strokeStyle=S.style==='ink'?'rgba(60,60,60,.35)':'rgba(255,255,255,.55)';ctx.lineWidth=1.5;for(let i=0;i<5;i++){const ph=M.water?t*1.6*sp:0;const rr=40+i*26+((ph*18)%26);ctx.beginPath();ctx.ellipse(319,342,rr,rr*0.16,0,Math.PI*1.05,Math.PI*1.95);ctx.stroke();}
  if(E.rainbow){ctx.save();ctx.globalAlpha=S.style==='ink'?0.15:0.35;['#ff5a5a','#ffb347','#ffe66d','#7ddf64','#5ac8fa','#8a7dff'].forEach((c,i)=>{ctx.strokeStyle=c;ctx.lineWidth=5;ctx.beginPath();ctx.arc(320,345,150-i*5,Math.PI*1.1,Math.PI*1.9);ctx.stroke();});ctx.restore();}
  if(E.spray){const r=rng(3);ctx.fillStyle=S.style==='ink'?'rgba(90,90,90,.5)':'rgba(255,255,255,.92)';for(let i=0;i<70;i++){const ph=(r()+(M.spray?t*0.9*sp:0))%1,ang=Math.PI*(1.15+r()*0.7),v=50+r()*60,x=320+Math.cos(ang)*v*ph*1.4,y=332+Math.sin(ang)*v*ph*1.6+70*ph*ph;ctx.globalAlpha=1-ph*0.8;ctx.beginPath();ctx.arc(x,y,1.5+r()*2.5,0,7);ctx.fill();}ctx.globalAlpha=1;
    ctx.fillStyle='rgba(255,255,255,.35)';ctx.beginPath();ctx.ellipse(320,330,90,20,0,0,7);ctx.fill();}
  if(E.haze){const hg=ctx.createLinearGradient(0,150,0,300);hg.addColorStop(0,'rgba(255,255,255,0)');hg.addColorStop(.5,'rgba(240,244,248,.55)');hg.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=hg;ctx.fillRect(0,150,W,150);}
  if(E.pine){const sw=M.pine?Math.sin(t*1.6*sp)*0.05:0;pine(ctx,150,174,1,P,sw);pine(ctx,520,178,0.85,P,-sw);pine(ctx,60,198,0.7,P,sw*0.7);}
}
function chunjiang(ctx,S,t){const P=PAL[S.style]||PAL.plain,E=S.el||{},M=S.move||{},sp=S.speed||1,far=!!E.far;
  const hy=far?250:222;ctx.fillStyle=lg(ctx,0,0,0,hy,P.night);ctx.fillRect(0,0,W,hy+2);
  if(S.style!=='ink'){const r=rng(4);ctx.fillStyle='#fff';for(let i=0;i<(far?70:35);i++){ctx.globalAlpha=0.3+0.5*r()*(M.light?(0.6+0.4*Math.sin(t*2+i)):1);ctx.fillRect(r()*W,r()*hy*0.85,1.3,1.3);}ctx.globalAlpha=1;}
  if(far){ctx.fillStyle=S.style==='ink'?'rgba(70,70,70,.35)':'rgba(40,60,110,.8)';ridge(ctx,hy+4,10,ctx.fillStyle,31,[{x:90,w:60,h:22},{x:560,w:70,h:18}]);}
  // moon
  const mr=far?24:40,mx=far?430:400;let my=far?110:120;
  if(E.moonrise){const loop=(t*sp*0.12)%1;my=hy+mr-(hy+mr-(far?110:118))*Math.min(1,loop*1.6);}
  ctx.save();ctx.beginPath();ctx.rect(0,0,W,hy);ctx.clip();const g=ctx.createRadialGradient(mx,my,mr*0.6,mx,my,mr*3.2);g.addColorStop(0,S.style==='ink'?'rgba(255,255,255,.6)':'rgba(255,240,200,.45)');g.addColorStop(1,'rgba(255,240,200,0)');ctx.fillStyle=g;ctx.fillRect(0,0,W,hy);
  ctx.fillStyle=P.moon;ctx.beginPath();ctx.arc(mx,my,mr,0,7);ctx.fill();if(S.style==='ink'){ctx.strokeStyle='rgba(40,40,40,.5)';ctx.lineWidth=1.2;ctx.stroke();}ctx.restore();
  // sea
  ctx.fillStyle=lg(ctx,0,hy,0,H,P.sea);ctx.fillRect(0,hy,W,H-hy);
  const tide=M.water?Math.sin(t*0.8*sp)*3:0;
  const rows=far?14:9;for(let i=0;i<rows;i++){const y=hy+8+tide+i*(H-hy)/rows,amp=(far?1.5:2.5)+i*0.6,len=(far?60:90)+i*10,off=M.water?t*(22+i*4)*sp:0;
    ctx.strokeStyle=S.style==='ink'?`rgba(40,40,40,${0.18+i*0.04})`:`rgba(190,215,255,${0.18+i*0.045})`;ctx.lineWidth=1+i*0.18;ctx.beginPath();for(let x=-20;x<=W+20;x+=6){const yy=y+Math.sin((x+off)/len*Math.PI*2)*amp;x===-20?ctx.moveTo(x,yy):ctx.lineTo(x,yy);}ctx.stroke();}
  // moon path on water
  if(my<hy+mr){const r=rng(12);for(let i=0;i<40;i++){const yy=hy+6+r()*(H-hy-10),spread=6+(yy-hy)*0.32,x=mx+(r()-.5)*spread*2,fl=E.shimmer&&M.light?(0.4+0.6*Math.abs(Math.sin(t*4*sp+i*1.7))):0.8;ctx.globalAlpha=fl*(S.style==='ink'?0.5:0.85);ctx.fillStyle=S.style==='ink'?'#fff':'#fff1c2';ctx.fillRect(x-6-r()*10,yy,12+r()*20,1.6);}ctx.globalAlpha=1;}
  if(E.flowers){const sw=M.pine?Math.sin(t*1.3*sp)*0.04:0;[[40,hy+30,1],[110,hy+44,0.8]].forEach(([x,y,s])=>{ctx.save();ctx.translate(x,y);ctx.rotate(sw);ctx.strokeStyle=P.trunk;ctx.lineWidth=4*s;ctx.beginPath();ctx.moveTo(0,40*s);ctx.quadraticCurveTo(-6,0,4,-40*s);ctx.stroke();const r=rng(x|0);for(let i=0;i<46;i++){ctx.fillStyle=S.style==='ink'?'rgba(255,255,255,.9)':(r()<.5?'#fff':'#ffe3ef');ctx.beginPath();ctx.arc((r()-.5)*70*s,-30*s+(r()-.5)*46*s,2.5*s+r()*2,0,7);ctx.fill();}ctx.restore();});}
  if(S.style==='ink'){ctx.fillStyle='rgba(30,30,30,.75)';ctx.font='20px "Noto Serif SC","Songti SC",serif';['春','江','花','月','夜'].forEach((c,i)=>ctx.fillText(c,30,48+i*24));}
}
function bookmountain(ctx,S){ctx.fillStyle=lg(ctx,0,0,0,H,['#9fd0f2','#eef7ff']);ctx.fillRect(0,0,W,H);const r=rng(21);const cols=['#e85d5d','#4f8fe8','#f2b33d','#5cbf7a','#9b6be0','#ef7fb0','#3fb7c9'];
  for(let row=0;row<14;row++){const y=360-row*22,half=260-row*17;for(let x=320-half;x<320+half;){const w=30+r()*40;ctx.fillStyle=cols[(r()*cols.length)|0];ctx.fillRect(x,y,Math.min(w,320+half-x)-2,20);ctx.fillStyle='rgba(255,255,255,.6)';ctx.fillRect(x+4,y+8,Math.min(w,320+half-x)-12,2);x+=w;}}
  ctx.strokeStyle='#d8b98a';ctx.lineWidth=10;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(250,385);ctx.bezierCurveTo(420,330,200,260,330,200);ctx.bezierCurveTo(430,150,280,110,322,72);ctx.stroke();ctx.setLineDash([2,10]);ctx.strokeStyle='#8a6a40';ctx.lineWidth=3;ctx.stroke();ctx.setLineDash([]);
  ctx.fillStyle='#ffe08a';ctx.beginPath();ctx.arc(560,70,26,0,7);ctx.fill();}
function booksea(ctx,S,t){ctx.fillStyle=lg(ctx,0,0,0,H,['#ffc98a','#fff1dc']);ctx.fillRect(0,0,W,H);ctx.fillStyle='#ff9a5a';ctx.beginPath();ctx.arc(500,130,30,0,7);ctx.fill();
  for(let i=0;i<7;i++){const y=210+i*28;ctx.fillStyle=i%2?'#f6f1e6':'#ffffff';ctx.beginPath();for(let x=0;x<=W;x+=40){ctx.moveTo(x,y);ctx.quadraticCurveTo(x+20,y-14,x+40,y);ctx.lineTo(x+40,y+30);ctx.lineTo(x,y+30);}ctx.fill();ctx.strokeStyle='rgba(120,110,90,.35)';ctx.lineWidth=1;for(let x=0;x<W;x+=40){for(let k=0;k<3;k++){ctx.beginPath();ctx.moveTo(x+6,y+8+k*6);ctx.lineTo(x+34,y+8+k*6);ctx.stroke();}ctx.beginPath();ctx.moveTo(x+20,y-6);ctx.lineTo(x+20,y+28);ctx.stroke();}}
  ctx.save();ctx.translate(300,222);ctx.fillStyle='#8a5a33';ctx.beginPath();ctx.moveTo(-60,0);ctx.lineTo(60,0);ctx.lineTo(40,22);ctx.lineTo(-40,22);ctx.closePath();ctx.fill();ctx.fillStyle='#5a3a1a';ctx.fillRect(-2,-70,4,70);ctx.fillStyle='#fff7e6';ctx.beginPath();ctx.moveTo(2,-66);ctx.lineTo(46,-10);ctx.lineTo(2,-10);ctx.closePath();ctx.fill();
  ctx.fillStyle='#3d2a1a';ctx.beginPath();ctx.arc(-24,-14,8,0,7);ctx.fill();ctx.fillRect(-28,-6,8,8);ctx.restore();}
function pond(ctx,S){ctx.fillStyle=lg(ctx,0,0,0,H,['#bfe6ff','#f1fbff']);ctx.fillRect(0,0,W,H);cloud(ctx,140,70,0.9,'#fff');cloud(ctx,430,90,0.7,'#fff');
  ctx.fillStyle='#7cbf6a';ctx.fillRect(0,200,W,200);ctx.fillStyle='#a8875c';ctx.fillRect(180,220,300,160);ctx.fillStyle=lg(ctx,0,228,0,372,['#d4f1ff','#8fd0f2']);ctx.fillRect(192,232,276,136);
  ctx.save();ctx.globalAlpha=.6;cloud(ctx,280,300,0.6,'#fff');ctx.restore();ctx.fillStyle='#8fd0f2';ctx.fillRect(40,280,152,30);ctx.fillStyle='#6b6b6b';ctx.beginPath();ctx.ellipse(40,295,30,22,0,0,7);ctx.fill();ctx.fillStyle='#8fd0f2';ctx.beginPath();ctx.ellipse(40,295,14,10,0,0,7);ctx.fill();
  ctx.strokeStyle='#fff';ctx.lineWidth=2;for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(70+i*30,288);ctx.lineTo(90+i*30,288);ctx.stroke();}}

const SCENES={waterfall,chunjiang,bookmountain,booksea,pond};

function post(ctx,S,lite){const st=S.style;
  if(st==='ink'){ctx.save();ctx.globalCompositeOperation='multiply';ctx.fillStyle=ctx.createPattern(paperTex(),'repeat');ctx.fillRect(0,0,W,H);ctx.restore();if(S.scene!=='chunjiang')seal(ctx);}
  if(st==='water'){ctx.save();ctx.globalCompositeOperation='multiply';ctx.globalAlpha=.55;ctx.fillStyle=ctx.createPattern(paperTex(),'repeat');ctx.fillRect(0,0,W,H);ctx.restore();
    const g=ctx.createRadialGradient(W/2,H/2,H*0.3,W/2,H/2,W*0.7);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(1,'rgba(255,250,240,.75)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);}
  if(st==='oil'){const c=ctx.canvas,sx=c.width/W;let id;try{id=ctx.getImageData(0,0,c.width,c.height);}catch(e){return;}const d=id.data,r=rng(99),N=lite?900:3200;
    for(let i=0;i<N;i++){const x=r()*W,y=r()*H,px=((y*sx|0)*c.width+(x*sx|0))*4;ctx.fillStyle=`rgba(${d[px]},${d[px+1]},${d[px+2]},.85)`;ctx.beginPath();ctx.ellipse(x,y,5+r()*6,1.8+r()*1.6,(r()-.5)*1.2,0,7);ctx.fill();}
    ctx.save();ctx.globalCompositeOperation='overlay';ctx.globalAlpha=.25;ctx.fillStyle=ctx.createPattern(paperTex(),'repeat');ctx.fillRect(0,0,W,H);ctx.restore();}
}

const Painter={W,H};
Painter.render=function(canvas,S,t=0,opts={}){const ctx=canvas.getContext('2d');const sx=canvas.width/W;ctx.setTransform(sx,0,0,canvas.height/H,0,0);ctx.clearRect(0,0,W,H);
  (SCENES[S.scene]||waterfall)(ctx,S,t);post(ctx,S,opts.lite);if(opts.wm!==false)watermark(ctx);};
Painter.canvas=(w=640)=>{const c=document.createElement('canvas');c.width=w;c.height=Math.round(w*H/W);return c;};
Painter.thumb=(S,w=320,t=0)=>{const c=Painter.canvas(w);Painter.render(c,S,t);return c.toDataURL('image/jpeg',0.82);};
Painter.play=function(canvas,getSpec,opts={}){let raf,t0=performance.now(),stopped=false;const fps=opts.fps||30;let last=0;
  const loop=now=>{if(stopped)return;if(now-last>=1000/fps-2&&canvas.isConnected&&canvas.offsetParent!==null){last=now;Painter.render(canvas,getSpec(),(now-t0)/1000,{lite:true});opts.onFrame&&opts.onFrame((now-t0)/1000);}raf=requestAnimationFrame(loop);};
  raf=requestAnimationFrame(loop);return()=>{stopped=true;cancelAnimationFrame(raf);};};

/* words → elements, used by the offline "text-to-image" mode */
Painter.CHIPS=[
 {w:'高高的山峰',el:'highpeak'},{w:'远山',el:'mountain'},{w:'浮云',el:'cloud'},{w:'湍急的水流',el:'rush'},{w:'飞溅的水花',el:'spray'},
 {w:'阳光下的瀑布',el:'sun'},{w:'青松',el:'pine'},{w:'彩虹',el:'rainbow'}];
Painter.parse=function(text){const el={};const T=text||'';
  const map=[[/山峰|高山|高高的山|险峰|香炉/,'highpeak'],[/远山|群山|前川|山/,'mountain'],[/云|烟|紫烟/,'cloud'],[/湍急|急流|奔腾|磅礴/,'rush'],[/水花|飞溅|浪花|水雾/,'spray'],[/阳光|太阳|日照|金色/,'sun'],[/松|树/,'pine'],[/彩虹|虹/,'rainbow']];
  map.forEach(([re,k])=>{if(re.test(T))el[k]=1;});return el;};
Painter.styleOf=t=>/中国画|国画|水墨/.test(t)?'ink':/油画/.test(t)?'oil':/水彩/.test(t)?'water':null;

/* what should move, and how — the "analyse → predict" steps of image-to-video */
Painter.motionPlan=function(S){const E=S.el||{},out=[];
  if(S.scene==='chunjiang'){
    out.push({k:'water',name:'江水与潮水',move:true,rule:'波浪一层层向前涌动，潮水有起有落',at:[320,330],dir:[40,0]});
    out.push({k:'light',name:'月光与星光',move:true,rule:'水面月光一闪一闪，星星微微闪烁',at:[420,300],dir:[0,0]});
    if(E.moonrise) out.push({k:'moon',name:'明月',move:true,rule:'从海平面慢慢升起',at:[420,150],dir:[0,-40]}); else out.push({k:'moon',name:'明月',move:false,rule:'挂在天上，基本不动',at:[400,120]});
    if(E.flowers) out.push({k:'pine',name:'岸边花林',move:true,rule:'花枝随风轻轻摇摆',at:[60,250],dir:[12,0]});
    out.push({k:'sky',name:'夜空',move:false,rule:'背景，不需要动',at:[200,60]});
    return out;}
  out.push({k:'water',name:'瀑布水流',move:true,rule:E.rush?'从上往下快速冲下来':'从上往下流',at:[320,230],dir:[0,60]});
  out.push({k:'water2',name:'潭水波纹',move:true,rule:'一圈圈向外荡开',at:[320,355],dir:[50,0]});
  if(E.spray) out.push({k:'spray',name:'水花',move:true,rule:'向四周溅起，再落下',at:[320,320],dir:[-30,-30]});
  if(E.cloud) out.push({k:'cloud',name:'浮云',move:true,rule:'缓缓地向右飘移',at:[120,100],dir:[50,0]});
  if(E.sun) out.push({k:'light',name:'阳光',move:true,rule:'光芒一明一暗地闪烁',at:[530,78],dir:[0,0]});
  if(E.pine) out.push({k:'pine',name:'青松',move:true,rule:'枝叶随风轻轻摇摆',at:[150,140],dir:[12,0]});
  if(E.mountain||E.highpeak) out.push({k:'mountain',name:'山峰',move:false,rule:'山是不会动的，保持静止',at:[150,90]});
  out.push({k:'rock',name:'山崖石头',move:false,rule:'保持静止',at:[80,280]});
  if(E.rainbow) out.push({k:'rainbow',name:'彩虹',move:false,rule:'挂在水雾上，基本不动',at:[320,220]});
  return out;};
Painter.moveFrom=plan=>{const m={};plan.forEach(p=>{if(p.move){if(p.k==='water2')m.water=true;else m[p.k]=true;}});return m;};
Painter.describe=S=>{const n={highpeak:'高高的山峰',mountain:'远山',cloud:'浮云',rush:'湍急的水流',spray:'飞溅的水花',sun:'阳光',pine:'青松',rainbow:'彩虹',moonrise:'月亮升起',shimmer:'波光粼粼',flowers:'花林',far:'远景镜头'};return Object.keys(S.el||{}).map(k=>n[k]).filter(Boolean);};
window.Painter=Painter;
})();
