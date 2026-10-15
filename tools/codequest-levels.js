/* Code Quest curriculum: 23 original levels in 5 units, with teacher notes.
   Maps: # rock, . floor, S start, G goal, * gem. Strings are [English, Simplified Chinese]. */
(function (root) {
  'use strict';
  const Core = typeof require === 'function' && typeof module === 'object' ? require('./codequest-core.js') : root.CQCore;
  const { F, L, R, C, call, rep, until, iff } = Core;
  const B1 = ['move'], B2 = ['move', 'left', 'right'], B3 = ['move', 'left', 'right', 'collect'];
  const B4 = [...B3, 'repeat'], B5 = [...B4, 'if'], B6 = [...B5, 'until'], B7 = [...B6, 'def'];

  const units = [
    {
      id: 1,
      name: ['Sequences', '顺序'],
      en: {
        objective: 'Students write a short sequence of precise instructions and predict where the robot will end up.',
        vocab: [['algorithm', 'a list of steps that solves a problem'], ['sequence', 'instructions run one after another, in order'], ['bug', 'a mistake in a program'], ['debug', 'find and fix a bug']],
        warmup: 'Human robot (use the print button): one student is the robot, another reads out one instruction at a time from the cards. The robot may only do exactly what the card says. Swap roles after each route.',
        questions: ['What happens if two instructions swap places?', 'How did you work out where the robot would face after a turn?', 'Why does the robot need very exact instructions?'],
        mistakes: ['Turning too early or too late: the robot turns on the spot, it does not move while turning.', 'Confusing left and right from the robot’s point of view, not the student’s.', 'Forgetting to pick up a gem before moving on.']
      },
      zh: {
        objective: '学生编写一小段精确的指令序列，并预测机器人最终会到哪里。',
        vocab: [['算法', '解决问题的一系列步骤'], ['顺序', '指令按先后依次执行'], ['错误（bug）', '程序里的失误'], ['调试', '找出并改正程序中的错误']],
        warmup: '“人体机器人”（可点击打印按钮）：一名学生扮演机器人，另一名学生照着指令卡每次读出一条指令。机器人只能严格执行卡片上的内容。每走完一条路线就交换角色。',
        questions: ['如果两条指令交换位置会怎样？', '你是怎么判断转弯后机器人朝向哪里的？', '为什么给机器人的指令必须非常精确？'],
        mistakes: ['转得太早或太晚：转弯只是原地转向，并不前进。', '左右方向要以机器人的视角判断，而不是学生自己的视角。', '忘了先捡起宝石就继续前进。']
      }
    },
    {
      id: 2,
      name: ['Loops', '循环'],
      en: {
        objective: 'Students spot repeated patterns and replace long lists of blocks with a repeat block.',
        vocab: [['loop', 'a block that repeats the instructions inside it'], ['repeat', 'run the same steps a set number of times'], ['pattern', 'something that happens again and again'], ['iteration', 'one pass through a loop']],
        warmup: 'Clap and count: the class performs “step, step, step, turn” and then says it again as “do this 3 times: step, turn”. Ask which is quicker to say.',
        questions: ['Which part of your program repeats? How do you know?', 'What changes if you repeat 4 times instead of 5?', 'Can you find a shorter program that does the same job?'],
        mistakes: ['Putting the turn outside the loop when it belongs inside (or the other way round).', 'Using the wrong repeat number, usually off by one.', 'Building the whole path first and only then looking for a pattern. Encourage “spot the pattern first”.']
      },
      zh: {
        objective: '学生能发现重复的规律，并用一个重复积木代替一长串积木。',
        vocab: [['循环', '让内部指令重复执行的积木'], ['重复', '把同样的步骤执行指定次数'], ['规律', '一再出现的相同模式'], ['迭代', '循环中的一轮执行']],
        warmup: '拍手数数：全班先做“走、走、走、转”，再改说成“做 3 遍：走、转”。问一问哪种说法更快。',
        questions: ['你的程序里哪一部分在重复？你是怎么看出来的？', '重复 4 次和 5 次有什么不同？', '你能找到更短、但效果相同的程序吗？'],
        mistakes: ['把转弯放到循环外面（或者该放外面的放进了里面）。', '重复次数写错，常常多一次或少一次。', '先把整条路线都搭出来再找规律。鼓励学生先观察规律。']
      }
    },
    {
      id: 3,
      name: ['Conditions', '条件'],
      en: {
        objective: 'Students use if / else to let the robot make decisions, and repeat-until to run until something becomes true.',
        vocab: [['condition', 'a question that is either true or false'], ['if / else', 'do one thing when a condition is true, otherwise do another'], ['repeat until', 'keep repeating until a condition becomes true'], ['sensor', 'a way for a program to check its surroundings']],
        warmup: 'Traffic-light game: “If the light is green, walk; else stop.” Call out different lights and let students respond. Then add “repeat until the teacher says stop”.',
        questions: ['Which question does the robot ask before each move?', 'Why does the same program work on a different map?', 'What happens if the else part is empty?'],
        mistakes: ['Swapping the “do” and “else” parts.', 'Testing the condition once instead of inside the loop.', 'Expecting the condition to look ahead more than one square.']
      },
      zh: {
        objective: '学生用“如果…否则”让机器人做出判断，并用“重复直到”让程序一直运行到某件事成立。',
        vocab: [['条件', '答案只有“是”或“否”的问题'], ['如果／否则', '条件成立时做一件事，否则做另一件事'], ['重复直到', '一直重复，直到条件成立为止'], ['传感器', '程序检查周围环境的方式']],
        warmup: '红绿灯游戏：“如果是绿灯就走，否则停下。”老师喊出不同的灯色，学生做出反应，再加上“一直重复，直到老师喊停”。',
        questions: ['每次移动之前，机器人在问自己哪个问题？', '为什么同一个程序换一张地图也能用？', '“否则”部分是空的会怎样？'],
        mistakes: ['把“执行”和“否则”两部分放反了。', '只检查一次条件，而没有放进循环里。', '以为条件能看到前方不止一格。']
      }
    },
    {
      id: 4,
      name: ['Nested loops', '嵌套循环'],
      en: {
        objective: 'Students put a loop inside another loop to describe patterns made of patterns.',
        vocab: [['nested loop', 'a loop placed inside another loop'], ['outer loop', 'the loop that holds another loop'], ['inner loop', 'the loop that sits inside'], ['decompose', 'break a big problem into smaller parts']],
        warmup: 'Staircase on the floor: “walk 2 steps and turn” done 3 times. Then ask students to describe “2 steps” as a loop inside the “3 times” loop.',
        questions: ['Which loop runs the most times in total?', 'How many steps does the robot take altogether? How can you check?', 'What would change if the inner loop ran 4 times?'],
        mistakes: ['Putting the turn inside the inner loop, so the robot turns every step.', 'Mixing up the numbers of the outer and inner loops.', 'Trying to write the whole thing at once instead of one side at a time.']
      },
      zh: {
        objective: '学生把一个循环放进另一个循环，描述“规律中的规律”。',
        vocab: [['嵌套循环', '放在另一个循环里面的循环'], ['外层循环', '包含另一个循环的循环'], ['内层循环', '位于里面的循环'], ['分解', '把大问题拆成小问题']],
        warmup: '地板上的楼梯：“走 2 步再转弯”做 3 遍。请学生把“走 2 步”说成放在“3 遍”里面的一个循环。',
        questions: ['哪个循环总共运行的次数最多？', '机器人一共走了多少步？你怎么检验？', '如果内层循环改成 4 次，会有什么变化？'],
        mistakes: ['把转弯放进内层循环，结果机器人每走一步都转弯。', '外层和内层的次数搞混。', '想一次写完全部，而不是一条边一条边地来。']
      }
    },
    {
      id: 5,
      name: ['Routines & debugging', '例程与调试'],
      en: {
        objective: 'Students name a group of blocks as a routine they can reuse, and learn to find and fix bugs in programs that do not work.',
        vocab: [['function (routine)', 'a named group of blocks you can use many times'], ['call', 'run a routine'], ['reuse', 'use the same code again instead of copying it'], ['trace', 'follow a program step by step to see what it does']],
        warmup: 'Dance routine: teach the class a three-move dance and give it a name. Then call out the name several times in a longer dance. Ask: why is a name easier than saying all three moves?',
        questions: ['If you fix one bug inside the routine, how many places get fixed?', 'How did the Step button help you find the problem?', 'Where else could we use a routine in real programs?'],
        mistakes: ['Writing the routine but forgetting to call it.', 'Fixing the symptom in the main program instead of the bug inside the routine.', 'Changing many things at once: change one thing, then test.']
      },
      zh: {
        objective: '学生能把一组积木命名为可反复使用的例程，并学会在不能运行的程序里找出并修复错误。',
        vocab: [['函数（例程）', '一组有名字、可多次使用的积木'], ['调用', '执行一个例程'], ['复用', '重复使用同一段代码，而不是复制粘贴'], ['跟踪', '一步一步跟着程序走，看它到底做了什么']],
        warmup: '舞蹈例程：教全班一套三个动作的舞蹈并给它起名字，然后在更长的舞蹈里多次喊出这个名字。问：为什么说名字比说出三个动作更方便？',
        questions: ['如果修好例程里的一个错误，会有几处同时被修好？', '“单步”按钮怎样帮你找到了问题？', '在真实的程序里，还有哪些地方可以用例程？'],
        mistakes: ['写好了例程却忘了调用它。', '只在主程序里补救，而没有修改例程里真正的错误。', '一次改太多：每次只改一处，然后测试。']
      }
    }
  ];

  const levels = [
    // Unit 1
    {
      id: '1.1', unit: 1, name: ['First steps', '迈出第一步'],
      goal: ['Move the robot to the star ★. Use “move forward” blocks.', '用“前进一步”积木，让机器人走到星星 ★。'],
      hint: ['Count the squares between the robot and the star.', '数一数机器人和星星之间隔着几格。'],
      map: ['..#..#', 'S....G', '#..#..'], blocks: B1, par: 5, solution: { main: [F, F, F, F, F] }
    },
    {
      id: '1.2', unit: 1, name: ['Around the corner', '转过街角'],
      goal: ['Go east, turn left to face north, then walk up to the star.', '先向东走，左转面向北，再一路走到星星。'],
      hint: ['Turning does not move the robot. Move first, then turn, then move again.', '转弯不会前进：先前进，再转弯，然后继续前进。'],
      map: ['####G', '####.', '####.', '####.', 'S....'], blocks: B2, par: 9, solution: { main: [F, F, F, F, L, F, F, F, F] }
    },
    {
      id: '1.3', unit: 1, name: ['Staircase', '锯齿楼梯'],
      goal: ['Climb the staircase to the star. You need left and right turns.', '沿着楼梯走到星星，需要用到左转和右转。'],
      hint: ['Look at the pattern: forward, left, forward, right… Try saying it aloud first.', '观察规律：前进、左转、前进、右转……先念出来试试。'],
      map: ['####G', '###..', '##..#', '#..##', 'S....'], blocks: B2, par: 15,
      solution: { main: [F, L, F, R, F, L, F, R, F, L, F, R, F, L, F] }
    },
    {
      id: '1.4', unit: 1, name: ['Collect the gems', '收集宝石'],
      goal: ['Pick up both gems ◆ on the way to the star. Use “pick up gem” on a gem square.', '在去星星的路上捡起两颗宝石 ◆。站在宝石格上用“捡起宝石”。'],
      hint: ['Stop on each gem, pick it up, then carry on.', '走到每颗宝石上停下，捡起来再继续。'],
      map: ['######', '###*.G', '###.##', 'S.*.##'], blocks: B3, par: 11, solution: { main: [F, F, C, F, L, F, F, C, R, F, F] }
    },
    {
      id: '1.5', unit: 1, name: ['Debug: wrong way', '调试：走错方向'], debug: true,
      goal: ['This program should reach the star, but it has a bug. Run it, find the mistake and fix it.', '这个程序本应到达星星，但有个错误。运行它，找出问题并改正。'],
      hint: ['Which way should the robot turn at the corner?', '在拐角处机器人应该朝哪边转？'],
      map: ['S...#', '###.#', '###.#', '###G#', '#####'], blocks: B2, par: 7,
      preload: { main: [F, F, F, L, F, F, F] }, solution: { main: [F, F, F, R, F, F, F] }
    },
    // Unit 2
    {
      id: '2.1', unit: 2, name: ['Repeat after me', '照着重复'],
      goal: ['Reach the star using one repeat block. How many times must it repeat?', '只用一个重复积木走到星星。要重复几次？'],
      hint: ['Count the squares to the star and put that number in the repeat block.', '数一数到星星有几格，把数字填进重复积木。'],
      map: ['#.#..#.#', 'S......G', '.#..#.#.'], blocks: B4, par: 2, require: ['loop'], solution: { main: [rep(7, F)] }
    },
    {
      id: '2.2', unit: 2, name: ['Loop the stairs', '循环爬楼梯'],
      goal: ['A longer staircase! Find the pattern that repeats and use a repeat block.', '更长的楼梯！找到重复的规律，用重复积木完成。'],
      hint: ['One step of the staircase is: forward, left, forward, right.', '一级楼梯就是：前进、左转、前进、右转。'],
      map: ['#####G', '####..', '###..#', '##..##', '#..###', 'S.####'], blocks: B4, par: 5, require: ['loop'], solution: { main: [rep(5, F, L, F, R)] }
    },
    {
      id: '2.3', unit: 2, name: ['Gem row', '宝石排排站'],
      goal: ['Collect every gem in the row and finish at the star. The same two blocks repeat.', '收集一排所有的宝石，最后走到星星。有两个积木一直在重复。'],
      hint: ['Forward then pick up, again and again. Then one more step.', '前进、捡起，一遍又一遍，最后再走一步。'],
      map: ['#.##.##.', 'S****G..', '.#.##.#.'], blocks: B4, par: 4, require: ['loop'], solution: { main: [rep(4, F, C), F] }
    },
    {
      id: '2.4', unit: 2, name: ['Corner collector', '拐角收集者'],
      goal: ['Walk around the ring, collect the gem in every corner, and stop at the star.', '绕着环形走一圈，收集每个拐角的宝石，最后停在星星上。'],
      hint: ['Each side is the same: walk, pick up, turn left. Repeat it.', '每条边都一样：前进、捡起、左转。重复这个动作。'],
      map: ['*..*', 'G##.', '.##.', 'S..*'], blocks: B4, par: 7, require: ['loop'], solution: { main: [rep(3, F, F, F, C, L), F] }
    },
    {
      id: '2.5', unit: 2, name: ['Debug: one short', '调试：差了一点'], debug: true,
      goal: ['The robot stops before the star and a gem is left behind. Find the bug in the loop.', '机器人在星星前就停下了，还落下一颗宝石。找出循环里的错误。'],
      hint: ['Count the gems. Does the loop repeat enough times?', '数一数宝石。循环重复的次数够吗？'],
      map: ['#.##.##.', 'S*****G.', '.#.##.#.'], blocks: B4, par: 4, require: ['loop'],
      preload: { main: [rep(4, F, C), F] }, solution: { main: [rep(5, F, C), F] }
    },
    // Unit 3
    {
      id: '3.1', unit: 3, name: ['Sense and decide', '感知与判断'],
      goal: ['If there is a path ahead, move forward; otherwise turn right. Repeat it seven times.', '如果前方有路就前进，否则右转。重复这个动作七次。'],
      hint: ['Put an if / else block inside a repeat block. “Do” holds forward, “else” holds turn right.', '把“如果…否则”放进重复积木。“执行”放前进，“否则”放右转。'],
      map: ['S...', '###.', '###.', '###G'], blocks: B5, par: 4, require: ['loop', 'if'],
      solution: { main: [rep(7, iff('PATH', [F], [R]))] }
    },
    {
      id: '3.2', unit: 3, name: ['Follow the road', '沿路前行'],
      goal: ['A long winding road. Use “repeat until goal reached” so you do not need to count.', '一条长长的弯路。用“重复直到到达终点”，就不必数步数了。'],
      hint: ['The same if / else rule works. Just replace the number with a goal check.', '同样的“如果…否则”规则依然有效，只需把次数换成终点判断。'],
      map: ['S......', '######.', '.....#.', '.###.#.', '.###G#.', '.#####.', '.......'], blocks: B6, par: 4, require: ['until'],
      solution: { main: [until('GOAL', iff('PATH', [F], [R]))] }
    },
    {
      id: '3.3', unit: 3, name: ['Gem detector', '宝石探测器'],
      goal: ['Gems are hidden along the road. Use a condition to pick up a gem only when you are standing on one.', '路上藏着宝石。用条件判断：只有脚下有宝石时才捡起。'],
      hint: ['Each time round: move forward, then “if standing on a gem” pick it up.', '每一轮：先前进，再“如果脚下有宝石”就捡起。'],
      map: ['.##.##.#', 'S.*.**.G'], blocks: B6, par: 4, require: ['if'],
      solution: { main: [until('GOAL', F, iff('GEM', [C]))] }
    },
    {
      id: '3.4', unit: 3, name: ['Left or right?', '向左还是向右？'],
      goal: ['This road turns both ways. When blocked, decide: is there a path on the right? Turn right, otherwise turn left.', '这条路左右都会拐弯。被挡住时判断：右边有路吗？有就右转，没有就左转。'],
      hint: ['Put an if / else block inside the “else” part of another if / else.', '把一个“如果…否则”放进另一个“如果…否则”的“否则”里。'],
      map: ['####..G', '####.##', '##...##', '##.####', 'S..####'], blocks: B6, par: 6, require: ['if'],
      solution: { main: [until('GOAL', iff('PATH', [F], [iff('RIGHT', [R], [L])]))] }
    },
    {
      id: '3.5', unit: 3, name: ['Debug: going in circles', '调试：原地打转'], debug: true,
      goal: ['The robot never reaches the star! Use Step to watch what it decides, then fix the program.', '机器人怎么也到不了星星！用“单步”看看它的判断，然后修好程序。'],
      hint: ['At the end of a road the robot turns the wrong way. Which turn do we need on this road?', '到路的尽头时，机器人转错了方向。这条路需要哪种转弯？'],
      map: ['S....', '####.', 'G....'], blocks: B6, par: 4,
      preload: { main: [until('GOAL', iff('PATH', [F], [L]))] }, solution: { main: [until('GOAL', iff('PATH', [F], [R]))] }
    },
    // Unit 4
    {
      id: '4.1', unit: 4, name: ['Big ring', '大圆环'],
      goal: ['Collect the gems at the three corners and stop at the star. Put a loop inside a loop.', '收集三个拐角的宝石，最后停在星星上。试试把循环放进循环里。'],
      hint: ['Each side: forward 4 times, pick up, turn right. Do that side 3 times.', '每条边：前进 4 次、捡起、右转。这样的边做 3 遍。'],
      map: ['S...*', '.###.', 'G###.', '.###.', '*...*'], blocks: B6, par: 7, require: ['nested'],
      solution: { main: [rep(3, rep(4, F), C, R), rep(2, F)] }
    },
    {
      id: '4.2', unit: 4, name: ['Wide stairs', '宽楼梯'],
      goal: ['Each step is two squares wide. Use a loop for the width inside a loop for the stairs.', '每级台阶有两格宽。用内层循环走台阶的宽度，外层循环走楼梯。'],
      hint: ['One stair: forward twice (inner loop), left, forward, right. Repeat the stair 3 times.', '一级台阶：前进两次（内层循环）、左转、前进、右转。重复 3 级。'],
      map: ['######G', '####...', '##...##', 'S..####'], blocks: B6, par: 6, require: ['nested'],
      solution: { main: [rep(3, rep(2, F), L, F, R)] }
    },
    {
      id: '4.3', unit: 4, name: ['Switchback trail', '之字形山路'],
      goal: ['Follow the zigzag trail down to the star. The path has lanes and short connectors.', '沿着之字形山路走到星星。路由长长的横道和短短的连接段组成。'],
      hint: ['A lane is 3 steps long and a connector is 2. After two lanes the pattern starts again.', '横道是 3 步，连接段是 2 步。走完两条横道后，规律重新开始。'],
      map: ['S...', '###.', '....', '.###', '...G'], blocks: B6, par: 13, require: ['nested'],
      solution: { main: [rep(2, rep(3, F), R, rep(2, F), R, rep(3, F), L, rep(2, F), L)] }
    },
    {
      id: '4.4', unit: 4, name: ['Debug: wrong turns', '调试：转错了'], debug: true,
      goal: ['This staircase program turns the wrong way. Run it, watch where it goes wrong, and fix it.', '这个楼梯程序转错了方向。运行它，看它在哪里出错，然后修好。'],
      hint: ['This staircase goes down, so the turns are the other way round.', '这条楼梯是往下走的，转弯方向正好相反。'],
      map: ['S..####', '##...##', '####...', '######G'], blocks: B6, par: 6, require: ['nested'],
      preload: { main: [rep(3, rep(2, F), L, F, R)] }, solution: { main: [rep(3, rep(2, F), R, F, L)] }
    },
    // Unit 5
    {
      id: '5.1', unit: 5, name: ['Detour routine', '绕路例程'],
      goal: ['Rocks block the road. Make a routine that steps around a rock, then use it three times. Build it inside “define my routine”.', '路上有石头。做一个绕过石头的例程，然后使用三次。请把它搭在“定义我的例程”里。'],
      hint: ['Detour: left, forward, right, forward, forward, right, forward, left. Then in the main program: call it, then move forward.', '绕路：左转、前进、右转、前进、前进、右转、前进、左转。在主程序里：先调用例程，再前进。'],
      map: ['..........', 'S#..#..#.G'], blocks: B7, par: 11, require: ['call'],
      solution: { fn: [L, F, R, F, F, R, F, L], main: [rep(3, call, F)] }
    },
    {
      id: '5.2', unit: 5, name: ['Debug: the routine', '调试：例程'], debug: true,
      goal: ['The detour routine goes around the rocks the wrong way. Fix the routine once and every call is fixed.', '绕路例程绕错了方向。只需修好例程一次，所有调用就都改好了。'],
      hint: ['The rocks are on the top row, so the robot must go around the bottom. Swap every left and right inside the routine.', '石头在上面一行，机器人得从下面绕过。把例程里所有的左转和右转互换。'],
      map: ['S#..#..#.G', '..........'], blocks: B7, par: 11, require: ['call'],
      preload: { fn: [L, F, R, F, F, R, F, L], main: [rep(3, call, F)] },
      solution: { fn: [R, F, L, F, F, L, F, R], main: [rep(3, call, F)] }
    },
    {
      id: '5.3', unit: 5, name: ['Gem pockets', '宝石小窝'],
      goal: ['Gems hide in side pockets. Make a routine that visits a pocket and comes back, then use it with a loop.', '宝石藏在路旁的小窝里。做一个“进窝拿宝石再回来”的例程，再配合循环使用。'],
      hint: ['Routine: left, forward, pick up, turn right twice to face back, forward, left. Main: repeat 4 times: forward twice, call.', '例程：左转、前进、捡起、右转两次掉头、前进、左转。主程序：重复 4 次：前进两次，调用例程。'],
      map: ['##*#*#*##', 'S.......G'], blocks: B7, par: 11, require: ['call'],
      solution: { fn: [L, F, C, R, R, F, L], main: [rep(4, F, F, call)] }
    },
    {
      id: '5.4', unit: 5, name: ['Mission complete', '任务完成'],
      goal: ['The final mission: follow the winding road, pick up every gem, and reach the star. Use loops and conditions together.', '最后的任务：沿着弯路前进，捡起所有宝石，到达星星。综合运用循环和条件。'],
      hint: ['Inside the loop: if standing on a gem, pick it up; then if there is a path ahead, move, else turn right.', '在循环里：如果脚下有宝石就捡起；然后如果前方有路就前进，否则右转。'],
      map: ['S..*...', '######.', '..*..#.', '*###.#.', '.###G#*', '.#####.', '...*...'], blocks: B7, par: 6, require: ['until'],
      solution: { main: [until('GOAL', iff('GEM', [C]), iff('PATH', [F], [R]))] }
    }
  ];

  const api = { units, levels };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.CQLevels = api;
})(typeof window !== 'undefined' ? window : globalThis);
