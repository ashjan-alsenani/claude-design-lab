import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { genderize, inviteDesigns, palettes, textSets } from "@/products/qudoom/model/invites";
import { fontById, inviteBodyFonts, inviteFonts } from "@/products/qudoom/model/inviteFonts";
import { compose, motifNames } from "@/products/qudoom/ui/InviteArt";
import { artSpec } from "@/products/qudoom/ui/InviteCanvas";
import { parseItem } from "@/products/qudoom/model/schema";

describe("invitation studio", () => {
  it("has 300 designs, each its own idea", () => {
    expect(inviteDesigns).toHaveLength(300);
    expect(new Set(inviteDesigns.map((d) => d.id)).size).toBe(300);
    // No motif repeats a layout: every design differs in motif or layout, not only colour.
    expect(new Set(inviteDesigns.map((d) => `${d.hero}|${d.layout}`)).size).toBe(300);
    expect(new Set(inviteDesigns.map((d) => d.hero)).size).toBeGreaterThanOrEqual(40);
    expect(new Set(inviteDesigns.map((d) => d.material)).size).toBe(6);
  });
  it("uses only known motifs, palettes and fonts, and every font file is there", () => {
    for (const d of inviteDesigns) {
      for (const m of [d.hero, ...d.comps]) expect(motifNames).toContain(m);
      expect(palettes[d.material]).toContainEqual(d.palette);
      for (const f of [d.font, d.titleFont, d.body]) expect(fontById(f), f).toBeTruthy();
    }
    expect(inviteFonts.length).toBeGreaterThanOrEqual(40);
    for (const f of [...inviteFonts, ...inviteBodyFonts]) expect(existsSync(`public/brand/fonts/qudoom/inv/${f.file}.woff2`), f.file).toBe(true);
  });
  it("draws every design as a story-size SVG with room for the words", () => {
    for (const d of inviteDesigns) {
      const { svg, box } = compose(artSpec(d));
      const s = svg(270, 480);
      expect(s.startsWith("<svg")).toBe(true);
      expect(s).not.toMatch(/NaN|undefined/);
      expect(box.bottom - box.top).toBeGreaterThan(600);
      expect(box.right - box.left).toBeGreaterThan(600);
    }
  });
  it("words follow the baby's gender", () => {
    expect(genderize("اللهم أنبت{ه|ها}", true)).toBe("اللهم أنبتها");
    expect(genderize("اللهم أنبت{ه|ها}", false)).toBe("اللهم أنبته");
    for (const t of textSets) expect(genderize(t.ar.line, true)).not.toMatch(/[{}|]/);
  });
  it("saves the new font choices on a card", () => {
    const card = { id: "cd_1", template: "invite", title: "دعوة", tone: "theme", showDate: false, showDetails: false, design: "teddy-corner-knit~knit-oat", font: "noto-nastaliq-urdu", bodyFont: "amiri-400" };
    expect(parseItem("cards", card)).toMatchObject({ font: "noto-nastaliq-urdu", bodyFont: "amiri-400" });
    expect(() => parseItem("cards", { ...card, font: "<script>" })).toThrow();
    // Cards saved before this change keep working.
    expect(parseItem("cards", { ...card, font: "ruqaa", bodyFont: undefined })).toMatchObject({ font: "ruqaa" });
  });
});
