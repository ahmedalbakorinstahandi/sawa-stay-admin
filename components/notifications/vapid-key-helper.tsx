"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, Key, ExternalLink, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function VapidKeyHelper() {
  const [vapidKey, setVapidKey] = useState('');
  const { toast } = useToast();

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "تم النسخ",
        description: "تم نسخ المفتاح إلى الحافظة",
      });
    } catch (error) {
      toast({
        title: "فشل النسخ",
        description: "لم يتم نسخ المفتاح. يرجى النسخ يدوياً",
        variant: "destructive",
      });
    }
  };

  const openFirebaseConsole = () => {
    window.open('https://console.firebase.google.com/project/sawa-stay/settings/cloudmessaging', '_blank');
  };

  const generateTestKey = () => {
    // This is just for demonstration - in real app, user needs to get it from Firebase
    const testKey = "BKd_example_key_this_is_not_real_please_get_from_firebase_console_" + Date.now();
    setVapidKey(testKey);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          إعداد VAPID Key
        </CardTitle>
        <CardDescription>
          احصل على VAPID key من Firebase Console لتفعيل الإشعارات
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>مطلوب:</strong> يجب الحصول على VAPID key من Firebase Console لتعمل الإشعارات بشكل صحيح.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              خطوات الحصول على VAPID Key:
            </h4>
            <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
              <li>اذهب إلى Firebase Console</li>
              <li>اختر مشروع sawa-stay</li>
              <li>Settings → Project Settings</li>
              <li>تبويب Cloud Messaging</li>
              <li>في قسم Web configuration، انقر Generate key pair</li>
              <li>انسخ الـ VAPID key</li>
            </ol>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={openFirebaseConsole}
              variant="outline"
              className="flex-1"
            >
              <ExternalLink className="ml-2 h-4 w-4" />
              فتح Firebase Console
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vapid-key">VAPID Key</Label>
            <div className="flex gap-2">
              <Input
                id="vapid-key"
                value={vapidKey}
                onChange={(e) => setVapidKey(e.target.value)}
                placeholder="الصق VAPID key هنا..."
                className="font-mono text-sm"
              />
              <Button
                onClick={() => copyToClipboard(vapidKey)}
                variant="outline"
                size="icon"
                disabled={!vapidKey}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {vapidKey && (
            <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
              <h4 className="font-medium text-green-900 dark:text-green-100 mb-1">
                الخطوة التالية:
              </h4>
              <p className="text-sm text-green-800 dark:text-green-200 mb-2">
                أضف هذا المفتاح إلى ملف .env.local:
              </p>
              <div className="bg-black/5 dark:bg-white/5 p-2 rounded font-mono text-xs break-all">
                NEXT_PUBLIC_FIREBASE_VAPID_KEY={vapidKey}
              </div>
              <p className="text-sm text-green-800 dark:text-green-200 mt-2">
                ثم أعد تشغيل المشروع: npm run dev
              </p>
            </div>
          )}

          <div className="p-3 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-1">
              للاختبار السريع:
            </h4>
            <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2">
              يمكنك إنشاء مفتاح تجريبي (لن يعمل مع الإشعارات الحقيقية):
            </p>
            <Button 
              onClick={generateTestKey}
              variant="outline" 
              size="sm"
            >
              إنشاء مفتاح تجريبي
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
