/* 第15讲 学习规划室 (v3) — WARM-UP 三道错题的秘密 / EXP-01 学习诊断仪 / EXP-01b 我的学习方案 / EXP-02 方案调整台 / EXP-03 方案找不同 / EXP-04 我的学习智能体 / EXP-05 人与 AI 新蓝图 / FINALE 我的成长蓝图 + 给未来的自己写信 / QUIZ / DIARY */
(function(){
const {$,$$,esc,clamp}=App;const K='l15';const L={};App.lessons[K]=L;
const MODE={api:'平台 AI 接口',claude:'Claude 大模型',gpt:'GPT 大模型'};
const srcOf=m=>!m||m==='offline'?'离线示例':(MODE[m]||m);
const clip=(s,n)=>{s=String(s==null?'':s).trim();return s.length>n?s.slice(0,n):s;};
const cut=(s,n)=>{s=String(s||'');return s.length>n?s.slice(0,n)+'…':s;};
const nz=s=>String(s||'').replace(/\s+/g,'');
const srcTag=m=>`<span class="l15-src"><span class="l15-ai">AI 生成</span>来源：${esc(srcOf(m))}</span>`;
const WD=['周一','周二','周三','周四','周五','周六','周日'];
const CN='零一二三四五六七八九十';

/* ---------- exact fractions ---------- */
const gcd=(a,b)=>{a=Math.abs(a);b=Math.abs(b);while(b){const t=a%b;a=b;b=t;}return a||1;};
const F=(n,d=1)=>{if(!d||!isFinite(n)||!isFinite(d)||n%1||d%1)return null;if(d<0){n=-n;d=-d;}const g=gcd(n,d);return {n:n/g,d:d/g};};
const fa=(a,b)=>a&&b?F(a.n*b.d+b.n*a.d,a.d*b.d):null;
const fs=(a,b)=>a&&b?F(a.n*b.d-b.n*a.d,a.d*b.d):null;
const fm=(a,b)=>a&&b?F(a.n*b.n,a.d*b.d):null;
const fd=(a,b)=>a&&b&&b.n?F(a.n*b.d,a.d*b.n):null;
const feq=(a,b)=>!!a&&!!b&&a.n===b.n&&a.d===b.d;
const dec=s=>{const m=/^(-?)(\d*)(?:\.(\d+))?$/.exec(String(s));if(!m||(!m[2]&&!m[3]))return null;const fr=m[3]||'';return F((m[1]?-1:1)*parseInt((m[2]||'0')+fr,10),10**fr.length);};
const fmtF=f=>!f?'?':f.d===1?String(f.n):`${f.n}/${f.d}`;
function fmtD(f){if(!f)return '?';if(f.d===1)return String(f.n);let d=f.d,c2=0,c5=0;while(d%2===0){d/=2;c2++;}while(d%5===0){d/=5;c5++;}if(d!==1)return fmtF(f);
 const p=Math.max(c2,c5),v=Math.abs(f.n)*(10**p/f.d);const s=String(v).padStart(p+1,'0');return (f.n<0?'-':'')+s.slice(0,-p)+'.'+s.slice(-p);}
/* a student's written answer -> exact value (accepts 7/12, 0.3, 1又1/2, 1 1/2, x=5, 50%, trailing units) */
function parseAns(s){s=String(s==null?'':s).replace(/[＝]/g,'=').replace(/[／]/g,'/').replace(/[．。]/g,'.').trim();s=s.replace(/^[a-zA-Z]\s*=/,'').replace(/^约/,'').trim();
 s=s.replace(/[^\d./%又\s\-]+$/,'').trim();let m;
 if((m=/^(-?\d+(?:\.\d+)?)%$/.exec(s)))return fd(dec(m[1]),F(100));
 if((m=/^(\d+)(?:又|\s+)(\d+)\/(\d+)$/.exec(s)))return fa(F(+m[1]),F(+m[2],+m[3]));
 if((m=/^(-?\d+)\/(\d+)$/.exec(s)))return F(+m[1],+m[2]);
 if(/^-?\d*\.?\d+$/.test(s))return dec(s);return null;}
/* arithmetic expression (+ − × ÷ brackets, optional x) -> exact value */
function evalExpr(src,xv){let s=String(src).replace(/[（(]/g,'(').replace(/[）)]/g,')').replace(/[×✕*]/g,'*').replace(/[÷/]/g,'/').replace(/[−–—]/g,'-').replace(/\s+/g,'');
 s=s.replace(/(\d)([xX(])/g,'$1*$2').replace(/\)([\dxX(])/g,')*$1');if(!s||!/^[\d.+\-*/()xX]+$/.test(s))return null;let i=0;
 function num(){if(s[i]==='('){i++;const v=expr();if(s[i]!==')')throw 0;i++;return v;}if(s[i]==='x'||s[i]==='X'){i++;if(!xv)throw 0;return xv;}if(s[i]==='-'){i++;const v=num();return F(-v.n,v.d);}
  const m=/^\d+(\.\d+)?/.exec(s.slice(i));if(!m)throw 0;i+=m[0].length;return dec(m[0]);}
 function term(){let v=num();while(s[i]==='*'||s[i]==='/'){const o=s[i++];const w=num();v=o==='*'?fm(v,w):fd(v,w);if(!v)throw 0;}return v;}
 function expr(){let v=term();while(s[i]==='+'||s[i]==='-'){const o=s[i++];const w=term();v=o==='+'?fa(v,w):fs(v,w);if(!v)throw 0;}return v;}
 try{const v=expr();return i===s.length?v:null;}catch(e){return null;}}
/* the platform's own check of a question text: an arithmetic expression "… =" or a linear equation in x */
function verifyQ(t){t=String(t||'').replace(/^.*?[:：]/,'').replace(/[？?_＿\s]+$/,'').trim();
 const parts=t.split(/[=＝]/);if(parts.length!==2)return null;const [l,r]=parts.map(x=>x.trim());
 if(/x/i.test(t)){const g=x=>{const a=evalExpr(l,x),b=evalExpr(r,x);return a&&b?fs(a,b):null;};const g0=g(F(0)),g1=g(F(1)),g2=g(F(2));if(!g0||!g1||!g2)return null;const k=fs(g1,g0);if(!k||!k.n)return null;
  if(!feq(fs(g2,g1),k))return null;return {kind:'eq',ans:fd(F(-g0.n,g0.d),k)};}
 if(r!=='')return null;const v=evalExpr(l);return v?{kind:'calc',ans:v}:null;}

/* ---------- knowledge points, practice generators ---------- */
const KP={
 fadd:{n:'异分母分数加减法',s:'分数加减',c:'#2f6bff',lesson:'异分母分数相加减，先通分成同分母，再把分子相加减，分母不变',fig:'线段图或圆形分割图'},
 dmul:{n:'小数乘法',s:'小数乘法',c:'#7d5cf0',lesson:'先按整数乘，再数两个因数一共有几位小数，就从积的右边起数出几位，点上小数点',fig:'方格图'},
 unit:{n:'面积单位换算',s:'单位换算',c:'#e0a100',lesson:'相邻两个面积单位之间的进率是 100：1 平方米 = 100 平方分米，1 平方分米 = 100 平方厘米',fig:'10×10 的方格图'},
 eq:{n:'解简易方程',s:'解方程',c:'#12b886',lesson:'等式两边同时加、减、乘同一个数，或同时除以同一个不为 0 的数，等式仍然成立',fig:'天平图'},
 area:{n:'梯形面积',s:'梯形面积',c:'#f08a24',lesson:'两个完全一样的梯形能拼成一个平行四边形，所以梯形面积 =（上底 + 下底）× 高 ÷ 2',fig:'拼图（两个梯形拼成平行四边形）'},
 trip:{n:'相遇问题',s:'相遇问题',c:'#e8456b',lesson:'相向而行时，两车每小时一共靠近“速度和”千米，路程 = 速度和 × 相遇时间',fig:'线段图'}};
const kpOf=t=>{t=String(t||'');return /分数/.test(t)?'fadd':/小数/.test(t)?'dmul':/单位|换算|进率/.test(t)?'unit':/方程/.test(t)?'eq':/梯形|面积|图形|几何/.test(t)?'area':/相遇|行程|路程|速度/.test(t)?'trip':null;};
const kpName=k=>(KP[k]||{}).n||k;
const PAL=['#5b8cff','#a57cf5','#e0a100','#12b886','#f08a24','#22a6c9'];
const kpCol=k=>KP[k]?KP[k].c:k==='rest'?'#aebdea':k==='rev'?'#1b2550':PAL[[...String(k)].reduce((a,c)=>a+c.charCodeAt(0),0)%PAL.length];
const rng=seed=>{let s=seed|0;return ()=>{s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};};
const ri=(r,a,b)=>a+Math.floor(r()*(b-a+1));const pk=(r,a)=>a[Math.floor(r()*a.length)];
function gen(k,kind,r){let a,b,c,d;
 if(k==='fadd'){const D=[2,3,4,5,6,8,9,10,12];do{b=pk(r,D);d=pk(r,D);}while(b===d);do{a=ri(r,1,b-1);}while(gcd(a,b)>1);do{c=ri(r,1,d-1);}while(gcd(c,d)>1);const x=F(a,b),y=F(c,d);
  if(kind==='apply'){if(fa(x,y).n<=fa(x,y).d&&r()<0.5)return {q:`一桶水，第一次用去 ${a}/${b}，第二次用去 ${c}/${d}，两次一共用去这桶水的几分之几？`,a:fmtF(fa(x,y))};
   const [big,sm]=x.n*y.d>y.n*x.d?[x,y]:[y,x];if(feq(big,sm))return gen(k,kind,r);return {q:`一根绳子长 ${fmtF(big)} 米，用去 ${fmtF(sm)} 米，还剩多少米？`,a:fmtF(fs(big,sm))+' 米'};}
  if(r()<0.5||x.n*y.d===y.n*x.d)return {q:`${a}/${b} + ${c}/${d} =`,a:fmtF(fa(x,y))};const [big,sm]=x.n*y.d>y.n*x.d?[[a,b],[c,d]]:[[c,d],[a,b]];return {q:`${big[0]}/${big[1]} − ${sm[0]}/${sm[1]} =`,a:fmtF(fs(F(...big),F(...sm)))};}
 if(k==='dmul'){if(kind==='apply'){const p=dec((ri(r,25,95)/10).toFixed(1)),w=dec((ri(r,12,48)/10).toFixed(1));return {q:`苹果每千克 ${fmtD(p)} 元，买 ${fmtD(w)} 千克要多少元？`,a:fmtD(fm(p,w))+' 元'};}
  const x=r()<0.5?dec((ri(r,11,99)/100).toFixed(2)):dec((ri(r,11,99)/10).toFixed(1)),y=dec((ri(r,11,59)/10).toFixed(1));return {q:`${fmtD(x)} × ${fmtD(y)} =`,a:fmtD(fm(x,y))};}
 if(k==='unit'){const C=[['平方米','平方分米',100],['平方分米','平方厘米',100],['平方米','平方厘米',10000]];const [u1,u2,m]=pk(r,C);const v=dec((ri(r,12,95)/10).toFixed(1));
  if(kind==='apply')return {q:`一块桌面的面积是 ${fmtD(v)} ${u1}，合多少${u2}？`,a:fmtD(fm(v,F(m)))+' '+u2};
  if(r()<0.5)return {q:`${fmtD(v)} ${u1} = ___ ${u2}`,a:fmtD(fm(v,F(m)))};const w=F(ri(r,2,95)*m/10);return {q:`${fmtD(w)} ${u2} = ___ ${u1}`,a:fmtD(fd(w,F(m)))};}
 if(k==='eq'){a=ri(r,2,9);const x=ri(r,2,15);b=ri(r,1,30);
  if(kind==='apply')return {q:`买 ${a} 本同样的本子和一支 ${b} 元的笔，一共花了 ${a*x+b} 元。每本本子多少元？（列方程解）`,a:`x = ${x}（元）`};
  if(r()<0.5||a*x-b<=0)return {q:`${a}x + ${b} = ${a*x+b}`,a:`x = ${x}`};return {q:`${a}x − ${b} = ${a*x-b}`,a:`x = ${x}`};}
 if(k==='area'){a=ri(r,2,9);b=a+ri(r,1,8);c=ri(r,2,10);const s=fd(F((a+b)*c),F(2));
  if(kind==='apply')return {q:`一块梯形菜地，上底 ${a} 米，下底 ${b} 米，高 ${c} 米，面积是多少平方米？`,a:fmtD(s)+' 平方米'};return {q:`梯形上底 ${a} cm，下底 ${b} cm，高 ${c} cm，面积 = ___ cm²`,a:fmtD(s)};}
 if(k==='trip'){const v1=5*ri(r,8,18),v2=5*ri(r,8,18),t=ri(r,2,5);
  if(kind==='apply')return {q:`两地相距 ${(v1+v2)*t} 千米，甲车每小时行 ${v1} 千米，乙车每小时行 ${v2} 千米，两车同时相向开出，几小时后相遇？`,a:`${t} 小时`};
  return {q:`甲每小时行 ${v1} 千米，乙每小时行 ${v2} 千米，相向而行 ${t} 小时后相遇，两地相距多少千米？`,a:`${(v1+v2)*t} 千米`};}
 return null;}

/* ---------- the sample worksheet (one paper, three fictional students) ---------- */
const across=(a,b,c,d,op)=>{const n=op>0?a+c:a-c,m=op>0?b+d:b-d;return m>0&&n>=0?F(n,m):null;};
const WHY={across:'分子加（减）分子、分母加（减）分母，没有先通分',dshift:'小数点位置点错了：积的小数位数应等于两个因数小数位数之和',unit10:'面积单位相邻进率是 100，误用了 10',eqinv:'解方程时等式两边应同时减去 5，却加上了 5',half:'梯形面积 =（上底 + 下底）× 高 ÷ 2，忘了除以 2',tdiff:'相向而行求路程要用速度和，误用了速度差',other:'答案错误，要看计算过程才能确定原因'};
const PAPER=[
 {no:1,kp:'fadd',sec:'一、计算',L:['1/2 + 1/3 ='],ans:fa(F(1,2),F(1,3)),fmt:'f',wr:[[across(1,2,1,3,1),'across']]},
 {no:2,kp:'fadd',L:['3/4 − 1/6 ='],ans:fs(F(3,4),F(1,6)),fmt:'f',wr:[]},
 {no:3,kp:'fadd',L:['2/5 + 3/10 ='],ans:fa(F(2,5),F(3,10)),fmt:'f',wr:[[across(2,5,3,10,1),'across']]},
 {no:4,kp:'dmul',L:['0.25 × 1.2 ='],ans:fm(dec('0.25'),dec('1.2')),fmt:'d',wr:[[fm(fm(dec('0.25'),dec('1.2')),F(10)),'dshift'],[fm(fm(dec('0.25'),dec('1.2')),F(100)),'dshift'],[fd(fm(dec('0.25'),dec('1.2')),F(10)),'dshift']]},
 {no:5,kp:'unit',sec:'二、填空',L:['3.5 平方米 = ____ 平方分米'],ans:fm(dec('3.5'),F(100)),fmt:'d',wr:[[fm(dec('3.5'),F(10)),'unit10']]},
 {no:6,kp:'unit',L:['4 平方分米 = ____ 平方厘米'],ans:F(400),fmt:'d',wr:[[F(40),'unit10']]},
 {no:7,kp:'eq',sec:'三、解方程',L:['3x + 5 = 20'],ans:F(5),fmt:'d',wr:[[F(25,3),'eqinv']]},
 {no:8,kp:'area',sec:'四、解决问题',L:['梯形上底 4 cm，下底 6 cm，高 5 cm，','面积是多少平方厘米？'],ans:fd(F((4+6)*5),F(2)),fmt:'d',wr:[[F((4+6)*5),'half']]},
 {no:9,kp:'trip',L:['甲车每小时行 60 km，乙车每小时行 45 km，两车','同时从两地相向开出，2 小时后相遇。两地相距多少千米？'],ans:F((60+45)*2),fmt:'d',wr:[[F((60-45)*2),'tdiff']]},
 {no:10,kp:'fadd',L:['一根绳子长 5/6 米，用去 1/4 米，还剩多少米？'],ans:fs(F(5,6),F(1,4)),fmt:'f',wr:[[across(5,6,1,4,-1),'across']]}];
const qText=q=>q.L.join('');
const SAMP={
 A:{n:'示例同学 A',stu:['2/5','7/12','5/15','0.3','35','400','x=5','25','210','4/2'],flaw:{t:'misread',no:2,read:'1/12'},pref:{wk:1,min:20,ty:['calc'],pace:0}},
 B:{n:'示例同学 B',stu:['5/6','7/12','7/10','3','350','400','x=5','50','30','7/12'],flaw:{t:'reason',no:8,why:'梯形面积公式记错了：用了“上底 × 下底”'},pref:{wk:1,min:30,ty:['apply','fig'],pace:1}},
 C:{n:'示例同学 C',stu:['5/6','1/2','7/10','0.3','350','40','x=25/3','25','210','7/12'],flaw:{t:'miss',no:6},pref:{wk:2,min:20,ty:['calc'],pace:2,rest:1}}};
/* the platform's diagnosis: exact checking + misconception detectors */
function diagnose(stu){const lost=[],kp={};PAPER.forEach((q,i)=>{const v=parseAns(stu[i]);const ok=feq(v,q.ans);const k=kp[q.kp]||(kp[q.kp]={tot:0,lost:0,nos:[]});k.tot+=10;
  if(!ok){const w=q.wr.find(x=>x[0]&&v&&feq(x[0],v));lost.push({no:q.no,kp:q.kp,stu:stu[i],ans:(q.fmt==='f'?fmtF:fmtD)(q.ans),why:w?w[1]:'other'});k.lost+=10;k.nos.push(q.no);}});
 const weak=Object.entries(kp).filter(([,x])=>x.lost).sort((a,b)=>b[1].lost-a[1].lost||b[1].lost/b[1].tot-a[1].lost/a[1].tot).map(([k,x])=>({k,n:kpName(k),lost:x.lost,nos:x.nos}));
 const strong=Object.entries(kp).filter(([,x])=>!x.lost).map(([k])=>k);return {score:100-10*lost.length,lost,weak,strong};}
/* the offline "AI" diagnosis: the platform result with one realistic flaw (示意：AI 可能出现的错误) */
function aiOffline(id){const S=SAMP[id],t=diagnose(S.stu),f=S.flaw;let lost=t.lost.map(x=>({no:x.no,kp:x.kp,stu:x.stu,why:WHY[x.why]}));
 if(f.t==='misread'){const q=PAPER[f.no-1];lost.push({no:f.no,kp:q.kp,stu:f.read,why:`计算错误：${qText(q)} 应得 ${fmtF(q.ans)}，答成了 ${f.read}`});lost.sort((a,b)=>a.no-b.no);}
 if(f.t==='reason')lost=lost.map(x=>x.no===f.no?Object.assign({},x,{why:f.why}):x);
 if(f.t==='miss')lost=lost.filter(x=>x.no!==f.no);
 const kp={};lost.forEach(x=>{kp[x.kp]=(kp[x.kp]||0)+10;});const weak=Object.entries(kp).sort((a,b)=>b[1]-a[1]).map(([k])=>kpName(k));
 const think=[`步骤 1 · 识别试卷：五年级数学练习，共 10 题，每题 10 分；姓名处已遮挡。`,`步骤 2 · 逐题读出学生的答案，与正确答案对照：丢分的是第 ${lost.map(x=>x.no).join('、')} 题。`,`步骤 3 · 分析每道丢分题的原因（看答案的特点，推测错在哪一步）。`,`步骤 4 · 按知识点归类：丢分最多的是「${weak[0]||'—'}」。`,`步骤 5 · 得出诊断：这份试卷约得 ${100-10*lost.length} 分，薄弱点是 ${weak.map(w=>'「'+w+'」').join('')}。`];
 return {lost,weak,sum:`这份试卷约得 ${100-10*lost.length} 分。薄弱点集中在${weak.map(w=>'「'+w+'」').join('、')}${t.strong.length?`；${t.strong.map(kpName).slice(0,3).join('、')}掌握得较好`:''}。`,think,m:'offline'};}


/* ---------- worksheet figure: white paper, blue pen, red marks ---------- */
const tw=s=>[...String(s)].reduce((a,c)=>a+(/[⺀-￿]/.test(c)?15:8.2),0);
function sheetSVG(id,{marks=true,hl=null}={}){const S=SAMP[id];const t=diagnose(S.stu);const lostN=new Set(t.lost.map(x=>x.no));let y=96,o='';
 PAPER.forEach((q,i)=>{if(q.sec){y+=8;o+=`<text x="28" y="${y}" fill="#4c5884" font-size="13" font-weight="700">${q.sec}</text>`;y+=24;}
  const top=y-18,word=q.L.length>1||q.no>=8;if(hl===q.no)o+=`<rect x="14" y="${top-4}" width="532" height="${word?q.L.length*22+34:34}" rx="8" fill="#ffd43b66" stroke="#b97a00" stroke-width="2"/>`;
  o+=`<text x="28" y="${y}" fill="#1b2550" font-size="15"><tspan fill="#4c5884">${q.no}.</tspan> ${esc(q.L[0])}</text>`;q.L.slice(1).forEach((l,j)=>{o+=`<text x="50" y="${y+22*(j+1)}" fill="#1b2550" font-size="15">${esc(l)}</text>`;});
  let ax,ay;if(word){ay=y+22*q.L.length;ax=50;o+=`<text x="${ax}" y="${ay}" fill="#4c5884" font-size="14">答：</text>`;ax+=34;}else{ax=Math.min(360,40+tw(`${q.no}. `+q.L[0]));ay=y;}
  o+=`<text x="${ax}" y="${ay}" fill="#1d4ed8" font-size="19" font-family="Kaiti SC,STKaiti,KaiTi,Comic Sans MS,cursive" font-style="italic">${esc(S.stu[i])}</text>`;
  if(marks){const my=word?y+8:y-6;o+=lostN.has(q.no)?`<path d="M486 ${my-9} l16 16 M502 ${my-9} l-16 16" stroke="#e8472f" stroke-width="3" stroke-linecap="round"/><text x="512" y="${my+6}" fill="#e8472f" font-size="13">−10</text>`:`<path d="M484 ${my} l7 8 l14 -18" fill="none" stroke="#e8472f" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;}
  y+=word?22*q.L.length+34:36;});
 const H=y+10;return `<svg class="l15-sheet" viewBox="0 0 560 ${H}" font-family="Noto Sans SC,PingFang SC,Microsoft YaHei,sans-serif" role="img" aria-label="${esc(S.n)}的数学练习卷（示例）：学生答案和老师的批改记号"><rect width="560" height="${H}" fill="#ffffff"/>
  <text x="28" y="40" fill="#1b2550" font-size="18" font-weight="700">五年级数学 · 单元练习（示例）</text><text x="28" y="66" fill="#4c5884" font-size="13">姓名：</text><rect x="70" y="53" width="92" height="18" rx="3" fill="#1b2550"/><text x="172" y="66" fill="#7f8ab0" font-size="11">（已遮挡）</text>
  <text x="270" y="66" fill="#4c5884" font-size="13">${esc(S.n)} · 虚构学生</text>${marks?`<circle cx="500" cy="44" r="26" fill="none" stroke="#e8472f" stroke-width="2.5"/><text x="500" y="52" text-anchor="middle" fill="#e8472f" font-size="22" font-family="Kaiti SC,STKaiti,KaiTi,cursive">${t.score}</text>`:''}
  <line x1="20" y1="80" x2="540" y2="80" stroke="#d7e0fa" stroke-width="2"/>${o}</svg>`;}
async function svgBlob(svg){const s=svg.replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" width="1120" ');const img=await App.loadImg('data:image/svg+xml;charset=utf-8,'+encodeURIComponent(s));
 const cv=document.createElement('canvas');cv.width=1120;cv.height=Math.round(1120*img.height/img.width)||1400;const c=cv.getContext('2d');c.fillStyle='#ffffff';c.fillRect(0,0,cv.width,cv.height);c.drawImage(img,0,0,cv.width,cv.height);
 return await new Promise(r=>cv.toBlob(r,'image/jpeg',0.9));}

/* ---------- the plan engine (offline / fallback); AI plans use the same shape ---------- */
const TY={calc:'计算',apply:'应用题',fig:'画图理解'};const PACE=['循序渐进','集中突破','交替复习'];
const P0={wk:1,min:20,ty:['calc'],pace:0};
function normP(p){p=Object.assign({},P0,p||{});p.wk=p.wk===2?2:1;p.min=clamp(+p.min||20,10,60);p.ty=(p.ty||[]).filter(t=>TY[t]);if(!p.ty.length)p.ty=['calc'];p.pace=[0,1,2].includes(p.pace)?p.pace:0;p.busy=(p.busy||[]).filter(x=>x>=0&&x<7);return p;}
function makePlan(dx,p0){const p=normP(p0);const N=p.wk*7;let weak=(dx&&dx.weak||[]).slice(0,4);if(!weak.length)weak=[{k:'mix',n:'综合练习',lost:10,nos:[]}];
 const kind=i=>{const d=i%7;return p.rest&&d===6?'rest':d===(p.rest?5:6)?'rev':'study';};
 const study=[];for(let i=0;i<N;i++)if(kind(i)==='study')study.push(i);
 const seq=[];const tot=weak.reduce((a,w)=>a+(w.lost||10),0);
 if(p.pace===2)study.forEach((_,j)=>seq.push(weak[j%weak.length]));
 else{let cnt;if(p.pace===1&&weak.length>1){const a=Math.ceil(study.length*0.6);cnt=[a];const rest=weak.slice(1),rt=rest.reduce((s,w)=>s+(w.lost||10),0);let left=study.length-a;rest.forEach((w,j)=>{const c=j===rest.length-1?left:Math.max(1,Math.round((study.length-a)*(w.lost||10)/rt));cnt.push(c);left-=c;});}
  else{cnt=weak.map(w=>Math.max(1,Math.round(study.length*(w.lost||10)/tot)));let s=cnt.reduce((a,b)=>a+b,0);let j=0;while(s>study.length){if(cnt[j%cnt.length]>1){cnt[j%cnt.length]--;s--;}j++;}j=0;while(s<study.length){cnt[j%cnt.length]++;s++;j++;}}
  weak.forEach((w,j)=>{for(let c=0;c<(cnt[j]||0);c++)seq.push(Object.assign({},w,{pos:c,len:cnt[j]}));});}
 const seen={};const days=[];let si=0;
 for(let i=0;i<N;i++){const lab=`第${i+1}天 · ${WD[i%7]}`,kd=kind(i),r=rng(1009*i+7*N+(p.min|0));
  if(kd==='rest'){days.push({d:lab,k:'rest',f:'休息',t:['休息：不安排练习，读一本喜欢的书或去运动'],m:0});continue;}
  if(kd==='rev'){const n=Math.max(3,Math.round(p.min/4));days.push({d:lab,k:'rev',f:'周复盘',t:[`${p.game?'闯关小测':'限时小测'}：${n} 道题，覆盖本周练过的知识点`,'整理错题本：每道错题写一句“错在哪里”'],m:p.min});continue;}
  const w=seq[si++]||weak[0];const k=w.k,first=!seen[k];seen[k]=1;const KK=KP[k];const busy=p.busy.includes(i%7);
  if(busy){const g=KK?gen(k,'calc',r):null;days.push({d:lab,k,f:w.n,t:[`轻松日：只做 3 道${w.n}小题（约 10 分钟）`],m:Math.min(10,p.min),a:g?`例：${g.q} → ${g.a}`:''});continue;}
  const t=[];let left=p.min;
  if(first&&p.explain){t.push(`讲解：${KK?KK.lesson:`回顾「${w.n}」的概念和一道例题`}`);left-=5;}
  if(first&&p.similar&&(w.nos||[]).length){t.push(`错题重做：试卷第 ${w.nos.join('、')} 题，说出错在哪一步`);left-=5;}
  const tk=p.ty[(i+(p.pace===2?1:0))%p.ty.length];const n=Math.max(2,Math.round(Math.max(left,6)/4*(p.lite?0.6:1)));
  const lvl=p.pace===2?'':w.len>1?(w.pos<w.len/2?'（基础题）':'（提高题）'):'';const pre=p.game?'闯关：':'';
  t.push(tk==='apply'?`${pre}应用题：${n} 道和「${w.n}」有关的应用题${lvl}`:tk==='fig'?`${pre}画图理解：用${KK?KK.fig:'示意图'}理解，再做 ${n} 道题${lvl}`:`${pre}计算练习：${n} 道「${w.n}」${lvl}`);
  if(p.pace===1&&weak.length>1&&w.k===weak[0].k&&w.pos===w.len-1)t.push(`过关检查：再做 2 道「${w.n}」，全对了再换下一个知识点`);
  let a='';if(KK&&(p.similar||first)){const g1=gen(k,tk==='apply'?'apply':'calc',r),g2=gen(k,'calc',r);t.push(`${p.similar?'类似题':'例题'}：① ${g1.q}  ② ${g2.q}`);a=`① ${g1.a}  ② ${g2.a}`;}
  if(p.pace===2&&dx&&dx.strong&&dx.strong.length)t.push(`保持：做 2 道「${kpName(dx.strong[i%dx.strong.length])}」`);
  days.push({d:lab,k,f:w.n,t,m:busy?10:p.min,a});}
 const wn=weak.filter(w=>w.k!=='mix').map(w=>'「'+w.n+'」');
 return {src:'engine',p,g:`${p.wk===2?'两周':'一周'}内，把${wn.join('、')||'各知识点'}的正确率提高到 90% 以上${dx&&dx.strong&&dx.strong.length?`，同时保持${dx.strong.slice(0,2).map(k=>'「'+kpName(k)+'」').join('')}的优势`:''}。`,d:days,tips:['每道题先自己做，再对答案','做错的题写进错题本，过三天再做一遍','方案先请老师或家长看一看，再开始执行']};}
/* compact storage of plans (engine plans are regenerated from their settings) */
function packPlan(pl){if(!pl)return null;if(pl.src==='engine')return {src:'engine',p:pl.p};return {src:'ai',m:pl.m,g:clip(pl.g,80),d:pl.d.slice(0,14).map(x=>[clip(x.d,12),clip(x.f,14),x.t.slice(0,3).map(s=>clip(s,40)).join('|'),x.m]),tips:(pl.tips||[]).slice(0,3).map(s=>clip(s,30))};}
function unpackPlan(pk,dx){if(!pk)return null;if(pk.src==='engine')return makePlan(dx,pk.p);return {src:'ai',m:pk.m,g:pk.g||'',d:(pk.d||[]).map(x=>({d:x[0],f:x[1],k:/休息/.test(x[1])?'rest':/复盘|小测/.test(x[1])?'rev':kpOf(x[1])||x[1],t:String(x[2]||'').split('|').filter(Boolean),m:+x[3]||0})),tips:pk.tips||[]};}
/* validate / repair an AI plan */
function fromAI(j,m){if(!j||typeof j!=='object')return null;const ds=Array.isArray(j.days)?j.days:Array.isArray(j.plan)?j.plan:null;if(!ds||ds.length<3)return null;
 const d=ds.slice(0,14).map((x,i)=>{x=x||{};const f=clip(x.focus||x.f||x.topic||'练习',14);const t=(Array.isArray(x.tasks)?x.tasks:[x.tasks||x.task||'']).map(s=>clip(typeof s==='string'?s:JSON.stringify(s),40)).filter(Boolean).slice(0,3);
  return {d:clip(x.d||x.day||`第${i+1}天 · ${WD[i%7]}`,12),f,k:/休息/.test(f)?'rest':/复盘|小测|总结/.test(f)?'rev':kpOf(f)||f,t:t.length?t:['（AI 没有写任务）'],m:clamp(Math.round(+x.min||+x.minutes||0),0,120)};});
 return {src:'ai',m,g:clip(j.goal||j.g||'',80),d,tips:(Array.isArray(j.tips)?j.tips:[]).map(s=>clip(s,30)).slice(0,3)};}
/* requirements: parse a sentence -> structured constraints, memory facts, and plan settings */
function parseReq(t){t=String(t||'');const o={};let m;
 if(/两周|2\s*周|两个星期|二周|14\s*天|半个月/.test(t))o.wk=2;else if(/一周|1\s*周|一个星期|7\s*天/.test(t))o.wk=1;
 if((m=/(\d+)\s*分钟/.exec(t)))o.min=clamp(+m[1],10,60);else if(/半小时|半个小时/.test(t))o.min=30;
 if(/周末.{0,4}(休息|不学|玩)|周日.{0,3}休息|星期天.{0,3}休息|休息一天/.test(t))o.rest=1;
 if((m=/(?:周|星期)([一二三四五六日天])[^，。,；]{0,8}(课|没空|忙|没时间|训练|比赛)/.exec(t)))o.busy=['一二三四五六'.indexOf(m[1])>=0?'一二三四五六'.indexOf(m[1]):6];
 if(/讲解|讲一讲|不太懂|不懂|概念|为什么/.test(t))o.explain=1;
 if(/类似|同类|错题|相似/.test(t))o.similar=1;
 const ty=[];if(/应用题|解决问题/.test(t))ty.push('apply');if(/画图|图形|看图/.test(t))ty.push('fig');if(/计算|口算/.test(t))ty.push('calc');if(ty.length)o.ty=ty;
 if(/游戏|闯关|有趣|好玩/.test(t))o.game=1;
 if(/集中|突破|先攻/.test(t))o.pace=1;else if(/循序|慢慢|先易后难|由易到难/.test(t))o.pace=0;else if(/交替|轮流|穿插/.test(t))o.pace=2;
 if(/太多|少一点|少一些|减少|太累/.test(t))o.lite=1;return o;}
const MEM={wk:o=>`我希望方案是${o.wk===2?'两周':'一周'}`,min:o=>`我每天能学 ${o.min} 分钟`,rest:()=>'我周末要休息一天',busy:o=>`我${WD[o.busy[0]]}没空（有课）`,explain:()=>'我需要多一些概念讲解',similar:()=>'我想围绕错题练类似的题',ty:o=>`我喜欢${o.ty.map(x=>TY[x]).join('、')}`,game:()=>'我喜欢闯关式的练习',pace:o=>`我喜欢「${PACE[o.pace]}」的节奏`,lite:()=>'我觉得题量要少一点'};
const memOf=o=>Object.keys(MEM).filter(k=>o[k]!=null).map(k=>MEM[k](o));
function mergeReq(base,o){const b=Object.assign({},base);Object.keys(o).forEach(k=>{if(k==='ty')b.ty=[...new Set([...(o.ty||[])])];else if(k==='busy')b.busy=[...new Set([...(b.busy||[]),...o.busy])];else b[k]=o[k];});return b;}
/* the platform checks every plan against the requirements the student gave */
const RQ={wk:['方案天数',(pl,o)=>pl.d.length===o.wk*7],min:['每天不超过时长',(pl,o)=>pl.d.every(x=>x.m<=o.min+2)],rest:['周末休息一天',pl=>pl.d.filter((x,i)=>i%7===5||i%7===6).some(x=>x.m===0||/休息/.test(x.f+x.t.join('')))&&pl.d.length>=6],
 busy:['没空的那天轻松',(pl,o)=>o.busy.every(b=>pl.d.filter((x,i)=>i%7===b).every(x=>x.m<=12||/休息|轻松/.test(x.f+x.t.join(''))))],explain:['有知识点讲解',pl=>pl.d.some(x=>/讲解|概念|例题/.test(x.t.join('')))],
 similar:['有错题和类似题',pl=>pl.d.some(x=>/类似|错题/.test(x.t.join('')))],ty:['题型符合偏好',(pl,o)=>o.ty.every(t=>pl.d.filter(x=>(t==='apply'?/应用/:t==='fig'?/画图|图/:/计算|口算/).test(x.t.join(''))).length>=2)],
 game:['闯关的方式',pl=>pl.d.some(x=>/闯关|游戏|挑战/.test(x.t.join('')))]};
function checkPlan(pl,o){const r={};Object.keys(RQ).forEach(k=>{if(o[k]!=null){try{r[k]=RQ[k][1](pl,o)?1:0;}catch(e){r[k]=0;}}});return r;}
/* what changed between two plans */
function planDiff(a,b){if(!a||!b)return {rows:{},list:[]};const rows={},list=[];if(a.d.length!==b.d.length)list.push(`方案从 ${a.d.length} 天变成 ${b.d.length} 天`);
 b.d.forEach((x,i)=>{const y=a.d[i];if(!y){rows[i]='new';return;}const ch=[];if(y.f!==x.f)ch.push(`重点「${y.f}」→「${x.f}」`);if(y.m!==x.m)ch.push(`${y.m} → ${x.m} 分钟`);if(y.t.join('')!==x.t.join('')&&!ch.length)ch.push('任务调整');if(ch.length){rows[i]='chg';if(list.length<6)list.push(`${x.d}：${ch.join('，')}`);}});
 const na=b.d.filter((x,i)=>rows[i]==='new').length;if(na)list.push(`新增 ${na} 天`);if(!list.length)list.push('没有变化');return {rows,list};}
const ckLine=(pl,o)=>{const c=checkPlan(pl,o),ks=Object.keys(c);if(!ks.length)return '';return `<div class="l15-cks">${ks.map(k=>`<span class="${c[k]?'ok':'bad'}">${c[k]?'✓':'✗'} ${RQ[k][0]}</span>`).join('')}</div>`;};

/* ---------- plan view: one cell per day; changed days carry a 改 badge ---------- */
function planHTML(pl,{diff=null,mini=false,list=true}={}){if(!pl)return '<div class="l15-empty">还没有学习方案。</div>';const rows=(diff||{}).rows||{};
 const cell=(x,i)=>`<div class="l15-day ${rows[i]?'chg':''} ${x.m===0?'rest':''}" style="--kc:${kpCol(x.k)}" title="${esc(x.t.join('\n'))}"><span class="dl">${esc(x.d.replace(/^第(\d+)天 · /,'$1 '))}</span><b>${esc(mini&&KP[x.k]?KP[x.k].s:x.f)}</b>${mini?'':`<span class="tt">${esc(cut(x.t[0]||'',22))}</span>`}<span class="mm">${x.m}${mini?'′':' 分钟'}</span>${rows[i]?`<i>${rows[i]==='new'?'新':'改'}</i>`:''}</div>`;
 return `<div class="l15-plan">${pl.g?`<p class="l15-goal"><b>目标</b>${esc(pl.g)}</p>`:''}<div class="l15-week">${pl.d.map(cell).join('')}</div>
  ${list?`<details class="l15-more"><summary>看每天的任务${pl.d.some(x=>x.a)?'（含类似题答案）':''}</summary><div class="scroll"><table class="rep l15-tasks"><tbody>${pl.d.map((x,i)=>`<tr class="${rows[i]?'chg':''}"><td>${esc(x.d)}</td><td>${esc(x.f)}</td><td>${x.t.map(esc).join('<br>')}${x.a?`<details class="l15-ans"><summary>答案</summary>${esc(x.a)}</details>`:''}</td><td>${x.m}′</td></tr>`).join('')}</tbody></table></div>${pl.tips&&pl.tips.length?`<p class="note">提醒：${pl.tips.map(esc).join('；')}</p>`:''}</details>`:''}</div>`;}
const planStats=pl=>{const all=pl.d.map(x=>x.t.join(''));return {days:pl.d.length,min:Math.max(...pl.d.map(x=>x.m)),calc:all.filter(s=>/计算|口算/.test(s)).length,apply:all.filter(s=>/应用/.test(s)).length,fig:all.filter(s=>/画图/.test(s)).length,focus:[...new Set(pl.d.filter(x=>x.m>0&&x.k!=='rev').map(x=>x.f))]};};

/* ---------- AI helpers ---------- */
const ctls=new Set();function stopAll(){ctls.forEach(c=>{try{c.abort();}catch(e){}});ctls.clear();}
async function ask(prompt,{onText,tier='default',images=null}={}){if(!App.AI.real())return {off:1};const c=new AbortController();ctls.add(c);
 try{const r=await App.AI.chat(prompt,{onText,signal:c.signal,tier,images,system:'你在为小学高年级学生（9–12 岁）的人工智能通识课做演示。语言简洁、准确、适合儿童，不涉及任何真实个人信息。'});if(!r)return {off:1};return r;}
 catch(e){if(e&&(e.code==='cancelled'||e.name==='AbortError'))return {cancel:1};App.AI.fail&&App.AI.fail(e);return {off:1,err:App.AI.errText(e)};}finally{ctls.delete(c);}}
function jsonIn(t){t=String(t||'');let s=null;const m=/```(?:json)?\s*([\s\S]*?)```/i.exec(t);if(m)s=m[1];else{const a=t.indexOf('{'),b=t.lastIndexOf('}');if(a>=0&&b>a)s=t.slice(a,b+1);}if(!s)return null;
 try{return JSON.parse(s);}catch(e){try{return JSON.parse(s.replace(/,\s*([}\]])/g,'$1').replace(/[“”]/g,'"'));}catch(e2){return null;}}}
const before=t=>String(t||'').split(/```|\{/)[0].split('\n').map(s=>s.trim()).filter(Boolean);
const modeLine=()=>App.AI.real()?`${App.AI.label()}，约 10–40 秒，可随时停止`:'离线演示：内置程序和预置示例';
const more=h=>`<details class="more"><summary>说明</summary>${h}</details>`;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let tT=0;const touchSoon=()=>{clearTimeout(tT);tT=setTimeout(App.touch,600);};
const chips=(g,opts,cur,multi)=>`<span class="l15-chips" data-g="${g}" style="display:contents">${opts.map((o,i)=>{const on=multi?(cur||[]).includes(i):cur===i;return `<button type="button" class="chip ${on?'on':''}" data-i="${i}" aria-pressed="${on}">${esc(o)}</button>`;}).join('')}</span>`;
function wire(root,g,fn,multi){$$(`[data-g="${g}"] .chip`,root).forEach(b=>b.onclick=()=>{if(multi){b.classList.toggle('on');b.setAttribute('aria-pressed',b.classList.contains('on'));fn($$(`[data-g="${g}"] .chip.on`,root).map(x=>+x.dataset.i));}else{$$(`[data-g="${g}"] .chip`,root).forEach(x=>{x.classList.toggle('on',x===b);x.setAttribute('aria-pressed',x===b);});fn(+b.dataset.i);}});}
const up=(k,o)=>{const l=App.lesson(K);l[k]=Object.assign(l[k]||{},o);return l[k];};
const refresh=(...ks)=>(ks.length?ks:['_dp1','_dr2','_dr3','_dr4','_fin']).forEach(k=>{try{L[k]&&L[k]();}catch(e){console.warn(e);}});
const exp=()=>{const l=App.lesson(K);l.nExp=(l.nExp||0)+1;};
/* clear the 方案调整台 history but remember the best run (count, text, number of requirement kinds) so that scores never drop */
function resetS2(o){o=o||{};const h=o.h||[],kp=o.keep||{};const txt=h.map(x=>x.r).join('');const n=Math.max(kp.n||0,h.length);const r={};if(o.o3!=null)r.o3=o.o3;
 if(n)r.keep={n,t:txt.length>=String(kp.t||'').length?clip(txt,160):kp.t,rq:Math.max(kp.rq||0,Object.keys(o.rq||{}).length)};return r;}

/* ---------- current diagnosis (corrected by the student's check) ---------- */
function curDx(lr){lr=lr||App.lesson(K);const s1=lr.s1||{};if(s1.dx)return s1.dx;if(s1.src&&SAMP[s1.src]&&(s1.vf||{}).done){const t=diagnose(SAMP[s1.src].stu);return {score:t.score,weak:t.weak,strong:t.strong};}return null;}
function compactDx(t){return {score:t.score,weak:t.weak.slice(0,4).map(w=>({k:clip(w.k,14),n:clip(w.n,14),lost:w.lost||10,nos:(w.nos||[]).slice(0,4)})),strong:(t.strong||[]).slice(0,4).map(s=>clip(s,14))};}
/* the diagnosis a plan is built on: the student-checked one, or (before checking) the teacher's marking of the chosen sample paper */
function baseDx(lr){lr=lr||App.lesson(K);const d=curDx(lr);if(d)return d;const k=(lr.s1||{}).src;return compactDx(diagnose((SAMP[k]||SAMP.A).stu));}
function myPlan(lr){lr=lr||App.lesson(K);const dx=baseDx(lr);const s2=lr.s2||{};return unpackPlan(s2.plan||(lr.s1||{}).plan,dx);}

/* ---------- memory facts from the student's own platform record ---------- */
function facts(){const r=App.rec;if(!r)return [];const out=[];const lr=App.lesson(K);
 const prog=App.LESSONS.map(l=>({l,p:App.progress(l.k,r)}));const done=prog.filter(x=>x.p>=0.8).length,started=prog.filter(x=>x.p>0).length;
 if(started){const us=App.UNITS.map(u=>({u,p:App.engagement(r,u.id)})).sort((a,b)=>b.p-a.p);out.push({id:'prog',t:`我在 15 讲中完成了 ${done} 讲（开始过 ${started} 讲），最投入的是「${us[0].u.name}」单元（完成 ${us[0].p}%）`,src:'各讲进度',keys:[`${done} 讲`,`${done}/15`,us[0].u.name]});}
 const sc=App.scoreAll(r);const ds=App.DIMS.filter(d=>sc[d.k]!=null).sort((a,b)=>sc[b.k]-sc[a.k]);
 if(ds.length>=2){const a=ds[0],b=ds[ds.length-1];out.push({id:'dims',t:`我的六维能力里最强的是「${a.n}」（${sc[a.k]} 分），最需要加强的是「${b.n}」（${sc[b.k]} 分）`,src:'能力图谱',keys:[a.n,b.n]});}
 let works=[];App.LESSON_KEYS.forEach(k=>{const LL=App.lessons[k];if(LL&&LL.works&&k!==K){try{(LL.works((r.lessons||{})[k]||{})||[]).forEach(w=>works.push(Object.assign({k},w)));}catch(e){}}});
 if(works.length)out.push({id:'works',t:`我在平台上完成了 ${works.length} 件作品，例如「${clip(works[works.length-1].t,16)}」`,src:'作品墙',keys:[`${works.length} 件`,clip(works[works.length-1].t,6)]});
 const dia=App.LESSON_KEYS.filter(k=>(((r.lessons||{})[k]||{}).diary||{}).submitted).length;if(dia)out.push({id:'diary',t:`我提交了 ${dia} 篇成长日记`,src:'成长日记',keys:[`${dia} 篇`]});
 let qn=0,qok=0;App.LESSON_KEYS.forEach(k=>{const Q=((r.lessons||{})[k]||{}).quiz||{};Object.values(Q).forEach(x=>{qn++;if(x&&x.ok)qok++;});});if(qn>=3)out.push({id:'quiz',t:`我做了 ${qn} 道小测验，第一次就答对 ${Math.round(100*qok/qn)}%`,src:'小测验',keys:[`${Math.round(100*qok/qn)}%`,`${qn} 道`]});
 let ne=0;App.LESSON_KEYS.forEach(k=>{const LL=App.lessons[k];if(LL&&LL.expCount){try{ne+=+LL.expCount((r.lessons||{})[k]||{})||0;}catch(e){}}});if(ne)out.push({id:'exp',t:`我一共做了 ${ne} 次 AI 实验`,src:'实验记录',keys:[`${ne} 次`]});
 const dx=curDx(lr);if(dx&&dx.weak&&dx.weak.length)out.push({id:'diag',t:`最近一次数学练习约 ${dx.score!=null?dx.score+' 分，':''}薄弱点是${dx.weak.map(w=>'「'+w.n+'」').join('、')}`,src:'第15讲 学习诊断仪',keys:dx.weak.map(w=>w.n)});
 const mem=((lr.s2||{}).mem||[]);if(mem.length)out.push({id:'pref',t:`我的学习偏好：${mem.slice(-4).join('；')}`,src:'第15讲 方案调整台',keys:mem.slice(-4).map(s=>s.replace(/^我/,'').slice(0,6))});
 return out;}

/* ---------- figures (light theme) ---------- */
function journeySVG(r,{w=640,small=false}={}){const U=App.UNITS,cw=w/5,H=small?130:170;let o=`<svg class="l15-fig" viewBox="0 0 ${w} ${H}" style="max-width:${small?w:w*1.25}px;margin:0 auto" role="img" aria-label="15 讲学习旅程图：每个圆点是一讲，填充越满表示完成越多">`;
 const pts=[];U.forEach((u,i)=>{u.lessons.forEach((l,j)=>{pts.push({x:cw*i+cw/2+(j-1)*cw*0.28,y:(small?62:78)+(j===1?-18:12),l,u});});});
 o+=`<path d="${pts.map((p,i)=>(i?'L':'M')+p.x.toFixed(1)+' '+p.y).join(' ')}" fill="none" stroke="#aebdea" stroke-width="3" stroke-dasharray="2 7" stroke-linecap="round"/>`;
 U.forEach((u,i)=>{o+=`<text x="${cw*i+cw/2}" y="18" text-anchor="middle" fill="#4c5884" font-size="12">${u.no}</text><text x="${cw*i+cw/2}" y="${H-10}" text-anchor="middle" fill="#1b2550" font-weight="700" font-size="${small?12:13.5}">${u.name}</text>`;});
 pts.forEach(p=>{const v=r?App.progress(p.l.k,r):0,R=small?11:14,a=-Math.PI/2+v*2*Math.PI,x2=p.x+R*Math.cos(a),y2=p.y+R*Math.sin(a);const n=+p.l.k.slice(1);
  o+=`<circle cx="${p.x}" cy="${p.y}" r="${R}" fill="#ffffff" stroke="#aebdea" stroke-width="2.5"/>`;
  if(v>=0.999)o+=`<circle cx="${p.x}" cy="${p.y}" r="${R}" fill="#12b886" stroke="#1b2550" stroke-width="2.5"/>`;else if(v>0)o+=`<path d="M${p.x} ${p.y-R} A${R} ${R} 0 ${v>0.5?1:0} 1 ${x2.toFixed(1)} ${y2.toFixed(1)}" fill="none" stroke="#12b886" stroke-width="4" stroke-linecap="round"/>`;
  o+=`<text x="${p.x}" y="${p.y+4}" text-anchor="middle" fill="${v>=0.999?'#ffffff':v>0?'#1b2550':'#7f8ab0'}" font-size="11.5" font-weight="700">${n}</text>`;});
 return o+'</svg>';}
function barsSVG(items,{w=320,label='',max=100}={}){const H=26*items.length+(label?22:6);let o=`<svg class="l15-fig" viewBox="0 0 ${w} ${H}" style="max-width:${w*1.35}px" role="img" aria-label="${esc(label||'条形图')}">${label?`<text x="0" y="14" fill="#4c5884" font-size="12">${esc(label)}</text>`:''}`;
 items.forEach((it,i)=>{const y=(label?22:4)+i*26;const bw=Math.max(2,(w-150)*Math.min(1,it.v/max));o+=`<text x="0" y="${y+14}" fill="#1b2550" font-size="12.5">${esc(cut(it.n,8))}</text><rect x="110" y="${y+3}" width="${w-150}" height="12" rx="6" fill="#1b255012"/><rect x="110" y="${y+3}" width="${bw.toFixed(1)}" height="12" rx="6" fill="${it.c||'#2f6bff'}"/><text x="${w}" y="${y+14}" text-anchor="end" fill="#4c5884" font-size="12" font-weight="700">${esc(it.l!=null?it.l:it.v)}</text>`;});return o+'</svg>';}
const SKILLS=[['see','会看'],['draw','会画'],['hear','会听'],['say','会说'],['tr','会译'],['write','会写'],['search','会搜'],['code','会编'],['think','会思']];
function agentSVG(on,name){on=on||[];const cx=170,cy=130,R=96;let o=`<svg class="l15-fig" viewBox="0 0 340 262" role="img" aria-label="智能体示意图：中心是记忆和自主规划，外圈是九项本领，选中的本领被点亮">`;
 o+=`<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="#aebdea" stroke-width="2" stroke-dasharray="3 6"/>`;
 SKILLS.forEach(([k,n],i)=>{const a=-Math.PI/2+i*2*Math.PI/SKILLS.length,x=cx+R*Math.cos(a),y=cy+R*Math.sin(a),s=on.includes(k);o+=`<line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="${s?'#7d5cf0':'#d7e0fa'}" stroke-width="${s?3:1.5}"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="22" fill="${s?'#7d5cf0':'#ffffff'}" stroke="${s?'#1b2550':'#aebdea'}" stroke-width="2.5"/><text x="${x.toFixed(1)}" y="${(y+4.5).toFixed(1)}" text-anchor="middle" fill="${s?'#ffffff':'#7f8ab0'}" font-size="12.5" font-weight="700">${n}</text>`;});
 o+=`<circle cx="${cx}" cy="${cy}" r="47" fill="#fff5cc" stroke="#1b2550" stroke-width="2.5"/><text x="${cx}" y="${cy-14}" text-anchor="middle" fill="#8a5a00" font-size="11" font-weight="700">记忆 · 自主规划</text><text x="${cx}" y="${cy+7}" text-anchor="middle" fill="#1b2550" font-size="16" font-weight="700">${esc(cut(name||'智能体',6))}</text><text x="${cx}" y="${cy+25}" text-anchor="middle" fill="#4c5884" font-size="11">${on.length} 项本领协同</text>`;
 return o+'</svg>';}
function sceneSVG(w,small){const W=small?160:220,H=small?96:120;const P='#2f6bff',A='#ef9a00',D='#8a98c8',G='#12b886',V='#7d5cf0';
 const person=(x,y,c=P)=>`<circle cx="${x}" cy="${y}" r="7" fill="#ffffff" stroke="${c}" stroke-width="2.5"/><path d="M${x-11} ${y+26} q11 -22 22 0" fill="none" stroke="${c}" stroke-width="2.5"/>`;
 const ai=(x,y)=>`<rect x="${x-11}" y="${y-9}" width="22" height="20" rx="6" fill="#fff5cc" stroke="${A}" stroke-width="2.5"/><circle cx="${x-4}" cy="${y+1}" r="2" fill="${A}"/><circle cx="${x+4}" cy="${y+1}" r="2" fill="${A}"/><line x1="${x}" y1="${y-9}" x2="${x}" y2="${y-15}" stroke="${A}" stroke-width="2.5"/>`;
 let g='';
 if(w==='school')g=`<rect x="70" y="18" width="110" height="58" rx="4" fill="#ffffff" stroke="${D}" stroke-width="2"/><path d="M84 34h50M84 46h70M84 58h40" stroke="${P}" stroke-opacity=".5" stroke-width="2.5"/>${person(40,62)}${ai(196,68)}`;
 else if(w==='home')g=`<path d="M60 56 L110 20 L160 56 V96 H60 Z" fill="#ffffff" stroke="${D}" stroke-width="2"/><rect x="98" y="66" width="22" height="30" fill="none" stroke="${D}" stroke-width="2"/>${person(30,64)}${person(52,70,G)}${ai(188,72)}`;
 else if(w==='field')g=`<circle cx="186" cy="26" r="12" fill="#fff5cc" stroke="${A}" stroke-width="2.5"/><path d="M10 96 Q60 70 110 96 T210 96" fill="none" stroke="${G}" stroke-width="2.5"/><path d="M40 92v-16M60 88v-18M80 90v-14M100 94v-16" stroke="${G}" stroke-width="2.5"/>${person(140,58)}${ai(170,72)}`;
 else if(w==='science'||w==='space')g=`<circle cx="160" cy="38" r="18" fill="#ffffff" stroke="${V}" stroke-width="2.5"/><ellipse cx="160" cy="38" rx="30" ry="8" fill="none" stroke="${V}" stroke-opacity=".55" stroke-width="2"/><path d="M60 92 l20 -40 l20 40" fill="none" stroke="${D}" stroke-width="2"/><path d="M76 60h8" stroke="${D}" stroke-width="2"/>${person(30,64)}${ai(120,74)}`;
 else g=`<path d="M20 96V50h30v46M60 96V30h36v66M106 96V58h28v38M144 96V40h34v56" fill="#ffffff" stroke="${D}" stroke-width="2"/><path d="M10 100h200" stroke="${D}" stroke-width="2"/>${person(194,62)}${ai(30,30)}`;
 return `<svg class="l15-scene" viewBox="0 0 220 120" width="${W}" height="${H}" role="img" aria-label="示意插图：人和 AI 在${{school:'学校',home:'家里',field:'田野',science:'实验室',space:'太空',city:'城市'}[w]||'城市'}一起工作"><rect width="220" height="120" rx="10" fill="#e9f0ff"/>${g}</svg>`;}
function weakSVG(dx){if(!dx||!dx.weak||!dx.weak.length)return '';return barsSVG(dx.weak.map(w=>({n:w.n,v:w.lost,l:`−${w.lost}`,c:kpCol(w.k)})),{label:'各知识点丢分',max:Math.max(30,...dx.weak.map(w=>w.lost))});}
function planStrip(pl){if(!pl)return '';const n=pl.d.length,w=320,cw=w/Math.min(n,7);let o=`<svg class="l15-fig" viewBox="0 0 ${w} ${n>7?96:56}" font-family="Noto Sans SC,PingFang SC,Microsoft YaHei,sans-serif" role="img" aria-label="学习方案日程条：每格一天，颜色表示重点知识点">`;
 pl.d.forEach((x,i)=>{const X=(i%7)*cw,Y=i>=7?44:4;o+=`<rect x="${X+1}" y="${Y}" width="${cw-2}" height="34" rx="6" fill="${kpCol(x.k)}" fill-opacity="${x.m?'.22':'.1'}" stroke="${kpCol(x.k)}" stroke-width="1.5"/><text x="${X+cw/2}" y="${Y+14}" text-anchor="middle" fill="#1b2550" font-size="10" font-weight="700">${WD[i%7]}</text><text x="${X+cw/2}" y="${Y+28}" text-anchor="middle" fill="#1b2550" font-size="9.5">${esc(KP[x.k]?KP[x.k].s:cut(x.f,4))}</text>`;});return o+'</svg>';}

/* ---------- CSS (v3 light theme; only what the shared roles do not cover) ---------- */
const CSS15=`
.l15-col{display:flex;flex-direction:column;gap:14px;min-width:0}
.l15-lab{font-weight:700;font-size:15.5px;color:var(--ink)}
.l15-ai{font-size:12px;border:2px solid var(--grape);color:var(--grape-d);padding:0 7px;border-radius:999px;white-space:nowrap;margin-right:6px;background:#fff}
.l15-src{font-size:12.5px;color:var(--muted);display:inline-flex;align-items:center;flex-wrap:wrap}
.l15-empty{display:grid;place-items:center;min-height:90px;color:var(--muted);font-size:14px;text-align:center;padding:14px;background:#fff;border:2px dashed var(--line2);border-radius:14px}
.l15-sheet{width:100%;height:auto;display:block;border-radius:16px;border:1.5px solid var(--line2);box-shadow:0 4px 16px #5a3fd012;background:#fff}
.l15-fig{width:100%;height:auto;display:block}
.l15-scene{display:block;width:100%;height:auto;border-radius:10px}
.l15-figbox{background:#fff;border:1.5px solid var(--line2);border-radius:16px;padding:10px;align-self:start}
.l15-figbox svg{max-width:300px;margin:0 auto}
.l15-figbox.wide{align-self:stretch}
.l15-figbox.wide svg{max-width:820px}
.l15-err{display:flex;flex-direction:column;gap:12px}
.l15-err div{display:flex;align-items:center;gap:12px;padding:14px 18px;border-radius:16px;border:1.5px solid var(--line2);background:var(--paper);font-size:22px;font-weight:700;color:var(--ink)}
.l15-err .stu{font-family:"Kaiti SC",STKaiti,KaiTi,serif;color:#1d4ed8;font-size:27px}
.l15-err .x{color:var(--red);font-size:26px;margin-left:auto}
.l15-calc{display:flex;flex-direction:column;gap:6px;margin-top:8px;font-size:15px}
.l15-calc div{display:flex;flex-wrap:wrap;gap:4px 10px;align-items:baseline;padding:6px 10px;border-radius:12px;background:#fff;border:2px solid #7d5cf044}
.l15-calc em{font-style:normal;font-weight:700;color:var(--mint-d);margin-left:auto}
.l15-think{font-size:14.5px;color:var(--muted)}
.l15-lost{display:flex;flex-direction:column;gap:6px;margin-top:8px}
.l15-li{display:flex;gap:8px;align-items:baseline;width:100%;text-align:left;font:inherit;color:var(--ink);cursor:pointer;padding:8px 10px;border:2px solid #7d5cf044;border-radius:12px;background:#fff;font-size:15px;line-height:1.5}
.l15-li>span:nth-child(2){flex:1;min-width:0}
.l15-li:hover{border-color:var(--grape)}
.l15-li .no{font-weight:700;color:var(--grape-d);white-space:nowrap}
.l15-li em{font-style:normal;font-size:12.5px;font-weight:700;white-space:nowrap}
.l15-li.hit{border-color:var(--coral);background:var(--coral-soft)}.l15-li.hit em{color:var(--coral-d)}
.l15-li.fine{border-color:var(--mint);background:var(--mint-soft)}.l15-li.fine em{color:var(--mint-d)}
@media (min-width:881px){#l15-paper{position:sticky;top:76px;align-self:start}}
.l15-two{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px}
.l15-two>div{display:flex;flex-direction:column;gap:5px;padding:10px 12px;border-radius:14px;border:2px solid var(--line2);background:#fff;min-width:0;font-size:14px}
.l15-two>div.me{border-color:var(--mint);background:var(--mint-soft)}
.l15-two b{font-size:15px}.l15-two i{font-style:normal;color:var(--muted)}.l15-two i::before{content:"· "}
.l15-two small{font-size:13px;font-weight:700;color:var(--grape-d);margin-top:2px}
.l15-rs{align-self:flex-start}
.l15-cks{display:flex;flex-wrap:wrap;gap:6px;font-size:13.5px;margin-top:8px}
.l15-cks span{padding:1px 10px;border-radius:999px;border:2px solid var(--line2);background:#fff;color:var(--ink)}
.l15-cks .ok{color:var(--mint-d);border-color:var(--mint)}.l15-cks .bad{color:var(--coral-d);border-color:var(--coral);background:var(--coral-soft)}
.l15-chg{margin:6px 0 0;padding-left:20px;font-size:14.5px;color:var(--muted)}
.l15-plan{display:flex;flex-direction:column;gap:8px}
.l15-goal{font-size:15px}.l15-goal b{color:var(--grape-d);font-size:13px;margin-right:8px}
.l15-week{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:8px 6px}
.l15-day{position:relative;display:flex;flex-direction:column;gap:2px;padding:6px 6px 5px;border-radius:10px;background:#fff;border:2px solid var(--line);border-top:6px solid var(--kc);min-width:0;font-size:12.5px;color:var(--ink)}
.l15-day .dl{font-size:11.5px;color:var(--muted)}
.l15-day b{font-size:12.5px;font-weight:700;line-height:1.3;overflow-wrap:anywhere}
.l15-day .tt{color:var(--muted);font-size:12px;line-height:1.35}
.l15-day .mm{font-size:11.5px;color:var(--sky);margin-top:auto;font-weight:700}
.l15-day.rest{background:var(--panel2)}
.l15-day.chg{border-color:var(--coral);border-top-color:var(--kc);box-shadow:0 0 0 2px var(--coral)}
.l15-day i{position:absolute;top:-11px;right:-5px;font-style:normal;font-size:11px;font-weight:700;color:#fff;background:var(--coral-d);border-radius:999px;padding:0 6px;line-height:16px}
.l15-tasks td{font-size:13.5px;vertical-align:top}.l15-tasks tr.chg td{background:var(--coral-soft)}
.l15-ans summary{cursor:pointer;color:var(--sky);font-size:13px}
details.l15-more>summary{cursor:pointer;color:var(--sky);font-size:14.5px;font-weight:700}
.l15-ptitle{font-family:var(--f-display);font-weight:800;font-size:18px;color:var(--ink)}
.l15-pbox{background:var(--bg2);border:1.5px solid var(--line2);border-radius:16px;padding:14px;display:flex;flex-direction:column;gap:10px}
.l15-memk{border:0!important;background:none!important;padding-left:0!important;color:var(--muted)!important}
.l15-cmp{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.l15-cmpc{display:flex;flex-direction:column;gap:8px;padding:12px 12px 14px;border:1.5px solid var(--line2);border-radius:16px;background:#fff;min-width:0}
.l15-cmpc.me{background:var(--sky-soft)}
.l15-cmpc h3{font-family:var(--f-display);font-weight:800;font-size:19px}
.l15-kps{display:flex;flex-wrap:wrap;gap:5px}.l15-kps span{font-size:13px;padding:1px 9px;border-radius:999px;border:2px solid var(--kc);background:#fff;color:var(--ink)}
.l15-facts{display:flex;flex-direction:column;gap:6px;margin:8px 0}
.l15-fact{display:grid;grid-template-columns:24px minmax(0,1fr);gap:8px;align-items:start;padding:7px 10px;border:2px solid var(--line);border-radius:12px;background:#fff;font-size:14px}
.l15-fact small{display:block;color:var(--muted);font-size:12.5px}
.l15-fact.used{border-color:var(--mint)}.l15-fact.used small::after{content:" · 已被演示文稿用到";color:var(--mint-d)}
.l15-fact.off{opacity:.55}
.l15-steps{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px}
.l15-steps span{font-size:13px;padding:1px 10px;border-radius:999px;border:2px solid var(--line2);color:var(--dim);background:#fff}
.l15-steps span.on{color:var(--ink);border-color:var(--grape)}
.l15-steps span.skip{color:var(--sun-d);border-color:var(--sun);text-decoration:line-through}
.l15-steps span em{font-style:normal;color:var(--grape-d);margin-left:4px;font-weight:700}
.l15-tabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px}
.l15-tabs button{border:2px solid var(--line2);background:#fff;color:var(--ink);border-radius:999px;padding:5px 14px;cursor:pointer;font-size:14.5px;font-weight:500}
.l15-tabs button.on{border-color:var(--ink);background:var(--sun);font-weight:700}
.l15-tabs button:disabled{opacity:.5;cursor:default}
.l15-deck{display:flex;flex-direction:column;gap:8px}
.l15-slide{aspect-ratio:16/9;width:100%;max-width:620px;border-radius:16px;border:1.5px solid var(--line2);background:#fff;padding:clamp(12px,3.2%,22px);display:flex;flex-direction:column;gap:10px;overflow:hidden;position:relative;color:var(--ink)}
.l15-slide h3{font-family:var(--f-display);font-weight:800;font-size:clamp(18px,2vw,23px)}
.l15-slide .en{font-size:12px;color:var(--sky);letter-spacing:.08em;font-weight:700}
.l15-slide .bd{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);gap:16px;flex:1;min-height:0;align-items:center}
.l15-slide.nofig .bd{grid-template-columns:1fr}
.l15-slide ul{margin:0;padding-left:20px;font-size:14.5px;display:flex;flex-direction:column;gap:6px}
.l15-slide .fg{min-height:0;max-height:100%;display:flex;align-items:center;justify-content:center}
.l15-slide .fg svg{width:100%!important;max-width:100%!important;max-height:min(240px,40vw);margin:0 auto}
.l15-slide .ft{gap:10px;position:absolute;left:clamp(14px,3.2%,28px);right:clamp(14px,3.2%,28px);bottom:8px;display:flex;justify-content:space-between;font-size:11.5px;color:var(--muted)}
.l15-slide.cover{justify-content:center;align-items:flex-start;background:var(--sky-soft)}
.l15-slide.cover h3{font-size:clamp(22px,3vw,30px)}
.l15-notes{font-size:14px;color:var(--muted);padding:8px 12px;border-left:5px solid var(--grape);background:#fff;border-radius:0 12px 12px 0;max-width:620px}
#l15-deck .l15-deck>.row{display:none}
.l15-thumbs{display:flex;gap:6px;overflow-x:auto;padding-bottom:4px}
.l15-thumbs button{flex:none;border:2px solid var(--line2);background:#fff;color:var(--muted);border-radius:10px;padding:3px 10px;font-size:13px;cursor:pointer;max-width:160px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.l15-thumbs button.on{border-color:var(--ink);color:var(--ink);background:var(--sun-soft);font-weight:700}
.l15-poster{display:flex;flex-direction:column;gap:10px}
.l15-poster h3{font-family:var(--f-display);font-weight:800;font-size:22px}
.l15-scs{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
.l15-sc{display:flex;flex-direction:column;gap:6px;padding:10px;border-radius:14px;border:2px solid #7d5cf044;background:#fff;min-width:0}
.l15-sc b{font-size:15.5px}
.l15-sc p{font-size:15px;line-height:1.75}
.l15-sn{cursor:pointer;border-radius:6px;padding:1px 2px;border-bottom:2px dotted var(--line2)}
.l15-sn:hover{background:var(--sun-soft)}
.l15-sn.doubt{background:var(--sun-soft);border-bottom:2px solid var(--sun-d)}
.l15-sn.bad{background:var(--coral-soft);border-bottom:2px solid var(--coral);font-weight:700}
.l15-sn.fine{background:var(--mint-soft);border-bottom:2px solid var(--mint)}
.l15-end{font-weight:700;color:var(--grape-d);font-size:15.5px}
.l15-pair{display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:14px;margin:8px 0}
.l15-pair div{padding:8px 10px;border-radius:12px;border:2px solid var(--line);background:#fff}
.l15-pair b{display:block;font-size:13px;margin-bottom:2px;color:var(--sky)}
.l15-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}
.l15-stats div{padding:8px 6px;border-radius:14px;background:#fff;border:2px solid var(--line);text-align:center}
.l15-stats b{display:block;font-family:var(--f-display);font-weight:800;font-size:24px;line-height:1.2;color:var(--sky)}
.l15-stats span{font-size:12.5px;color:var(--muted)}
.l15-close{font-size:15px;line-height:1.85;padding:14px 18px;border-radius:16px;border:2px solid var(--sun);background:var(--sun-soft);color:var(--ink)}
.l15-close p+p{margin-top:8px}.l15-close h4{font-family:var(--f-display);font-weight:800;color:var(--sun-d);font-size:17px;margin:0 0 6px}
.l15-letter{padding:14px 16px;border-radius:14px;border:2px solid #e6d9a8;background:var(--paper);font-size:15.5px;line-height:1.8;white-space:pre-wrap;color:var(--ink)}
.l15-letter .note{display:block;margin-top:8px}
#l15-letter{min-height:230px;width:100%;background:var(--paper);border:1.5px solid var(--line2);border-radius:16px;font-size:16.5px;line-height:1.8}
.l15-wk{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:6px;margin:8px 0}
.l15-wk div{padding:6px 9px;border-radius:10px;border:2px solid var(--line);background:#fff;font-size:12.5px;color:var(--muted);min-width:0}
.l15-wk b{display:block;color:var(--ink);font-size:13.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.l15-pipe{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin:8px 0}
.l15-pipe div{padding:10px;border-radius:12px;border:2px solid var(--line);background:#fff;font-size:13px}
.l15-pipe b{display:block;font-size:14.5px;color:var(--ink)}.l15-pipe small{display:block;color:var(--muted);font-size:12.5px}
.l15-pipe .md{color:var(--sky);font-size:12.5px;font-weight:700}
@media (max-width:880px){.l15-cmp{grid-template-columns:1fr}.l15-pipe{grid-template-columns:1fr 1fr}.l15-scs{grid-template-columns:1fr 1fr}.l15-slide{aspect-ratio:auto;min-height:220px}.l15-slide .bd{grid-template-columns:1fr}.l15-slide .ft{position:static}}
@media (max-width:480px){.l15-two{grid-template-columns:1fr}.l15-week{grid-template-columns:repeat(4,minmax(0,1fr))}.l15-scs,.l15-pair{grid-template-columns:1fr}.l15-stats{grid-template-columns:1fr 1fr}.l15-err div{font-size:19px;padding:12px 14px}}
`;

/* ---------- quiz ---------- */
const QUIZ=[
 {id:'q1',q:'用 AI 做学情诊断、制订学习方案，下面哪个顺序最合理？',opts:['先让 AI 随便写一份方案，再去做试卷','把做过的试卷发给 AI → AI 分析丢分题、诊断薄弱点 → 生成方案 → 我们提出修改要求、继续优化','只告诉 AI“帮我提高成绩”，不提供任何学习情况'],a:1,why:'AI 要先了解我们的学习情况（试卷、错题、要求），才能诊断薄弱点、制订针对性的方案；再通过持续交流不断优化。'},
 {id:'q2',q:'怎样做才能让 AI 越来越了解你，给出更贴合的指导？',opts:['只和它说一次，以后就不用再说了','主动、多次与它交流学习近况，清晰地表达学习要求','把家庭住址、电话号码都告诉它'],a:1,why:'刚开始对话时，AI 像刚结识的新朋友，还不太了解我们；多次交流、表达清楚，它才能持续跟踪进展。学习情况可以说，个人隐私信息不要说。'},
 {id:'q3',q:'AI 生成的学习方案，应该怎样使用？',opts:['直接照做，不需要任何人看','在老师和家长的指导下参考它的建议，灵活调整后再使用','AI 做的方案一定不好，完全不能用'],a:1,why:'AI 的诊断可能出错（例如看错答案、分析错原因），方案也不一定适合实际情况，需要和老师、家长一起确认、调整。'},
 {id:'q4',q:'教材中的“智能体”指的是什么？',opts:['具备较强记忆力、能自主规划、功能更综合全面的 AI 应用','只会一项本领、每一步都要我们下指令的 AI','一种会走路的机器人玩具'],a:0,why:'只需提出一个整体要求，智能体就会自主规划，把会看、会画、会写、会思等多种本领协同起来完成任务，并能记住我们的学习情况。'},
 {id:'q5',q:'教材认为，人与 AI 最理想的关系是：',opts:['让 AI 替人做所有决定','人完全不用 AI，什么都自己做','各展所长、协同共进：善用 AI，人更专注于创意构思、情感共鸣与价值判断'],a:2,why:'AI 能把我们从重复、机械的工作中解放出来；创意构思、情感共鸣与价值判断是人类独有的长处，要由人来把握。'}];

/* ---------- render ---------- */
const SK6=[['think','会思'],['write','会写'],['draw','会画'],['say','会说'],['tr','会译'],['search','会搜']];
const QUICK=[['改成两周','改成两个星期的学习方案'],['每天 15 分钟','每天只有 15 分钟'],['周末休息','周末要休息一天'],['多些应用题','多安排一些应用题'],['周三有篮球课','我每周三有篮球课'],['闯关的方式','我喜欢闯关的方式']];
const OPEN6=['一年后','小学毕业时','初中毕业时'];
const TASK4='根据我的学习情况，做一份图文并茂的演示文稿：我的 AI 学习之旅';
const CLOSE=`<div class="l15-close"><h4>结语</h4>
   <p>在这趟 AI 探索之旅中，我们既发现了 AI 的优点，也感受到了它的不足。</p>
   <p>AI 的真正价值取决于使用者的智慧。与 AI 同行，我们要善用它的优点，弥补它的不足；要能独立判断，主动识别并修正 AI 可能存在的错误与偏见；要懂得保护隐私、尊重权益，遵守相关法律法规，践行科技向善的伦理要求，安全合规地与 AI 协作。</p>
   <p>此时，你是否又有了新的疑问——AI 令人惊叹的能力背后，究竟隐藏着怎样的原理？在下一册书中，我们将了解与现实生活联系最紧密的一条主线——机器学习、人工神经网络和深度学习的发展脉络。希望你在接下来的学习中，继续保持好奇心与求知欲，在主动用好 AI 的同时，深入探索 AI 背后的原理和方法。</p>
   <p>与 AI 协作，让我们得以从重复、机械的工作中解放出来，投身于更具创造力、更有情感温度、更需要价值判断的工作。让我们与 AI 并肩前行，一起成为未来的创造者。</p></div>`;
/* an SVG figure shown as an image (keeps its text out of the page's reading load) */
const svgImg=(svg,alt,cls)=>`<img class="${cls}" alt="${esc(alt)}" src="data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" '))}">`;
const opts=h=>`<div class="opts">${h}</div>`;
/* put an AI bubble back into its waiting state */
const idle=(box,txt)=>{if(typeof box==='string')box=$(box);if(!box)return;App.aiSay(box,txt,{mood:'idle'});box.classList.add('wait');box.classList.remove('pop');const sr=$('.ai-src',box);if(sr)sr.innerHTML='';};
let S={};let listening=false;
L.render=function(){const v=$('#v-'+K);if(!v)return;if(!App.rec){stopAll();v.innerHTML='<div class="empty">登录后开始本讲实验。</div>';return;}
 if(!document.getElementById('css-l15')){const st=document.createElement('style');st.id='css-l15';st.textContent=CSS15;document.head.appendChild(st);}
 stopAll();S={slide:0,view:'mem'};
 const lr=App.lesson(K);const s1=lr.s1||{},s2=lr.s2||{},s3=lr.s3||{},s4=lr.s4||{},s5=lr.s5||{},s6=lr.s6||{};
 const p=normP(s1.p||P0);const src0=SAMP[s1.src]?s1.src:'A';const kps=Object.keys(KP);
 const sk0=(s4.sk||['think','write','draw']);
 v.innerHTML=`${App.hero(K,'请 AI 给试卷把脉、改学习方案，再搭一个懂你的学习智能体。',['学会用 AI 进行学习诊断与规划，生成适合自己的学习方案。','认识智能体及其特点。','畅想 AI 未来的发展，提升继续探索 AI 的兴趣。'])}

 <div class="station" id="l15-s0">${App.head('WARM-UP','导入 · AI 给学习把脉','三道错题的秘密','三道题都错了，猜猜是同一个什么原因')}
  <ol class="steps"><li>猜错因</li><li>看验算</li></ol>
  <div class="grid2"><div class="l15-err" aria-label="三道做错的分数题">${[['2/3 + 1/4','3/7'],['1/2 + 2/5','3/7'],['5/6 − 1/3','4/3']].map(([q,a])=>`<div>${q} = <span class="stu">${a}</span><span class="x">✗</span></div>`).join('')}</div>
   <div class="l15-col"><div class="go-row"><span class="l15-lab">我猜</span>${chips('w',['太粗心，看错数字','没通分，直接加减','题太难，没读懂'],(lr.w||{}).g)}${App.go('l15-go0','揭晓病因')}</div>
    ${App.aiBox('l15-ai0','先猜一猜，再按「揭晓病因」','平台的验算')}<div id="l15-fb0"></div>
    <div class="after-run">${App.pad('照这种错法，1/2 + 1/3 会被算成几？',opts(chips('wp',['5/6','2/5','2/6'],(lr.w||{}).p)),'再猜一道')}</div></div></div>
  ${more(`<p class="note">医生看病，先看症状，再找病因，最后开处方。学习也一样：错题是“症状”，薄弱的知识点是“病因”，学习方案是“处方”。</p><div class="l15-pipe" aria-label="学情诊断的四个环节">${[['症状','丢分的题','试卷上的 ✗'],['病因','错因分析','错在哪一步、为什么'],['诊断','薄弱知识点','哪类题反复出错'],['处方','学习方案','每天练什么、练多久']].map(([a,b,c],i)=>`<div><span class="md">0${i+1} · ${a}</span><b>${b}</b><small>${c}</small></div>`).join('')}</div>`+App.know('学情诊断：从“错了哪题”到“为什么错”','在学习中，我们可能会反复做错同一类型题目，却不知道自己薄弱点在哪。只看分数，看不出问题；把几道错题放在一起比较，找出它们<b>共同的错误规律</b>，才能找到真正的薄弱点。AI 能很快完成这件事：读题、对答案、分析错因、按知识点归类，再据此制订方案。不过，诊断得准不准，还需要我们自己核对。'))}
 </div>

 <div class="station" id="l15-s1">${App.head('EXP-01','挑战一 · 协助做方案','学习诊断仪','请 AI 诊断试卷，再逐条核对它说得对不对')}
  <ol class="steps"><li>请 AI 诊断</li><li>核对 AI 的诊断</li></ol>
  <div class="grid2" data-rb="1"><div id="l15-paper"></div>
   <div class="l15-col">${App.knobs([['试卷',App.seg('src',Object.keys(SAMP).map(k=>[k,'同学 '+k]),src0),'虚构学生的练习卷']])}
    <div class="go-row"><span class="l15-lab">我猜最弱的是</span>${App.seg('g1',kps.map(k=>[k,KP[k].s]),SAMP[s1.src]?s1.g||'':'')}${App.go('l15-go1','请 AI 诊断')}</div>
    ${App.aiBox('l15-ai1','AI 会读卷、找丢分题、分析原因','AI 的诊断')}<div id="l15-fb1"></div>
    <div class="after-run">${App.pad('对照试卷上的 ✓ 和 ✗：上面哪一条说错了，就点哪一条。没有哪条说错，点这里',opts('<span id="l15-vfq" style="display:contents"></span>'),'核对 AI 的诊断')}</div></div></div>
  ${more('<p class="note" id="l15-mode1"></p><p class="note">试卷是虚构学生的示例，姓名处已遮挡。平台会逐题精确验算，用来核对 AI 的诊断。</p>')}
 </div>

 <div class="station" id="l15-s1b">${App.head('EXP-01b','挑战一 · 协助做方案','我的学习方案','按诊断生成方案，换个设置再比一比')}
  <ol class="steps"><li>生成方案</li><li>换设置再生成</li></ol>
  ${App.knobs([['时长',chips('wk',['一周','两周'],p.wk-1)],['每天',chips('min',['15 分钟','20 分钟','30 分钟','40 分钟'],[15,20,30,40].indexOf(p.min))],['题型',chips('ty',['计算','应用题','画图理解'],p.ty.map(t=>['calc','apply','fig'].indexOf(t)),true),'可多选'],['节奏',chips('pace',PACE,p.pace),'<span id="l15-pacehint"></span>']])}
  <div class="go-row">${App.go('l15-plan1','生成学习方案')}</div>
  ${App.aiBox('l15-ai1b','方案会照着诊断出的薄弱点来排','AI 的方案')}<div id="l15-fb1b"></div>
  <div class="after-run">${App.pad('这份方案里有什么？（多选）',opts(chips('o2',['学习目标','每天的重点','具体练习任务','每天的时长','复盘和小测','类似题与答案','学习提醒'],(s1.ob||{}).b||[],true)))}</div>
  ${more('<p class="note" id="l15-mode1b"></p><p class="note">平台会检查方案的天数和每天时长是否符合你的设置。</p>')}
 </div>

 <div class="station" id="l15-s2">${App.head('EXP-02','挑战一 · 持续交流','方案调整台','向 AI 提 3 条要求，看它改得对不对')}
  <ol class="steps"><li>提一条要求</li><li>提满 3 条</li></ol>
  <div class="grid2"><div class="l15-pbox"><div class="l15-ptitle" id="l15-pv2t">当前方案</div><div id="l15-plan2"></div><div class="l15-rs" id="l15-rs2w" style="display:none"><button type="button" class="btn ghost sm" id="l15-rs2">从第 1 版重来</button></div></div>
   <div class="l15-col">${App.knobs([['点一条',App.seg('rq',QUICK.map((x,i)=>[i,x[0]]),0)],['或自己写','<input type="text" id="l15-req" maxlength="60" placeholder="如：周五要去奶奶家" aria-label="自己写一条要求">']],'我的要求')}
    <div class="go-row">${App.go('l15-send','发给 AI')}</div>
    ${App.aiBox('l15-ai2','AI 会回话，并把改过的那几天标出来')}<div id="l15-fb2"></div>
    <div class="after-run">${App.pad('越聊，方案越符合你的要求吗？',opts(chips('o3',['越来越符合','有时又改错了','没有变化'],s2.o3)))}</div></div></div>
  ${more('<p class="note" id="l15-mode2"></p><p class="note">每改一版，平台都会逐条检查：你提过的要求，方案做到了没有。只说学习情况，不说住址、电话等个人信息。</p>')}
 </div>

 <div class="station" id="l15-s3">${App.head('EXP-03','挑战一 · 交流讨论','方案找不同','两个同学的方案，找出哪里不一样')}
  <ol class="steps"><li>勾出不同</li><li>核对</li></ol>
  <div class="l15-cmp" id="l15-cmp"></div>
  <div class="go-row"><span class="l15-lab">不同的是（多选）</span>${chips('o4',['重点知识点','题型','每天时长','天数','节奏'],s3.pick||[],true)}${App.go('l15-chk3','核对')}</div>
  <div id="l15-fb3"></div>
  <div class="after-run">${App.pad('AI 做的方案，能直接照着做吗？',opts(chips('use3',['直接照着做','先请老师家长看看'],s3.use)))}</div>
  ${more(App.think(['AI 的学习规划带给你怎样的感受？应该怎么做才能让 AI 越来越了解你？','可以直接使用 AI 生成的学习方案吗？是否需要和老师或家长确认？'])+App.know('AI 像刚结识的新朋友','我们可以把自己近期的学习情况告诉 AI。它能快速诊断问题，规划每日任务，安排针对性强的练习，精准锁定提升方向。刚开始与 AI 对话时，它就像刚结识的新朋友一样，还不太了解我们。只要我们主动、多次与它交流学习近况，清晰地表达学习要求，它就能持续跟踪我们的学习进展，给出更有针对性、更贴合个人学习特点的指导。不过，我们还需要在老师和家长的指导下参考它提出的建议，灵活调整它给出的方案。'))}
 </div>

 <div class="station" id="l15-s4">${App.head('EXP-04','挑战二 · 共绘新蓝图','我的学习智能体','搭一个智能体：有记忆、没记忆各做一份')}
  <ol class="steps"><li>生成演示文稿</li><li>换记忆再做一份</li></ol>
  <div class="grid2"><div class="l15-figbox" id="l15-agentfig"></div>
   <div class="l15-col">${App.knobs([['名字',`<input type="text" id="l15-name" maxlength="8" value="${esc(s4.name||'小研')}" aria-label="智能体的名字">`],['本领',chips('sk',SK6.map(x=>x[1]),SK6.map((x,i)=>sk0.includes(x[0])?i:-1).filter(i=>i>=0),true),'可多选'],['记忆',App.seg('mem',[['0','不用记忆'],['1','读我的学习记录']],s4.consent?'1':'0'),'你同意，它才能读']],'搭建智能体')}
    <p class="note" id="l15-memnote"></p>
    <div class="go-row">${App.go('l15-go4','生成演示文稿')}</div></div></div>
  ${App.aiBox('l15-ai4','只提一个整体要求，它会自己规划、自己干活','智能体的作品')}<div id="l15-fb4"></div>
  <div class="after-run"><div id="l15-quest"></div>${App.pad('有记忆的那一份，像不像“你的”？',opts(chips('o42',['很像，有帮助','部分像','不像'],(s4.ob||{}).b)))}</div>
  ${more(`<p class="note">交给它的任务：${TASK4}</p><p class="note" id="l15-mode4"></p><p class="note"><b>智能体的记忆</b>：选了“读我的学习记录”，它才会读下面勾选的记录；不读姓名，发给 AI 时用“我”来称呼。不想给它看的，取消勾选。</p><div class="l15-facts" id="l15-facts"></div><div class="meta" id="l15-memtxt"></div>`+App.think(['在这次任务中，AI 综合运用了哪几项本领？和以往体验的 AI 功能有哪些不同？','为什么 AI 能生成符合个人学习情况的学习资料？','你还希望 AI 综合运用哪些本领帮助你更好地学习？'])+App.know('智能体：有记忆、会规划、多本领协同','之前，我们已经学习了 AI 的各项本领，分别体验了用 AI 生成图像、搜集资料、生成文字、推理分析等。而在这个挑战中，我们不必单独选择功能或分别下达指令，只需提出一个整体的要求，AI 就会自主规划，将多种能力协同起来工作。通过一段时间的持续交流，我们已经让 AI 逐渐了解了我们的学习情况，记住了容易出错的题型、理解不透彻的概念、历次考试的分数、喜欢的学习方式等信息。因此，我们不用再过多描述，它就能制作符合我们个人特点的学习资料。<br>我们可以把这类具备较强记忆力，能自主规划，功能更综合、全面的 AI 应用称作<b>智能体</b>。平时与它多交流，随时把学习上的事情告诉它，它就会越来越了解我们的个人特点，持续跟踪我们的学习过程并提供指导，成为越来越贴心的学习小伙伴。'))}
 </div>

 <div class="station" id="l15-s5">${App.head('EXP-05','挑战二 · 共绘新蓝图','人与 AI 新蓝图','写下你的畅想，再揪出 AI 说过头的话')}
  <ol class="steps"><li>让 AI 画蓝图</li><li>点出说过头的话</li></ol>
  ${App.knobs([['我的畅想',`<textarea id="l15-mine" maxlength="300" rows="2" placeholder="我希望以后 AI 帮人……，人自己……" aria-label="我的畅想：未来人和 AI 怎样相处">${esc(s5.mine||'')}</textarea>`,'先自己想，再看 AI 的']],'先想一想')}
  <div class="go-row">${App.go('l15-go5','让 AI 画蓝图')}</div>
  ${App.aiBox('l15-ai5','新对话，AI 不认识你。提示词：用小学生能听懂的语言，描绘人与 AI 和谐共处的新蓝图。','AI 的新蓝图')}<div id="l15-fb5"></div>
  <div class="after-run">${App.pad('AI 的蓝图和你想的一样吗？','<p class="note" id="l15-mine2"></p>'+opts(chips('same5',['一样','部分一样','不一样'],s5.same)))}</div>
  ${more('<p class="note" id="l15-mode5"></p><div class="l15-pair"><div><b>AI 擅长</b>快速计算、记忆大量信息、重复不累、从数据里找规律</div><div><b>人类独有</b>创意构思、情感共鸣、价值判断</div></div>'+App.know('人与 AI 各展所长、协同共进','在学习、工作与生活中，智能体的应用无处不在。功能强大的智能体能综合运用 AI 会“看”、会“画”、会“听”、会“说”、会“译”、会“写”、会“搜”、会“编”、会“思”等各项本领，为我们提供个性化服务。我们也可以创建适合自己的各种智能体，充分利用 AI 学习与成长。<br>想要与 AI 和谐共处，我们必须持续与它互动，让它熟悉我们的习惯和爱好，了解我们的要求，逐步成为值得我们信赖的搭档。展望未来，人与 AI 最理想的关系，莫过于各展所长、协同共进。当我们学会善用 AI，便能更专注于人类独有的创意构思、情感共鸣与价值判断，去探索更广阔、更精彩的世界。'))}
 </div>

 <div class="station" id="l15-s6">${App.head('FINALE','结课 · 我的成长蓝图','我的成长蓝图','15 讲走完了！猜猜你哪项能力最强')}
  <ol class="steps"><li>猜最强能力</li><li>揭晓图谱</li></ol>
  <div class="l15-col"><div class="l15-figbox wide" id="l15-journey"></div><div class="l15-stats" id="l15-stats"></div>
   <div class="go-row"><span class="l15-lab">我猜最强的是</span>${App.seg('g6',App.DIMS.map(d=>[d.k,d.s]),s6.g6||'')}${App.go('l15-go6','揭晓我的图谱')}</div>
    ${App.aiBox('l15-ai6','这里会画出你的六维能力图谱','我的能力图谱')}<div id="l15-fb6"></div></div>
  ${more('<p class="note">上图每个圆点是一讲，圆环越满，完成越多。</p><div id="l15-more6"></div>'+CLOSE)}
 </div>

 <div class="station" id="l15-s6b">${App.head('FINALE','结课 · 写给未来','给未来的自己写信','写一封信，封进时间胶囊')}
  <ol class="steps"><li>写信</li><li>封存</li></ol>
  <div class="grid2"><div class="l15-col"><textarea id="l15-letter" maxlength="600" placeholder="未来的我：你好！这学期我……" aria-label="写给未来自己的信"></textarea><p class="note" id="l15-cnt"></p></div>
   <div class="l15-col">${App.knobs([['什么时候打开',App.seg('open6',OPEN6.map((t,i)=>[i,t]),s6.open||0)]])}
    <div class="go-row">${App.go('l15-seal','封存这封信')}</div><div id="l15-fb6b"></div>
    <div class="after-run"><div id="l15-sealed"></div></div></div></div>
  <div id="l15-close6"></div>
  ${more('<p class="note">自己写，不用 AI 代写。可以写：这门课里最难忘的一次实验；你发现的 AI 的一个优点和一个不足；你和 AI 相处的约定；你想继续探索的问题。</p>')}
 </div>

 <div class="station" id="l15-quiz">${App.head('QUIZ','反思与总结','小测验','5 道题，第一次作答计入能力图谱')}<div id="l15-qz"></div></div>
 <div class="station" id="l15-diary"></div>`;
 wire0(v,lr);wire1(v,lr);wire1b(v,lr);wire2(v,lr);wire3(v,lr);wire4(v,lr);wire5(v,lr);wire6(v,lr);wire6b(v,lr);
 App.quiz($('#l15-qz'),K,QUIZ);
 const rd=App.diary($('#l15-diary'),K,{title:'我的成长蓝图',lead:'收好作品，写下你的成长日记',
  fields:[{id:'agent',q:'除了辅助学习的智能体，你还希望拥有什么主题的智能体？具备哪些功能？',ph:'我希望有一个……智能体，它会……'},
   {id:'align',q:'面对功能越来越综合、全面的 AI，我们如何确保它在协作中的行为表现始终与我们的目标保持一致？',ph:'说清要求；检查……'},
   {id:'vision',q:'AI 描绘的新蓝图，和你畅想的是否一样？',ph:'一样的地方：……；不一样的地方：……'}],
  pledge:'我会做 AI 的好搭档：先独立思考，再验证 AI 的结果；学习方案请老师和家长确认；保护自己和他人的隐私。',
  extras:ex=>diaryExtras(ex)});
 L._rd=rd;if(!listening){listening=true;App.on(()=>{if(App.current===K){if(L._rd)L._rd();if(L._fin)L._fin();}});}
};

/* WARM-UP · 先猜后揭晓 */
function wire0(v,lr){const s=$('#l15-s0',v);const W=()=>App.lesson(K).w||{};
 const calc=()=>{const ln=[['2/3 + 1/4','2 + 1 = 3，3 + 4 = 7','3/7',fmtF(fa(F(2,3),F(1,4)))],['1/2 + 2/5','1 + 2 = 3，2 + 5 = 7','3/7',fmtF(fa(F(1,2),F(2,5)))],['5/6 − 1/3','5 − 1 = 4，6 − 3 = 3','4/3',fmtF(fs(F(5,6),F(1,3)))]];
  return `<div class="big">病因：没通分</div><div class="l15-calc">${ln.map(x=>`<div><b>${x[0]}</b><span>${x[1]} → ${x[2]}</span><em>应得 ${x[3]}</em></div>`).join('')}</div>`;};
 const show=()=>App.aiSay('#l15-ai0',calc(),{mood:'think'});
 wire(s,'w',i=>{up('w',{g:i});App.markStep(s,0);App.touch();});
 $('#l15-go0',s).onclick=()=>{const g=W().g;up('w',{shown:1});show();App.markStep(s,1);App.touch();$('#l15-go0',s).classList.add('again');
  if(g===1)App.fb('#l15-fb0','ok','你诊断对了！','同一种错连犯三次，不是粗心，是没掌握“先通分”。再猜下面那道，拿满 3 颗星。',{stars:st0()});
  else if(g==null)App.fb('#l15-fb0','find','病因是：没通分','三道题都把分子、分母分别加减了。再猜猜下面那道题。',{stars:st0()});
  else App.fb('#l15-fb0','find','病因是：没通分','和你猜的不一样。三道题错法相同，说明是同一个知识点没掌握。再猜猜下面那道题。',{stars:st0()});};
 const st0=()=>1+(W().g===1?1:0)+(W().p===1?1:0);
 wire(s,'wp',i=>{up('w',{p:i});App.touch();
  if(i===1)App.fb('#l15-fb0','ok','猜中了：会算成 2/5','找到错的规律，就能料到下一道会怎么错。下一站的试卷第 1 题就是它。',{stars:st0()});
  else if(i===0)App.fb('#l15-fb0','try','5/6 是通分后的正确答案','这位同学不通分：分子 1 + 1，分母 2 + 3，他会写成几？');
  else App.fb('#l15-fb0','try','再算一算','照他的错法：分子加分子 1 + 1，分母加分母 2 + 3。');});
 if(W().g!=null)App.markStep(s,0);if(W().shown){show();App.markStep(s,1);App.ran(s);}}

/* EXP-01 · 请 AI 诊断，再揪出它的错 */
function whyMatch(ai,code){const re={across:/通分|分子.{0,6}分母|分母.{0,4}(相加|相减|加|减)/,dshift:/小数点|小数位/,unit10:/进率|100|一百/,eqinv:/加上|加了|减去|移项|两边/,half:/除以\s*2|÷\s*2|一半|除以二/,tdiff:/速度和|速度差|相加/}[code];return re?re.test(ai||''):false;}
/* what is wrong in an AI diagnosis, by the platform's exact checking: {题号:'ghost'|'why', miss:[漏掉的丢分题]} */
function flawSet(src,ai){const T=diagnose(SAMP[src].stu);const tl=Object.fromEntries(T.lost.map(x=>[x.no,x]));const bad={};
 /* a联网 AI's wording of a reason cannot be judged reliably by keywords: only the offline example's reason is judged */
 const strict=!ai.m||ai.m==='offline';
 ai.lost.forEach(x=>{const t=tl[x.no];if(!t)bad[x.no]='ghost';else if(strict&&t.why!=='other'&&!whyMatch(x.why,t.why))bad[x.no]='why';});
 const has=new Set(ai.lost.map(x=>x.no));const missed=T.lost.filter(x=>!has.has(x.no));if(missed.length)bad.miss=missed;return {T,tl,bad};}
function wire1(v,lr){const s=$('#l15-s1',v);const s1=lr.s1||{};const WAIT='AI 会读卷、找丢分题、分析原因';
 S.src=SAMP[s1.src]?s1.src:'A';S.g=SAMP[s1.src]?s1.g||null:null;S.ai=null;S.mk={};
 const topOf=a=>{const c={};a.lost.forEach(x=>{if(x.kp&&KP[x.kp])c[x.kp]=(c[x.kp]||0)+1;});const mx=Math.max(0,...Object.values(c));return mx?Object.keys(c).filter(k=>c[k]===mx):[];};
 const L1=()=>App.lesson(K).s1||{};
 const mode=()=>{$('#l15-mode1',s).textContent=modeLine()+(App.AI.real()?'':'。离线示例里，AI 的诊断带有 1 处常见错误（示意）');};L._mode1=mode;mode();
 const paper=hl=>{$('#l15-paper',s).innerHTML=svgImg(sheetSVG(S.src,{hl:hl||null}),`${SAMP[S.src].n}的数学练习卷（示例）：10 道题，有学生的答案和老师的 ✓ ✗`,'l15-sheet');};
 const restoreAI=l=>{const a=l.ai;if(!a)return null;return {lost:(a.lost||[]).map(x=>({no:x[0],why:x[1],kp:x[2],stu:x[3]||'',ans:x[4]||'',q:x[5]||''})),weak:a.weak||[],sum:a.sum||'',m:a.m,think:a.think||[]};};
 const dxHTML=a=>{const top=topOf(a),real=a.m&&a.m!=='offline';return `<div class="big">丢分最多：${top.length?top.map(k=>esc(KP[k].s)).join('、'):esc(a.weak[0]||'—')}</div><p>${esc(a.sum)}</p><div class="l15-lost">${a.lost.map(x=>{const m=S.mk[x.no]||'';return `<button type="button" class="l15-li ${m}" data-no="${x.no}" aria-label="第 ${x.no} 题：点一下，核对这一条"><span class="no">第 ${x.no} 题</span><span>${x.kp&&KP[x.kp]?`<b>${esc(KP[x.kp].s)}</b> · `:''}${esc(x.why)}</span>${m?`<em>${m==='hit'?'AI 说错了':real?'确实丢分':'没说错'}</em>`:''}</button>`;}).join('')||'<p class="note">AI 没有找到丢分题。</p>'}</div>`;};
 const say=()=>{App.aiSay('#l15-ai1',dxHTML(S.ai),{mood:'think',src:S.ai.m||'offline'});$$('#l15-ai1 .l15-li',s).forEach(b=>b.onclick=()=>judge(b.dataset.no));};
 const drawVf=()=>{const box=$('#l15-vfq',s);if(!S.ai){box.innerHTML='';return;}const vf=L1().vf||{};
  box.innerHTML=[['miss','它漏了一道题'],['none','全都对']].map(([k,t])=>`<button type="button" class="chip ${String(vf.pick)===k?'on':''}" data-v="${k}">${t}</button>`).join('');
  $$('.chip',box).forEach(b=>b.onclick=()=>judge(b.dataset.v));};
 const judge=k=>{const l=App.lesson(K);if(!S.ai||!l.s1||l.s1.src!==S.src)return;const {T,tl,bad}=flawSet(S.src,S.ai);const vf=l.s1.vf=l.s1.vf||{};const was=!!vf.done;
  if(!was)vf.t=(vf.t||0)+1;vf.pick=k;const no=+k;const any=Object.keys(bad).length>0;let ok=false,msg='',hl=null;
  const stuOf=n=>SAMP[S.src].stu[n-1],ansOf=n=>{const q=PAPER[n-1];return (q.fmt==='f'?fmtF:fmtD)(q.ans);};
  const real=!!S.ai.m&&S.ai.m!=='offline';let soft=false;
  if(k==='none'){ok=!any;msg=ok?(real?'平台逐题验算过：丢分的题 AI 都找对了，没多也没少。原因说得准不准，你再对照看看。':'平台逐题验算过，这次 AI 没说错。'):'还有不对的地方。数一数试卷上的 ✗，再逐条对照。';}
  else if(k==='miss'){ok=!!bad.miss;if(ok){const m=bad.miss[0];hl=m.no;msg=`第 ${m.no} 题老师打了 ✗，AI 却没提：学生答 ${esc(m.stu)}，应得 ${esc(m.ans)}。`;}else msg='试卷上的 ✗，AI 一道都没漏。再看看它每一条说得对不对。';}
  else{hl=no;const b=bad[k],t=tl[no];ok=!!b;
   if(b==='ghost'){const x=S.ai.lost.find(y=>y.no===no)||{};const mis=x.stu&&nz(x.stu)!==nz(stuOf(no));msg=`第 ${no} 题没丢分：学生写的是 ${esc(stuOf(no))}，和正确答案一样，老师打的是 ✓。${mis?`AI 把答案看成了 ${esc(x.stu)}。`:'AI 却把它算成了丢分题。'}`;}
   else if(b==='why')msg=`第 ${no} 题确实错了，可原因不是 AI 说的那样。${t.why==='half'?'按“上底 × 下底”应得 24，不是 50。':''}其实是：${WHY[t.why]}。`;
   else if(real&&t){soft=true;msg=`第 ${no} 题确实丢分了：学生答 ${esc(t.stu)}，应得 ${esc(ansOf(no))}。${t.why!=='other'?`平台验算的原因是：${WHY[t.why]}。`:''}AI 说的原因和它一样吗？你来判断。`;}
   else msg=`第 ${no} 题 AI 没说错：学生答 ${esc(t?t.stu:stuOf(no))}，应得 ${esc(ansOf(no))}。再找找别处。`;
   S.mk[no]=ok?'hit':'fine';}
  if(ok&&!was){vf.done=1;vf.n=3;vf.ok=Math.max(1,4-vf.t);vf.caught=k==='none'?0:1;l.s1.dx=compactDx(T);}
  if(ok)App.markStep(s,1);App.touch();paper(hl);say();drawVf();
  if(ok)App.fb('#l15-fb1',k==='none'?'ok':'oops',k==='none'?(real?'核对完毕，丢分题都找对了':'核对完毕，AI 全说对了'):'你揪出 AI 的错了！',msg+' AI 的诊断，要人来核对。',{stars:vf.t<=1?3:vf.t===2?2:1,cheer:!was});
  else if(soft)App.fb('#l15-fb1','find',`第 ${no} 题：丢分找对了`,msg);
  else App.fb('#l15-fb1','try','不是这里，再找找',msg);
  if(ok)refresh('_dp1','_dr2','_dr3','_dr4');};
 const showRec=()=>{const l=L1();S.ai=l.src===S.src&&l.ai?restoreAI(l):null;$$('[data-seg="g1"] .chip',s).forEach(b=>b.classList.toggle('on',b.dataset.v===S.g));
  S.mk={};if(S.ai){say();drawVf();App.ran(s);}else{idle('#l15-ai1',WAIT);$('#l15-fb1',s).innerHTML='';s.classList.remove('ran');drawVf();}};
 App.segWire(s,'src',k=>{if(S.busy1||!SAMP[k])return;S.src=k;S.g=L1().src===k?L1().g||null:null;paper();showRec();});
 App.segWire(s,'g1',k=>{S.g=k;const l=App.lesson(K);if(l.s1&&l.s1.src===S.src){l.s1.g=k;App.touch();}});
 const go=$('#l15-go1',s);
 go.onclick=async()=>{const src=S.src;S.busy1=true;App.busy(go,true,'AI 正在读卷…');App.aiSay('#l15-ai1','正在读卷……',{busy:true});$('#l15-fb1',s).innerHTML='';paper();
  let R=null,err='';
  try{if(App.AI.real()){const img=await svgBlob(sheetSVG(src));
    const prompt=`这是一张小学数学练习卷的照片（姓名已遮挡，不要输出任何姓名）。请分析卷面上丢分的题目，诊断薄弱的知识点。\n先用 3–5 行写出你的分析步骤（每行以“步骤”开头），然后输出一个 JSON 代码块：\n{"score":估计得分或null,"lost":[{"no":题号,"q":"题目（算式照抄，用 + − × ÷ = 和 x）","stu":"学生的答案","ans":"正确答案","kp":"知识点（如 异分母分数加减法、小数乘法、面积单位换算、解简易方程、梯形面积、相遇问题）","why":"丢分原因，一句话，不超过 30 字"}],"weak":["薄弱知识点"],"good":["掌握较好的知识点"],"sum":"一句话诊断，不超过 60 字"}\n只根据卷面上看得见的内容判断，看不清就如实说明。`;
    const r=await ask(prompt,{images:[img],onText:o=>{const ls=before(o.text);App.aiSay('#l15-ai1',`<span class="l15-think">${ls.map(esc).join('<br>')||'正在读卷……'}</span>`,{busy:true});}});
    if(r.cancel){S.busy1=false;App.busy(go,false);showRec();return;}
    if(!r.off){const j=jsonIn(r.text);if(j&&Array.isArray(j.lost)){R={lost:j.lost.slice(0,12).map(x=>({no:+x.no||0,q:clip(x.q,60),stu:clip(x.stu,20),ans:clip(x.ans,20),kp:kpOf(x.kp)||kpOf(x.q)||(PAPER[(+x.no||1)-1]||{}).kp,why:clip(x.why||'',50)})).filter(x=>x.no>0&&x.no<=10),
       weak:(j.weak||[]).map(x=>clip(typeof x==='string'?x:x.kp||'',14)).slice(0,4),sum:clip(j.sum||'',120),m:r.mode,think:before(r.text).slice(0,6).map(x=>clip(x,90))};}else err='AI 的回答格式不对，已改用离线示例。';}
    else err=r.err||'';}
  }catch(e){err=App.AI.errText(e);}
  if(!R){if(err)App.toast(err);const o=aiOffline(src);R=o;let t='';for(const ln of o.think){if(!S.busy1)break;t+=(t?'<br>':'')+esc(ln);App.aiSay('#l15-ai1',`<span class="l15-think">${t}</span>`,{busy:true});await sleep(300);}}
  S.busy1=false;App.busy(go,false);go.classList.add('again');if(S.src!==src){S.src=src;$$('[data-seg="src"] .chip',s).forEach(b=>b.classList.toggle('on',b.dataset.v===src));paper();}S.ai=R;
  const l2=App.lesson(K);const old=l2.s1||{};const same=old.src===src&&R.m==='offline'&&old.ai&&old.ai.m==='offline';
  const kpl=old.plan&&old.plan.src==='engine';/* a new paper: keep the best check result and the (regenerable) plan, so going back to explore does not lose progress */
  l2.s1=Object.assign(same?{vf:old.vf||{},vfb:old.vfb,dx:old.dx,plan:old.plan,pn:old.pn}:Object.assign({vf:{},vfb:(old.vf||{}).done&&!((old.vfb||{}).ok>old.vf.ok)?old.vf:old.vfb},kpl?{plan:old.plan,pn:old.pn}:{}),{src,g:S.g,p:old.p,ai:{lost:R.lost.map(x=>[x.no,clip(x.why,50),x.kp||'',clip(x.stu,16),clip(x.ans,16),clip(x.q,50)]),weak:R.weak.slice(0,4),sum:clip(R.sum,120),m:R.m,think:(R.think||[]).slice(0,6).map(x=>clip(x,90))},runs:(old.runs||0)+1,ob:old.ob});if(!same)l2.s2=resetS2(l2.s2);
  exp();App.markStep(s,0);App.touch();S.mk={};say();drawVf();
  const top=topOf(R);const tn=top.map(k=>KP[k].s).join('、');
  App.fb('#l15-fb1','find',`AI 找到 ${R.lost.length} 道丢分题`,`${S.g&&top.length?`AI 说丢分最多的是「${tn}」，${top.includes(S.g)?'和你猜的一样':'和你猜的不一样'}。`:''}${R.m==='offline'?'可它的诊断里藏着 1 处错：对照试卷逐条核对，把它找出来！':'它说得都对吗？对照试卷，点一点你觉得说错的那一条。'}`,{stars:1});
  refresh('_dp1','_dr2','_dr3');};
 paper();showRec();if(s1.ai)App.markStep(s,0);if((s1.vf||{}).done)App.markStep(s,1);}
function planPrompt(dx,p,extra){return `你是一位小学数学学习规划助手。根据下面的学情诊断，为一名五年级学生（用“我”称呼）制订数学学习方案。\n诊断：${dx.score!=null?`得分约 ${dx.score} 分；`:''}薄弱知识点：${dx.weak.map(w=>w.n+(w.nos&&w.nos.length?`（第 ${w.nos.join('、')} 题丢分）`:'')).join('、')}${dx.strong&&dx.strong.length?`；掌握较好：${dx.strong.map(kpName).join('、')}`:''}。\n设置：方案共 ${p.wk*7} 天；每天不超过 ${p.min} 分钟；偏好题型：${p.ty.map(t=>TY[t]).join('、')}；节奏：${PACE[p.pace]}。${extra||''}\n先用 2–3 行写出规划思路（每行以“思考：”开头），然后输出一个 JSON 代码块：{"goal":"一句话目标","days":[{"d":"第1天 · 周一","focus":"重点（不超过 8 个字）","tasks":["具体任务，不超过 30 字"],"min":分钟数}],"tips":["提醒，不超过 20 字"]}。days 必须正好 ${p.wk*7} 项，每天 1–3 个任务。`;}

/* EXP-01b · 生成学习方案，换设置再比 */
function wire1b(v,lr){const s=$('#l15-s1b',v);const L1=()=>App.lesson(K).s1||{};const MINS=[15,20,30,40],TYK=['calc','apply','fig'];const WAIT='方案会照着诊断出的薄弱点来排';
 const mode=()=>{$('#l15-mode1b',s).textContent=modeLine()+(App.AI.real()?'':'。离线时由平台的规划程序按诊断结果排方案');};L._mode1b=mode;mode();
 const setP=o=>{const l=App.lesson(K);l.s1=l.s1||{};l.s1.p=normP(Object.assign({},l.s1.p||P0,o));App.touch();};
 const paceHint=()=>{$('#l15-pacehint',s).textContent=['先易后难','先攻最弱的','几样轮着练'][normP(L1().p||P0).pace];};paceHint();
 wire(s,'wk',i=>setP({wk:i+1}));wire(s,'min',i=>setP({min:MINS[i]}));wire(s,'ty',a=>setP({ty:a.map(i=>TYK[i])}),true);wire(s,'pace',i=>{setP({pace:i});paceHint();});
 const say=(pl,df)=>{const p=normP(L1().p||P0);App.aiSay('#l15-ai1b',planHTML(pl,{diff:df})+ckLine(pl,{wk:p.wk,min:p.min}),{mood:'happy',src:pl.src==='engine'?'offline':pl.m});};
 const stars=()=>{const l=L1();return Math.min(3,1+((l.pn||0)>=2?1:0)+(((l.ob||{}).b||[]).length>=3?1:0));};
 const mk=()=>{const l=L1();if(l.plan)App.markStep(s,0);if((l.pn||0)>=2)App.markStep(s,1);};
 const drawPlan=()=>{const l=L1();if(l.plan){say(unpackPlan(l.plan,baseDx()),null);App.ran(s);}else{idle('#l15-ai1b',WAIT);$('#l15-fb1b',s).innerHTML='';s.classList.remove('ran');}mk();};
 const go=$('#l15-plan1',s);
 go.onclick=async()=>{const had=!!curDx();const dx=baseDx();const p=normP(L1().p||P0);App.busy(go,true,'AI 正在规划…');App.aiSay('#l15-ai1b','正在排每天的任务……',{busy:true});let pl=null;
  const old=L1().plan?unpackPlan(L1().plan,dx):null;const sameSet=!!(L1().plan&&L1().plan.src==='engine'&&JSON.stringify(normP(L1().plan.p))===JSON.stringify(p));
  if(App.AI.real()){const r=await ask(planPrompt(dx,p,''),{onText:o=>{App.aiSay('#l15-ai1b',`正在规划……已写 ${String(o.text||'').split('\n').length} 行`,{busy:true});}});
   if(r.cancel){App.busy(go,false);drawPlan();return;}if(!r.off){pl=fromAI(jsonIn(r.text),r.mode);if(!pl)App.toast('AI 的方案格式不完整，已改用平台的规划程序。');}else if(r.err)App.toast(r.err);}
  else await sleep(500);
  if(!pl)pl=makePlan(dx,p);const l=App.lesson(K);l.s1=l.s1||{};l.s1.plan=packPlan(pl);l.s1.pn=(l.s1.pn||0)+1;l.s2=resetS2(l.s2);exp();App.busy(go,false);go.classList.add('again');App.touch();mk();
  const df=old?planDiff(old,pl):null;say(pl,df);const st=planStats(pl);const chg=df?Object.keys(df.rows).length+(old.d.length!==pl.d.length&&!Object.keys(df.rows).length?1:0):0;
  if(!old)App.fb('#l15-fb1b','ok',`方案出炉：${st.days} 天，每天最多 ${st.min} 分钟`,`${had?'':'还没核对 AI 的诊断，这里先按老师批改的结果排。'}换一种节奏或题型再生成，看哪几天变了。`,{stars:stars()});
  else if(chg)App.fb('#l15-fb1b','find',`新方案有 ${Object.keys(df.rows).length||pl.d.length} 天变了`,'标着“改”“新”的就是变了的那几天。设置不同，方案就不同。',{stars:stars()});
  else if(sameSet)App.fb('#l15-fb1b','try','两版方案一模一样','你没换设置，方案也就不变。换一个设置再生成。',{stars:stars()});
  else App.fb('#l15-fb1b','try','这次方案没变样','这个改动没让方案变样。换个差别大的设置，比如“两周”或“应用题”。',{stars:stars()});
  refresh('_dr2','_dr3','_dr4','_fin');};
 let nb=((L1().ob||{}).b||[]).length;
 wire(s,'o2',a=>{const l=App.lesson(K);l.s1=l.s1||{};l.s1.ob=Object.assign(l.s1.ob||{},{b:a});App.touch();
  if(a.length>=3&&nb<3&&l.s1.plan)App.fb('#l15-fb1b','ok','记下了：方案不只是做题',(l.s1.pn||0)>=2?'目标、任务、时长、复盘都有，才算一份完整的方案。':'再换个设置生成一版，就能拿满 3 颗星。',{stars:stars()});nb=a.length;},true);
 drawPlan();L._dp1=drawPlan;}

/* EXP-02 · 提要求，看 AI 改得对不对 */
function wire2(v,lr){const s=$('#l15-s2',v);const L2=()=>App.lesson(K).s2||{};const ta=$('#l15-req',s);let q=0;
 const mode=()=>{$('#l15-mode2',s).textContent=modeLine()+(App.AI.real()?'':'。离线示例听不懂的要求会如实说');};L._mode2=mode;mode();
 const base=()=>{const l=App.lesson(K);const dx=baseDx(l);const s1=l.s1||{};const p=normP(s1.p||P0);return {dx,first:unpackPlan(s1.plan,dx)||makePlan(dx,p),p};};
 const nextQ=()=>{const used=new Set((L2().h||[]).map(x=>x.r));const i=QUICK.findIndex(x=>!used.has(x[1]));q=i<0?0:i;$$('[data-seg="rq"] .chip',s).forEach(b=>b.classList.toggle('on',+b.dataset.v===q));};
 App.segWire(s,'rq',k=>{q=+k;ta.value='';});
 const draw=()=>{const l2=L2();const {dx,first}=base();const h=l2.h||[];const cur=unpackPlan(l2.plan,dx)||first,prev=l2.plan?(unpackPlan(l2.prev,dx)||first):null;const df=prev?planDiff(prev,cur):null;
  $('#l15-pv2t',s).textContent=`当前方案 · 第 ${h.length+1} 版`;$('#l15-rs2w',s).style.display=h.length?'':'none';$('#l15-plan2',s).innerHTML=planHTML(cur,{diff:df,mini:true});};
 const sayLast=()=>{const l2=L2();const x=(l2.h||[]).slice(-1)[0];if(!x){idle('#l15-ai2','AI 会回话，并把改过的那几天标出来');$('#l15-fb2',s).innerHTML='';s.classList.remove('ran');return null;}
  const ck=x.ck||{},ks=Object.keys(ck).filter(k=>RQ[k]);const badk=ks.filter(k=>!ck[k]);
  App.aiSay('#l15-ai2',`<p>${esc(x.a)}</p>${x.ch&&x.ch.length?`<ul class="l15-chg">${x.ch.map(c=>`<li>${esc(c)}</li>`).join('')}</ul>`:''}${ks.length?`<div class="l15-cks">${ks.map(k=>`<span class="${ck[k]?'ok':'bad'}">${ck[k]?'✓':'✗'} ${RQ[k][0]}</span>`).join('')}</div>`:''}${(l2.mem||[]).length?`<div class="feat"><span class="l15-memk">我记住了</span>${l2.mem.slice(-4).map(m=>`<span>${esc(m)}</span>`).join('')}</div>`:''}`,{mood:badk.length?'oops':'happy',src:x.m||'offline'});
  App.ran(s);return badk;};
 const mk=()=>{const n=Math.max((L2().h||[]).length,(L2().keep||{}).n||0);if(n>=1)App.markStep(s,0);if(n>=3)App.markStep(s,1);};
 const go=$('#l15-send',s);
 go.onclick=async()=>{const typed=nz(ta.value).length>=3;const req=typed?clip(ta.value,60):QUICK[q][1];const {dx,first,p}=base();
  const l=App.lesson(K);const l2=l.s2=l.s2||{};const cur=unpackPlan(l2.plan,dx)||first;const o=parseReq(req);const rq=mergeReq(l2.rq||{},o);if(o.ty)rq.ty=o.ty;
  App.busy(go,true,'AI 正在改…');App.aiSay('#l15-ai2',`你说：“${esc(req)}”。正在改方案……`,{busy:true});let pl=null,reply='',m='offline';
  if(App.AI.real()){const hist=(l2.h||[]).map(x=>x.r).concat([req]);
   const prompt=`你是一位小学数学学习规划助手，正在和一名五年级学生（用“我”称呼）持续交流，修改学习方案。\n诊断：薄弱知识点 ${dx.weak.map(w=>w.n).join('、')}。\n我前后提过的要求（都要满足，后面的优先）：\n${hist.map((x,i)=>`${i+1}. ${x}`).join('\n')}\n当前方案：${JSON.stringify({goal:cur.g,days:cur.d.map(x=>({d:x.d,focus:x.f,tasks:x.t,min:x.m}))})}\n请按最新要求修改方案，没要求改的地方保持不变。先用一句话（以“回复：”开头）告诉我你改了什么，然后输出一个 JSON 代码块：{"goal":"…","days":[{"d":"第1天 · 周一","focus":"…","tasks":["…"],"min":分钟}],"tips":["…"]}。`;
   const r=await ask(prompt,{onText:o2=>{App.aiSay('#l15-ai2',`正在改方案……已写 ${String(o2.text||'').split('\n').length} 行`,{busy:true});}});
   if(r.cancel){App.busy(go,false);sayLast();return;}
   if(!r.off){pl=fromAI(jsonIn(r.text),r.mode);const mm=/回复[:：]\s*([^\n]+)/.exec(r.text||'');reply=clip(mm?mm[1]:before(r.text)[0]||'好的，已经按你的要求修改了方案。',160);m=r.mode;if(!pl)App.toast('AI 的方案格式不完整，已改用平台的规划程序。');}else if(r.err)App.toast(r.err);}
  else await sleep(450);
  const known=Object.keys(o).length>0;
  if(!pl){m='offline';const np=normP(Object.assign({},p,rq));pl=known?makePlan(dx,np):cur;
   reply=known?`好的，我记住了：${memOf(o).join('；')}。方案已经按这条要求调整。`:'（离线示例）这条要求我没能理解，方案没有变化。联网的大模型能听懂更多说法。';}
  const df=planDiff(cur,pl);const ck=checkPlan(pl,rq);
  l2.prev=l2.plan||(l.s1||{}).plan||null;l2.plan=packPlan(pl);l2.rq=rq;l2.mem=[...new Set([...(l2.mem||[]),...memOf(o)])].slice(-8);
  l2.h=[...(l2.h||[]),{r:req,a:reply,m,ch:df.list.slice(0,4).map(x=>clip(x,40)),ck}].slice(-8);exp();ta.value='';App.busy(go,false);go.classList.add('again');App.touch();mk();draw();nextQ();
  const badk=sayLast()||[];const n=l2.h.length,left=Math.max(0,3-n),st=Math.min(3,n);
  if(m==='offline'&&!known)App.fb('#l15-fb2','try','AI 没听懂这句话','换个说法，比如“每天只有 20 分钟”“周末休息”。',{stars:st});
  else if(badk.length&&m!=='offline')App.fb('#l15-fb2','find','有要求可能没做到',`平台在方案里没找到：${badk.map(k=>RQ[k][0]).join('、')}。打开“看每天的任务”，你来判断 AI 做到了没有。`,{stars:st});
  else if(badk.length)App.fb('#l15-fb2','oops','AI 没做到你的要求！',`没做到：${badk.map(k=>RQ[k][0]).join('、')}。再提一次，或者自己动手改。`,{stars:st});
  else App.fb('#l15-fb2','ok',`第 ${n} 条要求，AI 改好了`,left?`标着“改”的就是变了的那几天。再提 ${left} 条，看它会不会顾此失彼。`:'提过的要求它都记着。说得越清楚，方案越贴合你。',{stars:st});
  refresh('_dr3','_dr4');};
 wire(s,'o3',i=>{up('s2',{o3:i});App.touch();});
 $('#l15-rs2',s).onclick=()=>{const l=App.lesson(K);if(!((l.s2||{}).h||[]).length)return;l.s2=resetS2(l.s2);App.touch();draw();nextQ();sayLast();
  App.fb('#l15-fb2','find','回到第 1 版了','刚才提的要求都清空了。换几条要求，再聊一遍。');refresh('_dr3','_dr4');};
 draw();mk();nextQ();sayLast();L._dr2=()=>{draw();nextQ();if(!(L2().h||[]).length)sayLast();};}

/* EXP-03 · 找不同 */
function wire3(v,lr){const s=$('#l15-s3',v);const L3=()=>App.lesson(K).s3||{};const LAB=['重点知识点','题型','每天时长','天数','节奏'];
 const tyOf=st=>['calc','apply','fig'].filter(k=>st[k]>0);
 const pair=()=>{const s1=App.lesson(K).s1||{};const me=SAMP[s1.src]?s1.src:'A';return {me,other:me==='A'?'B':'A'};};
 const diffs=(a,b)=>{const x=planStats(a),y=planStats(b);const r=[];const fx=new Set(x.focus),fy=new Set(y.focus);r[0]=x.focus.some(f=>!fy.has(f))||y.focus.some(f=>!fx.has(f));
  r[1]=tyOf(x).join()!==tyOf(y).join();r[2]=x.min!==y.min;r[3]=x.days!==y.days;const pa=a.p?a.p.pace:null,pb=b.p?b.p.pace:null;r[4]=pa!=null&&pb!=null?pa!==pb:null;return r;};/* null = 看不出来，不判 */
 const draw=()=>{const {me,other}=pair();const box=$('#l15-cmp',s);const mdx=baseDx();const mine=myPlan()||makePlan(mdx,normP((App.lesson(K).s1||{}).p||P0));
  const odx=diagnose(SAMP[other].stu),opl=makePlan(odx,SAMP[other].pref);
  const card=(cls,title,sub,dx,pl,m)=>{const st=planStats(pl);return `<div class="l15-cmpc ${cls}"><h3>${esc(title)}</h3><span class="note">${esc(sub)}</span>
   <div class="l15-kps">${(dx.weak||[]).map(w=>`<span style="--kc:${kpCol(w.k)}">${esc(w.n)} −${w.lost}</span>`).join('')}</div>
   ${svgImg(planStrip(pl),`${title}的日程条：每格一天，颜色表示重点知识点`,'l15-fig')}
   <div class="l15-cks"><span>天数：${st.days} 天</span><span>每天最多 ${st.min} 分钟</span><span>题型：${tyOf(st).map(k=>TY[k]).join('、')||'综合'}</span>${pl.p?`<span>节奏：${PACE[pl.p.pace]}</span>`:''}</div></div>`;};
  box.innerHTML=card('me','我的方案',`依据：${SAMP[me].n} 的试卷`,mdx,mine,mine.src==='engine'?'offline':mine.m)+card('',`${SAMP[other].n} 的方案`,'同一张卷，丢分的题不同',odx,opl,'offline');
  return diffs(mine,opl);};
 let truth=draw();
 wire(s,'o4',a=>{up('s3',{pick:a});App.markStep(s,0);App.touch();},true);
 $('#l15-chk3',s).onclick=()=>{truth=draw();const l=L3();const pk=l.pick||[];const ok=truth.filter((t,i)=>t==null||t===pk.includes(i)).length;const n=(l.n||0)+1;
  up('s3',{done:1,ok:l.done?l.ok:ok,n});App.markStep(s,0);App.markStep(s,1);App.touch();$('#l15-chk3',s).classList.add('again');
  $$('[data-g="o4"] .chip',s).forEach(b=>b.classList.toggle('sel',truth[+b.dataset.i]&&!pk.includes(+b.dataset.i)));
  const real=LAB.filter((_,i)=>truth[i]);const miss=LAB.filter((_,i)=>truth[i]&&!pk.includes(i)),extra=LAB.filter((_,i)=>truth[i]===false&&pk.includes(i));
  if(ok===5)App.fb('#l15-fb3','ok','5 项全判断对了！',`不同的是：${real.join('、')||'没有'}。丢分的知识点和喜好不同，方案就不同。`,{stars:n===1?3:2});
  else App.fb('#l15-fb3','try',`判断对了 ${ok}/5 项`,`${miss.length?`漏了（标黄的）：${miss.join('、')}。`:''}${extra.length?`两张卡片上其实一样：${extra.join('、')}。`:''}对照卡片下面的小标签，改一改再核对。`,{stars:1});};
 wire(s,'use3',i=>{up('s3',{use:i,conf:i===1?1:0});App.touch();
  if(i===1)App.fb('#l15-fb3','ok','先请老师家长看看，稳妥','AI 的诊断可能出错，方案也不一定适合你，大人能帮着把关。');
  else App.fb('#l15-fb3','find','想一想：万一诊断有错呢？','AI 可能看错答案、说错原因。照着错的诊断去练，会怎样？教材的建议是：请老师、家长看一看再用。');});
 if((L3().pick||[]).length)App.markStep(s,0);if(L3().done){App.markStep(s,1);App.ran(s);}
 L._dr3=()=>{truth=draw();};}

/* EXP-04 · 学习智能体：有记忆 vs 没记忆 */
const FIGS=['journey','radar','units','weak','plan','skills','future'];
const EN={'我走过的路':'My Learning Journey','我的能力图谱':'My Ability Map','我的作品与日记':'My Works & Diaries','我的数学诊断':'My Math Check-up','接下来的学习计划':'My Next Study Plan','和 AI 做搭档':'Partnering with AI','怎样学好数学':'How to Learn Math Well','怎样用好 AI':'Using AI Wisely','制订学习计划':'Making a Study Plan','保持好奇心':'Stay Curious'};
function deckOffline(fs,cfg,useMem){const sk=cfg.sk||[];const say=sk.includes('say'),tr=sk.includes('tr');const F=Object.fromEntries(fs.map(f=>[f.id,f]));const r=App.rec;const S=[];
 if(useMem&&fs.length){
  if(F.prog){const done=App.LESSONS.filter(l=>App.progress(l.k,r)>=0.8).length;const us=App.UNITS.map(u=>({u,p:App.engagement(r,u.id)})).sort((a,b)=>b.p-a.p);S.push({h:'我走过的路',p:[`15 讲中我完成了 ${done} 讲`,`最投入的单元：「${us[0].u.name}」（${us[0].p}%）`,F.exp?F.exp.t.replace(/^我/,''):'从图像、语音、文字、编程到学习伙伴'],f:'journey'});}
  if(F.dims){const sc=App.scoreAll(r);const ds=App.DIMS.filter(d=>sc[d.k]!=null).sort((a,b)=>sc[b.k]-sc[a.k]);const a=ds[0],b=ds[ds.length-1];S.push({h:'我的能力图谱',p:[`最强：「${a.n}」${sc[a.k]} 分`,`要加强：「${b.n}」${sc[b.k]} 分`,`加强的办法：${b.d}`],f:'radar'});}
  if(F.works||F.diary||F.quiz)S.push({h:'我的作品与日记',p:[F.works?F.works.t.replace(/^我在平台上/,''):'',F.diary?F.diary.t.replace(/^我/,''):'',F.quiz?F.quiz.t.replace(/^我/,''):''].filter(Boolean),f:'units'});
  if(F.diag){const dx=curDx();S.push({h:'我的数学诊断',p:[`薄弱点：${dx.weak.map(w=>w.n).join('、')}`,...dx.weak.slice(0,2).map(w=>`${w.n}：${KP[w.k]?cut(KP[w.k].lesson,26):'多复习概念和例题'}`)],f:'weak'});}
  if(F.diag||F.pref){const pl=myPlan();const st=pl?planStats(pl):null;S.push({h:'接下来的学习计划',p:[pl?cut(pl.g,30):'按诊断结果安排每天的练习',st?`${st.days} 天，每天最多 ${st.min} 分钟`:'',F.pref?cut(F.pref.t.replace(/^我的学习偏好：/,'偏好：'),30):''].filter(Boolean),f:'plan'});}
  S.push({h:'和 AI 做搭档',p:['先自己想，再看 AI 的答案','AI 的诊断和方案要核对','方案请老师和家长确认'],f:'skills'});}
 else S.push({h:'怎样学好数学',p:['每天坚持练习','做错的题要及时订正','多问几个为什么'],f:'future'},{h:'制订学习计划',p:['定一个小目标','每天安排固定的学习时间','每周复习一次'],f:'plan'},{h:'怎样用好 AI',p:['把问题说清楚','AI 的答案要验证','保护个人隐私'],f:'skills'},{h:'保持好奇心',p:['多观察、多提问','继续探索 AI 的原理'],f:'future'});
 const sl=S.slice(0,6);while(sl.length<4)sl.splice(sl.length-1,0,{h:'保持好奇心',p:['多观察、多提问','继续探索 AI 背后的原理'],f:'future'});
 sl.forEach(x=>{if(say)x.n=`这一页讲“${x.h}”。${x.p.join('；')}。`;if(tr)x.en=EN[x.h]||'';});
 return {t:!(useMem&&fs.length)?'AI 学习小贴士':clip(cfg.task&&/数学/.test(cfg.task)?'我的数学提升计划':'我的 AI 学习之旅',20),sub:useMem&&fs.length?`由学习智能体「${cfg.name||'智能体'}」根据我的学习记录生成`:`由「${cfg.name||'智能体'}」生成 · 没有使用记忆`,s:sl,m:'offline'};}
function deckFromAI(j,m,cfg){if(!j||!Array.isArray(j.slides))return null;const sk=cfg.sk||[];const s=j.slides.slice(0,6).map(x=>({h:clip(x.h||x.title||'',16)||'—',p:(Array.isArray(x.pts)?x.pts:Array.isArray(x.points)?x.points:[]).map(t=>clip(typeof t==='string'?t:'',36)).filter(Boolean).slice(0,4),f:FIGS.includes(x.fig)?x.fig:null,n:sk.includes('say')?clip(x.notes||'',120):'',en:sk.includes('tr')?clip(x.en||'',40):''})).filter(x=>x.p.length);
 if(s.length<3)return null;return {t:clip(j.title||'我的 AI 学习之旅',20),sub:clip(j.sub||'',40),s,m};}
function figHTML(f){const r=App.rec;try{if(f==='journey')return journeySVG(r,{small:true});if(f==='radar')return App.radar?App.radar([{vals:App.scoreAll(r),color:'#2f6bff'}],300):'';
 if(f==='units')return barsSVG(App.UNITS.map(u=>({n:u.name,v:App.engagement(r,u.id),l:App.engagement(r,u.id)+'%',c:'#12b886'})),{label:'各单元完成度'});if(f==='weak')return weakSVG(curDx())||barsSVG([{n:'（暂无诊断）',v:0,l:'—'}]);
 if(f==='plan')return planStrip(myPlan())||planStrip(makePlan(null,P0));if(f==='skills')return agentSVG((App.lesson(K).s4||{}).sk||['think','write','draw'],(App.lesson(K).s4||{}).name);if(f==='future')return sceneSVG('school');}catch(e){console.warn(e);}return '';}
function deckHTML(d,i,draw){if(!d)return '';const n=d.s.length+1;i=clamp(i,0,n-1);const sl=i===0?null:d.s[i-1];
 const body=i===0?`<div class="l15-slide cover"><span class="en">${esc(d.s.some(x=>x.en)?'MY AI LEARNING JOURNEY':'PRESENTATION')}</span><h3>${esc(d.t)}</h3><p class="note">${esc(d.sub||'')}</p><div class="ft"><span>AI 生成 · 来源：${esc(srcOf(d.m))}</span><span>1 / ${n}</span></div></div>`
  :`<div class="l15-slide ${sl.f&&draw?'':'nofig'}">${sl.en?`<span class="en">${esc(sl.en)}</span>`:''}<h3>${esc(sl.h)}</h3><div class="bd"><ul>${sl.p.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>${sl.f&&draw?`<div class="fg">${figHTML(sl.f)}</div>`:''}</div><div class="ft"><span>AI 生成 · ${esc(d.t)}</span><span>${i+1} / ${n}</span></div></div>`;
 return `<div class="l15-deck"><div class="l15-thumbs" role="tablist" aria-label="幻灯片">${['封面',...d.s.map(x=>x.h)].map((h,j)=>`<button type="button" data-sl="${j}" class="${j===i?'on':''}">${j+1}. ${esc(h)}</button>`).join('')}</div>${body}${sl&&sl.n?`<div class="l15-notes"><b>讲稿</b>（会说）：${esc(sl.n)}</div>`:''}
  <div class="row"><button class="btn ghost sm" type="button" data-sln="-1" ${i===0?'disabled':''}>上一页</button><button class="btn ghost sm" type="button" data-sln="1" ${i===n-1?'disabled':''}>下一页</button></div></div>`;}
function wire4(v,lr){const s=$('#l15-s4',v);const L4=()=>App.lesson(K).s4||{};const s4=lr.s4||{};const nm=$('#l15-name',s);
 const mode=()=>{$('#l15-mode4',s).textContent=modeLine()+(App.AI.real()?'。AI 不联网，“会搜”用不上':'。离线时按勾选的记忆生成');};L._mode4=mode;mode();
 const skNow=()=>{const a=$$('[data-g="sk"] .chip.on',s).map(b=>SK6[+b.dataset.i][0]);return a.length?a:['think'];};
 const nameNow=()=>clip(nz(nm.value)?nm.value.trim():'小研',8);
 const fig=()=>{$('#l15-agentfig',s).innerHTML=agentSVG(skNow(),nameNow());};
 wire(s,'sk',a=>{if(!a.length){const b=$('[data-g="sk"] [data-i="0"]',s);b.classList.add('on');b.setAttribute('aria-pressed','true');}up('s4',{sk:skNow()});fig();touchSoon();},true);
 nm.oninput=()=>{up('s4',{name:nameNow()});fig();touchSoon();};
 const drawFacts=()=>{const l=L4();const fs=facts();const off=l.off||[];const used=new Set(l.used||[]);
  $('#l15-facts',s).innerHTML=fs.length?fs.map(f=>`<label class="l15-fact ${!l.consent||off.includes(f.id)?'off':''} ${l.consent&&used.has(f.id)?'used':''}"><input type="checkbox" data-f="${f.id}" ${off.includes(f.id)?'':'checked'} ${l.consent?'':'disabled'}><span>${esc(f.t)}<small>来源：${esc(f.src)}</small></span></label>`).join(''):'<p class="note">平台上的学习记录还很少。多做几讲的实验，智能体的记忆就会丰富起来。</p>';
  $$('[data-f]',s).forEach(c=>c.onchange=()=>{const l=App.lesson(K);l.s4=l.s4||{};const o=new Set(l.s4.off||[]);c.checked?o.delete(c.dataset.f):o.add(c.dataset.f);l.s4.off=[...o];App.touch();drawFacts();});
  const sel=l.consent?fs.filter(f=>!off.includes(f.id)):[];
  $('#l15-memnote',s).textContent=!l.consent?'现在它不认识你，只知道你给的任务。':sel.length?`它会读你在平台上的 ${sel.length} 条学习记录，不读姓名。想去掉哪条，打开下面的“说明”取消勾选。`:'平台上还没有可读的学习记录（或都被你取消了）。';
  $('#l15-memtxt',s).textContent=sel.length?'发给 AI 的记忆原文：\n'+sel.map(f=>'- '+f.t).join('\n'):'（没有授权，或没有勾选任何记忆：智能体对你一无所知。）';};
 App.segWire(s,'mem',k=>{up('s4',{consent:+k,cset:1});App.touch();drawFacts();});
 const stepsHTML=(sk,useMem,cur)=>{const has=k=>sk.includes(k);const st=[['读取记忆','think',useMem],['看懂诊断结果','see',has('see')&&useMem],['自主规划提纲','think',1],['写每页的文字','write',has('write')],['画数据图','draw',has('draw')],['写讲稿','say',has('say')],['英文页标题','tr',has('tr')],['联网搜索资料','search',0],['排成可翻页的文稿','code',has('code')]];
  return `<div class="l15-steps" aria-label="智能体的自主规划">${st.map(([n,k,ok],i)=>{const sn=(SKILLS.find(x=>x[0]===k)||[])[1];const skip=!ok;const why=k==='search'?(has('search')?'（没有联网，用不上）':'（未选这项本领）'):!useMem&&(k==='see'||i===0)?'（没有记忆）':'（未选这项本领）';
   return `<span class="${i<=cur&&!skip?'on':''} ${skip&&i<=cur?'skip':''}" title="${skip?esc(why):''}">${n}<em>${sn}</em></span>`;}).join('')}</div>${cur>=8&&st.some(x=>!x[2])?'<p class="note">它自己排的步骤。划掉的：没给那项本领（或没有记忆、没联网），这一步就跳过了。</p>':''}`;};
 const quest=()=>{const l=L4();const q=l.q||{};const it=[[!!(l.deck&&l.deck0),'有记忆、没记忆各做一份'],[!!q.say,'加上“会说”做一份：多了什么？'],[!!q.nodraw,'去掉“会画”做一份：少了什么？']];
  $('#l15-quest',s).innerHTML=`<div class="l15-cks"><span class="l15-memk">小挑战</span>${it.map(([ok,t])=>`<span class="${ok?'ok':''}">${ok?'✓ ':''}${t}</span>`).join('')}</div>`;};
 const drawDeck=()=>{const l=L4();const box=$('#l15-deck',s);if(!box)return;if(S.view==='nomem'&&!l.deck0)S.view='mem';if(S.view==='mem'&&!l.deck)S.view='nomem';const d=S.view==='nomem'?l.deck0:l.deck;if(!d){box.innerHTML='';return;}
  const draw=(l.sk||[]).includes('draw');
  const two=l.deck&&l.deck0?`<div class="l15-two" aria-label="两份文稿的目录对比">${[[l.deck,'有记忆的那份',`用到了你的 ${(l.used||[]).length} 条学习记录`,'me'],[l.deck0,'没记忆的那份','没有一条关于你的记录','']].map(([d2,t,n,c])=>`<div class="${c}"><b>${t}：《${esc(d2.t)}》</b>${d2.s.map(x=>`<i>${esc(x.h)}</i>`).join('')}<small>${n}</small></div>`).join('')}</div>`:'';
  box.innerHTML=two+`<div class="l15-tabs"><button type="button" data-v="mem" class="${S.view==='mem'?'on':''}" ${l.deck?'':'disabled'}>有记忆的那份</button><button type="button" data-v="nomem" class="${S.view==='nomem'?'on':''}" ${l.deck0?'':'disabled'}>没记忆的那份</button></div>`+deckHTML(d,S.slide,draw)+(S.view==='mem'?`<p class="note">平台核对：这份文稿用到了 ${(l.used||[]).length} 条记忆。${draw?'图表由平台根据你的真实记录绘制。':'没给它“会画”的本领，所以没有配图。'}</p>`:'<p class="note">没有记忆的智能体，只能写对谁都适用的通用内容。</p>');
  $$('[data-v]',box).forEach(b=>b.onclick=()=>{S.view=b.dataset.v;S.slide=0;drawDeck();});
  $$('[data-sl]',box).forEach(b=>b.onclick=()=>{S.slide=+b.dataset.sl;drawDeck();});$$('[data-sln]',box).forEach(b=>b.onclick=()=>{S.slide+=+b.dataset.sln;drawDeck();});};
 const sayDeck=()=>{const l=L4();const d=S.view==='nomem'?l.deck0:l.deck;if(!d&&!l.deck&&!l.deck0)return;const cur=d||l.deck||l.deck0;
  App.aiSay('#l15-ai4',stepsHTML(l.sk||[],S.view==='mem'&&(l.nf||0)>0,8)+'<div id="l15-deck"></div>',{mood:'happy',src:cur.m||'offline'});drawDeck();};
 const mk=()=>{const l=L4();if(l.deck||l.deck0)App.markStep(s,0);if(l.deck&&l.deck0)App.markStep(s,1);};
 const go=$('#l15-go4',s);
 go.onclick=async()=>{const l=App.lesson(K);const c=l.s4=l.s4||{};c.name=nameNow();c.sk=skNow();c.task=TASK4;c.cset=1;c.consent=c.consent?1:0;const useMem=!!c.consent;
  const fs=useMem?facts().filter(f=>!(c.off||[]).includes(f.id)):[];const cfg={name:c.name,sk:c.sk,task:TASK4};S.busy4=true;App.busy(go,true,`${cfg.name} 正在干活…`);
  const stp=cur=>App.aiSay('#l15-ai4',stepsHTML(cfg.sk,useMem&&fs.length>0,cur)+`<p class="l15-think">${esc(cfg.name)} 正在自己规划、自己干活……</p>`,{busy:true});
  let d=null;stp(0);
  if(App.AI.real()){const sk=cfg.sk.map(k=>SKILLS.find(x=>x[0]===k)[1]).join('、');
   const prompt=`你是学生自己搭建的学习智能体「${cfg.name}」，具备这些本领：${sk}。任务：${cfg.task}。\n${fs.length?`你记得关于“我”的这些学习记录（只能使用这些事实，不要编造数字）：\n${fs.map(f=>'- '+f.t).join('\n')}`:'你没有任何关于“我”的记忆。'}\n请先用 3–5 行写出你的自主规划（每行以“规划：”开头，说明这一步用到哪项本领），然后输出一个 JSON 代码块：{"title":"标题，不超过 14 字","sub":"副标题","slides":[{"h":"页标题，不超过 10 字","pts":["要点，不超过 24 字"],"fig":"配图类型"${cfg.sk.includes('say')?',"notes":"讲稿，一两句"':''}${cfg.sk.includes('tr')?',"en":"英文页标题"':''}}]}。共 4–6 页，每页 2–3 个要点，用“我”称呼学生，语言适合小学高年级。fig 只能从 ${FIGS.join('、')} 中选（journey 学习旅程、radar 能力图谱、units 单元完成度、weak 薄弱知识点、plan 学习计划、skills 智能体本领、future 未来畅想），或写 null。`;
   let k=0;const r=await ask(prompt,{onText:o=>{const ls=before(o.text).filter(x=>/规划/.test(x));if(ls.length!==k){k=ls.length;stp(Math.min(8,k*2));}}});
   if(r.cancel){S.busy4=false;App.busy(go,false);if(c.deck||c.deck0)sayDeck();else idle('#l15-ai4','只提一个整体要求，它会自己规划、自己干活');return;}
   if(!r.off){d=deckFromAI(jsonIn(r.text),r.mode,cfg);if(!d)App.toast('AI 的演示文稿格式不完整，已改用离线示例。');}else if(r.err)App.toast(r.err);}
  if(!d){d=deckOffline(fs,cfg,useMem);for(let i=0;i<=8;i++){if(!S.busy4)break;stp(i);await sleep(220);}}
  const txt=[d.t,d.sub,...d.s.flatMap(x=>[x.h,...x.p,x.n||''])].join(' ');const used=useMem?fs.filter(f=>f.keys.some(k=>k&&txt.includes(k))).map(f=>f.id):[];
  const pack={t:d.t,sub:d.sub,m:d.m,s:d.s.map(x=>({h:x.h,p:x.p,f:x.f,...(x.n?{n:clip(x.n,120)}:{}),...(x.en?{en:x.en}:{})}))};
  if(useMem){c.deck=pack;c.used=used;c.nf=fs.length;S.view='mem';}else{c.deck0=pack;S.view='nomem';}c.runs=(c.runs||0)+1;
  const hasN=d.s.some(x=>x.n),noFig=!cfg.sk.includes('draw');c.q=c.q||{};if(cfg.sk.includes('say')&&hasN)c.q.say=1;if(noFig)c.q.nodraw=1;
  const xtra=`${cfg.sk.includes('say')&&hasN?' 给了“会说”，每页多了一段讲稿。':''}${noFig?' 没给“会画”，这份没有配图。':''}`;S.slide=0;exp();S.busy4=false;App.busy(go,false);go.classList.add('again');App.touch();mk();drawFacts();sayDeck();quest();refresh('_fin');
  const both=!!(c.deck&&c.deck0);const st=both?3:c.sk.length>=3?2:1;
  if(both)App.fb('#l15-fb4','ok','两份都有了，比一比！',((c.used||[]).length?'看上面两份目录：有记忆的那份写的是你；没记忆的那份谁都能用。':'看上面两份目录：有记忆的那份里，平台没找到你的记录。翻一翻，它用上了吗？')+xtra+' 再试试下面的小挑战。',{stars:st});
  else if(!useMem)App.fb('#l15-fb4','find','没有记忆，只能写通用内容',`「${esc(cfg.name)}」不认识你，这份文稿谁都能用。${xtra}把“记忆”换成“读我的学习记录”，再做一份。`,{stars:st});
  else if(!fs.length)App.fb('#l15-fb4','find','它的记忆还是空的','平台上的学习记录还太少，或者都被取消了。多做几讲实验再来。',{stars:st});
  else App.fb('#l15-fb4','ok',`「${esc(cfg.name)}」做出了你的专属文稿`,`它用到了 ${used.length} 条记忆。${xtra}把“记忆”换成“不用记忆”，再做一份比一比。`,{stars:st});};
 wire(s,'o42',i=>{const l=App.lesson(K);l.s4=l.s4||{};l.s4.ob=Object.assign(l.s4.ob||{},{b:i});App.touch();});
 if(s4.deck)S.view='mem';else if(s4.deck0)S.view='nomem';
 fig();drawFacts();mk();quest();if(s4.deck||s4.deck0){sayDeck();App.ran(s);}
 L._dr4=()=>{drawFacts();drawDeck();};}

/* EXP-05 · 新蓝图：揪出 AI 说过头的话 */
const BLUE={t:'人与 AI 和谐共处的新蓝图',sc:[{w:'school',h:'在学校',x:'AI 助教帮老师批改练习、整理每个同学的错题。老师省下时间，和我们聊天、带我们做实验。'},
 {w:'home',h:'在家里',x:'AI 管家提醒爷爷按时吃药，扫地、做饭这些重复的活儿它来干，一家人有更多时间在一起。'},
 {w:'field',h:'在田野',x:'AI 帮农民看天气、看庄稼，提醒哪块地该浇水了。以后 AI 会替我们做所有决定，我们只要听它的就行。'},
 {w:'science',h:'在实验室',x:'科学家和 AI 一起分析海量数据，更快地研制新药、探索太空。'}],end:'AI 做它擅长的事，人做只有人能做的事：想新点子、关心别人、判断对错。'};
const BAD5={sc:2,i:1};
const splitS=t=>String(t||'').match(/[^。！？!?]+[。！？!?]?/g)||[];
function wire5(v,lr){const s=$('#l15-s5',v);const L5=()=>App.lesson(K).s5||{};
 const mode=()=>{$('#l15-mode5',s).textContent=modeLine()+(App.AI.real()?'。插图由平台绘制':'。离线时是预置的作品示例，里面有一句说过头的话（示意）');};L._mode5=mode;mode();
 const mine=$('#l15-mine',s);mine.oninput=()=>{up('s5',{mine:clip(mine.value,300)});touchSoon();mine2();};
 const wrote=()=>nz(L5().mine).length>=6;
 const draw=()=>{const l=L5();const p=l.p;const box=$('#l15-poster',s);if(!p||!box)return;const fl=new Set(l.fl||[]);const off=p.m==='offline';
  box.innerHTML=`<div class="l15-poster"><h3>${esc(p.t)}</h3><div class="l15-scs">${p.sc.map((x,i)=>`<div class="l15-sc">${sceneSVG(x.w)}<b>${esc(x.h)}</b><p>${splitS(x.x).map((t,j)=>{const id=i+'.'+j;const bad=off&&i===BAD5.sc&&j===BAD5.i;const cls=fl.has(id)?(off?(bad?'bad':'fine'):'doubt'):'';return `<span class="l15-sn ${cls}" data-sn="${id}" tabindex="0" role="button" aria-pressed="${fl.has(id)}">${esc(t)}</span>`;}).join('')}</p></div>`).join('')}</div>${p.end?`<p class="l15-end">${esc(p.end)}</p>`:''}</div>`;
  $$('[data-sn]',box).forEach(e=>{const tg=()=>tap(e.dataset.sn);e.onclick=tg;e.onkeydown=ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();tg();}};});};
 const mine2=()=>{$('#l15-mine2',s).textContent=wrote()?`你写的：“${cut(L5().mine,80)}”`:'你还没写自己的畅想。在上面的框里写一句，再来比。';};
 const sayP=()=>{const p=L5().p;if(!p)return;App.aiSay('#l15-ai5','<div id="l15-poster"></div>',{mood:'happy',src:p.m||'offline'});draw();mine2();};
 const tap=id=>{const l=App.lesson(K);const c=l.s5=l.s5||{};const p=c.p;if(!p)return;const f=new Set(c.fl||[]);
  if(p.m==='offline'){const was=!!c.chk;const bad=id===BAD5.sc+'.'+BAD5.i;f.add(id);c.fl=[...f].slice(0,12);if(!was)c.t=(c.t||0)+1;
   if(bad){c.chk=1;App.markStep(s,1);App.fb('#l15-fb5','oops','你揪出 AI 说过头的话了！','“AI 会替我们做所有决定”不对：重要的决定要由人来做，AI 只是帮手。',{stars:c.t<=1&&wrote()?3:2,cheer:!was});}
   else App.fb('#l15-fb5','try','不是这一句，再找找','这句说的是 AI 帮人做事。哪句话把 AI 说得太厉害、忘了人的作用？');}
  else{f.has(id)?f.delete(id):f.add(id);c.fl=[...f].slice(0,12);c.chk=1;App.markStep(s,1);
   App.fb('#l15-fb5','find',f.size?`你标出了 ${f.size} 处疑问`:'疑问都取消了','和同桌说说：这句话哪里不对？人该做什么？',{stars:f.size?(wrote()?3:2):1});}
  App.touch();draw();};
 const go=$('#l15-go5',s);
 go.onclick=async()=>{App.busy(go,true,'AI 正在画…');App.aiSay('#l15-ai5','正在构思 4 个场景……',{busy:true});let p=null;
  if(App.AI.real()){const r=await ask('用小学生能听懂的语言，描绘人与 AI 和谐共处的新蓝图，并生成图文并茂的作品。\n先用 1 行说明你的构思（以“构思：”开头），然后输出一个 JSON 代码块：{"title":"标题","scenes":[{"w":"school、home、city、field、science、space 之一（决定配图）","h":"场景小标题，不超过 6 字","x":"两三句描述，不超过 70 字"}],"end":"一句总结"}，共 4 个场景。',{tier:'quick',onText:o=>{App.aiSay('#l15-ai5',`正在创作……已写 ${String(o.text||'').length} 字`,{busy:true});}});
   if(r.cancel){App.busy(go,false);if(L5().p)sayP();else idle('#l15-ai5','新对话，AI 不认识你。');return;}
   if(!r.off){const j=jsonIn(r.text);if(j&&Array.isArray(j.scenes)&&j.scenes.length>=2)p={t:clip(j.title||'人与 AI 的新蓝图',20),sc:j.scenes.slice(0,4).map(x=>({w:['school','home','city','field','science','space'].includes(x.w)?x.w:'city',h:clip(x.h||'',8),x:clip(x.x||'',90)})),end:clip(j.end||'',60),m:r.mode};else App.toast('AI 的作品格式不完整，已改用离线示例。');}else if(r.err)App.toast(r.err);}
  else await sleep(700);
  if(!p)p=Object.assign({m:'offline'},BLUE);up('s5',{p,fl:[],chk:0,t:0,runs:((L5().runs)||0)+1});exp();App.busy(go,false);go.classList.add('again');App.markStep(s,0);App.touch();sayP();
  App.fb('#l15-fb5','find',`AI 画了 ${p.sc.length} 个场景`,`${wrote()?'':'你还没写自己的畅想，补上再比一比。'}${p.m==='offline'?'有一句话把 AI 说得太厉害了，在图文里点它！':'有没有哪句话说过头了？点一点你有疑问的句子。'}`,{stars:1});};
 wire(s,'same5',i=>{up('s5',{same:i});App.touch();});
 if(L5().p){sayP();App.markStep(s,0);App.ran(s);if(L5().chk)App.markStep(s,1);}}

/* FINALE · 猜最强能力，揭晓图谱 */
function wire6(v,lr){const s=$('#l15-s6',v);const L6=()=>App.lesson(K).s6||{};let g=L6().g6||null;
 const tally=()=>{const r=App.rec;let works=[];App.LESSON_KEYS.forEach(k=>{const LL=App.lessons[k];if(LL&&LL.works){try{(LL.works((r.lessons||{})[k]||{})||[]).forEach(w=>works.push(Object.assign({k},w)));}catch(e){}}});
  let ne=0;App.LESSON_KEYS.forEach(k=>{const LL=App.lessons[k];if(LL&&LL.expCount){try{ne+=+LL.expCount((r.lessons||{})[k]||{})||0;}catch(e){}}});
  return {works,ne,done:App.LESSONS.filter(l=>App.progress(l.k,r)>=0.8).length,dia:App.LESSON_KEYS.filter(k=>(((r.lessons||{})[k]||{}).diary||{}).submitted).length};};
 const fin=()=>{const r=App.rec;if(!r||!$('#l15-journey',s))return;const t=tally();$('#l15-journey',s).innerHTML=journeySVG(r);
  $('#l15-stats',s).innerHTML=[[`${t.done}/15`,'完成的讲次'],[t.ne,'AI 实验'],[t.works.length,'作品'],[t.dia,'成长日记']].map(([b,n])=>`<div><b>${b}</b><span>${n}</span></div>`).join('');
  $('#l15-more6',s).innerHTML=`<p class="note"><b>我的作品</b>（${t.works.length} 件，显示最近 8 件）</p>${t.works.length?`<div class="l15-wk">${t.works.slice(-8).reverse().map(w=>`<div><b>${esc(w.t)}</b>${esc((App.lessonInfo(w.k)||{}).nav||'')}</div>`).join('')}</div>`:'<p class="note">还没有作品。</p>'}${barsSVG(App.UNITS.map(u=>({n:u.name,v:App.engagement(r,u.id),l:App.engagement(r,u.id)+'%',c:'#12b886'})),{label:'各单元完成度'})}`;};
 const reveal=()=>{const sc=App.scoreAll(App.rec);const ds=App.DIMS.filter(d=>sc[d.k]!=null).sort((a,b)=>sc[b.k]-sc[a.k]);const a=ds[0],b=ds[ds.length-1];
  App.aiSay('#l15-ai6',`${ds.length>=2?`<div class="big">最强：${a.s} · ${sc[a.k]} 分</div>`:''}${App.radar?App.radar([{vals:sc,color:'#2f6bff'}],280):''}<div class="l15-cks" aria-label="六项能力的分数">${ds.map(d=>`<span class="${d===a?'ok':''}">${d.s}${d.n&&d.n!==d.s?`（${d.n}）`:''} ${sc[d.k]}</span>`).join('')}</div>${ds.length>=2?`<p>还能加强：${b.s}（${sc[b.k]} 分）。回到前面的讲次多做实验、多写记录，它会长高。</p>`:'<p>做完更多实验，图谱会更完整。</p>'}`,{mood:'happy'});return {sc,ds,a};};
 App.segWire(s,'g6',k=>{g=k;up('s6',{g6:k});App.markStep(s,0);App.touch();});
 $('#l15-go6',s).onclick=()=>{up('s6',{shown:1});const {sc,ds,a}=reveal();App.markStep(s,1);App.touch();$('#l15-go6',s).classList.add('again');const gd=App.DIMS.find(d=>d.k===g);
  if(ds.length<2)App.fb('#l15-fb6','find','记录还太少，图谱没画满','回到前面几讲多做实验，再来揭晓。',{stars:1});
  else if(gd&&sc[g]===sc[a.k])App.fb('#l15-fb6','ok',`猜对了！你最强的是「${gd.s}」`,'你很了解自己。看看旅程图：哪一讲你最难忘？',{stars:3});
  else if(gd)App.fb('#l15-fb6','find',`最强的是「${a.s}」，和你猜的不一样`,`你猜的「${gd.s}」是 ${sc[g]==null?'—':sc[g]} 分。图谱看的是你做实验的过程，不只是测验。`,{stars:2});
  else App.fb('#l15-fb6','find',`你最强的是「${a.s}」`,'下次先猜再揭晓。图谱看的是你做实验的过程，不只是测验。',{stars:1});};
 fin();if(g)App.markStep(s,0);if(L6().shown){reveal();App.markStep(s,1);App.ran(s);}L._fin=fin;}

/* FINALE · 续：给未来的自己写信 */
function wire6b(v,lr){const s=$('#l15-s6b',v);const L6=()=>App.lesson(K).s6||{};const l6=lr.s6||{};const lt=$('#l15-letter',s);lt.value=l6.letter||'';
 const cnt=()=>{const n=nz(lt.value).length;$('#l15-cnt',s).textContent=`已写 ${n} 个字`+(n<30?`，再写 ${30-n} 个字就能封存`:'，可以封存了');if(n>=10)App.markStep(s,0);};
 lt.oninput=()=>{up('s6',{letter:clip(lt.value,600)});cnt();touchSoon();};
 App.segWire(s,'open6',k=>{up('s6',{open:+k});App.touch();drawSeal();});
 const drawSeal=()=>{const l=L6();$('#l15-sealed',s).innerHTML=l.sealed?`<div class="l15-letter">${esc(l.letter)}<span class="note">封存于 ${new Date(l.sealed).toLocaleDateString('zh-CN')} · 打开时间：${OPEN6[l.open||0]}</span></div>`:'';$('#l15-close6',s).innerHTML=l.sealed?CLOSE:'';};
 $('#l15-seal',s).onclick=()=>{const l=L6();const n=nz(l.letter).length;
  if(n<30){App.fb('#l15-fb6b','try','信还太短，封不上',`现在 ${n} 个字，写满 30 个字再封存。可以写：最难忘的一次实验、你和 AI 的约定。`);return;}
  up('s6',{sealed:Date.now(),open:l.open||0});App.markStep(s,0);App.markStep(s,1);App.touch();drawSeal();$('#l15-seal',s).classList.add('again');
  App.fb('#l15-fb6b','ok','时间胶囊封好了！',`${OPEN6[L6().open||0]}再打开，看看那时的你和 AI 相处得怎样。想改信？改完再按一次“封存”。`,{stars:3});};
 cnt();drawSeal();if(l6.sealed){App.markStep(s,1);App.ran(s);}}

/* diary extras: the growth archive */
function diaryExtras(ex){const lr=App.lesson(K);const pl=myPlan(lr);const s4=lr.s4||{},s5=lr.s5||{},s6=lr.s6||{};const d=s4.deck;
 ex.innerHTML=`<div class="l15-col"><div><div class="box-t">AI 生成的学习方案</div>${pl?`<p>${esc(pl.g)}</p>${planStrip(pl)}<p class="note">${pl.d.length} 天 · ${(lr.s2&&lr.s2.h||[]).length} 次修改 · ${esc(srcOf(pl.src==='engine'?'offline':pl.m))}${(lr.s3||{}).conf?' · 会请老师或家长确认':''}</p>`:'<p class="note">还没有生成学习方案。</p>'}</div>
  <div><div class="box-t">图文并茂的毕业作品</div>${d?`<p><b>${esc(d.t)}</b> · ${d.s.length+1} 页演示文稿${s4.used?`，用到 ${s4.used.length} 条记忆`:''}</p><div id="l15-dxdeck"></div>`:'<p class="note">还没有生成演示文稿。</p>'}
   ${s5.p?`<p class="note">新蓝图：${esc(s5.p.t)}（${s5.p.sc.length} 个场景）</p>`:''}</div>
  <div><div class="box-t">写给未来自己的话</div>${s6.letter?`<div class="l15-letter">${esc(cut(s6.letter,160))}</div>`:'<p class="note">还没有写。</p>'}</div></div>`;
 if(d){let i=1;const host=$('#l15-dxdeck',ex);const dr=()=>{host.innerHTML=deckHTML(d,i,(s4.sk||[]).includes('draw'));$$('[data-sl]',host).forEach(b=>b.onclick=()=>{i=+b.dataset.sl;dr();});$$('[data-sln]',host).forEach(b=>b.onclick=()=>{i+=+b.dataset.sln;dr();});};dr();}}

L.onShow=()=>{['_mode1','_mode1b','_mode2','_mode4','_mode5','_dr2','_dr3','_dr4','_fin'].forEach(k=>{try{L[k]&&L[k]();}catch(e){console.warn(e);}});};
L.onHide=()=>{stopAll();};
window.addEventListener('ai-mode',()=>{['_mode1','_mode1b','_mode2','_mode4','_mode5'].forEach(k=>L[k]&&L[k]());});

/* ---------- hooks ---------- */
L.score=lr=>{const Q=lr.quiz||{},qs=id=>Q[id]?(Q[id].ok?100:0):0,tx=App.txtScore,D=lr.diary||{},w=lr.w||{},s1=lr.s1||{},s2=lr.s2||{},s3=lr.s3||{},s4=lr.s4||{},s5=lr.s5||{},s6=lr.s6||{};
 const vf=(s1.vf||{}).done?s1.vf:(s1.vfb||s1.vf||{}),h=s2.h||[],ob1=s1.ob||{},ob4=s4.ob||{},kp=s2.keep||{};
 const hn=Math.max(h.length,kp.n||0),ht=h.map(x=>x.r).join('').length>=String(kp.t||'').length?h.map(x=>x.r).join(''):kp.t,rqn=Math.max(Object.keys(s2.rq||{}).length,kp.rq||0);
 return {principle:(w.g===1?20:w.g!=null?8:0)+(s4.deck?15:0)+(s4.deck&&s4.deck0?10:0)+((ob1.b||[]).length>=3?10:0)+(s3.done?5:0)+0.4*(qs('q1')+qs('q4')+qs('q5'))/3,
  experiment:(s1.ai?20:0)+(s1.plan?15:0)+20*Math.min(1,hn/3)+(s3.done?10:0)+(s4.deck?10:0)+(s4.deck0?5:0)+(s5.p?10:0)+(vf.done?5:0)+(s2.o3!=null?5:0),
  prompt:30*Math.min(1,hn/3)+0.25*tx(ht,40)+(rqn>=3?15:0)+(nz(s4.task).length>=8?10:0)+((s4.sk||[]).length>=3?10:0)+0.1*qs('q2'),
  critical:(vf.done?(vf.ok!=null&&vf.n?30*vf.ok/vf.n:15):0)+(vf.caught?20:0)+(s3.done?15*(s3.ok||0)/5:0)+(s5.chk||(s5.fl||[]).length?10:0)+(vf.caught?5:0)+0.2*qs('q3'),
  creative:0.25*tx(s5.mine,30)+(s4.deck?15:0)+(nz(s4.name).length?5:0)+0.35*tx(s6.letter,80)+0.2*tx(D.agent,30),
  ethics:(s4.cset?20:0)+((s4.off||[]).length?5:0)+(s3.conf?20:0)+(s3.use===1?10:0)+(D.pledge?15:0)+0.2*tx(D.align,30)+(s5.chk?10:0)};};
L.progress=lr=>{const s1=lr.s1||{},s2=lr.s2||{},s3=lr.s3||{},s4=lr.s4||{},s5=lr.s5||{},s6=lr.s6||{};
 const m=[(lr.w||{}).g!=null,!!(s1.ai&&((s1.vf||{}).done||(s1.vfb||{}).done)),!!s1.plan,Math.max((s2.h||[]).length,(s2.keep||{}).n||0)>=2,!!s3.done,!!s4.deck,!!(s5.p&&s5.same!=null),!!s6.sealed,Object.keys(lr.quiz||{}).length>=5,!!(lr.diary||{}).submitted];
 return m.filter(Boolean).length/m.length;};
L.quiz=QUIZ;
L.flow=[
 {seg:'导入',from:'l15-s0'},
 {seg:'挑战一',kp:'知识点一 · AI 学情诊断与学习规划',learn:['同一类错题反复出现，不是粗心，是薄弱点','丢分题→错因→薄弱点→学习方案','像新朋友：主动、多次、说清楚，越聊越懂'],sum:['AI 诊断很快，但会看错，要逐条核对','方案越聊越贴合，还要请老师和家长确认'],from:'l15-s1',to:'l15-s3'},
 {seg:'挑战二',kp:'知识点二 · 智能体及其特点',learn:['智能体：较强记忆力、能自主规划、功能更综合全面','只提一个整体要求，它自己规划、多本领协同','记忆由我授权，可以选择、可以取消'],sum:['有记忆，才能做出符合我的学习资料','新对话不认识我；夸大 AI 的话要标出来'],from:'l15-s4',to:'l15-s5'},
 {seg:'综合运用',from:'l15-s6'},
 {seg:'反思与总结',from:'l15-quiz'}
];
L.diaryTitle='我的成长蓝图';
L.diaryQ=[['agent','我还想拥有的智能体'],['align','让 AI 与目标保持一致'],['vision','AI 的蓝图和我的畅想']];
L.works=lr=>{const o=[];const s1=lr.s1||{},s2=lr.s2||{},s4=lr.s4||{},s5=lr.s5||{},s6=lr.s6||{};
 if(s1.plan){let pl=null;try{pl=myPlan(lr);}catch(e){}o.push({t:'我的数学学习方案',s:pl?`${pl.d.length} 天 · ${(s2.h||[]).length} 次修改｜${cut(pl.g,36)}`:'AI 生成的学习方案',glyph:'规'});}
 if(s4.deck)o.push({t:`演示文稿 · ${s4.deck.t}`,s:`${s4.deck.s.length+1} 页 · 用到 ${(s4.used||[]).length} 条记忆｜智能体「${s4.name||''}」`,glyph:'稿'});
 if(s5.p)o.push({t:'人与 AI 新蓝图',s:`${s5.p.sc.length} 个场景｜${cut(s5.mine,30)}`,glyph:'图'});
 if(s6.sealed)o.push({t:'写给未来自己的信',s:`打开时间：${['一年后','小学毕业时','初中毕业时'][s6.open||0]}`,glyph:'信'});
 return o;};
L.expCount=lr=>lr.nExp||0;
L.classPanels=recs=>{const R=recs.map(r=>(r.lessons||{})[K]||{}).filter(l=>Object.keys(l).length);if(!R.length)return '';
 const bar=(n,v,tot,col,lab)=>`<div class="hbar"><span>${n}</span><span class="tr"><i style="width:${tot?100*v/tot:0}%;background:${col}"></i></span><span>${lab!=null?lab:v}</span></div>`;
 const S1=R.map(l=>l.s1||{}).filter(x=>x.ai);const fl=['A','B','C'].map(k=>{const xs=S1.filter(x=>x.src===k&&(x.vf||{}).done&&x.ai.m==='offline');return {k,n:xs.length,c:xs.filter(x=>x.vf.caught).length};});
 const vd=S1.filter(x=>(x.vf||{}).done&&x.vf.n);const acc=vd.length?Math.round(100*vd.reduce((a,x)=>a+x.vf.ok/x.vf.n,0)/vd.length):null;
 const hs=R.map(l=>((l.s2||{}).h||[]).length);const avgH=hs.length?(hs.reduce((a,b)=>a+b,0)/hs.length).toFixed(1):'—';
 const rq={};R.forEach(l=>Object.keys((l.s2||{}).rq||{}).forEach(k=>{rq[k]=(rq[k]||0)+1;}));
 const S4=R.map(l=>l.s4||{});const cs=S4.filter(x=>x.cset),cy=cs.filter(x=>x.consent),ex=cy.filter(x=>(x.off||[]).length);
 return `<div class="box"><div class="box-t">第15讲 · 学习诊断仪与方案调整（${R.length} 人）</div>
   ${fl.map(f=>bar(`${SAMP[f.k].n}：发现 AI 的${{A:'看错答案',B:'错因分析',C:'漏判'}[f.k]}`,f.c,f.n,'var(--amber)',f.n?`${f.c}/${f.n}`:'—')).join('')}
   <p class="note" style="margin:4px 0 8px">核对 AI 诊断的判断正确率：${acc!=null?acc+'%':'—'}；人均修改方案 ${avgH} 次。</p>
   <b style="font-size:13px">学生提出最多的修改要求</b>${Object.entries(rq).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([k,n])=>bar(RQ[k]?RQ[k][0]:k,n,R.length,'var(--cyan)',n)).join('')||'<p class="note">还没有人提出要求。</p>'}</div>
  <div class="box"><div class="box-t">第15讲 · 智能体与成长蓝图</div>
   ${bar('做出记忆授权决定',cs.length,R.length,'var(--violet)',`${cs.length}/${R.length}`)}${bar('同意读取学习记录',cy.length,cs.length,'var(--violet)',`${cy.length}/${cs.length}`)}${bar('同意后又取消了部分记忆',ex.length,cy.length,'var(--violet)',`${ex.length}/${cy.length}`)}
   ${bar('生成个性化演示文稿',S4.filter(x=>x.deck).length,R.length,'var(--green)',S4.filter(x=>x.deck).length)}${bar('做了“不用记忆”对照',S4.filter(x=>x.deck0).length,R.length,'var(--green)',S4.filter(x=>x.deck0).length)}
   ${bar('方案会请老师家长确认',R.filter(l=>(l.s3||{}).conf).length,R.length,'var(--amber)',R.filter(l=>(l.s3||{}).conf).length)}${bar('封存了写给未来的信',R.filter(l=>(l.s6||{}).sealed).length,R.length,'var(--amber)',R.filter(l=>(l.s6||{}).sealed).length)}</div>`;};
L.classSug=recs=>{const R=recs.map(r=>(r.lessons||{})[K]||{}).filter(l=>Object.keys(l).length);if(!R.length)return [];const out=[];
 const S1=R.map(l=>l.s1||{}).filter(x=>(x.vf||{}).done&&x.ai&&x.ai.m==='offline'&&SAMP[x.src]);const miss=S1.filter(x=>!x.vf.caught);
 if(S1.length>=4&&miss.length/S1.length>=0.4){const by={};miss.forEach(x=>{by[x.src]=(by[x.src]||0)+1;});const top=Object.entries(by).sort((a,b)=>b[1]-a[1])[0][0];
  out.push(`第15讲中 ${miss.length}/${S1.length} 名学生没有发现 AI 诊断里的错误（最多的是${SAMP[top].n}：${{A:'AI 把第 2 题的 7/12 看成 1/12',B:'AI 把第 8 题的错因说成“上底 × 下底”',C:'AI 漏掉了第 6 题'}[top]}）：投影这份试卷，请学生对照老师的 ✓/✗ 逐题核对，强调“AI 的诊断要人来核对”。`);}
 const pl=R.filter(l=>(l.s1||{}).plan);const nc=pl.filter(l=>!(l.s3||{}).conf);if(out.length<2&&pl.length>=4&&nc.length/pl.length>=0.4)out.push(`${nc.length}/${pl.length} 名学生生成了学习方案，但还没表示会请老师或家长确认：组织一次“方案评审”，让同桌互看方案、指出一处不合理的安排，再讨论教材思考园地第 2 题。`);
 const h=R.map(l=>((l.s2||{}).h||[]).length);const few=h.filter(n=>n<2).length;if(out.length<2&&R.length>=4&&few/R.length>=0.4)out.push(`${few} 名学生和 AI 交流修改方案不到 2 次：示范一次“说清学习情况”的要求（如“我每周三有篮球课，每天只有 20 分钟”），再看平台对每一版的逐条检查。`);
 const cs=R.map(l=>l.s4||{}).filter(x=>x.consent);if(out.length<2&&cs.length>=5&&cs.filter(x=>(x.off||[]).length).length===0)out.push('所有同意授权的学生都没有取消任何一条记忆：讨论“哪些学习记录可以交给 AI，哪些不想交”，强调授权是可以选择、可以收回的。');
 return out.slice(0,2);};
L.demo=(rnd,t)=>{const p=x=>rnd()<x;const pick=a=>a[Math.floor(rnd()*a.length)];const lr={};let n=0;
 lr.w={g:p(.45+t*.5)?1:pick([0,2])};
 const src=pick(['A','B','C']);const T=diagnose(SAMP[src].stu);const o=aiOffline(src);
 if(p(.5+t*.45)){n++;const s1={src,g:p(.4+t*.5)?T.weak[0].k:pick(Object.keys(KP)),ai:{lost:o.lost.map(x=>[x.no,x.why,x.kp,x.stu,'','']),weak:o.weak,sum:o.sum,m:'offline',think:[]},vf:{},p:normP(SAMP[src].pref),runs:1};
  if(p(.4+t*.55)){const n0=o.lost.length+1;const ok=Math.min(n0,Math.round(n0*(.45+t*.5+rnd()*.15)));s1.vf={done:1,n:n0,ok,caught:p(.25+t*.65)?1:0,j:{},miss:0};s1.dx=compactDx(T);
   if(p(.5+t*.45)){s1.plan={src:'engine',p:s1.p};n++;}}
  s1.ob=p(.3+t*.6)?{a:p(.4+t*.5)?1:0,b:[0,1,2,3].slice(0,1+Math.floor(rnd()*4)),c:pick([0,1])}:{};lr.s1=s1;
  if(s1.plan&&p(.3+t*.6)){const reqs=['每天只有 20 分钟','改成两个星期的学习方案','周末要休息一天','多安排一些应用题','围绕错题出类似的题目'].slice(0,1+Math.floor(rnd()*(2+3*t)));let rq={};const h=[];
   reqs.forEach(r=>{const o2=parseReq(r);rq=mergeReq(rq,o2);h.push({r,a:'好的，已经按要求调整。',m:'offline',ch:[],ck:Object.fromEntries(Object.keys(rq).filter(k=>RQ[k]).map(k=>[k,p(.85)?1:0]))});n++;});
   lr.s2={h,rq,mem:reqs.flatMap(r=>memOf(parseReq(r))),plan:{src:'engine',p:normP(Object.assign({},s1.p,rq))},o3:p(.6)?0:1};}}
 if(p(.3+t*.6))lr.s3={pick:[0,1,2],done:1,ok:Math.round(2+3*t*rnd()+1),why:p(t)?'因为我们丢分的知识点不一样，喜欢的题型和时间也不一样。':'',use:p(.55+t*.4)?1:0,conf:p(.4+t*.55)?1:0,th:p(t)?'要多和 AI 说自己的情况。':''};
 if(p(.3+t*.6)){const s4={name:pick(['小研','数学星','学伴','小图']),sk:['think','write','draw',...(p(.5)?['say']:[]),...(p(.3)?['tr']:[])],task:'根据我的学习情况，做一份图文并茂的演示文稿：我的 AI 学习之旅',cset:1,consent:p(.85)?1:0};
  if(s4.consent&&p(.25))s4.off=['quiz'];s4.deck={t:'我的 AI 学习之旅',sub:'',m:'offline',s:[{h:'我走过的路',p:['15 讲中我完成了 12 讲'],f:'journey'},{h:'我的能力图谱',p:['最强：批判思维'],f:'radar'},{h:'我的数学诊断',p:['薄弱点：分数加减法'],f:'weak'},{h:'和 AI 做搭档',p:['AI 的诊断要核对'],f:'skills'}]};s4.used=['prog','dims','diag'].slice(0,1+Math.floor(rnd()*3));n++;
  if(p(.3+t*.5)){s4.deck0={t:'AI 学习小贴士',sub:'',m:'offline',s:[{h:'怎样学好数学',p:['每天坚持练习'],f:'future'}]};n++;}s4.ob=p(.4+t*.5)?{a:[0,1,3,4],b:pick([0,0,1])}:{};lr.s4=s4;}
 if(p(.25+t*.6)){lr.s5={mine:'我希望以后 AI 帮我们做重复的事，我们去创造新东西。',p:Object.assign({m:'offline'},BLUE),fl:p(.3+t*.6)?['2.1']:[],chk:p(.6)?1:0,same:pick([0,1,1,2]),runs:1};n++;}
 if(p(.2+t*.6))lr.s6={read:1,letter:'未来的我：你好！这学期我学会了和 AI 做搭档，也学会了检查 AI 的答案。希望你一直保持好奇心。',open:pick([0,1,2]),sealed:p(.7)?Date.now():0};
 const q=(id,pp)=>{const ok=p(pp);const a=QUIZ.find(x=>x.id===id).a;return {first:ok?a:(a+1)%3,ok,last:a};};
 if(p(.3+t*.65))lr.quiz={q1:q('q1',.6+t*.4),q2:q('q2',.7+t*.3),q3:q('q3',.5+t*.5),q4:q('q4',.5+t*.45),q5:q('q5',.6+t*.4)};
 if(p(.2+t*.7))lr.diary={agent:p(t+.1)?'我希望有一个科学探究智能体，会搜资料、会画图、会提醒我做实验记录。':'运动智能体。',align:p(t)?'把目标和要求说清楚，每一步检查它做得对不对，重要的决定自己做。':'多检查。',vision:p(t)?'部分一样：我也想到了学校，但 AI 没想到用 AI 保护动物。':'',pledge:p(.8),submitted:p(t+.1)?1:0};
 lr.nExp=n;return lr;};
L._t={F,fa,fs,fm,fd,feq,dec,fmtF,fmtD,parseAns,evalExpr,verifyQ,gen,diagnose,aiOffline,makePlan,parseReq,checkPlan,planDiff,fromAI,PAPER,SAMP,KP,jsonIn,facts,deckOffline};
})();
