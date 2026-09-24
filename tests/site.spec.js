import { test, expect } from '@playwright/test';
import { createHash } from 'node:crypto';
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
    const bio = page.locator('[data-i18n-html="home.bio"]');
    await expect(bio).toBeVisible();
    await expect(bio).toContainText('Лёва Матюшкин');
    await expect(bio).not.toContainText('Hi!');
  });

  test('EN: shows English bio', async ({ page }) => {
    await page.goto('/?lang=en');
    const bio = page.locator('[data-i18n-html="home.bio"]');
    await expect(bio).toBeVisible();
    await expect(bio).toContainText('Leo Matyushkin');
    await expect(bio).not.toContainText('Привет');
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
    await expect(page.locator('[data-i18n-html="art.bio"]')).toContainText('«Журнале» (бывший «Журнал на коленке»)');
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
    const bio = page.locator('[data-i18n-html="technology.bio"]');
    await expect(bio).toBeVisible();
    await expect(bio).toContainText('Инженер');
    await expect(bio).not.toContainText('Engineer');
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
    const bio = page.locator('[data-i18n-html="art.bio"]');
    await expect(bio).toContainText('אני כותב שירה');
    await expect(bio).not.toContainText('Пишу стихи');
    await page.goto('/art/music/the-jungle-route/?lang=he');
    await expect(page.locator('h1:visible')).toHaveCount(1);
    await expect(page.locator('[data-lang="ru"]').first()).toBeHidden();
    await expect(page.locator('[data-lang="en"]').first()).toBeHidden();
  });

  test('a work page reads right to left with a Hebrew date', async ({ page }) => {
    await page.goto('/art/music/the-jungle-route/?lang=he');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.locator('.achievement-meta[data-lang="he"]')).toContainText('ביולי');
    await expect(page.locator('.item-links[data-lang="he"]')).toContainText('האזנה');
  });

  test('every page declares a Hebrew alternate', async ({ page }) => {
    for (const url of ['/', '/art/index.html', '/science/index.html', '/technology/index.html']) {
      await page.goto(url);
      await expect(page.locator('link[hreflang="he"]')).toHaveCount(1);
    }
  });
});

// ─── French ──────────────────────────────────────────────────────────────────

test.describe('French', () => {
  test('pages read in French, left to right, with French dates', async ({ page }) => {
    await page.goto('/art/index.html?lang=fr');
    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
    await expect(page.locator('#music-title')).toHaveText('Musique');
    await expect(page.locator('[data-i18n-html="art.bio"]')).toContainText('J’écris de la poésie');
    await page.goto('/art/music/the-jungle-route/?lang=fr');
    await expect(page.locator('.achievement-meta[data-lang="fr"]')).toContainText('juillet');
    await expect(page.locator('.item-links[data-lang="fr"]')).toContainText('Écouter');
  });
});

// ─── Chinese and Japanese ────────────────────────────────────────────────────

test.describe('Chinese and Japanese', () => {
  test('Chinese pages carry the zh-Hans tag, wide colons and Chinese dates', async ({ page }) => {
    await page.goto('/art/index.html?lang=zh');
    await expect(page.locator('html')).toHaveAttribute('lang', 'zh-Hans');
    await expect(page.locator('#music-title')).toHaveText('音乐');
    await expect(page.locator('.release-links').first()).toContainText('收听：');
    await page.goto('/art/music/the-jungle-route/?lang=zh');
    await expect(page.locator('.achievement-meta[data-lang="zh"]')).toContainText('2026年7月31日');
  });

  test('Japanese pages carry the ja tag and Japanese dates', async ({ page }) => {
    await page.goto('/science/index.html?lang=ja');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ja');
    await expect(page.locator('[data-i18n-html="science.bio"]')).toContainText(/論文\d+本/);
    await page.goto('/art/books/aya-2018/?lang=ja');
    await expect(page.locator('.item-links[data-lang="ja"]')).toContainText('読む：');
  });
});

// ─── Spanish and Portuguese ──────────────────────────────────────────────────

test.describe('Spanish and Portuguese', () => {
  test('Spanish reads in Spanish with Spanish dates', async ({ page }) => {
    await page.goto('/art/index.html?lang=es');
    await expect(page.locator('#music-title')).toHaveText('Música');
    await page.goto('/art/music/the-jungle-route/?lang=es');
    await expect(page.locator('.achievement-meta[data-lang="es"]')).toContainText('31 de julio de 2026');
  });

  test('Portuguese carries the pt-BR tag and Brazilian wording', async ({ page }) => {
    await page.goto('/science/index.html?lang=pt');
    await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
    await expect(page.locator('[data-i18n-html="science.bio"]')).toContainText('pesquisa');
  });
});

// ─── German, Korean and Arabic ───────────────────────────────────────────────

test.describe('German, Korean and Arabic', () => {
  test('German dates read "31. Juli 2026"', async ({ page }) => {
    await page.goto('/art/music/the-jungle-route/?lang=de');
    await expect(page.locator('.achievement-meta[data-lang="de"]')).toContainText('31. Juli 2026');
  });

  test('Korean keeps words whole and dates in its own order', async ({ page }) => {
    await page.goto('/art/music/the-jungle-route/?lang=ko');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ko');
    await expect(page.locator('.achievement-meta[data-lang="ko"]')).toContainText('2026년 7월 31일');
    expect(await page.evaluate(() => getComputedStyle(document.body).wordBreak)).toBe('keep-all');
  });

  test('Arabic reads right to left with Western digits', async ({ page }) => {
    await page.goto('/art/index.html?lang=ar');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.locator('#music-title')).toHaveText('الموسيقى');
    await page.goto('/art/music/the-jungle-route/?lang=ar');
    await expect(page.locator('.achievement-meta[data-lang="ar"]')).toContainText('31 يوليو 2026');
    expect(await page.evaluate(() => getComputedStyle(document.querySelector('.achievement-meta[data-lang="ar"]')).letterSpacing)).toMatch(/^(0px|normal)$/);
  });

  test('on a right-to-left page each link keeps its own direction', async ({ page }) => {
    for (const lang of ['ar', 'he']) {
      await page.goto('/science/index.html?lang=' + lang);
      await page.waitForSelector('.achievement a');
      expect(await page.evaluate(() => getComputedStyle(document.querySelector('.achievement a')).unicodeBidi)).toBe('plaintext');
    }
  });
});

// ─── Translations: one file ──────────────────────────────────────────────────

test.describe('translations', () => {
  test('the selector lists exactly the languages in i18n.json', async ({ page, request }) => {
    const i18n = await (await request.get('/source/i18n.json')).json();
    for (const url of ['/', '/art/index.html', '/science/index.html', '/art/books/aya-2018/']) {
      await page.goto(url);
      await expect(page.locator('#lang-select option')).toHaveCount(i18n.languages.length);
    }
  });

  test('every language fills every translated element', async ({ page, request }) => {
    const i18n = await (await request.get('/source/i18n.json')).json();
    const urls = ['/', '/art/index.html', '/science/index.html', '/technology/index.html', '/donate/index.html'];
    // One page load per language and page: the budget grows with the language list.
    test.setTimeout(i18n.languages.length * urls.length * 4000 + 10000);
    for (const { code, tag } of i18n.languages) {
      for (const url of urls) {
        await page.goto(url + '?lang=' + code);
        // site.js sets Site.locale once it has filled the page; no need to wait for analytics.
        await page.waitForFunction(() => window.Site && window.Site.locale);
        const empty = await page.$$eval('[data-i18n],[data-i18n-html]', els =>
          els.filter(e => !e.textContent.trim()).map(e => e.getAttribute('data-i18n') || e.getAttribute('data-i18n-html')));
        expect(empty, `${url} in ${code}`).toEqual([]);
        await expect(page.locator('html')).toHaveAttribute('lang', tag || code);
      }
    }
  });

  test('switching language rewrites the page without a reload', async ({ page }) => {
    await page.goto('/art/index.html?lang=ru');
    await expect(page.locator('#music-title')).toHaveText('Музыка');
    await page.selectOption('#lang-select', 'en');
    await expect(page.locator('#music-title')).toHaveText('Music');
    await expect(page.locator('[data-i18n-html="art.bio"]')).toContainText('I write poetry');
    await expect(page).toHaveURL(/lang=en/);
  });

  test('a work page carries one block per language in i18n.json', async ({ page, request }) => {
    const i18n = await (await request.get('/source/i18n.json')).json();
    await page.goto('/art/books/aya-2018/');
    await expect(page.locator('main h1')).toHaveCount(i18n.languages.length);
    await expect(page.locator('main h1:visible')).toHaveCount(1);
  });

  test('every page declares one alternate per language', async ({ page, request }) => {
    const i18n = await (await request.get('/source/i18n.json')).json();
    for (const url of ['/', '/art/index.html', '/science/index.html', '/art/music/beneath-the-light/']) {
      await page.goto(url);
      await expect(page.locator('link[rel="alternate"][hreflang]:not([hreflang="x-default"])')).toHaveCount(i18n.languages.length);
    }
  });
});

// ─── Cache: a page never pairs an old script with new translations ──────────

test.describe('asset fingerprints', () => {
  test('every page loads site.js and style.css by the hash of their content', async ({ page, request }) => {
    const hash = async path => createHash('sha1').update(await (await request.get(path)).body()).digest('hex').slice(0, 10);
    const js = await hash('/source/site.js');
    const css = await hash('/style.css');
    for (const url of ['/', '/art/index.html', '/science/index.html', '/technology/index.html', '/cv/index.html', '/art/music/the-jungle-route/']) {
      await page.goto(url);
      await expect(page.locator(`script[src$="source/site.js?v=${js}"]`)).toHaveCount(1);
      await expect(page.locator(`link[href$="style.css?v=${css}"]`)).toHaveCount(1);
    }
  });

  test('the selector never shows "undefined"', async ({ page }) => {
    await page.goto('/art/index.html');
    const names = await page.$$eval('#lang-select option', os => os.map(o => o.textContent));
    expect(names.join(' ')).not.toContain('undefined');
    expect(names.length).toBeGreaterThan(1);
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
