// network-first: 최신 버전 우선, 오프라인이면 캐시
const C='mt-v4';self.addEventListener('install',()=>self.skipWaiting());self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x))))));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(fetch(e.request).then(n=>{if(n.ok){const c=n.clone();caches.open(C).then(x=>x.put(e.request,c));}return n}).catch(()=>caches.match(e.request)))});
