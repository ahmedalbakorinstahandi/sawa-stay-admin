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

  // Check if any client window is visible and focused
  return self.clients.matchAll({
    type: 'window',
    includeUncontrolled: true
  }).then(clients => {
    let hasVisibleClient = false;
    let hasAnyClient = clients.length > 0;
    
    clients.forEach(client => {
      // Send message to all clients
      client.postMessage({
        type: 'NOTIFICATION_RECEIVED',
        payload: payload
      });
      
      // Check if any client is visible (don't require focus, just visibility)
      if (client.visibilityState === 'visible') {
        hasVisibleClient = true;
      }
    });

    // Only show browser notification if no client is visible OR no client exists
    if (!hasVisibleClient || !hasAnyClient) {
      console.log('[firebase-messaging-sw.js] No visible client found, showing browser notification');
      return self.registration.showNotification(notificationTitle, notificationOptions);
    } else {
      console.log('[firebase-messaging-sw.js] App is visible, notification will be shown as toast');
      // Don't show browser notification, let the app handle it as toast
      return Promise.resolve();
    }
  });
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
