(function () {
  const UI = {
    ru: {
      back: 'Назад к AI Cookbook',
      aliases: 'Также',
      bestFor: 'Когда брать',
      watch: 'Риски и оговорки',
      history: 'История и контекст',
      architecture: 'Архитектура',
      quickstart: 'Первые шаги',
      failureModes: 'Типичные провалы',
      sources: 'Источники',
      freshness: 'Проверено',
      sourceStatus: 'Источник',
      official: 'официальный',
      watchlist: 'watchlist',
      movingFast: 'быстро меняется',
      stable: 'стабильно',
      deprecated: 'устарело',
      nav: { art: 'Искусство', science: 'Наука', technology: 'Технологии' },
      footer: 'Почта — <a href="mailto:leva.matyushkin@gmail.com">leva.matyushkin@gmail.com</a>'
    },
    en: {
      back: 'Back to AI Cookbook',
      aliases: 'Also',
      bestFor: 'Best for',
      watch: 'Risks and caveats',
      history: 'History and context',
      architecture: 'Architecture',
      quickstart: 'First steps',
      failureModes: 'Common failure modes',
      sources: 'Sources',
      freshness: 'Verified',
      sourceStatus: 'Source',
      official: 'official',
      watchlist: 'watchlist',
      movingFast: 'moving fast',
      stable: 'stable',
      deprecated: 'deprecated',
      nav: { art: 'Art', science: 'Science', technology: 'Technology' },
      footer: 'Email — <a href="mailto:leva.matyushkin@gmail.com">leva.matyushkin@gmail.com</a>'
    }
  };

  function getLang() {
    const urlLang = new URLSearchParams(window.location.search).get('lang');
    if (urlLang) { localStorage.setItem('lang', urlLang); return urlLang; }
    const stored = localStorage.getItem('lang');
    if (stored) return stored;
    return (navigator.language || '').slice(0, 2).toLowerCase() === 'ru' ? 'ru' : 'en';
  }

  function text(value, lang) {
    if (!value) return '';
    if (typeof value === 'string') return value;
    return value[lang] || value.en || value.ru || '';
  }

  function el(tag, className, content) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (content !== undefined) node.textContent = content;
    return node;
  }

  function statusLabel(status, ui) {
    const key = (status || '').replace(/-([a-z])/g, (_, char) => char.toUpperCase());
    return ui[key] || status || '';
  }

  function setNav(ui) {
    const navArt = document.getElementById('nav-art');
    const navSci = document.getElementById('nav-science');
    const navTech = document.getElementById('nav-technology');
    if (navArt) { navArt.textContent = ui.nav.art; navArt.removeAttribute('aria-current'); }
    if (navSci) { navSci.textContent = ui.nav.science; navSci.removeAttribute('aria-current'); }
    if (navTech) { navTech.textContent = ui.nav.technology; navTech.setAttribute('aria-current', 'page'); }
  }

  function listSection(title, values) {
    const section = el('section', 'tool-section');
    section.appendChild(el('h2', '', title));
    const list = el('ul', '');
    values.forEach(value => list.appendChild(el('li', '', value)));
    section.appendChild(list);
    return section;
  }

  function render(entry, lang) {
    const ui = UI[lang] || UI.en;
    document.documentElement.lang = lang;
    document.title = `${entry.title} — AI Cookbook — Leo Matyushkin`;
    document.querySelector('meta[name="description"]').content = text(entry.summary, lang);
    setNav(ui);
    document.getElementById('footer-text').innerHTML = ui.footer;
    document.getElementById('back-link').textContent = ui.back;

    document.getElementById('tool-title').textContent = entry.title;
    document.getElementById('tool-summary').textContent = text(entry.summary, lang);

    const meta = document.getElementById('tool-meta');
    meta.replaceChildren();
    meta.appendChild(el('span', '', entry.modes.join(' · ')));
    meta.appendChild(el('span', '', `${ui.sourceStatus}: ${ui[entry.sourceStatus] || entry.sourceStatus}`));
    if (entry.freshness) {
      meta.appendChild(el('span', '', `${ui.freshness}: ${entry.freshness.verifiedAt} · ${statusLabel(entry.freshness.status, ui)}`));
    }

    const aliases = document.getElementById('tool-aliases');
    aliases.replaceChildren();
    aliases.append(el('strong', '', `${ui.aliases}: `), document.createTextNode((entry.aliases || []).join(', ')));

    const body = document.getElementById('tool-body');
    body.replaceChildren();
    body.append(
      listSection(ui.bestFor, entry.bestFor?.[lang] || []),
      listSection(ui.watch, entry.watch?.[lang] || []),
      listSection(ui.history, entry.details?.history?.[lang] || []),
      listSection(ui.architecture, entry.details?.architecture?.[lang] || []),
      listSection(ui.quickstart, entry.details?.quickstart?.[lang] || []),
      listSection(ui.failureModes, entry.details?.failureModes?.[lang] || [])
    );

    const links = document.getElementById('tool-sources');
    links.replaceChildren();
    links.appendChild(el('strong', '', `${ui.sources}: `));
    entry.links.forEach((link, index) => {
      if (index > 0) links.appendChild(document.createTextNode(' · '));
      const anchor = document.createElement('a');
      anchor.href = link.url;
      anchor.textContent = link.label;
      links.appendChild(anchor);
    });
  }

  function applyTheme() {
    const body = document.body;
    const saved = localStorage.getItem('theme');
    if (saved) body.className = saved;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = body.classList.contains('dark-theme') ? '#1a1a1a' : '#ffffff';
    const btn = document.querySelector('.theme-button');
    if (btn) btn.onclick = function() {
      const dark = body.classList.contains('dark-theme');
      body.classList.toggle('light-theme', dark);
      body.classList.toggle('dark-theme', !dark);
      localStorage.setItem('theme', body.className);
      if (meta) meta.content = !dark ? '#1a1a1a' : '#ffffff';
    };
  }

  fetch('../../data.json')
    .then(response => response.json())
    .then(data => {
      const id = document.body.dataset.toolId;
      const entry = data.entries.find(item => item.id === id);
      if (!entry) throw new Error(`Unknown AI Cookbook tool: ${id}`);
      const lang = getLang();
      const select = document.getElementById('lang-select');
      select.value = lang;
      render(entry, lang);
      select.addEventListener('change', () => {
        const nextLang = select.value;
        localStorage.setItem('lang', nextLang);
        const url = new URL(window.location);
        url.searchParams.set('lang', nextLang);
        history.replaceState(null, '', url);
        render(entry, nextLang);
      });
    });

  applyTheme();
})();
