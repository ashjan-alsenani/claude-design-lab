import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { maskEmail } from "@/lib/licensing/crypto";
import { currentContext } from "@/lib/licensing/server";
import { QUDOOM_SLUG } from "@/products/qudoom/constants";
import { InviteCard, Unavailable } from "@/products/qudoom/public/PublicViews";
import { invitePage } from "@/products/qudoom/server/public";

export const metadata = { title: "Hikayat Qudoom" };

/** A helper's invitation. Accepting needs her own signed-in account with the invited email. */
export default async function HelperInvitePage({ params }: { params: Promise<{ locale: string; token: string }> }) {
  const { locale, token } = await params;
  if (!isLocale(locale)) notFound();
  const inv = await invitePage(token).catch(() => null);
  if (!inv || inv.status === "revoked") return <Unavailable lang={locale} />;
  const ctx = await currentContext();
  const here = `/${locale}/q/h/${token}`;
  return (
    <InviteCard
      lang={locale}
      token={token}
      head={inv.head}
      email={maskEmail(inv.email)}
      signedIn={!!ctx}
      alreadyHelperId={inv.status === "active" && ctx && inv.userId === ctx.user.id ? inv.helperId : undefined}
      signInHref={`/${locale}/account?next=${encodeURIComponent(here)}`}
      appBase={`/${locale}/shared/${QUDOOM_SLUG}`}
    />
  );
}
