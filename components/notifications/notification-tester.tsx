"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Send, TestTube } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/hooks/use-firebase';

export function NotificationTester() {
  const [title, setTitle] = useState('إشعار تجريبي');
  const [body, setBody] = useState('هذا إشعار تجريبي من لوحة التحكم');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { fcmToken } = useFirebase();

  const sendTestNotification = async () => {
    if (!fcmToken) {
      toast({
        title: "خطأ",
        description: "لا يوجد FCM token. يرجى تفعيل الإشعارات أولاً",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Send a test notification using the browser's notification API
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
          body: body,
          icon: '/logo.png',
          badge: '/logo.png',
          tag: 'test-notification',
        });

        toast({
          title: "تم إرسال الإشعار",
          description: "تم إرسال الإشعار التجريبي بنجاح",
        });
      } else {
        toast({
          title: "خطأ",
          description: "الإشعارات غير مفعلة في المتصفح",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast({
        title: "خطأ",
        description: "فشل في إرسال الإشعار التجريبي",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          اختبار الإشعارات
        </CardTitle>
        <CardDescription>
          إرسال إشعار تجريبي لاختبار النظام
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">عنوان الإشعار</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="عنوان الإشعار"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="body">محتوى الإشعار</Label>
          <Textarea
            id="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="محتوى الإشعار"
            rows={3}
          />
        </div>

        <div className="p-3 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>FCM Token Status:</strong> {fcmToken ? "متوفر" : "غير متوفر"}
          </p>
          {fcmToken && (
            <p className="text-xs text-muted-foreground mt-1 font-mono break-all">
              {fcmToken.substring(0, 50)}...
            </p>
          )}
        </div>        <Button
          onClick={sendTestNotification}
          disabled={isLoading || !fcmToken}
          className="w-full"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              جاري الإرسال...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              إرسال إشعار تجريبي
            </div>
          )}
        </Button>
        
        {/* Local Toast Test */}
        <Button
          onClick={() => {
            toast({
              title: "إشعار تجريبي محلي",
              description: "هذا مثال على كيفية ظهور الإشعارات كـ Toast داخل الموقع عندما يكون مفتوحاً",
              duration: 6000,
            });
          }}
          variant="outline"
          className="w-full"
        >
          <div className="flex items-center gap-2">
            <TestTube className="h-4 w-4" />
            اختبار Toast محلي
          </div>
        </Button>
        
        {/* Browser Notification Test */}
        <Button
          onClick={() => {
            if (Notification.permission === 'granted') {
              new Notification('إشعار تجريبي للمتصفح', {
                body: 'هذا مثال على إشعار المتصفح الذي يظهر عندما يكون الموقع مغلق أو في الخلفية',
                icon: '/logo.png',
                tag: 'test-browser-notification'
              });
              toast({
                title: "تم إرسال إشعار المتصفح",
                description: "تم إرسال إشعار المتصفح بنجاح",
              });
            } else {
              toast({
                title: "خطأ",
                description: "لم يتم السماح بإشعارات المتصفح",
                variant: "destructive"
              });
            }
          }}
          variant="outline"
          className="w-full"
          disabled={Notification.permission !== 'granted'}
        >
          <div className="flex items-center gap-2">
            <TestTube className="h-4 w-4" />
            اختبار إشعار المتصفح
          </div>
        </Button>
        
        <div className="text-xs text-muted-foreground bg-muted p-3 rounded">
          <strong>كيف يعمل النظام الجديد:</strong>
          <ul className="mt-1 space-y-1">
            <li>• عندما يكون الموقع مفتوح ومرئي: إشعارات Toast داخل الموقع فقط</li>
            <li>• عندما يكون الموقع مغلق أو في الخلفية: إشعارات المتصفح العادية</li>
            <li>• لا تظهر إشعارات مكررة</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
