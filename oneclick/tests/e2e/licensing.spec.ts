import { expect, test, type Browser, type Page } from "@playwright/test";

/**
 * Licensing & access engine, end to end in the SANDBOX (fictional data, simulated payments).
 * Each browser context is a separate device; each test uses its own email addresses.
 */
const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
const email = (who: string) => `${who}-${uid()}@example.com`;

async function newDevice(browser: Browser, baseURL: string | undefined): Promise<Page> {
  // Same device profile as the current project (desktop or mobile), fresh cookies = new device.
  const { launchOptions: _l, ...profile } = test.info().project.use as Record<string, unknown>;
  const ctx = await browser.newContext({ ...profile, baseURL });
  const page = await ctx.newPage();
  await page.addInitScript(() => localStorage.setItem("oc-consent", "essential"));
  return page;
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("oc-consent", "essential"));
});

async function latestMail(page: Page, to: string, kind: string) {
  for (let i = 0; i < 20; i++) {
    await page.goto(`/en/dev/mailbox?to=${encodeURIComponent(to)}`);
    const item = page.locator(`li[data-kind="${kind}"]`).first();
    if (await item.count()) return (await item.locator("pre").textContent()) ?? "";
    await page.waitForTimeout(250);
  }
  throw new Error(`No ${kind} email for ${to}`);
}

async function codeFor(page: Page, to: string) {
  const text = await latestMail(page, to, "access_code");
  return text.match(/\b(\d{6})\b/)![1];
}

async function signInWithCode(page: Page, address: string, locale = "en") {
  await page.goto(`/${locale}/account`);
  await page.locator("#email").fill(address);
  await page.locator("form:has(#email) button").click();
  await expect(page).toHaveURL(new RegExp(`/${locale}/account/verify`));
  const verifyUrl = page.url();
  const code = await codeFor(page, address);
  await page.goto(verifyUrl);
  await page.locator("#code").fill(code);
  await page.locator("form:has(#code) button").click();
  await page.waitForURL((u) => !u.pathname.endsWith("/verify"));
  await finishWelcome(page);
}
/** First sign-in asks for a name and picture; fill it in when it appears. */
async function finishWelcome(page: Page, name = "Test Customer") {
  if (!/\/account\/welcome/.test(new URL(page.url()).pathname)) return;
  await page.locator("#name").fill(name);
  await page.locator('form:has(#name) button:not([type="button"])').click();
  await page.waitForURL((u) => !u.pathname.endsWith("/welcome"));
  // Let the redirect after saving finish before the test navigates elsewhere.
  await page.waitForLoadState("networkidle");
}


async function buy(page: Page, slug: string, outcome: "Simulate successful payment" | "Simulate failed payment", guestEmail?: string) {
  await page.goto(`/en/checkout/${slug}`);
  await expect(page.getByText("PAYMENT PROVIDER NOT YET CONNECTED")).toBeVisible();
  if (guestEmail) {
    // Buying needs no account: a guest sees that up front and only gives an email.
    await expect(page.getByText("No account needed")).toBeVisible();
    await page.locator("#sandbox-email").fill(guestEmail);
  }
  await page.getByRole("button", { name: outcome }).click();
  // Wait for the payment result before the test moves on.
  await page.waitForURL(/\/en\/checkout\/done/);
}

test("guest purchase -> Open My Product email -> code -> straight into the product", async ({ page }) => {
  const buyer = email("buyer");
  await buy(page, "grocery-list", "Simulate successful payment", buyer);
  await expect(page.getByRole("heading", { name: "Payment confirmed (sandbox)" })).toBeVisible();

  // One email: the purchase confirmation with an "Open My Product" link. The link only starts verification.
  const mail = await latestMail(page, buyer, "claim_product");
  expect(mail).toContain("Thank you, your purchase is confirmed");
  expect(mail).toMatch(/Order: OC-/);
  expect(mail).toMatch(/Paid: .*4\.5|Paid: .*4\.500/);
  expect(mail).toContain("Open My Product");
  const link = new URL(mail.match(/https?:\/\/\S+\/claim\?t=\S+/)![0]);
  await page.goto(link.pathname + link.search);
  await expect(page.getByRole("heading", { name: "Add your product to your account" })).toBeVisible();
  await expect(page.getByText("Grocery List")).toBeVisible();
  await expect(page.getByText(buyer)).toHaveCount(0); // email is masked
  await page.getByRole("button", { name: "Send my code" }).click();
  await expect(page).toHaveURL(/\/en\/account\/verify\?next=%2Fen%2Fapp%2Fgrocery-list/);
  const verifyUrl = page.url();
  const code = await codeFor(page, buyer);
  await page.goto(verifyUrl);
  await page.locator("#code").fill(code);
  await page.getByRole("button", { name: "Verify" }).click();

  // The account is created and the product opens straight away: no profile form in the way.
  await expect(page).toHaveURL(/\/en\/app\/grocery-list$/);
  await expect(page.getByTestId("product-app")).toBeVisible();

  // It's listed in My Products, with an optional (never required) profile hint.
  await page.goto("/en/account/products");
  await expect(page.getByRole("link", { name: "Complete my profile" })).toBeVisible();
  const card = page.getByRole("listitem").filter({ hasText: "Grocery List" });
  await expect(card.getByText("Active")).toBeVisible();
  await card.getByRole("link", { name: "Open product" }).click();
  await expect(page).toHaveURL(/\/en\/app\/grocery-list$/);
  await expect(page.getByTestId("product-app")).toBeVisible();
  await expect(page.getByText(`Licensed to`)).toBeVisible();
});

test("returning customer: the purchase email opens the product itself, and a signed-in owner skips the code", async ({ page }) => {
  const me = email("returning");
  await signInWithCode(page, me);
  await buy(page, "grocery-list", "Simulate successful payment");
  await expect(page.getByRole("heading", { name: "Payment confirmed (sandbox)" })).toBeVisible();
  const mail = await latestMail(page, me, "products_ready");
  expect(mail).toContain("Open My Product");
  const open = new URL(mail.match(/https?:\/\/\S+\/en\/app\/grocery-list/)![0]);
  await page.goto(open.pathname);
  await expect(page.getByTestId("product-app")).toBeVisible();
});

test("a guest who is already signed in with the purchase email goes straight from the email link to the product", async ({ page }) => {
  const me = email("guestfirst");
  await buy(page, "grocery-list", "Simulate successful payment", me);
  const link = new URL((await latestMail(page, me, "claim_product")).match(/https?:\/\/\S+\/claim\?t=\S+/)![0]);
  await signInWithCode(page, me);
  await page.goto(link.pathname + link.search);
  await expect(page).toHaveURL(/\/en\/app\/grocery-list$/);
  await expect(page.getByTestId("product-app")).toBeVisible();
});

test("shared URL and forwarded link give no access to another account", async ({ page, browser, baseURL }) => {
  const owner = email("owner");
  await buy(page, "bride-planner", "Simulate successful payment", owner);
  const mail = await latestMail(page, owner, "claim_product");
  const link = new URL(mail.match(/https?:\/\/\S+\/claim\?t=\S+/)![0]);

  // A friend gets the forwarded email and the product URL.
  const friendPage = await newDevice(browser, baseURL);
  const friend = email("friend");
  await signInWithCode(friendPage, friend);
  await expect(friendPage).toHaveURL(/\/en\/account\/products$/);
  await friendPage.goto("/en/app/bride-planner");
  await expect(friendPage.getByRole("heading", { name: "Access Denied — You do not own this product." })).toBeVisible();
  await expect(friendPage.getByRole("link", { name: "Explore product" })).toBeVisible();
  await expect(friendPage.getByRole("link", { name: "Go to My Products" })).toBeVisible();
  await expect(friendPage.getByRole("link", { name: "Contact support" })).toBeVisible();

  await friendPage.goto(link.pathname + link.search);
  await friendPage.getByRole("button", { name: "Send my code" }).click();
  // The code went to the OWNER's inbox, not the friend's.
  await friendPage.goto(`/en/dev/mailbox?to=${encodeURIComponent(friend)}`);
  await expect(friendPage.locator('li[data-kind="access_code"]')).toHaveCount(1); // only their own sign-in code
  await friendPage.goto("/en/account/products");
  await expect(friendPage.getByText("No products yet.")).toBeVisible();

  // Signed-out visitors are sent to sign in.
  const anon = await newDevice(browser, baseURL);
  await anon.goto("/en/app/bride-planner");
  await expect(anon).toHaveURL(/\/en\/account\?next=%2Fen%2Fapp%2Fbride-planner/);
});

test("failed payment creates no product", async ({ page }) => {
  const buyer = email("failed");
  await signInWithCode(page, buyer);
  await buy(page, "weekly-planner", "Simulate failed payment");
  await expect(page.getByRole("heading", { name: "Payment not completed (sandbox)" })).toBeVisible();
  await page.goto("/en/account/products");
  await expect(page.getByText("No products yet.")).toBeVisible();
  await page.goto("/en/app/weekly-planner");
  await expect(page.getByRole("heading", { name: "Access Denied — You do not own this product." })).toBeVisible();
});

test("a fourth device must replace a trusted device before opening products", async ({ page, browser, baseURL }) => {
  const me = email("devices");
  await signInWithCode(page, me); // device 1
  await buy(page, "fitness-tracker", "Simulate successful payment");
  for (let i = 2; i <= 3; i++) {
    const d = await newDevice(browser, baseURL);
    await signInWithCode(d, me); // devices 2 and 3 (within the limit of 3)
    await expect(d).toHaveURL(/\/en\/account\/products$/);
  }

  const third = await newDevice(browser, baseURL);
  await signInWithCode(third, me);
  await expect(third).toHaveURL(/\/en\/account\/devices\?authorize=1/);
  await expect(third.getByRole("heading", { name: "Authorize this device" })).toBeVisible();
  await third.goto("/en/app/fitness-tracker");
  await expect(third.getByRole("heading", { name: "Authorize this device first" })).toBeVisible();
  await third.goto("/en/account/devices?authorize=1");
  await third.getByRole("button", { name: "Remove it and use this device" }).first().click();
  await expect(third.getByText("This device is now trusted.")).toBeVisible();
  await third.goto("/en/app/fitness-tracker");
  await expect(third.getByTestId("product-app")).toBeVisible();
});

test("admin suspends a license and access stops; the owner is recognized", async ({ page, browser, baseURL, isMobile }) => {
  const buyer = email("admin-case");
  await signInWithCode(page, buyer);
  await buy(page, "budget-planner", "Simulate successful payment");
  await page.goto("/en/app/budget-planner");
  await expect(page.getByTestId("product-app")).toBeVisible();

  const admin = await newDevice(browser, baseURL);
  await signInWithCode(admin, "owner@example.com");
  await admin.goto(`/en/admin/licensing?q=${encodeURIComponent(buyer)}`);
  const row = admin.getByRole("row").filter({ hasText: buyer });
  await row.getByLabel("Action").selectOption("suspend");
  await row.getByLabel("Reason").fill(isMobile ? "mobile e2e check" : "desktop e2e check");
  await row.getByRole("checkbox").check();
  await row.getByRole("button", { name: "Apply" }).click();
  await expect(admin.getByText("Saved. The change is in the audit log.")).toBeVisible();

  await page.goto("/en/app/budget-planner");
  await expect(page.getByRole("heading", { name: "This license is paused" })).toBeVisible();
  await admin.goto("/en/admin/licensing?tab=activity");
  await expect(admin.getByText("license suspend").first()).toBeVisible();

  // The owner email is recognized: an owner panel with every product and the admin link.
  await admin.goto("/en/account/products");
  const panel = admin.locator("section", { has: admin.getByRole("heading", { name: "Owner account" }) });
  await expect(panel).toBeVisible();
  await expect(panel.getByRole("link", { name: "Admin panel" })).toBeVisible();
  await expect(panel.getByRole("link", { name: /Bridal Journey/ })).toHaveAttribute("href", "/en/app/bride-planner");
});

test("customers cannot open admin licensing", async ({ page }) => {
  await signInWithCode(page, email("customer"));
  const res = await page.goto("/en/admin/licensing");
  expect(res?.status()).toBe(404);
});

test("Arabic: sign-in, My Products and devices in RTL", async ({ page }) => {
  const me = email("arabic");
  await signInWithCode(page, me, "ar");
  await expect(page).toHaveURL(/\/ar\/account\/products$/);
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.getByRole("heading", { level: 1, name: "منتجاتي" })).toBeVisible();
  await page.goto("/ar/account/devices");
  await expect(page.getByText("هذا الجهاز").first()).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});
