/* Speech toolkit for Unit 2 (语音实验室) — shared by l4 / l5 / l6.
   Everything here runs on the student's device: recordings are kept in memory only,
   analysed with Web Audio, and released when the lesson is left (Speech.release()). */
(function(){
const S={};window.Speech=S;
let ctx=null;const live=new Set();          // open mic streams / sources, closed by release()
S.ctx=()=>{if(!ctx){const C=window.AudioContext||window.webkitAudioContext;if(!C)return null;ctx=new C();}if(ctx.state==='suspended')ctx.resume();return ctx;};

/* ---------- microphone ---------- */
S.micSupported=()=>!!(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia&&window.MediaRecorder);
/* start recording; resolves to a controller once the mic is open.
   ctl.stop() -> {blob, buffer, dur}; ctl.cancel() discards everything. */
S.record=async function({maxMs=10000,onLevel,raw=false}={}){  /* raw:true keeps background sound (no echo cancellation / noise suppression) — for noise experiments */
  if(!S.micSupported())throw{code:'unsupported',message:'这台设备或当前页面不能使用麦克风'};
  let stream;try{stream=await navigator.mediaDevices.getUserMedia({audio:raw?{echoCancellation:false,noiseSuppression:false,autoGainControl:false}:{echoCancellation:true,noiseSuppression:false,autoGainControl:true}});}
  catch(e){throw{code:e&&e.name==='NotAllowedError'?'denied':'unsupported',message:e&&e.name==='NotAllowedError'?'没有获得麦克风权限':'打不开麦克风'};}
  live.add(stream);const ac=S.ctx();const src=ac.createMediaStreamSource(stream);const an=ac.createAnalyser();an.fftSize=2048;src.connect(an);
  const rec=new MediaRecorder(stream);const chunks=[];rec.ondataavailable=e=>{if(e.data&&e.data.size)chunks.push(e.data);};rec.start(100);
  const buf=new Float32Array(an.fftSize);let raf=0,timer=0,done=false;
  const tick=()=>{an.getFloatTimeDomainData(buf);let s=0;for(let i=0;i<buf.length;i++)s+=buf[i]*buf[i];if(onLevel)onLevel(Math.sqrt(s/buf.length),an);raf=requestAnimationFrame(tick);};tick();
  const close=()=>{cancelAnimationFrame(raf);clearTimeout(timer);try{src.disconnect();}catch(e){}stream.getTracks().forEach(t=>t.stop());live.delete(stream);};
  let resolveStop;const stopped=new Promise(r=>resolveStop=r);
  rec.onstop=async()=>{close();const blob=new Blob(chunks,{type:rec.mimeType||'audio/webm'});let buffer=null;try{buffer=await S.decode(blob);}catch(e){}resolveStop({blob,buffer,dur:buffer?buffer.duration:0});};
  const ctl={analyser:an,stop(){if(!done){done=true;try{rec.stop();}catch(e){close();resolveStop({blob:null,buffer:null,dur:0});}}return stopped;},cancel(){done=true;try{rec.onstop=null;rec.stop();}catch(e){}close();chunks.length=0;}};
  timer=setTimeout(()=>ctl.stop(),maxMs);return ctl;};
S.decode=async blob=>{const ac=S.ctx();const ab=await blob.arrayBuffer();return await new Promise((res,rej)=>{const p=ac.decodeAudioData(ab,res,rej);if(p&&p.then)p.then(res,rej);});};
S.blobToDataURL=b=>new Promise(r=>{const f=new FileReader();f.onload=()=>r(f.result);f.readAsDataURL(b);});
/* stop every mic stream and sound this toolkit opened (call from L.onHide) */
S.release=()=>{live.forEach(x=>{try{if(x.getTracks)x.getTracks().forEach(t=>t.stop());else if(x.stop)x.stop();}catch(e){}});live.clear();try{speechSynthesis.cancel();}catch(e){}};
S.playBuffer=(buffer,{rate=1}={})=>{const ac=S.ctx();const s=ac.createBufferSource();s.buffer=buffer;s.playbackRate.value=rate;s.connect(ac.destination);s.start();live.add(s);s.onended=()=>live.delete(s);return {stop(){try{s.stop();}catch(e){}}};};

/* ---------- signal helpers ---------- */
const mono=x=>x instanceof Float32Array?x:(x&&x.getChannelData?x.getChannelData(0):new Float32Array(0));
const rateOf=x=>x&&x.sampleRate?x.sampleRate:16000;
/* frame energy (RMS) every hop seconds */
S.energy=(x,hop=0.01)=>{const d=mono(x),sr=rateOf(x),h=Math.max(1,Math.round(sr*hop)),n=Math.floor(d.length/h),e=new Float32Array(n);for(let i=0;i<n;i++){let s=0;for(let j=i*h;j<(i+1)*h;j++)s+=d[j]*d[j];e[i]=Math.sqrt(s/h);}return e;};
/* autocorrelation pitch tracker: [{t,f0|null}] */
S.pitch=(x,{hop=0.02,min=75,max=500}={})=>{const d=mono(x),sr=rateOf(x),w=Math.round(sr*0.04),h=Math.round(sr*hop),out=[];const lo=Math.floor(sr/max),hi=Math.ceil(sr/min);
  let peak=0;for(let i=0;i<d.length;i++)peak=Math.max(peak,Math.abs(d[i]));const gate=peak*0.08;
  for(let s=0;s+w+hi<d.length;s+=h){let e=0;for(let i=0;i<w;i++)e+=d[s+i]*d[s+i];const rms=Math.sqrt(e/w);if(rms<gate){out.push({t:s/sr,f0:null});continue;}
    /* normalised autocorrelation; take the SHORTEST lag close to the best peak, so a voice is not read an octave (½, ⅓…) too low */
    const nc=new Float32Array(hi+1);let best=0;for(let l=lo;l<=hi;l++){let c=0,e2=0;for(let i=0;i<w;i++){c+=d[s+i]*d[s+i+l];e2+=d[s+i+l]*d[s+i+l];}nc[l]=c/Math.sqrt(e*e2+1e-12);if(nc[l]>best)best=nc[l];}
    let bl=0;for(let l=lo+1;l<hi;l++){if(nc[l]>=best*0.88&&nc[l]>=nc[l-1]&&nc[l]>=nc[l+1]){bl=l;break;}}
    out.push({t:s/sr,f0:best>0.5&&bl?sr/bl:null});}
  return out;};
/* compact feature card used by 第5讲 (and anywhere a "voice fingerprint" is shown) */
S.features=x=>{if(!x)return null;const d=mono(x),sr=rateOf(x),dur=d.length/sr;const p=S.pitch(x).filter(q=>q.f0);const f=p.map(q=>q.f0).sort((a,b)=>a-b);
  const pct=q=>f.length?f[Math.min(f.length-1,Math.floor(q*f.length))]:null;const e=S.energy(x,0.01);let mx=0;e.forEach(v=>mx=Math.max(mx,v));
  let syl=0,on=false;const th=mx*0.35;for(let i=0;i<e.length;i++){if(!on&&e[i]>th){on=true;syl++;}else if(on&&e[i]<th*0.6)on=false;}
  let pause=0;for(let i=0;i<e.length;i++)if(e[i]<mx*0.08)pause++;
  return {dur:+dur.toFixed(2),meanF0:f.length?Math.round(f.reduce((a,b)=>a+b,0)/f.length):null,lowF0:pct(.1)?Math.round(pct(.1)):null,highF0:pct(.9)?Math.round(pct(.9)):null,
    rate:dur?+(syl/dur).toFixed(1):0,pauseRatio:e.length?+(pause/e.length).toFixed(2):0,pitch:p};};

/* ---------- drawing ---------- */
const css=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim()||'#4cc9f0';
function prep(cv){const r=cv.getBoundingClientRect(),dpr=Math.min(2,window.devicePixelRatio||1);const W=Math.max(10,Math.round((r.width||cv.width)*dpr)),H=Math.max(10,Math.round((r.height||cv.height)*dpr));if(cv.width!==W||cv.height!==H){cv.width=W;cv.height=H;}const g=cv.getContext('2d');return {g,W,H,dpr};}
/* waveform: x = Float32Array | AudioBuffer; opts.marks=[{t0,t1,color,label}] for highlighted spans */
S.drawWave=(cv,x,opts={})=>{const {g,W,H,dpr}=prep(cv);const d=mono(x),sr=rateOf(x),dur=d.length/sr;g.fillStyle=opts.bg||'#060b1d';g.fillRect(0,0,W,H);
  g.strokeStyle='#1f2b57';g.lineWidth=1;g.beginPath();g.moveTo(0,H/2);g.lineTo(W,H/2);g.stroke();
  (opts.marks||[]).forEach(m=>{const a=m.t0/dur*W,b=m.t1/dur*W;g.fillStyle=m.color||'rgba(249,199,79,.18)';g.fillRect(a,0,b-a,H);if(m.label){g.fillStyle=m.text||'#e9eefc';g.font=`${12*dpr}px "Noto Sans SC",sans-serif`;g.fillText(m.label,a+4*dpr,14*dpr);}});
  const step=Math.max(1,Math.floor(d.length/W));g.strokeStyle=opts.color||css('--cyan');g.beginPath();
  for(let i=0;i<W;i++){let lo=1,hi=-1;for(let j=i*step;j<Math.min(d.length,(i+1)*step);j++){const v=d[j];if(v<lo)lo=v;if(v>hi)hi=v;}if(hi<lo){lo=hi=0;}g.moveTo(i+.5,H/2-hi*H*0.46*(opts.gain||1));g.lineTo(i+.5,H/2-lo*H*0.46*(opts.gain||1)+1);}g.stroke();
  if(opts.axis!==false){g.fillStyle='#8a97c7';g.font=`${10*dpr}px "JetBrains Mono",monospace`;for(let s=0;s<=Math.floor(dur);s++){const xx=s/dur*W;g.fillRect(xx,H-5*dpr,1,5*dpr);g.fillText(s+'s',xx+2*dpr,H-7*dpr);}}};
function fft(re,im){const n=re.length;for(let i=1,j=0;i<n;i++){let b=n>>1;for(;j&b;b>>=1)j^=b;j^=b;if(i<j){[re[i],re[j]]=[re[j],re[i]];[im[i],im[j]]=[im[j],im[i]];}}
  for(let len=2;len<=n;len<<=1){const a=-2*Math.PI/len,wr=Math.cos(a),wi=Math.sin(a);for(let i=0;i<n;i+=len){let cr=1,ci=0;for(let j=0;j<len/2;j++){const ur=re[i+j],ui=im[i+j],vr=re[i+j+len/2]*cr-im[i+j+len/2]*ci,vi=re[i+j+len/2]*ci+im[i+j+len/2]*cr;re[i+j]=ur+vr;im[i+j]=ui+vi;re[i+j+len/2]=ur-vr;im[i+j+len/2]=ui-vi;const t=cr*wr-ci*wi;ci=cr*wi+ci*wr;cr=t;}}}}
S.fft=fft;
const INF=[[0,0,4],[40,11,84],[101,21,110],[159,42,99],[212,72,66],[245,125,21],[250,193,39],[252,255,164]];
const cmap=v=>{v=Math.max(0,Math.min(1,v))*(INF.length-1);const i=Math.floor(v),f=v-i,a=INF[i],b=INF[Math.min(INF.length-1,i+1)];return [a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f,a[2]+(b[2]-a[2])*f];};
/* spectrogram (STFT, log magnitude, 0–maxHz) */
S.drawSpectrogram=(cv,x,opts={})=>{const {g,W,H,dpr}=prep(cv);const d=mono(x),sr=rateOf(x),N=512,maxHz=opts.maxHz||5000;const cols=Math.min(W,Math.max(1,Math.floor(d.length/128)));const hop=Math.max(1,Math.floor((d.length-N)/cols));
  const bins=Math.floor(N/2*maxHz/(sr/2));const img=g.createImageData(cols,bins);const win=new Float32Array(N).map((_,i)=>0.5-0.5*Math.cos(2*Math.PI*i/(N-1)));const mags=[];let mx=-1e9;
  for(let c=0;c<cols;c++){const re=new Float32Array(N),im=new Float32Array(N);for(let i=0;i<N;i++)re[i]=(d[c*hop+i]||0)*win[i];fft(re,im);const col=new Float32Array(bins);for(let b=0;b<bins;b++){col[b]=Math.log10(1e-6+Math.hypot(re[b],im[b]));if(col[b]>mx)mx=col[b];}mags.push(col);}
  for(let c=0;c<cols;c++)for(let b=0;b<bins;b++){const v=(mags[c][b]-(mx-3.2))/3.2;const [r,gg,bb]=cmap(v);const o=((bins-1-b)*cols+c)*4;img.data[o]=r;img.data[o+1]=gg;img.data[o+2]=bb;img.data[o+3]=255;}
  const tmp=document.createElement('canvas');tmp.width=cols;tmp.height=bins;tmp.getContext('2d').putImageData(img,0,0);g.imageSmoothingEnabled=true;g.drawImage(tmp,0,0,W,H);
  if(opts.axis!==false){g.fillStyle='rgba(233,238,252,.8)';g.font=`${10*dpr}px "JetBrains Mono",monospace`;[1000,2000,3000,4000].filter(f=>f<maxHz).forEach(f=>{const y=H-f/maxHz*H;g.fillRect(0,y,5*dpr,1);g.fillText((f/1000)+'kHz',7*dpr,y+4*dpr);});}};
/* live oscilloscope + spectrum bars from an AnalyserNode; returns stop() */
S.liveScope=(cv,an,opts={})=>{let raf=0;const t=new Float32Array(an.fftSize),f=new Uint8Array(an.frequencyBinCount);
  const draw=()=>{const {g,W,H}=prep(cv);an.getFloatTimeDomainData(t);an.getByteFrequencyData(f);g.fillStyle='#060b1d';g.fillRect(0,0,W,H);
    const nb=64;for(let i=0;i<nb;i++){const v=f[Math.floor(i*f.length/nb/3)]/255;const [r,gg,b]=cmap(v);g.fillStyle=`rgb(${r|0},${gg|0},${b|0})`;g.fillRect(i*W/nb+1,H-v*H*0.9,W/nb-2,v*H*0.9);}
    g.strokeStyle=opts.color||css('--cyan');g.lineWidth=2;g.beginPath();for(let i=0;i<t.length;i+=4){const x=i/t.length*W,y=H/2-t[i]*H*0.45;i?g.lineTo(x,y):g.moveTo(x,y);}g.stroke();raf=requestAnimationFrame(draw);};
  draw();return ()=>cancelAnimationFrame(raf);};
/* pitch curve(s): series=[{pitch:[{t,f0}],color,label}] */
S.drawPitch=(cv,series,opts={})=>{const {g,W,H,dpr}=prep(cv);g.fillStyle='#060b1d';g.fillRect(0,0,W,H);const lo=opts.lo||70,hi=opts.hi||450;let T=opts.dur||0;series.forEach(s=>s.pitch.forEach(p=>T=Math.max(T,p.t)));T=T||1;
  g.strokeStyle='#1f2b57';g.fillStyle='#8a97c7';g.font=`${10*dpr}px "JetBrains Mono",monospace`;[100,200,300,400].forEach(f=>{const y=H-(f-lo)/(hi-lo)*H;g.beginPath();g.moveTo(0,y);g.lineTo(W,y);g.stroke();g.fillText(f+'Hz',4*dpr,y-3*dpr);});
  series.forEach(s=>{g.fillStyle=s.color||css('--cyan');s.pitch.forEach(p=>{if(!p.f0)return;g.beginPath();g.arc(p.t/T*W,H-(p.f0-lo)/(hi-lo)*H,2.2*dpr,0,7);g.fill();});});};

/* ---------- "recordings" for demo mode: a speech-like signal so waveforms and spectrograms look real ---------- */
/* text -> Float32Array at 16 kHz. rate = syllables/s, clarity 0..1 (low = mushy formants), f0 = voice pitch */
S.synthSpeech=(text,{rate=4,clarity=1,f0=220,seed=1,sr=16000,gapEvery=7}={})=>{let a=seed*9301+49297;const rnd=()=>{a=(a*9301+49297)%233280;return a/233280;};
  const chars=[...String(text)].filter(c=>/\S/.test(c));const syl=1/rate;const n=Math.ceil((chars.length*syl+0.6)*sr);const out=new Float32Array(n);let t0=0.3;
  chars.forEach((ch,i)=>{const punct=/[，。！？、；：,.!?]/.test(ch);if(punct){t0+=syl*1.6;return;}const s=Math.floor(t0*sr),L=Math.floor(syl*0.82*sr);
    const F1=500+rnd()*500,F2=1100+rnd()*1400,F3=2500+rnd()*600,tone=(ch.charCodeAt(0)%4);let ph=0;
    for(let k=0;k<L&&s+k<n;k++){const u=k/L,env=Math.sin(Math.PI*Math.min(1,u*1.15))**0.7;const contour=[0,0.12*u,-0.1*Math.sin(Math.PI*u),-0.15*u][tone];const f=f0*(1+contour+0.02*Math.sin(6*k/sr));ph+=2*Math.PI*f/sr;
      let v=0;for(let h=1;h<=24;h++){const fh=h*f;if(fh>7000)break;const amp=Math.exp(-((fh-F1)**2)/(2*(120/clarity)**2))+0.7*Math.exp(-((fh-F2)**2)/(2*(180/clarity)**2))+0.35*Math.exp(-((fh-F3)**2)/(2*(260/clarity)**2))+0.04;v+=amp*Math.sin(h*ph)/h**0.3;}
      if(u<0.12&&/[zcsxqjtpkfh]/i.test(ch.normalize('NFD')))v+=(rnd()*2-1)*0.6*(1-u/0.12);out[s+k]+=v*env*0.12;}
    t0+=syl;if(gapEvery&&(i+1)%gapEvery===0)t0+=syl*0.5;});
  return out;};
/* add noise / a second voice to a demo signal: kind 'white' | 'babble' | 'market' */
S.mix=(x,{kind='market',level=0.5,seed=3,second}={})=>{const d=new Float32Array(x);let a=seed;const rnd=()=>{a=(a*9301+49297)%233280;return a/233280;};const sr=16000;
  for(let i=0;i<d.length;i++){let nz=(rnd()*2-1)*0.04;if(kind!=='white'){nz*=0.6+0.4*Math.sin(i/sr*2*Math.PI*3.1+Math.sin(i/sr*0.7)*3);if(kind==='market'&&((i/sr)%3.3)<0.25)nz+=0.08*Math.sin(2*Math.PI*620*i/sr);}d[i]+=nz*level*2.2;}
  if(second){for(let i=0;i<Math.min(d.length,second.length);i++)d[i]+=second[i]*level*0.9;}return d;};
/* wrap a Float32Array (16 kHz) as {getChannelData,sampleRate,duration} so drawing helpers accept it */
S.asBuffer=(arr,sr=16000)=>({sampleRate:sr,duration:arr.length/sr,length:arr.length,getChannelData:()=>arr});

/* ---------- background noise you can actually hear (Web Audio, generated) ---------- */
S.noise=(kind='market',{gain=0.25}={})=>{const ac=S.ctx();if(!ac)return null;const len=ac.sampleRate*2,b=ac.createBuffer(1,len,ac.sampleRate),d=b.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1;
  const src=ac.createBufferSource();src.buffer=b;src.loop=true;const out=ac.createGain();out.gain.value=gain;const nodes=[src,out];
  if(kind==='white'){src.connect(out);}else{const voices=kind==='market'?5:3;for(let v=0;v<voices;v++){const bp=ac.createBiquadFilter();bp.type='bandpass';bp.frequency.value=300+v*350;bp.Q.value=1.4;const am=ac.createGain();am.gain.value=0.3;
      const lfo=ac.createOscillator();lfo.frequency.value=2.6+v*0.9;const lg=ac.createGain();lg.gain.value=0.28;lfo.connect(lg).connect(am.gain);lfo.start();src.connect(bp).connect(am).connect(out);nodes.push(bp,am,lfo,lg);}
    if(kind==='market'){const o=ac.createOscillator();o.type='square';o.frequency.value=520;const og=ac.createGain();og.gain.value=0;o.connect(og).connect(out);o.start();nodes.push(o,og);const beep=setInterval(()=>{const t=ac.currentTime;og.gain.setValueAtTime(0.05,t);og.gain.setValueAtTime(0,t+0.18);},3300);nodes.push({stop:()=>clearInterval(beep)});}}
  out.connect(ac.destination);src.start();const h={stop(){nodes.forEach(n=>{try{n.stop&&n.stop();}catch(e){}try{n.disconnect&&n.disconnect();}catch(e){}});live.delete(h);},setGain(v){out.gain.value=v;}};live.add(h);return h;};

/* ---------- speech synthesis (built into Windows / macOS / ChromeOS browsers) ---------- */
S.ttsSupported=()=>'speechSynthesis' in window;
S.voices=(lang='zh')=>new Promise(res=>{if(!S.ttsSupported())return res([]);const pick=()=>speechSynthesis.getVoices().filter(v=>!lang||v.lang.toLowerCase().startsWith(lang));let v=pick();if(v.length)return res(v);
  const t=setTimeout(()=>res(pick()),1500);speechSynthesis.onvoiceschanged=()=>{clearTimeout(t);res(pick());};});
/* say(text,{voice,rate,pitch,volume,lang,onBoundary(charIndex)}) -> {stop, done} */
S.say=(text,o={})=>{if(!S.ttsSupported())return null;speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang=o.lang||(o.voice&&o.voice.lang)||'zh-CN';if(o.voice)u.voice=o.voice;u.rate=o.rate||1;u.pitch=o.pitch==null?1:o.pitch;u.volume=o.volume==null?1:o.volume;
  if(o.onBoundary)u.onboundary=e=>o.onBoundary(e.charIndex);const done=new Promise(r=>{u.onend=()=>r(true);u.onerror=()=>r(false);});speechSynthesis.speak(u);return {stop(){speechSynthesis.cancel();},done};};
/* speak with the best engine available: platform API / desktop GPT voice, else the browser voice */
S.speak=async(text,o={})=>{const AI=App.AI;if(AI&&AI.speechAudio){try{const url=await AI.speechAudio(text,o);if(url){const a=new Audio(url);a.playbackRate=o.rate||1;live.add(a);a.onended=()=>live.delete(a);await a.play();return {stop(){a.pause();},done:new Promise(r=>a.addEventListener('ended',()=>r(true))),engine:'ai',url};}}catch(e){}}
  const h=S.say(text,o);return h?Object.assign(h,{engine:'browser'}):null;};

/* ---------- text comparison ---------- */
/* character alignment of reference vs hypothesis (punctuation and spaces ignored): [{op:'eq'|'sub'|'del'|'ins',r,h}] */
S.norm=s=>[...String(s||'')].filter(c=>!/[\s，。！？、；：“”‘’（）《》,.!?;:"'()\-—…·]/.test(c));
S.diff=(ref,hyp)=>{const a=S.norm(ref),b=S.norm(hyp),n=a.length,m=b.length;const D=Array.from({length:n+1},(_,i)=>{const r=new Int32Array(m+1);r[0]=i;return r;});for(let j=0;j<=m;j++)D[0][j]=j;
  for(let i=1;i<=n;i++)for(let j=1;j<=m;j++)D[i][j]=Math.min(D[i-1][j]+1,D[i][j-1]+1,D[i-1][j-1]+(a[i-1]===b[j-1]?0:1));
  const ops=[];let i=n,j=m;while(i>0||j>0){if(i>0&&j>0&&D[i][j]===D[i-1][j-1]+(a[i-1]===b[j-1]?0:1)){ops.push({op:a[i-1]===b[j-1]?'eq':'sub',r:a[i-1],h:b[j-1]});i--;j--;}else if(i>0&&D[i][j]===D[i-1][j]+1){ops.push({op:'del',r:a[i-1],h:''});i--;}else{ops.push({op:'ins',r:'',h:b[j-1]});j--;}}
  return ops.reverse();};
/* accuracy 0..100 = 1 - character error rate */
S.accuracy=(ref,hyp)=>{const ops=S.diff(ref,hyp),n=S.norm(ref).length||1;const err=ops.filter(o=>o.op!=='eq').length;return Math.max(0,Math.round(100*(1-err/n)));};
/* render a diff as two aligned lines of chips */
S.diffHTML=(ops)=>{const e=App.esc;const cell=(c,cls)=>`<span class="dc ${cls}">${c?e(c):'∅'}</span>`;
  return `<div class="diff"><div class="dl"><span class="dk">原文</span>${ops.map(o=>cell(o.r,o.op)).join('')}</div><div class="dl"><span class="dk">AI</span>${ops.map(o=>cell(o.h,o.op)).join('')}</div></div>`;};
})();
