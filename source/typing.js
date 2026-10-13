// The touch-typing trainer at /typing/ (terms: CONTEXT.md). The page arrives
// with its words in the page language (build_site.py, life repo); this script
// loads a course (typing/<code>.json), writes lines of real words made of the
// open letters, measures every letter and opens the next one when every open
// letter is ready. Progress stays in this browser only.
(function () {
  'use strict';

  var root = document.getElementById('typing');
  if (!root) return;
  var T = JSON.parse(document.getElementById('typing-words').textContent);

  var START = 6;          // letters open at the start of a course
  var ERRORS = 0.05;      // at most this share of errors for a ready letter
  var SAMPLES = 20;       // keystrokes a letter needs before it can be ready
  var KEEP = 30;          // keystrokes remembered per letter
  var AWAY = 3000;        // ms: a longer pause is time away, not typing
  var HINT = 2000;        // ms: a pause this long shows the keyboard
  var LINE = 10;          // words per line

  // A finger for every key of the three letter rows (ANSI layout), 0–7 from
  // the left little finger to the right one.
  var FINGERS = [
    [0, 1, 2, 3, 3, 4, 4, 5, 6, 7],
    [0, 1, 2, 3, 3, 4, 4, 5, 6, 7],
    [0, 1, 2, 3, 3, 4, 4, 5, 6, 7]
  ];

  // The Latin letter printed on each of those keys (US QWERTY), shown small
  // in the key's corner so a learner finds the key on a Latin keyboard.
  var LATIN = ['qwertyuiop', 'asdfghjkl;', 'zxcvbnm,./'];

  var el = {
    line: root.querySelector('.typing-line'),
    letters: root.querySelector('.typing-letters'),
    status: root.querySelector('.typing-status'),
    speed: root.querySelector('.typing-speed'),
    accuracy: root.querySelector('.typing-accuracy'),
    today: root.querySelector('.typing-today'),
    total: root.querySelector('.typing-total'),
    keyboard: root.querySelector('.typing-keyboard'),
    layout: root.querySelector('.typing-layout'),
    target: root.querySelector('.typing-target'),
    reset: root.querySelector('.typing-reset')
  };

  var course, letterOf, state, text, pos, lineStart, last, lastKey, hits, misses, wrongAt;
  var hintTimer, pinned = false, resetArmed = false;

  function save() {
    try { localStorage.setItem('typing:' + course.code, JSON.stringify(state)); } catch (e) { /* private mode */ }
  }

  function load() {
    var s = null;
    try { s = JSON.parse(localStorage.getItem('typing:' + course.code)); } catch (e) { /* none */ }
    if (!s || !s.stats) s = { open: START, target: 35, stats: {}, fresh: null };
    if (!s.time) s.time = { day: '', today: 0, total: 0 };
    course.letters.forEach(function (l) { if (!s.stats[l]) s.stats[l] = { ms: [], err: [] }; });
    return s;
  }

  // ── Measures ─────────────────────────────────────────────────────────────
  function wpm(ms) { return ms ? 12000 / ms : 0; }  // 5 keystrokes a word

  function measure(letter) {
    var s = state.stats[letter];
    var ms = s.ms.length ? s.ms.reduce(function (a, b) { return a + b; }, 0) / s.ms.length : 0;
    var err = s.err.length ? s.err.filter(Boolean).length / s.err.length : 0;
    var speed = wpm(ms);
    var ready = s.err.length >= SAMPLES && speed >= state.target && err <= ERRORS;
    // How close to ready, 0–1: the slower of speed and accuracy decides.
    var score = Math.min(speed / state.target, err ? ERRORS / err : 1, s.err.length / SAMPLES, 1);
    return { speed: speed, err: err, ready: ready, score: score };
  }

  function open() { return course.letters.slice(0, state.open); }

  function weakest() {
    var worst = null, low = 2;
    open().forEach(function (l) {
      var m = measure(l);
      if (!m.ready && m.score < low) { low = m.score; worst = l; }
    });
    return worst;
  }

  // The letter the next line leans on: the new letter until it is ready,
  // otherwise the weakest one.
  function focus() {
    if (state.fresh && !measure(state.fresh).ready) return state.fresh;
    return weakest();
  }

  function advance() {
    if (state.open >= course.letters.length) return;
    if (!open().every(function (l) { return measure(l).ready; })) return;
    state.open += 1;
    state.fresh = course.letters[state.open - 1];
  }

  // ── Text ─────────────────────────────────────────────────────────────────
  function writeLine() {
    var allowed = {};
    open().forEach(function (l) { l.split('').forEach(function (ch) { allowed[ch] = true; }); });
    var words = course.words.filter(function (w) {
      return w.split('').every(function (ch) { return allowed[ch]; });
    });
    var f = focus();
    var leaning = f ? words.filter(function (w) {
      return w.split('').some(function (ch) { return f.indexOf(ch) >= 0; });
    }) : [];
    // Frequent words come first in the list; drawing from a shrinking front
    // (u² skews toward 0) keeps them common without leaving the rest out.
    function pick(list) { var u = Math.random(); return list[Math.floor(u * u * list.length)]; }
    var out = [];
    while (out.length < LINE) {
      var list = leaning.length && Math.random() < 0.5 ? leaning : words;
      var w = pick(list);
      if (w !== out[out.length - 1]) out.push(w);
    }
    text = out.join(' ');
    pos = 0; lineStart = 0; last = 0; hits = 0; misses = 0; wrongAt = -1;
    el.line.textContent = '';
    for (var i = 0; i < text.length; i++) {
      var span = document.createElement('span');
      span.textContent = text[i];
      el.line.appendChild(span);
    }
    mark();
    // A new letter is shown on the keyboard for the whole of its first line.
    pinned = state.shown !== state.fresh;
    state.shown = state.fresh;
    showKeyboard(false);
  }

  function mark() {
    var spans = el.line.children;
    for (var i = 0; i < spans.length; i++) {
      spans[i].className = i < pos ? 'done' : i === pos ? 'next' : '';
    }
  }

  // ── Keyboard ─────────────────────────────────────────────────────────────
  function drawKeyboard() {
    el.keyboard.textContent = '';
    course.rows.forEach(function (row, r) {
      var line = document.createElement('div');
      line.className = 'typing-row';
      row.split('').forEach(function (ch, k) {
        var key = document.createElement('span');
        key.className = 'typing-key finger-' + FINGERS[r][k];
        key.textContent = ch;
        key.dataset.ch = ch;
        var latin = document.createElement('small');
        latin.textContent = LATIN[r][k];
        key.appendChild(latin);
        line.appendChild(key);
      });
      el.keyboard.appendChild(line);
    });
  }

  function showKeyboard(on) {
    el.keyboard.hidden = !(on || pinned);
    var next = text && text[pos];
    Array.prototype.forEach.call(el.keyboard.querySelectorAll('.typing-key'), function (key) {
      key.classList.toggle('next', key.dataset.ch === next);
    });
  }

  function armHint() {
    clearTimeout(hintTimer);
    hintTimer = setTimeout(function () { showKeyboard(true); }, HINT);
  }

  // ── Letters strip and figures ────────────────────────────────────────────
  // Words for the live status: the line's slips and its end. The status of
  // the letters (drawLetters) speaks again only when it changes.
  function say(words) { el.status.textContent = words; }

  function drawLetters() {
    var f = focus();
    el.letters.textContent = '';
    course.letters.forEach(function (l, i) {
      var item = document.createElement('li');
      item.textContent = l;
      // a letter's state for a screen reader: colour and the bar say it to the eye
      var note = i >= state.open ? T.locked : measure(l).ready ? T.ready : '';
      if (note) {
        var hidden = document.createElement('span');
        hidden.className = 'visually-hidden';
        hidden.lang = document.documentElement.lang;
        hidden.textContent = ' (' + note + ')';
        item.appendChild(hidden);
      }
      if (i < state.open) {
        var m = measure(l);
        item.style.setProperty('--score', m.score.toFixed(2));
        item.className = 'open' + (m.ready ? ' ready' : '') +
          (l === state.fresh ? ' fresh' : '') + (l === f ? ' focus' : '');
        item.title = Math.round(m.speed) + ' ' + T.wpm + ' · ' + Math.round((1 - m.err) * 100) + '%';
      }
      el.letters.appendChild(item);
    });
    var parts = [];
    if (state.fresh && !measure(state.fresh).ready) parts.push(T.fresh + T.colon + ' ' + state.fresh);
    var w = weakest();
    if (w && w !== state.fresh) parts.push(T.weakest + T.colon + ' ' + w);
    el.status.textContent = parts.join(' · ');
  }

  // ── Practice time: keystrokes closer than AWAY, today and all along ──────
  function day() {
    var d = new Date();
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  }

  function spend(ms) {
    if (state.time.day !== day()) { state.time.day = day(); state.time.today = 0; }
    state.time.today += ms;
    state.time.total += ms;
  }

  // "12 min", "3 h 20 min" in the page language; Western digits, as on the
  // whole site (Arabic too).
  function duration(ms) {
    var lang = document.documentElement.lang;
    function unit(n, u) {
      return new Intl.NumberFormat(lang, { style: 'unit', unit: u, unitDisplay: 'short', numberingSystem: 'latn' }).format(n);
    }
    var minutes = Math.floor(ms / 60000), hours = Math.floor(minutes / 60);
    return hours ? unit(hours, 'hour') + ' ' + unit(minutes % 60, 'minute') : unit(minutes, 'minute');
  }

  function drawTime() {
    el.today.textContent = duration(state.time.day === day() ? state.time.today : 0);
    el.total.textContent = duration(state.time.total);
  }

  // ── Typing ───────────────────────────────────────────────────────────────
  function record(letter, ms, wrong) {
    var s = state.stats[letter];
    if (ms !== null) { s.ms.push(ms); if (s.ms.length > KEEP) s.ms.shift(); }
    s.err.push(wrong ? 1 : 0); if (s.err.length > KEEP) s.err.shift();
  }

  function onKey(e) {
    if (e.metaKey || e.ctrlKey || e.altKey || e.key.length !== 1) return;
    var t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'BUTTON' || t.tagName === 'SELECT' || t.tagName === 'A')) return;
    e.preventDefault();
    var expected = text[pos];
    var now = performance.now();
    if (e.key !== expected && e.key !== ' ' && !course.keys[e.key]) {
      el.layout.hidden = false;  // a letter of another layout: not an error
      return;
    }
    el.layout.hidden = true;
    if (lastKey && now - lastKey < AWAY) spend(now - lastKey);
    lastKey = now;
    var letter = letterOf[expected];
    if (e.key !== expected) {
      misses += 1;
      // One error per place in the line, however many keys miss it.
      if (letter && wrongAt !== pos) record(letter, null, true);
      wrongAt = pos;
      el.line.children[pos].classList.add('wrong');
      // a screen reader hears the slip, not only a red letter
      say(T.expected.replace('{letter}', expected === ' ' ? '␣' : expected));
      showKeyboard(true);
      armHint();
      return;
    }
    if (pos === 0) lineStart = now;
    var gap = last ? now - last : null;
    if (letter && wrongAt !== pos) record(letter, gap !== null && gap < AWAY ? gap : null, false);
    last = now;
    hits += 1;
    pos += 1;
    if (pos < text.length) {
      mark();
      showKeyboard(false);
      armHint();
      return;
    }
    clearTimeout(hintTimer);
    var minutes = (now - lineStart) / 60000;
    el.speed.textContent = Math.round((text.length / 5) / minutes) + ' ' + T.wpm;
    el.accuracy.textContent = Math.round(100 * hits / (hits + misses)) + '%';
    advance();
    save();
    drawLetters();
    var done = T.lineDone + T.colon + ' ' + el.speed.textContent + ', ' + el.accuracy.textContent;
    say(done + (el.status.textContent ? ' · ' + el.status.textContent : ''));
    drawTime();
    writeLine();
  }

  // ── Settings ─────────────────────────────────────────────────────────────
  el.target.addEventListener('change', function () {
    var v = Math.round(Number(el.target.value));
    if (!(v >= 10 && v <= 150)) { el.target.value = state.target; return; }
    state.target = v;
    save();
    drawLetters();
  });

  el.reset.addEventListener('click', function () {
    if (!resetArmed) {  // two clicks, so one stray click loses nothing
      resetArmed = true;
      el.reset.textContent = T.resetAgain;
      setTimeout(function () { resetArmed = false; el.reset.textContent = T.reset; }, 4000);
      return;
    }
    resetArmed = false;
    el.reset.textContent = T.reset;
    try { localStorage.removeItem('typing:' + course.code); } catch (e) { /* none */ }
    var time = state.time;  // the letters start over; the time spent stays spent
    state = load();
    state.time = time;
    save();
    el.target.value = state.target;
    el.speed.textContent = el.accuracy.textContent = '—';
    drawLetters();
    writeLine();
  });

  // ── The ⓘ note: shut by a click elsewhere or Esc, like a note in a poem ──
  var about = document.querySelector('.typing-about');
  if (about) {
    document.addEventListener('click', function (e) { if (!about.contains(e.target)) about.open = false; });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') about.open = false; });
  }

  // ── Start ────────────────────────────────────────────────────────────────
  fetch('/typing/' + root.dataset.course + '.json')
    .then(function (r) { return r.json(); })
    .then(function (c) {
      course = c;
      letterOf = {};
      course.keys = {};
      course.rows.join('').split('').forEach(function (ch) { course.keys[ch] = true; });
      course.letters.forEach(function (l) { l.split('').forEach(function (ch) { letterOf[ch] = l; }); });
      state = load();
      el.line.dir = course.dir;
      el.line.lang = course.code;
      el.letters.dir = course.dir;
      el.letters.lang = course.code;
      el.target.value = state.target;
      drawKeyboard();
      drawLetters();
      drawTime();
      writeLine();
      root.classList.add('ready');
      document.addEventListener('keydown', onKey);
      // the line takes the focus: a screen reader then passes the keys on
      // (role=application) instead of reading them as its own commands
      el.line.focus();
      // A line left half typed still counts its time.
      window.addEventListener('pagehide', save);
    })
    .catch(function () { el.status.textContent = T.failed; });
}());
