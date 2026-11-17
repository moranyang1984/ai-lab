/* 第14讲 推理游戏厅 (v3) — WARM-UP 数字炸弹 / EXP-01 猜数推理台 / EXP-02 误导实验 / EXP-03 24 点擂台 / EXP-04 无解与违规 / EXP-04b 给 AI 挑错 / TALK 人机推理大讨论 / QUIZ / DIARY */
(function(){
const {$,$$,esc,clamp}=App;const K='l14';const L={};App.lessons[K]=L;
const clip=(s,n)=>{s=String(s||'').trim();return s.length>n?s.slice(0,n):s;};
const nz=s=>String(s||'').replace(/\s+/g,'');
let tT=0;const touchSoon=()=>{clearTimeout(tT);tT=setTimeout(App.touch,600);};

/* ================= real math ================= */
/* exact fractions */
const gcd=(a,b)=>{a=Math.abs(a);b=Math.abs(b);while(b){[a,b]=[b,a%b];}return a||1;};
const F=(n,d=1)=>{if(d<0){n=-n;d=-d;}const g=gcd(n,d);return {n:n/g,d:d/g};};
const OPS={'+':(a,b)=>F(a.n*b.d+b.n*a.d,a.d*b.d),'-':(a,b)=>F(a.n*b.d-b.n*a.d,a.d*b.d),'*':(a,b)=>F(a.n*b.n,a.d*b.d),'/':(a,b)=>b.n===0?null:F(a.n*b.d,a.d*b.n)};
const fstr=a=>a.d===1?String(a.n):`${a.n}/${a.d}`;
const SYM={'+':'+','-':'−','*':'×','/':'÷'};
const prec=o=>o==='+'||o==='-'?1:2;
function show(t){if(t.v!=null)return String(t.v);const A=show(t.l),B=show(t.r),p=prec(t.op);
 const lp=t.l.op&&prec(t.l.op)<p,rp=t.r.op&&(prec(t.r.op)<p||(prec(t.r.op)===p&&(t.op==='-'||t.op==='/')));
 return `${lp?'('+A+')':A} ${SYM[t.op]} ${rp?'('+B+')':B}`;}
/* canonical form (commutative / associative rewrites count as one solution) */
function canon(t){if(t.v!=null)return String(t.v);
 const add=(t,s,o)=>{if(t.op==='+'){add(t.l,s,o);add(t.r,s,o);}else if(t.op==='-'){add(t.l,s,o);add(t.r,-s,o);}else o.push((s>0?'+':'-')+canon(t));return o;};
 const mul=(t,s,o)=>{if(t.op==='*'){mul(t.l,s,o);mul(t.r,s,o);}else if(t.op==='/'){mul(t.l,s,o);mul(t.r,-s,o);}else o.push((s>0?'*':'/')+canon(t));return o;};
 return t.op==='+'||t.op==='-'?'['+add(t,1,[]).sort().join('')+']':'{'+mul(t,1,[]).sort().join('')+'}';}
/* exhaustive search: pick two numbers, combine with + − × ÷, repeat until one number is left ("撞了南墙就回头").
   Intermediate results never negative (primary-school convention); fractions allowed. */
function solve24(nums,target=24){const T=F(target),sols=new Map(),first=new Map();let tried=0,firstPath=null,deadBefore=[];const t0=performance.now();
 const rec=(items,path,fk)=>{if(items.length===1){tried++;const x=items[0];const st=first.get(fk);st.leaves++;
   if(x.f.n===T.n&&x.f.d===T.d){st.hits++;const c=canon(x.t);if(!sols.has(c))sols.set(c,show(x.t));if(!firstPath)firstPath=path.slice();}return;}
  for(let i=0;i<items.length;i++)for(let j=0;j<items.length;j++){if(i===j)continue;const a=items[i],b=items[j];
   for(const op of ['+','-','*','/']){if((op==='+'||op==='*')&&i>j)continue;const f=OPS[op](a.f,b.f);if(!f||f.n<0)continue;
    const rest=items.filter((_,k)=>k!==i&&k!==j);const step=`${fstr(a.f)} ${SYM[op]} ${fstr(b.f)} = ${fstr(f)}`;let k=fk;
    if(!path.length){k=step+'|'+i+','+j;first.set(k,{step,rest:rest.map(r=>fstr(r.f)),leaves:0,hits:0});}
    rec([...rest,{f,t:{op,l:a.t,r:b.t}}],[...path,step],k);
    if(!path.length&&!firstPath)deadBefore.push(first.get(k));}}};
 rec(nums.map(v=>({f:F(v),t:{v}})),[],null);
 return {sols:[...sols.values()],tried,first:[...first.values()],firstPath,deadBefore,ms:performance.now()-t0};}
/* parser for an expression typed by the student or written by the AI: exact value + numbers used */
function parseExpr(s){s=String(s||'').replace(/[×xX＊*]/g,'*').replace(/[÷／/]/g,'/').replace(/[－—–−]/g,'-').replace(/＋/g,'+').replace(/（/g,'(').replace(/）/g,')').replace(/[\s　]+/g,'').replace(/[=＝].*$/,'');
 let i=0;const used=[];const err=m=>{throw new Error(m);};
 const num=()=>{const m=/^\d+/.exec(s.slice(i));if(!m)err(i>=s.length?'算式没写完':`第 ${i+1} 个字符“${s[i]}”这里应该是一个数`);i+=m[0].length;used.push(+m[0]);return F(+m[0]);};
 const atom=()=>{if(s[i]==='('){i++;const v=expr();if(s[i]!==')')err('括号没有配对');i++;return v;}return num();};
 const term=()=>{let v=atom();while(s[i]==='*'||s[i]==='/'){const o=s[i++];v=OPS[o](v,atom());if(!v)err('不能除以 0');}return v;};
 const expr=()=>{let v=term();while(s[i]==='+'||s[i]==='-'){const o=s[i++];v=OPS[o](v,term());}return v;};
 if(!s)err('还没有写算式');const v=expr();if(i<s.length)err(`看不懂“${s.slice(i,i+3)}”`);return {v,used};}
const sorted=a=>a.slice().sort((x,y)=>x-y);
const sameMulti=(a,b)=>a.length===b.length&&sorted(a).every((x,k)=>x===sorted(b)[k]);
function check24(expr,nums){try{const {v,used}=parseExpr(expr);const okN=sameMulti(used,nums),ok24=v.n===24&&v.d===1;return {ok:okN&&ok24,okN,ok24,val:fstr(v),used};}catch(e){return {ok:false,err:e.message};}}
/* the textbook rule (小贴士): 4 different integers from 1–10 */
function ruleCheck(nums){const p=[];if(nums.length!==4)p.push({k:'four',t:`给了 ${nums.length} 个数，规则要求 4 个`});const out=nums.filter(n=>n<1||n>10);if(out.length)p.push({k:'range',t:`${out.join('、')} 不在 1～10 之间`});
 const dup=[...new Set(nums.filter((n,k)=>nums.indexOf(n)!==k))];if(dup.length)p.push({k:'dist',t:`${dup.join('、')} 出现了不止一次（规则：不可重复选取）`});return p;}
const parseNums=s=>(String(s||'').match(/\d+/g)||[]).map(Number).slice(0,6);
/* elements of the rule the student tells the AI */
const RULE_EL=[{k:'range',t:'从 1～10 中选数',re:/1\s*[～~\-—–到至]\s*10|一到十/,add:'只能从 1～10 中选数'},{k:'four',t:'选 4 个整数',re:/[4四]\s*个/,add:'每次选 4 个整数'},{k:'dist',t:'不可重复选取',re:/不可重复|不能重复|不重复|各不相同|互不相同|不相同/,add:'4 个数不可重复'},
 {k:'once',t:'每个数用且只用一次',re:/只能用一次|只用一次|用一次|都要用|必须用/,add:'每个数必须用且只能用一次'},{k:'ops',t:'只用加减乘除',re:/加.{0,2}减.{0,2}乘.{0,2}除|[+＋].{0,3}[-−－].{0,3}[×*].{0,3}[÷/]|四则运算/,add:'只能用加、减、乘、除'},
 {k:'paren',t:'可以用括号',re:/括号/,add:'可以用括号改变运算顺序'},{k:'target',t:'结果等于 24',re:/(等于|得出|得到|算出|凑出|结果是|结果为|成为|变成)\s*24|=\s*24|二十四/,add:'计算结果要等于 24'}];
const ruleEls=t=>RULE_EL.filter(e=>e.re.test(String(t||''))).map(e=>e.k);
/* guessing */
const mid=(lo,hi)=>Math.floor((lo+hi)/2);
function rangeOf(h,lo=1,hi=100){for(const x of h){if(x.f==='big')hi=Math.min(hi,x.g-1);else if(x.f==='small')lo=Math.max(lo,x.g+1);else if(x.f==='ok'){lo=Math.max(lo,x.g);hi=Math.min(hi,x.g);}else if(x.f==='wrong'){if(lo===x.g)lo++;else if(hi===x.g)hi--;}}return [lo,hi];}
const FB={big:'大了',small:'小了',ok:'正确',wrong:'你猜错了'};
const truthFb=(g,n)=>g>n?'big':g<n?'small':'ok';
/* which single "大了 / 小了", if it were reversed, would make all the hints agree? */
function suspects(h){const out=[];h.forEach((x,i)=>{if(x.f!=='big'&&x.f!=='small')return;const hh=h.map((y,k)=>k===i?Object.assign({},y,{f:y.f==='big'?'small':'big'}):y).filter(y=>y.f!=='wrong');const [a,b]=rangeOf(hh);if(a<=b)out.push({i,lo:a,hi:b});});return out;}
/* worst case of bisection over 1..N, measured by playing every secret */
function worstSim(N){let w=0;for(let n=1;n<=N;n++){let lo=1,hi=N,s=0;while(true){s++;const g=mid(lo,hi);if(g===n)break;if(g>n)hi=g-1;else lo=g+1;}w=Math.max(w,s);}return w;}
const WORST={10:worstSim(10),100:worstSim(100),1000:worstSim(1000)};WORST[10000]=Math.floor(Math.log2(10000))+1;

/* ================= presets ================= */
const SETS3=[{c:[2,3,4,6],tb:1},{c:[1,6,7,8],tb:1},{c:[1,2,3,5]},{c:[3,4,5,8]},{c:[1,3,4,6]}];
const CARD4=[{id:'u',c:[1,2,9,10],t:'符合规则的另一组数',k:'无解吗？'},{id:'b',c:[1,5,7,11],t:'教材：不符合规则的数',k:'违规'},{id:'c',c:[4,4,3,2],t:'教材：不符合规则的数',k:'违规'}];
const FAULT=[{id:'f1',c:[1,6,7,8],ans:'8 × (1 + 8 − 6)',say:'我找到了！先算 1 + 8 − 6 = 3，再算 8 × 3 = 24。',err:0,
  why:'算式的结果确实是 24，但用到的数是 8、1、8、6：8 用了两次，7 没有用。AI 悄悄把 7 换成了 8。1、6、7、8 其实无解。'},
 {id:'f2',c:[1,4,5,6],ans:'6 ÷ (1 − 5 ÷ 4)',say:'这组数要用到分数：5 ÷ 4 = 5/4，1 − 5/4 = 1/4，6 ÷ 1/4 = 24。',err:1,
  why:'1 比 5/4 小，1 − 5/4 不够减（结果是负数 −1/4），算式的值是 −24，不是 24。正确的写法是 6 ÷ (5 ÷ 4 − 1) = 24：顺序一换，结果就对了。'}];
const SORT=[['t1','记得多、算得快：几毫秒就能试完两千多种 24 点算式','a'],['t2','有明确的策略：每次猜剩下范围的正中间，最多 7 次猜中 1～100','a'],
 ['t3','被故意给了错误提示后，推理过程和回答变得不稳定','l'],['t4','只按别人告诉它的规则推理：没告诉它“不可重复”，就发现不了重复的数','l'],['t5','偶尔会编出“看起来对”的答案（偷换数字、算错）','l'],
 ['t6','理解问题的语境与意图：看出同学是在故意考验它','h'],['t7','关联个人经验：想起以前玩 24 点时用过的好办法','h'],['t8','跳出既有规则进行创造性思考：发明一种新的数学游戏','h'],['t9','对 AI 给出的推理结果进行辨别、验证','h']];
const CAT={a:'AI 的优势',l:'AI 的局限',h:'人类的优势'};

const QUIZ=[
 {id:'q1',q:'在 1～100 中猜一个整数，每次只告诉对方“大了”或“小了”。如果每次都猜剩下范围的正中间，最多猜几次一定能猜中？',opts:['5 次','7 次','10 次','50 次'],a:1,why:'每猜一次，范围大约减半：100 → 50 → 25 → 12 → 6 → 3 → 1，最多 7 次。这就是“二分”的推理策略。'},
 {id:'q2',q:'AI 第一次猜 50，你说“大了”。按 AI 的推理策略，它下一次最可能猜：',opts:['51','49','25','75'],a:2,why:'“大了”说明数在 1～49 之间，取这个范围的中间数 25，无论下一次是大了还是小了，都能再排除大约一半。'},
 {id:'q3',q:'在猜数游戏中故意给 AI 一次错误提示，教材认为这说明了什么？',opts:['AI 永远不会被误导','AI 具备一定的推理能力，但面对矛盾或误导时，它的思考过程及给出答案的能力仍不够稳定','AI 会立刻准确地指出是哪一次提示错了','AI 没有任何推理能力'],a:1,why:'被误导后，AI 有时推测我们给错了提示，有时追溯步骤向我们确认，有时按自己的逻辑重新推理——表现并不稳定。'},
 {id:'q4',q:'给 AI 的 24 点规则里没有写“不可重复选取”，再给它 4、4、3、2，最可能发生的是：',opts:['AI 一定会指出 4 重复了','AI 可能直接算出 4 × 4 × 3 ÷ 2 = 24，发现不了这组数不符合规则','AI 会拒绝回答','AI 会自动改成 1～10 中不重复的数'],a:1,why:'AI 的推理依赖既定规则。我们没有告诉它的规则，它就可能不会去检查——所以规则要说清楚，结果要自己核对。'},
 {id:'q5',q:'下面哪一项是人类在推理方面目前 AI 难以复制的优势？',opts:['比 AI 记得更多、算得更快','能理解问题语境与意图，关联个人经验，跳出既有规则进行创造性思考','从来不会推理出错','能在一秒内试完所有可能'],a:1,why:'我们不如 AI 记得多、算得快，但能理解语境与意图、关联个人经验、跳出规则创造性思考，还能对 AI 的推理结果进行辨别、验证。'}];

const CSS14=`
.l14-col{display:flex;flex-direction:column;gap:14px;min-width:0}
.l14-lab{font-weight:700;font-size:15px;color:var(--ink)}
.l14-grid{align-self:start;display:grid;grid-template-columns:repeat(10,minmax(0,1fr));gap:4px;padding:12px;border-radius:16px;background:var(--panel2);border:1.5px solid var(--line2)}
.l14-grid button{aspect-ratio:1;border:2px solid var(--line2);background:#fff;color:var(--ink);border-radius:9px;font-family:var(--f-body);font-weight:700;font-size:14px;cursor:pointer;padding:0;min-width:0}
.l14-grid button:hover{border-color:var(--ink);background:var(--sun-soft)}
.l14-grid button.out{opacity:.3;border-style:dashed}
.l14-grid button.g{background:var(--sun);border-color:var(--sun-d);border-style:solid}
.l14-grid button.hit{background:var(--coral);border-color:var(--coral-d);color:#fff;opacity:1;transform:scale(1.18);box-shadow:0 6px 16px #6c47ff33}
.l14-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
.l14-stats .stat{padding:10px 8px;text-align:center}
.l14-stats .stat .v{font-size:22px;line-height:1.2}
.l14-board{align-self:start;padding:14px 26px 14px 14px;border-radius:16px;background:var(--panel2);border:1.5px solid var(--line2);display:flex;flex-direction:column;gap:8px}
.l14-axis,.l14-row{display:grid;grid-template-columns:34px minmax(0,1fr);gap:2px 8px;align-items:center}
.l14-axis .ax{position:relative;height:18px;font-size:12.5px;font-weight:700;color:var(--muted)}
.l14-axis .ax span{position:absolute;transform:translateX(-50%)}
.l14-rows{display:flex;flex-direction:column;gap:7px}
.l14-row{animation:pop .3s cubic-bezier(.3,1.5,.5,1)}
.l14-row .k{font-weight:700;font-size:13px;color:var(--muted)}
.l14-row .tr{position:relative;display:block;height:18px;border-radius:999px;background:#fff;border:2px solid var(--line2)}
.l14-row .rg{position:absolute;top:-2px;bottom:-2px;border-radius:999px;background:#b9a8f7;border:2px solid var(--grape)}
.l14-row.cur .rg{background:var(--sun);border-color:var(--sun-d)}
.l14-row .gs{position:absolute;top:-6px;width:6px;height:26px;margin-left:-3px;border-radius:3px;background:var(--ink)}
.l14-row .sc{position:absolute;top:-7px;bottom:-7px;width:0;border-left:3px dashed var(--mint-d)}
.l14-row .t{grid-column:2;font-size:13.5px;color:var(--muted);line-height:1.4}
.l14-row .t b{color:var(--ink)}
.l14-row.lie .t,.l14-row.lie .t b{color:var(--coral-d)}
.l14-row.lie .gs{background:var(--coral)}
.l14-row.nil .tr{background:repeating-linear-gradient(45deg,#ff6b4a55 0 6px,#fff 6px 12px);border-color:var(--coral)}
.l14-leg{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:700;color:var(--mint-d)}
.l14-leg i{width:0;height:16px;border-left:3px dashed var(--mint-d)}
.stage.l14-table{aspect-ratio:auto;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;padding:28px 12px;min-height:230px}
.l14-cards{display:flex;gap:12px;flex-wrap:wrap;justify-content:center}
.l14-card{display:grid;place-items:center;width:72px;height:98px;padding:0;border-radius:14px;background:#fffdf3;color:#1b2550;font-family:var(--f-display);font-weight:800;font-size:42px;line-height:1;border:3px solid transparent;box-shadow:0 8px 18px #00000059;transform:rotate(-3deg);transition:transform .12s}
.l14-card:nth-child(even){transform:rotate(2.5deg)}
.l14-card.bad{background:#ff6b4a;color:#fff}
.l14-card.miss{opacity:.45;border:3px dashed #ffd43b}
.l14-card.sm{font-size:26px}
button.l14-card{cursor:pointer}
button.l14-card:hover{border-color:#ffd43b}
button.l14-card.sel{background:#ffd43b;border-color:#fff;transform:translateY(-10px) scale(1.06)}
.l14-ops{display:flex;gap:12px;justify-content:center}
.l14-ops button{width:54px;height:54px;border-radius:50%;border:3px solid transparent;background:#3b2f7a;color:#fff;font-family:var(--f-display);font-weight:800;font-size:30px;line-height:1;cursor:pointer;padding:0}
.l14-ops button:hover{border-color:#ffd43b}
.l14-ops button.on{background:#ffd43b;color:#1b2550;border-color:#fff}
.l14-tip{min-height:24px;color:#fff;font-size:15.5px;font-weight:700;text-align:center;line-height:1.5}
.l14-tip.ok{color:#7af0c0}
.l14-tip.bad{color:#ffb3a1}
.l14-cmp{display:flex;flex-direction:column;align-items:center;gap:8px}
.l14-cmp>span{color:#cfc8f5;font-size:14px;font-weight:700}
.l14-cmp .l14-card{width:54px;height:72px;font-size:30px;border-radius:12px}
.l14-ans{display:flex;flex-direction:column;gap:8px;margin-top:10px;padding:10px 12px;border-radius:14px;background:#fff;border:2px solid var(--sun)}
.l14-ans .opts{display:flex;flex-wrap:wrap;gap:8px}
.l14-ans .chip{font-size:16.5px;font-weight:700;padding:8px 16px}
.l14-said{font-size:14.5px;font-weight:700;color:var(--sky)}
.l14-goal{color:#ffd43b;font-family:var(--f-display);font-weight:800;font-size:22px;letter-spacing:.06em}
.l14-think{white-space:pre-wrap;font-size:15px;line-height:1.6;color:var(--ink);margin-top:4px}
.l14-chain{font-family:var(--f-display);font-weight:800;font-size:18px;color:var(--grape-d);margin-top:2px}
.l14-you{font-size:15px;font-weight:700;color:var(--sky);margin-top:4px}
.l14-epi{font-size:15px;font-weight:700;color:var(--mint-d);margin-top:6px}
.l14-verd{font-size:14.5px;line-height:1.5;padding:8px 12px;border-radius:12px;background:#fff;border:2px solid var(--mint);color:var(--ink);margin-top:8px}
.l14-verd.bad{border-color:var(--coral)}
.l14-tag{display:inline-block;font-size:12.5px;font-weight:700;border-radius:999px;padding:1px 10px;background:var(--coral-soft);color:var(--coral-d);margin-top:6px}
.l14-map{display:grid;grid-template-columns:repeat(auto-fill,minmax(64px,1fr));gap:5px}
.l14-map span{font-size:13px;font-weight:500;padding:3px 4px;border-radius:8px;background:#fff;border:2px solid var(--line2);color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-align:center}
.l14-map span.hit{background:var(--mint-soft);border-color:var(--mint);color:var(--mint-d);font-weight:700}
.l14-sols{display:flex;flex-wrap:wrap;gap:6px}
.l14-sols span{font-size:14px;font-weight:500;padding:2px 10px;border-radius:999px;background:#fff;border:2px solid var(--line2);color:var(--ink)}
.l14-sols span.me{background:var(--sun);border-color:var(--ink);font-weight:700}
.l14-facts{font-size:15px;line-height:1.6;color:var(--ink)}
.l14-ev{display:flex;flex-direction:column;gap:8px}
.l14-ev>div{padding:8px 12px;border-radius:12px;background:#fff;border:2px solid var(--line);font-size:14.5px;color:var(--ink);line-height:1.5}
.l14-ev b{display:block;font-size:13px;color:var(--sky)}
.l14-tbl{width:100%;border-collapse:collapse;font-size:14px}
.l14-tbl th,.l14-tbl td{padding:5px 8px;border-bottom:1px solid var(--line);text-align:left}
.l14-tbl th{color:var(--muted);font-weight:500;font-size:13px}
.l14-ex{display:flex;flex-direction:column;gap:12px;font-size:14px}
@media (max-width:880px){.l14-flip>.l14-col{display:contents}.l14-flip .knobs{order:1}.l14-flip .go-row{order:2}.l14-flip>.l14-board{order:3}.l14-flip .ai-out{order:4}}
@media (max-width:480px){.l14-ops button{width:48px;height:48px;font-size:26px}.l14-cmp .l14-card{width:44px;height:60px;font-size:25px}.l14-grid{padding:8px;gap:3px}.l14-grid button{font-size:12px;border-radius:7px;border-width:1.5px}.l14-card{width:54px;height:74px;font-size:31px}.l14-cards{gap:8px}.l14-stats .stat .v{font-size:18px}}`;

/* ================= helpers ================= */
const ctls=new Set();function stopAll(){ctls.forEach(c=>{try{c.abort();}catch(e){}});ctls.clear();}
/* AI call wrapper: null => offline */
async function ask(prompt,{json=false,tier='quick',onText}={}){if(!App.AI.real())return null;const c=new AbortController();ctls.add(c);
 try{const r=await App.AI.chat(prompt,{json,tier,onText,signal:c.signal});return r;}
 catch(e){if(e&&e.code==='cancelled')return {cancel:1};App.AI.fail&&App.AI.fail(e);return {err:App.AI.errText(e)};}finally{ctls.delete(c);}}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const live=()=>App.AI.real();
/* save, then refresh the evidence list of the TALK station */
const touch=()=>{App.touch();if(L._ev5)L._ev5();};
/* back to the waiting state when the student picks another set of numbers */
const resetOut=(s,box,fb,wait)=>{s.classList.remove('ran');const f=$(fb,s);if(f)f.innerHTML='';const b=$(box,s);if(!b)return;b.classList.add('wait');b.classList.remove('busy');$('.ai-body',b).textContent=wait;$('.ai-src',b).innerHTML='';const o=$('.bot',b);if(o)o.outerHTML=App.bot('idle');const g=$('.btn.go',s);if(g)g.classList.remove('again');};
const alive=el=>!!el&&document.body.contains(el);
/* 24 点 rule: the base is always told to the AI; the two 规则卡 are told only when the student switches them on (EXP-04) */
const RULE_BASE='我们来玩 24 点游戏。规则是：每次选 4 个整数；每个数必须用且只能用一次；只能用加、减、乘、除；可以用括号改变运算顺序；计算结果要等于 24';
const CARDS=[{k:'range',t:'只选 1～10',add:'只能从 1～10 中选数'},{k:'dist',t:'不可重复',add:'选的数不可重复'}];
const ruleText=ks=>RULE_BASE+CARDS.filter(c=>(ks||[]).includes(c.k)).map(c=>'；'+c.add).join('');
const cardsOn=t=>{const e=ruleEls(t);return CARDS.filter(c=>e.includes(c.k)).length;};
/* after every guess the student answers by tapping one of three buttons */
const ansHTML=(x,n,tip)=>`<div class="l14-ans"><span class="l14-lab">你的数是 ${n}。${tip}</span><div class="opts"><button type="button" class="chip" data-f="big">${x} 大了</button><button type="button" class="chip" data-f="small">${x} 小了</button><button type="button" class="chip" data-f="ok">猜中了</button></div></div>`;
/* wait for a tap; judge(f) returns the accepted answer or null (not accepted: stay on this guess) */
const waitAns=(g,root,judge)=>new Promise(res=>{g.res=res;$$('.l14-ans [data-f]',root).forEach(b=>b.onclick=()=>{if(g.res!==res)return;const f=judge(b.dataset.f);if(f){g.res=null;res(f);}});});
const stepsFor=n=>{let lo=1,hi=100,k=0;while(true){k++;const m=mid(lo,hi);if(m===n)return k;if(m>n)hi=m-1;else lo=m+1;}};
const rowCards=(c,bad=[],cls='bad')=>`<div class="l14-cards">${c.map((n,i)=>`<span class="l14-card ${bad.includes(i)?cls:''}">${n}</span>`).join('')}</div>`;
const cardsHTML=(c,bad=[])=>`<div class="l14-cards">${c.map((n,i)=>`<span class="l14-card ${bad.includes(i)?'bad':''}">${n}</span>`).join('')}</div><div class="l14-goal">凑出 24</div>`;
const thinkHTML=(text,drop)=>{const ls=String(text||'').split('\n').map(x=>x.trim()).filter(x=>x&&!/^答案\s*[:：]/.test(x)&&!(drop&&drop.test(x)));return ls.length?`<div class="l14-think">${esc(ls.join('\n'))}</div>`:'';};
const bigOf=cl=>cl.claim==='expr'?`${esc(cl.expr)} = 24`:cl.claim==='none'?'无解':cl.claim==='invalid'?'这组数不符合规则':'没有给出明确的答案';
/* 我的记录: one row of tappable answers + one line of feedback */
const optChips=(g,opts,cur)=>`<div class="opts" data-g="${g}">${opts.map((o,i)=>`<button type="button" class="chip ${cur===i?'on':''}" data-i="${i}">${esc(o)}</button>`).join('')}</div><div class="fb" data-gfb="${g}" aria-live="polite"></div>`;
function wireOpts(root,g,fn){const bs=$$(`[data-g="${g}"] .chip`,root);bs.forEach(b=>b.onclick=()=>{bs.forEach(x=>x.classList.toggle('on',x===b));fn(+b.dataset.i);});}
const padFb=(root,g,ok,t)=>{const f=$(`[data-gfb="${g}"]`,root);if(!f)return;f.className='fb'+(t?(ok?' ok':' no'):'');f.textContent=t||'';};
const padClear=(root,g)=>{$$(`[data-g="${g}"] .chip`,root).forEach(x=>x.classList.remove('on'));padFb(root,g,true,'');};
/* range history: one row per guess, the yellow bar is what is still possible */
const px=v=>((v-1)/99*100).toFixed(2)+'%';
const pw=(a,b)=>Math.max(1.5,(b-a)/99*100).toFixed(2)+'%';
function rowsHTML(h,{secret=null}={}){let lo=1,hi=100;const out=[];const sc=secret!=null?`<i class="sc" style="left:${px(secret)}"></i>`:'';
 h.forEach((x,k)=>{const [a,b]=[lo,hi];const nr=rangeOf([x],lo,hi);const lie=secret!=null&&x.f!=='wrong'&&truthFb(x.g,secret)!==x.f;
  const left=x.f==='ok'?'猜中了！':nr[0]>nr[1]?'一个数也不剩':nr[0]===nr[1]?`只剩 ${nr[0]}`:`剩 ${nr[0]}～${nr[1]}`;
  out.push(`<div class="l14-row ${lie?'lie':''} ${a>b?'nil':''}"><span class="k">#${k+1}</span><span class="tr">${a<=b?`<i class="rg" style="left:${px(a)};width:${pw(a,b)}"></i>`:''}<i class="gs" style="left:${px(x.g)}"></i>${sc}</span><span class="t">猜 <b>${x.g}</b> → ${FB[x.f]}${lie?'（谎话）':''} · ${left}</span></div>`);lo=nr[0];hi=nr[1];});
 if(!(h.length&&h[h.length-1].f==='ok'))out.push(`<div class="l14-row cur ${lo>hi?'nil':''}"><span class="k">现在</span><span class="tr">${lo<=hi?`<i class="rg" style="left:${px(lo)};width:${pw(lo,hi)}"></i>`:''}${sc}</span><span class="t">${lo<=hi?`可能的数：<b>${lo===hi?lo:lo+'～'+hi}</b>`:'<b>矛盾：一个数也不剩</b>'}</span></div>`);
 return `<div class="l14-axis"><span></span><span class="ax">${[1,25,50,75,100].map(v=>`<span style="left:${px(v)}">${v}</span>`).join('')}</span></div><div class="l14-rows">${out.join('')}</div>${secret!=null?`<div class="l14-leg"><i></i>我的数 ${secret}（AI 看不到）</div>`:''}`;}
/* offline reasoning text of the bisection guesser */
function bisectThink(h){const [lo,hi]=rangeOf(h);if(!h.length)return {g:50,t:'范围是 1～100，一共 100 个可能。我先猜正中间的 50：无论你说“大了”还是“小了”，都能一下排除大约一半。'};
 const x=h[h.length-1];if(lo>hi)return {g:null,t:'矛盾'};const n=hi-lo+1;
 const why=x.f==='big'?`你说 ${x.g} 大了，说明这个数比 ${x.g} 小`:x.f==='small'?`你说 ${x.g} 小了，说明这个数比 ${x.g} 大`:`你说 ${x.g} 不对，把它排除`;
 if(n===1)return {g:lo,t:`${why}。把所有提示合起来，只剩下 ${lo} 这一个数了，所以答案一定是 ${lo}。`,fin:1};
 const g=mid(lo,hi);return {g,t:`${why}，范围缩小到 ${lo}～${hi}，还剩 ${n} 个可能。取中间的 ${g}，下一次又能排除大约一半。`};}
/* live model: next guess */
function guessPrompt(h,extra=''){return `你在和一名小学高年级学生玩猜数游戏：学生在 1～100 中想好了一个整数，你来猜。每次猜完，学生会说“大了”“小了”“正确”，也可能说“你猜错了”。\n到目前为止：\n${h.length?h.map((x,k)=>`第 ${k+1} 次你猜 ${x.g}，学生说：${FB[x.f]}`).join('\n'):'（还没有猜）'}\n${extra}请根据全部提示进行推理，决定下一步。只输出 JSON：{"think":"你的推理过程，不超过 80 字，适合小学生阅读","guess":下一次猜的整数（如果你认为不该再猜，就写 null）,"say":"想对学生说的话（可以为空）"}`;}
function cleanGuess(d){if(!d||typeof d!=='object')return null;let g=d.guess;if(typeof g==='string'&&/^\s*\d+\s*$/.test(g))g=+g;if(g!==null&&!(Number.isInteger(g)&&g>=1&&g<=100))g=undefined;return {g,t:clip(String(d.think||'').replace(/\s+/g,' '),200),say:clip(String(d.say||''),120)};}

/* ================= render ================= */
let S={};
const PRED=['5 次','7 次','10 次','50 次'];
const O_W=['往小猜：在 1～49 里找','往大猜：在 51～100 里找','随便再猜一个'];
const FAULT_Q=['用错了数','计算出错','没有错'];
const O_1=['每次猜剩下范围的正中间','从小到大一个一个猜','想到哪个猜哪个'];
const O_3=['盲目乱猜','有自己的推理思路','说不清'];
const O_4=['能发现','发现不了','要看规则有没有告诉它'];
const more=h=>`<details class="more"><summary>说明</summary>${h}</details>`;
L.render=function(){const v=$('#v-'+K);if(!v)return;
 if(!document.getElementById('css-l14')){const st=document.createElement('style');st.id='css-l14';st.textContent=CSS14;document.head.appendChild(st);}
 stopAll();S={};
 v.innerHTML=`${App.hero(K,'和 AI 比猜数、比 24 点，再故意骗骗它：它到底会不会推理？',['体验 AI 的推理能力。','了解 AI 在推理方面的优势和局限性。'])}

 <div class="station" id="l14-s0">${App.head('WARM-UP','导入 · 数字炸弹','数字炸弹','7 次以内找到藏起来的数字炸弹！')}
  <ol class="steps"><li>点一个数</li><li>7 次内找到炸弹</li></ol>
  <div class="grid2"><div class="l14-grid" id="l14-w-grid" role="group" aria-label="1 到 100 的数字"></div>
   <div class="l14-col"><div class="l14-stats" id="l14-w-st"></div><div id="l14-fb0"></div>
    <div class="row"><button class="btn ghost sm" type="button" id="l14-w-new">再玩一局</button><span class="note" id="l14-w-best"></span></div>
    <div id="l14-w-later" hidden>${App.pad('假如第一次猜 50，听到“偏大”，下一步怎么猜最好？',optChips('w-a',O_W,null))}</div></div></div>
  ${more(App.know('什么是推理','推理，就是<b>根据已有的信息，调动学过的知识进行逻辑推演，得出最合理的结论</b>。“偏大”这条信息，让我们推出“炸弹比它小”，于是一下子排除了一大片数字。每一条提示都是一条线索，把线索合在一起，范围就越来越小——这正是 AI 推理时做的事。'))}
 </div>

 <div class="station" id="l14-s1">${App.head('EXP-01','挑战一 · 玩猜数游戏','猜数推理台','想好一个数让 AI 猜，你来回答大了小了')}
  <ol class="steps"><li>挑一个数</li><li>让 AI 猜满 7 次</li></ol>
  <div class="grid2 l14-flip" data-rb="1"><div class="l14-board" id="l14-b1"></div>
   <div class="l14-col">${App.knobs([['我的数',App.range('l14-n1',1,100,1,66,''),'AI 看不到']])}
    <div class="go-row"><span class="l14-lab">我猜 AI 最多猜</span>${App.seg('pred1',PRED.map((t,i)=>[i,t]),'')}${App.go('l14-go1','让 AI 猜')}</div>
    ${App.aiBox('l14-ai1','AI 每猜一次，都会说出它的推理')}</div></div>
  <div id="l14-fb1"></div>
  <div id="l14-l1" hidden>${App.pad('AI 是怎样缩小范围的？',optChips('o1',O_1,null))}</div>
  ${more(`<p class="note">这一站要说真话：AI 猜完，你点“大了”“小了”或“猜中了”。想故意骗它，去下一站。</p>`+App.know('明确的规则和策略：二分','对于猜数游戏，AI 有明确的计算规则和策略。当它收到“猜大了”或“猜小了”的反馈时，会通过算法快速推理出下一步的最优答案：取剩下范围的正中间，每一次都能排除大约一半的数。这种基于提示和分析逐步逼近真相的过程，体现了 AI 的推理能力。这种“每次砍掉一半”的方法叫作<b>二分</b>，是计算机科学里非常重要的算法思想：1～100 最多 7 次，1～1000 也只要 10 次。')
   +`<div class="scroll"><table class="l14-tbl"><thead><tr><th>范围</th><th>二分法最多</th><th>从 1 开始逐个猜，最多</th></tr></thead><tbody>${[10,100,1000,10000].map(N=>`<tr><td>1～${N}</td><td>${WORST[N]} 次</td><td>${N} 次</td></tr>`).join('')}</tbody></table></div>`
   +App.think(['AI 的猜数策略给你带来什么启发？','在多轮游戏中，AI 的思考过程稳定吗？有没有出现错误？']))}
 </div>

 <div class="station" id="l14-s2">${App.head('EXP-02','挑战一 · 误导实验','误导实验','故意说反一次，把 AI 带进死胡同！')}
  <ol class="steps"><li>骗 AI 一次</li><li>集齐 3 种反应</li></ol>
  <div class="grid2 l14-flip" data-rb="1"><div class="l14-board" id="l14-b2"></div>
   <div class="l14-col">${App.knobs([['我的数',App.range('l14-n2',1,100,1,85,''),'AI 看不到']])}
    <div class="go-row">${App.go('l14-go2','开始骗 AI')}</div>
    ${App.aiBox('l14-ai2','AI 猜完，你来回答：挑一次故意说反')}</div></div>
  <div id="l14-fb2"></div>
  <div id="l14-l2" hidden>${App.pad('AI 被骗以后是怎么做的？',optChips('o2',RX,null))}</div>
  ${more('<p class="note">每一轮只能骗一次：挑一次故意点错的回答，其余都说真话。离线演示每一轮展示一种反应。</p>'+App.know('面对矛盾，AI 的推理不够稳定','当我们故意给出错误提示，导致 AI 最终猜不出合乎逻辑的答案时，它可能会尝试用不同的方式回应。有时，它会<b>推测</b>我们曾给出过错误提示；有时，它会<b>追溯推理步骤</b>，向我们确认它猜出的答案是否正确；还有的时候，它会<b>按照自己的逻辑重新推理</b>……这说明，AI 虽然具备一定的推理能力，但当面对矛盾或误导时，它的思考过程及给出答案的能力仍不够稳定。')
   +App.think(['给 AI 提供一次错误提示后，它最终会生成什么样的结果？','当 AI 被误导，无法得出正确答案时，它后续的思考和回答说明了什么？']))}
 </div>

 <div class="station" id="l14-s3">${App.head('EXP-03','挑战二 · 玩 24 点游戏','24 点擂台','先自己凑 24，再看 AI 怎么推理')}
  <ol class="steps"><li>自己先凑 24</li><li>解出 2 组</li></ol>
  <div class="grid2"><div class="l14-col"><div class="stage l14-table" id="l14-tb3"><div class="l14-goal">目标：凑出 24</div><div class="l14-cards" id="l14-play"></div>
     <div class="l14-ops" id="l14-ops">${[['+','加'],['-','减'],['*','乘'],['/','除']].map(([o,t])=>`<button type="button" data-op="${o}" aria-label="${t}">${SYM[o]}</button>`).join('')}</div><div class="l14-tip" id="l14-tip3" aria-live="polite"></div></div>
    <div class="row"><button class="btn ghost sm" type="button" id="l14-undo">撤销一步</button><button class="btn ghost sm" type="button" id="l14-re3">重来</button></div></div>
   <div class="l14-col">${App.knobs([['这组数',App.seg('set3',[...SETS3.map((x,i)=>[i,x.c.join(' ')]),['r','随机抽']],'0')]])}
    <div class="go-row"><button type="button" class="chip" id="l14-none" aria-pressed="false">我猜这组无解</button>${App.go('l14-go3','看 AI 推理')}</div>
    ${App.aiBox('l14-ai3','AI 会说出它试过哪些路')}<div id="l14-fb3"></div>
    <div class="after-run"><div class="box l14-col" id="l14-map3"></div>${App.pad('AI 是乱猜，还是有自己的思路？',optChips('o3',O_3,null))}</div></div></div>
  ${more('<p class="note">本挑战的 24 点游戏，要求在 1～10 中任意选取 4 个整数，不可重复选取。通过加、减、乘、除运算将 4 个数组合成算式，计算后得出 24。抽取的每个数必须用且只能用一次。允许使用括号改变运算顺序。</p><p class="note">玩法：点一张牌，点一个运算符号，再点另一张牌，两张牌就合成一张。合到只剩一张，看它是不是 24。</p>'+App.know('按规则组合信息，快速尝试','AI 能按照自己学习过的逻辑和规则，组合已有信息，快速尝试可能的解决方法，直到给出结论。平台的推理程序就是这样做的：每次挑两个数、选一种运算合并成一个数，再继续合并，直到只剩一个数，看它是不是 24。一组 4 个数，大约有 2300 条这样的路，电脑几毫秒就能全部走完——这是 AI “算得快”的优势。注意：大语言模型并不一定真的把每条路都走完，所以它的答案仍要验算。')
   +App.think(['AI 解决 24 点游戏问题的思考过程给你带来什么启发？']))}
 </div>

 <div class="station" id="l14-s4">${App.head('EXP-04','挑战二 · 无解与违规','无解与违规','给 AI 一组怪数，看它会不会上当')}
  <ol class="steps"><li>交给 AI 一组数</li><li>让 AI 发现违规</li></ol>
  <div class="grid2"><div class="l14-col"><div class="stage l14-table" id="l14-tb4"></div><div class="after-run"><div class="box l14-facts" id="l14-fact4"></div></div></div>
   <div class="l14-col">${App.knobs([['这组数',App.seg('set4',CARD4.map(c=>[c.id,c.c.join(' ')]),'u')],['规则卡',CARDS.map(c=>`<button type="button" class="chip" data-card="${c.k}" aria-pressed="false">${c.t}</button>`).join(''),'点亮 = 告诉 AI']])}
    <div class="go-row"><span class="l14-lab">我猜 AI 说</span>${App.seg('pred4',[['0','算出 24'],['1','无解'],['2','不合规则']],'')}${App.go('l14-go4','交给 AI')}</div>
    ${App.aiBox('l14-ai4','AI 会先看规则，再检查这组数')}<div id="l14-fb4"></div>
    <div class="after-run">${App.pad('数不合规则时，AI 能发现吗？',optChips('o4',O_4,null))}</div></div></div>
  ${more('<p class="note">AI 一直知道的规则：选 4 个整数，每个数用且只用一次，用加减乘除和括号，结果等于 24。两张规则卡点亮后才会告诉它。</p>'+App.know('“撞了南墙就回头”','这个挑战展现了 AI 推理的鲜明特点。AI 解决 24 点游戏问题的思考过程就像“撞了南墙就回头”，这条路行不通就换条路继续走，这其实是在不断尝试不同方法。此外，由于 AI 的推理依赖既定规则，所以在多数情况下，当我们提出的问题没有符合规则的答案时，它会在尝试可能的解决方法后如实反馈。但“依赖规则”也意味着：<b>我们没告诉它的规则，它可能不会检查</b>；偶尔它还会编出看起来对的答案——所以要验算。')
   +App.think(['当面对无法得出结果的算式时，AI 是否尝试多种组合后才得出结果？','当遇到无解的推理问题时，AI 是怎样做的？这体现了 AI 推理的什么特点？']))}
 </div>

 <div class="station" id="l14-s4b">${App.head('EXP-04b','挑战二 · 无解与违规','给 AI 挑错','AI 说它算出来了。抓出它的错！')}
  <ol class="steps"><li>用验算器查</li><li>两个都抓到</li></ol>
  <div class="grid2" data-rb="1"><div class="l14-col">${App.aiBox('l14-aif','')}<div class="stage l14-table" id="l14-tbf"></div></div>
   <div class="l14-col">${App.knobs([['AI 的回答',App.seg('fa',[['0','第 1 个'],['1','第 2 个']],'0')]])}
    <div class="go-row">${App.go('l14-gof','用验算器查')}</div>
    <div id="l14-lf" hidden>${App.pad('对照验算器：这个回答错在哪？',optChips('jf',FAULT_Q,null))}</div>
    <div id="l14-fbf"></div></div></div>
  ${more('<p class="note">这两个回答是示意：AI 在 24 点游戏里可能出现的错误。用错了数，指偷换、漏用或多用了数。按下大按钮，验算器会列出 AI 用到的数，并算出算式的值。</p>')}
 </div>

 <div class="station" id="l14-s5">${App.head('TALK','思辨 · 人机推理大讨论','人机推理大讨论','9 张卡分一分：谁的优势，谁的局限？')}
  <ol class="steps"><li>分完 9 张卡</li><li>写下我的观点</li></ol>
  <div class="grid2"><div class="box l14-col"><div class="box-t">我的推理证据</div><div class="l14-ev" id="l14-ev5"></div></div>
   <div class="l14-col">${App.pad('','<div id="l14-sortq"></div>','分一分')}<div id="l14-fb5"></div>
    <div class="after-run">${App.pad('推理时，人有什么 AI 比不了的本领？','<textarea id="l14-tk2" maxlength="300" placeholder="我们能……" aria-label="人类推理的优势"></textarea>')}</div></div></div>
  ${more(App.know('善用 AI，也锻炼自己','AI 的推理能力能提升我们探索规律与解决问题的效率。然而，当 AI 被误导或面对非常规情况时，它的推理过程和结果则会表现出不稳定性。相比之下，虽然我们不如 AI 记得多、算得快，但能通过持续学习来锻炼和提升自己的推理能力。当我们具备严谨的逻辑思维后，便能对 AI 给出的推理结果进行辨别、验证。更重要的是，我们既能理解问题语境与意图，还能关联个人经验，跳出既有规则进行创造性思考。这些都是目前 AI 难以复制的特征。')
   +App.think(['AI 的推理方式有哪些优势和局限性？','人类在推理方面有哪些 AI 不可替代的优势？']))}
 </div>

 <div class="station" id="l14-quiz">${App.head('QUIZ','反思与总结','小测验','5 道题，第一次作答计入能力图谱')}<div id="l14-qz"></div></div>
 <div class="station" id="l14-diary"></div>`;
 if(!App.rec)return;
 const lr=App.lesson(K);
 wire0(v,lr);wire1(v,lr);wire2(v,lr);wire3(v,lr);wire4(v,lr);wire4b(v,lr);wire5(v,lr);
 App.quiz($('#l14-qz'),K,QUIZ);
 const rd=App.diary($('#l14-diary'),K,{title:'我的推理记录',lead:'用这节课的证据来回答',
  fields:[{id:'tip',q:'数字炸弹和 24 点里，我的推理心得是什么？（我用了什么策略？哪一步最关键？）',ph:'猜数时……；算 24 点时……'},
   {id:'who',q:'我和 AI，谁更会推理？请用这节课的证据说明。',ph:'AI 更强在……；我更强在……'},
   {id:'collab',q:'在推理问题时，我们应该如何与 AI 协作？应该培养自身的哪些能力？',ph:'让 AI……，我自己……；我要培养……'}],
  pledge:'我会善用 AI 的推理能力，也坚持自己思考：先自己想，再看 AI；AI 给出的推理结果，我会辨别、验证。',
  extras:ex=>diaryExtras(ex)});
 if(!L._on){L._on=1;App.on(()=>{if(App.current===K&&L._rd)L._rd();});}L._rd=rd;
};

const setOpt=(root,g,i)=>{if(i==null)return;const b=$(`[data-g="${g}"] [data-i="${i}"]`,root);if(b)b.classList.add('on');};
const setSeg=(root,name,v)=>{if(v==null)return;$$(`[data-seg="${name}"] .chip`,root).forEach(b=>b.classList.toggle('on',b.dataset.v===String(v)));};

/* ================= WARM-UP: 数字炸弹 ================= */
function wire0(v,lr){const s=$('#l14-s0',v),grid=$('#l14-w-grid',s),fb='#l14-fb0';lr.w=lr.w||{};const W=lr.w;
 const draw=()=>{const w=S.w;grid.innerHTML=Array.from({length:100},(_,i)=>{const n=i+1,out=n<w.lo||n>w.hi,hit=w.done&&n===w.bomb;return `<button type="button" data-n="${n}" class="${out&&!hit?'out':''} ${w.g.includes(n)?'g':''} ${hit?'hit':''}" aria-label="${n}${out?'（已排除）':''}">${n}</button>`;}).join('');
  $$('[data-n]',grid).forEach(b=>b.onclick=()=>guess(+b.dataset.n));
  $('#l14-w-st',s).innerHTML=[['已猜次数',w.g.length],['炸弹可能在',w.done?w.bomb:`${w.lo}～${w.hi}`],['白猜的次数',w.x]].map(([l,x])=>`<div class="stat"><div class="v">${x}</div><div class="l">${l}</div></div>`).join('');
  $('#l14-w-best',s).textContent=W.games?`玩了 ${W.games} 局，最少 ${W.best} 次`:'';};
 const newGame=()=>{let b;do{b=1+Math.floor(Math.random()*100);}while(b===50);S.w={bomb:b,g:[],lo:1,hi:100,x:0,done:0};draw();};
 const marks=()=>{if(W.done)App.markStep(s,0);if(W.best&&W.best<=7)App.markStep(s,1);$('#l14-w-later',s).hidden=!W.done;};
 const guess=n=>{const w=S.w;if(w.done){App.fb(fb,'try','这一局已经结束','点「再玩一局」，换一颗炸弹。');return;}
  const wasOut=n<w.lo||n>w.hi;w.g.push(n);if(wasOut)w.x++;App.markStep(s,0);const k=w.g.length;
  if(n===w.bomb){w.done=1;w.lo=w.hi=n;W.games=(W.games||0)+1;W.best=Math.min(W.best||99,k);W.g=w.g.slice(0,20);W.n=k;W.x=w.x;W.bomb=n;W.done=1;touch();marks();draw();
   App.fb(fb,'ok',`找到炸弹 ${n}！用了 ${k} 次`,k<=7?'7 次以内，真快！下一站看看 AI 是怎么猜的。':'每次都猜剩下范围的正中间，最多 7 次就够。再玩一局试试。',{stars:k<=7?3:k<=10?2:1});return;}
  const big=n>w.bomb;if(!wasOut){if(big)w.hi=n-1;else w.lo=n+1;}draw();
  if(wasOut)App.fb(fb,'try',`${n} 早就被排除了`,`白猜了一次。炸弹在 ${w.lo}～${w.hi} 之间。`);
  else App.fb(fb,'find',`${n} ${big?'偏大':'偏小'}！`,`炸弹比 ${n} ${big?'小':'大'}，在 ${w.lo}～${w.hi} 之间，还剩 ${w.hi-w.lo+1} 个数。`);};
 $('#l14-w-new',s).onclick=newGame;
 const say=i=>padFb(s,'w-a',i===0,i==null?'':i===0?'对！“偏大”说明炸弹比 50 小，50～100 全部排除。接着猜 1～49 的正中间，又能排除一半。':'再想想：“偏大”说明炸弹比 50 大，还是比 50 小？');
 setOpt(s,'w-a',W.a);say(W.a);
 wireOpts(s,'w-a',i=>{W.a=i;say(i);touch();});
 newGame();marks();if(W.done)App.ran(s);}

/* ================= EXP-01: 猜数推理台 ================= */
function wire1(v,lr){const s=$('#l14-s1',v),box='#l14-ai1',fb='#l14-fb1',b=$('#l14-go1',s),later=$('#l14-l1',s);lr.s1=lr.s1||{};const s1=lr.s1;s1.ob=s1.ob||{};s1.rounds=s1.rounds||[];
 const WAIT='AI 每猜一次，都会说出它的推理';
 const num=()=>+$('#l14-n1',s).value;
 const board=(h,n)=>{$('#l14-b1',s).innerHTML=rowsHTML(h,{secret:n});};board([],num());
 const stop=()=>{const g=S.g1;S.g1=null;if(g&&g.res){const r=g.res;g.res=null;r(null);}};
 /* moving the slider in the middle of a round ends that round */
 App.rangeWire('l14-n1',()=>{const was=S.g1;stop();board([],num());if(was){resetOut(s,box,fb,WAIT);App.busy(b,false);}});
 setSeg(s,'pred1',s1.pred);App.segWire(s,'pred1',x=>{s1.pred=+x;touch();});
 const marks=()=>{if(s1.rounds.length)App.markStep(s,0);if(s1.rounds.some(r=>r.st>=7))App.markStep(s,1);later.hidden=!s1.rounds.length;};
 b.onclick=async()=>{stop();const n=num(),g={n,h:[],bad:0,off:0,m:'offline'};S.g1=g;let last='';board([],n);b.classList.remove('again');
  App.fb(fb,'find','AI 开始猜了',`它每猜一次，你来回答。你的数是 ${n}。`);
  while(g.h.length<12){let r=null;const k=g.h.length+1,pv=g.h[k-2];
   App.busy(b,true,'AI 正在想…');App.aiSay(box,pv?`<p class="l14-said">你说：${pv.g} ${FB[pv.f]}</p>我想想下一步……`:'范围是 1～100，先想想猜哪个数……',{busy:true});
   if(live()){const res=await ask(guessPrompt(g.h),{json:true});if(S.g1!==g)return;if(res&&res.cancel)break;
    if(res&&res.data){const c=cleanGuess(res.data);if(c&&Number.isInteger(c.g)){r={g:c.g,t:c.t};g.m=res.mode;}}}
   if(!r){await sleep(450);if(S.g1!==g)return;r=bisectThink(g.h);}
   const [lo,hi]=rangeOf(g.h);if(r.g<lo||r.g>hi)g.bad++;else if(Math.abs(r.g-mid(lo,hi))>1)g.off++;
   last=r.t;App.busy(b,false);b.textContent='重新开始';const truth=truthFb(r.g,n);
   App.aiSay(box,`<div class="big">第 ${k} 次：我猜 ${r.g}</div><div class="l14-think">${esc(r.t)}</div>${ansHTML(r.g,n,'告诉 AI：')}`,{mood:'think',src:g.m});
   const f=await waitAns(g,$(box,s),x=>{if(x===truth)return x;
    if(truth==='ok')App.fb(fb,'try',`${r.g} 就是你的数`,'它猜中了，点“猜中了”。');
    else App.fb(fb,'try',`${r.g} 比 ${n} ${truth==='big'?'大':'小'}`,`点“${r.g} ${FB[truth]}”。这一站说真话，想骗它去下一站。`);return null;});
   if(!f||S.g1!==g)return;$(fb,s).innerHTML='';
   g.h.push({g:r.g,f});board(g.h,n);if(f==='ok')break;}
  S.g1=null;App.busy(b,false);b.textContent='再来一轮';b.classList.add('again');
  const st=g.h.length,done=st&&g.h[st-1].f==='ok',chain=g.h.map(x=>x.g).join(' → ');
  if(!done){App.aiSay(box,`<div class="big">${st} 次还没猜中</div><div class="l14-chain">${chain}</div>`,{mood:'oops',src:g.m});
   App.fb(fb,st?'oops':'try',st?'AI 这一轮没猜中！':'这一轮停下了',st?`猜了 ${st} 次还没找到 ${n}：它没有每次都取正中间。再来一轮看看。`:'再按一次大按钮。',{stars:s1.rounds.length?1:0});return;}
  const bis=!g.bad&&!g.off;
  const R=s1.rounds.slice(-7);R.push({n,g:g.h.map(x=>x.g),st,m:g.m,bad:g.bad});s1.rounds=R;S.bis1=bis;lr.nExp=(lr.nExp||0)+1;touch();marks();
  App.aiSay(box,`<div class="big">${st} 次猜中 ${n}</div><div class="l14-chain">${chain}</div><div class="l14-think">${esc(g.m==='offline'?'我的办法：每次都猜剩下范围的正中间。听到“大了”或“小了”，就能排除大约一半的数。':last)}</div>`,{mood:g.bad?'oops':'happy',src:g.m});
  const p=s1.pred,pt=p==null?'':p===1?'你猜“最多 7 次”：对，每次猜正中间，7 次一定够。':p===0?'你猜最多 5 次：不够，最难猜的数要 7 次。':`你猜最多 ${PRED[p]}：用不了那么多，每次猜正中间，7 次一定够。`;const full=R.some(r=>r.st>=7),base=full?3:R.length>=2?2:1;
  const hard=[100,1,99,51].find(x=>stepsFor(x)>=7&&x!==n),next=R.length>=2?`还没猜满 7 次？试试 ${hard}。`:'换一个数，能让它猜满 7 次吗？';
  if(g.bad)App.fb(fb,'oops','你发现 AI 的错误了！',`它有 ${g.bad} 次猜了早就被排除的数。AI 的推理也会出错。`,{stars:base});
  else if(st>7)App.fb(fb,'oops',`AI 用了 ${st} 次才猜中`,'比 7 次还多：看左边的图，它没有每次都猜正中间。AI 的推理不一定是最好的。',{stars:base});
  else if(st===7)App.fb(fb,'ok','你让 AI 猜满了 7 次！',pt+(bis?'100 → 50 → 25 → 12 → 6 → 3 → 1，再难猜的数，7 次也够。':''),{stars:3});
  else App.fb(fb,'find',`AI 只用 ${st} 次就猜中`,pt+(bis?'每猜一次，范围砍掉一半。':'')+(full?'':next),{stars:base});};
 /* the "right" observation is only asserted when the round on screen really was bisection */
 const say=i=>padFb(s,'o1',i===0||S.bis1===false,i==null?'':S.bis1===false?'记下了。这一轮 AI 没有每次都猜正中间，再看一轮比一比。':i===0?'观察准确！这种每次砍掉一半的办法叫“二分”。':'再看上面的图：每一次猜的数，在黄色范围的什么位置？');
 const q1=typeof s1.ob.q1==='number'?s1.ob.q1:null;setOpt(s,'o1',q1);say(q1);
 wireOpts(s,'o1',i=>{s1.ob.q1=i;say(i);touch();});
 marks();}

/* ================= EXP-02: 误导实验 ================= */
/* offline reactions (textbook p.137): 推测 / 追溯确认 / 重新推理, plus one clearly-labelled faulty one */
const RX=['推测我给过错误提示','追溯步骤，向我确认','按自己的逻辑重新推理','坚持自己的答案'];
function offlineReact(g,style){const h=g.h;const sus=suspects(h);const [lo,hi]=rangeOf(h);const lastG=g.last;
 const steps=h.map((x,k)=>`${k+1}. 猜 ${x.g}，你说“${FB[x.f]}”`).join('\n');
 if(style===0){if(!sus.length)return {t:'我的推理出现了矛盾：按你的全部提示，没有任何数符合。我推测你可能给错了不止一次提示，或者记错了自己想的数。能告诉我是哪一次吗？',ask:'pick'};
  const best=sus[sus.length-1];return {t:`我的推理出现了矛盾：把你的全部提示合在一起，1～100 里没有一个数符合。\n我推测你曾经给出过一次错误提示。把每条提示反过来试一试，${sus.length===1?'只有':'最可能是'}第 ${best.i+1} 次（猜 ${h[best.i].g} 时你说“${FB[h[best.i].f]}”）${sus.length>1?`（另外 ${sus.slice(0,-1).map(x=>'第 '+(x.i+1)+' 次').join('、')}也有可能）`:''}：如果那次其实是“${h[best.i].f==='big'?'小了':'大了'}”，${best.lo===best.hi?`答案就是 ${best.lo}`:`答案就在 ${best.lo}～${best.hi} 之间`}。是这样吗？`,ask:sus.length>1?'sus':'yes',fix:best.i,sus};}
 if(style===1)return {t:`我来追溯一下推理步骤：\n${steps}\n每一步我都是按你的提示缩小范围的，${lo<=hi?`最后只剩 ${lo}`:`最后范围空了`}。请你确认：${lastG!=null?`${lastG} 真的不是你想的数吗？`:''}如果不是，请告诉我上面哪一步的提示有误。`,ask:'pick'};
 if(style===2)return {t:`既然按照这些提示得不出合理的答案，那我按自己的逻辑重新推理：可能有的提示不可靠，我不再使用之前的全部提示，从 1～100 重新开始，先猜 50。`,restart:1};
 return {t:`根据我的推理，每一步都没有问题，答案就是 ${lastG}，不可能错。可能是你记错了自己想的数，请再检查一下。`,stubborn:1};}
const RX_BIG=g=>['你是不是说错过一次？','请帮我确认一下','我重新推理一遍',`我没错，答案就是 ${g.last}！`];
function wire2(v,lr){const s=$('#l14-s2',v),box='#l14-ai2',fb='#l14-fb2',b=$('#l14-go2',s),later=$('#l14-l2',s);lr.s2=lr.s2||{};const s2=lr.s2;s2.ob=s2.ob||{};s2.runs=s2.runs||[];
 const WAIT='AI 猜完，你来回答：挑一次故意说反';
 const num=()=>+$('#l14-n2',s).value;
 const board=(h,n)=>{$('#l14-b2',s).innerHTML=rowsHTML(h,{secret:n});};board([],num());
 const stop=()=>{const g=S.g2;S.g2=null;if(g&&g.res){const r=g.res;g.res=null;r(null);}};
 App.rangeWire('l14-n2',()=>{const was=S.g2;stop();board([],num());if(was){resetOut(s,box,fb,WAIT);App.busy(b,false);}});
 /* kinds of reaction seen: offline = distinct styles; live model = number of misled rounds (the student classifies them) */
 const kinds=()=>{const R=s2.runs.filter(r=>r.lie);return Math.min(3,Math.max(new Set(R.filter(r=>r.rx!=null).map(r=>r.rx)).size,R.filter(r=>r.rx==null).length));};
 const marks=()=>{if(s2.runs.some(r=>r.lie))App.markStep(s,0);if(kinds()>=3)App.markStep(s,1);};
 const save=(g,rx,solved)=>{const R=s2.runs.slice(-7);const rec={n:g.n,h:g.all.slice(0,16).map(x=>[x.g,x.f]),lie:g.lieN?1:0,rx,m:g.m,solved:solved?1:0};R.push(rec);s2.runs=R;s2.n=(s2.n||0)+1;lr.nExp=(lr.nExp||0)+1;S.run2=rec;padClear(s,'o2');later.hidden=!g.lieN;touch();marks();};
 b.onclick=async()=>{stop();const n=num(),g={n,h:[],all:[],m:'offline',lieN:0};S.g2=g;let out=null;board([],n);b.classList.remove('again');later.hidden=true;
  App.fb(fb,'find','AI 开始猜了','它猜完你来回答。挑一次故意点错的，比如把“大了”说成“小了”。');
  for(let k=0;k<14&&!out;k++){const [lo,hi]=rangeOf(g.h);let r=null;const pv=g.all[k-1];
   App.busy(b,true,'AI 正在想…');App.aiSay(box,pv?`<p class="l14-said">你说：${pv.g} ${FB[pv.f]}</p>我想想下一步……`:'范围是 1～100，先想想猜哪个数……',{busy:true});
   if(live()){const res=await ask(guessPrompt(g.h),{json:true});if(S.g2!==g)return;if(res&&res.cancel){out={stop:1};break;}
    if(res&&res.data){const c=cleanGuess(res.data);if(c){r={g:c.g===undefined?null:c.g,t:c.t+(c.say?`\n“${c.say}”`:''),live:1};g.m=res.mode;}}}
   if(r&&(r.g==null||lo>hi)){out={live:r};break;}
   if(!r){if(lo>hi){out={react:1};break;}await sleep(450);if(S.g2!==g)return;const bt=bisectThink(g.h);r={g:bt.g,t:bt.t};}
   App.busy(b,false);b.textContent='重新开始';const truth=truthFb(r.g,n),tw=truth==='ok'?`${r.g} 就是你的数`:`${r.g} 比 ${n} ${truth==='big'?'大':'小'}`;
   App.aiSay(box,`<div class="big">第 ${k+1} 次：我猜 ${r.g}</div><div class="l14-think">${esc(r.t)}</div>${ansHTML(r.g,n,g.lieN?'已经骗过一次，这次说真话：':'想骗它，就故意点错的：')}`,{mood:'think',src:g.m});
   const f=await waitAns(g,$(box,s),x=>{if(x===truth)return x;
    if(x==='ok'){App.fb(fb,'try','这样骗不到它','说“猜中了”，游戏就结束了。把“大了”“小了”说反试试。');return null;}
    if(g.lieN){App.fb(fb,'try','已经骗过一次了',`这次说真话：${tw}。看它什么时候发现不对劲。`);return null;}
    return x;});
   if(!f||S.g2!==g)return;$(fb,s).innerHTML='';
   if(f!==truth){g.lieN=1;g.lieK=g.h.length;App.markStep(s,0);App.fb(fb,'find','骗成功了！',`其实 ${tw}，你却说“${FB[f]}”。后面都说真话，看 AI 什么时候发现。`);}
   g.h.push({g:r.g,f});g.all.push({g:r.g,f});g.last=r.g;board(g.h,n);
   if(f==='ok')out={ok:1};}
  S.g2=null;App.busy(b,false);b.textContent='再骗一轮';b.classList.add('again');
  const lieNo=g.lieK!=null?g.lieK+1:0,chain=g.all.map(x=>x.g).join(' → ');
  if(!out||out.stop){App.aiSay(box,'这一轮停下了。',{mood:'idle'});App.fb(fb,'try','这一轮没做完','再按一次大按钮。');return;}
  if(out.ok){save(g,null,1);App.aiSay(box,`<div class="big">${g.all.length} 次猜中 ${n}</div><div class="l14-chain">${chain}</div>`,{mood:'happy',src:g.m});
   if(!g.lieN)App.fb(fb,'try','还没骗它，AI 就猜中了','再来一轮：挑一次，把“大了”说成“小了”。',{stars:kinds()});
   else App.fb(fb,'find','被骗了，它还是猜中了！','这一次 AI 没被带偏。再骗一次，它每次都这么稳吗？',{stars:Math.max(1,kinds())});return;}
  if(out.live){save(g,null,0);App.aiSay(box,`<div class="l14-think">${esc(out.live.t)}</div>`,{mood:'think',src:g.m});
   if(!g.lieN)App.fb(fb,'find','AI 自己停下了','你还没骗它，它就不往下猜了。读读它的回答，再来一轮。',{stars:kinds()});
   else App.fb(fb,'find','AI 遇到矛盾了！',`第 ${lieNo} 次的谎话把 ${n} 排除了。读读它的回答：它是怎么做的？`,{stars:Math.max(1,kinds())});return;}
  /* offline: one of four reactions per round, then what happens next */
  const st=s2.runs.filter(r=>r.lie&&r.rx!=null).length%4,R=offlineReact(g,st);let epi='',solved=0;
  const cont=h=>{for(let c=1;c<=9;c++){const [lo,hi]=rangeOf(h);if(lo>hi)return 0;const x=mid(lo,hi),f=truthFb(x,n);h.push({g:x,f});if(f==='ok')return c;}return 0;};
  if(st<=1){const h2=g.h.filter(x=>x.f!=='wrong').map((x,i)=>i===g.lieK?{g:x.g,f:truthFb(x.g,n)}:x);
   if(h2[g.lieK].f==='ok'){h2.length=g.lieK+1;epi=`平台替你说出真相：第 ${lieNo} 次它其实已经猜中 ${n} 了。`;solved=1;}
   else{const c=cont(h2);solved=c>0;epi=`平台替你说出真相：第 ${lieNo} 次是谎话。AI 改掉那条提示，${c?`又猜 ${c} 次，猜中了 ${n}`:`很快找到了 ${n}`}。`;}}
  else if(st===2){const h2=[];const c=cont(h2);solved=1;epi=`AI 丢掉全部提示，从 1～100 重新猜。这回平台替你全说真话，它 ${c} 次猜中了 ${n}。`;}
  else epi='AI 不再推理，一口咬定自己没错。';
  board(g.h,n);
  App.aiSay(box,`<div class="big">${RX_BIG(g)[st]}</div><div class="l14-think">${esc(R.t)}</div><p class="l14-epi">${esc(epi)}</p>${st===3?'<span class="l14-tag">示意：AI 可能出现的错误</span>':''}`,{mood:st===3?'oops':'think',src:'offline'});
  save(g,st,solved);const kn=kinds();
  if(st===3)App.fb(fb,'oops','AI 嘴硬了！',`提示明明互相矛盾，它却坚持答案是 ${g.last}。已集齐 ${kn}/3 种反应。`,{stars:kn});
  else App.fb(fb,'find','AI 掉进了矛盾！',`第 ${lieNo} 次的谎话把 ${n} 排除了。这次它是怎么做的？已集齐 ${kn}/3 种反应。`,{stars:kn});};
 wireOpts(s,'o2',i=>{s2.ob.q2=i;const r=S.run2;if(r)r.cls=i;
  if(r&&r.rx!=null)padFb(s,'o2',i===r.rx,i===r.rx?'观察准确！再骗一次，看它会不会换一种做法。':`再读一遍 AI 的话：这一次更像“${RX[r.rx]}”。`);
  else padFb(s,'o2',true,'记下了。多骗几次，它每次都这样做吗？');touch();});
 setOpt(s,'o2',s2.ob.q2);marks();later.hidden=!s2.runs.some(r=>r.lie);}

/* ================= 24 点: AI reasoning text (offline) and verdict ================= */
function offlineSolveText(nums,ruleTxt){const els=ruleEls(ruleTxt);const viol=ruleCheck(nums);const L2=[];
 if(!nz(ruleTxt))L2.push('你还没有告诉我规则，我就按“用这几个数和加减乘除算出 24”来推理。');
 else L2.push(`【学习规则】我记住了你告诉我的规则：${RULE_EL.filter(e=>els.includes(e.k)).map(e=>e.t).join('；')||'（没有找到具体要求）'}。`);
 const caught=viol.filter(p=>els.includes(p.k));
 if(caught.length){L2.push(`【检查数字】${caught.map(p=>p.t).join('；')}，不符合规则。`);L2.push('答案：不符合规则');return {text:L2.join('\n'),claim:'invalid'};}
 L2.push(`【检查数字】${nums.join('、')}：${viol.length?'按我知道的规则，没有发现问题。':'符合规则。'}`);
 const r=solve24(nums);L2.push('【推理思路】24 可以由 3×8、4×6、2×12、20+4、48÷2 等得到。我每次挑两个数合并，看最后能不能得到 24，这条路走不通就回头换一条。');
 const dead=r.deadBefore.filter(x=>!x.hits);dead.slice(0,2).forEach(x=>L2.push(`· 先算 ${x.step}，再和 ${x.rest.join('、')} 一起算：试了 ${x.leaves} 种算法，都不是 24，回头。`));
 if(dead.length>2)L2.push(`· ……又换了 ${dead.length-2} 条路，也都走不通。`);
 if(r.firstPath){L2.push(`· 换成 ${r.firstPath.join('，再算 ')}。找到了！`);L2.push(`答案：${r.sols[0]}`);return {text:L2.join('\n'),claim:'expr',expr:r.sols[0]};}
 L2.push(`· 全部 ${r.first.length} 种第一步、共 ${r.tried} 种算法都试过了，没有一种等于 24。`);L2.push('答案：无解');return {text:L2.join('\n'),claim:'none'};}
function claimOf(text){const ms=[...String(text||'').matchAll(/答案\s*[:：]\s*([^\n]+)/g)];const last=ms.length?ms[ms.length-1][1].trim():'';
 if(!last){const m=/(无解|不符合规则)/.exec(text||'');return m?{claim:m[1]==='无解'?'none':'invalid'}:{claim:'?'};}
 if(/不符合/.test(last))return {claim:'invalid'};if(/无解|没有解|不能/.test(last))return {claim:'none'};return {claim:'expr',expr:last.replace(/[=＝]\s*24\s*$/,'').replace(/[。.]$/,'').trim()};}
function verdict(nums,c,sol){const viol=ruleCheck(nums);const n=sol.sols.length;
 if(c.claim==='expr'){const k=check24(c.expr,nums);if(k.err)return {ok:0,t:`AI 写的算式“${c.expr}”平台看不懂（${k.err}）。`};
  if(!k.okN)return {ok:0,t:`AI 的算式 ${c.expr} 用到的数是 ${k.used.join('、')}，和给的 ${nums.join('、')} 不一致${k.ok24?'（结果虽然是 24）':`，结果是 ${k.val}`}。${n?'':'这组数其实无解。'}`};
  if(!k.ok24)return {ok:0,t:`AI 的算式 ${c.expr} 实际等于 ${k.val}，不是 24。`};
  if(viol.length)return {ok:0,t:`算式算对了，但这组数不符合规则（${viol.map(p=>p.t).join('；')}），AI 没有发现。`,warn:1};
  return {ok:1,t:`平台验算：${c.expr} = 24，四个数各用一次 ✓。这组数一共有 ${n} 种不同解法。`};}
 if(c.claim==='none'){if(viol.length)return {ok:0,t:`AI 说无解，但真正的问题是这组数不符合规则（${viol.map(p=>p.t).join('；')}）${n?`；而且单看算术，它其实能算出 24（${n} 种）`:''}。`,warn:1};
  return n?{ok:0,t:`AI 说无解，但平台找到了 ${n} 种解法，例如 ${sol.sols[0]}。`}:{ok:1,t:`平台把 ${sol.tried} 种算法全部试过，确实没有一种等于 24：AI 如实反馈了“无解”✓。`};}
 if(c.claim==='invalid')return viol.length?{ok:1,t:`AI 发现了问题 ✓：${viol.map(p=>p.t).join('；')}。`}:{ok:0,t:'AI 说不符合规则，可这组数其实符合规则。'};
 return {ok:0,t:'AI 的回答最后没有写出明确的答案，无法核对。',warn:1};}
function aiPrompt(nums,rule){return `${nz(rule)?'游戏规则：'+clip(rule,300):'我们来玩 24 点。'}\n这组数：${nums.join('、')}。\n你在给小学高年级学生演示 AI 的推理过程。请先检查这组数是否符合上面的规则；再用 3～6 行简短地写出你的推理思路（先试了什么、为什么行不通、怎样换路）；最后单独一行写「答案：算式」或「答案：无解」或「答案：不符合规则」。算式只用 + − × ÷ 和括号。`;}
const mapHTML=sol=>`<div class="l14-map">${sol.first.map(x=>`<span class="${x.hits?'hit':''}" title="${esc(x.step)}：${x.leaves} 种算法，${x.hits} 种得 24">${esc(x.step.replace(/ = .*/,''))}</span>`).join('')}</div>`;
async function runAI(nums,rule,{onText}={}){if(App.AI.real()){const res=await ask(aiPrompt(nums,rule),{tier:'default',onText});
  if(res&&res.cancel)return {cancel:1};if(res&&res.text&&nz(res.text).length>4)return {text:clip(res.text,1500),m:res.mode};
  const o=offlineSolveText(nums,rule);return Object.assign(o,{m:'offline',err:res&&res.err?res.err:'AI 没有给出回答，已改用平台的推理程序。'});}
 await sleep(500);const o=offlineSolveText(nums,rule);return Object.assign(o,{m:'offline'});}

/* ================= EXP-03: 24 点擂台 ================= */
function wire3(v,lr){const s=$('#l14-s3',v),box='#l14-ai3',fb='#l14-fb3';lr.s3=lr.s3||{};const s3=lr.s3;s3.ob=s3.ob||{};s3.sets=s3.sets||[];
 const play=$('#l14-play',s),noneB=$('#l14-none',s),START='点一张牌，再点符号，再点另一张牌';
 const tip=(t,c)=>{const e=$('#l14-tip3',s);e.textContent=t;e.className='l14-tip '+(c||'');};
 /* the student's own 24 点: tap a card, an operator, another card: the two cards merge into one */
 const draw=()=>{const p=S.p3;play.innerHTML=p.items.map((x,i)=>{const t=fstr(x.f);return `<button type="button" class="l14-card ${p.sel===i?'sel':''} ${t.length>2?'sm':''}" data-i="${i}" aria-label="数 ${t}">${t}</button>`;}).join('');
  $$('[data-i]',play).forEach(b=>b.onclick=()=>tapCard(+b.dataset.i));
  $$('#l14-ops [data-op]',s).forEach(b=>b.classList.toggle('on',b.dataset.op===p.op));$('#l14-undo',s).disabled=!p.hist.length;};
 const fresh=c=>{S.p3={items:c.map(v=>({f:F(v),t:{v}})),sel:null,op:null,hist:[],win:null};draw();tip(START);};
 const tapCard=i=>{const p=S.p3;if(p.items.length<2)return;
  if(p.sel==null||!p.op||i===p.sel){p.sel=p.sel===i?null:i;p.op=null;draw();tip(p.sel==null?START:'再点一个符号：+ − × ÷');return;}
  const a=p.items[p.sel],c=p.items[i],f=OPS[p.op](a.f,c.f);
  if(!f||f.n<0){p.sel=null;p.op=null;draw();tip(f?`${fstr(a.f)} 减 ${fstr(c.f)} 不够减。重新点：先点大的那张牌`:'不能除以 0。重新点一张牌','bad');return;}
  const node={f,t:{op:p.op,l:a.t,r:c.t}},step=`${fstr(a.f)} ${SYM[p.op]} ${fstr(c.f)} = ${fstr(f)}`,at=Math.min(p.sel,i);
  p.hist.push(p.items.slice());p.items=p.items.filter((_,k)=>k!==p.sel&&k!==i);p.items.splice(at,0,node);p.sel=null;p.op=null;draw();
  if(p.items.length>1){tip(`${step}。接着点下一张牌`);return;}
  if(f.n===24&&f.d===1){p.win=show(node.t);p.tw=Math.round((performance.now()-S.t3)/1000);noneB.classList.remove('on');tip(`${step}，凑出 24 了！按「看 AI 推理」比一比`,'ok');App.cheer(play);}
  else tip(`${step}，不是 24。点「撤销一步」换条路`,'bad');};
 $$('#l14-ops [data-op]',s).forEach(b=>b.onclick=()=>{const p=S.p3;if(p.items.length<2)return;if(p.sel==null){tip('先点一张牌','bad');return;}p.op=b.dataset.op;draw();tip('再点另一张牌');});
 $('#l14-undo',s).onclick=()=>{const p=S.p3;if(!p.hist.length)return;p.items=p.hist.pop();p.sel=null;p.op=null;p.win=null;draw();tip('退回一步。换个算法试试');};
 $('#l14-re3',s).onclick=()=>fresh(S.c3);
 noneB.onclick=()=>{const on=!noneB.classList.contains('on');noneB.classList.toggle('on',on);noneB.setAttribute('aria-pressed',on);};
 const pick=c=>{S.c3=c;S.t3=performance.now();S.sol3=solve24(c);noneB.classList.remove('on');noneB.setAttribute('aria-pressed',false);fresh(c);resetOut(s,box,fb,'AI 会说出它试过哪些路');};
 App.segWire(s,'set3',x=>{if(x==='r'){const p=[];while(p.length<4){const n=1+Math.floor(Math.random()*10);if(!p.includes(n))p.push(n);}pick(sorted(p));}else pick(SETS3[+x].c.slice());});
 pick(SETS3[0].c.slice());
 const self=()=>s3.sets.filter(x=>x.ok).length;
 const marks=()=>{if(s3.sets.some(x=>x.me!=='skip'))App.markStep(s,0);if(self()>=2)App.markStep(s,1);};
 $('#l14-go3',s).onclick=async()=>{const b=$('#l14-go3',s),c=S.c3,sol=S.sol3,p=S.p3;let me;
  if(p.win)me={e:clip(p.win,40),ok:1,t:p.tw};else if(noneB.classList.contains('on'))me={e:'none',ok:sol.sols.length?0:1};else me={e:'skip',ok:0};
  if(me.t==null)me.t=Math.round((performance.now()-S.t3)/1000);
  App.busy(b,true,'AI 正在算…');App.aiSay(box,'一条路一条路地试……',{busy:true});
  const r=await runAI(c,ruleText(['range','dist']),{onText:o=>App.aiSay(box,`<div class="l14-think">${esc(clip(o.text,600))}</div>`,{busy:true})});
  if(!alive(b))return;App.busy(b,false);b.classList.add('again');
  if(r.cancel||S.c3!==c){App.aiSay(box,'这一局停下了。',{mood:'idle'});App.fb(fb,'try','这一局没比完','再按一次大按钮。');return;}
  const cl=r.claim?{claim:r.claim,expr:r.expr}:claimOf(r.text),vd=verdict(c,cl,sol),ns=sol.sols.length;
  App.aiSay(box,`<div class="big">${bigOf(cl)}</div>${thinkHTML(r.text,/^【学习规则】|^【检查数字】/)}<div class="l14-verd ${vd.ok?'':'bad'}">${esc(vd.t)}</div>`,{mood:vd.ok?'happy':'oops',src:r.m});
  const myC=me.ok&&me.e!=='none'?canon24(me.e):null;
  $('#l14-map3',s).innerHTML=`<div class="box-t">AI 的搜索地图：第一步有 ${sol.first.length} 种走法</div>${mapHTML(sol)}<p class="note">绿色 = 这样开头能走到 24。程序一共走了 ${sol.tried} 条完整的路。</p>${ns?`<div class="box-t">全部 ${ns} 种解法${myC?'（黄色是你的）':''}</div><div class="l14-sols">${sol.sols.map(x=>`<span class="${myC&&canon24(x)===myC?'me':''}">${esc(x)}</span>`).join('')}</div>`:''}`;
  const sets=s3.sets.filter(x=>x.c!==c.join()).slice(-9);sets.push({c:c.join(),me:me.e,ok:me.ok,t:me.t,m:r.m,aiOk:vd.ok,ns,mine:myC?1:0,rule:ruleEls(ruleText(['range','dist'])).length});s3.sets=sets;lr.nExp=(lr.nExp||0)+1;touch();marks();
  const n=self(),stars=n>=2?3:n?2:1,fast=`程序 ${sol.ms<1?'不到 1':Math.round(sol.ms)} 毫秒就试完 ${sol.tried} 种算法`;
  if(!vd.ok)App.fb(fb,'oops','你发现 AI 的错误了！',esc(vd.t),{stars,cheer:true});
  else if(me.e==='skip')App.fb(fb,'find',cl.claim==='none'?'AI 说：这组无解':'AI 算出来了',`${fast}。下一组自己先凑一凑，再和它比。`,{stars});
  else if(me.ok&&me.e==='none')App.fb(fb,'ok','判断正确，真的无解！',`你用了 ${me.t} 秒；${fast}，才敢说无解。`,{stars});
  else if(me.ok)App.fb(fb,'ok','你和 AI 都算出来了！',`你用了 ${me.t} 秒；${fast}。这组一共 ${ns} 种解法。`,{stars});
  else App.fb(fb,'try','其实有解！',`一种算法：${esc(sol.sols[0])}。换一组再比。`,{stars});};
 const say=i=>padFb(s,'o3',i===1,i==null?'':i===1?'对！它按规则一条路一条路地试，走不通就回头换一条。':'看看上面的搜索地图：它是不是一条一条、有顺序地试？');
 setOpt(s,'o3',s3.ob.a);say(s3.ob.a);
 wireOpts(s,'o3',i=>{s3.ob.a=i;say(i);touch();});
 marks();}

/* ================= EXP-04: 无解与违规 ================= */
function wire4(v,lr){const s=$('#l14-s4',v),box='#l14-ai4',fb='#l14-fb4';lr.s4=lr.s4||{};const s4=lr.s4;s4.ob=s4.ob||{};s4.seen=s4.seen||{};s4.pred=s4.pred||{};lr.s3=lr.s3||{};
 let cur='u',on=(lr.s3.cards||[]).filter(k=>CARDS.some(c=>c.k===k));
 const table=(id,mark)=>{const c=CARD4.find(x=>x.id===id).c;$('#l14-tb4',s).innerHTML=cardsHTML(c,mark?c.map((n,i)=>(n<1||n>10||c.indexOf(n)!==c.lastIndexOf(n))?i:-1).filter(i=>i>=0):[]);};
 table(cur);App.segWire(s,'set4',x=>{cur=x;table(cur);setSeg(s,'pred4','');resetOut(s,box,fb,'AI 会先看规则，再检查这组数');});
 $$('[data-card]',s).forEach(b=>{const k=b.dataset.card;const paint=()=>{b.classList.toggle('on',on.includes(k));b.setAttribute('aria-pressed',on.includes(k));};paint();
  b.onclick=()=>{on=on.includes(k)?on.filter(x=>x!==k):[...on,k];paint();};});
 const caught=()=>['b','c'].filter(id=>(s4.seen[id]||{}).claim==='invalid').length;
 const marks=()=>{if(Object.keys(s4.seen).length)App.markStep(s,0);if(caught())App.markStep(s,1);};
 $('#l14-go4',s).onclick=async()=>{const b=$('#l14-go4',s),C=CARD4.find(x=>x.id===cur),c=C.c,cards=on.slice(),rule=ruleText(cards),gs=App.segVal(s,'pred4');
  App.busy(b,true,'AI 正在想…');App.aiSay(box,'先看规则，再检查这组数……',{busy:true});
  const r=await runAI(c,rule,{onText:o=>App.aiSay(box,`<div class="l14-think">${esc(clip(o.text,600))}</div>`,{busy:true})});
  if(!alive(b))return;App.busy(b,false);b.classList.add('again');
  if(r.cancel){App.aiSay(box,'这一次停下了。',{mood:'idle'});App.fb(fb,'try','这一次没做完','再按一次大按钮。');return;}
  const sol=solve24(c),cl=r.claim?{claim:r.claim,expr:r.expr}:claimOf(r.text),vd=verdict(c,cl,sol),viol=ruleCheck(c),ns=sol.sols.length;
  if(cur===C.id)table(C.id,true);
  App.aiSay(box,`<div class="big">${bigOf(cl)}</div>${thinkHTML(r.text)}<div class="l14-verd ${vd.ok?'':'bad'}">${esc(vd.t)}</div>`,{mood:vd.ok?'happy':'oops',src:r.m});
  $('#l14-fact4',s).innerHTML=`<div class="box-t">平台核对 ${c.join('、')}</div><p>规则：${viol.length?`<b>不符合</b>，${esc(viol.map(p=>p.t).join('；'))}`:'<b>符合</b>'}</p><p>算术：${ns?`能算出 24，一共 ${ns} 种，如 ${esc(sol.sols[0])}`:`<b>无解</b>，${sol.tried} 种算法全部试过`}</p><p class="note">这次告诉 AI 的规则卡：${cards.length?CARDS.filter(x=>cards.includes(x.k)).map(x=>x.t).join('、'):'一张也没有'}</p>`;
  s4.seen[C.id]={m:r.m,ok:vd.ok,claim:cl.claim};if(gs!=null)s4.pred[C.id]={g:+gs};lr.s3.rule=rule;lr.s3.cards=cards;lr.nExp=(lr.nExp||0)+1;touch();marks();
  const hit=gs==null?'':(['expr','none','invalid'][+gs]===cl.claim?'你猜对了！':'和你猜的不一样。'),base=caught()?3:Object.keys(s4.seen).length>=2?2:1;
  /* did the student tell the AI the rule this set breaks? the banner must match what really happened */
  const told=viol.length&&viol.every(p=>cards.includes(p.k)),need=CARDS.filter(x=>viol.some(p=>p.k===x.k)&&!cards.includes(x.k)).map(x=>'“'+x.t+'”').join('和');
  if(viol.length&&cl.claim==='invalid')App.fb(fb,'ok','AI 发现违规了！',`${hit}${esc(viol[0].t)}。`+(told?'你把规则告诉了它，它才会去检查。':'这条规则你没告诉它，它却自己看出来了：真实的 AI 有时会用上学过的知识。'),{stars:3});
  else if(viol.length&&!told)App.fb(fb,'oops','AI 没发现违规！',`${hit}${esc(viol.map(p=>p.t).join('；'))}。可它不知道这条规则。点亮规则卡${need}，再试一次！`,{stars:base});
  else if(viol.length)App.fb(fb,'oops','AI 没发现违规！',`${hit}${esc(viol.map(p=>p.t).join('；'))}。规则明明告诉它了，它还是漏看了：AI 的答案要自己核对。`,{stars:base,cheer:true});
  else if(cl.claim==='none'&&vd.ok)App.fb(fb,'find','AI 老实说：无解',`${hit}它把 ${sol.tried} 种算法都试过，才下结论。换一组怪数试试。`,{stars:base});
  else App.fb(fb,'oops','你发现 AI 的错误了！',hit+esc(vd.t),{stars:base,cheer:true});};
 const say=i=>padFb(s,'o4',i===2,i==null?'':i===2?'对！AI 的推理依赖我们告诉它的规则，规则要说清楚。':'再试试：同一组数，点亮和不点亮规则卡，结果一样吗？');
 setOpt(s,'o4',s4.ob.q3);say(s4.ob.q3);
 wireOpts(s,'o4',i=>{s4.ob.q3=i;say(i);touch();});
 marks();}

/* ================= EXP-04b: 给 AI 挑错 ================= */
function wire4b(v,lr){const s=$('#l14-s4b',v),fb='#l14-fbf',pad=$('#l14-lf',s);lr.s4=lr.s4||{};const s4=lr.s4;s4.f=s4.f||{};s4.fok=s4.fok||{};let cur=0;const ver={};
 const found=()=>FAULT.filter(x=>s4.f[x.id]===x.err).length;
 const marks=()=>{if(Object.keys(ver).length||Object.keys(s4.f).length)App.markStep(s,0);if(found()>=FAULT.length)App.markStep(s,1);};
 /* the checker: which numbers did the AI really use, and what is its expression really worth? */
 const facts=f=>{const {v:val,used}=parseExpr(f.ans),need=f.c.slice(),extra=[];used.forEach((u,i)=>{const k=need.indexOf(u);if(k>=0)need.splice(k,1);else extra.push(i);});
  const miss=[],left=need.slice();f.c.forEach((n,i)=>{const k=left.indexOf(n);if(k>=0){left.splice(k,1);miss.push(i);}});
  return {used,extra,miss,val:fstr(val).replace('-','−'),okN:!extra.length&&!miss.length,ok24:val.n===24&&val.d===1};};
 const stage=f=>{const box=$('#l14-tbf',s);if(!ver[f.id]){box.innerHTML=cardsHTML(f.c);return;}const k=facts(f);
  box.innerHTML=`<div class="l14-cmp"><span>给的数${k.miss.length?'（虚线：AI 没用到）':''}</span>${rowCards(f.c,k.miss,'miss')}</div><div class="l14-cmp"><span>AI 用的数${k.extra.length?'（红色：不是给的数）':''}</span>${rowCards(k.used,k.extra)}</div><div class="l14-goal">算式的值 = ${k.val}${k.ok24?'':'，不是 24'}</div>`;};
 const paint=()=>{const f=FAULT[cur];stage(f);padClear(s,'jf');pad.hidden=!ver[f.id];if(ver[f.id])setOpt(s,'jf',s4.f[f.id]);const slot=$(fb,s);if(slot)slot.innerHTML='';
  App.aiSay('#l14-aif',`<div class="big">${esc(f.ans)} = 24</div><div class="l14-think">${esc(f.say)}</div><span class="l14-tag">示意：AI 可能出现的错误</span>`,{mood:'happy',src:'offline'});};
 App.segWire(s,'fa',x=>{cur=+x;paint();});paint();
 $('#l14-gof',s).onclick=()=>{const f=FAULT[cur],k=facts(f);ver[f.id]=1;stage(f);pad.hidden=false;marks();
  App.fb(fb,'find','验算器查完了',`AI 用到的数是 ${k.used.join('、')}，给的数是 ${f.c.join('、')}；算式的值是 ${k.val}。对照一下：它错在哪？`);};
 wireOpts(s,'jf',i=>{const f=FAULT[cur],k=facts(f);if(s4.f[f.id]==null)s4.fok[f.id]=i===f.err?1:0;s4.f[f.id]=i;touch();marks();
  const n=found(),fst=FAULT.filter(x=>s4.fok[x.id]).length;
  if(i===f.err)App.fb(fb,'ok','你抓到 AI 的错了！',esc(f.why)+(n<FAULT.length?' 再去抓另一个。':''),{stars:n>=FAULT.length?(fst>=FAULT.length?3:2):1});
  else App.fb(fb,'try','再对照一下',i===0?'两行牌是一样的，数没有用错。再看算式的值。':i===1?`算式的值确实是 ${k.val}。再比一比左边两行牌。`:k.okN?`算式的值是 ${k.val}，不是 24。`:'两行牌不一样：AI 用的数和给的数对不上。',n?{stars:1}:{});});
 marks();}

/* ================= TALK ================= */
function evidence(lr){const W=lr.w||{},s1=lr.s1||{},s2=lr.s2||{},s3=lr.s3||{},s4=lr.s4||{};const R=s1.rounds||[];const sets=s3.sets||[];
 const avg=R.length?(R.reduce((a,r)=>a+r.st,0)/R.length).toFixed(1):null;const runs=s2.runs||[];
 return {bomb:W.n?`我用了 ${W.n} 次${W.x?`（${W.x} 次猜了已排除的数）`:''}；二分法最多 7 次`:'还没有玩',
  guess:avg?`${R.length} 轮，AI 平均 ${avg} 次猜中${R.some(r=>r.bad)?'，出现过越界':''}`:'还没有玩',
  mislead:runs.length?`${runs.length} 轮；${runs.filter(r=>r.solved).length} 轮最后猜中${runs.some(r=>r.rx===3)?'；见过 AI 坚持错误答案':''}`:'还没有做',
  p24:sets.length?`${sets.length} 组：我解出 ${sets.filter(x=>x.ok).length} 组，平均 ${Math.round(sets.reduce((a,x)=>a+(x.t||0),0)/sets.length)} 秒；程序每组几毫秒找出全部解法`:'还没有做',
  fault:Object.keys(s4.fok||{}).length?`找错练习：${Object.values(s4.fok).filter(Boolean).length}/2 第一次就找对`:''};}
function wire5(v,lr){const s=$('#l14-s5',v),fb='#l14-fb5';lr.tk=lr.tk||{};const tk=lr.tk;const KEY=['a','l','h'];
 const ev=()=>{const box=$('#l14-ev5');if(!box||!App.rec)return;const e=evidence(App.lesson(K));box.innerHTML=[['数字炸弹',e.bomb],['猜数推理台',e.guess],['误导实验',e.mislead],['24 点擂台',e.p24+(e.fault?'；'+e.fault:'')]].map(([t,x])=>`<div><b>${t}</b>${esc(x)}</div>`).join('');};
 /* older records kept only tk.a: rebuild the one-at-a-time store from it */
 if(!tk.seq){tk.seq={};Object.entries(tk.a||{}).forEach(([id,c])=>{const q=SORT.find(x=>x[0]===id),j=KEY.indexOf(c);if(q&&j>=0)tk.seq[id]={first:j,ok:c===q[2],last:j};});}
 const WHY={t1:'24 点擂台里，程序几毫秒就试完了两千多种算法。',t2:'猜数推理台里，AI 用的就是这个办法。',t3:'误导实验里，只骗了它一次，它的回答就不稳定了。',t4:'AI 的推理依赖既定规则，没告诉它的规则，它可能不会去检查。',t5:'给 AI 挑错里，它把 7 悄悄换成了 8，所以要验算。',
  t6:'看出别人的意图，靠的是我们对人、对场合的理解。',t7:'个人经验是我们自己一点点攒下来的。',t8:'跳出规则、发明新玩法，是我们的本领。',t9:'AI 的答案对不对，最后要由我们来验算、把关。'};
 const qs=SORT.map(([id,t,ans])=>({id,q:esc(t),opts:KEY.map(k=>CAT[k]),a:KEY.indexOf(ans),why:`这一条是${CAT[ans]}。${WHY[id]}`}));
 const done=()=>{const n=Object.keys(tk.seq).length;tk.a=Object.fromEntries(Object.entries(tk.seq).map(([id,x])=>[id,KEY[x.first]]));
  if(n<SORT.length)return;const ok=SORT.filter(([id])=>tk.seq[id]&&tk.seq[id].ok).length;tk.done=1;tk.ok=ok;App.markStep(s,0);
  App.fb(fb,ok>=7?'ok':'find',`9 张卡分完，第一次分对 ${ok} 张`,'AI 算得快、试得多；会被误导，只认告诉它的规则。理解意图、想出新办法，要靠我们。',{stars:ok>=8?3:ok>=6?2:1});};
 App.askSeq($('#l14-sortq',s),qs,tk.seq,()=>{done();touch();});
 const t=$('#l14-tk2',s);t.value=tk.hum||'';const mk=()=>{if(nz(tk.hum).length>=8)App.markStep(s,1);};
 t.oninput=()=>{tk.hum=clip(t.value,300);mk();touchSoon();};
 ev();done();mk();L._ev5=ev;}

/* diary extras */
function diaryExtras(ex){const lr=App.lesson(K);const e=evidence(lr);const s3=lr.s3||{};const sets=s3.sets||[];const s2=lr.s2||{};const tk=lr.tk||{};
 ex.innerHTML=`<div class="l14-ex"><div><div class="box-t">数字炸弹 · 猜数推理台</div><p>${esc(e.bomb)}。<br>AI：${esc(e.guess)}。</p></div>
  <div><div class="box-t">误导实验</div><p>${esc(e.mislead)}${(s2.ob||{}).q2!=null&&RX[s2.ob.q2]?`。我观察到 AI 会“${RX[s2.ob.q2]}”`:''}。</p></div>
  <div><div class="box-t">24 点擂台</div>${sets.length?`<div class="scroll"><table class="l14-tbl"><thead><tr><th>数</th><th>我的答案</th><th>用时</th><th>AI</th></tr></thead><tbody>${sets.slice(-5).map(x=>`<tr><td class="mono">${esc(x.c)}</td><td class="mono">${x.me==='none'?'无解':x.me==='skip'?'没出手':esc(x.me)} ${x.ok?'✓':x.me==='skip'?'':'✗'}</td><td class="mono">${x.t} 秒</td><td>${x.aiOk?'✓ 核对通过':'✗ 有问题'}</td></tr>`).join('')}</tbody></table></div>`:'<p class="note">还没有做 24 点。</p>'}</div>
  <div><div class="box-t">思辨</div><p>${tk.done?`分一分：对 ${tk.ok}/${SORT.length}。`:''}${tk.hum?esc(clip(tk.hum,80)):'<span class="note">还没有写人类推理的优势。</span>'}</p></div></div>`;}
function canon24(e){try{const s=String(e).replace(/[×xX＊*]/g,'*').replace(/[÷／/]/g,'/').replace(/[－—–−]/g,'-').replace(/（/g,'(').replace(/）/g,')').replace(/\s+/g,'').replace(/=.*$/,'');let i=0;
 const atom=()=>{if(s[i]==='('){i++;const v=ex();i++;return v;}const m=/^\d+/.exec(s.slice(i));i+=m[0].length;return {v:+m[0]};};
 const term=()=>{let v=atom();while(s[i]==='*'||s[i]==='/'){const o=s[i++];v={op:o,l:v,r:atom()};}return v;};
 const ex=()=>{let v=term();while(s[i]==='+'||s[i]==='-'){const o=s[i++];v={op:o,l:v,r:term()};}return v;};return canon(ex());}catch(e){return null;}}

L.onShow=()=>{if(L._ev5)L._ev5();};
L.onHide=()=>{stopAll();};

/* ================= hooks ================= */
L.score=lr=>{const Q=lr.quiz||{},qs=id=>Q[id]?(Q[id].ok?100:0):0,tx=App.txtScore,D=lr.diary||{},W=lr.w||{},s1=lr.s1||{},s2=lr.s2||{},s3=lr.s3||{},s4=lr.s4||{},tk=lr.tk||{};
 const R=s1.rounds||[],runs=s2.runs||[],sets=s3.sets||[],o1=s1.ob||{},o2=s2.ob||{},o3=s3.ob||{},o4=s4.ob||{};const fok=s4.fok||{};const ta=tk.a||{};const seen=s4.seen||{};
 const hum=SORT.filter(x=>x[2]==='h');
 /* v3: 观察题改为点选（o1.q1 是选项序号；旧记录里是一句话）；规则 = 点亮的规则卡；AI 查出违规 = 规则说清楚了 */
 const q1=typeof o1.q1==='number'?(o1.q1===0?15:5):0.15*tx(o1.q1,30);
 const caught=['b','c'].filter(id=>(seen[id]||{}).claim==='invalid').length;
 return {principle:(W.a===0?15:W.a!=null?5:0)+(s1.pred===1?15:s1.pred!=null?5:0)+q1+(tk.done?25*(tk.ok||0)/SORT.length:0)+0.1*(qs('q1')+qs('q2')+qs('q4')),
  experiment:(W.done?10:0)+25*Math.min(1,R.length/2)+(runs.some(r=>r.lie)?15:runs.length?5:0)+20*Math.min(1,sets.length/3)+15*Math.min(1,Object.keys(seen).length/3)+15*[o1.q1!=null,o2.q2!=null,o3.a!=null,o4.q3!=null].filter(Boolean).length/4,
  prompt:60*cardsOn(s3.rule)/CARDS.length+40*Math.min(1,caught/2),
  critical:(o2.q2!=null?20:0)+20*Math.min(1,runs.filter(r=>r.lie).length/2)+15*((fok.f1||0)+(fok.f2||0))+(o4.q3===2?15:o4.q3!=null?7:0)+0.15*qs('q3'),
  creative:35*Math.min(1,sets.filter(x=>x.ok&&x.ns>0).length/3)+(sets.some(x=>!SETS3.some(p=>p.c.join()===x.c))?10:0)+(W.n&&W.n<=8?10:0)+0.2*tx(tk.hum,30)+0.25*tx(D.tip,30),
  ethics:(tk.done?30*hum.filter(x=>ta[x[0]]==='h').length/hum.length:0)+(D.pledge?25:0)+0.25*tx(D.collab,30)+0.2*qs('q5')};};
L.progress=lr=>{const W=lr.w||{},s1=lr.s1||{},s2=lr.s2||{},s3=lr.s3||{},s4=lr.s4||{},o1=s1.ob||{},o2=s2.ob||{},o4=s4.ob||{};const runs=s2.runs||[];
 const m=[!!W.done,(s1.rounds||[]).length>=1,o1.q1!=null&&o1.q1!=='',runs.some(r=>r.lie),o2.q2!=null,
  (s3.sets||[]).length>=2,Object.keys(s4.seen||{}).length>=2,Object.keys(s4.f||{}).length>=2,o4.q3!=null,!!(lr.tk||{}).done,Object.keys(lr.quiz||{}).length>=5,!!(lr.diary||{}).submitted];
 return m.filter(Boolean).length/m.length;};
L._math={solve24,check24,ruleCheck,rangeOf,suspects,offlineSolveText,claimOf,verdict,worstSim,ruleEls,canon24,offlineReact,ruleText,parseExpr};
L.quiz=QUIZ;
L.flow=[
 {seg:'导入',from:'l14-s0'},
 {seg:'挑战一',kp:'知识点一 · 按线索推理：有策略，也会被误导',learn:['推理：根据信息、调动知识，推出它认为最合理的答案','猜数策略：每次猜剩下范围的正中间，一次排除约一半','线索错一条，正确的数就被排除；面对矛盾，AI 不够稳定'],sum:['AI 每次猜正中间，1～100 最多 7 次就能猜中','错一次提示，范围变空；AI 有时推测、有时确认、有时重推'],from:'l14-s1',to:'l14-s2'},
 {seg:'挑战二',kp:'知识点二 · 按规则尝试：撞了南墙就回头',learn:['AI 按学过的规则组合信息，一条条快速尝试','这条路走不通就回头换一条，直到给出结论','推理依赖既定规则：没有答案时，尝试后如实反馈'],sum:['AI 先查规则再试，试完全部才如实说“无解”','没告诉它的规则可能不查；看起来对的答案也要验算'],from:'l14-s3',to:'l14-s4b'},
 {seg:'综合运用',from:'l14-s5'},
 {seg:'反思与总结',from:'l14-quiz'}
];
L.diaryTitle='我的推理记录';
L.diaryQ=[['tip','数字炸弹与 24 点的推理心得'],['who','我和 AI 谁更会推理'],['collab','如何与 AI 协作推理']];
L.works=lr=>{const o=[];const R=(lr.s1||{}).rounds||[];const W=lr.w||{};
 if(R.length||W.n)o.push({t:'猜数推理记录',s:`${W.n?`数字炸弹：我用了 ${W.n} 次`:''}${W.n&&R.length?'；':''}${R.length?`AI ${R.length} 轮平均 ${(R.reduce((a,r)=>a+r.st,0)/R.length).toFixed(1)} 次猜中`:''}`,glyph:'二分'});
 const sets=(lr.s3||{}).sets||[];if(sets.length)o.push({t:'24 点擂台',s:`${sets.length} 组，自己解出 ${sets.filter(x=>x.ok).length} 组｜${sets.filter(x=>x.ok&&x.me!=='none').slice(-1).map(x=>x.me+' = 24').join('')||sets[sets.length-1].c}`,glyph:'24'});
 const runs=(lr.s2||{}).runs||[];if(runs.some(r=>r.lie))o.push({t:'误导实验',s:`${runs.length} 轮；AI 的反应：${[...new Set(runs.filter(r=>r.rx!=null).map(r=>RX[r.rx]))].join('、')||'见记录'}`,glyph:'？'});
 return o;};
L.expCount=lr=>lr.nExp||0;
L.classPanels=recs=>{const R=recs.map(r=>(r.lessons||{})[K]||{}).filter(l=>Object.keys(l).length);if(!R.length)return '';
 const bar=(n,v,tot,col,lab)=>`<div class="hbar"><span>${n}</span><span class="tr"><i style="width:${tot?100*v/tot:0}%;background:${col}"></i></span><span>${lab!=null?lab:v}</span></div>`;
 const bombs=R.map(l=>(l.w||{}).n).filter(Boolean);const avgB=bombs.length?(bombs.reduce((a,b)=>a+b,0)/bombs.length).toFixed(1):'—';
 const rounds=R.flatMap(l=>(l.s1||{}).rounds||[]);const avgA=rounds.length?(rounds.reduce((a,r)=>a+r.st,0)/rounds.length).toFixed(1):'—';
 const preds=R.map(l=>(l.s1||{}).pred).filter(x=>x!=null);
 const cls=R.map(l=>((l.s2||{}).ob||{}).q2).filter(x=>x!=null);
 const sets=R.flatMap(l=>(l.s3||{}).sets||[]);const rules=R.map(l=>(l.s3||{}).rule).filter(x=>nz(x));
 const fok=R.map(l=>(l.s4||{}).fok).filter(Boolean);
 return `<div class="box"><div class="box-t">第14讲 · 猜数与误导实验</div>
   <p style="font-size:14px">数字炸弹：${bombs.length} 人完成，平均 <b>${avgB}</b> 次（≤ 7 次的 ${bombs.filter(n=>n<=7).length} 人）；猜数推理台：AI 共 ${rounds.length} 轮，平均 <b>${avgA}</b> 次。</p>
   ${bar('先猜后看：最多 7 次（答对）',preds.filter(x=>x===1).length,preds.length,'var(--green)',`${preds.filter(x=>x===1).length}/${preds.length}`)}
   <b style="font-size:13px">误导实验：学生观察到的 AI 反应（${cls.length} 人）</b>${RX.map((t,i)=>bar(t,cls.filter(x=>x===i).length,cls.length,i===3?'var(--red)':'var(--violet)')).join('')}</div>
  <div class="box"><div class="box-t">第14讲 · 24 点擂台</div>
   <p style="font-size:14px">共做 ${sets.length} 组，学生自己解对 ${sets.filter(x=>x.ok).length} 组（${sets.length?Math.round(100*sets.filter(x=>x.ok).length/sets.length):0}%），平均用时 ${sets.length?Math.round(sets.reduce((a,x)=>a+(x.t||0),0)/sets.length):'—'} 秒。</p>
   <b style="font-size:13px">学生交给 AI 的规则卡（${rules.length} 人）</b>${RULE_EL.filter(e=>CARDS.some(c=>c.k===e.k)).map(e=>bar(e.t,rules.filter(t=>e.re.test(t)).length,rules.length,'var(--cyan)',rules.length?Math.round(100*rules.filter(t=>e.re.test(t)).length/rules.length)+'%':'—')).join('')}
   ${bar('找错练习：偷换数字（第一次找对）',fok.filter(f=>f.f1).length,fok.filter(f=>f.f1!=null).length,'var(--amber)',`${fok.filter(f=>f.f1).length}/${fok.filter(f=>f.f1!=null).length}`)}${bar('找错练习：分数计算出错（第一次找对）',fok.filter(f=>f.f2).length,fok.filter(f=>f.f2!=null).length,'var(--amber)',`${fok.filter(f=>f.f2).length}/${fok.filter(f=>f.f2!=null).length}`)}</div>`;};
L.classSug=recs=>{const R=recs.map(r=>(r.lessons||{})[K]||{}).filter(l=>Object.keys(l).length);if(!R.length)return [];const out=[];
 const rules=R.map(l=>(l.s3||{}).rule).filter(x=>nz(x));const nd=rules.filter(t=>!RULE_EL[2].re.test(t)).length;
 if(rules.length>=4&&nd/rules.length>=0.3)out.push(`第14讲：${nd}/${rules.length} 名学生交给 AI 的规则里没有点亮“不可重复”规则卡，离线 AI 因此没能发现“4，4，3，2”违规。请投影 EXP-04，全班一起点亮规则卡，再重做第 3 组，体会“AI 的推理依赖既定规则”。`);
 const bombs=R.map(l=>(l.w||{}).n).filter(Boolean);const avg=bombs.length?bombs.reduce((a,b)=>a+b,0)/bombs.length:0;
 if(bombs.length>=4&&avg>8)out.push(`第14讲：数字炸弹平均用了 ${avg.toFixed(1)} 次，多数学生还没有用“取中间”的策略。可以请一名学生扮演 AI，全班只许猜范围正中间的数，在黑板上画出 100 → 50 → 25 → … 的缩小过程，再回到猜数推理台对照。`);
 const fok=R.map(l=>(l.s4||{}).fok).filter(f=>f&&f.f2!=null);if(out.length<2&&fok.length>=4&&fok.filter(f=>!f.f2).length/fok.length>=0.4)out.push(`第14讲：${fok.filter(f=>!f.f2).length}/${fok.length} 名学生没能第一次就发现“6 ÷ (1 − 5 ÷ 4)”的计算错误。请带学生在 EXP-04b 按“验算揭晓”，再逐步计算 1 − 5/4，讨论“看起来对”和“验算过是对的”的区别。`);
 return out.slice(0,2);};
L.demo=(rnd,t)=>{const p=x=>rnd()<x;const pk=a=>a[Math.floor(rnd()*a.length)];const lr={};let n=0;const ri=(a,b)=>a+Math.floor(rnd()*(b-a+1));
 const bn=Math.max(3,Math.round(12-8*t+rnd()*4-2));lr.w={done:1,n:bn,x:p(.6-t*.5)?ri(1,3):0,best:bn,games:1+(p(.4)?1:0),a:p(.55+t*.4)?0:pk([1,2])};
 const s1={rounds:[]};const nr=p(.3+t*.6)?ri(1,3):p(.5)?1:0;for(let i=0;i<nr;i++){const sec=ri(1,100);let lo=1,hi=100;const g=[];while(true){const m=mid(lo,hi);g.push(m);if(m===sec)break;if(m>sec)hi=m-1;else lo=m+1;}s1.rounds.push({n:sec,g,st:g.length,m:'offline',bad:0});n++;}
 if(nr)s1.pred=p(.4+t*.55)?1:pk([0,2,3]);s1.ob={};if(nr&&p(.3+t*.6))s1.ob.q1=p(.45+t*.5)?0:pk([1,2]);lr.s1=s1;
 const s2={runs:[]};if(p(.35+t*.55)){const rx=ri(0,3);s2.runs.push({n:85,h:[[50,'small'],[75,'small'],[88,'big'],[81,'big'],[78,'small'],[79,'small'],[80,'small']],lie:1,rx,m:'offline',solved:p(.6)?1:0,cls:rx});n++;
  if(p(.4+t*.55))s2.ob={q2:p(.6+t*.3)?rx:pk([0,1,2,3])};}lr.s2=s2;
 const s3={sets:[]};const cards=CARDS.map(c=>c.k).filter(()=>p(.25+t*.65));
 if(p(.3+t*.65)){const pool=[[2,3,4,6],[1,6,7,8],[1,2,3,5],[3,4,5,8],[2,5,7,9]];const k=ri(1,Math.max(1,Math.round(1+t*3.5)));
  for(let i=0;i<Math.min(k,pool.length);i++){const c=pool[i];const sol=solve24(c);const ok=p(.35+t*.6);s3.sets.push({c:c.join(),me:ok?(sol.sols[0]||'none'):p(.5)?'none':'skip',ok:ok?1:0,t:ri(15,140),m:'offline',aiOk:1,ns:sol.sols.length,mine:ok&&sol.sols.length?1:0,rule:7});n++;}
  s3.ob={a:p(.7+t*.25)?1:0};}lr.s3=s3;
 const s4={};if(p(.3+t*.6)){s3.rule=ruleText(cards);s3.cards=cards;s4.pred={};s4.seen={};CARD4.slice(0,ri(1,3)).forEach(c=>{const hit=ruleCheck(c.c).some(x=>cards.includes(x.k));const claim=hit?'invalid':solve24(c.c).sols.length?'expr':'none';
   s4.pred[c.id]={g:p(.4+t*.5)?['expr','none','invalid'].indexOf(claim):ri(0,2)};s4.seen[c.id]={m:'offline',ok:hit||claim==='none'?1:0,claim};n++;});
  if(p(.3+t*.6)){s4.f={f1:p(.5+t*.4)?0:pk([1,2]),f2:p(.3+t*.5)?1:pk([0,2])};s4.fok={f1:s4.f.f1===0?1:0,f2:s4.f.f2===1?1:0};}
  s4.ob=p(.3+t*.6)?{q3:p(.4+t*.5)?2:pk([0,1])}:{};}lr.s4=s4;
 if(p(.3+t*.6)){const a=Object.fromEntries(SORT.map(([id,,ans])=>[id,p(.5+t*.45)?ans:pk(['a','l','h'])]));lr.tk={a,done:1,ok:SORT.filter(([id,,ans])=>a[id]===ans).length};if(p(t)){lr.tk.hum='我们能理解别人的意图，能想出新办法，还能检查 AI 的答案。';}}
 const q=(id,pp)=>{const ok=p(pp);const a=QUIZ.find(x=>x.id===id).a;return {first:ok?a:(a+1)%4,ok,last:a};};
 if(p(.3+t*.65))lr.quiz={q1:q('q1',.5+t*.45),q2:q('q2',.4+t*.5),q3:q('q3',.6+t*.35),q4:q('q4',.4+t*.5),q5:q('q5',.6+t*.35)};
 if(p(.2+t*.7))lr.diary={tip:p(t+.1)?'数字炸弹要先猜中间，每次排除一半；24 点先想 24 = 3×8、4×6，再凑数。':'先猜中间。',who:p(t)?'算得快、试得多是 AI 更强；但它会被误导，规则没说清也会出错，这时我更会推理。':'AI 更厉害。',collab:p(t)?'让 AI 帮我快速尝试，我负责把规则说清楚、验算它的答案；要培养严谨的逻辑思维。':'',pledge:p(.8),submitted:p(t+.1)?1:0};
 lr.nExp=n;return lr;};
})();
