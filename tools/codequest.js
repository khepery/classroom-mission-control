/* Code Quest UI: Blockly workspace, stage, runner, teacher tools. Programs are interpreted by CQCore, never evaluated. */
(() => {
  'use strict';
  const Core = window.CQCore, Data = window.CQLevels, W = window.CQText;
  const { levels, units } = Data;
  const $ = id => document.getElementById(id);
  let zh = new URLSearchParams(location.search).get('lang') === 'zh';
  const w = (key, ...args) => {
    const entry = W[key];
    let text = entry ? entry[zh ? 1 : 0] : key;
    args.forEach((value, i) => { text = text.split('{' + i + '}').join(value); });
    return text;
  };
  const tr = pair => pair[zh ? 1 : 0];
  const h = (tag, cls, text) => {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  /* ---------- storage ---------- */
  const PREFIX = 'mc_tool_codequest_';
  const store = {
    get(key, fallback) { try { const raw = localStorage.getItem(PREFIX + key); return raw == null ? fallback : JSON.parse(raw); } catch (e) { return fallback; } },
    set(key, value) { try { localStorage.setItem(PREFIX + key, JSON.stringify(value)); } catch (e) { /* storage may be unavailable */ } }
  };
  const levelById = id => levels.find(l => l.id === id);
  const cleanProgress = raw => {
    const out = {};
    if (raw && typeof raw === 'object') {
      Object.keys(raw).forEach(id => {
        const e = raw[id];
        if (levelById(id) && e && Number.isInteger(e.stars) && e.stars >= 1 && e.stars <= 3) {
          out[id] = { stars: e.stars, blocks: Number.isInteger(e.blocks) && e.blocks > 0 && e.blocks < 1000 ? e.blocks : 0 };
        }
      });
    }
    return out;
  };
  let progress = cleanProgress(store.get('progress', {}));
  let programs = store.get('programs', {});
  if (!programs || typeof programs !== 'object' || Array.isArray(programs)) programs = {};
  const prefsRaw = store.get('prefs', {}) || {};
  const prefs = {
    level: levelById(prefsRaw.level) ? prefsRaw.level : levels[0].id,
    speed: [1, 2, 3, 4, 5].includes(prefsRaw.speed) ? prefsRaw.speed : 3,
    code: prefsRaw.code !== false,
    fmt: prefsRaw.fmt === 'pseudo' ? 'pseudo' : 'js',
    student: typeof prefsRaw.student === 'string' ? prefsRaw.student.slice(0, 60) : '',
    unit: units.some(u => u.id === prefsRaw.unit) ? prefsRaw.unit : 1
  };
  const savePrefs = () => store.set('prefs', prefs);

  const starText = n => '★'.repeat(n) + '☆'.repeat(3 - n);
  const SPEEDS = [1100, 650, 380, 190, 70];
  const DIR_KEYS = ['east', 'south', 'west', 'north'];

  /* ---------- state ---------- */
  const state = { level: levelById(prefs.level), view: 'play', classMode: false, playing: false, solutionUsed: false, unit: prefs.unit };
  let ws = null, loading = false, sess = null, world = null, timer = null, saveTimer = null, lastEvent = null, view = null;
  let englishMessages = null, chineseMessages = null;
  let lastFocus = null, dialogOk = null, toastTimer = null;

  /* ---------- Blockly setup ---------- */
  const STYLES = {
    cq_start: ['#8a5a00', '#a87100', '#5a3c00', 'cap'], cq_move: ['#0f766e', '#14948a', '#0a5a54'], cq_turn: ['#1d6fa5', '#2a86c4', '#145580'],
    cq_gem: ['#2f7d32', '#3d9b41', '#215c24'], cq_loop: ['#6d4bc2', '#8663dc', '#503691'], cq_cond: ['#b04a1f', '#cf5f2e', '#823613'], cq_call: ['#a1306f', '#bf4287', '#7a2354']
  };
  function makeTheme() {
    const blockStyles = {};
    Object.keys(STYLES).forEach(name => {
      const c = STYLES[name];
      blockStyles[name] = { colourPrimary: c[0], colourSecondary: c[1], colourTertiary: c[2] };
      if (c[3]) blockStyles[name].hat = c[3];
    });
    return Blockly.Theme.defineTheme('cmcdark', {
      name: 'cmcdark', base: Blockly.Themes.Classic, blockStyles,
      fontStyle: { family: '"Share Tech Mono","Microsoft YaHei",monospace', weight: 'normal', size: 12 },
      componentStyles: {
        workspaceBackgroundColour: '#06090d', toolboxBackgroundColour: '#0a1118', toolboxForegroundColour: '#cfe4ec',
        flyoutBackgroundColour: '#0f1a24', flyoutForegroundColour: '#cfe4ec', flyoutOpacity: 0.97,
        scrollbarColour: '#36505e', scrollbarOpacity: 0.7, insertionMarkerColour: '#ffb23e', insertionMarkerOpacity: 0.35,
        markerColour: '#ffb23e', cursorColour: '#62d3ff'
      }
    });
  }
  const condOptions = () => Object.keys(Core.COND).map(key => [tr(Core.COND[key]), key]);
  function blockDefs() {
    const cond = { type: 'field_dropdown', name: 'C', options: condOptions() };
    const body = { type: 'input_statement', name: 'DO' };
    const seq = { previousStatement: null, nextStatement: null };
    return [
      { type: 'cq_start', message0: w('b_start'), nextStatement: null, style: 'cq_start', tooltip: w('tip_start') },
      { type: 'cq_define', message0: w('b_define'), message1: '%1', args1: [body], style: 'cq_call', tooltip: w('tip_define') },
      { type: 'cq_move', message0: '↑ ' + w('b_move'), ...seq, style: 'cq_move', tooltip: w('tip_move') },
      { type: 'cq_left', message0: '↶ ' + w('b_left'), ...seq, style: 'cq_turn', tooltip: w('tip_left') },
      { type: 'cq_right', message0: '↷ ' + w('b_right'), ...seq, style: 'cq_turn', tooltip: w('tip_right') },
      { type: 'cq_collect', message0: '◆ ' + w('b_collect'), ...seq, style: 'cq_gem', tooltip: w('tip_collect') },
      { type: 'cq_repeat', message0: w('b_repeat'), args0: [{ type: 'field_number', name: 'N', value: 3, min: 1, max: 10, precision: 1 }], message1: '%1', args1: [body], ...seq, style: 'cq_loop', tooltip: w('tip_repeat') },
      { type: 'cq_until', message0: w('b_until'), args0: [cond], message1: '%1', args1: [body], ...seq, style: 'cq_loop', tooltip: w('tip_until') },
      { type: 'cq_if', message0: w('b_if'), args0: [cond], message1: w('b_do'), args1: [body], message2: w('b_else'), args2: [{ type: 'input_statement', name: 'ELSE' }], ...seq, style: 'cq_cond', tooltip: w('tip_if') },
      { type: 'cq_call', message0: w('b_call'), ...seq, style: 'cq_call', tooltip: w('tip_call') }
    ];
  }
  function registerBlocks() {
    blockDefs().forEach(def => {
      Blockly.Blocks[def.type] = { init() { this.jsonInit(blockDefs().find(item => item.type === def.type)); } };
    });
  }
  function toolboxFor(level) {
    const has = type => level.blocks.includes(type);
    const items = [];
    const group = (key, types) => {
      const ok = types.filter(has);
      if (!ok.length) return;
      items.push({ kind: 'label', text: w(key) });
      ok.forEach(type => {
        const block = { kind: 'block', type: 'cq_' + (type === 'def' ? 'call' : type) };
        if (type === 'until') block.fields = { C: 'GOAL' };
        items.push(block);
      });
    };
    group('g_moves', ['move', 'left', 'right', 'collect']);
    group('g_loops', ['repeat', 'until']);
    group('g_logic', ['if']);
    group('g_routine', ['def']);
    return { kind: 'flyoutToolbox', contents: items };
  }
  const FIXED = ['cq_start', 'cq_define'];
  const releaseLoading = () => setTimeout(() => { loading = false; }, 0);

  function makeBlock(node) {
    const block = ws.newBlock('cq_' + node.t);
    if (node.t === 'repeat') block.setFieldValue(String(node.n), 'N');
    if (node.c) block.setFieldValue(node.c, 'C');
    block.initSvg();
    block.render();
    return block;
  }
  function buildNodes(nodes, connection) {
    let next = connection;
    nodes.forEach(node => {
      const block = makeBlock(node);
      next.connect(block.previousConnection);
      next = block.nextConnection;
      if (node.body) buildNodes(node.body, block.getInput('DO').connection);
      if (node.els && node.els.length) buildNodes(node.els, block.getInput('ELSE').connection);
    });
  }
  function fixedBlock(type, x, y) {
    const block = ws.newBlock(type);
    block.initSvg();
    block.render();
    block.moveBy(x, y);
    block.setDeletable(false);
    return block;
  }
  function loadProgram(spec) {
    loading = true;
    ws.clear();
    const start = fixedBlock('cq_start', 20, 16);
    if (state.level.blocks.includes('def')) {
      const def = fixedBlock('cq_define', 330, 16);
      if (spec && spec.fn) buildNodes(spec.fn, def.getInput('DO').connection);
    }
    if (spec && spec.main) buildNodes(spec.main, start.nextConnection);
    releaseLoading();
  }
  function restoreSaved(level) {
    const saved = programs[level.id];
    if (!saved || typeof saved !== 'object') return false;
    loading = true;
    try {
      ws.clear();
      Blockly.serialization.workspaces.load(saved, ws);
      releaseLoading();
      const types = ws.getTopBlocks(false).map(b => b.type);
      return types.includes('cq_start') && (!level.blocks.includes('def') || types.includes('cq_define'));
    } catch (e) { releaseLoading(); return false; }
  }

  /* ---------- reading the program ---------- */
  function readProgram() {
    const tops = ws.getTopBlocks(true);
    const start = tops.find(b => b.type === 'cq_start');
    const def = tops.find(b => b.type === 'cq_define');
    const problems = new Set();
    let count = 0;
    if (tops.some(b => b !== start && b !== def)) problems.add('loose');
    function chain(block, depth) {
      const out = [];
      while (block) {
        if (depth > 20) { problems.add('deep'); break; }
        if (++count > 100) { problems.add('big'); break; }
        const type = block.type.slice(3);
        const node = { t: type, id: block.id };
        if (type === 'repeat') {
          const n = Number(block.getFieldValue('N'));
          node.n = Number.isInteger(n) && n >= 1 && n <= 10 ? n : 1;
        }
        if (type === 'until' || type === 'if') node.c = block.getFieldValue('C');
        if (type === 'repeat' || type === 'until' || type === 'if') node.body = chain(block.getInputTargetBlock('DO'), depth + 1);
        if (type === 'if') node.els = chain(block.getInputTargetBlock('ELSE'), depth + 1);
        out.push(node);
        block = block.getNextBlock();
      }
      return out;
    }
    const main = start ? chain(start.getNextBlock(), 0) : [];
    const fn = def ? chain(def.getInputTargetBlock('DO'), 0) : null;
    const hasCall = nodes => nodes.some(n => n.t === 'call' || (n.body && hasCall(n.body)) || (n.els && hasCall(n.els)));
    if (!main.length) problems.add('empty');
    if (fn && hasCall(fn)) problems.add('recursion');
    if (hasCall(main) && (!fn || !fn.length)) problems.add('emptyfn');
    return { prog: { main, fn, startId: start && start.id, fnId: def && def.id }, problems: [...problems] };
  }
  const programBlockCount = () => ws.getAllBlocks(false).filter(b => !FIXED.includes(b.type)).length;

  /* ---------- stage (SVG) ---------- */
  const CELL = 48, MARGIN = 20, NS = 'http://www.w3.org/2000/svg';
  const PAL_SCREEN = { bg: '#06090d', floor: '#0f1a24', grid: '#223747', wall: '#27343f', wallLine: '#7f98a8', gem: '#62d3ff', gemLine: '#e8fbff', goal: '#ffb23e', goalLine: '#ffb23e', text: '#8fa9b8', robot: '#7dffb0', robotLine: '#04281a', start: '#8fa9b8', trail: '#7dffb0', bad: '#ff5a4a' };
  const PAL_PRINT = { bg: '#ffffff', floor: '#ffffff', grid: '#777777', wall: '#cccccc', wallLine: '#333333', gem: '#ffffff', gemLine: '#000000', goal: '#dddddd', goalLine: '#000000', text: '#000000', robot: '#ffffff', robotLine: '#000000', start: '#000000', trail: '#000000', bad: '#000000' };
  function s(tag, attrs, parent, text) {
    const node = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach(k => node.setAttribute(k, attrs[k]));
    if (text !== undefined) node.textContent = text;
    if (parent) parent.append(node);
    return node;
  }
  const cx = x => MARGIN + x * CELL + CELL / 2;
  const cy = y => MARGIN + y * CELL + CELL / 2;
  function starPoints(r) {
    const pts = [];
    for (let i = 0; i < 10; i++) {
      const rad = i % 2 ? r * 0.42 : r;
      const a = -Math.PI / 2 + i * Math.PI / 5;
      pts.push((Math.cos(a) * rad).toFixed(1) + ',' + (Math.sin(a) * rad).toFixed(1));
    }
    return pts.join(' ');
  }
  function buildStage(st, pal) {
    const width = MARGIN + st.w * CELL + 4, height = MARGIN + st.h * CELL + 4;
    const svg = s('svg', { viewBox: `0 0 ${width} ${height}`, preserveAspectRatio: 'xMidYMid meet', role: 'img', 'font-family': 'Share Tech Mono, monospace' });
    s('rect', { x: 0, y: 0, width, height, fill: pal.bg }, svg);
    for (let x = 0; x < st.w; x++) s('text', { x: cx(x), y: 14, 'text-anchor': 'middle', 'font-size': 12, fill: pal.text }, svg, String(x + 1));
    for (let y = 0; y < st.h; y++) s('text', { x: 10, y: cy(y) + 4, 'text-anchor': 'middle', 'font-size': 12, fill: pal.text }, svg, String(y + 1));
    for (let y = 0; y < st.h; y++) {
      for (let x = 0; x < st.w; x++) {
        const gx = MARGIN + x * CELL, gy = MARGIN + y * CELL;
        if (st.walls[y][x]) {
          s('rect', { x: gx + 1, y: gy + 1, width: CELL - 2, height: CELL - 2, fill: pal.wall, stroke: pal.wallLine, 'stroke-width': 1.5 }, svg);
          s('path', { d: `M${gx + 8},${gy + CELL - 8} L${gx + CELL - 8},${gy + 8} M${gx + 8},${gy + CELL / 2} L${gx + CELL / 2},${gy + 8} M${gx + CELL / 2},${gy + CELL - 8} L${gx + CELL - 8},${gy + CELL / 2}`, stroke: pal.wallLine, 'stroke-width': 2, fill: 'none', 'stroke-linecap': 'round' }, svg);
        } else {
          s('rect', { x: gx + 1, y: gy + 1, width: CELL - 2, height: CELL - 2, fill: pal.floor, stroke: pal.grid, 'stroke-width': 1 }, svg);
        }
      }
    }
    s('text', { x: MARGIN + st.start[0] * CELL + 5, y: MARGIN + st.start[1] * CELL + 14, 'font-size': 11, fill: pal.start }, svg, w('start_letter'));
    const gx = MARGIN + st.goal[0] * CELL, gy = MARGIN + st.goal[1] * CELL;
    s('rect', { x: gx + 3, y: gy + 3, width: CELL - 6, height: CELL - 6, fill: 'none', stroke: pal.goalLine, 'stroke-width': 2, 'stroke-dasharray': '5 3' }, svg);
    s('polygon', { points: starPoints(17), fill: pal.goal, stroke: pal.goalLine, 'stroke-width': 1.5, 'stroke-linejoin': 'round', transform: `translate(${cx(st.goal[0])},${cy(st.goal[1]) + 1})` }, svg);
    const gems = new Map();
    st.gems.forEach(key => {
      const [x, y] = key.split(',').map(Number);
      const g = s('g', { transform: `translate(${cx(x)},${cy(y)})` }, svg);
      s('polygon', { points: '0,-14 11,0 0,14 -11,0', fill: pal.gem, stroke: pal.gemLine, 'stroke-width': 2 }, g);
      s('path', { d: 'M-11,0 H11 M0,-14 L-4,0 L0,14 M0,-14 L4,0 L0,14', fill: 'none', stroke: pal.gemLine, 'stroke-width': 1, opacity: 0.6 }, g);
      gems.set(key, g);
    });
    const trail = s('g', { opacity: 0.4 }, svg);
    const marks = s('g', {}, svg);
    const robot = s('g', { class: 'cq-robot' }, svg);
    const rotor = s('g', { class: 'cq-rotor' }, robot);
    const body = s('polygon', { points: '-16,-15 18,0 -16,15 -9,0', fill: pal.robot, stroke: pal.robotLine, 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, rotor);
    s('circle', { cx: 8, cy: 0, r: 3, fill: pal.robotLine }, rotor);
    return { svg, gems, trail, marks, robot, rotor, body, pal, angle: st.dir * 90 };
  }
  function placeRobot(animate) {
    const ms = animate ? Math.min(SPEEDS[prefs.speed - 1] * 0.8, 280) : 0;
    view.robot.style.transitionDuration = ms + 'ms';
    view.rotor.style.transitionDuration = ms + 'ms';
    view.robot.style.transform = `translate(${cx(world.x)}px,${cy(world.y)}px)`;
    view.rotor.style.transform = `rotate(${view.angle}deg)`;
  }
  const dirName = dir => w('dir_' + DIR_KEYS[dir]);
  function describeMap(level, st) {
    const rocks = [], gems = [];
    for (let y = 0; y < st.h; y++) {
      for (let x = 0; x < st.w; x++) {
        if (st.walls[y][x]) rocks.push(`(${x + 1},${y + 1})`);
        if (level.map[y][x] === '*') gems.push(`(${x + 1},${y + 1})`);
      }
    }
    return w('map_desc', st.w, st.h, st.start[0] + 1, st.start[1] + 1, dirName(st.dir), st.goal[0] + 1, st.goal[1] + 1,
      rocks.length ? rocks.join(' ') : w('none'), gems.length ? gems.join(' ') : w('none'));
  }
  function drawStage() {
    world = Core.createWorld(state.level);
    view = buildStage(world, PAL_SCREEN);
    const description = describeMap(state.level, world);
    view.svg.setAttribute('aria-label', description);
    $('stage').replaceChildren(view.svg);
    $('map-desc').textContent = description;
    placeRobot(false);
    updateStats();
  }
  const addTrail = () => s('circle', { cx: cx(world.x), cy: cy(world.y), r: 4, fill: view.pal.trail }, view.trail);

  /* ---------- status and stats ---------- */
  function setStatus(text, kind, speak) {
    const box = $('status');
    box.textContent = text;
    box.className = 'cq-status' + (kind ? ' ' + kind : '');
    if (speak !== false) $('live').textContent = text;
  }
  function statSpan(label, value) {
    const span = h('span');
    span.append(document.createTextNode(label + ' '), h('b', '', value));
    return span;
  }
  function updateStats() {
    const best = progress[state.level.id];
    const stats = $('stats');
    stats.replaceChildren(statSpan(w('st_robot'), w('pos', world.x + 1, world.y + 1, dirName(world.dir))), statSpan(w('st_steps'), String(world.steps)));
    if (world.totalGems) stats.append(statSpan(w('st_gems'), `${world.collected}/${world.totalGems}`));
    stats.append(statSpan(w('st_best'), best ? starText(best.stars) : w('not_done')));
    updateBlocksInfo();
  }
  function updateBlocksInfo() {
    const n = programBlockCount();
    const par = state.level.par;
    const preview = h('span', 'cq-stars', n > 0 ? starText(Core.starsFor(n, par)) : '');
    preview.title = w('star_rule', par, Math.ceil(par * 1.5));
    $('blocks-info').replaceChildren(statSpan(w('st_blocks'), String(n)), statSpan(w('st_par'), String(par)), preview);
  }

  /* ---------- highlighting and code text ---------- */
  let hlBlock = null;
  function clearHighlight() {
    if (hlBlock && hlBlock.getSvgRoot()) hlBlock.getSvgRoot().classList.remove('cq-running');
    hlBlock = null;
    $('code').querySelectorAll('.cq-line.on').forEach(line => line.classList.remove('on'));
  }
  function highlight(id) {
    if (!id) return;
    const block = ws.getBlockById(id);
    if (block && block.getSvgRoot()) { block.getSvgRoot().classList.add('cq-running'); hlBlock = block; }
    $('code').querySelectorAll('.cq-line').forEach(line => {
      if (line.dataset.id === id) { line.classList.add('on'); line.scrollIntoView({ block: 'nearest' }); }
    });
  }
  function updateCode() {
    $('codewrap').hidden = !prefs.code;
    $('btn-code').setAttribute('aria-pressed', String(prefs.code));
    $('fmt-js').setAttribute('aria-pressed', String(prefs.fmt === 'js'));
    $('fmt-pseudo').setAttribute('aria-pressed', String(prefs.fmt === 'pseudo'));
    if (!prefs.code) return;
    const pre = $('code');
    pre.replaceChildren();
    Core.codeLines(readProgram().prog, prefs.fmt, zh).forEach(line => {
      const span = h('span', 'cq-line', '  '.repeat(line.ind) + line.text);
      if (line.id) span.dataset.id = line.id;
      pre.append(span);
    });
  }

  /* ---------- run controller ---------- */
  function updateButtons() {
    $('btn-run').textContent = state.playing ? w('pause') : (sess && !sess.done ? w('resume') : w('run'));
    ['btn-slow', 'btn-startover', 'btn-solution', 'remove-last'].forEach(id => { $(id).disabled = state.playing; });
    $('build-btns').querySelectorAll('button').forEach(btn => { btn.disabled = state.playing; });
  }
  function pause() {
    state.playing = false;
    clearTimeout(timer);
    updateButtons();
  }
  function resetRun(message) {
    pause();
    sess = null;
    clearHighlight();
    $('result').hidden = true;
    drawStage();
    setStatus(message || w('ready'));
    updateButtons();
  }
  function startSession() {
    const read = readProgram();
    if (read.problems.length) { setStatus(w('prob_' + read.problems[0]), 'bad'); return false; }
    clearHighlight();
    $('result').hidden = true;
    drawStage();
    sess = { prog: read.prog, it: Core.run(read.prog, world), done: false, events: 0, concepts: Core.concepts(read.prog), count: Core.blockCount(read.prog) };
    return true;
  }
  const reqLabel = key => w('req_' + key);
  function finish(ev) {
    sess.done = true;
    pause();
    if (ev.type === 'fail') {
      view.body.setAttribute('stroke', view.pal.bad);
      s('text', { x: cx(world.x) + 12, y: cy(world.y) - 14, 'font-size': 22, fill: view.pal.bad, 'font-weight': 'bold', class: 'cq-flash', 'aria-hidden': 'true' }, view.marks, '!');
      if (ev.reason === 'wall') {
        const v = Core.DIRS[world.dir], ax = world.x + v[0], ay = world.y + v[1];
        if (ax >= 0 && ay >= 0 && ax < world.w && ay < world.h) {
          s('text', { x: cx(ax), y: cy(ay) + 9, 'text-anchor': 'middle', 'font-size': 28, fill: view.pal.bad, 'font-weight': 'bold', class: 'cq-flash', 'aria-hidden': 'true' }, view.marks, '✕');
        }
      }
      setStatus(w('fail_' + ev.reason, world.totalGems - world.collected), 'bad');
      return;
    }
    const missing = (state.level.require || []).filter(key => !sess.concepts.has(key));
    if (missing.length) {
      setStatus(w('need', missing.map(reqLabel).join(w('and'))), 'bad');
      return;
    }
    const stars = Core.starsFor(sess.count, state.level.par);
    const recorded = !state.solutionUsed && !state.classMode;
    if (recorded) {
      const prev = progress[state.level.id];
      progress[state.level.id] = { stars: prev ? Math.max(prev.stars, stars) : stars, blocks: prev && prev.blocks ? Math.min(prev.blocks, sess.count) : sess.count };
      store.set('progress', progress);
      renderMap();
      renderProgressStat();
    }
    $('result-text').textContent = w('res_win', sess.count, state.level.par) + (recorded ? '' : ' ' + (state.classMode ? w('res_class') : w('res_solution')));
    $('result-stars').textContent = starText(stars);
    $('result-stars').setAttribute('aria-label', w('stars_aria', stars));
    $('btn-result-next').textContent = levelIndex() === levels.length - 1 ? w('to_map') : w('next_level');
    $('result').hidden = false;
    setStatus(w('win') + ' ' + w('stars_aria', stars), 'ok');
    updateStats();
  }
  function stepOnce(auto) {
    if (!sess || sess.done) return;
    const result = sess.it.next();
    if (result.done) { sess.done = true; pause(); return; }
    const ev = result.value;
    sess.events++;
    lastEvent = ev;
    clearHighlight();
    highlight(ev.id);
    let text = '';
    switch (ev.type) {
      case 'action':
        if (ev.act === 'left') view.angle -= 90;
        if (ev.act === 'right') view.angle += 90;
        if (ev.act === 'collect') {
          const gem = view.gems.get(world.x + ',' + world.y);
          if (gem) gem.setAttribute('opacity', '0.15');
        }
        placeRobot(true);
        if (ev.act === 'move') addTrail();
        text = ev.act === 'move' ? w('ev_move', world.x + 1, world.y + 1)
          : ev.act === 'collect' ? w('ev_collect', world.collected, world.totalGems)
            : w('ev_' + ev.act, dirName(world.dir));
        break;
      case 'iter': text = w('ev_iter', ev.i, ev.n); break;
      case 'check': {
        const label = tr(Core.COND[ev.cond]);
        text = ev.loop ? w(ev.result ? 'ev_until_yes' : 'ev_until_no', label) : w(ev.result ? 'ev_if_yes' : 'ev_if_no', label);
        break;
      }
      case 'call': text = w('ev_call'); break;
      default: break;
    }
    updateStats();
    if (ev.type === 'fail' || ev.win) { finish(ev); return; }
    setStatus(text, '', !auto);
  }
  function delayFor() {
    const base = SPEEDS[prefs.speed - 1];
    if (sess.events > 60) return 25;
    return lastEvent && ['iter', 'check', 'call'].includes(lastEvent.type) ? base * 0.5 : base;
  }
  function tick() {
    if (!state.playing || !sess || sess.done) { pause(); return; }
    stepOnce(true);
    if (state.playing && sess && !sess.done) timer = setTimeout(tick, delayFor());
    else pause();
  }
  function play() {
    if (state.playing) { pause(); setStatus(w('paused')); return; }
    if (!sess || sess.done) { if (!startSession()) return; }
    state.playing = true;
    updateButtons();
    timer = setTimeout(tick, 80);
  }
  function stepButton() {
    if (state.playing) pause();
    if (!sess || sess.done) { if (!startSession()) return; }
    stepOnce(false);
    updateButtons();
  }
  function slowRun() {
    prefs.speed = 1;
    $('speed').value = '1';
    syncSpeed();
    if (state.playing) pause();
    sess = null;
    play();
  }
  function syncSpeed() {
    $('speed-out').textContent = w('speed' + prefs.speed);
    savePrefs();
  }

  /* ---------- level handling ---------- */
  function onProgramChanged() {
    if (loading) return;
    if (sess && !sess.done) resetRun(w('edited'));
    updateBlocksInfo();
    updateCode();
    updateBuilder();
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      if (state.classMode || state.solutionUsed) return;
      try {
        programs[state.level.id] = Blockly.serialization.workspaces.save(ws);
        store.set('programs', programs);
      } catch (e) { /* ignore */ }
    }, 400);
  }
  function openLevel(level, fresh) {
    pause();
    sess = null;
    state.level = level;
    state.solutionUsed = false;
    prefs.level = level.id;
    savePrefs();
    ws.updateToolbox(toolboxFor(level));
    if (fresh || state.classMode || !restoreSaved(level)) loadProgram(level.preload || null);
    $('hint-box').hidden = true;
    $('result').hidden = true;
    renderLevelText();
    renderBuildButtons();
    drawStage();
    clearHighlight();
    setStatus(w('ready'), '', false);
    updateButtons();
    updateCode();
    updateBuilder();
    renderMap();
    $('class-level').value = level.id;
  }
  const levelIndex = () => levels.indexOf(state.level);
  function goLevel(delta) {
    const next = levels[levelIndex() + delta];
    if (next) { setView('play'); openLevel(next, false); }
  }
  function renderLevelText() {
    const level = state.level;
    const unit = units.find(u => u.id === level.unit);
    $('level-kicker').textContent = w('unit_n', unit.id) + ' · ' + tr(unit.name) + ' · ' + w('level_n', level.id);
    const title = $('level-title');
    title.textContent = tr(level.name);
    if (level.debug) title.append(' ', h('span', 'cq-tag bug', w('debug_tag')));
    $('goal').textContent = tr(level.goal);
    const req = $('require');
    req.hidden = !(level.require && level.require.length);
    req.textContent = req.hidden ? '' : w('must_use', level.require.map(reqLabel).join(w('and')));
    $('hint-box').textContent = tr(level.hint);
    $('btn-prev').disabled = levelIndex() === 0;
    $('btn-next').disabled = levelIndex() === levels.length - 1;
  }

  /* ---------- keyboard-friendly builder ---------- */
  const startBlock = () => ws.getTopBlocks(false).find(b => b.type === 'cq_start');
  const defineBlock = () => ws.getTopBlocks(false).find(b => b.type === 'cq_define');
  function updateBuilder() {
    const select = $('target');
    const previous = select.value;
    select.replaceChildren();
    const start = startBlock();
    if (!start) return;
    const options = [{ value: JSON.stringify([start.id, null]), label: w('main_program') }];
    const def = defineBlock();
    if (def) options.push({ value: JSON.stringify([def.id, 'DO']), label: w('my_routine') });
    let index = 0;
    function walk(block, trail) {
      while (block) {
        const type = block.type.slice(3);
        if (type === 'repeat' || type === 'until' || type === 'if') {
          index++;
          const name = type === 'repeat' ? w('rep_n', block.getFieldValue('N')) : type === 'until' ? w('opt_until') : w('opt_if');
          const label = `${trail}${name} #${index}`;
          options.push({ value: JSON.stringify([block.id, 'DO']), label: label + (type === 'if' ? ' · ' + w('opt_do') : '') });
          walk(block.getInputTargetBlock('DO'), label + ' › ');
          if (type === 'if') {
            options.push({ value: JSON.stringify([block.id, 'ELSE']), label: label + ' · ' + w('opt_else') });
            walk(block.getInputTargetBlock('ELSE'), label + ' › ');
          }
        }
        block = block.getNextBlock();
      }
    }
    walk(start.getNextBlock(), '');
    if (def) walk(def.getInputTargetBlock('DO'), w('my_routine') + ' › ');
    options.forEach(item => {
      const option = h('option', '', item.label);
      option.value = item.value;
      select.append(option);
    });
    if (options.some(item => item.value === previous)) select.value = previous;
  }
  function targetLocation() {
    if (!$('target').value) return null;
    try {
      const [id, input] = JSON.parse($('target').value);
      const parent = ws.getBlockById(id);
      return parent ? { parent, input } : null;
    } catch (e) { return null; }
  }
  function tailOf(location) {
    let block = location.input ? location.parent.getInputTargetBlock(location.input) : location.parent.getNextBlock();
    if (!block) return null;
    while (block.getNextBlock()) block = block.getNextBlock();
    return block;
  }
  function addBlock(type) {
    if (state.playing) return;
    const location = targetLocation();
    if (!location) return;
    if (ws.getAllBlocks(false).length >= 100) { toast(w('prob_big')); return; }
    const node = { t: type };
    if (type === 'repeat') node.n = Math.min(10, Math.max(1, Math.round(Number($('times').value) || 1)));
    if (type === 'if' || type === 'until') node.c = $('cond').value || (type === 'until' ? 'GOAL' : 'PATH');
    const block = makeBlock(node);
    const last = tailOf(location);
    const connection = last ? last.nextConnection : location.input ? location.parent.getInput(location.input).connection : location.parent.nextConnection;
    connection.connect(block.previousConnection);
    updateBuilder();
    $('live').textContent = w('added', w('b_name_' + type));
  }
  function renderBuildButtons() {
    const box = $('build-btns');
    box.replaceChildren();
    const level = state.level;
    ['move', 'left', 'right', 'collect', 'repeat', 'until', 'if', 'def'].filter(type => level.blocks.includes(type)).forEach(type => {
      const real = type === 'def' ? 'call' : type;
      const btn = h('button', 'cmc-btn quiet', w('b_name_' + real));
      btn.type = 'button';
      btn.addEventListener('click', () => addBlock(real));
      box.append(btn);
    });
    const cond = $('cond');
    const chosen = cond.value;
    cond.replaceChildren();
    condOptions().forEach(([label, value]) => { const o = h('option', '', label); o.value = value; cond.append(o); });
    if (chosen) cond.value = chosen;
    $('wrap-cond').hidden = !(level.blocks.includes('if') || level.blocks.includes('until'));
    $('wrap-times').hidden = !level.blocks.includes('repeat');
  }

  /* ---------- map & progress ---------- */
  function totals() {
    const done = levels.filter(l => progress[l.id]).length;
    const stars = levels.reduce((sum, l) => sum + (progress[l.id] ? progress[l.id].stars : 0), 0);
    return { done, stars, max: levels.length * 3 };
  }
  function renderProgressStat() {
    const tot = totals();
    $('prog-stat').replaceChildren(statSpan(w('missions'), `${tot.done}/${levels.length}`), statSpan(w('st_stars'), `${tot.stars}/${tot.max}`));
  }
  function renderMap() {
    const tot = totals();
    $('map-stat').replaceChildren(statSpan(w('missions'), `${tot.done}/${levels.length}`), statSpan(w('st_stars'), `${tot.stars}/${tot.max}`));
    const box = $('map-units');
    box.replaceChildren();
    units.forEach(unit => {
      const group = levels.filter(l => l.unit === unit.id);
      const done = group.filter(l => progress[l.id]).length;
      const stars = group.reduce((sum, l) => sum + (progress[l.id] ? progress[l.id].stars : 0), 0);
      const card = h('section', 'cq-unit');
      const head = h('h3');
      head.append(h('span', '', w('unit_n', unit.id) + ' · ' + tr(unit.name)), h('span', '', `${done}/${group.length} · ★ ${stars}/${group.length * 3}`));
      card.append(head, h('p', 'cmc-sub', unit[zh ? 'zh' : 'en'].objective));
      const row = h('div', 'cq-nodes');
      group.forEach(level => {
        const p = progress[level.id];
        const btn = h('button', 'cq-node' + (p ? ' done' : ''));
        btn.type = 'button';
        btn.append(h('b', '', level.id), h('span', '', tr(level.name)), h('span', 'cq-stars', p ? starText(p.stars) : '☆☆☆'));
        if (level.debug) btn.append(h('span', 'cq-tag bug', w('debug_tag')));
        if (level === state.level) btn.setAttribute('aria-current', 'true');
        btn.setAttribute('aria-label', w('node_aria', level.id, tr(level.name), p ? w('node_done', p.stars) : w('node_todo')) + (level.debug ? ' ' + w('debug_tag') + '.' : ''));
        btn.addEventListener('click', () => { setView('play'); openLevel(level, false); });
        row.append(btn);
      });
      card.append(row);
      box.append(card);
    });
  }
  const firstTodo = () => levels.find(l => !progress[l.id]) || levels[levels.length - 1];

  /* ---------- teacher notes ---------- */
  const pseudoOf = level => Core.codeLines(level.solution, 'pseudo', zh).map(l => '  '.repeat(l.ind) + l.text).join('\n');
  function unitNotes(unit, forPrint) {
    const text = unit[zh ? 'zh' : 'en'];
    const root = h('div');
    const dl = h('dl');
    const add = (term, node) => { dl.append(h('dt', '', term)); const dd = h('dd'); dd.append(node); dl.append(dd); };
    const list = items => { const ul = h('ul'); items.forEach(x => ul.append(h('li', '', x))); return ul; };
    add(w('n_objective'), document.createTextNode(text.objective));
    const vocab = h('ul');
    text.vocab.forEach(([term, def]) => { const li = h('li'); li.append(h('b', '', term), document.createTextNode(' — ' + def)); vocab.append(li); });
    add(w('n_vocab'), vocab);
    add(w('n_warmup'), document.createTextNode(text.warmup));
    add(w('n_questions'), list(text.questions));
    add(w('n_mistakes'), list(text.mistakes));
    root.append(dl, h('h3', '', w('n_levels')));
    levels.filter(l => l.unit === unit.id).forEach(level => {
      const box = forPrint ? h('section') : h('details', 'cmc-details');
      const title = `${level.id} ${tr(level.name)} — ${w('st_par')} ${level.par}${level.debug ? ' · ' + w('debug_tag') : ''}`;
      box.append(forPrint ? h('h3', '', title) : h('summary', '', title));
      box.append(h('p', '', tr(level.goal)), h('p', '', w('hint') + ': ' + tr(level.hint)));
      if (level.preload) box.append(h('p', '', w('n_preload')));
      box.append(h('div', 'cmc-label', w('n_answer')), h('pre', 'cq-answer', pseudoOf(level)));
      if (!forPrint) {
        const open = h('button', 'cmc-btn quiet', w('open_level'));
        open.type = 'button';
        open.addEventListener('click', () => { setView('play'); openLevel(level, false); });
        box.append(open);
      }
      root.append(box);
    });
    return root;
  }
  function renderTeacher() {
    const chips = $('unit-chips');
    chips.replaceChildren();
    units.forEach(unit => {
      const chip = h('button', 'cmc-chip', w('unit_n', unit.id) + ' · ' + tr(unit.name));
      chip.type = 'button';
      chip.setAttribute('aria-pressed', String(unit.id === state.unit));
      chip.addEventListener('click', () => { state.unit = unit.id; prefs.unit = unit.id; savePrefs(); renderTeacher(); });
      chips.append(chip);
    });
    $('unit-notes').replaceChildren(unitNotes(units.find(u => u.id === state.unit), false));
    $('student').value = prefs.student;
    renderProgressStat();
  }

  /* ---------- printing ---------- */
  function printDoc(kind) {
    document.body.setAttribute('data-print', kind);
    try { window.print(); } catch (e) { toast(w('print_fail')); }
  }
  const CARDS = { move: 'card_move', left: 'card_left', right: 'card_right', collect: 'card_collect', repeat: 'card_repeat', until: 'card_until', if: 'card_if', def: 'card_call' };
  const COPIES = { move: 8, left: 4, right: 4, collect: 3, repeat: 3, until: 2, if: 3, def: 3 };
  function buildHuman(level) {
    const root = $('print-human');
    root.replaceChildren();
    const page = h('div');
    page.append(h('h1', '', w('hr_title', level.id, tr(level.name))), h('p', '', tr(level.goal)));
    const st = Core.createWorld(level);
    const stage = buildStage(st, PAL_PRINT);
    stage.robot.setAttribute('transform', `translate(${cx(st.x)},${cy(st.y)})`);
    stage.rotor.setAttribute('transform', `rotate(${st.dir * 90})`);
    stage.svg.setAttribute('aria-hidden', 'true');
    page.append(stage.svg, h('p', '', w('hr_key')));
    const block = (titleKey, keys, tag) => {
      const sec = h('section');
      const list = h(tag);
      keys.forEach(k => list.append(h('li', '', w(k))));
      sec.append(h('h2', '', w(titleKey)), list);
      return sec;
    };
    page.append(block('hr_setup', ['hr_s1', 'hr_s2', 'hr_s3', 'hr_s4'], 'ol'), block('hr_rules', ['hr_r1', 'hr_r2', 'hr_r3', 'hr_r4'], 'ul'), block('hr_discuss', ['hr_d1', 'hr_d2'], 'ul'));
    const cards = h('div', 'cq-cards');
    level.blocks.forEach(type => {
      for (let i = 0; i < COPIES[type]; i++) {
        const card = h('div', 'cq-card', w(CARDS[type]));
        card.append(h('small', '', w(CARDS[type] + '_s')));
        cards.append(card);
      }
    });
    root.append(page, cards);
  }
  const todayText = () => new Date().toLocaleDateString(zh ? 'zh-CN' : undefined);
  function buildCertificate() {
    const root = $('print-cert');
    root.replaceChildren();
    const tot = totals();
    const box = h('div', 'cq-cert');
    box.append(h('div', 'big', w('cert_title')), h('div', '', w('cert_this')), h('div', 'name', prefs.student.trim() || '\u00a0'), h('div', '', w('cert_text', tot.done, levels.length, tot.stars, tot.max)));
    box.append(h('div', '', units.map(u => `${tr(u.name)} ${levels.filter(l => l.unit === u.id && progress[l.id]).length}/${levels.filter(l => l.unit === u.id).length}`).join('  ·  ')));
    const sign = h('div', 'cq-sign');
    sign.append(h('span', '', w('cert_teacher')), h('span', '', w('cert_date') + ' ' + todayText()));
    box.append(sign);
    root.append(box);
  }
  function buildSummary() {
    const root = $('print-summary');
    root.replaceChildren(h('h1', '', w('sum_title')), h('p', '', (prefs.student.trim() ? prefs.student.trim() + ' · ' : '') + todayText()));
    const table = h('table');
    const head = h('tr');
    ['sum_level', 'sum_mission', 'sum_stars', 'sum_blocks'].forEach(k => head.append(h('th', '', w(k))));
    table.append(head);
    levels.forEach(level => {
      const p = progress[level.id];
      const row = h('tr');
      row.append(h('td', '', level.id), h('td', '', tr(level.name) + (level.debug ? ' (' + w('debug_tag') + ')' : '')), h('td', '', p ? starText(p.stars) : '—'), h('td', '', `${p && p.blocks ? p.blocks : '—'} / ${level.par}`));
      table.append(row);
    });
    const tot = totals();
    root.append(table, h('p', '', w('cert_text', tot.done, levels.length, tot.stars, tot.max)));
  }
  function buildNotes() {
    const unit = units.find(u => u.id === state.unit);
    $('print-notes').replaceChildren(h('h1', '', w('tab_title') + ': ' + w('unit_n', unit.id) + ' · ' + tr(unit.name)), unitNotes(unit, true));
  }

  /* ---------- export / import / reset ---------- */
  function exportProgress() {
    const data = { app: 'codequest', version: 1, exported: new Date().toISOString(), student: prefs.student, progress };
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a');
    const name = prefs.student.trim().replace(/[^\w\u4e00-\u9fff-]+/g, '_').slice(0, 30);
    link.href = url;
    link.download = 'codequest-progress' + (name ? '-' + name : '') + '.json';
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    toast(w('exported'));
  }
  function importProgress(file) {
    if (!file) return;
    if (file.size > 200000) { toast(w('import_bad')); return; }
    const reader = new FileReader();
    reader.onload = () => {
      let data;
      try { data = JSON.parse(String(reader.result)); } catch (e) { data = null; }
      if (!data || data.app !== 'codequest' || typeof data.progress !== 'object' || data.progress === null) { toast(w('import_bad')); return; }
      const clean = cleanProgress(data.progress);
      const count = Object.keys(clean).length;
      confirmDialog(w('import_confirm', count), () => {
        progress = clean;
        store.set('progress', progress);
        if (typeof data.student === 'string') { prefs.student = data.student.slice(0, 60); savePrefs(); }
        renderAll();
        toast(w('imported', count));
      });
    };
    reader.readAsText(file);
  }

  /* ---------- class mode ---------- */
  function readRoster() {
    try {
      const data = JSON.parse(localStorage.getItem('mc_classes'));
      if (!data || !Array.isArray(data.list)) return { list: [], active: '' };
      const list = data.list.filter(c => c && Array.isArray(c.names)).map(c => ({
        id: String(c.id), name: String(c.name || ''), names: c.names.map(n => String(n).trim()).filter(Boolean).slice(0, 200)
      })).filter(c => c.names.length);
      return { list, active: String(data.active) };
    } catch (e) { return { list: [], active: '' }; }
  }
  const pick = { bag: [], key: '', turn: 0, total: 0 };
  function fillRoster() {
    const roster = readRoster();
    const select = $('class-roster');
    select.replaceChildren();
    roster.list.forEach((c, i) => { const o = h('option', '', c.name || w('class_unnamed', i + 1)); o.value = c.id; select.append(o); });
    if (roster.list.some(c => c.id === roster.active)) select.value = roster.active;
    $('roster-wrap').hidden = roster.list.length < 2;
    $('size-wrap').hidden = roster.list.length > 0;
    return roster;
  }
  function pickStudent() {
    const roster = fillRoster();
    let names, key;
    if (roster.list.length) {
      const cls = roster.list.find(c => c.id === $('class-roster').value) || roster.list[0];
      names = cls.names;
      key = 'c:' + cls.id + ':' + names.join('|');
    } else {
      const size = Math.min(60, Math.max(2, Math.round(Number($('class-size').value) || 30)));
      names = Array.from({ length: size }, (_, i) => w('student_n', i + 1));
      key = 'n:' + size;
    }
    if (pick.key !== key || !pick.bag.length) {
      if (pick.key !== key) pick.turn = 0;
      pick.key = key;
      pick.bag = names.slice();
      for (let i = pick.bag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pick.bag[i], pick.bag[j]] = [pick.bag[j], pick.bag[i]];
      }
      pick.total = names.length;
      pick.turn = 0;
    }
    pick.turn++;
    $('pick-name').textContent = pick.bag.pop();
    $('pick-count').textContent = w('pick_count', pick.turn, pick.total);
  }
  function resetRound() {
    pick.bag = []; pick.key = ''; pick.turn = 0;
    $('pick-name').textContent = '—';
    $('pick-count').textContent = '';
  }
  function setClassMode(on) {
    state.classMode = on;
    document.body.classList.toggle('cmc-board', on);
    document.body.classList.toggle('cq-classmode', on);
    $('class-panel').hidden = !on;
    $('btn-class').setAttribute('aria-pressed', String(on));
    $('btn-class').textContent = on ? w('class_exit') : w('class_mode');
    if (on) { fillRoster(); setView('play'); $('builder').open = true; }
    openLevel(state.level, on);
    resizeSoon();
  }

  /* ---------- views, dialog, toast ---------- */
  function resizeSoon() { requestAnimationFrame(() => { if (ws) Blockly.svgResize(ws); }); }
  function setView(name) {
    state.view = name;
    $('view-play').hidden = name !== 'play';
    $('view-map').hidden = name !== 'map';
    $('view-teacher').hidden = name !== 'teacher';
    ['play', 'map', 'teacher'].forEach(v => $('tab-' + v).setAttribute('aria-pressed', String(v === name)));
    if (name === 'map') renderMap();
    if (name === 'teacher') renderTeacher();
    if (name === 'play') resizeSoon();
  }
  function confirmDialog(text, onOk) {
    lastFocus = document.activeElement;
    $('dialog-text').textContent = text;
    dialogOk = onOk;
    const dlg = $('dialog');
    if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
    $('dialog-cancel').focus();
  }
  function closeDialog() {
    const dlg = $('dialog');
    if (typeof dlg.close === 'function') dlg.close(); else dlg.removeAttribute('open');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function toast(text) {
    const box = $('toast');
    box.textContent = text;
    box.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { box.hidden = true; }, 3200);
  }

  /* ---------- static text, language ---------- */
  function applyStatic() {
    document.documentElement.lang = zh ? 'zh-Hans' : 'en';
    document.title = w('title_a') + ' ' + w('title_b');
    $('title-a').textContent = w('title_a');
    $('title-b').textContent = w('title_b');
    document.querySelectorAll('[data-w]').forEach(node => { node.textContent = w(node.dataset.w); });
    document.querySelectorAll('[data-wl]').forEach(node => { node.setAttribute('aria-label', w(node.dataset.wl)); });
    $('language').textContent = zh ? 'English' : '中文';
    $('btn-class').textContent = state.classMode ? w('class_exit') : w('class_mode');
    $('help1').textContent = w('help1');
    $('help2').textContent = w('help2');
    $('limits').textContent = w('limits', Core.LIMITS.actions);
    $('credit').firstChild.textContent = w('credit1') + ' ';
    $('credit').querySelector('a').textContent = w('credit_link');
    $('credit').lastChild.textContent = ' ' + w('credit2');
    $('speed').value = String(prefs.speed);
    syncSpeed();
    const select = $('class-level');
    select.replaceChildren();
    levels.forEach(l => { const o = h('option', '', `${l.id} · ${tr(l.name)}`); o.value = l.id; select.append(o); });
    select.value = state.level.id;
  }
  function renderAll() {
    applyStatic();
    renderLevelText();
    renderBuildButtons();
    renderMap();
    renderTeacher();
    drawStage();
    updateButtons();
    updateCode();
    updateBuilder();
  }
  function applyLanguage(lang) {
    if (lang !== 'en' && lang !== 'zh') return;
    zh = lang === 'zh';
    const saved = Blockly.serialization.workspaces.save(ws);
    Blockly.setLocale(zh ? chineseMessages : englishMessages);
    pause();
    sess = null;
    loading = true;
    ws.clear();
    Blockly.serialization.workspaces.load(saved, ws);
    releaseLoading();
    ws.updateToolbox(toolboxFor(state.level));
    renderAll();
    setStatus(w('lang_changed'));
    const url = new URL(location.href);
    url.searchParams.set('lang', lang);
    try { history.replaceState(null, '', url.href); } catch (e) { /* ignore */ }
  }

  /* ---------- events ---------- */
  function wire() {
    $('tab-play').addEventListener('click', () => setView('play'));
    $('tab-map').addEventListener('click', () => setView('map'));
    $('tab-teacher').addEventListener('click', () => setView('teacher'));
    $('btn-class').addEventListener('click', () => setClassMode(!state.classMode));
    $('language').addEventListener('click', () => applyLanguage(zh ? 'en' : 'zh'));
    $('btn-continue').addEventListener('click', () => { setView('play'); openLevel(firstTodo(), false); });
    $('btn-prev').addEventListener('click', () => goLevel(-1));
    $('btn-next').addEventListener('click', () => goLevel(1));
    $('btn-result-next').addEventListener('click', () => { if (levelIndex() === levels.length - 1) setView('map'); else goLevel(1); });
    $('btn-run').addEventListener('click', play);
    $('btn-step').addEventListener('click', stepButton);
    $('btn-reset').addEventListener('click', () => resetRun());
    $('btn-slow').addEventListener('click', slowRun);
    $('speed').addEventListener('input', () => { prefs.speed = Number($('speed').value); syncSpeed(); });
    $('btn-hint').addEventListener('click', () => { $('hint-box').hidden = !$('hint-box').hidden; });
    $('btn-startover').addEventListener('click', () => {
      pause(); sess = null; state.solutionUsed = false;
      loadProgram(state.level.preload || null);
      resetRun(w('ready'));
      setTimeout(onProgramChanged, 10);
    });
    $('btn-solution').addEventListener('click', () => confirmDialog(w('solution_confirm'), () => {
      pause(); sess = null;
      loadProgram(state.level.solution);
      state.solutionUsed = true;
      resetRun(w('solution_loaded'));
      setTimeout(() => { updateBlocksInfo(); updateCode(); updateBuilder(); }, 10);
    }));
    $('btn-code').addEventListener('click', () => { prefs.code = !prefs.code; savePrefs(); updateCode(); resizeSoon(); });
    $('fmt-js').addEventListener('click', () => { prefs.fmt = 'js'; savePrefs(); updateCode(); });
    $('fmt-pseudo').addEventListener('click', () => { prefs.fmt = 'pseudo'; savePrefs(); updateCode(); });
    $('btn-copy').addEventListener('click', () => {
      const text = [...$('code').querySelectorAll('.cq-line')].map(l => l.textContent).join('\n');
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(() => toast(w('copied')), () => toast(w('copy_fail')));
      else toast(w('copy_fail'));
    });
    $('remove-last').addEventListener('click', () => {
      if (state.playing) return;
      const location = targetLocation();
      const block = location && tailOf(location);
      if (block) block.dispose(false);
      updateBuilder();
    });
    $('class-level').addEventListener('change', () => openLevel(levelById($('class-level').value), true));
    $('btn-pick').addEventListener('click', pickStudent);
    $('btn-pick-reset').addEventListener('click', resetRound);
    $('class-roster').addEventListener('change', resetRound);
    const human = () => { buildHuman(state.level); printDoc('human'); };
    $('btn-print-human').addEventListener('click', human);
    $('btn-human-class').addEventListener('click', human);
    $('btn-print-notes').addEventListener('click', () => { buildNotes(); printDoc('notes'); });
    $('btn-cert').addEventListener('click', () => { buildCertificate(); printDoc('cert'); });
    $('btn-summary').addEventListener('click', () => { buildSummary(); printDoc('summary'); });
    $('student').addEventListener('input', () => { prefs.student = $('student').value.slice(0, 60); savePrefs(); });
    $('btn-export').addEventListener('click', exportProgress);
    $('btn-import').addEventListener('click', () => $('import-file').click());
    $('import-file').addEventListener('change', () => { importProgress($('import-file').files[0]); $('import-file').value = ''; });
    $('btn-reset-progress').addEventListener('click', () => confirmDialog(w('reset_confirm'), () => {
      progress = {}; programs = {};
      store.set('progress', progress);
      store.set('programs', programs);
      openLevel(state.level, true);
      renderAll();
      toast(w('reset_done'));
    }));
    $('dialog-cancel').addEventListener('click', () => { dialogOk = null; closeDialog(); });
    $('dialog').addEventListener('cancel', () => { dialogOk = null; });
    $('dialog-ok').addEventListener('click', () => { const fn = dialogOk; dialogOk = null; closeDialog(); if (fn) fn(); });
    document.addEventListener('keydown', event => {
      if (event.ctrlKey || event.metaKey || event.altKey || event.defaultPrevented) return;
      const target = event.target;
      if (target.closest && target.closest('input,textarea,select,[contenteditable="true"],.blocklySvg,.blocklyWidgetDiv,.blocklyDropDownDiv,dialog')) return;
      const key = event.key.toLowerCase();
      const onControl = target.closest && target.closest('button,a,summary');
      if (key === ' ') { if (!onControl && state.view === 'play') { event.preventDefault(); play(); } }
      else if (key === 'r') { if (state.view === 'play') resetRun(); }
      else if (key === 'n') goLevel(1);
      else if (key === 'p') goLevel(-1);
      else if (key === 's') { if (state.view === 'play') stepButton(); }
      else if (key === 'm') setView(state.view === 'map' ? 'play' : 'map');
    });
    window.addEventListener('message', event => {
      if (event.origin !== location.origin || event.source !== window.parent || !event.data || event.data.type !== 'cmc-language') return;
      applyLanguage(event.data.lang);
    });
    window.addEventListener('storage', event => { if (event.key === 'mc_classes' && state.classMode) fillRoster(); });
    const resizeObserver = new ResizeObserver(() => Blockly.svgResize(ws));
    resizeObserver.observe($('workspace'));
    window.addEventListener('pagehide', event => {
      pause();
      if (event.persisted) return;
      resizeObserver.disconnect();
      ws.dispose();
    });
    window.addEventListener('pageshow', event => { if (event.persisted) resizeSoon(); });
  }

  /* ---------- start ---------- */
  function initialize() {
    registerBlocks();
    ws = Blockly.inject('workspace', {
      media: '../lib/blockly/media/', toolbox: toolboxFor(state.level), theme: makeTheme(), renderer: 'zelos',
      trashcan: true, scrollbars: true, sounds: false, zoom: { controls: true, wheel: true, startScale: 0.9, minScale: 0.45, maxScale: 1.6 }
    });
    ws.addChangeListener(event => { if (!event.isUiEvent) onProgramChanged(); });
    wire();
    applyStatic();
    openLevel(state.level, false);
    renderAll();
    setStatus(w('ready'), '', false);
  }
  function boot() {
    englishMessages = { ...Blockly.Msg };
    const script = document.createElement('script');
    script.src = '../lib/blockly/msg/zh-hans.js';
    let failed = false;
    const go = () => {
      chineseMessages = failed ? englishMessages : { ...Blockly.Msg };
      Blockly.setLocale(zh ? chineseMessages : englishMessages);
      initialize();
      if (failed) setStatus(w('msg_missing'), 'bad');
    };
    script.onload = go;
    script.onerror = () => { failed = true; go(); };
    document.head.append(script);
  }
  boot();
})();
