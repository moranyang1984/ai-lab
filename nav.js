/* Navigation: course map (sidebar), lesson station list with progress + scroll-spy,
   breadcrumb, mobile drawer and station chips, previous/next lesson. */
(function(){
const {$,$$,esc,LS}=App;
const ICON={
 home:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11l8-6 8 6v8a1 1 0 0 1-1 1h-4v-5H9v5H5a1 1 0 0 1-1-1z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
 me:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l8 5v8l-8 5-8-5V8z M12 8l4 2.5v3L12 16l-4-2.5v-3z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
 cls:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>'};
const short=l=>l.nav.replace(/^第\d+讲\s*/,'');
const numOf=k=>+k.replace(/\D/g,'');

/* ---------- stations of the current lesson ---------- */
let stations=[],activeIdx=-1,observerView=null;
function scanStations(k){const v=$('#v-'+k);if(!v)return [];
  return $$('.station',v).filter(s=>s.id&&$('.st-head h2',s)).map(s=>{const code=($('.st-head .code',s)||{}).textContent||'';const h=$('.st-head h2',s).cloneNode(true);h.querySelectorAll('.tag,.code,.ch').forEach(n=>n.remove());
    let full=h.textContent.replace(/\s+/g,' ').trim();let title=full.split(/[：:]/)[0].trim()||full;const ch=(($('.st-head .ch',s)||{}).textContent||'').trim();
    return {id:s.id,el:s,code:code.trim(),title,full,ch};});}
function stateOf(st){const s=st.el;
  const badge=$('.done-badge',s);if(badge&&badge.textContent.trim())return 1;
  const li=$$('.steps li',s);if(li.length){const d=li.filter(x=>x.classList.contains('done')).length;return d>=li.length?1:d?0.5:0;}
  const qs=$$('.q',s);if(qs.length){const a=qs.filter(q=>$('.fb.ok,.fb.no',q)).length;return a>=qs.length?1:a?0.5:0;}
  return null;}
const dot=v=>v==null?'<span class="dot" style="visibility:hidden"></span>':`<span class="dot ${v>=1?'done':v>0?'half':''}" aria-label="${v>=1?'已完成':v>0?'进行中':'未开始'}"></span>`;
const label=st=>st.code&&/^[A-Z]/.test(st.code)?st.code:'';
function stationListHTML(){return `<ol class="sn-st" aria-label="本讲实验">${stations.map((st,i)=>`<li><a href="#${st.id}" data-st="${i}" title="${esc(st.full)}" class="${i===activeIdx?'on':''}">${dot(stateOf(st))}<span>${label(st)?`<span class="c">${esc(label(st))}</span>`:''}${esc(st.title)}</span></a></li>`).join('')}</ol>`;}
function chipsHTML(){return stations.map((st,i)=>`<a href="#${st.id}" data-st="${i}" class="${i===activeIdx?'on':''}">${dot(stateOf(st))}${esc(st.title.length>9?st.title.slice(0,9)+'…':st.title)}</a>`).join('');}
function wireStationLinks(root){$$('[data-st]',root).forEach(a=>a.onclick=e=>{e.preventDefault();const st=stations[+a.dataset.st];if(!st)return;closeDrawer();const k=App.current;const i=allStations(k).indexOf(st.el);if(i>=0)App.goPage(k,i);});}

/* ---------- one experience per page ----------
   Each lesson shows one station at a time: a stepper on top, previous / next at the bottom.
   Hidden stations stay laid out at full width (absolute, zero height), so charts and canvases keep their size. */
const PG={};const pgKey=k=>'ailab.page.'+k;
function allStations(k){const v=$('#v-'+k);return v?$$(':scope > .station',v):[];}
function pageOf(k){const n=allStations(k).length;let i=PG[k];if(i==null){i=+LS.get(pgKey(k),0)||0;}return Math.max(0,Math.min(i,n-1));}
function stTitle(el){const h=$('.st-head h2',el);if(!h)return '';const c=h.cloneNode(true);c.querySelectorAll('.tag,.code,.ch').forEach(n=>n.remove());const t=c.textContent.replace(/\s+/g,' ').trim();return t.split(/[：:]/)[0].trim()||t;}
function stCode(el){const c=($('.st-head .code',el)||{}).textContent||'';return c.trim();}

/* ---------- lesson flow: 导入 → 知识点一·挑战一·小结 → … → 综合运用 → 反思与总结 ----------
   A lesson module may set L.flow=[{seg,kp?,learn?,sum?,from,to?}]; stations are grouped from each `from`
   up to the next segment's `from`. Knowledge cards go on top of a segment's first station, summary cards
   at the bottom of its last station. */
function flowOf(k,sts){const L=App.lessons&&App.lessons[k];const F=(L&&Array.isArray(L.flow))?L.flow:[];const at=[],first=[];
  if(!F.length)return{at,first};const idx=F.map(f=>sts.findIndex(s=>s.id===f.from));
  sts.forEach((s,j)=>{let g=null,gi=-1;idx.forEach((x,n)=>{if(x>=0&&x<=j&&x>=(gi<0?-1:idx[gi])){g=F[n];gi=n;}});at[j]=g;first[j]=!!g&&idx[gi]===j;});return{at,first};}
function applyFlowCards(k,sts,seg){sts.forEach((s,j)=>{const g=seg.at[j];if(!g||!g.kp)return;
  /* compact, closed by default: one line, the points open on demand */
  if(seg.first[j]&&!$(':scope > .kp-card',s)){const d=document.createElement('details');d.className='kp-card';const L=g.learn||[];d.innerHTML=`<summary class="kp-h" title="${esc(g.seg)} 要用到它"><span class="kp-t">知识点卡</span><span class="kp-d">·</span><b>${esc(g.kp)}</b>${L.length?`<span class="kp-s">${L.length} 个要点</span>`:''}</summary>${L.length?`<ul>${L.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:''}`;const h=$(':scope > .st-head',s);if(h&&h.nextSibling)s.insertBefore(d,h.nextSibling);else s.appendChild(d);}
  const last=(seg.at[j+1]!==g);if(last&&(g.sum||[]).length&&!$(':scope > .sum-card',s)){const d=document.createElement('details');d.className='sum-card';d.innerHTML=`<summary class="kp-h"><span class="kp-t">小结</span><span class="kp-d">·</span><b>${esc(g.seg)} · 回扣${esc(g.kp)}</b><span class="kp-s">我们发现了</span></summary><ul>${g.sum.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`;s.appendChild(d);}});}

/* ---------- 导入 · 猜一猜: a one-page prediction station for lessons whose module sets L.intro={q,opts,img?,alt?,back}
   The guess and reason are saved in the lesson record (lr.intro) as process evidence; 反思 can come back to it. */
function ensureIntro(k){const L=App.lessons&&App.lessons[k];const v=$('#v-'+k);if(!L||!L.intro||!v||!App.rec)return;if($('#'+k+'-intro',v))return;
  const first=$(':scope > .station',v);if(!first)return;const I=L.intro;const lr=App.lesson(k);const d=lr.intro||{};
  const st=document.createElement('div');st.className='station';st.id=k+'-intro';
  st.innerHTML=`${App.head('WARM-UP','导入 · 猜一猜',esc(I.q),'选出你的猜测。没有对错，学完再回来对照')}
  <ol class="steps"><li>点一个答案</li><li>说一句理由</li></ol>
  <div class="grid2">${I.img?`<img src="${I.img}" alt="${esc(I.alt||'')}" style="width:100%;max-height:300px;object-fit:cover;border-radius:16px;border:1.5px solid var(--line2)">`:''}
   <div style="display:flex;flex-direction:column;gap:12px"><div class="opts" data-intro style="display:flex;flex-direction:column;gap:10px">${I.opts.map((o,j)=>`<button type="button" class="chip big ${d.pick===j?'on':''}" data-j="${j}">${String.fromCharCode(65+j)}. ${esc(o)}</button>`).join('')}</div>
    <div data-intro-fb></div>
    <div class="after-run">${App.pad('为什么这样猜？',`<textarea id="${k}-intro-why" maxlength="120" placeholder="我这样猜，是因为……" aria-label="我的理由">${esc(d.why||'')}</textarea>`)}</div></div></div>
  <details class="more"><summary>说明</summary><p class="note">这里没有对错，记下你现在的想法就好。${esc(I.back||'')}</p></details>`;
  v.insertBefore(st,first);
  const said=()=>App.fb($('[data-intro-fb]',st),'find','猜测已记下！','学完这一讲，再回来看看自己猜得对不对。');
  $$('[data-intro] .chip',st).forEach(b=>b.onclick=()=>{const l=App.lesson(k);l.intro=Object.assign(l.intro||{},{pick:+b.dataset.j,t:Date.now()});$$('[data-intro] .chip',st).forEach(x=>x.classList.toggle('on',x===b));said();App.markStep(st,0);App.touch();});
  const w=$('#'+k+'-intro-why',st);let tm=0;w.oninput=()=>{const l=App.lesson(k);l.intro=Object.assign(l.intro||{},{why:w.value.slice(0,120)});clearTimeout(tm);tm=setTimeout(()=>{if(w.value.trim().length>=4){App.markStep(st,1);App.star(st,3);}App.touch();},500);};
  if(d.pick!=null)said();
  if(d.pick!=null)App.markStep(st,0);if((d.why||'').trim().length>=4)App.markStep(st,1);}
/* balance: the AI answer, the feedback banner and 我的记录 leave the right-hand column and sit full-width under the two columns,
   so one side of the page never grows much longer than the other */
function rebalance(st){$$('.grid2',st).forEach(g=>{if(g.dataset.rb||g.closest('details,.ai-out,.note-pad'))return;const ai=$('.ai-out',g);if(!ai)return;const col=ai.parentElement;if(!col||col.parentElement!==g)return;g.dataset.rb=1;
  const below=document.createElement('div');below.className='below';let x=ai;const mv=[];while(x){mv.push(x);x=x.nextElementSibling;}mv.forEach(e=>below.appendChild(e));g.insertAdjacentElement('afterend',below);
  if(!col.children.length){col.remove();g.classList.add('solo');}});}
function applyPage(k){ensureIntro(k);const v=$('#v-'+k);if(!v)return;const sts=allStations(k);if(!sts.length)return;
  sts.forEach((s,j)=>{if(!s.id)s.id=k+'-p'+(j+1);});
  sts.forEach(s=>{App.paintStars(s);rebalance(s);});
  const i=pageOf(k);PG[k]=i;v.classList.add('paged');
  sts.forEach((s,j)=>{const on=j===i;s.classList.toggle('pg-off',!on);if(on){s.removeAttribute('inert');s.removeAttribute('aria-hidden');}else{s.setAttribute('inert','');s.setAttribute('aria-hidden','true');}});
  const hero=$(':scope > .hero',v);if(hero)hero.classList.toggle('pg-off',i!==0);
  /* stepper */
  let sp=$(':scope > .pg-steps',v);if(!sp){sp=document.createElement('nav');sp.className='pg-steps';sp.setAttribute('aria-label','本讲体验');v.insertBefore(sp,v.firstChild);}
  const seg=flowOf(k,sts);applyFlowCards(k,sts,seg);
  sp.innerHTML=sts.map((s,j)=>{const st=stateOf({el:s});const g=seg.at[j];const lab=(g&&seg.first[j])?`<span class="pg-seg ${g.kp?'kp':''}">${esc(g.seg)}</span>`:'';return lab+(()=>{const c=stCode(s);return `<button type="button" data-pg="${j}" class="${j===i?'on':''} ${st>=1?'done':''}" ${j===i?'aria-current="step"':''} title="${esc((c?c+' ':'')+stTitle(s))}"><span class="n">${st>=1?'✓':String(j+1).padStart(2,'0')}</span><span class="t">${esc(stTitle(s))}</span></button>`;})();}).join('');
  $$('[data-pg]',sp).forEach(b=>b.onclick=()=>App.goPage(k,+b.dataset.pg));
  const on=$('button.on',sp);if(on)requestAnimationFrame(()=>{const L=on.offsetLeft-sp.offsetLeft,R=L+on.offsetWidth;if(L<sp.scrollLeft||R>sp.scrollLeft+sp.clientWidth)sp.scrollLeft=L-24;});
  /* previous / next experience */
  let pn=$(':scope > .pg-nav',v);if(!pn){pn=document.createElement('nav');pn.className='pg-nav';pn.setAttribute('aria-label','上一个和下一个体验');}
  const pager=$(':scope > .pager',v);if(pager)v.insertBefore(pn,pager);else v.appendChild(pn);
  const pr=sts[i-1],nx=sts[i+1];
  pn.innerHTML=(pr?`<button type="button" class="pg-b" data-go="${i-1}"><span>← 上一站</span><b>${esc(stTitle(pr))}</b></button>`:'<span class="pg-b ghost" aria-hidden="true"></span>')+
    `<span class="pg-c mono">${seg.at[i]?esc(seg.at[i].seg)+' · ':''}${i+1} / ${sts.length}</span>`+
    (nx?`<button type="button" class="pg-b nx" data-go="${i+1}"><span>下一站 →</span><b>${esc(stTitle(nx))}</b></button>`:'<span class="pg-b ghost" aria-hidden="true"></span>');
  $$('[data-go]',pn).forEach(b=>b.onclick=()=>App.goPage(k,+b.dataset.go));
  if(pager)pager.hidden=!!nx;}
App.goPage=function(k,i){const n=allStations(k).length;i=Math.max(0,Math.min(i,n-1));PG[k]=i;LS.set(pgKey(k),i);
  App.renderNav(k);window.scrollTo({top:0,behavior:'auto'});
  const L=App.lessons[k];window.dispatchEvent(new Event('resize'));};

/* ---------- sidebar ---------- */
App.renderNav=function(v){v=v||App.current||'home';const r=App.rec;const k=App.lessonInfo(v)?v:null;
  if(k){applyPage(k);stations=scanStations(k);if(observerView!==k){activeIdx=-1;observerView=k;}}else{stations=[];observerView=null;activeIdx=-1;}
  const lessonRow=l=>{const p=r?Math.round(App.progress(l.k,r)*100):0;const on=v===l.k;
    return `<a class="sn-l ${on?'on':''}" href="#${l.k}" ${on?'aria-current="page"':''}><span class="n">${numOf(l.k)}</span><span class="t"><b>${esc(short(l))}</b><small>${esc(l.n.replace(/^第\d+讲\s*/,''))}</small></span><span class="ring ${p>=100?'full':''}" style="--p:${p}" title="完成 ${p}%"></span></a>${on&&stations.length?stationListHTML():''}`;};
  $('#sideNav').innerHTML=`<a class="sn-link ${v==='home'?'on':''}" href="#home">${ICON.home}课程总览</a>
   ${App.UNITS.map(u=>`<div class="sn-unit"><div class="sn-uh"><span><span class="k">${u.en}</span><b>${u.no} · ${u.name}</b></span><span class="pc">${r?App.engagement(r,u.id):0}%</span></div>${u.lessons.map(lessonRow).join('')}</div>`).join('')}
   <div class="sn-sep"></div>
   <a class="sn-link ${v==='me'?'on':''}" href="#me">${ICON.me}我的能力图谱</a>
   <div class="sn-cap">教师</div>
   <a class="sn-link ${v==='class'?'on':''}" href="#class">${ICON.cls}学情分析</a>`;
  wireStationLinks($('#sideNav'));
  const sb=$('#stbar');if(k&&stations.length){sb.hidden=false;sb.innerHTML=chipsHTML();wireStationLinks(sb);}else{sb.hidden=true;sb.innerHTML='';}
  renderCrumbs(v);renderTopR(v);paintEntries(v);addPager(v);if(k)applyPage(k);
  if(k)requestAnimationFrame(spy);};

/* ---------- breadcrumb + right side of the top bar ---------- */
function renderCrumbs(v){const c=$('#crumbs');const info=App.lessonInfo(v);
  if(info){const u=App.UNITS.find(x=>x.id===info.unit);const st=stations[activeIdx];
    c.innerHTML=`<a class="hide-s" href="#home">课程总览</a><span class="sep hide-s" aria-hidden="true"></span><span class="hide-s">${u.no} ${u.name}</span><span class="sep hide-s" aria-hidden="true"></span><span class="cur">${esc(info.nav)}</span>${st?`<span class="sep hide-s" aria-hidden="true"></span><span class="st hide-s">${esc((label(st)?label(st)+' ':'')+st.title)}</span>`:''}`;}
  else c.innerHTML=`<span class="cur">${{home:'课程总览',me:'我的能力图谱',class:'教师端 · 学情分析'}[v]||''}</span>`;}
function renderTopR(v){const t=$('#topR');const r=App.rec;
  if(App.lessonInfo(v)&&r){const p=Math.round(App.progress(v,r)*100);t.innerHTML=`<span style="color:#f0a800;font-weight:700">★ ${App.starsOf(v,r)}</span><span>本讲完成 <b style="color:var(--fg)">${p}%</b></span><span class="bar1" aria-hidden="true"><i style="width:${p}%"></i></span>`;}
  else t.innerHTML='';}

/* ---------- previous / next lesson at the end of a lesson ---------- */
function addPager(v){const info=App.lessonInfo(v);if(!info)return;const view=$('#v-'+v);if(!view)return;
  let pg=$('.pager',view);if(!pg){pg=document.createElement('nav');pg.className='pager';pg.setAttribute('aria-label','上一讲和下一讲');view.appendChild(pg);}
  const i=App.LESSONS.findIndex(l=>l.k===v),pr=App.LESSONS[i-1],nx=App.LESSONS[i+1];
  pg.innerHTML=(pr?`<a href="#${pr.k}"><span>← 上一讲</span><b>${esc(pr.nav)}</b></a>`:'<a class="ghost" aria-hidden="true" tabindex="-1"></a>')+
    (nx?`<a class="nx" href="#${nx.k}"><span>下一讲 →</span><b>${esc(nx.nav)}</b></a>`:`<a class="nx" href="#me"><span>完成了？→</span><b>查看我的能力图谱</b></a>`);}

/* ---------- scroll-spy + live progress ---------- */
function setActive(i){if(i===activeIdx)return;activeIdx=i;
  $$('.sn-st a').forEach(a=>a.classList.toggle('on',+a.dataset.st===i));
  $$('#stbar a').forEach(a=>{const on=+a.dataset.st===i;a.classList.toggle('on',on);if(on)a.scrollIntoView({block:'nearest',inline:'center'});});
  const on=$('.sn-st a.on');if(on)on.scrollIntoView({block:'nearest'});
  renderCrumbs(App.current);}
function spy(){if(!stations.length)return;const k=App.current;if(k&&App.lessonInfo(k)){const el=allStations(k)[pageOf(k)];const j=stations.findIndex(st=>st.el===el);if(j>=0){setActive(j);return;}}const off=matchMedia('(max-width:1023px)').matches?120:90;let i=0;
  stations.forEach((st,j)=>{if(st.el.getBoundingClientRect().top-off<=0)i=j;});
  if(window.innerHeight+window.scrollY>=document.documentElement.scrollHeight-4)i=stations.length-1;setActive(i);}
let raf=0;window.addEventListener('scroll',()=>{if(raf)return;raf=requestAnimationFrame(()=>{raf=0;spy();});},{passive:true});
/* refresh dots / rings / percentages after the student does something */
let rt=0;App.navRefresh=()=>{clearTimeout(rt);rt=setTimeout(()=>{if(!App.current)return;const ai=activeIdx;App.renderNav(App.current);activeIdx=-1;setActive(ai);},250);};
const touch=App.touch;App.touch=function(){const r=touch.apply(this,arguments);App.navRefresh();return r;};
const mark=App.markStep;App.markStep=function(){const r=mark.apply(this,arguments);App.navRefresh();return r;};
document.addEventListener('click',e=>{if(e.target.closest('#main .q .chip'))App.navRefresh();});

/* ---------- mobile drawer ---------- */
const side=()=>$('#side');
function openDrawer(){side().classList.add('open');$('#scrim').hidden=false;$('#menuBtn').setAttribute('aria-expanded','true');const a=$('.sn-l.on,.sn-link.on',side());if(a)a.focus({preventScroll:true});}
function closeDrawer(){if(!side().classList.contains('open'))return;side().classList.remove('open');$('#scrim').hidden=true;$('#menuBtn').setAttribute('aria-expanded','false');}
App.closeDrawer=closeDrawer;
const wire=()=>{$('#menuBtn').onclick=openDrawer;$('#sideClose').onclick=closeDrawer;$('#scrim').onclick=closeDrawer;
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeDrawer();});
  $('#side').addEventListener('click',e=>{if(e.target.closest('a[href^="#"]:not([data-st])'))closeDrawer();});};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',wire);else wire();

/* ---------- teacher entry (next to the logo / mobile top bar) + student map button ---------- */
function paintEntries(v){$$('[data-teacher]').forEach(a=>{const on=v==='class';a.classList.toggle('on',on);if(on)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
  const me=$('#topMe');if(me){me.classList.toggle('on',v==='me');if(v==='me')me.setAttribute('aria-current','page');else me.removeAttribute('aria-current');}
  const ab=$('#abCard');if(ab)ab.classList.toggle('on',v==='me');}
/* same behaviour as the login dialog's teacher button: no student login needed */
document.addEventListener('click',e=>{const a=e.target.closest&&e.target.closest('[data-teacher]');if(!a)return;e.preventDefault();$('#modalRoot').innerHTML='';closeDrawer();if(location.hash!=='#class')location.hash='#class';else App.route();});

/* ---------- who-card + pinned ability summary in the sidebar footer ---------- */
App.renderWho=()=>{const s=App.student;$('#whoAv').textContent=s?(s.name||'同')[0]:'?';
  $('#whoName').innerHTML=s?`<b>${esc(s.name)}</b>${App.className(`g${s.grade}c${s.cls}`)} ${s.no} 号`:'<b>未登录</b>选择班级和学号';
  $('#switchBtn').textContent=s?'切换':'登录';App.renderAbility();};
function miniRadar(sc){const D=App.DIMS,n=D.length,c=33,R=28;const pt=(i,v)=>{const a=-Math.PI/2+i*2*Math.PI/n;return [(c+Math.cos(a)*R*v/100).toFixed(1),(c+Math.sin(a)*R*v/100).toFixed(1)];};
  const ring=r=>D.map((_,i)=>pt(i,r).join(',')).join(' ');const any=D.some(d=>sc[d.k]!=null);
  return `<svg class="ab-radar" viewBox="0 0 66 66" aria-hidden="true">${[50,100].map(r=>`<polygon points="${ring(r)}" fill="none" stroke="rgba(27,37,80,${r===100?.35:.16})" stroke-width="1"/>`).join('')}${D.map((_,i)=>{const[x,y]=pt(i,100);return `<line x1="${c}" y1="${c}" x2="${x}" y2="${y}" stroke="rgba(27,37,80,.14)"/>`;}).join('')}${any?`<polygon points="${D.map((d,i)=>pt(i,Math.max(4,sc[d.k]??0)).join(',')).join(' ')}" fill="#55dcff" fill-opacity=".28" stroke="#55dcff" stroke-width="1.6" stroke-linejoin="round"/>`:''}</svg>`;}
App.renderAbility=()=>{const box=$('#abCard');if(!box)return;const r=App.rec;if(!App.student||!r){box.hidden=true;box.innerHTML='';return;}
  let sc={};try{sc=App.scoreAll(r)||{};}catch(e){}const D=App.DIMS;const got=D.filter(d=>sc[d.k]!=null);const all=got.length?Math.round(got.reduce((a,d)=>a+sc[d.k],0)/got.length):null;
  const aria=got.length?`六维能力：${D.map(d=>`${d.n} ${sc[d.k]??'暂无'}`).join('，')}；综合 ${all}`:'六维能力还没有数据';
  box.hidden=false;box.innerHTML=`${miniRadar(sc)}<div><div class="ab-sum"><small>综合能力</small><b>${all??'—'}</b>${all!=null?'<i>/100</i>':''}</div>
   <div class="ab-bars" role="img" aria-label="${esc(aria)}">${D.map(d=>{const v=sc[d.k];return `<span class="ab-bar ${v==null?'none':''}" title="${esc(d.n)}：${v??'还没有数据'}"><span>${esc(d.s)}</span><em>${v??'—'}</em><u><i style="width:${v??0}%"></i></u></span>`;}).join('')}</div></div>
   <a class="ab-link" href="#me">我的能力图谱 →<span>${got.length?'做实验会实时更新':'做完第一个实验就点亮'}</span></a>`;};
/* live: every record change (App.touch) and every class-data update (App.emit) */
let abT=0;const abSoon=()=>{clearTimeout(abT);abT=setTimeout(App.renderAbility,120);};
const touch2=App.touch;App.touch=function(){const r=touch2.apply(this,arguments);abSoon();return r;};
App.on(abSoon);
const renderAll=App.renderAll;App.renderAll=function(){const r=renderAll.apply(this,arguments);App.renderAbility();return r;};

/* ---------- AI mode notices ("当前：离线示例——……") -> a small badge, the explanation behind ⓘ 说明 ---------- */
const MODE_RX=/^\s*当前(?:引擎|\s?AI)?\s*[：:]\s*/;
function modeLabels(){const A=App.AI;const L=['离线示例','离线演示','平台 AI 接口','Claude 大模型','GPT 大模型'];if(A&&A.NAMES)Object.values(A.NAMES).forEach(n=>L.push(n));if(A&&A.label)L.push(A.label());return [...new Set(L.filter(Boolean))].sort((a,b)=>b.length-a.length);}
function compactNote(el){if(!el||el.nodeType!==1||el.closest('details.more,.ai-badge,.modal'))return;if(el._mnText!=null&&el.textContent===el._mnText)return;
  const full=el.textContent.replace(/\s+/g,' ').trim();if(!MODE_RX.test(full))return;const rest=full.replace(MODE_RX,'');const lab=modeLabels().find(l=>rest.startsWith(l));if(!lab)return;
  let more=rest.slice(lab.length).trim();if(/^（.*）[。.]?$/.test(more))more=more.replace(/^（|）[。.]?$/g,'');more=more.replace(/^[——\-—，,。；;：:、\s]+/,'').trim();
  const off=/^离线/.test(lab),api=lab==='平台 AI 接口';el.classList.add('mode-note');el.setAttribute('title',full);
  el.innerHTML=`<span class="ai-badge ${off?'':'real'} ${api?'api':''}">${esc(lab)}</span>${more?`<details class="more"><summary>说明</summary><p>${esc(more)}</p></details>`:''}`;el._mnText=el.textContent;}
function scanNotes(root){if(!root||root.nodeType!==1)return;const test=el=>{const f=el.firstChild;if(f&&f.nodeType===3&&/^\s*当前/.test(f.data))compactNote(el);};test(root);root.querySelectorAll('p,span,div,small,li').forEach(test);}
const mo=new MutationObserver(list=>{const seen=new Set();list.forEach(m=>{let t=m.target;if(t.nodeType===3)t=t.parentElement;if(!t||seen.has(t))return;seen.add(t);
  if(m.type==='childList'){m.addedNodes.forEach(n=>{if(n.nodeType===1)scanNotes(n);});}const f=t.firstChild;if(f&&f.nodeType===3&&/^\s*当前/.test(f.data))compactNote(t);});});
const startMO=()=>{const m=$('#main');if(!m)return;scanNotes(m);mo.observe(m,{childList:true,subtree:true,characterData:true});};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',startMO);else startMO();
})();
