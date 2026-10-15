(() => {
  'use strict';
  // [English, 简体中文] pairs. {name} marks a value filled in by the tool.
  const words = {
    title1: ['Geometry', '几何'], title2: ['Playground', '探索'],
    intro: ['Drag points, explore transformations, plot functions and test theorems. Everything stays on this device.', '拖动点、探索几何变换、绘制函数图像并验证定理。所有操作均在本设备上完成。'],
    board: ['Projector', '投影模式'], boardTip: ['Big text and a larger graph for the classroom screen (P)', '为课堂大屏放大文字和图像（P）'],
    panelBtn: ['Hide controls', '隐藏控制面板'], panelShow: ['Show controls', '显示控制面板'],
    pick: ['Pick a student', '随机点名'], reset: ['Reset', '重置'],
    modeLabel: ['Mode', '模式'], describeLabel: ['Description of the construction', '图形的文字描述'],
    m_triangle: ['Triangle', '三角形'], m_transform: ['Transformations', '几何变换'], m_function: ['Functions', '函数图像'],
    m_pythag: ['Pythagoras', '勾股定理'], m_circle: ['Circle theorems', '圆定理'],
    boardAria: ['Interactive graph. Use the controls beside it to enter exact values.', '交互式图像。可使用旁边的控件输入精确数值。'],
    panelAria: ['Graph controls and measurements', '图像控件与测量结果'],
    error: ['Unable to load the geometry graph. Check the local library files and reload the page.', '无法加载几何图像。请检查本地库文件并重新加载页面。'],
    // activities
    actsTitle: ['Ready-made activities', '现成课堂活动'],
    actsHint: ['Choose a task: the board is set up for you and the student prompt appears under the graph. Teacher notes stay hidden until you reveal them.', '选择一个任务：图像会自动设置好，学生题目显示在图像下方。教师提示在点击后才会显示。'],
    task: ['Task', '任务'], showAns: ['Show teacher notes', '显示教师提示'], hideAns: ['Hide teacher notes', '隐藏教师提示'],
    reload: ['Restart task', '重新开始'], closeTask: ['Close task', '关闭任务'], teacher: ['Teacher notes', '教师提示'],
    // share
    shareTitle: ['Save, share & export', '保存、分享与导出'],
    save: ['Save', '保存'], restore: ['Restore', '恢复'], copyCode: ['Copy state code', '复制状态代码'],
    copyText: ['Copy description', '复制文字描述'], png: ['Download PNG', '下载 PNG'], print: ['Print worksheet', '打印练习页'],
    codeLabel: ['Paste a state code to load it', '粘贴状态代码以载入'], load: ['Load', '载入'],
    saveNote: ['Your work is also saved automatically in this browser and comes back next time.', '您的操作也会自动保存在此浏览器中，下次打开时自动恢复。'],
    saved: ['Saved on this device.', '已保存在本设备。'], restored: ['Saved work restored.', '已恢复保存的内容。'],
    nothingSaved: ['Nothing has been saved yet.', '尚无已保存的内容。'], storageFail: ['This browser blocked saving.', '浏览器阻止了保存。'],
    copied: ['Copied to the clipboard.', '已复制到剪贴板。'], copyFail: ['Could not copy. Select the text and copy it manually.', '无法复制，请手动选择并复制。'],
    badCode: ['That state code is not valid.', '该状态代码无效。'], codeLoaded: ['State loaded.', '状态已载入。'],
    pngFail: ['Could not create the image.', '无法生成图片。'], autoBack: ['Your last session was restored.', '已恢复您上次的内容。'],
    keys: ['Keys: 1–5 modes · P projector · R reveal / hide · Esc leave projector. Classification of dragged triangles allows a small tolerance (0.05 units, 0.5°); switch on snap to grid for exact results.', '快捷键：1–5 切换模式 · P 投影模式 · R 显示/隐藏答案 · Esc 退出投影。拖动的三角形分类允许小误差（0.05 单位、0.5°）；开启吸附网格可得到精确结果。'],
    powered: ['Powered by local JSXGraph 1.14.0.', '使用本地 JSXGraph 1.14.0。'], license: ['License', '许可证'],
    // pick
    pickNone: ['No class roster found. Add a class in the hub first.', '没有找到班级名单，请先在主页中添加班级。'],
    pickNow: ['Next up', '请回答'], pickAgain: ['Pick again', '再抽一位'], close: ['Close', '关闭'],
    // common controls
    snap: ['Snap to grid', '吸附网格'], snapOff: ['Off', '关'], snap1: ['Whole numbers', '整数'], snap05: ['Halves', '半格'],
    presets: ['Presets', '预设'], vertices: ['Vertices', '顶点'], xy: ['x, y', 'x、y'],
    hideNow: ['Hide answers (predict first)', '隐藏结果（先预测）'], revealNow: ['Reveal', '揭晓结果'],
    predictHidden: ['Hidden: predict first, then press Reveal (R).', '已隐藏：先预测，再点击“揭晓结果”（R）。'],
    // triangle
    sideLabels: ['Show side lengths', '显示边长'], angleLabels: ['Show angles', '显示角度'],
    p_right: ['Right-angled 3-4-5', '直角 3-4-5'], p_isos: ['Isosceles', '等腰'], p_equi: ['Equilateral', '等边'],
    p_scal: ['Scalene', '不等边'], p_obt: ['Obtuse', '钝角'],
    triHint: ['Drag A, B and C, or type exact coordinates.', '拖动 A、B、C，或输入精确坐标。'],
    sides: ['Sides', '边长'], angles: ['Angles', '角度'], angleSum: ['Angle sum', '内角和'], perimeter: ['Perimeter', '周长'], area: ['Area', '面积'],
    sc_scalene: ['Scalene', '不等边'], sc_isosceles: ['Isosceles', '等腰'], sc_equilateral: ['Equilateral', '等边'],
    ac_acute: ['Acute-angled', '锐角'], ac_right: ['Right-angled', '直角'], ac_obtuse: ['Obtuse-angled', '钝角'],
    degenerate: ['Degenerate: the three points are in a line', '退化：三点共线'],
    triWord: ['triangle', '三角形'], unit2: ['square units', '平方单位'],
    // transform
    opLabel: ['Transformation', '变换方式'],
    op_rotate: ['Rotate', '旋转'], op_translate: ['Translate', '平移'], op_reflect: ['Reflect', '轴对称'], op_scale: ['Enlarge', '放大'],
    centre: ['Centre', '中心'], angle: ['Angle (° anticlockwise)', '角度（° 逆时针为正）'], vec: ['Vector', '向量'], vx: ['Right (x)', '向右（x）'], vy: ['Up (y)', '向上（y）'],
    factor: ['Scale factor', '放大倍数'], mirror: ['Mirror line', '对称轴'],
    mt_x: ['x-axis', 'x 轴'], mt_y: ['y-axis', 'y 轴'], mt_yx: ['y = x', 'y = x'], mt_ynx: ['y = −x', 'y = −x'],
    mt_vk: ['x = k', 'x = k'], mt_hk: ['y = k', 'y = k'], mt_custom: ['Drag the line', '拖动对称轴'],
    kValue: ['k', 'k'], mp1: ['Point 1 on the line', '直线上的点 1'], mp2: ['Point 2 on the line', '直线上的点 2'],
    quick: ['Quick angles', '常用角度'], showLines: ['Show construction lines', '显示辅助线'],
    objectPts: ['Object vertices', '原图形顶点'], hideImage: ['Hide the image (predict first)', '隐藏像（先预测）'], revealImage: ['Reveal the image', '显示像'],
    imageTable: ['Coordinates', '坐标'], point: ['Point', '点'], object: ['Object', '原像'], image: ['Image', '像'],
    imageHidden: ['hidden', '已隐藏'],
    trHint: ['Amber is the object, cyan is the image. Drag the vertices, the centre or the mirror line.', '琥珀色为原图形，青色为像。可拖动顶点、中心或对称轴。'],
    d_rot_acw: ['Rotation {a}° anticlockwise about {c}', '绕点 {c} 逆时针旋转 {a}°'],
    d_rot_cw: ['Rotation {a}° clockwise about {c}', '绕点 {c} 顺时针旋转 {a}°'],
    d_rot_180: ['Rotation 180° about {c}', '绕点 {c} 旋转 180°'],
    d_rot_0: ['No rotation (0°)', '不旋转（0°）'],
    d_trans: ['Translation by vector {v}{p}', '平移，向量 {v}{p}'],
    d_right: ['{n} right', '向右 {n}'], d_left: ['{n} left', '向左 {n}'], d_up: ['{n} up', '向上 {n}'], d_down: ['{n} down', '向下 {n}'],
    d_ref: ['Reflection in the line {l}', '关于直线 {l} 作轴对称'],
    d_enl: ['Enlargement, scale factor {k}, centre {c}', '以点 {c} 为中心放大（位似），倍数 {k}'],
    enlNeg: ['A negative scale factor puts the image on the opposite side of the centre, turned upside down.', '负的倍数使像位于中心的另一侧，并且倒转。'],
    enlSmall: ['A scale factor between −1 and 1 makes the image smaller than the object.', '倍数的绝对值小于 1 时，像比原图形小。'],
    enlArea: ['Lengths × {k}, area × {a}', '长度 × {k}，面积 × {a}'],
    xAxisName: ['{l} (the x-axis)', '{l}（x 轴）'], yAxisName: ['{l} (the y-axis)', '{l}（y 轴）'],
    lineThrough: ['the line through {p} and {q}', '经过 {p} 和 {q} 的直线'],
    matched: ['Match! The image lands exactly on the target.', '吻合！像与目标完全重合。'],
    notMatched: ['Not yet: move the image onto the dashed green target.', '还没有：请使像与绿色虚线目标重合。'],
    targetNote: ['Target', '目标'], clearTarget: ['Remove target', '移除目标'],
    // function
    f1: ['Function 1', '函数 1'], f2: ['Function 2', '函数 2'], compare: ['Compare with a second function', '叠加第二个函数进行比较'],
    fam_lin: ['Linear', '一次函数'], fam_quad: ['Quadratic', '二次函数'], fam_trig: ['Trigonometric', '三角函数'],
    fnType: ['Sine or cosine', '正弦或余弦'], sin: ['sin', 'sin'], cos: ['cos', 'cos'],
    units: ['Angle unit', '角度单位'], deg: ['Degrees', '角度制'], rad: ['Radians', '弧度制'],
    keyPts: ['Show key points', '显示关键点'], valueTable: ['Show table of values', '显示函数值表'],
    hideGraphs: ['Hide graphs (sketch first)', '隐藏图像（先画草图）'], revealGraphs: ['Reveal the graphs', '显示图像'],
    fnHint: ['Use the sliders or type exact values. Teaching tip: change one number at a time.', '拖动滑块或输入精确数值。教学提示：每次只改变一个数。'],
    gradient: ['Gradient', '斜率'], yint: ['y-intercept', 'y 轴截距'], xint: ['x-intercept', 'x 轴截距'], perpGrad: ['Perpendicular gradient', '垂线的斜率'],
    horiz: ['Horizontal line, no x-intercept', '水平直线，没有 x 轴截距'], sameLine: ['Same graph', '图像相同'],
    vertex: ['Vertex', '顶点'], minimum: ['minimum', '最小值'], maximum: ['maximum', '最大值'], axis: ['Axis of symmetry', '对称轴'],
    disc: ['Discriminant', '判别式'], roots: ['Roots', '根'], noRoots: ['No real roots (graph misses the x-axis)', '无实根（图像与 x 轴不相交）'],
    oneRoot: ['One repeated root (graph touches the x-axis)', '一个重根（图像与 x 轴相切）'], twoRoots: ['Two roots', '两个根'],
    opensUp: ['Opens upwards', '开口向上'], opensDown: ['Opens downwards', '开口向下'], aZero: ['a = 0, so this is really a straight line', 'a = 0，此时其实是一条直线'],
    amplitude: ['Amplitude', '振幅'], period: ['Period', '周期'], midline: ['Midline', '中线'], phase: ['Horizontal shift', '水平平移'],
    maxMin: ['Maximum / minimum', '最大值 / 最小值'], noPeriod: ['none (b = 0)', '无（b = 0）'],
    intersect: ['Intersections', '交点'], noIntersect: ['The graphs do not meet', '两图像没有交点'],
    tableOfValues: ['Table of values', '函数值表'],
    // pythagoras
    pyHint: ['Drag B along the x-axis and A along the y-axis, or type the lengths. The squares show the areas.', '沿 x 轴拖动 B、沿 y 轴拖动 A，或输入边长。正方形表示面积。'],
    legA: ['Horizontal leg a', '水平直角边 a'], legB: ['Vertical leg b', '竖直直角边 b'], hyp: ['Hypotenuse c', '斜边 c'],
    triple: ['A whole-number (Pythagorean) triple!', '这是一组整数勾股数！'], notTriple: ['Not a whole-number triple.', '不是整数勾股数。'],
    areas: ['Areas', '面积'], pySum: ['Area of the two small squares', '两个小正方形面积之和'], pyBig: ['Area of the big square', '大正方形面积'],
    triples: ['Triples', '勾股数'], hypUnknown: ['c² = ?', 'c² = ?'],
    // circle
    th_centre: ['Angle at the centre', '圆心角与圆周角'], th_semi: ['Angle in a semicircle', '半圆上的圆周角'], th_segment: ['Angles in the same segment', '同弧所对的圆周角'],
    theorem: ['Theorem', '定理'], posA: ['Position of A (°)', 'A 的位置（°）'], posB: ['Position of B (°)', 'B 的位置（°）'], posP: ['Position of P (°)', 'P 的位置（°）'], posQ: ['Position of Q (°)', 'Q 的位置（°）'],
    ciHint: ['Drag the points around the circle, or type their positions in degrees.', '沿圆周拖动各点，或输入其位置角度。'],
    ciCentre: ['Angle at the centre AOB', '圆心角 AOB'], ciCirc: ['Angle at the circumference APB', '圆周角 APB'],
    ciCirc2: ['Angle at the circumference AQB', '圆周角 AQB'], ratio: ['Ratio', '比值'],
    ciRel1: ['The angle at the centre is twice the angle at the circumference.', '圆心角是同弧所对圆周角的两倍。'],
    ciRel2: ['P is on the minor arc: the reflex angle at the centre (360° − AOB) is twice the angle at P.', 'P 在劣弧上：优弧所对的圆心角（360° − AOB）是 P 处圆周角的两倍。'],
    ciSemi: ['AB is a diameter, so the angle in a semicircle is 90°.', 'AB 是直径，所以半圆上的圆周角是 90°。'],
    ciSame: ['Angles in the same segment are equal.', '同弧所对的圆周角相等。'],
    ciOpp: ['P and Q are on opposite sides of AB, so the angles add up to 180°.', 'P、Q 在 AB 的两侧，所以两角之和为 180°。'],
    // print
    printName: ['Name: ______________   Date: __________', '姓名：______________   日期：__________'],
    printTask: ['Task', '任务'], printNotes: ['Notes and working', '笔记与演算'],
    // live descriptions
    liveTri: ['Triangle ABC', '三角形 ABC']
  };

  // Ready-made tasks: t = title, q = student prompt, a = teacher notes.
  const acts = {
    rot: {
      t: ['Find the rotation', '找出旋转'],
      q: ['The dashed green triangle is the image of ABC after a rotation. Find the angle and the centre so that A′B′C′ lands exactly on it.', '绿色虚线三角形是 ABC 旋转后的像。请找出旋转的角度和中心，使 A′B′C′ 与它完全重合。'],
      a: ['Rotation 90° anticlockwise about (2, 0). Method: the centre is on the perpendicular bisector of AA′ and of BB′; where they cross is the centre. Check: A(1, 1) → A′(1, −1). Extension: what angle and centre if the image is reached by rotating clockwise?', '绕点 (2, 0) 逆时针旋转 90°。方法：旋转中心在 AA′ 与 BB′ 的垂直平分线上，两线交点即为中心。验证：A(1, 1) → A′(1, −1)。拓展：若改为顺时针旋转，角度和中心分别是多少？']
    },
    ref: {
      t: ['Find the mirror line', '找出对称轴'],
      q: ['Triangle ABC is reflected onto the dashed green triangle. Choose or drag a mirror line so the image lands on it. What is its equation?', '三角形 ABC 经轴对称得到绿色虚线三角形。请选择或拖动对称轴使像与之重合，并写出它的方程。'],
      a: ['Reflection in the line x = 3. Each point and its image are the same distance from the mirror, and the mirror passes through the midpoint of AA′ = (3, 1). Ask: what would the mirror be if A′ were (1, −1)?', '关于直线 x = 3 作轴对称。每个点与它的像到对称轴的距离相等，对称轴经过 AA′ 的中点 (3, 1)。追问：如果 A′ 是 (1, −1)，对称轴是什么？']
    },
    enl: {
      t: ['Find the enlargement', '找出放大'],
      q: ['The dashed green triangle is an enlargement of ABC. Find the scale factor and the centre of enlargement.', '绿色虚线三角形是 ABC 的放大像。请找出放大倍数和放大中心。'],
      a: ['Scale factor 2, centre (1, 1). A is at the centre, so it does not move. Method: draw lines through each vertex and its image; they meet at the centre. Lengths double and the area is 4 times as big.', '放大倍数为 2，中心 (1, 1)。A 就在中心，所以位置不变。方法：分别连接每个顶点与它的像，延长后交于中心。边长变为 2 倍，面积变为 4 倍。']
    },
    neg: {
      t: ['Negative scale factor: predict', '负倍数放大：先预测'],
      q: ['Predict: where will the image be when ABC is enlarged by scale factor −2 about the origin? Sketch it, then reveal.', '预测：三角形 ABC 以原点为中心、倍数为 −2 放大后，像在哪里？先画出草图，再揭晓。'],
      a: ['A′(−2, −2), B′(−8, −2), C′(−2, −6). The image is twice as big, on the opposite side of the centre and upside down. A negative enlargement is an enlargement by |k| followed by a 180° rotation about the centre.', 'A′(−2, −2)，B′(−8, −2)，C′(−2, −6)。像是原图的 2 倍，位于中心另一侧并倒转。负倍数放大等于先按 |k| 放大，再绕中心旋转 180°。']
    },
    trans: {
      t: ['Describe the translation', '描述平移'],
      q: ['Triangle ABC has been translated onto the dashed green triangle. Find the translation vector.', '三角形 ABC 平移到了绿色虚线三角形的位置。请找出平移向量。'],
      a: ['Translation by (−4, 3): 4 left and 3 up. Every point moves by the same vector, so the shape, size and direction do not change. Check with A(1, 1) → A′(−3, 4).', '平移向量 (−4, 3)：向左 4，向上 3。每个点移动同一向量，所以图形的形状、大小和方向都不变。验证：A(1, 1) → A′(−3, 4)。']
    },
    area6: {
      t: ['Make a triangle with area 6', '构造面积为 6 的三角形'],
      q: ['Make a triangle with an area of exactly 6 square units. How many different triangles can you find? What do they have in common?', '构造一个面积恰好为 6 平方单位的三角形。你能找到多少种不同的三角形？它们有什么共同点？'],
      a: ['Area = ½ × base × height. For example A(0, 0), B(4, 0), C(0, 3), or base 6 and height 2. Slide C along a line parallel to the base: the area never changes. Keep snap on to make whole-number solutions.', '面积 = ½ × 底 × 高。例如 A(0, 0)，B(4, 0)，C(0, 3)，或底 6、高 2。把 C 沿平行于底的直线移动，面积不变。开启吸附网格便于找到整数解。']
    },
    predict: {
      t: ['Estimate the angles', '估计三个角'],
      q: ['Estimate each angle by eye and write down your prediction. Add them up. Then reveal the measurements. How close were you?', '目测估计每个角并写下预测，再求和。然后揭晓测量结果，你的估计有多接近？'],
      a: ['The angles always add up to 180°. Move a vertex and ask whether the total can ever change. Link to a straight line: tear off the corners and put them side by side.', '三个角之和始终是 180°。移动一个顶点，问学生总和会不会改变。可联系平角：撕下三个角并排拼在一起。']
    },
    types: {
      t: ['Triangle types on a grid', '格点上的三角形'],
      q: ['With snap to grid on, can you make (a) a right-angled isosceles triangle, (b) an obtuse isosceles triangle, (c) an equilateral triangle?', '开启吸附网格，你能构造 (a) 等腰直角三角形，(b) 钝角等腰三角形，(c) 等边三角形吗？'],
      a: ['(a) A(0, 0), B(4, 0), C(0, 4): angles 90°, 45°, 45°. (b) A(−4, 0), B(4, 0), C(0, 1). (c) Impossible: an equilateral triangle cannot have all three vertices on whole-number grid points, because its height involves √3. Use the Equilateral preset with snap off.', '(a) A(0, 0)，B(4, 0)，C(0, 4)：三个角为 90°、45°、45°。(b) A(−4, 0)，B(4, 0)，C(0, 1)。(c) 不可能：等边三角形的高含有 √3，不能让三个顶点都落在整数格点上。可关闭吸附并使用“等边”预设。']
    },
    roots: {
      t: ['Roots at 1 and 3', '根为 1 和 3'],
      q: ['The parabola is y = ax² − 4x + c. Find a and c so that it crosses the x-axis at x = 1 and x = 3. Then: which family of parabolas has these roots if you may also change b?', '抛物线为 y = ax² − 4x + c。请找出 a 和 c，使它与 x 轴交于 x = 1 和 x = 3。拓展：如果也可以改变 b，哪一族抛物线的根是 1 和 3？'],
      a: ['a = 1 and c = 3, giving y = x² − 4x + 3 = (x − 1)(x − 3). The sum of the roots is −b/a = 4 and the product is c/a = 3. Extension: y = a(x − 1)(x − 3) = ax² − 4ax + 3a, so b = −4a and c = 3a.', 'a = 1，c = 3，得 y = x² − 4x + 3 = (x − 1)(x − 3)。两根之和为 −b/a = 4，两根之积为 c/a = 3。拓展：y = a(x − 1)(x − 3) = ax² − 4ax + 3a，所以 b = −4a，c = 3a。']
    },
    vertex: {
      t: ['Vertex at (−1, 4)', '顶点为 (−1, 4)'],
      q: ['Make a parabola that opens downwards with its vertex at (−1, 4). Write its equation. Where does it cross the axes?', '构造一条开口向下、顶点为 (−1, 4) 的抛物线，写出它的方程，并说出它与坐标轴的交点。'],
      a: ['y = −(x + 1)² + 4 = −x² − 2x + 3, so a = −1, b = −2, c = 3. Roots x = −3 and x = 1, y-intercept 3. In general y = a(x − h)² + k has its vertex at (h, k).', 'y = −(x + 1)² + 4 = −x² − 2x + 3，即 a = −1，b = −2，c = 3。根为 x = −3 和 x = 1，y 轴截距为 3。一般地，y = a(x − h)² + k 的顶点是 (h, k)。']
    },
    parallel: {
      t: ['Parallel and perpendicular lines', '平行线与垂直线'],
      q: ['The amber line is y = 2x + 1. Change the second line so it is parallel to it and passes through (0, −3). Then make one that is perpendicular.', '琥珀色直线是 y = 2x + 1。请调整青色的第二条直线，使它与第一条平行并经过 (0, −3)；再构造一条与之垂直的直线。'],
      a: ['Parallel: y = 2x − 3 (same gradient 2, so the intersections readout says the graphs do not meet). Perpendicular: gradient −1/2, for example y = −0.5x + 1. The product of perpendicular gradients is −1.', '平行：y = 2x − 3（斜率同为 2，所以交点读数显示两图像不相交）。垂直：斜率 −1/2，例如 y = −0.5x + 1。互相垂直的两条直线斜率之积为 −1。']
    },
    trig: {
      t: ['Sine wave: amplitude and period', '正弦曲线：振幅与周期'],
      q: ['Make a sine wave with amplitude 3 and a period of 180°. Then move it up by 1. Which numbers did you change?', '构造振幅为 3、周期为 180° 的正弦曲线，再把它向上平移 1。你改变了哪些数？'],
      a: ['y = 3 sin(2x) + 1: a = 3, b = 2, d = 1. Period = 360° ÷ b. Ask: what does c do? (It shifts the wave sideways by −c/b.) In radians the period is 2π ÷ b.', 'y = 3 sin(2x) + 1：a = 3，b = 2，d = 1。周期 = 360° ÷ b。追问：c 起什么作用？（使曲线水平平移 −c/b。）弧度制下周期为 2π ÷ b。']
    },
    triples: {
      t: ['Hunt for Pythagorean triples', '寻找勾股数'],
      q: ['Find right-angled triangles whose three sides are all whole numbers. How many can you find with both legs up to 16? Why do the two small squares add up to the big one?', '找出三边都是整数的直角三角形。两条直角边不超过 16 时，你能找到多少组？为什么两个小正方形的面积之和等于大正方形？'],
      a: ['3-4-5, 6-8-10, 9-12-15, 12-16-20 (multiples of 3-4-5), 5-12-13, 8-15-17. 7-24-25 is just off the scale. a² + b² = c² means the squares on the legs have the same total area as the square on the hypotenuse.', '3-4-5、6-8-10、9-12-15、12-16-20（3-4-5 的倍数），5-12-13，8-15-17。7-24-25 超出了范围。a² + b² = c² 表示两条直角边上的正方形面积之和等于斜边上正方形的面积。']
    },
    centre: {
      t: ['Circle theorem: predict the angle', '圆定理：预测角度'],
      q: ['The angle at the centre AOB is 100°. Predict the angle APB at the circumference. Then reveal it and drag P around the circle. What stays the same?', '圆心角 AOB 为 100°。请预测圆周角 APB，再揭晓，并绕圆周拖动 P。哪个量保持不变？'],
      a: ['50°: the angle at the centre is twice the angle at the circumference. It stays 50° while P is on the major arc. On the minor arc the angle becomes 130° (opposite angles of a cyclic quadrilateral add to 180°).', '50°：圆心角是圆周角的两倍。P 在优弧上时始终是 50°。P 在劣弧上时变为 130°（圆内接四边形对角互补）。']
    },
    semi: {
      t: ['Angle in a semicircle', '半圆上的圆周角'],
      q: ['AB is a diameter. Drag A and P around the circle. What is always true about angle APB? Can you explain why?', 'AB 是直径。绕圆周拖动 A 和 P。圆周角 APB 总是什么？你能解释原因吗？'],
      a: ['Always 90°. The angle at the centre on a straight line is 180°, and the angle at the circumference is half of it. Use it to construct a right angle with just a circle.', '始终是 90°。直径所对的圆心角是 180°，圆周角是它的一半。可用它仅凭一个圆构造直角。']
    }
  };

  window.GM_TEXT = { words, acts };
})();
