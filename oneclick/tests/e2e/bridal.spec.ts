import { expect, test, type Page } from "@playwright/test";

/** Bridal Journey: landing, public demo, and the licensed app (sandbox purchase -> onboarding -> saved data). */
const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("oc-consent", "essential"));
});

async function signIn(page: Page, address: string) {
  await page.goto("/en/account");
  await page.locator("#email").fill(address);
  await page.locator("form:has(#email) button").click();
  await expect(page).toHaveURL(/\/en\/account\/verify/);
  let code = "";
  for (let i = 0; i < 20 && !code; i++) {
    await page.goto(`/en/dev/mailbox?to=${encodeURIComponent(address)}`);
    const txt = (await page.locator('li[data-kind="access_code"] pre').first().textContent().catch(() => "")) ?? "";
    code = txt.match(/\b(\d{6})\b/)?.[1] ?? "";
  }
  await page.goto("/en/account/verify");
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


test("landing page presents the product in both languages", async ({ page }) => {
  await page.goto("/en/products/bride-planner");
  // The standard One Click product page: name, price CTA, the live demo and a link to the full sample app.
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Bridal Journey");
  await expect(page.getByRole("link", { name: "Try the full app with a sample wedding" })).toHaveAttribute("href", "/en/demo/bride-planner");
  await page.goto("/ar/products/bride-planner");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("رحلة العروس");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});

test("public demo: Layan's wedding is alive and interactive (nothing saved)", async ({ page, isMobile }) => {
  await page.goto("/en/demo/bride-planner");
  await expect(page.getByText("Sample wedding: changes are not saved")).toBeVisible();
  await expect(page.getByText("until your wedding", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Your focus this week" })).toBeVisible();
  const focus = page.locator("section", { has: page.getByRole("heading", { name: "Your focus this week" }) });
  const first = focus.getByRole("checkbox").first();
  const label = (await first.getAttribute("aria-label"))!;
  await first.click();
  // A finished task leaves the focus list.
  await expect(focus.getByRole("checkbox", { name: label, exact: true })).toHaveCount(0);
  // Navigate like an app: budget keeps the in-memory state.
  if (isMobile) await page.getByRole("navigation").last().getByRole("link", { name: "Budget" }).click();
  else await page.getByRole("link", { name: "Budget" }).first().click();
  await expect(page).toHaveURL(/\/en\/demo\/bride-planner\/budget$/);
  await expect(page.getByText("Total budget")).toBeVisible();
  await page.goto("/ar/demo/bride-planner/guests");
  await expect(page.locator(".bj[dir=rtl]")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1, name: "المدعوون" })).toBeVisible();
  for (const s of ["checklist", "calendar", "vendors", "closet", "shopping", "home", "honeymoon", "day", "inspiration", "documents", "settings", "more", "bride"]) {
    const res = await page.goto(`/en/demo/bride-planner/${s}`);
    expect(res?.status(), s).toBe(200);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, s).toBeLessThanOrEqual(1);
  }
});

test("licensed app: buy, onboard, plan, and the data persists in the account", async ({ page, browser, baseURL }) => {
  // The longest journey in the suite (purchase, eight setup steps, a second account); the dev server
  // compiles each section on first visit, so allow more than the default.
  test.setTimeout(90_000);
  const me = `bride-${uid()}@example.com`;
  await signIn(page, me);
  await page.goto("/en/checkout/bride-planner");
  await page.getByRole("button", { name: "Simulate successful payment" }).click();
  await expect(page.getByRole("heading", { name: "Payment confirmed (sandbox)" })).toBeVisible();

  await page.goto("/en/account/products");
  await page.getByRole("listitem").filter({ hasText: "Bridal Journey" }).getByRole("link", { name: "Open product" }).click();
  await expect(page).toHaveURL(/\/en\/app\/bride-planner$/);
  // On a busy dev server the first tap can land before the app's script has loaded; tap until it opens.
  const nameBox = page.getByRole("textbox", { name: "What's your name?" });
  await expect(async () => {
    await page.getByRole("button", { name: "Start My Bridal Journey" }).click();
    await expect(nameBox).toBeVisible({ timeout: 2000 });
  }).toPass({ timeout: 30_000 });

  // Step 1..8
  await nameBox.fill("Noor");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Continue" }).click(); // default date (in ~10 months)
  await page.locator("#ob-city").fill("Muscat");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByText("Add an approximate amount.")).toBeVisible();
  await page.getByRole("spinbutton", { name: "What's your approximate budget?" }).fill("12000");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Continue" }).click(); // guests
  await page.getByRole("checkbox", { name: "Bridal shower" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Continue" }).click(); // home & honeymoon
  await page.getByRole("radio", { name: "Venue booked" }).click();
  await page.getByRole("button", { name: "Create my plan" }).click();
  await expect(page.getByRole("heading", { name: /Your bridal journey is ready/ })).toBeVisible();
  await page.getByRole("button", { name: "Enter your journey" }).click();
  await expect(page.getByText(/Noor/).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Your focus this week" })).toBeVisible();
  await expect(page.getByRole("status").filter({ hasText: "Saved" }).first()).toBeVisible({ timeout: 10_000 });

  // Add a vendor, wait for the save, reload: it is still there (server-side, per account).
  await page.goto("/en/app/bride-planner/vendors");
  // Each section loads its own script; on a busy dev server the first tap can land before it is ready.
  const vendorName = page.getByLabel("Name", { exact: true });
  await expect(async () => {
    await page.getByRole("button", { name: "Add your first vendor" }).click();
    await expect(vendorName).toBeVisible({ timeout: 2000 });
  }).toPass({ timeout: 30_000 });
  await vendorName.fill("Lumière Studio");
  await page.getByRole("dialog").getByRole("button", { name: "Save" }).click();
  await expect(page.getByText("Lumière Studio")).toBeVisible();
  await expect(page.getByRole("status").filter({ hasText: "Saved" }).first()).toBeVisible({ timeout: 10_000 });
  await page.reload();
  await expect(page.getByText("Lumière Studio")).toBeVisible();

  // Another account opening the same URL gets nothing.
  const { launchOptions: _l, ...profile } = test.info().project.use as Record<string, unknown>;
  const other = await (await browser.newContext({ ...profile, baseURL })).newPage();
  await other.addInitScript(() => localStorage.setItem("oc-consent", "essential"));
  await signIn(other, `friend-${uid()}@example.com`);
  await other.goto("/en/app/bride-planner/vendors");
  await expect(other.getByRole("heading", { name: "Access Denied — You do not own this product." })).toBeVisible();
  await expect(other.getByText("Lumière Studio")).toHaveCount(0);
});
