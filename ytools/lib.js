/* אידישע טולס – core library (pure functions) */
(function(root){
'use strict';
var L={};
var MARKS=/[\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7]/g;
L.stripNikud=function(s,keepLig){
  s=s.normalize('NFD').replace(MARKS,'');
  if(!keepLig) s=s.replace(/\u05F0/g,'וו').replace(/\u05F1/g,'וי').replace(/\u05F2/g,'יי');
  return s;
};
L.countMarks=function(s){var m=s.normalize('NFD').match(MARKS);return m?m.length:0;};
/* ---------- gematria ---------- */
var LET='אבגדהוזחטיכלמנסעפצקרשת', FIN={'ך':'כ','ם':'מ','ן':'נ','ף':'פ','ץ':'צ'};
var STD={},ORD={};
var vals=[1,2,3,4,5,6,7,8,9,10,20,30,40,50,60,70,80,90,100,200,300,400];
for(var i=0;i<22;i++){STD[LET[i]]=vals[i];ORD[LET[i]]=i+1;}
var GADOL={'ך':500,'ם':600,'ן':700,'ף':800,'ץ':900};
L.letters=function(s){return Array.from(L.stripNikud(s)).filter(function(c){return STD[c]||FIN[c];});};
L.gematria=function(s){
  var r={std:0,gadol:0,katan:0,ord:0,n:0};
  L.letters(s).forEach(function(c){var b=FIN[c]||c,v=STD[b];
    r.std+=v; r.gadol+=GADOL[c]||v; r.ord+=ORD[b];
    var k=v; while(k>=10)k/=10; r.katan+=k; r.n++;});
  r.katan=Math.round(r.katan);
  return r;
};
L.atbash=function(s){var out='';Array.from(L.stripNikud(s)).forEach(function(c){var b=FIN[c]||c,i=LET.indexOf(b);out+= i>=0?LET[21-i]:c;});return out;};
/* ---------- numbers <-> letters ---------- */
function under1000(n){
  var s='';
  while(n>=400){s+='ת';n-=400;}
  var H={300:'ש',200:'ר',100:'ק'};[300,200,100].forEach(function(h){if(n>=h){s+=H[h];n-=h;}});
  if(n===15)return s+'טו'; if(n===16)return s+'טז';
  var T={90:'צ',80:'פ',70:'ע',60:'ס',50:'נ',40:'מ',30:'ל',20:'כ',10:'י'};
  for(var t=90;t>=10;t-=10){if(n>=t){s+=T[t];n-=t;break;}}
  if(n>0)s+=LET[n-1];
  return s;
}
L.numToHeb=function(n,opt){
  opt=opt||{};n=Math.floor(Math.abs(n));if(!n)return '';
  var th=Math.floor(n/1000), r=n%1000, s=under1000(r);
  s=s.replace(/^(ת*)רע$/,'$1ער').replace(/^(ת*)שמד$/,'$1שדמ').replace(/^(ת*)רצח$/,'$1רחצ');
  if(opt.marks!==false){
    if(s.length>1) s=s.slice(0,-1)+'״'+s.slice(-1); else if(s.length===1) s+='׳';
  }
  if(th && opt.thousands!==false){ var t=under1000(th); s=t+(opt.marks!==false?'׳':'')+s; }
  return s;
};
L.hebToNum=function(str){
  str=L.stripNikud(str).replace(/[\u201C\u201D"]/g,'״').replace(/'/g,'׳').trim();
  var m=str.match(/^([א-ת]+)׳(?=[א-ת])/);
  if(m){return L.gematria(m[1]).std*1000+L.gematria(str.slice(m[0].length)).std;}
  return L.gematria(str).std;
};
/* ---------- Hebrew calendar ---------- */
var YM={'Tishri':'תשרי','Heshvan':'חשון','Kislev':'כסלו','Tevet':'טבת','Shevat':'שבט','Adar':'אדר','Adar I':'אדר א׳','Adar II':'אדר ב׳','Nisan':'ניסן','Iyar':'אייר','Sivan':'סיון','Tamuz':'תמוז','Av':'מנחם אב','Elul':'אלול'};
L.YM=YM;
L.DOW=['זונטאג','מאנטאג','דינסטאג','מיטוואך','דאנערשטאג','פרייטאג','שבת קודש'];
L.DOWH=['יום א׳','יום ב׳','יום ג׳','יום ד׳','יום ה׳','יום ו׳','שבת'];
var HF=null;
function hf(){if(!HF)HF=new Intl.DateTimeFormat('en-u-ca-hebrew',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'});return HF;}
L.utcNoon=function(y,m,d){return new Date(Date.UTC(y,m-1,d,12));};
L.hdate=function(dt){ /* dt = Date at UTC noon of the civil day */
  var p={};hf().formatToParts(dt).forEach(function(x){p[x.type]=x.value;});
  var y=parseInt(String(p.year).replace(/\D/g,''),10), d=parseInt(p.day,10), mo=p.month;
  return {y:y,m:mo,d:d,ym:YM[mo]||mo,
    text:L.numToHeb(d)+' '+(YM[mo]||mo)+' '+L.numToHeb(y,{thousands:false}),
    dow:dt.getUTCDay()};
};
L.isLeap=function(y){return ((7*y+1)%19)<7;};
L.months=function(y){return L.isLeap(y)?['Tishri','Heshvan','Kislev','Tevet','Shevat','Adar I','Adar II','Nisan','Iyar','Sivan','Tamuz','Av','Elul']:['Tishri','Heshvan','Kislev','Tevet','Shevat','Adar','Nisan','Iyar','Sivan','Tamuz','Av','Elul'];};
L.hebToGreg=function(y,mo,d){
  var start=Date.UTC(y-3761,7,1,12)-40*864e5;
  for(var i=0;i<420;i++){var dt=new Date(start+i*864e5),h=L.hdate(dt);
    if(h.y===y&&h.m===mo&&h.d===d)return dt;
    if(h.y>y)break;}
  return null;
};
L.todayNY=function(){
  var p={};new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',year:'numeric',month:'numeric',day:'numeric'}).formatToParts(new Date()).forEach(function(x){p[x.type]=x.value;});
  return L.utcNoon(+p.year,+p.month,+p.day);
};
L.yahrzeit=function(mo,d,fromY,count){
  var out=[];
  for(var y=fromY;y<fromY+count;y++){
    var m=mo, leap=L.isLeap(y), note='';
    if(!leap&&(m==='Adar I'||m==='Adar II'))m='Adar';
    if(leap&&m==='Adar'){m='Adar I';note='אדר א׳ (מנהגים זענען אנדערש)';}
    var dd=d, dt=L.hebToGreg(y,m,dd);
    if(!dt&&dd===30){dt=L.hebToGreg(y,m,29);note='ל׳ איז נישטא דאס יאר – כ״ט';}
    out.push({y:y,date:dt,note:note});
  }
  return out;
};
/* ---------- Daf Yomi ---------- */
var SHAS=[['ברכות',64],['שבת',157],['עירובין',105],['פסחים',121],['שקלים',22],['יומא',88],['סוכה',56],['ביצה',40],['ראש השנה',35],['תענית',31],['מגילה',32],['מועד קטן',29],['חגיגה',27],['יבמות',122],['כתובות',112],['נדרים',91],['נזיר',66],['סוטה',49],['גיטין',90],['קידושין',82],['בבא קמא',119],['בבא מציעא',119],['בבא בתרא',176],['סנהדרין',113],['מכות',24],['שבועות',49],['עבודה זרה',76],['הוריות',14],['זבחים',120],['מנחות',110],['חולין',142],['בכורות',61],['ערכין',34],['תמורה',34],['כריתות',28],['מעילה',22],['קינים',4],['תמיד',10],['מדות',4],['נדה',73]];
L.dafYomi=function(dt){
  var c0=Date.UTC(2020,0,5,12), days=Math.round((dt.getTime()-c0)/864e5);
  var total=0;SHAS.forEach(function(s){total+=s[1]-1;});
  var dno=((days%total)+total)%total, cnt=0;
  for(var j=0;j<SHAS.length;j++){
    cnt+=SHAS[j][1]-1;
    if(dno<cnt){var b=SHAS[j][1]+1-(cnt-dno);
      if(j===36)b+=21; else if(j===37)b+=24; else if(j===38)b+=32;
      return {m:SHAS[j][0],daf:b,text:SHAS[j][0]+' דף '+L.numToHeb(b)};}
  }
};
/* ---------- Tehillim ---------- */
var TM=['1-9','10-17','18-22','23-28','29-34','35-38','39-43','44-48','49-54','55-59','60-65','66-68','69-71','72-76','77-78','79-82','83-87','88-89','90-96','97-103','104-105','106-107','108-112','113-118','119:1-96','119:97-176','120-134','135-139','140-144','145-150'];
var TW=['1-29','30-50','51-72','73-89','90-106','107-119','120-150'];
function tr(r){if(r.indexOf(':')>0){var p=r.split(':'),q=p[1].split('-');return 'קאפיטל קי״ט, פסוק '+L.numToHeb(+q[0],{marks:false})+'–'+L.numToHeb(+q[1],{marks:false});}
  var a=r.split('-');return 'קאפיטל '+L.numToHeb(+a[0])+' – '+L.numToHeb(+a[1]);}
L.tehillim=function(hday,dow,monthLen){
  var m=tr(TM[hday-1]);
  if(hday===29&&monthLen===29)m+=' און '+tr(TM[29]);
  return {month:m,week:tr(TW[dow])};
};
/* ---------- Zmanim (NOAA-style sunrise equation) ---------- */
var RAD=Math.PI/180;
L.sun=function(dt,lat,lon,angle){
  var jd=dt.getTime()/864e5+2440587.5; /* dt is UTC noon */
  var n=Math.round(jd-2451545.0-0.5)+0.0008;
  var Js=n-lon/360, M=(357.5291+0.98560028*Js)%360;
  var C=1.9148*Math.sin(M*RAD)+0.02*Math.sin(2*M*RAD)+0.0003*Math.sin(3*M*RAD);
  var lam=(M+C+180+102.9372)%360;
  var Jt=2451545.0+Js+0.0053*Math.sin(M*RAD)-0.0069*Math.sin(2*lam*RAD);
  var sd=Math.sin(lam*RAD)*Math.sin(23.4397*RAD), cd=Math.cos(Math.asin(sd));
  var cw=(Math.sin(angle*RAD)-Math.sin(lat*RAD)*sd)/(Math.cos(lat*RAD)*cd);
  var toMs=function(j){return (j-2440587.5)*864e5;};
  if(cw<-1||cw>1)return {noon:toMs(Jt)};
  var w=Math.acos(cw)/RAD;
  return {rise:toMs(Jt-w/360),set:toMs(Jt+w/360),noon:toMs(Jt)};
};
L.PLACES=[['וויליאמסבורג',40.7081,-73.9571],['קרית יואל',41.3415,-74.1682],['מאנסי',41.1112,-74.0685],['בארא פארק',40.6339,-73.9965]];
L.zmanim=function(dt,lat,lon,candle){
  var s=L.sun(dt,lat,lon,-0.833), m=6e4;
  var netz=s.rise, shk=s.set, gra=(shk-netz)/12, alos=netz-72*m, tz=shk+72*m, ma=(tz-alos)/12;
  return [
    ['עלות השחר (72 מינוט)',alos],
    ['הנץ החמה',netz],
    ['סוף זמן ק״ש – מגן אברהם',alos+3*ma],
    ['סוף זמן ק״ש – גר״א',netz+3*gra],
    ['סוף זמן תפילה – מגן אברהם',alos+4*ma],
    ['סוף זמן תפילה – גר״א',netz+4*gra],
    ['חצות',(netz+shk)/2],
    ['מנחה גדולה',netz+6.5*gra],
    ['מנחה קטנה',netz+9.5*gra],
    ['פלג המנחה',netz+10.75*gra],
    ['שקיעה',shk],
    ['צאת הכוכבים (72 מינוט)',tz]
  ].concat(candle?[['הדלקת נרות (18 מינוט)',shk-18*m]]:[]);
};
L.fmtTime=function(ms){return '\u2066'+new Intl.DateTimeFormat('en-US',{hour:'numeric',minute:'2-digit',timeZone:'America/New_York'}).format(new Date(ms))+'\u2069';};
/* ---------- transliteration ---------- */
var FINALS={'כ':'ך','מ':'ם','נ':'ן','צ':'ץ','F':'ף'};
var ALIAS={shalom:'שלום',sholom:'שלום',shabbat:'שבת',shabes:'שבת',shabbes:'שבת',torah:'תורה',tora:'תורה',mitzvah:'מצוה',mitzva:'מצוה',mitsve:'מצוה',simcha:'שמחה',rabbi:'רב',hashem:'השם',boruch:'ברוך',baruch:'ברוך',chaim:'חיים',yisroel:'ישראל',moshe:'משה',moishe:'משה',yaakov:'יעקב',yankev:'יעקב',avrohom:'אברהם',avraham:'אברהם',yitzchok:'יצחק',yosef:'יוסף',yoisef:'יוסף',dovid:'דוד',shloime:'שלמה',shlomo:'שלמה',aharon:'אהרן',yoel:'יואל',menachem:'מנחם',mendel:'מענדל',tzvi:'צבי',hersh:'הערש',zalmen:'זלמן',eliezer:'אליעזר',chesed:'חסד',tzedakah:'צדקה',tzedoke:'צדקה',tefillin:'תפילין',tallis:'טלית',yeshiva:'ישיבה',beis:'בית',bais:'בית',medrash:'מדרש',kehilla:'קהלה',kehile:'קהלה',rosh:'ראש',hashana:'השנה',hashone:'השנה',pesach:'פסח',sukkos:'סוכות',chanukah:'חנוכה',chanuka:'חנוכה',shavuos:'שבועות',eretz:'ארץ',olam:'עולם',emes:'אמת',sefer:'ספר',seyfer:'ספר',sforim:'ספרים',yontev:'יום טוב',yom:'יום',tov:'טוב',toiv:'טוב',kosher:'כשר',mazal:'מזל',gemara:'גמרא',tehillim:'תהלים',chasuna:'חתונה',chasunah:'חתונה',yid:'איד',yidden:'אידן',rebbe:'רבי',rov:'רב',chosid:'חסיד',chassidim:'חסידים',chasidim:'חסידים',satmar:'סאטמאר',williamsburg:'וויליאמסבורג',brooklyn:'ברוקלין',amen:'אמן',omein:'אמן',ois:'אות'};
var WMAP=null, RMAP=null;
function maps(){
  if(WMAP)return; WMAP={}; RMAP={};
  (root.YDICT||[]).forEach(function(e){var w=e[1].toLowerCase(),y=e[0];
    if(w.indexOf(' ')<0&&y.indexOf(' ')<0){ if(!WMAP[w])WMAP[w]=y; if(!RMAP[y])RMAP[y]=w; }
    else { var ws=w.split(' '),ys=y.split(' '); if(ws.length===ys.length)ws.forEach(function(x,i){if(!WMAP[x])WMAP[x]=ys[i]; if(!RMAP[ys[i]])RMAP[ys[i]]=x;}); }});
  for(var k in ALIAS){WMAP[k]=ALIAS[k]; if(!RMAP[ALIAS[k]])RMAP[ALIAS[k]]=k;}
}
var VOW={a:1,e:1,i:1,o:1,u:1,y:0};
L.latToYid=function(text,yivo){
  maps();
  return text.replace(/[A-Za-z']+/g,function(word){
    var lw=word.toLowerCase().replace(/'/g,'');
    if(!yivo&&WMAP[lw])return WMAP[lw];
    var w=lw.replace(/([bcdfgjklmnpqrstvxz])\1/g,'$1'), out='', i=0, first=true;
    var R=[['tsh','טש'],['tch','טש'],['zh','זש'],['sh','ש'],['ch','כ'],['kh','כ'],['ts','צ'],['tz','צ'],['ph','F'],
      ['oy',yivo?'ױ':'וי','אוי'],['oi',yivo?'ױ':'וי','אוי'],['ey',yivo?'ײ':'יי','איי'],['ei',yivo?'ײ':'יי','איי'],['ay',yivo?'ײַ':'יי','איי'],['ai',yivo?'ײַ':'יי','איי'],
      ['v',yivo?'װ':'וו'],['w',yivo?'װ':'וו'],['u',yivo?'ו':'ו','או'],['i','י','אי'],['y','י'],['a',yivo?'אַ':'א','א'],['o',yivo?'אָ':'א','א'],['e','ע','ע'],
      ['b','ב'],['g','ג'],['d','ד'],['h','ה'],['z','ז'],['t','ט'],['k','ק'],['q','ק'],['c','ק'],['l','ל'],['m','מ'],['n','נ'],['s','ס'],['r','ר'],['p',yivo?'פּ':'פ'],['f','F'],['j','דזש'],['x','קס']];
    while(i<w.length){
      var hit=null;
      for(var r=0;r<R.length;r++){if(w.substr(i,R[r][0].length)===R[r][0]){hit=R[r];break;}}
      if(!hit){out+=w[i];i++;first=false;continue;}
      var t=(first&&hit[2])?hit[2]:hit[1];
      if(yivo&&first&&hit[0]==='u')t='או';
      if(yivo&&first&&(hit[0]==='oy'||hit[0]==='oi'))t='אױ';
      if(yivo&&first&&/^(ey|ei)$/.test(hit[0]))t='אײ';
      if(yivo&&first&&/^(ay|ai)$/.test(hit[0]))t='אײַ';
      if(yivo&&first&&hit[0]==='i')t='אי';
      /* vowel after vowel needs a shtumer alef in YIVO for i/u */
      out+=t; i+=hit[0].length; first=false;
    }
    var last=out.slice(-1);
    if(FINALS[last]&&last!=='F')out=out.slice(0,-1)+FINALS[last];
    out=out.replace(/F$/,'ף').replace(/F/g,yivo?'פֿ':'פ');
    return out;
  });
};
L.yidToLat=function(text){
  maps();
  return text.replace(/[\u0590-\u05FF\uFB1D-\uFB4F]+/g,function(word){
    var plain=L.stripNikud(word);
    if(RMAP[plain]&&!/[\u05B0-\u05C7]/.test(word.normalize('NFD')))return RMAP[plain];
    var w=word.normalize('NFD')
      .replace(/א\u05B7/g,'a').replace(/א\u05B8/g,'o').replace(/פ\u05BC/g,'p').replace(/פ\u05BF/g,'f').replace(/כ\u05BC/g,'k').replace(/ת\u05BC/g,'t').replace(/ש\u05C2/g,'s').replace(/ב\u05BF/g,'v')
      .replace(/\u05F2\u05B7/g,'ay').replace(/י\u05B4/g,'i').replace(/ו\u05BC/g,'u');
    w=w.replace(MARKS,'').replace(/\u05F0/g,'וו').replace(/\u05F1/g,'וי').replace(/\u05F2/g,'יי');
    var R=[['דזש','j'],['זש','zh'],['טש','tsh'],['ווו','vu'],['וו','v'],['וי','oy'],['יי','ey'],['ש','sh'],['צ','ts'],['ץ','ts'],['כ','ch'],['ך','ch'],['ח','ch'],['ת','s'],['ט','t'],['ס','s'],['ב','b'],['ג','g'],['ד','d'],['ה','h'],['ז','z'],['ק','k'],['ל','l'],['מ','m'],['ם','m'],['נ','n'],['ן','n'],['ף','f'],['ר','r'],['ע','e'],['ו','u'],['י','i'],['א','a'],['פ','p']];
    var out='',i=0;
    while(i<w.length){
      var c=w[i];
      if(i===0&&c==='א'&&/[וי]/.test(w[1]||'')){i++;continue;}
      if(i===0&&c==='פ'){out+='f';i++;continue;}
      if(c==='י'&&(i===0)&&/[אעוי]/.test(w[1]||'')&&w.substr(0,2)!=='יי'){out+='y';i++;continue;}
      var hit=null;for(var r=0;r<R.length;r++){if(w.substr(i,R[r][0].length)===R[r][0]){hit=R[r];break;}}
      if(hit){out+=hit[1];i+=hit[0].length;}else{out+=c;i++;}
    }
    return out;
  });
};
/* ---------- keyboard layout fix ---------- */
var EN="qwertyuiopasdfghjkl;'zxcvbnm,./", HE="/'קראטוןםפשדגכעיחלךף,זסבהנמצתץ.";
L.enToHe=function(s){return Array.from(s).map(function(c){var i=EN.indexOf(c.toLowerCase());return i>=0?HE[i]:c;}).join('');};
L.heToEn=function(s){return Array.from(s).map(function(c){var i=HE.indexOf(c);return (i>=0&&/[\u05D0-\u05EA]/.test(c))?EN[i]:c;}).join('');};
/* ---------- spelling normaliser ---------- */
L.ligSplit=function(s){return s.normalize('NFD').replace(/\u05F0/g,'וו').replace(/\u05F1/g,'וי').replace(/\u05F2/g,'יי');};
L.ligJoin=function(s){return s.normalize('NFD').replace(/וו/g,'\u05F0').replace(/יי/g,'\u05F2').replace(/(^|[^\u05D5\u05F0])וי/g,'$1\u05F1');};
L.removeAlefMarks=function(s){return s.normalize('NFD').replace(/א[\u05B7\u05B8]/g,'א');};
L.hasidic=function(s){return L.stripNikud(s,false);};
L.presentationFix=function(s){return s.normalize('NFD').normalize('NFC');};
root.YL=L;
if(typeof module!=='undefined')module.exports=L;
})(typeof window!=='undefined'?window:globalThis);
