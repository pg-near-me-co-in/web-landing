
const CACHE = 'pgnearme-v1';
const SHELL = [
  'index.html','search.html','property.html','login.html','list-property.html','dashboard.html',
  'manifest.json','icons/icon-192.png','icons/icon-512.png'
];

self.addEventListener('install', (e)=>{
  e.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (e)=>{
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e)=>{
  if(e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      const fetchPromise = fetch(e.request).then(networkResp => {
        caches.open(CACHE).then(cache => cache.put(e.request, networkResp.clone()));
        return networkResp;
      }).catch(()=> cached);
      return cached || fetchPromise;
    })
  );
});
