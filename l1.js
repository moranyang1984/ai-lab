/* 第1讲 识图实验室 (v3) — AI 认一认 / 戴上 AI 的眼镜 / 路口监控追踪 / 找茬实验室 / 找到 AI 的极限 / 复杂场景 */
(function(){
const {$,$$,esc,clamp}=App;const K='l1';const L={};App.lessons[K]=L;
const LIB=()=>App.AI.LIB;const NOC={blur:0,occ:0,rot:0,dark:0,pix:1,noise:0};
const VARS=[['blur','模糊',12,1,''],['occ','遮挡',70,5,'%'],['rot','旋转',180,15,'°'],['dark','变暗',90,5,'%'],['pix','变远（像素变粗）',24,1,''],['noise','噪点',80,5,'%']];

function drawCond(cv,img,c,occPos){const ctx=cv.getContext('2d');const W=cv.width,H=cv.height;ctx.save();ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);
  const s=Math.min(W/img.naturalWidth,H/img.naturalHeight),w=img.naturalWidth*s,hh=img.naturalHeight*s;
  ctx.translate(W/2,H/2);ctx.rotate((c.rot||0)*Math.PI/180);ctx.filter=`blur(${c.blur||0}px) brightness(${1-(c.dark||0)/100})`;
  if((c.pix||1)>1){const t=document.createElement('canvas');t.width=Math.max(1,Math.round(w/c.pix));t.height=Math.max(1,Math.round(hh/c.pix));t.getContext('2d').drawImage(img,0,0,t.width,t.height);ctx.imageSmoothingEnabled=false;ctx.drawImage(t,-w/2,-hh/2,w,hh);ctx.imageSmoothingEnabled=true;}
  else ctx.drawImage(img,-w/2,-hh/2,w,hh);ctx.restore();
  if(c.noise){const id=ctx.getImageData(0,0,W,H),d=id.data,a=c.noise/100*160;let seed=7;const r=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};for(let i=0;i<d.length;i+=4){const n=(r()-.5)*a;d[i]+=n;d[i+1]+=n;d[i+2]+=n;}ctx.putImageData(id,0,0);}
  if(c.occ>0){const p=occPos||{x:.5,y:.45};const side=Math.sqrt(c.occ/100)*Math.min(W,H)*1.15;ctx.save();ctx.translate(p.x*W,p.y*H);
    for(let i=0;i<7;i++){ctx.beginPath();ctx.ellipse(Math.cos(i*0.9)*side*0.28,Math.sin(i*1.3)*side*0.22,side*0.42,side*0.2,i*0.8,0,7);ctx.fillStyle=i%2?'#365f2c':'#4b7f39';ctx.fill();}ctx.restore();}}
function condText(c){const a=[];VARS.forEach(([k,n,,,u])=>{const v=c[k]||0;if(k==='pix'?v>1:v)a.push(`${n.replace(/（.*）/,'')} ${v}${u}`);});return a.length?a.join('、'):'原图';}
/* an answer counts as right when it names the same thing, whatever the wording (real models say 橘猫 / 铜钱 / 一杯咖啡) */
const ALIAS={cat:/猫/,coffee:/咖啡/,rocket:/火箭/,flower:/花/,temple:/(建筑|楼|阁|寺|庙|宫|殿|塔|祠)/,horse:/马/,coins:/(币|钱)/,apple:/苹果/};
const isRight=(key,label)=>{const L=LIB()[key];if(!L||!label)return null;const t=L.labels[0];return label.includes(t)||t.includes(label)||!!(ALIAS[key]&&ALIAS[key].test(label));};
const trueName=key=>LIB()[key].labels[0];
/* the answer is top[0]. Real models: sort by 把握度. Offline demo: its first entry is the answer, so give that entry the highest 把握度 (the demo data can list a lower number first). */
const desc=(a,b)=>(+b.conf||0)-(+a.conf||0);
const norm=r=>{r.top=(r.top||[]).map(t=>({...t}));if(!r.top.length)return r;
  if((r.mode||'offline')==='offline'){let i=0;r.top.forEach((t,j)=>{if((+t.conf||0)>(+r.top[i].conf||0))i=j;});if(i>0){const a=r.top[0].conf;r.top[0].conf=r.top[i].conf;r.top[i].conf=a;}r.top=[r.top[0],...r.top.slice(1).sort(desc)];}
  else r.top.sort(desc);return r;};
/* shared bits of the station layout */
const bars=r=>`<div class="bars" style="margin-top:8px">${(r.top||[]).slice(0,3).map(t=>`<div class="bar"><span>${esc(t.label)}</span><span class="tr"><i style="width:${clamp(+t.conf||0)}%"></i></span><span>${clamp(+t.conf||0)}%</span></div>`).join('')}</div>`;
const feats=r=>(r.features||[]).length?`<div class="feat"><span style="border:0;background:none;padding-left:0;color:var(--muted)">它看到：</span>${r.features.slice(0,4).map(f=>`<span>${esc(f)}</span>`).join('')}</div>`:'';
const picker=(id,keys)=>`<div class="pick" id="${id}" role="radiogroup" aria-label="选图片">${keys.map(k=>`<button type="button" data-k="${k}" role="radio" aria-checked="false" aria-label="${LIB()[k].name}"><img src="${LIB()[k].src}" alt=""></button>`).join('')}</div>`;
const pickWire=(id,fn,first)=>{const root=$('#'+id);const set=(b,user)=>{$$('button',root).forEach(x=>{x.classList.toggle('on',x===b);x.setAttribute('aria-checked',x===b);});fn(b.dataset.k,user);};$$('button',root).forEach(b=>b.onclick=()=>set(b,true));if(first){const b=$(`[data-k="${first}"]`,root);if(b)set(b,false);}};
const HARD=[['blur','模糊',12,1,''],['occ','遮挡',70,5,'%'],['rot','旋转',180,15,'°'],['dark','变暗',90,5,'%'],['pix','变远',24,1,''],['noise','噪点',80,5,'%']];
const SL=[['blur','模糊',12,1,''],['occ','遮挡',70,5,'%'],['dark','变暗',90,5,'%'],['rot','旋转',180,15,'°']];
const hardVal=(k,p)=>{const V=VARS.find(v=>v[0]===k),lo=k==='pix'?1:0;return Math.max(lo,Math.round((lo+(V[2]-lo)*p/100)/V[3])*V[3]);};
/* put the bubble back to "waiting" when what it shows no longer matches the picture */
const aiWait=(box,txt)=>{box=$(box);if(!box)return;App.aiSay(box,txt,{mood:'idle'});box.classList.add('wait');box.classList.remove('pop');const s=$('.ai-src',box);if(s)s.innerHTML='';};
/* after a run, bring the answer into view so nobody has to hunt for it */
const see=el=>{el=typeof el==='string'?$(el):el;if(!el)return;setTimeout(()=>{if(el.offsetParent===null)return;el.style.scrollMarginTop='84px';el.style.scrollMarginBottom='18px';const r=el.getBoundingClientRect();if(r.bottom>innerHeight-6||r.top<70)el.scrollIntoView({block:r.height>innerHeight-110?'start':'nearest',behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'});},60);};
const thumbOf=cv=>{const t=document.createElement('canvas');t.width=120;t.height=80;t.getContext('2d').drawImage(cv,0,0,120,80);return t.toDataURL('image/jpeg',0.6);};

/* layout used by this lesson: what you look at on the left, what you touch on the right; on a phone everything is one column in the order look → touch → answer */
const CSS=`
.l1-lr{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:18px;align-items:start}
.l1-lr.wide{grid-template-columns:minmax(0,3fr) minmax(0,2fr)}
.l1-col{display:flex;flex-direction:column;gap:14px;min-width:0}
.l1-lr .ai-out{grid-template-columns:48px minmax(0,1fr)}.l1-lr .ai-out .bot{width:48px;height:48px}
.l1-cap{font-weight:800;font-size:15px;color:var(--muted)}
.l1-dex{display:flex;flex-wrap:wrap;gap:10px;align-items:flex-start}
.l1-dex h4{flex-basis:100%;margin:0;font-size:15px;font-weight:800;color:var(--ink)}
.l1-dex figure{margin:0;width:86px;text-align:center;font-size:13px;font-weight:700;color:var(--ink);line-height:1.3}
.l1-dex figure img,.l1-dex figure i{display:block;width:86px;height:64px;border-radius:14px;object-fit:cover;margin-bottom:4px}
.l1-dex figure img{box-shadow:0 0 0 3px var(--mint)}
.l1-dex figure i{border:2px dashed var(--line2);font-style:normal;display:grid;place-items:center;color:var(--dim);font-size:22px;font-weight:800}
.l1-dex figure em{font-style:normal;color:var(--muted);font-weight:500}
.l1-judge{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}
.l1-px{display:grid;grid-template-columns:repeat(12,1fr);gap:2px;width:100%;max-width:216px}
.l1-px i{aspect-ratio:1;border-radius:2px;display:block}
.l1-px i.c{outline:3px solid #ffd43b;outline-offset:0;position:relative;z-index:1}
.l1-rgb{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:10px}
.l1-rgb span{display:inline-flex;align-items:baseline;gap:6px;padding:4px 12px;border-radius:12px;color:#fff;font-weight:700;font-size:14px}
.l1-rgb span b{font-family:var(--f-display);font-size:22px;font-weight:800}
.l1-rgb .sw{width:44px;height:44px;border-radius:12px;padding:0;box-shadow:0 0 0 2px var(--line2)}
.l1-hunt{margin-top:10px;padding:10px 14px;border-radius:14px;background:#fff;font-size:15px;line-height:1.5;color:var(--ink);box-shadow:0 0 0 1.5px var(--line2)}
.l1-hunt b{color:var(--sky);margin-right:6px}
.l1-tabs{display:flex;gap:8px;align-items:center}
.l1-tabs button{width:34px;height:34px;border-radius:50%;border:0;cursor:pointer;font-weight:800;font-size:15px;background:#fff;color:var(--ink);box-shadow:0 0 0 1.5px var(--line2)}
.l1-tabs button.done{background:var(--mint-soft);color:var(--mint-d)}
.l1-tabs button.on{background:var(--sky);color:#fff;box-shadow:none}
.l1-tabs span{font-size:13px;color:var(--muted);margin-left:4px}
.l1-tip{padding:8px 12px;border-radius:12px;background:var(--sky-soft);font-size:15px;line-height:1.5;color:var(--ink)}
.l1-tip b{display:inline-block;margin-right:8px;padding:0 8px;border-radius:999px;background:var(--sky);color:#fff;font-size:13px}
.l1-strip{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:8px;margin-top:10px}
.l1-strip figure{margin:0;text-align:center;font-size:13px;line-height:1.35;color:var(--ink);font-weight:700}
.l1-strip img{width:100%;border-radius:10px;display:block;margin-bottom:3px;border:3px solid var(--mint)}
.l1-strip figure.no img{border-color:var(--coral)}
.l1-strip figure.no span{color:var(--coral-d)}
.l1-strip em{display:block;font-style:normal;font-weight:500;color:var(--muted)}
#l1-scv.hunt,#l1-cv2{cursor:crosshair}
@media (min-width:881px){.l1-stick{position:sticky;top:76px}}
@media (max-width:880px){
 .l1-lr,.l1-lr.wide{display:flex;flex-direction:column;gap:14px}
 .l1-lr>.l1-col{display:contents}
 .l1-o1{order:1}.l1-o2{order:2}.l1-o3{order:3}.l1-o4{order:4}.l1-o5{order:5}.l1-o6{order:6}
 .l1-strip{grid-template-columns:repeat(3,minmax(0,1fr))}
}
#l1-stats{grid-template-columns:repeat(3,minmax(0,1fr));width:100%}`;
if(!document.getElementById('l1-css')){const s=document.createElement('style');s.id='l1-css';s.textContent=CSS;document.head.appendChild(s);}

L.render=function(){const v=$('#v-l1');const keys=Object.keys(LIB());
 v.innerHTML=`${App.hero(K,'当一回 AI 考官：给它出难题，找出它什么时候看走眼。',['能用 AI 识别静态图像和动态视频。','知道 AI 识别静态图像和动态视频的区别。','了解 AI 图像识别技术的局限性。'])}

 <div class="station" id="l1-s1">${App.head('EXP-01','挑战一 · 小小观察家','AI 认一认','选一张图，看 AI 认成什么、有几成把握')}
  <ol class="steps"><li>选一张图</li><li>集齐 3 种物体</li></ol>
  <div class="l1-lr"><div class="l1-col"><div class="stage l1-o1" id="l1-stage1"><canvas id="l1-cv1" width="600" height="400"></canvas></div>
    <div class="l1-o4">${App.aiBox('l1-ai1','按「让 AI 认一认」，答案出现在这里')}</div><div id="l1-fb1" class="l1-o5"></div></div>
   <div class="l1-col"><div class="l1-o2">${App.knobs([['图片',picker('l1-lib1',keys)]],'点一张图')}</div>
    <div class="go-row l1-o3">${App.go('l1-go1','让 AI 认一认')}</div>
    <div class="l1-dex l1-o6" id="l1-dex" aria-label="我认过的物体"></div></div></div>
  <details class="more"><summary>说明</summary><p class="note">把握度 = AI 对自己的答案有多确定，100% 是完全确定。图库照片来自 Wikimedia Commons，均为 CC0 或公有领域授权，可自由使用。</p>${App.know('记住特征，一一比对','AI 看过成千上万幅标注好的图像，记住了很多物体的典型特征：小狗四条腿、毛茸茸、常吐舌头；苹果圆圆的、表面光滑。识别时，它把图中的特征和记忆里的特征一一对照，给出最匹配的答案和把握度。')}</details>
 </div>

 <div class="station" id="l1-s1b">${App.head('EXP-01b','挑战一 · 小小观察家','戴上 AI 的眼镜','点一点图片，再换眼镜，看 AI 眼里的图')}
  <ol class="steps"><li>点图看数字</li><li>四副都看一遍</li></ol>
  ${App.knobs([['图片',picker('l1-lib2',keys.slice(0,5))],['眼镜',App.seg('lens',[['px','看数字'],['0','找边缘'],['1','找纹理'],['2','找部件']],'px')]])}
  <div class="l1-lr"><div class="l1-col"><div class="l1-cap">你看到的</div><div class="stage" id="l1-stage2"><canvas id="l1-cv2" width="600" height="400"></canvas><canvas id="l1-hl2" width="600" height="400" style="position:absolute;inset:0;pointer-events:none;width:100%;height:100%"></canvas><span class="hint" id="l1-hint2">点图上别的地方试试</span></div></div>
   <div class="l1-col"><div class="l1-cap">AI 看到的</div>${App.aiBox('l1-ai2','','黄框里放大后')}<div id="l1-fb2"></div></div></div>
  <details class="more"><summary>说明</summary><p class="note">看数字：把所点位置的 12×12 个像素放大。另外三副眼镜：浏览器用卷积运算模拟神经网络前三层找到的特征，每副 4 张小图是 4 个不同的“探测器”，越亮表示那里的特征越强。</p>${App.know('图像就是数字','照片放大后是一个个小方格，叫像素。每个像素用红、绿、蓝三个 0～255 的数字记录颜色。一张普通照片有几十万甚至上千万个这样的数字，AI 识图，就是在计算这些数字。')}</details>
 </div>

 <div class="station" id="l1-s2">${App.head('EXP-02','挑战二 · 识别与追踪','路口监控追踪','播放监控，盯住行人的编号：走到树后会怎样？')}
  <ol class="steps"><li>播放并观察</li><li>完成 4 个观察任务</li></ol>
  <div class="l1-lr wide"><div class="l1-col l1-stick"><div class="stage l1-o1" style="aspect-ratio:16/10"><canvas id="l1-trk" width="640" height="400"></canvas></div><div class="grid3 l1-o2" id="l1-stats"></div></div>
   <div class="l1-col"><div class="l1-o4">${App.knobs([['阈值',App.range('l1-thr',30,95,5,60,'%'),'把握度高过它，AI 才画框'],['速度',App.seg('spd',[['1','正常'],['0.3','慢放']],'1')],['AI 的错',App.seg('gt',[['0','不标'],['1','标出来']],'0'),'漏掉的、认错的']])}</div>
    <div class="go-row l1-o3">${App.go('l1-play','播放监控')}</div><div id="l1-fb3" class="l1-o5"></div>
    <div class="after-run l1-o6">${App.pad('',`<div id="l1-trkq"></div>`,'观察任务')}</div></div></div>
  <details class="more"><summary>说明</summary><p class="note">这是自动驾驶路口监控的模拟画面。框上的字是「物体 #编号 把握度」。</p><div class="grid2">${App.know('视频追踪 = 每帧检测 + 前后关联','视频是一帧帧连续的画面。AI 在每一帧里检测出目标，再把相邻两帧中位置接近、样子相像的目标“连起来”，给它同一个编号，就能一路追踪。目标被大树或车辆挡住时，链条会断开，再出现时常被当成新目标。')}
  ${App.know('检测阈值：误检和漏检的取舍','AI 对每个可能的目标都会算出一个把握度。阈值定得低，树影、垃圾桶也可能被当成行人（误检）；定得高，远处又小又暗的行人会被漏掉（漏检）。自动驾驶这类和安全相关的系统，宁可多检测、多提醒，最后还需要人的监督。')}</div></details>
 </div>

 <div class="station" id="l1-s3">${App.head('EXP-03','挑战三 · 误判的难题','找茬实验室','拖动滑杆给图片加困难，把 AI 难倒！')}
  <ol class="steps"><li>拖滑杆加困难</li><li>猜一猜，再揭晓</li></ol>
  <div class="l1-lr"><div class="l1-col"><div class="stage l1-o1"><canvas id="l1-cv3" width="600" height="400"></canvas><span class="hint" id="l1-hint3" hidden>点图可以移动遮挡物</span></div>
    <div class="l1-o4">${App.aiBox('l1-ai3','先猜一猜，再按「揭晓」')}</div><div id="l1-fb4" class="l1-o5"></div>
    <div class="after-run l1-o6"><div class="row" id="l1-log" aria-label="我的找茬记录"></div></div></div>
   <div class="l1-col"><div class="l1-o2">${App.knobs([['图片',picker('l1-lib3',keys.slice(0,4))],...SL.map(([k,n,max,st,u])=>[n,App.range('l1-c-'+k,0,max,st,0,u)])],'拖一拖，给图片加困难')}</div>
    <div class="go-row l1-o3"><span style="font-weight:700">我猜 AI</span>${App.seg('guess',[['1','认得出'],['0','认不出']],'')}${App.go('l1-go3','揭晓')}</div>
    <div class="row l1-o3"><button class="btn ghost sm" id="l1-reset3" type="button">滑杆全部归零</button></div></div></div>
  <details class="more"><summary>说明</summary><p class="note">一次只加一种困难，才能知道是谁让 AI 认错。把握度 = AI 对答案有多确定。</p>${App.know('为什么会看错','AI 只能根据看到的表面特征判断。特征提取不准，就难以匹配出正确答案。')}</details>
 </div>

 <div class="station" id="l1-s3b">${App.head('EXP-03b','挑战三 · 误判的难题','找到 AI 的极限','让困难自动加大 6 级，看 AI 从哪一级开始认错')}
  <ol class="steps"><li>选一种困难</li><li>猜一猜，再开始</li></ol>
  <div class="l1-lr"><div class="l1-col"><div class="stage l1-o1"><canvas id="l1-cv4" width="600" height="400"></canvas></div></div>
   <div class="l1-col"><div class="l1-o2">${App.knobs([['图片',picker('l1-lib4',keys.slice(0,4))],['困难',App.seg('hard2',HARD.map(h=>[h[0],h[1]]),'blur')]])}</div>
    <div class="go-row l1-o3"><span style="font-weight:700">加到最大，我猜 AI</span>${App.seg('guess2',[['1','撑得住'],['0','会认错']],'')}${App.go('l1-scan','自动加大 6 级')}</div></div></div>
  ${App.aiBox('l1-ai4','6 级的图片和把握度曲线会排在这里','每一级 AI 认成了什么')}<div id="l1-fb5"></div>
  <details class="more"><summary>说明</summary><p class="note">自动扫描：把一种困难从 0 逐级加大 6 次，每一级都让 AI 重新识别，画出把握度变化曲线。绿 = 认对，红 = 认错。</p></details>
 </div>

 <div class="station" id="l1-s4">${App.head('EXP-04','综合运用 · 复杂场景','复杂场景大搜查','让 AI 找一遍，再点出它漏掉的东西')}
  <ol class="steps"><li>让 AI 找一遍</li><li>点出它漏掉的</li></ol>
  <div class="l1-lr wide"><div class="l1-col"><div class="stage l1-o1" style="aspect-ratio:auto"><canvas id="l1-scv" width="720" height="560" style="object-fit:contain"></canvas><span class="hint" id="l1-hint4" hidden>点图上你觉得 AI 漏掉的地方</span></div></div>
   <div class="l1-col"><div class="l1-o2">${App.knobs([['场景',App.seg('sc',[['scene_cat','草丛小路'],['scene_traffic','繁忙路口']],'scene_cat')]])}</div>
    <div class="go-row l1-o3">${App.go('l1-scgo','找出所有东西')}</div>
    <div class="l1-o4">${App.aiBox('l1-ai5','AI 找到的东西会列在这里','AI 找到了')}</div><div id="l1-fb6" class="l1-o5"></div>
    <div class="after-run l1-o6"><div class="row" id="l1-revrow"><button class="btn ghost sm" id="l1-reveal" type="button">找不到？揭晓</button></div></div></div></div>
  <div class="after-run"><div id="l1-missbox"></div>${App.pad('<span id="l1-missq">AI 漏掉或认错了什么？为什么？</span>',`<textarea id="l1-miss" placeholder="我发现……，因为……" aria-label="AI 漏掉或认错了什么"></textarea>`)}</div>
  <details class="more"><summary>说明</summary><p class="note">不上传人脸、住址等个人信息和他人版权图片。</p>${App.think(['AI 识别错误时，是什么影响了它的判断？','为什么我们更容易认出草丛中的猫？AI 和我们辨认的方式有什么不同？','自动驾驶 AI 看错红绿灯或看漏行人，后果有多严重？怎样避免？'])}<div class="grid2">${App.know('为什么会看错、看漏','我们辨认物体时，即使目标模糊或被挡住一部分，也能结合常识推测；AI 只能根据看到的表面特征判断。目标个头小、颜色和背景相近、被部分遮挡，或者画面模糊、太暗时，AI 能提取的特征变少，就容易匹配错或漏掉。')}
  ${App.know('使用 AI 识图的规则','不要上传含有自己或他人敏感信息的图片（人脸、证件、写着住址的快递单），也不要上传受版权保护的内容。人脸等生物识别信息属于敏感个人信息，受《中华人民共和国个人信息保护法》保护。和安全有关的场景，AI 的判断需要人来监督与复核。')}</div></details>
 </div>

 <div class="station" id="l1-quizst">${App.head('QUIZ','反思与总结','小测验','5 道题，第一次作答计入能力图谱')}<div id="l1-quiz"></div></div>
 <div class="station" id="l1-diary"></div>`;
 if(!App.rec) return; wire();
};

const QUIZ=[
 {id:'q1',q:'在计算机里，一张彩色照片本质上是什么？',opts:['一张不能修改的画','由像素组成的一大堆数字，每个像素记录红绿蓝三种颜色的亮度','照片里物体的名字'],a:1,why:'图像由像素组成，每个像素用 R、G、B 数值表示颜色。'},
 {id:'q2',q:'AI 为什么能认出从没见过的一张小狗照片？',opts:['它把世界上每一张小狗照片都存下来了','它从大量标注过的图片中学会了小狗的典型特征，识别时进行特征比对','它会上网问别人'],a:1,why:'AI 记住的是特征，不是每一张照片。'},
 {id:'q3',q:'和识别一张静态图片相比，追踪视频里的目标还需要什么？',opts:['只识别第一帧就够了','每一帧都检测，并把前后帧里的同一个目标关联起来','把视频变成黑白的'],a:1,why:'视频追踪 = 每帧检测 + 前后帧关联。'},
 {id:'q4',q:'把检测阈值调得很低，最可能出现什么情况？',opts:['树影、垃圾桶也被当成行人（误检变多）','什么都检测不到','识别速度变快一倍'],a:0,why:'阈值低，把握度不高的“可疑目标”也会被画框，误检增多。'},
 {id:'q5',q:'下面哪种做法是正确的？',opts:['上传同学的照片，让 AI 认出他是谁','上传写着家庭住址的快递单','只上传不含个人信息、不涉及版权的物品或风景图片'],a:2,why:'人脸、住址都是个人信息，要保护自己和他人的权益。'}];

/* 观察任务: one at a time, numbered tabs to go back to any of them; each task says what to do first. store = {id:{first,ok,last}} (first answer is the one that counts) */
function seq(root,qs,store,o){let i=qs.findIndex(q=>!store[q.id]);if(i<0)i=qs.length-1;
 const draw=()=>{const q=qs[i];
  root.innerHTML=`<div class="l1-tabs">${qs.map((x,j)=>`<button type="button" data-t="${j}" class="${j===i?'on':''} ${store[x.id]?'done':''}" aria-label="第 ${j+1} 个任务${store[x.id]?'（已答）':''}" ${j===i?'aria-current="step"':''}>${j+1}</button>`).join('')}<span>第 ${i+1} / ${qs.length} 个</span></div>
   <div class="l1-tip"><b>先做</b>${q.tip}</div>
   <div class="q" data-q="${q.id}" style="border:0;padding:0"><b>${q.q}</b><div class="opts">${q.opts.map((t,j)=>`<button type="button" class="chip" data-j="${j}">${esc(t)}</button>`).join('')}</div><div class="fb" aria-live="polite"></div></div>
   <div class="row"><button type="button" class="btn ghost sm" data-prev ${i?'':'hidden'}>上一个</button><button type="button" class="btn ghost sm" data-next ${i<qs.length-1?'':'hidden'}>下一个</button></div>`;
  const show=j=>{$$('.chip',root).forEach(b=>b.classList.toggle('on',+b.dataset.j===j));const fb=$('.fb',root),ok=j===q.a;fb.className='fb '+(ok?'ok':'no');fb.textContent=ok?'观察准确！'+q.why:'再看一次，可以重新选。'+q.again;};
  if(store[q.id])show(store[q.id].last);
  $$('.chip',root).forEach(b=>b.onclick=()=>{const j=+b.dataset.j;store[q.id]=store[q.id]||{first:j,ok:j===q.a};store[q.id].last=j;show(j);const t=$(`[data-t="${i}"]`,root);if(t)t.classList.add('done');App.touch();if(o.onChange)o.onChange();});
  $$('[data-t]',root).forEach(b=>b.onclick=()=>{i=+b.dataset.t;draw();});
  $('[data-prev]',root).onclick=()=>{i--;draw();};$('[data-next]',root).onclick=()=>{i++;draw();};
  if(o.onShow)o.onShow(q,i);};draw();}

function wire(){const lr=App.lesson(K);lr.recog=lr.recog||[];lr.rows=lr.rows||[];lr.track=lr.track||{answers:{}};lr.track.answers=lr.track.answers||{};lr.scene=lr.scene||{};lr.views=lr.views||{};lr.scans=lr.scans||[];
 const s1=$('#l1-s1'),s1b=$('#l1-s1b'),s2=$('#l1-s2'),s3=$('#l1-s3'),s3b=$('#l1-s3b'),s4=$('#l1-s4');
 const src=m=>m||'offline';
 /* ---- 实验 1 · AI 认一认 ---- */
 let cur1=null,img1=null;const cv1=$('#l1-cv1');
 const kinds=()=>new Set(lr.recog.map(r=>r.key)).size;
 const mark1=()=>{const n=kinds();if(n>=1)App.markStep(s1,0);if(n>=3)App.markStep(s1,1);};mark1();
 const dex=()=>{const seen=[];lr.recog.forEach(r=>{if(LIB()[r.key]){const i=seen.findIndex(x=>x.key===r.key);if(i>=0)seen[i]=r;else seen.push(r);}});const n=seen.length;
  $('#l1-dex').innerHTML=`<h4>我认过的物体 ${Math.min(n,3)}/3${n>3?`（一共 ${n} 种）`:''}</h4>`+seen.map(r=>`<figure><img src="${LIB()[r.key].src}" alt="${esc(LIB()[r.key].name)}">${esc(r.label||'？')} <em>${clamp(+r.conf||0)}%</em></figure>`).join('')+Array.from({length:Math.max(0,3-n)},()=>'<figure><i>?</i>换一张图</figure>').join('');};dex();
 pickWire('l1-lib1',async(k,user)=>{cur1=k;img1=await App.loadImg(LIB()[k].src);drawCond(cv1,img1,NOC);if(user){aiWait('#l1-ai1','图换好了，按「让 AI 认一认」');$('#l1-fb1').innerHTML='';}},'cat');
 $('#l1-go1').onclick=async()=>{if(!cur1)return;const b=$('#l1-go1'),key=cur1;App.busy(b,true,'AI 正在看…');App.aiSay('#l1-ai1','正在提取特征，和学过的特征比对……',{busy:true});
  try{const r=norm(await App.AI.recognize(key,cv1,NOC));const top=r.top[0]||{};const ok=isRight(key,top.label),lab=esc(top.label||'？'),cf=clamp(+top.conf||0);
   App.aiSay('#l1-ai1',`<div class="big">${lab} · ${cf}%</div><p class="note">它猜的前三名，数字是把握度（有多确定）：</p>${bars(r)}${feats(r)}`,{mood:ok?'happy':'think',src:src(r.mode)});
   const e={key,label:top.label,conf:top.conf,mode:r.mode};lr.recog.push(e);if(lr.recog.length>30)lr.recog.shift();App.touch();mark1();dex();const n=kinds(),stars=Math.min(3,n);
   const more=n>=3?'你已经集齐 3 种物体。':`已认出 ${n} 种，再换一张图，集齐 3 种。`;
   if(ok)App.fb('#l1-fb1','ok',`认对了！把握度 ${cf}%`,n>=3?'你已经集齐 3 种物体。看看第二、第三名，它们和答案像在哪里？':more,{stars});
   else{/* the label is not one we know: let the student be the judge instead of declaring an error */
    App.fb('#l1-fb1','find',`AI 说这是「${lab}」`,`图库里这张图叫「${esc(LIB()[key].name)}」。你来当裁判，AI 说得对吗？<span class="l1-judge"><button type="button" class="btn ghost sm" data-j="1">说对了，叫法不同</button><button type="button" class="btn ghost sm" data-j="0">说错了</button></span>`,{stars});
    $$('#l1-fb1 [data-j]').forEach(x=>x.onclick=()=>{e.judge=x.dataset.j==='1';App.touch();
     if(e.judge)App.fb('#l1-fb1','ok','你判它对',`「${lab}」和「${esc(LIB()[key].name)}」说的是同一样东西。${more}`,{stars});
     else App.fb('#l1-fb1','oops','你发现 AI 的错误了！',`它把「${esc(LIB()[key].name)}」说成了「${lab}」。${more}`,{stars,cheer:true});});}
   see(innerWidth>880?'#l1-fb1':'#l1-ai1');
  }catch(e){App.aiSay('#l1-ai1',esc(App.AI.errText(e)),{mood:'oops'});}App.busy(b,false);b.classList.add('again');};

 /* ---- 实验 1b · 戴上 AI 的眼镜 ---- */
 let img2=null,lens='px',pt={x:300,y:200};const cv2=$('#l1-cv2'),hl=$('#l1-hl2');lr.views.seen=lr.views.seen||{};lr.views.hunt=lr.views.hunt||{};
 const LENS={px:['AI 眼里没有猫，只有数字','每个小格是一个像素，用红、绿、蓝三个数字记颜色，数字越大越亮。'],0:['找边缘：线条亮起来了','这是 AI 的第 1 步。越亮的地方，线条越明显。'],1:['找纹理：花纹亮起来了','这是第 2 步。毛发、花瓣这样细密的花纹亮起来了。'],2:['找部件：一块一块亮起来了','这是第 3 步。前两步找到的线条和花纹拼在一起，开始像耳朵、眼睛这样的部件。']};
 const HUNT=[['bright','很亮的地方','三个数都大于 180',(r,g,b)=>r>180&&g>180&&b>180,'数字越大越亮，白色就是三个数都接近 255。'],['dark','很暗的地方','三个数都小于 60',(r,g,b)=>r<60&&g<60&&b<60,'数字越小越暗，黑色就是三个数都接近 0。'],['red','偏红的地方','红比绿、蓝都大 30 以上',(r,g,b)=>r>g+30&&r>b+30,'红的数字最大，所以这里看起来偏红。']];
 const huntN=()=>HUNT.filter(h=>lr.views.hunt[h[0]]).length;
 const stars2=()=>{const n=Object.keys(lr.views.seen).length;return n>=4?(huntN()>=3?3:2):1;};
 /* user=true: the student did something, so count it and give feedback; false: just paint */
 const show2=user=>{if(!img2)return;const hx=hl.getContext('2d');hx.clearRect(0,0,600,400);$('#l1-hint2').hidden=lens!=='px';let html,rgb=null;$('#l1-ai2 .ai-who span').textContent=lens==='px'?'黄框里放大后':'越亮 = 特征越明显';
  if(lens==='px'){const p=Vision.pixels(cv2,pt.x,pt.y,12);hx.strokeStyle='#ffd43b';hx.lineWidth=4;hx.strokeRect(p.x0-3,p.y0-3,p.n+6,p.n+6);hx.lineWidth=2;hx.beginPath();hx.arc(p.x0+p.n/2,p.y0+p.n/2,26,0,7);hx.stroke();
   const c=Math.floor(p.n/2)*p.n+Math.floor(p.n/2);rgb=[p.data[c*4],p.data[c*4+1],p.data[c*4+2]];
   html='<div class="l1-px" aria-hidden="true">';for(let i=0;i<p.n*p.n;i++){html+=`<i${i===c?' class="c"':''} style="background:rgb(${p.data[i*4]},${p.data[i*4+1]},${p.data[i*4+2]})"></i>`;}
   const next=HUNT.find(h=>!lr.views.hunt[h[0]]);
   html+=`</div><div class="l1-rgb" aria-label="中间这一格的三个数字"><span style="background:#e03131">红 <b>${rgb[0]}</b></span><span style="background:#2f9e44">绿 <b>${rgb[1]}</b></span><span style="background:#1c7ed6">蓝 <b>${rgb[2]}</b></span><span class="sw" style="background:rgb(${rgb.join(',')})" title="三个数字合起来的颜色"></span></div><p class="note">黄色小格的三个数字。整张图一共 ${(cv2.width*cv2.height*3).toLocaleString()} 个数字。</p>
    <div class="l1-hunt">${next?`<b>小挑战 ${huntN()+1}/3</b>在图片上点一个${next[1]}（${next[2]}）`:'<b>3 个小挑战都完成了</b>换一张图，再点点看。'}</div>`;if(user)lr.views.px=true;}
  else{const fm=Vision.featureMaps(cv2,192,128);html=`<div class="fmaps" style="grid-template-columns:repeat(2,1fr)">${fm.layers[+lens].map((_,j)=>`<canvas data-j="${j}"></canvas>`).join('')}</div>`;if(user&&lens==='2')lr.views.fm=true;
   requestAnimationFrame(()=>$$('#l1-ai2 canvas[data-j]').forEach(c=>Vision.paint(c,fm.layers[+lens][+c.dataset.j],fm.W,fm.H)));}
  App.aiSay('#l1-ai2',html,{mood:'think'});if(!user)return;
  const first=!lr.views.seen[lens];lr.views.seen[lens]=1;const n=Object.keys(lr.views.seen).length;if(lr.views.seen.px)App.markStep(s1b,0);if(n>=4)App.markStep(s1b,1);
  const prog=n>=4?'四副眼镜都看过了！':`已看 ${n}/4 副，再换一副眼镜。`;const h=lens==='px'&&HUNT.find(x=>!lr.views.hunt[x[0]]);
  if(h&&h[3](...rgb)){lr.views.hunt[h[0]]=1;const k=huntN();const nx=HUNT.find(x=>!lr.views.hunt[x[0]]);App.fb('#l1-fb2','ok',`找到了！${h[1]}`,`红 ${rgb[0]}、绿 ${rgb[1]}、蓝 ${rgb[2]}：${h[4]}${nx?`下一个：找${nx[1]}。`:(n>=4?'':'再把四副眼镜都看一遍。')}`,{stars:stars2(),cheer:k>=3});$('#l1-ai2 .l1-hunt').innerHTML=nx?`<b>小挑战 ${k+1}/3</b>在图片上点一个${nx[1]}（${nx[2]}）`:'<b>3 个小挑战都完成了</b>换一张图，再点点看。';}
  else if(h&&!first)App.fb('#l1-fb2','try',`这里还不是${h[1]}`,`这里是红 ${rgb[0]}、绿 ${rgb[1]}、蓝 ${rgb[2]}。要找：${h[2]}。这张图里难找的话，换一张图。`,{stars:stars2()});
  else App.fb('#l1-fb2',n>=4?'ok':'find',LENS[lens][0],LENS[lens][1]+' '+prog,{stars:stars2()});App.touch();};
 pickWire('l1-lib2',async(k,user)=>{img2=await App.loadImg(LIB()[k].src);drawCond(cv2,img2,NOC);show2(false);if(user)$('#l1-fb2').innerHTML='';},'cat');
 App.segWire(s1b,'lens',v=>{lens=v;show2(true);see(innerWidth>880?'#l1-fb2':'#l1-stage2');});
 $('#l1-stage2').addEventListener('click',ev=>{const r=cv2.getBoundingClientRect();pt={x:(ev.clientX-r.left)/r.width*cv2.width,y:(ev.clientY-r.top)/r.height*cv2.height};if(lens!=='px'){lens='px';$$('[data-seg="lens"] .chip',s1b).forEach(b=>b.classList.toggle('on',b.dataset.v==='px'));}show2(true);see(innerWidth>880?'#l1-fb2':'#l1-ai2');});
 if(lr.views.seen.px)App.markStep(s1b,0);if(Object.keys(lr.views.seen).length>=4)App.markStep(s1b,1);

 /* ---- 实验 2 · 路口监控追踪 ---- */
 Tracker.mount($('#l1-trk'),{onStats:s=>{$('#l1-stats').innerHTML=[['AI 画出的框',s.shown],['认错（误检）',s.fp],['漏掉（漏检）',s.miss]].map(([l,v])=>`<div class="stat"><div class="v">${v}</div><div class="l">${l}</div></div>`).join('');},
   onPause:()=>{lr.track.paused=(lr.track.paused||0)+1;App.touch();}});
 const playBtn=$('#l1-play');
 playBtn.onclick=()=>{const on=Tracker.toggle();playBtn.textContent=on?'暂停':'继续播放';playBtn.dataset.label=playBtn.textContent;
  if(on&&!lr.track.played){lr.track.played=true;App.touch();}App.markStep(s2,0);
  if(!s2.classList.contains('ran'))App.fb('#l1-fb3','find','盯住行人头上的编号','走进大树下再出来，编号还一样吗？边看边答观察任务。');};
 App.rangeWire('l1-thr',v=>{Tracker.opts.thr=v;Tracker.redraw();lr.track.thr=lr.track.thr||{};lr.track.thr[v]=1;App.touch();});
 App.segWire(s2,'spd',v=>{Tracker.speed=+v;});
 const setGt=(on,user)=>{Tracker.opts.gt=on;Tracker.opts.trail=on&&!!user;$$('[data-seg="gt"] .chip',s2).forEach(b=>b.classList.toggle('on',b.dataset.v===(on?'1':'0')));Tracker.redraw();if(on&&user){lr.track.gt=true;App.touch();}};
 App.segWire(s2,'gt',v=>setGt(v==='1',true));
 const TQ=[{id:'t1',q:'红灯变绿灯时，信号灯的识别结果有没有马上变化？',opts:['马上变了','没有变化','识别框消失了'],a:0,why:'AI 每一帧都在重新识别。',tip:'盯住白框里的红绿灯，等它变一次灯。',again:'看红绿灯框上的字，灯一变，字变不变？',focus:'light'},
  {id:'t2',q:'行人走进大树下又走出来，发生了什么？',opts:['识别框一直稳稳跟着','识别框消失，出来后换了新编号','AI 把大树认成了行人'],a:1,why:'被挡住时 AI 看不到特征，追踪中断，再出现时被当成新目标。',tip:'盯住白圈里的行人，记住它的编号（# 后面的数字），看它走过大树。',again:'记住进树前 # 后面的数字，出来后再看一眼。可以选「慢放」。',focus:'ped'},
  {id:'t3',q:'把阈值调到 35%，再调到 90%，分别发生了什么？',opts:['35% 时误检变多；90% 时漏检变多','两种情况完全一样','90% 时误检变多'],a:0,why:'阈值低容易误检，阈值高容易漏检。',tip:'拖「阈值」滑杆：先拖到 35%，再拖到 90%，看画面下方的两个数字。',again:'拖到 35% 时看「认错（误检）」，拖到 90% 时看「漏掉（漏检）」。',gt:true},
  {id:'t4',q:'哪些目标最不容易被识别和追踪？',opts:['又小又远、被遮挡的行人','路中间的大汽车','亮着的红绿灯'],a:0,why:'特征少的目标最难识别。',tip:'把「阈值」拖到 90%，看绿色虚线框（AI 漏掉的）框住的是谁。',again:'绿色虚线框常出现在哪里？大汽车和红绿灯被漏掉过吗？',gt:true}];
 const tqDone=()=>{const A=lr.track.answers;if(Object.keys(A).length>=4){App.markStep(s2,1);const ok=TQ.filter(q=>A[q.id]&&A[q.id].ok).length;App.fb('#l1-fb3',ok>=3?'ok':'try',`4 个任务完成，看准 ${ok} 个`,'追踪 = 每一帧都检测 + 把前后帧的同一个目标连起来。',{stars:ok>=4?3:ok>=2?2:1});}};
 seq($('#l1-trkq'),TQ,lr.track.answers,{onChange:tqDone,onShow:q=>{Tracker.opts.focus=q.focus||null;if(q.gt&&!Tracker.opts.gt)setGt(true,false);else Tracker.redraw();}});
 if(lr.track.played){App.markStep(s2,0);App.ran(s2);}tqDone();

 /* ---- 实验 3 · 找茬实验室 ---- */
 let cur3=null,img3=null,occPos={x:.5,y:.45},guess=null,shown3=false;const cv3=$('#l1-cv3');const C={...NOC};
 const stale3=()=>{if(!shown3)return;shown3=false;aiWait('#l1-ai3','图变了。先猜一猜，再按「揭晓」');$('#l1-fb4').innerHTML='';};
 const setHard=()=>{SL.forEach(([k])=>{C[k]=+$('#l1-c-'+k).value;});$('#l1-hint3').hidden=!(C.occ>0);if(img3)drawCond(cv3,img3,C,occPos);};
 pickWire('l1-lib3',async k=>{cur3=k;img3=await App.loadImg(LIB()[k].src);setHard();stale3();},'cat');
 SL.forEach(([k])=>App.rangeWire('l1-c-'+k,()=>{setHard();stale3();}));
 $('#l1-reset3').onclick=()=>{SL.forEach(([k,,,,u])=>{$('#l1-c-'+k).value=0;$('#l1-c-'+k+'-o').textContent='0'+u;});setHard();stale3();};
 App.segWire(s3,'guess',v=>{guess=v==='1';});
 cv3.onclick=e=>{if(!(C.occ>0))return;const r=cv3.getBoundingClientRect();occPos={x:(e.clientX-r.left)/r.width,y:(e.clientY-r.top)/r.height};setHard();stale3();};
 const addRow=(cv,key,r,c)=>{const top=r.top[0]||{};const hint=isRight(key,top.label);
   lr.rows.push({key,c:{...c},label:top.label||'?',conf:clamp(+top.conf||0),mode:r.mode,ok:hint==null?null:!!hint,hint,thumb:thumbOf(cv)});if(lr.rows.length>16)lr.rows.shift();};
 const renderLog=()=>{const rows=lr.rows.slice(-6);$('#l1-log').innerHTML=rows.map(r=>`<span title="${esc(condText(r.c))}：${esc(r.label)} ${r.conf}%" style="position:relative;display:inline-block"><img src="${r.thumb}" alt="${esc(condText(r.c))}" style="width:66px;height:44px;object-fit:cover;border-radius:10px;display:block;border:3px solid ${r.ok===false?'var(--coral)':'var(--mint)'}"><b style="position:absolute;right:-5px;top:-7px;width:20px;height:20px;border-radius:50%;display:grid;place-items:center;font-size:12px;color:#fff;background:${r.ok===false?'var(--coral)':'var(--mint)'}">${r.ok===false?'✗':'✓'}</b></span>`).join('')+(rows.length?`<span class="note">最近 ${rows.length} 次：红框 = 难倒了 AI</span>`:'');
   if(lr.rows.length)App.markStep(s3,0);if(lr.rows.some(r=>r.pred!=null))App.markStep(s3,1);};
 renderLog();if(lr.rows.length)App.ran(s3);
 $('#l1-go3').onclick=async()=>{if(!cur3)return;const b=$('#l1-go3'),key=cur3,c={...C};App.busy(b,true,'AI 正在看…');App.aiSay('#l1-ai3','正在努力辨认……',{busy:true});
  try{const r=norm(await App.AI.recognize(key,cv3,c));const top=r.top[0]||{};addRow(cv3,key,r,c);const row=lr.rows[lr.rows.length-1];if(guess!=null)row.pred=guess;const ok=row.ok!==false,cf=clamp(+top.conf||0);
   App.aiSay('#l1-ai3',`<div class="big">${esc(top.label||'？')} · ${cf}%</div>${bars(r)}`,{mood:ok?'happy':'oops',src:src(r.mode)});shown3=true;
   const fooled=lr.rows.filter(x=>x.ok===false).length;const hit=guess==null?'':(guess===ok?'你猜对了！':'和你猜的不一样。');const plain=condText(c)==='原图';
   if(!ok)App.fb('#l1-fb4','oops','你把 AI 难倒了！',`${hit}${esc(condText(c))} 时，它把「${esc(trueName(key))}」认成了「${esc(top.label||'？')}」。`,{stars:3,cheer:fooled===1});
   else App.fb('#l1-fb4','try',`AI 还认得出，把握度 ${cf}%`,`${hit}${plain?'还没加困难呢。把一条滑杆往右拖，再猜一次。':'把滑杆再往右拖，或者换一条滑杆试试。'}`,{stars:lr.rows.length>=3?2:1});
   guess=null;$$('[data-seg="guess"] .chip',s3).forEach(x=>x.classList.remove('on'));
   App.touch();renderLog();see(innerWidth>880?'#l1-fb4':'#l1-ai3');}catch(e){App.aiSay('#l1-ai3',esc(App.AI.errText(e)),{mood:'oops'});}App.busy(b,false);};

 /* ---- 实验 3b · 找到 AI 的极限 ---- */
 let cur4=null,img4=null,hard2='blur',guess2=null;const cv4=$('#l1-cv4');
 const stale4=()=>{if(img4)drawCond(cv4,img4,NOC);};
 pickWire('l1-lib4',async k=>{cur4=k;img4=await App.loadImg(LIB()[k].src);stale4();},'cat');
 App.segWire(s3b,'hard2',v=>{hard2=v;stale4();});App.segWire(s3b,'guess2',v=>{guess2=v==='1';});
 const drawChart=(scan)=>{const W=520,H=190,P=40;const pts=scan.pts;const x=i=>P+i*(W-P-16)/Math.max(1,pts.length-1),y=v=>H-28-(v/100)*(H-52);
   let s=`<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${scan.name}强度与把握度的关系">`;[0,50,100].forEach(v=>{s+=`<line x1="${P}" x2="${W-12}" y1="${y(v)}" y2="${y(v)}" stroke="#d7e0fa" stroke-width="2"/><text x="${P-6}" y="${y(v)+4}" text-anchor="end" font-size="13" fill="#4c5884">${v}%</text>`;});
   s+=`<polyline fill="none" stroke="#7d5cf0" stroke-width="4" stroke-linejoin="round" points="${pts.map((p,i)=>`${x(i)},${y(p.conf)}`).join(' ')}"/>`;
   pts.forEach((p,i)=>{s+=`<circle cx="${x(i)}" cy="${y(p.conf)}" r="8" fill="${p.ok?'#12b886':'#ff6b4a'}" stroke="#fff" stroke-width="2.5"/><text x="${x(i)}" y="${H-8}" text-anchor="middle" font-size="13" fill="#4c5884">${p.v}${scan.u}</text>`;});
   if(scan.failAt!=null){const i=scan.failAt;s+=`<line x1="${x(i)}" x2="${x(i)}" y1="12" y2="${H-28}" stroke="#ff6b4a" stroke-width="2" stroke-dasharray="5 5"/><text x="${x(i)>W-130?x(i)-6:x(i)+6}" y="20" text-anchor="${x(i)>W-130?'end':'start'}" font-size="13" font-weight="700" fill="#cf4526">第一次认错</text>`;}
   return s+'</svg>';};
 const strip=scan=>`<div class="l1-strip">${scan.pts.map((p,i)=>`<figure class="${p.ok?'':'no'}"><img src="${p.thumb}" alt="${scan.name} ${p.v}${scan.u} 时的图片"><span>${p.ok?'✓':'✗'} ${esc(p.label)}</span><em>${scan.name} ${p.v}${scan.u}</em></figure>`).join('')}</div>`;
 $('#l1-scan').onclick=async()=>{if(!cur4)return;const k=hard2,key=cur4;const V=VARS.find(v=>v[0]===k);const b=$('#l1-scan');App.busy(b,true,'扫描中…');const pts=[];let mode='offline';$('#l1-fb5').innerHTML='';
   const name=V[1].replace(/（.*）/,'');const vals=Array.from({length:6},(_,i)=>hardVal(k,i*20));
   for(const val of vals){const c={...NOC,[k]:val};drawCond(cv4,img4,c);App.aiSay('#l1-ai4',`${name} ${val}${V[4]}，第 ${pts.length+1}/6 级……`,{busy:true});
     try{const r=norm(await App.AI.recognize(key,cv4,c));mode=r.mode;const tl=(r.top.find(t=>isRight(key,t.label))||{conf:0});pts.push({v:val,conf:clamp(+tl.conf||0),ok:!!isRight(key,(r.top[0]||{}).label),label:(r.top[0]||{}).label||'？',thumb:thumbOf(cv4)});if(pts.length===6||pts.length%2===0)addRow(cv4,key,r,c);}catch(e){break;}}
   if(!pts.length){App.aiSay('#l1-ai4','这次没连上 AI，再按一次试试。',{mood:'oops'});App.busy(b,false);return;}
   const failAt=pts.findIndex(p=>!p.ok);const scan={var:k,name,u:V[4],pts,failAt:failAt<0?null:failAt};lr.scans.push({var:k,failAt:scan.failAt==null?null:pts[scan.failAt].v});if(lr.scans.length>12)lr.scans.shift();
   App.aiSay('#l1-ai4',strip(scan)+drawChart(scan)+`<p class="note">曲线：AI 对「${esc(trueName(key))}」的把握度。绿 = 认对，红 = 认错。</p>`,{mood:failAt<0?'happy':'oops',src:src(mode)});
   App.markStep(s3b,0);App.markStep(s3b,1);const kindsN=new Set(lr.scans.map(x=>x.var)).size;const last=pts[pts.length-1];
   const hit=guess2==null?'':((guess2===(failAt<0))?'你猜对了！':'和你猜的不一样。');const nxt=kindsN>=2?'':'换一种困难比比看。';
   if(failAt>=0)App.fb('#l1-fb5','find',`${name}到 ${pts[failAt].v}${V[4]}，AI 开始认错`,`${hit}它把「${esc(trueName(key))}」认成了「${esc(pts[failAt].label)}」，把握度从 ${pts[0].conf}% 变成 ${pts[failAt].conf}%。${nxt}`,{stars:kindsN>=2?3:2});
   else App.fb('#l1-fb5','try',`${name}加到最大也没难倒 AI`,`${hit}把握度从 ${pts[0].conf}% 变成 ${last.conf}%，答案还是对的。换一种困难再试。`,{stars:kindsN>=2?3:1});
   guess2=null;$$('[data-seg="guess2"] .chip',s3b).forEach(x=>x.classList.remove('on'));
   App.touch();renderLog();App.busy(b,false);see('#l1-ai4');};
 if(lr.scans.length){App.markStep(s3b,0);App.markStep(s3b,1);}

 /* ---- 实验 4 · 复杂场景 ---- */
 let sc='scene_cat';const scv=$('#l1-scv');let scImg=null;const drawSc=async()=>{scImg=await App.loadImg('img/'+sc+'.jpg');scv.width=scImg.naturalWidth;scv.height=scImg.naturalHeight;scv.getContext('2d').drawImage(scImg,0,0);};drawSc();
 lr.scene.notes=lr.scene.notes||{};if(lr.scene.answer&&!Object.keys(lr.scene.notes).length)lr.scene.notes.scene_cat=lr.scene.answer;
 const wrote=()=>(lr.scene.answer||'').trim().length>=8;
 const PAL=['#ffd43b','#4dd4ff','#7dff9b','#ff9de1','#ffa94d','#b9a6ff','#ffffff','#9bf6ff'];
 /* any: there is only one of these in the picture, so a box with the right name counts wherever the model drew it */
 const MISS={scene_cat:[{name:'黑猫',re:/猫/,any:true,box:[.45,.565,.075,.17],why:'个头小、颜色像阴影、被草挡住一部分'}],scene_traffic:[{name:'远处的行人',re:/人/,box:[.815,.45,.055,.09],why:'离得远，在画面里只有很小的一点'},{name:'路边的行人',re:/人/,box:[.44,.465,.03,.08],why:'个头小，和深色的树干、广告牌混在一起'}]};
 const tag=(ctx,W,H,x,y,t,col,dash)=>{const fs=Math.round(W/36);ctx.font=`700 ${fs}px "Noto Sans SC",sans-serif`;const tw=ctx.measureText(t).width+14,th=fs+10;const ty=y*H-th<0?y*H:y*H-th,tx=Math.max(0,Math.min(x*W,W-tw));ctx.fillStyle=col;ctx.beginPath();ctx.roundRect(tx,ty,tw,th,6);ctx.fill();ctx.fillStyle=dash?'#fff':'#1f1b3a';ctx.fillText(t,tx+7,ty+fs+1);};
 const zoom=(m)=>{const [x,y,w,h]=m.box;const c=document.createElement('canvas');const pad=.6;const sx=Math.max(0,(x-w*pad))*scImg.naturalWidth,sy=Math.max(0,(y-h*pad))*scImg.naturalHeight,sw=w*(1+2*pad)*scImg.naturalWidth,sh=h*(1+2*pad)*scImg.naturalHeight;c.width=300;c.height=Math.round(300*sh/sw);const g=c.getContext('2d');g.imageSmoothingQuality='high';g.filter='brightness(1.35) contrast(1.1)';g.drawImage(scImg,sx,sy,sw,sh,0,0,c.width,c.height);return c.toDataURL('image/jpeg',.85);};
 let lastObjs=[],ranSc=null,shown=new Set(),tries=0;
 /* an object counts as found when the AI drew a box of the right kind on (roughly) the same spot */
 const found=m=>lastObjs.some(o=>{if(!m.re.test(o.name||''))return false;if(m.any)return true;const [x,y,w,h]=o.box.map(Number),[mx,my,mw,mh]=m.box;const cx=mx+mw/2,cy=my+mh/2;return cx>=x-.03&&cx<=x+w+.03&&cy>=y-.03&&cy<=y+h+.03&&w*h<mw*mh*12;});
 const missed=()=>(MISS[sc]||[]).filter(m=>!found(m));const left=()=>missed().filter(m=>!shown.has(m.name));
 const huntOn=()=>{const on=ranSc===sc&&left().length>0;$('#l1-hint4').hidden=!on;scv.classList.toggle('hunt',on);$('#l1-revrow').hidden=!on;};
 const showMiss=(ms,self)=>{const ctx=scv.getContext('2d');const W=scv.width,H=scv.height;ctx.lineWidth=Math.max(5,W/160);
  let list=$('#l1-missbox .miss-list');if(!list){$('#l1-missbox').innerHTML='<div class="miss-list"></div>';list=$('#l1-missbox .miss-list');}
  ms.forEach(m=>{shown.add(m.name);const [x,y,w,h]=m.box;ctx.setLineDash([W/60,W/90]);ctx.strokeStyle='#ff4d4d';ctx.strokeRect(x*W,y*H,w*W,h*H);ctx.setLineDash([]);tag(ctx,W,H,x,y,'漏掉：'+m.name,'#ff4d4d',true);
   list.insertAdjacentHTML('beforeend',`<div class="miss-item"><img src="${zoom(m)}" alt="放大后的${esc(m.name)}"><div><b>${self?'你找到了 AI 漏掉的':'AI 漏掉了'}：${esc(m.name)}</b><span>${esc(m.why)}</span></div></div>`);});
  lr.scene.revealed=true;App.markStep(s4,1);App.touch();huntOn();};
 const resetSc=()=>{ranSc=null;lastObjs=[];shown=new Set();tries=0;$('#l1-missbox').innerHTML='';huntOn();};
 App.segWire(s4,'sc',v=>{sc=v;drawSc();resetSc();aiWait('#l1-ai5','场景换好了，按「找出所有东西」');$('#l1-fb6').innerHTML='';miss.value=lr.scene.notes[sc]||'';});
 $('#l1-scgo').onclick=async()=>{const b=$('#l1-scgo'),key=sc;App.busy(b,true,'AI 正在找…');App.aiSay('#l1-ai5','一格一格地找……',{busy:true});await drawSc();resetSc();
  try{const r=await App.AI.detect(key,scv);if(key!==sc){App.busy(b,false);return;}const ctx=scv.getContext('2d');const W=scv.width,H=scv.height;ctx.lineWidth=Math.max(4,W/200);lastObjs=(r.objects||[]).filter(o=>Array.isArray(o.box));ranSc=key;
   lastObjs.forEach((o,i)=>{const [x,y,w,h]=o.box.map(Number);const col=PAL[i%PAL.length];ctx.strokeStyle=col;ctx.strokeRect(x*W,y*H,w*W,h*H);tag(ctx,W,H,x,y,`${i+1} ${o.name}`,col);});
   const n=lastObjs.length;App.aiSay('#l1-ai5',`<div class="big">找到 ${n} 样东西</div><div class="legend">${lastObjs.map((o,i)=>`<span><i style="background:${PAL[i%PAL.length]}">${i+1}</i>${esc(o.name)} <em>${clamp(+o.conf||0)}%</em></span>`).join('')}</div><p class="note">图上每个框的颜色和编号，对应这里的一样东西。</p>`,{mood:'think',src:src(r.mode)});
   lr.scene[key]={objects:lastObjs.map(o=>o.name).slice(0,12)};App.markStep(s4,0);App.touch();
   const ms=missed(),hard=(MISS[key]||[])[0];huntOn();
   if(ms.length)App.fb('#l1-fb6','find',`AI 画了 ${n} 个框，找全了吗？`,'你来找：点图上你觉得它漏掉的地方。提示：又小、又暗、被挡住的东西。',{stars:wrote()?3:1});
   else{App.markStep(s4,1);App.fb('#l1-fb6','ok','这次 AI 一样也没漏掉！',`连最难找的「${esc(hard.name)}」也找到了。看看它的把握度高不高，再想想：它为什么难找？写进「我的记录」。`,{stars:wrote()?3:2});
    $('#l1-missbox').innerHTML=`<div class="miss-list">${(MISS[key]||[]).map(m=>`<div class="miss-item" style="background:var(--mint-soft)"><img src="${zoom(m)}" alt="放大后的${esc(m.name)}" style="border-color:var(--mint)"><div><b style="color:var(--mint-d)">AI 找到了：${esc(m.name)}</b><span>它很难找：${esc(m.why)}</span></div></div>`).join('')}</div>`;}
   $('#l1-missq').textContent=ms.length?'AI 漏掉了什么？为什么会漏？':'画面里哪样东西最难找？为什么？';see(innerWidth>880?'#l1-fb6':'#l1-ai5');
  }catch(e){App.aiSay('#l1-ai5',esc(App.AI.errText(e)),{mood:'oops'});}App.busy(b,false);};
 /* 人机比一比: the student points at what the AI missed */
 scv.addEventListener('click',ev=>{if(ranSc!==sc||!left().length)return;const r=scv.getBoundingClientRect();const px=(ev.clientX-r.left)/r.width,py=(ev.clientY-r.top)/r.height;
  const m=left().find(m=>{const [x,y,w,h]=m.box;return px>=x-.035&&px<=x+w+.035&&py>=y-.035&&py<=y+h+.035;});
  if(m){lr.scene.self=(lr.scene.self||0)+1;showMiss([m],true);const k=left().length;App.fb('#l1-fb6','ok','你比 AI 眼尖！',`你点中了「${esc(m.name)}」，AI 没有给它画框。${k?`还有 ${k} 个漏掉的，继续找。`:'看下面的放大图：它为什么难认？写进「我的记录」。'}`,{stars:3,cheer:true});if(!k)see('#l1-missbox');}
  else{tries++;const ctx=scv.getContext('2d'),W=scv.width,H=scv.height;ctx.strokeStyle='#fff';ctx.lineWidth=Math.max(3,W/260);ctx.beginPath();ctx.arc(px*W,py*H,W/70,0,7);ctx.stroke();
   App.fb('#l1-fb6','try','不在这里，再找找',tries>=3?'提示：它又小又暗，容易和背景混在一起。实在找不到，就按「找不到？揭晓」。':'白圈是你点过的地方。找又小、又暗、被挡住的东西。',{stars:wrote()?3:1});}});
 $('#l1-reveal').onclick=()=>{const ms=left();if(!ms.length)return;showMiss(ms,false);App.fb('#l1-fb6','oops','AI 漏掉的在红色虚线框里','看下面的放大图：它为什么难认？把原因写进「我的记录」。',{stars:wrote()?3:2});see('#l1-missbox');};
 const miss=$('#l1-miss');miss.value=lr.scene.notes[sc]||'';let mt;miss.oninput=()=>{lr.scene.notes[sc]=miss.value;lr.scene.answer=Object.values(lr.scene.notes).sort((a,b)=>b.trim().length-a.trim().length)[0]||'';clearTimeout(mt);mt=setTimeout(()=>{App.touch();if(miss.value.trim().length>=8){App.markStep(s4,1);App.fb('#l1-fb6','ok','记录好了！','又小、又暗、被挡住的东西，特征少，最容易被漏掉。',{stars:3});}},800);};
 if(lr.scene.scene_cat||lr.scene.scene_traffic){App.markStep(s4,0);App.ran(s4);}if(wrote()||lr.scene.revealed)App.markStep(s4,1);huntOn();

 App.quiz($('#l1-quiz'),K,QUIZ);
 const rd=App.diary($('#l1-diary'),K,{title:'我的 AI 初认识',lead:'用你的实验证据来回答',
  fields:[{id:'fast',q:'AI 在什么情况下能看得又快又准？为什么？',ph:'当图片……时，AI 能提取到……'},{id:'wrong',q:'AI 在什么情况下容易看错或看漏？为什么？（请引用你的实验数据）',ph:'在找茬实验室里，当模糊调到……时……'},{id:'careful',q:'哪些场景使用 AI 识图要特别小心，需要人来复核？',ph:'例如……'},{id:'idea',q:'要让 AI 看准复杂的场景，你有什么好主意？写一句今天的收获。',ph:'我的好主意是……'}],
  pledge:'我会保护自己和他人的隐私：不上传人脸、个人信息和别人的版权图片。',
  extras:ex=>{const l=App.lesson(K);const rows=l.rows||[];const good=rows.find(r=>r.ok===true),bad=rows.find(r=>r.ok===false);const rc=l.recog||[];const sc=(l.scans||[]).filter(s=>s.failAt!=null);
   const nm=Object.fromEntries(VARS.map(v=>[v[0],v[1].replace(/（.*）/,'')]));const un=Object.fromEntries(VARS.map(v=>[v[0],v[4]]));
   ex.innerHTML=`<p class="note">AI 认出过：${[...new Set(rc.map(r=>r.label).filter(Boolean))].slice(0,6).map(esc).join('、')||'（还没有）'}</p>${sc.length?`<p class="note">自动扫描发现：${sc.slice(-3).map(s=>`${nm[s.var]}到 ${s.failAt}${un[s.var]} 时开始认错`).join('；')}</p>`:''}
   <div class="grid2" style="margin-top:8px">${[['AI 认对了',good],['AI 认错了',bad]].map(([t,r])=>`<div><div class="box-t">${t}</div>${r?`<img src="${r.thumb}" alt="" style="width:100%;border-radius:6px"><p class="note">${esc(condText(r.c))} → ${esc(r.label)} ${r.conf}%</p>`:`<p class="note">在「找茬实验室」${t==='AI 认错了'?'把 AI 难倒一次':'做一次'}，这里会出现图片。</p>`}</div>`).join('')}</div>`;}});
 App.on(()=>{if(App.current==='l1')rd();});
}

/* ---------- CCTV-style tracking simulation ---------- */
const Tracker={opts:{trail:false,gt:false,thr:60,focus:null},running:false,speed:1};window.Tracker=Tracker;
Tracker.mount=function(cv,cb){const ctx=cv.getContext('2d');const W=640,H=400,DT=1/15;let t=0,frame=0,ents=[],nextTrue=1,trackOf={},nextId=1,switches=0,lostAt={},trails={},hist=[],focusId=null;
 const trees=[{x:500,y:108,r:46},{x:118,y:302,r:40},{x:470,y:302,r:34}];
 const decoys=[{x:470,y:150,w:14,h:14,kind:'行人',base:48,what:'树影'},{x:212,y:96,w:12,h:16,kind:'行人',base:42,what:'垃圾桶'},{x:405,y:280,w:24,h:12,kind:'汽车',base:38,what:'井盖'},{x:560,y:262,w:12,h:16,kind:'行人',base:52,what:'路牌'}];
 const light=()=>{const c=t%15;return c<6?'green':c<7.5?'yellow':'red';};const nsGreen=()=>{const c=t%15;return c>=8&&c<14;};
 let rs=42;const rnd=()=>{rs=(rs*16807)%2147483647;return rs/2147483647;};
 const spawnT={e:0,w:0,n:0,p:0,s:0,f:0};
 const spawn=(type,x,y,vx,vy,col,small)=>ents.push({id:nextTrue++,type,x,y,vx,vy,col,small,w:type==='car'?34:type==='bus'?58:small?7:10,h:type==='car'?18:type==='bus'?22:small?7:10});
 function step(){t+=DT;frame++;const L=light();
  if((spawnT.e-=DT)<=0){spawn('car',-40,221,70,0,['#c9c9c9','#9fb4d0','#d8d2b0','#a6b7a0'][nextTrue%4]);spawnT.e=2.6+rnd()*1.6;}
  if((spawnT.w-=DT)<=0){spawn(rnd()<.25?'bus':'car',W+60,179,-65,0,['#b8c4d6','#cfc3a8','#a9b5c4','#d0d0d0'][nextTrue%4]);spawnT.w=3+rnd()*2;}
  if((spawnT.n-=DT)<=0&&nsGreen()){spawn('car',322,H+30,0,-60,'#b6c8cf');spawnT.n=2.2;}
  if((spawnT.p-=DT)<=0){spawn('ped',-10,128,26,0,'#f0d9a0');spawnT.p=3.4+rnd()*2;}
  if((spawnT.s-=DT)<=0&&L==='red'){spawn('ped',262,135,0,30,'#e8b5b5');spawnT.s=2.2;}
  if((spawnT.f-=DT)<=0){spawn('ped',W+10,24,-14,0,'#d9d0b8',true);spawnT.f=5+rnd()*3;}
  ents.forEach(e=>{let vx=e.vx,vy=e.vy;
   if(e.type!=='ped'&&vy===0){const stopX=vx>0?240:400;const ahead=vx>0?e.x+e.w/2:e.x-e.w/2;const dist=vx>0?stopX-ahead:ahead-stopX;if(L!=='green'&&dist>0&&dist<26)vx=0;
     const lead=ents.find(o=>o!==e&&o.vy===0&&o.type!=='ped'&&Math.sign(o.vx)===Math.sign(e.vx)&&Math.abs(o.y-e.y)<4&&(vx>0?o.x>e.x:o.x<e.x)&&Math.abs(o.x-e.x)<(e.w+o.w)/2+10);if(lead)vx=0;}
   if(e.type!=='ped'&&vx===0&&e.vy!==0){if(!nsGreen()&&e.y>250&&e.y<262)vy=0;}e.x+=vx*DT;e.y+=vy*DT;});
  ents=ents.filter(e=>e.x>-80&&e.x<W+80&&e.y>-40&&e.y<H+50);
  ents.forEach(e=>{const near=trees.reduce((m,tr)=>Math.min(m,Math.hypot(e.x-tr.x,e.y-tr.y)-tr.r),99);e.hidden=near<-4;e.conf=e.hidden?0:Math.round((e.type==='ped'?(e.small?66:84):93)-(near<10?28:0)+((e.id*7)%6));});
  hist.push(JSON.stringify({t,frame,ents,nextTrue,rs,spawnT}));if(hist.length>200)hist.shift();}
 function track(){const thr=Tracker.opts.thr;ents.forEach(e=>{const seen=!e.hidden&&e.conf>=thr;if(seen){if(!trackOf[e.id]){if(lostAt[e.id]!=null)switches++;trackOf[e.id]=nextId++;}delete lostAt[e.id];(trails[e.id]=trails[e.id]||[]).push([e.x,e.y]);if(trails[e.id].length>60)trails[e.id].shift();}
   else{if(trackOf[e.id]&&lostAt[e.id]==null)lostAt[e.id]=frame;if(lostAt[e.id]!=null&&frame-lostAt[e.id]>3){delete trackOf[e.id];delete trails[e.id];}}});}
 function draw(){const thr=Tracker.opts.thr;
  ctx.fillStyle='#3d4a3a';ctx.fillRect(0,0,W,H);ctx.fillStyle='#8a8a84';ctx.fillRect(0,116,W,24);ctx.fillRect(0,260,W,24);ctx.fillRect(256,0,24,H);ctx.fillRect(360,0,24,H);
  ctx.fillStyle='#3a3d44';ctx.fillRect(0,140,W,120);ctx.fillRect(280,0,80,H);ctx.strokeStyle='#cfcab0';ctx.setLineDash([16,12]);ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,200);ctx.lineTo(280,200);ctx.moveTo(360,200);ctx.lineTo(W,200);ctx.moveTo(320,0);ctx.lineTo(320,140);ctx.moveTo(320,260);ctx.lineTo(320,H);ctx.stroke();ctx.setLineDash([]);
  ctx.fillStyle='#d6d6d0';for(let y=146;y<256;y+=12)ctx.fillRect(250,y,26,7);for(let y=146;y<256;y+=12)ctx.fillRect(364,y,26,7);
  ctx.fillStyle='#2a2f2a';ctx.fillRect(208,90,10,14);ctx.fillStyle='#55605a';ctx.fillRect(556,254,6,20);ctx.fillStyle='#2f2f30';ctx.beginPath();ctx.arc(405,286,9,0,7);ctx.fill();
  ents.filter(e=>e.type!=='ped').forEach(e=>{ctx.save();ctx.translate(e.x,e.y);if(e.vy!==0)ctx.rotate(Math.PI/2);ctx.fillStyle=e.col;ctx.beginPath();ctx.roundRect(-e.w/2,-e.h/2,e.w,e.h,4);ctx.fill();ctx.fillStyle='rgba(30,40,55,.75)';ctx.fillRect(e.w/2-11,-e.h/2+3,6,e.h-6);ctx.restore();});
  ents.filter(e=>e.type==='ped').forEach(e=>{const r=e.small?3.5:5;ctx.fillStyle=e.col;ctx.beginPath();ctx.arc(e.x,e.y,r,0,7);ctx.fill();ctx.fillStyle='#333';ctx.beginPath();ctx.arc(e.x,e.y,r/2,0,7);ctx.fill();});
  const Lc=light();ctx.fillStyle='#1d1d1d';ctx.fillRect(226,96,16,40);[['red',102],['yellow',114],['green',126]].forEach(([c,y])=>{ctx.fillStyle=Lc===c?{red:'#ff5050',yellow:'#ffd34b',green:'#4bff7a'}[c]:'#444';ctx.beginPath();ctx.arc(234,y,4.5,0,7);ctx.fill();});
  trees.forEach(tr=>{ctx.fillStyle='rgba(28,62,34,.97)';ctx.beginPath();ctx.arc(tr.x,tr.y,tr.r,0,7);ctx.fill();ctx.fillStyle='rgba(48,92,52,.9)';ctx.beginPath();ctx.arc(tr.x-tr.r*0.3,tr.y-tr.r*0.3,tr.r*0.6,0,7);ctx.fill();});
  // CCTV treatment
  const id=ctx.getImageData(0,0,W,H),d=id.data;for(let i=0;i<d.length;i+=4){const g=(d[i]*.3+d[i+1]*.59+d[i+2]*.11);d[i]=g*.55+d[i]*.45;d[i+1]=g*.55+d[i+1]*.45;d[i+2]=g*.55+d[i+2]*.45;}ctx.putImageData(id,0,0);
  ctx.fillStyle='rgba(0,0,0,.08)';for(let y=0;y<H;y+=3)ctx.fillRect(0,y,W,1);
  if(Tracker.opts.trail){ctx.lineWidth=1.5;Object.entries(trails).forEach(([,pts])=>{ctx.strokeStyle='rgba(76,201,240,.7)';ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.stroke();});}
  ctx.font='700 12px "Noto Sans SC",sans-serif';ctx.lineWidth=2;let shown=0,fp=0,miss=0,truth=0;
  const box=(x,y,w,hh,label,col)=>{ctx.strokeStyle=col;ctx.strokeRect(x,y,w,hh);const tw=ctx.measureText(label).width+8,lx=Math.max(0,Math.min(x,W-tw));ctx.fillStyle=col;ctx.fillRect(lx,y-17,tw,17);ctx.fillStyle='#06122a';ctx.fillText(label,lx+4,y-4);};
  ents.forEach(e=>{if(e.x<0||e.x>W||e.y<0||e.y>H)return;truth++;const rot=e.vy!==0,w=(rot?e.h:e.w)+8,hh=(rot?e.w:e.h)+8;
   if(!e.hidden&&e.conf>=thr&&trackOf[e.id]){shown++;box(e.x-w/2,e.y-hh/2,w,hh,`${{car:'汽车',bus:'公交车',ped:'行人'}[e.type]}#${trackOf[e.id]} ${e.conf}%`,e.type==='ped'?'#f9c74f':'#4cc9f0');}
   else{miss++;if(Tracker.opts.gt){ctx.strokeStyle='#90be6d';ctx.setLineDash([4,3]);ctx.strokeRect(e.x-w/2,e.y-hh/2,w,hh);ctx.setLineDash([]);ctx.fillStyle='#90be6d';ctx.fillText('漏检',e.x-w/2,e.y+hh/2+12);}}});
  decoys.forEach((dc,i)=>{const c=dc.base+Math.round(4*Math.sin(t*2+i));if(c>=thr){shown++;fp++;box(dc.x-dc.w/2-4,dc.y-dc.h/2-4,dc.w+8,dc.h+8,`${dc.kind} ${c}%`,dc.kind==='行人'?'#f9c74f':'#4cc9f0');if(Tracker.opts.gt){ctx.fillStyle='#f25c78';ctx.fillText('误检：'+dc.what,dc.x-dc.w/2-4,dc.y+dc.h/2+16);}}});
  box(222,92,24,48,{red:'红灯',yellow:'黄灯',green:'绿灯'}[Lc]+' 98%',{red:'#f25c78',yellow:'#f9c74f',green:'#90be6d'}[Lc]);
  /* 观察任务的"盯住它": a white ring on the thing the current task is about */
  const F=Tracker.opts.focus;const say=(s,x,y)=>{ctx.font='700 14px "Noto Sans SC",sans-serif';ctx.lineWidth=4;ctx.strokeStyle='rgba(0,0,0,.75)';ctx.strokeText(s,x,y);ctx.fillStyle='#fff';ctx.fillText(s,x,y);};
  if(F==='light'){ctx.strokeStyle='#fff';ctx.lineWidth=3;ctx.strokeRect(216,88,36,56);say('盯住红绿灯',196,162);}
  if(F==='ped'){let e=ents.find(x=>x.id===focusId);if(!e||e.x>590){e=ents.filter(x=>x.type==='ped'&&x.vy===0&&x.vx>0&&x.x>4&&x.x<440).sort((a,b)=>b.x-a.x)[0];focusId=e?e.id:null;}
   if(e){ctx.strokeStyle='#fff';ctx.lineWidth=3;ctx.beginPath();ctx.arc(e.x,e.y,19,0,7);ctx.stroke();say(e.hidden?'被树挡住了':'盯住它',Math.max(4,Math.min(W-90,e.x-22)),e.y+38);}}
  ctx.fillStyle='rgba(0,0,0,.55)';ctx.fillRect(0,0,W,22);ctx.fillStyle='#e6edf7';ctx.font='12px "JetBrains Mono",monospace';const sec=Math.floor(t);ctx.fillText(`CAM-03  路口东南角   08:15:${String(sec%60).padStart(2,'0')}.${String(Math.floor((t%1)*100)).padStart(2,'0')}   帧 ${frame}`,8,15);
  ctx.fillStyle=Tracker.running?'#f25c78':'#a3afd6';ctx.beginPath();ctx.arc(W-14,11,5,0,7);ctx.fill();
  if(!Tracker.running){ctx.fillStyle='rgba(7,13,34,.65)';ctx.fillRect(0,H-26,W,26);ctx.fillStyle='#e9eefc';ctx.font='13px "Noto Sans SC",sans-serif';ctx.fillText(frame>100?'已暂停：可以逐帧查看每个识别框的编号和把握度':'点「播放」开始',10,H-9);}
  cb.onStats&&cb.onStats({truth,shown,fp,miss,switches,frame});}
 for(let i=0;i<90;i++){step();track();}draw();
 let acc=0,last=0;const loop=now=>{if(!Tracker.running)return;acc+=Math.min(0.1,(now-(last||now))/1000)*Tracker.speed;last=now;while(acc>=DT){acc-=DT;step();track();}draw();requestAnimationFrame(loop);};
 Tracker.toggle=()=>{Tracker.running=!Tracker.running;if(Tracker.running){last=0;requestAnimationFrame(loop);}else{draw();cb.onPause&&cb.onPause();}return Tracker.running;};
 Tracker.step=dir=>{if(Tracker.running)Tracker.toggle();if(dir>0){step();track();}else if(hist.length>2){hist.pop();const s=JSON.parse(hist[hist.length-1]);t=s.t;frame=s.frame;ents=s.ents;nextTrue=s.nextTrue;rs=s.rs;Object.assign(spawnT,s.spawnT);}draw();};
 Tracker.slow=()=>{Tracker.speed=Tracker.speed===1?0.3:1;return Tracker.speed!==1;};Tracker.redraw=draw;
 Tracker.stop=()=>{if(Tracker.running)Tracker.toggle();};};
L.onHide=()=>{if(window.Tracker&&Tracker.stop)Tracker.stop();};

L.score=lr=>{const rows=lr.rows||[],rc=lr.recog||[],tr=lr.track||{},ta=tr.answers||{},d=lr.diary||{},Q=lr.quiz||{},vw=lr.views||{};
 const qs=id=>Q[id]?(Q[id].ok?100:0):0,ts=id=>ta[id]?(ta[id].ok?100:0):0,tx=App.txtScore;const judged=rows.filter(r=>r.ok!=null);
 return {principle:Math.round(0.15*qs('q1')+0.15*qs('q2')+0.15*qs('q3')+(vw.px?10:0)+(vw.fm?10:0)+0.1*ts('t1')+0.25*tx(d.fast)),
  experiment:Math.round(25*Math.min(1,new Set(rc.map(r=>r.key)).size/3)+20*Math.min(1,rows.length/5)+25*Math.min(1,(lr.scans||[]).length/2)+15*(rows.length?judged.length/rows.length:0)+15*Math.min(1,Object.keys(tr.thr||{}).length/3)),
  critical:Math.round((judged.some(r=>r.ok===false)?20:0)+0.15*qs('q4')+0.1*ts('t2')+0.1*ts('t3')+0.1*ts('t4')+Math.min(15,((lr.scene||{}).answer||'').trim().length/40*15)+0.2*tx(d.wrong)),
  creative:tx(d.idea,40),prompt:null,
  ethics:Math.round(0.4*qs('q5')+0.3*tx(d.careful)+(d.pledge?30:0))};};
L.progress=lr=>{const m=[(lr.recog||[]).length>0,!!((lr.views||{}).fm),Object.keys((lr.track||{}).answers||{}).length>=4,(lr.rows||[]).filter(r=>r.ok!=null).length>=3,(lr.scans||[]).length>0,((lr.scene||{}).answer||'').trim().length>=8,Object.keys(lr.quiz||{}).length>=5,!!(lr.diary||{}).submitted];return m.filter(Boolean).length/m.length;};
L.quiz=QUIZ;L.condText=condText;
L.intro={q:'AI 从没见过这只猫的图，它能认出来吗？靠什么认？',opts:['能，它把所有猫的照片都存下来了', '能，它记住了猫的特征，拿来一一对照', '不能，没见过的图它都认不出'],img:'img/cat.jpg',alt:'一只橘色虎斑猫的照片（图库，公有领域）',back:'学完知识点一，看看 AI 记住的到底是什么。'};
L.flow=[
 {seg:'导入',from:'l1-intro'},
 {seg:'挑战一',kp:'知识点一 · 特征比对',learn:['照片在计算机里是像素，每个像素是 R、G、B 三个数字','AI 看过成千上万幅图像，记住物体的典型特征','把图中特征与记忆一一对照，给出最匹配的答案和把握度'],sum:['清晰的单个目标，AI 很快认对，把握度高','换角度或背景，关键特征还在，AI 依然能认出'],from:'l1-s1',to:'l1-s1'},
 {seg:'挑战二',kp:'知识点二 · 识别与追踪',learn:['识别视频：实时识别、记住目标位置、发现变化','追踪＝每一帧都检测＋把前后帧的同一目标连起来','阈值低容易误检，阈值高容易漏检'],sum:['红绿灯、近处汽车一直被框住，编号稳定','行人走到树后被挡住，再出现时换了编号（跟丢）'],from:'l1-s2',to:'l1-s2'},
 {seg:'挑战三',kp:'知识点三 · 误判的原因',learn:['AI 只能根据看到的表面特征判断','特征提取不准，就难以匹配出正确答案','个头小、颜色和背景相近、被遮挡的物体易被忽略'],sum:['干扰越强把握度越低，到某一级答案就变了','每次只改一个条件，才知道是谁让 AI 认错'],from:'l1-s3',to:'l1-s3'},
 {seg:'综合运用',from:'l1-s4'},
 {seg:'反思与总结',from:'l1-quizst'}
];
})();
