(function(){
var d=document.getElementById('drawer'),s=document.getElementById('scrim'),o=document.getElementById('openMenu'),c=document.getElementById('closeMenu');
function open(){d.hidden=false;s.hidden=false;o.setAttribute('aria-expanded','true');var a=d.querySelector('[aria-current]');if(a)a.scrollIntoView({block:'center'});c.focus();}
function close(){d.hidden=true;s.hidden=true;o.setAttribute('aria-expanded','false');o.focus();}
if(o)o.addEventListener('click',open);if(c)c.addEventListener('click',close);if(s)s.addEventListener('click',close);
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&d&&!d.hidden)close();});
// mobile in-chapter section list: clone sidebar TOC into article
var side=document.querySelector('.side details.secs'),head=document.querySelector('.chhead');
if(side&&head){var m=side.cloneNode(true);m.classList.add('mobsecs');m.removeAttribute('open');head.after(m);}
// search page
var q=document.getElementById('q');if(!q)return;
var res=document.getElementById('res'),st=document.getElementById('st'),idx=null;
function norm(t){return (t||'').replace(/[\u0591-\u05C7]/g,'').toLowerCase();}
function esc(t){return t.replace(/[&<>"]/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m];});}
function load(cb){if(idx)return cb();st.textContent='לאדנט…';Promise.all(['search-0.json','search-1.json'].map(function(u){return fetch(u).then(function(r){if(!r.ok)throw 0;return r.json();});})).then(function(a){var j=[].concat.apply([],a);idx=j.map(function(e){e.n=norm(e.t+' '+e.x);return e;});cb();}).catch(function(){st.textContent='דער זוך-אינדעקס האט זיך נישט געלאדנט.';});}
function snip(e,ws){var x=e.x,n=norm(x),p=n.indexOf(ws[0]);if(p<0)p=0;var a=Math.max(0,p-80),b=Math.min(x.length,p+180);var t=(a>0?'… ':'')+x.slice(a,b)+(b<x.length?' …':'');var h=esc(t);ws.forEach(function(w){if(w.length<2)return;var re=new RegExp('('+w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','gi');h=h.replace(re,'<mark>$1</mark>');});return h;}
function run(){var v=q.value.trim();var u=new URL(location.href);if(v)u.searchParams.set('q',v);else u.searchParams.delete('q');history.replaceState(null,'',u);
 if(!v){res.innerHTML='';st.textContent='';return;}
 load(function(){var ws=norm(v).split(/\s+/).filter(Boolean);var out=[];
  idx.forEach(function(e){var sc=0;for(var i=0;i<ws.length;i++){var k=e.n.split(ws[i]).length-1;if(!k)return;sc+=k+(norm(e.t).indexOf(ws[i])>=0?20:0);}out.push([sc,e]);});
  out.sort(function(a,b){return b[0]-a[0];});
  st.textContent=out.length?('געפונען אין '+out.length+' טיילן'):'גארנישט געפונען. פרובירט אן אנדער ווארט.';
  res.innerHTML=out.slice(0,80).map(function(p){var e=p[1];return '<li><a href="'+e.c+'.html'+(e.a?'#'+e.a:'')+'"><span class="w">'+esc(e.l)+' · '+esc(e.h)+'</span><b class="t">'+esc(e.t)+'</b><p>'+snip(e,norm(v).split(/\s+/).filter(Boolean))+'</p></a></li>';}).join('');});}
document.getElementById('sf').addEventListener('submit',function(e){e.preventDefault();run();});
var t;q.addEventListener('input',function(){clearTimeout(t);t=setTimeout(run,250);});
var p=new URLSearchParams(location.search).get('q');if(p){q.value=p;run();}else{q.focus();}
})();