"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { TestTube, Bell, Eye, EyeOff } from 'lucide-react';

export const NotificationBehaviorTester = () => {
  const { toast } = useToast();

  const testInAppToast = () => {
    toast({
      title: "إشعار داخل التطبيق ✅",
      description: "هذا النوع من الإشعارات يظهر عندما يكون الموقع مفتوحاً ومرئياً",
      duration: 6000,
    });
  };

  const testBrowserNotification = () => {
    if (Notification.permission === 'granted') {
      new Notification('إشعار المتصفح 🔔', {
        body: 'هذا النوع من الإشعارات يظهر عندما يكون الموقع مغلقاً أو في الخلفية',
        icon: '/logo.png',
        tag: 'behavior-test-notification'
      });
      
      toast({
        title: "تم إرسال إشعار المتصفح",
        description: "تم إرسال إشعار المتصفح - سيظهر حتى لو كان الموقع في الخلفية",
        duration: 4000,
      });
    } else {
      toast({
        title: "صلاحية الإشعارات غير مُفعلة",
        description: "يرجى تفعيل صلاحية الإشعارات أولاً",
        variant: "destructive"
      });
    }
  };

  const handleVisibilityTest = () => {
    toast({
      title: "اختبار الرؤية",
      description: `حالة الصفحة الحالية: ${document.visibilityState === 'visible' ? 'مرئية 👁️' : 'غير مرئية 🙈'}`,
      duration: 4000,
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          اختبار سلوك الإشعارات الجديد
        </CardTitle>
        <CardDescription>
          اختبر الفرق بين إشعارات Toast داخل الموقع وإشعارات المتصفح
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button 
            onClick={testInAppToast}
            className="h-20 flex-col gap-2"
            variant="outline"
          >
            <Eye className="h-6 w-6" />
            <span className="text-center">
              اختبار Toast<br />
              <small>(عند فتح الموقع)</small>
            </span>
          </Button>
          
          <Button 
            onClick={testBrowserNotification}
            className="h-20 flex-col gap-2"
            variant="outline"
            disabled={Notification.permission !== 'granted'}
          >
            <Bell className="h-6 w-6" />
            <span className="text-center">
              اختبار إشعار المتصفح<br />
              <small>(عند إغلاق الموقع)</small>
            </span>
          </Button>
        </div>

        <Button 
          onClick={handleVisibilityTest}
          className="w-full"
          variant="secondary"
        >
          <EyeOff className="h-4 w-4 mr-2" />
          فحص حالة رؤية الصفحة
        </Button>

        <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            📋 ملخص التحديثات:
          </h4>
          <ul className="text-sm space-y-1 text-blue-800 dark:text-blue-200">
            <li>✅ عندما يكون الموقع مفتوح: إشعارات Toast فقط</li>
            <li>✅ عندما يكون الموقع مغلق: إشعارات المتصفح فقط</li>
            <li>✅ لا توجد إشعارات مكررة</li>
            <li>✅ مراقبة حالة رؤية الصفحة</li>
            <li>✅ تحسين تجربة المستخدم</li>
          </ul>
        </div>

        <div className="text-xs text-muted-foreground">
          <strong>صلاحية الإشعارات:</strong> {
            Notification.permission === 'granted' ? '✅ مُفعلة' :
            Notification.permission === 'denied' ? '❌ مرفوضة' :
            '⏳ لم يتم طلبها بعد'
          }
        </div>
      </CardContent>
    </Card>
  );
};
