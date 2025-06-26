"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, Settings } from 'lucide-react';

export function FirebaseStatus() {
  const [status, setStatus] = useState({
    vapidKey: false,
    serviceWorker: false,
    notification: 'default' as 'default' | 'granted' | 'denied',
    https: false,
  });

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {    // Check VAPID key
    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    const hasValidVapidKey = Boolean(vapidKey && vapidKey !== 'YOUR_VAPID_KEY_HERE' && vapidKey.length > 20);

    // Check Service Worker support
    const swSupported = 'serviceWorker' in navigator;

    // Check notification permission
    const notificationPermission = 'Notification' in window ? Notification.permission : 'denied';

    // Check HTTPS
    const isHttps = location.protocol === 'https:' || location.hostname === 'localhost';

    setStatus({
      vapidKey: hasValidVapidKey,
      serviceWorker: swSupported,
      notification: notificationPermission,
      https: isHttps,
    });
  };

  const getStatusIcon = (isGood: boolean) => {
    return isGood ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <XCircle className="h-4 w-4 text-red-600" />
    );
  };

  const getStatusBadge = (isGood: boolean) => {
    return (
      <Badge variant={isGood ? "default" : "destructive"}>
        {isGood ? "جاهز" : "مطلوب"}
      </Badge>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          حالة إعدادات Firebase
        </CardTitle>
        <CardDescription>
          تحقق من حالة إعدادات الإشعارات
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              {getStatusIcon(status.vapidKey)}
              <span className="font-medium">VAPID Key</span>
            </div>
            {getStatusBadge(status.vapidKey)}
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              {getStatusIcon(status.serviceWorker)}
              <span className="font-medium">Service Worker</span>
            </div>
            {getStatusBadge(status.serviceWorker)}
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              {status.notification === 'granted' ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : status.notification === 'denied' ? (
                <XCircle className="h-4 w-4 text-red-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-yellow-600" />
              )}
              <span className="font-medium">إذن الإشعارات</span>
            </div>
            <Badge 
              variant={
                status.notification === 'granted' ? "default" : 
                status.notification === 'denied' ? "destructive" : "secondary"
              }
            >
              {status.notification === 'granted' ? "مسموح" : 
               status.notification === 'denied' ? "مرفوض" : "في الانتظار"}
            </Badge>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              {getStatusIcon(status.https)}
              <span className="font-medium">HTTPS</span>
            </div>
            {getStatusBadge(status.https)}
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
            الحالة العامة:
          </h4>
          {status.vapidKey && status.serviceWorker && status.notification === 'granted' && status.https ? (
            <p className="text-sm text-green-800 dark:text-green-200">
              ✅ جميع الإعدادات جاهزة! يمكن إرسال الإشعارات الآن.
            </p>
          ) : (
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              ⚠️ بعض الإعدادات تحتاج للإصلاح قبل تفعيل الإشعارات.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
