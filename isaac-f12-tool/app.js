(function(){
"use strict";
var BM = "javascript:(function(){var d=document;if(window.F12open&&window.__F12eruda){F12open();return}var s=d.createElement('script');s.onload=function(){F12open()};s.onerror=function(){alert('This site blocks the full tools — use F12 Lite (type F12M)')};try{s.src='https://isaac-f12-tool.sites.tab.bot/f12.js'}catch(e){return s.onerror()}(d.body||d.documentElement).appendChild(s)})()";
var code = document.getElementById('code');
code.value = BM;
var btn = document.getElementById('copyBtn'), msg = document.getElementById('copyMsg');
function fallbackCopy(){
  var ok=false;
  try{ code.removeAttribute('readonly'); code.focus(); code.select(); code.setSelectionRange(0, BM.length); ok=document.execCommand('copy'); }catch(e){}
  code.setAttribute('readonly',''); if(window.getSelection) window.getSelection().removeAllRanges(); code.blur();
  return ok;
}
function done(ok){
  if(ok){ btn.textContent='✅ קאפירט!'; btn.classList.add('done'); msg.textContent='יעצט גיי צו שריט 2 אונטן ⬇️'; }
  else { msg.textContent='עס האט נישט געקאפירט. עפן „ווייז דעם קאוד" און קאפיר עס מיט דער האנט.'; document.querySelector('.codebox').open=true; }
  setTimeout(function(){ btn.textContent='📋 קאפיר דעם F12 קאוד'; btn.classList.remove('done'); }, 4000);
}
btn.addEventListener('click', function(){
  if(navigator.clipboard && window.isSecureContext){
    navigator.clipboard.writeText(BM).then(function(){done(true)}, function(){done(fallbackCopy())});
  } else done(fallbackCopy());
});
document.getElementById('tryBtn').addEventListener('click', function(){
  if(window.F12open && window.__F12eruda){ F12open(); return; }
  var s=document.createElement('script');
  s.src=location.origin+'/f12.js';
  s.onload=function(){ F12open(); };
  s.onerror=function(){ alert('F12 האט זיך נישט געלאדנט. פרובירט נאכאמאל.'); };
  document.body.appendChild(s);
});

var LITE = "javascript:(function(){try{var d=document,l=location,o=d.getElementById('f12m');if(o){o.remove();return}var h=d.createElement('div');h.id='f12m';var r=h.attachShadow({mode:'closed'});var b=d.createElement('div');b.style.cssText='all:initial;position:fixed;inset:0;z-index:2147483647;background:%23111;color:%23eee;font:15px sans-serif;overflow:auto;padding:12px';var x=d.createElement('button');x.textContent='X close';x.style.cssText='font-size:16px;padding:6px 12px;margin-bottom:8px';x.onclick=function(){h.remove()};b.appendChild(x);function a(k,v){var p=d.createElement('div');p.style.cssText='padding:4px 0;border-bottom:1px solid %23333;word-break:break-all';p.textContent=k+': '+v;b.appendChild(p)}function m(n){var e=d.querySelector('meta[name=\"'+n+'\"],meta[property=\"'+n+'\"]');return e?e.content:'-'}var s=[].slice.call(d.scripts),dm={};[].forEach.call(d.querySelectorAll('[src],[href]'),function(e){try{var u=new URL(e.src||e.href,l.href).hostname;if(u&&u!=l.hostname)dm[u]=1}catch(z){}});a('Title',d.title);a('URL',l.href);a('Domain',l.hostname);a('Secure',l.protocol=='https:'?'yes':'NO');a('Description',m('description'));a('OG title',m('og:title'));a('Language',d.documentElement.lang||'-');a('Scripts',s.length);a('Links',d.links.length);a('Images',d.images.length);a('Iframes',d.querySelectorAll('iframe').length);a('H1',[].map.call(d.querySelectorAll('h1'),function(e){return e.textContent.trim()}).join(' | ')||'-');a('Cookies',d.cookie?d.cookie.split(';').length:0);var t=performance.timing;a('Load ms',t.loadEventEnd-t.navigationStart);a('Other domains ('+Object.keys(dm).length+')',Object.keys(dm).join(', ')||'-');r.appendChild(b);(d.body||d.documentElement).appendChild(h)}catch(e){alert('F12M error: '+e.message)}})()";
var lcode=document.getElementById('liteCode'), lbtn=document.getElementById('liteBtn'), lmsg=document.getElementById('liteMsg');
lcode.value=LITE;
function lfb(){var ok=false;try{lcode.removeAttribute('readonly');lcode.focus();lcode.select();lcode.setSelectionRange(0,LITE.length);ok=document.execCommand('copy')}catch(e){}lcode.setAttribute('readonly','');if(window.getSelection)window.getSelection().removeAllRanges();lcode.blur();return ok}
function ldone(ok){
  if(ok){lbtn.textContent='✅ קאפירט!';lbtn.classList.add('done');lmsg.textContent='יעצט מאך א בוקמארק מיטן נאמען F12M ⬇️';}
  else{lmsg.textContent='עס האט נישט געקאפירט. עפן „ווייז דעם F12 Lite קאוד" און קאפיר עס מיט דער האנט.';lcode.closest('details').open=true;}
  setTimeout(function(){lbtn.textContent='📋 קאפיר דעם F12 Lite קאוד';lbtn.classList.remove('done');},4000);
}
lbtn.addEventListener('click',function(){
  if(navigator.clipboard&&window.isSecureContext){navigator.clipboard.writeText(LITE).then(function(){ldone(true)},function(){ldone(lfb())});}else ldone(lfb());
});
document.getElementById('tryLite').addEventListener('click',function(){location.href=LITE;});

if('serviceWorker' in navigator){ window.addEventListener('load', function(){ navigator.serviceWorker.register('sw.js').catch(function(){}); }); }
})();
