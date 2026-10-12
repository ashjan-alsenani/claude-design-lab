import { describe, expect, it } from "vitest";
import { whereLinks } from "@/products/qudoom/model/where";

describe("where to buy", () => {
  it("builds local search links, with marketplaces only where they serve the country", () => {
    const sa = whereLinks({ text: "كوكيز باسم البيبي، بعلبة شفافة", kind: "favor", country: "SA", city: "الرياض", lang: "ar" });
    expect(sa.map((l) => l.id)).toEqual(["maps", "instagram", "noon", "amazon", "shopping", "web"]);
    const maps = decodeURIComponent(sa[0].url);
    expect(maps).toContain("كوكيز باسم البيبي توزيعات مواليد الرياض السعودية");
    expect(maps).not.toContain("بعلبة شفافة");
    const om = whereLinks({ text: "Mini succulent", kind: "favor", country: "OM", lang: "en" });
    expect(om.map((l) => l.id)).toEqual(["maps", "instagram", "shopping", "web"]);
    expect(om.find((l) => l.id === "shopping")!.url).toContain("gl=OM");
    expect(whereLinks({ text: "x", kind: "thanks", country: "OM", lang: "ar" })).toEqual([]);
    for (const l of sa) expect(l.url.startsWith("https://")).toBe(true);
  });
});

describe("sample photos", () => {
  it("every listed photo exists in public/", async () => {
    const fs = await import("node:fs");
    const { favorPhotoFiles, kindPhotoFiles, lookPhotoFiles } = await import("@/products/qudoom/ui/photos.gen");
    for (const src of [...Object.values(favorPhotoFiles), ...Object.values(kindPhotoFiles), ...Object.values(lookPhotoFiles)]) expect(fs.existsSync(`public${src}`)).toBe(true);
  });
});
