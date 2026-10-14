(() => {
  'use strict';
  let zh = new URLSearchParams(location.search).get('lang') === 'zh';
  const words = {
    title: ['Geometry Playground', '几何探索'],
    intro: ['Drag triangle vertices, explore transformations, or adjust a quadratic function. All work stays on this device.', '拖动三角形顶点，探索几何变换，或调整二次函数。所有操作均在本设备上完成。'],
    mode: ['Mode', '模式'], triangle: ['Triangle', '三角形'], transform: ['Transformations', '几何变换'],
    function: ['Function plot', '函数图像'], reset: ['Reset', '重置'],
    vertexHint: ['Move A, B, and C by dragging or entering coordinates below.', '拖动 A、B、C，或在下方输入坐标。'],
    measurements: ['Measurements', '测量结果'], operation: ['Transformation', '变换方式'],
    rotate: ['Rotate about origin', '绕原点旋转'], translate: ['Translate', '平移'],
    reflect: ['Reflect across y-axis', '关于 y 轴对称'], scale: ['Scale about origin', '以原点为中心缩放'],
    rotation: ['Rotation (degrees)', '旋转角度（度）'], dx: ['Horizontal shift', '水平位移'],
    dy: ['Vertical shift', '垂直位移'], factor: ['Scale factor', '缩放倍数'],
    transformHint: ['Blue: original triangle. Orange: transformed triangle. Drag the blue vertices to compare.', '蓝色为原三角形，橙色为变换后的三角形。拖动蓝色顶点进行比较。'],
    powered: ['Powered by local JSXGraph 1.14.0.', '使用本地 JSXGraph 1.14.0。'], license: ['License', '许可证']
  };
  const text = key => words[key][zh ? 1 : 0];
  const el = id => document.getElementById(id);
  let board, points = [];
  const defaults = { angle: 45, dx: 2, dy: 1, scale: 1.5, a: 1, b: 0, c: 0 };
  const positions = [[-2, -1], [2, -1], [0, 2]];
  const value = id => Number(el(id).value);
  const errorText = () => zh ? '无法加载几何图像。请检查本地库文件并重新加载页面。' : 'Unable to load the geometry graph. Check the local library files and reload the page.';
  function applyLanguage(lang) {
    zh = lang === 'zh';
    document.documentElement.lang = zh ? 'zh' : 'en';
    document.title = text('title');
    document.querySelectorAll('[data-i18n]').forEach(node => { node.textContent = text(node.dataset.i18n); });
    el('board').setAttribute('aria-label', zh ? '交互式几何图像；可使用右侧控件调整' : 'Interactive geometry graph; use the adjacent controls to adjust');
    el('panel').setAttribute('aria-label', zh ? '图像控件与测量结果' : 'Graph controls and measurements');
    el('coordinates').querySelectorAll('legend').forEach((legend, i) => {
      legend.textContent = `${zh ? '顶点' : 'Vertex'} ${'ABC'[i]}`;
    });
    measure();
    if (!el('error').hidden) el('error').textContent = errorText();
  }
  function fail(error) {
    console.error(error);
    el('error').hidden = false;
    el('error').textContent = errorText();
  }
  function measure() {
    if (points.length !== 3) return;
    const distances = points.map((p, i) => Math.hypot(p.X() - points[(i + 1) % 3].X(), p.Y() - points[(i + 1) % 3].Y()));
    const angles = points.map((p, i) => {
      const q = points[(i + 1) % 3], r = points[(i + 2) % 3];
      const ux = q.X() - p.X(), uy = q.Y() - p.Y(), vx = r.X() - p.X(), vy = r.Y() - p.Y();
      const length = Math.hypot(ux, uy) * Math.hypot(vx, vy);
      return length < 1e-10 ? '—' : (Math.acos(Math.max(-1, Math.min(1, (ux * vx + uy * vy) / length))) * 180 / Math.PI).toFixed(1) + '°';
    });
    const area = Math.abs((points[1].X() - points[0].X()) * (points[2].Y() - points[0].Y()) - (points[2].X() - points[0].X()) * (points[1].Y() - points[0].Y())) / 2;
    el('measurements').textContent = `AB: ${distances[0].toFixed(2)} · BC: ${distances[1].toFixed(2)} · CA: ${distances[2].toFixed(2)}. ∠A: ${angles[0]} · ∠B: ${angles[1]} · ∠C: ${angles[2]}. ${zh ? '面积' : 'Area'}: ${area.toFixed(2)}${area < 1e-8 ? (zh ? '（退化三角形）' : ' (degenerate triangle)') : ''}`;
    points.forEach((point, i) => ['x', 'y'].forEach(axis => {
      const input = el(`p${i}-${axis}`);
      if (document.activeElement !== input) input.value = (axis === 'x' ? point.X() : point.Y()).toFixed(2);
    }));
  }
  function transformed(point) {
    const x = point.X(), y = point.Y();
    switch (el('operation').value) {
      case 'translate': return [x + value('dx'), y + value('dy')];
      case 'reflect': return [-x, y];
      case 'scale': return [x * value('scale'), y * value('scale')];
      default: {
        const angle = value('angle') * Math.PI / 180;
        return [x * Math.cos(angle) - y * Math.sin(angle), x * Math.sin(angle) + y * Math.cos(angle)];
      }
    }
  }
  function updateOperation() {
    ['angle', 'dx', 'dy', 'scale'].forEach(id => {
      el(`${id}-control`).hidden = !({ rotate: ['angle'], translate: ['dx', 'dy'], reflect: [], scale: ['scale'] }[el('operation').value].includes(id));
    });
    if (board) board.update();
  }
  function build() {
    try {
      if (board) JXG.JSXGraph.freeBoard(board);
      points = [];
      const mode = el('mode').value;
      el('triangle-controls').hidden = mode === 'function';
      el('transform-controls').hidden = mode !== 'transform';
      el('function-controls').hidden = mode !== 'function';
      board = JXG.JSXGraph.initBoard('board', {
        boundingbox: [-7, 6, 7, -6], axis: true, keepaspectratio: true,
        showCopyright: false, showNavigation: false, pan: { enabled: false }, zoom: { enabled: false }
      });
      if (mode === 'function') {
        board.create('functiongraph', [x => value('a') * x * x + value('b') * x + value('c')], { strokeColor: '#155fc1', strokeWidth: 3 });
        updateFormula();
      } else {
        points = positions.map((position, i) => board.create('point', position.slice(), { name: 'ABC'[i], size: 5, strokeColor: '#155fc1', fillColor: '#155fc1' }));
        board.create('polygon', points, { fillColor: '#155fc1', fillOpacity: 0.12, borders: { strokeColor: '#155fc1', strokeWidth: 2 }, hasInnerPoints: false });
        if (mode === 'transform') {
          const copies = points.map((p, i) => board.create('point', [() => transformed(p)[0], () => transformed(p)[1]], { name: 'ABC'[i] + '′', fixed: true, size: 4, strokeColor: '#a94700', fillColor: '#a94700' }));
          board.create('polygon', copies, { fillColor: '#ed8a21', fillOpacity: 0.15, borders: { strokeColor: '#a94700', strokeWidth: 2 }, hasInnerPoints: false });
        }
        board.on('update', measure);
        measure();
      }
      el('error').hidden = true;
      updateOperation();
      resize();
    } catch (error) { fail(error); }
  }
  function updateFormula() {
    el('formula').textContent = `y = ${value('a')}x² + (${value('b')})x + (${value('c')})`;
  }
  function resize() {
    const container = el('board');
    if (board && container && container.clientWidth && container.clientHeight) {
      board.resizeContainer(container.clientWidth, container.clientHeight, true);
    }
  }
  positions.forEach((position, i) => {
    const fieldset = document.createElement('fieldset');
    const legend = document.createElement('legend');
    legend.textContent = `${zh ? '顶点' : 'Vertex'} ${'ABC'[i]}`;
    fieldset.append(legend);
    const row = document.createElement('div');
    row.className = 'coords';
    ['x', 'y'].forEach((axis, index) => {
      const label = document.createElement('label');
      label.textContent = axis;
      const input = document.createElement('input');
      input.id = `p${i}-${axis}`;
      input.type = 'number';
      input.step = '0.1';
      input.min = '-5';
      input.max = '5';
      input.value = position[index];
      input.setAttribute('aria-label', `${'ABC'[i]} ${axis}`);
      input.addEventListener('change', () => {
        if (!points[i]) return;
        const coordinate = input.valueAsNumber;
        if (!Number.isFinite(coordinate) || !input.checkValidity()) { measure(); return; }
        points[i].moveTo(index === 0 ? [coordinate, points[i].Y()] : [points[i].X(), coordinate]);
        board.update();
      });
      label.append(input);
      row.append(label);
    });
    fieldset.append(row);
    el('coordinates').append(fieldset);
  });
  Object.keys(defaults).forEach(id => el(id).addEventListener('input', () => {
    el(`${id}-value`).textContent = el(id).value;
    updateFormula();
    if (board) board.update();
  }));
  el('operation').addEventListener('change', updateOperation);
  el('mode').addEventListener('change', build);
  el('reset').addEventListener('click', () => {
    Object.entries(defaults).forEach(([id, initial]) => { el(id).value = initial; el(`${id}-value`).textContent = initial; });
    el('operation').value = 'rotate';
    build();
  });
  window.addEventListener('resize', resize);
  window.addEventListener('message', event => {
    if (event.origin !== location.origin || event.source !== window.parent) return;
    if (event.data && event.data.type === 'cmc-language' && ['en', 'zh'].includes(event.data.lang)) {
      applyLanguage(event.data.lang);
    }
  });
  applyLanguage(zh ? 'zh' : 'en');
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(resize).observe(el('board'));
  if (typeof JXG === 'undefined') fail(new Error('JSXGraph is unavailable'));
  else build();
})();
