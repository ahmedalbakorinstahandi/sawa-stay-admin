# Firebase Push Notifications Setup

## إعداد إشعارات Firebase

تم ربط المشروع مع Firebase لإرسال الإشعارات الفورية. اتبع الخطوات التالية لإكمال الإعداد:

### 1. الحصول على VAPID Key

1. اذهب إلى [Firebase Console](https://console.firebase.google.com/)
2. اختر مشروع `sawa-stay`
3. انتقل إلى Project Settings > Cloud Messaging
4. في قسم "Web configuration"، انقر على "Generate key pair"
5. انسخ الـ VAPID key

### 2. تحديث ملف البيئة

في ملف `.env.local`، استبدل `YOUR_VAPID_KEY_HERE` بالـ VAPID key الفعلي:

```env
NEXT_PUBLIC_FIREBASE_VAPID_KEY=YOUR_ACTUAL_VAPID_KEY_HERE
```

### 3. تشغيل المشروع

```bash
npm run dev
# أو
pnpm dev
```

### 4. اختبار الإشعارات

1. سجل دخول إلى لوحة التحكم
2. في صفحة تسجيل الدخول، انقر على "تفعيل الإشعارات"
3. اسمح بالإشعارات عند ظهور رسالة المتصفح
4. في لوحة التحكم، ستجد قسم "إعدادات الإشعارات" يعرض حالة الإشعارات

### 5. إرسال إشعار تجريبي

يمكنك إرسال إشعار تجريبي من Firebase Console:

1. اذهب إلى Firebase Console > Cloud Messaging
2. انقر على "Send your first message"
3. اكتب عنوان ونص الإشعار
4. في قسم Target، اختر "Topic" واكتب `all-users`
5. انقر على "Send message"

## الملفات المضافة

### `lib/firebase.ts`
- تكوين Firebase
- دوال إدارة FCM token
- استقبال الإشعارات في المقدمة

### `public/firebase-messaging-sw.js`
- Service Worker للتعامل مع الإشعارات في الخلفية
- عرض الإشعارات عند عدم فتح الموقع

### `hooks/use-firebase.ts`
- Hook مخصص لإدارة Firebase
- طلب أذونات الإشعارات
- إرسال device token للخادم

### `components/notifications/notification-settings.tsx`
- مكون إعدادات الإشعارات
- عرض حالة الإشعارات
- تفعيل/إلغاء تفعيل الإشعارات

### `app/api/fcm-token/route.ts`
- API endpoint لحفظ device token
- يمكن ربطه مع الباك اند الخاص بك

## التكامل مع الباك اند

### إرسال device_token عند تسجيل الدخول

تم تحديث `contexts/auth-context.tsx` ليرسل device_token مع بيانات تسجيل الدخول:

```typescript
const loginData = {
  phone: phone,
  password,
  role: "admin",
  device_token: deviceToken // يتم إضافة device_token إذا كان متوفراً
};
```

### API endpoints مطلوبة في الباك اند

يجب أن يدعم الباك اند الخاص بك هذه النقاط:

1. `POST /auth/login` - يقبل device_token كمعامل اختياري
2. `POST /admin/device-token` - لحفظ device_token بعد تسجيل الدخول

## إرسال الإشعارات من الباك اند

يمكن للباك اند إرسال إشعارات باستخدام Firebase Admin SDK:

```javascript
// مثال Node.js
const admin = require('firebase-admin');

const message = {
  notification: {
    title: 'حجز جديد',
    body: 'تم إنشاء حجز جديد'
  },
  token: 'DEVICE_TOKEN_HERE'
};

admin.messaging().send(message)
  .then((response) => {
    console.log('Successfully sent message:', response);
  })
  .catch((error) => {
    console.log('Error sending message:', error);
  });
```

## ملاحظات مهمة

1. **HTTPS مطلوب**: الإشعارات تعمل فقط على HTTPS في الإنتاج
2. **دعم المتصفحات**: تعمل على Chrome, Firefox, Safari (iOS 16.4+)
3. **الأذونات**: يجب على المستخدم السماح بالإشعارات صراحة
4. **Service Worker**: يجب أن يكون في مجلد `public` ليعمل بشكل صحيح

## استكشاف الأخطاء

### الإشعارات لا تعمل؟

1. تأكد من أن VAPID key صحيح
2. تأكد من أن المستخدم سمح بالإشعارات
3. تأكد من أن Service Worker مسجل بنجاح
4. افحص console للأخطاء

### device_token لا يتم إرساله؟

1. تأكد من أن المستخدم سمح بالإشعارات
2. تأكد من أن VAPID key مضبوط صحيحاً
3. افحص network tab لمعرفة ما إذا كان الطلب يتم إرساله
