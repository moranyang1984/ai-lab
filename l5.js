/* 第5讲 配音工作室 (v3) — 配音工作台 / 我来设计音色 / 判一判场合 / 声音指纹 / 克隆找破绽 / 如果被模仿的是你 / 防骗小剧场 / 声音使用公约 */
(function(){
const {$,$$,esc,clamp}=App;const K='l5';const L={};App.lessons[K]=L;

/* ---------- lesson CSS (all selectors prefixed .l5-) ---------- */
{const old=document.getElementById('css-l5');if(old)old.remove();const st=document.createElement('style');st.id='css-l5';st.textContent=`
.l5-col{display:flex;flex-direction:column;gap:14px;min-width:0}
.l5-narrow{max-width:680px}
.l5-scr,.l5-card,.l5-phone,.l5-pact{align-self:start}
.l5-scr{background:#101a3d;border:1.5px solid var(--line2);border-radius:16px;padding:12px 14px 14px;display:flex;flex-direction:column;gap:6px;min-width:0}
.l5-say{font-family:var(--f-display);font-weight:800;font-size:22px;line-height:1.5;color:#fff;text-align:center;padding:6px 4px 8px}
.l5-say.poem{font-size:21px;letter-spacing:.08em;line-height:1.8}
.l5-cvl{font-size:12.5px;color:#d6e4ff}
.l5-cv{width:100%;height:84px;display:block;border-radius:10px;background:#060b1d}
.l5-cv.t{height:150px}
.l5-lg{display:flex;gap:14px;flex-wrap:wrap;font-size:12.5px;color:#d6e4ff}
.l5-lg i{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:5px;vertical-align:-1px}
.l5-syl{display:flex;flex-wrap:wrap;gap:4px;margin-top:8px}
.l5-syl span{font-size:14px;min-width:24px;text-align:center;padding:0 4px;border-radius:8px;background:#fff;border:2px solid var(--line2);color:var(--ink)}
.l5-syl span.p{border-color:transparent;background:none;color:var(--grape-d);min-width:10px;padding:0}
.l5-ai{display:inline-block;font-size:12.5px;font-weight:700;padding:0 10px;border-radius:999px;background:var(--grape-soft);border:2px solid var(--grape);color:var(--grape-d);white-space:nowrap}
.l5-gate{display:flex;flex-direction:column;gap:8px}
.l5-gate label{display:flex;gap:10px;align-items:flex-start;font-size:15.5px;cursor:pointer;color:var(--ink)}
.l5-gate input{margin-top:3px;flex:none}
.l5-gate b{font-family:var(--f-display);font-weight:800;font-size:18px;color:var(--ink)}
.l5-card{display:flex;flex-direction:column;gap:12px;padding:16px 18px;border-radius:18px;background:var(--sky-soft);border:1.5px solid var(--line2)}
.l5-card .t{font-family:var(--f-display);font-weight:800;font-size:23px;line-height:1.4;color:var(--ink)}
.l5-card .k{font-size:13.5px;font-weight:700;color:var(--muted)}
.l5-two{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.l5-two .chip{text-align:center;justify-content:center;font-weight:700}
.l5-opts .chip.right{background:var(--mint);border-color:var(--mint-d);color:#fff}
.l5-opts .chip.wrong{background:var(--coral);border-color:var(--coral-d);color:#fff}
.l5-opts{display:flex;flex-direction:column;gap:8px}
.l5-phone{display:flex;flex-direction:column;gap:12px;padding:16px 18px 18px;border-radius:22px;background:var(--sky-soft);border:1.5px solid var(--line2);box-shadow:0 4px 16px #5a3fd012}
.l5-dots{display:flex;gap:8px;align-items:center;font-size:13.5px;font-weight:700;color:var(--muted)}
.l5-who{display:flex;align-items:center;gap:12px;font-size:16px;font-weight:700;color:var(--ink)}
.l5-who svg{flex:none;width:46px;height:46px}
.l5-phone.l5-ringing .l5-who svg{animation:l5ring .5s ease-in-out infinite alternate}
@keyframes l5ring{from{transform:rotate(-12deg)}to{transform:rotate(12deg)}}
.l5-line{font-size:18px;line-height:1.7;padding:12px 16px;border-radius:16px 16px 16px 4px;background:#fff;border:2px solid var(--line2);color:var(--ink)}
.l5-phone.l5-ringing .l5-line{color:var(--muted);border-style:dashed}
.l5-pact{position:relative;background:var(--paper);border:1.5px solid var(--line2);border-radius:18px;padding:20px 22px;display:flex;flex-direction:column;gap:10px;box-shadow:0 4px 16px #5a3fd012}
.l5-pact h3{text-align:center;font-family:var(--f-display);font-weight:800;letter-spacing:.2em;font-size:24px;color:var(--coral-d);margin:0}
.l5-pact ol{margin:0;padding-left:24px;font-size:16px;line-height:1.8;color:var(--ink)}
.l5-pact li.mine{color:var(--sky);font-weight:700}
.l5-pact .ifc{font-size:14.5px;color:var(--muted)}
.l5-pact .sg{text-align:right;font-size:14.5px;color:var(--muted)}
.l5-pact .sg b{color:var(--ink);font-family:var(--f-display);font-weight:800;font-size:20px;margin:0 6px}
.l5-seal{position:absolute;right:16px;bottom:44px;width:84px;height:84px;border-radius:50%;border:4px solid var(--red);color:var(--red);display:grid;place-items:center;font-family:var(--f-display);font-weight:800;font-size:19px;line-height:1.1;text-align:center;transform:rotate(-14deg);background:#ffffffb0;animation:pop .4s cubic-bezier(.3,1.6,.5,1)}
.l5-own{flex:1;min-width:0;width:100%}
.l5-goal{display:flex;flex-wrap:wrap;gap:8px;align-items:center;font-size:14.5px;font-weight:700;color:#fff;padding:2px 0 6px}
.l5-goal i{font-style:normal;padding:2px 12px;border-radius:999px;background:#ffffff1f;border:1.5px dashed #ffffff66;color:#d6e4ff}
.l5-goal i.ok{background:#12b886;border:1.5px solid #12b886;color:#fff}
.l5-listen{display:none;gap:8px;flex-wrap:wrap;align-items:center;padding-top:6px}
.station.ran .l5-listen{display:flex}
.l5-listen .btn{background:#fff}
.l5-dots button{width:26px;height:26px;border-radius:50%;border:2px solid var(--line2);background:#fff;padding:0;cursor:pointer;font-size:12.5px;font-weight:800;color:var(--muted);font-family:inherit}
.l5-dots button.ok{border-color:var(--mint-d);background:var(--mint);color:#fff}
.l5-dots button.no{border-color:var(--coral-d);background:var(--coral);color:#fff}
.l5-dots button.cur{outline:3px solid var(--sun-d);outline-offset:2px}
.l5-view{font-size:14.5px;line-height:1.6;padding:10px 14px;border-radius:14px;background:#fff;border:1.5px solid var(--line2);color:var(--ink)}
.l5-tally{display:flex;gap:8px;flex-wrap:wrap}
.l5-tally span{font-size:13.5px;font-weight:700;padding:2px 12px;border-radius:999px;background:#fff;border:1.5px solid var(--line2);color:var(--ink)}
@media (max-width:480px){.l5-say{font-size:18px}.l5-say.poem{font-size:17px;letter-spacing:.02em}.l5-card .t{font-size:19px}.l5-line{font-size:16px}.l5-seal{width:68px;height:68px;font-size:15px}}
`;document.head.appendChild(st);}

/* ---------- data ---------- */
const VOICES=[
 {id:'nav',n:'导航播报',sc:'导航系统 · 亲切清楚',f0:225,rate:4.6,gap:0,flat:false,gpt:'nova',style:'亲切、清楚的导航播报'},
 {id:'svc',n:'智能客服',sc:'客服热线 · 专业耐心',f0:245,rate:4.2,gap:7,flat:false,gpt:'shimmer',style:'专业、耐心的客服'},
 {id:'news',n:'新闻播报',sc:'经典男声 · 字正腔圆',f0:120,rate:4.4,gap:7,flat:false,gpt:'onyx',style:'字正腔圆的新闻播音'},
 {id:'old',n:'有声读物 · 老爷爷',sc:'故事角色 · 低沉缓慢',f0:100,rate:3.0,gap:3,flat:false,gpt:'fable',style:'慈祥的老爷爷，慢慢讲故事'},
 {id:'kid',n:'有声读物 · 小朋友',sc:'故事角色 · 清脆活泼',f0:330,rate:5.0,gap:0,flat:false,gpt:'coral',style:'活泼的小朋友角色'},
 {id:'robot',n:'机械声音',sc:'早期电子语音 · 一字一顿',f0:150,rate:3.4,gap:1,flat:true,gpt:'echo',style:'平板的机器人声音'},
 {id:'custom',n:'自定义音色',sc:'自己调参数设计'}];
const PAUSE=g=>g===1?'每字':g===0?'短':g<=3?'长':'中';
const QUICK=[['大家好，我是AI小助手。','默认句'],['前方三百米右转，请走右侧车道。','导航'],['您好，请问有什么可以帮您？','客服'],['从前，山脚下住着一位老爷爷。','有声读物']];
const NAT=['很自然，像真人','基本自然，个别地方生硬','明显听得出是机器'];
const DIFF=[['tone','语调变化少，不够抑扬顿挫'],['pause','停顿死板，没有换气'],['emo','没有感情和语气变化'],['poly','个别字读音不对'],['same','几乎听不出区别']];
const SCN=[{id:'a',t:'地铁、公交的报站广播',ok:true,why:'信息固定、要求清楚准确，用 AI 合成很高效。'},
 {id:'b',t:'给住院的奶奶录一段生日祝福',ok:false,why:'这是需要真诚表达的场合，亲口说的话才带着你的心意。'},
 {id:'c',t:'给科普视频配旁白，并标注“AI 合成配音”',ok:true,why:'用途正当，又标明了 AI 合成，观众不会被误导。'},
 {id:'d',t:'向闹别扭的好朋友道歉',ok:false,why:'道歉需要真诚，用 AI 的声音会让对方觉得你没有诚意。'},
 {id:'e',t:'用 AI 模仿家长的声音给老师打电话请假',ok:false,why:'冒用他人的声音是欺骗，既不道德，也不合法。'},
 {id:'f',t:'有声读物里给不同的角色配音',ok:true,why:'AI 能用不同音色扮演不同角色，让录音工作变得高效。'}];
const POEM='床前明月光，疑是地上霜。举头望明月，低头思故乡。';
const NEW1='今天我们学习了AI语音合成，真有意思！';
const HARD='银行行长长得很高，他说：“这首乐曲让大家都很快乐。”';
const DEMO={f0:265,rate:3.6};
const FLAWS=[['flat','语调太平，没有抑扬顿挫'],['breath','没有呼吸、换气声'],['pause','停顿位置不对'],['emo','情感、语气不对'],['poly','难字或多音字读错'],['timbre','音色不像本人'],['speed','语速不自然'],['none','几乎找不到破绽']];
const LIKE=['很像，几乎分不出','有点像','不太像','完全不像'];
const STABLE=['很稳定，难句也读得好','大部分好，个别字读错','难句明显变差'];
const PEERS=['同学一下就听出是 AI','听了几遍才发现','同学没有听出来'];
const FEEL=['生气','害怕','担心有人被骗','觉得被冒犯','有点好奇','无所谓'];
const ACT=['告诉家长和老师','保留证据（截图、链接）','要求对方删除','向平台举报','情节严重时报警','不理它'];
const FRAUD=[
 {id:'f1',tag:'来电 · 像妈妈',who:'来电 · 陌生号码 170****3521',sp:{f0:225,rate:5.2,gpt:'nova'},line:'宝贝，是妈妈。妈妈手机坏了，借别人的电话打给你。快把你的压岁钱转到这个账户，急用！',
  opts:['声音就是妈妈，马上转账','先挂断，用家里存的号码打给妈妈本人核实，并告诉其他家人','把手机收到的验证码告诉她，让她自己操作'],a:1,
  why:'AI 能把声音模仿得很像。陌生号码 + 着急要钱，就是危险信号。挂断后用自己知道的号码回拨，是最可靠的核实办法；验证码绝不能告诉任何人。',tool:'挂断后用已知号码回拨'},
 {id:'f2',tag:'群语音 · “老师”',who:'班级群语音 ·「王老师」（新换的头像）',sp:{f0:210,rate:4.6,gpt:'shimmer'},line:'各位同学，请马上点开群里的链接，填写家长的身份证号和银行卡号，领取学习补贴。',
  opts:['老师说的，赶快点链接填写','转发到其他群，让更多同学领取','不点链接、不填信息，告诉家长，再当面或用老师公布过的电话问老师本人'],a:2,
  why:'正规的通知不会在群里让你填身份证号和银行卡号。头像、声音都可能是假的，要用可靠的渠道问老师本人。',tool:'不点链接、不填信息，问老师本人'},
 {id:'f3',tag:'语音 · 好朋友借钱',who:'语音消息 · 好友「阳阳」（刚加的新号）',sp:{f0:300,rate:4.8,gpt:'coral'},line:'我在商场买东西钱不够，你先转我两百块，明天上学就还你，别告诉别人哈。',
  opts:['问一个只有你们俩知道的问题，再打他家里的电话确认','好朋友嘛，先转了再说','回一条语音把他骂一顿'],a:0,
  why:'新号码 + 借钱 + 让你保密，都是危险信号。问只有你们知道的事、打已知的电话确认，就能拆穿冒充者。',tool:'问只有彼此知道的事'},
 {id:'f4',tag:'视频 · 名人推荐',who:'短视频 · 著名主持人的声音',sp:{f0:130,rate:4.6,gpt:'onyx'},line:'我自己的孩子就在吃这款营养品，一个月长高五厘米，现在下单还送大礼包！',
  opts:['名人推荐的一定靠谱，让家长下单','名人的声音可能是 AI 伪造的：去查他的官方账号和权威新闻，不轻信、不下单','转发到家庭群，提醒亲戚快买'],a:1,
  why:'用 AI 伪造名人的声音做广告是常见的骗局。看到“名人推荐”，要到官方渠道核实来源。',tool:'查官方账号和权威来源'},
 {id:'f5',tag:'录音 · 同学说坏话',who:'班里流传的一段录音',sp:{f0:280,rate:4.3,gpt:'alloy'},line:'（听起来像小林的声音）我最讨厌我们班的某某了，大家都别跟他玩。',
  opts:['马上转发，让大家都知道','去找小林当面吵一架','不转发、不评论，告诉老师：录音可能是剪辑或 AI 伪造的'],a:2,
  why:'伪造他人的语音制造谣言会伤害别人。没有核实的录音，不转发、不传播，交给老师处理。',tool:'不转发未核实的录音'},
 {id:'f6',tag:'来电 · “爷爷”出事',who:'来电 · 外地号码',sp:{f0:105,rate:3.6,gpt:'fable'},line:'孩子，我是爷爷，我出了点事急需用钱，千万别告诉你爸妈，先把家里的钱转给我。',
  opts:['爷爷让保密，就不告诉爸妈','立刻告诉爸妈，并用家里存的号码打给爷爷本人','把家里银行卡的密码告诉他'],a:1,
  why:'“别告诉家长”是骗子最常用的话术之一。遇到要钱的电话，第一时间告诉家长，一起核实。',tool:'告诉家长，不替骗子保密'}];
const PRIN=[['尊重他人','未经允许，绝不使用或制作他人的语音。'],['保持警惕','听到重要的语音信息，要核实其来源。'],['知法守法','知道伪造他人语音是不道德、不合法的行为。']];
const PRIVACY='录音只在本机分析，不上传、不保存；只录自己的声音。';
const PRIVACY_FULL='录音只在这台设备的内存里分析，不上传、不保存，离开本页立即删除。只录你自己的声音，不录别人。';

/* ---------- voice engine ---------- */
let zh=[];const loadVoices=()=>Speech.voices('zh').then(v=>{zh=v||[];}).catch(()=>{});
const isMale=v=>/男|male|yun(xi|yang|jian|ze|hao|feng)|kangkang|zhiwei/i.test(v.name||'');
function devVoice(g){if(!zh.length)return null;const cn=a=>a.filter(v=>/zh[-_]cn/i.test(v.lang)).concat(a);const m=cn(zh.filter(isMale)),f=cn(zh.filter(v=>!isMale(v)));return g==='m'?(m[0]||f[0]):(f[0]||m[0]);}
function browserParams(sp){const v=devVoice(sp.f0<170?'m':'f');const base=v&&isMale(v)?120:220;return {voice:v,pitch:clamp(sp.f0/base,0.1,2),rate:clamp(sp.rate/4.3,0.5,2)};}
/* pauses for the browser voice: insert short breaks every `gap` characters inside a phrase */
function withPauses(text,gap){if(!gap||gap>=7)return text;return text.split(/([，。！？；：、,.!?;:“”"])/).map(seg=>{if(seg.length<=gap||/^[，。！？；：、,.!?;:“”"]$/.test(seg))return seg;const c=[...seg],o=[];c.forEach((ch,i)=>{o.push(ch);if((i+1)%gap===0&&i<c.length-1)o.push('，');});return o.join('');}).join('');}
const aiVoiceOn=()=>{const m=App.AI&&App.AI.mode();return m==='api'||(App.AI&&App.AI.desktop&&m==='gpt');};
/* speak `text` in voice `sp` with the best engine; returns {h,label} */
async function voicePlay(text,sp){const spoken=withPauses(text,sp.gap);
 if(aiVoiceOn()&&sp.gpt){try{const h=await Speech.speak(spoken,{voice:sp.gpt,speed:clamp(sp.rate/4.3,0.5,2),style:sp.style||''});if(h&&h.engine==='ai')return {h,src:App.AI.mode(),label:`来源：${App.AI.label()}语音（${sp.gpt}，音色由模型提供）`};}catch(e){}}
 if(!Speech.ttsSupported())return {h:null,src:'这台设备没有语音，只能看图',label:'这台设备不支持语音合成：只能观察图形，听不到声音。'};
 const p=browserParams(sp);const h=Speech.say(spoken,{voice:p.voice,pitch:p.pitch,rate:p.rate,lang:'zh-CN'});
 return {h,src:p.voice?'设备语音':'设备默认语音',label:p.voice?`来源：浏览器语音「${p.voice.name}」，按音色参数调节 音高×${p.pitch.toFixed(2)}、语速×${p.rate.toFixed(2)}`:'来源：浏览器默认语音（无中文语音包，可能听不到）'};}
const waitDone=(r,text)=>Promise.race([(r&&r.h&&r.h.done)||Promise.resolve(),new Promise(res=>setTimeout(res,1500+[...text].length*420))]);

/* ---------- signals (16 kHz Float32Array) ---------- */
const flatten=t=>[...t].map(c=>/[，。！？；：、,.!?;:“”"\s]/.test(c)?c:'d').join('');   // one constant tone for every syllable
const sigFor=(text,sp,seed=3)=>Speech.synthSpeech(sp.flat?flatten(text):text,{f0:sp.f0,rate:sp.rate,gapEvery:sp.gap,seed});
/* a "human" demo reading: each phrase at its own pitch and pace, with a breath between phrases */
function humanSig(text,{f0,rate,seed=21}){const parts=(text.match(/[^，。！？；：,.!?;:]+[，。！？；：,.!?;:]*/g)||[text]).filter(s=>s.trim());const out=[];let a=seed;const rnd=()=>{a=(a*9301+49297)%233280;return a/233280;};
 parts.forEach((p,i)=>{const lift=[1.2,0.88,1.28,0.84][i%4];const s=Speech.synthSpeech(p,{f0:f0*lift,rate:rate*(0.85+0.3*rnd()),seed:seed+i,gapEvery:0});out.push(s.subarray(Math.floor(0.2*16000)));
  if(i<parts.length-1){const n=Math.round(16000*0.24),b=new Float32Array(n);let lp=0;for(let k=0;k<n;k++){lp=lp*0.7+(rnd()*2-1)*0.3;b[k]=lp*0.05*Math.sin(Math.PI*k/n);}out.push(b);}});
 const len=out.reduce((x,y)=>x+y.length,0),r=new Float32Array(len+3200);let o=1600;out.forEach(s=>{r.set(s,o);o+=s.length;});return r;}
/* mic AudioBuffer -> trimmed 16 kHz buffer for analysis */
function prepRec(buf){const d=buf.getChannelData(0),sr=buf.sampleRate,f=Math.max(1,Math.round(sr/16000)),n=Math.floor(d.length/f),o=new Float32Array(n);
 for(let i=0;i<n;i++){let s=0;for(let j=0;j<f;j++)s+=d[i*f+j];o[i]=s/f;}const sr2=sr/f;
 const e=Speech.energy(Speech.asBuffer(o,sr2),0.01);let mx=0;e.forEach(v=>mx=Math.max(mx,v));let a=0,b=e.length-1;while(a<b&&e[a]<mx*0.1)a++;while(b>a&&e[b]<mx*0.1)b--;
 const s0=Math.max(0,Math.round((a*0.01-0.15)*sr2)),s1=Math.min(n,Math.round((b*0.01+0.25)*sr2));return Speech.asBuffer(o.slice(s0,Math.max(s0+1,s1)),sr2);}
/* measure a known-text clip: trim silence, Speech.features, fix octave jumps of the autocorrelation tracker, speech rate = syllables ÷ voiced time */
const sylCount=t=>[...String(t||'')].filter(c=>/[\u4e00-\u9fff\w]/.test(c)).length;
function trim(x){const d=x.getChannelData(0),sr=x.sampleRate;const e=Speech.energy(x,0.01);let mx=0;e.forEach(v=>mx=Math.max(mx,v));let a=0,b=e.length-1;while(a<b&&e[a]<mx*0.1)a++;while(b>a&&e[b]<mx*0.1)b--;
 const s0=Math.max(0,Math.round((a*0.01-0.1)*sr)),s1=Math.min(d.length,Math.round((b*0.01+0.15)*sr));return Speech.asBuffer(d.slice(s0,Math.max(s0+1,s1)),sr);}
function measure(x,text){const t=trim(x);const f=Speech.features(t);if(!f)return f;const v=f.pitch.map(p=>p.f0).filter(Boolean).sort((a,b)=>a-b);
 if(v.length){const med=v[Math.floor(v.length/2)];f.pitch.forEach(p=>{if(!p.f0)return;let best=p.f0;[2,3,4,1.5,1/2,1/3,2/3].forEach(k=>{const c=p.f0*k;if(Math.abs(Math.log(c/med))<Math.abs(Math.log(best/med)))best=c;});if(Math.abs(Math.log(p.f0/med))>Math.log(1.35))p.f0=Math.round(best);});
  const g=f.pitch.map(p=>p.f0).filter(Boolean).sort((a,b)=>a-b),pc=q=>Math.round(g[Math.min(g.length-1,Math.floor(q*g.length))]);f.meanF0=Math.round(g.reduce((a,b)=>a+b,0)/g.length);f.lowF0=pc(.1);f.highF0=pc(.9);}
 const n=sylCount(text);if(n&&f.dur>0.3)f.rate=+(n/f.dur).toFixed(1);f.sig=t;return f;}
const rangeOf=f=>f&&f.highF0&&f.lowF0?f.highF0-f.lowF0:null;
const fmt=(v,u='')=>v==null||Number.isNaN(v)?'—':v+u;

/* ---------- module state (memory only; cleared by onHide) ---------- */
let mem={poem:null,ctrl:null,clone:null};   // {sig(buffer-like),raw(AudioBuffer|null),feat,src,text}
let recCtl=null,scopeStop=null,recTimer=null,wired=false,afterHide=null;
const stopRec=cancel=>{clearInterval(recTimer);recTimer=null;if(scopeStop){scopeStop();scopeStop=null;}if(recCtl&&cancel){try{recCtl.cancel();}catch(e){}}if(cancel)recCtl=null;};

/* ---------- v3 station data ---------- */
const VSHORT={nav:'导航播报',svc:'智能客服',news:'新闻播报',old:'老爷爷',kid:'小朋友',robot:'机械声音'};
/* each target = [name, two visible conditions [label, test, how-to-fix]] — the lights on the screen follow the sliders */
const TG={old:['老爷爷',[['声音低低的',c=>c.f0<=130,'把「音高」滑杆往左拖，拖到 130 Hz 以下。'],['说得慢慢的',c=>c.rate<=3.4,'把「语速」滑杆往左拖，拖到 3.4 以下。']]],
 kid:['小朋友',[['声音高高的',c=>c.f0>=290,'把「音高」滑杆往右拖，拖到 290 Hz 以上。'],['说得快快的',c=>c.rate>=4.6,'把「语速」滑杆往右拖，拖到 4.6 以上。']]],
 robot:['机器人',[['每个字一个调',c=>!!c.flat,'「抑扬」点「平」。'],['一字一顿',c=>c.gap===1,'「停顿」点「每字」。']]]};
const tgHit=(k,c)=>TG[k][1].every(x=>x[1](c));
/* 判一判场合：这是看法题，不判对错；只有“冒用别人的声音”有明确的底线 */
const WHY=['信息固定，说清楚就行','要真心，亲口说才有心意','会骗人，伤害别人','标明了是 AI，不误导人','我有别的理由'];
const STRICT={e:1};
const hiWord=f=>f>=260?'高':f>=170?'中':'低',spWord=r=>r>=4.7?'快':r>=3.6?'中':'慢';
/* placeholder text on an empty screen canvas */
const cvHint=(cv,t)=>{if(!cv)return;const w=cv.clientWidth,h=cv.clientHeight;if(!w||!h)return;const d=Math.min(2,window.devicePixelRatio||1);cv.width=Math.round(w*d);cv.height=Math.round(h*d);const g=cv.getContext('2d');g.save();g.setTransform(d,0,0,d,0,0);g.fillStyle='#060b1d';g.fillRect(0,0,w,h);g.fillStyle='#9fb4e8';g.font='700 14px system-ui,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(t,w/2,h/2);g.restore();};
const NEWS=[[NEW1,'普通句'],[HARD,'难句（多音字）']];
const OWN=['分享时标明“AI 合成”','只录自己的声音','听到要钱的语音先核实'];
const PHONE='<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="21" fill="#12b886" stroke="#1b2550" stroke-width="3"/><path d="M17 13l5 1 1 6-3 2q3 6 8 8l2-3 6 1 1 5q-2 3-6 2Q17 33 13 19q-1-4 4-6z" fill="#fff" stroke="#1b2550" stroke-width="2" stroke-linejoin="round"/></svg>';
const scr=(sayId,body,cls='')=>`<div class="l5-scr"><div class="l5-say ${cls}" id="${sayId}"></div>${body}</div>`;
const sylHTML=text=>{const ch=[...text].filter(c=>/\S/.test(c));const P=/[，。！？；：、,.!?;:“”"]/;return `<p class="note">AI 先把这句话拆成 ${ch.filter(c=>!P.test(c)).length} 个音（一个字一个音）：</p><div class="l5-syl">${ch.map(c=>P.test(c)?'<span class="p">‖</span>':`<span>${esc(c)}</span>`).join('')}</div>`;};
const featHTML=sp=>`<div class="feat">${[['音高',`${hiWord(sp.f0)}（${sp.f0} Hz）`],['语速',`${spWord(sp.rate)}（每秒 ${sp.rate} 个字）`],['停顿',PAUSE(sp.gap)],['抑扬',sp.flat?'平':'自然']].map(([k,v])=>`<span>${k} ${v}</span>`).join('')}</div>`;
const tick=()=>new Promise(r=>setTimeout(r,40));   // let the busy state paint before the signal maths
const waitAI=(id,text)=>{const b=$(id);if(!b)return;b.classList.add('wait');b.classList.remove('busy');$('.ai-body',b).innerHTML=text;const s=$('.ai-src',b);if(s)s.innerHTML='';};

L.render=function(){const v=$('#v-l5');wired=false;
 v.innerHTML=`${App.hero(K,'当一回配音师：换音色、找破绽，再学会识破“假声音”。',['能用 AI 合成不同风格的语音。','能用 AI 克隆自己的语音。','明确知道 AI 语音合成技术可能带来的风险及其应对措施。'])}

 <div class="station" id="l5-s1">${App.head('EXP-01','挑战一 · 语音配音师','配音工作台','同一句话，换 3 种音色听听看')}
  <ol class="steps"><li>选音色配音</li><li>集齐 3 种音色</li></ol>
  <div class="grid2">${scr('l5-say1',`<div class="l5-cvl">声音的波形</div><canvas class="l5-cv" id="l5-w1"></canvas><div class="l5-cvl">音高曲线：点越高，声音越高</div><canvas class="l5-cv t" id="l5-p1"></canvas><div class="l5-lg"><span><i style="background:#ffd43b"></i><span id="l5-lg1">现在选的</span></span><span id="l5-lg0w" hidden><i style="background:#4cc9f0"></i><span id="l5-lg0">上一次听的</span></span></div>`)}
   <div class="l5-col">${App.knobs([['句子',App.seg('txt',[['0','打招呼'],['1','导航'],['2','客服'],['3','讲故事'],['4','我的昵称']],'0')],['音色',App.seg('vc',Object.entries(VSHORT),'nav')]])}
    <div class="go-row">${App.go('l5-go1','让 AI 配音')}</div>
    ${App.aiBox('l5-ai1','选好音色，按下大按钮','AI 配音师')}<div id="l5-fb1"></div>
    <div class="after-run">${App.pad('AI 的声音和真人说话差在哪？（可多选）',`<div class="opts" id="l5-diff"></div>`)}<div class="row"><button class="btn ghost sm" type="button" data-keep="1">存为我的作品</button></div></div></div></div>
  <details class="more"><summary>说明</summary><p class="note">图形说明：设备语音没法直接录下来分析，所以平台用同样的音色参数合成一段示意信号，再画出它的波形和音高曲线（示意）。你听到的声音来自气泡里注明的来源。</p><div class="grid2">${App.know('AI 怎样合成语音','AI 先学习大量的语音，把每种声音的特征记录下来：音高（声音的高低）、语速（说得快慢）、停顿、音色（声音的“质地”，比如沙哑、清脆）。我们输入文字后，AI 把文字拆成一个个音节，确定每个字的读音和声调（多音字要看上下文），再按照指定的音色，把对应的语音特征组合起来发音。换一个音色，就是换一组特征。')}
  ${App.know('语音百宝箱','AI 能合成不同风格的语音，就像拥有一个语音百宝箱：在导航系统中，AI 用亲切的语音为我们指路；在智能客服中，用专业的语音解答问题；在有声读物中，用不同音色扮演不同角色……AI 让原本要花大量时间完成的录音工作变得高效。')}</div></details>
 </div>

 <div class="station" id="l5-s1b">${App.head('EXP-01b','挑战一 · 语音配音师','我来设计音色','拖滑杆点亮两盏灯，调出目标音色！')}
  <ol class="steps"><li>调出目标音色</li><li>三个目标全调出</li></ol>
  <div class="grid2">${scr('l5-say1b',`<div class="l5-goal" id="l5-goal"></div><div class="l5-cvl">声音的波形</div><canvas class="l5-cv" id="l5-wb"></canvas><div class="l5-cvl">音高曲线：边调边看它怎么变</div><canvas class="l5-cv t" id="l5-pb"></canvas>`)}
   <div class="l5-col">${App.knobs([['我要调出',App.seg('tg',Object.entries(TG).map(([k,t])=>[k,t[0]]),'old')],['音高',App.range('l5-cf0',90,360,5,200,' Hz')],['语速',App.range('l5-crt',2.5,6,0.1,4,''),'字/秒'],['停顿',App.seg('gp',[['0','短'],['3','长'],['1','每字']],'0')],['抑扬',App.seg('fl',[['0','自然'],['1','平']],'0')]])}
    <div class="go-row">${App.go('l5-gob','听听我的音色')}</div>
    ${App.aiBox('l5-aib','两盏灯都亮了，就按大按钮听一听','AI 配音师')}<div id="l5-fbb"></div>
    <div class="after-run"><div class="row"><button class="btn ghost sm" type="button" data-keep="b">存为我的作品</button></div></div></div></div>
  <details class="more"><summary>说明</summary><p class="note">音高：声音的高低，单位 Hz。语速：每秒读几个字。停顿选“每字”，就是一字一顿。抑扬选“平”，每个字都是一个调。换一组特征，就换了一种音色。</p></details>
 </div>

 <div class="station" id="l5-s1c">${App.head('EXP-01c','挑战一 · 语音配音师','判一判场合','这些场合用 AI 的声音，你怎么看？')}
  <ol class="steps"><li>选看法，说理由</li><li>6 个全想完</li></ol>
  <div class="l5-col l5-narrow"><div id="l5-scn"></div><div id="l5-fbc"></div></div>
  <details class="more"><summary>说明</summary><p class="note">这一站没有标准答案：说出你的看法和理由就行。只有一条底线——不能冒用别人的声音去骗人。6 个场合是课程补充的例子。</p>${App.think(['AI 的语音合成功能在生活中有哪些应用？','你认为哪些场合不能使用 AI 合成的语音？'])}${App.know('声音里有心意','我们的声音不仅传递信息，还承载着每个人的个性和风格。独属于人类语音的抑扬顿挫和语气转折，依然难以被模仿。一些需要真诚表达的场合，不适合使用 AI 合成的语音。')}</details>
 </div>

 <div class="station" id="l5-s2">${App.head('EXP-02','挑战二 · 语音克隆','声音指纹','朗读一首古诗，让 AI 学这个声音')}
  <ol class="steps"><li>确认授权</li><li>朗读古诗</li></ol>
  <div class="box l5-gate" id="l5-gate"></div>
  <div class="l5-col" id="l5-lab" hidden><div class="grid2" data-rb="1">${scr('l5-poem',`<div class="l5-cvl">正在听：声音的样子</div><canvas class="l5-cv" id="l5-live"></canvas><div class="l5-cvl" id="l5-rtime"></div>`,'poem')}
   <div class="l5-col">${App.knobs([['谁来读',App.seg('src',[['mic','我自己'],['demo','示例同学']],'demo')]])}
    <div class="go-row"><span style="font-weight:700">先猜：这个声音</span>${App.seg('g2',[['hi','偏高，尖细'],['lo','偏低，低沉']],'')}${App.go('l5-rec','开始朗读')}</div></div></div>
   <div class="below">${App.aiBox('l5-ai2','读完后，声音指纹出现在这里','声音指纹')}<div id="l5-fb2"></div>
    <div class="after-run"><div class="row"><button class="btn ghost sm" type="button" id="l5-porig">再听一遍</button><span class="note">${PRIVACY}</span></div></div></div></div>
  <details class="more"><summary>说明</summary><p class="note">音高就是声音的高低，单位是 Hz（赫兹），数字越大声音越尖细。偏高：200 Hz 以上，像小朋友的声音；偏低：200 Hz 以下，像老爷爷的声音。语速 = 字数 ÷ 朗读时长。这些数字只在本机显示，不保存到班级数据。</p><p class="note">隐私：${PRIVACY_FULL} 语音克隆体验需要老师在课堂上说明并开启；克隆出的声音不下载、不外传，不用来冒充任何人。</p>${App.know('语音克隆','语音克隆是语音合成的一种应用。AI 能在听一个人说话的基础上，快速学习并模仿这个人的语音特征，合成新的语音。教师可以用 AI 模仿自己的声音，合成教学视频的讲解；影视行业可以用 AI 辅助完成配音……')}</details>
 </div>

 <div class="station" id="l5-s2b">${App.head('EXP-02b','挑战二 · 语音克隆','克隆找破绽','让 AI 用学到的声音读新句子，找出破绽！')}
  <ol class="steps"><li>克隆朗读</li><li>找出 3 个破绽</li></ol>
  <div class="box" id="l5-lock" hidden><b>还没解锁</b><p class="note">先到上一站「声音指纹」确认课堂授权，再回来。</p></div>
  <div class="l5-col" id="l5-lab2" hidden><div class="grid2" data-rb="1">${scr('l5-say2',`<div class="l5-cvl">音高曲线对比：点越高，声音越高</div><canvas class="l5-cv t" id="l5-cmp"></canvas><div class="l5-lg"><span><i style="background:#51e0a8"></i><span id="l5-lgo">真人</span></span><span><i style="background:#ffd43b"></i>AI 克隆</span></div><div class="l5-listen"><button class="btn ghost sm" type="button" id="l5-pctrl">听真人</button><button class="btn ghost sm" type="button" id="l5-pclone">听 AI 克隆</button></div>`)}
   <div class="l5-col">${App.knobs([['新句子',App.seg('nw',NEWS.map((n,i)=>[i,n[1]]),'0')]])}
    <div class="go-row"><span style="font-weight:700">我猜 AI 读得</span>${App.seg('g3',[['flat','比真人平'],['same','一样有起伏']],'')}${App.go('l5-clone','克隆朗读')}</div></div></div>
   <div class="below">${App.aiBox('l5-ai3','AI 没听过这句话。它能读出来吗？','AI 克隆')}<div id="l5-fb3b"></div>
    <div class="after-run">${App.pad('听一听、看一看，你发现了哪些破绽？（可多选）',`<div class="opts" id="l5-flaws"></div>`)}<p class="note">克隆的声音只在本页播放，不能下载。</p></div></div></div>
  <details class="more"><summary>说明</summary><p class="note">这里的演示版克隆只学了平均音高和语速两个特征，再交给设备语音去读；真正的语音克隆模型会从录音里学习音色、口音、情感、换气习惯等更多特征，所以会像得多——也更需要提防被滥用。</p><p class="note">起伏 = 最高音高 − 最低音高。用自己的声音时，绿点是你读古诗的曲线（句子不同）；用示例同学时，绿点是同学读同一句话。示例同学的声音是平台做的演示，不是真人录音。</p>${App.think(['AI 的语音克隆功能在生活中有哪些应用？'])}${App.know('为什么还能找到破绽','AI 学到的是“平均”的特征。真人说话时，音高会随着情绪和意思上下起伏，句子之间会换气，重要的词会加重、放慢；遇到多音字，人会根据意思判断读音。这些抑扬顿挫和语气转折，AI 很难完全模仿，所以音高曲线往往更平、更整齐。')}</details>
 </div>

 <div class="station" id="l5-talk">${App.head('DISCUSS','挑战三 · 换位思考','如果被模仿的是你','有人偷偷模仿你的声音，你怎么办？')}
  <ol class="steps"><li>选感受和做法</li><li>写下一种后果</li></ol>
  <div class="grid2"><div class="l5-card"><span class="k">想象一下 · 课程补充情景</span><div class="t">班级群里有一条语音，听起来就是你的声音。可这句话，你从来没说过。</div><span class="note">语音克隆只需要一小段录音。</span></div>
   <div class="l5-col"><div class="before-run" id="l5-tq"></div><div id="l5-fbt"></div>
    <div class="after-run">${App.pad('这项技术被恶意利用，会造成什么后果？谁会受伤害？',`<textarea id="l5-a2" placeholder="比如有人会……，受到伤害的是……" aria-label="被恶意利用的后果"></textarea>`)}<div class="row"><button class="btn ghost sm" type="button" id="l5-tre">重新选</button></div></div></div></div>
  <details class="more"><summary>说明</summary>${App.think(['如果有人未经同意用 AI 模仿你的语音，你会有什么感受？你会如何应对？','这项技术如果被恶意利用，可能会造成什么后果？'])}${App.know('技术本身没有善恶','如果语音克隆被恶意利用，也可能成为侵犯他人权益的手段：诈骗分子会用伪造的语音骗取钱财，别有用心的人会伪造他人的语音制造谣言。技术本身没有善恶，关键在于使用者的态度和目的。科学技术只有在尊重他人、遵守规则的前提下应用与发展，才能真正造福人类。')}</details>
 </div>

 <div class="station" id="l5-s3">${App.head('EXP-03','挑战三 · 识别与应对','防骗小剧场','接听 6 个来电，别被假声音骗了！')}
  <ol class="steps"><li>接听并选做法</li><li>闯过 6 关</li></ol>
  <div class="grid2"><div class="l5-phone l5-ringing" id="l5-phone"><div class="l5-dots" id="l5-fdots"></div><div class="l5-who">${PHONE}<span id="l5-fwho"></span></div><div class="l5-line" id="l5-fline"></div><div class="row"><span class="l5-ai">情景演示 · AI 合成</span><button class="btn ghost sm" type="button" id="l5-fre" hidden>再听一遍</button></div></div>
   <div class="l5-col"><div class="go-row">${App.go('l5-fgo','接听')}</div><div id="l5-fb3"></div><div id="l5-fopts"></div></div></div>
  <details class="more"><summary>说明</summary><p class="note">6 个来电都是 AI 合成的情景演示，真实的诈骗语音也可能这么像。第一次的选择会记入你的记录。点上面的圆圈数字，可以回到任何一个来电再看一遍。</p>${App.know('核实来源的五个办法','① 挂断电话后，用自己存的号码回拨本人；② 问一个只有家人或好朋友才知道的问题；③ 要钱、要验证码、要密码，一律先告诉家长和老师；④ 不点陌生链接、不填个人信息、不转账；⑤ 来源不明的录音不转发、不传播。记住：声音像，不等于就是本人。')}</details>
 </div>

 <div class="station" id="l5-s4">${App.head('EXP-04','综合运用 · 三条原则','声音使用公约','加一条你的约定，签名让公约生效')}
  <ol class="steps"><li>加一条约定</li><li>签名盖章</li></ol>
  <div class="grid2"><div id="l5-pact"></div>
   <div class="l5-col">${App.knobs([['点一条',App.seg('own',OWN.map((t,i)=>[i,t]),'')],['或自己写',`<input type="text" class="l5-own" id="l5-own" maxlength="40" aria-label="我自己补充的一条约定">`]],'我的约定')}
    <div class="go-row">${App.go('l5-sign','签名盖章')}</div><div id="l5-fb4"></div>
    <div class="after-run">${App.pad('如果我的声音被模仿了，我会……',`<textarea id="l5-ifc" placeholder="先……，再……" aria-label="如果我的声音被模仿了"></textarea>`)}</div></div></div>
  <details class="more"><summary>说明</summary><p class="note">每个人的声音都是独一无二的，承载着个人的身份和尊严，不容侵犯。签名用的是你登录时的昵称。</p>${App.know('防止滥用的三条原则','AI 语音合成技术已经应用于有声读物、智能客服、辅助通信、影视配音等多个方面。为了防止技术被滥用，我们需要做到：第一，尊重他人，未经允许绝不使用或制作他人的语音；第二，保持警惕，听到重要的语音信息要核实其来源；第三，了解相关法律法规，知道伪造他人语音是不道德、不合法的行为。')}</details>
 </div>

 <div class="station" id="l5-quizst">${App.head('QUIZ','反思与总结','小测验','5 道题，第一次作答计入能力图谱')}<div id="l5-quiz"></div></div>
 <div class="station" id="l5-diary"></div>`;
 if(!App.rec)return;wire();wired=true;if(App.current===K)L.onShow();
};

const QUIZ=[
 {id:'q1',q:'AI 是怎样把一段文字读出来的？',opts:['把提前录好的每一句话直接播放出来','学习语音特征后，把文字拆成音节，再按指定音色组合对应的语音特征发音','把文字先翻译成英文再读'],a:1,why:'AI 记录了每种音色的语音特征，按指定音色把它们组合起来发音。'},
 {id:'q2',q:'语音克隆时，AI 从你的录音里学到的是什么？',opts:['你声音的特征，比如音高、语速、音色','你录音里说的那几句话的意思','你的长相和名字'],a:0,why:'克隆学习的是声音特征，学会后就能用这些特征读任何新文字。'},
 {id:'q3',q:'为什么 AI 合成的语音听起来还是和真人有区别？',opts:['因为喇叭的音质不够好','因为 AI 不认识汉字','独属于人类语音的抑扬顿挫和语气转折，依然难以被模仿'],a:2,why:'真人的语调会随情绪和意思起伏，AI 学到的往往是“平均”的特征。'},
 {id:'q4',q:'陌生号码打来电话，声音很像爸爸，让你马上转账，最好的做法是？',opts:['声音一样就是爸爸，赶紧转','挂断后，用家里存的号码打给爸爸本人核实，并告诉家人','把收到的验证码发给他'],a:1,why:'声音像不等于是本人，要用可靠的渠道核实来源。'},
 {id:'q5',q:'防止 AI 语音合成技术被滥用，我们要坚持哪三条原则？',opts:['尊重他人、保持警惕（核实来源）、知法守法','多用、快用、随便用','只要不被别人发现就可以'],a:0,why:'尊重他人，未经允许不使用或制作他人语音；听到重要语音信息要核实来源；伪造他人语音不道德、不合法。'}];

/* ================= wiring ================= */
function wire(){const lr=App.lesson(K);
 lr.s1=lr.s1||{};const S1=lr.s1;S1.tried=S1.tried||[];S1.obs=S1.obs||{};S1.scenes=S1.scenes||{};S1.pairs=S1.pairs||[];S1.hits=S1.hits||{};
 lr.s2=lr.s2||{};const S2=lr.s2;S2.texts=S2.texts||[];S2.flaws=S2.flaws||[];
 lr.talk=lr.talk||{};lr.fraud=lr.fraud||{};lr.pact=lr.pact||{};
 const s1=$('#l5-s1'),s1b=$('#l5-s1b'),s1c=$('#l5-s1c'),s2=$('#l5-s2'),s2b=$('#l5-s2b'),talk=$('#l5-talk'),s3=$('#l5-s3'),s4=$('#l5-s4');
 const nick=(App.student&&App.student.name)||'同学';
 loadVoices();

 /* ---------- 实验 1 · 配音工作台 ---------- */
 const texts=[...QUICK.map(q=>q[0]),`大家好，我是${nick}。`];let ti=0,vc='nav',cur1=null,prev1=null,curB=null,pv1=null;
 const cust=Object.assign({f0:200,rate:4,gap:0,flat:false},S1.custom||{});if(![0,1,3].includes(cust.gap))cust.gap=0;
 const specOf=id=>id==='custom'?Object.assign({id:'custom',n:'自定义音色',sc:'我设计的音色',gpt:cust.f0<170?'echo':'alloy',style:''},cust):VOICES.find(v=>v.id===id)||VOICES[0];
 const make=(id,text,seed)=>{const sp=specOf(id);const sig=sigFor(text,sp,seed);return {id:sp.id,n:sp.n,text,sig,feat:measure(Speech.asBuffer(sig),text)};};
 /* yellow = the voice chosen right now (drawn the moment a chip is tapped); blue = the last one that was actually played and is different */
 const same1=(a,b)=>a&&b&&a.id===b.id&&a.text===b.text;
 const draw1=()=>{$('#l5-say1').textContent=texts[ti];const now=pv1||cur1;if(!now)return;const old=[cur1,prev1].find(x=>x&&!same1(x,now))||null;
  Speech.drawWave($('#l5-w1'),Speech.asBuffer(now.sig),{color:'#ffd43b'});
  Speech.drawPitch($('#l5-p1'),[...(old?[{pitch:old.feat.pitch,color:'#4cc9f0'}]:[]),{pitch:now.feat.pitch,color:'#ffd43b'}],{lo:50,hi:450});
  $('#l5-lg1').textContent=(same1(now,cur1)?'这一次：':'现在选的：')+(VSHORT[now.id]||now.n);$('#l5-lg0w').hidden=!old;if(old)$('#l5-lg0').textContent='上一次听的：'+(VSHORT[old.id]||old.n);};
 const preview1=()=>{try{pv1=make(vc,texts[ti],3);draw1();}catch(e){console.warn(e);}};
 const marks1=()=>{if(S1.tts)App.markStep(s1,0);if(S1.tried.length>=3)App.markStep(s1,1);};
 App.segWire(s1,'txt',v=>{ti=+v;preview1();drawB();});
 App.segWire(s1,'vc',v=>{vc=v;preview1();});
 $('#l5-go1').onclick=async()=>{const b=$('#l5-go1');App.busy(b,true,'AI 正在配音…');App.aiSay('#l5-ai1','正在把文字拆成音节，再组合这种音色的特征……',{busy:true});
  try{await tick();const sp=specOf(vc),text=texts[ti];const now=pv1&&pv1.id===sp.id&&pv1.text===text?pv1:make(vc,text,3);if(cur1&&(cur1.id!==now.id||cur1.text!==text))prev1=cur1;cur1=now;pv1=now;draw1();
   const r=await voicePlay(text,sp);
   S1.tts=(S1.tts||0)+1;const isNew=!S1.tried.includes(sp.id);if(isNew)S1.tried.push(sp.id);S1.text=text.slice(0,40);
   if(prev1&&prev1.text===text&&prev1.id!==sp.id){const key=[prev1.id,sp.id].sort().join('|');if(!S1.pairs.includes(key)){S1.pairs.push(key);if(S1.pairs.length>12)S1.pairs.shift();}}
   App.aiSay('#l5-ai1',`<div class="big">${esc(sp.n)}</div><p class="note">${esc(sp.sc)} <span class="l5-ai">AI 合成</span></p>${sylHTML(text)}${featHTML(sp)}`,{mood:'happy',src:r.src});
   const n=S1.tried.length;App.touch();marks1();
   const mute=r.h?'':'这台设备没有声音，先看曲线。';
   if(n>=3)App.fb('#l5-fb1','ok','集齐 3 种音色！',mute+(sp.flat?'机械声音每个字一个调，曲线是一段段平线。和别的音色比一比。':'看音高曲线：黄点和蓝点，哪种更高、哪种更平？'),{stars:3});
   else App.fb('#l5-fb1','find',`${esc(VSHORT[sp.id]||sp.n)}配好了！`,`${mute}已听过 ${n} 种。句子不变，点另一种音色，曲线马上跟着变。集齐 3 种。`,{stars:n});
  }catch(e){console.warn(e);App.aiSay('#l5-ai1','这次没配成，再按一次。',{mood:'oops'});App.fb('#l5-fb1','try','没配成，再试一次','');}
  App.busy(b,false);b.classList.add('again');};
 const diff=()=>{const o=S1.obs,box=$('#l5-diff');box.innerHTML=DIFF.map(([k,t])=>`<button class="chip ${(o.diff||[]).includes(k)?'on':''}" type="button" data-diff="${k}">${t}</button>`).join('');
  $$('[data-diff]',box).forEach(b=>b.onclick=()=>{const k=b.dataset.diff;let d=o.diff||[];d=d.includes(k)?d.filter(x=>x!==k):[...d,k];if(k==='same'&&d.includes('same'))d=['same'];else d=d.filter(x=>x!=='same'||k==='same');o.diff=d;App.touch();diff();});};
 diff();marks1();
 const keep=w=>{if(!w){App.toast('先按大按钮听一听，再存为作品');return;}const sp=specOf(w.id);
  S1.work={v:sp.id,t:w.text.slice(0,40),c:sp.id==='custom'?{f0:cust.f0,rate:cust.rate,gap:cust.gap,flat:!!cust.flat}:undefined};App.touch();App.toast(`已存为我的配音作品：${sp.n}`);};
 $('[data-keep="1"]',s1).onclick=()=>keep(cur1);

 /* ---------- 实验 1 · 续：我来设计音色 ---------- */
 let tg='old',bt=0;
 $('#l5-cf0').value=cust.f0;$('#l5-cf0-o').textContent=cust.f0+' Hz';$('#l5-crt').value=cust.rate;$('#l5-crt-o').textContent=cust.rate;
 $$('[data-seg="gp"] .chip',s1b).forEach(b=>b.classList.toggle('on',+b.dataset.v===cust.gap));$$('[data-seg="fl"] .chip',s1b).forEach(b=>b.classList.toggle('on',(b.dataset.v==='1')===!!cust.flat));
 function drawB(){const el=$('#l5-say1b');if(!el)return;el.textContent=texts[ti];curB=make('custom',texts[ti],5);Speech.drawWave($('#l5-wb'),Speech.asBuffer(curB.sig),{color:'#ffd43b'});Speech.drawPitch($('#l5-pb'),[{pitch:curB.feat.pitch,color:'#ffd43b'}],{lo:50,hi:450});}
 const soonB=()=>{clearTimeout(bt);bt=setTimeout(()=>{drawB();S1.custom=Object.assign({},cust);App.touch();},160);};
 /* two lights on the screen follow the sliders: the student sees at once which feature is still off */
 const goal=()=>{const T=TG[tg];$('#l5-goal').innerHTML=`<span>目标：${T[0]}</span>`+T[1].map(x=>{const ok=x[1](cust);return `<i class="${ok?'ok':''}">${ok?'✓ ':''}${x[0]}</i>`;}).join('');
  $$('[data-seg="tg"] .chip',s1b).forEach(b=>{b.textContent=TG[b.dataset.v][0]+(S1.hits[b.dataset.v]?' ✓':'');});};
 App.segWire(s1b,'tg',v=>{tg=v;goal();});
 App.rangeWire('l5-cf0',v=>{cust.f0=v;goal();soonB();});App.rangeWire('l5-crt',v=>{cust.rate=v;goal();soonB();});
 App.segWire(s1b,'gp',v=>{cust.gap=+v;goal();soonB();});App.segWire(s1b,'fl',v=>{cust.flat=v==='1';goal();soonB();});
 tg=Object.keys(TG).find(k=>!S1.hits[k])||'old';$$('[data-seg="tg"] .chip',s1b).forEach(b=>b.classList.toggle('on',b.dataset.v===tg));goal();
 const marksB=()=>{const n=Object.keys(S1.hits).length;if(n>=1)App.markStep(s1b,0);if(n>=3)App.markStep(s1b,1);};marksB();
 $('#l5-gob').onclick=async()=>{const b=$('#l5-gob');App.busy(b,true,'AI 正在配音…');App.aiSay('#l5-aib','正在按你调的特征发音……',{busy:true});
  try{await tick();clearTimeout(bt);drawB();const sp=specOf('custom');const r=await voicePlay(curB.text,sp);
   S1.tts=(S1.tts||0)+1;if(!S1.tried.includes('custom'))S1.tried.push('custom');S1.custom=Object.assign({},cust);
   const T=TG[tg],hit=tgHit(tg,cust);if(hit)S1.hits[tg]=1;const n=Object.keys(S1.hits).length;App.touch();marksB();marks1();goal();
   const HW={高:'高高的',中:'不高不低',低:'低低的'}[hiWord(cust.f0)],SW={快:'快快的',中:'不快不慢',慢:'慢慢的'}[spWord(cust.rate)];
   App.aiSay('#l5-aib',`<div class="big">声音${HW}，说得${SW}</div>${featHTML(sp)}<p class="note">换一组特征，就换了一种音色。<span class="l5-ai">AI 合成</span></p>`,{mood:hit?'happy':'think',src:r.src});
   const next=Object.keys(TG).find(k=>!S1.hits[k]);
   if(hit)App.fb('#l5-fbb','ok',`调出「${T[0]}」了！`,n>=3?'三个目标全部调出。你已经会用特征设计音色了。随便再调，设计一个自己的音色存起来。':`已调出 ${n}/3 个。在「我要调出」里点「${TG[next][0]}」，接着调。`,{stars:n});
   else{const miss=T[1].find(x=>!x[1](cust));App.fb('#l5-fbb','try',`还不像${T[0]}`,`还差一盏灯「${miss[0]}」：${miss[2]}`,{stars:n});}
  }catch(e){console.warn(e);App.aiSay('#l5-aib','这次没配成，再按一次。',{mood:'oops'});App.fb('#l5-fbb','try','没配成，再试一次','');}
  App.busy(b,false);b.classList.add('again');};
 $('[data-keep="b"]',s1b).onclick=()=>keep(S1.tried.includes('custom')?curB:null);
 L._preview=()=>{if(pv1)draw1();else preview1();drawB();
  if(!recCtl&&!mem.poem)cvHint($('#l5-live'),'按下大按钮，这里出现声音的样子');if(L._cmp)L._cmp();};

 /* ---------- 实验 1 · 续：判一判场合 ---------- */
 const SC=S1.scenes;Object.values(SC).forEach(r=>{['first','last'].forEach(k=>{if(typeof r[k]==='boolean')r[k]=r[k]?0:1;});});
 let si=Math.max(0,SCN.findIndex(s=>!SC[s.id]));if(SCN.every(s=>SC[s.id]))si=SCN.length-1;
 /* r = {first,last: 0 适合 | 1 不适合, ok: 第一次的看法和参考看法一致（只给老师看的统计，不向学生判对错）, why: 理由序号} */
 const scDone=()=>SCN.every(s=>SC[s.id]),scWhy=()=>SCN.filter(s=>SC[s.id]&&SC[s.id].why!=null).length;
 const scStars=()=>{const w=scWhy();return w>=6?3:w>=3?2:w>=1?1:0;};
 const scMarks=()=>{if(scWhy()>=1)App.markStep(s1c,0);if(scDone())App.markStep(s1c,1);};
 const scFb=(s,r)=>{const mine=r.last===0?'适合':'不适合',agree=r.last===(s.ok?0:1);
  if(STRICT[s.id]&&!agree){App.fb('#l5-fbc','try','这一条有底线',esc(s.why)+'再想一想，改一改你的看法。',{});return;}
  if(r.why==null){App.fb('#l5-fbc','find',`你觉得「${mine}」`,'为什么？在卡片上点一条你的理由。',{});return;}
  const done=scDone()&&scWhy()>=6,fit=SCN.filter(x=>SC[x.id]&&SC[x.id].last===0).length;
  const tail=done?`<br>你一共觉得 ${fit} 个适合、${SCN.length-fit} 个不适合。把你的理由说给同桌听。`:(scDone()?'<br>还有场合没点理由：点「上一个」回去补上，拿满 3 颗星。':'');
  if(STRICT[s.id])App.fb('#l5-fbc','ok','对，这是底线',esc(s.why)+tail,{stars:scStars()});
  else App.fb('#l5-fbc',done?'ok':'find',done?'6 个场合都想过了！':(agree?'和参考看法想到一块儿了':'你有自己的看法'),`你的理由：${esc(WHY[r.why])}。<br>参考看法：${esc(s.why)}${agree?'':'这个场合没有标准答案，你的理由也说得通。'}${tail}`,{stars:scStars()});};
 const scDraw=()=>{const s=SCN[si],r=SC[s.id],box=$('#l5-scn'),a=s.ok?0:1;
  box.innerHTML=`<div class="l5-card"><span class="k">第 ${si+1} / ${SCN.length} 个场合</span><div class="t">${esc(s.t)}</div>
   <div class="l5-two">${['适合','不适合'].map((t,j)=>`<button type="button" class="chip big ${r&&r.last===j?'on':''}" data-sc="${j}">${t}</button>`).join('')}</div>
   ${r?`<span class="k">你的理由是？点一条</span><div class="opts">${WHY.map((t,j)=>`<button type="button" class="chip ${r.why===j?'on':''}" data-wy="${j}">${t}</button>`).join('')}</div>`:''}
   <div class="row"><button type="button" class="btn ghost sm" data-prev ${si?'':'hidden'}>上一个</button><button type="button" class="btn sm" data-next ${r&&si<SCN.length-1?'':'hidden'}>下一个场合</button></div></div>`;
  $$('[data-sc]',box).forEach(b=>b.onclick=()=>{const j=+b.dataset.sc;const x=SC[s.id]||(SC[s.id]={first:j,ok:j===a});x.last=j;App.touch();scMarks();scDraw();scFb(s,x);});
  $$('[data-wy]',box).forEach(b=>b.onclick=()=>{const x=SC[s.id];if(!x)return;x.why=+b.dataset.wy;App.touch();scMarks();scDraw();scFb(s,x);});
  const show=()=>{scDraw();const x=SC[SCN[si].id];if(x)scFb(SCN[si],x);else $('#l5-fbc').innerHTML='';};
  $('[data-prev]',box).onclick=()=>{si--;show();};$('[data-next]',box).onclick=()=>{si++;show();};};
 scDraw();scMarks();if(SC[SCN[si].id])scFb(SCN[si],SC[SCN[si].id]);

 /* ---------- 实验 2 · 声音指纹 ---------- */
 const mic=Speech.micSupported();let src=S2.src==='mic'&&mic?'mic':(S2.src||(mic?'mic':'demo'));if(!mic&&src==='mic')src='demo';
 let g2=null,g3=null,ni=0;const recBtn=$('#l5-rec'),cloneBtn=$('#l5-clone');
 $('#l5-poem').innerHTML=POEM.replace(/。/g,'。<br>');
 const gate=()=>{const g=$('#l5-gate');const ok=!!S2.consent;$('#l5-lab').hidden=!ok;$('#l5-lock').hidden=ok;$('#l5-lab2').hidden=!ok;cloneBtn.disabled=!ok;recBtn.disabled=!ok;
  if(ok){g.innerHTML=`<span class="done-badge">✓ 已确认课堂授权：只录自己 · 本机处理 · 不外传</span>`;App.markStep(s2,0);return;}
  g.innerHTML=`<b>开始之前，先确认三件事</b>
   <label><input type="checkbox" data-g="t"> 老师已在课堂上开启本次体验（课堂授权）</label>
   <label><input type="checkbox" data-g="s"> 我只录、只克隆自己的声音，不录别人</label>
   <label><input type="checkbox" data-g="p"> 克隆的声音不下载、不外传、不冒充任何人</label>
   <div class="row"><button class="btn sm" type="button" id="l5-gok" disabled>确认，开始体验</button><span class="note">没有授权？先去做后面的防骗小剧场。</span></div>`;
  const upd=()=>{$('#l5-gok').disabled=!$$('[data-g]',g).every(c=>c.checked);};$$('[data-g]',g).forEach(c=>c.onchange=upd);
  $('#l5-gok').onclick=()=>{S2.consent=Date.now();App.touch();gate();requestAnimationFrame(()=>{try{L._preview&&L._preview();}catch(e){}});};};
 const drawSrc=()=>{$$('[data-seg="src"] .chip',s2).forEach(b=>{b.classList.toggle('on',b.dataset.v===src);if(b.dataset.v==='mic')b.disabled=!mic;});
  if(!recCtl){const t=src==='mic'?'开始朗读':'听同学朗读';recBtn.textContent=t;recBtn.dataset.label=t;}};
 App.segWire(s2,'src',v=>{if(recCtl||(v==='mic'&&!mic)){drawSrc();return;}src=v;S2.src=src;App.touch();drawSrc();});
 App.segWire(s2,'g2',v=>{g2=v;});
 gate();drawSrc();
 const demoPoem=()=>{const sig=Speech.asBuffer(humanSig(POEM,DEMO));mem.poem={sig,raw:null,feat:measure(sig,POEM),src:'demo'};};
 const learned=playSrc=>{const p=mem.poem,f=p.feat;S2.measured=1;S2.src=src;App.touch();App.markStep(s2,1);
  if(!f||!f.meanF0){App.aiSay('#l5-ai2','没测到清晰的音高。',{mood:'oops'});App.fb('#l5-fb2','try','没听清，再读一遍','靠近麦克风，读得响亮一点。也可以换成示例同学的声音。');return;}
  const real=f.meanF0>=200?'hi':'lo',word=real==='hi'?'偏高，比较尖细':'偏低，比较低沉',whose=p.src==='mic'?'你的声音':'示例同学的声音';
  App.aiSay('#l5-ai2',`<div class="big">${whose}：${real==='hi'?'偏高':'偏低'}</div><div class="feat"><span>音高 ${f.meanF0} Hz</span>${f.lowF0&&f.highF0?`<span>最低 ${f.lowF0} · 最高 ${f.highF0} Hz</span>`:''}<span>每秒读 ${fmt(f.rate)} 个字</span><span>读了 ${f.dur} 秒</span></div><canvas class="l5-cv" id="l5-fpc" style="margin-top:8px"></canvas><p class="note">这条曲线就是“声音指纹”：点越高，声音越高。读得有高有低，曲线就上上下下。</p>`,{mood:'happy',src:p.src==='mic'?'你的录音（本机分析）':'示例同学（演示）'});
  requestAnimationFrame(()=>{const c=$('#l5-fpc');if(c)Speech.drawPitch(c,[{pitch:f.pitch,color:'#51e0a8'}],{lo:70,hi:500});});
  App.fb('#l5-fb2',g2&&g2!==real?'find':'ok',`音高 ${f.meanF0} Hz，${word}`,(g2?(g2===real?'你猜对了！':'和你猜的不一样。'):'这次没有先猜。换一个人读，先猜再听，猜对拿 3 颗星。')+'AI 记住了这个声音的音高和语速。去下一站，让它读新句子。',{stars:!g2?1:g2===real?3:2});};
 const fin=async()=>{const ctl=recCtl;if(!ctl)return;stopRec(false);App.busy(recBtn,true,'正在分析…');const r=await ctl.stop();recCtl=null;App.busy(recBtn,false);drawSrc();
  if(!r||!r.buffer||r.dur<0.6){$('#l5-rtime').textContent='';App.fb('#l5-fb2','try','没有录到声音','再按一次大按钮，读完再停。');return;}
  $('#l5-rtime').textContent=`录到 ${r.dur.toFixed(1)} 秒，只在本机分析`;const sig=prepRec(r.buffer);mem.poem={sig,raw:r.buffer,feat:measure(sig,POEM),src:'mic'};mem.clone=mem.ctrl=null;learned();};
 recBtn.onclick=async()=>{if(!S2.consent)return;if(recCtl){fin();return;}
  if(src==='demo'){App.busy(recBtn,true,'同学在读…');App.aiSay('#l5-ai2','正在听，正在测音高和语速……',{busy:true});
   try{await tick();demoPoem();mem.clone=mem.ctrl=null;Speech.drawWave($('#l5-live'),mem.poem.sig,{color:'#51e0a8'});$('#l5-rtime').textContent='示例同学的朗读（演示）';await voicePlay(POEM,{f0:DEMO.f0,rate:DEMO.rate,gap:7,gpt:'coral'});learned();}
   catch(e){console.warn(e);App.fb('#l5-fb2','try','没读成，再试一次','');}
   App.busy(recBtn,false);recBtn.classList.add('again');return;}
  try{recCtl=await Speech.record({maxMs:12000});}catch(e){src='demo';S2.src=src;drawSrc();App.fb('#l5-fb2','try',esc((e&&e.message)||'打不开麦克风'),'已换成示例同学的声音，再按一次大按钮。');return;}
  recBtn.textContent='读完了，停';App.aiSay('#l5-ai2','正在听你朗读……读完按「读完了，停」。',{busy:true});scopeStop=Speech.liveScope($('#l5-live'),recCtl.analyser);const t0=Date.now();
  recTimer=setInterval(()=>{const s=(Date.now()-t0)/1000;$('#l5-rtime').textContent=`录音中 ${s.toFixed(1)} / 12 秒`;if(s>=12.1)fin();},100);};
 $('#l5-porig').onclick=async()=>{const p=mem.poem;if(!p){App.toast('录音已删除，重读一遍就行');return;}if(p.raw)Speech.playBuffer(p.raw);else await voicePlay(POEM,{f0:DEMO.f0,rate:DEMO.rate,gap:7,gpt:'coral'});};
 if(S2.measured)App.markStep(s2,1);

 /* ---------- 实验 2 · 续：克隆找破绽 ---------- */
 const say2=()=>{$('#l5-say2').textContent=NEWS[ni][0];};say2();
 App.segWire(s2b,'nw',v=>{ni=+v;say2();});App.segWire(s2b,'g3',v=>{g3=v;});
 const cloneParams=()=>{const f=mem.poem.feat;return {f0:f.meanF0||220,rate:clamp(f.rate||4,2.5,6),gap:7,gpt:null};};
 const flawN=()=>S2.flaws.filter(x=>x!=='none').length;
 const marks2=()=>{if(S2.clones)App.markStep(s2b,0);if(flawN()>=3)App.markStep(s2b,1);};
 /* who the green curve belongs to: the student's own recording, or the platform's demo classmate (not a real recording) */
 const whoName=()=>mem.poem&&mem.poem.src==='mic'?'你':'示例同学';
 const drawCmp=()=>{const c=mem.clone;$('#l5-pctrl').textContent=mem.poem&&mem.poem.src==='mic'?'听我的朗读':'听示例同学（演示）';
  if(!c){cvHint($('#l5-cmp'),'按「克隆朗读」，这里出现两条曲线');$('#l5-lgo').textContent='真人';return null;}
  const same=mem.ctrl&&mem.ctrl.text===c.text;const base=same?mem.ctrl:mem.poem;$('#l5-lgo').textContent=same?'示例同学（演示 · 同一句话）':`${whoName()}（读古诗）`;
  Speech.drawPitch($('#l5-cmp'),[...(base?[{pitch:base.feat.pitch,color:'#51e0a8'}]:[]),{pitch:c.feat.pitch,color:'#ffd43b'}],{lo:70,hi:500});return base;};
 cloneBtn.onclick=async()=>{if(!S2.consent)return;App.busy(cloneBtn,true,'AI 正在克隆…');App.aiSay('#l5-ai3','正在用学到的音高和语速读这句新的话……',{busy:true});
  try{await tick();let lent=false;if(!mem.poem){demoPoem();lent=true;}const text=NEWS[ni][0],sp=cloneParams();
   const mk=(f0,rate)=>Speech.asBuffer(Speech.synthSpeech(text,{f0,rate:clamp(rate,1.5,8),seed:11,gapEvery:0}));
   let sig=mk(sp.f0,sp.rate),m=measure(sig,text);await tick();if(m&&m.meanF0&&m.rate){sig=mk(sp.f0*sp.f0/m.meanF0,sp.rate*sp.rate/m.rate);m=measure(sig,text);}   // one calibration pass so the clone hits the learned pitch and rate
   mem.clone={sig,feat:m,text};await tick();
   if(mem.poem.src==='demo'){const cs=Speech.asBuffer(humanSig(text,DEMO));mem.ctrl={sig:cs,raw:null,feat:measure(cs,text),text};}else mem.ctrl=null;
   const base=drawCmp();const r=await voicePlay(text,sp);
   S2.clones=(S2.clones||0)+1;const short=text.slice(0,30);if(!S2.texts.includes(short)){S2.texts.push(short);if(S2.texts.length>4)S2.texts.shift();}App.touch();marks2();
   /* the verdict comes from the two curves on the screen this time; with no usable numbers nothing is asserted */
   const rb=rangeOf(base&&base.feat),rc=rangeOf(m),known=!!(rb&&rc),flat=known?rc<rb*0.8:null,who=whoName();
   App.aiSay('#l5-ai3',`<div class="big">${known?`高低起伏：${who} ${rb} Hz · AI ${rc} Hz`:'AI 读完了'}</div><div class="feat"><span>音高 学了</span><span>语速 学了</span><span>起伏 没学</span><span>换气 没学</span><span>情感 没学</span></div><p class="note">${lent?'这里还没有录音，先借用示例同学的声音。':''}起伏 = 声音最高和最低差多少，数字越小读得越平。演示版只学了平均音高和语速。<span class="l5-ai">AI 合成</span></p>`,{mood:flat?'oops':'think',src:r.src});
   const hit=g3&&known?((g3==='flat')===flat?'你猜对了！':'和你猜的不一样。'):'';const hard=ni===1?'难句里有多音字：行、长、乐。听听 AI 读对了吗？':'再点曲线下面的按钮，听听停顿和换气。';
   const st={stars:Math.max(1,Math.min(3,flawN()))},rec='把你发现的破绽点进「我的记录」。';
   if(!known)App.fb('#l5-fb3b','find','AI 读完了，像不像？',`${hard}${rec}`,st);
   else if(flat)App.fb('#l5-fb3b','oops','抓到破绽：AI 的曲线更平！',`${hit}看曲线：黄点（AI）的起伏只有 ${rc} Hz，绿点（${who}）有 ${rb} Hz。${hard}${rec}`,st);
   else App.fb('#l5-fb3b','find','这次起伏差不多，再找细节',`${hit}黄点（AI）起伏 ${rc} Hz，绿点（${who}）${rb} Hz。${hard}${rec}`,st);
  }catch(e){console.warn(e);App.aiSay('#l5-ai3','这次没读成，再按一次。',{mood:'oops'});App.fb('#l5-fb3b','try','没读成，再试一次','');}
  App.busy(cloneBtn,false);cloneBtn.disabled=!S2.consent;cloneBtn.classList.add('again');};
 const flaws=()=>{const box=$('#l5-flaws');box.innerHTML=FLAWS.map(([k,t])=>`<button class="chip ${S2.flaws.includes(k)?'on':''}" type="button" data-fl="${k}">${t}</button>`).join('');
  $$('[data-fl]',box).forEach(b=>b.onclick=()=>{const k=b.dataset.fl;const before=flawN();let f=S2.flaws.includes(k)?S2.flaws.filter(x=>x!==k):[...S2.flaws,k];f=k==='none'&&f.includes('none')?['none']:f.filter(x=>x!=='none'||k==='none');S2.flaws.length=0;f.forEach(x=>S2.flaws.push(x));App.touch();flaws();marks2();
   const n=flawN();if(n>=3&&before<3)App.fb('#l5-fb3b','ok','3 个破绽到手！','AI 学的是“平均”的声音。记住：声音像，不等于就是本人。',{stars:3});
   else if(S2.flaws.includes('none'))App.fb('#l5-fb3b','try','再听一遍，找找看','句尾降下来了吗？句子中间有换气声吗？',{});
   else if(n)App.star(s2b,Math.min(3,n));});};
 flaws();marks2();
 $('#l5-pclone').onclick=async()=>{const c=mem.clone;if(!c){App.toast('先按「克隆朗读」');return;}await voicePlay(c.text,cloneParams());};
 $('#l5-pctrl').onclick=async()=>{const p=mem.poem;if(!p){App.toast('先按「克隆朗读」');return;}if(p.raw)Speech.playBuffer(p.raw);else await voicePlay(mem.ctrl?mem.ctrl.text:POEM,{f0:DEMO.f0,rate:DEMO.rate,gap:7,gpt:'coral'});};
 afterHide=()=>{stopRec(true);drawSrc();$('#l5-rtime').textContent='';const c=$('#l5-live');c.getContext('2d').clearRect(0,0,c.width,c.height);
  if(!mem.poem)waitAI('#l5-ai2',S2.measured?'上次的录音已删除。重读一遍，指纹就回来了。':'读完后，声音指纹出现在这里');
  if(!mem.clone){waitAI('#l5-ai3','AI 没听过这句话。它能读出来吗？');}drawCmp();};
 L._cmp=drawCmp;

 /* ---------- 讨论 · 如果被模仿的是你 ---------- */
 const T=lr.talk;T.feel=T.feel||[];T.act=T.act||[];
 const TQS=[['feel','你会有什么感受？（可多选）',FEEL],['act','你会怎么做？（可多选）',ACT]];let tq=T.act.length?2:0;
 const tStars=()=>{const good=T.act.filter(x=>x!=='不理它').length;return !good?1:(T.a2||'').trim().length>=6?3:good>=2?2:1;};
 const tfb=()=>{const good=T.act.filter(x=>x!=='不理它');App.markStep(talk,0);
  if(!good.length)App.fb('#l5-fbt','try','不理它，假声音还在骗人','更好的做法：告诉家长和老师、保留证据、向平台举报。点「重新选」再想想。',{stars:1});
  else App.fb('#l5-fbt','ok','做得对，声音是你的！',`你选了：${good.map(esc).join('、')}。未经同意模仿别人的声音，是不尊重人的行为。${(T.a2||'').trim().length>=6?'':'<br>在下面写一种后果，拿满 3 颗星。'}`,{stars:tStars()});};
 const tdraw=()=>{const box=$('#l5-tq');if(tq>=2){box.innerHTML='';return;}const [key,ask,list]=TQS[tq];
  box.innerHTML=App.pad(ask,`<div class="opts">${list.map((t,j)=>`<button class="chip ${T[key].includes(t)?'on':''}" type="button" data-j="${j}">${t}</button>`).join('')}</div><div class="row"><button class="btn sm" type="button" data-ok>选好了</button></div>`,`第 ${tq+1} / 2 问`);
  $$('[data-j]',box).forEach(b=>b.onclick=()=>{const t=list[+b.dataset.j];T[key]=T[key].includes(t)?T[key].filter(x=>x!==t):[...T[key],t];b.classList.toggle('on');App.touch();});
  $('[data-ok]',box).onclick=()=>{if(!T[key].length){App.toast('先点一个');return;}tq++;tdraw();if(tq>=2)tfb();};};
 tdraw();if(tq>=2)tfb();
 $('#l5-tre').onclick=()=>{tq=0;talk.classList.remove('ran');$('#l5-fbt').innerHTML='';tdraw();};
 const a2=$('#l5-a2');a2.value=T.a2||'';let tt;const a2ok=()=>{if((T.a2||'').trim().length>=6){App.markStep(talk,1);App.star(talk,tStars());}};a2ok();
 a2.oninput=()=>{T.a2=a2.value;clearTimeout(tt);tt=setTimeout(()=>{App.touch();a2ok();},700);};

 /* ---------- 实验 3 · 防骗小剧场 ---------- */
 const F=lr.fraud;let cur=Math.max(0,FRAUD.findIndex(f=>!F[f.id])),picked=false;const fgo=$('#l5-fgo');
 const fAll=()=>FRAUD.every(f=>F[f.id]),fOk=()=>FRAUD.filter(f=>F[f.id]&&F[f.id].ok).length;
 const fmarks=()=>{if(FRAUD.some(f=>F[f.id]))App.markStep(s3,0);if(fAll())App.markStep(s3,1);};
 const flabel=t=>{fgo.textContent=t;fgo.dataset.label=t;};
 const fdraw=()=>{const f=FRAUD[cur],r=F[f.id];const open=picked||!!r;
  $('#l5-fdots').innerHTML=FRAUD.map((x,i)=>{const s=F[x.id];return `<button type="button" class="${i===cur?'cur ':''}${s?(s.last===x.a?'ok':'no'):''}" data-fd="${i}" aria-label="第 ${i+1} 个来电">${i+1}</button>`;}).join('')+`<span>第 ${cur+1} / 6 个来电</span>`;
  $$('[data-fd]',s3).forEach(b=>b.onclick=()=>{cur=+b.dataset.fd;picked=false;fdraw();const g=FRAUD[cur];if(F[g.id])ffb(g,F[g.id]);else $('#l5-fb3').innerHTML='';});
  $('#l5-phone').classList.toggle('l5-ringing',!open);$('#l5-fwho').textContent=f.who;$('#l5-fline').textContent=open?f.line:'铃铃铃……接起来听听？';
  $('#l5-fre').hidden=!open;
  /* while the options are waiting, the options are the only next action: the big button steps aside */
  flabel(r?(fAll()?'再看下一个':'下一个来电'):'接听');fgo.hidden=open&&!r;
  $('#l5-fopts').innerHTML=open?App.pad('你会怎么做？',`<div class="l5-opts">${f.opts.map((o,j)=>`<button class="chip big ${r&&r.last===j?(j===f.a?'right':'wrong'):''}" type="button" data-fo="${j}">${String.fromCharCode(65+j)}. ${esc(o)}</button>`).join('')}</div><p class="note">记住：声音像，不等于就是本人。</p>`,'我的选择'):'';
  $$('[data-fo]',s3).forEach(b=>b.onclick=()=>{const j=+b.dataset.fo;const x=F[f.id]||(F[f.id]={first:j,ok:j===f.a});x.last=j;App.touch();fmarks();fdraw();ffb(f,x);});};
 const ffb=(f,x)=>{const right=x.last===f.a,k=fOk();const st=fAll()?{stars:k>=6?3:k>=4?2:1}:{};
  App.fb('#l5-fb3',right?'ok':'try',fAll()?`6 关闯完，第一次识破 ${k} 个`:(right?'识破了！':'这样做有风险！'),`${esc(f.why)}<br>核实办法：<span style="font-weight:700">${esc(f.tool)}</span>`,st);};
 const listen=f=>voicePlay(f.line.replace(/（[^）]*）/g,''),Object.assign({gap:7},f.sp)).catch(()=>{});
 fgo.onclick=()=>{const f=FRAUD[cur],r=F[f.id];
  if(r){let n=FRAUD.findIndex((x,i)=>i>cur&&!F[x.id]);if(n<0)n=FRAUD.findIndex(x=>!F[x.id]);if(n<0)n=(cur+1)%FRAUD.length;cur=n;picked=false;fdraw();
   const g=FRAUD[cur];if(F[g.id])ffb(g,F[g.id]);else App.fb('#l5-fb3','find','新的来电！','先按「接听」，听听对方说什么。');return;}
  picked=true;fdraw();listen(f);App.fb('#l5-fb3','find','这个声音能信吗？','声音很像，先别急。在下面选出你的做法。');};
 $('#l5-fre').onclick=()=>listen(FRAUD[cur]);
 fdraw();fmarks();if(F[FRAUD[cur].id])ffb(FRAUD[cur],F[FRAUD[cur].id]);

 /* ---------- 实验 4 · 声音使用公约 ---------- */
 const P=lr.pact;P.p=P.p||[0,0,0];const own=$('#l5-own'),ifc=$('#l5-ifc');own.value=P.own||OWN[0];ifc.value=P.ifc||'';
 const pact=()=>{const box=$('#l5-pact');const d=P.signed?new Date(P.signed):null;const mine=own.value.trim();
  box.innerHTML=`<div class="l5-pact"><h3>声音使用公约</h3><ol>${PRIN.map(([t,dd])=>`<li><b>${t}</b>：${dd}</li>`).join('')}<li class="mine"><b>我的约定</b>：${esc(mine||'（等你来写）')}</li></ol>
   ${(P.ifc||'').trim()?`<p class="ifc">如果我的声音被模仿了：${esc(P.ifc.trim())}</p>`:''}
   <div class="sg">${P.signed?`签名<b>${esc(P.name||'')}</b>${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日`:'还没有签名'}</div>${P.signed?'<div class="l5-seal">公约<br>生效</div>':''}</div>`;};
 const segOwn=()=>$$('[data-seg="own"] .chip',s4).forEach(b=>b.classList.toggle('on',OWN[+b.dataset.v]===own.value.trim()));
 let ownTouched=!!P.own;
 const pmarks=()=>{if(ownTouched&&own.value.trim().length>=6)App.markStep(s4,0);if(P.signed)App.markStep(s4,1);};
 App.segWire(s4,'own',v=>{own.value=OWN[+v];ownTouched=true;pact();pmarks();});
 own.oninput=()=>{ownTouched=true;segOwn();pact();pmarks();};
 const signFb=()=>{const mine=!OWN.includes((P.own||'').trim());
  App.fb('#l5-fb4','ok','公约生效！',mine?'这一条是你自己写的约定，已放进作品墙。':'已放进作品墙。自己写一条约定再签一次，拿 3 颗星。',{stars:mine?3:2});};
 $('#l5-sign').onclick=()=>{const t=own.value.trim();if(t.length<6){App.fb('#l5-fb4','try','约定太短了','至少写 6 个字，或者点一条现成的。');return;}
  P.p=[1,1,1];P.own=t;P.name=nick;P.signed=Date.now();ownTouched=true;App.touch();pact();pmarks();signFb();$('#l5-sign').classList.add('again');};
 let pt2;ifc.oninput=()=>{P.ifc=ifc.value;clearTimeout(pt2);pt2=setTimeout(()=>{App.touch();pact();},600);};
 segOwn();pact();pmarks();if(P.signed)signFb();

 /* ---------- quiz & diary ---------- */
 App.quiz($('#l5-quiz'),K,QUIZ);
 const rd=App.diary($('#l5-diary'),K,{title:L.diaryTitle,lead:'用你的作品和发现来回答',
  fields:[{id:'help',q:'AI 语音合成技术能给我们带来哪些帮助？',ph:'比如在……的时候，AI 合成的语音可以……'},{id:'real',q:'你认为如何才能使 AI 合成的语音更像真人的语音？（结合你找到的破绽）',ph:'我发现 AI……，如果它能……就更像真人'},
   {id:'future',q:'请你畅想一下：未来 AI 语音合成技术会有什么新发展？',ph:'将来也许……'},{id:'rules',q:'如何防止 AI 语音合成技术被滥用？我们需要坚持并遵守哪些原则？',ph:'第一……第二……第三……'}],
  pledge:'我只录自己的声音；未经允许，不使用、不制作他人的语音；分享 AI 合成的声音时，标明“AI 合成”。',
  extras:ex=>{const l=App.lesson(K),s=l.s1||{},c=l.s2||{},f=l.fraud||{},p=l.pact||{};const w=s.work;const wsp=w?(w.v==='custom'?Object.assign({n:'自定义音色',gpt:'alloy'},w.c||{}):VOICES.find(v=>v.id===w.v)):null;
   const fn=FRAUD.filter(x=>f[x.id]).length,fk=FRAUD.filter(x=>f[x.id]&&f[x.id].ok).length;
   ex.innerHTML=`<div style="display:flex;flex-direction:column;gap:10px">
    <div><div class="box-t">我的专属配音</div>${wsp?`<div class="verdict"><b>${esc(wsp.n)}</b> <span class="l5-ai">AI 合成</span><br>「${esc(w.t)}」<div class="row" style="margin-top:6px"><button class="btn ghost sm" type="button" id="l5-dplay">再听一次</button></div></div>`:'<p class="note">在配音工作台点「存为我的作品」后显示在这里。</p>'}</div>
    <div><div class="box-t">实验数据</div><div class="meta">合成次数　${s.tts||0}　　试过的音色　${(s.tried||[]).length} 种
调出的目标音色　${Object.keys(s.hits||{}).length}/3　　克隆朗读　${c.clones||0} 次（${(c.texts||[]).length} 句不同的话）
找到的破绽　${(c.flaws||[]).filter(x=>x!=='none').map(k=>(FLAWS.find(z=>z[0]===k)||[,''])[1]).join('、')||'—'}
防骗小剧场　${fn}/6，第一次识破 ${fk}</div></div>
    <div><div class="box-t">声音使用公约</div>${p.signed?`<div class="verdict">已签署 · 我的约定：${esc(p.own||'')}${p.ifc?`<br>如果声音被模仿了：${esc(p.ifc)}`:''}</div>`:'<p class="note">签名盖章后显示。</p>'}</div></div>`;
   const pb=$('#l5-dplay',ex);if(pb)pb.onclick=()=>voicePlay(w.t,wsp);}});
 App.on(()=>{if(App.current===K)rd();});
}

if(!window.__l5rs){window.__l5rs=1;let rt;window.addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>{if(App.current===K&&wired&&L._preview){try{L._preview();}catch(e){console.warn(e);}}},120);});}
L.onShow=()=>{if(!wired)return;loadVoices();requestAnimationFrame(()=>{try{L._preview&&L._preview();if(afterHide)afterHide();}catch(e){console.warn(e);}});};
L.onHide=()=>{stopRec(true);Speech.release();const had=mem.poem||mem.ctrl||mem.clone;mem={poem:null,ctrl:null,clone:null};if(had&&afterHide){try{afterHide();}catch(e){}}};

/* ---------- hooks ---------- */
L.diaryTitle='我的专属配音';
L.diaryQ=[['help','AI 语音合成的帮助'],['real','怎样更像真人'],['future','畅想未来'],['rules','防止滥用的原则']];
const tx=App.txtScore;
const fraudAcc=f=>{const a=FRAUD.filter(x=>f[x.id]);return a.length?Math.round(100*a.filter(x=>f[x.id].ok).length/FRAUD.length):0;};
L.score=lr=>{const s=lr.s1||{},c=lr.s2||{},t=lr.talk||{},f=lr.fraud||{},p=lr.pact||{},D=lr.diary||{},Q=lr.quiz||{};const qs=id=>Q[id]?(Q[id].ok?100:0):0;
 const o=s.obs||{},sc=s.scenes||{},scA=Math.round(100*SCN.filter(x=>sc[x.id]).length/SCN.length);/* 看法题：按“想过几个场合”计，不按是否与参考看法一致 */const obsN=(o.diff||[]).length?1:0;
 const flaws=(c.flaws||[]).filter(x=>x!=='none').length;const tried=(s.tried||[]).length;
 return {principle:Math.round(0.22*qs('q1')+0.22*qs('q2')+0.22*qs('q3')+0.2*tx(D.real)+14*(c.measured?1:0)),
  experiment:Math.round(25*Math.min(1,tried/3)+15*((s.pairs||[]).length?1:0)+15*obsN+20*(c.measured?1:0)+25*Math.min(1,(c.texts||[]).length/2)),
  prompt:null,
  critical:Math.round(35*Math.min(1,flaws/3)+0.3*fraudAcc(f)+0.2*scA+15*Math.min(1,(c.texts||[]).length/2)),
  creative:Math.round(40*(s.work?1:0)+20*((s.tried||[]).includes('custom')?1:0)+0.25*tx(D.future)+15*Math.min(1,tried/5)),
  ethics:Math.round(15*(c.consent?1:0)+25*(p.signed?1:0)+10*((p.own||'').trim().length>=6?1:0)+0.2*fraudAcc(f)+7.5*((t.act||[]).length?1:0)+0.075*tx(t.a2)+0.075*qs('q4')+0.075*qs('q5'))};};
L.progress=lr=>{const s=lr.s1||{},c=lr.s2||{},t=lr.talk||{},f=lr.fraud||{},p=lr.pact||{},o=s.obs||{};
 const m=[(s.tts||0)>=1&&(s.tried||[]).length>=2,(s.tried||[]).includes('custom'),SCN.every(x=>(s.scenes||{})[x.id]),!!c.consent,!!c.measured,(c.clones||0)>=1,(c.flaws||[]).length>0,
  (t.act||[]).length>0&&(t.a2||'').trim().length>=6,FRAUD.every(x=>f[x.id]),!!p.signed,Object.keys(lr.quiz||{}).length>=5,!!(lr.diary||{}).submitted];
 return m.filter(Boolean).length/m.length;};
L.intro={q:'AI 只听你说几句话，就能模仿你的声音说别的话吗？',opts:['能，而且可能很像', '不能，AI 只能用它自己的声音', '只能模仿语气，模仿不了音色'],back:'挑战二会体验声音克隆，并讨论如何防范被冒用。'};
L.flow=[
 {seg:'导入',from:'l5-intro'},
 {seg:'挑战一',kp:'知识点一 · 语音合成',learn:['AI 先学习各种语音特征，再按指定音色组合特征发音','四步：文字→拆音节、定声调→按音色组合特征→声音','换一种音色，就是换一组特征：音高、语速、停顿、音色'],sum:['换音色后，音高曲线跟着变','AI 合成快，但语调较平，难有真人的抑扬顿挫','需要真诚表达的场合不适合用 AI 语音'],from:'l5-s1',to:'l5-s1'},
 {seg:'挑战二',kp:'知识点二 · 语音克隆',learn:['语音克隆是语音合成的一种应用','AI 在会说话的基础上，学一个人的语音特征','能用他的声音读出他没说过的话，必须本人同意'],sum:['只听一首诗，AI 就能用这个声音读新句子','克隆更平、不换气、多音字易错：学的是平均特征','声音像，不等于就是本人'],from:'l5-s2',to:'l5-s2'},
 {seg:'挑战三',kp:'知识点三 · 风险与应对',learn:['恶意利用的后果：诈骗骗钱、伪造造谣、冒充欺骗','声音是身份的一部分，未经同意不能用','核实四步：停、挂断回拨、问暗号、告诉大人'],sum:['受伤害的有被模仿的人，也有被骗的人','危险信号：陌生号码、催促、要钱要验证码、让保密','名人推荐、造谣录音：先核实，不转发'],from:'l5-talk',to:'l5-s3'},
 {seg:'综合运用',from:'l5-s4'},
 {seg:'反思与总结',from:'l5-quizst'}
];
L.quiz=QUIZ;
L.works=lr=>{const s=lr.s1||{},p=lr.pact||{},w=[];
 if(s.work){const v=s.work.v==='custom'?'自定义音色':(VOICES.find(x=>x.id===s.work.v)||{}).n||'';w.push({glyph:'配',t:'我的专属配音',s:`${v}：「${s.work.t}」（AI 合成）`});}
 if(p.signed)w.push({glyph:'约',t:'我的声音使用公约',s:`尊重他人 · 保持警惕 · 知法守法；我的约定：${p.own||''}`});return w;};
L.expCount=lr=>((lr.s1||{}).tts||0)+((lr.s2||{}).clones||0)+((lr.s2||{}).measured?1:0);
L.classPanels=recs=>{const ls=recs.map(r=>(r.lessons||{})[K]||{});const act=ls.filter(l=>L.progress(l)>0);
 const fr=FRAUD.map(f=>{const a=ls.map(l=>(l.fraud||{})[f.id]).filter(Boolean);return {f,n:a.length,rate:a.length?Math.round(100*a.filter(x=>x.ok).length/a.length):null};});
 const fl=FLAWS.filter(x=>x[0]!=='none').map(([k,n])=>({n,c:ls.filter(l=>((l.s2||{}).flaws||[]).includes(k)).length})).sort((a,b)=>b.c-a.c);const mx=Math.max(1,...fl.map(x=>x.c));
 const signed=ls.filter(l=>(l.pact||{}).signed).length,cons=ls.filter(l=>(l.s2||{}).consent).length;const sc=ls.flatMap(l=>Object.values((l.s1||{}).scenes||{}));const scR=sc.length?Math.round(100*sc.filter(x=>x.ok).length/sc.length):null;
 const col=v=>v==null?'var(--line2)':v>=80?'var(--green)':v>=60?'var(--amber)':'var(--red)';
 return `<div class="box"><div class="box-t">L5 · 防骗小剧场：各情景第一次判断正确率</div>${fr.map(x=>`<div class="hbar"><span>${esc(x.f.tag)} <span class="note">${x.n} 人</span></span><span class="tr"><i style="width:${x.rate||0}%;background:${col(x.rate)}"></i></span><span>${x.rate==null?'—':x.rate+'%'}</span></div>`).join('')}
  <p class="note" style="margin-top:6px">“哪些场合适合用 AI 语音”第一次看法与参考看法一致的比例：${scR==null?'—':scR+'%'}（看法题，学生端不判对错，可用来组织讨论）</p></div>
  <div class="box"><div class="box-t">L5 · 学生找到的克隆破绽（人次）与公约</div>${fl.map(x=>`<div class="hbar"><span>${esc(x.n)}</span><span class="tr"><i style="width:${100*x.c/mx}%;background:var(--violet)"></i></span><span>${x.c}</span></div>`).join('')}
  <div class="sep" style="margin:8px 0"></div><div class="hbar"><span>签署声音使用公约</span><span class="tr"><i style="width:${act.length?100*signed/act.length:0}%;background:var(--green)"></i></span><span>${signed}/${act.length}</span></div>
  <div class="hbar"><span>完成克隆体验授权确认</span><span class="tr"><i style="width:${act.length?100*cons/act.length:0}%;background:var(--cyan)"></i></span><span>${cons}/${act.length}</span></div></div>`;};
L.classSug=recs=>{const ls=recs.map(r=>(r.lessons||{})[K]||{});const act=ls.filter(l=>L.progress(l)>0);if(!act.length)return [];const out=[];
 const fr=FRAUD.map(f=>{const a=ls.map(l=>(l.fraud||{})[f.id]).filter(Boolean);return {f,n:a.length,rate:a.length?Math.round(100*a.filter(x=>x.ok).length/a.length):101};}).filter(x=>x.n>=3).sort((a,b)=>a.rate-b.rate);
 if(fr[0]&&fr[0].rate<80)out.push(`第5讲防骗小剧场中「${fr[0].f.tag}」第一次判断正确率只有 ${fr[0].rate}%：建议请两名学生现场演一遍这个情景，再让全班说出核实办法“${fr[0].f.tool}”。`);
 const signed=act.filter(l=>(l.pact||{}).signed).length;
 if(signed/act.length<0.6)out.push(`第5讲只有 ${signed}/${act.length} 名学生签署了“声音使用公约”，建议下课前留 3 分钟完成，并请几位同学读出自己补充的一条约定。`);
 else{const fl=FLAWS.filter(x=>x[0]!=='none').map(([k,n])=>({n,c:ls.filter(l=>((l.s2||{}).flaws||[]).includes(k)).length})).sort((a,b)=>b.c-a.c);
  if(fl[0]&&fl[0].c)out.push(`第5讲学生最常找到的克隆破绽是「${fl[0].n}」（${fl[0].c} 人次）：可以投影一位同学的音高曲线对比图，讲解“人类语音的抑扬顿挫和语气转折难以被模仿”。`);}
 return out.slice(0,2);};
L.demo=(rnd,t)=>{const pick=p=>rnd()<p;const str=n=>'这是示例文字'.repeat(Math.max(0,Math.round(n/6)));const q=(p,a)=>{const ok=pick(p);return {first:ok?a:(a+1)%3,ok,last:a};};
 const ids=VOICES.map(v=>v.id);const nt=Math.min(7,2+Math.floor(rnd()*5*t+rnd()*2));const tried=ids.slice(0,nt);
 const s1={tts:nt+Math.floor(rnd()*6*t),tried,pairs:pick(t+.25)?tried.slice(1,1+Math.max(1,Math.floor(nt/2))).map(x=>['nav',x].sort().join('|')):[],
  obs:pick(t+.3)?{diff:['tone','pause','emo','poly'].filter(()=>pick(.35+t*.4))}:{},hits:Object.fromEntries(['old','kid','robot'].filter(()=>tried.includes('custom')&&pick(.3+t*.6)).map(k=>[k,1])),
  scenes:Object.fromEntries(SCN.filter(()=>pick(.55+t*.4)).map(s=>{const ok=pick(.5+t*.45);const a=s.ok?0:1;return [s.id,{first:ok?a:1-a,ok,last:a}];})),
  work:pick(t+.1)?{v:tried[Math.floor(rnd()*tried.length)],t:'从前，山脚下住着一位老爷爷。'}:undefined};
 const cons=pick(.9);const W={flat:.75,breath:.55,emo:.5,timbre:.45,pause:.35,poly:.15+.35*t,speed:.2};
 const s2=cons?{consent:1,measured:pick(.92)?1:0,src:pick(.3)?'mic':'demo',clones:1+Math.floor(rnd()*4*t),texts:pick(.4+t*.5)?['今天我们学习了AI语音合成',HARD.slice(0,30)]:['今天我们学习了AI语音合成'],
  flaws:Object.keys(W).filter(k=>pick(W[k]*(0.5+t*0.7)))}:{};
 const base={f1:.6,f2:.55,f3:.6,f4:.3,f5:.45,f6:.5};const fraud={};FRAUD.forEach(f=>{if(pick(.6+t*.4)){const ok=pick(base[f.id]+t*.45);fraud[f.id]={first:ok?f.a:(f.a+1)%3,ok,last:f.a};}});
 const pact=pick(t+.2)?{p:[1,1,1],own:str(10+10*t),ifc:str(12+15*t),name:'示例',signed:Date.now()}:{p:[1,pick(.6)?1:0,0]};
 return {s1,s2,talk:{feel:pick(.8)?['生气','担心有人被骗']:[],act:pick(.8)?['告诉家长和老师','向平台举报']:[],a2:str(25*t)},fraud,pact,
  quiz:{q1:q(.5+t*.5,1),q2:q(.45+t*.5,0),q3:q(.4+t*.5,2),q4:q(.65+t*.35,1),q5:q(.6+t*.4,0)},
  diary:{help:str(30*t+10),real:str(30*t),future:str(25*t+5),rules:str(30*t),pledge:pick(.85),submitted:pick(t)?1:0}};};
})();
