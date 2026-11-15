'use strict';
/* Branchline admin: login + analytics dashboard.
   Data comes from data/*.json (falls back to data/bundle.js when opened from disk).
   Live usage of THIS browser comes from tracker.js. */
window.Admin=(()=>{
const SKEY='branchline.admin.session',LKEY='branchline.admin.lock';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num=v=>{v=+v||0;const a=Math.abs(v);return a>=1e6?(v/1e6).toFixed(1).replace('.0','')+'M':a>=1e4?(v/1e3).toFixed(1).replace('.0','')+'k':Math.round(v).toLocaleString()};
const int=v=>Math.round(+v||0).toLocaleString();
const usd=(v,d)=>{v=+v||0;const n=d==null?(Math.abs(v)<100&&v%1?2:0):d;return '$'+v.toLocaleString(undefined,{minimumFractionDigits:n,maximumFractionDigits:n})};
const pc=(v,d=1)=>(+v||0).toFixed(d).replace(/\.0+$/,'')+'%';
const dur=m=>{m=Math.round(m||0);return m<60?m+'m':Math.floor(m/60)+'h '+String(m%60).padStart(2,'0')+'m'};
const secs=ms=>{const s=Math.round((ms||0)/1e3);return s<60?s+'s':dur(s/60)};
const dt=s=>{if(!s)return '–';const d=new Date(s.length===10?s+'T00:00':s);return d.toLocaleDateString(undefined,{month:'short',day:'numeric'})};
const dty=s=>{if(!s)return '–';const d=new Date(s.length===10?s+'T00:00':s);return d.toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'})};
const mon=s=>new Date(s+'-01T00:00').toLocaleDateString(undefined,{month:'short',year:'2-digit'});
const sum=(a,k)=>a.reduce((s,x)=>s+(+(k?x[k]:x)||0),0);
const cap=s=>s?s[0].toUpperCase()+s.slice(1):s;
const ini=n=>n.replace('Dr. ','').replace(/[^\p{L} ]/gu,'').split(' ').filter(Boolean).map(w=>w[0]).slice(0,2).join('');
const hue=s=>{let h=0;for(const c of s)h=(h*31+c.charCodeAt(0))%360;return h};
const avc=u=>`<span class="adm-av" style="background:hsl(${hue(u.id)} 38% 38%)">${esc(ini(u.name))}</span>`;
const IC={grid:'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z',users:'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.9M16 3.1a4 4 0 010 7.8',file:'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M8 13h8M8 17h8',activity:'M22 12h-4l-3 9L9 3l-3 9H2',dollar:'M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6',radio:'M12 12h.01M16.2 7.8a6 6 0 010 8.4M7.8 16.2a6 6 0 010-8.4M19.1 4.9a10 10 0 010 14.2M4.9 19.1a10 10 0 010-14.2',download:'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3',logout:'M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9',lock:'M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2zM7 11V7a5 5 0 0110 0v4',eye:'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 15a3 3 0 100-6 3 3 0 000 6z',shield:'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',x:'M18 6L6 18M6 6l12 12',moon:'M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z',home:'M3 11l9-8 9 8v10h-6v-6H9v6H3z',up:'M12 19V5M5 12l7-7 7 7',down:'M12 5v14M19 12l-7 7-7-7',db:'M12 8c4.4 0 8-1.3 8-3s-3.6-3-8-3-8 1.3-8 3 3.6 3 8 3zM4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3'};
const ic=n=>`<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${IC[n]}"/></svg>`;
const TABS=[['overview','Overview','grid'],['users','Users','users'],['content','Content','file'],['engagement','Engagement','activity'],['revenue','Revenue','dollar'],['live','Live (this browser)','radio'],['data','Data & export','db']];
const COL=['var(--c1)','var(--c2)','var(--c3)','var(--c4)','var(--c5)','var(--c6)'];
let D=null,B=null,root=null,tab='overview',bound=0,sessUser=null;
const S={range:30,u:{q:'',plan:'',status:'',sort:'engagement_score',dir:-1,page:0},p:{q:'',cat:'',sort:'views',dir:-1,page:0},drawer:null};
/* ---------- data ---------- */
const NAMES=['admin','meta','users','posts','daily','monthly','transactions','metrics'];
async function load(){if(D)return D;let d={};
 try{if(location.protocol==='file:')throw 0;const r=await Promise.all(NAMES.map(n=>fetch('data/'+n+'.json',{cache:'no-store'}).then(x=>{if(!x.ok)throw 0;return x.json()})));NAMES.forEach((n,i)=>d[n]=r[i]);d.src='data/*.json'}
 catch(e){if(window.BL_DATA){d={...window.BL_DATA};d.src='data/bundle.js (opened from disk)'}else throw new Error('Dashboard data not found. Keep the data/ folder next to index.html.')}
 d.uById=Object.fromEntries(d.users.map(u=>[u.id,u]));d.pById=Object.fromEntries(d.posts.map(p=>[p.id,p]));return D=d}
/* ---------- auth ---------- */
const mem={},store={get(k){try{return localStorage.getItem(k)}catch(e){return mem[k]||null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){mem[k]=v}},del(k){try{localStorage.removeItem(k)}catch(e){delete mem[k]}}};
const sess=()=>{try{const s=JSON.parse(store.get(SKEY));return s&&s.exp>Date.now()?s:null}catch(e){return null}};
const lockSt=()=>{try{return JSON.parse(store.get(LKEY))||{n:0,until:0}}catch(e){return{n:0,until:0}}};
function loginView(){return `<div class="adm-login"><div class="adm-lc"><div class="adm-lg">${ic('shield')}</div><h1>Admin sign in</h1><p>Branchline analytics dashboard</p>
<form id="adm-lf" autocomplete="on" novalidate><label>Username<input id="adm-u" name="username" autocomplete="username" autocapitalize="none" spellcheck="false" required autofocus></label>
<label>Password<span class="adm-pw"><input id="adm-p" name="password" type="password" autocomplete="current-password" required><button type="button" class="adm-eye" data-adm="pw" aria-label="Show password">${ic('eye')}</button></span></label>
<div id="adm-err" class="adm-err" role="alert"></div><button class="adm-btn wide" type="submit">${ic('lock')}Sign in</button></form>
<a class="adm-back" href="#/home">← Back to Branchline</a></div></div>`}
function bindLogin(){const f=$('#adm-lf');if(!f)return;f.addEventListener('submit',e=>{e.preventDefault();const er=$('#adm-err'),L=lockSt(),cfg=D.admin;
 if(L.until>Date.now()){er.textContent='Too many attempts. Try again in '+Math.ceil((L.until-Date.now())/6e4)+' min.';return}
 const u=$('#adm-u').value.trim().toLowerCase(),p=$('#adm-p').value,a=cfg.admins.find(x=>x.username.toLowerCase()===u&&x.password===p);
 if(!a){L.n++;if(L.n>=cfg.max_failed_attempts){L.until=Date.now()+cfg.lockout_minutes*6e4;L.n=0}store.set(LKEY,JSON.stringify(L));er.textContent=L.until>Date.now()?'Too many attempts. Locked for '+cfg.lockout_minutes+' min.':'Incorrect username or password.';$('#adm-p').value='';return}
 store.del(LKEY);store.set(SKEY,JSON.stringify({u:a.username,name:a.display_name,role:a.role,exp:Date.now()+cfg.session_hours*36e5}));
 B.toast('Welcome back, '+a.display_name);location.hash='#/admin'})}
/* ---------- charts (inline SVG, no libraries) ---------- */
const nice=v=>{const p=Math.pow(10,Math.floor(Math.log10(v||1))),f=v/p;return(f<=1?1:f<=2?2:f<=2.5?2.5:f<=5?5:10)*p};
function axes(w,h,pl,pt,iw,ih,mx,fy,labels,x){let o='';for(let i=0;i<=4;i++){const v=mx*i/4,y=pt+ih-ih*i/4;o+=`<line x1="${pl}" x2="${pl+iw}" y1="${y}" y2="${y}" class="gl"/><text x="${pl-6}" y="${y+4}" text-anchor="end" class="at">${fy(v)}</text>`}
 const n=labels.length,k=Math.min(n,6);for(let i=0;i<k;i++){const j=k===1?0:Math.round(i*(n-1)/(k-1));o+=`<text x="${x(j)}" y="${h-6}" text-anchor="middle" class="at">${esc(labels[j])}</text>`}return o}
function lineChart(labels,series,o={}){const w=680,h=230,pl=o.pl||44,pr=12,pt=12,pb=26,iw=w-pl-pr,ih=h-pt-pb,fy=o.fmt||num,mx=nice(Math.max(1,...series.flatMap(s=>s.vals))*1.05);
 const n=labels.length,x=i=>pl+(n>1?i/(n-1)*iw:iw/2),y=v=>pt+ih-(v/mx)*ih;let g=axes(w,h,pl,pt,iw,ih,mx,fy,labels,x);
 series.forEach((s,k)=>{const c=s.color||COL[k],pts=s.vals.map((v,i)=>x(i).toFixed(1)+','+y(v).toFixed(1));
  if(o.area&&k===0)g+=`<path d="M${x(0)},${pt+ih}L${pts.join('L')}L${x(n-1)},${pt+ih}Z" fill="${c}" opacity=".12"/>`;
  g+=`<path d="M${pts.join('L')}" fill="none" stroke="${c}" stroke-width="2" stroke-linejoin="round" ${s.dash?'stroke-dasharray="5 4"':''}/>`});
 const cw=iw/Math.max(1,n);g+=labels.map((l,i)=>`<rect x="${x(i)-cw/2}" y="${pt}" width="${cw}" height="${ih}" class="hv"><title>${esc(l)}&#10;${series.map(s=>esc(s.name)+': '+fy(s.vals[i])).join('&#10;')}</title></rect>`).join('');
 return `<svg viewBox="0 0 ${w} ${h}" class="chart" role="img" aria-label="${esc(o.label||'Line chart')}">${g}</svg>`+legend(series)}
function barChart(labels,series,o={}){const w=680,h=o.h||230,pl=o.pl||44,pr=12,pt=12,pb=26,iw=w-pl-pr,ih=h-pt-pb,fy=o.fmt||num,n=labels.length,st=o.stack;
 const tot=labels.map((_,i)=>st?sum(series.map(s=>s.vals[i])):0),mx=nice(Math.max(1,...(st?tot:series.flatMap(s=>s.vals)))*1.05),bw=iw/n,x=i=>pl+bw*(i+.5),y=v=>pt+ih-(v/mx)*ih;let g=axes(w,h,pl,pt,iw,ih,mx,fy,labels,x);
 labels.forEach((l,i)=>{let acc=0;const gw=Math.min(28,bw*.7)/(st?1:series.length);series.forEach((s,k)=>{const v=s.vals[i],c=s.color||COL[k],hh=ih-(y(v)-pt),bx=st?x(i)-gw/2:x(i)-gw*series.length/2+k*gw,by=st?y(acc+v):y(v);g+=`<rect x="${bx.toFixed(1)}" y="${by.toFixed(1)}" width="${gw.toFixed(1)}" height="${Math.max(0,hh).toFixed(1)}" rx="2" fill="${c}"/>`;acc+=v});
  g+=`<rect x="${pl+bw*i}" y="${pt}" width="${bw}" height="${ih}" class="hv"><title>${esc(l)}&#10;${series.map(s=>esc(s.name)+': '+fy(s.vals[i])).join('&#10;')}</title></rect>`});
 return `<svg viewBox="0 0 ${w} ${h}" class="chart" role="img" aria-label="${esc(o.label||'Bar chart')}">${g}</svg>`+(series.length>1?legend(series):'')}
const legend=s=>s.length>1?`<div class="lgd">${s.map((x,k)=>`<span><i style="background:${x.color||COL[k]}"></i>${esc(x.name)}</span>`).join('')}</div>`:'';
function donut(items,o={}){const t=sum(items,'val')||1,r=46,C=2*Math.PI*r;let off=0;const fm=o.fmt||int;
 const seg=items.map((it,k)=>{const l=it.val/t*C,s=`<circle r="${r}" cx="60" cy="60" fill="none" stroke="${it.color||COL[k%6]}" stroke-width="16" stroke-dasharray="${l.toFixed(2)} ${(C-l).toFixed(2)}" stroke-dashoffset="${(-off).toFixed(2)}" transform="rotate(-90 60 60)"><title>${esc(it.label)}: ${fm(it.val)} (${pc(it.val/t*100)})</title></circle>`;off+=l;return s}).join('');
 return `<div class="dn"><svg viewBox="0 0 120 120" role="img" aria-label="${esc(o.label||'Donut chart')}">${seg}<text x="60" y="58" text-anchor="middle" class="dnv">${esc(o.center||fm(t))}</text><text x="60" y="73" text-anchor="middle" class="dnl">${esc(o.sub||'total')}</text></svg>
 <ul>${items.map((it,k)=>`<li><i style="background:${it.color||COL[k%6]}"></i><span>${esc(it.label)}</span><b>${fm(it.val)}</b><small>${pc(it.val/t*100,0)}</small></li>`).join('')}</ul></div>`}
function hbars(items,o={}){const mx=o.max||Math.max(1,...items.map(i=>i.val)),fm=o.fmt||int;return `<div class="hb">${items.map((it,k)=>`<div class="hr"><span class="hl" title="${esc(it.label)}">${esc(it.label)}</span><span class="ht"><i style="width:${Math.max(1.5,it.val/mx*100)}%;background:${it.color||o.color||COL[0]}"></i></span><b>${fm(it.val)}</b>${it.sub?`<small>${esc(it.sub)}</small>`:''}</div>`).join('')}</div>`}
const card=(t,body,sub,cls='')=>`<section class="cc ${cls}"><header><h3>${t}</h3>${sub?`<small>${sub}</small>`:''}</header>${body}</section>`;
const kpi=(l,v,d,sub,inv)=>{const has=d!=null&&isFinite(d),up=has&&d>=0,good=inv?!up:up;return `<div class="kpi"><small>${l}</small><b>${v}</b>${has?`<span class="dl ${good?'ok':'bad'}">${ic(up?'up':'down')}${pc(Math.abs(d),1)}</span>`:''}${sub?`<em>${sub}</em>`:''}</div>`};
/* ---------- metrics ---------- */
const addDays=(s,n)=>{const d=new Date(s+'T00:00');d.setDate(d.getDate()+n);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const chg=(c,p)=>p?(c-p)/p*100:null;
function calc(){const{users,daily,monthly,meta,metrics}=D,r=S.range,cur=daily.slice(-r),prev=daily.slice(-2*r,-r),last=daily[daily.length-1];
 const inter=a=>sum(a,'votes')+sum(a,'likes')+sum(a,'comments')+sum(a,'shares')+sum(a,'bookmarks');
 const paying=users.filter(u=>u.mrr>0),mrr=sum(paying,'mrr'),lm=monthly[monthly.length-1],pm=monthly[monthly.length-2],ppm=monthly[monthly.length-3],pp=monthly[monthly.length-4];
 const churn=ppm&&ppm.paying?pm.churned_users/ppm.paying*100:0,arppu=paying.length?mrr/paying.length:0,ltv=churn?arppu/(churn/100):null;
 const since30=addDays(meta.as_of,-29),newPay=users.filter(u=>u.sub_start&&u.sub_start>=since30).length,spend=sum(Object.values(metrics.marketing_spend_30d));
 const sp=a=>sum(a,'dau')||1,m=(a,k)=>sum(a,k)/sp(a);
 return{cur,prev,last,r,paying,mrr,arr:mrr*12,churn,arppu,ltv,spend,newPay,cac:newPay?spend/newPay:null,
  newUsers:sum(cur,'new_users'),newUsersP:sum(prev,'new_users'),revenue:sum(cur,'revenue'),revenueP:sum(prev,'revenue'),
  dauAvg:sum(cur,'dau')/cur.length,dauAvgP:prev.length?sum(prev,'dau')/prev.length:0,
  minDau:m(cur,'minutes'),minDauP:prev.length?m(prev,'minutes'):0,sess:sum(cur,'minutes')/(sum(cur,'sessions')||1),sessP:prev.length?sum(prev,'minutes')/(sum(prev,'sessions')||1):0,
  spd:m(cur,'sessions'),spdP:prev.length?m(prev,'sessions'):0,ipd:inter(cur)/sp(cur),ipdP:prev.length?inter(prev)/sp(prev):0,hours:sum(cur,'minutes')/60,hoursP:sum(prev,'minutes')/60,
  stick:last.dau/last.mau*100,mauP:daily[daily.length-1-r]?daily[daily.length-1-r].mau:0,wauP:daily[daily.length-1-r]?daily[daily.length-1-r].wau:0,dauP:daily[daily.length-1-r]?daily[daily.length-1-r].dau:0,
  conv:paying.length/users.length*100,mrrP:pm?pm.mrr:0,lm,pm,pp,arpu:last.mau?mrr/last.mau:0}}
function insights(c){const{users,metrics,posts}=D,o=[],cats={};
 o.push(`<b>MAU ${c.last.mau>=c.mauP?'grew':'fell'} ${pc(Math.abs(chg(c.last.mau,c.mauP)||0),0)}</b> over the last ${S.range} days (${int(c.mauP)} → ${int(c.last.mau)}).`);
 o.push(`<b>Stickiness is ${pc(c.stick,0)}</b> (DAU/MAU). ${c.stick<20?'Below the 20% rule of thumb: habit loops need work.':'Healthy for a decision-based social product.'}`);
 posts.forEach(p=>{const e=cats[p.category]||(cats[p.category]={v:0,i:0});e.v+=p.views;e.i+=p.votes+p.likes+p.comments+p.bookmarks+p.shares});
 const best=Object.entries(cats).sort((a,b)=>b[1].i/b[1].v-a[1].i/a[1].v)[0];o.push(`<b>${best[0]}</b> has the highest engagement rate (${pc(best[1].i/best[1].v*100,0)} interactions per view).`);
 const risk=users.filter(u=>u.mrr>0&&u.status!=='active').length;o.push(`<b>${risk} paying user${risk===1?'':'s'}</b> haven’t been active in 7+ days (${usd(sum(users.filter(u=>u.mrr>0&&u.status!=='active'),'mrr'))}/mo at risk).`);
 const h=metrics.hourly_share_pct,pk=h.indexOf(Math.max(...h));o.push(`<b>Peak usage is ${String(pk).padStart(2,'0')}:00–${String((pk+1)%24).padStart(2,'0')}:00</b> (${pc(h[pk],0)} of sessions): the best slot to publish new stories.`);
 return `<div class="ins">${o.map(x=>`<p>${x}</p>`).join('')}</div>`}
/* ---------- tabs ---------- */
function vOverview(){const c=calc(),{users,daily,monthly,metrics}=D,L=daily.slice(-S.range),lab=L.map(d=>dt(d.date)),r=S.range;
 const by=(k,f)=>{const m={};users.forEach(u=>{const v=f?f(u):u[k];m[v]=(m[v]||0)+1});return Object.entries(m).sort((a,b)=>b[1]-a[1])};
 const n=users.length,fun=[['All-time users',n],['Voted at least once',users.filter(u=>u.votes>0).length],['Liked a story',users.filter(u=>u.likes>0).length],['Commented',users.filter(u=>u.comments>0).length],['Published a story',users.filter(u=>u.stories_created>0).length],['Paying subscribers',c.paying.length]];
 return `${insights(c)}
<h2 class="gh">Audience</h2><div class="kg">
${kpi('All-time users',int(n),null,'+'+int(c.newUsers)+' in last '+r+'d')}${kpi('Active today (DAU)',int(c.last.dau),chg(c.last.dau,c.dauP),'vs '+r+'d ago')}${kpi('Weekly active (WAU)',int(c.last.wau),chg(c.last.wau,c.wauP))}${kpi('Monthly active (MAU)',int(c.last.mau),chg(c.last.mau,c.mauP))}${kpi('Stickiness (DAU/MAU)',pc(c.stick,0),null,'Target 20%+')}${kpi('New users ('+r+'d)',int(c.newUsers),chg(c.newUsers,c.newUsersP),'vs previous '+r+'d')}</div>
<h2 class="gh">Time spent &amp; engagement</h2><div class="kg">
${kpi('Time per active user / day',dur(c.minDau),chg(c.minDau,c.minDauP),'avg across '+r+'d')}${kpi('Avg session length',dur(c.sess),chg(c.sess,c.sessP))}${kpi('Sessions per active user',c.spd.toFixed(1),chg(c.spd,c.spdP),'per day')}${kpi('Interactions per active user',c.ipd.toFixed(1),chg(c.ipd,c.ipdP),'votes, likes, comments…')}${kpi('Total time in app',num(c.hours)+' h',chg(c.hours,c.hoursP),'last '+r+'d')}${kpi('Stories published',int(sum(L,'stories')),chg(sum(L,'stories'),sum(daily.slice(-2*r,-r),'stories')))}</div>
<h2 class="gh">Revenue</h2><div class="kg">
${kpi('MRR',usd(c.mrr),chg(c.mrr,c.mrrP),'vs last month')}${kpi('ARR (MRR × 12)',usd(c.arr),null,'annualised run-rate')}${kpi('Revenue ('+r+'d)',usd(c.revenue),chg(c.revenue,c.revenueP),'subscriptions + sponsored')}${kpi('Paying users',int(c.paying.length),null,pc(c.conv)+' of all users')}${kpi('ARPPU',usd(c.arppu,2),null,'MRR ÷ payers')}${kpi('Monthly churn',pc(c.churn),null,'last full month',1)}${kpi('Est. LTV',c.ltv?usd(c.ltv):'–',null,'ARPPU ÷ churn')}${kpi('CAC (blended)',c.cac?usd(c.cac):'–',null,'30d spend ÷ new payers')}${kpi('LTV : CAC',c.ltv&&c.cac?(c.ltv/c.cac).toFixed(1)+'×':'–',null,'3× is the usual goal')}${kpi('ARPU (MAU)',usd(c.arpu,2),null,'MRR ÷ monthly actives')}${kpi('Net new MRR',usd(c.lm.new_mrr+c.lm.expansion_mrr-c.lm.churned_mrr),null,'this month')}${kpi('Lifetime revenue',usd(sum(D.monthly,'revenue')),null,'since launch')}</div>
<div class="cg">${card('Active users','' +lineChart(lab,[{name:'DAU',vals:L.map(d=>d.dau)},{name:'WAU',vals:L.map(d=>d.wau)},{name:'MAU',vals:L.map(d=>d.mau)}],{label:'Active users'}),'Last '+r+' days')}
${card('New sign-ups',barChart(lab,[{name:'New users',vals:L.map(d=>d.new_users)}]),'Per day')}
${card('Time spent in app',lineChart(lab,[{name:'Minutes per active user',vals:L.map(d=>d.minutes/(d.dau||1)),color:COL[1]}],{fmt:v=>Math.round(v)+'m',area:1}),'Average minutes per active user per day')}
${card('Interactions',lineChart(lab,[{name:'Votes',vals:L.map(d=>d.votes)},{name:'Likes',vals:L.map(d=>d.likes)},{name:'Comments',vals:L.map(d=>d.comments)},{name:'Shares',vals:L.map(d=>d.shares)},{name:'Bookmarks',vals:L.map(d=>d.bookmarks)}]),'Per day')}
${card('MRR growth',lineChart(monthly.map(m=>mon(m.month)),[{name:'MRR',vals:monthly.map(m=>m.mrr),color:COL[0]}],{fmt:v=>usd(v),area:1,pl:52}),'Month end, since launch')}
${card('Monthly revenue',barChart(monthly.map(m=>mon(m.month)),[{name:'Subscriptions',vals:monthly.map(m=>m.subscription_revenue)},{name:'Sponsored stories',vals:monthly.map(m=>m.sponsored_revenue),color:COL[1]}],{stack:1,fmt:v=>usd(v),pl:52}),'USD')}
${card('User funnel',hbars(fun.map(([l,v],i)=>({label:l,val:v,sub:i?pc(v/fun[i-1][1]*100,0)+' of prev':'',color:COL[0]})),{max:n}),'From sign-up to paying')}
${card('When people use the app',barChart(Array.from({length:24},(_,i)=>String(i).padStart(2,'0')),[{name:'Share of sessions',vals:metrics.hourly_share_pct,color:COL[2]}],{fmt:v=>pc(v,1),h:200}),'Share of sessions by hour of day')}
${card('Plan mix',donut(by('plan').map(([k,v],i)=>({label:cap(k),val:v,color:['var(--c7)',COL[0],COL[1]][['free','plus','creator'].indexOf(k)]})),{sub:'users'}),'All users')}
${card('Devices',donut(by('device').map(([k,v])=>({label:k,val:v})),{sub:'users'}))}
${card('Acquisition source',donut(by('source').map(([k,v])=>({label:cap(k),val:v})),{sub:'users'}))}
${card('Top countries',hbars(by('country').slice(0,8).map(([k,v])=>({label:k,val:v,color:COL[3]}))))}</div>`}
const NUMC={users:[['name','User'],['plan','Plan'],['status','Status'],['joined','Joined'],['last_active','Last active'],['sessions','Sessions'],['time_spent_min','Time spent'],['avg_session_min','Avg session'],['votes','Votes'],['likes','Likes'],['comments','Comments'],['stories_created','Stories'],['engagement_score','Score']]};
const sortTh=(t,k,l)=>{const st=S[t],on=st.sort===k;return `<th class="${on?'on':''}"><button data-adm="sort" data-t="${t}" data-k="${k}" aria-label="Sort by ${esc(l)}">${esc(l)}${on?ic(st.dir<0?'down':'up'):''}</button></th>`};
function pager(t,total,per){const st=S[t],pages=Math.max(1,Math.ceil(total/per));if(st.page>=pages)st.page=pages-1;return `<div class="pg"><small>${total?int(st.page*per+1)+'–'+int(Math.min(total,(st.page+1)*per)):0} of ${int(total)}</small><span><button class="adm-btn ghost sm" data-adm="page" data-t="${t}" data-d="-1" ${st.page<=0?'disabled':''}>Previous</button><button class="adm-btn ghost sm" data-adm="page" data-t="${t}" data-d="1" ${st.page>=pages-1?'disabled':''}>Next</button></span></div>`}
function usersRes(){const st=S.u,q=st.q.toLowerCase();let l=D.users.filter(u=>(!q||(u.name+u.username+u.email+u.country).toLowerCase().includes(q))&&(!st.plan||u.plan===st.plan)&&(!st.status||u.status===st.status));
 l=[...l].sort((a,b)=>{const x=a[st.sort],y=b[st.sort];return(typeof x==='string'?x.localeCompare(y):x-y)*st.dir});const per=15,rows=l.slice(st.page*per,(st.page+1)*per);
 const tm=sum(l,'time_spent_min');
 return `<div class="srow"><span><b>${int(l.length)}</b> users</span><span><b>${dur(l.length?tm/l.length:0)}</b> avg time spent</span><span><b>${num(sum(l,'interactions'))}</b> interactions</span><span><b>${usd(sum(l,'mrr'))}</b> MRR</span></div>
 <div class="tw"><table class="tb"><thead><tr>${NUMC.users.map(([k,l])=>sortTh('u',k,l)).join('')}</tr></thead><tbody>${rows.map(u=>`<tr data-adm="open" data-t="user" data-id="${u.id}" tabindex="0"><td><span class="un">${avc(u)}<span><b>${esc(u.name)}</b><small>@${esc(u.username)} · ${esc(u.country)}</small></span></span></td><td><span class="pl ${u.plan}">${cap(u.plan)}</span></td><td><span class="stt ${u.status}">${cap(u.status)}</span></td><td>${dt(u.joined)}</td><td>${dt(u.last_active)}</td><td>${int(u.sessions)}</td><td>${dur(u.time_spent_min)}</td><td>${u.avg_session_min}m</td><td>${int(u.votes)}</td><td>${int(u.likes)}</td><td>${int(u.comments)}</td><td>${u.stories_created}</td><td><span class="sc"><i style="width:${u.engagement_score}%"></i></span> ${u.engagement_score}</td></tr>`).join('')||'<tr><td colspan="13" class="emp">No users match these filters.</td></tr>'}</tbody></table></div>${pager('u',l.length,per)}`}
const vUsers=()=>`<div class="fb"><input type="search" class="adm-in" placeholder="Search name, @username, email, country" data-adm-in="u.q" value="${esc(S.u.q)}" aria-label="Search users">
<select class="adm-in" data-adm-sel="u.plan" aria-label="Plan"><option value="">All plans</option>${['free','plus','creator'].map(p=>`<option value="${p}" ${S.u.plan===p?'selected':''}>${cap(p)}</option>`).join('')}</select>
<select class="adm-in" data-adm-sel="u.status" aria-label="Status"><option value="">All statuses</option>${['active','dormant','churned'].map(p=>`<option value="${p}" ${S.u.status===p?'selected':''}>${cap(p)}</option>`).join('')}</select>
<button class="adm-btn ghost sm" data-adm="csv" data-k="users">${ic('download')}CSV</button></div><p class="hint">Active = seen in the last 7 days, dormant = 8–30 days, churned = 30+ days. Click a row for the full per-user breakdown.</p><div id="u-res">${usersRes()}</div>`;
const er=p=>(p.votes+p.likes+p.comments+p.bookmarks+p.shares)/Math.max(1,p.views)*100;
function postsRes(){const st=S.p,q=st.q.toLowerCase(),g=p=>st.sort==='er'?er(p):st.sort==='creator'?(D.uById[p.creator]||{}).name:st.sort==='title'?p.title:p[st.sort];
 let l=D.posts.filter(p=>(!q||(p.title+p.category).toLowerCase().includes(q))&&(!st.cat||p.category===st.cat));l=[...l].sort((a,b)=>{const x=g(a),y=g(b);return(typeof x==='string'?x.localeCompare(y):x-y)*st.dir});
 const per=12,rows=l.slice(st.page*per,(st.page+1)*per);
 return `<div class="tw"><table class="tb"><thead><tr>${sortTh('p','title','Story')}${sortTh('p','creator','Creator')}${sortTh('p','category','Category')}${sortTh('p','created','Posted')}${sortTh('p','impressions','Impressions')}${sortTh('p','views','Views')}${sortTh('p','votes','Votes')}${sortTh('p','likes','Likes')}${sortTh('p','comments','Comments')}${sortTh('p','shares','Shares')}${sortTh('p','avg_dwell_sec','Avg dwell')}${sortTh('p','er','Engagement')}</tr></thead><tbody>${rows.map(p=>`<tr data-adm="open" data-t="post" data-id="${p.id}" tabindex="0"><td class="ttl"><b>${esc(p.title)}</b></td><td>${esc((D.uById[p.creator]||{}).name||p.creator)}</td><td><span class="tag">${esc(p.category)}</span></td><td>${dt(p.created)}</td><td>${num(p.impressions)}</td><td>${num(p.views)}</td><td>${num(p.votes)}</td><td>${num(p.likes)}</td><td>${p.comments}</td><td>${p.shares}</td><td>${p.avg_dwell_sec}s</td><td>${pc(er(p))}</td></tr>`).join('')||'<tr><td colspan="12" class="emp">No stories match.</td></tr>'}</tbody></table></div>${pager('p',l.length,per)}`}
function vContent(){const P=D.posts,cats={};P.forEach(p=>{const e=cats[p.category]||(cats[p.category]={n:0,v:0,vo:0,i:0,d:0,c:0,b:0});e.n++;e.v+=p.views;e.vo+=p.votes;e.i+=p.votes+p.likes+p.comments+p.bookmarks+p.shares;e.d+=p.avg_dwell_sec;e.b+=p.continuations});
 const cl=Object.entries(cats).sort((a,b)=>b[1].i/b[1].v-a[1].i/a[1].v),tv=sum(P,'views'),to=sum(P,'votes');
 return `<div class="kg">${kpi('Stories',int(P.length))}${kpi('Total views',num(tv))}${kpi('Total votes',num(to),null,pc(to/tv*100,0)+' of views')}${kpi('Avg engagement rate',pc(sum(P.map(er))/P.length),null,'interactions ÷ views')}${kpi('Avg dwell time',Math.round(sum(P,'avg_dwell_sec')/P.length)+'s',null,'per story view')}${kpi('Branch continuations',int(sum(P,'continuations')),null,'stories continued by readers')}</div>
 <div class="cg">${card('Engagement by category',hbars(cl.map(([k,e])=>({label:k,val:e.i/e.v*100,sub:e.n+' stories',color:COL[0]})),{fmt:v=>pc(v,0),max:100}),'Interactions per view')}
 ${card('Views by category',donut(Object.entries(cats).sort((a,b)=>b[1].v-a[1].v).map(([k,e])=>({label:k,val:e.v})),{fmt:num,sub:'views'}))}
 ${card('Traffic sources',hbars(['feed','explore','search','share','profile'].map((k,i)=>({label:cap(k),val:sum(P.map(p=>p.sources[k]*p.views))/tv*100,color:COL[i]})),{fmt:v=>pc(v,0),max:100}),'Where story views come from')}
 ${card('Top search terms',hbars(D.metrics.search_terms.slice(0,8).map(t=>({label:t.term,val:t.count,color:COL[3]}))),'What people look for')}</div>
 <h2 class="gh">All stories</h2><div class="fb"><input type="search" class="adm-in" placeholder="Search stories" data-adm-in="p.q" value="${esc(S.p.q)}" aria-label="Search stories"><select class="adm-in" data-adm-sel="p.cat" aria-label="Category"><option value="">All categories</option>${Object.keys(cats).sort().map(c=>`<option ${S.p.cat===c?'selected':''}>${c}</option>`).join('')}</select><button class="adm-btn ghost sm" data-adm="csv" data-k="posts">${ic('download')}CSV</button></div><div id="p-res">${postsRes()}</div>`}
function vEngagement(){const U=D.users,{metrics}=D,bk=(a,f,edges,labels)=>labels.map((l,i)=>({label:l,val:a.filter(u=>{const v=f(u);return v>=edges[i]&&v<edges[i+1]}).length,color:COL[0]}));
 const tb=bk(U,u=>u.time_spent_min,[0,10,30,60,180,600,1e9],['< 10 min','10–30 min','30–60 min','1–3 h','3–10 h','10 h +']),db=bk(U,u=>u.active_days,[0,2,5,15,40,100,1e9],['1 day','2–4 days','5–14 days','15–39 days','40–99 days','100+ days']);
 const n=U.length,ft=[['Voted',u=>u.votes>0],['Liked',u=>u.likes>0],['Commented',u=>u.comments>0],['Bookmarked',u=>u.bookmarks>0],['Shared',u=>u.shares>0],['Used search',u=>u.searches>0],['Followed a creator',u=>u.follows>0],['Wrote a continuation',u=>u.branches_written>0],['Published a story',u=>u.stories_created>0],['Dark mode on',u=>u.settings.dark],['Push notifications on',u=>u.settings.push],['Email digest on',u=>u.settings.email],['Private profile',u=>u.settings.private]];
 const life=['active','dormant','churned'].map(s=>{const l=U.filter(u=>u.status===s);return `<tr><td><span class="stt ${s}">${cap(s)}</span></td><td>${int(l.length)}</td><td>${pc(l.length/n*100,0)}</td><td>${dur(l.length?sum(l,'time_spent_min')/l.length:0)}</td><td>${l.length?(sum(l,'sessions')/l.length).toFixed(0):0}</td><td>${l.length?Math.round(sum(l,'interactions')/l.length):0}</td></tr>`}).join('');
 const top=[...U].sort((a,b)=>b.time_spent_min-a.time_spent_min).slice(0,10);
 const heat=`<div class="tw"><table class="hm"><thead><tr><th>Cohort (week of)</th><th>Users</th>${Array.from({length:10},(_,i)=>`<th>W${i}</th>`).join('')}</tr></thead><tbody>${metrics.cohorts.map(c=>`<tr><th>${dt(c.week_start)}</th><td>${c.size}</td>${c.retention.map(v=>v==null?'<td class="nil">–</td>':`<td style="background:color-mix(in srgb,var(--g) ${Math.round(v*.85)}%,var(--sf));color:${v>55?'var(--on)':'var(--ink)'}">${v}%</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
 return `<div class="cg">${card('Total time spent per user',hbars(tb,{max:Math.max(...tb.map(x=>x.val))}),'Number of users by lifetime minutes in app')}
 ${card('Days active per user',hbars(db,{max:Math.max(...db.map(x=>x.val))}),'How often people come back')}
 ${card('Average minutes by weekday',barChart(['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],[{name:'Minutes per active user',vals:metrics.weekday_avg_minutes,color:COL[1]}],{fmt:v=>Math.round(v)+'m',h:200}))}
 ${card('Feature adoption',hbars(ft.map(([l,f])=>({label:l,val:U.filter(f).length/n*100,color:COL[2]})),{fmt:v=>pc(v,0),max:100}),'% of all users')}</div>
 ${card('Weekly retention by sign-up cohort',heat,'% of each cohort active in each week after joining. Hover-free: darker = better.','wide')}
 <div class="cg">${card('Lifecycle segments',`<div class="tw"><table class="tb cp"><thead><tr><th>Segment</th><th>Users</th><th>Share</th><th>Avg time</th><th>Sessions</th><th>Interactions</th></tr></thead><tbody>${life}</tbody></table></div>`)}
 ${card('Power users',`<div class="tw"><table class="tb cp"><thead><tr><th>User</th><th>Time</th><th>Sessions</th><th>Interactions</th></tr></thead><tbody>${top.map(u=>`<tr data-adm="open" data-t="user" data-id="${u.id}" tabindex="0"><td><span class="un">${avc(u)}<b>${esc(u.name)}</b></span></td><td>${dur(u.time_spent_min)}</td><td>${int(u.sessions)}</td><td>${int(u.interactions)}</td></tr>`).join('')}</tbody></table></div>`,'Top 10 by time spent')}</div>`}
function vRevenue(){const{monthly,users,transactions}=D,c=calc(),l=monthly[monthly.length-1],p=monthly[monthly.length-2],labs=monthly.map(m=>mon(m.month)),net=l.new_mrr+l.expansion_mrr-l.churned_mrr;
 const byPlan=['plus','creator'].map(k=>({label:cap(k),val:sum(c.paying.filter(u=>u.plan===k),'mrr')})),by=(k)=>{const m={};users.forEach(u=>{if(u.lifetime_revenue)m[u[k]]=(m[u[k]]||0)+u.lifetime_revenue});return Object.entries(m).sort((a,b)=>b[1]-a[1])};
 const topc=[...users].sort((a,b)=>b.lifetime_revenue-a.lifetime_revenue).slice(0,8);
 return `<div class="kg">${kpi('MRR',usd(c.mrr),chg(c.mrr,p.mrr),'vs last month')}${kpi('ARR',usd(c.arr),chg(c.arr,p.mrr*12))}${kpi('Net new MRR',usd(net),null,'this month',0)}${kpi('Paying users',int(c.paying.length),chg(c.paying.length,p.paying))}${kpi('ARPPU',usd(c.arppu,2))}${kpi('ARPU (MAU)',usd(c.arpu,2),null,'MRR ÷ MAU')}${kpi('Monthly churn',pc(c.churn),null,'last full month',1)}${kpi('Est. LTV',c.ltv?usd(c.ltv):'–')}${kpi('Lifetime revenue',usd(sum(monthly,'revenue')),null,'since launch')}</div>
 <div class="cg">${card('MRR',lineChart(labs,[{name:'MRR',vals:monthly.map(m=>m.mrr)}],{fmt:v=>usd(v),area:1,pl:52}))}
 ${card('Revenue by month',barChart(labs,[{name:'Subscriptions',vals:monthly.map(m=>m.subscription_revenue)},{name:'Sponsored stories',vals:monthly.map(m=>m.sponsored_revenue),color:COL[1]}],{stack:1,fmt:v=>usd(v),pl:52}))}
 ${card('Paying users',lineChart(labs,[{name:'Paying',vals:monthly.map(m=>m.paying),color:COL[2]},{name:'Churned in month',vals:monthly.map(m=>m.churned_users),color:COL[4]}]))}
 ${card('MRR by plan',donut(byPlan.map((x,i)=>({...x,color:COL[i]})),{fmt:v=>usd(v),sub:'MRR'}))}
 ${card('Lifetime revenue by source',hbars(by('source').map(([k,v])=>({label:cap(k),val:v,color:COL[0]})),{fmt:v=>usd(v)}))}
 ${card('Billing cycle',donut([['monthly','Monthly'],['annual','Annual']].map(([k,t],i)=>({label:t,val:c.paying.filter(u=>u.billing===k).length,color:COL[i+1]})),{sub:'payers'}))}</div>
 ${card('MRR movement',`<div class="tw"><table class="tb cp"><thead><tr><th>Month</th><th>New</th><th>Expansion</th><th>Churned</th><th>Net new</th><th>End MRR</th><th>Paying</th><th>Revenue</th></tr></thead><tbody>${[...monthly].reverse().map(m=>`<tr><td>${mon(m.month)}</td><td class="ok">+${usd(m.new_mrr)}</td><td class="ok">+${usd(m.expansion_mrr)}</td><td class="bad">−${usd(m.churned_mrr)}</td><td>${usd(m.new_mrr+m.expansion_mrr-m.churned_mrr)}</td><td><b>${usd(m.mrr)}</b></td><td>${m.paying}</td><td>${usd(m.revenue)}</td></tr>`).join('')}</tbody></table></div>`,'USD','wide')}
 <div class="cg">${card('Top customers',`<div class="tw"><table class="tb cp"><thead><tr><th>User</th><th>Plan</th><th>Lifetime</th></tr></thead><tbody>${topc.map(u=>`<tr data-adm="open" data-t="user" data-id="${u.id}" tabindex="0"><td><span class="un">${avc(u)}<b>${esc(u.name)}</b></span></td><td><span class="pl ${u.plan}">${cap(u.plan)}</span></td><td>${usd(u.lifetime_revenue)}</td></tr>`).join('')}</tbody></table></div>`)}
 ${card('Recent invoices',`<div class="tw"><table class="tb cp"><thead><tr><th>Invoice</th><th>Customer</th><th>Amount</th><th>Status</th></tr></thead><tbody>${transactions.slice(0,8).map(t=>`<tr><td>${t.id}<small> · ${dt(t.date)}</small></td><td>${esc(t.name)}</td><td>${usd(t.amount)}</td><td><span class="stt ${t.status==='paid'?'active':t.status==='failed'?'churned':'dormant'}">${cap(t.status)}</span></td></tr>`).join('')}</tbody></table></div>`)}</div>`}
function vLive(){const a=TRK.data(),tc=a.tc||{},today=(a.dy[TRK.day()]||{}).ms||0,ss=a.sessions.length,tv=sum(Object.values(a.pv)),ev=sum(Object.values(tc)),days=[];
 for(let i=13;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);const k=TRK.day(d.getTime());days.push({l:dt(k),v:((a.dy[k]||{}).ms||0)/6e4})}
 const st=Object.entries(a.st).map(([id,s])=>({id,s,t:(B.story(id)||{}).t||id})).sort((x,y)=>(y.s.dwell||0)-(x.s.dwell||0)),u=B.usr('me');
 return `<div class="note">${ic('radio')}<span>This tab reads <b>real activity recorded in this browser</b> by tracker.js (profile: <b>${esc(u.n)}</b>). Everything else in the dashboard uses the dataset in <code>data/</code>.</span></div>
 <div class="kg">${kpi('Active time (all)',secs(a.active),null,'tracking since '+dty(TRK.day(a.first)))}${kpi('Active time today',secs(today))}${kpi('Sessions',int(ss),null,'30 min idle = new session')}${kpi('Avg session',secs(a.active/Math.max(1,ss)))}${kpi('Page views',int(tv))}${kpi('Interactions',int(ev),null,'votes, likes, comments…')}</div>
 <div class="cg">${card('Active minutes per day',barChart(days.map(d=>d.l),[{name:'Minutes',vals:days.map(d=>d.v),color:COL[1]}],{fmt:v=>Math.round(v)+'m',h:200}),'Last 14 days')}
 ${card('Interactions by type',Object.keys(tc).length?hbars(Object.entries(tc).sort((x,y)=>y[1]-x[1]).map(([k,v])=>({label:cap(k),val:v,color:COL[0]}))):'<p class="emp">No interactions yet. Vote, like or comment in the app, then return here.</p>')}
 ${card('Pages visited',Object.keys(a.pv).length?hbars(Object.entries(a.pv).sort((x,y)=>y[1]-x[1]).map(([k,v])=>({label:cap(k==='s'?'story':k==='u'?'profile':k),val:v,color:COL[2]}))):'<p class="emp">Nothing yet.</p>')}
 ${card('Searches',a.se.length?`<ul class="lg">${[...a.se].reverse().slice(0,10).map(s=>`<li><b>${esc(s.q)}</b><small>${new Date(s.t).toLocaleString()}</small></li>`).join('')}</ul>`:'<p class="emp">No searches yet.</p>')}</div>
 ${card('Per-story engagement (this browser)',st.length?`<div class="tw"><table class="tb cp"><thead><tr><th>Story</th><th>Views</th><th>Time on story</th><th>Votes</th><th>Likes</th><th>Comments</th><th>Bookmarks</th><th>Shares</th></tr></thead><tbody>${st.map(({s,t})=>`<tr><td class="ttl"><b>${esc(t)}</b></td><td>${s.views||0}</td><td>${secs(s.dwell)}</td><td>${s.vote||0}</td><td>${s.like||0}</td><td>${s.comment||0}</td><td>${s.bookmark||0}</td><td>${s.share||0}</td></tr>`).join('')}</tbody></table></div>`:'<p class="emp">Open a story to start recording.</p>','','wide')}
 ${card('Recent events',a.ev.length?`<ul class="lg">${[...a.ev].reverse().slice(0,15).map(e=>`<li><b>${cap(e.type)}</b>${e.s?` <span>${esc(((B.story(e.s)||{}).t||e.s).slice(0,70))}</span>`:''}<small>${new Date(e.t).toLocaleTimeString()}</small></li>`).join('')}</ul>`:'<p class="emp">No events yet.</p>','','wide')}
 <div class="fb"><button class="adm-btn ghost sm" data-adm="json" data-k="live">${ic('download')}Export live data (JSON)</button><button class="adm-btn danger sm" data-adm="resetlive">Reset live tracking</button></div>`}
function vData(){const rows=[['users.json','Every user: plan, status, sessions, time spent, interactions, settings',D.users.length],['posts.json','Per-story views, votes, likes, comments, dwell, traffic sources',D.posts.length],['daily.json','Daily DAU/WAU/MAU, sessions, minutes, interactions, revenue (180 days)',D.daily.length],['monthly.json','Monthly users, MAU, MRR movement, revenue',D.monthly.length],['transactions.json','Recent invoices',D.transactions.length],['metrics.json','Retention cohorts, hourly usage, search terms, spend, reports',Object.keys(D.metrics).length],['meta.json','As-of date, currency, plan prices',Object.keys(D.meta).length],['admin.json','Admin credentials and session/lockout settings',D.admin.admins.length]];
 return `<div class="note">${ic('db')}<span>Dashboard is reading <b>${esc(D.src)}</b>. Data as of <b>${dty(D.meta.as_of)}</b>. The numbers are <b>synthetic demo data</b>; replace the files in <code>data/</code> (same shape) with real exports to study real usage.</span></div>
 ${card('Datasets',`<div class="tw"><table class="tb cp"><thead><tr><th>File</th><th>Contents</th><th>Records</th></tr></thead><tbody>${rows.map(r=>`<tr><td><code>${r[0]}</code></td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('')}</tbody></table></div>`,'','wide')}
 <div class="fb"><button class="adm-btn" data-adm="json" data-k="all">${ic('download')}Full snapshot (JSON)</button><button class="adm-btn ghost" data-adm="csv" data-k="users">${ic('download')}Users CSV</button><button class="adm-btn ghost" data-adm="csv" data-k="posts">${ic('download')}Stories CSV</button><button class="adm-btn ghost" data-adm="csv" data-k="daily">${ic('download')}Daily CSV</button><button class="adm-btn ghost" data-adm="csv" data-k="monthly">${ic('download')}Monthly CSV</button></div>`}
const V={overview:vOverview,users:vUsers,content:vContent,engagement:vEngagement,revenue:vRevenue,live:vLive,data:vData};
/* ---------- drawer ---------- */
function drawer(){const d=S.drawer,el=$('#adm-dr');if(!el)return;if(!d){el.className='';el.innerHTML='';return}
 let h='';
 if(d.t==='user'){const u=D.uById[d.id];if(!u)return;const ix=[['Votes',u.votes],['Likes',u.likes],['Comments',u.comments],['Bookmarks',u.bookmarks],['Shares',u.shares],['Follows',u.follows],['Searches',u.searches],['Stories published',u.stories_created],['Continuations written',u.branches_written]];
  const live=u.id==='me'?(()=>{const a=TRK.data();return `<h4>Live in this browser</h4><div class="mk"><div><b>${secs(a.active)}</b><small>active time</small></div><div><b>${a.sessions.length}</b><small>sessions</small></div><div><b>${int(sum(Object.values(a.tc||{})))}</b><small>interactions</small></div></div>`})():'';
  h=`<div class="dh">${avc(u)}<div><h3>${esc(u.name)}</h3><small>@${esc(u.username)} · ${esc(u.email)}</small><div class="tgs"><span class="pl ${u.plan}">${cap(u.plan)}</span><span class="stt ${u.status}">${cap(u.status)}</span>${u.verified?'<span class="stt active">Verified</span>':''}</div></div><button class="adm-ib" data-adm="close" aria-label="Close">${ic('x')}</button></div>
  <div class="mk"><div><b>${dur(u.time_spent_min)}</b><small>time in app</small></div><div><b>${int(u.sessions)}</b><small>sessions</small></div><div><b>${u.active_days}</b><small>days active</small></div><div><b>${u.avg_session_min}m</b><small>avg session</small></div></div>
  <h4>Interactions with posts</h4>${hbars(ix.map(([l,v])=>({label:l,val:v,color:COL[0]})),{max:Math.max(1,...ix.map(x=>x[1]))})}<p class="hint">${int(u.story_views)} stories viewed · ${u.story_views?pc(u.votes/u.story_views*100,0):'0%'} of views led to a vote · engagement score ${u.engagement_score}/100</p>
  <h4>Minutes per day, last 14 days</h4>${barChart(u.daily_min.map((_,i)=>dt(addDays(D.meta.as_of,i-13))),[{name:'Minutes',vals:u.daily_min,color:COL[1]}],{fmt:v=>Math.round(v)+'m',h:150,pl:34})}
  <h4>Favourite categories</h4>${hbars(u.top_categories.map(c=>({label:c.name,val:c.pct,color:COL[2]})),{fmt:v=>v+'%',max:100})}
  <h4>Recent activity</h4><ul class="lg">${u.recent.map(e=>`<li><b>${cap(e.type)}</b> <span>${esc((D.pById[e.story]||{}).title||e.story)}</span><small>${dt(e.day)}</small></li>`).join('')}</ul>${live}
  <h4>Profile &amp; subscription</h4><dl class="df"><dt>Joined</dt><dd>${dty(u.joined)}</dd><dt>Last active</dt><dd>${dty(u.last_active)}</dd><dt>Country</dt><dd>${esc(u.country)}</dd><dt>Device</dt><dd>${esc(u.device)}</dd><dt>Source</dt><dd>${cap(u.source)}</dd><dt>Plan</dt><dd>${cap(u.plan)}${u.billing?' · '+u.billing:''}${u.mrr?' · '+usd(u.mrr,2)+'/mo':''}</dd><dt>Lifetime revenue</dt><dd>${usd(u.lifetime_revenue,2)}</dd>${u.sub_end?`<dt>Cancelled</dt><dd>${dty(u.sub_end)}</dd>`:''}<dt>Settings</dt><dd>${Object.entries(u.settings).map(([k,v])=>`${cap(k)}: ${v?'on':'off'}`).join(' · ')}</dd></dl>`}
 else{const p=D.pById[d.id];if(!p)return;const u=D.uById[p.creator]||{name:p.creator},t=p.votes||1;
  h=`<div class="dh"><div><span class="tag">${esc(p.category)}</span><h3>${esc(p.title)}</h3><small>by ${esc(u.name)} · ${dty(p.created)}</small></div><button class="adm-ib" data-adm="close" aria-label="Close">${ic('x')}</button></div>
  <div class="mk"><div><b>${num(p.impressions)}</b><small>impressions</small></div><div><b>${num(p.views)}</b><small>views</small></div><div><b>${num(p.votes)}</b><small>votes</small></div><div><b>${pc(er(p))}</b><small>engagement</small></div></div>
  <h4>Choice split</h4>${hbars(p.choices.map((v,i)=>({label:'Choice '+(i+1),val:v/t*100,sub:int(v)+' votes',color:COL[i]})),{fmt:v=>pc(v,0),max:100})}
  <h4>Interactions</h4>${hbars([['Likes',p.likes],['Comments',p.comments],['Bookmarks',p.bookmarks],['Shares',p.shares],['Continuations',p.continuations],['Reports',p.reports]].map(([l,v])=>({label:l,val:v,color:COL[0]})),{max:Math.max(1,p.likes,p.comments,p.bookmarks,p.shares)})}
  <p class="hint">Avg dwell ${p.avg_dwell_sec}s · ${pc(p.completion_rate*100,0)} of viewers voted</p>
  <h4>Views, last 14 days</h4>${barChart(p.daily_views.map((_,i)=>dt(addDays(D.meta.as_of,i-13))),[{name:'Views',vals:p.daily_views,color:COL[2]}],{h:150,pl:34})}
  <h4>Traffic sources</h4>${hbars(Object.entries(p.sources).map(([k,v],i)=>({label:cap(k),val:v*100,color:COL[i]})),{fmt:v=>pc(v,0),max:100})}`}
 el.className='on';el.innerHTML=`<div class="dbk" data-adm="close"></div><aside class="dpn" role="dialog" aria-modal="true" aria-label="Details">${h}</aside>`;const c=$('.dpn',el);if(c)c.focus()}
/* ---------- shell / paint ---------- */
function shell(s){const dark=B.st.set.dark;root.innerHTML=`<div class="adm"><aside class="adm-side"><a href="#/admin" class="adm-brand">${B.ic('branch')}Branchline<em>Admin</em></a><nav aria-label="Admin sections">${TABS.map(([k,l,i])=>`<a href="#/admin/${k}" class="adm-nv" data-tab="${k}">${ic(i)}${l}</a>`).join('')}</nav>
<div class="adm-who"><span class="adm-av" style="background:var(--g);color:var(--on)">${esc(ini(s.name))}</span><span><b>${esc(s.name)}</b><small>${esc(s.role)}</small></span></div></aside>
<div class="adm-main"><header class="adm-top"><div><h1 id="adm-h"></h1><small id="adm-s"></small></div><div class="adm-act"><span id="adm-rg"></span><span class="adm-demo">Demo data</span><button class="adm-ib" data-adm="theme" aria-label="Toggle dark mode">${ic('moon')}</button><a class="adm-btn ghost sm" href="#/home">${ic('home')}App</a><button class="adm-btn ghost sm" data-adm="logout">${ic('logout')}Sign out</button></div></header><div id="adm-body" class="adm-body"></div></div><div id="adm-dr"></div></div>`}
function paint(){const t=TABS.find(x=>x[0]===tab);$$('.adm-nv').forEach(a=>a.classList.toggle('on',a.dataset.tab===tab));$('#adm-h').textContent=t[1];
 $('#adm-s').textContent='Data as of '+dty(D.meta.as_of);$('#adm-rg').innerHTML=tab==='overview'?`<select class="adm-in sm" data-adm-sel="range" aria-label="Date range">${[7,30,90].map(r=>`<option value="${r}" ${S.range===r?'selected':''}>Last ${r} days</option>`).join('')}</select>`:'';
 $('#adm-body').innerHTML=V[tab]();scrollTo(0,0);drawer()}
const re=(id,fn)=>{const e=$(id);if(e)e.innerHTML=fn()};
/* ---------- export ---------- */
function dl(name,mime,text){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type:mime}));a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500)}
function csv(rows){if(!rows.length)return'';const flat=rows.map(r=>{const o={};for(const[k,v]of Object.entries(r)){if(v&&typeof v==='object'&&!Array.isArray(v))for(const[a,b]of Object.entries(v))o[k+'_'+a]=b;else o[k]=Array.isArray(v)?JSON.stringify(v):v}return o}),keys=[...new Set(flat.flatMap(Object.keys))],q=v=>{v=v==null?'':String(v);return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v};return[keys.join(','),...flat.map(r=>keys.map(k=>q(r[k])).join(','))].join('\n')}
/* ---------- actions ---------- */
const setPath=(p,v)=>{const[a,b]=p.split('.');if(b){S[a][b]=v;S[a].page=0}else S[a]=v};
const ACT={
 pw(b){const i=$('#adm-p');i.type=i.type==='password'?'text':'password';b.setAttribute('aria-label',i.type==='password'?'Show password':'Hide password')},
 logout(){store.del(SKEY);S.drawer=null;B.toast('Signed out');location.hash='#/admin/login'},
 theme(){B.setDark(!B.st.set.dark)},
 sort(b){const st=S[b.dataset.t],k=b.dataset.k;st.dir=st.sort===k?-st.dir:(['name','plan','status','title','creator','category'].includes(k)?1:-1);st.sort=k;st.page=0;re(b.dataset.t==='u'?'#u-res':'#p-res',b.dataset.t==='u'?usersRes:postsRes)},
 page(b){const st=S[b.dataset.t];st.page=Math.max(0,st.page+ +b.dataset.d);re(b.dataset.t==='u'?'#u-res':'#p-res',b.dataset.t==='u'?usersRes:postsRes)},
 open(b){S.drawer={t:b.dataset.t,id:b.dataset.id};drawer()},close(){S.drawer=null;drawer()},
 csv(b){const k=b.dataset.k;dl('branchline-'+k+'.csv','text/csv',csv(D[k]));B.toast('Downloaded '+k+'.csv')},
 json(b){const o=b.dataset.k==='live'?{exported:new Date().toISOString(),live:TRK.data()}:{exported:new Date().toISOString(),meta:D.meta,users:D.users,posts:D.posts,daily:D.daily,monthly:D.monthly,transactions:D.transactions,metrics:D.metrics,live:TRK.data()};dl('branchline-'+b.dataset.k+'.json','application/json',JSON.stringify(o,null,2));B.toast('Export ready')},
 resetlive(){if(confirm('Clear everything recorded by the live tracker in this browser?')){TRK.reset();paint();B.toast('Live tracking reset')}}};
function onClick(e){const b=e.target.closest('[data-adm]');if(!b||!root.contains(b))return;const h=ACT[b.dataset.adm];if(h){if(b.dataset.adm!=='pw'||b.tagName==='BUTTON')e.preventDefault();if(b.classList.contains('dbk')&&e.target!==b)return;h(b,e)}}
function onInput(e){const t=e.target;if(t.dataset.admIn){setPath(t.dataset.admIn,t.value);const k=t.dataset.admIn[0];re(k==='u'?'#u-res':'#p-res',k==='u'?usersRes:postsRes)}}
function onChange(e){const t=e.target,p=t.dataset.admSel;if(!p)return;if(p==='range'){S.range=+t.value;paint()}else{setPath(p,t.value);const k=p[0];re(k==='u'?'#u-res':'#p-res',k==='u'?usersRes:postsRes)}}
function bind(){if(bound)return;bound=1;root.addEventListener('click',onClick);root.addEventListener('input',onInput);root.addEventListener('change',onChange);
 root.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.matches('tr[data-adm]'))ACT.open(e.target);if(e.key==='Escape'&&S.drawer)ACT.close()})}
/* ---------- public API ---------- */
async function mount(arg,bridge){B=bridge;root=$('#admin');bind();const s=sess();
 if(!s&&arg!=='login'){location.hash='#/admin/login';return}
 if(s&&arg==='login'){location.hash='#/admin';return}
 if(!D)root.innerHTML='<div class="adm-load">Loading dashboard…</div>';
 try{await load()}catch(e){root.innerHTML=`<div class="adm-login"><div class="adm-lc"><h1>Couldn’t load data</h1><p>${esc(e.message)}</p><a class="adm-back" href="#/home">← Back to Branchline</a></div></div>`;return}
 if(location.hash.indexOf('#/admin')!==0)return;
 if(!s){root.innerHTML=loginView();bindLogin();return}
 const nt=TABS.some(t=>t[0]===arg)?arg:'overview';
 if(!$('#adm-body')||sessUser!==s.u){sessUser=s.u;shell(s)}tab=nt;S.drawer=null;paint()}
return{mount,refreshTheme(){}}})();
