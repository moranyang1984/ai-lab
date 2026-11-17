/* 第3讲 视频工作室 (v3) — 帧率实验 / 让画动起来 / 诗句电影棚 / 导演审片（含谁说了算） */
(function(){
const {$,$$,esc,clamp}=App;const K='l3';const L={};App.lessons[K]=L;
const PRESETS=[{id:'p1',name:'瀑布 · 中国画',work:{kind:'proc',spec:{scene:'waterfall',el:{highpeak:1,cloud:1,spray:1,pine:1},style:'ink'}}},
 {id:'p2',name:'瀑布 · 水彩画',work:{kind:'proc',spec:{scene:'waterfall',el:{mountain:1,cloud:1,spray:1,sun:1,rainbow:1},style:'water'}}},
 {id:'p3',name:'春江明月',work:{kind:'proc',spec:{scene:'chunjiang',el:{flowers:1,shimmer:1},style:'plain'}}}];
const SHOTS=[['far','远景'],['full','全景'],['mid','中景'],['close','近景'],['xclose','特写']];
const MOVES=[['fix','固定'],['push','推'],['pull','拉'],['pan','摇'],['truck','移']];
const ELS=[['moonrise','月亮缓缓升起'],['shimmer','波光粼粼'],['flowers','岸边花林']];
const POEM='春江潮水连海平，海上明月共潮生';
const loops=new Map();const stopIn=box=>{const s=loops.get(box);if(s){s();loops.delete(box);}};
/* render a scene through a virtual camera */
function camSpec(cam){const el={};(cam.els||[]).forEach(k=>el[k]=1);if(cam.shot==='far')el.far=1;return {scene:'chunjiang',el,style:cam.style||'plain',speed:cam.slow?0.35:1,move:{water:true,light:true,pine:true}};}
function camView(cam,t,spec){const per=8/(cam.slow?0.6:1),u=(t%per)/per;let z={far:1,full:1,mid:1.5,close:2.2,xclose:3.4}[cam.shot]||1;let cx=320,cy=200;
 if(cam.shot==='close'||cam.shot==='xclose'||cam.shot==='mid'){const far=!!spec.el.far;cx=far?430:400;cy=spec.el.moonrise?Math.max(120,240-u*150):(far?110:120);if(cam.shot==='mid'){cx=360;cy=170;}}
 if(cam.move==='push')z*=1+0.7*u;if(cam.move==='pull')z*=1.7-0.7*u;
 if(cam.move==='pan'){z=Math.max(z,1.35);cx=160+320*u;}if(cam.move==='truck'){z=Math.max(z,1.3);cx=200+240*u;cy=cy+30*Math.sin(u*Math.PI);}
 const w=640/z,h=400/z;cx=Math.min(640-w/2,Math.max(w/2,cx));cy=Math.min(400-h/2,Math.max(h/2,cy));return {sx:cx-w/2,sy:cy-h/2,sw:w,sh:h};}
function drawCam(dst,cam,t,off){const spec=camSpec(cam);Painter.render(off,spec,t,{wm:false,lite:true});const v=camView(cam,t,spec);const x=dst.getContext('2d');x.drawImage(off,v.sx*off.width/640,v.sy*off.height/400,v.sw*off.width/640,v.sh*off.height/400,0,0,dst.width,dst.height);
 x.fillStyle='rgba(0,0,0,.55)';x.fillRect(dst.width-74,dst.height-24,66,18);x.fillStyle='#fff';x.font='12px "Noto Sans SC",sans-serif';x.fillText('AI 生成',dst.width-64,dst.height-11);}
function playCam(box,cam){stopIn(box);box.innerHTML='';const c=Painter.canvas(640),off=Painter.canvas(1280);box.appendChild(c);let raf,t0=performance.now(),last=0,stop=false;
 const loop=now=>{if(stop)return;if(now-last>33&&c.isConnected&&c.offsetParent!==null){last=now;drawCam(c,cam,(now-t0)/1000,off);}raf=requestAnimationFrame(loop);};raf=requestAnimationFrame(loop);loops.set(box,()=>{stop=true;cancelAnimationFrame(raf);});}
function playWork(box,work,specOverride){stopIn(box);box.innerHTML='';
 if(work.kind==='svg'){App.AI.mountSVG(box,work.svg);box.insertAdjacentHTML('beforeend','<span class="wm">AI 生成</span>');return;}
 if(work.kind==='video'){box.innerHTML=`<video src="${esc(work.src)}" autoplay loop muted playsinline style="width:100%;height:100%;object-fit:contain"></video><span class="wm">AI 生成</span>`;return;}
 if(work.kind==='img'){App.showWork(box,work);return;}
 const c=Painter.canvas(640);box.appendChild(c);const sp=specOverride||work.spec;loops.set(box,Painter.play(c,()=>sp));}
L.playWork=playWork;

const PNAME={mine:'我的画',p1:'国画瀑布',p2:'水彩瀑布',p3:'春江明月'};
const DETAILS=[['slow','慢动作'],...ELS];
/* one-of-N chips that can also be switched off again (nothing chosen = 不写) */
const tog=(name,opts)=>`<span data-tog="${name}" style="display:contents">${opts.map(([v,t])=>`<button type="button" class="chip" data-v="${v}" aria-pressed="false" style="padding-inline:10px">${t}</button>`).join('')}</span>`;
const DTAG=[['ok','没问题'],['upflow','水倒着流'],['shake','山在抖'],['cloud','云飞太快']],DSHORT={ok:'没问题',upflow:'水倒流',shake:'山在抖',cloud:'云太快'};
/* 镜头词的大白话（点一个词就显示） */
const TIP={far:'远景：镜头离得很远，视野开阔，看得到整个环境',full:'全景：看得到主体的全貌',mid:'中景：看得到主体的大部分',close:'近景：镜头靠近，突出主体',xclose:'特写：只拍一个细节，拍得很大',fix:'固定：镜头不动',push:'推：镜头向前，画面逐渐放大',pull:'拉：镜头后退，看到的范围逐渐变大',pan:'摇：镜头位置不动，左右转动',truck:'移：镜头跟着平移',slow:'慢动作：画面里的动作放慢',moonrise:'月亮缓缓升起：告诉 AI 月亮要怎么动',shimmer:'波光粼粼：水面的光一闪一闪',flowers:'岸边花林：岸边加上开花的树','':'写实：像照片一样',ink:'中国画：用水墨画的风格'};
const col=h=>`<div style="display:flex;flex-direction:column;gap:14px">${h}</div>`;

L.render=function(){const v=$('#v-l3');
 v.innerHTML=`${App.hero(K,'当一回导演：先让画面动起来，再用镜头语言指挥 AI 拍视频。',['学会用图像和文字生成视频，并通过提示词让 AI 修改视频。','认识人与 AI 的协作关系。'])}

 <div class="station" id="l3-s0">${App.head('EXP-01','热身 · 视频的秘密','帧率实验','拖帧率滑杆，找到画面不卡的那一格')}
  <ol class="steps"><li>先猜，再放映</li><li>拖到 24 帧以上</li></ol>
  <div class="grid2" data-rb="1">${col(`<div class="canvas-wrap" id="l3-stage0"><div class="svgbox" id="l3-flipv"></div></div>${App.knobs([['帧率',App.range('l3-fps',1,30,1,2,' 帧'),'每秒放几张画']])}`)}
   ${col(`<div class="row"><b>我猜，每秒至少放</b>${App.seg('fguess',[['3','3 张'],['12','12 张'],['30','30 张']],'')}<b>才不卡</b></div>
    <div class="go-row">${App.go('l3-play','开始放映')}</div>
    ${App.aiBox('l3-ai0','按大按钮放映，再拖画面下面的滑杆','放映机')}<div id="l3-fb0"></div>
    <div id="l3-seewrap" hidden>${App.pad('你的眼睛看到：从几帧开始不卡了？',`<div class="opts" id="l3-see"></div><p class="note" id="l3-seefb"></p>`)}</div>`)}</div>
  <p class="note">视频拆开看，是一张张不动的画。点一张小图，停下来看。</p><div class="frames" id="l3-frames" aria-label="1 秒钟里的 12 张画面"></div>
  <details class="more"><summary>说明</summary><p class="note">帧率 = 每秒播放多少张画面。同一段瀑布，帧率低时 1 秒只换几张画，看起来一卡一卡；帧率高时 1 秒换很多张，看起来就连贯了。</p>${App.know('帧率与视觉暂留','视频里的每一张画面叫一帧，每秒播放的帧数叫帧率。画面快速地一张接一张出现时，眼睛会把它们“连”起来，看上去就在动，这种现象叫视觉暂留。电影通常是每秒 24 帧。')}</details>
 </div>

 <div class="station" id="l3-s1">${App.head('EXP-02','挑战一 · 让画动起来','让画动起来','先猜画里哪些东西会动，再看 AI 怎么做')}
  <ol class="steps"><li>猜哪里会动</li><li>看 AI 怎么做</li></ol>
  <div class="grid2" data-rb="1">${col(`<div class="canvas-wrap" id="l3-stage1"><div class="svgbox" id="l3-video"></div><div class="busy" id="l3-busy" hidden></div><canvas id="l3-overlay" width="640" height="400" style="position:absolute;inset:0;pointer-events:none"></canvas></div>
    ${App.aiBox('l3-ai1','先猜哪里会动，再按大按钮')}<div id="l3-fb1"></div>`)}
   ${col(`${App.knobs([['选一幅画',`<div class="pick" id="l3-pick" role="radiogroup" aria-label="选一幅画"></div>`],['我猜会动',`<span id="l3-guess" style="display:contents"></span>`,'可以多选']])}
    <div class="go-row">${App.go('l3-go','让画动起来')}</div>
    <div class="after-run">${App.pad('视频里的动法，符合自然规律吗？',`<div class="opts" id="l3-natq"></div><p class="note" id="l3-natfb"></p>`)}</div>`)}</div>
  <details class="more"><summary>说明</summary><p class="note">“预测”这一步，平台会对比相邻两帧，真实计算出每个位置的运动方向（光流）：金色箭头向下，蓝色箭头横向，灰点不动。</p><div class="grid2">${App.know('分析 → 预测 → 生成','静止的瀑布开始流动、停驻的云朵缓缓飘移、凝固的光芒开始闪烁……AI 先分析哪些元素应该动起来；再预测它们的运动规律：瀑布从上往下流、云缓缓飘移、光一明一暗；最后按照规律生成一系列连续变化的画面，快速播放出来。')}
  ${App.know('关键帧与补帧','动画师常常先画出动作的几个关键画面（关键帧），中间的过渡画面再一张张补上。现在，AI 可以根据前后两帧预测出中间的画面，这就是“补帧”。')}</div></details>
 </div>

 <div class="station" id="l3-s2">${App.head('EXP-03','挑战二 · 文字变视频','诗句电影棚','加镜头语言，拍出海上明月升起的大场面')}
  <ol class="steps"><li>只用诗句拍一版</li><li>加镜头词再拍</li></ol>
  <div class="grid2">${col(`<div class="canvas-wrap"><div class="svgbox" id="l3-va"></div><div class="busy" id="l3-vab" hidden></div></div><div class="box-t" id="l3-ca">诗句：${POEM}</div><div class="strip" id="l3-vers" aria-label="我拍过的版本" style="flex-wrap:wrap;overflow:visible"></div>`)}
   ${col(`${App.knobs([['景别',tog('shot',SHOTS),'镜头离多远'],['运镜',tog('move',MOVES),'镜头怎么动'],['画风',App.seg('style',[['','写实'],['ink','中国画']],'')],['细节',DETAILS.map(([k,n])=>`<button class="chip" type="button" data-el="${k}" aria-pressed="false">${n}</button>`).join(''),'可以多选']])}
    <p class="note" id="l3-tip">不认识的词，点一下，这里告诉你意思。</p>
    <div class="go-row">${App.go('l3-t2v','开拍')}</div>
    ${App.aiBox('l3-ai2','什么都不调，先按「开拍」看看')}<div id="l3-fb2"></div>`)}</div>
  <details class="more"><summary>说明</summary><p class="note">“春江潮水连海平，海上明月共潮生”出自唐代张若虚的《春江花月夜》：江水随潮上涨，仿佛和大海连在一起；一轮明月随着潮水跃出水面。点画面下面的小图可以回看以前的版本。3 星：把“辽阔的海面、月亮慢慢升起”都写进提示词。</p><div class="grid2">${App.know('景别','镜头离被拍的东西多远：远景交代环境、视野开阔；全景看到主体全貌；中景看到主体的大部分；近景突出主体的上半部分；特写只拍一个细节。')}
  ${App.know('运镜','镜头怎么动：推＝镜头向前，画面逐渐放大；拉＝镜头后退，画面里的范围逐渐变大；摇＝镜头位置不动，左右转动；移＝镜头跟着平移。提示词写得越具体，AI 越容易拍出想要的效果——就像讲故事，讲得越生动具体，听的人越容易想象。')}</div></details>
 </div>

 <div class="station" id="l3-s3">${App.head('EXP-04','讨论 · 技术不产生思想','导演审片','AI 拍了 4 版，有的出了错。挑出能发布的那版')}
  <ol class="steps"><li>4 版都看，标出错误</li><li>发布对的那版</li></ol>
  <div class="grid2" data-rb="1">${col(`<div class="canvas-wrap"><div class="svgbox" id="l3-dbig"></div><span class="hint" id="l3-dlab"></span></div><p class="note">点小图换一版，上面放大看。</p><div class="pick" id="l3-dir" role="radiogroup" aria-label="选一版放大看" style="grid-template-columns:repeat(4,1fr)"></div>`)}
   ${col(`${App.knobs([['<span id="l3-dwho">这一版</span>',App.seg('dtag',DTAG,''),'有没有问题']])}
    <div class="go-row">${App.go('l3-pub','发布这一版')}</div><div id="l3-fb3"></div>
    <div id="l3-whowrap" hidden>${App.pad('刚才的错误是谁发现的？选一个你同意的说法',`<div class="opts" id="l3-who" style="display:flex;flex-direction:column;gap:8px"></div><div id="l3-fb4"></div>`)}</div>`)}</div>
  <details class="more"><summary>说明</summary><p class="note">AI 为同一幅画生成了 4 个版本，其中有的不符合自然规律。3 星：第一次就发布对，而且三处错误都标对。</p>${App.know('谁说了算','AI 可以生成各种各样的作品，但技术本身并不产生思想。“什么是美、什么是恰当、什么是深刻”的最终评判权，仍然掌握在人手中。AI 生成的逼真视频也可能被用来造假（深度伪造），看到来源不明的视频要核实，分享 AI 视频要标识清楚。')}</details>
 </div>
 <div class="station" id="l3-quizst">${App.head('QUIZ','反思与总结','小测验','5 道题，第一次作答计入能力图谱')}<div id="l3-quiz"></div></div>
 <div class="station" id="l3-diary"></div>`;
 if(!App.rec)return;wire();
};

const QUIZ=[
 {id:'q1',q:'视频的本质是什么？',opts:['一张会自己动的特殊图片','一系列静态图像快速连续播放','一段声音'],a:1,why:'快速连续播放的静态画面，在视觉暂留作用下看起来在动。'},
 {id:'q2',q:'AI 让一幅画动起来，正确的工作顺序是？',opts:['先生成画面，再分析','分析哪些元素该动 → 预测运动规律 → 生成连续画面','让画里所有东西随机动起来'],a:1,why:'分析 → 预测 → 生成。'},
 {id:'q3',q:'“补帧”指的是什么？',opts:['把视频剪短','根据前后画面，预测并补出中间的过渡画面','给视频加字幕'],a:1,why:'AI 可以预测关键帧之间的过渡画面。'},
 {id:'q4',q:'想拍出“明月从辽阔的海面升起”的意境，哪组镜头语言更合适？',opts:['特写 + 快速摇镜头','远景 + 慢动作 + 月亮缓缓升起','近景 + 正常速度'],a:1,why:'远景视野开阔，慢动作更有意境。'},
 {id:'q5',q:'关于人和 AI 的协作，哪个说法是对的？',opts:['AI 生成的作品一定是最美的','什么是美、什么是恰当，最终由人来评判','用了 AI 就不需要自己思考'],a:1,why:'技术本身并不产生思想。'}];
const DIR=[{id:'A',tag:'ok',wrong:{}},{id:'B',tag:'upflow',wrong:{upflow:true},s:'水应该从上往下流，AI 把方向弄反了。'},{id:'C',tag:'shake',wrong:{mountainShake:true},s:'山是不会动的，AI 却让它晃起来了。'},{id:'D',tag:'cloud',wrong:{fastCloud:true},s:'云应该缓缓地飘，这一版快得像火箭。'}];
const WHO=[{id:'ai',t:'AI 做出来的就是最好的，直接用'},{id:'human',t:'AI 负责生成，人负责判断和选择，最后人说了算'},{id:'none',t:'谁说了算都一样'}];

function wire(){const lr=App.lesson(K);lr.flip=lr.flip||{};lr.i2v=lr.i2v||{};lr.t2v=lr.t2v||[];lr.dir=lr.dir||{};
 const s0=$('#l3-s0'),s1=$('#l3-s1'),s2=$('#l3-s2'),s3=$('#l3-s3');
 const srcNow=()=>App.AI.srcKey?App.AI.srcKey(App.AI.mode()):App.AI.mode();

 /* ---- 实验 1 · 帧率实验：同一段瀑布，按「每秒 n 张」取画面放映（动作快慢不变，只有连贯程度变） ---- */
 const fspec={scene:'waterfall',el:{cloud:1,spray:1,mountain:1,pine:1},style:'plain',move:{water:true,cloud:true,spray:true,pine:true}};const fr=$('#l3-frames');const frames=[];
 const fv=Painter.canvas(640);$('#l3-flipv').appendChild(fv);let fraf=0,ft0=0,ftacc=0,fk=-1,playing=false,tier=-1;const fps=$('#l3-fps'),playBtn=$('#l3-play');
 const still=i=>{Painter.render(fv,fspec,i/12);frames.forEach((c,j)=>c.classList.toggle('on',j===i));};
 const floop=now=>{if(!playing)return;if(fv.isConnected&&fv.offsetParent!==null){const n=Math.max(1,+fps.value),k=Math.floor((ftacc+(now-ft0)/1000)*n);if(k!==fk){fk=k;Painter.render(fv,fspec,k/n);}}fraf=requestAnimationFrame(floop);};
 const fstop=()=>{cancelAnimationFrame(fraf);fraf=0;};
 const setPlay=on=>{if(on===playing)return;const now=performance.now();if(on){ft0=now;fk=-1;frames.forEach(c=>c.classList.remove('on'));}else ftacc+=(now-ft0)/1000;playing=on;playBtn.textContent=on?'暂停':'继续放映';playBtn.dataset.label=playBtn.textContent;fstop();if(on)fraf=requestAnimationFrame(floop);};
 for(let i=0;i<12;i++){const c=Painter.canvas(160);Painter.render(c,fspec,i/12,{wm:false});c.title=`第 ${i+1} 张`;c.style.cursor='pointer';c.onclick=()=>{setPlay(false);still(i);lr.flip.peek=true;const r=$('#l3-stage0').getBoundingClientRect();if(r.top<0||r.bottom>innerHeight)$('#l3-stage0').scrollIntoView({block:'center',behavior:'smooth'});};fr.appendChild(c);frames.push(c);}
 const FT=[[6,'try','一卡一卡，像翻相册','1 秒才换几张画，眼睛分得清每一张。把滑杆往右拖。',1],[12,'try','动起来了，还有点卡','再往右拖，看什么时候不卡。',1],[24,'find','连起来了！','眼睛把一张张画“连”成了动作。电影用 24 帧，再往右拖。',2],[99,'ok','到电影的帧率了！','视频就是一张张不动的画，快速连着放。电影通常每秒 24 帧。',3]];
 const SEE=['6 帧左右','12 帧左右','24 帧左右'];
 const seeDraw=()=>{const box=$('#l3-see');$('#l3-seewrap').hidden=!((lr.flip.max||0)>=12);box.innerHTML=SEE.map((o,j)=>`<button class="chip ${lr.flip.see===j?'on':''}" type="button" data-s="${j}">${o}</button>`).join('');
  $$('[data-s]',box).forEach(b=>b.onclick=()=>{lr.flip.see=+b.dataset.s;App.touch();seeDraw();});
  $('#l3-seefb').textContent=lr.flip.see==null?'':`${lr.flip.guess?'你猜的是 '+lr.flip.guess+' 张，':''}你的眼睛看到的是 ${SEE[lr.flip.see]}。每个人的感觉会差一点；一般 12 帧以上就比较流畅，电影通常每秒 24 帧。`;};
 const say0=()=>{const n=+fps.value;const t=FT.findIndex(x=>n<x[0]);const F=FT[t];
  App.aiSay('#l3-ai0',`<div class="big">每秒 ${n} 张</div><div class="timeline" aria-hidden="true">${Array.from({length:n},(_,i)=>`<i style="left:${(i+0.5)/n*100}%"></i>`).join('')}</div><p class="note">一小格 = 1 秒钟里放的一张画。</p>`,{mood:t>=2?'happy':'think'});
  if(n>(lr.flip.max||0)){lr.flip.max=n;App.touch();if(n>=12)seeDraw();}App.markStep(s0,0);if(n>=24)App.markStep(s0,1);
  if(t!==tier){tier=t;App.fb('#l3-fb0',F[1],F[2],F[3],{stars:F[4]});}};
 App.rangeWire('l3-fps',()=>{setPlay(true);say0();});
 App.segWire(s0,'fguess',v=>{lr.flip.guess=+v;App.touch();seeDraw();});
 if(lr.flip.guess)$$('[data-seg="fguess"] .chip',s0).forEach(b=>b.classList.toggle('on',+b.dataset.v===lr.flip.guess));
 playBtn.onclick=()=>{setPlay(!playing);if(playing)say0();};
 still(0);frames[0].classList.remove('on');seeDraw();if(lr.flip.max)App.markStep(s0,0);if((lr.flip.max||0)>=24)App.markStep(s0,1);
 L._flip=[fstop,()=>{if(playing&&!fraf){ft0=performance.now();fraf=requestAnimationFrame(floop);}}];
 /* ---- 实验 2 · 让画动起来 ---- */
 const mine=()=>{const b=(App.lesson('l2')||{}).best;return b&&b.work?{id:'mine',name:'我在第2讲画的画',work:b.work,thumb:b.thumb}:null;};
 const list=()=>[...(mine()?[mine()]:[]),...PRESETS];
 let picked=null,gsel=new Set(),R=null;const pickRow=$('#l3-pick'),gbox=$('#l3-guess');
 /* at most 6 things to guess: up to 4 that should move + 2 that should not, in a mixed order */
 const optsOf=w=>{if(w.kind!=='proc')return ['水','云','山','树','光','石头'].map(n=>({name:n}));const plan=Painter.motionPlan(w.spec).filter(p=>p.k!=='water2');
  return [...plan.filter(p=>p.move).slice(0,4),...plan.filter(p=>!p.move).slice(0,2)].sort((a,b)=>a.at[0]-b.at[0]);};
 const ov=$('#l3-overlay'),octx=ov.getContext('2d');const clearOv=()=>octx.clearRect(0,0,640,400);
 const choose=(p,user)=>{picked=p;R=null;if(user){App.aiSay('#l3-ai1','先猜哪里会动，再按大按钮',{mood:'idle'});$('#l3-ai1').classList.add('wait');$('#l3-fb1').innerHTML='';}lr.i2v.pick=p.id;$$('button',pickRow).forEach(b=>{const on=b.dataset.p===p.id;b.classList.toggle('on',on);b.setAttribute('aria-checked',on);});
  stopIn($('#l3-video'));App.showWork($('#l3-video'),p.work);clearOv();lr.i2v.guess=lr.i2v.guess||{};gsel=new Set(lr.i2v.guess[p.id]||[]);
  gbox.innerHTML=optsOf(p.work).map(o=>`<button class="chip ${gsel.has(o.name)?'on':''}" type="button" data-e="${esc(o.name)}" aria-pressed="${gsel.has(o.name)}">${esc(o.name)}</button>`).join('');
  $$('[data-e]',gbox).forEach(b=>b.onclick=()=>{const n=b.dataset.e;gsel.has(n)?gsel.delete(n):gsel.add(n);b.classList.toggle('on',gsel.has(n));b.setAttribute('aria-pressed',gsel.has(n));lr.i2v.guess[p.id]=[...gsel];if(gsel.size)App.markStep(s1,0);App.touch();});};
 pickRow.innerHTML=list().map(p=>`<button type="button" data-p="${p.id}" role="radio" aria-checked="false" aria-label="${esc(p.name)}"><img src="${p.thumb||Painter.thumb(p.work.spec,160)}" alt=""><span>${PNAME[p.id]}</span></button>`).join('');
 $$('button',pickRow).forEach(b=>b.onclick=()=>choose(list().find(p=>p.id===b.dataset.p),true));
 const sleep=ms=>new Promise(r=>setTimeout(r,ms));
 const MOVC='#12885a',STILLC='#d6336c';
 const tags=an=>`<div class="feat">${an.map((a,i)=>`<span style="border-color:${a.move?MOVC:STILLC};color:${a.move?MOVC:STILLC}">${i+1} ${esc(a.name)} · ${a.move?'动':'不动'}</span>`).join('')}</div>`;
 /* the three steps can be looked at again after the run: each one redraws its own marks on the picture */
 const drawBoxes=()=>{clearOv();if(!R||!R.plan)return;octx.font='800 17px "Noto Sans SC",sans-serif';octx.textAlign='center';octx.textBaseline='middle';R.analysis.forEach((p,i)=>{octx.beginPath();octx.arc(p.at[0],p.at[1],15,0,7);octx.fillStyle=p.move?MOVC:STILLC;octx.fill();octx.lineWidth=3;octx.strokeStyle='#fff';octx.stroke();octx.fillStyle='#fff';octx.fillText(String(i+1),p.at[0],p.at[1]+1);});octx.textAlign='start';octx.textBaseline='alphabetic';};
 const drawFlow=()=>{clearOv();if(!R||R.video.kind!=='proc')return;const fa=Painter.canvas(640),fb=Painter.canvas(640);Painter.render(fa,R.video.spec,0,{wm:false});Painter.render(fb,R.video.spec,0.06,{wm:false});octx.drawImage(fa,0,0);octx.fillStyle='rgba(16,26,61,.45)';octx.fillRect(0,0,640,400);
  Vision.drawFlow(octx,Vision.flow(fa,fb,16,8),3);octx.fillStyle='rgba(0,0,0,.6)';octx.fillRect(8,8,250,24);octx.fillStyle='#fff';octx.font='13px "Noto Sans SC",sans-serif';octx.fillText('箭头 = AI 预测的运动方向',14,25);};
 const stepHTML=n=>{const proc=R.video.kind==='proc';
  if(n===1)return `<p><b>分析</b>：画里有什么？谁该动？${R.plan?'画上的圆点和下面的编号一一对应：绿色会动，红色不动。':''}</p>${tags(R.analysis)}`;
  if(n===2)return `<p><b>预测</b>：它们往哪里动、怎么动？${proc?'看画上的箭头。':''}</p><p class="note">${R.rules||'这一次 AI 没有写出运动规律。'}</p>`;
  return `<p><b>生成</b>：按预测画出一张张连续的画，快速播放，画就动了。</p>${proc?'<div class="frames" id="l3-film"></div><p class="note">黄框的 2 张是先定好的画面（关键帧），中间 4 张是 AI 补出来的（补帧）。</p>':''}`;};
 const stepShow=n=>{if(!R)return;const body=$('#l3-stepbody');if(body)body.innerHTML=stepHTML(n);const box=$('#l3-video');
  if(n===3){clearOv();playWork(box,R.video);const film=$('#l3-film');if(film)for(let i=0;i<6;i++){const c=Painter.canvas(160);Painter.render(c,R.video.spec,i*0.15,{wm:false});if(i===0||i===5)c.classList.add('on');c.title=(i===0||i===5?'关键帧':'AI 补帧')+' · '+(i+1);film.appendChild(c);}}
  else{stopIn(box);App.showWork(box,R.w);n===1?drawBoxes():drawFlow();}};
 const natQ=()=>{const box=$('#l3-natq');const A=lr.i2v.nat;const opts=['符合，动得都合理','不符合，有东西动得怪','看不出来'];
  box.innerHTML=opts.map((o,j)=>`<button class="chip ${A===j?'on':''}" type="button" data-n="${j}">${o}</button>`).join('');
  $('#l3-natfb').textContent=A==null?'':['记下了。到后面的「导演审片」，用同样的眼光去挑错。','记下了。点 AI 回答里的「① 分析」「② 预测」，找找是哪一处怪。','点 AI 回答里的「② 预测」，对着画上的箭头再看一遍。'][A];
  $$('[data-n]',box).forEach(b=>b.onclick=()=>{lr.i2v.nat=+b.dataset.n;App.touch();natQ();});};
 $('#l3-go').onclick=async()=>{if(!picked)return;const b=$('#l3-go'),w=picked.work,pk=picked;App.busy(b,true,'AI 正在想…');clearOv();R=null;let video=null,analysis=null,plan=null,src='offline';
  const stg=$('#l3-stage1').getBoundingClientRect();if(stg.top<0||stg.bottom>innerHeight)$('#l3-stage1').scrollIntoView({block:'start',behavior:'smooth'});
  try{
  if(w.kind!=='proc'&&App.AI.real()){const bz=$('#l3-busy');bz.hidden=false;bz.textContent='AI 正在分析画面、预测运动……';App.aiSay('#l3-ai1','正在看你的画……',{busy:true});
   try{const im=await App.rasterize(w);const r=await App.AI.imageToVideo(Object.assign({},w,{dataURL:im.toDataURL('image/jpeg',.85)}),{onText:({text})=>{bz.textContent=`AI 正在工作……已输出 ${text.length} 个字符`;}});if(r){video=r;src=srcNow();analysis=(r.analysis||[]).map(a=>({name:a.element,move:!!a.move,rule:a.rule}));}}catch(e){App.AI.fail(e);App.toast(App.AI.errText(e));}bz.hidden=true;}
  if(w.kind!=='proc'&&!video){App.aiSay('#l3-ai1','这幅画我现在动不了。',{mood:'oops'});App.fb('#l3-fb1','try','这幅画要联网的 AI 才能动','先选旁边平台准备的画试试。');return;}
  if(!video){plan=Painter.motionPlan(w.spec);analysis=plan.filter(p=>p.k!=='water2');video={kind:'proc',spec:Object.assign({},w.spec,{move:Painter.moveFrom(plan)})};}
  const rules=analysis.filter(a=>a.move&&a.rule).slice(0,5).map(a=>`${esc(a.name)}：${esc(a.rule)}`).join('<br>');
  R={w,video,analysis,plan,rules,src};
  /* ① 分析 → ② 预测（相邻两帧之间真实计算的光流）→ ③ 生成（关键帧 + 补帧） */
  App.aiSay('#l3-ai1',`<div id="l3-stepbody">${stepHTML(1)}</div>`,{busy:true});stopIn($('#l3-video'));App.showWork($('#l3-video'),w);drawBoxes();await sleep(1400);
  App.aiSay('#l3-ai1',`<div id="l3-stepbody">${stepHTML(2)}</div>`,{busy:true});drawFlow();await sleep(1600);
  if(picked!==pk){R=null;return;}
  const mv=analysis.filter(a=>a.move).length,st=analysis.length-mv;
  App.aiSay('#l3-ai1',`<div class="big">${mv} 处会动，${st} 处不动</div><div class="row">${App.seg('i2vs',[['1','① 分析'],['2','② 预测'],['3','③ 生成']],'3')}</div><div id="l3-stepbody"></div><p class="note">点 ①②③，可以回看 AI 的每一步。</p>`,{mood:'happy',src});
  App.segWire($('#l3-ai1'),'i2vs',v=>stepShow(+v));stepShow(3);
  lr.i2v.ran=(lr.i2v.ran||0)+1;lr.i2v.last={pick:pk.id,work:video.kind==='proc'?video:video.kind==='svg'?{kind:'svg',svg:video.svg}:{kind:video.kind,src:video.src}};App.markStep(s1,1);
  if(plan){const opts=optsOf(w),should=opts.filter(o=>o.move).map(o=>o.name),gs=new Set((lr.i2v.guess||{})[pk.id]||[]);const hit=should.filter(n=>gs.has(n)),miss=should.filter(n=>!gs.has(n)),wrong=[...gs].filter(n=>!should.includes(n));
   lr.i2v.match=Math.round(100*Math.max(0,hit.length-wrong.length)/Math.max(1,should.length));
   if(!gs.size)App.fb('#l3-fb1','try','这次你没有猜','换一幅画，先点「我猜会动」，再和 AI 比一比。',{stars:1});
   else if(!miss.length&&!wrong.length)App.fb('#l3-fb1','ok','全猜中！你和 AI 想的一样','AI 也是先分析谁该动，再预测怎么动，最后生成连续的画面。',{stars:3});
   else App.fb('#l3-fb1','find',hit.length?`${hit.length} 处和 AI 想的一样`:'这次和 AI 想的不一样',`${miss.length?'AI 还让这些动了：'+esc(miss.join('、'))+'。':''}${wrong.length?'AI 没让它动：'+esc(wrong.join('、'))+'。':''}点「② 预测」看 AI 的理由，再换一幅画猜。`,{stars:2});}
  else App.fb('#l3-fb1','find','AI 让你的画动起来了','点 ① 分析，看 AI 认为哪些会动，和你猜的一样吗？',{stars:2});
  App.touch();
  }catch(e){App.aiSay('#l3-ai1',esc(App.AI.errText?App.AI.errText(e):'出了点问题'),{mood:'oops'});App.fb('#l3-fb1','try','这次没成功','再按一次大按钮试试。');}
  finally{App.busy(b,false);}};
 natQ();if(lr.i2v.ran){App.markStep(s1,0);App.markStep(s1,1);App.ran(s1);}
 choose((mine()&&lr.i2v.pick==='mine')?mine():PRESETS.find(p=>p.id===lr.i2v.pick)||PRESETS[0]);
 /* ---- 实验 3 · 诗句电影棚 ---- */
 const cam={shot:null,move:null,slow:false,style:null,els:[]};
 const camText=c=>[c.shot&&SHOTS.find(s=>s[0]===c.shot)[1]+'镜头',c.move&&c.move!=='fix'&&'镜头'+MOVES.find(s=>s[0]===c.move)[1],c.move==='fix'&&'固定机位',c.slow&&'慢动作',c.style==='ink'&&'中国画风格',...(c.els||[]).map(k=>(ELS.find(e=>e[0]===k)||[])[1])].filter(Boolean);
 const tip=k=>{$('#l3-tip').textContent=TIP[k]||'';};
 ['shot','move'].forEach(n=>{const bs=$$(`[data-tog="${n}"] .chip`,s2);bs.forEach(b=>b.onclick=()=>{cam[n]=cam[n]===b.dataset.v?null:b.dataset.v;tip(b.dataset.v);bs.forEach(x=>{const on=cam[n]===x.dataset.v;x.classList.toggle('on',on);x.setAttribute('aria-pressed',on);});});});App.segWire(s2,'style',v=>{cam.style=v||null;tip(v);});
 $$('[data-el]',s2).forEach(b=>b.onclick=()=>{const k=b.dataset.el;tip(k);let on;if(k==='slow')on=cam.slow=!cam.slow;else{on=!cam.els.includes(k);cam.els=on?[...cam.els,k]:cam.els.filter(x=>x!==k);}b.classList.toggle('on',on);b.setAttribute('aria-pressed',on);});
 const full=c=>({shot:c.shot||'full',move:c.move||'fix',slow:!!c.slow,style:c.style||'plain',els:c.els||[]});
 const showV=(box,v)=>{if(v.work)playWork(box,v.work);else playCam(box,full(v.cam));};
 const vname=v=>camText(v.cam).join('、')||'只有诗句';
 let cur=-1;
 const vers=()=>{const vb=$('#l3-vers');const from=Math.max(0,lr.t2v.length-6);vb.innerHTML=lr.t2v.slice(from).map((v,j)=>{const i=from+j;return `<div class="ver ${i===cur?'on':''}" data-i="${i}" style="width:calc(33.33% - 6px)" title="${esc(vname(v))}"><div class="th">${v.thumb?`<img src="${v.thumb}" alt="">`:''}</div><p>第 ${i+1} 版 · ${esc(vname(v))}</p></div>`;}).join('');
  $$('.ver',vb).forEach(d=>d.onclick=()=>{const i=+d.dataset.i;if(i!==cur&&lr.t2v.length>1&&!lr.cmp){lr.cmp=true;App.touch();}view(i);});
  if(lr.t2v.length)App.markStep(s2,0);if(lr.t2v.some(v=>camText(v.cam).length>=2))App.markStep(s2,1);};
 const view=i=>{cur=i;const v=lr.t2v[i];showV($('#l3-va'),v);$('#l3-ca').textContent=`第 ${i+1} 版 · ${vname(v)}`;vers();};
 $('#l3-t2v').onclick=async()=>{const b=$('#l3-t2v');App.busy(b,true,'AI 正在拍…');const c=JSON.parse(JSON.stringify(cam));const v={cam:c,prompt:POEM};const words=camText(c);let src='offline';
  try{App.aiSay('#l3-ai2','正在读诗句、摆镜头……',{busy:true});
  if(App.AI.real()){const bz=$('#l3-vab');bz.hidden=false;bz.textContent='AI 正在分析诗句、规划镜头……';const fc=full(c);
   try{const r=await App.AI.textToVideo(v.prompt+(words.length?'，'+words.join('，'):''),{shot:fc.shot,move:fc.move,speed:fc.slow?'slow':'normal',style:fc.style,shotName:SHOTS.find(s=>s[0]===fc.shot)[1],moveName:MOVES.find(s=>s[0]===fc.move)[1],slow:fc.slow},{onText:({text})=>{bz.textContent=`AI 正在生成……已输出 ${text.length} 个字符`;}});if(r){v.work=r.kind==='svg'?{kind:'svg',svg:r.svg}:{kind:r.kind,src:r.src};src=srcNow();}}catch(e){App.AI.fail(e);App.toast(App.AI.errText(e));}bz.hidden=true;}
  if(v.work&&v.work.kind!=='video')v.thumb=await App.thumbOf(v.work);else{const t=Painter.canvas(240),off=Painter.canvas(640);drawCam(t,full(c),3,off);v.thumb=t.toDataURL('image/jpeg',.75);}
  const prev=lr.t2v[lr.t2v.length-1];lr.t2v.push(v);if(lr.t2v.length>8)lr.t2v.shift();lr.t2v.forEach((x,i)=>{if(i<lr.t2v.length-2&&x.work&&x.work.kind==='svg')delete x.work;});
  if(lr.t2v.length>1)lr.cmp=true;view(lr.t2v.length-1);const no=lr.t2v.length;if(innerWidth<700){const r=$('#l3-va').getBoundingClientRect();if(r.top<0||r.bottom>innerHeight)$('#l3-va').scrollIntoView({block:'center',behavior:'smooth'});}
  App.aiSay('#l3-ai2',`<div class="big">第 ${no} 版拍好了</div><p class="note">我收到的提示词：</p><div class="prompt-line">${esc(POEM)}${words.map(x=>`<b style="color:var(--grape-d)">，${esc(x)}</b>`).join('')}</div>${prev?`<p class="note">上一版：${esc(vname(prev))}。点画面下面的小图可以回看、对比。</p>`:''}`,{mood:'happy',src});
  const goal=c.shot==='far'&&c.slow&&c.els.includes('moonrise');
  if(!words.length)App.fb('#l3-fb2','find','这是只用诗句拍的','和你想象的一样吗？AI 只能猜。加上景别、运镜、细节，再拍一版比比看。',{stars:1});
  else if(goal)App.fb('#l3-fb2','ok','导演，提示词写到位了！','远景、慢动作、月亮升起，你都告诉 AI 了。点第 1 版的小图比一比：哪一版更像你想的？',{stars:3});
  else App.fb('#l3-fb2','find',`这次多告诉了 AI ${words.length} 件事`,(prev?'和上一版比，哪里变了？':'')+(!c.els.includes('moonrise')?'你还没告诉 AI 月亮要升起来，在「细节」里找一找。':c.shot!=='far'?'你还没告诉 AI 海面要辽阔，哪种景别看得最远？':'你还没告诉 AI 节奏要慢，哪个细节能让画面慢下来？'),{stars:2});
  App.touch();
  }catch(e){App.aiSay('#l3-ai2',esc(App.AI.errText?App.AI.errText(e):'出了点问题'),{mood:'oops'});App.fb('#l3-fb2','try','这次没拍成','再按一次「开拍」试试。');}
  finally{App.busy(b,false);}};
 if(lr.t2v.length){view(lr.t2v.length-1);App.ran(s2);}
 else{$('#l3-va').innerHTML=`<div style="height:100%;display:grid;place-items:center;text-align:center;color:#fff;font-family:var(--f-display);font-weight:800;font-size:clamp(17px,2.4vw,24px);line-height:1.8;padding:16px">春江潮水连海平<br>海上明月共潮生</div>`;vers();}

 /* ---- 实验 4 · 导演审片：放大看每一版 → 点选标出问题 → 发布 → 谁说了算 ---- */
 const base={scene:'waterfall',el:{highpeak:1,cloud:1,spray:1,pine:1},style:'ink',move:{water:true,cloud:true,spray:true,pine:true}};
 const dspec=d=>Object.assign({},base,{wrong:d.wrong});const dn=id=>DIR.findIndex(d=>d.id===id)+1;const TAGN=Object.fromEntries(DTAG);
 lr.dir.tags=lr.dir.tags||{};lr.dir.seen=lr.dir.seen||{};let dsel=null;
 const found=()=>DIR.filter(d=>d.tag!=='ok'&&lr.dir.tags[d.id]===d.tag).length;
 const dirBox=$('#l3-dir');dirBox.innerHTML=DIR.map((d,i)=>`<button type="button" data-d="${d.id}" role="radio" aria-checked="false" aria-label="第 ${i+1} 版" style="aspect-ratio:16/11"><img src="${Painter.thumb(dspec(d),200,1)}" alt=""><span></span></button>`).join('');
 const dsync=()=>{$$('button',dirBox).forEach(b=>{const id=b.dataset.d,on=id===dsel,t=lr.dir.tags[id];b.classList.toggle('on',on);b.setAttribute('aria-checked',on);const d=DIR.find(x=>x.id===id);$('span',b).textContent=`${dn(id)}${t?' · '+(t===d.tag?DSHORT[t]:'再看看'):lr.dir.seen[id]?' · 看过':' 版'}`;});
  $$('[data-seg="dtag"] .chip',s3).forEach(b=>b.classList.toggle('on',!!dsel&&lr.dir.tags[dsel]===b.dataset.v));
  $('#l3-dlab').textContent=`第 ${dn(dsel)} 版`;$('#l3-dwho').textContent=`第 ${dn(dsel)} 版`;
  if(found()===3)App.markStep(s3,0);if(lr.dir.pick==='A')App.markStep(s3,1);$('#l3-whowrap').hidden=!lr.dir.pick;
  if(lr.dir.pick==='A'&&lr.dir.first==='A'&&found()===3)App.star(s3,3);};
 const dshow=id=>{dsel=id;if(!lr.dir.seen[id]){lr.dir.seen[id]=1;App.touch();}playWork($('#l3-dbig'),{kind:'proc',spec:dspec(DIR.find(d=>d.id===id))});dsync();};
 $$('button',dirBox).forEach(b=>b.onclick=()=>dshow(b.dataset.d));
 App.segWire(s3,'dtag',v=>{const d=DIR.find(x=>x.id===dsel),n=dn(dsel);lr.dir.tags[dsel]=v;
  const ok=DIR.filter(x=>x.tag!=='ok'&&lr.dir.tags[x.id]===x.tag);lr.dir.reason=ok.map(x=>`第 ${dn(x.id)} 版${TAGN[x.tag]}`).join('；');App.touch();dsync();const left=3-ok.length;
  if(v===d.tag&&v!=='ok')App.fb('#l3-fb3','ok',`抓到了！第 ${n} 版${TAGN[v]}`,d.s+(left?`还有 ${left} 处错误藏在别的版本里。`:'三处错误都找到了，发布没问题的那一版吧。'),{stars:1});
  else if(v===d.tag)App.fb('#l3-fb3','find',`第 ${n} 版，你没挑出毛病`,'别的版本也都放大看过了吗？都看完再决定发布哪一版。');
  else if(d.tag==='ok')App.fb('#l3-fb3','try',`再看看第 ${n} 版`,'这一版里，这个地方动得没毛病。和别的版本对比着看。');
  else App.fb('#l3-fb3','try',`再看看第 ${n} 版`,v==='ok'?'这一版有一处不合自然规律。水往哪流？山动没动？云快不快？':'不是这个问题。水往哪流？山动没动？云快不快？');});
 $('#l3-pub').onclick=()=>{const unseen=DIR.filter(d=>!lr.dir.seen[d.id]);
  if(unseen.length){App.fb('#l3-fb3','try',`还有 ${unseen.length} 版没看`,'导演要把每一版都看过，才能决定发布哪一版。点画面下面的小图。');return;}
  const d=DIR.find(x=>x.id===dsel),n=dn(dsel);lr.dir.pick=dsel;lr.dir.first=lr.dir.first||dsel;App.touch();
  if(dsel==='A'){const f=found();App.fb('#l3-fb3','ok','审片通过，可以发布！',(lr.dir.first==='A'?'你第一次就挑对了。':'')+'这一版水往下流、云慢慢飘、山不动，符合自然规律。'+(f<3?`另外 3 版的错误，你标对了 ${f} 处，标全它们。`:''),{stars:lr.dir.first==='A'&&f===3?3:2});}
  else App.fb('#l3-fb3','oops',`停！第 ${n} 版不能发布`,(lr.dir.tags[dsel]===d.tag?`你自己标过它「${TAGN[d.tag]}」。`:'它有一处不合自然规律，先把问题标出来。')+'换一版再发布。',{stars:1});
  dsync();};
 /* 谁说了算：发布之后才出现；不判对错，用刚才审片的事实回应 */
 const who=$('#l3-who');who.innerHTML=WHO.map(w=>`<button class="chip big ${lr.dir.who===w.id?'on':''}" type="button" data-w="${w.id}">${w.t}</button>`).join('');
 const whoFb=()=>{const w=lr.dir.who;if(w==='human')App.fb('#l3-fb4','ok','最后人说了算','AI 负责生成，你负责判断和选择。分享 AI 视频要标明“AI 生成”，来源不明的视频先核实。');
  else App.fb('#l3-fb4','find','想一想刚才的事',w==='ai'?'4 版里有 3 版出了错，是你审出来的。要是直接用，发布出去的可能是哪一版？':'要是刚才没有人审片，倒流的瀑布也可能被发布。有人把关和没人把关，结果一样吗？');};
 $$('[data-w]',who).forEach(b=>b.onclick=()=>{lr.dir.who=b.dataset.w;lr.dir.whoFirst=lr.dir.whoFirst||b.dataset.w;$$('[data-w]',who).forEach(x=>x.classList.toggle('on',x===b));App.touch();whoFb();});
 dshow(lr.dir.pick||'A');if(lr.dir.pick)App.ran(s3);if(lr.dir.who)whoFb();
 App.quiz($('#l3-quiz'),K,QUIZ);
 const rd=App.diary($('#l3-diary'),K,{title:'让画面动起来',lead:'带上你的视频作品，写下今天的想法',
  fields:[{id:'feature',q:'图像生成视频和文字生成视频各有什么特点？',ph:'图生视频……；文生视频……'},{id:'improve',q:'AI 生成视频的能力在哪些方面还有待提升？（结合审片时发现的问题）',ph:'我发现……'},{id:'role',q:'使用 AI 时，我们扮演了怎样的角色？人和 AI 谁说了算？',ph:'我认为……'},{id:'idea',q:'创作说明：你还想用 AI 做什么主题的视频？会用什么景别和运镜？',ph:'我想拍……，用……镜头'}],
  pledge:'AI 帮我生成，我负责判断和选择；分享视频时我会标明它是 AI 生成的。',
  extras:ex=>{const l=App.lesson(K);const v=(l.t2v||[]).slice(-1)[0],i2=l.i2v&&l.i2v.last;ex.innerHTML=`<div class="grid2">${i2?`<div><div class="box-t">图生视频</div><div class="canvas-wrap"><div class="svgbox" id="l3-ex1"></div></div></div>`:''}${v?`<div><div class="box-t">文生视频</div><div class="canvas-wrap"><div class="svgbox" id="l3-ex2"></div></div><p class="note">${esc(v.prompt||POEM)}${camText(v.cam).length?'，'+esc(camText(v.cam).join('，')):''}</p></div>`:''}</div>${!i2&&!v?'<p class="note">做完挑战一、二，作品会出现在这里。</p>':''}`;
   if(i2)playWork($('#l3-ex1',ex),i2.work);if(v)showV($('#l3-ex2',ex),v);}});
 App.on(()=>{if(App.current==='l3')rd();});
}
L.onShow=()=>{if(L._flip)L._flip[1]();};L.onHide=()=>{if(L._flip)L._flip[0]();};

L.score=lr=>{const f=lr.flip||{},i=lr.i2v||{},t=lr.t2v||[],d=lr.dir||{},D=lr.diary||{},Q=lr.quiz||{},tx=App.txtScore;const qs=id=>Q[id]?(Q[id].ok?100:0):0;
 const maxC=t.reduce((m,v)=>Math.max(m,[v.cam.shot,v.cam.move,v.cam.slow,v.cam.style].filter(Boolean).length+(v.cam.els||[]).length),0);
 return {principle:Math.round(20*((f.max||0)>=24?1:(f.max||0)/24)+0.2*qs('q1')+0.2*qs('q2')+0.15*qs('q3')+0.25*tx(D.feature)),
  experiment:Math.round(15*((f.max||0)>0?1:0)+20*(i.ran?1:0)+0.25*(i.match||0)+20*Math.min(1,t.length/2)+20*(lr.cmp?1:0)),
  prompt:Math.round(50*Math.min(1,maxC/4)+25*Math.min(1,t.length/3)+0.25*qs('q4')),
  critical:Math.round((d.first?(d.first==='A'?40:10):0)+(d.tags?10*DIR.filter(x=>x.tag!=='ok'&&d.tags[x.id]===x.tag).length:0.3*tx(d.reason))+(i.nat!=null?(i.nat===0?15:8):0)+0.15*tx(D.improve)),
  creative:Math.round(0.4*tx(D.idea)+30*Math.min(1,t.length/2)+30*(d.pick?1:0)),
  ethics:Math.round(0.35*qs('q5')+(d.whoFirst==='human'?30:d.who==='human'?15:0)+0.2*tx(D.role)+(D.pledge?15:0))};};
L.progress=lr=>{const m=[((lr.flip||{}).max||0)>=24,!!(lr.i2v||{}).ran,(lr.i2v||{}).nat!=null,(lr.t2v||[]).length>=2,!!lr.cmp,!!(lr.dir||{}).pick&&!!(lr.dir||{}).who,Object.keys(lr.quiz||{}).length>=5,!!(lr.diary||{}).submitted];return m.filter(Boolean).length/m.length;};
L.intro={q:'一张图片，怎样才能“动起来”变成视频？',opts:['把很多张略有不同的画面快速连续播放', '把图片放大很多倍', '给图片配上声音'],back:'挑战一的帧率实验会给出答案。'};
L.flow=[
 {seg:'导入',from:'l3-intro'},
 {seg:'挑战一',kp:'知识点一 · 图生视频：分析 → 预测 → 生成',learn:['视频是一系列静态图像快速连续播放，每张叫一帧','AI 先分析哪些元素该动，再预测它们怎么动','按规律生成连续画面，快速播放，画就动起来了'],sum:['帧率越高越流畅，12 帧/秒以上就比较流畅','水、云、松枝动了，山石不动，符合自然规律'],from:'l3-s0',to:'l3-s1'},
 {seg:'挑战二',kp:'知识点二 · 文生视频：找元素、组场景',learn:['AI 从诗句中找出江、潮水、海、月亮等元素','把元素组合成动态场景：波浪涌动、月光洒水面','提示词越具体越好，像讲故事一样反复调整'],sum:['只用诗句的第 1 版常常和想象不一样','加画风、景别、速度、元素后，意境更接近想象'],from:'l3-s2',to:'l3-s2'},
 {seg:'综合运用',from:'l3-s3'},
 {seg:'反思与总结',from:'l3-quizst'}
];
L.quiz=QUIZ;
})();
