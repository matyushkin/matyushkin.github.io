// What a finished page still needs a browser for. Every page arrives already
// written in its own language by build_site.py (life repo); this script only
//
//   * switches the theme and remembers the choice;
//   * remembers a language picked in the menu, so the next page opens in it
//     (the early script in <head> follows that choice);
//   * offers the reader's own language when they land on another one — an
//     offer, not a redirect, so a search engine still sees every version.
(function () {
  'use strict';

  var script = document.currentScript;
  var body = document.body;

  function store(key, value) {
    try { if (value === undefined) return localStorage.getItem(key); localStorage.setItem(key, value); }
    catch (e) { return null; }
  }

  // ── Theme: the visitor's choice, otherwise the device setting ─────────────
  function themeColor(dark) {
    var m = document.querySelector('meta[name="theme-color"]');
    if (m) m.content = dark ? '#1a1a1a' : '#ffffff';
  }

  var button = document.querySelector('.theme-button');
  if (button) button.onclick = function () {
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

  // ── Language menu ─────────────────────────────────────────────────────────
  var menu = document.querySelector('.lang-menu');
  if (menu) {
    menu.addEventListener('click', function (e) {
      var link = e.target.closest('a[data-lang]');
      if (link) store('lang', link.getAttribute('data-lang'));
    });
    document.addEventListener('click', function (e) {
      if (menu.open && !menu.contains(e.target)) menu.open = false;
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.open) { menu.open = false; menu.querySelector('summary').focus(); }
    });
  }

  // ── Offer the reader's own language ───────────────────────────────────────
  var here = document.documentElement.getAttribute('data-lang');
  var alternates;
  try { alternates = JSON.parse(document.getElementById('lang-alternates').textContent); } catch (e) { return; }
  if (store('lang')) return; // a choice was made; the head script already followed it

  var wanted = (navigator.languages || [navigator.language || '']).map(function (l) {
    return String(l).slice(0, 2).toLowerCase();
  }).filter(function (code) { return alternates[code]; })[0];
  if (!wanted || wanted === here) return;

  var other = alternates[wanted];
  var bar = document.createElement('div');
  bar.className = 'lang-offer';
  var link = document.createElement('a');
  link.href = other.url + location.hash;
  link.lang = other.tag;
  link.dir = other.dir;
  link.textContent = other.offer;
  link.addEventListener('click', function () { store('lang', wanted); });
  var close = document.createElement('button');
  close.type = 'button';
  close.textContent = '×';
  close.setAttribute('aria-label', (script && script.getAttribute('data-close')) || 'Close');
  close.addEventListener('click', function () { store('lang', here); bar.remove(); });
  bar.appendChild(link);
  bar.appendChild(close);
  body.insertBefore(bar, body.firstChild);
})();
