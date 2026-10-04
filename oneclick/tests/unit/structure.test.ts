import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Guard rails for code added later. These fail the test run (and so block publishing) when a new
 * product screen, a new way to read customer product data, or a new API route skips the
 * ownership check. If one fails, route the new code through src/lib/licensing/guard.ts.
 */
const root = path.join(__dirname, "..", "..");
const walk = (dir: string): string[] =>
  fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)])) : [];
const rel = (f: string) => path.relative(root, f).split(path.sep).join("/");
const src = walk(path.join(root, "src")).filter((f) => /\.(ts|tsx)$/.test(f));

describe("ownership guard rails", () => {
  it("every product page and layout under /[locale]/app calls openProduct()", () => {
    const appDir = path.join(root, "src", "app", "[locale]", "app");
    const screens = walk(appDir).filter((f) => /(page|layout)\.tsx$/.test(f) && rel(f) !== "src/app/[locale]/app/layout.tsx");
    expect(screens.length).toBeGreaterThan(0);
    const unguarded = screens.filter((f) => !fs.readFileSync(f, "utf8").includes("openProduct("));
    expect(unguarded.map(rel)).toEqual([]);
  });

  it("product pages are never cached or pre-rendered", () => {
    expect(fs.readFileSync(path.join(root, "src", "app", "[locale]", "app", "layout.tsx"), "utf8")).toContain('dynamic = "force-dynamic"');
    expect(fs.readFileSync(path.join(root, "next.config.ts"), "utf8")).toContain('"/:locale/app/:path*"');
  });

  it("customer product data is only reachable through the guard", () => {
    const allowed = new Set(["src/lib/licensing/product-data.ts", "src/lib/licensing/guard.ts", "src/lib/licensing/avatar.ts"]);
    const direct = src.filter((f) => !allowed.has(rel(f)) && /from ["']@\/lib\/licensing\/product-data["']|from ["']\.\/product-data["']/.test(fs.readFileSync(f, "utf8")));
    expect(direct.map(rel)).toEqual([]);
  });

  it("every API route has been reviewed for access control", () => {
    // Adding a route? Review it (who may call it, what it returns) and then add it here.
    const reviewed = ["src/app/api/avatar/[userId]/route.ts", "src/app/api/download/[token]/route.ts", "src/app/api/payments/webhook/[provider]/route.ts"];
    const routes = walk(path.join(root, "src", "app")).filter((f) => /route\.ts$/.test(f)).map(rel).sort();
    expect(routes).toEqual(reviewed.sort());
  });

  it("nothing protected sits in the public folder", () => {
    const pub = walk(path.join(root, "public")).map(rel);
    expect(pub.filter((f) => !f.startsWith("public/brand/"))).toEqual([]);
    expect(pub.filter((f) => /\.(pdf|zip|docx?|xlsx?|epub|mp4|mp3)$/i.test(f))).toEqual([]);
  });
});
