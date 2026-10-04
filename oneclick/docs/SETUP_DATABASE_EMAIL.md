# تشغيل قاعدة البيانات والإيميلات (للمالكة)

هذا الدليل يفعّل الدخول الحقيقي في موقع One Click: الحسابات، والمشتريات، وبيانات المنتجات (مثل خطة العروس)، وطلبات «تواصل معنا» و«حلول حسب الطلب»، وإرسال رموز الدخول بالإيميل.
لا تحتاجين تكتبين أي كود. كل شي نسخ ولصق.

## 1) قاعدة البيانات: Supabase (فيه خطة مجانية)
1. سجّلي في https://supabase.com واضغطي **New project**.
2. اختاري اسمًا (مثل `oneclick`)، وكلمة سر قوية لقاعدة البيانات (احفظيها عندك)، وأقرب منطقة متاحة لعُمان.
3. بعد ما يجهز المشروع، افتحي **SQL Editor** ثم **New query**.
4. انسخي كل محتوى الملف `supabase/migrations/20261004000000_server_store.sql` من GitHub، والصقيه، واضغطي **Run**. لازم يطلع Success.
   - هذا يسوي أربعة جداول محمية، ما يقدر يوصلها إلا السيرفر.
   - الملفين الأقدم في نفس المجلد ما تحتاجينهم الحين.
5. من **Project Settings** ثم **API** (أو **API Keys**) انسخي شيئين:
   - **Project URL**: يبدأ بـ `https://` وينتهي بـ `.supabase.co`
   - **المفتاح السري**: اسمه `service_role` أو `secret` (يبدأ بـ `sb_secret_`).
     ⚠️ هذا المفتاح سري جدًا: لا ترسلينه لأحد، ولا تحطينه في أي مكان غير إعدادات Vercel.

## 2) الإيميلات: Resend (فيه خطة مجانية)
1. سجّلي في https://resend.com.
2. **للتجربة السريعة:** تقدرين تستخدمين المرسل `onboarding@resend.dev`، بس Resend وقتها يرسل لإيميلك أنتِ فقط (إيميل حساب Resend). وهذا يكفي عشان تدخلين كمالكة.
3. **للإطلاق الحقيقي:** من **Domains** ثم **Add Domain**، أضيفي الدومين اللي اشتريتيه. Resend يعطيك سجلات DNS؛ أضيفيها في Vercel من **Domains** ← الدومين ← **DNS Records**، ثم اضغطي **Verify** في Resend.
4. من **API Keys** ثم **Create API Key**، اختاري صلاحية **Sending access**، وانسخي المفتاح (يبدأ بـ `re_`).

## 3) الإعدادات في Vercel
في مشروع **one-click-digital-hub**: افتحي **Settings** ← **Environment Variables**، وأضيفي التالي لبيئة **Production**:

| الاسم | القيمة |
|---|---|
| `SUPABASE_URL` | الـ Project URL من الخطوة 1 |
| `SUPABASE_SERVICE_ROLE_KEY` | المفتاح السري من الخطوة 1 |
| `LICENSING_SECRET` | كلمة سر عشوائية طويلة (40 حرف أو أكثر). ولّديها من أي مولّد كلمات سر، ولا تستخدمين كلمة سر مستخدمة في مكان ثاني |
| `EMAIL_PROVIDER` | `resend` |
| `RESEND_API_KEY` | مفتاح Resend من الخطوة 2 |
| `EMAIL_FROM` | للتجربة: `One Click <onboarding@resend.dev>`. بعد توثيق الدومين: `One Click <hello@دومينك>` |
| `ONECLICK_OWNER_EMAILS` | إيميلك (للتجربة: نفس إيميل حساب Resend) |
| `NEXT_PUBLIC_SITE_URL` | رابط موقعك، مثل `https://دومينك` |

ثم افتحي **Deployments** ← آخر نشر ← **Redeploy**.

## 4) التجربة
1. افتحي موقعك ← **حسابي** ← اكتبي إيميلك ← يوصلك رمز من 6 أرقام ← اكتبيه.
2. افتحي **منتجاتي**: يطلع لك قسم «حساب المالك» وكل المنتجات مفتوحة.
3. افتحي `/ar/admin`: لازم تشوفين **Customer accounts & database: Connected (Supabase)** و **Transactional email: Connected (Resend)**.

## إذا ما اشتغل
- **ما وصل الرمز:** تأكدي من `EMAIL_FROM` ومفتاح Resend. ولو تستخدمين `onboarding@resend.dev`، لازم إيميلك يكون نفس إيميل حساب Resend.
- **صفحة الدخول تقول إن الحسابات غير متاحة:** واحد من الثلاثة ناقص أو غلط: `SUPABASE_URL` أو `SUPABASE_SERVICE_ROLE_KEY` أو `LICENSING_SECRET` (لازم 32 حرف أو أكثر). وبعد أي تعديل، سوّي Redeploy.

## ملاحظات
- **الدفع:** للحين غير مربوط. الشراء الحقيقي ما يشتغل لين نختار مزوّد الدفع مع البنك. أنتِ كمالكة تفتحين كل المنتجات بدون شراء.
- **الأمان:** كل البيانات تمر من السيرفر فقط. المفتاح العام ما يقدر يقرأ أو يكتب أي شي في الجداول (جرّبناها). ورموز الدخول تنحفظ مشفّرة، مو كنص.

## 5) الدخول بـ Google و Apple (اختياري)
الأزرار ما تظهر في صفحة الدخول إلا بعد ما تضيفين مفاتيحها في Vercel. والدخول برمز الإيميل يظل شغّال دايمًا.

### Google (مجاني)
1. افتحي https://console.cloud.google.com وسوّي مشروع جديد باسم `OneClick`.
2. من **Google Auth Platform**:
   - **Branding**: اسم التطبيق `One Click`، وإيميل الدعم، وفي **Authorized domains** أضيفي `oneclick.computer`.
   - **Audience**: اختاري **External**، واضغطي **Publish app**. الصلاحيات اللي نطلبها (الاسم والإيميل بس) ما تحتاج مراجعة من Google.
3. من **Clients** ← **Create client** ← النوع **Web application**:
   - **Authorized JavaScript origins**: `https://www.oneclick.computer`
   - **Authorized redirect URIs**: `https://www.oneclick.computer/api/auth/google/callback`
4. انسخي **Client ID** و **Client secret** وحطيهم في Vercel (Production):

| الاسم | القيمة |
|---|---|
| `GOOGLE_CLIENT_ID` | الـ Client ID (ينتهي بـ `.apps.googleusercontent.com`) |
| `GOOGLE_CLIENT_SECRET` | الـ Client secret ⚠️ سري |

### Apple (يحتاج اشتراك Apple Developer المدفوع: ٩٩ دولار بالسنة)
1. من https://developer.apple.com/account ← **Certificates, Identifiers & Profiles**:
   - **Identifiers** ← App ID جديد، وفعّلي **Sign in with Apple**.
   - **Identifiers** ← **Services IDs** ← جديد (مثل `computer.oneclick.web`)، فعّلي **Sign in with Apple** ← **Configure**:
     - Domains: `www.oneclick.computer`
     - Return URLs: `https://www.oneclick.computer/api/auth/apple/callback`
   - **Keys** ← مفتاح جديد مع **Sign in with Apple** ← نزّلي ملف `.p8` (ينزل مرة وحدة بس) واحفظي الـ **Key ID**.
2. حطيهم في Vercel (Production):

| الاسم | القيمة |
|---|---|
| `APPLE_CLIENT_ID` | الـ Services ID (مثل `computer.oneclick.web`) |
| `APPLE_TEAM_ID` | الـ Team ID (فوق يمين صفحة حساب المطوّر) |
| `APPLE_KEY_ID` | الـ Key ID |
| `APPLE_PRIVATE_KEY` | محتوى ملف `.p8` كامل ⚠️ سري |

بعد الإضافة قولي لي وأنا أنشر الموقع، أو سوّي **Redeploy**.
