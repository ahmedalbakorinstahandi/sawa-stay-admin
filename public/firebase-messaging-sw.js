// firebase-messaging-sw.js
// Service Worker for handling Firebase Cloud Messaging

// Import Firebase scripts for service workers
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBo9sHidF-_V38zsotGyd0Bd6oNKFeZCnU",
  authDomain: "sawa-stay.firebaseapp.com",
  projectId: "sawa-stay",
  storageBucket: "sawa-stay.firebasestorage.app",
  messagingSenderId: "681169637490",
  appId: "1:681169637490:web:f3e5b8b79924e614b0b2eb",
  measurementId: "G-XHG89E253B"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get messaging instance
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);
  
  const notificationTitle = payload.notification?.title || 'إشعار جديد';
  const notificationOptions = {
    body: payload.notification?.body || 'لديك إشعار جديد',
    icon: '/logo.png',
    badge: '/logo.png',
    data: payload.data || {},
    tag: 'sawa-stay-notification',
    requireInteraction: true,
    actions: [
      {
        action: 'open',
        title: 'فتح',
        icon: '/logo.png'
      },
      {
        action: 'close',
        title: 'إغلاق'
      }
    ]
  };

  // Send message to main thread if app is open
  self.clients.matchAll({
    type: 'window',
    includeUncontrolled: true
  }).then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'NOTIFICATION_RECEIVED',
        payload: payload
      });
    });
  });

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click received.');

  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  // Handle the click event - open the app
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {
      // Check if the app is already open
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes('/dashboard') && 'focus' in client) {
          return client.focus();
        }
      }
      
      // If not open, open a new window
      if (clients.openWindow) {
        return clients.openWindow('/dashboard');
      }
    })
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('[firebase-messaging-sw.js] Notification closed:', event.notification.tag);
});

// Service Worker installation
self.addEventListener('install', (event) => {
  console.log('[firebase-messaging-sw.js] Service Worker installed');
  self.skipWaiting();
});

// Service Worker activation
self.addEventListener('activate', (event) => {
  console.log('[firebase-messaging-sw.js] Service Worker activated');
  event.waitUntil(self.clients.claim());
});
