import { describe, expect, it } from "vitest";
import { rateLimit } from "@/lib/security/rate-limit";
import { jsonLdString } from "@/lib/seo";

describe("rate limit", () => {
  it("blocks after the limit within the window and resets after", () => {
    const k = `t-${Math.random()}`;
    for (let i = 0; i < 3; i++) expect(rateLimit(k, 3, 1000, 0).ok).toBe(true);
    expect(rateLimit(k, 3, 1000, 10).ok).toBe(false);
    expect(rateLimit(k, 3, 1000, 2000).ok).toBe(true);
  });
});

describe("json-ld", () => {
  it("cannot break out of the script tag", () => {
    expect(jsonLdString({ x: "</script><script>alert(1)</script>" })).not.toContain("</script>");
  });
});
