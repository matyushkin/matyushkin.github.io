import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

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
    const ruP = page.locator('main article p[lang="ru"]');
    const enP = page.locator('main article p[lang="en"]');
    await expect(ruP).toBeVisible();
    await expect(enP).toBeHidden();
    await expect(ruP).toContainText('Лёва Матюшкин');
  });

  test('EN: shows English bio', async ({ page }) => {
    await page.goto('/?lang=en');
    const ruP = page.locator('main article p[lang="ru"]');
    const enP = page.locator('main article p[lang="en"]');
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
    await expect(page.locator('#profiles-music')).toContainText('Саундклауд');
    const visual = page.locator('#profiles-visual');
    await expect(visual).toContainText('Канал в Телеграме (LMPIX)');
    await expect(visual).toContainText('Дриббл');
    await expect(visual).toContainText('Девиантарт');
  });

  test('EN: profiles in English', async ({ page }) => {
    await page.goto('/art/index.html?lang=en');
    await expect(page.locator('#profiles-music')).toContainText('SoundCloud');
    await expect(page.locator('#profiles-visual')).toContainText('Telegram channel (LMPIX)');
  });

  test('books show самиздат in RU', async ({ page }) => {
    await page.goto('/art/index.html?lang=ru');
    await expect(page.locator('#aya-2018')).toContainText('самиздат');
    await expect(page.locator('#o-prostranstve-i-vremeni-2015')).toContainText('самиздат');
  });

  test('EN titles include translation in brackets', async ({ page }) => {
    await page.goto('/art/index.html?lang=en');
    await expect(page.locator('#achievements-list')).toContainText('[Other Clay]');
  });

  test('RU bio mentions Журнал (formerly На коленке)', async ({ page }) => {
    await page.goto('/art/index.html?lang=ru');
    await expect(page.locator('p[lang="ru"]').first()).toContainText('«Журнале» (бывший «Журнал на коленке»)');
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

  test('RU: posts list has 100+ items', async ({ page }) => {
    await page.goto('/technology/index.html?lang=ru');
    const items = page.locator('#articles-list li');
    await expect(await items.count()).toBeGreaterThan(100);
  });

  test('EN: shows only English articles', async ({ page }) => {
    await page.goto('/technology/index.html?lang=en');
    const items = page.locator('#articles-list li');
    await expect(await items.count()).toBeGreaterThan(30);
    await expect(page.locator('#articles-list')).not.toContainText('Python');
  });

  test('RU: bio paragraph visible', async ({ page }) => {
    await page.goto('/technology/index.html?lang=ru');
    await expect(page.locator('p[lang="ru"]')).toBeVisible();
    await expect(page.locator('p[lang="en"]')).toBeHidden();
  });
});

// ─── Hebrew ──────────────────────────────────────────────────────────────────

test.describe('Hebrew', () => {
  test('sets the language and turns the page right to left', async ({ page }) => {
    await page.goto('/art/index.html?lang=he');
    await expect(page.locator('html')).toHaveAttribute('lang', 'he');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.locator('#page-title')).toHaveText('אמנות');
    await expect(page.locator('#music-title')).toHaveText('מוזיקה');
  });

  test('other languages stay hidden', async ({ page }) => {
    await page.goto('/art/index.html?lang=he');
    await expect(page.locator('main p[lang="he"]').first()).toBeVisible();
    await expect(page.locator('main p[lang="ru"]').first()).toBeHidden();
    await expect(page.locator('main p[lang="en"]').first()).toBeHidden();
  });

  test('a work page reads right to left with a Hebrew date', async ({ page }) => {
    await page.goto('/art/music/the-jungle-route/?lang=he');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.locator('.achievement-meta[lang="he"]')).toContainText('ביולי');
    await expect(page.locator('.item-links[lang="he"]')).toContainText('האזנה');
  });

  test('the selector offers three languages everywhere', async ({ page }) => {
    for (const url of ['/', '/science/index.html', '/technology/index.html', '/art/books/aya-2018/']) {
      await page.goto(url);
      await expect(page.locator('#lang-select option')).toHaveCount(3);
    }
  });

  test('every page declares a Hebrew alternate', async ({ page }) => {
    for (const url of ['/', '/art/index.html', '/science/index.html', '/technology/index.html']) {
      await page.goto(url);
      await expect(page.locator('link[hreflang="he"]')).toHaveCount(1);
    }
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

// ─── Accessibility (axe-core) ────────────────────────────────────────────────

test.describe('accessibility (WCAG 2.1 AA)', () => {
  const pages = [
    '/?lang=en',
    '/art/index.html?lang=en',
    '/science/index.html?lang=en',
    '/technology/index.html?lang=en',
  ];

  for (const url of pages) {
    test(`no critical a11y violations: ${url}`, async ({ page }) => {
      await page.goto(url);
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();
      expect(results.violations).toEqual([]);
    });
  }
});

// ─── html[lang] attribute ────────────────────────────────────────────────────

test.describe('html[lang] attribute', () => {
  test('lang=en sets html[lang] to en', async ({ page }) => {
    await page.goto('/science/index.html?lang=en');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });

  test('lang=ru sets html[lang] to ru', async ({ page }) => {
    await page.goto('/science/index.html?lang=ru');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ru');
  });

  test('switching language updates html[lang]', async ({ page }) => {
    await page.goto('/science/index.html?lang=ru');
    await page.selectOption('#lang-select', 'en');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });
});

// ─── Mobile layout ────────────────────────────────────────────────────────────

test.describe('mobile layout (375px)', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('nav is visible on mobile', async ({ page }) => {
    await page.goto('/?lang=en');
    await expect(page.locator('header nav')).toBeVisible();
    await expect(page.locator('#nav-art')).toBeVisible();
    await expect(page.locator('#nav-science')).toBeVisible();
    await expect(page.locator('#nav-technology')).toBeVisible();
  });

  test('science page renders on mobile', async ({ page }) => {
    await page.goto('/science/index.html?lang=en');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('.achievement').first()).toBeVisible();
  });

  test('technology page renders on mobile', async ({ page }) => {
    await page.goto('/technology/index.html?lang=en');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('article li').first()).toBeVisible();
  });
});
