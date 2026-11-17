/* 第11讲 游戏工坊 (v3) — WARM-UP 规则就是代码 / EXP-01 AI 写贪吃蛇 / EXP-01b 给贪吃蛇升级 / EXP-02 AI 写速算游戏 / EXP-02b 给速算游戏升级 / EXP-03 速算挑战（平台内置） / EXP-04 AI 自由发挥 / EXP-04b 我是总设计师 / QUIZ / DIARY */
(function(){
const {$,$$,esc,clamp}=App;const K='l11';const L={};App.lessons[K]=L;
const MODE={api:'平台 AI 接口',claude:'Claude 大模型',gpt:'GPT 大模型'};
const srcOf=m=>!m||m==='offline'?'离线示例（预置网页，示意）':(MODE[m]||m);
const cut=(s,n)=>{s=String(s||'').replace(/\s+/g,' ').trim();return s.length>n?s.slice(0,n)+'…':s;};
const clip=(s,n)=>String(s||'').trim().slice(0,n);
const tx=App.txtScore;
const bump=()=>{const l=App.lesson(K);l.nExp=(l.nExp||0)+1;};
Object.assign(App.HINTS||(App.HINTS={}),{'l11-crole':{s:['我的想法是','AI 做了','我还检查了'],ref:'我的想法是：场地上放石头，撞到就结束。AI 做了：把石头画出来，写出“撞到石头就结束”的代码。我还试玩检查了 AI 改得对不对。'}});
const MAXV=12;const more=h=>`<details class="more"><summary>说明</summary>${h}</details>`;

/* ================= preset games (real, working pages) ================= */
/* WARM-UP: a snake whose rules are a visible RULES object */
const RU0={speed:150,grid:16,grow:1,foods:1,wall:'end'};
function ruleHTML(R){const L_=[];const a=(...x)=>L_.push(...x);
 a('<!DOCTYPE html>','<html lang="zh-CN">','<head>','<meta charset="UTF-8">','<title>规则实验</title>','<style>',
  'body { margin: 0; padding: 8px; background: #0e1733; color: #e9eefc; font-family: sans-serif; text-align: center; }',
  'canvas { background: #111c3d; border: 2px solid #4cc9f0; border-radius: 6px; width: 250px; max-width: 88vw; }',
  '#msg { min-height: 20px; margin: 4px 0; font-size: 14px; }',
  '.pad { display: grid; grid-template-columns: repeat(3, 42px); gap: 4px; justify-content: center; }',
  '.pad button { padding: 5px 0; font-size: 15px; border: 0; border-radius: 6px; background: #2b3a72; color: #fff; }','</style>','</head>','<body>',
  '<canvas id="game" width="320" height="320"></canvas>','<div id="msg">按方向键（或下面的按钮）开始</div>',
  '<div class="pad"><span></span><button data-d="0,-1">↑</button><span></span><button data-d="-1,0">←</button><button data-d="0,1">↓</button><button data-d="1,0">→</button></div>',
  '<script>','// ====== 游戏规则：改这里的数字，游戏就会变 ======','const RULES = {',
  `  speed: ${R.speed},   // 每隔多少毫秒走一步：数字越小，小蛇越快`,
  `  grid: ${R.grid},     // 场地有 ${R.grid}×${R.grid} 个格子`,
  `  grow: ${R.grow},      // 吃到一个食物，身体变长几节`,
  `  foods: ${R.foods},     // 场地上同时有几个食物`,
  `  wall: "${R.wall}"   // 撞墙："end" 游戏结束，"wrap" 从另一边钻出来`,'};',
  '// ====== 下面的程序按照规则运行 ======',
  'const N = RULES.grid, SIZE = 320 / N;','const ctx = document.getElementById("game").getContext("2d");',
  'const mid = Math.floor(N / 2);','let snake = [{x: 3, y: mid}, {x: 2, y: mid}, {x: 1, y: mid}];',
  'let dir = {x: 1, y: 0}, foods = [], grow = 0, timer = null, over = false;','',
  '// 规则：食物随机出现在空格子里','function randomCell() {','  let p;','  do { p = {x: Math.floor(Math.random() * N), y: Math.floor(Math.random() * N)}; }',
  '  while (snake.some(s => s.x === p.x && s.y === p.y) || foods.some(f => f.x === p.x && f.y === p.y));','  return p;','}',
  'while (foods.length < RULES.foods) foods.push(randomCell());','',
  'function step() {','  const h = {x: snake[0].x + dir.x, y: snake[0].y + dir.y};','  if (RULES.wall === "wrap") { h.x = (h.x + N) % N; h.y = (h.y + N) % N; }',
  '  // 规则：撞到墙或自己，游戏结束','  if (h.x < 0 || h.x >= N || h.y < 0 || h.y >= N || snake.some(s => s.x === h.x && s.y === h.y)) {',
  '    clearInterval(timer); over = true;','    document.getElementById("msg").textContent = "游戏结束！长度 " + snake.length;','    return;','  }',
  '  snake.unshift(h);','  // 规则：吃到食物，身体变长','  const k = foods.findIndex(f => f.x === h.x && f.y === h.y);',
  '  if (k >= 0) { grow += RULES.grow; foods[k] = randomCell(); }','  if (grow > 0) grow--; else snake.pop();','  draw();','}','',
  'function draw() {','  ctx.clearRect(0, 0, 320, 320);','  ctx.fillStyle = "#f25c78";',
  '  foods.forEach(f => ctx.fillRect(f.x * SIZE + 2, f.y * SIZE + 2, SIZE - 4, SIZE - 4));','  snake.forEach((s, i) => {',
  '    ctx.fillStyle = i === 0 ? "#f9c74f" : "#90be6d";','    ctx.fillRect(s.x * SIZE + 1, s.y * SIZE + 1, SIZE - 2, SIZE - 2);','  });','}','',
  '// 规则：玩家用方向键控制移动方向','function go(x, y) {','  if (over || (x === -dir.x && y === -dir.y)) return;','  dir = {x: x, y: y};',
  '  if (!timer) { timer = setInterval(step, RULES.speed); document.getElementById("msg").textContent = ""; }','}',
  'const KEYS = {ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0]};',
  'document.addEventListener("keydown", e => { const d = KEYS[e.key]; if (d) { e.preventDefault(); go(d[0], d[1]); } });',
  'document.querySelectorAll(".pad button").forEach(b => b.onclick = () => { const d = b.dataset.d.split(","); go(+d[0], +d[1]); });',
  'draw();','</script>','</body>','</html>');return L_.join('\n');}

/* EXP-01: snake, assembled from the requirement cards the student has sent */
const TH={plain:{page:'#f2f2f2',field:'#ffffff',line:'#455a64',snake:'#43a047',head:'#1b5e20',fg:'#222222',food:'#e53935'},
 night:{page:'#0b1033',field:'#162056',line:'#4cc9f0',snake:'#7bdff2',head:'#f9c74f',fg:'#e9eefc',food:'#ff6b6b'},
 grass:{page:'#e8f5e9',field:'#a5d66f',line:'#4e7d2a',snake:'#1e5aa8',head:'#0d3b78',fg:'#1b3a10',food:'#d62828'},
 sand:{page:'#fff4dc',field:'#f3d9a4',line:'#b07d3a',snake:'#7a4a1d',head:'#4a2a0c',fg:'#5a3a12',food:'#2a9d8f'}};
const SN0={spd:'fast'};const SN_FULL={btn:1,keys:1,score:1,spd:'slow'};
function snakeHTML(F){F=F||SN0;const ui=F.ui,T=TH[ui?ui.bg:'plain']||TH.plain,M=new Set(F.mods||[]),sp=F.spd||'fast';
 const S0={fast:85,slow:180,ramp:150,select:130}[sp]||85;const story=M.has('story'),clock=M.has('clock'),rocks=M.has('rocks'),gold=M.has('gold'),wrap=M.has('wrap');
 const title=story?'小蛇回家':'贪吃蛇';const L_=[];const a=(...x)=>L_.push(...x);const pat=ui?ui.pat:'';
 a('<!DOCTYPE html>','<html lang="zh-CN">','<head>','<meta charset="UTF-8">','<meta name="viewport" content="width=device-width, initial-scale=1">',`<title>${title}</title>`,'<style>',
  `body { margin: 0; padding: 8px; background: ${T.page}; color: ${T.fg}; font-family: sans-serif; text-align: center; }`,
  'h1 { font-size: 20px; margin: 4px 0; }',
  `canvas { background: ${T.field}; border: 3px solid ${T.line}; border-radius: 6px; width: 280px; max-width: 90vw; }`,
  '.bar { display: flex; justify-content: center; align-items: center; gap: 8px; margin: 6px 0; flex-wrap: wrap; }');
 if(F.btn||F.keys)a(`button { font-size: 15px; padding: 6px 12px; border: 0; border-radius: 6px; background: ${T.line}; color: #fff; cursor: pointer; }`);
 if(F.keys)a('.pad { display: grid; grid-template-columns: repeat(3, 46px); gap: 4px; justify-content: center; margin-top: 4px; }');
 a('#msg { min-height: 22px; margin: 4px 0; font-weight: bold; }','</style>','</head>','<body>',`<h1>${title}</h1>`);
 if(story)a('<p style="margin:0;font-size:13px">帮小蛇收集 10 颗星星，它就能回家啦！</p>');
 const info=[];if(F.score)info.push('得分：<b id="score">0</b>','最高分：<b id="best">0</b>');if(story)info.push('星星：<b id="stars">0</b> / 10');if(clock)info.push('剩余：<b id="left">60</b> 秒');
 if(info.length)a(`<div class="bar">${info.join(' ')}</div>`);
 if(F.btn)a('<div class="bar">','  <button id="startBtn">开始游戏</button>','  <button id="pauseBtn">暂停游戏</button>','  <button id="restartBtn">重新开始</button>','</div>');
 if(sp==='select')a('<div class="bar">难度：<select id="level"><option value="200">简单</option><option value="130" selected>普通</option><option value="80">困难</option></select></div>');
 a('<canvas id="game" width="320" height="320"></canvas>','<div id="msg"></div>');
 if(F.keys)a('<div class="pad">','  <span></span><button data-d="up">↑</button><span></span>','  <button data-d="left">←</button><button data-d="down">↓</button><button data-d="right">→</button>','</div>');
 a('<script>','// 画布：16×16 个格子，每格 20 像素','const canvas = document.getElementById("game");','const ctx = canvas.getContext("2d");','const SIZE = 20, N = 16;',
  `let SPEED = ${S0};   // 每隔多少毫秒走一步（数字越小越快）`,'let snake, dir, nextDir, food, timer = null, running = false, over = false;');
 if(F.score)a('let score = 0, best = 0;');
 if(rocks)a('let rocks = [];   // 障碍物（石头）');
 if(gold)a('let gold = null;   // 金色食物');
 if(story)a('let stars = 0;    // 已经收集的星星');
 if(clock)a('let left = 60, clock = null;   // 限时 60 秒');
 a('','function msg(t) { document.getElementById("msg").textContent = t; }','','// 回到开始时的样子','function reset() {',
  '  snake = [{x: 8, y: 8}, {x: 7, y: 8}, {x: 6, y: 8}];','  dir = {x: 1, y: 0}; nextDir = dir; over = false;');
 if(sp==='ramp')a('  SPEED = 150;');
 if(F.score)a('  score = 0; document.getElementById("score").textContent = 0;');
 if(rocks)a('  rocks = [{x: 3, y: 3}, {x: 12, y: 3}, {x: 3, y: 12}, {x: 12, y: 12}, {x: 8, y: 13}];');
 if(story)a('  stars = 0; document.getElementById("stars").textContent = 0;');
 if(clock)a('  left = 60; document.getElementById("left").textContent = 60;');
 if(gold)a('  gold = null;');
 a('  food = randomCell();','  draw();','}','','// 找一个空格子放食物（随机出现）','function randomCell() {','  let p;','  do {',
  '    p = {x: Math.floor(Math.random() * N), y: Math.floor(Math.random() * N)};',
  `  } while (snake.some(s => s.x === p.x && s.y === p.y)${rocks?' || rocks.some(r => r.x === p.x && r.y === p.y)':''});`,'  return p;','}','',
  '// 小蛇走一步','function step() {','  dir = nextDir;','  const head = {x: snake[0].x + dir.x, y: snake[0].y + dir.y};');
 if(wrap)a('  // 穿墙：从一边出去，从另一边钻出来','  head.x = (head.x + N) % N; head.y = (head.y + N) % N;','  // 撞到自己：游戏结束','  if (snake.some(s => s.x === head.x && s.y === head.y)) { gameOver(); return; }');
 else a('  // 撞墙或撞到自己：游戏结束','  if (head.x < 0 || head.x >= N || head.y < 0 || head.y >= N || snake.some(s => s.x === head.x && s.y === head.y)) { gameOver(); return; }');
 if(rocks)a('  if (rocks.some(r => r.x === head.x && r.y === head.y)) { gameOver(); return; }   // 撞到石头');
 a('  snake.unshift(head);','  if (head.x === food.x && head.y === food.y) {   // 吃到食物：不去掉尾巴，身体变长');
 if(F.score)a('    score += 10; document.getElementById("score").textContent = score;');
 if(story)a('    stars++; document.getElementById("stars").textContent = stars;','    if (stars >= 10) { win(); return; }');
 a('    food = randomCell();');
 if(gold)a('    if (!gold && Math.random() < 0.3) gold = randomCell();   // 有时出现金色食物');
 if(sp==='ramp')a('    SPEED = Math.max(60, SPEED - 10);   // 每吃一个，速度快一点','    clearInterval(timer); timer = setInterval(step, SPEED);');
 if(gold){a('  } else if (gold && head.x === gold.x && head.y === gold.y) {   // 金色食物：一下长 3 节');if(F.score)a('    score += 30; document.getElementById("score").textContent = score;');
  a('    const tail = snake[snake.length - 1];','    snake.push({x: tail.x, y: tail.y}, {x: tail.x, y: tail.y});','    gold = null;');}
 a('  } else {','    snake.pop();   // 没吃到：尾巴跟着走，长度不变','  }','  draw();','}','','// 画出整个画面','function draw() {','  ctx.clearRect(0, 0, 320, 320);');
 if(rocks)a('  ctx.fillStyle = "#6d6d6d";','  rocks.forEach(r => ctx.fillRect(r.x * SIZE + 1, r.y * SIZE + 1, SIZE - 2, SIZE - 2));');
 if(story)a('  star(food.x * SIZE + 10, food.y * SIZE + 10);');
 else{const fr=ui&&ui.food==='big'?9:ui&&ui.food==='small'?4:7;a(`  ctx.fillStyle = "${T.food}";`,'  ctx.beginPath();',`  ctx.arc(food.x * SIZE + 10, food.y * SIZE + 10, ${fr}, 0, Math.PI * 2);`,'  ctx.fill();');
  if(ui&&ui.food==='big')a('  ctx.fillStyle = "#2e7d32"; ctx.fillRect(food.x * SIZE + 9, food.y * SIZE - 1, 3, 5);   // 苹果的叶子');}
 if(gold)a('  if (gold) {','    ctx.fillStyle = "#f9c74f"; ctx.beginPath();','    ctx.arc(gold.x * SIZE + 10, gold.y * SIZE + 10, 8, 0, Math.PI * 2); ctx.fill();','  }');
 a('  snake.forEach((s, i) => {');
 if(M.has('rainbow'))a(`    ctx.fillStyle = i === 0 ? "${T.head}" : "hsl(" + (i * 30 % 360) + ", 80%, 55%)";   // 彩虹蛇：每一节颜色不同`);
 else if(pat==='stripe')a(`    ctx.fillStyle = i === 0 ? "${T.head}" : (i % 2 ? "${T.snake}" : "#f9c74f");   // 条纹花纹`);
 else a(`    ctx.fillStyle = i === 0 ? "${T.head}" : "${T.snake}";`);
 if(pat==='grad')a('    ctx.globalAlpha = i === 0 ? 1 : 1 - i / (snake.length + 3);   // 由深到浅');
 a('    ctx.fillRect(s.x * SIZE + 1, s.y * SIZE + 1, SIZE - 2, SIZE - 2);');
 if(pat==='dot')a('    if (i > 0) { ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.arc(s.x * SIZE + 10, s.y * SIZE + 10, 3, 0, Math.PI * 2); ctx.fill(); }   // 圆点花纹');
 a('  });');if(pat==='grad')a('  ctx.globalAlpha = 1;');
 if(M.has('night'))a('  // 夜晚模式：只看得见小蛇头附近','  const hx = snake[0].x * SIZE + 10, hy = snake[0].y * SIZE + 10;','  const g = ctx.createRadialGradient(hx, hy, 30, hx, hy, 110);',
  '  g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(0,0,0,0.93)");','  ctx.fillStyle = g; ctx.fillRect(0, 0, 320, 320);');
 a('}');
 if(story)a('function star(x, y) {','  ctx.fillStyle = "#f9c74f"; ctx.beginPath();','  for (let i = 0; i < 10; i++) {','    const r = i % 2 ? 4 : 9, ang = Math.PI / 5 * i - Math.PI / 2;',
  '    ctx.lineTo(x + r * Math.cos(ang), y + r * Math.sin(ang));','  }','  ctx.closePath(); ctx.fill();','}');
 a('',`function stopAll() { clearInterval(timer);${clock?' clearInterval(clock);':''} running = false; }`,'function gameOver() {','  stopAll(); over = true;');
 if(F.score)a('  if (score > best) { best = score; document.getElementById("best").textContent = best; }');
 const again=F.btn?'点「重新开始」再玩一次':'';
 a(clock?`  msg((left <= 0 ? "时间到！" : "游戏结束！") + "${again}");`:`  msg("游戏结束！${again}");`,'}');
 if(story)a('function win() { stopAll(); over = true; draw(); msg("收集了 10 颗星星，小蛇回到家啦！"); }');
 a('function start() {','  if (running || over) return;','  running = true; msg("");','  timer = setInterval(step, SPEED);');
 if(clock)a('  clock = setInterval(() => {','    left--; document.getElementById("left").textContent = left;','    if (left <= 0) gameOver();','  }, 1000);');
 a('}');
 if(F.btn)a('function pause() {','  if (!running) return;','  stopAll(); msg("已暂停，点「开始游戏」继续");','}',
  'document.getElementById("startBtn").onclick = start;','document.getElementById("pauseBtn").onclick = pause;','document.getElementById("restartBtn").onclick = () => { stopAll(); reset(); start(); };');
 if(sp==='select')a('document.getElementById("level").onchange = e => {','  SPEED = Number(e.target.value);','  if (running) { clearInterval(timer); timer = setInterval(step, SPEED); }','  e.target.blur();','};');
 a('','// 方向键控制小蛇',`const DIRS = {ArrowUp: {x: 0, y: -1}, ArrowDown: {x: 0, y: 1}, ArrowLeft: {x: -1, y: 0}, ArrowRight: {x: 1, y: 0}${F.keys?', w: {x: 0, y: -1}, s: {x: 0, y: 1}, a: {x: -1, y: 0}, d: {x: 1, y: 0}':''}};`,'function turn(d) {');
 if(F.keys||F.nr)a('  if (d.x === -dir.x && d.y === -dir.y) return;   // 不能直接掉头');
 a('  nextDir = d;','}','document.addEventListener("keydown", e => {','  const d = DIRS[e.key];','  if (d) { e.preventDefault(); turn(d); }');
 if(F.btn)a('  if (e.key === " ") { e.preventDefault(); running ? pause() : start(); }   // 空格：暂停 / 继续');
 a('});');
 if(F.keys)a('const PAD = {up: DIRS.ArrowUp, down: DIRS.ArrowDown, left: DIRS.ArrowLeft, right: DIRS.ArrowRight};','document.querySelectorAll(".pad button").forEach(b => b.onclick = () => turn(PAD[b.dataset.d]));');
 if(F.btn)a('','reset();','msg("点「开始游戏」开始");');else a('','reset();','start();   // 打开网页就开始');
 a('</script>','</body>','</html>');return L_.join('\n');}

/* EXP-02: quick-maths game, assembled from cards (v1 has real bugs: too-hard questions, non-integer division, a timer that speeds up) */
const MT={plain:{bg:'#ffffff',card:'#f1f3f6',fg:'#222222',acc:'#1565c0'},blue:{bg:'#0d1b3d',card:'#16295c',fg:'#eaf2ff',acc:'#2f80ed'},orange:{bg:'#fff3e0',card:'#ffe0b2',fg:'#4e2a00',acc:'#ef6c00'},green:{bg:'#e8f5e9',card:'#c8e6c9',fg:'#1b3a1b',acc:'#2e7d32'}};
const MA0={tm:'bug'};
const GEN={4:{'+':'a = rand(10, 99); b = rand(10, 99); ans = a + b;','-':'a = rand(20, 99); b = rand(10, a); ans = a - b;','×':'a = rand(11, 49); b = [2, 3, 4, 5, 20, 30][rand(0, 5)]; ans = a * b;','÷':'b = rand(2, 9); ans = rand(11, 99); a = b * ans;'},
 5:{'+':'a = rand(11, 99) / 10; b = rand(11, 99) / 10; ans = Math.round((a + b) * 10) / 10;','-':'a = rand(50, 99) / 10; b = rand(11, 49) / 10; ans = Math.round((a - b) * 10) / 10;','×':'a = rand(11, 39); b = rand(11, 19); ans = a * b;','÷':'b = rand(11, 25); ans = rand(3, 30); a = b * ans;'},
 6:{'+':'a = rand(100, 999); b = rand(100, 999); ans = a + b;','-':'a = rand(500, 999); b = rand(100, a); ans = a - b;','×':'a = [25, 125, 50][rand(0, 2)]; b = a === 125 ? 8 * rand(1, 9) : 4 * rand(2, 9); ans = a * b;','÷':'b = rand(12, 35); ans = rand(12, 40); a = b * ans;'}};
const OPS={mix:['+','-','×','÷'],add:['+','-'],mul:['×','÷']};
function mathHTML(F){F=F||MA0;const T=MT[F.ui?F.ui.c:'plain']||MT.plain,Q=F.qs,big=!!(F.ui&&F.ui.big==='1'),fin=!!Q,ok=F.tm==='ok';const L_=[];const a=(...x)=>L_.push(...x);
 a('<!DOCTYPE html>','<html lang="zh-CN">','<head>','<meta charset="UTF-8">','<meta name="viewport" content="width=device-width, initial-scale=1">','<title>速算游戏</title>','<style>',
  `body { margin: 0; padding: 10px; background: ${T.bg}; color: ${T.fg}; font-family: sans-serif; text-align: center; }`,'h1 { font-size: 22px; margin: 4px 0; }',
  `.card { background: ${T.card}; border-radius: 12px; padding: 12px; margin: 8px auto; max-width: 340px; }`,'.info { display: flex; justify-content: space-around; font-size: 15px; }',
  `#q { font-size: ${big?42:28}px; font-weight: bold; margin: 10px 0;${big?' font-family: monospace; letter-spacing: 2px;':''} }`,
  'input { font-size: 20px; width: 110px; padding: 4px; text-align: center; }',
  `button { font-size: 16px; padding: 6px 12px; margin: 3px; border: 0; border-radius: 6px; background: ${T.acc}; color: #fff; cursor: pointer; }`,
  'ol { text-align: left; margin: 4px 0; padding-left: 26px; font-size: 14px; }','</style>','</head>','<body>',
  `<h1>速算${F.btn||fin?'挑战':'小游戏'}</h1>`,'<div class="card">',
  `  <div class="info"><span>得分：<b id="score">0</b></span>${fin?`<span>第 <b id="no">0</b> / ${Q.n} 题</span>`:''}<span>用时：<b id="time">00:00</b></span></div>`,
  '  <div id="q">?</div>','  <input id="ans" inputmode="decimal" autocomplete="off"> <button id="okBtn">提交</button>','  <div id="msg"></div>','</div>');
 if(F.btn)a('<div>','  <button id="startBtn">开始挑战</button>','  <button id="pauseBtn">暂停挑战</button>','  <button id="restartBtn">重新开始</button>','</div>');
 if(F.rank)a('<div class="card"><b>排行榜</b><ol id="rank"></ol></div>');
 if(F.wrong)a('<div class="card"><b>错题记录</b><ol id="wrongList"></ol></div>');
 a('<script>');if(fin)a(`const TOTAL = ${Q.n};   // 一共几道题`);
 a('let score = 0, sec = 0, cur = null, timer = null;');if(fin)a('let no = 0;');
 if(F.wrong)a('let wrongs = [];   // 做错的题');if(F.rank)a('const history = [];   // 排行榜：每一局的成绩');
 a('const $ = id => document.getElementById(id);','function rand(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }',
  'function fmt(s) { return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0"); }','function msg(t) { $("msg").textContent = t; }','','// 随机出一道题','function makeQuestion() {');
 if(!Q)a('  const ops = ["+", "-", "×", "÷"];','  const op = ops[rand(0, 3)];','  const a = rand(10, 999), b = rand(2, 99);',
  '  const ans = op === "+" ? a + b : op === "-" ? a - b : op === "×" ? a * b : a / b;','  return {text: a + " " + op + " " + b + " = ?", ans: ans};');
 else{const ops=OPS[Q.tp]||OPS.mix,G=GEN[Q.g]||GEN[4];a(`  const ops = [${ops.map(o=>`"${o}"`).join(', ')}];   // ${({4:'四',5:'五',6:'六'})[Q.g]||'四'}年级难度`,'  const t = ops[rand(0, ops.length - 1)];','  let a, b, ans;');
  ops.forEach(o=>a(`  if (t === "${o}") { ${G[o]} }`));a('  return {text: a + " " + t + " " + b + " = ?", ans: ans};');}
 a('}','','// 出下一题','function next() {');
 if(!ok)a('  timer = setInterval(tick, 1000);   // 开始计时');
 if(fin)a('  if (no >= TOTAL) { finish(); return; }','  no++; $("no").textContent = no;');
 a('  cur = makeQuestion();','  $("q").textContent = cur.text;','  $("ans").value = "";','  $("ans").focus();','}','',
  'function tick() { sec++; $("time").textContent = fmt(sec); }','','// 检查答案','function check() {',`  if (!cur${F.btn?' || !timer':''}) return;`,'  const v = Number($("ans").value);',
  '  if (v === cur.ans) { score += 10; msg("答对了！"); }','  else {','    msg("答错了，正确答案是 " + cur.ans);');
 if(F.wrong)a('    wrongs.push(cur.text.replace("?", cur.ans) + "（你写的是 " + ($("ans").value || "空") + "）");');
 a('  }','  $("score").textContent = score;','  next();','}');
 if(fin){a('','// 挑战结束','function finish() {','  clearInterval(timer); timer = null; cur = null;','  $("q").textContent = "挑战完成！";','  msg("答对 " + score / 10 + " 题，用时 " + fmt(sec));');
  if(F.rank)a('  history.push({score: score, sec: sec});','  history.sort((x, y) => y.score - x.score || x.sec - y.sec);   // 分数高的在前，同分时用时少的在前',
   '  $("rank").innerHTML = history.slice(0, 5).map(h => "<li>" + h.score + " 分，用时 " + fmt(h.sec) + "</li>").join("");');
  if(F.wrong)a('  $("wrongList").innerHTML = wrongs.length ? wrongs.map(w => "<li>" + w + "</li>").join("") : "<li>全部答对，没有错题！</li>";');
  a('}');}
 if(F.btn){a('','function start() {','  if (timer) return;   // 已经在计时了');if(fin)a('  if (no >= TOTAL) return;   // 做完了，点「重新开始」');
  a('  msg("");',ok?'  if (!cur) next();':'  if (!cur) next();',ok?'  timer = setInterval(tick, 1000);   // 整场只用一个计时器':'  else timer = setInterval(tick, 1000);','}',
   'function pause() { clearInterval(timer); timer = null; msg("已暂停，点「开始挑战」继续"); }',
   'function restart() {','  clearInterval(timer); timer = null; cur = null;',`  score = 0; sec = 0;${fin?' no = 0;':''}${F.wrong?' wrongs = [];':''}`,
   '  $("score").textContent = 0; $("time").textContent = "00:00";'+(fin?' $("no").textContent = 0;':''),'  start();','}',
   '$("startBtn").onclick = start;','$("pauseBtn").onclick = pause;','$("restartBtn").onclick = restart;');}
 a('$("okBtn").onclick = check;','$("ans").addEventListener("keydown", e => { if (e.key === "Enter") check(); });');
 if(F.btn)a('$("q").textContent = "点「开始挑战」开始";');else{a('next();   // 打开网页就出题');if(ok)a('timer = setInterval(tick, 1000);');}
 a('</script>','</body>','</html>');return L_.join('\n');}

/* EXP-04: what the AI produces when asked for "a fun new game" with no human idea: a classic */
const WHACK=`<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>打地鼠</title>
<style>
body { margin: 0; padding: 10px; background: #f1f8e9; color: #33691e; font-family: sans-serif; text-align: center; }
.grid { display: grid; grid-template-columns: repeat(3, 76px); gap: 10px; justify-content: center; margin: 10px; }
.hole { width: 76px; height: 76px; border-radius: 50%; background: #6d4c41; border: 0; color: #fff; font-size: 26px; cursor: pointer; }
.hole.up { background: #bcaaa4; color: #4e342e; }
#go { font-size: 16px; padding: 6px 14px; border: 0; border-radius: 6px; background: #558b2f; color: #fff; }
</style>
</head>
<body>
<h1>打地鼠</h1>
<p>得分：<b id="score">0</b>　剩余：<b id="left">30</b> 秒</p>
<button id="go">开始游戏</button>
<div class="grid" id="grid"></div>
<p id="msg"></p>
<script>
// 9 个地洞，地鼠随机从一个洞里冒出来
const grid = document.getElementById("grid");
let score = 0, left = 30, mole = -1, t1 = null, t2 = null;
for (let i = 0; i < 9; i++) {
  const b = document.createElement("button");
  b.className = "hole";
  b.onclick = () => hit(i);
  grid.appendChild(b);
}
const holes = grid.children;
function hide() { if (mole >= 0) { holes[mole].classList.remove("up"); holes[mole].textContent = ""; } mole = -1; }
function show() { hide(); mole = Math.floor(Math.random() * 9); holes[mole].classList.add("up"); holes[mole].textContent = "鼠"; }
// 打中地鼠加 10 分
function hit(i) { if (!t1 || i !== mole) return; score += 10; document.getElementById("score").textContent = score; hide(); }
function start() {
  if (t1) return;
  score = 0; left = 30; document.getElementById("score").textContent = 0;
  t1 = setInterval(show, 800);
  t2 = setInterval(() => {
    left--; document.getElementById("left").textContent = left;
    if (left <= 0) { clearInterval(t1); clearInterval(t2); t1 = null; hide(); document.getElementById("msg").textContent = "时间到！得分 " + score; }
  }, 1000);
}
document.getElementById("go").onclick = start;
</script>
</body>
</html>`;

/* ================= cards ================= */
const BGN={night:'夜空蓝',grass:'草地绿',sand:'沙漠黄'},PATN={stripe:'黄色条纹',dot:'白色圆点',grad:'由深到浅的渐变'},FOODN={big:'大一点的红苹果',small:'小小的豆子'};
const SN_CARDS=[
 {id:'btn',t:'开始 / 暂停 / 重新开始',d:'设置游戏按钮',text:()=>'设置“开始游戏”“暂停游戏”“重新开始”三个按钮，打开网页时小蛇先不要动，点“开始游戏”才开始。'},
 {id:'keys',t:'方向键控制',d:'键盘方向键 + 屏幕按钮',text:()=>'设置方向键来改变小蛇的移动方向，按反方向键时不能直接掉头；画面下方再放上、下、左、右四个按钮，方便在平板上玩。'},
 {id:'ui',t:'界面细节',d:'界面颜色、小蛇花纹、食物大小',opts:[{k:'bg',l:'界面颜色',ch:[['grass','草地绿'],['night','夜空蓝'],['sand','沙漠黄']]},{k:'pat',l:'小蛇花纹',ch:[['stripe','黄色条纹'],['dot','白色圆点'],['grad','由深到浅']]},{k:'food',l:'食物大小',ch:[['big','大一点的红苹果'],['small','小小的豆子']]}],
  text:o=>`游戏界面用${BGN[o.bg]}色调，小蛇身上有${PATN[o.pat]}，食物画成${FOODN[o.food]}。`},
 {id:'score',t:'显示得分',d:'当前得分和最高分',text:()=>'在画面上方显示当前得分和最高分，吃到一个食物加 10 分。'},
 {id:'diff',t:'调整难度',d:'改变小蛇的移动速度',opts:[{k:'s',l:'怎么调',ch:[['slow','降低难度：速度慢一些'],['ramp','越玩越难：吃一个快一点'],['select','加难度选择：简单/普通/困难']]}],
  text:o=>({slow:'降低游戏难度：把小蛇的移动速度调慢一些，大约每 0.18 秒走一步。',ramp:'提高游戏难度：开始时慢一点，每吃到一个食物，小蛇就变快一点。',select:'增加难度选择：简单、普通、困难三档，难度越高小蛇越快。'})[o.s]},
 {id:'fix',t:'修复规则问题',d:'把试玩发现的问题说清楚',opts:[{k:'b',l:'发现的问题',ch:[['turn','按反方向键会直接撞死自己'],['wall','撞墙后游戏没有结束'],['grow','吃到食物身体没有变长']]}],
  text:o=>({turn:'修复问题：现在按反方向键，小蛇会直接掉头撞到自己而结束，请改成不能直接掉头。',wall:'修复问题：现在小蛇撞到墙后游戏没有结束，请改成撞墙就结束，并提示“游戏结束”。',grow:'修复问题：现在小蛇吃到食物后身体没有变长，请改成每吃一个食物变长一节。'})[o.b]}];
const GN={4:'四',5:'五',6:'六'},TPN={mix:'加减乘除混合',add:'加减法',mul:'乘除法'},MCN={blue:'深蓝色',orange:'橙色',green:'清新的绿色'};
const MA_CARDS=[
 {id:'btn',t:'开始 / 暂停 / 重新开始',d:'设置挑战按钮',text:()=>'设置“开始挑战”“暂停挑战”“重新开始”三个按钮。'},
 {id:'qs',t:'题目数量、难度和类型',d:'如：10 道四年级速算题',opts:[{k:'n',l:'数量',ch:[['10','10 道'],['5','5 道'],['20','20 道']]},{k:'g',l:'年级',ch:[['4','四年级'],['5','五年级'],['6','六年级']]},{k:'tp',l:'类型',ch:[['mix','加减乘除混合'],['add','加减法'],['mul','乘除法']]}],
  text:o=>`生成 ${o.n} 道适合小学${GN[o.g]}年级学生的速算题（${TPN[o.tp]}），答案都是整数或一位小数。`},
 {id:'tm',t:'随机出题，计时计分',d:'答对加分，计时准确',text:()=>'随机出题，并设置计时和计分功能：答对一题加 10 分；整场挑战只用一个计时器，暂停时停止计时。'},
 {id:'ui',t:'界面颜色和数字样式',d:'颜色、数字和符号的样式',opts:[{k:'c',l:'界面颜色',ch:[['blue','深蓝'],['orange','活力橙'],['green','清新绿']]},{k:'big',l:'数字和符号',ch:[['1','大号等宽数字'],['0','普通大小']]}],
  text:o=>`游戏界面用${MCN[o.c]}，${o.big==='1'?'题目里的数字和符号用大号等宽字体，看得更清楚':'题目文字用普通大小'}。`},
 {id:'n20',t:'题目数量改为 20 道',d:'看看 AI 改对了没有',text:()=>'把题目数量改为 20 道。'},
 {id:'rank',t:'排行榜',d:'记录历史分数并排序',text:()=>'添加排行榜功能，记录历史分数并排序。'},
 {id:'wrong',t:'错题记录',d:'记下做错的题',text:()=>'添加错题记录功能：挑战结束后列出做错的题、我的答案和正确答案。'}];
const cardOpts=(c,sel)=>{const o={};(c.opts||[]).forEach(p=>o[p.k]=p.ch[0][0]);return Object.assign(o,sel||{});};

/* ---------- offline "AI": apply what the prompt asks for, as far as the presets know ---------- */
const MODS=[['wrap',/穿墙|穿过墙|另一边/,'穿墙'],['rocks',/障碍|石头|墙块|砖块/,'障碍物'],['gold',/金|奖励|双倍|加倍|特殊食物|宝石/,'金色食物'],['night',/夜|黑暗|手电|看不见|迷雾|灯光/,'夜晚模式'],
 ['rainbow',/彩虹|变色|七彩|颜色不同/,'彩虹蛇'],['story',/星星|回家|故事|剧情|关卡|通关/,'收集星星回家'],['clock',/限时|倒计时|\d+\s*秒内|计时/,'限时 60 秒']];
const MODN=Object.fromEntries(MODS.map(m=>[m[0],m[2]]));
function snOffline(prev,cards,text,first){const f=JSON.parse(JSON.stringify(first?SN0:(prev||SN0)));f.mods=f.mods||[];const did=[],same=[];
 const has=id=>cards.some(c=>c.id===id);const opt=id=>(cards.find(c=>c.id===id)||{}).o||{};const t=String(text||'');
 const set=(k,v,n)=>{if(JSON.stringify(f[k])===JSON.stringify(v)){same.push(n);return;}f[k]=v;did.push(n);};
 if(has('btn')||/按钮|暂停|重新开始/.test(t))set('btn',1,'开始/暂停/重新开始按钮');
 if(has('keys')||/方向键|掉头|上下左右/.test(t))set('keys',1,'方向键控制和屏幕方向按钮');
 if(has('ui')||/颜色|色调|花纹|食物.{0,4}(大|小)|界面/.test(t)){const o=has('ui')?opt('ui'):{bg:/蓝|夜/.test(t)?'night':/黄|沙/.test(t)?'sand':'grass',pat:/圆点|点点/.test(t)?'dot':/渐变|深到浅/.test(t)?'grad':'stripe',food:/小/.test(t)&&!/大/.test(t)?'small':'big'};set('ui',{bg:o.bg,pat:o.pat,food:o.food},'界面细节（'+[BGN[o.bg],PATN[o.pat],FOODN[o.food]].join('、')+'）');}
 if(has('score')||/得分|分数|计分/.test(t))set('score',1,'得分和最高分');
 if(has('diff')||/难度|速度|慢|快/.test(t)){const s=has('diff')?opt('diff').s:/选择|简单|困难/.test(t)?'select':/越来越快|变快|提高/.test(t)?'ramp':'slow';set('spd',s,({slow:'速度调慢',ramp:'越玩越快',select:'难度选择'})[s]);}
 if(has('fix')||(/撞死/.test(t)&&!has('keys'))){const b=has('fix')?opt('fix').b:'turn';if(b==='turn'){if(f.nr||f.keys)same.push('不能直接掉头');else{f.nr=1;did.push('不能直接掉头');}}else same.push(b==='wall'?'撞墙结束':'吃到变长');}
 MODS.forEach(([k,re,n])=>{if(re.test(t)&&!(k==='clock'&&/计时和计分/.test(t))){if(f.mods.includes(k))same.push(n);else{f.mods.push(k);did.push(n);}}});
 if(!f.mods.length)delete f.mods;
 if(first)return {f,did,same};
 return did.length?{f,did,same}:{f:null,did,same};}
function maOffline(prev,cards,text,first){const f=JSON.parse(JSON.stringify(first?MA0:(prev||MA0)));const did=[],same=[];
 const has=id=>cards.some(c=>c.id===id);const opt=id=>(cards.find(c=>c.id===id)||{}).o||{};const t=String(text||'');
 const set=(k,v,n)=>{if(JSON.stringify(f[k])===JSON.stringify(v)){same.push(n);return;}f[k]=v;did.push(n);};
 if(has('btn')||/按钮|暂停/.test(t))set('btn',1,'开始/暂停/重新开始按钮');
 const nm=/(\d{1,2})\s*道/.exec(t),gm=/([四五六])\s*年级/.exec(t);
 if(has('qs')||(!has('n20')&&(nm||gm))){const o=has('qs')?opt('qs'):{n:nm?nm[1]:'10',g:gm?({'四':'4','五':'5','六':'6'})[gm[1]]:'4',tp:/加减/.test(t)?'add':/乘除/.test(t)?'mul':'mix'};set('qs',{n:Math.min(30,Math.max(3,+o.n||10)),g:+o.g||4,tp:o.tp||'mix'},`${o.n} 道${GN[o.g]||'四'}年级题（${TPN[o.tp]||TPN.mix}）`);}
 if(has('tm')||/计时|计分/.test(t))set('tm','ok','计时只用一个计时器、计分');
 if(has('ui')||/颜色|字体|样式/.test(t)){const o=has('ui')?opt('ui'):{c:/橙/.test(t)?'orange':/绿/.test(t)?'green':'blue',big:/大/.test(t)?'1':'0'};set('ui',{c:o.c,big:o.big},'界面颜色和数字样式');}
 if(has('n20')){const q=f.qs||{g:4,tp:'mix'};set('qs',Object.assign({},q,{n:20}),'题目改为 20 道');}
 const needQ=n=>{if(!f.qs){f.qs={n:10,g:4,tp:'mix'};did.push(`AI 自动补上“共 10 道题”（${n}要在一局结束时才能记录）`);}};
 if(has('rank')||/排行/.test(t)){if(!f.rank){needQ('排行榜');f.rank=1;did.push('排行榜');}else same.push('排行榜');}
 if(has('wrong')||/错题/.test(t)){if(!f.wrong){needQ('错题记录');f.wrong=1;did.push('错题记录');}else same.push('错题记录');}
 if(first)return {f,did,same};
 return did.length?{f,did,same}:{f:null,did,same};}
function crOffline(prev,cards,text,first,own){text=own!=null?own:text;const f=JSON.parse(JSON.stringify(prev||SN_FULL));f.mods=f.mods||[];const did=[],same=[];const t=String(text||'');
 MODS.forEach(([k,re,n])=>{if(re.test(t)){if(f.mods.includes(k))same.push(n);else{f.mods.push(k);did.push(n);}}});
 return did.length?{f,did,same}:{f:null,did,same};}

/* ---------- reading code: requirement checks computed from the page source ---------- */
const btnHas=(s,re)=>new RegExp('<button[^>]*>[^<]*('+re+')','i').test(s)||new RegExp('["\'`][^"\'`\\n]{0,8}('+re+')[^"\'`\\n]{0,8}["\'`]').test(s);
function speedOf(s){s=String(s||'');const m=/setInterval\(\s*[\w.]+\s*,\s*([\w.]+)\s*\)/.exec(s)||/setTimeout\(\s*[\w.]+\s*,\s*([\w.]+)\s*\)/.exec(s);
 if(m){if(/^\d+$/.test(m[1]))return +m[1];const v=new RegExp('(?:const|let|var)\\s+'+m[1].replace(/\./g,'\\.')+'\\s*=\\s*(\\d{2,4})').exec(s)||new RegExp('\\b'+m[1].split('.').pop()+'\\s*[:=]\\s*(\\d{2,4})').exec(s);if(v)return +v[1];}
 const g=/\b(speed|SPEED|interval|delay|gameSpeed|moveDelay)\s*[:=]\s*(\d{2,4})/.exec(s);return g?+g[2]:null;}
const colorsOf=s=>new Set((String(s||'').match(/#[0-9a-f]{6}\b|#[0-9a-f]{3}\b|rgba?\([^)]*\)|hsl\(/gi)||[]).map(x=>x.toLowerCase())).size;
function snChecks(h){const s=String(h||'');const sp=speedOf(s);
 return [{l:'开始按钮',ok:btnHas(s,'开始')},{l:'暂停按钮',ok:btnHas(s,'暂停')},{l:'重新开始',ok:btnHas(s,'重新开始|再来一[次局]|重玩')},
  {l:'方向键',ok:/Arrow(Up|Down|Left|Right)|keyCode\s*===?\s*(3[7-9]|40)/.test(s)},{l:'得分',ok:/得分|分数|score/i.test(s)},
  {l:sp?`速度：每 ${sp} 毫秒一步`:'速度：代码里没找到',ok:!!sp,info:1}];}
function countOf(s){const m=/(?:TOTAL|total|COUNT|count|questionCount|numQuestions|QUESTION_COUNT|题目数量)\s*[:=]\s*(\d{1,3})\b/.exec(s)||/共\s*(\d{1,3})\s*[道题]/.exec(s)||/\/\s*(\d{1,3})\s*题/.exec(s);return m?+m[1]:null;}
function maChecks(h){const s=String(h||'');const n=countOf(s);const si=(s.match(/setInterval\s*\(/g)||[]).length,ci=(s.match(/clearInterval\s*\(/g)||[]).length;
 const leak=/function\s+\w*(next|Next|question|Question|出题)\w*\s*\([^)]*\)\s*\{[^}]*setInterval/.test(s)||(si>0&&ci===0);
 const rows=[{l:'开始挑战',ok:btnHas(s,'开始')},{l:'暂停挑战',ok:btnHas(s,'暂停')},{l:'重新开始',ok:btnHas(s,'重新开始|再来|重玩')},
  {l:'计时',ok:/setInterval|Date\.now|performance\.now/.test(s)&&/用时|计时|时间|秒/.test(s)},{l:'计分',ok:/得分|分数|score/i.test(s)},
  {l:n?`题目数量：${n} 道`:'题目数量：没有限制',ok:!!n,info:1},{l:'排行榜',ok:/排行榜|leaderboard|ranking/i.test(s)},{l:'错题记录',ok:/错题/.test(s)}];
 if(leak)rows.push({l:'可能的问题：每出一题都新开一个计时器，旧的没有停',warn:1});return rows;}

/* ---------- timer probe: compare the game's clock with real time ---------- */
function clockOf(txt){const t=String(txt||'');let m=/(?:用时|时间|计时)[：:\s]*(\d{1,2}):(\d{2})(?::(\d{2}))?/.exec(t)||/\b(\d{1,2}):(\d{2})(?::(\d{2}))?\b/.exec(t);
 if(m)return m[3]!=null?(+m[1])*60+(+m[2])+(+m[3])/100:(+m[1])*60+(+m[2]);m=/(?:用时|时间|计时)[：:\s]*(\d+(?:\.\d+)?)\s*秒/.exec(t);return m?+m[1]:null;}

/* ================= sandbox player ================= */
const GUARD=`<script>(function(){var K={ArrowUp:1,ArrowDown:1,ArrowLeft:1,ArrowRight:1," ":1,Spacebar:1};
addEventListener("keydown",function(e){var t=e.target&&e.target.tagName;if(K[e.key]&&!/INPUT|TEXTAREA|SELECT/.test(t)&&!(e.key===" "&&t==="BUTTON"))e.preventDefault();},true);
addEventListener("pointerdown",function(){try{window.focus();}catch(x){}},true);
function rep(){try{var b=document.body;if(!b)return;parent.postMessage({l11p:1,t:performance.now(),tx:(b.innerText||"").slice(0,2000)},"*");}catch(x){}}
setInterval(rep,500);addEventListener("load",rep);})();</script>`;
const inject=h=>{h=String(h||'');const i=h.toLowerCase().lastIndexOf('</body>');return i>=0?h.slice(0,i)+GUARD+h.slice(i):h+GUARD;};
const PROBES=new Map();
window.addEventListener('message',e=>{const d=e.data;if(!d||!d.l11p)return;for(const [f,fn] of PROBES){if(!f.isConnected){PROBES.delete(f);continue;}if(f.contentWindow===e.source){try{fn(d);}catch(x){}break;}}});
const PLAYS=new Set();
/* the "stage" of a station: the game only starts when the student clicks, then the frame gets keyboard focus and nothing runs in the background */
function player(box,html,{height=440,onProbe,label='点这里开玩',hint='方向键或屏幕按钮操作'}={}){
 box.innerHTML=`<div class="l11-play" style="height:${height}px"></div><div class="l11-pbar"><span class="note">沙盒试玩 · 不联网、不存数据</span><button type="button" class="btn ghost sm" data-re hidden>再玩一次</button></div>`;
 const pl=$('.l11-play',box),re=$('[data-re]',box);
 const cover=()=>{pl.innerHTML=`<button type="button" class="l11-cover"><b>${esc(label)}</b><span>${esc(hint)}</span></button>`;re.hidden=true;$('.l11-cover',pl).onclick=load;};
 const load=()=>{pl.innerHTML='';const f=App.Code.preview(pl,inject(html),{height,title:'游戏试玩（沙盒）'});re.hidden=false;
  f.addEventListener('load',()=>{try{f.focus();f.contentWindow.focus();}catch(e){}});if(onProbe)PROBES.set(f,onProbe);if(P.onLoad)P.onLoad();};
 const P={cover,load,box,onLoad:null};re.onclick=load;cover();PLAYS.add(P);return P;}
const sleepPlays=()=>{PLAYS.forEach(P=>{if(!P.box.isConnected){PLAYS.delete(P);return;}if($('iframe',P.box))P.cover();});};
const emptyStage=(box,h,t)=>{box.innerHTML=`<div class="l11-empty" style="height:${h}px">${t}</div>`;};

/* offline: "stream" the preset code line by line so students see the same process as with a real AI */
function fakeStream(html,on,signal){return new Promise((res,rej)=>{const ls=html.split('\n');let i=0,tm=0;const per=Math.max(2,Math.ceil(ls.length/26));
 const ab=()=>{clearTimeout(tm);rej({code:'cancelled'});};if(signal){if(signal.aborted)return ab();signal.addEventListener('abort',ab,{once:true});}
 const step=()=>{i=Math.min(ls.length,i+per);on(ls.slice(0,i).join('\n'));if(i>=ls.length){if(signal)signal.removeEventListener('abort',ab);res();}else tm=setTimeout(step,50+Math.random()*45);};tm=setTimeout(step,450);});}

/* ================= version store + one generation (prompt → AI or offline preset → new version) ================= */
const CTLS=new Set(),TIMERS=new Set();
function makeGen(o){const W={o,cur:-1,busy:false,cache:[]};
 W.rec=()=>{const l=App.lesson(K);return l[o.key]||(l[o.key]={});};
 W.vers=()=>{const r=W.rec();return r.vers||(r.vers=[]);};
 W.lastF=()=>{const v=[...W.vers()].reverse().find(x=>x.f);return v?v.f:null;};
 W.htmlOf=i=>{if(W.cache[i]!=null)return W.cache[i];const v=W.vers()[i];if(!v)return null;if(v.f)return W.cache[i]=o.tpl(v.f);
  const my=App.lesson(K).my;if(my&&my.from===o.key&&my.i===i&&my.html)return W.cache[i]=my.html;return null;};
 W.idx=()=>{const n=W.vers().length;return W.cur>=0&&W.cur<n?W.cur:n-1;};
 W.latest=()=>{const vs=W.vers();for(let i=vs.length-1;i>=0;i--){const h=W.htmlOf(i);if(h!=null)return {i,h};}return null;};
 /* a = {text, say?, cards:[{id,o}], first, own, stream(html)} → {stop} | {none:{did,same}} | {i,v,html,base,did,mode,same} */
 W.run=async a=>{if(W.busy)return {stop:1};W.busy=true;const cards=a.cards||[],own=a.own||'';const lt=W.latest();
  const base=a.first?'':((lt?lt.h:(o.base0?o.base0():''))||'');
  const ctl=new AbortController();CTLS.add(ctl);const t0=performance.now();let res=null,html='',f=null,mode='offline',did=null;
  const end=x=>{CTLS.delete(ctl);W.busy=false;return x;};
  try{res=await App.Code.generate(a.text,{signal:ctl.signal,base,kind:o.kind||'网页小游戏',onText:({html:h})=>a.stream(h)});}
  catch(e){if((e&&e.code==='cancelled')||ctl.signal.aborted)return end({stop:1});App.AI.fail(e);App.toast(App.AI.errText(e));res=null;}
  if(res&&res.html&&/<(canvas|button|div|body|script)[\s>]/i.test(res.html)){html=res.html;mode=res.mode||App.AI.mode();}
  else{if(res)App.toast('AI 这次没有给出完整的网页代码，改用离线示例。');
   const prevF=a.first?null:(o.prevF?o.prevF():W.lastF());const r=o.offline(prevF,cards,a.off!=null?a.off:'',!!a.first,own);
   if(!r||!r.f)return end({none:r||{did:[],same:[]}});
   f=r.f;did=r;html=o.tpl(f);try{await fakeStream(html,a.stream,ctl.signal);}catch(e){return end({stop:1});}}
  const ms=Math.round(performance.now()-t0);
  const v={p:clip(a.say||a.text,300),c:cards.map(c=>c.id),e:own?1:0,f,m:mode,ln:html.split('\n').length,ms,k:o.sum?o.sum(html):{}};
  const vs=W.vers();vs.push(v);W.cache[vs.length-1]=html;if(vs.length>MAXV){vs.splice(1,1);W.cache.splice(1,1);}
  const i=vs.length-1;W.cur=i;W.rec().n=(W.rec().n||0)+1;
  if(o.my)App.lesson(K).my={from:o.key,i,t:o.my(i),m:mode,f:f||null,html:f?'':(html.length<=12000?html:'')};
  bump();App.touch();
  return end({i,v,html,base,did,mode,same:!f&&!!base&&html.trim()===base.trim()});};
 return W;}

/* ================= built-in 速算挑战 (runs in the platform, saves to the class record) ================= */
const LV={g4:'四年级',g5:'五年级',g6:'六年级'};const NQ=10;
const ri=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
function mkQ(lv){const r=Math.random();let a,b,s,ans,tp;
 if(lv==='g4'){if(r<.25){a=ri(18,99);b=ri(11,99);if(Math.random()<.5){s=`${a} + ${b}`;ans=a+b;}else{if(b>a)[a,b]=[b,a];s=`${a} − ${b}`;ans=a-b;}tp='加减';}
  else if(r<.55){a=ri(11,49);b=[2,3,4,5,6,20,30,40][ri(0,7)];s=`${a} × ${b}`;ans=a*b;tp='乘法';}
  else if(r<.8){b=ri(2,9);ans=ri(12,99);a=b*ans;s=`${a} ÷ ${b}`;tp='除法';}
  else{const p=[[25,4],[125,8],[25,20],[50,40]][ri(0,3)];a=p[0];b=p[1]*ri(1,3);s=`${a} × ${b}`;ans=a*b;tp='简便运算';}}
 else if(lv==='g5'){if(r<.3){a=ri(11,99)/10;b=ri(11,99)/10;if(Math.random()<.5){s=`${a} + ${b}`;ans=Math.round((a+b)*10)/10;}else{if(b>a)[a,b]=[b,a];s=`${a} − ${b}`;ans=Math.round((a-b)*10)/10;}tp='小数';}
  else if(r<.55){a=ri(2,9)/10;b=ri(2,9)*10;s=`${a} × ${b}`;ans=Math.round(a*b*10)/10;tp='小数';}
  else if(r<.8){b=ri(11,25);ans=ri(3,30);a=b*ans;s=`${a} ÷ ${b}`;tp='除法';}
  else{a=ri(12,39);b=ri(11,19);s=`${a} × ${b}`;ans=a*b;tp='乘法';}}
 else{if(r<.3){const p=[10,20,25,50][ri(0,3)];b=(p===25?4:p===50?2:10)*ri(2,20);s=`${p}% × ${b}`;ans=p*b/100;tp='百分数';}
  else if(r<.55){a=[99,101,98][ri(0,2)];b=ri(3,12);s=`${a} × ${b}`;ans=a*b;tp='简便运算';}
  else if(r<.8){a=ri(2,9);b=ri(2,9);const c=ri(10,60);s=`${c} + ${a} × ${b}`;ans=c+a*b;tp='四则混合';}
  else{b=ri(12,35);ans=ri(12,40);a=b*ans;s=`${a} ÷ ${b}`;tp='除法';}}
 return {s,a:ans,tp};}
const fmtT=s=>{s=Math.max(0,s);const m=Math.floor(s/60),r=s-m*60;return String(m).padStart(2,'0')+':'+r.toFixed(1).padStart(4,'0');};
const better=(x,y)=>!y||x.c>y.c||(x.c===y.c&&x.t<y.t);

/* ================= content ================= */
const QUIZ=[
 {id:'q1',q:'当你告诉 AI“生成贪吃蛇游戏”时，它是怎样做出游戏的？',opts:['先回忆学过的经典游戏规则，再把规则转化成网页代码','上网搜索并下载一个现成的贪吃蛇游戏','随机写代码，直到碰巧能运行','请程序员在后台帮忙写'],a:0,why:'AI 会先回忆学过的经典游戏规则（控制方向、食物随机出现、吃到变长、撞墙或撞到自己就结束），再把规则转化成代码。平台上的 AI 也不能上网。'},
 {id:'q2',q:'AI 生成的贪吃蛇一打开就开始跑，也停不下来。下面哪条补充提示词最有效？',opts:['让游戏更好玩一点','设置“开始游戏”“暂停游戏”“重新开始”三个按钮，打开网页时小蛇先不要动','再生成一次，碰碰运气','把代码全部删掉重写'],a:1,why:'提示词越具体，AI 越清楚要改什么。“更好玩一点”太笼统，AI 不知道该加什么功能。'},
 {id:'q3',q:'AI 生成的游戏功能不全，教材认为可能是什么原因？',opts:['电脑的运行速度太慢','游戏规则本身太简单','提示词不够具体，或一次性提出的要求过于复杂','AI 根本不会写游戏代码'],a:2,why:'可以逐步细化要求：一次补充一两条，试玩后再继续，让 AI 不断调整。'},
 {id:'q4',q:'速算游戏显示“用时 00:20”，可平台对表发现真实时间才过了 10 秒。你应该怎么做？',opts:['相信游戏，AI 写的代码不会错','把问题具体地告诉 AI：“计时越来越快，请整场只用一个计时器，暂停时停止计时”，再测试一次','把计时功能删掉就好','换一种界面颜色'],a:1,why:'AI 写的代码也会出错。要亲自试玩、对照检查，再用具体的话让它修改，改完还要再测试。'},
 {id:'q5',q:'关于人和 AI 一起开发游戏，下面哪种说法正确？',opts:['AI 什么都会，人只要负责玩就行','用了 AI，就不需要自己思考了','游戏好不好玩，应该由 AI 来决定','AI 擅长复刻经典；独特的规则、剧情和视觉创意来自人。我们是总设计师，AI 是执行助手'],a:3,why:'AI 降低了做游戏的门槛，但“什么是好玩”需要人来主导：提出核心创意、把控设计方向，AI 负责把想法实现。'}];
const SN_T=[['start','能开始吗？'],['pause','能暂停吗？'],['restart','能重新开始吗？'],['keys','方向键能控制吗？'],['turn','反方向键不会撞死自己？'],['grow','吃到食物会变长吗？'],['wall','撞墙会结束吗？'],['speed','速度合适吗？']];
const SN_O=[['o1','AI 生成的贪吃蛇游戏能正常运行吗？规则正确吗？',['能运行，规则也正确','能运行，但有的规则不对','不能正常运行']],['o2','当你输入更具体的提示词后，游戏界面是否发生变化？',['变化明显','有一点变化','没有变化']],['o3','当 AI 调整游戏难度后，再次玩游戏，你是否感受到难度发生变化？',['明显感受到了','有一点','没感觉']]];
const MA_O=[['d','AI 生成的速算题难度合适吗？',['合适','太难了','太简单了']],['tm','该游戏的计时准确吗？',['准确','不准确']],['cnt','当你要求增加题目数量时，题目数量变化了吗？',['变了','没有变','还没试']],['fn','添加排行榜、错题记录功能后，功能正常吗？',['正常','有问题','还没加']],['rf','点游戏下面的“再玩一次”后，排行榜里的成绩还在吗？',['还在','没有了','还没试']]];
const FREE=['贪吃蛇','打地鼠','打砖块','猜数字','记忆翻牌','别的经典游戏','从没见过的新玩法'];
const DIMS=[['rule','规则'],['look','界面'],['story','剧情'],['diff','难度']];
const MATCH=[['dir','由玩家控制小蛇的移动方向','b'],['food','食物随机出现','c'],['grow','小蛇吃到食物会变长','d'],['end','小蛇撞到墙或自己时游戏就会结束','a']];
const SNIP={a:['if (h.x < 0 || h.x >= N || … snake.some(…)) { … over = true; }','h.x < 0 || h.x >= N'],b:['document.addEventListener("keydown", e => { … go(…) })','document.addEventListener("keydown"'],c:['p = {x: Math.floor(Math.random() * N), …}','Math.floor(Math.random() * N)'],d:['if (k >= 0) { grow += RULES.grow; … }','grow += RULES.grow']};

/* requirement chips of the two workshops: one chip = one need card with fixed options (one change per version) */
const SN_REQ=[['加功能',[['btn','开始暂停按钮','btn'],['keys','方向键','keys'],['score','显示得分','score'],['fix','修掉头毛病','fix',{b:'turn'}]]],
 ['换界面',[['ui-grass','草地绿','ui',{bg:'grass',pat:'stripe',food:'big'}],['ui-night','夜空蓝','ui',{bg:'night',pat:'dot',food:'small'}],['ui-sand','沙漠黄','ui',{bg:'sand',pat:'grad',food:'big'}]]],
 ['调难度',[['diff-slow','慢一点','diff',{s:'slow'}],['diff-ramp','越玩越快','diff',{s:'ramp'}],['diff-select','三档可选','diff',{s:'select'}]]]];
const MA_REQ=[['修一修',[['tm','计时修准','tm'],['btn','开始暂停按钮','btn']]],
 ['改题目',[['qs-4','四年级 10 道','qs',{n:'10',g:'4',tp:'mix'}],['qs-5','五年级 10 道','qs',{n:'10',g:'5',tp:'mix'}],['qs-6','六年级 10 道','qs',{n:'10',g:'6',tp:'mix'}],['n20','改成 20 道','n20']]],
 ['加功能',[['rank','排行榜','rank'],['wrong','错题记录','wrong'],['ui','蓝色大数字','ui',{c:'blue',big:'1'}]]]];
const reqHTML=(rows,cur)=>rows.map(([l,cs])=>[l,cs.map(([k,t])=>`<button type="button" class="chip ${k===cur?'on':''}" data-req="${k}">${t}</button>`).join('')]);
const reqOf=(rows,k)=>{for(const [,cs] of rows){const c=cs.find(x=>x[0]===k);if(c)return {k:c[0],t:c[1],id:c[2],o:c[3]||{}};}return null;};
/* EXP-01 pad: problems a tester can find; with an offline version the truth is known from its feature set */
const PROB=[['pause','停不下来'],['restart','不能重新开始'],['turn','按反方向键就撞死'],['speed','跑得太快'],['grow','吃了不变长'],['wall','撞墙不结束']];
const probTruth=f=>f?{pause:!f.btn,restart:!f.btn,turn:!(f.keys||f.nr),speed:(f.spd||'fast')==='fast',grow:false,wall:false}:null;
/* EXP-04b: creative chips (preset sentences; own words are optional) */
const IDEAS=[['rocks','石头障碍','场地上放几块石头障碍，撞到石头就结束。'],['gold','金色食物','有时出现金色食物，吃到一下长三节。'],['night','夜晚模式','夜晚模式：只看得见蛇头附近。'],['rainbow','彩虹蛇','把小蛇变成彩虹蛇，每一节颜色不同。'],['story','星星回家','加上剧情：收集 10 颗星星，小蛇就能回家。'],['own','我自己写','']];
const DIMOF={wrap:['rule'],rocks:['rule','diff'],gold:['rule'],night:['look','diff'],rainbow:['look'],story:['story'],clock:['diff']};
const DICT={a:'h 是蛇头；h.x < 0 是跑出了左边；over 是“结束”',b:'keydown 是“按下一个键”；go 是让小蛇转向',c:'random 是“随机”，每次取到的数都不一样',d:'grow 是“生长”；+= 是“再加上”'};
const MATCHWHY={dir:'keydown 在监听键盘：按下方向键，就改变小蛇的方向。',food:'Math.random 取随机数，食物的位置每次都不一样。',grow:'grow 变大，身体就多长几节。',end:'蛇头出了场地或碰到身体，over 变成 true，游戏结束。'};

/* ================= module state ================= */
const S={ru:Object.assign({},RU0),mc:null,mcIv:0,tp:null,req1:'btn',req2:'tm',idea:'rocks'};
function stopAll(){CTLS.forEach(c=>{try{c.abort();}catch(e){}});CTLS.clear();TIMERS.forEach(t=>clearInterval(t));TIMERS.clear();if(S.cancelMc)S.cancelMc();sleepPlays();}

const CSS=`
.l11-col{display:flex;flex-direction:column;gap:14px;min-width:0}
.l11-gl{font-weight:700}
.l11-badge{display:inline-flex;align-items:center;font-size:12.5px;font-weight:700;padding:1px 10px;border-radius:999px;color:var(--grape-d);background:var(--grape-soft);white-space:nowrap}
.l11-play{position:relative;border-radius:16px;overflow:hidden;background:#101a3d;border:1.5px solid var(--line2)}
.l11-cover{position:absolute;inset:0;width:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;border:0;cursor:pointer;font:inherit;padding:16px;text-align:center;color:#fff;background:#101a3d}
.l11-cover b{font-family:var(--f-display);font-weight:800;font-size:22px;padding:10px 26px;border-radius:999px;background:var(--sun);color:var(--ink);border:2.5px solid #fff}
.l11-cover span{font-size:14px;color:#fff}
.l11-cover:hover b{transform:translateY(-2px)}
.l11-pbar{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:6px;min-height:30px}
.l11-empty{display:grid;place-items:center;text-align:center;padding:20px;border:2.5px dashed var(--line2);border-radius:16px;color:var(--muted);font-size:15px;background:var(--panel2)}
.l11-say{font-size:15px;color:var(--muted);line-height:1.5}
.l11-tail,.l11-code{margin:6px 0 0;padding:8px 10px;border-radius:10px;background:#101a3d;color:#fff;font-family:var(--f-mono);font-size:12.5px;line-height:1.5;white-space:pre;overflow:hidden;min-height:6.2em}
.l11-code{overflow:visible;white-space:pre-wrap;word-break:break-word;min-height:0;font-size:13px}
.l11-code i{font-style:normal;color:#aab6e8}
.l11-dict{display:block;margin-top:6px;font-size:13.5px;font-weight:400;color:var(--muted)}
.l11-cap{font-size:13px;color:var(--muted);margin-top:8px}
.l11-new{margin:4px 0 0;padding:8px 10px;border-radius:10px;background:#101a3d;color:#c8f7dc;font-family:var(--f-mono);font-size:12.5px;line-height:1.5;white-space:pre-wrap;word-break:break-all}
.l11-code mark{background:var(--sun);color:var(--ink);border-radius:3px;padding:0 2px}
.l11-ic{display:block;margin-top:6px;padding:6px 10px;border-radius:10px;background:var(--panel2);border:2px solid var(--line);font-family:var(--f-mono);font-size:13px;font-weight:400;word-break:break-all}
.l11-chk{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}
.l11-chk span{font-size:13.5px;padding:1px 10px;border-radius:999px;border:2px solid var(--line2);background:#fff;color:var(--muted)}
.l11-chk span.ok{border-color:var(--mint);color:var(--mint-d)}.l11-chk span.no{border-color:var(--coral);color:var(--coral-d)}
.l11-chk span.info{border-color:var(--sky);color:var(--sky)}.l11-chk span.warn{border-color:var(--sun-d);color:var(--sun-d)}
.l11-add{color:var(--mint-d)}.l11-del{color:var(--coral-d)}
.l11-vers{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
.l11-mc{display:flex;flex-direction:column;gap:12px}
.l11-mcq{font-family:var(--f-display);font-weight:800;font-size:clamp(30px,5vw,44px);text-align:center;padding:18px 10px;border-radius:16px;background:var(--panel2);border:1.5px solid var(--line2);min-height:110px;display:grid;place-items:center;color:var(--ink)}
.l11-mcq.ok{background:var(--mint-soft)}.l11-mcq.no{background:var(--coral-soft)}
.l11-mcq small{font-family:var(--f-body);font-size:16px;color:var(--muted)}
.l11-mci{display:flex;gap:8px}.l11-mci input{flex:1;min-width:0;font-size:22px;text-align:center}
.l11-rk{width:100%;border-collapse:collapse;font-size:14.5px}
.l11-rk td{padding:5px 6px;border-bottom:2px solid var(--line)}
.l11-rk td:first-child{color:var(--muted);width:28px;font-weight:700}
.l11-rk td:last-child{text-align:right}
.l11-rk tr.me td{color:var(--coral-d);font-weight:700}
.l11-wl{display:flex;flex-direction:column;gap:4px;font-size:14.5px;max-height:170px;overflow:auto}
.l11-wl div{display:flex;justify-content:space-between;gap:8px;padding:3px 0;border-bottom:2px solid var(--line)}
.l11-wl span:last-child{color:var(--muted);font-size:13px;white-space:nowrap}
.l11-dex{display:flex;flex-direction:column;gap:12px;font-size:14.5px}
.l11-dex p{margin-top:3px}
.l11-own{width:100%}
/* the shared legacy rule .busy{position:absolute;inset:0;…} also hits App.busy()'s button class: keep the big button a button while it waits */
#v-l11 .btn.go.busy{position:static;display:inline-flex;align-items:center;padding:12px 30px 12px 24px;background:#c9cfe3;color:var(--ink);font-family:var(--f-display);font-weight:800;font-size:22px;text-align:left}
#v-l11 .btn.go.busy::before{border-color:var(--ink);border-right-color:transparent}
`;

/* ================= render ================= */
L.render=function(){const v=$('#v-'+K);if(!v)return;if(!document.getElementById('css-l11')){const st=document.createElement('style');st.id='css-l11';st.textContent=CSS;document.head.appendChild(st);}
 stopAll();PLAYS.clear();
 if(!App.rec){v.innerHTML='<div class="empty">登录后开始本讲实验。</div>';return;}
 const SNG=makeGen({key:'sn',tpl:snakeHTML,offline:snOffline,sum:h=>({sp:speedOf(h),col:colorsOf(h),ok:snChecks(h).filter(r=>r.ok&&!r.info).length}),my:i=>`贪吃蛇 第 ${i+1} 版`});
 const MAG=makeGen({key:'ma',tpl:mathHTML,offline:maOffline,sum:h=>({n:countOf(h),tm:/用时|计时/.test(h)?1:0,rk:/排行榜/.test(h)?1:0,wr:/错题/.test(h)?1:0})});
 const baseSnake=()=>{const lt=SNG.latest();return lt?lt.h:snakeHTML(SN_FULL);};
 const CRG=makeGen({key:'cr',tpl:snakeHTML,offline:(p,c,t,f)=>crOffline(p,c,t,f),base0:()=>baseSnake(),prevF:()=>CRG.lastF()||SNG.lastF()||SN_FULL,my:i=>`我的创意版 第 ${i+1} 版`});
 const col=h=>`<div class="l11-col">${h}</div>`;

 v.innerHTML=`${App.hero(K,'今天你是游戏总设计师：让 AI 写游戏，你来试玩、挑毛病、出主意。',['学会用 AI 制作网页游戏。','知道用 AI 辅助编程的优点和不足。'])}

 <div class="station" id="l11-s0">${App.head('WARM-UP','导入 · 原理','规则就是代码','改一个规则数字，猜猜小蛇会怎样！')}
  <ol class="steps"><li>改数字，猜一猜</li><li>认出 4 段代码</li></ol>
  <div class="grid2"><div id="l11-wplay"></div>
   ${col(`${App.knobs([['速度',App.range('l11-r-speed',60,300,10,S.ru.speed,' 毫秒'),'走一步用多久'],['场地',App.seg('rgrid',[['10','10 格'],['16','16 格'],['24','24 格']],S.ru.grid)],['撞墙',App.seg('rwall',[['end','游戏结束'],['wrap','穿墙而过']],S.ru.wall)]])}
    <div class="go-row"><span class="l11-gl">我猜小蛇</span>${App.seg('wguess',[['fast','变快'],['slow','变慢'],['same','一样快']],'')}${App.go('l11-go0','用新规则开玩')}</div>
    ${App.aiBox('l11-ai0','改过的规则代码会标黄','游戏的规则代码')}<div id="l11-fb0"></div>
    <div class="after-run">${App.pad('',`<div id="l11-wq"></div>`,'代码连连看')}</div>`)}</div>
  ${more(App.know('AI 生成游戏的原理','AI 学过大量经典游戏的规则和代码。收到“生成贪吃蛇游戏”时，它先回忆规则（控制方向、食物随机出现、吃到变长、撞墙或撞自己结束），再把每条规则写成代码。规则里的一个数字变了，游戏的玩法就跟着变——所以改游戏，就是改规则；说清楚规则，AI 才知道怎么改代码。'))}
 </div>

 <div class="station" id="l11-s1">${App.head('EXP-01','挑战一 · 贪吃蛇游戏','AI 写贪吃蛇','一句话让 AI 写出贪吃蛇，再挑出它的毛病！')}
  <ol class="steps"><li>让 AI 写游戏</li><li>试玩，挑 3 个毛病</li></ol>
  <div class="grid2" data-rb="1"><div id="l11-sn-st1"></div>
   ${col(`<div class="go-row"><span class="l11-gl">我猜 AI 要写</span>${App.seg('lnguess',[['s','不到 50 行'],['m','50–150 行'],['l','150 行以上']],'')}${App.go('l11-go1','让 AI 写游戏')}</div>
    ${App.aiBox('l11-ai1','你对 AI 只说一句：“生成贪吃蛇游戏”')}<div id="l11-fb1"></div>
    <div class="after-run">${App.pad('试玩后，它有哪些毛病？（可多选）',`<div class="opts" id="l11-prob"></div>`)}</div>`)}</div>
  ${more(App.know('试玩就是测试','AI 写的代码可能缺功能，也可能有错误（比如按反方向键会“撞死”自己）。逐项试玩、检查，就是程序员说的“测试”：先自己玩，发现了问题，再把问题具体地告诉 AI。'))}
 </div>

 <div class="station" id="l11-s1b">${App.head('EXP-01b','挑战一 · 贪吃蛇游戏','给贪吃蛇升级','选一张需求卡，让 AI 把游戏改得更好玩')}
  <ol class="steps"><li>选一张需求卡</li><li>升级 3 次</li></ol>
  <div class="grid2"><div id="l11-sn-st2"></div>
   ${col(`${App.knobs(reqHTML(SN_REQ,S.req1),'需求卡 · 一次选一张')}
    <div class="go-row">${App.go('l11-go1b','让 AI 升级')}</div>
    ${App.aiBox('l11-ai1b','选好需求卡，按下大按钮')}<div id="l11-fb1b"></div>
    <div class="after-run"><div class="l11-vers" id="l11-sn-vers"></div>${App.pad('',`<div id="l11-sno"></div>`)}</div>`)}</div>
  <details class="more" id="l11-sn-more"><summary>说明</summary><p class="note">AI 的回答下面有“代码体检”：平台读代码做的近似判断，以试玩为准。</p><div id="l11-sn-diff"></div>
   ${App.think(['如果 AI 生成的游戏功能不全，可能是什么原因？可以通过什么方式解决？','用什么样的提示词生成的游戏效果更好？','你还有哪些创意可以让贪吃蛇游戏变得更有趣？'])}
   ${App.know('逐步细化，让 AI 不断调整','AI 能够快速生成贪吃蛇这类经典游戏。有时，AI 生成的游戏存在功能不全的情况，这可能是因为提示词不够具体或一次性提出的要求过于复杂。我们可以逐步细化要求，让 AI 不断调整：每次补充一两条，试玩确认，再继续。')}</details>
 </div>

 <div class="station" id="l11-s2">${App.head('EXP-02','挑战二 · 速算小游戏','AI 写速算游戏','让 AI 写速算游戏，查一查它的计时准不准')}
  <ol class="steps"><li>让 AI 写游戏</li><li>连答 3 题对表</li></ol>
  <div class="grid2" data-rb="1">${col(`<div id="l11-ma-st1"></div><div class="grid3" id="l11-tp"></div>`)}
   ${col(`<div class="go-row"><span class="l11-gl">我猜它的计时</span>${App.seg('tmguess',[['0','准'],['1','不准']],'')}${App.go('l11-go2','让 AI 写游戏')}</div>
    ${App.aiBox('l11-ai2','你对 AI 只说一句：“生成速算游戏”')}<div id="l11-fb2"></div>
    <div class="after-run">${App.pad('AI 出的速算题，难度合适吗？',`<div class="opts" id="l11-mad"></div>`)}</div>`)}</div>
  ${more('<p class="note">对表：试玩时，平台每半秒读一次游戏画面上的“用时”，和真实经过的时间比一比。要连续答几道题，至少 8 秒。</p>'+App.know('AI 写的代码也会出错','“生成速算游戏”太笼统时，AI 可能出了很难的题（三位数乘两位数），甚至出现除不尽、怎么填都不对的题；计时器也可能写错：每出一题就新开一个计时器，时间越走越快，暂停了也停不下来。要亲自作答、对照检查，再把问题具体地告诉 AI，让它修改。'))}
 </div>

 <div class="station" id="l11-s2b">${App.head('EXP-02b','挑战二 · 速算小游戏','给速算游戏升级','把要求说具体，让 AI 一条一条改好')}
  <ol class="steps"><li>选一张需求卡</li><li>升级 3 次</li></ol>
  <div class="grid2">${col(`<div id="l11-ma-st2"></div><div class="grid3" id="l11-tp2"></div>`)}
   ${col(`${App.knobs(reqHTML(MA_REQ,S.req2),'需求卡 · 一次选一张')}
    <div class="go-row">${App.go('l11-go2b','让 AI 升级')}</div>
    ${App.aiBox('l11-ai2b','选好需求卡，按下大按钮')}<div id="l11-fb2b"></div>
    <div class="after-run"><div class="l11-vers" id="l11-ma-vers"></div>${App.pad('',`<div id="l11-mao"></div>`)}</div>`)}</div>
  <details class="more" id="l11-ma-more"><summary>说明</summary><p class="note">AI 的回答下面有“代码体检”：平台读代码做的近似判断，以试玩为准。</p><div id="l11-ma-diff"></div>
   ${App.know('排行榜存在哪里？','AI 生成的游戏在“沙盒”里运行，不能保存数据，排行榜只记在这一次打开的网页里，一刷新就没了。平台的速算挑战把成绩存进班级记录（只存昵称和成绩），所以能长期保存、全班一起排名。要做真正能用的排行榜，就要向 AI 说清楚“成绩存在哪里”。')}</details>
 </div>

 <div class="station" id="l11-s3">${App.head('EXP-03','挑战二 · 玩中学','速算挑战','10 道速算题，和全班比谁又准又快！')}
  <ol class="steps"><li>选年级，开始</li><li>答完 10 道题</li></ol>
  <div class="grid2">${col(`<div class="l11-mc"><div class="l11-mcq" id="l11-mcq"><small>按下大按钮就出题</small></div>
     <div class="l11-mci"><input type="text" id="l11-mcin" inputmode="decimal" autocomplete="off" placeholder="答案" aria-label="答案" disabled><button class="btn" type="button" id="l11-mcok" disabled>确定</button></div>
     <div class="grid3"><div class="stat"><div class="v" id="l11-mcno">0/${NQ}</div><div class="l">第几题</div></div><div class="stat"><div class="v" id="l11-mcc">0</div><div class="l">答对</div></div><div class="stat"><div class="v" id="l11-mct">00:00.0</div><div class="l">用时</div></div></div></div>
    <div class="after-run"><div class="box"><div class="row" style="justify-content:space-between"><span class="box-t">我的错题本</span><button class="btn ghost sm" type="button" id="l11-redo">重练错题</button></div><div id="l11-wrong"></div></div></div>`)}
   ${col(`${App.knobs([['年级',App.seg('mclv',Object.entries(LV),'')]])}
    <div class="go-row">${App.go('l11-mcstart','开始挑战')}</div><div id="l11-fb3"></div>
    <div class="after-run"><div class="box"><div class="box-t">班级排行榜 · <span id="l11-rklv"></span>（只显示昵称）</div><div id="l11-rank"></div></div>
     ${App.pad('你想设计什么学习游戏？有哪些功能？',`<textarea id="l11-mt2" maxlength="400" placeholder="主题：……；功能：……" aria-label="我想设计的学习游戏"></textarea>`)}</div>`)}</div>
  ${more(App.think(['体验 AI 生成的速算游戏后，你对“玩中学”有什么新的想法？','如果让你设计一个能辅助学习的游戏，你想设计什么主题？包含哪些功能？'])+App.know('一举多得的学习型游戏','用 AI 生成速算游戏真是“一举多得”，既能玩游戏，又能学习数学，还能和同学比一比谁算得又准又快。除了速算游戏，我们还可以让 AI 生成英语单词挑战、成语接龙、历史知识问答等游戏，让我们的学习过程变得更有趣。只要我们大胆想象，敢于提出创意，并能清晰、准确地向 AI 提出具体的要求，它就能帮助我们实现。'))}
 </div>

 <div class="station" id="l11-s4">${App.head('EXP-04','综合运用 · 从玩家到开发者','AI 自由发挥','让 AI 自己想一个新游戏，看它拿出什么')}
  <ol class="steps"><li>让 AI 自由发挥</li><li>认出它像谁</li></ol>
  <div class="grid2" data-rb="1"><div id="l11-fout"></div>
   ${col(`<div class="go-row">${App.go('l11-fgo','让 AI 自由发挥')}</div>
    ${App.aiBox('l11-ai4','你对 AI 说：“生成一个好玩的新游戏，规则由你决定。”')}<div id="l11-fb4"></div>
    <div class="after-run">${App.pad('试玩一下：它像哪个经典游戏？',`<div class="opts" id="l11-fpick"></div>`)}</div>`)}</div>
  ${more('<p class="note">AI 常常拿出它学过的经典游戏；从没见过的新玩法，要靠人来想。</p>')}
 </div>

 <div class="station" id="l11-s4b">${App.head('EXP-04b','综合运用 · 从玩家到开发者','我是总设计师','出一个你的创意，指挥 AI 把它做出来')}
  <ol class="steps"><li>选或写一个创意</li><li>让 AI 照做</li></ol>
  <div class="grid2"><div id="l11-cr-st"></div>
   ${col(`${App.knobs([['创意卡',IDEAS.map(([k,t])=>`<button type="button" class="chip ${k===S.idea?'on':''}" data-idea="${k}">${t}</button>`).join('')],['我的创意',`<input type="text" class="l11-own" id="l11-cr-own" maxlength="120" placeholder="也可以自己写一句" aria-label="我的创意">`,'选填']])}
    <div class="go-row">${App.go('l11-go4b','让 AI 照做')}</div>
    ${App.aiBox('l11-ai4b','你出创意，AI 来写代码')}<div id="l11-fb4b"></div>
    <div class="after-run"><div class="l11-vers" id="l11-cr-vers"></div>${App.pad('',`<div id="l11-cro"></div>`)}</div>`)}</div>
  ${more(App.know('我们是总设计师','AI 帮助我们跨越了游戏开发的第一道关卡。但真正让一款游戏脱颖而出的，不是对经典的复刻，而是全新的创意。环环相扣的游戏规则、引人入胜的故事情节、赏心悦目的视觉效果……这些都源于人类开发者的想象力。我们逐步细化提示词的过程，其实就是在主动设计游戏。我们是总设计师，负责提出核心创意、把控整体设计方向；而 AI 是能高效执行指令的助手，负责将我们的想法实现。'))}
 </div>

 <div class="station" id="l11-quiz">${App.head('QUIZ','反思与总结','小测验','5 道题，第一次作答计入能力图谱')}<div id="l11-qz"></div></div>
 <div class="station" id="l11-diary"></div>`;

 const s0=$('#l11-s0'),s1=$('#l11-s1'),s1b=$('#l11-s1b'),s2=$('#l11-s2'),s2b=$('#l11-s2b'),s3=$('#l11-s3'),s4=$('#l11-s4'),s4b=$('#l11-s4b');
 const shown=st=>!st.classList.contains('pg-off');
 /* shared bits of a generation */
 const streamTo=(ai,say)=>{App.aiSay(ai,`${say?`<p class="l11-say">你对 AI 说：${esc(say)}</p>`:''}<p>AI 正在写代码，已写 <b data-n>0</b> 行</p><pre class="l11-tail"></pre>`,{busy:true});const b=$(ai);
  return h=>{const ls=(h||'').split('\n');const n=$('[data-n]',b),t=$('.l11-tail',b);if(n)n.textContent=h?ls.length:0;if(t)t.textContent=ls.slice(-4).join('\n');};};
 const runGen=async(G,btn,ai,a)=>{App.busy(btn,true,'AI 正在写…');const r=await G.run(Object.assign({stream:streamTo(ai,a.say)},a));App.busy(btn,false);btn.classList.add('again');
  if(r.stop){App.aiSay(ai,'已停下。',{mood:'idle'});}return r;};
 const stage=(G,sel,h,probe,hint)=>{const box=$(sel);if(!box)return;const i=G.idx();const html=i>=0?G.htmlOf(i):null;
  if(html==null){emptyStage(box,h,i>=0?'这一版的代码没有保存，再生成一次':'游戏会出现在这里');return;}player(box,html,Object.assign({height:h,onProbe:probe},hint?{hint}:{}));};
 const diffN=r=>{if(!r.base)return null;const d=App.Code.diff(r.base,r.html);return [d.filter(x=>x.t==='add').length,d.filter(x=>x.t==='del').length];};
 const newLines=r=>{if(!r.base||!r.i)return '';const a=App.Code.diff(r.base,r.html).filter(x=>x.t==='add').map(x=>String(x.s).trim()).filter(x=>x.length>6&&!/^[{}();]*$/.test(x));if(!a.length)return '';const zh=x=>/[\u4e00-\u9fa5]/.test(x)?0:1;a.sort((x,y)=>zh(x)-zh(y));
  return `<p class="l11-cap">AI 新写的代码（${a.length>3?'挑 3 行看看，共 '+a.length+' 行':a.length+' 行'}）</p><pre class="l11-new">${a.slice(0,3).map(x=>esc(cut(x,90))).join('\n')}</pre>`;};
 const verBubble=(r,say,checks)=>{const d=diffN(r);return `<div class="big">第 ${r.i+1} 版 · ${r.v.ln} 行代码</div>${say?`<p class="l11-say">你对 AI 说：${esc(say)}</p>`:''}<p>${d?`比上一版 <b class="l11-add">+${d[0]}</b> 行、<b class="l11-del">−${d[1]}</b> 行，`:''}用时 ${(r.v.ms/1000).toFixed(1)} 秒</p>${newLines(r)}${checks?`<p class="l11-cap">代码体检（平台读代码猜的，以你试玩为准）</p><div class="l11-chk">${checks(r.html).map(x=>`<span class="${x.warn?'warn':x.info?'info':x.ok?'ok':'no'}">${x.warn?'!':x.info?'·':x.ok?'✓':'✗'} ${esc(x.l)}</span>`).join('')}</div>`:''}`;};
 const versStrip=(G,sel,redraw)=>{const box=$(sel);if(!box)return;const vs=G.vers(),i=G.idx();box.innerHTML=vs.length>1?`<span class="note">看哪一版</span>`+vs.map((x,j)=>`<button type="button" class="chip ${j===i?'on':''}" data-vi="${j}" title="${esc(x.p)}">第 ${j+1} 版</button>`).join(''):'';
  $$('[data-vi]',box).forEach(b=>b.onclick=()=>{G.cur=+b.dataset.vi;redraw();});};
 const diffBox=(G,sel)=>{const box=$(sel);if(!box)return;const i=G.idx();const h=i>=0?G.htmlOf(i):null,hp=i>0?G.htmlOf(i-1):null;
  box.innerHTML=h!=null&&hp!=null?`<p class="note">第 ${i} 版 → 第 ${i+1} 版，AI 改了这些代码（绿色是新增，红色是删除）：</p>${App.Code.diffHTML(App.Code.diff(hp,h))}`:'';};
 /* several pick-one observation questions, one at a time: qs=[[key,question,[options]]], values are stored as option indexes */
 const seqPick=(root,qs,get,set,ev)=>{if(!root)return;let i=qs.findIndex(([k])=>get(k)==null);if(i<0)i=qs.length-1;
  const draw=()=>{const [k,q,ch]=qs[i];const cur=get(k);const e=ev?ev(k):'';
   root.innerHTML=`<div class="ask"><span class="note">第 ${i+1} / ${qs.length} 个</span><br>${q}</div><div class="opts">${ch.map((c,j)=>`<button type="button" class="chip ${cur===j?'on':''}" data-j="${j}">${c}</button>`).join('')}</div>${e?`<p class="note">${esc(e)}</p>`:''}<div class="row"><button type="button" class="btn ghost sm" data-prev ${i?'':'hidden'}>上一个</button><button type="button" class="btn sm" data-next ${cur!=null&&i<qs.length-1?'':'hidden'}>下一个</button></div>`;
   $$('[data-j]',root).forEach(b=>b.onclick=()=>{set(k,+b.dataset.j);draw();});$('[data-prev]',root).onclick=()=>{i--;draw();};$('[data-next]',root).onclick=()=>{i++;draw();};};draw();};
 const wireReq=(st,key)=>$$('[data-req]',st).forEach(b=>b.onclick=()=>{S[key]=b.dataset.req;$$('[data-req]',st).forEach(x=>x.classList.toggle('on',x===b));});

 /* ===== WARM-UP · 规则就是代码 ===== */
 const W0=()=>{const l=App.lesson(K);return l.wu||(l.wu={});};
 const RK=['speed','grid','wall'];
 const ruPlay=()=>player($('#l11-wplay'),ruleHTML(S.ru),{height:380,label:W0().plays?'点这里开玩':'先玩玩原来的规则',hint:'按方向键，小蛇就出发'});
 ruPlay();
 App.rangeWire('l11-r-speed',x=>{S.ru.speed=x;});App.segWire(s0,'rgrid',x=>{S.ru.grid=+x;});App.segWire(s0,'rwall',x=>{S.ru.wall=x;});App.segWire(s0,'wguess',()=>{});
 const ruSnip=()=>{const ls=ruleHTML(S.ru).split('\n');const a=ls.findIndex(l=>l.startsWith('const RULES')),b=ls.indexOf('};',a);
  return ls.slice(a,b+1).map(l=>{const k=RK.find(x=>l.trim().startsWith(x+':'));const m=/^(.*?)\s*(\/\/.*)?$/.exec(l);const t=esc(m[1]),c=m[2]?`  <i>${esc(m[2])}</i>`:'';return (k&&S.ru[k]!==RU0[k]?`<mark>${t}</mark>`:t)+c;}).join('\n');};
 $('#l11-go0').onclick=()=>{const b=$('#l11-go0');const ch=RK.filter(k=>S.ru[k]!==RU0[k]);const w=W0();w.ch=w.ch||[];ch.forEach(k=>{if(!w.ch.includes(k))w.ch.push(k);});w.plays=(w.plays||0)+1;
  ruPlay().load();b.classList.add('again');
  App.aiSay('#l11-ai0',`<div class="big">${ch.length?`改了 ${ch.length} 条规则`:'规则没有变'}</div><pre class="l11-code">${ruSnip()}</pre>`,{mood:ch.length?'happy':'think'});
  const sp=S.ru.speed,act=sp<RU0.speed?'fast':sp>RU0.speed?'slow':'same',g=App.segVal(s0,'wguess');const NM={fast:'变快了',slow:'变慢了',same:'快慢没变'};
  const why=act==='same'?'速度那一行没改，快慢就不变；变的是场地或撞墙的规则。':`speed 从 ${RU0.speed} 改成 ${sp}：数字越${act==='fast'?'小':'大'}，每一步等得越${act==='fast'?'短，跑得越快':'久，跑得越慢'}。`;
  const GN_={10:'格子变大了，场地只有 10×10 格，小蛇看上去一步跨得更远',24:'格子变小了，场地有 24×24 格，小蛇看上去一步跨得更短',16:''};
  const oth=[S.ru.grid!==RU0.grid?GN_[S.ru.grid]:'',S.ru.wall!==RU0.wall?'撞到墙不会结束，小蛇从另一边钻出来':''].filter(Boolean);
  if(!ch.length)App.fb('#l11-fb0','try','规则没变，游戏还是老样子','拖一拖上面的「速度」滑杆，再按大按钮。',{stars:1});
  else if(act==='same')App.fb('#l11-fb0','find',`改了 ${ch.length} 条规则，按方向键试试`,`speed 那一行没动，所以每一步用的时间没变。变的是：${oth.join('；')}。再拖一拖「速度」试试。`,{stars:1});
  else if(g==null)App.fb('#l11-fb0','find',`规则变了，小蛇${NM[act]}`,why+' 按方向键看一看。下次先猜一猜。',{stars:1});
  else{const ok=g===act;if(act!=='same'){w.q=w.q||{first:ok?0:1};w.q.last=ok?0:1;}
   App.fb('#l11-fb0',ok?'ok':'find',ok?`猜对了！小蛇${NM[act]}`:`和你猜的不一样：小蛇${NM[act]}`,why+' 按方向键看一看。',{stars:ok?2:1});}
  App.markStep(s0,0);App.touch();};
 const MQ=MATCH.map(([id,,ans],n)=>({id,q:`这段代码管的是哪条规则？<code class="l11-ic">${esc(SNIP[ans][0])}</code><span class="l11-dict">小词典：${DICT[ans]}</span>`,opts:MATCH.map(m=>m[1]),a:n,why:MATCHWHY[id]}));
 const mqDone=()=>{const w=W0(),q=w.mq||{};const n=Object.keys(q).length;if(!n)return;
  w.m={ok:MQ.filter(x=>q[x.id]&&q[x.id].last===x.a).length,first:MQ.filter(x=>q[x.id]&&q[x.id].ok).length,n:1,p:{}};
  if(n>=MQ.length){App.markStep(s0,1);App.fb('#l11-fb0','ok',`4 段代码都认过了，第一次就对 ${w.m.first} 段`,'每条规则都有自己的一段代码：改规则，就是改代码。',{stars:w.m.first>=3?3:2});}};
 W0().mq=W0().mq||{};App.askSeq($('#l11-wq'),MQ,W0().mq,()=>{mqDone();App.touch();});
 if(W0().plays){App.markStep(s0,0);App.ran(s0);}mqDone();

 /* ===== EXP-01 · AI 写贪吃蛇 / EXP-01b · 给贪吃蛇升级 ===== */
 const SR=()=>{const l=App.lesson(K);return l.sn||(l.sn={});};
 const upN=G=>G.vers().filter(x=>(x.c||[]).length).length;
 const nBad=x=>Object.values((x&&x.t)||{}).filter(y=>y===0).length;
 const SN_OQ=SN_O.map(([k,q,ch])=>[k,q,ch]);
 const snEv=k=>{const vs=SR().vers||[];if(k==='o2'&&vs.length>1)return '证据：代码里的颜色数 '+vs.map((x,i)=>`第${i+1}版 ${(x.k||{}).col||0} 种`).slice(-4).join(' · ');
  if(k==='o3'&&vs.length)return '证据：每走一步的毫秒数 '+vs.map((x,i)=>`第${i+1}版 ${(x.k||{}).sp||'?'}`).slice(-4).join(' · ');return '';};
 const drawProb=()=>{const box=$('#l11-prob');const x=SNG.vers()[SNG.idx()];const t=(x&&x.t)||{};
  box.innerHTML=PROB.map(([k,n])=>`<button type="button" class="chip ${t[k]===0?'on':''}" data-pk="${k}" aria-pressed="${t[k]===0}">${n}</button>`).join('');
  $$('[data-pk]',box).forEach(b=>b.onclick=()=>{const y=SNG.vers()[SNG.idx()];if(!y)return;const on=new Set(PROB.map(p=>p[0]).filter(k=>(y.t||{})[k]===0));const k=b.dataset.pk;on.has(k)?on.delete(k):on.add(k);
   y.t={};PROB.forEach(([p])=>y.t[p]=on.has(p)?0:1);App.touch();drawProb();probFb(y);marks1();});};
 const probFb=y=>{const n=nBad(y),T=probTruth(y.f);const off=T?PROB.filter(([k])=>k!=='speed'&&y.t[k]===0&&!T[k]):[];const need=T?3:1;
  if(off.length)App.fb('#l11-fb1','try','再试玩确认一下',`「${esc(off[0][1])}」真的是毛病吗？亲手试一次再决定。`,{stars:1});
  else if(n>=need)App.fb('#l11-fb1','ok',`挑出 ${n} 个毛病，测试员合格！`,'去下一站，用需求卡让 AI 一个一个改掉。',{stars:3});
  else if(n)App.fb('#l11-fb1','find',`挑出 ${n} 个毛病`,'点游戏下面的「再玩一次」：想停下来、按反方向键，都试试。',{stars:2});
  else App.fb('#l11-fb1','try','还没有挑出毛病','点游戏下面的「再玩一次」，多试几种操作。',{stars:1});};
 const marks1=()=>{const vs=SNG.vers();if(vs.length)App.markStep(s1,0);if(vs.some(x=>nBad(x)>=(x.f?3:1)))App.markStep(s1,1);if(upN(SNG)>=1)App.markStep(s1b,0);if(upN(SNG)>=3)App.markStep(s1b,1);};
 const snShow=()=>{stage(SNG,'#l11-sn-st1',440);stage(SNG,'#l11-sn-st2',440);drawProb();versStrip(SNG,'#l11-sn-vers',snShow);diffBox(SNG,'#l11-sn-diff');marks1();};
 App.segWire(s1,'lnguess',()=>{});
 $('#l11-go1').onclick=async()=>{const b=$('#l11-go1');const vs=SNG.vers();
  if(vs.length){SNG.cur=vs.length-1;snShow();App.fb('#l11-fb1','find',`你已经有第 ${vs.length} 版了`,'点左边开玩，挑出最新这一版的毛病；想改游戏，去下一站。');return;}
  const r=await runGen(SNG,b,'#l11-ai1',{text:'生成贪吃蛇游戏',say:'生成贪吃蛇游戏',first:true});if(r.stop){App.fb('#l11-fb1','try','已停下','再按一次大按钮。');return;}
  if(r.none){App.aiSay('#l11-ai1','这次没有写出来。',{mood:'oops'});App.fb('#l11-fb1','try','没写出来，再按一次','');return;}
  const ln=r.v.ln,act=ln<50?'s':ln<=150?'m':'l',g=App.segVal(s1,'lnguess');
  App.aiSay('#l11-ai1',verBubble(r,'生成贪吃蛇游戏'),{mood:'happy',src:r.mode});snShow();
  App.fb('#l11-fb1',g===act?'ok':'find',g==null?`AI 写好了：${ln} 行代码`:g===act?`猜对了！AI 写了 ${ln} 行`:`AI 写了 ${ln} 行，和你猜的不一样`,'点左边开玩，结束了就点「再玩一次」。能玩，不等于没毛病：把毛病挑出来！',{stars:1});};
 wireReq(s1b,'req1');
 $('#l11-go1b').onclick=async()=>{const b=$('#l11-go1b');const q=reqOf(SN_REQ,S.req1)||reqOf(SN_REQ,'btn');const c=SN_CARDS.find(x=>x.id===q.id);const o=cardOpts(c,q.o);const say=c.text(o);const first=!SNG.vers().length;
  const r=await runGen(SNG,b,'#l11-ai1b',{text:first?'生成贪吃蛇游戏。'+say:say,say,cards:[{id:c.id,o}],first});if(r.stop){App.fb('#l11-fb1b','try','已停下','再按一次大按钮。');return;}
  if(r.none){App.aiSay('#l11-ai1b',`<div class="big">代码没有改动</div><p class="l11-say">你对 AI 说：${esc(say)}</p>`,{mood:'think',src:'offline'});
   App.fb('#l11-fb1b','try',`「${esc(q.t)}」原来就有了`,'换一张需求卡，再让 AI 升级。',{stars:Math.min(3,upN(SNG))});return;}
  snShow();const n=upN(SNG);
  if(r.same){App.aiSay('#l11-ai1b',verBubble(r,say,snChecks),{mood:'oops',src:r.mode});App.fb('#l11-fb1b','oops','AI 交回的代码一点没变！','这一版和上一版一模一样。换一张需求卡再试。',{stars:Math.min(3,n)});}
  else{App.aiSay('#l11-ai1b',verBubble(r,say,snChecks),{mood:'happy',src:r.mode});
   App.fb('#l11-fb1b','ok',`AI 交出了第 ${r.i+1} 版`,`${r.did&&r.did.did.length?'加上了「'+esc(r.did.did.join('、'))+'」。':''}点左边开玩，查一查 AI 改对了没有。${n<3?`再升级 ${3-n} 次拿满星。`:''}`,{stars:Math.min(3,n)});}
  seqSn();};
 const seqSn=()=>seqPick($('#l11-sno'),SN_OQ,k=>(SR().o||{})[k],(k,j)=>{const r=SR();r.o=r.o||{};r.o[k]=j;App.touch();},snEv);
 snShow();seqSn();if(SNG.vers().length){App.ran(s1);if(upN(SNG))App.ran(s1b);}
 $('#l11-sn-more').addEventListener('toggle',()=>diffBox(SNG,'#l11-sn-diff'));

 /* ===== EXP-02 · AI 写速算游戏 / EXP-02b · 给速算游戏升级 ===== */
 const MAHINT='填答案，点「提交」';
 const MR=()=>{const l=App.lesson(K);return l.ma||(l.ma={});};
 function timerProbe(d){const v2=clockOf(d.tx);if(v2==null)return;let P=S.tp;
  if(!P||v2<P.v-0.001){S.tp={b:{t:d.t,v:v2},t:d.t,v:v2,c:d.t};drawTp();return;}
  if(v2===P.v){if(d.t-P.c>2200){P.b={t:d.t,v:v2};P.c=d.t;}P.t=d.t;}else{P.v=v2;P.t=d.t;P.c=d.t;}
  const dt=(P.t-P.b.t)/1000,dv=P.v-P.b.v;if(dt>=4&&dv>0){P.r=dv/dt;P.dt=dt;P.dv=dv;if(dt>=8){const m=MR();const nr={r:Math.round(P.r*100)/100,s:Math.round(dt)};if(!m.tm||Math.abs(m.tm.r-nr.r)>0.05||nr.s>m.tm.s+5){m.tm=nr;App.touch();}
    const bad=Math.abs(P.r-1)>0.1;if(P.told!==bad){P.told=bad;tmFb(P,bad);}}}drawTp();}
 const tmFb=(P,bad)=>{const g=(MR().o||{}).tm;const hit=g==null?'':((g===1)===bad?'你猜对了！':'和你猜的不一样。');const b2=shown(s2b)&&!shown(s2);
  const tt='看游戏下面的对表';
  if(bad)App.fb(b2?'#l11-fb2b':'#l11-fb2','oops','你发现 AI 的错误了！',`${hit}${tt}：游戏里的时间比真实时间走得${P.r>1?'快':'慢'}。${b2?'选「计时修准」让 AI 改。':'下一站让 AI 把它修好。'}`,b2?{}:{stars:3});
  else App.fb(b2?'#l11-fb2b':'#l11-fb2','ok','对过表了：计时是准的',`${hit}${tt}：游戏里的时间和真实时间一样。`,b2?{}:{stars:2});marks2();};
 function drawTp(){const P=S.tp,m=MR().tm;const cell=(x,l)=>`<div class="stat"><div class="v">${x}</div><div class="l">${l}</div></div>`;
  const h=P&&P.r?cell(P.dv.toFixed(0)+' 秒','游戏说过了')+cell(P.dt.toFixed(1)+' 秒','真实时间')+cell(Math.abs(P.r-1)>0.1?(P.r>1?'快 ':'慢 ')+P.r.toFixed(1)+' 倍':'准','对表结果')
   :cell(P?P.v+' 秒':'—','游戏说过了')+cell('—','真实时间')+cell(P?'对表中':'—',P?'再答几题':'答 3 题来对表');
  ['#l11-tp','#l11-tp2'].forEach(s=>{const e=$(s);if(e)e.innerHTML=h;});}
 const MA_Q2=MA_O.filter(x=>['cnt','fn','rf'].includes(x[0]));
 const maEv=k=>{const vs=MR().vers||[];if(k==='cnt'&&vs.length)return '证据：代码里的题目数量 '+vs.map((x,i)=>`第${i+1}版 ${(x.k||{}).n?x.k.n+' 道':'不限'}`).slice(-4).join(' · ');return '';};
 const drawMad=()=>{const o=MR().o||{};const q=MA_O.find(x=>x[0]==='d');$('#l11-mad').innerHTML=q[2].map((c,j)=>`<button type="button" class="chip ${o.d===j?'on':''}" data-md="${j}">${c}</button>`).join('');
  $$('[data-md]',$('#l11-mad')).forEach(b=>b.onclick=()=>{const r=MR();r.o=r.o||{};r.o.d=+b.dataset.md;App.touch();drawMad();
   if(r.o.d===0)App.fb('#l11-fb2','find','记下了：难度合适','再对对表：连答 3 题，看计时准不准。');
   else App.fb('#l11-fb2','find',r.o.d===1?'题太难：AI 不知道给谁做':'题太简单：AI 不知道给谁做','只说“生成速算游戏”太笼统。下一站告诉它年级和题数。');});};
 const marks2=()=>{const r=MR(),vs=MAG.vers();if(vs.length)App.markStep(s2,0);if(r.tm)App.markStep(s2,1);if(upN(MAG)>=1)App.markStep(s2b,0);if(upN(MAG)>=3)App.markStep(s2b,1);};
 const maShow=()=>{S.tp=null;stage(MAG,'#l11-ma-st1',430,timerProbe,MAHINT);stage(MAG,'#l11-ma-st2',430,timerProbe,MAHINT);drawTp();versStrip(MAG,'#l11-ma-vers',maShow);diffBox(MAG,'#l11-ma-diff');marks2();};
 App.segWire(s2,'tmguess',x=>{const r=MR();r.o=r.o||{};r.o.tm=+x;App.touch();});
 {const g=(MR().o||{}).tm;if(g!=null)$$('[data-seg="tmguess"] .chip',s2).forEach(b=>b.classList.toggle('on',+b.dataset.v===g));}
 $('#l11-go2').onclick=async()=>{const b=$('#l11-go2');const vs=MAG.vers();
  if(vs.length){MAG.cur=vs.length-1;maShow();App.fb('#l11-fb2','find',`你已经有第 ${vs.length} 版了`,'点左边开始，连答 3 题对表；想改游戏，去下一站。');return;}
  const r=await runGen(MAG,b,'#l11-ai2',{text:'生成速算游戏',say:'生成速算游戏',first:true});if(r.stop){App.fb('#l11-fb2','try','已停下','再按一次大按钮。');return;}
  if(r.none){App.aiSay('#l11-ai2','这次没有写出来。',{mood:'oops'});App.fb('#l11-fb2','try','没写出来，再按一次','');return;}
  App.aiSay('#l11-ai2',verBubble(r,'生成速算游戏'),{mood:'happy',src:r.mode});maShow();
  App.fb('#l11-fb2','find',`AI 写好了：${r.v.ln} 行代码`,'点左边开始，连答 3 道题（答错也没关系），盯住「用时」：平台在帮你对表。',{stars:1});};
 wireReq(s2b,'req2');
 $('#l11-go2b').onclick=async()=>{const b=$('#l11-go2b');const q=reqOf(MA_REQ,S.req2)||reqOf(MA_REQ,'tm');const c=MA_CARDS.find(x=>x.id===q.id);const o=cardOpts(c,q.o);const say=c.text(o);const first=!MAG.vers().length;
  const r=await runGen(MAG,b,'#l11-ai2b',{text:first?'生成速算游戏。'+say:say,say,cards:[{id:c.id,o}],first});if(r.stop){App.fb('#l11-fb2b','try','已停下','再按一次大按钮。');return;}
  if(r.none){App.aiSay('#l11-ai2b',`<div class="big">代码没有改动</div><p class="l11-say">你对 AI 说：${esc(say)}</p>`,{mood:'think',src:'offline'});
   App.fb('#l11-fb2b','try',`「${esc(q.t)}」原来就有了`,'换一张需求卡，再让 AI 升级。',{stars:Math.min(3,upN(MAG))});return;}
  maShow();const n=upN(MAG);
  if(r.same){App.aiSay('#l11-ai2b',verBubble(r,say,maChecks),{mood:'oops',src:r.mode});App.fb('#l11-fb2b','oops','AI 交回的代码一点没变！','这一版和上一版一模一样。换一张需求卡再试。',{stars:Math.min(3,n)});}
  else{App.aiSay('#l11-ai2b',verBubble(r,say,maChecks),{mood:'happy',src:r.mode});
   App.fb('#l11-fb2b','ok',`AI 交出了第 ${r.i+1} 版`,`${r.did&&r.did.did.length?esc(r.did.did.join('；'))+'。':''}点左边试一试，查一查 AI 改对了没有。${n<3?`再升级 ${3-n} 次拿满星。`:''}`,{stars:Math.min(3,n)});}
  seqMa();};
 const seqMa=()=>seqPick($('#l11-mao'),MA_Q2,k=>(MR().o||{})[k],(k,j)=>{const r=MR();r.o=r.o||{};r.o[k]=j;App.touch();},maEv);
 maShow();drawMad();seqMa();if(MAG.vers().length){App.ran(s2);if(upN(MAG))App.ran(s2b);}
 $('#l11-ma-more').addEventListener('toggle',()=>diffBox(MAG,'#l11-ma-diff'));

 /* ===== EXP-03 · 速算挑战 (built in, saved to the class record) ===== */
 const MC=()=>{const l=App.lesson(K);return l.mc||(l.mc={});};
 S.lv=S.lv||MC().lv||(App.student&&App.student.grade?'g'+App.student.grade:'g4');if(!LV[S.lv])S.lv='g4';
 const mcE={q:$('#l11-mcq'),in:$('#l11-mcin'),ok:$('#l11-mcok'),no:$('#l11-mcno'),c:$('#l11-mcc'),t:$('#l11-mct'),st:$('#l11-mcstart')};
 const drawLv=()=>$$('[data-seg="mclv"] .chip',s3).forEach(b=>b.classList.toggle('on',b.dataset.v===S.lv));
 App.segWire(s3,'mclv',x=>{if(S.mc&&S.mc.on){App.toast('先答完这一局');drawLv();return;}S.lv=x;MC().lv=x;drawRank();});drawLv();
 const mcTime=()=>{const m=S.mc;return m?(m.acc+(m.on?performance.now()-m.t0:0))/1000:0;};
 const mcShow=()=>{const m=S.mc;if(!m)return;const q=m.qs[m.i];mcE.no.textContent=Math.min(m.i+1,m.qs.length)+'/'+m.qs.length;mcE.c.textContent=m.c;
  mcE.q.className='l11-mcq';mcE.q.textContent=q.s+' = ?';mcE.in.disabled=false;mcE.ok.disabled=false;mcE.in.value='';try{mcE.in.focus({preventScroll:true});}catch(x){}};
 function mcStart(redo){if(S.mc&&S.mc.on)return;let qs;
  if(redo){const w=(MC().wrong||[]).slice(0,NQ);if(!w.length){App.toast('错题本是空的');return;}qs=w.map(x=>({s:x.q,a:x.a,tp:x.tp,lv:x.lv}));}else qs=Array.from({length:NQ},()=>mkQ(S.lv));
  S.mc={on:1,redo:!!redo,lv:S.lv,qs,i:0,c:0,acc:0,t0:performance.now(),wr:[],fixed:[]};App.busy(mcE.st,true,'挑战中…');
  clearInterval(S.mcIv);S.mcIv=setInterval(()=>{mcE.t.textContent=fmtT(mcTime());},100);TIMERS.add(S.mcIv);mcShow();App.markStep(s3,0);
  App.fb('#l11-fb3','find',redo?`重练 ${qs.length} 道错题`:`${LV[S.lv]}挑战开始！`,'在左边填答案，按回车或「确定」。又准又快才能上榜。');}
 S.cancelMc=()=>{const m=S.mc;if(!m||!m.on)return;m.on=0;clearInterval(S.mcIv);S.mc=null;if(mcE.q.isConnected){mcE.q.className='l11-mcq';mcE.q.innerHTML='<small>这一局中断了，再按大按钮重来</small>';mcE.in.disabled=true;mcE.ok.disabled=true;App.busy(mcE.st,false);}};
 const mcNorm=s=>String(s||'').trim().replace(/[０-９]/g,c=>String.fromCharCode(c.charCodeAt(0)-65248)).replace(/[。．]/g,'.').replace(/[－—]/g,'-');
 function mcAnswer(){const m=S.mc;if(!m||!m.on)return;const raw=mcNorm(mcE.in.value);if(!raw){App.toast('先填答案');return;}const q=m.qs[m.i];const y=parseFloat(raw);
  const ok=isFinite(y)&&Math.abs(y-q.a)<1e-6;if(ok){m.c++;if(m.redo)m.fixed.push(q.s);}else m.wr.push({q:q.s,a:q.a,y:clip(raw,8),tp:q.tp,lv:q.lv||m.lv});
  mcE.q.className='l11-mcq '+(ok?'ok':'no');mcE.q.innerHTML=ok?'答对了！':`<small>答错了：${esc(q.s)} = ${esc(q.a)}</small>`;mcE.c.textContent=m.c;m.i++;
  if(m.i>=m.qs.length){mcEnd();return;}setTimeout(()=>{if(S.mc===m&&m.on)mcShow();},ok?300:1100);mcE.in.disabled=true;mcE.ok.disabled=true;}
 function mcEnd(){const m=S.mc;m.acc+=performance.now()-m.t0;m.on=0;clearInterval(S.mcIv);const t=Math.round(m.acc/100)/10;const r=MC();
  let W_=(r.wrong||[]).filter(w=>!m.fixed.includes(w.q));m.wr.forEach(w=>{W_=W_.filter(x=>x.q!==w.q);W_.unshift(w);});r.wrong=W_.slice(0,12);
  if(m.redo){r.fixed=(r.fixed||0)+m.fixed.length;r.redo=(r.redo||0)+1;mcE.q.innerHTML=`<small>重练完成：改正 ${m.fixed.length}/${m.qs.length} 道</small>`;
   App.fb('#l11-fb3',m.fixed.length?'ok':'try',`重练完成：改正了 ${m.fixed.length} 道`,r.wrong.length?`错题本里还有 ${r.wrong.length} 道，再练一次。`:'错题本清空了！');}
  else{r.runs=(r.runs||0)+1;const res={c:m.c,t};r.last=Object.assign({lv:m.lv},res);r.best=r.best||{};const nb=better(res,r.best[m.lv]);if(nb)r.best[m.lv]=res;
   const tps={};m.wr.forEach(w=>tps[w.tp]=(tps[w.tp]||0)+1);r.tps=r.tps||{};Object.entries(tps).forEach(([k,n])=>r.tps[k]=(r.tps[k]||0)+n);
   mcE.q.innerHTML=`<small>挑战完成：答对 ${m.c}/${NQ}，用时 ${t} 秒</small>`;const tail=(nb?'这是你的最好成绩，已经记上排行榜。':'没超过你的最好成绩。')+(m.wr.length?'错题进了错题本，点「重练错题」。':'');
   if(m.c>=NQ)App.fb('#l11-fb3','ok',`全对！${NQ} 道题用时 ${t} 秒`,tail+'再来一局，比比谁更快。',{stars:3});
   else if(m.c>=6)App.fb('#l11-fb3','ok',`答对 ${m.c}/${NQ}，用时 ${t} 秒`,tail,{stars:2});
   else App.fb('#l11-fb3','try',`答对 ${m.c}/${NQ}，用时 ${t} 秒`,tail,{stars:1});}
  bump();App.touch();mcE.in.disabled=true;mcE.ok.disabled=true;mcE.t.textContent=fmtT(t);App.busy(mcE.st,false);mcE.st.classList.add('again');drawRank();drawWrong();marks3();}
 function drawRank(){const box=$('#l11-rank');if(!box||!App.rec)return;$('#l11-rklv').textContent=LV[S.lv];const mine=App.classOf(App.rec.id);
  const rows=Object.values(App.all||{}).concat(App.all&&App.all[App.rec.id]?[]:[App.rec]).filter(r=>r&&r.id&&App.classOf(r.id)===mine)
   .map(r=>({n:r.name||'同学',me:r.id===App.rec.id,b:((((r.lessons||{})[K]||{}).mc||{}).best||{})[S.lv]})).filter(x=>x.b).sort((a,b)=>b.b.c-a.b.c||a.b.t-b.b.t);
  box.innerHTML=rows.length?`<table class="l11-rk">${rows.slice(0,6).map((x,i)=>`<tr class="${x.me?'me':''}"><td>${i+1}</td><td>${esc(x.n)}${x.me?'（我）':''}</td><td>${x.b.c}/${NQ} · ${x.b.t} 秒</td></tr>`).join('')}</table>`:'<p class="note">这个年级还没有人上榜，你来当第一个</p>';}
 function drawWrong(){const w=MC().wrong||[];$('#l11-wrong').innerHTML=w.length?`<div class="l11-wl">${w.map(x=>`<div><span>${esc(x.q)} = ${esc(x.a)}</span><span>${esc(x.tp||'')} · 我写的 ${esc(x.y)}</span></div>`).join('')}</div>`:`<p class="note">${MC().runs?'现在没有错题。':'做错的题会记在这里。'}${MC().fixed?` 已改正 ${MC().fixed} 道。`:''}</p>`;$('#l11-redo').disabled=!w.length;}
 mcE.st.onclick=()=>mcStart(false);mcE.ok.onclick=mcAnswer;mcE.in.addEventListener('keydown',ev=>{if(ev.key==='Enter'){ev.preventDefault();mcAnswer();}});
 $('#l11-redo').onclick=()=>{if(S.mc&&S.mc.on){App.toast('先答完这一局');return;}mcStart(true);};
 {const t=$('#l11-mt2');t.value=MC().mt2||'';let tm;t.oninput=()=>{MC().mt2=clip(t.value,400);clearTimeout(tm);tm=setTimeout(App.touch,600);};}
 const marks3=()=>{const r=MC();if(r.runs){App.markStep(s3,0);App.markStep(s3,1);}};
 drawRank();drawWrong();marks3();if(MC().runs)App.ran(s3);

 /* ===== EXP-04 · AI 自由发挥 ===== */
 const CR=()=>{const l=App.lesson(K);return l.cr||(l.cr={});};
 const showFree=()=>{const f=CR().free;const out=$('#l11-fout');if(!S.free&&f&&f.m==='offline')S.free=WHACK;
  if(!S.free){emptyStage(out,340,f&&f.ln?`上次 AI 做的是「${esc(f.title||'小游戏')}」，代码没有保存，再按一次大按钮`:'AI 想出的游戏会出现在这里');return;}player(out,S.free,{height:340,hint:'点一点，试玩一下'});};
 const freeSay=f=>`<div class="big">《${esc(f.title||'小游戏')}》· ${f.ln} 行代码</div><p>这就是我想到的“新游戏”。</p>`;
 const drawFree=()=>{const f=CR().free||{};$('#l11-fpick').innerHTML=FREE.map((t,j)=>`<button type="button" class="chip ${f.pick===j?'on':''}" data-fp="${j}">${t}</button>`).join('');
  $$('[data-fp]',$('#l11-fpick')).forEach(b=>b.onclick=()=>{const c=CR();c.free=c.free||{};c.free.pick=+b.dataset.fp;if(c.free.first==null)c.free.first=c.free.pick;App.touch();drawFree();pickFb();marks4();});};
 const pickFb=()=>{const f=CR().free||{};if(f.pick==null)return;const novel=f.pick===FREE.length-1;const nm=esc(FREE[f.pick]);
  if(f.m==='offline'){/* the offline game is known: 打地鼠 */
   if(f.pick===1)App.fb('#l11-fb4','ok','认出来了：它就是「打地鼠」','让它自由发挥，它拿出的是学过的老游戏。新玩法要靠人：下一站轮到你出创意。',{stars:f.first===1?3:2});
   else App.fb('#l11-fb4','try',novel?'真的从没见过吗？':`再玩一玩：它像「${nm}」吗？`,'看看游戏的名字，再点一点那些圆洞。',{stars:1});}
  else if(novel)App.fb('#l11-fb4','find','你觉得它是新玩法','和同学对一对：它的规则，像不像哪个老游戏？说说你的理由。',{stars:3});
  else App.fb('#l11-fb4','find',`你觉得它像「${nm}」`,'AI 自由发挥时，常常拿出学过的经典。和同学对一对看法；下一站轮到你出创意。',{stars:3});};
 $('#l11-fgo').onclick=async()=>{const b=$('#l11-fgo');App.busy(b,true,'AI 正在想…');const ctl=new AbortController();CTLS.add(ctl);const st=streamTo('#l11-ai4','');let html='',mode='offline';
  const done=()=>{CTLS.delete(ctl);App.busy(b,false);b.classList.add('again');};const stopped=()=>{done();App.aiSay('#l11-ai4','已停下。',{mood:'idle'});App.fb('#l11-fb4','try','已停下','再按一次大按钮。');};
  try{const r=await App.Code.generate('生成一个好玩的新游戏，规则由你决定。',{signal:ctl.signal,kind:'网页小游戏',onText:({html:h})=>st(h)});if(r&&r.html&&/<\w/.test(r.html)){html=r.html;mode=r.mode||App.AI.mode();}}
  catch(e){if((e&&e.code==='cancelled')||ctl.signal.aborted){stopped();return;}App.AI.fail(e);App.toast(App.AI.errText(e));}
  if(!html){html=WHACK;try{await fakeStream(html,st,ctl.signal);}catch(e){stopped();return;}}
  done();S.free=html;const c=CR();c.free=Object.assign(c.free||{},{m:mode,ln:html.split('\n').length,title:clip((/<title>([^<]*)<\/title>/i.exec(html)||[])[1]||'',20)});bump();App.touch();
  showFree();App.aiSay('#l11-ai4',freeSay(c.free),{mood:'happy',src:mode});marks4();
  App.fb('#l11-fb4','find',`AI 做了《${esc(c.free.title||'小游戏')}》`,'点左边试玩。它真的是“新”游戏吗？在下面认一认。',{stars:1});};
 showFree();drawFree();if((CR().free||{}).ln){App.ran(s4);if(S.free)App.aiSay('#l11-ai4',freeSay(CR().free),{mood:'happy',src:CR().free.m});}

 /* ===== EXP-04b · 我是总设计师 ===== */
 const crShow=()=>{const box=$('#l11-cr-st');const i=CRG.idx();const h=i>=0?CRG.htmlOf(i):null;player(box,h!=null?h:baseSnake(),{height:440,label:h!=null?'试玩我的创意版':'先玩玩现在的贪吃蛇'});versStrip(CRG,'#l11-cr-vers',crShow);};
 $$('[data-idea]',s4b).forEach(b=>b.onclick=()=>{S.idea=b.dataset.idea;$$('[data-idea]',s4b).forEach(x=>x.classList.toggle('on',x===b));if(S.idea==='own')$('#l11-cr-own').focus();});
 const drawCrObs=()=>{const c=CR();const box=$('#l11-cro');const MT_=['和我想的一样','做到了一部分','和我想的不一样'];
  if(c.match==null||S.crQ===0){box.innerHTML=`<div class="ask">AI 做出来的，和你想的一样吗？</div><div class="opts">${MT_.map((t,j)=>`<button type="button" class="chip ${c.match===j?'on':''}" data-cm="${j}">${t}</button>`).join('')}</div>`;
   $$('[data-cm]',box).forEach(b=>b.onclick=()=>{CR().match=+b.dataset.cm;S.crQ=1;App.touch();drawCrObs();marks4();});return;}
  box.innerHTML=`<div class="ask">这一版里，哪些是你的想法？哪些是 AI 做的？</div><textarea id="l11-crole" maxlength="400" placeholder="我的想法是……；AI 做了……" aria-label="谁做了什么">${esc(c.role||'')}</textarea><div class="row"><button type="button" class="btn ghost sm" data-back>上一个</button></div>`;
  $('[data-back]',box).onclick=()=>{S.crQ=0;drawCrObs();};const ta=$('#l11-crole');let tm;ta.oninput=()=>{CR().role=clip(ta.value,400);clearTimeout(tm);tm=setTimeout(App.touch,600);};};
 const marks4=()=>{const c=CR();if((c.free||{}).ln)App.markStep(s4,0);if((c.free||{}).pick!=null)App.markStep(s4,1);if((c.idea||'').trim().length>=6)App.markStep(s4b,0);if((c.vers||[]).length)App.markStep(s4b,1);};
 const crStars=()=>{const vs=CRG.vers();return vs.some(x=>x.e)||vs.length>=3?3:Math.min(2,vs.length);};
 $('#l11-go4b').onclick=async()=>{const b=$('#l11-go4b');const own=clip($('#l11-cr-own').value,120);const idea=IDEAS.find(x=>x[0]===S.idea)||IDEAS[0];const body=[idea[2],own].filter(Boolean).join('\n');
  if(body.replace(/\s/g,'').length<6){App.fb('#l11-fb4b','try','先把你的创意写出来','在「我的创意」里写一句完整的话，比如“小蛇每吃一个……就……”。');$('#l11-cr-own').focus();return;}
  const c=CR();c.idea=clip(body,400);const say=body.replace(/\n/g,' ');
  const r=await runGen(CRG,b,'#l11-ai4b',{text:'我是这个游戏的总设计师。请保留原来的玩法，按我的创意修改游戏：\n'+body,say,off:body,own});if(r.stop){App.fb('#l11-fb4b','try','已停下','再按一次大按钮。');return;}
  if(r.none){const same=(r.none.same||[]).length;App.aiSay('#l11-ai4b',`<div class="big">${same?'这个创意已经做过了':'这个新点子我没学过'}</div><p class="l11-say">你对 AI 说：${esc(say)}</p>`,{mood:same?'think':'oops',src:'offline'});
   if(same)App.fb('#l11-fb4b','try',`「${esc(r.none.same.join('、'))}」已经在游戏里了`,'换一张创意卡，或者写一个新的。',{stars:crStars()});
   else App.fb('#l11-fb4b','oops','离线的 AI 被你的创意难住了！','新点子来自人。离线演示只会几种现成的改法：选一张创意卡试试，或者换用联网的 AI。',{stars:crStars()});App.touch();return;}
  const ks=MODS.filter(([k,re])=>re.test(body)).map(m=>m[0]);const ds=new Set(c.dims||[]);(ks.length?ks:['wrap']).forEach(k=>(DIMOF[k]||['rule']).forEach(d=>ds.add(d)));c.dims=DIMS.map(d=>d[0]).filter(d=>ds.has(d));App.touch();
  crShow();App.aiSay('#l11-ai4b',verBubble(r,say),{mood:r.same?'oops':'happy',src:r.mode});S.crQ=c.match==null?0:1;drawCrObs();marks4();
  if(r.same)App.fb('#l11-fb4b','oops','AI 交回的代码一点没变！','把创意说得更具体：什么时候、发生什么、结果怎样。',{stars:crStars()});
  else App.fb('#l11-fb4b','ok',`创意版做出来了：第 ${r.i+1} 版`,`${r.did&&r.did.did.length?'AI 加上了「'+esc(r.did.did.join('、'))+'」。':''}点左边试玩：创意是你的，代码是 AI 写的。${own?'':'自己写一句创意，拿满星。'}`,{stars:crStars()});};
 crShow();drawCrObs();marks4();if(CRG.vers().length)App.ran(s4b);

 /* ===== quiz + diary ===== */
 App.quiz($('#l11-qz'),K,QUIZ);
 const rd=App.diary($('#l11-diary'),K,{title:L.diaryTitle,lead:'整理你的小游戏，回答 4 个问题',
  fields:[{id:'adv',q:'在游戏制作方面，AI 有哪些优势和局限性？',ph:'优势：……；局限：……'},
   {id:'rely',q:'在制作游戏的过程中，哪些环节可以依靠 AI？哪些环节我们必须亲自参与？',ph:'靠 AI：……；自己来：……'},
   {id:'know',q:'你对 AI 辅助编程有了哪些新的认识？你还想用 AI 的编程功能做哪些事？',ph:'我发现……；我还想做……'},
   {id:'idea',q:'我的小游戏：规则、界面或难度还可以怎么改，让它更有趣？',ph:'我想把……改成……，因为……'}],
  pledge:'分享我的小游戏时，我会说明代码是 AI 生成的，哪些创意是我自己的。',
  extras:ex=>{const l=App.lesson(K);const sn=l.sn||{},ma=l.ma||{},mc=l.mc||{},cr=l.cr||{},my=l.my;const svs=sn.vers||[];
   const used=[...new Set(svs.flatMap(x=>x.c||[]))].map(id=>(SN_CARDS.find(c=>c.id===id)||{}).t).filter(Boolean);
   ex.innerHTML=`<div class="l11-dex"><div><div class="box-t">我的小游戏</div>${my?`<p><b>${esc(my.t)}</b> <span class="l11-badge">AI 生成</span> <span class="note">来源：${esc(srcOf(my.m))}</span></p><p class="note">${my.f||my.html?'':'（代码没有保存）'}</p>${my.f||my.html?'<button class="btn ghost sm" type="button" data-myplay>试玩我的小游戏</button>':''}`:'<p class="note">让 AI 写出贪吃蛇后，会显示在这里。</p>'}
     ${cr.idea?`<p>我的创意：${esc(cut(cr.idea,80))}</p>`:''}</div>
    <div><div class="box-t">贪吃蛇</div><p>共 ${svs.length} 版；用过的需求卡：${used.length?esc(used.join('、')):'无'}；试玩挑出毛病 ${svs.reduce((s,x)=>s+Object.values(x.t||{}).filter(y=>y===0).length,0)} 个</p></div>
    <div><div class="box-t">速算</div><p>AI 速算游戏 ${(ma.vers||[]).length} 版${ma.tm?`，对表：计时约为真实时间的 ${ma.tm.r} 倍`:''}</p>
     <p>速算挑战：${mc.runs?Object.entries(mc.best||{}).map(([k,b])=>`${LV[k]} 最好 ${b.c}/${NQ}、${b.t} 秒`).join('；'):'还没有挑战'}${(mc.wrong||[]).length?`；错题本 ${(mc.wrong||[]).length} 道`:''}${mc.fixed?`，已改正 ${mc.fixed} 道`:''}</p></div></div>`;
   const pb=$('[data-myplay]',ex);if(pb)pb.onclick=()=>{const h=my.f?snakeHTML(my.f):my.html;const box=document.createElement('div');box.innerHTML=`<h3>${esc(my.t)}</h3><div></div><p class="note">AI 生成 · 来源：${esc(srcOf(my.m))}</p>`;App.modal(box,true);player(box.children[1],h,{height:460});};}});
 L._rd=rd;if(!L._on){L._on=1;App.on(()=>{if(App.current===K){if(L._rd)L._rd();if(L._rank)L._rank();}});}
 L._rank=drawRank;
};
L.onShow=()=>{if(L._rank)L._rank();};
L.onHide=()=>{stopAll();};
/* ================= hooks ================= */
const qs_=(lr,id)=>{const Q=lr.quiz||{};return Q[id]?(Q[id].ok?100:0):0;};
const snCards=lr=>new Set(((lr.sn||{}).vers||[]).flatMap(v=>v.c||[]));
const maCards=lr=>new Set(((lr.ma||{}).vers||[]).flatMap(v=>v.c||[]));
const probs=lr=>((lr.sn||{}).vers||[]).reduce((s,v)=>s+Object.values(v.t||{}).filter(x=>x===0).length,0);
const testsDone=lr=>Math.max(0,...((lr.sn||{}).vers||[]).map(v=>Object.keys(v.t||{}).length));
const tmJudge=ma=>{const o=(ma||{}).o||{},tm=(ma||{}).tm;if(o.tm==null)return 0;if(!tm)return 0.5;const bad=Math.abs(tm.r-1)>0.1;return (bad&&o.tm===1)||(!bad&&o.tm===0)?1:0;};
L.score=lr=>{const wu=lr.wu||{},sn=lr.sn||{},ma=lr.ma||{},mc=lr.mc||{},cr=lr.cr||{},D=lr.diary||{};const sv=(sn.vers||[]).length,mv=(ma.vers||[]).length;
 const so=Object.keys(sn.o||{}).length,mo=Object.keys(ma.o||{}).length;
 return {principle:35*(((wu.m||{}).ok||0)/4)+15*Math.min(1,(wu.ch||[]).length/2)+(wu.q?(wu.q.first===0?15:wu.q.last===0?8:0):0)+0.175*qs_(lr,'q1')+0.175*qs_(lr,'q3'),
  experiment:25*Math.min(1,sv/3)+15*Math.min(1,testsDone(lr)/6)+15*Math.min(1,mv/3)+(ma.tm?10:0)+15*Math.min(1,(mc.runs||0)/2)+20*(so+mo)/8,
  prompt:30*Math.min(1,snCards(lr).size/4)+10*(((sn.vers||[]).some(v=>v.e)||(ma.vers||[]).some(v=>v.e)||(cr.vers||[]).some(v=>v.e))?1:0)+25*Math.min(1,maCards(lr).size/4)+0.2*tx(cr.idea,40)+0.15*qs_(lr,'q2'),
  critical:30*Math.min(1,probs(lr)/3)+25*tmJudge(ma)+(((ma.o||{}).rf!=null&&(ma.o||{}).rf<2)?10:0)+((cr.free||{}).pick!=null?15:0)+0.2*qs_(lr,'q4'),
  creative:0.3*tx(cr.idea,40)+((cr.dims||[]).length>=2?15:(cr.dims||[]).length?10:0)+((cr.vers||[]).length?20:0)+(snCards(lr).has('ui')?10:0)+0.15*tx(D.idea,30)+0.1*tx(mc.mt2,30),
  ethics:0.3*tx(cr.role,30)+(D.pledge?25:0)+0.25*tx(D.rely,30)+0.2*qs_(lr,'q5')};};
L.progress=lr=>{const wu=lr.wu||{},sn=lr.sn||{},ma=lr.ma||{},mc=lr.mc||{},cr=lr.cr||{};const sv=sn.vers||[];
 const m=[(wu.ch||[]).length>=1&&!!wu.m,sv.length>=1,testsDone(lr)>=5,sv.length>=3,Object.keys(sn.o||{}).length>=3,(ma.vers||[]).length>=2,(mc.runs||0)>=1,(cr.vers||[]).length>=1&&(cr.idea||'').trim().length>=6,Object.keys(lr.quiz||{}).length>=5,!!(lr.diary||{}).submitted];
 return m.filter(Boolean).length/m.length;};
L.quiz=QUIZ;
L.flow=[
 {seg:'导入',from:'l11-s0'},
 {seg:'挑战一',kp:'知识点一 · 规则变代码，要求逐步细化',learn:['AI 先回忆经典游戏规则，再把规则转化成代码','改规则就是改代码：speed 越小，小蛇越快','功能不全时，每次补一两条具体要求，再试玩'],sum:['能运行不等于规则全对，要亲自试玩、逐项检查','补充具体要求后，界面和功能一版版变好'],from:'l11-s1',to:'l11-s1b'},
 {seg:'挑战二',kp:'知识点二 · 玩中学',learn:['学习型游戏一举多得：能玩、能学、能比一比','向 AI 说清：给谁练、练什么、练多少、怎么评'],sum:['只说“生成速算游戏”，题会太难、计时会出错','排行榜比一比，错题本重练；成绩存进班级记录'],from:'l11-s2',to:'l11-s3'},
 {seg:'综合运用',from:'l11-s4',to:'l11-s4b'},
 {seg:'反思与总结',from:'l11-quiz'}
];
L.diaryTitle='我的小游戏';
L.diaryQ=[['adv','AI 做游戏的优势和局限'],['rely','依靠 AI 与亲自参与'],['know','对 AI 辅助编程的新认识'],['idea','我的小游戏还能怎么改']];
const xe=s=>String(s||'').replace(/[<&>"]/g,'');
function gameCard(title,sub,f){const T=TH[(f&&f.ui&&f.ui.bg)||'grass']||TH.grass;const cells=[[3,5],[4,5],[5,5],[6,5],[6,4],[6,3],[7,3],[8,3],[9,3]];
 return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200"><rect width="320" height="200" fill="#eaf2ff"/><rect x="18" y="18" width="164" height="164" rx="6" fill="${T.field}" stroke="${T.line}" stroke-width="3"/>${cells.map(([x,y],i)=>`<rect x="${20+x*16}" y="${20+y*16}" width="14" height="14" fill="${i===cells.length-1?T.head:T.snake}"/>`).join('')}<circle cx="${28+11*16}" cy="${28+3*16}" r="6" fill="${T.food}"/><text x="196" y="70" font-size="17" font-weight="700" fill="#1b2550" font-family="Noto Sans SC,sans-serif">${xe(cut(title,7))}</text><text x="196" y="98" font-size="12.5" fill="#4c5884" font-family="Noto Sans SC,sans-serif">${xe(cut(sub,9))}</text><text x="302" y="186" font-size="11" fill="#4c5884" text-anchor="end" font-family="Noto Sans SC,sans-serif">AI 生成 · 我设计</text></svg>`);}
function mathCard(b,lv){return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200"><rect width="320" height="200" fill="#eaf2ff"/><rect x="0" y="0" width="6" height="200" fill="#2f6bff"/><text x="28" y="52" font-size="15" fill="#4c5884" font-family="Noto Sans SC,sans-serif">速算挑战 · ${xe(LV[lv]||'')}</text><text x="28" y="118" font-size="54" font-weight="700" fill="#1b2550" font-family="JetBrains Mono,monospace">${b.c}/${NQ}</text><text x="28" y="158" font-size="20" fill="#0a8a63" font-family="JetBrains Mono,monospace">${xe(b.t)} 秒</text></svg>`);}
L.works=lr=>{const o=[];const my=lr.my,cr=lr.cr||{},sn=lr.sn||{},mc=lr.mc||{};
 if(my&&my.t){o.push({t:'我的小游戏 · '+my.t,s:cr.idea&&my.from==='cr'?'我的创意：'+cut(cr.idea,40):`用过 ${snCards(lr).size} 张需求卡，共 ${(sn.vers||[]).length} 版`,img:gameCard(my.from==='cr'?'我的创意版':'贪吃蛇',my.t.replace(/^.*?(第 \d+ 版)$/,'$1'),my.f)});}
 const bs=Object.entries(mc.best||{}).sort((a,b)=>b[1].c-a[1].c||a[1].t-b[1].t)[0];if(bs)o.push({t:'速算挑战 · 最好成绩',s:`${LV[bs[0]]}：答对 ${bs[1].c}/${NQ}，用时 ${bs[1].t} 秒${(mc.wrong||[]).length?`；错题本 ${(mc.wrong||[]).length} 道`:''}`,img:mathCard(bs[1],bs[0])});
 else if(cr.idea&&!(my&&my.from==='cr'))o.push({t:'我的游戏创意',s:cut(cr.idea,50),glyph:'创'});
 return o;};
L.expCount=lr=>lr.nExp||0;
L.classPanels=recs=>{const R=recs.map(r=>(r.lessons||{})[K]||{}).filter(l=>Object.keys(l).length);if(!R.length)return '';
 const bar=(n,v,tot,col,lab)=>`<div class="hbar"><span>${n}</span><span class="tr"><i style="width:${tot?100*v/tot:0}%;background:${col}"></i></span><span>${lab!=null?lab:v}</span></div>`;
 const SV=R.filter(l=>((l.sn||{}).vers||[]).length);const avg=SV.length?SV.reduce((s,l)=>s+l.sn.vers.length,0)/SV.length:0;
 const dist=[[1,1,'只做了 1 版'],[2,2,'2 版'],[3,99,'3 版及以上']].map(([a,b,n])=>[n,SV.filter(l=>l.sn.vers.length>=a&&l.sn.vers.length<=b).length]);
 const cc=SN_CARDS.map(c=>[c.t,R.filter(l=>snCards(l).has(c.id)).length]);const ccM=Math.max(1,...cc.map(x=>x[1]));
 const tested=R.filter(l=>testsDone(l)>=5).length,found=R.filter(l=>probs(l)>0).length;
 const MV=R.filter(l=>((l.ma||{}).vers||[]).length);const mcd=MA_CARDS.map(c=>[c.t,R.filter(l=>maCards(l).has(c.id)).length]);const mcM=Math.max(1,...mcd.map(x=>x[1]));
 const TM=R.filter(l=>(l.ma||{}).tm),TMb=TM.filter(l=>Math.abs(l.ma.tm.r-1)>0.1).length,TMj=R.filter(l=>((l.ma||{}).o||{}).tm!=null&&(l.ma||{}).tm),TMok=TMj.filter(l=>tmJudge(l.ma)===1).length;
 const MC_=R.filter(l=>(l.mc||{}).runs);const lvS=Object.keys(LV).map(k=>{const b=MC_.map(l=>(l.mc.best||{})[k]).filter(Boolean);return [k,b.length,b.length?b.reduce((s,x)=>s+x.c,0)/b.length:0,b.length?b.reduce((s,x)=>s+x.t,0)/b.length:0];}).filter(x=>x[1]);
 const tps={};R.forEach(l=>Object.entries((l.mc||{}).tps||{}).forEach(([k,n])=>tps[k]=(tps[k]||0)+n));const tpL=Object.entries(tps).sort((a,b)=>b[1]-a[1]);const tpM=Math.max(1,...tpL.map(x=>x[1]));
 const FP=FREE.map((t,j)=>[t,R.filter(l=>((l.cr||{}).free||{}).pick===j).length]).filter(x=>x[1]);const fpN=FP.reduce((s,x)=>s+x[1],0);
 const dims=DIMS.map(([k,n])=>[n,R.filter(l=>((l.cr||{}).dims||[]).includes(k)).length]);const CRn=R.filter(l=>((l.cr||{}).vers||[]).length).length;
 return `<div class="box"><div class="box-t">第11讲 · 贪吃蛇工坊：迭代与试玩测试</div><p style="font-size:13.5px">平均每人做了 <b class="mono">${avg.toFixed(1)}</b> 版（${SV.length} 人参与）</p>${dist.map(([n,v])=>bar(n,v,SV.length,'var(--cyan)')).join('')}
   <b style="font-size:13px;display:block;margin-top:8px">用过各张优化需求卡的人数</b>${cc.map(([n,v])=>bar(n,v,ccM,'var(--amber)')).join('')}
   <b style="font-size:13px;display:block;margin-top:8px">试玩挑毛病</b>${bar('试玩后挑过毛病',tested,R.length,'var(--green)',`${tested}/${R.length}`)}${bar('发现至少 1 个问题',found,R.length,'var(--red)',`${found}/${R.length}`)}
   <b style="font-size:13px;display:block;margin-top:8px">速算游戏工坊（${MV.length} 人）：用过的需求卡</b>${mcd.map(([n,v])=>bar(n,v,mcM,'var(--violet)')).join('')}
   <p class="note" style="margin-top:6px">计时对表 ${TM.length} 人，其中 ${TMb} 人测出计时不准；${TMj.length} 人作了判断，${TMok} 人判断与对表结果一致。</p></div>
  <div class="box"><div class="box-t">第11讲 · 速算挑战与我的创意</div><p style="font-size:13.5px">完成平台速算挑战 <b class="mono">${MC_.length}</b> 人</p>
   ${lvS.map(([k,n,c,t])=>bar(`${LV[k]}（${n} 人）`,c,NQ,'var(--green)',`${c.toFixed(1)} 题 / ${t.toFixed(0)} 秒`)).join('')||'<p class="note">暂无挑战成绩。</p>'}
   <b style="font-size:13px;display:block;margin-top:8px">全班错题类型（道次）</b>${tpL.length?tpL.slice(0,6).map(([n,v])=>bar(n,v,tpM,'var(--red)')).join(''):'<p class="note">暂无错题。</p>'}
   <b style="font-size:13px;display:block;margin-top:8px">AI 自由发挥的游戏像什么（${fpN} 人判断）</b>${FP.map(([n,v])=>bar(n,v,fpN,n==='从没见过的新玩法'?'var(--amber)':'var(--cyan)')).join('')||'<p class="note">暂无。</p>'}
   <b style="font-size:13px;display:block;margin-top:8px">创意改动方向（${CRn} 人让 AI 执行了自己的创意）</b>${dims.map(([n,v])=>bar(n,v,R.length,'var(--violet)')).join('')}</div>`;};
L.classSug=recs=>{const R=recs.map(r=>(r.lessons||{})[K]||{}).filter(l=>Object.keys(l).length);if(!R.length)return [];const out=[];
 const SV=R.filter(l=>((l.sn||{}).vers||[]).length);const few=SV.filter(l=>l.sn.vers.length<3).length;const noTest=SV.filter(l=>testsDone(l)<3).length;
 if(SV.length>=3&&noTest/SV.length>=0.35)out.push(`${noTest}/${SV.length} 名学生生成了贪吃蛇却没有试玩挑毛病：投屏演示第 1 版“按反方向键直接撞死”的问题，带全班逐项试玩，再用「修掉头毛病」需求卡把问题说具体。`);
 else if(SV.length>=3&&few/SV.length>=0.4)out.push(`${few}/${SV.length} 名学生的贪吃蛇不到 3 版就停下了：示范“试玩 → 挑出毛病 → 选一张需求卡 → 再试玩”的循环，强调一次只改一处。`);
 const tps={};R.forEach(l=>Object.entries((l.mc||{}).tps||{}).forEach(([k,n])=>tps[k]=(tps[k]||0)+n));const top=Object.entries(tps).sort((a,b)=>b[1]-a[1])[0];
 if(top&&top[1]>=5)out.push(`速算挑战里全班「${top[0]}」类错题最多（${top[1]} 道次）：用 5 分钟讲一道典型题的算法，再让学生用“重练错题”巩固。`);
 const FPn=R.filter(l=>((l.cr||{}).free||{}).pick!=null);const nov=FPn.filter(l=>l.cr.free.pick===FREE.length-1).length;
 if(out.length<2&&FPn.length>=4&&nov/FPn.length>=0.3)out.push(`${nov}/${FPn.length} 名学生认为 AI 自由发挥的是“从没见过的新玩法”：把几份作品投屏，请全班找出它们分别像哪个经典游戏，讨论“复刻”和“原创”的区别。`);
 return out.slice(0,2);};
L.demo=(rnd,t)=>{const p=x=>rnd()<x;const pk=a=>a[Math.floor(rnd()*a.length)];const lr={};
 lr.wu={ch:['speed','grid','wall'].filter(()=>p(.3+t*.5)),plays:p(.5+t*.4)?1+Math.floor(rnd()*3):0};if(p(.4+t*.55)){const ok=Math.min(4,Math.max(1,Math.round(t*4+rnd()*1.5-.5)));lr.wu.m={ok,n:1,first:ok,p:{}};}if(p(.4+t*.5))lr.wu.q={first:p(.55+t*.4)?0:1,last:p(.3+t*.6)?0:1};
 const nv=Math.max(1,Math.round(0.6+t*4.2*(0.4+0.7*rnd())));const order=['btn','keys','diff','ui','score','fix'];const vers=[];let sp=85;
 const ord=order.slice().sort(()=>rnd()-.5);ord.splice(ord.indexOf('btn'),1);ord.unshift('btn');
 for(let i=0;i<Math.min(nv,7);i++){const c=i?[ord[(i-1)%ord.length]].concat(p(.3)?[ord[i%ord.length]]:[]):[];if(c.includes('diff'))sp=pk([180,150,130]);const tt={};if(p(.3+t*.6))SN_T.forEach(([k])=>{if(p(.5+t*.4))tt[k]=i===0&&['pause','restart','turn','speed'].includes(k)?0:(p(.85)?1:0);});
  vers.push({p:i?'（需求卡）':'生成贪吃蛇游戏',c,e:p(t*.4)?1:0,f:null,m:'offline',ln:60+i*9,ms:2500+Math.round(rnd()*900),k:{sp,col:4+i,ok:Math.min(5,i)},t:tt});}
 lr.sn={vers,n:nv};if(p(.35+t*.6))lr.sn.o={o1:p(.6)?1:0,o2:p(.7)?0:1,o3:p(.6+t*.3)?0:1};
 
 if(p(.4+t*.55)){const mn=1+Math.floor(rnd()*(1+t*4));const mo=['tm','qs','btn','rank','wrong','ui','n20'].sort(()=>rnd()-.5);let acc=[];lr.ma={vers:Array.from({length:Math.min(mn,6)},(_,i)=>{const c=i?[mo[(i-1)%mo.length]]:[];acc=acc.concat(c);const has=x=>acc.includes(x);return {p:i?'（需求卡）':'生成速算游戏',c,e:0,f:null,m:'offline',ln:70+i*8,ms:2600,k:{n:has('n20')?20:(has('qs')||has('rank')||has('wrong'))?10:null,tm:1,rk:has('rank')?1:0,wr:has('wrong')?1:0}};})};
  if(p(.3+t*.6))lr.ma.tm={r:p(.6)?pk([2,3,1.5]):1,s:10+Math.floor(rnd()*20)};
  if(p(.35+t*.6)){const bad=lr.ma.tm&&Math.abs(lr.ma.tm.r-1)>0.1;lr.ma.o={d:pk([0,1,1]),tm:p(.5+t*.45)?(bad?1:0):(bad?0:1),cnt:pk([0,0,2]),fn:pk([0,1,2]),rf:p(.6)?1:pk([0,2])};}}
 if(p(.45+t*.5)){const lv=pk(['g4','g5','g5','g6']);const runs=1+Math.floor(rnd()*3*t+rnd());const c=Math.min(10,Math.max(3,Math.round(4+t*6+rnd()*2-1)));const tt=Math.round((90-t*45+rnd()*30)*10)/10;
  const tpsPool={g4:['乘法','除法','加减','简便运算'],g5:['小数','除法','乘法'],g6:['百分数','简便运算','四则混合','除法']}[lv];const tps={};for(let i=0;i<10-c;i++){const k=pk(tpsPool);tps[k]=(tps[k]||0)+1;}
  lr.mc={runs,lv,best:{[lv]:{c,t:tt}},last:{lv,c,t:tt},tps,wrong:Array.from({length:Math.min(4,10-c)},()=>{const q=mkQ(lv);return {q:q.s,a:q.a,y:String(q.a+1),tp:q.tp,lv};}),fixed:p(t)?Math.floor(rnd()*3):0};
  if(p(t-.05))lr.mc.mt2=pk(['英语单词闯关：限时拼单词、错词本、全班排行榜。','成语接龙：每关 10 个成语，答错有提示。']);}
 const cr={};if(p(.35+t*.6)){cr.free={m:'offline',ln:45,title:'打地鼠',pick:p(.75+t*.2)?1:pk([5,6])};cr.free.first=cr.free.pick;}
 if(p(.3+t*.6)){cr.dims=DIMS.map(d=>d[0]).filter(()=>p(.3+t*.3));if(!cr.dims.length)cr.dims=['rule'];cr.idea=pk(['场地上有石头障碍，撞到石头就结束，还要收集星星回家。','晚上只能看见蛇头附近，吃到金色食物一下长三节。','小蛇变成彩虹色，每吃一个食物就换一种颜色。']);
  if(p(.5+t*.4)){cr.vers=[{p:cr.idea,c:[],e:1,f:null,m:'offline',ln:120,ms:2800,k:{}}];cr.match=pk([0,1,1,2]);if(p(t))cr.role='创意是我想的：障碍物和星星；AI 负责写代码画出来。';}}
 lr.cr=cr;if((lr.sn.vers||[]).length)lr.my={from:cr.vers?'cr':'sn',i:0,t:cr.vers?'我的创意版 第 1 版':`贪吃蛇 第 ${lr.sn.vers.length} 版`,m:'offline',f:Object.assign({},SN_FULL,cr.vers?{mods:['rocks','story']}:{}),html:''};
 const q=(id,pp)=>{const ok=p(pp);const a=QUIZ.find(x=>x.id===id).a;return {first:ok?a:(a+1)%4,ok,last:a};};
 if(p(.3+t*.7))lr.quiz={q1:q('q1',.65+t*.35),q2:q('q2',.7+t*.3),q3:q('q3',.5+t*.45),q4:q('q4',.55+t*.4),q5:q('q5',.65+t*.35)};
 if(p(.2+t*.7))lr.diary={adv:p(t)?'优势：几秒钟就能写出能玩的游戏；局限：会漏功能、计时会出错，想不出新玩法。':'很快。',rely:p(t)?'写代码可以靠 AI，提出创意、试玩找问题、决定好不好玩要自己来。':'写代码。',know:p(t)?'AI 写的代码也要测试；我还想做一个背单词的小游戏。':'很好用。',idea:p(t)?'加一个双人模式，两条蛇比赛谁先吃到 10 个食物。':'更难。',pledge:p(.7),submitted:p(t+.1)?1:0};
 lr.nExp=nv+((lr.ma||{}).vers||[]).length+((lr.mc||{}).runs||0)+((cr.vers||[]).length)+(cr.free?1:0);
 return lr;};
})();
