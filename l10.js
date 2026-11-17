/* 第10讲 网页工坊 (v3) — WARM-UP 网页背后是代码 / EXP-01 网页生成器 / EXP-01b 计算器抓虫 / EXP-02 代码探秘 / EXP-02b 改一个数字 / EXP-03 提示词对比台 / EXP-04 我的第一个网页 / TALK 人与 AI 谁主导 / APPLY 人机分工 / QUIZ / DIARY */
(function(){
const {$,$$,esc,clamp}=App;const K='l10';const L={};App.lessons[K]=L;
const MODE={api:'平台 AI 接口',claude:'Claude 大模型',gpt:'GPT 大模型'};
const srcOf=m=>!m||m==='offline'?'离线示例（预置网页，示意）':(MODE[m]||m);
const A=s=>[...String(s??'')];
const clip=(s,n=400)=>A(String(s||'').trim()).slice(0,n).join('');
const cut=(s,n)=>{const a=A(s);return a.length>n?a.slice(0,n).join('')+'…':a.join('');};
const nL=h=>h?String(h).split('\n').length:0;
const bytes=s=>{try{return new TextEncoder().encode(s).length;}catch(e){return String(s).length*3;}};
const TECH='（技术说明：不要使用 eval 或 new Function，不要用 alert 弹窗。）';
const DAYS='日一二三四五六';

/* ================= offline "AI": a parametric page builder that writes real, readable code ================= */
const BGC={蓝:['#1e6fd9',1],红:['#c0392b',1],橙:['#f4a259',0],黄:['#ffe066',0],绿:['#2a9d8f',1],青:['#22a6b3',1],紫:['#6a4c93',1],粉:['#ffc8dd',0],黑:['#1b1b1b',1],白:['#ffffff',0],灰:['#adb5bd',0]};
const safeName=s=>String(s||'').replace(/[^一-龥A-Za-z0-9]/g,'').slice(0,10)||'纪念日';
function build(o){o=o||{};const out=[];const P=(...a)=>out.push(...a);
 const b=BGC[o.bg];const bg=b?b[0]:'#f4f6fb',dark=b?b[1]:0;const card=o.cal||o.clock||o.bday||o.anniv;
 const T=esc(o.title||(o.vague?'欢迎来到我的网页':o.cal&&o.clock?'我的日历时钟':o.cal?'我的日历':o.clock?'我的时钟':'我的提醒小助手'));
 P('<!DOCTYPE html>','<html lang="zh-CN">','<head>','<meta charset="UTF-8">','<meta name="viewport" content="width=device-width, initial-scale=1">',`<title>${T}</title>`,'<style>',
  '  body {','    margin: 0;','    padding: 16px;','    font-family: sans-serif;','    text-align: center;',`    background: ${bg};`,`    color: ${dark?'#ffffff':'#22223b'};`,'  }',
  '  h1 { font-size: 26px; margin: 8px 0 12px; }');
 if(o.vague)P('  .intro { font-size: 16px; }','  button { font-size: 16px; padding: 6px 18px; border-radius: 8px; }');
 if(card)P('  .card {','    display: inline-block;','    vertical-align: top;','    margin: 6px;','    padding: 12px 16px;','    border-radius: 12px;','    background: #ffffff;','    color: #22223b;','    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);','  }','  h2 { font-size: 18px; margin: 4px 0 8px; }');
 if(o.cal)P('  table { border-collapse: collapse; margin: 0 auto; }','  th, td { width: 32px; height: 28px; font-size: 14px; }','  .today { background: #ff8c42; color: #ffffff; border-radius: 50%; }');
 if(o.clock)P('  #digital { font-size: 22px; font-weight: bold; }');
 if(o.bday||o.anniv)P('  .big { font-size: 22px; color: #e85d75; font-weight: bold; }','  .tip { font-size: 12px; color: #8d99ae; }');
 P('</style>','</head>','<body>',`  <h1>${T}</h1>`);
 if(o.vague)P('  <p class="intro">这是一个示例网页，可以在这里写下想说的话。</p>','  <button id="hello">点我</button>','  <p id="msg"></p>');
 if(o.cal)P('  <div class="card">','    <h2 id="month"></h2>','    <table id="calendar"></table>','  </div>');
 if(o.clock)P('  <div class="card">','    <canvas id="clock" width="200" height="200"></canvas>','    <div id="digital"></div>','  </div>');
 if(o.bday)P('  <div class="card">','    <h2>生日倒计时</h2>','    <div class="big" id="birthday"></div>',o.bday.g?'    <p class="tip">你没有告诉我生日是哪天，我先假设是 1 月 1 日。</p>':`    <p class="tip">生日：${o.bday.m} 月 ${o.bday.d} 日</p>`,'  </div>');
 if(o.anniv)P('  <div class="card">','    <h2>纪念日提醒</h2>','    <div class="big" id="anniv"></div>',o.anniv.g?'    <p class="tip">你没有说是哪个纪念日，我先用植树节（3 月 12 日）举例。</p>':`    <p class="tip">${esc(safeName(o.anniv.n))}：${o.anniv.m} 月 ${o.anniv.d} 日</p>`,'  </div>');
 P('<script>');
 if(o.vague)P('  // 点击按钮，显示一句问候','  document.getElementById(\'hello\').onclick = function () {','    document.getElementById(\'msg\').textContent = \'你好！欢迎来访。\';','  };');
 if(o.cal)P('  // 画出这个月的日历','  function drawCalendar() {','    const now = new Date();','    const year = now.getFullYear();','    const month = now.getMonth();   // 0 表示 1 月',
  '    document.getElementById(\'month\').textContent = year + \' 年 \' + (month + 1) + \' 月\';','    const first = new Date(year, month, 1).getDay();      // 1 号是星期几','    const days = new Date(year, month + 1, 0).getDate();  // 这个月一共几天',
  `    let html = '<tr>${[...DAYS].map(d=>`<th>${d}</th>`).join('')}</tr><tr>';`,'    for (let i = 0; i < first; i++) html += \'<td></td>\';','    for (let d = 1; d <= days; d++) {',
  '      const mark = d === now.getDate() ? \' class="today"\' : \'\';   // 标出今天','      html += \'<td\' + mark + \'>\' + d + \'</td>\';','      if ((first + d) % 7 === 0) html += \'</tr><tr>\';   // 每 7 天换一行','    }',
  '    document.getElementById(\'calendar\').innerHTML = html + \'</tr>\';','  }','  drawCalendar();');
 if(o.clock)P('  // 时钟：画表盘、数字和三根指针','  const ctx = document.getElementById(\'clock\').getContext(\'2d\');','  function hand(angle, length, width, color) {','    ctx.save();','    ctx.translate(100, 100);','    ctx.rotate(angle);   // 把画笔转到指针的角度',
  '    ctx.beginPath();','    ctx.moveTo(0, 10);','    ctx.lineTo(0, -length);','    ctx.lineWidth = width;','    ctx.strokeStyle = color;','    ctx.lineCap = \'round\';','    ctx.stroke();','    ctx.restore();','  }',
  '  function drawClock() {','    const now = new Date();','    const h = now.getHours() % 12;','    const m = now.getMinutes();','    const s = now.getSeconds();','    ctx.clearRect(0, 0, 200, 200);','    ctx.beginPath();','    ctx.arc(100, 100, 92, 0, Math.PI * 2);   // 圆形表盘',
  '    ctx.fillStyle = \'#ffffff\';','    ctx.fill();','    ctx.lineWidth = 4;','    ctx.strokeStyle = \'#33415c\';','    ctx.stroke();','    ctx.fillStyle = \'#33415c\';','    ctx.font = \'16px sans-serif\';','    ctx.textAlign = \'center\';','    ctx.textBaseline = \'middle\';',
  '    for (let i = 1; i <= 12; i++) {   // 写上 1 到 12','      const a = i * Math.PI / 6;','      ctx.fillText(i, 100 + Math.sin(a) * 74, 100 - Math.cos(a) * 74);','    }',
  '    hand((h + m / 60) * Math.PI / 6, 48, 6, \'#33415c\');   // 时针','    hand((m + s / 60) * Math.PI / 30, 70, 4, \'#33415c\');  // 分针','    hand(s * Math.PI / 30, 80, 2, \'#e85d75\');             // 秒针',
  '    document.getElementById(\'digital\').textContent = now.toLocaleTimeString(\'zh-CN\', { hour12: false });','  }','  drawClock();','  setInterval(drawClock, 1000);   // 每 1000 毫秒（1 秒）重画一次');
 if(o.bday||o.anniv)P('  // 算一算：离某月某日还有几天','  function countDown(month, day) {','    const now = new Date();','    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());','    let next = new Date(now.getFullYear(), month - 1, day);',
  '    if (next < today) next = new Date(now.getFullYear() + 1, month - 1, day);   // 今年已过，就算明年的','    return Math.round((next - today) / 86400000);   // 一天 = 86400000 毫秒','  }');
 if(o.bday){const m=o.bday.m,d=o.bday.d;P(`  const left = countDown(${m}, ${d});   // 生日：${m} 月 ${d} 日`,'  document.getElementById(\'birthday\').textContent = left === 0 ? \'今天就是生日！\' : \'离生日还有 \' + left + \' 天\';');}
 if(o.anniv){const n=safeName(o.anniv.n);P(`  const days2 = countDown(${o.anniv.m}, ${o.anniv.d});   // ${n}：${o.anniv.m} 月 ${o.anniv.d} 日`,`  let text = '${n}还有 ' + days2 + ' 天';`,'  if (days2 <= 7) text += \'，快到了，记得准备！\';   // 7 天内提醒','  document.getElementById(\'anniv\').textContent = text;');}
 P('</script>','</body>','</html>');return out.join('\n');}
/* calculator preset: correct precedence, but it shows the classic floating-point result and "Infinity" */
const CALC=`<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>计算器</title>
<style>
  body { margin: 0; padding: 16px; background: #eef1f6; font-family: sans-serif; }
  .calc {
    width: 260px;
    margin: 0 auto;
    padding: 16px;
    background: #2d3142;
    border-radius: 16px;
  }
  #screen {
    height: 56px;
    margin-bottom: 12px;
    padding: 0 12px;
    background: #bfc0c0;
    border-radius: 8px;
    font-size: 24px;
    line-height: 56px;
    text-align: right;
    overflow: hidden;
  }
  .keys { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
  button { height: 46px; font-size: 20px; border: 0; border-radius: 10px; background: #4f5d75; color: #ffffff; }
  button.op { background: #ef8354; }
  button.eq { grid-column: span 4; background: #90be6d; }
</style>
</head>
<body>
  <div class="calc">
    <div id="screen">0</div>
    <div class="keys">
      <button>7</button><button>8</button><button>9</button><button class="op">÷</button>
      <button>4</button><button>5</button><button>6</button><button class="op">×</button>
      <button>1</button><button>2</button><button>3</button><button class="op">−</button>
      <button>0</button><button>.</button><button class="op">C</button><button class="op">+</button>
      <button class="eq">=</button>
    </div>
  </div>
<script>
  const screen = document.getElementById('screen');
  let expr = '';   // 屏幕上的算式
  // 给每个按钮装上“点击”反应
  document.querySelectorAll('button').forEach(function (b) {
    b.addEventListener('click', function () { press(b.textContent); });
  });
  function press(key) {
    if (key === 'C') expr = '';
    else if (key === '=') expr = String(calculate(expr));
    else expr += key;
    screen.textContent = expr || '0';
  }
  // 计算算式：先算乘除，再算加减
  function calculate(text) {
    const nums = text.split(/[+−×÷]/).map(Number);
    const ops = text.replace(/[0-9.]/g, '').split('');
    for (let i = 0; i < ops.length; ) {   // 第一遍：处理 × 和 ÷
      if (ops[i] === '×' || ops[i] === '÷') {
        const r = ops[i] === '×' ? nums[i] * nums[i + 1] : nums[i] / nums[i + 1];
        nums.splice(i, 2, r);
        ops.splice(i, 1);
      } else {
        i++;
      }
    }
    let result = nums[0];   // 第二遍：从左到右处理 + 和 −
    for (let i = 0; i < ops.length; i++) {
      result = ops[i] === '+' ? result + nums[i + 1] : result - nums[i + 1];
    }
    return result;
  }
</script>
</body>
</html>`;

/* ================= requirements: parse a prompt → requirement keys + offline patch; check keys against code ================= */
const okMD=(m,d)=>+m>=1&&+m<=12&&+d>=1&&+d<=31;
function parse(t){t=String(t||'');const keys=[],P={};let m;
 if(/日历/.test(t)){keys.push('cal');P.cal=1;}
 if(/时钟|钟表|时间/.test(t)){keys.push('clock');P.clock=1;}
 if(/计算器/.test(t)){keys.push('calc');P.calc=1;}
 m=/生日[^0-9。]{0,8}?(\d{1,2})\s*月\s*(\d{1,2})/.exec(t);
 if(m&&okMD(m[1],m[2])){keys.push('bday','bdate:'+(+m[1])+'-'+(+m[2]));P.bday={m:+m[1],d:+m[2]};}else if(/生日/.test(t)){keys.push('bday');P.bday0=1;}
 m=/([一-龥]{0,8}?(纪念日|节))[^0-9。]{0,8}?(\d{1,2})\s*月\s*(\d{1,2})/.exec(t);
 if(m&&okMD(m[3],m[4])){const n=m[1].replace(/^(把|将|添加|增加|是|我的|我们的)+/,'')||'纪念日';keys.push('anniv','adate:'+(+m[3])+'-'+(+m[4]));P.anniv={n,m:+m[3],d:+m[4]};}else if(/纪念日/.test(t)){keys.push('anniv');P.anniv0=1;}
 m=/(背景|底色)[^，。,；;]{0,8}?([红橙黄绿青蓝紫粉黑白灰])/.exec(t);let c=m?m[2]:'';if(!c){m=/([红橙黄绿青蓝紫粉黑白灰])色的?(背景|底色)/.exec(t);if(m)c=m[1];}
 if(c){keys.push('bg:'+c);P.bg=c;}
 m=/(标题|题目|名字)(改成|改为|换成|叫做|叫|是|为)\s*[「“"《]?([^」”"》，。,\s]{1,14})/.exec(t);if(m){keys.push('title:'+m[3]);P.title=m[3];}
 return {keys:[...new Set(keys)],P};}
function apply(o,P){o=Object.assign({},o);['cal','clock','bg','title'].forEach(k=>{if(P[k])o[k]=P[k];});
 if(P.bday)o.bday=P.bday;else if(P.bday0&&!o.bday)o.bday={m:1,d:1,g:1};
 if(P.anniv)o.anniv=P.anniv;else if(P.anniv0&&!o.anniv)o.anniv={n:'植树节',m:3,d:12,g:1};return o;}
/* cumulative requirement keys of a prompt chain: later colour / title / dates replace earlier ones */
function cumKeys(ps){const map=new Map();ps.forEach(p=>parse(p).keys.forEach(k=>{const i=k.indexOf(':');const g=i<0?k:k.slice(0,i);map.set(g,k);}));return [...map.values()];}
const NAMED={blue:'#0000ff',navy:'#000080',skyblue:'#87ceeb',lightblue:'#add8e6',dodgerblue:'#1e90ff',royalblue:'#4169e1',steelblue:'#4682b4',deepskyblue:'#00bfff',cornflowerblue:'#6495ed',midnightblue:'#191970',lightskyblue:'#87cefa',powderblue:'#b0e0e6',aliceblue:'#f0f8ff',red:'#ff0000',green:'#008000',lightgreen:'#90ee90',yellow:'#ffff00',orange:'#ffa500',purple:'#800080',pink:'#ffc0cb',white:'#ffffff',black:'#000000',gray:'#808080',grey:'#808080',teal:'#008080',cyan:'#00ffff',lavender:'#e6e6fa',violet:'#ee82ee',gold:'#ffd700',beige:'#f5f5dc',whitesmoke:'#f5f5f5',lightgray:'#d3d3d3',lightgrey:'#d3d3d3',darkblue:'#00008b',mediumblue:'#0000cd'};
function colorName(v){v=String(v).toLowerCase();let r,g,b,m=/#([0-9a-f]{6}|[0-9a-f]{3})\b/.exec(v);
 if(m){let h=m[1];if(h.length===3)h=h.split('').map(x=>x+x).join('');r=parseInt(h.slice(0,2),16);g=parseInt(h.slice(2,4),16);b=parseInt(h.slice(4,6),16);}
 else if((m=/rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/.exec(v))){r=+m[1];g=+m[2];b=+m[3];}
 else{const w=(v.match(/[a-z]+/g)||[]).find(x=>NAMED[x]);return w?colorName(NAMED[w]):'';}
 r/=255;g/=255;b/=255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b),l=(mx+mn)/2,d=mx-mn;let s=0,h=0;
 if(d){s=d/(1-Math.abs(2*l-1));h=mx===r?((g-b)/d)%6:mx===g?(b-r)/d+2:(r-g)/d+4;h*=60;if(h<0)h+=360;}
 if(s<0.15||l>0.96)return l>0.85?'白':l<0.2?'黑':'灰';if(l<0.1)return '黑';
 if(h<15||h>=345)return l>0.75?'粉':'红';if(h<40)return '橙';if(h<65)return '黄';if(h<165)return '绿';if(h<190)return '青';if(h<255)return '蓝';if(h<290)return '紫';return '粉';}
/* the page's background colour, read from the code (body / html / :root rule, or an inline style on <body>) */
function bgName(c){c=String(c||'');const st=[...c.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map(m=>m[1]).join('\n');let val='';const re=/([^{}]+)\{([^}]*)\}/g;let m;
 while((m=re.exec(st))){if(/(^|[\s,])(body|html|:root)\b/i.test(m[1])){const b=/background(?:-color)?\s*:\s*([^;]+)/i.exec(m[2]);if(b)val=b[1];}}
 const inl=/<body[^>]*style\s*=\s*["'][^"']*background(?:-color)?\s*:\s*([^;"']+)/i.exec(c);if(inl)val=inl[1];return val?colorName(val):'';}
const dateRe=(md)=>{const [mm,dd]=md.split('-').map(Number);return new RegExp(`${mm}\\s*月\\s*${dd}\\s*[日号]|\\(\\s*${mm}\\s*,\\s*${dd}\\s*\\)|,\\s*${mm-1}\\s*,\\s*${dd}\\s*\\)|0?${mm}-0?${dd}\\b|0?${mm}/0?${dd}\\b`);};
function chk(k,c){c=String(c||'');const i=k.indexOf(':'),a=i<0?k:k.slice(0,i),v=i<0?'':k.slice(i+1);
 switch(a){case 'cal':return /getDay\s*\(/.test(c)&&/(日历|calendar)/i.test(c);
  case 'clock':return /(setInterval|requestAnimationFrame)/.test(c)&&/(getHours|getSeconds|toLocaleTimeString)/.test(c);
  case 'calc':return (c.match(/<button/gi)||[]).length>=10;
  case 'bday':return /生日/.test(c)&&/(倒计时|还有|天)/.test(c);
  case 'anniv':return /纪念日/.test(c);
  case 'bg':{const n=bgName(c);return v==='蓝'?(n==='蓝'||n==='青'):n===v;}
  case 'title':return c.includes(v);
  case 'bdate':return /生日/.test(c)&&dateRe(v).test(c);
  case 'adate':return dateRe(v).test(c);}return false;}
function kName(k){const i=k.indexOf(':'),a=i<0?k:k.slice(0,i),v=i<0?'':k.slice(i+1);
 return {cal:'日历',clock:'时钟',calc:'计算器',bday:'生日倒计时',anniv:'纪念日提醒'}[a]||(a==='bg'?`背景为${v}色`:a==='title'?`标题「${v}」`:a==='bdate'?`生日是 ${v.replace('-',' 月 ')} 日`:a==='adate'?`纪念日是 ${v.replace('-',' 月 ')} 日`:k);}
const chkHTML=(keys,code)=>keys.length?`<div class="l10-chk">${keys.map(k=>{const ok=chk(k,code);return `<span class="${ok?'ok':'no'}">${ok?'✓':'✗'} ${esc(kName(k))}</span>`;}).join('')}</div>`:'<p class="note">提示词里没有可以自动检查的具体要求。</p>';
/* offline page for a prompt / a chain of prompts */
const offlineFor=p=>{const r=parse(p);if(r.P.calc)return CALC;if(!r.keys.length)return build({vague:1});return build(apply({},r.P));};
const offlineChain=ps=>build(ps.reduce((o,p)=>apply(o,parse(p).P),{vague:1}));
const shrink=h=>{h=String(h||'');if(bytes(h)<=12000)return h;const s=h.split('\n').map(x=>x.replace(/^\s+/,'')).filter(x=>x&&!/^\/\/[^\n]*$/.test(x)).join('\n');return bytes(s)<=12000?s:'';};

/* ================= generation: progress is shown inside the AI bubble ================= */
const S={g:[],iv:[],c:{},xl:0,xm:'tick',w:{bg:'#fff3c4',col:'#d1495b',size:32,bad:'0'}};
let ctls=new Set(),timers=new Set();
function stopAll(){ctls.forEach(c=>{try{c.abort();}catch(e){}});ctls.clear();timers.forEach(t=>clearInterval(t));timers.clear();if(S.clk){clearInterval(S.clk);S.clk=0;}}
const newCtl=()=>{const c=new AbortController();ctls.add(c);return c;};
const bump=()=>{const l=App.lesson(K);l.nExp=(l.nExp||0)+1;};
function fakeStream(text,onText,signal){return new Promise((res,rej)=>{const ls=text.split('\n');let i=0,tm=0;const per=Math.max(12,Math.min(40,1700/ls.length));
 const ab=()=>{clearTimeout(tm);rej({code:'cancelled'});};if(signal){if(signal.aborted)return ab();signal.addEventListener('abort',ab,{once:true});}
 const step=()=>{i=Math.min(ls.length,i+1+(Math.random()<.35?1:0));onText(ls.slice(0,i).join('\n'));if(i>=ls.length){if(signal)signal.removeEventListener('abort',ab);res();}else tm=setTimeout(step,per*(0.6+Math.random()*0.8));};
 tm=setTimeout(step,300+Math.random()*200);});}
const PH=['理解要求','搭框架','写样式','写内容','写程序','完成'];
const phaseOf=t=>/<\/html>/i.test(t)?5:/<script/i.test(t)?4:/<body/i.test(t)?3:/<style/i.test(t)?2:/<(!doctype|html|head)/i.test(t)?1:0;
/* live "AI 正在写" view inside an App.aiBox bubble */
function runUI(sel,word='AI 正在写代码'){let iv=0,t0=0;const q=s=>{const b=$(sel);return b?$(s,b):null;};
 const end=()=>{clearInterval(iv);timers.delete(iv);};
 return {start(){t0=performance.now();App.aiSay(sel,`<div class="l10-run"><div class="l10-ph">${PH.map((p,i)=>`<span data-ph="${i}">${p}</span>`).join('')}</div><div class="l10-rs">${word}：<b data-ln>0</b> 行 · <span data-tm>0.0</span> 秒</div></div>`,{busy:true});
   end();iv=setInterval(()=>{const e=q('[data-tm]');if(e)e.textContent=((performance.now()-t0)/1000).toFixed(1);},100);timers.add(iv);},
  update(t){t=String(t||'');const e=q('[data-ln]');if(e)e.textContent=nL(t);const n=phaseOf(t);const b=$(sel);if(b)$$('[data-ph]',b).forEach((s,i)=>{s.classList.toggle('on',i<=n);s.classList.toggle('cur',i===n);});},
  finish:end,stop:end};}
const NOUI={start(){},update(){},finish(){},stop(){}};
async function gen(prompt,{base='',offline,ui,signal}){const t0=performance.now();ui.start();let mode='offline',html='',note='';
 if(App.AI.real()){try{const r=await App.Code.generate(prompt+TECH,{base,signal,onText:o=>ui.update(o.html||'')});
   if(r&&r.html&&/<\w/.test(r.html)){html=r.html;mode=r.mode||App.AI.mode();}else if(r)note='AI 这次没有给出完整的网页代码，改用离线示例。';}
  catch(e){App.AI.fail(e);if((e&&e.code==='cancelled')||(signal&&signal.aborted)){ui.stop();throw {code:'cancelled'};}note=App.AI.errText(e);}}
 if(!html){html=offline();if(note)App.toast(note);try{await fakeStream(html,t=>ui.update(t),signal);}catch(e){ui.stop();throw e;}}
 const ms=Math.round(performance.now()-t0);ui.finish();return {html,mode,ms};}
function showPrev(el,html,{h=320,label='网页预览'}={}){el.innerHTML=`<div class="l10-prev"><div class="bar"><i></i><i></i><i></i><span>${esc(label)}</span></div><div class="fr"></div></div>`;App.Code.preview($('.fr',el),html,{height:h});}
const nowTxt=()=>{const d=new Date();return `${d.getFullYear()} 年 ${d.getMonth()+1} 月 ${d.getDate()} 日 星期${DAYS[d.getDay()]} ${d.toLocaleTimeString('zh-CN',{hour12:false})}`;};
function startClock(){if(S.clk)return;const f=()=>$$('.l10-now').forEach(e=>e.textContent=nowTxt());f();S.clk=setInterval(f,1000);}
const secs=ms=>(ms/1000).toFixed(1);
/* one multiple-choice record on the note pad: big wrapping chips */
const optsHTML=(name,opts,cur)=>`<div class="opts l10-wrap">${opts.map((t,j)=>`<button type="button" class="chip ${cur===j?'on':''}" data-${name}="${j}">${t}</button>`).join('')}</div>`;

/* ================= warm-up: a tiny page whose code the student changes ================= */
const W_SHAPE=[['★','星星'],['♥','爱心'],['●','圆点'],['▲','三角']],W_SCOL=[['#ffb400','黄'],['#ff5d8f','粉'],['#3b8bff','蓝'],['#18b98a','绿']];
const W_ACT=[['spin','转一圈'],['jump','跳一下'],['grow','变大一下'],['off','关掉程序']];
const shapeName=c=>(W_SHAPE.find(x=>x[0]===c)||W_SHAPE[0])[1],actName=a=>(W_ACT.find(x=>x[0]===a)||W_ACT[0])[1];
const btnText=o=>`点我，${shapeName(o.shape)}${actName(o.act==='off'?(o.last||'spin'):o.act)}`;
const ACTJS={spin:['  let turn = 0;','  btn.onclick = function () {','    turn = turn + 1;','    star.style.transform = \'rotate(\' + turn * 360 + \'deg)\';','  };'],
 jump:['  btn.onclick = function () {','    star.style.transform = \'translateY(-46px)\';','    setTimeout(function () { star.style.transform = \'\'; }, 350);','  };'],
 grow:['  btn.onclick = function () {','    star.style.transform = \'scale(1.6)\';','    setTimeout(function () { star.style.transform = \'\'; }, 450);','  };']};
function cardHTML(o){const ls=['<!DOCTYPE html>','<html>','<head>','<meta charset="UTF-8">','<style>',`  body { background: ${o.bg}; text-align: center; font-family: sans-serif; }`,`  h1 { color: ${o.col}; font-size: 30px; }`,`  .star { font-size: ${o.size}px; color: ${o.scol}; line-height: 1.15; display: inline-block; transition: transform ${o.act==='spin'?'.8s':'.3s'}; }`,'  button { font-size: 18px; padding: 10px 20px; border-radius: 12px; border: 2px solid #333; background: #fff; cursor: pointer; }','</style>','</head>','<body>',
 '  <h1>你好，我是小禾</h1>',`  <div class="star" id="star">${o.shape}</div>`,`  <p><button id="btn">${btnText(o)}</button></p>`];
 if(o.act!=='off')ls.push('<script>','  const btn = document.getElementById(\'btn\'), star = document.getElementById(\'star\');',...ACTJS[o.act],'</script>');
 /* tell the lab page when the button is pressed (the preview is a sandbox, it can only send this one message) */
 ls.push('<script>document.getElementById(\'btn\').addEventListener(\'click\',function(){parent.postMessage({__labBtn:1},\'*\')})</script>','</body>','</html>');return ls.join('\n');}
const W0={bg:'#fff3c4',col:'#d1495b',size:60,shape:'★',scol:'#ffb400',act:'spin',last:'spin'};
const wFull=w=>cardHTML(w);
const W_BG=[['#fff3c4','浅黄'],['#cfe8ff','浅蓝'],['#d8f3dc','浅绿'],['#1d3557','深蓝']],W_COL=[['#d1495b','红'],['#6a4c93','紫'],['#2a9d8f','绿']];
/* small challenges for the free-play stage: every listed property must match */
const W_CH=[['浅绿背景上，一颗粉色爱心，点了会跳',{bg:'#d8f3dc',shape:'♥',scol:'#ff5d8f',act:'jump'}],['一个蓝色圆点，点了会变大',{shape:'●',scol:'#3b8bff',act:'grow'}],['深蓝夜空里，一颗大大的黄星星（90px 以上），点了转一圈',{bg:'#1d3557',shape:'★',scol:'#ffb400',act:'spin',big:90}]];
const WQ=['按钮坏了，要换一个浏览器','样子靠 HTML 和 CSS，会不会动靠程序','浏览器自己决定能不能点'];

/* ================= other content ================= */
const CALCT=[['t0','25 + 17','42','25 + 17 = 42，最基本的加法它不该算错。'],['t2','0.1 + 0.2','0.3','应该是 0.3。电脑用二进制存小数，会有极小的误差，好的程序会先四舍五入。'],['t3','8 ÷ 0','提示“不能除以 0”','数学里不能除以 0，好的计算器应该直接提示。']];
const calcOk=(id,v)=>{v=String(v||'').replace(/\s/g,'');if(!v)return null;if(id==='t0')return v==='42';if(id==='t2')return v==='0.3'||v==='.3';return /不能|无法|错误|error|不可/i.test(v);};
/* what the student saw on the calculator screen: [label, stored value] */
const CALCO={t0:[['42','42'],['别的结果','别的']],t2:[['0.3','0.3'],['0.30000000000000004','0.30000000000000004'],['别的结果','别的']],t3:[['“不能除以 0”或“错误”','不能除以 0'],['Infinity','Infinity'],['0','0'],['别的结果','别的']]};
/* what to say about the exact wrong result the student saw */
const CALCWHY={t3:{Infinity:'屏幕上的 Infinity 是“无穷大”的意思，用的人看不懂。数学里不能除以 0，好的计算器应该直接提示。','0':'8 ÷ 0 不等于 0。数学里不能除以 0，显示 0 会让人以为真的算出了结果。','别的':'数学里不能除以 0。屏幕上不管显示什么数，都会让人以为真的算出了结果。'},
 t2:{'0.30000000000000004':'应该是 0.3。电脑用二进制存小数，会有极小的误差，好的程序会先四舍五入。','别的':'应该是 0.3。'},t0:{'别的':'25 + 17 = 42，最基本的加法它算错了。'}};
const OCALC=['能正常使用','大部分能用，有的结果不对','不能使用'];
const CCK=['m','t','h','s'];
const GK=[['cc','日历和时钟','生成一个显示日历和时钟的网页'],['clock','只要时钟','生成一个显示时钟的网页'],['cal','只要日历','生成一个显示日历的网页']];
const GL=[['s','不到 70 行'],['m','70～100 行'],['l','100 行以上']];
const glOf=n=>n<70?'s':n<=100?'m':'l';
/* 代码翻译机: what each picked line says in plain words. say = one sentence; parts = [code piece, meaning]; hl = CSS selector of the thing it controls */
function xlate(line){const t=bare(line);let m;
 if((m=/background(?:-color)?\s*:\s*([^;]+)/i.exec(t)))return {say:'把整页的背景涂成这种颜色',sw:m[1].trim(),parts:[['background','背景'],[m[1].trim(),'一种颜色的编号']],hl:'body',where:'整页的背景'};
 if((m=/<h1[^>]*>(.*?)<\/h1>/i.exec(t)))return {say:`在网页最上面放一个大标题，上面写着“${m[1]}”`,parts:[['<h1>','大标题从这里开始'],[m[1],'标题上的字'],['</h1>','大标题到这里结束']],hl:'h1',where:'最上面的大标题'};
 if(/<canvas/i.test(t))return {say:'在网页上放一块空白的“画布”，后面的程序会在上面画出时钟',parts:[['<canvas>','一块画布'],[(/id="([^"]+)"/.exec(t)||[])[0]||'id','给这块画布起的名字，方便程序找到它']],hl:'canvas',where:'画时钟的那一块'};
 if(/<table/i.test(t))return {say:'在网页上放一张空表格，后面的程序会把这个月的日期一格一格填进去',parts:[['<table>','一张表格'],[(/id="([^"]+)"/.exec(t)||[])[0]||'id','给这张表格起的名字，方便程序找到它']],hl:'table',where:'日历那张表格'};
 if(/new Date\(\s*\)/.test(t)){const n=(/(?:const|let|var)\s+(\w+)/.exec(t)||[])[1];return {say:`问电脑：“现在是几月几日、几点几分？”${n?`把答案记下来，起名叫 ${n}`:''}`,parts:[['new Date()','问电脑现在的日期和时间'],...(n?[[`const ${n} =`,`把答案记下来，起名叫 ${n}`]]:[])],hl:'#month, h2, #digital',where:'显示日期和时间的地方'};}
 if(/for\s*\(/.test(t))return {say:'把同一件事重复做很多遍。这里是在一格一格地画日历的格子',parts:[['for','重复做'],['i++','每做完一遍，数数加 1']],hl:'table',where:'日历里的一个个格子'};
 if((m=/setInterval\(\s*([\w.]+)?[^,]*,\s*(\d+)/.exec(t))){const ms=+m[2];const sec=ms>=1000?(ms/1000)+' 秒':ms+' 毫秒';return {say:`每隔 ${sec}，把时钟重新画一遍。所以指针会一下一下地走`,parts:[['setInterval','每隔一段时间，就做一次'],...(m[1]?[[m[1],/clock/i.test(m[1])?'“画时钟”这件事':'要重复做的那件事']]:[]),[m[2],`${ms} 毫秒${ms>=1000?'，也就是 '+sec:''}`]],hl:'canvas, #digital',where:'会走的时钟'};}
 if(/requestAnimationFrame/.test(t))return {say:'画完一幅画面，马上请浏览器再画下一幅，所以时钟一直在动',parts:[['requestAnimationFrame','请浏览器接着画下一幅画面']],hl:'canvas, #digital',where:'会动的时钟'};
 return null;}
const HLJS='<script>(function(){var st=document.createElement("style");st.textContent=".__hl{outline:5px solid #ffd43b!important;outline-offset:3px;border-radius:8px;box-shadow:0 0 0 6px rgba(255,212,59,.35)!important}";document.head.appendChild(st);addEventListener("message",function(e){var d=e.data;if(!d||!d.__labHL)return;[].forEach.call(document.querySelectorAll(".__hl"),function(x){x.classList.remove("__hl")});document.body.style.boxShadow="";if(d.__labHL==="body"){document.body.style.boxShadow="inset 0 0 0 7px #ffd43b";return}var el=document.querySelector(d.__labHL);if(el){el.classList.add("__hl");try{el.scrollIntoView({block:"nearest"})}catch(x){}}})})()<\/script>';
const MIS=[{id:'tick',t:'让时钟走起来',q:'哪一行让时钟走起来？',re:/setInterval|requestAnimationFrame/},{id:'date',t:'知道现在几点',q:'哪一行让网页知道现在几点？',re:/new Date\(\s*\)/},{id:'bg',t:'给背景涂颜色',q:'哪一行给背景涂上颜色？',re:/background/i}];
const PICK=[/background(-color)?\s*:/i,/<h1/i,/<canvas|<table/i,/new Date\(\s*\)/,/for\s*\(/,/setInterval|requestAnimationFrame/];
function pickLines(h){const ls=String(h||'').split('\n');const idx=[];PICK.forEach(re=>{const i=ls.findIndex((l,j)=>re.test(l)&&!idx.includes(j));if(i>=0)idx.push(i);});return idx.sort((a,b)=>a-b).map(i=>({i,s:ls[i]}));}
const bare=s=>String(s).replace(/\s*\/\/.*$/,'').replace(/<!--.*?-->/g,'').trim();
const FAST=()=>build({clock:1});
const FQ=['还是每秒走一格','每 5 秒才跳一下','完全不走了'],FG=['每秒走一格','5 秒跳一下','不走了'];
const CARDS=[['cal','日历'],['clock','时钟'],['bg','蓝色背景'],['title','标题“我的时间小助手”'],['bday','生日倒计时'],['anniv','纪念日提醒']];
const CB=['具体的效果更好','笼统的效果更好','差不多'];
const ADDS=['添加日历和时钟功能','添加生日倒计时功能','添加纪念日提醒功能','网页背景修改为蓝色'];
const SUGS=['我的生日是 6 月 18 日','入队纪念日是 10 月 13 日','标题改成“小禾的时间站”','背景改成紫色'];
const REQS=[['日历和时钟',ADDS[0]],['生日倒计时',ADDS[1]],['纪念日提醒',ADDS[2]],['蓝色背景',ADDS[3]],['生日是 6 月 18 日',SUGS[0]],['改标题',SUGS[2]]];
const STANCE=[['ai','AI 主导：以后说一句话就行，不用再学编程了'],['human','人主导：人出创意、把关，AI 帮忙写'],['mix','说不清：要看做的是什么事']];
const STS=[['ai','AI 主导：不用学编程了'],['human','人主导：人出创意和把关'],['mix','说不清：看做什么事']];
const ROLES=[['idea','想出网页要做什么（创意）','h','创意来自人：AI 不会替你决定想做什么。'],['say','用清楚、具体的话描述要求','h','AI 不会读心术，要求得由人说清楚。'],['code','写出上百行网页代码','a','这是 AI 最擅长的：几十秒写出上百行。也可以人和 AI 一起写。'],
 ['explain','解释读不懂的代码','a','可以请 AI 解释；读懂以后，人才能判断它写得对不对。'],['test','测试功能对不对（比如试算 0.1 + 0.2）','h','AI 写完不会自己发现所有问题，要人动手测试。'],['fix','发现问题后提出修改要求','h','哪里不对、要改成什么样，由人来判断和描述。'],
 ['modify','按要求修改代码','a','AI 按新要求改代码很快；也可以人自己改。'],['decide','决定作品满不满意、能不能分享','h','作品由人负责：人来决定是否满意、能否分享。']];
const RK={h:'人',a:'AI',b:'一起'};
/* 分工没有标准答案。这里只看一件事：需要人把关的事（参考为“人”的 5 件），有没有安排人参与（人或一起）。 */
const roleOk=(id,v)=>{const r=ROLES.find(x=>x[0]===id);if(!r||!v)return false;return r[2]==='a'||v!=='a';};
const ROLEN={idea:'想创意',say:'说清要求',code:'写代码',explain:'解释代码',test:'测试',fix:'提修改要求',modify:'改代码',decide:'决定能否分享'};
const ROLEQ={idea:'AI 可以帮你出主意。可是做什么网页，最后谁说了算？',say:'AI 可以帮你把话改通顺。可是你想要什么，它怎么知道？',test:'AI 也能帮忙检查。可是网页好不好用，谁最清楚？',fix:'哪里不满意、想改成什么样，AI 自己知道吗？',decide:'作品分享出去以后，如果有错，谁来负责？'};

const QUIZ=[
 {id:'q1',q:'我们平时浏览的网页，浏览器是怎样把它显示出来的？',opts:['浏览器自己想象网页该长什么样','浏览器获得网页代码后，按照代码的要求呈现网页效果','网页是一张图片，浏览器直接把图片显示出来','必须由程序员在旁边一直操作'],a:1,why:'网页背后都对应着代码。浏览器读到代码，就按代码的要求把文字、颜色、按钮、动画呈现出来；代码改一点，网页就跟着变。'},
 {id:'q2',q:'AI 生成的时钟网页里有一行 setInterval(drawClock, 1000)。它的作用是：',opts:['让网页每隔 1000 毫秒（1 秒）重画一次时钟，指针就走起来了','把时钟放大 1000 倍','让时钟一共只走 1000 秒','把背景改成 1000 号颜色'],a:0,why:'setInterval 是定时器：每隔一段时间（单位是毫秒）自动执行一次后面的程序。1000 毫秒 = 1 秒，所以时钟每秒刷新一次。'},
 {id:'q3',q:'想让 AI 生成一个令自己满意的网页，下面哪种做法最好？',opts:['只说“生成一个网页”，让 AI 自己猜','一次写一大段又长又乱的要求，越多越好','先从简单要求开始，再根据生成结果，逐步提出明确、具体的修改要求','AI 写完就直接用，不用看效果'],a:2,why:'教材说：可以先从简单要求开始，再根据结果逐步提出添加功能或调整细节等更具体的要求，并确保每次的要求都明确、清晰。'},
 {id:'q4',q:'AI 做的计算器把 0.1 + 0.2 显示成 0.30000000000000004。这件事说明：',opts:['计算器没问题，是我们的数学学错了','AI 写的代码也可能有问题，需要人动手测试、发现问题，再提出修改要求','只要是 AI 写的代码就完全不能用','这是浏览器坏了'],a:1,why:'电脑用二进制存小数，会有极小的误差，好的程序会先把结果四舍五入。AI 写代码很快，但不一定考虑周全——测试和把关要靠人。'},
 {id:'q5',q:'关于人与 AI 协作编程，哪种说法最恰当？',opts:['AI 什么都会，人只要等结果就行','人负责创意和明确的要求，理解代码的逻辑，判断和调整 AI 生成的内容；AI 帮忙快速写代码','人必须自己写每一行代码，不能用 AI','谁写的代码多，谁就是作品的主人'],a:1,why:'AI 降低了编程的门槛，但真正驱动创作的是人的创意和表达。熟悉技术原理、思路清晰、表达准确，才能判断和调整 AI 生成的内容，真正驾驭技术。'}];

const CSS=`
.l10-col{display:flex;flex-direction:column;gap:14px;min-width:0}
.l10-prev{border:1.5px solid var(--line2);border-radius:16px;padding:6px;background:var(--panel2)}
.l10-prev .bar{display:flex;gap:6px;align-items:center;padding:2px 4px 7px;font-size:13px;color:var(--muted)}
.l10-prev .bar i{width:10px;height:10px;border-radius:50%;background:var(--line2);flex:none}
.l10-prev .bar span{flex:1;min-width:0;background:var(--panel);border-radius:999px;padding:1px 12px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
.l10-cap{font-size:13.5px;color:var(--muted)}.l10-cap b{display:inline-block;margin-right:8px;padding:1px 10px;border-radius:999px;background:var(--sky-soft);color:var(--sky);font-size:13px}
.l10-lv{padding:16px 18px;border-radius:22px;background:linear-gradient(135deg,#7b5bff,#6c47ff);color:#fff;box-shadow:0 8px 22px #6c47ff40}
.l10-lv .note{color:#ffffffd9;margin-top:4px;font-size:14.5px}
.l10-lvh{display:flex;align-items:center;gap:6px;font-size:13.5px;font-weight:800;opacity:.95}
.l10-lvh span{margin-right:auto}.l10-lvh i{width:22px;height:8px;border-radius:999px;background:#ffffff55}.l10-lvh i.on{background:#ffd43b}
.l10-lvt{font-size:22px;font-weight:900;line-height:1.3;margin-top:6px}
@media (min-width:881px){.l10-kside{position:sticky;top:76px}}
#l10-x-prev iframe{zoom:.6}
#l10-x-prev .fr{overflow:hidden}
.l10-xr{display:flex;flex-direction:column;gap:2px;min-width:0}
.l10-xr em{font-style:normal;font-family:var(--f-body);font-size:13.5px;color:#ffe9a8;line-height:1.45}
.l10-code button.on{border-color:#ffd43b;background:#ffd43b1f}
.l10-code button.hit i{color:#7dffb0}
.l10-say{font-size:19px;font-weight:800;line-height:1.5;margin-top:8px;color:var(--ink)}
.l10-sw{display:inline-block;width:22px;height:22px;border-radius:6px;border:2px solid #1e1b3a33;vertical-align:-4px;margin-left:8px}
.l10-parts{display:flex;flex-direction:column;gap:6px;margin-top:10px}
.l10-parts b{font-size:13.5px;color:var(--grape-d)}
.l10-parts span{display:flex;flex-wrap:wrap;align-items:baseline;gap:10px;font-size:15.5px;background:#fff;border-radius:12px;padding:6px 12px}
.l10-parts code{font-family:var(--f-mono);font-size:14px;background:#101a3d;color:#d6e4ff;border-radius:7px;padding:1px 8px;word-break:break-all}
.l10-tabs{display:flex;flex-wrap:wrap;gap:6px}
.l10-tabs button{border:1.5px solid var(--line2);background:#fff;color:var(--ink);border-radius:999px;padding:5px 14px;font-size:14.5px;font-weight:700;cursor:pointer}
.l10-tabs button b{color:var(--mint-d);margin-right:4px}
.l10-tabs button:hover:not(:disabled){border-color:var(--sky)}
.l10-tabs button.on{background:var(--sky);border-color:var(--sky);color:#fff}.l10-tabs button.on b{color:#fff}
.l10-tabs button:disabled{opacity:.45;cursor:not-allowed}
.l10-here{font-style:normal;margin-left:auto;flex:none;font-family:var(--f-body);font-size:12px;font-weight:800;color:#1e1b3a;background:#ffd43b;border-radius:999px;padding:0 9px}
.l10-empty{display:flex;align-items:center;justify-content:center;min-height:150px;border:2.5px dashed var(--line2);border-radius:16px;color:var(--dim);font-size:15px;text-align:center;padding:16px;background:var(--bg2)}
.l10-run{display:flex;flex-direction:column;gap:8px}
.l10-ph{display:flex;flex-wrap:wrap;gap:5px}
.l10-ph span{font-size:13px;padding:1px 10px;border-radius:999px;border:2px solid var(--line2);color:var(--dim);background:var(--panel)}
.l10-ph span.on{border-color:var(--grape);color:var(--grape-d)}
.l10-ph span.cur{background:var(--grape);color:var(--panel)}
.l10-rs{font-size:16px}.l10-rs b{font-family:var(--f-display);font-weight:800;font-size:24px;color:var(--grape-d)}
.l10-chk{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}
.l10-chk span{font-size:14px;font-weight:700;padding:2px 12px;border-radius:999px}
.l10-chk span.ok{background:var(--mint-soft);color:var(--mint-d)}
.l10-chk span.no{background:var(--coral-soft);color:var(--coral-d)}
.l10-chk span.lost{background:var(--sun-soft);color:var(--sun-d)}
.l10-now{font-weight:700;color:var(--sky)}
.l10-wrap .chip{white-space:normal;text-align:left;border-radius:14px;line-height:1.4}
.l10-code{display:flex;flex-direction:column;gap:3px;padding:10px;border-radius:16px;border:1.5px solid var(--line2);background:#101a3d}
.l10-code button{display:flex;gap:10px;align-items:baseline;width:100%;text-align:left;font-family:var(--f-mono);font-size:14px;line-height:1.5;color:#d6e4ff;background:none;border:2px solid transparent;border-radius:10px;padding:4px 8px;cursor:pointer;min-width:0}
.l10-code button i{font-style:normal;flex:none;width:26px;text-align:right;color:#8fa0d6;font-size:12px}
.l10-code button code{font:inherit;white-space:pre-wrap;word-break:break-all;min-width:0}
.l10-code button:hover{border-color:#8fa0d6}
.l10-code button.mk{background:#ffd43b40;color:#fff3c4;box-shadow:inset 5px 0 0 #ffd43b}
.l10-code button.on{border-color:#ffd43b;background:#ffd43b24}
.l10-code button.hit{box-shadow:inset 5px 0 0 #3ddc97}
.l10-code button.gone code{text-decoration:line-through;color:#8fa0d6}
.l10-strip{margin:0;padding:10px 14px;border-radius:14px;background:#101a3d;color:#d6e4ff;font-family:var(--f-mono);font-size:15px;white-space:pre-wrap;word-break:break-all}
.l10-strip b{color:#ffd43b;font-size:19px}
.l10-codeline{display:block;font-family:var(--f-mono);font-size:14px;background:#101a3d;color:#d6e4ff;border-radius:10px;padding:5px 10px;margin-bottom:6px;white-space:pre-wrap;word-break:break-all}
.l10-pt{display:flex;flex-direction:column;gap:2px;font-size:17px;font-weight:700;padding:10px 14px;border-radius:14px;background:var(--sky-soft);line-height:1.5}
.l10-pt small{font-size:13px;font-weight:700;color:var(--sky)}
.l10-tbl{border-collapse:collapse;width:100%;margin-top:6px;font-size:15px}
.l10-tbl th,.l10-tbl td{padding:4px 8px;text-align:left;border-bottom:2px solid var(--line)}
.l10-tbl td.ok{color:var(--mint-d);font-weight:700}.l10-tbl td.no{color:var(--coral-d);font-weight:700}
.l10-trail{display:flex;flex-wrap:wrap;gap:6px;font-size:13.5px}
.l10-trail span{padding:2px 10px;border-radius:999px;background:var(--panel2);border:2px solid var(--line);color:var(--muted)}

.l10-card{display:flex;flex-direction:column;gap:6px;padding:20px;border-radius:20px;border:1.5px solid var(--line2);background:var(--sky-soft);box-shadow:var(--pop)}
.l10-card small{font-size:14px;font-weight:700;color:var(--sky)}
.l10-card b{font-family:var(--f-display);font-weight:800;font-size:24px;line-height:1.35}
.l10-big3{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.l10-big3 .chip{font-family:var(--f-display);font-weight:800;font-size:22px;padding:14px 6px;border-radius:18px;border-color:var(--ink);box-shadow:var(--pop)}
.l10-one{display:flex;flex-direction:column;gap:14px;max-width:640px}
.l10-dex{display:flex;flex-direction:column;gap:12px;font-size:14px}
.l10-dex ol{margin:4px 0 0;padding-left:20px}
.l10-gl{font-weight:700}
.station.ran .l10-plat.after-run{display:block;font-size:15px}
.l10-plat .l10-now{font-size:16.5px}
.l10-plain{margin:0;font-size:15.5px;line-height:1.55;color:var(--ink)}.l10-plain b{color:var(--grape-d)}
#l10-c-pv iframe,#l10-c-ps iframe{zoom:.6}
#l10-c-pv .fr,#l10-c-ps .fr{overflow:hidden}
.l10-trail button{font:inherit;font-size:13.5px;padding:2px 10px;border-radius:999px;background:var(--panel2);border:2px solid var(--line);color:var(--muted);cursor:pointer}
.l10-trail button:hover{border-color:var(--sky)}
.l10-trail button.on{border-color:var(--ink);color:var(--ink);font-weight:700;background:var(--sun-soft)}
#l10-r-card{display:flex;flex-direction:column;gap:14px}
.l10-board{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
.l10-board>div{display:flex;flex-direction:column;gap:6px;padding:10px 8px;border-radius:16px;background:var(--panel2);border:1.5px solid var(--line2);min-width:0}
.l10-board h5{margin:0;text-align:center;font-family:var(--f-display);font-weight:800;font-size:18px;color:var(--grape-d)}
.l10-board .chip{white-space:normal;line-height:1.3;border-radius:12px;padding:6px 6px;font-size:14px}
.l10-board .note{text-align:center}`;

/* ================= render ================= */
L.render=function(){const v=$('#v-'+K);if(!v)return;if(!document.getElementById('css-l10')){const st=document.createElement('style');st.id='css-l10';st.textContent=CSS;document.head.appendChild(st);}
 v.innerHTML=`${App.hero(K,'当一回网页工坊的测试员：让 AI 写网页，你来抓 bug、提要求。',['学会用 AI 生成网页代码，制作简单网页。','初步了解人与 AI 协作编程的意义。'])}

 <div class="station" id="l10-s0">${App.head('WARM-UP','导入 · 网页原理','网页背后是代码','照着关卡改一处代码，看左边的网页跟着变')}
  <ol class="steps"><li>照关卡改代码</li><li>闯 3 关，进工坊</li></ol>
  <div class="grid2"><div class="l10-col"><div class="l10-cap"><b>网页</b>浏览器照着代码画出来的样子</div><div id="l10-w-prev"></div>
    <div class="l10-cap"><b>代码</b>网页背后的几行关键代码，黄色的是你刚改的那一行</div><div class="l10-code" id="l10-w-code" aria-label="这个网页的关键代码"></div><p class="note" id="l10-w-ex">点一行代码，看它管什么。</p></div>
   <div class="l10-col"><div id="l10-w-lv"></div><div id="l10-w-fb"></div>
    <div id="l10-w-qbox" hidden>${App.pad('关掉程序后，按钮还在，点了星星却不转。这说明：','<div id="l10-w-q"></div>')}</div></div></div>
  <details class="more"><summary>说明</summary><p class="note">上面是浏览器按代码画出来的网页，下面是它最关键的几行代码。按钮的样子由 HTML 和 CSS 决定；&lt;script&gt; 里的程序负责“按钮被点一下，星星转一圈”。程序一关，按钮的样子还在，却没人管它被点击。</p><div class="grid2">${App.know('网页背后是代码','网页代码通常由三部分组成：<b>HTML</b> 搭结构（标题、段落、按钮放在哪里），<b>CSS</b> 管样式（颜色、大小、位置），<b>JavaScript</b> 是程序（让网页能动、能算、能响应点击）。浏览器获得代码后，就严格按代码的要求把网页呈现出来——改一个数字，字就变大；少了程序，按钮就不会有反应。')}
   ${App.know('浏览器只认代码','浏览器不会猜你的意思：背景改成深蓝，它不会自动把黑色的文字变白，于是文字看不清了。要让网页好看又好用，代码里的每个要求都要写清楚。下一站，你不写代码，而是用中文把要求告诉 AI，让 AI 来写。')}</div></details>
 </div>

 <div class="station" id="l10-s1">${App.head('EXP-01','挑战一 · 帮我做网页','网页生成器','说一句话，让 AI 写出日历时钟网页')}
  <ol class="steps"><li>让 AI 写网页</li><li>对一对时间</li></ol>
  <div class="grid2" data-rb="1"><div class="l10-col"><div id="l10-g-prev"><div class="l10-empty">AI 写好的网页会在这里运行</div></div><div class="l10-cap l10-plat after-run"><b>平台时间</b><span class="l10-now"></span></div></div>
   <div class="l10-col l10-kside">${App.knobs([['网页上要有',App.seg('gk',GK.map(g=>[g[0],g[1]]),'cc')]])}
    <div class="go-row"><span class="l10-gl">我猜 AI 写</span>${App.seg('gl',GL,'')}${App.go('l10-g-go','让 AI 写网页')}</div>
    ${App.aiBox('l10-g-ai','','AI 的工作')}<div id="l10-g-fb"></div>
    <div class="after-run">${App.pad('','<div id="l10-g-q"></div>')}</div></div></div>
  <details class="more"><summary>说明</summary><p class="note">生成的网页在安全沙盒里运行，不联网。发送时平台会附一句技术说明：不用 eval、不弹窗。离线时，网页由平台内置的示意版“网页生成器”拼出真实可运行的代码，生成过程为模拟；接入大模型后会真实生成。</p>${App.know('从一句话到一个网页','我们用自然语言（平时说的话）描述要求，AI 把它“翻译”成网页代码：HTML 搭结构，CSS 管样式，JavaScript 让网页能动、能算；浏览器再按代码把网页呈现出来。AI 写得很快，但代码也可能有小问题，所以网页生成以后，一定要亲手测试。')}</details>
 </div>

 <div class="station" id="l10-s1b">${App.head('EXP-01b','挑战一 · 帮我做网页','计算器抓虫','AI 写的计算器会算错吗？抓出它的 bug！')}
  <ol class="steps"><li>让 AI 写计算器</li><li>按一按，抓出 bug</li></ol>
  <div class="grid2" data-rb="1"><div class="l10-col"><div id="l10-k-prev"><div class="l10-empty">AI 写好的计算器会在这里，可以直接按</div></div></div>
   <div class="l10-col l10-kside"><div class="go-row">${App.go('l10-k-go','让 AI 写计算器')}</div>
    <div class="after-run">${App.pad('','<div id="l10-k-q"></div>','测试记录：左边按，这里记')}</div>
    <div id="l10-k-fb"></div></div></div>
  ${App.aiBox('l10-k-ai','提示词：「生成一个计算器网页」','AI 的工作')}
  <details class="more"><summary>说明</summary><p class="note">计算器在沙盒里运行，平台读不到它的屏幕，所以要你亲手按、亲手记。三道测试题：25 + 17、0.1 + 0.2、8 ÷ 0。</p><p class="note">为什么不测 12 + 7 × 3 这样的连算？因为有的计算器按下一个键就算一步，从左到右得 57；有的会先算乘除，得 33。这是两种不同的设计，不是程序写错了，所以不拿它当 bug。</p>${App.know('AI 写的代码也要测试','很多计算器会把 0.1 + 0.2 算成 0.30000000000000004（电脑用二进制存小数，会有极小的误差，好的程序会先把结果四舍五入）。8 ÷ 0 在数学里没有答案，有的计算器却显示 Infinity 或 0。AI 写代码很快，但不一定考虑周全——测试和把关要靠人。')}</details>
 </div>

 <div class="station" id="l10-s2">${App.head('EXP-02','挑战一 · 读懂代码','代码翻译机','点一行代码，看它在说什么、管网页的哪里')}
  <ol class="steps"><li>点一行代码</li><li>找到 3 个零件</li></ol>
  <div class="grid2" data-rb="1"><div class="l10-col"><div class="l10-cap"><b>网页</b>点了代码以后，它管的地方会亮起黄框</div><div id="l10-x-prev"></div>
    <div class="l10-cap"><b>代码</b>从这个网页的一百多行代码里挑出的 6 行，点一行试试</div><div class="l10-code" id="l10-x-code" aria-label="日历时钟网页里的几行代码"></div></div>
   <div class="l10-col l10-kside"><div id="l10-x-mis"></div>
    <div class="ai-out wait" id="l10-x-ai" aria-live="polite">${App.bot('idle')}<div class="ai-who"><span>代码翻译机</span><span class="ai-src"></span></div><div class="ai-body">点左边一行代码，这里会把它翻译成我们平时说的话</div></div>
    <div id="l10-x-fb"></div></div></div>
  <details class="more" id="l10-x-more"><summary>说明</summary><p class="note">这 6 行的翻译来自平台内置的代码词典，每次都一样。想看全部代码，点下面任意一行，会用一句话解释它（接入大模型时由 AI 解释）。</p><div id="l10-x-full"></div>
   ${App.think(['你认为用 AI 辅助编程有哪些优势？体现在哪些方面？','AI 的编程功能在生活中有哪些应用？'])}
   ${App.know('AI 是了不起的编程助手','我们只需要用自然语言描述要求，AI 就能立刻生成网页代码，制作网页。这种方式降低了编程的门槛，让我们能够更轻松地实现自己的想法。遇到读不懂的代码，可以让 AI 解释；自己编写的代码，也可以让 AI 协助检查和完善。目前，编程已经渗透到社会的各个行业，任何需要数字化、网络化、智能化的场景，都离不开程序的支持。')}</details>
 </div>

 <div class="station" id="l10-s2b">${App.head('EXP-02b','挑战一 · 读懂代码','改一个数字','把 1000 改成 5000，猜猜秒针会怎么走')}
  <ol class="steps"><li>先猜一猜</li><li>数 10 秒看秒针</li></ol>
  <div class="grid2" data-rb="1"><div class="l10-col"><div id="l10-f-prev"></div></div>
   <div class="l10-col"><div class="l10-cap"><b>代码</b>时钟网页里的一行，黄色的数字就是要改的地方</div><pre class="l10-strip" id="l10-f-code"></pre><p class="l10-plain" id="l10-f-say"></p>
    <div id="l10-f-more" hidden><div class="l10-col"><div id="l10-f-ch"></div>${App.knobs([['间隔',App.range('l10-f-ms',200,5000,200,5000,' 毫秒'),'拖一拖']],'再改改这个数字')}</div></div>
    <div class="go-row" id="l10-f-gr"><span class="l10-gl">改成 5000，我猜秒针</span>${App.seg('fg',FG.map((t,j)=>[j,t]),'')}${App.go('l10-f-go','改成 5000')}</div>
    <div id="l10-f-fb"></div>
    <div class="after-run">${App.pad('改成 5000 以后，秒针怎么走？','<div id="l10-f-q"></div>')}</div></div></div>
  <details class="more"><summary>说明</summary><p class="note">只改一个数字，其余代码不变。setInterval 是定时器：每隔一段时间（单位是毫秒）自动执行一次后面的程序，1000 毫秒 = 1 秒。读懂了这一行，才知道该改哪里。</p></details>
 </div>

 <div class="station" id="l10-s3">${App.head('EXP-03','挑战二 · 善用提示词','提示词对比台','笼统对具体：猜猜 AI 听哪句话做得更好')}
  <ol class="steps"><li>搭一句具体的话</li><li>比比谁做到得多</li></ol>
  ${App.knobs([['具体要求',`<span id="l10-c-cards" style="display:contents"></span>`,'点亮 2 项以上']])}
  <div class="grid2 l10-vs"><div class="l10-pt"><small>笼统的提示词</small>生成一个网页</div><div class="l10-pt"><small>具体的提示词（上面点亮什么，这里就多一句）</small><span id="l10-c-p"></span></div></div>
  <div class="go-row"><span class="l10-gl">我猜做到更多的是</span>${App.seg('cg',[['v','笼统'],['s','具体'],['e','一样多']],'')}${App.go('l10-c-go','两边一起生成')}</div>
  <div class="grid2 l10-vs"><div id="l10-c-pv"><div class="l10-empty">笼统版网页</div></div><div id="l10-c-ps"><div class="l10-empty">具体版网页</div></div></div>
  ${App.aiBox('l10-c-ai','两个网页做好后，在这里对一对要求','AI 做到了几项')}<div id="l10-c-fb"></div>
  <div class="after-run">${App.pad('哪种提示词生成的网页效果更好？','<div id="l10-c-b"></div>')}</div>
  <details class="more"><summary>说明</summary><p class="note">检查方法：在代码里找日历的星期计算、时钟的定时器、页面背景的颜色值、标题文字等（按代码规则判断，最后还要你自己看一看网页）。</p>
   ${App.know('AI 不会读心术','虽然 AI 具备编程能力，但真正驱动它进行创作的是我们的创意和表达。AI 不会读心术，模糊、宽泛的提示词会让它无法准确理解我们的要求，导致生成的网页不符合我们的预期。因此，和 AI 交流时，我们表达得越清楚，它越容易理解我们的想法。')}</details>
 </div>

 <div class="station" id="l10-s4">${App.head('EXP-04','挑战二 · 逐步完善','我的第一个网页','一句一句加要求，把网页变成你的作品')}
  <ol class="steps"><li>加一条要求</li><li>存成我的作品</li></ol>
  <div class="grid2" data-rb="1"><div class="l10-col"><div class="l10-cap"><b>我说过的话</b>点一句，回看那时候的网页</div><div class="l10-trail" id="l10-i-chain" aria-label="我提过的要求"></div><div id="l10-i-prev"></div></div>
   <div class="l10-col l10-kside">${App.knobs([['点一条',`<span id="l10-i-reqs" style="display:contents"></span>`],['要发的话',`<input type="text" id="l10-i-in" maxlength="60" aria-label="要发给 AI 的要求" style="flex:1;min-width:0">`,'可以改']])}
    <div class="go-row">${App.go('l10-i-go','发给 AI')}</div>
    ${App.aiBox('l10-i-ai','现在只有一句「生成一个网页」，加一条要求吧')}<div id="l10-i-fb"></div>
    <div class="after-run">${App.pad('起个名字，存进作品集',`<div class="row"><input type="text" id="l10-i-title" maxlength="16" placeholder="网页的名字" aria-label="网页的名字" style="flex:1;min-width:120px"><button class="btn sm" type="button" id="l10-i-save">存成作品</button><button class="btn ghost sm" type="button" id="l10-i-reset">从头再来</button></div><span class="note" id="l10-i-state"></span>`,'我的作品')}</div></div></div>
  <details class="more"><summary>说明</summary><p class="note">每发一条要求，平台都会检查：到这一步为止提过的全部要求有没有做到、原来的功能有没有丢。离线示例只认识这几类要求：日历、时钟、生日（可带日期）、纪念日（可带日期）、背景颜色、标题；接入大模型后可以提其他要求。存入作品集的那一版会保留代码。</p><div id="l10-i-diff"></div>
   ${App.think(['制作一个令人满意的网页，是更依赖于 AI 的编程能力，还是更依赖于具体的提示词？','相比于笼统的提示词，为什么具体的提示词能让 AI 生成更符合预期的网页？','想让 AI 生成符合要求的网页，描述要求时需要注意什么？'])}
   ${App.know('分步骤、有重点地描述','想让 AI 生成令我们满意的网页，可以先从简单要求开始，再根据生成结果，逐步提出添加功能或调整细节等更具体的修改要求；同时，要确保每次提出的要求都明确、清晰。这样分步骤、有重点地描述，AI 就能更准确地理解我们的想法，生成的内容也会越来越贴近预期。')}</details>
 </div>

 <div class="station" id="l10-s5">${App.head('TALK','讨论 · 人机协作编程','人与 AI 谁主导？','未来还要学编程吗？亮出你的看法')}
  <ol class="steps"><li>选立场，挑证据</li><li>写一句理由</li></ol>
  <div class="l10-one">${App.knobs([['我站',`<span class="l10-wrap" style="display:contents">${App.seg('st',STS,'')}</span>`],['我的证据',`<span class="l10-wrap" id="l10-t-why" style="display:contents"></span>`,'可多选']],'我的看法')}
   <div class="go-row">${App.go('l10-t-go','亮出观点')}</div><div id="l10-t-fb"></div>
   <div class="after-run">${App.pad('用一句话说说理由','<textarea id="l10-t-wt" maxlength="400" placeholder="我认为……，因为……" aria-label="我的理由"></textarea>')}</div></div>
  <details class="more"><summary>说明</summary><p class="note">没有标准答案。用今天的实验证据来说理由，比只说结论更有说服力。</p>${App.know('真正驾驭技术','AI 为我们打开了编程的大门。在 AI 的帮助下，即使是不懂编程的人，也能够生成自己想要的网页；对于程序员来说，有了 AI 的辅助，工作效率会得到提升。但是，想让网页效果与众不同、功能丰富多样，往往还需要理解代码的逻辑与结构，运用专业知识和创造力进行优化。只有既熟悉技术实现原理，又拥有清晰的思路和明确的目标，还能准确表达要求，我们才能更好地了解 AI 的思路，判断和调整 AI 生成的内容，指导 AI 生成富有创意的作品，从而真正驾驭技术。')}</details>
 </div>

 <div class="station" id="l10-s5b">${App.head('APPLY','讨论 · 人机协作编程','人机分工','做一个网页有 8 件事：每件交给谁？')}
  <ol class="steps"><li>给 8 件事分工</li><li>看我的分工表</li></ol>
  <div class="l10-one"><div id="l10-r-card"></div><div id="l10-r-fb"></div></div>
  <details class="more"><summary>说明</summary><p class="note">分工没有标准答案。每件事点“人”“AI”或“一起”，会看到一句提醒。8 件分完能看到你的分工表，点表里的任何一件事都可以重新分。</p></details>
 </div>

 <div class="station" id="l10-quiz-st">${App.head('QUIZ','检测','小测验','5 道题，第一次作答计入能力图谱')}<div id="l10-quiz"></div></div>
 <div class="station" id="l10-diary"></div>`;
 if(!App.rec)return;wire();};

function wire(){const lr=App.lesson(K);
 ['w','g','x','c','it','talk'].forEach(k=>{if(!lr[k]||typeof lr[k]!=='object'||Array.isArray(lr[k]))lr[k]={};});
 const W=lr.w,G=lr.g,X=lr.x,C=lr.c,IT=lr.it,TK=lr.talk;W.ch=W.ch||{};G.v=Array.isArray(G.v)?G.v:[];G.cc=G.cc||{};G.calc=G.calc||{};G.o=G.o||{};X.ex=Array.isArray(X.ex)?X.ex:[];X.ms=X.ms||{};
 IT.steps=Array.isArray(IT.steps)?IT.steps:[];TK.why=Array.isArray(TK.why)?TK.why:[];TK.roles=TK.roles||{};
 const s0=$('#l10-s0'),s1=$('#l10-s1'),s1b=$('#l10-s1b'),s2=$('#l10-s2'),s2b=$('#l10-s2b'),s3=$('#l10-s3'),s4=$('#l10-s4'),s5=$('#l10-s5'),s5b=$('#l10-s5b');
 const segSet=(root,name,v)=>$$(`[data-seg="${name}"] .chip`,root).forEach(b=>b.classList.toggle('on',b.dataset.v===String(v)));
 const wireOpts=(root,name,fn)=>$$(`[data-${name}]`,root).forEach(b=>b.onclick=()=>fn(+b.dataset[name]));
 const fail=(box,fb,e)=>{if(e&&e.code==='cancelled'){App.aiSay(box,'已停下，可以再按一次大按钮。',{mood:'idle'});return;}App.aiSay(box,esc(App.AI.errText(e)),{mood:'oops'});App.fb(fb,'try','这次没成功','再按一次大按钮试试。');};

 /* ===== WARM-UP 网页背后是代码: three guided levels (one control each, instant result), then a free-play workshop
    with more things to change and three small design challenges ===== */
 const w=S.w;Object.assign(w,W0);let wLast='',wT=0;W.lv=W.lv||0;W.chal=W.chal||0;
 const wKinds=()=>Object.keys(W.ch).filter(k=>k!=='text').length;
 const marks0=()=>{if(wKinds()>=1||W.lv>=1)App.markStep(s0,0);if(W.lv>=3)App.markStep(s0,1);};
 const HL={bg:[0],col:[1],size:[2],scol:[2],shape:[3,4],act:[4,5],script:[5]};
 const WL=()=>{const on=(HL[wLast]||[]);return [`body { background: ${w.bg}; }`,`h1 { color: ${w.col}; }`,`.star { font-size: ${w.size}px; color: ${w.scol}; }`,`<div class="star">${w.shape}</div>`,`<button>${btnText(w)}</button>`,
   w.act==='off'?'（程序被关掉了）':`<script> 按钮被点一下 → ${shapeName(w.shape)}${actName(w.act)} </script>`].map((t,i)=>[t,on.includes(i)]);};
 const WEX=['这一行管整页的背景颜色。','这一行管标题文字的颜色。','这一行管图案的大小和颜色：数字越大，图案越大。','这一行决定网页上放的是什么图案。','这一行在网页上放了一个按钮。它只决定按钮长什么样、写什么字。','这是程序：它告诉浏览器，按钮被点的时候要做什么。'];
 const drawW=()=>{$('#l10-w-code').innerHTML=WL().map(([t,mk],i)=>`<button type="button" class="${mk?'mk':''}" data-wl="${i}"><i>${i+1}</i><code>${esc(t)}</code>${mk?'<em class="l10-here">你改了这里</em>':''}</button>`).join('');
  $$('[data-wl]',s0).forEach(b=>b.onclick=()=>{const i=+b.dataset.wl;$('#l10-w-ex').textContent=(i===5&&w.act==='off')?'这里的程序被你关掉了。它原来告诉浏览器：按钮被点的时候要做什么。':WEX[i];if(!W.cl){W.cl=1;App.touch();}});};
 const wPrev=()=>showPrev($('#l10-w-prev'),wFull(w),{h:260,label:'我的小名片.html'});
 const wStars=()=>Math.min(3,W.lv);
 const LV=[['第 1 关','给名片换一个背景颜色','点一个颜色，左边的网页马上变'],['第 2 关','把星星拖大或拖小','拖动滑杆，看左边的星星怎么变'],['第 3 关','找出是谁让星星转的','先点左边网页里的按钮，星星会转。把程序开关关掉，再点一次']];
 const chalOk=()=>{const c=W_CH[W.chal];if(!c)return false;const t=c[1];return Object.keys(t).every(k=>k==='big'?w.size>=t.big:w[k]===t[k]);};
 const wChange=(k)=>{wLast=k;W.ch[k==='act'&&w.act==='off'?'script':k]=1;W.n=(W.n||0)+1;drawW();clearTimeout(wT);wT=setTimeout(wPrev,k==='size'?160:0);const sn=shapeName(w.shape);
  const M={script:['find','程序关掉了',`再去点左边网页里的按钮，看${sn}还动不动。`],
   act:['ok',`程序换了：点一下，${sn}${actName(w.act)}`,'你改的是第 6 行的程序。去点一点左边的按钮试试。'],
   shape:['ok',`图案换成${sn}了！`,'你改的是第 4 行。按钮上的字（第 5 行）也跟着改了。'],scol:['ok',`${sn}换颜色了！`,'你改的是第 3 行：color 管图案的颜色。'],
   bg:w.bg==='#1d3557'?['find','背景变深了！','你改的是第 1 行。浏览器只照代码做：标题还是原来的颜色，有点看不清了。']:['ok','背景换颜色了！','你改的是第 1 行：background 后面的颜色。'],
   col:['ok','标题换颜色了！','你改的是第 2 行：color 管文字颜色。'],size:['ok',`${sn}变成 ${w.size}px 了！`,'你改的是第 3 行：font-size 后面的数字越大，图案越大。']}[k==='act'&&w.act==='off'?'script':k];
  const cur=W.lv;if((cur===0&&k==='bg')||(cur===1&&k==='size'))W.lv=cur+1;
  App.touch();marks0();
  if(W.lv>=3&&(wV==null||wV===3)&&chalOk()){const t=W_CH[W.chal][0];W.chal++;App.touch();App.fb('#l10-w-fb','ok',`小挑战完成：${W.chal}/${W_CH.length}`,`你做出了「${t}」。${W.chal<W_CH.length?'下一个挑战已经出现在紫色卡片上。':'三个挑战全完成了，接着做一张你自己喜欢的名片吧。'}`,{stars:3,cheer:true});drawLv();return;}
  App.fb('#l10-w-fb',M[0],M[1],M[2]+(W.lv>cur?` ${LV[cur][0]}通过！`:''),{stars:wStars()});
  if(W.lv>cur)drawLv(true);};
 /* the button inside the little page was pressed */
 const onBtn=()=>{if(App.current!==K||s0.classList.contains('pg-off'))return;W.tap=(W.tap||0)+1;const sn=shapeName(w.shape);
  if(w.act!=='off'){App.fb('#l10-w-fb','ok',`${sn}${{spin:'转了一圈',jump:'跳了一下',grow:'变大了一下'}[w.act]}！`,W.lv===2?'是谁让它动的？把右边的程序开关关掉，再点一次按钮。':'是第 6 行的程序在起作用。',{stars:wStars()});W.spun=1;}
  else{App.fb('#l10-w-fb','oops',`${sn}不动了！`,'按钮还在（第 5 行没变），可是第 6 行的程序关掉了，没人告诉它“被点了要做什么”。',{stars:wStars()});$('#l10-w-qbox').hidden=false;drawWq();}App.touch();};
 if(L._wMsg)window.removeEventListener('message',L._wMsg);L._wMsg=e=>{if(e.data&&e.data.__labBtn)onBtn();};window.addEventListener('message',L._wMsg);
 const ctlBg=()=>App.seg('wbg',W_BG,w.bg),ctlCol=()=>App.seg('wcol',W_COL,w.col),ctlSize=()=>App.range('l10-w-size',30,120,6,w.size,'px');
 const ctlProg=()=>App.seg('wprog',[['1','开着'],['0','关掉']],w.act==='off'?'0':'1');
 const wireCtl=()=>{App.segWire(s0,'wbg',v=>{w.bg=v;wChange('bg');});App.segWire(s0,'wcol',v=>{w.col=v;wChange('col');});App.rangeWire('l10-w-size',v=>{w.size=v;wChange('size');});
  App.segWire(s0,'wshape',v=>{w.shape=v;wChange('shape');});App.segWire(s0,'wscol',v=>{w.scol=v;wChange('scol');});
  App.segWire(s0,'wact',v=>{if(v!=='off')w.last=v;w.act=v;wChange('act');});
  App.segWire(s0,'wprog',v=>{if(v==='1'){w.act=w.last||'spin';wLast='';drawW();wPrev();App.fb('#l10-w-fb','ok','程序又打开了','再点按钮，它又会动了。',{stars:wStars()});}else{w.act='off';wChange('act');}});
  const nx=$('#l10-w-next');if(nx)nx.onclick=()=>{wLast='';drawW();drawLv(false);};};
 /* The four stages (3 levels + workshop) are tabs: any stage already reached can be opened again at any time.
    wV = the stage on screen (null = follow progress). passed=true keeps the level just finished on screen with a 下一关 button. */
 let wV=null;const STG=['第 1 关','第 2 关','第 3 关','名片工坊'];
 const tabs=cur=>`<div class="l10-tabs" role="tablist" aria-label="关卡">${STG.map((t,i)=>`<button type="button" role="tab" aria-selected="${i===cur}" class="${i===cur?'on':''}" data-wv="${i}" ${i>W.lv?'disabled title="先通过前面的关卡"':''}>${i<W.lv&&i<3?'<b>✓</b>':''}${t}</button>`).join('')}</div>`;
 const drawLv=(passed)=>{const box=$('#l10-w-lv');if(passed)wV=W.lv-1;const v=Math.max(0,Math.min(wV==null?W.lv:wV,W.lv,3));const sn=shapeName(w.shape);
  if(v===3){const c=W_CH[W.chal];
   box.innerHTML=tabs(v)+`<div class="l10-lv"><div class="l10-lvh"><span>${c?`小挑战 ${W.chal+1} / ${W_CH.length}`:'自由创作'}</span>${W_CH.map((_,i)=>`<i class="${i<W.chal?'on':''}"></i>`).join('')}</div><div class="l10-lvt">${c?'照着做一张：'+c[0]:'做一张你自己喜欢的名片'}</div><p class="note">${c?'下面的每一项都可以改。做对了会自动通过，不想做也可以随便玩。':'每改一处，看看代码的哪一行跟着变了。'}</p></div>`+
    App.knobs([['背景',ctlBg()],['标题颜色',ctlCol()],['图案',App.seg('wshape',W_SHAPE,w.shape)],['图案颜色',App.seg('wscol',W_SCOL,w.scol)],['图案大小',ctlSize()],['点按钮时',App.seg('wact',W_ACT,w.act)]],'名片工坊：样子和程序都能改');}
  else{const T=[['给名片换一个背景颜色','点一个颜色，左边的网页马上变'],[`把${sn}拖大或拖小`,`拖动滑杆，看左边的${sn}怎么变`],[`找出是谁让${sn}动的`,`先点左边网页里的按钮，${sn}会动。把程序开关关掉，再点一次`]][v];
   const ctl=[['背景',ctlBg()],[`${sn}大小`,ctlSize()],['程序开关',ctlProg()]][v];const done=v<W.lv;
   box.innerHTML=tabs(v)+`<div class="l10-lv"><div class="l10-lvh"><span>${STG[v]} / 共 3 关${done?' · 已通过，可以再玩':''}</span><i class="${W.lv>0?'on':''}"></i><i class="${W.lv>1?'on':''}"></i><i class="${W.lv>2?'on':''}"></i></div><div class="l10-lvt">${T[0]}</div><p class="note">${T[1]}</p></div>${App.knobs([ctl],'改这里')}`+
    `<div class="go-row">${v>0?'<button class="btn ghost sm" type="button" id="l10-w-back">上一关</button>':''}${done?App.go('l10-w-next',v===2?'去名片工坊':'下一关'):''}</div>`;}
  wireCtl();const go=n=>{wV=n;wLast='';drawW();drawLv();};
  $$('[data-wv]',box).forEach(b=>b.onclick=()=>go(+b.dataset.wv));const nx=$('#l10-w-next');if(nx)nx.onclick=()=>go(v+1);const bk=$('#l10-w-back');if(bk)bk.onclick=()=>go(v-1);};
 const drawWq=()=>{$('#l10-w-q').innerHTML=optsHTML('wq',WQ,W.q?W.q.last:null);wireOpts(s0,'wq',j=>{if(!W.q)W.q={first:j};W.q.last=j;App.touch();drawWq();
  if(j===1){const first=W.lv<3;W.lv=3;App.touch();marks0();App.fb('#l10-w-fb','ok',first?'答对了，3 关全部通过！':'答对了！','网页的样子靠 HTML 和 CSS，会不会动、有没有反应靠程序。接下来去名片工坊，改更多的地方。',{stars:3,cheer:first});if(first){if(w.act==='off')w.act=w.last||'spin';drawW();wPrev();drawLv(true);}}
  else App.fb('#l10-w-fb','try','再想想','关掉程序以后，按钮的样子变了吗？变的是什么？',{stars:wStars()});});};
 if(wKinds()>=3&&W.lv<3&&W.q&&W.q.last===1)W.lv=3;   /* records made before the levels existed */
 drawW();wPrev();drawLv();marks0();if(W.q){$('#l10-w-qbox').hidden=false;drawWq();}

 /* ===== EXP-01 网页生成器（日历时钟） ===== */
 let gk='cc',gl=null;
 const htmlOfG=i=>{const e=G.v[i];if(!e)return '';if(S.g[i]&&S.g[i].html)return S.g[i].html;return e.m==='offline'?offlineFor(e.p):'';};
 const lastOf=k=>{for(let i=G.v.length-1;i>=0;i--)if(G.v[i].k===k)return i;return -1;};
 const pushG=(k,p,r)=>{G.v.push({k,p,m:r.mode,ms:r.ms,l:nL(r.html)});S.g[G.v.length-1]={html:r.html};if(G.v.length>10){const d=G.v.length-10;G.v.splice(0,d);S.g.splice(0,d);}bump();};
 const promptOf=()=>GK.find(g=>g[0]===gk)[2];
 const gWait=()=>{if(!s1.classList.contains('ran')&&!S.busy1)$('#l10-g-ai .ai-body').textContent=`提示词：「${promptOf()}」`;};
 const ccDone=()=>CCK.every(k=>G.cc[k]!=null);
 const gStars=()=>lastOf('cc')<0?0:1+(G.glok?1:0)+(ccDone()?1:0);
 const marks1=()=>{if(lastOf('cc')>=0)App.markStep(s1,0);if(ccDone())App.markStep(s1,1);};
 const statLine=h=>{const st=App.Code.stats(h);const html=Math.max(0,st.lines-st.styleLines-st.scriptLines);return `<p class="note">搭结构 HTML ${html} 行 · 管样式 CSS ${st.styleLines} 行 · 写程序 JS ${st.scriptLines} 行</p>`;};
 const showG=i=>{const e=G.v[i];if(!e)return;const html=htmlOfG(i);
  if(html)showPrev($('#l10-g-prev'),html,{h:330,label:'AI 写的网页.html'});else $('#l10-g-prev').innerHTML='<div class="l10-empty">这一版的代码没有存档，再按一次大按钮</div>';
  App.aiSay('#l10-g-ai',`<div class="big">${e.l} 行代码 · ${secs(e.ms)} 秒</div>${html?statLine(html):''}<p class="note">提示词：「${esc(cut(e.p,40))}」</p>`,{mood:'happy',src:e.m});startClock();};
 const drawGq=()=>{const cur=ccDone()?(CCK.every(k=>G.cc[k]===1)?0:1):null;const lp=(G.v[lastOf('cc')]||{}).p||'';const what=/日历/.test(lp)&&/时钟/.test(lp)?'日期和时间':/时钟/.test(lp)?'时间':'年月和标出来的“今天”';
  $('#l10-g-q').innerHTML=`<div class="ask">网页上的${what}，和网页下面的「平台时间」一样吗？</div>`+optsHTML('gq',['都一样，很准','有不一样的地方'],cur);
  wireOpts(s1,'gq',j=>{CCK.forEach(k=>{G.cc[k]=j===0?1:0;});G.o.fn=j;App.touch();drawGq();marks1();
   if(j===0)App.fb('#l10-g-fb','ok','检查过了，时间很准！','AI 写的代码会去问电脑“现在几点”，所以是准的。下一站去测测它写的计算器。',{stars:gStars()});
   else App.fb('#l10-g-fb','find','你发现不一样的地方了！','差一两秒不要紧。要是日期、星期或几点几分不对，就是 AI 写的代码有问题。所以每次都要亲手检查。',{stars:gStars()});});};
 App.segWire(s1,'gk',v=>{gk=v;gWait();});App.segWire(s1,'gl',v=>{gl=v;});
 $('#l10-g-go').onclick=async()=>{if(S.busy1)return;S.busy1=true;const b=$('#l10-g-go');App.busy(b,true,'AI 正在写…');const ctl=newCtl();const p=promptOf();
  try{const r=await gen(p,{offline:()=>offlineFor(p),ui:runUI('#l10-g-ai'),signal:ctl.signal});pushG('cc',p,r);const n=nL(r.html);const hit=gl?glOf(n)===gl:null;if(hit)G.glok=1;
   App.touch();showG(G.v.length-1);drawGq();marks1();refreshX();
   if(hit)App.fb('#l10-g-fb','ok',`猜对了！AI 写了 ${n} 行`,`只用了 ${secs(r.ms)} 秒。和平台时间对一对，看它写得准不准。`,{stars:gStars()});
   else App.fb('#l10-g-fb','find',`${secs(r.ms)} 秒，AI 写了 ${n} 行代码！`,(hit===false?'比你猜的'+(({s:0,m:1,l:2})[glOf(n)]>({s:0,m:1,l:2})[gl]?'多':'少')+'。':'')+'和平台时间对一对，看它写得准不准。',{stars:gStars()});}
  catch(e){fail('#l10-g-ai','#l10-g-fb',e);}
  finally{S.busy1=false;ctls.delete(ctl);App.busy(b,false);b.classList.add('again');}};
 drawGq();gWait();if(lastOf('cc')>=0){showG(lastOf('cc'));App.ran(s1);}marks1();

 /* ===== EXP-01b 计算器抓虫 ===== */
 const typedN=()=>CALCT.filter(([id])=>(G.calc[id]||'').trim()).length;
 const bugN=()=>CALCT.filter(([id])=>calcOk(id,G.calc[id])===false).length;
 const kStars=()=>lastOf('calc')<0?0:(bugN()||typedN()>=3)?3:typedN()>=2?2:1;
 const marks1b=()=>{if(lastOf('calc')>=0)App.markStep(s1b,0);if(bugN()||typedN()>=3)App.markStep(s1b,1);};
 let ki=CALCT.findIndex(([id])=>!(G.calc[id]||'').trim());if(ki<0)ki=G.o.calc==null?3:0;let kt=0;
 const drawK=()=>{const box=$('#l10-k-q');const last=ki>=3;const nav=`<div class="row"><button type="button" class="btn ghost sm" data-kprev ${ki?'':'hidden'}>上一题</button><span class="note">第 ${ki+1} / 4 题</span></div>`;
  if(last){box.innerHTML=`<div class="ask">测完了：这个计算器能放心用吗？</div>${optsHTML('ko',OCALC,G.o.calc)}${nav}`;
   wireOpts(box,'ko',j=>{G.o.calc=j;App.touch();drawK();if(bugN()&&j===0)App.fb('#l10-k-fb','try','再想想',`你刚才抓到了 ${bugN()} 个 bug，它真的“能正常使用”吗？`,{stars:kStars()});else App.fb('#l10-k-fb','ok','测试员下结论了！','AI 写完不会自己发现所有问题，测试和把关要靠人。',{stars:kStars()});});}
  else{const [id,q]=CALCT[ki];const cur=CALCO[id].findIndex(o=>o[1]===G.calc[id]);
   box.innerHTML=`<div class="ask">在计算器上按 <b class="mono">${q} =</b>，屏幕显示的是？</div>${optsHTML('kc',CALCO[id].map(o=>o[0]),cur<0?null:cur)}${nav}`;
   wireOpts(box,'kc',j=>{const first=!bugN();G.calc[id]=CALCO[id][j][1];App.touch();marks1b();const ok=calcOk(id,G.calc[id]);const t=CALCT[ki];
    if(ok)App.fb('#l10-k-fb','ok','这一题它算对了','继续测下一题，看能不能抓到 bug。',{stars:kStars()});
    else App.fb('#l10-k-fb','oops','你抓到 AI 的 bug 了！',`${t[1]} 正确${id==='t3'?'做法是':'答案是'}${t[2]}。${(CALCWHY[id]||{})[G.calc[id]]||t[3]}`,{stars:kStars(),cheer:first});
    drawK();clearTimeout(kt);const at=ki;kt=setTimeout(()=>{if(ki===at){ki=Math.min(3,ki+1);drawK();}},1400);});}
  const pv=$('[data-kprev]',box);if(pv)pv.onclick=()=>{clearTimeout(kt);ki=Math.max(0,ki-1);drawK();};};
 const showK=i=>{const e=G.v[i];if(!e)return;const html=htmlOfG(i);if(html)showPrev($('#l10-k-prev'),html,{h:390,label:'AI 写的计算器.html'});else $('#l10-k-prev').innerHTML='<div class="l10-empty">这一版的代码没有存档，再按一次大按钮</div>';
  App.aiSay('#l10-k-ai',`<div class="big">${e.l} 行代码 · ${secs(e.ms)} 秒</div><p class="note">提示词：「${esc(cut(e.p,40))}」</p>`,{mood:'happy',src:e.m});};
 $('#l10-k-go').onclick=async()=>{if(S.busy1b)return;S.busy1b=true;const b=$('#l10-k-go');App.busy(b,true,'AI 正在写…');const ctl=newCtl();const p='生成一个计算器网页';
  try{const r=await gen(p,{offline:()=>CALC,ui:runUI('#l10-k-ai'),signal:ctl.signal});pushG('calc',p,r);App.touch();showK(G.v.length-1);marks1b();
   App.fb('#l10-k-fb','find','计算器做好了，快去抓 bug！','在计算器上按出第 1 题，把屏幕上的结果记到「测试记录」里。',{stars:kStars()});}
  catch(e){fail('#l10-k-ai','#l10-k-fb',e);}
  finally{S.busy1b=false;ctls.delete(ctl);App.busy(b,false);b.classList.add('again');}};
 drawK();if(lastOf('calc')>=0){showK(lastOf('calc'));App.ran(s1b);}marks1b();

 /* ===== EXP-02 代码探秘 ===== */
 let xc={h:'',m:'offline'},xls=[];
 const ccCode=()=>{const i=lastOf('cc');if(i>=0){const h=htmlOfG(i);if(h&&pickLines(h).length>=4)return {h,m:G.v[i].m};}return {h:build({cal:1,clock:1}),m:'offline'};};
 const msN=()=>MIS.filter(m=>X.ms[m.id]).length;
 const marks2=()=>{if(X.ex.length)App.markStep(s2,0);if(msN()>=3)App.markStep(s2,1);};
 X.seen=X.seen||{};
 const hlX=sel=>{const f=$('#l10-x-prev iframe');try{if(f&&f.contentWindow)f.contentWindow.postMessage({__labHL:sel||'none'},'*');}catch(e){}};
 const kindOf=l=>{const j=PICK.findIndex(re=>re.test(l.s));return j<0?'x':'k'+j;};
 const drawX=()=>{$('#l10-x-code').innerHTML=xls.map((l,j)=>{const hit=MIS.some(m=>X.ms[m.id]&&m.re.test(l.s));const tr=X.seen[kindOf(l)]?xlate(l.s):null;
   return `<button type="button" class="${j===S.xl&&S.xsel?'on':''} ${hit?'hit':''}" data-xl="${j}"><i>${l.i+1}</i><span class="l10-xr"><code>${esc(cut(bare(l.s),46))}</code>${tr?`<em>${esc(tr.say)}</em>`:''}</span></button>`;}).join('');
  $$('[data-xl]',s2).forEach(b=>b.onclick=()=>pickX(+b.dataset.xl));};
 const drawMis=()=>{const cur=MIS.find(x=>x.id===S.xm)||MIS[0];const n=msN();
  $('#l10-x-mis').innerHTML=`<div class="l10-tabs" role="tablist" aria-label="要找的零件">${MIS.map(m=>`<button type="button" role="tab" class="${m.id===cur.id?'on':''}" data-mis="${m.id}">${X.ms[m.id]?'<b>✓</b>':''}${m.t}</button>`).join('')}</div>
   <div class="l10-lv"><div class="l10-lvh"><span>${n>=3?'3 个零件都找到了':`找零件 ${n} / 3`}</span>${MIS.map(m=>`<i class="${X.ms[m.id]?'on':''}"></i>`).join('')}</div><div class="l10-lvt">${cur.q}</div><p class="note">不用懂代码，猜一猜：点左边你觉得是的那一行，翻译机会告诉你它在说什么。</p></div>`;
  $$('[data-mis]',s2).forEach(b=>b.onclick=()=>{S.xm=b.dataset.mis;drawMis();});};
 /* click a line: translate it, light up what it controls on the page, and check it against the current mission */
 const pickX=j=>{const l=xls[j];if(!l)return;S.xl=j;S.xsel=1;const tr=xlate(l.s);const m=MIS.find(x=>x.id===S.xm)||MIS[0];const hit=m.re.test(l.s);const show=bare(l.s);
  if(!tr){drawX();const all=xc.h.split('\n');explain(l.s,all.slice(Math.max(0,l.i-8),l.i+8).join('\n'));return;}
  X.seen[kindOf(l)]=1;hlX(tr.hl);
  App.aiSay('#l10-x-ai',`<code class="l10-codeline">${esc(cut(show,80))}</code><div class="l10-say">这一行在说：${esc(tr.say)}${tr.sw?`<i class="l10-sw" style="background:${esc(tr.sw)}"></i>`:''}</div>
   <div class="l10-parts"><b>拆开看</b>${tr.parts.map(([c,t])=>`<span><code>${esc(c)}</code>${esc(t)}</span>`).join('')}</div><p class="note">它管的是：${esc(tr.where)}。看左边网页上的黄框。</p>`,{mood:hit?'happy':'think'});
  const key=clip(l.s.trim(),120);if(key&&!X.ex.some(e=>e.l===key)){X.ex.push({l:key,t:clip(tr.say,200),m:'offline'});if(X.ex.length>12)X.ex.shift();bump();}
  if(hit){const first=!X.ms[m.id];X.ms[m.id]=1;const n=msN();const nx=MIS.find(x=>!X.ms[x.id]);
   if(n>=3)App.fb('#l10-x-fb','ok','3 个零件全找到了！','代码其实就是一句一句写给电脑的话。读懂了这几句，你就知道让 AI 改哪里。',{stars:3,cheer:first});
   else App.fb('#l10-x-fb','ok','找到了，就是这一行！',`「${m.t}」靠的就是它。已找到 ${n}/3 个${nx?`，接着找：${nx.q}`:''}`,{stars:n,cheer:first});
   if(nx)S.xm=nx.id;}
  else App.fb('#l10-x-fb','try','这一行管的是别的事',`它管的是${tr.where}。再猜一猜：${m.q}`,{stars:msN()});
  App.touch();drawX();drawMis();marks2();};
 function refreshX(){xc=ccCode();xls=pickLines(xc.h);if(S.xl>=xls.length)S.xl=0;S.xsel=0;showPrev($('#l10-x-prev'),xc.h+HLJS,{h:300,label:'日历时钟.html'});drawX();const full=$('#l10-x-full');if(full)full.innerHTML='';if($('#l10-x-more').open)drawFull();}
 const drawFull=()=>{const el=$('#l10-x-full');if(el.firstChild)return;App.Code.view(el,xc.h,{maxHeight:300,onLine:(i,line,all)=>explain(line,all.slice(Math.max(0,i-8),i+8).join('\n'))});};
 $('#l10-x-more').addEventListener('toggle',e=>{if(e.target.open)drawFull();});
 /* any other line (from the full listing under 说明): one-sentence explanation by the AI, or by the built-in dictionary when offline */
 async function explain(line,context){if(S.busy2)return;S.busy2=true;const ctl=newCtl();const show=bare(line)||'（空行）';
  App.aiSay('#l10-x-ai',`<code class="l10-codeline">${esc(cut(show,80))}</code>正在读这一行……`,{busy:true});
  try{const r=await App.Code.explain(line,{context,signal:ctl.signal});
   App.aiSay('#l10-x-ai',`<code class="l10-codeline">${esc(cut(show,80))}</code><div class="l10-say">${esc(r.text)}</div>`,{mood:'think',src:r.mode});
   const key=clip(line.trim(),120);if(key&&!X.ex.some(e=>e.l===key)){X.ex.push({l:key,t:clip(r.text,200),m:r.mode});if(X.ex.length>12)X.ex.shift();bump();}
   App.touch();marks2();}
  catch(e){fail('#l10-x-ai','#l10-x-fb',e);}
  finally{S.busy2=false;ctls.delete(ctl);}}
 {const nx=MIS.find(x=>!X.ms[x.id]);S.xm=nx?nx.id:'tick';}
 refreshX();drawMis();marks2();if(X.ex.length)App.ran(s2);

 /* ===== EXP-02b 改一个数字 ===== */
 let fg=null;const fBase=FAST();const fLine=(bare(fBase.split('\n').find(l=>/setInterval/.test(l))||'setInterval(drawClock, 1000);'));
 const fPage=n=>fBase.replace(/(setInterval\([^)]*\b)1000(\s*\))/,(m,x,y)=>x+n+y);
 const fStrip=n=>{$('#l10-f-code').innerHTML=esc(fLine).replace('1000',`<b>${n}</b>`);$('#l10-f-say').innerHTML=`大白话：每隔 <b>${n}</b> 毫秒（也就是 ${n/1000} 秒），把时钟重新画一遍。`;};
 const fStars=()=>X.fc?3:!X.fast?(X.fr?1:0):X.fast.last!==1?1:X.fast.first===1?3:2;
 const marks2b=()=>{if(X.fr)App.markStep(s2b,0);if(X.fast)App.markStep(s2b,1);};
 /* after the observation: a slider for the same number (live), with one small challenge */
 const drawFch=()=>{const on=!!(X.fast&&X.fast.last===1);$('#l10-f-more').hidden=!on;$('#l10-f-gr').hidden=on;
  $('#l10-f-ch').innerHTML=`<div class="l10-lv"><div class="l10-lvh"><span>${X.fc?'小挑战完成':'小挑战'}</span><i class="${X.fc?'on':''}"></i></div><div class="l10-lvt">${X.fc?'把滑杆拖到最左边，秒针会走得更快吗？':'让秒针每 2 秒跳一下'}</div><p class="note">${X.fc?'先猜一猜，再拖过去数一数。':'拖下面的滑杆，把数字改成你觉得对的那个。'}</p></div>`;};
 const drawFq=()=>{$('#l10-f-q').innerHTML=optsHTML('fq',FQ,X.fast?X.fast.last:null);wireOpts(s2b,'fq',j=>{if(!X.fast)X.fast={first:X.fg!=null?X.fg:j};X.fast.last=j;App.touch();drawFq();drawFch();marks2b();
  if(j===1)App.fb('#l10-f-fb','ok',X.fast.first===1?'观察准确，你一开始就猜对了！':'观察准确！5 秒才跳一下','5000 毫秒 = 5 秒。5 秒才重画一次，所以秒针一次跳 5 格；时间还是准的。上面出现了一个小挑战。',{stars:fStars()});
  else App.fb('#l10-f-fb','try','再数 10 秒','盯住红色的秒针：它多久动一次？一次跳几格？',{stars:fStars()});});};
 App.segWire(s2b,'fg',v=>{fg=+v;});
 $('#l10-f-go').onclick=()=>{showPrev($('#l10-f-prev'),fPage(5000),{h:290,label:'改过一个数字的时钟.html'});fStrip(5000);const ms=$('#l10-f-ms');if(ms){ms.value=5000;$('#l10-f-ms-o').textContent='5000 毫秒';}
  if(fg!=null&&X.fg==null)X.fg=fg;X.fr=1;bump();App.touch();marks2b();$('#l10-f-go').classList.add('again');
  App.fb('#l10-f-fb','find','改好了！盯住秒针数 10 秒',(fg!=null?`你猜的是「${FG[fg]}」。`:'')+'看清楚了，就在下面记下来。',{stars:fStars()});};
 let fT=0;App.rangeWire('l10-f-ms',v=>{fStrip(v);clearTimeout(fT);fT=setTimeout(()=>{showPrev($('#l10-f-prev'),fPage(v),{h:290,label:`间隔 ${v} 毫秒的时钟.html`});X.fn=(X.fn||0)+1;
   if(v===2000&&!X.fc){X.fc=1;App.touch();drawFch();App.fb('#l10-f-fb','ok','挑战完成！2000 毫秒 = 2 秒','每 2 秒重画一次，秒针一次跳 2 格。你已经会读、会改这一行代码了。',{stars:3,cheer:true});return;}
   App.touch();
   if(v<1000)App.fb('#l10-f-fb','find',`改成 ${v}，秒针没有变快`,'画得更勤了，可秒针是照着真正的时间画的，差不多还是一秒走一格。代码管的是“多久画一次”，不是“时间走多快”。',{stars:fStars()});
   else if(v===1000)App.fb('#l10-f-fb','find','回到 1000 了','1000 毫秒 = 1 秒：每秒重画一次，秒针一秒走一格。',{stars:fStars()});
   else App.fb('#l10-f-fb','find',`每 ${v/1000} 秒才重画一次`,`秒针要等 ${v/1000} 秒才动一下，一跳一跳的。数字越大，等得越久。`,{stars:fStars()});},260);});
 if(X.fr){showPrev($('#l10-f-prev'),fPage(5000),{h:290,label:'改过一个数字的时钟.html'});fStrip(5000);}else{showPrev($('#l10-f-prev'),fBase,{h:290,label:'AI 写的时钟.html'});fStrip(1000);}
 drawFq();drawFch();marks2b();if(X.fr)App.ran(s2b);

 /* ===== EXP-03 提示词对比台 ===== */
 C.cards=Array.isArray(C.cards)?C.cards:['cal','clock','bg'];let cg=null;
 const specP=cards=>{const has=k=>cards.includes(k);const th=[has('cal')&&'日历',has('clock')&&'时钟'].filter(Boolean);
  const ex=[has('bday')&&'有生日倒计时',has('anniv')&&'有纪念日提醒',has('title')&&'标题是“我的时间小助手”',has('bg')&&'背景为蓝色'].filter(Boolean);
  return '生成一个'+(th.length?'显示'+th.join('和')+'的':'')+'网页'+(ex.length?'，'+ex.join('，'):'');};
 const marks3=()=>{if(C.n||C.tw)App.markStep(s3,0);if(C.n)App.markStep(s3,1);};
 const drawCards=()=>{$('#l10-c-cards').innerHTML=CARDS.map(([k,n])=>`<button type="button" class="chip ${C.cards.includes(k)?'on':''}" data-cc2="${k}" aria-pressed="${C.cards.includes(k)}">${n}</button>`).join('');$('#l10-c-p').textContent=specP(C.cards);
  $$('[data-cc2]',s3).forEach(b=>b.onclick=()=>{const k=b.dataset.cc2;const i=C.cards.indexOf(k);if(i<0)C.cards.push(k);else C.cards.splice(i,1);C.tw=1;App.touch();drawCards();marks3();});};
 const cmpHTML=()=>{const keys=C.keys||[];const hv=S.c.v,hs=S.c.s;const yn=ok=>`<td class="${ok?'ok':'no'}">${ok?'✓ 有':'✗ 没有'}</td>`;
  return `<div class="big">笼统 ${C.hv}/${C.req} · 具体 ${C.hs}/${C.req}</div><table class="l10-tbl"><thead><tr><th>要求</th><th>笼统</th><th>具体</th></tr></thead><tbody>${keys.map((k,i)=>`<tr><td>${esc(kName(k))}</td>${yn(hv?chk(k,hv):(C.rv||[])[i])}${yn(hs?chk(k,hs):(C.rs||[])[i])}</tr>`).join('')}<tr><td>代码行数</td><td>${C.lv}</td><td>${C.ls}</td></tr></tbody></table>`;};
 const drawCmp=()=>{if(!C.n)return;const none='<div class="l10-empty">代码没有存档，再生成一次就能看</div>';
  if(S.c.v)showPrev($('#l10-c-pv'),S.c.v,{h:330,label:'笼统版.html'});else $('#l10-c-pv').innerHTML=none;if(S.c.s)showPrev($('#l10-c-ps'),S.c.s,{h:330,label:'具体版.html'});else $('#l10-c-ps').innerHTML=none;
  App.aiSay('#l10-c-ai',cmpHTML(),{mood:C.hs>C.hv?'happy':'think',src:C.ms});};
 const drawCb=()=>{$('#l10-c-b').innerHTML=optsHTML('cb',CB,C.b);wireOpts(s3,'cb',j=>{C.b=j;App.touch();drawCb();const st=C.gok?3:2;const cnt=`这一次，具体版做到 ${C.hs}/${C.req} 项，笼统版做到 ${C.hv}/${C.req} 项。`;
  if(j===0)App.fb('#l10-c-fb','ok','发现记下了！',cnt+(C.hs>C.hv?'AI 不会读心术：我们说得越清楚，它越容易做对。':'和同桌说说：你是从哪里看出具体版更好的？'),{stars:st});
  else App.fb('#l10-c-fb','find',j===1?'你更喜欢笼统版':'你觉得两边差不多',cnt+'好不好由你说了算。和同桌说说你的理由：哪个网页更像你想要的？',{stars:st});});};
 App.segWire(s3,'cg',v=>{cg=v;});
 $('#l10-c-go').onclick=async()=>{if(S.busy3)return;const p=specP(C.cards);const keys=parse(p).keys.filter(k=>k!=='calc');
  if(keys.length<2){App.fb('#l10-c-fb','try','具体的话还不够具体','在「具体要求」里至少点亮 2 项，再生成。');return;}
  S.busy3=true;const b=$('#l10-c-go');App.busy(b,true,'两边都在写…');const ctl=newCtl();const wait='<div class="l10-empty">AI 正在写……</div>';$('#l10-c-pv').innerHTML=wait;$('#l10-c-ps').innerHTML=wait;
  try{const [rv,rs]=await Promise.all([gen('生成一个网页',{offline:()=>build({vague:1}),ui:NOUI,signal:ctl.signal}),gen(p,{offline:()=>offlineFor(p),ui:runUI('#l10-c-ai','两个 AI 同时在写，具体版'),signal:ctl.signal})]);
   S.c={v:rv.html,s:rs.html};const a=keys.map(k=>chk(k,rv.html)),bb=keys.map(k=>chk(k,rs.html));
   Object.assign(C,{p,keys,req:keys.length,hv:a.filter(Boolean).length,hs:bb.filter(Boolean).length,rv:a,rs:bb,lv:nL(rv.html),ls:nL(rs.html),mv:rv.mode,ms:rs.mode,n:(C.n||0)+1});
   const win=C.hs>C.hv?'s':C.hs<C.hv?'v':'e';const hit=cg?cg===win:null;if(hit)C.gok=1;bump();bump();App.touch();drawCmp();marks3();const st=C.gok?3:2;
   const tip='没说出口的要求，AI 只能猜。再点亮一项要求，看具体版能不能也做到。';
   if(win==='s')App.fb('#l10-c-fb',hit?'ok':'find',hit?'猜对了！具体的提示词赢了':`具体 ${C.hs}/${C.req}，笼统 ${C.hv}/${C.req}`,(hit===false?'和你猜的不一样。':'')+tip,{stars:st});
   else App.fb('#l10-c-fb','find',win==='e'?'这次两边做到的一样多':'这次笼统版做到的更多',(hit?'你猜对了。':'')+'AI 每次写的都不一样。看看两个网页，哪一个更像你想要的？',{stars:st});}
  catch(e){$('#l10-c-pv').innerHTML='<div class="l10-empty">笼统版网页</div>';$('#l10-c-ps').innerHTML='<div class="l10-empty">具体版网页</div>';fail('#l10-c-ai','#l10-c-fb',e);}
  finally{S.busy3=false;ctls.delete(ctl);App.busy(b,false);b.classList.add('again');}};
 drawCards();drawCb();if(C.n){drawCmp();App.ran(s3);}marks3();

 /* ===== EXP-04 我的第一个网页（逐步完善） ===== */
 const ps=i=>IT.steps.slice(0,i+1).map(s=>s.p);const iin=$('#l10-i-in');const VAGUE=()=>build({vague:1});
 const rebuildI=()=>{S.iv=IT.steps.map((s,i)=>S.iv[i]&&S.iv[i].html?S.iv[i]:{html:s.m==='offline'?offlineChain(ps(i)):((lr.my||{}).v===i&&lr.my.html?lr.my.html:'')});};
 const used=t=>IT.steps.some(s=>s.p===t);
 const pickReq=t=>{iin.value=t;drawReqs();};
 const drawReqs=()=>{$('#l10-i-reqs').innerHTML=REQS.map(([n,t],j)=>`<button type="button" class="chip ${iin.value===t?'on':''}" data-ia="${j}">${n}</button>`).join('');$$('[data-ia]',s4).forEach(b=>b.onclick=()=>pickReq(REQS[+b.dataset.ia][1]));};
 const nextReq=()=>{const r=REQS.find(([,t])=>!used(t));pickReq(r?r[1]:'');};
 const adds=()=>Math.max(0,IT.steps.length-1);
 const iStars=()=>!adds()?0:((lr.my||{}).saved&&adds()>=3&&IT.steps.some(s=>s.cus))?3:adds()>=3?2:1;
 const marks4=()=>{if(adds()>=1)App.markStep(s4,0);if((lr.my||{}).saved)App.markStep(s4,1);};
 let iView=-1;
 const drawChain=()=>{const a=IT.steps.length?IT.steps.map(s=>s.p):['生成一个网页'];const cur=IT.steps.length?Math.max(0,iView):0;$('#l10-i-chain').innerHTML=a.map((p,i)=>`<button type="button" class="${i===cur?'on':''}" data-step="${i}" title="${esc(p)}">${i+1}. ${esc(cut(p,14))}</button>`).join('');
  $$('[data-step]',s4).forEach(b=>b.onclick=()=>{if(S.busy4||!IT.steps.length)return;const i=+b.dataset.step;showI(i);
   if(i===0)App.aiSay('#l10-i-ai','这是最开始的网页：那时只说了一句「生成一个网页」。',{mood:'idle'});
   if(i<IT.steps.length-1)App.fb('#l10-i-fb','find',`回看第 ${i+1} 步的网页`,'和最新的一版比一比：多说了几句话，网页多了什么？点最后一句回到最新版。',{stars:iStars()});});};
 const stepHTML=i=>{const s=IT.steps[i];const html=(S.iv[i]||{}).html;const keys=cumKeys(ps(i));
  const chips=keys.length&&html?`<div class="l10-chk">${keys.map(k=>{const ok=chk(k,html);const lost=(s.lost||[]).includes(kName(k));return `<span class="${ok?'ok':lost?'lost':'no'}">${ok?'✓':'✗'} ${esc(kName(k))}${lost?'（丢了）':''}</span>`;}).join('')}</div>`:'';
  return `<div class="big">做到 ${s.hit}/${s.req} 项要求</div>${chips}<p class="note">这一步新增 ${s.a} 行代码，删除 ${s.d} 行；现在共 ${s.l} 行。</p>`;};
 const showI=i=>{iView=i;const s=IT.steps[i];const html=s?(S.iv[i]||{}).html:VAGUE();
  if(html)showPrev($('#l10-i-prev'),html,{h:330,label:s?`第 ${i+1} 步 · ${cut(s.p,18)}`:'第 1 步 · 生成一个网页'});else $('#l10-i-prev').innerHTML='<div class="l10-empty">这一步的代码没有存档，接着加要求就能看到新网页</div>';
  drawChain();const df=$('#l10-i-diff');const prev=i>0&&(S.iv[i-1]||{}).html;df.innerHTML=s&&html&&prev?`<div class="box-t">这一步改了哪些代码</div>${App.Code.diffHTML(App.Code.diff(prev,html))}`:'';
  if(s&&i>0){App.aiSay('#l10-i-ai',stepHTML(i),{mood:s.lost&&s.lost.length?'oops':'happy',src:s.m});if(!$('#l10-i-title').value)$('#l10-i-title').value=((/<title>([^<]{1,16})<\/title>/i.exec(html||'')||[])[1]||'').trim().replace(/^欢迎来到我的网页$/,'')||'我的第一个网页';}};
 $('#l10-i-go').onclick=async()=>{if(S.busy4)return;const p=clip(iin.value,60);
  if(A(p).length<2){App.fb('#l10-i-fb','try','还没有要求','在「点一条」里选一条，再发给 AI。');return;}
  if(!App.AI.real()&&!parse(p).keys.length){App.fb('#l10-i-fb','try','离线示例没听懂这句话','它只认识：日历、时钟、生日、纪念日、背景颜色、标题。换个说法试试。');return;}
  S.busy4=true;const b=$('#l10-i-go');App.busy(b,true,'AI 正在改…');const ctl=newCtl();
  const fresh=!IT.steps.length;const base0=fresh?VAGUE():((S.iv[IT.steps.length-1]||{}).html||offlineChain(ps(IT.steps.length-1)));const chain=(fresh?['生成一个网页']:ps(IT.steps.length-1)).concat(p);
  try{const r=await gen(p,{base:base0,offline:()=>offlineChain(chain),ui:runUI('#l10-i-ai','AI 正在改代码'),signal:ctl.signal});
   if(fresh){IT.steps=[{p:'生成一个网页',m:'offline',ms:0,l:nL(base0),a:0,d:0,hit:0,req:0,lost:[],cus:0}];S.iv=[{html:base0}];IT.runs=(IT.runs||0)+1;}
   const keys=cumKeys(chain);const hit=keys.filter(k=>chk(k,r.html)).length;const pk=cumKeys(chain.slice(0,-1));const lost=pk.filter(k=>keys.includes(k)&&chk(k,base0)&&!chk(k,r.html)).map(kName);
   const d=App.Code.diff(base0,r.html);const gN=h=>(String(h).match(/假设|举例/g)||[]).length;const pp=parse(p).P;const guess=(pp.bday0||pp.anniv0)&&gN(r.html)>gN(base0);
   IT.steps.push({p,m:r.mode,ms:r.ms,l:nL(r.html),a:d.filter(x=>x.t==='add').length,d:d.filter(x=>x.t==='del').length,hit,req:keys.length,lost,cus:ADDS.includes(p)?0:1});S.iv.push({html:r.html});
   if(IT.steps.length>12){IT.steps.splice(1,1);S.iv.splice(1,1);}
   bump();App.touch();showI(IT.steps.length-1);marks4();nextReq();const n=adds();
   if(lost.length)App.fb('#l10-i-fb','oops',`AI 把「${esc(lost[0])}」弄丢了！`,'你发现 AI 的错误了。再发一条要求，让它把原来的功能补回来。',{stars:iStars(),cheer:true});
   else if(guess)App.fb('#l10-i-fb','oops','AI 在自己猜！','你没说清是哪一天，它只好假设一个。发一条带日期的要求，比如'+(pp.anniv0?'「入队纪念日是 10 月 13 日」':'「我的生日是 6 月 18 日」')+'。',{stars:iStars()});
   else if(hit===keys.length)App.fb('#l10-i-fb','ok',`第 ${n} 条要求做到了！`,n>=3?'网页越来越像你想要的了。起个名字，存成你的作品。':`再加一条，凑满 3 条。`,{stars:iStars()});
   else App.fb('#l10-i-fb','try',`有 ${keys.length-hit} 项要求没做到`,'看看哪一项打了叉，把话说得更具体，再发一次。',{stars:iStars()});}
  catch(e){fail('#l10-i-ai','#l10-i-fb',e);}
  finally{S.busy4=false;ctls.delete(ctl);App.busy(b,false);b.classList.add('again');}};
 iin.addEventListener('input',drawReqs);iin.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();$('#l10-i-go').click();}});
 $('#l10-i-save').onclick=()=>{const i=IT.steps.length-1;const s=IT.steps[i];if(!s||i<1)return;if(iView!==i)showI(i);const html=(S.iv[i]||{}).html;
  if(!html){App.fb('#l10-i-fb','try','这一版的代码没有存档','再发一条要求，生成新的一版后再存。',{stars:iStars()});return;}
  const title=clip($('#l10-i-title').value,16)||'我的网页';$('#l10-i-title').value=title;const sh=shrink(html);
  lr.my={html:sh,title,saved:Date.now(),v:i,m:s.m,chain:ps(i).map(p=>clip(p,80)),hit:s.hit,req:s.req,l:s.l,big:sh?0:1};App.touch();marks4();
  $('#l10-i-state').textContent=`已存入作品集：「${title}」（${s.l} 行代码${sh?'':'；代码太长，只保存了记录'}）`;
  const st=iStars();App.fb('#l10-i-fb','ok',`「${esc(title)}」存好了！`,st>=3?'这是你和 AI 一起做的第一个网页，成长日记里能看到它。':'想拿 3 颗星：追加满 3 条，其中有一条带日期或标题的具体要求，再存一次。',{stars:st});};
 $('#l10-i-reset').onclick=()=>{if(S.busy4)return;if(!S.restartOk){S.restartOk=1;App.toast('再点一次会清空这些要求，从头开始（已存的作品不受影响）');setTimeout(()=>{S.restartOk=0;},4000);return;}
  S.restartOk=0;IT.steps=[];S.iv=[];App.touch();showI(-1);nextReq();App.aiSay('#l10-i-ai','回到了「生成一个网页」，重新加要求吧。',{mood:'idle'});App.fb('#l10-i-fb','find','从头再来','这次试试不一样的顺序，或者写上你自己的日期。',{stars:iStars()});};
 rebuildI();showI(IT.steps.length-1);nextReq();if(adds()){App.ran(s4);}if(lr.my&&lr.my.saved)$('#l10-i-state').textContent=`已存入作品集：「${lr.my.title}」`;marks4();

 /* ===== TALK 人与 AI 谁主导 ===== */
 const evid=()=>{const own=[];if(bugN())own.push('AI 的计算器算错了，是我测出来的');if(C.n)own.push(`笼统只做到 ${C.hv}/${C.req} 项，具体做到 ${C.hs}/${C.req} 项`);if(adds()>=2)own.push(`我追加了 ${adds()} 条要求，网页才合心意`);
  if(IT.steps.some(s=>s.lost&&s.lost.length))own.push('AI 改代码时弄丢过原来的功能');if(X.ms.tick)own.push('我读懂了 setInterval，才知道改哪里');
  return own.slice(0,3).concat(['AI 几十秒就写出上百行代码','AI 能把读不懂的代码讲明白','不懂代码，就看不出 AI 写错']).slice(0,5);};
 const tStars=()=>!TK.st?0:(TK.why.length&&A(TK.wt||'').length>=6)?3:TK.why.length?2:1;
 const marks5=()=>{if(TK.st&&TK.why.length)App.markStep(s5,0);if(A(TK.wt||'').length>=6)App.markStep(s5,1);};
 const drawWhy=()=>{const ev=evid();$('#l10-t-why').innerHTML=ev.map((t,j)=>`<button type="button" class="chip ${TK.why.includes(t)?'on':''}" data-tw="${j}" aria-pressed="${TK.why.includes(t)}">${esc(t)}</button>`).join('');
  $$('[data-tw]',s5).forEach(b=>b.onclick=()=>{const t=ev[+b.dataset.tw];const i=TK.why.indexOf(t);if(i<0){TK.why.push(t);if(TK.why.length>6)TK.why.shift();}else TK.why.splice(i,1);App.touch();drawWhy();marks5();});};
 App.segWire(s5,'st',v=>{TK.st=v;if(!TK.stFirst)TK.stFirst=v;App.touch();marks5();});if(TK.st)segSet(s5,'st',TK.st);
 const talkFb=()=>{if(!TK.st){App.fb('#l10-t-fb','try','先选一个立场','在「我站」里点一个，再挑一条证据。');return;}
  const nm=(STANCE.find(s=>s[0]===TK.st)||[])[1].split('：')[0];const chg=TK.stFirst&&TK.stFirst!==TK.st?'你换过立场：是哪条证据让你改变的？':'';
  const tip={human:'创意、测试、把关都靠人，AI 帮忙写。',ai:'想一想：AI 把 0.1 + 0.2 算错时，是谁发现的？',mix:'说说看：哪些事交给 AI，哪些事必须人来？'}[TK.st];
  const st=tStars();App.fb('#l10-t-fb',TK.why.length?'ok':'try',`你站「${nm}」，带了 ${TK.why.length} 条证据`,(TK.why.length?tip:'观点要有证据：在「我的证据」里挑一条。')+(st<3&&TK.why.length?'写一句理由，拿满 3 颗星。':'')+chg,{stars:st});};
 $('#l10-t-go').onclick=()=>{talkFb();$('#l10-t-go').classList.add('again');};
 {const el=$('#l10-t-wt');el.value=TK.wt||'';let t;el.addEventListener('input',()=>{TK.wt=clip(el.value,400);clearTimeout(t);t=setTimeout(()=>{App.touch();marks5();if(A(TK.wt).length>=6&&TK.st)App.fb('#l10-t-fb','ok','理由写好了！','有立场、有证据、有理由，这就是一次完整的论证。',{stars:tStars()});},700);});}
 drawWhy();marks5();if(TK.st&&TK.why.length){App.ran(s5);}

 /* ===== APPLY 人机分工: no right / wrong. Each choice gets a remark; the end shows the student's own board ===== */
 TK.first=TK.first&&typeof TK.first==='object'?TK.first:null;
 const rDone=()=>ROLES.every(r=>TK.roles[r[0]]);const rN=()=>ROLES.filter(r=>TK.roles[r[0]]).length;
 const rStars=()=>rDone()?3:rN()>=4?2:rN()?1:0;
 const marks5b=()=>{if(rN())App.markStep(s5b,0);if(rDone())App.markStep(s5b,1);};
 let ri=ROLES.findIndex(r=>!TK.roles[r[0]]);if(ri<0)ri=ROLES.length;
 const rSay=(r,k)=>{const [id,,ref,why]=r;
  if(ref==='h')return k==='a'?['find','全交给 AI？想一想',ROLEQ[id]+' 想改就再点一次，不改就说说你的理由。']:['ok',k==='h'?'这件事你留给了人':'这件事你选了一起做',why+(k==='b'?' AI 可以帮忙，人不能缺席。':'')];
  return k==='h'?['find','人自己来也可以','只是 AI 做这件事快得多。想一想：什么时候值得自己动手？']:['ok',k==='a'?'这件事你交给了 AI':'这件事你选了一起做',why];};
 const rSum=()=>{const cnt=k=>ROLES.filter(r=>TK.roles[r[0]]===k).length;const alone=ROLES.filter(r=>r[2]==='h'&&TK.roles[r[0]]==='a').map(r=>ROLEN[r[0]]);
  App.fb('#l10-r-fb',alone.length?'find':'ok','8 件事分完了！',`你把 ${cnt('h')} 件留给人，${cnt('a')} 件交给 AI，${cnt('b')} 件一起做。`+(alone.length?`「${alone.join('」「')}」你全交给了 AI：和同桌说说理由，听听他怎么分。`:'要把关的事你都留了人：AI 写得快，创意、测试和负责要靠人。'),{stars:rStars()});};
 const drawR=()=>{const box=$('#l10-r-card');
  if(ri>=ROLES.length){box.innerHTML=`<div class="l10-card"><small>我的分工表</small><b>点任何一件事，可以重新分</b></div><div class="l10-board">${['h','b','a'].map(k=>`<div><h5>${RK[k]}</h5>${ROLES.filter(r=>TK.roles[r[0]]===k).map(r=>`<button type="button" class="chip" data-rgo="${ROLES.indexOf(r)}">${ROLEN[r[0]]}</button>`).join('')||'<span class="note">（空）</span>'}</div>`).join('')}</div>`;
   $$('[data-rgo]',box).forEach(b=>b.onclick=()=>{ri=+b.dataset.rgo;drawR();const r=ROLES[ri];const m=rSay(r,TK.roles[r[0]]);App.fb('#l10-r-fb',m[0],m[1],m[2],{stars:rStars()});});return;}
  const [id,t]=ROLES[ri];const v=TK.roles[id];const last=ri===ROLES.length-1;
  box.innerHTML=`<div class="l10-card"><small>第 ${ri+1} / ${ROLES.length} 件事 · 你想交给谁？</small><b>${t}</b></div><div class="l10-big3">${['h','a','b'].map(k=>`<button type="button" class="chip ${v===k?'on':''}" data-tr="${k}">${RK[k]}</button>`).join('')}</div>
   <div class="row"><button type="button" class="btn ghost sm" data-rprev ${ri?'':'hidden'}>上一件</button><button type="button" class="btn sm" data-rnext ${v?'':'hidden'}>${last||rDone()?(last?'看我的分工表':'下一件'):'下一件'}</button>${rDone()&&!last?'<button type="button" class="btn ghost sm" data-rboard>回分工表</button>':''}</div>`;
  $$('[data-tr]',box).forEach(b=>b.onclick=()=>{const k=b.dataset.tr;TK.first=TK.first||{};if(!(id in TK.first))TK.first[id]=k;TK.roles[id]=k;if(rDone())TK.chk=1;App.touch();marks5b();
   const m=rSay(ROLES[ri],k);App.fb('#l10-r-fb',m[0],m[1],m[2],{stars:rStars()});drawR();});
  const pv=$('[data-rprev]',box),nx=$('[data-rnext]',box),bd=$('[data-rboard]',box);if(pv)pv.onclick=()=>{ri--;drawR();};
  const toBoard=()=>{ri=ROLES.length;drawR();rSum();};if(bd)bd.onclick=toBoard;
  if(nx)nx.onclick=()=>{if(last){if(rDone())toBoard();else{ri=ROLES.findIndex(r=>!TK.roles[r[0]]);drawR();}}else{ri++;drawR();}};};
 drawR();marks5b();if(rDone())rSum();

 /* ===== quiz + diary ===== */
 App.quiz($('#l10-quiz'),K,QUIZ);
 const rd=App.diary($('#l10-diary'),K,{title:L.diaryTitle,lead:'用你的作品和实验记录来回答',
  fields:[{id:'change',q:'你认为用 AI 辅助编程会给程序员的工作带来哪些变化？',ph:'比如：写代码更快了……；但程序员要更多地……'},
   {id:'learn',q:'你认为未来人们还需要学习编程吗？AI 能完全替代程序员吗？',ph:'我认为……，因为在网页工坊里我发现……'},
   {id:'role',q:'你认为和 AI 协作编程时，人和 AI 应各自扮演什么角色？',ph:'人负责……；AI 负责……'}],
  pledge:'分享用 AI 做的网页时，我会说明代码是 AI 生成的，并且自己先测试、检查过。',
  extras:ex=>{const l=App.lesson(K);const my=l.my||{},it=l.it||{},g=l.g||{},c=l.c||{},tk=l.talk||{};const st=it.steps||[];
   ex.innerHTML=`<div class="l10-dex"><div><div class="box-t">我的第一个网页</div>${my.saved?`<p><b>「${esc(my.title)}」</b> <span class="note">${my.l||0} 行代码 · 要求做到 ${my.hit}/${my.req} 项 · ${esc(srcOf(my.m))}</span></p>${my.html?'<div id="l10-d-prev" style="margin-top:6px"></div>':'<p class="note">代码太长，只保存了记录。</p>'}
     <div class="box-t" style="margin-top:8px">提示词：从笼统到具体</div><ol>${(my.chain||[]).map(p=>`<li>${esc(p)}</li>`).join('')}</ol>`:'<p class="note">在「我的第一个网页」那一站把满意的一版存成作品后显示。</p>'}</div>
    <div><div class="box-t">网页生成器 · 提示词对比台</div><p>生成了 ${(g.v||[]).length} 版网页${(g.v||[]).length?`（日历时钟 ${(g.v||[]).filter(e=>e.k==='cc').length} 版，计算器 ${(g.v||[]).filter(e=>e.k==='calc').length} 版）`:''}；计算器测试 ${CALCT.filter(([id])=>(g.calc||{})[id]).length} 道，抓到 bug ${CALCT.filter(([id])=>calcOk(id,(g.calc||{})[id])===false).length} 个。</p>
     <p>${c.n?`对比台：笼统版做到 ${c.hv}/${c.req} 项要求，具体版做到 ${c.hs}/${c.req} 项。`:'对比台：还没有运行。'}</p><p>逐步完善：共 ${st.length} 步${st.some(s=>s.lost&&s.lost.length)?'，途中发现 AI 弄丢过原来的功能':''}。</p></div>
    <div><div class="box-t">人与 AI 谁主导</div><p>${tk.st?esc((STANCE.find(s=>s[0]===tk.st)||[])[1]||''):'还没有表态。'}</p></div></div>`;
   if(my.saved&&my.html){const d=$('#l10-d-prev',ex);if(d)showPrev(d,my.html,{h:240,label:my.title+'.html'});}}});
 L._rd=rd;const sig=()=>{const l=App.lesson(K);const my=l.my||{};return [my.saved,my.title,(l.g&&l.g.v||[]).length,l.c&&l.c.n,(l.it&&l.it.steps||[]).length,l.talk&&l.talk.st,JSON.stringify((l.g||{}).calc||{})].join('|');};
 S.dsig=sig();if(!L._on){L._on=1;App.on(()=>{if(App.current===K&&L._rd&&App.rec){const s=sig();if(s!==S.dsig){S.dsig=s;L._rd();}}});}
 if(!L._ai){L._ai=1;window.addEventListener('ai-mode',()=>{if(L._refresh)L._refresh();});}
 L._refresh=()=>{if(App.current===K){startClock();if(L._rd){S.dsig=sig();L._rd();}drawWhy();}};
}
L.onShow=()=>{if(L._refresh)L._refresh();};
L.onHide=()=>{stopAll();};

/* ================= hooks ================= */
const typed=g=>CALCT.filter(([id])=>((g.calc||{})[id]||'').trim()).length;
const wrongTyped=g=>CALCT.filter(([id])=>calcOk(id,(g.calc||{})[id])===false).length;
const roleAcc=tk=>{const r=tk.first||(tk.chk?tk.roles:null);if(!r)return 0;return ROLES.filter(x=>roleOk(x[0],r[x[0]])).length/ROLES.length;};
const wCh=w=>Object.keys(w.ch||{}).filter(k=>k!=='text').length;
L.score=lr=>{const Q=lr.quiz||{},qs=id=>Q[id]?(Q[id].ok?100:0):0,tx=App.txtScore,D=lr.diary||{};
 const w=lr.w||{},g=lr.g||{},x=lr.x||{},c=lr.c||{},it=lr.it||{},my=lr.my||{},tk=lr.talk||{};const gv=g.v||[],o=g.o||{},st=it.steps||[];
 const ch=wCh(w);const has=k=>gv.some(e=>e.k===k)?1:0;const cus=st.filter(s=>s.cus).length;
 const calcCons=o.calc==null?0:(wrongTyped(g)&&o.calc===0)?5:15;
 return {principle:25*Math.min(1,ch/3)+(w.q?(w.q.first===1?20:w.q.last===1?10:0):0)+20*Math.min(1,(x.ex||[]).length/3)+15*Math.min(1,Object.keys(x.ms||{}).length/2)+(x.fast?(x.fast.first===1?10:x.fast.last===1?5:0):0)+0.05*qs('q1')+0.05*qs('q2'),
  experiment:12*has('cc')+12*has('calc')+14*Math.min(1,Object.keys(g.cc||{}).length/4)+14*typed(g)/3+12*['fn','calc'].filter(k=>o[k]!=null).length/2+16*Math.min(1,st.length/4)+10*(c.n?1:0)+10*(x.fr?1:0),
  prompt:20*Math.min(1,(c.keys||[]).length/3)+(c.req?20*(c.hs||0)/c.req:0)+30*Math.min(1,Math.max(0,st.length-1)/3)+20*(cus?1:0)+0.1*qs('q3'),
  critical:25*typed(g)/3+calcCons+15*Math.min(1,(tk.why||[]).length/2)+0.15*tx(tk.wt,30)+15*(c.b!=null?1:0)+0.15*qs('q4'),
  creative:(my.saved?35:0)+(my.title?15:0)+25*Math.min(1,cus/2)+25*Math.min(1,st.length/5),
  ethics:(D.pledge?25:0)+25*roleAcc(tk)+(tk.st?15:0)+0.15*tx(D.role,30)+0.2*qs('q5')};};
L.progress=lr=>{const w=lr.w||{},g=lr.g||{},x=lr.x||{},c=lr.c||{},it=lr.it||{},tk=lr.talk||{},o=g.o||{};const gv=g.v||[];
 const m=[wCh(w)>=3&&!!w.q,gv.some(e=>e.k==='cc')&&gv.some(e=>e.k==='calc'),Object.keys(g.cc||{}).length>=3&&typed(g)>=2&&['fn','calc'].every(k=>o[k]!=null),
  (x.ex||[]).length>=2&&Object.keys(x.ms||{}).length>=1&&!!x.fast,!!c.n&&c.b!=null,(it.steps||[]).length>=3,!!(lr.my||{}).saved,!!tk.st&&!!tk.chk,Object.keys(lr.quiz||{}).length>=5,!!(lr.diary||{}).submitted];
 return m.filter(Boolean).length/m.length;};
L.quiz=QUIZ;
L.flow=[
 {seg:'导入',from:'l10-s0'},
 {seg:'挑战一',kp:'知识点一 · AI 是编程助手',learn:['网页背后是代码，浏览器按代码呈现（课程补充）','用自然语言说要求，AI 就能写出网页代码','读不懂的代码，可以请 AI 解释'],sum:['改一处代码，网页就跟着变','AI 几十秒写出网页，可计算器也会算错，要测试','请 AI 解释 setInterval，读懂了才知道改哪里'],from:'l10-s1',to:'l10-s2b'},
 {seg:'挑战二',kp:'知识点二 · 善用提示词',learn:['AI 不会读心术：表达越清楚，越容易理解','先从简单要求开始，再一步步提具体要求','每次的要求都要明确、清晰'],sum:['笼统的提示词 AI 只能猜，具体的要求项项做到','没说清的地方，AI 会自己假设','追加要求后，要检查原来的功能还在不在'],from:'l10-s3',to:'l10-s4'},
 {seg:'综合运用',from:'l10-s5'},
 {seg:'反思与总结',from:'l10-quiz-st'}
];
L.diaryTitle='我的第一个网页';
L.diaryQ=[['change','给程序员带来的变化'],['learn','还要学编程吗'],['role','人和 AI 的角色']];
const xe=s=>String(s||'').replace(/[<&>"]/g,'');
const pageCard=(title,lines,tag,color)=>'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200"><rect width="320" height="200" fill="#eaf2ff"/><rect x="14" y="14" width="292" height="172" rx="14" fill="#ffffff" stroke="#1b2550" stroke-width="2.5"/><circle cx="32" cy="31" r="4" fill="#ff6b4a"/><circle cx="46" cy="31" r="4" fill="#ffd43b"/><circle cx="60" cy="31" r="4" fill="#12b886"/><rect x="74" y="23" width="220" height="16" rx="8" fill="#f1f5ff"/><text x="84" y="35" font-size="10" fill="#4c5884" font-family="monospace">${xe(cut(title,18))}.html</text><text x="30" y="68" font-size="17" font-weight="700" fill="${color}" font-family="Noto Sans SC,sans-serif">${xe(cut(title,14))}</text>${lines.slice(0,4).map((l,i)=>`<text x="30" y="${94+i*22}" font-size="12.5" fill="#1b2550" font-family="Noto Sans SC,sans-serif">${i+1}. ${xe(cut(l,19))}</text>`).join('')}<text x="294" y="178" font-size="10" fill="#4c5884" text-anchor="end" font-family="Noto Sans SC,sans-serif">${xe(tag)}</text></svg>`);
L.works=lr=>{const o=[];const my=lr.my||{};
 if(my.saved)o.push({t:`我的第一个网页 ·「${my.title||'无题'}」`,s:`${(my.chain||[]).length} 条提示词：从“${cut((my.chain||[])[0]||'',8)}”到“${cut((my.chain||[]).slice(-1)[0]||'',12)}”；要求做到 ${my.hit}/${my.req} 项`,img:pageCard(my.title||'我的网页',my.chain||[],'AI 生成代码 · 我提要求','#cf4526')});
 const c=lr.c||{};if(c.n)o.push({t:'提示词对比台',s:`笼统版做到 ${c.hv}/${c.req} 项要求，具体版做到 ${c.hs}/${c.req} 项`,img:pageCard('笼统 vs 具体',['生成一个网页',c.p||'具体的提示词',`笼统 ${c.hv}/${c.req} · 具体 ${c.hs}/${c.req}`],'AI 生成','#2f6bff')});
 return o;};
L.expCount=lr=>lr.nExp||0;
L.classPanels=recs=>{const R=recs.map(r=>(r.lessons||{})[K]||{}).filter(l=>Object.keys(l).length);if(!R.length)return '';
 const bar=(n,v,tot,col,lab)=>`<div class="hbar"><span>${n}</span><span class="tr"><i style="width:${tot?100*v/tot:0}%;background:${col}"></i></span><span>${lab!=null?lab:v}</span></div>`;
 const CM=R.map(l=>l.c||{}).filter(c=>c.n&&c.req);const hv=CM.length?CM.reduce((s,c)=>s+c.hv/c.req,0)/CM.length:0,hs=CM.length?CM.reduce((s,c)=>s+c.hs/c.req,0)/CM.length:0;
 const IT=R.map(l=>(l.it||{}).steps||[]).filter(s=>s.length);const avg=IT.length?IT.reduce((s,a)=>s+a.length,0)/IT.length:0;
 const dist=[[1,2,'1–2 步'],[3,4,'3–4 步'],[5,99,'5 步及以上']].map(([a,b,n])=>[n,IT.filter(s=>s.length>=a&&s.length<=b).length]);
 const cus=IT.filter(s=>s.some(x=>x.cus)).length,lost=IT.filter(s=>s.some(x=>x.lost&&x.lost.length)).length,saved=R.filter(l=>(l.my||{}).saved).length;
 const G=R.map(l=>l.g||{});const ty=G.filter(g=>typed(g)>=1);const t2=G.filter(g=>(g.calc||{}).t2);const t2w=t2.filter(g=>calcOk('t2',g.calc.t2)===false).length;
 const oc=[0,1,2].map(j=>G.filter(g=>(g.o||{}).calc===j).length);const ocN=oc.reduce((a,b)=>a+b,0);const said0=G.filter(g=>(g.o||{}).calc===0&&wrongTyped(g)>0).length;
 const TK=R.map(l=>l.talk||{});const stF={},stL={};STANCE.forEach(([k])=>{stF[k]=0;stL[k]=0;});TK.forEach(t=>{if(t.stFirst&&t.stFirst in stF)stF[t.stFirst]++;if(t.st&&t.st in stL)stL[t.st]++;});const stN=TK.filter(t=>t.st).length;
 const RF=TK.map(t=>t.first).filter(Boolean);const racc=ROLES.filter(r=>r[2]==='h').map(([id,n])=>[n,RF.length?RF.filter(f=>roleOk(id,f[id])).length:0]).sort((a,b)=>a[1]-b[1]);
 return `<div class="box"><div class="box-t">第10讲 · 网页工坊：提示词与迭代</div>
   <b style="font-size:13px">提示词对比台：要求做到的比例（${CM.length} 人）</b>${bar('笼统：生成一个网页',Math.round(hv*100),100,'var(--dim)',Math.round(hv*100)+'%')}${bar('具体的提示词',Math.round(hs*100),100,'var(--green)',Math.round(hs*100)+'%')}
   <b style="font-size:13px;display:block;margin-top:8px">逐步完善（我的第一个网页）：每人走了几步（平均 ${avg.toFixed(1)} 步，${IT.length} 人）</b>${dist.map(([n,v])=>bar(n,v,IT.length,'var(--cyan)')).join('')}
   ${bar('写过自己的具体要求',cus,IT.length,'var(--amber)')}${bar('遇到 AI 弄丢原有功能',lost,IT.length,'var(--red)')}${bar('存入作品集',saved,R.length,'var(--violet)')}</div>
  <div class="box"><div class="box-t">第10讲 · 测试与分工</div>
   <b style="font-size:13px">计算器测试（${ty.length} 人填写；0.1 + 0.2 记录到错误结果：${t2w}/${t2.length} 人）</b>${['能正常使用','大部分能用，有的不对','不能使用'].map((n,j)=>bar(n,oc[j],ocN,j===0?'var(--amber)':'var(--cyan)')).join('')}
   <p class="note">测出错误结果、却仍判断“能正常使用”的：${said0} 人</p>
   <b style="font-size:13px;display:block;margin-top:8px">人与 AI 谁主导（第一次 → 最后，${stN} 人）</b>${STANCE.map(([k,t])=>bar(t.split('：')[0],stL[k],stN,k==='human'?'var(--green)':k==='ai'?'var(--red)':'var(--amber)',`${stF[k]}→${stL[k]}`)).join('')}
   <b style="font-size:13px;display:block;margin-top:8px">分工：要人把关的事，第一次就安排了人参与的人数（${RF.length} 人，最少的在前）</b>${racc.slice(0,4).map(([n,v])=>bar(cut(n,14),v,RF.length,'var(--violet)')).join('')}</div>`;};
L.classSug=recs=>{const R=recs.map(r=>(r.lessons||{})[K]||{}).filter(l=>Object.keys(l).length);if(!R.length)return [];const out=[];
 const RF=R.map(l=>(l.talk||{}).first).filter(Boolean);const te=RF.filter(f=>f.test==='a').length;
 if(RF.length>=4&&te/RF.length>=0.3)out.push(`${te}/${RF.length} 名学生第一次把“测试功能对不对”交给了 AI：请全班一起在 AI 做的计算器上按 0.1 + 0.2，再讨论“AI 写完的代码，谁来发现问题”。`);
 const G=R.map(l=>l.g||{});const s0=G.filter(g=>(g.o||{}).calc===0&&wrongTyped(g)>0).length;
 if(s0>=2&&out.length<2)out.push(`${s0} 名学生测出了计算器的错误结果，却仍判断“能正常使用”：带学生回看「计算器抓虫」的反馈横幅，说说“测试记录”和“结论”为什么要一致。`);
 const IT=R.map(l=>(l.it||{}).steps||[]).filter(s=>s.length);const few=IT.filter(s=>s.length<3).length;
 if(out.length<2&&IT.length>=3&&few/IT.length>=0.4)out.push(`${few}/${IT.length} 名学生在迭代工作台不到 3 步就停下了：示范一次“点一条要求 → 发给 AI → 看要求检查 → 再改成带日期的具体要求”。`);
 return out.slice(0,2);};
L.demo=(rnd,t)=>{const p=x=>rnd()<x;const pk=a=>a[Math.floor(rnd()*a.length)];const lr={};
 const ch={};['bg','col','size','script','close'].forEach(k=>{if(p(.3+t*.6))ch[k]=1;});lr.w={ch,n:Object.keys(ch).length+Math.floor(rnd()*4),cl:p(.7)?1:0};if(p(.4+t*.55)){const ok=p(.5+t*.45);lr.w.q={first:ok?1:pk([0,2]),last:p(.3+t*.6)?1:0};}
 const v=[];if(p(.5+t*.5))v.push({k:'cc',p:'生成一个显示日历和时钟的网页',m:'offline',ms:2800+Math.round(rnd()*900),l:96});if(p(.4+t*.55))v.push({k:'calc',p:'生成一个计算器网页',m:'offline',ms:2600+Math.round(rnd()*800),l:68});
 const cc={};if(v.some(e=>e.k==='cc')&&p(.4+t*.55)){const okc=p(.9)?1:0;CCK.forEach(id=>{cc[id]=okc;});}const calc={};if(v.some(e=>e.k==='calc')){if(p(.5+t*.4))calc.t0='42';if(p(.4+t*.5))calc.t2=p(.8)?'0.30000000000000004':'0.3';if(p(.3+t*.5))calc.t3=p(.7)?'Infinity':'不能除以0';}
 const o={};if(Object.keys(cc).length)o.fn=cc.m?0:1;if(p(.35+t*.55))o.calc=calc.t2&&calc.t2!=='0.3'?(p(.08+(1-t)*.25)?0:1):pk([0,0,1]);
 lr.g={v,cc,calc,o};if(v.some(e=>e.k==='cc')&&p(.3+t*.4))lr.g.glok=1;
 const nx=Math.floor(t*6*rnd()+(p(.6)?1:0));lr.x={ex:Array.from({length:Math.min(8,nx)},(_,i)=>({l:['setInterval(drawClock, 1000);','const now = new Date();','background: #f4f6fb;','ctx.rotate(angle);'][i%4]+(i>3?' ':''),t:'示例解释',m:'offline'})),ms:{}};
 if(nx>=1&&p(.5+t*.4))lr.x.ms.tick=1;if(nx>=2&&p(.4+t*.4))lr.x.ms.date=1;if(nx>=3&&p(.3+t*.4))lr.x.ms.bg=1;if(p(.3+t*.6)){const ok=p(.5+t*.45);lr.x.fast={first:ok?1:pk([0,2]),last:p(.4+t*.5)?1:0};lr.x.fr=1;}
 if(p(.35+t*.6)){const keys=['cal','clock','bg:蓝'].concat(p(t)?['bday']:[]);const hs=keys.length-(p(.2)?1:0);lr.c={cards:['cal','clock','bg'],p:'生成一个显示日历和时钟的网页，背景为蓝色',keys,req:keys.length,hv:p(.15)?1:0,hs,lv:22+Math.floor(rnd()*6),ls:90+Math.floor(rnd()*30),mv:'offline',ms:'offline',n:1+Math.floor(rnd()*2*t)};
  lr.c.rv=keys.map(()=>false);lr.c.rs=keys.map((_,i)=>i<hs);if(p(.5+t*.45))lr.c.b=p(.9)?0:2;if(p(.4+t*.4))lr.c.gok=1;}
 const nst=p(.35+t*.6)?Math.max(1,Math.round(1+t*5*(0.4+0.8*rnd()))):0;const chain=['生成一个网页',ADDS[0],p(t)?SUGS[0]:ADDS[1],ADDS[3],p(t)?SUGS[3]:ADDS[2],SUGS[2],SUGS[1]];
 lr.it={steps:Array.from({length:nst},(_,i)=>{const pp=chain[Math.min(i,chain.length-1)];const keys=cumKeys(chain.slice(0,i+1));const lostOne=i>1&&p(.12);return {p:pp,m:'offline',ms:2500+Math.round(rnd()*900),l:24+i*18,a:i?14+Math.floor(rnd()*10):0,d:i?1+Math.floor(rnd()*3):0,hit:Math.max(0,keys.length-(lostOne?1:0)),req:keys.length,lost:lostOne?['时钟']:[],cus:i>0&&!ADDS.includes(pp)?1:0};}),runs:1};
 if(nst>=3&&p(.4+t*.5)){const ch2=chain.slice(0,nst);const s=lr.it.steps[nst-1];lr.my={html:'',title:pk(['我的时间小站','小禾的日历','蓝色时钟']),saved:Date.now(),v:nst-1,m:'offline',chain:ch2,hit:s.hit,req:s.req,l:s.l,big:0};}
 if(p(.35+t*.6)){const f=p(.35+t*.4)?'human':pk(['ai','mix','human']);lr.talk={stFirst:f,st:p(.5+t*.4)?'human':f,why:['AI 几十秒就写出上百行代码','不懂代码，就看不出 AI 写错'].filter(()=>p(.4+t*.5)),wt:p(t)?'要学，因为要看懂 AI 写的代码才能发现问题。':'',roles:{},chk:0};
  const fr={};ROLES.forEach(([id,,ref])=>{fr[id]=p(.45+t*.5)?ref:(id==='test'&&p(.6)?'a':pk(['h','a','b']));});lr.talk.roles=Object.assign({},fr);if(p(.5+t*.45)){lr.talk.first=fr;lr.talk.chk=1;}}
 const q=(id,pp)=>{const ok=p(pp);const a=QUIZ.find(x=>x.id===id).a;return {first:ok?a:(a+1)%4,ok,last:a};};
 if(p(.3+t*.7))lr.quiz={q1:q('q1',.7+t*.3),q2:q('q2',.5+t*.45),q3:q('q3',.6+t*.4),q4:q('q4',.55+t*.4),q5:q('q5',.65+t*.35)};
 if(p(.2+t*.7))lr.diary={change:p(t)?'程序员写代码更快了，但要花更多时间检查 AI 的代码、想清楚要做什么。':'写得更快。',learn:p(t)?'还需要学，AI 会写错，要看得懂才能发现问题、指挥 AI。':'要学。',role:p(t)?'人出创意、说清要求、测试和决定；AI 帮忙写代码、解释代码。':'人说 AI 写。',pledge:p(.75),submitted:p(t+.1)?1:0};
 lr.nExp=v.length+(lr.x.ex||[]).length+((lr.c||{}).n||0)*2+nst;
 return lr;};
})();
