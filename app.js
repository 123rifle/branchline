'use strict';
/* ================= DATA ================= */
const H=36e5,T0=Date.now(),hrs=h=>T0-h*H;
const CATS=['Business','Relationships','Life Decisions','Technology','Psychology','Entertainment','Education','Hypotheticals','Personal Growth'];
const U={
 me:{id:'me',n:'Alex Rahman',un:'alexr',bio:'Product designer. I post the questions I can’t answer alone.',fo:128,fg:94,c:'#245C45'},
 mara:{id:'mara',n:'Mara Okafor',un:'maraokafor',v:1,bio:'Serial founder. Writing the business dilemmas nobody warns you about.',fo:18400,fg:212,c:'#A9612B'},
 devon:{id:'devon',n:'Devon Hale',un:'devonhale',bio:'Engineering manager. Career crossroads, honestly told.',fo:6210,fg:340,c:'#3E5C76'},
 sana:{id:'sana',n:'Dr. Sana Iqbal',un:'drsanaiqbal',v:1,bio:'Clinical psychologist. Everyday ethics, minus the lecture.',fo:22900,fg:98,c:'#7A4E6B'},
 theo:{id:'theo',n:'Theo Lindqvist',un:'theolind',bio:'Writes about technology twenty minutes into the future.',fo:9370,fg:150,c:'#5B6B3A'},
 priya:{id:'priya',n:'Priya Nair',un:'priyanair',bio:'Relationships, boundaries, and the group-chat fallout.',fo:4580,fg:421,c:'#B24A5A'}};
const mk=(id,u,cat,h,likes,t,d,ch,pid)=>({id,u,cat,t,d,ts:hrs(h),likes,pid,ch:ch.map(([t,v,next])=>({t,v,next}))});
const S=[
 mk('s1','mara','Business',5,842,'You discover your business partner has been quietly taking money. What do you do?','Eight years, one shared bank account, and a spreadsheet that doesn’t add up. You haven’t said a word yet.',[['Confront them immediately',412,'s2'],['Collect evidence first',903,'s3'],['Speak to a lawyer',288],['Say nothing and investigate',147]]),
 mk('s2','mara','Business',4,310,'They admit it, and ask for 30 days to pay it back. Do you agree?','The amount is £84,000. They cried. You still have to run the company on Monday.',[['Agree, with a written repayment schedule',271],['Refuse and dissolve the partnership',334,'s4'],['Agree only if they step back from the business',402]],'s1'),
 mk('s3','mara','Business',3,205,'Your records confirm it. Who do you tell first?','You now have two years of transfers in a folder. The next conversation decides everything.',[['Your accountant',520],['The other investors',233],['Your partner, privately',189]],'s1'),
 mk('s4','mara','Business',2,121,'Dissolving means splitting the client list. Do you tell clients why?','Three clients have already asked why the partners are “restructuring”.',[['Yes, openly',140],['A short, neutral announcement',380]],'s2'),
 mk('s5','devon','Life Decisions',9,634,'A rival offers 40% more pay. Your team just started the project you pitched for two years. Do you leave?','The offer expires Friday. Nobody on your team knows. Your manager promised you a promotion “after launch”.',[['Take the offer',188],['Stay and ship it',341],['Negotiate a counter-offer',612],['Ask for a delayed start date',96]]),
 mk('s6','sana','Psychology',14,1210,'A close friend asks for honest feedback on their novel. It isn’t good. What do you say?','They spent three years on it and are about to query agents. They said, “Be brutal, I can take it.”',[['Full honesty, now',302],['Name the strengths, then the problems',1480],['Say you’re not the right reader',211]]),
 mk('s7','theo','Technology',20,978,'In 2030 your employer offers an AI twin that attends meetings in your place. Do you accept?','It knows your calendar, writes in your voice, and summarises everything by evening. Your colleagues are already using theirs.',[['Accept fully',264],['Status meetings only',889],['Refuse',402],['Accept, but disclosed to everyone',731]]),
 mk('s8','priya','Relationships',30,455,'Your best friend’s partner told you something that would change how she sees him. Do you tell her?','He asked you to keep it between you. You see her on Saturday.',[['Tell her now',144],['Push him to tell her himself',690],['Stay out of it',97]]),
 mk('s9','me','Life Decisions',50,266,'Would you move abroad for a year with no promise of coming back?','A role in Lisbon, a lease with no end date, and a life you’d have to rebuild at 34.',[['Go, and figure it out there',320],['Go, but keep a return fund',415],['Stay put',128],['Ask to try six months first',204]])];
const CM=[
 {id:'c1',s:'s1',u:'sana',t:'Evidence first, every time. Confronting without proof gives them time to cover tracks.',l:64,ts:hrs(4)},
 {id:'c2',s:'s1',u:'devon',t:'The lawyer option is underrated. A letter changes how fast they respond.',l:31,ts:hrs(3.5)},
 {id:'c3',s:'s5',u:'priya',t:'Counter-offers rarely fix the reason you started looking.',l:48,ts:hrs(7)},
 {id:'c4',s:'s6',u:'mara',t:'Strengths first only works if they are real. People can tell.',l:77,ts:hrs(11)},
 {id:'c5',s:'s7',u:'theo',t:'Disclosure is the whole game. Secret twins would end trust in meetings.',l:52,ts:hrs(16)},
 {id:'c6',s:'s9',u:'sana',t:'Keep the return fund. Freedom to leave makes it easier to stay.',l:22,ts:hrs(30)},
 {id:'c7',s:'s9',u:'theo',t:'Lisbon in winter is underrated. Go.',l:15,ts:hrs(28)},
 {id:'c8',s:'s8',u:'devon',t:'Option two is hard, but it keeps both friendships intact.',l:19,ts:hrs(25)},
 {id:'c9',s:'s2',u:'priya',t:'A written schedule is the only version where you can sleep.',l:12,ts:hrs(3)}];
const N=[
 {id:'n1',k:'like',u:'devon',s:'s9',ts:hrs(2)},{id:'n2',k:'comment',u:'sana',s:'s9',ts:hrs(3)},{id:'n3',k:'follow',u:'theo',ts:hrs(5)},
 {id:'n4',k:'vote',u:'priya',s:'s9',ts:hrs(6)},{id:'n5',k:'branch',u:'mara',s:'s2',ts:hrs(9)},{id:'n6',k:'like',u:'sana',s:'s9',ts:hrs(26),r:1},
 {id:'n7',k:'follow',u:'priya',ts:hrs(30),r:1},{id:'n8',k:'comment',u:'theo',s:'s9',ts:hrs(48),r:1},{id:'n9',k:'vote',u:'mara',s:'s9',ts:hrs(50),r:1},
 {id:'n10',k:'branch',u:'mara',s:'s4',ts:hrs(70),r:1},{id:'n11',k:'like',u:'mara',s:'s9',ts:hrs(72),r:1}];
const NT={like:'liked your story',comment:'commented on your story',follow:'started following you',vote:'voted on your story',branch:'posted a new continuation to a branch you follow:'};
/* ================= ICONS ================= */
const P={home:'M3 11l9-8 9 8v10h-6v-6H9v6H3z',search:'M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.3-4.3',plus:'M12 5v14M5 12h14',branch:'M6 3v12M18 9a3 3 0 100-6 3 3 0 000 6zM6 21a3 3 0 100-6 3 3 0 000 6zM18 9c0 6-12 3-12 6',bell:'M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0',bookmark:'M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z',user:'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z',sliders:'M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0M14 4v4M8 10v4M16 16v4',heart:'M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 00-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 000-7.8z',msg:'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z',share:'M4 12v8h16v-8M16 6l-4-4-4 4M12 2v13',more:'M12 12h.01M5 12h.01M19 12h.01',check:'M20 6L9 17l-5-5',x:'M18 6L6 18M6 6l12 12'};
const ic=n=>`<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${P[n]}"/></svg>`;
/* ================= STATE / STORAGE ================= */
const KEY='branchline.v1',def={votes:{},liked:{},bm:{},fol:{mara:1,sana:1},mine:[],draft:null,cm:[],cl:{},read:{},hide:{},seen:[],link:{},set:{dark:0,email:1,push:1,priv:0},me:{}};
let st;try{st={...def,...JSON.parse(localStorage.getItem(KEY)||'{}')};st.set={...def.set,...st.set}}catch(e){st=JSON.parse(JSON.stringify(def))}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(st))}catch(e){}};
const T={feed:'fy',prof:'st',cat:'',edit:0};let Q='',lim=5,page='home',arg,D=null;
const newD=()=>({t:'',d:'',cat:'Business',ch:['',''],dur:24,chg:true,sh:false,cm:true});
/* ================= HELPERS ================= */
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ago=ts=>{const m=Math.max(1,(Date.now()-ts)/6e4|0);return m<60?m+'m':m<1440?(m/60|0)+'h':(m/1440|0)+'d'};
const fmt=n=>n>=1e4?(n/1e3).toFixed(1).replace('.0','')+'k':n.toLocaleString();
const all=()=>[...st.mine,...S],story=id=>all().find(s=>s.id===id),usr=id=>id==='me'?{...U.me,...st.me}:U[id];
const nxt=(s,i)=>s.ch[i].next||st.link[s.id+':'+i],cnt=(s,i)=>s.ch[i].v+(st.votes[s.id]===i?1:0);
const tot=s=>s.ch.reduce((a,_,i)=>a+cnt(s,i),0),cms=id=>[...CM,...st.cm].filter(c=>c.s===id).sort((a,b)=>b.ts-a.ts);
const unread=()=>N.filter(n=>!(n.r||st.read[n.id])).length,cards=a=>a.map(s=>card(s)).join('');
const av=(u,z='')=>`<span class="av ${z}" style="background:${u.c}">${esc(u.n.replace('Dr. ','').split(' ').map(w=>w[0]).slice(0,2).join(''))}</span>`;
const vf=u=>u.v?`<span class="vf" title="Verified">${ic('check')}</span>`:'';
const empty=(t,d)=>`<div class="empty">${ic('branch')}<h3>${t}</h3><p>${d}</p></div>`;
let tt;const toast=m=>{const e=$('#toast');e.textContent=m;e.classList.add('on');clearTimeout(tt);tt=setTimeout(()=>e.classList.remove('on'),2200)};
const tabs=(k,a)=>`<div class="tabs" role="tablist">${a.map(([v,l])=>`<button role="tab" aria-selected="${T[k]===v}" class="${T[k]===v?'on':''}" data-act="tab" data-k="${k}" data-v="${v}">${l}</button>`).join('')}</div>`;
const fbtn=u=>u.id==='me'?'':`<button class="btn sm ${st.fol[u.id]?'ghost':''}" data-act="follow" data-u="${u.id}">${st.fol[u.id]?'Following':'Follow'}</button>`;
const urow=u=>`<div class="urow"><a href="#/u/${u.id}" class="who">${av(u)}<span><b>${esc(u.n)}${vf(u)}</b><small>@${u.un} · ${fmt(u.fo+(st.fol[u.id]&&!def.fol[u.id]?1:0))} followers</small></span></a>${fbtn(u)}</div>`;
/* ================= COMPONENTS ================= */
function card(s){
 const u=usr(s.u),op=s.opts||{},v=st.votes[s.id],closed=op.exp&&op.exp<Date.now(),t=tot(s),show=v!=null||op.sh||closed,lock=closed||(v!=null&&op.chg===false);
 const left=op.exp?Math.max(1,Math.round((op.exp-Date.now())/H)):0;
 const chs=s.ch.map((c,i)=>{const p=t?Math.round(cnt(s,i)/t*100):0;return `<button class="ch${v===i?' sel':''}" data-act="vote" data-i="${i}" ${lock?'disabled':''} aria-pressed="${v===i}" style="--p:${show?p:0}%"><span class="lb">${v===i?ic('check'):''}${esc(c.t)}${nxt(s,i)?ic('branch'):''}</span>${show?`<span class="pc">${p}%</span>`:''}</button>`}).join('');
 const lk=st.liked[s.id],bm=st.bm[s.id];
 return `<article class="card" data-id="${s.id}"><header><a href="#/u/${u.id}" class="who">${av(u)}<span><b>${esc(u.n)}${vf(u)}</b><small>@${u.un} · ${ago(s.ts)}</small></span></a>${fbtn(u)}
 <div class="mw"><button class="ib" data-act="more" aria-label="More options" aria-haspopup="true">${ic('more')}</button><div class="menu"><button data-act="share">Share link</button><button data-act="bm">${bm?'Remove bookmark':'Bookmark'}</button><button data-act="hide">Not interested</button><button data-act="report">Report</button></div></div></header>
 <div class="bd" data-act="open" role="link" tabindex="0"><span class="tag">${esc(s.cat)}</span>${s.pid?'<small class="cont"> Continuation</small>':''}<h3>${esc(s.t)}</h3><p>${esc(s.d)}</p></div>
 <div class="chs">${chs}</div><div class="mt">${t.toLocaleString()} votes · ${closed?'Voting closed':op.exp?`Closes in ${left}h`:'Open'}${v==null&&!show?' · Vote to see results':''}</div>
 <footer><button class="ab${lk?' on':''}" data-act="like" aria-pressed="${!!lk}">${ic('heart')}${fmt(s.likes+(lk?1:0))}</button><button class="ab" data-act="open">${ic('msg')}${cms(s.id).length}</button><button class="ab sp bm${bm?' on':''}" data-act="bm" aria-label="Bookmark" aria-pressed="${!!bm}">${ic('bookmark')}</button><button class="ab" data-act="share" aria-label="Share">${ic('share')}</button></footer></article>`}
const crow=(c,link)=>{const u=usr(c.u),l=!!st.cl[c.id];return `<div class="cm">${av(u,'s')}<div style="flex:1"><b>${esc(u.n)}</b> <small>· ${ago(c.ts)}</small><p>${esc(c.t)}</p>${link?`<small><a href="#/s/${c.s}">on “${esc(story(c.s)?.t||'')}”</a></small>`:''}</div><button class="ab${l?' on':''}" data-act="cl" data-id="${c.id}">${ic('heart')}${c.l+(l?1:0)}</button></div>`};
const NAV=[['home','Home','home'],['explore','Explore','search'],['create','Create','plus'],['branches','My Branches','branch'],['notifications','Notifications','bell'],['bookmarks','Bookmarks','bookmark'],['profile','Profile','user'],['settings','Settings','sliders']];
const side=()=>`<a href="#/home" class="logo">${ic('branch')}Branchline</a><nav>${NAV.filter(n=>n[0]!=='create').map(([k,l,i])=>`<a class="nv ${page===k||(k==='profile'&&page==='u'&&arg==='me')?'on':''}" href="#/${k}">${ic(i)}${l}${k==='notifications'&&unread()?`<span class="bdg">${unread()}</span>`:''}</a>`).join('')}</nav><a class="btn wide" href="#/create">${ic('plus')}Create story</a><a class="me" href="#/profile">${av(usr('me'),'s')}<span><b>${esc(usr('me').n)}</b><br><small>@${usr('me').un}</small></span></a>`;
const right=()=>{const l=all(),v=l.reduce((a,s)=>a+tot(s),0);return `<div class="rt"><h4>Trending topics</h4>${CATS.slice(0,5).map(c=>`<button class="tp" data-act="topic" data-v="${c}"><b>${c}</b><small>${l.filter(s=>s.cat===c).length} stories</small></button>`).join('')}</div><div class="rt"><h4>Suggested creators</h4>${Object.values(U).filter(u=>u.id!=='me'&&!st.fol[u.id]).slice(0,3).map(urow).join('')||'<small>You follow everyone here.</small>'}</div><div class="rt"><h4>Platform pulse</h4><div class="stat"><div><b>${fmt(v)}</b><small>votes cast</small></div><div><b>${l.length}</b><small>stories</small></div></div></div>`};
const bnav=()=>['home','explore','create','notifications','profile'].map(k=>{const i=NAV.find(n=>n[0]===k);return `<a href="#/${k}" aria-label="${i[1]}" class="${page===k?'on':''} ${k==='create'?'cb':''}">${ic(i[2])}</a>`}).join('');
/* ================= PAGES ================= */
function pgHome(){let l=all().filter(s=>!st.hide[s.id]);if(T.feed==='fl')l=l.filter(s=>st.fol[s.u]);
 l=T.feed==='tr'?[...l].sort((a,b)=>tot(b)-tot(a)):[...l].sort((a,b)=>b.ts-a.ts);
 return `<h1 class="h">Your feed</h1><p class="sub">Stories that ask you to decide. Pick a side, then follow the branch.</p>${tabs('feed',[['fy','For You'],['fl','Following'],['tr','Trending']])}${l.length?cards(l.slice(0,lim))+(l.length>lim?'<button class="btn ghost wide" data-act="load">Load more</button>':''):empty('Nothing here yet','Follow a few creators to fill this tab.')}`}
function exRes(){const q=Q.toLowerCase().trim(),c=T.cat;
 const l=all().filter(s=>!st.hide[s.id]&&(!c||s.cat===c)&&(!q||(s.t+s.d+s.cat+usr(s.u).n+usr(s.u).un).toLowerCase().includes(q)));
 if(q||c){const us=q?Object.values(U).filter(u=>u.id!=='me'&&(u.n+u.un+u.bio).toLowerCase().includes(q)):[];
  return (us.length?`<h2 class="sec">Creators</h2>${us.map(urow).join('')}`:'')+`<h2 class="sec">Stories</h2>`+(l.length?cards(l):empty('No results','Try another keyword or category.'))}
 const by=f=>cards([...l].sort(f).slice(0,2));
 return `<h2 class="sec">Trending stories</h2>${by((a,b)=>tot(b)-tot(a))}<h2 class="sec">Most discussed</h2>${by((a,b)=>cms(b.id).length-cms(a.id).length)}<h2 class="sec">Recently created</h2>${by((a,b)=>b.ts-a.ts)}<h2 class="sec">Popular creators</h2>${Object.values(U).filter(u=>u.id!=='me').sort((a,b)=>b.fo-a.fo).slice(0,3).map(urow).join('')}`}
const pgExplore=()=>`<h1 class="h">Explore</h1><p class="sub">Find the dilemmas people can’t stop debating.</p><div class="search">${ic('search')}<input id="q" type="search" placeholder="Search stories and creators" value="${esc(Q)}" aria-label="Search"></div><div class="chips">${['',...CATS].map(c=>`<button class="${T.cat===c?'on':''}" data-act="cat" data-v="${c}">${c||'All'}</button>`).join('')}</div><div id="res">${exRes()}</div>`;
function pvStory(){const o={chg:D.chg,sh:D.sh,cm:D.cm,exp:Date.now()+D.dur*H},c=D.ch.map(x=>x.trim());return {id:'prev',u:'me',cat:D.cat,t:D.t||'Your question appears here',d:D.d||'Add some context so people understand the situation.',ts:Date.now(),likes:0,opts:o,ch:(c.some(Boolean)?c:['Option one','Option two']).map(t=>({t:t||'Untitled choice',v:0}))}}
function pgCreate(){if(!D){D=newD()}if(!D.ld){if(st.draft&&!D.pid)D={...st.draft};D.ld=1}
 const par=D.pid&&story(D.pid);
 return `<h1 class="h">Create a story</h1><p class="sub">Present a situation. Let people decide what happens next.</p>${par?`<div class="panel"><small>Continuing from</small><br><b>${esc(par.t)}</b><br><small>Choice: ${esc(par.ch[D.ci].t)}</small></div>`:''}
 <div class="two"><form id="cf" novalidate><label class="fld">Question or title <small id="c1"></small><input id="ft" maxlength="120" value="${esc(D.t)}" placeholder="What would you do if…?"></label>
 <label class="fld">Context <small id="c2"></small><textarea id="fd" maxlength="300" placeholder="Set the scene.">${esc(D.d)}</textarea></label>
 <label class="fld">Category<select id="fc">${CATS.map(c=>`<option ${c===D.cat?'selected':''}>${c}</option>`).join('')}</select></label>
 <div class="fld">Choices (2–4)${D.ch.map((c,i)=>`<div class="cr"><input class="cin" maxlength="80" value="${esc(c)}" placeholder="Choice ${i+1}" aria-label="Choice ${i+1}">${D.ch.length>2?`<button type="button" class="ib" data-act="crem" data-i="${i}" aria-label="Remove choice">${ic('x')}</button>`:''}</div>`).join('')}${D.ch.length<4?`<button type="button" class="btn sm ghost" style="margin-top:8px" data-act="cadd">${ic('plus')}Add choice</button>`:''}</div>
 <label class="fld">Voting duration<select id="fu">${[[1,'1 hour'],[6,'6 hours'],[24,'24 hours'],[72,'3 days'],[168,'7 days']].map(([h,l])=>`<option value="${h}" ${h===D.dur?'selected':''}>${l}</option>`).join('')}</select></label>
 <label class="chk"><input type="checkbox" id="o1" ${D.chg?'checked':''}>Allow vote changes</label><label class="chk"><input type="checkbox" id="o2" ${D.sh?'checked':''}>Show results before voting</label><label class="chk"><input type="checkbox" id="o3" ${D.cm?'checked':''}>Allow comments</label>
 <div id="er" class="err" role="alert"></div><div style="display:flex;gap:8px"><button type="button" class="btn" data-act="pub">Publish</button><button type="button" class="btn ghost" data-act="draft">Save draft</button></div></form>
 <div><small>Live preview</small><div class="prev" id="pv" inert>${card(pvStory())}</div></div></div>`}
function readForm(){D.t=$('#ft').value;D.d=$('#fd').value;D.cat=$('#fc').value;D.dur=+$('#fu').value;D.chg=$('#o1').checked;D.sh=$('#o2').checked;D.cm=$('#o3').checked;D.ch=$$('.cin').map(i=>i.value);$('#c1').textContent=D.t.length+'/120';$('#c2').textContent=D.d.length+'/300'}
function pgStory(id){const s=story(id);if(!s)return empty('Story not found','It may have been removed.');
 if(!st.seen.includes(id)){st.seen.unshift(id);st.seen=st.seen.slice(0,20);save()}
 const par=s.pid&&story(s.pid),op=s.opts||{},rel=all().filter(x=>x.id!==id&&x.cat===s.cat).slice(0,3),cl=cms(id);
 return `<a href="${par?'#/s/'+par.id:'#/home'}" class="btn sm ghost">← ${par?'Previous node':'Back to feed'}</a><div style="height:16px"></div>${card(s)}
 <div class="stat"><div><b>${fmt(tot(s))}</b><small>votes</small></div><div><b>${fmt(s.likes+(st.liked[id]?1:0))}</b><small>likes</small></div><div><b>${cl.length}</b><small>comments</small></div></div>
 <h2 class="sec">Story paths</h2>${s.ch.map((c,i)=>{const n=nxt(s,i),ns=n&&story(n);return ns?`<a class="branch" href="#/s/${n}"><small>${esc(c.t)}${st.votes[id]===i?' · your pick':''}</small><b>${esc(ns.t)}</b></a>`:`<div class="branch"><small>${esc(c.t)}</small><button class="btn sm ghost" data-act="cont" data-i="${i}">${ic('branch')}Write what happens next</button></div>`}).join('')}
 <h2 class="sec">Discussion</h2>${op.cm===false?'<small>The creator turned comments off.</small>':`<div class="cr"><input id="ct" maxlength="280" placeholder="Add to the discussion" aria-label="Comment"><button class="btn" data-act="cpost">Post</button></div>${cl.map(c=>crow(c)).join('')||empty('No comments yet','Start the conversation.')}`}
 ${rel.length?`<h2 class="sec">Related stories</h2>${cards(rel)}`:''}`}
function pgBranches(){const roots=all().filter(s=>!s.pid&&s.ch.some((_,i)=>nxt(s,i)));
 const node=(id,lab,mine)=>{const s=story(id);if(!s)return'';const k=s.ch.map((c,i)=>nxt(s,i)?node(nxt(s,i),c.t,st.votes[id]===i):'').join('');return `<li><a class="node${st.seen.includes(id)?' seen':''}" href="#/s/${id}">${lab?`<em>${mine?'Your pick · ':''}${esc(lab)}</em>`:''}<b>${esc(s.t)}</b><small>${esc(usr(s.u).n)} · ${tot(s).toLocaleString()} votes</small></a>${k?`<ul>${k}</ul>`:''}</li>`};
 const sn=st.seen.map(story).filter(Boolean);
 return `<h1 class="h">My branches</h1><p class="sub">Every choice leads somewhere. Green edges mark nodes you’ve visited.</p>${roots.map(r=>`<ul class="tree">${node(r.id)}</ul>`).join('')||empty('No branches yet','Write a continuation to start one.')}<h2 class="sec">Recently explored</h2>${sn.length?sn.map(s=>`<a class="branch" href="#/s/${s.id}"><small>${esc(s.cat)}</small><b>${esc(s.t)}</b></a>`).join(''):empty('Nothing explored','Open a story to begin your path.')}`}
function pgNotif(){return `<div class="row" style="border:0"><h1 class="h">Notifications</h1><button class="btn sm ghost" data-act="markall" ${unread()?'':'disabled'}>Mark all read</button></div>${N.length?[...N].sort((a,b)=>b.ts-a.ts).map(n=>{const u=usr(n.u),s=n.s&&story(n.s),rd=n.r||st.read[n.id];return `<div class="ntf ${rd?'':'un'}">${av(u,'s')}<a href="#/${n.k==='follow'?'u/'+u.id:'s/'+n.s}" data-act="nread" data-id="${n.id}"><b>${esc(u.n)}</b> ${NT[n.k]}${s?` <i>“${esc(s.t.slice(0,60))}${s.t.length>60?'…':''}”</i>`:''}<br><small>${ago(n.ts)} ago</small></a>${rd?'':`<button class="btn sm ghost" data-act="nmark" data-id="${n.id}">Mark read</button>`}</div>`}).join(''):empty('All quiet','No notifications.')}`}
const pgBm=()=>{const l=all().filter(s=>st.bm[s.id]);return `<h1 class="h">Bookmarks</h1><p class="sub">Stories you’re saving for later.</p>${l.length?cards(l):empty('No bookmarks yet','Tap the bookmark icon on any story to keep it here.')}`};
function pgProfile(id){id=id||'me';const u=usr(id);if(!u)return empty('Profile not found','');const me=id==='me',ms=all().filter(s=>s.u===id);let b;
 if(T.prof==='st')b=ms.length?cards(ms):empty('No stories yet','Published stories appear here.');
 else if(T.prof==='rp'){const c=[...CM,...st.cm].filter(x=>x.u===id);b=c.length?c.map(x=>crow(x,1)).join(''):empty('No replies yet','')}
 else{const l=me?all().filter(s=>st.liked[s.id]):[];b=l.length?cards(l):empty('Nothing liked yet','Liked stories appear here.')}
 const fg=me?u.fg+Object.keys(st.fol).length-2:u.fg;
 return `<div class="panel"><div style="display:flex;gap:16px;align-items:center">${av(u,'lg')}<div style="flex:1"><h1 class="h" style="font-size:26px">${esc(u.n)}${vf(u)}</h1><small>@${u.un}</small></div>${me?`<button class="btn ghost" data-act="pedit">${T.edit?'Cancel':'Edit profile'}</button>`:fbtn(u)}</div>
 ${T.edit&&me?`<div style="margin-top:16px"><label class="fld">Display name<input id="pn" maxlength="40" value="${esc(u.n)}"></label><label class="fld">Bio<textarea id="pb" maxlength="160">${esc(u.bio)}</textarea></label><button class="btn" data-act="psave">Save changes</button></div>`:`<p style="margin:16px 0">${esc(u.bio)}</p>`}
 <div class="stat"><div><b>${fmt(u.fo+(st.fol[id]&&!def.fol[id]?1:0))}</b><small>followers</small></div><div><b>${fg}</b><small>following</small></div><div><b>${ms.length}</b><small>stories</small></div></div></div>${tabs('prof',[['st','Stories'],['rp','Replies'],['lk','Liked']])}${b}`}
function pgSet(){const tg=(k,l,d)=>`<div class="row"><div><b>${l}</b><br><small>${d}</small></div><label class="tg"><input type="checkbox" data-act="tog" data-k="${k}" ${st.set[k]?'checked':''} aria-label="${l}"><i></i></label></div>`,u=usr('me');
 return `<h1 class="h">Settings</h1><p class="sub">Account, notifications, appearance and privacy.</p><h2 class="sec">Account</h2><div class="panel"><b>${esc(u.n)}</b><br><small>@${u.un} · alex@branchline.demo</small><br><br><a class="btn sm ghost" href="#/profile">Edit profile</a></div>
 <h2 class="sec">Notifications</h2>${tg('email','Email digests','A weekly summary of your branches')}${tg('push','Push notifications','Votes, comments and continuations')}<h2 class="sec">Appearance</h2>${tg('dark','Dark mode','Easier on the eyes at night')}<h2 class="sec">Privacy</h2>${tg('priv','Private profile','Only followers see your stories')}<h2 class="sec">Demo</h2><button class="btn danger" data-act="reset">Log out and reset demo data</button>`}
/* ================= ROUTER ================= */
const R={home:pgHome,explore:pgExplore,create:pgCreate,branches:pgBranches,notifications:pgNotif,bookmarks:pgBm,profile:pgProfile,settings:pgSet,s:pgStory,u:pgProfile};
function draw(keepMain){$('#side').innerHTML=side();$('#right').innerHTML=right();$('#bnav').innerHTML=bnav();$('#mhs').innerHTML=ic('search');if(!keepMain)$('#main').innerHTML=R[page](arg)}
function route(){const[p,a]=location.hash.slice(2).split('/');page=R[p]?p:'home';arg=a;lim=5;T.edit=0;document.documentElement.dataset.theme=st.set.dark?'dark':'';draw(false);scrollTo(0,0)}
const re=()=>{const y=scrollY;draw(page==='create');scrollTo(0,y)};
/* ================= ACTIONS ================= */
async function share(id){const url=location.href.split('#')[0]+'#/s/'+id;try{if(navigator.share){await navigator.share({title:story(id).t,url});return}await navigator.clipboard.writeText(url);toast('Link copied')}catch(e){if(e.name!=='AbortError')toast('Copy this link: '+url)}}
function publish(){readForm();const ch=D.ch.map(x=>x.trim()).filter(Boolean),er=[];
 if(D.t.trim().length<10)er.push('Title must be at least 10 characters.');if(ch.length<2)er.push('Add at least two choices.');
 if(er.length){$('#er').textContent=er.join(' ');return}
 const s={id:'u'+Date.now(),u:'me',cat:D.cat,t:D.t.trim(),d:D.d.trim()||'No additional context.',ts:Date.now(),likes:0,pid:D.pid,ch:ch.map(t=>({t,v:0})),opts:{chg:D.chg,sh:D.sh,cm:D.cm,exp:Date.now()+D.dur*H}};
 st.mine.unshift(s);if(D.pid)st.link[D.pid+':'+D.ci]=s.id;st.draft=null;D=newD();save();toast('Story published');location.hash='#/s/'+s.id}
const A={
 vote(id,b){const s=story(id),i=+b.dataset.i,cur=st.votes[id],o=s.opts||{};if(o.exp&&o.exp<Date.now())return toast('Voting has closed');if(cur===i)return;if(cur!=null&&o.chg===false)return toast('Votes can’t be changed on this story');st.votes[id]=i;save();re();toast(cur==null?'Vote recorded':'Vote changed')},
 like(id){st.liked[id]=!st.liked[id];save();re()},bm(id){st.bm[id]=!st.bm[id];save();re();toast(st.bm[id]?'Saved to bookmarks':'Bookmark removed')},
 follow(id,b){const u=b.dataset.u;st.fol[u]=!st.fol[u];save();re();toast(st.fol[u]?'Following '+usr(u).n:'Unfollowed')},
 open(id){location.hash='#/s/'+id},share(id){share(id)},hide(id){st.hide[id]=1;save();re();toast('We’ll show fewer stories like this')},report(){toast('Thanks, we’ll review this story')},
 tab(_,b){T[b.dataset.k]=b.dataset.v;re()},cat(_,b){T.cat=b.dataset.v;re()},topic(_,b){T.cat=b.dataset.v;location.hash='#/explore';re()},load(){lim+=5;re()},
 cl(_,b){st.cl[b.dataset.id]=!st.cl[b.dataset.id];save();re()},
 cpost(){const v=$('#ct').value.trim();if(!v)return toast('Write something first');st.cm.push({id:'c'+Date.now(),s:arg,u:'me',t:v,l:0,ts:Date.now()});save();re();toast('Comment posted')},
 nread(_,b){st.read[b.dataset.id]=1;save()},nmark(_,b){st.read[b.dataset.id]=1;save();re()},markall(){N.forEach(n=>st.read[n.id]=1);save();re();toast('All caught up')},
 pedit(){T.edit=!T.edit;re()},psave(){const n=$('#pn').value.trim();if(!n)return toast('Name can’t be empty');st.me={n,bio:$('#pb').value.trim()};T.edit=0;save();re();toast('Profile updated')},
 tog(_,b){st.set[b.dataset.k]=b.checked;save();if(b.dataset.k==='dark')document.documentElement.dataset.theme=b.checked?'dark':'';toast('Saved')},
 reset(){if(confirm('Reset all demo data?')){localStorage.removeItem(KEY);location.hash='#/home';location.reload()}},
 cadd(){readForm();if(D.ch.length<4)D.ch.push('');re()},crem(_,b){readForm();D.ch.splice(+b.dataset.i,1);re()},
 draft(){readForm();st.draft={...D};save();toast('Draft saved')},pub:publish,
 cont(id,b){const s=story(id);D={...newD(),pid:id,ci:+b.dataset.i,cat:s.cat,ld:1};location.hash='#/create'}};
document.addEventListener('click',e=>{const b=e.target.closest('[data-act]'),a=b&&b.dataset.act;
 $$('.mw.open').forEach(w=>{if(!(a==='more'&&w.contains(b)))w.classList.remove('open')});
 if(!b||!A[a])return;if(a==='more'){b.closest('.mw').classList.toggle('open');return}
 const c=b.closest('[data-id]');A[a](c?c.dataset.id:arg,b)});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.matches('.bd'))A.open(e.target.closest('[data-id]').dataset.id)});
document.addEventListener('input',e=>{if(e.target.id==='q'){Q=e.target.value;$('#res').innerHTML=exRes();return}
 if(e.target.closest('#cf')){readForm();$('#pv').innerHTML=card(pvStory())}});
addEventListener('hashchange',route);
route();if(page==='create')readForm();
