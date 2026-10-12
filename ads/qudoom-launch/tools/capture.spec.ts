import { test, type Page } from "@playwright/test";
// Captures real screens of «حكاية قدوم» for the launch ad and the product page mockup (not part of the suite).
test.describe.configure({ mode: "serial", timeout: 300_000 });
const OUT = process.env.CAP ?? "/tmp/cap";
async function signIn(page: Page, address: string) {
  await page.addInitScript(() => {
    localStorage.setItem("oc-consent", "essential");
    document.addEventListener("DOMContentLoaded", () => { const st = document.createElement("style"); st.textContent = "nextjs-portal{display:none!important}"; document.head.appendChild(st); });
  });
  await page.goto("/ar/account");
  await page.locator("#email").fill(address);
  await page.locator("form:has(#email) button").click();
  await page.waitForURL(/\/account\/verify/);
  let code = "";
  for (let i = 0; i < 20 && !code; i++) {
    await page.goto(`/en/dev/mailbox?to=${encodeURIComponent(address)}`);
    code = ((await page.locator('li[data-kind="access_code"] pre').first().textContent().catch(() => "")) ?? "").match(/\b(\d{6})\b/)?.[1] ?? "";
  }
  await page.goto("/ar/account/verify");
  await page.locator("#code").fill(code);
  await page.locator("form:has(#code) button").click();
  await page.waitForURL((u) => !u.pathname.endsWith("/verify"));
  if (/\/account\/welcome/.test(new URL(page.url()).pathname)) {
    await page.locator("#name").fill("أم سلمى");
    await page.locator('form:has(#name) button:not([type="button"])').click();
    await page.waitForURL((u) => !u.pathname.endsWith("/welcome"));
  }
}
const shot = (page: Page, name: string, full = false) => page.screenshot({ path: `${OUT}/${name}.png`, fullPage: full });
async function setup(page: Page) {
  await page.goto("/ar/app/hikayat-qudoom/settings");
  if (await page.getByRole("button", { name: "حذف بيانات المفكّرة" }).isVisible().catch(() => false)) {
    await page.getByRole("button", { name: "حذف بيانات المفكّرة" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "حذف" }).click();
    await page.waitForTimeout(1500);
  }
  await page.goto("/ar/app/hikayat-qudoom");
  await page.locator("#q-name").fill("أم سلمى");
  await page.locator("#q-due").fill(new Date(Date.now() + 24 * 86400000).toISOString().slice(0, 10));
  await page.getByRole("button", { name: "يلا نبدأ" }).click();
  await page.waitForTimeout(2000);
  await page.getByRole("button", { name: "تعديل المعلومات" }).click();
  await page.locator("#ps-baby").fill("سلمى");
  await page.locator("#ps-city").fill("مسقط");
  await page.getByRole("button", { name: "حفظ", exact: true }).click();
  await page.waitForTimeout(1200);
}
test("capture", async ({ page }, info) => {
  const m = info.project.name === "mobile";
  await signIn(page, m ? "owner-mobile@example.com" : "owner@example.com");
  await setup(page);
  const p = m ? "m" : "d";
  await page.goto("/ar/app/hikayat-qudoom"); await page.waitForTimeout(2600); await shot(page, `${p}-home`);
  await page.goto("/ar/app/hikayat-qudoom/steps"); await page.waitForTimeout(2200); await shot(page, `${p}-steps`);
  await page.goto("/ar/app/hikayat-qudoom/ideas"); await page.waitForTimeout(2200); await shot(page, `${p}-ideas-top`);
  await page.mouse.wheel(0, m ? 900 : 700); await page.waitForTimeout(900); await shot(page, `${p}-ideas-list`);
  await page.getByText("شوفي الشكل ووين تلاقينها").first().click(); await page.waitForTimeout(1100); await shot(page, `${p}-idea-sheet`);
  await page.keyboard.press("Escape");
  await page.goto("/ar/app/hikayat-qudoom/looks"); await page.waitForTimeout(2200); await shot(page, `${p}-looks`);
  await page.goto("/ar/app/hikayat-qudoom/bag"); await page.waitForTimeout(1800); await shot(page, `${p}-bag`);
  await page.goto("/ar/app/hikayat-qudoom/items"); await page.waitForTimeout(1800); await shot(page, `${p}-items`);
  await page.goto("/ar/app/hikayat-qudoom"); await page.waitForTimeout(1500);
  await page.getByRole("button", { name: /^التنبيهات/ }).click(); await page.waitForTimeout(1000); await shot(page, `${p}-reminders`);
});
