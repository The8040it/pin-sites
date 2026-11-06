/* TG Pics — browse the pictures of one Telegram chat, shown from memory only. */
(function(){
'use strict';
// Public credentials of Telegram's open-source web client (Telegram Web K, github.com/morethanwords/tweb, .env).
var API_ID = 1025907, API_HASH = '452b0359b988148995f22ff0f4229750';
var TESTDC = /[?&]testdc=1/.test(location.search);   // ?testdc=1 = Telegram's official TEST servers, separate login
var SKEY = TESTDC ? 'tgpics_testdc_session' : 'tgpics_session_v1';
var PAGE = 60;

function $(s){ return document.querySelector(s); }
function el(tag, cls, txt){ var e=document.createElement(tag); if(cls) e.className=cls; if(txt!=null) e.textContent=txt; return e; }
function show(id){ document.querySelectorAll('.screen').forEach(function(s){ s.classList.toggle('active', s.id===id); }); window.scrollTo(0,0); }
function toast(msg, ms){ var t=$('#toast'); t.textContent=msg; t.classList.remove('hidden'); clearTimeout(toast._t); toast._t=setTimeout(function(){ t.classList.add('hidden'); }, ms||3200); }
/* ---------- debug log (tap the 🔒 line 5 times) ---------- */
var DBG = [];
function dbg(m){
  var d = new Date(); var t = ('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2)+':'+('0'+d.getSeconds()).slice(-2)+'.'+('00'+d.getMilliseconds()).slice(-3);
  DBG.push(t+' '+String(m).replace(/%c|color : #\w+/g,'').slice(0,300)); if (DBG.length > 300) DBG.splice(0, DBG.length-300);
  var p = document.getElementById('dbg-pre'); if (p && !document.getElementById('dbg').classList.contains('hidden')) p.textContent = DBG.slice(-30).join('\n');
}
window.addEventListener('error', function(e){ dbg('JS error: '+(e.message||e.error)); });
window.addEventListener('unhandledrejection', function(e){ var r=e.reason; dbg('Unhandled: '+((r && (r.errorMessage||r.message))||r)); });
window.addEventListener('online', function(){ dbg('browser: online'); });
window.addEventListener('offline', function(){ dbg('browser: offline'); });
document.addEventListener('visibilitychange', function(){ dbg('page '+document.visibilityState); });
function withTimeout(p, ms, label){
  var t; return Promise.race([ Promise.resolve(p).finally(function(){ clearTimeout(t); }),
    new Promise(function(_, rej){ t = setTimeout(function(){ var e = new Error('TIMEOUT: '+label); e.timeout = true; e.step = label; rej(e); }, ms); }) ]);
}
function normPhone(raw){
  var s = String(raw||'').trim(), plus = /^\s*\+/.test(s), d = s.replace(/\D/g,'');
  if (!plus && d.indexOf('00')===0) d = d.slice(2);
  else if (!plus && d.length===10 && !TESTDC) d = '1'+d;           // 10 digits, no country code: assume US/Canada
  return d ? '+'+d : '';
}
var STEP_NAMES = { connect:'connecting to Telegram', sendCode:'sending the code', signIn:'checking the code', checkPassword:'checking the password', dialogs:'loading your chats', resolve:'opening that link', photos:'loading pictures' };

function errText(e){
  var m = (e && (e.errorMessage || e.message)) || String(e);
  var map = {
    PHONE_NUMBER_INVALID:'That phone number is not right. Use the country code, like +1 718 555 1234.',
    PHONE_CODE_INVALID:'That code is wrong. Check the code in Telegram and try again.',
    PHONE_CODE_EMPTY:'Type the code from Telegram.',
    PHONE_CODE_EXPIRED:'That code expired. Tap “Change number” and send a new one.',
    PASSWORD_HASH_INVALID:'Wrong password. Try again.',
    PHONE_NUMBER_BANNED:'Telegram has blocked this number.',
    PHONE_NUMBER_UNOCCUPIED:'There is no Telegram account on this number.',
    USERNAME_INVALID:'That link or name is not right.',
    USERNAME_NOT_OCCUPIED:'No channel with that name.',
    INVITE_HASH_EXPIRED:'That invite link has expired.',
    INVITE_HASH_INVALID:'That invite link is not valid.',
    CHANNEL_PRIVATE:'This channel is private. You need to join it in Telegram first.',
    CHAT_ADMIN_REQUIRED:'Telegram does not allow viewing this chat here.',
    AUTH_KEY_UNREGISTERED:'You were logged out. Please log in again.',
    API_ID_PUBLISHED_FLOOD:'Telegram is limiting logins from this app right now. Try again in an hour.',
    API_ID_INVALID:'Telegram refused this app (API_ID_INVALID).',
    PHONE_NUMBER_FLOOD:'Telegram blocked new codes for this number for now because of too many tries. Try again tomorrow.',
    PHONE_PASSWORD_FLOOD:'Too many password tries. Telegram says to wait before trying again.',
    PHONE_NUMBER_APP_SIGNUP_FORBIDDEN:'Telegram does not allow signing up a new account here. Make the account in the Telegram app first.',
    SEND_CODE_UNAVAILABLE:'Telegram cannot send another code right now. Wait a few minutes and try again.',
    AUTH_RESTART:'Telegram asked to start over. Tap Try again.',
    SESSION_REVOKED:'You were logged out. Please log in again.',
    DC_UNREACHABLE:'Could not reach the Telegram server for your number. Your internet or a filter may be blocking it.'
  };
  if (e && e.timeout) return 'Telegram did not answer in time (while '+(STEP_NAMES[e.step]||e.step)+'). Your internet or a filter may be blocking Telegram. Tap Try again.';
  if (e && e.seconds && /FLOOD/.test(m)) { var mins=Math.ceil(e.seconds/60); return 'Telegram says to wait '+(mins>1? mins+' minutes':'a minute')+' before trying again.'; }
  for (var k in map) if (m.indexOf(k)>=0) return map[k];
  if (/disconnect|timeout|Not connected|WebSocket/i.test(m)) return 'Lost the connection to Telegram. Check your internet and try again.';
  return 'Telegram said: ' + m.replace(/^\d+:\s*/,'').slice(0,160);
}

/* ---------- blob URLs (memory only) ---------- */
var pools = { chats:new Set(), gallery:new Set(), viewer:new Set() };
function blobUrl(bytes, type, pool){
  if(!bytes || !bytes.length) return null;
  var u = URL.createObjectURL(new Blob([bytes], {type:type||'image/jpeg'}));
  pools[pool].add(u); return u;
}
function revokeUrl(u, pool){ if(u){ URL.revokeObjectURL(u); pools[pool].delete(u); } }
function revokePool(pool){ pools[pool].forEach(function(u){ URL.revokeObjectURL(u); }); pools[pool].clear(); }
window.addEventListener('pagehide', function(){ revokePool('chats'); revokePool('gallery'); revokePool('viewer'); });

/* ---------- small task queue ---------- */
function Queue(n){ this.n=n; this.run=0; this.q=[]; }
Queue.prototype.push=function(fn, front){ var self=this; return new Promise(function(res,rej){ var job={fn:fn,res:res,rej:rej}; front? self.q.unshift(job): self.q.push(job); self.next(); }); };
Queue.prototype.next=function(){ var self=this; while(self.run<self.n && self.q.length){ var j=self.q.shift(); self.run++;
  Promise.resolve().then(j.fn).then(j.res,j.rej).then(function(){ self.run--; self.next(); }); } };
Queue.prototype.clear=function(){ this.q.forEach(function(j){ j.rej(new Error('cancelled')); }); this.q=[]; };

/* ---------- Telegram layer ---------- */
function realApi(){
  var TG = window.TG, client = null, Api = TG.Api;
  function peerTitle(ent){ try { return TG.getDisplayName(ent) || ''; } catch(e){ return ''; } }
  function strippedUrl(bytes, pool){ try { return blobUrl(TG.strippedPhotoToJpg(bytes), 'image/jpeg', pool); } catch(e){ return null; } }
  function pickThumb(sizes){
    sizes = (sizes||[]).filter(function(s){ return !(s instanceof Api.PhotoStrippedSize) && !(s instanceof Api.PhotoPathSize) && s.type; });
    var pref = ['m','x','s','y','w'];
    for (var i=0;i<pref.length;i++){ for (var j=0;j<sizes.length;j++) if (sizes[j].type===pref[i]) return sizes[j]; }
    return sizes[0] || null;
  }
  var TEST = TESTDC;
  var HOSTS = { 1:['pluto','zws1','kws1'], 2:['venus','zws2','kws2'], 3:['aurora','zws3','kws3'], 4:['vesta','zws4','kws4'], 5:['flora','zws5','kws5'] };
  var hostIdx = {};
  function hostFor(dc){ var h = HOSTS[dc] || HOSTS[2]; return h[(hostIdx[dc]||0) % h.length] + '.web.telegram.org'; }
  function startDc(){ var d = 0; try { d = +localStorage.getItem(SKEY+'_dc') || 0; } catch(e){} return TEST ? (d && d<=3 ? d : 2) : (d || 1); }
  function makeClient(sess){
    var c = new TG.TelegramClient(new TG.StringSession(sess||''), API_ID, API_HASH, {
      connectionRetries: 2, retryDelay: 1000, useWSS: true, autoReconnect: true, floodSleepThreshold: 0, testServers: TEST,
      deviceModel: 'TG Pics (Web)', systemVersion: (navigator.userAgentData && navigator.userAgentData.platform) || 'Web', appVersion: '1.0', langCode: 'en', systemLangCode: 'en'
    });
    c.setLogLevel('info');
    try { c._log.log = function(level, msg){ dbg('tg/'+level+': '+msg); }; } catch(e){}
    // Our own data-center switch: Telegram answers PHONE_MIGRATE_X when the number lives on another DC.
    // GramJS's built-in switch has no timeout; this one tries each web host for that DC with a deadline.
    c._switchDC = async function(newDc){
      dbg('Telegram: this number lives on DC'+newDc+', moving there');
      try { localStorage.setItem(SKEY+'_dc', String(newDc)); } catch(e){}
      var self = this, last = null, n = (HOSTS[newDc]||[1]).length;
      for (var i = 0; i < n; i++) {
        var host = hostFor(newDc);
        self.session.setDC(newDc, host, 443);
        try { if (self._sender && self._sender.authKey) await self._sender.authKey.setKey(undefined); } catch(e){}
        self.session.setAuthKey(undefined);
        self._isSwitchingDc = true;
        try { await withTimeout(self._disconnect(), 5000, 'connect'); } catch(e){ dbg('disconnect: '+e.message); }
        self._sender = undefined;
        dbg('connecting to DC'+newDc+' via '+host);
        try { var r = await withTimeout(self.connect(), 15000, 'connect'); dbg('connected to DC'+newDc+' via '+host); return r; }
        catch(e){ last = e; dbg('DC'+newDc+' via '+host+' failed: '+(e.errorMessage||e.message)); hostIdx[newDc] = (hostIdx[newDc]||0) + 1; }
      }
      var err = new Error('DC_UNREACHABLE'); err.cause = last; throw err;
    };
    return c;
  }
  async function connectFresh(sess, dc){
    if (client) { var old = client; client = null; try { await withTimeout(old.destroy ? old.destroy() : old.disconnect(), 5000, 'connect'); } catch(e){ dbg('old client close: '+e.message); } }
    var last = null;
    for (var i = 0; i < 3; i++) {
      var c = makeClient(sess);
      var d = dc || (sess ? c.session.dcId : startDc()) || 2;
      c.session.setDC(d, hostFor(d), 443);   // keeps the key when the DC is the same; only the web host changes
      dbg('connecting to DC'+d+' via '+hostFor(d)+(TEST?' (TEST servers)':'')+(sess?' (saved login)':''));
      try { await withTimeout(c.connect(), 15000, 'connect'); client = c; dbg('connected to DC'+d); return; }
      catch(e){ last = e; dbg('connect DC'+d+' via '+hostFor(d)+' failed: '+(e.errorMessage||e.message)); hostIdx[d] = (hostIdx[d]||0) + 1;
        try { await withTimeout(c.destroy ? c.destroy() : c.disconnect(), 3000, 'connect'); } catch(x){} }
    }
    throw last || new Error('TIMEOUT');
  }
  function stripped(sizes){ for (var i=0;i<(sizes||[]).length;i++) if (sizes[i] instanceof Api.PhotoStrippedSize) return sizes[i].bytes; return null; }
  return {
    init: async function(){
      var saved = '';
      try { saved = localStorage.getItem(SKEY) || ''; } catch(e){}
      await connectFresh(saved, null);
      var authed = false;
      if (saved) { try { authed = await withTimeout(client.checkAuthorization(), 20000, 'connect'); } catch(e){ dbg('checkAuthorization: '+(e.errorMessage||e.message)); if (e.timeout) throw e; authed = false; } }
      dbg('ready, logged in: '+authed);
      return { authed: authed };
    },
    // After a timeout the connection may be half-dead: rebuild it on the same DC (keeping the same key, so a sent code stays valid), trying the next host.
    reset: async function(){
      var keep = ''; try { if (client && client.session && client.session.getAuthKey && client.session.getAuthKey()) keep = client.session.save() || ''; } catch(e){}
      if (!keep) { try { keep = localStorage.getItem(SKEY) || ''; } catch(e){} }
      var dc = client && client.session ? client.session.dcId : null;
      if (dc) hostIdx[dc] = (hostIdx[dc]||0) + 1;
      await connectFresh(keep, dc);
    },
    close: async function(){ if (client) { var c = client; client = null; try { await withTimeout(c.destroy ? c.destroy() : c.disconnect(), 5000, 'connect'); } catch(e){} } },
    info: function(){ return client && client.session ? 'DC'+client.session.dcId+' '+client.session.serverAddress : 'no connection'; },
    save: function(){ try { localStorage.setItem(SKEY, client.session.save()); } catch(e){} },
    sendCode: async function(phone){
      dbg('sendCode '+phone.replace(/\d(?=\d{4})/g,'•')+' on DC'+client.session.dcId);
      var r = await withTimeout(client.sendCode({apiId:API_ID, apiHash:API_HASH}, phone), 55000, 'sendCode');
      dbg('code sent'+(r.isCodeViaApp?' (to the Telegram app)':' (by SMS)')+', now on DC'+client.session.dcId);
      return { hash: r.phoneCodeHash, viaApp: r.isCodeViaApp };
    },
    signIn: async function(phone, hash, code){
      try {
        dbg('signIn on DC'+client.session.dcId);
        var r = await withTimeout(client.invoke(new Api.auth.SignIn({ phoneNumber: phone, phoneCodeHash: hash, phoneCode: code })), 25000, 'signIn');
        if (r instanceof Api.auth.AuthorizationSignUpRequired) throw new Error('PHONE_NUMBER_UNOCCUPIED');
        this.save(); return 'ok';
      } catch(e){
        if (e && e.errorMessage === 'SESSION_PASSWORD_NEEDED') { dbg('2-step password needed'); return 'password'; }
        dbg('signIn error: '+(e.errorMessage||e.message));
        throw e;
      }
    },
    passwordHint: async function(){ try { var p = await withTimeout(client.invoke(new Api.account.GetPassword()), 15000, 'checkPassword'); return p.hint || ''; } catch(e){ return ''; } },
    checkPassword: async function(pw){
      dbg('checkPassword');
      var p = await withTimeout(client.invoke(new Api.account.GetPassword()), 25000, 'checkPassword');
      var srp = await withTimeout(TG.computeCheck(p, pw), 25000, 'checkPassword');
      await withTimeout(client.invoke(new Api.auth.CheckPassword({ password: srp })), 25000, 'checkPassword');
      this.save(); return 'ok';
    },
    me: async function(){ try { var m = await withTimeout(client.getMe(), 20000, 'dialogs'); return [m.firstName, m.lastName].filter(Boolean).join(' ') + (m.username? ' (@'+m.username+')':''); } catch(e){ return ''; } },
    dialogs: async function(onBatch, isStale){
      var batch = [], it = client.iterDialogs({})[Symbol.asyncIterator](), count = 0;
      dbg('getDialogs');
      while (true) {
        var step = await withTimeout(it.next(), 25000, 'dialogs');
        if (step.done) break; var d = step.value; count++;
        if (isStale()) return;
        var ent = d.entity; if (!ent) continue;
        var kind = d.isChannel && !d.isGroup ? 'Channel' : d.isGroup ? 'Group' : (ent.bot ? 'Bot' : 'Chat');
        if (ent.self) kind = 'Saved Messages';
        var ph = ent.photo && ent.photo.strippedThumb;
        batch.push({ id: String(d.id), title: ent.self ? 'Saved Messages' : (d.title || peerTitle(ent) || 'Chat'), kind: kind, entity: ent,
          strippedUrl: ph ? strippedUrl(ph, 'chats') : null, hasPhoto: !!(ent.photo && ent.photo.className!=='ChatPhotoEmpty' && ent.photo.className!=='UserProfilePhotoEmpty') });
        if (batch.length >= 25) { onBatch(batch); batch = []; }
      }
      if (batch.length) onBatch(batch);
      dbg('dialogs loaded: '+count);
    },
    avatar: async function(chat){ var b = await client.downloadProfilePhoto(chat.entity, { isBig: false }); return b && b.length ? b : null; },
    resolve: async function(text){
      var s = text.trim(); var m;
      if ((m = s.match(/(?:t(?:elegram)?\.me|telegram\.dog)\/(?:joinchat\/|\+)([\w-]+)/i))) {
        var inv = await withTimeout(client.invoke(new Api.messages.CheckChatInvite({ hash: m[1] })), 25000, 'resolve');
        if (inv.chat) return { id: String(inv.chat.id), title: inv.chat.title, kind: 'Channel', entity: inv.chat };
        throw new Error('You are not a member of this private chat. Join it in Telegram first, then open it here.');
      }
      if ((m = s.match(/(?:t(?:elegram)?\.me|telegram\.dog)\/(?:s\/)?([A-Za-z0-9_]{4,})/i))) s = m[1];
      s = s.replace(/^@/, '');
      if (!/^[A-Za-z0-9_]{4,}$/.test(s)) throw new Error('USERNAME_INVALID');
      var ent = await withTimeout(client.getEntity(s), 25000, 'resolve');
      return { id: String(ent.id), title: peerTitle(ent) || s, kind: ent.className==='Channel' ? 'Channel' : 'Chat', entity: ent };
    },
    photos: async function(chat, kind, offsetId){
      var filter = kind==='files' ? new Api.InputMessagesFilterDocument() : new Api.InputMessagesFilterPhotos();
      var msgs = await withTimeout(client.getMessages(chat.entity, { limit: PAGE, offsetId: offsetId||0, filter: filter }), 30000, 'photos');
      var items = [];
      msgs.forEach(function(msg){
        if (kind==='files') {
          var doc = msg.media && msg.media.document;
          if (!doc || !/^image\//.test(doc.mimeType||'') || doc.mimeType==='image/webp' && (doc.attributes||[]).some(function(a){ return a.className==='DocumentAttributeSticker'; })) return;
          items.push({ id: msg.id, date: msg.date, text: msg.message||'', msg: msg, mime: doc.mimeType, size: Number(doc.size||0),
            thumb: pickThumb(doc.thumbs), stripped: stripped(doc.thumbs) });
        } else {
          var p = msg.media && msg.media.photo; if (!p || !p.sizes) return;
          items.push({ id: msg.id, date: msg.date, text: msg.message||'', msg: msg, mime: 'image/jpeg', thumb: pickThumb(p.sizes), stripped: stripped(p.sizes) });
        }
      });
      var last = msgs.length ? msgs[msgs.length-1].id : 0;
      return { items: items, total: msgs.total, nextOffset: msgs.length < PAGE ? 0 : last };
    },
    strippedUrl: function(item){ return item.stripped ? strippedUrl(item.stripped, 'gallery') : null; },
    thumb: async function(item){
      if (item.thumb) return client.downloadMedia(item.msg, { thumb: item.thumb });
      if (item.size && item.size < 2500000) return client.downloadMedia(item.msg, {});
      return null;
    },
    full: async function(item){ return client.downloadMedia(item.msg, {}); },
    logout: async function(){ try { await withTimeout(client.invoke(new Api.auth.LogOut()), 10000, 'connect'); } catch(e){} try { await withTimeout(client.disconnect(), 5000, 'connect'); } catch(e){} try { localStorage.removeItem(SKEY+'_dc'); } catch(e){} }
  };
}
var api = window.__TGPICS_MOCK || null;

/* ---------- boot ---------- */
async function boot(){
  show('s-loading'); $('#retry-btn').classList.add('hidden'); $('#loading-msg').textContent='Connecting to Telegram…';
  try {
    if (!api) { if (!window.TG) throw new Error('The app did not load fully. Check your internet.'); api = realApi(); }
    dbg('TG Pics v2 start'+(TESTDC?' (TEST servers)':'')+' · '+navigator.userAgent.slice(0,120));
    var st = await withTimeout(api.init(), 60000, 'connect');
    if (st.authed) openChats(); else showLogin('phone');
  } catch(e){
    dbg('start failed: '+(e.errorMessage||e.message));
    $('#loading-msg').textContent = errText(e); $('#retry-btn').classList.remove('hidden');
  }
}
$('#retry-btn').addEventListener('click', function(){ var old = api; api = window.__TGPICS_MOCK || null; if (old && old.close && old !== api) old.close(); boot(); });

/* ---------- login ---------- */
var login = { phone:'', hash:'' };
function showLogin(step){
  show('s-login');
  ['phone','code','pass'].forEach(function(s){ $('#f-'+s).classList.toggle('hidden', s!==step); });
  $('#login-err').classList.add('hidden'); $('#login-retry').classList.add('hidden');
  setTimeout(function(){ var i=$('#'+step); if(i) i.focus(); }, 60);
}
var loginRetry = null;
function loginErr(e, retry){
  var p=$('#login-err'); p.textContent = typeof e==='string'? e : errText(e); p.classList.remove('hidden');
  if (typeof e !== 'string') dbg('error '+((e && (e.errorMessage||e.message))||e)+' → shown: '+p.textContent);
  loginRetry = retry ? { fn: retry, reset: !!(e && (e.timeout || /DC_UNREACHABLE|disconnect|Not connected|WebSocket|closed|CONNECTION/i.test(e.errorMessage||e.message||''))) } : null;
  $('#login-retry').classList.toggle('hidden', !retry);
}
$('#login-retry').addEventListener('click', async function(){
  var r = loginRetry; if (!r) return; var b = this; $('#login-err').classList.add('hidden'); b.classList.add('hidden');
  if (r.reset && api.reset) {
    var formBtn = document.querySelector('.step:not(.hidden) .btn.gold'); if (formBtn) busy(formBtn, true);
    try { dbg('Try again: reconnecting'); await withTimeout(api.reset(), 60000, 'connect'); }
    catch(e){ if (formBtn) busy(formBtn, false); return loginErr(e, r.fn); }
    if (formBtn) busy(formBtn, false);
  }
  r.fn();
});
function busy(btn, on){ btn.disabled = on; if(on){ btn.dataset.t = btn.innerHTML; btn.textContent = 'Please wait…'; } else if (btn.dataset.t) btn.innerHTML = btn.dataset.t; }

$('#f-phone').addEventListener('submit', async function(ev){
  ev.preventDefault();
  var raw = $('#phone').value.trim(); var phone = normPhone(raw);
  if (phone.replace(/\D/g,'').length < 8) return loginErr('Type your full phone number with the country code, like +1 718 555 1234.');
  var b=$('#phone-btn'); busy(b,true); $('#login-err').classList.add('hidden'); $('#login-retry').classList.add('hidden');
  try {
    var r = await api.sendCode(phone); login.phone = phone; login.hash = r.hash;
    $('#code-hint').innerHTML = r.viaApp ? 'Telegram sent the code to your <b>Telegram app</b>. Open Telegram, look at the message from “Telegram”, then come back and type it here.' : 'Telegram sent the code by <b>SMS</b> to '+phone.replace(/[<>&]/g,'')+'.';
    $('#code').value=''; showLogin('code');
  } catch(e){ loginErr(e, function(){ $('#phone-btn').click(); }); }
  busy(b,false);
});
$('#code-back').addEventListener('click', function(){ showLogin('phone'); });
$('#f-code').addEventListener('submit', async function(ev){
  ev.preventDefault();
  var code = $('#code').value.replace(/\D/g,''); if (code.length < 4) return loginErr('Type the code from Telegram.');
  var b=$('#code-btn'); busy(b,true); $('#login-err').classList.add('hidden'); $('#login-retry').classList.add('hidden');
  try {
    var r = await api.signIn(login.phone, login.hash, code);
    if (r==='password') { var h = api.passwordHint ? await api.passwordHint() : ''; $('#pass-hint').textContent = 'Your account has two-step verification. Type the password you set in Telegram.' + (h? ' Hint: '+h : ''); $('#pass').value=''; showLogin('pass'); }
    else openChats();
  } catch(e){ loginErr(e, /CODE_INVALID|CODE_EMPTY/.test(e && e.errorMessage) ? function(){ $('#code').value=''; $('#code').focus(); } : function(){ $('#code-btn').click(); }); }
  busy(b,false);
});
$('#f-pass').addEventListener('submit', async function(ev){
  ev.preventDefault();
  var pw = $('#pass').value; if (!pw) return loginErr('Type your Telegram password.');
  var b=$('#pass-btn'); busy(b,true); $('#login-err').classList.add('hidden'); $('#login-retry').classList.add('hidden');
  try { await api.checkPassword(pw); $('#pass').value=''; openChats(); } catch(e){ loginErr(e, /PASSWORD_HASH_INVALID/.test(e && e.errorMessage) ? function(){ $('#pass').value=''; $('#pass').focus(); } : function(){ $('#pass-btn').click(); }); }
  busy(b,false);
});

/* ---------- chats ---------- */
var chats = [], chatsGen = 0, chatsLoaded = false, avQ = new Queue(3), avObs = null;
function initials(t){ var w=(t||'?').trim().split(/\s+/); return ((w[0]||'?').charAt(0) + (w[1]? w[1].charAt(0):'')).toUpperCase(); }
function chatRow(c){
  var li = el('li'); var b = el('button','chat'); b.type='button';
  var av = el('div','av'); av.setAttribute('aria-hidden','true');
  if (c.strippedUrl) av.style.backgroundImage = 'url("'+c.strippedUrl+'")'; else av.textContent = initials(c.title);
  var main = el('div','chat-main'); var t = el('div','chat-title'); t.dir='auto'; t.textContent = c.title; var s = el('div','chat-sub', c.kind);
  main.appendChild(t); main.appendChild(s);
  b.appendChild(av); b.appendChild(main); b.appendChild(el('span','chev','›'));
  b.addEventListener('click', function(){ openGallery(c); });
  li.appendChild(b); c.li = li; c.av = av;
  if (c.hasPhoto && avObs) { av._chat = c; avObs.observe(av); }
  return li;
}
function filterChats(){
  var q = $('#chat-q').value.trim().toLowerCase(); var n=0;
  chats.forEach(function(c){ var hit = !q || c.title.toLowerCase().indexOf(q) >= 0; c.li.classList.toggle('hidden', !hit); if (hit) n++; });
  var st = $('#chats-status');
  if (!chatsLoaded) { st.textContent = 'Loading your chats… ('+chats.length+')'; }
  else st.textContent = q ? (n ? n+' found' : 'No chat with that name') : chats.length + ' chats';
}
async function openChats(){
  show('s-chats');
  if (api.me) api.me().then(function(n){ $('#me-name').textContent = n ? 'Logged in as ' + n : ''; });
  if (chats.length && chatsLoaded) { filterChats(); return; }
  var gen = ++chatsGen; chats = []; chatsLoaded=false; $('#chat-list').innerHTML=''; revokePool('chats'); $('#chats-err').classList.add('hidden'); $('#chats-retry').classList.add('hidden');
  if (!avObs && 'IntersectionObserver' in window) avObs = new IntersectionObserver(function(ents){
    ents.forEach(function(en){ if (!en.isIntersecting) return; var av=en.target, c=av._chat; avObs.unobserve(av); if(!c) return;
      avQ.push(function(){ if (gen!==chatsGen) return null; return api.avatar(c); }).then(function(bytes){
        if (gen!==chatsGen || !bytes) return; var u = blobUrl(bytes,'image/jpeg','chats'); if (u){ av.textContent=''; av.style.backgroundImage='url("'+u+'")'; }
      }).catch(function(){});
    });
  }, { rootMargin: '200px' });
  filterChats();
  try {
    await api.dialogs(function(batch){
      if (gen!==chatsGen) return; var frag=document.createDocumentFragment();
      batch.forEach(function(c){ chats.push(c); frag.appendChild(chatRow(c)); });
      $('#chat-list').appendChild(frag); filterChats();
    }, function(){ return gen!==chatsGen; });
  } catch(e){
    if (gen===chatsGen) { $('#chats-err').textContent = errText(e); $('#chats-err').classList.remove('hidden'); $('#chats-retry').classList.remove('hidden'); dbg('chats error: '+(e.errorMessage||e.message)); if (/AUTH_KEY_UNREGISTERED|SESSION_REVOKED|USER_DEACTIVATED/.test(String(e && e.errorMessage))) return doLogout(true); }
  }
  if (gen===chatsGen) { chatsLoaded = true; filterChats(); }
}
$('#chat-q').addEventListener('input', filterChats);
$('#chats-retry').addEventListener('click', async function(){
  var b = this; b.disabled = true; $('#chats-err').classList.add('hidden');
  try { if (api.reset) await withTimeout(api.reset(), 60000, 'connect'); b.disabled = false; b.classList.add('hidden'); chatsLoaded = false; chats = []; openChats(); }
  catch(e){ b.disabled = false; $('#chats-err').textContent = errText(e); $('#chats-err').classList.remove('hidden'); }
});
$('#f-link').addEventListener('submit', async function(ev){
  ev.preventDefault(); var v=$('#link').value.trim(); if(!v) return;
  var btn = this.querySelector('button'); btn.disabled = true; $('#chats-err').classList.add('hidden');
  try { var c = await api.resolve(v); $('#link').value=''; openGallery(c); }
  catch(e){ $('#chats-err').textContent = e && !e.errorMessage && /member|private/i.test(e.message) ? e.message : errText(e); $('#chats-err').classList.remove('hidden'); }
  btn.disabled = false;
});
(function(){
  var taps = [];
  function tap(){ var now = Date.now(); taps = taps.filter(function(t){ return now - t < 3000; }); taps.push(now);
    if (taps.length >= 5) { taps = []; openDbg(); } }
  document.querySelectorAll('.privacy').forEach(function(e){ e.addEventListener('click', tap); });
  function openDbg(){ dbg('debug opened · '+(api && api.info ? api.info() : '')); $('#dbg-pre').textContent = DBG.slice(-30).join('\n'); $('#dbg').classList.remove('hidden'); }
  $('#dbg-close').addEventListener('click', function(){ $('#dbg').classList.add('hidden'); });
  $('#dbg-copy').addEventListener('click', function(){ var t = DBG.slice(-60).join('\n'); if (navigator.clipboard) navigator.clipboard.writeText(t).then(function(){ toast('Copied'); }, function(){ toast('Could not copy'); }); });
})();
$('#menu-btn').addEventListener('click', function(ev){ ev.stopPropagation(); $('#menu').classList.toggle('hidden'); });
document.addEventListener('click', function(){ $('#menu').classList.add('hidden'); });
async function doLogout(silent){
  if (!silent && !confirm('Log out of Telegram on this app?')) return;
  try { await api.logout(); } catch(e){}
  try { localStorage.removeItem(SKEY); } catch(e){}
  revokePool('chats'); revokePool('gallery'); revokePool('viewer');
  location.replace(location.pathname);
}
$('#logout-btn').addEventListener('click', function(){ doLogout(false); });

/* ---------- gallery ---------- */
var G = { chat:null, kind:'photos', items:[], next:0, loading:false, done:false, gen:0, total:null, scrollY:0 };
var thQ = new Queue(4), tileObs = null, moreObs = null;
function fmtDate(sec){ var d=new Date(sec*1000); return d.toLocaleDateString(undefined,{weekday:'short', year:'numeric', month:'short', day:'numeric'}) + ' · ' + d.toLocaleTimeString(undefined,{hour:'numeric', minute:'2-digit'}); }
function resetGallery(){
  G.gen++; thQ.clear(); closeViewer(true); revokePool('gallery'); revokePool('viewer'); fullCache.clear();
  G.items=[]; G.next=0; G.done=false; G.loading=false; G.total=null; $('#grid').innerHTML=''; $('#g-status').textContent='';
}
function openGallery(chat){
  resetGallery(); G.chat = chat; G.kind='photos';
  document.querySelectorAll('.tab').forEach(function(t){ var a=t.dataset.kind==='photos'; t.classList.toggle('active',a); t.setAttribute('aria-selected',a); });
  G.scrollY = window.scrollY;
  $('#g-title').textContent = chat.title; $('#g-count').textContent='';
  show('s-gallery'); history.pushState({v:'gallery'}, '');
  loadMore();
}
function leaveGallery(){ resetGallery(); G.chat=null; show('s-chats'); filterChats(); window.scrollTo(0, G.scrollY||0); }
$('#g-back').addEventListener('click', function(){ history.back(); });
document.querySelectorAll('.tab').forEach(function(t){ t.addEventListener('click', function(){
  if (t.dataset.kind===G.kind) return; var chat=G.chat; resetGallery(); G.chat=chat; G.kind=t.dataset.kind;
  document.querySelectorAll('.tab').forEach(function(x){ var a=x===t; x.classList.toggle('active',a); x.setAttribute('aria-selected',a); });
  $('#g-count').textContent=''; loadMore();
}); });
function countText(){
  var n = G.total!=null ? G.total : G.items.length;
  return n===1 ? '1 picture' : n.toLocaleString() + (G.kind==='files' && G.total!=null ? ' files' : ' pictures');
}
async function loadMore(){
  if (G.loading || G.done || !G.chat) return; G.loading = true; var gen = G.gen;
  $('#g-status').textContent = 'Loading pictures…';
  try {
    var r = await api.photos(G.chat, G.kind, G.next);
    if (gen!==G.gen) return;
    if (r.total!=null) G.total = r.total;
    var start = G.items.length, frag = document.createDocumentFragment();
    r.items.forEach(function(it, i){ it.idx = start+i; G.items.push(it); frag.appendChild(tile(it)); });
    $('#grid').appendChild(frag);
    G.next = r.nextOffset; G.done = !r.nextOffset;
    $('#g-count').textContent = countText();
    $('#g-status').textContent = G.items.length ? (G.done ? '— that is all —' : '') : (G.kind==='files' ? 'No image files in this chat.' : 'No pictures in this chat.');
    G.loading = false;
    // keep filling if the page is not tall enough yet, or this page had no images
    if (!G.done && (r.items.length===0 || document.body.scrollHeight < window.innerHeight*1.6)) setTimeout(loadMore, 50);
  } catch(e){
    if (gen!==G.gen) return; G.loading=false; $('#g-status').textContent = errText(e);
  }
}
function tile(it){
  var b = el('button','tile'); b.type='button'; b.setAttribute('aria-label','Picture from '+fmtDate(it.date));
  var ph = el('span','ph'), im = el('span','im'); b.appendChild(ph); b.appendChild(im);
  var su = api.strippedUrl ? api.strippedUrl(it) : null; if (su) ph.style.backgroundImage='url("'+su+'")';
  if (G.kind==='files' && it.mime) b.appendChild(el('span','badge', it.mime.replace('image/','').toUpperCase()));
  b.addEventListener('click', function(){ openViewer(it.idx); });
  b.addEventListener('contextmenu', function(e){ e.preventDefault(); });
  it.tileEl = b; it.imEl = im;
  if (tileObs) tileObs.observe(b); else loadThumb(it);
  b._it = it; return b;
}
function loadThumb(it){
  if (it.thumbState) return; it.thumbState='q'; var gen=G.gen;
  thQ.push(function(){ if (gen!==G.gen) return null; return api.thumb(it); }).then(function(bytes){
    if (gen!==G.gen) return; var u = blobUrl(bytes, it.thumb ? 'image/jpeg' : it.mime, 'gallery');
    if (u){ it.thumbUrl=u; it.imEl.style.backgroundImage='url("'+u+'")'; it.tileEl.classList.add('loaded'); }
  }).catch(function(){ it.thumbState=null; });
}
if ('IntersectionObserver' in window) {
  tileObs = new IntersectionObserver(function(ents){ ents.forEach(function(en){ if (en.isIntersecting){ tileObs.unobserve(en.target); loadThumb(en.target._it); } }); }, { rootMargin:'400px 0px' });
  moreObs = new IntersectionObserver(function(ents){ if (ents[0].isIntersecting && $('#s-gallery').classList.contains('active')) loadMore(); }, { rootMargin:'900px 0px' });
  moreObs.observe($('#sentinel'));
}

/* ---------- viewer ---------- */
var V = { idx:-1, open:false, s:1, x:0, y:0, ptrs:new Map(), start:null, lastTap:0, swipeDx:0, mode:null, req:0 };
var fullCache = { map:new Map(), get:function(k){ var v=this.map.get(k); if(v){ this.map.delete(k); this.map.set(k,v); } return v; },
  set:function(k,v){ this.map.set(k,v); while(this.map.size>10){ var first=this.map.keys().next().value; if (first===k) break; var u=this.map.get(first); this.map.delete(first); revokeUrl(u,'viewer'); } },
  clear:function(){ this.map.clear(); } };
var fullQ = new Queue(2), fullPending = new Map();
function getFull(it){
  var c = fullCache.get(it.id); if (c) return Promise.resolve(c);
  if (fullPending.has(it.id)) return fullPending.get(it.id);
  var gen = G.gen;
  var p = fullQ.push(function(){ return api.full(it); }).then(function(bytes){
    fullPending.delete(it.id); if (gen!==G.gen) return null;
    var u = blobUrl(bytes, it.mime||'image/jpeg', 'viewer'); if (u) fullCache.set(it.id, u); return u;
  }, function(e){ fullPending.delete(it.id); throw e; });
  fullPending.set(it.id, p); return p;
}
var img = $('#v-img'), stage = $('#v-stage'), viewer = $('#viewer');
function applyT(anim){ img.style.transition = anim ? 'transform .22s ease' : 'none'; img.style.transform = 'translate('+(V.x+V.swipeDx)+'px,'+V.y+'px) scale('+V.s+')'; }
function resetT(){ V.s=1; V.x=0; V.y=0; V.swipeDx=0; img.style.transformOrigin='0 0'; layoutBase(); applyT(false); }
// base: image sits centered by flex; we transform around its own top-left, so compute centering offsets for zoom math
function layoutBase(){ V.base = img.getBoundingClientRect(); }
function openViewer(i){
  if (!V.open) { history.pushState({v:'viewer'}, ''); V.open = true; viewer.classList.remove('hidden'); document.body.style.overflow='hidden'; }
  showIdx(i);
}
function showIdx(i){
  if (i<0 || i>=G.items.length) return;
  V.idx=i; var it = G.items[i], req = ++V.req;
  $('#v-pos').textContent = (i+1) + ' / ' + (G.total!=null ? G.total : G.items.length);
  $('#v-date').textContent = fmtDate(it.date); $('#v-text').textContent = it.text || '';
  V.s=1; V.x=0; V.y=0; V.swipeDx=0; applyT(false);
  img.src = it.thumbUrl || ''; img.style.visibility = it.thumbUrl ? 'visible':'hidden'; $('#v-spin').classList.remove('hidden');
  getFull(it).then(function(u){ if (req!==V.req || !u) return; img.src=u; img.style.visibility='visible'; $('#v-spin').classList.add('hidden'); })
    .catch(function(e){ if (req===V.req){ $('#v-spin').classList.add('hidden'); toast(errText(e)); } });
  // prefetch neighbours; load more pages when near the end
  [i+1, i-1].forEach(function(j){ if (G.items[j]) getFull(G.items[j]).catch(function(){}); });
  if (i > G.items.length - 6) loadMore();
}
function closeViewer(fromPop){
  if (!V.open) return; V.open=false; V.req++; viewer.classList.add('hidden'); img.removeAttribute('src'); document.body.style.overflow='';
  var it = G.items[V.idx]; if (it && it.tileEl && it.tileEl.scrollIntoView) { var r=it.tileEl.getBoundingClientRect(); if (r.top<60 || r.bottom>window.innerHeight) it.tileEl.scrollIntoView({block:'center'}); }
  if (!fromPop && history.state && history.state.v==='viewer') history.back();
}
$('#v-close').addEventListener('click', function(e){ e.stopPropagation(); closeViewer(false); });
$('#v-prev').addEventListener('click', function(e){ e.stopPropagation(); showIdx(V.idx-1); });
$('#v-next').addEventListener('click', function(e){ e.stopPropagation(); showIdx(V.idx+1); });
viewer.addEventListener('contextmenu', function(e){ e.preventDefault(); });
document.addEventListener('keydown', function(e){ if(!V.open) return; if(e.key==='ArrowRight') showIdx(V.idx+1); else if(e.key==='ArrowLeft') showIdx(V.idx-1); else if(e.key==='Escape') closeViewer(false); });

function dist(a,b){ return Math.hypot(a.x-b.x, a.y-b.y); }
function mid(a,b){ return {x:(a.x+b.x)/2, y:(a.y+b.y)/2}; }
function clampPan(){
  var W=stage.clientWidth, H=stage.clientHeight, b=V.base||{width:W,height:H,left:0,top:0};
  var w=b.width*V.s, h=b.height*V.s;
  // image's untransformed top-left is at (b.left,b.top); after transform at (b.left+x, b.top+y)
  var minX = Math.min(0, W - w) - b.left, maxX = Math.max(0, W - w) - b.left;
  var minY = Math.min(0, H - h) - b.top,  maxY = Math.max(0, H - h) - b.top;
  if (w <= W) { V.x = (W - w)/2 - b.left; } else V.x = Math.max(minX, Math.min(maxX, V.x));
  if (h <= H) { V.y = (H - h)/2 - b.top; } else V.y = Math.max(minY, Math.min(maxY, V.y));
}
function zoomAt(px, py, ns){
  var b = V.base; ns = Math.max(1, Math.min(6, ns));
  // keep point (px,py) fixed: screen = b.left + x + u*s  ->  u = (px - b.left - x)/s
  var ux = (px - b.left - V.x)/V.s, uy = (py - b.top - V.y)/V.s;
  V.s = ns; V.x = px - b.left - ux*ns; V.y = py - b.top - uy*ns;
  if (ns===1){ V.x=0; V.y=0; } else clampPan();
}
stage.addEventListener('pointerdown', function(e){
  stage.setPointerCapture && stage.setPointerCapture(e.pointerId);
  V.ptrs.set(e.pointerId, {x:e.clientX, y:e.clientY});
  if (V.s===1 && V.ptrs.size===1) layoutBase();
  if (V.ptrs.size===1){ V.mode = V.s>1 ? 'pan' : 'swipe'; V.start = {x:e.clientX, y:e.clientY, ox:V.x, oy:V.y, t:Date.now()}; }
  else if (V.ptrs.size===2){ var p=[...V.ptrs.values()]; V.mode='pinch'; V.swipeDx=0; V.pinch = { d:dist(p[0],p[1]), s:V.s, m:mid(p[0],p[1]), ox:V.x, oy:V.y }; }
});
stage.addEventListener('pointermove', function(e){
  if (!V.ptrs.has(e.pointerId)) return; V.ptrs.set(e.pointerId, {x:e.clientX, y:e.clientY});
  if (V.mode==='pinch' && V.ptrs.size>=2){
    var p=[...V.ptrs.values()], d=dist(p[0],p[1]), m=mid(p[0],p[1]), pc=V.pinch;
    var ns = Math.max(1, Math.min(6, pc.s * d/pc.d));
    var b=V.base, ux=(pc.m.x - b.left - pc.ox)/pc.s, uy=(pc.m.y - b.top - pc.oy)/pc.s;
    V.s=ns; V.x = m.x - b.left - ux*ns; V.y = m.y - b.top - uy*ns; applyT(false);
  } else if (V.mode==='pan'){
    V.x = V.start.ox + (e.clientX - V.start.x); V.y = V.start.oy + (e.clientY - V.start.y); clampPan(); applyT(false);
  } else if (V.mode==='swipe'){
    V.swipeDx = e.clientX - V.start.x; applyT(false);
  }
});
function endPtr(e){
  if (!V.ptrs.has(e.pointerId)) return; V.ptrs.delete(e.pointerId);
  if (V.mode==='pinch'){ if (V.ptrs.size<2){ if (V.s<1.05){ V.s=1; V.x=0; V.y=0; } else clampPan(); applyT(true);
      if (V.ptrs.size===1){ var q=[...V.ptrs.values()][0]; V.mode = V.s>1?'pan':'swipe'; V.start={x:q.x,y:q.y,ox:V.x,oy:V.y,t:Date.now()}; } else V.mode=null; } return; }
  if (V.ptrs.size) return;
  var dx = e.clientX - (V.start?V.start.x:e.clientX), dy = e.clientY - (V.start?V.start.y:e.clientY), dt = Date.now() - (V.start?V.start.t:0);
  var tap = Math.abs(dx)<10 && Math.abs(dy)<10 && dt<300;
  if (V.mode==='swipe' && !tap){
    var W = stage.clientWidth, fast = Math.abs(dx)/Math.max(dt,1) > 0.5;
    if ((dx < -W*0.2 || (fast && dx<-40)) && V.idx < G.items.length-1){ V.swipeDx=-W; applyT(true); setTimeout(function(){ showIdx(V.idx+1); }, 160); }
    else if ((dx > W*0.2 || (fast && dx>40)) && V.idx > 0){ V.swipeDx=W; applyT(true); setTimeout(function(){ showIdx(V.idx-1); }, 160); }
    else if (dy > 120 && Math.abs(dx) < 80) { closeViewer(false); }
    else { V.swipeDx=0; applyT(true); }
  } else if (tap){
    var now = Date.now();
    if (now - V.lastTap < 300){ clearTimeout(V.tapT); V.lastTap=0; if (V.s>1){ V.s=1; V.x=0; V.y=0; } else { layoutBase(); zoomAt(e.clientX, e.clientY, 2.5); } applyT(true); }
    else { V.lastTap = now; V.tapT = setTimeout(function(){ viewer.classList.toggle('chrome-off'); }, 300); }
  }
  V.mode=null;
}
stage.addEventListener('pointerup', endPtr); stage.addEventListener('pointercancel', endPtr);
stage.addEventListener('wheel', function(e){ e.preventDefault(); if (V.s===1) layoutBase(); zoomAt(e.clientX, e.clientY, V.s * (e.deltaY<0 ? 1.2 : 1/1.2)); applyT(false); }, {passive:false});
window.addEventListener('resize', function(){ if (V.open){ V.s=1; V.x=0; V.y=0; applyT(false); } });

/* ---------- back button ---------- */
window.addEventListener('popstate', function(){
  if (V.open) { closeViewer(true); return; }
  if ($('#s-gallery').classList.contains('active')) leaveGallery();
});

/* ---------- service worker: app shell only ---------- */
if ('serviceWorker' in navigator && (location.protocol==='https:' || location.hostname==='localhost')) { window.addEventListener('load', function(){ navigator.serviceWorker.register('sw.js?v=2').catch(function(){}); }); }

boot();
})();
