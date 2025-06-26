"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, BellOff, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function NotificationPermissionTester() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isRequesting, setIsRequesting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = () => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  };

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      toast({
        title: "غير مدعوم",
        description: "متصفحك لا يدعم الإشعارات",
        variant: "destructive",
      });
      return;
    }

    setIsRequesting(true);

    try {
      // Show confirmation dialog first
      const userConfirmed = confirm(
        'هل تريد تفعيل الإشعارات لتلقي تحديثات الحجوزات والإشعارات المهمة؟\n\nسيظهر طلب من المتصفح للموافقة على الإشعارات.'
      );

      if (!userConfirmed) {
        toast({
          title: "تم الإلغاء",
          description: "لم يتم طلب صلاحيات الإشعارات",
        });
        setIsRequesting(false);
        return;
      }

      // Request permission from browser
      console.log('طلب صلاحيات الإشعارات من المتصفح...');
      const result = await Notification.requestPermission();
      
      setPermission(result);
      
      if (result === 'granted') {
        toast({
          title: "تم منح الصلاحية",
          description: "تم السماح بالإشعارات بنجاح",
        });
        
        // Test notification
        setTimeout(() => {
          new Notification('إشعار تجريبي', {
            body: 'تم تفعيل الإشعارات بنجاح! 🎉',
            icon: '/logo.png',
            tag: 'test-notification'
          });
        }, 1000);
        
      } else if (result === 'denied') {
        toast({
          title: "تم رفض الصلاحية",
          description: "لن تصلك إشعارات. يمكنك تفعيلها من إعدادات المتصفح",
          variant: "destructive",
        });
      } else {
        toast({
          title: "لم يتم اتخاذ قرار",
          description: "يمكنك المحاولة مرة أخرى لاحقاً",
        });
      }
    } catch (error) {
      console.error('خطأ في طلب صلاحيات الإشعارات:', error);
      toast({
        title: "حدث خطأ",
        description: "فشل في طلب صلاحيات الإشعارات",
        variant: "destructive",
      });
    } finally {
      setIsRequesting(false);
    }
  };

  const getPermissionIcon = () => {
    switch (permission) {
      case 'granted':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'denied':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getPermissionBadge = () => {
    switch (permission) {
      case 'granted':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">مسموح</Badge>;
      case 'denied':
        return <Badge variant="destructive">مرفوض</Badge>;
      default:
        return <Badge variant="secondary">في الانتظار</Badge>;
    }
  };

  const getPermissionText = () => {
    switch (permission) {
      case 'granted':
        return 'تم منح صلاحيات الإشعارات. يمكن إرسال الإشعارات الآن.';
      case 'denied':
        return 'تم رفض صلاحيات الإشعارات. لن تصلك إشعارات من هذا الموقع.';
      default:
        return 'لم يتم طلب صلاحيات الإشعارات بعد.';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {permission === 'granted' ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
          اختبار صلاحيات الإشعارات
        </CardTitle>
        <CardDescription>
          اختبر طلب صلاحيات الإشعارات من المتصفح
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            {getPermissionIcon()}
            <span className="font-medium">حالة الصلاحيات</span>
          </div>
          {getPermissionBadge()}
        </div>

        <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            {getPermissionText()}
          </p>
        </div>

        {permission !== 'granted' && (
          <Button 
            onClick={requestPermission}
            disabled={isRequesting}
            className="w-full"
          >
            {isRequesting ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                طلب الصلاحيات...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                طلب صلاحيات الإشعارات
              </div>
            )}
          </Button>
        )}

        {permission === 'denied' && (
          <div className="p-3 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-1">
              كيفية تفعيل الإشعارات يدوياً:
            </h4>
            <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1 list-disc list-inside">
              <li>انقر على أيقونة القفل في شريط العنوان</li>
              <li>اختر "السماح" بجانب الإشعارات</li>
              <li>أعد تحميل الصفحة</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
