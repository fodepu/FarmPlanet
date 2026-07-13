// 네트워크 우선(항상 최신), 오프라인 시 캐시 · 외부(카카오·파이어베이스 등) 요청은 간섭 안 함
const C='farmplanet-v2';
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png','./favicon.png'])));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k))))); self.clients.claim();});
self.addEventListener('fetch',e=>{
 const url=new URL(e.request.url);
 if(e.request.method!=='GET' || url.origin!==location.origin) return; // 외부 도메인·비GET은 그대로 통과
 e.respondWith(fetch(e.request).then(res=>{
   const cl=res.clone(); caches.open(C).then(c=>c.put(e.request,cl)); return res;
 }).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html'))));
});
