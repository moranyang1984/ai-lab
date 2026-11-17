/* 第4讲 听写实验室 (v3) — 声音变文字 / 听写小考官 / 谁让 AI 听错 / 同音词擂台 / 拆掉线索 / 噪音实验室 / 错误侦探 / 小组录音怎么做 / 小测 / 成长日记 */
(function(){
const {$,$$,esc,clamp}=App;const K='l4';const L={};App.lessons[K]=L;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
App.HINTS=App.HINTS||{};Object.assign(App.HINTS,{'l4-intro-why':{s:['我这样猜，是因为'],ref:'我这样猜，是因为集市里很吵，好几个人一起说话，连我自己都听不清，AI 可能也会听错。'}});
/* 原文 / AI 两行对照：一列一个字，放不下就换行（不在小框里横向拖） */
const dHTML=ops=>{const c=(x,k)=>`<i class="${k}">${x?esc(x):'∅'}</i>`;return `<div class="l4-df"><span class="k"><i>原文</i><i>AI</i></span>${ops.map(o=>`<span class="${o.op}">${c(o.r,'r')}${c(o.h,'h')}</span>`).join('')}</div>`;};
/* 观察题：一次一题，可前后翻；只出学生已经做过的那部分实验的题。get() → {qs:[{id,q,opts,a|ok:[…],why}],more} */
function seq(root,get,store,onChange){if(!root)return()=>{};let i=-1;
 const draw=()=>{const {qs,more}=get();if(!qs.length){root.innerHTML=`<p class="note">${more||''}</p>`;return;}
  if(i<0||i>=qs.length){i=qs.findIndex(q=>!store[q.id]);if(i<0)i=qs.length-1;}
  const q=qs[i],okOf=j=>(q.ok||[q.a]).includes(j);
  root.innerHTML=`<div class="q" data-q="${q.id}" style="border:0;padding:0"><b><span class="note">第 ${i+1} / ${qs.length} 个</span><br>${q.q}</b><div class="opts">${q.opts.map((o,j)=>`<button type="button" class="chip" data-j="${j}">${esc(o)}</button>`).join('')}</div><div class="fb" aria-live="polite"></div><div class="row"><button type="button" class="btn ghost sm" data-prev ${i?'':'hidden'}>上一个</button><button type="button" class="btn sm" data-next hidden>下一个</button></div>${more?`<p class="note">${more}</p>`:''}</div>`;
  const show=j=>{$$('.chip',root).forEach(b=>b.classList.toggle('on',+b.dataset.j===j));const fb=$('.fb',root),ok=okOf(j);fb.className='fb '+(ok?'ok':'no');fb.textContent=(ok?'观察准确！':'再看一次：')+q.why;$('[data-next]',root).hidden=i>=qs.length-1;};
  if(store[q.id])show(store[q.id].last);
  $$('.chip',root).forEach(b=>b.onclick=()=>{const j=+b.dataset.j;store[q.id]=store[q.id]||{first:j,ok:okOf(j)};store[q.id].last=j;show(j);if(onChange)onChange();});
  $('[data-prev]',root).onclick=()=>{i--;draw();};$('[data-next]',root).onclick=()=>{i++;draw();};};
 draw();return()=>{i=-1;draw();};}
const unGuess=(st,name)=>$$(`[data-seg="${name}"] .chip`,st).forEach(x=>x.classList.remove('on'));
const hsh=s=>{let h=2166136261;for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return ((h>>>0)%10007)/10007;};
const avg=a=>a.length?Math.round(a.reduce((x,y)=>x+y,0)/a.length):null;
const PRIV='录音只在本机处理、不保存；只录自己的声音。';
const PRIV_FULL='隐私说明：录音只在这台设备的内存里处理，不保存、不上传（只有识别时才交给识别引擎），离开本页即删除。只录自己的声音，不录别人。';

/* ---------- texts for EXP-01 (rare = characters the simulated recogniser has not learned → replaced by a common same-sounding character) ---------- */
const TEXTS=[
 {id:'cx',name:'《春晓》',kind:'common',au:'唐 · 孟浩然',text:'春眠不觉晓，处处闻啼鸟。夜来风雨声，花落知多少。',near:'纯棉步绝小出触文提袅叶赖封语生华洛之夺烧',rare:{}},
 {id:'jy',name:'《静夜思》',kind:'common',au:'唐 · 李白',text:'床前明月光，疑是地上霜。举头望明月，低头思故乡。',near:'窗钱名越广移事第尚双局投往名越堤投丝顾香',rare:{}},
 {id:'ls',name:'《陋室铭》节选',kind:'rare',au:'唐 · 刘禹锡',text:'苔痕上阶绿，草色入帘青。谈笑有鸿儒，往来无白丁。无丝竹之乱耳，无案牍之劳形。',near:'台很尚接律曹涩如连轻谭效又红如网赖吴百盯吴思主知峦尔吴暗读知牢行',rare:{苔:'台',帘:'连',鸿:'红',儒:'如',牍:'读'}},
 {id:'al',name:'《爱莲说》节选',kind:'rare',au:'宋 · 周敦颐',text:'予独爱莲之出淤泥而不染，濯清涟而不妖，中通外直，不蔓不枝，香远益清，亭亭净植。',near:'雨读碍连知初于你儿步然浊轻连儿步腰钟同歪值步漫步知乡院亦轻停停静值',rare:{予:'余',淤:'于',濯:'浊',涟:'连',蔓:'漫',益:'亦',亭:'婷'}}];
const TX=id=>TEXTS.find(t=>t.id===id)||TEXTS[0];
const RATES={slow:{n:'慢速',sps:2.6,tts:.7},normal:{n:'正常',sps:4,tts:1},fast:{n:'快速',sps:6.5,tts:1.7}};
const CLS={clear:{n:'清晰',v:1},mumble:{n:'含糊',v:.35},self:{n:'本人朗读',v:1}};
const KIND={common:'普通古诗',rare:'生僻古文'};
const rateCat=s=>s<2.5?'slow':s<=4.5?'normal':'fast';
function simDictate(T,r,c){const sev={slow:0,normal:0.01,fast:0.4}[r]+(c==='mumble'?0.32:0);let k=0,out='';
 for(const ch of T.text){if(!Speech.norm(ch).length){out+=ch;continue;}const i=k++;if(T.rare[ch]){out+=T.rare[ch];continue;}
  if(hsh(T.id+i+'v')<sev*0.6){if(r==='fast'&&hsh(T.id+i+'u')<0.5)continue;out+=T.near[i]||ch;}else out+=ch;}
 return out;}
const errOf=ops=>[ops.filter(o=>o.op==='sub').length,ops.filter(o=>o.op==='del').length,ops.filter(o=>o.op==='ins').length];
/* syllable rate from an energy envelope (frames of dt seconds) */
function rateOfEnv(e,dt){let mx=0;for(const v of e)mx=Math.max(mx,v);if(mx<1e-4)return 0;const th=mx*0.4;let on=false,c=0,first=-1,last=-1;
 for(let i=0;i<e.length;i++){if(!on&&e[i]>th){on=true;c++;if(first<0)first=i;}else if(on&&e[i]<th*0.55){on=false;last=i;}}if(last<0)last=e.length-1;const span=(last-first)*dt;return span>0.4?c/span:0;}
const rateOfSig=x=>rateOfEnv(Speech.energy(x,0.01),0.01);
function rateOfLevels(lv,all){if(lv.length<12)return 0;const now=lv[lv.length-1][0];const w=all?lv:lv.filter(x=>x[0]>now-3000);if(w.length<12)return 0;
 let mx=0;w.forEach(x=>mx=Math.max(mx,x[1]));if(mx<0.012)return 0;const th=mx*0.45;let on=false,c=0;w.forEach(x=>{if(!on&&x[1]>th){on=true;c++;}else if(on&&x[1]<th*0.6)on=false;});
 const span=(w[w.length-1][0]-w[0][0])/1000;return span>0.6?c/span:0;}
function meterHTML(v){const p=clamp(v/8*100,0,100);const z=v<=0?'':v<1.5?'太慢':v<=4.5?'合适':'太快';
 return `<div class="l4-mt"><span>语速</span><div class="l4-mbar" aria-hidden="true"><i class="z1"></i><i class="z2"></i><i class="z3"></i>${v>0?`<b style="left:${p}%"></b>`:''}</div><span>${v>0?v.toFixed(1):'—'} 字/秒</span>${z?`<span class="l4-tag ${z==='合适'?'ok':'bad'}">${z}</span>`:''}</div>`;}

/* ---------- homophones (EXP-02). cands = how common each word is (示意); slot.w = context cue → extra score (示意) ---------- */
const HG=[
 {id:'ql',py:'quán lì',cands:{'权利':.58,'全力':.42},
  word:{segs:[{slot:0},'、',{slot:1}],slots:[{ans:'全力'},{ans:'权利'}],py:'quán lì，quán lì'},
  sent:{segs:[{cue:'a',t:'我们要'},{slot:0},{cue:'b',t:'为科技节作准备'},'，',{cue:'c',t:'每个人都有'},{slot:1},{cue:'d',t:'提出自己的建议'},'。'],
   slots:[{ans:'全力',w:{a:{'全力':1.3},b:{'全力':0.9,'权利':-0.4}}},{ans:'权利',w:{c:{'权利':1.4},d:{'权利':0.8}}}],
   py:'wǒ men yào quán lì wèi kē jì jié zuò zhǔn bèi，měi gè rén dōu yǒu quán lì tí chū zì jǐ de jiàn yì'}},
 {id:'gd',py:'guò dù',cands:{'过度':.62,'过渡':.38},
  word:{segs:[{slot:0},'、',{slot:1}],slots:[{ans:'过度'},{ans:'过渡'}],py:'guò dù，guò dù'},
  sent:{segs:[{cue:'a',t:'大家也不用'},{slot:0},{cue:'b',t:'紧张'},'，正常发挥，我们就能',{cue:'c',t:'顺利'},{slot:1},{cue:'d',t:'到决赛阶段'},'。'],
   slots:[{ans:'过度',w:{a:{'过度':1.0},b:{'过度':1.2}}},{ans:'过渡',w:{c:{'过渡':0.7},d:{'过渡':1.5}}}],
   py:'dà jiā yě bú yòng guò dù jǐn zhāng，zhèng cháng fā huī，wǒ men jiù néng shùn lì guò dù dào jué sài jiē duàn'}},
 {id:'gs',py:'gōng shì',cands:{'公式':.36,'公事':.22,'攻势':.16,'公示':.14,'工事':.12},
  word:{segs:[{slot:0},'、',{slot:1},'、',{slot:2}],slots:[{ans:'公式'},{ans:'攻势'},{ans:'公示'}],py:'gōng shì，gōng shì，gōng shì'},
  sent:{segs:[{cue:'e',t:'在第一场比赛中'},'，',{cue:'a',t:'我们需要通过'},{slot:0},{cue:'b',t:'计算出最佳策略'},'，',{cue:'c',t:'化解对方的'},{slot:1},'，',{cue:'d',t:'结果会在明天'},{slot:2},'。'],
   slots:[{ans:'公式',w:{a:{'公式':0.6,'公事':-0.5},b:{'公式':1.6}}},{ans:'攻势',w:{c:{'攻势':2.2,'公式':-0.6},e:{'攻势':0.5}}},{ans:'公示',w:{d:{'公示':1.9,'公事':0.4}}}],
   py:'zài dì yī chǎng bǐ sài zhōng，wǒ men xū yào tōng guò gōng shì jì suàn chū zuì jiā cè lüè，huà jiě duì fāng de gōng shì，jié guǒ huì zài míng tiān gōng shì'}}];
const MODES={word:'只读词语',sent:'读整句'};
function hscore(G,slot,on){const Lx=Object.entries(G.cands).map(([w,p])=>{let s=Math.log(p);Object.entries(slot.w||{}).forEach(([c,ws])=>{if(on.has(c)&&ws[w])s+=ws[w];});return{w,s};});
 const m=Math.max(...Lx.map(x=>x.s));const z=Lx.reduce((a,x)=>a+Math.exp(x.s-m),0);return Lx.map(x=>({w:x.w,p:Math.exp(x.s-m)/z}));}
const htop=sc=>sc.reduce((a,b)=>b.p>a.p?b:a);
const segText=(C,f)=>C.segs.map(s=>typeof s==='string'?s:s.slot!=null?f(s.slot):s.t).join('');

/* ---------- market scene (EXP-03) ---------- */
const SP=[{id:'A',n:'甲',text:'咱们去买水吧',lv:1,f0:205,c:'#4cc9f0',near:'簪门趣卖谁八'},
 {id:'B',n:'乙',text:'苹果多少钱一斤',lv:.85,f0:265,c:'#f9c74f',near:'平国躲烧前衣金'},
 {id:'C',n:'丙',text:'前面有一家新开的书店',lv:.7,f0:150,c:'#90be6d',near:'钱棉又衣加心该得叔垫'}];
const START={turn:[0.3,1.95,3.95],same:[0.3,0.8,1.2]};const CD=1/4.5,TT=6.4,HORN=[[0,0.25],[3.3,3.55]];
const NM={turn:'轮流说话',same:'同时说话'};
const CAUSE={overlap:'几个人同时说话',noise:'噪音太大、听不清',bg:'把背景声当成了字'};
const SCN={'turn-80':['turn',80,'轮流说 · 很吵'],'same-10':['same',10,'同时说 · 安静'],'same-70':['same',70,'同时说 · 很吵']};
const ETYPE={splice:'拼接',drop:'漏字',sub:'错字',bg:'背景声变文字'};
function simNoise(mode,lvl){const n=lvl/100,st=START[mode];
 const U=SP.map((s,i)=>Object.assign({},s,{i,t0:st[i],t1:st[i]+s.text.length*CD,chars:[...s.text].map((c,k)=>({c,k,a:st[i]+k*CD,b:st[i]+(k+0.82)*CD}))}));
 const toks=[];
 U.forEach(u=>u.chars.forEach(ch=>{const m=(ch.a+ch.b)/2;let other=0,strong=null;U.forEach(v=>{if(v!==u&&v.t0<=m&&m<=v.t1){other+=v.lv;if(v.lv>u.lv&&(!strong||v.lv>strong.lv))strong=v;}});
  const horn=HORN.some(([a,b])=>m>=a&&m<=b)?n*0.8:0;
  if(strong){ch.st='mask';ch.by=strong.id;ch.cs=['overlap'];return;}
  const peOf=x=>clamp((1.3-u.lv/(x+0.05))/1.3,0,1)*0.85,rr=hsh(u.id+ch.k+'n');const pe=peOf(n+other+horn);
  if(rr<pe){const byN=rr<peOf(n+horn),byO=other>0&&rr<peOf(other);ch.cs=byN&&!byO?['noise']:byO&&!byN?['overlap']:other>0?['overlap','noise']:['noise'];
   if(hsh(u.id+ch.k+'k')<0.5){ch.st='drop';return;}ch.st='sub';ch.h=u.near[ch.k];}else ch.st='ok';
  toks.push({t:ch.a,c:ch.st==='sub'?ch.h:ch.c,sp:u.id,st:ch.st,ref:ch});}));
 if(lvl>=35)HORN.forEach(([a],j)=>toks.push({t:a+0.03,c:j?'滴滴':'嘀',sp:'horn',st:'bg',t1:a+0.25}));
 toks.sort((x,y)=>x.t-y.t);
 /* a new sentence starts only after real silence (nobody speaking, no horn) — dropped characters do not split a sentence */
 const sound=t=>U.some(u=>t>=u.t0&&t<=u.t1)||(lvl>=35&&HORN.some(([a,b])=>t>=a&&t<=b));
 const silent=(a,b)=>{let run=0;for(let t=a;t<b;t+=0.05){run=sound(t)?0:run+0.05;if(run>=0.24)return true;}return false;};
 const sens=[];toks.forEach((t,i)=>{if(!i||silent(toks[i-1].t+CD,t.t))sens.push([]);sens[sens.length-1].push(t);});
 const errs=[];
 sens.forEach(S=>{let prev=null;S.forEach(t=>{if(t.sp==='horn')return;if(prev&&prev.sp!==t.sp){t.spl=errs.length;errs.push({type:'splice',t0:prev.t,t1:t.t+CD,txt:`${SP.find(s=>s.id===prev.sp).n}「${prev.c}」接上${SP.find(s=>s.id===t.sp).n}「${t.c}」`,cause:'overlap',ok:['overlap']});}prev=t;});});
 U.forEach(u=>{let run=null;u.chars.forEach(ch=>{const bad=ch.st==='mask'||ch.st==='drop';if(bad){if(!run){run={type:'drop',sp:u.id,t0:ch.a,t1:ch.b,txt:'',mask:false,chars:[]};errs.push(run);}run.txt+=ch.c;run.t1=ch.b;run.chars.push(ch);if(ch.st==='mask')run.mask=true;ch.e=errs.length-1;}else run=null;
  if(ch.st==='sub'){ch.e=errs.length;errs.push({type:'sub',sp:u.id,t0:ch.a,t1:ch.b,txt:`${ch.c} → ${ch.h}`,cause:ch.cs[0],ok:ch.cs});}});});
 errs.forEach(e=>{if(e.type==='drop'){e.ok=[...new Set(e.chars.flatMap(c=>c.cs||[]))];e.cause=e.ok.includes('overlap')?'overlap':'noise';e.txt=`${SP.find(s=>s.id===e.sp).n}：「${e.txt}」没写出来`;delete e.chars;}});
 toks.forEach(t=>{if(t.st==='bg'){t.e=errs.length;errs.push({type:'bg',t0:t.t,t1:t.t1,txt:`喇叭声 → 「${t.c}」`,cause:'bg',ok:['bg']});}else if(t.st==='sub')t.e=t.ref.e;});
 const order=errs.map((e,i)=>i).sort((a,b)=>errs[a].t0-errs[b].t0);const remap={};order.forEach((o,i)=>remap[o]=i);
 const E=order.map(i=>errs[i]);toks.forEach(t=>{if(t.e!=null)t.e=remap[t.e];if(t.spl!=null)t.spl=remap[t.spl];});U.forEach(u=>u.chars.forEach(ch=>{if(ch.e!=null)ch.e=remap[ch.e];}));
 const ref=SP.map(s=>s.text).join(''),hyp=toks.map(t=>t.c).join('');
 const cnt=k=>E.filter(e=>e.type===k).length;
 return {mode,lvl,U,toks,sens,errs:E,acc:Speech.accuracy(ref,hyp),sp:cnt('splice'),dr:cnt('drop'),bg:cnt('bg'),sb:cnt('sub')};}
function blank(cv,msg){const {g,W,H,dpr}=prep(cv);g.fillStyle='#101a3d';g.fillRect(0,0,W,H);if(msg){g.fillStyle='#a9b6e6';g.font=`${13*dpr}px "Noto Sans SC",sans-serif`;g.textAlign='center';g.textBaseline='middle';g.fillText(msg,W/2,H/2);g.textAlign='left';g.textBaseline='alphabetic';}}

/* ---------- canvas helper (same sizing rule as speech.js) ---------- */
function prep(cv){const r=cv.getBoundingClientRect(),dpr=Math.min(2,window.devicePixelRatio||1);const W=Math.max(10,Math.round((r.width||cv.width)*dpr)),H=Math.max(10,Math.round((r.height||cv.height)*dpr));if(cv.width!==W||cv.height!==H){cv.width=W;cv.height=H;}return {g:cv.getContext('2d'),W,H,dpr};}
function drawTL(cv,mode,lvl,sim,hi){const {g,W,H,dpr}=prep(cv);g.fillStyle='#060b1d';g.fillRect(0,0,W,H);const LW=58*dpr,rows=5,top=6*dpr,ax=20*dpr,rh=(H-top-ax)/rows;
 const x=t=>LW+t/TT*(W-LW-8*dpr);const st=START[mode];g.font=`${12*dpr}px "Noto Sans SC",sans-serif`;g.textBaseline='middle';
 ['甲','乙','丙','喇叭','人声嘈杂'].forEach((n,i)=>{const y=top+i*rh;g.fillStyle=i<3?SP[i].c:i===3?'#9d8cff':'#8a97c7';g.fillText(n,6*dpr,y+rh/2);g.strokeStyle='#1f2b57';g.beginPath();g.moveTo(LW,y+rh);g.lineTo(W,y+rh);g.stroke();});
 // babble band
 const by=top+4*rh;if(lvl>0){g.fillStyle='#8a97c7';for(let i=0;i<220;i++){const t=i/220*TT,h=(0.25+0.75*hsh('b'+i))*rh*0.8*lvl/100;g.globalAlpha=0.55;g.fillRect(x(t),by+rh/2-h/2,Math.max(1,(W-LW)/240),h);}g.globalAlpha=1;}
 // horn
 HORN.forEach(([a,b])=>{if(!lvl)return;g.fillStyle=`rgba(157,140,255,${0.15+0.6*lvl/100})`;g.fillRect(x(a),top+3*rh+4*dpr,x(b)-x(a),rh-8*dpr);g.fillStyle='#e9eefc';g.fillText('嘀',x(a)+3*dpr,top+3*rh+rh/2);});
 // speakers
 const chars=sim?sim.U:SP.map((s,i)=>({i,chars:[...s.text].map((c,k)=>({c,k,a:st[i]+k*CD,b:st[i]+(k+0.82)*CD}))}));
 chars.forEach(u=>u.chars.forEach(ch=>{const y=top+u.i*rh+4*dpr,h=rh-8*dpr,a=x(ch.a),w=x(ch.b)-a;const col=SP[u.i].c;
  let fill=col+'33',stroke=col+'99';if(sim){if(ch.st==='ok'){fill=col+'55';stroke=col;}else if(ch.st==='sub'){fill='#f25c7840';stroke='#f25c78';}else{fill='#f25c7818';stroke='#f25c78';}}
  g.fillStyle=fill;g.fillRect(a,y,w,h);g.strokeStyle=stroke;g.lineWidth=1*dpr;if(sim&&(ch.st==='mask'||ch.st==='drop'))g.setLineDash([3*dpr,3*dpr]);g.strokeRect(a+.5,y+.5,w-1,h-1);g.setLineDash([]);
  g.fillStyle=sim&&ch.st!=='ok'?'#ffb3c0':'#e9eefc';g.textAlign='center';g.fillText(ch.c,a+w/2,y+h/2);g.textAlign='left';
  if(sim&&(ch.st==='mask'||ch.st==='drop')){g.strokeStyle='#f25c78';g.beginPath();g.moveTo(a+2,y+h/2);g.lineTo(a+w-2,y+h/2);g.stroke();}}));
 if(sim)sim.errs.forEach(e=>{if(e.type!=='splice')return;g.strokeStyle='#f9c74f';g.lineWidth=2*dpr;const xx=x(e.t0+CD*0.9);g.beginPath();g.moveTo(xx,top);g.lineTo(xx,top+3*rh);g.stroke();g.fillStyle='#f9c74f';g.fillText('拼',xx+3*dpr,top+7*dpr);});
 if(hi){g.strokeStyle='#ffffff';g.lineWidth=2*dpr;g.fillStyle='rgba(255,255,255,.08)';const a=x(hi.t0)-2*dpr,b=x(hi.t1)+2*dpr;g.fillRect(a,top,b-a,rows*rh);g.strokeRect(a,top,b-a,rows*rh);}
 g.fillStyle='#8a97c7';g.font=`${10*dpr}px "JetBrains Mono",monospace`;for(let s=0;s<=6;s++){const xx=x(s);g.fillRect(xx,H-ax,1,4*dpr);g.fillText(s+'s',xx+2*dpr,H-ax/2+2*dpr);}}

/* ---------- microphone session: Speech.record + live scope + rate meter + live ASR / transcribe ---------- */
const sessions=new Set();
async function micSession(o){if(!Speech.micSupported())throw{code:'unsupported',message:'这台设备或当前页面不能使用麦克风'};
 const lv=[];const t0=performance.now();
 const ctl=await Speech.record({maxMs:o.maxMs||20000,raw:!!o.raw,onLevel:rms=>{lv.push([performance.now()-t0,rms]);if(lv.length>4000)lv.splice(0,1000);}});
 const stopScope=o.cv?Speech.liveScope(o.cv,ctl.analyser):()=>{};
 const mt=0;
 const auto=setTimeout(()=>o.onAuto&&o.onAuto(),(o.maxMs||20000)-150);
 let live=null,liveText='',liveDone=Promise.resolve(),liveErr=null;
 try{live=App.AI.liveASR('zh-CN');}catch(e){live=null;}
 if(live)liveDone=new Promise(res=>{try{live.start({onPartial:t=>{liveText=t;if(o.liveEl)o.liveEl.textContent=t;},onFinal:t=>{liveText=t;},onError:e=>{liveErr=e;},onEnd:f=>{if(f)liveText=f;res();}});}catch(e){liveErr=e;res();}});
 const allLv=lv;
 const S={live:!!live,setLive(el){o.liveEl=el;},async stop(){sessions.delete(S);clearInterval(mt);clearTimeout(auto);const r=await ctl.stop();stopScope();if(live){try{live.stop();}catch(e){}await Promise.race([liveDone,sleep(2500)]);}
   let text=(liveText||'').trim(),engine=text?'live':null,note='';
   if(!text&&r.blob&&r.blob.size){try{const j=await App.AI.transcribe(r.blob,{lang:'zh'});if(j&&j.text){text=j.text.trim();engine=j.mode;}}catch(e){App.AI.fail(e);note=App.AI.errText(e);}}
   return {text,engine,buffer:r.buffer,sps:rateOfLevels(allLv,true),liveErr,note};},
  cancel(){sessions.delete(S);clearInterval(mt);clearTimeout(auto);try{ctl.cancel();}catch(e){}stopScope();if(live){try{live.stop();}catch(e){}}}};
 sessions.add(S);return S;}
const ENG={live:'浏览器语音识别（声音由浏览器发送到它的识别服务）',api:'平台语音识别接口',gpt:'GPT 语音转写'};
const noEngine='录音完成，但这台设备没有可用的语音识别引擎（Chrome / Edge 浏览器里可用浏览器语音识别；桌面版需要老师在 AI 设置里配置 GPT 或平台接口）。可以先用演示朗读完成实验。';
const micFail=e=>`${(e&&e.message)||'打不开麦克风'}。在 claude.ai 页面里不能录音，请用演示朗读完成实验；部署在学校平台或桌面版里可以录音。`;


/* ---------- CSS (light theme; only the "screens" stay dark) ---------- */
function css(){if($('#css-l4'))return;const s=document.createElement('style');s.id='css-l4';s.textContent=`
.l4-colm{display:flex;flex-direction:column;gap:14px;min-width:0}
.l4-gq{font-weight:700}
.l4-card{background:var(--paper);border:2px solid #e6d9a8;border-radius:16px;padding:14px 16px;display:flex;flex-direction:column;gap:6px}
.l4-tag{display:inline-block;padding:1px 10px;border-radius:999px;font-size:13.5px;font-weight:700;background:#fff;border:2px solid var(--line2);color:var(--ink)}
.l4-tag.bad{background:var(--coral-soft);border-color:var(--coral);color:var(--coral-d)}
.l4-tag.ok{background:var(--mint-soft);border-color:var(--mint);color:var(--mint-d)}
.l4-pipe{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:16px}
.l4-pc{position:relative;padding:10px 12px;border:2px solid var(--line2);border-radius:14px;background:#fff;opacity:.6;transition:opacity .3s,box-shadow .3s;display:flex;flex-direction:column;gap:6px;min-width:0}
.l4-pc.on{opacity:1;border-color:var(--grape);box-shadow:0 6px 16px #6c47ff33}
.l4-pipe.done .l4-pc{cursor:pointer}.l4-pc.cur{outline:3px solid var(--sun-d);outline-offset:2px}
.l4-ctx{display:none;flex-wrap:wrap;gap:5px}.l4-pc.ctx .l4-ctx{display:flex}.l4-pc.ctx .l4-ctxn{display:none}
.l4-ctx span{padding:1px 8px;border-radius:999px;font-size:14px;font-weight:700;border:1.5px solid var(--line2)}
.l4-ctx .y{background:var(--mint-soft);border-color:var(--mint);color:var(--mint-d)}.l4-ctx .n{background:var(--coral-soft);border-color:var(--coral);color:var(--coral-d);text-decoration:line-through}
.l4-df{display:flex;flex-wrap:wrap;gap:8px 2px;margin:6px 0}
.l4-df>span{display:inline-flex;flex-direction:column;gap:2px;align-items:center}
.l4-df i{font-style:normal;min-width:26px;height:28px;padding:0 2px;display:grid;place-items:center;border-radius:6px;font-size:16px;background:#fff;border:1px solid var(--line);color:var(--ink)}
.l4-df .k i{border:0;background:transparent;font-size:12px;color:var(--muted);min-width:34px}
.l4-df .eq .h{color:var(--muted)}
.l4-df .sub i{background:var(--coral-soft);border-color:var(--coral);color:var(--coral-d);font-weight:700}
.l4-df .del i{background:var(--sun-soft);border-color:var(--sun-d);color:var(--sun-d)}
.l4-df .ins i{background:var(--grape-soft);border-color:var(--grape);color:var(--grape-d)}
#l4-cs .l4-cue{cursor:pointer}
#l4-diag{display:flex;flex-direction:column;gap:10px}
@media (min-width:881px){.l4-stick{position:sticky;top:76px;align-self:start}}
.l4-pc>b{font-size:15px;color:var(--sky)}
.l4-pc canvas{width:100%;height:74px;border-radius:8px;display:block;background:#101a3d}
.l4-pc:not(:last-child)::after{content:"→";position:absolute;right:-16px;top:42%;color:var(--muted);font-weight:700}
.l4-cands{display:flex;gap:4px}.l4-cands div{display:flex;flex-direction:column;gap:3px;align-items:center;flex:1;min-width:0}
.l4-cands i{font-style:normal;font-size:11px;color:var(--muted);white-space:nowrap}
.l4-cands span{font-size:14px;width:100%;text-align:center;border-radius:6px;border:2px solid var(--line);color:var(--muted)}
.l4-pc.ctx .l4-cands span.p{border-color:var(--sun-d);color:var(--ink);background:var(--sun);font-weight:700}
.l4-poem{font-family:var(--f-serif);font-size:20px;letter-spacing:.1em;line-height:1.9;color:var(--ink)}
.l4-poem .rare{color:var(--coral-d);border-bottom:2px dashed var(--coral)}
.l4-wv{position:relative;height:118px;border-radius:16px;overflow:hidden;border:1.5px solid var(--line2);background:#101a3d}
.l4-wv canvas{width:100%;height:100%;display:block}
.l4-ph{position:absolute;top:0;bottom:0;width:3px;background:var(--sun)}
.l4-hyp{min-height:34px;font-family:var(--f-serif);font-size:19px;letter-spacing:.06em;line-height:1.7}
.l4-mt{display:flex;flex-wrap:wrap;gap:10px;align-items:center;font-size:14px;margin-top:8px}
.l4-mbar{position:relative;height:12px;display:flex;flex:1;min-width:110px}
.l4-mbar i{display:block;height:100%}.l4-mbar .z1{width:18.75%;background:var(--sun);border-radius:6px 0 0 6px}.l4-mbar .z2{width:37.5%;background:var(--mint)}.l4-mbar .z3{flex:1;background:var(--coral);border-radius:0 6px 6px 0}
.l4-mbar b{position:absolute;top:-5px;width:4px;height:22px;background:var(--ink);border-radius:2px;transform:translateX(-2px);transition:left .25s}
.l4-ab{display:flex;flex-wrap:wrap;gap:8px;align-items:center;font-size:15.5px}
.l4-ab>b{display:grid;place-items:center;width:28px;height:28px;border-radius:50%;background:var(--ink);color:#fff}
.l4-ab span{padding:2px 10px;border-radius:999px;background:#fff;border:2px solid var(--line2)}
.l4-ab span.chg{background:var(--sun);border-color:var(--sun-d);font-weight:700}
.l4-ab em{font-style:normal;font-family:var(--f-display);font-weight:800;font-size:20px;margin-left:auto}
.l4-sent{font-size:19px;line-height:2.2;font-family:var(--f-serif);color:var(--ink)}
.l4-cue{background:var(--sky-soft);border-bottom:3px solid var(--sky);padding:0 3px;border-radius:4px 4px 0 0}
.l4-cue.off{background:transparent;border-bottom:3px dashed var(--line2);color:var(--dim);text-decoration:line-through}
.l4-slot{display:inline-block;min-width:4em;text-align:center;padding:0 8px;margin:0 3px;border-radius:8px;border:2px solid var(--sun-d);background:#fff;color:var(--sun-d);font-family:var(--f-body);font-size:15px;font-weight:700;line-height:1.9;vertical-align:middle}
.l4-slot.ok{border-color:var(--mint);background:var(--mint-soft);color:var(--mint-d);font-family:var(--f-serif);font-size:19px}
.l4-slot.bad{border-color:var(--coral);background:var(--coral-soft);color:var(--coral-d);font-family:var(--f-serif);font-size:19px}
.l4-lat{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px;margin-top:8px}
.l4-col{border:2px solid var(--line2);border-radius:12px;padding:8px 10px;background:#fff;display:flex;flex-direction:column;gap:5px}
.l4-col h5{margin:0;font-size:13.5px;color:var(--muted);font-weight:700}
.l4-row{display:grid;grid-template-columns:minmax(44px,auto) 1fr 44px;gap:8px;align-items:center;font-size:15px}
.l4-row .tr{height:12px;background:#1b255012;border-radius:999px;overflow:hidden}.l4-row .tr i{display:block;height:100%;background:var(--grape);border-radius:999px;transition:width .4s}
.l4-row span:last-child{text-align:right;font-size:13.5px;color:var(--muted)}
.l4-row.win span:first-child{font-weight:700}.l4-row.win .tr i{background:var(--mint)}.l4-row.win.wrong .tr i{background:var(--coral)}
.l4-row.ans span:first-child::after{content:" ✓";color:var(--mint-d)}
.l4-tl{border-radius:16px;border:1.5px solid var(--line2);background:#060b1d;overflow-x:auto}
.l4-tl canvas{width:100%;height:200px;display:block;min-width:520px}
.l4-sen{font-size:19px;font-family:var(--f-serif);line-height:2;padding:2px 0;border-bottom:2px dashed #7d5cf040}
.l4-sen:last-of-type{border-bottom:0}
.l4-tk{padding:0 1px;border-bottom:4px solid transparent}
.l4-tk.sA{border-bottom-color:#2f6bff}.l4-tk.sB{border-bottom-color:#ef9a00}.l4-tk.sC{border-bottom-color:#12b886}
.l4-tk.sub{background:var(--coral-soft);color:var(--coral-d)}.l4-tk.bg{background:#fff;color:var(--grape-d);border-bottom-color:var(--grape)}
.l4-mk{display:inline-block;font-size:12px;font-family:var(--f-body);font-weight:700;padding:0 6px;margin:0 3px;border-radius:6px;background:var(--sun);color:var(--ink);vertical-align:middle;line-height:20px}
.l4-ref{font-size:16.5px;font-family:var(--f-serif);line-height:1.9}
.l4-ref b{font-family:var(--f-body);font-size:14px;margin-right:8px}
.l4-ref .dr{color:var(--coral-d);text-decoration:line-through;background:var(--coral-soft)}
.l4-ref .sb{color:var(--coral-d);background:var(--coral-soft)}
.l4-on{outline:3px solid var(--grape);outline-offset:1px;border-radius:4px}
.l4-lg{display:flex;gap:12px;flex-wrap:wrap;font-size:13.5px;color:var(--muted);margin-top:6px}.l4-lg span{display:inline-flex;align-items:center;gap:5px}.l4-lg i{width:14px;height:5px;border-radius:3px;display:inline-block}
.l4-sc{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.l4-sc .chip.right{background:var(--mint-soft);border-color:var(--mint);color:var(--mint-d)}
.l4-sc .chip.wrong{background:var(--coral-soft);border-color:var(--coral);color:var(--coral-d)}
.l4-app{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
.l4-app .box b{display:block;color:var(--sky);font-size:15px;margin-bottom:4px}.l4-app .box p{font-size:14px;color:var(--muted)}.l4-app .box p.w{color:var(--coral-d);margin-top:6px}
@media (max-width:880px){.l4-pipe{grid-template-columns:1fr 1fr}.l4-pc:not(:last-child)::after{display:none}.l4-app{grid-template-columns:1fr 1fr}}
@media (max-width:560px){.l4-pipe,.l4-app,.l4-sc{grid-template-columns:1fr}.l4-poem{font-size:18px}.l4-sent{font-size:17.5px}}
`;document.head.appendChild(s);}

/* ---------- page ---------- */
L.render=function(){css();const v=$('#v-l4');
 v.innerHTML=`${App.hero(K,'当一回听写考官：找出 AI 什么时候听得准，什么时候会听错。',['能用 AI 将语音转化成文字。','了解 AI 语音识别技术的局限性。'])}

 <div class="station" id="l4-s0">${App.head('PRINCIPLE','原理 · 从声音到文字','声音变文字','按下按钮，看声音怎样一步步变成文字')}
  <ol class="steps"><li>先猜一猜</li><li>看五步，再点回看</li></ol>
  <div class="l4-pipe" id="l4-pipe">
   <div class="l4-pc" data-p="0"><b>① 声音</b><canvas id="l4-pw" aria-label="演示声音的波形"></canvas><span class="note">空气振动 → 一串数字</span></div>
   <div class="l4-pc" data-p="1"><b>② 声学特征</b><canvas id="l4-ps" aria-label="演示声音的声谱图"></canvas><span class="note">每个字有自己的“纹路”</span></div>
   <div class="l4-pc" data-p="2"><b>③ 候选字词</b><div class="l4-cands">${[['chuáng','床窗闯'],['qián','前钱潜'],['míng','明名鸣'],['yuè','月越乐'],['guāng','光广逛']].map(([p,c])=>`<div><i>${p}</i>${[...c].map((x,j)=>`<span class="${j?'':'p'}">${x}</span>`).join('')}</div>`).join('')}</div><span class="note">每个音有好几个候选字</span></div>
   <div class="l4-pc" data-p="3"><b>④ 结合上下文</b><div class="l4-ctx"><span class="y">床前 ✓</span><span class="n">窗钱</span><span class="y">明月 ✓</span><span class="n">名越</span></div><span class="note">连起来通顺的留下</span></div>
   <div class="l4-pc" data-p="4"><b>⑤ 文字</b><div class="l4-poem" id="l4-pout">？</div></div></div>
  <div class="go-row"><span class="l4-gq">「床」还是「窗」？我猜 AI 靠</span>${App.seg('g0',[['freq','哪个字更常用'],['ctx','前后文']],'')}${App.go('l4-pgo','开始演示')}<button class="btn ghost sm" type="button" id="l4-psay">听一听这句</button></div>
  ${App.aiBox('l4-ai0','五步走完，AI 写出的字会出现在这里')}<div id="l4-fb0"></div>
  <details class="more"><summary>说明</summary><p class="note">前两格的波形和声谱图，是浏览器对一段演示声音实时计算出来的；演示信号由平台合成，只用来展示样子（示意）。声谱图：横轴是时间，纵轴是频率，越亮表示那里的声音越强。“床前”“明月”“月光”是常见说法，“窗钱”“名越”说不通。“听一听”使用浏览器自带的朗读声音。</p>${App.know('AI 怎样“听写”','训练时，人们给 AI 听大量语音，并告诉它对应的字词。AI 记住了成千上万种语音特征和字词的对应关系。听到新的语音时，它把声音变成声学特征（就像上面的声谱图），和记忆里的特征快速比对，判断这段语音对应什么字、什么词。')}</details>
 </div>

 <div class="station" id="l4-s1">${App.head('EXP-01','挑战一 · 听力基本功','听写小考官','让 AI 听写古诗，找出它写错的字！')}
  <ol class="steps"><li>猜一猜，再听写</li><li>两种文本都试</li></ol>
  <div class="grid2"><div class="l4-colm">
    <div class="l4-card"><div class="l4-poem" id="l4-ref"></div><p class="note" id="l4-refn"></p></div>
    <div class="l4-wv"><canvas id="l4-wave" aria-label="朗读声音的波形"></canvas><i class="l4-ph" id="l4-ph" hidden></i></div></div>
   <div class="l4-colm">${App.knobs([['文本',App.seg('tx',TEXTS.map(t=>[t.id,t.name.replace('节选','')]),'jy'),'后两篇生僻字多'],['语速',App.seg('rate',[['slow','慢'],['normal','正常'],['fast','快']],'normal')],['吐字',App.seg('cl',[['clear','清晰'],['mumble','含糊']],'clear')]])}
    <div class="go-row"><span class="l4-gq">我猜 AI</span>${App.seg('g1',[['1','全写对'],['0','会写错']],'')}${App.go('l4-demo','让 AI 听写')}</div>
    <div class="row"><button class="btn ghost sm" type="button" id="l4-mic">我来朗读</button><button class="btn ghost sm" type="button" id="l4-say">听一听</button><span class="note">${PRIV}</span></div>
    ${App.aiBox('l4-ai1','选好文本，按下大按钮')}<div id="l4-fb1"></div>
    <div class="after-run"><div class="row" id="l4-log" aria-label="最近的听写记录"></div>${App.pad('','<div id="l4-obs1"></div>','观察任务')}</div></div></div>
  <details class="more"><summary>说明</summary><p class="note">大按钮用的是演示朗读 + 模拟识别，按教材的规律出错：没学过的生僻字会被换成读音相同的常用字；语速太快、吐字含糊会写错或漏字。「我来朗读」用真实的语音识别：照着左边的文本清晰朗读，读完按「停止并识别」。</p><p class="note">${PRIV_FULL}</p>${App.think(['哪些因素会影响 AI 识别语音的准确性？为什么 AI 有时能识别成功，有时却识别错误？','AI 的语音识别功能在生活中有哪些应用？'])}</details>
 </div>

 <div class="station" id="l4-s1b">${App.head('EXP-01b','挑战一 · 听力基本功','谁让 AI 听错','只改一个条件，看准确率掉多少')}
  <ol class="steps"><li>选一个条件</li><li>三个条件都比过</li></ol>
  <div class="grid2"><div class="l4-colm"><div class="l4-card" id="l4-pair"></div><p class="note">A 和 B 只有黄色那一处不同。</p></div>
   <div class="l4-colm">${App.knobs([['只改',App.seg('fac',[['rate','语速'],['cl','吐字'],['tk','文本']],'rate')],['古诗',App.seg('ptx',[['jy','《静夜思》'],['cx','《春晓》']],'jy')]])}
    <div class="go-row"><span class="l4-gq">我猜准确率掉</span>${App.seg('g1b',[['small','不到 20 分'],['big','20 分以上']],'')}${App.go('l4-cgo','对比一下')}</div>
    ${App.aiBox('l4-ai1b','A、B 两次听写的成绩会排在这里')}<div id="l4-fb1b"></div>
    <div class="after-run">${App.pad('什么会让 AI 听错？点一个，看你的数据怎么说','<div class="opts" id="l4-fac"></div><div class="fb" id="l4-facfb" aria-live="polite"></div>')}</div></div></div>
  <details class="more"><summary>说明</summary><p class="note">每次只改变一个条件（语速、吐字或文本），其他都不变，才能知道是谁让准确率下降。演示朗读 + 模拟识别（演示）。</p>${App.know('影响准确率的因素','在安静的环境下，用平缓的语速说话且吐字清晰时，AI 通常识别得比较准确——就像在安静的教室里听口齿清晰的老师讲课。不过，文字内容本身的复杂程度也会影响 AI 的判断：生僻字多、字词搭配特殊，如果 AI 没有学习过这些内容，它只能写成读音相同或相近的常用字，准确率就会下降。')}</details>
 </div>

 <div class="station" id="l4-s2">${App.head('EXP-02','挑战二 · 同音词挑战','同音词擂台','声音一样，猜猜 AI 会写哪个词')}
  <ol class="steps"><li>先猜，再揭晓</li><li>词语、整句都试</li></ol>
  <div class="grid2"><div class="l4-colm"><div class="l4-card"><div class="box-t">AI 听到的</div><div class="l4-sent" id="l4-hs"></div><p class="note" id="l4-hsn"></p></div></div>
   <div class="l4-colm">${App.knobs([['同音词',App.seg('hg',HG.map((G,i)=>[i,G.py]),0)],['读法',App.seg('hm',[['word','只读词语'],['sent','读整句']],'word')]])}
    <div class="go-row"><span class="l4-gq">我猜 AI</span>${App.seg('g2',[['ok','全写对'],['err','会写错']],'')}${App.go('l4-hgo','揭晓')}</div>
    <div class="row"><button class="btn ghost sm" type="button" id="l4-hsay">听一听</button><button class="btn ghost sm" type="button" id="l4-hllm" hidden>换真 AI 试试</button></div>
    ${App.aiBox('l4-ai2','先猜一猜，再按「揭晓」')}<div id="l4-fb2"></div>
    <div class="after-run">${App.pad('','<div id="l4-obs2"></div>','观察任务')}</div></div></div>
  <details class="more"><summary>说明</summary><p class="note">“quán lì”可以是全力，也可以是权利，只听声音分不出来。候选词得分 = 常用程度 × 上下文（示意数据）。「换真 AI 试试」只把拼音交给大模型，让它根据上下文选字。</p>${App.think(['AI 在什么情况下无法准确识别同音词？在什么情况下能比较准确地识别？','除了环境安静、语速平缓、吐字清晰，还应该怎么做才能让 AI 识别得更准确？'])}${App.know('AI 怎样分辨同音词','汉语里有大量同音词，仅凭发音难以区分，必须依赖具体、完整的语境。AI 在识别语音时，并非机械地逐字逐句对应，而是在同步理解上下文的含义。遇到同音词时，它能结合整句话的语境，选出最符合语义的词语。如果只听到孤立的几个同音词，或前后语义不清的片段，它就只能按“哪个词更常用”来猜，于是产生误解。所以，想让 AI 听懂，除了让它听清楚，还要把想传递的信息和语境说完整。')}</details>
 </div>

 <div class="station" id="l4-s2b">${App.head('EXP-02b','挑战二 · 同音词挑战','拆掉线索','去掉最少的线索，让 AI 写错！')}
  <ol class="steps"><li>点掉一条线索</li><li>让 AI 写错</li></ol>
  <div class="grid2"><div class="l4-colm"><div class="l4-card"><div class="box-t">AI 听到的（点蓝色的词，把它去掉）</div><div class="l4-sent" id="l4-cs"></div></div></div>
   <div class="l4-colm">${App.knobs([['同音词',App.seg('cg',HG.map((G,i)=>[i,G.py]),2)],['线索','<span id="l4-cues" style="display:contents"></span>','点一下去掉，再点放回']])}
    <div class="go-row">${App.go('l4-cxgo','让 AI 再写')}</div>
    ${App.aiBox('l4-ai2b','去掉线索后，AI 写的词会出现在这里')}<div id="l4-fb2b"></div></div></div>
  <details class="more"><summary>说明</summary><p class="note">句子里蓝色的词语是上下文线索。去掉线索后，AI 只能更多地依靠“哪个词更常用”来猜。候选词得分为示意数据。</p></details>
 </div>

 <div class="station" id="l4-s3">${App.head('EXP-03','挑战三 · 闹市辨人声','噪音实验室','调大噪音、让人抢着说，把 AI 听乱！')}
  <ol class="steps"><li>按大按钮开听</li><li>拖滑杆、换说法</li></ol>
  <div class="grid2"><div class="l4-colm"><div class="l4-tl"><canvas id="l4-tl" aria-label="甲乙丙三人说话的时间轴，以及喇叭声和背景人声"></canvas></div>
    <div class="l4-card l4-ref" id="l4-nref"></div></div>
   <div class="l4-colm">${App.knobs([['背景噪音',App.range('l4-nl',0,100,10,30,'')],['说话方式',App.seg('nm',[['turn','轮流说'],['same','同时说']],'turn')]])}
    <div class="go-row">${App.go('l4-ngo','让 AI 听集市')}<button class="btn ghost sm" type="button" id="l4-nplay">听听集市声</button></div>
    ${App.aiBox('l4-ai3','AI 听写的集市对话会出现在这里')}<div id="l4-fb3"></div>
    <div class="after-run"><div class="row" id="l4-nlog" aria-label="最近的集市记录"></div>${App.pad('','<div id="l4-obs3"></div>','观察任务')}</div></div></div>
  <details class="more"><summary>说明</summary><p class="note">热闹的集市里，甲、乙、丙三个人在说话，旁边还有喇叭声和嘈杂的人声。实验使用教材插图中三个人的话，声音由平台合成（示意），识别为模拟识别（演示）。识别结果中，下划线颜色表示这个字来自谁。</p>${App.think(['为什么 AI 识别嘈杂环境中的语音容易出现错误？','AI 语音识别技术的局限性可能会带来哪些问题？'])}${App.know('为什么嘈杂环境容易出错','这和我们在嘈杂环境中的体验非常相似：小组讨论时几个同学同时大声说话，你也听不清每个人在说什么。环境嘈杂时，多个声音混在一起、互相干扰，AI 就很难分清哪句话是哪个人说的。它可能会把两个人说的话拼接在一起，甚至漏掉某些字或整句话，还可能把和人声相近的背景声当成了字。AI 虽然强大，但并非无所不能：使用时要尽量选择安静的环境，并注意轮流发言。')}</details>
 </div>

 <div class="station" id="l4-s3b">${App.head('EXP-03b','挑战三 · 闹市辨人声','错误侦探','AI 听错了，帮它找出每个错误的原因')}
  <ol class="steps"><li>让 AI 听一遍</li><li>给错误找原因</li></ol>
  ${App.knobs([['集市现场',App.seg('scn',Object.entries(SCN).map(([k,s])=>[k,s[2]]),'same-70')]])}
  <div class="go-row">${App.go('l4-dgo','抓错误')}</div>
  <div class="grid2" data-rb="1"><div class="l4-colm"><div class="l4-tl"><canvas id="l4-tl2" aria-label="时间轴：白框标出当前这个错误发生的位置"></canvas></div><p class="note">白框 = 当前这个错误发生的时刻。</p>
    ${App.aiBox('l4-ai3b','AI 的听写和它的错误会出现在这里')}</div>
   <div class="l4-colm l4-stick"><div class="before-run">${App.pad('','<p class="note">按上面的「抓错误」，AI 听错的地方会一个个送到这里，等你断案。</p>','断案记录')}</div><div id="l4-fb3b"></div>
    <div class="after-run">${App.pad('','<div id="l4-diag"></div>','断案记录')}</div></div></div>
  <details class="more"><summary>说明</summary><p class="note">拼接：前后两个字来自不同的人。漏字：有人说了，AI 没写出来。错字：写成了别的字。背景声变文字：喇叭声被当成了字。</p></details>
 </div>

 <div class="station" id="l4-s4">${App.head('APPLY','应用与建议','小组录音怎么做','小组要用 AI 记讨论，挑出对的做法')}
  <ol class="steps"><li>点出对的做法</li><li>提交看结果</li></ol>
  <div class="l4-sc" id="l4-sc"></div>
  <div class="go-row">${App.go('l4-scgo','提交判断')}</div><div id="l4-fb4"></div>
  <div class="after-run">${App.pad('我的约定','<label class="row"><input type="checkbox" id="l4-priv"> 我只录自己的声音；录别人前先征得同意。</label>')}</div>
  <details class="more"><summary>说明</summary><div class="l4-app">${[['语音输入','不方便打字时说出来','发送前检查同音字'],['采访记录','采访对话转成文字','先征得同意；核对人名地名'],['会议整理','发言整理成记录','轮流发言；请发言人确认'],['实时字幕','视频、课堂实时出字','可能有错，以原话为准']].map(([t,a,w])=>`<div class="box"><b>${t}</b><p>${a}</p><p class="w">注意：${w}</p></div>`).join('')}</div>
   ${App.obs(['保持环境安静，语速平缓，口齿清晰。','把话说完整，给 AI 足够的语境。','多人场合轮流发言，不要抢着说。','对识别结果进行检查，改正后再使用。'],'使用建议')}
   <p class="note">AI 语音识别正在快速融入日常生活，了解它的优点与不足，才能更好地使用它。录音只在本机处理、不保存；只录自己的声音，不偷录别人；录别人（比如采访）之前要先征得同意。</p></details>
 </div>

 <div class="station" id="l4-quizst">${App.head('QUIZ','反思与总结','小测验','5 道题，第一次作答计入能力图谱')}<div id="l4-quiz"></div></div>
 <div class="station" id="l4-diary"></div>`;
 if(!App.rec)return;wire();
};

const QUIZ=[
 {id:'q1',q:'AI 是怎样学会把语音变成文字的？',opts:['它背下了世界上所有人的声音','听了大量语音和对应的字词，记住了语音特征与字词的对应关系','每说一个字，都有人在后台告诉它'],a:1,why:'训练时给 AI 听大量语音并告诉它对应的字词，它记住了语音特征和字词的对应关系，再拿新的语音来比对。'},
 {id:'q2',q:'下面哪种情况，AI 最容易识别准确？',opts:['在热闹的集市里飞快地说','在安静的教室里，用平缓的语速、清晰地说常见的话','小声含糊地读一段生僻字很多的古文'],a:1,why:'安静环境、平缓语速、吐字清晰、内容常见，AI 识别得最准。'},
 {id:'q3',q:'只说“gōng shì”一个词时，AI 为什么容易写错？',opts:['麦克风坏了','没有上下文，AI 只能按哪个同音词更常用来猜','AI 从来没听过这个读音'],a:1,why:'同音词要靠完整的语境区分；孤立的一个词没有语境，AI 只能猜最常用的那个。'},
 {id:'q4',q:'为什么在热闹的集市里，AI 容易识别出错？',opts:['集市里的人说话都不标准','多个声音混在一起、互相干扰，AI 分不清哪句话是谁说的','AI 不喜欢热闹的地方'],a:1,why:'多个声音混在一起，AI 可能把两个人的话拼接起来，或者漏掉字句。'},
 {id:'q5',q:'用 AI 把小组讨论转成文字后，最恰当的做法是？',opts:['直接发给所有人','先检查、改正识别错误，再使用','把所有同音词都删掉'],a:1,why:'AI 的识别结果可能有错，使用前要检查。'}];

/* controlled pairs in the dictation log: two trials (same source) differing in exactly one condition */
function pairsOf(tr){const out={};for(let i=0;i<tr.length;i++)for(let j=i+1;j<tr.length;j++){const a=tr[i],b=tr[j];if(a.src!==b.src)continue;
  const sameT=a.tx===b.tx,sameR=a.r===b.r,sameC=a.c===b.c;
  const put=(f,easy,hard)=>{if(!out[f]||Math.abs(easy.acc-hard.acc)>Math.abs(out[f].easy.acc-out[f].hard.acc))out[f]={easy,hard};};
  if(sameT&&sameC&&!sameR){const o=['slow','normal','fast'];const [e,h]=o.indexOf(a.r)<o.indexOf(b.r)?[a,b]:[b,a];put('rate',e,h);}
  if(sameT&&sameR&&!sameC&&a.c!=='self'&&b.c!=='self'){const [e,h]=a.c==='clear'?[a,b]:[b,a];put('cl',e,h);}
  if(sameR&&sameC&&a.k!==b.k){const [e,h]=a.k==='common'?[a,b]:[b,a];put('tk',e,h);}}
 return out;}
const condTxt=t=>`${RATES[t.r]?RATES[t.r].n:t.r}${t.c==='self'?'':'、吐字'+((CLS[t.c]||{}).n||'')}${t.src==='mic'?'（本人朗读）':''}`;
const FAC=[['rate','语速太快'],['cl','吐字含糊'],['tk','生僻字多、字词搭配特殊'],['env','环境嘈杂（用挑战三的数据）'],['poem','AI 不擅长古诗']];
function evidence(lr,f){const tr=(lr.dict||{}).trials||[];
 if(f==='env'){const c=(lr.noise||{}).conds||[];const q=c.filter(x=>x.m==='turn'&&x.l<=20),z=c.filter(x=>x.m==='turn'&&x.l>=60);if(!q.length||!z.length)return null;const a=avg(q.map(x=>x.acc)),b=avg(z.map(x=>x.acc));return{ok:b<a,s:`噪音实验室（轮流说话）：噪音小 ${a}% → 噪音大 ${b}%`};}
 if(f==='poem')return{ok:false,s:'没有数据支持：普通古诗的准确率很高，问题不在“古诗”，而在生僻字和读法。'};
 const p=pairsOf(tr)[f];if(!p)return null;const e=p.easy,h=p.hard;
 const lab=f==='tk'?[`${TX(e.tx).name}`,`${TX(h.tx).name}`]:f==='rate'?[RATES[e.r].n,RATES[h.r].n]:['吐字清晰','吐字含糊'];
 return{ok:h.acc<e.acc,s:`${f==='tk'?'同样'+condTxt(e)+'：':TX(e.tx).name+'：'}${lab[0]} ${e.acc}% → ${lab[1]} ${h.acc}%`};}

let redraws=[],raf=0,player=null,ro=null,roq=0;
function redrawAll(){redraws.forEach(f=>{try{f();}catch(e){console.warn(e);}});}
let rsz=0;window.addEventListener('resize',()=>{clearTimeout(rsz);rsz=setTimeout(()=>{if(App.current===K)redrawAll();},200);});

/* small shared bits */
const noSrc=id=>{const x=$(id+' .ai-src');if(x)x.innerHTML='';};
const tag=(t,c='')=>`<span class="l4-tag ${c}">${t}</span>`;
const rowBar=(label,v,cls='')=>`<div class="l4-row ${cls}"><span>${label}</span><span class="tr"><i style="width:${v}%"></i></span><span>${v}%</span></div>`;
const shortName=t=>t.name.replace('节选','');
/* 观察任务 use App.askSeq (store = {id:{first,ok,last}}); the plain answers are mirrored into the old obs object that L.score / L.progress read */
const seedSeq=(store,obs,qs)=>qs.forEach(q=>{if(store[q.id]==null&&obs[q.id]!=null)store[q.id]={first:obs[q.id],ok:obs[q.id]===q.a,last:obs[q.id]};});
const mirror=(store,obs,qs)=>qs.forEach(q=>{if(store[q.id])obs[q.id]=store[q.id].last;});
const OBS1=[{id:'q1',q:'AI 是不是很快就把朗读的内容变成了文字？',opts:['是，几乎边读边出字','不是，要等很久'],a:0,why:'AI 比对特征非常快，几乎边读边出字。'},
 {id:'q2',q:'对于比较简单的古诗，AI 是否能成功识别每一个字？',opts:['平缓、清晰地读时，几乎每个字都对','不管怎么读都全对','错得很多'],a:0,why:'读得平缓、清晰时几乎全对；读得太快或含糊，会错几个字。'},
 {id:'q3',q:'对于生僻字较多的古文，AI 是否能成功识别每一个字？',opts:['能，和古诗一样准','不能，生僻字常被写成读音相同的常用字'],a:1,why:'没学过的生僻字，常被写成读音相同的常用字。'}];
const OBS2=[{id:'o1',q:'只朗读几个同音词，AI 的识别结果准确吗？',opts:['准确','不准确，常常都写成同一个常用词'],a:1,why:'孤零零的词没有上下文，AI 只能猜最常用的那个。'},
 {id:'o2',q:'朗读存在同音词且语义完整的句子，AI 的识别结果准确吗？',opts:['大部分准确','不准确'],a:0,why:'完整的句子给了上下文，AI 大多能选对。'},
 {id:'t2',q:'你认为 AI 是如何识别同音词的？',opts:['随便选一个','结合整句话的语境，选出最符合语义的词','选笔画最少的那个'],a:1,why:'AI 结合整句话的语境，选出最符合语义的词。'}];
const OBS3=[{id:'q1',q:'在嘈杂的环境中，AI 能分清不同人说的话吗？',opts:['能分清','分不清','轮流说话时基本能，同时说话时分不清'],a:2,why:'轮流说话时大多能分清；同时说话时声音混在一起，就分不清了。'},
 {id:'q2',q:'AI 有没有把不同人说的话混在一起或漏掉了某些话？',opts:['有拼接（混在一起）','有漏字、漏句','拼接和漏字都有','都没有'],a:2,why:'同时说话、噪音大时，既有拼接，也有漏字。'},
 {id:'q3',q:'AI 有没有把背景声音（如喇叭声）识别成文字？',opts:['有','没有'],a:0,why:'把噪音调到 40 以上，喇叭声会被写成「嘀」。'}];

function wire(){const lr=App.lesson(K);redraws=[];
 lr.dict=lr.dict||{};lr.dict.trials=lr.dict.trials||[];lr.dict.obs=lr.dict.obs||{};lr.dict.fac=lr.dict.fac||{};lr.dict.obsq=lr.dict.obsq||{};
 lr.homo=lr.homo||{};lr.homo.pred=lr.homo.pred||{};lr.homo.done=lr.homo.done||{};lr.homo.obs=lr.homo.obs||{};lr.homo.mic=lr.homo.mic||{};lr.homo.llm=lr.homo.llm||{};lr.homo.obsq=lr.homo.obsq||{};
 lr.noise=lr.noise||{};lr.noise.conds=lr.noise.conds||[];lr.noise.obs=lr.noise.obs||{};lr.noise.tag=lr.noise.tag||{n:0,ok:0};lr.noise.mic=lr.noise.mic||{};lr.noise.obsq=lr.noise.obsq||{};
 lr.apply=lr.apply||{};
 wirePipe(lr);wireDict(lr);wireCmp(lr);wireHomo(lr);wireCtx(lr);wireNoise(lr);wireDiag(lr);wireApply(lr);
 App.quiz($('#l4-quiz'),K,QUIZ);
 const rd=App.diary($('#l4-diary'),K,{title:L.diaryTitle,lead:'用实验记录回答：怎样说，AI 才听得清',
  fields:[{id:'when',q:'在什么情况下 AI 识别语音的结果更准确？在什么情况下容易出现错误？',ph:'更准确：……；容易出错：……（可以引用实验记录里的数据）'},
   {id:'similar',q:'AI 识别语音和我们听别人说话有什么相似之处？如果希望 AI 更准确地识别我们说的话，应该注意什么？',ph:'相似之处：……；我发现这样说 AI 听得更清：……'},
   {id:'future',q:'请你畅想一下：未来 AI 语音识别技术会有什么新发展？',ph:'我想象未来……'}],
  pledge:'我只录自己的声音，不偷录别人；用 AI 转写的文字，我会先检查、改正，再使用。',
  extras:ex=>extras(ex)});
 App.on(()=>{if(App.current===K)rd();});
 /* canvases are sized from their CSS box: redraw when a hidden station becomes visible */
 if(window.ResizeObserver){if(ro)ro.disconnect();ro=new ResizeObserver(()=>{cancelAnimationFrame(roq);roq=requestAnimationFrame(()=>{if(App.current===K)redrawAll();});});$$('#v-l4 canvas').forEach(c=>ro.observe(c.parentElement));}
}

/* ---------- 原理 · 声音变文字 ---------- */
function wirePipe(lr){const s0=$('#l4-s0');const sig=Speech.synthSpeech('床前明月光',{rate:3.2,seed:5,f0:210,gapEvery:0});
 const draw=()=>{Speech.drawWave($('#l4-pw'),sig,{axis:false,bg:'#101a3d'});Speech.drawSpectrogram($('#l4-ps'),sig,{axis:false,maxHz:4000});};redraws.push(draw);draw();
 const pipe=$('#l4-pipe');const set=i=>{$$('.l4-pc',s0).forEach((p,j)=>{p.classList.toggle('on',j<=i);p.classList.toggle('ctx',i>=3);p.classList.remove('cur');});$('#l4-pout').textContent=i>=4?'床前明月光':'？';};set(lr.pipe?4:-1);pipe.classList.toggle('done',!!lr.pipe);
 App.segWire(s0,'g0',()=>App.markStep(s0,0));if(lr.pipe){App.markStep(s0,0);App.markStep(s0,1);}
 const SAY=['① 麦克风把声音变成一串数字……','② 算出声学特征，每个字都有自己的“纹路”……','③ 每个音都找到好几个候选字：床、窗、闯……','④ 结合前后文，挑出最通顺的一串……','⑤ 写出文字！'];
 const BACK=['<div class="big">① 声音</div>说话时空气在振动。麦克风把振动记成一串数字，画出来就是这条波形。','<div class="big">② 声学特征</div>把声音按高低音拆开，每个字都有自己的“纹路”。AI 靠纹路认读音。','<div class="big">③ 候选字词</div>读音一样的字有好几个：chuáng 可以是床、窗、闯。这一步 AI 还定不下来。','<div class="big">④ 结合上下文</div>把候选字连起来读：“床前”“明月”通顺，“窗钱”“名越”说不通。通顺的留下。','<div class="big">⑤ 文字</div>最通顺的一串就是答案：床前明月光。'];
 /* after the demo every card can be tapped to look at that step again */
 $$('.l4-pc',s0).forEach((c,j)=>c.onclick=()=>{if(!pipe.classList.contains('done')||$('#l4-pgo').disabled)return;$$('.l4-pc',s0).forEach(x=>x.classList.toggle('cur',x===c));App.aiSay('#l4-ai0',BACK[j],{mood:'idle',src:'offline'});});
 $('#l4-pgo').onclick=async()=>{const b=$('#l4-pgo');App.busy(b,true,'演示中…');
  for(let i=0;i<5;i++){set(i);App.aiSay('#l4-ai0',SAY[i],{busy:true});await sleep(650);}
  App.busy(b,false);b.classList.add('again');const g=App.segVal(s0,'g0');
  App.aiSay('#l4-ai0','<div class="big">床前明月光</div>“床前”“明月”是常见说法，“窗钱”“名越”说不通，所以我选了「床」。',{mood:'happy',src:'offline'});
  if(!lr.pipe){lr.pipe=1;App.touch();}App.markStep(s0,0);App.markStep(s0,1);pipe.classList.add('done');
  if(g==='ctx')App.fb('#l4-fb0','ok','猜对了！这一句 AI 靠前后文选字','“床前”通顺，“窗钱”说不通。点上面任意一格，可以再看那一步。',{stars:3});
  else App.fb('#l4-fb0','find','这一句，AI 靠前后文选字',(g?'只看哪个字常用还不够：':'')+'“床前”通顺，“窗钱”说不通。点上面任意一格，可以再看那一步。',{stars:2});};
 $('#l4-psay').onclick=()=>{if(!Speech.say('床前明月光',{rate:.8}))App.toast('这台设备不支持朗读');};}

/* ---------- 实验 1 · 听写小考官 ---------- */
function wireDict(lr){const s1=$('#l4-s1'),D=lr.dict;let T=TX('jy'),rate='normal',cl='clear',sig=null,busy=false,sess=null;
 const wave=$('#l4-wave'),goB=$('#l4-demo'),micB=$('#l4-mic');
 const drawRec=()=>{if(sig)Speech.drawWave(wave,sig,{bg:'#101a3d'});else blank(wave,'声音的波形会画在这里');};redraws.push(drawRec);
 const ref=()=>{$('#l4-ref').innerHTML=[...T.text].map(c=>T.rare[c]?`<span class="rare">${c}</span>`:esc(c)).join('');$('#l4-refn').textContent=`${T.au}　${T.kind==='rare'?'红色虚线 = 不常用的字':'都是常见字词'}`;};
 App.segWire(s1,'tx',v=>{T=TX(v);ref();});App.segWire(s1,'rate',v=>{rate=v;});App.segWire(s1,'cl',v=>{cl=v;});
 ref();drawRec();
 $('#l4-say').onclick=()=>{if(!Speech.say(T.text,{rate:RATES[rate].tts}))App.toast('这台设备不支持朗读');};
 const drawLog=()=>{$('#l4-log').innerHTML=D.trials.slice(-5).map(x=>tag(`${shortName(TX(x.tx))} ${x.src==='mic'?'我读':(RATES[x.r]||{}).n+(x.c==='mumble'?'·含糊':'')} ${x.acc}%`,x.acc>=95?'ok':'bad')).join('');};
 const marks=()=>{const tr=D.trials;if(tr.length)App.markStep(s1,0);if(tr.some(x=>x.k==='common')&&tr.some(x=>x.k==='rare'))App.markStep(s1,1);};
 const finish=(T0,hyp,src,c,eng)=>{const ops=Speech.diff(T0.text,hyp),acc=Speech.accuracy(T0.text,hyp),e=errOf(ops);
  D.trials.push({src,eng:eng||'',tx:T0.id,k:T0.kind,r:c.r,c:c.c,sps:+(c.sps||0).toFixed(1),acc,e,h:hyp.slice(0,80)});if(D.trials.length>24)D.trials.shift();
  App.aiSay('#l4-ai1',`<div class="big">${acc}% 写对</div>${dHTML(ops)}<div class="row">${tag('写错 '+e[0],e[0]?'bad':'ok')}${tag('漏字 '+e[1],e[1]?'bad':'ok')}${tag('多字 '+e[2],e[2]?'bad':'ok')}</div>${meterHTML(c.sps||0)}`,{mood:acc===100?'happy':'oops',src:src==='demo'?'offline':(ENG[eng]||eng||'语音识别')});
  const tr=D.trials,both=tr.some(x=>x.k==='common')&&tr.some(x=>x.k==='rare'),any=tr.some(x=>x.acc<100),stars=any?(both?3:2):1;
  const g=App.segVal(s1,'g1'),hit=g==null?'':((g==='1')===(acc===100)?'你猜对了！':'和你猜的不一样。');
  const bad=ops.filter(o=>o.op==='sub').slice(0,4).map(o=>`${esc(o.r)}→${esc(o.h)}`).join('、');
  const rareHit=ops.some(o=>o.op==='sub'&&T0.rare[o.r]);
  const why=src==='mic'?'对照红色的字：是读快了、含糊了，还是生僻字？':([rareHit&&'没学过的生僻字，它只能写成读音相同的常用字。',c.r==='fast'&&'读得太快，它来不及听清每个字。',c.c==='mumble'&&'吐字含糊，声音的“纹路”不清楚。'].filter(Boolean).join('')||'听得清的时候，它偶尔也会写错个别字。');
  if(acc===100)App.fb('#l4-fb1','ok',src==='mic'?'你读得真清楚，AI 全写对了！':'AI 全写对了！',`${hit}${both?'换个语速或吐字再考考它。':'换一段生僻古文，或者读快一点，把它难倒。'}`,{stars});
  else App.fb('#l4-fb1','oops','你发现 AI 写错了！',`${hit}${bad?'它把 '+bad+' 写错了。':'它漏了字或多了字。'}${why}`,{stars,cheer:tr.filter(x=>x.acc<100).length===1});
  App.touch();drawLog();marks();unGuess(s1,'g1');reObs();};
 goB.onclick=async()=>{if(busy||sess)return;busy=true;App.busy(goB,true,'AI 正在听…');const T0=T,r=rate,c=cl;
  sig=Speech.synthSpeech(T0.text,{rate:RATES[r].sps,clarity:CLS[c].v,seed:1+Math.floor(hsh(T0.id)*50),f0:205});drawRec();
  const sps=rateOfSig(sig)||RATES[r].sps,hyp=simDictate(T0,r,c),play=Math.min(2.6,sig.length/16000*0.5),ph=$('#l4-ph');ph.hidden=false;
  App.aiSay('#l4-ai1','<div class="l4-hyp" id="l4-live"></div>',{busy:true});const live=$('#l4-live'),chars=[...hyp],t0=performance.now();
  await new Promise(res=>{const tick=()=>{const u=Math.min(1,(performance.now()-t0)/1000/play);ph.style.left=(u*100)+'%';if(live)live.textContent=chars.slice(0,Math.round(u*chars.length)).join('');if(u<1&&App.current===K)raf=requestAnimationFrame(tick);else res();};tick();});
  ph.hidden=true;finish(T0,hyp,'demo',{r,c,sps});App.busy(goB,false);goB.classList.add('again');busy=false;};
 /* real voice: the privacy notice is shown as the banner the moment recording is requested */
 const micIdle=()=>{micB.disabled=false;micB.textContent='我来朗读';};
 micB.onclick=async()=>{if(busy)return;
  if(sess){micB.disabled=true;micB.textContent='识别中…';const s=sess,T0=s.T;sess=null;const r=await s.stop();micIdle();
   if(r.buffer){sig=r.buffer;drawRec();}
   if(r.text){finish(T0,r.text,'mic',{r:rateCat(r.sps||4),c:'self',sps:r.sps},r.engine);const a=Speech.accuracy(T0.text,r.text);if(!D.best||a>D.best){D.best=a;App.touch();}}
   else{App.aiSay('#l4-ai1',esc((r.note?r.note+' ':'')+noEngine),{mood:'think'});noSrc('#l4-ai1');App.fb('#l4-fb1','try','这次没有识别结果','用大按钮的演示朗读，也能做完实验。');}return;}
  App.fb('#l4-fb1','find','只录自己的声音','录音只在这台设备上处理，不保存。照着左边的文本读，读完按「停止并识别」。');
  try{micB.disabled=true;const s=await micSession({cv:wave,meterEl:null,liveEl:null,maxMs:30000,onAuto:()=>{if(sess)micB.click();}});s.T=T;sess=s;sig=null;micB.disabled=false;micB.textContent='停止并识别';
   App.aiSay('#l4-ai1',`<div class="l4-hyp" id="l4-live">正在听……</div><p class="note">${s.live?'正在用浏览器语音识别实时转写':'正在录音，停止后转写'}</p>`,{busy:true});noSrc('#l4-ai1');s.setLive($('#l4-live'));}
  catch(e){sess=null;micIdle();App.aiSay('#l4-ai1',esc(micFail(e)),{mood:'think'});noSrc('#l4-ai1');App.fb('#l4-fb1','try','这里不能录音','用大按钮的演示朗读，也能做完实验。');}};
 L._dictStop=()=>{if(sess){sess.cancel();sess=null;micIdle();}};
 seedSeq(D.obsq,D.obs,OBS1);
 /* a question only shows up after the student has tried the thing it asks about */
 const obsGet=()=>{const tr=D.trials,hasC=tr.some(x=>x.k==='common'),hasR=tr.some(x=>x.k==='rare'),micOK=tr.some(x=>x.k==='rare'&&x.src==='mic'&&x.acc===100);
  const q3=Object.assign({},OBS1[2],micOK?{ok:[0,1],why:'你朗读的那次，真实的语音识别全写对了，说明它学过这些字。没学过的生僻字，AI 常写成读音相同的常用字（看演示朗读的结果）。'}:{});
  return {qs:[tr.length&&OBS1[0],hasC&&OBS1[1],hasR&&q3].filter(Boolean),more:!hasR?'再考一段生僻古文（《陋室铭》或《爱莲说》），会多一道观察题。':!hasC?'再考一首普通古诗（《春晓》或《静夜思》），会多一道观察题。':''};};
 const reObs=seq($('#l4-obs1'),obsGet,D.obsq,()=>{mirror(D.obsq,D.obs,OBS1);if(D.obs.q3first==null&&D.obsq.q3)D.obs.q3first=D.obsq.q3.first;App.touch();});
 drawLog();marks();if(D.trials.length)App.ran(s1);}

/* ---------- 实验 1b · 谁让 AI 听错（只改一个条件的对比） ---------- */
const FACN={rate:'语速变快',cl:'吐字变含糊',tk:'换成生僻古文'};
function wireCmp(lr){const st=$('#l4-s1b'),D=lr.dict;let fac='rate',ptx='jy',res=null;
 const plan=()=>{const A={tx:ptx,r:'normal',c:'clear'},B=Object.assign({},A);if(fac==='rate')B.r='fast';else if(fac==='cl')B.c='mumble';else B.tx=ptx==='jy'?'ls':'al';return [A,B];};
 const line=(x,k,acc)=>{const m=f=>fac===f&&k==='B'?'chg':'';return `<div class="l4-ab"><b>${k}</b><span class="${m('tk')}">${shortName(TX(x.tx))}</span><span class="${m('rate')}">${RATES[x.r].n}语速</span><span class="${m('cl')}">吐字${CLS[x.c].n}</span>${acc!=null?`<em>${acc}%</em>`:''}</div>`;};
 const pair=()=>{const [A,B]=plan();$('#l4-pair').innerHTML=line(A,'A',res&&res[0])+line(B,'B',res&&res[1]);};
 App.segWire(st,'fac',v=>{fac=v;res=null;pair();});App.segWire(st,'ptx',v=>{ptx=v;res=null;pair();});pair();
 const good=()=>['rate','cl','tk'].filter(f=>{const e=evidence(lr,f);return e&&e.ok;}).length;
 const marks=()=>{if(pairsOf(D.trials).rate||pairsOf(D.trials).cl||pairsOf(D.trials).tk)App.markStep(st,0);if(good()>=3)App.markStep(st,1);};
 $('#l4-cgo').onclick=async()=>{const b=$('#l4-cgo');App.busy(b,true,'两次听写中…');const P=plan(),f=fac,out=[];res=null;
  for(const [i,x] of P.entries()){App.aiSay('#l4-ai1b',`${'AB'[i]} 组：${shortName(TX(x.tx))}，${RATES[x.r].n}语速，吐字${CLS[x.c].n}……`,{busy:true});await sleep(550);
   const T0=TX(x.tx),h=simDictate(T0,x.r,x.c),ops=Speech.diff(T0.text,h),acc=Speech.accuracy(T0.text,h);out.push({T0,h,ops,acc});
   D.trials.push({src:'demo',eng:'',tx:T0.id,k:T0.kind,r:x.r,c:x.c,sps:RATES[x.r].sps,acc,e:errOf(ops),h:h.slice(0,80)});if(D.trials.length>24)D.trials.shift();}
  const drop=out[0].acc-out[1].acc;res=[out[0].acc,out[1].acc];if(f===fac)pair();
  App.aiSay('#l4-ai1b',`<div class="big">${drop>0?`准确率掉了 ${drop} 分`:'准确率没有变'}</div>${rowBar('A',out[0].acc,'win')}${rowBar('B',out[1].acc,'win wrong')}<p class="note">B 组的听写：</p>${dHTML(out[1].ops)}`,{mood:drop>0?'oops':'happy',src:'offline'});
  const g=App.segVal(st,'g1b'),hit=g==null?'':((g==='big')===(drop>=20)?'你猜对了！':'和你猜的不一样。');const n=Math.max(1,good());
  const pr=pairsOf(D.trials),FN={rate:'语速',cl:'吐字',tk:'文本'},did=Object.keys(FN).filter(k=>pr[k]),left=Object.keys(FN).filter(k=>!pr[k]);
  const next=left.length?`比过：${did.map(k=>FN[k]).join('、')}。在「只改」里换成${left.map(k=>'「'+FN[k]+'」').join('或')}再比，三个都比过得 3 星。`:'三个条件都比过了！在下面的「我的记录」里点一点原因。';
  if(drop>0)App.fb('#l4-fb1b','find',`${FACN[f]}，掉了 ${drop} 分`,`${hit}${next}`,{stars:n});
  else App.fb('#l4-fb1b','try','这次没有差别',`${hit}换一个条件，或者换一首古诗再比。`,{stars:n});
  App.touch();marks();drawFac();unGuess(st,'g1b');App.busy(b,false);b.classList.add('again');};
 const FL=[['rate','语速太快'],['cl','吐字含糊'],['tk','生僻字多'],['env','环境嘈杂'],['poem','AI 不擅长古诗']];
 const drawFac=last=>{const box=$('#l4-fac');const hasEnv=((lr.noise||{}).conds||[]).length>0||(D.fac.env&&D.fac.env.on);box.innerHTML=FL.filter(([k])=>k!=='env'||hasEnv).map(([k,n])=>`<button type="button" class="chip ${D.fac[k]&&D.fac[k].on?'on':''}" data-f="${k}">${n}</button>`).join('');
  $$('[data-f]',box).forEach(c=>c.onclick=()=>{const k=c.dataset.f,on=!(D.fac[k]&&D.fac[k].on);const ev=on?evidence(lr,k):null;D.fac[k]={on,ev:!!(ev&&ev.ok)};App.touch();drawFac(k);});
  const fb=$('#l4-facfb');if(!last||!D.fac[last].on){fb.className='fb';fb.textContent='';return;}const ev=evidence(lr,last);
  fb.className='fb '+(ev&&ev.ok?'ok':'no');fb.textContent=ev?(ev.ok?'有数据支持：':'')+ev.s:(last==='env'?'还没有数据：在噪音实验室用「轮流说」，噪音调小、调大各听一次。':`还没有对比数据：在「只改」里选「${{rate:'语速',cl:'吐字',tk:'文本'}[last]}」，比一次再来点。`);};
 L._dictFac=()=>drawFac();drawFac();marks();if(pairsOf(D.trials).rate||pairsOf(D.trials).cl||pairsOf(D.trials).tk)App.ran(st);}

/* ---------- 实验 2 · 同音词擂台 ---------- */
const cuesOf=C=>C.segs.filter(s=>s.cue).map(s=>s.cue);
const slotOn=(slot,on)=>new Set(Object.keys(slot.w||{}).filter(c=>on.has(c)));
const picksOf=(G,C,on)=>C.slots.map(s=>htop(hscore(G,s,slotOn(s,on))).w);
const sentHTML=(G,C,picks,off)=>C.segs.map(s=>typeof s==='string'?esc(s):s.cue?`<span class="l4-cue ${off&&off.has(s.cue)?'off':''}" ${off?`data-cue="${s.cue}" role="button" tabindex="0"`:''}>${esc(s.t)}</span>`:picks?`<span class="l4-slot ${picks[s.slot]===C.slots[s.slot].ans?'ok':'bad'}">${picks[s.slot]}</span>`:`<span class="l4-slot">${G.py}</span>`).join('');
const latHTML=(G,C,on,fin)=>`<div class="l4-lat">${C.slots.map((slot,i)=>{const sc=hscore(G,slot,slotOn(slot,on)),win=htop(sc).w;
 return `<div class="l4-col"><h5>第 ${i+1} 处 ${G.py} · AI 给每个词打的分</h5>${sc.map(x=>rowBar(x.w,Math.round(x.p*100),`${fin&&x.w===win?'win'+(win===slot.ans?'':' wrong'):''} ${fin&&x.w===slot.ans?'ans':''}`)).join('')}</div>`;}).join('')}</div>`;
const answerOf=C=>segText(C,i=>C.slots[i].ans);
function wireHomo(lr){const s2=$('#l4-s2'),H=lr.homo;let g=0,mode='word',busy=false;
 const G=()=>HG[g],C=()=>G()[mode],key=()=>G().id+'-'+mode;
 const card=picks=>{$('#l4-hs').innerHTML=sentHTML(G(),C(),picks,null);$('#l4-hsn').textContent='读的是：'+answerOf(C());};
 App.segWire(s2,'hg',v=>{g=+v;card();});App.segWire(s2,'hm',v=>{mode=v;card();});card();
 const marks=()=>{const d=H.done;if(Object.keys(d).length)App.markStep(s2,0);if(Object.keys(d).some(k=>k.endsWith('-word'))&&Object.keys(d).some(k=>k.endsWith('-sent')))App.markStep(s2,1);};
 const stars=()=>clamp(Object.values(H.pred).filter(p=>p.hit).length,1,3);
 $('#l4-hgo').onclick=async()=>{if(busy)return;busy=true;const b=$('#l4-hgo');App.busy(b,true,'AI 正在选词…');const G0=G(),C0=C(),k=key(),m=mode,on=new Set(m==='sent'?cuesOf(C0):[]);
  const ph=[[`听到读音「${G0.py}」。只听声音，分不出是哪个词……`,null],['先按“平时有多常用”给候选词打分。',new Set()]];if(m==='sent')ph.push(['再看上下文：读起来通顺的词，得分上升。',on]);
  for(const [t,o] of ph){App.aiSay('#l4-ai2',`${t}${o?latHTML(G0,C0,o,false):''}`,{busy:true});await sleep(700);}
  const picks=picksOf(G0,C0,on),n=C0.slots.filter((s,i)=>picks[i]===s.ans).length,allOk=n===C0.slots.length;if(k===key())card(picks);
  App.aiSay('#l4-ai2',`<div class="big">同音词写对 ${n}/${C0.slots.length}</div><div class="l4-sent">${sentHTML(G0,C0,picks,null)}</div>${latHTML(G0,C0,on,true)}<p class="note">得分 = 常用程度 × 上下文（示意数据）。绿条 = 选对，红条 = 选错。</p>`,{mood:allOk?'happy':'oops',src:'offline'});
  H.runs=(H.runs||0)+1;const d=H.done[k]=H.done[k]||{};d.n=(d.n||0)+1;d.ok=allOk;
  const gs=App.segVal(s2,'g2');let hit='';if(gs){const h=(gs==='ok')===allOk;if(!H.pred[k])H.pred[k]={p:gs,hit:h};hit=h?'你猜对了！':'和你猜的不一样。';}else hit='下次先猜一猜。';
  const wrong=C0.slots.map((s,i)=>picks[i]===s.ans?'':`把「${s.ans}」写成了「${picks[i]}」`).filter(Boolean).join('，');
  if(allOk)App.fb('#l4-fb2','ok','AI 全写对了！',`${hit}${m==='sent'?'整句话给了它上下文。':'这次运气好。'}换成「只读词语」再试。`,{stars:stars()});
  else App.fb('#l4-fb2','oops','AI 写错了同音词！',`${hit}它${wrong}。${m==='word'?'没有上下文，它只能猜最常用的词。换成「读整句」再试。':''}`,{stars:stars(),cheer:Object.values(H.done).filter(x=>x.ok===false).length===1});
  App.touch();marks();App.busy(b,false);b.classList.add('again');busy=false;unGuess(s2,'g2');reObs();};
 $('#l4-hsay').onclick=()=>{if(!Speech.say(answerOf(C()),{rate:.95}))App.toast('这台设备不支持朗读');};
 /* a real model: only the pinyin goes to it, with a fixed prompt */
 const lb=$('#l4-hllm');const showL=()=>{lb.hidden=!App.AI.sample;};showL();L._showLLM=showL;
 lb.onclick=async()=>{if(!App.AI.sample||busy)return;busy=true;lb.disabled=true;const G0=G(),C0=C(),k=key(),m=mode;App.aiSay('#l4-ai2','大模型正在根据拼音选字……',{busy:true});
  try{const {text}=await App.AI.sample(`你在扮演语音识别系统里“把读音写成汉字”的那一步。下面是一段普通话录音被识别出来的拼音（带声调，空格分隔每个字，逗号表示停顿）。请写出最可能的汉字。不要解释，不要加引号，只输出汉字（可以带标点）。\n拼音：${C0.py}`,{modelTier:'quick',cache:false});
   const out=String(text||'').trim().split('\n')[0].slice(0,80),ref=answerOf(C0),acc=Speech.accuracy(ref,out),n=C0.slots.filter(s=>out.includes(s.ans)).length,allOk=n===C0.slots.length;H.llm[k]=acc;
   App.aiSay('#l4-ai2',`<div class="big">同音词写对 ${n}/${C0.slots.length}</div>${dHTML(Speech.diff(ref,out))}<p class="note">只给了它拼音，让它根据上下文选字。</p>`,{mood:allOk?'happy':'oops',src:App.AI.label()||App.AI.mode()});
   if(allOk)App.fb('#l4-fb2','ok','真 AI 全写对了！',m==='sent'?'整句话给了它上下文。换成「只读词语」考考它。':'这次它把几个同音词都写出来了。可是只听声音，它并不知道你想说的是哪一个。换成「读整句」再试。',{stars:stars()});
   else App.fb('#l4-fb2','oops','真 AI 也写错了同音词！',m==='word'?'读音一样，又没有上下文，再强的 AI 也只能猜。':'有整句话，它还是选错了：AI 靠上下文猜，也有猜错的时候。',{stars:stars()});App.touch();}
  catch(e){App.AI.fail(e);showL();App.aiSay('#l4-ai2',esc(App.AI.errText(e)),{mood:'oops'});noSrc('#l4-ai2');App.fb('#l4-fb2','try','真 AI 暂时连不上','用大按钮「揭晓」也能做完实验。');}
  lb.disabled=false;busy=false;};
 seedSeq(H.obsq,H.obs,OBS2);
 const obsGet=()=>{const ks=Object.keys(H.done),w=ks.some(k=>k.endsWith('-word')),sn=ks.some(k=>k.endsWith('-sent'));
  return {qs:[w&&OBS2[0],sn&&OBS2[1],w&&sn&&OBS2[2]].filter(Boolean),more:!sn?'「读法」换成「读整句」再揭晓一次，会多两道观察题。':!w?'「读法」换成「只读词语」再揭晓一次，会多两道观察题。':''};};
 const reObs=seq($('#l4-obs2'),obsGet,H.obsq,()=>{mirror(H.obsq,H.obs,OBS2);App.touch();});
 marks();if(Object.keys(H.done).length)App.ran(s2);}

/* ---------- 实验 2b · 拆掉线索 ---------- */
function wireCtx(lr){const st=$('#l4-s2b'),H=lr.homo;let g=2,off=new Set();
 const G=()=>HG[g],C=()=>G().sent;
 const minOff=()=>{const cs=cuesOf(C()),n=cs.length;let best=n;for(let m=1;m<(1<<n);m++){const o=cs.filter((c,i)=>m>>i&1);if(o.length>=best)continue;const on=new Set(cs.filter(c=>!o.includes(c)));if(picksOf(G(),C(),on).some((p,i)=>p!==C().slots[i].ans))best=o.length;}return best;};
 const draw=picks=>{$('#l4-cs').innerHTML=sentHTML(G(),C(),picks,off);
  $('#l4-cues').innerHTML=C().segs.filter(s=>s.cue).map(s=>`<button type="button" class="chip ${off.has(s.cue)?'':'on'}" data-cue="${s.cue}" aria-pressed="${!off.has(s.cue)}">${esc(s.t)}</button>`).join('');
  $$('[data-cue]',st).forEach(b=>{b.onclick=()=>{const c=b.dataset.cue;off.has(c)?off.delete(c):off.add(c);if(off.size)App.markStep(st,0);draw();};b.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();b.onclick();}};});};
 App.segWire(st,'cg',v=>{g=+v;off=new Set();draw();});draw();
 if((H.ctx||0)>=1){App.markStep(st,0);}
 $('#l4-cxgo').onclick=async()=>{const b=$('#l4-cxgo');App.busy(b,true,'AI 正在选词…');const G0=G(),C0=C(),k=G0.id+'-sent',o=new Set(off),on=new Set(cuesOf(C0).filter(c=>!o.has(c)));
  App.aiSay('#l4-ai2b',o.size?`少了 ${o.size} 条线索，重新给候选词打分……`:'线索都在，给候选词打分……',{busy:true});await sleep(600);
  const picks=picksOf(G0,C0,on),allOk=picks.every((p,i)=>p===C0.slots[i].ans),n=picks.filter((p,i)=>p===C0.slots[i].ans).length;if(G0===G())draw(picks);
  App.aiSay('#l4-ai2b',`<div class="big">同音词写对 ${n}/${C0.slots.length}</div>${latHTML(G0,C0,on,true)}<p class="note">得分为示意数据。</p>`,{mood:allOk?'happy':'oops',src:'offline'});
  H.runs=(H.runs||0)+1;const d=H.done[k]=H.done[k]||{};d.n=(d.n||0)+1;if(!o.size)d.ok=allOk;else{H.ctx=(H.ctx||0)+1;App.markStep(st,0);}
  const gone=C0.segs.filter(s=>s.cue&&o.has(s.cue)).map(s=>`「${esc(s.t)}」`).join('');
  if(!o.size)App.fb('#l4-fb2b','try','线索都在，AI 全写对了','点一下句子里蓝色的词，把它去掉，再让 AI 写。',{stars:1});
  else if(allOk)App.fb('#l4-fb2b','try',`去掉 ${o.size} 条，AI 还是写对了`,'剩下的线索还够用。再去掉一条，或者换一条去掉。',{stars:1});
  else{const mn=minOff(),w=C0.slots.map((s,i)=>picks[i]===s.ans?'':`把「${s.ans}」写成了「${picks[i]}」`).filter(Boolean).join('，');App.markStep(st,1);
   App.fb('#l4-fb2b','oops','你把 AI 难倒了！',`去掉${gone}，它${w}。${o.size<=mn?'这是最少的去法！换一个同音词再拆。':`还能更少：只去掉 ${mn} 条也行。把线索点回来，再试。`}`,{stars:o.size<=mn?3:2});}
  App.touch();App.busy(b,false);b.classList.add('again');};}

/* ---------- 实验 3 · 噪音实验室 ---------- */
const SPC={A:'var(--sky)',B:'var(--sun-d)',C:'var(--mint-d)'};
const noiseOut=(sim,hi)=>(sim.sens.map(S=>`<div class="l4-sen">${S.map(t=>`${t.spl!=null?`<span class="l4-mk ${hi===t.spl?'l4-on':''}">拼接</span>`:''}<span class="l4-tk s${t.sp} ${t.st==='sub'?'sub':t.st==='bg'?'bg':''} ${t.e!=null&&hi===t.e?'l4-on':''}">${esc(t.c)}</span>`).join('')}</div>`).join('')||'<p>（什么也没听出来）</p>')
 +`<div class="l4-lg"><span><i style="background:#2f6bff"></i>甲</span><span><i style="background:#ef9a00"></i>乙</span><span><i style="background:#12b886"></i>丙</span><span><i style="background:var(--grape)"></i>喇叭</span></div>`;
const noiseTags=sim=>`<div class="row">${tag('拼接 '+sim.sp,sim.sp?'bad':'ok')}${tag('漏字 '+sim.dr,sim.dr?'bad':'ok')}${tag('错字 '+sim.sb,sim.sb?'bad':'ok')}${tag('背景声变字 '+sim.bg,sim.bg?'bad':'ok')}</div>`;
const pushCond=(N,mode,lvl,sim)=>{N.conds.push({m:mode,l:lvl,acc:sim.acc,sp:sim.sp,dr:sim.dr,bg:sim.bg,sb:sim.sb});if(N.conds.length>12)N.conds.shift();N.runs=(N.runs||0)+1;};
function wireNoise(lr){const s3=$('#l4-s3'),N=lr.noise;let mode='turn',lvl=30,sim=null;const tl=$('#l4-tl');
 const draw=()=>drawTL(tl,mode,lvl,sim,null);redraws.push(draw);
 const ref=()=>{$('#l4-nref').innerHTML=SP.map((s,i)=>`<div><b style="color:${SPC[s.id]}">${s.n}</b>${sim?sim.U[i].chars.map(ch=>ch.st==='ok'?esc(ch.c):`<span class="${ch.st==='sub'?'sb':'dr'}">${esc(ch.c)}</span>`).join(''):esc(s.text)}</div>`).join('')+(sim?'<p class="note">划掉 = AI 没写出来　红底 = AI 写错了</p>':'<p class="note">这是三个人真正说的话。</p>');};
 let liveOn=false;
 const changed=()=>{if(player)player.setGain(0.04+lvl/100*0.3);if(liveOn){show(simNoise(mode,lvl));return;}sim=null;ref();draw();};
 App.rangeWire('l4-nl',v=>{lvl=v;changed();});App.segWire(s3,'nm',v=>{mode=v;changed();if(liveOn)commit();});ref();draw();
 $('#l4-nl').addEventListener('change',()=>{if(liveOn)commit();});
 const both=()=>N.conds.some(x=>x.m==='turn')&&N.conds.some(x=>x.m==='same');
 const marks=()=>{if(N.conds.length)App.markStep(s3,0);if(both())App.markStep(s3,1);};
 const drawLog=()=>{$('#l4-nlog').innerHTML=N.conds.slice(-5).map(x=>tag(`${x.m==='same'?'同时':'轮流'} · 噪音 ${x.l} → ${x.acc}%`,x.acc>=95?'ok':'bad')).join('');};
 const show=S=>{sim=S;ref();draw();App.aiSay('#l4-ai3',`<div class="big">${S.acc}% 写对</div>${noiseOut(S,null)}${noiseTags(S)}`,{mood:S.acc>=95?'happy':'oops',src:'offline'});};
 /* commit = write this result into the record and say what it means (on the big button, on releasing the slider, on switching the mode) */
 const commit=()=>{const S=sim,m=S.mode,l=S.lvl;const last=N.conds[N.conds.length-1];if(!(last&&last.m===m&&last.l===l))pushCond(N,m,l,S);
  const stars=both()&&N.conds.some(x=>x.sp>0)?3:N.conds.some(x=>x.acc<95)?2:1;const list=[S.sp&&`拼接 ${S.sp} 处`,S.dr&&`漏字 ${S.dr} 处`,S.sb&&`错字 ${S.sb} 个`,S.bg&&'喇叭声被写成了字'].filter(Boolean).join('、');
  if(S.acc>=95)App.fb('#l4-fb3','ok','AI 听得很清楚',`${m==='turn'?'轮流说、噪音小，声音没有混在一起。':''}拖一拖噪音滑杆，或换成「同时说」，结果马上跟着变。`,{stars});
  else App.fb('#l4-fb3','oops',`AI 听乱了！只写对 ${S.acc}%`,`${list}。${both()?'轮流和同时都试过了。拖一拖滑杆，看哪种说法更怕吵。':m==='same'?'几个人同时说，声音混在一起。再试试「轮流说」。':S.sb+S.dr>0?'噪音盖住了人声。再试试「同时说」。':'再试试「同时说」。'}`,{stars,cheer:N.conds.filter(x=>x.acc<95).length===1});
  App.touch();marks();drawLog();reObs();if(L._dictFac)L._dictFac();};
 $('#l4-ngo').onclick=async()=>{const b=$('#l4-ngo');App.busy(b,true,'AI 正在听…');App.aiSay('#l4-ai3','集市里好热闹，正在努力分辨每个人的话……',{busy:true});await sleep(600);
  show(simNoise(mode,lvl));liveOn=true;commit();App.busy(b,false);b.classList.add('again');};
 const pb=$('#l4-nplay');pb.onclick=()=>{if(player){player.stop();player=null;pb.textContent='听听集市声';return;}player=Speech.noise('market',{gain:0.04+lvl/100*0.3});if(player)pb.textContent='停止集市声';else App.toast('这台设备不能播放声音');};
 L._noiseStop=()=>{if(player){player.stop();player=null;pb.textContent='听听集市声';}};
 seedSeq(N.obsq,N.obs,OBS3);
 /* answers are checked against the student's own runs, not against a fixed key */
 const obsGet=()=>{const c=N.conds,ex=noiseExpect(N),sp=c.reduce((a,x)=>a+x.sp,0),dr=c.reduce((a,x)=>a+x.dr,0),bg=c.some(x=>x.bg>0);
  const q2=Object.assign({},OBS3[1],{ok:ex.q2,why:`你的记录里一共有拼接 ${sp} 处、漏字 ${dr} 处。${sp&&dr?'':'换成「同时说」、把噪音调大，再看看。'}`});
  const q3=Object.assign({},OBS3[2],{ok:ex.q3,why:bg?'噪音到 40 以上时，喇叭声被写成了「嘀」「滴滴」。':'这几次喇叭声没有被写成字。'});
  return {qs:[both()&&OBS3[0],c.length&&q2,ex.q3&&q3].filter(Boolean),more:!both()?'「轮流说」「同时说」都听过，会多一道观察题。':!ex.q3?'把噪音调到 40 以上再听一次，会多一道观察题。':''};};
 const reObs=seq($('#l4-obs3'),obsGet,N.obsq,()=>{mirror(N.obsq,N.obs,OBS3);App.touch();});
 marks();drawLog();if(N.conds.length)App.ran(s3);}

/* ---------- 实验 3b · 错误侦探 ---------- */
function wireDiag(lr){const st=$('#l4-s3b'),N=lr.noise;let scn='same-70',sim=null,list=[],j=0,judged={};const tl=$('#l4-tl2');
 const cur=()=>sim&&list.length?sim.errs[list[Math.min(j,list.length-1)]]:null;
 const draw=()=>{const [m,l]=SCN[scn];const e=cur();drawTL(tl,m,l,sim,e?{t0:e.t0,t1:e.t1}:null);};redraws.push(draw);
 App.segWire(st,'scn',v=>{scn=v;sim=null;list=[];j=0;judged={};draw();card();});draw();
 const pick=S=>{const out=[];['splice','bg','drop','sub'].forEach(t=>{const i=S.errs.findIndex(e=>e.type===t);if(i>=0)out.push(i);});S.errs.forEach((e,i)=>{if(out.length<4&&!out.includes(i))out.push(i);});return out.slice(0,4).sort((a,b)=>a-b);};
 const out=()=>{const o=$('#l4-dout');if(o&&sim)o.innerHTML=noiseOut(sim,list.length?list[Math.min(j,list.length-1)]:null);};
 const card=()=>{const box=$('#l4-diag');const e=cur();if(!e){box.innerHTML='<p class="note">换了集市现场：按「抓错误」，再来断案。</p>';return;}const d=judged[j];
  const why=e.type==='splice'?'两个人同时在说，他们的话就被连到了一起。':e.type==='bg'?'喇叭声不是人说的话，AI 却把它写成了字。':e.ok.length>1?'这时候有人同时在说，噪音也不小，两个原因都有份。':e.ok[0]==='overlap'?'这时候有别人同时在说，把这个字盖住了。':'这时候没有别人抢着说，是噪音盖住了这个字。';
  box.innerHTML=`<div class="ask"><span class="note">第 ${j+1} / ${list.length} 个错误 · ${ETYPE[e.type]}（时间轴白框、听写紫框里）</span><br>${esc(e.txt)}　是什么原因？</div><div class="opts">${Object.entries(CAUSE).map(([k,n])=>`<button type="button" class="chip ${d&&d.pick===k?'on':''}" data-ca="${k}">${n}</button>`).join('')}</div><div class="fb ${d?(d.ok?'ok':'no'):''}" aria-live="polite">${d?(d.ok?'判断对了！':'再想想：')+why:''}</div><div class="row"><button type="button" class="btn ghost sm" data-prev ${j?'':'hidden'}>上一个错误</button><button type="button" class="btn sm" data-next ${d&&j<list.length-1?'':'hidden'}>下一个错误</button></div>`;
  $('[data-prev]',box).onclick=()=>{j--;card();draw();out();};
  $$('[data-ca]',box).forEach(b=>b.onclick=()=>{if(judged[j]||!sim)return;const ok=e.ok.includes(b.dataset.ca);judged[j]={pick:b.dataset.ca,ok};N.tag.n++;if(ok)N.tag.ok++;App.touch();card();
   if(Object.keys(judged).length>=list.length){const n=Object.values(judged).filter(x=>x.ok).length;App.markStep(st,1);
    App.fb('#l4-fb3b',n===list.length?'ok':'find',`断案完成：${n}/${list.length} 个找对原因`,'同时说话会拼接、盖住别人；噪音大容易写错、漏字；喇叭声会被当成字。',{stars:n===list.length?3:n*2>=list.length?2:1});}});
  $('[data-next]',box).onclick=()=>{j++;card();draw();out();};};
 $('#l4-dgo').onclick=async()=>{const b=$('#l4-dgo');App.busy(b,true,'AI 正在听…');App.aiSay('#l4-ai3b','正在听集市里的三个人说话……',{busy:true});const k=scn,[m,l]=SCN[k];await sleep(600);
  sim=simNoise(m,l);list=pick(sim);j=0;judged={};pushCond(N,m,l,sim);App.markStep(st,0);
  App.aiSay('#l4-ai3b',`<div class="big">${sim.acc}% 写对</div><div id="l4-dout"></div>${noiseTags(sim)}`,{mood:list.length?'oops':'happy',src:'offline'});out();draw();card();
  if(list.length)App.fb('#l4-fb3b','find',`AI 出了 ${sim.errs.length} 个错`,`挑了 ${list.length} 个给你断案：看框出来的地方，在「断案记录」里选原因。`,{stars:1});
  else App.fb('#l4-fb3b','try','这次 AI 没出错','换一个更吵、更乱的集市现场再抓。',{stars:1});
  App.touch();App.busy(b,false);b.classList.add('again');};
 if(N.tag.n>=1)App.markStep(st,0);if(N.tag.n>=2)App.markStep(st,1);}
/* which observation answers fit the student's own noise data (null = not enough data) */
function noiseExpect(N){const c=(N&&N.conds)||[];if(!c.length)return {};const both=c.some(x=>x.m==='turn')&&c.some(x=>x.m==='same');const sp=c.some(x=>x.sp>0),dr=c.some(x=>x.dr>0),bg=c.some(x=>x.bg>0);
 return {q1:both?[2]:c.some(x=>x.m==='same')?[1,2]:null,q2:sp&&dr?[2]:sp?[0,2]:dr?[1,2]:[3],q3:bg?[0]:c.some(x=>x.l>=40)?[1]:null};}

/* ---------- apply ---------- */
const SC=[['轮流发言，一个人说完另一个人再说',1],['几个人同时抢着说，AI 会自动分清',0],['找一间安静的教室，关掉旁边的音乐',1],['识别完直接发给老师，不用看',0],['先检查人名、同音词，改正后再发',1],['没经过同学同意，就把他的发言录音发到网上',0]];
function wireApply(lr){const st=$('#l4-s4'),A=lr.apply;let sel=new Set(A.sel||[]),shown=A.first!=null;const box=$('#l4-sc');
 const draw=()=>{box.innerHTML=SC.map(([t,ok],i)=>`<button class="chip big ${sel.has(i)?'on':''} ${shown&&sel.has(i)?(ok?'right':'wrong'):''}" type="button" data-sc="${i}" aria-pressed="${sel.has(i)}">${t}</button>`).join('');
  $$('[data-sc]',box).forEach(b=>b.onclick=()=>{const i=+b.dataset.sc;sel.has(i)?sel.delete(i):sel.add(i);shown=false;App.markStep(st,0);draw();});};draw();
 $('#l4-scgo').onclick=()=>{if(!sel.size){App.fb('#l4-fb4','try','先点出你认为对的做法','一共 6 种做法，对的不止一个。');return;}
  let s=0;SC.forEach(([t,ok],i)=>{if(!!ok===sel.has(i))s++;});const v=Math.round(100*s/SC.length);A.sel=[...sel];A.last=v;if(A.first==null)A.first=v;shown=true;draw();App.markStep(st,0);App.markStep(st,1);App.touch();
  const stars=A.first===100?3:v===100?2:1;
  if(v===100)App.fb('#l4-fb4','ok','全部判断对了！','安静、轮流、检查、尊重别人的声音。在「我的记录」里勾上你的约定。',{stars});
  else{const bad=SC.filter(([t,ok],i)=>!ok&&sel.has(i)).length,miss=SC.filter(([t,ok],i)=>ok&&!sel.has(i)).length;
   App.fb('#l4-fb4','try',`6 种做法判断对了 ${s} 种`,`${bad?`红色的 ${bad} 个不该选。`:''}${miss?`还有 ${miss} 个对的做法没点到。`:''}改一改，再提交。`,{stars});}};
 const pv=$('#l4-priv');pv.checked=!!lr.priv;pv.onchange=()=>{lr.priv=pv.checked;App.touch();};
 if(A.first!=null){App.markStep(st,0);App.markStep(st,1);App.ran(st);}}

/* ---------- diary extras ---------- */
function extras(ex){const l=App.lesson(K);const tr=((l.dict||{}).trials)||[];const H=l.homo||{},N=l.noise||{};
 if(!tr.length&&!Object.keys(H.pred||{}).length&&!((N.conds||[]).length)){ex.innerHTML='<p class="note">完成三个挑战后显示结果。</p>';return;}
 const best=tr.slice().sort((a,b)=>b.acc-a.acc)[0],worst=tr.slice().sort((a,b)=>a.acc-b.acc)[0];
 const show=(t,lab)=>`<div style="margin-bottom:10px"><div class="note">${lab}：${TX(t.tx).name} · ${condTxt(t)} → <b style="color:var(--fg)">${t.acc}%</b></div>${dHTML(Speech.diff(TX(t.tx).text,t.h||''))}</div>`;
 const p=pairsOf(tr);const find=[];['rate','cl','tk'].forEach(f=>{const e=evidence(l,f);if(e&&e.ok)find.push(e.s);});const env=evidence(l,'env');if(env&&env.ok)find.push(env.s);
 const hp=Object.values(H.pred||{});const nc=N.conds||[];
 ex.innerHTML=`${best?show(best,'准确率最高的一次'):''}${worst&&worst!==best&&worst.acc<best.acc?show(worst,'错得最多的一次'):''}
  ${find.length?`<div class="box-t" style="margin-top:6px">我的对比发现</div><ul style="margin:0;padding-left:18px;font-size:13.5px">${find.map(s=>`<li>${esc(s)}</li>`).join('')}</ul>`:''}
  ${hp.length?`<p class="note" style="margin-top:8px">同音词擂台：预测 ${hp.length} 次，命中 ${hp.filter(x=>x.hit).length} 次。</p>`:''}
  ${nc.length?`<p class="note">噪音实验室：${nc.length} 次，准确率 ${Math.min(...nc.map(x=>x.acc))}%～${Math.max(...nc.map(x=>x.acc))}%；发现拼接 ${nc.reduce((a,x)=>a+x.sp,0)} 处、漏字 ${nc.reduce((a,x)=>a+x.dr,0)} 处、背景声变文字 ${nc.reduce((a,x)=>a+x.bg,0)} 处。</p>`:''}`;}

/* ---------- hooks ---------- */
L.onShow=()=>{requestAnimationFrame(()=>{redrawAll();if(L._showLLM)L._showLLM();});};
L.onHide=()=>{Speech.release();cancelAnimationFrame(raf);sessions.forEach(s=>s.cancel());sessions.clear();if(L._dictStop)L._dictStop();if(L._homoStop)L._homoStop();if(L._noiseStop)L._noiseStop();player=null;};
L.quiz=QUIZ;L._sim={simDictate,simNoise,TEXTS,HG,hscore,htop};
L.intro={q:'在热闹的集市里对着手机说话，AI 能把话准确写成文字吗？',opts:['能，一个字都不会错', '大部分能，但噪音大、几个人同时说时容易出错', '完全不能'],img:'img/l4_market.jpg',alt:'集市里几个人同时说话的示意图',back:'挑战三的噪音实验会验证你的猜测。'};
L.flow=[
 {seg:'导入',from:'l4-intro'},
 {seg:'挑战一',kp:'知识点一 · AI 靠比对语音特征来听写',learn:['训练时听大量语音，记住语音特征和字词的对应关系','听到语音就快速比对：声音→特征→候选→语境→文字','听得清、学过，AI 才写得准'],sum:['安静、平缓、清晰时，《静夜思》几乎全对','只改语速或吐字，准确率就下降','生僻字被写成读音相同的常用字，如苔→台'],from:'l4-s0',to:'l4-s1'},
 {seg:'挑战二',kp:'知识点二 · 同音词要靠完整的语境',learn:['同音词读音一样、意思不同，仅凭发音难以区分','AI 结合整句语境给候选词打分，选最合语义的词','语境完整就准，孤立的几个词容易错'],sum:['只读词语时，几处常被写成同一个常用词','读整句大多写对；去掉上下文，得分就变','用 AI 时要把信息和语境说完整'],from:'l4-s2',to:'l4-s2'},
 {seg:'挑战三',kp:'知识点三 · 多个声音混在一起会互相干扰',learn:['嘈杂时多个声音混在一起、互相干扰','AI 可能拼接两个人的话，漏掉字或整句话','背景声（如喇叭声）可能被当成字'],sum:['轮流说话大多写对，同时说话准确率大降','出现拼接、漏字，喇叭声被写成“嘀”','要选安静的环境，并注意轮流发言'],from:'l4-s3',to:'l4-s3'},
 {seg:'综合运用',from:'l4-s4'},
 {seg:'反思与总结',from:'l4-quizst'}
];
L.diaryTitle='我的听写记录';
L.diaryQ=[['when','什么时候准，什么时候错'],['similar','和人听话的相似处 · 怎样说 AI 才听得清'],['future','畅想未来的语音识别']];

function parts(lr){const D=lr.dict||{},H=lr.homo||{},N=lr.noise||{};const tr=D.trials||[],nc=N.conds||[];const hp=Object.values(H.pred||{});const hd=H.done||{};
 return {D,H,N,tr,nc,hp,hd,pr:pairsOf(tr),both:HG.filter(G=>hd[G.id+'-word']&&hd[G.id+'-sent']).length,ncBoth:nc.some(x=>x.m==='turn')&&nc.some(x=>x.m==='same')};}
L.score=lr=>{const {D,H,N,tr,nc,hp,pr,both,ncBoth}=parts(lr);const A=lr.apply||{},Di=lr.diary||{},Q=lr.quiz||{},tx=App.txtScore;const qs=id=>Q[id]?(Q[id].ok?100:0):0;
 const fac=D.fac||{};const facGood=['rate','cl','tk','env'].filter(k=>fac[k]&&fac[k].on&&fac[k].ev).length,facBad=['poem'].filter(k=>fac[k]&&fac[k].on).length+['rate','cl','tk','env'].filter(k=>fac[k]&&fac[k].on&&!fac[k].ev).length*0.5;
 const ex=noiseExpect(N),ob=N.obs||{};const obsN=['q1','q2','q3'].filter(k=>ob[k]!=null&&ex[k]&&ex[k].includes(ob[k])).length;
 const mic=tr.filter(x=>x.src==='mic');const micBest=mic.length?Math.max(...mic.map(x=>x.acc)):null;
 const demoBest=tr.some(x=>x.src==='demo'&&x.c==='clear'&&x.r!=='fast'&&x.acc>=95)?35:0;const triedHard=tr.some(x=>x.r==='fast'||x.c==='mumble')?15:0;
 const homoObs=H.obs||{};const tag=N.tag||{};const nlv=new Set(nc.map(x=>x.l)).size;
 return {principle:Math.round(15*(lr.pipe?1:0)+0.2*qs('q1')+0.15*qs('q3')+0.15*qs('q4')+(homoObs.t2===1?20:homoObs.t2!=null?5:0)+0.15*tx(Di.when)),
  experiment:Math.round(25*Math.min(1,tr.length/5)+12*(pr.tk?1:0)+12*(pr.rate?1:0)+8*(pr.cl?1:0)+18*Math.min(1,both/2)+15*(ncBoth?1:nc.length?0.5:0)+10*(nlv>=2?1:0)),
  prompt:Math.round(Math.min(60,micBest!=null?Math.max(0.6*micBest,demoBest+triedHard):demoBest+triedHard)+0.4*tx(Di.similar,40)),
  critical:Math.round(25*clamp((facGood-facBad)/3,0,1)+25*(hp.length?hp.filter(p=>p.hit).length/hp.length*Math.min(1,hp.length/3):0)+25*(tag.n?tag.ok/tag.n*Math.min(1,tag.n/3):0)+15*obsN/3+10*((D.obs||{}).q3===1?1:0)),
  creative:Math.round(0.8*tx(Di.future,40)+20*((H.ctx||0)>=2?1:0)),
  ethics:Math.round(30*(lr.priv?1:0)+20*(Di.pledge?1:0)+0.25*qs('q5')+25*(A.first!=null?A.first/100:0))};};
L.progress=lr=>{const {D,H,N,tr,nc,hp,pr,both,ncBoth}=parts(lr);const ob=N.obs||{},dob=D.obs||{};
 const m=[!!lr.pipe,tr.length>=1,!!(pr.tk||pr.rate||pr.cl),['q1','q2','q3'].every(k=>dob[k]!=null),both>=1,hp.length>=3,ncBoth,((N.tag||{}).n>=2)||['q1','q2','q3'].every(k=>ob[k]!=null),!!lr.priv&&(lr.apply||{}).first!=null,Object.keys(lr.quiz||{}).length>=5,!!(lr.diary||{}).submitted];
 return m.filter(Boolean).length/m.length;};
L.expCount=lr=>{const {H,N,tr,nc}=parts(lr);return tr.length+(H.runs||0)+nc.length+Object.keys(H.mic||{}).length+Object.keys(H.llm||{}).length+Object.keys(N.mic||{}).length;};
L.works=lr=>{const {tr,nc,hp}=parts(lr);const w=[];if(!tr.length&&!hp.length&&!nc.length)return w;
 const best=tr.slice().sort((a,b)=>b.acc-a.acc)[0],worst=tr.slice().sort((a,b)=>a.acc-b.acc)[0];
 if(best)w.push({glyph:'听',t:'我的听写记录',s:`${TX(best.tx).name} · ${condTxt(best)} → ${best.acc}%`});
 if(worst&&worst.acc<best.acc){const ops=Speech.diff(TX(worst.tx).text,worst.h||'');const bad=ops.filter(o=>o.op==='sub').slice(0,3).map(o=>`${o.r}→${o.h}`).join('、');w.push({glyph:'错',t:'AI 听错的一次',s:`${TX(worst.tx).name} · ${condTxt(worst)} → ${worst.acc}%${bad?'：'+bad:''}`});}
 if(hp.length)w.push({glyph:'音',t:'同音词擂台',s:`预测 ${hp.length} 次，命中 ${hp.filter(p=>p.hit).length} 次`});
 if(nc.length){const lo=nc.slice().sort((a,b)=>a.acc-b.acc)[0];w.push({glyph:'噪',t:'噪音实验室',s:`最低准确率 ${lo.acc}%（${NM[lo.m]}，噪音 ${lo.l}）`});}
 return w;};

/* ---------- teacher ---------- */
L.classPanels=recs=>{const T=[],C=[],P={};let facN={rate:0,cl:0,tk:0,env:0},poem=0;
 recs.forEach(r=>{const l=(r.lessons||{})[K]||{};((l.dict||{}).trials||[]).forEach(x=>T.push(x));((l.noise||{}).conds||[]).forEach(x=>C.push(x));Object.entries((l.homo||{}).pred||{}).forEach(([k,p])=>{(P[k]=P[k]||[]).push(p);});
  const f=(l.dict||{}).fac||{};Object.keys(facN).forEach(k=>{if(f[k]&&f[k].on&&f[k].ev)facN[k]++;});if(f.poem&&f.poem.on)poem++;});
 const col=v=>v==null?'transparent':v>=95?'var(--green)':v>=80?'var(--amber)':'var(--red)';
 const bar=(n,arr)=>{const v=avg(arr);return `<div class="hbar"><span>${n} <span class="note">${arr.length}次</span></span><span class="tr"><i style="width:${v||0}%;background:${col(v)}"></i></span><span>${v==null?'—':v+'%'}</span></div>`;};
 const acc=f=>T.filter(f).map(x=>x.acc),nacc=f=>C.filter(f).map(x=>x.acc);
 const p1=`<div class="box"><div class="box-t">第4讲 · 各条件下的平均识别准确率（全班 ${T.length} 次听写 + ${C.length} 次集市识别）</div>
  ${bar('普通古诗',acc(x=>x.k==='common'))}${bar('生僻古文',acc(x=>x.k==='rare'))}${bar('慢速朗读',acc(x=>x.r==='slow'))}${bar('正常语速',acc(x=>x.r==='normal'))}${bar('快速朗读',acc(x=>x.r==='fast'))}${bar('吐字清晰（演示）',acc(x=>x.c==='clear'))}${bar('吐字含糊（演示）',acc(x=>x.c==='mumble'))}
  ${bar('集市 · 轮流说话、噪音 ≤ 30',nacc(x=>x.m==='turn'&&x.l<=30))}${bar('集市 · 轮流说话、噪音 ≥ 60',nacc(x=>x.m==='turn'&&x.l>=60))}${bar('集市 · 同时说话',nacc(x=>x.m==='same'))}
  <p class="note">有数据支持并写出结论的学生：语速 ${facN.rate} 人，吐字 ${facN.cl} 人，生僻字 ${facN.tk} 人，嘈杂环境 ${facN.env} 人；误认为“AI 不擅长古诗” ${poem} 人。</p></div>`;
 const hitBar=k=>{const a=P[k]||[];const v=a.length?Math.round(100*a.filter(p=>p.hit).length/a.length):null;return `<div class="hbar"><span>${HG.find(G=>k.startsWith(G.id)).py} · ${MODES[k.split('-')[1]]} <span class="note">${a.length}人</span></span><span class="tr"><i style="width:${v||0}%;background:${v==null?'transparent':v>=70?'var(--green)':v>=50?'var(--amber)':'var(--red)'}"></i></span><span>${v==null?'—':v+'%'}</span></div>`;};
 const sum=k=>C.reduce((a,x)=>a+(x[k]||0),0);const tot=sum('sp')+sum('dr')+sum('sb')+sum('bg');
 const p2=`<div class="box"><div class="box-t">第4讲 · 同音词预测命中率 与 集市录音中出现的错误</div>${HG.flatMap(G=>['word','sent'].map(m=>hitBar(G.id+'-'+m))).join('')}
  <div class="sep" style="margin:8px 0"></div>${[['拼接（两人的话连在一起）','sp','var(--amber)'],['漏字、漏句','dr','var(--red)'],['写错字','sb','var(--red)'],['背景声变文字','bg','var(--violet)']].map(([n,k,c])=>`<div class="hbar"><span>${n}</span><span class="tr"><i style="width:${tot?100*sum(k)/tot:0}%;background:${c}"></i></span><span>${sum(k)}</span></div>`).join('')}</div>`;
 return p1+p2;};
L.classSug=recs=>{const out=[];const ls=recs.map(r=>(r.lessons||{})[K]||{});
 const wp=ls.flatMap(l=>Object.entries((l.homo||{}).pred||{}).filter(([k])=>k.endsWith('-word')).map(([k,p])=>p));
 if(wp.length>=3){const opt=wp.filter(p=>p.p==='ok').length;if(opt/wp.length>=0.35)out.push(`第4讲：有 ${Math.round(100*opt/wp.length)}% 的“只读词语”预测认为 AI 能写对同音词。建议现场只读“gōng shì”，请学生写下三个可能的词，再读出整句，追问“AI 靠什么改变了选择”。`);}
 const ran=ls.filter(l=>((l.dict||{}).trials||[]).length>0),nop=ran.filter(l=>{const p=pairsOf(l.dict.trials);return !(p.rate||p.cl||p.tk);});
 if(ran.length&&nop.length/ran.length>=0.3)out.push(`第4讲：${nop.length} 名学生做了听写实验，却没有一组“只改变一个条件”的对比。建议示范：同一首《静夜思》，只把语速从慢速改成快速，再比较准确率。`);
 if(out.length<2){const same=ls.filter(l=>((l.noise||{}).conds||[]).some(x=>x.m==='same')).length,tot=ls.filter(l=>((l.noise||{}).conds||[]).length).length;if(tot&&same/tot<0.6)out.push(`第4讲：只有 ${same}/${tot} 名学生在噪音实验室试过“同时说话”。建议请三名同学同时说集市里的三句话，让全班体会“拼接”和“漏字”是怎样产生的。`);}
 return out.slice(0,2);};
L.demo=(rnd,t)=>{const pick=p=>rnd()<p;const str=n=>'这是示例文字'.repeat(Math.max(0,Math.round(n/6)));const q=(p,a)=>{const ok=pick(p);return {first:ok?a:(a+1)%3,ok,last:a};};
 const tr=[];const n=1+Math.floor(rnd()*5*t+t*2);let prev=null;
 for(let j=0;j<n;j++){let T,r,c;if(prev&&pick(t)){T=TX(prev.tx);c=prev.c;r=prev.r==='fast'?'slow':pick(.5)?'fast':'slow';if(pick(.3)){r=prev.r;T=TEXTS[prev.k==='rare'?1:2+Math.floor(rnd()*2)];}}
  else{T=TEXTS[j%3===2?2+Math.floor(rnd()*2):Math.floor(rnd()*2)];r=j?['slow','normal','fast'][Math.floor(rnd()*3)]:'normal';c=pick(.3)?'mumble':'clear';}
  const h=simDictate(T,r,c),ops=Speech.diff(T.text,h);prev={src:'demo',eng:'',tx:T.id,k:T.kind,r,c,sps:RATES[r].sps,acc:Speech.accuracy(T.text,h),e:errOf(ops),h};tr.push(prev);}
 if(pick(.2)){const T=TEXTS[1];tr.push({src:'mic',eng:'live',tx:T.id,k:T.kind,r:'normal',c:'self',sps:+(3+rnd()*2).toFixed(1),acc:Math.round(80+20*rnd()),e:[1,0,0],h:T.text});}
 const lr={pipe:pick(.6+t*.4)?1:0,dict:{trials:tr,obs:{q1:0,q2:pick(.7)?1:0,q3:pick(.35+t*.6)?1:0},fac:{}}};
 const pr=pairsOf(tr);['rate','cl','tk'].forEach(f=>{if(pr[f]&&pick(t))lr.dict.fac[f]={on:true,ev:pr[f].hard.acc<pr[f].easy.acc};});if(pick(.25*(1-t)))lr.dict.fac.poem={on:true,ev:false};
 const homo={pred:{},done:{},obs:{},mic:{},llm:{},runs:0,ctx:pick(t)?2+Math.floor(rnd()*3):0};const ng=Math.min(3,1+Math.floor(rnd()*3*t+t));
 HG.slice(0,ng).forEach(G=>['word','sent'].forEach(m=>{if(m==='sent'&&!pick(.4+t*.6))return;const aiOk=m==='sent';homo.done[G.id+'-'+m]={n:1,ok:aiOk};homo.runs++;const hit=pick(m==='word'?.3+t*.5:.6+t*.35);homo.pred[G.id+'-'+m]={p:hit===aiOk?'ok':'err',hit};}));
 if(pick(.6))homo.obs={o1:pick(.5+t*.4)?1:0,o2:pick(.8)?0:1,t2:pick(.45+t*.5)?1:0};lr.homo=homo;
 const conds=[];const plan=[['turn',20],['same',pick(.5)?20:50],['turn',70],['same',80]].slice(0,1+Math.floor(rnd()*4*t+t));plan.forEach(([m,l])=>{const s=simNoise(m,l);conds.push({m,l,acc:s.acc,sp:s.sp,dr:s.dr,bg:s.bg,sb:s.sb});});
 const tn=Math.floor(rnd()*6*t);lr.noise={conds,runs:conds.length,tag:{n:tn,ok:Math.round(tn*(.4+.6*t*rnd()))},mic:{},obs:pick(.5+t*.4)?{q1:pick(t)?2:1,q2:pick(t)?2:0,q3:conds.some(x=>x.bg)?0:1}:{}};
 if(conds.length&&pick(t)){const q=conds.filter(x=>x.m==='turn'&&x.l<=20),z=conds.filter(x=>x.m==='turn'&&x.l>=60);if(q.length&&z.length)lr.dict.fac.env={on:true,ev:true};}
 lr.priv=pick(.85);lr.apply=pick(.7)?{first:Math.round(50+50*Math.min(1,t*1.1*rnd()+.2)),last:100}:{};
 lr.quiz={q1:q(.6+t*.4,1),q2:q(.7+t*.3,1),q3:q(.35+t*.55,1),q4:q(.55+t*.4,1),q5:q(.75+t*.25,1)};
 lr.diary={when:str(30*t+10),similar:str(30*t),future:str(25*t+5),pledge:pick(.8),submitted:pick(t+.1)?1:0};
 return lr;};
})();
