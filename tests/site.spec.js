import { test, expect } from '@playwright/test';
import { createHash } from 'node:crypto';
import AxeBuilder from '@axe-core/playwright';

// Every page is static and written in one language: English at the root,
// every other language under /<code>/. Scripts are only needed for the theme
// and the language offer, so most checks read the page as a crawler would.

const SECTIONS = ['', 'science/', 'technology/', 'art/', 'cv/', 'donate/'];
const WORKS = ['art/music/the-jungle-route/', 'art/books/aya-2018/'];

async function i18nOf(request) {
  return (await request.get('/source/i18n.json')).json();
}

function at(i18n, code, path = '') {
  return '/' + (code === i18n.default ? '' : code + '/') + path;
}

// ─── Content is in the HTML itself ──────────────────────────────────────────

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('the science page lists its publications', async ({ page }) => {
    await page.goto('/science/');
    await expect(page.locator('h1')).toHaveText('Science');
    expect(await page.locator('#publications .achievement').count()).toBeGreaterThan(10);
  });

  test('the Russian technology page lists 100+ articles', async ({ page }) => {
    await page.goto('/ru/technology/');
    await expect(page.locator('h1')).toHaveText('Технологии');
    expect(await page.locator('#articles li').count()).toBeGreaterThan(100);
  });

  test('the art page lists releases, books and publications', async ({ page }) => {
    await page.goto('/art/');
    await expect(page.locator('#releases .release').first()).toBeVisible();
    await expect(page.locator('#books .achievement').first()).toBeVisible();
    await expect(page.locator('#publications .achievement').first()).toBeVisible();
  });

  test('the language menu opens and links every version', async ({ page, request }) => {
    const i18n = await i18nOf(request);
    await page.goto('/science/');
    await page.click('.lang-menu summary');
    await expect(page.locator('.lang-menu a[data-lang]')).toHaveCount(i18n.languages.length);
    await page.click('.lang-menu a[data-lang="ru"]');
    await expect(page).toHaveURL(/\/ru\/science\/$/);
    await expect(page.locator('h1')).toHaveText('Наука');
  });
});

// ─── Home ────────────────────────────────────────────────────────────────────

test.describe('home', () => {
  test('English at the root, Russian under /ru/', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('main p').first()).toContainText('Leo Matyushkin');
    await expect(page.locator('#nav-science')).toHaveText('Science');
    await page.goto('/ru/');
    await expect(page.locator('main p').first()).toContainText('Лёва Матюшкин');
    await expect(page.locator('#nav-art')).toHaveText('Искусство');
  });

  test('nav links stay in the page language', async ({ page }) => {
    await page.goto('/ru/');
    await expect(page.locator('#nav-art')).toHaveAttribute('href', '/ru/art/');
    await expect(page.locator('#nav-science')).toHaveAttribute('href', '/ru/science/');
    await expect(page.locator('#nav-technology')).toHaveAttribute('href', '/ru/technology/');
  });

  test('the home page introduces all three sections', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.home-sections li')).toHaveCount(3);
  });
});

// ─── Science ─────────────────────────────────────────────────────────────────

test.describe('science', () => {
  test('RU: profiles include Гугл Академия and eLIBRARY', async ({ page }) => {
    await page.goto('/ru/science/');
    const profiles = page.locator('#profiles');
    await expect(profiles).toContainText('Гугл Академия');
    await expect(profiles).toContainText('eLIBRARY');
    await expect(profiles).toContainText('Стэпик');
    await expect(page.locator('#publications')).toContainText('Гугл Академия');
  });

  test('EN: profiles show Google Scholar, no eLIBRARY', async ({ page }) => {
    await page.goto('/science/');
    const profiles = page.locator('#profiles');
    await expect(profiles).toContainText('Google Scholar');
    await expect(profiles).toContainText('Stepik');
    await expect(profiles).not.toContainText('eLIBRARY');
  });
});

// ─── Art ─────────────────────────────────────────────────────────────────────

test.describe('art', () => {
  test('RU: profiles in Russian', async ({ page }) => {
    await page.goto('/ru/art/');
    await expect(page.locator('#profiles-music')).toContainText('Саундклауд');
    const visual = page.locator('#profiles-visual');
    await expect(visual).toContainText('Канал в Телеграме (LMPIX)');
    await expect(visual).toContainText('Дриббл');
    await expect(visual).toContainText('Девиантарт');
  });

  test('EN: profiles in English', async ({ page }) => {
    await page.goto('/art/');
    await expect(page.locator('#profiles-music')).toContainText('SoundCloud');
    await expect(page.locator('#profiles-visual')).toContainText('Telegram channel (LMPIX)');
  });

  test('books show самиздат in RU', async ({ page }) => {
    await page.goto('/ru/art/');
    await expect(page.locator('#aya-2018')).toContainText('самиздат');
    await expect(page.locator('#o-prostranstve-i-vremeni-2015')).toContainText('самиздат');
  });

  test('EN titles include translation in brackets', async ({ page }) => {
    await page.goto('/art/');
    await expect(page.locator('#publications')).toContainText('[Other Clay]');
  });

  test('RU bio mentions Журнал (formerly На коленке)', async ({ page }) => {
    await page.goto('/ru/art/');
    await expect(page.locator('main > p').first()).toContainText('«Журнале» (бывший «Журнал на коленке»)');
  });

  test('releases are described for search engines', async ({ page }) => {
    await page.goto('/art/');
    const blocks = await page.$$eval('script[type="application/ld+json"]', ss => ss.map(s => JSON.parse(s.textContent)));
    expect(blocks.filter(b => b['@type'] === 'MusicAlbum').length).toBeGreaterThan(0);
  });
});

// ─── Technology ──────────────────────────────────────────────────────────────

test.describe('technology', () => {
  test('EN: shows only English articles', async ({ page }) => {
    await page.goto('/technology/');
    expect(await page.locator('#articles li').count()).toBeGreaterThan(30);
    await expect(page.locator('#articles')).not.toContainText('Python');
  });

  test('RU: bio in Russian', async ({ page }) => {
    await page.goto('/ru/technology/');
    const bio = page.locator('main > p').first();
    await expect(bio).toContainText('Инженер');
    await expect(bio).not.toContainText('Engineer');
  });
});

// ─── Each language: tag, direction, words and dates ─────────────────────────

test.describe('languages', () => {
  test('Hebrew reads right to left with a Hebrew date', async ({ page }) => {
    await page.goto('/he/art/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'he');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.locator('h1')).toHaveText('אמנות');
    await expect(page.locator('main > p').first()).toContainText('אני כותב שירה');
    await page.goto('/he/art/music/the-jungle-route/');
    await expect(page.locator('main h1')).toHaveCount(1);
    await expect(page.locator('main .achievement-meta')).toContainText('ביולי');
    await expect(page.locator('.item-links')).toContainText('האזנה');
  });

  test('French pages read in French with French dates', async ({ page }) => {
    await page.goto('/fr/art/');
    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
    await expect(page.locator('main > p').first()).toContainText('J’écris de la poésie');
    await page.goto('/fr/art/music/the-jungle-route/');
    await expect(page.locator('main .achievement-meta')).toContainText('juillet');
    await expect(page.locator('.item-links')).toContainText('Écouter');
  });

  test('Chinese pages carry the zh-Hans tag, wide colons and Chinese dates', async ({ page }) => {
    await page.goto('/zh/art/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'zh-Hans');
    await expect(page.locator('.release-links').first()).toContainText('收听：');
    await page.goto('/zh/art/music/the-jungle-route/');
    await expect(page.locator('main .achievement-meta')).toContainText('2026年7月31日');
  });

  test('Japanese pages carry the ja tag', async ({ page }) => {
    await page.goto('/ja/science/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ja');
    await expect(page.locator('main > p').first()).toContainText(/論文\d+本/);
    await page.goto('/ja/art/books/aya-2018/');
    await expect(page.locator('.item-links')).toContainText('読む：');
  });

  test('Spanish dates and Brazilian Portuguese tag', async ({ page }) => {
    await page.goto('/es/art/music/the-jungle-route/');
    await expect(page.locator('main .achievement-meta')).toContainText('31 de julio de 2026');
    await page.goto('/pt/science/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
    await expect(page.locator('main > p').first()).toContainText('pesquisa');
  });

  test('German, Korean and Italian dates', async ({ page }) => {
    await page.goto('/de/art/music/the-jungle-route/');
    await expect(page.locator('main .achievement-meta')).toContainText('31. Juli 2026');
    await page.goto('/ko/art/music/the-jungle-route/');
    await expect(page.locator('main .achievement-meta')).toContainText('2026년 7월 31일');
    expect(await page.evaluate(() => getComputedStyle(document.body).wordBreak)).toBe('keep-all');
    await page.goto('/it/art/music/the-jungle-route/');
    await expect(page.locator('main .achievement-meta')).toContainText('31 luglio 2026');
  });

  test('Arabic reads right to left with Western digits', async ({ page }) => {
    await page.goto('/ar/art/music/the-jungle-route/');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.locator('main .achievement-meta')).toContainText('31 يوليو 2026');
  });

  test('on a right-to-left page each link keeps its own direction', async ({ page }) => {
    for (const lang of ['ar', 'he']) {
      await page.goto(`/${lang}/science/`);
      expect(await page.evaluate(() => getComputedStyle(document.querySelector('.achievement a')).unicodeBidi)).toBe('plaintext');
    }
  });
});

// ─── Search engines: one address per language, all linked ───────────────────

test.describe('indexing', () => {
  test('every version is canonical to itself and names every other', async ({ page, request }) => {
    const i18n = await i18nOf(request);
    test.setTimeout(i18n.languages.length * (SECTIONS.length + WORKS.length) * 1500 + 10000);
    for (const { code, tag } of i18n.languages) {
      for (const path of [...SECTIONS, ...WORKS]) {
        const url = at(i18n, code, path);
        const res = await page.goto(url);
        expect(res.status(), url).toBe(200);
        await expect(page.locator('html'), url).toHaveAttribute('lang', tag || code);
        await expect(page.locator('link[rel="canonical"]'), url).toHaveAttribute('href', new RegExp(url.replace(/[/.]/g, '\\$&') + '$'));
        await expect(page.locator('link[rel="alternate"][hreflang]:not([hreflang="x-default"])'), url).toHaveCount(i18n.languages.length);
        const description = await page.locator('meta[name="description"]').getAttribute('content');
        expect(description.length, url).toBeGreaterThan(20);
      }
    }
  });

  test('the sitemap lists every version of every page', async ({ request }) => {
    const i18n = await i18nOf(request);
    const xml = await (await request.get('/sitemap.xml')).text();
    const locs = xml.match(/<loc>/g).length;
    expect(locs % i18n.languages.length).toBe(0);
    expect(locs).toBeGreaterThanOrEqual(i18n.languages.length * (SECTIONS.length + WORKS.length));
    for (const { code } of i18n.languages) expect(xml).toContain('<loc>https://matyushkin.github.io' + at(i18n, code, 'science/') + '</loc>');
  });
});

// ─── Language choice: offered, remembered, never forced on a first visit ────

test.describe('language choice', () => {
  test.use({ locale: 'ru-RU' });

  test('a Russian browser on an English page is offered Russian, not redirected', async ({ page }) => {
    await page.goto('/science/');
    await expect(page).toHaveURL(/\/science\/$/);
    const offer = page.locator('.lang-offer a');
    await expect(offer).toHaveText('Читать эту страницу по-русски');
    await offer.click();
    await expect(page).toHaveURL(/\/ru\/science\/$/);
  });

  test('a language picked once opens the next page in it', async ({ page }) => {
    await page.goto('/science/');
    await page.click('.lang-menu summary');
    await page.click('.lang-menu a[data-lang="de"]');
    await expect(page).toHaveURL(/\/de\/science\/$/);
    await page.goto('/art/');
    await expect(page).toHaveURL(/\/de\/art\/$/);
    await expect(page.locator('.lang-offer')).toHaveCount(0);
  });

  test('closing the offer keeps the page language', async ({ page }) => {
    await page.goto('/art/');
    await page.click('.lang-offer button');
    await expect(page.locator('.lang-offer')).toHaveCount(0);
    await page.goto('/science/');
    await expect(page).toHaveURL(/\/science\/$/);
    await expect(page.locator('.lang-offer')).toHaveCount(0);
  });

  test('an old ?lang= link lands on its language version', async ({ page }) => {
    await page.goto('/science/index.html?lang=ru');
    await expect(page).toHaveURL(/\/ru\/science\/$/);
    await expect(page.locator('h1')).toHaveText('Наука');
  });
});

// ─── QR codes for profile links ──────────────────────────────────────────────

test.describe('QR codes', () => {
  test('visitors see no QR signs; ?qr=1 turns them on for good, ?qr=0 off', async ({ page }) => {
    await page.goto('/art/');
    await expect(page.locator('a.qr').first()).toBeHidden();
    await page.goto('/art/?qr=1');
    await expect(page.locator('a.qr').first()).toBeVisible();
    await page.goto('/science/');
    await expect(page.locator('a.qr').first()).toBeVisible();
    await page.goto('/science/?qr=0');
    await expect(page.locator('a.qr').first()).toBeHidden();
  });

  test('every profile link has a QR sign that opens its code large', async ({ page, request }) => {
    await page.goto('/ru/art/?qr=1');
    const links = page.locator('#profiles-music .shared');
    expect(await links.count()).toBeGreaterThan(2);
    const sign = page.locator('#profiles-music a.qr').first();
    const target = await sign.getAttribute('data-url');
    expect((await request.get(await sign.getAttribute('href'))).status()).toBe(200);
    await sign.click();
    const dialog = page.locator('dialog.qr-dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('strong')).toHaveText('Spotify');
    const go = dialog.locator('p a');
    await expect(go).toHaveAttribute('href', target);
    await expect(go).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });

  test('a Telegram code carries the t.me address, which phones open in the app', async ({ page, request }) => {
    await page.goto('/?qr=1');
    const sign = page.locator('a.qr[data-url^="https://t.me/"]').first();
    await expect(sign).toHaveCount(1);
    const svg = await (await request.get(await sign.getAttribute('href'))).text();
    expect(svg).toContain('<svg');
  });
});

// ─── Cache: a page never pairs an old script or style with new markup ───────

test.describe('asset fingerprints', () => {
  test('every page loads site.js and style.css by the hash of their content', async ({ page, request }) => {
    const hash = async path => createHash('sha1').update(await (await request.get(path)).body()).digest('hex').slice(0, 10);
    const js = await hash('/source/site.js');
    const css = await hash('/style.css');
    for (const url of ['/', '/ru/art/', '/science/', '/cv/', '/art/music/the-jungle-route/', '/404.html']) {
      await page.goto(url);
      await expect(page.locator(`script[src="/source/site.js?v=${js}"]`)).toHaveCount(1);
      await expect(page.locator(`link[href="/style.css?v=${css}"]`)).toHaveCount(1);
    }
  });
});

// ─── Theme toggle ─────────────────────────────────────────────────────────────

test.describe('theme toggle', () => {
  test('clicking ◑ switches to dark theme and the choice persists', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.setItem('theme', 'light-theme'));
    await page.reload();
    await page.click('.theme-button');
    await expect(page.locator('body')).toHaveClass(/dark-theme/);
    await page.reload();
    await expect(page.locator('body')).toHaveClass(/dark-theme/);
  });
});

// ─── Accessibility (axe-core) ────────────────────────────────────────────────

test.describe('accessibility (WCAG 2.1 AA)', () => {
  for (const url of ['/', '/art/', '/science/', '/technology/', '/he/art/', '/art/music/the-jungle-route/']) {
    test(`no a11y violations: ${url}`, async ({ page }) => {
      await page.goto(url);
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
      expect(results.violations).toEqual([]);
    });
  }
});

// ─── Mobile layout ────────────────────────────────────────────────────────────

test.describe('mobile layout (375px)', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('nav fits and pages render', async ({ page }) => {
    for (const url of ['/', '/science/', '/technology/', '/ru/art/']) {
      await page.goto(url);
      await expect(page.locator('#nav-art')).toBeVisible();
      await expect(page.locator('.lang-menu summary')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth), url).toBeLessThanOrEqual(375);
    }
  });
});
