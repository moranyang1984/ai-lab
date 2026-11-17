/* AI adapter — interchangeable backends:
   api      : the school platform's own AI endpoints (configured by the teacher)
   claude   : Claude — via the artifact `sample` capability on claude.ai, or the Anthropic API in the desktop app
   gpt / deepseek / kimi / openai_compatible : desktop app only; keys stay in the app's main process
   offline  : preset / procedural results, works without network
   Results carry `mode` for the 来源 label: 'claude' / 'gpt' / 'api' / 'offline', or the display name
   ('DeepSeek 大模型', 'Kimi 大模型', …) for the other providers — AI.srcName(mode) gives a display name for any of them. */
(function(){
const {$,esc,LS}=App;
const AI={cfg:LS.get('ailab.ai',{mode:'auto',base:'',token:''}),backends:{claude:null,gpt:null}};
App.AI=AI;
const DESK=window.desktop&&window.desktop.isDesktop?window.desktop:null;
/* WEB: the page is hosted as a static site and webdesk.js stands in for the desktop app (keys live in this browser) */
const WEB=!!(DESK&&DESK.web);AI.web=WEB;AI.desktop=!!DESK&&!WEB;
/* large-model providers. claude works on claude.ai and in the desktop app; the rest are desktop-only (keys live in the app). */
AI.LLMS=['claude','gpt','deepseek','kimi','openai_compatible'];
AI.DESK_ONLY=['gpt','deepseek','kimi','openai_compatible'];
AI.NAMES={api:'平台 AI 接口',claude:'Claude 大模型',gpt:'GPT 大模型',deepseek:'DeepSeek 大模型',kimi:'Kimi 大模型',openai_compatible:'自定义大模型',offline:'离线演示'};
AI.SHORT={claude:'Claude',gpt:'GPT',deepseek:'DeepSeek',kimi:'Kimi',openai_compatible:'自定义模型'};
/* desktop: a sampler with the same shape as the artifact `sample` capability, backed by the main process */
function deskSampler(provider){
  const toData=b=>typeof b==='string'?Promise.resolve(b):new Promise(r=>{const f=new FileReader();f.onload=()=>r(f.result);f.readAsDataURL(b);});
  const run=async(prompt,o={})=>{const images=await Promise.all((o.images||[]).map(toData));let text='';
    /* images sent to a provider that cannot see (e.g. DeepSeek without a vision model): use another configured provider that can */
    let use=provider;if(images.length&&!AI.canSee(provider)){use=AI.visionFor(provider);if(!use)throw noVision(provider);}
    const res=await DESK.ai.stream({provider:use,prompt,images,tier:o.modelTier||'full'},d=>{text+=d;if(o.onText)o.onText({text});},o.signal);return {text:res.text??text};};
  const f=(p,o)=>run(p,o);
  f.json=async(p,o={})=>{const {text}=await run(p+'\n\n只输出一个 JSON 对象，不要输出其他文字。',o);const m=/\{[\s\S]*\}/.exec(text.replace(/```json|```/g,''));if(!m)throw{code:'bad'};return JSON.parse(m[0]);};
  f.provider=provider;return f;}
AI.backends={};AI.LLMS.forEach(k=>AI.backends[k]=null);
AI.ready={claude:false,gpt:false};
AI.llm=m=>AI.LLMS.includes(m);
AI.order=()=>{const o=((AI.deskInfo||{}).order||[]).filter(k=>AI.llm(k));return [...new Set([...o,...AI.LLMS])];};
Object.defineProperty(AI,'sample',{get(){const m=AI.mode();return AI.llm(m)?AI.backends[m]:null;}});
AI.mode=()=>{const m=AI.cfg.mode,B=AI.backends;if(m==='api'&&AI.cfg.base)return'api';if(AI.llm(m)&&B[m])return m;
  if(m==='auto'){if(AI.cfg.base)return'api';const k=AI.order().find(x=>B[x]);if(k)return k;}return'offline';};
AI.real=()=>AI.mode()!=='offline';
AI.label=()=>{const m=AI.mode();if(m==='openai_compatible'){const v=(AI.deskInfo||{}).openai_compatible||{};if(v.name)return v.name+' 大模型';}return AI.NAMES[m];};
/* the name a result is labelled with (来源：…). Claude / GPT keep their short keys, which lesson modules already map;
   the other providers are labelled with their display name directly. */
AI.srcKey=m=>(m==='claude'||m==='gpt'||m==='api'||m==='offline')?m:(m==='openai_compatible'&&((AI.deskInfo||{}).openai_compatible||{}).name?((AI.deskInfo||{}).openai_compatible.name+' 大模型'):(AI.NAMES[m]||m));
AI.srcName=m=>AI.NAMES[m]||m;
/* can this provider look at images? (DeepSeek's main model cannot; the app then uses its vision model or another provider) */
AI.canSee=m=>{if(!AI.llm(m)||!AI.backends[m])return false;if(!DESK)return true;return !!((AI.deskInfo||{})[m]||{}).canSee;};
/* the sampler for an image task: the current provider if it can see, else the first other configured provider that can */
AI.visionFor=m=>{if(AI.canSee(m))return m;const alt=AI.order().find(k=>k!==m&&AI.canSee(k));return alt||null;};
function noVision(m){return {code:'no_vision',message:`${AI.SHORT[m]||AI.label()} 不能看图片，也没有其他能看图的大模型可用`};}
AI.paint=()=>{const p=$('#modePill');if(!p)return;const m=AI.mode();p.textContent=AI.label();p.className='mode-pill'+(AI.llm(m)?' real':m==='api'?' api':'');try{window.dispatchEvent(new Event('ai-mode'));}catch(e){}};
AI.refreshDesk=async()=>{if(!DESK)return;try{const s=await DESK.settings.get();AI.LLMS.forEach(k=>{AI.backends[k]=s[k]&&s[k].hasKey?deskSampler(k):null;});AI.deskInfo=s;
    /* a mode preset by the teacher / IT in ai-config.json wins once, until the teacher changes it here */
    if(s.mode&&s.modeStamp&&s.modeStamp!==LS.get('ailab.ai.stamp',0)){AI.cfg.mode=s.mode;LS.set('ailab.ai.stamp',s.modeStamp);LS.set('ailab.ai',AI.cfg);}
  }catch(e){}AI.paint();};
AI.init=function(){AI.paint();$('#modePill').onclick=AI.settings;
  if(DESK){AI.refreshDesk();if(DESK.settings.onChanged)DESK.settings.onChanged(()=>AI.refreshDesk());return;}
  if(window.claude&&claude.use){claude.use('sample').then(s=>{if(s){AI.backends.claude=s;AI.paint();}}).catch(()=>{});}};
AI.save=()=>{LS.set('ailab.ai',AI.cfg);AI.paint();};
/* desktop: API keys live in the app (encrypted on disk), never in the page's storage */
const PROV={
 claude:{n:'Claude（Anthropic）',key:'sk-ant-…',base:'https://api.anthropic.com',where:'console.anthropic.com'},
 gpt:{n:'GPT（OpenAI）',key:'sk-…',base:'https://api.openai.com/v1',where:'platform.openai.com'},
 deepseek:{n:'DeepSeek（深度求索）',key:'sk-…',base:'https://api.deepseek.com',where:'platform.deepseek.com',vis:'留空 = 不看图（图片任务改用其他大模型或离线演示）'},
 kimi:{n:'Kimi（月之暗面 Moonshot）',key:'sk-…',base:'https://api.moonshot.cn/v1',where:'platform.moonshot.cn（platform.kimi.com）'},
 openai_compatible:{n:'自定义（兼容 OpenAI 接口）',key:'服务商提供的密钥',base:'https://…/v1',where:'填写服务商给的接口地址和模型名，例如通义千问、智谱、豆包等',custom:1,vis:'留空 = 不看图；能看图时填看图模型名'}};
AI.PROV=PROV;
function deskBoxes(){const s=AI.deskInfo||{};const cur=AI.cfg.mode;return Object.entries(PROV).filter(([k])=>!(WEB&&k==='claude')).map(([k,P])=>{const v=s[k]||{};const open=v.hasKey||cur===k;return `<details class="box dk-box" ${open?'open':''}><summary class="row" style="cursor:pointer;justify-content:space-between;list-style:none"><b style="font-size:14.5px">${P.n}</b><span>${v.hasKey?`<span class="pill ok">已配置${v.keyFrom==='env'?(WEB?'（配置文件）':'（环境变量）'):''}</span>`:'<span class="pill warn">未填写密钥</span>'}</span></summary>
   <div style="display:flex;flex-direction:column;gap:10px;margin-top:10px">
   <label class="f" for="dk-${k}-key">API 密钥 ${v.hasKey?`<span class="note">${WEB?'已保存在这台设备的浏览器里':'已加密保存在本机'}，留空则不修改</span>`:''}<input type="password" autocomplete="off" id="dk-${k}-key" value="" placeholder="${v.hasKey?'••••••••（已保存）':P.key}"></label>
   ${P.custom?`<label class="f" for="dk-${k}-name">显示名称（来源标签里显示）<input type="text" id="dk-${k}-name" value="${esc(v.name||'')}" placeholder="例如：通义千问"></label>`:''}
   <label class="f" for="dk-${k}-base">接口地址<input type="text" id="dk-${k}-base" value="${esc(v.base||P.base)}" placeholder="${P.base}"></label>
   <div class="grid3"><label class="f" for="dk-${k}-model">主模型（写作、作画）<input type="text" id="dk-${k}-model" value="${esc(v.model||'')}"></label>
   <label class="f" for="dk-${k}-quick">快速模型<input type="text" id="dk-${k}-quick" value="${esc(v.quick||'')}"></label>
   <label class="f" for="dk-${k}-vision">看图模型<input type="text" id="dk-${k}-vision" value="${esc(v.vision||'')}" placeholder="${k==='claude'||k==='gpt'?'留空 = 用主模型 / 快速模型':'留空 = 不看图'}"></label></div>
   ${P.vis?`<p class="note">看图：${P.vis}</p>`:''}
   <div class="row"><button class="btn ghost sm" type="button" data-dktest="${k}">测试</button>${v.hasKey&&v.keyFrom!=='env'?`<button class="btn ghost sm" type="button" data-dkclear="${k}">删除密钥</button>`:''}<span class="note" id="dk-${k}-res">密钥获取：${P.where}</span></div></div></details>`;}).join('');}
function deskVals(card,k){const g=f=>{const el=$('#dk-'+k+'-'+f,card);return el?el.value.trim():undefined;};const o={key:g('key'),model:g('model'),quick:g('quick'),vision:g('vision'),base:g('base')};if(PROV[k].custom)o.name=g('name');return o;}
AI.settings=function(){const c=AI.cfg;const card=App.h(`<div style="display:flex;flex-direction:column;gap:14px">
  <div><span class="eyebrow">SETTINGS · AI 模式</span><h2 style="margin-top:6px">选择 AI 从哪里来</h2><p class="note" style="margin-top:4px">由教师设置，保存在这台设备上。</p></div>
  ${[['auto','自动',DESK?`有平台接口时用平台接口；否则按 ${AI.order().filter(k=>!(WEB&&k==='claude')).map(k=>AI.SHORT[k]).join(' → ')} 的顺序，用第一个填了密钥的大模型；都没有时用离线演示`:'有平台接口时用平台接口，否则用 Claude，都没有时用离线演示'],['api','平台 AI 接口','调用学校平台自己的识图、文生图、视频生成接口'],...(WEB?[]:[['claude','Claude 大模型',DESK?'Anthropic Claude，需要在下方填写 API 密钥':'在 claude.ai 中打开时可用；需要观看者授权']]),...(DESK?[['gpt','GPT 大模型','OpenAI GPT，需要在下方填写 API 密钥'],['deepseek','DeepSeek 大模型','深度求索 DeepSeek，需要在下方填写 API 密钥'],['kimi','Kimi 大模型','月之暗面 Kimi，需要在下方填写 API 密钥；能看图'],['openai_compatible',AI.NAMES.openai_compatible,'任何兼容 OpenAI 接口的服务（通义千问、智谱、豆包等），填写接口地址、模型和密钥']]:[]),['offline','离线演示','预置结果和平台内置绘图程序，断网也能上课']].map(([v,t,d])=>`<label class="row" style="align-items:flex-start;gap:10px;cursor:pointer;flex-wrap:nowrap"><input type="radio" name="aimode" value="${v}" ${c.mode===v?'checked':''} style="margin-top:5px"><span><b>${t}</b><br><span class="note">${d}</span></span></label>`).join('')}
  ${DESK?`<div style="display:flex;flex-direction:column;gap:10px"><div class="box-t" style="margin:0">${WEB?'大模型密钥（只保存在这台设备的浏览器里）':'大模型密钥（只保存在这台电脑，网页读不到）'}</div>${deskBoxes()}${WEB?`<p class="note">每台要用真 AI 的设备都要有密钥。保存后可以复制一个配置链接，在其他设备上打开一次就配好了。链接里带着密钥，只发给本班设备，不要公开。全班长期使用建议改用中转服务（见部署说明）。</p><div class="row"><button class="btn ghost sm" type="button" id="ai-share">复制配置链接</button><span class="note" id="ai-shareres"></span></div>`:`<p class="note">也可以用配置文件统一设置：菜单「帮助 → 打开 AI 配置文件」，填好后重新打开应用${(AI.deskInfo||{}).configPath?`（${esc(AI.deskInfo.configPath)}）`:''}。</p>`}</div>`:''}
  <div class="box" style="display:flex;flex-direction:column;gap:10px"><div class="box-t">平台 AI 接口</div>
   <label class="f" for="ai-base">接口地址<input type="text" id="ai-base" value="${esc(c.base)}" placeholder="https://your-platform.example/api/ai"></label>
   <label class="f" for="ai-token">访问令牌（可选）<input type="text" id="ai-token" value="${esc(c.token)}" placeholder="由平台管理员提供"></label>
   <div class="row"><button class="btn ghost sm" type="button" id="ai-test">测试连接</button><span class="note" id="ai-testres"></span></div>
   <details><summary class="note" style="cursor:pointer">接口约定（给平台开发同事）</summary><div class="meta">POST {地址}/recognize  {image:dataURL}
  → {top:[{label,conf}], features:[...], note}
POST {地址}/detect     {image:dataURL}
  → {objects:[{name,conf,box:[x,y,w,h]}]}  // 0–1 归一化
POST {地址}/text2image {prompt, style}
  → {image: url 或 dataURL}
POST {地址}/image2video {image, prompt}
  → {video: url}
POST {地址}/text2video {prompt, camera:{shot,move,speed,style}}
  → {video: url}
POST {地址}/asr        {audio:dataURL, lang}
  → {text, segments?:[{text,start,end,speaker?}]}
POST {地址}/tts        {text, voice, speed, style}
  → {audio: url 或 dataURL}
POST {地址}/translate  {text, from, to, context}
  → {text}
POST {地址}/chat       {prompt, json}
  → {text} 或 {data}（文字生成：写诗、搜集资料、整理、审阅）
请求头 Authorization: Bearer {令牌}
注意：在 claude.ai 中打开时，浏览器安全策略会拦截对外部地址的请求；平台接口模式需要把本页面部署到学校平台上使用。</div></details></div>
  <div class="row"><button class="btn" type="button" id="ai-ok">保存</button><button class="btn ghost" type="button" id="ai-cancel">取消</button></div></div>`);
  const m=App.modal(card);
  $('#ai-cancel',card).onclick=m.close;
  $('#ai-test',card).onclick=async()=>{const base=$('#ai-base',card).value.trim();const out=$('#ai-testres',card);if(!base){out.textContent='请先填写接口地址';return;}out.textContent='连接中…';
    try{const r=await fetch(base.replace(/\/$/,'')+'/recognize',{method:'POST',headers:hdr($('#ai-token',card).value.trim()),body:JSON.stringify({ping:true})});out.textContent=r.ok?'连接成功':'接口返回 '+r.status;}catch(e){out.textContent='连不上：地址错误，或当前页面不允许访问外部地址';}};
  if(DESK){card.querySelectorAll('[data-dktest]').forEach(btn=>btn.onclick=async()=>{const k=btn.dataset.dktest,out=$('#dk-'+k+'-res',card);out.textContent='连接中…';
      try{const r=await DESK.ai.test(k,deskVals(card,k));out.textContent=r.ok?'连接成功：'+r.model:'失败：'+r.error;}catch(e){out.textContent='失败：'+(e.message||e);}});
    card.querySelectorAll('[data-dkclear]').forEach(btn=>btn.onclick=async()=>{await DESK.settings.set(btn.dataset.dkclear,{clearKey:true});await AI.refreshDesk();m.close();AI.settings();});}
  if(WEB&&$('#ai-share',card))$('#ai-share',card).onclick=async()=>{const out=$('#ai-shareres',card);for(const k of Object.keys(PROV))await DESK.settings.set(k,deskVals(card,k));await AI.refreshDesk();
    const mode=(card.querySelector('input[name=aimode]:checked')||{}).value||'auto';const url=DESK.settings.shareLink(mode);
    try{await navigator.clipboard.writeText(url);out.textContent='已复制。在其他设备的浏览器里打开这个链接一次即可。';}catch(e){out.innerHTML='复制失败，请手动复制：<br><input type="text" readonly style="width:100%" value="'+esc(url)+'">';}};
  $('#ai-ok',card).onclick=async()=>{const mode=(card.querySelector('input[name=aimode]:checked')||{}).value||'auto';
    if(DESK){for(const k of Object.keys(PROV))await DESK.settings.set(k,deskVals(card,k));if(DESK.settings.setMode)await DESK.settings.setMode(mode);await AI.refreshDesk();}
    AI.cfg={mode,base:$('#ai-base',card).value.trim(),token:$('#ai-token',card).value.trim()};AI.save();m.close();
    const got=AI.mode();App.toast('当前 AI 模式：'+AI.label()+(AI.llm(mode)&&got!==mode?`（${AI.SHORT[mode]} 还没有密钥）`:''));};
};
function hdr(tok){const h={'Content-Type':'application/json'};if(tok)h.Authorization='Bearer '+tok;return h;}
async function api(path,body,{signal}={}){const r=await fetch(AI.cfg.base.replace(/\/$/,'')+path,{method:'POST',headers:hdr(AI.cfg.token),body:JSON.stringify(body),signal});if(!r.ok)throw{code:'api_'+r.status,message:'平台接口返回 '+r.status};return r.json();}
AI.errText=e=>({no_vision:(e&&e.message||'这个大模型不能看图片')+'，已改用离线演示结果。',not_granted:'没有获得使用 Claude 的授权，已改用离线演示结果。',no_key:'还没有填写 AI 密钥，已改用离线演示结果。',bad_key:'AI 密钥无效或没有权限，请老师检查设置。已改用离线演示结果。',network:'连不上 AI 服务（请检查网络或接口地址），已改用离线演示结果。',rate_limited:'请求太多了，请稍等再试。',cancelled:'已停止。'}[e&&e.code]||(e&&e.message&&String(e.code||'').startsWith('api')?e.message+'，已改用离线演示结果。':'AI 暂时没有回应，已改用离线演示结果。'));
AI.fail=e=>{if(e&&e.code==='not_granted'&&!DESK){AI.backends.claude=null;AI.paint();}};
const toDataURL=cv=>cv.toDataURL('image/jpeg',0.85);
const toBlob=cv=>new Promise(r=>cv.toBlob(r,'image/jpeg',0.85));

/* ---------- recognition ---------- */
AI.LIB={
 cat:{src:'img/cat.jpg',name:'猫',labels:['猫','狐狸','松鼠','狗','老虎'],feat:['尖尖的耳朵','绿色的眼睛','长长的胡须','橘色的条纹毛']},
 coffee:{src:'img/coffee.jpg',name:'咖啡杯',labels:['咖啡杯','碗','茶杯','盘子','汤勺'],feat:['圆形杯口','杯子把手','黑色的液体','下面有碟子','周围是咖啡豆']},
 rocket:{src:'img/rocket.jpg',name:'火箭',labels:['火箭','灯塔','高塔','烟囱','导弹'],feat:['细长的箭身','尖尖的头部','两侧的发射架','白色外壳']},
 flower:{src:'img/flower.jpg',name:'花',labels:['大丽花','月季','牡丹','菊花','芍药'],feat:['层层叠叠的橙色花瓣','花瓣向外散开','周围是绿叶','阳光照在花上']},
 temple:{src:'img/temple.jpg',name:'古建筑',labels:['中国古建筑','寺庙','宫殿','牌坊','塔'],feat:['翘起的屋檐','红灯笼','雕花的屋顶','石柱']},
 horse:{src:'img/horse.jpg',name:'马的剪影',labels:['马','驴','鹿','狗','骆驼'],feat:['四条长腿','长长的脖子','飘起的尾巴','只有轮廓，没有颜色和纹理']},
 coins:{src:'img/coins.jpg',name:'硬币',labels:['硬币','古钱币','纽扣','饼干','瓶盖'],feat:['圆形','中间有方孔','表面有文字','金属锈迹']},
 apple:{src:'img/apple.jpg',name:'苹果',labels:['苹果','番茄','樱桃','桃子','石榴'],feat:['圆圆的外形','光滑的表面','红色表皮','果柄和叶子']}
};
AI.degree=c=>{const b=(c.blur||0)/12,o=(c.occ||0)/70,r=Math.min(1,Math.abs(c.rot||0)/180)*0.55,k=(c.dark||0)/90,x=((c.pix||1)-1)/23,n=(c.noise||0)/80;return Math.min(1.6,0.8*b+0.95*o+0.45*r+0.7*k+0.85*x+0.75*n);};
function offlineRecognize(key,c){const L=AI.LIB[key];if(!L)return{top:[{label:'无法判断',conf:0}],features:[],note:'离线演示模式只能识别图库里的图片。识别自己上传的图片，需要切换到平台接口或大模型（Claude、GPT）模式。'};
  const d=AI.degree(c);let c1=Math.round(Math.max(4,Math.min(97,96-100*d)));const hz=(key.length*7)%3;const rest=100-c1;
  let order=c1>=32?[0,1,2,3,4]:[1+hz%3,0,1+((hz+1)%3),4,3];if(c1<32){c1=Math.round(30+d*6);}
  const shares=c1>=32?[c1,rest*.5,rest*.25,rest*.12,rest*.06]:[c1,Math.max(4,96-100*d),14,8,5];
  const top=order.map((i,j)=>({label:L.labels[i],conf:Math.round(shares[j])}));
  const nf=Math.max(0,L.feat.length-Math.floor(d*3.2));const features=L.feat.slice(0,nf);if(d>0.55)features.push('很多地方看不清');
  const note=d<0.15?'特征清楚，和记忆里的特征对得上。':d<0.6?'部分特征看不清，把握度下降。':'能看到的特征太少，只能猜，容易认错。';return{top,features,note};}
AI.recognize=async function(key,canvas,c,{signal}={}){const m=AI.mode();
  try{
    if(m==='api'){const j=await api('/recognize',{image:toDataURL(canvas)},{signal});j.mode='api';return j;}
    if(AI.llm(m)){const prompt=`你在扮演一个“图像识别 AI”，给小学高年级学生做实验演示。只根据这张图片里看得见的特征，判断图中的主要物体是什么，不要靠猜测补全看不清的部分。如果图片模糊、被遮挡、太暗、有噪点、太远或倒过来，就如实降低把握度，甚至可以认错。\n只输出 JSON：{"top":[{"label":"中文名称","conf":0-100 的整数}，共 5 个，按把握度从高到低],"features":["你看到的 2～4 个关键特征，每个不超过 10 个字"],"note":"一句话（不超过 30 字）说明把握程度和原因"}`;
      const v=AI.visionFor(m);if(!v)throw noVision(m);const j=await AI.backends[v].json(prompt,{images:[await toBlob(canvas)],modelTier:'quick',signal});if(!j||!Array.isArray(j.top))throw{code:'bad'};j.mode=AI.srcKey(v);if(v!==m)j.note=(j.note||'')+`（${AI.SHORT[m]} 不能看图，这次由 ${AI.SHORT[v]} 识别）`;return j;}
  }catch(e){AI.fail(e);if(e&&e.code==='cancelled')throw e;const o=offlineRecognize(key,c);o.note=AI.errText(e)+' '+o.note;o.mode='offline';return o;}
  await new Promise(r=>setTimeout(r,350));return Object.assign(offlineRecognize(key,c),{mode:'offline'});};
AI.offlineRecognize=offlineRecognize;
const SCENES={
 scene_cat:{objects:[{name:'杜鹃花',conf:90,box:[.72,.38,.28,.42]},{name:'树',conf:88,box:[.08,.0,.55,.30]},{name:'白色花朵',conf:84,box:[.53,.26,.22,.12]},{name:'棚屋',conf:80,box:[.03,.24,.40,.14]},{name:'小路',conf:72,box:[.42,.70,.20,.30]},{name:'草丛',conf:66,box:[.0,.55,.42,.45]}],note:'小路中间的黑猫个头小、颜色和阴影接近，又被植物挡住一部分，没有检测到。'},
 scene_traffic:{objects:[{name:'汽车',conf:96,box:[.22,.555,.29,.27]},{name:'汽车',conf:90,box:[.58,.515,.11,.115]},{name:'汽车',conf:82,box:[.665,.49,.065,.08]},{name:'树',conf:88,box:[.0,.0,.38,.55]},{name:'行人',conf:78,box:[.46,.48,.04,.11]},{name:'斑马线',conf:70,box:[.46,.565,.27,.06]},{name:'交通标志',conf:74,box:[.755,.40,.03,.045]}],note:'右边远处的几个行人个头太小，没有检测到。'}};
AI.detect=async function(key,canvas){const m=AI.mode();
  try{
    if(m==='api'){const j=await api('/detect',{image:toDataURL(canvas)});j.mode='api';return j;}
    if(AI.llm(m)){const v=AI.visionFor(m);if(!v)throw noVision(m);const j=await AI.backends[v].json(`你在扮演一个“目标检测 AI”。找出这张图里你能看清的所有物体，给每个物体一个中文名称、把握度和位置框。只标你真正看清的，看不清或太小的不要硬猜。位置框用 [x,y,w,h] 表示，都是 0～1 之间的小数（相对图片宽高，x,y 是左上角）。只输出 JSON：{"objects":[{"name":"物体","conf":0-100,"box":[x,y,w,h]}],"note":"一句话说明哪些地方不好认（不超过 30 字）"}`,{images:[await toBlob(canvas)],modelTier:'default'});j.mode=AI.srcKey(v);return j;}
  }catch(e){AI.fail(e);return Object.assign({mode:'offline'},SCENES[key]||{objects:[]},{note:AI.errText(e)});}
  await new Promise(r=>setTimeout(r,600));return Object.assign({mode:'offline'},SCENES[key]||{objects:[],note:''});};

/* ---------- generation ---------- */
const STYLE_TXT={plain:'写实风景画',ink:'中国画（水墨淡彩：宣纸米黄底，浓淡墨色晕染，留白，可加红色小印章）',oil:'油画（色彩浓郁厚重，多层半透明色块和短笔触）',water:'水彩画（色彩柔和透明，边缘晕开，浅色为主）'};
AI.sanitize=function(svgText){const m=/<svg[\s\S]*<\/svg>/i.exec(svgText||'');if(!m)return null;const doc=new DOMParser().parseFromString(m[0],'image/svg+xml');const svg=doc.documentElement;if(!svg||svg.nodeName.toLowerCase()!=='svg'||doc.querySelector('parsererror'))return null;
  svg.querySelectorAll('script,foreignObject,iframe,object,embed,a,image,style').forEach(n=>{if(n.nodeName==='style'){n.textContent=n.textContent.replace(/@import[^;]*;|url\(\s*['"]?https?:[^)]*\)/gi,'');return;}n.remove();});
  svg.querySelectorAll('*').forEach(n=>[...n.attributes].forEach(a=>{const v=a.value.trim().toLowerCase();if(/^on/i.test(a.name)||v.startsWith('javascript:')||((a.name==='href'||a.name==='xlink:href')&&!v.startsWith('#')))n.removeAttribute(a.name);}));
  if(!svg.getAttribute('viewBox'))svg.setAttribute('viewBox','0 0 640 400');svg.removeAttribute('width');svg.removeAttribute('height');svg.setAttribute('xmlns','http://www.w3.org/2000/svg');svg.setAttribute('preserveAspectRatio','xMidYMid slice');
  return new XMLSerializer().serializeToString(svg);};
AI.svgURL=s=>'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(s);
/* returns a work: {kind:'svg',svg} | {kind:'img',src} | null (=use procedural) */
AI.textToImage=async function(prompt,style,{onText,signal}={}){const m=AI.mode();
  if(m==='api'){const j=await api('/text2image',{prompt,style},{signal});return {kind:'img',src:j.image};}
  if(AI.llm(m)){const {text}=await AI.sample(`你是一个“文生图 AI”，用 SVG 代码作画，给小学高年级学生演示“提示词越具体，画面越贴近想象”。\n提示词：「${prompt}」\n绘画形式：${STYLE_TXT[style]||STYLE_TXT.plain}\n要求：1. 只画提示词提到的或诗句直接描绘的内容；提示词简单时画面也简单，加了细节就把细节明显画出来；2. 画面里不要写文字（印章除外），不要画人脸特写；3. 构图有前景、中景、远景层次，用渐变、半透明叠加、feTurbulence/feGaussianBlur 等滤镜营造绘画质感；4. 只输出一个完整的 <svg viewBox="0 0 640 400" xmlns="http://www.w3.org/2000/svg">…</svg>，不超过 10000 个字符，不用 <script>、<image>、外部链接。`,{modelTier:'default',onText,signal});const s=AI.sanitize(text);if(!s)throw{code:'bad_svg',message:'没有得到可用的画'};return {kind:'svg',svg:s};}
  return null;};
function parseVideo(text){const jm=/```json\s*([\s\S]*?)```/i.exec(text);let analysis=[];try{analysis=JSON.parse(jm[1]).analysis||[];}catch(e){}return{analysis,svg:AI.sanitize(text)};}
AI.imageToVideo=async function(work,{onText,signal}={}){const m=AI.mode();
  if(m==='api'){const j=await api('/image2video',{image:work.dataURL,prompt:''},{signal});return {kind:'video',src:j.video,analysis:j.analysis||[]};}
  if(AI.llm(m)&&work.kind==='svg'){const {text}=await AI.sample(`你是一个“图生视频 AI”。下面是一幅画的 SVG 代码。按三步工作：①分析哪些元素应该动（水流动、云飘浮、光闪烁、树摇摆），哪些不应该动（山、石头）；②预测每个会动元素的运动规律（方向、快慢）；③给原 SVG 加上 SMIL 动画（<animate>、<animateTransform>，repeatCount="indefinite"，整体循环约 6 秒），动作要符合自然规律，不动的元素保持不变，不使用 <script>。\n输出格式：先输出一个 \`\`\`json 代码块：{"analysis":[{"element":"元素名","move":true或false,"rule":"运动规律（不超过15字）"}]}，再输出完整的 <svg …>…</svg>（不超过 12000 字符）。\n\n原画：\n${work.svg.slice(0,14000)}`,{modelTier:'default',onText,signal});const r=parseVideo(text);if(!r.svg)throw{code:'bad_svg'};return {kind:'svg',svg:r.svg,analysis:r.analysis};}
  return null;};
AI.textToVideo=async function(prompt,camera,{onText,signal}={}){const m=AI.mode();
  if(m==='api'){const j=await api('/text2video',{prompt,camera},{signal});return {kind:'video',src:j.video};}
  if(AI.llm(m)){const cam=`景别：${camera.shotName}；运镜：${camera.moveName}；速度：${camera.slow?'慢动作':'正常'}；画风：${camera.style==='ink'?'中国画':'写实'}`;
    const {text}=await AI.sample(`你是一个“文生视频 AI”，用带 SMIL 动画的 SVG 生成一段约 8 秒循环播放的动画短片，给小学高年级学生演示镜头语言和提示词的作用。\n提示词：「${prompt}」\n镜头要求：${cam}\n要明显体现镜头要求（远景=景物小、视野开阔；特写=只拍一个细节；推=画面逐渐放大；拉=逐渐缩小；摇=画面左右平移；慢动作=动作明显变慢；中国画=水墨宣纸风格）。\n输出格式：先输出一个 \`\`\`json 代码块：{"analysis":[{"element":"元素名","move":true或false,"rule":"运动规律（不超过15字）"}]}，再输出完整的 <svg viewBox="0 0 640 400" xmlns="http://www.w3.org/2000/svg">…</svg>（不超过 12000 字符，不写文字，不用 <script>、<image>）。`,{modelTier:'default',onText,signal});const r=parseVideo(text);if(!r.svg)throw{code:'bad_svg'};return {kind:'svg',svg:r.svg,analysis:r.analysis};}
  return null;};
AI.mountSVG=(box,svgText)=>{box.innerHTML=svgText;return box.querySelector('svg');};
/* ---------- speech & language (Unit 2) ---------- */
AI.api=api;
/* transcribe a recorded clip. Returns {text,mode} or null when no backend can hear audio
   (Claude has no speech input; GPT can, through the desktop app; the school API through /asr). */
AI.transcribe=async function(blob,{lang='zh',prompt='',signal}={}){const m=AI.mode();const audio=await new Promise(r=>{const f=new FileReader();f.onload=()=>r(f.result);f.readAsDataURL(blob);});
  if(m==='api'){const j=await api('/asr',{audio,lang},{signal});return {text:j.text||'',mode:'api',segments:j.segments};}
  if(DESK&&DESK.ai.transcribe&&AI.backends.gpt&&AI.llm(m)){const j=await DESK.ai.transcribe({audio,lang,prompt});return {text:j.text||'',mode:'gpt'};}
  return null;};
/* live recognition in the browser (Edge / Chrome / Safari send the audio to their own speech service). null when unavailable. */
AI.liveASR=function(lang='zh-CN'){const R=window.SpeechRecognition||window.webkitSpeechRecognition;if(!R||(DESK&&!WEB))return null;
  let rec=null;return {start({onPartial,onFinal,onError,onEnd}={}){rec=new R();rec.lang=lang;rec.interimResults=true;rec.continuous=true;let fin='';
      rec.onresult=e=>{let tmp='';for(let i=e.resultIndex;i<e.results.length;i++){const r=e.results[i];if(r.isFinal){fin+=r[0].transcript;onFinal&&onFinal(fin,r[0].confidence);}else tmp+=r[0].transcript;}onPartial&&onPartial(fin+tmp);};
      rec.onerror=e=>onError&&onError({code:e.error==='not-allowed'?'denied':e.error==='network'?'network':e.error,message:e.error});rec.onend=()=>onEnd&&onEnd(fin);rec.start();},stop(){try{rec&&rec.stop();}catch(e){}}};};
/* synthesized speech as an audio URL from the platform API or GPT (desktop). null -> caller uses the browser voice. */
AI.speechAudio=async function(text,{voice='',speed=1,style=''}={}){const m=AI.mode();
  if(m==='api'){const j=await api('/tts',{text,voice,speed,style});return j.audio||null;}
  if(DESK&&DESK.ai.speech&&m==='gpt'&&AI.backends.gpt){const j=await DESK.ai.speech({text,voice,speed,style});return j.audio||null;}
  return null;};
/* ---------- text generation (Unit 3) ----------
   AI.chat(prompt,{onText,signal,tier,json}) -> {text,mode} (or {data,mode} with json:true); null when only offline presets are available.
   Uses the school API (/chat), else the active LLM (Claude / GPT). */
AI.chat=async function(prompt,{onText,signal,tier='default',json=false,system='',images=null}={}){const m=AI.mode();const full=system?system+'\n\n'+prompt:prompt;
  /* images: optional array of Blob / dataURL (e.g. a photographed worksheet) */
  const imgs=images&&images.length?images:null;
  if(m==='api'){const j=await api('/chat',imgs?{prompt:full,json,images:await Promise.all(imgs.map(chatImgURL))}:{prompt:full,json},{signal});if(json){let d=j.data;if(!d&&j.text){const mm=/\{[\s\S]*\}|\[[\s\S]*\]/.exec(j.text);d=mm?JSON.parse(mm[0]):null;}return {data:d,mode:'api'};}if(onText)onText({text:j.text||''});return {text:j.text||'',mode:'api'};}
  if(AI.llm(m)){const io=imgs?{images:await Promise.all(imgs.map(chatImgBlob))}:{};
    /* an image task on a provider that cannot see goes to the first configured provider that can */
    const v=imgs?AI.visionFor(m):m;if(!v)throw noVision(m);const S=AI.backends[v];
    if(json){const d=await S.json(full,{modelTier:tier==='quick'?'quick':'default',signal,...io});return {data:d,mode:AI.srcKey(v),provider:v};}
    const {text}=await S(full,{modelTier:tier==='quick'?'quick':'default',onText,signal,cache:false,...io});return {text,mode:AI.srcKey(v),provider:v};}
  return null;};
const chatImgURL=x=>typeof x==='string'?x:new Promise((r,j)=>{const f=new FileReader();f.onload=()=>r(f.result);f.onerror=j;f.readAsDataURL(x);});
const chatImgBlob=async x=>typeof x==='string'?await (await fetch(x)).blob():x;
AI.SPEECH_VOICES_GPT=['alloy','ash','coral','echo','fable','nova','onyx','sage','shimmer'];
/* translation through the platform API or the active LLM; null -> caller uses its offline examples */
AI.translate=async function(text,{to='en',from='auto',context='',explain=false,signal,onText}={}){const m=AI.mode();
  if(m==='api'){const j=await api('/translate',{text,from,to,context},{signal});return {text:j.text||'',mode:'api',steps:j.steps};}
  if(AI.llm(m)){const LANG={en:'英语',zh:'简体中文',fr:'法语',es:'西班牙语',ru:'俄语',ja:'日语',de:'德语',ko:'韩语'};
    const prompt=`你是一个翻译 AI，正在给小学高年级学生演示机器翻译。把下面的内容翻译成${LANG[to]||to}。${context?`\n这段内容出现的语境：${context}`:'\n没有提供任何语境。'}\n原文：${text}\n`+(explain?`输出一个 JSON：{"translation":"译文","segments":[{"src":"原文里的一个词或短语","dst":"对应译文"}],"note":"一句话说明你是怎样根据语境决定译法的（没有语境就说明你选了最常见的意思）"}`:'只输出译文，不要解释。');
    if(explain){const j=await AI.sample.json(prompt,{modelTier:'quick',signal});return {text:j.translation||'',segments:j.segments||[],note:j.note||'',mode:AI.srcKey(m),provider:m};}
    const {text:out}=await AI.sample(prompt,{modelTier:'quick',signal,onText,cache:false});return {text:out.trim(),mode:AI.srcKey(m),provider:m};}
  return null;};
})();
