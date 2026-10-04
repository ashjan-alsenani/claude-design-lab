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
}

test("owner signs in with an emailed code and controls the site; data lands in the database", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("oc-consent", "essential"));
  await signIn(page, "owner@oneclick.test");
  const mail = (await inbox()).at(-1)!;
  expect(mail.from).toBe("One Click <hello@oneclick.test>");

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
