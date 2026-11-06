(function(){
"use strict";
var LAT=41.1112,LON=-74.0685,TZ="America/New_York";
var $=function(s,r){return (r||document).querySelector(s)},$$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var store={get:function(k){try{return localStorage.getItem(k)}catch(e){return null}},set:function(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
/* font size */
function applyFs(v){document.documentElement.classList.remove("fs0","fs1","fs2");document.documentElement.classList.add("fs"+v);$$("#fs button").forEach(function(b){b.classList.toggle("on",b.getAttribute("data-fs")===String(v))})}
applyFs(store.get("mz-fs")||"1");
$$("#fs button").forEach(function(b){b.addEventListener("click",function(){var v=b.getAttribute("data-fs");store.set("mz-fs",v);applyFs(v)})});
/* splash */
var sp=$("#splash"),always=store.get("mz-splash")==="1",seen=false;
try{seen=sessionStorage.getItem("mz-seen")==="1"}catch(e){}
var spl=$("#spl");if(spl){spl.checked=always;spl.addEventListener("change",function(){store.set("mz-splash",spl.checked?"1":"0")})}
function closeSplash(){if(!sp||sp.hidden)return;sp.classList.add("out");try{sessionStorage.setItem("mz-seen","1")}catch(e){}setTimeout(function(){sp.hidden=true},650)}
if(sp&&(always||!seen)&&!location.hash.replace("#","").length){sp.hidden=false;$(".sp-logo",sp).addEventListener("click",closeSplash);$(".sp-skip",sp).addEventListener("click",closeSplash)}
/* drawer */
var drawer=$("#drawer"),scrim=$(".scrim"),mb=$(".menubtn");
function openD(o){drawer.classList.toggle("open",o);drawer.setAttribute("aria-hidden",o?"false":"true");mb.setAttribute("aria-expanded",o?"true":"false");scrim.hidden=!o}
mb.addEventListener("click",function(){openD(!drawer.classList.contains("open"))});
scrim.addEventListener("click",function(){openD(false)});$(".dclose").addEventListener("click",function(){openD(false)});
document.addEventListener("keydown",function(e){if(e.key==="Escape"){openD(false);closeLb()}});
/* router */
function route(){var r=(location.hash||"#home").slice(1).split("/")[0]||"home";var pg=$("#pg-"+r);if(!pg){r="home";pg=$("#pg-home")}
$$(".page").forEach(function(p){var on=p===pg;p.hidden=!on;p.classList.toggle("on",on)});
$$(".drawer a").forEach(function(a){a.classList.toggle("cur",a.getAttribute("data-route")===r)});
openD(false);window.scrollTo(0,0);if(r!=="home")closeSplash()}
window.addEventListener("hashchange",route);route();
/* hero rotation */
var hz=$$(".hz"),hi=0;if(hz.length>1&&!matchMedia("(prefers-reduced-motion: reduce)").matches){setInterval(function(){hz[hi].classList.remove("on");hi=(hi+1)%hz.length;hz[hi].classList.add("on")},6500)}
/* hebrew date */
var HM={Tishri:"תשרי",Heshvan:"חשון",Kislev:"כסלו",Tevet:"טבת",Shevat:"שבט","Adar I":"אדר א׳","Adar II":"אדר ב׳",Adar:"אדר",Nisan:"ניסן",Iyar:"אייר",Sivan:"סיון",Tamuz:"תמוז",Av:"אב",Elul:"אלול"};
function gem(n){var L=[[400,"ת"],[300,"ש"],[200,"ר"],[100,"ק"],[90,"צ"],[80,"פ"],[70,"ע"],[60,"ס"],[50,"נ"],[40,"מ"],[30,"ל"],[20,"כ"],[10,"י"],[9,"ט"],[8,"ח"],[7,"ז"],[6,"ו"],[5,"ה"],[4,"ד"],[3,"ג"],[2,"ב"],[1,"א"]],s="";
while(n>0){if(n===15){s+="טו";break}if(n===16){s+="טז";break}for(var i=0;i<L.length;i++){if(n>=L[i][0]){s+=L[i][1];n-=L[i][0];break}}}
return s.length>1?s.slice(0,-1)+"״"+s.slice(-1):s+"׳"}
var DAYS=["זונטאג","מאנטאג","דינסטאג","מיטוואך","דאנערשטאג","פרייטאג","שבת"];
try{var parts=new Intl.DateTimeFormat("en-u-ca-hebrew",{day:"numeric",month:"long",year:"numeric",timeZone:TZ}).formatToParts(new Date()),d={};parts.forEach(function(p){d[p.type]=p.value});
var dow=new Date(new Date().toLocaleString("en-US",{timeZone:TZ})).getDay();
var mon=HM[d.month]||d.month;if(/[A-Za-z]/.test(mon))throw 0;
$("#hdate").textContent=DAYS[dow]+" · "+gem(parseInt(d.day,10))+" "+mon+" "+gem(parseInt(d.year,10)%1000)}catch(e){}
/* zmanim (NOAA solar position) */
function rad(x){return x*Math.PI/180}function deg(x){return x*180/Math.PI}
function solar(jd){var T=(jd-2451545)/36525,L0=(280.46646+T*(36000.76983+T*0.0003032))%360,M=357.52911+T*(35999.05029-0.0001537*T),e=0.016708634-T*(0.000042037+0.0000001267*T),
C=Math.sin(rad(M))*(1.914602-T*(0.004817+0.000014*T))+Math.sin(rad(2*M))*(0.019993-0.000101*T)+Math.sin(rad(3*M))*0.000289,tl=L0+C,om=125.04-1934.136*T,lam=tl-0.00569-0.00478*Math.sin(rad(om)),
eps0=23+(26+(21.448-T*(46.815+T*(0.00059-T*0.001813)))/60)/60,eps=eps0+0.00256*Math.cos(rad(om)),dec=deg(Math.asin(Math.sin(rad(eps))*Math.sin(rad(lam)))),
y=Math.pow(Math.tan(rad(eps/2)),2),eq=4*deg(y*Math.sin(2*rad(L0))-2*e*Math.sin(rad(M))+4*e*y*Math.sin(rad(M))*Math.cos(2*rad(L0))-0.5*y*y*Math.sin(4*rad(L0))-1.25*e*e*Math.sin(2*rad(M)));return{dec:dec,eq:eq}}
function ymdNY(){var p=new Intl.DateTimeFormat("en-US",{timeZone:TZ,year:"numeric",month:"numeric",day:"numeric"}).formatToParts(new Date()),o={};p.forEach(function(x){o[x.type]=x.value});return[+o.year,+o.month,+o.day]}
function jdOf(y,m,d){return Date.UTC(y,m-1,d)/86400000+2440587.5}
function evt(y,m,d,alt,rising){var jd0=jdOf(y,m,d),t=rising?360:1080;for(var i=0;i<3;i++){var s=solar(jd0+t/1440),c=(Math.sin(rad(alt))-Math.sin(rad(LAT))*Math.sin(rad(s.dec)))/(Math.cos(rad(LAT))*Math.cos(rad(s.dec)));if(c>1||c<-1)return null;var H=deg(Math.acos(c)),noon=720-4*LON-s.eq;t=rising?noon-4*H:noon+4*H}return new Date(Date.UTC(y,m-1,d)+t*60000)}
function noonOf(y,m,d){var s=solar(jdOf(y,m,d)+0.5);return new Date(Date.UTC(y,m-1,d)+(720-4*LON-s.eq)*60000)}
function fmt(dt){return dt?dt.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit",hour12:true,timeZone:TZ}).replace(/\s?[AP]M/,""):"–"}
try{var D=ymdNY(),Y=D[0],Mo=D[1],Da=D[2],sr=evt(Y,Mo,Da,-0.833,true),ss=evt(Y,Mo,Da,-0.833,false),alos=evt(Y,Mo,Da,-16.1,true),tz=evt(Y,Mo,Da,-8.5,false),day=ss-sr,hr=day/12,
mgaS=new Date(sr-72*60000),mgaH=(day+144*60000)/12,ch=noonOf(Y,Mo,Da);
var Z=[["עלות השחר",alos],["נץ החמה",sr],["סוף זמן ק״ש מג״א",new Date(+mgaS+3*mgaH)],["סוף זמן ק״ש גר״א",new Date(+sr+3*hr)],["סוף זמן תפלה גר״א",new Date(+sr+4*hr)],["חצות",ch],["מנחה גדולה",new Date(+ch+30*60000>+sr+6.5*hr?+ch+30*60000:+sr+6.5*hr)],["שקיעה",ss],["צאת הכוכבים",tz],["רבינו תם",new Date(+ss+72*60000)]];
$("#zl").innerHTML=Z.map(function(z){return"<li><span>"+z[0]+"</span><b>"+fmt(z[1])+"</b></li>"}).join("")}catch(e){$("#zl").innerHTML="<li>–</li>"}
/* weather */
var WC=function(c){if(c===0)return"קלאר";if(c<=2)return"א ביסל וואלקנדיג";if(c===3)return"וואלקנדיג";if(c<=48)return"נעפל";if(c<=57)return"א שפריץ רעגן";if(c<=67)return"רעגן";if(c<=77)return"שניי";if(c<=82)return"פלוצעמדיגער רעגן";if(c<=86)return"שניי";return"דונער און בליץ"};
function wx(){var u="https://api.open-meteo.com/v1/forecast?latitude="+LAT+"&longitude="+LON+"&current=temperature_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=America%2FNew_York&forecast_days=4";
fetch(u).then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(j){var c=j.current,dl=j.daily,h='<div class="wx-now"><b>'+Math.round(c.temperature_2m)+"°</b><span>"+WC(c.weather_code)+" · ווינט "+Math.round(c.wind_speed_10m)+" מייל א שעה</span></div><ul class=\"wx-days\">";
for(var i=0;i<dl.time.length;i++){var dd=new Date(dl.time[i]+"T12:00:00");h+="<li>"+(i===0?"היינט":DAYS[dd.getDay()])+"<b>"+Math.round(dl.temperature_2m_max[i])+"° / "+Math.round(dl.temperature_2m_min[i])+"°</b><small>"+WC(dl.weather_code[i])+"</small></li>"}
$("#wx").innerHTML=h+'</ul><p class="tsub">גראד פארענהייט, מאנסי</p>'}).catch(function(){$("#wx").innerHTML='<p class="tsub">דער וועטער קען יעצט נישט לאדן. פרובירט שפעטער.</p>'})}
wx();
/* gallery */
$$(".chip").forEach(function(ch){ch.addEventListener("click",function(){var c=ch.getAttribute("data-cat");$$(".chip").forEach(function(x){x.classList.toggle("on",x===ch)});$$(".gi").forEach(function(g){g.hidden=!(c==="אלע"||g.getAttribute("data-cat")===c)})})});
var lb=$("#lb");function closeLb(){if(lb)lb.hidden=true}
$$(".gi").forEach(function(g){g.addEventListener("click",function(){$("img",lb).src=g.getAttribute("data-src");$("img",lb).alt=g.getAttribute("data-cap");$("p",lb).textContent=g.getAttribute("data-cap");lb.hidden=false})});
if(lb){lb.addEventListener("click",function(e){if(e.target===lb||e.target.classList.contains("lb-x"))closeLb()})}
/* offline */
if("serviceWorker" in navigator&&location.protocol==="https:"){navigator.serviceWorker.register("sw.js").catch(function(){})}
})();
