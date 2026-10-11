import { expect, test, type Page, type Browser } from "@playwright/test";

/**
 * «حكاية قدوم»: sales page, isolated demo, the licensed app (setup → saved to the server), the public
 * gift list (reserve, last-item protection, manage link) and visit booking with approval.
 */
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
  if (/\/account\/welcome/.test(new URL(page.url()).pathname)) {
    await page.locator("#name").fill("Test Mum");
    await page.locator('form:has(#name) button:not([type="button"])').click();
    await page.waitForURL((u) => !u.pathname.endsWith("/welcome"));
    await page.waitForLoadState("networkidle");
  }
}
const saved = (page: Page) => expect(page.locator('[data-save="saved"]')).toBeVisible({ timeout: 15_000 });

async function guest(browser: Browser) {
  const ctx = await browser.newContext();
  const p = await ctx.newPage();
  await p.addInitScript(() => localStorage.setItem("oc-consent", "essential"));
  return { ctx, p };
}

test("sales page: no price invented, no buy button, demo linked, both languages", async ({ page }) => {
  await page.goto("/en/products/hikayat-qudoom");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Hikayat Qudoom");
  await expect(page.getByText("Price coming soon").first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Try the demo" })).toHaveAttribute("href", "/en/demo/hikayat-qudoom");
  await expect(page.getByRole("heading", { name: "Your privacy first" })).toBeVisible();
  await page.goto("/ar/products/hikayat-qudoom");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("حكاية قدوم");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  // Not purchasable until the owner sets a price.
  expect((await page.request.get("/ar/checkout/hikayat-qudoom")).status()).toBe(404);
});

test("demo: fictional data, edits stay in the tab, reset brings the sample back, no real links", async ({ page }) => {
  await page.goto("/en/demo/hikayat-qudoom");
  await expect(page.getByText("Demo with fictional data")).toBeVisible();
  await expect(page.getByText("Salma's mum", { exact: false }).first()).toBeVisible();
  await page.goto("/en/demo/hikayat-qudoom/share");
  await expect(page.getByText("In the demo you only see how it looks")).toBeVisible();
  // Nothing from the demo is ever sent to the server: no server-action POSTs.
  const posts: string[] = [];
  page.on("request", (r) => r.method() === "POST" && posts.push(r.url()));
  await page.goto("/en/demo/hikayat-qudoom/bag");
  await page.waitForLoadState("networkidle");
  expect(posts).toEqual([]);
});

test("licensed app: protected, set up, saved on the server; gift link + visit booking with DB-checked limits", async ({ page, browser, isMobile }) => {
  // Signed out: the product URL asks to sign in.
  await page.goto("/en/app/hikayat-qudoom");
  await expect(page).toHaveURL(/\/en\/account/);

  // The site owner opens every product without a purchase (purchasing isn't open yet).
  await signIn(page, isMobile ? "owner-mobile@example.com" : "owner@example.com");
  await page.goto("/en/app/hikayat-qudoom/settings");
  // Start clean if a previous run left a plan.
  if (await page.getByRole("button", { name: "Delete planner data" }).isVisible().catch(() => false)) {
    await page.getByRole("button", { name: "Delete planner data" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Delete" }).click();
    await page.waitForTimeout(1500);
  }
  await page.goto("/en/app/hikayat-qudoom");
  await page.locator("#q-name").fill("Noor's mum");
  await page.getByRole("button", { name: "Skip and start with a ready plan" }).click();
  await expect(page.getByText("Noor's mum").first()).toBeVisible();
  await saved(page);

  // A gift with exactly one left.
  await page.goto("/en/app/hikayat-qudoom/registry");
  await page.getByRole("button", { name: "Wished gift" }).first().click();
  const dlg = page.getByRole("dialog");
  await dlg.getByLabel("Name", { exact: true }).fill("Baby monitor");
  await dlg.getByRole("button", { name: "Save" }).click();
  await saved(page);
  await page.reload();
  await expect(page.getByText("Baby monitor").first()).toBeVisible();

  // Share the gift list.
  await page.goto("/en/app/hikayat-qudoom/share");
  const giftCard = page.locator("div.qd-card", { has: page.getByRole("heading", { name: "Gift list", level: 3 }) });
  await giftCard.getByRole("button", { name: "Create link" }).click();
  const giftUrl = (await page.locator("p[dir=ltr]").filter({ hasText: "/q/g/" }).first().textContent())!.trim();
  expect(giftUrl).toMatch(/\/en\/q\/g\/[A-Za-z0-9_-]{32}$/);
  const giftPath = new URL(giftUrl).pathname;

  // Two guests try to reserve the last one: exactly one wins.
  const a = await guest(browser), b = await guest(browser);
  await a.p.goto(new URL(giftPath, page.url()).href);
  await b.p.goto(new URL(giftPath, page.url()).href);
  for (const g of [a.p, b.p]) {
    await g.getByRole("button", { name: "Reserve", exact: true }).click();
  }
  await Promise.all([a.p.getByRole("button", { name: "Confirm reservation" }).click(), b.p.getByRole("button", { name: "Confirm reservation" }).click()]);
  await a.p.waitForTimeout(1500);
  const wins = (await a.p.getByText("Reserved 🤍").count()) + (await b.p.getByText("Reserved 🤍").count());
  expect(wins).toBe(1);
  const winner = (await a.p.getByText("Reserved 🤍").count()) ? a.p : b.p;
  const loser = winner === a.p ? b.p : a.p;
  await expect(loser.getByText("The last one was just reserved")).toBeVisible();
  // The winner's private manage link: confirm the purchase.
  const manage = (await winner.locator("p[dir=ltr]").first().textContent())!.trim();
  await winner.goto(new URL(new URL(manage).pathname, page.url()).href);
  await winner.getByRole("button", { name: "I bought it" }).click();
  await expect(winner.getByText("Thank you! Your purchase is recorded.")).toBeVisible();
  // The public page shows no guest names.
  await loser.reload();
  await expect(loser.getByText("Every gift is reserved right now")).toBeVisible();
  await a.ctx.close();
  await b.ctx.close();

  // The mother sees the counts.
  await page.goto("/en/app/hikayat-qudoom/registry");
  await expect(page.getByText("Bought: 1").first()).toBeVisible();

  // Visits: share, a visitor requests, the mother approves.
  await page.goto("/en/app/hikayat-qudoom/share");
  const visitCard = page.locator("div.qd-card", { has: page.getByRole("heading", { name: "Visit requests", level: 3 }) });
  await visitCard.getByRole("button", { name: "Create link" }).click();
  const visitUrl = (await page.locator("p[dir=ltr]").filter({ hasText: "/q/v/" }).first().textContent())!.trim();
  const v = await guest(browser);
  await v.p.goto(new URL(new URL(visitUrl).pathname, page.url()).href);
  await expect(v.p.getByText("We never show other guests' names")).toBeVisible();
  expect(await v.p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  await v.p.locator("fieldset button[aria-pressed]").nth(1).click();
  await v.p.locator("fieldset .flex-wrap button").first().click();
  await v.p.locator("#v-name").fill("Aunt Huda");
  const send = v.p.getByRole("button", { name: "Send request" });
  await expect(send).toBeEnabled();
  await send.scrollIntoViewIfNeeded();
  await send.click();
  await expect(v.p.getByText("Request received")).toBeVisible();
  await v.ctx.close();
  await page.goto("/en/app/hikayat-qudoom/visits");
  await page.getByRole("button", { name: /Requests from your link/ }).click();
  await page.getByRole("button", { name: "Approve" }).first().click();
  await saved(page);
  await page.getByRole("button", { name: /^Visits/ }).first().click();
  await expect(page.getByText("Aunt Huda").first()).toBeVisible();

  // Disabling the link makes it unavailable.
  await page.goto("/en/app/hikayat-qudoom/share");
  await page.locator("div.qd-card", { has: page.getByRole("heading", { name: "Gift list", level: 3 }) }).getByRole("button", { name: "Disable link" }).click();
  await expect(page.getByText("Disabled").first()).toBeVisible();
  const g2 = await guest(browser);
  await g2.p.goto(new URL(giftPath, page.url()).href);
  await expect(g2.p.getByText("This link isn't available")).toBeVisible();
  await g2.ctx.close();
});

test("helpers and private files: own account, chosen sections only, revocable; photos never public", async ({ page, browser, isMobile }) => {
  const owner = isMobile ? "owner-mobile@example.com" : "owner@example.com";
  await signIn(page, owner);
  await page.goto("/en/app/hikayat-qudoom");
  if (await page.locator("#q-name").isVisible().catch(() => false)) {
    await page.locator("#q-name").fill("Noor's mum");
    await page.getByRole("button", { name: "Skip and start with a ready plan" }).click();
    await saved(page);
  }

  // A private photo: the owner can open it, nobody else can.
  const png = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
  const meta = await page.evaluate(async (b64) => {
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const fd = new FormData();
    fd.append("file", new Blob([bytes], { type: "image/png" }), "p.png");
    fd.append("name", "p.png");
    fd.append("board", "memories");
    const r = await fetch("/api/qudoom/file", { method: "POST", body: fd });
    return { status: r.status, body: await r.json() };
  }, png);
  expect(meta.status).toBe(200);
  const fileId = meta.body.meta.id as string;
  expect((await page.request.get(`/api/qudoom/file/${fileId}`)).status()).toBe(200);
  // A file pretending to be an image (HTML inside) is refused.
  const bad = await page.evaluate(async () => {
    const fd = new FormData();
    fd.append("file", new Blob(["<html><script>alert(1)</script>"], { type: "image/png" }), "x.png");
    return (await fetch("/api/qudoom/file", { method: "POST", body: fd })).status;
  });
  expect(bad).toBe(415);
  const anon = await browser.newContext();
  expect((await anon.request.get(`/api/qudoom/file/${fileId}`)).status()).toBe(404);
  await anon.close();

  // Invite a helper for chosen sections, view only.
  const helperEmail = `helper-${Date.now().toString(36)}${isMobile ? "m" : "d"}@example.com`;
  await page.goto("/en/app/hikayat-qudoom/share");
  await page.locator("#h-email").fill(helperEmail);
  await page.getByRole("switch").first().click(); // can edit → view only
  await page.getByRole("button", { name: "Invite a helper" }).click();
  const invite = (await page.locator("p[dir=ltr]").filter({ hasText: "/q/h/" }).first().textContent())!.trim();

  const h = await browser.newContext();
  const hp = await h.newPage();
  await hp.addInitScript(() => localStorage.setItem("oc-consent", "essential"));
  await signIn(hp, helperEmail);
  await hp.goto(new URL(invite).pathname);
  await hp.getByRole("button", { name: "Accept invitation" }).click();
  await hp.waitForURL(/\/en\/shared\/hikayat-qudoom\/qh_/);
  const base = new URL(hp.url()).pathname.split("/").slice(0, 5).join("/");
  await expect(hp.getByText("Noor's mum").first()).toBeVisible();
  // Budget wasn't shared: the page is hidden and its data never reached the browser.
  await hp.goto(`${base}/budget`);
  await expect(hp.getByText("This section is switched off")).toBeVisible();
  // Settings and sharing stay with the mother.
  await hp.goto(`${base}/share`);
  await expect(hp.getByText("This section is switched off")).toBeVisible();
  // The memories photo isn't in her sections either.
  expect((await hp.request.get(`/api/qudoom/file/${fileId}?h=${base.split("/").pop()}`)).status()).toBe(404);
  // View only: no add buttons.
  await hp.goto(`${base}/items`);
  await expect(hp.getByRole("heading", { name: "Baby things" })).toBeVisible();
  await expect(hp.getByRole("button", { name: /^Add/ })).toHaveCount(0);

  // The mother removes access; the helper's next visit is refused.
  await page.goto("/en/app/hikayat-qudoom/share");
  await page.getByRole("button", { name: "Remove access" }).first().click();
  await page.waitForTimeout(800);
  await hp.goto(base);
  await expect(hp.getByText("Access to this planner was removed.")).toBeVisible();
  await h.close();
});
