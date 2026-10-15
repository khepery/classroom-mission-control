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
      t: 'Drag points, transform shapes, plot functions and test theorems, with answers hidden until you reveal them.',
      u: ['Explore triangles, transformations, functions, Pythagoras and circle theorems', 'Predict first, then reveal the measurement or image', 'Solve ready-made tasks such as finding the rotation that lands on a target'],
      h: ['Choose one of five modes, or press 1 to 5', 'Drag points or type exact values and watch the measurements update', 'Hide the answer to predict, load an activity, or use projector mode and Pick a student'],
      n: 'Triangle classification allows a small tolerance, so turn on snap to grid for exact results. Everything runs offline.',
      k: 'maths mathematics geometry triangle angles transformations reflection rotation enlargement function algebra graph quadratic sine pythagoras circle theorems'
    },
    ocr: {
      t: 'Turn a photo of printed text into editable English or Chinese on this computer, then make word lists, gap-fills and slides from it.',
      u: ['Read and proofread a passage, checking the highlighted uncertain words', 'Learn key vocabulary from an automatic word list', 'Complete a gap-fill version of a textbook passage'],
      h: ['Add photos by choosing, taking, dragging or pasting them, then rotate or clean them up', 'Pick the language, recognise, then proofread using the confidence highlights', 'Copy, save, print or send the text, or make a word list or gap-fill'],
      n: 'Printed text works best. Proofread the result. PDF files are not supported. Photos never leave this device. Only recognised text is kept, locally, and can be cleared.',
      k: 'ocr scan photo image text extract recognition chinese english textbook photograph word list cloze gap fill'
    },
    molecule: {
      t: 'Rotate 23 classic molecules in 3D, measure bonds and angles, predict shapes, compare and quiz the class.',
      u: ['Rotate molecules and measure bond lengths and angles', 'Predict shape and polarity from a formula, then reveal', 'Compare two molecules side by side and take a scored quiz'],
      h: ['Pick a molecule using topic chips or search', 'Rotate it, turn on labels and bond lengths, and use Measure', 'Switch to Predict first, Compare or Quiz, or project it on the board'],
      n: 'Coordinates are illustrative, for learning, not experimental data. The 3D view needs WebGL; without it a flat preview is shown.',
      k: 'chemistry biology molecule molecular atoms bonds shape polarity vsepr 3d structure quiz'
    },
    logic: {
      t: 'Flip switches, predict the lights, then test your prediction on a real digital circuit.',
      u: ['Explore 17 sample circuits with story problems and live Boolean expressions', 'Predict the truth table, then let the circuit check every row', 'Build circuits for 12 challenges such as XOR using only NAND gates'],
      h: ['Pick a lesson or challenge, then flip switches or press Next input row', 'Fill in your predicted outputs and press Check', 'Build your own with the toolbox, label the Toggle inputs and LED outputs, then Check'],
      n: 'Digital logic only (0 and 1), not an analogue electrical simulator.',
      k: 'computing computer science logic circuit gate boolean switch truth table electronics adder'
    },
    codequest: {
      t: 'Guide a robot through 23 block-coding missions, from sequences to routines, then debug broken programs.',
      u: ['Build programs from blocks, or add blocks with the keyboard builder', 'Run, step or slow-run and see their blocks as JavaScript or pseudo-code', 'Earn stars for using few blocks and fix Debug the bug programs'],
      h: ['Pick a mission on the map and read the goal', 'Build a program under when Run is pressed, then press Run or Step', 'Reach the star with all gems collected, using fewer blocks for more stars'],
      n: 'Original puzzles, not Blockly Games. Progress stays in this browser only. Programs are interpreted, never run as JavaScript.',
      k: 'coding code programming blockly sequence loop condition algorithm computing puzzle robot debug'
    },
    particles: {
      t: 'Predict, paint, run and observe: a falling-sand lab with ready-made challenges and observation sheets.',
      u: ['Write a hypothesis, then paint 19 materials and watch what happens', 'Take on 10 challenges such as Build a dam with a live goal tracker', 'Record hypothesis, observation and explanation, then print or copy the sheet'],
      h: ['Pick a challenge and press Load scene; it loads paused so students predict first', 'Paint with a material, then press Run; use step, slow motion or undo', 'Compare with the goal, take a snapshot and fill in the observation sheet'],
      n: 'A playful simulation, not scientifically accurate chemistry. Requires a browser with WebGL support. Challenges and the observation sheet still work without it.',
      k: 'sand particle sandbox simulation materials falling paint water fire creative states of matter hypothesis'
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
  };
  const guideZh = [
    ['Drag points, transform shapes, plot functions and test theorems, with answers hidden until you reveal them.', '在图上拖动点、变换图形、绘制函数、验证定理，答案由你决定何时揭晓。'],
    ['Explore triangles, transformations, functions, Pythagoras and circle theorems', '探索三角形、几何变换、函数、勾股定理和圆定理'],
    ['Predict first, then reveal the measurement or image', '先预测，再揭晓测量值或图像'],
    ['Solve ready-made tasks such as finding the rotation that lands on a target', '完成现成任务，例如找出使图形与目标重合的旋转'],
    ['Choose one of five modes, or press 1 to 5', '选择五种模式之一，或按 1 到 5'],
    ['Drag points or type exact values and watch the measurements update', '拖动点或输入精确数值，测量值实时更新'],
    ['Hide the answer to predict, load an activity, or use projector mode and Pick a student', '隐藏答案先预测、载入活动，或使用投影模式和随机点名'],
    ['Triangle classification allows a small tolerance, so turn on snap to grid for exact results. Everything runs offline.', '三角形分类允许小误差，请开启网格吸附以获得精确结果。全部功能离线运行。'],
    ['Turn a photo of printed text into editable English or Chinese on this computer, then make word lists, gap-fills and slides from it.', '把印刷文字的照片转成可编辑的中英文文字，全程在本机完成，并可进一步制作词汇表、填空练习和幻灯片。'],
    ['Read and proofread a passage, checking the highlighted uncertain words', '阅读并校对识别出的文章，检查高亮的不确定词'],
    ['Learn key vocabulary from an automatic word list', '通过自动生成的词汇表学习关键词汇'],
    ['Complete a gap-fill version of a textbook passage', '完成由课文生成的填空练习'],
    ['Add photos by choosing, taking, dragging or pasting them, then rotate or clean them up', '通过选择、拍照、拖入或粘贴添加照片，并按需旋转、优化'],
    ['Pick the language, recognise, then proofread using the confidence highlights', '选择语言并识别，然后利用置信度高亮校对'],
    ['Copy, save, print or send the text, or make a word list or gap-fill', '复制、保存、打印或发送文字，或生成词汇表、填空练习'],
    ['Printed text works best. Proofread the result. PDF files are not supported. Photos never leave this device. Only recognised text is kept, locally, and can be cleared.', '印刷文字效果最佳。请校对识别结果。不支持 PDF 文件。照片不会离开本设备；仅在本机保存识别出的文字，可随时清除。'],
    ['Rotate 23 classic molecules in 3D, measure bonds and angles, predict shapes, compare and quiz the class.', '三维旋转 23 种经典分子，测量键长键角，先猜后揭晓、对比分子并进行课堂小测。'],
    ['Rotate molecules and measure bond lengths and angles', '旋转分子并测量键长和键角'],
    ['Predict shape and polarity from a formula, then reveal', '根据化学式预测形状和极性，再揭晓'],
    ['Compare two molecules side by side and take a scored quiz', '并排对比两种分子，并完成计分小测'],
    ['Pick a molecule using topic chips or search', '用主题标签或搜索选择分子'],
    ['Rotate it, turn on labels and bond lengths, and use Measure', '旋转分子，开启标签和键长，使用“测量”'],
    ['Switch to Predict first, Compare or Quiz, or project it on the board', '切换到“先猜后揭晓”、“对比”或“小测”，也可投影到大屏'],
    ['Coordinates are illustrative, for learning, not experimental data. The 3D view needs WebGL; without it a flat preview is shown.', '坐标为示意性数据，仅供学习，不作实验分析。三维视图需要 WebGL，不可用时改用平面预览。'],
    ['Flip switches, predict the lights, then test your prediction on a real digital circuit.', '拨动开关、预测指示灯，再用真实的数字电路验证你的预测。'],
    ['Explore 17 sample circuits with story problems and live Boolean expressions', '探索 17 个带情境题和实时布尔表达式的示例电路'],
    ['Predict the truth table, then let the circuit check every row', '先预测真值表，再让电路自动检查每一行'],
    ['Build circuits for 12 challenges such as XOR using only NAND gates', '完成 12 个搭建挑战，如只用 NAND 门做出 XOR'],
    ['Pick a lesson or challenge, then flip switches or press Next input row', '选择课例或挑战，拨动开关或点“下一行输入”'],
    ['Fill in your predicted outputs and press Check', '填写预测输出并点“检查”'],
    ['Build your own with the toolbox, label the Toggle inputs and LED outputs, then Check', '用工具箱搭建电路，给 Toggle 输入和 LED 输出命名，再点“检查”'],
    ['Digital logic only (0 and 1), not an analogue electrical simulator.', '仅限数字逻辑（0 和 1），不是模拟电路仿真器。'],
    ['Guide a robot through 23 block-coding missions, from sequences to routines, then debug broken programs.', '用积木指挥机器人完成 23 个编程任务，从顺序到例程，还要修复出错的程序。'],
    ['Build programs from blocks, or add blocks with the keyboard builder', '用积木搭建程序，也可用键盘搭建面板添加积木'],
    ['Run, step or slow-run and see their blocks as JavaScript or pseudo-code', '运行、单步或慢速运行，并查看积木对应的 JavaScript 或伪代码'],
    ['Earn stars for using few blocks and fix Debug the bug programs', '用更少的积木赢得星星，并修复“找错误”程序'],
    ['Pick a mission on the map and read the goal', '在任务地图上选一关，读懂目标'],
    ['Build a program under when Run is pressed, then press Run or Step', '把积木搭在“点击运行时”下面，然后点“运行”或“单步”'],
    ['Reach the star with all gems collected, using fewer blocks for more stars', '收集全部宝石并到达星星，积木越少星星越多'],
    ['Original puzzles, not Blockly Games. Progress stays in this browser only. Programs are interpreted, never run as JavaScript.', '原创关卡，并非 Blockly Games。进度只保存在本浏览器中。程序由解释器执行，绝不会当作 JavaScript 运行。'],
    ['Predict, paint, run and observe: a falling-sand lab with ready-made challenges and observation sheets.', '预测、绘制、运行、观察：自带挑战任务和观察记录表的落沙实验室。'],
    ['Write a hypothesis, then paint 19 materials and watch what happens', '先写下假设，再用 19 种材料绘制并观察变化'],
    ['Take on 10 challenges such as Build a dam with a live goal tracker', '完成 10 个挑战，如建水坝，并有实时目标进度'],
    ['Record hypothesis, observation and explanation, then print or copy the sheet', '记录假设、观察和解释，并可打印或复制记录表'],
    ['Pick a challenge and press Load scene; it loads paused so students predict first', '选择挑战并点“载入场景”；场景默认暂停，先预测'],
    ['Paint with a material, then press Run; use step, slow motion or undo', '选材料绘制，点“运行”；可单步、慢放或撤销'],
    ['Compare with the goal, take a snapshot and fill in the observation sheet', '对照目标，保存快照并填写观察记录表'],
    ['A playful simulation, not scientifically accurate chemistry. Requires a browser with WebGL support. Challenges and the observation sheet still work without it.', '这是趣味模拟，不代表准确的化学现象。需要浏览器支持 WebGL；没有 WebGL 时挑战和观察记录表仍可使用。']
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
          active = { id: tool.id, frame, link };
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
      active.link.href = 'tools/' + active.id + '.html?lang=' + language();
      active.frame.contentWindow.postMessage({ type: 'cmc-language', lang: language() }, location.origin);
    });
  }
  window.CMCTools = { tools, guides, install };
})();
