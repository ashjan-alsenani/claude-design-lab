import type { CategoryKey, Effort, Priority, ProgressStage, TaskTemplate } from "./types";

/**
 * The master bridal checklist. Dates are relative to the wedding day ("due" = days before),
 * so every plan is personal. Event-specific tasks appear only when the bride enables that
 * event / plan. `doneAt` marks tasks already finished at a given onboarding stage
 * (1 venue booked, 2 some vendors, 3 most vendors, 4 almost ready).
 */
type Opt = { start?: number; when?: TaskTemplate["when"]; deps?: string[]; doneAt?: ProgressStage; milestone?: [string, string] };

const M12 = 365, M10 = 300, M8 = 240, M6 = 180, M5 = 150, M4 = 120, M3 = 90, M2 = 60, M1 = 30, W3 = 21, W2 = 14, W1 = 7, D3 = 3, D1 = 1;

function t(id: string, cat: CategoryKey, en: string, ar: string, due: number, priority: Priority = "normal", effort: Effort = "hour", o: Opt = {}): TaskTemplate {
  return {
    id,
    cat,
    title: { en, ar },
    due,
    start: o.start,
    priority,
    effort,
    when: o.when,
    deps: o.deps,
    doneAt: o.doneAt,
    milestone: o.milestone ? { en: o.milestone[0], ar: o.milestone[1] } : undefined,
  };
}

export const templates: TaskTemplate[] = [
  // PLANNING & ADMINISTRATION
  t("pl-date", "planning", "Set the wedding date", "تحديد موعد الزواج", M12, "urgent", "half", { doneAt: 0, start: 400 }),
  t("pl-family", "planning", "Initial family planning discussion", "جلسة التخطيط الأولى مع العائلة", M12, "high", "half", { doneAt: 1 }),
  t("pl-vision", "planning", "Define your wedding vision", "تحديد رؤيتك لحفل الزفاف", M12, "normal", "hour", { doneAt: 1 }),
  t("pl-budget", "planning", "Agree on the total budget", "الاتفاق على الميزانية الكاملة", M12, "urgent", "half", { doneAt: 1 }),
  t("pl-guests", "planning", "Estimate the guest count", "تقدير عدد المدعوين", M12, "high", "hour", { doneAt: 1 }),
  t("pl-folder", "planning", "Create your wedding planning folder", "تجهيز ملف التخطيط للزواج", M10, "low", "quick", { doneAt: 1 }),
  t("pl-timeline", "planning", "Agree on the overall timeline", "الاتفاق على الجدول الزمني العام", M10, "normal", "hour", { doneAt: 1 }),
  t("pl-legal", "planning", "Research legal marriage requirements", "معرفة متطلبات الزواج الرسمية", M8, "high", "hour", { doneAt: 2 }),
  t("pl-docs", "planning", "Prepare the required documents", "تجهيز الأوراق المطلوبة", M4, "high", "half", { deps: ["pl-legal"], doneAt: 3 }),
  t("pl-milka-req", "planning", "Confirm عقد القران requirements", "تأكيد متطلبات عقد القران", M4, "high", "hour", { when: "milka", deps: ["pl-legal"], doneAt: 3 }),
  t("pl-family-dates", "planning", "Confirm important family dates", "تأكيد مواعيد العائلة المهمة", M10, "normal", "quick", { doneAt: 1 }),
  t("pl-contacts", "planning", "Build your master contact list", "إعداد قائمة جهات الاتصال الرئيسية", M8, "normal", "hour", { doneAt: 2 }),

  // VENUE
  t("ve-research", "venue", "Research venues", "البحث عن قاعات", M12, "high", "half", { doneAt: 1, start: 420 }),
  t("ve-shortlist", "venue", "Shortlist your favourite venues", "اختيار القاعات المرشحة", M12 - 15, "high", "hour", { deps: ["ve-research"], doneAt: 1 }),
  t("ve-visit", "venue", "Visit the shortlisted venues", "زيارة القاعات المرشحة", M12 - 30, "high", "day", { deps: ["ve-shortlist"], doneAt: 1 }),
  t("ve-compare", "venue", "Compare venue packages", "مقارنة باقات القاعات", M12 - 35, "normal", "hour", { deps: ["ve-visit"], doneAt: 1 }),
  t("ve-capacity", "venue", "Check capacity for your guest count", "التأكد من استيعاب القاعة للمدعوين", M12 - 35, "high", "quick", { deps: ["ve-visit"], doneAt: 1 }),
  t("ve-bridal-room", "venue", "Check the bridal room", "معاينة غرفة العروس", M12 - 35, "normal", "quick", { doneAt: 1 }),
  t("ve-parking", "venue", "Check parking and access", "التأكد من المواقف وسهولة الوصول", M12 - 35, "low", "quick", { doneAt: 1 }),
  t("ve-catering-policy", "venue", "Check the catering policy", "معرفة سياسة الضيافة في القاعة", M12 - 35, "normal", "quick", { doneAt: 1 }),
  t("ve-decor-rules", "venue", "Check decoration restrictions", "معرفة قيود التزيين", M12 - 35, "normal", "quick", { doneAt: 1 }),
  t("ve-sound-rules", "venue", "Check sound and timing restrictions", "معرفة قيود الصوت والتوقيت", M12 - 35, "low", "quick", { doneAt: 1 }),
  t("ve-cancel", "venue", "Review the cancellation policy", "مراجعة سياسة الإلغاء", M12 - 40, "high", "quick", { doneAt: 1 }),
  t("ve-terms", "venue", "Review the payment terms", "مراجعة شروط الدفع", M12 - 40, "high", "quick", { doneAt: 1 }),
  t("ve-contract", "venue", "Sign the venue contract", "توقيع عقد القاعة", M10, "urgent", "hour", { deps: ["ve-compare"], doneAt: 1, milestone: ["Venue booked", "تم حجز القاعة"] }),
  t("ve-deposit", "venue", "Pay the venue deposit", "دفع عربون القاعة", M10, "urgent", "quick", { deps: ["ve-contract"], doneAt: 1 }),
  t("ve-layout", "venue", "Confirm the final layout", "اعتماد التوزيع النهائي للقاعة", W3, "high", "hour", { deps: ["gu-final"] }),
  t("ve-access", "venue", "Confirm venue access time for vendors", "تأكيد وقت دخول الموردين للقاعة", W2, "normal", "quick"),
  t("ve-final", "venue", "Final venue confirmation", "التأكيد النهائي مع القاعة", W1, "urgent", "quick"),

  // PLANNER
  t("pn-research", "planner", "Research wedding planners", "البحث عن منسقة حفلات", M10, "normal", "hour", { doneAt: 2 }),
  t("pn-quotes", "planner", "Request planner quotations", "طلب عروض أسعار من المنسقات", M10 - 10, "normal", "quick", { deps: ["pn-research"], doneAt: 2 }),
  t("pn-portfolio", "planner", "Review planner portfolios", "مراجعة أعمال المنسقات", M10 - 15, "normal", "hour", { doneAt: 2 }),
  t("pn-book", "planner", "Book your planner", "حجز المنسقة", M8, "high", "quick", { deps: ["pn-quotes"], doneAt: 2 }),
  t("pn-contract", "planner", "Sign the planner contract", "توقيع عقد المنسقة", M8, "high", "quick", { deps: ["pn-book"], doneAt: 2 }),
  t("pn-timeline", "planner", "Share your master timeline with the planner", "مشاركة الجدول الكامل مع المنسقة", M1, "normal", "quick", { deps: ["pn-book"] }),
  t("pn-final", "planner", "Final coordination meeting", "اجتماع التنسيق النهائي", W1, "high", "hour"),

  // PHOTOGRAPHY & VIDEO
  t("ph-research", "photo", "Research photographers", "البحث عن مصورات", M10, "high", "half", { doneAt: 2 }),
  t("ph-portfolios", "photo", "Review photography portfolios", "مراجعة أعمال المصورات", M10 - 10, "normal", "hour", { doneAt: 2 }),
  t("ph-style", "photo", "Decide your photography style", "تحديد أسلوب التصوير", M10 - 15, "normal", "quick", { doneAt: 2 }),
  t("ph-package", "photo", "Request photography packages", "طلب باقات التصوير", M10 - 20, "normal", "quick", { doneAt: 2 }),
  t("ph-female", "photo", "Confirm a female photographer if required", "تأكيد مصورة نسائية عند الحاجة", M10 - 20, "high", "quick", { doneAt: 2 }),
  t("ph-book", "photo", "Book your photographer", "حجز المصورة", M8, "urgent", "quick", { deps: ["ph-package"], doneAt: 2, milestone: ["Photographer booked", "تم حجز المصورة"] }),
  t("ph-video", "photo", "Book your videographer", "حجز مصورة الفيديو", M8, "high", "quick", { doneAt: 2 }),
  t("ph-ready", "photo", "Confirm getting-ready coverage", "تأكيد تصوير التجهيزات", M2, "normal", "quick", { deps: ["ph-book"] }),
  t("ph-family", "photo", "Confirm couple and family shots", "تأكيد صور العروسين والعائلة", M1, "normal", "quick", { deps: ["ph-book"] }),
  t("ph-shotlist", "photo", "Prepare your photography shot list", "تجهيز قائمة اللقطات المطلوبة", W3, "normal", "hour", { deps: ["ph-book"] }),
  t("ph-names", "photo", "Share important family names", "مشاركة أسماء أفراد العائلة المهمين", W2, "low", "quick", { deps: ["ph-book"] }),
  t("ph-delivery", "photo", "Confirm the delivery timeline", "تأكيد موعد تسليم الصور", M1, "low", "quick", { deps: ["ph-book"] }),
  t("ph-privacy", "photo", "Confirm privacy and social-media preferences", "تأكيد الخصوصية والنشر على السوشيال ميديا", M1, "high", "quick", { deps: ["ph-book"] }),

  // DRESS
  t("dr-budget", "dress", "Set your dress budget", "تحديد ميزانية الفستان", M10, "normal", "quick", { doneAt: 3 }),
  t("dr-inspo", "dress", "Collect dress inspiration", "جمع أفكار للفستان", M10, "normal", "hour", { doneAt: 3 }),
  t("dr-research", "dress", "Research boutiques and designers", "البحث عن المصممات والمحلات", M8 + 20, "high", "half", { doneAt: 3 }),
  t("dr-consult", "dress", "Book designer consultations", "حجز مواعيد مع المصممات", M8, "high", "quick", { deps: ["dr-research"], doneAt: 3 }),
  t("dr-select", "dress", "Choose your wedding dress", "اختيار فستان الزفاف", M6 + 30, "urgent", "day", { deps: ["dr-consult"], doneAt: 3, milestone: ["Wedding dress chosen", "تم اختيار الفستان"] }),
  t("dr-measure", "dress", "Take measurements", "أخذ المقاسات", M6 + 25, "high", "hour", { deps: ["dr-select"], doneAt: 3 }),
  t("dr-deposit", "dress", "Pay the dress deposit", "دفع عربون الفستان", M6 + 25, "high", "quick", { deps: ["dr-select"], doneAt: 3 }),
  t("dr-fit1", "dress", "First fitting", "البروفة الأولى", M3, "high", "hour", { deps: ["dr-measure"] }),
  t("dr-fit2", "dress", "Second fitting", "البروفة الثانية", M1 + 10, "high", "hour", { deps: ["dr-fit1"] }),
  t("dr-fit3", "dress", "Final fitting", "البروفة النهائية", W2, "urgent", "hour", { deps: ["dr-fit2"] }),
  t("dr-veil", "dress", "Confirm your veil", "اعتماد الطرحة", M2, "normal", "quick", { deps: ["dr-select"] }),
  t("dr-alter", "dress", "Confirm all alterations", "اعتماد جميع التعديلات", W2, "high", "quick", { deps: ["dr-fit3"] }),
  t("dr-pickup", "dress", "Arrange dress pickup", "ترتيب استلام الفستان", W1, "high", "quick", { deps: ["dr-alter"] }),
  t("dr-steam", "dress", "Arrange dress steaming", "ترتيب كي الفستان بالبخار", D3, "normal", "quick", { deps: ["dr-pickup"] }),
  t("dr-store", "dress", "Store the dress safely", "حفظ الفستان بشكل آمن", D3, "normal", "quick"),
  t("dr-plan", "dress", "Plan who helps you get dressed", "تحديد من يساعدك في لبس الفستان", D3, "normal", "quick"),

  // BRIDAL LOOK
  t("lk-mua-research", "look", "Research makeup artists", "البحث عن خبيرات المكياج", M8, "high", "half", { doneAt: 2 }),
  t("lk-hair-research", "look", "Research hair stylists", "البحث عن مصففات الشعر", M8, "normal", "hour", { doneAt: 2 }),
  t("lk-mua-book", "look", "Book your makeup artist", "حجز خبيرة المكياج", M6, "urgent", "quick", { deps: ["lk-mua-research"], doneAt: 2, milestone: ["Makeup artist booked", "تم حجز خبيرة المكياج"] }),
  t("lk-hair-book", "look", "Book your hair stylist", "حجز مصففة الشعر", M6, "high", "quick", { deps: ["lk-hair-research"], doneAt: 2 }),
  t("lk-mua-trial", "look", "Makeup trial", "تجربة المكياج", M2, "high", "half", { deps: ["lk-mua-book"] }),
  t("lk-hair-trial", "look", "Hair trial", "تجربة تسريحة الشعر", M2, "high", "half", { deps: ["lk-hair-book"] }),
  t("lk-refs", "look", "Save your reference looks", "حفظ صور الإطلالة المرجعية", M2 + 10, "low", "quick"),
  t("lk-timing", "look", "Confirm wedding-day timing with your artists", "تأكيد مواعيد يوم الزفاف مع خبيرات التجميل", W2, "high", "quick", { deps: ["lk-mua-book"] }),
  t("lk-location", "look", "Confirm your getting-ready location", "تأكيد مكان التجهيز", W3, "normal", "quick"),
  t("lk-touchup", "look", "Prepare touch-up products", "تجهيز مستلزمات تعديل المكياج", W1, "normal", "quick"),

  // BEAUTY PREPARATION
  t("bt-routine", "beauty", "Start your skin-care routine", "بدء روتين العناية بالبشرة", M6, "normal", "quick"),
  t("bt-hair-care", "beauty", "Plan your hair-care schedule", "وضع جدول للعناية بالشعر", M5, "normal", "quick"),
  t("bt-dental", "beauty", "Dental check-up and cleaning", "فحص وتنظيف الأسنان", M2, "normal", "hour"),
  t("bt-facial", "beauty", "Book facial appointments", "حجز جلسات تنظيف البشرة", M2, "normal", "quick"),
  t("bt-color", "beauty", "Hair colour appointment", "موعد صبغة الشعر", W3, "normal", "half"),
  t("bt-trim", "beauty", "Hair trim", "قص أطراف الشعر", W2, "low", "hour"),
  t("bt-brows", "beauty", "Brow and lash appointment", "موعد الحواجب والرموش", W1, "normal", "hour"),
  t("bt-hammam", "beauty", "Hammam or relaxation appointment", "موعد الحمام المغربي أو الاسترخاء", D3, "low", "half"),
  t("bt-nails", "beauty", "Manicure and pedicure", "مناكير وباديكير", D1 + 1, "normal", "hour"),
  t("bt-waxing", "beauty", "Waxing appointment", "موعد إزالة الشعر", D3, "normal", "hour"),

  // JEWELLERY & GOLD
  t("jw-plan", "jewellery", "Decide your wedding jewellery", "تحديد مجوهرات الزفاف", M5, "high", "hour", { doneAt: 3 }),
  t("jw-gold", "jewellery", "Choose gold pieces", "اختيار الذهب", M4, "high", "half", { doneAt: 3 }),
  t("jw-set", "jewellery", "Necklace, earrings and bracelet", "العقد والأقراط والإسوارة", M4, "normal", "half", { doneAt: 3 }),
  t("jw-rings", "jewellery", "Wedding rings", "خواتم الزواج", M3, "high", "hour", { doneAt: 3 }),
  t("jw-watch", "jewellery", "Watches", "الساعات", M3, "low", "hour", { doneAt: 3 }),
  t("jw-hair", "jewellery", "Hair jewellery", "إكسسوارات الشعر", M2, "low", "hour"),
  t("jw-clean", "jewellery", "Clean your jewellery", "تنظيف المجوهرات", W1, "low", "quick"),
  t("jw-carrier", "jewellery", "Decide who brings the jewellery to the venue", "تحديد من يوصل المجوهرات للقاعة", D3, "high", "quick"),

  // SHOES & ACCESSORIES
  t("ac-heels", "accessories", "Wedding heels", "حذاء الزفاف", M3, "high", "half"),
  t("ac-backup", "accessories", "Comfortable backup shoes", "حذاء مريح احتياطي", M1, "normal", "hour"),
  t("ac-clutch", "accessories", "Bridal clutch", "حقيبة العروس", M2, "low", "hour"),
  t("ac-perfume", "accessories", "Choose your wedding perfume", "اختيار عطر الزواج", M2, "normal", "hour"),
  t("ac-robe", "accessories", "Bridal robe and getting-ready outfit", "روب العروس وملابس التجهيز", M1, "low", "hour"),
  t("ac-bags", "accessories", "Garment bags and jewellery box", "أكياس الملابس وعلبة المجوهرات", W3, "low", "quick"),
  t("ac-break", "accessories", "Break in your wedding shoes at home", "تعويد القدم على حذاء الزفاف", W2, "normal", "quick", { deps: ["ac-heels"] }),

  // TROUSSEAU
  t("tr-list", "trousseau", "Create your trousseau shopping list", "إعداد قائمة مشتريات الجهاز", M6, "high", "hour"),
  t("tr-budget", "trousseau", "Set a trousseau budget", "تحديد ميزانية الجهاز", M6, "normal", "quick"),
  t("tr-abayas", "trousseau", "Abayas and occasion wear", "العبايات وملابس المناسبات", M3, "normal", "day"),
  t("tr-night", "trousseau", "Nightwear and lingerie", "ملابس النوم والملابس الداخلية", M2, "normal", "half"),
  t("tr-beauty", "trousseau", "Makeup, skincare and haircare", "المكياج والعناية بالبشرة والشعر", M2, "normal", "half"),
  t("tr-travel", "trousseau", "Travel clothes", "ملابس السفر", M1, "normal", "half", { when: "honeymoon" }),
  t("tr-organise", "trousseau", "Organise and pack the trousseau", "ترتيب الجهاز وتغليفه", W2, "normal", "day"),

  // GROOM
  t("gr-outfit", "groom", "Groom's thobe and bisht", "ثوب العريس والبشت", M2, "high", "half", { when: "groom" }),
  t("gr-shoes", "groom", "Groom's shoes, watch and perfume", "حذاء وساعة وعطر العريس", M1, "normal", "hour", { when: "groom" }),
  t("gr-groom", "groom", "Groom's haircut and grooming", "حلاقة وتجهيز العريس", D3, "normal", "hour", { when: "groom" }),
  t("gr-docs", "groom", "Groom's documents", "أوراق العريس", M1, "high", "quick", { when: "groom" }),

  // INVITATIONS
  t("in-style", "invitations", "Choose your invitation style", "اختيار تصميم الدعوة", M5, "normal", "hour", { doneAt: 3 }),
  t("in-design", "invitations", "Design the invitation", "تصميم بطاقة الدعوة", M4, "high", "half", { deps: ["in-style"], doneAt: 3 }),
  t("in-wording", "invitations", "Approve the invitation wording", "اعتماد نص الدعوة", M4, "high", "hour", { doneAt: 3 }),
  t("in-proof-ar", "invitations", "Arabic proofreading", "التدقيق اللغوي العربي", M3 + 20, "normal", "quick", { deps: ["in-wording"] }),
  t("in-proof-en", "invitations", "English proofreading", "التدقيق اللغوي الإنجليزي", M3 + 20, "low", "quick", { deps: ["in-wording"] }),
  t("in-phones", "invitations", "Collect guest phone numbers", "جمع أرقام المدعوين", M3, "high", "half"),
  t("in-digital", "invitations", "Create the digital invitation", "تجهيز الدعوة الإلكترونية", M3, "normal", "hour", { deps: ["in-design"] }),
  t("in-print", "invitations", "Print invitations if needed", "طباعة الدعوات عند الحاجة", M2 + 15, "low", "hour", { deps: ["in-design"] }),
  t("in-send", "invitations", "Send the invitations", "إرسال الدعوات", M2, "urgent", "half", { deps: ["in-digital", "in-phones"], milestone: ["Invitations sent", "تم إرسال الدعوات"] }),
  t("in-track", "invitations", "Track invitation delivery", "متابعة وصول الدعوات", M1 + 20, "normal", "quick", { deps: ["in-send"] }),
  t("in-remind", "invitations", "Send RSVP reminders", "إرسال تذكير بتأكيد الحضور", W3 + 5, "high", "hour", { deps: ["in-send"] }),

  // GUESTS
  t("gu-list", "guests", "Build your guest list", "إعداد قائمة المدعوين", M6, "high", "day", { doneAt: 3 }),
  t("gu-sides", "guests", "Agree bride and groom side numbers", "الاتفاق على أعداد أهل العروس والعريس", M6, "high", "hour", { doneAt: 3 }),
  t("gu-rsvp", "guests", "Set the RSVP deadline", "تحديد آخر موعد لتأكيد الحضور", M2, "normal", "quick"),
  t("gu-final", "guests", "Confirm final attendance", "تأكيد العدد النهائي للحضور", W3, "urgent", "hour", { deps: ["in-remind"], milestone: ["Guest list confirmed", "اكتمل تأكيد الحضور"] }),
  t("gu-seating", "guests", "Finalise the seating plan", "اعتماد توزيع الطاولات", W2, "high", "half", { deps: ["gu-final"] }),
  t("gu-vip", "guests", "Plan VIP and elderly guest care", "ترتيب استقبال كبار السن والضيوف المميزين", W2, "normal", "quick"),

  // CATERING
  t("ca-select", "catering", "Select your caterer", "اختيار مزوّد الضيافة", M6, "high", "half", { doneAt: 3 }),
  t("ca-tasting", "catering", "Menu tasting", "تذوق قائمة الطعام", M3, "high", "half", { deps: ["ca-select"] }),
  t("ca-menu", "catering", "Confirm the menu", "اعتماد قائمة الطعام", M2, "high", "hour", { deps: ["ca-tasting"] }),
  t("ca-diet", "catering", "Note dietary requirements", "تحديد الاحتياجات الغذائية الخاصة", M1, "normal", "quick"),
  t("ca-drinks", "catering", "Drinks, coffee and tea", "المشروبات والقهوة والشاي", M1 + 15, "normal", "quick"),
  t("ca-gahwa", "catering", "Arabic coffee and dates service", "تقديم القهوة العربية والتمر", M1 + 15, "normal", "quick"),
  t("ca-dessert", "catering", "Desserts and sweets", "الحلويات", M1 + 15, "normal", "hour"),
  t("ca-cake", "catering", "Order the wedding cake", "طلب كيكة الزفاف", M2, "high", "hour"),
  t("ca-schedule", "catering", "Agree the serving schedule", "الاتفاق على جدول التقديم", W2, "normal", "quick"),
  t("ca-count", "catering", "Send the final guest count to the caterer", "إرسال العدد النهائي لمزوّد الضيافة", W2 - 2, "urgent", "quick", { deps: ["gu-final"] }),
  t("ca-vendor-meals", "catering", "Arrange vendor meals", "ترتيب وجبات فريق العمل", W1, "low", "quick"),

  // DECORATION
  t("de-theme", "decor", "Choose your wedding theme", "اختيار طابع الزفاف", M8, "high", "hour", { doneAt: 2 }),
  t("de-mood", "decor", "Create a decoration moodboard", "إعداد لوحة إلهام للديكور", M8, "normal", "hour", { doneAt: 2 }),
  t("de-book", "decor", "Book your decorator", "حجز منسقة الديكور", M6, "urgent", "half", { doneAt: 3 }),
  t("de-kosha", "decor", "Design the stage / kosha", "تصميم الكوشة", M4, "high", "half", { deps: ["de-book"], doneAt: 3 }),
  t("de-flowers", "decor", "Choose flowers and arrangements", "اختيار الورود والتنسيقات", M3, "normal", "hour", { deps: ["de-book"] }),
  t("de-tables", "decor", "Tables, chairs and linens", "الطاولات والكراسي والمفارش", M3, "normal", "hour"),
  t("de-entrance", "decor", "Entrance and bridal walkway", "المدخل وممر العروس", M3, "normal", "hour"),
  t("de-light", "decor", "Lighting and candles", "الإضاءة والشموع", M2, "normal", "quick"),
  t("de-sign", "decor", "Signage, welcome board and table numbers", "اللوحات الترحيبية وأرقام الطاولات", M1, "low", "hour"),
  t("de-guestbook", "decor", "Guestbook", "دفتر الضيوف", M1, "low", "quick"),
  t("de-cake-table", "decor", "Cake table styling", "تنسيق طاولة الكيك", M1, "low", "quick"),
  t("de-walk", "decor", "Final décor walkthrough", "الجولة النهائية على الديكور", D1, "high", "hour"),

  // ENTERTAINMENT
  t("en-book", "entertainment", "Book DJ, band or traditional performers", "حجز الفرقة أو منسقة الأغاني", M6, "high", "half", { doneAt: 3 }),
  t("en-zaffa", "entertainment", "Arrange the zaffa", "ترتيب الزفّة", M3, "high", "hour"),
  t("en-sound", "entertainment", "Confirm the sound system", "تأكيد نظام الصوت", M1, "normal", "quick"),
  t("en-entrance", "entertainment", "Choose your entrance music", "اختيار موسيقى دخول العروس", M1, "high", "hour"),
  t("en-songs", "entertainment", "Special songs and family requests", "الأغاني الخاصة وطلبات العائلة", W3, "low", "quick"),
  t("en-mics", "entertainment", "Microphones and audio test", "الميكروفونات واختبار الصوت", D1, "normal", "quick"),

  // ENGAGEMENT / PROPOSAL
  t("eg-date", "engagement", "Set the engagement date", "تحديد موعد الخطوبة", M10, "high", "quick", { when: "engagement", doneAt: 1 }),
  t("eg-outfit", "engagement", "Engagement outfit", "فستان الخطوبة", M10 - 20, "normal", "half", { when: "engagement", doneAt: 1 }),
  t("eg-hosting", "engagement", "Engagement hosting and sweets", "ضيافة وحلويات الخطوبة", M10 - 20, "normal", "hour", { when: "engagement", doneAt: 1 }),
  t("pr-plan", "engagement", "Plan the family proposal visit", "ترتيب زيارة الخطبة", M12, "high", "hour", { when: "proposal", doneAt: 1 }),
  t("pr-hosting", "engagement", "Hospitality for the proposal visit", "ضيافة زيارة الخطبة", M12, "normal", "hour", { when: "proposal", doneAt: 1 }),

  // MILKA / AQD
  t("mk-docs", "milka", "Prepare legal documents for the عقد", "تجهيز الأوراق الرسمية للعقد", M4, "urgent", "half", { when: "milka", doneAt: 3 }),
  t("mk-appt", "milka", "Book the عقد appointment", "حجز موعد عقد القران", M3, "urgent", "quick", { when: "milka", deps: ["mk-docs"] }),
  t("mk-venue", "milka", "Milka venue", "مكان الملكة", M3, "high", "hour", { when: "milka" }),
  t("mk-outfit", "milka", "Milka outfit", "فستان الملكة", M2, "high", "half", { when: "milka" }),
  t("mk-look", "milka", "Milka makeup and hair", "مكياج وتسريحة الملكة", M2, "normal", "quick", { when: "milka" }),
  t("mk-photo", "milka", "Milka photography and flowers", "تصوير وورود الملكة", M2, "normal", "quick", { when: "milka" }),
  t("mk-rings", "milka", "Rings for the milka", "خواتم الملكة", M2, "high", "hour", { when: "milka" }),
  t("mk-hosting", "milka", "Family arrangements and hospitality", "ترتيبات العائلة والضيافة", M1, "normal", "hour", { when: "milka" }),

  // HENNA
  t("hn-venue", "henna", "Henna night venue", "مكان ليلة الحناء", M4, "high", "hour", { when: "henna" }),
  t("hn-artist", "henna", "Book your henna artist", "حجز نقّاشة الحناء", M3, "urgent", "quick", { when: "henna" }),
  t("hn-outfit", "henna", "Henna outfit", "فستان الحناء", M2, "high", "half", { when: "henna" }),
  t("hn-decor", "henna", "Henna decoration", "ديكور الحناء", M2, "normal", "hour", { when: "henna" }),
  t("hn-invites", "henna", "Henna invitations", "دعوات الحناء", M2, "normal", "quick", { when: "henna" }),
  t("hn-catering", "henna", "Henna catering", "ضيافة الحناء", M1, "normal", "quick", { when: "henna" }),
  t("hn-music", "henna", "Henna music and photography", "موسيقى وتصوير الحناء", M1, "normal", "quick", { when: "henna" }),
  t("hn-gifts", "henna", "Henna gifts and accessories", "توزيعات وإكسسوارات الحناء", W3, "low", "hour", { when: "henna" }),

  // BRIDAL SHOWER
  t("sh-host", "shower", "Agree the host, date and place", "تحديد المضيفة والموعد والمكان", M2, "normal", "quick", { when: "shower" }),
  t("sh-theme", "shower", "Shower theme and invitations", "طابع ودعوات حفلة الشاور", M2 - 10, "low", "hour", { when: "shower" }),
  t("sh-outfit", "shower", "Shower outfit", "فستان حفلة الشاور", M1, "normal", "half", { when: "shower" }),
  t("sh-details", "shower", "Food, cake, décor and activities", "الطعام والكيك والديكور والأنشطة", W3, "low", "hour", { when: "shower" }),

  // NEW HOME
  t("hm-plan", "home", "Make your new-home plan", "وضع خطة تجهيز البيت الجديد", M8, "high", "hour", { when: "home" }),
  t("hm-budget", "home", "Set a home budget", "تحديد ميزانية البيت", M8, "high", "quick", { when: "home" }),
  t("hm-furniture", "home", "Order furniture", "طلب الأثاث", M5, "high", "day", { when: "home" }),
  t("hm-appliances", "home", "Buy appliances", "شراء الأجهزة الكهربائية", M3, "normal", "half", { when: "home" }),
  t("hm-kitchen", "home", "Kitchen, cookware and dinnerware", "المطبخ والأواني وأطقم التقديم", M2, "normal", "half", { when: "home" }),
  t("hm-bedding", "home", "Bedding and towels", "المفارش والمناشف", M2, "normal", "hour", { when: "home" }),
  t("hm-delivery", "home", "Schedule deliveries and installation", "ترتيب التوصيل والتركيب", M1, "high", "hour", { when: "home" }),
  t("hm-clean", "home", "Deep clean and organise the home", "تنظيف وترتيب البيت", W2, "normal", "day", { when: "home" }),
  t("hm-fragrance", "home", "Home fragrance and final touches", "بخور ومعطرات ولمسات أخيرة", W1, "low", "hour", { when: "home" }),

  // HONEYMOON
  t("hy-destination", "honeymoon", "Choose your honeymoon destination", "اختيار وجهة شهر العسل", M6, "high", "hour", { when: "honeymoon" }),
  t("hy-passport", "honeymoon", "Check passport expiry dates", "التأكد من صلاحية الجوازات", M5, "urgent", "quick", { when: "honeymoon" }),
  t("hy-flights", "honeymoon", "Book flights", "حجز الطيران", M4, "high", "hour", { when: "honeymoon", deps: ["hy-destination"] }),
  t("hy-hotel", "honeymoon", "Book hotels", "حجز الفنادق", M4, "high", "hour", { when: "honeymoon", deps: ["hy-destination"] }),
  t("hy-visa", "honeymoon", "Apply for visas if needed", "التقديم على التأشيرة عند الحاجة", M3, "urgent", "half", { when: "honeymoon", deps: ["hy-passport"] }),
  t("hy-insurance", "honeymoon", "Travel insurance", "تأمين السفر", M1, "high", "quick", { when: "honeymoon" }),
  t("hy-transfer", "honeymoon", "Airport transfers and transport", "التنقل من وإلى المطار", M1, "normal", "quick", { when: "honeymoon" }),
  t("hy-itinerary", "honeymoon", "Plan your itinerary and reservations", "تخطيط البرنامج والحجوزات", W3, "low", "hour", { when: "honeymoon" }),
  t("hy-money", "honeymoon", "Currency and eSIM", "العملة وشريحة الاتصال", W1, "normal", "quick", { when: "honeymoon" }),
  t("hy-pack", "honeymoon", "Pack for the honeymoon", "تجهيز شنطة شهر العسل", D3, "high", "half", { when: "honeymoon" }),

  // WEDDING WEEK & DAY
  t("wd-confirm", "weddingday", "Confirm every vendor", "تأكيد جميع الموردين", W1, "urgent", "hour", { milestone: ["All vendors confirmed", "تم تأكيد جميع الموردين"] }),
  t("wd-timeline", "weddingday", "Share the wedding-day timeline", "مشاركة جدول يوم الزفاف", W1, "high", "hour"),
  t("wd-payments", "weddingday", "Prepare final payments and envelopes", "تجهيز الدفعات الأخيرة والظروف", W1, "high", "hour"),
  t("wd-sos", "weddingday", "Pack your SOS kit", "تجهيز حقيبة الطوارئ", D3, "normal", "hour"),
  t("wd-bag", "weddingday", "Pack the wedding-day bag", "تجهيز حقيبة يوم الزفاف", D1, "high", "hour"),
  t("wd-rest", "weddingday", "Rest early the night before", "النوم مبكرًا ليلة الزفاف", D1, "normal", "quick"),
  t("wd-day", "weddingday", "Enjoy your wedding day", "استمتعي بيوم زفافك", 0, "high", "day"),
  t("wd-sabahiya", "weddingday", "Prepare for the صباحية", "التجهيز للصباحية", -1, "normal", "hour", { when: "sabahiya" }),

  // AFTER
  t("af-dress", "after", "Clean and preserve the dress", "تنظيف الفستان وحفظه", -10, "low", "hour"),
  t("af-thanks", "after", "Send thank-you messages", "إرسال رسائل الشكر", -14, "normal", "hour"),
  t("af-photos", "after", "Receive and back up your photos", "استلام الصور وحفظ نسخة منها", -45, "normal", "quick"),
  t("af-reviews", "after", "Leave reviews for your favourite vendors", "تقييم الموردين المميزين", -21, "low", "quick"),
  t("af-budget", "after", "Close the budget", "إغلاق الميزانية", -21, "low", "quick"),
];

export const templateById = new Map(templates.map((x) => [x.id, x]));
export const MAX_LEAD = Math.max(...templates.map((x) => x.start ?? x.due + 21));
