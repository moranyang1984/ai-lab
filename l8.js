/* 第8讲 资料侦探社 (v3) — 导入 图书馆还是 AI / EXP-01 研究小助手 / EXP-01b 提示词设计器 / EXP-02 真假资料侦探 / CASE 识破“专业”假资料 / EXP-03 报告里的假资料 / FAVS 资料收藏夹（第9讲读取 lr.fav） */
(function(){
const {$,$$,esc,clamp}=App;const K='l8';const L={};App.lessons[K]=L;
const NOW_Y=Math.max(2025,new Date().getFullYear());
const cut=(s,n)=>{const a=[...String(s||'')];return a.length>n?a.slice(0,n).join('')+'…':a.join('');};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

/* ---------- source types (generic, never real organisations) ---------- */
const SRC={gov:{n:'政府部门官网（示例）',a:3},sci:{n:'国家级科研机构官网（示例）',a:3},media:{n:'权威媒体报道（示例）',a:3},wiki:{n:'百科词条（示例）',a:2},blog:{n:'个人博客（示例）',a:1},mkt:{n:'营销号文章（示例）',a:0},forum:{n:'论坛回帖（示例）',a:0}};
const AUTH=['不可靠渠道，要格外警惕','个人发布，未经审核，需核实','可参考，要和权威来源核对','权威渠道，通常经过审核'];
const TAGS=['食性','活动','栖息地','繁殖','保护','身体','其他'];

/* ---------- built-in corpus: 22 资料卡 about giant pandas. tr: ok = true · doubt = outdated / needs care · bad = false (辨别练习) ---------- */
const C=[
 {id:'c01',s:'sci',d:'2024-04',t:'大熊猫的主要食物',x:'大熊猫的食物中约 99% 是竹子，竹笋、竹叶和竹茎都吃。不同季节会挑选不同的部位，竹笋长出来的季节，它们特别爱吃鲜嫩的竹笋。',tags:['食性'],cite:1,tr:'ok',
  ans:'ok',alt:[],keys:['auth','cite','agree'],ag:['c21','c02'],cf:['c04'],why:'来自国家级科研机构官网（示例），注明了发布机构和日期；“主要吃竹子”和百科、媒体的说法互相印证。'},
 {id:'c02',s:'media',d:'2023-09',t:'每天吃竹子要花多长时间？',x:'竹子营养少，大熊猫只好“多吃”。成年大熊猫每天要花 10～16 小时进食，吃掉约 12～38 千克竹子，吃饱了就找地方休息。',tags:['食性','活动'],cite:1,tr:'ok',
  ans:'ok',alt:[],keys:['auth','cite','agree'],ag:['c11','c08'],cf:['c03'],why:'权威媒体报道（示例），有日期；科研机构说大熊猫只能消化约 17% 的竹子，正好解释了为什么要吃这么多、吃这么久。'},
 {id:'c03',s:'blog',d:'2024-03',t:'大熊猫肠道菌群消化机制研究综述',x:'据国外权威期刊最新研究，大熊猫肠道内的“高效纤维素裂解菌群”可将竹子的消化率提升至 87.3%，能量代谢效率是普通食草动物的 3.6 倍。因此，成年大熊猫每天只需进食约 2.4 千克竹子，即可满足全部能量需求。',tags:['食性'],cite:0,tr:'bad',
  ans:'bad',alt:[],keys:['weak','nocite','conflict','num','sense'],ag:[],cf:['c11','c02'],why:'看起来很专业：有专业名词，有精确到小数点的数字。但“国外权威期刊”是哪一本、作者是谁都没写，发布者只是个人博客；更关键的是，它和两条可靠资料矛盾——科研机构说只能消化约 17%，媒体说每天要吃 12～38 千克。'},
 {id:'c04',s:'mkt',d:'2025-06',t:'震惊！大熊猫其实最爱吃肉，竹子只是零食',x:'99% 的人都不知道！大熊猫是猛兽，顿顿离不开肉，动物园怕它们太凶才只喂竹子。赶紧转给身边的朋友看看吧！',tags:['食性'],cite:0,tr:'bad',
  ans:'bad',alt:[],keys:['weak','nocite','conflict','hype','sense'],ag:[],cf:['c01','c21'],why:'标题党、语气夸张，还催人转发；“顿顿离不开肉”和“食物中约 99% 是竹子”矛盾。它把“偶尔吃一点肉”夸大成了“最爱吃肉”。'},
 {id:'c05',s:'forum',d:'2022-12',t:'回帖：熊猫冬天要冬眠吧？',x:'当然要冬眠！大熊猫和黑熊一样，一到冬天就钻进树洞里睡上三四个月，春天才出来。',tags:['活动'],cite:0,tr:'bad',
  ans:'bad',alt:[],keys:['weak','nocite','conflict','sense'],ag:[],cf:['c18'],why:'论坛回帖，没有任何出处；和权威媒体报道“大熊猫不冬眠，冬天会迁到海拔低一些的地方”矛盾。看到别的熊冬眠，就以为大熊猫也冬眠，是“想当然”。'},
 {id:'c06',s:'wiki',d:'2003-05',t:'野生大熊猫有多少只（旧版词条）',x:'根据全国调查，我国野生大熊猫约有 1100 只，数量很少，处于濒危状态。',tags:['保护'],cite:1,tr:'doubt',
  ans:'doubt',alt:['bad'],keys:['old','conflict'],ag:[],cf:['c13','c14'],why:'这条资料当年有依据（20 世纪 80 年代的调查约 1100 只），但已经过时：2015 年公布的第四次全国调查是 1864 只，2021 年我国把大熊猫的受威胁等级从“濒危”调整为“易危”。资料一定要看日期。'},
 {id:'c07',s:'gov',d:'2021-10',t:'大熊猫国家公园正式设立',x:'2021 年，我国正式设立第一批国家公园，其中包括大熊猫国家公园。它跨四川、陕西、甘肃三省，把大熊猫的主要栖息地连成一片，加以保护。',tags:['保护','栖息地'],cite:1,tr:'ok',
  ans:'ok',alt:[],keys:['auth','cite','agree'],ag:['c12','c14'],cf:[],why:'政府部门官网（示例）发布，有日期；“川陕甘三省”和科研机构介绍的分布范围一致。'},
 {id:'c08',s:'blog',d:'2025-08',t:'游记：在熊猫基地看了一整天',x:'我在大熊猫基地待了一天。听讲解员说，大熊猫一天里大部分时间不是在吃竹子，就是在睡觉，吃完一顿就躺下休息。真想再去一次！',tags:['活动','食性'],cite:0,tr:'doubt',
  ans:'doubt',alt:['ok'],keys:['weak','nocite','agree'],ag:['c02'],cf:[],why:'个人游记，来源不权威，也没有出处；但它说的内容能在权威媒体报道里找到印证（每天花很长时间进食，吃饱就休息）。可以作参考，写报告时最好引用权威来源的说法。'},
 {id:'c09',s:'mkt',d:'2024-11',t:'99%的人不知道！大熊猫竟然有“六根手指”',x:'大熊猫前掌除了五个指头，还有一个由腕骨变成的突起，叫“伪拇指”，能像手指一样帮它握住竹子。',tags:['身体'],cite:0,tr:'doubt',
  ans:'doubt',alt:['ok'],keys:['weak','hype','agree','nocite'],ag:['c20'],cf:[],why:'标题夸张，来源是营销号；但内容能在科研机构官网上核实——那是腕骨特化形成的“伪拇指”，并不是真的第六根手指。引用时要用可靠来源的准确说法。'},
 {id:'c10',s:'media',d:'2024-08',t:'刚出生的大熊猫宝宝有多大？',x:'大熊猫幼崽刚出生时只有 100 克左右，大约是妈妈体重的千分之一，全身粉红、毛很少，眼睛也睁不开，要靠妈妈细心照顾。',tags:['繁殖'],cite:1,tr:'ok',
  ans:'ok',alt:[],keys:['auth','cite','agree'],ag:['c22'],cf:['c19'],why:'权威媒体报道（示例），有日期，和科研机构的说法一致；和它矛盾的只有一条论坛回帖，那条回帖本身就不可靠。'},
 {id:'c11',s:'sci',d:'2023-03',t:'为什么大熊猫要吃那么多竹子？',x:'大熊猫属于食肉目动物，消化道短而直，没有专门消化纤维的复杂胃。竹子吃下去，只能消化吸收其中约 17%，所以要大量进食。',tags:['食性','身体'],cite:1,tr:'ok'},
 {id:'c12',s:'sci',d:'2024-01',t:'野生大熊猫住在哪里？',x:'野生大熊猫只分布在我国四川、陕西、甘肃三省的山区，多生活在海拔约 1500～3000 米、竹子茂密的森林里。',tags:['栖息地'],cite:1,tr:'ok'},
 {id:'c13',s:'media',d:'2015-02',t:'第四次全国大熊猫调查结果公布',x:'2015 年公布的第四次全国大熊猫调查结果显示，全国野生大熊猫有 1864 只，比第三次调查时增加了 268 只。',tags:['保护'],cite:1,tr:'ok'},
 {id:'c14',s:'gov',d:'2021-07',t:'大熊猫受威胁等级调整',x:'2021 年，有关部门宣布：我国野生大熊猫数量已达 1800 多只，受威胁等级从“濒危”降为“易危”。这说明保护有成效，但保护工作仍要继续。',tags:['保护'],cite:1,tr:'ok'},
 {id:'c15',s:'wiki',d:'2023-06',t:'大熊猫能活多少年？',x:'野生大熊猫的寿命一般约 15～20 年；在人工饲养条件下，有的可以活到 30 岁以上。',tags:['繁殖'],cite:1,tr:'ok'},
 {id:'c16',s:'wiki',d:'2022-04',t:'竹子开花，熊猫挨饿',x:'竹子开花后往往会成片枯死。20 世纪 80 年代，一些山区的箭竹大面积开花枯死，让当地大熊猫一度面临食物短缺。',tags:['食性','保护'],cite:1,tr:'ok'},
 {id:'c17',s:'sci',d:'2023-11',t:'大熊猫为什么繁殖难？',x:'雌性大熊猫每年只有短短两三天能够受孕。大熊猫有时会生下双胞胎，但在野外，熊猫妈妈通常只能照顾好其中一只。',tags:['繁殖'],cite:1,tr:'ok'},
 {id:'c18',s:'media',d:'2024-12',t:'冬天大熊猫去哪儿了？',x:'大熊猫不冬眠。天冷时，它们会从高处迁到海拔低一些、相对暖和的地方，继续吃竹子、四处活动。',tags:['活动','栖息地'],cite:1,tr:'ok'},
 {id:'c19',s:'forum',d:'2023-02',t:'回帖：熊猫宝宝一生下来就很大',x:'我听说熊猫宝宝一生下来就有 1 千克重，跟一只小猫差不多大，很快就能自己走路。',tags:['繁殖'],cite:0,tr:'bad'},
 {id:'c20',s:'sci',d:'2022-09',t:'大熊猫的“伪拇指”',x:'大熊猫前掌有一块特化增大的腕骨，形成一个突起，被称为“伪拇指”。它和五个指头配合，可以灵活地抓握竹子。',tags:['身体','食性'],cite:1,tr:'ok'},
 {id:'c21',s:'wiki',d:'2023-08',t:'大熊猫会吃肉吗？',x:'大熊猫偶尔也会吃竹鼠等小动物或动物尸体，但这只占很小一部分，它们的主要食物仍然是竹子。',tags:['食性'],cite:1,tr:'ok'},
 {id:'c22',s:'sci',d:'2024-05',t:'大熊猫宝宝的成长',x:'大熊猫幼崽出生时体重只有约 100 克，一个多月后才慢慢睁开眼睛，三四个月大时开始蹒跚学步。',tags:['繁殖'],cite:1,tr:'ok'}];
const byId=id=>C.find(c=>c.id===id);
const PACK=['c02','c04','c07','c03','c08','c05','c10','c06','c09','c01'].map(byId);
const BROAD_ORDER=['c04','c01','c09','c05','c13','c02','c19','c12','c03','c07','c16','c08','c10','c14','c06','c20','c11','c18','c15','c21','c17','c22'];
const yearOf=c=>+String(c.d).slice(0,4);

/* ---------- keyword → topic map (drives search and relevance; real computation) ---------- */
const TT={食性:['竹子','竹笋','竹叶','食物','食性','吃','进食','消化','肉','千克','营养','习性'],活动:['活动','睡','休息','冬眠','冬天','冬季','每天','一天','作息','规律','习性'],栖息地:['栖息地','分布','住在','山区','海拔','森林','四川','陕西','甘肃','国家公园','迁'],繁殖:['繁殖','幼崽','宝宝','出生','双胞胎','受孕','寿命','成长'],保护:['保护','数量','调查','濒危','易危','威胁','国家公园'],身体:['身体','外形','手指','拇指','腕骨','前掌','体重','毛色']};
const TERM={};Object.entries(TT).forEach(([g,ws])=>ws.forEach(w=>{(TERM[w]=TERM[w]||[]).push(g);}));
const TERMS=Object.keys(TERM).sort((a,b)=>b.length-a.length);
const termsIn=s=>{s=String(s||'');return TERMS.filter(w=>s.includes(w));};
const tagsOf=s=>[...new Set(termsIn(s).flatMap(w=>TERM[w]))];
const REQ=[/来源|出处/,/近\S{0,3}年|最新/,/直接相关|只要/,/\d+\s*字|简短|看得懂|能看懂/];
const spec=p=>Math.round(Math.min(55,11*termsIn(p).length)+15*Math.min(3,REQ.filter(x=>x.test(p)).length));
const specName=s=>s<20?'宽泛':s<50?'较具体':'具体';
const BROAD='搜集和大熊猫相关的资料';
function search(p){const ts=termsIn(p);if(!ts.length)return {ids:BROAD_ORDER.slice(),terms:[],broad:true};
 const qt=[...new Set(ts.flatMap(w=>TERM[w]))];const direct=REQ[2].test(p),recent=REQ[1].test(p);
 let sc=C.map(c=>{const hay=c.t+c.x;let v=0;ts.forEach(w=>{if(hay.includes(w))v+=1;if(TERM[w].some(g=>c.tags.includes(g)))v+=0.3;});return [c,v];}).filter(x=>x[1]>=1);
 if(direct)sc=sc.filter(([c])=>c.tags.some(g=>qt.includes(g)));
 sc.sort((a,b)=>recent?(Math.round(b[1])-Math.round(a[1]))||b[0].d.localeCompare(a[0].d):b[1]-a[1]);
 return {ids:sc.slice(0,8).map(x=>x[0].id),terms:ts,broad:false};}

/* ---------- prompt designer ---------- */
const RQ=[
 {id:'habit',s:'生活习性',n:'大熊猫的生活习性',kws:['竹子','食物','进食','睡觉','活动','冬眠'],focus:[{l:'吃什么',q:'食性'},{l:'每天吃多少',q:'每天的进食量'},{l:'每天的活动规律',q:'每天的活动规律'},{l:'冬天怎么过',q:'冬季的生活'}]},
 {id:'home',s:'栖息地',n:'大熊猫的栖息地',kws:['栖息地','分布','海拔','山区','森林','国家公园'],focus:[{l:'分布在哪些省',q:'分布范围'},{l:'住在多高的山上',q:'栖息地的海拔'},{l:'栖息地怎样被保护',q:'栖息地保护'}]},
 {id:'baby',s:'繁殖',n:'大熊猫的繁殖',kws:['繁殖','幼崽','出生','双胞胎','寿命','成长'],focus:[{l:'刚出生的样子',q:'幼崽刚出生时的样子'},{l:'为什么繁殖难',q:'繁殖困难的原因'},{l:'能活多少年',q:'寿命'}]},
 {id:'save',s:'保护现状',n:'大熊猫的保护现状',kws:['保护','数量','调查','濒危','易危','国家公园'],focus:[{l:'现在有多少只',q:'野生数量的变化'},{l:'受威胁等级',q:'受威胁等级'},{l:'有哪些保护措施',q:'保护措施'}]}];
const OWN_KW=['竹子','栖息地','幼崽','数量','保护','活动','身体'];
const CONS=['每条注明资料来源和日期','优先近五年的资料','只要和研究问题直接相关的内容','每条不超过 50 字'];
const CONS_S=['注明来源和日期','优先近五年','只要直接相关','每条 50 字内'];
const ownKws=pd=>String(pd.kwOwn||'').split(/[\s,，、;；]+/).map(s=>s.trim()).filter(Boolean).slice(0,5).map(s=>cut(s,8));
function qText(pd){if(!pd)return '';if(pd.rq==='own')return String(pd.own||'').trim();const R=RQ.find(r=>r.id===pd.rq);if(!R)return '';const f=(pd.foc||[]).map(i=>R.focus[i]&&R.focus[i].q).filter(Boolean);return f.length?'大熊猫的'+f.join('和'):R.n;}
function compose(pd){const q=qText(pd);if(!q)return BROAD;const kw=[...new Set((pd.kws||[]).concat(ownKws(pd)))];let s=`请帮我搜集关于「${q}」的资料。`;if(kw.length)s+=`关键词：${kw.join('、')}。`;const cs=(pd.cons||[]).map(i=>CONS[i]).filter(Boolean);if(cs.length)s+=`要求：${cs.join('；')}。`;return s;}
const rqTags=pd=>tagsOf(qText(pd));
const relOf=(c,tags)=>tags.length?c.tags.some(g=>tags.includes(g)):null;
function relRate(q,tags){if(!tags.length)return null;if(q.ids&&q.ids.length){const r=q.ids.map(byId).filter(Boolean).filter(c=>relOf(c,tags)).length;return {n:q.ids.length,r,v:r/q.ids.length};}return null;}

/* ---------- detective ---------- */
const VD=[['ok','可信'],['doubt','存疑'],['bad','不可信']];const VDN={ok:'可信',doubt:'存疑',bad:'不可信'};
const RS=[['auth','来源权威（政府部门、科研机构、主流媒体）'],['weak','来源不权威（个人博客、营销号、论坛）'],['cite','写明了发布机构和日期'],['nocite','没有出处，说不清是谁研究的'],['old','日期太旧，可能已经过时'],['agree','能在其他可靠资料里找到相同说法'],['conflict','和可靠资料的说法矛盾'],['hype','标题党、语气夸张、催人转发'],['num','数字很“精确”却没有来源'],['sense','和常识或已知的知识不符']];
const RSN=Object.fromEntries(RS);
/* the six reasons a student can pick on the card (the full list above stays for old records and the class report) */
const RSHOW=[['auth','来源权威'],['weak','来源不权威'],['nocite','没写出处'],['old','日期太旧'],['agree','有资料印证'],['conflict','和可靠资料矛盾']];
const isOk=(c,v)=>v===c.ans||(c.alt||[]).includes(v);
const LV={ok:0,doubt:1,bad:2};const isNear=(c,v)=>!isOk(c,v)&&Math.abs(LV[v]-LV[c.ans])===1;
const rQual=(c,rs)=>{rs=rs||[];if(!rs.length)return 0;const g=rs.filter(r=>c.keys.includes(r)).length,b=rs.length-g;return clamp((g-0.5*b)/Math.min(2,c.keys.length),0,1);};
const HYPE=['震惊','竟然','99% 的人','99%的人','都不知道','转给','赶紧','当然要'];
const SIGN={hype:'夸张用语',num:'精确数字',vague:'模糊的“权威”',jargon:'专业名词'};
function signals(x){const out=[];x=String(x||'');HYPE.forEach(w=>{if(x.includes(w))out.push({k:'hype',w});});
 (x.match(/\d+\.\d+\s*(%|倍|千克)?/g)||[]).forEach(w=>out.push({k:'num',w:w.trim()}));
 const va=x.match(/据[^，。]{0,8}(权威|专家|研究)[^，。]{0,6}/);if(va)out.push({k:'vague',w:va[0]});
 ['高效纤维素裂解菌群','能量代谢效率'].forEach(w=>{if(x.includes(w))out.push({k:'jargon',w});});return out;}
function hl(x,sg){x=String(x||'');const rg=[];sg.forEach(s=>{let i=x.indexOf(s.w);while(i>=0){rg.push([i,i+s.w.length,s.k]);i=x.indexOf(s.w,i+s.w.length);}});rg.sort((a,b)=>a[0]-b[0]);
 let o='',p=0;rg.forEach(([a,b,k])=>{if(a<p)return;o+=esc(x.slice(p,a))+`<mark class="l8-sg ${k}" title="${SIGN[k]}">${esc(x.slice(a,b))}</mark>`;p=b;});return o+esc(x.slice(p));}
const srcPill=(s,extra)=>{const v=SRC[s]||{n:String(s),a:1};return `<span class="l8-src a${v.a}">${esc(v.n)}</span>`;};
const srcPillTxt=n=>{const e=Object.values(SRC).find(v=>v.n===n);return `<span class="l8-src a${e?e.a:'x'}">${esc(n)}</span>`;};

/* ---------- case + consequences ---------- */
const CASECP={c1:{q:'它说“据国外权威期刊最新研究”。它写明是哪本期刊、哪位研究者了吗？',o:['写了，很清楚','没有写，没法去查证'],a:1,why:'只说“权威期刊”却不写名字，读者就没法去核对——这是假资料常用的“借权威”手法。'},
 c2:{q:'两条可靠资料的数字都和它差得很远。最合理的推断是？',o:['两条可靠资料都错了','这条“专业”资料很可能是错的','数字差一点没关系'],a:1,why:'科研机构和权威媒体两个不同的可靠来源说法一致，而它和两者都矛盾，问题就出在它身上。'},
 c3:{q:'如果大熊猫每天只需吃 2.4 千克竹子，下面哪件事就说不通了？',o:['大熊猫住在山里','大熊猫每天要花 10～16 小时吃竹子','大熊猫的毛是黑白色的'],a:1,why:'只吃 2.4 千克，根本用不着每天吃十几个小时。用已经知道的知识推一推，矛盾就暴露了。'}};
const REP=[{t:'大熊猫的食物中约 99% 是竹子，竹笋、竹叶和竹茎都吃。',ok:1,src:['c01']},
 {t:'研究表明，大熊猫能消化吸收竹子中 87.3% 的营养，所以每天只需吃 2.4 千克竹子。',ok:0,from:'c03',fix:'大熊猫只能消化吸收竹子中约 17% 的营养，所以成年大熊猫每天要吃约 12～38 千克竹子。',src:['c11','c02']},
 {t:'野生大熊猫只分布在我国四川、陕西、甘肃三省的山区。',ok:1,src:['c12']},
 {t:'目前全国野生大熊猫只有约 1100 只，处于濒危状态。',ok:0,from:'c06',fix:'2015 年公布的第四次全国调查显示，野生大熊猫有 1864 只；2021 年，受威胁等级从“濒危”降为“易危”。',src:['c13','c14']},
 {t:'2021 年，我国正式设立大熊猫国家公园，保护大熊猫的栖息地。',ok:1,src:['c07']}];
const UNSURE=['先用上，反正读者不一定发现','暂时不用，或标注“存疑”，继续多方求证','把数字改得模糊一点再用'];

const WARM=['吃什么','活动规律','栖息地','繁殖','保护现状','身体特征'];
const WREL=['图书馆的书','AI 找的资料','都不一定'];
const OBS1=[{id:'o1',q:'AI 搜集资料的速度快吗？',opts:['很快，一会儿就列出了一大堆','和去图书馆翻书差不多','比去图书馆还慢'],a:0,why:'比去图书馆一本本翻书快得多，这是 AI 的优势。'},
 {id:'o2',q:'宽泛提示词找到的资料，都和我们要研究的问题相关吗？',opts:['都和大熊猫有关，但很杂','全部都是研究需要的','大部分和大熊猫无关'],a:0,why:'它们都和大熊猫有关，可是很杂，很多对不上研究问题。'},
 {id:'o3',q:'换成具体的提示词后，AI 找到的资料和研究问题相关吗？',opts:['相关比例明显提高，更好挑选','没有任何变化','资料更多、更杂了'],a:0,why:'提示词越具体，AI 越明白你要找什么。'}];
const FEAT=[['org','有明确的发布机构',1],['date','注明日期和出处',1],['tone','语气客观，不夸张',1],['data','数据能和其他可靠资料互相印证',1],['hot','转发、点赞特别多',0],['scary','标题越吓人越可能是真的',0]];

const QUIZ=[
 {id:'q1',q:'AI 能在很短时间里搜集到大量资料，主要是因为？',opts:['它能根据我们的提示词，从海量资料里快速找出相关内容并呈现出来','它找到的资料都经过专家逐条审核','它会派人去图书馆帮我们查书'],a:0,why:'我们告诉 AI 想找什么，它就能迅速检索，把它认为最有用的资料呈现给我们——但“它认为有用”不等于“一定正确”。'},
 {id:'q2',q:'为大熊猫研究报告搜集资料，下面哪个提示词最能让 AI 找得准？',opts:['大熊猫','搜集和大熊猫相关的资料','搜集关于“大熊猫的食性和每天的活动规律”的资料，每条注明来源和日期'],a:2,why:'先明确研究问题，再提炼关键词、把要求说具体，AI 才能更精准地理解意图；太宽泛的提示词会找出大量内容，依旧难以选择。'},
 {id:'q3',q:'想知道“野生大熊猫有多少只”，下面哪个来源一般更可靠？',opts:['论坛里的一条回帖','政府部门官网或主流媒体发布的调查结果','一篇标题写着“震惊”的营销号文章'],a:1,why:'政府部门、企事业单位以及主流媒体通过官方网站等权威渠道发布的信息更可靠；同时还要看日期，旧数据可能已经过时。'},
 {id:'q4',q:'一条资料有专业名词，还有精确到小数点的数字，但没有写出处。应该怎么对待它？',opts:['看起来很专业，直接用','仍然要核查来源，并和其他可靠资料对比','数字越精确越可信，可以多转发'],a:1,why:'表面看起来很可靠的信息，也可能包含错误。“87.3%”那条资料就和两条可靠资料矛盾。'},
 {id:'q5',q:'遇到一条无法确定是否可靠的资料，下面做法正确的是？',opts:['先转发给同学，让大家一起判断','暂时不用，或标注“存疑”，继续多方求证','把它改写一下，就可以放进报告'],a:1,why:'不盲信、查来源、多方求证；没有核实的信息不写进报告，也不传播。'}];


const CSS=`.l8-col{display:flex;flex-direction:column;gap:14px;min-width:0}
.l8-gl{font-weight:700}
.l8-cmp2{display:grid;grid-template-columns:1fr 1fr;gap:12px;align-content:start}
.l8-way{padding:14px 16px;border-radius:16px;background:var(--bg2);border:2px solid var(--line2);display:flex;flex-direction:column;gap:6px}
.l8-way.ai{background:var(--grape-soft);border-color:var(--grape)}
.l8-way b{font-family:var(--f-display);font-weight:800;font-size:20px}
.l8-way ol{margin:0;padding-left:20px;font-size:15px;color:var(--muted)}
.l8-way .t{font-family:var(--f-display);font-weight:800;font-size:22px;color:var(--ink);margin-top:4px}
.l8-pc{padding:16px 18px;border-radius:16px;background:var(--paper);border:1.5px solid var(--line2);display:flex;flex-direction:column;gap:10px}
.l8-pl{font-family:var(--f-display);font-weight:800;font-size:16px;color:var(--coral-d)}
.l8-pc p{font-size:19px;line-height:1.6;font-weight:500;color:var(--ink);word-break:break-all}
.l8-meter{display:grid;grid-template-columns:auto 1fr auto;gap:10px;align-items:center;font-size:14px;color:var(--muted)}
.l8-meter .tr{height:14px;border-radius:999px;background:#1b255012;overflow:hidden}
.l8-meter .tr i{display:block;height:100%;border-radius:999px;background:var(--mint);transition:width .3s}
.l8-meter b{font-family:var(--f-display);font-weight:800;font-size:17px;color:var(--ink)}
.l8-res{display:flex;flex-direction:column;gap:8px;margin-top:10px}
.l8-res .btn{align-self:flex-start}
.l8-ri{padding:9px 12px;border-radius:12px;background:#fff;border:2px solid var(--line);display:flex;flex-direction:column;gap:4px;font-size:14.5px}
.l8-ri.irr{background:var(--bg2);border-style:dashed}
.l8-ri b{font-size:15px}
.l8-ri p{font-size:14px;line-height:1.55;color:var(--muted)}
.l8-ri .chip,.l8-fv .chip{align-self:flex-start;font-size:13px;padding:2px 10px}
.l8-rh{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
.l8-src{display:inline-block;font-size:12.5px;font-weight:700;padding:1px 8px;border-radius:999px;border:2px solid currentColor;line-height:1.5;white-space:nowrap;background:#fff}
.l8-src.a3{color:var(--mint-d)}.l8-src.a2{color:var(--sun-d)}.l8-src.a1{color:var(--grape-d)}.l8-src.a0{color:var(--red)}.l8-src.ax{color:var(--sky)}
.l8-rel{font-size:12.5px;font-weight:700;color:var(--mint-d)}.l8-rel.no{color:var(--muted)}
.l8-dots{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
.l8-dot{width:30px;height:30px;border-radius:50%;border:2px solid var(--line2);background:#fff;color:var(--muted);font-weight:700;font-size:13px;cursor:pointer;padding:0}
.l8-dot.ok{background:var(--mint-soft);border-color:var(--mint-d);color:var(--mint-d)}
.l8-dot.no{background:var(--coral-soft);border-color:var(--coral-d);color:var(--coral-d)}
.l8-dot.near{background:var(--sun-soft);border-color:var(--sun-d);color:var(--sun-d)}
.l8-dot.cur{border-color:var(--ink);box-shadow:0 6px 16px #6c47ff33;color:var(--ink)}
.l8-dc{border:1.5px solid var(--line2);background:var(--paper);border-radius:16px;padding:14px 16px;display:flex;flex-direction:column;gap:8px;min-width:0}
.l8-dc header{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.l8-no{font-family:var(--f-display);font-weight:800;font-size:15px;color:var(--coral-d);margin-right:auto}
.l8-dc h4{margin:0;font-size:18px;line-height:1.4}
.l8-tx{font-size:16px;line-height:1.75}
.l8-sg{color:inherit;border-bottom:3px solid;padding:0 1px;border-radius:3px 3px 0 0}
.l8-sg.hype{border-color:var(--red);background:var(--coral-soft)}.l8-sg.num{border-color:var(--sun-d);background:var(--sun-soft)}.l8-sg.vague{border-color:var(--grape);background:var(--grape-soft)}.l8-sg.jargon{border-color:var(--sky);background:var(--sky-soft)}
.l8-xp{border-radius:14px;background:var(--bg2);border:2px solid var(--line);padding:10px 12px;font-size:14.5px;display:flex;flex-direction:column;gap:6px}
.l8-xp h5{margin:0;font-family:var(--f-display);font-weight:800;font-size:16px;color:var(--sky)}
.l8-xi{padding:6px 10px;border-radius:10px;border-left:6px solid var(--line2);background:#fff;font-size:14px;line-height:1.55}
.l8-xi.ag{border-left-color:var(--mint)}.l8-xi.cf{border-left-color:var(--coral)}
.l8-xi>b{margin-right:4px}.l8-xi.ag>b{color:var(--mint-d)}.l8-xi.cf>b{color:var(--coral-d)}
.l8-warnb{color:var(--coral-d)}
.l8-num{display:flex;flex-direction:column;gap:6px}
.l8-nr{display:grid;grid-template-columns:78px 1fr 92px;gap:8px;align-items:center;font-size:13.5px}
.l8-nr .lb{color:var(--ink);font-weight:700}
.l8-nb{height:14px;border-radius:999px;background:#1b255012;position:relative;overflow:hidden}
.l8-nb i{position:absolute;top:0;bottom:0;border-radius:999px}.l8-nb i.bad{background:var(--coral)}.l8-nb i.ok{background:var(--mint)}
.l8-nr .who{grid-column:2/4;color:var(--muted);font-size:12.5px;margin-top:-4px}
.l8-nr .v{font-family:var(--f-display);font-weight:800;font-size:15px;color:var(--ink)}
.l8-rep{background:var(--paper);color:var(--ink);border:1.5px solid var(--line2);border-radius:16px;padding:16px 18px;font-size:17px;line-height:2}
.l8-rep h4{margin:0 0 6px;font-family:var(--f-display);font-weight:800;font-size:17px;color:var(--coral-d)}
.l8-rep .s{cursor:pointer;border-radius:6px;padding:2px 3px}
.l8-rep .s:hover{background:var(--sky-soft)}
.l8-rep .s.fl{background:var(--sun);box-shadow:0 6px 16px #6c47ff33}
.l8-rep .s.bad{background:var(--coral-soft);box-shadow:none}.l8-rep .s.good{background:var(--mint-soft);box-shadow:none}
.l8-rep .s.bad.miss{outline:3px dashed var(--coral-d)}
.l8-rep .s.good.fl{text-decoration:underline wavy var(--sun-d)}
.l8-chainv{display:flex;flex-wrap:wrap;gap:6px;align-items:center;font-size:14px}
.l8-chainv span.nd{padding:5px 10px;border-radius:10px;background:#fff;border:2px solid var(--line2)}
.l8-chainv span.nd b{color:var(--coral-d)}
.l8-fix{font-size:14.5px;padding:8px 12px;border-radius:10px;background:#fff;border-left:6px solid var(--mint);line-height:1.6}
.l8-fix s{color:var(--dim)}
.l8-favs{display:flex;flex-direction:column;gap:8px}
.l8-tools{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.l8-cl{cursor:pointer;border-radius:6px;padding:2px 1px}
.l8-cl:hover{background:var(--sky-soft)}
.l8-cl.on{background:var(--sun)}
.l8-cl.lock{cursor:default}.l8-cl.lock:hover{background:none}.l8-cl.on.lock:hover{background:var(--sun)}
.l8-pc mark{display:inline;background:var(--sun-soft);color:inherit;border-radius:6px;padding:0 3px;margin:0;font:inherit}
.l8-pc mark.c{background:var(--mint-soft)}.l8-pc mark.q{background:var(--grape-soft)}
#l8-addable .l8-fv{padding:6px 12px}#l8-addable .l8-fv .chip{margin-left:auto}
.l8-vt{font-size:12.5px;font-weight:700;color:var(--muted);white-space:nowrap}
.l8-fvh{font-family:var(--f-display);font-weight:800;font-size:16px;color:var(--ink)}
.l8-fv{border:2px solid var(--line2);border-radius:14px;padding:8px 12px;background:#fff;display:flex;flex-wrap:wrap;gap:6px 8px;align-items:center}
.l8-fv>b{font-size:15px;flex:1 1 150px;min-width:0}
.l8-fv.warn{border-color:var(--coral-d);background:var(--coral-soft)}
.l8-fv .tip{flex-basis:100%;font-size:13.5px;color:var(--coral-d);font-weight:500}
.l8-ex{display:flex;flex-direction:column;gap:12px}
.l8-ex table{width:100%;border-collapse:collapse;font-size:13.5px}.l8-ex td,.l8-ex th{padding:4px 6px;border-bottom:1px solid var(--line);text-align:left;vertical-align:top}
.l8-ex th{color:var(--muted);font-weight:500;font-size:12.5px}
.l8-ex ul{margin:0;padding-left:18px;font-size:14px}
@media (max-width:480px){.l8-cmp2{grid-template-columns:1fr}.l8-nr{grid-template-columns:64px 1fr 80px}.l8-rep{font-size:16px;padding:14px}.l8-pc p{font-size:17px}}`;

/* ---------- module state (memory only) ---------- */
let S={busy:false,ctrl:null,b:null,s:null,g1:null,ci:0,v:null,rs:[],tool:null,wg:null,cg:null};
const lr=()=>App.lesson(K);
function stopAll(){if(S.ctrl){try{S.ctrl.abort();}catch(e){}S.ctrl=null;}}
const pdEff=pd=>Object.assign({},pd,{rq:pd.rq||'habit'});
const rateOf=(ids,tags)=>{if(!tags.length||!ids||!ids.length)return null;const r=ids.map(byId).filter(Boolean).filter(c=>relOf(c,tags)).length;return {n:ids.length,r,v:r/ids.length};};
const pct=v=>Math.round(v*100);
const obsOk=v=>!!v&&(v.ok!=null?!!v.ok:v.f===0);
const obsDone=v=>!!v&&(v.last!=null||v.l!=null);
const meter=s=>`<div class="l8-meter"><span>具体程度</span><span class="tr"><i style="width:${s}%"></i></span><b>${specName(s)}</b></div>`;

L.render=function(){const v=$('#v-'+K);let st=document.getElementById('css-l8');if(!st){st=document.createElement('style');st.id='css-l8';document.head.appendChild(st);}st.textContent=CSS;
 v.innerHTML=`${App.hero(K,'今天你是资料侦探：让 AI 找得更准，再把假资料揪出来。',['学会用 AI 搜集资料。','能主动求证 AI 提供的资料，辨别信息的可靠性。'])}

 <div class="station" id="l8-s0">${App.head('WARM-UP','导入 · 研究准备','图书馆还是 AI','猜一猜：哪种方法找来的资料一定可靠？')}
  <ol class="steps"><li>选想查的方面</li><li>猜一猜再揭晓</li></ol>
  <div class="grid2"><div class="l8-cmp2"><div class="l8-way"><b>去图书馆</b><ol><li>查目录、找书架</li><li>一本本翻书</li><li>抄下有用的内容</li></ol><span class="t">约 30～60 分钟</span></div>
    <div class="l8-way ai"><b>请 AI 帮忙</b><ol><li>告诉 AI 想找什么</li><li>AI 快速检索</li><li>列出它认为有用的</li></ol><span class="t">几秒钟</span></div></div>
   <div class="l8-col">${App.knobs([['我想查','<span id="l8-wpick" style="display:contents"></span>','大熊猫的……']])}
    <div class="go-row"><span class="l8-gl">我猜</span>${App.seg('wrel',WREL.map((t,i)=>[i,t]),'')}${App.go('l8-wgo','揭晓')}</div>
    <div id="l8-fb0"></div>
    <div class="after-run">${App.pad('关于大熊猫，我还想知道……',`<textarea id="l8-want" maxlength="200" placeholder="例如：它们怎样过冬？" aria-label="我还想知道"></textarea>`)}</div></div></div>
  <details class="more"><summary>说明</summary><p class="note">搜集资料是研究工作中非常重要的一个环节。如果让你开展关于大熊猫的研究，最终完成一份研究报告，你要做哪些准备？要搜集哪些资料？</p></details></div>

 <div class="station" id="l8-s1">${App.head('EXP-01','挑战一 · 帮我找资料','研究小助手','用一句宽泛的提示词，看 AI 找来多少资料')}
  <ol class="steps"><li>宽泛搜一次</li><li>完成 2 个观察</li></ol>
  <div class="grid2"><div class="l8-col"><div class="l8-pc"><span class="l8-pl">我的提示词</span><p>${BROAD}</p>${meter(0)}</div></div>
   <div class="l8-col">${App.knobs([['研究问题',App.seg('rq',RQ.map(r=>[r.id,r.s]),'habit'),'大熊猫的……']])}
    <div class="go-row"><span class="l8-gl">我猜相关的</span>${App.seg('g1',[['few','很少'],['half','一半左右'],['all','几乎全部']],'')}${App.go('l8-broad','让 AI 找资料')}</div>
    <div id="l8-fb1"></div>${App.aiBox('l8-ai1','AI 找到的资料会列在这里','AI 找到的资料')}<div class="after-run">${App.pad('','<div id="l8-obs1"></div>','看完资料，做观察任务')}<div id="l8-fb1o"></div></div></div></div>
  <details class="more"><summary>说明</summary><p class="note">“相关”＝和上面选的研究问题有关。离线时，平台用内置的 22 张大熊猫资料卡模拟 AI 检索；来源标签都是示例类型，不对应真实网站；资料卡里混有错误资料，供辨别练习。接入大模型后，先列出 AI 生成的资料，再列出平台资料库的检索结果作对照。本平台接入的大模型没有联网搜索，它“找到”的资料来自模型学过的内容，可能有错或过时，更需要核实。</p>
   ${App.think(['在搜集资料方面，AI 有哪些优势？','如何判断 AI 找到的资料是否有价值？如何让 AI 找到更符合要求的资料？','AI 的搜集功能在生活中有哪些应用？（查找学习资料、了解新闻资讯、寻找出行攻略……）'])}</details></div>

 <div class="station" id="l8-s1b">${App.head('EXP-01b','挑战一 · 帮我找资料','提示词设计器','把提示词改具体，让相关率超过宽泛那次！')}
  <ol class="steps"><li>点选拼出提示词</li><li>再搜一次比一比</li></ol>
  <div class="grid2"><div class="l8-col"><div class="l8-pc"><span class="l8-pl">我的提示词</span><p id="l8-ptext"></p><div id="l8-spec"></div></div>
    <div class="after-run"><div class="box"><div class="box-t">比一比：和研究问题相关的比例</div><div id="l8-cmp"></div></div><div id="l8-obs3w" hidden>${App.pad('','<div id="l8-obs3"></div>','观察任务')}</div></div></div>
   <div class="l8-col">${App.knobs([['具体方面','<span id="l8-foc" style="display:contents"></span>'],['关键词','<span id="l8-kw" style="display:contents"></span>'],['要求','<span id="l8-cons" style="display:contents"></span>']])}
    <div class="go-row">${App.go('l8-go','再搜一次')}</div>
    <div id="l8-fb2"></div>${App.aiBox('l8-ai2','AI 找到的资料会列在这里','AI 找到的资料')}</div></div>
  <details class="more"><summary>说明</summary><p class="note">三步法：明确研究问题 → 提炼关键词 → 把要求说具体。研究问题在上一站选。具体程度按关键词个数和要求条数计算。</p>${App.know('怎样让 AI 找得更准','AI 能快速从海量资料中找出相关内容，帮我们节省大量时间。但是，如果提示词过于宽泛，它就会找出大量内容，我们依旧难以选择；而且 AI 找到的内容未必符合要求。所以要先<b>明确想研究的问题</b>，再思考让 AI 围绕哪些<b>关键词</b>搜集资料，把研究要求<b>转化为具体的提示词</b>，让 AI 更精准地理解我们的意图。')}</details></div>

 <div class="station" id="l8-s2">${App.head('EXP-02','挑战二 · 资料要验证','真假资料侦探','每张卡判一判：可信、存疑，还是不可信？')}
  <ol class="steps"><li>用工具查一查</li><li>判对 5 张卡</li></ol>
  <div class="grid2"><div class="l8-col"><div class="l8-dots" id="l8-dots" aria-label="资料卡进度"></div><div id="l8-card"></div><div class="l8-tools"><span class="l8-gl">① 先查一查</span><span id="l8-tools" style="display:contents"></span></div><div id="l8-evi" aria-live="polite"></div></div>
   <div class="l8-col">${App.knobs([['② 我的依据','<span id="l8-rs" style="display:contents"></span>','可多选']])}
    <div class="go-row"><span class="l8-gl">③ 我判断</span><span id="l8-vd" style="display:contents"></span>${App.go('l8-judge','揭晓')}</div>
    <div id="l8-fbd"></div>
    <div class="after-run"><div id="l8-dact" class="row"></div><div id="l8-obs2w" hidden>${App.pad('查了这么多张：权威渠道发布的内容有什么特点？（可多选）','<div id="l8-obs2"></div>')}</div></div></div></div>
  <details class="more"><summary>说明</summary><p class="note">这是为大熊猫研究报告搜集来的资料包（10 条，混有错误的资料）。核查流程：① 来源核查（谁发布的？有日期吗？）→ ② 同类对比（其他资料怎么说？）→ ③ 判断：权威且能互相印证 → 可信；来源弱但能印证、或已过时 → 存疑；和可靠资料矛盾 → 不可信。记入能力图谱的是每张卡第一次的判断。来源均为示例类型，不对应真实网站；错误资料只用于辨别练习。</p>
   ${App.know('核查来源，多方求证','AI 搜集的资料中包含大量信息，我们绝不能盲目相信。对于来源不明、不够权威的信息，或者与常识、事实明显不符的信息，要学会辨别并求证；表面看起来很可靠的信息，也可能包含错误，同样不能轻信。第一，<b>核查信息来源</b>：政府部门、企事业单位，以及主流媒体通过官方网站、官方社交平台等权威渠道发布或转载的信息更可靠。第二，<b>多方求证比对</b>：从不同渠道查找相同信息，互相印证。')}</details></div>

 <div class="station" id="l8-s3">${App.head('CASE','案例 · 看似专业的假资料','识破“专业”假资料','点出你觉得可疑的话，再用放大镜扫一扫！')}
  <ol class="steps"><li>点可疑处再扫描</li><li>答完 3 个追问</li></ol>
  <div class="grid2"><div class="l8-col"><div id="l8-case"></div>
    <div class="after-run"><div class="box"><div class="box-t">把数字放在一起比</div><div class="l8-num">
     <div class="l8-nr"><span class="lb">竹子消化率</span><span class="l8-nb"><i class="bad" style="left:0;width:87.3%"></i></span><span class="v">87.3%</span><span class="who">这条“专业”资料（个人博客）</span></div>
     <div class="l8-nr"><span class="lb"></span><span class="l8-nb"><i class="ok" style="left:0;width:17%"></i></span><span class="v">约 17%</span><span class="who">国家级科研机构官网（示例）</span></div>
     <div class="l8-nr"><span class="lb">每天吃竹子</span><span class="l8-nb"><i class="bad" style="left:0;width:6%"></i></span><span class="v">2.4 千克</span><span class="who">这条“专业”资料（个人博客）</span></div>
     <div class="l8-nr"><span class="lb"></span><span class="l8-nb"><i class="ok" style="left:30%;width:65%"></i></span><span class="v">12～38 千克</span><span class="who">权威媒体报道（示例）· 刻度 0～40 千克</span></div></div></div></div></div>
   <div class="l8-col"><div class="go-row"><span class="l8-gl" id="l8-cn">先点左边可疑的话</span>${App.go('l8-scan','扫一扫')}</div>
    <div id="l8-fbc"></div>
    <div class="after-run">${App.pad('','<div id="l8-caseq"></div>','侦探追问')}</div></div></div>
  <details class="more"><summary>说明</summary><p class="note">这是资料包里的一条练习用错误资料：有专业名词，有精确到小数点的数字。四个破绽：模糊的权威（不写期刊名）、没有出处（来自个人博客）、和两条可靠资料矛盾、和已知的知识说不通。“看起来很专业”的假资料，往往比标题党更难识破。</p>
   ${App.know('平时积累知识，提升判断力','识破“87.3%”这条资料，靠的不只是查来源，还有已经知道的知识：大熊猫属于食肉目，消化竹子的能力很弱，所以要花很长时间吃大量竹子。平时不断积累知识，提升个人判断力，才能更敏锐地察觉、辨别有问题的信息。')}</details></div>

 <div class="station" id="l8-s4">${App.head('EXP-03','后果推演 · 假资料进了报告','报告里的假资料','点出报告里的 2 句假话，再交给读者！')}
  <ol class="steps"><li>点出可疑的句子</li><li>交给读者检查</li></ol>
  <div class="grid2"><div class="l8-col"><div id="l8-rep"></div><div class="after-run"><div id="l8-fixes"></div></div></div>
   <div class="l8-col"><div class="go-row">${App.go('l8-check','交给读者')}</div>
    <div id="l8-fb4"></div>
    <div class="after-run"><div id="l8-conseq"></div>${App.pad('遇到拿不准的资料，该怎么办？','<div id="l8-cq"></div>')}</div></div></div>
  <details class="more"><summary>说明</summary><p class="note">某小组的报告草稿里藏着两条有问题的资料。记入能力图谱的是第一次交给读者时的结果。</p>
   ${App.think(['AI 搜集的资料中，哪些内容容易有误？','如果虚假的资料内容没有被发现，便被直接用于撰写研究报告，可能会造成什么后果？','看到无法确定其可靠性的资料时，应该怎么做？'])}
   ${App.know('错误信息的代价','想象一下，如果你撰写的研究报告参考了有问题的信息，那么整篇报告的可信度就会降低，也会误导读这篇报告的人。AI 找到的资料并非“标准答案”；如果过于依赖 AI、直接使用它提供的信息，不仅会削弱我们的判断能力，还可能因使用虚假信息而导致自己出错、误导他人。')}</details></div>

 <div class="station" id="l8-s5">${App.head('FAVS','资料收藏夹','我的可靠资料库','收藏 3 条靠得住的资料，别让假货混进来！')}
  <ol class="steps"><li>收藏 3 条资料</li><li>体检零假货</li></ol>
  <div class="grid2"><div class="l8-col"><div class="box"><div class="box-t">资料包 · 里面混着假货，挑靠得住的点「收藏」</div><div id="l8-addable" class="l8-favs"></div></div></div>
   <div class="l8-col"><span class="l8-fvh">我的收藏夹</span><div class="l8-favs" id="l8-favs"></div>
    <div class="go-row">${App.go('l8-fcheck','体检一下')}</div>
    <div id="l8-fb5"></div></div></div>
  <details class="more"><summary>说明</summary><p class="note">第 9 讲写研究报告时，会直接使用这里的资料。收藏夹最多 12 条。</p>${App.know('收藏不等于可信','面对 AI 提供的资料，不能直接照抄，要学会严格筛选。还没核实的资料可以先收藏，但要标为“存疑”；只有查过来源、找到多方印证的资料，才标为“可信”，放心写进报告。')}</details></div>

 <div class="station" id="l8-qz">${App.head('QUIZ','反思与总结','小测验','5 道题，第一次作答计入能力图谱')}<div id="l8-quiz"></div></div>
 <div class="station" id="l8-diary"></div>`;
 if(!App.rec)return;wire();};

/* ---------- wiring ---------- */
function wire(){const l=lr();l.q=l.q||[];l.pd=l.pd||{};l.obs1=l.obs1||{};l.det=l.det||{};l.case=l.case||{};l.cons=l.cons||{};l.fav=l.fav||[];l.warm=l.warm||{};l.obs2=l.obs2||{};l.favEd=l.favEd||{};
 S=Object.assign(S,{busy:false,b:null,s:null,g1:null,v:null,rs:[],tool:null,wg:null,cg:null,redo4:false,allb:false,alls:false});
 const s0=$('#l8-s0'),s1=$('#l8-s1'),s1b=$('#l8-s1b'),s2=$('#l8-s2'),s3=$('#l8-s3'),s4=$('#l8-s4'),s5=$('#l8-s5');let tT=0;const touchSoon=()=>{clearTimeout(tT);tT=setTimeout(App.touch,600);};
 const segSet=(root,name,val)=>$$(`[data-seg="${name}"] .chip`,root).forEach(b=>b.classList.toggle('on',val!=null&&b.dataset.v===String(val)));
 /* records written by the older version: {f,l} → {first,ok,last} */
 OBS1.forEach(q=>{const v=l.obs1[q.id];if(v&&v.last==null&&v.l!=null)l.obs1[q.id]={first:v.f,ok:v.f===q.a,last:v.l};});

 /* ---- 导入 · 图书馆还是 AI ---- */
 const drawWarm=()=>{const w=lr().warm;$('#l8-wpick').innerHTML=WARM.map((t,i)=>`<button type="button" class="chip ${(w.picks||[]).includes(i)?'on':''}" data-wp="${i}">${t}</button>`).join('');
  if((w.picks||[]).length)App.markStep(s0,0);if(w.rel!=null)App.markStep(s0,1);};
 $('#l8-wpick').addEventListener('click',e=>{const b=e.target.closest('[data-wp]');if(!b)return;const w=lr().warm;const i=+b.dataset.wp;w.picks=w.picks||[];w.picks=w.picks.includes(i)?w.picks.filter(x=>x!==i):w.picks.concat(i);App.touch();drawWarm();});
 App.segWire(s0,'wrel',v=>{S.wg=+v;});
 $('#l8-wgo').onclick=()=>{const w=lr().warm;const g=S.wg;if(g!=null){if(w.relFirst==null)w.relFirst=g;w.rel=g;}App.touch();drawWarm();$('#l8-wgo').classList.add('again');
  const pk=(w.picks||[]).map(i=>WARM[i]);const tip='书可能过时，AI 也可能出错。关键是看来源、互相核对。'+(pk.length?`你想查「${pk.join('、')}」，下一站让 AI 去找。`:'');
  if(g===2)App.fb('#l8-fb0','ok','猜对了：都不一定！',tip,{stars:w.relFirst===2?3:2});
  else App.fb('#l8-fb0','find','答案是：都不一定！',(g==null?'':'和你猜的不一样。')+tip,{stars:g==null?1:2});};
 const want=$('#l8-want');want.value=l.warm.want||'';want.oninput=()=>{lr().warm.want=want.value.slice(0,200);touchSoon();};
 drawWarm();if(l.warm.rel!=null){S.wg=l.warm.rel;segSet(s0,'wrel',l.warm.rel);App.ran(s0);}

 /* ---- 实验 1 / 1b · 搜集资料 ---- */
 const favBtn=(id,label)=>{const has=(lr().fav||[]).some(f=>f.id===id);return `<button type="button" class="chip" data-fav="${esc(id)}" ${has?'disabled':''}>${has?'已收藏':label||'收藏'}</button>`;};
 const resItem=(c,tags)=>{const rel=relOf(c,tags);const old=NOW_Y-yearOf(c)>=8;
  return `<div class="l8-ri ${rel===false?'irr':''}"><div class="l8-rh">${srcPill(c.s)}<span class="note mono">${c.d}${old?' · 较旧':''}</span>${rel==null?'':rel?'<span class="l8-rel">相关</span>':'<span class="l8-rel no">不相关</span>'}</div><b>${esc(c.t)}</b><p>${esc(c.x)}</p>${favBtn(c.id)}</div>`;};
 const bg=s=>{const t=String(s).replace(/[^一-鿿0-9a-zA-Z]/g,'');const o=new Set();for(let i=0;i<t.length-1;i++)o.add(t.slice(i,i+2));return o;};
 const cover=(a,b)=>{const A=bg(a),B=bg(b);if(!A.size)return 0;let n=0;A.forEach(x=>{if(B.has(x))n++;});return n/A.size;};
 const bestMatch=text=>{let best=null,v=0;C.forEach(c=>{const s=cover(text,c.t+c.x);if(s>v){v=s;best=c;}});return {c:best,v};};
 const aiPrompt=p=>`你在给小学高年级学生演示“用 AI 搜集资料”。重要：你现在不能联网搜索，只能根据你学过的知识回答，要实事求是，不确定的内容不要写。\n学生的提示词：「${p}」\n请列出 5 条最符合提示词的资料。每条包含：title（不超过 12 个字）、text（不超过 60 个字，用小学生能看懂的话，事实要准确）、srcType（这类信息一般可以在哪类渠道查到，只能从“政府部门官网”“科研机构官网”“权威媒体报道”“百科词条”中选一个）、tags（从“食性、活动、栖息地、繁殖、保护、身体、其他”中选 1～2 个）。不要编造网址、书名、作者或具体机构名称。\n只输出 JSON：{"items":[{"title":"","text":"","srcType":"","tags":[""]}],"note":"一句话提醒学生要核实"}`;
 const normAI=d=>{const arr=Array.isArray(d)?d:d&&Array.isArray(d.items)?d.items:[];return arr.filter(x=>x&&(x.text||x.title)).slice(0,6).map((x,i)=>{const text=cut(String(x.text||''),140);let tags=(Array.isArray(x.tags)?x.tags:[]).map(String).filter(t=>TAGS.includes(t)).slice(0,2);if(!tags.length)tags=tagsOf(text).slice(0,2);if(!tags.length)tags=['其他'];return {title:cut(String(x.title||'资料 '+(i+1)),20),text,srcType:cut(String(x.srcType||'未说明'),16),tags};});};
 const BOX={b:'#l8-ai1',s:'#l8-ai2'};
 const lastBroad=()=>lr().q.filter(q=>q.p===BROAD).pop();const lastSpec=()=>lr().q.filter(q=>q.p!==BROAD).pop();
 function show(kind){const R=S[kind];if(!R)return null;const tags=rqTags(pdEff(lr().pd));const rt=rateOf(R.ids,tags);const all=!!S['all'+kind];const ids=all?R.ids:R.ids.slice(0,6);
  let h=`<div class="big">${R.ai?`AI 写了 ${R.ai.items.length} 条 · 资料库 ${R.ids.length} 条`:`${R.ids.length} 条`} · ${(R.ms/1000).toFixed(1)} 秒</div>${rt?`<p>${R.ai?'资料库里':''}和研究问题相关：<b>${rt.r} 条（${pct(rt.v)}%）</b></p>`:''}${R.err?`<p class="note">${esc(R.err)}</p>`:''}<div class="l8-res">`;
  if(R.ai)h+=R.ai.items.map((it,i)=>{const m=bestMatch(it.text);return `<div class="l8-ri"><div class="l8-rh"><span class="l8-src ax">AI 生成 · 未联网</span><span class="note">它推测来源：${esc(it.srcType)}</span></div><b>${esc(it.title)}</b><p>${esc(it.text)}</p><span class="note">${m.v>=0.3?`资料库里《${esc(m.c.t)}》说法相近`:'资料库里没找到相同说法，要另找来源核实'}</span><button type="button" class="chip" data-aifav="${kind}${i}">收藏（标为存疑）</button></div>`;}).join('')+'<p class="note">下面是平台资料库的检索结果：</p>';
  h+=ids.map(id=>resItem(byId(id),tags)).join('')+(R.ids.length>6?`<button type="button" class="btn ghost sm" data-more="${kind}">${all?'收起，只看前 6 条':`展开其余 ${R.ids.length-6} 条`}</button>`:'')+'</div>';
  App.aiSay(BOX[kind],h,{mood:rt&&rt.v>=0.8?'happy':'think',src:R.ai?R.ai.mode:'offline'});return rt;}
 async function run(kind){if(S.busy)return;const l=lr();if(!l.pd.rq)l.pd.rq='habit';const prompt=kind==='b'?BROAD:compose(l.pd);const btn=$(kind==='b'?'#l8-broad':'#l8-go');
  S.busy=true;App.busy(btn,true,'AI 正在找…');App.aiSay(BOX[kind],App.AI.real()?`正在请 ${esc(App.AI.label())} 整理资料……`:`正在翻 ${C.length} 张资料卡……`,{busy:true});
  const t0=performance.now();let r=search(prompt);if(!r.ids.length)r={ids:BROAD_ORDER.slice(),terms:r.terms,broad:true};let ai=null,err='';
  if(App.AI.real()){S.ctrl=new AbortController();
   try{const res=await App.AI.chat(aiPrompt(prompt),{json:true,tier:'quick',signal:S.ctrl.signal});if(res&&res.data){const items=normAI(res.data);if(items.length)ai={items,mode:res.mode||App.AI.mode()};else err='AI 没有返回可用的资料，下面只显示资料库的结果。';}}
   catch(e){if(e&&(e.code==='cancelled'||e.name==='AbortError'))err='已停止 AI，下面只显示资料库的结果。';else{App.AI.fail(e);err=App.AI.errText(e);}}
   S.ctrl=null;}
  else await sleep(420+Math.round(Math.random()*280));
  const ms=Math.round(performance.now()-t0);const tags=rqTags(l.pd);
  const rec={p:cut(prompt,160),ids:r.ids,s:spec(prompt),m:ai?ai.mode:'offline',ms};if(ai){rec.n=ai.items.length;rec.ar=tags.length?ai.items.filter(x=>x.tags.some(g=>tags.includes(g))).length:0;}
  l.q.push(rec);if(l.q.length>12)l.q.splice(0,l.q.length-12);l.nExp=(l.nExp||0)+1;
  S[kind]={ids:r.ids,broad:r.broad,ms,ai,err,s:rec.s};App.touch();S.busy=false;App.busy(btn,false);btn.classList.add('again');
  const rt=show(kind);
  if(kind==='b'){App.markStep(s1,0);const act=rt?(rt.v>=0.8?'all':rt.v>=0.35?'half':'few'):null;fbB(S.g1&&act?(S.g1===act?'你猜对了！':'和你猜的不一样。'):'');}
  else{App.markStep(s1b,1);const b=lastBroad();const rb=b&&rateOf(b.ids,tags);const was=rb?`宽泛那次只有 ${pct(rb.v)}%。`:'';
   if(r.broad)App.fb('#l8-fb2','try','还是太宽泛！','没有关键词，AI 只好把资料全列出来。点几个关键词再搜。',{stars:1});
   else if(rt&&rec.s>=50&&rt.v>=0.8&&(!rb||rt.v>rb.v))App.fb('#l8-fb2','ok',`相关率 ${pct(rt.v)}%，找准了！`,`${was}记住：相关不等于可信，下一站去辨真假。`,{stars:3});
   else App.fb('#l8-fb2','find',rt?`相关率 ${pct(rt.v)}%`:`找到 ${r.ids.length} 条`,rb&&rt&&rt.v<=rb.v?`${was}没比宽泛那次高。换几个关键词，再搜一次。`:rec.s<50?`${was}再添关键词和要求，把具体程度提到「具体」。`:`${was}再点一个「具体方面」，看相关率能不能到 80%。`,{stars:2});
   drawCmp();refreshObs3();}}
 /* banner of the broad search: always computed from the list that is on screen */
 function fbB(hit){const R=S.b;if(!R)return;const rt=rateOf(R.ids,rqTags(pdEff(lr().pd)));const weak=R.ids.map(byId).filter(c=>c&&SRC[c.s].a===0).length;
  App.fb('#l8-fb1','find',rt?`${R.ai?'资料库 ':''}${rt.n} 条里${rt.v<0.8?'只有':'有'} ${rt.r} 条相关`:`AI 找来了 ${R.ids.length} 条资料`,`${hit||''}资料又多又杂${weak?`，还混着 ${weak} 条营销号、论坛的内容`:''}。往下看资料，再做最下面的观察任务。`,{stars:obsStars()||1});}
 const improved=()=>{const tags=rqTags(pdEff(lr().pd));const b=lastBroad(),sp=lastSpec();const rb=b&&rateOf(b.ids,tags),rs=sp&&rateOf(sp.ids,tags);return !!(rs&&(rb?rs.v>rb.v:rs.v>=0.8));};
 /* the observation "相关比例提高了吗" is only asked when this student's own two searches really show it */
 const refreshObs3=()=>{$('#l8-obs3w').hidden=!improved();};
 const drawCmp=()=>{const l=lr();const tags=rqTags(pdEff(l.pd));const b=lastBroad();const sp=lastSpec();const row=(n,q)=>{const rt=q&&rateOf(q.ids,tags);return `<div class="hbar"><span>${n}${rt?`（${rt.n} 条）`:''}</span><span class="tr"><i style="width:${rt?pct(rt.v):0}%;background:${n==='宽泛'?'var(--sun-d)':'var(--mint)'}"></i></span><span>${rt?pct(rt.v)+'%':'—'}</span></div>`;};
  $('#l8-cmp').innerHTML=row('宽泛',b)+row('具体',sp)+(b?(sp&&!improved()?'<p class="note">相关率还没超过宽泛那次，调一调再搜。</p>':''):'<p class="note">回上一站宽泛搜一次，才能对比。</p>');};
 /* designer */
 const drawPD=()=>{const pd=pdEff(lr().pd);const R=RQ.find(r=>r.id===pd.rq);const chip=(on,attr,t)=>`<button type="button" class="chip ${on?'on':''}" ${attr}>${esc(t)}</button>`;
  $('#l8-foc').innerHTML=R?R.focus.map((f,i)=>chip((pd.foc||[]).includes(i),`data-foc="${i}"`,f.l)).join(''):'<span class="note">研究问题已经很具体</span>';
  $('#l8-kw').innerHTML=(R?R.kws:OWN_KW).map(k=>chip((pd.kws||[]).includes(k),`data-kw="${esc(k)}"`,k)).join('');
  $('#l8-cons').innerHTML=CONS_S.map((c,i)=>chip((pd.cons||[]).includes(i),`data-cons="${i}"`,c)).join('');
  const p=compose(pd);$('#l8-ptext').innerHTML=esc(p).replace(/「(.*?)」/,'「<mark class="q">$1</mark>」').replace(/关键词：(.*?)。/,'关键词：<mark>$1</mark>。').replace(/要求：(.*?)。$/,'要求：<mark class="c">$1</mark>。');$('#l8-spec').innerHTML=meter(spec(p));
  if((pd.kws||[]).length||(pd.foc||[]).length||(pd.cons||[]).length)App.markStep(s1b,0);};
 s1b.addEventListener('click',e=>{const b=e.target.closest('[data-foc],[data-kw],[data-cons]');if(!b)return;const pd=lr().pd;if(!pd.rq)pd.rq='habit';const tog=(a,v)=>a.includes(v)?a.filter(x=>x!==v):a.concat(v);
  if(b.dataset.foc!=null)pd.foc=tog(pd.foc||[],+b.dataset.foc).sort();else if(b.dataset.kw!=null)pd.kws=tog(pd.kws||[],b.dataset.kw);else pd.cons=tog(pd.cons||[],+b.dataset.cons).sort();
  drawPD();touchSoon();if($('#l8-fb2 .fbx.try'))$('#l8-fb2').innerHTML='';});
 App.segWire(s1,'rq',v=>{const pd=lr().pd;if(pd.rq!==v){pd.rq=v;pd.foc=[];pd.kws=[];}App.touch();drawPD();show('b');show('s');drawCmp();refreshObs3();fbB();$('#l8-fb2').innerHTML='';});
 App.segWire(s1,'g1',v=>{S.g1=v;});
 $('#l8-broad').onclick=()=>run('b');$('#l8-go').onclick=()=>run('s');
 /* collect from the result lists */
 const doFav=item=>{const f=lr().fav;if(f.some(x=>x.id===item.id)){App.toast('已经在收藏夹里了');return false;}if(f.length>=12){App.toast('收藏夹最多 12 条，先移出一些');return false;}
  f.push({id:item.id,title:cut(item.title,40),text:cut(item.text,300),srcType:item.srcType,tags:(item.tags||[]).filter(t=>TAGS.includes(t)).slice(0,4),trust:item.trust==='ok'?'ok':'doubt'});App.touch();return true;};
 const cardTrust=c=>{const d=lr().det[c.id];return d&&d.done&&d.v==='ok'?'ok':'doubt';};
 const favCard=id=>{const c=byId(id);if(!c)return false;const tr=cardTrust(c);if(!doFav({id:c.id,title:c.t,text:c.x,srcType:SRC[c.s].n,tags:c.tags,trust:tr}))return false;App.toast(tr==='ok'?'已收藏（你判断为可信）':'已收藏，先标为“存疑”');drawFav();return true;};
 const favClick=e=>{const b=e.target.closest('[data-fav],[data-aifav]');if(!b)return;
  if(b.dataset.fav){if(favCard(b.dataset.fav)){b.disabled=true;b.textContent='已收藏';}return;}
  const kind=b.dataset.aifav[0],it=S[kind]&&S[kind].ai&&S[kind].ai.items[+b.dataset.aifav.slice(1)];if(!it)return;
  if(doFav({id:'ai'+Date.now().toString(36).slice(-6)+b.dataset.aifav,title:it.title,text:it.text,srcType:'AI 生成（未联网，需核实）',tags:it.tags,trust:'doubt'})){b.disabled=true;b.textContent='已收藏';App.toast('已收藏，标为“存疑”：AI 生成的资料要另找来源核实');drawFav();}};
 s1.addEventListener('click',favClick);s1b.addEventListener('click',favClick);
 const moreClick=e=>{const b=e.target.closest('[data-more]');if(!b)return;const k=b.dataset.more;S['all'+k]=!S['all'+k];show(k);};
 s1.addEventListener('click',moreClick);s1b.addEventListener('click',moreClick);
 /* observation tasks */
 const obsStars=()=>{const o=lr().obs1;if(!obsDone(o.o1)||!obsDone(o.o2))return 0;return obsOk(o.o1)&&obsOk(o.o2)?3:2;};
 App.askSeq($('#l8-obs1'),OBS1.slice(0,2),l.obs1,()=>{const n=obsStars();if(!n)return;App.markStep(s1,1);App.fb('#l8-fb1o',n===3?'ok':'find','2 个观察完成！','AI 找得快，可是宽泛的提示词找来的资料又多又杂。下一站把提示词改具体。',{stars:n});});
 App.askSeq($('#l8-obs3'),OBS1.slice(2),l.obs1,()=>{});
 if(l.pd.rq)segSet(s1,'rq',l.pd.rq);drawPD();
 {const b=lastBroad(),sp=lastSpec();
  if(b){S.b={ids:b.ids,broad:true,ms:b.ms||500,ai:null,err:'',s:b.s};show('b');App.markStep(s1,0);App.ran(s1);if(obsStars())App.markStep(s1,1);}
  if(sp){S.s={ids:sp.ids,broad:false,ms:sp.ms||500,ai:null,err:'',s:sp.s};show('s');App.markStep(s1b,1);App.ran(s1b);drawCmp();}refreshObs3();}

 /* ---- 实验 2 · 真假资料侦探 ---- */
 const det=()=>lr().det;const age=c=>NOW_Y-yearOf(c);
 const srcPanel=c=>{const v=SRC[c.s];const sg=signals(c.t+'。'+c.x);return `<div class="l8-xp"><h5>查来源</h5><div>${srcPill(c.s)} ${AUTH[v.a]}</div><div>日期 <span class="mono">${c.d}</span>（约 ${age(c)} 年前${age(c)>=8?'，<b class="l8-warnb">可能过时</b>':''}）· ${c.cite?'写了出处':'<b class="l8-warnb">没写出处</b>'}</div>
  <div>放大镜：${sg.length?sg.map(s=>`<mark class="l8-sg ${s.k}">${SIGN[s.k]}「${esc(cut(s.w,14))}」</mark>`).join(' '):'没有可疑信号。'}</div></div>`;};
 const crossPanel=c=>{const it=[...c.ag.map(id=>[id,1]),...c.cf.map(id=>[id,0])];return `<div class="l8-xp"><h5>同类对比</h5>${it.map(([id,a])=>{const x=byId(id);return `<div class="l8-xi ${a?'ag':'cf'}"><b>${a?'说法一致':'说法矛盾'}</b>${srcPill(x.s)}<br>${esc(x.x)}</div>`;}).join('')||'<p class="note">没有找到讲同一件事的资料。</p>'}</div>`;};
 const dStars=()=>{const st=detStats(lr());return st.ok>=5&&st.n>=6?3:st.n>=3?2:st.n?1:0;};
 const curCard=()=>PACK[S.ci];
 const drawCard=()=>{const c=curCard();const D=det();const d=D[c.id]||{};const x=d.x||{};const sg=x.s?signals(c.t+'。'+c.x):[];
  $('#l8-dots').innerHTML=PACK.map((p,i)=>{const e=D[p.id]||{};return `<button type="button" class="l8-dot ${e.fv?(isOk(p,e.fv)?'ok':isNear(p,e.fv)?'near':'no'):''} ${i===S.ci?'cur':''}" data-ci="${i}" aria-label="第 ${i+1} 张${e.fv?(isOk(p,e.fv)?'，和侦探社结论一致':isNear(p,e.fv)?'，和侦探社结论差一级':'，和侦探社结论不同'):''}">${i+1}</button>`;}).join('');
  $('#l8-card').innerHTML=`<article class="l8-dc"><header><span class="l8-no">资料卡 ${S.ci+1} / ${PACK.length}</span>${srcPill(c.s)}<span class="note mono">${c.d}</span></header><h4>${x.s?hl(c.t,sg):esc(c.t)}</h4><p class="l8-tx">${x.s?hl(c.x,sg):esc(c.x)}</p></article>`;
  $('#l8-evi').innerHTML=S.tool==='s'?srcPanel(c):S.tool==='c'?crossPanel(c):'';
  $('#l8-tools').innerHTML=[['s','查来源'],['c','同类对比']].map(([k,n])=>`<button type="button" class="chip ${S.tool===k?'on':''}" data-tool="${k}">${n}</button>`).join('');
  const lock=d.done?'disabled':'';
  $('#l8-rs').innerHTML=RSHOW.map(([k,n])=>`<button type="button" class="chip ${S.rs.includes(k)?'on':''}" data-r="${k}" ${lock}>${n}</button>`).join('');
  $('#l8-vd').innerHTML=VD.map(([k,n])=>`<button type="button" class="chip ${S.v===k?'on':''}" data-v="${k}" ${lock}>${n}</button>`).join('');
  const go=$('#l8-judge');const lab=d.done?'下一张':'揭晓';go.dataset.label=lab;if(!go.disabled)go.textContent=lab;
  const fav=(lr().fav||[]).some(f=>f.id===c.id);
  $('#l8-dact').innerHTML=!d.done?'':(isOk(c,d.v)?'':'<button type="button" class="btn ghost sm" data-redo>重新判断这张</button>')+(c.ans==='bad'?'<span class="note">不可信的资料不收藏，也不转发。</span>':fav?'<span class="note">这张已经在收藏夹里。</span>':`<button type="button" class="chip" data-dfav>${c.ans==='ok'?'把这张存进收藏夹':'存进收藏夹（标为存疑）'}</button>`);
  $('#l8-obs2w').hidden=detStats(lr()).n<3;
  const V=Object.values(D);if(V.some(e=>(e.x||{}).s||(e.x||{}).c))App.markStep(s2,0);if(detStats(lr()).ok>=5)App.markStep(s2,1);};
 /* feedback follows the verdict that is on screen now (d.v); the ability scores keep the first verdict (d.fv) */
 const result=(c,d,fresh)=>{const v=d.v||d.fv;const ok=isOk(c,v);const again=d.fv&&!isOk(c,d.fv);const st=detStats(lr());const o=fresh?{stars:dStars()}:{};const used=(d.x||{}).s||(d.x||{}).c;
  if(ok)App.fb('#l8-fbd','ok',again?'这次和侦探社一致了！':`和侦探社一致！已判对 ${st.ok} 张`,esc(c.why)+(again?' 记入能力图谱的是第一次的判断。':''),o);
  else App.fb('#l8-fbd',isNear(c,v)?'find':'try',`侦探社的结论是「${VDN[c.ans]}」`,`你判「${VDN[v]}」，${isNear(c,v)?'只差一级':'差得有点远'}。证据：`+esc(c.why)+(used?'':' 下一张先点「查来源」「同类对比」。'),o);};
 const showCard=i=>{S.ci=i;const c=curCard();const d=det()[c.id]||{};S.v=d.done?d.v:null;S.rs=d.done?(d.rs||[]).filter(r=>RSHOW.some(x=>x[0]===r)):[];S.tool=null;drawCard();
  if(d.done)result(c,d,false);else $('#l8-fbd').innerHTML='';};
 s2.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const c=curCard();const D=det();const d=D[c.id]||{};
  if(b.dataset.ci!=null){showCard(+b.dataset.ci);return;}
  if(b.dataset.tool){const dd=D[c.id]=D[c.id]||{};dd.x=dd.x||{};dd.x[b.dataset.tool]=1;S.tool=b.dataset.tool;App.touch();drawCard();return;}
  if(b.dataset.r){if(d.done)return;const r=b.dataset.r;S.rs=S.rs.includes(r)?S.rs.filter(x=>x!==r):S.rs.concat(r);drawCard();return;}
  if(b.dataset.v){if(d.done)return;S.v=b.dataset.v;drawCard();return;}
  if(b.hasAttribute('data-dfav')){favCard(c.id);drawCard();return;}
  if(b.hasAttribute('data-redo')){if(D[c.id])D[c.id].done=0;S.v=null;S.rs=[];App.touch();drawCard();$('#l8-fbd').innerHTML='';return;}
  if(b.dataset.ft2){const o=lr().obs2;o.feat=o.feat||[];const k=b.dataset.ft2;o.feat=o.feat.includes(k)?o.feat.filter(x=>x!==k):o.feat.concat(k);App.touch();drawObs2();return;}
  if(b.id==='l8-judge'){
   if(d.done){const n=PACK.length;let j=-1;for(let k=1;k<=n;k++){const t=(S.ci+k)%n;if(!(D[PACK[t].id]||{}).done){j=t;break;}}showCard(j<0?(S.ci+1)%n:j);return;}
   if(!S.v){App.fb('#l8-fbd','try','先下判断，再揭晓','点「可信」「存疑」或「不可信」。拿不准？先点卡片下面的「查来源」「同类对比」。');return;}
   const dd=D[c.id]=D[c.id]||{};dd.v=S.v;dd.rs=S.rs.slice();dd.done=1;if(dd.fv==null){dd.fv=dd.v;dd.frs=dd.rs.slice();}App.touch();drawCard();result(c,dd,true);drawFav();}});
 const drawObs2=()=>{const o=lr().obs2;const f=o.feat||[];$('#l8-obs2').innerHTML=`<div class="opts">${FEAT.map(([k,t])=>`<button type="button" class="chip ${f.includes(k)?'on':''}" data-ft2="${k}">${t}</button>`).join('')}</div>${f.length?`<div class="fb ${featScore(o)>=0.75?'ok':'no'}">${featScore(o)>=0.75?'说得对：有发布机构、有日期出处、语气客观、能互相印证。':'想一想：转发多、标题吓人，能说明内容可靠吗？四个靠谱的特点都选上了吗？'}</div>`:''}`;};
 {const D=det();let i=PACK.findIndex(c=>!(D[c.id]||{}).done);if(i<0)i=0;S.ci=i;S.v=null;S.rs=[];S.tool=null;drawCard();drawObs2();if(detStats(l).n)App.ran(s2);}

 /* ---- 案例 · 识破“专业”假资料 ---- */
 const cs=l.case;cs.a=cs.a||{};cs.l=cs.l||{};cs.q=cs.q||{};
 const CQ=['c1','c2','c3'].map(k=>({id:k,q:CASECP[k].q,opts:CASECP[k].o,a:CASECP[k].a,why:CASECP[k].why}));
 CQ.forEach(q=>{if(!cs.q[q.id]&&cs.l[q.id]!=null)cs.q[q.id]={first:cs.a[q.id],ok:cs.a[q.id]===q.a,last:cs.l[q.id]};});
 const c03=byId('c03'),sg03=signals(c03.t+'。'+c03.x);
 /* the text is cut into clauses the student can tap before scanning; the scan then shows which clauses hold a signal */
 const CL=c03.x.match(/[^，。]+[，。]?/g)||[c03.x];const HIT=CL.map((t,i)=>signals(t).length?i:-1).filter(i=>i>=0);
 const drawCase=()=>{const c=lr().case;const on=!!c.scan;const pk=c.picks||[];
  $('#l8-case').innerHTML=`<article class="l8-dc"><header><span class="l8-no">资料包第 4 条</span>${srcPill(c03.s)}<span class="note mono">${c03.d}</span></header><h4>${esc(c03.t)}</h4><p class="l8-tx">${CL.map((t,i)=>`<span class="l8-cl ${pk.includes(i)?'on':''} ${on?'lock':''}" data-cl="${i}" ${on?'':`role="button" tabindex="0" aria-pressed="${pk.includes(i)}"`}>${on?hl(t,sg03):esc(t)}</span>`).join('')}</p>${on?`<p class="note">黄底＝你点的话　下划线＝放大镜扫到的：${Object.keys(SIGN).filter(k=>sg03.some(s=>s.k===k)).map(k=>`<mark class="l8-sg ${k}">${SIGN[k]}</mark>`).join(' ')}　出处：未注明</p><div class="row"><button type="button" class="btn ghost sm" data-rescan>擦掉，重新点一遍</button></div>`:''}</article>`;
  $('#l8-cn').textContent=on?'扫完了，看左边':pk.length?`点了 ${pk.length} 句`:'先点左边可疑的话';};
 s3.addEventListener('click',e=>{const c=lr().case;if(e.target.closest('[data-rescan]')){c.scan=0;c.picks=[];App.touch();drawCase();$('#l8-fbc').innerHTML='';return;}
  const el=e.target.closest('[data-cl]');if(!el||c.scan)return;const i=+el.dataset.cl;c.picks=c.picks||[];c.picks=c.picks.includes(i)?c.picks.filter(x=>x!==i):c.picks.concat(i).sort((a,b)=>a-b);App.touch();drawCase();});
 s3.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.closest('[data-cl]')){e.preventDefault();e.target.click();}});
 $('#l8-scan').onclick=()=>{const c=lr().case;c.scan=1;const pk=c.picks||[];if(c.guess==null)c.guess=pk.length;App.touch();drawCase();App.markStep(s3,0);$('#l8-scan').classList.add('again');
  const k=pk.filter(i=>HIT.includes(i)).length;const tail=`放大镜在 ${HIT.length} 句话里扫出 ${sg03.length} 处信号：精确的数字、模糊的“权威”、专业名词。看着专业，却都没写出处。接着回答侦探追问。`;
  if(!pk.length)App.fb('#l8-fbc','find',`扫出 ${sg03.length} 处可疑信号！`,tail,{stars:caseStars()||1});
  else App.fb('#l8-fbc',k>=HIT.length?'ok':'find',`${HIT.length} 句可疑的话，你点中 ${k} 句`,tail,{stars:caseStars()||1});};
 const caseStars=()=>{const q=lr().case.q||{};if(CQ.some(x=>!q[x.id]))return 0;const ok=CQ.filter(x=>q[x.id].ok).length;return ok>=3?3:ok>=2?2:1;};
 App.askSeq($('#l8-caseq'),CQ,cs.q,()=>{const c=lr().case;let n=0;CQ.forEach(q=>{const v=c.q[q.id];if(!v)return;n++;if(c.a[q.id]==null)c.a[q.id]=v.first;c.l[q.id]=v.last;});c.st=Math.max(c.st||0,n);App.touch();
  if(n>=3){App.markStep(s3,1);App.fb('#l8-fbc','ok','3 个追问答完，破绽全找到了','四个破绽：模糊的权威、没有出处、和可靠资料矛盾、和已知的知识说不通。不写进报告，也不转发。',{stars:caseStars()});}});
 drawCase();if(cs.scan){App.markStep(s3,0);App.ran(s3);}if((cs.st||0)>=3)App.markStep(s3,1);

 /* ---- 实验 3 · 报告里的假资料 ---- */
 const BADN=REP.filter(s=>!s.ok).length;
 const drawRep=()=>{const cn=lr().cons;const fl=cn.flags||[];const ck=!!cn.checked&&!S.redo4;
  $('#l8-rep').innerHTML=`<div class="l8-rep"><h4>研究报告（草稿）· 大熊猫的生活习性与保护</h4>${REP.map((s,i)=>{const f=fl.includes(i);const cls=ck?(s.ok?(f?'good fl':'good'):(f?'bad':'bad miss')):(f?'fl':'');return `<span class="s ${cls}" data-si="${i}" role="button" tabindex="0" aria-pressed="${f}">${esc(s.t)}</span>`;}).join('')}</div>${ck?'<p class="note">红色＝有问题的句子（虚线框＝你没发现）；绿色＝没有问题（波浪线＝你标错了）。</p><div class="row"><button type="button" class="btn ghost sm" data-again>擦掉，再找一遍</button></div>':''}`;
  if(!ck){$('#l8-fixes').innerHTML='';$('#l8-conseq').innerHTML='';return;}const okN=REP.length-BADN;
  $('#l8-fixes').innerHTML=`<div class="box l8-col"><div class="box-t">改正后（每句注明来源）</div>${REP.filter(s=>!s.ok).map(s=>`<div class="l8-fix"><s>${esc(s.t)}</s><br>${esc(s.fix)} <span class="note">（来源：${s.src.map(id=>esc(SRC[byId(id).s].n)).join('、')}）</span></div>`).join('')}</div>`;
  $('#l8-conseq').innerHTML=`<div class="box l8-col"><div class="box-t">假如这 ${BADN} 句假话没被发现……</div>
   <div><b>${REP.length} 句话里有 ${BADN} 句是错的</b><div class="hbar"><span>靠得住的句子</span><span class="tr"><i style="width:${100*okN/REP.length}%;background:var(--mint)"></i></span><span>${okN}/${REP.length}</span></div><p class="note">读者发现一处错，就会怀疑整篇报告。</p></div>
   <div><b>错误会传开（假设）</b><div class="l8-chainv"><span class="nd">班级展示 <b>40</b> 人</span>→<span class="nd">每人讲给 2 位家人 <b>80</b> 人</span>→<span class="nd">有人写进作业……</span></div><p class="note">这样算下来，听到错误说法的有 120 人。</p></div></div>`;};
 const drawCQ=()=>{const cn=lr().cons;$('#l8-cq').innerHTML=`<div class="opts">${UNSURE.map((t,j)=>`<button type="button" class="chip ${cn.q3===j?'on':''}" data-u="${j}">${t}</button>`).join('')}</div>${cn.q3!=null?`<div class="fb ${cn.q3===1?'ok':'no'}">${cn.q3===1?'对：拿不准的资料先不用，或标注“存疑”，继续从不同渠道求证。':'这样做，错误还是会进到报告里、误导读者。'}</div>`:''}`;};
 /* banner follows the sentences flagged right now; scores keep the first hand-in (foundFirst / falseFirst) */
 const fb4=fresh=>{const cn=lr().cons;const fl=cn.flags||[];const f=REP.filter((s,i)=>!s.ok&&fl.includes(i)).length,w=fl.filter(i=>REP[i].ok).length;const o=fresh?{stars:f>=BADN&&!w?3:f?2:1}:{};const extra=w?`另有 ${w} 句其实没有问题。`:'';
  if(f>=BADN&&!w)App.fb('#l8-fb4','ok',`${BADN} 句假话全被你抓住！`,'读者没有被误导。看看要是没发现，会发生什么。',o);
  else if(f)App.fb('#l8-fb4','find',`抓住 ${f} 句，漏了 ${BADN-f} 句`,`${extra}红色虚线框是漏掉的假话，它们会骗到读者。`,o);
  else App.fb('#l8-fb4','oops','读者被假资料骗了！',`${extra}${BADN} 句假话混进了报告，看红色虚线框。`,o);};
 s4.addEventListener('click',e=>{const sEl=e.target.closest('[data-si]');const cn=lr().cons;
  if(e.target.closest('[data-again]')){S.redo4=true;cn.flags=[];App.touch();drawRep();$('#l8-fb4').innerHTML='';return;}
  if(sEl){if(cn.checked&&!S.redo4)return;const i=+sEl.dataset.si;cn.flags=cn.flags||[];cn.flags=cn.flags.includes(i)?cn.flags.filter(x=>x!==i):cn.flags.concat(i).sort();App.touch();drawRep();App.markStep(s4,0);return;}
  const b=e.target.closest('button');if(!b)return;
  if(b.id==='l8-check'){const fl=cn.flags=cn.flags||[];const first=!cn.checked;S.redo4=false;if(first){cn.foundFirst=REP.filter((s,i)=>!s.ok&&fl.includes(i)).length;cn.falseFirst=fl.filter(i=>REP[i].ok).length;}cn.checked=1;App.touch();drawRep();App.markStep(s4,1);b.classList.add('again');fb4(first);}
  else if(b.dataset.u!=null){const j=+b.dataset.u;if(cn.q3First==null)cn.q3First=j;cn.q3=j;App.touch();drawCQ();}});
 s4.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.closest('[data-si]')){e.preventDefault();e.target.click();}});
 drawRep();drawCQ();if((l.cons.flags||[]).length)App.markStep(s4,0);if(l.cons.checked){App.markStep(s4,1);App.ran(s4);}

 /* ---- 收藏夹 ---- */
 const favNote=f=>{const c=byId(f.id);if(!c)return String(f.id).startsWith('ai')&&f.trust==='ok'?{k:'tip',t:'AI 生成的资料还没核实，先标“存疑”。'}:null;
  if(c.tr==='bad')return {k:'warn',t:'这条资料有误，把它移出去。'};
  if(c.id==='c06')return f.trust==='ok'?{k:'warn',t:'这条数据已过时，不能标「可信」。改成「存疑」，或换成 2015、2021 年的资料。'}:{k:'tip',t:'数据已过时，写报告时换成 2015 或 2021 年的资料。'};
  if(c.tr==='doubt'&&f.trust==='ok')return {k:'tip',t:`来源不权威，最好改用「${byId(c.ag[0]).t}」。`};return null;};
 let favChecked=false;
 function drawFav(){const F=lr().fav;const row=(f,i)=>{const n=favChecked?favNote(f):null;return `<div class="l8-fv ${n&&n.k==='warn'?'warn':''}" data-fi="${i}"><b>${esc(cut(f.title,16))}</b><button type="button" class="chip ${f.trust==='ok'?'on':''}" data-ft="ok">可信</button><button type="button" class="chip ${f.trust!=='ok'?'on':''}" data-ft="doubt">存疑</button><button type="button" class="chip" data-fx aria-label="移出收藏夹">移出</button>${n?`<span class="tip">${esc(n.t)}</span>`:''}</div>`;};
  const okN=F.filter(f=>f.trust==='ok').length;
  $('#l8-favs').innerHTML=F.length?F.slice(0,6).map(row).join('')+(F.length>6?`<details class="more"><summary>还有 ${F.length-6} 条</summary><div class="l8-favs">${F.slice(6).map((f,i)=>row(f,i+6)).join('')}</div></details>`:'')+`<p class="note">共 ${F.length}/12 条：可信 ${okN}、存疑 ${F.length-okN}。</p>`
   :'<div class="empty">收藏夹还是空的。</div>';
  const D=det();const add=PACK.filter(c=>!F.some(f=>f.id===c.id));
  $('#l8-addable').innerHTML=add.length?add.map(c=>{const d=D[c.id]||{};return `<div class="l8-fv"><b>${esc(cut(c.t,16))}</b><span class="l8-src a${SRC[c.s].a}">${esc(SRC[c.s].n.replace('（示例）',''))}</span>${d.done&&d.v?`<span class="l8-vt">你判：${VDN[d.v]}</span>`:''}<button type="button" class="chip" data-fav="${c.id}">收藏</button></div>`;}).join(''):'<p class="note">资料包里的 10 条都收藏了。</p>';
  if(F.length>=3)App.markStep(s5,0);}
 s5.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
  if(b.dataset.fav){favChecked=false;$('#l8-fb5').innerHTML='';favCard(b.dataset.fav);return;}
  if(b.id==='l8-fcheck'){const F=lr().fav;favChecked=true;drawFav();b.classList.add('again');const bad=F.filter(f=>{const n=favNote(f);return n&&n.k==='warn';});const tips=F.filter(f=>{const n=favNote(f);return n&&n.k==='tip';}).length;
   if(!F.length)App.fb('#l8-fb5','try','收藏夹还是空的','点左边的「收藏」，挑 3 条靠得住的资料。');
   else if(bad.length)App.fb('#l8-fb5','oops',`混进了 ${bad.length} 条问题资料！`,'看红色的那几条提示，改好了再体检一次。',{stars:1});
   else if(F.length<3)App.fb('#l8-fb5','find',`零假货，还差 ${3-F.length} 条`,'再收藏几条靠得住的资料。',{stars:2});
   else{App.markStep(s5,1);App.fb('#l8-fb5','ok','零假货！资料库靠得住',(tips?`有 ${tips} 条还要留意，看它下面的提示。`:'')+'第 9 讲写研究报告时会用到它们。',{stars:3});}
   return;}
  const row=b.closest('[data-fi]');if(!row)return;const F=lr().fav;const f=F[+row.dataset.fi];if(!f)return;
  if(b.dataset.ft){f.trust=b.dataset.ft;lr().favEd.t=1;}else if(b.hasAttribute('data-fx')){F.splice(+row.dataset.fi,1);}else return;favChecked=false;$('#l8-fb5').innerHTML='';App.touch();drawFav();if(curCard())drawCard();});
 drawFav();

 /* ---- quiz + diary ---- */
 App.quiz($('#l8-quiz'),K,QUIZ);
 const rd=App.diary($('#l8-diary'),K,{title:'资料侦探档案',lead:'看看你的侦探记录，再回答 3 个问题',
  fields:[{id:'rely',q:'在搜集资料的过程中，哪些环节可以依靠 AI？哪些环节我们必须亲自参与？',ph:'可以依靠 AI 的是……；必须自己来的是……'},
   {id:'risk',q:'在学习和生活中，如果使用了未经查证的信息，可能会有什么后果？',ph:'比如……'},
   {id:'skill',q:'你认为搜集资料时最重要的能力是什么？为什么？',ph:'我认为是……，因为……'}],
  pledge:'我承诺：不盲信、查来源、多方求证；不传播未经核实的信息。',
  extras:ex=>{const l=lr();const F=l.fav||[],D=l.det||{};const tags=rqTags(pdEff(l.pd||{}));const Q=l.q||[];const b=Q.filter(q=>q.s<20).pop(),sp=Q.filter(q=>q.s>=40).pop();const rb=b&&rateOf(b.ids,tags),rs=sp&&rateOf(sp.ids,tags);
   const okF=F.filter(f=>f.trust==='ok'),dF=F.filter(f=>f.trust!=='ok');
   ex.innerHTML=`<div class="l8-ex"><div><div class="box-t">研究问题与提示词</div><p>${l.pd&&l.pd.rq?`研究问题：<b>${esc(qText(l.pd))}</b><br>`:''}${rb&&rs?`宽泛提示词相关率 ${pct(rb.v)}% → 具体提示词相关率 ${pct(rs.v)}%`:`搜索 ${Q.length} 次${sp?'，最具体的一次：'+esc(cut(sp.p,40)):''}`}</p></div>
    <div><div class="box-t">可靠资料清单（${okF.length} 条可信 · ${dF.length} 条存疑）</div>${F.length?`<ul>${okF.map(f=>`<li>${esc(f.title)} <span class="note">· ${esc(f.srcType)}</span></li>`).join('')}${dF.map(f=>`<li>［存疑］${esc(f.title)} <span class="note">· ${esc(f.srcType)}</span></li>`).join('')}</ul>`:'<p class="note">收藏夹还是空的。</p>'}</div>
    <div><div class="box-t">资料包甄别记录</div><div class="scroll"><table><thead><tr><th>资料</th><th>我的判断</th><th>依据</th></tr></thead><tbody>${PACK.filter(c=>(D[c.id]||{}).fv).map(c=>{const d=D[c.id];return `<tr><td>${esc(cut(c.t,14))}</td><td>${VDN[d.fv]} ${isOk(c,d.fv)?'✓':'✗'}</td><td>${(d.frs||[]).map(r=>esc(cut(RSN[r],10))).join('；')}</td></tr>`;}).join('')||'<tr><td colspan="3" class="note">还没有判断资料包。</td></tr>'}</tbody></table></div></div>
    <div><div class="box-t">案例与后果推演</div><p>“看似专业”的假资料：${(l.case||{}).st>=3?'已识破':'未完成'}；报告草稿找出问题 ${(l.cons||{}).checked?((l.cons.foundFirst||0)+'/2 处'):'未检查'}</p></div></div>`;}});
 App.on(()=>{if(App.current===K)rd();});
 L._refresh=()=>{drawFav();};
}
L.onShow=()=>{if(L._refresh&&App.rec)L._refresh();};
L.onHide=()=>{stopAll();};

/* ---------- hooks ---------- */
const featScore=o=>{const f=o.feat||[];const g=f.filter(k=>(FEAT.find(x=>x[0]===k)||[])[2]).length,b=f.length-g;return clamp((g-b)/4,0,1);};
function detStats(l){const D=l.det||{};const done=PACK.filter(c=>(D[c.id]||{}).fv);const ok=done.filter(c=>isOk(c,D[c.id].fv)).length;const q=done.length?done.reduce((a,c)=>a+rQual(c,D[c.id].frs),0)/done.length:0;const xc=PACK.filter(c=>((D[c.id]||{}).x||{}).c).length;return {n:done.length,ok,acc:done.length?ok/done.length:0,q,xc,cov:done.length/PACK.length};}
function qStats(l){const Q=l.q||[];const tags=rqTags(l.pd||{});const b=Q.filter(q=>q.s<20),sp=Q.filter(q=>q.s>=40);const best=sp.map(q=>relRate(q,tags)).filter(Boolean).map(x=>x.v);const bb=b.map(q=>relRate(q,tags)).filter(Boolean).map(x=>x.v);
 return {n:Q.length,b:b.length,sp:sp.length,maxS:Q.reduce((a,q)=>Math.max(a,q.s||0),0),relS:best.length?Math.max(...best):0,relB:bb.length?bb[bb.length-1]:null};}
/* v3: the free-text boxes of the old version (own question, own keywords, obs2.detail, cons.why) are gone; their points moved to the click choices that replaced them. */
L.score=lr=>{const Q=lr.quiz||{},qs=id=>Q[id]?(Q[id].ok?100:0):0,tx=App.txtScore,D=lr.diary||{},o=lr.obs1||{},cs=lr.case||{},csa=cs.a||{},cn=lr.cons||{},pd=lr.pd||{},w=lr.warm||{};
 const qsS=qStats(lr),ds=detStats(lr);const badFav=(lr.fav||[]).filter(f=>{const c=byId(f.id);return c&&(c.tr==='bad'||c.id==='c06')&&f.trust==='ok';}).length;
 const own=pd.rq==='own'&&String(pd.own||'').trim().length>=6;const nf=(pd.foc||[]).length;const kwRich=String(pd.kwOwn||'').trim().length>=2||(pd.kws||[]).length>=3;
 return {principle:0.4*qs('q1')+30*(obsOk(o.o2)?1:0)+30*(obsOk(o.o3)?1:0),
  experiment:10*Math.min(4,qsS.n)+30*(qsS.b&&qsS.sp?1:0)+10*OBS1.filter(x=>obsDone(o[x.id])).length,
  prompt:0.6*qsS.maxS+25*qsS.relS+0.15*qs('q2'),
  critical:35*ds.acc*Math.min(1,ds.n/6)+20*ds.q*Math.min(1,ds.n/6)+10*Math.min(1,ds.xc/5)+10*['c1','c2','c3'].filter(k=>csa[k]===CASECP[k].a).length/3+10*((cn.foundFirst||0)/2)-5*(cn.falseFirst||0)+0.075*qs('q3')+0.075*qs('q4')-10*badFav+15*featScore(lr.obs2||{}),
  creative:(own||nf>=2?35:nf?25:pd.rq?10:0)+(kwRich?15:0)+0.2*tx(w.want,20)+10*Math.min(1,(w.picks||[]).length/3)+0.2*tx(D.skill,30),
  ethics:25*(D.pledge?1:0)+(cn.q3First===1?40:cn.q3===1?20:0)+0.1*qs('q5')+0.25*tx(D.risk,30)};};
L.progress=lr=>{const w=lr.warm||{},o=lr.obs1||{},cn=lr.cons||{},qsS=qStats(lr),ds=detStats(lr);
 const m=[(w.picks||[]).length>0||(w.want||'').trim().length>=4||w.rel!=null,qsS.b>0,qsS.sp>0,OBS1.every(x=>obsDone(o[x.id])),ds.n>=6,((lr.case||{}).st||0)>=3,!!cn.checked&&cn.q3!=null,(lr.fav||[]).length>=3,Object.keys(lr.quiz||{}).length>=5,!!(lr.diary||{}).submitted];
 return m.filter(Boolean).length/m.length;};
L.quiz=QUIZ;
L.flow=[
 {seg:'导入',from:'l8-s0'},
 {seg:'挑战一',kp:'知识点一 · 提示词越具体，AI 找得越准',learn:['告诉 AI 想找什么，它快速检索，呈现它认为有用的','三步法：明确研究问题→提炼关键词→具体化','提要求：注明资料来源和日期'],sum:['宽泛提示词：资料又多又杂，只有约一半相关','具体提示词：资料变少，相关的变多','找得准≠找得对，还要核查'],from:'l8-s1',to:'l8-s1b'},
 {seg:'挑战二',kp:'知识点二 · 核查来源、多方求证',learn:['第一，核查来源：谁发布的，有没有出处和日期','第二，多方求证：可靠资料怎么说，一致还是矛盾','判断：可信／存疑／不可信，说出依据'],sum:['“来源＋同类对比”两条依据最有说服力','拿不准、已过时的资料标“存疑”','看起来很专业的资料也可能是错的'],from:'l8-s2',to:'l8-s3'},
 {seg:'综合运用',from:'l8-s4'},
 {seg:'反思与总结',from:'l8-qz'}
];
L.diaryTitle='资料侦探档案';
L.diaryQ=[['rely','哪些环节靠 AI、哪些靠自己'],['risk','使用未查证信息的后果'],['skill','搜集资料最重要的能力']];
const card=(glyph,line,color)=>'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200"><rect width="320" height="200" fill="#eaf2ff"/><rect x="10" y="10" width="300" height="180" rx="20" fill="#fff" stroke="#1b2550" stroke-width="4"/><circle cx="72" cy="100" r="46" fill="${color}" stroke="#1b2550" stroke-width="4"/><text x="72" y="118" text-anchor="middle" font-size="50" font-weight="900" fill="#1b2550" font-family="Noto Sans SC,sans-serif">${glyph}</text><text x="136" y="94" font-size="17" font-weight="700" fill="#1b2550" font-family="Noto Sans SC,sans-serif">${String(line[0]).replace(/[<&>]/g,'')}</text><text x="136" y="122" font-size="14" fill="#4c5884" font-family="Noto Sans SC,sans-serif">${String(line[1]).replace(/[<&>]/g,'')}</text></svg>`);
L.works=lr=>{const o=[];const ds=detStats(lr);if(ds.n>=3)o.push({t:'资料侦探档案 · 真假甄别',s:`判断资料包 ${ds.n} 条，第一次判断正确 ${ds.ok} 条`,img:card('侦',['真假资料侦探',`正确 ${ds.ok}/${ds.n}`],'#ffd43b')});
 const F=lr.fav||[];if(F.length)o.push({t:'资料收藏夹',s:F.slice(0,3).map(f=>f.title).join('；')+(F.length>3?'……':''),img:card('藏',['我的可靠资料库',`${F.length} 条 · 可信 ${F.filter(f=>f.trust==='ok').length}`],'#b9f3d9')});
 const q=qText(lr.pd||{});const sp=(lr.q||[]).filter(x=>x.s>=40).pop();if(q&&sp)o.push({t:'我的研究问题',s:cut(sp.p,60),img:card('问',[cut(q,12),`具体程度 ${sp.s}`],'#cfdcff')});return o;};
L.expCount=lr=>lr.nExp||0;
const RN=R=>R.map(r=>(r.lessons||{})[K]||{}).filter(l=>Object.keys(l).length);
L.classPanels=recs=>{const R=RN(recs);if(!R.length)return '';
 const rows=PACK.map(c=>{let n=0,ok=0;R.forEach(l=>{const d=(l.det||{})[c.id];if(d&&d.fv){n++;if(isOk(c,d.fv))ok++;}});return {c,n,ok,v:n?ok/n:null};});
 const fake=rows.filter(x=>x.c.ans!=='ok'&&x.n).sort((a,b)=>a.v-b.v)[0];
 const bars=rows.map(x=>`<div class="hbar"><span style="font-size:12.5px">${x.c.ans==='bad'?'<span style="color:var(--red)">[假]</span> ':x.c.ans==='doubt'?'<span style="color:var(--sun-d)">[疑]</span> ':''}${esc(cut(x.c.t,15))}</span><span class="tr"><i style="width:${x.v==null?0:100*x.v}%;background:${x.v==null?'transparent':x.v>=0.8?'var(--green)':x.v>=0.6?'var(--amber)':'var(--red)'}"></i></span><span>${x.v==null?'—':Math.round(100*x.v)+'%'}</span></div>`).join('');
 const rc=RS.map(([k,n])=>[n,R.filter(l=>Object.values(l.det||{}).some(d=>(d.frs||[]).includes(k))).length]).sort((a,b)=>b[1]-a[1]);
 const xc=R.filter(l=>Object.values(l.det||{}).some(d=>(d.x||{}).c)).length,dn=R.filter(l=>detStats(l).n).length;
 const qs=R.map(qStats);const both=qs.filter(s=>s.b&&s.sp).length,anyQ=qs.filter(s=>s.n).length;const pr=qs.filter(s=>s.b&&s.sp&&s.relB!=null);const avg=a=>a.length?Math.round(100*a.reduce((x,y)=>x+y,0)/a.length):null;const aB=avg(pr.map(s=>s.relB)),aS=avg(pr.map(s=>s.relS));
 const cnt=(n,v,tot,col)=>`<div class="hbar"><span style="font-size:12.5px">${n}</span><span class="tr"><i style="width:${tot?100*v/tot:0}%;background:${col}"></i></span><span>${v}</span></div>`;
 return `<div class="box"><div class="box-t">第8讲 · 真假资料侦探：每张资料卡第一次判断正确率</div>${bars}<p class="note" style="margin-top:6px">${fake?`最能骗人的问题资料：「${esc(fake.c.t)}」（正确率 ${Math.round(100*fake.v)}%，${fake.n} 人判断）`:'还没有判断记录。'}　[假]＝错误资料 [疑]＝过时或来源弱</p></div>
  <div class="box"><div class="box-t">第8讲 · 判断依据与提示词</div><b style="font-size:13px">使用过各条依据的人数（${dn} 人做过判断）</b>${rc.slice(0,6).map(([n,v])=>cnt(esc(cut(n,16)),v,dn,'var(--cyan)')).join('')}
   <p class="note" style="margin:4px 0 8px">做过“同类对比”的学生：${xc}/${dn} 人</p>
   <b style="font-size:13px">宽泛 vs 具体提示词</b>${cnt('两种都试过',both,anyQ,'var(--green)')}${cnt('只试过一种',anyQ-both,anyQ,'var(--amber)')}
   <p class="note" style="margin-top:4px">${aB!=null?`平均相关率：宽泛 ${aB}% → 具体 ${aS}%（${pr.length} 人）`:'还没有对比数据。'}</p></div>`;};
L.classSug=recs=>{const R=RN(recs);if(!R.length)return [];const out=[];
 const rows=PACK.filter(c=>c.ans!=='ok').map(c=>{let n=0,ok=0,trusted=0;R.forEach(l=>{const d=(l.det||{})[c.id];if(d&&d.fv){n++;if(isOk(c,d.fv))ok++;if(d.fv==='ok')trusted++;}});return {c,n,v:n?ok/n:1,trusted};}).filter(x=>x.n>=3).sort((a,b)=>a.v-b.v);
 const w=rows[0];if(w&&w.v<0.75)out.push(w.c.id==='c03'?`“看似专业”的假资料（87.3% 那条）只有 ${Math.round(w.v*100)}% 的学生第一次判断正确，${w.trusted} 人认为它可信：下节课把它和科研机构（约 17%）、权威媒体（12～38 千克）两张卡并排投影，请学生先圈出“模糊的权威”和“没出处的精确数字”，再做数字对比。`:`「${w.c.t}」只有 ${Math.round(w.v*100)}% 的学生第一次判断正确：投影这张卡，按“来源核查→同类对比→判断”三步全班一起走一遍，重点讨论${w.c.id==='c06'?'资料的日期（旧数据会过时）':w.c.ans==='doubt'?'“来源弱但内容能被印证”时为什么标为存疑':'它和哪条可靠资料矛盾'}。`);
 const dn=R.filter(l=>detStats(l).n).length,xc=R.filter(l=>Object.values(l.det||{}).some(d=>(d.x||{}).c)).length;
 if(dn>=3&&xc/dn<0.5)out.push(`只有 ${xc}/${dn} 名学生在判断前打开过“同类对比”：提醒学生“多方求证”是核心步骤，可以规定每张卡先找到一条一致或矛盾的资料再下结论。`);
 const qs=R.map(qStats).filter(s=>s.n);const both=qs.filter(s=>s.b&&s.sp).length;
 if(out.length<2&&qs.length>=3&&both/qs.length<0.6)out.push(`只有 ${both}/${qs.length} 名学生既做了宽泛搜索又做了具体搜索：用 2 分钟演示“大熊猫”→“大熊猫的食性和每天的活动规律”，请学生读出对比记录里相关率的变化。`);
 return out.slice(0,2);};
/* demo class data: only fields the v3 stations can write */
L.demo=(rnd,t)=>{const p=x=>rnd()<x;const pk=a=>a[Math.floor(rnd()*a.length)];const l={};
 l.warm={picks:[0,1,2,3,4,5].filter(()=>p(.3+t*.3)),want:p(t)?pk(['大熊猫为什么是黑白色的？','大熊猫冬天怎么过？','大熊猫宝宝怎么长大？']):''};if(p(.6+t*.3)){l.warm.relFirst=p(.4+t*.5)?2:pk([0,1]);l.warm.rel=l.warm.relFirst;}
 const R=pk(RQ);l.pd={rq:R.id,foc:p(.3+t*.6)?[0,1].slice(0,p(t)?2:1):[],kws:R.kws.slice(0,1+Math.floor(rnd()*3*t+.5)),cons:p(.3+t*.6)?[0,2].slice(0,p(t)?2:1):[]};
 l.q=[];const add=pr=>{let r=search(pr);if(!r.ids.length)r={ids:BROAD_ORDER.slice()};l.q.push({p:pr,ids:r.ids,s:spec(pr),m:'offline',ms:500+Math.round(rnd()*300)});};
 if(p(.6+t*.4))add(BROAD);if(p(.35+t*.6))add(compose(l.pd));if(p(t*.6))add(compose(Object.assign({},l.pd,{cons:[0,1,2]})));
 l.obs1={};OBS1.forEach(q=>{if(p(.3+t*.6)){const f=p(.45+t*.5)?q.a:1;l.obs1[q.id]={first:f,ok:f===q.a,last:q.a};}});
 const pick6=RSHOW.map(x=>x[0]);
 l.det={};const diff={c03:.35,c08:.2,c09:.2,c06:.25};PACK.forEach(c=>{if(p(.3+t*.65)){const right=p(.35+t*.55-(diff[c.id]||0)+.15);const wrongV=c.ans==='bad'?(c.id==='c03'?'ok':'doubt'):c.ans==='ok'?'doubt':c.id==='c06'?'ok':'bad';const fv=right?(c.alt.length&&p(.3)?c.alt[0]:c.ans):wrongV;
  const good=c.keys.filter(k=>pick6.includes(k));const rs=good.filter(()=>p(.3+t*.5));if(!rs.length&&p(.7))rs.push(good[0]);if(p(.5-t*.4))rs.push(pk(pick6.filter(k=>!c.keys.includes(k))));l.det[c.id]={v:fv,fv,rs,frs:rs.slice(),done:1,x:{s:p(.4+t*.5)?1:0,c:p(.25+t*.6)?1:0}};}});
 if(p(.3+t*.6)){l.case={scan:1,st:p(.4+t*.5)?3:1+Math.floor(rnd()*2),a:{},l:{},q:{}};['c1','c2','c3'].forEach((k,i)=>{if(i<l.case.st){const a=CASECP[k].a;const f=p(.5+t*.45)?a:1-a;l.case.a[k]=f;l.case.l[k]=a;l.case.q[k]={first:f,ok:f===a,last:a};}});}
 if(p(.3+t*.6)){const f1=p(.4+t*.5),f2=p(.3+t*.5);l.cons={flags:[...(f1?[1]:[]),...(f2?[3]:[]),...(p(.25-t*.2)?[0]:[])].sort(),checked:1};l.cons.foundFirst=(f1?1:0)+(f2?1:0);l.cons.falseFirst=l.cons.flags.includes(0)?1:0;
  if(p(.6+t*.3)){l.cons.q3First=p(.55+t*.4)?1:pk([0,2]);l.cons.q3=1;}}
 l.fav=[];const okC=C.filter(c=>c.tr==='ok');const nf=Math.floor(rnd()*7*t+(p(.5)?1:0));for(let i=0;i<nf&&i<12;i++){const c=p(.12-t*.1)?byId(pk(['c03','c06','c04'])):okC[Math.floor(rnd()*okC.length)];if(l.fav.some(f=>f.id===c.id))continue;l.fav.push({id:c.id,title:c.t,text:c.x,srcType:SRC[c.s].n,tags:c.tags.slice(),trust:p(.4+t*.4)?'ok':'doubt'});}
 l.favEd={t:p(t)?1:0};l.obs2={feat:p(.4+t*.5)?['org','date','tone',...(p(t)?['data']:[]),...(p(.3-t*.25)?['hot']:[])]:[]};
 const q=(id,pp)=>{const ok=p(pp);const a=QUIZ.find(x=>x.id===id).a;return {first:ok?a:(a+1)%3,ok,last:a};};
 if(p(.3+t*.7))l.quiz={q1:q('q1',.6+t*.4),q2:q('q2',.6+t*.4),q3:q('q3',.65+t*.35),q4:q('q4',.4+t*.55),q5:q('q5',.6+t*.4)};
 if(p(.2+t*.7))l.diary={rely:p(t+.2)?'找资料、列关键词可以靠 AI；判断真假、决定用哪条资料必须自己来。':'找资料。',risk:p(t+.1)?'会让报告出错，还会误导别人，大家就不相信我了。':'',skill:p(t)?'我认为最重要的是辨别真假的能力，因为 AI 找到的资料不一定对。':'会搜索。',pledge:p(.8),submitted:p(t+.1)?1:0};
 l.nExp=l.q.length;return l;};
})();
