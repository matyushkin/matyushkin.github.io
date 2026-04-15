// Shared language nav handler for all pages
(function () {
  var NAV_I18N = {
    ru: { texts: 'Тексты', achievements: 'Достижения', links: 'Ссылки' },
    en: { texts: 'Texts',  achievements: 'Achievements', links: 'Links'  }
  };

  function getLang() {
    var urlLang = new URLSearchParams(window.location.search).get('lang');
    if (urlLang) { localStorage.setItem('lang', urlLang); return urlLang; }
    var stored = localStorage.getItem('lang');
    if (stored) return stored;
    return (navigator.language || '').slice(0, 2).toLowerCase() === 'ru' ? 'ru' : 'en';
  }

  function applyLang(lang) {
    var ui = NAV_I18N[lang] || NAV_I18N.en;
    var navTexts = document.getElementById('nav-texts');
    var navAch   = document.getElementById('nav-achievements');
    var navLinks = document.getElementById('nav-links');
    if (navTexts) navTexts.textContent = ui.texts;
    if (navAch)   {
      navAch.textContent = ui.achievements;
      if (navAch.dataset.base) navAch.href = navAch.dataset.base + '?lang=' + lang;
    }
    if (navLinks) navLinks.textContent = ui.links;

    // Show/hide bilingual paragraphs (index.html pattern)
    // Note: style.css has p:lang(en){display:none} so we must set 'block' explicitly, not ''
    document.querySelectorAll('p[lang]').forEach(function(el) {
      el.style.display = el.lang === lang ? 'block' : 'none';
    });

    var sel = document.getElementById('lang-select');
    if (sel) sel.value = lang;
  }

  document.addEventListener('DOMContentLoaded', function () {
    // Store original href before any modification
    var navAch = document.getElementById('nav-achievements');
    if (navAch && !navAch.dataset.base) navAch.dataset.base = navAch.getAttribute('href');

    var lang = getLang();
    applyLang(lang);

    var sel = document.getElementById('lang-select');
    if (sel) {
      sel.addEventListener('change', function () {
        var lang = this.value;
        localStorage.setItem('lang', lang);
        var url = new URL(window.location);
        url.searchParams.set('lang', lang);
        history.replaceState(null, '', url);
        applyLang(lang);
      });
    }
  });
})();
