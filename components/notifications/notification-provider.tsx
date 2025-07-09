"use client";

import React, { useEffect, useState } from 'react';
import { useFirebase } from '@/hooks/use-firebase';
import { useToast } from '@/hooks/use-toast';

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isPageVisible, setIsPageVisible] = useState(true);
  const { initializeFirebase, isSupported } = useFirebase();
  const { toast } = useToast();

  // Monitor page visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPageVisible(document.visibilityState === 'visible');
      console.log('Page visibility changed:', document.visibilityState);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Set initial state
    setIsPageVisible(document.visibilityState === 'visible');

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

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

          // Always show toast when app is visible and initialized
          // The service worker logic already handles whether to show browser notification or not
          if (isPageVisible) {
            try {
              toast({
                title: payload.notification?.title || 'إشعار جديد',
                description: payload.notification?.body || 'لديك إشعار جديد',
                duration: 6000, // Show for 6 seconds for better visibility
              });
              console.log('Toast notification shown successfully');
            } catch (error) {
              console.error('Error showing toast notification:', error);
            }
          } else {
            console.log('Page not visible, skipping toast notification');
          }
        }
      };

      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);

      return () => {
        navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
      };
    }
  }, [isInitialized, isPageVisible, toast]);

  // Show a debug toast when notifications are ready (only in development)
  useEffect(() => {
    if (isInitialized && process.env.NODE_ENV === 'development') {
      toast({
        title: "نظام الإشعارات جاهز",
        description: "ستظهر الإشعارات كـ toast داخل الموقع عند فتحه",
        duration: 3000,
      });
    }
  }, [isInitialized, toast]);

  return <>{children}</>;
};
