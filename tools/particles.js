import { createEngine, Species } from "../lib/sandspiel/engine.js";

let zh = new URLSearchParams(location.search).get("lang") === "zh";
const translations = { zh: {
  title: "粒子沙盒", intro: "绘制有趣的材料，探索意想不到的图案。所有内容都留在本设备上。",
  material: "材料", brush: "画笔大小", pause: "暂停", resume: "继续", clear: "清空", reset: "重置示例",
  loading: "正在加载本地 Sandspiel 引擎…", running: "运行中", paused: "已暂停",
  instructions: "拖动绘制。键盘：聚焦画布后，用方向键移动画笔，空格或回车绘制。橡皮擦可删除材料。暂停后可以绘制静态场景。",
  challenges: "试试这些挑战", challenge1: "建一堵有缺口的墙。你能把沙子引入小容器吗？",
  challenge2: "造一个池塘，种下种子，再预测会发生什么。",
  challenge3: "比较冰、水和熔岩。先暂停并预测，再继续！",
  disclaimer: "这是创意玩具，不是精确的化学模拟或科学模型。规则是趣味性的，请勿用来预测现实中的反应。",
  credit: "采用 Max Bittker 的原版 Sandspiel 引擎（MIT 许可证）。无需账户，无上传、分享或在线服务。",
  license: "许可证", canvas: "粒子画布", error: "无法启动。需要支持 WebAssembly、WebGL 和浮点纹理的浏览器。请通过本地 Mission Control 服务器打开。",
  cursor: (x, y) => `画笔位置：${x}，${y}`,
}, en: {
  ...Object.fromEntries(Array.from(document.querySelectorAll("[data-text]"), element => [element.dataset.text, element.textContent])),
  title: "Particle Sandbox", pause: "Pause", resume: "Resume", running: "Running", paused: "Paused",
  canvas: "Particle canvas", error: "Unable to start. A browser supporting WebAssembly, WebGL and floating-point textures is required. Open through the local Mission Control server.",
  cursor: (x, y) => `Brush position: ${x}, ${y}`,
} };
let words = translations[zh ? "zh" : "en"];
document.documentElement.lang = zh ? "zh" : "en";
document.title = words.title;
document.querySelectorAll("[data-text]").forEach(element => {
  if (words[element.dataset.text]) element.textContent = words[element.dataset.text];
});

const canvas = document.getElementById("sand-canvas");
canvas.setAttribute("aria-label", words.canvas);
const status = document.getElementById("status");
const material = document.getElementById("material");
const brush = document.getElementById("brush");
const pause = document.getElementById("pause");
const materials = [
  ["Empty", "Eraser", "橡皮擦"], ["Wall", "Wall", "墙"], ["Sand", "Sand", "沙"],
  ["Water", "Water", "水"], ["Stone", "Stone", "石头"], ["Ice", "Ice", "冰"],
  ["Gas", "Gas", "气体"], ["Cloner", "Cloner", "复制器"], ["Mite", "Mite", "螨虫"],
  ["Wood", "Wood", "木头"], ["Plant", "Plant", "植物"], ["Fungus", "Fungus", "真菌"],
  ["Seed", "Seed", "种子"], ["Fire", "Fire", "火"], ["Lava", "Lava", "熔岩"],
  ["Acid", "Acid", "酸"], ["Dust", "Dust", "粉尘"], ["Oil", "Oil", "油"],
  ["Rocket", "Rocket", "火箭"],
];
for (const [key, en, cn] of materials) material.add(new Option(zh ? cn : en, Species[key]));
material.value = Species.Sand;
let engine, frame = 0, stopped = false, paused = matchMedia("(prefers-reduced-motion: reduce)").matches;
let pointer = null, cursor = { x: 80, y: 80 }, lastTime = 0;
const listeners = new AbortController();
const on = (element, type, handler) => element.addEventListener(type, handler, { signal: listeners.signal });

on(window, "message", event => {
  if (event.origin !== location.origin || event.source !== window.parent ||
      event.data?.type !== "cmc-language" || !["en", "zh"].includes(event.data.lang)) return;
  zh = event.data.lang === "zh";
  words = translations[event.data.lang];
  document.documentElement.lang = event.data.lang;
  document.title = words.title;
  document.querySelectorAll("[data-text]").forEach(element => { element.textContent = words[element.dataset.text]; });
  canvas.setAttribute("aria-label", words.canvas);
  materials.forEach(([, en, cn], index) => { material.options[index].textContent = zh ? cn : en; });
  if (engine && !stopped) updateState();
  else if (stopped) status.textContent = words.error;
});

function updateState() {
  pause.textContent = paused ? words.resume : words.pause;
  pause.setAttribute("aria-pressed", String(paused));
  status.textContent = paused ? words.paused : words.running;
  canvas.dataset.state = paused ? "paused" : "running";
}
function paint(x, y) {
  engine.paint(x, y, Number(brush.value), Number(material.value));
  engine.render();
}
function position(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: Math.max(0, Math.min(engine.size - 1, Math.floor((event.clientX - rect.left) / rect.width * engine.size))),
    y: Math.max(0, Math.min(engine.size - 1, Math.floor((event.clientY - rect.top) / rect.height * engine.size))),
  };
}
function example() {
  engine.clear();
  for (let x = 24; x < 136; x++) engine.paint(x, 135, 3, Species.Wall);
  for (let y = 105; y <= 135; y++) {
    engine.paint(24, y, 3, Species.Wall);
    engine.paint(135, y, 3, Species.Wall);
  }
  engine.paint(60, 32, 22, Species.Sand);
  engine.paint(102, 75, 22, Species.Water);
  engine.render();
}
function loop(time) {
  frame = 0;
  if (stopped || document.hidden) return;
  if (!paused && time - lastTime >= 1000 / 30) {
    engine.tick();
    engine.render();
    lastTime = time;
  }
  if (!paused) frame = requestAnimationFrame(loop);
}
function start() {
  if (!stopped && engine && !frame && !paused && !document.hidden) frame = requestAnimationFrame(loop);
}
function stop() {
  if (stopped) return;
  stopped = true;
  cancelAnimationFrame(frame);
  frame = 0;
  listeners.abort();
  engine?.destroy();
}
on(window, "pagehide", event => {
  if (!event.persisted) stop();
  else { cancelAnimationFrame(frame); frame = 0; pointer = null; }
});
on(window, "pageshow", event => { if (event.persisted) start(); });
on(document, "visibilitychange", () => {
  if (document.hidden) { cancelAnimationFrame(frame); frame = 0; pointer = null; }
  else start();
});

try {
  engine = await createEngine(canvas, document.getElementById("fluid-canvas"));
  if (stopped) engine.destroy();
  else {
    document.querySelectorAll("button,select,input").forEach(control => { control.disabled = false; });
    example();
    updateState();
    on(brush, "input", () => { document.getElementById("brush-value").value = brush.value; });
    on(pause, "click", () => {
      paused = !paused;
      cancelAnimationFrame(frame); frame = 0;
      updateState(); start();
    });
    on(document.getElementById("clear"), "click", () => { engine.clear(); engine.render(); });
    on(document.getElementById("reset"), "click", () => { example(); updateState(); });
    on(canvas, "pointerdown", event => {
      if (event.button !== 0 || pointer !== null) return;
      canvas.focus(); canvas.setPointerCapture(event.pointerId);
      pointer = event.pointerId; cursor = position(event); paint(cursor.x, cursor.y);
    });
    on(canvas, "pointermove", event => {
      if (pointer !== event.pointerId) return;
      const next = position(event);
      const steps = Math.max(Math.abs(next.x - cursor.x), Math.abs(next.y - cursor.y));
      for (let step = 1; step <= steps; step++) {
        engine.paint(Math.round(cursor.x + (next.x - cursor.x) * step / steps),
          Math.round(cursor.y + (next.y - cursor.y) * step / steps), Number(brush.value), Number(material.value));
      }
      cursor = next; engine.render();
    });
    for (const type of ["pointerup", "pointercancel", "lostpointercapture"]) on(canvas, type, () => { pointer = null; });
    on(canvas, "keydown", event => {
      const deltas = { ArrowLeft: [-2, 0], ArrowRight: [2, 0], ArrowUp: [0, -2], ArrowDown: [0, 2] };
      if (deltas[event.key]) {
        event.preventDefault();
        const [dx, dy] = deltas[event.key];
        cursor.x = Math.max(0, Math.min(engine.size - 1, cursor.x + dx));
        cursor.y = Math.max(0, Math.min(engine.size - 1, cursor.y + dy));
        status.textContent = words.cursor(cursor.x, cursor.y);
      } else if (event.key === " " || event.key === "Enter") {
        event.preventDefault(); paint(cursor.x, cursor.y);
      }
    });
    on(canvas, "webglcontextlost", () => { stop(); status.textContent = words.error; });
    on(document.getElementById("fluid-canvas"), "webglcontextlost", () => {
      if (!stopped) { stop(); status.textContent = words.error; }
    });
    start();
  }
} catch (error) {
  stop();
  status.textContent = words.error;
  console.error("Local Sandspiel could not start:", error);
}
