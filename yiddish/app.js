(function(){
var D=window.YDATA||[],L=document.getElementById('list'),Q=document.getElementById('q'),QX=document.getElementById('qx'),CH=document.getElementById('chips'),NO=document.getElementById('none');
var cur='all';var HUE={news:215,satmar:44,mags:265,books:28,learn:190,dict:155,kelim:200,music:330,kids:95,tools:240,kosher:140,shops:15,mosdos:350,pin:48};
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function norm(s){return String(s).toLowerCase().replace(/[\u0591-\u05C7]/g,'').replace(/[״"׳'’]/g,'')}
function hl(s,q){s=String(s);if(!q)return esc(s);var n='',map=[],i,ch;
 for(i=0;i<s.length;i++){ch=norm(s[i]);if(ch){n+=ch;for(var j=0;j<ch.length;j++)map.push(i)}}
 var out='',last=0,from=0,k;
 while((k=n.indexOf(q,from))>-1){var a=map[k],b=map[k+q.length-1]+1;out+=esc(s.slice(last,a))+'<mark>'+esc(s.slice(a,b))+'</mark>';last=b;from=k+q.length}
 return out+esc(s.slice(last))}
function dom(u){try{var h=new URL(u).hostname.replace(/^www\./,'');if(h==='play.google.com')return 'Google Play';return h}catch(e){return u}}
var ARR='<svg class="go" viewBox="0 0 24 24" aria-hidden="true"><path d="M14.5 6 8.5 12l6 6"/></svg>';
function chips(){var all=0;D.forEach(function(c){all+=c.items.length});
 var h='<button class="chip" type="button" data-c="all" aria-pressed="'+(cur==='all')+'">אלעס <b>'+all+'</b></button>';
 D.forEach(function(c){h+='<button class="chip" type="button" data-c="'+c.id+'" aria-pressed="'+(cur===c.id)+'">'+c.ic+' '+esc(c.t)+' <b>'+c.items.length+'</b></button>'});
 CH.innerHTML=h}
function render(){var q=norm(Q.value.trim()),h='',shown=0;
 D.forEach(function(c){if(cur!=='all'&&c.id!==cur&&!q)return;
  var its=c.items.filter(function(it){return !q||norm(it[1]+' '+it[2]+' '+dom(it[0])+' '+c.t).indexOf(q)>-1});
  if(!its.length)return;shown+=its.length;
  var hu=HUE[c.id]!=null?HUE[c.id]:220;h+='<section class="sec" id="s-'+c.id+'" style="--h:'+hu+'"><div class="sh"><span class="bd" aria-hidden="true">'+c.ic+'</span><h2>'+esc(c.t)+'</h2><span class="n">'+its.length+'</span><span class="ln"></span></div><div class="grid">';var ix=0;
  its.forEach(function(it){h+='<a class="card" style="--i:'+Math.min(ix++,14)+'" href="'+esc(it[0])+'"><span class="ic" aria-hidden="true">'+it[3]+'</span><span class="tx"><span class="nm">'+hl(it[1],q)+'</span><span class="ds">'+hl(it[2],q)+'</span><span class="dm">'+esc(dom(it[0]))+'</span></span>'+ARR+'</a>'});
  h+='</div></section>'});
 L.innerHTML=h;NO.hidden=shown>0;QX.hidden=!Q.value}
CH.addEventListener('click',function(e){var b=e.target.closest('.chip');if(!b)return;cur=b.dataset.c;Q.value='';chips();render();var hh=document.querySelector('.hero').offsetHeight;window.scrollTo({top:cur==='all'?0:hh,behavior:'smooth'});b=CH.querySelector('[data-c="'+cur+'"]');if(b&&b.scrollIntoView)b.scrollIntoView({inline:'center',block:'nearest'})});
Q.addEventListener('input',render);
QX.addEventListener('click',function(){Q.value='';render();Q.focus()});
document.getElementById('tg').addEventListener('click',function(){var d=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=d;try{localStorage.setItem('ytheme',d)}catch(e){}document.getElementById('tc').content='#0a1746'});
var dp=null,IB=document.getElementById('ib');
window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();dp=e;IB.hidden=false});
IB.addEventListener('click',function(){if(!dp)return;dp.prompt();dp.userChoice.then(function(){dp=null;IB.hidden=true})});
chips();render();
(function(){var n=0;D.forEach(function(c){n+=c.items.length});var e=document.getElementById('cnt');if(e)e.textContent=n;Q.placeholder='זוך אין אלע '+n+' לינקס…'})();
document.querySelector('.stats').addEventListener('click',function(e){var b=e.target.closest('.stat');if(!b)return;cur=b.dataset.c;Q.value='';chips();render();window.scrollTo({top:document.querySelector('.hero').offsetHeight,behavior:'smooth'});var c=CH.querySelector('[data-c="'+cur+'"]');if(c&&c.scrollIntoView)c.scrollIntoView({inline:'center',block:'nearest'})});
var TT=document.getElementById('tt');if(TT){TT.addEventListener('click',function(){window.scrollTo({top:0,behavior:'smooth'})});window.addEventListener('scroll',function(){TT.classList.toggle('on',window.scrollY>600)},{passive:true})}
if('serviceWorker' in navigator)window.addEventListener('load',function(){navigator.serviceWorker.register('./sw.js').catch(function(){})});
})();
