/* אידישע טולס – app */
(function(){
'use strict';
var L=window.YL, $=function(s,r){return (r||document).querySelector(s);}, $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s));};
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function h(html){var d=document.createElement('div');d.innerHTML=html;return d;}
var toastT;function toast(t){var e=$('#toast');e.textContent=t;e.classList.add('on');clearTimeout(toastT);toastT=setTimeout(function(){e.classList.remove('on');},1600);}
function copy(t){if(!t){toast('גארנישט צו קאפירן');return;}
  (navigator.clipboard&&navigator.clipboard.writeText?navigator.clipboard.writeText(t):Promise.reject()).then(function(){toast('✓ קאפירט');},function(){var a=document.createElement('textarea');a.value=t;document.body.appendChild(a);a.select();try{document.execCommand('copy');toast('✓ קאפירט');}catch(e){}a.remove();});}
function share(t){if(!t){toast('גארנישט צו שיקן');return;} if(navigator.share)navigator.share({text:t}).catch(function(){});else copy(t);}
function bigText(t){var b=$('#bigtext');if(!t)return;b.textContent=t;var n=t.length;b.style.fontSize=(n<6?'26vw':n<14?'15vw':n<30?'10vw':n<80?'7vw':'5vw');b.classList.add('open');}
function seg(opts,cb,start){var w=document.createElement('div');w.className='seg';opts.forEach(function(o,i){var b=document.createElement('button');b.type='button';b.textContent=o[1];if(i===(start||0))b.className='on';b.onclick=function(){$$('button',w).forEach(function(x){x.className='';});b.className='on';cb(o[0]);};w.appendChild(b);});return w;}
function textBtns(getT){return '<div class="btns"><button class="b g" data-a="copy" type="button">📋 קאפירן</button><button class="b" data-a="share" type="button">📤 שיקן</button><button class="b" data-a="big" type="button">🔍 גרויס</button><button class="b" data-a="clear" type="button">🗑 אויסמעקן</button></div>';}
function wireBtns(root,getT,clear){$$('[data-a]',root).forEach(function(b){b.onclick=function(){var a=b.dataset.a;if(a==='copy')copy(getT());if(a==='share')share(getT());if(a==='big')bigText(getT());if(a==='clear'&&clear)clear();};});}
function save(k,v){try{localStorage.setItem('yt-'+k,v);}catch(e){}}
function load(k){try{return localStorage.getItem('yt-'+k)||'';}catch(e){return '';}}

/* ================= TOOLS ================= */
var T=[];
function tool(id,ttl,desc,ico,c1,c2,render,kw){T.push({id:id,t:ttl,d:desc,i:ico,c1:c1,c2:c2,r:render,kw:kw||''});}

/* 1 keyboard */
tool('kbd','אידישע קלאוויאטור','שרייב אידיש מיט אלע אותיות – װ ױ ײ אַ אָ פֿ','⌨️','#2a4fd0','#13287a',function(el){
  el.innerHTML='<div class="card"><textarea id="kt" class="kta" rows="3" placeholder="דריק אויף די אותיות…" inputmode="none" dir="rtl"></textarea>'+textBtns()+
  '<div class="btns" style="margin-top:6px"><button class="b" id="ksys" type="button">📱 טעלעפאן קלאוויאטור</button><button class="b" id="knik" type="button">🔣 נקודות</button></div><div class="kbd" id="kb"></div></div><p class="note">די אידישע אותיות (צוזאמענגעשטעלטע) זענען געל. דער טעקסט ווערט געהאלטן אויפן טעלעפאן.</p>';
  var ta=$('#kt',el); ta.value=load('kbd');
  var rows=[['ק','ר','א','ט','ו','ן','ם','פ'],['ש','ד','ג','כ','ע','י','ח','ל','ך','ף'],['ז','ס','ב','ה','נ','מ','צ','ת','ץ']];
  var yrow=['אַ','אָ','װ','ױ','ײ','ײַ','פֿ','פּ','כּ','תּ','שׂ','וּ','יִ','בֿ'];
  var nik=[['\u05B7','פתח'],['\u05B8','קמץ'],['\u05B4','חיריק'],['\u05B5','צירי'],['\u05B6','סגול'],['\u05B9','חולם'],['\u05BB','קובוץ'],['\u05B0','שוא'],['\u05BC','דגש'],['\u05BF','רפה'],['\u05C1','שין'],['\u05C2','סין']];
  var punc=['״','׳','־','.',',','?','!','"',':','(',')'];
  var showNik=false;
  function ins(s){var a=ta.selectionStart,b=ta.selectionEnd;if(document.activeElement!==ta){a=b=ta.value.length;}ta.value=ta.value.slice(0,a)+s+ta.value.slice(b);var p=a+s.length;ta.setSelectionRange(p,p);save('kbd',ta.value);}
  function bs(){var a=ta.selectionStart,b=ta.selectionEnd;if(document.activeElement!==ta){a=b=ta.value.length;}if(a===b){if(!a)return;var prev=ta.value.slice(0,a);var m=prev.match(/.[\u0591-\u05C7]*$/u);a-=m?m[0].length:1;}ta.value=ta.value.slice(0,a)+ta.value.slice(b);ta.setSelectionRange(a,a);save('kbd',ta.value);}
  function draw(){var kb=$('#kb',el),H='';
    H+='<div class="kr">'+yrow.slice(0,7).map(function(k){return '<button type="button" class="k y" data-k="'+k+'">'+k+'</button>';}).join('')+'</div>';
    H+='<div class="kr">'+yrow.slice(7).map(function(k){return '<button type="button" class="k y" data-k="'+k+'">'+k+'</button>';}).join('')+'</div>';
    if(showNik)H+='<div class="kr" style="flex-wrap:wrap">'+nik.map(function(k){return '<button type="button" class="k f" title="'+k[1]+'" data-k="'+k[0]+'">ב'+k[0]+'</button>';}).join('')+'</div>';
    rows.forEach(function(r,i){H+='<div class="kr">'+r.map(function(k){return '<button type="button" class="k" data-k="'+k+'">'+k+'</button>';}).join('')+(i===2?'<button type="button" class="k f" data-f="bs" aria-label="אויסמעקן">⌫</button>':'')+'</div>';});
    H+='<div class="kr">'+punc.map(function(k){return '<button type="button" class="k f" data-k="'+k+'">'+k+'</button>';}).join('')+'</div>';
    H+='<div class="kr"><button type="button" class="k f w2" data-f="nl">⏎</button><button type="button" class="k f w5" data-k=" ">רווח</button><button type="button" class="k f w2" data-f="bs">⌫</button></div>';
    kb.innerHTML=H;
    $$('.k',kb).forEach(function(b){b.addEventListener('pointerdown',function(e){e.preventDefault();b.classList.add('pr');setTimeout(function(){b.classList.remove('pr');},120);if(b.dataset.k!==undefined)ins(b.dataset.k);else if(b.dataset.f==='bs')bs();else if(b.dataset.f==='nl')ins('\n');if(navigator.vibrate)navigator.vibrate(8);});});
  }
  draw();
  $('#knik',el).onclick=function(){showNik=!showNik;draw();};
  $('#ksys',el).onclick=function(){var on=ta.getAttribute('inputmode')==='none';ta.setAttribute('inputmode',on?'text':'none');this.textContent=on?'⌨️ בלויז די קלאוויאטור דא':'📱 טעלעפאן קלאוויאטור';ta.blur();ta.focus();};
  ta.addEventListener('input',function(){save('kbd',ta.value);});
  wireBtns(el,function(){return ta.value;},function(){ta.value='';save('kbd','');});
},'keyboard klaviatur typing');

/* 2 transliteration */
tool('translit','ענגליש ⇄ אידיש אותיות','שרייב "sholem" – באקום שלום; און צוריק','🔤','#0f9b8e','#0a5c63',function(el){
  var dir='l2y',yivo=false;
  el.innerHTML='<div id="sg"></div><div class="card"><label id="tl">שרייב מיט ענגלישע אותיות</label><textarea id="ti" class="ltr" placeholder="ich gey in shul, sholem aleichem"></textarea></div><div id="yv"></div><div class="card"><label>רעזולטאט</label><div id="to" class="big" style="font-size:24px;min-height:40px;margin-top:6px"></div>'+textBtns()+'</div><p class="note">אויטאמאטיש און אומגעפער. ווערטער פון לשון קודש (שבת, שלום, מצוה) ווערן געשריבן ריכטיג פון א ליסטע. חסידישער אויסלייג: א, וו, יי אן נקודות.</p>';
  var ti=$('#ti',el),to=$('#to',el);
  function run(){var v=ti.value;to.textContent=dir==='l2y'?L.latToYid(v,yivo):L.yidToLat(v);to.className='big'+(dir==='l2y'?'':' ltr');to.style.fontSize=dir==='l2y'?'24px':'19px';}
  $('#sg',el).appendChild(seg([['l2y','ענגליש ← אידיש'],['y2l','אידיש ← ענגליש']],function(v){dir=v;ti.className=v==='l2y'?'ltr':'';ti.placeholder=v==='l2y'?'ich gey in shul, sholem aleichem':'איך גיי אין שול';$('#tl',el).textContent=v==='l2y'?'שרייב מיט ענגלישע אותיות':'שרייב אויף אידיש';$('#yv',el).style.display=v==='l2y'?'':'none';run();}));
  $('#yv',el).appendChild(seg([['h','חסידיש (א, וו, יי)'],['y','מיט נקודות (אַ, װ, ײ)']],function(v){yivo=v==='y';run();}));
  ti.addEventListener('input',run);
  wireBtns(el,function(){return to.textContent;},function(){ti.value='';run();});
},'transliteration latin english letters yiddish');

/* 3 wrong layout */
tool('layout','פאלשע שפראך פארריכטן','געשריבן "akuo" אנשטאט "שלום"? פארריכט עס','🔁','#7b4bd6','#43248f',function(el){
  el.innerHTML='<div class="card"><label>פאפ אריין דעם טעקסט</label><textarea id="li" placeholder="akuo gkhfo"></textarea><div class="btns"><button class="b n" id="l1" type="button">ענגליש ← אותיות</button><button class="b n" id="l2" type="button">אותיות ← ענגליש</button></div></div><div class="card"><label>רעזולטאט</label><div id="lo" class="big" style="font-size:24px;min-height:40px"></div>'+textBtns()+'</div><p class="note">ווען מען פארגעסט צו טוישן די שפראך אויף דער קלאוויאטור (לשון קודש לייאאוט).</p>';
  var li=$('#li',el),lo=$('#lo',el);
  $('#l1',el).onclick=function(){lo.textContent=L.enToHe(li.value);lo.style.direction='rtl';};
  $('#l2',el).onclick=function(){lo.textContent=L.heToEn(li.value);lo.style.direction='ltr';};
  wireBtns(el,function(){return lo.textContent;},function(){li.value='';lo.textContent='';});
},'layout keyboard wrong language fix');

/* 4 gematria */
tool('gematria','גימטריא רעכנער','רעגולער, גדול, קטן און סדורי','🔢','#c48a1c','#8a5a0c',function(el){
  el.innerHTML='<div class="card"><label>שרייב א ווארט אדער פסוק</label><input id="gi" type="text" value="שלום" dir="rtl"></div><div class="res" id="gr"></div><div class="card" style="margin-top:12px"><h4>יעדעס ווארט באזונדער</h4><table class="t" id="gw"></table></div><div class="card"><h4>אתב״ש</h4><div id="ga" class="big" style="font-size:22px"></div></div><p class="note">גדול: ך=500 ם=600 ן=700 ף=800 ץ=900. קטן: אן נולן (י=1, ק=1). סדורי: א=1 … ת=22.</p>';
  var gi=$('#gi',el);
  function run(){var g=L.gematria(gi.value);
    $('#gr',el).innerHTML=[['רעגולער',g.std],['גדול',g.gadol],['קטן',g.katan],['סדורי',g.ord]].map(function(x,i){return '<div class="rb"'+(i===0?' style="border-color:var(--gold);background:rgba(212,175,90,.12)"':'')+'><small>'+x[0]+'</small><b>'+x[1]+'</b></div>';}).join('');
    var ws=gi.value.split(/[\s־,.]+/).filter(function(w){return L.letters(w).length;});
    $('#gw',el).innerHTML='<tr><th>ווארט</th><th>רעגולער</th><th>גדול</th><th>קטן</th></tr>'+ws.map(function(w){var x=L.gematria(w);return '<tr><td><b>'+esc(w)+'</b></td><td>'+x.std+'</td><td>'+x.gadol+'</td><td>'+x.katan+'</td></tr>';}).join('');
    $('#ga',el).textContent=L.atbash(gi.value);}
  gi.addEventListener('input',run);run();
},'gematria gimatria');

/* 5 date converter */
tool('date','דאטום איבערמאכער','ענגליש ⇄ אידישער דאטום, יארצייט','📅','#d2475b','#8f1f35',function(el){
  var today=L.todayNY(), th=L.hdate(today);
  el.innerHTML='<div class="card" style="text-align:center"><h4>היינט</h4><div class="big" id="dt0"></div><div class="note" id="dt1" style="margin-top:4px"></div></div><div id="ds"></div><div id="dpane"></div>';
  $('#dt0',el).textContent=L.DOW[today.getUTCDay()]+', '+th.text;
  $('#dt1',el).textContent=today.toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric',timeZone:'UTC'});
  var P=$('#dpane',el);
  function hebSelects(y){return '<div class="row"><div><label>טאג</label><select id="hd">'+Array.from({length:30},function(_,i){return '<option value="'+(i+1)+'">'+L.numToHeb(i+1)+'</option>';}).join('')+'</select></div><div><label>חודש</label><select id="hm"></select></div><div><label>יאר</label><input id="hy" type="number" value="'+y+'" inputmode="numeric"></div></div>';}
  function fillMonths(){var y=+$('#hy',P).value||th.y, cur=$('#hm',P).value;$('#hm',P).innerHTML=L.months(y).map(function(m){return '<option value="'+m+'">'+L.YM[m]+'</option>';}).join('');if(cur&&L.months(y).indexOf(cur)>=0)$('#hm',P).value=cur;}
  function g2h(){P.innerHTML='<div class="card"><label>ענגלישער דאטום</label><input type="date" id="gd"><label style="display:flex;gap:6px;align-items:center;margin-top:8px"><input type="checkbox" id="an"> נאך שקיעה (ביינאכט)</label></div><div class="card" style="text-align:center"><div class="big" id="gout"></div><div class="note" id="gout2"></div><div class="btns" style="justify-content:center"><button class="b g" id="gc" type="button">📋 קאפירן</button></div></div>';
    var gd=$('#gd',P);gd.value=today.toISOString().slice(0,10);
    function run(){if(!gd.value)return;var p=gd.value.split('-'),dt=L.utcNoon(+p[0],+p[1],+p[2]);if($('#an',P).checked)dt=new Date(dt.getTime()+864e5);var x=L.hdate(dt);$('#gout',P).textContent=x.text;$('#gout2',P).textContent=L.DOW[L.utcNoon(+p[0],+p[1],+p[2]).getUTCDay()]+($('#an',P).checked?' ביינאכט':'')+' · '+x.d+' '+x.ym+' '+x.y;}
    gd.addEventListener('input',run);$('#an',P).onchange=run;run();$('#gc',P).onclick=function(){copy($('#gout',P).textContent);};}
  function h2g(){P.innerHTML='<div class="card">'+hebSelects(th.y)+'</div><div class="card" style="text-align:center"><div class="big" id="hout"></div><div class="note" id="hout2"></div></div>';
    $('#hd',P).value=th.d;fillMonths();$('#hm',P).value=th.m;
    function run(){var y=+$('#hy',P).value,m=$('#hm',P).value,d=+$('#hd',P).value,dt=L.hebToGreg(y,m,d);
      $('#hout',P).textContent=dt?dt.toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric',timeZone:'UTC'}):'דער טאג איז נישטא אין יענעם חודש';
      $('#hout2',P).textContent=dt?L.DOW[dt.getUTCDay()]+' · '+L.numToHeb(d)+' '+L.YM[m]+' '+L.numToHeb(y,{thousands:false})+' (פון שקיעה פריער ביז שקיעה)':'';}
    $('#hy',P).addEventListener('input',function(){fillMonths();run();});$('#hm',P).onchange=run;$('#hd',P).onchange=run;run();}
  function yz(){P.innerHTML='<div class="card"><label>דער יארצייט (אידישער דאטום)</label>'+hebSelects(th.y)+'</div><div class="card"><h4>די קומענדיגע יארן</h4><table class="t" id="yt"></table><p class="note">יארצייט הייבט זיך אן ביינאכט פריער. ביי אדר און ל׳ חשון/כסלו – פרעגט א רב פאר אייער מנהג.</p></div>';
    $('#hd',P).value=th.d;fillMonths();$('#hm',P).value=th.m;
    function run(){var y=+$('#hy',P).value,m=$('#hm',P).value,d=+$('#hd',P).value;
      $('#yt',P).innerHTML='<tr><th>יאר</th><th>טאג</th><th>דאטום</th></tr>'+L.yahrzeit(m,d,y,10).map(function(r){return '<tr><td><b>'+L.numToHeb(r.y,{thousands:false})+'</b></td><td>'+(r.date?L.DOW[r.date.getUTCDay()]:'')+'</td><td style="direction:ltr;text-align:right">'+(r.date?r.date.toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric',timeZone:'UTC'}):'—')+(r.note?'<div class="note" style="direction:rtl;margin:0">'+r.note+'</div>':'')+'</td></tr>';}).join('');}
    $('#hy',P).addEventListener('input',function(){fillMonths();run();});$('#hm',P).onchange=run;$('#hd',P).onchange=run;run();}
  $('#ds',el).appendChild(seg([['g','ענגליש ← אידיש'],['h','אידיש ← ענגליש'],['y','יארצייט']],function(v){(v==='g'?g2h:v==='h'?h2g:yz)();}));
  g2h();
},'date hebrew calendar converter yahrzeit luach');

/* 6 number <-> letters */
tool('num','נומער ⇄ אותיות','5787 ← תשפ״ז, און צוריק','א״ב','#1f8a4c','#0d5530',function(el){
  el.innerHTML='<div class="card"><label>נומער</label><input id="ni" type="number" value="5787" inputmode="numeric"><label style="display:flex;gap:6px;align-items:center;margin-top:8px"><input type="checkbox" id="nt"> מיט די טויזנטער (ה׳)</label><div class="big" id="no" style="margin-top:10px"></div><div class="btns"><button class="b g" id="nc" type="button">📋 קאפירן</button></div></div><div class="card"><label>אותיות</label><input id="hi" type="text" value="תרי״ג" dir="rtl"><div class="big" id="ho" style="margin-top:10px"></div></div><p class="note">ט״ו און ט״ז ווערן געשריבן אזוי ווי עס פירט זיך. א יאר ווי תשפ״ז מיינט 5787.</p>';
  function a(){var n=+$('#ni',el).value;$('#no',el).textContent=n>0?L.numToHeb(n,{thousands:$('#nt',el).checked}):'';}
  function b(){var v=$('#hi',el).value,n=L.hebToNum(v);var plain=v.replace(/[^א-ת׳']/g,'');$('#ho',el).textContent=n?(n+(n<1000&&plain.length>=3&&n>=100?'  (אלס יאר: '+(5000+n)+')':'')):'';}
  $('#ni',el).addEventListener('input',a);$('#nt',el).onchange=a;$('#hi',el).addEventListener('input',b);a();b();
  $('#nc',el).onclick=function(){copy($('#no',el).textContent);};
},'number letters year hebrew numerals');

/* 7 today */
tool('today','היינט','דאטום, דף יומי, תהלים, זמנים – אויף איין בליק','☀️','#e3962b','#b0581a',function(el){
  var t=L.todayNY(),x=L.hdate(t),d=L.dafYomi(t),nx=L.hdate(new Date(t.getTime()+864e5*(30-x.d+1)));
  var mlen=(x.d===29&&L.hdate(new Date(t.getTime()+864e5)).d===1)?29:30;
  var th=L.tehillim(x.d,t.getUTCDay(),mlen),P=L.PLACES[0],z=L.zmanim(t,P[1],P[2],t.getUTCDay()===5);
  var pick=function(n){for(var i=0;i<z.length;i++)if(z[i][0].indexOf(n)===0)return L.fmtTime(z[i][1]);return '';};
  el.innerHTML='<div class="card" style="text-align:center"><div class="note">'+L.DOW[t.getUTCDay()]+'</div><div class="big">'+x.text+'</div><div class="note">'+t.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric',timeZone:'UTC'})+'</div></div>'+
  '<div class="card"><h4>📚 דף יומי</h4><div class="big" style="font-size:24px">'+d.text+'</div></div>'+
  '<div class="card"><h4>📜 תהלים</h4><div style="font-size:16px"><b>חודש:</b> '+th.month+'</div><div style="font-size:16px;margin-top:4px"><b>וואך:</b> '+th.week+'</div></div>'+
  '<div class="card"><h4>🕰️ זמנים – '+P[0]+' (אומגעפער)</h4><div class="res"><div class="rb"><small>הנץ</small><b style="font-size:19px">'+pick('הנץ')+'</b></div><div class="rb"><small>סוף זמן ק״ש גר״א</small><b style="font-size:19px">'+pick('סוף זמן ק״ש – גר')+'</b></div><div class="rb"><small>שקיעה</small><b style="font-size:19px">'+pick('שקיעה')+'</b></div><div class="rb"><small>צאת 72</small><b style="font-size:19px">'+pick('צאת')+'</b></div></div><div class="btns"><a class="b n" href="#t=zmanim">אלע זמנים ←</a></div></div>';
},'today hayom daf yomi tehillim');

/* 8 zmanim */
tool('zmanim','זמנים','וויליאמסבורג, קרית יואל, מאנסי, בארא פארק','🕰️','#3359c4','#1a2f7a',function(el){
  var pi=+load('place')||0, today=L.todayNY();
  el.innerHTML='<div id="zs"></div><div class="card"><label>דאטום</label><input type="date" id="zd"></div><div class="card"><h4 id="zh"></h4><table class="t" id="zt"></table><p class="note">⚠️ אומגעפער – אויסגערעכנט אויפן טעלעפאן לויט דער זון (±1–2 מינוט). פאר הלכה קוקט אין אייער לוח. שעות זמניות: גר״א פון הנץ ביז שקיעה; מגן אברהם פון עלות 72 ביז צאת 72.</p></div>';
  var zd=$('#zd',el);zd.value=today.toISOString().slice(0,10);
  function run(){var p=zd.value.split('-'),dt=L.utcNoon(+p[0],+p[1],+p[2]),P=L.PLACES[pi],z=L.zmanim(dt,P[1],P[2],dt.getUTCDay()===5),now=Date.now(),isToday=zd.value===today.toISOString().slice(0,10),nxt=-1;
    if(isToday)for(var i=0;i<z.length;i++)if(z[i][1]>now){nxt=i;break;}
    $('#zh',el).textContent=P[0]+' · '+L.DOW[dt.getUTCDay()]+' '+L.hdate(dt).text;
    $('#zt',el).innerHTML=z.map(function(r,i){return '<tr'+(i===nxt?' class="now"':'')+'><td>'+r[0]+(i===nxt?' ⬅':'')+'</td><td style="direction:ltr;text-align:left"><b>'+L.fmtTime(r[1])+'</b></td></tr>';}).join('');}
  $('#zs',el).appendChild(seg(L.PLACES.map(function(p,i){return [i,p[0]];}),function(v){pi=v;save('place',v);run();},pi));
  zd.addEventListener('input',run);run();
},'zmanim times sunrise sunset shkia netz');

/* 9 nikud remover */
tool('nikud','נקודות אראפנעמען','נעם אראפ נקודות און טעמים פון א טעקסט','✂️','#5a6b8c','#2f3b57',function(el){
  el.innerHTML='<div class="card"><label>טעקסט מיט נקודות</label><textarea id="ki" placeholder="בְּרֵאשִׁית בָּרָא אֱלֹקִים"></textarea><label style="display:flex;gap:6px;align-items:center;margin-top:8px"><input type="checkbox" id="kk" checked> לאז איבער אַ אָ פּ פֿ (אידישע צייכנס)</label></div><div class="card"><label>אן נקודות</label><div id="ko" class="big" style="font-size:22px;min-height:40px;white-space:pre-wrap"></div><div class="note" id="kn"></div>'+textBtns()+'</div>';
  var ki=$('#ki',el),ko=$('#ko',el);
  function run(){var v=ki.value,r;if($('#kk',el).checked){r=v.normalize('NFD').replace(/([אפבכתש])([\u05B7\u05B8\u05BC\u05BF\u05C1\u05C2])|[\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7]/g,function(m,a,b){if(a&&((a==='א'&&/[\u05B7\u05B8]/.test(b))||(a==='פ'&&/[\u05BC\u05BF]/.test(b))))return a+b;return a||'';});}else r=L.stripNikud(v,true);
    ko.textContent=r;$('#kn',el).textContent=L.countMarks(v)?('אראפגענומען '+(L.countMarks(v)-L.countMarks(r))+' צייכנס'):'';}
  ki.addEventListener('input',run);$('#kk',el).onchange=run;
  wireBtns(el,function(){return ko.textContent;},function(){ki.value='';run();});
},'nikud nekudos vowels remove strip');

/* 10 counter */
tool('count','ווערטער ציילער','אותיות, ווערטער, שורות, צייכנס','📊','#0e7fa8','#0a4d6b',function(el){
  el.innerHTML='<div class="card"><textarea id="ci" placeholder="פאפ אריין א טעקסט…"></textarea></div><div class="res" id="cr"></div><div class="card" style="margin-top:12px"><h4>מערסטע אותיות</h4><div id="cf"></div></div>';
  var ci=$('#ci',el);
  function run(){var v=ci.value,plain=L.stripNikud(v),lets=L.letters(v),words=plain.trim()?plain.trim().split(/\s+/).length:0;
    var st=[['ווערטער',words],['אותיות',lets.length],['צייכנס',Array.from(v.normalize('NFC')).length],['אן רווחים',Array.from(v.replace(/\s/g,'')).length],['שורות',v?v.split('\n').length:0],['זאצן',(plain.match(/[.!?]+/g)||[]).length],['נקודות',L.countMarks(v)],['גימטריא',L.gematria(v).std]];
    $('#cr',el).innerHTML=st.map(function(x){return '<div class="rb"><small>'+x[0]+'</small><b>'+x[1]+'</b></div>';}).join('');
    var f={};lets.forEach(function(c){f[c]=(f[c]||0)+1;});var top=Object.keys(f).sort(function(a,b){return f[b]-f[a];}).slice(0,10);
    $('#cf',el).innerHTML=top.length?top.map(function(c){return '<span class="chip" style="display:inline-block;margin:3px;background:var(--bg);color:var(--ink);border-color:var(--line)"><b style="font-size:18px">'+c+'</b> '+f[c]+'</span>';}).join(''):'<span class="note">—</span>';}
  ci.addEventListener('input',run);run();
},'count counter words letters characters');

/* 11 spelling */
tool('spell','אויסלייג גלייכמאכער','אַ/אָ אראפ, װ ױ ײ ⇄ וו וי יי, און מער','✍️','#a1497a','#62224a',function(el){
  el.innerHTML='<div class="card"><textarea id="si" placeholder="פאפ אריין אידישן טעקסט…"></textarea><div class="btns">'+
  [['hasidic','חסידיש: אלע נקודות אראפ'],['alef','נעם אראפ אַ אָ'],['split','װ ױ ײ ← וו וי יי'],['join','וו וי יי ← װ ױ ײ'],['fix','צייכנס פארריכטן (ﬠ ﬡ ← נארמאל)'],['space','דאפלטע רווחים אראפ'],['quotes','" ← ״ און \' ← ׳']].map(function(b){return '<button class="b n" type="button" data-s="'+b[0]+'">'+b[1]+'</button>';}).join('')+
  '</div></div><div class="card"><label>רעזולטאט</label><div id="so" class="big" style="font-size:22px;min-height:40px;white-space:pre-wrap"></div>'+textBtns()+'</div><p class="note">יעדער קנעפל טוישט דעם טעקסט אויבן; מען קען דריקן עטליכע נאכאנאנד.</p>';
  var si=$('#si',el),so=$('#so',el);
  var F={hasidic:L.hasidic,alef:L.removeAlefMarks,split:L.ligSplit,join:L.ligJoin,fix:function(s){return s.normalize('NFKD').normalize('NFC');},space:function(s){return s.replace(/[ \t]+/g,' ').replace(/ *\n */g,'\n').trim();},quotes:function(s){return s.replace(/([א-ת])"([א-ת])/g,'$1״$2').replace(/([א-ת])\'/g,'$1׳');}};
  $$('[data-s]',el).forEach(function(b){b.onclick=function(){si.value=F[b.dataset.s](si.value);so.textContent=si.value;toast('✓');};});
  si.addEventListener('input',function(){so.textContent=si.value;});
  wireBtns(el,function(){return so.textContent;},function(){si.value='';so.textContent='';});
},'spelling normalize ligature');

/* 12 text tools */
tool('text','טעקסט כלים','פארקערט, ריכטונג פארריכטן, גרויסע אותיות','🛠️','#4a5568','#1f2737',function(el){
  el.innerHTML='<div class="card"><textarea id="xi" placeholder="פאפ אריין א טעקסט…"></textarea><div class="btns">'+
  [['rev','פארקער דעם גאנצן טעקסט'],['revl','פארקער יעדע שורה (פון PDF)'],['revw','פארקער די ווערטער-ארדענונג'],['rtl','לייג צו RTL צייכן'],['strip','נעם אראפ באהאלטענע צייכנס'],['up','ENGLISH גרויס'],['low','english קליין']].map(function(b){return '<button class="b n" type="button" data-x="'+b[0]+'">'+b[1]+'</button>';}).join('')+
  '</div>'+textBtns()+'</div><p class="note">"פארקער יעדע שורה" פארריכט טעקסט וואס קומט ארויס פארקערט פון א PDF אדער פראגראם. "גרויס" ווייזט דעם טעקסט אויפן גאנצן עקראן – גוט צו ווייזן פאר איינעם.</p>';
  var xi=$('#xi',el);xi.value=load('text');
  var rv=function(s){return Array.from(s).reverse().join('');};
  var F={rev:rv,revl:function(s){return s.split('\n').map(rv).join('\n');},revw:function(s){return s.split('\n').map(function(l){return l.split(/(\s+)/).reverse().join('');}).join('\n');},rtl:function(s){return s.split('\n').map(function(l){return '\u200F'+l.replace(/^\u200F/,'');}).join('\n');},strip:function(s){return s.replace(/[\u200B-\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/g,'');},up:function(s){return s.toUpperCase();},low:function(s){return s.toLowerCase();}};
  $$('[data-x]',el).forEach(function(b){b.onclick=function(){xi.value=F[b.dataset.x](xi.value);save('text',xi.value);toast('✓');};});
  xi.addEventListener('input',function(){save('text',xi.value);});
  wireBtns(el,function(){return xi.value;},function(){xi.value='';save('text','');});
},'text reverse rtl ltr big share copy');

/* 13 dictionary */
tool('dict','ווערטערבוך','אידיש ⇄ ענגליש – '+(window.YDICT||[]).length+' ווערטער און אויסדרוקן','📖','#8a5a2b','#4f3214',function(el){
  var D=window.YDICT||[];
  el.innerHTML='<div class="card"><input id="di" type="text" placeholder="זוך אויף אידיש אדער ענגליש… (שבת / thank you)" autocomplete="off"></div><div class="card" id="dl"></div>';
  var di=$('#di',el);
  function run(){var q=di.value.trim().toLowerCase(),qp=L.stripNikud(q),r=D;
    if(q)r=D.filter(function(e){return e[0].indexOf(qp)>=0||e[1].indexOf(q)>=0||e[2].toLowerCase().indexOf(q)>=0;}).sort(function(a,b){var sa=(a[0]===qp||a[1]===q||a[2].toLowerCase().split(/[;,] ?/).indexOf(q)>=0)?0:1,sb=(b[0]===qp||b[1]===q||b[2].toLowerCase().split(/[;,] ?/).indexOf(q)>=0)?0:1;return sa-sb;});
    $('#dl',el).innerHTML=(r.length?r.slice(0,150).map(function(e){return '<div class="dict-item"><span class="y">'+esc(e[0])+'</span><span class="l">'+esc(e[1])+'</span><span class="e">'+esc(e[2])+'</span></div>';}).join(''):'<div class="empty">נישט געפונען</div>')+(r.length>150?'<div class="note">… נאך '+(r.length-150)+'. זוכט גענויער.</div>':'');}
  di.addEventListener('input',run);run();
},'dictionary translate english words phrasebook');

/* 14 letters */
var LETS=[['א','אלף','alef','a / o',1],['ב','בית','beis','b (בֿ = v)',2],['ג','גימל','gimel','g',3],['ד','דלת','daled','d',4],['ה','הא','hei','h',5],['ו','וואוו','vov','u',6],['ז','זין','zayin','z',7],['ח','חית','ches','ch',8],['ט','טית','tes','t',9],['י','יוד','yud','i / y',10],['כ','כף','chof','ch (כּ = k)',20],['ל','למד','lamed','l',30],['מ','מעם','mem','m',40],['נ','נון','nun','n',50],['ס','סמך','samech','s',60],['ע','עין','ayin','e',70],['פ','פא','pei','p / f',80],['צ','צדיק','tzadik','ts',90],['ק','קוף','kuf','k',100],['ר','ריש','reish','r',200],['ש','שין','shin','sh (שׂ = s)',300],['ת','תוו','sof','s (תּ = t)',400],['ך','לאנגע כף','langer chof','ch – סוף ווארט',20],['ם','שלאס מעם','shlos mem','m – סוף ווארט',40],['ן','לאנגע נון','langer nun','n – סוף ווארט',50],['ף','לאנגע פא','langer fei','f – סוף ווארט',80],['ץ','לאנגע צדיק','langer tzadik','ts – סוף ווארט',90]];
var YLETS=[['אַ','פתח אלף','a'],['אָ','קמץ אלף','o'],['וו','צוויי וואוון','v'],['וי','וואוו יוד','oy'],['יי','צוויי יודן','ey'],['ײַ','פתח צוויי יודן','ay'],['פּ','פא מיט דגש','p'],['פֿ','פֿא מיט רפה','f'],['כּ','כף מיט דגש','k'],['תּ','תוו מיט דגש','t'],['שׂ','סין','s'],['בֿ','ווייס','v'],['זש','זין שין','zh'],['טש','טית שין','tsh'],['דזש','דלת זין שין','j']];
tool('letters','אלף-בית','די אותיות: נאמען, קלאנג און גימטריא','אב','#b8862b','#6e4a10',function(el){
  el.innerHTML='<div class="card"><h4>די אותיות</h4><div class="letter">'+LETS.map(function(l){return '<button type="button" class="lt" data-c="'+l[0]+'"><div class="c">'+l[0]+'</div><div class="n">'+l[1]+'</div><div class="s ltr" style="text-align:center">'+l[2]+' · '+l[3]+'</div><span class="v">'+l[4]+'</span></button>';}).join('')+'</div></div><div class="card"><h4>אידישע צוזאמענשטעלונגען</h4><div class="letter">'+YLETS.map(function(l){return '<button type="button" class="lt" data-c="'+l[0]+'"><div class="c">'+l[0]+'</div><div class="n">'+l[1]+'</div><div class="s ltr" style="text-align:center">'+l[2]+'</div></button>';}).join('')+'</div><p class="note">דריקט אויף אן אות צו קאפירן.</p></div>';
  $$('.lt',el).forEach(function(b){b.onclick=function(){copy(b.dataset.c);};});
},'alef beis alphabet letters names');

/* 15 abbreviations */
var RT=[['ב״ה','ברוך השם'],['בס״ד','בסייעתא דשמיא'],['בעזה״י','בעזרת השם יתברך'],['אי״ה','אם ירצה השם'],['בל״נ','בלי נדר'],['הבעל״ט','הבא עלינו לטובה'],['בלע״ה','בלי עין הרע'],['ז״ל','זכרונו לברכה'],['זצ״ל','זכר צדיק לברכה'],['זי״ע','זכותו יגן עלינו'],['זצוק״ל','זכר צדיק וקדוש לברכה'],['ע״ה','עליו השלום'],['נ״ע','נשמתו עדן'],['הי״ד','השם יקום דמו'],['שליט״א','שיחיה לאורך ימים טובים אמן'],['נ״י','נרו יאיר'],['שי׳','שיחיה'],['הי״ו','השם ישמרהו ויחייהו'],['יצ״ו','ישמרה צורה ויגאלה (נאך א שטאט)'],['כ״ק','כבוד קדושת'],['אדמו״ר','אדוננו מורנו ורבנו'],['הרה״ק','הרב הקדוש'],['הרה״צ','הרב הצדיק'],['הרה״ג','הרב הגאון'],['הגה״ק','הגאון הקדוש'],['מו״ה','מורנו הרב'],['ר׳','רבי'],['הר״ר','הרב רבי'],['ה״ה','הלא הוא'],['הקב״ה','הקדוש ברוך הוא'],['ית״ש','יתברך שמו'],['רבש״ע','רבונו של עולם'],['אכי״ר','אמן כן יהי רצון'],['תנ״ך','תורה נביאים כתובים'],['ש״ס','ששה סדרים (די גמרא)'],['שו״ע','שולחן ערוך'],['או״ח','אורח חיים'],['יו״ד','יורה דעה'],['אה״ע','אבן העזר'],['חו״מ','חושן משפט'],['רמב״ם','רבינו משה בן מימון'],['רש״י','רבי שלמה יצחקי'],['רמב״ן','רבינו משה בן נחמן'],['מהרש״א','מורנו הרב שמואל אליעזר (איידלס)'],['רי״ף','רבי יצחק אלפסי'],['ב״י','בית יוסף'],['מ״ב','משנה ברורה'],['שו״ת','שאלות ותשובות'],['ד״ה','דיבור המתחיל'],['ע״י','על ידי'],['ע״פ','על פי'],['ע״ד','על דבר / על דרך'],['וכו׳','וכולי – און אזוי ווייטער'],['וגו׳','וגומר (פון א פסוק)'],['עכ״ל','עד כאן לשונו'],['א״כ','אם כן'],['כנ״ל','כנזכר לעיל'],['דו״ק','דוק ותשכח'],['ודו״ק','ודוק'],['ת״ח','תלמיד חכם'],['שב״ק','שבת קודש'],['עש״ק','ערב שבת קודש'],['מוצש״ק','מוצאי שבת קודש'],['יו״ט','יום טוב'],['ר״ח','ראש חודש'],['חוה״מ','חול המועד'],['ר״ה','ראש השנה'],['יוה״כ','יום הכיפורים'],['שמח״ת','שמחת תורה'],['פ׳','פרשת'],['לפ״ק','לפרט קטן (יאר אן ה׳)'],['פ״ק','פה קהל / פה קהילה'],['ק״ק','קהל קדוש'],['ב״ב','בני ביתו / בבא בתרא'],['ב״מ','בבא מציעא'],['ב״ק','בבא קמא'],['א״י','ארץ ישראל'],['חו״ל','חוץ לארץ'],['ארה״ב','ארצות הברית (אמעריקע)'],['ס״ת','ספר תורה'],['ב״נ','בר נש / בני נח'],['ג״כ','גם כן – אויך'],['אע״פ','אף על פי'],['אעפ״כ','אף על פי כן'],['ז״א','זאת אומרת'],['עיי״ש','עיין שם'],['ע״ש','עיין שם / ערב שבת'],['ח״ו','חס ושלום'],['מז״ט','מזל טוב'],['ת״ל','תודה לא-ל'],['בע״ה','בעזרת השם'],['ס״ט','סימן טוב'],['כת״ר','כבוד תורתו'],['מע״כ','מעלת כבוד'],['הנ״ל','הנזכר לעיל']].filter(function(r){return r[1]&&r[1]!=='—'&&r[1]!=='חלילה ו...';});
tool('rashei','ראשי תיבות','וואס מיינט ב״ה, זי״ע, שליט״א, הי״ו…','ר״ת','#6b4fa0','#3a2566',function(el){
  el.innerHTML='<div class="card"><input id="ri" type="text" placeholder="זוך… (זי״ע, שו״ע)" autocomplete="off"></div><div class="card"><table class="t" id="rl"></table></div>';
  var ri=$('#ri',el);
  function norm(s){return L.stripNikud(s).replace(/["״'׳.]/g,'');}
  function run(){var q=norm(ri.value.trim()),r=RT.filter(function(x){return !q||norm(x[0]).indexOf(q)>=0||x[1].indexOf(ri.value.trim())>=0;});
    $('#rl',el).innerHTML=r.length?r.map(function(x){return '<tr><td style="width:30%"><b style="font-size:19px">'+x[0]+'</b></td><td>'+x[1]+'</td></tr>';}).join(''):'<tr><td class="empty">נישט געפונען</td></tr>';}
  ri.addEventListener('input',run);run();
},'abbreviations rashei teivos acronyms');

/* 16 tehillim */
tool('tehillim','תהלים פונעם טאג','לויט דעם חודש און לויט דער וואך','📜','#2d7d6e','#14493f',function(el){
  var t=L.todayNY(),x=L.hdate(t),mlen=(x.d===29&&L.hdate(new Date(t.getTime()+864e5)).d===1)?29:30,th=L.tehillim(x.d,t.getUTCDay(),mlen);
  var TM=['א–ט','י–יז','יח–כב','כג–כח','כט–לד','לה–לח','לט–מג','מד–מח','מט–נד','נה–נט','ס–סה','סו–סח','סט–עא','עב–עו','עז–עח','עט–פב','פג–פז','פח–פט','צ–צו','צז–קג','קד–קה','קו–קז','קח–קיב','קיג–קיח','קיט (א–צו)','קיט (צז–קעו)','קכ–קלד','קלה–קלט','קמ–קמד','קמה–קנ'];
  el.innerHTML='<div class="card" style="text-align:center"><div class="note">'+x.text+' · '+L.DOW[t.getUTCDay()]+'</div><h4 style="margin-top:8px">היינט לויט דעם חודש</h4><div class="big" style="font-size:24px">'+th.month+'</div><h4 style="margin-top:12px">היינט לויט דער וואך</h4><div class="big" style="font-size:22px">'+th.week+'</div></div><div class="card"><h4>דער חודש-סדר</h4><table class="t">'+TM.map(function(r,i){return '<tr'+(i+1===x.d||(mlen===29&&x.d===29&&i===29)?' class="now"':'')+'><td><b>'+L.numToHeb(i+1)+'</b></td><td>'+r+'</td></tr>';}).join('')+'</table></div><div class="card"><h4>דער וואך-סדר</h4><table class="t">'+[['זונטאג','א–כט'],['מאנטאג','כט–נ'],['דינסטאג','נא–עב'],['מיטוואך','עג–פט'],['דאנערשטאג','צ–קו'],['פרייטאג','קז–קיט'],['שבת קודש','קכ–קנ']].map(function(r,i){return '<tr'+(i===t.getUTCDay()?' class="now"':'')+'><td><b>'+r[0]+'</b></td><td>'+r[1]+'</td></tr>';}).join('')+'</table></div>';
},'tehillim psalms daily');

var ORDER=['today','kbd','translit','gematria','date','zmanim','dict','num','nikud','spell','count','text','layout','letters','rashei','tehillim'];T.sort(function(x,y){return ORDER.indexOf(x.id)-ORDER.indexOf(y.id);});
window.YT_TOOLS=T;

/* ================= HOME ================= */
var LINKS=window.YLINKS||[];
var nLinks=LINKS.reduce(function(a,c){return a+c.items.length;},0);
var cat='all';
function hl(s,q){s=esc(s);if(!q)return s;var i=s.toLowerCase().indexOf(q.toLowerCase());return i<0?s:s.slice(0,i)+'<mark>'+s.slice(i,i+q.length)+'</mark>'+s.slice(i+q.length);}
function dom(u){try{return new URL(u).hostname.replace(/^www\./,'');}catch(e){return '';}}
function renderHome(){
  var q=$('#q').value.trim(),ql=q.toLowerCase(),qp=L.stripNikud(ql),H='';
  if(cat==='all'||cat==='tools'){
    var ts=T.filter(function(t){return !q||(t.t+' '+t.d+' '+t.kw).toLowerCase().indexOf(qp)>=0;});
    if(ts.length)H+='<div class="sec"><h2>🧰 טולס אין דער אפ</h2><span class="cnt">'+ts.length+'</span></div><div class="grid">'+ts.map(function(t){return '<a class="tile" href="#t='+t.id+'"><span class="ico" style="--c1:'+t.c1+';--c2:'+t.c2+(t.i.length>2||/[א-ת]/.test(t.i)?';font-size:'+(t.i.length>2?'16px':'20px'):'')+'">'+t.i+'</span><h3>'+hl(t.t,q)+'</h3><p>'+hl(t.d,q)+'</p></a>';}).join('')+'</div>';
  }
  LINKS.forEach(function(c){if(cat!=='all'&&cat!==c.id)return;
    var it=c.items.filter(function(x){return !q||(x[1]+' '+x[2]+' '+x[0]).toLowerCase().indexOf(qp)>=0;});
    if(!it.length)return;
    H+='<div class="sec"><h2>'+c.e+' '+c.t+'</h2><span class="cnt">'+it.length+'</span></div><div class="lgrid">'+it.map(function(x){return '<a class="link" href="'+esc(x[0])+'"><span class="em">'+(x[3]||c.e)+'</span><span class="tx"><b>'+hl(x[1],q)+'</b><span>'+hl(x[2],q)+'</span><i>'+dom(x[0])+'</i></span></a>';}).join('')+'</div>';
  });
  $('#list').innerHTML=H||'<div class="empty">גארנישט געפונען. פרובירט אן אנדער ווארט.</div>';
}
function chips(){var C=[['all','אלעס'],['tools','🧰 טולס']].concat(LINKS.map(function(c){return [c.id,c.e+' '+c.t];}));
  $('#chips').innerHTML=C.map(function(c){return '<button type="button" class="chip'+(c[0]===cat?' on':'')+'" data-c="'+c[0]+'">'+c[1]+'</button>';}).join('');
  $$('.chip').forEach(function(b){b.onclick=function(){cat=b.dataset.c;chips();renderHome();};});}

/* ================= VIEW ================= */
var opened=false;
function route(){
  var m=location.hash.match(/t=(\w+)/),v=$('#view');
  if(m){var t=T.filter(function(x){return x.id===m[1];})[0];if(!t)return;
    $('#vt').textContent=t.t;var b=$('#vb');b.innerHTML='';b.scrollTop=0;t.r(b);v.classList.add('open');document.body.style.overflow='hidden';document.title=t.t+' · אידישע טולס';}
  else{v.classList.remove('open');document.body.style.overflow='';document.title='אידישע טולס';$('#vb').innerHTML='';}
}
document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[href^="#t="]');if(a){opened=true;}});
$('#back').onclick=function(){if(opened&&history.length>1){opened=false;history.back();}else{location.hash='';}};
$('#bigtext').onclick=function(){this.classList.remove('open');};
window.addEventListener('hashchange',route);

/* header + init */
(function(){var t=L.todayNY(),x=L.hdate(t),d=L.dafYomi(t);
  $('#hd').innerHTML='<span class="pill">📅 <b>'+L.DOW[t.getUTCDay()]+', '+x.text+'</b></span><span class="pill">📚 דף יומי: <b>'+d.text+'</b></span>';})();
$('#cnt').textContent=T.length;$('#lcnt').textContent=nLinks;
$('#q').placeholder='זוך אין '+T.length+' טולס און '+nLinks+' לינקס…';
$('#q').addEventListener('input',renderHome);
chips();renderHome();route();
$('#tg').onclick=function(){var d=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=d;try{localStorage.setItem('ytheme',d);}catch(e){}};
var dp;window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();dp=e;$('#ib').hidden=false;});
$('#ib').onclick=function(){if(dp){dp.prompt();dp=null;$('#ib').hidden=true;}};
if('serviceWorker' in navigator)window.addEventListener('load',function(){navigator.serviceWorker.register('./sw.js').catch(function(){});});
})();
