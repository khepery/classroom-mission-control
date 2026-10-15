// Ready-made classroom challenges for the Particle Sandbox: scenes, goals, student tasks and teacher notes.
// Scenes are drawn on the 160 x 160 cell grid (y grows downwards). g.rect fills only empty cells.
export const challenges = [
  {
    id: "lava", minutes: 3, watch: ["Lava", "Water", "Stone"], suggest: ["Water", "Ice", "Lava", "Empty"],
    scene(g) {
      g.floor();
      g.rect(20, 95, 22, 149, "Wall"); g.rect(138, 95, 140, 149, "Wall"); g.rect(79, 105, 81, 149, "Wall");
      g.rect(23, 125, 78, 149, "Lava"); g.rect(82, 115, 137, 149, "Water");
    },
    en: {
      title: "Water meets lava", predict: "What will happen when the water touches the lava? Write your hypothesis first, then run it.",
      task: "Use the Eraser to remove the divider wall and watch where the water and lava meet. Sketch what you see. Then try Ice instead of Water.",
      goal: "Observe and explain. Count how many Stone cells appear.",
      question: "What new material appeared? What evidence tells us a change happened and not just a mixture?",
      vocab: ["reaction", "cooling", "solid / liquid", "evidence"],
      expect: "In this toy, water cools lava into Stone and some water disappears. Real lava also cools into solid rock, but the exact rules here are simplified.",
    },
    zh: {
      title: "水遇到熔岩", predict: "水碰到熔岩时会发生什么？先写下你的假设，再运行验证。",
      task: "用橡皮擦移除中间的隔板，观察水和熔岩接触的地方，画下你看到的现象。然后再用冰代替水试一次。",
      goal: "观察并解释。数一数出现了多少石头格子。",
      question: "出现了什么新材料？有什么证据说明发生了变化，而不只是混合？",
      vocab: ["反应", "冷却", "固体 / 液体", "证据"],
      expect: "在这个玩具里，水会把熔岩冷却成石头，部分水也会消失。现实中的熔岩也会冷却成岩石，但这里的规则是简化的。",
    },
  },
  {
    id: "dam", minutes: 4, watch: ["Water"], suggest: ["Stone", "Wall", "Sand", "Wood"],
    zone: { x0: 112, y0: 100, x1: 159, y1: 149, species: "Water", kind: "zero", label: ["Water in the village", "村庄里的水"] },
    scene(g) {
      g.floor();
      g.rect(0, 100, 30, 149, "Stone"); g.rect(0, 80, 2, 99, "Wall");
      g.rect(9, 96, 15, 99, "Water"); g.rect(12, 95, 12, 95, "Cloner");
      g.rect(120, 130, 134, 149, "Wood"); g.rect(139, 138, 150, 149, "Wood");
    },
    en: {
      title: "Build a dam", predict: "Which way will the water flow, and how far will it spread? Draw your guess, then run.",
      task: "A tap keeps pouring water from the cliff. Build a dam or a channel to keep the village (dashed box) dry until the timer ends.",
      goal: "Keep the village dry: 0 water cells in the dashed box.",
      question: "Why does a dam need to be strong at the bottom? What happens when the water level rises above your wall?",
      vocab: ["gravity", "flow", "barrier", "pressure"],
      expect: "Water runs downhill and spreads out flat. A wall taller than the water level and sealed to the ground works. A channel that leads water to a pond is also a good answer.",
    },
    zh: {
      title: "建一座水坝", predict: "水会往哪里流？会扩散多远？先画出你的猜测，再运行。",
      task: "悬崖上的水龙头一直在放水。请建一座水坝或一条水渠，让村庄（虚线框）在计时结束前保持干燥。",
      goal: "保持村庄干燥：虚线框内水格子为 0。",
      question: "为什么水坝底部要很结实？当水位超过你的墙时会怎样？",
      vocab: ["重力", "流动", "屏障", "压力"],
      expect: "水往低处流并摊平。比水位更高、并与地面封严的墙可以挡水。把水引到池塘的水渠也是很好的答案。",
    },
  },
  {
    id: "house", minutes: 4, watch: ["Wood", "Fire"], suggest: ["Stone", "Wall", "Water", "Sand"],
    zone: { x0: 58, y0: 106, x1: 104, y1: 149, species: "Wood", kind: "keep", min: 90, label: ["Wood in the house", "房子里的木头"] },
    scene(g) {
      g.floor();
      g.rect(60, 108, 102, 111, "Wood"); g.rect(60, 112, 63, 149, "Wood"); g.rect(99, 112, 102, 149, "Wood");
      g.rect(30, 132, 52, 149, "Wood"); g.rect(34, 126, 48, 131, "Fire");
    },
    en: {
      title: "Make a fire-proof house", predict: "Will the fire spread from the woodpile to the house? What could stop it? Predict first.",
      task: "While paused, add protection around the wooden house using any materials, then press Run. Try to keep at least 90% of the house wood.",
      goal: "Keep at least 90% of the wood in the house (dashed box).",
      question: "What does a fire need to keep burning? Which of your materials took one of those away?",
      vocab: ["combustion", "fuel", "flammable", "barrier"],
      expect: "Fire spreads through wood and is put out by Water. Stone and Wall do not burn. A gap or a non-flammable barrier between the fuel and the house works well.",
    },
    zh: {
      title: "建一座防火房子", predict: "火会从木堆蔓延到房子吗？什么可以阻止它？先预测。",
      task: "暂停状态下，用任意材料在木屋周围加防护，然后按“运行”。尽量保住房子至少 90% 的木头。",
      goal: "保住房子（虚线框）里至少 90% 的木头。",
      question: "火要持续燃烧需要什么？你用的哪种材料去掉了其中一项？",
      vocab: ["燃烧", "燃料", "易燃", "屏障"],
      expect: "火会沿着木头蔓延，被水扑灭。石头和墙不会燃烧。在燃料和房子之间留出空隙或建不可燃的屏障效果很好。",
    },
  },
  {
    id: "garden", minutes: 5, watch: ["Plant", "Seed", "Water"], suggest: ["Seed", "Water", "Sand", "Plant"],
    zone: { x0: 23, y0: 50, x1: 137, y1: 149, species: "Plant", kind: "min", min: 200, label: ["Plant cells in the garden", "花园里的植物格子"] },
    scene(g) {
      g.floor();
      g.rect(20, 85, 22, 149, "Wall"); g.rect(138, 85, 140, 149, "Wall");
      g.rect(23, 132, 137, 149, "Sand");
      for (const x of [35, 60, 85, 110]) g.rect(x, 128, x, 128, "Seed");
    },
    en: {
      title: "Grow a garden", predict: "What do seeds need to grow here? Test one idea at a time and record it.",
      task: "Make the garden grow at least 200 plant cells. Add seeds, water and soil in different amounts and compare the results.",
      goal: "Reach 200 plant cells in the garden (dashed box).",
      question: "Which conditions helped the plants grow? What was missing where nothing grew?",
      vocab: ["seed", "growth", "variable", "fair test"],
      expect: "Seeds on sand grow into flowers; plants also use up nearby water as they spread. More seeds and a little water give more growth. A fair test changes only one thing at a time.",
    },
    zh: {
      title: "种一座花园", predict: "种子在这里需要什么才能生长？每次只测试一个想法并记录。",
      task: "让花园长出至少 200 个植物格子。尝试不同数量的种子、水和土壤，并比较结果。",
      goal: "花园（虚线框）里的植物达到 200 格。",
      question: "哪些条件帮助了植物生长？没有长出东西的地方缺少什么？",
      vocab: ["种子", "生长", "变量", "公平测试"],
      expect: "沙上的种子会长成花；植物扩展时也会消耗附近的水。更多的种子和少量的水能带来更多生长。公平测试每次只改变一个条件。",
    },
  },
  {
    id: "reach", minutes: 5, watch: ["Plant", "Water", "Wood"], suggest: ["Water", "Wood", "Plant", "Seed"],
    zone: { x0: 53, y0: 30, x1: 107, y1: 100, species: "Plant", kind: "min", min: 1, label: ["Plants above the line", "线以上的植物"] },
    scene(g) {
      g.floor();
      g.rect(50, 30, 52, 149, "Wall"); g.rect(108, 30, 110, 149, "Wall");
      g.rect(53, 140, 107, 149, "Sand"); g.rect(78, 70, 82, 139, "Wood");
      for (const x of [66, 94]) g.rect(x, 138, x, 139, "Plant");
    },
    en: {
      title: "Make plants reach the top", predict: "Plants need water. How could you help them climb higher than the water level?",
      task: "Add water and anything else you think helps so a plant grows above the dashed line. Try the wooden post, and add more posts.",
      goal: "Get at least one plant cell above the dashed line.",
      question: "Which designs worked? What does a real climbing plant use for support?",
      vocab: ["growth", "support", "design", "test and improve"],
      expect: "Here plants spread through water and climb along Wood. Water alone only fills the bottom, so students should discover that a wooden post or trellis lets the plant climb.",
    },
    zh: {
      title: "让植物长到顶部", predict: "植物需要水。怎样才能帮助它们长得比水位更高？",
      task: "加入水和你认为有帮助的东西，让植物长到虚线之上。试试木桩，也可以多加几根。",
      goal: "让至少一个植物格子超过虚线。",
      question: "哪些设计成功了？真实的攀援植物靠什么支撑？",
      vocab: ["生长", "支撑", "设计", "测试并改进"],
      expect: "在这里植物会通过水扩展，并沿着木头向上爬。只有水只能填满底部，学生应发现木桩或支架能帮助植物向上爬。",
    },
  },
  {
    id: "blast", minutes: 4, watch: ["Dust", "Fire", "Wood"], suggest: ["Wall", "Stone", "Water", "Sand"],
    zone: { x0: 0, y0: 0, x1: 159, y1: 98, species: "Fire", kind: "peak0", label: ["Flames above the chamber", "腔室上方的火焰"] },
    scene(g) {
      g.floor();
      g.rect(30, 100, 32, 149, "Stone"); g.rect(70, 100, 72, 119, "Stone"); g.rect(70, 128, 72, 149, "Stone");
      g.rect(33, 108, 69, 149, "Dust");
      g.rect(78, 125, 90, 149, "Wood"); g.rect(98, 132, 112, 149, "Wood");
      g.rect(45, 104, 46, 106, "Fire");
    },
    en: {
      title: "Contain the explosion", predict: "Dust burns fast. Where will the flames go? Draw the path you expect.",
      task: "While paused, redesign the chamber so no flame ever reaches the dashed area above it. Then press Run to test it.",
      goal: "Peak flames above the chamber (dashed area) must stay at 0.",
      question: "Why does fine dust burn so quickly? How did your design stop the flames?",
      vocab: ["combustion", "surface area", "containment", "safety"],
      expect: "Fire races through dust and the flames shoot out of the open top. Adding a lid, or smothering the dust with water or sand, contains it.",
    },
    zh: {
      title: "控制爆燃", predict: "粉尘燃烧很快。火焰会往哪里去？画出你预期的路线。",
      task: "暂停状态下重新设计腔室，使火焰绝不会烧到上方的虚线区域。然后按“运行”测试。",
      goal: "腔室上方（虚线区域）的火焰峰值必须保持为 0。",
      question: "为什么细粉尘燃烧得这么快？你的设计是怎样挡住火焰的？",
      vocab: ["燃烧", "表面积", "控制", "安全"],
      expect: "火在粉尘里蔓延很快，火焰会从敞开的顶部喷出。加盖，或用水、沙压住粉尘，都能把火控制住。",
    },
  },
  {
    id: "half", minutes: 3, watch: ["Water"], suggest: ["Water", "Empty"],
    zone: { x0: 53, y0: 60, x1: 107, y1: 149, species: "Water", kind: "range", min: 47, max: 53, label: ["Container filled with water", "容器的水位"] },
    scene(g) {
      g.floor();
      g.rect(50, 60, 52, 149, "Wall"); g.rect(108, 60, 110, 149, "Wall");
    },
    en: {
      title: "Fill exactly half the container", predict: "How will you know it is half full? Plan a method before you pour.",
      task: "Use water and the live percentage to fill the container as close to 50% as you can. Pause to measure, and use the Eraser to adjust.",
      goal: "Reach between 47% and 53%.",
      question: "How can the same amount of water look different in different containers? How can we measure fairly?",
      vocab: ["volume", "estimate", "percentage", "measure"],
      expect: "Students usually fill to the middle of the height. Because the container has straight sides, half the height is half the volume. Using the live counter makes the estimate precise.",
    },
    zh: {
      title: "把容器正好装满一半", predict: "你怎么知道正好是一半？倒水之前先想好办法。",
      task: "利用水和实时百分比，把容器装到尽量接近 50%。暂停来测量，并用橡皮擦微调。",
      goal: "达到 47% 到 53% 之间。",
      question: "同样多的水在不同容器里为什么看起来不同？怎样公平地测量？",
      vocab: ["体积", "估计", "百分比", "测量"],
      expect: "学生通常会装到高度的一半。因为容器是直壁的，高度的一半就是体积的一半。使用实时计数可以让估计变得精确。",
    },
  },
  {
    id: "density", minutes: 5, watch: ["Sand", "Water", "Oil"], suggest: ["Sand", "Water", "Oil", "Gas"],
    scene(g) {
      g.floor();
      g.rect(68, 40, 70, 149, "Wall"); g.rect(90, 40, 92, 149, "Wall");
    },
    en: {
      title: "Density tower", predict: "Pour Sand, Water and Oil into the tube. In what order will they stack, top to bottom? Predict first.",
      task: "Test every pouring order. Record the final stacking order and try adding Gas. Find a rule that explains your results.",
      goal: "Observe and explain the layers you see.",
      question: "Why do some materials sink and others float? What real-life examples show the same thing?",
      vocab: ["density", "sink", "float", "layers"],
      expect: "In this toy, Sand sinks below Water, and Oil floats on Water. Gas rises. Denser materials sink below lighter ones, whatever the pouring order.",
    },
    zh: {
      title: "密度塔", predict: "把沙、水和油倒进管子里。它们从上到下会怎样排列？先预测。",
      task: "测试每一种倒入顺序。记录最终的层次顺序，再试着加入气体。找出能解释结果的规律。",
      goal: "观察并解释你看到的分层。",
      question: "为什么有的材料会下沉、有的会漂浮？现实生活中有哪些类似的例子？",
      vocab: ["密度", "下沉", "漂浮", "分层"],
      expect: "在这个玩具里，沙会沉到水下，油会浮在水面，气体会上升。无论倒入顺序如何，密度大的材料都会沉到较轻材料的下面。",
    },
  },
  {
    id: "states", minutes: 4, watch: ["Ice", "Water", "Fire"], suggest: ["Ice", "Water", "Fire", "Lava"],
    zone: { x0: 33, y0: 90, x1: 107, y1: 149, species: "Water", kind: "zero", label: ["Liquid water left", "剩余的液态水"] },
    scene(g) {
      g.floor();
      g.rect(30, 100, 32, 149, "Wall"); g.rect(108, 100, 110, 149, "Wall");
      g.rect(33, 127, 70, 149, "Ice"); g.rect(71, 135, 107, 149, "Water");
    },
    en: {
      title: "Freeze or melt?", predict: "Ice sits next to water. Which one will win? Predict before pressing Run.",
      task: "Run and watch. Then turn all the water into ice. Next, melt the ice back into water using another material. Record each change of state.",
      goal: "Freeze it all: 0 liquid water cells in the dashed box.",
      question: "What causes a change of state in real life? Is the Ice here behaving like real ice?",
      vocab: ["solid", "liquid", "freezing", "melting"],
      expect: "In this toy, Ice slowly spreads into Water and Fire melts Ice back to Water. In real life, whether ice melts or freezes depends on temperature.",
    },
    zh: {
      title: "冻结还是融化？", predict: "冰紧挨着水。谁会赢？按“运行”前先预测。",
      task: "运行并观察。然后让所有的水变成冰。接着用别的材料把冰融回水。记录每一次状态变化。",
      goal: "全部冻结：虚线框内液态水为 0。",
      question: "现实中是什么导致状态变化？这里的冰和真正的冰表现一样吗？",
      vocab: ["固态", "液态", "凝固", "熔化"],
      expect: "在这个玩具里，冰会慢慢向水中扩展，火会把冰融回水。现实中冰是融化还是冻结取决于温度。",
    },
  },
  {
    id: "conserve", minutes: 4, watch: ["Sand", "Wood", "Fire"], suggest: ["Sand", "Wood", "Fire", "Water"],
    zone: { x0: 0, y0: 0, x1: 159, y1: 159, species: "Sand", kind: "keep", min: 100, label: ["Sand on the canvas", "画布上的沙"] },
    scene(g) {
      g.floor();
      g.rect(30, 80, 75, 82, "Wall"); g.rect(85, 80, 130, 82, "Wall");
      g.rect(35, 40, 125, 79, "Sand");
      g.rect(62, 118, 64, 149, "Wall"); g.rect(96, 118, 98, 149, "Wall");
    },
    en: {
      title: "Is anything lost?", predict: "Sand pours through the gap into the container. Will there be more, less or the same amount of sand at the end?",
      task: "Run the sand and compare the count before and after. Then try the same with Wood and Fire. Does the count change?",
      goal: "Keep 100% of the sand while it moves.",
      question: "When matter moves or changes form, is any of it created or destroyed? Does this toy always follow that rule?",
      vocab: ["conservation of mass", "matter", "closed system", "model"],
      expect: "Moving sand keeps its count the same. Burning wood in the toy simply removes cells, which real matter does not do (it turns into ash and gases). A good prompt for the limits of a model.",
    },
    zh: {
      title: "有东西消失了吗？", predict: "沙子从缺口流进容器里。结束时沙子会变多、变少还是不变？",
      task: "运行并比较前后的数量。然后用木头和火做同样的实验，数量会变吗？",
      goal: "沙子移动时保持 100%。",
      question: "物质在移动或改变形态时，会被创造或消灭吗？这个玩具总是遵守这条规则吗？",
      vocab: ["质量守恒", "物质", "封闭系统", "模型"],
      expect: "移动的沙子数量保持不变。在这个玩具里木头燃烧只是格子消失，而真实的物质不会这样（它会变成灰和气体）。这是讨论模型局限性的好机会。",
    },
  },
];
