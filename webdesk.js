/* Web adapter: lets the page call OpenAI-compatible providers (DeepSeek, Kimi, GPT, custom) straight from the browser
   when it is hosted as a plain static site (GitHub Pages etc.).
   It exposes the same surface as the desktop app's `window.desktop` (settings.get/set/setMode, ai.stream, ai.test), so ai.js
   needs no second code path. It is NOT installed inside the desktop app or on claude.ai (which has its own Claude backend).
   Keys are kept in this browser's localStorage, or come from ai-config.js (a relay passcode — never a real key). */
(function(){
if(window.desktop&&window.desktop.isDesktop)return;
if(window.claude&&window.claude.use)return;
const KEY='ailab.webai',PROVS=['gpt','deepseek','kimi','openai_compatible'];
const DEF={gpt:{base:'https://api.openai.com/v1'},deepseek:{base:'https://api.deepseek.com',model:'deepseek-flash',quick:'deepseek-flash'},kimi:{base:'https://api.moonshot.cn/v1'},openai_compatible:{base:''}};
const CFG=window.AILAB_CONFIG||{};
const load=()=>{try{return JSON.parse(localStorage.getItem(KEY))||{};}catch(e){return {};}};
const save=o=>{try{localStorage.setItem(KEY,JSON.stringify(o));}catch(e){}};
/* one-time setup link: …/index.html#setup=<base64url(json)> stores the settings on this device, then drops the hash */
const b64e=s=>btoa(unescape(encodeURIComponent(s))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const b64d=s=>decodeURIComponent(escape(atob(s.replace(/-/g,'+').replace(/_/g,'/'))));
(function(){const m=/[#&]setup=([\w-]+)/.exec(location.hash||'');if(!m)return;
  try{const j=JSON.parse(b64d(m[1]));const o=load();o.p=o.p||{};PROVS.forEach(k=>{if(j.p&&j.p[k])o.p[k]=Object.assign({},o.p[k],j.p[k]);});save(o);
    if(j.mode){const c=JSON.parse(localStorage.getItem('ailab.ai')||'{}');c.mode=j.mode;c.base=c.base||'';c.token=c.token||'';localStorage.setItem('ailab.ai',JSON.stringify(c));if(CFG.stamp)localStorage.setItem('ailab.ai.stamp',JSON.stringify(CFG.stamp));}
    window.__ailabSetup=true;}catch(e){}
  try{history.replaceState(null,'',location.pathname+location.search);}catch(e){location.hash='';}})();
/* merged view of one provider: local settings win over ai-config.js, which wins over built-in defaults */
function prov(k){const L=(load().p||{})[k]||{},F=CFG[k]||{},D=DEF[k]||{};const pick=f=>L[f]!=null&&L[f]!==''?L[f]:(F[f]!=null&&F[f]!==''?F[f]:(D[f]||''));
  return {key:L.key||F.key||'',keyFrom:L.key?'local':(F.key?'file':''),base:String(pick('base')).replace(/\/+$/,''),model:pick('model'),quick:pick('quick'),vision:pick('vision'),name:pick('name')};}
const listeners=[];const noThink={};
const settings={
  async get(){const o={order:['deepseek','kimi','openai_compatible','gpt'],claude:{hasKey:false},web:true};
    PROVS.forEach(k=>{const P=prov(k);o[k]={hasKey:!!P.key,keyFrom:P.keyFrom==='file'?'env':P.keyFrom,base:P.base,model:P.model,quick:P.quick,vision:P.vision,name:P.name,canSee:!!P.vision};});
    if(CFG.mode&&CFG.stamp){o.mode=CFG.mode;o.modeStamp=CFG.stamp;}return o;},
  async set(k,v){if(!PROVS.includes(k)||!v)return;const o=load();o.p=o.p||{};const cur=o.p[k]||{};
    if(v.clearKey){delete cur.key;}else{['model','quick','vision','base','name'].forEach(f=>{if(v[f]!==undefined)cur[f]=v[f];});if(v.key)cur.key=v.key;}
    o.p[k]=cur;save(o);listeners.forEach(f=>{try{f();}catch(e){}});},
  async setMode(){},
  onChanged(f){listeners.push(f);},
  /* a link that carries this device's settings to another device (the key travels in the link — share with care) */
  shareLink(mode){const o=load();const p={};PROVS.forEach(k=>{const v=(o.p||{})[k];if(v&&v.key)p[k]=v;});
    return location.origin+location.pathname+'#setup='+b64e(JSON.stringify({mode:mode||'',p}));}
};
function fail(status,text){let msg='';try{const j=JSON.parse(text);msg=(j.error&&(j.error.message||j.error))||j.message||'';}catch(e){msg=(text||'').slice(0,120);}
  if(status===401||status===403)return {code:'bad_key',message:msg};
  if(status===402)return {code:'api_402',message:'AI 账户余额不足，请老师充值'};
  if(status===429)return {code:'rate_limited',message:msg};
  return {code:'api_'+status,message:'AI 服务返回 '+status+(msg?'：'+String(msg).slice(0,80):'')};}
async function call(k,P,{prompt,images=[],tier='full'},onDelta,signal,opts={}){
  if(!P.key)throw {code:'no_key'};if(!P.base)throw {code:'api_cfg',message:'还没有填写接口地址'};
  const model=images.length?P.vision:(tier==='full'?(P.model||P.quick):(P.quick||P.model));
  if(!model)throw images.length?{code:'no_vision',message:'这个大模型没有配置看图模型'}:{code:'api_cfg',message:'还没有填写模型名'};
  const content=images.length?[{type:'text',text:prompt},...images.map(u=>({type:'image_url',image_url:{url:u}}))]:prompt;
  const body={model,messages:[{role:'user',content}],stream:true};
  /* DeepSeek: answer directly, without the slower thinking pass (dropped automatically if the server rejects the field) */
  if(k==='deepseek'&&!opts.plain&&!noThink[k])body.thinking={type:'disabled'};
  let r;try{r=await fetch(P.base+'/chat/completions',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+P.key},body:JSON.stringify(body),signal});}
  catch(e){throw (e&&e.name==='AbortError')?{code:'cancelled'}:{code:'network'};}
  if(!r.ok){const t=await r.text().catch(()=>'');if(r.status===400&&body.thinking){noThink[k]=true;return call(k,P,{prompt,images,tier},onDelta,signal,{plain:true});}throw fail(r.status,t);}
  let text='';
  if(!r.body||!/event-stream/.test(r.headers.get('content-type')||'')){const j=await r.json().catch(()=>null);text=(j&&j.choices&&j.choices[0]&&j.choices[0].message&&j.choices[0].message.content)||'';if(text&&onDelta)onDelta(text);return {text,model};}
  const rd=r.body.getReader(),dec=new TextDecoder();let buf='';
  try{for(;;){const {done,value}=await rd.read();if(done)break;buf+=dec.decode(value,{stream:true});let i;
      while((i=buf.indexOf('\n'))>=0){const line=buf.slice(0,i).trim();buf=buf.slice(i+1);if(!line.startsWith('data:'))continue;const d=line.slice(5).trim();if(!d||d==='[DONE]')continue;
        try{const j=JSON.parse(d);const c=j.choices&&j.choices[0]&&j.choices[0].delta&&j.choices[0].delta.content;if(c){text+=c;if(onDelta)onDelta(c);}}catch(e){}}}}
  catch(e){if(e&&e.name==='AbortError')throw {code:'cancelled'};if(!text)throw {code:'network'};}
  return {text,model};}
const ai={
  stream(req,onDelta,signal){return call(req.provider,prov(req.provider),req,onDelta,signal);},
  async test(k,vals){const P=Object.assign(prov(k),Object.fromEntries(Object.entries(vals||{}).filter(([,v])=>v!==undefined&&v!=='')));P.base=String(P.base||'').replace(/\/+$/,'');
    try{const r=await call(k,P,{prompt:'只回答两个字：你好',tier:'quick'});return r.text?{ok:true,model:r.model}:{ok:false,error:'没有收到回答'};}
    catch(e){return {ok:false,error:({no_key:'还没有填写密钥',bad_key:'密钥无效或没有权限',network:'连不上（检查网络和接口地址；浏览器可能不允许直接访问这个地址，可改用中转服务）',rate_limited:'请求太多，稍后再试'})[e.code]||e.message||'失败'};}}
};
window.desktop={isDesktop:true,web:true,settings,ai};
})();
