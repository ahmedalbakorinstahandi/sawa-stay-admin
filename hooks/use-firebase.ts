"use client";

import { useEffect, useState } from 'react';
import { getFCMToken, onMessageListener, requestNotificationPermission as requestPermission } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

export const useFirebase = () => {
    const [fcmToken, setFcmToken] = useState<string | null>(null);
    const [isSupported, setIsSupported] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        // Check if browser supports notifications and service workers
        const checkSupport = () => {
            return (
                'Notification' in window &&
                'serviceWorker' in navigator &&
                'PushManager' in window
            );
        };

        setIsSupported(checkSupport());

        if (checkSupport() && !isInitialized) {
            initializeFirebase();
        }
    }, [isInitialized]);
    const initializeFirebase = async () => {
        try {
            // Prevent multiple initializations
            if (isInitialized) {
                console.log('Firebase already initialized');
                return;
            }

            console.log('Initializing Firebase...');
            
            // Register service worker
            if ('serviceWorker' in navigator) {
                const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
                console.log('Service Worker registered successfully:', registration);

                // Wait for service worker to be ready
                await navigator.serviceWorker.ready;
            }

            // Get FCM token
            const token = await getFCMToken();
            if (token) {
                setFcmToken(token);
                console.log('FCM Token obtained:', token);
            }

            // Listen for foreground messages
            onMessageListener()
                .then((payload: any) => {
                    console.log('Received foreground message:', payload);

                    // Show toast notification for foreground messages
                    toast({
                        title: payload.notification?.title || 'إشعار جديد',
                        description: payload.notification?.body || '',
                        duration: 5000, // Show for 5 seconds
                    });
                })
                .catch((err) => console.log('Failed to receive message:', err));

            setIsInitialized(true);
            console.log('Firebase initialized successfully');

        } catch (error) {
            console.error('Error initializing Firebase:', error);
        }
    };
    const requestNotificationPermission = async (): Promise<boolean> => {
        try {
            // Check if VAPID key is configured
            const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
            if (!vapidKey || vapidKey === 'YOUR_VAPID_KEY_HERE') {
                toast({
                    title: "VAPID Key غير مكون",
                    description: "يرجى إعداد VAPID key في إعدادات Firebase أولاً",
                    variant: "destructive",
                });
                return false;
            }      // Use the enhanced permission request function
            const permission = await requestPermission();

            if (permission === 'granted') {
                const token = await getFCMToken();
                if (token) {
                    setFcmToken(token);
                    toast({
                        title: "تم تفعيل الإشعارات",
                        description: "ستصلك الآن إشعارات عن التحديثات المهمة",
                    });
                    return true;
                } else {
                    toast({
                        title: "خطأ في الحصول على Token",
                        description: "تأكد من إعداد VAPID key بشكل صحيح",
                        variant: "destructive",
                    });
                }
            } else if (permission === 'denied') {
                toast({
                    title: "تم رفض الإشعارات",
                    description: "يرجى السماح بالإشعارات من إعدادات المتصفح",
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "لم يتم تفعيل الإشعارات",
                    description: "تم إلغاء طلب الإشعارات",
                    variant: "destructive",
                });
            }
            return false;
        } catch (error: any) {
            console.error('Error requesting notification permission:', error);

            let errorMessage = "حدث خطأ أثناء تفعيل الإشعارات";
            if (error?.message?.includes('applicationServerKey')) {
                errorMessage = "VAPID key غير صحيح. يرجى التحقق من الإعدادات";
            }

            toast({
                title: "خطأ في تفعيل الإشعارات",
                description: errorMessage,
                variant: "destructive",
            });
            return false;
        }
    };

    const sendTokenToServer = async (token: string, userToken: string) => {
        try {
            const response = await fetch('/api/fcm-token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`
                },
                body: JSON.stringify({ device_token: token })
            });

            if (response.ok) {
                console.log('FCM token sent to server successfully');
                return true;
            } else {
                console.error('Failed to send FCM token to server');
                return false;
            }
        } catch (error) {
            console.error('Error sending FCM token to server:', error);
            return false;
        }
    };

    return {
        fcmToken,
        isSupported,
        isInitialized,
        requestNotificationPermission,
        sendTokenToServer,
        initializeFirebase
    };
}; 
