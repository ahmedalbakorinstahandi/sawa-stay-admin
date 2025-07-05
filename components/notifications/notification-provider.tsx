"use client";

import React, { useEffect, useState } from 'react';
import { useFirebase } from '@/hooks/use-firebase';
import { useToast } from '@/hooks/use-toast';

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const { initializeFirebase, isSupported } = useFirebase();
  const { toast } = useToast();

  useEffect(() => {
    // Initialize notifications only once when component mounts
    if (!isInitialized && isSupported) {
      console.log('Initializing notification provider...');
      
      initializeFirebase().then(() => {
        setIsInitialized(true);
        console.log('Notification provider initialized');
      }).catch((error) => {
        console.error('Failed to initialize notification provider:', error);
      });
    }
  }, [isInitialized, isSupported, initializeFirebase]);

  // Listen for service worker messages
  useEffect(() => {
    if (isInitialized && 'serviceWorker' in navigator) {
      const handleServiceWorkerMessage = (event: MessageEvent) => {
        if (event.data?.type === 'NOTIFICATION_RECEIVED') {
          const payload = event.data.payload;
          console.log('Received notification from service worker:', payload);
          
          // Show toast for background notifications when app is visible
          if (document.visibilityState === 'visible') {
            toast({
              title: payload.notification?.title || 'إشعار جديد',
              description: payload.notification?.body || '',
              duration: 5000,
            });
          }
        }
      };

      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);

      return () => {
        navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
      };
    }
  }, [isInitialized, toast]);

  // Show a debug toast when notifications are ready (only in development)
  useEffect(() => {
    if (isInitialized && process.env.NODE_ENV === 'development') {
      toast({
        title: "نظام الإشعارات جاهز",
        description: "ستظهر الإشعارات كـ toast عند وصولها",
        duration: 3000,
      });
    }
  }, [isInitialized, toast]);

  return <>{children}</>;
};
