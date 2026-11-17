/* 我的能力图谱 + 学情分析（教师） */
(function(){
const {$,$$,h,esc,clamp,DIMS,LS}=App;
const unitLES=u=>(App.UNITS.find(x=>x.id===u)||App.UNITS[0]).lessons;
const NEXT={principle:'回到每一讲的「知识讲解」，试着用自己的话讲给同桌听：AI 是怎么认图、画图、做视频的。',experiment:'在找茬实验室里每次只改变一个条件（只调模糊、或只调遮挡），看看哪个条件最影响 AI。',
 prompt:'写提示词时加上“什么样的、在哪里、什么颜色、什么镜头”，一次加一个细节，对比画面的变化。',critical:'每次看到 AI 的结果，都问一问：它哪里可能错了？为什么？',
 creative:'选一句自己最喜欢的诗，做一幅画和一段视频，并说说你为什么这样设计。',ethics:'记住三件事：不上传个人信息；AI 作品要标注；最后由人来判断好不好。'};
const lvl=v=>v==null?'—':v>=85?'★★★★★':v>=70?'★★★★':v>=55?'★★★':v>=35?'★★':'★';
const heatColor=v=>v==null?'transparent':v>=80?'#86df5c':v>=60?'#b7e86a':v>=40?'#ffd36b':v>=20?'#ffa77a':'#ff7d93';

/* ---------- radar ---------- */
function radar(series,size=340){const cx=size/2,cy=size/2+6,R=size*0.34,n=DIMS.length;const pt=(i,v)=>{const a=-Math.PI/2+i*2*Math.PI/n;return [cx+Math.cos(a)*R*v/100,cy+Math.sin(a)*R*v/100];};
 let s=`<svg viewBox="0 0 ${size} ${size+12}" role="img" aria-label="六维能力雷达图" style="width:100%;max-width:${size+40}px;display:block;margin:0 auto">`;
 [20,40,60,80,100].forEach(r=>{s+=`<polygon points="${DIMS.map((_,i)=>pt(i,r).join(',')).join(' ')}" fill="none" stroke="rgba(27,37,80,${r===100?.35:.14})" stroke-width="1"/>`;});
 DIMS.forEach((d,i)=>{const[x,y]=pt(i,100);s+=`<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="rgba(27,37,80,.14)"/>`;const[lx,ly]=pt(i,126);s+=`<text x="${lx}" y="${ly+4}" text-anchor="middle" font-size="13" fill="#1b2550" font-weight="700" font-family="Noto Sans SC,sans-serif">${d.n}</text>`;});
 series.forEach(se=>{const pts=DIMS.map((d,i)=>pt(i,se.vals[d.k]??0).join(',')).join(' ');s+=`<polygon points="${pts}" fill="${se.color}" fill-opacity="${se.fill??0.22}" stroke="${se.color}" stroke-width="2" ${se.dash?'stroke-dasharray="5 4"':''}/>`;
  if(se.dots!==false)DIMS.forEach((d,i)=>{const[x,y]=pt(i,se.vals[d.k]??0);s+=`<circle cx="${x}" cy="${y}" r="3.5" fill="${se.color}"/>`;});});
 return s+'</svg>';}
App.radar=radar;
function legend(items){return `<div class="row" style="justify-content:center;gap:16px;font-size:13px">${items.map(([c,n,dash])=>`<span class="row" style="gap:6px"><svg width="22" height="10"><line x1="0" y1="5" x2="22" y2="5" stroke="${c}" stroke-width="3" ${dash?'stroke-dasharray="4 3"':''}/></svg>${n}</span>`).join('')}</div>`;}
function classAvg(cls,excludeId){const recs=Object.values(currentAll()).filter(r=>App.classOf(r.id)===cls&&r.id!==excludeId&&App.engagement(r)>0);const out={};DIMS.forEach(d=>{const v=recs.map(r=>App.scoreAll(r)[d.k]).filter(x=>x!=null);out[d.k]=v.length?Math.round(v.reduce((a,b)=>a+b,0)/v.length):null;});return{avg:out,n:recs.length};}

/* ---------- personal map (used by 我的能力图谱 and the teacher's student drawer) ---------- */
function personal(rec,opts={}){const sc=App.scoreAll(rec),cls=App.classOf(rec.id),ca=opts.classAvg||classAvg(cls,rec.id);const eng=App.engagement(rec);
 const got=DIMS.filter(d=>sc[d.k]!=null);const top=[...got].sort((a,b)=>sc[b.k]-sc[a.k]).slice(0,2),low=[...got].sort((a,b)=>sc[a.k]-sc[b.k])[0];
 const L1=rec.lessons.l1||{},L2=rec.lessons.l2||{},L3=rec.lessons.l3||{};
 const works=[];if(L2.best&&L2.best.thumb)works.push({img:L2.best.thumb,t:'我的第一幅 AI 画',s:L2.best.prompt});
 const good=(L1.rows||[]).find(r=>r.ok===true&&r.thumb),bad=(L1.rows||[]).find(r=>r.ok===false&&r.thumb);if(good)works.push({img:good.thumb,t:'AI 认对了',s:`${App.lessons.l1.condText(good.c)} → ${good.label}`});if(bad)works.push({img:bad.thumb,t:'AI 认错了',s:`${App.lessons.l1.condText(bad.c)} → ${bad.label}`});
 const tv=(L3.t2v||[]).slice(-1)[0];if(tv&&tv.thumb)works.push({img:tv.thumb,t:'我的诗句视频',s:tv.prompt||'诗句电影棚'});
 App.LESSON_KEYS.forEach(k=>{const L=App.lessons[k];if(L&&L.works){try{(L.works(rec.lessons[k]||{})||[]).forEach(w=>works.push(w));}catch(e){}}});
 const dq=[['l1','我的 AI 初认识',[['fast','AI 什么时候又快又准'],['wrong','AI 什么时候会看错'],['careful','哪些场景要小心'],['idea','好主意与心得']]],['l2','我的第一幅 AI 画',[['why','为什么选这句诗'],['better','AI 表达得好与不好'],['how','怎样更贴近想法'],['next','还想画什么']]],['l3','让画面动起来',[['feature','图生视频与文生视频'],['improve','AI 有待提升'],['role','人和 AI 谁说了算'],['idea','创作说明']]],
  ...App.LESSON_KEYS.filter(k=>App.lessons[k]&&App.lessons[k].diaryQ).map(k=>[k,App.lessons[k].diaryTitle||App.lessonInfo(k).n,App.lessons[k].diaryQ])];
 return `<div class="grid2"><div class="box"><div class="box-t">六维能力图谱</div>${radar([...(ca.n?[{vals:ca.avg,color:'#7d5cf0',fill:0.08,dash:true,dots:false}]:[]),{vals:sc,color:'#2f6bff'}])}${legend([['#2f6bff',opts.self?'我':esc(rec.name||'该生')],...(ca.n?[['#7d5cf0',`班级平均（${ca.n} 人）`,1]]:[])])}</div>
  <div style="display:flex;flex-direction:column;gap:10px">${DIMS.map(d=>`<div class="hbar"><span><b>${d.n}</b> <span class="note">${d.s}</span></span><span class="tr"><i style="width:${sc[d.k]??0}%;background:${heatColor(sc[d.k])}"></i></span><span>${sc[d.k]??'—'}</span></div>`).join('')}
   <div class="sep"></div><div class="row" style="justify-content:space-between"><span class="note">学习投入（三讲完成度）</span><b style="font-family:var(--f-display);font-weight:400;font-size:22px">${eng}%</b></div>
   ${top.length?`<div class="verdict"><b style="color:var(--green)">我的闪光点：</b>${top.map(d=>`${d.n}（${lvl(sc[d.k])}）`).join('、')}</div>`:''}
   ${low?`<div class="verdict"><b style="color:var(--amber)">下一步可以试试：</b>${NEXT[low.k]}</div>`:''}</div></div>
  ${App.UNITS.map(u=>`<div class="box-t" style="margin:4px 0 -6px">${u.no} · ${u.name}　<span class="note">完成 ${App.engagement(rec,u.id)}%</span></div><div class="grid3">${u.lessons.map(l=>{const p=Math.round(App.progress(l.k,rec)*100),s=App.scoreLesson(l.k,rec);return `<div class="box"><div class="box-t">${l.n}</div><div class="hbar" style="grid-template-columns:60px 1fr 44px"><span>完成度</span><span class="tr"><i style="width:${p}%;background:var(--green)"></i></span><span>${p}%</span></div>${p>0?DIMS.filter(d=>s[d.k]!=null).map(d=>`<div class="hbar" style="grid-template-columns:60px 1fr 44px;font-size:12px;padding:2px 0"><span class="note">${d.n.slice(0,2)}</span><span class="tr"><i style="width:${s[d.k]}%;background:${heatColor(s[d.k])}"></i></span><span class="note">${s[d.k]}</span></div>`).join(''):'<p class="note">还没开始</p>'}</div>`;}).join('')}</div>`).join('')}
  <div><h3 style="margin-bottom:10px">作品墙</h3>${works.length?`<div class="works">${works.map(w=>`<div class="work"><div class="th">${w.img?`<img src="${w.img}" alt="">`:`<div class="th-txt">${esc(w.glyph||'♪')}</div>`}</div><p><b style="color:var(--fg)">${esc(w.t)}</b><br>${esc(w.s||'')}</p></div>`).join('')}</div>`:'<div class="empty">完成各讲的实验后，作品会自动出现在这里。</div>'}</div>
  <div><h3 style="margin-bottom:10px">成长日记</h3><div class="grid3">${dq.map(([k,t,f])=>{const d=(rec.lessons[k]||{}).diary||{};return `<div class="diary"><div class="box-t">「${t}」${d.submitted?'<span class="pill ok">已提交</span>':'<span class="pill warn">未提交</span>'}</div>${f.map(([id,q])=>d[id]?`<div class="qa"><b>${q}</b>${esc(d[id])}</div>`:'').join('')||'<p class="note">还没有写。</p>'}</div>`;}).join('')}</div></div>`;}

App.renderMe=function(){const v=$('#v-me');if(!App.rec){v.innerHTML='<div class="empty">请先选择班级和学号进入实验室。</div>';return;}
 let body;try{body=personal(App.rec,{self:true});}catch(e){console.error(e);body='<div class="empty">图谱暂时没能显示，请刷新页面再试。</div>';}
 v.innerHTML=`<div class="station-head"><span class="eyebrow" style="color:var(--green);font-size:13px;letter-spacing:.12em">AI 小实验室 · 我的学习档案</span><h1>${esc(App.rec.name)} 的能力图谱</h1><p class="note">${App.className(App.classOf(App.rec.id))} ${App.rec.no} 号 · 每完成一个实验、一道小测或一篇成长日记，图谱都会更新。</p><div class="row" style="margin-top:10px"><button class="btn ghost sm" type="button" id="me-export">导出我的学习记录</button><span class="note">把导出的文件交给老师，老师在「学情分析」里导入，就能汇总全班的图谱。</span></div></div>${body}`;
 $('#me-export').onclick=()=>App.exportRecs([App.rec],`AI小实验室_${App.className(App.classOf(App.rec.id))}_${App.rec.no}号_${App.rec.name||''}.json`);};
/* ---------- record files: lets separate computers (desktop app, no shared database) build one class view ---------- */
App.exportRecs=(recs,name)=>{const blob=new Blob([JSON.stringify({app:'ai-lab',version:2,exported:Date.now(),records:recs},null,1)],{type:'application/json'});
 const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name.replace(/[\\/:*?"<>|]/g,'_');document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},1000);};
App.importRecs=async files=>{let ok=0,bad=0,cls=null;const loc=LS.get('ailab.records',{});
 for(const f of files){try{const j=JSON.parse(await f.text());const list=Array.isArray(j)?j:Array.isArray(j.records)?j.records:j.id?[j]:[];if(!list.length){bad++;continue;}
  list.forEach(r=>{if(!r||typeof r.id!=='string'||!/^g\d+c\d+-\d+$/.test(r.id))return;App.fixRec(r);const old=App.all[r.id]||loc[r.id];if(old&&(old.updated||0)>(r.updated||0))return;
   if(App.rec&&r.id===App.rec.id)return;loc[r.id]=r;App.all[r.id]=r;ok++;cls=App.classOf(r.id);if(App.db)App.db.doc('students/'+r.id).set(JSON.parse(JSON.stringify(r))).catch(()=>{});});}catch(e){bad++;}}
 LS.set('ailab.records',loc);return {ok,bad,cls};};
App.on(()=>{if(App.current==='me')App.renderMe();if(App.current==='class')App.renderClass();});

/* ---------- demo class (clearly marked, generated in the browser, never saved) ---------- */
const NICK=['小禾','安安','乐乐','朵朵','小宇','果果','天天','豆豆','小满','一一','米粒','阳阳','小北','糖糖','可可','嘉嘉','小舟','晴晴','多多','小林','西西','航航','小雨','皮皮','月月','小川','欣欣','浩浩','圆圆','小树','星星','跳跳','小鹿','悠悠','诺诺','小石'];
function demoClass(){if(demoClass.c)return demoClass.c;let a=20251;const r=()=>{a=(a*1103515245+12345)%2147483648;return a/2147483648;};const pick=p=>r()<p;const str=n=>'这是示例文字'.repeat(Math.max(0,Math.round(n/6)));const q=(p,a)=>{const ok=pick(p);return{first:ok?a:(a+1)%3,ok,last:a};};
 const out={};NICK.forEach((nm,i)=>{const t=0.25+r()*0.7,att=r();const id=`demo-${String(i+1).padStart(2,'0')}`;const L1={},L2={},L3={};
  const go1=att>0.05,go2=att>0.15,go3=att>0.3;
  if(go1){L1.recog=Array.from({length:1+Math.floor(r()*5)},(_,j)=>({key:['cat','coffee','rocket','flower','apple'][j%5],label:'x'}));const nr=Math.floor(t*9*r()+t*3);
   L1.rows=Array.from({length:nr},()=>{const c={blur:pick(.6)?Math.floor(r()*12):0,occ:pick(.5)?Math.floor(r()*14)*5:0,rot:pick(.25)?90:0,dark:pick(.3)?60:0,pix:pick(.35)?12:1};const d=App.AI.degree(c);return{c,ok:pick(t+.1)?(d<0.75):null,label:'x',conf:50,thumb:''};});
   L1.track={played:true,paused:2,answers:{t1:q(.85,0),t2:q(t,1),t3:q(t,0),t4:q(t+.1,0)},thr:pick(t)?{40:1,60:1,90:1}:{60:1}};L1.views={px:pick(.8),fm:pick(t+.2)};L1.scans=pick(t+.1)?[{var:['blur','occ','dark'][Math.floor(r()*3)],failAt:Math.round(4+r()*8)}]:[];L1.scene={answer:pick(t)?str(20+40*t):''};L1.quiz={q1:q(.6+t*.4,1),q2:q(.5+t*.5,1),q3:q(.4+t*.5,1),q4:q(.3+t*.6,0),q5:q(.75+t*.25,2)};
   L1.diary={fast:str(30*t+r()*20),wrong:str(30*t),careful:str(20*t+10),idea:str(35*t),pledge:pick(.8),submitted:pick(t+.2)?1:0};}
  if(go2){const ng=1+Math.floor(r()*6*t+1);L2.gens=Array.from({length:ng},(_,j)=>({nf:Math.min(j,Math.floor(5*t+1)),prompt:'',thumb:''}));L2.cmp=pick(t);L2.label={ex:1,im:pick(.8),q:{lq1:{ok:pick(.9)},lq2:{ok:pick(.4+t*.5)}}};L2.best=pick(t+.2)?{prompt:'',thumb:''}:null;
   L2.styles={tried:pick(.8)?['ink','oil','water']:['ink'],vote:pick(.8)?['ink','ink','ink','oil','water'][Math.floor(r()*5)]:null,reason:str(30*t)};
   L2.guess={bm:q(.4+t*.6,0),bs:q(.3+t*.6,1),pd:q(.2+t*.6,2)};['bm','bs','pd'].forEach(k=>{L2.guess[k].first=L2.guess[k].ok?[0,1,2][['bm','bs','pd'].indexOf(k)]:3;if(pick(t))L2.guess[k].fix=str(20);});
   L2.quiz={q1:q(.5+t*.5,1),q2:q(.35+t*.55,1),q3:q(.6+t*.4,2),q4:q(.3+t*.6,1),q5:q(.75+t*.25,1)};L2.diary={why:str(30*t+10),better:str(30*t),how:str(25*t),next:str(15),pledge:pick(.85),submitted:pick(t+.15)?1:0};}
  if(go3){L3.flip={max:pick(.85)?24:6};L3.i2v={ran:1,match:Math.round(40+t*60*r()),nat:pick(.8)?0:1};L3.t2v=Array.from({length:1+Math.floor(r()*4*t+.5)},(_,j)=>({cam:{shot:j?'far':null,move:j>1?'push':null,slow:j>1&&pick(t),style:j?'ink':null,els:j>2?['moonrise']:[]},prompt:'',thumb:''}));L3.cmp=L3.t2v.length>1;
   const f=pick(.35+t*.6)?'A':['B','C','D'][Math.floor(r()*3)];L3.dir={first:f,pick:'A',reason:str(30*t),who:'human',whoFirst:pick(.55+t*.4)?'human':'ai'};L3.quiz={q1:q(.6+t*.4,1),q2:q(.4+t*.5,1),q3:q(.4+t*.5,1),q4:q(.6+t*.4,1),q5:q(.6+t*.4,1)};
   L3.diary={feature:str(30*t),improve:str(25*t),role:str(30*t),idea:str(30*t),pledge:pick(.8),submitted:pick(t)?1:0};}
  const more={};App.LESSONS.filter(l=>l.unit!=='u1').forEach((l,j)=>{const L=App.lessons[l.k];if(L&&L.demo&&att>0.05+(j%3)*0.1){try{more[l.k]=L.demo(r,t);}catch(e){console.warn(e);}}});
  out[id]={id,name:nm,no:i+1,grade:5,cls:0,updated:Date.now(),lessons:Object.assign({l1:L1,l2:L2,l3:L3},more),demo:true};});
 return demoClass.c=out;}
App.demoClass=demoClass;
let selCls=null,selUnit=null;
function currentAll(){return App.all||{};}

App.renderClass=function(){const v=$('#v-class');const all=currentAll();const groups={};Object.values(all).forEach(r=>{const c=App.classOf(r.id);(groups[c]=groups[c]||[]).push(r);});
 const classes=Object.keys(groups).sort();if(!selCls)selCls=App.rec?App.classOf(App.rec.id):classes[0]||'demo';if(selCls!=='demo'&&!groups[selCls])selCls=classes[0]||'demo';
 const isDemo=selCls==='demo';const recs=isDemo?Object.values(demoClass()):groups[selCls]||[];
 if(!selUnit)selUnit=App.unit||'u1';const U=App.UNITS.find(u=>u.id===selUnit)||App.UNITS[0];const LES=U.lessons.filter(l=>App.lessons[l.k]);const ks=LES.map(l=>l.k);const u1=selUnit==='u1';
 const opts=classes.map(c=>`<option value="${c}" ${c===selCls?'selected':''}>${App.className(c)}（${groups[c].length} 人）</option>`).join('')+`<option value="demo" ${isDemo?'selected':''}>示例班级（36 人，演示数据）</option>`;
 const active=recs.filter(r=>App.engagement(r,selUnit)>0);const scores=Object.fromEntries(recs.map(r=>[r.id,App.scoreAll(r,selUnit)]));
 const avg={};DIMS.forEach(d=>{const vals=active.map(r=>scores[r.id][d.k]).filter(x=>x!=null);avg[d.k]=vals.length?Math.round(vals.reduce((a,b)=>a+b,0)/vals.length):null;});
 const eng=active.length?Math.round(active.reduce((a,r)=>a+App.engagement(r,selUnit),0)/active.length):0;
const diaries=recs.reduce((a,r)=>a+ks.filter(k=>((r.lessons[k]||{}).diary||{}).submitted).length,0);
 const exps=u1?recs.reduce((a,r)=>a+((r.lessons.l1||{}).recog||[]).length+((r.lessons.l1||{}).rows||[]).length+((r.lessons.l2||{}).gens||[]).length+((r.lessons.l3||{}).t2v||[]).length,0):recs.reduce((a,r)=>a+ks.reduce((b,k)=>{const L=App.lessons[k];try{return b+(L.expCount?L.expCount(r.lessons[k]||{}):0);}catch(e){return b;}},0),0);
 // funnel
 const fun=LES.map(l=>{const st=x=>(x.lessons[l.k]||{});return{n:l.n,steps:[['开始',recs.filter(r=>App.progress(l.k,r)>0).length],['完成一半实验',recs.filter(r=>App.progress(l.k,r)>=0.5).length],['完成小测',recs.filter(r=>Object.keys(st(r).quiz||{}).length>=4).length],['提交日记',recs.filter(r=>(st(r).diary||{}).submitted).length]]};});
 // quiz items
 const items=[];LES.forEach(l=>(App.lessons[l.k].quiz||[]).forEach(qq=>{const ans=recs.map(r=>((r.lessons[l.k]||{}).quiz||{})[qq.id]).filter(Boolean);if(ans.length)items.push({l:l.k,q:qq.q,rate:Math.round(100*ans.filter(a=>a.ok).length/ans.length),n:ans.length,why:qq.why});}));items.sort((a,b)=>a.rate-b.rate);
 // AI error conditions
 const cond={blur:0,occ:0,rot:0,dark:0,pix:0,noise:0};let wrongN=0;recs.forEach(r=>((r.lessons.l1||{}).rows||[]).filter(x=>x.ok===false).forEach(x=>{wrongN++;const s={blur:(x.c.blur||0)/12,occ:(x.c.occ||0)/70,rot:(x.c.rot||0)/180,dark:(x.c.dark||0)/90,pix:((x.c.pix||1)-1)/23,noise:(x.c.noise||0)/80};const w=Object.keys(s).sort((a,b)=>s[b]-s[a])[0];cond[w]++;}));
 const cn={blur:'模糊',occ:'遮挡',rot:'旋转',dark:'变暗',pix:'变远',noise:'噪点'};
 const dirFirst={A:0,B:0,C:0,D:0};let whoH=0,whoN=0;recs.forEach(r=>{const d=(r.lessons.l3||{}).dir||{};if(d.first)dirFirst[d.first]++;if(d.whoFirst){whoN++;if(d.whoFirst==='human')whoH++;}});
 // attention
 const attn=recs.map(r=>{const s=scores[r.id],e=App.engagement(r,selUnit);const lows=DIMS.filter(d=>s[d.k]!=null&&s[d.k]<40).map(d=>d.n);const why=[];if(e<35)why.push(`完成度 ${e}%`);if(lows.length)why.push(lows.join('、')+'偏低');return{r,why,e};}).filter(x=>x.why.length).sort((a,b)=>a.e-b.e).slice(0,8);
 // suggestions
 const sorted=DIMS.filter(d=>avg[d.k]!=null).sort((a,b)=>avg[a.k]-avg[b.k]);const sug=[];
 if(sorted[0])sug.push(`全班最弱的维度是「${sorted[0].n}」（平均 ${avg[sorted[0].k]}）。${NEXT[sorted[0].k]}`);
 if(items[0])sug.push(`正确率最低的题目是“${items[0].q}”（${items[0].rate}%）。下节课用 2 分钟回顾：${items[0].why}`);
 if(u1&&wrongN){const w=Object.keys(cond).sort((a,b)=>cond[b]-cond[a])[0];sug.push(`学生发现 AI 认错最多的条件是「${cn[w]}」。可以请学生展示“AI 认错了”的对比图，讨论“AI 只看表面特征，人会结合常识”。`);}
 if(u1&&whoN&&whoH/whoN<0.8)sug.push(`有 ${whoN-whoH} 名学生第一次选择时认为“AI 做出来的就是最好的”。建议回到导演环节，追问“第 2 版瀑布倒流是谁发现的”，强化“人说了算”。`);
 const unsub=recs.filter(r=>App.engagement(r,selUnit)>0&&!ks.some(k=>((r.lessons[k]||{}).diary||{}).submitted)).length;if(unsub)sug.push(`${unsub} 名学生做了实验但还没有提交任何成长日记，可以留 5 分钟课堂时间补写。`);
 if(!u1)LES.forEach(l=>{const L=App.lessons[l.k];if(L.classSug){try{(L.classSug(recs)||[]).forEach(s=>sug.push(s));}catch(e){console.warn(e);}}});
 const heatRows=recs.slice().sort((a,b)=>(a.no||0)-(b.no||0));
 v.innerHTML=`<div class="row" style="justify-content:space-between;align-items:flex-end"><div><span class="eyebrow" style="color:var(--green);font-size:13px;letter-spacing:.12em">教师端 · ${U.no} ${U.name}</span><h1>学情分析</h1></div>
   <div class="row" style="align-items:flex-end"><label class="f" for="cls-unit" style="min-width:170px">单元<select id="cls-unit">${App.UNITS.map(u=>`<option value="${u.id}" ${u.id===selUnit?'selected':''}>${u.no} ${u.name}</option>`).join('')}</select></label><label class="f" for="cls-sel" style="min-width:240px">选择班级<select id="cls-sel">${opts}</select></label>
   <button class="btn ghost sm" type="button" id="cls-import">导入学生记录</button>${isDemo?'':'<button class="btn ghost sm" type="button" id="cls-export">导出本班记录</button>'}<input type="file" id="cls-file" accept=".json,application/json" multiple hidden></div></div>
  ${isDemo?'<div class="verdict" style="border:1px dashed var(--amber)"><b style="color:var(--amber)">这是示例班级的演示数据</b>，用来展示学情分析页的样子。学生用平台上课后，真实班级会出现在上方的下拉框里。</div>':''}${App.allNote?`<p class="note">${App.allNote}</p>`:''}
  ${!recs.length?'<div class="empty">这个班级还没有学生数据。</div>':`
  <div class="kpis"><div class="kpi"><div class="v">${active.length}<span class="note"> / ${recs.length}</span></div><div class="l">参与学生</div></div><div class="kpi"><div class="v">${eng}%</div><div class="l">平均完成度（三讲）</div></div><div class="kpi"><div class="v">${diaries}</div><div class="l">已提交成长日记（篇）</div></div><div class="kpi"><div class="v">${active.length?Math.round(exps/active.length):0}</div><div class="l">人均 AI 实验次数</div></div></div>
  <div class="grid2"><div class="box"><div class="box-t">班级六维能力（平均）</div>${radar([{vals:avg,color:'#2f6bff'}])}</div>
   <div class="box"><div class="box-t">各讲学习漏斗（人数）</div>${fun.map(f=>`<div style="margin-bottom:10px"><b style="font-size:13.5px">${f.n}</b>${f.steps.map(([n,c])=>`<div class="hbar"><span class="note">${n}</span><span class="tr"><i style="width:${recs.length?100*c/recs.length:0}%;background:var(--cyan)"></i></span><span>${c}</span></div>`).join('')}</div>`).join('')}</div></div>
  <div class="box"><div class="box-t">学生能力热力表（点名字看个人图谱）</div><div class="scroll" style="max-height:460px;overflow:auto"><table class="heat"><thead><tr><th style="text-align:left">学生</th>${DIMS.map(d=>`<th>${d.n}</th>`).join('')}<th>完成度</th><th>日记</th></tr></thead><tbody>
   ${heatRows.map(r=>{const s=scores[r.id];return `<tr><td class="name" data-id="${esc(r.id)}">${r.no||''}号 ${esc(r.name||'')}</td>${DIMS.map(d=>`<td class="c" style="background:${heatColor(s[d.k])}">${s[d.k]??'—'}</td>`).join('')}<td class="c" style="background:${heatColor(App.engagement(r,selUnit))}">${App.engagement(r,selUnit)}%</td><td>${ks.filter(k=>((r.lessons[k]||{}).diary||{}).submitted).length}/${ks.length}</td></tr>`;}).join('')}</tbody></table></div>
   <p class="note" style="margin-top:6px">颜色：<span style="color:#86df5c">■</span> 80 以上 <span style="color:#b7e86a">■</span> 60–79 <span style="color:#ffd36b">■</span> 40–59 <span style="color:#ffa77a">■</span> 20–39 <span style="color:#ff7d93">■</span> 20 以下</p></div>
  <div class="grid2"><div class="box"><div class="box-t">小测逐题正确率（按第一次作答，从低到高）</div>${items.map(i=>`<div class="hbar"><span style="font-size:12.5px">${i.l.toUpperCase()} · ${esc(i.q)}</span><span class="tr"><i style="width:${i.rate}%;background:${heatColor(i.rate)}"></i></span><span>${i.rate}%</span></div>`).join('')||'<p class="note">还没有作答记录。</p>'}</div>
   ${u1?`<div style="display:flex;flex-direction:column;gap:18px"><div class="box"><div class="box-t">学生发现的“AI 认错条件”（找茬实验室，共 ${wrongN} 次）</div>${Object.keys(cond).map(k=>`<div class="hbar"><span>${cn[k]}</span><span class="tr"><i style="width:${wrongN?100*cond[k]/wrongN:0}%;background:var(--red)"></i></span><span>${cond[k]}</span></div>`).join('')}</div>
    <div class="box"><div class="box-t">导演环节：第一次选择发布哪一版</div>${[['A','第 1 版（正常）','var(--green)'],['B','第 2 版（瀑布倒流）','var(--red)'],['C','第 3 版（山在晃）','var(--red)'],['D','第 4 版（云飞太快）','var(--red)']].map(([k,n,c])=>{const t=dirFirst.A+dirFirst.B+dirFirst.C+dirFirst.D;return `<div class="hbar"><span>${n}</span><span class="tr"><i style="width:${t?100*dirFirst[k]/t:0}%;background:${c}"></i></span><span>${dirFirst[k]}</span></div>`;}).join('')}<p class="note">第一次就认同“人说了算”：${whoH}/${whoN} 人</p></div></div>`:`<div style="display:flex;flex-direction:column;gap:18px">${LES.map(l=>{const L=App.lessons[l.k];try{return L.classPanels?L.classPanels(recs):'';}catch(e){console.warn(e);return '';}}).join('')||'<div class="box"><p class="note">暂无本单元的专项统计。</p></div>'}</div>`}</div>
  <div class="grid2"><div class="box"><div class="box-t">需要关注的学生</div>${attn.length?attn.map(a=>`<div class="hbar" style="grid-template-columns:minmax(0,1fr) auto"><span class="name" style="cursor:pointer" data-id="${esc(a.r.id)}">${a.r.no||''}号 ${esc(a.r.name||'')}</span><span class="pill ${a.e<35?'bad':'warn'}">${esc(a.why.join('；'))}</span></div>`).join(''):'<p class="note">暂无。</p>'}</div>
   <div class="box"><div class="box-t">教学建议（根据本班数据自动生成）</div><ol class="sug" style="margin:0;padding-left:20px">${sug.map(s=>`<li>${s}</li>`).join('')}</ol>
    ${App.AI.sample?'<button class="btn ghost sm" type="button" id="cls-ai" style="margin-top:10px">请 AI 再写一份下节课的教学建议</button><div id="cls-ai-out" class="note" style="margin-top:8px;white-space:pre-wrap"></div>':''}</div></div>`}`;
 $('#cls-sel').onchange=e=>{selCls=e.target.value;App.renderClass();};
 $('#cls-unit').onchange=e=>{selUnit=e.target.value;App.renderClass();};
 $('#cls-import').onclick=()=>$('#cls-file').click();
 $('#cls-file').onchange=async e=>{const n=await App.importRecs([...e.target.files]);e.target.value='';if(n.cls)selCls=n.cls;App.toast(n.ok?`已导入 ${n.ok} 名学生的记录`+(n.bad?`，${n.bad} 个文件无法识别`:''):'没有找到可导入的学生记录');App.renderClass();};
 const ce=$('#cls-export');if(ce)ce.onclick=()=>App.exportRecs(recs,`AI小实验室_${App.className(selCls)}_全班记录.json`);
 $$('[data-id]',v).forEach(el=>el.onclick=()=>{const r=recs.find(x=>x.id===el.dataset.id);if(!r)return;const m=App.modal(`<div><div class="row" style="justify-content:space-between"><h2>${esc(r.name||'')} 的能力图谱</h2><button class="btn ghost sm" type="button" data-close>关闭</button></div><div style="display:flex;flex-direction:column;gap:18px;margin-top:12px">${personal(r,{classAvg:{avg,n:active.length}})}</div></div>`,true);$('[data-close]',m.el).onclick=m.close;});
 const ab=$('#cls-ai');if(ab)ab.onclick=async()=>{ab.disabled=true;const out=$('#cls-ai-out');out.textContent='AI 正在阅读本班数据……';
  const data=Object.assign({单元:`${U.no} ${U.name}（${LES.map(l=>l.n).join('、')}）`,人数:recs.length,参与:active.length,六维平均:Object.fromEntries(DIMS.map(d=>[d.n,avg[d.k]])),小测易错题:items.slice(0,3).map(i=>`${i.q}（正确率${i.rate}%）`),自动建议:sug},u1?{AI认错条件:Object.fromEntries(Object.keys(cond).map(k=>[cn[k],cond[k]])),导演首选:dirFirst,第一次认同人说了算:`${whoH}/${whoN}`}:{});
  try{await App.AI.sample(`你是小学人工智能通识课的教研员。下面是某班一个单元的学情数据（单元见数据里的“单元”字段）。请为老师写 4 条具体、可在下节课 5～10 分钟内落实的教学建议，每条一句话说明依据、一句话说明做法。用简体中文，不要客套。\n${JSON.stringify(data)}`,{modelTier:'quick',cache:false,onText:({text})=>{out.textContent=text;}});}catch(e){out.textContent=App.AI.errText(e);}ab.disabled=false;};
};
})();
