(() => {
  'use strict';
  const TEXT = window.GM_TEXT || { words: {}, acts: {} };
  const words = TEXT.words, ACT_TEXT = TEXT.acts;
  let zh = new URLSearchParams(location.search).get('lang') === 'zh';
  const DEMO = new URLSearchParams(location.search).get('demo') === '1';
  const KEY = DEMO ? 'mc_demo_tool_geometry_' : 'mc_tool_geometry_';
  const MODES = ['triangle', 'transform', 'function', 'pythag', 'circle'];
  const MODE_KEY = { triangle: 'tri', transform: 'tr', function: 'fn', pythag: 'py', circle: 'ci' };
  const P = { amber: '#ffb23e', cyan: '#62d3ff', green: '#7dffb0', pink: '#ff6f91', text: '#cfe4ec', axis: '#8fa9b8', grid: '#1a2a36' };
  const LIGHT = { '#ffb23e': '#c26a00', '#62d3ff': '#0b6e99', '#7dffb0': '#0b8a45', '#ff6f91': '#c2185b', '#cfe4ec': '#111111', '#8fa9b8': '#444444', '#1a2a36': '#dddddd' };
  const RAD = Math.PI / 180;

  /* ---------- helpers ---------- */
  const el = id => document.getElementById(id);
  const t = (key, vars) => {
    const pair = words[key];
    if (!pair) { console.warn('Missing text', key); return key; }
    let s = pair[zh ? 1 : 0];
    if (vars) s = s.replace(/\{(\w+)\}/g, (m, n) => (n in vars ? vars[n] : m));
    return s;
  };
  function demoReady(status) {
    if (DEMO && window.parent !== window) {
      window.parent.postMessage({ type: 'cmc-demo-ready', version: 1, status }, location.origin);
    }
  }
  const tx = pair => pair[zh ? 1 : 0];
  const fmt = (n, d = 2) => (Number.isFinite(n) ? String(+n.toFixed(d)) : '—');
  const r6 = n => Math.round(n * 1e6) / 1e6;
  const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
  const pt = p => `(${fmt(p[0])}, ${fmt(p[1])})`;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const clone = o => JSON.parse(JSON.stringify(o));
  function h(tag, attrs, kids) {
    const n = document.createElement(tag);
    Object.entries(attrs || {}).forEach(([k, v]) => {
      if (v == null || v === false) return;
      if (k === 'class') n.className = v;
      else if (k === 'text') n.textContent = v;
      else n.setAttribute(k, v === true ? '' : v);
    });
    [].concat(kids || []).forEach(c => { if (c != null && c !== false) n.append(c); });
    return n;
  }
  const store = {
    get(k) { try { return localStorage.getItem(KEY + k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(KEY + k, v); return true; } catch (e) { return false; } }
  };
  let toastTimer;
  function toast(msg) {
    const n = el('toast');
    n.textContent = msg; n.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { n.hidden = true; }, 2600);
  }

  /* ---------- state ---------- */
  const DEF = () => ({
    mode: 'triangle', snap: 1, act: null,
    tri: { pts: [[-3, -2], [3, -2], [-1, 2]], sides: true, angles: true, hide: false },
    tr: { shape: [[1, 1], [4, 1], [1, 3]], op: 'rotate', c: [0, 0], angle: 90, v: [3, -2], k: 2, mt: 'y', mk: 2, m: [[0, 0], [0, 1]], hide: false, lines: true, target: null },
    fn: {
      f1: { fam: 'quad', lin: { m: 1, c: 0 }, quad: { a: 1, b: 0, c: 0 }, trig: { a: 1, b: 1, c: 0, d: 0, f: 'sin' } },
      f2: { on: false, fam: 'quad', lin: { m: -1, c: 2 }, quad: { a: -1, b: 0, c: 4 }, trig: { a: 1, b: 2, c: 0, d: 0, f: 'cos' } },
      rad: false, keys: true, table: false, hide: false
    },
    py: { a: 3, b: 4, hide: false },
    ci: { th: 'centre', ang: [220, 320, 90, 150], hide: false }
  });
  let state = DEF();

  function merge(d, s) {
    if (Array.isArray(d)) return Array.isArray(s) && s.length === d.length ? d.map((v, i) => merge(v, s[i])) : d;
    if (d && typeof d === 'object') { const o = {}; Object.keys(d).forEach(k => { o[k] = merge(d[k], s && typeof s === 'object' ? s[k] : undefined); }); return o; }
    if (typeof d === 'number') return typeof s === 'number' && Number.isFinite(s) ? clamp(s, -1000, 1000) : d;
    if (typeof d === 'boolean') return typeof s === 'boolean' ? s : d;
    if (typeof d === 'string') return typeof s === 'string' && s.length < 24 ? s : d;
    return d;
  }
  function sanitize(src) {
    const out = merge(DEF(), src);
    const oneOf = (v, list, d) => (list.includes(v) ? v : d);
    out.mode = oneOf(out.mode, MODES, 'triangle');
    out.snap = oneOf(out.snap, [0, 0.5, 1], 1);
    out.tr.op = oneOf(out.tr.op, ['rotate', 'translate', 'reflect', 'scale'], 'rotate');
    out.tr.mt = oneOf(out.tr.mt, ['x', 'y', 'yx', 'ynx', 'vk', 'hk', 'custom'], 'y');
    ['f1', 'f2'].forEach(k => {
      out.fn[k].fam = oneOf(out.fn[k].fam, ['lin', 'quad', 'trig'], 'quad');
      out.fn[k].trig.f = oneOf(out.fn[k].trig.f, ['sin', 'cos'], 'sin');
    });
    if (out.fn.f1.fam === 'trig') out.fn.f2.fam = 'trig'; else if (out.fn.f2.fam === 'trig') out.fn.f2.fam = 'lin';
    out.ci.th = oneOf(out.ci.th, ['centre', 'semi', 'segment'], 'centre');
    if (out.tr.mt !== 'custom') out.tr.m = mirrorPts(out.tr.mt, out.tr.mk);
    out.py.a = clamp(out.py.a, 0.5, 16); out.py.b = clamp(out.py.b, 0.5, 16);
    const s = src && typeof src === 'object' ? src : {};
    out.act = typeof s.act === 'string' && ACT_TEXT[s.act] ? s.act : null;
    const g = s.tr && s.tr.target;
    out.tr.target = Array.isArray(g) && g.length === 3 && g.every(p => Array.isArray(p) && p.length === 2 && p.every(Number.isFinite)) ? g.map(p => p.map(r6)) : null;
    return out;
  }

  /* ---------- board plumbing ---------- */
  let board = null, B = {}, cur = null;
  const refreshers = [];
  let visDirty = false;
  const vis = (o, v) => { if (!o || o._v === v) return; o._v = v; visDirty = true; o.setAttribute({ visible: v }); };

  function mkPt(c, name, color, extra) {
    const snap = state.snap > 0;
    return board.create('point', c.slice(), Object.assign({
      name, size: 5, strokeColor: color, fillColor: color, highlightStrokeColor: color, highlightFillColor: color,
      snapToGrid: snap, snapSizeX: state.snap || 1, snapSizeY: state.snap || 1, showInfobox: false,
      label: { strokeColor: P.text, fontSize: 15, offset: [7, 7] }
    }, extra || {}));
  }
  function addAxes(o) {
    o = o || {};
    const tx = o.tx || 1, ty = o.ty || 1;
    board.create('grid', [], { majorStep: [tx, ty], strokeColor: P.grid, strokeOpacity: 1, strokeWidth: 1, highlight: false, minorElements: 0 });
    const tick = (dist, vertical, labelFn) => ({
      ticksDistance: dist, minorTicks: 0, majorHeight: 8, strokeColor: P.axis, strokeWidth: 1, drawZero: false, insertTicks: !!o.insert, generateLabelText: labelFn || null,
      label: { strokeColor: P.axis, fontSize: 12, offset: vertical ? [-6, 0] : [0, -4], anchorX: vertical ? 'right' : 'middle', anchorY: vertical ? 'middle' : 'top' }
    });
    const base = { strokeColor: P.axis, strokeWidth: 1.5, highlight: false, fixed: true };
    B.axX = board.create('axis', [[0, 0], [1, 0]], Object.assign({ name: 'x', withLabel: true, label: { position: 'rt', offset: [-6, 12], strokeColor: P.axis, fontSize: 14 }, ticks: tick(tx, false, o.xl) }, base));
    B.axY = board.create('axis', [[0, 0], [0, 1]], Object.assign({ name: 'y', withLabel: true, label: { position: 'rt', offset: [12, -6], strokeColor: P.axis, fontSize: 14 }, ticks: tick(ty, true) }, base));
  }

  /* An angle marker (arc or right-angle square plus a label) at vertex V between rays to A and B. */
  function angleMark(V, A, Bp, o) {
    const r = o.r || 0.6, rr = r * 0.75;
    const geo = () => {
      const ux = A.X() - V.X(), uy = A.Y() - V.Y(), vx = Bp.X() - V.X(), vy = Bp.Y() - V.Y();
      const lu = Math.hypot(ux, uy), lv = Math.hypot(vx, vy);
      if (lu < 1e-9 || lv < 1e-9) return null;
      const d = Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy);
      return { a0: Math.atan2(uy, ux), d, ux: ux / lu, uy: uy / lu, vx: vx / lv, vy: vy / lv, deg: Math.abs(d) / RAD };
    };
    const isRight = g => g && Math.abs(g.deg - 90) < 0.5;
    const style = { strokeColor: o.color, strokeWidth: 2, highlight: false, fixed: true, withLabel: false };
    const arc = board.create('curve', [t => { const g = geo(); return g ? V.X() + r * Math.cos(g.a0 + g.d * t) : V.X(); }, t => { const g = geo(); return g ? V.Y() + r * Math.sin(g.a0 + g.d * t) : V.Y(); }, 0, 1], style);
    const sqx = t => { const g = geo(); return g ? V.X() + rr * (t < 1 ? g.ux + g.vx * t : g.vx + g.ux * (2 - t)) : V.X(); };
    const sqy = t => { const g = geo(); return g ? V.Y() + rr * (t < 1 ? g.uy + g.vy * t : g.vy + g.uy * (2 - t)) : V.Y(); };
    const sq = board.create('curve', [sqx, sqy, 0, 2], style);
    const lab = f => () => {
      const g = geo(); if (!g) return V[f]();
      let wx = g.ux + g.vx, wy = g.uy + g.vy, wl = Math.hypot(wx, wy);
      if (wl < 1e-6) { wx = -g.uy; wy = g.ux; wl = 1; }
      const dist = r + (g.deg < 40 ? 1.1 : 0.8);
      return V[f]() + (f === 'X' ? wx : wy) / wl * dist;
    };
    const txt = board.create('text', [lab('X'), lab('Y'), () => { const g = geo(); return g ? fmt(g.deg, 1) + '°' : ''; }], { anchorX: 'middle', anchorY: 'middle', fontSize: o.fs || 14, strokeColor: o.color, fixed: true, highlight: false });
    return { arc, sq, txt, deg: () => { const g = geo(); return g ? g.deg : NaN; }, setVis(show) { const g = geo(); const right = isRight(g) && !o.noSquare; vis(arc, show && !right); vis(sq, show && right); vis(txt, show); } };
  }

  function build() {
    if (typeof JXG === 'undefined') return;
    try {
      if (board) { JXG.JSXGraph.freeBoard(board); board = null; }
      B = {};
      cur = MODEDEF[state.mode];
      const bb = cur.bb();
      board = JXG.JSXGraph.initBoard('board', {
        boundingbox: bb.box, axis: false, grid: false, keepaspectratio: bb.keep, showCopyright: false, showNavigation: false,
        pan: { enabled: false }, zoom: { enabled: false }, showInfobox: false
      });
      cur.build();
      board.on('update', onUpdate);
      el('error').hidden = true;
      renderModes(); renderPanel(); renderTask(); resize(); onUpdate();
    } catch (error) { fail(error); }
  }
  function fail(error) {
    console.error(error);
    el('error').hidden = false;
    el('error').textContent = t('error');
  }
  function resize() {
    const box = el('board');
    if (board && box.clientWidth && box.clientHeight) board.resizeContainer(box.clientWidth, box.clientHeight, true);
  }
  function changed() { if (board) board.update(); }

  let saveTimer, liveTimer;
  function onUpdate() {
    if (!cur || !board) return;
    cur.sync();
    cur.refresh();
    if (visDirty) { visDirty = false; setTimeout(() => { if (board) board.update(); }, 0); }
    renderReadout();
    renderDescribe();
    refreshInputs();
    clearTimeout(saveTimer);
    saveTimer = setTimeout(autosave, 500);
    clearTimeout(liveTimer);
    liveTimer = setTimeout(announce, 900);
  }
  function autosave() { store.set('auto', JSON.stringify(state)); }
  function announce() { const d = cur && cur.describe(); if (d) el('live').textContent = [d.head].concat(d.lines).join('. '); }
  function refreshInputs() { refreshers.forEach(r => r()); }

  /* ---------- reusable control builders ---------- */
  function sec(title, kids) { return h('div', { class: 'gm-sec' }, [title ? h('h3', { text: title }) : null].concat(kids)); }
  function chips(label, opts, get, set) {
    const wrap = h('div', { class: 'cmc-chips', role: 'group', 'aria-label': label });
    const btns = opts.map(([v, txt]) => {
      const b = h('button', { class: 'cmc-chip', type: 'button', 'aria-pressed': 'false', text: txt });
      b.addEventListener('click', () => set(v));
      wrap.append(b);
      return [v, b];
    });
    const r = () => btns.forEach(([v, b]) => b.setAttribute('aria-pressed', String(get() === v)));
    refreshers.push(r); r();
    return wrap;
  }
  function check(label, get, set) {
    const input = h('input', { type: 'checkbox' });
    input.addEventListener('change', () => set(input.checked));
    refreshers.push(() => { input.checked = !!get(); });
    input.checked = !!get();
    return h('label', { class: 'gm-check' }, [input, h('span', { text: label })]);
  }
  function numInput(label, get, set, o) {
    o = o || {};
    const input = h('input', { type: 'number', class: 'cmc-field cmc-num', step: o.step || 'any', 'aria-label': label });
    input.addEventListener('input', () => { const v = input.valueAsNumber; if (Number.isFinite(v)) set(v); });
    input.addEventListener('blur', () => { input.value = fmt(get(), 4); });
    refreshers.push(() => { if (document.activeElement !== input) input.value = fmt(get(), 4); });
    input.value = fmt(get(), 4);
    return input;
  }
  function slider(label, get, set, min, max, step) {
    const range = h('input', { type: 'range', min, max, step, 'aria-label': label });
    range.addEventListener('input', () => set(+range.value));
    refreshers.push(() => { range.value = get(); });
    range.value = get();
    const row = h('div', { class: 'gm-slider' }, [h('div', { class: 'gm-slider-top' }, [h('span', { text: label }), numInput(label, get, set)]), range]);
    return row;
  }
  function coordRow(label, getXY, setXY) {
    return h('div', { class: 'gm-coord' }, [
      h('span', { class: 'gm-coord-name', text: label }),
      h('label', {}, ['x ', numInput(label + ' x', () => getXY()[0], v => setXY([v, getXY()[1]]))]),
      h('label', {}, ['y ', numInput(label + ' y', () => getXY()[1], v => setXY([getXY()[0], v]))])
    ]);
  }
  function btn(text, onClick, cls) {
    const b = h('button', { class: 'cmc-btn ' + (cls || 'quiet'), type: 'button', text });
    b.addEventListener('click', onClick);
    return b;
  }
  function snapControl() {
    return h('div', { class: 'gm-snap' }, [h('span', { class: 'cmc-label', text: t('snap') }),
      chips(t('snap'), [[0, t('snapOff')], [1, t('snap1')], [0.5, t('snap05')]], () => state.snap, v => { state.snap = v; build(); })]);
  }
  function hideControl(hideLabel, revealLabel) {
    const S = () => state[MODE_KEY[state.mode]];
    const b = h('button', { class: 'cmc-btn cyan', type: 'button', 'aria-pressed': 'false' });
    const r = () => { b.textContent = S().hide ? revealLabel : hideLabel; b.setAttribute('aria-pressed', String(!!S().hide)); };
    b.addEventListener('click', toggleHide);
    refreshers.push(r); r();
    return b;
  }
  function toggleHide() {
    const S = state[MODE_KEY[state.mode]];
    S.hide = !S.hide;
    changed();
    toast(S.hide ? t('predictHidden') : t('revealNow'));
  }
  function table(head, rows, cls) {
    return `<table class="cmc-table ${cls || ''}"><thead><tr>${head.map(x => `<th scope="col">${esc(x)}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr class="${r.hit ? 'hit' : ''}">${r.cells.map((c, i) => (i === 0 ? `<th scope="row">${esc(c)}</th>` : `<td>${esc(c)}</td>`)).join('')}</tr>`).join('')}</tbody></table>`;
  }
  function facts(rows) { return `<dl class="gm-facts">${rows.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl>`; }

  /* ---------- mode: triangle ---------- */
  function triData(c) {
    const d = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);
    const sides = [d(c[0], c[1]), d(c[1], c[2]), d(c[2], c[0])];
    const ang = c.map((p, i) => {
      const q = c[(i + 1) % 3], r = c[(i + 2) % 3];
      const ux = q[0] - p[0], uy = q[1] - p[1], vx = r[0] - p[0], vy = r[1] - p[1];
      const l = Math.hypot(ux, uy) * Math.hypot(vx, vy);
      return l < 1e-9 ? NaN : Math.acos(clamp((ux * vx + uy * vy) / l, -1, 1)) / RAD;
    });
    const area = Math.abs((c[1][0] - c[0][0]) * (c[2][1] - c[0][1]) - (c[2][0] - c[0][0]) * (c[1][1] - c[0][1])) / 2;
    const out = { sides, ang, area, perimeter: sides[0] + sides[1] + sides[2], degenerate: area < 1e-3 };
    if (!out.degenerate) {
      const eq = (a, b) => Math.abs(a - b) < 0.05;
      const n = (eq(sides[0], sides[1]) ? 1 : 0) + (eq(sides[1], sides[2]) ? 1 : 0) + (eq(sides[2], sides[0]) ? 1 : 0);
      out.sc = n === 3 ? 'equilateral' : n >= 1 ? 'isosceles' : 'scalene';
      const mx = Math.max(...ang);
      out.ac = Math.abs(mx - 90) < 0.5 ? 'right' : mx > 90 ? 'obtuse' : 'acute';
    }
    return out;
  }
  const NAMES = 'ABC';

  const triMode = {
    bb: () => ({ box: [-8, 6, 8, -6], keep: true }),
    build() {
      const S = state.tri;
      addAxes();
      const V = S.pts.map((c, i) => mkPt(c, NAMES[i], P.amber));
      B.pts = V;
      B.poly = board.create('polygon', V, { fillColor: P.amber, fillOpacity: 0.12, highlight: false, hasInnerPoints: false, borders: { strokeColor: P.amber, strokeWidth: 2.5, highlight: false } });
      B.side = [0, 1, 2].map(i => {
        const pos = () => {
          const p = V[i], q = V[(i + 1) % 3], r = V[(i + 2) % 3];
          const mx = (p.X() + q.X()) / 2, my = (p.Y() + q.Y()) / 2;
          let nx = -(q.Y() - p.Y()), ny = q.X() - p.X();
          const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l;
          if ((r.X() - mx) * nx + (r.Y() - my) * ny > 0) { nx = -nx; ny = -ny; }
          return [mx + nx * 0.55, my + ny * 0.55];
        };
        return board.create('text', [() => pos()[0], () => pos()[1], () => fmt(V[i].Dist(V[(i + 1) % 3]))], { anchorX: 'middle', anchorY: 'middle', fontSize: 14, strokeColor: P.text, fixed: true, highlight: false });
      });
      B.ang = [0, 1, 2].map(i => angleMark(V[i], V[(i + 1) % 3], V[(i + 2) % 3], { color: P.cyan, r: 0.6 }));
    },
    sync() { state.tri.pts = B.pts.map(p => [r6(p.X()), r6(p.Y())]); },
    refresh() {
      const S = state.tri, show = !S.hide;
      B.side.forEach(x => vis(x, S.sides && show));
      B.ang.forEach(m => m.setVis(S.angles && show));
    },
    controls(root) {
      const S = state.tri;
      const setPts = (pts, snap) => {
        S.pts = pts.map(p => p.slice());
        if (snap !== undefined && snap !== state.snap) { state.snap = snap; build(); return; }
        B.pts.forEach((p, i) => p.moveTo(pts[i]));
        changed();
      };
      const r3 = 3 * Math.sqrt(3);
      const presets = [['p_right', [[-3, -2], [1, -2], [-3, 1]], 1], ['p_isos', [[-3, -2], [3, -2], [0, 3]], 1], ['p_equi', [[-3, -2], [3, -2], [0, -2 + r3]], 0], ['p_scal', [[-3, -2], [3, -2], [-1, 2]], 1], ['p_obt', [[-4, -2], [4, -2], [-1, 0]], 1]];
      root.append(
        h('p', { class: 'gm-dim', text: t('triHint') }),
        sec(t('presets'), [h('div', { class: 'cmc-chips' }, presets.map(([k, pts, sn]) => btn(t(k), () => setPts(pts, sn), 'quiet gm-small')))]),
        sec(t('vertices'), NAMES.split('').map((n, i) => coordRow(n, () => S.pts[i], c => { B.pts[i].moveTo(c); changed(); }))),
        sec(null, [snapControl(), check(t('sideLabels'), () => S.sides, v => { S.sides = v; changed(); }), check(t('angleLabels'), () => S.angles, v => { S.angles = v; changed(); }), hideControl(t('hideNow'), t('revealNow'))])
      );
    },
    data() { return triData(state.tri.pts); },
    readout() {
      const S = state.tri;
      if (S.hide) return `<p class="gm-hidden">${esc(t('predictHidden'))}</p>`;
      const d = this.data();
      if (d.degenerate) return `<p class="cmc-note warn">${esc(t('degenerate'))}</p>`;
      const sumA = d.ang.reduce((a, b) => a + b, 0);
      return `<div class="gm-tags"><span class="gm-tag">${esc(t('sc_' + d.sc))}</span><span class="gm-tag">${esc(t('ac_' + d.ac))}</span></div>` + facts([
        [t('sides'), `AB ${fmt(d.sides[0])} · BC ${fmt(d.sides[1])} · CA ${fmt(d.sides[2])}`],
        [t('angles'), `∠A ${fmt(d.ang[0], 1)}° · ∠B ${fmt(d.ang[1], 1)}° · ∠C ${fmt(d.ang[2], 1)}°`],
        [t('angleSum'), `${fmt(sumA, 1)}°`], [t('perimeter'), fmt(d.perimeter)], [t('area'), `${fmt(d.area)} ${t('unit2')}`]]);
    },
    describe() {
      const S = state.tri, d = this.data();
      const verts = NAMES.split('').map((n, i) => n + pt(S.pts[i])).join(', ');
      if (S.hide) return { head: t('liveTri'), lines: [verts, t('predictHidden')] };
      if (d.degenerate) return { head: t('liveTri'), lines: [verts, t('degenerate')] };
      const head = `${t('sc_' + d.sc)} · ${t('ac_' + d.ac)}${zh ? '' : ' '}${t('triWord')}`;
      return { head, lines: [verts + '.', `AB = ${fmt(d.sides[0])}, BC = ${fmt(d.sides[1])}, CA = ${fmt(d.sides[2])}.`,
        `∠A = ${fmt(d.ang[0], 1)}°, ∠B = ${fmt(d.ang[1], 1)}°, ∠C = ${fmt(d.ang[2], 1)}° (${t('angleSum')} ${fmt(d.ang.reduce((a, b) => a + b, 0), 1)}°).`,
        `${t('perimeter')} ${fmt(d.perimeter)}, ${t('area')} ${fmt(d.area)} ${t('unit2')}.`] };
    }
  };

  /* ---------- mode: transformations ---------- */
  const mirrorPts = (mt, k, m) => ({ x: [[0, 0], [1, 0]], y: [[0, 0], [0, 1]], yx: [[0, 0], [1, 1]], ynx: [[0, 0], [1, -1]], vk: [[k, 0], [k, 1]], hk: [[0, k], [1, k]], custom: m })[mt];
  function trImage(p, S) {
    const x = p[0], y = p[1];
    switch (S.op) {
      case 'translate': return [x + S.v[0], y + S.v[1]];
      case 'scale': return [S.c[0] + S.k * (x - S.c[0]), S.c[1] + S.k * (y - S.c[1])];
      case 'reflect': {
        const a = S.m[0], b = S.m[1], dx = b[0] - a[0], dy = b[1] - a[1], L = dx * dx + dy * dy;
        if (L < 1e-12) return [x, y];
        const k = ((x - a[0]) * dx + (y - a[1]) * dy) / L, fx = a[0] + k * dx, fy = a[1] + k * dy;
        return [2 * fx - x, 2 * fy - y];
      }
      default: {
        const a = S.angle * RAD, dx = x - S.c[0], dy = y - S.c[1];
        return [S.c[0] + dx * Math.cos(a) - dy * Math.sin(a), S.c[1] + dx * Math.sin(a) + dy * Math.cos(a)];
      }
    }
  }
  const imageWith = (S, patch) => S.shape.map(p => trImage(p, Object.assign({}, S, patch)).map(r6));
  function lineEq(m) {
    const a = m[0], b = m[1], dx = b[0] - a[0], dy = b[1] - a[1];
    if (Math.hypot(dx, dy) < 1e-9) return '—';
    if (Math.abs(dx) < 1e-9) return `x = ${fmt(a[0])}`;
    const g = dy / dx, c = a[1] - g * a[0];
    return Math.abs(g) < 1e-9 ? `y = ${fmt(c)}` : 'y = ' + poly([[g, 'x'], [c, '', true]]);
  }
  function poly(terms) {
    let s = '';
    terms.forEach(([c, sym, keep]) => {
      if (Math.abs(c) < 1e-9) return;
      const neg = c < 0, a = Math.abs(c);
      const body = !keep && Math.abs(a - 1) < 1e-9 ? sym : fmt(a) + sym;
      s += s ? (neg ? ' - ' : ' + ') + body : (neg ? '-' : '') + body;
    });
    return s || '0';
  }
  function trSentence(S) {
    const c = pt(S.c);
    switch (S.op) {
      case 'translate': {
        const parts = [];
        if (S.v[0] > 0) parts.push(t('d_right', { n: fmt(S.v[0]) })); else if (S.v[0] < 0) parts.push(t('d_left', { n: fmt(-S.v[0]) }));
        if (S.v[1] > 0) parts.push(t('d_up', { n: fmt(S.v[1]) })); else if (S.v[1] < 0) parts.push(t('d_down', { n: fmt(-S.v[1]) }));
        return t('d_trans', { v: pt(S.v), p: parts.length ? (zh ? '：' : ': ') + parts.join(zh ? '，' : ', ') : '' });
      }
      case 'reflect': {
        let l = lineEq(S.m);
        if (S.mt === 'x') l = t('xAxisName', { l: 'y = 0' }); else if (S.mt === 'y') l = t('yAxisName', { l: 'x = 0' });
        return t('d_ref', { l });
      }
      case 'scale': return t('d_enl', { k: fmt(S.k), c });
      default: {
        const a = fmt(Math.abs(S.angle));
        if (Math.abs(S.angle) < 1e-9) return t('d_rot_0');
        if (Math.abs(Math.abs(S.angle) - 180) < 1e-9) return t('d_rot_180', { c });
        return t(S.angle > 0 ? 'd_rot_acw' : 'd_rot_cw', { a, c });
      }
    }
  }
  const targetHit = S => S.target && S.shape.every((p, i) => { const q = trImage(p, S); return Math.hypot(q[0] - S.target[i][0], q[1] - S.target[i][1]) < 0.05; });

  const trMode = {
    bb: () => ({ box: [-10, 8, 10, -8], keep: true }),
    build() {
      const S = state.tr;
      addAxes();
      const V = S.shape.map((c, i) => mkPt(c, NAMES[i], P.amber));
      B.pts = V;
      B.cen = mkPt(S.c, 'P', P.pink, { face: 'cross', size: 7 });
      B.m1 = mkPt(S.m[0], '', P.pink, { face: 'diamond', size: 5, withLabel: false });
      B.m2 = mkPt(S.m[1], '', P.pink, { face: 'diamond', size: 5, withLabel: false });
      [B.m1, B.m2].forEach(p => p.setAttribute({ fixed: S.mt !== 'custom' }));
      B.mline = board.create('line', [B.m1, B.m2], { strokeColor: P.pink, strokeWidth: 2, dash: 2, highlight: false, fixed: true });
      B.poly = board.create('polygon', V, { fillColor: P.amber, fillOpacity: 0.14, highlight: false, hasInnerPoints: false, borders: { strokeColor: P.amber, strokeWidth: 2.5, highlight: false } });
      if (S.target) {
        const T = S.target.map(c => board.create('point', c.slice(), { fixed: true, size: 3, withLabel: false, strokeColor: P.green, fillColor: P.green, highlight: false }));
        board.create('polygon', T, { fillColor: P.green, fillOpacity: 0.07, dash: 2, highlight: false, hasInnerPoints: false, vertices: { visible: false }, borders: { strokeColor: P.green, strokeWidth: 2, dash: 2, highlight: false } });
      }
      B.imgPts = V.map((p, i) => board.create('point', [() => trImage([p.X(), p.Y()], state.tr)[0], () => trImage([p.X(), p.Y()], state.tr)[1]], {
        name: NAMES[i] + '′', fixed: true, size: 4, strokeColor: P.cyan, fillColor: P.cyan, highlight: false, label: { strokeColor: P.cyan, fontSize: 15, offset: [8, -16] }
      }));
      B.imgPoly = board.create('polygon', B.imgPts, { fillColor: P.cyan, fillOpacity: 0.14, highlight: false, hasInnerPoints: false, vertices: { visible: false }, borders: { strokeColor: P.cyan, strokeWidth: 2.5, highlight: false } });
      const seg = (a, b, arrow) => board.create('segment', [a, b], { strokeColor: P.axis, strokeWidth: 1.2, dash: 2, highlight: false, fixed: true, lastArrow: arrow ? { type: 2, size: 5 } : false });
      B.c0 = V.map(p => seg(B.cen, p));
      B.c1 = B.imgPts.map(p => seg(B.cen, p));
      B.c2 = V.map((p, i) => seg(p, B.imgPts[i], true));
    },
    sync() {
      const S = state.tr;
      S.shape = B.pts.map(p => [r6(p.X()), r6(p.Y())]);
      S.c = [r6(B.cen.X()), r6(B.cen.Y())];
      if (S.mt === 'custom') S.m = [[r6(B.m1.X()), r6(B.m1.Y())], [r6(B.m2.X()), r6(B.m2.Y())]];
    },
    refresh() {
      const S = state.tr, show = !S.hide, op = S.op;
      vis(B.imgPoly, show); B.imgPts.forEach(p => vis(p, show));
      vis(B.cen, op === 'rotate' || op === 'scale');
      const rf = op === 'reflect', custom = rf && S.mt === 'custom';
      vis(B.mline, rf); vis(B.m1, custom); vis(B.m2, custom);
      const L = S.lines && show;
      B.c0.forEach(s => vis(s, L && op === 'rotate'));
      B.c1.forEach(s => vis(s, L && (op === 'rotate' || op === 'scale')));
      B.c2.forEach(s => vis(s, L && (op === 'translate' || op === 'reflect')));
    },
    setMirror(mt, k) {
      const S = state.tr;
      S.mt = mt; if (k !== undefined) S.mk = k;
      if (mt !== 'custom') {
        S.m = mirrorPts(mt, S.mk);
        B.m1.moveTo(S.m[0]); B.m2.moveTo(S.m[1]);
      }
      [B.m1, B.m2].forEach(p => p.setAttribute({ fixed: mt !== 'custom' }));
    },
    controls(root) {
      const S = state.tr, self = this;
      const ops = [['rotate', t('op_rotate')], ['translate', t('op_translate')], ['reflect', t('op_reflect')], ['scale', t('op_scale')]];
      const centre = () => coordRow(t('centre'), () => S.c, c => { B.cen.moveTo(c); changed(); });
      const parts = [];
      if (S.op === 'rotate') {
        parts.push(centre(), slider(t('angle'), () => S.angle, v => { S.angle = v; changed(); }, -180, 180, 5),
          h('div', { class: 'cmc-chips' }, [btn('90° ↺', () => { S.angle = 90; changed(); }, 'quiet gm-small'), btn('90° ↻', () => { S.angle = -90; changed(); }, 'quiet gm-small'), btn('180°', () => { S.angle = 180; changed(); }, 'quiet gm-small')]));
      } else if (S.op === 'translate') {
        parts.push(slider(t('vx'), () => S.v[0], v => { S.v[0] = v; changed(); }, -10, 10, 1), slider(t('vy'), () => S.v[1], v => { S.v[1] = v; changed(); }, -10, 10, 1));
      } else if (S.op === 'scale') {
        parts.push(centre(), slider(t('factor'), () => S.k, v => { S.k = v; changed(); }, -4, 4, 0.5));
      } else {
        parts.push(chips(t('mirror'), ['x', 'y', 'yx', 'ynx', 'vk', 'hk', 'custom'].map(k => [k, t('mt_' + k)]), () => S.mt, v => { self.setMirror(v); renderPanel(); changed(); }));
        if (S.mt === 'vk' || S.mt === 'hk') parts.push(h('label', { class: 'gm-inline' }, [t('kValue') + ' ', numInput(t('kValue'), () => S.mk, v => { self.setMirror(S.mt, v); changed(); })]));
        if (S.mt === 'custom') parts.push(coordRow(t('mp1'), () => S.m[0], c => { B.m1.moveTo(c); changed(); }), coordRow(t('mp2'), () => S.m[1], c => { B.m2.moveTo(c); changed(); }));
      }
      root.append(
        h('p', { class: 'gm-dim', text: t('trHint') }),
        chips(t('opLabel'), ops, () => S.op, v => { S.op = v; renderPanel(); changed(); }),
        sec(null, parts),
        sec(null, [check(t('showLines'), () => S.lines, v => { S.lines = v; changed(); }), hideControl(t('hideImage'), t('revealImage')), snapControl()]),
        ...(S.target ? [h('div', { class: 'cmc-note' }, [h('b', { text: t('targetNote') }), btn(t('clearTarget'), () => { S.target = null; build(); }, 'quiet gm-small')])] : []),
        h('details', { class: 'cmc-details' }, [h('summary', { text: t('objectPts') })].concat(NAMES.split('').map((n, i) => coordRow(n, () => S.shape[i], c => { B.pts[i].moveTo(c); changed(); }))))
      );
    },
    readout() {
      const S = state.tr;
      const rows = S.shape.map((p, i) => ({ cells: [NAMES[i] + ' → ' + NAMES[i] + '′', pt(p), S.hide ? '?' : pt(trImage(p, S))] }));
      let html = table([t('point'), t('object'), t('image')], rows, 'gm-wide');
      if (S.op === 'scale' && !S.hide) {
        html += `<p class="gm-dim">${esc(t('enlArea', { k: fmt(Math.abs(S.k)), a: fmt(S.k * S.k) }))}</p>`;
        if (S.k < 0) html += `<p class="gm-dim">${esc(t('enlNeg'))}</p>`; else if (Math.abs(S.k) < 1) html += `<p class="gm-dim">${esc(t('enlSmall'))}</p>`;
      }
      if (S.target) html += `<p class="${targetHit(S) ? 'cmc-ok' : 'gm-dim'}">${esc(t(targetHit(S) ? 'matched' : 'notMatched'))}</p>`;
      return html;
    },
    describe() {
      const S = state.tr;
      const lines = S.hide ? [t('predictHidden')] : [S.shape.map((p, i) => `${NAMES[i]}${pt(p)} → ${NAMES[i]}′${pt(trImage(p, S))}`).join('; ')];
      if (S.target && !S.hide) lines.push(t(targetHit(S) ? 'matched' : 'notMatched'));
      return { head: trSentence(S), lines };
    }
  };

  /* ---------- mode: functions ---------- */
  const FCOL = [P.amber, P.cyan];
  function fnEval(f, x) {
    if (f.fam === 'lin') return f.lin.m * x + f.lin.c;
    if (f.fam === 'quad') return (f.quad.a * x + f.quad.b) * x + f.quad.c;
    const k = state.fn.rad ? 1 : RAD, T = f.trig, g = T.f === 'cos' ? Math.cos : Math.sin;
    return T.a * g((T.b * x + T.c) * k) + T.d;
  }
  // Treat a quadratic with a = 0 as the straight line it really is.
  function fnKind(f) {
    if (f.fam === 'quad' && Math.abs(f.quad.a) < 1e-9) return { type: 'lin', m: f.quad.b, c: f.quad.c, degenerate: true };
    if (f.fam === 'lin') return { type: 'lin', m: f.lin.m, c: f.lin.c };
    if (f.fam === 'quad') return { type: 'quad', a: f.quad.a, b: f.quad.b, c: f.quad.c };
    return Object.assign({ type: 'trig' }, f.trig);
  }
  function fnEq(f) {
    if (f.fam === 'lin') return 'y = ' + poly([[f.lin.m, 'x'], [f.lin.c, '', true]]);
    if (f.fam === 'quad') return 'y = ' + poly([[f.quad.a, 'x²'], [f.quad.b, 'x'], [f.quad.c, '', true]]);
    const T = f.trig, u = state.fn.rad ? '' : '°';
    if (Math.abs(T.a) < 1e-9) return 'y = ' + fmt(T.d);
    let inner = poly([[T.b, 'x']]);
    if (Math.abs(T.c) > 1e-9) inner += (T.c < 0 ? ' - ' : ' + ') + fmt(Math.abs(T.c)) + u;
    const amp = Math.abs(T.a - 1) < 1e-9 ? '' : Math.abs(T.a + 1) < 1e-9 ? '-' : fmt(T.a) + ' ';
    return `y = ${amp}${T.f}(${inner})` + (Math.abs(T.d) > 1e-9 ? (T.d < 0 ? ' - ' : ' + ') + fmt(Math.abs(T.d)) : '');
  }
  const piLabel = (n, den) => { // n/den of pi
    if (n === 0) return '0';
    const g = (a, b) => (b ? g(b, a % b) : Math.abs(a)), d = g(n, den), nn = n / d, dd = den / d;
    const top = Math.abs(nn) === 1 ? (nn < 0 ? '-' : '') : String(nn);
    return top + 'π' + (dd === 1 ? '' : '/' + dd);
  };
  // x (in units of pi) written as a simple fraction of pi when it is one.
  function periodText(k) {
    for (let d = 1; d <= 12; d++) {
      const n = Math.round(k * d);
      if (n > 0 && Math.abs(k * d - n) < 1e-6) return `${fmt(k * Math.PI)} (= ${piLabel(n, d)})`;
    }
    return fmt(k * Math.PI);
  }
  // Key points, in fixed slots: 0 y-intercept, 1 vertex, 2 and 3 roots.
  function keySlots(f) {
    const K = fnKind(f), out = [null, null, null, null];
    if (K.type === 'lin') {
      out[0] = [0, K.c];
      if (Math.abs(K.m) > 1e-9) out[2] = [-K.c / K.m, 0];
    } else if (K.type === 'quad') {
      out[0] = [0, K.c];
      out[1] = [-K.b / (2 * K.a), K.c - K.b * K.b / (4 * K.a)];
      const D = K.b * K.b - 4 * K.a * K.c;
      if (D > 1e-9) { const r = Math.sqrt(D), x1 = (-K.b - r) / (2 * K.a), x2 = (-K.b + r) / (2 * K.a); out[2] = [Math.min(x1, x2), 0]; out[3] = [Math.max(x1, x2), 0]; }
      else if (Math.abs(D) <= 1e-9) out[2] = [-K.b / (2 * K.a), 0];
    }
    return out;
  }
  function fnRows(f) {
    const K = fnKind(f), rows = [];
    if (K.type === 'lin') {
      if (K.degenerate) rows.push([t('aZero'), '']);
      rows.push([t('gradient'), fmt(K.m)], [t('yint'), fmt(K.c)]);
      rows.push([t('xint'), Math.abs(K.m) > 1e-9 ? fmt(-K.c / K.m) : t('horiz')]);
      if (Math.abs(K.m) > 1e-9) rows.push([t('perpGrad'), fmt(-1 / K.m)]);
    } else if (K.type === 'quad') {
      const D = K.b * K.b - 4 * K.a * K.c, v = keySlots(f)[1];
      rows.push([K.a > 0 ? t('opensUp') : t('opensDown'), t(K.a > 0 ? 'minimum' : 'maximum')],
        [t('vertex'), pt(v)], [t('axis'), `x = ${fmt(v[0])}`], [t('yint'), fmt(K.c)], [t('disc'), `b² − 4ac = ${fmt(D)}`]);
      const ks = keySlots(f);
      rows.push([t('roots'), D > 1e-9 ? `x = ${fmt(ks[2][0])} , x = ${fmt(ks[3][0])}` : Math.abs(D) <= 1e-9 ? `x = ${fmt(ks[2][0])}, ${t('oneRoot')}` : t('noRoots')]);
    } else {
      const R = state.fn.rad, ab = Math.abs(K.b), amp = Math.abs(K.a);
      rows.push([t('amplitude'), fmt(amp)],
        [t('period'), ab < 1e-9 ? t('noPeriod') : R ? periodText(2 / ab) : `${fmt(360 / ab)}°`],
        [t('midline'), `y = ${fmt(K.d)}`], [t('maxMin'), `${fmt(K.d + amp)} / ${fmt(K.d - amp)}`]);
      if (ab > 1e-9) rows.push([t('phase'), R ? fmt(-K.c / K.b) : `${fmt(-K.c / K.b)}°`]);
    }
    return rows;
  }
  function fnIntersections() {
    const F = state.fn;
    if (!F.f2.on || F.f1.fam === 'trig') return null;
    const co = f => { const K = fnKind(f); return K.type === 'lin' ? [0, K.m, K.c] : [K.a, K.b, K.c]; };
    const a = co(F.f1), b = co(F.f2), A = a[0] - b[0], Bc = a[1] - b[1], C = a[2] - b[2], xs = [];
    if (Math.abs(A) < 1e-9) {
      if (Math.abs(Bc) < 1e-9) return Math.abs(C) < 1e-9 ? 'same' : [];
      xs.push(-C / Bc);
    } else {
      const D = Bc * Bc - 4 * A * C;
      if (D > 1e-9) { const r = Math.sqrt(D); xs.push((-Bc - r) / (2 * A), (-Bc + r) / (2 * A)); } else if (Math.abs(D) <= 1e-9) xs.push(-Bc / (2 * A));
    }
    return xs.sort((p, q) => p - q).map(x => [x, fnEval(F.f1, x)]);
  }
  function fnView() {
    const F = state.fn;
    if (F.f1.fam !== 'trig') return { box: [-10, 8, 10, -8], keep: true };
    return F.rad ? { box: [-7.5, 8, 7.5, -8], keep: false } : { box: [-405, 8, 405, -8], keep: false };
  }
  const fnMode = {
    bb: fnView,
    build() {
      const F = state.fn, trig = F.f1.fam === 'trig';
      const o = {};
      if (trig && F.rad) { o.tx = Math.PI / 2; o.xl = tick => piLabel(Math.round(tick.usrCoords[1] / (Math.PI / 2)), 2); }
      else if (trig) { o.tx = 90; o.xl = tick => fmt(tick.usrCoords[1], 0) + '°'; }
      addAxes(o);
      B.g = []; B.keys = [];
      [F.f1, F.f2].forEach((_, i) => {
        const f = () => (i ? state.fn.f2 : state.fn.f1);
        B.g[i] = board.create('curve', [x => x, x => fnEval(f(), x), () => board.getBoundingBox()[0], () => board.getBoundingBox()[2]], { strokeColor: FCOL[i], strokeWidth: 3, highlight: false });
        B.keys[i] = [0, 1, 2, 3].map(j => board.create('point', [() => { const k = keySlots(f())[j]; return k ? k[0] : NaN; }, () => { const k = keySlots(f())[j]; return k ? k[1] : NaN; }], {
          fixed: true, size: 4, withLabel: false, face: j === 1 ? 'diamond' : 'circle', strokeColor: FCOL[i], fillColor: FCOL[i], highlight: false, showInfobox: false
        }));
      });
      B.ix = [0, 1].map(j => board.create('point', [() => { const r = fnIntersections(); return Array.isArray(r) && r[j] ? r[j][0] : NaN; }, () => { const r = fnIntersections(); return Array.isArray(r) && r[j] ? r[j][1] : NaN; }], {
        fixed: true, size: 5, withLabel: false, face: 'cross', strokeColor: P.text, fillColor: P.text, highlight: false
      }));
    },
    sync() {},
    refresh() {
      const F = state.fn, show = !F.hide;
      [0, 1].forEach(i => {
        const f = i ? F.f2 : F.f1, on = i === 0 || F.f2.on;
        vis(B.g[i], on && show);
        const ks = keySlots(f);
        B.keys[i].forEach((p, j) => vis(p, on && show && F.keys && !!ks[j]));
      });
      const r = fnIntersections();
      B.ix.forEach((p, j) => vis(p, show && F.keys && Array.isArray(r) && !!r[j]));
    },
    controls(root) {
      const F = state.fn;
      const setFam = (i, fam) => {
        F[i ? 'f2' : 'f1'].fam = fam;
        if (!i) { if (fam === 'trig') F.f2.fam = 'trig'; else if (F.f2.fam === 'trig') F.f2.fam = 'lin'; }
        build();
      };
      const block = i => {
        const f = i ? F.f2 : F.f1, col = h('span', { class: 'gm-dot', style: `background:${FCOL[i]}` });
        const fams = (i && F.f1.fam === 'trig' ? ['trig'] : i ? ['lin', 'quad'] : ['lin', 'quad', 'trig']).map(k => [k, t('fam_' + k)]);
        const kids = [chips(t(i ? 'f2' : 'f1'), fams, () => f.fam, v => setFam(i, v))];
        const set = (obj, k) => v => { obj[k] = v; changed(); };
        if (f.fam === 'lin') kids.push(slider('m', () => f.lin.m, set(f.lin, 'm'), -5, 5, 0.1), slider('c', () => f.lin.c, set(f.lin, 'c'), -8, 8, 0.1));
        else if (f.fam === 'quad') kids.push(slider('a', () => f.quad.a, set(f.quad, 'a'), -4, 4, 0.1), slider('b', () => f.quad.b, set(f.quad, 'b'), -8, 8, 0.1), slider('c', () => f.quad.c, set(f.quad, 'c'), -8, 8, 0.1));
        else {
          const ph = F.rad ? [-6.3, 6.3, 0.1] : [-360, 360, 5];
          kids.push(chips(t('fnType'), [['sin', 'sin'], ['cos', 'cos']], () => f.trig.f, v => { f.trig.f = v; changed(); }),
            slider('a', () => f.trig.a, set(f.trig, 'a'), -4, 4, 0.1), slider('b', () => f.trig.b, set(f.trig, 'b'), -4, 4, 0.25),
            slider('c', () => f.trig.c, set(f.trig, 'c'), ph[0], ph[1], ph[2]), slider('d', () => f.trig.d, set(f.trig, 'd'), -4, 4, 0.1));
        }
        return sec(null, [h('h3', {}, [col, ' ' + t(i ? 'f2' : 'f1')])].concat(kids));
      };
      root.append(h('p', { class: 'gm-dim', text: t('fnHint') }), block(0),
        check(t('compare'), () => F.f2.on, v => { F.f2.on = v; renderPanel(); changed(); }));
      if (F.f2.on) root.append(block(1));
      const extras = [check(t('keyPts'), () => F.keys, v => { F.keys = v; changed(); }), check(t('valueTable'), () => F.table, v => { F.table = v; changed(); }), hideControl(t('hideGraphs'), t('revealGraphs'))];
      if (F.f1.fam === 'trig') extras.unshift(chips(t('units'), [[false, t('deg')], [true, t('rad')]], () => F.rad, v => { F.rad = v; build(); }));
      root.append(sec(null, extras));
    },
    readout() {
      const F = state.fn;
      let html = '';
      [0, 1].forEach(i => {
        if (i && !F.f2.on) return;
        const f = i ? F.f2 : F.f1;
        html += `<div class="gm-fn"><h3><span class="gm-dot" style="background:${FCOL[i]}"></span> ${esc(t(i ? 'f2' : 'f1'))}</h3><p class="gm-eq">${esc(fnEq(f))}</p>${F.hide ? '' : facts(fnRows(f))}</div>`;
      });
      if (F.hide) return html + `<p class="gm-hidden">${esc(t('predictHidden'))}</p>`;
      const ix = fnIntersections();
      if (ix === 'same') html += `<p class="gm-dim">${esc(t('sameLine'))}</p>`;
      else if (Array.isArray(ix)) html += `<h3>${esc(t('intersect'))}</h3><p>${ix.length ? esc(ix.map(p => pt(p)).join('  ')) : esc(t('noIntersect'))}</p>`;
      if (F.table) {
        const xs = F.f1.fam !== 'trig' ? [-3, -2, -1, 0, 1, 2, 3].map(x => [x, String(x)]) : [0, 1, 2, 3, 4, 5, 6, 7, 8].map(k => (F.rad ? [k * Math.PI / 4, piLabel(k, 4)] : [k * 45, k * 45 + '°']));
        const head = ['x', 'y' + (F.f2.on ? '₁' : '')].concat(F.f2.on ? ['y₂'] : []);
        html += `<h3>${esc(t('tableOfValues'))}</h3>` + table(head, xs.map(([x, lab]) => ({ cells: [lab, fmt(fnEval(F.f1, x))].concat(F.f2.on ? [fmt(fnEval(F.f2, x))] : []) })), 'gm-wide');
      }
      return html;
    },
    describe() {
      const F = state.fn;
      const eqs = [fnEq(F.f1)].concat(F.f2.on ? [fnEq(F.f2)] : []);
      if (F.hide) return { head: eqs.join('   |   '), lines: [t('predictHidden')] };
      const lines = [];
      [F.f1].concat(F.f2.on ? [F.f2] : []).forEach((f, i) => {
        const rows = fnRows(f).filter(r => r[1]).map(r => `${r[0]}: ${r[1]}`);
        lines.push((F.f2.on ? `${t(i ? 'f2' : 'f1')}: ` : '') + rows.join('; ') + '.');
      });
      const ix = fnIntersections();
      if (Array.isArray(ix)) lines.push(`${t('intersect')}: ${ix.length ? ix.map(p => pt(p)).join(' ') : t('noIntersect')}.`);
      return { head: eqs.join('   |   '), lines };
    }
  };

  /* ---------- mode: Pythagoras ---------- */
  const pyBox = () => { const a = state.py.a, b = state.py.b; return [-b - 1.5, a + b + 1.5, a + b + 1.5, -a - 1.5]; };
  const pyMode = {
    bb: () => ({ box: pyBox(), keep: true }),
    build() {
      const S = state.py;
      addAxes({ insert: true });
      const C = board.create('point', [0, 0], { name: 'C', fixed: true, size: 4, strokeColor: P.text, fillColor: P.text, highlight: false, label: { strokeColor: P.text, fontSize: 15, offset: [-14, -16] } });
      B.Bp = mkPt([S.a, 0], 'B', P.amber, { label: { strokeColor: P.text, fontSize: 15, offset: [6, 10] } });
      B.Ap = mkPt([0, S.b], 'A', P.cyan, { label: { strokeColor: P.text, fontSize: 15, offset: [8, 6] } });
      const a = () => B.Bp.X(), b = () => B.Ap.Y(), c = () => Math.hypot(a(), b());
      const sn = v => (state.snap ? Math.round(v / state.snap) * state.snap : v);
      const keep = () => { B.Bp.moveTo([clamp(sn(B.Bp.X()), 0.5, 16), 0]); B.Ap.moveTo([0, clamp(sn(B.Ap.Y()), 0.5, 16)]); };
      B.Bp.on('drag', keep); B.Ap.on('drag', keep);
      B.Bp.on('up', () => this.fit()); B.Ap.on('up', () => this.fit());
      const sq = (pts, col) => board.create('polygon', pts, { fillColor: col, fillOpacity: 0.22, highlight: false, hasInnerPoints: false, vertices: { visible: false }, borders: { strokeColor: col, strokeWidth: 2, highlight: false } });
      B.sqA = sq([[0, 0], [() => a(), 0], [() => a(), () => -a()], [0, () => -a()]], P.amber);
      B.sqB = sq([[0, 0], [0, () => b()], [() => -b(), () => b()], [() => -b(), 0]], P.cyan);
      B.sqC = sq([[() => a(), 0], [0, () => b()], [() => b(), () => a() + b()], [() => a() + b(), () => a()]], P.green);
      board.create('polygon', [C, B.Bp, B.Ap], { fillColor: P.text, fillOpacity: 0.08, highlight: false, hasInnerPoints: false, borders: { strokeColor: P.text, strokeWidth: 2.5, highlight: false } });
      B.mark = angleMark(C, B.Bp, B.Ap, { color: P.text, r: 0.8 });
      const lab = (fx, fy, fs, col, ax) => board.create('text', [fx, fy, fs], { anchorX: ax || 'middle', anchorY: 'middle', fontSize: 15, strokeColor: col, fixed: true, highlight: false });
      B.t = {
        a: lab(() => a() / 2, () => 0.55, () => 'a = ' + fmt(a()), P.amber),
        b: lab(() => 0.12, () => b() / 2, () => 'b = ' + fmt(b()), P.cyan, 'left'),
        c: lab(() => a() / 2 + 0.9 * b() / c(), () => b() / 2 + 0.9 * a() / c(), () => 'c = ' + fmt(c()), P.green),
        A: lab(() => a() / 2, () => -a() / 2, () => 'a² = ' + fmt(a() * a()), P.amber),
        B: lab(() => -b() / 2, () => b() / 2, () => 'b² = ' + fmt(b() * b()), P.cyan),
        C: lab(() => (a() + b()) / 2, () => (a() + b()) / 2, () => 'c² = ' + fmt(a() * a() + b() * b()), P.green)
      };
    },
    fit() { if (board) { board.setBoundingBox(pyBox(), true); board.update(); } },
    setLegs(a, b) {
      a = clamp(a, 0.5, 16); b = clamp(b, 0.5, 16);
      state.py.a = a; state.py.b = b;
      this.fit();
      B.Bp.moveTo([a, 0]);
      state.py.b = b;
      B.Ap.moveTo([0, b]);
      this.fit();
    },
    sync() { state.py.a = r6(B.Bp.X()); state.py.b = r6(B.Ap.Y()); },
    refresh() {
      const show = !state.py.hide;
      vis(B.sqC, show); vis(B.t.c, show); vis(B.t.C, show);
    },
    controls(root) {
      const S = state.py, self = this;
      const triples = [[3, 4], [6, 8], [5, 12], [8, 15]];
      root.append(h('p', { class: 'gm-dim', text: t('pyHint') }),
        sec(t('triples'), [h('div', { class: 'cmc-chips' }, triples.map(([a, b]) => btn(`${a}-${b}-${Math.hypot(a, b)}`, () => self.setLegs(a, b), 'quiet gm-small')))]),
        sec(null, [slider(t('legA'), () => S.a, v => self.setLegs(v, S.b), 0.5, 16, 0.5), slider(t('legB'), () => S.b, v => self.setLegs(S.a, v), 0.5, 16, 0.5), snapControl(), hideControl(t('hideNow'), t('revealNow'))]));
    },
    data() {
      const S = state.py, c = Math.hypot(S.a, S.b), whole = [S.a, S.b, c].every(v => Math.abs(v - Math.round(v)) < 1e-6);
      return { a: S.a, b: S.b, c, a2: S.a * S.a, b2: S.b * S.b, c2: S.a * S.a + S.b * S.b, whole };
    },
    readout() {
      const d = this.data(), S = state.py;
      if (S.hide) return facts([['a²', fmt(d.a2)], ['b²', fmt(d.b2)], [t('hyp'), 'c = ?']]) + `<p class="gm-hidden">${esc(t('predictHidden'))}</p>`;
      return `<p class="gm-eq">${fmt(d.a)}² + ${fmt(d.b)}² = ${fmt(d.c)}²</p>` + facts([['a²', fmt(d.a2)], ['b²', fmt(d.b2)], [t('pySum'), `${fmt(d.a2)} + ${fmt(d.b2)} = ${fmt(d.c2)}`], [t('hyp'), `c = √${fmt(d.c2)} = ${fmt(d.c)}`]])
        + `<p class="${d.whole ? 'cmc-ok' : 'gm-dim'}">${esc(t(d.whole ? 'triple' : 'notTriple'))}</p>`;
    },
    describe() {
      const d = this.data();
      if (state.py.hide) return { head: `a = ${fmt(d.a)}, b = ${fmt(d.b)}`, lines: [t('predictHidden')] };
      return { head: `${fmt(d.a)}² + ${fmt(d.b)}² = ${fmt(d.c)}²`, lines: [`${fmt(d.a2)} + ${fmt(d.b2)} = ${fmt(d.c2)}.`, `${t('hyp')} = ${fmt(d.c)}.`, t(d.whole ? 'triple' : 'notTriple')] };
    }
  };

  /* ---------- mode: circle theorems ---------- */
  const CR = 4;
  const polar = deg => [CR * Math.cos(deg * RAD), CR * Math.sin(deg * RAD)];
  const norm360 = d => ((d % 360) + 360) % 360;
  const ciMode = {
    bb: () => ({ box: [-7.5, 6.5, 7.5, -6.5], keep: true }),
    build() {
      const S = state.ci, th = S.th;
      board.create('circle', [[0, 0], CR], { strokeColor: P.axis, strokeWidth: 2, fillColor: P.cyan, fillOpacity: 0.04, highlight: false, fixed: true });
      const O = board.create('point', [0, 0], { name: 'O', fixed: true, size: 3, strokeColor: P.text, fillColor: P.text, highlight: false, label: { strokeColor: P.text, fontSize: 15, offset: [8, -14] } });
      const circ = (i, name, col) => mkPt(polar(S.ang[i]), name, col, { snapToGrid: false });
      const Ap = circ(0, 'A', P.amber);
      const Bp = th === 'semi' ? mkPt([() => -Ap.X(), () => -Ap.Y()], 'B', P.amber, { fixed: true, snapToGrid: false }) : circ(1, 'B', P.amber);
      const Pp = circ(2, 'P', P.cyan);
      const Qp = th === 'segment' ? circ(3, 'Q', P.green) : null;
      B.pts = [Ap, Bp, Pp, Qp];
      [Ap, th === 'semi' ? null : Bp, Pp, Qp].forEach(p => {
        if (!p) return;
        p.on('drag', () => { const a = Math.atan2(p.Y(), p.X()); p.moveTo([CR * Math.cos(a), CR * Math.sin(a)]); });
      });
      const seg = (p, q, col) => board.create('segment', [p, q], { strokeColor: col, strokeWidth: 2, highlight: false, fixed: true });
      B.inscribed = [];
      if (th === 'centre') {
        seg(O, Ap, P.axis); seg(O, Bp, P.axis); seg(Ap, Bp, P.amber);
        B.centreMark = angleMark(O, Ap, Bp, { color: P.pink, r: 1.1, fs: 15 });
        seg(Pp, Ap, P.cyan); seg(Pp, Bp, P.cyan);
        B.inscribed.push(angleMark(Pp, Ap, Bp, { color: P.cyan, r: 0.8, fs: 15 }));
      } else if (th === 'semi') {
        seg(Ap, Bp, P.amber); seg(Pp, Ap, P.cyan); seg(Pp, Bp, P.cyan);
        B.inscribed.push(angleMark(Pp, Ap, Bp, { color: P.cyan, r: 0.8, fs: 15 }));
      } else {
        seg(Ap, Bp, P.amber); seg(Pp, Ap, P.cyan); seg(Pp, Bp, P.cyan); seg(Qp, Ap, P.green); seg(Qp, Bp, P.green);
        B.inscribed.push(angleMark(Pp, Ap, Bp, { color: P.cyan, r: 0.8, fs: 15 }), angleMark(Qp, Ap, Bp, { color: P.green, r: 0.8, fs: 15 }));
      }
    },
    sync() { state.ci.ang = B.pts.map((p, i) => (p ? r6(norm360(Math.atan2(p.Y(), p.X()) / RAD)) : state.ci.ang[i])); },
    refresh() { const show = !state.ci.hide; B.inscribed.forEach(m => m.setVis(show)); if (B.centreMark) B.centreMark.setVis(true); },
    setAng(i, deg) {
      const S = state.ci;
      S.ang[i] = norm360(deg);
      B.pts[i].moveTo(polar(S.ang[i]));
      changed();
    },
    data() {
      const S = state.ci, p = S.ang.map(polar);
      const at = (v, a, b) => {
        const ux = a[0] - v[0], uy = a[1] - v[1], wx = b[0] - v[0], wy = b[1] - v[1], l = Math.hypot(ux, uy) * Math.hypot(wx, wy);
        return l < 1e-9 ? NaN : Math.acos(clamp((ux * wx + uy * wy) / l, -1, 1)) / RAD;
      };
      const A = p[0], Bq = S.th === 'semi' ? [-p[0][0], -p[0][1]] : p[1];
      return { centre: at([0, 0], A, Bq), p: at(p[2], A, Bq), q: at(p[3], A, Bq) };
    },
    controls(root) {
      const S = state.ci, self = this;
      const rows = [['posA', 0], ['posB', 1], ['posP', 2], ['posQ', 3]].filter(([k, i]) => !(i === 1 && S.th === 'semi') && !(i === 3 && S.th !== 'segment'));
      root.append(h('p', { class: 'gm-dim', text: t('ciHint') }),
        chips(t('theorem'), ['centre', 'semi', 'segment'].map(k => [k, t('th_' + k)]), () => S.th, v => { S.th = v; build(); }),
        sec(null, rows.map(([k, i]) => slider(t(k), () => S.ang[i], v => self.setAng(i, v), 0, 360, 1)).concat([hideControl(t('hideNow'), t('revealNow'))])));
    },
    relation(d) {
      const S = state.ci;
      if (S.th === 'semi') return t('ciSemi');
      if (S.th === 'centre') {
        if (Math.abs(d.centre - 2 * d.p) < 0.2) return t('ciRel1');
        if (Math.abs(360 - d.centre - 2 * d.p) < 0.2) return t('ciRel2');
        return '';
      }
      if (Math.abs(d.p - d.q) < 0.2) return t('ciSame');
      return Math.abs(d.p + d.q - 180) < 0.2 ? t('ciOpp') : '';
    },
    rows(d) {
      const S = state.ci, rows = [];
      if (S.th === 'centre') rows.push([t('ciCentre'), `${fmt(d.centre, 1)}°`]);
      if (S.hide) return rows;
      rows.push([t('ciCirc'), `${fmt(d.p, 1)}°`]);
      if (S.th === 'centre') rows.push([t('ratio'), `${fmt(d.centre / d.p)} : 1`]);
      if (S.th === 'segment') rows.push([t('ciCirc2'), `${fmt(d.q, 1)}°`]);
      return rows;
    },
    readout() {
      const d = this.data(), S = state.ci;
      const rel = S.hide ? '' : this.relation(d);
      return facts(this.rows(d)) + (S.hide ? `<p class="gm-hidden">${esc(t('predictHidden'))}</p>` : rel ? `<p class="cmc-ok">${esc(rel)}</p>` : '');
    },
    describe() {
      const S = state.ci, d = this.data();
      const head = t('th_' + S.th);
      const lines = this.rows(d).map(r => `${r[0]} = ${r[1]}`);
      if (S.hide) lines.push(t('predictHidden')); else { const rel = this.relation(d); if (rel) lines.push(rel); }
      return { head, lines };
    }
  };

  const MODEDEF = { triangle: triMode, transform: trMode, function: fnMode, pythag: pyMode, circle: ciMode };

  /* ---------- rendering of panels ---------- */
  function renderModes() {
    const box = el('modes');
    box.textContent = '';
    MODES.forEach((m, i) => {
      const b = h('button', { class: 'cmc-chip', type: 'button', 'aria-pressed': String(state.mode === m), text: `${i + 1} · ${t('m_' + m)}` });
      b.addEventListener('click', () => setMode(m));
      box.append(b);
    });
  }
  function renderPanel() {
    refreshers.length = 0;
    const root = el('controls');
    root.textContent = '';
    if (cur) cur.controls(root);
    renderReadout();
  }
  function renderReadout() { if (cur) el('readout').innerHTML = cur.readout(); }
  function renderDescribe() {
    if (!cur) return;
    const d = cur.describe(), box = el('describe');
    box.textContent = '';
    box.append(h('strong', { class: 'gm-head', text: d.head }), ...d.lines.map(l => h('div', { text: l })));
  }
  function setMode(m) {
    if (state.act) { const a = ACTS.find(x => x.id === state.act); if (!a || a.mode !== m) state.act = null; }
    state.mode = m;
    revealNotes = false;
    build();
    renderActs();
  }

  /* ---------- activities ---------- */
  let revealNotes = false;
  const ACTS = [
    { id: 'rot', mode: 'transform', set() { const S = state.tr; S.op = 'rotate'; S.angle = 0; S.c = [0, 0]; S.target = imageWith(S, { angle: 90, c: [2, 0] }); } },
    { id: 'ref', mode: 'transform', set() { const S = state.tr; S.op = 'reflect'; S.mt = 'custom'; S.m = [[0, 0], [0, 1]]; S.target = imageWith(S, { m: mirrorPts('vk', 3) }); } },
    { id: 'enl', mode: 'transform', set() { const S = state.tr; S.op = 'scale'; S.k = 1; S.c = [0, 0]; S.target = imageWith(S, { k: 2, c: [1, 1] }); } },
    { id: 'neg', mode: 'transform', set() { const S = state.tr; S.op = 'scale'; S.k = -2; S.c = [0, 0]; S.hide = true; } },
    { id: 'trans', mode: 'transform', set() { const S = state.tr; S.op = 'translate'; S.v = [0, 0]; S.target = imageWith(S, { v: [-4, 3] }); } },
    { id: 'area6', mode: 'triangle', set() { state.tri.pts = [[0, 0], [2, 0], [0, 2]]; state.snap = 1; } },
    { id: 'predict', mode: 'triangle', set() { state.tri.pts = [[-4, -2], [3, -1], [-1, 3]]; state.snap = 0; state.tri.hide = true; } },
    { id: 'types', mode: 'triangle', set() { state.snap = 1; } },
    { id: 'roots', mode: 'function', set() { Object.assign(state.fn.f1, { fam: 'quad', quad: { a: 2, b: -4, c: 0 } }); } },
    { id: 'vertex', mode: 'function', set() { Object.assign(state.fn.f1, { fam: 'quad', quad: { a: 1, b: 0, c: 0 } }); } },
    { id: 'parallel', mode: 'function', set() { const F = state.fn; F.f1.fam = 'lin'; F.f1.lin = { m: 2, c: 1 }; F.f2.on = true; F.f2.fam = 'lin'; F.f2.lin = { m: 1, c: 0 }; } },
    { id: 'trig', mode: 'function', set() { const F = state.fn; F.f1.fam = 'trig'; F.f1.trig = { a: 1, b: 1, c: 0, d: 0, f: 'sin' }; F.f2.fam = 'trig'; F.rad = false; } },
    { id: 'triples', mode: 'pythag', set() { state.py.a = 4; state.py.b = 6; } },
    { id: 'centre', mode: 'circle', set() { state.ci.th = 'centre'; state.ci.ang = [220, 320, 90, 150]; state.ci.hide = true; } },
    { id: 'semi', mode: 'circle', set() { state.ci.th = 'semi'; state.ci.ang = [210, 30, 100, 150]; } }
  ].filter(a => ACT_TEXT[a.id]);

  function loadActivity(id) {
    const a = ACTS.find(x => x.id === id);
    if (!a) return;
    const key = MODE_KEY[a.mode];
    state[key] = clone(DEF()[key]);
    state.mode = a.mode;
    state.act = id;
    a.set();
    revealNotes = false;
    build();
    renderActs();
  }
  function renderActs() {
    const box = el('act-list');
    box.textContent = '';
    ACTS.forEach(a => {
      const b = h('button', { class: 'cmc-chip', type: 'button', 'aria-pressed': String(state.act === a.id), title: t('m_' + a.mode), text: tx(ACT_TEXT[a.id].t) });
      b.addEventListener('click', () => loadActivity(a.id));
      box.append(b);
    });
  }
  function renderTask() {
    const box = el('task');
    const a = state.act && ACT_TEXT[state.act];
    box.hidden = !a;
    box.textContent = '';
    if (!a) return;
    box.append(h('strong', { class: 'gm-head', text: `${t('task')}: ${tx(a.t)}` }), h('p', { text: tx(a.q) }));
    const bar = h('div', { class: 'cmc-bar' }, [
      btn(revealNotes ? t('hideAns') : t('showAns'), () => { revealNotes = !revealNotes; renderTask(); }, 'cyan'),
      btn(t('reload'), () => loadActivity(state.act), 'quiet'),
      btn(t('closeTask'), () => { state.act = null; revealNotes = false; renderTask(); renderActs(); onUpdate(); }, 'quiet')
    ]);
    bar.firstChild.setAttribute('aria-expanded', String(revealNotes));
    box.append(bar);
    if (revealNotes) box.append(h('p', { class: 'gm-teacher' }, [h('strong', { text: t('teacher') + ': ' }), tx(a.a)]));
  }

  /* ---------- teacher tools ---------- */
  function setProjector(on) {
    document.body.classList.toggle('cmc-board', on);
    el('btn-board').setAttribute('aria-pressed', String(on));
    setTimeout(resize, 60);
  }
  function setPanelHidden(on) {
    el('work').classList.toggle('gm-nopanel', on);
    el('btn-panel').setAttribute('aria-pressed', String(on));
    el('btn-panel').textContent = t(on ? 'panelShow' : 'panelBtn');
    setTimeout(resize, 60);
  }
  let pickPool = [], pickKey = '';
  function roster() {
    try {
      const data = JSON.parse(localStorage.getItem(DEMO ? 'mc_demo_classes' : 'mc_classes'));
      const list = data && Array.isArray(data.list) ? data.list : [];
      const cls = list.find(c => c && c.id === data.active) || list[0];
      return cls && Array.isArray(cls.names) ? cls.names.filter(n => typeof n === 'string' && n.trim()).map(n => n.trim()) : [];
    } catch (e) { return []; }
  }
  function pickStudent() {
    const out = el('pick-out'), names = roster();
    out.hidden = false;
    out.textContent = '';
    if (!names.length) { out.append(h('span', { text: t('pickNone') }), btn(t('close'), () => { out.hidden = true; }, 'quiet gm-small')); return; }
    const key = names.join('\u0001');
    if (key !== pickKey || !pickPool.length) { pickKey = key; pickPool = names.slice(); }
    const name = pickPool.splice(Math.floor(Math.random() * pickPool.length), 1)[0];
    out.append(h('span', { class: 'cmc-label', text: t('pickNow') }), h('strong', { class: 'gm-pick-name', text: name }),
      btn(t('pickAgain'), pickStudent, 'quiet gm-small'), btn(t('close'), () => { out.hidden = true; }, 'quiet gm-small'));
  }

  function loadState(src, msg) {
    state = sanitize(src);
    revealNotes = false;
    build();
    renderActs();
    if (msg) toast(msg);
  }
  function saveNow() { toast(store.set('saved', JSON.stringify(state)) ? t('saved') : t('storageFail')); }
  function restoreNow() {
    const raw = store.get('saved');
    if (!raw) { toast(t('nothingSaved')); return; }
    try { loadState(JSON.parse(raw), t('restored')); } catch (e) { toast(t('nothingSaved')); }
  }
  const stateCode = () => 'GM1.' + btoa(JSON.stringify(state));
  function loadCode() {
    const raw = el('code-in').value.trim();
    try {
      if (!raw.startsWith('GM1.')) throw new Error('prefix');
      loadState(JSON.parse(atob(raw.slice(4))), t('codeLoaded'));
    } catch (e) { toast(t('badCode')); }
  }
  function copyText(str, okMsg) {
    const fallback = () => {
      const ta = h('textarea', { 'aria-hidden': 'true', style: 'position:fixed;left:-999px;top:0' });
      ta.value = str; document.body.append(ta); ta.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      ta.remove();
      toast(ok ? okMsg : t('copyFail'));
      if (!ok) { el('code-in').value = str; }
    };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(str).then(() => toast(okMsg), fallback);
    else fallback();
  }
  function describeText() {
    const d = cur.describe();
    return [`${t('title1')} ${t('title2')} — ${t('m_' + state.mode)}`, d.head].concat(d.lines).join('\n');
  }

  /* PNG export: the board SVG is copied, re-coloured for white paper when asked, and painted on a canvas. */
  function boardCanvas(light) {
    return new Promise((resolve, reject) => {
      const svg = el('board').querySelector('svg');
      if (!svg) { reject(new Error('no svg')); return; }
      const w = el('board').clientWidth, hh = el('board').clientHeight;
      const copy = svg.cloneNode(true);
      copy.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      copy.setAttribute('width', w); copy.setAttribute('height', hh); copy.setAttribute('viewBox', `0 0 ${w} ${hh}`);
      copy.style.cssText = '';
      const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      ['x', 'y'].forEach(a => bg.setAttribute(a, 0));
      bg.setAttribute('width', w); bg.setAttribute('height', hh); bg.setAttribute('fill', light ? '#ffffff' : '#06090d');
      const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
      style.textContent = 'text{font-family:Consolas,Menlo,"DejaVu Sans Mono",monospace}';
      copy.insertBefore(bg, copy.firstChild); copy.insertBefore(style, copy.firstChild);
      let xml = new XMLSerializer().serializeToString(copy);
      if (light) Object.keys(LIGHT).forEach(k => { xml = xml.split(k).join(LIGHT[k]).split(k.toUpperCase()).join(LIGHT[k]); });
      const img = new Image();
      img.onload = () => {
        const scale = 2, c = document.createElement('canvas');
        c.width = w * scale; c.height = hh * scale;
        const g = c.getContext('2d');
        g.drawImage(img, 0, 0, c.width, c.height);
        resolve(c);
      };
      img.onerror = () => reject(new Error('image'));
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(xml);
    });
  }
  function downloadPng() {
    boardCanvas(false).then(c => c.toBlob(blob => {
      if (!blob) { toast(t('pngFail')); return; }
      const url = URL.createObjectURL(blob), a = h('a', { href: url, download: `geometry-${state.mode}.png` });
      document.body.append(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    }, 'image/png')).catch(() => toast(t('pngFail')));
  }
  function printWorksheet() {
    boardCanvas(true).then(c => {
      const area = el('print-area'), d = cur.describe(), a = state.act && ACT_TEXT[state.act];
      area.textContent = '';
      const img = h('img', { alt: d.head, src: c.toDataURL('image/png'), class: 'gm-print-img' });
      area.append(h('h1', { text: `${t('title1')} ${t('title2')} — ${t('m_' + state.mode)}` }), h('p', { text: t('printName') }),
        ...(a ? [h('p', {}, [h('strong', { text: t('printTask') + ': ' + tx(a.t) + '. ' }), tx(a.q)])] : []),
        img, h('p', {}, [h('strong', { text: d.head })]), ...d.lines.map(l => h('p', { text: l })),
        h('h2', { text: t('printNotes') }), h('div', { class: 'gm-print-lines' }));
      const go = () => window.print();
      if (img.decode) img.decode().then(go, go); else go();
    }).catch(() => toast(t('pngFail')));
  }

  /* ---------- language ---------- */
  function applyLanguage() {
    document.documentElement.lang = zh ? 'zh-CN' : 'en';
    document.title = `${t('title1')} ${t('title2')} · Classroom Mission Control`;
    document.querySelectorAll('[data-i18n]').forEach(n => { n.textContent = t(n.dataset.i18n); });
    document.querySelectorAll('[data-i18n-title]').forEach(n => { n.title = t(n.dataset.i18nTitle); });
    document.querySelectorAll('[data-i18n-label]').forEach(n => { n.setAttribute('aria-label', t(n.dataset.i18nLabel)); });
    el('board').setAttribute('aria-label', t('boardAria'));
    el('panel').setAttribute('aria-label', t('panelAria'));
    el('btn-panel').textContent = t(el('work').classList.contains('gm-nopanel') ? 'panelShow' : 'panelBtn');
    renderModes(); renderActs();
    if (cur) { renderPanel(); renderTask(); renderDescribe(); }
  }

  /* ---------- start-up ---------- */
  function init() {
    if (typeof JXG === 'undefined') { fail(new Error('JSXGraph missing')); demoReady('unavailable'); return; }
    JXG.Options.text.display = 'internal';
    JXG.Options.label.display = 'internal';
    applyLanguage();
    el('btn-board').addEventListener('click', () => setProjector(!document.body.classList.contains('cmc-board')));
    el('btn-panel').addEventListener('click', () => setPanelHidden(!el('work').classList.contains('gm-nopanel')));
    el('btn-pick').addEventListener('click', pickStudent);
    el('btn-reset').addEventListener('click', () => { state = DEF(); revealNotes = false; build(); renderActs(); });
    el('btn-save').addEventListener('click', saveNow);
    el('btn-restore').addEventListener('click', restoreNow);
    el('btn-code').addEventListener('click', () => copyText(stateCode(), t('copied')));
    el('btn-text').addEventListener('click', () => copyText(describeText(), t('copied')));
    el('btn-png').addEventListener('click', downloadPng);
    el('btn-print').addEventListener('click', printWorksheet);
    el('btn-load').addEventListener('click', loadCode);
    el('code-in').addEventListener('keydown', e => { if (e.key === 'Enter') loadCode(); });
    document.addEventListener('keydown', e => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const tag = (e.target.tagName || '').toLowerCase();
      if (['input', 'textarea', 'select'].includes(tag) && e.key !== 'Escape') return;
      if (e.key === 'Escape') {
        if (DEMO && window.parent !== window) window.parent.postMessage({ type: 'cmc-demo-escape', version: 1 }, location.origin);
        if (document.body.classList.contains('cmc-board')) setProjector(false);
        return;
      }
      const k = e.key.toLowerCase();
      if (/^[1-5]$/.test(k)) setMode(MODES[+k - 1]);
      else if (k === 'p') setProjector(!document.body.classList.contains('cmc-board'));
      else if (k === 'r') toggleHide();
    });
    if (window.ResizeObserver) new ResizeObserver(resize).observe(el('board')); else window.addEventListener('resize', resize);
    window.addEventListener('afterprint', () => { el('print-area').textContent = ''; });
    window.addEventListener('message', event => {
      if (event.origin !== location.origin || event.source !== window.parent) return;
      const data = event.data;
      if (!data || data.type !== 'cmc-language' || (data.lang !== 'en' && data.lang !== 'zh')) return;
      zh = data.lang === 'zh';
      applyLanguage();
    });
    let restored = false;
    const auto = store.get('auto');
    if (auto) { try { state = sanitize(JSON.parse(auto)); restored = true; } catch (e) { state = DEF(); } }
    build();
    renderActs();
    if (restored) toast(t('autoBack'));
    demoReady(board ? 'ready' : 'unavailable');
  }
  window.addEventListener('DOMContentLoaded', init);
})();
