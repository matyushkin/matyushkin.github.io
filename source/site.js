// The site's language and theme engine, shared by every page.
//
// Every word of the interface lives in source/i18n.json. This script picks the
// visitor's language, fills the page from that file, builds the language
// selector, and tells the page when the language changes. A page never holds
// translations of its own.
//
//   <p data-i18n="home.social"></p>          text from strings[lang].home.social
//   <p data-i18n-html="home.bio"></p>        the same, as markup
//   <title data-i18n-title="art.pageTitle">  "<title> — Leo Matyushkin"
//
//   Site.ready.then(() => …)                 after the first fill
//   Site.onChange(lang => …)                 on every switch
//   Site.section('art')                      a page's strings, English under them
//   Site.profileLabel('art', 'soundcloud')   a profile name in the current language
//   Site.lang (the code in ?lang=), Site.tag (<html lang>), Site.locale, Site.dir
(function () {
  'use strict';

  var script = document.currentScript;
  var root = script ? script.src.replace(/source\/site\.js.*$/, '') : '/';
  var AUTHOR = 'Leo Matyushkin';
  var listeners = [];
  var data = null;

  function store(key, value) {
    try { if (value === undefined) return localStorage.getItem(key); localStorage.setItem(key, value); }
    catch (e) { return null; }
  }

  function codes() { return data.languages.map(function (l) { return l.code; }); }
  function info(code) { return data.languages.filter(function (l) { return l.code === code; })[0]; }

  function pickLang() {
    var all = codes();
    var fromUrl = new URLSearchParams(location.search).get('lang');
    if (all.indexOf(fromUrl) >= 0) { store('lang', fromUrl); return fromUrl; }
    var saved = store('lang');
    if (all.indexOf(saved) >= 0) return saved;
    var browser = (navigator.language || '').slice(0, 2).toLowerCase();
    return all.indexOf(browser) >= 0 ? browser : data.fallback;
  }

  function dig(obj, path) {
    return path.split('.').reduce(function (o, k) { return o == null ? undefined : o[k]; }, obj);
  }

  // A key missing in one language falls back to English, then to the default.
  function t(path, lang) {
    lang = lang || Site.lang;
    var order = [lang, data.fallback, data.default];
    for (var i = 0; i < order.length; i++) {
      var v = dig(data.strings[order[i]], path);
      if (v !== undefined) return v;
    }
    return '';
  }

  function merge(base, over) {
    if (Array.isArray(over) || typeof over !== 'object' || over === null) return over === undefined ? base : over;
    var out = {};
    Object.keys(base || {}).forEach(function (k) { out[k] = base[k]; });
    Object.keys(over).forEach(function (k) {
      out[k] = (base && typeof base[k] === 'object' && !Array.isArray(base[k])) ? merge(base[k], over[k]) : over[k];
    });
    return out;
  }

  function section(name) {
    var s = data.strings;
    return merge(merge(s[data.default][name] || {}, s[data.fallback][name] || {}), s[Site.lang][name] || {});
  }

  function profileLabel(page, id) {
    var own = dig(data.strings[Site.lang], page + '.profiles.' + id);
    return own !== undefined ? own : (data.names[id] || id);
  }

  function markCurrentPage() {
    var path = location.pathname;
    var map = { 'nav-art': '/art/', 'nav-science': '/science/', 'nav-technology': '/technology/' };
    Object.keys(map).forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      if (path.indexOf(map[id]) !== -1) el.setAttribute('aria-current', 'page');
      else el.removeAttribute('aria-current');
    });
  }

  function buildSelector() {
    var sel = document.getElementById('lang-select');
    if (!sel) return;
    sel.innerHTML = data.languages.map(function (l) {
      return '<option value="' + l.code + '" lang="' + l.code + '">' + l.label + '</option>';
    }).join('');
    sel.value = Site.lang;
    sel.addEventListener('change', function () { setLang(sel.value); });
  }

  function fill() {
    var lang = Site.lang;
    var html = document.documentElement;
    html.lang = Site.tag;
    html.dir = Site.dir;

    var nav = t('common.nav');
    ['art', 'science', 'technology'].forEach(function (k) {
      var el = document.getElementById('nav-' + k);
      if (el) el.textContent = nav[k];
    });
    var logo = document.querySelector('nav .logo img');
    if (logo) logo.alt = t('common.home');
    var skip = document.querySelector('.skip-link');
    if (skip) skip.textContent = t('common.skip');
    var sel = document.getElementById('lang-select');
    if (sel) { sel.setAttribute('aria-label', t('common.language')); sel.value = lang; }
    var theme = document.querySelector('.theme-button');
    if (theme) { theme.setAttribute('aria-label', t('common.theme')); theme.title = t('common.theme'); }

    var footer = document.getElementById('footer-text');
    if (footer) {
      footer.innerHTML = t('common.email') + ' — <a href="mailto:leva.matyushkin@gmail.com">leva.matyushkin@gmail.com</a>'
        + ' · <a href="/feed.xml">' + t('common.feed') + '</a>';
    }

    document.querySelectorAll('[data-i18n]').forEach(function (el) { el.textContent = t(el.getAttribute('data-i18n')); });
    document.querySelectorAll('[data-i18n-html]').forEach(function (el) { el.innerHTML = t(el.getAttribute('data-i18n-html')); });
    var title = document.querySelector('title[data-i18n-title]');
    if (title) document.title = t(title.getAttribute('data-i18n-title')) + ' — ' + AUTHOR;

    // Blocks written once per language (the work pages) carry data-lang. The
    // early head snippet hid the other languages; keep that rule current, and
    // lift the veil it put over not-yet-translated text.
    var style = document.getElementById('lang-style');
    if (!style) {
      style = document.createElement('style');
      style.id = 'lang-style';
      document.head.appendChild(style);
    }
    style.textContent = '[data-lang]:not([data-lang="' + lang + '"]){display:none!important}';
  }

  function setLang(lang) {
    if (codes().indexOf(lang) < 0) return;
    store('lang', lang);
    var url = new URL(location.href);
    url.searchParams.set('lang', lang);
    history.replaceState(null, '', url);
    apply(lang);
    listeners.forEach(function (fn) { fn(lang); });
  }

  function apply(lang) {
    var l = info(lang);
    Site.lang = lang;
    Site.tag = l.tag || l.code;
    Site.locale = l.locale;
    Site.dir = l.dir;
    fill();
  }

  // ── Theme: the visitor's choice, otherwise the device setting ─────────────
  function themeColor(dark) {
    var m = document.querySelector('meta[name="theme-color"]');
    if (m) m.content = dark ? '#1a1a1a' : '#ffffff';
  }

  function wireTheme() {
    var body = document.body;
    var btn = document.querySelector('.theme-button');
    if (btn) btn.onclick = function () {
      var dark = body.classList.contains('dark-theme');
      body.classList.toggle('light-theme', dark);
      body.classList.toggle('dark-theme', !dark);
      store('theme', dark ? 'light-theme' : 'dark-theme');
      themeColor(!dark);
    };
    if (window.matchMedia) {
      matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
        var chosen = store('theme');
        if (chosen === 'dark-theme' || chosen === 'light-theme') return;
        body.classList.toggle('dark-theme', e.matches);
        body.classList.toggle('light-theme', !e.matches);
        themeColor(e.matches);
      });
    }
  }

  var Site = window.Site = {
    lang: document.documentElement.lang || 'ru',
    locale: undefined,
    dir: document.documentElement.dir || 'ltr',
    root: root,
    t: t,
    section: section,
    profileLabel: profileLabel,
    onChange: function (fn) { listeners.push(fn); },
    languages: function () { return data ? data.languages : []; }
  };

  Site.ready = fetch(root + 'source/i18n.json', { cache: 'no-cache' })
    .then(function (r) { return r.json(); })
    .then(function (json) {
      data = json;
      var start = function () {
        markCurrentPage();
        buildSelector();
        wireTheme();
        apply(pickLang());
      };
      if (document.readyState === 'loading') {
        return new Promise(function (res) { document.addEventListener('DOMContentLoaded', function () { start(); res(Site); }); });
      }
      start();
      return Site;
    })
    .catch(function (err) {
      // Without the translations the page keeps its default-language text;
      // make sure the early snippet's veil does not hide it.
      var style = document.getElementById('lang-style');
      if (style) style.textContent = '';
      document.documentElement.lang = 'ru';
      document.documentElement.dir = 'ltr';
      if (window.console) console.error('site.js: translations did not load', err);
      throw err;
    });
})();
