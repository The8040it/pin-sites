(()=>{"use strict";
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const LS={get(k,d){try{const v=localStorage.getItem("pc-"+k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem("pc-"+k,JSON.stringify(v))}catch(e){}}};
const phone=()=>innerWidth<720||innerHeight<=520;
const SECS=window.PCDATA||[];
const ALL=[];
SECS.forEach(s=>{s.items.forEach((it,i)=>ALL.push({h:it[0],l:it[1],i:it[2]||"🔗",sec:s,fold:null,k:s.id+":"+i}));
  s.folders.forEach((f,fi)=>f.items.forEach((it,i)=>ALL.push({h:it[0],l:it[1],i:it[2]||"📄",sec:s,fold:f,fi,k:s.id+":f"+fi+":"+i})));
  s.n=s.items.length+s.folders.reduce((a,f)=>a+f.items.length,0);});
const byHref=h=>ALL.find(a=>a.h===h);
// normalize Hebrew/Yiddish for search: strip niqqud, unify Yiddish ligatures and finals
const norm=s=>String(s).toLowerCase().normalize("NFKD").replace(/[\u0591-\u05C7\uFB1E]/g,"").replace(/\u05F0/g,"וו").replace(/\u05F1/g,"וי").replace(/\u05F2/g,"יי")
 .replace(/[ךםןףץ]/g,c=>({"ך":"כ","ם":"מ","ן":"נ","ף":"פ","ץ":"צ"}[c])).replace(/[\u05f3'"`׳״\-–—_.,()]/g," ").replace(/\s+/g," ").trim();
ALL.forEach(a=>a.n=norm(a.l+" "+(a.fold?a.fold.n:"")+" "+a.sec.s+" "+a.h.replace(/^https?:\/\//,"").replace(/[-_/.]/g," ")));
const match=(q)=>{const t=norm(q).split(" ").filter(Boolean);if(!t.length)return[];return ALL.filter(a=>t.every(w=>a.n.includes(w)))};
const hl=(label,q)=>{const t=norm(q).split(" ").filter(Boolean);if(!t.length)return esc(label);
  // highlight on the original string by matching each char's normalized form
  const map=[];let ns="";for(let i=0;i<label.length;i++){const n=norm(label[i]);if(label[i]===" "){ns+=" ";map.push(i);continue}for(const ch of n){ns+=ch;map.push(i)}}
  const mark=new Array(label.length).fill(false);const nl=ns;t.forEach(w=>{let p=nl.indexOf(w);while(p>-1){for(let j=p;j<p+w.length;j++)mark[map[j]]=true;p=nl.indexOf(w,p+w.length)}});
  let o="",on=false;for(let i=0;i<label.length;i++){if(mark[i]&&!on){o+="<mark>";on=true}if(!mark[i]&&on){o+="</mark>";on=false}o+=esc(label[i])}if(on)o+="</mark>";return o};

/* ---------- icons ---------- */
const FOLD=(badge,big)=>`<svg class="fold" viewBox="0 0 48 48" aria-hidden="true"><path d="M4 10.5A2.5 2.5 0 0 1 6.5 8h11l4 4h20A2.5 2.5 0 0 1 44 14.5V36a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3z" fill="url(#fb)"/><path d="M4 17.5A2.5 2.5 0 0 1 6.5 15h35a2.5 2.5 0 0 1 2.5 2.5V36a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3z" fill="url(#ff)"/><path d="M4 18h40" stroke="#fff6d6" stroke-width="1" opacity=".7"/></svg>`+(badge?`<span class="badge">${badge}</span>`:"");
const LOGO=`<svg viewBox="0 0 24 24" aria-hidden="true"><g fill="url(#lg)"><rect x="2" y="2" width="9.4" height="9.4" rx="1.2"/><rect x="12.6" y="2" width="9.4" height="9.4" rx="1.2"/><rect x="2" y="12.6" width="9.4" height="9.4" rx="1.2"/><rect x="12.6" y="12.6" width="9.4" height="9.4" rx="1.2"/></g></svg>`;
const APPI={
 explorer:`<svg class="appico" viewBox="0 0 48 48"><path d="M4 11a3 3 0 0 1 3-3h11l4 4h19a3 3 0 0 1 3 3v21a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3z" fill="#e2ad3f"/><path d="M4 18a3 3 0 0 1 3-3h34a3 3 0 0 1 3 3v18a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3z" fill="#f7d06a"/><rect x="11" y="23" width="26" height="4" rx="2" fill="#1d3a7a"/></svg>`,
 browser:`<svg class="appico" viewBox="0 0 48 48"><circle cx="24" cy="24" r="19" fill="url(#eg)"/><path d="M10 26c2-9 10-13 17-12 7 1 11 6 10 11-1 4-6 5-10 4-3-1-3-4 0-5" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".92"/></svg>`,
 settings:`<svg class="appico" viewBox="0 0 48 48"><circle cx="24" cy="24" r="19" fill="#1b2f63"/><g fill="none" stroke="#e8c871" stroke-width="3.2"><circle cx="24" cy="24" r="6"/><path d="M24 9v5M24 34v5M9 24h5M34 24h5M13.4 13.4l3.5 3.5M31.1 31.1l3.5 3.5M13.4 34.6l3.5-3.5M31.1 16.9l3.5-3.5" stroke-linecap="round"/></g></svg>`,
 pc:`<svg class="appico" viewBox="0 0 48 48"><rect x="5" y="8" width="38" height="25" rx="3" fill="#13285a" stroke="#d9b45c" stroke-width="2"/><rect x="9" y="12" width="30" height="17" rx="1" fill="#2a56b8"/><path d="M18 40h12M24 33v7" stroke="#d9b45c" stroke-width="3" stroke-linecap="round"/></svg>`};
const tile=(e,lt)=>`<span class="tile${lt?" lt":""}">${esc(e)}</span>`;
const itemIcon=a=>/\.pdf($|\?)/i.test(a.h)?tile("📄",1):tile(a.i);
const secIcon=s=>FOLD(s.ic);

document.body.insertAdjacentHTML("afterbegin",'<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><linearGradient id="fb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6dc8e"/><stop offset="1" stop-color="#d8a83c"/></linearGradient><linearGradient id="ff" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe7a3"/><stop offset="1" stop-color="#e9b64a"/></linearGradient><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f7e2a0"/><stop offset="1" stop-color="#c9952f"/></linearGradient><linearGradient id="eg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f3d27a"/><stop offset=".55" stop-color="#c9952f"/><stop offset="1" stop-color="#14306b"/></linearGradient></defs></svg>');
/* ---------- windows ---------- */
const winsEl=$("#wins");let Z=10,WID=0;const WINS=[];
const APPS={explorer:{name:"File Explorer",icon:APPI.explorer},browser:{name:"Browser",icon:APPI.browser},settings:{name:"Settings",icon:APPI.settings}};
function createWin(app,opt={}){
 const id=++WID;const el=document.createElement("section");el.className="w";el.setAttribute("role","dialog");
 el.innerHTML=`<div class="tbar"><div class="ti"><span class="tic">${APPS[app].icon}</span><span class="wt"></span></div>
 <button class="wb mn" aria-label="Minimize"><svg viewBox="0 0 16 16"><path d="M3 8.5h10"/></svg></button>
 <button class="wb mx" aria-label="Maximize"><svg viewBox="0 0 16 16"><rect x="3.5" y="3.5" width="9" height="9" rx="1"/></svg></button>
 <button class="wb cl" aria-label="Close"><svg viewBox="0 0 16 16"><path d="M4 4l8 8M12 4l-8 8"/></svg></button></div><div class="wbody"></div><div class="rsz"></div>`;
 const W={id,app,el,body:$(".wbody",el),max:false,min:false,title:""};
 const cw=Math.min(opt.w||860,innerWidth-40),ch=Math.min(opt.h||560,innerHeight-110);
 const n=WINS.length;el.style.width=cw+"px";el.style.height=ch+"px";
 el.style.left=Math.max(10,Math.round((innerWidth-cw)/2-120+n*36))+"px";el.style.top=Math.max(10,Math.round((innerHeight-48-ch)/2-60+n*30))+"px";
 W.setTitle=(t,suf)=>{W.title=t;$(".wt",el).innerHTML="<bdi>"+esc(t)+"</bdi>"+(suf?" – "+esc(suf):"");renderTB()};
 $(".mn",el).onclick=e=>{e.stopPropagation();minimize(W)};
 $(".mx",el).onclick=e=>{e.stopPropagation();toggleMax(W)};
 $(".cl",el).onclick=e=>{e.stopPropagation();closeWin(W)};
 el.addEventListener("pointerdown",()=>focusWin(W),true);
 const tb=$(".tbar",el);
 tb.addEventListener("dblclick",e=>{if(!e.target.closest(".wb")&&!phone())toggleMax(W)});
 drag(tb,W);resize($(".rsz",el),W);
 winsEl.appendChild(el);WINS.push(W);
 if(phone()||opt.max)setMax(W,true);
 focusWin(W);return W;}
function drag(h,W){let sx,sy,ox,oy,on=false;
 h.addEventListener("pointerdown",e=>{if(e.target.closest(".wb")||phone()||e.button>0)return;
  if(W.max){ // drag down from maximized: restore under pointer
   const r=W.el.getBoundingClientRect();setMax(W,false);const w=W.el.offsetWidth;W.el.style.left=Math.max(0,e.clientX-w*(e.clientX/r.width))+"px";W.el.style.top="0px";}
  on=true;sx=e.clientX;sy=e.clientY;ox=W.el.offsetLeft;oy=W.el.offsetTop;h.setPointerCapture(e.pointerId);});
 h.addEventListener("pointermove",e=>{if(!on)return;let x=ox+e.clientX-sx,y=oy+e.clientY-sy;y=Math.max(0,Math.min(y,winsEl.clientHeight-40));x=Math.max(-W.el.offsetWidth+80,Math.min(x,innerWidth-80));W.el.style.left=x+"px";W.el.style.top=y+"px"});
 const end=e=>{if(!on)return;on=false;if(e.clientY<=2&&!phone())setMax(W,true)};h.addEventListener("pointerup",end);h.addEventListener("pointercancel",end);}
function resize(h,W){let sx,sy,ow,oh,on=false;
 h.addEventListener("pointerdown",e=>{on=true;sx=e.clientX;sy=e.clientY;ow=W.el.offsetWidth;oh=W.el.offsetHeight;h.setPointerCapture(e.pointerId);e.stopPropagation()});
 h.addEventListener("pointermove",e=>{if(!on)return;W.el.style.width=Math.max(320,ow+e.clientX-sx)+"px";W.el.style.height=Math.max(240,oh+e.clientY-sy)+"px"});
 h.addEventListener("pointerup",()=>on=false);}
function setMax(W,v){W.max=v;W.el.classList.toggle("max",v);$(".mx",W.el).innerHTML=v?`<svg viewBox="0 0 16 16"><rect x="3.5" y="5.5" width="7" height="7" rx="1"/><path d="M5.5 5.5v-1a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-1"/></svg>`:`<svg viewBox="0 0 16 16"><rect x="3.5" y="3.5" width="9" height="9" rx="1"/></svg>`;$(".mx",W.el).setAttribute("aria-label",v?"Restore":"Maximize")}
function toggleMax(W){setMax(W,!W.max)}
function focusWin(W){if(!W)return;W.min=false;W.el.classList.remove("min");W.el.style.zIndex=++Z;WINS.forEach(o=>o.el.classList.toggle("focus",o===W));closeStart();renderTB()}
function minimize(W){W.min=true;W.el.classList.add("min");W.el.classList.remove("focus");renderTB()}
function closeWin(W){const i=WINS.indexOf(W);if(i<0)return;WINS.splice(i,1);W.el.remove();W.onclose&&W.onclose();renderTB()}
const topWin=()=>WINS.filter(w=>!w.min).sort((a,b)=>b.el.style.zIndex-a.el.style.zIndex)[0];
addEventListener("resize",()=>{if(phone())WINS.forEach(w=>setMax(w,true))});

/* ---------- taskbar ---------- */
const tbApps=$("#tbapps");
function renderTB(){const act=topWin();
 tbApps.innerHTML=Object.keys(APPS).map(a=>{const ws=WINS.filter(w=>w.app===a);const isAct=act&&act.app===a;
  return `<button class="tbb${ws.length?" run":""}${isAct?" act on":""}" data-app="${a}" aria-label="${APPS[a].name}" title="${APPS[a].name}${ws.length>1?" ("+ws.length+")":""}"><span class="tbi">${APPS[a].icon}</span></button>`}).join("");}
tbApps.addEventListener("click",e=>{const b=e.target.closest(".tbb");if(!b)return;const a=b.dataset.app;const ws=WINS.filter(w=>w.app===a);
 if(!ws.length){openApp(a);return}
 const act=topWin();
 if(ws.length===1){const w=ws[0];if(act===w&&!w.min)minimize(w);else focusWin(w);return}
 // cycle
 const i=ws.indexOf(act);focusWin(ws[(i+1)%ws.length]);});
function openApp(a,arg){if(a==="explorer")return Explorer(arg);if(a==="browser")return Browser(arg);if(a==="settings")return Settings();}

/* ---------- clock ---------- */
function tick(){const d=new Date();$("#ctime").textContent=d.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"});$("#cdate").textContent=d.toLocaleDateString("en-US",{month:"numeric",day:"numeric",year:"numeric"})}
tick();setInterval(tick,15000);
const fly=$("#flyout");
function hebDate(d){try{return new Intl.DateTimeFormat("he-u-ca-hebrew",{day:"numeric",month:"long",year:"numeric"}).format(d)}catch(e){return""}}
$("#clock").onclick=e=>{e.stopPropagation();if(!fly.hidden&&fly.dataset.k==="clock"){fly.hidden=true;return}const d=new Date();closeStart();
 fly.dataset.k="clock";fly.innerHTML=`<div class="big">${d.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"})}</div><div class="dl">${d.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"})}</div><div class="hd">${esc(hebDate(d))}</div>`;fly.style.right="8px";fly.style.left="auto";fly.hidden=false};

/* ---------- desktop ---------- */
const PINS=["https://the8040it.github.io/pin-sites/siddur/","https://the8040it.github.io/pin-sites/isaac-tab-chat/","https://the8040it.github.io/pin-sites/isaac-ivelt-live-app/"];
const desk=$("#desktop");
function renderDesk(){
 const items=[{t:"This PC",ic:APPI.pc,act:()=>Explorer()},{t:"Browser",ic:APPI.browser,act:()=>Browser()}];
 SECS.forEach(s=>items.push({t:s.s,ic:secIcon(s),act:()=>Explorer([s.id]),title:s.t+" · "+s.n}));
 PINS.map(byHref).filter(Boolean).forEach(a=>items.push({t:a.l,ic:tile(a.i)+'<span class="sc-arrow">↗</span>',act:()=>openLink(a),title:a.l}));
 items.push({t:"Settings",ic:APPI.settings,act:()=>Settings()});
 desk.innerHTML=items.map((it,i)=>`<button class="dico" data-i="${i}" title="${esc(it.title||it.t)}"><span class="big">${it.ic}</span><span class="nm" dir="auto">${esc(it.t)}</span></button>`).join("");
 desk._items=items;}
renderDesk();
let lastTap={i:-1,t:0};
desk.addEventListener("click",e=>{const b=e.target.closest(".dico");$$(".dico.sel",desk).forEach(x=>x!==b&&x.classList.remove("sel"));closeStart();closeFly();
 if(!b)return;const i=+b.dataset.i;const touch=e.pointerType==="touch"||matchMedia("(pointer:coarse)").matches;
 if(touch||phone()){b.classList.add("sel");setTimeout(()=>b.classList.remove("sel"),250);desk._items[i].act();return}
 b.classList.add("sel");const now=Date.now();if(lastTap.i===i&&now-lastTap.t<450){desk._items[i].act();lastTap={i:-1,t:0}}else lastTap={i,t:now};});
desk.addEventListener("keydown",e=>{const b=e.target.closest(".dico");if(b&&e.key==="Enter")desk._items[+b.dataset.i].act()});
const ctx=$("#ctx");
desk.addEventListener("contextmenu",e=>{e.preventDefault();ctx.innerHTML=`<button data-a="ex">📁 Open File Explorer</button><button data-a="br">🌐 Open Browser</button><button data-a="set">🎨 Personalize</button><button data-a="rf">⟳ Refresh</button>`;ctx.hidden=false;
 ctx.style.left=Math.min(e.clientX,innerWidth-210)+"px";ctx.style.top=Math.min(e.clientY,innerHeight-200)+"px"});
ctx.addEventListener("click",e=>{const a=e.target.closest("button")?.dataset.a;ctx.hidden=true;if(a==="ex")Explorer();if(a==="br")Browser();if(a==="set")Settings();if(a==="rf")renderDesk()});
document.addEventListener("pointerdown",e=>{if(!e.target.closest("#ctx"))ctx.hidden=true;if(!e.target.closest("#start,#startBtn,#searchBtn"))closeStart();if(!e.target.closest("#flyout,#clock,#power"))closeFly()});
function closeFly(){fly.hidden=true}

/* ---------- recent ---------- */
const recent=()=>LS.get("recent",[]).map(byHref).filter(Boolean);
function pushRecent(a){const r=LS.get("recent",[]).filter(h=>h!==a.h);r.unshift(a.h);LS.set("recent",r.slice(0,8))}

/* ---------- start menu ---------- */
const start=$("#start"),sq=$("#sq"),stb=$("#st-body");let stView="home";
function openStart(focus){fly.hidden=true;start.hidden=false;stView="home";sq.value="";$("#sqx").hidden=true;renderStart();$("#startBtn").classList.add("on");if(focus)setTimeout(()=>sq.focus(),30)}
function closeStart(){if(start.hidden)return;start.hidden=true;$("#startBtn").classList.remove("on");sq.blur()}
$("#startBtn").onclick=()=>start.hidden?openStart(false):closeStart();
$("#searchBtn").onclick=()=>{if(start.hidden)openStart(true);else sq.focus()};
const li=(a,q)=>`<button class="li" data-h="${esc(a.k)}"><span class="sm">${itemIcon(a)}</span><span class="tx"><span class="t1" dir="auto">${q?hl(a.l,q):esc(a.l)}</span><span class="t2" dir="auto">${esc(a.sec.s)}${a.fold?" › "+esc(a.fold.n):""}</span></span></button>`;
const pinTile=(ic,t,data)=>`<button class="pi" ${data}><span class="big">${ic}</span><span class="nm" dir="auto">${esc(t)}</span></button>`;
function renderStart(){const q=sq.value.trim();
 if(q){const r=match(q);stb.innerHTML=`<div class="st-h"><span>Results <span class="cnt">· ${r.length}</span></span></div>`+(r.length?r.map(a=>li(a,q)).join(""):`<div class="empty">No results for “${esc(q)}”</div>`);stb.scrollTop=0;return}
 if(stView==="all"){let h=`<div class="st-h"><span>All apps <span class="cnt">· ${ALL.length}</span></span><button class="pill" data-v="home">‹ Back</button></div>`;
  SECS.forEach(s=>{h+=`<div class="grp-h"><span>${s.ic}</span><span dir="auto">${esc(s.t)}</span><span class="cnt">${s.n}</span></div>`;h+=ALL.filter(a=>a.sec===s&&!a.fold).map(a=>li(a)).join("");
   s.folders.forEach(f=>{h+=`<div class="sub-h"><span>📁</span><span dir="auto">${esc(f.n)}</span><span>· ${f.items.length}</span></div>`;h+=ALL.filter(a=>a.fold===f).map(a=>li(a)).join("")})});
  stb.innerHTML=h;stb.scrollTop=0;return}
 let h=`<div class="st-h"><span>Pinned</span><button class="pill" data-v="all">All apps ›</button></div><div class="pgrid">`;
 h+=pinTile(APPI.explorer,"File Explorer",'data-app="explorer"')+pinTile(APPI.browser,"Browser",'data-app="browser"')+pinTile(APPI.settings,"Settings",'data-app="settings"');
 SECS.forEach(s=>h+=pinTile(secIcon(s),s.s,`data-sec="${s.id}"`));
 PINS.map(byHref).filter(Boolean).forEach(a=>h+=pinTile(tile(a.i),a.l,`data-h="${esc(a.k)}"`));
 h+=`</div>`;const r=recent();
 h+=`<div class="st-h"><span>Recommended</span></div>`+(r.length?`<div class="rec">${r.slice(0,6).map(a=>li(a)).join("")}</div>`:`<div class="rec">${ALL.filter(a=>a.sec.id==="apps").slice(0,4).map(a=>li(a)).join("")}</div>`);
 stb.innerHTML=h;}
sq.addEventListener("input",()=>{$("#sqx").hidden=!sq.value;renderStart()});
sq.addEventListener("keydown",e=>{if(e.key==="Enter"){const f=$(".li",stb);if(f)f.click()}if(e.key==="Escape")closeStart()});
$("#sqx").onclick=()=>{sq.value="";$("#sqx").hidden=true;renderStart();sq.focus()};
stb.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;
 if(b.dataset.v){stView=b.dataset.v;renderStart();return}
 if(b.dataset.app){closeStart();openApp(b.dataset.app);return}
 if(b.dataset.sec){closeStart();Explorer([b.dataset.sec]);return}
 if(b.dataset.h){const a=ALL.find(x=>x.k===b.dataset.h);closeStart();openLink(a)}});
$("#power").onclick=e=>{e.stopPropagation();const r=e.currentTarget.getBoundingClientRect();fly.dataset.k="power";
 fly.innerHTML=`<div class="menu"><button data-p="close">✕ Close all windows</button><button data-p="restart">⟳ Restart</button></div>`;fly.style.width="230px";fly.hidden=false;
 fly.style.left=Math.max(8,Math.min(r.left-100,innerWidth-238))+"px";fly.style.right="auto";
 fly.onclick=ev=>{const p=ev.target.closest("button")?.dataset.p;if(!p)return;fly.hidden=true;fly.style.width="";closeStart();if(p==="close")[...WINS].forEach(closeWin);if(p==="restart")location.reload()}};
addEventListener("keydown",e=>{if(e.key==="Escape"){closeStart();closeFly();ctx.hidden=true}
 if(e.key==="Meta"&&!e.repeat){e.preventDefault()}});
addEventListener("keyup",e=>{if(e.key==="Meta")start.hidden?openStart(true):closeStart()});

/* ---------- File Explorer ---------- */
const secById=id=>SECS.find(s=>s.id===id);
function Explorer(path){
 if(phone()){const ex=WINS.find(w=>w.app==="explorer");if(ex){ex.go(path||[]);focusWin(ex);return ex}}
 const W=createWin("explorer",{w:900,h:580});
 const st={path:path||[],back:[],fwd:[],view:LS.get("xview","grid"),q:""};
 W.body.innerHTML=`<div class="xbar"><button class="nb bk" aria-label="Back"><svg class="ico" viewBox="0 0 24 24"><path d="M19 12H5M11 6l-6 6 6 6"/></svg></button><button class="nb fw" aria-label="Forward"><svg class="ico" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button><button class="nb upb" aria-label="Up"><svg class="ico" viewBox="0 0 24 24"><path d="M12 19V5M6 11l6-6 6 6"/></svg></button>
 <div class="crumbs"></div><div class="xsearch"><svg class="ico" viewBox="0 0 24 24" style="width:16px"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 21 21"/></svg><input type="search" placeholder="Search" aria-label="Search this folder"></div><button class="nb sbt" aria-label="Search"><svg class="ico" viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 21 21"/></svg></button></div>
 <div class="cmd"><button class="cb menu" aria-label="Folders">☰ <span>Folders</span></button><span class="grow"></span><button class="cb vg" aria-label="Large icons">▦ <span>Icons</span></button><button class="cb vl" aria-label="List">☷ <span>List</span></button></div>
 <div class="xmain"><nav class="side"></nav><div class="files"></div></div><div class="sbar"></div>`;
 const B=W.body,side=$(".side",B),files=$(".files",B),cr=$(".crumbs",B),xs=$(".xsearch",B),xi=$("input",xs);
 if(!phone())$(".sbt",B).hidden=true;
 function nav(p,push=true){if(push){st.back.push(st.path);st.fwd=[]}st.path=p;st.q="";xi.value="";closeDrawer();render()}
 W.go=p=>nav(p);
 function closeDrawer(){side.classList.remove("drawer");$(".drawer-bg",B)?.remove()}
 $(".bk",B).onclick=()=>{if(!st.back.length)return;st.fwd.push(st.path);nav(st.back.pop(),false)};
 $(".fw",B).onclick=()=>{if(!st.fwd.length)return;st.back.push(st.path);nav(st.fwd.pop(),false)};
 $(".upb",B).onclick=()=>{if(st.path.length)nav(st.path.slice(0,-1))};
 $(".menu",B).onclick=()=>{if(side.classList.contains("drawer")){closeDrawer();return}if(!phone()){side.hidden=!side.hidden;return}side.classList.add("drawer");const bg=document.createElement("div");bg.className="drawer-bg";bg.onclick=closeDrawer;$(".xmain",B).appendChild(bg)};
 $(".vg",B).onclick=()=>{st.view="grid";LS.set("xview","grid");render()};$(".vl",B).onclick=()=>{st.view="list";LS.set("xview","list");render()};
 $(".sbt",B).onclick=()=>{const o=!xs.classList.contains("open");xs.classList.toggle("open",o);$(".xbar",B).classList.toggle("searching",o);if(o)xi.focus();else{xi.value="";st.q="";render()}};
 xi.addEventListener("input",()=>{st.q=xi.value;render()});
 side.addEventListener("click",e=>{const b=e.target.closest("button");if(b)nav(JSON.parse(b.dataset.p))});
 cr.addEventListener("click",e=>{const b=e.target.closest("button");if(b)nav(JSON.parse(b.dataset.p))});
 let sel=null,lt={k:null,t:0};
 files.addEventListener("click",e=>{const b=e.target.closest(".fi");$$(".fi.sel",files).forEach(x=>x.classList.remove("sel"));if(!b)return;b.classList.add("sel");
  const fine=matchMedia("(pointer:fine)").matches&&e.pointerType!=="touch"&&!phone();const now=Date.now();
  if(fine&&!(lt.k===b.dataset.k&&now-lt.t<450)){lt={k:b.dataset.k,t:now};return}lt={k:null,t:0};act(b)});
 files.addEventListener("keydown",e=>{if(e.key==="Enter"&&e.target.closest(".fi"))act(e.target.closest(".fi"))});
 function act(b){if(b.dataset.p){nav(JSON.parse(b.dataset.p));return}const a=ALL.find(x=>x.k===b.dataset.k);if(a)openLink(a)}
 const P=p=>esc(JSON.stringify(p));
 function render(){const [sid,fi]=st.path;const s=sid?secById(sid):null;const f=s&&fi!=null?s.folders[fi]:null;
  const title=f?f.n:s?s.s:"This PC";W.setTitle(title);$(".tic",W.el).innerHTML=s?(f?FOLD(""):FOLD("")):APPI.explorer;
  $(".bk",B).disabled=!st.back.length;$(".fw",B).disabled=!st.fwd.length;$(".upb",B).disabled=!st.path.length;
  $(".vg",B).classList.toggle("on",st.view==="grid");$(".vl",B).classList.toggle("on",st.view==="list");
  // side
  side.innerHTML=`<button data-p="[]" class="${!s?"on":""}"><span class="si">🖥️</span><span class="lbl">This PC</span><span class="n">${ALL.length}</span></button><hr>`+SECS.map(x=>`<button data-p="${P([x.id])}" class="${s===x&&!f?"on":""}"><span class="si">${x.ic}</span><span class="lbl" dir="auto">${esc(x.s)}</span><span class="n">${x.n}</span></button>`+(s===x?x.folders.map((ff,i)=>`<button data-p="${P([x.id,i])}" class="${f===ff?"on":""}" style="padding-left:28px"><span class="si">📁</span><span class="lbl" dir="auto">${esc(ff.n)}</span><span class="n">${ff.items.length}</span></button>`).join(""):"")).join("");
  // crumbs
  let c=`<button data-p="[]">🖥️ This PC</button>`;if(s)c+=`<span class="sep"><svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 3l5 5-5 5"/></svg></span><button data-p="${P([s.id])}" dir="auto">${esc(s.s)}</button>`;if(f)c+=`<span class="sep"><svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 3l5 5-5 5"/></svg></span><button data-p="${P([s.id,fi])}" dir="auto">${esc(f.n)}</button>`;cr.innerHTML=c;cr.scrollLeft=cr.scrollWidth;
  files.className="files "+st.view;let h="",count=0;const q=st.q.trim();
  if(q){const pool=match(q).filter(a=>!s||(a.sec===s&&(!f||a.fold===f)));count=pool.length;h=pool.map(a=>fileItem(a,q)).join("")||`<div class="empty">No items match your search.</div>`}
  else if(!s){count=SECS.length;h=SECS.map(x=>`<button class="fi" data-p="${P([x.id])}" data-k="s:${x.id}"><span class="big">${secIcon(x)}</span><span class="nm" dir="auto">${esc(x.s)}</span><span class="sub">${x.n} items</span></button>`).join("")}
  else if(!f){count=s.folders.length+s.items.length;h=s.folders.map((ff,i)=>`<button class="fi" data-p="${P([s.id,i])}" data-k="f:${i}"><span class="big">${FOLD("")}</span><span class="nm" dir="auto">${esc(ff.n)}</span><span class="sub">${ff.items.length} items</span></button>`).join("")+ALL.filter(a=>a.sec===s&&!a.fold).map(a=>fileItem(a)).join("")}
  else{count=f.items.length;h=ALL.filter(a=>a.fold===f).map(a=>fileItem(a)).join("")}
  files.innerHTML=h;files.scrollTop=0;$(".sbar",B).textContent=count+(count===1?" item":" items")+(q?" found":"");}
 const fileItem=(a,q)=>`<button class="fi" data-k="${esc(a.k)}" title="${esc(a.l)}"><span class="big">${itemIcon(a)}</span><span class="nm" dir="auto">${q?hl(a.l,q):esc(a.l)}</span><span class="sub">${/\.pdf/i.test(a.h)?"PDF":"Web app"}</span></button>`;
 render();return W;}

/* ---------- Browser ---------- */
const host=u=>{try{return new URL(u).hostname}catch(e){return""}};
const isPdf=u=>/\.pdf($|[?#])/i.test(u);
const ALLOW=[/\.sites\.tab\.bot$/i,/^alamdu\.org$/i,/^(www\.)?wikipedia\.org$/i,/\.wikipedia\.org$/i];
const BLOCK=[/(^|\.)control\.tab\.bot$/i,/^eli-telegram\.sites\.tab\.bot$/i,/(^|\.)telegram\.org$/i,/(^|\.)google\./i,/(^|\.)youtube\.com$/i,/(^|\.)facebook\.com$/i,/(^|\.)instagram\.com$/i,/(^|\.)x\.com$/i,/(^|\.)twitter\.com$/i,/(^|\.)amazon\./i,/(^|\.)ivelt\.com$/i,/(^|\.)whatsapp\.com$/i,/(^|\.)github\.com$/i,/(^|\.)bing\.com$/i,/(^|\.)apple\.com$/i,/(^|\.)microsoft\.com$/i,/(^|\.)verizon\.com$/i,/(^|\.)honda\.com$/i];
function frameMode(u){const h=host(u);if(!h)return"bad";if(h===location.hostname)return"frame";if(isPdf(u)||BLOCK.some(r=>r.test(h)))return"out";if(ALLOW.some(r=>r.test(h)))return"frame";return"try"}
let BR=null;
function openLink(a,gesture=true){if(!a)return;pushRecent(a);Browser(a.h,a,gesture)}
function Browser(url,a,gesture){
 if(!BR){BR=createWin("browser",{w:1000,h:640});BR.onclose=()=>{BR=null};initBrowser(BR)}
 focusWin(BR);if(url)BR.open(url,a,gesture);else if(!BR.tabs.length)BR.newTab();return BR}
function initBrowser(W){W.tabs=[];W.cur=null;
 W.body.innerHTML=`<div class="tabs"><div class="tl" style="display:contents"></div><button class="newtab" aria-label="New tab">+</button></div>
 <div class="abar"><button class="nb bk" aria-label="Back"><svg class="ico" viewBox="0 0 24 24"><path d="M19 12H5M11 6l-6 6 6 6"/></svg></button><button class="nb fw" aria-label="Forward"><svg class="ico" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button><button class="nb rl" aria-label="Reload"><svg class="ico" viewBox="0 0 24 24"><path d="M20 12a8 8 0 1 1-2.3-5.6M20 4v5h-5"/></svg></button>
 <form class="addr"><span class="lock">🔒</span><input type="url" inputmode="url" enterkeyhint="go" placeholder="Search or enter web address" aria-label="Address"></form>
 <button class="nb hm" aria-label="Home"><svg class="ico" viewBox="0 0 24 24"><path d="M4 11l8-7 8 7v9h-5v-6H9v6H4z"/></svg></button><button class="nb ext" aria-label="Open in new tab" title="Open in new tab"><svg class="ico" viewBox="0 0 24 24"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg></button></div>
 <div class="view"></div>`;
 const B=W.body,tl=$(".tl",B),view=$(".view",B),inp=$(".addr input",B);
 const T=()=>W.cur;
 W.newTab=(url,a,g)=>{const t={id:Math.random().toString(36).slice(2),hist:[],pos:-1,el:document.createElement("div"),title:"New tab",ico:"✦"};t.el.style.cssText="position:absolute;inset:0";view.appendChild(t.el);W.tabs.push(t);
  if(W.tabs.length>8){const old=W.tabs.find(x=>x!==t);closeTab(old,true)}
  select(t);if(url)go(t,url,a,true,g);else ntp(t);return t};
 W.open=(url,a,g)=>{const t=T();if(t&&(t.pos<0||t.isNtp))go(t,url,a,true,g);else W.newTab(url,a,g)};
 function select(t){W.cur=t;W.tabs.forEach(x=>x.el.style.display=x===t?"":"none");renderTabs();syncBar()}
 function closeTab(t,silent){const i=W.tabs.indexOf(t);if(i<0)return;W.tabs.splice(i,1);t.el.remove();if(!W.tabs.length){if(silent)return;closeWin(W);return}if(W.cur===t)select(W.tabs[Math.min(i,W.tabs.length-1)]);else renderTabs()}
 function renderTabs(){tl.innerHTML=W.tabs.map(t=>`<div class="tab${t===W.cur?" on":""}" data-id="${t.id}" role="tab"><span>${esc(t.ico)}</span><span class="tt" dir="auto">${esc(t.title)}</span><button class="tx" aria-label="Close tab">✕</button></div>`).join("");
  const t=T();W.setTitle(t?t.title:"Browser",t?"Browser":"")}
 tl.addEventListener("click",e=>{const tab=e.target.closest(".tab");if(!tab)return;const t=W.tabs.find(x=>x.id===tab.dataset.id);if(e.target.closest(".tx"))closeTab(t);else select(t)});
 $(".newtab",B).onclick=()=>{W.newTab();setTimeout(()=>$(".ntp input",T().el)?.focus(),50)};
 function syncBar(){const t=T();if(!t)return;const u=t.pos>=0?t.hist[t.pos].u:"";inp.value=u;$(".lock",B).textContent=u.startsWith("https:")?"🔒":"ⓘ";$(".bk",B).disabled=t.pos<=0&&!(t.pos===0&&!t.isNtp&&false);$(".bk",B).disabled=t.pos<1;$(".fw",B).disabled=t.pos>=t.hist.length-1;$(".ext",B).disabled=!u}
 function toUrl(s){s=s.trim();if(!s)return"";if(/^https?:\/\//i.test(s))return s;if(/^[^\s]+\.[a-z]{2,}(\/|$)/i.test(s))return"https://"+s;return"https://www.google.com/search?q="+encodeURIComponent(s)}
 function go(t,url,a,push,gesture){a=a||byHref(url);t.isNtp=false;if(push){t.hist=t.hist.slice(0,t.pos+1);t.hist.push({u:url,a});t.pos=t.hist.length-1}
  t.title=a?a.l:host(url)||url;t.ico=a?(isPdf(url)?"📄":a.i):"🌐";const mode=frameMode(url);t.el.innerHTML="";
  if(mode==="out"){outCard(t,url,a,isPdf(url)?"PDF files open in their own tab, in your phone's PDF viewer.":"This site doesn't allow being shown inside another app, so it opens in its own tab.");if(gesture!==false)popOut(url)}
  else{const pr=document.createElement("div");pr.className="prog";pr.style.width="12%";const f=document.createElement("iframe");f.src=url;f.referrerPolicy="no-referrer-when-downgrade";f.allow="fullscreen; autoplay; clipboard-write; encrypted-media; picture-in-picture; screen-wake-lock";f.setAttribute("allowfullscreen","");f.title=t.title;
   t.el.append(pr,f);requestAnimationFrame(()=>pr.style.width="70%");let done=false;
   f.addEventListener("load",()=>{done=true;pr.style.width="100%";setTimeout(()=>pr.remove(),400)});
   const hint=(msg)=>{if($(".hintbar",t.el))return;const hb=document.createElement("div");hb.className="hintbar";hb.innerHTML=`<span>${msg}</span><button class="btn">Open ↗</button><button class="x" aria-label="Dismiss">✕</button>`;$(".btn",hb).onclick=()=>popOut(url);$(".x",hb).onclick=()=>hb.remove();t.el.appendChild(hb)};
   if(mode==="try")setTimeout(()=>hint("Page blank? Some sites refuse to open inside. Open it in its own tab."),2500);
   setTimeout(()=>{if(!done)hint("Still loading… you can open it in its own tab.")},12000);}
  if(W.cur===t){renderTabs();syncBar()}}
 function outCard(t,url,a,why){t.el.innerHTML=`<div class="card-out"><div class="cc"><div class="big">${esc(t.ico)}</div><h3 dir="auto">${esc(t.title)}</h3><div class="u" dir="ltr">${esc(host(url))}</div><p>${esc(why)}</p><button class="btn">Open in new tab ↗</button></div></div>`;$(".btn",t.el).onclick=()=>popOut(url)}
 function popOut(url){const w=window.open(url,"_blank","noopener");return w}
 function ntp(t){t.isNtp=true;t.title="New tab";t.ico="✦";t.pos=-1;t.hist=[];
  const quick=[...PINS.map(byHref).filter(Boolean),...ALL.filter(a=>a.sec.id==="apps"&&!PINS.includes(a.h)).slice(0,9)];
  t.el.innerHTML=`<div class="ntp"><div class="logo">${LOGO}</div><form><svg class="ico" viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 21 21"/></svg><input type="search" placeholder="Search or type a web address" enterkeyhint="go" aria-label="Search the web"></form><div class="qgrid">${quick.map(a=>pinTile(tile(a.i),a.l,`data-h="${esc(a.k)}"`)).join("")}</div></div>`;
  $("form",t.el).onsubmit=e=>{e.preventDefault();const u=toUrl($("input",t.el).value);if(u)go(t,u,null,true,true)};
  $(".qgrid",t.el).onclick=e=>{const b=e.target.closest("[data-h]");if(!b)return;const a=ALL.find(x=>x.k===b.dataset.h);pushRecent(a);go(t,a.h,a,true,true)};
  if(W.cur===t){renderTabs();syncBar()}}
 $(".addr",B).onsubmit=e=>{e.preventDefault();const u=toUrl(inp.value);if(u){inp.blur();go(T(),u,null,true,true)}};
 inp.addEventListener("focus",()=>inp.select());
 $(".bk",B).onclick=()=>{const t=T();if(t.pos>0){t.pos--;go(t,t.hist[t.pos].u,t.hist[t.pos].a,false,false)}};
 $(".fw",B).onclick=()=>{const t=T();if(t.pos<t.hist.length-1){t.pos++;go(t,t.hist[t.pos].u,t.hist[t.pos].a,false,false)}};
 $(".rl",B).onclick=()=>{const t=T();if(t.pos>=0)go(t,t.hist[t.pos].u,t.hist[t.pos].a,false,false)};
 $(".hm",B).onclick=()=>ntp(T());
 $(".ext",B).onclick=()=>{const t=T();if(t.pos>=0)popOut(t.hist[t.pos].u)};}

/* ---------- Settings ---------- */
const ACC=[["Gold","#c9a24a","#e8cf8a"],["Champagne","#d8b878","#f1dcae"],["Royal blue","#3b6fd8","#9db8f0"],["Emerald","#1f9d74","#8fdcc0"],["Ruby","#c2364b","#eea1ad"],["Amethyst","#8a5cd0","#c9b2ef"],["Silver","#9aa3b2","#d5dae3"]];
const WALLS=[["bloom","Bloom"],["midnight","Midnight"],["pearl","Pearl"]];
const prefs=Object.assign({theme:"auto",wall:"bloom",acc:0,align:"center"},LS.get("prefs",{}));
function applyPrefs(){const dark=prefs.theme==="dark"||(prefs.theme==="auto"&&matchMedia("(prefers-color-scheme: dark)").matches);
 const r=document.documentElement;r.dataset.theme=dark?"dark":"light";r.dataset.wall=prefs.wall;r.dataset.align=prefs.align;const a=ACC[prefs.acc]||ACC[0];r.style.setProperty("--accent",a[1]);r.style.setProperty("--accent2",a[2]);LS.set("prefs",prefs)}
applyPrefs();matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change",applyPrefs);
function Settings(){const ex=WINS.find(w=>w.app==="settings");if(ex){focusWin(ex);return ex}
 const W=createWin("settings",{w:820,h:600});W.setTitle("Settings");
 W.body.innerHTML=`<div class="set"><nav class="side"><button class="on"><span class="si">🎨</span><span class="lbl">Personalization</span></button><button data-s="about"><span class="si">ℹ️</span><span class="lbl">About</span></button></nav><div class="pane"></div></div>`;
 const pane=$(".pane",W.body);
 function render(){pane.innerHTML=`<h2>Personalization</h2>
 <div class="srow"><div class="lab">Theme</div><div class="d">Light or dark windows, taskbar and Start</div><div class="seg" data-k="theme">${[["light","☀️ Light"],["dark","🌙 Dark"],["auto","Auto"]].map(([v,t])=>`<button data-v="${v}" class="${prefs.theme===v?"on":""}">${t}</button>`).join("")}</div></div>
 <div class="srow"><div class="lab">Background</div><div class="d">Choose your desktop wallpaper</div><div class="walls">${WALLS.map(([v,t])=>`<button data-wall="${v}" class="${prefs.wall===v?"on":""}" style="background-image:url(wall-${v}.svg)"><span>${t}</span></button>`).join("")}</div></div>
 <div class="srow"><div class="lab">Accent color</div><div class="d">Start button, highlights and buttons</div><div class="sw">${ACC.map((a,i)=>`<button data-acc="${i}" class="${prefs.acc===i?"on":""}" style="background:${a[1]}" aria-label="${a[0]}" title="${a[0]}"></button>`).join("")}</div></div>
 <div class="srow"><div class="lab">Taskbar alignment</div><div class="d">Where the Start button sits</div><div class="seg" data-k="align">${[["center","Center"],["left","Left"]].map(([v,t])=>`<button data-v="${v}" class="${prefs.align===v?"on":""}">${t}</button>`).join("")}</div></div>
 <h2 style="margin-top:28px">About</h2><div class="srow about">${LOGO}<div><div class="lab">PC</div><div class="d" style="margin:0">${ALL.length} links in ${SECS.length} folders · made for Pin by Tab</div></div></div>`}
 render();
 pane.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;const seg=b.closest(".seg");
  if(seg)prefs[seg.dataset.k]=b.dataset.v;else if(b.dataset.wall)prefs.wall=b.dataset.wall;else if(b.dataset.acc!=null)prefs.acc=+b.dataset.acc;else return;applyPrefs();render()});
 $(".side",W.body).addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;$$(".side button",W.body).forEach(x=>x.classList.toggle("on",x===b));const h=b.dataset.s==="about"?$$("h2",pane)[1]:$$("h2",pane)[0];h.scrollIntoView({behavior:"smooth"})});
 return W;}

renderTB();
// deep links: ?open=explorer:pdfs  /  ?open=start  / ?open=browser:URL
const qp=new URLSearchParams(location.search).get("open");
if(qp){const [k,...rest]=qp.split(":");const v=rest.join(":");if(k==="start")openStart(false);else if(k==="explorer")Explorer(v?v.split("/").map((x,i)=>i?+x:x):[]);else if(k==="browser")v?openLink(byHref(v)||{h:v,l:v,i:"🌐",sec:{s:""}},false):Browser();else if(k==="settings")Settings()}
window.PC={Explorer,Browser,Settings,openStart,openLink,byHref,ALL};
if("serviceWorker" in navigator&&location.protocol==="https:")addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));
})();
