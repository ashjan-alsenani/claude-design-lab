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
}

test("landing page presents the product in both languages", async ({ page }) => {
  await page.goto("/en/products/bride-planner");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Plan your wedding beautifully.");
  await expect(page.getByRole("link", { name: "Start My Bridal Journey" }).first()).toBeVisible();
  await page.goto("/ar/products/bride-planner");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("خطّطي لزفافك بأناقة");
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
  const me = `bride-${uid()}@example.com`;
  await signIn(page, me);
  await page.goto("/en/checkout/bride-planner");
  await page.getByRole("button", { name: "Simulate successful payment" }).click();
  await expect(page.getByRole("heading", { name: "Payment confirmed (sandbox)" })).toBeVisible();

  await page.goto("/en/account/products");
  await page.getByRole("listitem").filter({ hasText: "Bridal Journey" }).getByRole("link", { name: "Open product" }).click();
  await expect(page).toHaveURL(/\/en\/app\/bride-planner$/);
  await page.getByRole("button", { name: "Start My Bridal Journey" }).click();

  // Step 1..8
  await page.getByRole("textbox", { name: "What's your name?" }).fill("Noor");
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
  await page.getByRole("button", { name: "Add your first vendor" }).click();
  await page.getByLabel("Name", { exact: true }).fill("Lumière Studio");
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
  await expect(other.getByRole("heading", { name: "This product isn't available in your account" })).toBeVisible();
  await expect(other.getByText("Lumière Studio")).toHaveCount(0);
});
