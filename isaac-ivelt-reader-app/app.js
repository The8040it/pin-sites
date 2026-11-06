/* Ivelt web app — a faithful web port of Isaac's "Ivelt" Android app (Feed, Boards, Portal, Saved, Reader, Settings). */
(() => {
'use strict';

const BASE = 'https://www.ivelt.com/forum/';
const ACTIVE_TOPICS_URL = BASE + 'search.php?search_id=active_topics';
const UNANSWERED_URL = BASE + 'search.php?search_id=unanswered';
const NEW_POSTS_URL = BASE + 'search.php?search_id=newposts';
const LOGIN_URL = BASE + 'ucp.php?mode=login';

const FILTERS = [
  { id: 'posts', yi: 'לעצטע תגובות', en: 'Latest Posts', page: ACTIVE_TOPICS_URL },
  { id: 'unread', yi: 'נישט געליינט', en: 'Unread', page: BASE + 'search.php?search_id=unreadposts' },
  { id: 'topics', yi: 'נייע אשכולות', en: 'New Topics', page: ACTIVE_TOPICS_URL },
  { id: 'news', yi: 'נייעס', en: 'News', page: BASE + 'viewforum.php?f=6' }
];
const NEWS_F = new Set([6, 183, 184, 185]);

/* ---------- icons (Material, 24px) ---------- */
const P = {
  feed: 'M8 8H6v7c0 1.1.9 2 2 2h9v-2H8V8zm12-5h-8c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 8h-8V7h8v4zM4 12H2v7c0 1.1.9 2 2 2h9v-2H4v-7z',
  grid: 'M3 3v8h8V3H3zm6 6H5V5h4v4zm-6 4v8h8v-8H3zm6 6H5v-4h4v4zm4-16v8h8V3h-8zm6 6h-4V5h4v4zm-6 4v8h8v-8h-8zm6 6h-4v-4h4v4z',
  forum: 'M21 6h-2v9H6v2c0 .55.45 1 1 1h11l4 4V7c0-.55-.45-1-1-1zm-4 6V3c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v14l4-4h10c.55 0 1-.45 1-1z',
  bookmark: 'M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z',
  bookmarkO: 'M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15l-5-2.18L7 18V5h10v13z',
  search: 'M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z',
  close: 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',
  refresh: 'M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z',
  settings: 'M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.488.488 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z',
  clock: 'M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z',
  person: 'M12 5.9a2.1 2.1 0 110 4.2 2.1 2.1 0 010-4.2m0 9c2.97 0 6.1 1.46 6.1 2.1v1.1H5.9V17c0-.64 3.13-2.1 6.1-2.1M12 4C9.79 4 8 5.79 8 8s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 9c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4z',
  open: 'M19 19H5V5h7V3H5a2 2 0 00-2 2v14a2 2 0 002 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z',
  back: 'M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z',
  share: 'M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z',
  bolt: 'M11 21h-1l1-7H7.5c-.58 0-.57-.32-.38-.66.19-.34.05-.08.07-.12C8.48 10.94 10.42 7.54 13 3h1l-1 7h3.5c.49 0 .56.33.47.51l-.07.15C12.96 17.55 11 21 11 21z',
  news: 'M22 3l-1.67 1.67L18.67 3 17 4.67 15.33 3l-1.66 1.67L12 3l-1.67 1.67L8.67 3 7 4.67 5.33 3 3.67 4.67 2 3v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V3zM11 19H4v-6h7v6zm9 0h-7v-2h7v2zm0-4h-7v-2h7v2zm0-4H4V8h16v3z',
  book: 'M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z',
  people: 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z',
  chip: 'M15 9H9v6h6V9zm-2 4h-2v-2h2v2zm8-2V9h-2V7c0-1.1-.9-2-2-2h-2V3h-2v2h-2V3H9v2H7c-1.1 0-2 .9-2 2v2H3v2h2v2H3v2h2v2c0 1.1.9 2 2 2h2v2h2v-2h2v2h2v-2h2c1.1 0 2-.9 2-2v-2h2v-2h-2v-2h2zm-4 6H7V7h10v10z',
  history: 'M9 4v1.38c-.83-.33-1.72-.5-2.61-.5-1.79 0-3.58.68-4.95 2.05l3.33 3.33h1.11v1.11c.86.86 1.98 1.31 3.11 1.36V15H6v3c0 1.1.9 2 2 2h10c1.66 0 3-1.34 3-3V4H9zm-1.11 6.41V8.26H5.61L4.57 7.22a5.07 5.07 0 011.82-.34c1.34 0 2.59.52 3.54 1.46l1.41 1.41-.2.2a2.7 2.7 0 01-1.92.8c-.47 0-.93-.12-1.33-.34zM19 17c0 .55-.45 1-1 1s-1-.45-1-1v-2h-6v-2.59c.57-.23 1.1-.57 1.56-1.03l.2-.2L15.59 14H17v-1.41l-6-5.97V6h8v11z',
  rss: 'M6.18 15.64a2.18 2.18 0 012.18 2.18C8.36 19 7.38 20 6.18 20 5 20 4 19 4 17.82a2.18 2.18 0 012.18-2.18M4 4.44A15.56 15.56 0 0119.56 20h-2.83A12.73 12.73 0 004 7.27V4.44m0 5.66a9.9 9.9 0 019.9 9.9h-2.83A7.07 7.07 0 004 12.93V10.1z',
  wifiOff: 'M23.64 7c-.45-.34-4.93-4-11.64-4-1.5 0-2.89.19-4.15.48L18.18 13.8 23.64 7zm-6.6 8.22L3.27 1.44 2 2.72l2.05 2.06C1.91 5.76.59 6.82.36 7l11.63 14.49.01.01.01-.01 3.9-4.86 3.32 3.32 1.27-1.27-3.46-3.46z',
  lock: 'M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z',
  sweep: 'M15 16h4v2h-4zm0-8h7v2h-7zm0 4h6v2h-6zM3 18c0 1.1.9 2 2 2h6c1.1 0 2-.9 2-2V8H3v10zM14 5h-3l-1-1H6L5 5H2v2h12z',
  home: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z',
  download: 'M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z',
  add: 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z',
  books: 'M19 1l-5 5v11l5-4.5V1zM1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5V6c-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6zm22 13.5V6c-.6-.45-1.25-.75-2-1v13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5v2c1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5v-1.1z'
};
const ic = (name, cls = '') => `<svg class="i ${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${P[name]}"/></svg>`;
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ---------- storage ---------- */
const LS = {
  get(k, d) { try { const v = localStorage.getItem('ivelt.' + k); return v == null ? d : JSON.parse(v); } catch (_) { return d; } },
  set(k, v) { try { localStorage.setItem('ivelt.' + k, JSON.stringify(v)); } catch (_) {} }
};

/* ---------- state ---------- */
const prefs = Object.assign({ theme: 'system', scale: 1 }, LS.get('prefs', {}));
const state = {
  tab: 'feed',
  filter: 'posts',
  board: null,          // {key, yi, en, url, page}
  query: '',
  refreshing: false,
  feeds: {},            // key -> {posts, kind, fetchedAt, status}
  reader: null,         // post
  saved: LS.get('saved', []),
  history: LS.get('history', []),
  installEvt: null,
  snap: null, meta: null, thread: null, updating: false
};
{ const c = LS.get('snap', null); if (c && c.snap) { state.snap = c.snap; } }

/* ---------- theme ---------- */
const mq = window.matchMedia ? matchMedia('(prefers-color-scheme: dark)') : null;
function applyTheme() {
  const dark = prefs.theme === 'dark' || (prefs.theme === 'system' && mq && mq.matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  document.querySelector('meta[name=theme-color]').setAttribute('content', dark ? '#0B1520' : '#0F2942');
  document.documentElement.style.setProperty('--reader-scale', String(prefs.scale));
}
if (mq && mq.addEventListener) mq.addEventListener('change', applyTheme);
function savePrefs() { LS.set('prefs', prefs); applyTheme(); }

/* ---------- feed parsing (port of IveltFeedParser) ---------- */
const decoder = document.createElement('textarea');
function decodeHtmlPlain(input) {
  if (!input) return '';
  let s = String(input).replace(/<[^>]*>/g, ' ');
  decoder.innerHTML = s;
  s = decoder.value;
  return s.replace(/\u00A0/g, ' ').replace(/\s+/g, ' ').trim();
}
function htmlToReadableText(html) {
  if (!html) return '';
  let s = String(html)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/(div|li|h\d)>/gi, '\n')
    .replace(/<\/blockquote>/gi, '\n───\n')
    .replace(/<cite[^>]*>/gi, '')
    .replace(/<[^>]*>/g, '');
  decoder.innerHTML = s;
  s = decoder.value.replace(/\u00A0/g, ' ');
  s = s.replace(/[ \t]+/g, ' ').replace(/ *\n */g, '\n').replace(/\n{3,}/g, '\n\n');
  return s.trim();
}
function cleanForumExcerpt(html) {
  if (!html) return '';
  const without = String(html).replace(/<p>\s*סטאטיסטיקס:[\s\S]*?<\/p>/gi, '').replace(/Statistics:[\s\S]*?Posted by.*/gi, '');
  return decodeHtmlPlain(without).slice(0, 360);
}
function splitTitle(raw, explicitCat) {
  const i = raw.indexOf('•');
  if (i > 0 && i < raw.length - 1) {
    const left = raw.slice(0, i).trim();
    const right = raw.slice(i + 1).trim().replace(/^Re:\s*/, '').trim();
    return [explicitCat || left, right];
  }
  return [explicitCat, raw.replace(/^Re:\s*/, '').trim()];
}
function relTime(raw) {
  if (!raw) return '';
  const t = Date.parse(raw);
  if (isNaN(t)) return String(raw).slice(0, 16).replace('T', ' ');
  const min = Math.floor((Date.now() - t) / 60000);
  if (min < 1) return 'יעצט';
  if (min < 60) return `פאר ${min} מינוט`;
  if (min < 1440) { const h = Math.floor(min / 60); return h === 1 ? 'פאר א שעה' : `פאר ${h} שעה`; }
  if (min < 10080) { const d = Math.floor(min / 1440); return d === 1 ? 'נעכטן' : `פאר ${d} טעג`; }
  try { return new Date(t).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); } catch (_) { return new Date(t).toDateString(); }
}
function absolutize(html) {
  return String(html || '').replace(/src="\.\//g, 'src="' + BASE).replace(/href="\.\//g, 'href="' + BASE);
}
function childText(el, names) {
  for (const n of names) {
    const c = Array.from(el.children).find(x => x.localName.toLowerCase() === n || x.nodeName.toLowerCase() === n);
    if (c) return c.textContent || '';
  }
  return '';
}
function parseFeed(xml) {
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  if (doc.getElementsByTagName('parsererror').length) return [];
  const items = Array.from(doc.getElementsByTagName('entry')).concat(Array.from(doc.getElementsByTagName('item')));
  const posts = [];
  for (const el of items) {
    let link = '';
    for (const l of Array.from(el.children).filter(x => x.localName === 'link')) {
      const href = l.getAttribute('href') || (l.textContent || '').trim();
      if (href && (!link || l.getAttribute('rel') === 'alternate')) link = href;
    }
    const id = childText(el, ['id', 'guid']).trim();
    let author = '';
    const a = Array.from(el.children).find(x => x.localName === 'author');
    if (a) author = (childText(a, ['name']) || a.textContent || '').trim();
    if (!author) author = childText(el, ['creator', 'dc:creator']).trim();
    let cat = '';
    const c = Array.from(el.children).find(x => x.localName === 'category');
    if (c) cat = c.getAttribute('label') || c.getAttribute('term') || (c.textContent || '').trim();
    const title = decodeHtmlPlain(childText(el, ['title']));
    const content = childText(el, ['encoded', 'content']).trim() || childText(el, ['summary', 'description']).trim();
    const ts = childText(el, ['updated']).trim() || childText(el, ['published', 'pubdate']).trim();
    const [exCat, subject] = splitTitle(title, decodeHtmlPlain(cat));
    const plain = cleanForumExcerpt(content);
    const resolved = link || id || BASE;
    if (!subject && !plain) continue;
    posts.push({
      id: id || resolved,
      title: title || subject,
      cleanTitle: subject || title,
      categoryName: exCat || 'אידישע וועלט',
      author: decodeHtmlPlain(author) || 'Ivelt Member',
      publishedRaw: ts,
      contentHtml: absolutize(content),
      plainExcerpt: plain,
      link: resolved
    });
  }
  return posts;
}
function parseHtmlTopics(html) {
  const re = /<a[^>]*href=["'](?:\.\/)?(viewtopic\.php\?[^"']+)["'][^>]*class=["'][^"']*topictitle[^"']*["'][^>]*>([\s\S]*?)<\/a>/gi;
  const out = [], seen = new Set();
  let m;
  while ((m = re.exec(html)) && out.length < 35) {
    const t = decodeHtmlPlain(m[2]);
    if (!t || seen.has(t)) continue;
    seen.add(t);
    const link = BASE + m[1].replace(/&amp;/g, '&');
    out.push({ id: link, title: t, cleanTitle: t, categoryName: 'אידישע וועלט פארומס', author: 'Ivelt Discussion', publishedRaw: '', fixedTime: 'אקטיוו', contentHtml: '<p>' + esc(t) + '</p>', plainExcerpt: 'דריקט צו לייענען דעם לייוו אשכול אויף אייוועלט.', link });
  }
  return out;
}

/* ---------- networking: snapshots read by the app's own server ---------- */
// Ivelt shows its forums only to logged-in members and blocks automated readers, so the app's server keeps
// a copy that a real browser, signed in as you, refreshes. Everything here is read-only.
const topicLink = (t, start) => BASE + 'viewtopic.php?t=' + t + (start ? '&start=' + start : '');
function topicToPost(r) {
  return { id: 'ivt' + r.t, t: r.t, title: r.title, cleanTitle: r.title, categoryName: r.forum || '', f: r.f || 0,
    author: r.lastAuthor || r.author || '', firstAuthor: r.author || '', publishedRaw: r.lastTime || r.firstTime || '', firstTime: r.firstTime || '',
    replies: r.replies || 0, views: r.views || 0, lastStart: r.lastStart || 0, unread: !!r.unread, sticky: !!r.sticky,
    plainExcerpt: '', link: topicLink(r.t) };
}
function ageWords(sec) {
  if (sec == null) return '';
  const m = Math.round(sec / 60);
  if (m < 1) return { yi: 'יעצט', en: 'just now' };
  if (m < 60) return { yi: `פאר ${m} מינוט`, en: `${m} min ago` };
  const h = Math.round(m / 60);
  if (h < 24) return { yi: h === 1 ? 'פאר א שעה' : `פאר ${h} שעה`, en: `${h} h ago` };
  const d = Math.round(h / 24);
  return { yi: d === 1 ? 'נעכטן' : `פאר ${d} טעג`, en: `${d} day${d > 1 ? 's' : ''} ago` };
}
function activeSource() {
  if (state.board) return { key: 'board_' + state.board.f + '_' + (state.board.start || 0), page: BASE + 'viewforum.php?f=' + state.board.f, label: state.board.name };
  const f = FILTERS.find(x => x.id === state.filter) || FILTERS[0];
  return { key: f.id, page: f.page, label: f.yi };
}
async function getJSON(url, ms = 20000) {
  const ctl = new AbortController(); const timer = setTimeout(() => ctl.abort(), ms);
  try { const r = await fetch(url, { signal: ctl.signal, cache: 'no-store' }); return await r.json(); } finally { clearTimeout(timer); }
}
function listFromSnap(snap, filter) {
  let rows = (snap && snap.active) || [];
  rows = rows.map(topicToPost);
  if (filter === 'topics') rows = rows.slice().sort((a, b) => Date.parse(b.firstTime || 0) - Date.parse(a.firstTime || 0));
  else rows = rows.slice().sort((a, b) => Date.parse(b.publishedRaw || 0) - Date.parse(a.publishedRaw || 0));
  if (filter === 'news') rows = rows.filter(p => NEWS_F.has(p.f));
  if (filter === 'unread') rows = rows.filter(p => p.unread);
  return rows;
}
let refreshSeq = 0;
async function refresh(force) {
  const seq = ++refreshSeq;
  state.refreshing = true; render();
  try {
    if (state.board) await loadBoard(seq, force);
    else await loadFeed(seq, force);
  } catch (e) {
    const src = activeSource();
    const prev = state.feeds[src.key];
    state.feeds[src.key] = prev && prev.posts && prev.posts.length ? { ...prev, stale: true } : { posts: [], kind: navigator.onLine === false ? 'offline' : 'error', error: String(e && e.message || e) };
  }
  if (seq === refreshSeq) { state.refreshing = false; state.updating = false; render(); }
}
function applySnap(data) {
  state.meta = { updatedAt: data.updatedAt, age: data.age, refresherAge: data.refresherAge, status: data.status, now: data.now, gotAt: Date.now() };
  if (data.snap) {
    state.snap = data.snap;
    LS.set('snap', { snap: data.snap, updatedAt: data.updatedAt });
  }
  for (const f of FILTERS) state.feeds[f.id] = state.snap ? { posts: listFromSnap(state.snap, f.id), kind: 'ok', fetchedAt: new Date(data.updatedAt * 1000).toISOString() } : { posts: [], kind: loginBroken() ? 'locked' : 'waiting' };
}
const refresherOnline = () => state.meta && state.meta.refresherAge != null && state.meta.refresherAge < 150;
const loginBroken = () => state.meta && state.meta.status && state.meta.status.loggedIn === false;
async function loadFeed(seq) {
  let data = await getJSON('/api/feed');
  if (seq !== refreshSeq) return;
  applySnap(data); render();
  // the server asked the refresher for a newer copy; if it is awake, wait for it (up to ~50 s)
  if (data.queued && refresherOnline() && !loginBroken()) {
    const start = data.updatedAt;
    state.updating = true; render();
    for (let i = 0; i < 17; i++) {
      await new Promise(r => setTimeout(r, 3000));
      if (seq !== refreshSeq) return;
      data = await getJSON('/api/feed');
      if (data.updatedAt !== start) { applySnap(data); break; }
      state.meta.refresherAge = data.refresherAge;
    }
  }
}
async function loadPath(path, onUpdate, seqCheck) {
  // cached page or a request the refresher picks up; polls while the refresher is awake
  let d = await getJSON('/api/page?path=' + encodeURIComponent(path));
  if (!seqCheck()) return d;
  onUpdate(d);
  const t0 = Date.now(), first = d.fetchedAt;
  while (d.queued && (!d.ok || d.age > 600) && Date.now() - t0 < 75000) {
    if (!(d.refresherAge != null && d.refresherAge < 150) && Date.now() - t0 > 6000) break;
    await new Promise(r => setTimeout(r, 2500));
    if (!seqCheck()) return d;
    const n = await getJSON('/api/page?path=' + encodeURIComponent(path));
    n.queued = true;
    if (n.ok && n.fetchedAt !== first) { d = { ...n, queued: false }; break; }
    d = { ...n, ok: d.ok || n.ok, data: n.data || d.data };
    onUpdate(d);
  }
  d.done = true;
  onUpdate(d);
  return d;
}
async function loadBoard(seq) {
  const b = state.board, key = activeSource().key;
  const path = 'viewforum.php?f=' + b.f + (b.start ? '&start=' + b.start : '');
  await loadPath(path, d => {
    if (seq !== refreshSeq) return;
    if (d.data) {
      b.name = d.data.name || b.name; b.page = d.data.page; b.pages = d.data.pages; b.per = d.data.per;
      state.feeds[key] = { posts: (d.data.topics || []).map(topicToPost).map(p => (p.categoryName ? p : { ...p, categoryName: b.name })), kind: 'ok', fetchedAt: new Date(d.fetchedAt * 1000).toISOString(), age: d.age };
    } else if (d.done) {
      state.feeds[key] = { posts: [], kind: d.status && d.status.loggedIn === false ? 'locked' : 'asleep' };
    } else state.feeds[key] = { posts: [], kind: 'loading' };
    state.meta = Object.assign(state.meta || {}, { refresherAge: d.refresherAge, status: d.status });
    render();
  }, () => seq === refreshSeq);
}
/* ---------- thread reader ---------- */
let threadSeq = 0;
function threadPath(t, start) { return 'viewtopic.php?t=' + t + (start ? '&start=' + start : ''); }
async function openThread(post, start) {
  const seq = ++threadSeq;
  const t = post.t || parseInt((String(post.link).match(/[?&]t=(\d+)/) || [])[1] || '0', 10);
  if (!t) { state.thread = null; render(); return; }
  if (start == null) start = post.lastStart || 0;
  state.thread = { t, start, loading: true, data: (state.thread && state.thread.t === t) ? state.thread.data : null };
  render();
  await loadPath(threadPath(t, start), d => {
    if (seq !== threadSeq) return;
    state.thread = { t, start, data: d.data, fetchedAt: d.fetchedAt, age: d.age, loading: !d.done && !d.data, waiting: !d.done && !!d.queued, done: !!d.done, refresherAge: d.refresherAge, status: d.status };
    render();
  }, () => seq === threadSeq).catch(() => { if (seq === threadSeq) { state.thread = { t, start, error: true, done: true }; render(); } });
}
function sanitize(html) {
  const doc = new DOMParser().parseFromString('<div>' + (html || '') + '</div>', 'text/html');
  const OK = new Set(['P','BR','B','STRONG','I','EM','U','S','STRIKE','BLOCKQUOTE','CITE','DIV','SPAN','A','IMG','UL','OL','LI','CODE','PRE','HR','H3','H4','SUP','SUB','TABLE','TBODY','TR','TD','TH','DL','DT','DD']);
  const walk = el => {
    for (const n of [...el.children]) {
      if (!OK.has(n.tagName)) { n.replaceWith(...n.childNodes); continue; }
      for (const a of [...n.attributes]) {
        const keep = (a.name === 'href' && n.tagName === 'A') || (a.name === 'src' && n.tagName === 'IMG') || a.name === 'alt' || a.name === 'class' || a.name === 'data-att';
        if (!keep || ((a.name === 'href' || a.name === 'src') && !/^https?:\/\//i.test(a.value))) n.removeAttribute(a.name);
      }
      if (n.tagName === 'A') { n.setAttribute('target', '_blank'); n.setAttribute('rel', 'noopener noreferrer'); }
      if (n.tagName === 'IMG') { n.setAttribute('loading', 'lazy'); n.setAttribute('referrerpolicy', 'no-referrer'); }
      walk(n);
    }
  };
  const root = doc.body.firstElementChild; walk(root);
  return root.innerHTML;
}

/* ---------- actions ---------- */
function openExternal(url, title) {
  if (!url) return;
  addHistory(url, title);
  const w = window.open(url, '_blank', 'noopener');
  if (!w) location.href = url;
}
function addHistory(url, title) {
  state.history = [{ url, title: title || prettyUrl(url), at: Date.now() }].concat(state.history.filter(h => h.url !== url)).slice(0, 25);
  LS.set('history', state.history);
}
function prettyUrl(u) { return String(u).replace(/^https?:\/\//, '').replace(/^www\./, ''); }
function isSaved(link) { return state.saved.some(p => p.link === link); }
function toggleSave(post) {
  if (isSaved(post.link)) { state.saved = state.saved.filter(p => p.link !== post.link); toast('אראפגענומען פון געהאלטן'); }
  else { state.saved = [{ ...post, savedAt: Date.now() }].concat(state.saved); toast('געהאלטן אפליין ✓'); }
  LS.set('saved', state.saved);
  render();
}
function sharePost(post) {
  const text = post.cleanTitle + '\n' + post.link;
  if (navigator.share) navigator.share({ title: post.cleanTitle, text: post.cleanTitle, url: post.link }).catch(() => {});
  else if (navigator.clipboard) navigator.clipboard.writeText(text).then(() => toast('דער לינק איז קאפירט'));
}
let toastTimer;
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.hidden = false;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.hidden = true; }, 2600);
}
function selectTab(tab) {
  state.tab = tab; state.reader = null;
  render(); window.scrollTo(0, 0);
  const m = document.getElementById('main'); if (m) m.focus({ preventScroll: true });
}

/* ---------- saving from Android share sheet / pasted links ---------- */
const SITE_TITLE_RE = /\s*[-–|]\s*אידישע וועלט פארומס\s*$|^\s*אידישע וועלט פארומס\s*[-–|]\s*/g;
function makeSavedFromLink(url, title, note) {
  let t = (title || '').replace(SITE_TITLE_RE, '').trim();
  let cat = 'אידישע וועלט';
  const parts = t.split(' - ');
  if (parts.length > 1 && /ivelt/i.test(url)) { t = parts[parts.length - 1].trim() || t; }
  if (!t) t = prettyUrl(url);
  return { id: url, title: t, cleanTitle: t, categoryName: cat, author: '', publishedRaw: new Date().toISOString(), contentHtml: '', plainExcerpt: (note || '').trim(), link: url, savedAt: Date.now(), fromShare: true };
}
function handleIncomingShare() {
  const q = new URLSearchParams(location.search);
  const tabParam = q.get('tab');
  if (tabParam && ['feed', 'boards', 'portal', 'saved'].includes(tabParam)) state.tab = tabParam;
  const text = q.get('text') || '', title = q.get('title') || '';
  let url = q.get('url') || '';
  if (!url) { const m = text.match(/https?:\/\/\S+/); if (m) url = m[0]; }
  if (url) {
    const note = text.replace(url, '').trim();
    if (!isSaved(url)) { state.saved = [makeSavedFromLink(url, title || note, note === title ? '' : note)].concat(state.saved); LS.set('saved', state.saved); }
    state.tab = 'saved';
    setTimeout(() => toast('געהאלטן אין "געהאלטן" ✓'), 300);
  }
  if (q.toString()) history.replaceState(null, '', '/');
}

/* ---------- render pieces ---------- */
const NAV = [
  { tab: 'feed', label: 'פיד', icon: 'feed' },
  { tab: 'boards', label: 'פארומס', icon: 'grid' },
  { tab: 'portal', label: 'פארטאל', icon: 'forum' },
  { tab: 'saved', label: 'געהאלטן', icon: 'bookmark', iconOff: 'bookmarkO' }
];
function renderNav() {
  const html = NAV.map(n => {
    const sel = state.tab === n.tab;
    const icon = !sel && n.iconOff ? n.iconOff : n.icon;
    const badge = n.tab === 'saved' && state.saved.length ? `<span class="badge">${state.saved.length}</span>` : '';
    return `<button class="nav-item" data-act="tab" data-tab="${n.tab}" ${sel ? 'aria-current="page"' : ''}><span class="nav-ico">${ic(icon)}${badge}</span><span>${n.label}</span></button>`;
  }).join('');
  document.getElementById('bottomNav').innerHTML = html;
  document.getElementById('rail').innerHTML = `<button class="icon-btn" data-act="settings" aria-label="איינשטעלונגען">${ic('settings')}</button>` + html;
}

function postCard(p, selected) {
  const saved = isSaved(p.link);
  const time = p.fixedTime || (p.fromShare ? '' : relTime(p.publishedRaw));
  const stats = p.t ? `<span class="stat">${ic('forum', 's14')}${p.replies} תגובות</span><span class="stat">${p.views.toLocaleString('en-US')} געזען</span>` : '';
  return `<article class="card ${selected ? 'sel' : ''} ${p.unread ? 'unread' : ''}" data-act="read" data-link="${esc(p.link)}" tabindex="0">
    <div class="row"><span class="cat">${p.unread ? '<i class="dot" aria-label="נישט געליינט"></i>' : ''}${esc(p.categoryName || 'אייוועלט')}</span>${time ? `<span class="time">${ic('clock', 's14')}${esc(time)}</span>` : ''}</div>
    <h3 dir="auto">${esc(p.cleanTitle)}</h3>
    ${p.plainExcerpt ? `<p class="excerpt" dir="auto">${esc(p.plainExcerpt)}</p>` : ''}
    ${stats ? `<div class="stats">${stats}</div>` : ''}
    <div class="row">
      <div class="author">${p.author ? ic('person', 's16') + `<span>${p.t ? 'לעצטע: ' : ''}${esc(p.author)}</span>` : (p.fromShare ? `<span class="small" dir="ltr">${esc(prettyUrl(p.link))}</span>` : '')}</div>
      <div style="display:flex">
        <button class="icon-btn" data-act="ext" data-link="${esc(p.t ? topicLink(p.t, p.lastStart) : p.link)}" aria-label="עפן אויף אייוועלט">${ic('open')}</button>
        <button class="icon-btn ${saved ? 'on' : ''}" data-act="save" data-link="${esc(p.link)}" aria-label="${saved ? 'נעם אראפ פון געהאלטן' : 'היט אפליין'}">${ic(saved ? 'bookmark' : 'bookmarkO')}</button>
      </div>
    </div>
  </article>`;
}

function hero() {
  const installBtn = state.installEvt ? `<button class="install-pill" data-act="install">${ic('download', 's18')}אינסטאלירן</button>` : '';
  return `<header class="hero">
    <div class="hero-actions">${installBtn}
      <button class="icon-btn" data-act="refresh" ${state.refreshing ? 'disabled' : ''} aria-label="דערפריש דעם לייוו פיד">${ic('refresh')}</button>
      <button class="icon-btn" data-act="settings" aria-label="איינשטעלונגען">${ic('settings')}</button>
    </div>
    <div class="hero-text">
      <span class="hero-chip">IVELT.COM • איינגעלאגט • MEMBERS</span>
      <h1>אידישע וועלט פארומס</h1>
      <p>Ivelt.com • Live Yiddish World Forums &amp; Portal</p>
    </div>
  </header>`;
}

function currentPosts() {
  const src = activeSource();
  const e = state.feeds[src.key];
  const posts = e ? e.posts : [];
  const q = state.query.trim().toLowerCase();
  if (!q) return posts;
  return posts.filter(p => [p.cleanTitle, p.plainExcerpt, p.author, p.categoryName].some(s => (s || '').toLowerCase().includes(q)));
}

function freshBar() {
  if (state.board) {
    const e = state.feeds[activeSource().key];
    if (!e || e.age == null) return '';
    const w = ageWords(e.age);
    return `<div class="fresh">${ic('clock', 's14')}<span>דערהיינטיגט ${esc(w.yi)}</span><span class="en" dir="ltr">· updated ${esc(w.en)}</span></div>`;
  }
  const m = state.meta;
  if (!m || !m.updatedAt) return '';
  const age = Math.max(0, m.now - m.updatedAt + Math.round((Date.now() - m.gotAt) / 1000));
  const w = ageWords(age);
  let extra = '';
  if (state.updating) extra = `<span class="upd"><span class="mini-spin"></span>ברענגט נייע…</span>`;
  else if (!refresherOnline() && age > 1800) extra = `<span class="sleep">דער לייענער רוט יעצט — דאס איז די לעצטע קאפיע</span>`;
  return `<div class="fresh ${age > 3600 ? 'old' : ''}">${ic('clock', 's14')}<span>דערהיינטיגט ${esc(w.yi)}</span><span class="en" dir="ltr">· updated ${esc(w.en)}</span>${extra}</div>`;
}
function lockedNotice(src) {
  return `<section class="notice" aria-labelledby="lockT">
    <div class="big">${ic('lock')}</div>
    <h2 id="lockT">די אפ איז ארויסגעלאגט פון אייוועלט</h2>
    <p>אייוועלט האט ארויסגעלאגט דעם לייענער פון דער אפ. זאגט Tab, און ס'וועט ווערן געפיקסט. ביז דאן קענט איר לייענען גלייך אויף אייוועלט.</p>
    <p class="small" dir="ltr" style="text-align:left">Ivelt signed the reader out. Tell Tab and it will be fixed; meanwhile open Ivelt directly.</p>
    <div class="btns">
      <button class="btn" data-act="ext" data-link="${esc(src.page)}" data-title="${esc(src.label)}">${ic('open', 's18')}עפן "${esc(src.label)}"</button>
      <button class="btn outline" data-act="refresh">${ic('refresh', 's18')}פרובירט נאכאמאל</button>
    </div>
  </section>`;
}
function feedBody() {
  const src = activeSource();
  const e = state.feeds[src.key];
  const posts = currentPosts();
  let html = '';
  if (e && e.stale && posts.length) html += `<div class="wrap"><p class="small" style="margin:0">קיין פארבינדונג — ווייזט די לעצטע אפגעהיטענע ווערסיע.</p></div>`;
  if (state.board && state.board.pages > 1 && posts.length) html = boardPager() + html;
  if (posts.length) return html + `<div class="list">${posts.map(p => postCard(p, state.reader && state.reader.link === p.link)).join('')}</div>` + (state.board && state.board.pages > 1 ? boardPager() : '');
  if (e && e.kind === 'ok' && state.query) return `<div class="state">${ic('search')}<h2>גארנישט געטראפן</h2><p>פרובירט אן אנדער ווארט.</p></div>`;
  if (e && e.kind === 'ok' && !state.board && state.filter === 'unread') return `<div class="state">${ic('forum')}<h2>אלעס געליינט ✓</h2><p>אין די אקטיווע אשכולות איז נישטא קיין נייע תגובות וואס איר האט נאך נישט געליינט.</p></div>`;
  if (e && e.kind === 'ok') return `<div class="state">${ic('forum')}<h2>יעצט נישטא קיין אשכולות דא</h2></div>`;
  if (loginBroken() || (e && e.kind === 'locked')) return lockedNotice(src);
  if (!e || state.refreshing || e.kind === 'loading' || e.kind === 'waiting') {
    return `<div class="state"><div class="spinner" role="progressbar" aria-label="לאדנט"></div><p>${state.board ? 'ברענגט דעם פארום פון אייוועלט… (ביז א האלבע מינוט)' : 'ברענגט די לעצטע פאסטס פון אייוועלט…'}</p></div>`;
  }
  if (e.kind === 'asleep') {
    return `<section class="notice"><div class="big">${ic('clock')}</div><h2>דער פארום איז נאך נישט געקומען</h2>
      <p>דער לייענער רוט יעצט, דעריבער קען ער אים יעצט נישט ברענגען. פרובירט שפעטער, אדער עפנט אים גלייך אויף אייוועלט.</p>
      <div class="btns"><button class="btn" data-act="ext" data-link="${esc(src.page)}">${ic('open', 's18')}עפן אויף אייוועלט</button><button class="btn outline" data-act="refresh">פרובירט נאכאמאל</button></div></section>`;
  }
  return `<section class="notice">
      <div class="big">${ic('wifiOff')}</div>
      <h2>מ'קען יעצט נישט ברענגען דעם פיד</h2>
      <p>${e.kind === 'offline' ? 'איר זענט נישט פארבונדן צום אינטערנעט.' : 'דער סערווער האט נישט געענטפערט.'}</p>
      <div class="btns"><button class="btn" data-act="refresh">פרובירט נאכאמאל</button><button class="btn outline" data-act="ext" data-link="${BASE}">עפן דעם פולן פארום</button></div>
    </section>`;
}
function boardPager() {
  const b = state.board; if (!b || !b.pages) return '';
  return `<div class="pager">
    <button class="btn outline sm" data-act="bpage" data-d="-1" ${b.page <= 1 ? 'disabled' : ''}>‹ פריערדיגע</button>
    <span class="small">בלאט ${b.page} פון ${b.pages}</span>
    <button class="btn outline sm" data-act="bpage" data-d="1" ${b.page >= b.pages ? 'disabled' : ''}>קומענדיגע ›</button>
  </div>`;
}
function feedScreen() {
  const chips = state.board
    ? `<div class="board-banner"><div style="flex:1;min-width:0"><div class="t">${esc(state.board.name || '')}</div><div class="s">פארום · Forum</div></div><button class="icon-btn" data-act="ext" data-link="${esc(BASE + 'viewforum.php?f=' + state.board.f)}" aria-label="עפן אויף אייוועלט">${ic('open')}</button><button class="icon-btn" data-act="clearBoard" aria-label="צוריק צום הויפט פיד">${ic('close')}</button></div>`
    : `<div class="chips" role="toolbar" aria-label="פיד סארטן">${FILTERS.map(f => `<button class="chip" data-act="filter" data-id="${f.id}" aria-pressed="${state.filter === f.id}">${esc(f.yi)}${f.id === 'unread' && state.feeds.unread && state.feeds.unread.posts ? ' (' + state.feeds.unread.posts.length + ')' : ''} • <span dir="ltr">${esc(f.en)}</span></button>`).join('')}</div>`;
  return hero() + `<div class="wrap feed-top stack">
      <label class="search">${ic('search')}<input id="q" type="search" value="${esc(state.query)}" placeholder="זוכט אשכולות, פארומס אדער שרייבער…" aria-label="זוכן" autocomplete="off">${state.query ? `<button class="icon-btn" data-act="clearQ" aria-label="מעק אויס">${ic('close')}</button>` : ''}</label>
      ${chips}
      ${freshBar()}
      ${state.refreshing && !state.updating ? '<div class="progress" role="progressbar" aria-label="לאדנט"></div>' : ''}
    </div>
    <div style="height:8px"></div>
    <div id="feedBody">${feedBody()}</div>`;
}

function threadBody(post) {
  const th = state.thread;
  if (!th || th.t !== post.t) return `<div class="state"><div class="spinner"></div></div>`;
  const d = th.data;
  let top = '';
  if (d) {
    const per = d.per || 25;
    const pg = `<div class="pager">
      <button class="btn outline sm" data-act="tpage" data-start="0" ${d.page <= 1 ? 'disabled' : ''} aria-label="ערשטע בלאט">«</button>
      <button class="btn outline sm" data-act="tpage" data-start="${Math.max(0, (d.page - 2) * per)}" ${d.page <= 1 ? 'disabled' : ''}>‹</button>
      <span class="small">בלאט ${d.page} פון ${d.pages}</span>
      <button class="btn outline sm" data-act="tpage" data-start="${d.page * per}" ${d.page >= d.pages ? 'disabled' : ''}>›</button>
      <button class="btn outline sm" data-act="tpage" data-start="${(d.pages - 1) * per}" ${d.page >= d.pages ? 'disabled' : ''} aria-label="לעצטע בלאט">»</button>
    </div>`;
    const w = ageWords(th.age);
    const status = th.waiting ? `<div class="fresh"><span class="mini-spin"></span><span>ברענגט די נייסטע…</span></div>` : (w ? `<div class="fresh">${ic('clock', 's14')}<span>דערהיינטיגט ${esc(w.yi)}</span><span class="en" dir="ltr">· updated ${esc(w.en)}</span></div>` : '');
    const posts = (d.posts || []).filter(p => p.id && (p.author || (p.html || '').replace(/<[^>]+>/g, '').trim())).map(p => `<article class="post">
        <div class="phead"><span class="pauth">${ic('person', 's16')}${esc(p.author || '')}</span><span class="time">${esc(relTime(p.time))}</span></div>
        <div class="pbody" dir="auto">${sanitize(p.html)}</div>
        <div class="pfoot"><button class="btn text sm" data-act="ext" data-link="${esc(BASE + 'viewtopic.php?p=' + p.id + '#p' + p.id)}">ענטפערן אויף אייוועלט</button></div>
      </article>`).join('');
    if (d.missing && !(d.posts || []).length) return status + `<p class="small">${esc(d.missing)}</p>`;
    return status + (d.pages > 1 ? pg : '') + `<div class="posts">${posts}</div>` + (d.pages > 1 ? pg : '');
  }
  if (th.loading || th.waiting) return `<div class="state"><div class="spinner" role="progressbar" aria-label="לאדנט"></div><p>ברענגט דעם אשכול פון אייוועלט… (ביז א האלבע מינוט)</p></div>`;
  if (th.status && th.status.loggedIn === false) return lockedNotice({ page: post.link, label: post.cleanTitle });
  return `<div class="notice"><h2>דער אשכול איז נאך נישט געקומען</h2><p>${th.error ? 'קיין פארבינדונג מיטן סערווער.' : 'דער לייענער רוט יעצט, דעריבער קען ער יעצט נישט ברענגען נייע אשכולות.'} פרובירט שפעטער, אדער עפנט אים גלייך אויף אייוועלט.</p>
    <div class="btns"><button class="btn" data-act="ext" data-link="${esc(topicLink(post.t, th.start))}">${ic('open', 's18')}עפן אויף אייוועלט</button><button class="btn outline" data-act="tpage" data-start="${th.start}">פרובירט נאכאמאל</button></div></div>`;
}
function readerPane(post, withBack) {
  if (!post) return `<div class="state" style="height:100%;justify-content:center"><h2 style="opacity:.5;font-size:24px">אידישע וועלט פארומס</h2></div>`;
  if (!post.t) { const m = String(post.link || '').match(/ivelt\.com\/forum\/viewtopic\.php\?(?:.*&)?t=(\d+)/); if (m) post.t = parseInt(m[1], 10); }
  const saved = isSaved(post.link);
  const isThread = !!post.t;
  const body = isThread ? '' : (htmlToReadableText(post.contentHtml) || post.plainExcerpt || '');
  const time = post.fromShare ? 'געהאלטן ' + relTime(post.savedAt ? new Date(post.savedAt).toISOString() : post.publishedRaw) : (post.fixedTime || relTime(post.publishedRaw));
  const head = isThread && state.thread && state.thread.data && state.thread.t === post.t ? state.thread.data : null;
  return `<section class="reader" aria-label="לייענער">
    <div class="rbar">
      <div class="l">${withBack ? `<button class="icon-btn" data-act="closeReader" aria-label="צוריק">${ic('back', 'flip')}</button>` : ''}<span class="cat">${esc((head && head.forum) || post.categoryName || '')}</span></div>
      <div class="r">
        <button class="icon-btn fbtn" data-act="font" data-d="-0.08" aria-label="קלענערע אותיות">א−</button>
        <button class="icon-btn fbtn" data-act="font" data-d="0.08" aria-label="גרעסערע אותיות">א+</button>
        <button class="icon-btn ${saved ? 'on' : ''}" style="${saved ? 'color:var(--secondary)' : ''}" data-act="save" data-link="${esc(post.link)}" aria-label="${saved ? 'נעם אראפ פון געהאלטן' : 'היט אפליין'}">${ic(saved ? 'bookmark' : 'bookmarkO')}</button>
        <button class="icon-btn" data-act="share" data-link="${esc(post.link)}" aria-label="שיקן דעם לינק">${ic('share')}</button>
      </div>
    </div>
    <div class="rbody">
      <h1 dir="auto">${esc((head && head.title) || post.cleanTitle)}</h1>
      ${isThread ? (post.replies ? `<div class="meta"><span class="by">${post.replies} תגובות · ${post.views.toLocaleString('en-US')} געזען</span>${post.firstAuthor ? `<span class="t">אנגעהויבן פון ${esc(post.firstAuthor)}</span>` : ''}</div>` : '') : `<div class="meta">${post.author ? `<span class="by">געשריבן פון ${esc(post.author)}</span>` : `<span class="by">${post.fromShare ? 'געהאלטן פון אייוועלט' : ''}</span>`}${time ? `<span class="t">${esc(time)}</span>` : ''}</div>`}
      <hr>
      ${isThread ? `<div class="thread">${threadBody(post)}</div>` : (body ? `<div class="rtext" dir="auto">${esc(body)}</div>` : `<p class="small">דער גאנצער טעקסט ליגט אויף אייוועלט.</p>`)}
      <div style="height:4px"></div>
      <button class="btn wide" data-act="ext" data-link="${esc(isThread && state.thread && state.thread.t === post.t ? topicLink(post.t, state.thread.start) : post.link)}" data-title="${esc(post.cleanTitle)}">${ic('open', 's18')}עפן אויף אייוועלט און ענטפערן</button>
    </div>
  </section>`;
}

function boardsScreen() {
  const cats = (state.snap && state.snap.cats) || [];
  const shortcuts = [
    ['אקטיווע אשכולות • Active Topics', ACTIVE_TOPICS_URL],
    ['נייע תגובות • New Posts', NEW_POSTS_URL],
    ['אומגעענטפערטע • Unanswered', UNANSWERED_URL],
    ['הויפט בלאט • Main Index', BASE]
  ];
  const body = cats.length ? cats.map(c => `<section class="panel cat-panel"><h2>${esc(c.name)}</h2>
      ${c.forums.map(f => `<article class="board" data-act="boardFeed" data-f="${f.f}" data-name="${esc(f.name)}" tabindex="0">
        <div class="board-head"><div class="bico">${ic('forum')}</div><div style="flex:1;min-width:0"><h3>${esc(f.name)}</h3>${f.desc ? `<div class="en" dir="auto">${esc(f.desc)}</div>` : ''}</div></div>
        <div class="row small"><span>${f.topics.toLocaleString('en-US')} אשכולות · ${f.posts.toLocaleString('en-US')} תגובות</span>${f.lastTime ? `<span>${esc(relTime(f.lastTime))}</span>` : ''}</div>
      </article>`).join('')}</section>`).join('')
    : `<div class="state"><div class="spinner"></div><p>ברענגט די פארומס…</p></div>`;
  return `<div class="page">
    <div class="ph"><h1>פארום אפטיילונגען</h1><p class="small" dir="ltr" style="text-align:right;margin:0">Forum Directory</p><p>דריקט אויף א פארום צו לייענען זיינע אשכולות דא אין דער אפ.</p></div>
    <section class="panel"><h2>שנעלע לינקס אויף אייוועלט</h2><div class="flow">
      ${shortcuts.map(([l, u]) => `<button class="assist" data-act="ext" data-link="${u}" data-title="${esc(l)}">${ic('bolt', 's16')}${esc(l)}</button>`).join('')}
    </div></section>
    ${body}
  </div>`;
}

function portalScreen() {
  const quick = [
    ['home', 'הויפט בלאט', BASE], ['bolt', 'אקטיווע אשכולות', ACTIVE_TOPICS_URL], ['feed', 'נייע תגובות', NEW_POSTS_URL],
    ['forum', 'אומגעענטפערטע', UNANSWERED_URL], ['person', 'מיין קאנטראל צימער', BASE + 'ucp.php'], ['lock', 'לאגין', LOGIN_URL]
  ];
  const hist = state.history.length
    ? `<section class="panel"><div class="row"><h2>לעצטנס געעפנט</h2><button class="btn text" data-act="clearHist">${ic('sweep', 's18')}מעק אויס</button></div><div class="hist">
      ${state.history.map(h => `<button class="hitem" data-act="ext" data-link="${esc(h.url)}" data-title="${esc(h.title)}">${ic('open', 's18')}<span class="tx"><span class="tt">${esc(h.title)}</span><span class="uu">${esc(prettyUrl(h.url))}</span></span></button>`).join('')}
    </div></section>` : '';
  return `<form class="pbar" data-form="portal" role="search">
      <button type="button" class="icon-btn" data-act="ext" data-link="${BASE}" data-title="הויפט בלאט" aria-label="אייוועלט היים">${ic('home')}</button>
      <label class="pfield"><input id="pq" type="text" enterkeyhint="go" placeholder="פארום נומער אדער זוך-ווארט…" aria-label="פארום נומער אדער זוך-ווארט"></label>
      <button type="submit" class="icon-btn" aria-label="גיין">${ic('back', '')}</button>
    </form>
    <div class="page">
      <div class="ph"><h1>אייוועלט פארטאל</h1><p>דער פולער פארום עפנט זיך אין Chrome, איינגעלאגט ווי געווענליך. דארט קענט איר לייענען, ענטפערן און שיקן פריוואטע מעסעדזשעס. אייוועלט לאזט זיך נישט עפענען אינעווייניג אין אנדערע אפס.</p></div>
      <section class="panel"><h2>גיי צו</h2><div class="flow">
        ${quick.map(([i, l, u]) => `<button class="assist" data-act="ext" data-link="${u}" data-title="${esc(l)}">${ic(i, 's18')}${esc(l)}</button>`).join('')}
      </div></section>
      <section class="panel"><h2>ווי אזוי צו זוכן</h2><p class="small" style="margin:0">א נומער (למשל <b>6</b>) עפנט יענעם פארום. <b>t=12345</b> עפנט אן אשכול. א לינק פון אייוועלט עפנט זיך גלייך. יעדעס אנדערע ווארט זוכט אויף אייוועלט.</p></section>
      ${hist}
    </div>`;
}
function portalTarget(q) {
  q = q.trim();
  if (!q) return null;
  if (/^https?:\/\//i.test(q)) return q;
  if (/^(www\.)?ivelt\.com/i.test(q)) return 'https://' + q;
  let m;
  if ((m = q.match(/^t\s*=\s*(\d+)$/i))) return BASE + 'viewtopic.php?t=' + m[1];
  if ((m = q.match(/^p\s*=\s*(\d+)$/i))) return BASE + 'viewtopic.php?p=' + m[1] + '#p' + m[1];
  if ((m = q.match(/^f?\s*=?\s*(\d+)$/i))) return BASE + 'viewforum.php?f=' + m[1];
  return BASE + 'search.php?keywords=' + encodeURIComponent(q);
}

function savedList() {
  return `<div class="page">
    <div class="ph-row"><div class="ph"><h1>אפליין אשכולות</h1><p>געהאלטן אויף אייער טעלעפאן, צו לייענען אלעמאל.</p></div>
      ${state.saved.length ? `<button class="btn text" data-act="clearSaved">${ic('sweep', 's18')}מעק אלעס</button>` : ''}</div>
    <details class="panel"><summary class="lbl" style="cursor:pointer">${ic('add', 's18')} לייגט צו א לינק</summary>
      <form class="addform" data-form="add" style="margin-top:10px">
        <input class="tf ltr" id="addUrl" type="url" inputmode="url" placeholder="https://www.ivelt.com/forum/viewtopic.php?t=…" required aria-label="לינק">
        <input class="tf" id="addTitle" type="text" placeholder="טיטל (אויב איר ווילט)" aria-label="טיטל">
        <button class="btn" type="submit">היט</button>
      </form></details>
    ${state.saved.length ? '' : `<div class="state">${ic('books')}<h2>נאך קיין געהאלטענע אשכולות</h2><p>דריקט דעם בוקמארק אויף א פאוסט אין פיד. אדער, ווען איר לייענט אן אשכול אויף אייוועלט, דריקט ⋮ ← Share ← Ivelt, און ער וועט זיך האלטן דא.</p></div>`}
  </div>
  ${state.saved.length ? `<div class="list" style="padding-top:0">${state.saved.map(p => postCard(p, state.reader && state.reader.link === p.link)).join('')}</div>` : ''}`;
}

function settingsSheet() {
  const opt = [['system', 'סיסטעם'], ['light', 'פערמעט'], ['dark', 'מיטערנאכט']];
  return `<div class="sheet" role="dialog" aria-modal="true" aria-labelledby="stTitle">
    <div class="handle"></div>
    <h2 id="stTitle">אויסזען און איינשטעלונגען</h2>
    <div class="stack"><span class="lbl">קאליר טעמע</span><div class="seg">${opt.map(([k, l]) => `<button data-act="theme" data-v="${k}" aria-pressed="${prefs.theme === k}">${l}</button>`).join('')}</div></div>
    <div class="stack" style="gap:6px"><div class="row"><span class="lbl">לייענער אותיות גרייס</span><b style="color:var(--primary)" id="scaleV">${Math.round(prefs.scale * 100)}%</b></div>
      <input type="range" id="scale" min="0.85" max="1.5" step="0.01" value="${prefs.scale}" aria-label="לייענער אותיות גרייס"></div>
    ${state.installEvt ? `<button class="btn" data-act="install">${ic('download', 's18')}אינסטאלירט די אפ אויפן טעלעפאן</button>` : ''}
    <button class="btn outline" data-act="closeSheet">פארטיק</button>
  </div>`;
}

/* ---------- main render ---------- */
const wide = () => window.innerWidth >= 840;
function render() {
  renderNav();
  const main = document.getElementById('main');
  const keepQ = document.activeElement && document.activeElement.id === 'q';
  const caret = keepQ ? document.activeElement.selectionStart : 0;
  let html = '';
  const readerTabs = state.tab === 'feed' || state.tab === 'saved';
  if (readerTabs && state.reader && !wide()) {
    html = readerPane(state.reader, true);
  } else if (state.tab === 'feed') {
    const detail = state.reader || null;
    html = detail ? `<div class="split"><div class="pane-l">${feedScreen()}</div><div class="pane-r">${readerPane(detail, false)}</div></div>` : `<div class="solo">${feedScreen()}</div>`;
  } else if (state.tab === 'saved') {
    const detail = state.reader || state.saved[0] || null;
    html = state.saved.length ? `<div class="split"><div class="pane-l">${savedList()}</div><div class="pane-r">${readerPane(detail, false)}</div></div>` : savedList();
  } else if (state.tab === 'boards') html = boardsScreen();
  else html = portalScreen();
  main.innerHTML = html;
  if (keepQ) { const q = document.getElementById('q'); if (q) { q.focus(); try { q.setSelectionRange(caret, caret); } catch (_) {} } }
}

function findPost(link) {
  const src = activeSource();
  const pools = [(state.feeds[src.key] || {}).posts || [], state.saved];
  for (const pool of pools) { const p = pool.find(x => x.link === link); if (p) return p; }
  for (const k in state.feeds) { const p = (state.feeds[k].posts || []).find(x => x.link === link); if (p) return p; }
  return null;
}

/* ---------- events ---------- */
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]');
  if (!el) return;
  const act = el.dataset.act;
  if (act !== 'read') e.stopPropagation();
  switch (act) {
    case 'tab': selectTab(el.dataset.tab); break;
    case 'filter': state.filter = el.dataset.id; state.board = null; state.reader = null; render(); if (!state.snap) refresh(); break;
    case 'refresh': refresh(true); break;
    case 'clearQ': state.query = ''; render(); break;
    case 'clearBoard': state.board = null; state.reader = null; render(); refresh(); break;
    case 'read': {
      if (e.target.closest('button')) return;
      const p = findPost(el.dataset.link); if (!p) return;
      state.reader = p; openThread(p); if (!wide()) window.scrollTo(0, 0); break;
    }
    case 'closeReader': state.reader = null; render(); break;
    case 'ext': openExternal(el.dataset.link, el.dataset.title); if (state.tab === 'portal') render(); break;
    case 'save': { const p = findPost(el.dataset.link); if (p) toggleSave(p); break; }
    case 'share': { const p = findPost(el.dataset.link) || state.reader; if (p) sharePost(p); break; }
    case 'font': prefs.scale = Math.min(1.5, Math.max(0.85, Math.round((prefs.scale + parseFloat(el.dataset.d)) * 100) / 100)); savePrefs(); break;
    case 'boardFeed': {
      state.board = { f: parseInt(el.dataset.f, 10), name: el.dataset.name, start: 0 };
      state.tab = 'feed'; state.reader = null; state.query = ''; window.scrollTo(0, 0); refresh(); break;
    }
    case 'bpage': {
      const b = state.board; if (!b) break;
      const np = Math.min(b.pages || 1, Math.max(1, (b.page || 1) + parseInt(el.dataset.d, 10)));
      b.start = (np - 1) * (b.per || 50); window.scrollTo(0, 0); refresh(); break;
    }
    case 'tpage': {
      const p = state.reader; if (!p) break;
      openThread(p, parseInt(el.dataset.start, 10) || 0);
      const rb = document.querySelector('.reader'); if (rb && rb.scrollIntoView) rb.scrollIntoView(); else window.scrollTo(0, 0); break;
    }
    case 'clearSaved': if (confirm('אויסמעקן אלע געהאלטענע אשכולות?')) { state.saved = []; LS.set('saved', []); state.reader = null; render(); } break;
    case 'clearHist': state.history = []; LS.set('history', []); render(); break;
    case 'settings': openSheet(); break;
    case 'closeSheet': closeSheet(); break;
    case 'theme': prefs.theme = el.dataset.v; savePrefs(); openSheet(); break;
    case 'install': doInstall(); break;
  }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target.matches && e.target.matches('.card')) { e.target.click(); }
  if (e.key === 'Escape') { if (!document.getElementById('sheet').hidden) closeSheet(); else if (state.reader) { state.reader = null; render(); } }
});
document.addEventListener('input', e => {
  if (e.target.id === 'q') {
    state.query = e.target.value;
    const fb = document.getElementById('feedBody'); if (fb) fb.innerHTML = feedBody();
  } else if (e.target.id === 'scale') {
    prefs.scale = parseFloat(e.target.value); savePrefs();
    const v = document.getElementById('scaleV'); if (v) v.textContent = Math.round(prefs.scale * 100) + '%';
  }
});
document.addEventListener('submit', e => {
  const f = e.target.dataset.form;
  if (!f) return;
  e.preventDefault();
  if (f === 'portal') {
    const u = portalTarget(document.getElementById('pq').value);
    if (u) { openExternal(u); render(); }
  } else if (f === 'add') {
    const url = document.getElementById('addUrl').value.trim();
    const title = document.getElementById('addTitle').value.trim();
    if (!/^https?:\/\//i.test(url)) { toast('שרייבט א גאנצן לינק'); return; }
    if (!isSaved(url)) { state.saved = [makeSavedFromLink(url, title, '')].concat(state.saved); LS.set('saved', state.saved); }
    toast('געהאלטן ✓'); render();
  }
});
window.addEventListener('popstate', () => { if (state.reader) { state.reader = null; render(); } });

function openSheet() {
  const s = document.getElementById('sheet');
  s.innerHTML = settingsSheet(); s.hidden = false;
  s.onclick = ev => { if (ev.target === s) closeSheet(); };
}
function closeSheet() { const s = document.getElementById('sheet'); s.hidden = true; s.innerHTML = ''; }

/* ---------- install / service worker ---------- */
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); state.installEvt = e; render(); });
window.addEventListener('appinstalled', () => { state.installEvt = null; render(); toast('די אפ איז אינסטאלירט ✓'); });
async function doInstall() {
  const ev = state.installEvt;
  if (!ev) { toast('אין Chrome: ⋮ ← "Add to Home screen" ← Install'); return; }
  ev.prompt();
  try { await ev.userChoice; } catch (_) {}
  state.installEvt = null; closeSheet(); render();
}
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => { navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {}); });
}
let lastW = window.innerWidth;
window.addEventListener('resize', () => { const w = window.innerWidth; if ((w >= 840) !== (lastW >= 840) || (w >= 600) !== (lastW >= 600)) render(); lastW = w; });

/* ---------- boot ---------- */
applyTheme();
handleIncomingShare();
if (state.snap) for (const f of FILTERS) state.feeds[f.id] = { posts: listFromSnap(state.snap, f.id), kind: 'ok' };
render();
refresh();
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && !state.refreshing && !state.board && state.meta && (Date.now() - state.meta.gotAt) > 120000) refresh();
});
setInterval(() => { if (document.visibilityState === 'visible' && !state.refreshing && state.tab === 'feed' && !state.board) { const fb = document.querySelector('.fresh'); if (fb && state.meta) { const tmp = document.createElement('div'); tmp.innerHTML = freshBar(); if (tmp.firstElementChild) fb.replaceWith(tmp.firstElementChild); } } }, 30000);
document.addEventListener('error', e => {
  const im = e.target;
  if (im && im.tagName === 'IMG' && im.closest('.pbody')) {
    const alt = im.getAttribute('alt') || '';
    if (im.classList.contains('smilies') || alt.length < 6) im.replaceWith(document.createTextNode(alt));
    else { const a = document.createElement('a'); a.href = im.src; a.target = '_blank'; a.rel = 'noopener'; a.textContent = '🖼 ' + alt; im.replaceWith(a); }
  }
}, true);
window.__ivelt = { state, parseFeed, parseHtmlTopics, portalTarget, makeSavedFromLink };
})();
