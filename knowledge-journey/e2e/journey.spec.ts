import { expect, test, type Page } from '@playwright/test';

/** Fail the test on any console error or uncaught exception. */
function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  return errors;
}

async function backToMap(page: Page) {
  await page.getByRole('button', { name: 'العودة إلى الخريطة' }).click();
  await expect(page).toHaveURL(/#\/map$/);
}

/** Click options in turn until `done` becomes visible (handles shuffled answers). */
async function solve(page: Page, options: ReturnType<Page['locator']>, done: ReturnType<Page['locator']>) {
  const n = await options.count();
  for (let i = 0; i < n; i++) {
    if (await done.isVisible()) return;
    const b = options.nth(i);
    if (await b.isEnabled()) await b.click();
    await page.waitForTimeout(150);
  }
  await expect(done).toBeVisible();
}

test('a student completes the whole journey from the intro to the coronation', async ({ page, isMobile }) => {
  const errors = watchErrors(page);
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'رحلة إلى كنوز المعرفة' })).toBeVisible();
  await expect(page.getByText('جنى الخاطري')).toBeVisible();
  await page.getByRole('button', { name: 'لنبدأ المغامرة' }).click({ force: true });
  await page.getByRole('button', { name: /^فردي/ }).click();
  await page.getByPlaceholder('اكتبي اسمكِ هنا').fill('نورة');
  await page.getByRole('button', { name: 'انطلقي إلى الخريطة' }).click();
  await expect(page).toHaveURL(/#\/map$/);

  // locked island refuses
  await page.getByRole('button', { name: /2\. صندوق الكنوز المفقودة — مقفلة/ }).click({ force: true });
  await expect(page.getByRole('status').filter({ hasText: 'هذه الجزيرة مقفلة' })).toBeAttached();
  await expect(page).toHaveURL(/#\/map$/);

  /* 1 · gates */
  await page.getByRole('button', { name: /1\. بوابة المعرفة/ }).click();
  for (const gate of ['القرآن الكريم', 'السنة النبوية']) {
    await page.getByRole('button', { name: `بوابة ${gate}` }).click();
    const facts = page.locator('.fact');
    await expect(facts).toHaveCount(5);
    for (let i = 0; i < (await facts.count()); i++) await facts.nth(i).click();
    await page.getByRole('button', { name: 'إلى سؤال البوابة' }).click();
    await solve(page, page.locator('.gate-quiz .qopt'), page.getByRole('button', { name: 'العودة إلى القاعة' }));
    await page.getByRole('button', { name: 'العودة إلى القاعة' }).click();
  }
  await page.getByRole('button', { name: 'ابدئي التحدي النهائي' }).click();
  for (let i = 0; i < 6; i++) {
    await page.locator('.final-choice').first().click();
    await page.getByRole('button', { name: /العبارة التالية|استلمي الجوهرة/ }).click();
  }
  await expect(page.getByRole('dialog')).toContainText('حصلتِ على جوهرة');
  await backToMap(page);
  await expect(page.getByText('أكملتِ 1 من 8 جزر')).toBeVisible();

  /* 2 · chests — first card by real drag & drop, the rest by tap mode */
  await page.getByRole('button', { name: /2\. صندوق الكنوز المفقودة/ }).click();
  const cards = page.locator('.tcard');
  await expect(cards).toHaveCount(8);
  {
    const card = cards.first();
    const text = (await card.textContent()) ?? '';
    const kind = /قالها|«المسلم/.test(text) ? 'qawliyya' : /صحابي/.test(text) ? 'taqririyya' : 'filiyya';
    const box = (await card.boundingBox())!;
    const target = (await page.locator(`[data-drop="${kind}"]`).boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 + 10, box.y + box.height / 2 + 10, { steps: 3 });
    await page.mouse.move(target.x + target.width / 2, target.y + target.height / 2, { steps: 12 });
    await page.mouse.up();
    await expect(cards).toHaveCount(7);
  }
  while ((await cards.count()) > 0) {
    const before = await cards.count();
    for (const kind of ['qawliyya', 'filiyya', 'taqririyya']) {
      await cards.first().click();
      await page.locator(`[data-drop="${kind}"]`).click();
      await page.waitForTimeout(450);
      if ((await cards.count()) < before) break;
    }
  }
  await page.getByRole('button', { name: 'استلمي الجوهرة' }).click();
  await backToMap(page);

  /* 3 · wheel — six real spins */
  await page.getByRole('button', { name: /3\. عجلة التحديات/ }).click();
  for (let r = 0; r < 6; r++) {
    await page.getByRole('button', { name: /أديري/ }).click();
    await expect(page.locator('.wheel-landed')).toBeVisible({ timeout: 10_000 });
    await page.locator('.qcard .qopt').first().click();
  }
  await page.getByRole('button', { name: /استلمي الجوهرة/ }).click();
  await backToMap(page);

  /* 4 · detective */
  await page.getByRole('button', { name: /4\. المحققة الذكية/ }).click();
  for (let c = 0; c < 6; c++) {
    await page.locator('.clue').first().click();
    const next = page.getByRole('button', { name: /القضية التالية|إغلاق الملفات/ });
    await solve(page, page.locator('.case-options .qopt'), next);
    await next.click();
  }
  await backToMap(page);

  /* 5 · puzzle — one placement by tap, then verify, then hints to finish */
  await page.getByRole('button', { name: /5\. أحجية المعرفة/ }).click();
  await page.locator('.pz-tray .pz-piece', { hasText: 'السنة النبوية' }).click();
  await page.locator('[data-drop="s-root"]').click();
  await page.getByRole('button', { name: 'تحقّقي' }).click();
  await expect(page.locator('[data-drop="s-root"][data-locked="true"]')).toBeVisible();
  for (let i = 0; i < 6; i++) await page.getByRole('button', { name: 'تلميح' }).click();
  await expect(page.locator('.pz-board[data-complete="true"]')).toBeVisible();
  await page.getByRole('button', { name: 'استلمي المكافأة' }).click();
  await backToMap(page);

  /* 6 · cinema — the clock must stop at each cue, even when seeking past it */
  await page.getByRole('button', { name: /6\. السينما التفاعلية/ }).click();
  await page.getByRole('button', { name: 'ابدئي العرض' }).click();
  await expect(page.locator('.film')).toBeVisible();
  await page.waitForTimeout(1500);
  const t1 = await page.locator('.time').textContent();
  await page.waitForTimeout(1200);
  expect(await page.locator('.time').textContent()).not.toBe(t1); // really playing
  await page.getByRole('button', { name: 'إيقاف مؤقت' }).click();
  const paused = await page.locator('.time').textContent();
  await page.waitForTimeout(1200);
  expect(await page.locator('.time').textContent()).toBe(paused); // really paused
  for (let k = 0; k < 3; k++) {
    await page.locator('input[type=range]').fill('86');
    await expect(page.locator('.film-cue')).toBeVisible();
    await page.locator('.film-cue .qopt').first().click();
    await page.getByRole('button', { name: 'تابعي المشاهدة' }).click();
  }
  await page.locator('input[type=range]').fill('86');
  await expect(page.getByRole('heading', { name: 'انتهت الحكاية!' })).toBeVisible();
  await page.getByRole('button', { name: 'استلمي الجوهرة' }).click();
  await backToMap(page);

  /* 7 · lightning — answer the first two, let the third time out for real */
  await page.getByRole('button', { name: /7\. تحدي البرق/ }).click();
  await page.getByRole('button', { name: /تحدٍّ فردي/ }).click();
  for (let i = 0; i < 10; i++) {
    if (i === 2) {
      await expect(page.locator('.feedback-title', { hasText: 'انتهى الوقت' })).toBeVisible({ timeout: 20_000 });
    } else {
      await page.locator('.qcard .qopt').first().click();
    }
    await page.getByRole('button', { name: /السؤال التالي|النتيجة النهائية/ }).click();
  }
  await backToMap(page);
  await expect(page.getByText('أكملتِ 7 من 8 جزر')).toBeVisible();

  /* 8 · coronation */
  await page.getByRole('button', { name: /8\. قصر التتويج/ }).click();
  await page.getByRole('button', { name: 'افتحي البوابة الذهبية' }).click();
  await expect(page.getByLabel('لوحة النتائج النهائية')).toContainText('نورة');
  await expect(page.getByLabel('لوحة النتائج النهائية')).toContainText('8 / 8');
  const cert = page.getByRole('img', { name: /شهادة إنجاز باسم نورة/ });
  await expect(cert).toBeVisible();
  if (!isMobile) {
    const download = page.waitForEvent('download');
    await page.getByRole('button', { name: /تنزيل الشهادة/ }).click();
    expect((await download).suggestedFilename()).toMatch(/\.png$/);
  }

  // progress survives a reload
  await page.reload();
  await page.goto('/#/map');
  await expect(page.getByText('أكملتِ 8 من 8 جزر')).toBeVisible();
  expect(errors).toEqual([]);
});

test('teacher edits the bank and runs a class competition', async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto('/#/teacher');
  await expect(page.getByText(/60 من 60 سؤالًا/)).toBeVisible();
  await page.getByRole('button', { name: 'سؤال جديد' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: 'حفظ السؤال' }).click();
  await expect(dialog.getByRole('alert')).toContainText('نص السؤال مطلوب');
  await dialog.locator('textarea').first().fill('سؤال تجريبي: ما المصدر الثاني للتشريع؟');
  for (const [i, t] of ['السنة النبوية', 'القرآن الكريم', 'القياس', 'الإجماع'].entries()) await dialog.getByLabel(`نص الخيار ${i + 1}`).fill(t);
  await dialog.locator('textarea').nth(1).fill('السنة النبوية هي المصدر الثاني.');
  await dialog.getByRole('button', { name: 'حفظ السؤال' }).click();
  await expect(page.getByText(/61 من 61 سؤالًا/)).toBeVisible();
  await page.locator('.q-row', { hasText: 'سؤال تجريبي' }).getByRole('button', { name: 'حذف' }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'حذف' }).click();
  await expect(page.getByText(/60 من 60 سؤالًا/)).toBeVisible();

  await page.getByRole('tab', { name: 'الإعدادات' }).click();
  await page.getByLabel('مدة سؤال تحدي البرق (ثانية)').fill('20');

  await page.getByRole('button', { name: 'تشغيل المنافسة الصفية' }).click();
  await page.getByLabel('عدد الأسئلة').fill('2');
  await page.locator('label.team-toggle', { hasText: 'فريق القمر' }).click();
  await page.locator('label.team-toggle', { hasText: 'فريق الجواهر' }).click();
  await page.getByRole('button', { name: 'ابدئي المنافسة' }).click();
  await expect(page.getByText(/دور\s*فريق النجوم/)).toBeVisible();
  await page.locator('.qcard .qopt').first().click();
  await page.getByRole('button', { name: 'السؤال التالي' }).click();
  await expect(page.getByText(/دور\s*فريق اللؤلؤ/)).toBeVisible();
  await page.locator('.qcard .qopt').first().click();
  await page.getByRole('button', { name: 'لوحة الترتيب النهائية' }).click();
  await expect(page.getByRole('heading', { name: 'لوحة الترتيب النهائية' })).toBeVisible();
  await page.getByRole('button', { name: 'لوحة المعلمة' }).last().click();
  await page.getByRole('tab', { name: 'جلسات المنافسة' }).click();
  await expect(page.locator('.session')).toHaveCount(1);
  expect(errors).toEqual([]);
});

test('no screen overflows horizontally', async ({ page, context }) => {
  await context.addInitScript(() => {
    localStorage.setItem('kj.progress', JSON.stringify({ version: 1, name: 'نورة', activities: {}, badges: [], freshUnlock: null }));
    localStorage.setItem('kj.teacher', JSON.stringify({ version: 1, unlockAll: true, customized: false, lightningSeconds: 15, lightningCount: 10, wheelQuickSeconds: 15, sessions: [], activeSessionId: null }));
  });
  const width = page.viewportSize()!.width;
  for (const r of ['/', '/#/map', ...['gates', 'chests', 'wheel', 'detective', 'puzzle', 'cinema', 'lightning', 'crown'].map((a) => `/#/play/${a}`), '/#/teacher', '/#/arena']) {
    await page.goto(r);
    await page.waitForTimeout(900);
    const [scroll, inner] = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
    expect(inner, r).toBe(width);
    expect(scroll, r).toBeLessThanOrEqual(width + 1);
  }
});

test('drag & drop works with a real touch gesture', async ({ page, context, browserName, isMobile }) => {
  test.skip(!isMobile || browserName !== 'chromium', 'touch emulation via CDP');
  await context.addInitScript(() => {
    localStorage.setItem('kj.progress', JSON.stringify({ version: 1, name: 'نورة', activities: {}, badges: [], freshUnlock: null }));
    localStorage.setItem('kj.teacher', JSON.stringify({ version: 1, unlockAll: true, customized: false, lightningSeconds: 15, lightningCount: 10, wheelQuickSeconds: 15, sessions: [], activeSessionId: null }));
  });
  await page.goto('/#/play/chests');
  const cards = page.locator('.tcard');
  await expect(cards).toHaveCount(8);
  const card = cards.first();
  await card.scrollIntoViewIfNeeded();
  const text = (await card.textContent()) ?? '';
  const kind = /قالها|«المسلم/.test(text) ? 'qawliyya' : /صحابي/.test(text) ? 'taqririyya' : 'filiyya';
  const a = (await card.boundingBox())!;
  const t = (await page.locator(`[data-drop="${kind}"]`).boundingBox())!;
  const cdp = await context.newCDPSession(page);
  const touch = (type: string, x: number, y: number) =>
    cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y }] });
  const [x0, y0, x1, y1] = [a.x + a.width / 2, a.y + a.height / 2, t.x + t.width / 2, t.y + t.height / 2];
  await touch('touchStart', x0, y0);
  for (let i = 1; i <= 15; i++) await touch('touchMove', x0 + ((x1 - x0) * i) / 15, y0 + ((y1 - y0) * i) / 15);
  await touch('touchEnd', x1, y1);
  await expect(cards).toHaveCount(7);
  await expect(page.locator('.chest-msg[data-ok="true"]')).toBeVisible();
});

test('group mode: teams take turns and score on the class board', async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto('/');
  await page.getByRole('button', { name: 'لنبدأ المغامرة' }).click({ force: true });
  await page.getByRole('button', { name: /^جماعي/ }).click();
  await page.locator('label.team-toggle', { hasText: 'فريق الجواهر' }).click();
  await page.locator('label.team-toggle', { hasText: 'فريق القمر' }).click();
  await page.getByPlaceholder(/اسم الصف/).fill('الصف السابع');
  await page.getByRole('button', { name: 'ابدئي الفعالية' }).click();
  await expect(page).toHaveURL(/#\/map$/);
  await expect(page.locator('html')).toHaveClass(/board-mode/);
  const bar = page.getByRole('region', { name: 'نقاط الفرق' });
  await expect(bar.locator('.tb-team')).toHaveCount(2);
  await expect(bar.locator('.tb-team[data-active="true"]')).toContainText('فريق النجوم');

  await page.getByRole('button', { name: /1\. بوابة المعرفة/ }).click();
  await page.getByRole('button', { name: 'بوابة القرآن الكريم' }).click();
  const facts = page.locator('.fact');
  await expect(facts).toHaveCount(5);
  for (let i = 0; i < 5; i++) await facts.nth(i).click();
  await page.getByRole('button', { name: 'إلى سؤال البوابة' }).click();
  // the correct answer for the Quran gate quiz is «سورة الناس»
  await page.locator('.gate-quiz .qopt', { hasText: 'سورة الناس' }).click();
  await expect(bar.locator('.tb-team', { hasText: 'فريق النجوم' }).locator('.tb-score')).toHaveText('20');
  await expect(bar.locator('.tb-team[data-active="true"]')).toContainText('فريق اللؤلؤ');
  expect(errors).toEqual([]);
});

test('the how-to-use video opens and is playable', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /كيف أستخدم الموقع/ }).click();
  const video = page.getByRole('dialog', { name: 'كيف أستخدم الموقع؟' }).locator('video');
  await expect(video).toBeVisible();
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.duration), { timeout: 15_000 }).toBeGreaterThan(200);
  await page.keyboard.press('Escape');
  await expect(video).toBeHidden();
});
