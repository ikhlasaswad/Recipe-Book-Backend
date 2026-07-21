# مطبخي - Backend (Node.js + Express + MySQL)

## البنية
```
backend/
  config/db.js          اتصال قاعدة البيانات
  database/schema.sql    مخطط الجداول (نفّذه على Railway MySQL)
  middleware/            المصادقة (JWT) ورفع الصور (multer)
  controllers/            منطق كل مسار
  routes/                 تعريف الـ endpoints
  server.js               نقطة تشغيل التطبيق
```

## التشغيل محلياً
```bash
cd backend
npm install
cp .env.example .env   # ثم عدّل القيم
npm run dev
```

## نشر قاعدة البيانات على Railway
1. أنشئ مشروع جديد على railway.app واختر MySQL.
2. من تبويب "Connect" انسخ: Host, Port, User, Password, Database.
3. نفّذ محتوى `database/schema.sql` عبر Railway Query tab أو أي عميل MySQL (مثل TablePlus / MySQL Workbench) متصل ببيانات Railway.
4. ضع هذه القيم في متغيرات البيئة عند نشر الباك اند.

## نشر الباك اند على Render
1. ادفع مجلد backend إلى مستودع GitHub.
2. أنشئ Web Service جديد على render.com واربطه بالمستودع.
3. Build Command: `npm install` — Start Command: `npm start`.
4. أضف متغيرات البيئة (DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET, JWT_EXPIRES_IN, CLIENT_ORIGIN) بنفس قيم Railway.
5. بعد النشر سيكون الـ API متاحاً على: `https://your-app.onrender.com/api/...`

## أهم الـ Endpoints

| الطريقة | المسار | الوصف | الصلاحية |
|---|---|---|---|
| POST | /api/auth/register | إنشاء حساب | الجميع |
| POST | /api/auth/login | تسجيل الدخول | الجميع |
| POST | /api/auth/guest | دخول كضيف | الجميع |
| GET | /api/recipes?search=&category=&sort=top_rated | قائمة الوصفات | الجميع (يشمل الضيف) |
| GET | /api/recipes/suggest | اقتراح وصفة عشوائية | الجميع |
| GET | /api/recipes/:id | تفاصيل وصفة | الجميع |
| POST | /api/recipes | إضافة وصفة | admin, cook |
| PUT | /api/recipes/:id | تعديل وصفة | admin, cook (صاحبها) |
| DELETE | /api/recipes/:id | حذف وصفة | admin, cook (صاحبها) |
| PATCH | /api/recipes/:id/approve | اعتماد وصفة طباخ | admin |
| GET | /api/categories | كل التصنيفات | الجميع |
| GET | /api/favorites | مفضلتي | مستخدم مسجّل |
| POST/DELETE | /api/favorites/:recipeId | إضافة/حذف من المفضلة | مستخدم مسجّل |
| POST | /api/ratings/:recipeId | تقييم بالنجوم | مستخدم مسجّل |
| GET/PUT | /api/users/me | عرض/تعديل الملف الشخصي (الاسم، الصورة، bio، لون الثيم) | مستخدم مسجّل |
| GET | /api/users | كل المستخدمين | admin |
| PATCH | /api/users/:id/role | تغيير دور مستخدم | admin |

ملاحظة: الضيف (guest) يحصل على توكن مؤقت بدور `guest` يسمح له بتصفح الوصفات فقط، بدون حفظ مفضلة أو تقييم.
