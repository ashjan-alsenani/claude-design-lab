import { describe, expect, it } from "vitest";
import { addMoney, formatMoney, money, toMajor } from "@/lib/money";

describe("money", () => {
  it("stores OMR in baisa (3 decimals) without float drift", () => {
    expect(money(15).amountMinor).toBe(15000);
    expect(money(4.95).amountMinor).toBe(4950);
    expect(toMajor(addMoney(money(0.1), money(0.2)))).toBe(0.3);
  });
  it("uses 2 decimals for SAR/USD", () => {
    expect(money(10.5, "SAR").amountMinor).toBe(1050);
  });
  it("formats whole prices without trailing zeros", () => {
    expect(formatMoney(money(15), "en")).toMatch(/OMR\s?15$/);
    expect(formatMoney(money(4.95), "en")).toMatch(/4\.950/);
  });
  it("formats Arabic with Arabic-Indic digits", () => {
    expect(formatMoney(money(15), "ar")).toContain("١٥");
  });
  it("refuses to add different currencies", () => {
    expect(() => addMoney(money(1), money(1, "USD"))).toThrow();
  });
});
