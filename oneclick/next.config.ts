import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
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
