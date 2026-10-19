importScripts('https://www.gstatic.com/firebasejs/11.4.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.4.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyClEZ8LT66frcNRXSMnQR8LD4muLg4hIsw",
  projectId: "mythic-impact-fv9wh",
  messagingSenderId: "767132066403",
  appId: "1:767132066403:web:5e20f97766ec2557064e56"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification?.title || 'Anointing Ministries';
  const notificationOptions = {
    body: payload.notification?.body || 'New update from Anointing Ministries.',
    icon: '/images/anointing-logo.jpg',
    badge: '/images/anointing-logo.jpg',
    data: { url: payload.data?.url || '/' }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
