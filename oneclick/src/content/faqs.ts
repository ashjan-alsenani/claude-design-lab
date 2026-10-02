import type { Faq } from "./types";

export const faqs: Faq[] = [
  {
    id: "what",
    group: "general",
    q: { en: "What exactly does One Click sell?", ar: "وش تبيع ون كليك بالضبط؟" },
    a: {
      en: "Interactive web products (planners, organizers and trackers you open in your browser), downloadable templates, and custom digital solutions made for you.",
      ar: "منتجات ويب تفاعلية (مخططات ومنظّمات ومتابعات تفتحها من المتصفح)، وقوالب للتحميل، وحلول رقمية نصممها لك حسب الطلب.",
    },
  },
  {
    id: "app",
    group: "access",
    q: { en: "Do I need to install an app?", ar: "لازم أنزل تطبيق؟" },
    a: {
      en: "No. Products open in any modern browser on your phone, tablet or computer. You can add them to your home screen for an app-like experience.",
      ar: "لا. المنتجات تفتح في أي متصفح حديث على الجوال أو التابلت أو الكمبيوتر، وتقدر تضيفها للشاشة الرئيسية وتصير مثل التطبيق.",
    },
  },
  {
    id: "lifetime",
    group: "access",
    q: { en: "What does lifetime access mean?", ar: "وش يعني وصول مدى الحياة؟" },
    a: {
      en: "You pay once and keep access to the product, including its updates, for as long as One Click offers it. If a product is ever retired, we give notice and an export of your data.",
      ar: "تدفع مرة وحدة وتبقى معك المنتج مع تحديثاته طول ما ون كليك توفره. ولو انسحب منتج في يوم، نبلغك مسبقًا ونعطيك نسخة من بياناتك.",
    },
  },
  {
    id: "languages",
    group: "general",
    q: { en: "Are products in Arabic and English?", ar: "المنتجات بالعربي والإنجليزي؟" },
    a: {
      en: "Yes. Every One Click product is designed in both languages from the start, with a proper right-to-left Arabic layout.",
      ar: "نعم. كل منتجات ون كليك مصممة باللغتين من البداية، مع واجهة عربية من اليمين لليسار بشكل صحيح.",
    },
  },
  {
    id: "payment",
    group: "payment",
    q: { en: "How do I pay?", ar: "كيف أدفع؟" },
    a: {
      en: "Online payment is being set up with a bank in Oman and is not live yet. Until then, product pages show demos and a launch notification option. We will never ask for card details by message.",
      ar: "الدفع الإلكتروني يتجهز حاليًا مع بنك في عُمان وما تفعّل للحين. لين ذاك الوقت، صفحات المنتجات فيها عروض تجريبية وخيار تنبيه عند الإطلاق. وما راح نطلب منك بيانات بطاقتك برسالة أبدًا.",
    },
  },
  {
    id: "currency",
    group: "payment",
    q: { en: "Which currency are prices in?", ar: "الأسعار بأي عملة؟" },
    a: {
      en: "Prices are in Omani Rial (OMR). Other GCC and international currencies will be supported when payments go live.",
      ar: "الأسعار بالريال العُماني. وبندعم عملات الخليج والعملات الدولية لما يتفعّل الدفع.",
    },
  },
  {
    id: "refund",
    group: "payment",
    q: { en: "Can I get a refund?", ar: "أقدر أسترجع فلوسي؟" },
    a: {
      en: "Yes, in the situations described in our Refund Policy, for example if a product does not work as described. Try the free demo first so you know what you are getting.",
      ar: "نعم، في الحالات الموضحة في سياسة الاسترجاع، مثل لو المنتج ما اشتغل مثل الوصف. جرّب العرض المجاني أول عشان تعرف وش بتحصل.",
    },
  },
  {
    id: "account",
    group: "account",
    q: { en: "Is my data private?", ar: "بياناتي خاصة؟" },
    a: {
      en: "Yes. What you type in a product belongs to you, is not sold, and is not sent to AI services. See the Privacy Policy for details.",
      ar: "نعم. اللي تكتبه في المنتج ملكك، ولا ينباع، ولا يُرسل لخدمات الذكاء الاصطناعي. التفاصيل في سياسة الخصوصية.",
    },
  },
  {
    id: "custom",
    group: "custom",
    q: { en: "Can you build something just for my business?", ar: "تقدرون تسوون شي خاص لمشروعي؟" },
    a: {
      en: "Yes. Send a custom solution request with your goal and budget. We reply with questions or a written quote before any work begins.",
      ar: "نعم. أرسل طلب حل خاص فيه هدفك وميزانيتك. نرد عليك بأسئلة أو عرض سعر مكتوب قبل لا نبدأ أي شغل.",
    },
  },
];
