'use strict';
/* Branchline usage tracker. Records how long this browser's user is really active in the app
   and every interaction, in localStorage. The admin dashboard "Live" tab reads this. */
window.TRK=(()=>{
const KEY='branchline.analytics.v1',IDLE=60e3,TICK=5e3,GAP=30*60e3;
const day=t=>{const d=new Date(t||Date.now());return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
let a;try{a=JSON.parse(localStorage.getItem(KEY)||'null')}catch(e){}
if(!a||a.v!==1)a={v:1,first:Date.now(),active:0,sessions:[],ev:[],pv:{},st:{},se:[],dy:{},tc:{}};
if(!a.tc)a.tc={};
const now=Date.now();let cur=a.sessions[a.sessions.length-1];
if(!cur||now-cur.end>GAP){cur={id:'ss'+now,start:now,end:now,active:0,pv:0,ev:0};a.sessions.push(cur);a.sessions=a.sessions.slice(-200)}
const dd=()=>a.dy[day()]||(a.dy[day()]={ms:0,ev:0,ss:0});
if(cur.start===now)dd().ss++;
let last=now,story=null,dirty=1;
const save=()=>{if(!dirty)return;try{localStorage.setItem(KEY,JSON.stringify(a));dirty=0}catch(e){}};
const touch=()=>{last=Date.now()};['pointerdown','keydown','scroll','touchstart','mousemove'].forEach(k=>addEventListener(k,touch,{passive:true}));
setInterval(()=>{const t=Date.now();if(document.hidden||t-last>IDLE)return;cur.active+=TICK;cur.end=t;a.active+=TICK;dd().ms+=TICK;
 if(story){const s=a.st[story]||(a.st[story]={});s.dwell=(s.dwell||0)+TICK}dirty=1;save()},TICK);
document.addEventListener('visibilitychange',()=>{if(document.hidden){cur.end=Date.now();dirty=1;save()}});addEventListener('pagehide',()=>{dirty=1;save()});
const bump=(o,k)=>{o[k]=(o[k]||0)+1};
return{
 page(p){bump(a.pv,p);cur.pv++;cur.end=Date.now();dirty=1;save()},
 view(id){story=id||null;if(id){const s=a.st[id]||(a.st[id]={});bump(s,'views');dirty=1}},
 ev(type,id,cat){const t=Date.now();a.ev.push({t,type,s:id||null,c:cat||null});a.ev=a.ev.slice(-500);bump(a.tc,type);cur.ev++;cur.end=t;dd().ev++;
  if(id){const s=a.st[id]||(a.st[id]={});bump(s,type)}dirty=1;save()},
 search(q){q=(q||'').trim().toLowerCase();if(q.length<2)return;a.se.push({t:Date.now(),q});a.se=a.se.slice(-100);dirty=1;save()},
 data:()=>a,day,
 reset(){a={v:1,first:Date.now(),active:0,sessions:[],ev:[],pv:{},st:{},se:[],dy:{},tc:{}};cur={id:'ss'+Date.now(),start:Date.now(),end:Date.now(),active:0,pv:0,ev:0};a.sessions.push(cur);dirty=1;save()}}
})();
