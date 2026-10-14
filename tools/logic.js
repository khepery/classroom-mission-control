/* Original classroom wrapper; SimcirJS remains unmodified in lib/simcir. */
(() => {
  'use strict';
  let zh = new URLSearchParams(location.search).get('lang') === 'zh';
  const t = (en, cn) => zh ? cn : en;
  const $ = id => document.getElementById(id);
  document.documentElement.lang = zh ? 'zh-Hans' : 'en';
  const toolbox = ['DC', 'Toggle', 'PushOn', 'LED', 'AND', 'OR', 'XOR', 'NOT', 'NAND', 'NOR', 'XNOR', 'BUF', 'Joint'].map(type => ({type}));
  let loaded = 'AND';
  const displayLabel = label => {
    const pair = [['Power','电源'],['Output','输出'],['Sum','和'],['Carry','进位']].find(pair => pair.includes(label));
    return pair ? t(...pair) : label;
  };
  const connection = (from, to) => ({from, to});
  function sample(kind) {
    const devices = [
      {type:'DC', id:'power', x:24, y:160, label:t('Power', '电源')},
      {type:'Toggle', id:'a', x:140, y:80, label:'A'},
      {type:'Toggle', id:'b', x:140, y:240, label:'B'},
      {type:kind === 'adder' ? 'XOR' : kind, id:'gate', x:320, y:80},
      {type:'LED', id:'led', x:510, y:80, label:kind === 'adder' ? t('Sum', '和') : t('Output', '输出')}
    ];
    const connectors = [
      connection('a.in0','power.out0'), connection('b.in0','power.out0'),
      connection('gate.in0','a.out0'), connection('gate.in1','b.out0'),
      connection('led.in0','gate.out0')
    ];
    if (kind === 'adder') {
      devices.push({type:'AND',id:'carry',x:320,y:240},{type:'LED',id:'carryLED',x:510,y:240,label:t('Carry','进位')});
      connectors.push(connection('carry.in0','a.out0'),connection('carry.in1','b.out0'),connection('carryLED.in0','carry.out0'));
    }
    return {width:900,height:480,showToolbox:true,editable:true,toolbox,devices,connectors};
  }
  function liveDevices() {
    return [...$('circuit').querySelectorAll('.simcir-device')].filter(el => !el.closest('.simcir-toolbox'));
  }
  function toggle(label) {
    const el = liveDevices().find(el => {
      const dev = simcir.controller(simcir.$(el));
      return dev.deviceDef.type === 'Toggle' && dev.getLabel() === label;
    });
    if (!el) {
      $('status').textContent = t('Load a sample to use its A/B switches.', '请加载示例以使用 A/B 开关。');
      return;
    }
    const button = el.querySelector('.simcir-basicset-switch-button');
    button.dispatchEvent(new MouseEvent('mousedown', {bubbles:true}));
    document.dispatchEvent(new MouseEvent('mouseup', {bubbles:true}));
    updateReadout();
  }
  function updateReadout() {
    liveDevices().forEach(el => {
      const label = el.querySelector('.simcir-device-label');
      const text = displayLabel(simcir.controller(simcir.$(el)).getLabel());
      if(label && label.textContent !== text)label.textContent = text;
    });
    const values = liveDevices().filter(el => simcir.controller(simcir.$(el)).deviceDef.type === 'LED').map(el => {
      const dev = simcir.controller(simcir.$(el));
      return `${displayLabel(dev.getLabel())}: ${dev.getInputs()[0].getValue() != null ? 1 : 0}`;
    });
    const text = values.length ? values.join(' · ') : t('No LEDs yet. Add one from the toolbox.', '还没有 LED。请从工具箱添加。');
    if($('readout').textContent !== text)$('readout').textContent = text;
    for (const label of ['A','B']) {
      const el = liveDevices().find(el => {
        const d = simcir.controller(simcir.$(el));
        return d.deviceDef.type === 'Toggle' && d.getLabel() === label;
      });
      const button = $(label === 'A' ? 'switch-a' : 'switch-b');
      button.disabled = !el;
      if (el) button.setAttribute('aria-pressed', String(simcir.controller(simcir.$(el)).getState().on));
      else button.removeAttribute('aria-pressed');
    }
  }
  function accessibleSwitches() {
    liveDevices().forEach(el => {
      const dev = simcir.controller(simcir.$(el));
      const button = el.querySelector('.simcir-basicset-switch-button');
      if (!button) return;
      button.setAttribute('aria-label', t('Toggle switch ', '切换开关 ') + displayLabel(dev.getLabel()));
      if (button.hasAttribute('tabindex')) return;
      button.setAttribute('tabindex','0');
      button.setAttribute('role','button');
      button.addEventListener('keydown', event => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        button.dispatchEvent(new MouseEvent('mousedown',{bubbles:true}));
        document.dispatchEvent(new MouseEvent('mouseup',{bubbles:true}));
      });
    });
  }
  function table(kind) {
    $('truth-table').replaceChildren();
    if (!kind) return;
    const table = document.createElement('table');
    const head = document.createElement('tr');
    ['A','B',kind === 'adder' ? t('Sum','和') : t('Output','输出'),...(kind === 'adder' ? [t('Carry','进位')] : [])].forEach(label => {
      const th = document.createElement('th'); th.scope='col'; th.textContent=label; head.append(th);
    });
    table.append(head);
    for (let a=0;a<2;a++) for(let b=0;b<2;b++) {
      const row = document.createElement('tr');
      const output = kind === 'AND' ? a & b : kind === 'OR' ? a | b : a ^ b;
      [a,b,output,...(kind === 'adder' ? [a & b] : [])].forEach(value => {
        const td = document.createElement('td');td.textContent=value;row.append(td);
      });
      table.append(row);
    }
    $('truth-table').append(table);
  }
  function load(kind) {
    simcir.setupSimcir(simcir.$($('circuit')), kind ? sample(kind) : {...sample('AND'),devices:[],connectors:[]});
    loaded=kind;
    table(kind);
    accessibleSwitches();
    updateReadout();
    $('status').textContent = kind ? t('Sample loaded. Try all four A/B combinations.', '示例已加载。试试 A/B 的四种组合。') : t('Empty playground. Drag components from the left.', '空白实验区。请从左侧拖入元件。');
  }
  function localize() {
  document.documentElement.lang = zh ? 'zh-Hans' : 'en';
  $('title').textContent=t('Logic Circuit Lab','逻辑电路实验室');
  document.title=$('title').textContent;
  $('intro').textContent=t('Build digital circuits, flip switches, and watch the LEDs.','搭建数字电路，切换开关，观察 LED。');
  $('sample-label').textContent=t('Sample circuit','示例电路');
  $('sample').lastElementChild.textContent=t('Half adder','半加器');
  $('load').textContent=t('Load sample','加载示例');
  $('reset').textContent=t('Reset sample','重置示例');
  $('clear').textContent=t('Clear playground','清空实验区');
  $('language').textContent=zh ? 'English' : '中文';
  $('test-title').textContent=t('Test the sample','测试示例');
  $('switch-a').textContent=t('Toggle A','切换 A');
  $('switch-b').textContent=t('Toggle B','切换 B');
  $('table-note').textContent=t('Prediction table (the LEDs above show your actual circuit):','预测真值表（上方 LED 显示实际电路输出）：');
  $('help-title').textContent=t('Help & keyboard controls','帮助与键盘操作');
  $('help').textContent=t('Drag a component from the left toolbox onto the grid. Drag from an output terminal (right) to an input terminal (left) to wire it. A switch needs the DC power source connected to its input. Click a switch to change it. Drag a component back to the toolbox to delete it; double-click a label to rename it. Use the A/B buttons or Tab to a switch and press Enter/Space. Load, reset, clear, and all sample-testing controls work with the keyboard; free wiring uses pointer drag. AND needs both inputs, OR needs either input, XOR needs exactly one. A half adder combines XOR (sum) and AND (carry). Edits are temporary and reset reloads the selected sample.','将左侧工具箱中的元件拖到网格。将右侧输出端拖到左侧输入端进行连线。开关输入需连接 DC 电源。点击开关切换状态。将元件拖回工具箱可删除；双击标签可重命名。可使用 A/B 按钮，或按 Tab 聚焦开关后按 Enter/空格。加载、重置、清空及示例测试支持键盘；自由连线需拖动。AND 要求两个输入均为 1，OR 要求至少一个为 1，XOR 要求恰好一个为 1。半加器由 XOR（和）与 AND（进位）组成。编辑不保存，重置将重新加载所选示例。');
  $('credit').firstChild.textContent=t('Powered by authentic SimcirJS by Kazuhiko Arase, MIT licensed. Runs locally; no accounts, uploads, or saved student data. ','由 Kazuhiko Arase 的原版 SimcirJS 驱动，MIT 许可。本地运行；无需账户、不上传、不保存学生数据。');
  $('credit').querySelector('a').textContent=t('License','许可');
  }
  function applyLanguage(lang) {
    if(lang !== 'en' && lang !== 'zh')return;
    zh = lang === 'zh';
    localize();
    table(loaded);
    updateReadout();
    accessibleSwitches();
    $('status').textContent=t('Language changed. Your circuit is preserved.','语言已切换，电路已保留。');
    const url=new URL(location.href);url.searchParams.set('lang',lang);history.replaceState(null,'',url.href);
  }
  window.addEventListener('message',event=>{
    if(event.origin !== location.origin || event.source !== window.parent || event.data?.type !== 'cmc-language')return;
    applyLanguage(event.data.lang);
  });
  localize();
  $('language').addEventListener('click',()=>applyLanguage(zh?'en':'zh'));
  $('load').addEventListener('click',()=>load($('sample').value));
  $('reset').addEventListener('click',()=>load($('sample').value));
  $('clear').addEventListener('click',()=>load(null));
  $('switch-a').addEventListener('click',()=>toggle('A'));
  $('switch-b').addEventListener('click',()=>toggle('B'));
  load(loaded);
  const observer=new MutationObserver(()=>accessibleSwitches());
  observer.observe($('circuit'),{childList:true,subtree:true});
  const readoutTimer=setInterval(updateReadout,200);
  window.addEventListener('pagehide',event=>{
    if(event.persisted)return;
    observer.disconnect();
    clearInterval(readoutTimer);
    simcir.$($('circuit')).find('.simcir-workspace').trigger('dispose');
  });
  window.addEventListener('pageshow',event=>{
    if(event.persisted){accessibleSwitches();updateReadout();}
  });
})();
