/* Apps v9 — app shell: views, favorites (long-press), recent, search highlight, theme */
if('serviceWorker' in navigator)navigator.serviceWorker.register('/sw.js');
(function(){
var d=document,root=d.documentElement,body=d.body,$=function(s,c){return (c||d).querySelector(s)},$$=function(s,c){return [].slice.call((c||d).querySelectorAll(s))};
var LS={get:function(k,f){try{var v=localStorage.getItem(k);return v?JSON.parse(v):f}catch(e){return f}},set:function(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
var secs=$$('.sec'),items=$$('.card,.row'),VIEWS={};secs.forEach(function(s){VIEWS[s.id]=1});

/* ---- install ---- */
var dp,ib=$('#ib');addEventListener('beforeinstallprompt',function(e){e.preventDefault();dp=e;ib.style.display='block';});
ib.onclick=function(){if(!dp)return;dp.prompt();dp.userChoice&&dp.userChoice.then(function(){ib.style.display='none';dp=null;});};
addEventListener('appinstalled',function(){ib.style.display='none';});

/* ---- toast ---- */
var toastEl=$('#toast'),tt;function toast(m){toastEl.textContent=m;toastEl.classList.add('on');clearTimeout(tt);tt=setTimeout(function(){toastEl.classList.remove('on')},1800);}

/* ---- theme ---- */
var mq=matchMedia('(prefers-color-scheme: dark)');
function getT(){try{return localStorage.getItem('theme')||''}catch(e){return ''}}
function applyTheme(){var t=getT(),dk=t?t==='dark':mq.matches;root.dataset.theme=dk?'dark':'light';$('#tc').content=dk?'#0a0c14':'#f3f4f6';}
mq.addEventListener&&mq.addEventListener('change',applyTheme);applyTheme();
$('#tg').onclick=function(){var n=getT()?'':(mq.matches?'light':'dark');try{localStorage.setItem('theme',n)}catch(e){}applyTheme();toast(n===''?'אויטאמאטיש (ווי דער טעלעפאן)':n==='dark'?'טונקל':'ליכטיק');};

/* ---- greeting + Hebrew date ---- */
(function(){var now=new Date(),h=now.getHours();
 $('#greet').textContent=h<5?'א גוטע נאכט':h<12?'א גוטן מארגן':h<17?'א גוטן טאג':h<21?'א גוטן אוונט':'א גוטע נאכט';
 var wd=['זונטאג','מאנטאג','דינסטאג','מיטוואך','דאנערשטאג','פרייטאג','שבת קודש'][now.getDay()],hd='';
 try{var p={};new Intl.DateTimeFormat('en-u-ca-hebrew',{day:'numeric',month:'numeric',year:'numeric'}).formatToParts(now).forEach(function(x){p[x.type]=x.value});
  var mn=new Intl.DateTimeFormat('he-u-ca-hebrew',{month:'long'}).format(now).replace('חשוון','חשון').replace('כסלו','כסליו').replace('אייר','אייר');
  var g=function(n){var L=[[400,'ת'],[300,'ש'],[200,'ר'],[100,'ק'],[90,'צ'],[80,'פ'],[70,'ע'],[60,'ס'],[50,'נ'],[40,'מ'],[30,'ל'],[20,'כ'],[10,'י'],[9,'ט'],[8,'ח'],[7,'ז'],[6,'ו'],[5,'ה'],[4,'ד'],[3,'ג'],[2,'ב'],[1,'א']],s='';n=+n;
   if(n%100===15||n%100===16){s='';var r=n-(n%100);while(r>0){for(var i=0;i<L.length;i++)if(L[i][0]<=r){s+=L[i][1];r-=L[i][0];break}}s+=n%100===15?'טו':'טז';}
   else{while(n>0){for(var j=0;j<L.length;j++)if(L[j][0]<=n){s+=L[j][1];n-=L[j][0];break}}}
   return s.length>1?s.slice(0,-1)+'״'+s.slice(-1):s+'׳';};
  var dd=parseInt(p.day,10),yy=parseInt(p.year||p.relatedYear,10)%1000;if(dd&&yy&&mn&&!/\d/.test(mn))hd=g(dd)+' '+mn+' '+g(yy);}catch(e){}
 $('#date').innerHTML='<span>'+wd+'</span>'+(hd?'<span class="dot"></span><span class="hd">'+hd+'</span>':'');})();

/* ---- counts on category tiles & sheet ---- */
function cnt(id){var s=d.getElementById(id),c=s&&$('h2 .cnt',s);return c?c.textContent:''}
$$('.chip').forEach(function(c){var id=c.getAttribute('href').slice(1),n=cnt(id);if(n){var sp=d.createElement('span');sp.className='ccn';sp.textContent=n;c.appendChild(sp);}});
$$('.scn').forEach(function(s){s.textContent=cnt(s.dataset.c)});

/* ---- views (bottom tabs) ---- */
var tabs=$$('.tab'),homeY=0,cur=null,sheet=$('#sheet'),scrim=$('#scrim');
function route(){var h=location.hash.slice(1),v=VIEWS[h]?h:'home';if(v===cur)return;
 var go=function(){if(cur==='home')homeY=scrollY;cur=v;body.dataset.view=v;
  secs.forEach(function(s){s.classList.toggle('off',v!=='home'&&s.id!==v)});
  var tv=(v==='home'||v==='apps'||v==='videos'||v==='pdfs')?v:'more';
  tabs.forEach(function(t){var on=t.dataset.v===tv;t.classList.toggle('on',on);if(on)t.setAttribute('aria-current','page');else t.removeAttribute('aria-current')});
  $$('.srow').forEach(function(r){r.classList.toggle('on',r.dataset.s===v)});
  if(q.value){q.value='';search();}
  scrollTo(0,v==='home'?homeY:0);};
 if(d.startViewTransition&&cur!==null&&!matchMedia('(prefers-reduced-motion: reduce)').matches)d.startViewTransition(go);else go();
 closeSheet();}
tabs.forEach(function(t){if(t.tagName==='A')t.addEventListener('click',function(e){var v=t.dataset.v;if(v===cur){e.preventDefault();scrollTo({top:0,behavior:'smooth'});}else if(v==='home'){e.preventDefault();history.pushState(null,'',location.pathname);route();}});});
function openSheet(){sheet.hidden=scrim.hidden=false;requestAnimationFrame(function(){requestAnimationFrame(function(){sheet.classList.add('open');scrim.classList.add('open')})});}
function closeSheet(){if(sheet.hidden)return;sheet.classList.remove('open');scrim.classList.remove('open');setTimeout(function(){sheet.hidden=scrim.hidden=true},300);}
$('#moreb').onclick=openSheet;scrim.onclick=closeSheet;addEventListener('keydown',function(e){if(e.key==='Escape')closeSheet()});
$$('.srow').forEach(function(r){r.addEventListener('click',function(e){if(location.hash==='#'+r.dataset.s){e.preventDefault();closeSheet();}})});
addEventListener('hashchange',route);

/* ---- favorites & recent ---- */
var favs=LS.get('favs',[]),rec=LS.get('recent',[]);
function find(h){for(var i=0;i<items.length;i++)if(items[i].getAttribute('href')===h)return items[i];return null}
function mini(h){var el=find(h);if(!el)return null;var a=d.createElement('a');a.className='mini';a.href=h;var s=el.closest('.sec');a.dataset.s=s?s.id:'';
 var ic=$('.ic,.ri',el),lb=$('.lb',el);a.innerHTML='<span class="ic" aria-hidden="true">'+(ic?ic.firstChild.textContent:'🔗')+'</span><span class="lb">'+(lb._o||lb.innerHTML)+'</span>';return a;}
function renderShelves(){var F=$('#favs'),R=$('#recent');F.textContent='';R.textContent='';
 favs=favs.filter(function(h){var m=mini(h);if(m){F.appendChild(m);return true}return false});
 rec=rec.filter(function(h){return !!find(h)}).slice(0,12);rec.forEach(function(h){var m=mini(h);if(m)R.appendChild(m)});
 $('#favhint').hidden=favs.length>0;$('#favn').textContent=favs.length?favs.length:'';$('#recwrap').hidden=!rec.length;
 items.forEach(function(el){el.classList.toggle('isfav',favs.indexOf(el.getAttribute('href'))>-1)});}
function toggleFav(h){var i=favs.indexOf(h);if(i>-1){favs.splice(i,1);toast('אראפגענומען פון באליבטע')}else{favs.unshift(h);toast('★ צוגעלייגט צו באליבטע')}LS.set('favs',favs);renderShelves();if(navigator.vibrate)navigator.vibrate(18);}
$('#recx').onclick=function(){rec=[];LS.set('recent',rec);renderShelves();};
var lp,lpFired=false,sx,sy;
function linkOf(t){return t&&t.closest&&t.closest('.card,.row,.mini')}
d.addEventListener('pointerdown',function(e){var a=linkOf(e.target);lpFired=false;if(!a)return;sx=e.clientX;sy=e.clientY;clearTimeout(lp);lp=setTimeout(function(){lpFired=true;toggleFav(a.getAttribute('href'))},480);},{passive:true});
['pointerup','pointercancel','scroll'].forEach(function(n){addEventListener(n,function(){clearTimeout(lp)},{passive:true,capture:true})});
d.addEventListener('pointermove',function(e){if(Math.abs(e.clientX-sx)>10||Math.abs(e.clientY-sy)>10)clearTimeout(lp)},{passive:true});
d.addEventListener('contextmenu',function(e){var a=linkOf(e.target);if(!a)return;e.preventDefault();if(!lpFired){clearTimeout(lp);lpFired=true;toggleFav(a.getAttribute('href'));}});
d.addEventListener('click',function(e){var a=linkOf(e.target);if(!a)return;if(lpFired){e.preventDefault();lpFired=false;return}
 var h=a.getAttribute('href');rec=[h].concat(rec.filter(function(x){return x!==h})).slice(0,12);LS.set('recent',rec);setTimeout(renderShelves,400);},true);

/* ---- search ---- */
var q=$('#q'),qx=$('#qx'),sres=$('#sres'),empty=$('#empty');q.placeholder='זוך אין אלע '+$('.sub').textContent.trim()+'…';
function norm(s){return (s||'').toLowerCase().replace(/[\u0591-\u05C7]/g,'').replace(/\s+/g,' ').trim()}
function mark(lb,v){if(lb._o===undefined)lb._o=lb.innerHTML;lb.innerHTML=lb._o;if(!v)return;
 var w=d.createTreeWalker(lb,4),ns=[],n;while((n=w.nextNode()))ns.push(n);
 ns.forEach(function(t){var s=t.nodeValue,l=s.toLowerCase(),i=l.indexOf(v);if(i<0)return;var f=d.createDocumentFragment(),p=0;
  while(i>-1){f.appendChild(d.createTextNode(s.slice(p,i)));var m=d.createElement('mark');m.textContent=s.slice(i,i+v.length);f.appendChild(m);p=i+v.length;i=l.indexOf(v,p)}
  f.appendChild(d.createTextNode(s.slice(p)));t.parentNode.replaceChild(f,t);});}
function search(){var v=norm(q.value),total=0;qx.hidden=!q.value;body.classList.toggle('searching',!!v);
 secs.forEach(function(sec){var hit=0;
  $$('.card',sec).forEach(function(a){var ok=!v||norm(a.textContent).indexOf(v)>-1;a.classList.toggle('hide',!ok);mark($('.lb',a),ok?v:'');if(ok)hit++;});
  $$('.grid',sec).forEach(function(g){g.classList.toggle('hide',!!v&&!$('.card:not(.hide)',g))});
  $$('.grp',sec).forEach(function(g){var h=0,gt=norm($('.gt',g).textContent),all=v&&gt.indexOf(v)>-1;
   $$('.row',g).forEach(function(a){var ok=!v||all||norm(a.textContent).indexOf(v)>-1;a.classList.toggle('hide',!ok);mark($('.lb',a),ok&&!all?v:'');if(ok)h++;});
   g.classList.toggle('hide',!!v&&!h);g.open=!!v&&h>0;hit+=h;});
  sec.classList.toggle('hide',!!v&&!hit);total+=v?hit:0;});
 sres.hidden=!v||!total;sres.textContent=total+(total===1?' רעזולטאט':' רעזולטאטן');empty.style.display=(v&&!total)?'block':'none';}
var st;q.addEventListener('input',function(){clearTimeout(st);st=setTimeout(search,60)});
q.addEventListener('search',search);
q.addEventListener('keydown',function(e){if(e.key==='Enter')q.blur()});
qx.onclick=function(){q.value='';search();q.focus();};

renderShelves();route();
})();

/* ---- in-app viewer (v9): links open inside the app ---- */
(function(){
var d=document,body=d.body;
var ALLOW_SUFFIX=['.sites.tab.bot','alamdu.org'];
var NOFRAME=['eli-telegram.sites.tab.bot']; /* sites pages that jump to a site which refuses frames */
var DENY=['google.com','youtube.com','youtu.be','gmail.com','bing.com','microsoft.com','live.com','telegram.org','t.me','whatsapp.com','wa.me','facebook.com','instagram.com','x.com','twitter.com','tiktok.com','apple.com','icloud.com','linkedin.com','reddit.com','github.com','paypal.com','chase.com','verizon.com','tab.bot'];
function hostIn(h,list){h=(h||'').toLowerCase();for(var i=0;i<list.length;i++){var s=list[i].replace(/^\./,'');if(h===s||h.slice(-(s.length+1))==='.'+s)return true}return false}
function kindOf(u){var p=u.pathname.toLowerCase();
 if(/\.pdf$/.test(p))return 'pdf';
 if(/\.(mp4|m4v|webm|mov|ogv)$/.test(p))return 'video';
 if(/\.(mp3|m4a|aac|ogg|wav|opus)$/.test(p))return 'audio';
 if(hostIn(u.hostname,NOFRAME))return 'block';
 if(u.origin===location.origin)return 'frame';
 if(hostIn(u.hostname,ALLOW_SUFFIX))return 'frame';
 if(hostIn(u.hostname,DENY))return 'block';
 return 'try';}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
var ov=d.createElement('div');ov.id='vw';ov.className='vw';ov.hidden=true;ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');
ov.innerHTML='<div class="vbar"><button class="vb vx" type="button" aria-label="צוריק"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg></button>'+
 '<div class="vt"><bdi class="vtt"></bdi><span class="vh" dir="ltr"></span></div>'+
 '<button class="vb vr" type="button" aria-label="ווידער לאדן"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3"/><path d="M19.6 4.2v4.6H15"/></svg></button>'+
 '<button class="vc" type="button" aria-label="Open in Chrome">Chrome ↗</button></div><div class="vbody"></div>';
body.appendChild(ov);
var vb=ov.querySelector('.vbody'),vtt=ov.querySelector('.vtt'),vh=ov.querySelector('.vh'),cur=null,hintT=0,lockY=0;
function openOut(h){try{var w=window.open(h,'_blank','noopener');if(!w)location.href=h}catch(e){location.href=h}}
function card(h,why,ic){vb.innerHTML='<div class="vcard"><div class="vci" aria-hidden="true">'+ic+'</div><div class="vct">'+why+'</div><button type="button" class="vgo">עפענען ↗<span dir="ltr">Open</span></button></div>';
 vb.querySelector('.vgo').onclick=function(){openOut(h)};}
function render(){if(!cur)return;var h=cur.h,u=cur.u,k=cur.k;clearTimeout(hintT);vb.textContent='';vb.className='vbody';
 if(k==='video'||k==='audio'){var v=d.createElement(k==='video'?'video':'audio');v.controls=true;v.setAttribute('playsinline','');v.preload='metadata';v.autoplay=true;v.src=h;
  v.onerror=function(){card(h,'דער ווידעא קען נישט שפילן דא.<small dir="ltr">This video can’t play inside the app.</small>','🎬')};vb.classList.add('media');vb.appendChild(v);var vs=d.createElement('div');vs.className='vspin';vb.appendChild(vs);['loadeddata','canplay','playing','error'].forEach(function(n){v.addEventListener(n,function(){vs.remove()})});return;}
 if(k==='pdf'){card(h,'די PDF קען נישט עפענען אינעווייניג אין די אפ.<small dir="ltr">This file can’t open inside the app.</small>','📄');return;}
 if(k==='block'){card(h,'די וועבסייט לאזט זיך נישט עפענען אינעווייניג אין די אפ.<small dir="ltr">This site can’t open inside the app.</small>','🌐');return;}
 var sp=d.createElement('div');sp.className='vspin';vb.appendChild(sp);
 var f=d.createElement('iframe');f.className='vf';f.setAttribute('allow','autoplay; fullscreen; picture-in-picture; clipboard-write; geolocation; encrypted-media');f.title=cur.t||'';
 f.onload=function(){sp.remove()};f.src=h;vb.appendChild(f);
 if(k==='try'){hintT=setTimeout(function(){if(!cur)return;var b=d.createElement('button');b.type='button';b.className='vhint';b.innerHTML='ליידיג? עפענען ↗ <span dir="ltr">Open</span>';b.onclick=function(){openOut(h)};vb.appendChild(b)},3000);}}
function open(h,t){var u;try{u=new URL(h,location.href)}catch(e){return false}
 if(!/^https?:$/.test(u.protocol))return false;
 cur={h:u.href,u:u,k:kindOf(u),t:t};vtt.textContent=t||u.hostname;vh.textContent=u.hostname.replace(/^www\./,'');
 if(ov.hidden){lockY=scrollY;ov.hidden=false;body.classList.add('vwopen');try{history.pushState({vw:1},'')}catch(e){}}
 render();requestAnimationFrame(function(){ov.classList.add('on')});return true;}
function shut(){if(ov.hidden)return;clearTimeout(hintT);var m=vb.querySelector('video,audio');if(m){try{m.pause();m.removeAttribute('src');m.load()}catch(e){}}
 vb.textContent='';cur=null;ov.classList.remove('on');ov.hidden=true;body.classList.remove('vwopen');scrollTo(0,lockY);}
function close(){var mine=history.state&&history.state.vw;shut();if(mine)history.back();}
addEventListener('popstate',function(){if(!ov.hidden&&!(history.state&&history.state.vw))shut();});
if(history.state&&history.state.vw){try{history.replaceState(null,'')}catch(e){}}
ov.querySelector('.vx').onclick=close;
ov.querySelector('.vr').onclick=function(){render()};
ov.querySelector('.vc').onclick=function(){if(cur)openOut(cur.h)};
addEventListener('keydown',function(e){if(e.key==='Escape'&&!ov.hidden)close()});
d.addEventListener('click',function(e){if(e.defaultPrevented||e.button||e.ctrlKey||e.metaKey||e.shiftKey)return;
 var a=e.target&&e.target.closest&&e.target.closest('.card,.row,.mini');if(!a)return;
 var lb=a.querySelector('.lb'),t=lb?lb.textContent.replace(/\s+/g,' ').trim():'';
 if(open(a.getAttribute('href'),t))e.preventDefault();});
window.__vw={open:open,close:close,kindOf:function(h){return kindOf(new URL(h,location.href))}};
})();
