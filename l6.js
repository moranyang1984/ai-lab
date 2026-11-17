/* 第6讲 翻译工作室 (v3) — 问候气泡墙 / 环球翻译厅 / 超级词典三步 / 拍照翻译 / 语境小实验 / 补一句语境 / 人机翻译擂台 / AI 会取代人吗 / 跨语言小导游 */
(function(){
const {$,$$,esc,clamp}=App;const K='l6';const L={};App.lessons[K]=L;

/* ---------- languages ---------- */
const LANGS=[['en','英语','en-US'],['zh','中文','zh-CN'],['fr','法语','fr-FR'],['es','西班牙语','es-ES'],['ru','俄语','ru-RU'],['ja','日语','ja-JP'],['de','德语','de-DE']];
const LN=c=>(LANGS.find(x=>x[0]===c)||[c,c])[1];
const BCP=c=>(LANGS.find(x=>x[0]===c)||[0,0,'en-US'])[2];
const detect=s=>/[぀-ヿ]/.test(s)?'ja':/[一-鿿]/.test(s)?'zh':/[а-яё]/i.test(s)?'ru':/[ñ¡¿]/i.test(s)?'es':/[äöüß]/i.test(s)?'de':/[àâçèêëîïôûùœ]/i.test(s)?'fr':'en';
const norm=s=>String(s||'').toLowerCase().replace(/[\s，。！？、；：“”‘’,.!?;:"'()（）—…-]/g,'');

/* ---------- graded texts (textbook sequence) ---------- */
const STORY_EN="The Lost Kite\nOn a windy afternoon, Lily's kite got tangled in an old oak tree. She tried to reach it with a broom, but the branch was too high. A gentle neighbour noticed her and fetched a ladder. Soon the kite was soaring again, and Lily waved to him gratefully.";
const STORY_ZH="丢失的风筝\n一个刮风的下午，莉莉的风筝缠在了一棵老橡树上。她想用扫帚把它够下来，可是树枝太高了。一位和善的邻居注意到了她，搬来了一架梯子。很快，风筝又高高地飞上了天空，莉莉感激地向他挥手。";
const SCI_EN="How Do Machines Translate?\nModern translation systems are built on neural networks that have been trained on billions of sentence pairs collected from multilingual documents. Instead of looking up words one by one, the model converts an entire sentence into a sequence of numerical representations, which capture not only the meaning of each word but also its relationship to the surrounding context. A component known as the attention mechanism then allows the system to focus on the most relevant parts of the source sentence while generating each word of the translation, which explains why it can handle differences in word order between languages such as Chinese and English.";
const SCI_ZH="机器是怎样翻译的？\n现代翻译系统建立在神经网络之上，这些神经网络用从多语种文档中收集来的数十亿个句子对训练而成。模型不是逐个查词，而是把整句话转换成一串数字表示；这些数字不仅记录了每个词的意思，还记录了它和上下文之间的关系。接着，一个被称为“注意力机制”的部件，让系统在生成译文的每一个词时，都把注意力集中在原句中最相关的部分。这就解释了为什么它能处理中文和英文等语言之间的语序差异。";
const TX=[
 {id:'s1',lv:1,from:'zh',text:'我昨天在图书馆看书。',tr:{en:'I read in the library yesterday.'},
  al:{en:{s:['我','昨天','在','图书馆','看书'],t:['I','read','in','the library','yesterday'],l:[0,4,2,3,1],c:[['I','me'],['yesterday'],['in','at','on'],['library'],['read','read books','look at books']]}}},
 {id:'s2',lv:1,from:'zh',text:'今天天气很好，我们去公园吧。',tr:{en:"The weather is nice today. Let's go to the park."},
  al:{en:{s:['今天','天气','很好','我们','去','公园','吧'],t:['The weather','is nice','today',"Let's",'go to','the park'],l:[2,0,1,3,4,5,3],c:[['today'],['weather','the weather'],['very good','is nice'],['we','us'],['go','go to'],['park','the park'],['(语气词)',"let's"]]}}},
 {id:'s3',lv:1,from:'zh',text:'这个苹果比那个大。',tr:{en:'This apple is bigger than that one.'},
  al:{en:{s:['这个','苹果','比','那个','大'],t:['This','apple','is bigger','than','that one'],l:[0,1,3,4,2],c:[['this'],['apple'],['compare','than'],['that','that one'],['big','bigger','is bigger']]}}},
 {id:'s4',lv:1,from:'zh',text:'我的妈妈是一名医生。',tr:{en:'My mother is a doctor.'},
  al:{en:{s:['我的','妈妈','是','一名','医生'],t:['My','mother','is','a','doctor'],l:[0,1,2,3,4],c:[['my','mine'],['mom','mother'],['is','am','are'],['a','one'],['doctor']]}}},
 {id:'e1',lv:2,from:'en',text:'I have a cat and her name is Mimi.',tr:{zh:'我有一只猫，它的名字叫咪咪。'},
  al:{zh:{s:['I','have','a cat','and','her name','is','Mimi'],t:['我','有','一只猫','它的名字','叫','咪咪'],l:[0,1,2,-1,3,4,5],c:[['我'],['有','拥有'],['一只猫','一个猫'],['和','而且'],['她的名字','它的名字'],['是','叫'],['咪咪']],note:'her 本来是“她的”。AI 看到前面说的是 cat（猫），就选了“它的”。'}}},
 {id:'e2',lv:2,from:'en',text:'Where is the nearest subway station?',tr:{zh:'最近的地铁站在哪里？'},
  al:{zh:{s:['Where','is','the nearest','subway station'],t:['最近的','地铁站','在','哪里'],l:[3,2,0,1],c:[['哪里','在哪儿'],['是','在'],['最近的','最接近的'],['地铁站','地下铁车站']]}}},
 {id:'e3',lv:2,from:'en',text:'We play football after school every Friday.',tr:{zh:'我们每周五放学后踢足球。'},
  al:{zh:{s:['We','play football','after school','every Friday'],t:['我们','每周五','放学后','踢足球'],l:[0,3,2,1],c:[['我们'],['玩足球','踢足球'],['在学校之后','放学后'],['每个星期五','每周五']]}}},
 {id:'st',lv:3,from:'en',title:'英文小故事 The Lost Kite',text:STORY_EN,tr:{zh:STORY_ZH},hard:['tangled','oak','broom','gentle','fetched','soaring','gratefully']},
 {id:'sc',lv:4,from:'en',title:'英文科技短文 How Do Machines Translate?',text:SCI_EN,tr:{zh:SCI_ZH},hard:['neural networks','trained','billions','multilingual','numerical representations','capture','component','attention mechanism','relevant','generating']},
 {id:'z1',lv:5,from:'zh',text:'你好，很高兴认识你。',tr:{en:'Hello, nice to meet you.',fr:'Bonjour, ravi de te rencontrer.',es:'Hola, encantado de conocerte.',ru:'Привет, рад с тобой познакомиться.',ja:'こんにちは、お会いできてうれしいです。',de:'Hallo, schön, dich kennenzulernen.'},
  al:{en:{s:['你好','很高兴','认识','你'],t:['Hello','nice','to meet','you'],l:[0,1,2,3],c:[['hello','hi'],['very happy','nice'],['know','meet'],['you']]},
      ru:{s:['你好','很高兴','认识','你'],t:['Привет','рад','с тобой','познакомиться'],l:[0,1,3,2],c:[['Привет','Здравствуйте'],['рад'],['познакомиться'],['ты','с тобой']]}}},
 {id:'z2',lv:5,from:'zh',text:'谢谢你的帮助。',tr:{en:'Thank you for your help.',fr:'Merci pour ton aide.',es:'Gracias por tu ayuda.',ru:'Спасибо за твою помощь.',ja:'助けてくれてありがとう。',de:'Danke für deine Hilfe.'},
  al:{fr:{s:['谢谢','你的','帮助'],t:['Merci','pour','ton','aide'],l:[0,2,3],c:[['Merci'],['ton','ta','votre'],['aide']]},
      ja:{s:['谢谢','你的','帮助'],t:['助けて','くれて','ありがとう'],l:[2,1,0],c:[['ありがとう'],['あなたの','くれて'],['助け','助けて']]}}},
 {id:'z3',lv:5,from:'zh',text:'我喜欢学习外语。',tr:{en:'I like learning foreign languages.',fr:"J'aime apprendre les langues étrangères.",es:'Me gusta aprender idiomas extranjeros.',ru:'Я люблю изучать иностранные языки.',ja:'私は外国語を勉強するのが好きです。',de:'Ich lerne gern Fremdsprachen.'},
  al:{ja:{s:['我','喜欢','学习','外语'],t:['私は','外国語を','勉強するのが','好きです'],l:[0,3,2,1],c:[['私は','僕は'],['好き','好きです'],['勉強する','学ぶ'],['外国語']],note:'日语把动词放在句子最后，所以“喜欢”挪到了最后。'},
      de:{s:['我','喜欢','学习','外语'],t:['Ich','lerne','gern','Fremdsprachen'],l:[0,2,1,3],c:[['ich'],['mögen','gern'],['lernen','lerne'],['Fremdsprachen']],note:'德语常说“我 学习 喜欢地 外语”，“喜欢”变成了副词 gern。'},
      en:{s:['我','喜欢','学习','外语'],t:['I','like','learning','foreign languages'],l:[0,1,2,3],c:[['I'],['like','love'],['study','learning'],['foreign language','foreign languages']]}}}];
const LEVELS=[[1,'简单中文 → 英语','en'],[2,'简单英文 → 中文','zh'],[3,'英文小故事 → 中文','zh'],[4,'英文科技短文（长难句）→ 中文','zh'],[5,'中文 → 俄 / 法 / 西语','ru']];
const findPre=t=>{const n=norm(t);return n?TX.find(x=>norm(x.text)===n)||null:null;};

/* ---------- a small bilingual dictionary: what "looking it up word by word" gives ---------- */
const DZ={'我':'I','昨天':'yesterday','在':'at','图书馆':'library','看':'look','书':'book','今天':'today','天气':'weather','很':'very','好':'good','我们':'we','去':'go','公园':'park','我的':'my','妈妈':'mother','是':'is','一名':'a','医生':'doctor','这个':'this','苹果':'apple','比':'compare','那个':'that','大':'big','你好':'hello','高兴':'happy','认识':'know','你':'you','谢谢':'thank','的':'of','帮助':'help','喜欢':'like','学习':'study','外语':'foreign language','有':'have','一只':'one','猫':'cat','它':'it','名字':'name','叫':'call','最近':'recently','地铁站':'subway station','哪里':'where','每':'every','周五':'Friday','放学':'school over','后':'after','踢':'kick','足球':'football','意思':'meaning','真':'really','行':'OK','这':'this','那':'that','故宫':'Palace Museum','西湖':'West Lake','了':'(le)','吧':'(ba)','一':'one','个':'(ge)','小':'small','菜':'vegetable','碟':'dish'};
const DE={i:'我',have:'有',a:'一个',cat:'猫',and:'和',her:'她的',name:'名字',is:'是',where:'哪里',the:'这',nearest:'最近的',subway:'地铁',station:'站',we:'我们',play:'玩',football:'足球',after:'在……之后',school:'学校',every:'每一个',friday:'星期五',on:'在……上',windy:'有风的',afternoon:'下午',kite:'风筝',got:'得到',in:'在……里',an:'一个',old:'老的',tree:'树',she:'她',tried:'尝试',to:'到',reach:'到达',it:'它',with:'和',but:'但是',branch:'树枝',was:'是',too:'太',high:'高的',noticed:'注意到',neighbour:'邻居',ladder:'梯子',soon:'很快',again:'又',waved:'挥手',him:'他',lost:'丢失的',lily:'莉莉',piece:'一块',of:'的',cake:'蛋糕',you:'你',go:'去',"let's":'让我们',meet:'见面',at:'在',bank:'银行',break:'打破',leg:'腿',modern:'现代的',translation:'翻译',system:'系统',are:'是',built:'建造',network:'网络',that:'那个',been:'是',sentence:'句子',pair:'对',from:'从',instead:'代替',looking:'看',up:'上',word:'单词',one:'一',by:'被',model:'模型',convert:'转换',entire:'整个',into:'进入',sequence:'序列',which:'哪个',not:'不',only:'只',meaning:'意思',each:'每个',also:'也',its:'它的',then:'然后',allow:'允许',focus:'集中',most:'最',part:'部分',source:'来源',while:'当',why:'为什么',can:'能',handle:'处理',order:'顺序',between:'在……之间',language:'语言',such:'这样的',as:'像',chinese:'中文',english:'英语',how:'怎样',do:'做',machine:'机器',translate:'翻译',hello:'你好',nice:'好的',thank:'谢谢',your:'你的',help:'帮助',like:'喜欢',learning:'学习',foreign:'外国的',document:'文件',collected:'收集',difference:'差别',known:'已知的',explain:'解释',relationship:'关系',surrounding:'周围的',context:'上下文',have:'有'};
function dictTr(text,from){
 if(from==='zh'){const out=[];let i=0;const s=String(text);while(i<s.length){const ch=s[i];if(/[，。！？、；：“”,.!?\s]/.test(ch)){out.push({w:ch,p:1});i++;continue;}let hit=null;for(let n=4;n>=1;n--){const w=s.substr(i,n);if(DZ[w]){hit=w;break;}}if(hit){out.push({w:DZ[hit],src:hit});i+=hit.length;}else{out.push({w:ch,src:ch,miss:1});i++;}}return out;}
 return String(text).split(/(\s+|[,.!?;:"“”()—\n])/).filter(x=>x&&!/^\s+$/.test(x)).map(t=>{if(/^[,.!?;:"“”()—\n]$/.test(t))return {w:t===','?'，':t==='.'?'。':t,p:1};const k=t.toLowerCase().replace(/’/g,"'");const v=DE[k]||DE[k.replace(/'s$/,'')]||DE[k.replace(/(es|s)$/,'')]||DE[k.replace(/ed$/,'')]||DE[k.replace(/ing$/,'')]||null;return v?{w:v,src:t}:{w:t,src:t,miss:1};});}
const dictHTML=(toks,sep)=>toks.map(o=>o.p?esc(o.w):o.miss?`<span class="l6-miss" title="小词典里查不到">${esc(o.src)}?</span>`:`<span title="${esc(o.src)}">${esc(o.w)}</span>`).join(sep);
const dictText=(toks,sep)=>toks.map(o=>o.p?o.w:o.miss?o.src+'?':o.w).join(sep);

/* ---------- 3-step "super dictionary" alignment diagram ---------- */
const tw=s=>[...String(s)].reduce((a,c)=>a+(/[⺀-鿿぀-ヿ＀-￯]/.test(c)?15:8.4),0);
function links(al){const o=[];al.s.forEach((_,i)=>{const j=al.l[i];if(j!=null&&j>=0)o.push([i,j]);});return o;}
function crossing(al){const ln=links(al);return ln.map(([i,j])=>ln.some(([a,b])=>(i-a)*(j-b)<0));}
function movers(al){const ln=links(al);const ns=Math.max(1,al.s.length-1),nt=Math.max(1,al.t.length-1);const d=ln.map(([i,j])=>[i,Math.abs(i/ns-j/nt)]);const mx=Math.max(0,...d.map(x=>x[1]));return {cross:crossing(al).some(Boolean),best:d.filter(x=>x[1]>=mx-0.12).map(x=>x[0]),cand:ln.map(x=>x[0])};}
function alignSVG(al,step){const n=al.s.length,gap=10,pad=10,H=32;const mid=al.s.map((_,i)=>{const j=al.l[i];return j==null||j<0?'∅':al.t[j];});
 const cw=al.s.map((s,i)=>Math.max(46,tw(s)+22,step>=2?tw(mid[i])+22:0)),bw=al.t.map(t=>Math.max(46,tw(t)+22));
 const W1=cw.reduce((a,b)=>a+b,0)+gap*(n-1),W3=bw.reduce((a,b)=>a+b,0)+gap*(al.t.length-1),W=Math.max(W1,W3,300)+pad*2;
 const x1=[],x3=[];let x=(W-W1)/2;cw.forEach(w=>{x1.push(x);x+=w+gap;});x=(W-W3)/2;bw.forEach(w=>{x3.push(x);x+=w+gap;});
 const Y1=24,Y2=106,Y3=196,Ht=step>=3?236:step>=2?146:64;
 const lab=(y,t)=>`<rect x="${pad-4}" y="${y-21}" width="${(tw(t)*0.82+12).toFixed(0)}" height="18" rx="4" class="lbg"/><text x="${pad}" y="${y-8}" class="lab">${t}</text>`;
 const box=(x,y,w,t,c)=>`<rect x="${x.toFixed(1)}" y="${y}" width="${w.toFixed(1)}" height="${H}" rx="6" class="${c}"/><text x="${(x+w/2).toFixed(1)}" y="${y+21}" text-anchor="middle" class="${c}-t">${esc(t)}</text>`;
 let s=`<svg class="l6-alsvg" viewBox="0 0 ${W.toFixed(0)} ${Ht}" width="${W.toFixed(0)}" height="${Ht}" role="img" aria-label="翻译对齐图">`;let labs=lab(Y1,'① 拆分词语');
 al.s.forEach((t,i)=>s+=box(x1[i],Y1,cw[i],t,'tk'));
 if(step>=2){labs+=lab(Y2,'② 找到对应表达（还是原文顺序）');al.s.forEach((_,i)=>{const cx=x1[i]+cw[i]/2;s+=`<line x1="${cx}" y1="${Y1+H}" x2="${cx}" y2="${Y2}" class="dn"/>`+box(x1[i],Y2,cw[i],mid[i],mid[i]==='∅'?'om':'md');});}
 if(step>=3){labs+=lab(Y3,'③ 按目标语言语法重组');const ln=links(al),cr=crossing(al);const used=new Set(ln.map(x=>x[1]));
  ln.forEach(([i,j],k)=>{const a=x1[i]+cw[i]/2,b=x3[j]+bw[j]/2;s+=`<path d="M${a.toFixed(1)} ${Y2+H} C${a.toFixed(1)} ${Y2+H+30} ${b.toFixed(1)} ${Y3-30} ${b.toFixed(1)} ${Y3}" class="ln${cr[k]?' x':''}"/>`;});
  al.t.forEach((t,j)=>s+=box(x3[j],Y3,bw[j],t,used.has(j)?'tg':'ad'));}
 return s+labs+'</svg>';}
function alFromSegs(segs,out){if(!Array.isArray(segs))return null;const g=segs.filter(x=>x&&String(x.src||'').trim()).slice(0,14);if(g.length<2)return null;
 const pos=g.map(x=>{const d=String(x.dst||'').trim();return d?out.indexOf(d):-1;});const order=g.map((x,i)=>[i,pos[i]]).filter(x=>x[1]>=0).sort((a,b)=>a[1]-b[1]);
 const t=[],idx={};order.forEach(([i])=>{const d=String(g[i].dst).trim();if(!(d in idx)){idx[d]=t.length;t.push(d);}});if(t.length<2)return null;
 return {s:g.map(x=>String(x.src).trim()),t,l:g.map((x,i)=>pos[i]>=0?idx[String(x.dst).trim()]:-1),c:null};}

/* ---------- simulated streaming for demo mode (harder text = slower, with pauses) ---------- */
let simTok=0;
function simStream(text,lv,onText){const tok=++simTok;const first={1:350,2:350,3:650,4:1100,5:450}[lv]||400,per={1:24,2:24,3:40,4:56,5:28}[lv]||22;const nSt={3:2,4:5}[lv]||0;const stops=new Set();for(let k=1;k<=nSt;k++)stops.add(Math.floor(text.length*k/(nSt+1)));
 return new Promise((res,rej)=>{let i=0;const step=()=>{if(tok!==simTok)return rej({code:'cancelled'});if(i>=text.length)return res();const n=Math.min(text.length-i,3);let pause=per*n;for(let j=i;j<i+n;j++)if(stops.has(j))pause+=520+((j*37)%600);i+=n;onText(text.slice(0,i));setTimeout(step,pause);};setTimeout(step,first);});}
function clock(thr){const t0=performance.now();const pts=[[0,0]];let last=null,first=null,stalls=0;
 return {tick(len){const t=performance.now()-t0;if(first==null&&len>0)first=t;if(last!=null&&t-last>thr)stalls++;last=t;pts.push([t,len]);},done(len){const t=performance.now()-t0;pts.push([t,len]);return {ms:Math.round(t),first:Math.round(first==null?t:first),stalls,pts};}};}
function sparkSVG(pts,thr){if(!pts||pts.length<2)return '';const T=Math.max(1,pts[pts.length-1][0]),N=Math.max(1,...pts.map(p=>p[1]));const W=300,H=60;const X=t=>4+t/T*(W-8),Y=n=>H-6-n/N*(H-14);
 let d=`M${X(0)} ${Y(0)}`,gaps='';for(let i=1;i<pts.length;i++){d+=` L${X(pts[i][0]).toFixed(1)} ${Y(pts[i-1][1]).toFixed(1)} L${X(pts[i][0]).toFixed(1)} ${Y(pts[i][1]).toFixed(1)}`;if(i>1&&pts[i][0]-pts[i-1][0]>thr)gaps+=`<rect x="${X(pts[i-1][0]).toFixed(1)}" y="2" width="${(X(pts[i][0])-X(pts[i-1][0])).toFixed(1)}" height="${H-8}" class="gap"/>`;}
 return `<svg class="l6-spk" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="译文字数随时间增长">${gaps}<path d="${d}" class="ln"/></svg>`;}

/* ---------- built-in "photos" for 拍照翻译 ---------- */
const PHOTOS=[
 {id:'museum',name:'博物馆展牌',lang:'en',ocr:'PLEASE DO NOT TOUCH\nTHE EXHIBITS\nNo flash photography',tr:'请勿触摸\n展品\n禁止使用闪光灯拍照'},
 {id:'choc',name:'进口食品标签',lang:'fr',ocr:'Chocolat noir\n70 % cacao\nIngrédients : pâte de cacao, sucre, beurre de cacao.\nPeut contenir des traces de lait.\n100 g',tr:'黑巧克力\n可可含量 70%\n配料：可可液块、糖、可可脂。\n可能含有微量牛奶。\n净含量 100 克'},
 {id:'station',name:'车站指示牌',lang:'ja',ocr:'東口 →\nバスのりば ←\nきっぷうりば ↑',tr:'东口 →\n公交车站 ←\n售票处 ↑'}];
function drawPhoto(cv,id){const g=cv.getContext('2d');const W=cv.width,H=cv.height;g.setTransform(1,0,0,1,0,0);const boxes=[];let rot=0;
 const T=(t,x,y,font,fill,align)=>{g.font=font;g.fillStyle=fill;g.textAlign=align||'center';g.fillText(t,x,y);const m=g.measureText(t);const w=m.width,a=m.actualBoundingBoxAscent||parseInt(font.match(/(\d+)px/)[1])*0.8,dsc=m.actualBoundingBoxDescent||4;const bx=align==='left'?x:x-w/2;boxes.push([bx-6,y-a-5,w+12,a+dsc+10]);};
 if(id==='museum'){const bg=g.createLinearGradient(0,0,W,H);bg.addColorStop(0,'#7a705f');bg.addColorStop(1,'#4b4438');g.fillStyle=bg;g.fillRect(0,0,W,H);for(let i=0;i<60;i++){g.fillStyle=`rgba(255,255,255,${0.015+((i*7)%5)/200})`;g.fillRect(0,i*7,W,2);}
  rot=-0.025;g.translate(W/2,H/2);g.rotate(rot);g.shadowColor='rgba(0,0,0,.55)';g.shadowBlur=24;g.shadowOffsetY=8;g.fillStyle='#1d1a16';g.beginPath();g.roundRect(-240,-135,480,270,14);g.fill();g.shadowColor='transparent';g.strokeStyle='#b08d4a';g.lineWidth=6;g.stroke();g.strokeStyle='#b08d4a66';g.lineWidth=1.5;g.beginPath();g.roundRect(-224,-119,448,238,8);g.stroke();
  T('PLEASE DO NOT TOUCH',0,-56,'700 33px Georgia, "Noto Serif SC", serif','#e6c983');T('THE EXHIBITS',0,-12,'700 33px Georgia, "Noto Serif SC", serif','#e6c983');g.fillStyle='#b08d4a88';g.fillRect(-150,16,300,2);
  g.save();g.translate(-160,72);g.strokeStyle='#e6c983';g.lineWidth=3;g.beginPath();g.roundRect(-22,-14,44,30,5);g.stroke();g.beginPath();g.arc(0,1,9,0,7);g.stroke();g.fillStyle='#e6c983';g.fillRect(-8,-20,14,6);g.strokeStyle='#f25c78';g.lineWidth=4;g.beginPath();g.arc(0,0,30,0,7);g.stroke();g.beginPath();g.moveTo(-21,-21);g.lineTo(21,21);g.stroke();g.restore();
  T('No flash photography',-112,82,'italic 400 27px Georgia, "Noto Serif SC", serif','#e6c983','left');}
 if(id==='choc'){g.fillStyle='#3b2a1f';g.fillRect(0,0,W,H);for(let i=0;i<26;i++){g.strokeStyle=`rgba(0,0,0,${0.15+(i%3)*0.05})`;g.lineWidth=2;g.beginPath();g.moveTo(0,i*16+((i*13)%9));g.bezierCurveTo(W*0.3,i*16+12,W*0.6,i*16-8,W,i*16+6);g.stroke();}
  rot=0.03;g.translate(W/2,H/2);g.rotate(rot);g.shadowColor='rgba(0,0,0,.6)';g.shadowBlur=26;g.shadowOffsetY=10;g.fillStyle='#4a2618';g.fillRect(-250,-160,500,320);g.shadowColor='transparent';g.fillStyle='#efe3c8';g.fillRect(-250,-138,500,110);g.fillStyle='#b8862f';g.fillRect(-250,-28,500,4);
  T('Chocolat noir',0,-82,'italic 700 46px Georgia, "Noto Serif SC", serif','#3a1d10');T('70 % cacao',0,-42,'600 24px Georgia, serif','#7a4a22');
  T('Ingrédients : pâte de cacao, sucre, beurre de cacao.',-230,22,'400 17px "Noto Sans SC", Arial, sans-serif','#efe3c8','left');T('Peut contenir des traces de lait.',-230,56,'400 17px "Noto Sans SC", Arial, sans-serif','#efe3c8','left');T('100 g',190,128,'700 24px Georgia, serif','#efe3c8');}
 if(id==='station'){const bg=g.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#2a2d33');bg.addColorStop(1,'#15171b');g.fillStyle=bg;g.fillRect(0,0,W,H);for(let i=0;i<8;i++){g.fillStyle='rgba(255,255,230,.07)';g.fillRect(i*90+10,0,40,H);}
  rot=-0.015;g.translate(W/2,H/2-6);g.rotate(rot);g.shadowColor='rgba(0,0,0,.6)';g.shadowBlur=20;g.fillStyle='#14213d';g.fillRect(-270,-140,540,280);g.shadowColor='transparent';g.fillStyle='#f9c74f';g.fillRect(-270,-140,540,10);g.fillStyle='#ffffff22';g.fillRect(-270,-36,540,2);g.fillRect(-270,48,540,2);
  const J='"Noto Sans SC","Noto Sans JP","Noto Sans CJK JP","Hiragino Sans",sans-serif';T('東口 →',0,-62,`700 56px ${J}`,'#ffffff');T('バスのりば ←',0,22,`500 32px ${J}`,'#ffffff');T('きっぷうりば ↑',0,106,`500 32px ${J}`,'#ffffff');}
 g.setTransform(1,0,0,1,0,0);return {boxes,rot,cx:W/2,cy:id==='station'?H/2-6:H/2};}

/* ---------- 语境小实验 items ---------- */
const CTX=[
 {id:'cake',from:'en',phrase:'a piece of cake',key:/piece of cake/i,pri:[1,0,2],src:'教材',
  opts:[{t:'一块蛋糕',re:/蛋糕/},{t:'小菜一碟（非常容易）',re:/小菜一碟|容易|简单|轻而易举|易如反掌|不在话下|轻松/},{t:'一份礼物',re:/礼物/}],
  cols:[{k:'n',name:'无语境',lines:[['','a piece of cake']],ans:0,dst:'一块蛋糕',full:'一块蛋糕'},
   {k:'a',name:'对话 1',lines:[['Student A','Would you like a piece of cake?'],['Student B','Yes, please!']],ans:0,dst:'一块蛋糕',full:'学生A：你想吃一块蛋糕吗？\n学生B：好的，谢谢！',sc:'场景：同学请你吃东西'},
   {k:'b',name:'对话 2',lines:[['Student A','This homework looks hard.'],['Student B',"Don't worry. It's a piece of cake."]],ans:1,dst:'小菜一碟',full:'学生A：这份作业看起来好难。\n学生B：别担心，这是小菜一碟。',sc:'场景：两个同学在聊作业难不难'}],
  why:'对话 1 在请人吃东西，a piece of cake 就是“一块蛋糕”；对话 2 在说作业难不难，它是英语习语，意思是“很容易、小菜一碟”。'},
 {id:'leg',from:'en',phrase:'break a leg',key:/break a leg/i,pri:[0,1,2],
  opts:[{t:'祝你好运／演出成功',re:/好运|成功|顺利|加油|精彩|出色/},{t:'摔断（一条）腿',re:/断|骨折|腿/},{t:'休息一下',re:/休息/}],
  cols:[{k:'n',name:'无语境',lines:[['','Break a leg!']],ans:1,dst:'断一条腿',full:'断一条腿！'},
   {k:'a',name:'演出之前',lines:[['Amy',"My play starts in five minutes. I'm so nervous."],['Ben','Break a leg!']],ans:0,dst:'祝你演出成功',full:'艾米：我的话剧五分钟后就开演了，我好紧张。\n本：祝你演出成功！',sc:'场景：话剧马上开演，朋友来打气'},
   {k:'b',name:'结冰的台阶',lines:[['Mom','The stairs are icy. Walk slowly.'],['Mom',"Be careful, or you'll break a leg!"]],ans:1,dst:'摔断腿',full:'妈妈：台阶结冰了，慢慢走。\n妈妈：小心点，不然会摔断腿的！',sc:'场景：台阶结冰了，妈妈在提醒'}],
  why:'英语里演员上台前，大家会说 Break a leg! 祝他演出成功——这是戏剧界的文化习惯；在结冰的台阶上，它就是真的“摔断腿”。'},
 {id:'zhen',from:'zh',phrase:'你真行',key:/真行/,pri:[1,0,2],
  opts:[{t:'真心夸奖（You are amazing!）',re:/amazing|great|awesome|well done|good job|brilliant|impressive|really good|so good|capable|wonderful|fantastic/i},{t:'说反话（Nice going…）',re:/nice going|way to go|sarcas|ironic|oh,? great|thanks a lot|just great|real(ly)? nice|nice one|nice job/i},{t:'你真的可以走了',re:/can go|walk|leave/i}],
  cols:[{k:'n',name:'无语境',lines:[['','你真行！']],ans:0,dst:'You are really good!',full:'You are really good!'},
   {k:'a',name:'考了满分',lines:[['小林','这次数学我考了满分！'],['同桌','你真行！']],ans:0,dst:"You're amazing!",full:"Xiaolin: I got full marks in maths this time!\nDeskmate: You're amazing!"},
   {k:'b',name:'又打碎了杯子',lines:[['弟弟','哎呀，杯子又被我打碎了……'],['姐姐','你真行啊，这个月第三个了。']],ans:1,dst:'Nice going.',full:"Brother: Oops, I broke another cup...\nSister: Nice going. That's the third one this month."}],
  why:'同样是“你真行”，考满分时是真心夸奖；打碎杯子时是带点无奈的反话。说话的语气和场景，决定了它该怎么译。'},
 {id:'yisi',from:'zh',phrase:'意思意思',key:/意思意思/,pri:[2,0,1],
  opts:[{t:'一点心意（表示感谢）',re:/token|gesture|little something|small gift|appreciation|thank/i},{t:'稍微吃／做一点',re:/a little|a bit|a bite|just have|taste|some/i},{t:'meaning meaning（意思的意思）',re:/meaning/i}],
  cols:[{k:'n',name:'无语境',lines:[['','意思意思']],ans:0,dst:'just a small gesture',full:'Just a small gesture.'},
   {k:'a',name:'送小礼物',lines:[['阿姨','谢谢你帮我照看小狗！'],['阿姨','这点小礼物，意思意思。']],ans:0,dst:'a token of my thanks',full:'Auntie: Thank you for looking after my dog!\nAuntie: This little gift is just a token of my thanks.'},
   {k:'b',name:'饭桌上',lines:[['爸爸','再吃一点吧？'],['我','我不太饿，就意思意思吃一口。']],ans:1,dst:"I'll just have a bite",full:"Dad: Have a bit more?\nMe: I'm not very hungry. I'll just have a bite."}],
  why:'“意思意思”在送礼时是“一点心意”，在饭桌上是“稍微吃一点”。中文里很多说法离开了场景，连人都说不清它的意思。'}];

/* ---------- 人机翻译擂台 ---------- */
const ARENA=[
 {id:'you',title:'英文台词',src:'You go, I go.',from:'en',to:'zh',order:['human','ai'],
  v:{ai:{t:'你走，我走。',tag:'AI 直译：逐词对应，只翻出了字面意思（平台预置示例）'},human:{t:'君之所向，吾之所往。',tag:'人工翻译：用古汉语的句式，译出了“你去哪儿，我就跟到哪儿”的深情',serif:1}},
  after:'AI 逐词直译；人工译者体会情感后，用古汉语重新创作。',more:'两版意思都没有错。「你走，我走」逐词对应；「君之所向，吾之所往」是译者体会了说话人的情感后，用古汉语的韵味重新创作的句子——这就是文学翻译里人的作用。'},
 {id:'moon',title:'李白《静夜思》',src:'床前明月光，疑是地上霜。\n举头望明月，低头思故乡。',from:'zh',to:'en',order:['ai','human'],
  v:{ai:{t:'Bright moonlight in front of my bed,\nI suspect it is frost on the ground.\nI raise my head and look at the bright moon,\nI lower my head and think of my hometown.',gloss:'床前明亮的月光，我怀疑那是地上的霜。我抬起头看明亮的月亮，我低下头想我的家乡。',tag:'AI 直译：每句意思都对，但没有韵律（平台预置示例）'},
     human:{t:'I wake, and moonbeams play around my bed,\nGlittering like hoar-frost to my wondering eyes;\nUp towards the glorious moon I raise my head,\nThen lay me down — and thoughts of home arise.',gloss:'我醒来，月光在床边嬉戏，在我惊奇的眼里像白霜一样闪烁；我抬头望向辉煌的明月，然后躺下——思乡之情油然而生。',tag:'人工翻译：翟理斯（Herbert A. Giles）1898 年译本 Night Thoughts',rhyme:['bed','eyes','head','arise'],serif:1}},
  after:'人工译本押了韵，还加了原诗没有的词，把意境写成了英文诗。',more:'翟理斯为了让英文读者也感到这是一首诗，让 bed / head、eyes / arise 押韵，还加了原诗没有的 I wake、wondering eyes。它不是逐字对应，而是把诗的意境和情感重新写成了英文诗。'}];
const CRIT=[['acc','准确'],['flu','通顺'],['emo','有感情']];
const STANCE=[['yes','会：AI 越来越强，以后不需要人工翻译了'],['no','不会完全取代：情感和文化要靠人'],['unsure','说不清']];
const CASES=[['lit','翻译诗歌、小说等文学作品',1],['dip','国家之间的外交谈判',1],['med','药品说明书、法律合同',1],['shop','在商店里问价格',0],['sign','看懂一块路牌',0],['joke','电影里的笑话和双关语',1]];
const HONEST=['直接交上去，当成自己翻译的','说明哪些地方用了 AI 翻译，并自己检查、修改','让 AI 翻好，改几个字就不用说了'];

/* ---------- 跨语言小导游 scripts ---------- */
const PLACES={
 gugong:{n:'故宫',city:'北京',vis:'Emma',vfrom:'加拿大',hi:{en:"Hello! I'm Emma from Canada. This is my first day in Beijing. What is this huge place?",zh:'你好！我是来自加拿大的艾玛，今天是我来北京的第一天。这个很大的地方是哪里？'},
  nodes:[
   {r:[{zh:'这里是故宫，以前是明朝和清朝的皇帝住的地方。',en:'This is the Forbidden City. It was home to the emperors of the Ming and Qing dynasties.'},{zh:'这是那个很有名的地方。',en:'This is that very famous place.',vague:1,v:{en:'Sorry, which famous place? What is it called?',zh:'不好意思，哪个有名的地方？它叫什么名字？'},tip:'「那个很有名的地方」没有说出名字，游客不知道你指的是哪里。直接说出景点的名称。'}],next:{en:'Wow, emperors lived here! How old is it?',zh:'哇，皇帝曾经住在这里！它有多少年历史了？'}},
   {r:[{zh:'故宫已经有六百多年的历史了。',en:'The Forbidden City is more than 600 years old.'},{zh:'它很老了。',en:'It is very old.',vague:2,v:{en:"Ha ha, I can see it's old! But how many years?",zh:'哈哈，我看得出它很老！可是到底有多少年呢？'},tip:'「很老了」信息太少，游客想知道具体年数。给出具体的数字，翻译和交流都会更准确。'}],next:{en:'Why are the walls red and the roofs yellow?',zh:'为什么墙是红色的，屋顶是黄色的？'}},
   {r:[{zh:'在古代，黄色代表皇帝，红色代表吉祥和喜庆。',en:'In ancient China, yellow stood for the emperor, and red stood for good luck and happiness.'},{zh:'因为那个颜色好看。',en:'Because that color looks nice.',vague:1,v:{en:'Which color do you mean, the red or the yellow?',zh:'你说的是哪种颜色，红色还是黄色？'},tip:'「那个颜色」指代不清：游客问了两种颜色。把「那个」换成具体的颜色。'}],next:{en:'Interesting! What is the most famous building here?',zh:'真有意思！这里最有名的建筑是哪一座？'}},
   {r:[{zh:'最有名的是太和殿，皇帝在那里举行重大典礼。',en:'The most famous one is the Hall of Supreme Harmony. Emperors held important ceremonies there.'},{zh:'就是前面那个。',en:"It's that one in front.",vague:1,v:{en:'There are so many buildings in front of us! Which one?',zh:'我们前面有好多建筑呢！是哪一座？'},tip:'「前面那个」在现场也说不清。说出建筑的名字，AI 才能把它准确地翻译出来。'}],next:{en:'Thank you so much! You are a wonderful guide.',zh:'太感谢你了！你是一位很棒的导游。'}},
   {r:[{zh:'不客气，欢迎你下次再来中国！',en:"You're welcome! Please come to China again."}],next:{en:'I will! Goodbye!',zh:'我一定会再来的！再见！'},end:1}]},
 xihu:{n:'西湖',city:'杭州',vis:'Lucas',vfrom:'法国',hi:{en:"Hi! I'm Lucas from France. What a beautiful lake! What is it called?",zh:'你好！我是来自法国的卢卡斯。好美的湖啊！它叫什么名字？'},
  nodes:[
   {r:[{zh:'这是杭州的西湖。',en:'This is West Lake in Hangzhou.'},{zh:'这个湖很有名。',en:'This lake is very famous.',vague:2,v:{en:'I believe it! But what is its name?',zh:'我相信！可是它叫什么名字呢？'},tip:'游客问的是名字，你的回答里没有名字。先回答问题，再补充介绍。'}],next:{en:'What is that bridge over there?',zh:'那边那座桥是什么桥？'}},
   {r:[{zh:'那是断桥，它和中国古老的传说《白蛇传》有关。',en:'That is the Broken Bridge. It is linked to an old Chinese legend, The Legend of the White Snake.'},{zh:'那是一座桥。',en:'That is a bridge.',vague:2,v:{en:"Ha ha, I know it's a bridge! Does it have a name?",zh:'哈哈，我知道那是一座桥！它有名字吗？'},tip:'「一座桥」没有提供新信息。说出桥的名字和它的故事。'}],next:{en:'When is the best time to visit West Lake?',zh:'什么时候来西湖最好？'}},
   {r:[{zh:'春天最美，苏堤上桃花盛开，柳树发出新芽。',en:'Spring is the most beautiful. On the Su Causeway, peach blossoms are everywhere and the willows grow new leaves.'},{zh:'那个时候最好。',en:'That time is the best.',vague:1,v:{en:'Which time? Spring, summer, autumn or winter?',zh:'哪个时候？春天、夏天、秋天还是冬天？'},tip:'「那个时候」指代不清，游客不知道你说的是哪个季节。'}],next:{en:'Sounds lovely! Can I try some local food here?',zh:'听起来真美！我能在这里尝尝当地美食吗？'}},
   {r:[{zh:'你可以尝尝西湖醋鱼，再喝一杯龙井茶。',en:'You can try West Lake fish in vinegar sauce and a cup of Longjing tea.'},{zh:'那个很好吃。',en:'That is very tasty.',vague:1,v:{en:"What is 'that'? I'm not sure what you mean.",zh:'“那个”是什么？我不太明白你的意思。'},tip:'「那个」没有说出是什么食物。把它换成菜名，AI 才能翻译出来。'}],next:{en:'Thank you! You are a great guide.',zh:'谢谢你！你是一位很棒的导游。'}},
   {r:[{zh:'不客气，祝你在杭州玩得开心！',en:"You're welcome! Have fun in Hangzhou!"}],next:{en:'Thanks! Goodbye!',zh:'谢谢！再见！'},end:1}]}};
const VAG=/(它|那个|这个|那边|那里|这里|那儿|这儿|那时|那样)/;
const WHY4=[['ref','用了「它」「那个」，没说清指什么',1],['info','句子信息太少（如“一座桥”）',1],['ai','翻译 AI 出故障了',0]];

const GREET=[['Hello!','en-US','英语'],['你好！','zh-CN','中文'],['Bonjour !','fr-FR','法语'],['¡Hola!','es-ES','西班牙语'],['Привет!','ru-RU','俄语'],['こんにちは！','ja-JP','日语'],['Guten Tag!','de-DE','德语'],['안녕하세요!','ko-KR','韩语'],['Ciao!','it-IT','意大利语'],['Olá!','pt-PT','葡萄牙语'],['مرحبا!','ar-SA','阿拉伯语'],['नमस्ते!','hi-IN','印地语']];

const QUIZ=[
 {id:'q1',q:'教材把 AI 翻译比作一部“超级词典”。它翻译一句话的三个步骤，顺序正确的是？',opts:['拆分成词语 → 在学过的多语种资料里找对应表达 → 按目标语言的语法重新组合','逐字查词典 → 按原文的顺序把词拼起来','先重新组合 → 再拆分 → 最后查词典'],a:0,why:'拆分、查找、重组；最后一步要按目标语言的语法调整语序，所以“昨天”会挪到英文句子的最后。'},
 {id:'q2',q:'为什么 “a piece of cake” 在两段对话里译法不同？',opts:['AI 每次都是随机翻译的','同一个短语在不同语境里意思不同，AI 根据上下文选择了译法','第二段对话里有拼写错误'],a:1,why:'请人吃东西时是“一块蛋糕”，谈作业难不难时是“小菜一碟”。'},
 {id:'q3',q:'想让 AI 翻译得更准确，最好的做法是？',opts:['只输入最短的几个关键词','提供充分、清晰的信息和上下文，少用指代不清的“它”“那个”','一次输入很多互不相关的句子'],a:1,why:'提供的信息越充分、清晰，AI 的翻译结果就越精准。'},
 {id:'q4',q:'关于 AI 翻译，下面哪个说法是正确的？',opts:['AI 翻译从来不会出错','AI 翻译速度快、能处理多种语言，但能力主要依赖它学习过的内容，遇到陌生的词汇和表达可能翻不好','AI 翻译比人工翻译慢'],a:1,why:'AI 又快又能处理多种语言，但它的能力来自学过的资料，也无法自动理解具体情境和引申含义。'},
 {id:'q5',q:'翻译一首古诗时，为什么人工翻译仍然很重要？',opts:['因为 AI 不认识汉字','诗里有细腻的情感和深厚的文化背景，需要人理解后再创作','因为诗太短了，AI 不愿意翻译'],a:1,why:'在涉及细腻情感和深刻文化背景的文学作品翻译中，人类的智慧和经验依然不可替代。'}];

const CSS=`.l6-wall{display:flex;flex-wrap:wrap;gap:10px}
.l6-bub{border:1.5px solid var(--line2);background:#fff;color:var(--ink);border-radius:18px 18px 18px 6px;padding:8px 16px;font-size:20px;font-weight:700;cursor:pointer;display:flex;flex-direction:column;align-items:flex-start;min-width:104px;line-height:1.35;transition:transform .08s}
.l6-bub:hover{border-color:var(--grape)}.l6-bub:active{transform:scale(.96)}
.l6-bub small{font-size:13px;font-weight:500;color:var(--muted)}
.l6-bub.on{border-color:var(--sun);background:var(--sun-soft)}.l6-bub.cur{border-color:var(--grape);box-shadow:0 6px 16px #6c47ff33}
.l6-gq{display:flex;flex-wrap:wrap;gap:8px 10px;align-items:center}.l6-gq:empty{display:none}
.l6-cap{font-size:13.5px;color:var(--muted);margin:4px 0 0}
.l6-pairs{display:flex;flex-direction:column;gap:8px;margin-top:8px}
.l6-pair{display:grid;grid-template-columns:26px minmax(0,1fr) minmax(0,1fr);gap:10px;align-items:start;font-size:16.5px;line-height:1.5;background:#fff;border:1.5px solid var(--line2);border-radius:12px;padding:8px 12px}
.l6-pair i{font-style:normal;font-weight:800;font-size:13.5px;width:24px;height:24px;border-radius:50%;background:var(--sun);color:var(--ink);display:grid;place-items:center}
.l6-pair b{color:var(--grape-d)}
.l6-vs{display:grid;grid-template-columns:1fr 1fr;gap:12px}.l6-vs>*{min-width:0}
.l6-vq{display:flex;flex-direction:column;gap:8px;align-items:flex-start}
.l6-vq .w{font-size:13.5px;font-weight:700;color:var(--muted)}
.l6-vzh{font-size:15.5px;line-height:1.6;color:var(--ink);background:var(--grape-soft);border-radius:12px;padding:8px 12px;align-self:stretch}
.l6-vzh small{display:block;font-size:12.5px;font-weight:700;color:var(--grape-d)}
.l6-dots{display:flex;flex-wrap:wrap;gap:6px;align-items:center;font-size:13.5px;color:var(--muted)}
.l6-dots i{width:12px;height:12px;border-radius:50%;background:var(--line2)}.l6-dots i.d{background:var(--mint)}.l6-dots i.c{background:var(--grape)}
.l6-hist{border:1.5px solid var(--line2);border-radius:14px;padding:8px 12px;background:#fff}.l6-hist summary{cursor:pointer;font-weight:700;font-size:14.5px;color:var(--grape-d)}
.l6-hist[open] summary{margin-bottom:8px}
#l6-rp .chip[disabled]{opacity:.55;text-decoration:line-through;cursor:not-allowed}
.l6-re{display:flex;flex-wrap:wrap;gap:6px;align-items:center;font-size:13.5px;color:var(--muted)}
.fbx .btn.sm{margin-left:8px;vertical-align:baseline}.l6-bub.on small{color:var(--sun-d);font-weight:700}
.l6-col{display:flex;flex-direction:column;gap:14px;min-width:0}
.l6-stage{background:#fff;border:1.5px solid var(--line2);border-radius:16px;padding:16px;display:flex;flex-direction:column;gap:12px;min-width:0;align-self:start}
.l6-tag{align-self:flex-start;font-size:13px;font-weight:700;background:var(--ink);color:#fff;border-radius:999px;padding:2px 12px}
.l6-src{font-size:21px;line-height:1.6;font-weight:500;white-space:pre-wrap;word-break:break-word;color:var(--ink)}
.l6-src.long{font-size:15.5px;font-weight:400;line-height:1.7}
.l6-src.poem{font-family:var(--f-serif);font-size:19px}
.l6-g{font-weight:700;color:var(--ink)}
.l6-tr{font-size:17px;line-height:1.7;white-space:pre-wrap;word-break:break-word;margin-top:6px}
.l6-mini{font-size:13.5px;font-weight:700;color:var(--grape-d);margin-top:8px}
.l6-cur{display:inline-block;width:9px;height:18px;background:var(--grape);vertical-align:-3px;margin-left:2px;border-radius:2px;animation:l6b 1s steps(2) infinite}
@keyframes l6b{50%{opacity:0}}
.l6-hardw{display:flex;flex-wrap:wrap;gap:6px;align-items:center;font-size:13.5px;color:var(--muted)}
.l6-hardw span.w{border:2px dashed var(--amber);color:var(--sun-d);background:var(--sun-soft);border-radius:8px;padding:0 8px}
.l6-alwrap{display:flex;flex-direction:column;gap:12px;min-width:0}
.l6-alsvg{display:block;margin:0 auto;max-width:100%;height:auto;font-family:var(--f-body)}
.l6-alsvg .tk{fill:#fff;stroke:#1b2550;stroke-width:2}.l6-alsvg .tk-t{fill:#1b2550;font-size:14.5px;font-weight:700}
.l6-alsvg .md{fill:#e2ebff;stroke:#2f6bff;stroke-width:1.5;stroke-dasharray:4 3}.l6-alsvg .md-t{fill:#1b2550;font-size:14px}
.l6-alsvg .om{fill:#fff;stroke:#7f8ab0;stroke-dasharray:2 3}.l6-alsvg .om-t{fill:#4c5884;font-size:14px}
.l6-alsvg .tg{fill:#dcf7ec;stroke:#0a8a63;stroke-width:2}.l6-alsvg .tg-t{fill:#1b2550;font-size:14.5px;font-weight:700}
.l6-alsvg .ad{fill:#eee9ff;stroke:#7d5cf0;stroke-width:2}.l6-alsvg .ad-t{fill:#1b2550;font-size:14.5px;font-weight:700}
.l6-alsvg .ln{stroke:#2f6bff;stroke-width:2.2;fill:none}.l6-alsvg .ln.x{stroke:#ff6b4a;stroke-width:3.2}
.l6-alsvg .dn{stroke:#7f8ab0;stroke-dasharray:3 3}.l6-alsvg .lab{fill:#4c5884;font-size:12px;font-weight:700}.l6-alsvg .lbg{fill:#fff;opacity:.95}
.l6-legend{display:flex;flex-wrap:wrap;gap:4px 16px;font-size:13.5px;color:var(--muted)}
.l6-legend i{display:inline-block;width:20px;height:4px;vertical-align:middle;margin-right:5px;border-radius:2px}
.l6-spk{width:100%;height:56px;display:block;background:#fff;border-radius:10px;border:2px solid #7d5cf055;margin-top:8px}
.l6-spk .ln{fill:none;stroke:#7d5cf0;stroke-width:2.5;vector-effect:non-scaling-stroke}.l6-spk .gap{fill:#ffd43b88}
.l6-dlg{display:flex;flex-direction:column;gap:6px;font-size:18px;line-height:1.55}
.l6-dlg span.s{display:inline-block;color:var(--muted);font-size:13.5px;font-weight:700;margin-right:8px}
.l6-hl{background:var(--sun);color:var(--ink);border-radius:6px;padding:0 5px;font-weight:700}
.l6-trail{display:flex;flex-direction:column;gap:6px;border-top:2px dashed var(--line);padding-top:10px}
.l6-t1{display:grid;grid-template-columns:92px minmax(0,1fr);gap:8px;align-items:center;font-size:14.5px;color:var(--muted)}
.l6-t1 b{color:var(--dim);font-weight:700}
.l6-t1.on b{color:var(--ink);font-size:16px}
.l6-why{font-size:14.5px;line-height:1.6;color:var(--ink);background:var(--sun-soft);border-radius:12px;padding:8px 12px}
.l6-scene{width:100%;height:auto;display:block;border-radius:12px}
.l6-ver{border:2px solid var(--line2);border-radius:14px;padding:10px 12px;display:flex;flex-direction:column;gap:6px;background:var(--bg2)}
.l6-ver .h{display:flex;align-items:center;gap:8px;font-family:var(--f-display);font-weight:800;font-size:17px;color:var(--ink)}
.l6-ver .who{font-family:var(--f-body);font-size:13px;font-weight:700;border-radius:999px;padding:1px 10px;color:#fff;background:var(--mint-d)}
.l6-ver .who.ai{background:var(--grape)}
.l6-ver.ai{border-color:var(--grape);background:var(--grape-soft)}.l6-ver.human{border-color:var(--mint-d);background:var(--mint-soft)}
.l6-poem{font-size:16px;line-height:1.7;white-space:pre-line;color:var(--ink)}
.l6-poem.serif{font-family:var(--f-serif);font-size:17px}
.l6-rhy{color:var(--mint-d);border-bottom:3px solid var(--mint);font-weight:700}
.l6-chat{display:flex;flex-direction:column;gap:10px;padding:4px 0}
.l6-msg{max-width:90%;padding:8px 12px;border-radius:14px;font-size:15.5px;display:flex;flex-direction:column;gap:3px;color:var(--ink)}
.l6-msg .w{font-size:12.5px;font-weight:700;color:var(--muted)}
.l6-msg .t{font-size:13.5px;color:var(--muted);border-top:2px dashed var(--line2);padding-top:4px}
.l6-msg.v{align-self:flex-start;background:#fff;border:2px solid var(--line2);border-bottom-left-radius:4px}
.l6-msg.me{align-self:flex-end;background:var(--sky-soft);border:2px solid var(--sky);border-bottom-right-radius:4px}
.l6-msg.tip{align-self:stretch;max-width:100%;background:var(--sun-soft);border:2px solid var(--sun);font-size:14.5px}
.l6-msg.sys{align-self:center;font-size:13px;color:var(--muted);padding:2px}
.l6-msg .btn{align-self:flex-start}
.l6-out{font-size:15px;line-height:1.6;padding:8px 11px;border-radius:10px;background:#fff;border:2px solid var(--line);white-space:pre-wrap;word-break:break-word;color:var(--ink)}
.l6-ex{display:flex;flex-direction:column;gap:12px}
.l6-ex table{width:100%;border-collapse:collapse;font-size:13.5px}.l6-ex td,.l6-ex th{padding:4px 6px;border-bottom:2px solid var(--line);text-align:left}
.l6-ex th{color:var(--muted);font-weight:700;font-size:12.5px}
@media (max-width:640px){.l6-vs{grid-template-columns:1fr}}
@media (max-width:480px){.l6-pair{grid-template-columns:24px minmax(0,1fr);font-size:15.5px}.l6-pair b{grid-column:2}.l6-src{font-size:18px}.l6-bub{font-size:17px;min-width:84px}.l6-msg{max-width:96%}.l6-dlg{font-size:16.5px}}`;

/* ---------- module state (in memory only) ---------- */
let scanT=0,upImg=null;
function stopAll(){simTok++;clearInterval(scanT);upImg=null;}
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const SHORT={s1:'图书馆看书',s2:'去公园',s3:'比苹果',s4:'妈妈是医生',e1:'我的猫咪咪',e2:'地铁站在哪',e3:'周五踢足球',st:'丢失的风筝',sc:'机器怎样翻译',z1:'很高兴认识你',z2:'谢谢你的帮助',z3:'我喜欢学外语'};
const AL=[['s1','en','图书馆看书'],['s4','en','妈妈是医生'],['e2','zh','地铁站在哪'],['e3','zh','周五踢足球'],['z3','ja','学外语 · 日语'],['z3','de','学外语 · 德语']];
const OBS1=[['q1',[1,2,5],'对于比较简单的句子，AI 的翻译速度快吗？',['很快，几乎马上就出来了','有点慢','很慢']],['q2',[3],'对于一段含有少量超纲词汇的英文故事，AI 还能较快翻译出来吗？中间有没有停顿？',['较快，没有明显停顿','能翻出来，中间有短暂停顿','很慢，停顿很多']],['q3',[4],'对于一段含有较多超纲词汇、长难句的英文科技短文，AI 还能较快翻译出来吗？中间有没有停顿？',['较快，没有明显停顿','能翻出来，中间有短暂停顿','很慢，停顿很多']]];
const OBS2=[{id:'same',q:'对于无语境和不同语境下的同一内容，AI 给出的翻译结果是否相同？哪种翻译结果更符合对话情境？',opts:['不相同；放进对话里的翻译更符合对话情境','完全相同','不相同；没有语境的翻译更准确'],a:0,why:'放进对话后，AI 根据上下文换了译法，更符合情境。'},
 {id:'iso',q:'AI 在翻译一段话时，是孤立地翻译每句话，还是在理解语境的基础上翻译？',opts:['孤立地翻译每句话','在理解语境的基础上翻译'],a:1,why:'AI 会结合前后的句子来翻译，不是一句一句孤立地翻。'}];
const BANKW=['鱼竿','河边','钓鱼','小船','存钱'];
const SCENE=`<svg class="l6-scene" viewBox="0 0 320 120" role="img" aria-label="河边钓鱼的示意图"><rect width="320" height="120" rx="12" fill="#e2ebff"/><circle cx="270" cy="28" r="14" fill="#ffd43b" stroke="#1b2550" stroke-width="2.5"/><path d="M0 78q40-14 80 0t80 0 80 0 80 0v42H0z" fill="#2f6bff"/><path d="M0 92q40-12 80 0t80 0 80 0 80 0" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".7"/><path d="M0 62h96l22 20H0z" fill="#12b886" stroke="#1b2550" stroke-width="2.5"/><path d="M62 60L150 22" stroke="#1b2550" stroke-width="3.5" stroke-linecap="round"/><path d="M150 22v62" stroke="#1b2550" stroke-width="1.8" stroke-dasharray="4 3"/><circle cx="150" cy="86" r="5" fill="#ff6b4a" stroke="#1b2550" stroke-width="2"/><circle cx="52" cy="44" r="9" fill="#ffd43b" stroke="#1b2550" stroke-width="2.5"/><path d="M52 53v9" stroke="#1b2550" stroke-width="3" stroke-linecap="round"/><path d="M205 96q9-9 18 0-9 9-18 0zM223 96l8-6v12z" fill="#ffd43b" stroke="#1b2550" stroke-width="2"/></svg>`;

L.render=function(){const v=$('#v-l6');if(!document.getElementById('css-l6')){const st=document.createElement('style');st.id='css-l6';st.textContent=CSS;document.head.appendChild(st);}
 v.innerHTML=`${App.hero(K,'今天你是翻译实验员：测一测 AI 翻译有多快，找出它什么时候翻错，再和人工翻译比一比。',['能用 AI 实现不同语言之间的相互翻译。','了解 AI 翻译和人工翻译各自的优势。'])}

 <div class="station" id="l6-s0">${App.head('WARM-UP','导入 · 问候气泡墙','十二句“你好”','点一个气泡听一听，猜它是哪种语言')}
  <ol class="steps"><li>点气泡，猜语言</li><li>认出 6 种语言</li></ol>
  <div class="l6-wall" id="l6-wall"></div><div class="l6-gq" id="l6-gq"></div><div id="l6-fb0"></div>
  <details class="more"><summary>说明</summary><p class="note">世界上有七千多种语言。朗读使用浏览器自带的语音；有的语言这台设备可能没有安装发音。</p></details></div>

 <div class="station" id="l6-s1">${App.head('EXP-01','挑战一 · 多语言实时翻译','环球翻译厅','选一段话，猜猜 AI 翻译要几秒')}
  <ol class="steps"><li>选一段话</li><li>集齐 3 个难度</li></ol>
  <div class="grid2"><div class="l6-stage"><span class="l6-tag" id="l6-srctag"></span><div class="l6-src" id="l6-src"></div><div id="l6-hard"></div></div>
   <div class="l6-col">${App.knobs([['难度',App.seg('lv',[[1,'L1 中文短句'],[2,'L2 英文短句'],[3,'L3 小故事'],[4,'L4 科技短文'],[5,'L5 多国语言']],1)],['句子','<span id="l6-sents" style="display:contents"></span>'],['译成',App.seg('to',[['ru','俄语'],['fr','法语'],['es','西班牙语'],['ja','日语'],['de','德语'],['en','英语']],'ru')]])}
    <div class="go-row"><span class="l6-g">我猜要</span>${App.seg('g1',[['a','不到 2 秒'],['b','2–10 秒'],['c','10 秒以上']],'')}${App.go('l6-go','开始翻译')}</div>
    ${App.aiBox('l6-ai1','先猜一猜，再按「开始翻译」','AI 的译文')}<div id="l6-fb1"></div>
    <div class="after-run">${App.pad('',`<div id="l6-obs1"></div>`)}<div class="row"><button class="btn ghost sm" type="button" id="l6-sayb">朗读译文</button><button class="btn ghost sm" type="button" id="l6-keep">存进成长日记</button></div></div></div></div>
  <details class="more"><summary>说明</summary><p class="note">离线演示的翻译速度按文本难度模拟（示意），接入大模型后是真实用时。曲线：译文字数随时间增长，黄条是停顿。难词 = 课本里还没学到的词。</p>
   ${App.think(['相比于使用外语词典，AI 翻译有哪些优点？','AI 的翻译功能在生活中有哪些应用？'])}
   ${App.know('比查词典强在哪里','用外语词典要逐词查找，再自己拼出完整的意思；AI 翻译能快速给出整句、整段的结果，简单词句和大段难懂的内容都能应对。我们可以打字输入，也可以用语音输入，还可以用摄像头拍下文字让 AI 翻译。如今 AI 能翻译的语言越来越多，准确率也在持续提升。')}</details>
 </div>

 <div class="station" id="l6-s1b">${App.head('EXP-01b','挑战一 · 多语言实时翻译','超级词典三步','看 AI 怎样拆词、找词、重新排队')}
  <ol class="steps"><li>先猜再开工</li><li>找出挪得最远的词</li></ol>
  <div class="grid2"><div class="l6-stage"><div class="l6-alwrap" id="l6-al"></div><div class="l6-legend" id="l6-leg"></div><div class="l6-re" id="l6-re"></div></div>
   <div class="l6-col">${App.knobs([['句子',App.seg('al',AL.map((a,i)=>[i,a[2]]),0)]])}
    <div class="go-row"><span class="l6-g">我猜词的顺序</span>${App.seg('g2',[['0','不变'],['1','会变']],'')}${App.go('l6-algo','词典开工')}</div>
    ${App.aiBox('l6-ai2','三步走完，译文会出现在这里','AI 的译文')}<div id="l6-fb2"></div>
    <div class="after-run" id="l6-alpad">${App.pad('哪个词在译文里挪动得最远？',`<div class="opts" id="l6-alq"></div>`)}</div></div></div>
  <details class="more"><summary>说明</summary><p class="note">离线演示用平台预置的对齐（示意）；接入大模型后，用 AI 自己给出的词语对应关系。蓝线 = 位置没换，红线 = 换了位置，紫框 = 目标语言语法要补上的词，∅ = 译文里省略的词。</p>
   ${App.know('超级词典的三步','AI 仿佛拥有一部包含多种语言的超级词典。首先，它把要翻译的句子拆分成一个个词语；然后，按照翻译的要求，在它学过的海量多语种资料中寻找对应的另一种语言表达；最后，按照另一种语言的语法规则重新组合。所以“我昨天在图书馆看书”里的“昨天”，到了英文里要挪到句子最后。')}</details>
 </div>

 <div class="station" id="l6-s1c">${App.head('EXP-01c','挑战一 · 多语言实时翻译','拍照翻译','对着牌子拍一张，看 AI 认字又翻译')}
  <ol class="steps"><li>先猜是哪种语言</li><li>集齐 3 张照片</li></ol>
  <div class="grid2"><div class="stage" style="aspect-ratio:8/5"><canvas id="l6-pcv" width="640" height="400"></canvas></div>
   <div class="l6-col">${App.knobs([['照片',App.seg('ph',PHOTOS.map(p=>[p.id,p.name]),'museum')+'<button class="btn ghost sm" type="button" id="l6-up" hidden>拍一张</button><input type="file" id="l6-file" accept="image/*" capture="environment" hidden>']])}
    <div class="go-row"><span class="l6-g">我猜是</span>${App.seg('g3',[['en','英语'],['fr','法语'],['ja','日语']],'')}${App.go('l6-ocr','拍照翻译')}</div>
    ${App.aiBox('l6-ai3','AI 认出的文字和译文会出现在这里')}<div id="l6-fb3"></div></div></div>
  <details class="more"><summary>说明</summary><p class="note">拍照翻译分三步：找到文字区域 → 认出文字 → 翻译。离线演示时内置照片使用预置的识别结果和译文（示意）。接入大模型（Claude、GPT）后可以点「拍一张」拍身边的外文标牌：照片只在本页内存里使用，识别后即丢弃；不要拍人脸、证件、门牌、电话号码等个人信息。</p></details>
 </div>

 <div class="station" id="l6-s2">${App.head('EXP-02','挑战二 · 翻译的艺术','语境小实验','同一句话换个场合，AI 会换译法吗？')}
  <ol class="steps"><li>先猜再翻译</li><li>三种语境都试</li></ol>
  <div class="grid2"><div class="l6-stage"><span class="l6-tag" id="l6-ctxname"></span><div class="l6-dlg" id="l6-dlg"></div><div class="l6-trail" id="l6-trail"></div></div>
   <div class="l6-col">${App.knobs([['短语',App.seg('ci',CTX.map(it=>[it.id,esc(it.phrase)]),'cake')],['语境','<span id="l6-cks" style="display:contents"></span>']])}
    <div class="go-row"><span class="l6-g">我猜 AI 译成</span><span id="l6-gs" style="display:contents"></span>${App.go('l6-cgo','让 AI 翻译')}</div>
    ${App.aiBox('l6-ai4','先猜一猜，再按「让 AI 翻译」','AI 的译文')}<div id="l6-fb4"></div>
    <div class="after-run" id="l6-obs2pad">${App.pad('',`<div id="l6-obs2"></div>`,'观察任务')}</div></div></div>
  <details class="more"><summary>说明</summary>${App.think(['针对同一内容，为什么 AI 能产生不同的翻译结果？','用 AI 翻译语句时，如何得到准确的翻译结果？'])}
   ${App.know('语言扎根在文化里','人类的语言深深根植于各个国家和地区独特的文化背景之中，许多表达复杂而精妙，会随着使用情境发生变化。AI 翻译已经能满足日常需要，但翻译依赖情境的语句时，如果缺少上下文，准确性就难以保证。')}</details>
 </div>

 <div class="station" id="l6-s2b">${App.head('EXP-02b','挑战二 · 翻译的艺术','补一句语境','补一句话，让 AI 把 bank 译成“河岸”！')}
  <ol class="steps"><li>先直接翻译</li><li>补语境变河岸</li></ol>
  <div class="grid2"><div class="l6-stage"><span class="l6-tag">要翻译的句子</span><div class="l6-src" lang="en">Let's meet at the <mark class="l6-hl">bank</mark>.</div>${SCENE}<p class="note">bank 有两个意思：银行、河岸。你们其实约好去河边钓鱼。</p></div>
   <div class="l6-col">${App.knobs([['我补的语境','<input type="text" id="l6-bctx" maxlength="80" placeholder="例如：我们带上……" aria-label="我补充的语境">'],['线索词',BANKW.map(w=>`<button type="button" class="chip" data-bw="${w}">${w}</button>`).join(''),'点一下加进去']])}
    <div class="go-row">${App.go('l6-bgo','先直接翻译')}</div>
    ${App.aiBox('l6-ai5','先不补语境，直接按按钮，看 AI 译成什么','AI 的译文')}<div id="l6-fb5"></div></div></div>
  <details class="more"><summary>说明</summary><p class="note">bank 既可以是“银行”，也可以是“河岸”。补充一两句语境（中文或英文都行），让 AI 把它译成“河边／河岸”。</p>
   ${App.know('给 AI 更多信息','借助 AI 翻译时，我们提供的信息越充分、清晰，AI 的翻译结果就越精准，越符合原文要表达的意思。可以把前后几句话一起输入，或者直接告诉它“这是在演出之前说的话”。')}</details>
 </div>

 <div class="station" id="l6-s3">${App.head('EXP-03','挑战三 · AI 与人工翻译','人机翻译擂台','两份译文，猜猜哪一份是 AI 译的')}
  <ol class="steps"><li>猜一猜再揭晓</li><li>选出更打动你的</li></ol>
  ${App.knobs([['原文',App.seg('ar',ARENA.map(x=>[x.id,esc(x.title)]),'you')]])}
  <div class="l6-stage" id="l6-arena"></div>
  <div class="go-row"><span class="l6-g">我猜 AI 译的是</span>${App.seg('g4',[['x','译文甲'],['y','译文乙']],'')}${App.go('l6-rev','揭晓')}</div>
  ${App.aiBox('l6-ai6','读一读两份译文，猜一猜，再按「揭晓」','擂台揭晓')}<div id="l6-fb6"></div>
  <div class="after-run" id="l6-pickpad">${App.pad('哪一版更打动你？（没有标准答案）',`<div class="opts" id="l6-pick"></div>`)}</div>
  <details class="more"><summary>说明</summary><p class="note">标着“AI”的译文是平台预置示例；接入大模型后，揭晓时 AI 会现场再译一次，结果可能和预置示例不同。</p>
   ${App.know('AI 翻译的长处与局限','AI 翻译比人工翻译更迅速，也比传统翻译工具更符合人类的表达习惯；但它的能力主要依赖学习过的内容，遇到陌生的词汇、句式或不熟悉的表达，结果可能不尽如人意。它也无法自动理解具体情境和引申含义，需要我们补充信息。')}</details>
 </div>

 <div class="station" id="l6-s3b">${App.head('TALK','挑战三 · AI 与人工翻译','AI 会取代人吗','三个问题，亮出你的观点')}
  <ol class="steps"><li>亮出观点</li><li>答完 3 题</li></ol>
  ${App.pad('',`<div id="l6-talk"></div>`,'我的观点')}<div id="l6-fb7"></div>
  <details class="more"><summary>说明</summary>${App.know('人机协作','在涉及细腻情感和深刻文化背景的文学作品翻译中，人类的智慧和经验依然不可替代。人和 AI 协作：AI 负责快速打底，人负责理解、判断和再创作，各国文化才能被更精准地翻译和更广泛地传播。用 AI 翻译的作业要说明，不能当成自己的作品。')}</details>
 </div>

 <div class="station" id="l6-s4">${App.head('EXP-04','综合运用 · 跨语言交流','跨语言小导游','游客问，你选一句回答，AI 帮你翻译')}
  <ol class="steps"><li>选一句说给游客</li><li>带游客逛完</li></ol>
  <div class="grid2" data-rb="1"><div class="l6-stage"><span class="l6-tag" id="l6-gtag"></span><div class="l6-vq" id="l6-vis" aria-live="polite"></div><div class="l6-dots" id="l6-dots"></div></div>
   <div class="l6-col">${App.knobs([['景点',App.seg('pl',Object.entries(PLACES).map(([k,P])=>[k,`${P.city} · ${P.n}`]),'gugong')],['我来说','<span id="l6-rp" style="display:contents"></span>','点一句']])}
    <div class="go-row">${App.go('l6-say','说给游客听')}</div>
    ${App.aiBox('l6-ai7','选一句回答，按按钮，AI 把它译成英文','AI 把我的话译成英文')}<div id="l6-fb8"></div></div></div>
  <div class="after-run"><div id="l6-obs4pad">${App.pad('游客什么时候会听不懂？（可多选）',`<div class="opts" id="l6-obs4"></div>`)}</div>
   <details class="l6-hist"><summary id="l6-histn">对话记录</summary><div class="l6-chat" id="l6-chat"></div></details></div>
  <details class="more"><summary>说明</summary><p class="note">你说中文，AI 翻成英文给游客；游客说英文，AI 再翻回中文给你。游客的话是预先编好的剧本；接入大模型（Claude、GPT）后，你选的那句话由 AI 现场翻译。逛完后点「再逛一次」可以重新开始。</p>${App.know('说清楚，AI 才能译清楚','AI 翻译时只看到你说的那句话。“它”“那个”“这里”指的是什么，你心里清楚，AI 和外国游客却不一定知道。介绍时说出具体的名称、数字和季节，一句话说清一件事，翻译就更准确，交流也更顺利。')}</details>
 </div>

 <div class="station" id="l6-quizst">${App.head('QUIZ','反思与总结','小测验','5 道题，第一次作答计入能力图谱')}<div id="l6-quiz"></div></div>
 <div class="station" id="l6-diary"></div>`;
 if(!App.rec)return;wire();};

function wire(){const lr=App.lesson(K);lr.tr=lr.tr||[];lr.lv=lr.lv||[];lr.langs=lr.langs||[];lr.align=lr.align||{};lr.obs1=lr.obs1||{};lr.ctx=lr.ctx||{};lr.ctxObs=lr.ctxObs||{};lr.bank=lr.bank||{};lr.arena=lr.arena||{};lr.guide=lr.guide||{};lr.photos=lr.photos||[];
 const s0=$('#l6-s0'),s1=$('#l6-s1'),s1b=$('#l6-s1b'),s1c=$('#l6-s1c'),s2=$('#l6-s2'),s2b=$('#l6-s2b'),s3=$('#l6-s3'),s3b=$('#l6-s3b'),s4=$('#l6-s4');
 const bump=()=>{lr.nExp=(lr.nExp||0)+1;};const srcOf=m=>!m||m==='demo'?'offline':m;
 const clearSeg=(root,name)=>$$(`[data-seg="${name}"] .chip`,root).forEach(b=>b.classList.remove('on'));
 const show=(el,on)=>{if(el)el.style.display=on?'':'none';};
 const resetAI=(box,fb,text)=>{App.aiSay(box,text,{mood:'idle'});$(box).classList.add('wait');$(box+' .ai-src').innerHTML='';$(fb).innerHTML='';};

 /* ---------------- WARM-UP · 问候气泡墙：点气泡 → 听 → 猜是哪种语言 → 揭晓 ---------------- */
 const heard=new Set(),gq=$('#l6-gq');let nRight=0;
 $('#l6-wall').innerHTML=GREET.map((g,i)=>`<button type="button" class="l6-bub" data-g="${i}" lang="${g[1]}"><span>${esc(g[0])}</span><small>？</small></button>`).join('');
 const fb0=(kind,title,spoke)=>{const n=heard.size,all=n>=GREET.length;App.markStep(s0,0);if(n>=6)App.markStep(s0,1);
  App.fb('#l6-fb0',all?'ok':kind,title,(all?`十二种全认出来了，其中 ${nRight} 种是你猜中的！这么多语言，AI 怎样来回翻译？`:`已认出 ${n} / ${GREET.length} 种，猜中 ${nRight} 种。${n>=6?'再点别的气泡，集齐十二种。':'认出 6 种拿两颗星。'}`)+(spoke?'':' 这台设备不能朗读，看文字猜也行。'),{stars:all?3:n>=6?2:1});};
 $$('#l6-wall [data-g]').forEach(b=>b.onclick=()=>{const i=+b.dataset.g,g=GREET[i];const spoke=!!Speech.say(g[0],{lang:g[1],rate:0.9});
  $$('#l6-wall .l6-bub').forEach(x=>x.classList.toggle('cur',x===b));
  if(heard.has(g[0])){gq.innerHTML='';fb0('find',`这是${g[2]}的“你好”`,spoke);return;}
  const o=[g[2],GREET[(i+3)%GREET.length][2],GREET[(i+7)%GREET.length][2]],k=i%3,ord=[o[(3-k)%3],o[(4-k)%3],o[(5-k)%3]];
  $('#l6-fb0').innerHTML='';
  gq.innerHTML=`<span class="l6-g">你猜「${esc(g[0])}」是</span>${ord.map(t=>`<button type="button" class="chip" data-gl="${t}">${t}</button>`).join('')}`;
  $$('[data-gl]',gq).forEach(c=>c.onclick=()=>{const ok=c.dataset.gl===g[2];heard.add(g[0]);if(ok)nRight++;b.classList.add('on');$('small',b).textContent=g[2];gq.innerHTML='';
   fb0(ok?'ok':'find',ok?`猜对了！这是${g[2]}的“你好”`:`原来是${g[2]}的“你好”`,spoke);});});

 /* ---------------- EXP-01 · 环球翻译厅 ---------------- */
 let lv=1,tid='s1',to='en',g1=null,res=null;
 const txOf=()=>TX.find(x=>x.id===tid);
 const drawSrc=()=>{const x=txOf();$('#l6-srctag').textContent=`原文 · ${LN(x.from)} → ${LN(to)}`;const el=$('#l6-src');el.textContent=x.text;el.classList.toggle('long',x.text.length>120);el.lang=x.from;
  $('#l6-hard').innerHTML=x.hard?`<div class="l6-hardw"><span>难词</span>${x.hard.slice(0,6).map(w=>`<span class="w">${esc(w)}</span>`).join('')}</div>`:'';};
 const drawSents=()=>{const done=new Set(lr.tr.map(r=>r.id).filter(Boolean));$('#l6-sents').innerHTML=App.seg('tx',TX.filter(x=>x.lv===lv).map(x=>[x.id,SHORT[x.id]+(done.has(x.id)?' ✓':'')]),tid);App.segWire(s1,'tx',v=>{simTok++;tid=v;drawSrc();});};
 const setLv=n=>{simTok++;lv=n;tid=TX.find(x=>x.lv===lv).id;to=lv===5?(App.segVal(s1,'to')||'ru'):LEVELS.find(l=>l[0]===lv)[2];show($('[data-seg="to"]',s1).closest('.knob'),lv===5);drawSents();drawSrc();};
 App.segWire(s1,'lv',v=>setLv(+v));App.segWire(s1,'to',v=>{simTok++;to=v;drawSrc();});App.segWire(s1,'g1',v=>{g1=v;});
 const marks1=()=>{if(lr.tr.some(r=>r.lv))App.markStep(s1,0);if(lr.lv.length>=3)App.markStep(s1,1);};
 const drawObs1=n=>{const o=OBS1.find(x=>x[1].includes(n));const box=$('#l6-obs1');if(!o){box.innerHTML='';return;}const [id,,q,opts]=o;const a=lr.obs1[id];
  box.innerHTML=`<div class="ask">${q}</div><div class="opts" style="margin-top:10px">${opts.map((t,j)=>`<button type="button" class="chip ${a===j?'on':''}" data-j="${j}">${t}</button>`).join('')}</div>`;
  $$('.chip',box).forEach(b=>b.onclick=()=>{lr.obs1[id]=+b.dataset.j;App.touch();drawObs1(n);});};
 async function runTr(x,dst,onText){const thr=App.AI.real()?900:450;const ck=clock(thr);
  if(App.AI.real()){try{const r=await App.AI.translate(x.text,{to:dst,onText:({text:t})=>{ck.tick(t.length);onText(t);}});if(r&&r.text){const d=ck.done(r.text.length);onText(r.text);return Object.assign(d,{text:r.text,mode:r.mode||App.AI.mode(),thr});}}
   catch(e){App.AI.fail(e);if(e&&e.code==='cancelled')throw e;App.toast(App.AI.errText(e));}}
  const t=x.tr[dst]||Object.values(x.tr)[0];await simStream(t,x.lv,s=>{ck.tick(s.length);onText(s);});return Object.assign(ck.done(t.length),{text:t,mode:'demo',thr});}
 $('#l6-go').onclick=async()=>{const x=txOf(),dst=to,b=$('#l6-go'),body=$('#l6-ai1 .ai-body');App.busy(b,true,'AI 正在译…');App.aiSay('#l6-ai1','<span class="l6-cur"></span>',{busy:true});
  let r;try{r=await runTr(x,dst,t=>{body.innerHTML=`<div class="l6-tr">${esc(t)}<span class="l6-cur"></span></div>`;});}catch(e){App.busy(b,false);App.aiSay('#l6-ai1','换好了，再按一次「开始翻译」。',{mood:'idle'});return;}
  const sec=r.ms/1000,secT=sec.toFixed(1);res={src:x.text,text:r.text,from:x.from,to:dst,mode:r.mode};
  App.aiSay('#l6-ai1',`<div class="big">${secT} 秒${r.stalls?` · 停顿 ${r.stalls} 次`:' · 没有停顿'}</div><div class="l6-tr" lang="${dst}">${esc(r.text)}</div>${sparkSVG(r.pts,r.thr)}<p class="l6-cap">这条线越往上，译出来的字越多${r.stalls?'；黄条是 AI 停下来“想一想”的地方':'；一路没停'}。</p>`,{mood:'happy',src:srcOf(r.mode)});
  bump();lr.tr.push({id:x.id,lv:x.lv,from:x.from,to:dst,ms:r.ms,first:r.first,st:r.stalls,n:[...r.text].length,m:r.mode,in:'text'});if(lr.tr.length>24)lr.tr.splice(0,lr.tr.length-24);
  if(!lr.lv.includes(x.lv))lr.lv.push(x.lv);if(!lr.langs.includes(dst))lr.langs.push(dst);App.touch();
  const bucket=sec<2?'a':sec<=10?'b':'c',n=lr.lv.length,more=n>=3?'三个难度集齐了！':`已试过 ${n} 个难度，集齐 3 个拿三颗星。`;
  const quick=sec<2?'短句几乎一眨眼就译完。':`这句短话用了 ${secT} 秒。`;
  const say={1:quick,2:quick,3:r.stalls?`有超纲词，中间停了 ${r.stalls} 次，但整段都译出来了。`:'整段故事一口气译完了。',4:r.stalls?`长难句让 AI 停了 ${r.stalls} 次，它也要“想一想”。`:'这么长的科技短文也译完了。',5:sec<2?`换成${LN(dst)}，一样很快。`:`换成${LN(dst)}，用了 ${secT} 秒。`}[x.lv];
  if(g1==null)App.fb('#l6-fb1','find',`${secT} 秒译完`,say+more,{stars:Math.min(3,n)});
  else if(g1===bucket)App.fb('#l6-fb1','ok',`猜对了！用了 ${secT} 秒`,say+more,{stars:Math.min(3,n)});
  else App.fb('#l6-fb1','try',`没猜中：用了 ${secT} 秒`,say+more,{stars:Math.min(3,n)});
  g1=null;clearSeg(s1,'g1');drawSents();drawObs1(x.lv);marks1();App.busy(b,false);b.classList.add('again');};
 $('#l6-sayb').onclick=()=>{if(!res){App.toast('先翻译一句话');return;}if(!Speech.say(res.text,{lang:BCP(res.to)}))App.toast('这台设备不能朗读');};
 $('#l6-keep').onclick=()=>{if(!res){App.toast('先翻译一句话');return;}lr.work={src:res.src.slice(0,160),dst:res.text.slice(0,240),from:res.from,to:res.to,m:res.mode};App.touch();App.toast('已存进成长日记「小小翻译官」');};
 setLv(1);marks1();

 /* ---------------- EXP-01b · 超级词典三步 ---------------- */
 let ai=0,g2=null,alTok=0;
 const alX=()=>TX.find(t=>t.id===AL[ai][0]);
 const drawAl0=()=>{const x=alX(),dst=AL[ai][1];$('#l6-al').innerHTML=`<span class="l6-tag">${LN(x.from)} → ${LN(dst)}</span><div class="l6-src" lang="${x.from}">${esc(x.text)}</div>`;$('#l6-leg').innerHTML='';$('#l6-re').innerHTML='';};
 const drawRe=(al,cur)=>{const box=$('#l6-re');box.innerHTML='<span>再看一遍</span>'+['① 拆词','② 找词','③ 排队'].map((t,i)=>`<button type="button" class="chip ${cur===i+1?'on':''}" data-re="${i+1}">${t}</button>`).join('');
  $$('[data-re]',box).forEach(b=>b.onclick=()=>{$('#l6-al').innerHTML=alignSVG(al,+b.dataset.re);drawRe(al,+b.dataset.re);});};
 const drawAlq=(al,mv)=>{const pad=$('#l6-alpad');show(pad,mv.cross);if(!mv.cross)return;const box=$('#l6-alq');
  box.innerHTML=mv.cand.map(i=>`<button type="button" class="chip" data-mv="${i}">${esc(al.s[i])}</button>`).join('');
  $$('[data-mv]',box).forEach(b=>b.onclick=()=>{const i=+b.dataset.mv,ok=mv.best.includes(i);$$('[data-mv]',box).forEach(x=>x.classList.toggle('on',x===b));lr.align.q=lr.align.q||{};const first=lr.align.q[al.id]==null;if(first)lr.align.q[al.id]=ok?1:0;App.touch();App.markStep(s1b,1);
   if(ok)App.fb('#l6-fb2','ok',`对！「${esc(al.s[i])}」挪得最远`,`它从第 ${i+1} 位挪到了第 ${al.l[i]+1} 位。${esc(al.note||'两种语言的语法不一样，词要重新排队。')}`,{stars:lr.align.q[al.id]?3:2});
   else App.fb('#l6-fb2','try','再看看红线',`哪条线跨得最远？挪得最远的是「${mv.best.map(j=>esc(al.s[j])).join('」或「')}」。`,{stars:2});});};
 App.segWire(s1b,'al',v=>{alTok++;ai=+v;drawAl0();show($('#l6-alpad'),false);resetAI('#l6-ai2','#l6-fb2','换好了，按「词典开工」');});App.segWire(s1b,'g2',v=>{g2=v;});
 $('#l6-algo').onclick=async()=>{const tok=++alTok,x=alX(),dst=AL[ai][1],b=$('#l6-algo');App.busy(b,true,'词典工作中…');App.aiSay('#l6-ai2','第 1 步：把句子拆成词语……',{busy:true});
  let al=Object.assign({},x.al[dst],{id:x.id+'-'+dst}),text=x.tr[dst],mode='demo';
  if(App.AI.real()){try{const r=await App.AI.translate(x.text,{to:dst,explain:true});const a=r&&r.text?alFromSegs(r.segments,r.text):null;if(a){al=Object.assign(a,{id:x.id+'-'+dst});text=r.text;mode=r.mode||App.AI.mode();}}catch(e){App.AI.fail(e);App.toast(App.AI.errText(e));}}
  const box=$('#l6-al');const says=['','第 1 步：把句子拆成词语……','第 2 步：给每个词找到对应的表达……','第 3 步：按新语言的语法重新排队……'];
  for(let st=1;st<=3;st++){if(tok!==alTok){App.busy(b,false);return;}box.innerHTML=alignSVG(al,st);App.aiSay('#l6-ai2',says[st],{busy:true});await wait(st===3?500:850);}
  if(tok!==alTok){App.busy(b,false);return;}
  const mv=movers(al),sep=dst==='zh'||dst==='ja'?'':' ';const raw=al.s.map((_,i)=>al.l[i]>=0?al.t[al.l[i]]:'').filter(Boolean).join(sep);
  $('#l6-leg').innerHTML='<span><i style="background:var(--sky)"></i>位置没换</span><span><i style="background:var(--coral)"></i>换了位置</span>';drawRe(al,3);
  App.aiSay('#l6-ai2',`<div class="big" lang="${dst}">${esc(text)}</div><p class="l6-tr">${mv.cross?`不换顺序、逐词拼出来是：<b>${esc(raw)}</b>`:'这句话两种语言的语序一样，逐词拼出来也通顺。'}</p>`,{mood:'happy',src:srcOf(mode)});
  lr.align.st=lr.align.st||[];if(!lr.align.st.includes(al.id)){lr.align.st.push(al.id);if(lr.align.st.length>12)lr.align.st.shift();}lr.dict=1;bump();App.touch();App.markStep(s1b,0);
  const right=g2!=null&&(g2==='1')===mv.cross,tail=mv.cross?'红线交叉的词换了位置。答一答下面的问题。':'连线没有交叉。换一句话，看看哪句会变。';
  if(g2==null)App.fb('#l6-fb2','find',mv.cross?'词的顺序变了！':'这一句顺序没变',tail,{stars:1});
  else if(right)App.fb('#l6-fb2','ok',mv.cross?'猜对了！顺序变了':'猜对了！顺序没变',tail,{stars:2});
  else App.fb('#l6-fb2','try',mv.cross?'没猜中：顺序变了':'没猜中：顺序没变',tail,{stars:1});
  g2=null;clearSeg(s1b,'g2');drawAlq(al,mv);App.busy(b,false);b.classList.add('again');};
 drawAl0();if((lr.align.st||[]).length)App.markStep(s1b,0);if(Object.keys(lr.align.q||{}).length)App.markStep(s1b,1);

 /* ---------------- EXP-01c · 拍照翻译 ---------------- */
 const pcv=$('#l6-pcv');let pinfo=null,ph='museum',g3=null;
 const photoShow=()=>{clearInterval(scanT);if(upImg){const g=pcv.getContext('2d');g.setTransform(1,0,0,1,0,0);g.fillStyle='#000';g.fillRect(0,0,640,400);const im=upImg,sc=Math.min(640/im.width,400/im.height);g.drawImage(im,(640-im.width*sc)/2,(400-im.height*sc)/2,im.width*sc,im.height*sc);pinfo=null;}else pinfo=drawPhoto(pcv,ph);$('#l6-up').hidden=!App.AI.sample;};
 const drawBoxes=n=>{if(!pinfo)return;const g=pcv.getContext('2d');g.save();g.translate(pinfo.cx,pinfo.cy);g.rotate(pinfo.rot);g.lineWidth=3;g.strokeStyle='#ffd43b';g.fillStyle='rgba(255,212,59,.16)';pinfo.boxes.slice(0,n).forEach((bx,i)=>{g.fillStyle='rgba(255,212,59,.16)';g.fillRect(bx[0],bx[1],bx[2],bx[3]);g.strokeRect(bx[0],bx[1],bx[2],bx[3]);
   g.beginPath();g.arc(bx[0],bx[1],13,0,7);g.fillStyle='#ffd43b';g.fill();g.fillStyle='#1b2550';g.font='800 16px "Noto Sans SC",Arial,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(String(i+1),bx[0],bx[1]+1);g.textBaseline='alphabetic';});g.restore();};
 App.segWire(s1c,'ph',v=>{ph=v;upImg=null;photoShow();resetAI('#l6-ai3','#l6-fb3','换好了，先猜一猜，再按「拍照翻译」');});App.segWire(s1c,'g3',v=>{g3=v;});
 const marks1c=()=>{if(lr.photos.length||lr.photo)App.markStep(s1c,0);if(lr.photos.length>=3)App.markStep(s1c,1);};
 $('#l6-ocr').onclick=async()=>{clearInterval(scanT);const p=PHOTOS.find(x=>x.id===ph),own=!!upImg,b=$('#l6-ocr');App.busy(b,true,'AI 正在看…');App.aiSay('#l6-ai3','第 1 步：找到文字在哪里……',{busy:true});
  if(!own)pinfo=drawPhoto(pcv,ph);let ck=clock(900),lang='',text='',trn='',mode='demo';
  if(App.AI.sample){try{const blob=await new Promise(r=>pcv.toBlob(r,'image/jpeg',0.85));
    const j=await App.AI.sample.json(`你在扮演“拍照翻译 AI”，给小学高年级学生演示。请先找出图片里所有的文字（OCR），判断是哪种语言，再翻译成中文。如果图片里有人脸、姓名、电话、住址等个人信息，不要转写，用“[个人信息已隐去]”代替。如果图片里没有文字，text 留空。只输出 JSON：{"lang":"原文语言的中文名称","text":"识别出的原文（保留换行）","translation":"译文（保留换行）"}`,{images:[blob],modelTier:'default'});
    if(j&&j.text){lang=j.lang||'';text=String(j.text);trn=String(j.translation||'');mode=App.AI.mode();ck.tick(trn.length);}}
   catch(e){App.AI.fail(e);App.toast(App.AI.errText(e));}}
  if(!text){if(own){App.aiSay('#l6-ai3','这张照片里没有找到文字。',{mood:'oops'});App.fb('#l6-fb3','try','没有找到文字','换一张有外文的标牌，或者选上面的内置照片。');App.busy(b,false);return;}
   const base=document.createElement('canvas');base.width=640;base.height=400;base.getContext('2d').drawImage(pcv,0,0);let y=0;
   await new Promise(done=>{scanT=setInterval(()=>{const g=pcv.getContext('2d');g.drawImage(base,0,0);g.fillStyle='rgba(255,212,59,.25)';g.fillRect(0,y-18,640,18);g.fillStyle='#ffd43b';g.fillRect(0,y,640,3);y+=20;if(y>400){clearInterval(scanT);g.drawImage(base,0,0);done();}},28);});
   App.aiSay('#l6-ai3','第 2 步：把文字一个个认出来……',{busy:true});
   for(let i=1;i<=pinfo.boxes.length;i++){pcv.getContext('2d').drawImage(base,0,0);drawBoxes(i);await wait(150);}
   lang=LN(p.lang);text=p.ocr;trn=p.tr;ck.tick(trn.length);}
  const d=ck.done(trn.length);res={src:text,text:trn,from:detect(text),to:'zh',mode};
  const oL=text.split('\n').map(x=>x.trim()).filter(Boolean),tL=trn.split('\n').map(x=>x.trim()).filter(Boolean),paired=oL.length===tL.length&&oL.length>=1&&oL.length<=8,numbered=paired&&!own&&pinfo&&pinfo.boxes.length===oL.length;
  if(!own&&pinfo&&mode!=='demo'){pinfo=drawPhoto(pcv,ph);if(numbered)drawBoxes(pinfo.boxes.length);}
  const truth=own?'':LN(p.lang),langOk=own||!lang||lang[0]===truth[0];
  App.aiSay('#l6-ai3',`<div class="big">${langOk?'这是':'我觉得这是'}${esc(lang||'外语')}</div>`+(paired?`<p class="l6-mini">${numbered?'照片上的编号 · ':''}认出的文字 → 译成中文</p><div class="l6-pairs">${oL.map((o,i)=>`<div class="l6-pair"><i>${i+1}</i><span>${esc(o)}</span><b>${esc(tL[i])}</b></div>`).join('')}</div>`:`<p class="l6-mini">认出的文字</p><div class="l6-tr" style="margin-top:0">${esc(text)}</div><p class="l6-mini">译成中文</p><div class="l6-tr" style="margin-top:0"><b>${esc(trn)}</b></div>`),{mood:langOk?'happy':'oops',src:srcOf(mode)});
  bump();lr.tr.push({id:'',lv:0,from:detect(text),to:'zh',ms:d.ms,first:d.first,st:d.stalls,n:[...trn].length,m:mode,in:'photo'});if(lr.tr.length>24)lr.tr.splice(0,lr.tr.length-24);if(!lr.langs.includes('zh'))lr.langs.push('zh');lr.photo=(lr.photo||0)+1;
  if(!own&&!lr.photos.includes(ph))lr.photos.push(ph);App.touch();marks1c();const n=lr.photos.length,more=n>=3?'三张照片集齐了！':`已拍 ${n} / 3 张，换一张再拍。`,stars=Math.min(3,Math.max(1,n));
  const how=numbered?'AI 先圈出文字（照片上的黄框），再一行行认出来，最后翻译。':'AI 先找到文字，再认出文字，最后翻译。';
  if(!langOk)App.fb('#l6-fb3','oops','你发现 AI 的错误了！',`这块牌子上其实是${truth}，AI 却说是${esc(lang)}。AI 也会认错，重要的内容要自己再核对。`+more,{stars});
  else if(own||g3==null)App.fb('#l6-fb3','find',`AI 认出了${esc(own?(lang||'外语'):truth)}`,how+more,{stars});
  else if(g3===p.lang)App.fb('#l6-fb3','ok',`猜对了，是${truth}！`,how+more,{stars});
  else App.fb('#l6-fb3','find',`原来是${truth}`,how+more,{stars});
  g3=null;clearSeg(s1c,'g3');App.busy(b,false);b.classList.add('again');};
 $('#l6-up').onclick=()=>{if(!App.AI.sample){App.toast('拍自己的照片需要接入大模型');return;}App.toast('只拍外文标牌，不拍人脸和个人信息');$('#l6-file').click();};
 $('#l6-file').onchange=async e=>{const f=e.target.files[0];e.target.value='';if(!f)return;const url=URL.createObjectURL(f);try{upImg=await App.loadImg(url);}catch(err){App.toast('图片打不开');}URL.revokeObjectURL(url);photoShow();};
 photoShow();marks1c();

 /* ---------------- EXP-02 · 语境小实验 ---------------- */
 let ci='cake',ck2='n',g5=null;
 const itOf=()=>CTX.find(x=>x.id===ci);const fullOf=it=>Object.keys(((lr.ctx[it.id]||{}).r)||{}).length>=3;
 const hl=(s,phr)=>{const e=esc(s);const i=e.toLowerCase().indexOf(phr.toLowerCase());return i<0?e:e.slice(0,i)+`<mark class="l6-hl">${e.slice(i,i+phr.length)}</mark>`+e.slice(i+phr.length);};
 const classify=(it,dst)=>{for(const k of it.pri){if(it.opts[k].re.test(dst))return k;}return -1;};
 const drawCtxStage=()=>{const it=itOf(),col=it.cols.find(x=>x.k===ck2),c=lr.ctx[it.id]||{},r=c.r||{},d=c.d||{};
  $('#l6-ctxname').textContent=col.name;$('#l6-dlg').innerHTML=col.lines.map(([w,t])=>`<div>${w?`<span class="s">${esc(w)}</span>`:''}${hl(t,it.phrase)}</div>`).join('')+(col.sc?`<p class="note">${esc(col.sc)}</p>`:col.k==='n'?'<p class="note">只有这一句，前后什么都没有</p>':'');
  const n0=it.cols[0],tail=r.n==null?'':r.n===n0.ans?'没有语境时，AI 选了最常见的那个意思。':`这一次没有语境，AI 选的是「${esc(d.n||'')}」——没有上下文，它只能猜。`;
  $('#l6-trail').innerHTML=it.cols.map(cl=>`<div class="l6-t1 ${r[cl.k]!=null?'on':''}"><span>${cl.name}</span><b>${r[cl.k]!=null?'→ '+esc(d[cl.k]||cl.dst):'还没试'}</b></div>`).join('')+(fullOf(it)?`<p class="l6-why">${esc(it.why)}${tail}</p>`:'');};
 const sameOf=it=>{const c=lr.ctx[it.id]||{},r=c.r||{},d=c.d||{};return new Set(it.cols.map(x=>r[x.k]>=0?'c'+r[x.k]:'s'+norm(d[x.k]))).size===1;};
 const goCol=k=>{ck2=k;g5=null;drawCtx();resetAI('#l6-ai4','#l6-fb4','换好了。先猜一猜，再按「让 AI 翻译」');};
 const drawCtx=()=>{const it=itOf(),r=((lr.ctx[it.id]||{}).r)||{};
  $('#l6-cks').innerHTML=App.seg('ck',it.cols.map(col=>[col.k,col.name+(r[col.k]!=null?' ✓':'')]),ck2);App.segWire(s2,'ck',v=>{ck2=v;drawCtxStage();});
  $('#l6-gs').innerHTML=App.seg('g5',it.opts.map((o,j)=>[j,esc(o.t)]),g5==null?'':g5);App.segWire(s2,'g5',v=>{g5=+v;});drawCtxStage();};
 App.segWire(s2,'ci',v=>{ci=v;const it=itOf(),r=((lr.ctx[it.id]||{}).r)||{},nx=it.cols.find(x=>r[x.k]==null);goCol(nx?nx.k:'n');});
 const marks2=()=>{if(CTX.some(it=>Object.keys(((lr.ctx[it.id]||{}).r)||{}).length))App.markStep(s2,0);const fulls=CTX.filter(fullOf);if(fulls.length)App.markStep(s2,1);show($('#l6-obs2pad'),fulls.some(it=>!sameOf(it))||fulls.length>=2);};
 $('#l6-cgo').onclick=async()=>{const it=itOf(),col=it.cols.find(x=>x.k===ck2),b=$('#l6-cgo'),guess=g5;App.busy(b,true,'AI 正在译…');App.aiSay('#l6-ai4',col.k==='n'?'没有上下文，只能看这一句……':'把整段对话读一遍……',{busy:true});
  const text=col.lines.map(([w,t])=>w?`${w}: ${t}`:t).join('\n'),dstLang=it.from==='en'?'zh':'en';let full=col.full,dst=col.dst,cls=col.ans,mode='demo';
  if(App.AI.real()){try{const r=await App.AI.translate(text,{to:dstLang,explain:true,context:col.k==='n'?'':'这是一段对话，请结合对话的情境翻译。'});
    if(r&&r.text){full=r.text;mode=r.mode||App.AI.mode();const seg=(r.segments||[]).find(s=>it.key.test(String(s.src||'')));dst=seg&&seg.dst?String(seg.dst):r.text;cls=classify(it,dst);if(cls<0&&seg)cls=classify(it,r.text);}}
   catch(e){App.AI.fail(e);App.toast(App.AI.errText(e));}}
  else await wait(700);
  const c=lr.ctx[it.id]||(lr.ctx[it.id]={p:{},r:{},d:{}});c.p=c.p||{};c.r=c.r||{};c.d=c.d||{};const was=fullOf(it);
  if(guess!=null&&c.p[col.k]==null)c.p[col.k]=guess;c.r[col.k]=cls;c.d[col.k]=String(dst).slice(0,60);c.m=c.m||{};c.m[col.k]=mode;if(mode!=='demo'){c.f=c.f||{};c.f[col.k]=String(full).slice(0,200);}bump();App.touch();
  App.aiSay('#l6-ai4',`<div class="big">「${esc(it.phrase)}」→ ${esc(c.d[col.k])}</div>${col.k==='n'?'':`<div class="l6-tr">${esc(full)}</div>`}`,{mood:'happy',src:srcOf(mode)});
  const n=Object.keys(c.r).length,nowFull=n>=3,next=it.cols.find(x=>c.r[x.k]==null),hit=guess==null?'':guess===cls?'你猜对了！':'和你猜的不一样。';
  const nxBtn=next?`<button type="button" class="btn sm" data-nx="${next.k}">换到「${next.name}」</button>`:'';
  if(nowFull){const same=sameOf(it);App.fb('#l6-fb4','find',same?'这次三种语境，译法一样':'语境变了，译法也变了！',same?`${hit}这个短语 AI 没有换译法。换一个短语再试，看看会不会变。`:`${hit}左边三行比一比，再做下面的观察任务。`,{stars:3,cheer:!was&&!same});}
  else if(guess==null)App.fb('#l6-fb4','find',`AI 译成「${esc(c.d[col.k])}」`,`放进别的语境，译法会变吗？${nxBtn}`,{stars:n});
  else if(guess===cls)App.fb('#l6-fb4','ok','猜对了！',`放进别的语境，译法会变吗？${nxBtn}`,{stars:n});
  else App.fb('#l6-fb4','find','和你猜的不一样',`AI 译成了「${esc(c.d[col.k])}」。放进别的语境再看看。${nxBtn}`,{stars:n});
  const nb=$('#l6-fb4 [data-nx]');if(nb)nb.onclick=()=>goCol(nb.dataset.nx);
  g5=null;drawCtx();marks2();App.busy(b,false);b.classList.add('again');};
 lr.ctxQ=lr.ctxQ||{};OBS2.forEach(q=>{if(!lr.ctxQ[q.id]&&lr.ctxObs[q.id]!=null){const f=lr.ctxObs[q.id+'First']!=null?lr.ctxObs[q.id+'First']:lr.ctxObs[q.id];lr.ctxQ[q.id]={first:f,ok:f===q.a,last:lr.ctxObs[q.id]};}});
 App.askSeq($('#l6-obs2'),OBS2,lr.ctxQ,(n,tot)=>{OBS2.forEach(q=>{const a=lr.ctxQ[q.id];if(a){lr.ctxObs[q.id]=a.last;lr.ctxObs[q.id+'First']=a.first;}});App.touch();
  if(n>=tot){const ok=OBS2.filter(q=>lr.ctxQ[q.id].ok).length;App.fb('#l6-fb4',ok>=2?'ok':'try',`观察任务完成，第一次答对 ${ok} 个`,'给 AI 的信息越充分、清晰，它译得越准。');}});
 drawCtx();marks2();

 /* ---------------- EXP-02b · 补一句语境 ---------------- */
 const bk=lr.bank,bin=$('#l6-bctx');bin.value=bk.ctx||'';
 const bLab=()=>{const b=$('#l6-bgo');if(b.disabled)return;const t=bin.value.trim()?'带语境翻译':'先直接翻译';b.dataset.label=t;b.textContent=t;};
 $$('[data-bw]',s2b).forEach(b=>b.onclick=()=>{if(bin.value.length<70&&!bin.value.includes(b.dataset.bw))bin.value+=(bin.value.trim()&&!/[，,。、\s]$/.test(bin.value)?'、':'')+b.dataset.bw;bin.focus();bLab();});
 bin.oninput=bLab;
 const marks2b=()=>{if(bk.base||bk.tries)App.markStep(s2b,0);if(bk.ok)App.markStep(s2b,1);};
 $('#l6-bgo').onclick=async()=>{const ctx=bin.value.trim(),b=$('#l6-bgo');App.busy(b,true,'AI 正在译…');App.aiSay('#l6-ai5',ctx?'带上你的语境，再想一想……':'没有语境，只能看这一句……',{busy:true});
  let outT='',ok=false,why='',mode='demo';
  if(App.AI.real()){try{const r=await App.AI.translate("Let's meet at the bank.",{to:'zh',context:ctx});if(r&&r.text){outT=r.text;mode=r.mode||App.AI.mode();ok=/河|岸|湖|溪|江|水边/.test(outT);why=ok?'线索够了，AI 选了“河岸”。':'线索还不够，直接写出地点试试。';}}catch(e){App.AI.fail(e);App.toast(App.AI.errText(e));}}
  if(!outT){await wait(600);const river=(ctx.match(/river|fish|lake|stream|boat|shore|water|河|钓|鱼|湖|岸|溪|江|船|水边/gi)||[]).length,money=(ctx.match(/money|cash|card|account|save|银行|钱|存|取|卡|账户/gi)||[]).length;
   ok=river>money;outT=ok?'我们在河边见面吧。':'我们在银行见面吧。';why=ok?'有“河、钓鱼”这样的线索，AI 选了“河岸”。':money?'语境里有和“钱”有关的词，更像“银行”。':'没有地点线索，AI 选了最常见的“银行”。';}
  App.aiSay('#l6-ai5',`<div class="big">${esc(outT)}</div>${ctx?`<p class="l6-tr">你补的语境：${esc(ctx)}</p>`:''}`,{mood:ok?'happy':'oops',src:srcOf(mode)});
  const isBank=/银行/.test(outT);
  if(!ctx){bk.base=1;App.touch();marks2b();
   if(isBank)App.fb('#l6-fb5','oops','AI 译成了“银行”！','可你们约的是河边。没有线索，它选了最常见的意思。在右上角补一句语境（可以点线索词），再按一次。',{stars:1});
   else if(ok)App.fb('#l6-fb5','find','这次 AI 碰巧译成了河边','没有线索，它只是猜的，下次不一定猜中。补一句语境，让它有把握。',{stars:1});
   else App.fb('#l6-fb5','find','AI 译成了这样','没有线索，它只能猜。补一句语境（可以点线索词），再按一次。',{stars:1});
   App.busy(b,false);b.classList.add('again');bLab();return;}
  bk.tries=(bk.tries||0)+1;bk.ctx=ctx.slice(0,160);bk.out=outT.slice(0,80);bk.last=ok;bk.why=why;if(ok)bk.ok=1;if(bk.first==null)bk.first=ok?1:0;bump();App.touch();marks2b();
  if(ok)App.fb('#l6-fb5','ok','成功！bank 变成了河岸',why+' 想再玩？把语境换成“存钱”，看 AI 怎么译。',{stars:3});
  else App.fb('#l6-fb5','try',isBank?'还是“银行”':'还不是河岸',why+' 换几个线索词再试。',{stars:bk.ok?3:1});
  App.busy(b,false);b.classList.add('again');bLab();};
 marks2b();bLab();

 /* ---------------- EXP-03 · 人机翻译擂台 ---------------- */
 const ar=lr.arena;ar.pick=ar.pick||{};ar.rev=ar.rev||{};ar.g=ar.g||{};let arId='you',g4=null;
 const rhyme=(t,ws)=>{let e=esc(t);(ws||[]).forEach(w=>{e=e.replace(new RegExp(`\\b(${w})\\b`),'<span class="l6-rhy">$1</span>');});return e;};
 const drawArena=()=>{const it=ARENA.find(x=>x.id===arId),rev=!!ar.rev[it.id];
  const ver=(vk,i)=>{const who=it.order[i],V=it.v[who];return `<div class="l6-ver ${rev?who:''}"><div class="h">译文${vk==='x'?'甲':'乙'}${rev?`<span class="who ${who==='ai'?'ai':''}">${who==='ai'?'AI 翻译':'人工翻译'}</span>`:''}</div><div class="l6-poem ${V.serif?'serif':''}" lang="${it.to}">${rev&&V.rhyme?rhyme(V.t,V.rhyme):esc(V.t)}</div>${V.gloss?`<p class="note">中文大意：${esc(V.gloss)}</p>`:''}${rev?`<p class="note">${esc(V.tag)}</p>`:''}</div>`;};
  $('#l6-arena').innerHTML=`<span class="l6-tag">原文 · ${esc(it.title)}</span><div class="l6-src ${it.from==='zh'?'poem':''}" lang="${it.from}">${esc(it.src)}</div><div class="l6-vs">${ver('x',0)}${ver('y',1)}</div>`;
  show($('#l6-pickpad'),rev);$('#l6-pick').innerHTML=['x','y'].map((vk,i)=>`<button type="button" class="chip ${ar.pick[it.id]===it.order[i]?'on':''}" data-pk="${it.order[i]}">译文${vk==='x'?'甲':'乙'}（${it.order[i]==='ai'?'AI':'人工'}）</button>`).join('');
  $$('[data-pk]',s3).forEach(b=>b.onclick=()=>{ar.pick[it.id]=b.dataset.pk;App.touch();drawArena();marks3();
   App.fb('#l6-fb6','find',b.dataset.pk==='ai'?'你更喜欢 AI 这一版':'你更喜欢人工这一版',(b.dataset.pk==='ai'?'简单直接也是一种好。':'有韵味、有感情，是人花了心思的地方。')+(Object.keys(ar.pick).length>=ARENA.length?'两道题都选好了，和同桌说说它哪里打动了你。':'在上面换一道原文，再猜一次。'));});};
 const marks3=()=>{if(Object.keys(ar.rev).length)App.markStep(s3,0);if(Object.keys(ar.pick).length)App.markStep(s3,1);};
 App.segWire(s3,'ar',v=>{arId=v;g4=null;clearSeg(s3,'g4');drawArena();resetAI('#l6-ai6','#l6-fb6',ar.rev[arId]?'这一题揭晓过了，可以再看一遍':'先猜一猜，再按「揭晓」');});App.segWire(s3,'g4',v=>{g4=v;});
 $('#l6-rev').onclick=async()=>{const it=ARENA.find(x=>x.id===arId),b=$('#l6-rev'),guess=g4;App.busy(b,true,'揭晓中…');App.aiSay('#l6-ai6','答案马上揭晓……',{busy:true});
  let live='',mode='demo';
  if(App.AI.real()){try{const r=await App.AI.translate(it.src,{to:it.to});if(r&&r.text){live=r.text;mode=r.mode||App.AI.mode();ar.live=(ar.live||0)+1;}}catch(e){App.AI.fail(e);}}else await wait(600);
  const aiV=it.order[0]==='ai'?'x':'y',nm=v=>v==='x'?'译文甲':'译文乙',right=guess===aiV;
  ar.rev[it.id]=1;if(guess!=null&&ar.g[it.id]==null)ar.g[it.id]=right?1:0;bump();App.touch();drawArena();marks3();
  App.aiSay('#l6-ai6',`<div class="big">${nm(aiV)}是 AI，${nm(aiV==='x'?'y':'x')}是人工</div><p class="l6-tr">${esc(it.more)}</p>${live?`<p class="l6-mini">AI 现场再译一次</p><div class="l6-tr" style="margin-top:0" lang="${it.to}">${esc(live)}</div>`:''}`,{mood:'think',src:srcOf(mode)});
  const nOk=Object.values(ar.g).filter(Boolean).length,stars=nOk>=ARENA.length?3:nOk>=1?2:1;
  if(guess==null)App.fb('#l6-fb6','find',`${nm(aiV)}是 AI 译的`,it.after,{stars});
  else if(right)App.fb('#l6-fb6','ok',`猜对了！${nm(aiV)}是 AI 译的`,it.after,{stars});
  else App.fb('#l6-fb6','find',`猜反了，${nm(aiV)}才是 AI`,it.after,{stars});
  g4=null;clearSeg(s3,'g4');App.busy(b,false);b.classList.add('again');};
 drawArena();marks3();

 /* ---------------- TALK · AI 会取代人吗 ---------------- */
 let ti=!ar.stance?0:!(ar.cases||[]).length?1:2;
 const csScore=cs=>clamp((cs.filter(k=>(CASES.find(c=>c[0]===k)||[])[2]).length-cs.filter(k=>(CASES.find(c=>c[0]===k)||[])[2]===0).length)/4,0,1);
 const talkStars=()=>{const n=[!!ar.stance,(ar.cases||[]).length>0,ar.honest!=null].filter(Boolean).length;return n<3?Math.min(1,n):(ar.honest===1?3:2);};let csDone=(ar.cases||[]).length>0;
 const marksT=()=>{if(ar.stance)App.markStep(s3b,0);if(ar.stance&&(ar.cases||[]).length&&ar.honest!=null)App.markStep(s3b,1);};
 const drawTalk=()=>{const box=$('#l6-talk'),sel=new Set(ar.cases||[]);
  const Q=[['你觉得 AI 翻译会完全取代人工翻译吗？',STANCE.map(([k,t])=>`<button type="button" class="chip ${ar.stance===k?'on':''}" data-sn="${k}">${t}</button>`).join('')],
   ['在什么情况下，人工翻译仍然不可替代？（可多选）',CASES.map(([k,t])=>`<button type="button" class="chip ${sel.has(k)?'sel':''}" data-cs="${k}">${t}</button>`).join('')],
   ['用 AI 翻译完成英语作业，交作业时应该怎么做？',HONEST.map((t,j)=>`<button type="button" class="chip ${ar.honest===j?'on':''}" data-hn="${j}">${t}</button>`).join('')]][ti];
  box.innerHTML=`<div class="q" style="border:0;padding:0"><b><span class="note">第 ${ti+1} / 3 个</span><br>${Q[0]}</b><div class="opts">${Q[1]}</div><div class="row">${ti?'<button type="button" class="btn ghost sm" data-tp>上一个</button>':''}${ti===1&&!csDone?'<button type="button" class="btn sm" data-tok>选好了</button>':''}${ti<2&&(ti===0?ar.stance:csDone)?'<button type="button" class="btn sm" data-tn>下一个</button>':''}</div></div>`;
  $$('[data-sn]',box).forEach(b=>b.onclick=()=>{ar.stance=b.dataset.sn;if(!ar.stanceFirst)ar.stanceFirst=ar.stance;App.touch();marksT();drawTalk();
   App.fb('#l6-fb7','find','观点已记下！',{yes:'AI 确实越来越强。点「下一个」，想想哪些翻译离不开人。',no:'情感和文化要靠人。点「下一个」，找找具体的例子。',unsure:'说不清也没关系。点「下一个」，从具体例子里找答案。'}[ar.stance],{stars:talkStars()});});
  $$('[data-cs]',box).forEach(b=>b.onclick=()=>{const k=b.dataset.cs;sel.has(k)?sel.delete(k):sel.add(k);ar.cases=[...sel];App.touch();if(csDone){csDone=false;drawTalk();}else b.classList.toggle('sel',sel.has(k));});
  $$('[data-hn]',box).forEach(b=>b.onclick=()=>{ar.honest=+b.dataset.hn;if(ar.honestFirst==null)ar.honestFirst=ar.honest;App.touch();marksT();drawTalk();
   if(ar.honest===1)App.fb('#l6-fb7','ok','对！用了 AI 要说明','AI 帮你打底，你负责检查、修改和说明。三个问题都答完了！',{stars:talkStars()});
   else App.fb('#l6-fb7','try','再想想','老师想了解的是你自己的能力。换一个做法试试。',{stars:talkStars()});});
  const tok=$('[data-tok]',box);if(tok)tok.onclick=()=>{if(!sel.size){App.toast('至少选一个');return;}csDone=true;marksT();const easy=['shop','sign'].filter(k=>sel.has(k)).map(k=>CASES.find(c=>c[0]===k)[1]);
   App.fb('#l6-fb7','find',`你选了 ${sel.size} 种情况`,'课本的看法：诗歌、小说这类有细腻情感和文化背景的翻译，人不可替代；外交、合同、双关语也要人把关。'+(easy.length?`「${easy.join('」「')}」这样的日常小事，很多人觉得交给 AI 就够了——你为什么觉得还要人？和同桌说说。`:'问价格、看路牌这样的日常小事，交给 AI 通常就够了。')+' 点「下一个」。',{stars:talkStars()});drawTalk();};
  const tp=$('[data-tp]',box);if(tp)tp.onclick=()=>{ti--;drawTalk();};const tn=$('[data-tn]',box);if(tn)tn.onclick=()=>{ti++;drawTalk();};};
 drawTalk();marksT();

 /* ---------------- EXP-04 · 跨语言小导游：左边游客的问题，右边我的回答 ---------------- */
 const G=lr.guide,chat=$('#l6-chat');let gd=null,rpi=0;
 const msg=(cls,html)=>{chat.insertAdjacentHTML('beforeend',`<div class="l6-msg ${cls}">${html}</div>`);$('#l6-histn').textContent=`对话记录（${$$('.l6-msg.v,.l6-msg.me',chat).length} 句，点开看）`;};
 const vis=(P,en,zh)=>{msg('v',`<span class="w">游客 ${esc(P.vis)}（英文）</span><span lang="en">${esc(en)}</span><span class="t">AI 译成中文：${esc(zh)}</span>`);
  $('#l6-vis').innerHTML=`<span class="w">游客 ${esc(P.vis)} 说（英文）</span><div class="l6-src" lang="en">${esc(en)}</div><div class="l6-vzh"><small>AI 帮你译成中文</small>${esc(zh)}</div><button type="button" class="btn ghost sm" id="l6-sayen">朗读英文</button>`;
  $('#l6-sayen').onclick=()=>{if(!Speech.say(en,{lang:'en-US',rate:0.92}))App.toast('这台设备不能朗读');};
  const N=P.nodes.length,cur=Math.min(gd.node,N-1);$('#l6-dots').innerHTML=P.nodes.map((_,i)=>`<i class="${gd.done||i<gd.node?'d':i===cur?'c':''}"></i>`).join('')+`<span>${gd.done?'参观结束':`第 ${cur+1} / ${N} 个问题`}</span>`;};
 const nodeOf=()=>{const P=PLACES[gd.place];return P.nodes[Math.min(gd.node,P.nodes.length-1)];};
 const optsOf=()=>{const r=nodeOf().r;return r.length>1&&gd.node%2?[r[1],r[0]]:r;};
 const drawReplies=()=>{const box=$('#l6-rp'),b=$('#l6-say');
  if(gd.done){const other=Object.keys(PLACES).find(k=>k!==gd.place);box.innerHTML=`<span class="note">参观结束，游客满意地离开了。</span><button type="button" class="btn ghost sm" data-again="${gd.place}">再逛一次</button><button type="button" class="btn ghost sm" data-again="${other}">换去${PLACES[other].n}</button>`;
   $$('[data-again]',box).forEach(x=>x.onclick=()=>{const k=x.dataset.again;$$('[data-seg="pl"] .chip',s4).forEach(c=>c.classList.toggle('on',c.dataset.v===k));startGuide(k);});b.disabled=true;return;}
  b.disabled=false;const os=optsOf();rpi=gd.prevVague?Math.max(0,os.findIndex(r=>!r.vague)):0;
  box.innerHTML=os.map((r,i)=>`<button type="button" class="chip big ${i===rpi?'on':''}" data-rp="${i}" ${gd.prevVague&&r.vague?'disabled title="这句游客没听懂"':''}>${esc(r.zh)}${gd.prevVague&&r.vague?'（游客没听懂）':''}</button>`).join('');
  $$('[data-rp]',box).forEach(x=>x.onclick=()=>{rpi=+x.dataset.rp;$$('[data-rp]',box).forEach(y=>y.classList.toggle('on',y===x));});};
 const startGuide=place=>{gd={place,node:0,turns:0,vague:0,prevVague:false,done:false};const P=PLACES[place];chat.innerHTML='';$('#l6-gtag').textContent=`${P.city} · ${P.n} · 游客 ${P.vis}（来自${P.vfrom}）`;msg('sys',`${P.city} · ${P.n} · 游客 ${P.vis}（来自${P.vfrom}）`);vis(P,P.hi.en,P.hi.zh);drawReplies();
  if($('#l6-ai7 .ai-src'))resetAI('#l6-ai7','#l6-fb8','选一句回答，按按钮，AI 把它译成英文');};
 const drawObs4=()=>{const sel=new Set(G.why||[]);show($('#l6-obs4pad'),(G.vague||0)>=1||!!G.done);$('#l6-obs4').innerHTML=WHY4.map(([k,t])=>`<button type="button" class="chip ${sel.has(k)?'sel':''}" data-w4="${k}">${t}</button>`).join('');
  $$('[data-w4]',s4).forEach(b=>b.onclick=()=>{const k=b.dataset.w4;sel.has(k)?sel.delete(k):sel.add(k);G.why=[...sel];App.touch();drawObs4();
   if(sel.has('ai'))App.fb('#l6-fb8','try','翻译 AI 没有出故障','AI 把你的话照原样译了过去。是原话没说清，游客才听不懂。');
   else if(sel.has('ref')&&sel.has('info'))App.fb('#l6-fb8','ok','两种情况都找到了！','说出具体的名称和数字，一句话说清一件事，AI 才能译清楚。');
   else if(sel.has('ref'))App.fb('#l6-fb8','find','找到一种，还有一种','想一想：“它很老了”“那是一座桥”为什么也让游客追问？');
   else if(sel.has('info'))App.fb('#l6-fb8','find','找到一种，还有一种','想一想：“那个”“前面那个”，游客知道指的是什么吗？');});};
 const marks4=()=>{if((G.turns||0)>=1)App.markStep(s4,0);if(G.done)App.markStep(s4,1);};
 App.segWire(s4,'pl',v=>startGuide(v));
 $('#l6-say').onclick=async()=>{if(!gd||gd.done)return;const P=PLACES[gd.place],nd=nodeOf(),r=optsOf()[rpi]||nd.r[0],b=$('#l6-say');App.busy(b,true,'AI 正在译…');App.aiSay('#l6-ai7','把你的话译成英文……',{busy:true});
  let en=r.en,mode='demo';
  if(App.AI.real()){try{const t=await App.AI.translate(r.zh,{to:'en',context:`一位小学生导游正在${P.city}${P.n}向外国游客做介绍，这是他说的一句话。`});if(t&&t.text){en=t.text.trim();mode=t.mode||App.AI.mode();}}catch(e){App.AI.fail(e);}}else await wait(500);
  msg('me',`<span class="w">我 · 小导游（中文）</span><span>${esc(r.zh)}</span><span class="t" lang="en">AI 译成英文：${esc(en)}</span>`);
  const vague=!!r.vague;let vEn,vZh;if(vague){vEn=r.v.en;vZh=r.v.zh;}else{vEn=nd.next.en;vZh=nd.next.zh;if(nd.end)gd.done=true;gd.node++;}
  const fixed=!vague&&gd.prevVague;G.place=gd.place;if(vague){msg('tip',`<b>翻译提示：</b>${esc(r.tip)}`);G.vague=(G.vague||0)+1;gd.vague++;}else if(fixed)G.fixed=(G.fixed||0)+1;else G.clear=(G.clear||0)+1;
  gd.prevVague=vague;gd.turns++;G.turns=(G.turns||0)+1;G.m=mode;if(gd.done){G.done=1;}vis(P,vEn,vZh);if(gd.done)msg('sys','参观结束，游客满意地离开了。');
  bump();App.touch();marks4();
  App.aiSay('#l6-ai7',`<p class="l6-mini" style="margin-top:0">我说：${esc(r.zh)}</p><div class="big" lang="en">${esc(en)}</div>`,{mood:vague?'oops':'happy',src:srcOf(mode)});
  const stars=G.done?3:(G.turns||0)>=3?2:1;
  if(vague)App.fb('#l6-fb8','oops','游客没听懂！',esc(r.tip)+' 看左边游客的追问，再说一句清楚的。',{stars});
  else if(gd.done)App.fb('#l6-fb8','ok','导游任务完成！',`这一趟说了 ${gd.turns} 句，${gd.vague?`有 ${gd.vague} 次游客没听懂，你都改对了。`:'一句都没让游客糊涂。'}想再玩？换个景点，试试含糊的说法，看游客什么反应。`,{stars,cheer:true});
  else if(fixed)App.fb('#l6-fb8','ok','改对了，游客听懂了！','说出具体的名称和数字，AI 才能译清楚。左边是他的新问题。',{stars});
  else App.fb('#l6-fb8','ok','游客听懂了','左边是他的新问题，再选一句回答他。',{stars});
  drawReplies();drawObs4();App.busy(b,false);if(gd.done)b.disabled=true;};
 startGuide('gugong');drawObs4();marks4();

 L._refresh=()=>{$('#l6-up').hidden=!App.AI.sample;};

 App.quiz($('#l6-quiz'),K,QUIZ);
 const rd=App.diary($('#l6-diary'),K,{title:'小小翻译官',lead:'用你的实验证据来回答',
  fields:[{id:'use',q:'如果你要和外国友人对话或阅读外国文学作品，你会如何使用 AI 的翻译功能？',ph:'和外国友人对话时，我会……；读外国文学作品时，我会……'},
   {id:'context',q:'你对“a piece of cake”这类语境翻译的理解：为什么同一个短语会有不同的译法？',ph:'在对话 1 里……，在对话 2 里……，因为……'},
   {id:'replace',q:'你觉得 AI 翻译会完全取代人工翻译吗？在什么情况下，人工翻译仍然不可替代？',ph:'我认为……，因为……'},
   {id:'future',q:'请你畅想一下：未来 AI 翻译技术会有什么新发展？',ph:'我想象未来……'}],
  pledge:'用 AI 翻译时，我会补充语境、检查译文；作业里用了 AI 翻译会主动说明，不把它当成自己的作品。',
  extras:ex=>{const l=App.lesson(K);const w=l.work,c=(l.ctx||{}),a=l.arena||{},g=l.guide||{};const mark=(it,col)=>{const x=c[it.id]||{};const r=(x.r||{})[col.k],p=(x.p||{})[col.k];return r==null?'—':`${esc((x.d||{})[col.k]||col.dst)} ${p==null?'':r===p?'<span style="color:var(--green)">✓</span>':'<span style="color:var(--red)">✗</span>'}`;};
   ex.innerHTML=`<div class="l6-ex"><div><div class="box-t">我的翻译作品</div>${w?`<div class="l6-out">${esc(w.src)}</div><div class="l6-out" style="margin-top:6px">${esc(w.dst)}</div><p class="note">${esc(LN(w.from))} → ${esc(LN(w.to))} · AI 翻译（${w.m==='demo'?'离线演示':esc(App.AI.srcName(w.m))}），本人检查后保存</p>`:'<p class="note">在环球翻译厅翻译后，点「存为作品」。</p>'}</div>
    <div><div class="box-t">语境预测记录（✓ 猜对了）</div><div class="scroll"><table><thead><tr><th>短语</th><th>无语境</th><th>语境 1</th><th>语境 2</th></tr></thead><tbody>${CTX.filter(it=>c[it.id]&&Object.keys(c[it.id].r||{}).length).map(it=>`<tr><td>${esc(it.phrase)}</td>${it.cols.map(col=>`<td>${mark(it,col)}</td>`).join('')}</tr>`).join('')||'<tr><td colspan="4" class="note">还没有做语境小实验。</td></tr>'}</tbody></table></div></div>
    <div><div class="box-t">人机翻译擂台</div><p class="note">${ARENA.map(it=>`${esc(it.title)}：${a.pick&&a.pick[it.id]?(a.pick[it.id]==='ai'?'更喜欢 AI 版':'更喜欢人工版'):'未选择'}`).join('；')}<br>我的观点：${a.stance?esc(STANCE.find(s=>s[0]===a.stance)[1]):'未表态'}</p></div>
    <div><div class="box-t">跨语言小导游 · 速度实验</div><p class="note">${g.place?`${esc(PLACES[g.place].n)}：${g.turns||0} 轮对话，游客没听懂 ${g.vague||0} 次，改对 ${g.fixed||0} 次${g.done?'，完成参观':''}`:'还没有当小导游'}<br>已完成文本等级：${(l.lv||[]).slice().sort().map(x=>'L'+x).join('、')||'无'}；尝试过的目标语言：${(l.langs||[]).map(LN).join('、')||'无'}</p></div></div>`;}});
 App.on(()=>{if(App.current===K)rd();});
}
L.onShow=()=>{if(L._refresh)L._refresh();};
L.onHide=()=>{if(window.Speech&&Speech.release)Speech.release();stopAll();};

/* ---------- hooks ---------- */
function ctxPred(lr){let n=0,ok=0;const C=lr.ctx||{};CTX.forEach(it=>{const x=C[it.id]||{};const p=x.p||{},r=x.r||{};it.cols.forEach(col=>{if(p[col.k]!=null&&r[col.k]!=null){n++;if(p[col.k]===r[col.k])ok++;}});});return {n,ok};}
const ctxFull=lr=>CTX.some(it=>Object.keys((((lr.ctx||{})[it.id]||{}).r)||{}).length>=3);
L.score=lr=>{const Q=lr.quiz||{},qs=id=>Q[id]?(Q[id].ok?100:0):0,tx=App.txtScore,D=lr.diary||{};const al=lr.align||{},aq=Object.values(al.q||{}),o=lr.obs1||{},co=lr.ctxObs||{},bk=lr.bank||{},ar=lr.arena||{},g=lr.guide||{};
 const pr=ctxPred(lr);const cs=ar.cases||[];const csS=clamp((cs.filter(k=>(CASES.find(c=>c[0]===k)||[])[2]).length-cs.filter(k=>(CASES.find(c=>c[0]===k)||[])[2]===0).length)/4,0,1);
 const gs=Object.values(ar.g||{}),picks=Object.keys(ar.pick||{}).length;
 return {principle:25*Math.min(1,(al.st||[]).length/2)+25*(aq.length?aq.filter(Boolean).length/aq.length:0)+0.25*qs('q1')+0.25*qs('q4'),
  experiment:8*Math.min(5,(lr.lv||[]).length)+20*Math.min(1,(lr.langs||[]).length/4)+10*['q1','q2','q3'].filter(k=>o[k]!=null).length+10*(lr.dict?1:0),
  prompt:45*(bk.ok?1:0)+0.15*tx(bk.ctx,20)+25*Math.min(1,Math.max((g.fixed||0)/2,(g.clear||0)/4))+0.15*qs('q3'),
  critical:25*(pr.n?pr.ok/pr.n:0)+(co.sameFirst===0?10:co.same===0?5:0)+(co.isoFirst===1?10:co.iso===1?5:0)+15*(gs.length?gs.filter(Boolean).length/gs.length:0)+0.15*tx(D.context,30)+10*csS+0.075*qs('q2')+0.075*qs('q5'),
  creative:20*Math.min(1,picks/2)+30*Math.min(1,(g.turns||0)/4)+15*(g.done?1:0)+20*(lr.work?1:0)+0.15*tx(D.future,30),
  ethics:30*(D.pledge?1:0)+(ar.honestFirst===1?40:ar.honest===1?20:0)+0.3*tx(D.replace,30)};};
L.progress=lr=>{const co=lr.ctxObs||{},ar=lr.arena||{},o=lr.obs1||{};
 const m=[(lr.lv||[]).length>=3,['q1','q2','q3'].every(k=>o[k]!=null),Object.keys((lr.align||{}).q||{}).length>0||((lr.align||{}).st||[]).length>0,ctxFull(lr)&&co.same!=null&&co.iso!=null,!!(lr.bank||{}).tries,
  Object.keys(ar.pick||{}).length>=2,!!ar.stance,((lr.guide||{}).turns||0)>=3,Object.keys(lr.quiz||{}).length>=5,!!(lr.diary||{}).submitted];
 return m.filter(Boolean).length/m.length;};
L.quiz=QUIZ;
L.flow=[
 {seg:'导入',from:'l6-s0'},
 {seg:'挑战一',kp:'知识点一 · 超级词典：AI 怎样翻译',learn:['AI 翻译三步：拆分 → 查找 → 重组','比逐词查外语词典更快、更通顺','打字、说话、拍照，都能让 AI 翻译'],sum:['简单句几乎瞬间译完；长难句会停顿，但整段能译完','词典逐词拼出来不通顺，AI 重组后自然好懂'],from:'l6-s1',to:'l6-s1'},
 {seg:'挑战二',kp:'知识点二 · 语境：信息越充分，译得越准',learn:['语境＝前后的话、说话的场合、文化背景','同一内容，语境不同，译法就不同','给 AI 的信息越充分、清晰，译得越准'],sum:['a piece of cake 放进对话后译成“小菜一碟”','补一句钓鱼的语境，bank 就译成“河岸”'],from:'l6-s2',to:'l6-s2'},
 {seg:'挑战三',kp:'知识点三 · 人机各有所长',learn:['AI 更快，也比传统翻译工具更符合表达习惯','AI 依赖学过的内容，不会自动理解情境和引申义','细腻情感、深刻文化的翻译，人依然不可替代'],sum:['AI 常只译出字面意思，人工译文更有感情和韵味','日常交流交给 AI，情感文化深的翻译要人把关'],from:'l6-s3',to:'l6-s3'},
 {seg:'综合运用',from:'l6-s4'},
 {seg:'反思与总结',from:'l6-quizst'}
];
L.diaryTitle='小小翻译官';
L.diaryQ=[['use','怎样使用 AI 翻译'],['context','语境翻译的理解'],['replace','AI 会取代人工翻译吗'],['future','畅想未来的 AI 翻译']];
const card=(glyph,line,color)=>'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200"><rect width="320" height="200" fill="#0c1430"/><path d="M0 40H320M0 80H320M0 120H320M0 160H320M40 0V200M80 0V200M120 0V200M160 0V200M200 0V200M240 0V200M280 0V200" stroke="#4cc9f0" stroke-opacity=".06"/><text x="24" y="118" font-size="76" font-weight="900" fill="${color}" font-family="Noto Sans SC,sans-serif">${glyph}</text><text x="130" y="96" font-size="15" fill="#e9eefc" font-family="Noto Sans SC,sans-serif">${line[0].replace(/[<&>]/g,'')}</text><text x="130" y="122" font-size="13" fill="#a3afd6" font-family="Noto Sans SC,sans-serif">${line[1].replace(/[<&>]/g,'')}</text></svg>`);
const cut=(s,n)=>{const a=[...String(s||'')];return a.length>n?a.slice(0,n).join('')+'…':a.join('');};
L.works=lr=>{const o=[];const w=lr.work;if(w)o.push({t:'小小翻译官 · 我的译文',s:`${cut(w.src,40)} → ${cut(w.dst,60)}`,img:card('译',[`${LN(w.from)} → ${LN(w.to)}`,cut(w.dst,12)],'#4cc9f0')});
 const c=((lr.ctx||{}).cake||{});if(Object.keys(c.r||{}).length>=3)o.push({t:'语境小实验',s:`a piece of cake：无语境→${(c.d||{}).n||'一块蛋糕'}；对话 2→${(c.d||{}).b||'小菜一碟'}`,img:card('境',['a piece of cake',`对话 2 → ${cut((c.d||{}).b||'小菜一碟',8)}`],'#f9c74f')});
 const g=lr.guide||{};if((g.turns||0)>=3&&PLACES[g.place])o.push({t:'跨语言小导游',s:`带外国游客参观${PLACES[g.place].n}，${g.turns} 轮中英对话`,img:card('导',[PLACES[g.place].n,`${g.turns} 轮对话`],'#90be6d')});return o;};
L.expCount=lr=>lr.nExp||0;
L.classPanels=recs=>{const R=recs.map(r=>(r.lessons||{})[K]||{}).filter(l=>Object.keys(l).length);if(!R.length)return '';
 const bar=(n,v,tot,col)=>`<div class="hbar"><span>${n}</span><span class="tr"><i style="width:${tot?100*v/tot:0}%;background:${col}"></i></span><span>${tot?Math.round(100*v/tot)+'%':'—'}</span></div>`;
 const cnt=(n,v,tot,col)=>`<div class="hbar"><span>${n}</span><span class="tr"><i style="width:${tot?100*v/tot:0}%;background:${col}"></i></span><span>${v}</span></div>`;
 const acc=(it,col)=>{let n=0,ok=0;R.forEach(l=>{const x=(l.ctx||{})[it.id]||{};const p=(x.p||{})[col.k],r=(x.r||{})[col.k];if(p!=null&&r!=null){n++;if(p===r)ok++;}});return [ok,n];};
 const cake=CTX[0];const rows=cake.cols.map(col=>{const [ok,n]=acc(cake,col);return bar(`cake · ${col.name}`,ok,n,'var(--amber)');}).join('')+CTX.slice(1).map(it=>{let ok=0,n=0;it.cols.forEach(col=>{const a=acc(it,col);ok+=a[0];n+=a[1];});return bar(`${it.phrase}（三栏）`,ok,n,'var(--amber)');}).join('');
 const bt=R.filter(l=>(l.bank||{}).tries).length,bo=R.filter(l=>(l.bank||{}).ok).length;
 const st={yes:0,no:0,unsure:0};R.forEach(l=>{const a=l.arena||{};const s=a.stanceFirst||a.stance;if(s)st[s]++;});const stN=st.yes+st.no+st.unsure;
 const pk=ARENA.map(it=>{let h=0,a=0;R.forEach(l=>{const p=((l.arena||{}).pick||{})[it.id];if(p==='human')h++;if(p==='ai')a++;});return `<div class="hbar"><span>${esc(it.title)}</span><span class="tr" style="display:flex"><i style="width:${h+a?100*h/(h+a):0}%;background:var(--green);border-radius:3px 0 0 3px"></i><i style="width:${h+a?100*a/(h+a):0}%;background:var(--violet);border-radius:0 3px 3px 0"></i></span><span>${h}:${a}</span></div>`;}).join('');
 const lg=LANGS.map(([c,n])=>[n,R.filter(l=>(l.langs||[]).includes(c)).length]);
 return `<div class="box"><div class="box-t">第6讲 · 语境小实验：先预测、再翻译（预测正确率）</div>${rows}<p class="note" style="margin-top:6px">补充语境让 bank 译成“河岸”：${bo}/${bt} 人成功</p></div>
  <div class="box"><div class="box-t">第6讲 · 人机翻译擂台与语言尝试</div><b style="font-size:13px">AI 会完全取代人工翻译吗？（第一次表态，${stN} 人）</b>${cnt('会',st.yes,stN,'var(--red)')}${cnt('不会完全取代',st.no,stN,'var(--green)')}${cnt('说不清',st.unsure,stN,'var(--dim)')}
   <b style="font-size:13px;display:block;margin-top:8px">更打动自己的译文（<span style="color:var(--green)">人工</span> : <span style="color:var(--violet)">AI</span>）</b>${pk}
   <b style="font-size:13px;display:block;margin-top:8px">尝试过各目标语言的人数</b>${lg.map(([n,v])=>cnt(n,v,R.length,'var(--cyan)')).join('')}</div>`;};
L.classSug=recs=>{const R=recs.map(r=>(r.lessons||{})[K]||{}).filter(l=>Object.keys(l).length);if(!R.length)return [];const out=[];
 let worst=null;CTX.forEach(it=>it.cols.forEach(col=>{let n=0,ok=0;R.forEach(l=>{const x=(l.ctx||{})[it.id]||{};const p=(x.p||{})[col.k],r=(x.r||{})[col.k];if(p!=null&&r!=null){n++;if(p===r)ok++;}});if(n>=3){const v=ok/n;if(!worst||v<worst.v)worst={it,col,v,n};}}));
 if(worst&&worst.v<0.7)out.push(`第6讲语境小实验里，「${worst.it.phrase} · ${worst.col.name}」的预测正确率最低（${Math.round(worst.v*100)}%，${worst.n} 人）：把这一栏和无语境一栏并排投影，请学生指出是哪一句话提供了关键线索。`);
 const st=R.map(l=>(l.arena||{}).stanceFirst||(l.arena||{}).stance).filter(Boolean);const yes=st.filter(s=>s==='yes').length;
 if(st.length&&yes/st.length>=0.25)out.push(`有 ${yes} 名学生第一次表态认为“AI 会完全取代人工翻译”：可以把《静夜思》的两种英译并排展示，请学生找出押韵和译者添加的 I wake、wondering eyes，讨论“再创作”为什么需要人。`);
 const bt=R.filter(l=>(l.bank||{}).tries).length,bo=R.filter(l=>(l.bank||{}).ok).length;
 if(out.length<2&&bt>=3&&bo/bt<0.6)out.push(`补充语境挑战（bank → 河岸）只有 ${bo}/${bt} 人成功：示范在语境里直接写出地点线索（“我们带着鱼竿去河边”），再请学生自己改写一次。`);
 return out.slice(0,2);};
L.demo=(rnd,t)=>{const p=x=>rnd()<x;const pickS=a=>a[Math.floor(rnd()*a.length)];const lr={};const nl=Math.max(1,Math.min(5,Math.round(1+t*4*(0.6+0.5*rnd()))));lr.lv=[1,2,3,4,5].slice(0,nl);
 lr.tr=lr.lv.map(lv=>({id:'',lv,from:lv===1||lv===5?'zh':'en',to:lv===1?'en':lv===5?pickS(['ru','fr','es']):'zh',ms:[0,1300,1200,7600,21000,1400][lv],first:[0,350,350,650,1100,450][lv],st:[0,0,0,2,5,0][lv],n:[0,30,14,120,260,16][lv],m:'demo',in:'text'}));
 lr.langs=[...new Set(lr.tr.map(r=>r.to).concat(p(.3+t*.5)?[pickS(['ru','fr','es'])]:[],p(t*.6)?[pickS(['ru','fr','es'])]:[],p(t*.6)?['ja']:[],p(t*.4)?['de']:[]))];
 lr.obs1={};if(nl>=1&&p(.4+t*.6))lr.obs1.q1=p(.85)?0:1;if(nl>=3&&p(.3+t*.6))lr.obs1.q2=p(.6)?1:0;if(nl>=4&&p(.3+t*.6))lr.obs1.q3=p(.6)?2:1;
 if(p(.2+t*.6))lr.photos=['museum','choc','station'].slice(0,1+Math.floor(rnd()*3));
 lr.align={st:p(.4+t*.5)?['s1-en','e2-zh'].slice(0,p(t)?2:1):[],q:p(.3+t*.6)?{'s1-en':p(.4+t*.6)?1:0,'e2-zh':p(.3+t*.6)?1:0}:{}};lr.dict=p(.3+t*.6)?1:0;
 lr.ctx={};CTX.forEach((it,i)=>{if(i===0?p(.3+t*.7):p(t*.8)){const P={},Rr={},Dd={};it.cols.forEach(col=>{Rr[col.k]=col.ans;Dd[col.k]=col.dst;const right=p(i===0&&col.k==='b'?.35+t*.6:.45+t*.5);P[col.k]=right?col.ans:(col.ans+1)%3;});lr.ctx[it.id]={p:P,r:Rr,d:Dd,m:{}};}});
 if(lr.ctx.cake){const sf=p(.5+t*.5)?0:1,isf=p(.4+t*.6)?1:0;lr.ctxObs={same:0,sameFirst:sf,iso:1,isoFirst:isf};}
 if(p(.3+t*.6)){const ok=p(.3+t*.6);lr.bank={tries:1+Math.floor(rnd()*3),ok:ok?1:0,last:ok,first:ok&&p(.5)?1:0,ctx:ok?'我们带上鱼竿去河边钓鱼。':'我们明天见面。',out:ok?'我们在河边见面吧。':'我们在银行见面吧。'};}
 const ar={pick:{},rev:{},g:{}};ARENA.forEach(it=>{if(p(.35+t*.6)){ar.rev[it.id]=1;if(p(.85))ar.g[it.id]=p(.45+t*.5)?1:0;ar.pick[it.id]=p(.75)?'human':'ai';}});
 if(p(.3+t*.6)){ar.stance=p(.2+t*.75)?'no':pickS(['yes','unsure']);ar.stanceFirst=p(.8)?ar.stance:'yes';ar.cases=['lit','dip',...(p(t)?['med']:[]),...(p(.25)?['shop']:[])];}
 if(p(.3+t*.6)){ar.honest=1;ar.honestFirst=p(.6+t*.4)?1:0;}lr.arena=ar;
 if(p(.25+t*.65)){const turns=2+Math.floor(rnd()*5*t+1);const vague=Math.floor(rnd()*3);lr.guide={place:p(.5)?'gugong':'xihu',turns,vague,fixed:Math.min(vague,Math.round(vague*(.3+t*.7))),clear:Math.max(0,turns-2*vague),done:turns>=5?1:0,m:'demo',why:p(t)?['ref','info']:['ref']};}
 if(p(t))lr.work={src:'我昨天在图书馆看书。',dst:'I read in the library yesterday.',from:'zh',to:'en',m:'demo'};
 const q=(id,pp)=>{const ok=p(pp);const a=QUIZ.find(x=>x.id===id).a;return {first:ok?a:(a+1)%3,ok,last:a};};
 if(p(.3+t*.7))lr.quiz={q1:q('q1',.6+t*.4),q2:q('q2',.55+t*.4),q3:q('q3',.7+t*.3),q4:q('q4',.45+t*.5),q5:q('q5',.6+t*.4)};
 const txt=n=>['和外国朋友聊天时，我会先用 AI 翻译，再看看对方能不能听懂；读外国小说时，我会对照人工翻译的版本。','同一个短语在不同的对话里意思不一样，AI 要看前后的句子才能翻对。','我认为不会完全取代，诗歌和外交这样的翻译需要人的理解和感情。','未来的 AI 翻译也许能戴在耳朵上，实时翻译，还能听出说话人的语气。'][n];
 if(p(.2+t*.7))lr.diary={use:p(t+.2)?txt(0):'用 AI 翻译。',context:p(t+.1)?txt(1):'',replace:p(t+.1)?txt(2):'不会。',future:p(t)?txt(3):'更快。',pledge:p(.8),submitted:p(t+.1)?1:0};
 lr.nExp=lr.tr.length+Object.values(lr.ctx).reduce((a,x)=>a+Object.keys(x.r||{}).length,0)+((lr.bank||{}).tries||0)+((lr.guide||{}).turns||0);
 return lr;};
})();
