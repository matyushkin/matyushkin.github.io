// Shared language + theme handler for index.html and simple pages
(function () {
  function getLang() {
    var urlLang = new URLSearchParams(window.location.search).get('lang');
    if (urlLang) { localStorage.setItem('lang', urlLang); return urlLang; }
    var stored = localStorage.getItem('lang');
    if (stored) return stored;
    return (navigator.language || '').slice(0, 2).toLowerCase() === 'ru' ? 'ru' : 'en';
  }

  var NAV_I18N = {
    ru: { art: 'Искусство', science: 'Наука', technology: 'Технологии' },
    en: { art: 'Art',       science: 'Science', technology: 'Technology' }
  };

  function applyLang(lang) {
    var labels = NAV_I18N[lang] || NAV_I18N.en;
    var navArt  = document.getElementById('nav-art');
    var navSci  = document.getElementById('nav-science');
    var navTech = document.getElementById('nav-technology');
    if (navArt)  navArt.textContent  = labels.art;
    if (navSci)  navSci.textContent  = labels.science;
    if (navTech) navTech.textContent = labels.technology;

    // Show/hide bilingual paragraphs
    // Note: style.css has p:lang(en){display:none} so we must set 'block' explicitly
    document.querySelectorAll('p[lang]').forEach(function(el) {
      el.style.display = el.lang === lang ? 'block' : 'none';
    });

    var sel = document.getElementById('lang-select');
    if (sel) sel.value = lang;
  }

  document.addEventListener('DOMContentLoaded', function () {
    // Theme
    var body = document.body;
    var saved = localStorage.getItem('theme');
    if (saved) body.className = saved;
    var btn = document.querySelector('.theme-button');
    if (btn) btn.onclick = function() {
      var dark = body.classList.contains('dark-theme');
      body.classList.toggle('light-theme', dark);
      body.classList.toggle('dark-theme', !dark);
      localStorage.setItem('theme', body.className);
    };

    var lang = getLang();
    applyLang(lang);

    var sel = document.getElementById('lang-select');
    if (sel) {
      sel.addEventListener('change', function () {
        var l = this.value;
        localStorage.setItem('lang', l);
        var url = new URL(window.location);
        url.searchParams.set('lang', l);
        history.replaceState(null, '', url);
        applyLang(l);
      });
    }
  });
})();
