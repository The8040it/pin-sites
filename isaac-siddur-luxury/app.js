function SIDDUR_INIT(){
'use strict';
var KEY='siddur.v1';
var st={};try{st=JSON.parse(localStorage.getItem(KEY)||'{}')||{};}catch(e){st={};}
st.radios=st.radios||{};st.pos=st.pos||{};
function save(){try{localStorage.setItem(KEY,JSON.stringify(st));}catch(e){}}
function $(s,r){return (r||document).querySelector(s);}
function $$(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s));}
var app=$('.app');
if('scrollRestoration' in history)history.scrollRestoration='manual';

/* ---------- views ---------- */
function curNav(){var e=$('input[name=nav]:checked');return e?e.id:'nav-home';}
function viewOf(nav){return nav==='nav-home'?$('#home'):document.getElementById('p-'+nav.slice(4));}
function titleOf(nav){var v=viewOf(nav);var h=v&&$('.reader-head h1',v);return h?h.textContent.trim():'';}
var lists={};
function items(nav){if(!lists[nav]){var v=viewOf(nav);lists[nav]=v?$$('.reading-body > *',v):[];}return lists[nav];}
function barH(){var v=viewOf(curNav());var b=v&&($('.topbar',v)||$('.home-top',v));return b?b.getBoundingClientRect().height:0;}
function topIndex(nav){var L=items(nav);if(!L.length)return null;var y=barH()+2;var lo=0,hi=L.length-1,ans=L.length-1;
 while(lo<=hi){var m=(lo+hi)>>1;var r=L[m].getBoundingClientRect();if(r.bottom>y){ans=m;hi=m-1;}else lo=m+1;}
 // skip zero-height spacers
 while(ans<L.length-1&&L[ans].getBoundingClientRect().height===0)ans++;
 var rr=L[ans].getBoundingClientRect();return {i:ans,d:Math.max(0,y-rr.top)};}
function scrollToEl(el,extra){var y=el.getBoundingClientRect().top+window.scrollY-barH()-2+(extra||0);window.scrollTo(0,Math.max(0,y));}
function restore(nav){var p=st.pos[nav];var L=items(nav);if(p&&L[p.i]){scrollToEl(L[p.i],p.d||0);}else window.scrollTo(0,0);}
function secOf(nav,i){var L=items(nav);for(var k=Math.min(i,L.length-1);k>=0;k--){if(L[k].classList.contains('section-heading'))return L[k].textContent.trim();}return '';}

var quiet=0;
var hT;function hush(ms){quiet=Date.now()+(ms||500);clearTimeout(hT);hT=setTimeout(track,(ms||500)+60);}
var tmr=null;
function track(force){if(force!==true&&Date.now()<quiet)return;var nav=curNav();if(nav==='nav-home')return;var p=topIndex(nav);if(!p)return;st.pos[nav]=p;st.last=nav;save();}
window.addEventListener('scroll',function(){if(tmr)return;tmr=setTimeout(function(){tmr=null;track();},250);
 // fab auto-hide
 var y=window.scrollY;if(fab&&Date.now()>=quiet){if(y>lastY+8&&y>200)fab.classList.add('fab-hide');else if(y<lastY-8)fab.classList.remove('fab-hide');}lastY=y;},{passive:true});
var lastY=0;

function afterLayout(fn){requestAnimationFrame(function(){requestAnimationFrame(fn);});}
function goNav(nav,opts){opts=opts||{};var inp=document.getElementById(nav);if(!inp)return;inp.checked=true;onNav(opts);}
function onNav(opts){opts=opts||{};var nav=curNav();st.radios.nav=nav;if(nav!=='nav-home')st.last=nav;save();
 $$('.jump-menu[open]').forEach(function(d){d.open=false;});
 hush(700);
 if(!opts.noHistory){var hs=history.state||{};if(nav==='nav-home'){if(hs.v&&hs.v!=='nav-home'&&hs.base){goingHome=true;history.back();}else history.replaceState({v:'nav-home'},'');}
  else if(hs.v==='nav-home'||!hs.v){history.pushState({v:nav,base:1},'');}else history.replaceState({v:nav,base:1},'');}
 afterLayout(function(){if(opts.el){scrollToEl(opts.el);}else if(nav==='nav-home')window.scrollTo(0,0);else restore(nav);hush(400);updateContinue();wake();});
}
$$('input[name=nav]').forEach(function(i){i.addEventListener('change',function(){onNav();});});

/* ---------- persisted settings ---------- */
$$('input.state').forEach(function(i){if(i.name==='nav'||i.id==='intro-open'||i.id==='settings-open')return;
 i.addEventListener('change',function(){if(i.type==='radio'){st.radios[i.name]=i.id;if(i.name==='size'){delete st.size;app.style.removeProperty('--size');}}else if(i.id==='headings-on')st.headings=i.checked;save();keepPlace();themeColor();});});
function keepPlace(){var nav=curNav();if(nav==='nav-home')return;hush(600);afterLayout(function(){restore(nav);hush(300);});}

/* ---------- font size +/- ---------- */
var STEPS=[14,16,18,20,22,24,27,30,34,38,43,48];
function curSize(){return parseFloat(getComputedStyle(app).getPropertyValue('--size'))||22;}
function setSize(px){track(true);app.style.setProperty('--size',px+'px');st.size=px;
 var map={18:'size-s',22:'size-m',27:'size-l'};$$('input[name=size]').forEach(function(r){r.checked=(map[px]===r.id);});save();keepPlace();toast(Math.round(px/22*100)+'%');}
function step(dir){var c=curSize();var i=0;for(var k=0;k<STEPS.length;k++){if(Math.abs(STEPS[k]-c)<Math.abs(STEPS[i]-c))i=k;}i=Math.max(0,Math.min(STEPS.length-1,i+dir));setSize(STEPS[i]);}
if(st.size)app.style.setProperty('--size',st.size+'px');

/* ---------- theme colour for the Android status bar ---------- */
var tc=$('meta[name=theme-color]');
function themeColor(){if(tc)tc.setAttribute('content',getComputedStyle(app).backgroundColor||'#f3f0ea');}

/* ---------- UI: toast, fab, search ---------- */
function mk(tag,cls,html){var e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e;}
var toastEl=mk('div','sx-toast');app.appendChild(toastEl);var toastT;
function toast(t){toastEl.textContent=t;toastEl.classList.add('on');clearTimeout(toastT);toastT=setTimeout(function(){toastEl.classList.remove('on');},1100);}

var SEARCH_SVG='<svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M15.5 15.5L21 21" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>';
var fab=mk('div','sx-fab');fab.setAttribute('dir','ltr');
fab.innerHTML='<button type="button" class="sx-b" data-a="minus" aria-label="הקטן גופן"><span style="font-size:14px">א</span>−</button><button type="button" class="sx-b" data-a="plus" aria-label="הגדל גופן"><span style="font-size:19px">א</span>+</button><button type="button" class="sx-b" data-a="search" aria-label="חיפוש">'+SEARCH_SVG+'</button><button type="button" class="sx-b" data-a="top" aria-label="למעלה">↑</button>';
app.appendChild(fab);
fab.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;var a=b.getAttribute('data-a');
 if(a==='minus')step(-1);else if(a==='plus')step(1);else if(a==='search')openSearch();else if(a==='top'){hush(1600);window.scrollTo({top:0,behavior:'smooth'});}});

// home header: search + install
var homeTop=$('#home .home-top');
var installBtn=mk('button','sx-install','📲 התקן');installBtn.type='button';installBtn.hidden=true;
var hs=mk('button','settings-open-btn sx-hsearch',SEARCH_SVG);hs.type='button';hs.setAttribute('aria-label','חיפוש');
if(homeTop){homeTop.insertBefore(hs,homeTop.firstChild);homeTop.insertBefore(installBtn,homeTop.firstChild);}
hs.addEventListener('click',function(){openSearch();});
var homeShell=$('#home .home-shell');
var searchBar=mk('button','sx-searchbar',SEARCH_SVG+'<span>חיפוש בכל הסידור…</span>');searchBar.type='button';
var cont=mk('button','sx-continue','');cont.type='button';cont.hidden=true;
if(homeShell){var hero=$('.hero',homeShell);var after=hero?hero.nextSibling:homeShell.firstChild;homeShell.insertBefore(searchBar,after);homeShell.insertBefore(cont,after);}
searchBar.addEventListener('click',function(){openSearch();});
cont.addEventListener('click',function(){if(st.last)goNav(st.last);});
function updateContinue(){var n=st.last;if(!n||!viewOf(n)){cont.hidden=true;return;}var p=st.pos[n];var sec=p?secOf(n,p.i):'';
 cont.innerHTML='<span class="sx-c1">המשך מהמקום שהפסקת</span><span class="sx-c2">'+esc(titleOf(n))+(sec?' · '+esc(sec):'')+'</span><span class="sx-c3">‹</span>';cont.hidden=false;}

// jump menu: smooth in-page jump, close menu, no hash in history
document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('.jump-list a');if(!a)return;var id=decodeURIComponent((a.getAttribute('href')||'').slice(1));var el=document.getElementById(id);if(!el)return;e.preventDefault();var d=a.closest('details');if(d)d.open=false;hush(500);
 afterLayout(function(){var y=el.getBoundingClientRect().top+window.scrollY-barH()-6;window.scrollTo(0,Math.max(0,y));});});
// close an open jump menu when tapping outside it
document.addEventListener('click',function(e){$$('.jump-menu[open]').forEach(function(d){if(!d.contains(e.target))d.open=false;});},true);

document.addEventListener('click',function(e){if(e.target.closest&&e.target.closest('.reading-body'))fab.classList.remove('fab-hide');});
/* ---------- search ---------- */
function esc(t){return String(t).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function isMark(c){return c>=0x0591&&c<=0x05C7&&c!==0x05BE;}
function normMap(t,withMap){var out=[],map=withMap?[]:null,sp=true;for(var i=0;i<t.length;i++){var c=t.charCodeAt(i);
  if(isMark(c)||c===0x05F4||c===0x05F3||c===34||c===39||c===0x200D||c===0x200C||c===0x200F||c===0x200E)continue;
  var ch=t[i];if(c===0x05BE||c===45||c===0x2013||c===0x2014||/\s/.test(ch)||c===0x05C3||c===58||c===44||c===46){if(sp)continue;ch=' ';sp=true;}else{sp=false;ch=ch.toLowerCase();}
  out.push(ch);if(map)map.push(i);}
 return withMap?{s:out.join(''),map:map}:out.join('');}
var IDX=null;
function buildIndex(){IDX=[];$$('input[name=nav]').forEach(function(inp){var nav=inp.id;if(nav==='nav-home')return;var v=viewOf(nav);if(!v)return;var title=titleOf(nav);var sec='';
 items(nav).forEach(function(el,i){var t=el.textContent;if(el.classList.contains('section-heading'))sec=t.trim();if(!t||!t.trim())return;IDX.push({nav:nav,i:i,el:el,title:title,sec:sec,n:normMap(t)});});});}
var ov=mk('div','sx-ov');ov.setAttribute('dir','rtl');ov.hidden=true;
ov.innerHTML='<div class="sx-head"><div class="sx-inwrap">'+SEARCH_SVG+'<input type="search" class="sx-in" placeholder="חיפוש…" enterkeyhint="search" autocomplete="off" autocorrect="off" spellcheck="false"></div><button type="button" class="sx-close" aria-label="סגור">✕</button></div><div class="sx-meta"></div><div class="sx-res"></div>';
app.appendChild(ov);
var inEl=$('.sx-in',ov),resEl=$('.sx-res',ov),metaEl=$('.sx-meta',ov);
function openSearch(){if(!ov.hidden)return;ov.hidden=false;document.documentElement.classList.add('sx-lock');history.pushState({v:curNav(),ov:'search',base:(history.state||{}).base},'');
 metaEl.textContent='הקלידו מילה או כמה מילים (גם בלי נקודות)';
 setTimeout(function(){inEl.focus();inEl.select();},60);if(!IDX)setTimeout(buildIndex,30);if(inEl.value)run();}
function closeSearch(fromPop){if(ov.hidden)return;ov.hidden=true;document.documentElement.classList.remove('sx-lock');inEl.blur();if(!fromPop&&(history.state||{}).ov==='search')history.back();}
$('.sx-close',ov).addEventListener('click',function(){closeSearch();});
var qT;inEl.addEventListener('input',function(){clearTimeout(qT);qT=setTimeout(run,180);});
inEl.addEventListener('keydown',function(e){if(e.key==='Enter'){inEl.blur();}});
var hits=[];
function run(){if(!IDX)buildIndex();var q=normMap(inEl.value).trim();resEl.innerHTML='';hits=[];
 if(q.length<2){metaEl.textContent=q.length?'לפחות שתי אותיות':'הקלידו מילה או כמה מילים (גם בלי נקודות)';return;}
 var MAX=150,total=0;for(var k=0;k<IDX.length;k++){var it=IDX[k];var p=it.n.indexOf(q);if(p>=0){total++;if(hits.length<MAX)hits.push({it:it,p:p});}}
 metaEl.textContent=total?(total>MAX?('נמצאו '+total+' · מוצגים '+MAX+' הראשונים'):('נמצאו '+total)):'לא נמצא';
 var frag=document.createDocumentFragment();var lastNav='';
 hits.forEach(function(h,idx){var it=h.it;if(it.nav!==lastNav){frag.appendChild(mk('div','sx-grp',esc(it.title)));lastNav=it.nav;}
  var r=snippet(it.el.textContent,q);h.os=r.os;h.oe=r.oe;
  var b=mk('button','sx-hit','<span class="sx-sec">'+esc(it.sec&&it.sec!==it.el.textContent.trim()?it.sec:'')+'</span><span class="sx-txt">'+r.html+'</span>');b.type='button';b.setAttribute('data-k',idx);frag.appendChild(b);});
 resEl.appendChild(frag);resEl.scrollTop=0;}
function snippet(t,q){var m=normMap(t,true);var p=m.s.indexOf(q);if(p<0)return {html:esc(t.slice(0,120)),os:0,oe:0};
 var os=m.map[p],oe=m.map[p+q.length-1]+1;while(oe<t.length&&isMark(t.charCodeAt(oe)))oe++;
 var a=Math.max(0,os-55),b=Math.min(t.length,oe+70);while(a>0&&!/\s/.test(t[a-1])&&os-a<75)a--;while(b<t.length&&!/\s/.test(t[b])&&b-oe<95)b++;
 return {html:(a>0?'…':'')+esc(t.slice(a,os))+'<mark>'+esc(t.slice(os,oe))+'</mark>'+esc(t.slice(oe,b))+(b<t.length?'…':''),os:os,oe:oe};}
resEl.addEventListener('click',function(e){var b=e.target.closest('.sx-hit');if(!b)return;var h=hits[+b.getAttribute('data-k')];if(!h)return;
 ov.hidden=true;document.documentElement.classList.remove('sx-lock');inEl.blur();
 var nav=h.it.nav;var inp=document.getElementById(nav);inp.checked=true;
 history.replaceState({v:nav,base:1},'');
 onNav({noHistory:true,el:h.it.el});
 markHit(h.it.el,h.os,h.oe);});
function markHit(el,os,oe){el.classList.remove('sx-flash');void el.offsetWidth;el.classList.add('sx-flash');setTimeout(function(){el.classList.remove('sx-flash');},2600);
 try{if(!window.CSS||!CSS.highlights||oe<=os)return;var w=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);var n,acc=0,r=new Range(),sset=false;
  while((n=w.nextNode())){var L=n.nodeValue.length;if(!sset&&os<acc+L){r.setStart(n,os-acc);sset=true;}if(sset&&oe<=acc+L){r.setEnd(n,oe-acc);break;}acc+=L;}
  if(sset){CSS.highlights.set('sx',new Highlight(r));setTimeout(function(){CSS.highlights.delete('sx');},6000);}}catch(e){}}

/* ---------- back button ---------- */
var setOpen=$('#settings-open');
if(setOpen)setOpen.addEventListener('change',function(){if(setOpen.checked){history.pushState({v:curNav(),ov:'settings',base:(history.state||{}).base},'');}else if((history.state||{}).ov==='settings')history.back();});
var goingHome=false;
window.addEventListener('popstate',function(e){var s=e.state||{v:'nav-home'};
 if(goingHome){if(s.v&&s.v!=='nav-home'){history.back();return;}goingHome=false;}
 if(s.ov!=='search')closeSearch(true);
 if(setOpen&&setOpen.checked&&s.ov!=='settings')setOpen.checked=false;
 var want=s.v||'nav-home';if(want!==curNav()){var i=document.getElementById(want);if(i){i.checked=true;onNav({noHistory:true});}}});

/* ---------- keep the screen awake while reading ---------- */
var lock=null;
function wake(){if(!('wakeLock' in navigator))return;if(curNav()!=='nav-home'&&document.visibilityState==='visible'){if(!lock)navigator.wakeLock.request('screen').then(function(l){lock=l;l.addEventListener('release',function(){lock=null;});}).catch(function(){});}else if(lock){lock.release().catch(function(){});lock=null;}}
document.addEventListener('visibilitychange',function(){if(document.visibilityState==='hidden')track();wake();});
window.addEventListener('pagehide',track);

/* ---------- install ---------- */
var deferred=null;
window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();deferred=e;installBtn.hidden=false;});
installBtn.addEventListener('click',function(){if(!deferred)return;deferred.prompt();deferred.userChoice.finally(function(){deferred=null;installBtn.hidden=true;});});
window.addEventListener('appinstalled',function(){installBtn.hidden=true;});

/* ---------- start ---------- */
var start=curNav();
history.replaceState({v:'nav-home'},'');
if(start!=='nav-home'){history.pushState({v:start,base:1},'');}
themeColor();updateContinue();
hush(1500);
if(start!=='nav-home'){restore(start);if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){restore(start);hush(500);});setTimeout(function(){restore(start);hush(400);},400);}
wake();
}

/* ===== Luxury edition chrome ===== */
(function(){
'use strict';
var KEY='siddur.lux';
var THEMES=[['navy','Royal Navy','radial-gradient(circle at 35% 30%,#2a3f86,#0a1330 70%)'],['midnight','Midnight','radial-gradient(circle at 35% 30%,#3a3834,#050505 70%)'],['burgundy','Burgundy','radial-gradient(circle at 35% 30%,#7a1d33,#25070f 70%)'],['ivory','Ivory','radial-gradient(circle at 35% 30%,#fffdf5,#e9dcbc 75%)'],['auto','Auto','linear-gradient(135deg,#f5eedd 50%,#0a1330 50%)']];
var COL={navy:'#0a1330',midnight:'#09090a',burgundy:'#25070f',ivory:'#f5eedd'};
var html=document.documentElement;
function cur(){return html.getAttribute('data-lux')||'navy';}
function isDark(){return !!(window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches);}
function bar(){var t=cur();var c=t==='auto'?(isDark()?COL.navy:COL.ivory):COL[t];var m=document.querySelector('meta[name=theme-color]');if(m)m.setAttribute('content',c);}
var btns=[];
function setTheme(t,silent){html.setAttribute('data-lux',t);try{localStorage.setItem(KEY,t);}catch(e){}
 btns.forEach(function(b){b.setAttribute('aria-pressed',String(b.getAttribute('data-t')===t));});
 var rid=t==='auto'?'theme-auto':(t==='ivory'?'theme-light':'theme-dark');var r=document.getElementById(rid);
 if(r&&!r.checked){r.checked=true;if(!silent)r.dispatchEvent(new Event('change',{bubbles:true}));}
 bar();}
// settings: theme picker replaces the plain Appearance row
var sheet=document.querySelector('.settings-sheet');
if(sheet){var lab=sheet.querySelector('label[for=theme-auto]');var oldRow=lab&&lab.closest('.setting-row');if(oldRow)oldRow.style.display='none';
 var row=document.createElement('div');row.className='setting-row lx-row';row.innerHTML='<span class="setting-name">Theme</span><div class="lx-sw" role="group" aria-label="Theme"></div>';
 var sw=row.querySelector('.lx-sw');
 THEMES.forEach(function(x){var b=document.createElement('button');b.type='button';b.setAttribute('data-t',x[0]);b.innerHTML='<i style="background:'+x[2]+'"></i><span>'+x[1]+'</span>';b.addEventListener('click',function(){setTheme(x[0]);});sw.appendChild(b);btns.push(b);});
 var head=sheet.querySelector('.settings-modal-head');sheet.insertBefore(row,head?head.nextSibling:sheet.firstChild);}
// home: brand mark + closing ornament
var top=document.querySelector('#home .home-top');
if(top){var br=document.createElement('div');br.className='lx-brand';br.setAttribute('aria-hidden','true');br.innerHTML='<i></i>סידור<i></i>';top.appendChild(br);}
var shell=document.querySelector('#home .home-shell');
if(shell){var f=document.createElement('div');f.className='lx-foot';f.setAttribute('aria-hidden','true');f.innerHTML='<span class="lx-orn"></span>';shell.appendChild(f);}
setTheme(cur(),true);
if(window.matchMedia){try{matchMedia('(prefers-color-scheme: dark)').addEventListener('change',bar);}catch(e){}}
})();
(function(){
'use strict';
var app=document.querySelector('.app');
if('serviceWorker' in navigator){var reg=function(){navigator.serviceWorker.register('sw.js').catch(function(){});};if(document.readyState==='complete')reg();else window.addEventListener('load',reg);}
function boot(){try{SIDDUR_INIT();}catch(e){console.error(e);}}
function fail(e){console.error(e);var m=document.createElement('div');m.style.cssText='padding:24px;text-align:center;font:16px Arial';m.textContent='שגיאה בטעינה – נסו לרענן';var h=document.querySelector('#home .home-shell');if(h)h.prepend(m);}
fetch('siddur.bin').then(function(r){if(!r.ok)throw new Error('siddur.bin '+r.status);return r.arrayBuffer();}).then(function(buf){
 var u=new Uint8Array(buf);
 if(u[0]===0x1f&&u[1]===0x8b){return new Response(new Blob([buf]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer().then(function(b){return new TextDecoder('utf-8').decode(b);});}
 return new TextDecoder('utf-8').decode(u);
}).then(function(html){app.insertAdjacentHTML('beforeend',html);boot();}).catch(fail);
})();
