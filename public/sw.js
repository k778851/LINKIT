/* LINKIT Service Worker — Web Push 수신 처리 */

self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: 'LINKIT', body: event.data.text(), data: { path: '/' } };
  }

  const title = payload.title ?? 'LINKIT';
  const options = {
    body:  payload.body  ?? '',
    icon:  payload.icon  ?? '/icon-192.png',
    badge: '/icon-96.png',
    data:  payload.data  ?? { path: '/' },
    vibrate: [200, 100, 200],
    tag: 'linkit-notification',
    renotify: true,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const path = event.notification.data?.path ?? '/';
  const url  = new URL(path, self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // 이미 열린 탭이 있으면 포커스 + 이동
      for (const client of windowClients) {
        if (client.url.startsWith(self.location.origin)) {
          client.focus();
          client.navigate(url);
          return;
        }
      }
      // 없으면 새 탭 열기
      return clients.openWindow(url);
    })
  );
});

self.addEventListener('install',  () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(clients.claim()));
