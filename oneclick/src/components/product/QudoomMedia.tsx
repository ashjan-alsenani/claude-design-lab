import Image from "next/image";
import { DesktopIcon, DeviceMobileIcon, PlayCircleIcon } from "@phosphor-icons/react/dist/ssr";
import type { Locale } from "@/i18n/config";

/** «حكاية قدوم» on the phone and the computer, plus a short video ad of the real app. */
export function QudoomMedia({ locale }: { locale: Locale }) {
  const ar = locale === "ar";
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8" aria-labelledby="qd-media">
      <div className="grid items-center gap-10 lg:grid-cols-[1.35fr_1fr]">
        <div>
          <h2 id="qd-media" className="text-3xl font-semibold tracking-tight text-ink">{ar ? "على الجوال والكمبيوتر" : "On your phone and computer"}</h2>
          <p className="mt-3 max-w-[56ch] leading-relaxed text-ink-soft">
            {ar ? "نفس المفكّرة ونفس البيانات على أي جهاز. ابدئي من الجوال وكمّلي من الكمبيوتر، وكل شي محفوظ في حسابك." : "The same planner and data on any device. Start on your phone, carry on at the computer; everything is saved to your account."}
          </p>
          <ul className="mt-4 flex flex-wrap gap-2 text-sm text-ink-soft">
            <li className="inline-flex items-center gap-1.5 rounded-full bg-surface-raised px-3 py-1.5 shadow-soft"><DeviceMobileIcon size={16} weight="duotone" /> {ar ? "الجوال" : "Phone"}</li>
            <li className="inline-flex items-center gap-1.5 rounded-full bg-surface-raised px-3 py-1.5 shadow-soft"><DesktopIcon size={16} weight="duotone" /> {ar ? "الكمبيوتر" : "Computer"}</li>
          </ul>
          <Image src="/brand/qudoom/mockup.webp" alt={ar ? "حكاية قدوم على شاشة كمبيوتر وجوال" : "Hikayat Qudoom on a laptop and a phone"} width={1200} height={720} className="mt-8 h-auto w-full" sizes="(min-width: 1024px) 700px, 100vw" />
        </div>
        <figure className="mx-auto w-full max-w-[340px]">
          <div className="overflow-hidden rounded-[36px] border-[8px] border-[#e7e0ea] bg-[#fff9f4] shadow-[0_30px_60px_-30px_rgba(90,85,112,.5)]">
            <video src="/brand/qudoom/ad.mp4" poster="/brand/qudoom/ad-poster.webp" controls muted playsInline loop preload="metadata" className="block aspect-[9/16] w-full" aria-label={ar ? "فيديو تعريفي بحكاية قدوم" : "Hikayat Qudoom video"} />
          </div>
          <figcaption className="mt-3 flex items-center justify-center gap-1.5 text-sm text-muted"><PlayCircleIcon size={16} /> {ar ? "٣٠ ثانية: كيف تساعدك حكاية قدوم" : "30 seconds: how Hikayat Qudoom helps"}</figcaption>
        </figure>
      </div>
    </section>
  );
}
