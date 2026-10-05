import type { NextConfig } from "next";

// Content-Security-Policy: everything comes from this site only (no third-party scripts, fonts,
// frames or form targets). Inline scripts stay allowed because Next.js needs them for its page data
// and the theme switch; production only, since development tooling needs eval.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "media-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  ...(process.env.NODE_ENV === "production" ? [{ key: "Content-Security-Policy", value: csp }] : []),
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // AVIF first (smaller and sharper than JPEG at the same size); 85 is used for the large bridal photo.
  images: { formats: ["image/avif", "image/webp"], qualities: [75, 85] },
  async headers() {
    // Account, product apps, admin and downloads are personal: never cached, never indexed.
    const privateHeaders = [
      { key: "Cache-Control", value: "private, no-store" },
      { key: "X-Robots-Tag", value: "noindex, nofollow" },
    ];
    return [
      { source: "/:path*", headers: securityHeaders },
      ...["/:locale/account/:path*", "/:locale/account", "/:locale/app/:path*", "/:locale/admin/:path*", "/:locale/admin", "/:locale/claim", "/:locale/dev/:path*", "/:locale/checkout/:path*", "/api/download/:path*"].map((source) => ({
        source,
        headers: privateHeaders,
      })),
    ];
  },
};

export default nextConfig;
