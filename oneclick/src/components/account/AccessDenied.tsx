import { ArrowRightIcon, DeviceMobileIcon, HeadsetIcon, SquaresFourIcon } from "@phosphor-icons/react/dist/ssr";
import type { Locale } from "@/i18n/config";
import { licensingCopy, type LicensingCopy } from "@/i18n/licensing";
import type { DenyReason } from "@/lib/licensing/types";
import { Clicky } from "@/components/brand/Clicky";
import { ButtonLink } from "@/components/ui/Button";

const specific = ["license_pending", "license_suspended", "license_revoked", "license_expired", "product_paused", "device_limit", "device_not_authorized", "open_not_supported", "custom_service", "account_suspended"] as const;

/** Friendly copy for a denial. Never says who owns a product or whether it was bought by someone else. */
export function deniedCopy(t: LicensingCopy, reason: string | undefined) {
  const r = specific.find((x) => x === reason);
  return r ? t.denied[r] : { title: t.denied.title, body: t.denied.body };
}

export function AccessDenied({ locale, reason, productSlug }: { locale: Locale; reason: DenyReason; productSlug: string }) {
  const t = licensingCopy[locale];
  const c = deniedCopy(t, reason);
  const deviceIssue = reason === "device_limit" || reason === "device_not_authorized";
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-16 text-center">
      <Clicky size={120} mood="think" body />
      <h1 className="mt-6 text-3xl font-bold tracking-tight text-ink">{c.title}</h1>
      <p className="mt-3 max-w-md leading-relaxed text-ink-soft">{c.body}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {deviceIssue ? (
          <ButtonLink href={`/${locale}/account/devices${reason === "device_not_authorized" ? "?authorize=1" : ""}`}>
            <DeviceMobileIcon size={18} />
            {t.denied.devices}
          </ButtonLink>
        ) : (
          <ButtonLink href={`/${locale}/products/${productSlug}`}>
            {t.denied.explore}
            <ArrowRightIcon size={16} weight="bold" className="flip-rtl" />
          </ButtonLink>
        )}
        <ButtonLink href={`/${locale}/account/products`} variant="secondary">
          <SquaresFourIcon size={18} />
          {t.denied.myProducts}
        </ButtonLink>
        <ButtonLink href={`/${locale}/contact?topic=order`} variant="ghost">
          <HeadsetIcon size={18} />
          {t.denied.support}
        </ButtonLink>
      </div>
    </div>
  );
}
