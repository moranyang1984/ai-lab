/* Unit 4 shared toolkit: AI writes a web page, the page runs in a locked sandbox, students read the code.
   App.Code.generate(prompt,{onText,signal,base,kind})  -> {html,text,mode} | null (offline: use your presets)
   App.Code.preview(el,html,{height,title})             -> iframe (sandbox="allow-scripts", no network, no storage)
   App.Code.view(el,html,{onLine,mark})                 -> numbered code listing, click a line to explain it
   App.Code.explain(line,{context,signal})              -> Promise<{text,mode}> (AI when available, else rule-based)
   App.Code.ruleExplain(line)                           -> string, child-friendly explanation (offline)
   App.Code.diff(a,b)                                   -> [{t:'same'|'add'|'del',s}] line diff
   App.Code.stats(html)                                 -> {lines,tags,styleLines,scriptLines,buttons}
   App.Code.extract(text)                               -> html string from an AI answer (or '') */
(function(){
const {esc}=App;const C={};App.Code=C;
const CSP=`<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval'; style-src 'unsafe-inline'; img-src data: blob:; font-src data:; media-src data: blob:">`;
/* the page reports its own height so the preview grows to show all of it (no scrolling inside a small box) */
const AUTOH='<script>(function(){function s(){try{var d=document.documentElement,b=document.body;parent.postMessage({__labH:Math.max(d?d.scrollHeight:0,b?b.scrollHeight:0)},"*")}catch(e){}}addEventListener("load",function(){s();setTimeout(s,400)});setInterval(s,1200)})()<\/script>';
window.addEventListener('message',e=>{const h=e.data&&e.data.__labH;if(!h)return;document.querySelectorAll('iframe[data-minh]').forEach(f=>{if(f.contentWindow!==e.source)return;const min=+f.dataset.minh||360;const want=Math.min(1400,Math.max(min,Math.ceil(h)+2));const n=+f.dataset.grow||0;if(Math.abs(want-f.offsetHeight)>6&&n<4){f.dataset.grow=n+1;f.style.height=want+'px';}});});
C.extract=function(text){if(!text)return'';const t=String(text);
  let m=/```(?:html|HTML)?\s*\n([\s\S]*?)```/.exec(t);if(m&&/<\w/.test(m[1]))return m[1].trim();
  m=/```(?:html|HTML)?\s*\n([\s\S]*)$/.exec(t);if(m&&/<\w/.test(m[1]))return m[1].trim(); // still streaming
  const i=t.search(/<!doctype html|<html[\s>]/i);if(i>=0)return t.slice(i).replace(/```\s*$/,'').trim();
  return /<(div|body|style|script|canvas)[\s>]/i.test(t)?t.trim():'';};
/* put the CSP first inside <head> (or prepend) so generated pages cannot load anything from the network */
C.lock=function(html){html=String(html||'');if(/<head[^>]*>/i.test(html))return html.replace(/<head[^>]*>/i,m=>m+CSP);
  if(/<html[^>]*>/i.test(html))return html.replace(/<html[^>]*>/i,m=>m+'<head>'+CSP+'</head>');return '<!doctype html><html><head><meta charset="utf-8">'+CSP+'</head><body>'+html+'</body></html>';};
C.preview=function(el,html,{height=360,title='AI 生成的网页预览'}={}){el.innerHTML='';const f=document.createElement('iframe');
  f.setAttribute('sandbox','allow-scripts');f.setAttribute('title',title);f.setAttribute('referrerpolicy','no-referrer');
  f.style.cssText=`width:100%;height:${height}px;border:0;border-radius:10px;background:#fff;display:block`;f.dataset.minh=height;f.srcdoc=C.lock(html)+AUTOH;el.appendChild(f);return f;};
const SYS=`你是给 10–12 岁小学生演示“AI 编程”的助手。请根据要求写一个完整、可直接运行的网页：
- 只输出一个 \`\`\`html 代码块，里面是完整的 HTML 文件（含 <style> 和 <script>），代码块外最多写一句话；
- 不引用任何外部文件、图片、字体或网址（页面在断网的沙盒里运行），图形用 CSS 或 <canvas> 画；
- 界面文字用简体中文，内容积极健康、适合小学生；代码不超过 160 行，变量和注释清楚易读（注释用中文）；
- 页面宽度自适应，在 360–800 像素宽的框里都能正常显示。`;
C.generate=async function(prompt,{onText,signal,base='',kind='网页'}={}){
  const full=(base?`下面是现在的网页代码，请在它的基础上按新要求修改，并输出修改后的完整代码：\n\`\`\`html\n${base}\n\`\`\`\n\n新要求：`:`请做一个${kind}。要求：`)+prompt;
  const r=await App.AI.chat(full,{system:SYS,signal,onText:onText?(o=>onText({text:o.text,html:C.extract(o.text)})):null});
  if(!r)return null;const html=C.extract(r.text||'');return {html,text:r.text||'',mode:r.mode};};
/* ---------- code listing ---------- */
C.view=function(el,html,{onLine,mark=[],maxHeight=360}={}){const lines=String(html||'').split('\n');const M=new Set(mark);
  el.innerHTML=`<div class="code-view" style="max-height:${maxHeight}px">${lines.map((s,i)=>`<button type="button" class="cl ${M.has(i)?'mk':''}" data-i="${i}"><span class="ln">${i+1}</span><code>${esc(s)||' '}</code></button>`).join('')}</div>`;
  el.querySelectorAll('.cl').forEach(b=>b.onclick=()=>{el.querySelectorAll('.cl.on').forEach(x=>x.classList.remove('on'));b.classList.add('on');if(onLine)onLine(+b.dataset.i,lines[+b.dataset.i],lines);});
  return lines;};
/* ---------- explanations ---------- */
const RULES=[
 [/<!doctype/i,'告诉浏览器：下面是一份 HTML 网页。'],[/<html/i,'网页的开始。整份网页都装在 <html> 里。'],[/<\/html>/i,'网页的结束。'],
 [/<head/i,'网页的“头部”，放标题、样式等看不见的设置。'],[/<meta[^>]*charset/i,'告诉浏览器用 UTF-8 编码，这样中文才不会变成乱码。'],[/<meta[^>]*viewport/i,'让网页在手机、平板上也按屏幕宽度显示。'],
 [/<title>/i,'浏览器标签上显示的网页名字。'],[/<style/i,'样式开始：下面这些规则决定网页的颜色、大小和位置。'],[/<\/style>/i,'样式结束。'],
 [/<body/i,'网页的“身体”：这里的内容才会显示在屏幕上。'],[/<h1|<h2|<h3/i,'标题文字，字号比较大。'],[/<p[\s>]/i,'一段文字（段落）。'],
 [/<button/i,'一个按钮，可以被点击。'],[/<input/i,'一个输入框，用来输入文字或数字。'],[/<canvas/i,'一块“画布”，程序可以在上面画图、做动画。'],
 [/<div/i,'一个“盒子”，用来把内容分组、摆放位置。'],[/<span/i,'一小段文字，常用来单独改颜色或样式。'],[/<script/i,'脚本开始：下面是 JavaScript 程序，让网页能动、能算、能响应点击。'],[/<\/script>/i,'脚本结束。'],
 [/background/i,'设置背景颜色或背景图案。'],[/color\s*:/i,'设置文字颜色。'],[/font-size/i,'设置文字大小。'],[/border-radius/i,'把边角变圆。'],[/display\s*:\s*(flex|grid)/i,'让里面的盒子按行或按格子排好。'],
 [/margin|padding/i,'设置留白：盒子外面或里面空出多少距离。'],[/width|height/i,'设置宽度或高度。'],[/animation|@keyframes|transition/i,'设置动画：让样式随时间慢慢变化。'],
 [/new Date\(/,'取得“现在”的日期和时间。'],[/getHours|getMinutes|getSeconds/,'从时间里取出几点、几分、几秒。'],[/getFullYear|getMonth|getDate|getDay/,'从日期里取出年、月、日或星期几。'],
 [/setInterval/,'定时器：每隔一段时间（毫秒）就自动做一次后面的事。1000 毫秒 = 1 秒。'],[/setTimeout/,'计时器：等一段时间以后做一次。'],[/requestAnimationFrame/,'请浏览器在下一帧画面时再调用一次，用来做流畅的动画。'],
 [/addEventListener\(\s*['"]keydown/,'监听键盘：按下方向键等按键时执行后面的程序。'],[/addEventListener|onclick/,'监听事件：比如“被点击”时就执行后面的程序。'],
 [/getElementById|querySelector/,'在网页里按名字找到某个元素，好去修改它。'],[/textContent|innerText|innerHTML/,'修改元素里显示的文字。'],[/getContext\(/,'拿到画布的“画笔”。'],
 [/fillRect|strokeRect/,'画一个长方形。'],[/arc\(/,'画一个圆或圆弧。'],[/ellipse\(/,'画一个椭圆。'],[/fillStyle|strokeStyle/,'设置画笔颜色。'],[/fillText/,'在画布上写字。'],[/clearRect/,'把画布擦干净，准备画下一帧。'],
 [/Math\.cos|Math\.sin/,'用三角函数算出圆周上的位置，让东西绕圈转。'],[/Math\.random/,'取一个随机数，让结果每次不一样。'],[/Math\.floor|Math\.round/,'把小数变成整数。'],[/Math\.PI/,'圆周率 π，约等于 3.14，画圆、算角度要用。'],
 [/function\s+\w+|=>\s*\{/,'定义一个“函数”：把一组步骤打包起来，起个名字，需要时调用。'],[/\bif\s*\(/,'判断：如果括号里的条件成立，就执行后面的程序。'],[/\belse\b/,'否则：条件不成立时执行这里。'],
 [/\bfor\s*\(|\bwhile\s*\(/,'循环：把同样的步骤重复做很多次。'],[/\breturn\b/,'把结果交回去，函数到这里结束。'],[/\b(let|const|var)\s+\w+/,'创建一个变量：给一个数据起名字，后面可以使用或修改。'],
 [/\+\+|\+=|-=/,'让数字变大或变小（比如分数加 1）。'],[/push\(|splice\(|shift\(|unshift\(/,'往列表里加入或拿掉元素。'],[/\.length/,'数一数列表或文字有多长。'],
 [/^\s*\/\/|^\s*\/\*|<!--/,'这是注释：写给人看的说明，电脑不会执行。'],[/^\s*[}\])]+;?\s*$/,'括号收尾：前面那一段程序到这里结束。'],[/^\s*$/,'空行，只是为了让代码看起来更清楚。']];
C.ruleExplain=function(line){for(const [re,t] of RULES)if(re.test(line))return t;return '这一行是网页代码的一部分，可以和上下几行连起来读，看看它属于哪一段（样式还是程序）。';};
C.explain=async function(line,{context='',signal}={}){
  try{const r=await App.AI.chat(`给 10–12 岁的小学生，用一两句通俗的话解释这一行网页代码在做什么（不超过 60 个字，不用专业术语堆砌）：\n${line}\n\n上下文：\n${context.slice(0,1200)}`,{tier:'quick',signal});
    if(r&&r.text)return {text:r.text.trim(),mode:r.mode};}catch(e){if(e&&e.code==='cancelled')throw e;}
  return {text:C.ruleExplain(line),mode:'offline'};};
/* ---------- line diff (LCS) ---------- */
C.diff=function(a,b){const A=String(a||'').split('\n'),B=String(b||'').split('\n');const n=A.length,m=B.length;
  if(n*m>400000){return [...A.map(s=>({t:'del',s})),...B.map(s=>({t:'add',s}))];}
  const D=Array.from({length:n+1},()=>new Uint16Array(m+1));for(let i=n-1;i>=0;i--)for(let j=m-1;j>=0;j--)D[i][j]=A[i]===B[j]?D[i+1][j+1]+1:Math.max(D[i+1][j],D[i][j+1]);
  const out=[];let i=0,j=0;while(i<n&&j<m){if(A[i]===B[j]){out.push({t:'same',s:A[i]});i++;j++;}else if(D[i+1][j]>=D[i][j+1])out.push({t:'del',s:A[i++]});else out.push({t:'add',s:B[j++]});}
  while(i<n)out.push({t:'del',s:A[i++]});while(j<m)out.push({t:'add',s:B[j++]});return out;};
C.diffHTML=function(d,{context=2}={}){const keep=d.map((x,i)=>x.t!=='same'||d.slice(Math.max(0,i-context),i+context+1).some(y=>y.t!=='same'));let out='',gap=false;
  d.forEach((x,i)=>{if(!keep[i]){if(!gap){out+='<div class="dl gap">⋯</div>';gap=true;}return;}gap=false;out+=`<div class="dl ${x.t}"><span>${x.t==='add'?'+':x.t==='del'?'−':' '}</span><code>${esc(x.s)||' '}</code></div>`;});
  return `<div class="code-diff">${out}</div>`;};
C.stats=function(html){const s=String(html||'');const lines=s.split('\n').length;const st=/<style[^>]*>([\s\S]*?)<\/style>/i.exec(s);const sc=[...s.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)].map(m=>m[1]).join('\n');
  return {lines,tags:(s.match(/<[a-z][a-z0-9]*[\s>]/gi)||[]).length,styleLines:st?st[1].split('\n').length:0,scriptLines:sc?sc.split('\n').length:0,buttons:(s.match(/<button/gi)||[]).length};};
/* shared CSS */
if(!document.getElementById('css-code')){const st=document.createElement('style');st.id='css-code';st.textContent=`
.code-view{overflow:auto;background:#060b1d;border:1px solid var(--line);border-radius:10px;padding:6px 0;font-family:var(--f-mono);font-size:13px}
.code-view .cl{display:flex;gap:10px;width:100%;padding:1px 10px;border:0;background:none;color:#cfe3ff;text-align:left;cursor:pointer;font:inherit}
.code-view .cl:hover{background:#ffffff0d}.code-view .cl.on{background:#4cc9f022;box-shadow:inset 3px 0 0 var(--cyan)}.code-view .cl.mk{background:#f9c74f1f}
.code-view .ln{flex:none;width:30px;text-align:right;color:var(--dim)}.code-view code{white-space:pre;font:inherit}
.code-diff{overflow:auto;max-height:320px;background:#060b1d;border:1px solid var(--line);border-radius:10px;padding:6px 0;font-family:var(--f-mono);font-size:13px}
.code-diff .dl{display:flex;gap:8px;padding:0 10px}.code-diff .dl span{width:12px;flex:none;color:var(--dim)}.code-diff code{white-space:pre;font:inherit}
.code-diff .add{background:#90be6d22;color:#d6f5c3}.code-diff .del{background:#f25c7822;color:#ffc7d1;text-decoration:line-through}.code-diff .gap{color:var(--dim)}`;document.head.appendChild(st);}
})();
