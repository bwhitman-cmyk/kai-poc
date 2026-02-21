const CACHE = "kai-cache-v4";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./Sw.js"
];
self.addEventListener("install", (e)=>{
  e.waitUntil(caches.open(CACHE).then(c=> c.addAll(ASSETS)).then(()=> self.skipWaiting()));
});

self.addEventListener("activate", (e)=>{
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => k === CACHE ? null : caches.delete(k))))
      .then(()=> self.clients.claim())
  );
});

self.addEventListener("fetch", (e)=>{
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request).then(net=>{
      // cache new GET requests (best-effort)
      if(e.request.method === "GET"){
        const copy = net.clone();
        caches.open(CACHE).then(c=> c.put(e.request, copy)).catch(()=>{});
      }
      return net;
    }).catch(()=> res))
  );
});
