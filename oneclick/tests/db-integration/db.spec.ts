import { expect, test, type Page } from "@playwright/test";
/** Production build + Postgres/PostgREST (Supabase API) + mock Resend: owner sign-in by emailed code, admin, planner save, contact form. */
const inbox = async () => (await (await fetch("http://localhost:54331/inbox")).json()) as { to: string[]; subject: string; text: string; from: string }[];

async function signIn(page: Page, address: string) {
  await page.goto("/en/account");
  await page.locator("#email").fill(address);
  await page.locator("form:has(#email) button").click();
  await expect(page).toHaveURL(/\/en\/account\/verify/);
  let code = "";
  for (let i = 0; i < 40 && !code; i++) {
    const m = (await inbox()).filter((x) => x.to[0] === address).at(-1);
    code = m?.text.match(/\b(\d{6})\b/)?.[1] ?? "";
    if (!code) await page.waitForTimeout(250);
  }
  expect(code).toMatch(/^\d{6}$/);
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
}


test("owner signs in with an emailed code and controls the site; data lands in the database", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("oc-consent", "essential"));
  await signIn(page, "owner@oneclick.test");
  const mail = (await inbox()).at(-1)!;
  expect(mail.from).toBe("One Click <hello@oneclick.test>");

  // First sign-in went through the welcome form; a profile photo is stored in the database and served privately.
  await page.goto("/en/account/profile");
  const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAAKklEQVR4nGM4EVVBU8QwasGoBaMWjFowasGoBaMWjFowasGoBaMWDBULABLmaFswJ2EyAAAAAElFTkSuQmCC", "base64");
  await page.locator('input[type="file"][name="photo"]').setInputFiles({ name: "me.png", mimeType: "image/png", buffer: png });
  await expect(page.locator('form img[src^="blob:"]')).toBeVisible();
  await page.locator('form:has(#name) button:not([type="button"])').click();
  await expect(page.getByRole("status")).toContainText("Your profile is saved.");
  const src = (await page.locator('nav img[src^="/api/avatar/"]').first().getAttribute("src"))!;
  expect((await page.request.get(src)).headers()["content-type"]).toBe("image/jpeg");

  await page.goto("/en/account/products");
  await expect(page.getByRole("heading", { name: "Owner account" })).toBeVisible();

  await page.goto("/en/admin");
  await expect(page.getByText("Connected (Supabase)")).toBeVisible();
  await expect(page.getByText("Connected (Resend)")).toBeVisible();
  await page.goto("/en/admin/licensing");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  // Owner opens the bridal planner without buying it and the plan is saved server-side.
  await page.goto("/en/app/bride-planner");
  await page.getByRole("button", { name: "Start My Bridal Journey" }).click();
  await page.getByRole("textbox", { name: "What's your name?" }).fill("Noor");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.locator("#ob-city").fill("Muscat");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("spinbutton", { name: "What's your approximate budget?" }).fill("12000");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("radio", { name: "Venue booked" }).click();
  await page.getByRole("button", { name: "Create my plan" }).click();
  await page.getByRole("button", { name: "Enter your journey" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Saved" }).first()).toBeVisible({ timeout: 15_000 });
  await page.reload();
  await expect(page.getByText(/Noor/).first()).toBeVisible();

  // A stranger cannot open the planner.
  const other = await (await page.context().browser()!.newContext({ baseURL: "http://localhost:3600" })).newPage();
  await other.goto("/en/app/bride-planner");
  await expect(other.getByTestId("product-app")).toHaveCount(0);
});

test("custom request is stored in the database", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("oc-consent", "essential"));
  await page.goto("/en/custom");
  await page.fill("#goal", "A booking site for a home bakery");
  await page.getByRole("group").getByText("Website", { exact: true }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.fill("#features", "Menu, WhatsApp orders");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByText("Not sure yet").click();
  await page.getByText("Yes, I have branding").click();
  await page.locator("label", { hasText: /^No$/ }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.fill("#name", "DB Tester");
  await page.fill("#email", "db-tester@example.com");
  await page.locator('input[name="privacy"]').check();
  await page.getByRole("button", { name: "Send request" }).click();
  await expect(page.getByText("Request received")).toBeVisible();
});
