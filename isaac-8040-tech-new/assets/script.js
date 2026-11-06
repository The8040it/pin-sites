(function(){
var d=document.documentElement;d.classList.remove('no-js');
var YI=d.lang==='yi';
var L=YI?{dark:'שאלט אריבער צו ליכטיגן מאדע',light:'שאלט אריבער צו טונקעלן מאדע',fill:'ביטע שרייבט אייער נאמען, אימעיל און מעסעדזש.',subj:'הילף בקשה',gen:'אלגעמיין',name:'נאמען',email:'אימעיל',phone:'טעלעפאן',service:'סערוויס',prio:'דרינגלעכקייט',opened:'אייער אימעיל עפ דארף זיך עפענען מיט אייער מעסעדזש גרייט צו שיקן. אויב נישט, שרייבט אונז דירעקט צו '}
 :{dark:'Switch to light mode',light:'Switch to dark mode',fill:'Please fill in your name, email and message.',subj:'Support request',gen:'General',name:'Name',email:'Email',phone:'Phone',service:'Service',prio:'Priority',opened:'Your email app should open with your message ready to send. If it doesn\'t, email us directly at '};
var b=document.querySelector('.theme-btn');
function set(t){d.setAttribute('data-theme',t);try{localStorage.setItem('t8040-theme',t)}catch(e){}if(b)b.setAttribute('aria-label',t==='dark'?L.dark:L.light)}
if(b){set(d.getAttribute('data-theme')||'light');b.addEventListener('click',function(){set(d.getAttribute('data-theme')==='dark'?'light':'dark')})}
var m=document.getElementById('menu'),g=document.querySelector('.burger');
if(g&&m){g.addEventListener('click',function(){var o=m.classList.toggle('open');g.setAttribute('aria-expanded',o);document.body.style.overflow=o&&innerWidth<=1060?'hidden':''});
 document.addEventListener('keydown',function(e){if(e.key==='Escape'&&m.classList.contains('open')){m.classList.remove('open');g.setAttribute('aria-expanded','false');document.body.style.overflow='';g.focus()}})}
document.querySelectorAll('.dd-btn').forEach(function(x){x.addEventListener('click',function(){var li=x.parentNode,o=li.classList.toggle('open');x.setAttribute('aria-expanded',o)})});
document.addEventListener('click',function(e){document.querySelectorAll('.has-dd.open').forEach(function(li){if(!li.contains(e.target)&&innerWidth>1060){li.classList.remove('open');li.querySelector('.dd-btn').setAttribute('aria-expanded','false')}})});
var r=document.querySelectorAll('.rv');
if('IntersectionObserver' in window){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.08,rootMargin:'0px 0px -40px 0px'});r.forEach(function(x){io.observe(x)})}else r.forEach(function(x){x.classList.add('in')});
var f=document.getElementById('contact-form');
if(f){f.addEventListener('submit',function(e){e.preventDefault();var v=function(n){return (f.elements[n]&&f.elements[n].value||'').trim()};
 if(!v('name')||!v('email')||!v('message')){f.querySelector('.form-status').textContent=L.fill;return}
 var sub=L.subj+': '+(v('service')||L.gen)+' — '+v('name');
 var body=L.name+': '+v('name')+'\n'+L.email+': '+v('email')+'\n'+L.phone+': '+(v('phone')||'-')+'\n'+L.service+': '+(v('service')||'-')+'\n'+L.prio+': '+(v('priority')||'-')+'\n\n'+v('message');
 location.href='mailto:'+f.getAttribute('data-to')+'?subject='+encodeURIComponent(sub)+'&body='+encodeURIComponent(body);
 f.querySelector('.form-status').textContent=L.opened+f.getAttribute('data-to')+'.'})}
var y=document.getElementById('yr');if(y)y.textContent=new Date().getFullYear();
/* language */
function remember(l){try{localStorage.setItem('t8040-lang',l)}catch(e){}}
document.querySelectorAll('[data-setlang]').forEach(function(a){a.addEventListener('click',function(){remember(a.getAttribute('data-setlang'))})});
var stored=null;try{stored=localStorage.getItem('t8040-lang')}catch(e){}
if(!stored&&!YI){var alt=document.querySelector('link[rel=alternate][hreflang=yi]');
 if(alt){var p=document.createElement('div');p.className='lang-prompt';p.setAttribute('role','dialog');p.setAttribute('aria-label','Language');
  p.innerHTML='<span lang="yi" dir="rtl">דער וועבזייטל איז אויך דא אויף אידיש</span><a class="btn btn-primary btn-sm" lang="yi" data-setlang="yi" href="'+alt.getAttribute('href').replace(/^https?:\/\/[^\/]+/,'')+'">אידיש</a><button type="button" class="lp-x" aria-label="Keep English">English</button>';
  document.body.appendChild(p);
  p.querySelector('[data-setlang]').addEventListener('click',function(){remember('yi')});
  p.querySelector('.lp-x').addEventListener('click',function(){remember('en');p.remove()});}}
})();
