/* AI 小实验室 v2 — core: state, storage, routing, scoring, shared widgets */
(function(){
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const h=(html)=>{const t=document.createElement('template');t.innerHTML=html.trim();return t.content.firstElementChild;};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clamp=(v,a=0,b=100)=>Math.max(a,Math.min(b,v));
const LS={get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const DIMS=[
 {k:'principle',n:'原理理解',s:'懂原理',d:'能说出 AI 识别、生成、做视频的基本过程'},
 {k:'experiment',n:'观察实验',s:'会实验',d:'会做对比实验、控制变量、记录数据'},
 {k:'prompt',n:'提示词表达',s:'会表达',d:'能用结构清楚、细节具体的提示词引导 AI'},
 {k:'critical',n:'批判思维',s:'会质疑',d:'能发现 AI 的错误与局限并说出原因'},
 {k:'creative',n:'创意审美',s:'有创意',d:'能完成作品，并对风格和意境作出判断'},
 {k:'ethics',n:'责任伦理',s:'守规则',d:'保护隐私、标识 AI 内容、人机协作人做主'}
];
const App={ $, $$, h, esc, clamp, LS, DIMS, lessons:{}, rec:null, db:null, all:{}, listeners:[] };
window.App=App;
/* units & lessons: one platform, one ability map across all units */
App.UNITS=[
 {id:'u1',no:'第一单元',name:'图像小行家',lab:'图像实验室',en:'UNIT 01',lessons:[{k:'l1',n:'第1讲 慧眼辨识图中物',nav:'第1讲 识图实验室'},{k:'l2',n:'第2讲 诗情画意绘成画',nav:'第2讲 文生图工作室'},{k:'l3',n:'第3讲 巧用图文做视频',nav:'第3讲 视频工作室'}]},
 {id:'u2',no:'第二单元',name:'语言小助理',lab:'语音实验室',en:'UNIT 02',lessons:[{k:'l4',n:'第4讲 辨析语音成文字',nav:'第4讲 听写实验室'},{k:'l5',n:'第5讲 模仿音色来配音',nav:'第5讲 配音工作室'},{k:'l6',n:'第6讲 语言翻译解文意',nav:'第6讲 翻译工作室'}]},
 {id:'u3',no:'第三单元',name:'文字小帮手',lab:'文字工坊',en:'UNIT 03',lessons:[{k:'l7',n:'第7讲 依题作诗仿风格',nav:'第7讲 诗词工坊'},{k:'l8',n:'第8讲 资料搜集要辨别',nav:'第8讲 资料侦探社'},{k:'l9',n:'第9讲 梳理提炼助我写',nav:'第9讲 报告协作台'}]},
 {id:'u4',no:'第四单元',name:'编程小达人',lab:'编程工坊',en:'UNIT 04',lessons:[{k:'l10',n:'第10讲 简单网页尝试做',nav:'第10讲 网页工坊'},{k:'l11',n:'第11讲 趣味游戏巧生成',nav:'第11讲 游戏工坊'},{k:'l12',n:'第12讲 动画模拟助探究',nav:'第12讲 科学动画实验室'}]},
 {id:'u5',no:'第五单元',name:'学习小伙伴',lab:'学习实验室',en:'UNIT 05',lessons:[{k:'l13',n:'第13讲 出题批改伴我学',nav:'第13讲 练习工坊'},{k:'l14',n:'第14讲 数学游戏展推理',nav:'第14讲 推理游戏厅'},{k:'l15',n:'第15讲 诊断学情有规划',nav:'第15讲 学习规划室'}]}];
App.LESSONS=App.UNITS.flatMap(u=>u.lessons.map(l=>Object.assign({unit:u.id},l)));
App.LESSON_KEYS=App.LESSONS.map(l=>l.k);
App.lessonInfo=k=>App.LESSONS.find(l=>l.k===k);
App.unitOf=k=>(App.lessonInfo(k)||{}).unit;
App.unit=LS.get('ailab.unit','u1');

App.student=LS.get('ailab.student',null);
App.idOf=s=>`g${s.grade}c${s.cls}-${String(s.no).padStart(2,'0')}`;
App.classOf=id=>id.split('-')[0];
App.className=c=>{const m=/^g(\d+)c(\d+)$/.exec(c);return m?`${m[1]}年级${m[2]}班`:c};
App.fixRec=function(r){if(!r||typeof r!=='object')return r;r.lessons=Object.assign(Object.fromEntries(App.LESSON_KEYS.map(k=>[k,{}])),r.lessons||{});
  const L3=r.lessons.l3||{};if(Array.isArray(L3.t2v))L3.t2v=L3.t2v.filter(Boolean).map(v=>Object.assign({prompt:''},v,{cam:Object.assign({},v.cam||{})}));
  const L1=r.lessons.l1||{};if(Array.isArray(L1.rows))L1.rows=L1.rows.filter(x=>x&&typeof x==='object').map(x=>Object.assign({},x,{c:Object.assign({},x.c||{})}));
  return r;};
function blankRec(s){return {id:App.idOf(s),grade:s.grade,cls:s.cls,no:s.no,name:s.name||'',updated:Date.now(),lessons:Object.fromEntries(App.LESSON_KEYS.map(k=>[k,{}]))};}

/* storage: shared db when granted, otherwise this browser */
let saveTimer=null, saving=false, dirty=false;
App.lesson=k=>{const L=App.rec.lessons;return L[k]||(L[k]={});};
App.touch=function(){ if(!App.rec)return; App.rec.updated=Date.now(); dirty=true;
  const loc=LS.get('ailab.records',{}); loc[App.rec.id]=App.rec; LS.set('ailab.records',loc);
  if(!App.dbLive){App.all[App.rec.id]=App.rec; App.emit();}
  clearTimeout(saveTimer); saveTimer=setTimeout(flush,1200); if(App.current==='home')renderHome(); };
async function flush(){
  if(!App.db||!App.rec||saving||!dirty)return; saving=true; dirty=false;
  try{ await App.db.doc('students/'+App.rec.id).set(JSON.parse(JSON.stringify(App.rec))); }
  catch(e){ if(e&&e.code==='invalid_argument'&&!App._warned){App._warned=1;App.toast('记录只保存在这台设备上（当前账号没有写入班级数据的权限）');} }
  saving=false; if(dirty) flush();
}
App.loadRec=async function(){
  const s=App.student; if(!s){App.rec=null;return;}
  const id=App.idOf(s); const loc=LS.get('ailab.records',{}); let r=loc[id]||null;
  if(App.db){ try{const snap=await App.db.doc('students/'+id).get(); if(snap.exists){const d=JSON.parse(JSON.stringify(snap.data())); if(!r||d.updated>=r.updated) r=d;}}catch(e){} }
  App.rec=App.fixRec(r)||blankRec(s); App.rec.name=s.name||App.rec.name; App.rec.lessons=Object.assign(Object.fromEntries(App.LESSON_KEYS.map(k=>[k,{}])),App.rec.lessons||{});
};
App.on=fn=>App.listeners.push(fn);
App.emit=()=>App.listeners.forEach(f=>{try{f()}catch(e){console.error(e)}});
function watchAll(){
  App.all=Object.assign({},LS.get('ailab.records',{}));Object.values(App.all).forEach(App.fixRec);
  if(!App.db){App.emit();return;}
  const t=setTimeout(()=>{App.allNote='班级数据暂时连不上，显示的是这台设备上的记录。';App.emit();},10000);
  App.db.collection('students').onSnapshot(snap=>{
    if(!snap.metadata.fromCache){clearTimeout(t);App.allNote='';}
    const m={}; snap.docs.forEach(d=>{const v=d.data(); if(v&&v.id) m[v.id]=App.fixRec(JSON.parse(JSON.stringify(v)));}); if(App.rec) m[App.rec.id]=App.rec;
    App.all=m; App.dbLive=true; App.emit();
  },()=>{clearTimeout(t);App.allNote='班级数据读取失败，显示的是这台设备上的记录。';App.emit();});
}

/* scoring */
App.scoreLesson=(k,rec)=>{const L=App.lessons[k]; const lr=(rec.lessons||{})[k]||{}; if(!L)return {}; let o; try{o=L.score(lr)||{};}catch(e){console.warn('score',k,e);return {};} Object.keys(o).forEach(d=>{if(o[d]!=null)o[d]=clamp(Math.round(o[d]));}); return o;};
App.progress=(k,rec)=>{const L=App.lessons[k]; const lr=(rec.lessons||{})[k]||{}; if(!L)return 0; try{return L.progress(lr)||0;}catch(e){console.warn('progress',k,e);return 0;}};
App.scoreAll=(rec,unit)=>{const out={}; const keys=unit?App.UNITS.find(u=>u.id===unit).lessons.map(l=>l.k):App.LESSON_KEYS; DIMS.forEach(d=>{let s=0,n=0; keys.forEach(k=>{ if(App.progress(k,rec)<=0)return; const v=App.scoreLesson(k,rec)[d.k]; if(v!=null){s+=v;n++;} }); out[d.k]=n?Math.round(s/n):null;}); return out;};
/* completion: one unit's lessons, or (no unit) every unit the student has started */
App.engagement=(rec,unit)=>{const units=unit?App.UNITS.filter(u=>u.id===unit):App.UNITS.filter(u=>u.lessons.some(l=>App.progress(l.k,rec)>0));if(!units.length)return 0;
  const ks=units.flatMap(u=>u.lessons.map(l=>l.k));return Math.round(ks.reduce((a,k)=>a+App.progress(k,rec),0)/ks.length*100);};

/* UI helpers */
App.toast=msg=>{const t=h(`<div class="toast" role="status">${esc(msg)}</div>`);document.body.appendChild(t);setTimeout(()=>t.remove(),2800);};
App.modal=(inner,wide)=>{const root=$('#modalRoot');root.innerHTML='';const m=h(`<div class="modal"><div class="card ${wide?'wide':''}"></div></div>`);m.firstElementChild.appendChild(typeof inner==='string'?h(inner):inner);root.appendChild(m);
  const close=()=>root.innerHTML='';m.addEventListener('click',e=>{if(e.target===m&&App.student)close();});return {el:m,close};};
/* station header: code + title stay prominent; the description is one quiet line (full text on hover / tap) */
const plain=s=>String(s??'').replace(/<[^>]*>/g,'').replace(/&nbsp;/g,' ').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
App.plain=plain;
const CODE={'WARM-UP':'热身','QUIZ':'小测验','DIARY':'成长日记','PRINCIPLE':'原理','APPLY':'用一用','TALK':'讨论','DISCUSS':'讨论','CASE':'案例','FAVS':'收藏夹','REVIEW':'回顾','FINALE':'结课'};
App.codeName=c=>{c=String(c||'').trim();const m=/^EXP-0?(\d+)([a-z]?)$/i.exec(c);return CODE[c]||(m?'实验 '+m[1]+(m[2]?' · 续'+({b:'',c:'二',d:'三'}[m[2].toLowerCase()]||''):''):c);};
/* station header. desc = the 任务 sentence (one line, what to do); it is drawn as the blue task bar. */
App.head=(code,ch,title,desc)=>`<div class="st-head"><span class="tag"><span class="code" data-code="${esc(code)}">${esc(App.codeName(code))}</span><span class="ch">${ch}</span><span class="stars" data-stars aria-label="本站星星"></span></span><h2>${title}</h2>${desc?`<p class="st-desc">${desc}</p>`:''}</div>`;

/* ================= v3 design-language helpers =================
   Roles (see SPEC.md): 任务 App.head · 玩法 <ol class="steps"> · 调一调 App.knobs · 大按钮 App.go · AI 回答 App.aiBox/App.aiSay · 反馈 App.fb · 我的记录 App.pad */
App.bot=(m='idle')=>{const S='stroke="#1b2550" stroke-width="3" stroke-linecap="round" fill="none"';
  const eye={idle:'<circle cx="24" cy="34" r="4"/><circle cx="40" cy="34" r="4"/>',happy:`<path d="M19 36q5-7 10 0M35 36q5-7 10 0" ${S}/>`,think:'<circle cx="26" cy="32" r="4"/><circle cx="42" cy="32" r="4"/>',oops:`<path d="M20 30l7 7M27 30l-7 7M37 30l7 7M44 30l-7 7" ${S}/>`}[m]||'';
  const mouth={idle:`<path d="M27 45h10" ${S}/>`,happy:`<path d="M25 43q7 7 14 0" ${S}/>`,think:'<circle cx="35" cy="46" r="2.6"/>',oops:`<path d="M26 47q6-5 12 0" ${S}/>`}[m]||'';
  return `<svg class="bot" data-mood="${m}" viewBox="0 0 64 64" aria-hidden="true"><path d="M32 12V7" ${S}/><circle cx="32" cy="6" r="4" fill="#ff6b4a" stroke="#1b2550" stroke-width="2.5"/><rect x="3" y="28" width="7" height="14" rx="3.5" fill="#ffd43b" stroke="#1b2550" stroke-width="2.5"/><rect x="54" y="28" width="7" height="14" rx="3.5" fill="#ffd43b" stroke="#1b2550" stroke-width="2.5"/><rect x="9" y="12" width="46" height="46" rx="14" fill="#7d5cf0" stroke="#1b2550" stroke-width="3"/><rect x="15" y="22" width="34" height="30" rx="10" fill="#fff" stroke="#1b2550" stroke-width="2.5"/><g fill="#1b2550">${eye}${mouth}</g></svg>`;};
/* 调一调: rows = [[label, controlsHTML, smallHint?], …] — at most 5 rows */
App.knobs=(rows,title='调一调')=>`<div class="knobs"><div class="knobs-t">${title}</div>${rows.map(r=>`<div class="knob"><span class="knob-k">${r[0]}${r[2]?`<small>${r[2]}</small>`:''}</span><div class="knob-v">${r[1]}</div></div>`).join('')}</div>`;
/* a row of exclusive choices: opts = [[value,label],…]; wire with App.segWire(root,name,fn) */
App.seg=(name,opts,cur)=>`<span data-seg="${esc(name)}" style="display:contents">${opts.map(([v,t])=>`<button type="button" class="chip ${String(v)===String(cur)?'on':''}" data-v="${esc(v)}">${t}</button>`).join('')}</span>`;
App.segWire=(root,name,fn)=>{const box=$(`[data-seg="${name}"]`,root);if(!box)return;$$('.chip',box).forEach(b=>b.onclick=()=>{$$('.chip',box).forEach(x=>x.classList.toggle('on',x===b));fn(b.dataset.v,b);});};
App.segVal=(root,name)=>{const b=$(`[data-seg="${name}"] .chip.on`,root);return b?b.dataset.v:null;};
App.range=(id,min,max,step,val,unit='')=>`<input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${val}" data-unit="${esc(unit)}"><output id="${id}-o" for="${id}">${val}${esc(unit)}</output>`;
App.rangeWire=(id,fn)=>{const i=$('#'+id),o=$('#'+id+'-o');if(!i)return;i.oninput=()=>{if(o)o.textContent=i.value+(i.dataset.unit||'');fn(+i.value,i);};};
/* the one big button of a station */
App.go=(id,label)=>`<button class="btn go" id="${id}" type="button" data-label="${esc(label)}">${label}</button>`;
App.busy=(btn,on,label)=>{if(!btn)return;btn.disabled=!!on;btn.classList.toggle('busy',!!on);btn.textContent=on?(label||'AI 正在想…'):(btn.dataset.label||btn.textContent);};
/* AI 的回答: the purple bubble. aiBox() makes the empty bubble; aiSay() fills it after a run. */
App.aiBox=(id,wait='按下大按钮，AI 的回答会出现在这里',who='AI 的回答')=>`<div class="ai-out wait" id="${id}" aria-live="polite">${App.bot('idle')}<div class="ai-who"><span>${who}</span><span class="ai-src"></span></div><div class="ai-body">${wait}</div></div>`;
App.aiSay=(box,html,o={})=>{if(typeof box==='string')box=$(box);if(!box)return;const mood=o.busy?'think':(o.mood||'idle');
  const old=$('.bot',box);if(old)old.outerHTML=App.bot(mood);box.classList.toggle('wait',false);box.classList.toggle('busy',!!o.busy);
  $('.ai-body',box).innerHTML=html;const src=$('.ai-src',box);
  if(src){if(o.src){const real=o.src!=='offline';const name=(App.AI&&App.AI.NAMES&&App.AI.NAMES[o.src])||o.src;src.innerHTML=`<span class="ai-badge ${real?'real':''}">来源：${esc(name)}</span>`;}else if(o.busy)src.innerHTML='';}
  if(!o.busy){box.classList.remove('pop');void box.offsetWidth;box.classList.add('pop');}};
/* 反馈: call after every run. kind = ok | oops (AI 出错了) | find (新发现) | try (再试试). title/text are HTML (escape user text yourself).
   o.stars 0–3 gives the station its stars (the best result is kept); o.cheer throws confetti. Marks the station as .ran. */
App.fb=(slot,kind,title,text,o={})=>{if(typeof slot==='string')slot=$(slot);if(!slot)return;const IC={ok:'✓',oops:'!',find:'✦',try:'↻'};const n=o.stars;
  slot.classList.add('fbx-slot');slot.innerHTML=`<div class="fbx ${IC[kind]?kind:'find'}" role="status"><i class="ic">${IC[kind]||'✦'}</i><b>${title}</b>${text?`<p>${text}</p>`:''}${n!=null?`<span class="st" aria-label="${n} 颗星">${'<b>★</b>'.repeat(n)}${'★'.repeat(Math.max(0,3-n))}</span>`:''}</div>`;
  const st=slot.closest('.station');if(st){st.classList.add('ran');if(n!=null)App.star(st,n);}
  if(o.cheer||(n>=3&&kind!=='try'))App.cheer(slot.firstElementChild);};
App.ran=st=>{if(st)st.classList.add('ran');};
App.cheer=el=>{if(!el||matchMedia('(prefers-reduced-motion:reduce)').matches)return;const C=['#ff6b4a','#ffd43b','#12b886','#2f6bff','#7d5cf0'];
  for(let i=0;i<22;i++){const p=document.createElement('span');p.className='confetti';const a=Math.random()*Math.PI*2,d=70+Math.random()*120;p.style.cssText=`background:${C[i%5]};--dx:${Math.cos(a)*d}px;--dy:${Math.sin(a)*d-40}px;--rot:${Math.random()*540-270}deg`;el.appendChild(p);setTimeout(()=>p.remove(),950);}};
/* stars per station, kept in the lesson record (lr.stars[stationId]); never used for the ability scores */
const lessonOf=st=>{const v=st&&st.closest('.view');return v?v.id.replace(/^v-/,''):null;};
App.star=(st,n)=>{const k=lessonOf(st);if(!k||!App.rec||!st.id)return;const lr=App.lesson(k);lr.stars=lr.stars||{};if((n||0)>(lr.stars[st.id]||0)){lr.stars[st.id]=n;App.touch();}App.paintStars(st);};
App.paintStars=st=>{const el=$('[data-stars]',st);const k=lessonOf(st);if(!el||!k||!App.rec)return;const n=((App.lesson(k).stars)||{})[st.id];el.innerHTML=n==null?'':'<b>★</b>'.repeat(n)+'★'.repeat(Math.max(0,3-n));};
App.starsOf=(k,rec)=>Object.values((((rec||App.rec||{}).lessons||{})[k]||{}).stars||{}).reduce((a,b)=>a+(+b||0),0);
/* 观察任务: several short questions shown ONE at a time. store = object in the lesson record ({id:{first,ok,last}}); onChange(answered,total) */
App.askSeq=(root,qs,store,onChange)=>{if(!root)return;let i=qs.findIndex(q=>!store[q.id]);if(i<0)i=qs.length-1;
  const draw=()=>{const q=qs[i];root.innerHTML=`<div class="q" data-q="${q.id}" style="border:0;padding:0"><b><span class="note">第 ${i+1} / ${qs.length} 个</span><br>${q.q}</b><div class="opts">${q.opts.map((o,j)=>`<button type="button" class="chip" data-j="${j}">${esc(o)}</button>`).join('')}</div><div class="fb" aria-live="polite"></div><div class="row"><button type="button" class="btn ghost sm" data-prev ${i?'':'hidden'}>上一个</button><button type="button" class="btn sm" data-next hidden>下一个</button></div></div>`;
    const show=j=>{$$('.chip',root).forEach(b=>b.classList.toggle('on',+b.dataset.j===j));const fb=$('.fb',root),ok=j===q.a;fb.className='fb '+(ok?'ok':'no');fb.textContent=(ok?'观察准确！':'再看一次：')+q.why;$('[data-next]',root).hidden=i>=qs.length-1;};
    if(store[q.id])show(store[q.id].last);
    $$('.chip',root).forEach(b=>b.onclick=()=>{const j=+b.dataset.j;store[q.id]=store[q.id]||{first:j,ok:j===q.a};store[q.id].last=j;show(j);App.touch();if(onChange)onChange(Object.keys(store).length,qs.length);});
    $('[data-prev]',root).onclick=()=>{i--;draw();};$('[data-next]',root).onclick=()=>{i++;draw();};};draw();};

/* ---------- 写字题的引导：句子开头 + 示例（见 hints.js） ---------- */
App.hintify=root=>{$$('textarea',root).forEach(t=>{if(t.dataset.h||!t.id)return;t.dataset.h=1;const H=(App.HINTS||{})[t.id]||{};
  let st=H.s;if(!st){st=(t.placeholder||'').split(/[；;\n]/).map(x=>x.replace(/^(例如|比如|如)[：:]?/,'').trim()).map(x=>x.split('……')[0].trim()).filter(x=>x.length>=2&&x.length<=14).slice(0,3);}
  if(!st.length&&!H.ref)return;const bar=document.createElement('div');bar.className='hintbar';
  bar.innerHTML=`<span class="hb-t">不知道怎么写？点一个开头</span>${st.map(x=>`<button type="button" class="hb-s">${esc(x)}</button>`).join('')}${H.ref?`<button type="button" class="hb-r">看示例</button><div class="hb-ref" hidden><b>示例</b>（可以参考，记得写自己的话）<p>${esc(H.ref).replace(/\n/g,'<br>')}</p></div>`:''}`;
  t.insertAdjacentElement('afterend',bar);
  $$('.hb-s',bar).forEach(b=>b.onclick=()=>{const add=b.textContent+(/[：:，,》]$/.test(b.textContent)?'':'');t.value=(t.value&&!/[\s\n]$/.test(t.value)?t.value+'\n':t.value)+add;t.focus();t.setSelectionRange(t.value.length,t.value.length);t.dispatchEvent(new Event('input',{bubbles:true}));});
  const r=$('.hb-r',bar);if(r)r.onclick=()=>{const box=$('.hb-ref',bar);box.hidden=!box.hidden;r.textContent=box.hidden?'看示例':'收起示例';};});};
/* ---------- AI 作品完整展示：不在小框里滚动。文字类直接展开；很长的代码折叠成「展开全部」 ---------- */
App.unscroll=root=>{$$('*',root).forEach(el=>{if(el.dataset.us||/^(TEXTAREA|SELECT|IFRAME|INPUT|CANVAS)$/.test(el.tagName)||el.closest('.modal,.pg-steps,.side'))return;
  if(el.scrollHeight<=el.clientHeight+6||el.clientHeight<40)return;const oy=getComputedStyle(el).overflowY;if(oy!=='auto'&&oy!=='scroll')return;el.dataset.us=1;
  const full=el.scrollHeight;el.style.maxHeight='none';el.style.height='auto';el.style.overflowY='visible';
  if(full>620&&(el.matches('.code-view,pre,.meta')||el.querySelector('code'))){el.classList.add('clamp');el.style.maxHeight='420px';el.style.overflowY='hidden';
    const b=document.createElement('button');b.type='button';b.className='btn ghost sm clamp-btn';b.textContent='展开全部';el.insertAdjacentElement('afterend',b);
    b.onclick=()=>{const open=el.classList.toggle('open');el.style.maxHeight=open?'none':'420px';b.textContent=open?'收起':'展开全部';};}});};
setInterval(()=>{const v=App.current&&$('#v-'+App.current);if(!v||v.hidden)return;const st=$(':scope > .station:not(.pg-off)',v)||v;try{App.hintify(st);App.unscroll(st);}catch(e){}},900);
/* 我的记录: one question on notebook paper */
App.pad=(ask,html,title='我的记录')=>`<div class="note-pad"><h4>${title}</h4>${ask?`<div class="ask">${ask}</div>`:''}${html||''}</div>`;
/* lesson cover art + hero */
const ART={l1:'<path d="M6 32q26-26 52 0q-26 26-52 0z"/><circle cx="32" cy="32" r="8" fill="#fff"/>',l2:'<rect x="8" y="12" width="48" height="40" rx="6"/><path d="M14 44l12-14 9 9 6-6 9 11"/><circle cx="44" cy="23" r="3" fill="#fff"/>',l3:'<rect x="8" y="14" width="48" height="36" rx="8"/><path d="M27 24v16l14-8z" fill="#fff"/>',
 l4:'<rect x="24" y="8" width="16" height="28" rx="8"/><path d="M14 30a18 18 0 0 0 36 0M32 48v8"/>',l5:'<path d="M10 26h10l12-10v32l-12-10H10z" fill="#fff"/><path d="M41 24q6 8 0 16M48 17q12 15 0 30"/>',l6:'<circle cx="32" cy="32" r="22"/><path d="M10 32h44M32 10q-14 22 0 44M32 10q14 22 0 44"/>',
 l7:'<path d="M50 10Q20 14 16 46l-4 8M16 46q18-2 26-16M24 34h14"/>',l8:'<circle cx="28" cy="28" r="16"/><path d="M40 40l14 14"/>',l9:'<rect x="14" y="8" width="36" height="48" rx="6"/><path d="M22 22h20M22 32h20M22 42h12"/>',
 l10:'<path d="M24 18L8 32l16 14M40 18l16 14-16 14M36 12l-8 40"/>',l11:'<rect x="6" y="20" width="52" height="28" rx="14"/><path d="M18 34h12M24 28v12"/><circle cx="42" cy="31" r="2.5" fill="#fff"/><circle cx="48" cy="38" r="2.5" fill="#fff"/>',l12:'<circle cx="32" cy="32" r="13"/><path d="M8 40q24 8 48-16"/>',
 l13:'<rect x="12" y="8" width="40" height="48" rx="6"/><path d="M22 32l8 8 14-16"/>',l14:'<rect x="10" y="10" width="44" height="44" rx="10"/><circle cx="22" cy="22" r="3" fill="#fff"/><circle cx="32" cy="32" r="3" fill="#fff"/><circle cx="42" cy="42" r="3" fill="#fff"/>',l15:'<path d="M10 52h44M16 44V32M28 44V22M40 44V28M52 44V14"/>'};
App.art=k=>`<svg viewBox="0 0 64 64" aria-hidden="true" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">${ART[k]||''}</svg>`;
/* lesson opening block: title, one-line lead, 学习目标, coloured art tile */
App.hero=(k,lead,goals)=>{const info=App.lessonInfo(k),u=App.UNITS.find(x=>x.id===info.unit),n=+k.slice(1);
  return `<div class="hero lhero ${u.id}"><span class="eyebrow">第 ${n} 讲 · ${u.no} ${u.name}</span><h1>${info.n.replace(/^第\d+讲\s*/,'')}</h1><p class="lead">${lead||''}</p>${goals&&goals.length?`<div class="goal-row">${goals.map((t,i)=>`<span><i>${i+1}</i>${t}</span>`).join('')}</div>`:''}</div>`;};
/* a truncated description opens in place when tapped (touch screens have no tooltip) */
document.addEventListener('click',e=>{const p=e.target.closest&&e.target.closest('p.st-desc');if(!p||e.target.closest('a,button,input,select,textarea,label'))return;if(p.classList.contains('full')||p.scrollWidth>p.clientWidth+1)p.classList.toggle('full');});
document.addEventListener('mouseover',e=>{const p=e.target.closest&&e.target.closest('p.st-desc');if(p)p.classList.toggle('cut',p.classList.contains('full')||p.scrollWidth>p.clientWidth+1);},{passive:true});
App.know=(title,text)=>`<div class="know"><h4>知识卡 · ${title}</h4><p>${text}</p></div>`;
App.obs=(items,title='观察与发现')=>`<div class="obs"><h4>${title}</h4><ol>${items.map(i=>`<li>${i}</li>`).join('')}</ol></div>`;
App.think=(items)=>`<div class="think"><h4>思考园地</h4><ol>${items.map(i=>`<li>${i}</li>`).join('')}</ol></div>`;
App.goals=(items)=>`<div class="goals"><b>学习目标</b>${items.map((t,i)=>`<span class="n">0${i+1}</span><span class="t">${t}</span>`).join('')}</div>`;
App.markStep=(root,i)=>{const li=$$('.steps li',root)[i]; if(li) li.classList.add('done');};
App.txtScore=(s,full=30)=>clamp(Math.round(100*Math.min(1,((s||'').trim().length)/full)));
App.loadImg=src=>new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=src;});

App.quiz=function(root,k,qs){
  const lr=App.lesson(k); lr.quiz=lr.quiz||{};
  root.innerHTML=qs.map((q,i)=>`<div class="q" data-q="${q.id}"><b>${i+1}. ${q.q}</b><div class="opts">${q.opts.map((o,j)=>`<button type="button" class="chip" data-j="${j}">${String.fromCharCode(65+j)}. ${esc(o)}</button>`).join('')}</div><div class="fb" aria-live="polite"></div></div>`).join('');
  qs.forEach(q=>{const box=$(`[data-q="${q.id}"]`,root); const show=(j)=>{ $$('.chip',box).forEach(b=>b.classList.toggle('on',+b.dataset.j===j)); const ok=j===q.a; const fb=$('.fb',box); fb.className='fb '+(ok?'ok':'no'); fb.textContent=(ok?'正确。':'再想想。')+q.why; };
    const prev=App.lesson(k).quiz[q.id]; if(prev) show(prev.last);
    $$('.chip',box).forEach(b=>b.onclick=()=>{const j=+b.dataset.j; const Q=App.lesson(k).quiz; Q[q.id]=Q[q.id]||{first:j,ok:j===q.a}; Q[q.id].last=j; show(j); App.touch();});});
};
App.quizScore=(lr,ids)=>{const Q=(lr.quiz)||{};if(!ids.some(id=>Q[id]))return 0;return Math.round(100*ids.filter(id=>Q[id]&&Q[id].ok).length/ids.length);};

App.diary=function(root,k,cfg){
  const lr=App.lesson(k); lr.diary=lr.diary||{};
  root.innerHTML=`${App.head('DIARY','成长日记',cfg.title,cfg.lead)}
   <div class="grid2"><div class="box"><div class="box-t">我的实验记录（自动收集）</div><div class="dia-ex"></div></div>
   <div class="note-pad"><h4>写给自己</h4>${cfg.fields.map(f=>`<label class="f" for="d-${k}-${f.id}">${f.q}<textarea id="d-${k}-${f.id}" placeholder="${esc(f.ph||'')}">${esc(lr.diary[f.id]||'')}</textarea></label>`).join('')}
   ${cfg.pledge?`<label class="row" style="font-size:14px;color:var(--fg)"><input type="checkbox" id="d-${k}-pledge" ${lr.diary.pledge?'checked':''}> ${cfg.pledge}</label>`:''}
   <div class="row"><button class="btn go" type="button" id="d-${k}-submit">交日记</button><span class="done-badge" id="d-${k}-state">${lr.diary.submitted?'✓ 已提交，能力图谱已更新':''}</span></div></div></div>`;
  let t; cfg.fields.forEach(f=>$(`#d-${k}-${f.id}`,root).addEventListener('input',e=>{App.lesson(k).diary[f.id]=e.target.value;clearTimeout(t);t=setTimeout(App.touch,700);}));
  if(cfg.pledge) $(`#d-${k}-pledge`,root).onchange=e=>{App.lesson(k).diary.pledge=e.target.checked;App.touch();};
  $(`#d-${k}-submit`,root).onclick=()=>{const d=App.lesson(k).diary; const filled=cfg.fields.filter(f=>(d[f.id]||'').trim().length>=6).length;
    if(filled<cfg.fields.length){App.toast(`还有 ${cfg.fields.length-filled} 个问题没写完（每题至少写一句完整的话）`);return;}
    d.submitted=Date.now(); App.touch(); $(`#d-${k}-state`,root).textContent='✓ 已提交，能力图谱已更新'; App.toast('成长日记已提交，能力图谱更新啦'); App.cheer($(`#d-${k}-submit`,root).parentElement); const st=root.closest('.station'); if(st)App.star(st,3);};
  const ex=$('.dia-ex',root); const draw=()=>{ex.innerHTML='';cfg.extras(ex);}; draw(); return draw;
};

/* login */
App.login=function(){
  const s=App.student||{grade:5,cls:1,no:1,name:''};
  const card=h(`<form style="display:flex;flex-direction:column;gap:14px">
   <div><span class="eyebrow">人工智能通识课</span><h2 style="margin-top:6px;font-family:var(--f-display);font-weight:800;font-size:28px">欢迎来到 AI 小实验室</h2><p class="note" style="margin-top:4px">选好班级和学号就能开始。你做的每个实验都会点亮自己的能力图谱。</p></div>
   <div class="grid3"><label class="f" for="lg-g">年级<select id="lg-g">${[4,5,6].map(g=>`<option value="${g}" ${g==s.grade?'selected':''}>${g} 年级</option>`).join('')}</select></label>
   <label class="f" for="lg-c">班级<select id="lg-c">${Array.from({length:12},(_,i)=>i+1).map(c=>`<option value="${c}" ${c==s.cls?'selected':''}>${c} 班</option>`).join('')}</select></label>
   <label class="f" for="lg-n">学号<select id="lg-n">${Array.from({length:55},(_,i)=>i+1).map(c=>`<option value="${c}" ${c==s.no?'selected':''}>${c} 号</option>`).join('')}</select></label></div>
   <label class="f" for="lg-name">昵称（不必写全名）<input type="text" id="lg-name" maxlength="12" value="${esc(s.name)}" placeholder="例如：小禾"></label>
   <div class="row"><button class="btn go" type="submit">进入实验室</button><button class="btn ghost" type="button" id="lg-teacher">我是老师，直接看学情分析</button></div>
   <p class="note">不要在平台里填写身份证号、住址、电话等个人信息。</p></form>`);
  const m=App.modal(card);
  card.onsubmit=async e=>{e.preventDefault(); App.student={grade:+$('#lg-g',card).value,cls:+$('#lg-c',card).value,no:+$('#lg-n',card).value,name:$('#lg-name',card).value.trim()||'同学'}; LS.set('ailab.student',App.student); m.close(); await App.loadRec(); App.touch(); App.renderAll(); };
  $('#lg-teacher',card).onclick=()=>{m.close(); location.hash='#class';};
};
App.renderWho=()=>{$('#whoName').innerHTML=App.student?`<b>${esc(App.student.name)}</b> · ${App.className(`g${App.student.grade}c${App.student.cls}`)} ${App.student.no}号`:'未登录';};

/* routing */
const VIEWS=['home',...App.LESSON_KEYS,'me','class'];
App.route=function(){ let v=(location.hash||'#home').slice(1); if(!VIEWS.includes(v)) v='home';
  if(App.unitOf(v)&&App.unitOf(v)!==App.unit){App.unit=App.unitOf(v);LS.set('ailab.unit',App.unit);}
  VIEWS.forEach(x=>{const el=$('#v-'+x);if(el)el.hidden=x!==v;}); App.renderNav(v);
  const prev=App.current; App.current=v; Object.entries(App.lessons).forEach(([k,L])=>{if(k!==v&&L.onHide)L.onHide();});
  const L=App.lessons[v]; if(L&&L.onShow) L.onShow(); if(v==='me'&&App.renderMe) App.renderMe(); if(v==='class'&&App.renderClass) App.renderClass(); if(v==='home') renderHome();
  if([...App.LESSON_KEYS,'me'].includes(v)&&!App.student&&!$('#modalRoot .modal')) App.login(); if(prev!==v) window.scrollTo(0,0); };

/* App.renderNav lives in nav.js */
function renderHome(){
  const r=App.rec;
  const META={l1:['cover_l1.jpg','LESSON 01 · 图像识别','AI 怎么看图？什么时候会看错？','AI 认一认 · 找茬实验室 · 路口监控追踪 · 复杂场景'],
   l2:['cover_l2.jpg','LESSON 02 · 文生图','怎样把一句诗变成一幅画？','提示词工作台 · 画风对比 · 字面与意境 · 内容标识检查'],
   l3:['cover_l3.jpg','LESSON 03 · 视频生成','画面是怎么动起来的？','帧率实验 · 图生视频 · 诗句电影棚 · 导演审片'],
   l4:['cover_l4.jpg','LESSON 04 · 语音识别','AI 怎样把声音变成文字？什么时候会听错？','听写小考官 · 同音词擂台 · 噪音实验室'],
   l5:['cover_l5.jpg','LESSON 05 · 语音合成与克隆','AI 怎样用不同的声音说话？声音被模仿了怎么办？','配音工作台 · 声音克隆体验 · 防骗小剧场 · 声音使用公约'],
   l6:['cover_l6.jpg','LESSON 06 · 机器翻译','AI 怎样翻译？为什么要给它语境？','环球翻译厅 · 语境小实验 · 人机翻译擂台 · 跨语言小导游'],
   l7:['cover_l7.jpg','LESSON 07 · AI 写作','AI 怎样写诗？它的诗能打动人吗？','诗词工坊 · 提示词对比器 · 仿写挑战 · 人机对决墙'],
   l8:['cover_l8.jpg','LESSON 08 · AI 搜索与信息辨别','AI 找来的资料都可信吗？','研究小助手 · 提示词设计器 · 真假资料侦探 · 资料收藏夹'],
   l9:['cover_l9.jpg','LESSON 09 · 资料整理与研究报告','怎样让 AI 帮忙整理资料、修改报告，又由自己做主？','整理魔法棒 · 报告协作台 · 修改决策记录'],
   l10:['cover_l10.jpg','LESSON 10 · AI 编程 · 网页','怎样用一句话让 AI 做出网页？网页背后是什么？','网页生成器 · 提示词对比台 · 代码探秘'],
   l11:['cover_l11.jpg','LESSON 11 · AI 编程 · 游戏','怎样让 AI 做出好玩的小游戏，再一步步改得更好？','游戏工坊 · 优化需求卡 · 速算挑战'],
   l12:['cover_l12.jpg','LESSON 12 · AI 编程 · 科学动画','AI 做的科学动画一定对吗？怎样求证？','科学动画实验室 · 科学验证器 · 找错误挑战'],
   l13:['cover_l13.jpg','LESSON 13 · AI 辅助数学','AI 能当我们的数学陪练吗？怎样用它才不让自己变懒？','人机赛跑 · 私人出题机 · 错题银行'],
   l14:['cover_l14.jpg','LESSON 14 · AI 推理','AI 是怎样一步步推理的？被误导时会怎样？','猜数推理台 · 误导实验 · 24 点擂台'],
   l15:['cover_l15.jpg','LESSON 15 · 学情诊断与智能体','AI 能像老师一样诊断学习、制订方案吗？','学习诊断仪 · 方案调整台 · 我的成长蓝图']};
  const Q={u1:['计算机是怎么“看懂”一张图片的？为什么它也会看走眼？','AI 怎样把文字变成画面？怎样写提示词，它才画得出你想要的样子？','一幅画是怎么变成视频的？在人和 AI 的合作里，谁说了算？'],
   u2:['AI 是怎样“听懂”我们说话的？环境、语速、同音词会怎样影响它？','AI 怎样合成不同的声音？声音被冒用，会带来什么风险？','AI 怎样把一种语言变成另一种语言？为什么语境这么重要？'],
   u3:['AI 是怎样“写”出诗来的？它写的诗和诗人的诗差在哪里？','AI 找来的资料一定可信吗？怎样核查来源、辨别真假？','怎样让 AI 帮忙整理资料、修改报告，同时由自己做主？'],
   u4:['网页背后是什么？怎样用一句话让 AI 写出网页代码？','AI 怎样“复刻”经典游戏？怎样把游戏越改越好玩？','AI 做的科学动画一定对吗？人和 AI 在科学探究里各做什么？'],
   u5:['AI 怎样帮我们出题、批改、解题？怎样用它才能既高效又不依赖？','AI 是怎样推理的？它的推理有哪些优势和局限？','AI 能诊断学习情况、制订学习方案吗？什么是智能体？']};
  const card=(k,u)=>{const m=META[k],info=App.lessonInfo(k),p=r?Math.round(App.progress(k,r)*100):0,st=r?App.starsOf(k,r):0;
    return `<a class="lcard ${u.id}" href="#${k}"><div class="in"><div class="lc-top"><span class="num">${+k.slice(1)}</span><span class="pct ${p>=100?'done':p?'doing':''}">${p>=100?'已完成':p?'完成 '+p+'%':'未开始'}</span>${st?`<span class="lc-star">★ ${st}</span>`:''}</div><h3>${info.n.replace(/^第\d+讲 /,'')}</h3><p class="ask">${m[2]}</p><div class="prog" title="完成 ${p}%"><i style="width:${p}%"></i></div></div></a>`;};
  const name=App.student&&App.student.name?esc(App.student.name):'同学';
  $('#v-home').innerHTML=`<div class="hero home-hero"><div><span class="eyebrow">人工智能通识课 · 小学高年级</span><h1>${name}，来给 AI 出难题！</h1><p class="lead">每一站只做一件事：调一调，按下大按钮，看 AI 怎么回答。它答对了、答错了，都是你的发现。</p></div>
   <div class="hero-bot">${App.bot('happy')}<span class="say">今天想考考我什么？</span></div></div>
   <div class="rules"><div class="rule"><i>1</i><span>一次只改一个地方，才知道是谁带来了变化。</span></div><div class="rule"><i>2</i><span>先猜一猜，再看结果，把发现记下来。</span></div><div class="rule"><i>3</i><span>不上传自己或别人的照片、录音和个人信息。</span></div></div>
   ${App.UNITS.map((u,ui)=>{const pe=r?App.engagement(r,u.id):0;return `<section class="unit-sec ${u.id}" id="home-${u.id}"><div class="unit-head"><h2><i>${u.no}</i>${u.name}</h2><span class="note">已完成 ${pe}%</span></div>
    <div class="unit">${u.lessons.map(l=>card(l.k,u)).join('')}</div></section>`;}).join('')}
   <details class="more"><summary>关于 AI 生成内容、声音和隐私</summary><p class="note">平台上 AI 生成的图片、视频和声音都带有“AI 生成”标识。我国《人工智能生成合成内容标识办法》要求，AI 生成合成的内容要进行标识；把作品分享给别人时，也要主动说明哪些是 AI 做的。</p><p class="note">录音只在你的设备上处理，用完即删，不会保存到班级数据里。不录别人的声音，不模仿别人的声音；听到“熟人”的语音要钱、要密码，一定先核实。</p></details>`;
}
App.renderAll=()=>{App.renderWho(); Object.values(App.lessons).forEach(L=>L.render&&L.render()); App.route();};

App.start=async function(){
  window.addEventListener('hashchange',App.route);
  $('#switchBtn').onclick=()=>App.login();
  App.renderWho(); Object.values(App.lessons).forEach(L=>L.render&&L.render()); App.route();
  if(!App.student && App.current!=='class') App.login();
  if(App.AI) App.AI.init();
  if(window.claude&&claude.use){ claude.use('db').then(async db=>{ if(!db) return; App.db=db; await App.loadRec(); App.renderAll(); watchAll(); }).catch(()=>{}); }
  await App.loadRec(); if(App.rec){App.renderAll();} watchAll();
};
})();
