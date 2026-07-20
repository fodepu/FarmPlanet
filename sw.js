// 네트워크 우선(항상 최신), 오프라인 시 캐시 · 외부(카카오·파이어베이스 등) 요청은 간섭 안 함
const C='farmplanet-v3';
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png','./favicon.png'])));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k))))); self.clients.claim();});
self.addEventListener('fetch',e=>{
 const url=new URL(e.request.url);
 if(e.request.method!=='GET' || url.origin!==location.origin) return; // 외부 도메인·비GET은 그대로 통과
 e.respondWith(fetch(e.request).then(res=>{
   const cl=res.clone(); caches.open(C).then(c=>c.put(e.request,cl)); return res;
 }).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html'))));
});

/* ── 푸시 수신: 앱이 꺼져 있어도 잠금화면/배너에 알림 표시 ── */
self.addEventListener('push',e=>{
 let d={};
 try{ d=e.data?e.data.json():{}; }catch(err){ d={body:(e.data&&e.data.text())||''}; }
 e.waitUntil(self.registration.showNotification(d.title||'FarmPlanet',{
   body:d.body||'', icon:'./icon-192.png', badge:'./favicon.png',
   tag:d.tag||'farmplanet', renotify:true,
   data:{url:d.url||'./'}
 }));
});

/* ── 알림 탭: 이미 열린 앱이 있으면 그 창으로, 없으면 새로 열기 ── */
self.addEventListener('notificationclick',e=>{
 e.notification.close();
 const target=(e.notification.data&&e.notification.data.url)||'./';
 e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(ws=>{
   for(const w of ws){ if('focus' in w){ w.focus(); if(w.navigate)w.navigate(target).catch(()=>{}); return; } }
   if(clients.openWindow)return clients.openWindow(target);
 }));
});
