import Link from "next/link";
import { ArrowRightIcon, BabyIcon, BagIcon, CalendarHeartIcon, CheckCircleIcon, CoffeeIcon, GiftIcon, HandHeartIcon, LockKeyIcon, ShieldCheckIcon, UsersThreeIcon } from "@phosphor-icons/react/dist/ssr";
import type { Locale } from "@/i18n/config";
import { Clicky } from "@/components/brand/Clicky";

/**
 * «حكاية قدوم» on its product page: a drawn preview of the app (no screenshots of real people,
 * no invented numbers of customers or reviews) and the sections the spec asks for: the mother's
 * journey, why it fits Gulf homes, and what stays private.
 */
const C = "#E07A9A";

export function QudoomPreview({ locale }: { locale: Locale }) {
  const ar = locale === "ar";
  const rows = ar
    ? [
        { icon: BabyIcon, t: "أغراض البيبي", v: "١٨ من ٢٤" },
        { icon: BagIcon, t: "شنطة المستشفى", v: "جاهزة تقريبًا" },
        { icon: UsersThreeIcon, t: "الزيارات", v: "طلب جديد" },
        { icon: GiftIcon, t: "قائمة الهدايا", v: "٣ محجوزة" },
      ]
    : [
        { icon: BabyIcon, t: "Baby things", v: "18 of 24" },
        { icon: BagIcon, t: "Hospital bag", v: "Almost ready" },
        { icon: UsersThreeIcon, t: "Visits", v: "1 new request" },
        { icon: GiftIcon, t: "Gift list", v: "3 reserved" },
      ];
  return (
    <div id="demo" className="scroll-mt-24">
      <div className="relative mx-auto max-w-[380px] rounded-[36px] border border-line bg-surface-raised p-3 shadow-soft" aria-label={ar ? "معاينة مرسومة للمفكّرة ببيانات تجريبية" : "Drawn preview of the planner with sample data"} role="img">
        <div className="rounded-[28px] p-5" style={{ background: `linear-gradient(180deg, ${C}1f 0%, transparent 70%)` }}>
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-muted">{ar ? "بيانات تجريبية" : "Sample data"}</p>
              <p className="mt-1 text-xl font-semibold text-ink">{ar ? "يا هلا أم سلمى 🤍" : "Hello, Salma's mum 🤍"}</p>
            </div>
            <Clicky size={64} color="#7cc4ff" accessory="baby" body />
          </div>
          <div className="mt-4 flex items-center gap-4">
            <svg viewBox="0 0 64 64" className="size-20 shrink-0 -rotate-90" aria-hidden="true">
              <circle cx="32" cy="32" r="27" fill="none" stroke={`${C}33`} strokeWidth="8" />
              <circle cx="32" cy="32" r="27" fill="none" stroke={C} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 27 * 0.64} 999`} />
            </svg>
            <div>
              <p className="text-2xl font-semibold tabular text-ink">{ar ? "٦٤٪" : "64%"}</p>
              <p className="text-sm text-ink-soft">{ar ? "باقي تقريبًا ٣٥ يوم على الموعد المتوقع" : "About 35 days to the expected date"}</p>
            </div>
          </div>
          <ul className="mt-5 space-y-2">
            {rows.map((r) => (
              <li key={r.t} className="flex items-center gap-3 rounded-2xl bg-surface px-3 py-2.5">
                <span className="grid size-9 place-items-center rounded-xl" style={{ background: `${C}1f`, color: C }}>
                  <r.icon size={18} weight="duotone" />
                </span>
                <span className="flex-1 text-sm font-medium text-ink">{r.t}</span>
                <span className="text-xs text-muted">{r.v}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <Link href={`/${locale}/demo/hikayat-qudoom`} className="mt-5 flex items-center justify-center gap-1.5 text-sm font-semibold text-primary hover:underline">
        {ar ? "افتحي العرض التجريبي الكامل (بيانات وهمية، ما ينحفظ شي)" : "Open the full demo (fictional data, nothing is saved)"}
        <ArrowRightIcon size={15} className="rtl:rotate-180" />
      </Link>
    </div>
  );
}

export function QudoomStory({ locale }: { locale: Locale }) {
  const ar = locale === "ar";
  const journey = ar
    ? [
        { t: "بداية خفيفة", b: "اسمك، الموعد المتوقع إذا تبين، والأقسام اللي تهمك. وتقدرين تتخطين كل شي." },
        { t: "التجهيز", b: "أغراض البيبي، الغرفة أو الركن، وشنطة المستشفى. كل بند بحالته، والتقدم يُحسب من اللي يهمك بس." },
        { t: "قبل الاستقبال", b: "خطة الاستقبال والضيافة، ورابط زيارات وقائمة هدايا ترسلينهم بنفسك متى ما تبين." },
        { t: "وصل صغيرنا", b: "لما تقررين أنتِ، تتحول المفكّرة للزيارات والهدايا والشكر والذكريات." },
      ]
    : [
        { t: "A light start", b: "Your name, the expected date if you like, and the sections you care about. You can skip everything." },
        { t: "Getting ready", b: "Baby things, the room or corner, and the hospital bag. Each item has a status, and progress counts only what matters to you." },
        { t: "Before the welcome", b: "Welcome plans and hospitality, plus a visits link and a gift list you send yourself when you're ready." },
        { t: "Our little one is here", b: "When you decide, the planner turns to visits, gifts, thank-yous and memories." },
      ];
  const gulf = ar
    ? [
        { icon: CoffeeIcon, t: "ضيافة على طريقتنا", b: "قهوة وتمر وحلويات بوحداتها (دلة، صينية، علبة)، وكميات تقديرية حسب عدد الضيوف." },
        { icon: CalendarHeartIcon, t: "استقبال وعقيقة", b: "استقبال المستشفى والبيت وتجمع الأهل والعقيقة، لكل واحد قائمته." },
        { icon: HandHeartIcon, t: "عملات الخليج", b: "ريال عُماني وسعودي وقطري، درهم، دينار كويتي وبحريني، بالكسور الصحيحة لكل عملة." },
      ]
    : [
        { icon: CoffeeIcon, t: "Hospitality our way", b: "Coffee, dates and sweets in their real units (thermos, tray, box), with estimated quantities per guest count." },
        { icon: CalendarHeartIcon, t: "Welcomes & aqiqah", b: "Hospital, home, family gatherings and aqiqah, each with its own checklist." },
        { icon: HandHeartIcon, t: "Gulf currencies", b: "OMR, SAR, AED, KWD, BHD and QAR, each with its correct decimals." },
      ];
  const privacy = ar
    ? [
        "مفكّرتك خاصة في حسابك، وتنحفظ على الخادم مو في المتصفح بس.",
        "الروابط عشوائية، تقدرين توقفينها أو تغيرينها أو تحددين لها تاريخ انتهاء.",
        "رابط الزيارات ما يعرض عنوانك ولا أسماء الضيوف الثانيين.",
        "صورك الخاصة ما لها روابط عامة، وتنفتح لك ولمن تسمحين له بس.",
        "ما نرسل رسائل باسمك، وما نحط أسماء الأطفال أو أرقام الضيوف في أدوات التحليلات.",
        "تقدرين تنزلين بياناتك أو تحذفينها متى ما تبين.",
      ]
    : [
        "Your planner is private to your account and saved on the server, not just in the browser.",
        "Links are random; you can pause them, replace them or give them an end date.",
        "The visits link never shows your address or other guests' names.",
        "Your private photos have no public links; only you and the people you allow can open them.",
        "We never send messages in your name, and never put children's names or guests' numbers into analytics.",
        "Download or delete your data whenever you like.",
      ];
  return (
    <>
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <h2 className="text-3xl font-semibold tracking-tight text-ink">{ar ? "رحلتك مع المفكّرة" : "Your journey with the planner"}</h2>
        <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {journey.map((j, i) => (
            <li key={j.t} className="rounded-[var(--radius-lg)] border border-line bg-surface p-5">
              <span className="grid size-9 place-items-center rounded-full text-sm font-bold text-white tabular" style={{ background: C }}>
                {(i + 1).toLocaleString(ar ? "ar-OM" : "en")}
              </span>
              <h3 className="mt-4 text-lg font-semibold text-ink">{j.t}</h3>
              <p className="mt-2 leading-relaxed text-ink-soft">{j.b}</p>
            </li>
          ))}
        </ol>
      </section>
      <section className="border-y border-line bg-surface">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-ink">{ar ? "مصممة للبيت الخليجي" : "Made for Gulf homes"}</h2>
            <ul className="mt-8 space-y-6">
              {gulf.map((g) => (
                <li key={g.t} className="flex gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-[14px]" style={{ background: `${C}1f`, color: C }}>
                    <g.icon size={22} weight="duotone" />
                  </span>
                  <div>
                    <h3 className="font-semibold text-ink">{g.t}</h3>
                    <p className="mt-1 leading-relaxed text-ink-soft">{g.b}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-[var(--radius-xl)] border border-line bg-bg p-6 sm:p-8">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-ink">
              <LockKeyIcon size={22} className="text-primary" /> {ar ? "خصوصيتك أولًا" : "Your privacy first"}
            </h2>
            <ul className="mt-5 space-y-3">
              {privacy.map((p) => (
                <li key={p} className="flex gap-3 text-ink-soft">
                  <CheckCircleIcon size={20} weight="fill" className="mt-0.5 shrink-0" color={C} />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 flex items-start gap-2 text-sm text-muted">
              <ShieldCheckIcon size={18} className="mt-0.5 shrink-0" />
              {ar ? "المفكّرة أداة تنظيم، وما فيها نصائح طبية." : "The planner is an organizing tool and gives no medical advice."}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
