/* Retro Education Suite language layer.
   Translates on-screen text from per-language data files (shared/i18n/<code>/<part>.js).
   English is the source text in the pages, so English mode does nothing at all.
   To add a language: add it to AVAILABLE below and add a folder of data files. */
(function () {
  'use strict';
  if (window.RSLang) return;

  var KEY = 'retroSuite.lang';
  var AVAILABLE = [['en', 'English', 'EN'], ['zh', '中文', '中'], ['ru', 'Русский', 'RU']];
  var HTML_LANG = { en: 'en', zh: 'zh-CN', ru: 'ru' };
  var ATTRS = ['placeholder', 'title', 'aria-label', 'alt', 'label'];

  var script = document.currentScript;
  var parts = ((script && script.getAttribute('data-parts')) || 'common').split(',');
  var base = (script && script.src) ? script.src.replace(/[^\/]*$/, '') : 'shared/';

  function has(code) { for (var i = 0; i < AVAILABLE.length; i++) if (AVAILABLE[i][0] === code) return true; return false; }
  function stored() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function debugOn() { try { return localStorage.getItem('retroSuite.langDebug') === '1'; } catch (e) { return false; } }

  var lang = stored();
  if (!lang) {
    /* first run: follow the browser language when we have a table for it */
    var nav = ((navigator.languages && navigator.languages[0]) || navigator.language || 'en').toLowerCase().slice(0, 2);
    lang = has(nav) ? nav : 'en';
  }
  if (!has(lang)) lang = 'en';

  var dict = {};      // code -> { lowercase key: translation }
  var pats = {};      // code -> [[RegExp, string | function(m, t)]]
  var punct = {};     // code -> { suffix: replacement }
  var cache = {};     // code -> { text: translation }
  var loadedParts = {};
  var missing = {};
  var observer = null;
  var burstStart = 0, burstCount = 0, tripped = false;
  var origText = new WeakMap();
  var origAttr = new WeakMap();

  function norm(s) { return s.replace(/\s+/g, ' ').trim(); }

  function add(code, entries, patterns, options) {
    var d = dict[code] || (dict[code] = {});
    for (var k in entries) {
      if (Object.prototype.hasOwnProperty.call(entries, k)) d[norm(k).toLowerCase()] = entries[k];
    }
    if (patterns) (pats[code] || (pats[code] = [])).push.apply(pats[code], patterns);
    if (options && options.punct) punct[code] = Object.assign(punct[code] || {}, options.punct);
    cache[code] = {};
  }

  /* plural form for a number: forms is {one,few,many,other,...}, chosen by the language's own rules */
  function pl(n, forms) {
    var c = 'other';
    try { c = new Intl.PluralRules(HTML_LANG[lang] || lang).select(n); } catch (e) {}
    return forms[c] != null ? forms[c] : forms.other;
  }
  var searchD = {};
  function addSearch(code, data) { searchD[code] = data; }

  function plain(code, s) {
    var d = dict[code];
    if (!d) return null;
    var k = s.toLowerCase();
    return Object.prototype.hasOwnProperty.call(d, k) ? d[k] : null;
  }

  function viaPatterns(code, s) {
    var list = pats[code];
    if (!list) return null;
    var t = function (x) { var r = lookup(code, norm(x)); return r == null ? x : r; };
    for (var i = 0; i < list.length; i++) {
      var m = list[i][0].exec(s);
      if (!m) continue;
      var out = list[i][1];
      return typeof out === 'function' ? out(m, t) : s.replace(list[i][0], out);
    }
    return null;
  }

  function lookup(code, s) {
    var r = plain(code, s);
    return r == null ? viaPatterns(code, s) : r;
  }

  function tr(str) {
    if (lang === 'en' || !str) return str;
    var c = cache[lang] || (cache[lang] = {});
    if (Object.prototype.hasOwnProperty.call(c, str)) return c[str];
    var out = translate(lang, str);
    if (Object.keys(c).length > 4000) c = cache[lang] = {};
    c[str] = out;
    return out;
  }

  function translate(code, str) {
    if (!/[A-Za-z]/.test(str)) return str;
    var m = /^(\s*)([\s\S]*?)(\s*)$/.exec(str);
    var n = norm(m[2]);
    if (!n) return str;
    var r = lookup(code, n);
    if (r == null) {
      var p = punct[code] || {};
      var lead = /^([^\p{L}\p{N}]*)([\s\S]*)$/u.exec(n);
      if (lead[1] && lead[2]) {
        var a = lookup(code, lead[2]);
        if (a != null) r = lead[1] + a;
      }
      if (r == null) {
        var mm = /^([^\p{L}\p{N}]*)([\s\S]*?)([^\p{L}\p{N}]*)$/u.exec(n);
        if (mm && mm[2] && (mm[1] || mm[3])) {
          var inner = lookup(code, mm[2]);
          if (inner != null) r = mm[1] + inner + (Object.prototype.hasOwnProperty.call(p, mm[3]) ? p[mm[3]] : mm[3]);
        }
      }
    }
    return r == null ? str : m[1] + r + m[3];
  }

  /* ---- DOM walk ---- */
  function skipped(el) {
    return !el || (el.closest && el.closest('script,style,noscript,textarea,[data-i18n="off"]'));
  }

  function procText(node) {
    var cur = node.nodeValue;
    if (!cur) return;
    var rec = origText.get(node);
    var mine = rec && rec.t === cur;
    var base0 = mine ? rec.o : cur;
    if (lang === 'en') {
      if (mine) { node.nodeValue = rec.o; origText.delete(node); }
      return;
    }
    if (!mine && !/[A-Za-z]/.test(cur)) { if (rec) origText.delete(node); return; }
    if (skipped(node.parentNode)) return;
    var t = tr(base0);
    if (t !== base0) {
      if (t !== cur) node.nodeValue = t;
      origText.set(node, { o: base0, t: t });
    } else {
      if (mine) { node.nodeValue = base0; origText.delete(node); }
      if (debugOn() && /[A-Za-z]{2}/.test(base0)) missing[norm(base0)] = 1;
    }
  }

  function procAttrs(el) {
    if (!el.getAttribute) return;
    for (var i = 0; i < ATTRS.length; i++) procAttr(el, ATTRS[i]);
    if (el.tagName === 'INPUT' && /^(button|submit|reset)$/i.test(el.type)) procAttr(el, 'value');
  }

  function procAttr(el, name) {
    var cur = el.getAttribute(name);
    if (cur == null || cur === '') return;
    var rec = origAttr.get(el) || {};
    var r = rec[name];
    var mine = r && r.t === cur;
    var b = mine ? r.o : cur;
    if (lang === 'en') {
      if (mine) { el.setAttribute(name, r.o); delete rec[name]; }
      return;
    }
    if (skipped(el)) return;
    var t = tr(b);
    if (t !== b) {
      if (t !== cur) el.setAttribute(name, t);
      rec[name] = { o: b, t: t };
      origAttr.set(el, rec);
    } else if (mine) {
      el.setAttribute(name, b);
      delete rec[name];
    } else if (debugOn() && /[A-Za-z]{2}/.test(b)) missing['@' + name + ':' + norm(b)] = 1;
  }

  function walk(root) {
    if (!root) return;
    if (root.nodeType === 3) { procText(root); return; }
    if (root.nodeType !== 1 && root.nodeType !== 9 && root.nodeType !== 11) return;
    if (root.nodeType === 1) procAttrs(root);
    var w = document.createTreeWalker(root, 1 | 4);
    var n;
    while ((n = w.nextNode())) {
      if (n.nodeType === 3) procText(n); else procAttrs(n);
    }
  }

  function observe() {
    if (observer || !window.MutationObserver) return;
    observer = new MutationObserver(function (list) {
      /* safety net: if the page and this layer fight over the same text, stop instead of freezing */
      var now = Date.now();
      if (now - burstStart > 500) { burstStart = now; burstCount = 0; }
      burstCount += 1;
      if (burstCount > 300) {
        tripped = true;
        try { console.warn('RSLang: mutation storm, translation of new changes stopped'); } catch (e) {}
        unobserve();
        return;
      }
      for (var i = 0; i < list.length; i++) {
        var m = list[i];
        if (m.type === 'characterData') procText(m.target);
        else if (m.type === 'attributes') procAttr(m.target, m.attributeName);
        else for (var j = 0; j < m.addedNodes.length; j++) walk(m.addedNodes[j]);
      }
    });
    observer.observe(document.documentElement, {
      childList: true, subtree: true, characterData: true,
      attributes: true, attributeFilter: ATTRS.concat(['value'])
    });
  }

  function unobserve() { if (observer) { observer.disconnect(); observer = null; } }

  /* ---- alert, confirm, prompt and canvas text ---- */
  ['alert', 'confirm', 'prompt'].forEach(function (name) {
    var orig = window[name];
    if (typeof orig !== 'function') return;
    window[name] = function (msg) {
      var a = Array.prototype.slice.call(arguments);
      if (lang !== 'en' && typeof msg === 'string') a[0] = tr(msg);
      return orig.apply(window, a);
    };
  });
  (function () {
    var P = window.CanvasRenderingContext2D && CanvasRenderingContext2D.prototype;
    if (!P) return;
    ['fillText', 'strokeText', 'measureText'].forEach(function (fn) {
      var orig = P[fn];
      if (!orig) return;
      P[fn] = function (text) {
        if (lang !== 'en' && typeof text === 'string') arguments[0] = tr(text);
        return orig.apply(this, arguments);
      };
    });
  })();

  /* ---- loading data files ---- */
  function loadParts(code, done) {
    if (code === 'en') { done(); return; }
    var need = parts.filter(function (p) { return !loadedParts[code + '/' + p]; });
    if (!need.length) { done(); return; }
    var left = need.length;
    need.forEach(function (p) {
      var s = document.createElement('script');
      s.async = false;
      s.src = base + 'i18n/' + code + '/' + p + '.js';
      var fin = function () { loadedParts[code + '/' + p] = true; if (--left === 0) done(); };
      s.onload = fin;
      s.onerror = fin;
      document.head.appendChild(s);
    });
  }

  var styleEl = null;
  function setStyle(code) {
    if (code === 'en') { if (styleEl) { styleEl.remove(); styleEl = null; } return; }
    if (styleEl) return;
    styleEl = document.createElement('style');
    styleEl.setAttribute('data-i18n', 'off');
    styleEl.textContent =
      'html[lang^="zh"]{--o-mono:"Share Tech Mono","Microsoft YaHei","PingFang SC","Noto Sans CJK SC",monospace!important;' +
      '--o-display:"Orbitron","Microsoft YaHei","PingFang SC","Noto Sans CJK SC",sans-serif!important}' +
      'html[lang^="zh"] *{letter-spacing:.02em!important}';
    document.head.appendChild(styleEl);
  }

  /* ---- apply / set ---- */
  function applyDoc(code) {
    lang = code;
    document.documentElement.setAttribute('lang', HTML_LANG[code] || code);
    setStyle(code);
    if (code === 'en') { walk(document.documentElement); unobserve(); }
    else { walk(document.documentElement); observe(); }
    try { document.title = code === 'en' ? (document.documentElement.getAttribute('data-title-en') || document.title) : document.title; } catch (e) {}
    updateSwitches();
    try { window.dispatchEvent(new CustomEvent('rslangchange', { detail: { lang: code } })); } catch (e) {}
    kids(code);
  }

  function kids(code) {
    var frames = document.getElementsByTagName('iframe');
    for (var i = 0; i < frames.length; i++) {
      try {
        var w = frames[i].contentWindow;
        if (w && w.RSLang && w.RSLang.current !== code) w.RSLang.apply(code);
      } catch (e) {}
    }
  }

  function apply(code) {
    if (!has(code)) code = 'en';
    loadParts(code, function () { applyDoc(code); });
  }

  function set(code) {
    if (!has(code)) return;
    try { localStorage.setItem(KEY, code); } catch (e) {}
    apply(code);
    try {
      if (window.parent && window.parent !== window && window.parent.RSLang && window.parent.RSLang.current !== code) window.parent.RSLang.apply(code);
    } catch (e) {}
  }

  /* ---- switch control ----
     Two languages: a segmented button. Three or more: a compact menu button.
     On narrow screens the segmented button shows short codes (EN, 中). */
  var switches = [];
  var switchStyle = false;
  function shortOf(a) { return a[2] || String(a[0]).toUpperCase(); }
  function makeSwitch() {
    if (!switchStyle) {
      switchStyle = true;
      var st = document.createElement('style');
      st.setAttribute('data-i18n', 'off');
      st.textContent =
        '.rs-lang-switch,.rs-lang-menu{display:inline-flex;margin-left:14px;border:1px solid currentColor;border-radius:3px;font:700 12px/1 "Share Tech Mono","Courier New","Microsoft YaHei","Noto Sans CJK SC",monospace;vertical-align:middle;flex:none;white-space:nowrap;position:relative}' +
        '.rs-lang-switch{overflow:hidden}' +
        '.rs-lang-switch button,.rs-lang-cur,.rs-lang-list button{all:unset;box-sizing:border-box;cursor:pointer;padding:8px 12px;min-width:44px;text-align:center;letter-spacing:.06em;opacity:.7;color:inherit;white-space:nowrap}' +
        '.rs-lang-switch button+button{border-left:1px solid currentColor}' +
        '.rs-lang-switch button.on{opacity:1;background:var(--accent,#3dff7a);color:#020403}' +
        '.rs-lang-cur{opacity:1;display:inline-flex;gap:8px;align-items:center}' +
        '.rs-lang-cur::after{content:"";width:0;height:0;border:4px solid transparent;border-top-color:currentColor;border-bottom:0}' +
        '.rs-lang-list{display:none;position:absolute;right:-1px;top:calc(100% + 4px);min-width:100%;background:var(--rs-lang-bg,#07100b);color:var(--rs-lang-fg,#dcffe6);border:1px solid var(--rs-lang-line,#3dff7a);border-radius:3px;z-index:100000;box-shadow:0 8px 24px rgba(0,0,0,.6);max-height:70vh;overflow:auto}' +
        '.rs-lang-menu.open .rs-lang-list{display:block}' +
        '.rs-lang-list button{display:block;width:100%;text-align:left;padding:10px 16px;opacity:.85;font-size:13px}' +
        '.rs-lang-list button:hover,.rs-lang-list button.on{opacity:1;background:var(--accent,#3dff7a);color:#020403}' +
        '.rs-lang-switch button:focus-visible,.rs-lang-cur:focus-visible,.rs-lang-list button:focus-visible{outline:2px solid currentColor;outline-offset:-2px}' +
        '@media(max-width:560px){.rs-lang-switch,.rs-lang-menu{margin-left:6px}.rs-lang-switch button{font-size:0;padding:8px 9px;min-width:0}.rs-lang-switch button::after{content:attr(data-short);font-size:12px}.rs-lang-cur{padding:8px 9px;min-width:0;font-size:0}.rs-lang-cur::before{content:attr(data-short);font-size:12px}}';
      document.head.appendChild(st);
    }
    var box = document.createElement('div');
    box.setAttribute('role', 'group');
    box.setAttribute('aria-label', 'Language');
    box.setAttribute('data-i18n', 'off');
    if (AVAILABLE.length <= 2) {
      box.className = 'rs-lang-switch';
      AVAILABLE.forEach(function (a) {
        var b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('data-lang', a[0]);
        b.setAttribute('data-short', shortOf(a));
        b.textContent = a[1];
        b.addEventListener('click', function () { set(a[0]); });
        box.appendChild(b);
      });
    } else {
      box.className = 'rs-lang-menu';
      var cur = document.createElement('button');
      cur.type = 'button';
      cur.className = 'rs-lang-cur';
      cur.setAttribute('aria-haspopup', 'true');
      cur.setAttribute('aria-expanded', 'false');
      var list = document.createElement('div');
      list.className = 'rs-lang-list';
      AVAILABLE.forEach(function (a) {
        var b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('data-lang', a[0]);
        b.setAttribute('lang', a[0]);
        b.textContent = a[1];
        b.addEventListener('click', function () { set(a[0]); close(); });
        list.appendChild(b);
      });
      var close = function () { box.classList.remove('open'); cur.setAttribute('aria-expanded', 'false'); };
      cur.addEventListener('click', function (e) {
        e.stopPropagation();
        var o = box.classList.toggle('open');
        cur.setAttribute('aria-expanded', o ? 'true' : 'false');
      });
      document.addEventListener('click', function (e) { if (!box.contains(e.target)) close(); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && box.classList.contains('open')) { close(); cur.focus(); } });
      box.appendChild(cur);
      box.appendChild(list);
    }
    switches.push(box);
    updateSwitches();
    return box;
  }
  function updateSwitches() {
    switches.forEach(function (box) {
      var bs = box.querySelectorAll('button[data-lang]');
      for (var i = 0; i < bs.length; i++) {
        var on = bs[i].getAttribute('data-lang') === lang;
        bs[i].setAttribute('aria-pressed', on ? 'true' : 'false');
        bs[i].classList.toggle('on', on);
      }
      var cur = box.querySelector('.rs-lang-cur');
      if (cur) for (var j = 0; j < AVAILABLE.length; j++) if (AVAILABLE[j][0] === lang) { cur.textContent = AVAILABLE[j][1]; cur.setAttribute('data-short', shortOf(AVAILABLE[j])); }
    });
  }

  function mountSlots() {
    var slots = document.querySelectorAll('[data-lang-slot]');
    for (var i = 0; i < slots.length; i++) if (!slots[i].firstChild) slots[i].appendChild(makeSwitch());
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountSlots); else mountSlots();

  window.addEventListener('storage', function (e) {
    if (e.key === KEY && e.newValue && e.newValue !== lang) apply(e.newValue);
  });

  /* for page scripts that keep a label in sync: writes the English text only when the label
     does not already show it or its translation, so the page and this layer never fight */
  function setText(el, v) {
    if (!el) return;
    var cur = el.textContent;
    if (cur !== v && cur !== tr(v)) el.textContent = v;
  }
  function setAttr(el, name, v) {
    if (!el) return;
    var cur = el.getAttribute(name);
    if (cur !== v && cur !== tr(v)) el.setAttribute(name, v);
  }

  window.RSLang = {
    add: add,
    addSearch: addSearch,
    pl: pl,
    search: function () { return lang === 'en' ? null : (searchD[lang] || null); },
    setText: setText,
    setAttr: setAttr,
    apply: apply,
    set: set,
    t: tr,
    available: AVAILABLE,
    makeSwitch: makeSwitch,
    missing: function () { return Object.keys(missing); },
    get current() { return lang; },
    get tripped() { return tripped; }
  };

  /* initial language: load data while parsing so there is no flash of English */
  if (lang !== 'en') {
    if (document.readyState === 'loading') {
      parts.forEach(function (p) {
        loadedParts[lang + '/' + p] = true;
        document.write('<script src="' + base + 'i18n/' + lang + '/' + p + '.js"><\/script>');
      });
    }
    var start = function () { apply(lang); };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
  }
})();
