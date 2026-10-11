import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { currentContext } from "@/lib/licensing/server";
import { QudoomApp } from "@/products/qudoom/app/QudoomApp";
import { qCopy } from "@/products/qudoom/i18n";
import { todayIn } from "@/products/qudoom/model/engine";
import { planForHelper } from "@/products/qudoom/model/share";
import { helperData, readPlan } from "@/products/qudoom/server/access";
import { QUDOOM_SLUG } from "@/products/qudoom/constants";

/**
 * HELPER VIEW: a person the mother invited opens her planner with her OWN account. The server
 * re-checks on every request that the grant is hers and active and that the mother still holds the
 * product, and sends only the sections the mother shared (everything else is removed here).
 */
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return { title: locale === "ar" ? "حكاية قدوم · مساعدة" : "Hikayat Qudoom · Helper", robots: { index: false, follow: false }, referrer: "no-referrer" };
}

export default async function QudoomHelperLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string; helperId: string }> }) {
  const { locale, helperId } = await params;
  if (!isLocale(locale)) notFound();
  const base = `/${locale}/shared/${QUDOOM_SLUG}/${helperId}`;
  if (!(await currentContext())) redirect(`/${locale}/account?next=${encodeURIComponent(base)}`);
  const h = await helperData(helperId);
  if (!h) {
    return (
      <main className="mx-auto grid min-h-[60dvh] max-w-md place-items-center px-6 text-center" dir={locale === "ar" ? "rtl" : "ltr"}>
        <p className="text-lg text-ink-soft">{qCopy[locale].help.noAccess}</p>
      </main>
    );
  }
  const { version, plan } = await readPlan(h.data);
  const view = planForHelper(plan, h.helper.sections);
  return (
    <>
      <QudoomApp
        initial={view}
        version={version}
        today={todayIn(plan.profile?.timeZone ?? "Asia/Muscat")}
        lang={locale}
        locale={locale}
        base={base}
        mode="helper"
        helperId={h.helper.id}
        access={{ sections: h.helper.sections, canEdit: h.helper.canEdit, ownerName: plan.profile?.motherName }}
        exitHref={`/${locale}/account/products`}
      />
      {children}
    </>
  );
}
