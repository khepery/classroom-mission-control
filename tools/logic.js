/* Logic Circuit Lab: classroom wrapper around the unmodified SimcirJS engine in lib/simcir.
   Lessons and challenges live in logic-data.js. Circuits are driven and read through SimcirJS's own controllers. */
(() => {
  'use strict';
  const D = window.LogicData;
  let zh = new URLSearchParams(location.search).get('lang') === 'zh';
  const $ = id => document.getElementById(id);
  const MAX_INPUTS = 5;
  const GATES = ['AND', 'OR', 'XOR', 'NOT', 'NAND', 'NOR', 'XNOR', 'BUF'];
  const LED_COLOR = '#ffb23e';
  const TOOLBOX = [{type: 'DC'}, {type: 'Toggle'}, {type: 'PushOn'}, {type: 'LED', color: LED_COLOR}, ...['AND', 'OR', 'NOT', 'NAND', 'NOR', 'XOR', 'XNOR', 'BUF', 'Joint'].map(type => ({type}))];
  const ALLOWED = new Set(['DC', 'Toggle', 'PushOn', 'PushOff', 'LED', 'Joint', ...GATES]);

  const words = {
    title: ['Logic Circuit Lab', '逻辑电路实验室'],
    intro: ['Flip switches, predict the lights, then test your prediction on a real digital circuit.', '拨动开关、预测指示灯，再用真实的数字电路验证你的预测。'],
    pick: ['Pick a student', '随机点名'],
    board: ['Projector mode', '投影模式'],
    modesAria: ['Activity', '活动'],
    mExplore: ['Explore', '探索'],
    mPredict: ['Predict & test', '预测并验证'],
    mRead: ['Read the circuit', '读懂电路'],
    mBuild: ['Build it yourself', '自己搭建'],
    lessonLabel: ['Lesson', '课例'],
    reload: ['Reload circuit', '重新加载电路'],
    challengeLabel: ['Challenge', '挑战'],
    restart: ['Restart template', '重新开始'],
    exprShow: ['Show expression', '显示表达式'],
    exprHide: ['Hide expression', '隐藏表达式'],
    teacherNotes: ['Teacher notes', '教师提示'],
    circuitAria: ['Interactive circuit workspace', '交互式电路工作区'],
    liveTitle: ['Live circuit', '实时电路'],
    switches: ['Switches', '开关'],
    lights: ['Lights', '指示灯'],
    toolsAria: ['Circuit file tools', '电路文件工具'],
    blank: ['Blank workspace', '空白工作区'],
    save: ['Save in browser', '保存到浏览器'],
    restore: ['Load saved', '载入已保存'],
    export: ['Export JSON', '导出 JSON'],
    import: ['Import JSON', '导入 JSON'],
    sheet: ['Print worksheet', '打印练习单'],
    key: ['Print answer key', '打印答案页'],
    tableTitle: ['Truth table', '真值表'],
    stateTitle: ['State table', '状态表'],
    step: ['Next input row', '下一行输入'],
    gen: ['Generate full table', '生成完整真值表'],
    check: ['Check my predictions', '检查我的预测'],
    clearTable: ['Clear', '清除'],
    copy: ['Copy table', '复制表格'],
    readTitle: ['Which expression matches?', '哪个表达式与电路相符？'],
    nextQ: ['New question', '新题目'],
    revealQ: ['Show answer', '显示答案'],
    optsAria: ['Answer options', '答案选项'],
    buildTitle: ['Your mission', '你的任务'],
    buildCheck: ['Check my circuit', '检查我的电路'],
    hint: ['Hint', '提示'],
    solution: ['Show a solution', '显示一种解法'],
    ruleHead: ['Labelling rule', '命名规则'],
    ruleBody: ['Rename each Toggle switch to its input name (A, B, C…) and each LED to its output name by double-clicking the label under the device. Connect the DC power source to every switch input. A single output LED is accepted whatever it is called.', '双击器件下方的名称，把每个 Toggle 开关改成对应的输入名（A、B、C……），把每个 LED 改成对应的输出名。每个开关的输入端都要接上 DC 电源。只有一个输出 LED 时，无论叫什么名字都可以。'],
    helpTitle: ['How to use & keyboard shortcuts', '使用说明与键盘快捷键'],
    limitHead: ['Digital logic only', '仅限数字逻辑'],
    limit: ['This is a digital logic playground, not an analogue electrical simulator: there are no voltages, currents or resistors, only 0 and 1.', '这是数字逻辑实验工具，不是模拟电子电路仿真器：没有电压、电流或电阻，只有 0 和 1。'],
    credit: ['Powered by authentic SimcirJS by Kazuhiko Arase, MIT licensed. Runs locally; no accounts or uploads. Saved circuits stay in this browser only.', '由 Kazuhiko Arase 的原版 SimcirJS 驱动，MIT 许可。本地运行，无需账户，不上传数据。保存的电路只留在本浏览器中。'],
    license: ['License', '许可'],
    studentHead: ['Next up', '下一位'],
    again: ['Pick again', '再抽一次'],
    close: ['Close', '关闭'],
    sure: ['Click again to confirm', '再点一次确认'],
    swAria: ['Switch {0}', '开关 {0}'],
    swState: ['Switch {0}: {1}', '开关 {0}：{1}'],
    on: ['on', '开'],
    off: ['off', '关'],
    ledAria: ['Light {0}: {1}', '指示灯 {0}：{1}'],
    noSwitches: ['No switches yet: drag a Toggle from the toolbox on the left.', '还没有开关：请从左侧工具箱拖入 Toggle。'],
    noLights: ['No lights yet: add an LED.', '还没有指示灯：请添加 LED。'],
    unstable: ['The lights keep changing: the circuit may be oscillating. Reload it or change a switch.', '指示灯一直在变化：电路可能在振荡。请重新加载或拨动开关。'],
    hintExplore: ['Press Next input row to step through each combination and fill in the table, or Generate full table to run all of them.', '点“下一行输入”逐行拨动开关并填写表格，或点“生成完整真值表”一次运行全部组合。'],
    hintPredict: ['Predict first: click each output cell to enter 0 or 1 (or focus it and type 0 or 1), then press Check.', '先预测：点击每个输出格填入 0 或 1（也可聚焦后键入 0 或 1），再点“检查我的预测”。'],
    hintBuild: ['This is the target truth table. Build the circuit, then press Check my circuit.', '这是目标真值表。搭好电路后点“检查我的电路”。'],
    hintSeq: ['Memory circuits have no ordinary truth table, so predicting and generating are switched off. Use the switches to explore.', '记忆电路没有普通真值表，因此预测和生成功能已关闭。请用开关来探索。'],
    noIO: ['A truth table needs at least one Toggle switch and one LED.', '真值表至少需要一个 Toggle 开关和一个 LED。'],
    tooMany: ['A truth table supports up to {0} switches; this circuit has {1}.', '真值表最多支持 {0} 个开关，当前电路有 {1} 个。'],
    unpowered: ['Switch {0} has no power: connect the DC source to its input.', '开关 {0} 没有供电：请把 DC 电源接到它的输入端。'],
    busy: ['Working…', '运行中……'],
    rowStatus: ['Row {0} of {1}: {2} → {3}', '第 {0} / {1} 行：{2} → {3}'],
    genDone: ['Truth table generated from the live circuit.', '已根据实时电路生成真值表。'],
    nothing: ['Fill in at least one output first.', '请先至少填写一个输出格。'],
    score: ['Score: {0} of {1} rows correct', '得分：{0} / {1} 行正确'],
    scorePerfect: ['Perfect prediction!', '预测全对！'],
    wrongTip: ['Red cells show your prediction and, underneath, what the circuit really did.', '红色格子显示你的预测，下方小字是电路的实际输出。'],
    copied: ['Table copied.', '表格已复制。'],
    copyFail: ['Copy was blocked by the browser.', '浏览器阻止了复制。'],
    exprNone: ['The expression appears when a switch, a gate and an LED are wired together.', '把开关、逻辑门和 LED 连好线后，这里会显示表达式。'],
    exprLoop: ['This circuit contains a feedback loop, so it has no single expression.', '这个电路含有反馈回路，没有单一的表达式。'],
    exprLong: ['(expression too long to display)', '（表达式太长，无法显示）'],
    yourCircuit: ['Your circuit', '你的电路'],
    yourCircuitStory: ['Wire up switches, gates and lights from the toolbox, or load a lesson from the list.', '用工具箱里的开关、逻辑门和指示灯搭一个电路，或从列表中载入课例。'],
    mystery: ['Mystery circuit', '神秘电路'],
    mysteryStory: ['Flip the switches to see what the circuit does, then choose the expression that describes it.', '拨动开关观察电路的行为，然后选出描述它的表达式。'],
    readQ: ['Which expression gives output {0}?', '哪个表达式对应输出 {0}？'],
    readRight: ['Correct! {0}', '回答正确！{0}'],
    readWrong: ['Not quite. The right answer is {0}', '不对哦。正确答案是 {0}'],
    readScore: ['Questions answered: {0} · correct: {1}', '已答题数：{0} · 答对：{1}'],
    buildRules: ['Inputs: {0} · Output: {1}', '输入：{0} · 输出：{1}'],
    buildOnly: [' · Only {0} gates allowed', ' · 只能使用 {0} 门'],
    buildBan: [' · No {0} gates', ' · 不能使用 {0} 门'],
    missingSwitch: ['No Toggle switch is labelled {0}.', '没有名为 {0} 的 Toggle 开关。'],
    missingLed: ['No LED is labelled {0}.', '没有名为 {0} 的 LED。'],
    badGate: ['The {0} gate is not allowed in this challenge.', '本挑战不允许使用 {0} 门。'],
    extraSwitch: ['Extra switches are kept off during the test: {0}.', '测试时多余的开关保持关闭：{0}。'],
    pass: ['Success! All {0} rows match the target truth table.', '成功！全部 {0} 行都与目标真值表一致。'],
    fail: ['{0} of {1} rows match. Compare the red cells with the target.', '{0} / {1} 行一致。请对照红色格子与目标值。'],
    yours: ['yours {0}', '你的 {0}'],
    solutionLoaded: ['A solution is on the workspace. Study how it is wired.', '工作区已载入一种解法，请研究它的接线。'],
    teachBuild: ['Teacher tip: ask students to predict which rows will fail before pressing Check.', '教师提示：点击检查前，先让学生预测哪几行会出错。'],
    loadFail: ['That circuit could not be loaded.', '无法载入该电路。'],
    saved: ['Circuit saved in this browser.', '电路已保存到本浏览器。'],
    saveFail: ['Saving is not available in this browser.', '此浏览器无法保存。'],
    noSaved: ['Nothing saved yet.', '还没有保存的电路。'],
    restored: ['Saved circuit loaded.', '已载入保存的电路。'],
    exported: ['Circuit file downloaded.', '电路文件已下载。'],
    imported: ['Circuit imported.', '电路已导入。'],
    importBad: ['That file is not a valid circuit.', '该文件不是有效的电路文件。'],
    noRoster: ['No class roster found. Create a class in the hub first.', '未找到班级名单。请先在主页创建班级。'],
    sheetTitle: ['Logic worksheet', '逻辑电路练习单'],
    sheetKey: ['Answer key', '答案'],
    sheetName: ['Name: ____________  Date: ____________', '姓名：____________  日期：____________'],
    sheetQ1: ['Predict the output for every input row, then test it.', '预测每一行输入对应的输出，再动手测试。'],
    sheetQ2: ['Build the circuit, test it, then check the table.', '搭建电路并测试，再核对表格。'],
    sheetDraw: ['Draw or sketch your circuit here', '请在此画出你的电路'],
    sheetExpr: ['Boolean expression: ______________________', '布尔表达式：______________________'],
    sheetFail: ['Nothing to print: this circuit has no switches or no lights.', '无可打印内容：电路没有开关或没有指示灯。'],
    helpExplore: ['Explore: pick a lesson, flip the switches and watch the lights. Next input row steps through every combination and fills the truth table one row at a time.', '探索：选一个课例，拨动开关，观察指示灯。“下一行输入”会逐行遍历所有组合并填写真值表。'],
    helpPredict: ['Predict & test: click each output cell to enter 0 or 1 (or focus it and type 0 or 1), then press Check. The lab drives every input combination on the live circuit and marks each row.', '预测并验证：点击每个输出格填入 0 或 1（或聚焦后键入 0、1），再点检查。实验室会在实时电路上逐一拨动所有输入组合并给每行评分。'],
    helpRead: ['Read the circuit: test the mystery circuit, then choose the Boolean expression that describes it.', '读懂电路：测试神秘电路，再选出描述它的布尔表达式。'],
    helpBuild: ['Build it yourself: wire the circuit with the toolbox on the left. Drag a part onto the grid; drag from an output dot (right side) to an input dot (left side) to wire; drag a part back to the toolbox to delete it; double-click a label to rename it. Every Toggle switch needs the DC source wired to its input.', '自己搭建：用左侧工具箱接线。把元件拖到网格上；从输出点（右侧）拖到输入点（左侧）即可连线；把元件拖回工具箱可删除；双击名称可重命名。每个 Toggle 开关都要把 DC 电源接到输入端。'],
    helpFiles: ['Teacher tools: Save in browser keeps one circuit on this computer; Export/Import JSON moves circuits between computers; Print worksheet gives a blank truth table, Print answer key fills it in.', '教师工具：“保存到浏览器”在本机保留一个电路；导出/导入 JSON 可在电脑之间传递电路；“打印练习单”给出空白真值表，“打印答案页”则填好答案。'],
    helpKeys: ['Keyboard: 1–5 flip switches (in Read mode they choose answers) · N next input row · G generate table · C check · P projector mode · K pick a student · ? this help · Esc close. Inside the circuit, Tab to a switch and press Enter or Space. Moving parts and wiring needs a mouse or touch-pad.', '键盘：数字 1–5 拨动开关（读懂电路模式下用于选答案） · N 下一行输入 · G 生成真值表 · C 检查 · P 投影模式 · K 随机点名 · ? 打开本说明 · Esc 关闭。在电路中按 Tab 聚焦开关，再按 Enter 或空格。移动元件和连线需要鼠标或触控板。'],
    helpOps: ['Terms: AND 与 · OR 或 · NOT 非 · NAND 与非 · NOR 或非 · XOR 异或 · XNOR 同或. Ctrl-click (or ⌘-click) the circuit to see its raw JSON.', '术语：AND 与 · OR 或 · NOT 非 · NAND 与非 · NOR 或非 · XOR 异或 · XNOR 同或。按住 Ctrl（或 ⌘）点击电路可查看原始 JSON。']
  };
  const t = (key, ...args) => {
    const pair = words[key];
    let s = pair ? pair[zh ? 1 : 0] : key;
    args.forEach((a, i) => { s = s.split('{' + i + '}').join(a); });
    return s;
  };
  const tx = pair => pair[zh ? 1 : 0];

  const store = {
    get(k) { try { const v = localStorage.getItem('mc_tool_logic_' + k); return v ? JSON.parse(v) : null; } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem('mc_tool_logic_' + k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  };
  const prefs = store.get('prefs') || {};
  const lessonById = id => D.lessons.find(l => l.id === id);
  const challengeById = id => D.challenges.find(c => c.id === id);

  const S = {
    mode: ['explore', 'predict', 'read', 'build'].includes(prefs.mode) ? prefs.mode : 'explore',
    lesson: lessonById(prefs.lesson) ? prefs.lesson : 'and',
    challenge: challengeById(prefs.challenge) ? prefs.challenge : D.challenges[0].id,
    cur: null, snap: null, tab: null, exprShown: true, busy: false, liveKey: '', ioSig: '', topoSig: '',
    flips: [], read: null, readAsked: 0, readRight: 0, hintShown: false, picked: []
  };
  const newTab = () => ({pred: {}, actual: {}, res: null, bres: null});
  S.tab = newTab();

  const sleep = ms => new Promise(r => setTimeout(r, ms));
  let toastTimer = 0;
  function toast(msg) {
    const el = $('toast');
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.hidden = true; }, 2600);
  }
  const savePrefs = () => store.set('prefs', {mode: S.mode, lesson: S.lesson, challenge: S.challenge, board: document.body.classList.contains('cmc-board')});

  /* ---------- netlists, expressions and truth tables ---------- */
  function gateValue(type, x) {
    const ones = x.reduce((a, b) => a + b, 0);
    switch (type) {
      case 'AND': return ones === x.length ? 1 : 0;
      case 'NAND': return ones === x.length ? 0 : 1;
      case 'OR': return ones > 0 ? 1 : 0;
      case 'NOR': return ones > 0 ? 0 : 1;
      case 'XOR': return ones % 2;
      case 'XNOR': return 1 - ones % 2;
      case 'NOT': return 1 - x[0];
      default: return x[0];
    }
  }
  function evalNet(net, bits) {
    const val = {};
    net.in.forEach((n, i) => { val[n] = bits[i]; });
    const gm = {};
    net.g.forEach(g => { gm[g[0]] = g; });
    const get = ref => {
      if (ref === '1') return 1;
      if (ref == null || ref === '0') return 0;
      if (ref in val) return val[ref];
      const g = gm[ref];
      return (val[ref] = gateValue(g[1], g.slice(2).map(get)));
    };
    return net.out.map(o => get(o[1]));
  }
  function exprOf(net, ref) {
    const gm = {};
    net.g.forEach(g => { gm[g[0]] = g; });
    const seen = new Set();
    const ex = (r, isTop) => {
      if (r == null) return '0';
      if (!gm[r]) return r[0] === '§' ? '?' : r;
      if (seen.has(r)) throw new Error('loop');
      seen.add(r);
      const g = gm[r];
      const kids = g.slice(2).map(s => ex(s, false));
      seen.delete(r);
      if (g[1] === 'BUF') return kids[0];
      const s = g[1] === 'NOT' ? 'NOT ' + kids[0] : kids.join(' ' + g[1] + ' ');
      return isTop ? s : '(' + s + ')';
    };
    return ex(ref, true);
  }
  const rowBits = (r, n) => Array.from({length: n}, (_, k) => (r >> (n - 1 - k)) & 1);

  const uniqueName = (name, used) => {
    let out = name, i = 2;
    while (used.has(out)) out = name + '#' + i++;
    used.add(out);
    return out;
  };
  const sortPos = (a, b) => a.y - b.y || a.x - b.x;
  const deviceName = (d, prefix, i) => {
    const label = String(d.label == null ? '' : d.label).trim();
    return label && label !== d.type ? label : prefix + (i + 1);
  };
  /* Rebuilds a netlist from the live circuit so any student circuit gets an expression. */
  function netFromData(data) {
    const dev = {}, srcOf = {};
    data.devices.forEach(d => { dev[d.id] = d; });
    data.connectors.forEach(c => { srcOf[c.from] = c.to; });
    const used = new Set(), inName = {};
    data.devices.filter(d => d.type === 'Toggle').sort(sortPos).forEach((d, i) => { inName[d.id] = uniqueName(deviceName(d, 'In', i), used); });
    const refOf = nodeId => {
      const d = nodeId && dev[nodeId.split('.')[0]];
      if (!d) return null;
      if (d.type === 'Toggle') return inName[d.id];
      if (d.type === 'DC') return '1';
      return GATES.includes(d.type) || d.type === 'Joint' ? '§' + d.id : '§?';
    };
    const g = [];
    data.devices.forEach(d => {
      if (!GATES.includes(d.type) && d.type !== 'Joint') return;
      const one = d.type === 'NOT' || d.type === 'BUF' || d.type === 'Joint';
      const n = one ? 1 : Math.max(2, d.numInputs || 2);
      g.push(['§' + d.id, d.type === 'Joint' ? 'BUF' : d.type, ...Array.from({length: n}, (_, k) => refOf(srcOf[d.id + '.in' + k]))]);
    });
    const outUsed = new Set();
    const out = data.devices.filter(d => d.type === 'LED').sort(sortPos).map((d, i) => [uniqueName(deviceName(d, 'Out', i), outUsed), refOf(srcOf[d.id + '.in0'])]);
    return {in: Object.values(inName), g, out};
  }
  function liveExpression() {
    if (!S.snap) return '';
    try {
      const net = netFromData(S.snap.data);
      if (!net.out.length) return '';
      const text = net.out.map(o => o[0] + ' = ' + exprOf(net, o[1])).join('\n');
      return text.length > 400 ? t('exprLong') : text;
    } catch (e) {
      const l = S.cur && S.cur.kind === 'lesson' && lessonById(S.cur.id);
      return l && l.exprText ? tx(l.exprText) : t('exprLoop');
    }
  }

  /* ---------- circuit data and layout ---------- */
  const circuitWidth = () => Math.max(520, Math.min(1500, ($('circuit').clientWidth || 760) - 2));
  /* Lays a netlist out in columns: power, switches, gate levels, lights. */
  function buildData(net, opts) {
    opts = opts || {};
    const width = circuitWidth();
    const gm = {};
    net.g.forEach(g => { gm[g[0]] = g; });
    const depth = {};
    net.in.forEach(n => { depth[n] = 1; });
    const depthOf = ref => {
      if (depth[ref]) return depth[ref];
      const kids = gm[ref].slice(2).filter(s => s[0] !== '^').map(depthOf);
      return (depth[ref] = 1 + Math.max(1, ...kids));
    };
    net.g.forEach(g => depthOf(g[0]));
    const maxGate = Math.max(1, ...net.g.map(g => depth[g[0]]));
    const ledCol = Math.max(maxGate + 1, opts.minLedCol || 0);
    const gap = Math.max(56, Math.min(150, (width - 112 - 80) / ledCol));
    const pitch = 64;
    const pos = {};
    net.in.forEach((n, i) => { pos[n] = {x: 24 + gap, y: 24 + i * pitch}; });
    for (let c = 2; c <= ledCol; c++) {
      const group = c === ledCol ? net.out.map(o => ({ref: 'led:' + o[0], srcs: [o[1]]})) : net.g.filter(g => depth[g[0]] === c).map(g => ({ref: g[0], srcs: g.slice(2)}));
      group.forEach((m, i) => {
        const ys = m.srcs.filter(s => s && s[0] !== '^' && pos[s]).map(s => pos[s].y);
        m.want = ys.length ? ys.reduce((a, b) => a + b, 0) / ys.length : 24 + i * pitch;
      });
      group.sort((a, b) => a.want - b.want);
      let prev = -Infinity;
      group.forEach(m => {
        prev = Math.max(m.want, prev + pitch);
        pos[m.ref] = {x: 24 + c * gap, y: Math.round(prev)};
      });
    }
    pos.pwr = {x: 24, y: Math.round(24 + Math.max(0, net.in.length - 1) * pitch / 2)};
    const maxY = Math.max(...Object.values(pos).map(p => p.y));
    const devices = [{type: 'DC', id: 'pwr', x: pos.pwr.x, y: pos.pwr.y, label: 'DC'}];
    const connectors = [];
    net.in.forEach((n, i) => {
      devices.push({type: 'Toggle', id: 'in' + i, x: pos[n].x, y: pos[n].y, label: n, state: {on: !!(net.init && net.init[n])}});
      connectors.push({from: 'in' + i + '.in0', to: 'pwr.out0'});
    });
    const nodeOf = ref => {
      const i = net.in.indexOf(ref);
      return i >= 0 ? 'in' + i + '.out0' : 'g_' + ref + '.out0';
    };
    net.g.forEach(g => {
      const def = {type: g[1], id: 'g_' + g[0], x: pos[g[0]].x, y: pos[g[0]].y};
      if (g.length - 2 > 2) def.numInputs = g.length - 2;
      devices.push(def);
      g.slice(2).forEach((s, k) => connectors.push({from: 'g_' + g[0] + '.in' + k, to: nodeOf(s[0] === '^' ? s.slice(1) : s)}));
    });
    net.out.forEach((o, j) => {
      const p = pos['led:' + o[0]];
      devices.push({type: 'LED', id: 'out' + j, x: p.x, y: p.y, label: o[0], color: LED_COLOR});
      if (o[1]) connectors.push({from: 'out' + j + '.in0', to: nodeOf(o[1])});
    });
    return {width, height: Math.max(opts.minHeight || 420, maxY + 90), showToolbox: true, editable: true, toolbox: TOOLBOX, devices, connectors};
  }
  /* Whitelists an imported or saved circuit before it reaches SimcirJS. */
  function sanitize(raw) {
    const src = raw && raw.circuit ? raw.circuit : raw;
    if (!src || !Array.isArray(src.devices) || !Array.isArray(src.connectors) || src.devices.length > 300 || src.connectors.length > 1000) throw new Error('shape');
    const num = (v, lo, hi, dflt) => typeof v === 'number' && isFinite(v) ? Math.max(lo, Math.min(hi, v)) : dflt;
    const ids = new Set();
    const devices = src.devices.map(d => {
      if (!d || !ALLOWED.has(d.type) || typeof d.id !== 'string' || !/^\w{1,40}$/.test(d.id) || ids.has(d.id)) throw new Error('device');
      ids.add(d.id);
      const out = {type: d.type, id: d.id, x: num(d.x, -1000, 5000, 0), y: num(d.y, -1000, 5000, 0)};
      if (typeof d.label === 'string') out.label = d.label.slice(0, 40);
      if (d.type === 'Toggle' && d.state && typeof d.state.on === 'boolean') out.state = {on: d.state.on};
      if (d.type === 'Joint' && d.state && /^[A-Z]{2}$/.test(String(d.state.direction))) out.state = {direction: d.state.direction};
      if (d.numInputs != null) out.numInputs = Math.round(num(d.numInputs, 2, 8, 2));
      if (d.type === 'LED' && typeof d.color === 'string' && /^#[0-9a-f]{3,6}$/i.test(d.color)) out.color = d.color;
      return out;
    });
    const re = /^(\w+)\.(in|out)(\d+)$/;
    const connectors = src.connectors.map(c => {
      const a = c && re.exec(String(c.from)), b = c && re.exec(String(c.to));
      if (!a || !b || !ids.has(a[1]) || !ids.has(b[1])) throw new Error('connector');
      return {from: c.from, to: c.to};
    });
    const maxY = Math.max(0, ...devices.map(d => d.y));
    return {width: circuitWidth(), height: Math.max(num(src.height, 300, 1400, 480), maxY + 90), showToolbox: true, editable: true, toolbox: TOOLBOX, devices, connectors};
  }

  /* ---------- reading and driving the live circuit ---------- */
  const workspaceEl = () => $('circuit').querySelector('.simcir-workspace');
  const liveDevices = () => [...$('circuit').querySelectorAll('.simcir-device')].filter(el => !el.closest('.simcir-toolbox'));
  function snapshot() {
    const ws = workspaceEl();
    if (!ws) return null;
    try {
      const data = simcir.controller(simcir.$(ws)).data();
      const ctl = {}, el = {};
      liveDevices().forEach(node => {
        const c = simcir.controller(simcir.$(node));
        if (c && c.id) { ctl[c.id] = c; el[c.id] = node; }
      });
      const pick = (type, prefix) => {
        const used = new Set();
        return data.devices.filter(d => d.type === type && ctl[d.id]).sort(sortPos).map((d, i) => ({id: d.id, name: uniqueName(deviceName(d, prefix, i), used), label: String(d.label || '').trim(), ctl: ctl[d.id], el: el[d.id]}));
      };
      return {data, inputs: pick('Toggle', 'In'), leds: pick('LED', 'Out')};
    } catch (e) {
      return null;
    }
  }
  const isOn = inp => !!(inp.ctl.getState() && inp.ctl.getState().on);
  const ledValue = led => led.ctl.getInputs()[0].getValue() != null ? 1 : 0;
  function press(button) {
    button.dispatchEvent(new MouseEvent('mousedown', {bubbles: true}));
    document.dispatchEvent(new MouseEvent('mouseup', {bubbles: true}));
  }
  function setToggle(inp, on) {
    if (isOn(inp) === on) return;
    const button = inp.el.querySelector('.simcir-basicset-switch-button');
    if (button) press(button);
  }
  /* SimcirJS propagates values on a 50 ms timer, so wait until the lights stop changing. */
  async function settle(leds) {
    await sleep(70);
    let prev = leds.map(ledValue).join('');
    for (let i = 0; i < 10; i++) {
      await sleep(55);
      const cur = leds.map(ledValue).join('');
      if (cur === prev) return true;
      prev = cur;
    }
    return false;
  }
  /* Drives `inputs` through the given row numbers (first input = most significant bit) and reads `leds`. */
  async function runRows(inputs, leds, rows, off) {
    const saved = inputs.concat(off || []).map(i => [i, isOn(i)]);
    const out = [], unpowered = new Set();
    let settled = true;
    try {
      (off || []).forEach(i => setToggle(i, false));
      for (const r of rows) {
        const bits = rowBits(r, inputs.length);
        inputs.forEach((inp, k) => setToggle(inp, !!bits[k]));
        if (!await settle(leds)) settled = false;
        inputs.forEach((inp, k) => { if (bits[k] && inp.ctl.getOutputs()[0].getValue() == null) unpowered.add(inp.name); });
        out.push(leds.map(ledValue));
      }
    } finally {
      saved.forEach(([i, on]) => setToggle(i, on));
    }
    return {out, unpowered: [...unpowered], settled};
  }
  function setBusy(on) {
    S.busy = on;
    document.querySelectorAll('#pane-table button, #pane-build button, #sheet-btn, #key-btn').forEach(b => { b.disabled = on; });
    if (on) $('status').textContent = t('busy');
  }
  function ioProblem(sn) {
    if (!sn || !sn.inputs.length || !sn.leds.length) return t('noIO');
    if (sn.inputs.length > MAX_INPUTS) return t('tooMany', MAX_INPUTS, sn.inputs.length);
    return '';
  }
  const curRow = sn => sn.inputs.reduce((a, inp) => a * 2 + (isOn(inp) ? 1 : 0), 0);

  /* ---------- mounting circuits ---------- */
  const topoSig = data => JSON.stringify([
    data.devices.map(d => [d.id, d.type, d.label, d.numInputs || 0]).sort(),
    data.connectors.map(c => c.from + '>' + c.to).sort()
  ]);
  const ioSigOf = sn => sn ? JSON.stringify([sn.inputs.map(i => i.name), sn.leds.map(l => l.name)]) : '';
  const isModified = () => !!(S.cur && S.snap && S.cur.baseSig !== topoSig(S.snap.data));
  function mount(data, desc) {
    try {
      simcir.setupSimcir(simcir.$($('circuit')), data);
    } catch (e) {
      toast(t('loadFail'));
      return false;
    }
    S.cur = desc;
    S.tab = newTab();
    S.liveKey = '';
    S.flips = [];
    S.snap = snapshot();
    S.ioSig = ioSigOf(S.snap);
    S.topoSig = S.snap ? topoSig(S.snap.data) : '';
    desc.baseSig = S.topoSig;
    accessibleSwitches();
    renderAll();
    return true;
  }
  function loadLesson(id) {
    const l = lessonById(id);
    if (!l) return;
    S.lesson = id;
    S.exprShown = S.mode !== 'predict';
    mount(buildData(l.net), {kind: 'lesson', id});
    savePrefs();
  }
  function loadChallenge(id) {
    const c = challengeById(id);
    if (!c) return;
    S.challenge = id;
    S.hintShown = false;
    $('build-result').replaceChildren();
    mount(buildData({in: c.inputs, g: [], out: c.outputs.map(o => [o, null])}, {minLedCol: 4, minHeight: 440}), {kind: 'challenge', id});
    savePrefs();
  }
  function loadSolution() {
    const c = challengeById(S.challenge);
    $('build-result').replaceChildren();
    mount(buildData(c.sol, {minHeight: 440}), {kind: 'challenge', id: c.id});
    toast(t('solutionLoaded'));
  }
  const loadBlank = () => mount(buildData({in: [], g: [], out: []}, {minHeight: 440}), {kind: 'blank'});

  function accessibleSwitches() {
    liveDevices().forEach(el => {
      const c = simcir.controller(simcir.$(el));
      if (!c || !['Toggle', 'PushOn', 'PushOff'].includes(c.deviceDef.type)) return;
      const button = el.querySelector('.simcir-basicset-switch-button');
      if (!button) return;
      button.setAttribute('aria-label', t('swAria', c.getLabel()));
      if (c.deviceDef.type === 'Toggle') button.setAttribute('aria-pressed', String(!!c.getState().on));
      if (button.dataset.lgKey) return;
      button.dataset.lgKey = '1';
      button.setAttribute('tabindex', '0');
      button.setAttribute('role', 'button');
      button.addEventListener('keydown', event => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        press(button);
      });
    });
  }

  /* ---------- live panel ---------- */
  function refreshLive(force) {
    const sn = snapshot();
    if (!sn) return;
    S.snap = sn;
    const io = ioSigOf(sn), topo = topoSig(sn.data);
    if (io !== S.ioSig) { S.ioSig = io; S.tab = newTab(); renderPanels(); }
    if (topo !== S.topoSig) {
      S.topoSig = topo;
      S.tab.actual = {}; S.tab.res = null; S.tab.bres = null;
      renderPanels();
    }
    const sw = sn.inputs.map(i => [i.name, isOn(i) ? 1 : 0]);
    const lv = sn.leds.map(l => [l.name, ledValue(l)]);
    const swKey = JSON.stringify(sw), key = swKey + JSON.stringify(lv);
    if (!force && key === S.liveKey) return;
    const sameSwitches = S.liveKey.startsWith(swKey);
    S.liveKey = key;
    const now = Date.now();
    S.flips = sameSwitches && !S.busy ? S.flips.filter(x => now - x < 3000).concat(now) : [];
    renderLive(sn, sw, lv);
    markRow(sn);
    accessibleSwitches();
  }
  function renderLive(sn, sw, lv) {
    const list = $('switch-list'), leds = $('led-list');
    list.replaceChildren();
    leds.replaceChildren();
    sn.inputs.forEach((inp, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'cmc-btn lg-sw';
      b.setAttribute('aria-pressed', String(sw[i][1] === 1));
      b.setAttribute('aria-label', t('swState', inp.name, t(sw[i][1] ? 'on' : 'off')));
      if (i < 5) b.title = '[' + (i + 1) + ']';
      b.append(inp.name + ' ');
      b.append(Object.assign(document.createElement('b'), {textContent: sw[i][1]}));
      b.addEventListener('click', () => { setToggle(inp, !isOn(inp)); refreshLive(true); });
      list.append(b);
    });
    if (!sn.inputs.length) list.append(Object.assign(document.createElement('span'), {className: 'lg-hint', textContent: t('noSwitches')}));
    sn.leds.forEach((led, i) => {
      const s = document.createElement('span');
      s.className = 'lg-led' + (lv[i][1] ? ' on' : '');
      s.setAttribute('role', 'img');
      s.setAttribute('aria-label', t('ledAria', led.name, t(lv[i][1] ? 'on' : 'off')));
      s.append(document.createElement('i'), led.name + ' ' + lv[i][1]);
      leds.append(s);
    });
    if (!sn.leds.length) leds.append(Object.assign(document.createElement('span'), {className: 'lg-hint', textContent: t('noLights')}));
    let text = sn.inputs.length ? sw.map(x => x[0] + '=' + x[1]).join(' ') : '';
    if (lv.length) text += (text ? ' → ' : '') + lv.map(x => x[0] + '=' + x[1]).join(' ');
    $('status').textContent = S.flips.length >= 8 ? t('unstable') : text;
  }

  /* ---------- truth table ---------- */
  function tableNames() {
    if (S.mode === 'build') {
      const c = challengeById(S.challenge);
      return {inN: c.inputs, outN: c.outputs, c};
    }
    const sn = S.snap;
    if (!sn || ioProblem(sn)) return null;
    return {inN: sn.inputs.map(i => i.name), outN: sn.leds.map(l => l.name)};
  }
  const isSeq = () => !!(S.cur && S.cur.kind === 'lesson' && lessonById(S.cur.id).seq && (S.mode === 'explore' || S.mode === 'predict'));
  function cellState(r, o, nm) {
    if (S.mode === 'build') {
      const res = S.tab.bres && S.tab.bres[r] && S.tab.bres[r][o];
      return {text: String(nm.c.fn(rowBits(r, nm.inN.length))[o]), cls: res ? (res.ok ? 'ok' : 'bad') : 'out', sub: res && !res.ok ? t('yours', res.actual) : ''};
    }
    if (S.mode === 'predict') {
      const p = S.tab.pred[r + ':' + o];
      const res = S.tab.res && S.tab.res[r] && S.tab.res[r][o];
      return {text: p == null ? '?' : String(p), cls: res ? (res.ok ? 'ok' : 'bad') : 'out', sub: res && !res.ok ? String(res.actual) : '', empty: p == null, button: true};
    }
    const a = S.tab.actual[r];
    return {text: a ? String(a[o]) : '·', cls: 'out', empty: !a};
  }
  function renderTable() {
    const table = $('tt');
    table.replaceChildren();
    const seq = isSeq();
    const nm = seq ? null : tableNames();
    $('table-title').textContent = t(seq ? 'stateTitle' : 'tableTitle');
    $('seq-box').hidden = !seq;
    $('table-hint').textContent = seq ? t('hintSeq') : S.mode === 'predict' ? t('hintPredict') : S.mode === 'build' ? t('hintBuild') : t('hintExplore');
    if (seq) renderStates();
    if (!nm) {
      if (!seq && S.snap) $('table-hint').textContent = ioProblem(S.snap);
      table.hidden = true;
      $('table-score').textContent = '';
      return;
    }
    table.hidden = false;
    const head = document.createElement('tr');
    nm.inN.concat(nm.outN).forEach((n, i) => {
      const th = document.createElement('th');
      th.scope = 'col';
      th.textContent = n;
      if (i === nm.inN.length) th.className = 'sep';
      head.append(th);
    });
    table.append(head);
    for (let r = 0; r < 1 << nm.inN.length; r++) {
      const tr = document.createElement('tr');
      tr.dataset.row = r;
      const bits = rowBits(r, nm.inN.length);
      bits.forEach(b => tr.append(Object.assign(document.createElement('td'), {className: 'in', textContent: b})));
      nm.outN.forEach((name, o) => {
        const c = cellState(r, o, nm);
        const td = document.createElement('td');
        td.className = c.cls + (o === 0 ? ' sep' : '');
        if (c.button) {
          const b = document.createElement('button');
          b.type = 'button';
          b.className = 'lg-cell' + (c.empty ? ' empty' : '');
          b.dataset.r = r;
          b.dataset.o = o;
          b.textContent = c.text;
          b.setAttribute('aria-label', nm.inN.map((x, k) => x + '=' + bits[k]).join(' ') + ', ' + name + ': ' + c.text);
          td.append(b);
        } else {
          td.textContent = c.text;
        }
        if (c.sub) td.append(Object.assign(document.createElement('small'), {textContent: c.sub}));
        tr.append(td);
      });
      table.append(tr);
    }
    renderScore(nm);
    if (S.snap) markRow(S.snap);
  }
  function renderScore(nm) {
    const el = $('table-score');
    const results = S.mode === 'predict' ? S.tab.res : S.mode === 'build' ? S.tab.bres : null;
    el.replaceChildren();
    if (!results) return;
    const total = 1 << nm.inN.length;
    let good = 0;
    for (let r = 0; r < total; r++) if (results[r] && results[r].every(x => x.ok)) good++;
    const b = document.createElement('b');
    b.className = good === total ? 'cmc-ok' : 'cmc-bad';
    b.textContent = t('score', good, total) + (good === total && S.mode === 'predict' ? ' · ' + t('scorePerfect') : '');
    el.append(b);
    if (good < total && S.mode === 'predict') el.append(' · ' + t('wrongTip'));
  }
  function renderStates() {
    const box = $('seq-box');
    box.replaceChildren();
    const table = document.createElement('table');
    table.className = 'cmc-table lg-tt';
    lessonById(S.cur.id).states.forEach((row, i) => {
      const tr = document.createElement('tr');
      row.forEach(cell => {
        const td = document.createElement(i ? 'td' : 'th');
        td.textContent = Array.isArray(cell) ? tx(cell) : cell;
        tr.append(td);
      });
      table.append(tr);
    });
    box.append(table);
  }
  function markRow(sn) {
    document.querySelectorAll('#tt tr.hit').forEach(tr => tr.classList.remove('hit'));
    const nm = $('tt').hidden || S.mode === 'build' ? null : tableNames();
    if (!nm || JSON.stringify(nm.inN) !== JSON.stringify(sn.inputs.map(i => i.name))) return;
    const tr = $('tt').querySelector('tr[data-row="' + curRow(sn) + '"]');
    if (tr) tr.classList.add('hit');
  }
  function tableText() {
    const nm = tableNames();
    if (!nm) return '';
    const lines = [nm.inN.concat(nm.outN).join('\t')];
    for (let r = 0; r < 1 << nm.inN.length; r++) {
      const cells = nm.outN.map((_, o) => {
        const c = cellState(r, o, nm);
        return c.empty ? '' : c.text;
      });
      lines.push(rowBits(r, nm.inN.length).concat(cells).join('\t'));
    }
    return lines.join('\n');
  }
  async function copyTable() {
    const text = tableText();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      toast(t('copied'));
    } catch (e) {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.append(ta);
      ta.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
      ta.remove();
      toast(t(ok ? 'copied' : 'copyFail'));
    }
  }
  /* Runs every input combination on the live circuit and stores the actual outputs. */
  async function generate(announce) {
    if (S.busy) return null;
    const sn = snapshot();
    const problem = ioProblem(sn);
    if (problem) { toast(problem); return null; }
    setBusy(true);
    let res;
    try {
      res = await runRows(sn.inputs, sn.leds, Array.from({length: 1 << sn.inputs.length}, (_, r) => r));
    } finally {
      setBusy(false);
    }
    S.tab.actual = {};
    res.out.forEach((row, r) => { S.tab.actual[r] = row; });
    if (res.unpowered.length) toast(t('unpowered', res.unpowered.join(', ')));
    else if (!res.settled) toast(t('unstable'));
    else if (announce) toast(t('genDone'));
    refreshLive(true);
    renderTable();
    return res;
  }
  async function checkPredictions() {
    if (S.busy) return;
    const sn = snapshot();
    const problem = ioProblem(sn);
    if (problem) { toast(problem); return; }
    if (!Object.keys(S.tab.pred).length) { toast(t('nothing')); return; }
    const res = await generate(false);
    if (!res) return;
    S.tab.res = {};
    res.out.forEach((row, r) => {
      S.tab.res[r] = row.map((v, o) => ({ok: S.tab.pred[r + ':' + o] === v, actual: v}));
    });
    renderTable();
  }
  async function stepRow() {
    if (S.busy) return;
    const sn = snapshot();
    const problem = ioProblem(sn);
    if (problem) { toast(problem); return; }
    const total = 1 << sn.inputs.length;
    const r = (curRow(sn) + 1) % total;
    const bits = rowBits(r, sn.inputs.length);
    setBusy(true);
    let out;
    try {
      sn.inputs.forEach((inp, k) => setToggle(inp, !!bits[k]));
      await settle(sn.leds);
      out = sn.leds.map(ledValue);
    } finally {
      setBusy(false);
    }
    if (S.mode === 'explore') S.tab.actual[r] = out;
    refreshLive(true);
    renderTable();
    $('status').textContent = t('rowStatus', r + 1, total, sn.inputs.map((inp, k) => inp.name + '=' + bits[k]).join(' '), sn.leds.map((l, o) => l.name + '=' + out[o]).join(' '));
  }
  function clearTable() {
    if (S.mode === 'predict') { S.tab.pred = {}; S.tab.res = null; } else S.tab.actual = {};
    renderTable();
  }
  function setPrediction(btn, v) {
    const key = btn.dataset.r + ':' + btn.dataset.o;
    if (v == null) delete S.tab.pred[key]; else S.tab.pred[key] = v;
    if (S.tab.res) {
      S.tab.res = null;
      renderTable();
      const again = $('tt').querySelector('.lg-cell[data-r="' + btn.dataset.r + '"][data-o="' + btn.dataset.o + '"]');
      if (again) again.focus();
      return;
    }
    btn.textContent = v == null ? '?' : v;
    btn.classList.toggle('empty', v == null);
    btn.setAttribute('aria-label', btn.getAttribute('aria-label').replace(/: [^:]*$/, ': ' + btn.textContent));
  }
  function cycleCell(btn) {
    const cur = S.tab.pred[btn.dataset.r + ':' + btn.dataset.o];
    setPrediction(btn, cur == null ? 0 : cur === 0 ? 1 : null);
  }

  /* ---------- panels ---------- */
  function renderSelects() {
    const fill = (select, items, groups, current) => {
      select.replaceChildren();
      Object.keys(groups).forEach(g => {
        const og = document.createElement('optgroup');
        og.label = tx(groups[g]);
        items.filter(i => i.topic === g).forEach(i => og.append(Object.assign(document.createElement('option'), {value: i.id, textContent: tx(i.title)})));
        select.append(og);
      });
      select.value = current;
    };
    fill($('lesson-select'), D.lessons, D.topics, S.lesson);
    fill($('challenge-select'), D.challenges, D.ctopics, S.challenge);
  }
  function renderPanels() {
    const mode = S.mode;
    const show = (id, on) => { $(id).hidden = !on; };
    show('pane-table', mode !== 'read');
    show('pane-read', mode === 'read');
    show('pane-build', mode === 'build');
    show('pick-lesson', mode === 'explore' || mode === 'predict');
    show('pick-challenge', mode === 'build');
    const seq = isSeq();
    show('step-btn', !seq && (mode === 'explore' || mode === 'predict'));
    show('gen-btn', !seq && mode === 'explore');
    show('check-btn', !seq && mode === 'predict');
    show('clear-btn', !seq && (mode === 'explore' || mode === 'predict'));
    show('copy-btn', !seq);
    show('key-btn', mode !== 'read');
    show('sheet-btn', mode !== 'read');
    const lesson = S.cur && S.cur.kind === 'lesson' ? lessonById(S.cur.id) : null;
    let title = '', story = '', legend = '', teach = '';
    if (mode === 'build') {
      const c = challengeById(S.challenge);
      title = tx(c.title); story = tx(c.task); teach = tx(c.teach) + ' ' + t('teachBuild');
      let rules = t('buildRules', c.inputs.join(', '), c.outputs.join(', '));
      if (c.only) rules += t('buildOnly', c.only.join(', '));
      if (c.ban) rules += t('buildBan', c.ban.join(', '));
      $('build-task').textContent = story;
      $('build-rules').textContent = rules;
      $('build-hint-text').textContent = tx(c.hint);
      show('build-hint-text', S.hintShown);
    } else if (mode === 'read') {
      title = t('mystery') + ' #' + (S.readAsked + (S.read && S.read.answered ? 0 : 1));
      story = t('mysteryStory');
      if (S.read && S.read.answered) { const l = lessonById(S.read.lesson); title = tx(l.title); story = tx(l.story); legend = tx(l.legend); }
    } else if (lesson) {
      title = tx(lesson.title); story = tx(lesson.story); legend = tx(lesson.legend); teach = tx(lesson.teach) + ' ' + tx(lesson.ask);
    } else {
      title = t('yourCircuit'); story = t('yourCircuitStory');
    }
    show('expr-box', mode === 'explore' || mode === 'predict');
    if (mode === 'explore' || mode === 'predict') {
      $('expr').textContent = S.exprShown ? liveExpression() || t('exprNone') : '';
      show('expr', S.exprShown);
      $('expr-toggle').textContent = t(S.exprShown ? 'exprHide' : 'exprShow');
      $('expr-toggle').setAttribute('aria-pressed', String(S.exprShown));
    }
    $('lesson-title').textContent = title;
    $('story').textContent = story;
    $('legend').textContent = legend;
    show('legend', !!legend);
    $('teach').textContent = teach;
    show('teach-box', !!teach);
    renderTable();
    if (mode === 'read') renderRead();
  }
  function renderHelp() {
    const body = $('help-body');
    body.replaceChildren();
    ['helpExplore', 'helpPredict', 'helpRead', 'helpBuild', 'helpFiles', 'helpKeys', 'helpOps'].forEach(k => body.append(Object.assign(document.createElement('p'), {textContent: t(k)})));
  }
  function renderAll() {
    renderSelects();
    renderPanels();
    if (S.snap) renderLive(S.snap, S.snap.inputs.map(i => [i.name, isOn(i) ? 1 : 0]), S.snap.leds.map(l => [l.name, ledValue(l)]));
  }

  /* ---------- read-the-circuit quiz ---------- */
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const tableKey = (net, oi) => Array.from({length: 1 << net.in.length}, (_, r) => evalNet(net, rowBits(r, net.in.length))[oi]).join('');
  /* Wrong answers: the same circuit with one gate swapped, one wire moved or the output inverted. */
  function distractors(net, oi, want) {
    const outRef = net.out[oi][1];
    const cone = new Set();
    const walk = ref => {
      const g = net.g.find(x => x[0] === ref);
      if (g && !cone.has(ref)) { cone.add(ref); g.slice(2).forEach(walk); }
    };
    walk(outRef);
    const seenExpr = new Set([exprOf(net, outRef)]), seenTable = new Set([tableKey(net, oi)]);
    const result = [];
    const kinds = ['AND', 'OR', 'NAND', 'NOR', 'XOR', 'XNOR'];
    const ids = [...cone];
    for (let attempt = 0; attempt < 400 && result.length < want; attempt++) {
      const m = JSON.parse(JSON.stringify(net));
      const pickId = ids[Math.floor(Math.random() * ids.length)];
      const g = m.g.find(x => x[0] === pickId);
      const how = Math.floor(Math.random() * 4);
      if (how === 0 && kinds.includes(g[1])) g[1] = kinds.filter(k => k !== g[1])[Math.floor(Math.random() * 5)];
      else if (how === 1) g[2 + Math.floor(Math.random() * (g.length - 2))] = m.in[Math.floor(Math.random() * m.in.length)];
      else if (how === 2 && g[1] === 'NOT') g[1] = 'BUF';
      else if (how === 3 && result.length < 1) { m.g.push(['wrap', 'NOT', outRef]); m.out[oi][1] = 'wrap'; }
      else continue;
      const text = exprOf(m, m.out[oi][1]);
      const key = tableKey(m, oi);
      if (seenExpr.has(text) || seenTable.has(key)) continue;
      seenExpr.add(text);
      seenTable.add(key);
      result.push(text);
    }
    return result;
  }
  function newQuestion() {
    const pool = D.lessons.filter(l => !l.seq && !l.noRead && (!S.read || l.id !== S.read.lesson));
    const l = pool[Math.floor(Math.random() * pool.length)];
    const oi = Math.floor(Math.random() * l.net.out.length);
    const correct = exprOf(l.net, l.net.out[oi][1]);
    const opts = shuffle([{text: correct, ok: true}, ...distractors(l.net, oi, 3).map(text => ({text, ok: false}))]);
    S.read = {lesson: l.id, outName: l.net.out[oi][0], opts, answered: false, picked: -1, correct};
    mount(buildData(l.net), {kind: 'read', id: l.id});
  }
  function renderRead() {
    const r = S.read;
    if (!r) return;
    $('read-q').textContent = t('readQ', r.outName);
    const box = $('read-opts');
    box.replaceChildren();
    r.opts.forEach((o, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'lg-opt' + (r.answered ? (o.ok ? ' ok' : i === r.picked ? ' bad' : '') : '');
      b.setAttribute('aria-pressed', String(i === r.picked));
      b.append(Object.assign(document.createElement('b'), {textContent: '①②③④'[i]}), r.outName + ' = ' + o.text);
      b.addEventListener('click', () => answer(i));
      box.append(b);
    });
    $('read-score').textContent = t('readScore', S.readAsked, S.readRight);
    $('read-reveal').disabled = r.answered;
    const full = r.outName + ' = ' + r.correct;
    $('read-fb').textContent = !r.answered ? '' : r.picked >= 0 && r.opts[r.picked].ok ? t('readRight', full) : t('readWrong', full);
  }
  function answer(i) {
    const r = S.read;
    if (!r || r.answered) return;
    r.answered = true;
    r.picked = i;
    S.readAsked++;
    if (r.opts[i].ok) S.readRight++;
    renderPanels();
  }
  function revealAnswer() {
    const r = S.read;
    if (!r || r.answered) return;
    r.answered = true;
    r.picked = -2;
    S.readAsked++;
    renderPanels();
  }

  /* ---------- build challenge check ---------- */
  async function checkBuild() {
    if (S.busy) return;
    const c = challengeById(S.challenge);
    const sn = snapshot();
    const out = $('build-result');
    out.replaceChildren();
    if (!sn) return;
    const add = (cls, text) => out.append(Object.assign(document.createElement('p'), {className: 'cmc-note' + (cls ? ' ' + cls : ''), textContent: text}));
    const byLabel = (list, name) => list.find(x => x.label.toLowerCase() === name.toLowerCase());
    const inputs = c.inputs.map(n => byLabel(sn.inputs, n));
    const leds = c.outputs.length === 1 && sn.leds.length === 1 ? [sn.leds[0]] : c.outputs.map(n => byLabel(sn.leds, n));
    let missing = 0;
    c.inputs.forEach((n, i) => { if (!inputs[i]) { add('warn', t('missingSwitch', n)); missing++; } });
    c.outputs.forEach((n, i) => { if (!leds[i]) { add('warn', t('missingLed', n)); missing++; } });
    const bad = [...new Set(sn.data.devices.map(d => d.type))].filter(x => GATES.includes(x) && ((c.only && !c.only.includes(x)) || (c.ban && c.ban.includes(x))));
    bad.forEach(x => add('warn', t('badGate', x)));
    if (missing) { S.tab.bres = null; renderTable(); return; }
    const extra = sn.inputs.filter(i => !inputs.includes(i));
    if (extra.length) add('', t('extraSwitch', extra.map(i => i.name).join(', ')));
    const total = 1 << c.inputs.length;
    setBusy(true);
    let res;
    try {
      res = await runRows(inputs, leds, Array.from({length: total}, (_, r) => r), extra);
    } finally {
      setBusy(false);
    }
    S.tab.bres = {};
    let good = 0;
    res.out.forEach((row, r) => {
      const want = c.fn(rowBits(r, c.inputs.length));
      S.tab.bres[r] = row.map((v, o) => ({ok: v === want[o], actual: v}));
      if (S.tab.bres[r].every(x => x.ok)) good++;
    });
    res.unpowered.forEach(n => add('warn', t('unpowered', n)));
    const win = good === total && !bad.length;
    add(win ? 'cmc-ok' : 'warn', win ? t('pass', total) : t('fail', good, total));
    renderTable();
    refreshLive(true);
  }

  /* ---------- teacher tools ---------- */
  function exportJson() {
    if (!S.snap) return;
    const json = JSON.stringify({app: 'cmc-logic', version: 1, circuit: S.snap.data}, null, 2);
    const url = URL.createObjectURL(new Blob([json], {type: 'application/json'}));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'logic-circuit-' + new Date().toISOString().slice(0, 10) + '.json';
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    toast(t('exported'));
  }
  function importFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        if (mount(sanitize(JSON.parse(String(reader.result))), {kind: 'import'})) toast(t('imported'));
      } catch (e) {
        toast(t('importBad'));
      }
    };
    reader.onerror = () => toast(t('importBad'));
    reader.readAsText(file);
  }
  function saveLocal() {
    if (!S.snap) return;
    toast(t(store.set('saved', {savedAt: Date.now(), circuit: S.snap.data}) ? 'saved' : 'saveFail'));
  }
  function loadLocal() {
    const saved = store.get('saved');
    if (!saved) { toast(t('noSaved')); return; }
    try {
      if (mount(sanitize(saved), {kind: 'import'})) toast(t('restored'));
    } catch (e) {
      toast(t('importBad'));
    }
  }
  function rosterNames() {
    try {
      const raw = JSON.parse(localStorage.getItem('mc_classes') || 'null');
      const list = raw && Array.isArray(raw.list) ? raw.list : [];
      const cls = list.find(c => c && c.id === raw.active) || list.find(c => c && Array.isArray(c.names) && c.names.length);
      return cls && Array.isArray(cls.names) ? cls.names.filter(n => typeof n === 'string' && n.trim()).map(n => n.trim()) : [];
    } catch (e) {
      return [];
    }
  }
  function pickStudent() {
    const names = rosterNames();
    if (!names.length) { toast(t('noRoster')); return; }
    let pool = names.filter(n => !S.picked.includes(n));
    if (!pool.length) { S.picked = []; pool = names; }
    const name = pool[Math.floor(Math.random() * pool.length)];
    S.picked.push(name);
    $('student-name').textContent = name;
    $('student-overlay').hidden = false;
    $('student-again').focus();
  }
  function closeStudent() {
    $('student-overlay').hidden = true;
    $('student-btn').focus();
  }
  function figureClone() {
    const ws = workspaceEl();
    if (!ws) return null;
    const clone = ws.cloneNode(true);
    clone.querySelectorAll('.simcir-toolbox').forEach(el => el.remove());
    clone.querySelectorAll('[tabindex]').forEach(el => el.removeAttribute('tabindex'));
    const maxY = Math.max(0, ...(S.snap ? S.snap.data.devices.map(d => d.y) : [0]));
    const w = Number(ws.getAttribute('width')) || 800, h = Math.min(Number(ws.getAttribute('height')) || 480, maxY + 80), off = 112;
    clone.setAttribute('viewBox', off + ' 0 ' + (w - off) + ' ' + h);
    clone.setAttribute('width', w - off);
    clone.setAttribute('height', h);
    return clone;
  }
  async function printSheet(withKey) {
    if (S.busy) return;
    const ws = $('worksheet');
    let title, story, nm, rows;
    if (S.mode === 'build') {
      const c = challengeById(S.challenge);
      title = tx(c.title); story = tx(c.task);
      nm = {inN: c.inputs, outN: c.outputs};
      rows = Array.from({length: 1 << c.inputs.length}, (_, r) => c.fn(rowBits(r, c.inputs.length)));
    } else {
      const sn = snapshot();
      const problem = ioProblem(sn);
      if (problem) { toast(problem); return; }
      nm = {inN: sn.inputs.map(i => i.name), outN: sn.leds.map(l => l.name)};
      const lesson = S.cur && S.cur.kind === 'lesson' && lessonById(S.cur.id);
      title = lesson ? tx(lesson.title) : t('yourCircuit');
      story = lesson ? tx(lesson.story) + '  ' + tx(lesson.legend) : '';
      if (withKey) {
        const res = await generate(false);
        if (!res) return;
        rows = res.out;
      }
    }
    const el = (tag, text, cls) => Object.assign(document.createElement(tag), {textContent: text, className: cls || ''});
    ws.replaceChildren(el('h1', t('sheetTitle') + (withKey ? ' — ' + t('sheetKey') : '') + ': ' + title), el('div', '', 'ws-meta'));
    ws.lastChild.append(el('span', t('sheetName')));
    if (story) ws.append(el('p', story));
    if (S.mode === 'build') {
      ws.append(el('h2', t('sheetQ2')), el('div', t('sheetDraw'), 'ws-box'));
    } else {
      ws.append(el('h2', t('sheetQ1')));
      const fig = figureClone();
      if (fig) ws.append(fig);
      ws.append(el('p', withKey ? liveExpression().replace(/\n/g, ';  ') : t('sheetExpr')));
    }
    const table = document.createElement('table');
    const head = document.createElement('tr');
    nm.inN.concat(nm.outN).forEach(n => head.append(el('th', n)));
    table.append(head);
    for (let r = 0; r < 1 << nm.inN.length; r++) {
      const tr = document.createElement('tr');
      rowBits(r, nm.inN.length).forEach(b => tr.append(el('td', b)));
      nm.outN.forEach((_, o) => tr.append(el('td', rows && rows[r] ? rows[r][o] : '')));
      table.append(tr);
    }
    ws.append(table);
    ws.setAttribute('aria-hidden', 'false');
    setTimeout(() => window.print(), 80);
  }
  window.addEventListener('afterprint', () => {
    $('worksheet').replaceChildren();
    $('worksheet').setAttribute('aria-hidden', 'true');
  });

  /* ---------- modes, language, events ---------- */
  function setMode(mode) {
    if (mode === S.mode && S.cur) return;
    S.mode = mode;
    document.querySelectorAll('#modes [data-mode]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mode === mode)));
    S.exprShown = mode !== 'predict';
    const kind = S.cur && S.cur.kind;
    if (mode === 'build') { if (kind !== 'challenge') loadChallenge(S.challenge); else renderPanels(); }
    else if (mode === 'read') newQuestion();
    else if (kind === 'challenge' || kind === 'read') loadLesson(S.lesson);
    else renderPanels();
    savePrefs();
  }
  function localize() {
    document.documentElement.lang = zh ? 'zh-Hans' : 'en';
    document.title = t('title');
    document.querySelectorAll('[data-i18n]').forEach(el => { if (!el.dataset.armed) el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll('[data-i18n-aria]').forEach(el => el.setAttribute('aria-label', t(el.dataset.i18nAria)));
    $('language').textContent = zh ? 'English' : '中文';
    $('language').setAttribute('lang', zh ? 'en' : 'zh-Hans');
    renderHelp();
  }
  function applyLanguage(lang) {
    if (lang !== 'en' && lang !== 'zh') return;
    zh = lang === 'zh';
    localize();
    renderAll();
    accessibleSwitches();
    const url = new URL(location.href);
    url.searchParams.set('lang', lang);
    history.replaceState(null, '', url.href);
  }
  window.addEventListener('message', event => {
    if (event.origin !== location.origin || event.source !== window.parent || !event.data || event.data.type !== 'cmc-language') return;
    applyLanguage(event.data.lang);
  });
  /* Destructive buttons ask for a second click when the circuit has been edited. */
  function guarded(btn, fn) {
    if (!isModified() || btn.dataset.armed) {
      delete btn.dataset.armed;
      btn.textContent = t(btn.dataset.i18n);
      fn();
      return;
    }
    btn.dataset.armed = '1';
    btn.textContent = t('sure');
    setTimeout(() => {
      delete btn.dataset.armed;
      btn.textContent = t(btn.dataset.i18n);
    }, 3500);
  }
  function setBoard(on) {
    document.body.classList.toggle('cmc-board', on);
    $('board-btn').setAttribute('aria-pressed', String(on));
    savePrefs();
  }

  function bind() {
    document.querySelectorAll('#modes [data-mode]').forEach(b => b.addEventListener('click', () => setMode(b.dataset.mode)));
    $('lesson-select').addEventListener('change', e => loadLesson(e.target.value));
    $('challenge-select').addEventListener('change', e => loadChallenge(e.target.value));
    $('lesson-reset').addEventListener('click', e => guarded(e.currentTarget, () => loadLesson(S.lesson)));
    $('challenge-reset').addEventListener('click', e => guarded(e.currentTarget, () => loadChallenge(S.challenge)));
    $('blank-btn').addEventListener('click', e => guarded(e.currentTarget, loadBlank));
    $('restore-btn').addEventListener('click', e => guarded(e.currentTarget, loadLocal));
    $('build-sol').addEventListener('click', e => guarded(e.currentTarget, loadSolution));
    $('save-btn').addEventListener('click', saveLocal);
    $('export-btn').addEventListener('click', exportJson);
    $('import-btn').addEventListener('click', () => $('import-file').click());
    $('import-file').addEventListener('change', e => { importFile(e.target.files[0]); e.target.value = ''; });
    $('sheet-btn').addEventListener('click', () => printSheet(false));
    $('key-btn').addEventListener('click', () => printSheet(true));
    $('step-btn').addEventListener('click', stepRow);
    $('gen-btn').addEventListener('click', () => generate(true));
    $('check-btn').addEventListener('click', checkPredictions);
    $('clear-btn').addEventListener('click', clearTable);
    $('copy-btn').addEventListener('click', copyTable);
    $('expr-toggle').addEventListener('click', () => { S.exprShown = !S.exprShown; renderPanels(); });
    $('read-next').addEventListener('click', newQuestion);
    $('read-reveal').addEventListener('click', revealAnswer);
    $('build-check').addEventListener('click', checkBuild);
    $('build-hint').addEventListener('click', () => { S.hintShown = !S.hintShown; renderPanels(); });
    $('student-btn').addEventListener('click', pickStudent);
    $('student-again').addEventListener('click', pickStudent);
    $('student-close').addEventListener('click', closeStudent);
    $('board-btn').addEventListener('click', () => setBoard(!document.body.classList.contains('cmc-board')));
    $('language').addEventListener('click', () => applyLanguage(zh ? 'en' : 'zh'));
    $('tt').addEventListener('click', e => { const b = e.target.closest('.lg-cell'); if (b) cycleCell(b); });
    $('tt').addEventListener('keydown', e => {
      const b = e.target.closest('.lg-cell');
      if (!b) return;
      if (e.key === '0' || e.key === '1') { e.preventDefault(); setPrediction(b, Number(e.key)); }
      else if (e.key === 'Backspace' || e.key === 'Delete') { e.preventDefault(); setPrediction(b, null); }
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && !$('student-overlay').hidden) { closeStudent(); return; }
      if (e.ctrlKey || e.metaKey || e.altKey || !$('student-overlay').hidden) return;
      if (e.target.closest && e.target.closest('input,textarea,select,.lg-cell,.simcir-dialog')) return;
      const k = e.key.toLowerCase();
      if (/^[1-9]$/.test(k)) {
        if (S.mode === 'read') { if (S.read && S.read.opts[Number(k) - 1]) answer(Number(k) - 1); return; }
        const inp = S.snap && S.snap.inputs[Number(k) - 1];
        if (inp) { setToggle(inp, !isOn(inp)); refreshLive(true); }
      } else if (k === 'n' && S.mode !== 'read') stepRow();
      else if (k === 'g' && S.mode === 'explore') generate(true);
      else if (k === 'c') { if (S.mode === 'predict') checkPredictions(); else if (S.mode === 'build') checkBuild(); }
      else if (k === 'p') setBoard(!document.body.classList.contains('cmc-board'));
      else if (k === 'k') pickStudent();
      else if (k === '?') { const h = $('help'); h.open = !h.open; if (h.open) h.scrollIntoView({block: 'nearest'}); }
    });
  }

  function init() {
    localize();
    bind();
    if (prefs.board) setBoard(true);
    document.querySelectorAll('#modes [data-mode]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mode === S.mode)));
    if (S.mode === 'build') loadChallenge(S.challenge);
    else if (S.mode === 'read') newQuestion();
    else loadLesson(S.lesson);
    const observer = new MutationObserver(() => accessibleSwitches());
    observer.observe($('circuit'), {childList: true, subtree: true});
    const timer = setInterval(() => { if (!S.busy) refreshLive(false); }, 250);
    window.addEventListener('pagehide', event => {
      if (event.persisted) return;
      observer.disconnect();
      clearInterval(timer);
      const ws = workspaceEl();
      if (ws) simcir.$(ws).trigger('dispose');
    });
    window.addEventListener('pageshow', event => { if (event.persisted) { accessibleSwitches(); refreshLive(true); } });
  }
  init();
})();
