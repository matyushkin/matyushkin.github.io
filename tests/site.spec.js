import { test, expect } from '@playwright/test';

// ─── Helpers ────────────────────────────────────────────────────────────────

async function setLang(page, lang) {
  await page.evaluate(l => localStorage.setItem('lang', l), lang);
}

async function clearStorage(page) {
  await page.evaluate(() => localStorage.clear());
}

// ─── Index ───────────────────────────────────────────────────────────────────

test.describe('index.html', () => {
  test('RU: shows Russian bio', async ({ page }) => {
    await page.goto('/?lang=ru');
    const ruP = page.locator('main p[lang="ru"]');
    const enP = page.locator('main p[lang="en"]');
    await expect(ruP).toBeVisible();
    await expect(enP).toBeHidden();
    await expect(ruP).toContainText('Лёва Матюшкин');
  });

  test('EN: shows English bio', async ({ page }) => {
    await page.goto('/?lang=en');
    const ruP = page.locator('main p[lang="ru"]');
    const enP = page.locator('main p[lang="en"]');
    await expect(enP).toBeVisible();
    await expect(ruP).toBeHidden();
    await expect(enP).toContainText('Leo Matyushkin');
  });

  test('RU: nav labels in Russian', async ({ page }) => {
    await page.goto('/?lang=ru');
    await expect(page.locator('#nav-art')).toHaveText('Искусство');
    await expect(page.locator('#nav-science')).toHaveText('Наука');
    await expect(page.locator('#nav-technology')).toHaveText('Технологии');
  });

  test('EN: nav labels in English', async ({ page }) => {
    await page.goto('/?lang=en');
    await expect(page.locator('#nav-art')).toHaveText('Art');
    await expect(page.locator('#nav-science')).toHaveText('Science');
    await expect(page.locator('#nav-technology')).toHaveText('Technology');
  });

  test('nav links lead to correct pages', async ({ page }) => {
    await page.goto('/?lang=en');
    await expect(page.locator('#nav-art')).toHaveAttribute('href', 'art/index.html');
    await expect(page.locator('#nav-science')).toHaveAttribute('href', 'science/index.html');
    await expect(page.locator('#nav-technology')).toHaveAttribute('href', 'technology/index.html');
  });
});

// ─── Science ─────────────────────────────────────────────────────────────────

test.describe('science/index.html', () => {
  test('RU: profiles include Гугл Академия and eLIBRARY', async ({ page }) => {
    await page.goto('/science/index.html?lang=ru');
    const profiles = page.locator('#profiles-list');
    await expect(profiles).toContainText('Гугл Академия');
    await expect(profiles).toContainText('eLIBRARY');
    await expect(profiles).toContainText('Стэпик');
  });

  test('EN: profiles show Google Scholar, no eLIBRARY', async ({ page }) => {
    await page.goto('/science/index.html?lang=en');
    const profiles = page.locator('#profiles-list');
    await expect(profiles).toContainText('Google Scholar');
    await expect(profiles).toContainText('Stepik');
    await expect(profiles).not.toContainText('eLIBRARY');
  });

  test('RU: publication links show Гугл Академия', async ({ page }) => {
    await page.goto('/science/index.html?lang=ru');
    await expect(page.locator('#achievements-list')).toContainText('Гугл Академия');
  });

  test('publications render (non-empty list)', async ({ page }) => {
    await page.goto('/science/index.html?lang=en');
    const items = page.locator('.achievement');
    await expect(items.first()).toBeVisible();
    await expect(await items.count()).toBeGreaterThan(10);
  });

  test('RU: page title is Наука', async ({ page }) => {
    await page.goto('/science/index.html?lang=ru');
    await expect(page.locator('h1')).toHaveText('Наука');
  });
});

// ─── Art ─────────────────────────────────────────────────────────────────────

test.describe('art/index.html', () => {
  test('RU: profiles in Russian', async ({ page }) => {
    await page.goto('/art/index.html?lang=ru');
    const profiles = page.locator('#profiles-list');
    await expect(profiles).toContainText('Саундклауд');
    await expect(profiles).toContainText('Телеграм (LMPIX)');
    await expect(profiles).toContainText('Бихенс');
    await expect(profiles).toContainText('Дриббл');
    await expect(profiles).toContainText('Девиантарт');
  });

  test('EN: profiles in English', async ({ page }) => {
    await page.goto('/art/index.html?lang=en');
    const profiles = page.locator('#profiles-list');
    await expect(profiles).toContainText('SoundCloud');
    await expect(profiles).toContainText('Telegram (LMPIX)');
    await expect(profiles).toContainText('Behance');
  });

  test('books show самиздат in RU', async ({ page }) => {
    await page.goto('/art/index.html?lang=ru');
    await expect(page.locator('#book-aya')).toContainText('самиздат');
    await expect(page.locator('#book-space')).toContainText('самиздат');
  });

  test('EN titles include translation in brackets', async ({ page }) => {
    await page.goto('/art/index.html?lang=en');
    await expect(page.locator('#achievements-list')).toContainText('[Other Clay]');
  });

  test('publications render (non-empty list)', async ({ page }) => {
    await page.goto('/art/index.html?lang=en');
    await expect(page.locator('.achievement').first()).toBeVisible();
  });
});

// ─── Technology ──────────────────────────────────────────────────────────────

test.describe('technology/index.html', () => {
  test('RU: page title is Технологии', async ({ page }) => {
    await page.goto('/technology/index.html?lang=ru');
    await expect(page.locator('#page-title')).toHaveText('Технологии');
  });

  test('posts list is present', async ({ page }) => {
    await page.goto('/technology/index.html?lang=en');
    const items = page.locator('article li');
    await expect(await items.count()).toBeGreaterThan(50);
  });

  test('RU: bio paragraph visible', async ({ page }) => {
    await page.goto('/technology/index.html?lang=ru');
    await expect(page.locator('p[lang="ru"]')).toBeVisible();
    await expect(page.locator('p[lang="en"]')).toBeHidden();
  });
});

// ─── Theme toggle ─────────────────────────────────────────────────────────────

test.describe('theme toggle', () => {
  test('clicking ◑ switches to dark theme', async ({ page }) => {
    await page.goto('/?lang=en');
    await clearStorage(page);
    await page.reload();
    await page.click('.theme-button');
    await expect(page.locator('body')).toHaveClass(/dark-theme/);
  });

  test('theme persists via localStorage', async ({ page }) => {
    await page.goto('/?lang=en');
    await page.evaluate(() => localStorage.setItem('theme', 'dark-theme'));
    await page.reload();
    await expect(page.locator('body')).toHaveClass(/dark-theme/);
  });
});

// ─── Language persistence ─────────────────────────────────────────────────────

test.describe('language persistence', () => {
  test('localStorage lang survives navigation', async ({ page }) => {
    await page.goto('/?lang=ru');
    await page.click('#nav-science');
    await expect(page.locator('h1')).toHaveText('Наука');
  });

  test('?lang= param overrides localStorage', async ({ page }) => {
    await page.goto('/');
    await setLang(page, 'ru');
    await page.goto('/science/index.html?lang=en');
    await expect(page.locator('h1')).toHaveText('Science');
  });
});
