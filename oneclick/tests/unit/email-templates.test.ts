import { describe, expect, it } from "vitest";
import { emailTemplates } from "@/lib/email/templates";

describe("access code email", () => {
  it.each(["ar", "en"] as const)("shows the code as one unbroken run of digits (%s)", (locale) => {
    const mail = emailTemplates.accessCode(locale, { code: "123456", minutes: 10 });
    // A space between the halves lets right-to-left mail clients display "456 123".
    expect(mail.html).toContain(">123456<");
    expect(mail.text).toContain("123456");
    expect(mail.text).not.toMatch(/123\s+456/);
  });
});
