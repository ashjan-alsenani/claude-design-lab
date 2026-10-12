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

/** What's inside, as short cute points under the description. */
export function QudoomBullets({ locale }: { locale: Locale }) {
  const ar = locale === "ar";
  const items: [string, string, string][] = [
    ["🗺️", "خطوة بخطوة: تعرفين من وين تبدين ووش بعدها", "Step by step: where to start and what's next"],
    ["🏠", "لوحة وحدة توريك كل شي: الأيام الباقية والجاهزية", "One dashboard for everything: days left and readiness"],
    ["🧸", "أغراض البيبي وغرفته، بقوائم جاهزة", "Baby things and nursery, with ready lists"],
    ["👜", "شنطة المستشفى: لك وللبيبي وللمرافقة", "Hospital bag: for you, baby and your companion"],
    ["🎈", "١٠٠٠ شكل مرسوم لاستقبال البيبي", "1,000 illustrated welcome looks"],
    ["🎀", "مئات أفكار التوزيعات بصورها", "Hundreds of favor ideas, each drawn"],
    ["🎁", "قائمة هدايا يحجز منها الأهل بدون تكرار", "A gift list family can reserve, no duplicates"],
    ["☕", "حاسبة ضيافة وزيارات بمواعيد", "Hospitality calculator and visits by appointment"],
    ["💗", "وردي لو بنت، كحلي لو ولد", "Pink for a girl, navy for a boy"],
    ["🔒", "خاصة في حسابك، والمشاركة باختيارك", "Private to you; share only what you choose"],
  ];
  return (
    <ul className="mt-5 grid gap-2 sm:grid-cols-2">
      {items.map(([e, a, en]) => (
        <li key={e} className="flex items-center gap-2.5 rounded-2xl bg-surface-raised/80 px-3 py-2 text-[0.95rem] font-medium text-ink shadow-soft">
          <span className="grid size-8 shrink-0 place-items-center rounded-full text-base" style={{ background: "color-mix(in oklab, #ff9fb8 22%, #fff)" }}>{e}</span>
          {ar ? a : en}
        </li>
      ))}
    </ul>
  );
}
