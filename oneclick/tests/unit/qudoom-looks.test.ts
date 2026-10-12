import { describe, expect, it } from "vitest";
import { looks, motifs, palettes, places, regions } from "@/products/qudoom/model/looks";
import { allIdeas } from "@/products/qudoom/model/all-ideas";
import { ideaIcon } from "@/products/qudoom/ui/IdeaArt";

describe("qudoom welcome looks", () => {
  it("has 500+ distinct ideas, each with valid tags and a checklist", () => {
    expect(looks.length).toBeGreaterThanOrEqual(500);
    expect(new Set(looks.map((l) => l.ar)).size).toBe(looks.length);
    expect(new Set(looks.map((l) => l.en)).size).toBe(looks.length);
    expect(new Set(looks.map((l) => l.id)).size).toBe(looks.length);
    const ok = (xs: { id: string }[], v: string) => xs.some((x) => x.id === v);
    for (const l of looks) {
      expect(ok(places, l.place) && ok(regions, l.region) && ok(motifs, l.motif) && ok(palettes, l.palette.id), l.id).toBe(true);
      expect(l.arItems.length, l.id).toBeGreaterThanOrEqual(3);
      expect(l.enItems.length, l.id).toBe(l.arItems.length);
    }
    for (const p of places) expect(looks.filter((l) => l.place === p.id).length, p.id).toBeGreaterThanOrEqual(40);
  });
  it("gives every idea its own matching icon (no generic fallback)", () => {
    for (const x of allIdeas) expect(ideaIcon(x).matched, x.en).toBe(true);
  });
});
