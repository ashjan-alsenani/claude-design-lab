import { describe, expect, it } from "vitest";
import { cleanPhone, defaultAvatarColor, initials, sniffImage, validateProfile } from "@/lib/profile";

describe("profile", () => {
  it("validates name, country and optional phone", () => {
    expect(validateProfile({ name: "  Sara   Al Hinai ", country: "OM", locale: "ar", marketingOptIn: false })).toMatchObject({ ok: true, value: { name: "Sara Al Hinai", phone: undefined } });
    expect(validateProfile({ name: "S", country: "OM", locale: "en", marketingOptIn: false })).toEqual({ ok: false, error: "name" });
    expect(validateProfile({ name: "Sara", country: "XX", locale: "en", marketingOptIn: false })).toEqual({ ok: false, error: "country" });
    expect(validateProfile({ name: "Sara", country: "OM", phone: "abc", locale: "en", marketingOptIn: false })).toEqual({ ok: false, error: "phone" });
    expect(validateProfile({ name: "Sara", country: "OM", locale: "en", marketingOptIn: false, avatarColor: "neon" })).toEqual({ ok: false, error: "avatar" });
    expect(validateProfile({ name: "<b>Sara</b>", country: "OM", locale: "en", marketingOptIn: false })).toMatchObject({ ok: true, value: { name: "bSara/b" } });
  });

  it("normalizes phones with Arabic digits and separators", () => {
    expect(cleanPhone("+968 ٩١٢٣-٤٥٦٧")).toBe("+96891234567");
    expect(cleanPhone("")).toBe("");
    expect(cleanPhone("123")).toBeNull();
  });

  it("makes initials and a stable default color", () => {
    expect(initials("Sara Al Hinai", "x@y.z")).toBe("SH");
    expect(initials("سارة", "x@y.z")).toBe("س");
    expect(initials("سارة الهنائي", "x@y.z")).toBe("س");
    expect(initials(undefined, "mona@example.com")).toBe("M");
    expect(defaultAvatarColor("usr_1")).toBe(defaultAvatarColor("usr_1"));
  });

  it("recognizes images by their bytes and refuses everything else", () => {
    expect(sniffImage(new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0]))).toBe("image/jpeg");
    expect(sniffImage(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0]))).toBe("image/png");
    expect(sniffImage(new TextEncoder().encode("RIFF\0\0\0\0WEBPVP8 "))).toBe("image/webp");
    expect(sniffImage(new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg"/>'))).toBeNull();
    expect(sniffImage(new TextEncoder().encode("<html><script>alert(1)</script>"))).toBeNull();
  });
});
