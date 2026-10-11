import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { BabyIcon, BagIcon, BedIcon, CheckIcon, CloudIcon, GiftIcon, HeartIcon, MoonStarsIcon, PlusIcon, SparkleIcon, StarIcon, CoffeeIcon, CakeIcon, FireIcon, FlowerIcon, PlantIcon, TShirtIcon, BookOpenIcon, CameraIcon, BathtubIcon, CookieIcon, DropIcon } from "@phosphor-icons/react/dist/ssr";
import { isDemoMode } from "@/lib/env";
import { Clicky } from "@/components/brand/Clicky";

/** SANDBOX ONLY: three look directions for «حكاية قدوم» to choose from. 404 in production. */
export const metadata = { robots: { index: false, follow: false } };

const INK = "#1e1b3a";

function Phone({ label, children, bg = "#fff9f4" }: { label: string; children: ReactNode; bg?: string }) {
  return (
    <figure className="flex flex-col items-center gap-3">
      <figcaption className="rounded-full bg-[#1e1b3a] px-4 py-1.5 text-sm font-bold text-white">{label}</figcaption>
      <div className="relative h-[800px] w-[390px] overflow-hidden rounded-[44px] border-[10px] border-[#1e1b3a] shadow-xl" style={{ background: bg }} dir="rtl">
        {children}
      </div>
    </figure>
  );
}

function Tile({ color, icon, title, sub, rotate = 0 }: { color: string; icon: ReactNode; title: string; sub: string; rotate?: number }) {
  return (
    <div className="rounded-[26px] p-4" style={{ background: `color-mix(in oklab, ${color} 16%, #fff)`, transform: `rotate(${rotate}deg)` }}>
      <span className="grid size-12 place-items-center rounded-2xl text-white" style={{ background: color }}>{icon}</span>
      <p className="mt-3 text-[17px] font-bold" style={{ color: INK }}>{title}</p>
      <p className="text-[13px]" style={{ color: "#6c6790" }}>{sub}</p>
    </div>
  );
}

function BottomNav({ active = 0, color = "#0b7d73" }: { active?: number; color?: string }) {
  const items = [
    { i: <HeartIcon size={24} weight="fill" />, t: "الرئيسية" },
    { i: <BabyIcon size={24} />, t: "التجهيز" },
    { i: <StarIcon size={24} />, t: "الاستقبال" },
    { i: <GiftIcon size={24} />, t: "الهدايا" },
  ];
  return (
    <nav className="absolute inset-x-3 bottom-3 flex justify-around rounded-[28px] bg-white py-2.5 shadow-[0_8px_30px_-12px_rgba(30,27,58,.35)]">
      {items.map((x, i) => (
        <span key={x.t} className="flex flex-col items-center gap-0.5 text-[11.5px] font-semibold" style={{ color: i === active ? color : "#8a86a8" }}>
          {x.i}
          {x.t}
        </span>
      ))}
    </nav>
  );
}

/* A — same language as the OneClick site: cream, teal, Clicky family, colored tiles. */
function LookA() {
  return (
    <Phone label="أ · مثل موقع ون كليك">
      <div className="absolute -start-16 top-24 size-48 rounded-full bg-[#fff1cc]" />
      <div className="absolute -end-10 top-64 size-36 rounded-full bg-[#dcf5f1]" />
      <div className="relative p-5">
        <div className="flex items-center justify-between">
          <span className="text-[15px] font-bold" style={{ color: INK }}>حكاية قدوم</span>
          <Clicky size={34} color="#12b5a6" sparkle={false} />
        </div>
        <div className="mt-6 flex items-end gap-3">
          <div className="flex-1">
            <p className="text-[14px] font-semibold text-[#0b7d73]">يا هلا أم سلمى 🤍</p>
            <h1 className="mt-1 text-[30px] font-extrabold leading-[1.15]" style={{ color: INK }}>
              باقي <span className="relative inline-block">٣٥ يوم<svg className="absolute -bottom-2 start-0 w-full" viewBox="0 0 100 10"><path d="M2 7 Q50 0 98 6" stroke="#ff8fab" strokeWidth="4" fill="none" strokeLinecap="round" /></svg></span>
              <br />ونشوف سلمى
            </h1>
          </div>
          <Clicky size={92} color="#7cc4ff" accessory="baby" body wave />
        </div>
        <div className="mt-6 flex items-center gap-4 rounded-[26px] bg-white p-4 shadow-[0_10px_30px_-18px_rgba(30,27,58,.4)]">
          <svg viewBox="0 0 64 64" className="size-16 -rotate-90"><circle cx="32" cy="32" r="26" fill="none" stroke="#dcf5f1" strokeWidth="9" /><circle cx="32" cy="32" r="26" fill="none" stroke="#12b5a6" strokeWidth="9" strokeLinecap="round" strokeDasharray={`${163 * 0.64} 999`} /></svg>
          <div>
            <p className="text-[22px] font-extrabold" style={{ color: INK }}>٦٤٪ جاهزة</p>
            <p className="text-[13px] text-[#6c6790]">خطوة صغيرة اليوم تريحك بكرة</p>
          </div>
        </div>
        <div className="mt-4 rounded-[22px] border-2 border-dashed border-[#ffc23d] bg-[#fffaf0] p-4">
          <p className="text-[12.5px] font-bold text-[#a86400]">خطوتك الجاية</p>
          <div className="mt-2 flex items-center gap-3">
            <span className="size-7 rounded-full border-[3px] border-[#12b5a6]" />
            <p className="flex-1 text-[16px] font-semibold" style={{ color: INK }}>جهّزي شنطة البيبي</p>
            <span className="rounded-full bg-[#dcf5f1] px-3 py-1 text-[12px] font-bold text-[#0b7d73]">٣ من ٨</span>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Tile color="#3da5ff" icon={<BabyIcon size={24} weight="fill" />} title="أغراض البيبي" sub="١٨ من ٢٤" />
          <Tile color="#ff6b6b" icon={<BagIcon size={24} weight="fill" />} title="شنطة المستشفى" sub="قربت تجهز" />
          <Tile color="#8b7cf6" icon={<StarIcon size={24} weight="fill" />} title="الاستقبال" sub="زيارة جديدة" />
          <Tile color="#ffb020" icon={<GiftIcon size={24} weight="fill" />} title="الهدايا والتوزيعات" sub="أفكار جاهزة ✨" />
        </div>
      </div>
      <BottomNav />
    </Phone>
  );
}

/* B — soft nursery: sky, clouds, moon and stars; pastel and dreamy. */
function LookB() {
  return (
    <Phone label="ب · غرفة البيبي الناعمة" bg="linear-gradient(180deg,#dff0ff 0%,#fdf2f8 45%,#fff9f4 70%)">
      <svg className="absolute inset-x-0 top-0" viewBox="0 0 390 230" aria-hidden="true">
        <g fill="#fff"><ellipse cx="70" cy="70" rx="46" ry="20" /><ellipse cx="100" cy="58" rx="30" ry="22" /><ellipse cx="310" cy="120" rx="50" ry="20" /><ellipse cx="290" cy="106" rx="28" ry="20" /></g>
        <path d="M340 30 a22 22 0 1 0 18 34 a18 18 0 1 1 -18 -34 z" fill="#ffd36b" />
        <g fill="#ffc23d"><path d="M200 30 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3z" /><path d="M40 150 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2z" /><path d="M250 60 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z" /></g>
      </svg>
      <div className="relative p-5 pt-14 text-center">
        <div className="mx-auto w-fit"><Clicky size={110} color="#ffb3c7" accessory="bow" mood="love" /></div>
        <p className="mt-2 text-[14px] font-semibold text-[#c2477a]">أم سلمى، حياك الله</p>
        <h1 className="mt-1 text-[28px] font-extrabold" style={{ color: INK }}>سلمى توصل بعد ٣٥ يوم</h1>
        <div className="mx-auto mt-4 flex w-fit items-center gap-1.5">
          {[1, 1, 1, 1, 1, 1, 0, 0, 0, 0].map((d, i) => (
            <svg key={i} viewBox="0 0 20 28" className="h-7 w-5" style={{ transform: `rotate(${i % 2 ? 12 : -12}deg)` }}><ellipse cx="10" cy="17" rx="7" ry="9" fill={d ? "#f472a8" : "#f3d7e3"} /><circle cx="5" cy="5" r="2.4" fill={d ? "#f472a8" : "#f3d7e3"} /><circle cx="10" cy="3.5" r="2.4" fill={d ? "#f472a8" : "#f3d7e3"} /><circle cx="15" cy="5" r="2.4" fill={d ? "#f472a8" : "#f3d7e3"} /></svg>
          ))}
        </div>
        <p className="mt-1 text-[13px] text-[#6c6790]">٦ خطوات من ١٠ جاهزة</p>
        <div className="mt-5 space-y-3 text-start">
          {[
            { c: "#7cc4ff", i: <BabyIcon size={22} weight="fill" />, t: "أغراض البيبي", s: "باقي ٦ أغراض" },
            { c: "#ff9fb8", i: <BagIcon size={22} weight="fill" />, t: "شنطة المستشفى", s: "٣ من ٨ في الشنطة" },
            { c: "#b8a6ff", i: <MoonStarsIcon size={22} weight="fill" />, t: "ركن سلمى", s: "لوحة الإلهام" },
            { c: "#ffc76b", i: <GiftIcon size={22} weight="fill" />, t: "أفكار الهدايا والتوزيعات", s: "٤٠ فكرة جاهزة" },
          ].map((x) => (
            <div key={x.t} className="flex items-center gap-3 rounded-[24px] bg-white/85 p-3.5 shadow-[0_6px_20px_-14px_rgba(30,27,58,.4)]">
              <span className="grid size-12 place-items-center rounded-full text-white" style={{ background: x.c }}>{x.i}</span>
              <div className="flex-1"><p className="text-[16px] font-bold" style={{ color: INK }}>{x.t}</p><p className="text-[12.5px] text-[#6c6790]">{x.s}</p></div>
              <CloudIcon size={22} className="text-[#c9d9ea]" weight="fill" />
            </div>
          ))}
        </div>
      </div>
      <BottomNav color="#c2477a" />
    </Phone>
  );
}

/* C — storybook / stickers: playful tilted stickers, like a baby scrapbook. */
function LookC() {
  return (
    <Phone label="ج · دفتر ذكريات ملصقات" bg="#fffaf2">
      <div className="absolute inset-0 opacity-60" style={{ backgroundImage: "radial-gradient(#f2e3d3 1.4px, transparent 1.4px)", backgroundSize: "18px 18px" }} />
      <div className="relative p-5">
        <p className="text-[13px] font-bold tracking-wide text-[#e0748f]">حكاية قدوم · الأسبوع ٣٥</p>
        <div className="relative mt-3 rounded-[28px] bg-[#ffe3ec] p-5" style={{ transform: "rotate(-1.5deg)" }}>
          <span className="absolute -top-3 start-8 h-6 w-20 rotate-[-6deg] rounded-sm bg-[#fff1cc]/90" />
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <h1 className="text-[27px] font-extrabold leading-tight" style={{ color: INK }}>حكاية سلمى<br />بدأت تكتمل ✨</h1>
              <p className="mt-2 text-[13.5px] text-[#7a5566]">باقي ٣٥ يوم تقريبًا على الموعد المتوقع</p>
            </div>
            <Clicky size={86} color="#ff8fab" accessory="baby" body />
          </div>
        </div>
        <p className="mt-6 text-[15px] font-bold" style={{ color: INK }}>شو جاهز؟</p>
        <div className="mt-2 flex justify-between">
          {[
            { i: <TShirtIcon size={24} weight="fill" />, c: "#3da5ff", d: true },
            { i: <BedIcon size={24} weight="fill" />, c: "#8b7cf6", d: true },
            { i: <BagIcon size={24} weight="fill" />, c: "#ff6b6b", d: true },
            { i: <BathtubIcon size={24} weight="fill" />, c: "#12b5a6", d: false },
            { i: <GiftIcon size={24} weight="fill" />, c: "#ffb020", d: false },
          ].map((x, i) => (
            <span key={i} className="relative grid size-14 place-items-center rounded-full border-4 border-white shadow" style={{ background: x.d ? x.c : "#efe5dc", color: x.d ? "#fff" : "#b5a99c" }}>
              {x.i}
              {x.d && <span className="absolute -bottom-1 -end-1 grid size-5 place-items-center rounded-full bg-white text-[#16884a]"><CheckIcon size={13} weight="bold" /></span>}
            </span>
          ))}
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Tile color="#3da5ff" icon={<BabyIcon size={24} weight="fill" />} title="التجهيز" sub="أغراض، شنطة، ركن" rotate={-1.5} />
          <Tile color="#8b7cf6" icon={<StarIcon size={24} weight="fill" />} title="الاستقبال" sub="زيارات وضيافة" rotate={1.5} />
          <Tile color="#ffb020" icon={<GiftIcon size={24} weight="fill" />} title="الهدايا" sub="أفكار وقائمة" rotate={1} />
          <Tile color="#ff6b6b" icon={<HeartIcon size={24} weight="fill" />} title="الذكريات" sub="صور وبطاقات" rotate={-1} />
        </div>
      </div>
      <BottomNav color="#e0748f" />
    </Phone>
  );
}

/* Ideas — gift and favor ideas, one tap to add (shown in look A). */
function Ideas() {
  const gifts = [
    { i: <TShirtIcon size={26} weight="fill" />, c: "#3da5ff", t: "طقم ملابس أول شهر", p: "١٠–٢٥ ر.ع" },
    { i: <BedIcon size={26} weight="fill" />, c: "#8b7cf6", t: "سرير هزاز", p: "٣٠–٨٠ ر.ع" },
    { i: <BathtubIcon size={26} weight="fill" />, c: "#12b5a6", t: "طقم استحمام", p: "٨–٢٠ ر.ع" },
    { i: <BookOpenIcon size={26} weight="fill" />, c: "#ff6b6b", t: "ألبوم السنة الأولى", p: "٥–١٥ ر.ع" },
  ];
  const favors = [
    { i: <CookieIcon size={26} weight="fill" />, c: "#e09e00", t: "كوكيز باسم البيبي", p: "٠٫٣–٠٫٨ ر.ع/حبة" },
    { i: <FireIcon size={26} weight="fill" />, c: "#ff8fab", t: "شمعة معطرة صغيرة", p: "٠٫٥–١٫٥" },
    { i: <PlantIcon size={26} weight="fill" />, c: "#1f9e57", t: "بذور نبتة «كبرت معنا»", p: "٠٫٣–٠٫٧" },
    { i: <DropIcon size={26} weight="fill" />, c: "#3da5ff", t: "ماء ورد بقارورة صغيرة", p: "٠٫٤–١" },
  ];
  const Card = ({ x }: { x: (typeof gifts)[number] }) => (
    <div className="rounded-[24px] bg-white p-3.5 shadow-[0_8px_24px_-16px_rgba(30,27,58,.4)]">
      <span className="grid size-14 place-items-center rounded-[18px]" style={{ background: `color-mix(in oklab, ${x.c} 16%, #fff)`, color: x.c }}>{x.i}</span>
      <p className="mt-2.5 text-[14.5px] font-bold leading-snug" style={{ color: INK }}>{x.t}</p>
      <p className="mt-0.5 text-[12px] text-[#6c6790]">{x.p}</p>
      <span className="mt-2.5 inline-flex items-center gap-1 rounded-full bg-[#0b7d73] px-3 py-1.5 text-[12.5px] font-bold text-white"><PlusIcon size={13} weight="bold" /> أضيفيها</span>
    </div>
  );
  return (
    <Phone label="أفكار الهدايا والتوزيعات (جديد)">
      <div className="p-5">
        <div className="flex items-center gap-3">
          <Clicky size={56} color="#F0567A" accessory="heart" body={false} />
          <div>
            <h1 className="text-[24px] font-extrabold" style={{ color: INK }}>أفكار حلوة 🎁</h1>
            <p className="text-[13px] text-[#6c6790]">اختاري وأضيفيها بضغطة</p>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <span className="rounded-full bg-[#1e1b3a] px-4 py-2 text-[13.5px] font-bold text-white">هدايا للبيبي</span>
          <span className="rounded-full border border-[#efe5dc] bg-white px-4 py-2 text-[13.5px] font-semibold text-[#46416c]">توزيعات</span>
          <span className="rounded-full border border-[#efe5dc] bg-white px-4 py-2 text-[13.5px] font-semibold text-[#46416c]">هدايا للأم</span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">{gifts.map((x) => <Card key={x.t} x={x} />)}</div>
        <p className="mt-5 flex items-center gap-1.5 text-[15px] font-bold" style={{ color: INK }}><SparkleIcon size={18} weight="fill" className="text-[#ffc23d]" /> توزيعات</p>
        <div className="mt-2 grid grid-cols-2 gap-3">{favors.slice(0, 2).map((x) => <Card key={x.t} x={x} />)}</div>
      </div>
      <BottomNav active={3} />
    </Phone>
  );
}

export default async function QudoomLooks({ params }: { params: Promise<{ locale: string }> }) {
  await params;
  if (!isDemoMode()) notFound();
  void [CoffeeIcon, CakeIcon, FlowerIcon, CameraIcon];
  return (
    <div className="flex flex-wrap justify-center gap-8 bg-[#f3ece4] p-8">
      <LookA />
      <LookB />
      <LookC />
      <Ideas />
    </div>
  );
}
