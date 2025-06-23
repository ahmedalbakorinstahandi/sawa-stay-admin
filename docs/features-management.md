# Features Management System

نظام إدارة الميزات والتقييمات في لوحة التحكم الإدارية

## المميزات

### 🎨 واجهة المستخدم
- تصميم حديث وجميل مع تدرجات لونية
- دعم كامل للغة العربية (RTL)
- تأثيرات حركية سلسة باستخدام Framer Motion
- تصميم متجاوب يدعم جميع الأجهزة
- كروت إحصائية تفاعلية

### 🔍 البحث والفلترة
- بحث فوري في أسماء الميزات (عربي/إنجليزي)
- فلترة حسب حالة الظهور (مرئي/مخفي)
- تصفح صفحي مع عرض تفاصيل النتائج

### ⚡ العمليات
- **إضافة ميزات جديدة**: نموذج شامل مع رفع الصور
- **تعديل الميزات**: تحديث جميع البيانات والصور
- **حذف الميزات**: حذف مع تأكيد وعرض تفاصيل
- **تبديل حالة الظهور**: تفعيل/إلغاء تفعيل فوري

### 📤 رفع الصور
- رفع أيقونات الميزات إلى الباك اند
- شريط تقدم للرفع
- معاينة فورية للصور
- دعم تنسيقات PNG, JPG, SVG
- حد أقصى 2MB لحجم الملف

### 🔄 ربط مع الباك اند
- استخدام API endpoints:
  - `GET /admin/features` - جلب قائمة الميزات
  - `POST /admin/features` - إضافة ميزة جديدة
  - `PUT /admin/features/{id}` - تحديث ميزة
  - `DELETE /admin/features/{id}` - حذف ميزة
  - `PATCH /admin/features/{id}/visibility` - تغيير حالة الظهور
  - `POST /general/images/upload` - رفع الصور

### 📱 تجربة المستخدم
- إشعارات تفاعلية (Toast Notifications)
- رسائل خطأ ونجاح واضحة
- حالات تحميل وانتظار
- تأكيدات للعمليات الحساسة

## هيكل الملفات

```
app/(dashboard)/features/
├── page.tsx                           # الصفحة الرئيسية

components/features/
├── feature-dialog.tsx                 # نموذج إضافة/تعديل
└── feature-delete-dialog.tsx          # نموذج تأكيد الحذف

types/
└── features.ts                        # تعريفات TypeScript

lib/
└── api.ts                            # وظائف API
```

## البيانات المطلوبة

### إنشاء/تحديث ميزة
```json
{
  "name": {
    "ar": "اسم الميزة بالعربية",
    "en": "Feature name in English" // اختياري
  },
  "description": {
    "ar": "وصف الميزة بالعربية", 
    "en": "Feature description in English" // اختياري
  },
  "icon": "image_name.png",           // اسم الصورة من رفع الصور
  "is_visible": true                  // true للمرئي، false للمخفي
}
```

### استجابة API
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": {
        "ar": "واي فاي",
        "en": "Wi-Fi"
      },
      "description": {
        "ar": "اتصال لاسلكي بالإنترنت عالي السرعة",
        "en": "High-speed wireless internet access"
      },
      "icon": "listings/icon123.png",
      "icon_url": "https://backend.example.com/storage/listings/icon123.png",
      "is_visible": true
    }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 5,
    "per_page": 15,
    "total": 75
  }
}
```

## الاستخدام

1. **عرض الميزات**: تُحمل تلقائياً عند دخول الصفحة
2. **البحث**: اكتب في حقل البحث للبحث الفوري
3. **الفلترة**: استخدم قائمة الحالة لفلترة النتائج
4. **إضافة ميزة**: اضغط زر "إضافة ميزة جديدة"
5. **تعديل ميزة**: اضغط أيقونة التعديل بجانب الميزة
6. **حذف ميزة**: اضغط أيقونة الحذف مع التأكيد
7. **تغيير حالة الظهور**: اضغط على شارة الحالة

## التخصيص

يمكن تخصيص الألوان والتصميم من خلال:
- `styles/features.css` - أنماط CSS مخصصة
- `app/globals.css` - المتغيرات اللونية الأساسية
- `tailwind.config.ts` - إعدادات Tailwind CSS

## المتطلبات

- Next.js 15+
- TypeScript
- Tailwind CSS
- Framer Motion
- Radix UI
- React Hook Form
- Zod
- Axios
