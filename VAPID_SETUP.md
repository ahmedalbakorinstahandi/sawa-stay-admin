# حل مشكلة VAPID Key - إعداد الإشعارات

## الخطأ الحالي:
```
InvalidAccessError: Failed to execute 'subscribe' on 'PushManager': The provided applicationServerKey is not valid.
```

هذا الخطأ يحدث لأن VAPID key غير صحيح أو غير موجود.

## الحل السريع:

### 1. **احصل على VAPID Key من Firebase:**

1. اذهب إلى: https://console.firebase.google.com/project/sawa-stay/settings/cloudmessaging
2. ابحث عن قسم "Web configuration"
3. انقر على "Generate key pair"
4. انسخ الـ VAPID key الذي سيظهر

### 2. **أضف المفتاح إلى ملف .env.local:**

```env
NEXT_PUBLIC_FIREBASE_VAPID_KEY=BKd_YOUR_ACTUAL_VAPID_KEY_FROM_FIREBASE_CONSOLE
```

### 3. **أعد تشغيل المشروع:**

```bash
npm run dev
```

## للتحقق من الإعداد:

1. اذهب إلى لوحة التحكم → تبويب "الإشعارات"
2. ستجد "حالة إعدادات Firebase" في الأعلى
3. يجب أن تظهر جميع العلامات خضراء ✅

## إذا استمرت المشكلة:

### تأكد من:
- [ ] VAPID key مضاف صحيحاً في .env.local
- [ ] أعدت تشغيل المشروع بعد إضافة المفتاح
- [ ] المفتاح يبدأ بـ "BK" أو "BB"
- [ ] طول المفتاح أكثر من 80 حرف

### للاختبار:
1. افتح Developer Tools (F12)
2. اذهب إلى Console
3. ابحث عن رسائل خطأ Firebase
4. تأكد من عدم وجود رسالة "VAPID key not configured"

## بدائل للاختبار:

إذا كنت تريد اختبار الإعدادات بدون VAPID key:
- يمكن استخدام إشعارات المتصفح العادية
- لكن الإشعارات عبر Firebase لن تعمل
- راجع مكون "اختبار الإشعارات" في لوحة التحكم
