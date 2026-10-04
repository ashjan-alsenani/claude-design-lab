import { expect, test } from "@playwright/test";
import { products } from "../../src/content/products";
import { defaultSecurity, opensInteractive } from "../../src/lib/licensing/policy";

/**
 * Every paid product in the catalog, including ones added later, stays locked for anyone who
 * hasn't bought it. A new product needs no new test: it is picked up here automatically.
 */
const paid = products.filter((p) => p.price !== null && p.kind !== "custom-service");

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("oc-consent", "essential"));
});

test("signed out: no paid product opens from its URL", async ({ page }) => {
  expect(paid.length).toBeGreaterThan(10);
  for (const p of paid) {
    await page.goto(`/en/app/${p.slug}`);
    await expect(page.getByTestId("product-app"), p.slug).toHaveCount(0);
    // Products that open inside One Click send the visitor to sign in, then back here.
    if (opensInteractive(defaultSecurity(p).accessType)) await expect(page, p.slug).toHaveURL(new RegExp(`/en/account\\?next=%2Fen%2Fapp%2F${p.slug}$`));
  }
});

test("signed in without buying: every paid product says Access Denied", async ({ page }) => {
  const me = `nobuy-${Date.now().toString(36)}@example.com`;
  await page.goto("/en/account");
  await page.locator("#email").fill(me);
  await page.locator("form:has(#email) button").click();
  await expect(page).toHaveURL(/\/en\/account\/verify/);
  let code = "";
  for (let i = 0; i < 20 && !code; i++) {
    await page.goto(`/en/dev/mailbox?to=${encodeURIComponent(me)}`);
    code = ((await page.locator('li[data-kind="access_code"] pre').first().textContent().catch(() => "")) ?? "").match(/\b(\d{6})\b/)?.[1] ?? "";
  }
  await page.goto("/en/account/verify");
  await page.locator("#code").fill(code);
  await page.locator("form:has(#code) button").click();
  await page.waitForURL(/\/en\/account\/products$/);

  for (const p of paid) {
    await page.goto(`/en/app/${p.slug}`);
    await expect(page.getByTestId("product-app"), p.slug).toHaveCount(0);
    await expect(page.getByRole("heading", { level: 1 }), p.slug).toHaveText(
      p.kind === "download" ? "This product is a download" : "Access Denied — You do not own this product."
    );
  }
});
