import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  // Pre-answer the consent card so it never covers controls under test.
  await page.addInitScript(() => localStorage.setItem("oc-consent", "essential"));
});

test("root redirects to a locale", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/(en|ar)$/);
});

test("English is LTR and Arabic is RTL", async ({ page }) => {
  await page.goto("/en");
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Everyday life, made simpler.");
  await page.goto("/ar");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.locator("html")).toHaveAttribute("lang", "ar");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("يومك، صار أبسط.");
});

test("language switch keeps the current page", async ({ page, isMobile }) => {
  await page.goto("/en/products/bride-planner");
  const target = page.getByRole("link", { name: isMobile ? "العربية" : "Switch language" }).first();
  // On a busy dev server the first tap can land before the menu's script has loaded; tap until it opens.
  if (isMobile)
    await expect(async () => {
      await page.getByRole("button", { name: "Menu" }).click();
      await expect(target).toBeVisible({ timeout: 2000 });
    }).toPass({ timeout: 30_000 });
  await target.click();
  await expect(page).toHaveURL(/\/ar\/products\/bride-planner$/);
});

test("live demo is interactive", async ({ page }) => {
  await page.goto("/en/products/grocery-list");
  const demo = page.locator("#demo");
  await demo.getByLabel("Add an item").fill("Saffron");
  await demo.getByRole("button", { name: "Add" }).click();
  await expect(demo.getByText("Saffron")).toBeVisible();
  const row = demo.getByText("Bananas");
  await row.click();
  await expect(demo.getByRole("checkbox", { name: /Bananas/ })).toBeChecked();
});

test("favorites persist on the device", async ({ page }) => {
  await page.goto("/en/products");
  await page.getByRole("button", { name: "Save to favorites" }).first().click();
  await page.goto("/en/favorites");
  await expect(page.getByRole("heading", { level: 3 })).toHaveCount(1);
});

test("checkout is honest about payments", async ({ page }) => {
  await page.goto("/en/checkout/bride-planner");
  await expect(page.getByText("PAYMENT PROVIDER NOT YET CONNECTED")).toBeVisible();
  await expect(page.locator('input[autocomplete*="cc-"]')).toHaveCount(0);
});

test("custom request validates and submits", async ({ page }) => {
  await page.goto("/en/custom");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByText("Please add a little more detail.")).toBeVisible();
  await page.fill("#goal", "A small booking site for a home bakery");
  await page.getByRole("group").getByText("Website", { exact: true }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.fill("#features", "Menu, WhatsApp orders");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByText("Not sure yet").click();
  await page.getByText("Yes, I have branding").click();
  await page.locator("label", { hasText: /^No$/ }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.fill("#name", "E2E Tester");
  await page.fill("#email", "e2e@example.com");
  await page.locator('input[name="privacy"]').check();
  await page.getByRole("button", { name: "Send request" }).click();
  await expect(page.getByText("Request received")).toBeVisible();
  await expect(page.getByText(/REQ-[A-Z0-9]{6}/)).toBeVisible();
});

test("unknown pages show the branded 404", async ({ page }) => {
  const res = await page.goto("/ar/this-does-not-exist");
  expect(res?.status()).toBe(404);
  await expect(page.getByText("هذي الصفحة أخذت طريق ثاني.")).toBeVisible();
});

test("SEO basics are present", async ({ page }) => {
  await page.goto("/en/products/bride-planner");
  await expect(page).toHaveTitle(/Bride of a Lifetime \| One Click/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/en\/products\/bride-planner$/);
  await expect(page.locator('link[rel="alternate"][hreflang="ar"]')).toHaveCount(1);
  const ld = await page.locator('script[type="application/ld+json"]').allTextContents();
  expect(ld.some((s) => s.includes('"@type":"Product"'))).toBe(true);
});

test("no horizontal overflow on key pages", async ({ page }) => {
  for (const path of ["/ar", "/en", "/ar/products/bride-planner", "/ar/custom", "/en/admin"]) {
    await page.goto(path);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, path).toBeLessThanOrEqual(1);
  }
});
