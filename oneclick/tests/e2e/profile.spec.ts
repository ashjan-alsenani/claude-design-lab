import { expect, test, type Page } from "@playwright/test";

/** First sign-in asks for a profile (name, picture, details); the profile page edits it later. */
const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
// A real 32x32 PNG; the browser crops and re-encodes it to a small JPEG before upload.
const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAAKklEQVR4nGM4EVVBU8QwasGoBaMWjFowasGoBaMWjFowasGoBaMWDBULABLmaFswJ2EyAAAAAElFTkSuQmCC", "base64");

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("oc-consent", "essential"));
});

async function codeSignIn(page: Page, address: string, locale: "en" | "ar") {
  await page.goto(`/${locale}/account`);
  await page.locator("#email").fill(address);
  await page.locator("form:has(#email) button").click();
  await expect(page).toHaveURL(new RegExp(`/${locale}/account/verify`));
  let code = "";
  for (let i = 0; i < 20 && !code; i++) {
    await page.goto(`/en/dev/mailbox?to=${encodeURIComponent(address)}`);
    const txt = (await page.locator('li[data-kind="access_code"] pre').first().textContent().catch(() => "")) ?? "";
    code = txt.match(/\b(\d{6})\b/)?.[1] ?? "";
  }
  await page.goto(`/${locale}/account/verify`);
  await page.locator("#code").fill(code);
  await page.locator("form:has(#code) button").click();
}

test("Arabic first sign-in: welcome form with initials, then photo upload on the profile page", async ({ page, browser, baseURL }) => {
  const address = `sara-${uid()}@example.com`;
  await codeSignIn(page, address, "ar");
  await expect(page).toHaveURL(/\/ar\/account\/welcome/);
  await expect(page.getByRole("heading", { name: "أهلًا فيك في ون كليك" })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");

  // Every account page waits for the profile first.
  await page.goto("/ar/account/purchases");
  await expect(page).toHaveURL(/\/ar\/account\/welcome\?next=%2Far%2Faccount%2Fpurchases/);

  // Bad phone is refused with a clear message, and nothing is saved.
  await page.locator("#name").fill("سارة الهنائي");
  await page.locator("#phone").fill("12ab");
  await page.locator('form:has(#name) button:not([type="button"])').click();
  await expect(page.locator("p[role=alert]")).toContainText("رقم الجوال");

  await page.locator("#name").fill("سارة الهنائي");
  await page.locator("#phone").fill("+968 9123 4567");
  await page.getByRole("radio").nth(3).click();
  await page.locator('form:has(#name) button:not([type="button"])').click();
  await expect(page).toHaveURL(/\/ar\/account\/purchases$/);
  await expect(page.getByText("سارة الهنائي").first()).toBeVisible();

  // Profile page: upload a photo; it is shown back and only this account can load it.
  await page.goto("/ar/account/profile");
  await expect(page.locator("#phone")).toHaveValue("+96891234567");
  await page.locator('input[type="file"][name="photo"]').setInputFiles({ name: "me.png", mimeType: "image/png", buffer: PNG });
  await expect(page.locator('form img[src^="blob:"]')).toBeVisible();
  await page.locator('form:has(#name) button:not([type="button"])').click();
  await expect(page.getByRole("status")).toContainText("انحفظ");
  const img = page.locator('nav img[src^="/api/avatar/"]').first();
  await expect(img).toBeVisible();
  const src = (await img.getAttribute("src"))!;
  const own = await page.request.get(src);
  expect(own.status()).toBe(200);
  expect(own.headers()["content-type"]).toBe("image/jpeg");

  const stranger = await browser.newContext({ baseURL });
  expect((await stranger.request.get(src)).status()).toBe(404);
  await stranger.close();

  // Switching back to initials removes the photo.
  await page.getByRole("radio").first().click();
  await page.locator('form:has(#name) button:not([type="button"])').click();
  await expect(page.getByRole("status")).toBeVisible();
  await expect(page.locator('nav img[src^="/api/avatar/"]')).toHaveCount(0);
  expect((await page.request.get(src)).status()).toBe(404);
});

test("profile shows the sign-in email and a plain Language choice", async ({ page }) => {
  const address = `nada-${uid()}@example.com`;
  await codeSignIn(page, address, "ar");
  await expect(page).toHaveURL(/\/ar\/account\/welcome/);
  await expect(page.locator("#account-email")).toHaveValue(address);
  await expect(page.locator("#account-email")).toHaveAttribute("readonly", "");
  await expect(page.locator('label[for="lang"]')).toHaveText("اللغة");
});
