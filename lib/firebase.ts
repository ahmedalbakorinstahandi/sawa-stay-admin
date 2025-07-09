// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics (only in browser)
let analytics: any = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

// Initialize Messaging (only in browser)
let messaging: any = null;
if (typeof window !== 'undefined') {
  messaging = getMessaging(app);
}

// VAPID Key from environment variables
const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

/**
 * Request notification permission from browser
 */
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  try {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications.');
      return 'denied';
    }

    // Check current permission
    let permission = Notification.permission;
    
    // If permission is default, request it
    if (permission === 'default') {
      console.log('Requesting notification permission from browser...');
      
      // Show a user-friendly message before requesting
      const userConfirmed = confirm(
        'هل تريد تفعيل الإشعارات لتلقي تحديثات الحجوزات والإشعارات المهمة؟'
      );
      
      if (userConfirmed) {
        permission = await Notification.requestPermission();
      } else {
        return 'denied';
      }
    }
    
    console.log('Notification permission status:', permission);
    return permission;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return 'denied';
  }
};

/**
 * Get FCM registration token for the device
 */
export const getFCMToken = async (): Promise<string | null> => {
  try {
    if (!messaging) {
      console.log('Messaging not initialized');
      return null;
    }

    if (!VAPID_KEY || VAPID_KEY === 'YOUR_VAPID_KEY_HERE') {
      console.warn('VAPID key not configured properly. Please set NEXT_PUBLIC_FIREBASE_VAPID_KEY in your environment variables.');
      console.warn('Follow the instructions in VAPID_SETUP.md to get your VAPID key from Firebase Console.');
      return null;
    }    // First request permission using our enhanced function
    const permission = await requestNotificationPermission();
    
    if (permission === 'granted') {
      console.log('Notification permission granted, getting FCM token...');
      
      try {
        // Get registration token with proper error handling
        const token = await getToken(messaging, {
          vapidKey: VAPID_KEY
        });
        
        if (token) {
          console.log('FCM Token retrieved successfully');
          return token;
        } else {
          console.log('No registration token available. Make sure the app is served over HTTPS in production.');
          return null;
        }      } catch (tokenError: any) {
        console.error('Error getting FCM token:', tokenError);
        if (tokenError?.message?.includes('applicationServerKey')) {
          console.error('Invalid VAPID key. Please check your NEXT_PUBLIC_FIREBASE_VAPID_KEY in .env.local');
        }
        return null;
      }
    } else {
      console.log('Unable to get permission to notify. Permission:', permission);
      return null;
    }
  } catch (error) {
    console.error('An error occurred while retrieving token:', error);
    return null;
  }
};

/**
 * Listen for foreground messages
 */
export const onMessageListener = () => {
  return new Promise((resolve) => {
    if (!messaging) {
      console.log('Messaging not initialized');
      return;
    }
    
    console.log('Setting up foreground message listener...');
    
    onMessage(messaging, (payload) => {
      console.log('Message received in foreground:', payload);
      
      // Only resolve if the page is visible
      // This prevents duplicate notifications when page is not visible
      if (document.visibilityState === 'visible') {
        resolve(payload);
      } else {
        console.log('Page not visible, ignoring foreground message (background handler will take care of it)');
      }
    });
  });
};

export { app, analytics, messaging };
