"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, BellOff, Settings } from 'lucide-react';
import { useFirebase } from '@/hooks/use-firebase';
import { useToast } from '@/hooks/use-toast';

interface NotificationSettingsProps {
  className?: string;
}

export function NotificationSettings({ className }: NotificationSettingsProps) {
  const { fcmToken, isSupported, requestNotificationPermission } = useFirebase();
  const { toast } = useToast();
  const [notificationStatus, setNotificationStatus] = useState<'default' | 'granted' | 'denied'>('default');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationStatus(Notification.permission);
    }
  }, [fcmToken]);

  const handleEnableNotifications = async () => {
    const success = await requestNotificationPermission();
    if (success) {
      toast({
        title: "تم تفعيل الإشعارات",
        description: "ستصلك الآن إشعارات عن الحجوزات والتحديثات المهمة",
      });
      setNotificationStatus('granted');
    } else {
      toast({
        title: "فشل في تفعيل الإشعارات",
        description: "يرجى السماح بالإشعارات من إعدادات المتصفح",
        variant: "destructive",
      });
    }
  };

  if (!isSupported) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            الإشعارات غير مدعومة
          </CardTitle>
          <CardDescription>
            متصفحك لا يدعم الإشعارات المتقدمة
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          إعدادات الإشعارات
        </CardTitle>
        <CardDescription>
          إدارة تفضيلات الإشعارات والتنبيهات
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {fcmToken ? (
                <Bell className="h-4 w-4 text-green-600" />
              ) : (
                <BellOff className="h-4 w-4 text-gray-500" />
              )}
              <span className="font-medium">الإشعارات الفورية</span>
              <Badge variant={fcmToken ? "default" : "secondary"}>
                {fcmToken ? "مفعلة" : "معطلة"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              تلقي إشعارات فورية عن الحجوزات الجديدة والتحديثات المهمة
            </p>
          </div>
          
          {!fcmToken && notificationStatus !== 'denied' && (
            <Button 
              onClick={handleEnableNotifications}
              size="sm"
            >
              تفعيل
            </Button>
          )}
        </div>

        {notificationStatus === 'denied' && (
          <div className="p-3 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              تم رفض الإشعارات. يرجى تفعيلها من إعدادات المتصفح لتلقي التحديثات الهامة.
            </p>
          </div>
        )}

        {fcmToken && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">أنواع الإشعارات المفعلة:</h4>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                حجوزات جديدة
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                تحديثات الحجوزات
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                تنبيهات النظام
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
