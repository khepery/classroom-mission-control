/* Original puzzles and bounded block interpreter; no generated JavaScript is executed. */
(() => {
  'use strict';
  let zh = new URLSearchParams(location.search).get('lang') === 'zh';
  const t = (en, cn) => zh ? cn : en;
  const $ = id => document.getElementById(id);
  const englishMessages = {...Blockly.Msg};
  let chineseMessages;
  const initialize = () => {
  document.documentElement.lang = zh ? 'zh-Hans' : 'en';
  const makeLevels = () => [
    {name:t('1 · First steps','1 · 初次出发'),mission:t('Reach the star: move forward three times.','前进三次，到达星星。'),start:[1,3],goal:[4,3],path:[[1,3],[2,3],[3,3],[4,3]]},
    {name:t('2 · Around the corner','2 · 转过街角'),mission:t('Go three steps east, turn left, then three steps north.','向东前进三步，左转，再向北前进三步。'),start:[0,4],goal:[3,1],path:[[0,4],[1,4],[2,4],[3,4],[3,3],[3,2],[3,1]]},
    {name:t('3 · Loop explorer','3 · 循环探索者'),mission:t('Reach the star using a repeat block. How many moves?','使用重复积木到达星星。需要几步？'),start:[0,2],goal:[5,2],path:[[0,2],[1,2],[2,2],[3,2],[4,2],[5,2]],require:['repeat']},
    {name:t('4 · Sense and decide','4 · 感知与决策'),mission:t('Use a loop and a condition. If there is a path ahead, move; otherwise turn right. Seven repetitions will do.','使用循环和条件：前方有路就前进，否则右转。重复七次即可。'),start:[0,0],goal:[3,3],path:[[0,0],[1,0],[2,0],[3,0],[3,1],[3,2],[3,3]],require:['repeat','if']}
  ];
  let levels = makeLevels();
  const blockDefs = () => [
    {type:'quest_start',message0:t('when Run is pressed','点击运行时'),nextStatement:null,colour:45,deletable:false,tooltip:t('Attach your program below.','在下方连接程序。')},
    {type:'quest_move',message0:t('move forward','前进一步'),previousStatement:null,nextStatement:null,colour:175},
    {type:'quest_left',message0:t('turn left ↶','左转 ↶'),previousStatement:null,nextStatement:null,colour:175},
    {type:'quest_right',message0:t('turn right ↷','右转 ↷'),previousStatement:null,nextStatement:null,colour:175},
    {type:'quest_repeat',message0:t('repeat %1 times','重复 %1 次'),args0:[{type:'field_number',name:'TIMES',value:3,min:1,max:10,precision:1}],message1:t('do %1','执行 %1'),args1:[{type:'input_statement',name:'DO'}],previousStatement:null,nextStatement:null,colour:260},
    {type:'quest_if',message0:t('if path ahead','如果前方有路'),message1:t('do %1','执行 %1'),args1:[{type:'input_statement',name:'DO'}],message2:t('else %1','否则 %1'),args2:[{type:'input_statement',name:'ELSE'}],previousStatement:null,nextStatement:null,colour:210}
  ];
  blockDefs().forEach(definition => {
    Blockly.Blocks[definition.type] = {init(){this.jsonInit(blockDefs().find(item => item.type === definition.type));}};
  });
  const toolbox = () => ({kind:'flyoutToolbox',contents:blockDefs().slice(1).map(b=>({kind:'block',type:b.type}))});
  const workspace = Blockly.inject('workspace',{
    media:'../lib/blockly/media/',toolbox:toolbox(),
    trashcan:true,scrollbars:true,sounds:false,zoom:{controls:true,wheel:true,startScale:.9,minScale:.4,maxScale:1.5}
  });
  let levelIndex=0, robot, running=false, generation=0, timer=null;
  let completed = new Set();
  const vectors=[[1,0],[0,1],[-1,0],[0,-1]];
  const directions=()=>[t('east →','东 →'),t('south ↓','南 ↓'),t('west ←','西 ←'),t('north ↑','北 ↑')];
  function currentLevel(){return levels[levelIndex];}
  function hasPath(x,y){return currentLevel().path.some(p=>p[0]===x&&p[1]===y);}
  function ahead(){const v=vectors[robot.dir];return hasPath(robot.x+v[0],robot.y+v[1]);}
  function atGoal(){return robot.x===currentLevel().goal[0]&&robot.y===currentLevel().goal[1];}
  function draw() {
    $('board').replaceChildren();
    for(let y=0;y<6;y++)for(let x=0;x<6;x++){
      const cell=document.createElement('div');
      const isGoal=x===currentLevel().goal[0]&&y===currentLevel().goal[1];
      const isRobot=x===robot.x&&y===robot.y;
      cell.className='cell'+(!hasPath(x,y)?' wall':'')+(isGoal?' goal':'')+(isRobot?' robot':'');
      if(isGoal){const star=document.createElement('span');star.textContent='★';star.className='goal-mark';cell.append(star);}
      if(isRobot)cell.append(document.createTextNode(['→','↓','←','↑'][robot.dir]));
      $('board').append(cell);
    }
    $('position').textContent=t('Robot','机器人')+` (${robot.x+1}, ${robot.y+1}) · ${directions()[robot.dir]} · `+t('Steps: ','步数：')+robot.steps;
    $('board').setAttribute('aria-label',t('6 by 6 board. Star at ','6×6 棋盘，星星位于 ')+`(${currentLevel().goal[0]+1}, ${currentLevel().goal[1]+1}). `+$('position').textContent);
  }
  function setRunning(value) {
    running=value;
    ['run','level','restart','add-move','add-left','add-right','add-repeat','add-if','remove-last','target','repeat-count'].forEach(id=>$(id).disabled=value);
    $('next').disabled=value||!completed.has(levelIndex)||levelIndex===levels.length-1;
  }
  function stop(){generation++;if(timer!==null)clearTimeout(timer);timer=null;setRunning(false);}
  function resetRobot() {
    stop();
    robot={x:currentLevel().start[0],y:currentLevel().start[1],dir:0,steps:0};
    draw();
    $('feedback').textContent=t('Ready. Connect blocks under the start block, then Run.','准备就绪。在开始积木下连接程序，然后运行。');
  }
  function initializeProgram() {
    workspace.clear();
    const start=workspace.newBlock('quest_start');start.initSvg();start.render();start.moveBy(35,30);start.setDeletable(false);
    updateBuilder();
  }
  function loadLevel(index) {
    levelIndex=index;$('level').value=String(index);
    $('challenge-title').textContent=currentLevel().name;$('mission').textContent=currentLevel().mission;
    resetRobot();initializeProgram();
  }
  function compile() {
    const tops=workspace.getTopBlocks(false);
    const start=tops.find(b=>b.type==='quest_start');
    if(!start||tops.length!==1)throw new Error(t('Connect every block under the start block. Remove unused loose blocks.','请将所有积木连接到开始积木下，或删除未使用的积木。'));
    let count=1;const concepts=new Set();
    function chain(block,depth){
      if(depth>20)throw new Error(t('Too many nested blocks (maximum 20).','嵌套太深（最多 20 层）。'));
      const nodes=[];
      while(block){
        if(++count>100)throw new Error(t('Program is too large (maximum 100 blocks).','程序过大（最多 100 个积木）。'));
        const type=block.type.replace('quest_','');concepts.add(type);
        if(['move','left','right'].includes(type))nodes.push({type});
        else if(type==='repeat'){
          const times=Number(block.getFieldValue('TIMES'));
          if(!Number.isInteger(times)||times<1||times>10)throw new Error(t('Repeat must be from 1 to 10.','重复次数须为 1–10。'));
          nodes.push({type,times,body:chain(block.getInputTargetBlock('DO'),depth+1)});
        } else if(type==='if')nodes.push({type,body:chain(block.getInputTargetBlock('DO'),depth+1),otherwise:chain(block.getInputTargetBlock('ELSE'),depth+1)});
        else throw new Error(t('Unsupported block.','不支持的积木。'));
        block=block.getNextBlock();
      }
      return nodes;
    }
    const nodes=chain(start.getNextBlock(),0);
    if(!nodes.length)throw new Error(t('Add at least one movement block.','请添加至少一个移动积木。'));
    return {nodes,concepts};
  }
  function* execute(nodes) {
    for(const node of nodes){
      yield {type:'check'};
      if(node.type==='repeat'){
        for(let i=0;i<node.times;i++){yield {type:'check'};yield* execute(node.body);}
      }else if(node.type==='if')yield* execute(ahead()?node.body:node.otherwise);
      else yield node;
    }
  }
  function run() {
    resetRobot();
    let program;
    try{program=compile();}catch(error){$('feedback').textContent=error.message;return;}
    const iterator=execute(program.nodes);const token=generation;let budget=0;
    setRunning(true);
    $('feedback').textContent=t('Running… Reset robot stops the program.','运行中…点击重置机器人可停止。');
    function finish(message,success=false){
      if(success)completed.add(levelIndex);
      setRunning(false);timer=null;$('feedback').textContent=message;
    }
    function tick() {
      if(token!==generation)return;
      let result;
      do{
        if(++budget>200){finish(t('Safety limit: stopped after 200 interpreter steps. Use a shorter program.','安全限制：解释器执行 200 步后停止。请简化程序。'));return;}
        result=iterator.next();
      }while(!result.done&&result.value.type==='check');
      if(result.done){finish(t('Program ended before the star. Add or correct your moves.','程序结束，但未到达星星。请添加或调整移动积木。'));return;}
      const action=result.value.type;
      if(action==='move'){
        if(!ahead()){finish(t('Blocked! There is a wall ahead. Try turning before moving.','受阻！前方是墙，请先转向。'));return;}
        const v=vectors[robot.dir];robot.x+=v[0];robot.y+=v[1];
      }else robot.dir=(robot.dir+(action==='left'?3:1))%4;
      robot.steps++;draw();
      if(atGoal()){
        const missing=(currentLevel().require||[]).filter(type=>!program.concepts.has(type));
        if(missing.length){finish(t('You reached the star! Now solve this challenge using ','到达星星了！请按本关要求使用 ')+missing.map(x=>x==='repeat'?t('a repeat block','重复积木'):t('a condition block','条件积木')).join(t(' and ','和')));return;}
        finish(levelIndex===levels.length-1?t('Quest complete! You used sequences, loops, and conditions.','任务完成！你掌握了顺序、循环和条件。'):t('Success! Try the next challenge or improve your program.','成功！可挑战下一关或优化程序。'),true);return;
      }
      timer=setTimeout(tick,180);
    }
    timer=setTimeout(tick,180);
  }
  function startBlock(){return workspace.getAllBlocks(false).find(b=>b.type==='quest_start');}
  function locationBlock(){
    if(!$('target').value)return null;
    const [id,input]=JSON.parse($('target').value);
    const parent=workspace.getBlockById(id);
    if(!parent)return null;
    return {parent,input:input||null};
  }
  function tail(location){
    let block=location.input?location.parent.getInputTargetBlock(location.input):location.parent.getNextBlock();
    if(!block)return null;
    while(block.getNextBlock())block=block.getNextBlock();
    return block;
  }
  function add(type) {
    if(running)return;
    const location=locationBlock();if(!location)return;
    if(workspace.getAllBlocks(false).length>=100){$('feedback').textContent=t('Maximum 100 blocks.','最多 100 个积木。');return;}
    const block=workspace.newBlock('quest_'+type);
    if(type==='repeat')block.setFieldValue(String(Math.min(10,Math.max(1,Math.round(Number($('repeat-count').value)||1)))),'TIMES');
    block.initSvg();block.render();
    const last=tail(location);
    const connection=last?last.nextConnection:location.input?location.parent.getInput(location.input).connection:location.parent.nextConnection;
    connection.connect(block.previousConnection);updateBuilder();
  }
  function updateBuilder() {
    const previous=$('target').value;$('target').replaceChildren();
    const start=startBlock();if(!start)return;
    const options=[{value:JSON.stringify([start.id,null]),label:t('Main program','主程序')}];
    const lines=[];
    function outline(block,depth) {
      if(depth>20)return;
      while(block) {
        const type=block.type.replace('quest_','');
        const name=type==='move'?t('Forward','前进'):type==='left'?t('Turn left','左转'):type==='right'?t('Turn right','右转'):type==='repeat'?t('Repeat ','重复 ')+block.getFieldValue('TIMES'):t('If path ahead','如果前方有路');
        lines.push('  '.repeat(depth)+name);
        if(type==='repeat'||type==='if'){
          const label=`${name} #${options.length}`;
          options.push({value:JSON.stringify([block.id,'DO']),label:label+' · '+t('do','执行')});
          outline(block.getInputTargetBlock('DO'),depth+1);
          if(type==='if'){options.push({value:JSON.stringify([block.id,'ELSE']),label:label+' · '+t('else','否则')});lines.push('  '.repeat(depth)+t('Else','否则'));outline(block.getInputTargetBlock('ELSE'),depth+1);}
        }
        block=block.getNextBlock();
      }
    }
    outline(start.getNextBlock(),0);
    options.forEach(item=>{const option=document.createElement('option');option.value=item.value;option.textContent=item.label;$('target').append(option);});
    if(options.some(item=>item.value===previous))$('target').value=previous;
    $('program-list').textContent=lines.join('\n')||t('(Empty program)','（空程序）');
  }
  function localize() {
  document.documentElement.lang = zh ? 'zh-Hans' : 'en';
  $('title').textContent=t('Code Quest','编程任务');
  document.title=$('title').textContent;
  $('intro').textContent=t('Program a robot using sequencing, loops, and conditions. Original classroom puzzles with official Blockly.','使用顺序、循环和条件指挥机器人。原创课堂谜题，采用官方 Blockly 积木库。');
  $('level-label').textContent=t('Challenge','挑战');
  levels=makeLevels();
  $('level').replaceChildren();
  levels.forEach((level,index)=>{const option=document.createElement('option');option.value=index;option.textContent=level.name;$('level').append(option);});
  $('level').value=String(levelIndex);
  $('challenge-title').textContent=currentLevel().name;
  $('mission').textContent=currentLevel().mission;
  const labels={run:['Run','运行'],reset:['Reset robot','重置机器人'],restart:['Clear program','清空程序'],next:['Next challenge','下一关'],'builder-title':['Keyboard-friendly program builder','键盘友好程序构建器'],'target-label':['Insert into','插入位置'],'repeat-label':['Times','次数'],'add-move':['Forward','前进'],'add-left':['Turn left','左转'],'add-right':['Turn right','右转'],'add-repeat':['Repeat','重复'],'add-if':['If path ahead / else','前方有路 / 否则'],'remove-last':['Remove last in location','删除当前位置最后一块'],'help-title':['How to play','玩法说明']};
  Object.entries(labels).forEach(([id,text])=>$(id).textContent=t(...text));
  $('builder-help').textContent=t('Choose Main program or a repeat/condition body, then add blocks. To reorder, remove the last block in that location and add it again. Drag-and-drop and these controls edit the same program.','选择主程序或循环/条件内部，然后添加积木。调整顺序时，可删除该位置的最后一块再添加。拖动积木和这些按钮编辑同一个程序。');
  $('limits').textContent=t('Safety: 100 blocks, nesting ≤20, repeats 1–10, 200 interpreter steps.','安全限制：100 个积木，嵌套 ≤20 层，重复 1–10 次，解释器最多 200 步。');
  $('help').textContent=t('The arrow is your robot; ★ is the goal. Dark squares are walls. Forward moves one square in the direction the arrow faces. Turning rotates without moving. Repeat runs its body the specified number of times. If checks the square ahead each time, then runs either its “do” or “else” body. Connect blocks below “when Run is pressed”, or use the keyboard-friendly builder (Tab, Enter, arrow keys in selectors). Programs are interpreted, never evaluated as JavaScript. Reset stops a run but keeps blocks; changing challenges or clearing resets the program. Progress lasts only while this page is open.','箭头是机器人，★ 是终点，深色方格是墙。前进沿箭头方向移动一格，转向只旋转不移动。重复执行内部积木指定次数；条件每次检查前方，并执行“执行”或“否则”部分。将积木连接到“点击运行时”下，或使用键盘构建器（Tab、Enter、选择框中方向键）。程序由安全解释器执行，不运行生成的 JavaScript。重置会停止运行并保留积木；换关或清空将重置程序。进度只保留到关闭页面。');
  $('credit').firstChild.textContent=t('Original puzzles, not Blockly Games. Blockly © Google LLC and contributors, Apache 2.0. ','原创谜题，非 Blockly Games。Blockly © Google LLC 及贡献者，Apache 2.0 许可。');
  $('credit').querySelector('a').textContent=t('Library license','积木库许可');
  $('credit').lastChild.textContent=t('. Local only: no account, network, or student-data storage.','。仅本地运行：无需账户、网络，不保存学生数据。');
  $('language').textContent=zh?'English':'中文';
  }
  function localizeBlocks() {
    const labels = {
      quest_start:[t('when Run is pressed','点击运行时')],
      quest_move:[t('move forward','前进一步')],
      quest_left:[t('turn left ↶','左转 ↶')],
      quest_right:[t('turn right ↷','右转 ↷')],
      quest_repeat:[t('repeat','重复'),t('times','次'),t('do','执行')],
      quest_if:[t('if path ahead','如果前方有路'),t('do','执行'),t('else','否则')]
    };
    workspace.getAllBlocks(false).forEach(block=>{
      const text=labels[block.type];
      if(!text)return;
      const fields=block.inputList.flatMap(input=>input.fieldRow).filter(field=>field instanceof Blockly.FieldLabel);
      fields.forEach((field,index)=>{if(text[index] !== undefined)field.setValue(text[index]);});
      if(block.type==='quest_start')block.setTooltip(t('Attach your program below.','在下方连接程序。'));
    });
    workspace.updateToolbox(toolbox());
  }
  function applyLanguage(lang) {
    if(lang !== 'en' && lang !== 'zh')return;
    zh=lang==='zh';
    Blockly.setLocale(zh ? chineseMessages : englishMessages);
    localize();
    localizeBlocks();
    updateBuilder();
    draw();
    $('feedback').textContent=running?t('Running… Reset robot stops the program.','运行中…点击重置机器人可停止。'):t('Language changed. Your program, robot, and progress are preserved.','语言已切换，程序、机器人和进度已保留。');
    const url=new URL(location.href);url.searchParams.set('lang',lang);history.replaceState(null,'',url.href);
  }
  window.addEventListener('message',event=>{
    if(event.origin !== location.origin || event.source !== window.parent || event.data?.type !== 'cmc-language')return;
    applyLanguage(event.data.lang);
  });
  localize();
  $('language').addEventListener('click',()=>applyLanguage(zh?'en':'zh'));
  $('run').addEventListener('click',run);$('reset').addEventListener('click',resetRobot);
  $('restart').addEventListener('click',()=>{resetRobot();initializeProgram();});
  $('level').addEventListener('change',()=>loadLevel(Number($('level').value)));
  $('next').addEventListener('click',()=>{if(levelIndex<levels.length-1)loadLevel(levelIndex+1);});
  ['move','left','right','repeat','if'].forEach(type=>$('add-'+type).addEventListener('click',()=>add(type)));
  $('remove-last').addEventListener('click',()=>{if(running)return;const location=locationBlock();const block=location&&tail(location);if(block)block.dispose(false);updateBuilder();});
  workspace.addChangeListener(event=>{if(!event.isUiEvent)updateBuilder();});
  const resizeObserver=new ResizeObserver(()=>Blockly.svgResize(workspace));resizeObserver.observe($('workspace'));
  window.addEventListener('pagehide',()=>{stop();resizeObserver.disconnect();workspace.dispose();});
  loadLevel(0);
  };
  const messages = document.createElement('script');
  messages.src = '../lib/blockly/msg/zh-hans.js';
  messages.onload = () => {
    chineseMessages={...Blockly.Msg};
    Blockly.setLocale(zh ? chineseMessages : englishMessages);
    initialize();
  };
  messages.onerror = () => { $('feedback').textContent = t('Local Chinese block messages are missing. Check the bundled files.','中文积木资源加载失败，请检查本地文件。'); };
  document.head.append(messages);
})();
