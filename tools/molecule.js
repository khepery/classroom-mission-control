(() => {
  'use strict';
  let zh = new URLSearchParams(location.search).get('lang') === 'zh';
  const words = {
    title: ['Molecule Explorer', '分子探索'],
    intro: ['Explore local example molecules. Drag to rotate, scroll or pinch to zoom, and click an atom to identify it. No uploads or remote data calls.', '探索本地示例分子。拖动旋转，滚动或双指缩放，点击原子查看信息。无需上传，也不调用远程数据。'],
    molecule: ['Molecule', '分子'], water: ['Water', '水'], methane: ['Methane', '甲烷'], ethanol: ['Ethanol', '乙醇'],
    style: ['Style', '显示样式'], ballstick: ['Ball and stick', '球棍模型'], sphere: ['Space-filling spheres', '空间填充模型'],
    stick: ['Sticks', '棍状模型'], reset: ['Reset view', '重置视图'],
    hydrogen: ['H: hydrogen', 'H：氢'], carbon: ['C: carbon', 'C：碳'], oxygen: ['O: oxygen', 'O：氧'],
    atom: ['Identify atom', '识别原子'], selectAtom: ['Click an atom or choose one above.', '点击原子或从上方选择。'],
    rotate: ['Rotate', '旋转'], left: ['Left', '向左'], right: ['Right', '向右'], up: ['Up', '向上'], down: ['Down', '向下'],
    zoom: ['Zoom', '缩放'], modelNote: ['Illustrative molecular coordinates; these models are for learning, not experimental analysis. Distances are in ångströms (Å).', '示意性分子坐标，仅供学习，不用于实验分析。距离单位为埃（Å）。'],
    powered: ['Powered by local 3Dmol.js 2.5.5.', '使用本地 3Dmol.js 2.5.5。'], license: ['License', '许可证']
  };
  const text = key => words[key][zh ? 1 : 0];
  const el = id => document.getElementById(id);
  // Self-contained illustrative XYZ models, with no network-dependent loaders.
  const examples = {
    water: {
      formula: 'H₂O',
      description: ['Three atoms with a bent molecular shape (about 104.5°).', '三个原子构成弯曲形分子（约 104.5°）。'],
      xyz: '3\nWater\nO 0.000 0.000 0.000\nH 0.957 0.000 0.000\nH -0.240 0.927 0.000\n'
    },
    methane: {
      formula: 'CH₄',
      description: ['Four hydrogens surround carbon in a tetrahedral shape (about 109.5°).', '四个氢原子围绕碳原子形成四面体（约 109.5°）。'],
      xyz: '5\nMethane\nC 0.000 0.000 0.000\nH 0.629 0.629 0.629\nH -0.629 -0.629 0.629\nH -0.629 0.629 -0.629\nH 0.629 -0.629 -0.629\n'
    },
    ethanol: {
      formula: 'C₂H₆O',
      description: ['Two carbon atoms and a hydroxyl (–OH) group, with six hydrogen atoms.', '两个碳原子、一个羟基（–OH）和六个氢原子。'],
      xyz: '9\nEthanol\nC -0.760 0.000 0.000\nC 0.760 0.000 0.000\nO 1.230 1.350 0.000\nH -1.120 1.028 0.000\nH -1.120 -0.514 0.890\nH -1.120 -0.514 -0.890\nH 1.120 -0.514 0.890\nH 1.120 -0.514 -0.890\nH 2.190 1.350 0.000\n'
    }
  };
  let viewer, model, atoms = [], selectedLabel;
  const colors = { H: '#ffffff', C: '#909090', O: '#ff0d0d' };
  let names = { H: text('hydrogen'), C: text('carbon'), O: text('oxygen') };
  const errorText = () => zh ? '无法显示三维分子。请启用 WebGL，检查本地库文件，并尝试重新加载或使用其他浏览器。' : 'Unable to display the 3D molecule. Enable WebGL, check the local library files, and try reloading or using another browser.';
  function applyLanguage(lang) {
    zh = lang === 'zh';
    document.documentElement.lang = zh ? 'zh' : 'en';
    document.title = text('title');
    document.querySelectorAll('[data-i18n]').forEach(node => { node.textContent = text(node.dataset.i18n); });
    el('viewer').setAttribute('aria-label', zh ? '交互式三维分子；可使用右侧控件旋转、缩放和识别原子' : 'Interactive 3D molecule; use the adjacent controls to rotate, zoom and identify atoms');
    el('panel').setAttribute('aria-label', zh ? '分子信息和无障碍控件' : 'Molecule information and accessible controls');
    names = { H: text('hydrogen'), C: text('carbon'), O: text('oxygen') };
    const example = examples[el('molecule').value];
    el('molecule-name').textContent = `${text(el('molecule').value)} · ${example.formula}`;
    el('description').textContent = example.description[zh ? 1 : 0];
    Array.from(el('atom').options).forEach(option => {
      const atom = atoms[Number(option.value)];
      option.textContent = option.value === '' ? (zh ? '选择原子…' : 'Choose an atom…') : `${Number(option.value) + 1}: ${names[atom.elem] || atom.elem}`;
    });
    const selected = el('atom').value;
    if (selected !== '' && atoms[Number(selected)]) describeAtom(atoms[Number(selected)]);
    else el('atom-info').textContent = text('selectAtom');
    if (!el('error').hidden) el('error').textContent = errorText();
  }
  function fail(error) {
    console.error(error);
    el('error').hidden = false;
    el('error').textContent = errorText();
    document.querySelectorAll('button,select,input').forEach(control => { control.disabled = true; });
  }
  function describeAtom(atom) {
    const number = atoms.indexOf(atom) + 1;
    el('atom-info').textContent = `${zh ? '原子' : 'Atom'} ${number} · ${names[atom.elem] || atom.elem} · (${atom.x.toFixed(3)}, ${atom.y.toFixed(3)}, ${atom.z.toFixed(3)}) Å`;
  }
  function identify(atom) {
    if (!atom) return;
    if (selectedLabel) viewer.removeLabel(selectedLabel);
    const number = atoms.indexOf(atom) + 1;
    el('atom').value = String(number - 1);
    describeAtom(atom);
    selectedLabel = viewer.addLabel(`${atom.elem} ${number}`, { position: atom, backgroundColor: '#182b43', fontColor: 'white', fontSize: 14, backgroundOpacity: 0.9 });
    viewer.render();
  }
  function style() {
    const coloring = { colorscheme: { prop: 'elem', map: colors } };
    const styles = {
      ballstick: { sphere: { ...coloring, scale: 0.28 }, stick: { ...coloring, radius: 0.13 } },
      sphere: { sphere: coloring },
      stick: { stick: { ...coloring, radius: 0.18 } }
    };
    viewer.setStyle({}, styles[el('style').value]);
    viewer.render();
  }
  function resetView() {
    viewer.zoomTo();
    // zoomTo preserves rotation; restore the initial quaternion for a true reset.
    const view = viewer.getView();
    view[4] = 0; view[5] = 0; view[6] = 0; view[7] = 1;
    viewer.setView(view);
    el('zoom').value = '1';
    el('zoom-value').textContent = '1.0×';
    if (selectedLabel) viewer.removeLabel(selectedLabel);
    selectedLabel = undefined;
    el('atom').value = '';
    el('atom-info').textContent = text('selectAtom');
    viewer.render();
  }
  function load() {
    const example = examples[el('molecule').value];
    viewer.removeAllLabels();
    selectedLabel = undefined;
    viewer.removeAllModels();
    model = viewer.addModel(example.xyz, 'xyz');
    atoms = model.selectedAtoms({});
    if (!atoms.length) throw new Error('The local molecule has no atoms');
    el('molecule-name').textContent = `${text(el('molecule').value)} · ${example.formula}`;
    el('description').textContent = example.description[zh ? 1 : 0];
    el('atom').replaceChildren();
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = zh ? '选择原子…' : 'Choose an atom…';
    el('atom').append(placeholder);
    atoms.forEach((atom, index) => {
      const option = document.createElement('option');
      option.value = index;
      option.textContent = `${index + 1}: ${names[atom.elem] || atom.elem}`;
      el('atom').append(option);
    });
    model.setClickable({}, true, atom => identify(atom));
    style();
    resetView();
  }
  function safely(callback) {
    return () => { try { callback(); } catch (error) { fail(error); } };
  }
  window.addEventListener('message', event => {
    if (event.origin !== location.origin || event.source !== window.parent) return;
    if (event.data && event.data.type === 'cmc-language' && ['en', 'zh'].includes(event.data.lang)) {
      applyLanguage(event.data.lang);
    }
  });
  applyLanguage(zh ? 'zh' : 'en');
  try {
    if (typeof $3Dmol === 'undefined') throw new Error('3Dmol.js is unavailable');
    viewer = $3Dmol.createViewer(el('viewer'), { backgroundColor: '#edf2f8', antialias: true });
    load();
    el('molecule').addEventListener('change', safely(load));
    el('style').addEventListener('change', safely(style));
    el('reset').addEventListener('click', safely(resetView));
    el('atom').addEventListener('change', safely(() => {
      if (el('atom').value !== '') identify(atoms[Number(el('atom').value)]);
    }));
    [['left', -15, 'y'], ['right', 15, 'y'], ['up', -15, 'x'], ['down', 15, 'x']].forEach(([id, degrees, axis]) => {
      el(id).addEventListener('click', safely(() => { viewer.rotate(degrees, axis); viewer.render(); }));
    });
    // Treat the slider as an absolute zoom relative to the current model's fit.
    el('zoom').addEventListener('input', safely(() => {
      viewer.zoomTo();
      viewer.zoom(Number(el('zoom').value));
      el('zoom-value').textContent = Number(el('zoom').value).toFixed(1) + '×';
      viewer.render();
    }));
    const resize = safely(() => { viewer.resize(); viewer.render(); });
    window.addEventListener('resize', resize);
    if (typeof ResizeObserver !== 'undefined') new ResizeObserver(resize).observe(el('viewer'));
    el('viewer').addEventListener('webglcontextlost', event => {
      event.preventDefault();
      fail(new Error('WebGL context lost'));
    }, true);
  } catch (error) { fail(error); }
})();
