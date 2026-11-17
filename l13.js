/* 第13讲 练习工坊 (v3)（出题批改伴我学 · AI 辅助数学）
   WARM-UP 速算擂台 / EXP-01 人机赛跑 / EXP-02 私人出题机 / EXP-02b AI 批改台 / EXP-03 批改验证台 / EXP-04 错题银行 / EXP-04b 我当出题人 / EXP-05 AI 的盲区 / TALK 判卡 / QUIZ / DIARY */
(function(){
const {$,$$,esc,clamp}=App;const K='l13';const L={};App.lessons[K]=L;
const MODE={api:'平台 AI 接口',claude:'Claude 大模型',gpt:'GPT 大模型'};
const srcOf=m=>!m||m==='offline'?'离线示例':(MODE[m]||m);
const A=s=>[...String(s??'')];
const clip=(s,n=300)=>A(String(s||'').trim()).slice(0,n).join('');
const cut=(s,n)=>{const a=A(s);return a.length>n?a.slice(0,n).join('')+'…':a.join('');};
const ri=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const pick=a=>a[Math.floor(Math.random()*a.length)];

/* ================= exact arithmetic: rationals {n,d} ================= */
const gcd=(a,b)=>{a=Math.abs(a);b=Math.abs(b);while(b){const t=a%b;a=b;b=t;}return a;};
const Q=(n,d=1)=>{if(!d||!isFinite(n)||!isFinite(d))return null;if(d<0){n=-n;d=-d;}const g=gcd(n,d)||1;return {n:n/g,d:d/g};};
const I=n=>Q(n,1);
const qa=(x,y)=>x&&y?Q(x.n*y.d+y.n*x.d,x.d*y.d):null, qs=(x,y)=>x&&y?Q(x.n*y.d-y.n*x.d,x.d*y.d):null;
const qm=(x,y)=>x&&y?Q(x.n*y.n,x.d*y.d):null, qd=(x,y)=>x&&y&&y.n?Q(x.n*y.d,x.d*y.n):null;
const qeq=(x,y)=>!!x&&!!y&&x.n===y.n&&x.d===y.d;
const dec=t=>{t=String(t);const neg=t[0]==='-';t=t.replace(/^-/,'');const [a,b='']=t.split('.');const p=Math.pow(10,b.length);return Q((neg?-1:1)*((+a||0)*p+(+b||0)),p);};
const term=d=>{while(d%2===0)d/=2;while(d%5===0)d/=5;return d===1;};
function fmtDec(x){const neg=x.n<0;const n=Math.abs(x.n);let k=0;while(Math.pow(10,k)%x.d!==0&&k<12)k++;let s=String(n*(Math.pow(10,k)/x.d));
 if(k){s=s.padStart(k+1,'0');s=(s.slice(0,-k)+'.'+s.slice(-k)).replace(/\.?0+$/,'');}return (neg?'-':'')+s;}
const fmtFrac=x=>x.d===1?String(x.n):`${x.n}/${x.d}`;
const fmtMixed=x=>{if(x.d===1||Math.abs(x.n)<x.d)return fmtFrac(x);const w=Math.trunc(x.n/x.d),r=Math.abs(x.n%x.d);return `${w}又${r}/${x.d}`;};
const fmtPct=x=>fmtDec(qm(x,I(100)))+'%';
const fmt=(x,pref)=>!x?'?':pref==='pct'?fmtPct(x):x.d===1?String(x.n):pref==='frac'?fmtFrac(x):term(x.d)?fmtDec(x):fmtFrac(x);
const D=fmtDec;/* display a decimal-valued rational */
const N=v=>typeof v==='number'?I(v):v;

/* student answers: integers, decimals, fractions, mixed numbers, percentages, "x = 19", trailing units */
function normTxt(s){return String(s??'').replace(/[０-９]/g,c=>String.fromCharCode(c.charCodeAt(0)-65248)).replace(/．/g,'.').replace(/／/g,'/').replace(/％/g,'%').replace(/[−－—]/g,'-').replace(/[，,]/g,'').trim();}
function parseAns(s){s=normTxt(s);if(!s)return null;if(/[=＝]/.test(s))s=s.split(/[=＝]/).pop().trim();s=s.replace(/^(答|约|是|得|为)[:：]?\s*/,'');let m;
 if((m=/^(-?\d+)\s*分之\s*(\d+)/.exec(s)))return +m[1]?{v:Q(+m[2],+m[1]),pct:false}:null;
 if((m=/^(-?\d+)\s*(?:又|\s)\s*(\d+)\s*\/\s*(\d+)/.exec(s))){const w=+m[1],n=+m[2],d=+m[3];if(!d)return null;return {v:Q((Math.abs(w)*d+n)*(s[0]==='-'?-1:1),d),pct:false};}
 if((m=/^(-?\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/.exec(s))){const v=qd(dec(m[1]),dec(m[2]));return v?{v,pct:false}:null;}
 if((m=/^(-?\d*\.?\d+)\s*%/.exec(s)))return {v:qd(dec(m[1]),I(100)),pct:true};
 if((m=/^(-?\d*\.?\d+)/.exec(s)))return {v:dec(m[1]),pct:false};
 return null;}
function check(input,P){const r=parseAns(input);if(!r)return {ok:false,bad:!!String(input||'').trim(),empty:!String(input||'').trim()};
 if(qeq(r.v,P.ans))return {ok:true,note:P.pct&&!r.pct?`写成 ${fmtPct(P.ans)} 更规范`:''};
 if(P.pct&&!r.pct&&qeq(qd(r.v,I(100)),P.ans))return {ok:true,note:'记得写上百分号 %'};
 return {ok:false,v:r.v};}
/* exact expression evaluator: + − × ÷ / ( ) on integers, decimals, fractions */
function evalExpr(src){let s=normTxt(src).replace(/[（]/g,'(').replace(/[）]/g,')').replace(/[×xX*＊·]/g,'*').replace(/[÷]/g,':').replace(/[＋]/g,'+').replace(/\s+/g,'');
 s=s.replace(/^(计算|算一算|脱式计算|简便计算|口算)[:：]?/,'').replace(/[=](\(\)|？|\?)?$/,'').replace(/[？?]$/,'');
 if(!/^[\d.+\-*/:()]+$/.test(s)||!/\d/.test(s)||!/[+\-*/:]/.test(s.replace(/^-/,'')))return null;let i=0;const pk=()=>s[i];
 /* a/b between two whole numbers is a fraction literal (binds tighter than × and ÷) */
 const num=()=>{const m=/^\d+(\.\d+)?/.exec(s.slice(i));if(!m)throw 0;i+=m[0].length;const f=!m[1]&&/^\/(\d+)(?![.\d])/.exec(s.slice(i));if(f){i+=f[0].length;const v=Q(+m[0],+f[1]);if(!v)throw 0;return v;}return dec(m[0]);};
 const fac=()=>{if(pk()==='-'){i++;const v=fac();return Q(-v.n,v.d);}if(pk()==='('){i++;const v=ex();if(s[i]!==')')throw 0;i++;return v;}return num();};
 const tm=()=>{let v=fac();while(pk()==='*'||pk()==='/'||pk()===':'){const o=s[i++];v=o==='*'?qm(v,fac()):qd(v,fac());if(!v)throw 0;}return v;};
 const ex=()=>{let v=tm();while(pk()==='+'||pk()==='-'){const o=s[i++];v=o==='+'?qa(v,tm()):qs(v,tm());}return v;};
 try{const v=ex();return i===s.length?v:null;}catch(e){return null;}}
/* exact linear-equation solver: one letter variable, e.g. 3x + 8 = 35, 4(x − 2) = 20, x ÷ 5 = 7 */
function solveLinear(src){let s=normTxt(src).replace(/[（]/g,'(').replace(/[）]/g,')').replace(/[×*·]/g,'*').replace(/[÷]/g,'/').replace(/\s+/g,'');
 const m=/([0-9a-z.+\-*/()]+)=([0-9a-z.+\-*/()]+)/i.exec(s);if(!m)return null;const vars=new Set((m[0].match(/[a-z]/gi)||[]));if(vars.size!==1)return null;const V=[...vars][0];
 const side=t=>{t=t.replace(/(\d|\))(?=[a-z(])/gi,'$1*').replace(/([a-z])(?=[\d(])/gi,'$1*');let i=0;const pk=()=>t[i];
  const add=(a,b,sg)=>({k:sg>0?qa(a.k,b.k):qs(a.k,b.k),c:sg>0?qa(a.c,b.c):qs(a.c,b.c)});
  const fac=()=>{if(pk()==='-'){i++;const v=fac();return {k:qm(v.k,I(-1)),c:qm(v.c,I(-1))};}if(pk()==='('){i++;const v=ex();if(t[i]!==')')throw 0;i++;return v;}
   if(pk()===V){i++;return {k:I(1),c:I(0)};}const mm=/^\d+(\.\d+)?/.exec(t.slice(i));if(!mm)throw 0;i+=mm[0].length;return {k:I(0),c:dec(mm[0])};};
  const tm=()=>{let v=fac();while(pk()==='*'||pk()==='/'){const o=t[i++];const w=fac();if(o==='*'){if(v.k.n&&w.k.n)throw 0;v=v.k.n?{k:qm(v.k,w.c),c:qm(v.c,w.c)}:{k:qm(w.k,v.c),c:qm(v.c,w.c)};}else{if(w.k.n||!w.c.n)throw 0;v={k:qd(v.k,w.c),c:qd(v.c,w.c)};}}return v;};
  const ex=()=>{let v=tm();while(pk()==='+'||pk()==='-'){const o=t[i++];v=add(v,tm(),o==='+'?1:-1);}return v;};
  const v=ex();if(i!==t.length)throw 0;return v;};
 try{const l=side(m[1]),r=side(m[2]);const k=qs(l.k,r.k),c=qs(r.c,l.c);if(!k||!k.n)return null;return qd(c,k);}catch(e){return null;}}
/* try to compute the answer of a question text with the platform's own exact tools */
function autoSolve(q){q=String(q||'');const t=normTxt(q).replace(/（\s*）|\(\s*\)/g,'');
 if(/[a-z]/i.test(t.replace(/[×xX](?=\s*\d)/g,'*'))&&/=/.test(t)){const v=solveLinear(t.replace(/^.*?[:：]/,''));if(v)return v;}
 const m=/[:：]\s*([\d.\s+\-×÷*/()（）]+)\s*(=|$)/.exec(t)||/^\s*([\d.\s+\-×÷*/()（）]+)\s*(=|$)/.exec(t);if(m){const v=evalExpr(m[1]);if(v)return v;}return null;}

/* ================= problem generators (人教版 4–6 年级) ================= */
const T1='拆解问题',T2='运用规则',T3='逐步求解',T4='检验';
const TAGC={[T1]:'t1',[T2]:'t2',[T3]:'t3',[T4]:'t4'};
const KP={mix:{n:'四则混合运算',g:[4,5,6],t:['calc','fill']},law:{n:'运算定律与简便计算',g:[4],t:['calc']},dec:{n:'小数的计算',g:[4,5],t:['calc','fill','word']},
 area:{n:'图形的面积',g:[4,5,6],t:['fill','word']},eq:{n:'简易方程',g:[5,6],t:['calc','fill','word']},frac:{n:'分数的计算',g:[5,6],t:['calc','fill','word']},vol:{n:'长方体和正方体',g:[5],t:['fill','word']},
 pct:{n:'百分数',g:[6],t:['fill','word']},oral:{n:'口算',g:[4,5,6],t:['calc'],hidden:1},share:{n:'分数与除法',g:[5,6],t:['word'],hidden:1},chick:{n:'鸡兔同笼',g:[4,5,6],t:['word']},travel:{n:'行程问题',g:[4,5,6],t:['word']},work:{n:'工程问题',g:[6],t:['word']},pattern:{n:'找规律',g:[4,5,6],t:['fill']}};
const TYPES={calc:'计算题',fill:'填空题',word:'应用题'};
const kpOf=g=>Object.keys(KP).filter(k=>!KP[k].hidden&&KP[k].g.includes(+g));
const mk=(kp,sub,g,type,q,ans,u,steps,o={})=>Object.assign({kp,sub,g:+g,type,q,ans,u:u||'',steps},o);
const G={};
G.mix=(g,type,o={})=>{const sub=o.sub||pick(['a+bc','(a+b)c','ab-cd','(a-b)/c']);const big=g>=5?1:0;let e,v,st;
 if(sub==='a+bc'){const a=ri(12,99)+big*ri(100,400),b=ri(12,40),c=ri(3,9+big*16),m=b*c;e=`${a} + ${b} × ${c}`;v=a+m;st=[[T1,'算式里有加法和乘法，没有括号。'],[T2,'没有括号时，先算乘除，后算加减。'],[T3,`${b} × ${c} = ${m}`],[T3,`${a} + ${m} = ${v}`]];}
 else if(sub==='(a+b)c'){const a=ri(11,60)+big*ri(20,100),b=ri(11,60),c=ri(3,9+big*16),s=a+b;e=`(${a} + ${b}) × ${c}`;v=s*c;st=[[T1,'算式里有括号。'],[T2,'有括号时，先算括号里面的。'],[T3,`${a} + ${b} = ${s}`],[T3,`${s} × ${c} = ${v}`]];}
 else if(sub==='ab-cd'){const a=ri(12,45),b=ri(3,9+big*10),m=a*b,d=ri(3,9),q=ri(5,Math.min(m-1,30+big*20)),c=d*q;e=`${a} × ${b} − ${c} ÷ ${d}`;v=m-q;st=[[T1,'算式里有乘法、除法和减法。'],[T2,'先算乘除，后算加减；乘法和除法可以同时算。'],[T3,`${a} × ${b} = ${m}，${c} ÷ ${d} = ${q}`],[T3,`${m} − ${q} = ${v}`]];}
 else{const c=ri(3,9+big*6),q=ri(6,40+big*30),b=ri(10,99),a=b+c*q;e=`(${a} − ${b}) ÷ ${c}`;v=q;st=[[T1,'算式里有括号和除法。'],[T2,'先算括号里面的减法，再算除法。'],[T3,`${a} − ${b} = ${a-b}`],[T3,`${a-b} ÷ ${c} = ${q}`]];}
 return mk('mix',sub,g,type,type==='fill'?`${e} = （　　）`:`计算：${e}`,I(v),'',st);};
G.law=(g,type,o={})=>{const sub=o.sub||pick(['25','125','99','dist']);let e,v,st;
 if(sub==='25'){const k=ri(3,24),b=4*k;e=`25 × ${b}`;v=25*b;st=[[T1,`${b} 可以拆成 4 × ${k}。`],[T2,'乘法结合律：先把 25 和 4 乘起来，凑成整百。'],[T3,`25 × ${b} = 25 × 4 × ${k} = 100 × ${k} = ${v}`]];}
 else if(sub==='125'){const k=ri(2,9),b=8*k;e=`125 × ${b}`;v=125*b;st=[[T1,`${b} 可以拆成 8 × ${k}。`],[T2,'乘法结合律：125 × 8 = 1000，凑成整千。'],[T3,`125 × ${b} = 125 × 8 × ${k} = 1000 × ${k} = ${v}`]];}
 else if(sub==='99'){const a=ri(12,89);e=`${a} × 99`;v=a*99;st=[[T1,'99 接近 100，可以看成 100 − 1。'],[T2,'乘法分配律：a × (100 − 1) = a × 100 − a × 1。'],[T3,`${a} × 99 = ${a} × 100 − ${a} = ${a*100} − ${a} = ${v}`]];}
 else{const a=ri(12,99),b=ri(11,89),c=100-b;e=`${a} × ${b} + ${a} × ${c}`;v=a*100;st=[[T1,`两个乘法都有相同的因数 ${a}，而 ${b} + ${c} = 100。`],[T2,'乘法分配律：a × b + a × c = a × (b + c)。'],[T3,`${a} × (${b} + ${c}) = ${a} × 100 = ${v}`]];}
 return mk('law',sub,g,'calc',`简便计算：${e}`,I(v),'',st);};
G.dec=(g,type,o={})=>{const sub=o.sub||(g>=5?pick(['mul','div','add']):pick(['add','sub']));let x,y,v,e,q,u='',st;
 if(sub==='add'||sub==='sub'){x=dec(ri(105,999)/100+'');y=dec(ri(11,99)/10+'');if(sub==='sub'&&x.n/x.d<=y.n/y.d)x=qa(x,I(10));v=sub==='add'?qa(x,y):qs(x,y);e=`${D(x)} ${sub==='add'?'+':'−'} ${D(y)}`;
  st=[[T1,sub==='add'?'求两个小数的和，用加法。':'求还剩多少，用减法。'],[T2,'小数加减法：小数点对齐（也就是相同数位对齐），再从最低位算起。'],[T3,`${e} = ${D(v)}`]];
  if(type==='word'){q=sub==='add'?`妈妈买水果，苹果用了 ${D(x)} 元，香蕉用了 ${D(y)} 元，一共用了多少元？`:`一根绳子长 ${D(x)} 米，用去 ${D(y)} 米，还剩多少米？`;u=sub==='add'?'元':'米';}}
 else if(sub==='mul'){x=dec(ri(12,96)/10+'');y=pick([I(ri(3,9)),dec(ri(12,49)/10+'')]);v=qm(x,y);e=`${D(x)} × ${D(y)}`;const k=(D(x).split('.')[1]||'').length+(D(y).split('.')[1]||'').length;
  st=[[T1,'小数乘法。'],[T2,'先按整数乘法算，再看因数中一共有几位小数，就从积的右边起数出几位，点上小数点。'],[T3,`${D(x).replace('.','')} × ${D(y).replace('.','')} = ${(+D(x).replace('.',''))*(+D(y).replace('.',''))}，因数中一共有 ${k} 位小数，所以积是 ${D(v)}`]];
  if(type==='word'){q=`每千克苹果 ${D(x)} 元，买 ${D(y)} 千克要多少元？`;u='元';}}
 else{const b=ri(2,9);v=dec(ri(11,99)/10+'');x=qm(v,I(b));y=I(b);e=`${D(x)} ÷ ${b}`;st=[[T1,'小数除以整数。'],[T2,'按整数除法的方法除，商的小数点要和被除数的小数点对齐。'],[T3,`${e} = ${D(v)}`],[T4,`验算：${D(v)} × ${b} = ${D(x)}`]];
  if(type==='word'){q=`${D(x)} 元买了 ${b} 支同样的笔，每支多少元？`;u='元';}}
 if(!q)q=type==='fill'?`${e} = （　　）`:`计算：${e}`;return mk('dec',sub,g,type==='word'?'word':type,q,v,u,st);};
G.area=(g,type,o={})=>{const sub=o.sub||(g===4?pick(['rect','square']):g===5?pick(['para','tri','trap']):pick(['circle','circ']));const W=type==='word';const u=W?'平方米':'平方厘米',l=W?'米':'厘米';let q,v,st;
 if(sub==='rect'){const a=ri(6,30),b=ri(3,a-1);v=I(a*b);q=W?`一块长方形菜地长 ${a} 米、宽 ${b} 米，它的面积是多少平方米？`:`一个长方形长 ${a} 厘米、宽 ${b} 厘米，面积是（　　）平方厘米。`;st=[[T1,'已知长和宽，求长方形的面积。'],[T2,'长方形的面积 = 长 × 宽'],[T3,`${a} × ${b} = ${a*b}（${u}）`]];}
 else if(sub==='square'){const a=ri(4,25);v=I(a*a);q=W?`一个正方形花坛的边长是 ${a} 米，它的面积是多少平方米？`:`一个正方形的边长是 ${a} 厘米，面积是（　　）平方厘米。`;st=[[T1,'已知边长，求正方形的面积。'],[T2,'正方形的面积 = 边长 × 边长'],[T3,`${a} × ${a} = ${a*a}（${u}）`]];}
 else if(sub==='para'){const a=ri(6,30),h=ri(4,20);v=I(a*h);q=W?`一块平行四边形的地，底是 ${a} 米，高是 ${h} 米，面积是多少平方米？`:`一个平行四边形的底是 ${a} 厘米，高是 ${h} 厘米，面积是（　　）平方厘米。`;st=[[T1,'已知底和高，求平行四边形的面积。'],[T2,'平行四边形的面积 = 底 × 高'],[T3,`${a} × ${h} = ${a*h}（${u}）`]];}
 else if(sub==='tri'){let a=ri(6,30),h=ri(4,20);if(a*h%2)a++;v=I(a*h/2);q=W?`一块三角形的草地，底是 ${a} 米，高是 ${h} 米，面积是多少平方米？`:`一个三角形的底是 ${a} 厘米，高是 ${h} 厘米，面积是（　　）平方厘米。`;st=[[T1,'已知底和高，求三角形的面积。'],[T2,'三角形的面积 = 底 × 高 ÷ 2（两个完全一样的三角形能拼成一个平行四边形）'],[T3,`${a} × ${h} = ${a*h}`],[T3,`${a*h} ÷ 2 = ${a*h/2}（${u}）`]];}
 else if(sub==='trap'){const a=ri(3,15),b=a+ri(2,12);let h=ri(4,16);if((a+b)*h%2)h++;v=I((a+b)*h/2);q=W?`一块梯形菜地，上底 ${a} 米，下底 ${b} 米，高 ${h} 米，面积是多少平方米？`:`一个梯形的上底是 ${a} 厘米，下底是 ${b} 厘米，高是 ${h} 厘米，面积是（　　）平方厘米。`;
  st=[[T1,'已知上底、下底和高，求梯形的面积。'],[T2,'梯形的面积 =（上底 + 下底）× 高 ÷ 2'],[T3,`${a} + ${b} = ${a+b}`],[T3,`${a+b} × ${h} = ${(a+b)*h}`],[T3,`${(a+b)*h} ÷ 2 = ${(a+b)*h/2}（${u}）`]];}
 else if(sub==='circle'){const r=ri(2,10);v=qm(dec('3.14'),I(r*r));q=W?`一个圆形花坛的半径是 ${r} 米，它的面积是多少平方米？（π 取 3.14）`:`一个圆的半径是 ${r} 厘米，面积是（　　）平方厘米。（π 取 3.14）`;st=[[T1,'已知半径，求圆的面积。'],[T2,'圆的面积 = π × 半径 × 半径'],[T3,`${r} × ${r} = ${r*r}`],[T3,`3.14 × ${r*r} = ${D(v)}（${u}）`]];}
 else{const d=ri(2,20);v=qm(dec('3.14'),I(d));q=W?`一个圆形水池的直径是 ${d} 米，绕水池走一圈是多少米？（π 取 3.14）`:`一个圆的直径是 ${d} 厘米，周长是（　　）厘米。（π 取 3.14）`;st=[[T1,'绕一圈的长度就是圆的周长；已知直径。'],[T2,'圆的周长 = π × 直径'],[T3,`3.14 × ${d} = ${D(v)}（${l}）`]];return mk('area',sub,g,type,q,v,l,st);}
 return mk('area',sub,g,type,q,v,u,st);};
G.eq=(g,type,o={})=>{const sub=o.sub||pick(['x+a','x-a','ax','ax+b']);const x=ri(3,40);let e,q,u='',st;
 if(sub==='x+a'){const a=ri(8,60);e=`x + ${a} = ${x+a}`;st=[[T1,'求 x，就是求一个加数。'],[T2,'等式的性质：等式两边同时减去同一个数，等式仍然成立。'],[T3,`x + ${a} − ${a} = ${x+a} − ${a}`],[T3,`x = ${x}`],[T4,`检验：${x} + ${a} = ${x+a}，左边 = 右边`]];
  if(type==='word'){q=`小明有一些邮票，又买来 ${a} 枚，现在有 ${x+a} 枚。他原来有多少枚邮票？（列方程解答）`;u='枚';}}
 else if(sub==='x-a'){const a=ri(8,60);e=`x − ${a} = ${x}`;const X=x+a;st=[[T1,'求 x，就是求被减数。'],[T2,'等式的性质：等式两边同时加上同一个数，等式仍然成立。'],[T3,`x − ${a} + ${a} = ${x} + ${a}`],[T3,`x = ${X}`],[T4,`检验：${X} − ${a} = ${x}，左边 = 右边`]];
  if(type==='word'){q=`一桶水用去 ${a} 升后还剩 ${x} 升。这桶水原来有多少升？（列方程解答）`;u='升';}return mk('eq',sub,g,type,q||(type==='fill'?`如果 ${e}，那么 x = （　　）`:`解方程：${e}`),I(X),u,st);}
 else if(sub==='ax'){const a=ri(3,9);e=`${a}x = ${a*x}`;st=[[T1,`${a}x 表示 ${a} 乘 x。`],[T2,'等式的性质：等式两边同时除以同一个不为 0 的数，等式仍然成立。'],[T3,`${a}x ÷ ${a} = ${a*x} ÷ ${a}`],[T3,`x = ${x}`],[T4,`检验：${a} × ${x} = ${a*x}，左边 = 右边`]];
  if(type==='word'){q=`${a} 个同样的书包一共 ${a*x} 元，每个书包多少元？（列方程解答）`;u='元';}}
 else{const a=ri(2,6),b=ri(2,15);e=`${a}x + ${b} = ${a*x+b}`;st=[[T1,`先把 ${a}x 看成一个整体。`],[T2,'等式的性质：两边同时减去同一个数，再同时除以同一个不为 0 的数，等式仍然成立。'],[T3,`${a}x = ${a*x+b} − ${b} = ${a*x}`],[T3,`x = ${a*x} ÷ ${a} = ${x}`],[T4,`检验：${a} × ${x} + ${b} = ${a*x+b}，左边 = 右边`]];
  if(type==='word'){q=`${a} 本同样的笔记本和 1 支 ${b} 元的钢笔，一共 ${a*x+b} 元。每本笔记本多少元？（列方程解答）`;u='元';}}
 return mk('eq',sub,g,type,q||(type==='fill'?`如果 ${e}，那么 x = （　　）`:`解方程：${e}`),I(x),u,st);};
const DEN=[2,3,4,5,6,8,9,10,12];
const rf=()=>{const d=pick(DEN);let n=ri(1,d-1);while(gcd(n,d)!==1)n=ri(1,d-1);return Q(n,d);};
G.frac=(g,type,o={})=>{const sub=o.sub||(g>=6?pick(['mul','div','nmul']):pick(['add','sub']));let x=rf(),y=rf(),v,e,q,u='',st;
 if(sub==='add'||sub==='sub'){let n=0;while((x.d===y.d||(sub==='sub'&&x.n/x.d<=y.n/y.d)||(sub==='add'&&x.n/x.d+y.n/y.d>=(type==='word'?1:2)))&&n++<200){x=rf();y=rf();}if(sub==='sub'&&x.n/x.d<=y.n/y.d){const t=x;x=y;y=t;}
  v=sub==='add'?qa(x,y):qs(x,y);const l=x.d*y.d/gcd(x.d,y.d);const xn=x.n*l/x.d,yn=y.n*l/y.d,r=sub==='add'?xn+yn:xn-yn;const op=sub==='add'?'+':'−';e=`${fmtFrac(x)} ${op} ${fmtFrac(y)}`;
  st=[[T1,'两个分数的分母不同。'],[T2,'异分母分数相加减：先通分，化成同分母分数再加减；结果能约分的要约分。'],[T3,`${e} = ${xn}/${l} ${op} ${yn}/${l} = ${r}/${l}`]];if(r/l!==v.n/v.d||v.d!==l)st.push([T3,`约分：${r}/${l} = ${fmtFrac(v)}`]);
  if(type==='word'){q=sub==='add'?`修一条路，第一天修了全长的 ${fmtFrac(x)}，第二天修了全长的 ${fmtFrac(y)}，两天一共修了全长的几分之几？`:`一根绳子长 ${fmtFrac(x)} 米，剪去 ${fmtFrac(y)} 米，还剩多少米？`;u=sub==='add'?'':'米';}}
 else if(sub==='mul'){v=qm(x,y);e=`${fmtFrac(x)} × ${fmtFrac(y)}`;st=[[T1,'分数乘分数。'],[T2,'分数乘分数：用分子相乘的积作分子，分母相乘的积作分母；能约分的先约分。'],[T3,`${e} = ${x.n*y.n}/${x.d*y.d}`]];if(v.d!==x.d*y.d)st.push([T3,`约分：${x.n*y.n}/${x.d*y.d} = ${fmtFrac(v)}`]);}
 else if(sub==='div'){v=qd(x,y);e=`${fmtFrac(x)} ÷ ${fmtFrac(y)}`;st=[[T1,'分数除以分数。'],[T2,'除以一个不等于 0 的数，等于乘这个数的倒数。'],[T3,`${e} = ${fmtFrac(x)} × ${y.d}/${y.n} = ${x.n*y.d}/${x.d*y.n}`]];if(v.d!==x.d*y.n)st.push([T3,`化简：${x.n*y.d}/${x.d*y.n} = ${fmtFrac(v)}`]);}
 else{const W=x.d*ri(2,12);v=qm(I(W),x);e=`${W} × ${fmtFrac(x)}`;st=[[T1,`求 ${W} 的 ${fmtFrac(x)} 是多少，用乘法。`],[T2,'整数乘分数：先用整数和分母约分，再相乘。'],[T3,`${W} × ${fmtFrac(x)} = ${W/x.d} × ${x.n} = ${fmtFrac(v)}`]];
  if(type==='word'){q=`一桶油重 ${W} 千克，用去了 ${fmtFrac(x)}，用去了多少千克？`;u='千克';}}
 if(type==='word'&&!q){if(g>=6){return G.frac(g,type,{sub:'nmul'});}return G.frac(g,type,{sub:pick(['add','sub'])});}
 return mk('frac',sub,g,type,q||(type==='fill'?`${e} = （　　）`:`计算：${e}`),v,u,st,{pref:'frac'});};
G.vol=(g,type,o={})=>{const sub=o.sub||pick(['cub','cube','sa']);const W=type==='word';let q,v,u,st;
 if(sub==='cub'){const a=ri(4,15),b=ri(3,10),c=ri(2,9);v=I(a*b*c);u=W?'立方分米':'立方厘米';q=W?`一个长方体鱼缸，长 ${a} 分米、宽 ${b} 分米、高 ${c} 分米，它的体积是多少立方分米？`:`一个长方体长 ${a} 厘米、宽 ${b} 厘米、高 ${c} 厘米，体积是（　　）立方厘米。`;st=[[T1,'已知长、宽、高，求长方体的体积。'],[T2,'长方体的体积 = 长 × 宽 × 高'],[T3,`${a} × ${b} × ${c} = ${a*b*c}（${u}）`]];}
 else if(sub==='cube'){const a=ri(2,12);v=I(a*a*a);u=W?'立方分米':'立方厘米';q=W?`一个正方体木箱的棱长是 ${a} 分米，它的体积是多少立方分米？`:`一个正方体的棱长是 ${a} 厘米，体积是（　　）立方厘米。`;st=[[T1,'已知棱长，求正方体的体积。'],[T2,'正方体的体积 = 棱长 × 棱长 × 棱长'],[T3,`${a} × ${a} × ${a} = ${a*a*a}（${u}）`]];}
 else{const a=ri(4,12),b=ri(3,10),c=ri(2,8);const s=2*(a*b+a*c+b*c);v=I(s);u='平方厘米';q=W?`做一个长 ${a} 厘米、宽 ${b} 厘米、高 ${c} 厘米的长方体纸盒（六个面都要），至少需要多少平方厘米的纸板？`:`一个长方体长 ${a} 厘米、宽 ${b} 厘米、高 ${c} 厘米，表面积是（　　）平方厘米。`;
  st=[[T1,'长方体有 6 个面，相对的两个面完全一样。'],[T2,'长方体的表面积 =（长 × 宽 + 长 × 高 + 宽 × 高）× 2'],[T3,`${a} × ${b} + ${a} × ${c} + ${b} × ${c} = ${a*b} + ${a*c} + ${b*c} = ${a*b+a*c+b*c}`],[T3,`${a*b+a*c+b*c} × 2 = ${s}（平方厘米）`]];}
 return mk('vol',sub,g,type,q,v,u,st);};
G.pct=(g,type,o={})=>{const sub=o.sub||(type==='fill'?pick(['of','disc']):pick(['disc','part','inc']));let q,v,u='',st,pct=false;
 if(sub==='of'){const p=pick([10,20,25,30,40,50,60,75]);const n=pick([20,40,60,80,120,200,240]);v=Q(n*p,100);q=`${n} 的 ${p}% 是（　　）。`;st=[[T1,`求 ${n} 的 ${p}% 是多少。`],[T2,'求一个数的百分之几是多少，用乘法。'],[T3,`${n} × ${p}% = ${n} × ${p}/100 = ${fmt(v)}`]];}
 else if(sub==='disc'){const P=ri(4,30)*10,k=pick([6,7,8,9]);v=Q(P*k,10);u='元';q=type==='fill'?`一件原价 ${P} 元的衣服打 ${k} 折出售，现价是（　　）元。`:`一件衣服原价 ${P} 元，现在打 ${k} 折出售，现价多少元？`;st=[[T1,`打 ${k} 折，就是按原价的 ${k*10}% 出售。`],[T2,'现价 = 原价 × 折扣'],[T3,`${P} × ${k*10}% = ${fmt(v)}（元）`]];}
 else if(sub==='part'){const p=pick([20,25,40,45,48,52,55,60]);const n=pick([20,40,50,60,100].filter(n=>n*p%100===0));v=Q(n*p,100);u='人';q=`某班有 ${n} 名学生，其中女生占 ${p}%。女生有多少人？`;st=[[T1,`女生占全班的 ${p}%，求女生人数。`],[T2,'求一个数的百分之几是多少，用乘法。'],[T3,`${n} × ${p}% = ${fmt(v)}（人）`]];}
 else{const [a,p]=pick([[20,25],[40,15],[50,20],[80,25],[100,30],[200,15],[250,40],[40,75],[60,50],[80,5]]);const b=a+a*p/100;v=Q(p,100);pct=true;q=`学校图书角原有图书 ${a} 本，现在有 ${b} 本，增加了百分之几？`;st=[[T1,`先求增加了多少本，再求它占原有本数的百分之几。`],[T2,'增加了百分之几 = 增加的数量 ÷ 原来的数量'],[T3,`${b} − ${a} = ${b-a}（本）`],[T3,`${b-a} ÷ ${a} = ${D(Q(p,100))} = ${p}%`]];}
 return mk('pct',sub,g,type==='fill'&&sub!=='of'&&sub!=='disc'?'word':type,q,v,u,st,{pct,pref:pct?'pct':''});};
G.chick=(g,type,o={})=>{const sub=o.sub||pick(['rab','chk']);const H=ri(6,g>=5?35:16),r=ri(1,H-1),c=H-r,F=2*H+2*r;const ask=sub==='rab'?'兔':'鸡';
 const q=`笼子里有若干只鸡和兔。从上面数，有 ${H} 个头；从下面数，有 ${F} 只脚。${ask}有多少只？`;
 const st=[[T1,'已知鸡和兔的总头数和总脚数，求其中一种的只数。'],[T2,'假设法：假设全是鸡，每只兔就少算了 4 − 2 = 2 只脚。'],[T3,`假设 ${H} 只全是鸡：${H} × 2 = ${2*H}（只脚）`],[T3,`比实际少了 ${F} − ${2*H} = ${F-2*H}（只脚）`],[T3,`兔：${F-2*H} ÷ 2 = ${r}（只）`]];
 if(sub==='chk')st.push([T3,`鸡：${H} − ${r} = ${c}（只）`]);st.push([T4,`检验：${c} × 2 + ${r} × 4 = ${F}`]);return mk('chick',sub,g,'word',q,I(sub==='rab'?r:c),'只',st);};
G.travel=(g,type,o={})=>{const sub=o.sub||(g>=5?pick(['meet','chase']):pick(['meet','svt']));let q,v,u,st;
 if(sub==='svt'){const vv=ri(4,9)*10,t=ri(2,8);v=I(vv*t);u='千米';q=`一辆汽车每小时行驶 ${vv} 千米，照这样的速度，${t} 小时行驶多少千米？`;st=[[T1,'已知速度和时间，求路程。'],[T2,'路程 = 速度 × 时间'],[T3,`${vv} × ${t} = ${vv*t}（千米）`]];}
 else if(sub==='meet'){const v1=ri(4,9)*10,v2=ri(3,8)*10,t=ri(2,6);const d=(v1+v2)*t;v=I(t);u='小时';q=`甲、乙两地相距 ${d} 千米。两辆汽车同时从两地出发，相对开出，一辆每小时行 ${v1} 千米，另一辆每小时行 ${v2} 千米。经过几小时两车相遇？`;
  st=[[T1,'两车同时出发、相对而行，相遇时两车一共行完全程。'],[T2,'相遇时间 = 路程 ÷ 速度和'],[T3,`速度和：${v1} + ${v2} = ${v1+v2}（千米/时）`],[T3,`${d} ÷ ${v1+v2} = ${t}（小时）`]];}
 else{const v2=ri(3,6)*10,v1=v2+ri(1,3)*10,t=ri(2,6);const d=(v1-v2)*t;v=I(t);u='小时';q=`一辆货车先出发，开出 ${d} 千米后，一辆客车从同一地点沿同一方向追赶。货车每小时行 ${v2} 千米，客车每小时行 ${v1} 千米。客车几小时能追上货车？`;
  st=[[T1,'客车每小时比货车多行一段，追上时正好补上相差的路程。'],[T2,'追及时间 = 相差的路程 ÷ 速度差'],[T3,`速度差：${v1} − ${v2} = ${v1-v2}（千米/时）`],[T3,`${d} ÷ ${v1-v2} = ${t}（小时）`]];}
 return mk('travel',sub,g,'word',q,v,u,st);};
G.work=(g,type,o={})=>{const [a,b,t]=pick([[3,6,2],[4,12,3],[6,12,4],[10,15,6],[12,24,8],[20,30,12],[6,30,5],[10,40,8],[15,30,10],[12,36,9]]);
 const q=`一项工程，甲队单独做 ${a} 天完成，乙队单独做 ${b} 天完成。两队合作，几天能完成？`;const s=qa(Q(1,a),Q(1,b));
 const st=[[T1,'不知道工程总量是多少，可以把它看作单位“1”。'],[T2,'工作效率 = 1 ÷ 单独完成的天数；合作时间 = 工作总量 ÷ 工作效率和'],[T3,`甲每天做 1/${a}，乙每天做 1/${b}`],[T3,`效率和：1/${a} + 1/${b} = ${fmtFrac(s)}`],[T3,`1 ÷ ${fmtFrac(s)} = ${t}（天）`]];
 return mk('work','w',g,'word',q,I(t),'天',st);};
G.pattern=(g,type,o={})=>{const sub=o.sub||pick(['tri','sq','seq']);let q,v,u='',st;const n=ri(8,g>=5?60:30);
 if(sub==='tri'){v=I(2*n+1);u='根';q=`用小棒摆三角形（一个挨着一个排成一排）：摆 1 个要 3 根，摆 2 个要 5 根，摆 3 个要 7 根……照这样摆 ${n} 个三角形，要（　　）根小棒。`;st=[[T1,'看每多摆 1 个三角形，小棒增加几根。'],[T2,'规律：第 1 个用 3 根，以后每多 1 个多用 2 根，摆 n 个要 3 + 2 ×（n − 1）= 2n + 1 根。'],[T3,`2 × ${n} + 1 = ${2*n+1}（根）`]];}
 else if(sub==='sq'){v=I(3*n+1);u='根';q=`用小棒摆正方形（一个挨着一个排成一排）：摆 1 个要 4 根，摆 2 个要 7 根，摆 3 个要 10 根……照这样摆 ${n} 个正方形，要（　　）根小棒。`;st=[[T1,'看每多摆 1 个正方形，小棒增加几根。'],[T2,'规律：第 1 个用 4 根，以后每多 1 个多用 3 根，摆 n 个要 4 + 3 ×（n − 1）= 3n + 1 根。'],[T3,`3 × ${n} + 1 = ${3*n+1}（根）`]];}
 else{const a=ri(1,9),d=ri(2,7);v=I(a+(n-1)*d);q=`一列数：${a}，${a+d}，${a+2*d}，${a+3*d}，……按这个规律，第 ${n} 个数是（　　）。`;st=[[T1,'看相邻两个数相差多少。'],[T2,`规律：每个数都比前一个多 ${d}，第 n 个数 = ${a} + ${d} ×（n − 1）。`],[T3,`${a} + ${d} × ${n-1} = ${a+(n-1)*d}`]];}
 return mk('pattern',sub,g,'fill',q,v,u,st);};
G.oral=(g,type,o={})=>{const sub=o.sub||pick(g===4?['add','sub','mul','div']:['add','mul','div','dec']);let e,v;
 if(sub==='add'){const a=ri(12,89),b=ri(12,89);e=`${a} + ${b}`;v=I(a+b);}
 else if(sub==='sub'){const a=ri(40,150),b=ri(11,a-5);e=`${a} − ${b}`;v=I(a-b);}
 else if(sub==='mul'){const a=ri(11,29),b=ri(3,9);e=`${a} × ${b}`;v=I(a*b);}
 else if(sub==='div'){const b=ri(3,9),q=ri(11,35);e=`${b*q} ÷ ${b}`;v=I(q);}
 else{const a=dec(ri(11,89)/10+''),b=dec(ri(11,89)/10+'');e=`${D(a)} + ${D(b)}`;v=qa(a,b);}
 return mk('oral',sub,g,'calc',`口算：${e}`,v,'',[[T2,sub==='div'?'想乘法算除法。':sub==='dec'?'小数点对齐再相加。':'先算整十数，再算零头。'],[T3,`${e} = ${D(v)}`]],{e});};
G.share=(g,type,o={})=>{let a=ri(1,8),b=ri(a+1,12);while(gcd(a,b)!==1){a=ri(1,8);b=ri(a+1,12);}const v=Q(a,b);
 return mk('share','s',g,'word',`把 ${a} 千克糖平均分给 ${b} 个小朋友，每人分得多少千克？（用分数表示）`,v,'千克',[[T1,`把 ${a} 千克平均分成 ${b} 份，求一份是多少，用除法。`],[T2,'分数与除法的关系：被除数 ÷ 除数 = 除数分之被除数。'],[T3,`${a} ÷ ${b} = ${a}/${b}（千克）`]],{pref:'frac'});};
function genP(kp,g,type,o){const k=KP[kp]?kp:'mix';const t=KP[k].t.includes(type)?type:KP[k].t[0];const p=G[k](+g||5,t,o||{});p.show=fmt(p.ans,p.pref);return p;}
const showOf=P=>P.show||fmt(P.ans,P.pref);

/* ================= fixed problems for the race (EXP-01) ================= */
const RACE=[
 {id:'p1',kind:'计算题',q:'计算：(125 + 75) × 8 − 600 ÷ 4',ans:I(1450),u:'',kp:'mix',sub:'(a+b)c',
  steps:[[T1,'算式里有括号、乘法、除法和减法。'],[T2,'先算括号里面的；再算乘除；最后算减法。'],[T3,'125 + 75 = 200'],[T3,'200 × 8 = 1600，600 ÷ 4 = 150'],[T3,'1600 − 150 = 1450']]},
 {id:'p2',kind:'方程',q:'x 的 3 倍再加上 8 等于 35，x 是多少？',ans:I(9),u:'',kp:'eq',sub:'ax+b',
  steps:[[T1,'把文字翻译成方程：3x + 8 = 35。'],[T2,'等式的性质：两边同时减去 8，再同时除以 3，等式仍然成立。'],[T3,'3x = 35 − 8 = 27'],[T3,'x = 27 ÷ 3 = 9'],[T4,'检验：3 × 9 + 8 = 35 ✓']]},
 {id:'p3',kind:'应用题',q:'笼子里有若干只鸡和兔。从上面数，有 8 个头；从下面数，有 26 只脚。兔有多少只？',ans:I(5),u:'只',kp:'chick',sub:'rab',
  steps:[[T1,'已知总头数 8、总脚数 26，求兔的只数。'],[T2,'假设法：假设全是鸡，每只兔少算了 2 只脚。'],[T3,'8 × 2 = 16（只脚）'],[T3,'26 − 16 = 10（只脚）'],[T3,'10 ÷ 2 = 5（只），兔有 5 只'],[T4,'检验：鸡 3 只、兔 5 只，3 × 2 + 5 × 4 = 26 ✓']]},
 {id:'p4',kind:'几何',q:'一块梯形菜地，上底 12 米，下底 18 米，高 15 米。它的面积是多少平方米？',ans:I(225),u:'平方米',kp:'area',sub:'trap',
  steps:[[T1,'已知上底、下底和高，求梯形的面积。'],[T2,'梯形的面积 =（上底 + 下底）× 高 ÷ 2'],[T3,'12 + 18 = 30'],[T3,'30 × 15 = 450'],[T3,'450 ÷ 2 = 225（平方米）']],
  bad:{steps:[[T1,'已知上底、下底和高，求梯形的面积。'],[T2,'梯形的面积 =（上底 + 下底）× 高'],[T3,'12 + 18 = 30'],[T3,'30 × 15 = 450（平方米）']],ans:I(450),err:1,why:'第 2 步用错了公式：梯形面积要“÷ 2”（两个一样的梯形才拼成一个平行四边形）。后面每一步都算对了，结果却是正确答案的 2 倍。'}}];

/* ================= verification cases (EXP-03) ================= */
const CASES={
 A:{t:'方程题：AI 判我错了',q:'如果 b = a + 20，当 b = 39 时，a 等于多少？',ans:I(19),u:'',hint:'在框里写 a 的值',
  ai:my=>qeq(my,I(59))?{ok:true,txt:'✓ 正确。b = a + 20，b = 39，所以 a = 39 + 20 = 59。'}:{ok:false,txt:'✗ 错误。b = a + 20，把 b = 39 代入：a = 39 + 20 = 59。正确答案是 59。'},aiAns:I(59),
  why:'AI 在“运用规则”这一步把逆运算弄反了：已知 a + 20 = 39，求 a 要用减法（39 − 20 = 19），它却用了加法。',kind:'sub'},
 B:{t:'分数题：答案的样子不同',q:'把 3 千克糖平均分给 4 个小朋友，每人分得多少千克？（用分数表示）',ans:Q(3,4),u:'千克',hint:'用分数作答，例如 2/5',
  ai:(my,raw)=>{const r=parseAns(raw);const isDec=r&&!/\//.test(normTxt(raw))&&!/分之/.test(raw);return isDec&&qeq(my,Q(3,4))?{ok:true,txt:'✓ 正确，每人 0.75 千克。'}:{ok:false,txt:'✗ 错误。3 ÷ 4 = 0.75，正确答案是 0.75 千克。'};},aiAns:dec('0.75'),
  why:'AI 只比对了答案的“写法”，没有比较数值：3/4 和 0.75 大小相等。题目还要求用分数表示，3/4 才是更符合要求的答案。',kind:'eq'}};

/* ================= AI limits (EXP-05): labelled examples ================= */
/* cube net: roll a die across the net and read which squares end up on opposite faces */
const NET=[[0,0],[1,0],[1,1],[2,1],[2,2],[3,2]];/* staircase net, labels 1..6 */
function foldNet(cells){let st={B:'B',T:'T',N:'N',S:'S',E:'E',W:'W'};const lab={};const key=(x,y)=>x+','+y;const idx={};cells.forEach((c,i)=>idx[key(c[0],c[1])]=i);
 const seen=new Set([0]);lab[0]=st.B;const qq=[[0,st]];
 const roll={E:s=>({B:s.E,T:s.W,E:s.T,W:s.B,N:s.N,S:s.S}),W:s=>({B:s.W,T:s.E,W:s.T,E:s.B,N:s.N,S:s.S}),S:s=>({B:s.S,T:s.N,S:s.T,N:s.B,E:s.E,W:s.W}),N:s=>({B:s.N,T:s.S,N:s.T,S:s.B,E:s.E,W:s.W})};
 while(qq.length){const [i,s]=qq.shift();const [x,y]=cells[i];[['E',1,0],['W',-1,0],['S',0,1],['N',0,-1]].forEach(([d,dx,dy])=>{const j=idx[key(x+dx,y+dy)];if(j==null||seen.has(j))return;seen.add(j);const ns=roll[d](s);lab[j]=ns.B;qq.push([j,ns]);});}
 const opp={B:'T',T:'B',N:'S',S:'N',E:'W',W:'E'};const out={};cells.forEach((c,i)=>{const o=cells.findIndex((_,j)=>lab[j]===opp[lab[i]]);out[i+1]=o+1;});return out;}
const OPP=foldNet(NET);
const count1=()=>{let c=0;for(let i=1;i<=100;i++)c+=(String(i).match(/1/g)||[]).length;return c;};
const rectAreas=P=>{const out=[];for(let a=1;a<P/2;a++){const b=P/2-a;if(b>=a&&Number.isInteger(b))out.push([a,b,a*b]);}return out;};
const LIM=[
 {id:'amb',cat:'有歧义：能读出两种意思',q:'一个数比 10 多 3 倍，这个数是多少？',ask:'这道题只有一种理解吗？',opts:['只有一种理解','可以有两种理解'],a:1,
  ai:'这个数是 10 × 3 = 30。',err:'它没有发现题目有两种理解，直接选了其中一种，也没有提醒你。',
  ev:()=>`<p>理解一：“比 10 多 3 倍”= 比 10 多出 10 的 3 倍 → 10 + 10 × 3 = <b>${10+10*3}</b></p><p>理解二：“是 10 的 3 倍”→ 10 × 3 = <b>${10*3}</b></p><p class="note">两种理解算出不同答案。数学书里会避免这种说法，常写成“比 10 多 30”或“是 10 的 3 倍”。</p>`},
 {id:'gap',cat:'条件不够：答案不唯一',q:'一个长方形的周长是 20 厘米，它的面积是多少平方厘米？',ask:'能求出唯一的面积吗？',opts:['能，面积是 25 平方厘米','不能，条件不够'],a:1,
  ai:'周长 20 厘米，边长 20 ÷ 4 = 5（厘米），面积 5 × 5 = 25（平方厘米）。',err:'它悄悄假设这是一个正方形，可题目只说了“长方形”，长和宽并不确定。',
  ev:()=>`<p>平台列出长、宽都是整厘米的所有情况（长 + 宽 = 10）：</p><table class="l13-tb"><tr><th>长</th><th>宽</th><th>面积</th></tr>${rectAreas(20).map(([a,b,s])=>`<tr><td>${b}</td><td>${a}</td><td>${s}</td></tr>`).join('')}</table><p class="note">面积可以是 ${rectAreas(20).map(r=>r[2]).join('、')}……（长和宽不是整数时还有更多），所以条件不够，求不出唯一答案。</p>`},
 {id:'cube',cat:'需要空间想象',q:'下面的展开图折成正方体后，和“1”相对的面是几？',ask:'和 1 相对的是几？',opts:['2','3','4','5','6'],a:OPP[1]-2,
  ai:'“1”和“3”中间隔着“2”，所以和 1 相对的面是 3。',err:'它套用了“一行里隔一个面相对”的口诀，可这张展开图是阶梯形，1 和 3 不在同一行，口诀用不上。',
  ev:()=>`<p>平台用程序把展开图一格一格“滚”成正方体，算出三组相对的面：</p><div class="row">${netSVG(true)}<p class="mono" style="font-size:16px;line-height:2">${[1,2,3,4,5,6].filter(i=>i<OPP[i]).map((i,j)=>`<b style="color:${NETC[j][1]}">${i} ↔ ${OPP[i]}</b>`).join('<br>')}</p></div><p class="note">同一种颜色的两个面相对。动手验证：把展开图画在纸上剪下来，折一折。</p>`},
 {id:'cnt',cat:'容易数漏、数重',q:'从 1 写到 100，一共要写多少个数字“1”？',ask:'你的答案',opts:null,a:count1(),
  ai:'个位上是 1 的有 10 个（1、11、21……91），十位上是 1 的有 10 个（10～19），一共 20 个。',err:'它漏数了 100 里的那个“1”。这类“数一数”的题，AI 常常凭印象回答，容易数漏、数重。',
  ev:()=>`<p>平台用程序从 1 数到 100，把每个数里的“1”都数一遍：一共 <b>${count1()}</b> 个。</p><p class="note">个位是 1：10 个；十位是 1：10 个（11 被数了两次——它有两个“1”）；百位是 1：100 里还有 1 个。</p>`}];
const NETC=[['#ffe9a8','#8a5a00'],['#c9f2e1','#0b7a57'],['#e4dbff','#5a3fd0']];
function netSVG(col){const s=46,ox=10,oy=10;const pair=i=>[1,2,3,4,5,6].filter(k=>k<OPP[k]).findIndex(k=>k===i+1||OPP[k]===i+1);
 return `<svg class="l13-net" viewBox="0 0 ${4*s+20} ${3*s+20}" role="img" aria-label="阶梯形正方体展开图：第一行是 1、2，第二行是 3、4（3 在 2 的正下方），第三行是 5、6（5 在 4 的正下方）">${NET.map(([x,y],i)=>`<rect x="${ox+x*s}" y="${oy+y*s}" width="${s}" height="${s}" rx="4" fill="${col?NETC[pair(i)][0]:'#e2ebff'}" stroke="${col?NETC[pair(i)][1]:'#1b2550'}" stroke-width="2.5"/><text x="${ox+x*s+s/2}" y="${oy+y*s+s/2+7}" text-anchor="middle" font-size="20" font-weight="700" fill="#1b2550">${i+1}</text>`).join('')}</svg>`;}
const LCAT=['有歧义：能读出两种意思','条件不够：答案不唯一','需要空间想象','容易数漏、数重'];

/* ================= TALK ================= */
const STANCE=[['yes','认同：有了 AI，很多人不愿意自己动脑了'],['no','不认同：AI 只是工具，用好了反而学得更多'],['dep','要看怎么用：先独立思考再用 AI，就不会变懒']];
const USES=[['copy','作业不会做，直接拍照抄 AI 的答案','l','抄答案跳过了思考，下次遇到同样的题还是不会。'],['first','先自己做，做完再让 AI 批改','s','先独立思考，AI 只当“批改老师”。'],
 ['redo','看懂 AI 的步骤后，合上它自己重做一遍','s','把别人的思路变成自己的，才算真正学会。'],['blind','AI 说我错我就改，不问为什么','l','AI 也会判错。不问原因就改，可能把对的改成错的。'],
 ['bank','让 AI 按我的错题出相似题来练','s','有针对性地练习薄弱点，比漫无目的刷题更有效。'],['memo','考前让 AI 把所有题的答案列出来背','l','只背答案不理解方法，换一个数字就不会了。'],
 ['verify','AI 的答案和我不一样时，代回去验算','s','自己验证，既能发现 AI 的错误，也能检查自己。'],['ask','卡住时请 AI 只提示下一步，不看完整答案','s','只要一点提示，剩下的路自己走，思考没有被替代。']];
const UK={l:'会让人变懒',s:'帮助我学习'};

/* ================= quiz ================= */
const QUIZ=[
 {id:'q1',q:'我们和 AI 比赛做数学题，最主要的目的是什么？',opts:['证明人比 AI 算得快','观察 AI 拆解问题、运用规则、逐步求解的思路和方法，提升自己的解题能力','让 AI 替我们写作业','看看 AI 会不会累'],a:1,why:'教材说：比赛的目的不在于分出胜负，而在于观察 AI 分析和解题的思路和方法，从而提升我们的解题能力。'},
 {id:'q2',q:'下面哪一类题目，AI 最可能难以应对？',opts:['条件清楚的四则混合运算','题目有歧义、含义模糊，或者需要空间想象、创造性思维的题','简单的一步方程','把 3 米换算成厘米'],a:1,why:'AI 的解题表现依赖于题目信息的清晰性、完整性、确定性，也受限于自身的学习能力。歧义、模糊、空间想象和创造性的题，它可能难以应对。'},
 {id:'q3',q:'想让 AI 出一道适合自己的练习题，哪个提示词最好？',opts:['出一道数学题','给我出点难题','我是小学五年级学生，请生成一道与梯形面积计算有关的应用题，难度中等','数学'],a:2,why:'告诉 AI 你的年级，指定具体的知识点、题型等要求，AI 才能出符合你能力、有针对性的题目。'},
 {id:'q4',q:'AI 的批改结果和你的答案不一致时，最好的做法是：',opts:['AI 更聪明，直接改成 AI 的答案','坚持自己的答案，不用管 AI','想办法验证：把答案代回题目检验、换一种方法再算；自己判断不了就请教老师','两个答案都不要了'],a:2,why:'AI 也存在学习盲区，会出现没学到、学不全或学错的情况。对于 AI 给出的答案，要学会自己验证。'},
 {id:'q5',q:'怎样使用 AI，才能既提高学习效率，又提升数学能力？',opts:['遇到题就先问 AI，越快越好','把作业全部交给 AI 完成','先独立思考作答，再让 AI 批改和分析；对 AI 的答案自己验证；用错题有针对性地练习','完全不用 AI'],a:2,why:'要培养一种平衡能力：既善用 AI 提高效率、拓宽视野，又养成独立思考、自主学习的好习惯。AI 很强大，但它只是工具。'}];

/* the engine is exposed for tests */
L._M={Q,I,qa,qs,qm,qd,qeq,dec,fmt,fmtDec,fmtFrac,fmtPct,fmtMixed,parseAns,check,evalExpr,solveLinear,autoSolve,genP,KP,kpOf,RACE,CASES,LIM,OPP,foldNet,count1,rectAreas};
/* ================= runtime helpers ================= */
const S={c:{},tm:new Set(),r:null,wu:null,vc:'A',lc:'amb',bs:null,bv:null,cs:null,m:null,tk:null,vmore:false};
const myG=()=>clamp(+((App.student||{}).grade)||5,4,6);
const bump=(n=1)=>{const l=App.lesson(K);l.nExp=(l.nExp||0)+n;};
const stop=k=>{const c=S.c[k];if(c){try{c.abort();}catch(e){}delete S.c[k];}};
function stopAll(){Object.keys(S.c).forEach(stop);S.tm.forEach(t=>{clearInterval(t);clearTimeout(t);});S.tm.clear();}
const later=(f,ms)=>{const t=setTimeout(()=>{S.tm.delete(t);f();},ms);S.tm.add(t);return t;};
const every=(f,ms)=>{const t=setInterval(f,ms);S.tm.add(t);return t;};
const unEvery=t=>{clearInterval(t);S.tm.delete(t);};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
/* one AI call; null = no AI (use presets); throws {code:'cancelled'} when stopped */
async function ask(key,prompt,o={}){if(!App.AI.real())return null;stop(key);const ctl=new AbortController();S.c[key]=ctl;
 try{const r=await App.AI.chat(prompt,Object.assign({signal:ctl.signal},o));return r;}
 catch(e){App.AI.fail(e);if((e&&e.code==='cancelled')||ctl.signal.aborted)throw {code:'cancelled'};App.toast(App.AI.errText(e));return null;}
 finally{if(S.c[key]===ctl)delete S.c[key];}}
/* offline: reveal preset lines one by one so the "AI working" process is visible */
function fake(n,onStep,key,per=520){return new Promise((res,rej)=>{stop(key);const ctl=new AbortController();S.c[key]=ctl;let i=0;
 const tick=()=>{if(ctl.signal.aborted){rej({code:'cancelled'});return;}i++;onStep(i);if(i>=n){delete S.c[key];res();}else later(tick,per*(0.6+Math.random()*0.8));};
 ctl.signal.addEventListener('abort',()=>rej({code:'cancelled'}),{once:true});later(tick,400);});}
const tagC=t=>TAGC[t]||'t0';
const stepsHTML=(st,{cls='',sel=-1,bad=-1}={})=>`<ol class="l13-steps ${cls}">${st.map(([t,x],i)=>`<li data-si="${i}" class="${i===sel?'sel':''} ${i===bad?'bad':''}"><span class="l13-tg ${tagC(t)}">${esc(t||'步骤')}</span><span>${esc(x)}</span></li>`).join('')}</ol>`;
const DEMO_LBL='<span class="l13-demo">示意：AI 可能出现的错误</span>';
const sec=ms=>(ms/1000).toFixed(1)+' 秒';
const ansTxt=(P)=>P.pct?fmtPct(P.ans):showOf(P);
const anOf=x=>x?[x.n,x.d]:null;const fromAn=a=>Array.isArray(a)&&a.length===2?Q(a[0],a[1]):null;
/* a short error diagnosis from the numbers (for offline grading and the bank) */
function diag(my,ans){if(!my||!ans)return '';const r=qd(my,ans);if(!r)return '';
 if(qeq(r,I(2)))return '你的结果正好是正确答案的 2 倍：是不是漏了“÷ 2”？';if(qeq(r,Q(1,2)))return '你的结果正好是正确答案的一半：公式里是不是多除了 2？';
 if(qeq(r,I(10))||qeq(r,Q(1,10))||qeq(r,I(100))||qeq(r,Q(1,100)))return '数字都对，小数点的位置错了。';
 const df=qs(my,ans);if(df&&Math.abs(df.n/df.d)<=Math.max(2,Math.abs(ans.n/ans.d)*0.05))return '和正确答案很接近，可能是某一步粗心了。';return '';}
const parseRaw=s=>{const r=parseAns(s);return r?r.v:null;};
function tagNorm(t){t=String(t||'');return /拆解|分析|已知|理解/.test(t)?T1:/规则|公式|定律|性质|顺序|方法/.test(t)?T2:/检验|验算|检查/.test(t)?T4:/求解|计算|解|算/.test(t)?T3:'';}
function parseSteps(text){const steps=[];let raw='';String(text||'').replace(/```\w*/g,'').split('\n').forEach(l=>{l=l.replace(/\*\*/g,'').trim();if(!l)return;let m=/^(?:最终)?答案\s*[｜|:：]\s*(.+)$/.exec(l);if(m){raw=m[1].trim();return;}
  m=/^(?:步骤|第)?\s*\d+\s*步?\s*[｜|.、:：)）]\s*(?:([^｜|]{2,8})\s*[｜|]\s*)?(.+)$/.exec(l);if(m){steps.push([tagNorm(m[1]),m[2].trim()]);return;}if(steps.length<8)steps.push(['',l]);});
 if(!raw){const nums=String(text||'').match(/-?\d+(?:\.\d+)?(?:\/\d+)?%?/g);if(nums&&/答/.test(text))raw=nums[nums.length-1];}
 return {steps:steps.slice(0,8),raw,ans:parseRaw(raw)};}
/* v3 helpers local to this lesson */
const aiWait=(box,txt)=>{box=$(box);if(!box)return;box.classList.add('wait');box.classList.remove('busy');const o=$('.bot',box);if(o)o.outerHTML=App.bot('idle');$('.ai-body',box).innerHTML=txt;const s=$('.ai-src',box);if(s)s.innerHTML='';};
const showAfter=(st,on)=>{const a=$('.after-run',st);if(a)a.style.display=on?'':'none';};
const clearFb=id=>{const e=$(id);if(e)e.innerHTML='';};
/* 我的记录: several opinion questions (no right answer), ONE shown at a time. qs=[{q,opts,get,set}] */
function poll(root,qs,done){if(!root)return;let i=qs.findIndex(q=>q.get()==null);if(i<0)i=qs.length-1;
 const draw=()=>{const q=qs[i],cur=q.get();
  root.innerHTML=`<div class="ask">${qs.length>1?`<span class="note">第 ${i+1} / ${qs.length} 个</span><br>`:''}${q.q}</div><div class="opts">${q.opts.map((o,j)=>`<button type="button" class="chip ${cur===j?'on':''}" data-j="${j}">${esc(o)}</button>`).join('')}</div>${qs.length>1?`<div class="row"><button type="button" class="btn ghost sm" data-prev ${i?'':'hidden'}>上一个</button><button type="button" class="btn ghost sm" data-next ${i<qs.length-1&&cur!=null?'':'hidden'}>下一个</button></div>`:''}`;
  $$('.chip',root).forEach(b=>b.onclick=()=>{q.set(+b.dataset.j);App.touch();if(done)done();if(i<qs.length-1)i++;draw();});
  const p=$('[data-prev]',root),n=$('[data-next]',root);if(p)p.onclick=()=>{i--;draw();};if(n)n.onclick=()=>{i++;draw();};};draw();}
/* which conclusion is right in the verification station: 0 = mine, 1 = the AI's, 2 = neither */
const verTruth=(k,v)=>(v&&v.ok)?0:(k==='B'?1:2);
const KS={mix:'混合运算',law:'简便计算',dec:'小数',area:'面积',eq:'方程',frac:'分数',vol:'长方体',pct:'百分数',chick:'鸡兔同笼',travel:'行程',work:'工程',pattern:'找规律',oral:'口算',share:'分数与除法'};
const KPSEL={4:['mix','law','dec','area','chick','pattern'],5:['dec','area','eq','frac','vol','chick'],6:['frac','pct','area','eq','work','travel']};
const myOwn=lr=>(lr.my||[]).filter(m=>m&&A(m.q).length>=4&&String(m.a||'').trim()&&m.own!==0);
const WHY=['计算失误','概念或公式不清','审题不仔细','不会方法'];
const STARTERS=['计算：(48 + 52) × 6','解方程：x + 35 = 82','一个长方形长 9 米、宽 4 米，面积是多少平方米？'];
const limOpts=c=>c.opts||['19','20','21','22'];const limAns=c=>c.opts?c.a:limOpts(c).indexOf(String(c.a));

/* ================= CSS (light theme; variables only) ================= */
const CSS=`
.l13-col{display:flex;flex-direction:column;gap:14px;min-width:0}
.l13-card{background:var(--panel);border:1.5px solid var(--line2);border-radius:18px;padding:18px 20px;display:flex;flex-direction:column;gap:12px;box-shadow:0 5px 0 var(--tint);min-width:0;align-self:start}
.l13-card>small{font-size:13.5px;font-weight:700;color:var(--sky)}
.l13-qt{font-size:21px;line-height:1.6;font-weight:700;color:var(--ink);overflow-wrap:anywhere}
.l13-qt.big{font-family:var(--f-display);font-weight:800;font-size:34px;min-height:54px}
.l13-qt.say{font-weight:500;font-size:19px;padding:12px 14px;border-radius:14px;background:var(--sky-soft)}
.l13-aq{font-size:18px;font-weight:700;line-height:1.6;overflow-wrap:anywhere}
.l13-clock{font-family:var(--f-display);font-weight:800;font-size:30px;color:var(--coral-d);line-height:1.1}
.l13-vs{display:grid;grid-template-columns:1fr auto 1fr;gap:10px;align-items:center}
.l13-led{border:2px solid var(--line2);border-radius:14px;padding:8px 12px;background:var(--panel2);min-width:0}
.l13-led span{font-size:13.5px;color:var(--muted);font-weight:700}
.l13-led b{display:block;font-family:var(--f-display);font-weight:800;font-size:24px;color:var(--ink);line-height:1.2}
.l13-led.ai{border-color:var(--grape);background:var(--grape-soft)}
.l13-ans{max-width:150px;font-size:18px;font-weight:700}
input[type=text].l13-ans{border-color:var(--ink)}
.l13-lb{font-weight:700;color:var(--ink)}
.l13-steps{list-style:none;margin:8px 0 0;padding:0;display:flex;flex-direction:column;gap:6px}
.l13-steps li{display:grid;grid-template-columns:auto minmax(0,1fr);gap:8px;align-items:baseline;font-size:15px;line-height:1.5;padding:6px 10px;border-radius:12px;background:var(--panel);border:2px solid var(--line)}
.l13-steps.click li{cursor:pointer}.l13-steps.click li:hover{border-color:var(--ink)}
.l13-steps li.sel{border-color:var(--ink);background:var(--sun-soft)}
.l13-steps li.bad{border-color:var(--coral);background:var(--coral-soft)}
.l13-tg{font-size:12.5px;font-weight:700;padding:1px 9px;border-radius:999px;white-space:nowrap;background:var(--panel2);color:var(--muted)}
.l13-tg.t1{background:var(--sky-soft);color:var(--sky)}.l13-tg.t2{background:var(--sun-soft);color:var(--sun-d)}.l13-tg.t3{background:var(--mint-soft);color:var(--mint-d)}.l13-tg.t4{background:var(--grape-soft);color:var(--grape-d)}
.l13-demo{display:inline-block;font-size:12.5px;font-weight:700;padding:1px 10px;border-radius:999px;background:var(--coral-soft);color:var(--coral-d)}
.l13-ok{color:var(--mint-d)}.l13-no{color:var(--coral-d)}.l13-mid{color:var(--sun-d)}
.l13-v{font-size:14.5px;line-height:1.55;padding:8px 12px;border-radius:12px;border:2px solid var(--line2);background:var(--panel);color:var(--ink)}
.l13-v.ok{border-color:var(--mint);background:var(--mint-soft)}.l13-v.no{border-color:var(--coral);background:var(--coral-soft)}.l13-v.mid{border-color:var(--sun);background:var(--sun-soft)}
.l13-tb{border-collapse:collapse;font-size:14px;margin:6px 0}
.l13-tb th,.l13-tb td{padding:3px 12px;border-bottom:2px solid var(--line);text-align:center}
.l13-net{width:100%;max-width:260px;display:block}
.l13-dots{display:flex;gap:8px;align-items:center;font-size:14px;font-weight:700;color:var(--muted)}
.l13-dots i{width:18px;height:18px;border-radius:50%;border:1.5px solid var(--line2);background:var(--panel)}
.l13-dots i.on{background:var(--mint)}
.l13-ev{font-size:14.5px;line-height:1.6;color:var(--ink)}
.l13-list{margin:0;padding-left:20px;font-size:14.5px}
.l13-piles{display:grid;grid-template-columns:1fr 1fr;gap:14px}.l13-piles>div{min-width:0}.l13-piles li{margin:4px 0;line-height:1.5}
@media (max-width:560px){.l13-piles{grid-template-columns:1fr}}
.l13-dex{display:flex;flex-direction:column;gap:12px;font-size:14px}
.l13-dex ol,.l13-dex ul{margin:4px 0 0;padding-left:20px}
details.l13-more>summary{cursor:pointer;color:var(--muted);font-size:13.5px}
@media (max-width:560px){.l13-qt{font-size:18px}.l13-qt.big{font-size:28px}.l13-card{padding:14px}}`;

/* ================= render ================= */
const more=h=>`<details class="more"><summary>说明</summary>${h}</details>`;
const ansIn=(id,ph='我的答案')=>`<input type="text" class="l13-ans" id="${id}" maxlength="20" autocomplete="off" placeholder="${ph}" aria-label="${ph}">`;
L.render=function(){const v=$('#v-'+K);if(!v)return;let st=document.getElementById('css-l13');if(!st){st=document.createElement('style');st.id='css-l13';document.head.appendChild(st);}st.textContent=CSS;
 v.innerHTML=`${App.hero(K,'先自己算，再看 AI：比思路，让它出题、批改，还要抓出它的错。',['体验用 AI 出题、批改、分析解题思路。','知道用 AI 辅助解题的优点和不足。'])}

 <div class="station" id="l13-s0">${App.head('WARM-UP','导入 · 人机挑战赛','速算擂台','限时速算，和 AI 比比谁快！')}
  <ol class="steps"><li>开始速算</li><li>想想为什么比</li></ol>
  <div class="grid2"><div class="l13-card"><div class="l13-vs"><div class="l13-led"><span>我做对</span><b id="l13-w-me">0 道</b></div><div class="l13-clock" id="l13-w-clk">60</div><div class="l13-led ai"><span>AI 做对</span><b id="l13-w-ai">？</b></div></div>
    <div class="l13-qt big" id="l13-w-q" aria-live="polite">准备好了吗？</div>
    <div class="row">${ansIn('l13-w-in','答案')}<button class="btn ghost sm" type="button" id="l13-w-ok" disabled>确定</button><span id="l13-w-fbk" aria-live="polite"></span></div><p class="note">算出答案按回车，马上出下一题。</p></div>
   <div class="l13-col">${App.knobs([['时间',App.seg('wt',[['30','30 秒'],['60','60 秒']],'60')]])}
    <div class="go-row">${App.go('l13-w-go','开始速算')}</div>
    ${App.aiBox('l13-w-aibox','比完以后，AI 来做同样的题','AI 的成绩')}<div id="l13-w-fb"></div>
    <div class="after-run">${App.pad('',`<div id="l13-w-poll"></div>`)}</div></div></div>
  ${more(`<p class="note">算出答案按回车（或点“确定”），马上出下一题。按年级出题，可以重玩。</p>`+App.know('比赛的目的不在于分出胜负','做精确计算，电脑程序一秒能算几百万道题；大模型 AI 解题时要一边“想”一边写出步骤，一般需要几秒到几十秒——都比人快得多。教材说：AI 不仅能快速解答数学题，还能展示详细的解题步骤。我们和 AI 比赛的目的不在于分出胜负，而在于观察它分析和解题的思路和方法，即如何<b>拆解问题、运用规则、逐步求解</b>，从而提升我们的解题能力。'))}
 </div>

 <div class="station" id="l13-s1">${App.head('EXP-01','挑战一 · 人机挑战赛','人机赛跑','先自己算出答案，再和 AI 比思路')}
  <ol class="steps"><li>写答案，比一比</li><li>点出 AI 的关键一步</li></ol>
  <div class="grid2"><div class="l13-card"><small id="l13-r-kind"></small><div class="l13-qt" id="l13-r-q"></div><div class="row"><span class="note">我的用时</span><b class="l13-clock" id="l13-r-mt">0.0 秒</b></div></div>
   <div class="l13-col">${App.knobs([['题目',App.seg('rp',[['p1','计算'],['p2','方程'],['p3','鸡兔同笼'],['p4','梯形'],['rnd','随机一道']],'p1')]])}
    <div class="go-row">${ansIn('l13-r-ans')}${App.go('l13-r-go','和 AI 比一比')}</div>
    ${App.aiBox('l13-r-ai','你交了答案，AI 才开始解题','AI 的解法')}<div id="l13-r-fb"></div>
    <div class="after-run">${App.pad('',`<div id="l13-r-poll"></div>`)}</div></div></div>
  ${more(`<p class="note" id="l13-eng1"></p><p class="note">AI 的每一步都贴了标签：拆解问题、运用规则、逐步求解、检验。答案由平台精确核对。</p>`+App.think(['与 AI 比赛求解数学题时，你有什么感受？','AI 的解题思路有哪些值得借鉴？','AI 能解决所有数学问题吗？'])+App.know('AI 解题的优点与依赖','AI 不仅能快速解答数学题，还能展示详细的解题步骤。不过，AI 的解题表现依赖于题目信息的清晰性、完整性、确定性，也受限于自身的学习能力。也就是说，如果题目有歧义、含义模糊，或者需要运用空间想象、创造性思维等能力，它可能就难以应对。所以，我们要记住，AI 并不是无所不能，真正的数学思维和解决复杂问题的能力需要靠我们自己培养。'))}
 </div>

 <div class="station" id="l13-s2">${App.head('EXP-02','挑战二 · 设计练习题','私人出题机','两种说法各试一次，看哪种出的题更对路')}
  <ol class="steps"><li>让 AI 出题</li><li>两种说法都试试</li></ol>
  <div class="grid2"><div class="l13-card"><small>我对 AI 说</small><div class="l13-qt say" id="l13-g-pt"></div><div id="l13-g-log"></div></div>
   <div class="l13-col"><div id="l13-g-knobs"></div>
    <div class="go-row">${App.go('l13-g-go','让 AI 出题')}</div>
    ${App.aiBox('l13-g-ai','AI 出的题会出现在这里','AI 出的题')}<div id="l13-g-fb"></div>
    <div class="after-run">${App.pad('',`<div id="l13-g-poll"></div>`)}</div></div></div>
  ${more(`<p class="note" id="l13-eng2"></p>`+App.know('把要求说具体，AI 才能出“对路”的题','告诉 AI 你所在的年级，指定具体的知识点、题型等要求，就是在写具体的提示词。比如“生成一道适合小学五年级学生、与面积计算有关的应用题”。“AI 出题—我们解题—AI 批改”可以随时针对薄弱点练习，还能马上得到批改和思路分析；但 AI 出的题也可能条件不全、答案有误，批改也可能出错——所以平台把能精确计算的结果都核对了一遍，算不了的，要靠你自己验证。'))}
 </div>

 <div class="station" id="l13-s2b">${App.head('EXP-02b','挑战二 · AI 来批改','AI 批改台','自己解出这道题，看 AI 批得对不对')}
  <ol class="steps"><li>写答案，交批改</li><li>判断批得对不对</li></ol>
  <div class="grid2"><div class="l13-card"><small id="l13-c-meta"></small><div class="l13-qt" id="l13-c-q"></div></div>
   <div class="l13-col"><div class="go-row">${ansIn('l13-c-ans')}${App.go('l13-c-go','交给 AI 批改')}<button class="btn ghost sm" type="button" id="l13-c-new">换一道</button></div>
    ${App.aiBox('l13-c-ai','写好答案交上来，AI 来批改','AI 的批改')}<div id="l13-c-fb"></div>
    <div class="after-run">${App.pad('AI 的批改正确吗？',`<div class="opts" id="l13-c-gr"></div>`)}</div></div></div>
  ${more(`<p class="note">题目来自上一站的出题机。能写成算式的题，平台会用精确计算再核对一遍；做错的题自动存进错题银行。自己判断不了时，可以请教老师。</p>`+App.think(['相比使用通用的练习册，让 AI 根据你的学习情况出练习题是不是更有针对性？','如果 AI 的批改结果和你的答案不一致，你是选择相信它，还是想办法验证？']))}
 </div>

 <div class="station" id="l13-s3">${App.head('EXP-03','挑战二 · 相信还是验证','批改验证台','AI 说你错了？别急着改，验证一下！')}
  <ol class="steps"><li>选答案，交批改</li><li>验证，下结论</li></ol>
  <div class="grid2"><div class="l13-card"><small id="l13-v-kind"></small><div class="l13-qt" id="l13-v-q"></div></div>
   <div class="l13-col">${App.knobs([['题目',App.seg('vc',[['A','方程题'],['B','分数题']],'A')]])}
    <div class="go-row"><span class="l13-lb">我的答案</span><span id="l13-v-opts" style="display:contents"></span>${App.go('l13-v-go','交给 AI 批改')}</div>
    ${App.aiBox('l13-v-ai','选好答案，交给 AI 批改','AI 的批改')}<div id="l13-v-fb"></div>
    <div class="after-run">${App.pad('',`<div class="l13-col" id="l13-v-flow"></div>`,'我来验证')}</div></div></div>
  ${more(`<p class="note">这一站 AI 的批改是事先准备好的示意，用来练习验证；验证用的计算由平台精确完成。</p>`+App.know('AI 也有学习盲区','现在，AI 辅助学习的应用越来越广泛。但是，AI 生成的结果通常源于它学习过的内容。和我们一样，AI 也存在学习盲区，也会出现没学到、学不全或学错的情况，这些问题会体现在它生成的结果中。因此，在使用 AI 辅助学习时，我们仍需要独立思考，对于 AI 给出的答案，要学会自己验证。常用的验证方法：<b>把答案代回题目</b>、<b>换一种方法再算一遍</b>、<b>比较数值是否相等</b>；自己判断不了，就请教老师。'))}
 </div>

 <div class="station" id="l13-s4">${App.head('EXP-04','挑战二 · 针对性练习','错题银行','挑一道错题，连对 2 道相似题就掌握！')}
  <ol class="steps"><li>选错题，标错因</li><li>连对 2 道相似题</li></ol>
  <div class="grid2"><div class="l13-card" id="l13-b-card"></div>
   <div class="l13-col"><div id="l13-b-knobs"></div>
    <div class="go-row">${App.go('l13-b-go','出一道相似题')}</div>
    ${App.aiBox('l13-b-ai','相似题会出现在这里','相似题')}
    <div class="after-run">${App.pad('我的答案',`<div class="row">${ansIn('l13-b-ans','先自己算')}<button class="btn sm" type="button" id="l13-b-chk">对答案</button></div>`)}</div><div id="l13-b-fb"></div></div></div>
  ${more(`<p class="note">前几站做错的题会自动存到这里；还没有错题时，先用示例错题练习。</p>`+App.know('错题是最好的练习材料','我们提供自己的错题记录，AI 就能有针对性地生成强化练习册，协助我们梳理解题思路。这里的相似题，由平台的出题程序按同一个知识点、换上新数字生成，答案可以精确核对。比起漫无目的地刷题，盯住错因练习更有效。'))}
 </div>

 <div class="station" id="l13-s4b">${App.head('EXP-04b','挑战二 · 我来出题','我当出题人','出一道题考考 AI，看答案对不对得上')}
  <ol class="steps"><li>写题，考考 AI</li><li>对上 2 道答案</li></ol>
  <div class="l13-col">${App.knobs([['我的题',`<input type="text" id="l13-m-q" maxlength="100" aria-label="我出的题" style="flex:1;min-width:0">`,'改一改，变成你的'],['灵感',App.seg('ms',[['0','算式'],['1','方程'],['2','应用题']],'0')]],'写一写')}
   <div class="go-row">${App.go('l13-m-go','考考 AI')}</div>
   ${App.aiBox('l13-m-ai','AI 算好以后，先把答案藏起来','AI 的答案')}
   <div class="after-run">${App.pad('我的答案',`<div class="row">${ansIn('l13-m-a','出题人的答案')}<button class="btn sm" type="button" id="l13-m-chk">对答案</button></div><div id="l13-m-list"></div>`)}</div><div id="l13-m-fb"></div></div>
  ${more(`<p class="note" id="l13-eng4"></p><p class="note">算式和方程由平台精确计算；文字应用题在接入大模型时由 AI 来做，离线时请同桌做一做来核对。你出的题会收进成长日记。</p>`)}
 </div>

 <div class="station" id="l13-s5">${App.head('EXP-05','综合运用 · AI 不是无所不能','AI 的盲区','4 道怪题，找出 AI 栽在哪儿！')}
  <ol class="steps"><li>先猜，再看 AI</li><li>判完 4 道题</li></ol>
  <div class="grid2"><div class="l13-card" id="l13-l-card"></div>
   <div class="l13-col">${App.knobs([['题目',App.seg('lc',LIM.map((c,i)=>[c.id,`第 ${i+1} 题`]),'amb')]])}
    <div class="go-row"><span class="l13-lb">我猜</span><span id="l13-l-opts" style="display:contents"></span>${App.go('l13-l-go','看 AI 怎么答')}</div>
    ${App.aiBox('l13-l-ai','先猜一猜，再看 AI 的回答')}<div id="l13-l-fb"></div>
    <div class="after-run">${App.pad('',`<div class="l13-ev" id="l13-l-ev"></div><div class="ask">AI 栽在哪一类？</div><div class="opts" id="l13-l-cat"></div><div class="row" id="l13-l-nx"></div><div id="l13-l-live"></div>`,'证据与判断')}</div></div></div>
  ${more(`<p class="note" id="l13-eng5"></p><p class="note">这一站 AI 的回答是事先准备好的示意；证据由平台用程序算出。</p>`+App.know('AI 难以应对的题','AI 的解题表现依赖于题目信息的清晰性、完整性、确定性，也受限于自身的学习能力。如果题目有歧义、含义模糊，或者需要运用空间想象、创造性思维等能力，它可能就难以应对；它还有学习盲区，会出现没学到、学不全或学错的情况。遇到这些题，AI 常常不会说“我不确定”，而是自信地给出一个答案——所以，AI 给出的答案不能盲目相信，需要进一步求证。'))}
 </div>

 <div class="station" id="l13-s6">${App.head('TALK','讨论 · 善用与依赖','AI 让人变懒了吗','先表态，再看 8 张做法卡：变懒还是帮学习？')}
  <ol class="steps"><li>表态，判 8 张卡</li><li>判完再表态</li></ol>
  <div class="grid2"><div class="l13-card" id="l13-t-card"></div>
   <div class="l13-col"><div class="go-row"><span class="l13-lb">“AI 让人变懒了”</span><span id="l13-t-pre" style="display:contents"></span>${App.go('l13-t-go','开始判卡')}</div>
    <div id="l13-t-fb"></div>
    <div class="after-run">${App.pad('判完 8 张卡，你现在怎么看？',`<div class="opts" id="l13-t-st"></div>`)}</div></div></div>
  ${more(App.know('培养一种平衡能力','AI 既有优点，也有不足。它的出题、解题能力给我们提供了学习辅助；但 AI 也会犯错，给出的答案不能盲目相信，需要进一步求证。此外，数学思维的培养源于我们的独立思考和反复练习，以达到对概念的深刻理解和对方法的熟练掌握。在 AI 时代，我们要培养的是一种平衡能力：既要善用 AI 提高效率、拓宽视野，又要养成独立思考、自主学习的好习惯。AI 很强大，但它只是工具，永远也替代不了我们独立思考的乐趣、亲手攻克难题的成就感，以及由此培养出的思维能力。'))}
 </div>

 <div class="station" id="l13-quiz-st">${App.head('QUIZ','反思与总结','小测验','5 道题，第一次作答计入能力图谱')}<div id="l13-quiz"></div></div>
 <div class="station" id="l13-diary"></div>`;
 if(!App.rec)return;wire();};

function wire(){const lr=App.lesson(K);
 ['wu','race','gen','ver','lim','talk'].forEach(k=>{if(!lr[k]||typeof lr[k]!=='object'||Array.isArray(lr[k]))lr[k]={};});
 if(!Array.isArray(lr.bank))lr.bank=[];lr.my=Array.isArray(lr.my)?lr.my.filter(m=>m&&A(m.q).length>=4):[];
 const R=lr.race;R.runs=Array.isArray(R.runs)?R.runs:[];R.o=R.o||{};const GN=lr.gen;GN.sets=Array.isArray(GN.sets)?GN.sets:[];GN.o=GN.o||{};GN.cfg=GN.cfg||{};
 const VR=lr.ver;['A','B'].forEach(k=>{if(!VR[k]||typeof VR[k]!=='object')VR[k]={};if(!Array.isArray(VR[k].ch))VR[k].ch=[];});const TK=lr.talk;TK.sort=TK.sort||{};
 const engTxt=()=>App.AI.real()?`当前由 ${App.AI.label()} 真实作答，它也会出错。`:'当前是离线演示：用内置示例和出题程序。';
 const s0=$('#l13-s0'),s1=$('#l13-s1'),s2=$('#l13-s2'),s2b=$('#l13-s2b'),s3=$('#l13-s3'),s4=$('#l13-s4'),s4b=$('#l13-s4b'),s5=$('#l13-s5'),s6=$('#l13-s6');
 S.r=null;S.wu=null;S.bv=null;S.cs=null;S.m=null;S.tk=null;S.vmore=false;
 /* ---------- bank helper ---------- */
 const addBank=(e)=>{const B=App.lesson(K).bank;if(B.some(x=>x.q===e.q&&!x.done))return;B.unshift(Object.assign({id:'b'+Date.now().toString(36)+Math.floor(Math.random()*99),n:0,ok:0,sk:0},e));if(B.length>12)B.length=12;};
 const bankFrom=(P,my,src)=>addBank({src,kp:P.kp,sub:P.sub,g:P.g||myG(),type:P.type||'calc',q:clip(P.q,160),my:clip(my,20),a:ansTxt(P),an:anOf(P.ans),u:P.u||'',pct:P.pct?1:0});

 /* ===== WARM-UP 速算擂台 ===== */
 const W=lr.wu;const wq=$('#l13-w-q'),win=$('#l13-w-in'),wgo=$('#l13-w-go'),wok=$('#l13-w-ok');let wsec=60;win.disabled=true;
 App.segWire(s0,'wt',v=>{if(S.wu&&S.wu.on){$$('[data-seg="wt"] .chip',s0).forEach(x=>x.classList.toggle('on',+x.dataset.v===wsec));return;}wsec=+v;$('#l13-w-clk').textContent=wsec;});
 const wuNext=()=>{const w=S.wu;const P=genP('oral',myG(),'calc');w.cur=P;w.list.push(P);wq.textContent=P.e+' = ?';win.value='';try{win.focus({preventScroll:true});}catch(e){}};
 const wuSubmit=()=>{const w=S.wu;if(!w||!w.on)return;const v=win.value.trim();if(!v)return;const P=w.cur;P.my=v;P.ok=check(v,P).ok;
  $('#l13-w-fbk').innerHTML=P.ok?'<b class="l13-ok">✓ 对</b>':`<b class="l13-no">✗ ${esc(P.e)} = ${esc(showOf(P))}</b>`;$('#l13-w-me').textContent=w.list.filter(x=>x.ok).length+' 道';wuNext();};
 const wuEnd=()=>{const w=S.wu;if(!w||!w.on)return;w.on=false;unEvery(w.iv);if(w.cur&&w.cur.my==null)w.list.pop();
  const done=w.list.filter(x=>x.my!=null);const t0=performance.now();let reps=0;while(performance.now()-t0<60&&reps<20000){done.forEach(x=>evalExpr(x.e));reps++;}
  const cms=done.length?(performance.now()-t0)/Math.max(1,reps):0;const l=App.lesson(K);const ok=done.filter(x=>x.ok).length;const used=Math.min(w.sec,Math.round((performance.now()-w.t0)/1000));
  l.wu=Object.assign(l.wu||{},{n:done.length,ok,sec:used,cms:+cms.toFixed(4),runs:((l.wu||{}).runs||0)+1,best:Math.max((l.wu||{}).best||0,ok)});
  done.filter(x=>!x.ok).slice(0,2).forEach(x=>bankFrom(x,x.my,'wu'));App.touch();
  wq.textContent=done.length?`做了 ${done.length} 道，对 ${ok} 道`:'时间到';$('#l13-w-fbk').textContent='';win.disabled=true;wok.disabled=true;$('#l13-w-clk').textContent='0';
  wgo.dataset.label='再比一次';wgo.textContent='再比一次';wgo.classList.add('again');$('#l13-w-ai').textContent=done.length?done.length+' 道':'—';
  App.aiSay('#l13-w-aibox',done.length?`<div class="big">${done.length} 道全对 · ${cms<0.01?'不到 0.01':cms.toFixed(3)} 毫秒</div><p class="note">这是电脑程序做精确计算的速度。大模型 AI 要边想边写步骤，会慢一些，也比人快得多。</p>`:'你一道都没交，我也没有题可做。',{mood:done.length?'happy':'idle',src:'平台计算程序'});
  showAfter(s0,true);const goal=w.sec>=60?10:5;
  if(!done.length)App.fb('#l13-w-fb','try','一道都没交？','算出答案按回车，再比一次。',{stars:0});
  else App.fb('#l13-w-fb','find',`你 ${used} 秒对 ${ok} 道，AI 只用一眨眼`,`比速度，人很难赢。那为什么还要和 AI 比？在下面选一选。${ok>=goal?'':`（做对 ${goal} 道拿 3 星）`}`,{stars:ok>=goal?3:ok>=goal/2?2:1});
  mk0();refreshBank();};
 wgo.onclick=()=>{if(S.wu&&S.wu.on){wuEnd();return;}S.wu={on:true,list:[],t0:performance.now(),sec:wsec};win.disabled=false;wok.disabled=false;$('#l13-w-fbk').textContent='';$('#l13-w-me').textContent='0 道';$('#l13-w-ai').textContent='？';
  wgo.dataset.label='提前交卷';wgo.textContent='提前交卷';aiWait('#l13-w-aibox','你先算，我等你比完再做同样的题');showAfter(s0,false);
  App.fb('#l13-w-fb','find','计时开始！','在左边的框里写答案，按回车。');wuNext();
  const w=S.wu;w.iv=every(()=>{const left=w.sec*1000-(performance.now()-w.t0);$('#l13-w-clk').textContent=Math.max(0,Math.ceil(left/1000));if(left<=0)wuEnd();},200);};
 wok.onclick=wuSubmit;win.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();wuSubmit();}});
 const WQ=['证明人比 AI 聪明','看 AI 怎样拆解问题、运用规则、逐步求解，提升自己的解题能力','以后做题都让 AI 来，自己不用算了'];
 const WQF=['比聪明？刚才比速度，我们可没赢。再想想：看 AI 解题，我们能学到什么？','','都交给 AI，我们自己的解题能力从哪里来？再选一次。'];
 function drawWq(){const q=App.lesson(K).wu.q;$('#l13-w-poll').innerHTML=`<div class="ask">比速度，人很难赢 AI。那我们为什么还要和它比？</div><div class="opts">${WQ.map((o,j)=>`<button type="button" class="chip big ${q&&q.last===j?'on':''}" data-j="${j}">${esc(o)}</button>`).join('')}</div>`;
  $$('#l13-w-poll .chip').forEach(b=>b.onclick=()=>{const j=+b.dataset.j,w=App.lesson(K).wu;w.q=w.q||{first:j,ok:j===1};w.q.last=j;App.touch();drawWq();mk0();
   if(j===1)App.fb('#l13-w-fb','ok','对！比的是思路','看 AI 怎样一步步解题，把好方法学过来。下一站就来比思路。');else App.fb('#l13-w-fb','try','再想想',WQF[j]);});}
 drawWq();
 function mk0(){const w=App.lesson(K).wu||{};if(w.runs)App.markStep(s0,0);if(w.q)App.markStep(s0,1);}
 if(W.runs){App.ran(s0);$('#l13-w-me').textContent=(W.ok||0)+' 道';$('#l13-w-ai').textContent=(W.n||0)+' 道';wq.textContent=`上次做了 ${W.n||0} 道，对 ${W.ok||0} 道`;}mk0();

 /* ===== EXP-01 人机赛跑 ===== */
 const rAns=$('#l13-r-ans'),rGo=$('#l13-r-go');
 const elapsed=()=>{const r=S.r;return r?r.acc+(r.t0!=null?performance.now()-r.t0:0):0;};
 const visible=el=>!!el&&el.offsetParent!==null;
 const raceNew=id=>{let P;if(id==='rnd'){const g=myG();const kp=pick(KPSEL[g]);P=genP(kp,g,pick(KP[kp].t));P.id='rnd';P.kind=`${TYPES[P.type]} · ${KP[P.kp].n}`;}
  else{const r=RACE.find(x=>x.id===id);P=Object.assign({g:myG(),type:id==='p1'?'calc':'word'},r);P.show=fmt(P.ans);}
  stop('race');S.r={P,id,ph:'idle',acc:0,t0:visible(s1)?performance.now():null};
  $('#l13-r-kind').textContent=P.kind||'';$('#l13-r-q').textContent=P.q;$('#l13-r-mt').textContent='0.0 秒';rAns.value='';rAns.disabled=false;rGo.dataset.label='和 AI 比一比';rGo.classList.remove('again');App.busy(rGo,false);showAfter(s1,false);
  $$('[data-seg="rp"] .chip',s1).forEach(x=>x.classList.toggle('on',x.dataset.v===id));
  aiWait('#l13-r-ai','你交了答案，AI 才开始解题');clearFb('#l13-r-fb');};
 App.segWire(s1,'rp',v=>{if(S.r&&S.r.ph==='ai'){App.toast('AI 正在解题，等它解完再换题');$$('[data-seg="rp"] .chip',s1).forEach(x=>x.classList.toggle('on',x.dataset.v===S.r.id));return;}raceNew(v);});
 if(L._io)L._io.disconnect();
 if('IntersectionObserver' in window){L._io=new IntersectionObserver(es=>{const vis=es[es.length-1].isIntersecting;const r=S.r;if(!r||r.ph!=='idle')return;const now=performance.now();if(vis&&r.t0==null)r.t0=now;else if(!vis&&r.t0!=null){r.acc+=now-r.t0;r.t0=null;}});}
 clearInterval(L._tick);L._tick=setInterval(()=>{const r=S.r;if(!r||r.ph!=='idle'||r.t0==null)return;const el=$('#l13-r-mt');if(el)el.textContent=sec(elapsed());},200);
 const lastRun=()=>{const a=App.lesson(K).race.runs;return a[a.length-1]||null;};
 const SAME=['思路基本一样','方法不一样，都对','AI 的方法更简便','我的方法更简便'],O1=['很快','和我差不多','比我慢'],O2=['会，我看到它出错了','这次没错，但它可能会错','不会出错'];
 const racePoll=()=>poll($('#l13-r-poll'),[
  {q:'AI 的思路和你的一样吗？',opts:SAME,get:()=>{const x=lastRun();return x?x.same:null;},set:i=>{const x=lastRun();if(x)x.same=i;}},
  {q:'AI 解题的速度快吗？',opts:O1,get:()=>R.o.fast,set:i=>{R.o.fast=i;}},
  {q:'AI 会算错吗？',opts:O2,get:()=>R.o.err,set:i=>{R.o.err=i;}}]);
 function drawAI(pop){const r=S.r;if(!r||!r.ai)return;const P=r.P,a=r.ai,run=r.run||{};const errMode=a.ok===false&&a.bad;const unit=P.u&&a.raw&&!/[一-龥]/.test(a.raw)?' '+esc(P.u):'';
  const html=`<div class="big">${a.raw?esc(a.raw)+unit:'没给出答案'} · ${sec(a.ms)}</div>${a.bad?DEMO_LBL:''}<p class="note">${errMode?(run.es?'出错的一步已经标红。':'每一步算式都没算错，答案却不对。点出出错的那一步！'):'点一步：哪一招最值得你学？'}</p>${stepsHTML(a.steps,{cls:'click',sel:errMode?-1:(run.br!=null?run.br:-1),bad:errMode&&run.es?P.bad.err:-1})}`;
  if(pop)App.aiSay('#l13-r-ai',html,{mood:a.ok===false?'oops':'happy',src:a.mode});else $('#l13-r-ai .ai-body').innerHTML=html;
  $$('#l13-r-ai [data-si]').forEach(li=>li.onclick=()=>{const i=+li.dataset.si;const run2=r.run;
   if(!run2){App.fb('#l13-r-fb','try','先自己答一道','写了答案再比，才能收集 AI 的招式。');return;}
   if(errMode){if(i===P.bad.err){run2.es=1;App.fb('#l13-r-fb','ok','你发现 AI 的错误了！',esc(P.bad.why),{stars:3,cheer:true});}else{run2.et=(run2.et||0)+1;const calc=a.steps[i][0]===T3;
     App.fb('#l13-r-fb','try',calc?'这一步照它的公式算，没算错':'这一步没问题',run2.et>=2?'提示：梯形的面积 =（上底 + 下底）× 高 ÷ 2。对照一下，看贴着「运用规则」的那一步。':'问题出在更前面。再看看：它用的公式对吗？');}}
   else{run2.br=i;run2.bt=clip(a.steps[i][1],60);App.fb('#l13-r-fb','find','记下这一招！',`「${esc(a.steps[i][0]||'步骤')}」：${esc(cut(a.steps[i][1],40))}`,{stars:run2.ok?3:2});}
   App.touch();drawAI(false);marks1();showAfter(s1,run2.br!=null||!!run2.es);});}
 rGo.onclick=async()=>{const r=S.r;if(!r||r.ph==='ai')return;
  if(r.ph==='done'){const ord=['p1','p2','p3','p4','rnd'];raceNew(ord[Math.min(ord.length-1,ord.indexOf(r.id)+1)]);App.fb('#l13-r-fb','find','新的一道题！','先自己算，写下答案，再和 AI 比。');try{rAns.focus({preventScroll:true});}catch(e){}return;}
  const a=rAns.value.trim();if(a&&!parseAns(a)){App.fb('#l13-r-fb','try','答案里要有一个数','比如 19、3/4、0.75。');return;}
  const P=r.P;const c=a?check(a,P):null;const myMs=Math.round(elapsed());r.t0=null;r.ph='ai';r.my=a?{ans:clip(a,20),ok:c.ok,ms:myMs,note:c.note||''}:null;$('#l13-r-mt').textContent=sec(myMs);rAns.disabled=true;
  App.busy(rGo,true,'AI 正在解…');const show=(st,tail)=>App.aiSay('#l13-r-ai',stepsHTML(st)+(tail?`<p class="note">${tail}</p>`:''),{busy:true});show([],'正在读题……');
  const t0=performance.now();let res=null,mode='offline',bad=null;
  try{const prompt=`请你解一道小学${P.g||myG()}年级的数学题，写给小学生看。按下面的格式输出，每行一步，最多 6 步，不要输出其他内容：\n步骤1｜拆解问题｜（已知什么、求什么）\n步骤2｜运用规则｜（用到的公式、运算顺序或定律）\n步骤3｜逐步求解｜（算式和结果）\n……\n答案｜（只写最终结果的数，可以带单位）\n题目：${P.q}`;
   const out=await ask('race',prompt,{tier:'quick',onText:({text})=>{const p=parseSteps(text);show(p.steps,`已写出 ${p.steps.length} 步……`);}});
   if(out&&out.text){const p=parseSteps(out.text);if(p.steps.length){res={steps:p.steps,ans:p.ans,raw:p.raw};mode=out.mode||App.AI.mode();}else App.toast('AI 这次没有按格式作答，改用离线示例');}
   if(!res){bad=P.id==='p4'?P.bad:null;const st=bad?bad.steps:P.steps;await fake(st.length,i=>show(st.slice(0,i),i<st.length?'正在一步步写……':''),'race',480);res={steps:st,ans:bad?bad.ans:P.ans,raw:fmt(bad?bad.ans:P.ans)};}}
  catch(e){r.ph='idle';r.acc=myMs;r.t0=visible(s1)?performance.now():null;rAns.disabled=false;App.busy(rGo,false);aiWait('#l13-r-ai','已停止。再按一次大按钮重新比。');return;}
  const ms=Math.round(performance.now()-t0);const aiOk=res.ans?qeq(res.ans,P.ans):null;r.ai={steps:res.steps,ans:res.ans,raw:res.raw,mode,ms,ok:aiOk,bad:!!bad};r.ph='done';r.run=null;
  const errMode=aiOk===false&&!!bad;const right=`正确答案是 ${esc(ansTxt(P))}${P.u?' '+esc(P.u):''}。`;
  if(r.my){bump();const l=App.lesson(K);l.race.runs.push({p:P.id==='rnd'?'rnd:'+P.kp:P.id,k:clip(P.kind,16),q:clip(P.q,120),my:r.my.ans,ok:r.my.ok?1:0,ms:r.my.ms,am:mode,at:ms,ao:aiOk==null?null:aiOk?1:0,sn:res.steps.length,bad:bad?1:0});
   if(l.race.runs.length>8)l.race.runs.shift();r.run=l.race.runs[l.race.runs.length-1];if(!r.my.ok)bankFrom(P,r.my.ans,'race');App.touch();}
  drawAI(true);rGo.dataset.label='换一道再比';App.busy(rGo,false);rGo.classList.add('again');showAfter(s1,false);
  if(!r.my)App.fb('#l13-r-fb','try','AI 先交卷了！','这次你没写答案，不算成绩。换一道题，先自己算再比。',{stars:0});
  else if(aiOk===false&&r.my.ok)App.fb('#l13-r-fb','oops','AI 算错了，你算对了！',errMode?'它每一步算式都没算错，答案却不对。点出出错的那一步！':right+'看看它的步骤，错在哪里？',{stars:2,cheer:true});
  else if(aiOk===false)App.fb('#l13-r-fb','oops','AI 也算错了！',right+(errMode?'先点出 AI 出错的那一步。':'你的题已存进错题银行。'),{stars:1});
  else if(r.my.ok)App.fb('#l13-r-fb','ok',`都对了！你 ${sec(r.my.ms)}，AI ${sec(ms)}`,(aiOk==null?'（平台没读出 AI 的最终答案，自己核对一下。）':'')+'比的是思路：点一步，哪一招最值得你学？',{stars:2});
  else if(aiOk==null)App.fb('#l13-r-fb','try','这道题你没算对',right+'已存进错题银行。平台没读出 AI 的最终答案，对照它的步骤自己核对，再点一步你想学的。',{stars:1});
  else App.fb('#l13-r-fb','try','这道题 AI 赢了',right+'已存进错题银行。对照它的步骤，点出你想学的那一步。',{stars:1});
  marks1();racePoll();refreshBank();};
 rAns.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();rGo.click();}});
 function marks1(){const runs=App.lesson(K).race.runs||[];if(runs.length)App.markStep(s1,0);if(runs.some(x=>x.br!=null||x.es))App.markStep(s1,1);}
 raceNew('p1');clearFb('#l13-r-fb');if(L._io)L._io.observe(s1);racePoll();marks1();

 /* ===== EXP-02 私人出题机 ===== */
 const C=GN.cfg;C.g=clamp(+C.g||myG(),4,6);C.say=C.say==='0'?'0':'1';
 const ptxt=()=>C.say==='0'?'出一道数学题。':`我是小学 ${C.g} 年级学生，请出一道与「${KP[C.kp].n}」有关的${TYPES[C.type]}。`;
 function drawCfg(){const kps=KPSEL[C.g];if(!kps.includes(C.kp))C.kp=kps[0];if(!KP[C.kp].t.includes(C.type))C.type=KP[C.kp].t[0];
  const rows=[['说法',App.seg('gsay',[['1','说具体'],['0','只说“出道题”']],C.say)]];
  if(C.say!=='0')rows.push(['年级',App.seg('gg',[4,5,6].map(g=>[g,g+' 年级']),C.g)],['知识点',App.seg('gkp',kps.map(k=>[k,KS[k]]),C.kp),'选你最没把握的'],['题型',App.seg('gty',KP[C.kp].t.map(t=>[t,TYPES[t]]),C.type)]);
  $('#l13-g-knobs').innerHTML=App.knobs(rows);$('#l13-g-pt').textContent=ptxt();
  const set=(k,f)=>App.segWire(s2,k,v=>{f(v);App.touch();drawCfg();});set('gsay',v=>{C.say=v;});set('gg',v=>{C.g=+v;});set('gkp',v=>{C.kp=v;});set('gty',v=>{C.type=v;});}
 const lastSet=()=>{const a=App.lesson(K).gen.sets;return a[a.length-1]||null;};
 const combosOf=()=>new Set(App.lesson(K).gen.sets.filter(s=>!s.vague).map(s=>s.kp+'|'+s.type)).size;
 const progQ=(g,kp,type)=>{const P=genP(kp,g,type);return {q:P.q,a:ansTxt(P),an:anOf(P.ans),u:P.u,pct:P.pct?1:0,src:'p',kp:P.kp,sub:P.sub,t:P.type,st:P.steps.map(s=>s[0]+'｜'+s[1])};};
 async function makeSet(o){let g=+o.g,kp=o.kp,type=o.type,q=null,mode='offline';
  const fmtJ='只输出 JSON：{"q":"题目","answer":"最终答案，只写一个数（整数、小数或分数如 3/4；百分数写成 25%），不写单位","unit":"单位，没有就写空字符串","steps":["解题思路第1步","第2步"]}';
  const prompt=o.vague?`出一道数学题。题目要条件完整、只有一个确定的答案，内容健康。\n${fmtJ}`:`我是小学${g}年级学生。请出 1 道与「${KP[kp].n}」有关的${TYPES[type]}，难度适合我。题目要条件完整、只有一个确定的答案，内容适合小学生。\n${fmtJ}`;
  const out=await ask('gen',prompt,{json:true,tier:'quick'});
  if(out&&out.data){let x=out.data;if(Array.isArray(x))x=x[0];else if(Array.isArray(x.questions))x=x.questions[0];
   if(x&&typeof x.q==='string'&&A(x.q).length>=4){const qt=clip(x.q,200);const aiA=parseRaw(String(x.answer??''));const ps=autoSolve(qt);const ans=ps||aiA;
    q={q:qt,a:ans?fmt(ans,/\//.test(String(x.answer))?'frac':''):'',an:anOf(ans),u:clip(x.unit||'',6),pct:/%/.test(String(x.answer))?1:0,src:ps?'p':aiA?'a':'',aa:clip(String(x.answer??''),20),x:ps&&aiA&&!qeq(ps,aiA)?1:0,st:Array.isArray(x.steps)?x.steps.slice(0,5).map(s=>clip(s,80)):[]};mode=out.mode||App.AI.mode();}
   else App.toast('AI 这次出的题格式不对，改用离线出题程序');}
  if(!q){await sleep(700);if(o.vague){g=pick([4,5,6].filter(x=>x!==g));kp=pick(kpOf(g));type=pick(KP[kp].t);}q=progQ(g,kp,type);}
  const G2=App.lesson(K).gen;G2.sets.forEach(s=>s.qs.forEach(x=>{delete x.st;}));const set={g,kp,type,m:mode,ts:Date.now(),qs:[q]};if(o.vague)set.vague=1;
  G2.sets.push(set);if(G2.sets.length>6)G2.sets.shift();bump();App.touch();return set;}
 const genOut=s=>{const q=s.qs[0];App.aiSay('#l13-g-ai',`<div class="l13-aq">${esc(q.q)}</div><p class="note">${s.m==='offline'?`这是 ${s.g} 年级 · ${esc(KP[s.kp].n)} · ${TYPES[s.type]}。`:''}先别急着问答案，下一站自己解。</p>`,{mood:s.vague&&s.m==='offline'?'oops':'happy',src:s.m});};
 const bothWays=()=>{const a=App.lesson(K).gen.sets;return a.some(s=>s.vague)&&a.some(s=>!s.vague);};
 const genStars=()=>{const a=App.lesson(K).gen.sets;return !a.length?0:!bothWays()?1:combosOf()>=2?3:2;};
 const genLog=()=>{const a=App.lesson(K).gen.sets.slice(-4);$('#l13-g-log').innerHTML=a.length?`<small class="note">我的出题记录</small><ol class="l13-steps">${a.map(s=>`<li><span class="l13-tg ${s.vague?'t2':'t3'}">${s.vague?'只说“出道题”':'说具体'}</span><span>${esc(cut(s.qs[0].q,34))}${s.m==='offline'?`<span class="note">（${s.g} 年级 · ${esc(KS[s.kp]||'')}）</span>`:''}</span></li>`).join('')}</ol>`:'';};
 const genPoll=()=>poll($('#l13-g-poll'),[
  {q:'AI 出的题符合你的要求吗？',opts:['符合','部分符合','不符合'],get:()=>GN.o.fit,set:i=>{GN.o.fit=i;}},
  {q:'难度合适吗？',opts:['太容易','合适','太难'],get:()=>GN.o.diff,set:i=>{GN.o.diff=i;}},
  {q:'比起通用练习册，这样出题更有针对性吗？',opts:['更有针对性','差不多','说不清'],get:()=>GN.tc,set:i=>{GN.tc=i;}}],marks2);
 $('#l13-g-go').onclick=async()=>{const b=$('#l13-g-go');const vague=C.say==='0';App.busy(b,true,'AI 正在出题…');App.aiSay('#l13-g-ai','正在想一道题……',{busy:true});let s;
  try{s=await makeSet({g:C.g,kp:C.kp,type:C.type,vague});}catch(e){App.busy(b,false);aiWait('#l13-g-ai','已停止。再按一次大按钮。');return;}
  if(!vague)App.lesson(K).gen.weak=C.kp;App.touch();genOut(s);const n=combosOf();
  const both=bothWays(),st=genStars();genLog();
  if(both)App.fb('#l13-g-fb','ok','两种说法都试过了！',`看左边的出题记录比一比：哪种说法出的题更适合你？${st>=3?'下一站，自己解这道题。':'再换个知识点出一道，拿 3 星。'}`,{stars:st});
  else if(vague)App.fb('#l13-g-fb',s.m==='offline'?'oops':'find',s.m==='offline'?'AI 只能瞎猜！':'这道题适合你吗？',(s.m==='offline'?`你没说年级和想练什么，它猜了 ${s.g} 年级的「${esc(KS[s.kp])}」。`:'你没说年级和想练什么，AI 只能猜。')+'在「说法」里点“说具体”，再出一道比一比。',{stars:st});
  else App.fb('#l13-g-fb','find',`出好了：${s.g} 年级 · ${esc(KS[s.kp])}`,'现在在「说法」里点“只说‘出道题’”，看 AI 会出什么。',{stars:st});
  App.busy(b,false);b.classList.add('again');marks2();genPoll();pickCs(true);};
 function marks2(){const g=App.lesson(K).gen;if(g.sets.length)App.markStep(s2,0);if(bothWays())App.markStep(s2,1);}
 drawCfg();genPoll();genLog();marks2();if(GN.sets.length){App.ran(s2);genOut(lastSet());}

 /* ===== EXP-02b AI 批改台 ===== */
 const cin=$('#l13-c-ans'),cgo=$('#l13-c-go');
 const GR=['正确','有错误','自己判断不了，请教老师'];
 function pickCs(fresh){const s=lastSet();if(s&&(!s.graded||!S.cs||fresh))S.cs=s;else if(!S.cs)S.cs={g:C.g,kp:C.kp,type:C.type,m:'offline',ts:Date.now(),qs:[progQ(C.g,C.kp,C.type)],local:1};drawC();}
 const stPairs=q=>(q.st||[]).map(x=>{const m=/^([^｜]{2,6})｜(.*)$/.exec(x);return m?[m[1],m[2]]:['',x];});
 const gradeOut=(s,q)=>{const st=stPairs(q);App.aiSay('#l13-c-ai',`<div class="big">${q.ai?'✓ 判你对':'✗ 判你错'}</div><p>${esc(q.cm||'')}</p>${q.an2?`<p class="note">思路分析：${esc(q.an2)}</p>`:''}${st.length?`<details class="l13-more"><summary>看解题步骤</summary>${stepsHTML(st)}</details>`:''}`,{mood:q.ai?'happy':'think',src:s.gm||'offline'});};
 function drawGr(){const g=App.lesson(K).gen,s=S.cs,q=s&&s.qs[0];$('#l13-c-gr').innerHTML=GR.map((t,i)=>`<button type="button" class="chip ${q&&q.gr===i?'on':''}" data-i="${i}">${t}</button>`).join('');
  $$('#l13-c-gr .chip').forEach(b=>b.onclick=()=>{if(!q||!s.graded)return;const i=+b.dataset.i;if(q.gf==null)q.gf=i;q.gr=i;g.o.gr=i;App.touch();drawGr();marks2b();
   if(q.src==='p'&&q.pf!=null){const aiRight=q.pf===q.ai;const rev=`平台精确核对：正确答案是 ${esc(q.a)}${q.u?' '+esc(q.u):''}，你的答案${q.pf?'是对的':'不对'}，所以 AI ${aiRight?'批对了':'批错了'}。${q.pf?'':'这道题已存进错题银行。'}${q.x?`AI 出题时给的答案是 ${esc(q.aa)}，它出题也会出错。`:''}`;
    if(i===2)App.fb('#l13-c-fb','find','请教老师也是好办法',rev,{stars:2});
    else if((i===0)===aiRight)App.fb('#l13-c-fb','ok',aiRight?'判断对了！':'你发现 AI 批错了！',rev+(q.pf?'':'自己做对再判断对，拿 3 星。'),{stars:q.pf?3:2,cheer:!aiRight});
    else App.fb('#l13-c-fb','try','再看一眼',rev,{stars:1});}
   else App.fb('#l13-c-fb','find','记下了','这道题平台算不了。把答案代回题目检验，或请教老师。',{stars:2});});}
 function drawC(){const s=S.cs;if(!s)return;const q=s.qs[0];$('#l13-c-meta').textContent=`${s.g} 年级 · ${KP[s.kp]?KP[s.kp].n:''}${s.m!=='offline'?' · AI 出的题':''}`;$('#l13-c-q').textContent=q.q;
  cin.value=q.my||'';cin.disabled=!!s.graded;clearFb('#l13-c-fb');drawGr();cgo.dataset.label=s.graded?'换一道再练':'交给 AI 批改';cgo.textContent=cgo.dataset.label;cgo.classList.toggle('again',!!s.graded);$('#l13-c-new').hidden=!!s.graded;
  if(s.graded){gradeOut(s,q);showAfter(s2b,true);App.ran(s2b);}else{aiWait('#l13-c-ai','写好答案交上来，AI 来批改');showAfter(s2b,false);}}
 $('#l13-c-new').onclick=async()=>{const b=$('#l13-c-new');if(b.disabled)return;b.disabled=true;aiWait('#l13-c-ai','正在出一道新题……');
  try{const s=await makeSet({g:C.g,kp:C.kp,type:C.type,vague:false});App.lesson(K).gen.weak=App.lesson(K).gen.weak||C.kp;S.cs=s;genOut(s);genLog();App.ran(s2);marks2();}catch(e){}b.disabled=false;drawC();};
 cgo.onclick=async()=>{const s=S.cs;if(!s)return;const q=s.qs[0];
  if(s.graded){$('#l13-c-new').hidden=false;$('#l13-c-new').click();return;}
  const val=cin.value.trim();if(!val||!parseAns(val)){App.aiSay('#l13-c-ai','我等你的答案呢。先自己算，没把握也写一个数。',{mood:'think'});showAfter(s2b,false);App.fb('#l13-c-fb','try','先写下你的答案','自己先做，再让 AI 批改，这样才学得到。');return;}
  q.my=clip(val,20);App.busy(cgo,true,'AI 正在批改…');App.aiSay('#l13-c-ai','正在看你的答案……',{busy:true});let res=null,gm='offline';
  try{const prompt=`你是一位小学数学老师，请批改下面这道题。判断学生的最终答案是否正确（数值相等就算对，比如 0.5 和 1/2），写一句评语，再用不超过 60 个字分析解题思路。\n只输出 JSON：{"correct":true,"comment":"评语","analysis":"思路分析"}\n题目：${q.q}\n学生的答案：${q.my}`;
   const out=await ask('grade',prompt,{json:true,tier:'quick'});
   if(out&&out.data){let x=out.data;if(Array.isArray(x))x=x[0];else if(Array.isArray(x.results))x=x.results[0];if(x&&typeof x==='object'&&('correct' in x||'ok' in x)){res=x;gm=out.mode||App.AI.mode();}else App.toast('AI 的批改格式不对，改用离线批改程序');}
   if(!res)await sleep(700);}
  catch(e){App.busy(cgo,false);aiWait('#l13-c-ai','已停止。再按一次大按钮。');return;}
  const ref=fromAn(q.an);const c=ref?check(q.my,{ans:ref,pct:!!q.pct}):{ok:false};q.pf=ref?(c.ok?1:0):null;
  if(res){q.ai=(res.correct===true||res.correct==='true'||res.ok===true)?1:0;q.cm=clip(res.comment||'',80);q.an2=clip(res.analysis||'',120);}
  else{q.ai=q.pf?1:0;q.cm=q.pf?`做对了。${c.note||''}`:`不对，正确答案是 ${q.a}${q.u?' '+q.u:''}。`;q.an2=q.pf?'':diag(parseRaw(q.my),ref);}
  q.ok=q.src==='p'?q.pf:q.ai;const l=App.lesson(K);
  if(s.local){delete s.local;l.gen.sets.push(s);if(l.gen.sets.length>6)l.gen.sets.shift();}
  if(!q.ok){const P={q:q.q,kp:q.kp||s.kp,sub:q.kp?q.sub:undefined,g:s.g,type:q.t||s.type,ans:ref,u:q.u,pct:q.pct,show:q.a};bankFrom(P,q.my,'gen');if(!q.kp&&l.bank[0])l.bank[0].ai=1;}
  s.graded=1;s.gm=gm;bump();App.touch();cin.disabled=true;gradeOut(s,q);showAfter(s2b,true);App.busy(cgo,false);
  drawC();App.fb('#l13-c-fb','find',`AI 判你${q.ai?'对':'错'}。它批得对吗？`,'先别急着信。自己再验算一遍，在下面选一选。',{stars:1});
  marks2b();refreshBank();};
 cin.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();cgo.click();}});
 function marks2b(){const g=App.lesson(K).gen;if(g.sets.some(s=>s.graded))App.markStep(s2b,0);if(g.o.gr!=null&&g.sets.some(s=>s.graded))App.markStep(s2b,1);}
 pickCs();marks2b();

 /* ===== EXP-03 批改验证台 ===== */
 const VOPT={A:['19','59','20'],B:['3/4','4/3','3/7']};const CC=['我的答案对，AI 批错了','我的答案不对，AI 说得对','我和 AI 的答案都不对'];
 const vAI=(k,v)=>CASES[k].ai(parseRaw(v.my),v.my);
 const verAIOut=(k,v,pop)=>{const g=vAI(k,v);const html=`<div class="big">${g.ok?'✓ 判你对':'✗ 判你错'}</div><p>${esc(g.txt.replace(/^[✓✗]\s*(正确|错误)[。，]?\s*/,''))}</p>${DEMO_LBL}`;
  if(pop)App.aiSay('#l13-v-ai',html,{mood:g.ok?'happy':'think',src:'offline'});else{App.aiSay('#l13-v-ai',html,{mood:g.ok?'happy':'think',src:'offline'});}};
 const vlogHTML=v=>v.my&&v.ch.length?`<small class="note">验证记录（平台精确计算）</small>${v.ch.map(x=>String(x.t).split('；').map(t=>`<div class="l13-v ${/✓/.test(t)?'ok':/✗/.test(t)?'no':'mid'}">${esc(t)}</div>`).join('')).join('')}`:'';
 const drawVlog=()=>{};
 const verify=(k,m)=>{const c=CASES[k],v=VR[k];const my=parseRaw(v.my),myOk=qeq(my,c.ans);let t,ok=myOk;
  if(k==='A'&&m==='sub'){t=[...new Set([v.my,'59'])].map(x=>{const r=qa(parseRaw(x),I(20));return `a = ${x} 时，a + 20 = ${fmt(r)}，${qeq(r,I(39))?'等于 39 ✓':'不等于 39 ✗'}`;}).join('；');}
  else if(k==='A'){t='已知 a + 20 = 39，求 a 用减法：39 − 20 = 19';}
  else if(m==='cmp'){ok=qeq(my,c.aiAns);t=`${v.my} ${term(my.d)?'= '+fmtDec(my):'≈ '+(my.n/my.d).toFixed(3)}；AI 说的 0.75 = 3/4。两个数${ok?'一样大 ✓ 只是写法不同':'不相等 ✗'}`;}
  else{t='3 千克平均分给 4 人：3 ÷ 4 = 3/4（千克）';}
  v.ch=v.ch.filter(x=>x.k!==m);v.ch.push({k:m,t,ok:ok?1:0});if(v.ch.length>6)v.ch.shift();};
 function liveVerHTML(lv,myOk){const right=lv.s==null?null:(lv.s===1)===myOk;return `<p class="note">来源：${esc(srcOf(lv.m))}</p><p>${esc(lv.t)}</p><div class="l13-v ${right?'ok':right===false?'no':'mid'}">平台核对：${right?'这一次真实 AI 判断正确。':right===false?'这一次真实 AI 判错了！':'没能读出它的判断，自己看一看。'}</div>`;}
 function drawVflow(){const k=S.vc,c=CASES[k],v=VR[k],box=$('#l13-v-flow');if(!v.my){box.innerHTML='';return;}const myOk=qeq(parseRaw(v.my),c.ans),g=vAI(k,v),truth=verTruth(k,{ok:myOk});
  const stage=!v.c1?1:(!v.ch.length||S.vmore)?2:3;const M=k==='A'?[['sub','代回题目检验'],['alt','换一种方法算']]:[['cmp','比较两个数的大小'],['alt','换一种方法算']];
  box.innerHTML=(stage>1?vlogHTML(v):'')+(stage===1?`<div class="ask">AI 说你${g.ok?'对了':'错了'}。你信吗？</div><div class="opts">${[['t','相信 AI'],['v','想办法验证']].map(([x,t])=>`<button type="button" class="chip" data-c1="${x}">${t}</button>`).join('')}</div>`
   :stage===2?`<div class="ask">选一种办法，平台帮你精确算</div><div class="opts">${M.map(([x,t])=>`<button type="button" class="chip ${v.ch.some(h=>h.k===x)?'on':''}" data-vm="${x}">${t}</button>`).join('')}</div>`
   :`<div class="ask">验证完了，你的结论是？</div><div class="opts">${CC.map((t,i)=>`<button type="button" class="chip ${v.cc===i?'on':''}" data-cc="${i}">${t}</button>`).join('')}</div><div class="row"><button type="button" class="btn ghost sm" data-more>换个办法再验证</button>${App.AI.real()&&v.cc!=null?'<button type="button" class="btn ghost sm" data-live>让真实 AI 也批一次</button>':''}</div><div id="l13-v-lo">${v.lv?liveVerHTML(v.lv,myOk):''}</div>`);
  $$('[data-c1]',box).forEach(b=>b.onclick=()=>{const x=b.dataset.c1;if(!v.c1f)v.c1f=x;v.c1=x;App.touch();
   if(x==='v')App.fb('#l13-v-fb','ok','好习惯：先验证！','选一种验证办法，让平台帮你精确计算。');else App.fb('#l13-v-fb','try','先别急着信！','AI 也会批错。还是验证一下吧。');drawVflow();});
  $$('[data-vm]',box).forEach(b=>b.onclick=()=>{verify(k,b.dataset.vm);S.vmore=false;App.touch();App.fb('#l13-v-fb','find','验证结果出来了','看下面的验证记录，再下结论。');drawVlog();drawVflow();});
  $$('[data-cc]',box).forEach(b=>b.onclick=()=>{const i=+b.dataset.cc;if(v.ccf==null)v.ccf=i;v.cc=i;App.touch();const ans=`正确答案是 ${esc(fmt(c.ans,k==='B'?'frac':''))}${c.u?' '+c.u:''}。`;
   if(i===truth)App.fb('#l13-v-fb','ok',myOk&&!g.ok?'你验证出 AI 批错了！':'结论正确！',ans+esc(myOk||k==='A'?c.why:'AI 给的 0.75 和 3/4 一样大，不过题目要求用分数表示；你选的答案不对。'),{stars:v.c1f==='v'&&v.ccf===truth?3:2,cheer:true});
   else App.fb('#l13-v-fb','try','再看看验证记录','平台算出的结果说明了什么？换一个结论试试。',{stars:1});drawVflow();marks3();});
  const mo=$('[data-more]',box);if(mo)mo.onclick=()=>{S.vmore=true;drawVflow();};
  const lb=$('[data-live]',box);if(lb)lb.onclick=async()=>{lb.disabled=true;const o=$('#l13-v-lo',box);o.innerHTML='<p class="note">真实 AI 正在批改……</p>';
   try{const out=await ask('ver',`请批改一道小学数学题。\n题目：${c.q}\n学生的答案：${v.my}${c.u?' '+c.u:''}\n先写“正确”或“错误”，再用一句话说明理由（不超过 50 字）。`,{tier:'quick'});
    if(out&&out.text){const t=out.text;const said=/错误|不正确|不对/.test(t.slice(0,12))?0:/正确|对/.test(t.slice(0,12))?1:null;v.lv={m:out.mode||App.AI.mode(),t:clip(t,160),s:said};bump();App.touch();}}catch(e){}drawVflow();};}
 function drawVer(){const k=S.vc,c=CASES[k],v=VR[k];S.vmore=false;$('#l13-v-kind').textContent=c.t.split('：')[0];$('#l13-v-q').textContent=c.q;
  $('#l13-v-opts').innerHTML=App.seg('vmy',VOPT[k].map(o=>[o,o+(c.u?' '+c.u:'')]),v.my||'');App.segWire(s3,'vmy',()=>{});clearFb('#l13-v-fb');
  if(v.my){verAIOut(k,v,false);showAfter(s3,true);App.ran(s3);}else{aiWait('#l13-v-ai','选好答案，交给 AI 批改');showAfter(s3,false);}drawVlog();drawVflow();}
 App.segWire(s3,'vc',x=>{S.vc=x;drawVer();});
 $('#l13-v-go').onclick=async()=>{const k=S.vc,c=CASES[k],old=VR[k],b=$('#l13-v-go');const val=App.segVal(s3,'vmy');
  if(!val){App.aiSay('#l13-v-ai','先选一个答案交给我。',{mood:'think'});showAfter(s3,false);App.fb('#l13-v-fb','try','先选你的答案','自己先算一算，再让 AI 批改。');return;}
  const v={my:val,ok:qeq(parseRaw(val),c.ans)?1:0,ch:[]};if(old.c1f)v.c1f=old.c1f;if(old.ccf!=null)v.ccf=old.ccf;App.lesson(K).ver[k]=v;S.vmore=false;
  if(!v.ok)bankFrom(Object.assign({},c,{kp:k==='A'?'eq':'share',sub:k==='A'?'x+a':'s',g:myG(),type:k==='A'?'calc':'word',pct:0,show:fmt(c.ans,k==='B'?'frac':'')}),val,'ver');bump();App.touch();
  App.busy(b,true,'AI 正在批改…');App.aiSay('#l13-v-ai','正在看你的答案……',{busy:true});await sleep(600);App.busy(b,false);b.classList.add('again');
  const g=vAI(k,v);verAIOut(k,v,true);showAfter(s3,true);App.fb('#l13-v-fb','find',g.ok?'AI 说你对了！':'AI 说你错了！',`先别急着${g.ok?'高兴':'改答案'}。在下面选一选：信它，还是验证？`,{stars:1});drawVlog();drawVflow();marks3();refreshBank();};
 function marks3(){const V=App.lesson(K).ver;const any=f=>['A','B'].some(k=>f(V[k]||{}));if(any(v=>v.my))App.markStep(s3,0);if(any(v=>v.cc!=null))App.markStep(s3,1);}
 drawVer();marks3();

 /* ===== EXP-04 错题银行 ===== */
 const SAMPLE=[{src:'demo',kp:'area',sub:'trap',g:5,type:'word',q:'一个梯形的上底是 6 厘米，下底是 10 厘米，高是 5 厘米，面积是多少平方厘米？',my:'80',a:'40',an:[40,1],u:'平方厘米'},
  {src:'demo',kp:'frac',sub:'add',g:5,type:'calc',q:'计算：1/2 + 1/3',my:'2/5',a:'5/6',an:[5,6],u:''},
  {src:'demo',kp:'chick',sub:'rab',g:5,type:'word',q:'笼子里有若干只鸡和兔。从上面数，有 10 个头；从下面数，有 32 只脚。兔有多少只？',my:'4',a:'6',an:[6,1],u:'只'}];
 window.__l13sample=SAMPLE;
 const SRC={race:'人机赛跑',gen:'AI 批改台',ver:'批改验证台',wu:'速算擂台',demo:'示例错题'};
 const bankList=()=>{const B=App.lesson(K).bank;return B.length?B.slice(0,6):SAMPLE.map((e,i)=>Object.assign({id:'demo'+i,virtual:1,n:0,ok:0,sk:0},e));};
 const curB=()=>{const li=bankList();return li.find(e=>e.id===S.bs)||li.find(e=>!e.done)||li[0];};
 const realB=e=>{if(!e.virtual)return e;const c=Object.assign({},e);delete c.virtual;delete c.id;addBank(c);const n=App.lesson(K).bank.find(x=>x.q===e.q);if(S.bv&&S.bv.id===e.id)S.bv.id=n.id;S.bs=n.id;return n;};
 const simOut=(v,done)=>App.aiSay('#l13-b-ai',`<div class="l13-aq">${esc(v.q)}</div>${done?`<div class="big">${v.res.ok?'✓ 做对了':'正确答案：'+esc(v.a)+(v.u?' '+esc(v.u):'')}</div>${v.res.ok?'':stepsHTML(v.steps||[])}`:''}`,{mood:done?(v.res.ok?'happy':'think'):'think',src:'平台出题程序'});
 function refreshBank(){const li=bankList(),e=curB();S.bs=e.id;
  $('#l13-b-knobs').innerHTML=App.knobs([['错题',App.seg('bk',li.map((x,i)=>[x.id,`${i+1} ${KS[x.kp]||'题'}${x.done?' ✓':''}`]),e.id)],['错因',App.seg('bw',WHY.map((w,i)=>[i,w]),e.why==null?'':e.why),'你当时错在哪']]);
  App.segWire(s4,'bk',v=>{S.bs=v;S.bv=null;aiWait('#l13-b-ai','相似题会出现在这里');showAfter(s4,false);clearFb('#l13-b-fb');refreshBank();});
  App.segWire(s4,'bw',v=>{const x=realB(curB());x.why=+v;App.touch();refreshBank();});
  const hint=e.an?diag(parseRaw(e.my),fromAn(e.an)):'';
  $('#l13-b-card').innerHTML=`<small>${SRC[e.src]||'错题'} · ${esc(KP[e.kp]?KP[e.kp].n:'')}</small><div class="l13-qt">${esc(e.q)}</div>
   <div class="row"><span>我写的 <b class="l13-no">${esc(e.my)}</b></span><span>正确答案 <b class="l13-ok">${esc(e.a)}${e.u?' '+esc(e.u):''}</b></span></div>${hint?`<p class="note">${esc(hint)}</p>`:''}
   <div class="l13-dots"><span>${e.done?'已掌握':'连对'}</span><i class="${e.done||e.sk>=1?'on':''}"></i><i class="${e.done||e.sk>=2?'on':''}"></i></div>`;marks4();}
 const bAns=$('#l13-b-ans');
 $('#l13-b-go').onclick=()=>{const e=curB();const P=genP(KP[e.kp]?e.kp:'mix',e.g||myG(),e.type,{sub:e.sub});S.bv={id:e.id,q:P.q,a:ansTxt(P),an:anOf(P.ans),u:P.u,pct:P.pct,steps:P.steps};bump();
  simOut(S.bv,false);showAfter(s4,true);bAns.value='';bAns.disabled=false;$('#l13-b-chk').disabled=false;$('#l13-b-go').classList.add('again');
  App.fb('#l13-b-fb','find','相似题来了！','先自己算，把答案写在上面的框里，再点「对答案」。');try{bAns.focus({preventScroll:true});}catch(e){}};
 const bChk=()=>{const v=S.bv;if(!v||v.res){App.toast('按大按钮，出一道新的相似题');return;}const val=bAns.value.trim();if(!val){App.toast('先写下你的答案');return;}
  const e=realB(curB());const r=check(val,{ans:fromAn(v.an),pct:!!v.pct});v.my=val;v.res={ok:r.ok};e.n=(e.n||0)+1;if(r.ok){e.ok=(e.ok||0)+1;e.sk=(e.sk||0)+1;if(e.sk>=2)e.done=1;}else e.sk=0;App.touch();
  bAns.disabled=true;$('#l13-b-chk').disabled=true;simOut(v,true);refreshBank();
  if(r.ok&&e.done)App.fb('#l13-b-fb','ok','这道错题掌握了！','连对 2 道相似题。换一道错题继续练。',{stars:3});
  else if(r.ok)App.fb('#l13-b-fb','ok','做对了！再对 1 道就掌握',(r.note?esc(r.note)+'。':'')+'按大按钮，再来一道。',{stars:2});
  else App.fb('#l13-b-fb','try','还不对，连对清零',`${esc(diag(parseRaw(val),fromAn(v.an))||'看看上面的解题步骤。')}按大按钮再来一道。`,{stars:1});};
 $('#l13-b-chk').onclick=bChk;bAns.addEventListener('keydown',ev=>{if(ev.key==='Enter'){ev.preventDefault();bChk();}});
 function marks4(){const B=App.lesson(K).bank;if(B.some(e=>e.why!=null))App.markStep(s4,0);if(B.some(e=>e.done))App.markStep(s4,1);}
 refreshBank();

 /* ===== EXP-04b 我当出题人 ===== */
 const mq=$('#l13-m-q'),ma=$('#l13-m-a');mq.value=STARTERS[0];
 App.segWire(s4b,'ms',v=>{mq.value=STARTERS[+v];});
 const okV=m=>m.v==='ok'||m.v==='ai-ok';
 const drawMy=()=>{const M=App.lesson(K).my;$('#l13-m-list').innerHTML=M.length?`<p class="note">我出的题（${M.length}/3）</p><ol class="l13-list">${M.map(m=>`<li>${esc(cut(m.q,36))}　答案 ${esc(m.a)} ${okV(m)?'<b class="l13-ok">✓ 对上了</b>':m.v==='bad'||m.v==='ai-diff'?'<b class="l13-no">对不上</b>':'<span class="note">待同桌核对</span>'}</li>`).join('')}</ol>`:'';};
 $('#l13-m-go').onclick=async()=>{const b=$('#l13-m-go');const q=clip(mq.value,100);
  if(A(q).length<4){App.aiSay('#l13-m-ai','题目呢？写一道题给我。',{mood:'think'});showAfter(s4b,false);App.fb('#l13-m-fb','try','先写一道题','点一个“灵感”，再改一改数字。');return;}
  App.busy(b,true,'AI 正在算…');App.aiSay('#l13-m-ai','正在读你出的题……',{busy:true});const m={q,own:STARTERS.includes(q)?0:1,rv:autoSolve(q),m:'p'};
  try{if(!m.rv){const out=await ask('my',`请解这道小学数学题，最后一行写“答案｜数”（只写数）。题目：${q}`,{tier:'quick'});if(out&&out.text){const p=parseSteps(out.text);m.m=out.mode||App.AI.mode();m.rv=p.ans;m.raw=p.raw;bump();}else m.m='';}
   await sleep(500);}catch(e){App.busy(b,false);aiWait('#l13-m-ai','已停止。再按一次大按钮。');return;}
  S.m=m;App.busy(b,false);b.classList.add('again');ma.value='';ma.disabled=false;$('#l13-m-chk').disabled=false;showAfter(s4b,true);drawMy();
  if(m.rv){App.aiSay('#l13-m-ai','<div class="big">算好了，答案先藏着</div><p>出题人先亮答案，再对一对。</p>',{mood:'happy',src:m.m==='p'?'平台精确计算':m.m});App.fb('#l13-m-fb','find','AI 算好了，答案藏着呢','在上面的框里写出你的答案，点「对答案」。');}
  else{App.aiSay('#l13-m-ai','<div class="big">这道题我算不了</div><p>离线时平台只会算算式和方程。写下你的答案，请同桌做一做来核对。</p>',{mood:'oops',src:'offline'});App.fb('#l13-m-fb','oops','你把平台难住了！','文字应用题要靠人来验算。写下答案，找同桌核对。');}};
 const mChk=()=>{const m=S.m;if(!m||m.done){App.toast('按大按钮，先让 AI 算一算');return;}const a=ma.value.trim();if(!a){App.toast('先写下你的答案');return;}const my=parseRaw(a);
  const v=m.rv?(my&&qeq(m.rv,my)?(m.m==='p'?'ok':'ai-ok'):(m.m==='p'?'bad':'ai-diff')):'?';m.done=1;const r=m.rv?fmt(m.rv):'';
  const l=App.lesson(K);const e={q:m.q,a:clip(a,20),v,r,m:m.m,own:m.own};const at=l.my.findIndex(x=>x.q===m.q);if(at>=0)l.my[at]=e;else{l.my.push(e);if(l.my.length>3)l.my.shift();}App.touch();
  ma.disabled=true;$('#l13-m-chk').disabled=true;drawMy();marks4b();const own=myOwn(l),okN=own.filter(okV).length;const stars=okN>=2?3:okN>=1?2:own.length?1:0;
  if(m.rv)App.aiSay('#l13-m-ai',`<div class="big">我的答案：${esc(r)}</div><p>${okV(e)?'和出题人的答案一样。':'和出题人的答案不一样。'}</p>`,{mood:okV(e)?'happy':'think',src:m.m==='p'?'平台精确计算':m.m});
  if(okV(e)&&!m.own)App.fb('#l13-m-fb','try','对上了！不过这是示例题','改一改数字或情境，变成你自己的题，再考一次。',{stars});
  else if(okV(e))App.fb('#l13-m-fb','ok','答案对上了！出题成功',okN>=2?'你已经出成 2 道题，收进成长日记了。':'再出一道对得上的题，拿 3 星。',{stars});
  else if(v==='?')App.fb('#l13-m-fb','find','题目收下了','这道文字题请同桌做一做，看答案对不对得上。',{stars});
  else App.fb('#l13-m-fb','find','答案对不上！',`你写的是 ${esc(clip(a,20))}，${m.m==='p'?'平台精确计算':'AI 算出来'}是 ${esc(r)}。是题目没说清，还是有人算错了？检查一下，再考一次。`,{stars});};
 $('#l13-m-chk').onclick=mChk;ma.addEventListener('keydown',ev=>{if(ev.key==='Enter'){ev.preventDefault();mChk();}});
 function marks4b(){const own=myOwn(App.lesson(K));if(own.length)App.markStep(s4b,0);if(own.filter(okV).length>=2)App.markStep(s4b,1);}
 drawMy();marks4b();if(myOwn(lr).length)App.ran(s4b);

 /* ===== EXP-05 AI 的盲区 ===== */
 const limN=()=>{const LM=App.lesson(K).lim;return LIM.filter(c=>LM[c.id]&&LM[c.id].w!=null).length;};
 const limStars=()=>{const n=limN();return n>=4?3:n>=2?2:n>=1?1:0;};
 function limTabs(){$$('[data-seg="lc"] .chip',s5).forEach((x,i)=>{const d=App.lesson(K).lim[LIM[i].id];x.textContent=`第 ${i+1} 题${d&&d.w!=null?' ✓':''}`;x.classList.toggle('on',x.dataset.v===S.lc);});}
 function drawCat(){const c=LIM.find(x=>x.id===S.lc),v=App.lesson(K).lim[c.id]||{};limTabs();$('#l13-l-ev').innerHTML=`<small class="note">平台算出的证据</small>${c.ev()}`;
  $('#l13-l-cat').innerHTML=LCAT.map((t,i)=>`<button type="button" class="chip ${v.w===i?'on':''}" data-i="${i}">${t}</button>`).join('');
  $$('#l13-l-cat .chip').forEach(b=>b.onclick=()=>{const i=+b.dataset.i;const o=App.lesson(K).lim[c.id];if(!o)return;if(o.wf==null)o.wf=i;o.w=i;App.touch();drawCat();marks5();const n=limN();
   if(LCAT[i]===c.cat)App.fb('#l13-l-fb','ok',`对！这是「${c.cat.split('：')[0]}」`,esc(c.err)+(n>=4?' 4 道题都判完了！':` 已判 ${n}/4 道，点「下一题」。`),{stars:limStars(),cheer:n>=4});
   else App.fb('#l13-l-fb','try','再看看证据',esc(c.err)+' 这属于哪一类？再选一次。',{stars:limStars()});});
  const at=LIM.indexOf(c),nxt=LIM.find((x,j)=>j>at&&!((App.lesson(K).lim[x.id]||{}).w!=null))||LIM.find(x=>!((App.lesson(K).lim[x.id]||{}).w!=null));
  $('#l13-l-nx').innerHTML=v.w!=null&&nxt&&nxt!==c?'<button type="button" class="btn sm" data-nq>下一题</button>':'';const nb=$('[data-nq]',$('#l13-l-nx'));if(nb)nb.onclick=()=>{S.lc=nxt.id;drawLim();window.scrollTo({top:0,behavior:'smooth'});};
  const lv=$('#l13-l-live');lv.innerHTML=App.AI.real()?`<div class="row"><button type="button" class="btn ghost sm" id="l13-l-lb">让真实 AI 也答一次</button></div><div id="l13-l-lo">${v.lv?`<p class="note">来源：${esc(srcOf(v.lv.m))}</p><p>${esc(v.lv.t)}</p>`:''}</div>`:'';
  const lb=$('#l13-l-lb');if(lb)lb.onclick=async()=>{lb.disabled=true;const o=$('#l13-l-lo');o.innerHTML='<p class="note">真实 AI 正在回答……</p>';
   try{const out=await ask('lim',`请解答这道小学数学题，用不超过 80 个字说明思路，并给出答案。\n题目：${c.q}${c.id==='cube'?'（展开图：第一行 1、2；第二行 3、4，3 在 2 的正下方；第三行 5、6，5 在 4 的正下方）':''}`,{tier:'quick'});
    if(out&&out.text){const l=App.lesson(K);l.lim[c.id].lv={m:out.mode||App.AI.mode(),t:clip(out.text,240)};bump();App.touch();}}catch(e){}drawCat();};}
 const limAIOut=c=>App.aiSay('#l13-l-ai',`<p>${esc(c.ai)}</p>${DEMO_LBL}`,{mood:'oops',src:'offline'});
 function drawLim(){const c=LIM.find(x=>x.id===S.lc),v=App.lesson(K).lim[c.id]||{};
  $('#l13-l-card').innerHTML=`<small>第 ${LIM.indexOf(c)+1} 题 · ${esc(c.ask)}</small><div class="l13-qt">${esc(c.q)}</div>${c.id==='cube'?netSVG(false):''}`;
  limTabs();
  $('#l13-l-opts').innerHTML=App.seg('lg',limOpts(c).map((o,i)=>[i,o]),v.my==null?'':v.my);App.segWire(s5,'lg',()=>{});clearFb('#l13-l-fb');
  if(v.seen||v.my!=null||v.w!=null){limAIOut(c);drawCat();showAfter(s5,true);App.ran(s5);}else{aiWait('#l13-l-ai','先猜一猜，再看 AI 的回答');showAfter(s5,false);}}
 App.segWire(s5,'lc',x=>{S.lc=x;drawLim();});
 $('#l13-l-go').onclick=async()=>{const c=LIM.find(x=>x.id===S.lc),b=$('#l13-l-go');const gv=App.segVal(s5,'lg');const l=App.lesson(K);const o=l.lim[c.id]=Object.assign(l.lim[c.id]||{},{seen:1});
  if(gv!=null&&gv!=='')o.my=+gv;bump();App.touch();App.busy(b,true,'AI 正在想…');App.aiSay('#l13-l-ai','正在读题……',{busy:true});await sleep(600);App.busy(b,false);b.classList.add('again');
  limAIOut(c);drawCat();showAfter(s5,true);const right=o.my!=null&&o.my===limAns(c);
  if(o.my==null)App.fb('#l13-l-fb','oops','AI 答错了，你看出来了吗？','看下面的证据，判断它栽在哪一类。',{stars:limStars()});
  else if(right)App.fb('#l13-l-fb','oops','你比 AI 看得准！','AI 说得很肯定，却答错了。看证据，判断它栽在哪一类。',{stars:limStars(),cheer:true});
  else App.fb('#l13-l-fb','find','这题有陷阱，AI 也掉进去了','看下面平台算出的证据，再判断 AI 栽在哪一类。',{stars:limStars()});marks5();};
 function marks5(){const LM=App.lesson(K).lim;if(Object.values(LM).some(x=>x&&(x.seen||x.my!=null||x.w!=null)))App.markStep(s5,0);if(limN()>=4)App.markStep(s5,1);}
 drawLim();marks5();

 /* ===== TALK 判卡 ===== */
 const SHORT={yes:'认同',no:'不认同',dep:'看怎么用'};
 $('#l13-t-pre').innerHTML=App.seg('tst',STANCE.map(([k])=>[k,SHORT[k]]),TK.stFirst||'');App.segWire(s6,'tst',()=>{});
 const accOf=srt=>USES.filter(u=>srt[u[0]]===u[2]).length;
 const pile=(srt,k)=>USES.filter(u=>srt[u[0]]===k).map(u=>`<li>${u[1]}${u[2]!==k?' <span class="l13-tg t2">参考看法不同</span>':''}</li>`).join('')||'<li class="note">（没有）</li>';
 function drawCard(){const box=$('#l13-t-card'),t=S.tk;
  if(!t){const done=TK.chk,srt=TK.sort||{};box.innerHTML=done?`<small>8 张做法卡 · 我的判断</small><div class="l13-piles"><div><b class="l13-no">会让人变懒</b><ul class="l13-list">${pile(srt,'l')}</ul></div><div><b class="l13-ok">帮助我学习</b><ul class="l13-list">${pile(srt,'s')}</ul></div></div><p class="note">${accOf(srt)} 张和参考看法一样。不一样的那几张，和同桌说说你的理由。</p>`:`<small>8 张做法卡</small><div class="l13-qt big">“AI 让人变懒了”？</div><p class="note">每张卡是一种用 AI 的做法：会让人变懒，还是帮助学习？</p>`;return;}
  const [id,txt,ref,why]=USES[t.i];const pk=t.sort[id];const last=t.i>=USES.length-1;
  box.innerHTML=`<small>第 ${t.i+1} / 8 张 · 这种做法……</small><div class="l13-qt">${txt}</div><div class="row">${['l','s'].map(k=>`<button type="button" class="chip big ${pk===k?'on':''}" data-k="${k}">${UK[k]}</button>`).join('')}</div>
   ${pk?`<div class="l13-v ${pk===ref?'ok':'mid'}">${pk===ref?'参考看法和你一样：':'参考看法是“'+UK[ref]+'”：'}${why}${pk===ref?'':' 你同意吗？可以改选，也可以保留自己的看法。'}</div>`:''}
   <div class="row"><button type="button" class="btn ghost sm" data-pv ${t.i?'':'hidden'}>上一张</button>${pk?`<button type="button" class="btn sm" data-nx>${last?'看我的判断':'下一张'}</button>`:''}</div>`;
  $$('[data-k]',box).forEach(b=>b.onclick=()=>{const k=b.dataset.k;if(t.first[id]==null)t.first[id]=k;t.sort[id]=k;drawCard();});
  const pv=$('[data-pv]',box);if(pv)pv.onclick=()=>{t.i--;drawCard();};
  const nx=$('[data-nx]',box);if(nx)nx.onclick=()=>{if(!last){t.i++;drawCard();return;}
   S.tk=null;TK.sort=Object.assign({},t.sort);if(!TK.first)TK.first=Object.assign({},t.first);TK.chk=1;App.touch();const n=accOf(t.sort);drawCard();drawSt();marks6();const g=$('#l13-t-go');g.dataset.label='再判一轮';g.textContent='再判一轮';g.classList.add('again');
   App.fb('#l13-t-fb','find','8 张卡判完了！',`${n} 张和参考看法一样${n<8?`，${8-n} 张不一样`:''}。现在再表一次态：你的看法变了吗？`,{stars:2});};}
 const STQ={yes:'那怎样用 AI 才不会变懒？看看你判成“帮助我学习”的那几张卡。',no:'那哪些用法要小心？看看你判成“会让人变懒”的那几张卡。',dep:'哪种用法算“用得好”？和同桌各举一个例子。'};
 function drawSt(){$('#l13-t-st').innerHTML=STANCE.map(([k,t])=>`<button type="button" class="chip big ${TK.st===k&&TK.st2?'on':''}" data-ts="${k}">${t}</button>`).join('');
  $$('[data-ts]',s6).forEach(b=>b.onclick=()=>{const k=b.dataset.ts;if(!TK.stFirst)TK.stFirst=k;TK.st=k;TK.st2=1;App.touch();drawSt();marks6();
   if(TK.stFirst!==k)App.fb('#l13-t-fb','find','你的看法变了！',`一开始你选“${SHORT[TK.stFirst]}”，现在选“${SHORT[k]}”。是哪张卡改变了你？${STQ[k]}`,{stars:3});
   else App.fb('#l13-t-fb','find',`你的看法：${SHORT[k]}`,STQ[k],{stars:3});});}
 $('#l13-t-go').onclick=()=>{const pre=App.segVal(s6,'tst');if(pre){if(!TK.stFirst)TK.stFirst=pre;if(!TK.st)TK.st=pre;App.touch();}
  S.tk={i:0,sort:{},first:{},pick:null};drawCard();$('.after-run',s6).style.display=TK.chk?'':'none';const g=$('#l13-t-go');g.dataset.label='从头再判';g.textContent='从头再判';
  App.fb('#l13-t-fb','find','第 1 张卡来了',pre?'在左边的卡片上点一点：会让人变懒，还是帮助学习？':'这次你没先表态，判完卡再说。先在左边的卡片上点一点。');marks6();};
 function marks6(){if(TK.chk)App.markStep(s6,0);if(TK.chk&&TK.st2)App.markStep(s6,1);const a=$('.after-run',s6);if(a&&TK.chk)a.style.display='';}
 drawCard();drawSt();marks6();if(TK.chk)App.ran(s6);

 /* ===== quiz + diary ===== */
 App.quiz($('#l13-quiz'),K,QUIZ);
 const rd=App.diary($('#l13-diary'),K,{title:L.diaryTitle,lead:'用今天的实验证据，写下你的收获',
  fields:[{id:'proc',q:'解题过程记录：选一道今天做过的题，写下你自己的完整解题过程（拆解问题 → 运用规则 → 逐步求解 → 检验）。',ph:'题目：……\n我先……，再……，最后检验……'},
   {id:'self',q:'我靠自己想出来了什么？AI 在哪里帮了你，又在哪里出了错？',ph:'我自己想出了……；AI 帮我……；它在……出错了，是我发现的。'},
   {id:'way',q:'“AI 出题—我们解题—AI 批改”是高效的学习方式吗？我们应该怎样使用 AI，才能既提高学习效率，又提升数学能力？',ph:'优点是……；不足是……；我会……'}],
  pledge:'用 AI 学数学时，我先独立思考再看 AI 的答案；对 AI 的批改和答案，我会自己验证。',
  extras:ex=>{const l=App.lesson(K);const runs=(l.race||{}).runs||[],B=l.bank||[],M=myOwn(l),V=l.ver||{},g=l.gen||{};
   ex.innerHTML=`<div class="l13-dex"><div><div class="box-t">人机赛跑</div>${runs.length?`<ul>${runs.slice(-4).map(r=>`<li>${esc(r.k)}：我 ${(r.ms/1000).toFixed(1)} 秒 ${r.ok?'✓':'✗'}，AI ${(r.at/1000).toFixed(1)} 秒 ${r.ao?'✓':r.ao===0?'✗':'?'}${r.es?' · 我找出了 AI 的错步':''}${r.bt?`<br><span class="note">我想学的一招：${esc(cut(r.bt,40))}</span>`:''}</li>`).join('')}</ul>`:'<p class="note">还没有比赛记录。</p>'}</div>
    <div><div class="box-t">错题银行</div>${B.length?`<p>${B.length} 道错题，已掌握 ${B.filter(e=>e.done).length} 道，练了 ${B.reduce((s,e)=>s+(e.n||0),0)} 道相似题。</p><ul>${B.slice(0,4).map(e=>`<li>${esc(cut(e.q,36))} <span class="note">我写 ${esc(e.my)}，应为 ${esc(e.a)}${e.why!=null?' · '+WHY[e.why]:''}${e.done?' · 已掌握':''}</span></li>`).join('')}</ul>`:'<p class="note">错题银行是空的。</p>'}</div>
    <div><div class="box-t">我出的题</div>${M.length?`<ol>${M.map(m=>`<li>${esc(m.q)} <span class="note">答案：${esc(m.a)}${m.v==='ok'?' · 平台核算一致':m.v==='bad'?' · 平台核算不一致':m.v==='ai-ok'?' · AI 做出的答案一致':''}</span></li>`).join('')}</ol>`:'<p class="note">在「我当出题人」出题后显示。</p>'}</div>
    <div><div class="box-t">出题机 · 批改台 · 验证台</div><p>让 AI 出了 ${(g.sets||[]).length} 道题，批改 ${(g.sets||[]).filter(s=>s.graded).length} 道。${['A','B'].filter(k=>(V[k]||{}).cc!=null).map(k=>`验证台${k==='A'?'方程题':'分数题'}：第一次选择“${(V[k].c1f||V[k].c1)==='v'?'想办法验证':'相信 AI'}”`).join('；')}</p></div></div>`;}});
 L._rd=rd;const sig=()=>{const l=App.lesson(K);return [((l.race||{}).runs||[]).map(r=>(r.es||0)+'.'+(r.br==null?'':r.br)).join(','),(l.bank||[]).length,(l.bank||[]).reduce((s,e)=>s+(e.n||0),0),(l.my||[]).map(m=>m.q.length+(m.v||'')).join(''),((l.gen||{}).sets||[]).map(s=>s.graded?1:0).join(''),JSON.stringify(Object.values(l.ver||{}).map(v=>v&&v.cc))].join('|');};
 S.dsig=sig();if(!L._on){L._on=1;App.on(()=>{if(App.current===K&&L._rd&&App.rec){const s=sig();if(s!==S.dsig){S.dsig=s;L._rd();}}});}
 const eng=()=>{const t=engTxt();['#l13-eng1','#l13-eng2','#l13-eng4','#l13-eng5'].forEach(id=>{const e=$(id);if(e)e.textContent=t;});};eng();
 if(!L._ai){L._ai=1;window.addEventListener('ai-mode',()=>{if(L._refresh)L._refresh();});}
 L._refresh=()=>{eng();if(App.current===K&&L._rd){S.dsig=sig();L._rd();}};
 L._halt=()=>{stopAll();if(S.wu&&S.wu.on){S.wu.on=false;S.wu=null;win.disabled=true;wok.disabled=true;wgo.dataset.label='开始速算';wgo.textContent='开始速算';wq.textContent='比赛中断了，再来一次';$('#l13-w-clk').textContent=wsec;}
  $$('#v-'+K+' .btn.go.busy').forEach(b=>App.busy(b,false));};
}
L.onShow=()=>{if(L._refresh)L._refresh();};
L.onHide=()=>{if(L._halt)L._halt();};

/* ================= hooks ================= */
const qOK=(lr,id)=>{const q=(lr.quiz||{})[id];return q?(q.ok?100:0):0;};
const verS=v=>v||{};
L.score=lr=>{const tx=App.txtScore,D2=lr.diary||{},w=lr.wu||{},r=lr.race||{},runs=r.runs||[],o=r.o||{},g=lr.gen||{},sets=g.sets||[],go=g.o||{},V=lr.ver||{},B=lr.bank||[],M=myOwn(lr),LM=lr.lim||{},tk=lr.talk||{};
 const graded=sets.filter(s=>s.graded).length;const combos=new Set(sets.filter(s=>!s.vague).map(s=>s.kp+'|'+s.type)).size;const prac=B.reduce((s,e)=>s+(e.n||0),0);
 const vs=['A','B'].map(k=>[k,verS(V[k])]);const verified=vs.filter(([,v])=>(v.c1f||v.c1)==='v').length,trusted=vs.filter(([,v])=>(v.c1f||v.c1)==='t').length;
 const ccRight=vs.filter(([k,v])=>v.cc!=null&&(v.ccf!=null?v.ccf:v.cc)===verTruth(k,v)).length;const chAll=vs.flatMap(([,v])=>v.ch||[]);const methods=new Set(chAll.map(x=>x.k||'x')).size;
 const limW=LIM.filter(c=>LM[c.id]&&LM[c.id].w!=null);const limR=limW.filter(c=>LCAT[LM[c.id].wf!=null?LM[c.id].wf:LM[c.id].w]===c.cat).length;
 const sortF=tk.first||(tk.chk?tk.sort:null);const sortAcc=sortF?USES.filter(u=>sortF[u[0]]===u[2]).length/USES.length:0;const kinds=new Set(runs.map(x=>x.p.split(':')[0])).size;
 return {principle:(w.q?(w.q.first===1?20:w.q.last===1?10:0):0)+15*Math.min(1,runs.filter(x=>x.same!=null).length/2)+15*(runs.some(x=>x.br!=null)?1:0)+25*limW.length/4+0.12*qOK(lr,'q1')+0.13*qOK(lr,'q2'),
  experiment:(w.runs?15:0)+20*Math.min(1,runs.length/3)+10*Math.min(1,kinds/3)+20*Math.min(1,graded/2)+15*Math.min(1,prac/3)+10*(o.fast!=null&&o.err!=null?1:0)+10*(go.fit!=null&&go.gr!=null?1:0),
  prompt:25*Math.min(1,combos/2)+(g.weak?15:0)+(sets.some(s=>s.vague)&&sets.some(s=>!s.vague)?15:0)+(go.diff!=null?10:0)+(g.tc!=null?15:0)+0.2*qOK(lr,'q3'),
  critical:12*verified+(trusted&&!verified?4:0)+12*ccRight+8*Math.min(1,chAll.length/2)+(runs.some(x=>x.es)?14:0)+12*limR/4+5*Math.min(2,methods)+0.12*qOK(lr,'q4')+(o.err===0?6:0),
  creative:40*Math.min(1,M.length/3)+15*(M.some(m=>m.v==='ok'||m.v==='ai-ok')?1:0)+15*(B.some(e=>e.why!=null)?1:0)+15*(M.length>=2?1:0)+0.15*tx(D2.self,30),
  ethics:(D2.pledge?25:0)+30*sortAcc+(tk.st==='dep'?15:tk.st?8:0)+0.15*tx(D2.way,30)+0.15*qOK(lr,'q5')};};
L.progress=lr=>{const w=lr.wu||{},r=lr.race||{},runs=r.runs||[],o=r.o||{},g=lr.gen||{},V=lr.ver||{},B=lr.bank||[],LM=lr.lim||{},tk=lr.talk||{};
 const m=[!!w.runs&&!!w.q,runs.length>=1&&o.fast!=null&&o.err!=null,(g.sets||[]).some(s=>s.graded),['A','B'].some(k=>(V[k]||{}).cc!=null),B.reduce((s,e)=>s+(e.n||0),0)>=2,
  myOwn(lr).length>=2,LIM.filter(c=>LM[c.id]&&LM[c.id].w!=null).length>=3,!!tk.st&&!!tk.chk,Object.keys(lr.quiz||{}).length>=5,!!(lr.diary||{}).submitted];
 return m.filter(Boolean).length/m.length;};
L.quiz=QUIZ;
L.flow=[
 {seg:'导入',from:'l13-s0'},
 {seg:'挑战一',kp:'知识点一 · AI 解题：比思路，不比胜负',learn:['AI 能快速解题，还能展示详细的解题步骤','看它怎样拆解问题、运用规则、逐步求解','题目有歧义、要空间想象时，AI 可能难以应对'],sum:['AI 很快，每一步都写出了拆解、规则、求解','梯形题算式都对却漏了÷2：错在运用规则','同一道题思路可以不同，检验不能省'],from:'l13-s1',to:'l13-s1'},
 {seg:'挑战二',kp:'知识点二 · AI 出题批改：有针对性，要验证',learn:['告诉 AI 年级、知识点、题型，出题更对路','先自己做，再让 AI 批改和分析（先做后看）','AI 也有学习盲区，答案要自己验证'],sum:['说清要求，AI 出的题适合自己，反馈很快','AI 的批改也会错，代回检验就能发现','错题进错题银行，练相似题到已掌握'],from:'l13-s2',to:'l13-s4b'},
 {seg:'综合运用',from:'l13-s5'},
 {seg:'反思与总结',from:'l13-s6'}
];
L.diaryTitle='我的错题与练习';
L.diaryQ=[['proc','解题过程记录'],['self','我靠自己想出来的'],['way','怎样用 AI 学数学']];
L.works=lr=>{const o=[];const B=lr.bank||[],M=myOwn(lr),runs=(lr.race||{}).runs||[];
 if(M.length)o.push({t:'我设计的练习题',s:M.map((m,i)=>`${i+1}. ${cut(m.q,22)}`).join('　'),glyph:'题'});
 if(B.length)o.push({t:'我的错题银行',s:`${B.length} 道错题，已掌握 ${B.filter(e=>e.done).length} 道，练了 ${B.reduce((s,e)=>s+(e.n||0),0)} 道相似题`,glyph:'错'});
 if(runs.length)o.push({t:'人机赛跑记录',s:`${runs.length} 道题，我做对 ${runs.filter(r=>r.ok).length} 道；${runs.some(r=>r.es)?'找出了 AI 的错误步骤':'对比了 AI 的解题步骤'}`,glyph:'赛'});
 return o;};
L.expCount=lr=>lr.nExp||0;
const bar=(n,v,tot,col,lab)=>`<div class="hbar"><span>${n}</span><span class="tr"><i style="width:${tot?100*v/tot:0}%;background:${col}"></i></span><span>${lab!=null?lab:v}</span></div>`;
L.classPanels=recs=>{const R=recs.map(r=>(r.lessons||{})[K]||{}).filter(l=>Object.keys(l).length);if(!R.length)return '';
 const runs=R.flatMap(l=>(l.race||{}).runs||[]);const myOk=runs.filter(r=>r.ok).length;const p4=runs.filter(r=>r.bad);const p4f=p4.filter(r=>r.es).length;
 const myT=runs.length?runs.reduce((s,r)=>s+(r.ms||0),0)/runs.length/1000:0,aiT=runs.length?runs.reduce((s,r)=>s+(r.at||0),0)/runs.length/1000:0;
 const allSets=R.flatMap(l=>(l.gen||{}).sets||[]);const sets=allSets.filter(s=>s.graded);const qs=sets.flatMap(s=>s.qs||[]);const qOk=qs.filter(q=>q.ok).length;const vagueN=R.filter(l=>((l.gen||{}).sets||[]).some(s=>s.vague)).length;
 const weak={};R.forEach(l=>{const w=(l.gen||{}).weak;if(w&&KP[w])weak[w]=(weak[w]||0)+1;});const wk=Object.entries(weak).sort((a,b)=>b[1]-a[1]).slice(0,5);const wN=Object.values(weak).reduce((a,b)=>a+b,0);
 const vs=R.flatMap(l=>['A','B'].map(k=>[k,((l.ver||{})[k])||{}])).filter(([,v])=>v.c1||v.c1f);const vT=vs.filter(([,v])=>(v.c1f||v.c1)==='t').length,vV=vs.length-vT;const vc=vs.filter(([,v])=>v.cc!=null);const vR=vc.filter(([k,v])=>(v.ccf!=null?v.ccf:v.cc)===verTruth(k,v)).length;
 const B=R.map(l=>l.bank||[]);const bN=B.reduce((s,b)=>s+b.length,0),bP=B.reduce((s,b)=>s+b.reduce((x,e)=>x+(e.n||0),0),0),bD=B.reduce((s,b)=>s+b.filter(e=>e.done).length,0);
 const why=[0,0,0,0];B.forEach(b=>b.forEach(e=>{if(e.why!=null&&why[e.why]!=null)why[e.why]++;}));const wT=why.reduce((a,b)=>a+b,0);
 const TK=R.map(l=>l.talk||{});const stF={},stL={};STANCE.forEach(([k])=>{stF[k]=0;stL[k]=0;});TK.forEach(t=>{if(t.stFirst in stF)stF[t.stFirst]++;if(t.st in stL)stL[t.st]++;});const stN=TK.filter(t=>t.st).length;
 const SF=TK.map(t=>t.first).filter(Boolean);const sacc=USES.map(([id,n,ref])=>[n,SF.filter(f=>f[id]===ref).length]).sort((a,b)=>a[1]-b[1]);
 const LMs=R.map(l=>l.lim||{});const limAcc=LIM.map(c=>{const d=LMs.filter(m=>m[c.id]&&m[c.id].w!=null);return [c.cat,d.filter(m=>LCAT[m[c.id].wf!=null?m[c.id].wf:m[c.id].w]===c.cat).length,d.length];});
 return `<div class="box"><div class="box-t">第13讲 · 练习工坊：解题与出题</div>
   <b style="font-size:13px">人机赛跑（${runs.length} 次）：学生平均 ${myT.toFixed(1)} 秒，AI 平均 ${aiT.toFixed(1)} 秒</b>${bar('学生先独立做对',myOk,runs.length,'var(--green)',`${myOk}/${runs.length}`)}${bar('找出 AI 梯形解法的错步',p4f,p4.length,'var(--amber)',`${p4f}/${p4.length}`)}
   <b style="font-size:13px;display:block;margin-top:8px">私人出题机：出题 ${allSets.length} 道，批改 ${qs.length} 道，正确率 ${qs.length?Math.round(100*qOk/qs.length):0}%；${vagueN} 人试过“只说出道题”</b>
   <b style="font-size:13px;display:block;margin-top:8px">学生选来练习的“最没把握”知识点（${wN} 人）</b>${wk.length?wk.map(([k,v])=>bar(KP[k].n,v,wN,'var(--violet)')).join(''):'<p class="note">暂无。</p>'}
   <b style="font-size:13px;display:block;margin-top:8px">错题银行：共 ${bN} 道，练相似题 ${bP} 道，已掌握 ${bD} 道</b>${WHY.map((n,i)=>bar(n,why[i],wT,'var(--cyan)')).join('')}</div>
  <div class="box"><div class="box-t">第13讲 · 验证与态度</div>
   <b style="font-size:13px">AI 批改后，第一次的选择（${vs.length} 次）</b>${bar('想办法验证',vV,vs.length,'var(--green)')}${bar('相信 AI',vT,vs.length,'var(--red)')}<p class="note">验证后第一次就下对结论：${vR}/${vc.length}</p>
   <b style="font-size:13px;display:block;margin-top:8px">AI 的盲区：第一次就判断对类别</b>${limAcc.map(([n,v,t])=>bar(n,v,t,'var(--amber)',`${v}/${t}`)).join('')}
   <b style="font-size:13px;display:block;margin-top:8px">“AI 让人变懒了吗”（判卡前 → 判卡后，${stN} 人）</b>${STANCE.map(([k,t])=>bar(t.split('：')[0],stL[k],stN,k==='dep'?'var(--green)':k==='yes'?'var(--red)':'var(--amber)',`${stF[k]}→${stL[k]}`)).join('')}
   <b style="font-size:13px;display:block;margin-top:8px">8 张做法卡：第一轮就判对的人数（${SF.length} 人，最难的在前）</b>${sacc.slice(0,3).map(([n,v])=>bar(cut(n,16),v,SF.length,'var(--violet)')).join('')}</div>`;};
L.classSug=recs=>{const R=recs.map(r=>(r.lessons||{})[K]||{}).filter(l=>Object.keys(l).length);if(!R.length)return [];const out=[];
 const vs=R.flatMap(l=>['A','B'].map(k=>((l.ver||{})[k])||{})).filter(v=>v.c1||v.c1f);const vT=vs.filter(v=>(v.c1f||v.c1)==='t').length;
 if(vs.length>=4&&vT/vs.length>=0.25)out.push(`批改验证台上，${vT}/${vs.length} 次第一反应是“相信 AI”：请全班一起把 a = 19 和 a = 59 分别代回 b = a + 20，再讨论“AI 说我错了，我该怎么办”。`);
 const weak={};R.forEach(l=>{const w=(l.gen||{}).weak;if(w&&KP[w])weak[w]=(weak[w]||0)+1;});const top=Object.entries(weak).sort((a,b)=>b[1]-a[1])[0];
 if(top&&top[1]>=3&&out.length<2)out.push(`${top[1]} 名学生选了「${KP[top[0]].n}」作为最没把握的知识点：可以用私人出题机按这个知识点出题，全班先独立做、再对照 AI 的批改和平台的核对。`);
 const p4=R.flatMap(l=>((l.race||{}).runs||[]).filter(r=>r.bad));const miss=p4.filter(r=>!r.es).length;
 if(out.length<2&&p4.length>=3&&miss/p4.length>=0.4)out.push(`${miss}/${p4.length} 次没能找出 AI 梯形解法的错步：带学生对照公式“（上底 + 下底）× 高 ÷ 2”，逐步检查 AI 的每一步，说说“每一步都算对，为什么答案还错”。`);
 const B=R.map(l=>l.bank||[]).filter(b=>b.length);const idle=B.filter(b=>!b.some(e=>e.n)).length;
 if(out.length<2&&B.length>=4&&idle/B.length>=0.4)out.push(`${idle}/${B.length} 名学生的错题银行里有错题却没有练相似题：留 5 分钟，请每人至少把一道错题练到“已掌握”。`);
 return out.slice(0,2);};
L.demo=(rnd,t)=>{const p=x=>rnd()<x;const pk=a=>a[Math.floor(rnd()*a.length)];const lr={};
 if(p(.5+t*.45)){const n=Math.round(8+t*10+rnd()*4);const ok=Math.max(0,n-Math.round((1-t)*5*rnd()));lr.wu={n,ok,sec:60,cms:0.002+rnd()*0.01,runs:1+(p(.3)?1:0),best:ok};if(p(.5+t*.45)){const f=p(.4+t*.55)?1:pk([0,2]);const last=p(.3+t*.6)?1:f;lr.wu.q={first:f,ok:f===1,last};}}
 const ids=['p1','p2','p3','p4','rnd:mix','rnd:area'];const nr=p(.4+t*.55)?1+Math.floor(rnd()*(1+t*4)):0;
 lr.race={runs:Array.from({length:Math.min(6,nr)},(_,i)=>{const id=ids[i%ids.length];const bad=id==='p4'?1:0;const ok=p(.45+t*.5)?1:0;const r={p:id,k:id==='p4'?'几何':'计算题',q:'示例题目',my:ok?'示例':'?',ok,ms:Math.round(30000+rnd()*120000*(1.2-t)),am:'offline',at:Math.round(2500+rnd()*2500),ao:bad?0:1,sn:4+Math.floor(rnd()*2),bad};
   if(p(.4+t*.5))r.same=pk([0,1,1,2,3]);if(!bad&&p(.3+t*.5)){r.br=Math.floor(rnd()*3);r.bt='先算括号里面的';}if(bad&&p(.3+t*.6))r.es=1;return r;}),o:{}};
 if(nr&&p(.5+t*.4)){lr.race.o.fast=pk([0,0,0,1]);lr.race.o.err=lr.race.runs.some(r=>r.bad)?(p(.2+t*.7)?0:1):pk([1,1,2]);}
 const g=pk([4,5,5,6]);const kp=pk(KPSEL[g]);const ns=p(.35+t*.6)?1+Math.floor(rnd()*(1+t*3)):0;
 lr.gen={cfg:{g,kp,type:KP[kp].t[0],say:'1'},weak:ns?pk(KPSEL[g]):'',sets:Array.from({length:ns},(_,i)=>{const vague=i===0&&p(.3+t*.3);const k2=pk(KPSEL[g]);const graded=p(.6+t*.4)?1:0;const ok=p(.45+t*.5);
   const s={g,kp:k2,type:KP[k2].t[0],m:'offline',ts:Date.now(),qs:[graded?{q:'示例题',a:'1',an:[1,1],u:'',src:'p',my:ok?'1':'2',pf:ok?1:0,ai:ok?1:0,ok:ok?1:0}:{q:'示例题',a:'1',an:[1,1],u:'',src:'p'}]};if(graded){s.graded=1;s.gm='offline';}if(vague)s.vague=1;return s;}),o:{}};
 if(ns&&p(.5+t*.4)){lr.gen.o={fit:pk([0,0,1]),diff:pk([0,1,1,2])};if(lr.gen.sets.some(s=>s.graded))lr.gen.o.gr=pk([0,0,2]);if(p(.4+t*.5))lr.gen.tc=pk([0,0,1,2]);}
 lr.ver={};['A','B'].forEach(k=>{if(!p(.35+t*.6))return;const ok=p(.5+t*.45)?1:0;const c1=p(.45+t*.5)?'v':'t';const v={my:ok?(k==='A'?'19':'3/4'):(k==='A'?'59':'4/3'),ok,c1f:c1,c1:p(.8)?'v':c1,ch:p(.6+t*.3)?[{k:k==='A'?'sub':'cmp',t:'示例验证',ok:1}]:[]};
  if(v.ch.length&&p(.5+t*.45)){const right=verTruth(k,v);v.ccf=p(.4+t*.55)?right:pk([0,1,2]);v.cc=p(.7)?right:v.ccf;}lr.ver[k]=v;});
 const nb=Math.floor(rnd()*(5-3*t))+(p(.4)?1:0);const kps=['area','frac','chick','mix','eq'];
 lr.bank=Array.from({length:nb},(_,i)=>{const n=p(.3+t*.6)?1+Math.floor(rnd()*4):0;const okN=Math.min(n,Math.floor(n*(.4+t*.5)));return {id:'d'+i,src:pk(['race','gen','ver','wu']),kp:kps[i%kps.length],g:5,type:'calc',q:'示例错题',my:'?',a:'1',an:[1,1],u:'',n,ok:okN,sk:okN>=2?2:okN,done:okN>=2&&p(.7)?1:0,why:p(.4+t*.5)?pk([0,0,1,2,3]):undefined};});
 lr.my=p(.3+t*.6)?Array.from({length:p(t)?3:2},()=>({q:pk(['解方程：x + 27 = 64','计算：(36 + 64) × 7','一个长方形长 12 米、宽 5 米，面积是多少？']),a:pk(['37','700','60']),v:pk(['ok','ok','bad','?']),own:1})):[];
 lr.lim={};LIM.forEach(c=>{if(!p(.35+t*.6))return;const right=LCAT.indexOf(c.cat);const wf=p(.4+t*.5)?right:Math.floor(rnd()*4);lr.lim[c.id]={seen:1,my:p(t)?limAns(c):0,wf,w:p(.6)?right:wf};});
 if(p(.35+t*.6)){const f=p(.3+t*.4)?'dep':pk(['yes','no','dep']);lr.talk={stFirst:f,st:p(.4+t*.4)?'dep':f,sort:{},chk:0};
  const fr={};USES.forEach(([id,,ref])=>{fr[id]=p(.5+t*.45)?ref:(ref==='l'?'s':'l');});if(p(.5+t*.45)){lr.talk.sort=Object.assign({},fr);lr.talk.first=fr;lr.talk.chk=1;}}
 const q=(id,pp)=>{const ok=p(pp);const a=QUIZ.find(x=>x.id===id).a;return {first:ok?a:(a+1)%4,ok,last:a};};
 if(p(.3+t*.7))lr.quiz={q1:q('q1',.7+t*.3),q2:q('q2',.55+t*.4),q3:q('q3',.65+t*.35),q4:q('q4',.6+t*.4),q5:q('q5',.65+t*.35)};
 if(p(.2+t*.7))lr.diary={proc:p(t)?'题目：3x + 8 = 35。我先把 3x 看成整体，两边减 8 得 3x = 27，再两边除以 3，x = 9，最后代回检验。':'先算再检验。',self:p(t)?'我自己想出了用假设法解鸡兔同笼；AI 在梯形面积那题漏了 ÷ 2，是我发现的。':'自己算对了。',way:p(t)?'高效，但要先自己做，AI 批改后要验证，不能直接抄答案。':'要自己想。',pledge:p(.75),submitted:p(t+.1)?1:0};
 lr.nExp=(lr.race.runs||[]).length+(lr.gen.sets||[]).length*2+(lr.bank||[]).reduce((s,e)=>s+(e.n||0),0);
 return lr;};

})();
