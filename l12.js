/* 第12讲 科学动画实验室 (v3) — WARM-UP 静图和动画 / EXP-01 科学动画实验室 / EXP-02 科学验证器 / EXP-03 找错误挑战 / EXP-04 小小探究员 / REVIEW 人做还是 AI 做 / QUIZ / DIARY */
(function(){
const {$,$$,esc,clamp}=App;const K='l12';const L={};App.lessons[K]=L;
const MODE={api:'平台 AI 接口',claude:'Claude 大模型',gpt:'GPT 大模型'};
const srcOf=m=>!m||m==='offline'?'离线示例（预置网页，示意）':(MODE[m]||m);
const clip=(s,n)=>{s=String(s||'').trim();return s.length>n?s.slice(0,n):s;};
const cut=(s,n)=>{s=String(s||'');return s.length>n?s.slice(0,n)+'…':s;};
const nz=s=>String(s||'').replace(/\s+/g,'');
Object.assign(App.HINTS||(App.HINTS={}),{
 'l12-th':{s:['不能完全依赖，因为','AI 会','所以我要'],ref:'不能完全依赖。因为我给了错误的提示词，AI 还是照着做出了动画。AI 做的东西不一定对，要对照课本和权威资料核对。'},
 'l12-con':{s:['我的结论是','依据是','和资料对比，'],ref:'我的结论是：离太阳越远的行星，转一圈用的时间越长。依据是动画里水星转得最快、海王星几乎不动，和参考卡上的公转时间也对得上。'}});

/* ---------- reference card: accepted astronomical values (approximate) ---------- */
const PL=[
 {n:'水星',col:'灰色，表面布满撞击坑',d:'0.38',T:'约 88 天',Ty:0.241,e:0.206,hex:'#9a9a9a'},
 {n:'金星',col:'淡黄色（被厚厚的云层包裹）',d:'0.95',T:'约 225 天',Ty:0.615,e:0.007,hex:'#e8d5a3'},
 {n:'地球',col:'蓝色海洋、白色云层和陆地',d:'1',T:'约 365 天',Ty:1,e:0.017,hex:'#3d7fd9'},
 {n:'火星',col:'红褐色（橙红色）',d:'0.53',T:'约 687 天',Ty:1.881,e:0.093,hex:'#c1502e'},
 {n:'木星',col:'浅棕色与米白色相间的条纹，有大红斑',d:'11.2',T:'约 11.9 年',Ty:11.86,e:0.049,hex:'#d2a26b'},
 {n:'土星',col:'淡黄色，有明显的光环',d:'9.4',T:'约 29.5 年',Ty:29.46,e:0.057,hex:'#e3c983'},
 {n:'天王星',col:'淡蓝绿色',d:'4.0',T:'约 84 年',Ty:84.0,e:0.046,hex:'#9fe3e6'},
 {n:'海王星',col:'深蓝色',d:'3.9',T:'约 165 年',Ty:164.8,e:0.009,hex:'#3f5fd6'}];
const PN=PL.map(p=>p.n);
const FACTS=['太阳是太阳系的中心天体，直径约为地球的 109 倍；八颗行星都绕太阳公转。',
 '行星的轨道是椭圆，但都非常接近圆形；太阳位于椭圆的一个<b>焦点</b>上，而不是正中间。',
 '离太阳越近的行星公转越快、转一圈用时越短（开普勒第三定律：公转周期的平方与轨道半长轴的立方成正比）。',
 '同一颗行星（或彗星）离太阳近时走得快，远时走得慢（开普勒第二定律）。',
 '八颗行星的公转方向相同（从地球北极上方看，都是逆时针）。',
 '月球是地球的卫星，直径约为地球的 27%，约 27.3 天绕地球转一圈，并跟着地球一起绕太阳公转。',
 '土星的光环最明显；木星、天王星、海王星也有环，但很暗淡。'];
const more=h=>`<details class="more"><summary>说明</summary>${h}</details>`;
const refD=()=>`<details class="more"><summary>参考卡</summary><p>太阳系参考卡（依据公认天文数据整理）</p>
 <div class="scroll"><table class="rep"><thead><tr><th>由近到远</th><th>行星</th><th>颜色与外观</th><th>直径（地球=1）</th><th>公转一周</th><th>轨道偏心率</th></tr></thead><tbody>
 ${PL.map((p,i)=>`<tr><td class="mono">${i+1}</td><td><i class="l12-sw" style="background:${p.hex}"></i>${p.n}</td><td>${p.col}</td><td class="mono">${p.d}</td><td>${p.T}</td><td class="mono">${p.e}</td></tr>`).join('')}</tbody></table></div>
 <ul class="l12-facts">${FACTS.map(f=>`<li>${f}</li>`).join('')}</ul>
 <p class="note">数值为近似值。偏心率越接近 0，轨道越接近正圆。这张卡是本平台整理的，请再对照科学课本核对。</p></details>`;

/* ---------- preset pages: real, working canvas animations (template) ---------- */
const DA=[38,52,67,82,112,136,160,182],DR=[2.6,4,4.2,3.2,9,8,5.8,5.6];
const WRONGC=['#d9d9d9','#4cc9f0','#4f7cff','#6fcf63','#f2c94c','#b38cff','#ff8a65','#ffffff'];
const V1T=[3.9,2.9,4.5,6.3,4.2,9,5.7,7.9];
const KT=PL.map(p=>+(p.Ty*5).toFixed(2));
const PH=[0.05,0.31,0.58,0.83,0.17,0.44,0.7,0.94];
function page(o){o.bodies.forEach((b,i)=>{if(b.ph==null)b.ph=PH[i%8];});const lab=!!o.labels,mode=o.mode||'circle',moonAny=o.bodies.some(b=>b.moon),dirAny=o.bodies.some(b=>b.dir===-1),ringAny=o.bodies.some(b=>b.ring);
 const row=b=>'  {'+[lab?`name:'${b.n}'`:'',`color:'${b.c}'`,`r:${b.r}`,`a:${b.a}`,mode==='focus'?`e:${b.e}`:'',`T:${b.T}`,`p:${b.ph}`,b.dir===-1?'dir:-1':'',b.ring?'ring:true':'',b.moon?`moon:{${lab?`name:'${b.moon.n}', `:''}color:'${b.moon.c}', r:${b.moon.r}, a:${b.moon.a}, T:${b.moon.T}}`:''].filter(Boolean).join(', ')+'}';
 const Lx=[],P=s=>Lx.push(s);
 P('<!doctype html>');P('<html lang="zh-CN">');P('<head>');P('<meta charset="utf-8">');P('<meta name="viewport" content="width=device-width,initial-scale=1">');P(`<title>${o.title}</title>`);P('<style>');
 P('  html,body{margin:0;height:100%;background:#03040f;overflow:hidden;font-family:sans-serif}');P('  canvas{display:block;width:100%;height:100%}');
 P('  h1{position:fixed;left:10px;top:6px;margin:0;color:#dfe8ff;font-size:14px;font-weight:600}');if(o.note)P('  .note{position:fixed;left:10px;right:10px;bottom:6px;color:#9fb0d0;font-size:12px}');
 P('</style>');P('</head>');P('<body>');P(`<h1>${o.title}</h1>`);P('<canvas id="sky"></canvas>');if(o.note)P(`<div class="note">${o.note}</div>`);
 P('<script>');P('// 中心天体');P(`const center={${lab?`name:'${o.center.n}', `:''}color:'${o.center.c}', r:${o.center.r}};`);
 P(`// 绕着中心转的天体：颜色 color、大小 r、轨道大小 a${mode==='focus'?'、轨道扁的程度 e':''}、转一圈的秒数 T、出发位置 p（一圈的几分之几）`);
 P('const bodies=[');P(o.bodies.map(row).join(',\n'));P('];');
 P("const cv=document.getElementById('sky'),ctx=cv.getContext('2d');");P('let W=0,H=0,k=1;');
 P('function resize(){');P('  W=cv.width=cv.clientWidth;H=cv.height=cv.clientHeight;');
 P(`  const far=Math.max(...bodies.map(b=>b.a${mode==='focus'?'*(1+b.e)':''}${moonAny?'+(b.moon?b.moon.a:0)':''}));`);P('  k=Math.max(0.05,(Math.min(W,H)/2-20)/far);');P('}');P("addEventListener('resize',resize);resize();");
 P('// 背景里的星星（位置固定）');P('const stars=Array.from({length:90},(_,i)=>[(i*97%101)/101,(i*57%89)/89]);');
 P('function dot(x,y,r,color){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();}');
 if(lab)P("function label(text,x,y){ctx.fillStyle='#dfe8ff';ctx.font='12px sans-serif';ctx.textAlign='center';ctx.fillText(text,x,y);}");
 if(mode==='focus'&&o.kepler){P('// 开普勒方程：算出天体在椭圆上的位置（离太阳近时走得快，远时走得慢）');P('function solve(M,e){let E=M;for(let i=0;i<8;i++)E-=(E-e*Math.sin(E)-M)/(1-e*Math.cos(E));return E;}');}
 P('// 算出天体在第 t 秒的位置');P('function place(b,t,cx,cy){');P(`  const ang=-2*Math.PI*(t/b.T+b.p)${dirAny?'*(b.dir||1)':''};`);
 if(mode==='circle')P('  return [cx+b.a*k*Math.cos(ang),cy+b.a*k*Math.sin(ang)];');
 else if(mode==='flat')P('  return [cx+b.a*k*Math.cos(ang),cy+b.a*k*0.6*Math.sin(ang)];');
 else{P(`  const E=${o.kepler?'solve(ang,b.e)':'ang'},bb=b.a*Math.sqrt(1-b.e*b.e);`);P('  return [cx+b.a*k*(Math.cos(E)-b.e),cy+bb*k*Math.sin(E)];');}
 P('}');P('function draw(ms){');P('  const t=ms/1000,cx=W/2,cy=H/2;');P("  ctx.fillStyle='#03040f';ctx.fillRect(0,0,W,H);");
 P("  ctx.fillStyle='#ffffff55';for(const [sx,sy] of stars)ctx.fillRect(sx*W,sy*H,1.2,1.2);");
 P('  // 画轨道');P("  ctx.strokeStyle='#ffffff26';ctx.lineWidth=1;");P('  for(const b of bodies){');P('    ctx.beginPath();');
 if(mode==='circle')P('    ctx.arc(cx,cy,b.a*k,0,Math.PI*2);');else if(mode==='flat')P('    ctx.ellipse(cx,cy,b.a*k,b.a*k*0.6,0,0,Math.PI*2);');
 else P('    ctx.ellipse(cx-b.a*b.e*k,cy,b.a*k,b.a*Math.sqrt(1-b.e*b.e)*k,0,0,Math.PI*2);');
 P('    ctx.stroke();');P('  }');P(`  // 中心天体：${o.center.n}`);P('  ctx.shadowColor=center.color;ctx.shadowBlur=18;dot(cx,cy,center.r,center.color);ctx.shadowBlur=0;');
 if(lab)P('  label(center.name,cx,cy+center.r+14);');
 P('  for(const b of bodies){');P('    const [x,y]=place(b,t,cx,cy);');
 if(ringAny)P("    if(b.ring){ctx.strokeStyle='#d9c58e';ctx.lineWidth=1.6;ctx.beginPath();ctx.ellipse(x,y,b.r*2.1,b.r*0.75,-0.35,0,Math.PI*2);ctx.stroke();ctx.lineWidth=1;}");
 P('    dot(x,y,b.r,b.color);');if(lab)P('    label(b.name,x,y-b.r-5);');
 if(moonAny){P('    if(b.moon){ // 卫星绕着这颗天体转');P('      const m=b.moon,ma=-2*Math.PI*t/m.T,mx=x+m.a*k*Math.cos(ma),my=y+m.a*k*Math.sin(ma);');P('      dot(mx,my,m.r,m.color);'+(lab?'label(m.name,mx,my-m.r-4);':''));P('    }');}
 P('  }');P('  requestAnimationFrame(draw);');P('}');P('requestAnimationFrame(draw);');P('</script>');P('</body>');P('</html>');
 return Lx.join('\n');}
/* the textbook's solar system, by flags: N names, C colours, E ellipse, F sun at a focus, K real period ratios, O "示意" note, S regression (Uranus/Neptune swapped), M moon */
function solar(f){f=f||{};const mode=f.F?'focus':f.E?'flat':'circle';
 const bs=PL.map((p,i)=>({n:p.n,c:f.C?p.hex:WRONGC[i],r:DR[i],a:DA[i],e:p.e,T:f.K?KT[i]:V1T[i],ring:!!f.C&&p.n==='土星'}));
 if(f.S){const t=bs[6].a;bs[6].a=bs[7].a;bs[7].a=t;}
 if(f.M)bs[2].moon={n:'月球',c:'#c8c8c8',r:1.6,a:12,T:f.K?+(5*27.32/365.25).toFixed(3):1.2};
 return page({title:'太阳系行星运转',labels:!!f.N,mode,kepler:!!f.K,center:{n:'太阳',c:'#ffcc33',r:12},bodies:bs,note:f.O?'示意：行星大小和距离没有按真实比例'+(f.K?'；公转周期按真实比例（地球 5 秒转一圈）':''):''});}
const fStr=f=>Object.keys(f||{}).filter(k=>f[k]).sort().join('');
const fObj=s=>Object.fromEntries(String(s||'').split('').map(c=>[c,1]));
const FULL={N:1,C:1,E:1,F:1,K:1,O:1};

/* ---------- probe: reads where the named bodies are drawn (canvas labels or page text) and reports to the platform ---------- */
const NAMES=['太阳',...PN,'月球','彗星'];
function probeFn(N){var AL={'月亮':'月球'};var P=CanvasRenderingContext2D.prototype,fa=P.arc,ft=P.fillText,fs=P.strokeText,arcs=[],pos={},tr={},T0=performance.now();
 function cssPt(c,x,y){var m=c.getTransform(),cv=c.canvas,r=cv.getBoundingClientRect(),sx=r.width/(cv.width||1),sy=r.height/(cv.height||1);return [r.left+(m.a*x+m.c*y+m.e)*sx,r.top+(m.b*x+m.d*y+m.f)*sy,Math.sqrt(Math.abs(m.a*m.d-m.b*m.c))*sx];}
 function key(s){s=String(s).split(' ').join('').trim();var nx=function(w){var c=s.charAt(w.length);return !c||!/[一-鿿]/.test(c);};for(var a in AL)if(s.indexOf(a)===0&&nx(a))return AL[a];for(var i=0;i<N.length;i++)if(s.indexOf(N[i])===0&&nx(N[i]))return N[i];return null;}
 P.arc=function(x,y,R){try{var p=cssPt(this,x,y),rr=R*p[2];if(rr>=1.2&&rr<=45){arcs.push([performance.now(),p[0],p[1]]);if(arcs.length>400)arcs.splice(0,150);}}catch(e){}return fa.apply(this,arguments);};
 function lab(s,x,y,c){var k=key(s);if(!k||String(s).length>12)return;try{var p=cssPt(c,x,y),now=performance.now(),b=null,bd=45;for(var i=arcs.length-1;i>=0;i--){var a=arcs[i];if(now-a[0]>8)break;var d=Math.hypot(a[1]-p[0],a[2]-p[1]);if(d<=20){b=a;break;}if(d<bd){bd=d;b=a;}}pos[k]=[now,b?b[1]:p[0],b?b[2]:p[1],0];}catch(e){}}
 P.fillText=function(s,x,y){lab(s,x,y,this);return ft.apply(this,arguments);};P.strokeText=function(s,x,y){lab(s,x,y,this);return fs.apply(this,arguments);};
 function dom(){if(!document.body)return;var els=document.body.getElementsByTagName('*'),now=performance.now();for(var i=0;i<els.length;i++){var e=els[i];if(e.childElementCount||/^(SCRIPT|STYLE|CANVAS)$/.test(e.tagName))continue;var t=(e.textContent||'').trim();if(!t||t.length>10)continue;var k=key(t);if(!k)continue;if(pos[k]&&!pos[k][3]&&now-pos[k][0]<300)continue;var r=e.getBoundingClientRect();if(!r.width&&!r.height)continue;var q=e.parentElement;if(q&&q!==document.body){var qr=q.getBoundingClientRect();if(qr.width>0&&qr.width<=90&&qr.height<=90)r=qr;}pos[k]=[now,r.left+r.width/2,r.top+r.height/2,1];}}
 setInterval(function(){try{dom();}catch(e){}var now=performance.now();for(var k in pos){var p=pos[k];if(now-p[0]>400)continue;var s=tr[k]||(tr[k]=[]);s.push([Math.round(now-T0),Math.round(p[1]*10)/10,Math.round(p[2]*10)/10]);if(s.length>300)s.shift();}},50);
 setInterval(function(){try{parent.postMessage({l12probe:1,t:Math.round(performance.now()-T0),w:innerWidth,h:innerHeight,tr:tr},'*');}catch(e){}},700);}
const PROBE='<script>('+probeFn.toString()+')('+JSON.stringify(NAMES)+');<\/script>';
function withProbe(html){html=String(html||'');if(/<head(\s[^>]*)?>/i.test(html))return html.replace(/<head(\s[^>]*)?>/i,m=>m+PROBE);if(/<html[^>]*>/i.test(html))return html.replace(/<html[^>]*>/i,m=>m+'<head>'+PROBE+'</head>');return PROBE+html;}
const PROBES=new Map();
window.addEventListener('message',e=>{const d=e.data;if(!d||!d.l12probe)return;for(const [f,cb] of PROBES){if(!f.isConnected){PROBES.delete(f);continue;}if(f.contentWindow===e.source){try{cb(analyze(d));}catch(er){console.warn(er);}break;}}});
function show(el,html,{height=300,on}={}){const f=App.Code.preview(el,on?withProbe(html):html,{height,title:'科学动画预览'});f.style.background='#03040f';if(on)PROBES.set(f,on);return f;}
function orbit(s,cen){let prev=null,acc=0;const th=[],rs=[],ts=[];s.forEach((p,i)=>{const c=cen(i);const dx=p[1]-c[0],dy=p[2]-c[1];const a=Math.atan2(dy,dx);if(prev!=null){let da=a-prev;while(da>Math.PI)da-=2*Math.PI;while(da<-Math.PI)da+=2*Math.PI;acc+=da;}prev=a;th.push(acc);rs.push(Math.hypot(dx,dy));ts.push(p[0]/1000);});
 const n=ts.length,mt=ts.reduce((a,b)=>a+b,0)/n,ma=th.reduce((a,b)=>a+b,0)/n;let nu=0,de=0;for(let i=0;i<n;i++){nu+=(ts[i]-mt)*(th[i]-ma);de+=(ts[i]-mt)**2;}const w=de?nu/de:0;
 let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;s.forEach(p=>{x0=Math.min(x0,p[1]);x1=Math.max(x1,p[1]);y0=Math.min(y0,p[2]);y1=Math.max(y1,p[2]);});
 return {w,T:Math.abs(w)>1e-3?2*Math.PI/Math.abs(w):Infinity,span:Math.abs(th[n-1]-th[0]),rMin:Math.min(...rs),rMax:Math.max(...rs),rMean:rs.reduce((a,b)=>a+b,0)/n,rs,ts,bb:[x0,x1,y0,y1]};}
function analyze(d){const tr=d.tr||{},B={};let dur=0;
 for(const k in tr){const s=tr[k];if(!Array.isArray(s)||s.length<8)continue;let mx=0,my=0;for(const p of s){mx+=p[1];my+=p[2];}mx/=s.length;my/=s.length;
  const amp=Math.sqrt(s.reduce((a,p)=>a+(p[1]-mx)**2+(p[2]-my)**2,0)/s.length);const du=(s[s.length-1][0]-s[0][0])/1000;dur=Math.max(dur,du);B[k]={s,mx,my,amp,dur:du};}
 const sun=B['太阳'],still=!!sun&&sun.amp<5,c=still?[sun.mx,sun.my]:[(d.w||0)/2,(d.h||0)/2];
 for(const k in B){if(k==='太阳'&&still)continue;const b=B[k];b.o=orbit(b.s,()=>c);b.moving=b.amp>2.5||b.o.span>0.05;}
 if(B['月球']&&B['地球']){const em=new Map(B['地球'].s.map(p=>[p[0],p]));const rel=B['月球'].s.filter(p=>em.has(p[0]));if(rel.length>=8)B['月球'].rel=orbit(rel,i=>{const e=em.get(rel[i][0]);return [e[1],e[2]];});}
 return {B,c,still,hasSun:!!sun,dur,el:Math.max(dur,(d.t||0)/1000)};}

/* ---------- checks computed from code + measurement ---------- */
const CC=document.createElement('canvas').getContext('2d');
function parseCol(str){CC.fillStyle='#010203';CC.fillStyle=str;const v=CC.fillStyle;if(v==='#010203'&&!/^#010203$/i.test(str))return null;let r,g,b;
 if(v[0]==='#'){r=parseInt(v.slice(1,3),16);g=parseInt(v.slice(3,5),16);b=parseInt(v.slice(5,7),16);}else{const m=/(\d+)\D+(\d+)\D+(\d+)/.exec(v);if(!m)return null;r=+m[1];g=+m[2];b=+m[3];}
 r/=255;g/=255;b/=255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b),l=(mx+mn)/2;let h=0,s=0;if(mx!==mn){const dd=mx-mn;s=l>0.5?dd/(2-mx-mn):dd/(mx+mn);h=mx===r?((g-b)/dd+(g<b?6:0)):mx===g?((b-r)/dd+2):((r-g)/dd+4);h*=60;}return {h,s,l};}
const HUE={'水星':c=>c.s<0.28||(c.h>=15&&c.h<=50&&c.s<0.45),'金星':c=>(c.h>=25&&c.h<=65&&c.l>=0.5)||(c.s<0.2&&c.l>=0.7),'地球':c=>c.h>=180&&c.h<=250&&c.s>0.25,'火星':c=>(c.h<=35||c.h>=340)&&c.s>0.3,
 '木星':c=>c.h>=12&&c.h<=50&&c.s>0.15,'土星':c=>c.h>=30&&c.h<=62&&c.s>0.15,'天王星':c=>c.h>=160&&c.h<=205&&c.s>0.2,'海王星':c=>c.h>=200&&c.h<=255&&c.s>0.3};
function colorFor(code,name){let i=code.indexOf(name);while(i>=0){if(!/['"`]/.test(code[i-1]||'')){i=code.indexOf(name,i+name.length);continue;}const st=code.lastIndexOf('{',i),en=code.indexOf('}',i);const seg=code.slice(st>=0&&i-st<150?st:i,en>=0&&en-i<200?en:i+120);
  const m=seg.match(/#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b|rgba?\([^)]*\)|hsla?\([^)]*\)|['"][a-zA-Z]{3,20}['"]/g)||[];for(const x of m){const c=parseCol(x.replace(/['"]/g,''));if(c)return Object.assign(c,{raw:x.replace(/['"]/g,'')});}i=code.indexOf(name,i+name.length);}return null;}
const CK=[['n8','8 颗行星都有吗？'],['ord','顺序对吗？（水金地火木土天海）'],['spd','越靠内转得越快吗？'],['ell','轨道是椭圆（接近圆）吗？'],['foc','太阳偏在一边（椭圆的焦点上）吗？'],['col','颜色、外观和资料相符吗？'],['note','注明“示意、不按比例”了吗？']];
const fmtT=T=>!isFinite(T)?'几乎不动':T>=100?Math.round(T)+' 秒':T.toFixed(1)+' 秒';
function measured(an){if(!an)return [];return PL.filter(p=>an.B[p.n]&&an.B[p.n].o&&an.B[p.n].o.rMean>4);}
function check1(html,an){const code=String(html||''),R={},inCode=PL.filter(p=>code.includes(p.n)),ms=measured(an),ready=!!an&&an.el>=3;
 const seen=ms.length>inCode.length?ms:inCode;
 if(!seen.length)R.n8=ready||!an?{s:'?',t:'代码和画面里都没有行星名字，程序数不出来。请你自己数一数。'}:{s:'?',t:'测量中……'};
 else R.n8=seen.length>=8?{s:1,t:'找到 8 颗：'+PN.join('、')}:{s:0,t:`只找到 ${seen.length} 颗：${seen.map(p=>p.n).join('、')}`};
 if(ms.length>=3&&ready){const by=ms.slice().sort((a,b)=>an.B[a.n].o.rMean-an.B[b.n].o.rMean);const bad=[];for(let i=0;i<by.length-1;i++)if(PN.indexOf(by[i].n)>PN.indexOf(by[i+1].n))bad.push(`${by[i].n}比${by[i+1].n}离太阳还近`);
  R.ord=bad.length?{s:0,t:'画面测量：'+bad.join('；')}:{s:1,t:'画面测量：'+by.map(p=>p.n).join(' → ')};
  const bad2=[];for(let i=0;i<by.length-1;i++){const a=an.B[by[i].n].o.T,b=an.B[by[i+1].n].o.T;if(!isFinite(a)&&!isFinite(b))continue;if(a>=b*0.97)bad2.push(`${by[i].n}在内侧，却比${by[i+1].n}转得慢（${fmtT(a)} / ${fmtT(b)} 一圈）`);}
  R.spd=bad2.length?{s:0,t:'画面测量：'+bad2.slice(0,2).join('；')}:{s:1,t:'画面测量：由内到外，转一圈的时间越来越长'};}
 else if(!ready&&(ms.length>=3||inCode.length>=3)){R.ord={s:'?',t:'测量中……'};R.spd={s:'?',t:'测量中……'};}
 else{const qi=n=>{const m=new RegExp(`['"\`]${n}`).exec(code);return m?m.index:-1;};const qd=inCode.filter(p=>qi(p.n)>=0);if(qd.length>=3){const by=qd.slice().sort((a,b)=>qi(a.n)-qi(b.n));const ok=by.every((p,i)=>i===0||PN.indexOf(by[i-1].n)<PN.indexOf(p.n));R.ord={s:ok?1:0,t:'按代码里出现的先后推断：'+by.map(p=>p.n).join('、')};}
  else R.ord={s:'?',t:'没有名字标签，分不清哪颗是哪颗。请对照参考卡用眼睛判断。'};
  R.spd={s:'?',t:inCode.length>=3?'画面里还没有测到行星的位置（动画要出现在屏幕上才能测量，或者名字不是画在行星旁边）。请你观察：最里面的是不是转得最快？':'没有名字标签，程序没法逐颗测量转速。请你观察：最里面的是不是转得最快？'};}
 const el=ready?ms.filter(p=>an.B[p.n].o.span>=Math.PI):[];
 if(el.length){const flat=el.filter(p=>{const o=an.B[p.n].o;return o.rMin>4&&o.rMax/o.rMin>1.05;});R.ell=flat.length?{s:1,t:`测得 ${flat.map(p=>p.n).join('、')} 离太阳的距离会变化（椭圆）`}:{s:0,t:`测得 ${el.map(p=>p.n).join('、')} 离太阳的距离始终不变：是正圆`};}
 else if(/ellipse\(|椭圆/.test(code))R.ell={s:'?',t:'代码里用到了椭圆，请你看看轨道是不是椭圆。'};
 else R.ell=ready?{s:'?',t:'测不出来。请你看看轨道是正圆还是椭圆。'}:{s:'?',t:'测量中……'};
 if(R.ell.s===0)R.foc={s:'-',t:'轨道是正圆，还谈不上焦点。'};
 else{const fc=ready?ms.map(p=>{const o=an.B[p.n].o;if(o.span<1.9*Math.PI||o.rMin<5||o.rMax/o.rMin<1.05)return null;const [x0,x1,y0,y1]=o.bb,a=Math.max(x1-x0,y1-y0)/2;const off=Math.hypot((x0+x1)/2-an.c[0],(y0+y1)/2-an.c[1])/a,e=(o.rMax-o.rMin)/(o.rMax+o.rMin);return {n:p.n,off,e,ok:off>Math.max(0.02,0.4*e)};}).filter(Boolean):[];
  R.foc=fc.length?(fc.some(x=>!x.ok)?{s:0,t:`${fc.filter(x=>!x.ok).map(x=>x.n).join('、')}的椭圆中心就是太阳：太阳在椭圆正中间，不在焦点上`}:{s:1,t:`${fc.map(x=>x.n).join('、')}的轨道中心偏离太阳，太阳在一侧的焦点上`}):{s:'?',t:'还没有行星转满一整圈，请你看看太阳是在椭圆正中间，还是偏在一侧。'};}
 const cols=PL.map(p=>({p,c:colorFor(code,p.n)})).filter(x=>x.c);
 if(cols.length<4)R.col={s:'?',t:'代码里找不到每颗行星对应的颜色。请打开参考卡，用眼睛核对。'};
 else{const bad=cols.filter(x=>!HUE[x.p.n](x.c));R.col=bad.length?{s:0,t:bad.slice(0,3).map(x=>`${x.p.n}用了 ${x.c.raw}，资料是“${x.p.col.split('，')[0]}”`).join('；')}:{s:1,t:`${cols.length} 颗行星的颜色与资料相符（程序按色调判断）`};}
 R.note=/示意|不按.{0,4}比例|没有按.{0,8}比例|不是真实比例|并非真实比例|未按.{0,4}比例/.test(code)?{s:1,t:'页面上写了“示意 / 不按比例”'}:{s:0,t:'页面上没有说明大小和距离不是真实比例'};
 return R;}
const ckVal=(R,man,k)=>{const r=R[k];if(!r)return null;if(r.s===1||r.s===0)return r.s;if(r.s==='?'&&man&&man[k]!=null)return man[k];return null;};
const CKS={n8:'8 颗行星',ord:'行星顺序',spd:'内快外慢',ell:'椭圆轨道',foc:'太阳偏一边',col:'颜色外观',note:'注明示意'};
/* offline preset pages are built from flags, so their checklist is known at once (no need to wait for the measurement) */
function flagCk(f){f=f||{};const N=!!f.N,q={s:'?',t:'没有名字，程序分不清谁是谁'};
 return {n8:N?{s:1,t:'找到 8 颗：'+PN.join('、')}:q,
  ord:!N?q:f.S?{s:0,t:'天王星和海王星的位置颠倒了'}:{s:1,t:'水金地火木土天海，顺序正确'},
  spd:!N?q:f.K?{s:1,t:'由内到外，转一圈的时间越来越长'}:{s:0,t:'有的行星在内侧，却比外侧的转得慢'},
  ell:f.E||f.F?{s:1,t:'行星离太阳的距离会变化（椭圆）'}:{s:0,t:'轨道是正圆'},
  foc:f.F?{s:1,t:'太阳偏在一侧的焦点上'}:f.E?{s:0,t:'太阳在椭圆正中间，不在焦点上'}:{s:'-',t:'轨道是正圆，还谈不上焦点'},
  col:!N?q:f.C?{s:1,t:'8 颗行星的颜色与资料相符'}:{s:0,t:'颜色和资料对不上，比如火星成了绿色'},
  note:f.O?{s:1,t:'页面上写了“示意 / 不按比例”'}:{s:0,t:'页面上没有说明大小和距离不是真实比例'}};}
function ckHTML(R,man,allow,prev){const chg=(k,v)=>!prev?'':prev[k]!==1&&v===1?'<em class="new">新通过</em>':prev[k]===1&&v===0?'<em class="brk">改坏了</em>':'';
 if(!allow){const st=CK.map(([k])=>{const r=R[k]||{s:'?',t:''},v=ckVal(R,man,k);return {k,r,v,cls:r.s==='-'?'na':v===1?'ok':v===0?'bad':'man',ic:r.s==='-'?'—':v===1?'✓':v===0?'✗':'?'};});const bad=st.filter(x=>x.v===0),un=st.find(x=>x.r.s==='?');
  return `<div class="l12-ckg">${st.map(x=>`<span class="l12-ck ${x.cls}" title="${esc(x.r.t)}"><span class="ic">${x.ic}</span><b>${CKS[x.k]}</b>${chg(x.k,x.v)}</span>`).join('')}</div>${bad.length?`<ul class="l12-why">${bad.map(x=>`<li>${esc(x.r.t)}</li>`).join('')}</ul>`:''}${un?`<p class="note">带 ? 的：${esc(un.r.t)}。</p>`:''}`;}
 return `<div class="l12-cks">${CK.map(([k,t])=>{const r=R[k]||{s:'?',t:'测量中……'};const v=ckVal(R,man,k);const cls=r.s==='-'?'na':v===1?'ok':v===0?'bad':'man';const ic=r.s==='-'?'—':v===1?'✓':v===0?'✗':'?';
 return `<div class="l12-ck ${cls}"><span class="ic">${ic}</span><div><b>${t}</b>${chg(k,v)}${v===1&&r.s===1?'':`<span class="t">${esc(r.t)}${r.s==='?'&&man&&man[k]!=null?'（你核对的）':''}</span>`}${allow&&r.s==='?'&&!/测量中/.test(r.t)?`<span class="l12-man" data-k="${k}"><button type="button" class="chip ${man&&man[k]===1?'on':''}" data-v="1">我核对：对</button><button type="button" class="chip ${man&&man[k]===0?'on':''}" data-v="0">不对</button></span>`:''}</div></div>`;}).join('')}</div>`;}
function measTable(an){const ms=measured(an).filter(p=>an.B[p.n].moving||isFinite(an.B[p.n].o.T));if(!ms.length)return '<p class="note">画面里没有找到带名字的行星，暂时没有测量数据。</p>';const E=an.B['地球']&&an.B['地球'].o&&isFinite(an.B['地球'].o.T)?an.B['地球'].o.T:null;
 return `<div class="scroll"><table class="rep l12-mt"><thead><tr><th>行星</th><th>画面中离太阳</th><th>转一圈（动画）</th>${E?'<th>相对地球（动画）</th>':''}<th>相对地球（真实）</th></tr></thead><tbody>${ms.map(p=>{const o=an.B[p.n].o;return `<tr><td>${p.n}</td><td class="mono">${Math.round(o.rMean)} 像素</td><td class="mono">${fmtT(o.T)}</td>${E?`<td class="mono">${isFinite(o.T)?(o.T/E).toFixed(2):'—'}</td>`:''}<td class="mono">${p.Ty}</td></tr>`;}).join('')}</tbody></table></div>`;}

/* ---------- EXP-02 presets and the "who goes round whom" check ---------- */
const W2={moon:{p:'生成太阳围绕月球运转的动画',html:()=>page({title:'太阳围绕月球运转',labels:true,center:{n:'月球',c:'#c8c8c8',r:9},bodies:[{n:'太阳',c:'#ffcc33',r:16,a:80,T:6}]}),
  a:'好的！下面是“太阳围绕月球运转”的动画：月球在画面中间，太阳沿着圆形轨道绕月球转。',
  b:'提醒：按照科学事实，月球绕地球转，地球带着月球一起绕太阳转，太阳并不会绕月球转。下面仍按你的要求做了“太阳围绕月球运转”的动画，它不符合真实情况，只能当作想象。'},
 earth:{p:'生成太阳绕地球运转的动画',html:()=>page({title:'太阳绕地球运转',labels:true,center:{n:'地球',c:'#3d7fd9',r:9},bodies:[{n:'月球',c:'#c8c8c8',r:3,a:26,T:2.2},{n:'太阳',c:'#ffcc33',r:15,a:85,T:8}]}),
  a:'好的，这是太阳绕地球运转的动画：地球在中间，月球和太阳都绕着地球转。',
  b:'注意：“太阳绕地球转”是古代地心说的看法，现代科学已经证实是地球绕太阳转。下面按你的要求生成了动画，请把它当作历史上的错误观点来看。'}};
const RIGHT={p:'生成以太阳为中心的太阳系天体运转动画',html:()=>solar(Object.assign({M:1},FULL)),t:'好的！下面是以太阳为中心的太阳系天体运转动画：八颗行星按离太阳由近到远的顺序绕太阳公转，月球绕地球转。行星大小和距离不是真实比例（示意）。'};
const DOUBT=/实际上|事实上|其实|科学上|科学事实|并不|不会绕|不是绕|错误|不符合|不正确|注意|提醒|真实情况|地心说|应该是|地球绕太阳|绕着太阳/;
const prose=t=>String(t||'').replace(/```[\s\S]*?(```|$)/g,'').replace(/<!doctype[\s\S]*<\/html>/i,'').trim();
function geo(an){if(!an||an.el<3)return {s:'?',t:'正在测量画面里各天体的位置……'};const B=an.B;
 if(!B['太阳'])return {s:'?',t:'画面里没有找到“太阳”的名字标签，程序无法判断谁绕谁转。请你用眼睛观察。'};
 const still=Object.keys(B).filter(k=>k!=='太阳'&&B[k].amp<5).sort((a,b)=>B[a].amp-B[b].amp);
 if(B['太阳'].amp>=5)return {s:0,t:`程序测量：太阳在动，${still[0]?`“${still[0]}”在中间不动——画面表现的是“太阳绕${still[0]}转”，`:''}与科学事实不符（应是地球等行星绕太阳转）。`};
 const parts=[];let ok=1;const E=B['地球'];if(E&&E.moving)parts.push('地球绕太阳转 ✓');else if(E){parts.push('地球没有绕太阳转 ✗');ok=0;}
 const M=B['月球'];if(M&&E){const r=M.rel;if(r&&r.span>0.6){const cv=Math.sqrt(r.rs.reduce((a,x)=>a+(x-r.rMean)**2,0)/r.rs.length)/r.rMean;if(cv<0.35)parts.push('月球绕地球转 ✓');else{parts.push('月球没有绕着地球转 ✗');ok=0;}}else{parts.push('月球没有绕着地球转 ✗');ok=0;}}
 const np=PL.filter(p=>B[p.n]&&B[p.n].moving).length;if(np>1)parts.push(`${np} 颗行星绕太阳转`);
 return {s:ok,t:'程序测量：太阳在中间不动；'+(parts.join('，')||'其他天体绕着它转')+'。'};}

/* ---------- EXP-03 find-the-error presets ---------- */
const TP3=[1.2,2,3,4.5,7,10,13,16];
const sys=(mod,o={})=>{const bs=PL.map((p,i)=>({n:p.n,c:p.hex,r:DR[i],a:DA[i],e:p.e,T:TP3[i],ring:p.n==='土星'}));mod(bs);return page(Object.assign({title:'太阳系行星运转',labels:true,center:{n:'太阳',c:'#ffcc33',r:12},bodies:bs,note:'示意：行星大小和距离没有按真实比例'},o));};
const ERR=[
 {id:'p1',t:'八颗行星',html:()=>sys(bs=>{const t=bs[6].a;bs[6].a=bs[7].a;bs[7].a=t;bs[5].T=5.5;}),cl:[
  {id:'a',t:'天王星和海王星的位置颠倒了',err:1,why:'由近到远应是：水星、金星、地球、火星、木星、土星、天王星、海王星。海王星在最外侧。'},
  {id:'b',t:'土星比木星转得还快',err:1,why:'离太阳越远，公转越慢：木星约 11.9 年转一圈，土星约 29.5 年。'},
  {id:'c',t:'行星的大小和距离没有按真实比例',err:0,why:'页面已经注明“示意”。按真实比例画，行星小得几乎看不见；示意图可以简化，但要说明。'},
  {id:'d',t:'水星转得最快',err:0,why:'水星离太阳最近，约 88 天转一圈，是公转最快的行星。'},
  {id:'e',t:'土星带着光环',err:0,why:'土星有明显的光环，这是对的。'}]},
 {id:'p2',t:'地球和月球',html:()=>page({title:'地球和月球',labels:true,center:{n:'太阳',c:'#ffcc33',r:13},note:'示意：大小和距离没有按真实比例',bodies:[{n:'金星',c:'#e8d5a3',r:4,a:50,T:3},{n:'地球',c:'#3d7fd9',r:5,a:80,T:5},{n:'月球',c:'#c8c8c8',r:7.5,a:100,T:7},{n:'火星',c:'#c1502e',r:3.4,a:125,T:9}]}),cl:[
  {id:'a',t:'月球没有绕着地球转，而是自己绕着太阳转',err:1,why:'月球是地球的卫星，约 27.3 天绕地球一圈，并跟着地球一起绕太阳转。'},
  {id:'b',t:'月球画得比地球还大',err:1,why:'月球直径只有地球的 27% 左右，比地球小得多。'},
  {id:'c',t:'地球绕着太阳转',err:0,why:'地球绕太阳公转，这是对的。'},
  {id:'d',t:'画面里没有画出全部八颗行星',err:0,why:'研究地月系统时，可以只画相关的天体，这不是科学性错误。'}]},
 {id:'p3',t:'行星外观',html:()=>sys(bs=>{bs[3].c='#3f5fd6';bs[7].c='#c1502e';bs[5].ring=false;bs[4].ring=true;}),cl:[
  {id:'a',t:'火星是蓝色的，海王星是红色的',err:1,why:'火星是红褐色（橙红色），海王星是深蓝色，两者的颜色被弄反了。'},
  {id:'b',t:'光环画在了木星上，土星反而没有光环',err:1,why:'土星有明显的光环；木星的环很暗淡，几乎看不见。'},
  {id:'c',t:'木星画得最大',err:0,why:'木星是太阳系最大的行星，直径约为地球的 11 倍。'},
  {id:'d',t:'金星是淡黄色的',err:0,why:'金星被厚厚的云层包裹，看起来是淡黄色。'},
  {id:'e',t:'越靠外的行星转得越慢',err:0,why:'离太阳越远，公转一圈的时间越长，这是对的。'}]},
 {id:'p4',t:'方向与轨道',html:()=>sys(bs=>{bs[1].dir=-1;bs[2].T=6;bs[3].T=4.5;},{mode:'focus'}),cl:[
  {id:'a',t:'金星的公转方向和其他行星相反',err:1,why:'八颗行星的公转方向相同（从北极上方看都是逆时针）。'},
  {id:'b',t:'地球转一圈比火星还慢',err:1,why:'地球约 365 天转一圈，火星约 687 天，地球应该更快。'},
  {id:'c',t:'太阳不在轨道的正中间，而是偏在一边',err:0,why:'太阳在椭圆的一个焦点上，本来就不在正中间。这是对的！'},
  {id:'d',t:'轨道看起来几乎是圆的',err:0,why:'行星轨道是椭圆，但非常接近圆形，这是对的。'},
  {id:'e',t:'水星的轨道比其他行星扁一些',err:0,why:'水星轨道偏心率约 0.21，是八颗行星中最扁的。'}]}];
const ERRN=ERR.reduce((a,p)=>a+p.cl.length,0);

/* ---------- EXP-04 investigation questions ---------- */
const Q4={
 kep3:{q:'离太阳越远的行星，公转一圈的时间是不是越长？长多少？',pred:['越远，转一圈越久','越远，转一圈越快','差不多一样'],pa:0,
  p:'生成以太阳为中心的八大行星运转动画，按真实公转周期的比例设置速度（地球转一圈 5 秒），给每颗行星标上名字。',html:()=>solar(FULL)},
 kep2:{q:'同一个天体离太阳近的时候和远的时候，走得一样快吗？',pred:['离太阳近时走得快','离太阳远时走得快','一样快'],pa:0,
  p:'生成一颗彗星沿很扁的椭圆轨道绕太阳运转的动画，太阳在椭圆的一个焦点上，按开普勒定律设置速度，给天体标上名字。',
  html:()=>page({title:'彗星绕太阳运转',labels:true,mode:'focus',kepler:true,center:{n:'太阳',c:'#ffcc33',r:11},note:'示意：彗星轨道很扁（偏心率 0.7），速度按开普勒定律计算；大小和距离不按比例',bodies:[{n:'地球',c:'#3d7fd9',r:4,a:60,e:0.017,T:5},{n:'彗星',c:'#bfe9ff',r:3.5,a:100,e:0.7,T:10.76}]})},
 moon:{q:'地球绕太阳转一圈的时间里，月球绕地球转了几圈？',pred:['约 1 圈','约 13 圈','约 30 圈','约 365 圈'],pa:1,
  p:'生成太阳、地球和月球运转的动画：地球绕太阳转一圈 10 秒，月球按真实周期比例绕地球转，给天体标上名字。',
  html:()=>page({title:'太阳、地球和月球',labels:true,center:{n:'太阳',c:'#ffcc33',r:13},note:'示意：月球离地球的距离被放大了；周期按真实比例（地球 365 天、月球约 27.3 天转一圈）',bodies:[{n:'地球',c:'#3d7fd9',r:5,a:110,T:10,moon:{n:'月球',c:'#c8c8c8',r:2,a:24,T:+(10*27.32/365.25).toFixed(3)}}]})}};
function meas4(k,an){if(!an||an.el<3)return null;const B=an.B;
 if(k==='kep3'){const ms=measured(an);const E=B['地球']&&B['地球'].o;if(ms.length<3)return {ok:null,t:'画面里带名字的行星少于 3 颗，没法比较。'};
  const by=ms.slice().sort((a,b)=>B[a.n].o.rMean-B[b.n].o.rMean);let mono=true;for(let i=0;i<by.length-1;i++){const a=B[by[i].n].o.T,b=B[by[i+1].n].o.T;if(isFinite(a)&&a>=b*0.97)mono=false;if(!isFinite(a)&&isFinite(b))mono=false;}
  let agree=0,tot=0;if(E&&isFinite(E.T))ms.forEach(p=>{const o=B[p.n].o;if(!isFinite(o.T)||p.n==='地球')return;tot++;if(Math.abs(Math.log((o.T/E.T)/p.Ty))<Math.log(1.2))agree++;});
  return {ok:mono?1:0,t:`由内到外，转一圈的时间${mono?'越来越长 ✓':'没有越来越长 ✗'}${tot?`；快慢和资料对得上的有 ${agree}/${tot} 颗`:''}`,agree,tot};}
 if(k==='kep2'){const c=B['彗星']?'彗星':Object.keys(B).filter(n=>n!=='太阳'&&B[n].o).sort((a,b)=>(B[b].o.rMax/B[b].o.rMin)-(B[a].o.rMax/B[a].o.rMin))[0];const b=c&&B[c];if(!b||!b.o||b.o.rMin<3)return {ok:null,t:'没有找到绕太阳转的天体。'};
  const o=b.o,s=b.s;const lo=o.rMin*1.06,hi=o.rMax*0.97;let vn=[],vf=[],rn=[],rf=[];for(let i=0;i<s.length-1;i++){const dt=(s[i+1][0]-s[i][0])/1000;if(dt<=0||dt>0.2)continue;const v=Math.hypot(s[i+1][1]-s[i][1],s[i+1][2]-s[i][2])/dt,r=(o.rs[i]+o.rs[i+1])/2;if(r<=lo){vn.push(v);rn.push(r);}else if(r>=hi){vf.push(v);rf.push(r);}}
  if(o.rMax/o.rMin<1.1)return {ok:null,t:`${c}离太阳的距离几乎不变（轨道接近圆），看不出差别。`};if(!vn.length||!vf.length||o.span<1.9*Math.PI)return {ok:null,t:`等${c}转满一整圈再比较，再等几秒。`};
  const avg=a=>a.reduce((x,y)=>x+y,0)/a.length,n=avg(vn),f=avg(vf),ratio=n/f,exp=avg(rf)/avg(rn);
  return {ok:n>f?1:0,t:`${c}离太阳近时，每秒走约 ${Math.round(n)} 小格；离得远时，每秒约 ${Math.round(f)} 小格。近处的速度是远处的 ${ratio.toFixed(1)} 倍${n>f?' ✓':' ✗'}（按规律算，大约应是 ${exp.toFixed(1)} 倍）。`,ratio:+ratio.toFixed(2),exp:+exp.toFixed(2)};}
 if(k==='moon'){const E=B['地球'],M=B['月球'];if(!E||!M||!E.o||!M.rel)return {ok:null,t:'画面里没有同时找到“地球”和“月球”的名字标签。'};if(!isFinite(E.o.T)||!isFinite(M.rel.T))return {ok:null,t:'地球或月球几乎不动，测不出圈数。'};
  const n=E.o.T/M.rel.T;return {ok:Math.abs(n/13.37-1)<0.15?1:0,t:`地球转一圈 ${fmtT(E.o.T)}，月球绕地球转一圈 ${fmtT(M.rel.T)}：地球转一圈时月球约转 ${n.toFixed(1)} 圈。资料：365 ÷ 27.3 ≈ 13.4 圈${Math.abs(n/13.37-1)<0.15?' ✓ 对得上':' ✗ 对不上'}。`,n:+n.toFixed(1)};}
 const mv=Object.keys(B).filter(n=>B[n].o&&B[n].moving);if(!mv.length)return {ok:null,t:'画面里没有找到会动的、带名字的天体。'};
 return {ok:null,t:`中心：${an.still?'太阳（不动）':'画面中心'}。`+mv.map(n=>`${n}转一圈约 ${fmtT(B[n].o.T)}`).join('；')+'。请对照参考卡判断是否符合事实。'};}

/* ---------- review: who does what ---------- */
/* the facts a conclusion has to be checked against, shown right inside the question */
const REF4={kep3:'水星约 88 天转一圈，地球约 365 天，木星约 11.9 年，海王星约 165 年。',kep2:'同一个天体，离太阳近时走得快，离太阳远时走得慢。',moon:'月球约 27.3 天绕地球一圈，地球约 365 天绕太阳一圈：365 ÷ 27.3 ≈ 13.4 圈。'};
/* the finished log: the current one, or the last finished one while a new question is still being worked on */
const log4=s4=>{s4=s4||{};if(!s4.saved)return null;if(s4.savedQ==null||s4.savedQ===s4.q)return {q:s4.q,pred:s4.pred,res:s4.res,con:s4.con,t:(s4.meas||{}).t,m:s4.m,ref:s4.ref};const o=(s4.old||[]);return o[o.length-1]||null;};
const SORT=[['s1','提出想研究的科学问题','h'],['s2','把文字要求变成上百行代码','a'],['s3','判断动画里的科学知识对不对','h'],['s4','查权威资料，把行星颜色、轨道写进提示词','h'],
 ['s5','几秒钟内生成一个新版本','a'],['s6','决定游戏的独特规则和创意','h'],['s7','逐行解释代码在做什么','a'],['s8','得出探究结论','h']];

const QUIZ=[
 {id:'q1',q:'想让 AI 生成的太阳系动画更接近天文知识描述的场景，最好的做法是：',opts:['只写“生成太阳系动画”，让 AI 自由发挥','查询权威资料，把行星名称、颜色、轨道形状等写进提示词，再观察、调整','让 AI 连续生成很多次，挑最好看的一版'],a:1,why:'提示词越具体、越符合权威资料，AI 生成的动画越接近真实；每次生成后还要观察、判断、调整。'},
 {id:'q2',q:'关于行星的公转轨道，下面哪种说法正确？',opts:['轨道是很扁的椭圆，太阳在椭圆正中间','轨道是正圆，太阳在圆心','轨道是椭圆但非常接近圆形，太阳在椭圆的一个焦点上'],a:2,why:'八颗行星的轨道偏心率都很小（水星最大，约 0.21），太阳位于椭圆的一个焦点上。'},
 {id:'q3',q:'给 AI 输入“生成太阳围绕月球运转的动画”，最可能发生的是：',opts:['AI 可能提醒你，也可能直接照做，但最终往往按提示词生成，所以要自己求证','AI 一定会拒绝，并自动改成正确的动画','AI 生成的内容一定是对的，不需要检查'],a:0,why:'不同的 AI 反应不同，但它们最终都会按提示词生成内容。AI 是探究的助手，不是答案的来源。'},
 {id:'q4',q:'水星、地球、海王星中，哪颗行星绕太阳转一圈用的时间最短？',opts:['海王星','地球','水星'],a:2,why:'离太阳越近，公转越快：水星约 88 天，地球约 365 天，海王星约 165 年。'},
 {id:'q5',q:'教材说 AI 是学习科学知识的“望远镜”和“显微镜”，意思是：',opts:['AI 能帮我们看得更远、看得更细，但提出问题、开展探究、得出结论要靠我们自己','AI 可以代替我们完成整个科学探究','有了 AI，就不需要查阅书本和权威资料了'],a:0,why:'看何处、为何看、如何看，要由我们自己把握；需要独立思考和严谨、认真的科学探究精神。'}];

const CSS12=`
.l12-col{display:flex;flex-direction:column;gap:14px;min-width:0}
.station .stage.l12-stage{aspect-ratio:auto;height:auto;min-height:300px;scroll-margin-top:72px}
.l12-inl{display:contents}.l12-inl[hidden]{display:none}
.station .knob[hidden]{display:none}
.l12-flip{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.l12-laps{display:flex;flex-wrap:wrap;gap:6px;align-items:center;font-size:14.5px;margin-top:8px}
.l12-laps span{padding:3px 10px;border-radius:999px;background:#fff;border:1.5px solid var(--line2);font-weight:700;color:var(--ink)}
.l12-laps span b{color:var(--grape-d);font-weight:800}
.l12-laps em{font-style:normal;color:var(--muted)}
.l12-said{margin:0 0 6px;font-size:14.5px;color:var(--muted)}
.l12-said b{color:var(--ink)}
.l12-ck em{font-style:normal;font-size:12px;font-weight:800;border-radius:999px;padding:0 7px;margin-left:2px;white-space:nowrap}
.l12-ck em.new{background:var(--mint-soft);color:var(--mint-d)}
.l12-ck em.brk{background:var(--coral-soft);color:var(--coral-d)}
.l12-tip{font-weight:700;font-size:15px;color:var(--ink)}
.l12-tip small{display:block;font-weight:500;font-size:13.5px;color:var(--muted)}
.l12-refbox{margin:6px 0;padding:8px 12px;border-radius:12px;background:#fff;border:1.5px dashed var(--line2);font-size:14.5px;font-weight:500;color:var(--ink)}
.l12-mv{display:block;width:100%;text-align:left;border:1.5px solid var(--line2);background:#fff;border-radius:12px;padding:7px 10px;margin-top:6px;font-size:14.5px;color:var(--ink);cursor:pointer;line-height:1.4}
.l12-mv:hover{border-color:var(--grape)}
.l12-mv small{display:block;color:var(--muted);font-size:12.5px}
@media (min-width:881px){#l12-s3 .l12-stage{position:sticky;top:64px;align-self:start}}
.l12-stage iframe{border-radius:0!important}
.l12-stage svg{display:block;width:100%;height:auto}
.l12-wait{display:grid;place-items:center;min-height:300px;padding:20px;color:#c9d6ff;font-size:16px;text-align:center;line-height:1.7}
.l12-wait b{display:block;color:#fff;font-size:20px;font-family:var(--f-display);font-weight:800}
.l12-tagl{position:absolute;right:8px;top:8px;background:#101a3dcc;color:#fff;font-size:12px;border-radius:999px;padding:1px 10px;pointer-events:none}
.l12-lab{font-weight:700;font-size:15.5px;color:var(--ink)}
.l12-cks{display:flex;flex-direction:column;gap:7px;margin-top:8px}
.l12-ck{display:grid;grid-template-columns:24px minmax(0,1fr);gap:8px;align-items:start;font-size:15px;line-height:1.45}
.l12-ck .ic{width:24px;height:24px;border-radius:50%;display:grid;place-items:center;font-weight:900;font-size:13px;background:#fff;border:2px solid var(--line2);color:var(--muted)}
.l12-ck b{font-weight:700}
.l12-ck .t{display:block;font-size:13.5px;color:var(--muted)}
.l12-ck.ok .ic{background:var(--mint-d);border-color:var(--ink);color:#fff}
.l12-ck.bad .ic{background:var(--coral-d);border-color:var(--ink);color:#fff}
.l12-ck.bad .t{color:var(--coral-d)}
.l12-ck.na{opacity:.6}
.l12-ckg{display:grid;grid-template-columns:repeat(auto-fill,minmax(158px,1fr));gap:7px 8px;margin-top:8px}
.l12-ckg .l12-ck b{white-space:nowrap}
.l12-ckg .l12-ck{display:flex;align-items:center;gap:6px}
.l12-why{margin:8px 0 0;padding-left:20px;font-size:13.5px;line-height:1.5;color:var(--coral-d)}
.l12-man{display:flex;gap:6px;margin-top:4px;flex-wrap:wrap}
.l12-man .chip{font-size:13px;padding:2px 10px}
.l12-vers{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.l12-ver{border:2px solid var(--line2);background:#fff;color:var(--ink);border-radius:999px;padding:3px 12px;font-size:14px;cursor:pointer;font-weight:500}
.l12-ver.on{border-color:var(--ink);background:var(--sun-soft);font-weight:700}
.l12-ver b{color:var(--mint-d)}
.l12-quote{margin-top:6px;padding:8px 12px;border-radius:12px;background:#fff;border:2px solid #7d5cf055;font-size:15.5px;white-space:pre-wrap}
.l12-geo{margin-top:8px;font-size:14.5px;font-weight:500;color:var(--muted)}
.l12-geo.ok{color:var(--mint-d)}.l12-geo.bad{color:var(--coral-d)}
.l12-claims{display:flex;flex-direction:column;gap:8px}
.l12-cl{display:grid;grid-template-columns:26px minmax(0,1fr);gap:4px 10px;align-items:center;text-align:left;border:2px solid var(--line2);border-radius:14px;background:#fff;padding:9px 12px;font-size:15.5px;line-height:1.4;cursor:pointer;color:var(--ink)}
.l12-cl:hover{border-color:var(--ink)}
.l12-cl i{font-style:normal;width:24px;height:24px;border-radius:8px;border:2px solid var(--line2);display:grid;place-items:center;font-weight:900;font-size:13px;color:transparent;background:#fff}
.l12-cl.on{border-color:var(--ink);background:var(--coral-soft)}
.l12-cl.on i{background:var(--coral-d);border-color:var(--ink);color:#fff}
.l12-cl .res{grid-column:1/-1;font-size:13.5px}
.l12-cl .res.ok{color:var(--mint-d)}.l12-cl .res.no{color:var(--coral-d)}
.l12-deck{display:flex;flex-direction:column;align-items:center;gap:14px;padding:22px 18px;border-radius:20px;background:var(--sky-soft);border:1.5px solid var(--line2);text-align:center}
.l12-cardn{font-weight:700;font-size:14.5px;color:var(--muted)}
.l12-task{font-family:var(--f-display);font-weight:800;font-size:clamp(21px,3vw,28px);line-height:1.35;background:#fff;border:1.5px solid var(--line2);border-radius:18px;box-shadow:var(--pop);padding:22px 24px;max-width:540px;width:100%;color:var(--ink)}
.l12-deck .row{justify-content:center}
.l12-deck .chip.big{min-width:128px;text-align:center;font-weight:700}
.l12-sum2{display:grid;grid-template-columns:1fr 1fr;gap:12px;width:100%;text-align:left}
.l12-sum2>div{background:#fff;border:2px solid var(--line2);border-radius:14px;padding:10px 14px;font-size:15px}
.l12-sum2 b{font-family:var(--f-display);font-weight:800;font-size:17px;color:var(--sky)}
.l12-sum2 ul{margin:4px 0 0;padding-left:20px}
.l12-log{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.l12-log>div{padding:10px 12px;border-radius:12px;background:#fff;border:2px solid var(--line);font-size:14.5px;min-width:0}
.l12-log b{display:block;font-size:13px;color:var(--sky);margin-bottom:2px}
.l12-sw{display:inline-block;width:11px;height:11px;border-radius:50%;margin-right:6px;vertical-align:-1px;border:1px solid var(--line2)}
.l12-facts{margin:8px 0 6px;padding-left:20px;font-size:14px;color:var(--ink)}.l12-facts li{margin:2px 0}
.l12-flow{display:flex;flex-wrap:wrap;gap:6px;align-items:center;font-size:14px}
.l12-flow span{padding:4px 10px;border-radius:999px;border:2px solid var(--line2);background:#fff;color:var(--ink)}
.l12-flow span.h{border-color:var(--sun-d)}.l12-flow span.a{border-color:var(--sky)}.l12-flow em{color:var(--muted);font-style:normal}
.l12-units{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
.l12-units>div{padding:10px 12px;border-radius:12px;background:#fff;border:2px solid var(--line);font-size:14px}
.l12-units b{display:block;color:var(--ink)}
details.l12-more>summary{cursor:pointer;color:var(--sky);font-size:14px;font-weight:700}
.l12-ex{display:flex;flex-direction:column;gap:12px;font-size:14.5px}
.l12-ex .l12-stage,.l12-ex .l12-wait{min-height:120px}
@media (max-width:880px){.l12-units{grid-template-columns:1fr}}
@media (max-width:480px){.l12-log,.l12-sum2{grid-template-columns:1fr}.l12-task{padding:16px}}`;

/* ---------- helpers ---------- */
const ctls=new Set();function stopAll(){ctls.forEach(c=>{try{c.abort();}catch(e){}});ctls.clear();}
async function gen(prompt,{base='',onText}={}){if(!App.AI.real())return {off:1};const c=new AbortController();ctls.add(c);
 try{const r=await App.Code.generate(prompt,{base,signal:c.signal,kind:'科学动画网页',onText});if(r&&r.html)return r;return {off:1,err:r?'AI 的回答里没有找到网页代码，已改用离线示例。':''};}
 catch(e){if(e&&e.code==='cancelled')return {cancel:1};return {off:1,err:App.AI.errText(e)};}finally{ctls.delete(c);}}
const sleep=ms=>new Promise(z=>setTimeout(z,ms));
function wire(root,g,fn){$$(`[data-g="${g}"] .chip`,root).forEach(b=>b.onclick=()=>{$$(`[data-g="${g}"] .chip`,root).forEach(x=>x.classList.toggle('on',x===b));fn(+b.dataset.i);});}
let tT=0;const touchSoon=()=>{clearTimeout(tT);tT=setTimeout(App.touch,600);};
/* after a run, bring the animation back on screen (on a phone the big button sits below it; an off-screen preview is paused by the browser, so nothing could be measured) */
const seeStage=el=>{try{const r=el.getBoundingClientRect();if(r.top<56||r.bottom>innerHeight)el.scrollIntoView({block:'start',behavior:'smooth'});}catch(e){}};
const WAIT=t=>`<div class="l12-wait"><div>${t}</div></div>`;
const tagl=(el,t)=>el.insertAdjacentHTML('beforeend',`<span class="l12-tagl">${t}</span>`);
const writing=(box,head)=>o=>{const b=$('.ai-body',$(box));if(b)b.textContent=o.html?`${head}已写 ${(o.html||'').split('\n').length} 行`:'AI 正在思考……';};
/* 我的记录：几个观察题一次只出一个。items=[{k,q,opts}|{k,q,text:1,ph}]；get(k) 读记录，set(k,v) 写记录 */
function seq(root,items,get,set){if(!root)return ()=>{};const has=it=>it.text?nz(get(it.k)).length>=4:get(it.k)!=null;const first=()=>{let j=items.findIndex(it=>!has(it)&&(!it.when||it.when()));if(j<0)j=items.findIndex(it=>!has(it));return j;};let i=first();if(i<0)i=items.length-1;let tm=0;
 const draw=()=>{const it=items[i],cur=get(it.k),many=items.length>1,open=!it.when||it.when(),q=typeof it.q==='function'?it.q():it.q;
  root.innerHTML=`<div class="ask">${many?`<span class="note">第 ${i+1} / ${items.length} 个</span><br>`:''}${open?q:`<span class="note">${it.lock||'做完上面的实验，这个问题就出现'}</span>`}</div>`
   +(!open?'':it.text?`<textarea ${it.id?`id="${it.id}"`:''} maxlength="300" placeholder="${esc(it.ph||'')}" aria-label="${esc(String(q).replace(/<[^>]+>/g,''))}"></textarea>`:`<div class="opts">${it.opts.map((o,j)=>`<button type="button" class="chip ${cur===j?'on':''}" data-j="${j}">${esc(o)}</button>`).join('')}</div>`)
   +(many?`<div class="row"><button type="button" class="btn ghost sm" data-prev ${i?'':'hidden'}>上一个</button><button type="button" class="btn ghost sm" data-next ${i<items.length-1&&open&&has(it)?'':'hidden'}>下一个</button></div>`:'');
  const ta=$('textarea',root);if(ta){ta.value=cur||'';ta.oninput=()=>set(it.k,ta.value);}
  $$('.chip',root).forEach(b=>b.onclick=()=>{$$('.chip',root).forEach(x=>x.classList.toggle('on',x===b));set(it.k,+b.dataset.j);clearTimeout(tm);if(i<items.length-1)tm=setTimeout(()=>{i++;draw();},700);});
  const pv=$('[data-prev]',root),nx=$('[data-next]',root);if(pv)pv.onclick=()=>{clearTimeout(tm);i--;draw();};if(nx)nx.onclick=()=>{clearTimeout(tm);i++;draw();};};
 draw();
 /* call after a run: jumps to the first question that is open and unanswered (never while the student is typing) */
 return ()=>{if(root.contains(document.activeElement)&&document.activeElement.tagName==='TEXTAREA')return;clearTimeout(tm);const j=first();if(j>=0)i=j;draw();};}
function staticSVG(){const cx=160,cy=118,s=0.6;const ang=[30,140,250,330,200,80,300,170];
 let o=`<svg viewBox="0 0 320 236" role="img" aria-label="静态的太阳系示意图"><rect width="320" height="236" fill="#050a1a"/>`;
 DA.forEach(a=>{o+=`<circle cx="${cx}" cy="${cy}" r="${a*s}" fill="none" stroke="#ffffff2a"/>`;});
 o+=`<circle cx="${cx}" cy="${cy}" r="8" fill="#ffcc33"/><text x="${cx}" y="${cy+19}" fill="#dfe8ff" font-size="9" text-anchor="middle">太阳</text>`;
 PL.forEach((p,i)=>{const a=ang[i]*Math.PI/180,x=cx+DA[i]*s*Math.cos(a),y=cy+DA[i]*s*Math.sin(a);o+=`${p.n==='土星'?`<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${DR[i]*1.3}" ry="${DR[i]*0.5}" fill="none" stroke="#d9c58e" transform="rotate(-20 ${x.toFixed(1)} ${y.toFixed(1)})"/>`:''}<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(DR[i]*0.65).toFixed(1)}" fill="${p.hex}"/><text x="${x.toFixed(1)}" y="${(y-DR[i]*0.65-3).toFixed(1)}" fill="#dfe8ff" font-size="9" text-anchor="middle">${p.n}</text>`;});
 return o+'<text x="8" y="228" fill="#9fb0d0" font-size="9">静态示意图：大小和距离不按比例</text></svg>';}

/* ---------- render ---------- */
let S={};
L.render=function(){const v=$('#v-'+K);if(!v)return;if(!App.rec){stopAll();v.innerHTML='<div class="empty">登录后开始本讲实验。</div>';return;}if(!document.getElementById('css-l12')){const st=document.createElement('style');st.id='css-l12';st.textContent=CSS12;document.head.appendChild(st);}
 stopAll();S={v:[],cur:-1,an1:null,p3:'p1'};const lr=App.lesson(K);const w=lr.w||{},q4=Q4[(lr.s4||{}).q]?lr.s4.q:'kep3';
 v.innerHTML=`${App.hero(K,'今天你是科学动画实验室的研究员：让 AI 做动画，再用资料给它挑错。',['学会用 AI 制作网页动画，把科学知识可视化呈现。','了解 AI 对科学探究的助力作用。','培养求证 AI 生成内容的意识。'])}

 <div class="station" id="l12-s0">${App.head('WARM-UP','导入 · 让知识动起来','静图和动画','猜猜哪颗行星跑得最快，再播放动画揭晓')}
  <ol class="steps"><li>先猜一颗</li><li>播放揭晓</li></ol>
  <div class="grid2"><div class="l12-col"><div class="stage l12-stage" id="l12-w-pv">${staticSVG()}</div>
    <div class="l12-flip" id="l12-w-flip" hidden>${App.seg('wv',[['s','看静态图'],['a','看动画']],'a')}<span class="note" id="l12-w-laps"></span></div></div>
   <div class="l12-col"><div class="go-row"><span class="l12-lab">我猜最快的是</span>${App.seg('wg',[[2,'地球'],[0,'水星'],[7,'海王星'],[4,'木星']],w.b==null?'':w.b)}${App.go('l12-w-play','播放动画')}</div>
    <div id="l12-fb0"></div>
    <div class="after-run">${App.pad('只看静态图（不会动的那张），能看出谁跑得最快吗？',`<div class="opts" data-g="w-a">${['能看出来','看不出来'].map((o,i)=>`<button type="button" class="chip ${w.a===i?'on':''}" data-i="${i}">${o}</button>`).join('')}</div>`)}</div></div></div>
  ${more(App.know('AI 网页动画让抽象知识可视化','静态图只能告诉我们行星“在哪里”，动画还能告诉我们行星“怎样动”：谁快谁慢、绕着谁转、轨道是什么形状。AI 能根据我们的文字描述编写网页动画，把书本上抽象的科学知识变成看得见的过程。不过，动画是 AI 写出来的，<b>画得像不等于画得对</b>——这就是今天要研究的问题。'))}
 </div>

 <div class="station" id="l12-s1">${App.head('EXP-01','挑战一 · 呈现太阳系','科学动画实验室','给 AI 加要求，让动画通过 7 项科学核对！')}
  <ol class="steps"><li>点亮要求卡</li><li>生成，冲 7 项全过</li></ol>
  <div class="grid2"><div class="stage l12-stage" id="l12-pv1">${WAIT('<b>太阳系行星运转</b>按下大按钮，AI 开始写动画')}</div>
   <div class="l12-col">${App.knobs([['要求卡','<span id="l12-cards" style="display:contents"></span>','点亮了再生成']])}
    <p class="l12-said" id="l12-say1"></p>
    <div class="go-row">${App.go('l12-go1','生成动画')}<button class="btn ghost sm" type="button" id="l12-stop1" hidden>停止</button></div>
    ${App.aiBox('l12-ai1','AI 做完动画，程序帮你核对 7 项','AI 的动画 · 程序核对')}<div id="l12-fb1"></div>
    <div class="after-run"><div class="l12-vers" id="l12-vers"></div>${App.pad('','<div id="l12-ob1"></div>')}</div></div></div>
  ${refD()}
  ${more('<p>离线演示时，AI 用的是预置的动画网页（示意）。联网 AI 写代码约 10–40 秒，程序会在沙盒里读取行星名字标签旁边圆点的位置，量出它离太阳多远、多久转一圈；没有名字标签的项目，需要你自己核对。</p><div id="l12-mt1"><p class="note">生成后，这里显示每颗行星转一圈的测量数据。</p></div>'
   +'<details class="l12-more" id="l12-coded"><summary>看代码和改动</summary><div class="grid2"><div><div class="box-t">代码</div><div id="l12-code"></div><p class="note" id="l12-expl" aria-live="polite">点一行代码，看解释</p></div><div><div class="box-t" id="l12-dft">和上一版相比</div><div id="l12-diff"></div></div></div></details>'
   +App.know('和一位精通天文知识的“画家”合作','指导 AI 生成模拟太阳系行星运转的网页动画，就像和一位精通天文知识的画家合作：我们负责提出创意，AI 负责执行与呈现。我们还可以查询权威资料，在提示词中加入行星外观、轨道形状等描述，指导 AI 逐步生成更贴近真实太阳系的动画。在这个过程中，我们不仅要向 AI 发出指令，还要持续观察、判断并调整 AI 生成的动画，与 AI 形成有效配合。')
   +App.think(['如何设计提示词才能让 AI 生成的动画更接近天文知识描述的场景？','AI 生成的动画有助于你理解太阳系的相关知识吗？']))}
 </div>

 <div class="station" id="l12-s2">${App.head('EXP-02','挑战二 · 严谨的科学','科学验证器','故意给 AI 一个错误要求，看它会不会发现')}
  <ol class="steps"><li>给一个错误要求</li><li>再换成正确的</li></ol>
  <div class="grid2"><div class="stage l12-stage" id="l12-pv2">${WAIT('<b>谁绕着谁转？</b>AI 做的动画会在这里播放')}</div>
   <div class="l12-col">${App.knobs([['提示词',App.seg('p2',[['moon','太阳绕月球转'],['earth','太阳绕地球转'],['right','行星绕太阳转']],'moon'),'前两个是错的'],['AI 助手','<span id="l12-alt" style="display:contents"></span>','换一位试试']])}
    <div class="go-row"><span class="l12-inl" id="l12-g2"><span class="l12-lab">我猜 AI</span>${App.seg('g2',[['0','会提醒我'],['1','直接照做']],'')}</span>${App.go('l12-go2','交给 AI')}<button class="btn ghost sm" type="button" id="l12-stop2" hidden>停止</button></div>
    ${App.aiBox('l12-ai2','AI 的文字回答会出现在这里')}<div id="l12-fb2"></div>
    <div class="after-run">${App.pad('','<div id="l12-ob2"></div>')}</div></div></div>
  ${more('<p>离线演示准备了两位 AI 助手的反应（预置，示意）。联网时可以选“当前 AI”，程序会自动加上“标上中文名字”，方便测量谁绕着谁转。</p>'
   +App.know('AI 是科学探究的助手，而不是答案的来源','面对存在科学性错误的提示词，不同的 AI 可能会有不同的反应。有的会提示正确的内容并执行含有科学性错误的指令，有的则直接执行含有科学性错误的指令。但无论如何，它们最终都会按照我们给出的提示词来生成内容。因此，在使用 AI 时，我们要给出科学、严谨的提示词，确保其能正确指引 AI 的生成过程；对于 AI 生成的结果，不能盲目依赖，需要仔细求证与核对。')
   +App.think(['AI 具备判断提示词是否正确的能力吗？','我们可以完全依赖 AI 学习科学知识吗？为什么？']))}
 </div>

 <div class="station" id="l12-s3">${App.head('EXP-03','辨别练习 · 找错误挑战','找错误挑战','每段动画藏着 2 处科学错误，把它们揪出来！')}
  <ol class="steps"><li>点出 2 处错误</li><li>核对满 3 段</li></ol>
  <div class="grid2"><div class="stage l12-stage" id="l12-pv3"></div>
   <div class="l12-col">${App.knobs([['动画','<span id="l12-p3tabs" style="display:contents"></span>']])}
    <div class="l12-tip">看动画，点出说的是“科学错误”的 2 句<small>写明了“示意、不按比例”的简化，不算错误</small></div>
    <div class="l12-claims" id="l12-cl3" aria-label="哪两句说的是科学错误"></div>
    <div class="go-row">${App.go('l12-chk3','核对')}<span class="l12-lab" id="l12-n3"></span></div>
    <div id="l12-fb3"></div></div></div>
  ${refD()}
  ${more('<p>这 4 段动画是 AI 按“有问题的提示词”生成的（教学用，预置）。每段都藏着科学性错误，也有一些看起来奇怪、其实没错的地方。大小、距离不按比例（已注明）不算错误。</p>'+App.know('求证：用权威资料给 AI 的作品“挑错”','AI 生成的科学动画常常“看起来很像”，错误往往藏在细节里：顺序、快慢、方向、颜色、谁绕谁转。找错误时要有依据——对照课本和权威资料，而不是凭感觉。还要分清两种情况：<b>简化示意</b>（比如大小、距离不按比例，并已注明）不是错误；<b>违背事实</b>（比如月球不绕地球转）才是科学性错误。'))}
 </div>

 <div class="station" id="l12-s4">${App.head('EXP-04','综合运用 · 探究日志','小小探究员','先猜答案，再让动画和测量来验证')}
  <ol class="steps"><li>选问题，猜一猜</li><li>测量后写结论</li></ol>
  <div class="grid2"><div class="stage l12-stage" id="l12-pv4"></div>
   <div class="l12-col">${App.knobs([['问题',App.seg('q4',[['kep3','越远转得越慢？'],['kep2','近处走得更快？'],['moon','月球转几圈？']],q4)],['我猜','<span id="l12-pred4" style="display:contents"></span>']])}
    <div class="go-row">${App.go('l12-go4','生成并测量')}<button class="btn ghost sm" type="button" id="l12-stop4" hidden>停止</button></div>
    ${App.aiBox('l12-ai4','程序量出的结果会出现在这里','AI 的动画 · 程序测量')}<div id="l12-fb4"></div>
    <div class="after-run">${App.pad('','<div id="l12-ob4"></div>')}<div id="l12-log4"></div></div></div></div>
  ${refD()}
  ${more('<p>科学探究四步：提出问题 → 写下假设 → 用动画验证并测量 → 对照资料下结论。动画是 AI 按固定的提示词做的（离线演示用预置动画），所以下结论前要和参考卡对一对。</p>')}
 </div>

 <div class="station" id="l12-s5">${App.head('REVIEW','第四单元回顾','人做还是 AI 做','8 张任务卡分一分：该人做，还是交给 AI？')}
  <ol class="steps"><li>给 8 张卡分工</li><li>写下收获和理由</li></ol>
  <div class="l12-deck" id="l12-sort"></div>
  <div id="l12-fb5"></div>
  <div class="after-run">${App.pad('这个单元，我最大的收获是（也可以写你分工的理由）',`<textarea id="l12-gain" maxlength="300" placeholder="我发现……" aria-label="这个单元，我最大的收获"></textarea>`)}</div>
  ${more('<div class="l12-units" id="l12-units"></div><div class="l12-flow" aria-label="AI 编程的共同流程"><span class="h">人：提出想法和要求</span><em>→</em><span class="a">AI：写代码</span><em>→</em><span class="a">浏览器：运行</span><em>→</em><span class="h">人：观察、核对、判断</span><em>→</em><span class="h">人：写更具体的提示词</span><em>↺</em></div>'
   +App.know('科学探究四步与 AI 的角色','AI 的编程功能为科学探究提供了新途径：只需告诉 AI 我们的想法，它就能制作出生动的科普动画。这不仅让科学知识的学习变得更直观、更有趣，也有效提升了科研人员模拟科学原理的效率。AI 是学习科学知识的“望远镜”和“显微镜”，能帮助我们看得更远、看得更细。但是，科学探究的关键在于我们自己提出问题、开展探究并得出结论，看何处、为何看、如何看，要由我们自己把握。因此，我们需要具备独立思考的能力和严谨、认真的科学探究精神。'))}
 </div>

 <div class="station" id="l12-quiz">${App.head('QUIZ','反思与总结','小测验','5 道题，第一次作答计入能力图谱')}<div id="l12-qz"></div></div>
 <div class="station" id="l12-diary"></div>`;
 wire0(v,lr);wire1(v,lr);wire2(v,lr);wire3(v,lr);wire4(v,lr);wire5(v,lr);
 App.quiz($('#l12-qz'),K,QUIZ);
 const rd=App.diary($('#l12-diary'),K,{title:'我的科学动画',lead:'收好作品，写写收获',
  fields:[{id:'help',q:'你认为 AI 编程并生成网页动画的功能对我们学习科学知识有怎样的帮助？在这个过程中，我们需要具备什么样的意识？',ph:'帮助：……；需要具备的意识：……'},
   {id:'more',q:'除了生成游戏和动态呈现科学知识，我们还可以在哪些方面使用 AI 的编程功能？',ph:'例如：……'},
   {id:'future',q:'你觉得 AI 编程以后还会有哪些新发展？',ph:'我想……'}],
  pledge:'我会把 AI 当作探究助手：用权威资料核对 AI 做的科学动画；分享作品时注明“AI 生成，示意”。',
  extras:ex=>diaryExtras(ex)});
 App.on(()=>{if(App.current===K)rd();});
};

/* WARM-UP · 先猜后揭晓 */
function wire0(v,lr){const s=$('#l12-s0',v);const W=()=>{const l=App.lesson(K);return l.w=l.w||{};};let g=W().b;
 /* the lap counter is read from the animation itself: seconds since it started ÷ measured seconds per lap */
 const laps=an=>{const el=$('#l12-w-laps',s);if(!el||!an||an.el<2)return;const one=n=>{const b=an.B[n];if(!b||!b.o||!isFinite(b.o.T))return null;const x=an.el/b.o.T;return `${n} ${x>=10?Math.round(x):x.toFixed(1)} 圈`;};
  const t=['水星','地球','木星'].map(one).filter(Boolean);if(t.length)el.textContent=`开播 ${Math.round(an.el)} 秒：`+t.join(' · ');};
 const play=()=>{const b=$('#l12-w-pv',s);show(b,solar(FULL),{height:320,on:laps});tagl(b,'离线示例（示意）');$('#l12-w-flip',s).hidden=false;$$('[data-seg="wv"] .chip',s).forEach(x=>x.classList.toggle('on',x.dataset.v==='a'));};
 const still=()=>{$('#l12-w-pv',s).innerHTML=staticSVG();$('#l12-w-laps',s).textContent='';};
 App.segWire(s,'wv',x=>{if(x==='s')still();else play();});
 const mk=()=>{const w=W();if(w.b!=null)App.markStep(s,0);if(w.play)App.markStep(s,1);};
 const tell=()=>{const w=W();
  if(w.b==null)App.fb('#l12-fb0','find','水星跑得最快！','离太阳越近，转得越快。下次先猜一猜再揭晓。',{stars:1});
  else if(w.b===0)App.fb('#l12-fb0','ok','猜对了！水星跑得最快','水星离太阳最近，约 88 天就转一圈。看动画下面的圈数。',{stars:w.late?1:3});
  else App.fb('#l12-fb0','find',`最快的是水星，不是${PN[w.b]}`,'盯住最里面那颗，再看动画下面的圈数：离太阳越近，转得越快。',{stars:w.late?1:2});};
 App.segWire(s,'wg',x=>{g=+x;const w=W();if(w.play){if(w.b==null){w.b=g;w.late=1;App.touch();tell();mk();}}});
 $('#l12-w-play',s).onclick=()=>{const w=W();if(!w.play&&g!=null)w.b=g;w.play=1;play();App.touch();tell();mk();seeStage($('#l12-w-pv',s));$('#l12-w-play',s).classList.add('again');};
 wire(s,'w-a',i=>{W().a=i;App.touch();App.fb('#l12-fb0','find',i===1?'对，静态图看不出快慢':'静态图其实看不出快慢','点“看静态图”再瞧一眼：图只说“在哪里”，动画还说“怎样动”。可动画是 AI 画的，画得像不等于画得对。');});
 if(W().play){play();App.ran(s);}mk();}

/* EXP-01 · 挑战目标：7 项全过；彩蛋：AI 把对的改错 */
const CARDS=[{id:'N',t:'加名字',p:'给每颗行星加上名字。'},
 {id:'C',t:'规定颜色',p:'规定每颗行星的颜色：水星灰色，金星淡黄色，地球蓝色，火星红褐色，木星浅棕色，土星淡黄色并带光环，天王星淡蓝绿色，海王星深蓝色。'},
 {id:'E',t:'椭圆轨道',p:'让行星的轨道更像椭圆形，而不是正圆形。'},
 {id:'F',t:'太阳偏一边',p:'太阳在椭圆轨道的一个焦点上，不在正中间；轨道只是略扁，接近圆形。'},
 {id:'K',t:'内快外慢',p:'离太阳越近的行星转得越快，按真实公转周期的比例设置速度（地球转一圈 5 秒）。'},
 {id:'O',t:'注明示意',p:'在页面上注明：行星大小和距离没有按真实比例，是示意。'}];
const BASE1='生成模拟太阳系行星运转的动画';
function nextFlags(prev,t,first){const f=first?{}:Object.assign({},prev||{});const add=(k,re)=>{if(re.test(t))f[k]=1;};
 add('N',/名字|名称|标上|标注|写上/);add('C',/颜色|外观|光环|灰色|蓝色|红色|红褐/);add('E',/椭圆/);add('F',/焦点|偏在|不在正中/);
 add('K',/越近.{0,8}越快|越远.{0,8}越慢|内快外慢|公转周期|开普勒|转得越快|真实.{0,4}速度/);add('O',/示意|不按.{0,4}比例|没有按.{0,8}比例|不是真实比例/);add('M',/月球|月亮/);
 if(f.F)f.E=1;
 if(!first&&f.E&&!f.F&&!(prev||{}).E)f.S=1;   // the AI rewrote the orbits and broke the planet order (a regression to notice)
 if(f.F||/顺序/.test(t))delete f.S;return f;}
function regress(vs){const out=[];for(let i=1;i<vs.length;i++){const a=vs[i-1].ck,b=vs[i].ck;if(!a||!b)continue;const ks=CK.map(c=>c[0]).filter(k=>a[k]===1&&b[k]===0);if(ks.length)out.push({i,ks});}return out;}
const passN=ck=>ck?Object.values(ck).filter(x=>x===1).length:null;
function wire1(v,lr){const s=$('#l12-s1',v);const R1=()=>{const l=App.lesson(K);return l.s1=l.s1||{};};const s1=R1();const pend=new Set();
 /* rebuild versions from the record */
 (s1.v||[]).forEach((x,i,arr)=>{S.v.push({p:x.p,m:x.m,fl:x.fl!=null?fObj(x.fl):null,html:x.fl!=null?solar(fObj(x.fl)):(i===arr.length-1?(s1.html||''):''),text:'',told:1});});S.cur=S.v.length-1;
 const used=()=>new Set(CARDS.filter(c=>S.v.some(x=>String(x.p).includes(c.p.slice(0,12)))).map(c=>c.id));
 const drawCards=()=>{const u=used();$('#l12-cards',s).innerHTML=CARDS.map(c=>`<button type="button" class="chip ${u.has(c.id)?'sel':pend.has(c.id)?'on':''}" data-c="${c.id}" title="${esc(c.p)}" aria-pressed="${u.has(c.id)||pend.has(c.id)}">${u.has(c.id)?'✓ ':''}${c.t}</button>`).join('');
  $$('[data-c]',s).forEach(b=>b.onclick=()=>{const id=b.dataset.c;if(u.has(id)){App.toast('这条要求已经在动画里了');return;}if(pend.has(id))pend.delete(id);else pend.add(id);drawCards();said();});};
 /* 你要对 AI 说的话：点亮哪张卡，这里就多一句 */
 const said=()=>{const el=$('#l12-say1',s);if(!el)return;const add=CARDS.filter(c=>pend.has(c.id));
  el.innerHTML=!S.v.length?`<b>你对 AI 说：</b>${esc(BASE1)}。${add.map(c=>esc(c.p)).join('')}`:add.length?`<b>这一版再加一句：</b>${add.map(c=>esc(c.p)).join('')}`:used().size>=CARDS.length?'<b>6 张要求卡都用上了。</b>':'<b>点亮一张要求卡</b>，给 AI 再加一句要求。';};
 const recV=i=>(R1().v||[])[i];
 const marks=()=>{if(used().size)App.markStep(s,0);if((R1().v||[]).some(x=>passN(x.ck)===CK.length))App.markStep(s,1);};
 const result=()=>{const V=S.v[S.cur];return V.fl?flagCk(V.fl):check1(V.html,S.an1);};
 /* fills the checklist inside the bubble (no re-pop), stores the result, returns the number passed */
 const paint=()=>{const V=S.v[S.cur];if(!V)return 0;const R=result();const rec=recV(S.cur)||{};const man=rec.man||{};const ok=CK.filter(([k])=>ckVal(R,man,k)===1).length;
  const n=$('#l12-ckn',s),box=$('#l12-ck1',s);if(n)n.textContent=`第 ${S.cur+1} 版 · 通过 ${ok} / ${CK.length} 项`;
  const pv=S.cur>0?(recV(S.cur-1)||{}).ck:null;if(box){box.innerHTML=ckHTML(R,man,!V.fl,pv);$$('.l12-man',box).forEach(g=>$$('button',g).forEach(b=>b.onclick=()=>{const r=recV(S.cur);if(!r)return;r.man=Object.assign(r.man||{},{[g.dataset.k]:+b.dataset.v});r.ck=Object.fromEntries(CK.map(([k])=>[k,ckVal(R,r.man,k)]));App.touch();paint();drawVers();marks();}));}
  if(S.an1&&S.an1.el>=3)$('#l12-mt1',s).innerHTML=measTable(S.an1);
  if(V.fl||(S.an1&&S.an1.el>=4.5)){const r=recV(S.cur);if(r){const ck=Object.fromEntries(CK.map(([k])=>[k,ckVal(R,r.man,k)]));if(JSON.stringify(ck)!==JSON.stringify(r.ck)){r.ck=ck;touchSoon();drawVers();}}}
  return ok;};
 const tell=ok=>{const i=S.cur,vs=R1().v||[],rg=regress(vs).find(x=>x.i===i),R=result(),man=(recV(i)||{}).man||{};const prev=i>0?passN((vs[i-1]||{}).ck):null;
  const miss=CK.find(([k])=>ckVal(R,man,k)!==1&&R[k]&&R[k].s!=='-'),mt=miss?`还差「${CKS[miss[0]]}」，再点亮一张要求卡。`:'';const st=ok>=CK.length?3:ok>=4?2:1;
  if(rg)App.fb('#l12-fb1','oops','你发现 AI 的错误了！',`它改动画时，把原来对的「${rg.ks.map(k=>CKS[k]).join('、')}」改错了。每一版都要整体复查，再加要求试试。`,{stars:Math.max(2,st),cheer:true});
  else if(ok>=CK.length)App.fb('#l12-fb1','ok','7 项全过，科学动画完成！',`你用了 ${i+1} 版。要求越具体、越符合资料，动画越接近真实。`,{stars:3});
  else if(i===0)App.fb('#l12-fb1','find',`第 1 版只通过 ${ok} / ${CK.length} 项`,'看着像太阳系，细看问题不少。点亮一张要求卡，再生成。',{stars:st});
  else if(prev!=null&&ok>prev)App.fb('#l12-fb1','ok',`进步了：通过 ${ok} / ${CK.length} 项`,mt,{stars:st});
  else App.fb('#l12-fb1','try',`第 ${i+1} 版通过 ${ok} / ${CK.length} 项`,mt,{stars:st});
  marks();};
 const drawVers=()=>{const vs=R1().v||[];$('#l12-vers',s).innerHTML=S.v.length?S.v.map((x,i)=>{const n=passN((vs[i]||{}).ck);return `<button type="button" class="l12-ver ${i===S.cur?'on':''}" data-v="${i}" title="${esc(x.p)}">第 ${i+1} 版${n!=null?` <b>${n}/${CK.length}</b>`:''}</button>`;}).join('')+'<button type="button" class="btn ghost sm" id="l12-new1">重新开始</button>':'';
  $$('[data-v]',$('#l12-vers',s)).forEach(b=>b.onclick=()=>{S.cur=+b.dataset.v;view();drawVers();});
  const nw=$('#l12-new1',s);if(nw)nw.onclick=()=>{if(!nw.dataset.arm){nw.dataset.arm=1;nw.textContent='再点一次，清空全部版本';return;}
   S.v=[];S.cur=-1;S.an1=null;pend.clear();Object.assign(R1(),{v:[],html:''});App.touch();drawCards();said();drawVers();view();$('#l12-fb1',s).innerHTML='';ob1();};};
 const idle=()=>{App.aiSay('#l12-ai1','AI 做完动画，程序帮你核对 7 项',{mood:'idle'});$('#l12-ai1',s).classList.add('wait');};
 const view=()=>{const V=S.v[S.cur];const box=$('#l12-pv1',s);S.an1=null;
  if(!V){box.innerHTML=WAIT('<b>太阳系行星运转</b>按下大按钮，AI 开始写动画');idle();return 0;}
  if(!V.html)box.innerHTML=WAIT('这一版的动画没有保存，再生成一次就能看到');
  else show(box,V.html,{height:320,on:an=>{if(S.v[S.cur]!==V)return;S.an1=an;const ok=paint();if(!V.fl&&!V.told&&an.el>=4.5){V.told=1;tell(ok);}}});
  const ck=V.fl?passN(Object.fromEntries(CK.map(([k])=>[k,ckVal(flagCk(V.fl),{},k)]))):null;
  App.aiSay('#l12-ai1',`<p class="l12-said"><b>${S.cur?'这一版你加的要求：':'你对 AI 说：'}</b>${esc(cut(V.p,90))}</p><div class="big" id="l12-ckn"></div><div id="l12-ck1"></div>${V.text&&prose(V.text)?`<p class="note">AI 的说明：${esc(cut(prose(V.text),120))}</p>`:''}`,{mood:ck===CK.length?'happy':'think',src:V.m||'offline'});
  drawCode();return paint();};
 const drawCode=()=>{const d=$('#l12-coded',s);if(!d||!d.open)return;const V=S.v[S.cur];if(!V||!V.html){$('#l12-code',s).innerHTML='<p class="note">没有代码。</p>';$('#l12-diff',s).innerHTML='';return;}
  App.Code.view($('#l12-code',s),V.html,{maxHeight:300,onLine:async(i,line,lines)=>{const o=$('#l12-expl',s);o.textContent='解释中……';try{const r=await App.Code.explain(line,{context:lines.slice(Math.max(0,i-6),i+6).join('\n')});o.innerHTML=`<b>第 ${i+1} 行</b>：${esc(r.text)} <span class="note">${r.mode==='offline'?'（规则解释）':'· AI 生成'}</span>`;}catch(e){o.textContent='';}}});
  const P=S.v[S.cur-1];if(P&&P.html){const st=App.Code.stats(V.html),d0=App.Code.diff(P.html,V.html);$('#l12-dft',s).textContent=`和第 ${S.cur} 版相比：+${d0.filter(x=>x.t==='add').length} 行 / −${d0.filter(x=>x.t==='del').length} 行（共 ${st.lines} 行）`;$('#l12-diff',s).innerHTML=App.Code.diffHTML(d0);}
  else{$('#l12-dft',s).textContent='和上一版相比';$('#l12-diff',s).innerHTML='<p class="note">这是第一版（或上一版代码没有保存）。</p>';}};
 $('#l12-coded',s).addEventListener('toggle',drawCode);
 $('#l12-stop1',s).onclick=()=>stopAll();
 $('#l12-go1',s).onclick=async()=>{const btn=$('#l12-go1',s),prev=S.v[S.v.length-1],add=CARDS.filter(c=>pend.has(c.id)),real=App.AI.real();
  if(prev&&!add.length){App.fb('#l12-fb1','try','先点亮一张要求卡','没有新要求，AI 只会做出一样的动画。');return;}
  const p=prev?add.map(c=>c.p).join(''):BASE1+(add.length?'。'+add.map(c=>c.p).join(''):'');
  App.busy(btn,true,real?'AI 正在写代码…':'AI 正在写…');$('#l12-stop1',s).hidden=!real;App.aiSay('#l12-ai1','正在把你的要求变成代码……',{busy:true});
  const r=await gen(p,{base:prev&&prev.html||'',onText:writing('#l12-ai1','AI 正在写代码……')});$('#l12-stop1',s).hidden=true;
  if(r.cancel){App.busy(btn,false);App.toast('已停止');view();return;}
  let V;if(r.off){if(!real)await sleep(500);V={p,m:'offline',fl:nextFlags(prev&&prev.fl,p,!prev),text:''};V.html=solar(V.fl);if(r.err)App.toast(r.err);}
  else V={p,m:r.mode,fl:null,html:r.html,text:r.text};
  App.busy(btn,false);btn.classList.add('again');S.v.push(V);if(S.v.length>8)S.v.shift();S.cur=S.v.length-1;
  const l=App.lesson(K),x=R1();x.v=(x.v||[]).concat([{p:clip(p,300),m:V.m,fl:V.fl?fStr(V.fl):undefined,ck:null}]).slice(-8);x.html=V.fl?'':(V.html.length<=12000?V.html:'');
  x.cards=[...new Set([...(x.cards||[]),...add.map(c=>c.id)])];l.nExp=(l.nExp||0)+1;pend.clear();App.touch();
  drawCards();said();const ok=view();drawVers();ob1();seeStage($('#l12-pv1',s));
  if(V.fl){V.told=1;tell(ok);}else App.fb('#l12-fb1','find',`第 ${S.cur+1} 版做好了`,'程序正在测量画面，等几秒看核对结果。',{stars:1});marks();};
 /* 观察与发现：一次一题 */
 const two=()=>(R1().v||[]).length>=2,LOCK='再点亮一张要求卡、生成第 2 版，下一个问题就出现';
 const ob1=seq($('#l12-ob1',s),[{k:'q1',q:'AI 第一次生成的动画，是你熟悉的太阳系行星运转的样子吗？',opts:['是','部分是','不是']},
   {k:'q2',q:'AI 在调整动画时，有没有把原来正确的部分改错？',opts:['有','没有'],when:two,lock:LOCK},
   {k:'q3',q:'经过调整后，AI 生成的动画符合要求吗？',opts:['符合','基本符合','不符合'],when:two,lock:LOCK}],
  k=>(R1().ob||{})[k],(k,j)=>{const x=R1();x.ob=Object.assign(x.ob||{},{[k]:j});App.touch();if(k!=='q2')return;const rg=regress(x.v||[]);
   const rec=rg.map(y=>`第 ${y.i+1} 版把「${y.ks.map(q=>CKS[q]).join('、')}」改错了`).join('；');
   if(rg.length)App.fb('#l12-fb1',j===0?'ok':'find',j===0?'观察得准！':'再看看版本记录',`程序记录到：${rec}。`);
   else App.fb('#l12-fb1','find','程序没记录到“把对的改错”',j===0?'你看到哪里被改坏了？点上面的版本按钮，前后两版比一比。':'想亲眼看一次？加了名字以后，只点亮「椭圆轨道」再生成。');});
 drawCards();said();drawVers();if(S.v.length){view();App.ran(s);}marks();}

/* EXP-02 · 先猜后揭晓：AI 会不会发现提示词有错 */
function wire2(v,lr){const s=$('#l12-s2',v);const R2=()=>{const l=App.lesson(K);return l.s2=l.s2||{};};let key='moon',alt=null,g=null,ob2=()=>{};
 const drawAlt=()=>{const real=App.AI.real();if(alt==null||(alt==='real'&&!real))alt=real?'real':'a';
  $('#l12-alt',s).innerHTML=App.seg('alt',(real?[['real','当前 AI']]:[]).concat([['a','助手甲'],['b','助手乙']]),alt);App.segWire(s,'alt',x=>{alt=x;});
  const row=$('#l12-alt',s).closest('.knob');if(row)row.hidden=!R2().w;};   // the second helper only appears once the first wrong request has been tried
 App.segWire(s,'p2',x=>{key=x;$('#l12-g2',s).hidden=x==='right';});App.segWire(s,'g2',x=>{g=+x;});
 const marks=()=>{const x=R2();if(x.w)App.markStep(s,0);if(x.w&&x.r)App.markStep(s,1);};
 $('#l12-stop2',s).onclick=()=>stopAll();
 $('#l12-go2',s).onclick=async()=>{const btn=$('#l12-go2',s),which=key==='right'?'r':'w',p=which==='r'?RIGHT.p:W2[key].p,real=alt==='real'&&App.AI.real(),k0=key,a=alt==='b'?'b':'a';
  App.busy(btn,true,real?'AI 正在写代码…':'AI 正在想…');App.aiSay('#l12-ai2',`收到提示词：「${esc(p)}」……`,{busy:true});$('#l12-stop2',s).hidden=!real;
  let r={off:1};if(real)r=await gen(p+'（请给每个天体标上中文名字）',{onText:writing('#l12-ai2','AI 正在写代码……')});else await sleep(500);
  $('#l12-stop2',s).hidden=true;if(r.cancel){App.busy(btn,false);App.aiSay('#l12-ai2','已停止。再按一次大按钮可以重来。',{mood:'idle'});App.toast('已停止');return;}
  if(r.err)App.toast(r.err);
  const R=r.off?(which==='w'?{m:'offline',html:W2[k0].html(),text:W2[k0][a]}:{m:'offline',html:RIGHT.html(),text:RIGHT.t}):{m:r.mode,html:r.html,text:prose(r.text)};
  const off=R.m==='offline',doubt=DOUBT.test(R.text||'')?1:0;App.busy(btn,false);btn.classList.add('again');
  const l=App.lesson(K),x=R2();x[which]={p:clip(p,120),m:R.m,doubt,txt:clip(off?'':R.text,300)};
  if(which==='w'){const who=off?a:'real';x.alts=Object.assign(x.alts||{},{[who]:1});if(who==='b')x.alt=1;x.g=g;if(g!=null&&off)x.pred={g,ok:(g===0)===!!doubt?1:0};}
  l.nExp=(l.nExp||0)+1;App.touch();drawAlt();
  /* preset helpers are known, so the headline can say what happened; with a live AI the student reads the answer and the program measures the picture */
  const head=off?(which==='r'?'AI 照着正确的提示词做了':doubt?'AI 提醒了你，可还是照做了':'AI 没有质疑，直接照做了'):(which==='r'?'AI 做好了，看看对不对':'AI 的回答来了，读一读');
  App.aiSay('#l12-ai2',`<p class="l12-said"><b>你对 AI 说：</b>${esc(p)}</p><div class="big">${head}</div><div class="l12-quote">${esc(R.text||'（AI 没有写文字说明，只给了代码）')}</div><p class="l12-geo" id="l12-geo">程序正在测量谁绕着谁转……</p>`,{mood:off?(which==='r'?'happy':doubt?'think':'oops'):'think',src:R.m});
  const both=x.w&&x.r,nA=Object.keys(x.alts||{}).length,stars=both?(nA>=2?3:2):1;
  const next=!x.r?'再把提示词换成「行星绕太阳转」。':!x.w?'再给它一个错误的提示词。':nA<2?'换一位 AI 助手，看它的反应一样吗。':'错的、对的、不同的助手都试过了！';
  let told=off;
  show($('#l12-pv2',s),R.html,{height:320,on:an=>{const q=geo(an),el=$('#l12-geo',s);if(!el)return;if(off&&q.s!=='?'&&q.s!==(which==='r'?1:0))return; /* preset pages are known; ignore a noisy reading */el.className='l12-geo '+(q.s===1?'ok':q.s===0?'bad':'');el.textContent=q.t;
   if(an.el>=4){const rec=R2()[which];if(rec&&rec.geo!==q.s&&q.s!=null&&q.s!=='?'){rec.geo=q.s;touchSoon();}}
   if(told||an.el<4)return;   /* live AI: the banner follows what the program measured in this very animation */
   if(q.s==='?'){if(an.el<9)return;told=1;App.fb('#l12-fb2','find','程序量不出来，你来看','盯住画面：谁在中间不动？谁在绕圈？把看到的记在下面。',{stars});return;}
   told=1;
   if(which==='r')q.s===1?App.fb('#l12-fb2','ok','这次对了：行星绕太阳转',`提示词科学、严谨，AI 才做得对。${next}`,{stars}):App.fb('#l12-fb2','oops','要求是对的，AI 却没做对','程序量出来和事实不符。你也盯着看一看，再交给 AI 一次。',{stars,cheer:true});
   else if(q.s===0)App.fb('#l12-fb2','oops','AI 照着错的要求做了！',`画面里太阳真的在绕圈。它提醒你了吗？读读它的话，记在下面。${next}`,{stars,cheer:true});
   else App.fb('#l12-fb2','find','这位 AI 没照做，改成了对的',`它自己纠正了错误要求。不是每个 AI 都这样，结果还是要自己核对。${next}`,{stars});}});
  const gs=which==='w'&&g!=null?((g===0)===!!doubt?'你猜对了！':'和你猜的不一样。'):'';
  if(!off)App.fb('#l12-fb2','find','AI 做好了，程序正在测量','等几秒，看程序量出来谁绕着谁转。',{stars});
  else if(which==='r')App.fb('#l12-fb2','ok','这次对了：行星绕太阳转',`提示词科学、严谨，AI 才做得对。${next}`,{stars});
  else if(doubt)App.fb('#l12-fb2','find','AI 提醒了你，可还是照做了',`${gs}不管提不提醒，它最后都按提示词生成。${next}`,{stars});
  else App.fb('#l12-fb2','oops','AI 没发现错，直接照做了！',`${gs}${k0==='moon'?'太阳并不会绕月球转':'其实是地球绕太阳转'}，AI 的结果要自己求证。${next}`,{stars,cheer:true});
  marks();ob2();seeStage($('#l12-pv2',s));};
 const hasW=()=>!!R2().w,LW='先把一个错误的提示词交给 AI，这个问题就出现';
 ob2=seq($('#l12-ob2',s),[{k:'a1',q:'给出违背科学原理的提示词后，AI 发现提示词有误了吗？',opts:['发现了，提醒了我','没有发现，直接照做'],when:hasW,lock:LW},
   {k:'a2',q:'最终 AI 生成了什么样的动画？',opts:['按错误提示词生成','改成了正确的动画'],when:hasW,lock:LW},
   {k:'b',q:'换成正确的提示词后，AI 生成正确的动画了吗？',opts:['会','不会','部分正确'],when:()=>!!R2().r,lock:'把提示词换成「行星绕太阳转」再交给 AI，这个问题就出现'},
   {k:'th',text:1,id:'l12-th',q:'我们可以完全依赖 AI 学习科学知识吗？为什么？',ph:'不能完全依赖，因为……'}],
  k=>k==='th'?R2().th:(R2().ob||{})[k],(k,j)=>{const x=R2();if(k==='th'){x.th=clip(j,300);touchSoon();return;}x.ob=Object.assign(x.ob||{},{[k]:j});App.touch();const w=x.w||{},off=w.m==='offline';
   if(k==='a1'){const same=x.g!=null?((x.g===0)===(j===0)?'和你猜的一样。':'和你猜的不一样。'):'';
    if(!off){if(x.g!=null)x.pred={g:x.g,ok:(x.g===0)===(j===0)?1:0};App.fb('#l12-fb2','find',j===0?'你看到 AI 提醒了':'你看到 AI 没有提醒',`${same}不管它提不提醒，都要看它最后做出了什么。`);}
    else if((j===0)===!!w.doubt)App.fb('#l12-fb2','ok','看得准！',w.doubt?'这位助手说了“提醒/注意”，可还是照做了。':'这位助手只说“好的”，一句提醒都没有。');
    else App.fb('#l12-fb2','try','再读一遍 AI 的回答',w.doubt?'它的话里有“提醒”或“注意”。':'它只说“好的”，没有提醒你。');}
   if(k==='a2'&&(w.geo===0||w.geo===1)){if((j===0)===(w.geo===0))App.fb('#l12-fb2','ok','对，程序量出来也是这样',w.geo===0?'AI 最后还是按错误的提示词做了动画。':'这位 AI 把动画改成了正确的。');else App.fb('#l12-fb2','try','再看一眼动画','谁在中间不动？谁在绕圈？');}});
 drawAlt();marks();if(R2().w||R2().r)App.ran(s);L._alt=drawAlt;}

/* EXP-03 · 挑战目标：每段揪出 2 处错误 */
function wire3(v,lr){const s=$('#l12-s3',v);const R3=()=>{const l=App.lesson(K);return l.s3=l.s3||{};};
 const perfect=()=>ERR.filter(p=>{const x=R3()[p.id];return x&&x.done&&x.ok===p.cl.length;}).length;
 const marks=()=>{const n=ERR.filter(p=>(R3()[p.id]||{}).done).length;if(n)App.markStep(s,0);if(n>=3)App.markStep(s,1);};
 const tabs=()=>{const r=R3();$('#l12-p3tabs',s).innerHTML=App.seg('p3',ERR.map(p=>[p.id,p.t+(r[p.id]&&r[p.id].done?(r[p.id].ok===p.cl.length?' ✓':''):'')]),S.p3);App.segWire(s,'p3',x=>{S.p3=x;draw(true);});};
 const draw=pv=>{const P=ERR.find(p=>p.id===S.p3),x=R3()[P.id]||{},m=x.m||{};tabs();
  if(pv){const b=$('#l12-pv3',s);show(b,P.html(),{height:320});tagl(b,'练习用预置动画 · 藏着错误');}
  $('#l12-cl3',s).innerHTML=P.cl.map(c=>{const on=m[c.id]===1,right=on===!!c.err;return `<button type="button" class="l12-cl ${on?'on':''}" data-c="${c.id}" aria-pressed="${on}"><i>✗</i><span>${esc(c.t)}</span>${x.done?`<span class="res ${right?'ok':'no'}">${on?(c.err?'揪对了！这是科学错误：':'多点了。这句不是错误：'):(c.err?'漏掉了！这是科学错误：':'没点，对的。这句不是错误：')}${esc(c.why)}</span>`:''}</button>`;}).join('');
  $$('.l12-cl',s).forEach(b=>b.onclick=()=>{const r=R3(),y=r[P.id]=r[P.id]||{m:{}};y.m=y.m||{};y.m[b.dataset.c]=y.m[b.dataset.c]===1?0:1;y.done=0;App.touch();draw();});
  $('#l12-n3',s).textContent=`已点出 ${P.cl.filter(c=>m[c.id]===1).length} 处`;marks();};
 $('#l12-chk3',s).onclick=()=>{const P=ERR.find(p=>p.id===S.p3),r=R3(),x=r[P.id]=r[P.id]||{m:{}};x.m=x.m||{};P.cl.forEach(c=>{if(x.m[c.id]==null)x.m[c.id]=0;});
  x.done=1;x.ok=P.cl.filter(c=>(x.m[c.id]===1)===!!c.err).length;App.touch();draw();$('#l12-chk3',s).classList.add('again');
  const nE=P.cl.filter(c=>c.err).length,hit=P.cl.filter(c=>c.err&&x.m[c.id]===1).length,fa=P.cl.filter(c=>!c.err&&x.m[c.id]===1).length,pf=perfect(),stars=pf>=3?3:pf>=2?2:1;
  if(hit===nE&&!fa)App.fb('#l12-fb3','ok',`${nE} 处错误全揪出来了！`,pf>=3?`已经全对 ${pf} 段，挑战完成！`:`已经全对 ${pf} 段。换下一段动画，全对 3 段拿 3 颗星。`,{stars,cheer:true});
  else if(hit<nE)App.fb('#l12-fb3','try',`还有 ${nE-hit} 处错误没揪出来`,`${fa?'你点的句子里有的其实没错。':''}看看每句下面的讲解，再回头看动画；也可以换一段挑战。`,{stars});
  else App.fb('#l12-fb3','find','错误都找到了，可是多点了','简化示意（已注明）不算错，违背事实才是科学错误。看看讲解，再换一段。',{stars});};
 draw(true);if(ERR.some(p=>(R3()[p.id]||{}).done))App.ran(s);}

/* EXP-04 · 先猜后揭晓：假设 → 动画验证 → 结论 */
function wire4(v,lr){const s=$('#l12-s4',v);const R4=()=>{const l=App.lesson(K);return l.s4=l.s4||{};};{const x=R4();if(x.saved&&x.savedQ==null)x.savedQ=x.q;}
 let k=Q4[R4().q]?R4().q:'kep3',pred=R4().pred!=null?R4().pred:null,ob4=()=>{};
 const RES=['得到支持','没有得到支持','证据还不够'];
 const wait=()=>{$('#l12-pv4',s).innerHTML=WAIT(`<b>探究问题</b>${esc(Q4[k].q)}`);};
 const marks=()=>{const x=R4();if(pred!=null||x.pred!=null)App.markStep(s,0);if(x.saved)App.markStep(s,1);};
 const drawPred=()=>{$('#l12-pred4',s).innerHTML=App.seg('pred4',Q4[k].pred.map((t,i)=>[i,t]),pred==null?'':pred);
  App.segWire(s,'pred4',j=>{pred=+j;const y=R4();if(!y.runs||y.q===k){y.q=k;y.pred=pred;App.touch();}marks();});};
 /* choosing another question starts a new investigation; the finished log is kept (see the run handler) */
 App.segWire(s,'q4',x=>{k=x;const y=R4();pred=y.runs&&y.q===k&&y.pred!=null?y.pred:null;if(!y.runs){y.q=k;y.pred=null;App.touch();}drawPred();wait();});
 const big=(qk,m)=>qk==='kep3'?(m.ok?'越远，转一圈越久':'没有越远越久'):qk==='kep2'?`离太阳近时快得多：约是远处的 ${Math.round(m.ratio)} 倍`:`地球一圈，月球约 ${m.n} 圈`;
 /* what the program measured in this animation, planet by planet */
 const lapRow=an=>{const ms=measured(an).filter(p=>isFinite(an.B[p.n].o.T)).sort((a,b)=>an.B[a.n].o.rMean-an.B[b.n].o.rMean);if(ms.length<3)return '';
  return `<div class="l12-laps"><em>由内到外，转一圈要：</em>${ms.map(p=>`<span>${p.n} <b>${fmtT(an.B[p.n].o.T)}</b></span>`).join('<em>→</em>')}</div>`;};
 const one=(o,cur)=>{const P=Q4[o.q];return `<div class="l12-log"><div><b>01 问题</b>${esc((P||{}).q||'')}</div><div><b>02 假设</b>${P&&o.pred!=null?`我猜：${esc(P.pred[o.pred])}。`:'（没有先猜）'}</div><div><b>03 动画验证</b>${esc(o.t||'已生成动画')}${cur?`<br><span class="note">动画来源：${esc(srcOf(o.m))}</span>`:''}</div><div><b>04 结论</b>假设${RES[o.res]||''}。${esc(o.con||'')}${cur?`<br><span class="note">${o.ref?'已对照资料核对':'还没有对照资料核对'}</span>`:''}</div></div>`;};
 const drawLog=()=>{const x=R4(),box=$('#l12-log4',s),cur=x.saved&&x.savedQ===x.q?log4(x):null,old=x.old||[];
  box.innerHTML=(cur?`<div class="box-t">我的探究日志</div>${one(cur,1)}<p class="note">还想探究？在上面换一个问题，再猜、再测。</p>`:'')+old.map((o,i)=>`<div class="box-t">之前的日志 ${i+1}</div>${one(o,0)}`).join('');};
 $('#l12-stop4',s).onclick=()=>stopAll();
 $('#l12-go4',s).onclick=async()=>{const btn=$('#l12-go4',s),qk=k,Q=Q4[qk],real=App.AI.real();
  App.busy(btn,true,real?'AI 正在写代码…':'AI 正在写…');App.aiSay('#l12-ai4','正在做验证动画……',{busy:true});$('#l12-stop4',s).hidden=!real;
  const r=await gen(Q.p+(real?'（请给每个天体标上中文名字）':''),{onText:writing('#l12-ai4','AI 正在写代码……')});$('#l12-stop4',s).hidden=true;
  if(r.cancel){App.busy(btn,false);App.aiSay('#l12-ai4','已停止。再按一次大按钮可以重来。',{mood:'idle'});App.toast('已停止');return;}
  if(r.off){if(!real)await sleep(500);if(r.err)App.toast(r.err);}
  const R={m:r.off?'offline':r.mode,html:r.off?Q.html():r.html},off=R.m==='offline';App.busy(btn,false);btn.classList.add('again');
  const l=App.lesson(K),x=R4();
  if(x.runs&&x.q!==qk){ /* a new question: file the finished log, start a clean one */
   if(x.saved&&x.savedQ===x.q){x.old=(x.old||[]).concat([{q:x.q,pred:x.pred,res:x.res,con:x.con,t:(x.meas||{}).t}]).slice(-2);if(x.ref)x.refOld=1;}
   ['res','con','ref','refj','meas'].forEach(f=>delete x[f]);}
  x.q=qk;x.pred=pred;x.runs=(x.runs||0)+1;x.m=R.m;x.p=clip(Q.p,300);l.nExp=(l.nExp||0)+1;App.touch();const guessed=x.pred!=null;drawLog();ob4();
  const body=(b,t,row)=>`<p class="l12-said"><b>探究问题：</b>${esc(Q.q)}</p><div class="big" id="l12-m4b">${b}</div>${row||''}<p id="l12-m4">${esc(t)}</p>`;
  const secs=qk==='kep2'?'等它转满一圈（十几秒）':'大约 5 秒';
  App.aiSay('#l12-ai4',body('正在测量……',`盯住画面，${secs}出结果。`),{mood:'think',src:R.m});
  App.fb('#l12-fb4','find','动画做好了，正在测量',`程序在读每个天体的位置，${secs}出结果。`,{stars:1});seeStage($('#l12-pv4',s));
  let told=0;show($('#l12-pv4',s),R.html,{height:320,on:an=>{const m=meas4(qk,an);if(!m||!$('#l12-m4',s))return;if(off&&m.ok===0)return; /* preset pages are known to be right; a ✗ here is a noisy reading */const t=`程序测量（${Math.min(15,an.el).toFixed(0)} 秒）：${m.t}`,b=m.ok==null?'还在测量……':big(qk,m),row=qk==='kep3'?lapRow(an):'';
   if(!told&&m.ok!=null&&an.el>=5){told=1;App.aiSay('#l12-ai4',body(b,t,row),{mood:m.ok===1?'happy':'oops',src:R.m});const y=R4(),P=Q4[qk];
    if(m.ok===0)App.fb('#l12-fb4','oops','这段动画和资料对不上','可能是 AI 做错了，也可能是程序没量准。你也盯着看一看；它不能当证据，再生成一次。',{stars:guessed?2:1});
    else if(!guessed)App.fb('#l12-fb4','find','测量出来了！',`${b}。下次先猜再测；现在在下面写结论。`,{stars:1});
    else if(y.pred===P.pa)App.fb('#l12-fb4','ok','猜对了！测量支持你的假设',`${b}。动画是 AI 做的，在下面和资料对一对，再写结论。`,{stars:2});
    else App.fb('#l12-fb4','find','测量结果和你猜的不一样',`${b}。科学家也常常猜错，证据说了算。在下面写结论。`,{stars:2});}
   else if(told&&m.ok!=null){$('#l12-m4b',s).textContent=b;$('#l12-m4',s).textContent=t;}
   else if(!told){$('#l12-m4',s).textContent=t;}
   if(an.el>=5){const y=R4(),ms=Object.assign({k:qk,ok:m.ok},m.ratio!=null?{ratio:m.ratio,exp:m.exp}:{},m.n!=null?{n:m.n}:{},m.tot?{agree:m.agree,tot:m.tot}:{},{t:clip(m.t,200)});if(JSON.stringify(ms)!==JSON.stringify(y.meas)){y.meas=ms;touchSoon();}}}});};
 ob4=seq($('#l12-ob4',s),[{k:'res',q:'测量结果支持你的假设吗？',opts:['得到支持','没有得到支持','证据还不够']},
   {k:'ref',q:()=>`动画是 AI 做的，和资料对一对：<div class="l12-refbox">资料：${REF4[R4().q]||REF4.kep3}</div>动画量出来的，和资料一致吗？`,opts:['一致','不一致','还没对']},
   {k:'con',text:1,id:'l12-con',q:'写下你的结论和依据',ph:'结论……；依据……'}],
  kk=>{const x=R4();return kk==='ref'?(x.refj!=null?x.refj:x.ref==null?null:(x.ref?0:2)):x[kk];},
  (kk,j)=>{const x=R4();if(kk==='ref'){x.refj=j;x.ref=j<2?1:0;}else if(kk==='con')x.con=clip(j,300);else x.res=j;
   if(x.runs&&x.res!=null&&nz(x.con).length>=6&&x.savedQ!==x.q){x.saved=Date.now();x.savedQ=x.q;App.touch();App.fb('#l12-fb4','ok','探究日志写好了！','问题、假设、验证、结论，四步都齐了。换个问题还能再探究。',{stars:x.pred!=null?3:2});marks();}
   else if(kk==='con')touchSoon();else{App.touch();if(kk==='ref'&&j===2)App.fb('#l12-fb4','try','先和资料对一对','动画是 AI 做的。对过资料，结论才站得住。');}drawLog();});
 drawPred();wait();drawLog();marks();if(R4().runs)App.ran(s);}

/* REVIEW · 人机分工翻牌 */
function wire5(v,lr){const s=$('#l12-s5',v);const RV=()=>{const l=App.lesson(K);return l.rv=l.rv||{};};
 /* 分工是看法题：不判对错，只和教材的想法比一比（rv.ok = 和教材一致的张数，仍然写进记录） */
 const WHY={h:'教材的想法：这件事要人来做，人是设计师和探究者。',a:'教材的想法：这是 AI 擅长的事，不过结果还要人来检查。'};let at=null;
 const units=()=>{const r=App.rec,el=$('#l12-units',s);if(!el)return;el.innerHTML=[['l10','第10讲 网页工坊','一句话生成网页'],['l11','第11讲 游戏工坊','规则变代码'],['l12','第12讲 科学动画实验室','动画 + 求证']].map(([k,n,d])=>{const p=r?Math.round(App.progress(k,r)*100):0;let w=[];try{const LL=App.lessons[k];if(LL&&LL.works&&r)w=LL.works((r.lessons||{})[k]||{})||[];}catch(e){}
  return `<div><b>${n}</b><span class="note">完成 ${p}%</span><p>${d}</p>${w.length?`<p class="note">我的作品：${w.slice(0,2).map(x=>esc(x.t)).join('；')}</p>`:''}</div>`;}).join('');};
 const wrote=()=>nz(RV().gain).length>=8;
 const marks=()=>{const rv=RV();if(rv.done)App.markStep(s,0);if(wrote())App.markStep(s,1);};
 const tally=()=>{const rv=RV(),a=rv.a||{};rv.ok=SORT.filter(([d,,an])=>a[d]===an).length;return rv.ok;};
 const finish=()=>{const same=tally();App.fb('#l12-fb5','find',`8 张分完：${same} 张和教材想的一样`,same<SORT.length?'想法不同没有对错。点一张卡可以改主意；也可以在下面写写你的理由。':'人提出问题、判断对错、下结论；AI 写代码、很快做出新版本。',{stars:wrote()?3:2});};
 const deck=()=>{const rv=RV(),a=rv.a||{},box=$('#l12-sort',s);let i=at!=null?at:SORT.findIndex(x=>!a[x[0]]);
  if(i<0){if(!rv.done){rv.done=1;tally();App.touch();}
   const col=(w,t)=>`<div><b>${t}</b>${SORT.filter(x=>a[x[0]]===w).map(x=>`<button type="button" class="l12-mv" data-mv="${x[0]}">${esc(x[1])}${x[2]===w?'':'<small>教材把它放在另一边。你的理由呢？</small>'}</button>`).join('')||'<p class="note">这边还没有卡</p>'}</div>`;
   box.innerHTML=`<span class="l12-cardn">8 张分完 · ${rv.ok} 张和教材想的一样 · 点一张卡，可以把它挪到另一边</span><div class="l12-sum2">${col('h','我让人来做')}${col('a','我交给 AI')}</div><div class="row"><button type="button" class="btn ghost sm" data-back>一张一张再看</button><button type="button" class="btn ghost sm" data-redo>重新分一次</button></div>`;
   $$('[data-mv]',box).forEach(b=>b.onclick=()=>{const r=RV(),id=b.dataset.mv,c=SORT.find(x=>x[0]===id);r.a[id]=r.a[id]==='h'?'a':'h';tally();App.touch();deck();
    App.fb('#l12-fb5','find',r.a[id]===c[2]?'挪好了：和教材想的一样':'挪好了：和教材想的不一样',`「${esc(c[1])}」${WHY[c[2]]}`);});
   $('[data-back]',box).onclick=()=>{at=0;deck();};
   $('[data-redo]',box).onclick=()=>{const r=RV();r.a={};at=null;App.touch();deck();$('#l12-fb5',s).innerHTML='';};return;}
  const cur=a[SORT[i][0]],all=SORT.every(x=>a[x[0]]);
  box.innerHTML=`<span class="l12-cardn">第 ${i+1} / ${SORT.length} 张 · 你觉得这件事该谁来做？</span><div class="l12-task">${esc(SORT[i][1])}</div><div class="row"><button type="button" class="chip big ${cur==='h'?'on':''}" data-v="h">人来做</button><button type="button" class="chip big ${cur==='a'?'on':''}" data-v="a">AI 来做</button></div>
   <div class="row"><button type="button" class="btn ghost sm" data-prev ${i?'':'hidden'}>上一张</button><button type="button" class="btn ghost sm" data-next ${cur?'':'hidden'}>${i<SORT.length-1?'下一张':'看分工结果'}</button></div>`;
  const go=j=>{at=j<SORT.length?j:null;if(at==null&&!SORT.every(x=>(RV().a||{})[x[0]]))at=SORT.findIndex(x=>!(RV().a||{})[x[0]]);deck();if(at==null&&RV().done)finish();};
  $('[data-prev]',box).onclick=()=>go(i-1);$('[data-next]',box).onclick=()=>go(i+1);
  $$('[data-v]',box).forEach(b=>b.onclick=()=>{const [id,t,ans]=SORT[i],r=RV(),first=!(r.a||{})[id];r.a=Object.assign(r.a||{},{[id]:b.dataset.v});const same=b.dataset.v===ans;if(r.done)tally();App.touch();
   if(first&&!all){at=null;const more=SORT.some(x=>!r.a[x[0]]);deck();if(!more)finish();else App.fb('#l12-fb5',same?'ok':'find',same?'和教材想的一样':'你和教材想的不一样',`「${esc(t)}」${WHY[ans]}${same?'':'有自己的理由也可以，没有对错。'}`);}
   else{deck();App.fb('#l12-fb5',same?'ok':'find',same?'和教材想的一样':'你和教材想的不一样',`「${esc(t)}」${WHY[ans]}${same?'':'有自己的理由也可以，没有对错。'}`);}
   marks();});};
 const g=$('#l12-gain',s);g.value=RV().gain||'';g.oninput=()=>{const rv=RV(),was=wrote();rv.gain=clip(g.value,300);marks();touchSoon();
  if(!was&&wrote()&&rv.done)App.fb('#l12-fb5','ok','分工想清楚了，收获也写下了！','人提出问题、判断对错、下结论；AI 写代码、很快做出新版本。',{stars:3});};
 units();deck();marks();if(Object.keys(RV().a||{}).length)App.ran(s);L._units=units;}

/* diary extras */
function finalHTML(lr){const s1=lr.s1||{},vs=s1.v||[];const last=vs[vs.length-1];if(!last)return null;return last.fl!=null?solar(fObj(last.fl)):(s1.html||null);}
function diaryExtras(ex){const lr=App.lesson(K);const s1=lr.s1||{},vs=s1.v||[],last=vs[vs.length-1],s4=lr.s4||{},s3=lr.s3||{};const html=finalHTML(lr);const pass=last?passN(last.ck):null;const g4=log4(s4);
 const d3=ERR.filter(p=>(s3[p.id]||{}).done);
 ex.innerHTML=`<div class="l12-ex"><div><div class="box-t">我的科学动画</div>${html?`<div class="stage l12-stage"><div class="l12-wait"><button class="btn ghost sm" type="button" data-play>播放我的科学动画</button></div></div><p class="note">第 ${vs.length} 版 · AI 生成 · 来源：${esc(srcOf(last.m))}${pass!=null?`；通过科学核对 ${pass}/${CK.length} 项`:''}。最后的要求：${esc(cut(last.p,60))}</p>`:'<p class="note">还没有生成科学动画。</p>'}</div>
  <div><div class="box-t">探究日志</div>${g4?`<p>问题：${esc((Q4[g4.q]||{}).q||'')}<br>结论：假设${['得到支持','没有得到支持','证据还不够'][g4.res]||''}。${esc(cut(g4.con,80))}</p>`:'<p class="note">还没有写入探究日志。</p>'}</div>
  <div><div class="box-t">求证记录</div><p>${(lr.s2||{}).w?`错误提示词实验：AI ${(lr.s2.w.doubt?'提出了提醒':'没有提出质疑')}。`:'还没有做错误提示词实验。'}${d3.length?` 找错误挑战：完成 ${d3.length} 段，判断正确 ${d3.reduce((a,p)=>a+(s3[p.id].ok||0),0)}/${d3.reduce((a,p)=>a+p.cl.length,0)} 条。`:''}</p></div></div>`;
 const pb=$('[data-play]',ex);if(pb)pb.onclick=()=>show($('.l12-stage',ex),html,{height:200});}

L.onShow=()=>{if(L._alt)L._alt();if(L._units)L._units();};
L.onHide=()=>{stopAll();};
window.addEventListener('ai-mode',()=>{if(L._alt)L._alt();});
/* ---------- hooks ---------- */
function s3stats(s3){s3=s3||{};let n=0,ok=0,done=0;const miss={},fa={};ERR.forEach(p=>{const x=s3[p.id];if(!x||!x.done)return;done++;p.cl.forEach(c=>{n++;const m=(x.m||{})[c.id];if((m===1)===!!c.err)ok++;else if(c.err)miss[p.id+c.id]=1;else fa[p.id+c.id]=1;});});return {n,ok,done,miss,fa};}
function lastCk(lr){const vs=((lr.s1||{}).v)||[];const l=vs[vs.length-1];return l&&l.ck?l.ck:null;}
L.score=lr=>{const Q=lr.quiz||{},qs=id=>Q[id]?(Q[id].ok?100:0):0,tx=App.txtScore,D=lr.diary||{},w=lr.w||{},s1=lr.s1||{},s2=lr.s2||{},s4=lr.s4||{},rv=lr.rv||{};
 const vs=s1.v||[],ck=lastCk(lr),pass=ck?Object.values(ck).filter(x=>x===1).length:0,cards=s1.cards||[],ob=s1.ob||{},ob2=s2.ob||{},st=s3stats(lr.s3);
 const rg=regress(vs).length>0;const obsOk=ob.q2!=null?((ob.q2===0)===rg?1:0.5):0;const ra=rv.a||{};const hum=SORT.filter(x=>x[2]==='h');
 return {principle:(w.b===0?15:w.b!=null?5:0)+(w.a!=null?5:0)+0.15*(qs('q2')+qs('q4')+qs('q5'))+(rv.done?25*(rv.ok||0)/SORT.length:0)+((s4.meas||{}).ok===1&&s4.res===0?10:s4.saved?5:0),
  experiment:30*Math.min(1,vs.length/3)+(s2.w?10:0)+(s2.r?10:0)+(s4.runs?20:0)+(s4.meas?10:0)+10*['q1','q2','q3'].filter(k=>ob[k]!=null).length/3+10*['a1','a2','b'].filter(k=>ob2[k]!=null).length/3,
  prompt:40*Math.min(1,cards.length/5)+0.2*tx(vs.slice(1).map(x=>x.p).join(''),60)+25*pass/CK.length+0.15*qs('q1'),
  critical:(st.n?35*st.ok/st.n:0)+(ob2.a1!=null?10:0)+15*obsOk+(s4.ref||s4.refOld?15:0)+0.15*qs('q3')+0.1*tx(s2.th,25),
  creative:30*pass/CK.length+(s4.pred!=null?15:0.15*tx(s4.hyp,15))+0.25*tx((log4(s4)||s4).con,30)+(s4.q==='custom'&&nz(s4.qt).length>=4?10:0.1*tx(rv.gain,20))+0.2*tx(D.more,30),
  ethics:(D.pledge?25:0)+(cards.includes('O')||(ck&&ck.note===1)?20:0)+(rv.done?25*hum.filter(x=>ra[x[0]]==='h').length/hum.length:0)+0.15*tx(s2.th,25)+0.15*tx(D.help,30)};};
L.progress=lr=>{const s1=lr.s1||{},s2=lr.s2||{},s4=lr.s4||{},ob=s1.ob||{},ob2=s2.ob||{};const st=s3stats(lr.s3);
 const m=[(lr.w||{}).b!=null,(s1.v||[]).length>=2,['q1','q2','q3'].every(k=>ob[k]!=null),!!(s2.w&&s2.r),['a1','b'].every(k=>ob2[k]!=null),st.done>=3,!!s4.saved,!!(lr.rv||{}).done,Object.keys(lr.quiz||{}).length>=5,!!(lr.diary||{}).submitted];
 return m.filter(Boolean).length/m.length;};
L.quiz=QUIZ;
L.flow=[
 {seg:'导入',from:'l12-s0'},
 {seg:'挑战一',kp:'知识点一 · 科学动画与严谨的提示词',learn:['AI 写代码，让科学知识“动”起来、更直观','先查权威资料：行星外观、顺序、内快外慢','轨道是接近圆的椭圆，太阳在一个焦点上'],sum:['第 1 版看着像，细看没名字、颜色乱、正圆','AI 可能把对的改错，每一版都要整体复查','写进查到的事实后，测量与参考卡基本一致'],from:'l12-s1',to:'l12-s1'},
 {seg:'挑战二',kp:'知识点二 · AI 是探究助手，不是答案来源',learn:['判断 AI 之前，先弄清日、地、月谁绕谁转','AI 可能提醒或照做，最终都按提示词生成','求证：对照资料，分辨违背事实与简化示意'],sum:['错误提示词下，AI 最终仍按提示词生成','正确提示词下，生成以太阳为中心的动画','违背事实才是错误，太阳偏在一边是对的'],from:'l12-s2',to:'l12-s3'},
 {seg:'综合运用',from:'l12-s4'},
 {seg:'反思与总结',from:'l12-s5'}
];
L.diaryTitle='我的科学动画';
L.diaryQ=[['help','AI 动画对学科学的帮助与需要的意识'],['more','AI 编程还能用在哪里'],['future','AI 编程的新发展']];
L.works=lr=>{const o=[];const s1=lr.s1||{},vs=s1.v||[],last=vs[vs.length-1],ck=lastCk(lr);
 if(last)o.push({t:'我的科学动画 · 太阳系',s:`${vs.length} 个版本${ck?`，科学核对通过 ${Object.values(ck).filter(x=>x===1).length}/${CK.length} 项`:''}｜${cut(last.p,40)}`,glyph:'星'});
 const g4=log4(lr.s4);if(g4)o.push({t:'探究日志',s:`${cut((Q4[g4.q]||{}).q||'',30)} → 假设${['得到支持','没有得到支持','证据还不够'][g4.res]||''}`,glyph:'探'});
 return o;};
L.expCount=lr=>lr.nExp||0;
L.classPanels=recs=>{const R=recs.map(r=>(r.lessons||{})[K]||{}).filter(l=>Object.keys(l).length);if(!R.length)return '';
 const bar=(n,v,tot,col,lab)=>`<div class="hbar"><span>${n}</span><span class="tr"><i style="width:${tot?100*v/tot:0}%;background:${col}"></i></span><span>${lab!=null?lab:v}</span></div>`;
 const cks=R.map(lastCk).filter(Boolean);const vs=R.map(l=>((l.s1||{}).v||[]).length).filter(n=>n>0);const avgV=vs.length?(vs.reduce((a,b)=>a+b,0)/vs.length).toFixed(1):'—';
 const rg=R.filter(l=>regress((l.s1||{}).v||[]).length).length;
 const w=R.map(l=>(l.s2||{}).w).filter(Boolean),wd=w.filter(x=>x.doubt).length;const o1=R.map(l=>((l.s2||{}).ob||{}).a1).filter(x=>x!=null);
 const st=R.map(l=>s3stats(l.s3));const done=st.filter(x=>x.done).length;
 const errs=ERR.flatMap(p=>p.cl.filter(c=>c.err).map(c=>({k:p.id+c.id,t:c.t,n:R.filter(l=>((l.s3||{})[p.id]||{}).done).length})));const fas=ERR.flatMap(p=>p.cl.filter(c=>!c.err).map(c=>({k:p.id+c.id,t:c.t,n:R.filter(l=>((l.s3||{})[p.id]||{}).done).length})));
 errs.forEach(e=>{e.miss=st.filter(x=>x.miss[e.k]).length;});fas.forEach(e=>{e.fa=st.filter(x=>x.fa[e.k]).length;});
 const s4=R.map(l=>l.s4||{}).filter(x=>x.saved);
 return `<div class="box"><div class="box-t">第12讲 · 太阳系动画：最后一版的科学核对（${cks.length} 人）</div>
   ${CK.map(([k,t])=>bar(t.replace(/（.*$/,''),cks.filter(c=>c[k]===1).length,cks.length,'var(--green)',cks.length?Math.round(100*cks.filter(c=>c[k]===1).length/cks.length)+'%':'—')).join('')}
   <p class="note" style="margin-top:6px">人均 ${avgV} 个版本；${rg} 人的动画在修改中出现过“把对的改错”（教材观察题 2）。</p></div>
  <div class="box"><div class="box-t">第12讲 · 严谨的科学与找错误</div>
   ${bar('错误提示词：AI 提出了提醒',wd,w.length,'var(--amber)',`${wd}/${w.length}`)}${bar('学生判断“AI 发现了错误”',o1.filter(x=>x===0).length,o1.length,'var(--violet)',`${o1.filter(x=>x===0).length}/${o1.length}`)}
   <b style="font-size:13px">找错误挑战：各处科学性错误被漏掉的比例（${done} 人完成）</b>${errs.filter(e=>e.n).sort((a,b)=>b.miss/b.n-a.miss/a.n).slice(0,5).map(e=>bar(e.t,e.miss,e.n,'var(--red)',Math.round(100*e.miss/e.n)+'%')).join('')||'<p class="note">还没有人核对。</p>'}
   <b style="font-size:13px">把“没问题”误判成错误最多的</b>${fas.filter(e=>e.n&&e.fa).sort((a,b)=>b.fa/b.n-a.fa/a.n).slice(0,2).map(e=>bar(e.t,e.fa,e.n,'var(--amber)',Math.round(100*e.fa/e.n)+'%')).join('')||'<p class="note">暂无。</p>'}
   <p class="note" style="margin-top:6px">探究日志：${s4.length} 人写入，其中 ${s4.filter(x=>x.ref).length} 人对照了权威资料。</p></div>`;};
L.classSug=recs=>{const R=recs.map(r=>(r.lessons||{})[K]||{}).filter(l=>Object.keys(l).length);if(!R.length)return [];const out=[];const st=R.map(l=>s3stats(l.s3));
 const fc=ERR[3].cl[2],n4=R.filter(l=>((l.s3||{}).p4||{}).done).length,fa4=st.filter(x=>x.fa['p4c']).length;
 if(n4>=4&&fa4/n4>=0.3)out.push(`第12讲找错误挑战中，${fa4}/${n4} 名学生把“${fc.t}”判成了错误：用一根绳子和两枚图钉现场画椭圆，说明太阳在焦点上、行星轨道接近圆形，再回看动画 4。`);
 const cks=R.map(lastCk).filter(Boolean);const spd=cks.filter(c=>c.spd===1).length;
 if(cks.length>=4&&spd/cks.length<0.6)out.push(`只有 ${spd}/${cks.length} 名学生的太阳系动画最后做到了“越靠内转得越快”：请学生打开参考卡读公转周期，示范把“按真实公转周期的比例设置速度”写进提示词，再看测量表里的周期比。`);
 const s4=R.map(l=>l.s4||{}).filter(x=>x.saved);if(out.length<2&&s4.length>=4&&s4.filter(x=>!x.ref).length/s4.length>=0.3)out.push(`${s4.filter(x=>!x.ref).length} 名学生的探究结论只依据 AI 动画、没有对照权威资料：投影一份探究日志，追问“动画是谁做的？你怎么确定它是对的？”`);
 const w=R.map(l=>(l.s2||{}).w).filter(Boolean);if(out.length<2&&w.length>=4)out.push(`错误提示词实验中，${w.filter(x=>x.doubt).length}/${w.length} 次 AI 提出了提醒，其余直接照做：请两种结果的学生各展示一次，强调“无论哪种，AI 最终都按提示词生成”。`);
 return out.slice(0,2);};
L.demo=(rnd,t)=>{const p=x=>rnd()<x;const pk=a=>a[Math.floor(rnd()*a.length)];const lr={};let n=0;
 lr.w={play:1,a:p(.8)?1:0,b:p(.5+t*.45)?0:pk([2,4,7])};
 const s1={cards:[],v:[]};let fl={};const steps=[['生成模拟太阳系行星运转的动画',''],['给每颗行星加上名字。','N'],['规定每颗行星的颜色。','C'],['让行星的轨道更像椭圆形，而不是正圆形。','E'],['太阳在椭圆轨道的一个焦点上。','F'],['离太阳越近的行星转得越快，按真实公转周期的比例。','K'],['注明示意。','O']];
 const nv=1+Math.floor(rnd()*4*t+t*3+rnd()*1.2);
 for(let i=0;i<Math.min(nv,steps.length);i++){const [pp,c]=steps[i];fl=nextFlags(fl,pp,i===0);if(c&&!s1.cards.includes(c))s1.cards.push(c);
  const R=flagCk(fl),ck=Object.fromEntries(CK.map(([k])=>[k,ckVal(R,{},k)]));s1.v.push({p:pp,m:'offline',fl:fStr(fl),ck});n++;}
 s1.ob={};if(p(.4+t*.6)){s1.ob={q1:pk([1,1,2,0]),q2:regress(s1.v).length?(p(.4+t*.5)?0:1):(p(.7)?1:0),q3:p(t)?0:1};}if(p(t))s1.th='提示词里要写清楚行星的名字、颜色、轨道形状和快慢，还要先查权威资料。';lr.s1=s1;
 const s2={};if(p(.4+t*.55)){s2.w={p:W2.moon.p,m:'offline',doubt:p(.5)?1:0,txt:'',geo:0};s2.alts=s2.w.doubt?{b:1}:{a:1};n++;if(p(.3+t*.6)){s2.r={p:RIGHT.p,m:'offline',doubt:0,txt:'',geo:1};n++;}
  s2.ob=p(.3+t*.6)?{a1:s2.w.doubt?(p(.8)?0:1):(p(.8)?1:0),a2:0,b:s2.r?0:2}:{};if(p(t))s2.dt='第一次 AI 照着错误要求做了；第二次是正确的太阳系。';if(p(t))s2.th='不能完全依赖，AI 会照着错误的提示词做，要查权威资料核对。';}lr.s2=s2;
 const s3={};const nd=Math.floor(rnd()*4.5*t+rnd()*0.8);ERR.slice(0,Math.min(4,nd)).forEach(P=>{const m={};P.cl.forEach(c=>{const right=p(.45+t*.5-(P.id==='p4'&&c.id==='c'?0.25:0));m[c.id]=right?(c.err?1:0):(c.err?0:1);});s3[P.id]={m,done:1,ok:P.cl.filter(c=>(m[c.id]===1)===!!c.err).length};});lr.s3=s3;
 const s4={};if(p(.3+t*.6)){s4.q=pk(['kep3','kep3','kep2','moon']);s4.pred=p(.5+t*.4)?Q4[s4.q].pa:(Q4[s4.q].pa+1)%Q4[s4.q].pred.length;s4.runs=1;s4.m='offline';n++;
  s4.meas={k:s4.q,ok:1,t:'示例测量'};if(p(.4+t*.5)){s4.res=s4.pred===Q4[s4.q].pa?0:1;s4.con=p(t)?'测量显示由内到外转一圈的时间越来越长，和参考卡一致。':'和我想的一样。';s4.ref=p(.35+t*.6)?1:0;s4.saved=1;}}lr.s4=s4;
 lr.rv={};if(p(.3+t*.6)){lr.rv.a=Object.fromEntries(SORT.map(([id,,ans])=>[id,p(.55+t*.4)?ans:(ans==='h'?'a':'h')]));lr.rv.done=1;lr.rv.ok=SORT.filter(([id,,ans])=>lr.rv.a[id]===ans).length;if(p(t))lr.rv.gain='从网页、游戏到科学动画，我学会了把想法说清楚，再检查 AI 做得对不对。';}
 const q=(id,pp)=>{const ok=p(pp);const a=QUIZ.find(x=>x.id===id).a;return {first:ok?a:(a+1)%3,ok,last:a};};
 if(p(.3+t*.65))lr.quiz={q1:q('q1',.6+t*.4),q2:q('q2',.4+t*.5),q3:q('q3',.6+t*.4),q4:q('q4',.6+t*.4),q5:q('q5',.6+t*.4)};
 if(p(.2+t*.7))lr.diary={help:p(t+.1)?'AI 动画能让看不见的行星运动变得直观；但要有求证意识，用权威资料核对。':'很有帮助。',more:p(t)?'可以做数学小工具、单词卡片、班级值日表网页。':'做网页。',future:p(t)?'以后也许说一句话就能做出复杂的科学模拟。':'',pledge:p(.8),submitted:p(t+.1)?1:0};
 lr.nExp=n;return lr;};
})();
