import { challenges } from "./particles-challenges.js";

(async () => {
  "use strict";
  const GRID = 160;
  const STORE = "mc_tool_particles_state";
  const params = new URLSearchParams(location.search);
  let lang = params.get("lang") === "zh" ? 1 : 0;

  // ---------- words table: [English, Chinese] ----------
  const T = {
    titleA: ["Particle", "粒子"], titleB: ["Sandbox", "沙盒"],
    sub: ["Predict, paint, run and observe. A falling-sand lab with ready-made challenges and observation sheets.", "预测、绘制、运行、观察。带有现成挑战和观察记录表的落沙实验室。"],
    board: ["Projector mode", "投影模式"], boardOff: ["Exit projector mode", "退出投影模式"],
    noteHead: ["Playful simulation", "趣味模拟"],
    disclaimer: ["A creative toy, not accurate chemistry or a scientific model. Its rules are playful; do not use it to predict real-world reactions.", "这是创意玩具，不是精确的化学模拟或科学模型。规则是趣味性的，请勿用来预测现实中的反应。"],
    errHead: ["The simulation can't start here", "此处无法启动模拟"],
    error: ["Unable to start. A browser supporting WebAssembly, WebGL and floating-point textures is required. Open through the local Mission Control server.", "无法启动。需要支持 WebAssembly、WebGL 和浮点纹理的浏览器。请通过本地 Mission Control 服务器打开。"],
    errOffline: [" The challenges, teacher notes, timer, student picker and observation sheet still work, so you can plan the lesson and print the sheets now, then run the simulation on a device with WebGL.", "挑战、教师备注、计时器、点名器和观察记录表仍然可用，你可以先备课并打印记录表，再在支持 WebGL 的设备上运行模拟。"],
    offlineStage: ["Simulation unavailable on this device (WebGL is needed). The panels around it still work.", "此设备无法运行模拟（需要 WebGL）。周围的面板仍可使用。"],
    errGo: ["Open the challenges", "打开挑战"], errSheet: ["Go to observation sheet", "前往观察记录表"],
    activity: ["Activity", "活动"],
    timerStart: ["Start", "开始"], timerPause: ["Pause", "暂停"], timerResume: ["Resume", "继续"], timerReset: ["Reset", "重置"],
    pickShort: ["Pick student", "点名"],
    pause: ["Pause", "暂停"], run: ["Run", "运行"], step: ["Step", "单步"], speed: ["Speed", "速度"],
    undo: ["Undo", "撤销"], rewind: ["Back to start", "回到起点"], clear: ["Clear", "清空"], snap: ["Snapshot", "快照"],
    brush: ["Brush size", "画笔大小"], shape: ["Brush shape", "画笔形状"],
    shapes: [["Round", "Square", "Spray"], ["圆形", "方形", "喷雾"]],
    loading: ["Loading local Sandspiel engine…", "正在加载本地 Sandspiel 引擎…"],
    instructions: ["Drag on the canvas to paint. Keyboard: focus the canvas, use the arrow keys to move the brush and Enter to paint. Space pauses. The eraser removes anything.", "在画布上拖动绘制。键盘：聚焦画布后，用方向键移动画笔，回车绘制，空格暂停。橡皮擦可清除任何材料。"],
    canvas: ["Particle canvas", "粒子画布"],
    running: ["Running", "运行中"], paused: ["Paused. Painting still works; press Run to start.", "已暂停。仍可绘制；按“运行”开始。"],
    cursor: [(x, y) => `Brush position: ${x}, ${y}`, (x, y) => `画笔位置：${x}，${y}`],
    tabMat: ["Materials", "材料"], tabCh: ["Challenges", "挑战"], tabCls: ["Class", "课堂"],
    matHead: ["Materials", "材料"], onCanvas: ["On the canvas", "画布上的材料"],
    chHead: ["Challenges", "挑战"], clsHead: ["Class tools", "课堂工具"],
    pickHead: ["Pick a student", "随机点名"], classLabel: ["Class", "班级"],
    pick: ["Pick a student", "随机点名"], randMat: ["Random material", "随机材料"],
    picked: [n => `${n} chooses the next material!`, n => `${n} 来选下一种材料！`],
    pickedBig: ["Next material chosen by", "下一种材料由谁选择"],
    noRoster: ["No class roster found. Add a class with names in the hub's Classes tool and it appears here, or use Random material.", "没有找到班级名单。在中控台的“班级”工具里添加名单后会显示在这里，也可以使用“随机材料”。"],
    rosterNew: ["Everyone has had a turn. Starting a new round.", "每个人都轮过了，开始新一轮。"],
    rosterLeft: [(n, m) => `${n} of ${m} not yet picked this round`, (n, m) => `本轮还剩 ${n} / ${m} 人未被点到`],
    randBig: ["Random material", "随机材料"],
    randPicked: [n => `Random material: ${n}`, n => `随机材料：${n}`],
    timerHead: ["Countdown timer", "倒计时"], minutes: ["Minutes", "分钟"],
    beepLabel: ["Soft beep when time is up", "时间到时发出轻柔提示音"],
    freezeLabel: ["Pause the simulation when time is up", "时间到时暂停模拟"],
    timeUp: ["Time's up!", "时间到！"],
    keysHead: ["Keyboard shortcuts", "键盘快捷键"],
    keys: [[["1 – 9", "Choose a material"], ["0 / E", "Eraser"], ["[ ]", "Smaller / larger brush"], ["Space", "Run / pause"], [". (full stop)", "Step one frame"], ["Z", "Undo last stroke"], ["C", "Clear the canvas"], ["S", "Take a snapshot"], ["R", "Back to start of run"], ["T", "Start / pause the timer"], ["N", "Pick a student"], ["P", "Projector mode"]],
           [["1 – 9", "选择材料"], ["0 / E", "橡皮擦"], ["[ ]", "减小 / 增大画笔"], ["空格", "运行 / 暂停"], [". （句号）", "单步前进一帧"], ["Z", "撤销上一笔"], ["C", "清空画布"], ["S", "拍摄快照"], ["R", "回到本次运行的起点"], ["T", "开始 / 暂停计时"], ["N", "随机点名"], ["P", "投影模式"]]],
    sheetHead: ["Observation sheet", "观察记录表"],
    sheetFor: [n => `Activity: ${n}`, n => `活动：${n}`],
    who: ["Name / group", "姓名 / 小组"],
    hypo: ["Hypothesis (what I think will happen)", "假设（我认为会发生什么）"],
    obs: ["Observation (what I saw)", "观察（我看到了什么）"],
    expl: ["Explanation (why it happened)", "解释（为什么会这样）"],
    print: ["Print sheet", "打印记录表"], copy: ["Copy as text", "复制为文本"], sheetClear: ["Clear this sheet", "清空此记录表"],
    saved: ["Saved on this device", "已保存在本设备"], copied: ["Copied to the clipboard", "已复制到剪贴板"], copyFail: ["Could not copy. Select the text and copy it manually.", "无法复制，请手动选择文本复制。"],
    sheetCleared: ["Sheet cleared", "记录表已清空"],
    date: ["Date", "日期"], printTitle: ["Particle Sandbox: observation sheet", "粒子沙盒：观察记录表"],
    snapshotsPrint: ["Snapshots", "快照"], taskLabel: ["Task", "任务"], goalLabel: ["Goal", "目标"],
    galHead: ["Snapshots", "快照"],
    galSub: ["Up to 6 snapshots are kept in memory while this page is open. Download them individually, or all together as one image.", "本页面打开期间，内存中最多保留 6 张快照。可单独下载，也可合并成一张图下载。"],
    galAll: ["Download all as one image", "合并下载为一张图"], galClear: ["Delete all", "全部删除"],
    galEmpty: ["No snapshots yet. Press Snapshot (S) to capture the canvas.", "还没有快照。按“快照”（S）即可截取画布。"],
    galDl: ["Download", "下载"], galDel: ["Delete", "删除"],
    galFull: ["Gallery full: the oldest snapshot was replaced.", "相册已满：最旧的快照已被替换。"],
    snapTaken: [n => `Snapshot ${n} saved`, n => `已保存快照 ${n}`],
    snapAlt: [n => `Snapshot ${n}`, n => `快照 ${n}`],
    credit: ["Powered by authentic Sandspiel by Max Bittker, MIT licensed. No accounts, uploads, sharing or online services.", "采用 Max Bittker 的原版 Sandspiel 引擎（MIT 许可证）。无需账户，无上传、分享或在线服务。"],
    license: ["License", "许可证"], third: ["Third-party notices", "第三方声明"],
    free: ["Free play", "自由探索"],
    freeText: ["Paint anything you like. Pause, predict what will happen, then press Run. Pick a challenge to load a ready-made scene.", "随意绘制。先暂停，预测会发生什么，再按“运行”。选择一个挑战可加载现成场景。"],
    freeGoal: ["Free play: choose a material and paint.", "自由探索：选择材料并绘制。"],
    loadScene: ["Load scene", "加载场景"], writeHyp: ["Write hypothesis", "写下假设"],
    startTimer: [m => `Timer ${m} min`, m => `计时 ${m} 分钟`],
    predictHead: ["Predict first", "先预测"], taskHead: ["Student task", "学生任务"], goalHead: ["Goal", "目标"],
    teacherHead: ["Teacher notes", "教师备注"], questionHead: ["Discussion question", "讨论问题"], vocabHead: ["Vocabulary", "词汇"],
    expectHead: ["Reveal: what usually happens", "揭晓：通常会发生什么"], suggested: ["Suggested materials", "推荐材料"],
    sceneLoaded: [n => `Scene loaded: ${n}. Predict first, then press Run.`, n => `已加载场景：${n}。先预测，再按“运行”。`],
    pickedStatus: [n => `${n} chosen`, n => `已选择 ${n}`],
    undone: ["Last stroke undone", "已撤销上一笔"], nothingUndo: ["Nothing to undo", "没有可撤销的操作"],
    rewound: ["Back to the start of the run. Press Run to try again.", "已回到本次运行的起点。按“运行”重试。"],
    cleared: ["Canvas cleared (Undo brings it back)", "画布已清空（可撤销恢复）"],
    goalMet: ["Goal met!", "目标达成！"],
    zoneNow: [(l, n) => `${l}: ${n}`, (l, n) => `${l}：${n}`],
    zoneMin: [(l, n, m) => `${l}: ${n} / ${m}`, (l, n, m) => `${l}：${n} / ${m}`],
    zoneRange: [(l, p, a, b) => `${l}: ${p}% (target ${a}–${b}%)`, (l, p, a, b) => `${l}：${p}%（目标 ${a}–${b}%）`],
    zoneKeep: [(l, n, s, p, m) => `${l}: ${n} of ${s} left (${p}%, need ${m}%)`, (l, n, s, p, m) => `${l}：剩余 ${n} / ${s}（${p}%，需要 ${m}%）`],
    zonePeak: [(l, n, k) => `${l}: now ${n}, peak ${k}`, (l, n, k) => `${l}：当前 ${n}，峰值 ${k}`],
  };
  const t = (key, ...args) => {
    const v = T[key][lang];
    return typeof v === "function" ? v(...args) : v;
  };

  // ---------- materials ----------
  const MATS = [
    { k: "Sand", c: "#dcae52", n: ["Sand", "沙"], d: ["Falls and piles up. Sinks through water.", "会下落堆积，能沉入水中。"] },
    { k: "Water", c: "#3d84e6", n: ["Water", "水"], d: ["Flows and spreads out. Puts out fire.", "会流动并摊开，能扑灭火。"] },
    { k: "Wall", c: "#78756d", n: ["Wall", "墙"], d: ["Never moves or burns. Great for building.", "不会移动也不会燃烧，适合搭建。"] },
    { k: "Stone", c: "#8d8199", n: ["Stone", "石头"], d: ["Solid and heavy. Acid dissolves it.", "坚硬沉重，酸能把它溶解。"] },
    { k: "Fire", c: "#ff7a1a", n: ["Fire", "火"], d: ["Burns wood and dust. Water puts it out.", "能烧木头和粉尘，水能把它扑灭。"] },
    { k: "Plant", c: "#2f8a55", n: ["Plant", "植物"], d: ["Grows by using up water. Climbs wood.", "靠消耗水来生长，会沿木头攀爬。"] },
    { k: "Seed", c: "#e8c840", n: ["Seed", "种子"], d: ["Falls, then grows into a flower on sand.", "落下后在沙上长成花。"] },
    { k: "Lava", c: "#e8412c", n: ["Lava", "熔岩"], d: ["Hot and heavy. Water cools it into stone.", "又热又重，水能把它冷却成石头。"] },
    { k: "Ice", c: "#a5dcf2", n: ["Ice", "冰"], d: ["Freezes nearby water. Fire melts it.", "会冻住附近的水，火能将它融化。"] },
    { k: "Wood", c: "#7d4e3a", n: ["Wood", "木头"], d: ["Solid but burns. Plants climb it.", "坚固但会燃烧，植物能沿它攀爬。"] },
    { k: "Oil", c: "#5b3a4a", n: ["Oil", "油"], d: ["Liquid that floats on top of water.", "浮在水面上的液体。"] },
    { k: "Gas", c: "#b9c4cc", n: ["Gas", "气体"], d: ["Light and drifts upward.", "很轻，会向上飘。"] },
    { k: "Acid", c: "#9bd633", n: ["Acid", "酸"], d: ["Dissolves stone. Use with care!", "能溶解石头，请谨慎使用！"] },
    { k: "Dust", c: "#d98d9c", n: ["Dust", "粉尘"], d: ["A light powder that burns very fast.", "一种很轻的粉末，燃烧极快。"] },
    { k: "Fungus", c: "#b49ad8", n: ["Fungus", "真菌"], d: ["A living material that spreads. Watch it!", "会蔓延的活体材料，仔细观察！"] },
    { k: "Mite", c: "#c0404e", n: ["Mite", "螨虫"], d: ["Tiny creature that crawls and eats wood.", "会爬行并啃食木头的小生物。"] },
    { k: "Cloner", c: "#c25be0", n: ["Cloner", "复制器"], d: ["Copies what touches it, like a tap.", "会复制接触到的材料，像水龙头。"] },
    { k: "Rocket", c: "#f0f0f0", n: ["Rocket", "火箭"], d: ["A special material. Experiment!", "一种特殊材料，快来试试！"] },
    { k: "Empty", c: "#fdfcfc", n: ["Eraser", "橡皮擦"], d: ["Removes anything, even walls.", "能清除任何东西，包括墙。"] },
  ];
  const MAT = Object.fromEntries(MATS.map(m => [m.k, m]));
  const SHAPES = ["round", "square", "spray"];

  // ---------- saved state ----------
  const state = (() => {
    let saved = {};
    try { const v = JSON.parse(localStorage.getItem(STORE)); if (v && typeof v === "object") saved = v; } catch { /* ignore */ }
    const num = (v, lo, hi, d) => (Number.isFinite(Number(v)) ? Math.max(lo, Math.min(hi, Math.round(Number(v)))) : d);
    return {
      sel: MAT[saved.sel] ? saved.sel : "Sand",
      brush: num(saved.brush, 2, 30, 8),
      shape: SHAPES.includes(saved.shape) ? saved.shape : "round",
      speed: ["0.25", "0.5", "1", "2", "3"].includes(String(saved.speed)) ? String(saved.speed) : "1",
      ch: challenges.some(c => c.id === saved.ch) ? saved.ch : "",
      minutes: num(saved.minutes, 1, 60, 5),
      beep: saved.beep === true,
      freeze: saved.freeze !== false,
      cls: typeof saved.cls === "string" ? saved.cls : "",
      who: typeof saved.who === "string" ? saved.who.slice(0, 60) : "",
      notes: saved.notes && typeof saved.notes === "object" ? saved.notes : {},
    };
  })();
  const save = () => { try { localStorage.setItem(STORE, JSON.stringify(state)); } catch { /* ignore */ } };

  // ---------- DOM ----------
  const $ = id => document.getElementById(id);
  const canvas = $("sand-canvas"), fluid = $("fluid-canvas"), stage = $("stage");
  const el = (tag, props = {}, ...kids) => {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(props)) {
      if (k === "text") node.textContent = v;
      else if (k === "class") node.className = v;
      else if (v === false || v == null) continue;
      else node.setAttribute(k, v === true ? "" : v);
    }
    for (const kid of kids.flat()) if (kid != null) node.append(kid);
    return node;
  };
  const swatch = key => el("i", { class: "pt-sw", style: `background:${MAT[key].c}`, "aria-hidden": "true" });

  // ---------- runtime state ----------
  let engine = null, SP = null, engineFailed = false, stopped = false;
  let frame = 0, last = 0, acc = 0, lastStats = 0;
  let paused = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let inRun = false, setupSnap = null, zoneStart = 0, peak = 0, sceneId = "", goalWasOk = false;
  let speed = Number(state.speed);
  const history = [];
  let pointer = null, cursor = { x: 80, y: 80 }, kbMode = false;
  let statusFn = () => t("loading");
  let toastTimer = 0, bigTimer = 0, saveTimer = 0;
  const gallery = [];
  const listeners = new AbortController();
  const on = (target, type, handler) => target.addEventListener(type, handler, { signal: listeners.signal });

  const currentChallenge = () => challenges.find(c => c.id === state.ch) || null;
  const noteKey = () => state.ch || "free";
  const chText = c => c[lang ? "zh" : "en"];

  function setStatus(fn) { statusFn = typeof fn === "function" ? fn : () => fn; $("status").textContent = statusFn(); }
  function toast(message) {
    let node = document.querySelector(".cmc-toast");
    if (!node) { node = el("div", { class: "cmc-toast", role: "status" }); document.body.append(node); }
    node.textContent = message;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => node.remove(), 2600);
  }

  // ---------- engine helpers ----------
  const clampCell = v => Math.max(0, Math.min(GRID - 1, v));
  const view = () => engine.cells();
  const snapshotCells = () => new Uint8Array(view());
  function pushHistory() {
    if (!engine) return;
    history.push(snapshotCells());
    if (history.length > 15) history.shift();
    updateButtons();
  }
  function restoreCells(snapshot) { view().set(snapshot); engine.render(); }
  function countAll() {
    const counts = new Map();
    const cells = view();
    for (let i = 0; i < cells.length; i += 4) { const s = cells[i]; if (s) counts.set(s, (counts.get(s) || 0) + 1); }
    return counts;
  }
  function zoneCount(z) {
    const cells = view(), sp = SP[z.species];
    let n = 0;
    for (let x = z.x0; x <= z.x1; x++) for (let y = z.y0; y <= z.y1; y++) if (cells[(x * GRID + y) * 4] === sp) n++;
    return n;
  }
  const activeZone = () => { const c = currentChallenge(); return engine && c && c.zone && sceneId === c.id ? c.zone : null; };

  const sceneApi = {
    rect(x0, y0, x1, y1, name) {
      const sp = SP[name];
      for (let x = clampCell(x0); x <= clampCell(x1); x++) for (let y = clampCell(y0); y <= clampCell(y1); y++) engine.paint(x, y, 1, sp);
    },
    floor() { this.rect(0, 150, GRID - 1, 155, "Wall"); },
  };

  function stamp(x, y) {
    const sp = SP[state.sel], size = state.brush;
    if (state.shape === "round") engine.paint(x, y, size, sp);
    else if (state.shape === "square") {
      const half = size >> 1;
      for (let dx = -half; dx < size - half; dx++) for (let dy = -half; dy < size - half; dy++) {
        const px = x + dx, py = y + dy;
        if (px >= 0 && py >= 0 && px < GRID && py < GRID) engine.paint(px, py, 1, sp);
      }
    } else {
      const radius = size / 2;
      for (let i = 0, n = Math.max(3, Math.round(size * size / 5)); i < n; i++) {
        const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * radius;
        const px = Math.round(x + Math.cos(a) * r), py = Math.round(y + Math.sin(a) * r);
        if (px >= 0 && py >= 0 && px < GRID && py < GRID) engine.paint(px, py, 1, sp);
      }
    }
  }
  function strokeTo(next) {
    const dist = Math.max(Math.abs(next.x - cursor.x), Math.abs(next.y - cursor.y));
    const gap = state.shape === "round" ? 1 : Math.max(1, state.brush >> 2);
    const steps = Math.max(1, Math.ceil(dist / gap));
    for (let s = 1; s <= steps; s++) stamp(Math.round(cursor.x + (next.x - cursor.x) * s / steps), Math.round(cursor.y + (next.y - cursor.y) * s / steps));
    cursor = next;
    engine.render();
  }
  function beginStroke() {
    pushHistory();
    if (paused) inRun = false;
  }

  // ---------- run control ----------
  function beginRunIfNeeded() {
    if (inRun || !engine) return;
    setupSnap = snapshotCells();
    inRun = true;
    const z = activeZone();
    zoneStart = z ? zoneCount(z) : 0;
    peak = 0;
    goalWasOk = false;
    updateButtons();
  }
  function setPaused(value) {
    if (!engine) return;
    if (!value) beginRunIfNeeded();
    paused = value;
    cancelAnimationFrame(frame); frame = 0;
    updateButtons();
    setStatus(() => (paused ? t("paused") : t("running")));
    refreshStats();
    start();
  }
  function stepOnce() {
    if (!engine) return;
    beginRunIfNeeded();
    if (!paused) setPaused(true);
    engine.tick(); afterTick(); engine.render();
    refreshStats();
  }
  function afterTick() {
    const z = activeZone();
    if (z && z.kind === "peak0") peak = Math.max(peak, zoneCount(z));
  }
  function loop(time) {
    frame = 0;
    if (stopped || document.hidden || !engine || paused) return;
    if (!last) last = time;
    acc += Math.min(100, time - last);
    last = time;
    const interval = 1000 / (30 * speed);
    let ticks = 0;
    while (acc >= interval && ticks < 4) { engine.tick(); afterTick(); acc -= interval; ticks++; }
    if (acc > interval * 4) acc = 0;
    if (ticks) engine.render();
    if (time - lastStats > 400) { lastStats = time; refreshStats(); }
    frame = requestAnimationFrame(loop);
  }
  function start() {
    if (stopped || !engine || frame || paused || document.hidden) return;
    last = 0; acc = 0;
    frame = requestAnimationFrame(loop);
  }
  function halt() { cancelAnimationFrame(frame); frame = 0; }

  function undo() {
    if (!engine) return;
    const snap = history.pop();
    if (!snap) { setStatus(() => t("nothingUndo")); return; }
    if (paused) inRun = false;
    restoreCells(snap);
    updateButtons(); refreshStats();
    setStatus(() => t("undone"));
  }
  function rewind() {
    if (!engine || !setupSnap) return;
    pushHistory();
    restoreCells(setupSnap);
    inRun = false; peak = 0; goalWasOk = false;
    halt(); paused = true;
    updateButtons(); refreshStats();
    setStatus(() => t("rewound"));
  }
  function clearAll() {
    if (!engine) return;
    pushHistory();
    engine.clear(); engine.render();
    sceneId = ""; inRun = false; setupSnap = null; goalWasOk = false;
    updateZoneOverlay(); updateButtons(); refreshStats();
    setStatus(() => t("cleared"));
  }
  function loadScene(ch) {
    if (!engine) return;
    pushHistory();
    engine.clear();
    ch.scene(sceneApi);
    engine.render();
    sceneId = ch.id; inRun = false; setupSnap = null; peak = 0; goalWasOk = false;
    halt(); paused = true;
    const z = ch.zone;
    zoneStart = z ? zoneCount(z) : 0;
    updateZoneOverlay(); updateButtons(); refreshStats(); renderMaterials();
    setStatus(() => t("sceneLoaded", chText(ch).title));
  }
  function starterScene() {
    engine.clear();
    sceneApi.rect(24, 135, 135, 138, "Wall");
    sceneApi.rect(24, 105, 26, 135, "Wall"); sceneApi.rect(133, 105, 135, 135, "Wall");
    engine.paint(60, 32, 22, SP.Sand); engine.paint(102, 75, 22, SP.Water);
    engine.render();
  }

  // ---------- snapshots ----------
  function loadImage(url) { return new Promise((resolve, reject) => { const img = new Image(); img.onload = () => resolve(img); img.onerror = reject; img.src = url; }); }
  function download(url, name) { const a = el("a", { href: url, download: name }); document.body.append(a); a.click(); a.remove(); }
  function takeSnapshot() {
    if (!engine) return;
    engine.render();
    const size = 640, cap = 40;
    const c = el("canvas", { width: size, height: size + cap });
    const x = c.getContext("2d");
    x.fillStyle = "#fdfcfc"; x.fillRect(0, 0, size, size);
    x.imageSmoothingEnabled = false;
    x.drawImage(canvas, 0, 0, size, size);
    x.save(); x.globalAlpha = 0.55; x.globalCompositeOperation = "screen";
    try { x.drawImage(fluid, 0, 0, size, size); } catch { /* overlay is optional */ }
    x.restore();
    x.fillStyle = "#0a1118"; x.fillRect(0, size, size, cap);
    const ch = currentChallenge();
    const title = ch ? chText(ch).title : t("free");
    x.fillStyle = "#ffb23e"; x.font = '16px "Share Tech Mono","Microsoft YaHei",monospace'; x.textBaseline = "middle";
    x.fillText(`${title}  ·  ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`, 12, size + cap / 2, size - 24);
    if (gallery.length >= 6) { gallery.shift(); toast(t("galFull")); }
    const number = (gallery.length ? gallery[gallery.length - 1].number : 0) + 1;
    gallery.push({ url: c.toDataURL("image/png"), title, number });
    renderGallery(); renderPrint();
    setStatus(() => t("snapTaken", number));
  }
  async function downloadAll() {
    if (!gallery.length) return;
    const images = await Promise.all(gallery.map(g => loadImage(g.url)));
    const cols = Math.min(3, images.length), rows = Math.ceil(images.length / cols);
    const w = 480, h = Math.round(w * images[0].height / images[0].width), pad = 12;
    const c = el("canvas", { width: cols * w + (cols + 1) * pad, height: rows * h + (rows + 1) * pad });
    const x = c.getContext("2d");
    x.fillStyle = "#04070b"; x.fillRect(0, 0, c.width, c.height);
    images.forEach((img, i) => x.drawImage(img, pad + (i % cols) * (w + pad), pad + Math.floor(i / cols) * (h + pad), w, h));
    download(c.toDataURL("image/png"), "particle-sandbox-all.png");
  }
  function renderGallery() {
    const box = $("gallery");
    box.replaceChildren();
    if (!gallery.length) box.append(el("p", { class: "pt-empty", text: t("galEmpty") }));
    gallery.forEach((g, i) => {
      const dl = el("button", { class: "cmc-btn quiet", type: "button", text: t("galDl") });
      const del = el("button", { class: "cmc-btn quiet", type: "button", text: t("galDel") });
      dl.addEventListener("click", () => download(g.url, `particle-sandbox-${g.number}.png`));
      del.addEventListener("click", () => { gallery.splice(i, 1); renderGallery(); renderPrint(); });
      box.append(el("figure", { class: "pt-shot", style: "margin:0" }, el("img", { src: g.url, alt: `${t("snapAlt", g.number)}: ${g.title}` }), el("div", { class: "pt-row" }, dl, del)));
    });
    $("gal-all").disabled = !gallery.length; $("gal-clear").disabled = !gallery.length;
  }

  // ---------- stats, goal and zone ----------
  function refreshStats() {
    if (!engine) return;
    const counts = countAll();
    const box = $("counts");
    box.replaceChildren();
    for (const m of MATS) {
      const n = counts.get(SP[m.k]);
      if (m.k !== "Empty" && n) box.append(el("span", {}, swatch(m.k), `${m.n[lang]} ${n}`));
    }
    updateGoal();
  }
  function evalGoal() {
    const z = activeZone();
    if (!z) return null;
    const label = z.label[lang], n = zoneCount(z);
    const area = (z.x1 - z.x0 + 1) * (z.y1 - z.y0 + 1);
    const start = inRun ? zoneStart : n;
    switch (z.kind) {
      case "zero": return { ok: n === 0, text: t("zoneNow", label, n) };
      case "min": return { ok: n >= z.min, text: t("zoneMin", label, n, z.min) };
      case "range": { const p = Math.round(n / area * 1000) / 10; return { ok: p >= z.min && p <= z.max, text: t("zoneRange", label, p, z.min, z.max) }; }
      case "keep": { const p = start ? Math.round(n / start * 100) : 100; return { ok: p >= z.min, text: t("zoneKeep", label, n, start, p, z.min) }; }
      default: { const p = Math.max(peak, n); return { ok: p === 0, text: t("zonePeak", label, n, p) }; }
    }
  }
  function updateGoal() {
    const node = $("strip-goal");
    const ch = currentChallenge();
    const result = evalGoal();
    node.classList.toggle("ok", !!(result && result.ok));
    $("zone").classList.toggle("ok", !!(result && result.ok));
    if (result) node.textContent = `${result.text}${result.ok ? "  ✓" : ""}`;
    else node.textContent = ch ? chText(ch).goal : t("freeGoal");
    if (result && result.ok && !goalWasOk && inRun) { toast(t("goalMet")); setStatus(() => t("goalMet")); }
    goalWasOk = !!(result && result.ok);
  }
  function updateZoneOverlay() {
    const z = activeZone();
    const node = $("zone");
    node.hidden = !z;
    if (!z) return;
    const pct = v => `${v / GRID * 100}%`;
    node.style.left = pct(z.x0); node.style.top = pct(z.y0);
    node.style.width = pct(z.x1 - z.x0 + 1); node.style.height = pct(z.y1 - z.y0 + 1);
    $("zone-label").textContent = z.label[lang];
    $("zone-label").style.top = z.y0 < 12 ? "2px" : "";
  }

  // ---------- render dynamic UI ----------
  function updateButtons() {
    const pauseBtn = $("pause");
    pauseBtn.textContent = paused ? t("run") : t("pause");
    pauseBtn.classList.toggle("primary", paused);
    $("undo").disabled = !engine || !history.length;
    $("rewind").disabled = !engine || !setupSnap;
    canvas.dataset.state = paused ? "paused" : "running";
  }
  function renderMaterials() {
    const box = $("mats");
    const ch = currentChallenge();
    const suggested = new Set(ch ? ch.suggest : []);
    box.replaceChildren();
    MATS.forEach((m, i) => {
      const keyHint = m.k === "Empty" ? "0" : i < 9 ? String(i + 1) : "";
      const btn = el("button", { class: `pt-mat${suggested.has(m.k) ? " sug" : ""}`, type: "button", "data-k": m.k, "aria-pressed": String(state.sel === m.k), title: m.d[lang] }, swatch(m.k), el("span", { text: m.n[lang] }), keyHint ? el("kbd", { text: keyHint, "aria-hidden": "true" }) : null);
      btn.addEventListener("click", () => selectMaterial(m.k));
      box.append(btn);
    });
    const m = MAT[state.sel];
    $("mat-desc").replaceChildren(el("b", { text: `${m.n[lang]}: ` }), m.d[lang]);
  }
  function selectMaterial(key, announce = true) {
    if (!MAT[key]) return;
    state.sel = key; save();
    document.querySelectorAll(".pt-mat").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.k === key)));
    const m = MAT[key];
    $("mat-desc").replaceChildren(el("b", { text: `${m.n[lang]}: ` }), m.d[lang]);
    if (announce) setStatus(() => t("pickedStatus", m.n[lang]));
  }
  function renderShapes() {
    const box = $("shapes");
    box.replaceChildren();
    SHAPES.forEach((s, i) => {
      const b = el("button", { class: "cmc-chip", type: "button", "aria-pressed": String(state.shape === s), "data-need": "engine", text: t("shapes")[i] });
      b.disabled = !engine;
      b.addEventListener("click", () => { state.shape = s; save(); renderShapes(); });
      box.append(b);
    });
  }
  function renderChallengeList() {
    const box = $("chlist");
    box.replaceChildren();
    const add = (id, label) => {
      const b = el("button", { class: "cmc-chip", type: "button", "aria-pressed": String(state.ch === id), text: label });
      b.addEventListener("click", () => selectChallenge(id));
      box.append(b);
    };
    add("", `0. ${t("free")}`);
    challenges.forEach((c, i) => add(c.id, `${i + 1}. ${chText(c).title}`));
  }
  function renderChallengeDetail() {
    const box = $("chdetail");
    box.replaceChildren();
    const ch = currentChallenge();
    if (!ch) { box.append(el("p", { text: t("freeText") })); return; }
    const x = chText(ch);
    const load = el("button", { class: "cmc-btn primary", type: "button", text: t("loadScene") });
    load.disabled = !engine;
    load.addEventListener("click", () => loadScene(ch));
    const hyp = el("button", { class: "cmc-btn", type: "button", text: t("writeHyp") });
    hyp.addEventListener("click", () => { $("sheet-panel").scrollIntoView({ block: "start" }); $("n-h").focus(); });
    const timerBtn = el("button", { class: "cmc-btn cyan", type: "button", text: t("startTimer", ch.minutes) });
    timerBtn.addEventListener("click", () => { setMinutes(ch.minutes); if (!timer.running) toggleTimer(); });
    const chips = el("div", { class: "cmc-chips" });
    ch.suggest.forEach(k => { const b = el("button", { class: "cmc-chip", type: "button", text: MAT[k].n[lang] }); b.addEventListener("click", () => selectMaterial(k)); chips.append(b); });
    const expect = el("details", { class: "cmc-details" }, el("summary", { text: t("expectHead") }), el("p", { text: x.expect }));
    const teacher = el("details", { class: "cmc-details" }, el("summary", { text: t("teacherHead") }),
      el("p", {}, el("b", { text: `${t("questionHead")}: ` }), x.question),
      el("div", { class: "pt-vocab", "aria-label": t("vocabHead") }, x.vocab.map(v => el("span", { text: v }))), expect);
    box.append(
      el("h3", { text: x.title }),
      el("div", { class: "cmc-note" }, el("b", { text: t("predictHead") }), x.predict),
      el("p", {}, el("b", { class: "cmc-label", text: `${t("taskHead")}  ` }), x.task),
      el("p", {}, el("b", { class: "cmc-label", text: `${t("goalHead")}  ` }), x.goal),
      el("div", { class: "pt-row" }, load, hyp, timerBtn),
      el("div", {}, el("span", { class: "cmc-label", text: t("suggested") }), chips),
      teacher);
  }
  function selectChallenge(id) {
    state.ch = id; save();
    sceneId = sceneId === id ? sceneId : "";
    const ch = currentChallenge();
    renderChallengeList(); renderChallengeDetail(); renderMaterials();
    $("strip-title").textContent = ch ? chText(ch).title : t("free");
    if (ch && !timer.running) setMinutes(ch.minutes);
    loadNotes(); updateZoneOverlay(); updateGoal();
  }

  // ---------- observation sheet ----------
  function noteStore() { return (state.notes[noteKey()] ||= { h: "", o: "", x: "" }); }
  function loadNotes() {
    const n = noteStore();
    $("n-h").value = n.h || ""; $("n-o").value = n.o || ""; $("n-x").value = n.x || "";
    $("who").value = state.who;
    const ch = currentChallenge();
    $("sheet-for").textContent = t("sheetFor", ch ? chText(ch).title : t("free"));
    renderPrint();
  }
  function onNoteInput() {
    const n = noteStore();
    n.h = $("n-h").value; n.o = $("n-o").value; n.x = $("n-x").value;
    state.who = $("who").value;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => { save(); $("saved").textContent = t("saved"); renderPrint(); }, 350);
  }
  function sheetText() {
    const ch = currentChallenge(), n = noteStore();
    const title = ch ? chText(ch).title : t("free");
    const lines = [`${t("printTitle")}`, `${t("sheetFor", title)}`];
    if (ch) lines.push(`${t("taskLabel")}: ${chText(ch).task}`, `${t("goalLabel")}: ${chText(ch).goal}`);
    lines.push(`${t("who")}: ${state.who}`, "", `${t("hypo")}:`, n.h, "", `${t("obs")}:`, n.o, "", `${t("expl")}:`, n.x);
    return lines.join("\n");
  }
  function renderPrint() {
    const box = $("printsheet");
    const ch = currentChallenge(), n = noteStore();
    const x = ch ? chText(ch) : null;
    box.replaceChildren(...[
      el("h2", { text: t("printTitle") }),
      el("p", { text: t("sheetFor", x ? x.title : t("free")) }),
      x ? el("p", {}, el("b", { text: `${t("taskLabel")}: ` }), x.task) : null,
      x ? el("p", {}, el("b", { text: `${t("goalLabel")}: ` }), x.goal) : null,
      el("div", { class: "pt-line" }, el("span", { text: `${t("who")}: ${state.who}` }), el("span", { text: `${t("date")}: ` })),
      el("b", { text: t("hypo") }), el("div", { class: "pt-box", text: n.h }),
      el("b", { text: t("obs") }), el("div", { class: "pt-box", text: n.o }),
      el("b", { text: t("expl") }), el("div", { class: "pt-box", text: n.x }),
      gallery.length ? el("b", { text: t("snapshotsPrint") }) : null,
      gallery.length ? el("div", { class: "pt-imgs" }, gallery.map(g => el("img", { src: g.url, alt: "" }))) : null,
      el("p", { style: "font-size:9pt;margin-top:12px", text: t("disclaimer") })].filter(Boolean));
  }
  async function copySheet() {
    const text = sheetText();
    try { await navigator.clipboard.writeText(text); toast(t("copied")); return; } catch { /* fall back below */ }
    const area = el("textarea", { style: "position:fixed;left:-9999px", "aria-hidden": "true" });
    area.value = text; document.body.append(area); area.select();
    let ok = false;
    try { ok = document.execCommand("copy"); } catch { /* ignore */ }
    area.remove();
    toast(ok ? t("copied") : t("copyFail"));
  }

  // ---------- timer ----------
  const timer = { total: state.minutes * 60000, left: state.minutes * 60000, running: false, end: 0, iv: 0, audio: null };
  function renderClock() {
    const secs = Math.max(0, Math.ceil(timer.left / 1000));
    const text = `${String(Math.floor(secs / 60)).padStart(2, "0")}:${String(secs % 60).padStart(2, "0")}`;
    const clock = $("clock");
    clock.textContent = text;
    const low = timer.running && timer.left <= 10000;
    clock.classList.toggle("low", low);
    $("timer-bar").classList.toggle("low", low);
    $("timer-bar").style.width = `${timer.total ? Math.max(0, Math.min(100, timer.left / timer.total * 100)) : 0}%`;
    const label = timer.running ? t("timerPause") : timer.left > 0 && timer.left < timer.total ? t("timerResume") : t("timerStart");
    $("timer-toggle").textContent = label; $("timer-toggle2").textContent = label;
  }
  function setMinutes(m) {
    m = Math.max(1, Math.min(60, Math.round(Number(m)) || 5));
    state.minutes = m; save();
    $("minutes").value = String(m);
    if (!timer.running) { timer.total = timer.left = m * 60000; renderClock(); }
  }
  function audioContext() {
    if (!timer.audio) { const Ctx = window.AudioContext || window.webkitAudioContext; if (Ctx) { try { timer.audio = new Ctx(); } catch { /* no audio */ } } }
    if (timer.audio && timer.audio.state === "suspended") timer.audio.resume().catch(() => {});
    return timer.audio;
  }
  function beep() {
    const ctx = audioContext();
    if (!ctx) return;
    [660, 880, 660].forEach((freq, i) => {
      const osc = ctx.createOscillator(), gain = ctx.createGain(), at = ctx.currentTime + i * 0.28;
      osc.type = "sine"; osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.exponentialRampToValueAtTime(0.08, at + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.22);
      osc.connect(gain).connect(ctx.destination);
      osc.start(at); osc.stop(at + 0.25);
    });
  }
  function toggleTimer() {
    if (timer.running) {
      timer.left = Math.max(0, timer.end - Date.now());
      clearInterval(timer.iv); timer.running = false;
    } else {
      if (timer.left <= 0) timer.left = timer.total;
      timer.end = Date.now() + timer.left; timer.running = true;
      if (state.beep) audioContext();
      timer.iv = setInterval(tickTimer, 250);
    }
    renderClock();
  }
  function tickTimer() {
    timer.left = Math.max(0, timer.end - Date.now());
    if (timer.left > 0) { renderClock(); return; }
    clearInterval(timer.iv); timer.running = false;
    renderClock();
    if (state.beep) beep();
    if (state.freeze && engine && !paused) setPaused(true);
    toast(t("timeUp")); setStatus(() => t("timeUp"));
  }
  function resetTimer() {
    clearInterval(timer.iv); timer.running = false; timer.left = timer.total; renderClock();
  }

  // ---------- class roster ----------
  const picked = new Map();
  function readRoster() {
    try {
      const data = JSON.parse(localStorage.getItem("mc_classes"));
      const list = Array.isArray(data && data.list) ? data.list : [];
      const classes = list.filter(c => c && typeof c === "object" && Array.isArray(c.names)).map(c => ({
        id: String(c.id ?? ""), name: typeof c.name === "string" ? c.name : "",
        names: c.names.filter(n => typeof n === "string" && n.trim()).map(n => n.trim().slice(0, 40)).slice(0, 500),
      })).filter(c => c.names.length);
      return { active: typeof (data && data.active) === "string" ? data.active : "", classes };
    } catch { return { active: "", classes: [] }; }
  }
  function renderRoster() {
    const { active, classes } = readRoster();
    const select = $("cls-select");
    select.replaceChildren();
    classes.forEach((c, i) => select.append(el("option", { value: c.id || String(i), text: `${c.name || c.id || i + 1} (${c.names.length})` })));
    const wanted = [state.cls, active].find(v => v && classes.some((c, i) => (c.id || String(i)) === v));
    select.value = wanted || (classes[0] ? (classes[0].id || "0") : "");
    $("cls-wrap").hidden = classes.length < 2;
    $("roster-msg").textContent = classes.length ? "" : t("noRoster");
    $("pick").disabled = !classes.length; $("pick-strip").disabled = !classes.length;
    return classes;
  }
  function pickStudent() {
    const classes = renderRoster();
    if (!classes.length) { setStatus(() => t("noRoster")); return; }
    const select = $("cls-select");
    const index = Math.max(0, classes.findIndex((c, i) => (c.id || String(i)) === select.value));
    const cls = classes[index];
    state.cls = select.value; save();
    const key = cls.id || String(index);
    let used = picked.get(key);
    if (!used || used.size >= cls.names.length) { if (used) toast(t("rosterNew")); used = new Set(); picked.set(key, used); }
    const pool = cls.names.filter((_, i) => !used.has(i));
    const name = pool[Math.floor(Math.random() * pool.length)];
    used.add(cls.names.indexOf(name));
    $("picked").textContent = name;
    $("roster-msg").textContent = t("rosterLeft", cls.names.length - used.size, cls.names.length);
    showBig(t("pickedBig"), name);
    setStatus(() => t("picked", name));
  }
  function showBig(small, strong) {
    const box = $("bigname");
    box.replaceChildren(el("small", { text: small }), el("strong", { text: strong }));
    box.hidden = false;
    clearTimeout(bigTimer);
    bigTimer = setTimeout(hideBig, 6000);
  }
  function hideBig() { clearTimeout(bigTimer); $("bigname").hidden = true; }
  function randomMaterial() {
    const pool = MATS.filter(m => m.k !== "Empty" && m.k !== state.sel);
    const m = pool[Math.floor(Math.random() * pool.length)];
    selectMaterial(m.k, false);
    showBig(t("randBig"), m.n[lang]);
    setStatus(() => t("randPicked", m.n[lang]));
  }

  // ---------- chrome: tabs, board mode, language ----------
  function showTab(name, focus) {
    for (const id of ["mat", "ch", "cls"]) {
      const on = id === name;
      $(`panel-${id}`).hidden = !on;
      const tab = $(`tab-${id}`);
      tab.setAttribute("aria-selected", String(on));
      tab.tabIndex = on ? 0 : -1;
      if (on && focus) tab.focus();
    }
    if (name === "cls") renderRoster();
  }
  function setBoard(on) {
    document.body.classList.toggle("cmc-board", on);
    document.body.classList.toggle("pt-board", on);
    $("board-btn").setAttribute("aria-pressed", String(on));
    $("board-btn").textContent = on ? t("boardOff") : t("board");
    if (on) showTab("mat");
  }
  function showEngineError() {
    engineFailed = true;
    $("gl-error").hidden = false;
    $("gl-error-text").textContent = t("error") + t("errOffline");
    $("offline").hidden = false; $("offline").textContent = t("offlineStage");
    document.querySelectorAll("[data-need=engine]").forEach(n => { n.disabled = true; });
    setStatus(() => t("error"));
    renderChallengeDetail(); renderShapes();
  }
  function applyLang() {
    document.documentElement.lang = lang ? "zh" : "en";
    document.title = `${t("titleA")} ${t("titleB")}`;
    document.querySelectorAll("[data-t]").forEach(n => { n.textContent = t(n.dataset.t); });
    document.querySelector(".cmc-head h1").replaceChildren(el("span", { text: t("titleA") }), ` ${t("titleB")}`);
    canvas.setAttribute("aria-label", t("canvas"));
    $("clock").setAttribute("aria-label", lang ? "倒计时" : "Timer");
    $("board-btn").textContent = document.body.classList.contains("pt-board") ? t("boardOff") : t("board");
    $("presets").replaceChildren(...[1, 3, 5, 10].map(m => { const b = el("button", { class: "cmc-chip", type: "button", text: `${m}` }); b.addEventListener("click", () => setMinutes(m)); return b; }));
    $("keys").replaceChildren(...t("keys").flatMap(([k, d]) => [el("dt", { text: k }), el("dd", { text: d })]));
    $("strip-title").textContent = currentChallenge() ? chText(currentChallenge()).title : t("free");
    renderMaterials(); renderShapes(); renderChallengeList(); renderChallengeDetail(); renderGallery(); renderClock();
    renderRoster(); updateButtons(); updateZoneOverlay(); loadNotes(); updateGoal();
    if (engineFailed) { $("gl-error-text").textContent = t("error") + t("errOffline"); $("offline").textContent = t("offlineStage"); }
    $("status").textContent = statusFn();
  }

  // ---------- page lifecycle ----------
  function halfStop() { halt(); pointer = null; }
  function stop() {
    if (stopped) return;
    stopped = true;
    halt();
    clearInterval(timer.iv); clearTimeout(toastTimer); clearTimeout(bigTimer); clearTimeout(saveTimer);
    save();
    if (timer.audio) { timer.audio.close().catch(() => {}); timer.audio = null; }
    listeners.abort();
    try { engine && engine.destroy(); } catch { /* already gone */ }
    engine = null;
  }
  function loseEngine() {
    if (!engine) return;
    halt();
    try { engine.destroy(); } catch { /* already gone */ }
    engine = null;
    showEngineError();
  }
  on(window, "pagehide", event => { if (!event.persisted) stop(); else halfStop(); });
  on(window, "pageshow", event => { if (event.persisted) start(); });
  on(document, "visibilitychange", () => { if (document.hidden) halfStop(); else start(); });
  on(window, "beforeprint", renderPrint);
  on(window, "message", event => {
    if (event.origin !== location.origin || event.source !== window.parent ||
        !event.data || event.data.type !== "cmc-language" || !["en", "zh"].includes(event.data.lang)) return;
    lang = event.data.lang === "zh" ? 1 : 0;
    applyLang();
  });

  // ---------- wire static UI ----------
  document.querySelectorAll("[data-need=engine]").forEach(n => { n.disabled = true; });
  on($("brush"), "input", () => { state.brush = Number($("brush").value); $("brush-value").value = state.brush; save(); });
  $("brush").value = String(state.brush); $("brush-value").value = state.brush;
  $("speed").value = state.speed;
  on($("speed"), "change", () => { state.speed = $("speed").value; speed = Number(state.speed); save(); });
  on($("pause"), "click", () => setPaused(!paused));
  on($("step"), "click", stepOnce);
  on($("undo"), "click", undo);
  on($("rewind"), "click", rewind);
  on($("clear"), "click", clearAll);
  on($("snap"), "click", takeSnapshot);
  on($("board-btn"), "click", () => setBoard(!document.body.classList.contains("pt-board")));
  on($("tabs"), "click", event => { const b = event.target.closest("[data-tab]"); if (b) showTab(b.dataset.tab); });
  on($("tabs"), "keydown", event => {
    const order = ["mat", "ch", "cls"], now = order.findIndex(id => $(`tab-${id}`).getAttribute("aria-selected") === "true");
    const next = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (next) { event.preventDefault(); showTab(order[(now + next + order.length) % order.length], true); }
  });
  on($("err-challenges"), "click", () => { showTab("ch", true); });
  on($("err-sheet"), "click", () => { $("sheet-panel").scrollIntoView({ block: "start" }); $("n-h").focus(); });
  for (const id of ["n-h", "n-o", "n-x", "who"]) on($(id), "input", onNoteInput);
  on($("print"), "click", () => { renderPrint(); window.print(); });
  on($("copy"), "click", copySheet);
  on($("sheet-clear"), "click", () => {
    state.notes[noteKey()] = { h: "", o: "", x: "" }; save(); loadNotes(); $("saved").textContent = t("sheetCleared");
  });
  on($("gal-all"), "click", downloadAll);
  on($("gal-clear"), "click", () => { gallery.length = 0; renderGallery(); renderPrint(); });
  on($("timer-toggle"), "click", toggleTimer);
  on($("timer-toggle2"), "click", toggleTimer);
  on($("timer-reset"), "click", resetTimer);
  on($("minutes"), "change", () => setMinutes($("minutes").value));
  $("beep").checked = state.beep; $("freeze").checked = state.freeze;
  on($("beep"), "change", () => { state.beep = $("beep").checked; save(); if (state.beep) { audioContext(); beep(); } });
  on($("freeze"), "change", () => { state.freeze = $("freeze").checked; save(); });
  on($("pick"), "click", pickStudent);
  on($("pick-strip"), "click", pickStudent);
  on($("cls-select"), "change", () => { state.cls = $("cls-select").value; save(); });
  on($("randmat"), "click", randomMaterial);
  on($("bigname"), "click", hideBig);
  on($("bigname"), "keydown", event => { if (event.key === "Enter" || event.key === " " || event.key === "Escape") { event.preventDefault(); hideBig(); } });
  setMinutes(state.minutes);
  selectChallenge(state.ch);
  applyLang();

  // ---------- keyboard shortcuts ----------
  on(document, "keydown", event => {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    const target = event.target;
    const typing = target.matches && target.matches("textarea,select,input:not([type=range]):not([type=checkbox])");
    if (typing) return;
    const key = event.key.toLowerCase();
    if (key === "escape") { if (!$("bigname").hidden) hideBig(); else if (document.body.classList.contains("pt-board")) setBoard(false); return; }
    if (key === " " && target.matches && target.matches("button,summary,a,[role=tab],[role=button]")) return;
    if (/^[1-9]$/.test(key)) selectMaterial(MATS[Number(key) - 1].k);
    else if (key === "0" || key === "e") selectMaterial("Empty");
    else if (key === "[" || key === "]") {
      state.brush = Math.max(2, Math.min(30, state.brush + (key === "]" ? 2 : -2)));
      $("brush").value = String(state.brush); $("brush-value").value = state.brush; save();
    } else if (key === " ") { if (engine) setPaused(!paused); }
    else if (key === ".") stepOnce();
    else if (key === "z") undo();
    else if (key === "c") clearAll();
    else if (key === "s") takeSnapshot();
    else if (key === "r") rewind();
    else if (key === "t") toggleTimer();
    else if (key === "n") pickStudent();
    else if (key === "p") setBoard(!document.body.classList.contains("pt-board"));
    else return;
    event.preventDefault();
  });

  // ---------- start the engine (the rest of the page already works without it) ----------
  try {
    const mod = await import("../lib/sandspiel/engine.js");
    if (stopped) return;
    SP = mod.Species;
    engine = await mod.createEngine(canvas, fluid);
    if (stopped) { engine.destroy(); engine = null; return; }
  } catch (error) {
    console.error("Local Sandspiel could not start:", error);
    if (!stopped) showEngineError();
    return;
  }
  document.querySelectorAll("[data-need=engine]").forEach(n => { n.disabled = false; });
  starterScene();
  setStatus(() => (paused ? t("paused") : t("running")));
  renderShapes(); renderChallengeDetail(); updateButtons(); refreshStats();

  const pointerCell = event => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: clampCell(Math.floor((event.clientX - rect.left) / rect.width * GRID)),
      y: clampCell(Math.floor((event.clientY - rect.top) / rect.height * GRID)),
    };
  };
  on(canvas, "pointerdown", event => {
    if (event.button !== 0 || pointer !== null || !engine) return;
    kbMode = false; $("kcursor").style.display = "none";
    canvas.focus({ preventScroll: true }); canvas.setPointerCapture(event.pointerId);
    pointer = event.pointerId; cursor = pointerCell(event);
    beginStroke(); stamp(cursor.x, cursor.y); engine.render();
  });
  on(canvas, "pointermove", event => { if (pointer === event.pointerId && engine) strokeTo(pointerCell(event)); });
  for (const type of ["pointerup", "pointercancel", "lostpointercapture"]) on(canvas, type, () => { if (pointer !== null) { pointer = null; refreshStats(); } });
  const showCursor = () => {
    const node = $("kcursor");
    node.style.display = kbMode ? "block" : "none";
    node.style.left = `${(cursor.x + 0.5) / GRID * 100}%`; node.style.top = `${(cursor.y + 0.5) / GRID * 100}%`;
  };
  on(canvas, "blur", () => { kbMode = false; showCursor(); });
  on(canvas, "keydown", event => {
    const deltas = { ArrowLeft: [-2, 0], ArrowRight: [2, 0], ArrowUp: [0, -2], ArrowDown: [0, 2] };
    if (deltas[event.key] && engine) {
      event.preventDefault(); event.stopPropagation();
      const [dx, dy] = deltas[event.key];
      cursor.x = clampCell(cursor.x + dx); cursor.y = clampCell(cursor.y + dy);
      kbMode = true; showCursor();
      setStatus(() => t("cursor", cursor.x, cursor.y));
    } else if (event.key === "Enter" && engine) {
      event.preventDefault(); event.stopPropagation();
      kbMode = true; showCursor();
      beginStroke(); stamp(cursor.x, cursor.y); engine.render(); refreshStats();
    }
  });
  on(canvas, "webglcontextlost", event => { event.preventDefault(); loseEngine(); });
  on(fluid, "webglcontextlost", event => { event.preventDefault(); loseEngine(); });
  start();
})();
