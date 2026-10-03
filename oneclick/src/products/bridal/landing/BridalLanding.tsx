import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { ArtTile, HeroArt, type Motif } from "../ui/Art";

/**
 * Marketing landing page for Bridal Journey (public, server-rendered, indexable).
 * Calm editorial layout in the product's own luxury palette.
 */
const copy = {
  ar: {
    eyebrow: "رحلة العروس · من ون كليك",
    title: ["خطّطي لزفافك بأناقة،", "دون أن يفوتك شيء."],
    sub: "مساعدتك الشخصية لكل مهمة وموعد ودفعة وتفصيلة جميلة حتى يوم زفافك. تُدخلين تفاصيل زفافك مرة واحدة، فتُرتَّب رحلتك كلها في وقتها.",
    cta: "ابدئي رحلتي",
    demo: "شاهدي زفافًا تجريبيًا",
    open: "اشتريتِه من قبل؟ افتحيه من حسابك",
    price: "سعر الإطلاق",
    once: "دفعة واحدة · وصول دائم من حسابك",
    honest: "الدفع الإلكتروني يُفتح قريبًا. يمكنك تجربة النسخة التجريبية كاملةً الآن.",
    strip: ["أكثر من ٢٠٠ مهمة مرتبة حسب موعدك", "عربي وإنجليزي", "على الجوال والكمبيوتر", "بياناتك خاصة بحسابك"],
    sectionsTitle: "كل ما تحتاجه العروس، في مكان واحد",
    sections: [
      ["arch", "جدول زمني شخصي", "أخبرينا بموعد زفافك، ونرتّب كل خطوة في وقتها: اليوم، هذا الأسبوع، قريبًا، لاحقًا. لا شيء مبكر جدًا، ولا شيء متأخر."],
      ["envelope", "قائمة العروس الكاملة", "من القاعة والفستان إلى الملكة والحناء والصباحية. مهام مدروسة لأعراس الخليج، تظهر فقط ما يخصك."],
      ["pearl", "الميزانية والدفعات", "المدفوع والملتزم به والمتبقي، مع تذكير قبل كل دفعة. لا مفاجآت في آخر الشهر."],
      ["camera", "الموردون في مكان واحد", "الأسعار والعقود والعربون والمواعيد لكل مورد، مع تنبيه حين يكون العقد غير موقّع."],
      ["dress", "الجهاز وخزانة العروس", "قائمة تسوق كاملة ومعرض أنيق لإطلالاتك في كل مناسبة."],
      ["table", "المدعوون والطاولات", "القائمة وتأكيد الحضور وتوزيع الطاولات، مع عدد المقاعد المتبقية تلقائيًا."],
      ["suitcase", "شهر العسل", "الحجوزات والجوازات والتأشيرات وشنطة السفر، مع تنبيه إن كان الجواز ينتهي قريبًا."],
      ["star", "جدول يوم الزفاف", "يومك بالدقيقة، ومن المسؤول عن كل خطوة، وحقيبة الطوارئ التي تنقذ اللحظات."],
    ],
    calmTitle: "لا تُرهقين بمئات المهام",
    calm: "تفتحين التطبيق، فترين ما يهمّ هذا الأسبوع فقط: ثلاث إلى خمس خطوات واضحة، والدفعة القادمة، والموعد القادم. وكل ما تبقى ينتظر وقته.",
    privacyTitle: "خاص بك وحدك",
    privacy: "رحلتك مرتبطة بحسابك، لا برابط. لا يستطيع أحد فتحها حتى لو وصله الرابط، وبياناتك لا تظهر لأي شخص آخر.",
    finalTitle: "رحلتك إلى يوم العمر تبدأ هنا",
  },
  en: {
    eyebrow: "Bridal Journey · by One Click",
    title: ["Plan your wedding beautifully.", "Without forgetting a thing."],
    sub: "Your personal bridal planner for every task, appointment, payment and beautiful detail leading to your wedding day. Tell us about your wedding once; your whole journey arranges itself.",
    cta: "Start My Bridal Journey",
    demo: "See a sample wedding",
    open: "Already purchased? Open it from your account",
    price: "Launch price",
    once: "One payment · lasting access from your account",
    honest: "Online payment opens soon. You can explore the full sample wedding right now.",
    strip: ["200+ tasks timed to your date", "Arabic & English", "Phone and computer", "Private to your account"],
    sectionsTitle: "Everything a bride needs, in one place",
    sections: [
      ["arch", "Personalized wedding timeline", "Tell us your date and every step lands at the right moment: today, this week, coming soon, later. Never too early, never too late."],
      ["envelope", "Complete bridal checklist", "From venue and dress to milka, henna and the morning gathering. Thoughtful tasks for Gulf weddings, showing only what applies to you."],
      ["pearl", "Budget & payment tracking", "Paid, committed and remaining, with a reminder before every payment. No end-of-month surprises."],
      ["camera", "Vendors in one place", "Prices, contracts, deposits and appointments for every vendor, with a nudge when a contract isn't signed."],
      ["dress", "Bridal shopping & closet", "A complete trousseau list and an elegant gallery of your looks for every occasion."],
      ["table", "Guest management", "Your list, RSVPs and seating, with remaining seats counted for you."],
      ["suitcase", "Honeymoon planning", "Bookings, passports, visas and packing, with a warning if a passport expires too soon."],
      ["star", "Wedding-day timeline", "Your day minute by minute, who looks after each step, and the SOS kit that saves the moment."],
    ],
    calmTitle: "Never hundreds of tasks at once",
    calm: "Open the app and see only what matters this week: three to five clear steps, the next payment and the next appointment. Everything else waits for its moment.",
    privacyTitle: "Private to you",
    privacy: "Your journey belongs to your account, not to a link. Nobody can open it even if they get the address, and your details are never visible to anyone else.",
    finalTitle: "Your wedding journey begins here",
  },
};

export function BridalLanding({ locale, price }: { locale: Locale; price: string }) {
  const c = copy[locale];
  const demo = `/${locale}/demo/bride-planner`;
  const buy = `/${locale}/checkout/bride-planner`;
  const btn = "inline-flex h-[52px] items-center justify-center rounded-full px-7 text-[15px] font-semibold transition-all duration-200";
  return (
    <div className="bj" dir={locale === "ar" ? "rtl" : "ltr"}>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[linear-gradient(160deg,#fdf8f9_0%,#fbf1ed_55%,#f7e0e7_100%)]">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-16 pt-10 sm:px-8 md:pt-16 lg:grid-cols-[1.1fr_0.9fr] lg:pb-24">
          <div>
            <p className="text-[12px] uppercase tracking-[0.22em] text-bj-gold-ink">{c.eyebrow}</p>
            <h1 className="bj-serif mt-5 text-[2.7rem] leading-[1.1] text-bj-ink sm:text-[3.6rem]">
              {c.title[0]}
              <br />
              <em className="text-bj-rose not-italic">{c.title[1]}</em>
            </h1>
            <p className="mt-6 max-w-xl text-[16.5px] leading-relaxed text-bj-ink-soft">{c.sub}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href={buy} className={`${btn} bg-bj-gold-ink text-white shadow-[0_5px_0_-1px_#6b2340] hover:-translate-y-0.5 hover:bg-[#7a2b49] active:translate-y-0 active:shadow-none`}>
                {c.cta}
              </Link>
              <Link href={demo} className={`${btn} border-2 border-bj-beige bg-bj-paper text-bj-ink hover:border-bj-taupe`}>
                {c.demo}
              </Link>
            </div>
            <p className="mt-5 text-[13px] text-bj-muted">
              <Link href={`/${locale}/app/bride-planner`} className="underline decoration-bj-beige underline-offset-4 hover:text-bj-ink">
                {c.open}
              </Link>
            </p>
          </div>
          <div className="relative mx-auto w-full max-w-[320px] lg:max-w-[420px]">
            <HeroArt className="bj-float w-full" />
            <PreviewCard locale={locale} />
          </div>
        </div>
        <div className="border-y border-bj-line bg-bj-paper/70">
          <ul className="mx-auto flex max-w-6xl flex-wrap justify-center gap-x-10 gap-y-2 px-5 py-4 text-[13.5px] text-bj-ink-soft">
            {c.strip.map((s) => (
              <li key={s} className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-bj-gold" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Calm principle */}
      <section className="mx-auto max-w-3xl px-5 py-20 text-center sm:px-8">
        <h2 className="bj-serif text-[2.2rem] leading-tight text-bj-ink sm:text-[2.6rem]">{c.calmTitle}</h2>
        <p className="mt-5 text-[16px] leading-relaxed text-bj-ink-soft">{c.calm}</p>
      </section>

      {/* Eight modules */}
      <section className="mx-auto max-w-6xl px-5 pb-20 sm:px-8">
        <h2 className="bj-serif mb-10 text-center text-[2rem] text-bj-ink sm:text-[2.4rem]">{c.sectionsTitle}</h2>
        <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {c.sections.map(([motif, title, body], i) => (
            <li key={title} className="overflow-hidden rounded-[22px] border border-bj-line bg-bj-paper">
              <ArtTile motif={motif as Motif} tone={i} className="aspect-[5/3]" />
              <div className="p-5">
                <p className="text-[11px] tracking-[0.18em] text-bj-gold-ink">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="bj-serif mt-1 text-[1.4rem] leading-snug text-bj-ink">{title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-bj-muted">{body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Privacy + price */}
      <section className="border-t border-bj-line bg-bj-cream/60">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="bj-serif text-[2rem] text-bj-ink">{c.privacyTitle}</h2>
            <p className="mt-4 max-w-lg text-[15.5px] leading-relaxed text-bj-ink-soft">{c.privacy}</p>
          </div>
          <div className="rounded-[26px] border border-[#e6c2b6] bg-bj-paper p-7 text-center shadow-[0_24px_60px_-36px_rgba(90,30,55,.22)]">
            <p className="text-[12px] uppercase tracking-[0.2em] text-bj-gold-ink">{c.price}</p>
            <p className="bj-serif mt-2 text-[3rem] leading-none text-bj-ink">{price}</p>
            <p className="mt-2 text-[13.5px] text-bj-muted">{c.once}</p>
            <div className="mt-6 flex flex-col gap-2.5">
              <Link href={buy} className={`${btn} bg-bj-gold-ink text-white shadow-[0_5px_0_-1px_#6b2340] hover:-translate-y-0.5 hover:bg-[#7a2b49] active:translate-y-0 active:shadow-none`}>
                {c.cta}
              </Link>
              <Link href={demo} className={`${btn} border border-bj-line text-bj-ink hover:border-bj-taupe/50`}>
                {c.demo}
              </Link>
            </div>
            <p className="mt-4 text-[12.5px] leading-relaxed text-bj-muted">{c.honest}</p>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 text-center">
        <h2 className="bj-serif text-[2.2rem] text-bj-ink">{c.finalTitle}</h2>
        <Link href={demo} className={`${btn} mt-7 bg-bj-gold-ink text-white shadow-[0_5px_0_-1px_#6b2340] hover:-translate-y-0.5 hover:bg-[#7a2b49] active:translate-y-0 active:shadow-none`}>
          {c.demo}
        </Link>
      </section>
    </div>
  );
}

/** A small static glimpse of the dashboard (decorative). */
function PreviewCard({ locale }: { locale: Locale }) {
  const ar = locale === "ar";
  const items = ar ? ["تأكيد قائمة المصورات", "حجز تجربة المكياج", "مراجعة تصميم الدعوة"] : ["Confirm photographer shortlist", "Book makeup trial", "Review invitation design"];
  return (
    <div aria-hidden="true" className="absolute -bottom-6 start-[-6%] w-[78%] rounded-[20px] border border-bj-line bg-bj-paper/95 p-4 shadow-[0_24px_50px_-28px_rgba(90,30,55,.22)] backdrop-blur sm:start-[-14%]">
      <p className="text-[11px] text-bj-muted">{ar ? "صباح الخير، ليان" : "Good morning, Layan"}</p>
      <p className="bj-serif text-[1.9rem] leading-tight text-bj-ink">
        {new Intl.NumberFormat(ar ? "ar-OM" : "en").format(255)} <span className="text-[1rem] text-bj-ink-soft">{ar ? "يومًا على زفافك" : "days to go"}</span>
      </p>
      <ul className="mt-2 space-y-1.5">
        {items.map((x, i) => (
          <li key={x} className="flex items-center gap-2 text-[12.5px] text-bj-ink">
            <span className={`grid size-4 place-items-center rounded-full border ${i === 0 ? "border-bj-sage bg-bj-sage" : "border-bj-beige"}`}>
              {i === 0 && (
                <svg viewBox="0 0 12 12" className="size-2.5">
                  <path d="M2.5 6.2l2.2 2.2 4.8-4.9" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              )}
            </span>
            <span className={i === 0 ? "text-bj-muted line-through" : ""}>{x}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
