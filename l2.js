/* 第2讲 文生图工作室 (v3) — 一句诗变成画 / 提示词加料 / 画风大比拼 / AI 读懂诗了吗 / 找出 AI 标识 */
(function(){
const {$,$$,esc,clamp}=App;const K='l2';const L={};App.lessons[K]=L;
Object.assign(App.HINTS,{
 'l2-fix-bm':{s:['夜晚的书桌前，','一个学生','身边堆着'],ref:'夜晚的书桌前，一个学生借着台灯认真读书，身边堆着像小山一样高的书。'},
 'l2-fix-bs':{s:['大海上，','一个学生划着小船','船上放着'],ref:'望不到边的大海上，一个学生划着小船，船上放着书和一盏灯。他划得满头是汗，也没有停下。'},
 'l2-fix-pd':{s:['窗边的书桌前，','一个孩子','窗外的小溪'],ref:'窗边的书桌前，一个孩子翻开一本新书，眼睛亮亮的。窗外有一条小溪，清清的水不停地流进池塘。'}});
const STY={plain:'写实',ink:'中国画',oil:'油画',water:'水彩画'};
const FIELDS=[
 {k:'subject',n:'主体',d:'画什么（可以是诗句）',chips:['飞流直下三千尺','日照香炉生紫烟','遥看瀑布挂前川'],single:true,free:true},
 {k:'env',n:'环境',d:'在什么地方',chips:['高高的山峰','连绵的远山','山间云雾','青松翠柏']},
 {k:'detail',n:'细节',d:'让画面更具体',chips:['浮云作对比','湍急的水流','飞溅的水花','水面彩虹']},
 {k:'style',n:'风格',d:'用什么画法',chips:['写实','中国画','油画','水彩画'],single:true},
 {k:'comp',n:'构图',d:'怎么取景',chips:['远景全景','仰视角度','瀑布居中'],single:true},
 {k:'light',n:'光线与色彩',d:'什么时间、什么色调',chips:['阳光照射','清晨薄雾','夕阳暖色']}];
const COL={subject:'var(--ink)',env:'#2b8a3e',detail:'#1971c2',style:'#a66a00',comp:'#6741d9',light:'#c2410c'};
const POEMS=FIELDS[0].chips;
const MAP={'高高的山峰':'highpeak','连绵的远山':'mountain','山间云雾':'haze','青松翠柏':'pine','浮云作对比':'cloud','湍急的水流':'rush','飞溅的水花':'spray','水面彩虹':'rainbow','阳光照射':'sun','清晨薄雾':'haze','夕阳暖色':'warm'};
const STYLEMAP={'写实':'plain','中国画':'ink','油画':'oil','水彩画':'water'};
/* 构图：离线画师用取景框来实现（仰视 = 凑近瀑布往上看，居中 = 瀑布放大摆在正中）；远景全景就是默认取景 */
const COMP={'仰视角度':'up','瀑布居中':'center'};
const INERT=['写实','远景全景'];
function wmDraw(c){const x=c.getContext('2d'),k=c.width/640,t='AI 生成';x.save();x.setTransform(1,0,0,1,0,0);x.font=`600 ${Math.round(12*k)}px "Noto Sans SC",sans-serif`;const w=x.measureText(t).width+14*k;x.fillStyle='rgba(0,0,0,.55)';x.fillRect(c.width-w-8*k,c.height-26*k,w,20*k);x.fillStyle='#fff';x.textBaseline='middle';x.fillText(t,c.width-w-k,c.height-16*k);x.restore();}
function drawProc(c,spec,wm){if(!spec||!spec.comp){Painter.render(c,spec,0,wm===false?{wm:false}:{});return;}
 const src=Painter.canvas(c.width);Painter.render(src,spec,0,{wm:false});const x=c.getContext('2d');x.setTransform(1,0,0,1,0,0);
 const W=c.width,H=c.height,z=spec.comp==='up'?1.55:1.28,sw=W/z,sh=H/z,sx=(W-sw)/2,sy=spec.comp==='up'?H*0.16:Math.min(H-sh,H*0.2);
 x.clearRect(0,0,W,H);x.drawImage(src,sx,sy,sw,sh,0,0,W,H);if(wm!==false)wmDraw(c);}
function promptOf(p){const parts=[];FIELDS.forEach(f=>{const v=[...(p[f.k]||[])].concat(p[f.k+'_x']?[p[f.k+'_x']]:[]).filter(Boolean);if(v.length)parts.push({k:f.k,t:v.join('，')});});return parts;}
const promptText=p=>promptOf(p).map(x=>x.t).join('，');
function specOf(p){const el={};const all=FIELDS.flatMap(f=>[...(p[f.k]||[]),p[f.k+'_x']||'']).join('，');
  Object.entries(MAP).forEach(([w,e])=>{if(all.includes(w))el[e]=1;});Object.assign(el,Painter.parse(all));if((p.subject||[]).join('').includes('紫烟'))el.haze=1;
  const st=(p.style||[])[0];const sp={scene:'waterfall',el,style:STYLEMAP[st]||Painter.styleOf(all)||'plain'};const cp=COMP[(p.comp||[])[0]];if(cp)sp.comp=cp;return sp;}
App.showWork=function(box,w){box.innerHTML='';if(!w)return;
 if(w.kind==='svg'||w.kind==='img'){const im=new Image();im.src=w.kind==='svg'?App.AI.svgURL(w.svg):w.src;im.alt='AI 生成的画';box.appendChild(im);box.insertAdjacentHTML('beforeend','<span class="wm">AI 生成</span>');}
 else{const c=Painter.canvas(640);drawProc(c,w.spec);box.appendChild(c);}};
async function rasterize(w,width=640){const c=Painter.canvas(width);if(w.kind==='proc'){drawProc(c,w.spec);return c;}
 const im=await App.loadImg(w.kind==='svg'?App.AI.svgURL(w.svg):w.src).catch(()=>null);if(im){const x=c.getContext('2d');x.fillStyle='#000';x.fillRect(0,0,c.width,c.height);const s=Math.max(c.width/im.naturalWidth,c.height/im.naturalHeight);x.drawImage(im,(c.width-im.naturalWidth*s)/2,(c.height-im.naturalHeight*s)/2,im.naturalWidth*s,im.naturalHeight*s);}return c;}
App.thumbOf=async w=>{const c=await rasterize(w,240);try{return c.toDataURL('image/jpeg',0.72);}catch(e){return '';}};
App.rasterize=rasterize;
/* denoising preview: blur + noise blended towards the final image */
let NOISE=null;function noiseCanvas(w,h){if(NOISE&&NOISE.width===w)return NOISE;NOISE=document.createElement('canvas');NOISE.width=w;NOISE.height=h;const x=NOISE.getContext('2d'),id=x.createImageData(w,h);let s=11;for(let i=0;i<id.data.length;i+=4){s=(s*16807)%2147483647;const v=s%256;s=(s*16807)%2147483647;id.data[i]=v;id.data[i+1]=(v+s%60)%256;id.data[i+2]=(v+s%90)%256;id.data[i+3]=255;}x.putImageData(id,0,0);return NOISE;}
function denoiseFrame(dst,src,s){const x=dst.getContext('2d');x.save();x.filter=`blur(${(s*10).toFixed(1)}px)`;x.drawImage(src,0,0,dst.width,dst.height);x.restore();x.save();x.globalAlpha=Math.min(1,s*1.05);x.drawImage(noiseCanvas(dst.width,dst.height),0,0,dst.width,dst.height);x.restore();}

let ctl=null;
async function generate(p,busy){const txt=promptText(p);const style=STYLEMAP[(p.style||[])[0]]||'plain';
 if(App.AI.real()){busy.hidden=false;busy.innerHTML=`<div>AI 正在创作……<br><span id="g-prog"></span><br><button class="btn ghost sm" type="button" id="stopGen" style="margin-top:10px">停止</button></div>`;ctl=new AbortController();$('#stopGen',busy).onclick=()=>ctl.abort();
  try{const w=await App.AI.textToImage(txt,style,{signal:ctl.signal,onText:({text})=>{const n=(text.match(/</g)||[]).length;const g=$('#g-prog',busy);if(g)g.textContent=`已生成 ${n} 个图形元素`;}});busy.hidden=true;if(w)return Object.assign(w,{mode:App.AI.mode()});}
  catch(e){busy.hidden=true;App.AI.fail(e);if(e&&e.code==='cancelled')return null;App.toast(App.AI.errText(e));}}
 return {kind:'proc',spec:specOf(p),mode:'offline'};}

L.render=function(){const v=$('#v-l2');const col='style="display:flex;flex-direction:column;gap:14px"';
 const rows=FIELDS.slice(1).map(f=>[`<span style="color:${COL[f.k]}">${f.n.replace('与色彩','')}</span>`,f.chips.map(c=>`<button type="button" class="chip" data-f="${f.k}" data-c="${c}">${c}</button>`).join('')]);
 v.innerHTML=`${App.hero(K,'当一回 AI 画师的导演：提示词怎么写，它才画得出你心里的画？',['学会用古诗诗句让 AI 生成图像，并通过提示词丰富图像内容。','能用 AI 生成不同绘画形式的图像。','了解 AI 图像生成技术的局限性。'])}

 <div class="station" id="l2-s1">${App.head('EXP-01','挑战一 · 古诗绘成画','一句诗变成画','只给 AI 一句诗，看它画出什么')}
  <ol class="steps"><li>猜一猜，再画</li><li>和想象比一比</li></ol>
  <div class="grid2"><div class="canvas-wrap"><div class="svgbox" id="l2-view"></div><div class="busy" id="l2-busy" hidden></div></div>
   <div ${col}>${App.knobs([['诗句',App.seg('poem',POEMS.map(p=>[p,p]),POEMS[0])]])}
    <div class="go-row"><span style="font-weight:700">我猜 AI</span>${App.seg('g1',[['1','画得出瀑布'],['0','画不出瀑布']],'')}${App.go('l2-gen','让 AI 画')}</div>
    ${App.aiBox('l2-ai1','先猜一猜，再按「让 AI 画」')}<div id="l2-fb1"></div>
    <div class="after-run">${App.pad('这幅画和你读诗时想象的一样吗？','<div class="opts" id="l2-same"></div>')}</div></div></div>
  <details class="more"><summary>说明</summary><p class="note">生成时看到的“从噪点到画面”是去噪过程的示意动画。</p><div class="grid2">${App.know('AI 怎么学会画画','AI 学习了数以亿计的“图片＋文字说明”，掌握了画面内容和文字的对应关系。收到提示词后，它先理解我们的想法，再从学过的内容中找线索，创作出一幅新的作品——不是从网上找一张现成的图。')}
  ${App.know('从噪点到画面','现在常见的文生图 AI 多用“扩散模型”：先生成一张满是噪点的图，再按照提示词一步步去掉杂乱，每一步都让画面更像描述的样子，经过几十步计算得到最终的图。')}</div></details>
 </div>

 <div class="station" id="l2-s1b">${App.head('EXP-01b','挑战一 · 古诗绘成画','提示词加料','给提示词加 3 种料，让画更像你想的')}
  <ol class="steps"><li>加满 3 种料</li><li>选出最满意的</li></ol>
  <div class="grid2"><div ${col}><div class="canvas-wrap"><div class="svgbox" id="l2-view2"></div><div class="busy" id="l2-busy2" hidden></div></div>
    <div class="note" id="l2-cnt"></div><div class="prompt-line" id="l2-pl" aria-label="完整提示词"></div>
    <div class="after-run"><div class="strip" id="l2-strip" style="flex-wrap:wrap;overflow:visible"></div><div class="row"><button class="btn ghost sm" type="button" id="l2-star">★ 就选这幅</button><span class="note" id="l2-cap"></span></div><div class="row" id="l2-goals" style="gap:6px 14px;flex-wrap:wrap"></div></div></div>
   <div ${col}>${App.knobs(rows)}
    <div class="go-row">${App.go('l2-gen2','生成新一版')}</div>
    ${App.aiBox('l2-ai2','在黄面板里点几个词，再按「生成新一版」')}<div id="l2-fb2"></div>
    <div class="after-run">${App.pad('加哪种料，画面变化最大？','<div class="opts" id="l2-most"></div>')}</div></div></div>
  <details class="more"><summary>说明</summary><p class="note">诗句在上一站选。每次生成都存成一版，点小图可以回看。离线演示时，「写实」和「远景全景」就是默认画法，选了画面不会变。</p>${App.know('好提示词的结构','主体（画什么）＋环境（在哪里）＋细节（有什么）＋风格（怎么画）＋构图（怎么取景）＋光线色彩（什么氛围）。想体现“高高的山峰”，可以加浮云作对比；想体现“湍急的水流”，可以加飞溅的水花。描述越具体，画面越贴近要求。')}</details>
 </div>

 <div class="station" id="l2-s2">${App.head('EXP-02','挑战二 · 形式的变换','画风大比拼','同一句诗画三种画风，投出你的一票')}
  <ol class="steps"><li>生成三种画风</li><li>点画投票写理由</li></ol>
  <div class="go-row"><span style="font-weight:700">我猜最有诗意的是</span>${App.seg('g2',[['ink','中国画'],['oil','油画'],['water','水彩画']],'')}${App.go('l2-s2go','生成三种画风')}</div>
  ${App.aiBox('l2-ai3','三幅画会并排出现在这里','AI 画的三种画风')}<div id="l2-fb3"></div>
  <div class="after-run">${App.pad('<span id="l2-ask2">哪种画风最有这句诗的意境？为什么？</span>',`<div class="note" id="l2-voted">先在上面点一幅画，投它一票</div><textarea id="l2-reason" placeholder="这种画风的……让我感受到……" aria-label="我的理由"></textarea>`)}</div>
  <details class="more"><summary>说明</summary><p class="note">参考：教材第 17 页有同一句诗用四种画风生成的示例，课上可对照教材观察。</p>${App.think(['我们应该如何使用 AI 的“绘画魔法棒”？','如果只输入诗句、不指定绘画形式，AI 能自己选出合适的形式吗？'])}
  ${App.know('形式与意境','中国画淡淡的墨色、虚实相生的笔触，特别能表现古诗的意境；油画色彩浓郁厚重；水彩画柔和，却和“飞流直下三千尺”的磅礴气势有些冲突。AI 并不能真正理解诗句蕴含的情感，哪种形式更贴切，需要我们用心感受并作出选择。')}</details>
 </div>

 <div class="station" id="l2-s3">${App.head('EXP-03','挑战三 · 难解的意境','AI 读懂诗了吗','看画猜诗，抓住 AI 没读懂的地方')}
  <ol class="steps"><li>看画猜诗</li><li>三幅都猜对</li></ol>
  <div class="grid2"><div class="canvas-wrap"><div class="svgbox" id="l2-gv"></div><div class="busy" id="l2-gb" hidden></div></div>
   <div ${col}>${App.knobs([['哪幅画',App.seg('gi',GUESS.map((q,i)=>[q.id,'第 '+(i+1)+' 幅']),GUESS[0].id)],['我猜是',App.seg('gp',GOPTS.map((o,j)=>[j,o]),'')]])}
    <div class="go-row">${App.go('l2-rev','揭晓')}</div>
    ${App.aiBox('l2-ai4','猜猜 AI 画的是哪句诗')}<div id="l2-fb4"></div>
    <div class="after-run"><div id="l2-fixbox" hidden>${App.pad('补一句看得见的画面，把诗的真意说出来',`<div id="l2-fixslot"></div><div class="row"><button class="btn ghost sm" type="button" id="l2-redo" hidden>按我的提示重画</button></div>`)}</div></div></div></div>
  <details class="more"><summary>说明</summary><p class="note">这三幅是 AI 按字面意思画出来的。带有比喻、拟人等修辞或深层含义的诗句，AI 往往只按字面来画。「按我的提示重画」按钮只在平台接口或大模型模式下出现；离线演示时，把你写的画面说给同桌听。</p>${App.know('修辞是 AI 的“天然屏障”','AI 缺乏人的生活经历，也没有情感共鸣，无法像我们一样结合创作背景、诗人的心路历程和自己的体验去理解诗句。想让 AI 画出意境，要在诗句之外补充文字解释，描述色彩、构图和氛围。诗句的灵魂和深意，还需要我们自己领悟。')}</details>
 </div>

 <div class="station" id="l2-s4">${App.head('EXP-04','小贴士 · AI 水印与责任','找出 AI 标识','裁掉角标，还查得出这是 AI 画的吗')}
  <ol class="steps"><li>裁掉角标再查</li><li>答完 2 个问题</li></ol>
  <div class="grid2"><div class="canvas-wrap"><div class="svgbox" id="l2-lbview" style="transition:clip-path .45s"></div><i id="l2-ring" aria-hidden="true" style="position:absolute;right:.8%;bottom:1.2%;width:25%;height:17%;border:3px solid var(--sun);border-radius:14px;pointer-events:none"></i></div>
   <div ${col}>${App.knobs([['角标',App.seg('wm',[['1','留着'],['0','裁掉']],'1'),'黄圈里的“AI 生成”']])}
    <div class="go-row"><span style="font-weight:700">我猜裁掉后</span>${App.seg('g4',[['1','还查得出'],['0','查不出了']],'')}${App.go('l2-lb-im','查文件信息')}</div>
    ${App.aiBox('l2-ai5','文件里藏着什么？按大按钮查一查','文件信息')}<div id="l2-fb5"></div>
    <div class="after-run"><div id="l2-lbbox" hidden>${App.pad('','<div id="l2-lbq"></div>','观察任务')}</div></div></div></div>
  <details class="more"><summary>说明</summary><p class="note">我国《人工智能生成合成内容标识办法》自 2025 年 9 月 1 日起施行，要求对 AI 生成合成的内容进行标识。标识分两种：人能直接看到的“显式标识”，和写在文件信息里的“隐式标识”。</p></details>
 </div>

 <div class="station" id="l2-quizst">${App.head('QUIZ','反思与总结','小测验','5 道题，第一次作答计入能力图谱')}<div id="l2-quiz"></div></div>
 <div class="station" id="l2-diary"></div>`;
 if(!App.rec)return;wire();
};

const GUESS=[{id:'bm',scene:'bookmountain',lit:'我看到“书山”和“路”，就画了一座书堆成的山，山上有一条小路。',ans:0,meaning:'读书学习没有捷径，勤奋就是登上“书山”的那条路。'},{id:'bs',scene:'booksea',lit:'我看到“学海”和“舟”，就画了一片书页做的海，海上有一只小船。',ans:1,meaning:'知识像大海一样没有边际，要靠刻苦努力这条“船”不断前行。'},{id:'pd',scene:'pond',lit:'我看到“渠”“清”“活水”，就画了一方清清的池塘，有水流进来。',ans:2,meaning:'要不断学习新知识，思想才能保持清新活跃（朱熹《观书有感》）。'}];
const GOPTS=['书山有路勤为径','学海无涯苦作舟','问渠那得清如许？为有源头活水来','飞流直下三千尺'];
const QUIZ=[
 {id:'q1',q:'诗句“飞流直下三千尺”里没有“瀑布”两个字，AI 为什么能画出瀑布？',opts:['AI 会读心术','AI 学过大量图片和文字的对应关系，能从中找到线索','AI 从网上找了一张现成的瀑布照片'],a:1,why:'AI 从学过的“图文对应”中找到了线索，并创作新图。'},
 {id:'q2',q:'扩散模型是怎样“画”出一幅画的？',opts:['先画轮廓再涂色','从一张满是噪点的图开始，按提示词一步步去掉杂乱，让画面越来越清楚','把很多照片拼在一起'],a:1,why:'扩散模型经过几十步“去噪”得到最终图像。'},
 {id:'q3',q:'想让 AI 画出“高高的山峰”，哪一个提示词最好？',opts:['画山','好看一点','高高的山峰，山腰飘着浮云作对比，仰视角度'],a:2,why:'细节和构图越具体，画面越贴近想象。'},
 {id:'q4',q:'关于绘画形式，哪种说法是对的？',opts:['AI 总能自己选出最合适的形式','哪种形式更贴合诗意，需要人用心感受后作出选择','油画最适合画所有古诗'],a:1,why:'AI 不懂诗句的情感，选择要靠人。'},
 {id:'q5',q:'你用 AI 画了一幅画，想参加班级的绘画展，应该怎么做？',opts:['说是自己手绘的','主动说明这幅画是 AI 生成的，保留标识','把“AI 生成”标识裁掉'],a:1,why:'AI 生成合成内容要标识，分享时要主动说明。'}];

function wire(){const lr=App.lesson(K);lr.gens=lr.gens||[];lr.styles=lr.styles||{tried:[]};lr.styles.tried=lr.styles.tried||[];lr.guess=lr.guess||{};lr.label=lr.label||{};lr.label.q=lr.label.q||{};
 const s1=$('#l2-s1'),s1b=$('#l2-s1b'),s2=$('#l2-s2'),s3=$('#l2-s3'),s4=$('#l2-s4');
 const src=m=>m||'offline';
 const wait=(box,t)=>{App.aiSay(box,`<span style="color:var(--dim)">${t}</span>`,{mood:'idle'});$(box).classList.add('wait');};
 const choose=(root,opts,cur,fn)=>{root.innerHTML=opts.map((o,j)=>`<button type="button" class="chip ${cur===j?'on':''}" data-j="${j}">${o}</button>`).join('');$$('.chip',root).forEach(b=>b.onclick=()=>{$$('.chip',root).forEach(x=>x.classList.toggle('on',x===b));fn(+b.dataset.j);});};
 const segSet=(root,name,v)=>$$(`[data-seg="${name}"] .chip`,root).forEach(b=>b.classList.toggle('on',b.dataset.v===String(v)));
 const P={subject:[POEMS.includes(lr.poem)?lr.poem:POEMS[0]],env:['高高的山峰']};
 const workOf=x=>x.work||(x.spec?{kind:'proc',spec:x.spec}:{kind:'img',src:x.thumb});
 /* denoising preview */
 const DS=[1,.85,.7,.55,.4,.25,.1,0],DN=['1','6','12','18','24','30','36','40'].map(n=>'第'+n+'步');
 const dsHTML=()=>`<div class="dsteps" id="l2-dsteps">${DS.map((s,i)=>`<div><canvas width="160" height="100"></canvas><span>${DN[i]}</span></div>`).join('')}</div>`;
 const fillSteps=c=>{$$('#l2-dsteps canvas').forEach((x,i)=>denoiseFrame(x,c,DS[i]));};
 const play=async(c,view,n,strip)=>{const big=Painter.canvas(640);view.innerHTML='';view.appendChild(big);const cvs=strip?$$('#l2-dsteps canvas'):[];
   for(let i=0;i<=n;i++){const s=1-i/n;denoiseFrame(big,c,s);if(strip){const k=DS.findIndex(v=>Math.abs(v-s)<0.013);if(k>=0&&cvs[k])denoiseFrame(cvs[k],c,s);}await new Promise(r=>setTimeout(r,40));}};
 const save=async(p,w)=>{const parts=promptOf(p).filter(x=>x.k!=='subject');const rec={prompt:promptText(p),nf:parts.length,fields:parts.map(x=>FIELDS.find(f=>f.k===x.k).n).join('·'),kind:w.kind,mode:w.mode,thumb:await App.thumbOf(w)};
  if(w.kind==='proc')rec.spec=w.spec;else rec.work=w.kind==='svg'?{kind:'svg',svg:w.svg}:{kind:'img',src:w.src};
  lr.gens.push(rec);if(lr.gens.length>12){lr.gens.shift();if(lr.best&&lr.best.i!=null)lr.best.i--;}
  lr.gens.forEach((x,i)=>{if(i<lr.gens.length-4&&x.work&&x.work.kind==='svg'&&!(lr.best&&lr.best.i===i))delete x.work;});App.touch();return rec;};
 const stopped=(ai,fb,b)=>{App.busy(b,false);wait(ai,'已停止，再按一次大按钮');App.fb(fb,'try','这次停下了','再按一次大按钮，让 AI 重新画。');};

 /* ---- 实验 1 · 一句诗变成画 ---- */
 let g1=null;segSet(s1,'poem',P.subject[0]);
 App.segWire(s1,'poem',v=>{lr.poem=v;P.subject=[v];sync();App.touch();});
 App.segWire(s1,'g1',v=>{g1=v==='1';});
 $('#l2-gen').onclick=async()=>{const b=$('#l2-gen'),poem=P.subject[0],p={subject:[poem]};App.busy(b,true,'AI 正在画…');App.aiSay('#l2-ai1',`<div class="big">从一团噪点画起</div>${dsHTML()}`,{busy:true});
  const w=await generate(p,$('#l2-busy'));if(!w){stopped('#l2-ai1','#l2-fb1',b);return;}
  const c=await rasterize(w);await play(c,$('#l2-view'),40,true);App.showWork($('#l2-view'),w);await save(p,w);
  App.aiSay('#l2-ai1',`<div class="big">画好了：${esc(poem)}</div>${dsHTML()}<p class="note">第 1 步到第 40 步，每一步去掉一点噪点。</p>`,{mood:'happy',src:src(w.mode)});fillSteps(c);
  App.markStep(s1,0);const why=poem.includes('瀑布')?'诗里有“瀑布”，AI 照着画了出来。':'诗里没有“瀑布”两个字，AI 是从学过的图文里找到线索的。';const nx=' 在下面记一笔：和你想的一样吗？',st=g1==null?1:2;
  if(w.mode!=='offline')App.fb('#l2-fb1','find','画好了！仔细看，画里有瀑布吗？','和你猜的一样吗？AI 靠学过的“图文对应”找线索。'+nx,{stars:st});
  else if(poem===POEMS[1])App.fb('#l2-fb1','find','AI 画出了阳光、山峰和云烟','这句诗没写瀑布。离线演示的画师只会画瀑布风景，所以瀑布还在。'+nx,{stars:st});
  else if(g1==null)App.fb('#l2-fb1','find','AI 画出瀑布了！',why+nx,{stars:st});
  else if(g1)App.fb('#l2-fb1','ok','猜对了，AI 画出了瀑布！',why+nx,{stars:st});
  else App.fb('#l2-fb1','find','它画出来了，和你猜的不一样',why+nx,{stars:st});
  App.busy(b,false);view2(lr.gens.length-1);labelView();};
 choose($('#l2-same'),['一模一样','差不多','不太一样'],lr.same,j=>{lr.same=j;App.markStep(s1,1);App.touch();
  App.fb('#l2-fb1','find','记下了！',j===0?'真巧！换个人读这句诗，想到的画面可能就不同。去下一站加料试试。':'只有一句诗，AI 只能画个大概。去下一站给提示词加料。',{stars:3});});
 if(lr.same!=null)App.markStep(s1,1);
 if(lr.gens.length){let i0=lr.gens.length-1;for(let i=i0;i>=0;i--)if(!lr.gens[i].nf){i0=i;break;}App.showWork($('#l2-view'),workOf(lr.gens[i0]));App.markStep(s1,0);App.ran(s1);}
 else{const c=Painter.canvas(640);denoiseFrame(c,Painter.canvas(640),1);$('#l2-view').appendChild(c);}

 /* ---- 实验 1b · 提示词加料 ---- */
 const sync=()=>{$$('[data-f]',s1b).forEach(b=>b.classList.toggle('on',(P[b.dataset.f]||[]).includes(b.dataset.c)));
   $('#l2-pl').innerHTML=promptOf(P).map(x=>`<span class="seg" style="color:${COL[x.k]}">${esc(x.t)}</span>`).join('<span style="color:var(--dim)">，</span>');
   const n=promptOf(P).length-1;$('#l2-cnt').innerHTML=`给 AI 的提示词 · <b style="color:${n>=3?'var(--mint-d)':'var(--ink)'}">已加 ${n} 种料</b>${n>=3?'，够了！按「生成新一版」':`，再加 ${3-n} 种拿 3 颗星`}`;};
 $$('[data-f]',s1b).forEach(b=>b.onclick=()=>{const f=FIELDS.find(x=>x.k===b.dataset.f),cur=P[f.k]||[],c=b.dataset.c;
   P[f.k]=f.single?(cur.includes(c)?[]:[c]):(cur.includes(c)?cur.filter(x=>x!==c):[...cur,c]);sync();});
 sync();
 let viewing=null;
 const strip=()=>{const st=$('#l2-strip');st.innerHTML=lr.gens.map((x,i)=>`<div class="ver ${i===viewing?'on':''}" data-i="${i}" style="width:128px" title="${esc(x.prompt||'')}"><div class="th"><img src="${x.thumb}" alt="第 ${i+1} 版"></div><p>${lr.best&&lr.best.i===i?'★ ':''}第 ${i+1} 版 · ${x.nf?x.nf+' 种料':'只有诗句'}</p></div>`).join('');
   $$('.ver',st).forEach(d=>d.onclick=()=>view2(+d.dataset.i));
   const mx=lr.gens.reduce((m,x)=>Math.max(m,x.nf||0),0);$('#l2-goals').innerHTML='<b class="note">小挑战</b>'+[['加满 3 种料',mx>=3],['5 种料全用上',mx>=5],['画出 4 个版本',lr.gens.length>=4]].map(([t,ok])=>`<span class="note" style="font-weight:700;color:${ok?'var(--mint-d)':'var(--muted)'}">${ok?'✓':'○'} ${t}</span>`).join('');
   if(lr.gens.some(x=>(x.nf||0)>=3))App.markStep(s1b,0);if(lr.best)App.markStep(s1b,1);};
 const view2=i=>{if(!lr.gens[i])return;viewing=i;App.showWork($('#l2-view2'),workOf(lr.gens[i]));$('#l2-cap').textContent=`正在看第 ${i+1} 版`+(lr.best&&lr.best.i===i?'（已选）':'');strip();};
 const fig=(x,t)=>`<figure style="margin:0"><img src="${x.thumb}" alt="${t}" style="width:100%;border-radius:10px;display:block"><figcaption class="note">${t} · ${esc(x.fields||'只有诗句')}</figcaption></figure>`;
 $('#l2-gen2').onclick=async()=>{const b=$('#l2-gen2');App.busy(b,true,'AI 正在画…');App.aiSay('#l2-ai2','正在按新的提示词一步步去噪……',{busy:true});
  const prev=lr.gens[lr.gens.length-1];const words=x=>(x&&x.prompt||'').split('，').slice(1);
  if(prev&&!App.AI.real()&&prev.prompt===promptText(P)){wait('#l2-ai2','提示词和上一版一模一样');App.fb('#l2-fb2','try','提示词没变，画也不会变','在黄面板里点几个新词，或者去掉几个，再生成。');App.busy(b,false);return;}
  const w=await generate(P,$('#l2-busy2'));if(!w){stopped('#l2-ai2','#l2-fb2',b);return;}
  const c=await rasterize(w);await play(c,$('#l2-view2'),20,false);const rec=await save(P,w);const n=lr.gens.length,nf=rec.nf,off=w.mode==='offline';
  const add=words(rec).filter(t=>!words(prev).includes(t)),cut=words(prev).filter(t=>!words(rec).includes(t)),same=prev&&prev.prompt===rec.prompt;
  const hl=a=>a.map(t=>`<b>${esc(t)}</b>`).join('、');const diff=!prev?'':same?'提示词和上一版一样':[add.length?'这次新加：'+hl(add):'',cut.length?'去掉了：'+hl(cut):''].filter(Boolean).join('；');
  if(prev)lr.cmp=true;App.touch();
  App.aiSay('#l2-ai2',`<div class="big">第 ${n} 版：加了 ${nf} 种料</div>${diff?`<p>${diff}</p>`:''}${prev?`<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:8px">${fig(prev,'上一版')}${fig(rec,'这一版')}</div>`:`<p class="note">提示词：${esc(rec.prompt)}</p>`}`,{mood:nf?'happy':'think',src:src(w.mode)});
  const seen=add.filter(t=>!(off&&INERT.includes(t))),dull=off?add.filter(t=>INERT.includes(t)):[];
  const look=same?'同一句提示词，AI 又画了一幅。和上一版一样吗？':!prev?'':!off?(add.length?`对照两幅画：「${add.join('、')}」，AI 都画出来了吗？`:'对照两幅画：哪里变了？'):
    (seen.length?`对照两幅画，找一找：「${seen.join('、')}」画在哪里？`:cut.length&&!add.length?'对照两幅画：少了什么？':'')+(dull.length?`「${dull.join('、')}」是离线画师默认的画法，所以看不出变化。`:'');
  if(nf>=3)App.fb('#l2-fb2','ok',`加满 ${nf} 种料了！`,look+' 满意就点小图下面的「就选这幅」。',{stars:3});
  else if(nf)App.fb('#l2-fb2','try',`加了 ${nf} 种料，还能更具体`,look+` 在黄面板里再加 ${3-nf} 种料，拿 3 颗星。`,{stars:2});
  else App.fb('#l2-fb2','try','这一版只有诗句','在黄面板里点几个词，再生成一版。',{stars:1});
  App.busy(b,false);view2(n-1);labelView();};
 $('#l2-star').onclick=()=>{if(viewing==null||!lr.gens[viewing])return;const x=lr.gens[viewing];lr.best={i:viewing,prompt:x.prompt,thumb:x.thumb,work:workOf(x),spec:x.spec};App.touch();view2(viewing);labelView();
  App.fb('#l2-fb2','ok','选好了！这是你最满意的一幅','它会出现在成长日记里，第 3 讲还能让它动起来。');};
 choose($('#l2-most'),FIELDS.slice(1).map(f=>f.n),lr.most,j=>{lr.most=j;App.touch();
  App.fb('#l2-fb2','find',`记下了：你觉得「${FIELDS[j+1].n}」变化最大`,'这里没有标准答案。换别的料再画一版，看看想法会不会变。');});
 if(lr.gens.length){view2(lr.best&&lr.gens[lr.best.i]?lr.best.i:lr.gens.length-1);if(lr.best||lr.gens.length>1||lr.gens.some(x=>x.nf))App.ran(s1b);}
 else App.showWork($('#l2-view2'),{kind:'proc',spec:specOf({subject:P.subject})});

 /* ---- 实验 2 · 画风大比拼 ---- */
 const cur=()=>(lr.best?lr.best.prompt:lr.gens.length?lr.gens[lr.gens.length-1].prompt:'飞流直下三千尺').split('，').filter(t=>!(t in STYLEMAP)).join('，');
 const baseSpec=()=>lr.best&&lr.best.spec?lr.best.spec:lr.gens.length&&lr.gens[lr.gens.length-1].spec?lr.gens[lr.gens.length-1].spec:specOf({subject:['飞流直下三千尺'],env:['高高的山峰'],detail:['浮云作对比','飞溅的水花']});
 const S3=[['ink','中国画','墨色浓淡、留白、意境'],['oil','油画','色彩浓郁、笔触厚重'],['water','水彩画','透明柔和、轻盈明快']];
 const poemOf=()=>(lr.styles.prompt||cur()).split('，')[0];
 const paintVote=()=>{const v=lr.styles.vote;$$('[data-pv]',s2).forEach(b=>{const on=b.dataset.pv===v;b.classList.toggle('ghost',!on);b.textContent=on?'✓ 我投它':'投它一票';const cw=$('.canvas-wrap',b.parentElement);if(cw)cw.style.outline=on?'4px solid var(--sky)':'';});
   $('#l2-voted').innerHTML=v?`你投给了 <b style="color:var(--ink)">${STY[v]}</b>。写下理由：`:'先在上面点一幅画，投它一票';$('#l2-ask2').textContent=`哪种画风最有“${poemOf()}”的意境？为什么？`;};
 const s2show=()=>{const pr=lr.styles.prompt||cur();App.aiSay('#l2-ai3',`<div class="grid3">${S3.map(([s,n,d])=>`<div style="display:flex;flex-direction:column;gap:6px"><div class="canvas-wrap" data-pvi="${s}" style="cursor:pointer"><div class="svgbox" id="l2-t-${s}"></div></div><b>${n}</b><span class="note">${d}</span><button type="button" class="btn ghost sm" data-pv="${s}">投它一票</button></div>`).join('')}</div><p class="note">三幅画用的是同一句提示词：${esc(pr)}，再加上画风的名字。</p>`,{mood:'happy',src:src(lr.styles.mode)});
   S3.forEach(([s])=>{const w=(lr.styles.works||{})[s];if(w)App.showWork($('#l2-t-'+s),w);});
   const cast=v=>{lr.styles.vote=v;App.touch();s2done=reasoned();paintVote();voteFb();};
   $$('[data-pv]',s2).forEach(b=>b.onclick=()=>cast(b.dataset.pv));$$('[data-pvi]',s2).forEach(d=>d.onclick=()=>cast(d.dataset.pvi));paintVote();};
 App.segWire(s2,'g2',v=>{lr.styles.guess=v;});if(lr.styles.guess)segSet(s2,'g2',lr.styles.guess);
 $('#l2-s2go').onclick=async()=>{const b=$('#l2-s2go');App.busy(b,true,'AI 正在画…');const works={},pr=cur();let mode='offline';
  for(const [s,n] of S3){let w=null;App.aiSay('#l2-ai3',`正在画${n}……`,{busy:true});
   if(App.AI.real()){try{w=await App.AI.textToImage(pr+'，'+n,s);if(w)mode=App.AI.mode();}catch(e){App.AI.fail(e);}}
   if(!w)w={kind:'proc',spec:Object.assign({},baseSpec(),{style:s})};works[s]=w.kind==='proc'?w:w.kind==='svg'?{kind:'svg',svg:w.svg}:{kind:'img',src:w.src};if(!lr.styles.tried.includes(s))lr.styles.tried.push(s);}
  lr.styles.works=works;lr.styles.mode=mode;lr.styles.prompt=pr;s2show();App.markStep(s2,0);App.touch();App.busy(b,false);
  App.fb('#l2-fb3','find','三幅画好了，哪幅最有诗意？','同一句诗，画风一换，感觉就不一样。点你最喜欢的那幅，投它一票。',{stars:1});};
 const VT={ink:'中国画用墨色和留白来表现意境。',oil:'油画色彩浓郁、笔触厚重。',water:'水彩画透明柔和。'};
 const reasoned=()=>(lr.styles.reason||'').trim().length>=10;let s2done=!!lr.styles.vote&&reasoned();
 const voteFb=()=>{const v=lr.styles.vote,g=lr.styles.guess,done=reasoned();if(done)App.markStep(s2,1);
   App.fb('#l2-fb3','ok',done?`理由写好了，你选「${STY[v]}」`:`你投给了「${STY[v]}」`,(g?(g===v?'和你一开始猜的一样。':'看完画，你改了主意。'):'')+VT[v]+(done?'选哪种没有标准答案，说得出理由就好。AI 不懂诗里的情感，这个选择要靠人。':'它和这句诗的气势合拍吗？在下面写下你的理由。'),{stars:done?3:2});};
 const rs=$('#l2-reason');rs.value=lr.styles.reason||'';let rt;rs.oninput=()=>{lr.styles.reason=rs.value;clearTimeout(rt);rt=setTimeout(()=>{App.touch();if(lr.styles.vote&&reasoned()&&!s2done){s2done=true;voteFb();}},700);};
 if(lr.styles.tried.length>=3&&lr.styles.works){s2show();App.markStep(s2,0);App.ran(s2);if(s2done)App.markStep(s2,1);}

 /* ---- 实验 3 · AI 读懂诗了吗 ---- */
 const G=lr.guess;const solved=q=>!!(G[q.id]&&G[q.id].last===q.ans);
 let gi=(GUESS.find(q=>!solved(q))||GUESS[0]).id,gp=null;const gq=()=>GUESS.find(q=>q.id===gi);
 const s3stars=()=>{const n=GUESS.filter(solved).length,f=GUESS.filter(q=>G[q.id]&&G[q.id].first===q.ans).length;return n>=3?(f>=3?3:2):1;};
 const reveal=q=>{App.aiSay('#l2-ai4',`<div class="big">${GOPTS[q.ans]}</div>${q.lit}`,{mood:'oops',src:'offline'});$('#l2-fixbox').hidden=false;$('#l2-redo').hidden=!App.AI.real();};
 const tick=()=>$$('[data-seg="gi"] .chip',s3).forEach((b,i)=>{b.textContent='第 '+(i+1)+' 幅'+(solved(GUESS[i])?' ✓':'');});
 const PH={bm:'例如：夜晚的书桌前，一个学生……',bs:'例如：大海上，一个学生划着小船……',pd:'例如：窗边的书桌前，一个孩子……'};
 let fx=null,ft;const fxSaid={};
 const mkFix=q=>{$('#l2-fixslot').innerHTML=`<textarea id="l2-fix-${q.id}" placeholder="${PH[q.id]}" aria-label="补充画面"></textarea>`;fx=$('#l2-fix-'+q.id);fx.value=(G[q.id]||{}).fix||'';
   fx.oninput=()=>{const id=q.id,el=fx;G[id]=G[id]||{};G[id].fix=el.value;clearTimeout(ft);ft=setTimeout(()=>{App.touch();
    if(el.value.trim().length>=10&&!fxSaid[id]){fxSaid[id]=1;App.fb('#l2-fb4','ok','你把诗意写成了画面！',App.AI.real()?'点「按我的提示重画」，看 AI 这次画得怎么样。':'说给同桌听，看他能不能想出这幅画。');}},700);};};
 const showPic=()=>{const q=gq(),box=$('#l2-gv');box.innerHTML='';const c=Painter.canvas(640);Painter.render(c,{scene:q.scene,el:{},style:'plain'});box.appendChild(c);
   gp=null;segSet(s3,'gp','');$('#l2-fb4').innerHTML='';mkFix(q);tick();
   if(solved(q))reveal(q);else{wait('#l2-ai4','猜猜 AI 画的是哪句诗');$('#l2-fixbox').hidden=true;}};
 App.segWire(s3,'gi',v=>{gi=v;showPic();});App.segWire(s3,'gp',v=>{gp=+v;});
 $('#l2-rev').onclick=()=>{const q=gq();if(gp==null){App.fb('#l2-fb4','try','先猜一句诗','在黄面板「我猜是」里点一句，再按「揭晓」。');return;}
  G[q.id]=G[q.id]||{first:gp,ok:gp===q.ans};G[q.id].last=gp;App.touch();
  if(gp===q.ans){reveal(q);tick();App.markStep(s3,0);const left=GUESS.filter(x=>!solved(x)).length,nxt=GUESS.findIndex(x=>!solved(x));if(!left)App.markStep(s3,1);
   App.fb('#l2-fb4','oops','猜对了！可 AI 只画了字面',`真意：${q.meaning}${left?` 还剩 ${left} 幅，点黄面板里的「第 ${nxt+1} 幅」接着猜。`:' 三幅全猜对了！'}`,{stars:s3stars()});}
  else App.fb('#l2-fb4','try','不是这一句','再看看：画面和哪句诗的字面对得上？');};
 $('#l2-redo').onclick=async()=>{const q=gq(),t=fx.value.trim();if(t.length<4){App.fb('#l2-fb4','try','先写一句画面','写出看得见的东西：谁、在哪里、在做什么。');return;}
  if(!App.AI.real()){$('#l2-redo').hidden=true;App.fb('#l2-fb4','find','现在是离线演示，AI 不能重画','把你写的画面说给同桌听，看他能不能想出这幅画。');return;}
  const bz=$('#l2-gb');bz.hidden=false;bz.textContent='AI 正在按你的提示重画…';
  try{const w=await App.AI.textToImage(GOPTS[q.ans]+'。画面说明：'+t,'plain');if(w){App.showWork($('#l2-gv'),w);G[q.id].redone=true;App.touch();
    App.aiSay('#l2-ai4',`<div class="big">按你的提示重画了</div>${esc(t)}`,{mood:'happy',src:App.AI.mode()});App.fb('#l2-fb4','ok','重画好了！更接近诗意了吗？','对照你写的那句话：AI 画出来了吗？没画出来就再改一改。');}}
  catch(e){App.AI.fail(e);App.fb('#l2-fb4','try','这次没画成',esc(App.AI.errText(e)));}bz.hidden=true;};
 segSet(s3,'gi',gi);showPic();
 if(GUESS.some(solved))App.markStep(s3,0);if(GUESS.every(solved))App.markStep(s3,1);if(Object.keys(G).length)App.ran(s3);

 /* ---- 实验 4 · 找出 AI 标识 ---- */
 let ex=true,g4=null;
 const labelView=()=>{const w=lr.best?lr.best.work:{kind:'proc',spec:baseSpec()},box=$('#l2-lbview');App.showWork(box,w);
   if(w.kind==='proc'){drawProc($('canvas',box),w.spec,false);box.insertAdjacentHTML('beforeend','<span class="wm">AI 生成</span>');}
   const wm=$('.wm',box);if(wm)wm.style.cssText='font-size:14px;padding:4px 12px;right:3.5%;bottom:5%';
   box.style.clipPath=ex?'inset(0)':'inset(0 0 19% 0)';$('#l2-ring').hidden=!ex;};labelView();
 App.segWire(s4,'wm',v=>{ex=v==='1';labelView();lr.label.ex=true;App.touch();if(!ex)App.toast('角标裁掉了。猜一猜，再按「查文件信息」');});
 App.segWire(s4,'g4',v=>{g4=v==='1';});
 const LQ=[{id:'lq1',q:'画面右下角的“AI 生成”角标属于哪种标识？',opts:['显式标识','隐式标识'],a:0,why:'人能直接看到的是显式标识。'},{id:'lq2',q:'朋友转发时裁掉了角标，别人还有办法知道它是 AI 生成的吗？',opts:['没有任何办法','可以读取文件里的隐式标识'],a:1,why:'文件信息里还写着隐式标识。'}];
 const A=lr.label.q;const lqAll=()=>LQ.every(q=>A[q.id]);let lqSaid=lqAll();
 const lqDone=()=>{if(!lqAll())return;App.markStep(s4,1);if(lqSaid)return;lqSaid=true;const ok=LQ.filter(q=>A[q.id].ok).length;
   App.fb('#l2-fb5',ok>=2?'ok':'try',ok>=2?'两种标识都认出来了！':`2 个问题答完，第一次答对 ${ok} 个`,'显式标识看得见，隐式标识藏在文件里。截图、转存可能把文件信息弄丢，所以分享 AI 画的画，要留着标识并主动说明。',{stars:ok>=2?3:2});};
 const ask=()=>App.askSeq($('#l2-lbq'),LQ,A,lqDone);ask();
 const openQ=()=>{$('#l2-lbbox').hidden=!(lr.label.cut||lqAll());};openQ();
 $('#l2-lb-im').onclick=()=>{const now=new Date();const rows=[['内容属性','AI 生成合成内容'],['内容类型','图片'],['生成方式','文生图'],['服务提供者','AI 小实验室（教学平台）'],['生成模式',(m=>(App.AI.NAMES||{})[m]||m)((lr.best&&lr.gens[lr.best.i]&&lr.gens[lr.best.i].mode)||'offline')],['生成时间',now.toLocaleString('zh-CN')],['内容编号',(App.rec?App.rec.id:'demo')+'-'+(lr.best?('V'+(lr.best.i+1)):'示例')],['提示词',lr.best?lr.best.prompt:'飞流直下三千尺']];
  const cut=!ex;App.aiSay('#l2-ai5',`<div class="big">文件里写着：AI 生成合成内容</div><div class="meta">${rows.map(r=>esc(r[0]+'：'+r[1])).join('\n')}</div><p>眼睛看得见的角标，叫<b>显式标识</b>；写在文件信息里、眼睛看不见的，叫<b>隐式标识</b>。</p>`,{mood:'think'});
  lr.label.im=true;if(cut){lr.label.cut=true;App.markStep(s4,0);}App.touch();openQ();
  const t='文件信息里还写着“AI 生成合成内容”。回答下面 2 个问题。';
  if(!cut)App.fb('#l2-fb5','find','角标还在，文件里也有记号','现在一眼就看得出是 AI 画的。点黄面板里的「裁掉」，再查一次。',{stars:1});
  else if(g4==null)App.fb('#l2-fb5','find','角标裁掉了，还是查得出',t,{stars:2});
  else if(g4)App.fb('#l2-fb5','ok','猜对了！裁掉角标也查得出',t,{stars:2});
  else App.fb('#l2-fb5','find','查出来了！和你猜的不一样',t,{stars:2});};
 if(lr.label.im)App.ran(s4);if(lr.label.cut||lqAll())App.markStep(s4,0);if(lqAll())App.markStep(s4,1);

 App.quiz($('#l2-quiz'),K,QUIZ);
 const rd=App.diary($('#l2-diary'),K,{title:'我的第一幅 AI 画',lead:'记下最满意的作品和创作思路',
  fields:[{id:'why',q:'你为什么选这句诗？你的提示词每一栏是怎么想的？',ph:'我选这句诗，是因为……；在“细节”一栏我加了……，是为了……'},{id:'better',q:'哪些情况下 AI 表达得好？哪些情况下没有表达出诗句的确切含义？',ph:'像“飞流直下三千尺”这样……；但是“书山有路勤为径”……'},{id:'how',q:'如果要让 AI 生成的画面更贴近你的想法，应该怎么做？',ph:'我会……'},{id:'next',q:'你还想用 AI 创作什么主题的画？分享时你会怎么说明？',ph:'我想画……；分享时我会说明……'}],
  pledge:'分享含有 AI 生成内容的作品时，我会保留标识并主动说明。',
  extras:ex=>{const b=App.lesson(K).best;ex.innerHTML=b?`<img src="${b.thumb}" alt="我最满意的 AI 画" style="width:100%;border-radius:8px"><p class="note" style="margin-top:6px">提示词：${esc(b.prompt)}</p>`:'<p class="note">在「提示词加料」里点「就选这幅」，作品会出现在这里。</p>';}});
 App.on(()=>{if(App.current==='l2')rd();});
}

L.score=lr=>{const gens=lr.gens||[],st=lr.styles||{},G=lr.guess||{},d=lr.diary||{},Q=lr.quiz||{},lb=lr.label||{},tx=App.txtScore;const qs=id=>Q[id]?(Q[id].ok?100:0):0;
 const maxF=gens.reduce((m,x)=>Math.max(m,x.nf||0),0);const gOk=GUESS.filter(q=>G[q.id]&&G[q.id].first===q.ans).length,fixes=GUESS.filter(q=>((G[q.id]||{}).fix||'').trim().length>=10).length;const lq=lb.q||{};
 return {prompt:Math.round(45*Math.min(1,maxF/4)+20*Math.min(1,gens.length/3)+15*(lr.cmp?1:0)+0.2*qs('q3')),
  creative:Math.round(25*(lr.best?1:0)+20*Math.min(1,(st.tried||[]).length/3)+0.3*tx(st.reason)+0.25*tx(d.why)),
  critical:Math.round(40*gOk/3+30*Math.min(1,fixes/2)+0.3*tx(d.better)),
  principle:Math.round(0.3*qs('q1')+0.3*qs('q2')+0.15*qs('q4')+0.25*tx(d.how)),
  experiment:Math.round(45*Math.min(1,gens.length/4)+25*Math.min(1,(st.tried||[]).length/3)+15*(st.vote?1:0)+15*(lr.cmp?1:0)),
  ethics:Math.round(0.35*qs('q5')+(lb.im?15:0)+(lq.lq1&&lq.lq1.ok?10:0)+(lq.lq2&&lq.lq2.ok?10:0)+(d.pledge?20:0)+0.1*tx(d.next))};};
L.progress=lr=>{const G=lr.guess||{};const m=[(lr.gens||[]).length>=1,(lr.gens||[]).some(x=>(x.nf||0)>=3),!!lr.best,((lr.styles||{}).tried||[]).length>=3,!!(lr.styles||{}).vote,GUESS.every(q=>G[q.id]&&G[q.id].last===q.ans),Object.keys((lr.label||{}).q||{}).length>=2,Object.keys(lr.quiz||{}).length>=5,!!(lr.diary||{}).submitted];return m.filter(Boolean).length/m.length;};
L.quiz=QUIZ;
L.intro={q:'只输入一句诗“飞流直下三千尺”，AI 画出来会是什么样？',opts:['和诗的意境一模一样', '能画出瀑布，但不一定画出“三千尺”的气势和意境', '什么也画不出来'],back:'学完本课，用你在提示词工作台里的作品来检验。'};
L.flow=[
 {seg:'导入',from:'l2-intro'},
 {seg:'挑战一',kp:'知识点一 · AI 怎样把文字变成画',learn:['AI 学过海量图文配对，记住文字和画面的对应','收到提示词：理解想法 → 找线索 → 创作新图','细节越具体，画面越贴近我们的要求'],sum:['只输入诗句，第一幅画比较简单','补充山峰、浮云、水花等细节后，画面更贴近想象'],from:'l2-s1',to:'l2-s1'},
 {seg:'挑战二',kp:'知识点二 · 绘画形式要贴合诗的情感',learn:['中国画、油画、水彩画给人的感受各不相同','看形式的感受是否和诗句的情感基调一致','AI 能变换形式，但不懂情感，选择要靠人'],sum:['中国画的墨色和留白，最能表现诗的气势和意境','水彩柔和，和“飞流直下三千尺”的磅礴有点冲突'],from:'l2-s2',to:'l2-s2'},
 {seg:'挑战三',kp:'知识点三 · AI 读不懂修辞和深意',learn:['比喻、拟人和深层含义，意思不在字面上','AI 缺乏生活经历和情感共鸣，往往只按字面画','人先读懂诗意，再补充解释、描述画面'],sum:['AI 画出了书山、学海，却没画出勤奋和刻苦','把意思写成看得见的画面，重画更接近诗意'],from:'l2-s3',to:'l2-s3'},
 {seg:'综合运用',from:'l2-s4'},
 {seg:'反思与总结',from:'l2-quizst'}
];
})();
