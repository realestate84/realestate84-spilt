// 깃허브에 올릴 때마다 날짜+번호를 바꿔주세요 → 앱이 자동으로 최신 버전 감지
const CACHE_VERSION = '2026-03-14-230255';
const CACHE_NAME = 'sarom-realestate-' + CACHE_VERSION;
const STATIC_ASSETS = [
  '/realestate84/',
  '/realestate84/index.html',
  '/realestate84/manifest.json'
];

// 설치: 즉시 새 버전으로 활성화
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// 활성화: 이전 버전 캐시 모두 삭제 + 열린 탭에 업데이트 알림
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) { return key !== CACHE_NAME; })
            .map(function(key) { return caches.delete(key); })
      );
    }).then(function() {
      // 열려있는 모든 탭에 새 버전 알림 전송
      return self.clients.matchAll({ includeUncontrolled: true }).then(function(clients) {
        clients.forEach(function(client) {
          client.postMessage({ type: 'SW_UPDATED', version: CACHE_VERSION });
        });
      });
    })
  );
  self.clients.claim();
});

// 네트워크 우선, 실패 시 캐시 사용
self.addEventListener('fetch', function(event) {
  if (!event.request.url.startsWith(self.location.origin)) return;
  event.respondWith(
    fetch(event.request)
      .then(function(response) {
        var clone = response.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(event.request, clone);
        });
        return response;
      })
      .catch(function() {
        return caches.match(event.request);
      })
  );
});
