import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale, type Locale } from "@/i18n/config";

const LOCALE_COOKIE = "oc_locale";

/** Everyone starts in Arabic; a visitor who already chose English keeps it. */
function preferredLocale(request: NextRequest): Locale {
  const cookie = request.cookies.get(LOCALE_COOKIE)?.value;
  return isLocale(cookie) ? cookie : defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const first = pathname.split("/")[1];
  if (isLocale(first)) {
    const res = NextResponse.next();
    // Remember explicit language choice for the next visit to "/".
    if (request.cookies.get(LOCALE_COOKIE)?.value !== first) {
      res.cookies.set(LOCALE_COOKIE, first, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
    }
    return res;
  }
  const url = request.nextUrl.clone();
  url.pathname = `/${preferredLocale(request)}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Skip Next internals, API routes, metadata files and anything with a file extension.
  matcher: ["/((?!_next|api|brand|fonts|icon.svg|favicon.ico|robots.txt|sitemap.xml|manifest.webmanifest|opengraph-image|.*\\..*).*)"],
};
