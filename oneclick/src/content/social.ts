/**
 * Social content queue (Instagram-first). Workflow:
 * draft -> review -> approved -> scheduled -> published (or failed -> retry).
 * Default: owner approval before publishing. Auto-publish stays OFF until explicitly
 * enabled AND a Meta Professional account is connected (see docs/INSTAGRAM.md).
 * Seeded with the 30-day launch plan. All items start as "draft".
 */
export type SocialStatus = "draft" | "review" | "approved" | "scheduled" | "published" | "failed";
export type SocialFormat = "reel" | "carousel" | "story" | "post";
export type SocialPillar = "tip" | "demo" | "problem" | "before-after" | "tutorial" | "launch" | "behind" | "question" | "offer" | "education";

export type SocialItem = {
  day: number;
  format: SocialFormat;
  pillar: SocialPillar;
  product?: string;
  language: "ar" | "en" | "bilingual";
  hook: { en: string; ar: string };
  cta: { en: string; ar: string };
  link: string; // relative; UTM added by utmLink()
  campaign: string;
  status: SocialStatus;
  scheduledAt?: string;
};

const L = (en: string, ar: string) => ({ en, ar });
const save = L("Save this for later", "احفظه لبعدين");
const demo = L("Try the free demo, link in bio", "جرّب العرض المجاني، الرابط في البايو");
const follow = L("Follow for simpler days", "تابعنا ليوم أبسط");

export const launchPlan: SocialItem[] = [
  { day: 1, format: "reel", pillar: "launch", language: "bilingual", hook: L("Meet One Click Digital Hub: less effort, more life.", "تعرّف على ون كليك ديجيتال هب: جهد أقل، حياة أكثر."), cta: follow, link: "/", campaign: "launch", status: "draft" },
  { day: 2, format: "carousel", pillar: "problem", product: "oneclick-bride", language: "ar", hook: L("40 chats. 3 notebooks. 1 wedding.", "٤٠ محادثة. ٣ دفاتر. عرس واحد."), cta: demo, link: "/products/oneclick-bride", campaign: "launch-bride", status: "draft" },
  { day: 3, format: "story", pillar: "question", language: "bilingual", hook: L("Where do you keep your grocery list?", "وين تكتب قائمة المقاضي؟"), cta: L("Vote in the poll", "صوّت"), link: "/", campaign: "launch", status: "draft" },
  { day: 4, format: "reel", pillar: "demo", product: "oneclick-grocery", language: "ar", hook: L("Watch a messy list sort itself.", "شوف قائمة ملخبطة ترتب نفسها."), cta: demo, link: "/products/oneclick-grocery", campaign: "launch-grocery", status: "draft" },
  { day: 5, format: "carousel", pillar: "tip", language: "en", hook: L("3 rules for a grocery list that saves a second trip", "٣ قواعد لقائمة مقاضي توفر المشوار الثاني"), cta: save, link: "/guides/grocery-list-that-sorts-itself", campaign: "content", status: "draft" },
  { day: 6, format: "post", pillar: "behind", language: "bilingual", hook: L("Why our logo is one continuous line", "ليش شعارنا خط واحد متصل"), cta: follow, link: "/about", campaign: "brand", status: "draft" },
  { day: 7, format: "reel", pillar: "before-after", product: "oneclick-planner", language: "ar", hook: L("Sunday panic vs. a planned week", "توتر الأحد مقابل أسبوع مخطط"), cta: demo, link: "/products/oneclick-planner", campaign: "launch-planner", status: "draft" },
  { day: 8, format: "carousel", pillar: "education", product: "oneclick-bride", language: "ar", hook: L("Your wedding timeline: 6, 3 and 1 month out", "جدول عرسك: قبل ٦ و٣ وشهر"), cta: save, link: "/guides/wedding-planning-timeline", campaign: "content-bride", status: "draft" },
  { day: 9, format: "story", pillar: "demo", product: "weekly-reset-checklist", language: "bilingual", hook: L("A free 15-minute weekly reset", "ترتيب أسبوعي مجاني في ١٥ دقيقة"), cta: L("Open it free", "افتحه مجانًا"), link: "/products/weekly-reset-checklist", campaign: "lead-magnet", status: "draft" },
  { day: 10, format: "reel", pillar: "tutorial", product: "oneclick-grocery", language: "en", hook: L("Build your regulars list in 60 seconds", "جهّز قائمة أغراضك المعتادة في ٦٠ ثانية"), cta: demo, link: "/products/oneclick-grocery", campaign: "launch-grocery", status: "draft" },
  { day: 11, format: "post", pillar: "question", language: "ar", hook: L("What takes too much effort in your week?", "وش الشي اللي ياخذ منك جهد زيادة في أسبوعك؟"), cta: L("Tell us in the comments", "قول لنا في التعليقات"), link: "/", campaign: "community", status: "draft" },
  { day: 12, format: "carousel", pillar: "tip", product: "oneclick-planner", language: "bilingual", hook: L("The 3-priority day", "يوم الأولويات الثلاث"), cta: save, link: "/guides/three-priorities-a-day", campaign: "content", status: "draft" },
  { day: 13, format: "reel", pillar: "problem", product: "oneclick-bride", language: "ar", hook: L("When the hall deposit is somewhere in WhatsApp…", "لما عربون القاعة ضايع في الواتساب…"), cta: demo, link: "/products/oneclick-bride", campaign: "launch-bride", status: "draft" },
  { day: 14, format: "story", pillar: "behind", language: "bilingual", hook: L("Designing in Arabic first", "نصمم بالعربي أولًا"), cta: follow, link: "/about", campaign: "brand", status: "draft" },
  { day: 15, format: "reel", pillar: "demo", product: "oneclick-fit", language: "en", hook: L("Log a workout in 3 taps", "سجّل تمرينك في ٣ ضغطات"), cta: demo, link: "/products/oneclick-fit", campaign: "launch-fit", status: "draft" },
  { day: 16, format: "carousel", pillar: "before-after", product: "oneclick-grocery", language: "ar", hook: L("Chat list vs. One Click Digital Hub list", "قائمة الواتساب مقابل قائمة ون كليك ديجيتال هب"), cta: demo, link: "/products/oneclick-grocery", campaign: "launch-grocery", status: "draft" },
  { day: 17, format: "post", pillar: "education", language: "bilingual", hook: L("Honest launch: no fake reviews, ever", "إطلاق بصدق: لا تقييمات وهمية أبدًا"), cta: follow, link: "/", campaign: "brand", status: "draft" },
  { day: 18, format: "reel", pillar: "tutorial", product: "oneclick-bride", language: "ar", hook: L("Set your wedding budget in 2 minutes", "حددي ميزانية العرس في دقيقتين"), cta: demo, link: "/products/oneclick-bride", campaign: "launch-bride", status: "draft" },
  { day: 19, format: "story", pillar: "question", product: "oneclick-planner", language: "ar", hook: L("Week starts Sunday or Monday?", "أسبوعك يبدأ الأحد ولا الاثنين؟"), cta: L("Vote", "صوّت"), link: "/products/oneclick-planner", campaign: "community", status: "draft" },
  { day: 20, format: "carousel", pillar: "tip", language: "en", hook: L("5 tiny habits that make Sunday easier", "٥ عادات صغيرة تسهّل يوم الأحد"), cta: save, link: "/products/weekly-reset-checklist", campaign: "lead-magnet", status: "draft" },
  { day: 21, format: "reel", pillar: "launch", language: "bilingual", hook: L("Custom websites and mini apps, made for you", "مواقع وتطبيقات صغيرة، مصممة لك"), cta: L("Request a custom solution", "اطلب حل خاص"), link: "/custom", campaign: "custom", status: "draft" },
  { day: 22, format: "post", pillar: "behind", language: "ar", hook: L("How we pick which product to build next", "كيف نختار المنتج الجاي"), cta: L("Suggest one in the comments", "اقترح في التعليقات"), link: "/", campaign: "community", status: "draft" },
  { day: 23, format: "reel", pillar: "before-after", product: "oneclick-bride", language: "ar", hook: L("94 days to go, and finally calm", "باقي ٩٤ يوم، وأخيرًا هدوء"), cta: demo, link: "/products/oneclick-bride", campaign: "launch-bride", status: "draft" },
  { day: 24, format: "carousel", pillar: "education", product: "oneclick-fit", language: "en", hook: L("Consistency beats intensity", "الاستمرارية أهم من الشدة"), cta: save, link: "/products/oneclick-fit", campaign: "launch-fit", status: "draft" },
  { day: 25, format: "story", pillar: "demo", product: "oneclick-grocery", language: "ar", hook: L("Know the total before the cashier", "اعرف المجموع قبل الكاشير"), cta: demo, link: "/products/oneclick-grocery", campaign: "launch-grocery", status: "draft" },
  { day: 26, format: "reel", pillar: "tip", language: "bilingual", hook: L("One place for every decision", "مكان واحد لكل قرار"), cta: follow, link: "/", campaign: "brand", status: "draft" },
  { day: 27, format: "post", pillar: "question", language: "en", hook: L("Which One Click Digital Hub should we build next?", "وش المنتج اللي نسويه بعدين؟"), cta: L("Vote in stories", "صوّت في الستوري"), link: "/", campaign: "community", status: "draft" },
  { day: 28, format: "carousel", pillar: "demo", product: "oneclick-planner", language: "ar", hook: L("A tour of One Click Planner", "جولة في ون كليك مخطط"), cta: demo, link: "/products/oneclick-planner", campaign: "launch-planner", status: "draft" },
  { day: 29, format: "reel", pillar: "offer", language: "bilingual", hook: L("Launch week: be first to know", "أسبوع الإطلاق: كن أول من يعرف"), cta: L("Turn on notifications", "فعّل التنبيهات"), link: "/products", campaign: "launch", status: "draft" },
  { day: 30, format: "post", pillar: "launch", language: "bilingual", hook: L("Thank you for the first month", "شكرًا على أول شهر"), cta: follow, link: "/", campaign: "launch", status: "draft" },
];

/** Campaign link with UTM parameters. Send traffic to the relevant page, not always home. */
export function utmLink(siteUrl: string, locale: "ar" | "en", item: Pick<SocialItem, "link" | "format" | "campaign" | "day">) {
  const url = new URL(`${siteUrl}/${locale}${item.link === "/" ? "" : item.link}`);
  url.searchParams.set("utm_source", "instagram");
  url.searchParams.set("utm_medium", item.format);
  url.searchParams.set("utm_campaign", item.campaign);
  url.searchParams.set("utm_content", `day${item.day}`);
  return url.toString();
}
