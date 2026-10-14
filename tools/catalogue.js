/* Local classroom extensions; engines are loaded only while their tool is open. */
(function () {
  'use strict';
  const tools = [
    ['geometry', 'Geometry Playground', 'Drag shapes, explore transformations and plot functions.', 'subject', '△', '#164e63'],
    ['ocr', 'Photo → Editable Text', 'Read printed English and Chinese from a photo, entirely on this computer.', 'ai', 'Aa', '#365314'],
    ['molecule', 'Molecule Explorer', 'Rotate local molecular models and identify their atoms.', 'subject', '⚛', '#312e81'],
    ['logic', 'Logic Circuit Lab', 'Connect switches, logic gates and lights. Predict the output.', 'subject', '⊕', '#713f12'],
    ['codequest', 'Code Quest', 'Solve programming puzzles with sequences, loops and conditions.', 'subject', '{}', '#4c1d95'],
    ['particles', 'Particle Sandbox', 'Paint interacting materials in a playful falling-sand simulation.', 'engage', '✦', '#7f1d1d']
  ].map(([id, name, ds, cat, symbol, color]) => ({
    id, name, ds, cat, ib: `linear-gradient(135deg,${color},#080e18)`,
    icon: `<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="3" y="3" width="42" height="42" rx="9" fill="${color}"/><text x="24" y="32" text-anchor="middle" fill="#fff" font-size="27" font-family="sans-serif">${symbol}</text></svg>`
  }));
  const guides = {
    geometry: {
      t: 'Investigate geometry and functions by moving points and changing sliders.',
      u: ['Explore triangle angles and side lengths', 'Compare a shape with its transformation', 'Connect a function equation to its graph'],
      h: ['Choose an activity', 'Drag the points or move the sliders', 'Use Reset to start again'],
      k: 'maths mathematics geometry triangle angles transformations reflection rotation function algebra graph'
    },
    ocr: {
      t: 'Turn a photograph of printed text into editable English or Chinese without uploading it.',
      u: ['Reuse printed passages in Dictation and Listening', 'Prepare a word list for Worksheet Maker', 'Send proofread notes to Slide Studio'],
      h: ['Choose a clear photo and the text language', 'Recognise the text and correct any mistakes', 'Copy, save or send the edited text to another tool'],
      n: 'Printed text works best. Proofread the result. PDF files are not supported. All recognition files are bundled locally.',
      k: 'ocr scan photo image text extract recognition chinese english textbook photograph'
    },
    molecule: {
      t: 'Explore three-dimensional molecules using models bundled with the app.',
      u: ['Compare molecular shapes', 'Identify atoms in a structure', 'Connect chemical formulas to three-dimensional models'],
      h: ['Choose a molecule', 'Drag to rotate and zoom to inspect it', 'Change the display style or select an atom'],
      k: 'chemistry biology molecule molecular atoms bonds protein 3d structure'
    },
    logic: {
      t: 'Build digital logic circuits with switches, gates and outputs.',
      u: ['Predict the output of AND, OR and NOT gates', 'Investigate truth tables', 'Build and explain a digital circuit'],
      h: ['Choose a sample circuit', 'Connect the components and toggle the switches', 'Reset or clear the circuit to try another idea'],
      n: 'This is a digital logic playground, not an analogue electrical simulator.',
      k: 'computing computer science logic circuit gate boolean switch truth table electronics'
    },
    codequest: {
      t: 'Practise programming ideas through visual block puzzles.',
      u: ['Plan a sequence of instructions', 'Use loops to avoid repetition', 'Explore conditional decisions'],
      h: ['Choose a challenge', 'Connect blocks to make a program', 'Run it, read the feedback and try again'],
      k: 'coding code programming blockly sequence loop condition algorithm computing puzzle'
    },
    particles: {
      t: 'Experiment with interacting materials in a falling-sand sandbox.',
      u: ['Predict what different materials will do', 'Compare changes in a playful simulation', 'Create a quick visual challenge'],
      h: ['Select a material and brush size', 'Paint on the canvas', 'Pause to discuss or clear to start again'],
      n: 'A playful simulation, not scientifically accurate chemistry. Requires a browser with WebGL support.',
      k: 'sand particle sandbox simulation materials falling paint water fire creative'
    }
  };
  const zh = {
    'Geometry Playground': '几何探索',
    'Drag shapes, explore transformations and plot functions.': '拖动图形，探索几何变换并绘制函数。',
    'Photo → Editable Text': '照片转文字',
    'Read printed English and Chinese from a photo, entirely on this computer.': '在本机识别照片中的中英文印刷文字。',
    'Molecule Explorer': '分子探索',
    'Rotate local molecular models and identify their atoms.': '旋转本地分子模型并识别原子。',
    'Logic Circuit Lab': '逻辑电路实验室',
    'Connect switches, logic gates and lights. Predict the output.': '连接开关、逻辑门和指示灯，预测输出。',
    'Code Quest': '编程闯关',
    'Solve programming puzzles with sequences, loops and conditions.': '使用顺序、循环和条件解决编程谜题。',
    'Particle Sandbox': '粒子沙盒',
    'Paint interacting materials in a playful falling-sand simulation.': '绘制不同材料，观察有趣的落沙模拟。',
    'Explore, code and discover': '探索、编程与发现',
    'Computing': '计算机科学',
    'Tool sessions reset when you leave. Save or copy your work first.': '离开工具后当前操作会重置。请先保存或复制作品。',
    'Open tool in a new tab': '在新标签页打开工具',
    'Replace the existing text with your edited photo text?': '用修改后的照片文字替换现有文字吗？',
    'Printed text works best. Proofread the result. PDF files are not supported. All recognition files are bundled locally.': '印刷文字效果最佳。请校对识别结果。不支持 PDF。所有识别文件均已随应用提供。',
    'This is a digital logic playground, not an analogue electrical simulator.': '这是数字逻辑实验工具，不是模拟电子电路仿真器。',
    'A playful simulation, not scientifically accurate chemistry. Requires a browser with WebGL support.': '这是趣味模拟，不代表准确的化学现象。需要浏览器支持 WebGL。'
  };
  const guideZh = [
    ['Investigate geometry and functions by moving points and changing sliders.', '通过拖动点和调整滑块研究几何与函数。'],
    ['Explore triangle angles and side lengths', '探索三角形的角度与边长'],
    ['Compare a shape with its transformation', '比较图形及其变换结果'],
    ['Connect a function equation to its graph', '理解函数方程与图像的关系'],
    ['Choose an activity', '选择活动'],
    ['Drag the points or move the sliders', '拖动点或调整滑块'],
    ['Use Reset to start again', '点击重置重新开始'],
    ['Turn a photograph of printed text into editable English or Chinese without uploading it.', '无需上传，将印刷文字照片转换成可编辑的中英文。'],
    ['Reuse printed passages in Dictation and Listening', '将印刷文章用于听写与听力'],
    ['Prepare a word list for Worksheet Maker', '为练习卷制作器准备词表'],
    ['Send proofread notes to Slide Studio', '将校对后的笔记发送到幻灯片工作室'],
    ['Choose a clear photo and the text language', '选择清晰的照片和文字语言'],
    ['Recognise the text and correct any mistakes', '识别文字并修正错误'],
    ['Copy, save or send the edited text to another tool', '复制、保存或将修改后的文字发送到其他工具'],
    ['Explore three-dimensional molecules using models bundled with the app.', '使用应用自带的模型探索三维分子。'],
    ['Compare molecular shapes', '比较分子形状'],
    ['Identify atoms in a structure', '识别结构中的原子'],
    ['Connect chemical formulas to three-dimensional models', '将化学式与三维模型联系起来'],
    ['Choose a molecule', '选择分子'],
    ['Drag to rotate and zoom to inspect it', '拖动旋转，缩放查看'],
    ['Change the display style or select an atom', '更改显示样式或选择原子'],
    ['Build digital logic circuits with switches, gates and outputs.', '使用开关、逻辑门和输出组件搭建数字逻辑电路。'],
    ['Predict the output of AND, OR and NOT gates', '预测与门、或门和非门的输出'],
    ['Investigate truth tables', '研究真值表'],
    ['Build and explain a digital circuit', '搭建并解释数字电路'],
    ['Choose a sample circuit', '选择示例电路'],
    ['Connect the components and toggle the switches', '连接组件并切换开关'],
    ['Reset or clear the circuit to try another idea', '重置或清空电路以尝试新想法'],
    ['Practise programming ideas through visual block puzzles.', '通过可视化积木谜题练习编程思维。'],
    ['Plan a sequence of instructions', '规划指令顺序'],
    ['Use loops to avoid repetition', '使用循环避免重复'],
    ['Explore conditional decisions', '探索条件判断'],
    ['Choose a challenge', '选择挑战'],
    ['Connect blocks to make a program', '连接积木编写程序'],
    ['Run it, read the feedback and try again', '运行程序，阅读反馈并再次尝试'],
    ['Experiment with interacting materials in a falling-sand sandbox.', '在落沙沙盒中探索材料的相互作用。'],
    ['Predict what different materials will do', '预测不同材料的行为'],
    ['Compare changes in a playful simulation', '在趣味模拟中比较变化'],
    ['Create a quick visual challenge', '创建直观的小挑战'],
    ['Select a material and brush size', '选择材料和画笔大小'],
    ['Paint on the canvas', '在画布上绘制'],
    ['Pause to discuss or clear to start again', '暂停讨论或清空重新开始']
  ];
  guideZh.forEach(([key, value]) => { zh[key] = value; });
  if (window.RSLang) window.RSLang.add('zh', zh);

  function install({ apps, open, current, importText }) {
    const stage = document.getElementById('stage');
    const language = () => window.RSLang && window.RSLang.current === 'zh' ? 'zh' : 'en';
    const tr = text => window.RSLang ? window.RSLang.t(text) : text;
    let active = null;
    tools.forEach(tool => {
      const section = document.createElement('section');
      section.className = 'app local-tool';
      section.id = 'a-' + tool.id;
      section.hidden = true;
      const bar = document.createElement('div');
      bar.className = 'local-tool-bar';
      const note = document.createElement('span');
      note.textContent = 'Tool sessions reset when you leave. Save or copy your work first.';
      const link = document.createElement('a');
      link.textContent = 'Open tool in a new tab';
      link.target = '_blank';
      link.rel = 'noopener';
      bar.append(note, link);
      section.append(bar);
      stage.append(section);
      let frame = null;
      const url = () => 'tools/' + tool.id + '.html?lang=' + language();
      apps[tool.id] = {
        show() {
          if (frame) return;
          frame = document.createElement('iframe');
          frame.title = tr(tool.name);
          frame.src = url();
          frame.setAttribute('allow', "camera 'none'; microphone 'none'; geolocation 'none'");
          link.href = url();
          section.append(frame);
          active = { id: tool.id, frame };
        },
        hide() {
          if (active && active.frame === frame) active = null;
          if (frame) frame.remove();
          frame = null;
        }
      };
    });
    window.addEventListener('message', event => {
      const data = event.data;
      if (!active || active.id !== 'ocr' || current() !== 'ocr' ||
          event.source !== active.frame.contentWindow || event.origin !== location.origin ||
          !data || data.type !== 'cmc-ocr-text' || typeof data.text !== 'string' ||
          !['listen', 'worksheet', 'slides'].includes(data.target)) return;
      const text = data.text.trim();
      if (!text || text.length > 100000) return;
      if (!window.confirm(tr('Replace the existing text with your edited photo text?'))) return;
      open(data.target);
      importText(data.target, text);
    });
    window.addEventListener('rslangchange', () => {
      if (!active) return;
      active.frame.title = tr(tools.find(tool => tool.id === active.id).name);
      active.frame.contentWindow.postMessage({ type: 'cmc-language', lang: language() }, location.origin);
    });
  }
  window.CMCTools = { tools, guides, install };
})();
