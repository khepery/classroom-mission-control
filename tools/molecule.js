(() => {
  'use strict';
  let zh = new URLSearchParams(location.search).get('lang') === 'zh';
  const words = {
    title: ['Molecule Explorer', '分子探索'],
    intro: ['Rotate illustrative 3D molecules, measure bonds and angles, predict shapes, compare molecules and run a quick quiz. Everything runs offline.', '旋转示意性三维分子，测量键长和键角，先预测形状，对比分子，还可进行快速小测。全部离线运行。'],
    modes: ['Mode', '模式'], modeExplore: ['Explore', '探索'], modePredict: ['Predict first', '先猜后揭晓'], modeQuiz: ['Quiz', '小测'], modeCompare: ['Compare', '对比'],
    projector: ['Projector mode', '投影模式'], pick: ['Pick a student', '随机点名'],
    library: ['Molecule library', '分子库'], search: ['Search', '搜索'], searchPh: ['Name, formula…', '名称、化学式…'],
    topics: ['Topics', '主题'], all: ['All', '全部'], shown: ['{n} of {t} molecules', '显示 {n} / {t} 个分子'], noMatch: ['No molecule matches.', '没有匹配的分子。'],
    prev: ['Prev', '上一个'], next: ['Next', '下一个'],
    style: ['Style', '显示样式'], ballstick: ['Ball and stick', '球棍模型'], sphere: ['Space-filling spheres', '空间填充模型'], stick: ['Sticks', '棍状模型'],
    labels: ['Labels', '元素标签'], bondLengths: ['Bond lengths', '键长'], measure: ['Measure', '测量'], spin: ['Auto-rotate', '自动旋转'],
    rotate: ['Rotate', '旋转'], left: ['Left', '向左'], right: ['Right', '向右'], up: ['Up', '向上'], down: ['Down', '向下'],
    zoom: ['Zoom', '缩放'], reset: ['Reset view', '重置视图'],
    snapshot: ['Save PNG', '保存图片'], copy: ['Copy summary', '复制摘要'], print: ['Print fact sheet', '打印资料卡'],
    copied: ['Summary copied.', '摘要已复制。'], copyFail: ['Could not copy automatically.', '无法自动复制。'], snapSaved: ['PNG saved.', '图片已保存。'], snapFail: ['Could not save the image.', '无法保存图片。'],
    atomsTitle: ['Atoms', '原子'],
    selectAtom: ['Click an atom in the view or press an atom button above. In Measure mode choose 2 atoms for a distance, 3 for an angle (the middle one is the vertex).', '在视图中点击原子，或按上方的原子按钮。测量模式下：选 2 个原子得到距离，选 3 个原子得到夹角（第 2 个为顶点）。'],
    measureHint: ['Measure mode: choose 2 atoms for a distance, 3 for an angle.', '测量模式：选 2 个原子得到距离，选 3 个得到夹角。'],
    measureMore: ['Choose another atom.', '请再选一个原子。'],
    atomInfo: ['Atom {n} · {name} ({sym}) · ({x}, {y}, {z}) Å', '原子 {n} · {name}（{sym}）· ({x}, {y}, {z}) Å'],
    distance: ['Distance {a}–{b}: {d} Å', '距离 {a}–{b}：{d} Å'],
    angle: ['Angle {a}–{b}–{c}: {t}° (distances {d1} Å and {d2} Å)', '夹角 {a}–{b}–{c}：{t}°（距离 {d1} Å 和 {d2} Å）'],
    legend: ['Atom colours', '原子颜色'],
    helpTitle: ['Keyboard shortcuts and lesson ideas', '键盘快捷键与教学建议'], lessonsTitle: ['Lesson ideas', '教学建议'],
    noteLabel: ['Model note', '模型说明'],
    modelNote: ['Illustrative molecular coordinates; these models are for learning, not experimental analysis. Distances are in ångströms (Å).', '示意性分子坐标，仅供学习，不用于实验分析。距离单位为埃（Å）。'],
    powered: ['Powered by local 3Dmol.js 2.5.5.', '使用本地 3Dmol.js 2.5.5。'], license: ['License', '许可证'],
    sideLabel: ['Molecule information', '分子信息'],
    // info card
    formula: ['Formula', '化学式'], molarMass: ['Molar mass', '摩尔质量'], atomCount: ['Atoms', '原子数'], bondCount: ['Bonds', '化学键'],
    bondTypes: ['Bond types', '键的类型'], shape: ['Shape (VSEPR)', '形状（VSEPR）'], bondAngle: ['Bond angle', '键角'], polarity: ['Polarity', '极性'],
    regions: ['Electron regions', '价层电子对'], uses: ['Where it is used', '用途与存在'], fact: ['Fun fact', '趣味知识'], safety: ['Safety', '安全提示'],
    polar: ['Polar', '极性分子'], nonpolar: ['Non-polar', '非极性分子'], angleNA: ['None (only two atoms)', '无（只有两个原子）'],
    single: ['single', '单键'], double: ['double', '双键'], triple: ['triple', '三键'],
    bnp: ['non-polar bond', '非极性键'], bwp: ['weakly polar bond', '弱极性键'], bp: ['polar bond', '极性键'],
    regionsText: ['Central atom: {b} bonding regions + {l} lone pair(s)', '中心原子：{b} 个成键电子区 + {l} 对孤对电子'],
    whyPolar: ['Polar bonds in an asymmetrical shape: the bond dipoles do not cancel, so one end is slightly negative (δ−) and the other slightly positive (δ+).', '极性键且形状不对称：键的偶极不能抵消，一端略带负电（δ−），另一端略带正电（δ+）。'],
    whySame: ['Both atoms are the same element (or the molecule is symmetric), so the electrons are shared equally and there are no charged ends.', '成键原子相同（或分子对称），电子被均匀共享，没有带电的两端。'],
    whyCancel: ['Its bonds have some polarity, but the symmetrical shape makes the bond dipoles cancel out.', '各键有一定极性，但对称的形状使键的偶极相互抵消。'],
    teacherTitle: ['Teacher prompts and answers', '教师提问与答案'],
    tq1: ['How many atoms are in one molecule of {name}, and which elements are they?', '一个{name}分子含有多少个原子？分别是哪些元素？'],
    ta1: ['{n} atoms: {comp}.', '{n} 个原子：{comp}。'],
    tq2: ['Predict, then measure with the Measure tool: what is the bond angle?', '先预测，再用“测量”工具量一量：键角是多少？'],
    tq3: ['Measure the bond. Is it a single, double or triple bond, and how long is it?', '测量这个键：它是单键、双键还是三键？键长是多少？'],
    ta3: ['{o} bond, {l} Å.', '{o}，{l} Å。'],
    tq4: ['Is it polar or non-polar? Explain using shape and bond polarity.', '它有极性吗？请结合形状和键的极性解释。'],
    tq5: ['Where do we meet it in everyday life?', '日常生活中哪里能遇到它？'],
    // predict
    predictTitle: ['Predict first', '先预测'], predictPrompt: ['What shape is this molecule, and is it polar?', '这个分子是什么形状？有极性吗？'],
    guessShape: ['Shape guess', '形状猜测'], guessPolar: ['Polarity guess', '极性猜测'], choose: ['— choose —', '— 请选择 —'],
    reveal: ['Reveal', '揭晓'], randomMol: ['Random molecule', '随机分子'], hiddenNote: ['The name, 3D model and facts are hidden until you reveal them.', '揭晓之前，名称、三维模型和资料都会隐藏。'],
    resShape: ['Shape: you said {g}; actual {a}.', '形状：你猜的是{g}；实际是{a}。'], resPolar: ['Polarity: you said {g}; actual {a}.', '极性：你猜的是{g}；实际是{a}。'],
    noGuess: ['no guess', '未作答'], predictAgain: ['Next molecule', '下一个分子'],
    sk_linear: ['Linear', '直线形'], sk_bent: ['Bent (V-shaped)', 'V 形（弯曲形）'], sk_planar: ['Flat (trigonal planar)', '平面形（平面三角形）'],
    sk_pyramidal: ['Trigonal pyramidal', '三角锥形'], sk_tetra: ['Tetrahedral', '四面体形'], sk_other: ['Chain, ring or mixed', '链状、环状或混合形'],
    // quiz
    quizTitle: ['Quick quiz', '快速小测'], quizIntro: ['Questions use the 3D model on the left. Press 1–4 to answer, N or Enter for the next question.', '题目基于左侧的三维模型。按 1–4 作答，按 N 或 Enter 进入下一题。'],
    quizStart: ['Start quiz', '开始小测'], quizLength: ['Questions', '题数'], quizTopic: ['Topic', '主题'],
    qNum: ['Question {i} of {n}', '第 {i} / {n} 题'], score: ['Score {s}', '得分 {s}'],
    qName: ['Which molecule is this?', '这是哪种分子？'], qFormula: ['Which formula matches this model?', '哪个化学式与这个模型相符？'],
    qPolar: ['Is {name} ({formula}) polar or non-polar?', '{name}（{formula}）是极性分子还是非极性分子？'],
    qShape: ['What is the shape of {name} ({formula})?', '{name}（{formula}）是什么形状？'],
    correct: ['Correct!', '正确！'], wrong: ['Not quite. The answer is {a}.', '不对，答案是 {a}。'],
    explain: ['{name} ({formula}): {shape}; {pol}.', '{name}（{formula}）：{shape}；{pol}。'],
    nextQ: ['Next question', '下一题'], finish: ['See results', '查看结果'], summary: ['Quiz results', '小测结果'],
    scoreOf: ['{s} / {n} correct ({p}%)', '答对 {s} / {n} 题（{p}%）'], best: ['Best score with {n} questions: {b}', '{n} 题的最高分：{b}'],
    msgHigh: ['Excellent work!', '太棒了！'], msgMid: ['Good effort. Review the ones you missed.', '不错。请复习做错的题目。'], msgLow: ['Keep exploring the models, then try again.', '继续观察模型，然后再试一次。'],
    again: ['Try again', '再来一次'], backExplore: ['Back to Explore', '返回探索'], copyResults: ['Copy results', '复制结果'],
    yourAns: ['you chose {a}', '你选了 {a}'], resultsCopied: ['Results copied.', '结果已复制。'],
    // compare
    compareTitle: ['Compare two molecules', '对比两种分子'], cmpA: ['Molecule A (current)', '分子 A（当前）'], cmpB: ['Molecule B', '分子 B'],
    property: ['Property', '项目'], cmpHint: ['Highlighted rows differ between the two molecules.', '高亮的行表示两种分子在该项上不同。'],
    // teacher tools
    pickTitle: ['Your turn:', '轮到：'], pickAgain: ['Pick again', '再抽一个'], close: ['Close', '关闭'],
    classLabel: ['Class: {c}', '班级：{c}'], noRoster: ['No class list found. Add students in the hub first.', '未找到班级名单。请先在主页中添加学生。'],
    sheetTitle: ['Molecule fact sheet', '分子资料卡'], worksheetTitle: ['Predict worksheet', '预测练习单'],
    wsShape: ['Shape', '形状'], wsPolar: ['Polar or non-polar', '极性或非极性'], wsName: ['Name', '名称'], wsWhy: ['Reason', '理由'],
    sheetFoot: ['Illustrative coordinates, for learning. Made with Classroom Mission Control.', '示意性坐标，仅供学习。由 Classroom Mission Control 生成。'],
    flatNote: ['A flat preview is shown instead; the library, facts, measuring, predict mode, quiz and compare still work.', '已改用平面预览；分子库、资料、测量、先猜后揭晓、小测和对比仍可使用。'],
    flatLabel: ['Flat preview of {name}; use the atom buttons and rotate controls', '{name}的平面预览；可使用原子按钮和旋转控件'],
    viewLabel: ['Interactive 3D model of {name}; use the nearby controls to rotate, zoom and identify atoms', '{name}的交互式三维模型；可使用附近的控件旋转、缩放和识别原子'],
    viewHidden: ['Interactive 3D molecule', '交互式三维分子'],
  };
  const keyList = [
    ['← → ↑ ↓', ['Rotate the molecule', '旋转分子']], ['+ / −', ['Zoom in / out', '放大 / 缩小']], ['N / P', ['Next / previous molecule', '下一个 / 上一个分子']],
    ['L', ['Element labels', '元素标签']], ['B', ['Bond lengths', '键长']], ['M', ['Measure mode', '测量模式']], ['R', ['Auto-rotate', '自动旋转']],
    ['S', ['Save PNG', '保存图片']], ['F', ['Projector mode', '投影模式']], ['G', ['Pick a student', '随机点名']], ['/', ['Search the library', '搜索分子库']],
    ['Enter', ['Reveal (Predict mode) or next question (Quiz)', '揭晓（先猜后揭晓）或下一题（小测）']], ['1–4', ['Answer a quiz question', '回答小测题目']]
  ];
  const lessons = [
    ['Predict, then reveal: choose Predict first, show only the formula, ask the class to vote on shape and polarity, then reveal.', '先猜后揭晓：选择“先猜后揭晓”，只显示化学式，让全班投票猜形状和极性，然后揭晓。'],
    ['Same formula type, different shape: compare CO₂ and H₂O. Water has two lone pairs on oxygen that push the bonds into a bent shape, so its dipoles do not cancel; CO₂ has none, so it is linear and non-polar.', '化学式类型相同、形状不同：对比 CO₂ 与 H₂O。水分子中氧原子有两对孤对电子，把键推成 V 形，偶极不能抵消；CO₂ 没有孤对电子，呈直线形，是非极性分子。'],
    ['Lone pairs squeeze angles: compare methane (109.5°), ammonia (107°) and water (104.5°) with the Measure tool.', '孤对电子压缩键角：用测量工具比较甲烷（109.5°）、氨（107°）和水（104.5°）。'],
    ['Single, double, triple: measure C–C in ethane (1.54 Å), C=C in ethene (1.34 Å) and C≡C in ethyne (1.20 Å). More shared pairs means a shorter bond.', '单键、双键、三键：测量乙烷 C–C（1.54 Å）、乙烯 C=C（1.34 Å）和乙炔 C≡C（1.20 Å）。共用电子对越多，键越短。'],
    ['Finish with a 5-question quiz, then discuss the questions the class got wrong.', '最后做一个 5 题小测，再讨论全班答错的题目。']
  ];
  const text = (key, vars) => {
    let s = words[key][zh ? 1 : 0];
    if (vars) Object.keys(vars).forEach(k => { s = s.split('{' + k + '}').join(vars[k]); });
    return s;
  };
  const pair = p => p[zh ? 1 : 0];
  const el = id => document.getElementById(id);
  const SUB = '₀₁₂₃₄₅₆₇₈₉';
  const subs = f => f.replace(/\d/g, d => SUB[d]);
  const ELEMENTS = {
    H: { mass: 1.008, en: 2.20, color: '#ffffff', vdw: 1.2, name: ['hydrogen', '氢'] },
    C: { mass: 12.011, en: 2.55, color: '#909090', vdw: 1.7, name: ['carbon', '碳'] },
    N: { mass: 14.007, en: 3.04, color: '#3050f8', vdw: 1.55, name: ['nitrogen', '氮'] },
    O: { mass: 15.999, en: 3.44, color: '#ff0d0d', vdw: 1.52, name: ['oxygen', '氧'] },
    P: { mass: 30.974, en: 2.19, color: '#ff8000', vdw: 1.8, name: ['phosphorus', '磷'] },
    S: { mass: 32.06, en: 2.58, color: '#ffff30', vdw: 1.8, name: ['sulfur', '硫'] },
    Cl: { mass: 35.45, en: 3.16, color: '#1ff01f', vdw: 1.75, name: ['chlorine', '氯'] }
  };
  const colorMap = {};
  Object.keys(ELEMENTS).forEach(k => { colorMap[k] = ELEMENTS[k].color; });
  const elName = sym => ELEMENTS[sym] ? pair(ELEMENTS[sym].name) : sym;
  const SHAPE_KEYS = ['linear', 'bent', 'planar', 'pyramidal', 'tetra', 'other'];
  const MOLS = window.CMC_MOLECULES || [];
  const GROUPS = window.CMC_MOLECULE_GROUPS || [];
  const byId = id => MOLS.find(m => m.id === id) || MOLS[0];

  const KEY = 'mc_tool_molecule_';
  const store = {
    get(name, fallback) { try { const v = localStorage.getItem(KEY + name); return v === null ? fallback : JSON.parse(v); } catch (e) { return fallback; } },
    set(name, value) { try { localStorage.setItem(KEY + name, JSON.stringify(value)); } catch (e) { /* storage unavailable */ } }
  };
  const prefs = store.get('prefs', {}) || {};
  const state = {
    mode: 'explore', group: ['all'].concat(GROUPS.map(g => g[0])).includes(prefs.group) ? prefs.group : 'all', query: '',
    id: MOLS.some(m => m.id === prefs.id) ? prefs.id : 'h2o', cmpB: MOLS.some(m => m.id === prefs.cmpB) ? prefs.cmpB : 'co2',
    style: ['ballstick', 'sphere', 'stick'].includes(prefs.style) ? prefs.style : 'ballstick',
    labels: !!prefs.labels, lengths: !!prefs.lengths, measure: false, spin: false, board: !!prefs.board,
    revealed: false, guess: { shape: '', polar: '' }, sel: [], quiz: null, quizLen: prefs.quizLen === 10 ? 10 : 5, quizTopic: 'all',
    zoom: 1, yaw: 20, pitch: -15
  };
  const savePrefs = () => store.set('prefs', { group: state.group, id: state.id, cmpB: state.cmpB, style: state.style, labels: state.labels, lengths: state.lengths, board: state.board, quizLen: state.quizLen });

  const BASE_ZOOM = 1.3;
  let viewer = null, model = null, loadedId = null, flatTimer = 0, toastTimer = 0;

  // ---------- molecule data helpers ----------
  const cache = new Map();
  function prep(m) {
    if (cache.has(m.id)) return cache.get(m.id);
    const atoms = m.atoms.split('\n').map(line => { const p = line.split(' '); return { el: p[0], x: +p[1], y: +p[2], z: +p[3] }; });
    const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
    const bonds = m.bonds.map(s => {
      const parts = s.split(':'), ij = parts[0].split('-').map(Number);
      return { i: ij[0], j: ij[1], o: parts[1] ? +parts[1] : 1, len: dist(atoms[ij[0]], atoms[ij[1]]) };
    });
    const mass = atoms.reduce((sum, a) => sum + ELEMENTS[a.el].mass, 0);
    const groups = {};
    bonds.forEach(b => {
      const pair2 = [atoms[b.i].el, atoms[b.j].el].sort((a, c) => ELEMENTS[a].en - ELEMENTS[c].en || a.localeCompare(c));
      // Write X–H with H last (C–H, O–H) except in hydrogen halides (H–Cl).
      if (pair2.includes('H') && pair2.some(x => x !== 'H' && x !== 'Cl')) pair2.sort((x, y) => (x === 'H') - (y === 'H'));
      const key = pair2.join('-') + b.o;
      const g = groups[key] || (groups[key] = { a: pair2[0], b: pair2[1], o: b.o, n: 0, sum: 0, diff: Math.abs(ELEMENTS[pair2[0]].en - ELEMENTS[pair2[1]].en) });
      g.n += 1; g.sum += b.len;
    });
    const p = { atoms, bonds, mass, groups: Object.keys(groups).map(k => groups[k]), dist };
    cache.set(m.id, p);
    return p;
  }
  const bondSym = o => (o === 3 ? '≡' : o === 2 ? '=' : '–');
  const bondPolarKey = diff => (diff < 0.05 ? 'bnp' : diff < 0.5 ? 'bwp' : 'bp');
  const composition = m => {
    const counts = {};
    prep(m).atoms.forEach(a => { counts[a.el] = (counts[a.el] || 0) + 1; });
    return Object.keys(counts).map(k => `${counts[k]} ${elName(k)} (${k})`).join(zh ? '、' : ', ');
  };
  const nameOf = m => pair(m.name);
  const polarityLabel = m => text(m.polar ? 'polar' : 'nonpolar');
  function polarWhy(m) {
    if (m.polarWhy) return pair(m.polarWhy);
    if (m.polar) return text('whyPolar');
    return prep(m).groups.every(g => g.diff < 0.05) ? text('whySame') : text('whyCancel');
  }
  function bondSummary(m) {
    return prep(m).groups.map(g => {
      const avg = (g.sum / g.n).toFixed(2);
      return `${g.a}${bondSym(g.o)}${g.b} ×${g.n} · ${text(['single', 'double', 'triple'][g.o - 1])} · ${text(bondPolarKey(g.diff))} · ${avg} Å`;
    });
  }
  function factRows(m) {
    const p = prep(m);
    const rows = [
      ['formula', text('formula'), subs(m.formula)],
      ['mass', text('molarMass'), p.mass.toFixed(2) + ' g/mol'],
      ['atoms', text('atomCount'), `${p.atoms.length} (${composition(m)})`],
      ['bonds', text('bondCount'), String(p.bonds.length)],
      ['types', text('bondTypes'), bondSummary(m).join('; ')],
      ['shape', text('shape'), pair(m.shape)],
      ['angle', text('bondAngle'), m.angle || text('angleNA')],
      ['polarity', text('polarity'), polarityLabel(m)]
    ];
    if (m.regions) rows.push(['regions', text('regions'), text('regionsText', { b: m.regions[0], l: m.regions[1] })]);
    rows.push(['uses', text('uses'), pair(m.uses)]);
    return rows;
  }
  function summaryText(m) {
    const lines = [`${m.name[0]} (${m.name[1]}) · ${subs(m.formula)}`];
    factRows(m).slice(1).forEach(r => { if (r[0] !== 'polarity') lines.push(`${r[1]}: ${r[2]}`); });
    lines.push(`${text('polarity')}: ${polarityLabel(m)} — ${polarWhy(m)}`);
    lines.push(`${text('fact')}: ${pair(m.fact)}`);
    if (m.warn) lines.push(`${text('safety')}: ${pair(m.warn)}`);
    lines.push(text('modelNote'));
    return lines.join('\n');
  }
  function molBlock(m) {
    const p = prep(m), pad = (v, n) => String(v).padStart(n);
    const out = [m.id, '  CMC', '', `${pad(p.atoms.length, 3)}${pad(p.bonds.length, 3)}  0  0  0  0  0  0  0  0999 V2000`];
    p.atoms.forEach(a => out.push(`${pad(a.x.toFixed(4), 10)}${pad(a.y.toFixed(4), 10)}${pad(a.z.toFixed(4), 10)} ${a.el.padEnd(3)} 0  0  0  0  0  0  0  0  0  0  0  0`));
    p.bonds.forEach(b => out.push(`${pad(b.i + 1, 3)}${pad(b.j + 1, 3)}${pad(b.o, 3)}  0`));
    out.push('M  END');
    return out.join('\n');
  }

  // ---------- small DOM helpers ----------
  function h(tag, props, ...kids) {
    const node = document.createElement(tag);
    Object.keys(props || {}).forEach(k => {
      if (k === 'class') node.className = props[k];
      else if (k === 'text') node.textContent = props[k];
      else if (k === 'on') Object.keys(props.on).forEach(ev => node.addEventListener(ev, props.on[ev]));
      else if (props[k] !== false && props[k] !== undefined) node.setAttribute(k, props[k] === true ? '' : props[k]);
    });
    kids.flat().forEach(kid => { if (kid !== null && kid !== undefined && kid !== false) node.append(kid.nodeType ? kid : document.createTextNode(kid)); });
    return node;
  }
  function toast(message) {
    const t = el('toast');
    t.textContent = message;
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.hidden = true; }, 2600);
  }
  const shuffle = arr => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  // ---------- which molecule is on screen ----------
  const quizActive = () => state.mode === 'quiz' && state.quiz && state.quiz.qs && !state.quiz.done;
  const shownId = () => (quizActive() ? state.quiz.qs[state.quiz.i].id : state.id);
  const shown = () => byId(shownId());
  const covered = () => state.mode === 'predict' && !state.revealed;
  const nameHidden = () => covered() || (quizActive() && state.quiz.qs[state.quiz.i].type === 'name' && !state.quiz.answered);
  const viewLabel = () => {
    const m = shown();
    const label = nameHidden() ? text('viewHidden') : text(viewer ? 'viewLabel' : 'flatLabel', { name: nameOf(m) });
    el('viewer').setAttribute('aria-label', label);
    el('flat').setAttribute('aria-label', label);
  };

  // ---------- overlays: labels, bond lengths, selection, measurements ----------
  function overlayData() {
    const m = shown(), p = prep(m), o = { labels: [], lines: [], marks: [] };
    const mid = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, z: (a.z + b.z) / 2 });
    if (state.labels) p.atoms.forEach((a, i) => { if (!state.sel.includes(i)) o.labels.push({ pos: a, text: a.el, kind: 'el' }); });
    if (state.lengths) p.bonds.forEach(b => o.labels.push({ pos: mid(p.atoms[b.i], p.atoms[b.j]), text: b.len.toFixed(2) + ' Å', kind: 'len' }));
    state.sel.forEach(i => { o.marks.push(i); o.labels.push({ pos: p.atoms[i], text: p.atoms[i].el + (i + 1), kind: 'sel' }); });
    if (state.measure && state.sel.length >= 2) {
      const s = state.sel.map(i => p.atoms[i]);
      for (let k = 0; k < s.length - 1; k++) {
        o.lines.push([s[k], s[k + 1]]);
        o.labels.push({ pos: mid(s[k], s[k + 1]), text: p.dist(s[k], s[k + 1]).toFixed(2) + ' Å', kind: 'meas' });
      }
      if (s.length === 3) {
        const v = s[1], u1 = unit(s[0], v), u2 = unit(s[2], v);
        const bis = unit({ x: u1.x + u2.x, y: u1.y + u2.y, z: u1.z + u2.z }, { x: 0, y: 0, z: 0 });
        o.labels.push({ pos: { x: v.x + bis.x * 0.6, y: v.y + bis.y * 0.6, z: v.z + bis.z * 0.6 }, text: angleOf(s[0], v, s[2]).toFixed(1) + '°', kind: 'meas' });
      }
    }
    return o;
  }
  function unit(a, b) {
    const d = { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z }, n = Math.hypot(d.x, d.y, d.z) || 1;
    return { x: d.x / n, y: d.y / n, z: d.z / n };
  }
  function angleOf(a, v, c) {
    const u = unit(a, v), w = unit(c, v);
    return Math.acos(Math.max(-1, Math.min(1, u.x * w.x + u.y * w.y + u.z * w.z))) * 180 / Math.PI;
  }
  const markRadius = a => ({ ballstick: ELEMENTS[a.el].vdw * 0.28 + 0.2, sphere: ELEMENTS[a.el].vdw * 1.12, stick: 0.36 }[state.style]);
  function overlays() {
    if (viewer) {
      const o = overlayData(), p = prep(shown());
      viewer.removeAllLabels();
      viewer.removeAllShapes();
      o.marks.forEach(i => viewer.addSphere({ center: p.atoms[i], radius: markRadius(p.atoms[i]), color: '#ffb23e', alpha: 0.4 }));
      o.lines.forEach(l => viewer.addLine({ start: l[0], end: l[1], color: '#ffb23e', dashed: true, dashLength: 0.15, gapLength: 0.1, linewidth: 2 }));
      o.labels.forEach(l => viewer.addLabel(l.text, {
        position: l.pos, alignment: 'center', inFront: true, fontSize: l.kind === 'el' ? 14 : 13,
        fontColor: l.kind === 'len' ? '#62d3ff' : l.kind === 'el' ? '#ffffff' : '#ffb23e',
        backgroundColor: '#06090d', backgroundOpacity: l.kind === 'el' ? 0.45 : 0.8, showBackground: true,
        borderColor: l.kind === 'el' ? '#06090d' : l.kind === 'len' ? '#62d3ff' : '#ffb23e', borderThickness: l.kind === 'el' ? 0 : 1
      }));
      viewer.render();
    } else renderFlat();
  }

  // ---------- flat SVG fallback (used when WebGL is unavailable) ----------
  const NS = 'http://www.w3.org/2000/svg';
  const sv = (tag, attrs, parent) => {
    const n = document.createElementNS(NS, tag);
    Object.keys(attrs).forEach(k => n.setAttribute(k, attrs[k]));
    if (parent) parent.append(n);
    return n;
  };
  function renderFlat() {
    const svg = el('flat');
    if (svg.hidden) return;
    const m = shown(), p = prep(m), o = overlayData();
    const ay = state.yaw * Math.PI / 180, ax = state.pitch * Math.PI / 180;
    const radius = Math.max(...p.atoms.map(a => Math.hypot(a.x, a.y, a.z))) + 0.9;
    const S = 125 / radius * state.zoom;
    const pts = p.atoms.map(a => {
      const x1 = a.x * Math.cos(ay) + a.z * Math.sin(ay), z1 = -a.x * Math.sin(ay) + a.z * Math.cos(ay);
      const y2 = a.y * Math.cos(ax) - z1 * Math.sin(ax), z2 = a.y * Math.sin(ax) + z1 * Math.cos(ax);
      return { x: x1 * S, y: -y2 * S, z: z2 };
    });
    const project = pos => {
      const i = p.atoms.indexOf(pos);
      if (i >= 0) return pts[i];
      const x1 = pos.x * Math.cos(ay) + pos.z * Math.sin(ay), z1 = -pos.x * Math.sin(ay) + pos.z * Math.cos(ay);
      return { x: x1 * S, y: -(pos.y * Math.cos(ax) - z1 * Math.sin(ax)) * S, z: 0 };
    };
    svg.replaceChildren();
    const items = [];
    p.bonds.forEach(b => items.push({ z: (pts[b.i].z + pts[b.j].z) / 2 - 0.01, draw: g => {
      const A = pts[b.i], B = pts[b.j], dx = B.x - A.x, dy = B.y - A.y, len = Math.hypot(dx, dy) || 1, nx = -dy / len, ny = dx / len;
      const offs = b.o === 1 ? [0] : b.o === 2 ? [-3.5, 3.5] : [-5.5, 0, 5.5];
      offs.forEach(off => {
        const mx = (A.x + B.x) / 2, my = (A.y + B.y) / 2;
        sv('line', { x1: A.x + nx * off, y1: A.y + ny * off, x2: mx + nx * off, y2: my + ny * off, stroke: ELEMENTS[p.atoms[b.i].el].color, 'stroke-width': b.o === 1 ? 5 : 3, 'stroke-linecap': 'round' }, g);
        sv('line', { x1: mx + nx * off, y1: my + ny * off, x2: B.x + nx * off, y2: B.y + ny * off, stroke: ELEMENTS[p.atoms[b.j].el].color, 'stroke-width': b.o === 1 ? 5 : 3, 'stroke-linecap': 'round' }, g);
      });
    } }));
    p.atoms.forEach((a, i) => items.push({ z: pts[i].z, draw: g => {
      const r = Math.max(8, ELEMENTS[a.el].vdw * (state.style === 'sphere' ? 1 : state.style === 'stick' ? 0.12 : 0.28) * S * 0.9);
      const c = sv('circle', { cx: pts[i].x, cy: pts[i].y, r, fill: ELEMENTS[a.el].color, stroke: '#000', 'stroke-opacity': 0.5, 'data-atom': i }, g);
      c.addEventListener('click', () => onAtom(i));
      sv('circle', { cx: pts[i].x - r * 0.3, cy: pts[i].y - r * 0.3, r: r * 0.3, fill: '#fff', 'fill-opacity': 0.28, 'pointer-events': 'none' }, g);
      if (state.sel.includes(i)) sv('circle', { cx: pts[i].x, cy: pts[i].y, r: r + 5, fill: 'none', stroke: '#ffb23e', 'stroke-width': 3, 'pointer-events': 'none' }, g);
    } }));
    items.sort((a, b) => a.z - b.z).forEach(it => it.draw(svg));
    o.lines.forEach(l => { const A = project(l[0]), B = project(l[1]); sv('line', { x1: A.x, y1: A.y, x2: B.x, y2: B.y, stroke: '#ffb23e', 'stroke-width': 2, 'stroke-dasharray': '6 5' }, svg); });
    o.labels.forEach(l => {
      const P = project(l.pos), color = l.kind === 'len' ? '#62d3ff' : l.kind === 'el' ? '#ffffff' : '#ffb23e';
      const t = sv('text', { x: P.x, y: P.y, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': 13, 'font-family': 'Share Tech Mono, monospace', fill: color, stroke: '#06090d', 'stroke-width': 3, 'paint-order': 'stroke', 'pointer-events': 'none' }, svg);
      t.textContent = l.text;
    });
  }
  function flatLoop() {
    cancelAnimationFrame(flatTimer);
    if (viewer || !state.spin) return;
    state.yaw = (state.yaw + 0.8) % 360;
    renderFlat();
    flatTimer = requestAnimationFrame(flatLoop);
  }

  // ---------- 3D viewer ----------
  function applyStyle() {
    if (!viewer) return;
    const coloring = { colorscheme: { prop: 'elem', map: colorMap } };
    const styles = {
      ballstick: { sphere: { ...coloring, scale: 0.28 }, stick: { ...coloring, radius: 0.12 } },
      sphere: { sphere: coloring },
      stick: { stick: { ...coloring, radius: 0.17 } }
    };
    viewer.setStyle({}, styles[state.style]);
  }
  function resetView() {
    state.zoom = 1; state.yaw = 20; state.pitch = -15;
    el('zoom').value = '1';
    el('zoom-value').textContent = '1.0×';
    if (viewer) {
      viewer.zoomTo();
      viewer.zoom(BASE_ZOOM);
      // zoomTo preserves rotation; restore the initial quaternion for a true reset.
      const view = viewer.getView();
      view[4] = 0; view[5] = 0; view[6] = 0; view[7] = 1;
      viewer.setView(view);
      viewer.render();
    } else renderFlat();
  }
  function loadMolecule() {
    const m = shown();
    if (viewer) {
      viewer.removeAllLabels();
      viewer.removeAllShapes();
      viewer.removeAllModels();
      model = viewer.addModel(molBlock(m), 'sdf');
      if (!model.selectedAtoms({}).length) throw new Error('The local molecule has no atoms');
      model.setClickable({}, true, atom => onAtom(atom.index));
      applyStyle();
    }
    resetView();
    overlays();
  }
  function fail3d(error) {
    console.error(error);
    if (viewer) { try { viewer.spin(false); viewer.clear(); } catch (e) { /* already unusable */ } }
    viewer = null; model = null;
    el('viewer').hidden = true;
    el('flat').hidden = false;
    el('error').hidden = false;
    el('error').textContent = errorText();
    el('style').disabled = true;
    renderFlat();
    flatLoop();
    viewLabel();
  }
  const errorText = () => (zh ? '无法显示三维分子。请启用 WebGL，检查本地库文件，并尝试重新加载或使用其他浏览器。' : 'Unable to display the 3D molecule. Enable WebGL, check the local library files, and try reloading or using another browser.') + ' ' + text('flatNote');
  const safely = fn => (...args) => { try { fn(...args); } catch (error) { fail3d(error); } };

  // ---------- atoms, selection and readout ----------
  function onAtom(i) {
    if (i === undefined || i === null) return;
    if (!state.measure) state.sel = [i];
    else if (state.sel.includes(i)) state.sel = state.sel.filter(x => x !== i);
    else { if (state.sel.length >= 3) state.sel = []; state.sel.push(i); }
    overlays();
    renderAtoms();
  }
  function readoutText() {
    const p = prep(shown()), s = state.sel;
    const nm = i => p.atoms[i].el + (i + 1);
    if (!s.length) return text(state.measure ? 'measureHint' : 'selectAtom');
    const a = p.atoms[s[0]];
    if (s.length === 1 || !state.measure) {
      return text('atomInfo', { n: s[0] + 1, name: elName(a.el), sym: a.el, x: a.x.toFixed(3), y: a.y.toFixed(3), z: a.z.toFixed(3) }) + (state.measure ? ' ' + text('measureMore') : '');
    }
    const d = (i, j) => p.dist(p.atoms[i], p.atoms[j]).toFixed(2);
    if (s.length === 2) return text('distance', { a: nm(s[0]), b: nm(s[1]), d: d(s[0], s[1]) });
    return text('angle', { a: nm(s[0]), b: nm(s[1]), c: nm(s[2]), t: angleOf(p.atoms[s[0]], p.atoms[s[1]], p.atoms[s[2]]).toFixed(1), d1: d(s[0], s[1]), d2: d(s[1], s[2]) });
  }
  function renderAtoms() {
    const p = prep(shown());
    el('atoms').replaceChildren(...p.atoms.map((a, i) => h('button', {
      type: 'button', class: 'cmc-chip', 'aria-pressed': state.sel.includes(i) ? 'true' : 'false',
      title: `${elName(a.el)} (${a.el})`, 'aria-label': `${i + 1}: ${elName(a.el)} (${a.el})`,
      text: `${i + 1} ${a.el}`, on: { click: () => onAtom(i) }
    })));
    el('readout').textContent = readoutText();
    const present = new Set(p.atoms.map(a => a.el));
    el('legend').replaceChildren(h('span', { class: 'cmc-label', text: text('legend') }), ...Object.keys(ELEMENTS).map(sym => h('span', { class: present.has(sym) ? 'on' : '' },
      h('i', { class: 'mol-swatch', style: `background:${ELEMENTS[sym].color}` }), `${sym}: ${elName(sym)}`)));
  }

  // ---------- library ----------
  const norm = s => s.toLowerCase().replace(/[₀-₉]/g, d => String(SUB.indexOf(d)));
  function filtered() {
    const q = norm(state.query.trim());
    return MOLS.filter(m => (state.group === 'all' || m.group === state.group) &&
      (!q || [m.id, m.formula, m.name[0], m.name[1]].some(s => norm(s).includes(q))));
  }
  function renderLibrary() {
    el('groups').replaceChildren(...[['all', words.all]].concat(GROUPS).map(g => h('button', {
      type: 'button', class: 'cmc-chip', 'aria-pressed': state.group === g[0] ? 'true' : 'false',
      text: pair(g[1]), on: { click: () => { state.group = g[0]; savePrefs(); renderLibrary(); } }
    })));
    const list = filtered(), hideNames = covered();
    el('list').replaceChildren(...list.map(m => h('li', {}, h('button', {
      type: 'button', class: 'mol-item', 'aria-current': m.id === state.id ? 'true' : 'false',
      on: { click: () => choose(m.id) }
    }, h('span', { text: hideNames ? '?' : nameOf(m) }), h('b', { text: subs(m.formula) })))));
    el('count').textContent = list.length ? text('shown', { n: list.length, t: MOLS.length }) : text('noMatch');
  }
  function choose(id) {
    state.id = id; state.revealed = false; state.guess = { shape: '', polar: '' };
    savePrefs();
    sync();
  }
  function step(dir) {
    if (quizActive()) return;
    const list = filtered().length ? filtered() : MOLS;
    const at = list.findIndex(m => m.id === state.id);
    choose(list[(at + dir + list.length) % list.length].id);
  }

  // ---------- side panel ----------
  function infoCard(m) {
    const rows = factRows(m).slice(1);
    const dl = h('dl', { class: 'mol-facts' });
    rows.forEach(r => {
      if (r[0] === 'mass' || r[0] === 'atoms' || r[0] === 'bonds') return;
      const value = r[0] === 'polarity' ? h('span', {}, h('span', { class: 'mol-tag' + (m.polar ? '' : ' np'), text: r[2] }), ' ', polarWhy(m))
        : r[0] === 'types' ? h('span', {}, ...bondSummary(m).flatMap((t, i) => [i ? h('br') : null, t])) : r[2];
      dl.append(h('dt', { text: r[1] }), h('dd', {}, value));
    });
    dl.append(h('dt', { text: text('fact') }), h('dd', { text: pair(m.fact) }));
    const p = prep(m);
    return [
      h('div', {}, h('div', { class: 'mol-formula', text: subs(m.formula) }),
        h('p', { class: 'mol-name' }, nameOf(m), h('small', { text: pair([m.name[1], m.name[0]]) }))),
      h('div', { class: 'cmc-stat' }, h('span', {}, text('molarMass') + ' ', h('b', { text: p.mass.toFixed(2) + ' g/mol' })),
        h('span', {}, text('atomCount') + ' ', h('b', { text: p.atoms.length })), h('span', {}, text('bondCount') + ' ', h('b', { text: p.bonds.length }))),
      m.warn ? h('div', { class: 'cmc-note warn' }, h('b', { text: text('safety') }), pair(m.warn)) : null,
      dl, teacherNotes(m)
    ].filter(Boolean);
  }
  function teacherNotes(m) {
    const p = prep(m), n = nameOf(m);
    const items = [[text('tq1', { name: n }), text('ta1', { n: p.atoms.length, comp: composition(m) })]];
    if (m.angle) items.push([text('tq2'), m.angle]);
    else items.push([text('tq3'), text('ta3', { o: text(['single', 'double', 'triple'][p.bonds[0].o - 1]), l: p.bonds[0].len.toFixed(2) })]);
    items.push([text('tq4'), polarWhy(m)], [text('tq5'), pair(m.uses)]);
    return h('details', { class: 'cmc-details' }, h('summary', { text: text('teacherTitle') }),
      h('ol', { class: 'mol-prompts' }, ...items.map(it => h('li', {}, it[0], h('br'), h('i', { text: '→ ' + it[1] })))));
  }
  function renderSide() {
    const side = el('side'), m = byId(state.id);
    side.setAttribute('aria-label', text('sideLabel'));
    if (state.mode === 'quiz') return side.replaceChildren(...quizPanel());
    if (state.mode === 'compare') return side.replaceChildren(...comparePanel());
    if (covered()) {
      return side.replaceChildren(h('h2', { text: text('predictTitle') }), h('p', { text: text('hiddenNote') }),
        h('div', { class: 'cmc-note' }, h('b', { text: text('predictTitle') }), text('predictPrompt')));
    }
    const out = [];
    if (state.mode === 'predict') out.push(predictResult(m));
    side.replaceChildren(...out.concat(infoCard(m)));
  }
  function predictResult(m) {
    const g = state.guess, label = key => (key ? text('sk_' + key) : text('noGuess'));
    const polarGuess = g.polar === '' ? text('noGuess') : text(g.polar === 'polar' ? 'polar' : 'nonpolar');
    const okShape = g.shape === m.shapeKey, okPolar = (g.polar === 'polar') === m.polar && g.polar !== '';
    return h('div', { class: 'cmc-note' }, h('b', { text: text('predictTitle') }),
      h('span', { class: okShape ? 'cmc-ok' : 'cmc-bad', text: (okShape ? '✓ ' : '✗ ') + text('resShape', { g: label(g.shape), a: text('sk_' + m.shapeKey) }) }), h('br'),
      h('span', { class: okPolar ? 'cmc-ok' : 'cmc-bad', text: (okPolar ? '✓ ' : '✗ ') + text('resPolar', { g: polarGuess, a: polarityLabel(m) }) }), h('br'),
      h('button', { type: 'button', class: 'cmc-btn primary', style: 'margin-top:8px', text: text('predictAgain'), on: { click: randomMolecule } }));
  }
  function randomMolecule() {
    const list = filtered().filter(x => x.id !== state.id), pool = list.length ? list : MOLS.filter(x => x.id !== state.id);
    choose(pool[Math.floor(Math.random() * pool.length)].id);
  }
  function renderCover() {
    const cover = el('cover');
    cover.hidden = !covered();
    if (cover.hidden) return;
    const m = byId(state.id);
    const select = (labelKey, key, options) => h('label', { class: 'cmc-field-row' }, h('span', { class: 'cmc-label', text: text(labelKey) }),
      h('select', { class: 'cmc-field', on: { change: e => { state.guess[key] = e.target.value; } } },
        h('option', { value: '', text: text('choose') }), ...options.map(o => h('option', { value: o[0], text: o[1], selected: state.guess[key] === o[0] }))));
    cover.replaceChildren(h('div', { class: 'cmc-label', text: text('predictTitle') }), h('div', { class: 'mol-formula', text: subs(m.formula) }),
      h('p', { text: text('predictPrompt') }),
      h('div', { class: 'mol-guess' }, select('guessShape', 'shape', SHAPE_KEYS.map(k => [k, text('sk_' + k)])), select('guessPolar', 'polar', [['polar', text('polar')], ['nonpolar', text('nonpolar')]])),
      h('div', { class: 'cmc-bar', style: 'justify-content:center' },
        h('button', { type: 'button', class: 'cmc-btn primary', id: 'reveal', text: text('reveal'), on: { click: reveal } }),
        h('button', { type: 'button', class: 'cmc-btn quiet', text: text('randomMol'), on: { click: randomMolecule } })));
  }
  function reveal() { state.revealed = true; sync(); }

  // ---------- compare ----------
  function comparePanel() {
    const A = byId(state.id), B = byId(state.cmpB);
    const sel = h('select', { class: 'cmc-field', id: 'cmp-b', on: { change: e => { state.cmpB = e.target.value; savePrefs(); renderSide(); } } },
      ...MOLS.map(m => h('option', { value: m.id, selected: m.id === state.cmpB, text: `${nameOf(m)} · ${subs(m.formula)}` })));
    const ra = factRows(A), rb = factRows(B);
    const head = h('tr', {}, h('th', { text: text('property') }), h('th', { text: nameOf(A) }), h('th', { text: nameOf(B) }));
    const body = ra.map((r, i) => h('tr', { class: r[2] !== rb[i][2] ? 'hit' : '' }, h('th', { scope: 'row', text: r[1] }), h('td', { text: r[2] }), h('td', { text: rb[i][2] })));
    return [h('h2', { text: text('compareTitle') }),
      h('div', { class: 'cmc-note' }, h('b', { text: text('cmpA') }), `${nameOf(A)} · ${subs(A.formula)}`),
      h('label', { class: 'cmc-field-row' }, h('span', { class: 'cmc-label', text: text('cmpB') }), sel),
      h('div', { class: 'mol-table-wrap' }, h('table', { class: 'cmc-table mol-table' }, h('thead', {}, head), h('tbody', {}, ...body))),
      h('p', { class: 'cmc-label', text: text('cmpHint') })];
  }

  // ---------- quiz ----------
  const QUIZ_TYPES = ['name', 'formula', 'polar', 'shape'];
  function quizPool() {
    const pool = MOLS.filter(m => state.quizTopic === 'all' || m.group === state.quizTopic);
    return pool.length >= 4 ? pool : MOLS;
  }
  function buildQuiz() {
    const pool = quizPool(), all = MOLS, qs = [];
    const ids = shuffle(pool.map(m => m.id));
    let types = shuffle(QUIZ_TYPES), t = 0;
    for (let k = 0; k < state.quizLen; k++) {
      let id = ids[k % ids.length], type = types[t++ % types.length];
      if (type === 'shape' && byId(id).shapeKey === 'other') {
        const alt = ids.find(x => byId(x).shapeKey !== 'other' && !qs.some(q => q.id === x && q.type === 'shape'));
        if (alt) id = alt; else type = 'name';
      }
      const q = { type, id };
      const m = byId(id), size = prep(m).atoms.length;
      if (type === 'name' || type === 'formula') {
        const others = shuffle(pool.length >= 4 ? pool : all).filter(x => x.id !== id && (type === 'name' || x.formula !== m.formula))
          .sort((a, b) => Math.abs(prep(a).atoms.length - size) - Math.abs(prep(b).atoms.length - size) + (Math.random() - 0.5) * 3).slice(0, 3);
        q.options = shuffle([m].concat(others)).map(x => x.id);
        q.correct = id;
      } else if (type === 'polar') { q.options = ['polar', 'nonpolar']; q.correct = m.polar ? 'polar' : 'nonpolar'; }
      else { q.options = shuffle([m.shapeKey].concat(shuffle(SHAPE_KEYS.filter(s => s !== m.shapeKey && s !== 'other')).slice(0, 3))); q.correct = m.shapeKey; }
      qs.push(q);
    }
    state.quiz = { qs, i: 0, score: 0, answered: false, picks: [], done: false };
  }
  const optionLabel = (q, key) => (q.type === 'name' ? nameOf(byId(key)) : q.type === 'formula' ? subs(byId(key).formula) : q.type === 'polar' ? text(key) : text('sk_' + key));
  function quizPanel() {
    const q = state.quiz;
    if (!q) {
      return [h('h2', { text: text('quizTitle') }), h('p', { text: text('quizIntro') }),
        h('label', { class: 'cmc-field-row' }, h('span', { class: 'cmc-label', text: text('quizLength') }),
          h('select', { class: 'cmc-field', on: { change: e => { state.quizLen = +e.target.value; savePrefs(); } } },
            ...[5, 10].map(n => h('option', { value: n, text: n, selected: n === state.quizLen })))),
        h('label', { class: 'cmc-field-row' }, h('span', { class: 'cmc-label', text: text('quizTopic') }),
          h('select', { class: 'cmc-field', on: { change: e => { state.quizTopic = e.target.value; } } },
            h('option', { value: 'all', text: text('all') }), ...GROUPS.map(g => h('option', { value: g[0], text: pair(g[1]), selected: state.quizTopic === g[0] })))),
        h('button', { type: 'button', class: 'cmc-btn primary', id: 'quiz-start', text: text('quizStart'), on: { click: () => { buildQuiz(); sync(); } } })];
    }
    if (q.done) return quizSummary();
    const cur = q.qs[q.i], m = byId(cur.id);
    const prompt = cur.type === 'name' ? text('qName') : cur.type === 'formula' ? text('qFormula') : text(cur.type === 'polar' ? 'qPolar' : 'qShape', { name: nameOf(m), formula: subs(m.formula) });
    const opts = cur.options.map((key, k) => {
      const cls = !q.answered ? '' : key === cur.correct ? ' ok' : key === q.picks[q.i] ? ' bad' : '';
      return h('button', { type: 'button', class: 'cmc-btn mol-opt' + cls, disabled: q.answered, on: { click: () => answer(key) } }, h('kbd', { text: k + 1 }), optionLabel(cur, key));
    });
    const out = [h('div', { class: 'cmc-stat' }, h('b', { text: text('qNum', { i: q.i + 1, n: q.qs.length }) }), h('span', { text: text('score', { s: q.score }) })),
      h('h2', { text: prompt }), h('div', { class: 'mol-opts' }, ...opts)];
    if (q.answered) {
      const ok = q.picks[q.i] === cur.correct;
      out.push(h('div', { class: 'cmc-note ' + (ok ? '' : 'warn'), role: 'status' },
        h('b', { class: ok ? 'cmc-ok' : 'cmc-bad', text: ok ? text('correct') : text('wrong', { a: optionLabel(cur, cur.correct) }) }),
        text('explain', { name: nameOf(m), formula: subs(m.formula), shape: pair(m.shape), pol: polarityLabel(m) })),
        h('button', { type: 'button', class: 'cmc-btn primary', id: 'quiz-next', text: text(q.i + 1 < q.qs.length ? 'nextQ' : 'finish'), on: { click: nextQuestion } }));
    }
    return out;
  }
  function answer(key) {
    const q = state.quiz;
    if (!q || q.answered) return;
    q.picks[q.i] = key;
    q.answered = true;
    if (key === q.qs[q.i].correct) q.score += 1;
    sync();
  }
  function nextQuestion() {
    const q = state.quiz;
    if (!q || !q.answered) return;
    if (q.i + 1 < q.qs.length) { q.i += 1; q.answered = false; } else {
      q.done = true;
      const best = store.get('best', {}) || {};
      q.prevBest = best[q.qs.length] || 0;
      if (q.score > q.prevBest) { best[q.qs.length] = q.score; store.set('best', best); }
    }
    sync();
  }
  function resultsText() {
    const q = state.quiz;
    const lines = [`${text('summary')}: ${text('scoreOf', { s: q.score, n: q.qs.length, p: Math.round(100 * q.score / q.qs.length) })}`];
    q.qs.forEach((c, i) => {
      const m = byId(c.id), ok = q.picks[i] === c.correct;
      lines.push(`${i + 1}. ${ok ? '✓' : '✗'} ${nameOf(m)} (${subs(m.formula)})` + (ok ? '' : ` — ${text('yourAns', { a: optionLabel(c, q.picks[i]) })}; ${optionLabel(c, c.correct)}`));
    });
    return lines.join('\n');
  }
  function quizSummary() {
    const q = state.quiz, pct = Math.round(100 * q.score / q.qs.length);
    const best = Math.max(q.prevBest || 0, q.score);
    const rows = q.qs.map((c, i) => {
      const m = byId(c.id), ok = q.picks[i] === c.correct;
      return h('tr', { class: ok ? '' : 'hit' }, h('td', { text: i + 1 }), h('td', { text: `${nameOf(m)} (${subs(m.formula)})` }),
        h('td', { class: ok ? 'cmc-ok' : 'cmc-bad', text: ok ? '✓' : '✗ ' + text('yourAns', { a: optionLabel(c, q.picks[i]) }) }));
    });
    return [h('h2', { text: text('summary') }), h('div', { class: 'mol-formula', text: text('scoreOf', { s: q.score, n: q.qs.length, p: pct }), style: 'font-size:1.3rem' }),
      h('p', { text: text(pct >= 90 ? 'msgHigh' : pct >= 60 ? 'msgMid' : 'msgLow') }), h('p', { class: 'cmc-label', text: text('best', { n: q.qs.length, b: best }) }),
      h('div', { class: 'mol-table-wrap' }, h('table', { class: 'cmc-table mol-table' }, h('tbody', {}, ...rows))),
      h('div', { class: 'cmc-bar' },
        h('button', { type: 'button', class: 'cmc-btn primary', text: text('again'), on: { click: () => { state.quiz = null; sync(); } } }),
        h('button', { type: 'button', class: 'cmc-btn cyan', text: text('copyResults'), on: { click: () => copyText(resultsText(), text('resultsCopied')) } }),
        h('button', { type: 'button', class: 'cmc-btn quiet', text: text('backExplore'), on: { click: () => setMode('explore') } }))];
  }

  // ---------- teacher tools ----------
  function copyText(value, done) {
    const fallback = () => {
      const area = h('textarea', { style: 'position:fixed;left:-999px;top:0', 'aria-hidden': 'true' });
      area.value = value;
      document.body.append(area);
      area.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      area.remove();
      toast(ok ? done : text('copyFail'));
    };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(value).then(() => toast(done), fallback);
    else fallback();
  }
  function snapshotURL() {
    if (viewer) return Promise.resolve(viewer.pngURI());
    return new Promise((resolve, reject) => {
      const svg = el('flat').cloneNode(true);
      svg.setAttribute('xmlns', NS);
      svg.setAttribute('width', 800); svg.setAttribute('height', 600);
      svg.removeAttribute('hidden');
      const bg = sv('rect', { x: -200, y: -150, width: 400, height: 300, fill: '#06090d' });
      svg.insertBefore(bg, svg.firstChild);
      const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml' }));
      const img = new Image();
      img.onload = () => {
        const canvas = h('canvas', { width: 800, height: 600 });
        canvas.getContext('2d').drawImage(img, 0, 0, 800, 600);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('snapshot')); };
      img.src = url;
    });
  }
  function savePng() {
    snapshotURL().then(url => {
      const a = h('a', { href: url, download: `molecule-${shown().id}.png` });
      document.body.append(a);
      a.click();
      a.remove();
      toast(text('snapSaved'));
    }).catch(() => toast(text('snapFail')));
  }
  function printSheet() {
    const m = shown(), sheet = el('sheet'), worksheet = covered();
    const blank = () => h('span', { class: 'line' }, ' ');
    const rows = worksheet
      ? [[text('wsName'), blank()], [text('wsShape'), blank()], [text('wsPolar'), blank()], [text('wsWhy'), h('div', { style: 'height:60pt' })]]
      : factRows(m).slice(1).concat([[text('fact'), pair(m.fact)]]).map(r => [r[1], r[2]]);
    if (!worksheet && m.warn) rows.push([text('safety'), pair(m.warn)]);
    const build = picture => {
      sheet.replaceChildren(h('h1', { text: worksheet ? text('worksheetTitle') : `${nameOf(m)} · ${subs(m.formula)}` }),
        h('div', { style: 'font-size:12pt;color:#444', text: worksheet ? subs(m.formula) : `${text('sheetTitle')} · ${pair([m.name[1], m.name[0]])}` }),
        picture, h('table', {}, h('tbody', {}, ...rows.map(r => h('tr', {}, h('th', { text: r[0] }), h('td', {}, r[1]))))),
        h('p', { style: 'font-size:9pt;color:#555;margin-top:10pt', text: `${text('modelNote')} ${text('sheetFoot')}` }));
      window.print();
    };
    if (worksheet) return build(null);
    snapshotURL().then(url => build(h('img', { src: url, alt: '' })), () => build(null));
  }
  function roster() {
    try {
      const data = JSON.parse(localStorage.getItem('mc_classes'));
      const list = data && Array.isArray(data.list) ? data.list : [];
      const cls = list.find(c => c && c.id === data.active && Array.isArray(c.names) && c.names.length) || list.find(c => c && Array.isArray(c.names) && c.names.length);
      if (!cls) return null;
      const names = cls.names.filter(n => typeof n === 'string' && n.trim());
      return names.length ? { name: String(cls.name || ''), names } : null;
    } catch (e) { return null; }
  }
  let lastPick = '';
  function pickStudent() {
    const r = roster();
    if (!r) { toast(text('noRoster')); return; }
    let name = r.names[Math.floor(Math.random() * r.names.length)];
    if (r.names.length > 1 && name === lastPick) name = r.names[(r.names.indexOf(name) + 1) % r.names.length];
    lastPick = name;
    const card = el('pick-card');
    card.hidden = false;
    card.replaceChildren(h('div', { class: 'cmc-label', text: text('pickTitle') + (r.name ? ' · ' + text('classLabel', { c: r.name }) : '') }), h('div', { class: 'big', text: name }),
      h('div', { class: 'cmc-bar', style: 'justify-content:center;margin-top:6px' },
        h('button', { type: 'button', class: 'cmc-btn', text: text('pickAgain'), on: { click: pickStudent } }),
        h('button', { type: 'button', class: 'cmc-btn quiet', text: text('close'), on: { click: () => { card.hidden = true; } } })));
  }
  function setBoard(on) {
    state.board = on;
    document.body.classList.toggle('cmc-board', on);
    el('board').setAttribute('aria-pressed', String(on));
    savePrefs();
    if (viewer) setTimeout(() => safely(() => { viewer.resize(); viewer.render(); })(), 50);
  }
  function setMode(mode) {
    state.mode = mode;
    state.revealed = false; state.guess = { shape: '', polar: '' };
    if (mode !== 'quiz') state.quiz = null;
    document.body.classList.toggle('mol-quiz', mode === 'quiz');
    sync();
  }
  function setToggle(key, id) {
    state[key] = !state[key];
    if (key === 'measure') state.sel = state.sel.slice(-1);
    savePrefs();
    el(id).setAttribute('aria-pressed', String(state[key]));
    overlays();
    renderAtoms();
  }
  function setSpin() {
    state.spin = !state.spin;
    el('spin').setAttribute('aria-pressed', String(state.spin));
    if (viewer) viewer.spin(state.spin ? 'y' : false, 0.6);
    else flatLoop();
  }
  function rotate(dx, dy) {
    if (viewer) { if (dx) viewer.rotate(dx, 'y'); if (dy) viewer.rotate(dy, 'x'); viewer.render(); } else { state.yaw += dx; state.pitch = Math.max(-89, Math.min(89, state.pitch + dy)); renderFlat(); }
  }
  function applyZoom(value) {
    state.zoom = Math.max(0.5, Math.min(3, value));
    el('zoom').value = String(state.zoom);
    el('zoom-value').textContent = state.zoom.toFixed(1) + '×';
    if (viewer) { viewer.zoomTo(); viewer.zoom(state.zoom * BASE_ZOOM); viewer.render(); } else renderFlat();
  }

  // ---------- render everything ----------
  function sync() {
    const id = shownId();
    if (id !== loadedId) {
      loadedId = id;
      state.sel = [];
      try { loadMolecule(); } catch (error) { fail3d(error); }
    } else overlays();
    renderAll();
  }
  function renderAll() {
    document.querySelectorAll('#modes [data-mode]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mode === state.mode)));
    renderLibrary();
    renderSide();
    renderCover();
    renderAtoms();
    viewLabel();
    el('prev').disabled = el('next').disabled = quizActive();
    const next = el('quiz-next');
    if (next && state.mode === 'quiz') next.focus();
  }
  function applyLanguage(lang) {
    zh = lang === 'zh';
    document.documentElement.lang = zh ? 'zh' : 'en';
    document.title = text('title');
    document.querySelectorAll('[data-i18n]').forEach(node => { node.textContent = text(node.dataset.i18n); });
    document.querySelectorAll('[data-i18n-aria]').forEach(node => node.setAttribute('aria-label', text(node.dataset.i18nAria)));
    document.querySelectorAll('[data-i18n-ph]').forEach(node => node.setAttribute('placeholder', text(node.dataset.i18nPh)));
    el('keys').replaceChildren(...keyList.map(k => h('li', {}, h('kbd', { text: k[0] }), pair(k[1]))));
    el('lessons').replaceChildren(...lessons.map(l => h('li', { text: pair(l) })));
    if (!el('error').hidden) el('error').textContent = errorText();
    if (!el('pick-card').hidden) el('pick-card').hidden = true;
    renderAll();
  }

  // ---------- events ----------
  function bind() {
    document.querySelectorAll('#modes [data-mode]').forEach(b => b.addEventListener('click', () => setMode(b.dataset.mode)));
    el('board').addEventListener('click', () => setBoard(!state.board));
    el('pick').addEventListener('click', pickStudent);
    el('search').addEventListener('input', e => { state.query = e.target.value; renderLibrary(); });
    el('prev').addEventListener('click', () => step(-1));
    el('next').addEventListener('click', () => step(1));
    el('style').addEventListener('change', safely(() => { state.style = el('style').value; savePrefs(); applyStyle(); overlays(); }));
    el('labels').addEventListener('click', () => setToggle('labels', 'labels'));
    el('lengths').addEventListener('click', () => setToggle('lengths', 'lengths'));
    el('measure').addEventListener('click', () => setToggle('measure', 'measure'));
    el('spin').addEventListener('click', setSpin);
    el('reset').addEventListener('click', safely(() => { state.sel = []; resetView(); overlays(); renderAtoms(); }));
    [['left', -15, 0], ['right', 15, 0], ['up', 0, -15], ['down', 0, 15]].forEach(([id, dx, dy]) => el(id).addEventListener('click', safely(() => rotate(dx, dy))));
    el('zoom').addEventListener('input', safely(() => applyZoom(Number(el('zoom').value))));
    el('snap').addEventListener('click', savePng);
    el('copy').addEventListener('click', () => copyText(summaryText(shown()), text('copied')));
    el('print').addEventListener('click', printSheet);
    document.addEventListener('keydown', onKey);
  }
  function onKey(e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const tag = e.target && e.target.tagName;
    if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA' || (e.target && e.target.isContentEditable)) return;
    const k = e.key, lower = k.length === 1 ? k.toLowerCase() : k;
    const q = state.quiz;
    if (quizActive() && /^[1-4]$/.test(k) && !q.answered) {
      const cur = q.qs[q.i];
      if (cur.options[+k - 1] !== undefined) { answer(cur.options[+k - 1]); e.preventDefault(); }
      return;
    }
    if (quizActive() && q.answered && (lower === 'n' || k === 'Enter') && tag !== 'BUTTON') { nextQuestion(); e.preventDefault(); return; }
    if (covered() && k === 'Enter' && tag !== 'BUTTON') { reveal(); e.preventDefault(); return; }
    const map = {
      ArrowLeft: () => rotate(-15, 0), ArrowRight: () => rotate(15, 0), ArrowUp: () => rotate(0, -15), ArrowDown: () => rotate(0, 15),
      '+': () => applyZoom(state.zoom + 0.2), '=': () => applyZoom(state.zoom + 0.2), '-': () => applyZoom(state.zoom - 0.2), _: () => applyZoom(state.zoom - 0.2),
      n: () => step(1), p: () => step(-1), l: () => setToggle('labels', 'labels'), b: () => setToggle('lengths', 'lengths'), m: () => setToggle('measure', 'measure'),
      r: setSpin, s: savePng, f: () => setBoard(!state.board), g: pickStudent, '/': () => el('search').focus()
    };
    if (map[lower]) { e.preventDefault(); safely(map[lower])(); }
  }
  function release() {
    cancelAnimationFrame(flatTimer);
    if (!viewer) return;
    try {
      viewer.spin(false);
      const canvas = viewer.getCanvas && viewer.getCanvas();
      viewer.clear();
      const gl = canvas && (canvas.getContext('webgl2') || canvas.getContext('webgl'));
      const ext = gl && gl.getExtension('WEBGL_lose_context');
      if (ext) ext.loseContext();
    } catch (e) { /* page is closing */ }
    viewer = null;
  }

  window.addEventListener('message', event => {
    if (event.origin !== location.origin || event.source !== window.parent) return;
    if (event.data && event.data.type === 'cmc-language' && ['en', 'zh'].includes(event.data.lang)) applyLanguage(event.data.lang);
  });
  window.addEventListener('pagehide', release);
  window.addEventListener('beforeunload', release);

  el('style').value = state.style;
  ['labels', 'lengths'].forEach(k => el(k).setAttribute('aria-pressed', String(state[k])));
  document.body.classList.toggle('cmc-board', state.board);
  el('board').setAttribute('aria-pressed', String(state.board));
  bind();
  try {
    if (!MOLS.length) throw new Error('Molecule library is unavailable');
    if (typeof $3Dmol === 'undefined') throw new Error('3Dmol.js is unavailable');
    viewer = $3Dmol.createViewer(el('viewer'), { backgroundColor: '#06090d', antialias: true });
    if (!viewer) throw new Error('3Dmol viewer could not be created');
    const resize = safely(() => { if (viewer) { viewer.resize(); viewer.render(); } });
    window.addEventListener('resize', resize);
    if (typeof ResizeObserver !== 'undefined') new ResizeObserver(resize).observe(el('stage'));
    el('viewer').addEventListener('webglcontextlost', event => { event.preventDefault(); fail3d(new Error('WebGL context lost')); }, true);
  } catch (error) {
    viewer = null;
    el('viewer').hidden = true;
    el('flat').hidden = false;
    el('error').hidden = false;
    el('style').disabled = true;
    console.error(error);
  }
  applyLanguage(zh ? 'zh' : 'en');
  sync();
  if (!viewer) { el('error').textContent = errorText(); flatLoop(); }
})();
