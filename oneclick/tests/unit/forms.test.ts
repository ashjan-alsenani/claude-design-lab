import { describe, expect, it } from "vitest";
import { contactSchema, customRequestSchema, formDataToObject } from "@/lib/forms/schemas";

const valid = {
  goal: "A booking website for my bakery",
  solutionType: "website",
  features: "Menu and orders",
  languages: ["ar", "en"],
  budget: "100-300",
  branding: "need",
  payments: "no",
  name: "Test",
  email: "Test@Example.com ",
  privacy: "on",
  locale: "ar",
};

describe("custom request validation", () => {
  it("accepts a valid request and normalizes email", () => {
    const r = customRequestSchema.parse(valid);
    expect(r.email).toBe("test@example.com");
  });
  it("rejects missing privacy consent", () => {
    expect(customRequestSchema.safeParse({ ...valid, privacy: undefined }).success).toBe(false);
  });
  it("rejects unknown enum values (no arbitrary input reaches storage)", () => {
    expect(customRequestSchema.safeParse({ ...valid, budget: "1000000" }).success).toBe(false);
  });
  it("rejects a filled honeypot", () => {
    expect(customRequestSchema.safeParse({ ...valid, website: "spam.example" }).success).toBe(false);
  });
  it("caps very long input", () => {
    expect(customRequestSchema.safeParse({ ...valid, goal: "x".repeat(5000) }).success).toBe(false);
  });
});

describe("contact validation", () => {
  it("requires a real message", () => {
    expect(contactSchema.safeParse({ topic: "support", name: "A B", email: "a@b.co", message: "hi", privacy: "on", locale: "en" }).success).toBe(false);
  });
});

describe("formDataToObject", () => {
  it("collects array keys", () => {
    const fd = new FormData();
    fd.append("languages", "ar");
    fd.append("languages", "en");
    fd.append("name", "x");
    expect(formDataToObject(fd, ["languages"])).toEqual({ languages: ["ar", "en"], name: "x" });
  });
});
