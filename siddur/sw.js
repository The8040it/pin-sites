const C='siddur-v1';const A=['./','./index.html','./s1.bin','./s2.bin','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(A)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return;
const key=new URL(r.url).pathname;
e.respondWith(caches.open(C).then(c=>c.match(key).then(hit=>{const net=fetch(r).then(res=>{if(res.ok)c.put(key,res.clone());return res}).catch(()=>hit);return hit||net})));});
