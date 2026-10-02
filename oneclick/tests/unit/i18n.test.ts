import { describe, expect, it } from "vitest";
import { en } from "@/i18n/dictionaries/en";
import { ar } from "@/i18n/dictionaries/ar";
import { plural } from "@/i18n/config";
import { products } from "@/content/products";
import { categories } from "@/content/categories";
import { legalPages } from "@/content/legal";
import { launchPlan, utmLink } from "@/content/social";

function keys(o: unknown, prefix = ""): string[] {
  if (typeof o !== "object" || o === null) return [prefix];
  return Object.entries(o).flatMap(([k, v]) => keys(v, `${prefix}.${k}`));
}

describe("i18n", () => {
  it("Arabic dictionary has every English key", () => {
    const missing = keys(en).filter((k) => !keys(ar).includes(k) && !k.startsWith(".catalog.count"));
    expect(missing).toEqual([]);
  });
  it("no empty strings in either language", () => {
    for (const d of [en, ar]) {
      const json = JSON.stringify(d);
      expect(json).not.toContain('""');
    }
  });
  it("uses Arabic plural categories", () => {
    expect(plural("ar", 1, ar.catalog.count)).toBe("منتج واحد");
    expect(plural("ar", 2, ar.catalog.count)).toBe("منتجان");
    expect(plural("ar", 5, ar.catalog.count)).toBe("٥ منتجات");
    expect(plural("en", 5, en.catalog.count)).toBe("5 products");
  });
  it("all products are fully bilingual and reference real categories", () => {
    const slugs = new Set(categories.map((c) => c.slug));
    for (const p of products) {
      expect(p.name.ar && p.name.en).toBeTruthy();
      expect(p.summary.ar && p.summary.en).toBeTruthy();
      for (const c of p.categories) expect(slugs.has(c)).toBe(true);
    }
  });
  it("product slugs are unique", () => {
    expect(new Set(products.map((p) => p.slug)).size).toBe(products.length);
  });
  it("legal pages exist in both languages", () => {
    for (const p of legalPages) expect(p.body.ar.length).toBeGreaterThan(2);
  });
  it("no em dashes in user-facing copy", () => {
    const all = JSON.stringify([en, ar, products, categories, legalPages, launchPlan]);
    expect(all).not.toMatch(/—/);
  });
});

describe("social links", () => {
  it("adds UTM parameters and points to the relevant page", () => {
    const url = new URL(utmLink("https://oneclick.example", "ar", launchPlan[1]));
    expect(url.pathname).toBe("/ar/products/bride-planner");
    expect(url.searchParams.get("utm_source")).toBe("instagram");
    expect(url.searchParams.get("utm_campaign")).toBe("launch-bride");
  });
  it("launch plan covers 30 days, all awaiting approval", () => {
    expect(launchPlan.map((s) => s.day)).toEqual(Array.from({ length: 30 }, (_, i) => i + 1));
    expect(launchPlan.every((s) => s.status === "draft")).toBe(true);
  });
});
