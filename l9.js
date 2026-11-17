/* 第9讲 报告协作台 (v3) — 导入 乱糟糟的资料桌 / EXP-01 整理魔法棒（A 普通 vs B 约束 + 抓出多写的句子）/ EXP-01b 换个角度整理 / EXP-02 报告协作台（搭提纲 + AI 审提纲）/ EXP-02b 我的初稿 / EXP-03 修改决策记录器（逐条决定）/ EXP-03b 定稿 PK 台（我的定稿 vs 一键改写）/ TALK 分工判断台 */
(function(){
const {$,$$,esc,clamp}=App;const K='l9';const L={};App.lessons[K]=L;
Object.assign(App.HINTS=App.HINTS||{},{
 'l9-mf':{s:['我想改成：','先查一查，再写'],ref:'AI 建议写“萌萌的国宝——大熊猫的秘密生活”，我改成“大熊猫的一天：吃、睡、爬树”。意思还是我的，只借用了它“更生动”的想法。'},
 'l9-final':{s:['我们想知道','我们发现','总之，'],ref:'把一句长话拆成两句：\n“大熊猫每天要花十多个小时吃竹子。因为它的消化道比较短，所以必须吃很多竹子。”\n再读一遍：每句话都是你想说的吗？资料里找得到吗？'}});

/* ---------- text utilities (real computation) ---------- */
const nz=s=>String(s||'').replace(/[^一-龥A-Za-z0-9]/g,'');
const grams=(s,n)=>{const t=nz(s),o=new Set();for(let i=0;i+n<=t.length;i++)o.add(t.slice(i,i+n));return o;};
const cut=(s,n)=>{const a=[...String(s||'')];return a.length>n?a.slice(0,n).join('')+'…':a.join('');};
const lim=(s,n)=>[...String(s||'').trim()].slice(0,n).join('');
const splitS=t=>String(t||'').replace(/\r/g,'').split(/(?<=[。！？；!?;])|\n+/).map(s=>s.trim()).filter(s=>nz(s).length>=4);
const numsOf=s=>String(s||'').match(/\d+(?:\.\d+)?/g)||[];
function mkIdx(texts,nos){const all=texts.join('\n');return {g2:grams(all,2),g3:grams(all,3),nums:new Set(numsOf(all)),parts:texts.map(t=>({g2:grams(t,2),g3:grams(t,3)})),nos:nos||texts.map((_,i)=>i+1)};}
function cover(s,ix){const a=grams(s,2),b=grams(s,3);if(!a.size)return 1;let x=0,y=0;a.forEach(g=>{if(ix.g2.has(g))x++;});b.forEach(g=>{if(ix.g3.has(g))y++;});return b.size?(x/a.size+y/b.size)/2:x/a.size;}
/* support of one sentence in the sources: bigram+trigram coverage, plus every number must appear in the sources */
function chk(s,ix){const c=cover(s,ix);const nums=numsOf(s).filter(n=>!ix.nums.has(n));let best=-1,bv=0;ix.parts.forEach((p,i)=>{const v=cover(s,p);if(v>bv){bv=v;best=i;}});
 return {c,nums,best:best>=0?ix.nos[best]:-1,st:nums.length?'no':c>=0.7?'ok':c>=0.45?'part':'no'};}
const retained=(a,b)=>{const A=grams(a,2),B=grams(b,2);if(!A.size)return 0;let x=0;A.forEach(g=>{if(B.has(g))x++;});return x/A.size;};
const cnt=(t,w)=>{let i=-1,c=0;while((i=t.indexOf(w,i+1))>=0)c++;return c;};

/* ---------- built-in material pack (true facts, generic source types) ---------- */
const PACK=[
 {id:'p1',title:'大熊猫吃什么',srcType:'科普网站（示例）',tags:['食性'],text:'大熊猫属于食肉目动物，但它的食物中绝大部分是竹子。一只成年大熊猫每天要花十多个小时进食，吃下十几千克竹子。'},
 {id:'p2',title:'消化竹子不容易',srcType:'动物园科普展板（示例）',tags:['食性'],text:'大熊猫的消化道比较短，消化竹子的效率不高，所以它们需要吃很多竹子。大熊猫偶尔也会吃竹鼠等小动物或者腐肉。'},
 {id:'p3',title:'野生大熊猫住在哪里',srcType:'国家级科研机构官网（示例）',tags:['栖息地'],text:'野生大熊猫生活在我国四川、陕西和甘肃的山区，栖息在海拔一千多米到三千多米的山地竹林中。'},
 {id:'p4',title:'独来独往',srcType:'科普图书（示例）',tags:['行为'],text:'大熊猫除了繁殖期以外，通常独自生活。它们会在树干上留下气味标记，用这种方式和同类“交流”。'},
 {id:'p5',title:'吃了睡，睡了吃',srcType:'纪录片字幕摘录（示例）',tags:['行为'],text:'大家都知道，大熊猫的食物中绝大部分是竹子。大熊猫每天的时间主要用来吃竹子和休息，吃饱了就休息，休息一会儿又接着吃。另外，大熊猫还很会爬树。'},
 {id:'p6',title:'刚出生的大熊猫',srcType:'科普网站（示例）',tags:['繁殖'],text:'大熊猫刚出生时非常小，体重只有一百克左右，大约是妈妈体重的千分之一。大熊猫妈妈一般每胎产一到两只幼崽。'},
 {id:'p7',title:'大熊猫国家公园',srcType:'新闻报道（示例）',tags:['保护'],text:'据了解，我国建立了大熊猫国家公园，保护大熊猫和它们生活的竹林。经过多年保护，野生大熊猫的数量已经增长到近1900只。大熊猫仍然需要保护。'},
 {id:'p8',title:'受威胁等级的变化',srcType:'国际自然保护组织网页（示例）',tags:['保护'],text:'2016年，大熊猫的受威胁等级从“濒危”调整为“易危”。这说明保护工作有成效，但大熊猫仍然需要保护。'},
 {id:'p9',title:'爱吃竹子的“伪拇指”',srcType:'个人博客（示例）',tags:['食性'],text:'大熊猫最爱吃竹子，几乎一天到晚都在吃。它们吃竹子的时候会用“伪拇指”帮忙握住竹子。其实大熊猫的食物中绝大部分是竹子。'},
 {id:'p10',title:'竹林与食物',srcType:'科普图书（示例）',tags:['保护'],text:'其实竹林被破坏，或者竹子大面积开花枯死，会让大熊猫找不到足够的食物。我们知道，大熊猫的食物中绝大部分是竹子，所以竹林非常非常重要。'}];
const TOPICS=[
 {k:'food',n:'食性',q:'吃什么？怎样吃？',kw:['吃','食','竹','消化','进食','营养','腐肉']},
 {k:'home',n:'栖息地',q:'生活在哪里？',kw:['生活在','栖息','海拔','山区','山地','分布','四川','陕西','甘肃']},
 {k:'act',n:'行为',q:'每天怎样生活？',kw:['独自','爬树','休息','睡','活动','气味','交流','同类']},
 {k:'baby',n:'繁殖',q:'怎样繁殖后代？',kw:['出生','幼崽','繁殖','妈妈','每胎','宝宝']},
 {k:'save',n:'保护',q:'为什么要保护？怎样保护？',kw:['保护','数量','濒危','易危','国家公园','破坏','威胁','枯死']}];
const SYN=[[/饮食|吃|食物|食性|进食/,['吃','食','竹子','消化','进食']],[/活动|作息|规律|一天|时间/,['每天','休息','睡','爬树','活动','吃饱']],[/社交|交流|同伴|群|朋友/,['独自','交流','气味','同类','繁殖期']],
 [/住|栖息|环境|分布|家|生活地/,['生活在','栖息','海拔','山区','竹林','四川']],[/繁殖|宝宝|幼|成长|出生|后代/,['出生','幼崽','妈妈','每胎','繁殖']],[/保护|数量|威胁|未来|濒危/,['保护','数量','濒危','易危','国家公园','破坏']]];
const topicOf=(t,list)=>{let best=null,bv=0;list.forEach(tp=>{let v=0;tp.kw.forEach(k=>{v+=cnt(t,k)*k.length;});if(v>bv){bv=v;best=tp;}});return best;};
const aspKw=(h,minLen=1)=>{const o=new Set();SYN.forEach(([re,kw])=>{if(re.test(h))kw.forEach(k=>o.add(k));});const t=nz(h);for(let i=0;i+2<=t.length;i++)o.add(t.slice(i,i+2));return [...o].filter(k=>k.length>=minLen);};
const aspScore=(t,kws)=>kws.reduce((a,k)=>a+cnt(t,k)*k.length,0);
const clean=s=>s.replace(/^(据了解|据说|我们知道|大家都知道|其实|另外|此外|而且|同时)[，,、]?/,'').replace(/(非常){2,}/g,'非常').trim();

/* ---------- the offline organiser: split → clean → de-duplicate → group → order ---------- */
function sentencesOf(cards){const out=[];cards.forEach((c,ci)=>splitS(c.text).forEach(s=>out.push({t:clean(s),ci})));return out;}
function dedup(ss){const kept=[];let dup=0;ss.forEach(s=>{const g=grams(s.t,2);const hit=kept.findIndex(k=>{let x=0;g.forEach(q=>{if(k.g.has(q))x++;});return x/Math.max(1,Math.min(g.size,k.g.size))>=0.8;});
  if(hit<0){kept.push(Object.assign({g},s));return;}dup++;const k=kept[hit];let y=0;k.g.forEach(q=>{if(g.has(q))y++;});if(g.size>k.g.size&&y/k.g.size>=0.9){kept.splice(hit,1);kept.push(Object.assign({g},s));}});return {kept,dup};}
const isPanda=cards=>cards.some(c=>/大熊猫/.test(c.text||''));
function organise(cards,angle,o={}){
 const {kept,dup}=dedup(sentencesOf(cards));const panda=isPanda(cards);
 const useDict=kept.filter(s=>topicOf(s.t,TOPICS)).length>=kept.length*0.5;
 const grp=s=>{if(useDict){const tp=topicOf(s.t,TOPICS);if(tp)return {k:tp.k,n:tp.n,q:(panda?'大熊猫':'')+tp.q};}const c=cards[s.ci]||{};const tag=(c.tags&&c.tags[0])||c.title||'其他';return {k:'t:'+tag,n:tag,q:`关于“${tag}”，资料告诉了我们什么？`};};
 const secs=[];const add=(h,t,ci,k)=>{let s=secs.find(x=>x.h===h);if(!s)secs.push(s={h,k,items:[]});s.items.push({t,ci});};
 if(angle==='time'){const STG=[['每天',5],['一天',5],['刚出生',1],['出生',1],['幼崽',2],['妈妈',2],['成年',3]];const yr=[],life=[],day=[],rest=[];
  kept.forEach(s=>{const y=(s.t.match(/(1[5-9]\d\d|20\d\d)年/)||[])[1];if(y){yr.push([+y,s]);return;}const st=STG.find(([w])=>s.t.includes(w));if(st&&st[1]<5)life.push([st[1],s]);else if(st)day.push(s);else rest.push(s);});
  life.sort((a,b)=>a[0]-b[0]).forEach(([,s])=>add('一生的成长（从出生到成年）',s.t,s.ci,'a'));day.forEach(s=>add('一天里的生活',s.t,s.ci,'b'));
  yr.sort((a,b)=>a[0]-b[0]).forEach(([,s])=>add('按年份排列的变化',s.t,s.ci,'c'));rest.forEach(s=>add('没有明确时间的资料',s.t,s.ci,'d'));}
 else if(angle==='aspects'){const asp=String(o.aspects||'').split(/[，,、；;\s]+/).map(x=>x.trim()).filter(Boolean).slice(0,5);const A=asp.map(h=>({h,kw:aspKw(h)}));
  A.forEach(a=>secs.push({h:a.h,k:a.h,items:[]}));
  kept.forEach(s=>{let best=null,bv=0;A.forEach(a=>{const v=aspScore(s.t,a.kw);if(v>bv){bv=v;best=a;}});if(best)add(best.h,s.t,s.ci,best.h);else add('其他（不属于这几个方面）',s.t,s.ci,'zz');});}
 else{kept.forEach(s=>{const g=grp(s);add(angle==='question'?g.q:g.n,s.t,s.ci,g.k);});
  if(useDict){const ix=k=>{const i=TOPICS.findIndex(t=>t.k===k);return i<0?99:i;};secs.sort((a,b)=>ix(a.k)-ix(b.k));}}
 const out=secs.filter(s=>s.items.length);
 if(panda&&angle!=='table')out.forEach(sec=>sec.items.forEach((it,j)=>{if(j>0)it.t=it.t.replace(/^(大熊猫|它们)(?![的妈])/,'');}));
 if(!o.strict){/* the unconstrained preset adds plausible facts that are NOT in the sources — so the check has something to find */
  const X=panda?['大熊猫被称为“活化石”，在地球上已经生存了至少800万年。','大熊猫一般能活到20岁左右，人工饲养的大熊猫寿命更长。','总之，大熊猫是一种十分珍贵的动物，我们每个人都应该积极行动起来保护它们。']
   :['这方面的知识受到越来越多人的关注。','专家认为，未来还需要开展更多研究。','总之，这个问题值得我们每个人认真思考。'];
  if(out[0])out[0].items.splice(1,0,{t:X[0],ci:-1});const last=out[out.length-1];if(last){last.items.push({t:X[1],ci:-1});}
  if(angle!=='table')out.push({h:'小结',k:'zx',items:[{t:X[2],ci:-1}]});}
 return {angle,strict:!!o.strict,secs:out,table:angle==='table',dup,mode:null};}
const outLen=R=>nz(R.secs.map(s=>s.items.map(i=>i.t).join('')).join('')).length;
const resText=R=>R.secs.map(s=>(s.h?`【${s.h}】\n`:'')+s.items.map(i=>'- '+i.t).join('\n')).join('\n');
/* parse a live-AI answer into sections */
function parseAI(text){const secs=[];let cur=null,th=false;const push=h=>{cur={h,items:[]};secs.push(cur);};
 String(text||'').split('\n').forEach(line=>{let l=line.trim();if(!l)return;
  if(/^\|/.test(l)){const cells=l.replace(/^\||\|$/g,'').split('|').map(x=>x.replace(/\*\*/g,'').trim());if(cells.every(c=>/^[-:\s]*$/.test(c)))return;if(!th){th=true;if(/方面|主题|要点|类别/.test(cells.join('')))return;}
   push(cells[0]);splitS(cells.slice(1).filter(c=>!/^[\d、,，\s资料]+$/.test(c)).join('；')).forEach(t=>cur.items.push({t,ci:-2}));return;}
  const m=/^【(.+?)】\s*(.*)$/.exec(l)||/^#{1,4}\s*(.+)$/.exec(l)||/^\*\*(.+?)\*\*[：:]?$/.exec(l)||/^([^。，！？]{2,18})[：:]$/.exec(l);
  if(m){push(m[1].replace(/\*\*/g,'').trim());if(m[2])splitS(m[2]).forEach(t=>cur.items.push({t,ci:-2}));return;}
  l=l.replace(/^([-*•·]|\d+[.、)）])\s*/,'').replace(/\*\*/g,'');if(!cur)push('');splitS(l).forEach(t=>cur.items.push({t,ci:-2}));});
 return secs.filter(s=>s.items.length);}

/* ---------- report: sample outline / sample draft (written by a classmate, not by AI) ---------- */
const EX_OL={title:'大熊猫的生活习性',q:'大熊猫吃什么、住在哪里、每天怎样生活？',open:'为什么想研究大熊猫；提出研究问题',secs:[{h:'饮食习惯',p:'主要吃竹子；进食时间长；用“伪拇指”握竹子'},{h:'活动规律',p:'吃饱就休息，休息后又接着吃；会爬树'},{h:'社交行为',p:'通常独自生活；用气味标记交流'}],end:'研究结论；我的感想'};
const SAMPLE=`大熊猫的生活习性
一、研究的问题
大熊猫是我国特有的珍稀动物。我们想知道：大熊猫吃什么、住在哪里、每天怎样生活？
二、饮食习惯
大熊猫虽然属于食肉目动物，但是它的食物中绝大部分是竹子，它每天要花十多个小时吃竹子，因为它的消化道比较短，消化竹子的效率不高，所以它必须吃很多很多竹子才能获得足够的营养，吃竹子的时候它还会用“伪拇指”握住竹子。
三、生活的地方
野生大熊猫生活在四川、陕西和甘肃的山区里。那里有很多竹林，竹林里非常安静，非常凉爽，非常适合大熊猫生活。
四、活动规律
大熊猫吃饱了就休息，休息一会儿又接着吃。大熊猫每天要睡20个小时。它们还很会爬树。
我觉得大熊猫是世界上最可爱的动物，我们都应该保护它们。`;
const METHODS=['查阅书籍和资料','用 AI 搜索并核实来源','观看纪录片','参观、实地观察','采访或问卷调查'];
const DEC={acc:['采纳','✓','var(--mint-d)'],mod:['修改后采纳','✎','var(--sun-d)'],rej:['不采纳','✗','var(--coral-d)']};

/* offline outline reviewer */
function reviewOutline(rep,cards){const ol=rep.ol||{},out=[];const secs=(ol.secs||[]).filter(s=>(s.h||'').trim());const allSrc=sentencesOf(cards);
 if(!(rep.title||'').trim())out.push({c:'结构',p:'还没有写报告题目。题目要让人一眼看出研究什么。'});
 if(!(rep.q||'').trim())out.push({c:'结构',p:'还没有写研究问题。先想清楚“我要回答什么问题”，提纲才有方向。'});
 if(secs.length<2)out.push({c:'结构',p:`中间部分只有 ${secs.length} 个小标题，建议从 2～4 个方面展开。`});
 if(!/方法|查阅|资料|调查|采访|观察|搜索/.test((ol.open||'')+secs.map(s=>s.p).join(''))&&!(rep.methods||[]).length)out.push({c:'结构',p:'开头没有写研究方法。读者想知道资料是怎么来的。',a:'open',f:'研究方法：查阅资料，用 AI 整理并核对'});
 else if(!/方法|查阅|资料|调查|采访|观察|搜索/.test(ol.open||''))out.push({c:'结构',p:'你选了研究方法，但提纲的开头没有写进去。',a:'open',f:'研究方法：'+((rep.methods||[]).join('、')||'查阅资料')});
 if(!/结论|总结|发现|结果/.test(ol.end||''))out.push({c:'结构',p:'结尾要先写研究结论（回答研究问题），再写感想。',a:'end',f:'研究结论'});
 secs.forEach(s=>{if(!(s.p||'').trim())out.push({c:'补充',p:`「${s.h}」下面还没有写要点。`});
  const kw=aspKw(s.h,2);const n=allSrc.filter(x=>aspScore(x.t,kw)>0).length;if(!n)out.push({c:'补充',p:`你的资料卡里几乎找不到关于「${s.h}」的内容：要么补充资料，要么换一个方面。（程序在 ${allSrc.length} 句资料里逐句查找关键词，命中 0 句）`});});
 for(let i=0;i<secs.length;i++)for(let j=i+1;j<secs.length;j++){const a=grams(secs[i].h,2),b=grams(secs[j].h,2);let x=0;a.forEach(g=>{if(b.has(g))x++;});if(x&&x/Math.min(a.size,b.size)>=0.5)out.push({c:'逻辑',p:`「${secs[i].h}」和「${secs[j].h}」意思很接近，内容可能重复，可以合并或换一个角度。`});}
 if(secs.length>=2){const l=secs[secs.length-1];out.push({c:'逻辑',p:`建议把「${l.h}」调到中间部分的第一节，先写最重要的内容。`,a:'move',opt:1,note:'先写什么、后写什么，要服务于你的研究问题。这条建议不一定对，由你根据自己的思路决定。'});}
 return out.slice(0,7);}
function olText(rep){const ol=rep.ol||{};return `题目：${rep.title||'（未填）'}\n研究问题：${rep.q||'（未填）'}\n开头：${ol.open||'（未填）'}\n${(ol.secs||[]).filter(s=>(s.h||'').trim()).map((s,i)=>`中间 ${i+1}：${s.h}——${s.p||'（未写要点）'}`).join('\n')}\n结尾：${ol.end||'（未填）'}`;}

/* offline draft reviewer: genuinely checks the draft, then adds 2–3 suggestions that need judgment */
const REP=['非常','很多','然后','特别','真的','还有','一些','可以','而且','就是'];
const ALT={'非常':['十分','格外'],'很多':['大量','许多'],'然后':['接着','随后'],'特别':['尤其','格外'],'真的':['确实','的确'],'还有':['另外','此外'],'一些':['部分','少量'],'可以':['能够','能'],'而且':['并且','同时'],'就是':['正是','便是']};
function splitLong(s){const parts=s.split('，');if(parts.length<2)return s;let out='',cur='';parts.forEach((p,i)=>{cur+=(cur?'，':'')+p;if(i<parts.length-1&&nz(cur).length>=16){out+=cur.replace(/[。]$/,'')+'。';cur='';}});out+=cur;return out.replace(/。(所以|因为)/g,'。').replace(/。。/g,'。');}
function reviewDraft(draft,rep,cards){const out=[];const ix=mkIdx(cards.map(c=>c.text));const sents=splitS(draft);const panda=isPanda(cards)||/大熊猫/.test(draft);
 const lines=draft.split('\n').map(x=>x.trim()).filter(Boolean);
 if(!/查阅|资料|调查|采访|观察|方法|搜索/.test(draft))out.push({cat:'逻辑',p:'初稿没有交代资料从哪里来、用了什么研究方法，读者无法判断内容是否可靠。',q:'',f:`我们通过${((rep.methods||[]).join('、'))||'查阅资料'}的方法，收集并整理了相关资料。`,at:'start'});
 if(!/？|\?|想知道|研究问题|研究的问题|为什么|怎样|如何/.test(draft.slice(0,160)))out.push({cat:'结构',p:'开头没有说清楚研究问题，读者需要先知道你想研究什么。',q:'',f:`我们想研究的问题是：${rep.q||'……'}`,at:'start'});
 const ol=rep.ol||{};(ol.secs||[]).filter(s=>(s.h||'').trim()).forEach(s=>{const kw=aspKw(s.h,2);if(draft.includes(s.h.trim())||kw.some(k=>draft.includes(k)))return;
  const mats=sentencesOf(cards).map(x=>[aspScore(x.t,aspKw(s.h)),x.t]).filter(x=>x[0]>0).sort((a,b)=>b[0]-a[0]).slice(0,2).map(x=>x[1]);
  out.push({cat:'结构',p:`提纲里的「${s.h}」部分，初稿里还没有写到。${mats.length?'下面是从你的资料卡里找到的相关句子：':''}`,q:'',f:`${s.h}\n${mats.join('')||'（请根据资料补写这一部分）'}`,at:'beforeLast'});});
 sents.filter(s=>nz(s).length>=55).sort((a,b)=>b.length-a.length).slice(0,1).forEach(s=>out.push({cat:'语言',p:`这句话有 ${nz(s).length} 个字，一口气读不完，建议拆成几句。`,q:s,f:splitLong(s)}));
 const rw=REP.map(w=>[w,cnt(draft,w)]).filter(x=>x[1]>=3).sort((a,b)=>b[1]-a[1])[0];
 if(rw){const w=rw[0];const s=sents.slice().sort((a,b)=>cnt(b,w)-cnt(a,w))[0];if(s&&cnt(s,w)>=2){let k=0,j=0;const f=s.replace(new RegExp(w,'g'),m=>k++===0?m:ALT[w][(j++)%ALT[w].length]);out.push({cat:'语言',p:`“${w}”一共出现了 ${rw[1]} 次，读起来有点重复，可以换几个词。`,q:s,f});}}
 sents.forEach(s=>{const n=numsOf(s).filter(x=>!ix.nums.has(x));if(!n.length)return;out.push({cat:'补充',p:`这句话里的数字「${n.join('、')}」在你的资料里找不到。数据要有出处：请核实后注明来源，或者删去。${/睡/.test(s)&&/大熊猫/.test(draft)&&n.some(x=>+x>=14&&+x<=24)?'而且它和资料里“每天要花十多个小时进食”对不上。':''}`,q:s,f:''});});
 if(!/总之|综上|结论|总的来说|研究发现|我们发现|由此可见|通过研究/.test(draft))out.push({cat:'结构',p:'初稿还没有“研究结论”。结尾要先回答开头的研究问题，再写感想。',q:'',f:panda?'总之，大熊猫的食物中绝大部分是竹子，它们生活在山区的竹林中，每天的时间主要用来吃竹子和休息，通常独自生活。':`总之，通过整理资料，我们对“${rep.title||'这个问题'}”有了更清楚的认识。`,at:'end',note:'结论是报告的核心观点。这里给出的句子只是参考，最好用你自己的话概括你的发现。'});
 const rules=out.slice(0,6);const traps=[];
 if(lines[0]&&nz(lines[0]).length<=20)traps.push({cat:'语言',p:'标题有点普通，建议换成更吸引人的标题。',q:lines[0],f:panda?'萌萌的国宝——大熊猫的秘密生活':`神奇的${lines[0]}`,k:'opt',note:'标题可以生动，但研究报告的标题首先要让人一眼看出研究什么。改不改，由你决定。'});
 const op=sents.find(s=>/我觉得|我认为|我们认为|我喜欢/.test(s));
 if(op)traps.push({cat:'逻辑',p:'结尾的个人感受不够客观，建议改成更有力的说法。',q:op,f:panda?'大熊猫是世界上最珍贵的动物，所有人都必须保护它们。':'这是世界上最重要的问题，所有人都必须关注。',k:'trap',note:'这条建议把你自己的感受换成了“世界上最……”“所有人都必须……”这样的绝对化说法，资料里找不到依据，也不再是你的想法。感想可以保留，只要和研究结论分开写。'});
 else traps.push({cat:'补充',p:'建议补充一个调查数据，让报告更有说服力。',q:'',f:'调查显示，95%的同学都非常喜欢这个研究主题。',at:'end',k:'trap',note:'这个“调查”根本没有做过，数据是编出来的。研究报告里的每个数据都必须有真实来源。'});
 if(panda)traps.push({cat:'补充',p:'建议补充大熊猫的感官特点，让内容更丰富。',q:'',f:'大熊猫的嗅觉十分灵敏。',at:'beforeLast',k:'trap',note:'这句话也许是对的，但你的资料卡里找不到。采纳前要先查证，并注明出处；不能因为“AI 说的”就直接写进报告。'});
 const all=rules.map(s=>Object.assign({k:'rule'},s));if(traps[0])all.splice(Math.min(2,all.length),0,traps[0]);if(traps[1])all.splice(Math.min(5,all.length),0,traps[1]);if(traps[2])all.push(traps[2]);
 return all.slice(0,8);}
/* apply decisions */
function applyAll(draft,sugs,all){let t=String(draft||'');
 (sugs||[]).forEach(s=>{const d=all?'acc':s.d;if(d!=='acc'&&d!=='mod')return;const fix=d==='mod'?(s.mf!=null&&s.mf!==''?s.mf:s.f):s.f;
  if(s.q&&t.includes(s.q)){t=t.replace(s.q,fix||'');return;}
  if(!fix)return;const ls=t.split('\n');
  if(s.at==='start'){ls.splice(Math.min(1,ls.length),0,fix);t=ls.join('\n');}
  else if(s.at==='beforeLast'&&ls.length>2){const li=ls.length-1;const last=ls[li];if(/我觉得|我认为|总之|感想|希望/.test(last)){ls.splice(li,0,fix);t=ls.join('\n');}else t=t.replace(/\s*$/,'')+'\n'+fix;}
  else t=t.replace(/\s*$/,'')+'\n'+fix;});
 return t.replace(/\n{3,}/g,'\n\n');}
function attGroup(rep){const ds=(rep.sugs||[]).filter(s=>s.d);if(!ds.length)return null;const n=ds.length,acc=ds.filter(s=>s.d==='acc').length,mod=ds.filter(s=>s.d==='mod').length;
 const ep=rep.edp||0;if(acc===n&&ep<0.1)return 'all';if(mod>=Math.max(1,acc)||(ep>=0.1&&acc<n))return 'manual';return 'sel';}
const ATT=[['all','全盘接受','接受 AI 提出的所有修改建议，并用 AI 生成的内容替换。'],['sel','有选择地接受','独立思考，有选择地接受合理的修改建议，并用 AI 生成的内容替换。'],['manual','手动为主','独立思考，结合 AI 的修改建议、参考 AI 生成的内容，手动编辑、完善报告。']];

/* ---------- discussion: which steps can rely on AI? (097 / 103 / 104) ---------- */
const SORT=[
 ['s1','确定研究方向和研究问题',['me'],'研究什么、想回答什么问题，来自你的好奇和思考。'],
 ['s2','从大量资料中快速提取关键信息、合并重复内容',['ai','co'],'这是 AI 的长处：又快又能处理大量文字。但结果要人核对。'],
 ['s3','决定按哪些方面整理资料',['me','co'],'教材：按照什么方式整理资料，需要我们自己来判断。'],
 ['s4','核对整理结果里有没有资料中没有的内容',['me','co'],'AI 可能自行补充信息，最后要靠人逐句核对。'],
 ['s5','撰写报告初稿',['me'],'教材要求初稿在不借助 AI 的情况下，由小组分工合作完成。'],
 ['s6','检查报告与提纲的结构是否匹配',['ai','co'],'AI 可以帮忙对照检查，人来判断它说得对不对。'],
 ['s7','找出过长的句子、重复的词语',['ai','co'],'这类语言问题 AI 和程序都能很快找到。'],
 ['s8','决定采纳哪条修改建议',['me'],'AI 的建议不一定都有参考价值，采纳与否由人决定。'],
 ['s9','确定报告的核心观点和最终表述',['me'],'文字作品的核心在于独特的观点和视角，必须由作者主导。'],
 ['s10','润色语句、梳理框架',['ai','co'],'教材：可以借助 AI 梳理框架、润色文字，但要自己审阅。']];
const BINS=[['ai','主要依靠 AI'],['co','AI 帮忙 · 人把关'],['me','必须亲自完成']];
const sortRes=so=>{const a=(so||{}).a||{};let ok=0,me=0,meOk=0;SORT.forEach(([id,,acc])=>{if(acc.includes(a[id]))ok++;if(acc[0]==='me'&&acc.length===1){me++;if(a[id]==='me')meOk++;}});return {ok,n:SORT.length,me,meOk};};

/* ---------- quiz ---------- */
const QUIZ=[
 {id:'q1',q:'没有特别要求时，AI 整理资料的结果里为什么可能出现资料里没有的内容？',opts:['AI 会按语言规律“补全”内容，可能把自己学过的信息也加进去','资料卡上的文字会自己变化','AI 已经联网把每句话都核实过了'],a:0,why:'AI 按文字内容和语言规律来提炼、生成，可能自行补充额外信息。这是现阶段 AI 可能出现的情况，所以整理结果要逐句核对。'},
 {id:'q2',q:'想让 AI 只整理你提供的资料，下面哪句提示词最合适？',opts:['帮我整理一下这些资料','只根据我提供的资料进行提炼、总结，不要自行搜集并添加其他内容','内容越多越好，能补充的都补充上'],a:1,why:'教材小贴士：用“只根据我提供的资料……不要自行添加其他内容”来限制 AI。即使加了约束，也要自己核查一遍。'},
 {id:'q3',q:'开展研究工作的一般思路，正确的顺序是：',opts:['先写结论，再找资料证明它','明确研究问题 → 确定研究方法 → 整理分析资料 → 得出研究结论','先让 AI 写好报告，再想研究问题'],a:1,why:'一篇完整的研究报告也围绕这几个方面组织内容：问题、方法、资料分析、结论。'},
 {id:'q4',q:'AI 对你的报告初稿提出了 8 条修改建议，比较合理的做法是：',opts:['全部采纳，用 AI 生成的内容替换','一条都不看','独立思考，判断每条建议是否合理，有选择地采纳，并自己动手修改'],a:2,why:'AI 不了解你的思考过程和写作意图，它的建议可能偏离你想表达的重点，不一定都有参考价值。'},
 {id:'q5',q:'下面哪项工作最应该由人来主导？',opts:['合并 10 张资料卡里重复的句子','确定报告的核心观点和最终表述','找出超过 50 个字的长句'],a:1,why:'文字作品的核心在于独特的观点、视角和生动的表述，这些源于作者的独立思考。'}];

/* ---------- CSS (v3 light theme: variables only) ---------- */
const CSS9=`
.l9-col{display:flex;flex-direction:column;gap:14px;min-width:0}
.l9-desk{position:relative;height:320px;border-radius:16px;background:var(--panel2);border:2.5px dashed var(--line2);overflow:hidden}
.l9-pc{position:absolute;left:0;top:0;width:132px;height:54px;padding:6px 9px;border-radius:10px;background:#fff;border:1.5px solid var(--line2);color:var(--ink);font-size:13px;line-height:1.35;box-shadow:0 4px 16px #5a3fd012;transition:transform .8s cubic-bezier(.2,.8,.2,1);overflow:hidden}
.l9-pc b{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:700}
.l9-pc span{display:block;font-size:12.5px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.l9-pc.x{background:var(--coral-soft)}
.l9-colh{position:absolute;font-size:14px;color:var(--sun-d);font-weight:700;opacity:0;transition:opacity .4s;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.l9-desk.org .l9-colh{opacity:1;transition-delay:.6s}
.l9-desk{height:440px;touch-action:pan-y;user-select:none;border:1.5px dashed var(--line2);background:var(--panel2)}
.l9-pc{height:64px;border-width:2.5px;cursor:grab;touch-action:none;transition:box-shadow .15s,border-color .15s;padding:8px 10px}
.l9-pc.drag{cursor:grabbing;box-shadow:0 14px 30px #5a3fd040;transition:none}
.l9-pc.sel{outline:3px solid #6c47ff55}
.l9-pc span{white-space:nowrap}
.l9-pl{position:absolute;z-index:999;font-size:12px;font-weight:800;color:#fff;border-radius:999px;padding:1px 9px;pointer-events:none;white-space:nowrap}
.l9-dread{padding:10px 14px;border-radius:14px;background:var(--paper);border:1px solid #efe6c4;font-size:15px;line-height:1.6;color:var(--muted);min-height:46px}
.l9-dread b{color:var(--ink)}
.l9-pr{margin-top:10px;padding:10px 14px;border-radius:14px;background:#fff;border-left:6px solid var(--sky)}
.l9-pr>b{display:flex;align-items:center;gap:8px;font-size:16px}
.l9-pr>b i{width:12px;height:12px;border-radius:50%;flex:none}
.l9-pt{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}
.l9-pt span{font-size:13.5px;padding:1px 10px;border-radius:999px;background:var(--panel2);color:var(--muted)}
.l9-pn{margin-top:6px;font-size:14.5px;color:var(--muted)}
.l9-po{margin-top:6px;font-size:14.5px;color:var(--grape-d);font-weight:600}
.l9-sum{margin-top:12px;padding:12px 14px;border-radius:14px;background:#ffffffb0}
.l9-sum>b,.l9-aic b{color:var(--grape-d)}
.l9-sum p{font-size:16px;line-height:1.65;margin-top:4px}
.l9-gl{font-weight:700}
.l9-cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.l9-cardb{display:flex;gap:8px;align-items:center;text-align:left;padding:7px 10px;border-radius:12px;border:2px solid var(--line2);background:#fff;color:var(--ink);font-size:14.5px;font-weight:500;cursor:pointer;min-width:0;font-family:inherit}
.l9-cardb i{font-style:normal;flex:none;width:24px;height:24px;border-radius:50%;background:var(--sky-soft);color:var(--sky);display:grid;place-items:center;font-weight:700;font-size:13px}
.l9-cardb span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.l9-cardb:hover{border-color:var(--ink)}
.l9-cardb.on{border-color:var(--ink);background:var(--sun-soft);box-shadow:0 6px 16px #6c47ff33}
.l9-cardb.x{border-style:dashed}
.l9-read{padding:12px 14px;border-radius:14px;background:var(--paper);border:2px solid #e6d9a8;font-size:15px;line-height:1.7;min-height:88px;color:var(--ink)}
.l9-read small{display:block;color:var(--muted);font-size:13px}
.l9-prs{flex-basis:100%;font-size:13.5px;color:var(--muted);line-height:1.5}
.l9-prs b{color:var(--sun-d)}
.l9-res{font-size:15px;line-height:1.75;max-height:330px;overflow:auto;padding:10px 12px;margin-top:8px;border-radius:12px;background:#fff;border:2px solid #7d5cf033;overflow-wrap:anywhere}
.l9-res h5{margin:8px 0 2px;font-size:14.5px;color:var(--grape-d);font-weight:700}
.l9-res h5:first-child{margin-top:0}
.l9-res ul{margin:0;padding-left:18px}
.l9-res pre{white-space:pre-wrap;font-family:inherit;margin:0}
.l9-u{border-radius:4px;padding:0 1px}
.l9-u.spot{cursor:pointer;border-bottom:2px dashed var(--line2)}
.l9-u.spot:hover{background:var(--sun-soft)}
.l9-u.spot.sel{background:var(--sun);border-bottom:1.5px solid var(--line2)}
.l9-u.no{background:var(--coral-soft);border-bottom:2px solid var(--coral)}
.l9-u.part{border-bottom:2px dotted var(--amber)}
.l9-nf.ok{background:var(--mint-d)}
.l9-nf{font-style:normal;font-size:12.5px;margin-left:5px;padding:0 8px;border-radius:999px;background:var(--coral-d);color:#fff;font-weight:700;white-space:nowrap}
.l9-tbl{width:100%;border-collapse:collapse;font-size:14px}
.l9-tbl th,.l9-tbl td{padding:5px 7px;border-bottom:2px solid var(--line);text-align:left;vertical-align:top}
.l9-tbl th{color:var(--muted);font-weight:700;font-size:13px}
.l9-tbl td:first-child,.l9-tbl th:first-child,.l9-tbl td:last-child,.l9-tbl th:last-child{white-space:nowrap}.l9-tbl td:first-child{color:var(--grape-d);font-weight:700}.l9-tbl td.pt{min-width:160px}
.l9-data{font-size:14px;color:var(--muted);margin:0}
.l9-data b{color:var(--ink)}
.l9-bd{border:2px dashed var(--line2);border-radius:999px;padding:1px 11px;font-size:13.5px;color:var(--muted);background:#fff}
.l9-bd.on{border:1.5px solid var(--line2);background:var(--mint-d);color:#fff;font-weight:700}
.l9-kv{display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:8px;margin-top:8px}
.l9-kv div{padding:8px 10px;border-radius:12px;background:#fff;border:2px solid #7d5cf033}
.l9-kv b{display:block;font-family:var(--f-display);font-weight:800;font-size:22px;line-height:1.2;font-weight:400;color:var(--ink)}
.l9-kv b.bad{color:var(--coral-d)}.l9-kv b.good{color:var(--mint-d)}
.l9-kv span{font-size:12.5px;color:var(--muted)}
.l9-ol{align-self:start;display:flex;flex-direction:column;gap:8px;padding:16px 18px;border-radius:14px;background:var(--paper);border:2px solid #e6d9a8;font-size:15px;line-height:1.6;color:var(--ink)}
.l9-ol>b{font-family:var(--f-display);font-weight:800;font-size:21px}
.l9-ol>div{display:grid;grid-template-columns:60px minmax(0,1fr);gap:8px;align-items:start}
.l9-ol i{font-style:normal;font-size:12.5px;font-weight:700;color:var(--coral-d);background:var(--coral-soft);border-radius:999px;text-align:center;padding:1px 0;margin-top:2px}
.l9-ol em{font-style:normal;color:var(--coral-d);font-weight:700}
.l9-cat{display:inline-block;font-size:13px;padding:0 10px;border-radius:999px;font-weight:700;white-space:nowrap;line-height:1.7;background:var(--sky-soft);color:var(--sky)}
.l9-cat.c1{background:#fff;color:var(--grape-d)}.l9-cat.c2{background:var(--sun-soft);color:var(--sun-d)}.l9-cat.c3{background:var(--mint-soft);color:var(--mint-d)}
.l9-sgh{display:flex;flex-wrap:wrap;gap:8px;align-items:center;font-size:13.5px;color:var(--muted);font-weight:700}
.l9-sgp{font-size:17.5px;font-weight:700;line-height:1.5;margin-top:4px}
.l9-diff{font-size:15px;line-height:1.7;display:grid;grid-template-columns:44px minmax(0,1fr);gap:4px 8px;margin-top:8px;padding:10px 12px;border-radius:12px;background:#fff;border:2px solid #7d5cf033}
.l9-diff>span:nth-child(odd){font-size:13px;color:var(--muted);padding-top:2px;font-weight:700}
.l9-diff del{color:var(--coral-d);text-decoration:line-through}
.l9-diff ins{text-decoration:none;color:var(--ink);background:var(--mint-soft);border-radius:4px;padding:0 3px;white-space:pre-line}
.l9-new{background:var(--sun);color:var(--ink);border-radius:3px;padding:0 1px}
.l9-flag{font-size:13.5px;color:var(--muted);margin:6px 0 0}
.l9-rv{font-size:14.5px;padding:8px 12px;border-radius:12px;border:2px dashed var(--amber);color:var(--ink);background:var(--sun-soft);line-height:1.6}
.l9-paper{font-size:15px;line-height:1.85;white-space:pre-wrap;padding:14px 16px;border-radius:14px;background:var(--paper);border:2px solid #e6d9a8;color:var(--ink);max-height:420px;overflow:auto;overflow-wrap:anywhere}
.ai-body .l9-paper{background:#fff;border-color:#7d5cf033;max-height:300px;margin-top:8px;font-size:14.5px}
.l9-hl{background:var(--sun);color:var(--ink);border-radius:3px;padding:1px 0}
.l9-bad{background:var(--coral-soft);border-bottom:2px solid var(--coral);color:var(--ink)}
.note-pad textarea.l9-draft{min-height:230px}
.note-pad textarea.l9-final{min-height:300px}
.l9-stmt{font-size:14px;padding:10px 12px;border-radius:12px;background:var(--grape-soft);border:2px solid #7d5cf055;color:var(--ink);line-height:1.7}
.l9-log{display:flex;flex-direction:column;gap:4px;font-size:14px}
.l9-log>div{display:grid;grid-template-columns:26px 92px minmax(0,1fr);gap:6px;padding:5px 0;border-bottom:2px solid var(--line)}
.l9-log .ic{font-weight:900;text-align:center}
.l9-job{display:flex;flex-direction:column;gap:6px;align-items:center;text-align:center;padding:26px 20px;border-radius:18px;border:1.5px solid var(--line2);background:var(--sun-soft);box-shadow:var(--pop);font-family:var(--f-display);font-weight:800;font-size:clamp(20px,2.6vw,26px);line-height:1.4;color:var(--ink)}
.l9-job small{font-family:var(--f-body);font-size:13.5px;font-weight:700;color:var(--sun-d)}
.l9-bins{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
.l9-bins .chip{text-align:center;font-weight:700}
.l9-miss{margin:0;padding-left:20px;font-size:14.5px;line-height:1.7;color:var(--ink)}
.l9-ex{display:flex;flex-direction:column;gap:12px;font-size:14px}
.l9-ex .l9-paper{font-size:14px;max-height:220px}
@media (min-width:1024px){.l9-stick{position:sticky;top:70px;align-self:start}}
.l9-ol.flash{animation:l9fl 1.6s ease}
@keyframes l9fl{0%,60%{box-shadow:0 0 0 5px var(--sun);background:var(--sun-soft)}100%{box-shadow:0 0 0 0 transparent}}
.l9-ol i.ok{background:var(--mint-soft);color:var(--mint-d)}
.l9-tbl3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
.l9-tbl3>div{display:flex;flex-direction:column;gap:6px;padding:12px;border-radius:16px;background:var(--panel2);border:1.5px solid var(--line2)}
.l9-tbl3>div>b{font-family:var(--f-display);font-size:17px;color:var(--grape-d)}
.l9-tbl3 span{font-size:14.5px;line-height:1.45;padding:6px 10px;border-radius:10px;background:#fff;border:1.5px solid var(--line2);color:var(--ink)}
.l9-tbl3 span.df{border:2px dashed var(--coral)}
.l9-tbl3 span.none{border:0;background:none;color:var(--muted)}
.l9-vs{font-family:var(--f-display);font-weight:800;font-size:15px;color:var(--grape-d)}
@media (max-width:560px){.l9-tbl3{grid-template-columns:1fr}.l9-cards{grid-template-columns:1fr 1fr}.l9-bins{grid-template-columns:1fr}.l9-diff{grid-template-columns:1fr}.l9-desk{height:340px}}`;

/* ---------- module state ---------- */
const newS=()=>({res:{plain:null,strict:null},shown:null,checked:false,spot:new Set(),pr:'plain',ang:'topic',guess:null,w:null,oRev:null,oi:0,oStars:1,one:null,si:0,ji:null,view3:'dec',sum:false,won:false});
let S=newS();
const ctls=new Set();let deskT=0;
function stopAll(){ctls.forEach(c=>{try{c.abort();}catch(e){}});ctls.clear();clearTimeout(deskT);}
async function ask(prompt,o={}){const ctl=new AbortController();ctls.add(ctl);
 try{return await App.AI.chat(prompt,Object.assign({signal:ctl.signal},o));}
 catch(e){if(App.AI.fail)App.AI.fail(e);if(e&&(e.code==='cancelled'||e.name==='AbortError'))return {cancel:1};return {err:App.AI.errText(e)};}
 finally{ctls.delete(ctl);}}
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const SAFE='内容要适合小学高年级学生阅读，用简体中文。';
const hash=s=>{let h=7;for(const c of String(s||''))h=(h*31+c.charCodeAt(0))|0;return h;};

/* material: the student's trusted cards from lesson 8, or the built-in pack */
function favCards(){const f=((App.rec&&App.rec.lessons&&App.rec.lessons.l8)||{}).fav;return Array.isArray(f)?f.filter(c=>c&&typeof c.text==='string'&&c.text.trim()).map((c,i)=>({id:String(c.id||('f'+i)),title:String(c.title||('收藏资料'+(i+1))),text:lim(c.text,400),srcType:c.srcType?String(c.srcType):'',tags:Array.isArray(c.tags)?c.tags.map(String):[],trust:c.trust==='doubt'?'doubt':'ok'})):[];}
function srcKind(){const lr=App.lesson(K);const f=favCards();if(lr.src==='l8'&&f.length)return 'l8';if(lr.src==='pack')return 'pack';return f.filter(c=>c.trust!=='doubt').length>=4?'l8':'pack';}
const cards=()=>srcKind()==='l8'?favCards():PACK;
function selCards(){const lr=App.lesson(K);const cs=cards();const sel=((lr.org||{}).sel)||null;const s=sel?cs.filter(c=>sel.includes(c.id)):cs.filter(c=>c.trust!=='doubt');return s.length>=2?s:cs;}
const idxOf=cs=>{const all=cards();return mkIdx(cs.map(c=>c.text),cs.map(c=>all.indexOf(c)+1));};

/* render a result with per-sentence support highlighting */
function resHTML(R,ix,o={}){let n=0;const st={n:0,no:0,part:0,units:[]};
 const U=t=>{const id=n++;let cls='l9-u',flag='',tt='';st.units.push(t);
  if(o.check){const c=chk(t,ix);st.n++;cls+=' '+c.st;if(c.st==='no'){st.no++;flag=`<em class="l9-nf">资料里找不到${c.nums.length?'（数字 '+esc(c.nums.join('、'))+'）':''}</em>`;}else if(c.st==='part')st.part++;tt=`与资料的重合度 ${Math.round(c.c*100)}%`+(c.best>0?`，最接近：资料${c.best}`:'');}
  if(o.spot)cls+=' spot'+(o.spot.has(id)?' sel':'');
  if(o.mine&&o.mine.has(id)&&o.check&&!/ no$/.test(cls))flag='<em class="l9-nf ok">资料里有</em>';else if(o.mine&&o.mine.has(id)&&flag)flag=flag.replace('资料里找不到','你抓住了 · 资料里找不到');
  return `<span class="${cls}" data-u="${id}"${tt?` title="${tt}"`:''}${o.spot?' role="button" tabindex="0"':''}>${esc(t)}</span>${flag}`;};
 let html;
 if(R.table)html=`<div class="scroll"><table class="l9-tbl"><thead><tr><th>方面</th><th>要点</th><th>资料</th></tr></thead><tbody>${R.secs.map(s=>`<tr><td>${esc(s.h)}</td><td class="pt">${s.items.map(i=>U(i.t)).join('<br>')}</td><td>${[...new Set(s.items.filter(i=>i.ci>=0).map(i=>(ix.nos[i.ci]||i.ci+1)))].join('、')||'—'}</td></tr>`).join('')}</tbody></table></div>`;
 else html=R.secs.map(s=>`${s.h?`<h5>${esc(s.h)}</h5>`:''}<ul>${s.items.map(i=>`<li>${U(i.t)}</li>`).join('')}</ul>`).join('');
 return {html:html||'<p class="note">没有整理出内容。</p>',st};}

/* small shared widgets of this lesson */
const catTag=c=>`<span class="l9-cat c${Math.max(0,['结构','逻辑','补充','语言'].indexOf(c))}">${esc(c)}</span>`;
const multi=(name,opts,on)=>`<span data-multi="${name}" style="display:contents">${opts.map(([v,t])=>`<button type="button" class="chip ${on.includes(v)?'on':''}" data-v="${esc(v)}" aria-pressed="${on.includes(v)}">${t}</button>`).join('')}</span>`;
const multiWire=(root,name,fn)=>{const box=$(`[data-multi="${name}"]`,root);if(!box)return;$$('.chip',box).forEach(b=>b.onclick=()=>{b.classList.toggle('on');b.setAttribute('aria-pressed',b.classList.contains('on'));fn($$('.chip.on',box).map(x=>x.dataset.v),b);});};
/* 我的记录: several observation questions, ONE shown at a time. items = [{q,opts,get,set,en,data}] */
function obsPad(root,all,onChange){if(!root)return;const draw=at=>{const items=all.filter(it=>it.en()||it.get()!=null);if(!items.length){root.innerHTML='';return;}
  let i=at!=null?Math.min(at,items.length-1):items.findIndex(it=>it.get()==null);if(i<0)i=items.length-1;const it=items[i],a=it.get(),ok=it.en();
  root.innerHTML=`<div class="ask">${items.length>1?`<span class="note">第 ${i+1} / ${items.length} 个</span><br>`:''}${it.q}</div><div class="opts">${it.opts.map((o,j)=>`<button type="button" class="chip ${a===j?'on':''}" data-j="${j}" ${ok||a!=null?'':'disabled'}>${o}</button>`).join('')}</div><p class="l9-data">${esc(it.data()||'')}</p>${i>0||(a!=null&&i<items.length-1)?`<div class="row">${i>0?'<button type="button" class="btn ghost sm" data-pv>上一个</button>':''}${a!=null&&i<items.length-1?'<button type="button" class="btn sm" data-nx>下一个</button>':''}</div>`:''}`;
  $$('[data-j]',root).forEach(b=>b.onclick=()=>{it.set(+b.dataset.j);App.touch();draw(i);if(onChange)onChange();});
  const nx=$('[data-nx]',root),pv=$('[data-pv]',root);if(nx)nx.onclick=()=>draw(i+1);if(pv)pv.onclick=()=>draw(i-1);};draw();}

/* outline building blocks (chips instead of typing) */
const MSHORT=['查资料','AI 搜索','纪录片','实地观察','采访'];
const PSECS=[['饮食习惯','主要吃竹子；进食时间长'],['活动规律','吃饱就休息；会爬树'],['社交行为','通常独自生活；用气味交流'],['栖息地','四川、陕西、甘肃的山地竹林'],['保护现状','国家公园；数量增长到近1900只'],['天敌寿命','天敌有哪些；能活多久']];
const olOpts=()=>{if(isPanda(cards()))return {qs:[['life','吃住生活','大熊猫的生活习性','大熊猫吃什么、住在哪里、每天怎样生活？'],['save','为何保护','大熊猫的保护','大熊猫为什么需要保护？人们做了什么？'],['baby','宝宝成长','大熊猫宝宝的成长','大熊猫宝宝出生时什么样？怎样长大？']],secs:PSECS};
 const tags=[...new Set(cards().map(c=>lim((c.tags&&c.tags[0])||c.title,12)))].slice(0,5);const t0=tags[0]||'我的研究';
 return {qs:[['what','讲了什么',`${t0}小研究`,`关于“${t0}”，资料告诉了我们什么？`],['why','为什么这样',`${t0}的原因`,`“${t0}”为什么会这样？`]],secs:tags.map(t=>[t,'写作时再补要点'])};};
const defAsp=()=>isPanda(cards())?'饮食、活动、社交':[...new Set(cards().map(c=>lim((c.tags&&c.tags[0])||c.title,8)))].slice(0,3).join('、');
const HELP=[['org','整理资料','整理资料（挑战一）'],['ol','审提纲','审阅提纲'],['rev','审初稿','审阅初稿、提出修改建议'],['pol','润色语句','润色部分语句']];
const RSN={acc:['确实有这个问题','资料里有依据','读起来更清楚'],mod:['意思对，要换成我的说法','先核实再写进去'],rej:['会改掉我的观点','资料里找不到依据','原来的更好']};

/* ---------- render ---------- */
L.render=function(){const v=$('#v-'+K);if(!document.getElementById('css-l9')){const st=document.createElement('style');st.id='css-l9';st.textContent=CSS9;document.head.appendChild(st);}
 S=newS();const slot=id=>`<span id="${id}" style="display:contents"></span>`;
 v.innerHTML=`${App.hero(K,'今天你是研究小组的执笔人：AI 帮忙整理、提建议，听不听由你定。',['学会用 AI 整理资料。','学会与 AI 协作优化文字内容。','知道人类创意与表达的重要性，进一步认识人与 AI 的协作关系。'])}

 <div class="station" id="l9-s0">${App.head('WARM-UP','导入 · 资料文件夹','乱糟糟的资料桌','按你的想法把卡片拖成几堆，一堆就是一类')}
  <ol class="steps"><li>拖卡片分成几堆</li><li>请 AI 看分法</li></ol>
  <div class="l9-desk" id="l9-desk" aria-label="资料卡片桌面：拖动卡片分堆"></div>
  <div class="l9-dread" id="l9-dread">按住卡片拖动来分堆；点一下卡片可以读内容。</div>
  ${App.knobs([['资料',slot('l9-k-src')]])}
  <div class="go-row">${App.go('l9-sort-go','请 AI 看看我的分法')}<button class="btn ghost sm" id="l9-desk-reset" type="button">重新打乱</button></div>
  ${App.aiBox('l9-ai0','分好堆以后按大按钮，AI 会照你的分法给出汇总意见','AI 看了你的分法')}
  <div id="l9-fb0"></div>
  <div class="after-run">${App.pad('我是按什么分的？','<div class="opts" id="l9-angle"></div>')}</div>
  <details class="more"><summary>说明</summary><p class="note">上一讲，我们搜集并收藏了可信的资料。这些资料来自不同的网站、书和视频，长短不一，还有重复。内置资料包的内容经过核对，来源类型是示例。第8讲标为“存疑”的资料默认不参与整理：没核实的内容不能直接写进报告。分类没有标准答案，这一站不判对错。离线演示时由平台程序找出每一堆卡片共同提到的词；接入大模型时，再由 AI 补一段点评。</p></details>
 </div>

 <div class="station" id="l9-s1">${App.head('EXP-01','挑战一 · 资料的整理','整理魔法棒','指挥 AI 换着角度整理，再抓出它偷偷多写的句子')}
  <ol class="steps"><li>换角度让 AI 整理</li><li>抓出多写的句子</li></ol>
  <div class="grid2"><div class="l9-col"><div class="l9-cards" id="l9-cards" aria-label="资料卡"></div><div class="l9-read" id="l9-read" aria-live="polite"></div></div>
   <div class="l9-col">${App.knobs([['怎么整理',App.seg('ang',[['topic','按主题'],['time','按时间'],['question','按问题'],['table','表格'],['aspects','我定的方面']],'topic')],['我定的方面','<input type="text" id="l9-asp" maxlength="40" aria-label="我定的方面" placeholder="如：饮食、活动、社交">','用顿号隔开'],['加一句约束',App.seg('pr',[['plain','不加'],['strict','只用我的资料']],'plain')+'<span class="l9-prs" id="l9-prs"></span>']],'给 AI 下指令')}
    <div class="go-row">${App.go('l9-go1','挥一下魔法棒')}</div>
    <div class="row" id="l9-bd" aria-label="三个小目标"></div></div></div>
  ${App.aiBox('l9-ai1','整理结果会出现在这里。换个角度，结果会长得不一样','AI 的整理')}<div id="l9-fb1"></div>
  <div class="after-run">${App.pad('','<div class="l9-col" id="l9-pad1"></div>')}</div>
  <details class="more"><summary>说明</summary><p class="note">小贴士：在整理资料时，AI 可能会自行补充额外信息，导致生成内容过多。这是现阶段 AI 工作时可能出现的情况。遇到这种情况，可以尝试通过添加提示词来限制 AI，如“只根据我提供的资料进行提炼、总结，不要自行搜集并添加其他内容”。离线时使用示意版整理程序（真的会分句、去重、归类）；普通整理会像真实 AI 一样多写一两句资料里没有的内容。</p>
   ${App.know('“资料里找不到”是怎么算出来的','检查程序把每句话切成相邻两个字、三个字的小片段，看这些片段有多少能在资料卡里找到（重合度）；句子里的数字也必须在资料中出现过。重合度低于约 45%，或者数字对不上，就标为「资料里找不到」。这只是粗略的检查：换了说法的句子可能被误判，意思被改错的句子也可能漏掉，所以最后还要人逐句读一读。')}
   ${App.think(['在整理资料方面，AI 有哪些优势？','如果 AI 的整理结果不符合要求，你认为是什么原因导致的？可以通过哪些方式优化？'])}${App.know('AI 整理资料的优势与不足','AI 能快速从大量资料中提取关键信息并汇总，让繁杂、重复的信息变得简练、易读。但是，在没有明确要求的情况下，AI 只会按文字内容和语言规律来提炼、总结，整理结果可能不符合我们的要求。要想获得更有针对性的资料，就要先构思报告写哪些方面，例如研究“大熊猫的生活习性”，可以让 AI 从饮食习惯、活动规律、社交行为等方面整理。')}</details>
 </div>

 <div class="station" id="l9-s2">${App.head('EXP-02','挑战二 · 助我写报告（任务一）','报告协作台','搭一份让 AI 挑不出毛病的提纲')}
  <ol class="steps"><li>搭好提纲</li><li>逐条决定听不听</li></ol>
  <div class="grid2" data-rb="1"><div class="l9-ol l9-stick" id="l9-olv" aria-label="我的提纲"></div>
   <div class="l9-col">${App.knobs([['研究问题',slot('l9-k-rq')],['研究方法',slot('l9-k-me'),'可多选'],['中间几节',slot('l9-k-sec'),'选 2～4 节'],['结尾',slot('l9-k-end')]])}
    <div class="go-row">${App.go('l9-olrev','请 AI 审提纲')}</div>
    ${App.aiBox('l9-ai2','搭好提纲，请 AI 挑挑毛病','AI 的审阅意见')}<div id="l9-fb2"></div>
    <div class="after-run">${App.pad('','<div class="l9-col" id="l9-pad2"></div>')}</div></div></div>
  <details class="more"><summary>说明</summary><p class="note">按照开展研究工作的一般思路，先明确研究问题和方法，再列出提纲、请 AI 审阅提纲。提纲：先确定开头、中间和结尾各写什么，再拟定中间各章节的标题、顺序和关键要点。AI 的建议不一定都对，采纳与否由你决定；采纳后提纲会跟着改，可以再审一次。</p></details>
 </div>

 <div class="station" id="l9-s2b">${App.head('EXP-02b','挑战二 · 助我写报告（任务二）','我的初稿','不靠 AI，照着提纲写出初稿')}
  <ol class="steps"><li>自己写初稿</li><li>提纲每节都写到</li></ol>
  <div class="grid2"><div class="l9-ol" id="l9-olv2" aria-label="我的提纲"></div>
   <div class="l9-col">${App.pad('第一行写题目，再照提纲一节一节写',`<textarea id="l9-draft" class="l9-draft" maxlength="800" aria-label="我的初稿" placeholder="大熊猫的生活习性&#10;我们想知道……"></textarea><div class="row"><button class="btn ghost sm" type="button" id="l9-sample">载入示例初稿</button><span class="l9-data" id="l9-dn"></span></div>`,'我的初稿')}
    <div class="go-row">${App.go('l9-dchk','检查初稿')}</div><div id="l9-fb2b"></div></div></div>
  <details class="more"><summary>说明</summary><p class="note">初稿在不借助 AI 的情况下，自己完成。第一行写题目，开头写研究问题和方法，中间按提纲分部分写，结尾写研究结论和感想。你可以从零写起，也可以载入一位同学的示例初稿再改成自己的（示例初稿是人写的，有几处可以改进）。「检查初稿」是程序在数字数、对提纲，没有用到 AI。</p></details>
 </div>

 <div class="station" id="l9-s3">${App.head('EXP-03','挑战二 · AI 审阅与人的决定','修改决策记录器','AI 提了一堆建议，揪出不该听的！')}
  <ol class="steps"><li>请 AI 审初稿</li><li>逐条决定听不听</li></ol>
  <div class="grid2" data-rb="1"><div class="l9-col" id="l9-p3col"><div class="l9-read before-run">你的初稿会铺在这里。AI 说到哪一句，哪一句就亮起来。</div><div class="after-run"><div class="l9-paper" id="l9-paper3" aria-label="我的初稿"></div></div></div>
   <div class="l9-col"><div class="go-row">${App.go('l9-rev','请 AI 审初稿')}</div>
    ${App.aiBox('l9-ai3','AI 的建议会一条一条出现在这里','AI 的修改建议')}<div id="l9-fb3"></div>
    <div class="after-run">${App.pad('','<div class="l9-col" id="l9-pad3"></div>')}</div></div></div>
  <details class="more"><summary>说明</summary><p class="note">审阅要求：请检查报告内容与提纲结构、重点是否匹配；检查是否有可补充的资料；检查报告逻辑、语言表达等方面是否存在问题；提出修改建议。AI 会提出几条建议——有的有用，有的没用，有的甚至会改掉你自己的观点。每一条都由你决定。黄色底的字是 AI 换的新说法。离线时使用示意版审阅程序（真的会对照提纲、资料逐句检查）。</p>
   ${App.think(['AI 指出的问题一定要修改吗？提出的修改建议一定有参考价值吗？为什么？','修改报告时，你更倾向于哪种做法？为什么？'])}
   ${App.know('人主导核心观点与最终表述','AI 能帮助我们指出提纲和研究报告中的问题，提出修改建议，还能一键生成修改后的内容。但是，AI 缺少对我们思考过程和写作意图的深刻了解，它提出的问题和建议可能偏离我们原本想表达的重点，不一定都有参考价值。文字作品的核心在于独特的观点和视角，以及生动的表述，这些都源于作者的独立思考。所以，不能在研究报告里直接使用 AI 生成的内容，而要结合自己的思考判断它是否合理，有选择地采纳、借鉴，自己调整内容。')}</details>
 </div>

 <div class="station" id="l9-s3b">${App.head('EXP-03b','挑战二 · AI 审阅与人的决定','定稿 PK 台','你的定稿 PK AI 一键改写')}
  <ol class="steps"><li>开始 PK</li><li>亲手改定稿</li></ol>
  <div class="go-row">${App.go('l9-onego','开始 PK')}</div>
  <div class="grid2" data-rb="1"><div class="l9-col"><div class="l9-vs">我的定稿</div><div class="l9-read before-run">按你的决定改出来的定稿，会出现在这一边。</div>
    <div class="after-run">${App.pad('通读一遍，亲手改一改',`<textarea id="l9-final" class="l9-final" maxlength="900" aria-label="我的定稿"></textarea><span class="l9-data" id="l9-savn"></span><div class="ask">AI 帮过我什么？如实点一点</div><div class="opts" id="l9-k-help"></div><div class="l9-stmt" id="l9-stmt"></div>`,'我的定稿')}</div></div>
   <div class="l9-col"><div class="l9-vs">AI 一键改写</div>${App.aiBox('l9-ai3b','AI 把建议全用上，会改成什么样？','AI 一键改写版')}</div></div>
  <div id="l9-fb3b"></div>
  <div class="after-run">${App.pad('','<div class="l9-col" id="l9-pad3b"></div>')}</div>
  <details class="more"><summary>说明</summary><p class="note">你的定稿只用上你采纳的建议；一键改写把全部建议（包括有问题的）都用上。程序会计算新报告保留了你初稿多少表达（相邻两个字的片段重合比例），并把资料、提纲和初稿里都找不到的句子标红。标红只说明“这是新加的话”，对不对还要你自己核实。</p>
   <p class="note">三种修改态度：${ATT.map(a=>`「${a[1]}」${a[2]}`).join('')}</p></details>
 </div>

 <div class="station" id="l9-s4">${App.head('TALK','讨论 · 人与 AI 怎样分工','分工判断台','10 个环节谁来干？排出你的分工表')}
  <ol class="steps"><li>点一个位置</li><li>排完 10 个环节</li></ol>
  <div class="l9-col" id="l9-job"></div>
  <div id="l9-fb4"></div>
  <details class="more"><summary>说明</summary><p class="note">在整理资料、撰写报告的过程中，哪些环节可以依靠 AI？哪些环节我们必须亲自参与？</p>${App.know('学会与 AI 协作','AI 让原本需要大量时间和精力的资料整理和报告撰写变得高效、便捷。但是，文字作品中的新颖创意和巧妙构思，要靠我们在学习和实践中慢慢积淀，AI 无法替代。我们可以借助 AI 梳理框架、润色文字；但是，按照什么方式整理资料，报告的核心观点、主要内容和后续的优化方向是什么，都需要我们自己来判断。既要善用 AI 的优势，也要充分发挥我们会思考、会判断、会创造的独特价值。')}</details>
 </div>

 <div class="station" id="l9-quizst">${App.head('QUIZ','反思与总结','小测验','5 道题，第一次作答计入能力图谱')}<div id="l9-quiz"></div></div>
 <div class="station" id="l9-diary"></div>`;
 if(!App.rec)return;wire();};

function wire(){const lr=App.lesson(K);lr.org=lr.org||{};lr.org.runs=lr.org.runs||{};lr.obs1=lr.obs1||{};lr.rep=lr.rep||{};lr.obs2=lr.obs2||{};lr.att=lr.att||{};lr.sort=lr.sort||{};
 const O=lr.org,R=lr.rep;R.ol=R.ol||{open:'',secs:[],end:''};R.ol.secs=(R.ol.secs||[]).filter(s=>s&&(s.h||'').trim());R.methods=R.methods||[];R.help=R.help||{};
 const s0=$('#l9-s0'),s1=$('#l9-s1'),s2=$('#l9-s2'),s2b=$('#l9-s2b'),s3=$('#l9-s3'),s3b=$('#l9-s3b'),s4=$('#l9-s4');const bump=()=>{lr.nExp=(lr.nExp||0)+1;};
 const obs=(store,id,q,opts,en,data)=>({q,opts,get:()=>store[id],set:j=>{store[id]=j;},en,data});

 /* ---- WARM-UP: drag the cards into piles. A pile = a category. The analysis reads the student's own piles. ---- */
 /* a card's own tag (checked by hand for the built-in pack) wins; keywords are only the fallback */
 const deskTopic=c=>{if(c.tags&&c.tags[0])return c.tags[0];const tp=topicOf(c.text,TOPICS);return tp?tp.n:'其他';};
 const groupsOf=()=>[...new Set(cards().map(deskTopic))];
 let deskOrg=false,DP=[],zTop=10;const CH=64,GAP=14;const PCOL=['#6c47ff','#ff5d73','#18b98a','#3b8bff','#f59f00','#c44dff','#00a3a3','#7a7f99'];
 const deskEl=()=>$('#l9-desk');const CW=()=>((deskEl().clientWidth||640)<560?112:150);
 /* cards that touch or nearly touch belong to one pile */
 const piles=()=>{const n=DP.length,cw=CW(),par=[...Array(n).keys()];const f=i=>par[i]===i?i:(par[i]=f(par[i]));
  for(let i=0;i<n;i++)for(let j=i+1;j<n;j++){if(Math.abs(DP[i].x-DP[j].x)<cw+GAP&&Math.abs(DP[i].y-DP[j].y)<CH+GAP)par[f(i)]=f(j);}
  const m={};for(let i=0;i<n;i++)(m[f(i)]=m[f(i)]||[]).push(i);return Object.values(m).sort((p,q)=>Math.min(...p.map(i=>DP[i].x))-Math.min(...q.map(i=>DP[i].x))||Math.min(...p.map(i=>DP[i].y))-Math.min(...q.map(i=>DP[i].y)));};
 const scatter=()=>{const d=deskEl(),cs=cards(),W=d.clientWidth||640,cw=CW();const cols=Math.max(2,Math.floor((W-16)/(cw+GAP+26)));const rows=Math.ceil(cs.length/cols);const cellW=(W-16)/cols,cellH=CH+GAP+30;
  d.style.height=Math.max(W<560?520:440,rows*cellH+(W<560?260:190))+'px';let a=11;const r=()=>{a=(a*16807)%2147483647;return a/2147483647;};
  const order=cs.map((_,i)=>i).sort(()=>r()-.5);DP=[];order.forEach((ci,slot)=>{const c=slot%cols,rw=Math.floor(slot/cols);DP[ci]={x:8+c*cellW+r()*Math.max(0,cellW-cw-GAP-4),y:10+rw*cellH+r()*12};});};
 const paintDesk=()=>{const d=deskEl(),cw=CW(),ps=piles();$$('.l9-pl',d).forEach(e=>e.remove());let k=0;
  $$('.l9-pc',d).forEach((el,i)=>{const p=DP[i]||{x:0,y:0};el.style.width=cw+'px';el.style.transform=`translate(${p.x}px,${p.y}px)`;el.style.borderColor='';el.dataset.pile='';});
  ps.forEach(p=>{if(p.length<2)return;const col=PCOL[k%PCOL.length];k++;p.forEach(i=>{const el=$(`.l9-pc[data-i="${i}"]`,d);if(el){el.style.borderColor=col;el.dataset.pile=k;}});
   const x=Math.min(...p.map(i=>DP[i].x)),y=Math.min(...p.map(i=>DP[i].y));const lb=document.createElement('span');lb.className='l9-pl';lb.style.cssText=`left:${x}px;top:${Math.max(0,y-22)}px;background:${col}`;lb.textContent=`第 ${k} 堆 · ${p.length} 张`;d.appendChild(lb);});
  if(k>=1)App.markStep(s0,0);return ps;};
 const drawDesk=()=>{const d=deskEl();if(!d.clientWidth)return;const cs=cards();
  if(d.dataset.key!==srcKind()+cs.length+'|'+(d.clientWidth<560)){d.dataset.key=srcKind()+cs.length+'|'+(d.clientWidth<560);scatter();
   d.innerHTML=cs.map((c,i)=>`<div class="l9-pc${c.trust==='doubt'?' x':''}" data-i="${i}" tabindex="0"><b>${esc(c.title)}</b><span>${esc(lim(c.text,26))}</span></div>`).join('');
   $$('.l9-pc',d).forEach(el=>{const i=+el.dataset.i;let st=null;
    el.onpointerdown=e=>{st={px:e.clientX,py:e.clientY,x:DP[i].x,y:DP[i].y,mv:false};el.setPointerCapture(e.pointerId);el.classList.add('drag');el.style.zIndex=++zTop;};
    el.onpointermove=e=>{if(!st)return;const dx=e.clientX-st.px,dy=e.clientY-st.py;if(Math.abs(dx)+Math.abs(dy)>5)st.mv=true;if(!st.mv)return;const W=d.clientWidth,H=d.clientHeight,cw=CW();DP[i]={x:Math.max(2,Math.min(W-cw-2,st.x+dx)),y:Math.max(24,Math.min(H-CH-2,st.y+dy))};paintDesk();};
    const end=()=>{if(!st)return;const mv=st.mv;st=null;el.classList.remove('drag');if(!mv){const c=cards()[i];$('#l9-dread').innerHTML=`<b>${esc(c.title)}</b>　${esc(c.text)}`;$$('.l9-pc.sel',d).forEach(x=>x.classList.remove('sel'));el.classList.add('sel');}else paintDesk();};
    el.onpointerup=end;el.onpointercancel=end;});}
  else{const W=d.clientWidth,H=d.clientHeight,cw=CW();DP.forEach(p=>{p.x=Math.max(2,Math.min(W-cw-2,p.x));p.y=Math.max(24,Math.min(H-CH-2,p.y));});}
  paintDesk();};
 const drawSrc=()=>{const f=favCards(),k=srcKind();$('#l9-k-src').innerHTML=App.seg('src',[['pack','内置资料包'],['l8',`我的收藏（${f.length} 张）`]],k);
  App.segWire(s0,'src',v=>{if(v==='l8'&&!f.length){App.toast('第 8 讲还没有收藏资料，先用内置资料包');drawSrc();return;}lr.src=v;O.sel=null;S=newS();App.touch();resetAll();});};
 $('#l9-desk-reset').onclick=()=>{deskEl().dataset.key='';drawDesk();};
 /* Read the student's piles WITHOUT a reference answer: sorting has no single right result.
    For each pile, look for what its cards have in common (words they all mention), suggest a name, and turn the piles into a report outline. */
 const KW=TOPICS.flatMap(t=>t.kw.map(k=>[k,t.n]));
 const about=(c,t)=>(c.tags||[]).includes(t.n)||t.kw.some(k=>c.text.includes(k)||c.title.includes(k));
 const commonOf=(cs,p)=>{const need=p.length<=3?p.length:Math.ceil(p.length*.75);
  const cand=TOPICS.map(t=>({t,n:p.filter(i=>about(cs[i],t)).length,tag:p.filter(i=>(cs[i].tags||[])[0]===t.n).length})).filter(x=>x.n>=need).sort((x,y)=>y.tag-x.tag||y.n-x.n);
  return cand.length?{name:cand[0].t.n,q:cand[0].t.q}:null;};
 const readPiles=()=>{const cs=cards(),ps=piles();const big=ps.filter(p=>p.length>=2),single=ps.filter(p=>p.length<2).map(p=>p[0]);
  return {cs,big,single,info:big.map((p,k)=>({p,k,com:commonOf(cs,p)}))};};
 const pileHTML=R=>R.info.map(o=>{const col=PCOL[o.k%PCOL.length];
   const head=o.com?`共同点：都和「${esc(o.com.name)}」有关`:'共同点：我还没看出来';
   const tip=o.com?`<p class="l9-pn">它们能回答：${esc(o.com.q)}　可以叫它「${esc(o.com.name)}」，也可以用你自己起的名字。</p>`:'<p class="l9-po">你是按什么把它们放在一起的？说得出理由，就可以这样分。</p>';
   return `<div class="l9-pr" style="border-left-color:${col}"><b><i style="background:${col}"></i>第 ${o.k+1} 堆（${o.p.length} 张）　${head}</b><div class="l9-pt">${o.p.map(i=>`<span>${esc(R.cs[i].title)}</span>`).join('')}</div>${tip}</div>`;}).join('');
 const adviceOf=R=>{if(!R.big.length)return '卡片还散在桌上。把你觉得“在讲同一件事”的卡片拖到一起，叠成一堆，再让我看。';const a=[];
  const names=R.info.map(o=>o.com?`「${o.com.name}」`:`第 ${o.k+1} 堆`);a.push(`照你的分法，这份报告可以写成 ${R.big.length} 部分：${names.join('、')}，一堆写成一段。`);
  const huge=R.info.find(o=>o.p.length>=Math.max(5,Math.ceil(R.cs.length/2)));if(huge)a.push(`第 ${huge.k+1} 堆有 ${huge.p.length} 张，内容比较多，写的时候可以再分成两小段。`);
  if(R.single.length)a.push(`还有 ${R.single.length} 张单独放着（${R.single.slice(0,3).map(i=>`《${R.cs[i].title}》`).join('、')}）：可以并进某一堆，也可以让它自成一类。`);
  a.push('分类没有标准答案，同样的资料可以有好几种分法。下一站看看 AI 怎么分，和你的比一比。');return a.join('');};
 const ANGLE=['按主题（讲的是哪方面）','按研究问题（能回答哪个问题）','按来源（从哪里找来的）','按重要程度','我有别的分法'];
 const drawAngle=()=>{const box=$('#l9-angle');if(!box)return;const pad0=box.closest('.after-run');if(pad0)pad0.style.display=(lr.desk||{}).n>0?'':'none';const cur=(lr.desk||{}).angle;box.innerHTML=ANGLE.map((t,i)=>`<button type="button" class="chip ${cur===i?'on':''}" data-i="${i}">${t}</button>`).join('');
  $$('.chip',box).forEach(c=>c.onclick=()=>{lr.desk=Object.assign(lr.desk||{},{angle:+c.dataset.i});App.touch();drawAngle();const all=!(lr.desk.single>0)&&lr.desk.n>=2;
   App.fb('#l9-fb0','ok','这就是你的分法！',`${ANGLE[+c.dataset.i].replace(/（.*）/,'')}来分。${all?'':'把单独放着的卡片也安排好，就能拿到 3 颗星。'}`,{stars:all?3:2});});};
 $('#l9-sort-go').onclick=async()=>{const b=$('#l9-sort-go');App.busy(b,true,'AI 正在看…');const R=readPiles(),adv=adviceOf(R);
  const body=more=>`<div class="big">${R.big.length?`你分了 ${R.big.length} 堆`:'还没有分堆'}${R.single.length&&R.big.length?`，${R.single.length} 张单独放着`:''}</div>${pileHTML(R)}<div class="l9-sum"><b>汇总意见</b><p>${esc(adv)}</p>${more||''}</div>`;
  App.aiSay('#l9-ai0',body(),{mood:R.big.length?'happy':'think',src:'offline'});
  lr.desk=Object.assign(lr.desk||{},{n:R.big.length,single:R.single.length});if(R.big.length){lr.warm=1;App.markStep(s0,0);App.markStep(s0,1);}App.touch();drawAngle();
  if(!R.big.length)App.fb('#l9-fb0','try','先拖一拖，再让 AI 看','把你觉得在讲同一件事的卡片叠在一起，边框变成同一种颜色，就是一堆。');
  else App.fb('#l9-fb0','find',`${R.big.length} 堆，这是你的分法`,'看看 AI 找到的每一堆的共同点，和你想的一样吗？再在下面选一选：你是按什么分的。',{stars:lr.desk.angle!=null&&!R.single.length&&R.big.length>=2?3:R.big.length>=2?2:1});
  /* with a real model, add a short comment on the same piles (controlled prompt, no free input, no right/wrong verdict) */
  if(App.AI.real()&&R.big.length){try{const pr=`一位小学高年级学生把 ${R.cs.length} 张关于同一研究主题的资料卡分成了几堆（一堆代表一类）。分类没有标准答案，请不要评判对错，也不要替他重新分类。请用不超过 90 个字、对学生说话的口气：说出你看到的每一堆的共同点，再给一条写报告时可以怎么用这个分法的建议。\n${R.big.map((p,k)=>`第${k+1}堆：${p.map(i=>`《${R.cs[i].title}》${lim(R.cs[i].text,40)}`).join('；')}`).join('\n')}${R.single.length?`\n单独放着：${R.single.map(i=>`《${R.cs[i].title}》`).join('、')}`:''}`;
    const r=await ask(pr,{});const t=r&&(r.text||'').trim();if(t)App.aiSay('#l9-ai0',body(`<p class="l9-aic"><b>AI 的点评</b>　${esc(lim(t,160))}</p>`),{mood:'happy',src:r.mode||App.AI.mode()});}catch(e){}}
  App.busy(b,false);b.classList.add('again');};
 if(lr.warm)drawAngle();

 /* ---- EXP-01: plain vs constrained, then catch the sentences AI made up ---- */
 const STRICT='只根据我提供的资料进行提炼、总结，不要自行搜集并添加其他内容。';
 const baseP=n=>`下面是我为研究报告搜集的 ${n} 条资料。请帮我把这些资料整理成一份清晰、有条理的资料摘要。`;
 const cardsBlock=cs=>cs.map((c,i)=>`资料${i+1}（${c.srcType||'来源未注明'}）：${c.text}`).join('\n');
 const ANG={topic:['按主题','按主题分类整理'],time:['按时间','按时间先后顺序整理（如一生的不同阶段、年份），没有时间信息的资料放在最后一部分'],question:['按问题','按“研究问题”整理：每部分的小标题写成一个问题，下面列出能回答这个问题的资料'],table:['表格','整理成一个 Markdown 表格，三列分别是：方面｜要点｜资料编号'],aspects:['我定的方面','']};
 const orgPrompt=(cs,angle,strict,asp)=>{const how=angle==='aspects'?`只从这几个方面整理：${asp}，每个方面一个小标题；不属于这些方面的资料放在最后的【其他】里`:angle==='free'?'分成几个部分':ANG[angle][1];
  return `${baseP(cs.length)}${how}。${angle==='table'?'':'每部分用【小标题】开头，下面每条要点单独一行、以“- ”开头。'}语句简洁，全文不超过 300 字。${strict?STRICT:''}${SAFE}\n\n${cardsBlock(cs)}`;};
 const drawCards=()=>{const cs=cards();$('#l9-cards').innerHTML=cs.map((c,i)=>`<button type="button" class="l9-cardb${c.trust==='doubt'?' x':''}" data-ci="${i}" title="${esc(c.title)}"><i>${i+1}</i><span>${esc(c.title)}</span></button>`).join('');
  $('#l9-read').innerHTML='<span class="note">点一张资料卡，读读原文。</span>';
  $$('[data-ci]',s1).forEach(b=>b.onclick=()=>{const c=cs[+b.dataset.ci];$$('[data-ci]',s1).forEach(x=>x.classList.toggle('on',x===b));$('#l9-read').innerHTML=`<small>资料${+b.dataset.ci+1} · ${esc(c.srcType||'来源未注明')}${c.trust==='doubt'?' · 存疑，不参加整理':''}</small>${esc(cut(c.text,220))}`;});};
 const drawPr=()=>{$('#l9-prs').innerHTML=S.pr==='strict'?`多说一句：<b>只根据我提供的资料，不要自己添加内容。</b>`:'';};
 App.segWire(s1,'pr',v=>{S.pr=v;drawPr();});
 /* three small goals of this station: try 2 angles · catch what AI added · rein it in with the constraint */
 const goals1=()=>[(O.angles||[]).length>=2,!!(O.spot&&O.spot.done),!!O.runs.strict];
 const star1=()=>Math.max(1,goals1().filter(Boolean).length);
 const drawBd=()=>{const g=goals1(),n=(O.angles||[]).length;const T=[`换 2 种角度（${Math.min(2,n)}/2）`,'抓出 AI 多写的句子','加约束管住 AI'];$('#l9-bd').innerHTML=T.map((t,i)=>`<span class="l9-bd ${g[i]?'on':''}">${g[i]?'✓ ':''}${t}</span>`).join('');};
 const say1=()=>{const w=S.shown,Rz=S.res[w];if(!Rz)return null;const ix=idxOf(Rz.cs);const on=w==='strict'||S.checked;const spot=on?null:S.spot;const r=resHTML(Rz,ix,{check:on,spot,mine:w==='plain'&&S.checked?S.spot:null});
  const inC=nz(Rz.cs.map(c=>c.text).join('')).length,outC=outLen(Rz);
  const mine=(lr.desk&&lr.desk.n)?`<p class="note">你在资料桌上分了 ${lr.desk.n} 堆，AI ${ANG[Rz.angle]?ANG[Rz.angle][0]:''}分成了 ${Rz.secs.length} 部分。比一比：哪里一样，哪里不一样？</p>`:'';
  App.aiSay('#l9-ai1',`<div class="big">${ANG[Rz.angle]?ANG[Rz.angle][0]+' · ':''}${on?(r.st.no?`多写了 ${r.st.no} 句`:'一句也没多写'):`${Rz.cs.length} 张卡片 → ${Rz.secs.length} 部分`}</div>${on?'':`<p class="note">字数：${inC} 字 → ${outC} 字${outC>=inC?'。字数没变少，变的是有了分类和小标题':''}</p>`}${mine}${Rz.note?`<p class="note">${esc(Rz.note)}</p>`:''}<div class="l9-res">${r.html}</div>`,{mood:on?(r.st.no?'oops':'happy'):'think',src:Rz.mode||'offline'});
  if(spot)$$('.l9-u.spot',$('#l9-ai1')).forEach(el=>{const tg=()=>{const id=+el.dataset.u;S.spot.has(id)?S.spot.delete(id):S.spot.add(id);el.classList.toggle('sel');drawPad1();};el.onclick=tg;el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();tg();}};});
  return r.st;};
 const OB1a=[obs(lr.obs1,'q1','AI 的初步整理结果是否简化了原始资料的内容，使资料变得清晰、易读？',['是，明显简化了','简化了一些','没有简化'],()=>!!(O.runs.plain||O.runs.strict),()=>{const Rz=S.res.strict||S.res[S.shown];if(!Rz)return '';const inC=nz(Rz.cs.map(c=>c.text).join('')).length,outC=outLen(Rz);return `实测：原文 ${inC} 字 → 整理后 ${outC} 字，分成 ${Rz.secs.length} 个部分（${Rz.strict?'B 加约束':'A 普通'}整理）。${outC>=inC?'字数没变少，“清晰、易读”要看分类和小标题。':''}`;}),
  obs(lr.obs1,'q3','加上“只根据我提供的资料”的约束后，资料里找不到的句子有什么变化？',['变少了','没有变化','变多了'],()=>!!(O.spot&&O.spot.done&&O.uns&&O.uns.strict!=null),()=>O.spot&&O.spot.done&&O.uns&&O.uns.strict!=null?`实测：A ${O.uns.plain} 句 → B ${O.uns.strict} 句。`:'A、B 都整理一次，A 对过答案，才能回答。')];
 const drawPad1=()=>{drawBd();const box=$('#l9-pad1');if(S.shown==='plain'&&S.res.plain&&!S.checked){box.innerHTML=`<div class="ask">在上面点出 AI 多写的句子</div><div class="row"><button class="btn sm" type="button" id="l9-chk">对答案</button><span class="l9-data">已点 <b>${S.spot.size}</b> 句</span></div>`;$('#l9-chk').onclick=check1;return;}
  obsPad(box,[...OB1a,...OB1b],marks1);};
 const check1=()=>{const P=S.res.plain;if(!P)return;const ix=idxOf(P.cs);const units=resHTML(P,ix,{}).st.units;let tp=0,fp=0,fn=0,tot=0;units.forEach((t,i)=>{const no=chk(t,ix).st==='no';if(no)tot++;const s=S.spot.has(i);if(no&&s)tp++;else if(s)fp++;else if(no)fn++;});
  S.checked=true;O.spot={done:1,tp,fp,fn,tot};O.uns=O.uns||{};O.uns.plain=tot;App.touch();say1();marks1();const next='把「加一句约束」换成“只用我的资料”，再挥一次。';
  if(!tot)App.fb('#l9-fb1','find','这次 AI 没有多写',(fp?`你点的 ${fp} 句，其实资料里有（标着“资料里有”）。`:'你也没有冤枉它。')+next,{stars:star1()});
  else if(tp===tot&&!fp)App.fb('#l9-fb1','ok',`全抓住了！AI 多写了 ${tot} 句`,(P.mode?'标红的话检查程序在资料里找不到（换了说法的也可能被标出来，回资料卡核对一下）。':'这些话资料里没有，是 AI 自己加的。')+next,{stars:3});
  else App.fb('#l9-fb1','oops',`AI 多写了 ${tot} 句，你抓住 ${tp} 句`,(fn?'漏掉的句子读起来很像真的。':'')+(fp?`有 ${fp} 句冤枉了它（标着“资料里有”）。`:'')+next,{stars:star1()});
  drawPad1();};
 $('#l9-go1').onclick=async()=>{const which=S.pr,cs=selCards(),strict=which==='strict',ang=S.ang||'topic',b=$('#l9-go1');let asp=lim((aspEl.value||'').trim(),40);
  if(ang==='aspects'){if(asp.split(/[，,、；;\s]+/).filter(Boolean).length<2){asp=defAsp();aspEl.value=asp;}O.asp=asp;}
  App.busy(b,true,'AI 正在整理…');
  App.aiSay('#l9-ai1',App.AI.real()?'正在读资料……':'分句 → 去掉重复 → 归类 → 排序……',{busy:true});let Rz=null,note='';
  if(App.AI.real()){const r=await ask(orgPrompt(cs,ang,strict,asp),{onText:({text})=>App.aiSay('#l9-ai1',`<div class="l9-res"><pre>${esc(text)}</pre></div>`,{busy:true})});
   if(r&&r.cancel){App.busy(b,false);return;}if(r&&r.text){const secs=parseAI(r.text);if(secs.length)Rz={secs,table:ang==='table',mode:r.mode,strict,angle:ang};}else if(r&&r.err)note=r.err;}
  if(!Rz){await wait(500);Rz=organise(cs,ang,{strict,aspects:asp});Rz.angle=ang;if(note)Rz.note=note;}
  Rz.cs=cs;O.angles=[...new Set([...(O.angles||[]),ang])];O.rounds=(O.rounds||0)+1;S.res[which]=Rz;S.shown=which;if(!strict){S.checked=false;S.spot=new Set();}
  const ru=O.runs[which]=O.runs[which]||{n:0};ru.n++;ru.m=Rz.mode||'offline';bump();const st=say1();
  if(strict){O.uns=O.uns||{};O.uns.strict=st.no;const a=O.spot&&O.spot.done?O.uns.plain:null;
   if(a!=null&&st.no<a)App.fb('#l9-fb1','find',`加了约束：多写 ${a} 句 → ${st.no} 句`,'一句话就管住了 AI。不过，整理结果还是要自己核对一遍。',{stars:star1()});
   else if(st.no)App.fb('#l9-fb1','oops','加了约束，AI 还是多写了！',`标红的 ${st.no} 句资料里找不到。约束不保证管用，所以要逐句核对。`,{stars:star1()});
   else App.fb('#l9-fb1','find','加了约束：一句也没多写',a==null?'把约束换回“不加”再挥一次，抓一抓它多写的句子。':'这次两种整理都没有多写。',{stars:star1()});}
  else App.fb('#l9-fb1','find',`${ANG[ang][0]}整理好了。它有没有多写？`,'AI 可能偷偷加了资料里没有的话。在上面的整理结果里，点一点你怀疑的句子，再按「对答案」。',{stars:star1()});
  App.touch();marks1();drawPad1();App.busy(b,false);b.classList.add('again');};
 const marks1=()=>{if(O.runs.plain||O.runs.strict)App.markStep(s1,0);if(O.spot&&O.spot.done)App.markStep(s1,1);};

 /* angle controls (merged into EXP-01) */
 const aspEl=$('#l9-asp');aspEl.value=O.asp||defAsp();
 const aspRow=()=>{const row=aspEl.closest('.knob');if(row)row.hidden=S.ang!=='aspects';};
 App.segWire(s1,'ang',v=>{S.ang=v;aspRow();});
 const OB1b=[obs(lr.obs1,'q2','输入更具体的提示词后，AI 的资料整理结果是否更有针对性、更有条理了？',['是，更有针对性了','差不多','反而更乱了'],()=>(O.angles||[]).includes('aspects')||(O.angles||[]).length>=2,()=>(O.angles||[]).includes('aspects')?'比一比「我定的方面」和「按主题」的结果。':'先用「我定的方面」整理一次。')];
 const marks1b=()=>{};

 /* ---- EXP-02: build the outline with chips, let AI review it, decide item by item ---- */
 const initW=()=>{const o=olOpts();const named=R.ol.secs;const custom=!!((R.title||'').trim()&&!o.qs.some(q=>q[0]===R.qk));
  S.w={custom,qk:custom?'':(o.qs.some(q=>q[0]===R.qk)?R.qk:o.qs[0][0]),methods:R.methods.slice(),secs:named.length?named.map(s=>({h:s.h,p:s.p||''})):o.secs.slice(0,2).map(s=>({h:s[0],p:s[1]})),end:/结论/.test(R.ol.end||'')?'both':'feel'};};
 const wQ=()=>{const o=olOpts(),w=S.w;if(w.custom)return [R.title,R.q||''];const q=o.qs.find(x=>x[0]===w.qk)||o.qs[0];return [q[2],q[3]];};
 const openT=w=>'研究缘由；研究问题'+(w.methods.length?'；研究方法：'+w.methods.join('、'):'');
 const endT=w=>w.end==='both'?'研究结论；我的感想':'我的感想';
 const commit=()=>{const w=S.w;if(!w.custom){const [t,q]=wQ();R.title=t;R.q=q;R.qk=w.qk;}R.methods=w.methods.slice();R.ol={open:openT(w),secs:w.secs.map(s=>({h:s.h,p:s.p})),end:endT(w)};App.touch();};
 const drawOL=()=>{const w=S.w,[t,q]=wQ();const html=`<b>${esc(t)}</b><div><i>问题</i><span>${esc(q)}</span></div><div><i>开头</i><span>研究缘由；研究问题；${w.methods.length?'研究方法：'+esc(w.methods.join('、')):'<em>还没选研究方法</em>'}</span></div>${w.secs.map((s,i)=>`<div data-sec="${i}"><i>中间 ${i+1}</i><span><b>${esc(s.h)}</b>${s.p?'：'+esc(s.p):''}</span></div>`).join('')||'<div><i>中间</i><span><em>还没选要写哪几节</em></span></div>'}<div><i>结尾</i><span>${esc(endT(w))}</span></div>`;
  $('#l9-olv').innerHTML=html;$('#l9-olv2').innerHTML=html;paintCover();};
 const grow=el=>{if(!el||!el.offsetParent)return;el.style.height='auto';el.style.height=Math.min(1400,el.scrollHeight+4)+'px';};
 function paintCover(){const t=(lr.rep||{}).draft||'';if(!S.w)return;const rows=$$('#l9-olv2 [data-sec]');const miss=nz(t).length>=20?missOf(t):S.w.secs.map(s=>s.h);
  rows.forEach((el,i)=>{const sec=S.w.secs[i],lb=$('i',el);if(!sec||!lb)return;const ok=!miss.includes(sec.h);lb.classList.toggle('ok',ok);lb.textContent=ok?'写到了':'中间 '+(i+1);});}
 const drawK2=()=>{const o=olOpts(),w=S.w;
  $('#l9-k-rq').innerHTML=App.seg('rq',o.qs.map(q=>[q[0],q[1]]),w.qk);App.segWire(s2,'rq',v=>{w.qk=v;w.custom=false;commit();drawOL();});
  $('#l9-k-me').innerHTML=multi('me',MSHORT.map((t,i)=>[METHODS[i],t]),w.methods);multiWire(s2,'me',on=>{w.methods=on;commit();drawOL();});
  $('#l9-k-sec').innerHTML=multi('sec',o.secs.map(s=>[s[0],s[0]]),w.secs.map(s=>s.h));multiWire(s2,'sec',(on,b)=>{const h=b.dataset.v;
   if(on.includes(h)){if(w.secs.length>=4){App.toast('中间最多 4 节');b.classList.remove('on');return;}const d=o.secs.find(s=>s[0]===h);w.secs.push({h,p:d?d[1]:''});}else w.secs=w.secs.filter(s=>s.h!==h);commit();drawOL();});
  $('#l9-k-end').innerHTML=App.seg('end',[['feel','只写感想'],['both','结论 + 感想']],w.end);App.segWire(s2,'end',v=>{w.end=v;commit();drawOL();});};
 const ruleN=rv=>rv.items.filter(it=>!it.opt).length;
 const sayO=()=>{const rv=S.oRev;if(!rv)return;const n=rv.items.length,src=rv.mode||'offline';if(!n){App.aiSay('#l9-ai2','<div class="big">挑不出毛病！</div>这份提纲结构完整。',{mood:'happy',src});return;}
  const it=rv.items[S.oi];App.aiSay('#l9-ai2',`<div class="l9-sgh">${catTag(it.c)}<span>第 ${S.oi+1} / ${n} 条</span></div><div class="l9-sgp">${esc(it.p)}</div>${rv.note&&!S.oi?`<p class="note">${esc(rv.note)}</p>`:''}`,{mood:it.opt?'think':'idle',src});};
 const applyO=it=>{const w=S.w;let msg='';if(it.a==='open'){if(!w.methods.length)w.methods=[METHODS[0]];msg=`开头写上了“研究方法：${w.methods.join('、')}”。`;}else if(it.a==='end'){w.end='both';msg='结尾改成了“研究结论；我的感想”。';}
  else if(it.a==='drop'&&w.secs.some(s=>s.h===it.h)){w.secs=w.secs.filter(s=>s.h!==it.h);msg=`中间去掉了「${esc(it.h)}」这一节。`;}else if(it.a==='move'&&w.secs.length>=2){w.secs.unshift(w.secs.pop());msg=`「${esc(w.secs[0].h)}」调到了中间第一节。`;}else return '';
  commit();drawK2();drawOL();const o=$('#l9-olv');o.classList.remove('flash');void o.offsetWidth;o.classList.add('flash');return msg;};
 const drawPad2=()=>{const box=$('#l9-pad2'),rv=S.oRev,os=R.osugs||[];if(!rv)return;const n=rv.items.length;if(!n){box.innerHTML='<div class="ask">提纲过关。去下一站写初稿。</div>';return;}
  const i=S.oi,it=rv.items[i],d=(os[i]||{}).d,done=os.filter(s=>s.d).length;
  box.innerHTML=`<div class="ask">这条建议，听不听？</div><div class="opts"><button type="button" class="chip ${d==='acc'?'on':''}" data-od="acc">采纳</button><button type="button" class="chip ${d==='rej'?'on':''}" data-od="rej">不采纳</button></div>${d&&it.note?`<div class="l9-rv">${esc(it.note)}</div>`:''}
   <div class="row">${i?'<button type="button" class="btn ghost sm" data-pv>上一条</button>':''}${d&&i<n-1?'<button type="button" class="btn sm" data-nx>下一条</button>':''}<span class="l9-data">已决定 <b>${done}</b>/${n}</span></div>`;
  $$('[data-od]',box).forEach(b=>b.onclick=()=>{if(!os[i])return;const was=os[i].d,acc=b.dataset.od==='acc';os[i].d=b.dataset.od;let ch='';if(!rv.mode&&acc&&was!=='acc')ch=applyO(it);App.touch();marks2();
   /* say exactly what happened to the outline: nothing is claimed that the student cannot see */
   const what=acc?(ch?ch+'看提纲里亮起来的地方。':was==='acc'?'':'这条要你自己动手：用「调一调」里的选项把提纲改一改。'):(was==='acc'&&!rv.mode&&it.a?'提纲已经按这条改过了。想改回去，用「调一调」里的选项。':it.opt?'你保留了自己的顺序。说得出理由就行。':'听不听，都要有自己的理由。');
   const all=os.every(s=>s.d),st=rv.mode?(all?(R.oN>=2?3:2):1):S.oStars;
   if(all)App.fb('#l9-fb2','ok',`${n} 条都决定了`,what+'再按一次「请 AI 审提纲」，看看还剩几个毛病。',{stars:st});
   else if(it.opt)App.fb('#l9-fb2','find','这条可听可不听',(acc?ch+'先写什么，要服务于你的研究问题。':what)+'再看下一条。',{stars:st});
   else App.fb('#l9-fb2',acc&&ch?'ok':'find',acc?(ch?'采纳了，提纲改好了':'采纳了，这条要你自己改'):'这条你没有采纳',what+'再看下一条。',{stars:st});
   drawPad2();});
  const pv=$('[data-pv]',box),nx=$('[data-nx]',box);if(pv)pv.onclick=()=>{S.oi--;sayO();drawPad2();};if(nx)nx.onclick=()=>{S.oi++;sayO();drawPad2();};};
 $('#l9-olrev').onclick=async()=>{commit();const b=$('#l9-olrev');App.busy(b,true,'AI 正在审…');App.aiSay('#l9-ai2','对照资料，一节一节看……',{busy:true});let rv=null,note='';const cs=selCards();
  if(App.AI.real()){const r=await ask(`你是小学生研究报告的指导老师。请分析下面的研究报告初始提纲，指出问题、提出修改建议（3～5 条）。${SAFE}\n可参考的资料：\n${cardsBlock(cs).slice(0,1200)}\n\n初始提纲：\n${olText(R)}\n\n输出 JSON：{"problems":[{"cat":"结构|逻辑|补充","text":"问题和修改建议，一两句话"}]}`,{json:true,tier:'quick'});
   if(r&&r.cancel){App.busy(b,false);return;}
   if(r&&r.data&&Array.isArray(r.data.problems)){rv={items:r.data.problems.slice(0,6).map(p=>({c:['结构','逻辑','补充','语言'].includes(p.cat)?p.cat:'结构',p:lim(p.text||p.problem||'',120)})).filter(p=>p.p),mode:r.mode};}else if(r&&r.err)note=r.err;}
  if(!rv){await wait(400);const items=reviewOutline(R,cs).map(it=>{const m=/找不到关于「(.+?)」的内容/.exec(it.p);return m?Object.assign({},it,{a:'drop',h:m[1],p:`资料卡里几乎找不到关于「${m[1]}」的内容：要么补充资料，要么换一个方面。`}):it;});rv={items,mode:null,note};}
  S.oRev=rv;S.oi=0;R.oN=(R.oN||0)+1;R.osugs=rv.items.map(it=>({c:it.c,p:lim(it.p,80),d:null,opt:it.opt?1:0}));bump();App.touch();const P=ruleN(rv);S.oStars=P===0?3:P<=1?2:1;
  sayO();if(P===0)App.fb('#l9-fb2','ok','AI 挑不出毛病了！',rv.items.length?'只剩一条可听可不听的建议。听不听，你定。':'这份提纲可以用来写初稿了。',{stars:3});
  else if(rv.mode)App.fb('#l9-fb2','find',`AI 提了 ${P} 条意见`,'AI 说的不一定都对。一条一条看，听不听由你定。',{stars:1});
  else App.fb('#l9-fb2','find',`AI 挑出了 ${P} 个毛病`,'一条一条决定听不听。改好再审一次，争取 0 个毛病。',{stars:S.oStars});
  drawPad2();marks2();App.busy(b,false);b.classList.add('again');};
 const marks2=()=>{const os=R.osugs||[];if(R.oN)App.markStep(s2,0);if(R.oN&&(!os.length||os.every(s=>s.d)))App.markStep(s2,1);};

 /* ---- EXP-02b: the draft, written without AI ---- */
 const dr=$('#l9-draft');dr.value=R.draft||'';
 const ownOf=t=>{const A=grams(t,2),B=grams(SAMPLE,2);if(!A.size)return 0;let x=0;A.forEach(g=>{if(B.has(g))x++;});return Math.round(100*(1-x/A.size))/100;};
 const dn=()=>{grow(dr);paintCover();const n=nz(dr.value).length;$('#l9-dn').innerHTML=`<b>${n}</b> 字${R.fs?` · 约 ${Math.round((R.own||0)*100)}% 是你自己的话`:''}`;};
 dr.oninput=()=>{R.draft=lim(dr.value,800);if(R.fs)R.own=ownOf(R.draft);dn();clearTimeout(dr._t);dr._t=setTimeout(()=>{App.touch();marks2b();},700);};
 $('#l9-sample').onclick=()=>{if(nz(dr.value).length>20&&!confirm('载入示例初稿会替换你现在写的内容，确定吗？'))return;dr.value=SAMPLE;R.draft=SAMPLE;R.fs=1;R.own=0;if(!(R.title||'').trim())R.title=EX_OL.title;App.touch();dn();marks2b();App.toast('已载入示例初稿。试着把它改成你自己的话。');};
 function missOf(t){return S.w.secs.filter(s=>!(t.includes(s.h.trim())||aspKw(s.h,2).some(k=>!['每天','吃饱'].includes(k)&&t.includes(k)))).map(s=>s.h);}
 $('#l9-dchk').onclick=()=>{const t=R.draft||'',n=nz(t).length,tot=S.w.secs.length,miss=missOf(t);$('#l9-dchk').classList.add('again');R.dchk=1;App.touch();marks2b();
  if(n<60){App.fb('#l9-fb2b','try',n?`才写了 ${n} 字，再写一点`:'初稿还是空的','第一行写题目，再写研究问题。也可以载入示例初稿，改成自己的话。');return;}
  const copy=R.fs&&(R.own||0)<0.15;
  if(!miss.length&&n>=120)App.fb('#l9-fb2b','ok',`提纲 ${tot} 节全写到了！`,copy?`${n} 字。不过这还是示例初稿，改成你自己的话，才能拿满星。`:`${n} 字，都是自己写的。下一站，请 AI 审一审。`,{stars:copy?2:3});
  else App.fb('#l9-fb2b','find',`提纲 ${tot} 节，写到了 ${tot-miss.length} 节`,(miss.length?`还差：${miss.map(h=>`「${esc(h)}」`).join('')}。`:'')+(n<120?`现在 ${n} 字，写到 120 字以上。`:''),{stars:n>=120?2:1});};
 const marks2b=()=>{const n=nz(R.draft).length;if(n>=60)App.markStep(s2b,0);if(n>=120&&R.dchk&&!missOf(R.draft||'').length)App.markStep(s2b,1);};

 /* ---- EXP-03: AI reviews the draft → decide one suggestion at a time ---- */
 const fixIdx=()=>mkIdx(selCards().map(c=>c.text).concat([R.draft||'']));
 const markNew=(t,ix)=>{const ch=[...String(t||'')];const w=ch.map(c=>/[一-龥A-Za-z0-9]/.test(c));const pos=ch.map((c,i)=>i).filter(i=>w[i]);const cov=new Array(ch.length).fill(true);let nNew=0;
  pos.forEach((i,k)=>{const a=k>0?ch[pos[k-1]]+ch[i]:'',b=k<pos.length-1?ch[i]+ch[pos[k+1]]:'';cov[i]=(a&&ix.g2.has(a))||(b&&ix.g2.has(b));});
  let out='',open=false;ch.forEach((c,i)=>{const nw=w[i]&&!cov[i];if(nw&&!open){out+='<mark class="l9-new">';open=true;nNew++;}else if(!nw&&open&&w[i]){out+='</mark>';open=false;}out+=esc(c);});if(open)out+='</mark>';return {html:out,n:nNew};};
 const supFlag=(t,q)=>{if(!t)return '';const ix=fixIdx();const bad=q?[]:splitS(t).filter(s=>nz(s).length>=8&&chk(s,ix).st==='no');
  return bad.length?`<p class="l9-flag"><em class="l9-nf">新内容</em> 资料和初稿里都找不到，采纳前要确认。</p>`:markNew(t,ix).n?'<p class="l9-flag">黄底是新说法：有没有改变你的意思？</p>':'';};
 const drawPaper3=()=>{const el=$('#l9-paper3'),t=R.draft||'',s=(R.sugs||[])[S.si];
  if(s&&s.q&&t.includes(s.q)){const k=t.indexOf(s.q);el.innerHTML=esc(t.slice(0,k))+`<mark class="l9-hl">${esc(s.q)}</mark>`+esc(t.slice(k+s.q.length));const m=$('mark',el);if(m)el.scrollTop=Math.max(0,m.offsetTop-el.offsetTop-60);}else el.textContent=t;
  const col=$('#l9-p3col');if(col)requestAnimationFrame(()=>col.classList.toggle('l9-stick',col.offsetHeight>0&&col.offsetHeight<innerHeight-100));};
 const sayS=()=>{const ss=R.sugs||[];if(!ss.length)return;const i=S.si=clamp(S.si,0,ss.length-1),s=ss[i],del=s.q&&!s.f;
  App.aiSay('#l9-ai3',`<div class="l9-sgh">${catTag(s.cat)}<span>第 ${i+1} / ${ss.length} 条</span></div><div class="l9-sgp">${esc(s.p)}</div>${R.rnote&&!i?`<p class="note">${esc(R.rnote)}</p>`:''}
   ${s.q||s.f?`<div class="l9-diff">${s.q?`<span>原句</span><del>${esc(s.q)}</del>`:''}<span>${del?'建议':s.q?'改为':'补充'}</span>${del?'<span>删去这句</span>':`<ins>${markNew(s.f,fixIdx()).html}</ins>`}</div>`:''}${!del&&s.f?supFlag(s.f,s.q):''}`,{mood:'think',src:R.rm||'offline'});drawPaper3();};
 const OB2a=[obs(lr.obs2,'q1','AI 针对提纲和报告指出的问题是否准确？',['大多准确','有的准确，有的不准确','大多不准确'],()=>(R.sugs||[]).some(s=>s.d),()=>{const st=sugStats(R);return st.d?`你的决定：采纳 ${st.acc} 条，修改后采纳 ${st.mod} 条，不采纳 ${st.rej} 条。`:'';}),
  obs(lr.obs2,'q2','AI 针对提纲和报告提出的修改建议是否有帮助？',['都有帮助','部分有帮助','都没有帮助'],()=>(R.sugs||[]).some(s=>s.d),()=>{const t=(R.sugs||[]).filter(s=>s.d&&s.note).length;return t?`其中 ${t} 条建议带着提醒，想想你是怎么决定的。`:'';})];
 const fbDec=s=>{if(s.k==='trap'){if(s.d==='acc')App.fb('#l9-fb3','oops','小心，这条建议有坑！',esc(s.note||'')+' 现在还能改主意。');else App.fb('#l9-fb3','ok','识破了！这条不能照单全收',esc(s.note||''),{cheer:true});}
  else if(s.k==='opt')App.fb('#l9-fb3','find','这条可听可不听',esc(s.note||'改不改，由你决定。'));
  else if(s.k==='rule')App.fb('#l9-fb3',s.d==='rej'?'find':'ok',s.d==='rej'?'这条你没有采纳':s.d==='mod'?'用你自己的话来改，好主意':'这条有道理，采纳了',esc(s.note||'选一个理由，再看下一条。'));
  else App.fb('#l9-fb3','find','记下了你的决定','选一个理由，再看下一条。');};
 const sumFb=()=>{const st=sugStats(R),lazy=st.acc===st.n;const txt=`采纳 ${st.acc} · 修改后采纳 ${st.mod} · 不采纳 ${st.rej}。下一站，和 AI 的一键改写比一比。`;
  if(st.trap&&st.trapOk<st.trap)App.fb('#l9-fb3','oops',`${st.n} 条都定了，可有 ${st.trap-st.trapOk} 条坑没躲开`,txt,{stars:2});
  else App.fb('#l9-fb3','ok',st.trap?`${st.n} 条都定了，${st.trap} 条坑全识破！`:`${st.n} 条都定了`,txt,{stars:lazy?2:3});};
 const drawPad3=()=>{const box=$('#l9-pad3'),ss=R.sugs||[];if(!ss.length){box.innerHTML='';return;}const all=ss.every(s=>s.d),n=ss.length,done=ss.filter(s=>s.d).length;
  if(S.view3==='obs'&&all){box.innerHTML='<div class="l9-col" id="l9-obs2"></div><div class="row"><button type="button" class="btn ghost sm" data-back>回看我的决定</button></div>';obsPad($('#l9-obs2'),OB2a);$('[data-back]',box).onclick=()=>{S.view3='dec';drawPad3();};return;}
  const i=S.si,s=ss[i];
  box.innerHTML=`<div class="ask">这条建议，听不听？</div><div class="opts">${Object.entries(DEC).map(([k,[nm]])=>`<button type="button" class="chip ${s.d===k?'on':''}" data-d="${k}">${nm}</button>`).join('')}</div>
   ${s.d==='mod'?`<textarea id="l9-mf" maxlength="200" rows="2" aria-label="我的改法">${esc(s.mf!=null?s.mf:s.f)}</textarea>`:''}
   ${s.d?`<div class="opts" aria-label="我的理由">${RSN[s.d].map(t=>`<button type="button" class="chip ${s.why===t?'sel':''}" data-why="${esc(t)}">${t}</button>`).join('')}</div>`:''}
   <div class="row">${i?'<button type="button" class="btn ghost sm" data-pv>上一条</button>':''}${s.d&&i<n-1?'<button type="button" class="btn sm" data-nx>下一条</button>':''}${all?'<button type="button" class="btn ghost sm" data-obs>说说我的观察</button>':''}<span class="l9-data">已决定 <b>${done}</b>/${n}</span></div>`;
  $$('[data-d]',box).forEach(b=>b.onclick=()=>{const k=b.dataset.d;s.d=k;if(k==='mod'&&s.mf==null)s.mf=s.f;if(Object.values(RSN).some(a=>a.includes(s.why))&&!RSN[k].includes(s.why))s.why='';App.touch();marks3();
   if(ss.every(x=>x.d)&&!S.sum){S.sum=true;sumFb();}else fbDec(s);drawPad3();});
  $$('[data-why]',box).forEach(b=>b.onclick=()=>{s.why=b.dataset.why;App.touch();drawPad3();});
  const mf=$('#l9-mf');if(mf)mf.oninput=()=>{s.mf=lim(mf.value,200);clearTimeout(mf._t);mf._t=setTimeout(App.touch,600);};
  const go=d=>{S.si+=d;sayS();drawPad3();};const pv=$('[data-pv]',box),nx=$('[data-nx]',box),ob=$('[data-obs]',box);if(pv)pv.onclick=()=>go(-1);if(nx)nx.onclick=()=>go(1);if(ob)ob.onclick=()=>{S.view3='obs';drawPad3();};};
 $('#l9-rev').onclick=async()=>{let used=false;if(nz(R.draft).length<60){R.draft=SAMPLE;R.fs=1;R.own=0;if(!(R.title||'').trim())R.title=EX_OL.title;dr.value=SAMPLE;dn();marks2b();used=true;}
  const b=$('#l9-rev'),draft=R.draft;
  if((R.sugs||[]).some(s=>s.d)&&R.rvd===hash(draft)){sayS();drawPad3();App.fb('#l9-fb3','try','初稿没变，建议还是这几条','接着一条一条做决定。改了初稿，才会重新审。');return;}
  App.busy(b,true,'AI 正在审…');App.aiSay('#l9-ai3','对照提纲和资料，一句一句读……',{busy:true});const cs=selCards();let list=null,mode=null,note='';
  if(!R.ol.secs.length)commit();
  if(App.AI.real()){const mat=(S.res.strict?resText(S.res.strict):cardsBlock(cs)).slice(0,1200);
   const r=await ask(`你是小学生研究报告的审阅老师。请审阅下面的报告初稿：1. 检查报告内容与提纲结构、重点是否匹配；2. 检查是否有可补充的资料；3. 检查报告逻辑、语言表达等方面是否存在问题；4. 提出修改建议。${SAFE}\n\n提纲：\n${olText(R)}\n\n整理好的资料：\n${mat}\n\n报告初稿：\n${draft}\n\n输出 JSON：{"suggestions":[{"cat":"结构|逻辑|补充|语言","problem":"一句话说明问题和建议","quote":"初稿中需要修改的原句，必须逐字摘自初稿；如果是新增内容就留空","fix":"建议改成的句子，或者建议补充的句子"}]}，共 6～8 条。`,{json:true});
   if(r&&r.cancel){App.busy(b,false);return;}
   if(r&&r.data&&Array.isArray(r.data.suggestions)){list=r.data.suggestions.slice(0,8).map(s=>({cat:['结构','逻辑','补充','语言'].includes(s.cat)?s.cat:'语言',p:lim(s.problem||'',120),q:lim(s.quote||'',150),f:lim(s.fix||'',200),k:'ai',at:s.quote?'':(/结论|总结|总之/.test(s.fix||'')?'end':'beforeLast')})).filter(s=>s.p);mode=r.mode;}
   else if(r&&r.err)note=r.err;}
  if(!list||!list.length){await wait(600);list=reviewDraft(draft,R,cs).map(s=>Object.assign({},s,{p:lim(s.p,120),q:lim(s.q,150),f:lim(s.f,200),note:lim(s.note||'',110)}));mode=null;}
  R.sugs=list.map((s,i)=>Object.assign({id:'s'+(i+1),d:null,why:''},s,s.q&&!draft.includes(s.q)?{qm:1}:{}));R.rm=mode||'offline';R.rnote=note?lim(note,80):'';R.rv=(R.rv||0)+1;R.rvd=hash(draft);S.one=null;S.si=0;S.view3='dec';S.sum=false;bump();App.touch();
  sayS();App.fb('#l9-fb3','find',`AI 提了 ${R.sugs.length} 条建议`,(used?'你还没写初稿，先用示例初稿练手。':'')+(mode?'AI 的建议不一定都对。一条一条看，你来决定。':'里面藏着不该听的。一条一条看，你来决定。'),{stars:1});
  drawPad3();marks3();App.busy(b,false);b.classList.add('again');};
 const marks3=()=>{const ss=R.sugs||[];if(R.rv)App.markStep(s3,0);if(ss.length&&ss.every(s=>s.d))App.markStep(s3,1);};

 /* ---- EXP-03b: my final (only what I accepted) vs AI's one-click rewrite ---- */
 const stmt=()=>{const h=R.help||{};const st=sugStats(R);const used=HELP.filter(([k])=>h[k]).map(x=>x[2]);
  return `【AI 帮助说明】本报告的研究问题、初稿和结论由我（我们）独立完成。${used.length?`AI 帮助了：${used.join('、')}。`:'（在上面如实点一点）'}${st.d?`AI 共提出 ${st.n} 条修改建议，我采纳 ${st.acc} 条、修改后采纳 ${st.mod} 条、没有采纳 ${st.rej} 条。`:''}核心观点和最终表述由我决定。`;};
 const helpAny=()=>Object.values(R.help||{}).some(Boolean);
 const fin=$('#l9-final');fin.value=R.final||'';
 const drawFin=()=>{grow(fin);$('#l9-stmt').textContent=stmt();$('#l9-savn').innerHTML=R.fAt?`已保存 <b>${nz(R.final).length}</b> 字${R.ed?` · 你亲手改了约 ${Math.max(1,Math.round(100*(R.edp||0)))}%`:' · 还没有亲手改过'}`:'';};
 const saveFinal=t=>{R.final=lim(t,900);R.fAt=Date.now();const ap=applyAll(R.draft,R.sugs||[]);R.ed=nz(ap)!==nz(R.final)?1:0;R.edp=Math.round((1-Math.min(retained(ap,R.final),retained(R.final,ap)))*100)/100;
  const nt=(R.final.split('\n')[0]||'').trim();if(nt&&nz(nt).length<=30)R.ftitle=lim(nt,30);App.touch();drawFin();marks3b();};
 const win3b=()=>{if(R.final&&R.ed&&helpAny()&&S.one&&!S.won){S.won=true;App.fb('#l9-fb3b','ok','这份定稿是你的了！','有你亲手改的地方，也注明了 AI 帮了什么。',{stars:3});}};
 fin.oninput=()=>{clearTimeout(fin._t);fin._t=setTimeout(()=>{const t=fin.value.trim();if(nz(t).length<60)return;saveFinal(t);win3b();},800);};
 const drawK3b=()=>{$('#l9-k-help').innerHTML=multi('help',HELP.map(x=>[x[0],x[1]]),HELP.filter(([k])=>R.help[k]).map(x=>x[0]));multiWire(s3b,'help',on=>{HELP.forEach(([k])=>{R.help[k]=on.includes(k)?1:0;});App.touch();drawFin();win3b();});};
 const OB3=[obs(lr.obs2,'q3','AI 生成的新报告，是基于报告初稿的内容结构和写作风格修改，还是重写一篇？',['基于初稿修改','大部分重写了','说不清'],()=>!!R.one,()=>R.one?`实测：保留了初稿 ${Math.round(R.one.sim*100)}% 的表达。`:''),
  {q:'修改报告时，你更倾向于哪种做法？',opts:ATT.map(a=>a[1]),get:()=>{const i=ATT.findIndex(a=>a[0]===lr.att.pick);return i<0?null:i;},set:j=>{const A=lr.att;A.pick=ATT[j][0];if(!A.first)A.first=A.pick;A.real=attGroup(R)||null;},en:()=>true,data:()=>{const g=attGroup(R);return g?`按你的真实决定，你的做法最接近「${ATT.find(x=>x[0]===g)[1]}」。`:'';}}];
 $('#l9-onego').onclick=async()=>{const ss=R.sugs||[],b=$('#l9-onego');if(!ss.length){App.fb('#l9-fb3b','try','还没有 AI 的建议','先回上一站，请 AI 审一审初稿，再来 PK。');return;}
  App.busy(b,true,'AI 正在改写…');App.aiSay('#l9-ai3b','把全部建议都用上，重写一遍……',{busy:true});const mine=applyAll(R.draft,ss);let text=null,mode=null,note='';
  if(App.AI.real()){const r=await ask(`下面是一位小学生的研究报告初稿和审阅建议。请根据全部建议，直接输出修改后的完整报告（只输出报告正文，不超过 600 字）。${SAFE}\n\n初稿：\n${R.draft}\n\n审阅建议：\n${ss.map((s,i)=>`${i+1}. ${s.p}${s.f?'（建议：'+s.f+'）':''}`).join('\n')}`,{onText:({text})=>App.aiSay('#l9-ai3b',`已经写了 ${nz(text).length} 字……`,{busy:true})});
   if(r&&r.cancel){App.busy(b,false);return;}if(r&&r.text){text=r.text.trim();mode=r.mode;}else if(r&&r.err)note=r.err;}
  if(!text){await wait(300);text=applyAll(R.draft,ss,true);}text=lim(text,1200);
  const ix=mkIdx(selCards().map(c=>c.text).concat([R.draft,olText(R)]));const bad=splitS(text).filter(s=>chk(s,ix).st==='no'),uns=bad.length,sim=retained(R.draft,text);
  S.one={text,mode,sim,uns};R.one={sim:Math.round(sim*100)/100,uns,m:mode||'offline'};bump();
  if(!R.final||!R.ed){fin.value=mine;saveFinal(mine);}else{fin.value=R.final;App.touch();drawFin();}
  const unsMine=splitS(R.final).filter(s=>chk(s,ix).st==='no').length;let html=esc(text);bad.forEach(s=>{html=html.replace(esc(s),`<mark class="l9-bad">${esc(s)}</mark>`);});
  App.aiSay('#l9-ai3b',`<div class="big">保留了你初稿 ${Math.round(sim*100)}% 的表达</div>${note?`<p class="note">${esc(note)}</p>`:''}<div class="l9-kv"><div><b class="${uns?'bad':'good'}">${uns}</b><span>句新加的话（标红）</span></div><div><b>${nz(text).length}</b><span>字（初稿 ${nz(R.draft).length} 字）</span></div></div><div class="l9-paper">${html}</div>${uns?'<p class="l9-flag">标红的话，资料、提纲和你的初稿里都找不到：留不留，要先核实。</p>':''}`,{mood:uns?'oops':'think',src:mode||'offline'});
  const und=ss.filter(s=>!s.d).length,pre=und?`还有 ${und} 条建议没决定，先按不采纳算。`:'';const stars=R.ed&&helpAny()?3:2;const tr=sugStats(R),todo=' 在左边亲手改一改，再点一点 AI 帮过你什么，拿满 3 颗星。';
  if(nz(R.final)===nz(text))App.fb('#l9-fb3b','try','两份一模一样！',pre+(tr.trap>tr.trapOk?'你把 AI 的建议全收了，有坑的也在里面。回上一站再想想。':'AI 的建议你全收了。每一条你都想过吗？回上一站再看看。'),{stars:1});
  else if(uns>unsMine)App.fb('#l9-fb3b','find',`AI 新加了 ${uns} 句，你的定稿${unsMine?`只有 ${unsMine} 句`:'一句也没加'}`,pre+'标红的是资料和初稿里都找不到的话。新加的话有依据才能留。'+todo,{stars});
  else App.fb('#l9-fb3b','find','哪一份更像你想说的话？',pre+'左边是你的定稿，右边是 AI 的。比一比：哪些话是你的，哪些不是？'+todo,{stars});
  S.won=stars===3;obsPad($('#l9-pad3b'),OB3,marks3b);marks3b();App.busy(b,false);b.classList.add('again');};
 const marks3b=()=>{if(R.one)App.markStep(s3b,0);if(R.final&&R.ed)App.markStep(s3b,1);};

 /* ---- TALK: who does which step? one card at a time ---- */
 const binName=acc=>BINS.filter(b=>acc.includes(b[0])).map(b=>b[1]).join(' 或 ');
 /* No auto-advance: the card stays, the feedback talks about THIS card, and the student can go back.
    Nothing is called right or wrong: the banner says whether the textbook sees it the same way, and why. */
 const jobFb=i=>{const so=lr.sort,[id,t,acc,why]=SORT[i],v=(so.a||{})[id];if(!v){$('#l9-fb4').innerHTML='';return;}const same=acc.includes(v),must=acc.length===1&&acc[0]==='me';
  App.fb('#l9-fb4',same?'ok':'find',same?'和教材的看法一样':`教材的看法：${esc(binName(acc))}`,esc(why)+(same?'':must?' 这一步，教材要求我们亲自做。':' 你有自己的理由，也可以坚持，说给同桌听听。'));};
 const drawJob=quiet=>{const so=lr.sort;so.a=so.a||{};const box=$('#l9-job'),N=SORT.length;const nDone=SORT.filter(x=>so.a[x[0]]).length;
  if(S.ji==null)S.ji=nDone>=N?N:SORT.findIndex(x=>!so.a[x[0]]);
  if(nDone)App.markStep(s4,0);
  if(S.ji>=N&&nDone>=N){const r=sortRes(so);if(!so.checked){so.first=r.ok;so.checked=1;App.touch();}App.markStep(s4,1);
   const diff=SORT.filter(([id,,acc])=>!acc.includes(so.a[id]));const cnt3=BINS.map(([k])=>SORT.filter(x=>so.a[x[0]]===k).length);
   box.innerHTML=`<div class="l9-vs">我的人机分工表</div><div class="l9-tbl3">${[2,1,0].map(j=>{const [k,n]=BINS[j];return `<div><b>${n}（${cnt3[j]}）</b>${SORT.filter(x=>so.a[x[0]]===k).map(([id,t,acc])=>`<span class="${acc.includes(k)?'':'df'}">${esc(t)}</span>`).join('')||'<span class="none">（空着）</span>'}</div>`;}).join('')}</div>
    ${diff.length?`<p class="l9-data">虚线框的 ${diff.length} 个环节，教材的看法和你不一样：</p><ul class="l9-miss">${diff.map(([,t,acc,why])=>`<li><b>${esc(t)}</b>　教材的看法：${esc(binName(acc))}。${esc(why)}</li>`).join('')}</ul>`:''}
    <div class="row"><button type="button" class="btn ghost sm" data-pv>回去改一改</button><button type="button" class="btn ghost sm" id="l9-again">全部重判</button></div>`;
   $('[data-pv]',box).onclick=()=>{S.ji=N-1;drawJob();jobFb(S.ji);};$('#l9-again').onclick=()=>{so.a={};S.ji=0;App.touch();$('#l9-fb4').innerHTML='';drawJob();};
   if(!quiet)App.fb('#l9-fb4','find',`分工表排好了：${cnt3[2]} 个环节留给自己`,`${cnt3[1]} 个让 AI 帮忙、人把关，${cnt3[0]} 个主要靠 AI。教材说必须亲自做的 ${r.me} 个关键环节，你留给自己 ${r.meOk} 个。${diff.length?`有 ${diff.length} 个和教材看法不同，看看上面的理由。`:''}`,{stars:r.meOk>=r.me?3:2});return;}
  const i=S.ji=clamp(S.ji,0,N-1),[id,t]=SORT[i],cur=so.a[id];
  box.innerHTML=`<div class="l9-job"><small>第 ${i+1} / ${N} 个环节 · 这件事谁来干？</small>${esc(t)}</div><div class="l9-bins">${BINS.map(([k,n])=>`<button type="button" class="chip big ${cur===k?'on':''}" data-sb="${k}">${n}</button>`).join('')}</div>
   <div class="row">${i?'<button type="button" class="btn ghost sm" data-pv>上一个</button>':''}${cur?`<button type="button" class="btn sm" data-nx>${i<N-1?'下一个':nDone>=N?'看我的分工表':'下一个'}</button>`:''}<span class="l9-data">已判 <b>${nDone}</b>/${N}</span></div>`;
  $$('[data-sb]',box).forEach(b=>b.onclick=()=>{so.a[id]=b.dataset.sb;App.touch();drawJob();jobFb(i);});
  const pv=$('[data-pv]',box),nx=$('[data-nx]',box);if(pv)pv.onclick=()=>{S.ji=i-1;drawJob();jobFb(S.ji);};
  if(nx)nx.onclick=()=>{if(i<N-1){S.ji=i+1;drawJob();jobFb(S.ji);}else{const k=SORT.findIndex(x=>!so.a[x[0]]);S.ji=k<0?N:k;drawJob();if(k>=0)jobFb(k);}};};

 /* initial draw + restore */
 const resetAll=()=>{drawSrc();const d=$('#l9-desk');d.dataset.key='';drawDesk();drawCards();drawPr();aspEl.value=O.asp||defAsp();initW();drawK2();drawOL();};
 resetAll();aspRow();drawBd();drawK3b();drawFin();dn();drawJob(1);
 if(lr.warm){App.markStep(s0,0);App.markStep(s0,1);}marks1();marks1b();marks2();marks2b();marks3();marks3b();
 if((R.sugs||[]).length){sayS();drawPad3();App.ran(s3);}
 L._refresh=()=>{requestAnimationFrame(()=>drawDesk());};
 if(window.ResizeObserver)[dr,fin].forEach(el=>new ResizeObserver(()=>{if(!el.offsetParent||el._g||Math.abs(el.scrollHeight-el.clientHeight)<8)return;el._g=1;grow(el);requestAnimationFrame(()=>{el._g=0;});}).observe(el));
 if(window.ResizeObserver){let rw=0;new ResizeObserver(()=>{const w=$('#l9-desk').clientWidth;if(w&&w!==rw){rw=w;drawDesk();}}).observe($('#l9-desk'));}

 App.quiz($('#l9-quiz'),K,QUIZ);
 const rd=App.diary($('#l9-diary'),K,{title:'我的研究报告',lead:'带上报告和决策记录，写写新看法',
  fields:[{id:'steps',q:'在整理资料、撰写报告的过程中，哪些环节可以依靠 AI？哪些环节我们必须亲自参与？',ph:'可以依靠 AI 的有……；必须亲自参与的有……，因为……'},
   {id:'collab',q:'你对“人类如何与 AI 协作”有什么新看法？你总结了哪些使用 AI 辅助学习的方法？',ph:'我发现……；我的方法是：1. ……'},
   {id:'next',q:'你还想借助 AI 完成什么主题的研究报告？打算怎样分工？',ph:'我想研究……，我会让 AI 帮忙……，自己负责……'}],
  pledge:'报告的核心观点和最终表述由我决定；我会在报告里注明 AI 帮助了哪些部分，不把 AI 生成的内容当成自己的作品。',
  extras:ex=>{const l=App.lesson(K);const r=l.rep||{},o=l.org||{},ds=(r.sugs||[]).filter(s=>s.d);const a=ds.filter(s=>s.d==='acc').length,m=ds.filter(s=>s.d==='mod').length,rj=ds.filter(s=>s.d==='rej').length;const g=attGroup(r);
   ex.innerHTML=`<div class="l9-ex"><div><div class="box-t">我的研究报告</div>${r.final?`<div class="l9-paper">${esc(r.final)}</div><p class="note">${nz(r.final).length} 字 · 初稿 ${nz(r.draft).length} 字${r.fs?`（由示例初稿改写，自己写的约 ${Math.round((r.own||0)*100)}%）`:''}</p>`:`<p class="note">${r.draft?'初稿已写好，还没有定稿。':'还没有写报告。'}</p>`}</div>
    <div><div class="box-t">修改决策记录</div>${ds.length?`<p>AI 提出 ${(r.sugs||[]).length} 条建议：<b style="color:var(--mint-d)">采纳 ${a}</b> · <b style="color:var(--sun-d)">修改后采纳 ${m}</b> · <b style="color:var(--coral-d)">不采纳 ${rj}</b>；选了理由的 ${ds.filter(s=>(s.why||'').trim().length>=4).length} 条。${g?`我的做法最接近「${ATT.find(x=>x[0]===g)[1]}」。`:''}</p><div class="l9-log">${ds.slice(0,8).map(s=>{const[n,ic,c]=DEC[s.d];return `<div><span class="ic" style="color:${c}">${ic}</span><span style="color:${c}">${n}</span><span>${esc(cut(s.p,34))}${s.why?`<br><span class="note">理由：${esc(s.why)}</span>`:''}</span></div>`;}).join('')}</div>`:'<p class="note">还没有对 AI 的审阅建议作出决定。</p>'}</div>
    <div><div class="box-t">整理魔法棒</div><p>整理 ${(o.runs&&((o.runs.plain||{}).n||0)+((o.runs.strict||{}).n||0))||0} 次，换角度 ${o.rounds||0} 次（${(o.angles||[]).map(x=>(ANG[x]||[x])[0]).join('、')||'无'}）。${o.spot&&o.spot.done?`AI 多写了 ${o.spot.tot} 句，我抓住 ${o.spot.tp} 句。`:''}${o.uns&&o.uns.strict!=null&&o.uns.plain!=null?` 加约束后：${o.uns.plain} 句 → ${o.uns.strict} 句。`:''}</p></div>
    ${Object.values(r.help||{}).some(Boolean)?`<div class="l9-stmt">${esc(stmt())}</div>`:''}</div>`;}});
 App.on(()=>{if(App.current===K)rd();});
}
L.onShow=()=>{if(L._refresh)L._refresh();};
L.onHide=()=>{stopAll();};

/* ---------- hooks ---------- */
/* reasons are now picked from short chips (RSN), so 6 characters already count as a full reason */
const reasonQ=s=>{const t=nz(s.why);if(!t)return 0;return Math.min(1,t.length/6)*(/因为|所以|资料|观点|意思|依据|出处|太长|重复|改变|没有|不对|不是|更|原来|自己|核实|查证|问题|说法/.test(s.why)?1:0.7);};
function sugStats(r){const ss=r.sugs||[];const ds=ss.filter(s=>s.d);const tr=ss.filter(s=>s.k==='trap'&&s.d);return {n:ss.length,d:ds.length,acc:ds.filter(s=>s.d==='acc').length,mod:ds.filter(s=>s.d==='mod').length,rej:ds.filter(s=>s.d==='rej').length,trap:tr.length,trapOk:tr.filter(s=>s.d!=='acc').length,rq:ds.length?ds.reduce((a,s)=>a+reasonQ(s),0)/ds.length:0};}
L.score=lr=>{const Q=lr.quiz||{},qs=id=>Q[id]?(Q[id].ok?100:0):0,tx=App.txtScore,D=lr.diary||{},o=lr.org||{},ru=o.runs||{},ob=lr.obs1||{},r=lr.rep||{},ob2=lr.obs2||{},at=lr.att||{},th=lr.th1||{};
 const sp=o.spot||{};const f1=sp.tot?(2*sp.tp)/((2*sp.tp+sp.fp+sp.fn)||1):(sp.fp?0.5:1);const st=sugStats(r);const so=sortRes(lr.sort);const sorted=!!(lr.sort||{}).checked;
 const secs=((r.ol||{}).secs||[]).filter(s=>s&&(s.h||'').trim()).length;const dl=nz(r.draft).length;
 return {principle:0.2*qs('q1')+0.2*qs('q3')+0.15*qs('q5')+(sorted?25*so.ok/so.n:0)+0.2*Math.max(tx(th.adv,25),tx(D.steps,30)),
  experiment:(ru.plain?15:0)+(ru.strict?15:0)+30*Math.min(1,(o.angles||[]).length/3)+8*['q1','q2','q3'].filter(k=>ob[k]!=null).length+16*Math.min(1,(o.rounds||0)/3),
  prompt:(ru.strict?25:0)+((o.angles||[]).includes('aspects')?20:0)+0.15*Math.max(tx(o.extra,8),tx(o.asp,6))+(r.oN?15:0)+(r.rv?15:0)+0.1*qs('q2'),
  critical:(sp.done?35*f1:0)+(st.trap?20*st.trapOk/st.trap:0)+25*st.rq+10*['q1','q2','q3'].filter(k=>ob2[k]!=null).length/3+0.1*qs('q4'),
  creative:0.3*tx(r.draft,300)+(dl>=60?20*(r.fs?clamp((r.own||0)/0.4,0,1):1):0)+(r.final?25:0)+((r.title||'').trim()?5:0)+20*Math.min(1,secs/3),
  ethics:(D.pledge?25:0)+(Object.values(r.help||{}).some(Boolean)?25:0)+Math.max(0.2*tx(at.why,25),at.pick?20:0)+0.15*tx(D.collab,30)+(sorted&&so.me?15*so.meOk/so.me:0)};};
L.progress=lr=>{const o=lr.org||{},ru=o.runs||{},r=lr.rep||{},ob=lr.obs1||{},ss=r.sugs||[];const secs=((r.ol||{}).secs||[]).filter(s=>s&&(s.h||'').trim()).length;
 const m=[!!lr.warm,!!(ru.plain&&ru.strict),!!(o.spot||{}).done,(o.angles||[]).length>=2,['q1','q2','q3'].every(k=>ob[k]!=null),secs>=2&&!!r.oN,nz(r.draft).length>=120&&!!r.rv,ss.length>0&&ss.every(s=>s.d),!!r.final&&!!(lr.att||{}).pick,!!(lr.sort||{}).checked,Object.keys(lr.quiz||{}).length>=5,!!(lr.diary||{}).submitted];
 return m.filter(Boolean).length/m.length;};
L.quiz=QUIZ;
L.flow=[
 {seg:'导入',from:'l9-s0'},
 {seg:'挑战一',kp:'知识点一 · AI 提炼总结资料',learn:['AI 能快速提取关键信息、合并重复，让资料简练易读','没有明确要求时，AI 可能不合要求，甚至自行补充内容','先定好写哪几方面，再加约束“只根据我提供的资料”'],sum:['普通整理多出资料里找不到的句子，加约束后变少','按“我定的方面”整理，结果更有针对性、更有条理'],from:'l9-s1',to:'l9-s1'},
 {seg:'挑战二（上）',kp:'知识点二 · 研究报告的思路与提纲',learn:['研究工作四步：明确问题、确定方法、整理分析、得出结论','先定题目，想好开头、中间、结尾，再列出提纲','初稿在不借助 AI 的情况下自己写'],sum:['AI 能指出提纲漏掉的部分，如研究方法、研究结论','提纲建议不一定都对，采纳与否由自己决定'],from:'l9-s2',to:'l9-s2'},
 {seg:'挑战二（下）',kp:'知识点三 · 有选择地采纳 AI 的建议',learn:['AI 能检查结构、可补充的资料、逻辑和语言','AI 不了解我们的写作意图，建议不一定都有参考价值','不直接使用 AI 生成的内容，判断后有选择地采纳'],sum:['有的建议会改掉我的观点，或补进没有依据的内容','一键改写照单全收建议，要逐条判断、亲手修改'],from:'l9-s3',to:'l9-s3'},
 {seg:'综合运用',from:'l9-s4'},
 {seg:'反思与总结',from:'l9-quizst'}
];
L.diaryTitle='我的研究报告';
L.diaryQ=[['steps','哪些环节靠 AI、哪些亲自做'],['collab','人与 AI 怎样协作'],['next','还想研究的主题']];
L.works=lr=>{const o=[];const r=lr.rep||{};const st=sugStats(r);
 if(r.final)o.push({t:'我的研究报告 · '+(r.ftitle||r.title||'研究报告'),s:`${cut(r.final.split('\n').slice(1).join(' ').trim()||r.final,46)}｜AI 建议 ${st.n} 条：采纳 ${st.acc}、修改后采纳 ${st.mod}、不采纳 ${st.rej}`,glyph:'报'});
 const org=lr.org||{};if((org.angles||[]).length>=2||(org.spot||{}).done)o.push({t:'整理魔法棒 · 资料整理实验',s:`换了 ${(org.angles||[]).length} 个角度整理${(org.spot||{}).done?`；核查出 ${org.spot.tot} 句“资料里找不到”，自己找对 ${org.spot.tp} 句`:''}`,glyph:'整'});
 return o;};
L.expCount=lr=>lr.nExp||0;
const grpName={all:'全盘接受',sel:'有选择接受',manual:'手动为主'};
L.classPanels=recs=>{const R=recs.map(r=>(r.lessons||{})[K]||{}).filter(l=>Object.keys(l).length);if(!R.length)return '';
 const bar=(n,v,tot,col,lab)=>`<div class="hbar"><span>${n}</span><span class="tr"><i style="width:${tot?100*v/tot:0}%;background:${col}"></i></span><span>${lab!=null?lab:v}</span></div>`;
 const sp=R.map(l=>(l.org||{}).spot).filter(s=>s&&s.done);const tot=sp.reduce((a,s)=>a+(s.tot||0),0),tp=sp.reduce((a,s)=>a+(s.tp||0),0),fp=sp.reduce((a,s)=>a+(s.fp||0),0);
 const un=R.map(l=>(l.org||{}).uns).filter(u=>u&&u.plain!=null&&u.strict!=null);const avg=k=>un.length?(un.reduce((a,u)=>a+u[k],0)/un.length).toFixed(1):'—';
 const angN=Object.keys({topic:1,time:1,question:1,table:1,aspects:1}).map(k=>[k,R.filter(l=>((l.org||{}).angles||[]).includes(k)).length]);const AN={topic:'按主题',time:'按时间',question:'按问题',table:'表格',aspects:'我定的方面'};
 const st=R.map(l=>sugStats(l.rep||{}));const A=st.reduce((a,s)=>a+s.acc,0),M=st.reduce((a,s)=>a+s.mod,0),J=st.reduce((a,s)=>a+s.rej,0),T=A+M+J;const tr=st.reduce((a,s)=>a+s.trap,0),trA=st.reduce((a,s)=>a+(s.trap-s.trapOk),0);
 const grp={all:0,sel:0,manual:0};R.forEach(l=>{const g=attGroup(l.rep||{});if(g)grp[g]++;});const gN=grp.all+grp.sel+grp.manual;
 const pk={all:0,sel:0,manual:0};R.forEach(l=>{const p=(l.att||{}).pick;if(p&&pk[p]!=null)pk[p]++;});const pN=pk.all+pk.sel+pk.manual;
 const fun=[['写好初稿（≥120 字）',R.filter(l=>nz((l.rep||{}).draft).length>=120).length],['请 AI 审阅',R.filter(l=>(l.rep||{}).rv).length],['逐条决定完',R.filter(l=>{const s=(l.rep||{}).sugs||[];return s.length&&s.every(x=>x.d);}).length],['保存定稿',R.filter(l=>(l.rep||{}).final).length],['注明 AI 帮助',R.filter(l=>Object.values((l.rep||{}).help||{}).some(Boolean)).length]];
 return `<div class="box"><div class="box-t">第9讲 · 整理魔法棒：“资料里找不到”核查</div>
   ${bar('学生找出的比例（检出率）',tp,tot,'var(--green)',tot?Math.round(100*tp/tot)+'%':'—')}${bar('误判（其实资料里有）',fp,tp+fp,'var(--amber)',tp+fp?Math.round(100*fp/(tp+fp))+'%':'—')}
   <p class="note" style="margin:4px 0 8px">${sp.length} 人完成核查，程序共标出 ${tot} 句，学生找对 ${tp} 句。每人平均：普通整理 ${avg('plain')} 句 → 加约束 ${avg('strict')} 句（${un.length} 人）</p>
   <b style="font-size:13px">尝试过各整理角度的人数</b>${angN.map(([k,v])=>bar(AN[k],v,R.length,'var(--cyan)')).join('')}</div>
  <div class="box"><div class="box-t">第9讲 · 报告协作台：采纳 / 拒绝与修改态度</div>
   <b style="font-size:13px">对 AI 审阅建议的决定（共 ${T} 条）</b>${bar('采纳',A,T,'var(--green)')}${bar('修改后采纳',M,T,'var(--amber)')}${bar('不采纳',J,T,'var(--red)')}
   <p class="note" style="margin:4px 0 8px">“需要判断”的建议（会改变观点 / 资料里没有依据）共 ${tr} 条，被直接采纳 ${trA} 条（${tr?Math.round(100*trA/tr):0}%）。</p>
   <b style="font-size:13px">实际修改态度（按真实采纳情况，${gN} 人）　<span class="note">自己的倾向 ${pN} 人</span></b>${['all','sel','manual'].map(k=>`<div class="hbar"><span>${grpName[k]}</span><span class="tr" style="display:flex;flex-direction:column;gap:2px;height:12px"><i style="width:${gN?100*grp[k]/gN:0}%;background:var(--violet);height:5px"></i><i style="width:${pN?100*pk[k]/pN:0}%;background:var(--cyan);height:5px"></i></span><span>${grp[k]} / ${pk[k]}</span></div>`).join('')}
   <p class="note" style="margin:2px 0 8px"><span style="color:var(--violet)">■</span> 实际做法　<span style="color:var(--cyan)">■</span> 自己选的倾向</p>
   <b style="font-size:13px">报告完成情况（人数）</b>${fun.map(([n,v])=>bar(n,v,R.length,'var(--green)')).join('')}</div>`;};
L.classSug=recs=>{const R=recs.map(r=>(r.lessons||{})[K]||{}).filter(l=>Object.keys(l).length);if(!R.length)return [];const out=[];
 const st=R.map(l=>sugStats(l.rep||{}));const tr=st.reduce((a,s)=>a+s.trap,0),trA=st.reduce((a,s)=>a+(s.trap-s.trapOk),0);
 if(tr>=4&&trA/tr>=0.3)out.push(`第9讲报告协作台里，“会改变观点或没有依据”的 AI 建议被直接采纳了 ${trA}/${tr} 次（${Math.round(100*trA/tr)}%）：投影一位学生的修改决策记录，追问“这条建议改的是谁的观点？资料里有依据吗？”，再请学生补写不采纳的理由。`);
 const sp=R.map(l=>(l.org||{}).spot).filter(s=>s&&s.done);const tot=sp.reduce((a,s)=>a+(s.tot||0),0),tp=sp.reduce((a,s)=>a+(s.tp||0),0);
 if(tot>=5&&tp/tot<0.6)out.push(`整理魔法棒的逐句核查中，学生只找出了 ${Math.round(100*tp/tot)}% 的“资料里找不到”句子：示范拿一句 AI 补充的话，回到资料卡里逐字查找，强调“读着顺 ≠ 资料里有”，再强调加“只根据我提供的资料”的约束。`);
 const grp={all:0,sel:0,manual:0};R.forEach(l=>{const g=attGroup(l.rep||{});if(g)grp[g]++;});const gN=grp.all+grp.sel+grp.manual;
 if(out.length<2&&gN>=4&&grp.all/gN>=0.3)out.push(`有 ${grp.all} 名学生对 AI 建议全盘接受。可以展示“一键改写版”保留初稿的比例，讨论教材问题：“AI 指出的问题一定要修改吗？”`);
 const fin=R.filter(l=>(l.rep||{}).final).length,rev=R.filter(l=>(l.rep||{}).rv).length;
 if(out.length<2&&rev>=3&&fin/rev<0.6)out.push(`${rev} 名学生请 AI 审阅了初稿，但只有 ${fin} 人保存了定稿：留 8 分钟，让学生按自己的决定生成定稿、亲手修改，并勾选“AI 帮助说明”。`);
 return out.slice(0,2);};
L.demo=(rnd,t)=>{const p=x=>rnd()<x;const pk=a=>a[Math.floor(rnd()*a.length)];const lr={src:'pack'};lr.warm=p(.55+t*.4)?1:0;
 const o={runs:{},angles:[],rounds:0};if(p(.5+t*.5))o.runs.plain={n:1+Math.floor(rnd()*2),m:'offline'};if(p(.3+t*.65))o.runs.strict={n:1,m:'offline'};
 if(o.runs.plain&&o.runs.strict){o.uns={plain:3,strict:0};if(p(.35+t*.6)){const tp=Math.min(3,Math.round(3*clamp(t*0.9+rnd()*0.4-0.1,0,1)));o.spot={done:1,tot:3,tp,fp:p(.6-t*.4)?1+Math.floor(rnd()*2):0,fn:3-tp};}}
 const A=['topic','aspects','time','question','table'];const na=o.runs.plain?Math.min(5,Math.floor(rnd()*4.2*t+(p(.5)?1:0))):0;o.angles=A.slice(0,na);if(na===1&&p(.5))o.angles=[pk(['topic','time'])];o.rounds=na+(na&&p(.3)?1:0);if(o.angles.includes('aspects'))o.asp=pk(['饮食习惯、活动规律、社交行为','吃什么、住哪里、怎样保护']);if(p(t*.4))o.extra='每部分不超过三条要点';lr.org=o;
 lr.obs1={};if(o.runs.plain&&p(.4+t*.6))lr.obs1.q1=p(.85)?0:1;if(na>=2&&p(.3+t*.6))lr.obs1.q2=p(.75)?0:1;if(o.spot&&p(.4+t*.6))lr.obs1.q3=p(.85)?0:1;
 lr.th1=p(t)?{adv:pk(['AI 一下子就能把十几张资料卡合并起来，还能去掉重复的句子。','整理得很快，还能分好类，比自己抄省时间。']),why:p(t)?'提示词没有说清楚要从哪些方面整理，可以把方面写进提示词。':''}:{};
 const r={};const go=p(.35+t*.6);
 if(go){r.title='大熊猫的生活习性';r.q=p(.8)?'大熊猫吃什么、住在哪里、每天怎样生活？':'';r.methods=p(.7)?['查阅书籍和资料','用 AI 搜索并核实来源'].slice(0,1+Math.floor(rnd()*2)):[];
  const n=2+Math.floor(rnd()*2);r.ol={open:'研究缘由；研究问题',secs:EX_OL.secs.slice(0,n).map(s=>Object.assign({},s)),end:p(.6)?'研究结论；感想':'感想'};r.oN=p(.4+t*.5)?1:0;if(r.oN)r.osugs=[{c:'结构',p:'开头没有写研究方法。',d:p(.8)?'acc':'rej'},{c:'逻辑',p:'建议调整顺序',d:p(t)?'rej':'acc',opt:1}];
  r.fs=p(.75)?1:0;r.draft=r.fs?SAMPLE:'大熊猫的生活习性\n'+'我们研究了大熊猫吃什么、住在哪里。'.repeat(4);r.own=r.fs?Math.round(clamp(t*0.5*rnd()+0.05,0,0.6)*100)/100:1;
  if(p(.3+t*.6)){r.rv=1;r.rm='offline';const KIND=[['逻辑','rule'],['结构','rule'],['语言','opt'],['语言','rule'],['语言','rule'],['逻辑','trap'],['补充','rule'],['结构','rule'],['补充','trap']];
   const sel=t>0.6;const nd=p(.4+t*.6)?KIND.length:Math.floor(rnd()*KIND.length);
   r.sugs=KIND.map(([c,k],i)=>{const s={id:'s'+(i+1),cat:c,p:'示例建议 '+(i+1),q:'',f:'',k,d:null,why:''};if(i<nd){if(k==='trap')s.d=sel?(p(.7)?'rej':'mod'):(p(.6)?'acc':'rej');else if(k==='opt')s.d=p(.5)?'rej':'acc';else s.d=sel?pk(['acc','acc','mod','mod','rej']):pk(['acc','acc','acc','acc','mod']);if(p(.3+t*.6))s.why=s.d==='rej'?pk(['这会改变我的观点。','资料里没有依据，不能直接写。','我觉得原来的更好。']):pk(['这句确实太长了。','资料里有，可以补充。','好。']);}return s;});
   if(nd===KIND.length&&p(.4+t*.5)){r.final='大熊猫的生活习性\n'+'（定稿正文示例）'.repeat(8);r.fAt=1;r.ed=sel&&p(.7)?1:0;r.edp=r.ed?Math.round((0.03+rnd()*0.25)*100)/100:0;r.help=p(.5+t*.4)?{org:1,rev:1,pol:p(.5)?1:0}:{};}
   if(p(.2+t*.5)){r.one={sim:Math.round((0.55+rnd()*0.35)*100)/100,uns:p(.6)?1:2,m:'offline'};}}}
 lr.rep=r;lr.obs2={};if(r.sugs&&p(.5+t*.4)){lr.obs2.q1=p(.6)?1:0;lr.obs2.q2=p(.7)?1:0;if(r.one)lr.obs2.q3=p(.75)?0:1;}
 lr.att={};if(r.final||p(t*.5)){const g=attGroup(r);lr.att.pick=p(.7)&&g?g:pk(['sel','manual','all']);lr.att.real=g;lr.att.why=p(t)?'我会先自己判断建议有没有道理，再决定要不要改，因为报告是我写的。':'';lr.att.must=p(t)?'不一定，有的建议会改掉我的观点。':'';}
 lr.sort={};if(p(.3+t*.6)){lr.sort.a={};SORT.forEach(([id,,acc])=>{lr.sort.a[id]=p(.45+t*.5)?acc[0]:pk(['ai','co','me']);});lr.sort.checked=1;}
 const q=(id,pp)=>{const ok=p(pp);const a=QUIZ.find(x=>x.id===id).a;return {first:ok?a:(a+1)%3,ok,last:a};};
 if(p(.3+t*.7))lr.quiz={q1:q('q1',.6+t*.4),q2:q('q2',.7+t*.3),q3:q('q3',.65+t*.35),q4:q('q4',.6+t*.4),q5:q('q5',.5+t*.45)};
 if(p(.2+t*.7))lr.diary={steps:p(t+.2)?'整理资料、找长句可以让 AI 帮忙；研究问题、核心观点和最后的决定必须自己来。':'AI 帮忙。',collab:p(t+.1)?'AI 是帮手，不是作者。我会先自己写，再请 AI 提意见，最后自己决定。':'',next:p(t)?'我想研究校园里的鸟，请 AI 帮忙整理资料，观察和结论自己做。':'研究恐龙。',pledge:p(.8),submitted:p(t+.1)?1:0};
 lr.nExp=((o.runs.plain||{}).n||0)+((o.runs.strict||{}).n||0)+o.rounds+(r.oN||0)+(r.rv||0)+(r.one?1:0);
 return lr;};
})();
