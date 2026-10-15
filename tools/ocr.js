(() => {
  'use strict';
  let zh = new URLSearchParams(location.search).get('lang') === 'zh';

  // Every visible string: [English, Simplified Chinese]. {n}-style placeholders are filled by t().
  const W = {
    titleA: ['Photo →', '照片 →'], titleB: ['Editable Text', '可编辑文字'],
    sub: ['Turn a photo of a textbook page, worksheet or board into text you can edit, then reuse it as a word list, gap-fill, dictation or slides.',
      '把课本、练习单或黑板的照片变成可编辑的文字，再用作词汇表、填空练习、听写或幻灯片。'],
    big: ['Big text', '大字模式'], bigTip: ['Larger text for the projector (Alt+B)', '放大文字，适合投影（Alt+B）'],
    privacyHead: ['Private by design', '隐私优先'],
    privacy: ['All recognition happens on this device. Images and text are never uploaded.', '文字识别完全在此设备上进行。图片和文字不会上传。'],
    pdfNote: ['PDF files are not supported: take a photo or a screenshot of the page instead.', '不支持 PDF 文件：请改为拍照或截取页面截图。'],
    hPhotos: ['1 · Photos', '1 · 照片'], pick: ['Choose photos', '选择照片'], camera: ['Take a photo', '拍照'],
    dropHint: ['…or drag photos here, or paste an image with Ctrl+V. PNG, JPG or WebP, up to 10 MB each, up to 10 pages.',
      '…或把照片拖到这里，或按 Ctrl+V 粘贴图片。支持 PNG、JPG、WebP，每张最大 10 MB，最多 10 页。'],
    queueLabel: ['Pages in order', '按顺序排列的页面'],
    rotL: ['⟲ 90°', '⟲ 90°'], rotLTip: ['Rotate left', '向左旋转'], rotR: ['⟳ 90°', '⟳ 90°'], rotRTip: ['Rotate right', '向右旋转'],
    moveL: ['← Earlier', '← 前移'], moveR: ['Later →', '后移 →'], remove: ['Remove page', '删除此页'], removeAll: ['Remove all', '全部删除'],
    emptyView: ['No photo yet. Choose, drop or paste one to begin.', '还没有照片。请选择、拖入或粘贴一张照片开始。'],
    viewLabel: ['Preview of the selected page', '所选页面的预览'],
    hSettings: ['Settings', '设置'], languageLabel: ['Text language', '图片文字语言'],
    english: ['English', '英语'], chinese: ['Simplified Chinese', '简体中文'], combined: ['English + Simplified Chinese', '英语 + 简体中文'],
    hPre: ['Make the photo easier to read', '让照片更易识别'], grey: ['Greyscale', '灰度'], contrast: ['Contrast', '对比度'],
    thr: ['Black and white threshold', '黑白阈值'], thrOff: ['off', '关'], applyAll: ['Apply these to all pages', '应用到所有页面'],
    auto: ['Auto black & white', '自动黑白'], autoTip: ['Picks a threshold for this page', '为当前页面自动选择阈值'], resetFx: ['Reset', '重置'],
    recognize: ['Recognize text', '识别文字'], recognizeTip: ['Recognise the pages that are new or changed (Ctrl+Enter)', '识别新增或已修改的页面（Ctrl+Enter）'],
    cancel: ['Cancel', '取消'], progress: ['OCR progress', '文字识别进度'],
    tip: ['Use a clear, upright, well-lit photo. Large images are reduced to at most 2400 pixels per side. The first recognition may take a moment to load the bundled language model.',
      '请使用清晰、正向、光线充足的照片。大图会缩小至每边最多 2400 像素。首次识别需要稍等片刻以加载本地语言模型。'],
    hText: ['2 · Text', '2 · 文字'], warnHead: ['Proofread before use', '使用前请校对'],
    resultLabel: ['Editable text — check recognition before using it', '可编辑文字 — 使用前请检查识别结果'],
    tabEdit: ['Edit', '编辑'], tabProof: ['Proofread ({n})', '校对（{n}）'],
    resultPh: ['Recognised text appears here. You can also type or paste text.', '识别出的文字会显示在这里，也可以直接输入或粘贴文字。'],
    clean: ['Clean up', '整理'], cleanLabel: ['Clean-up tools', '整理工具'],
    cJoin: ['Join lines', '合并断行'], cJoinTip: ['Join broken lines into paragraphs (also rejoins hyphenated words)', '把断开的行合并成段落（同时接回被连字符拆开的单词）'],
    cHyph: ['Fix hyphenation', '修复连字符'], cHyphTip: ['Rejoin words split by a hyphen at the end of a line', '接回行末被连字符拆开的单词'],
    cTidy: ['Tidy spaces', '整理空格'], cTidyTip: ['Remove double spaces, stray line-end spaces and spaces between Chinese characters', '去除多余空格、行尾空格以及汉字之间的空格'],
    cConf: ['Fix l/1 O/0', '修正 l/1 O/0'], cConfTip: ['English only: fix common mix-ups such as 2O24 or w0rd', '仅限英文：修正常见混淆，如 2O24 或 w0rd'],
    undo: ['Undo', '撤销'], clearText: ['Clear text', '清空文字'], nextDoubt: ['Next word to check', '下一个待检查的词'],
    nextDoubtTip: ['Jump to the next low-confidence word (F8)', '跳到下一个低置信度的词（F8）'],
    findLabel: ['Find and replace', '查找和替换'], findPh: ['Find', '查找'], replPh: ['Replace with', '替换为'], matchCase: ['Match case', '区分大小写'],
    findNext: ['Find next', '查找下一个'], replAll: ['Replace all', '全部替换'],
    doubtLevel: ['Highlight words below', '高亮低于此值的词'],
    proofHint: ['This shows the text as first recognised. Click a highlighted word to find it in the editor.', '这里显示最初识别的文字。点击高亮的词可在编辑器中定位。'],
    proofEmpty: ['Nothing to proofread yet. Recognise a photo first.', '暂无可校对内容。请先识别一张照片。'],
    proofNone: ['No words below this confidence. Still read the text through once.', '没有低于此置信度的词。仍请通读一遍文字。'],
    pageN: ['Page {n}', '第 {n} 页'],
    outLabel: ['Share and export', '分享与导出'], copy: ['Copy text', '复制文字'], save: ['Save .txt', '保存 .txt'], printText: ['Print', '打印'],
    toListen: ['Send to Dictation & Listening', '发送到听写与听读'], toWorksheet: ['Send to Worksheet Maker', '发送到练习单制作'], toSlides: ['Send to Slide Studio', '发送到幻灯片工坊'],
    standalone: ['Open this tool inside Mission Control to send text.', '请在 Mission Control 内打开此工具以发送文字。'],
    hMake: ['3 · Make something for your class', '3 · 为课堂制作材料'],
    hWords: ['Word list', '词汇表'], wordsHint: ['Picks the most useful unique vocabulary, skipping very common words.', '挑选最有用且不重复的词汇，跳过过于常见的词。'],
    wlMax: ['How many', '数量'], wlMin: ['Min letters', '最少字母数'], wlOrder: ['Order', '排序'],
    ordText: ['As they appear', '按出现顺序'], ordAz: ['A to Z', 'A 到 Z'], ordLong: ['Longest first', '最长优先'], wlNames: ['Skip names', '跳过人名'],
    wlMake: ['Make word list', '生成词汇表'], wlOutLabel: ['Word list, one word per line', '词汇表，每行一个词'], wlPh: ['Your word list appears here, one word per line. You can edit it.', '词汇表显示在这里，每行一个词，可以编辑。'],
    copyList: ['Copy list', '复制词汇表'],
    hCloze: ['Gap-fill (cloze) text', '填空（完形）文本'], clozeHint: ['Blanks words in your text and makes an answer key. Use it on screen or print it.', '把文字中的词挖空并生成答案。可在屏幕上使用或打印。'],
    clMode: ['Blank', '挖空方式'], clNth: ['Every Nth word', '每隔 N 个词'], clList: ['Words in my word list', '词汇表中的词'], clN: ['N', 'N'],
    clSkip: ['Skip common words', '跳过常见词'], clFirst: ['Keep first sentence', '保留第一句'], clBank: ['Word bank', '词库'],
    clMake: ['Make gap-fill', '生成填空'], clReveal: ['Show answers', '显示答案'], clHide: ['Hide answers', '隐藏答案'],
    clCopy: ['Copy student text', '复制学生版'], clCopyKey: ['Copy answer key', '复制答案'], clPrint: ['Print student sheet', '打印学生版'], clPrintKey: ['Print answer key', '打印答案'],
    histSummary: ['Recent texts ({n})', '最近的文字（{n}）'], histPrivacy: ['Photos are never uploaded or stored. Only the recognised text of your last few scans is kept in this browser, and you can clear it at any time.',
      '照片绝不会上传或保存。只有最近几次识别出的文字保存在此浏览器中，您可以随时清除。'],
    histEmpty: ['No saved texts yet.', '还没有保存的文字。'], histClear: ['Clear history', '清除历史'], histOpen: ['Open', '打开'], histDelete: ['Delete', '删除'],
    histChars: ['{n} characters', '{n} 个字符'],
    keysHead: ['Keyboard shortcuts', '键盘快捷键'],
    keys: ['Ctrl+V paste a photo · Ctrl+Enter recognise · Esc cancel · F8 next word to check · Alt+B big text', 'Ctrl+V 粘贴照片 · Ctrl+Enter 识别 · Esc 取消 · F8 下一个待检查的词 · Alt+B 大字模式'],
    credits: ['Text recognition by Tesseract.js and Tesseract OCR (Apache-2.0), running locally with bundled English and Simplified Chinese models.',
      '文字识别由 Tesseract.js 和 Tesseract OCR（Apache-2.0）提供，使用内置的英语和简体中文模型在本地运行。'],
    licJs: ['Tesseract.js licence', 'Tesseract.js 许可证'], licCore: ['Core licence', '核心库许可证'], licData: ['Language data licence', '语言数据许可证'],
    // status and toasts
    ready: ['Choose a photo to begin.', '请选择一张照片开始。'],
    selected: ['Photo ready. Choose its text language, then recognise.', '照片已就绪。请选择文字语言，然后开始识别。'],
    pagesReady: ['{n} page(s) ready. Choose the text language, then recognise.', '已有 {n} 页。请选择文字语言，然后开始识别。'],
    addedSome: ['{n} added, {m} skipped. {why}', '已添加 {n} 张，跳过 {m} 张。{why}'],
    loading: ['Loading local OCR engine…', '正在加载本地识别引擎…'], model: ['Loading local language model…', '正在加载本地语言模型…'],
    recognizing: ['Recognizing page {i} of {n}…', '正在识别第 {i} / {n} 页…'],
    complete: ['Recognition complete. Check the highlighted words, then edit the text below.', '识别完成。请检查高亮的词，然后编辑下方文字。'],
    blank: ['No text found. Try rotating, a higher contrast or a clearer, upright image with larger text.', '未找到文字。请尝试旋转、提高对比度，或使用更清晰、正向且文字更大的图片。'],
    cancelled: ['Recognition cancelled.', '已取消识别。'], cancelledKept: ['Recognition cancelled. Pages that were finished have been kept.', '已取消识别。已完成的页面已保留。'],
    invalid: ['Choose a valid PNG, JPG or WebP image.', '请选择有效的 PNG、JPG 或 WebP 图片。'],
    pdf: ['PDF files are not supported. Take a photo or a screenshot of the page instead.', '不支持 PDF 文件。请改为拍照或截取页面截图。'],
    heic: ['HEIC photos are not supported. Set the camera to “Most Compatible” (JPG) or take a screenshot.', '不支持 HEIC 照片。请将相机设为“最兼容”（JPG）或使用截图。'],
    size: ['The photo must be nonempty and no larger than 10 MB. Try a smaller copy or a lower camera resolution.', '照片不能为空，且不能超过 10 MB。请使用较小的副本或降低相机分辨率。'],
    dimensions: ['This image is too large to decode safely (maximum 24 million pixels and 12000 pixels per side).', '图片过大，无法安全解码（最多 2400 万像素，每边最多 12000 像素）。'],
    memory: ['The device ran out of memory. Close other tabs, use fewer or smaller photos and try again.', '设备内存不足。请关闭其他标签页，使用更少或更小的照片后重试。'],
    tooMany: ['You can queue up to 10 pages. Remove one to add another.', '最多可排 10 页。请先删除一页再添加。'],
    busyWait: ['Please wait until recognition has finished.', '请等待识别完成。'],
    timeout: ['Recognition took too long and was stopped. Try a smaller or clearer image.', '识别用时过长，已停止。请尝试更小或更清晰的图片。'],
    failure: ['Recognition failed. Check that the local OCR assets are available and try a smaller, clearer image.', '识别失败。请检查本地识别文件是否可用，并尝试更小、更清晰的图片。'],
    copied: ['Text copied.', '文字已复制。'], copyFailed: ['Could not copy automatically. Select the text and copy it manually.', '无法自动复制。请选中文字并手动复制。'],
    saved: ['Text saved.', '文字已保存。'], sent: ['Text sent to the classroom tool.', '文字已发送到课堂工具。'],
    tooLong: ['That text is too long to send (maximum 100,000 characters).', '文字太长，无法发送（最多 100,000 个字符）。'],
    noText: ['There is no text yet.', '还没有文字。'], nothing: ['Nothing to change.', '没有需要修改的内容。'], cleaned: ['Text cleaned. Undo is available.', '文字已整理，可以撤销。'],
    confFixed: ['{n} possible mix-up(s) fixed. Check the numbers and words.', '已修正 {n} 处可能的混淆。请检查数字和单词。'],
    undone: ['Last change undone.', '已撤销上一步修改。'], cleared: ['Text cleared. Undo is available.', '文字已清空，可以撤销。'],
    noMatch: ['No matches.', '没有匹配项。'], matches: ['{n} match(es)', '{n} 处匹配'], replaced: ['{n} replaced.', '已替换 {n} 处。'],
    allChecked: ['No highlighted words left to check in the text.', '文字中已没有需要检查的高亮词。'],
    stWords: ['Words', '词数'], stHan: ['Chinese characters', '汉字数'], stChars: ['Characters', '字符数'],
    confAvg: ['Average confidence', '平均置信度'], confGood: ['Good', '良好'], confFair: ['Fair: proofread carefully', '一般：请仔细校对'],
    confLow: ['Low: try rotating, more contrast or a clearer photo', '较低：请尝试旋转、提高对比度或使用更清晰的照片'],
    confCheck: ['{n} word(s) to check', '{n} 个词待检查'],
    wordsMade: ['{n} word(s) listed', '已列出 {n} 个词'], wordsNone: ['No suitable words found. Try a lower minimum length.', '没有找到合适的词。请降低最少字母数。'],
    listCopied: ['Word list copied.', '词汇表已复制。'],
    clListEmpty: ['Make or type a word list first.', '请先生成或输入词汇表。'], clNone: ['Not enough words to blank. Try a smaller N or turn off “Skip common words”.', '可挖空的词太少。请减小 N 或关闭“跳过常见词”。'],
    clCount: ['{n} blank(s)', '{n} 个空'], clCopied: ['Copied.', '已复制。'],
    histSaved: ['Could not save history on this device (storage is full or blocked).', '无法在此设备上保存历史（存储已满或被禁用）。'],
    histCleared: ['History cleared.', '历史已清除。'], histOpened: ['Saved text opened. Undo is available.', '已打开保存的文字，可以撤销。'],
    orderKept: ['Page order changed. Text not updated because you edited it; recognise again to rebuild.', '页面顺序已更改。由于您编辑过文字，文字未更新；请重新识别以重建。'],
    dupeLang: ['Language changed. Recognise again to apply it.', '语言已更改。请重新识别以应用。'],
    pageInfo: ['Page {i} of {n} · {name} · {w} × {h}', '第 {i} / {n} 页 · {name} · {w} × {h}'],
    // print and cloze headings, picked by the language of the text
    prText: ['Recognised text', '识别的文字'], prWords: ['Word list', '词汇表'], prGap: ['Gap-fill', '填空练习'], prKey: ['Answer key', '答案'],
    prName: ['Name: ______________   Date: ____________', '姓名：______________   日期：____________'],
    bank: ['Word bank', '词库'],
  };
  let lang = zh ? 'zh' : 'en';
  const t = (key, vars) => {
    const pair = W[key];
    let s = pair ? pair[lang === 'zh' ? 1 : 0] : key;
    if (vars) for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(String(v));
    return s;
  };
  const tl = (key, l) => W[key][l === 'zh' ? 1 : 0];

  const $ = (id) => document.getElementById(id);
  const imageInput = $('image'), cameraInput = $('cameraInput');
  const result = $('result'), view = $('view'), progress = $('progress');
  const recognize = $('recognize'), cancel = $('cancel'), langSel = $('language');
  const outButtons = [$('copy'), $('save'), $('printText'), ...document.querySelectorAll('[data-target]')];
  const embedded = parent !== window && location.origin !== 'null';
  const root = new URL('../', location.href);
  const MAX_PAGES = 10, MAX_BYTES = 10 * 1024 * 1024, MAX_TEXT = 100000;

  // ---------- storage ----------
  const SKEY = 'mc_tool_ocr_settings', HKEY = 'mc_tool_ocr_history';
  const store = {
    get(key, fallback) { try { const v = JSON.parse(localStorage.getItem(key)); return v ?? fallback; } catch { return fallback; } },
    set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; } },
  };
  const settings = (() => { const s = store.get(SKEY, {}); return s && typeof s === 'object' && !Array.isArray(s) ? s : {}; })();
  const saveSettings = () => store.set(SKEY, settings);

  // ---------- state ----------
  let pages = [];
  let sel = -1;
  let cur = { id: 0, bitmap: null };
  let nextId = 1;
  let busy = false, active = null, runToken = 0, viewToken = 0;
  let lastStatus = { key: 'ready', vars: null, error: false };
  let lastCombined = '';
  let undoStack = [];
  let histId = null, histTimer = 0, toastTimer = 0, renderQueued = false;
  let tab = 'edit';
  const scratch = document.createElement('canvas');

  // ---------- text tools (pure functions) ----------
  const HAN = /\p{Script=Han}/u;
  const HANP = /[\p{Script=Han}，。！？、；：（）《》“”]/u;
  const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  let segmenter = null;
  try { segmenter = new Intl.Segmenter('zh', { granularity: 'word' }); } catch { segmenter = null; }

  const STOP = new Set(('a about above after again against all also am an and any are as at be because been before being below between both but by can could did do does doing down during each few for from further had has have having he her here hers herself him himself his how i if in into is it its itself just let me more most my myself no nor not now of off on once only or other our ours ourselves out over own same she should so some such than that the their theirs them themselves then there these they this those through to too under until up very was we were what when where which while who whom why will with would you your yours yourself yourselves ' +
    'are aren\'t can\'t cannot couldn\'t didn\'t doesn\'t don\'t hadn\'t hasn\'t haven\'t he\'d he\'ll he\'s i\'d i\'ll i\'m i\'ve isn\'t it\'s let\'s shan\'t she\'d she\'ll she\'s shouldn\'t that\'s there\'s they\'d they\'ll they\'re they\'ve wasn\'t we\'d we\'ll we\'re we\'ve weren\'t what\'s when\'s where\'s who\'s won\'t wouldn\'t you\'d you\'ll you\'re you\'ve ' +
    'one two three many much may might must shall get got make made say said see go went come came take took like even still yet however thus also often every another among within without upon etc').split(/\s+/));
  const ZH_STOP = new Set('的了是在我有和就不人都一个上也很到说要去你会着没看好自己这那他她它们我们你们与及或而但如因为所以从对把被让给向于之其中'.split(''));
  const zhCommon = (s) => [...s].every((c) => ZH_STOP.has(c));

  function tokens(text) {
    const out = [];
    const re = /\p{Script=Han}+|(?:(?!\p{Script=Han})[\p{L}\p{N}])+(?:['’-](?:(?!\p{Script=Han})[\p{L}\p{N}])+)*/gu;
    for (const m of text.matchAll(re)) {
      if (HAN.test(m[0][0])) {
        if (segmenter) {
          for (const s of segmenter.segment(m[0])) if (s.isWordLike) out.push({ s: s.segment, start: m.index + s.index, kind: 'zh' });
        } else {
          let at = m.index;
          for (const ch of m[0]) { out.push({ s: ch, start: at, kind: 'zh' }); at += ch.length; }
        }
      } else out.push({ s: m[0], start: m.index, kind: 'en' });
    }
    out.forEach((o) => { o.end = o.start + o.s.length; });
    return out;
  }
  function countText(text) {
    const han = (text.match(/\p{Script=Han}/gu) || []).length;
    const latin = (text.match(/(?:(?!\p{Script=Han})[\p{L}\p{N}])+(?:['’-](?:(?!\p{Script=Han})[\p{L}\p{N}])+)*/gu) || []).length;
    return { words: latin, han, chars: text.replace(/\s/g, '').length };
  }
  function tidy(text) {
    let s = text.replace(/\r\n?/g, '\n').replace(/[\u00a0\t]/g, ' ').replace(/\u00ad/g, '');
    s = s.replace(/ {2,}/g, ' ').replace(/ +\n/g, '\n').replace(/\n +/g, '\n').replace(/\n{3,}/g, '\n\n');
    s = s.replace(/([\p{Script=Han}，。！？、；：（）《》“”‘’]) +(?=[\p{Script=Han}，。！？、；：（）《》“”‘’])/gu, '$1');
    s = s.replace(/ +([,;:!?])(?=\s|$)/g, '$1');
    return s.trim();
  }
  function dehyphenate(text) {
    return text.replace(/\u00ad/g, '').replace(/(\p{L})-[ \t]*\r?\n[ \t]*(\p{Ll})/gu, '$1$2');
  }
  const BULLET = /^(?:[-–•*·●▪■◦○]\s|\(?\d{1,2}[.)、]\s*|[①-⑩]|[A-Da-d][.)]\s)/u;
  function joinPair(a, b) {
    if (/\p{L}-$/u.test(a) && /^\p{Ll}/u.test(b)) return a.slice(0, -1) + b;
    const last = [...a].pop(), first = [...b][0];
    if (HANP.test(last) || HANP.test(first)) return a + b;
    return `${a} ${b}`;
  }
  function joinLines(text) {
    return text.replace(/\r\n?/g, '\n').split(/\n{2,}/).map((block) => {
      const out = [];
      for (const line of block.split('\n').map((l) => l.trim()).filter(Boolean)) {
        if (!out.length || BULLET.test(line)) out.push(line);
        else out[out.length - 1] = joinPair(out[out.length - 1], line);
      }
      return out.join('\n');
    }).filter(Boolean).join('\n\n');
  }
  function fixConfusions(text) {
    let n = 0;
    const out = text.replace(/[A-Za-z0-9]+/g, (tok) => {
      let r = tok;
      if (/\d/.test(tok) && /^[0-9OolI]+$/.test(tok)) r = tok.replace(/[Oo]/g, '0').replace(/[lI]/g, '1');
      else if (/[A-Za-z]/.test(tok) && /[01]/.test(tok) && !/[2-9]/.test(tok) && !/^\d+(?:st|nd|rd|th)$/i.test(tok)) {
        r = tok.replace(/(?<=[A-Za-z])([01])(?=[A-Za-z])/g, (m, d, off, str) => {
          const lower = /[a-z]/.test(str[off - 1]) || /[a-z]/.test(str[off + 1]);
          return d === '0' ? (lower ? 'o' : 'O') : (lower ? 'l' : 'I');
        }).replace(/^1(?=[a-z]{3,}$)/, 'l');
      }
      if (r !== tok) n += 1;
      return r;
    });
    return { text: out, n };
  }
  function wordRegex(word, flags = 'gu') {
    const body = escapeRe(word);
    return HAN.test(word) ? new RegExp(body, flags) : new RegExp(`(?<![\\p{L}\\p{N}])${body}(?![\\p{L}\\p{N}])`, flags);
  }

  function makeWordList(text, opts) {
    const map = new Map();
    const lowerSeen = new Set();
    const toks = tokens(text);
    toks.forEach((tok, order) => {
      let key;
      if (tok.kind === 'en') {
        let w = tok.s.replace(/['’]s$/i, '');
        if (/\d/.test(w) || w.length < opts.min) return;
        const lower = w.toLowerCase();
        if (w === lower) lowerSeen.add(lower);
        if (STOP.has(lower)) return;
        let proper = false;
        if (/^\p{Lu}/u.test(w) && w !== w.toUpperCase()) {
          const before = text.slice(0, tok.start).replace(/[ \t"“”'‘’(]+$/, '');
          proper = before !== '' && (!/[.!?:。！？\n]$/.test(before) || /\b(?:Mr|Mrs|Ms|Dr|Prof|St|Sr|Jr)\.$/.test(before));
        }
        key = lower;
        const e = map.get(key) || { word: lower, n: 0, order, proper: true, kind: 'en' };
        e.n += 1;
        if (!proper) e.proper = false;
        map.set(key, e);
      } else {
        if (tok.s.length < 2 || zhCommon(tok.s)) return;
        const e = map.get(tok.s) || { word: tok.s, n: 0, order, proper: false, kind: 'zh' };
        e.n += 1;
        map.set(tok.s, e);
      }
    });
    let list = [...map.values()].filter((e) => !(opts.skipNames && e.proper && !lowerSeen.has(e.word)));
    list = list.filter((e) => !(e.kind === 'en' && e.word.endsWith('s') && map.has(e.word.slice(0, -1))));
    list.forEach((e) => { e.score = e.word.length + Math.min(e.n, 4) * 2; });
    list.sort((a, b) => b.score - a.score || a.order - b.order);
    list = list.slice(0, opts.max);
    if (opts.order === 'az') list.sort((a, b) => a.word.localeCompare(b.word));
    else if (opts.order === 'long') list.sort((a, b) => b.word.length - a.word.length || a.order - b.order);
    else list.sort((a, b) => a.order - b.order);
    return list.map((e) => e.word);
  }

  function makeCloze(text, opts) {
    let gaps = [];
    if (opts.mode === 'list') {
      const words = [...new Set(opts.words.map((w) => w.trim()).filter(Boolean))].sort((a, b) => b.length - a.length);
      if (!words.length) return { error: 'clListEmpty' };
      const han = words.filter((w) => HAN.test(w)).map(escapeRe);
      const latin = words.filter((w) => !HAN.test(w)).map(escapeRe);
      const parts = [];
      if (latin.length) parts.push(`(?<![\\p{L}\\p{N}])(?:${latin.join('|')})(?![\\p{L}\\p{N}])`);
      if (han.length) parts.push(`(?:${han.join('|')})`);
      for (const m of text.matchAll(new RegExp(parts.join('|'), 'giu'))) gaps.push({ start: m.index, end: m.index + m[0].length, answer: m[0] });
    } else {
      const eligible = (tok) => {
        if (tok.kind === 'en') {
          const w = tok.s.toLowerCase();
          if (/\d/.test(w)) return false;
          return opts.skip ? w.length >= 3 && !STOP.has(w) : w.length >= 2;
        }
        return opts.skip ? !zhCommon(tok.s) && (tok.s.length >= 2 || !segmenter) : true;
      };
      const all = tokens(text).filter(eligible);
      let pool = all;
      const stop = text.search(/[.!?。！？]/);
      if (opts.keepFirst && stop >= 0) {
        const later = all.filter((tok) => tok.start > stop);
        if (later.length) pool = later;
      }
      for (let i = opts.n - 1; i < pool.length; i += opts.n) gaps.push({ start: pool[i].start, end: pool[i].end, answer: pool[i].s });
    }
    if (!gaps.length) return { error: 'clNone' };
    const segs = [];
    let pos = 0;
    gaps.forEach((g, i) => {
      if (g.start > pos) segs.push({ text: text.slice(pos, g.start) });
      segs.push({ gap: i + 1, answer: g.answer, han: HAN.test(g.answer) });
      pos = g.end;
    });
    if (pos < text.length) segs.push({ text: text.slice(pos) });
    const answers = gaps.map((g) => g.answer);
    const bank = [...new Set(answers.map((a) => (HAN.test(a) ? a : a.toLowerCase())))];
    for (let i = bank.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [bank[i], bank[j]] = [bank[j], bank[i]];
    }
    return { segs, answers, bank, gaps: gaps.length };
  }
  const blankText = (seg) => (seg.han ? `（${seg.gap}）______` : `(${seg.gap}) ________`);

  // ---------- small UI helpers ----------
  function toast(key, vars) {
    const el = $('toast');
    el.textContent = t(key, vars);
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.hidden = true; }, 3200);
  }
  function status(key, error = false, vars = null) {
    lastStatus = { key, vars, error };
    $('status').textContent = t(key, vars);
    $('status').dataset.error = String(error);
  }
  function setProgress(value) {
    progress.value = value;
    $('pct').textContent = value > 0 ? `${Math.round(value * 100)}%` : '';
  }
  function download(name, text) {
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  async function copyText(text, okKey) {
    try { await navigator.clipboard.writeText(text); toast(okKey); return true; } catch { toast('copyFailed'); return false; }
  }
  function printOut(title, body) {
    $('prTitle').textContent = title;
    $('prBody').textContent = body;
    try { window.print(); } catch { /* printing unavailable */ }
  }
  function send(target, text) {
    if (!text.trim()) return;
    if (!embedded) { status('standalone', true); toast('standalone'); return; }
    if (text.length > MAX_TEXT) { toast('tooLong'); return; }
    parent.postMessage({ type: 'cmc-ocr-text', target, text }, location.origin);
    status('sent');
  }
  const guessLang = (text) => (HAN.test(text) && (text.match(/\p{Script=Han}/gu) || []).length > (text.match(/[A-Za-z]/g) || []).length / 4 ? 'zh' : 'en');

  // ---------- language ----------
  function applyLanguage(next) {
    lang = next === 'zh' ? 'zh' : 'en';
    zh = lang === 'zh';
    document.documentElement.lang = zh ? 'zh-CN' : 'en';
    document.title = `${t('titleA')} ${t('titleB')}`;
    document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll('[data-i18n-ph]').forEach((el) => { el.placeholder = t(el.dataset.i18nPh); });
    document.querySelectorAll('[data-i18n-aria]').forEach((el) => { el.setAttribute('aria-label', t(el.dataset.i18nAria)); });
    document.querySelectorAll('[data-i18n-title]').forEach((el) => { el.title = t(el.dataset.i18nTitle); });
    $('queue').setAttribute('aria-label', t('queueLabel'));
    progress.setAttribute('aria-label', t('progress'));
    view.setAttribute('role', 'img');
    view.setAttribute('aria-label', t('viewLabel'));
    $('clReveal').textContent = t($('clReveal').getAttribute('aria-pressed') === 'true' ? 'clHide' : 'clReveal');
    $('status').textContent = t(lastStatus.key, lastStatus.vars);
    renderQueue();
    renderInfo();
    syncFx();
    refresh();
  }

  // ---------- image pages ----------
  const sig = (p) => `${p.rot}|${p.grey}|${p.contrast}|${p.thr}|${langSel.value}`;
  const fxOn = (p) => p.grey || p.contrast !== 0 || p.thr > 0;
  function renderPage(page, bitmap, canvas, thrOverride) {
    const quarter = page.rot % 2 === 1;
    const w = quarter ? bitmap.height : bitmap.width, h = quarter ? bitmap.width : bitmap.height;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, w, h);
    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.rotate(page.rot * Math.PI / 2);
    ctx.drawImage(bitmap, -bitmap.width / 2, -bitmap.height / 2);
    ctx.restore();
    const thr = thrOverride ?? page.thr;
    if (!(page.grey || page.contrast !== 0 || thr > 0)) return ctx;
    const img = ctx.getImageData(0, 0, w, h);
    const d = img.data;
    const f = (259 * (page.contrast + 255)) / (255 * (259 - page.contrast));
    for (let i = 0; i < d.length; i += 4) {
      let v = .299 * d[i] + .587 * d[i + 1] + .114 * d[i + 2];
      if (page.contrast !== 0) v = (v - 128) * f + 128;
      if (thr > 0) v = v >= thr ? 255 : 0;
      d[i] = d[i + 1] = d[i + 2] = v < 0 ? 0 : v > 255 ? 255 : v;
    }
    ctx.putImageData(img, 0, 0);
    return ctx;
  }
  function otsu(ctx, w, h) {
    const d = ctx.getImageData(0, 0, w, h).data;
    const hist = new Array(256).fill(0);
    for (let i = 0; i < d.length; i += 4) hist[Math.round(.299 * d[i] + .587 * d[i + 1] + .114 * d[i + 2])] += 1;
    const total = w * h;
    let sum = 0;
    for (let i = 0; i < 256; i += 1) sum += i * hist[i];
    let wB = 0, sumB = 0, best = 0, level = 128;
    for (let i = 0; i < 256; i += 1) {
      wB += hist[i];
      if (!wB) continue;
      const wF = total - wB;
      if (!wF) break;
      sumB += i * hist[i];
      const between = wB * wF * ((sumB / wB) - ((sum - sumB) / wF)) ** 2;
      if (between > best) { best = between; level = i; }
    }
    return Math.max(5, Math.min(250, Math.round(level / 5) * 5));
  }
  function drawThumb(page, source) {
    if (!page.thumb) { page.thumb = document.createElement('canvas'); page.thumb.width = page.thumb.height = 80; }
    const c = page.thumb.getContext('2d');
    const s = Math.min(source.width, source.height);
    c.fillStyle = '#fff';
    c.fillRect(0, 0, 80, 80);
    c.drawImage(source, (source.width - s) / 2, (source.height - s) / 2, s, s, 0, 0, 80, 80);
  }
  function closeBitmap() { if (cur.bitmap) cur.bitmap.close(); cur = { id: 0, bitmap: null }; }
  async function renderCurrent() {
    const page = pages[sel];
    const token = ++viewToken;
    if (!page) { view.hidden = true; $('emptyView').hidden = false; closeBitmap(); return; }
    try {
      if (cur.id !== page.id) {
        closeBitmap();
        const bitmap = await createImageBitmap(page.blob);
        if (token !== viewToken) { bitmap.close(); return; }
        cur = { id: page.id, bitmap };
      }
      renderPage(page, cur.bitmap, view);
      view.hidden = false;
      $('emptyView').hidden = true;
      drawThumb(page, view);
      renderInfo();
    } catch (err) {
      status(isMemory(err) ? 'memory' : 'invalid', true);
    }
  }
  function scheduleRender() {
    if (renderQueued) return;
    renderQueued = true;
    requestAnimationFrame(() => { renderQueued = false; renderCurrent(); });
  }
  function isMemory(err) { return err && (err.name === 'QuotaExceededError' || err instanceof RangeError || /memory|alloc/i.test(String(err.message))); }

  function fileKind(file) {
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    const type = file.type || ({ png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', pdf: 'application/pdf', heic: 'image/heic', heif: 'image/heif' }[ext] || '');
    if (type === 'application/pdf') return 'pdf';
    if (/hei[cf]/.test(type)) return 'heic';
    return ['image/png', 'image/jpeg', 'image/webp'].includes(type) ? 'ok' : 'invalid';
  }
  async function loadPage(file) {
    const kind = fileKind(file);
    if (kind !== 'ok') throw { key: kind };
    if (!file.size || file.size > MAX_BYTES) throw { key: 'size' };
    let bitmap;
    try {
      bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
      if (!bitmap.width || !bitmap.height || bitmap.width > 12000 || bitmap.height > 12000 || bitmap.width * bitmap.height > 24000000) throw { key: 'dimensions' };
      const longest = Math.max(bitmap.width, bitmap.height);
      const scale = longest > 2400 ? 2400 / longest : longest < 900 ? 2 : 1;
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw { key: 'memory' };
      const base = pages.length ? pages[pages.length - 1] : null;
      const page = {
        id: nextId++, name: file.name || 'photo', blob, w: canvas.width, h: canvas.height, rot: 0,
        grey: base ? base.grey : false, contrast: base ? base.contrast : 0, thr: base ? base.thr : 0,
        done: '', text: '', paras: null, conf: null, thumb: null,
      };
      drawThumb(page, canvas);
      canvas.width = canvas.height = 1;
      return page;
    } catch (err) {
      if (err && err.key) throw err;
      throw { key: isMemory(err) ? 'memory' : 'invalid' };
    } finally {
      if (bitmap) bitmap.close();
    }
  }
  async function addFiles(files) {
    if (busy) { toast('busyWait'); return; }
    const list = [...files];
    if (!list.length) return;
    let added = 0, skipped = 0, firstError = '';
    const firstNew = pages.length;
    for (const file of list) {
      if (pages.length >= MAX_PAGES) { skipped += 1; firstError = firstError || 'tooMany'; continue; }
      try {
        pages.push(await loadPage(file));
        added += 1;
      } catch (err) {
        skipped += 1;
        firstError = firstError || (err && err.key) || 'invalid';
      }
    }
    if (added) {
      sel = firstNew;
      syncFx();
      renderQueue();
      renderCurrent();
    }
    if (!added) status(firstError || 'invalid', true);
    else if (skipped) status('addedSome', true, { n: added, m: skipped, why: t(firstError) });
    else status(pages.length === 1 ? 'selected' : 'pagesReady', false, { n: pages.length });
    refresh();
  }
  function selectPage(i) {
    if (i < 0 || i >= pages.length) return;
    sel = i;
    syncFx();
    renderQueue();
    renderCurrent();
    renderInfo();
    refresh();
  }
  function removePage(i) {
    if (busy || !pages[i]) return;
    pages.splice(i, 1);
    sel = Math.min(sel, pages.length - 1);
    if (cur.id && !pages.some((p) => p.id === cur.id)) closeBitmap();
    afterPagesChanged();
  }
  function afterPagesChanged() {
    syncFx();
    renderQueue();
    renderCurrent();
    maybeRebuild();
    refresh();
    status(pages.length > 1 ? 'pagesReady' : pages.length ? 'selected' : 'ready', false, { n: pages.length });
  }
  function maybeRebuild() {
    if (!pages.some((p) => p.text)) return;
    if (result.value === lastCombined) combine(); else toast('orderKept');
  }
  function renderQueue() {
    const box = $('queue');
    box.replaceChildren();
    pages.forEach((p, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'cmc-chip ocr-chip';
      b.setAttribute('aria-pressed', String(i === sel));
      if (p.thumb) b.append(p.thumb);
      const label = document.createElement('span');
      label.textContent = `${i + 1}${p.conf != null ? ` · ${Math.round(p.conf)}%` : ''}`;
      b.append(label);
      b.setAttribute('aria-label', `${t('pageN', { n: i + 1 })}${p.conf != null ? `, ${Math.round(p.conf)}%` : ''}`);
      b.addEventListener('click', () => selectPage(i));
      box.append(b);
    });
  }
  function renderInfo() {
    const p = pages[sel];
    $('imageInfo').textContent = p ? t('pageInfo', { i: sel + 1, n: pages.length, name: p.name, w: view.width || p.w, h: view.height || p.h }) : '';
  }
  function syncFx() {
    const p = pages[sel] || { grey: false, contrast: 0, thr: 0 };
    $('grey').checked = p.grey;
    $('contrast').value = p.contrast;
    $('contrastVal').textContent = p.contrast;
    $('thr').value = p.thr;
    $('thrVal').textContent = p.thr ? p.thr : t('thrOff');
  }
  function changeFx(patch) {
    const targets = $('applyAll').checked ? pages : (pages[sel] ? [pages[sel]] : []);
    targets.forEach((p) => Object.assign(p, patch));
    syncFx();
    scheduleRender();
    refresh();
  }

  // ---------- recognition ----------
  // The pinned Tesseract.js 7 worker protocol lets us terminate even during
  // initialization, before the high-level createWorker promise has resolved.
  class OCRWorker {
    constructor(onProgress) {
      this.worker = new Worker(new URL('lib/tesseract/worker.min.js', root));
      this.pending = new Map();
      this.nextJob = 0;
      this.closed = false;
      this.worker.onmessage = ({ data }) => {
        if (data.status === 'progress') { onProgress(data.data); return; }
        const job = this.pending.get(data.jobId);
        if (!job) return;
        this.pending.delete(data.jobId);
        if (data.status === 'resolve') job.resolve(data.data);
        else job.reject(new Error(String(data.data)));
      };
      this.worker.onerror = (event) => {
        event.preventDefault();
        this.close(new Error('Worker could not load'));
      };
    }
    request(action, payload) {
      if (this.closed) return Promise.reject(new Error('Worker closed'));
      const jobId = `ocr-${++this.nextJob}`;
      return new Promise((resolve, reject) => {
        this.pending.set(jobId, { resolve, reject });
        this.worker.postMessage({ workerId: 'local-ocr', jobId, action, payload });
      });
    }
    close(reason = new Error('Cancelled')) {
      if (this.closed) return;
      this.closed = true;
      this.worker.terminate();
      for (const job of this.pending.values()) job.reject(reason);
      this.pending.clear();
    }
  }

  async function pageBytes(page) {
    let bitmap;
    try {
      bitmap = await createImageBitmap(page.blob);
      renderPage(page, bitmap, scratch);
      const blob = await new Promise((resolve) => scratch.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('Image conversion failed (memory)');
      return new Uint8Array(await blob.arrayBuffer());
    } finally {
      if (bitmap) bitmap.close();
      scratch.width = scratch.height = 1;
    }
  }
  function readResult(page, data, language) {
    const paras = [];
    let sum = 0, count = 0;
    for (const block of data.blocks || []) {
      for (const para of block.paragraphs || []) {
        const lines = (para.lines || []).map((l) => (l.words || [])
          .filter((w) => typeof w.text === 'string' && w.text.trim())
          .map((w) => ({ t: w.text.trim(), c: Number.isFinite(w.confidence) ? Math.round(w.confidence) : 0 }))).filter((l) => l.length);
        if (lines.length) paras.push(lines);
        lines.forEach((l) => l.forEach((w) => { sum += w.c; count += 1; }));
      }
    }
    let text = typeof data.text === 'string' ? data.text.trim() : '';
    if (language.includes('chi')) text = tidy(text);
    page.text = text;
    page.paras = paras;
    page.conf = count ? sum / count : (Number.isFinite(data.confidence) ? data.confidence : null);
  }
  function combine() {
    const text = pages.map((p) => p.text).filter(Boolean).join('\n\n');
    if (result.value !== text) {
      if (result.value.trim()) pushUndo();
      result.value = text;
    }
    lastCombined = text;
    refresh();
  }
  async function runRecognition() {
    if (busy || !pages.length) return;
    const language = langSel.value;
    let todo = pages.filter((p) => p.done !== `${sig(p)}`);
    if (!todo.length) todo = pages.slice();
    const token = ++runToken;
    busy = true;
    setProgress(0);
    refresh();
    status('loading');
    let session, watchdog, finished = 0;
    const arm = () => { clearTimeout(watchdog); watchdog = setTimeout(() => session.close(new Error('Recognition timed out')), 180000); };
    let index = 0;
    try {
      session = new OCRWorker((event) => {
        if (active !== session || token !== runToken) return;
        const value = Number.isFinite(event.progress) ? Math.min(1, Math.max(0, event.progress)) : 0;
        if (event.status === 'recognizing text') setProgress(.2 + .8 * ((index + value) / todo.length));
        else if (event.status === 'loading language traineddata') { status('model'); setProgress(.05 + value * .15); }
      });
      active = session;
      arm();
      await session.request('load', { options: { lstmOnly: true, corePath: new URL('lib/tesseract/core/', root).href, logging: false } });
      arm();
      await session.request('loadLanguage', {
        langs: language, options: { langPath: new URL('ai/ocr/lang/', root).href, cacheMethod: 'none', gzip: true, lstmOnly: true },
      });
      arm();
      await session.request('initialize', { langs: language, oem: 1, config: {} });
      for (index = 0; index < todo.length; index += 1) {
        if (token !== runToken) return;
        status('recognizing', false, { i: index + 1, n: todo.length });
        const page = todo[index];
        const sigNow = sig(page);
        const image = await pageBytes(page);
        if (token !== runToken) return;
        arm();
        const data = await session.request('recognize', { image, options: {}, output: { text: true, blocks: true } });
        if (token !== runToken) return;
        readResult(page, data, language);
        page.done = sigNow;
        finished += 1;
        renderQueue();
      }
      setProgress(1);
      histId = null;
      combine();
      upsertHistory();
      status(result.value.trim() ? 'complete' : 'blank');
      if (doubts().length) setTab('proof', true);
    } catch (err) {
      if (token === runToken) {
        const timedOut = /timed out/i.test(String(err && err.message));
        status(timedOut ? 'timeout' : isMemory(err) ? 'memory' : 'failure', true);
        if (finished) { combine(); upsertHistory(); }
      }
    } finally {
      clearTimeout(watchdog);
      if (session) session.close();
      if (token === runToken) {
        active = null;
        busy = false;
        refresh();
      }
    }
  }
  function cancelRun() {
    if (!busy) return;
    const session = active;
    runToken += 1;
    active = null;
    if (session) session.close();
    busy = false;
    setProgress(0);
    const kept = pages.some((p) => p.text && p.done);
    if (kept) { combine(); upsertHistory(); }
    status(kept ? 'cancelledKept' : 'cancelled');
    renderQueue();
    refresh();
  }

  // ---------- text, confidence and proofreading ----------
  function pushUndo() {
    undoStack.push(result.value);
    if (undoStack.length > 20) undoStack.shift();
  }
  function setText(text, toastKey, vars) {
    pushUndo();
    result.value = text;
    refresh();
    scheduleHistory();
    if (toastKey) toast(toastKey, vars);
  }
  function applyOp(fn) {
    const before = result.value;
    if (!before.trim()) { toast('noText'); return; }
    const r = fn(before);
    const after = typeof r === 'string' ? r : r.text;
    if (after === before) { toast('nothing'); return; }
    setText(after, r.n != null ? 'confFixed' : 'cleaned', { n: r.n });
  }
  const level = () => Number($('doubtLevel').value) || 80;
  const isDoubt = (w) => w.c < level() && /[\p{L}\p{N}]/u.test(w.t);
  function doubts() {
    const out = [];
    pages.forEach((p) => (p.paras || []).forEach((lines) => lines.forEach((words) => words.forEach((w) => { if (isDoubt(w)) out.push(w.t); }))));
    return out;
  }
  function confSummary() {
    let sum = 0, count = 0;
    pages.forEach((p) => (p.paras || []).forEach((lines) => lines.forEach((words) => words.forEach((w) => { sum += w.c; count += 1; }))));
    if (!count) {
      const known = pages.filter((p) => p.conf != null);
      return known.length ? known.reduce((a, p) => a + p.conf, 0) / known.length : null;
    }
    return sum / count;
  }
  function renderConf() {
    const box = $('confBox');
    const avg = confSummary();
    box.replaceChildren();
    if (avg == null) { box.hidden = true; return; }
    box.hidden = false;
    const grade = avg >= 85 ? 'good' : avg >= 70 ? 'fair' : 'low';
    const meter = document.createElement('span');
    meter.className = `ocr-meter ${grade}`;
    meter.setAttribute('aria-hidden', 'true');
    const fill = document.createElement('span');
    fill.style.width = `${Math.max(3, Math.min(100, avg))}%`;
    meter.append(fill);
    const label = document.createElement('span');
    const b = document.createElement('b');
    b.textContent = `${Math.round(avg)}%`;
    label.append(`${t('confAvg')} `, b, ` — ${t(grade === 'good' ? 'confGood' : grade === 'fair' ? 'confFair' : 'confLow')}`);
    box.append(meter, label);
    const n = doubts().length;
    const check = document.createElement('span');
    check.textContent = t('confCheck', { n });
    box.append(check);
  }
  function renderProof() {
    const box = $('proof');
    box.replaceChildren();
    const seen = new Map();
    let any = false;
    pages.forEach((p, pi) => {
      if (!p.paras || !p.paras.length) return;
      any = true;
      if (pages.length > 1) { const h = document.createElement('h3'); h.textContent = t('pageN', { n: pi + 1 }); box.append(h); }
      p.paras.forEach((lines) => {
        const para = document.createElement('p');
        let prev = '';
        lines.forEach((words) => words.forEach((w) => {
          const k = seen.get(w.t) || 0;
          seen.set(w.t, k + 1);
          if (prev && !(HANP.test([...prev].pop()) || HANP.test([...w.t][0]))) para.append(' ');
          if (isDoubt(w)) {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = `ocr-doubt${w.c < 50 ? ' bad' : ''}`;
            b.textContent = w.t;
            b.title = `${w.c}%`;
            b.addEventListener('click', () => { setTab('edit'); selectOccurrence(w.t, k); });
            para.append(b);
          } else para.append(w.t);
          prev = w.t;
        }));
        box.append(para);
      });
    });
    if (!any) { const p = document.createElement('p'); p.className = 'cmc-sub'; p.textContent = t('proofEmpty'); box.append(p); }
    else if (!doubts().length) { const p = document.createElement('p'); p.className = 'cmc-ok'; p.textContent = t('proofNone'); box.prepend(p); }
  }
  function select(start, end) {
    result.blur();
    result.setSelectionRange(start, end);
    result.focus();
  }
  function selectOccurrence(word, k) {
    const re = wordRegex(word);
    const found = [...result.value.matchAll(re)];
    if (!found.length) { toast('allChecked'); return; }
    const m = found[Math.min(k, found.length - 1)];
    select(m.index, m.index + m[0].length);
  }
  function nextDoubt() {
    const words = [...new Set(doubts())];
    const val = result.value;
    const from = result.selectionEnd || 0;
    let ahead = null, first = null;
    for (const w of words) {
      for (const m of val.matchAll(wordRegex(w))) {
        if (!first || m.index < first.index) first = { index: m.index, len: m[0].length };
        if (m.index >= from && (!ahead || m.index < ahead.index)) ahead = { index: m.index, len: m[0].length };
      }
    }
    const hit = ahead || first;
    if (!hit) { toast('allChecked'); return; }
    setTab('edit');
    select(hit.index, hit.index + hit.len);
  }
  function setTab(name, quiet) {
    tab = name;
    $('editPane').hidden = name !== 'edit';
    $('proofPane').hidden = name !== 'proof';
    $('tabEdit').setAttribute('aria-pressed', String(name === 'edit'));
    $('tabProof').setAttribute('aria-pressed', String(name === 'proof'));
    if (name === 'proof') renderProof();
    if (!quiet && name === 'edit') result.focus();
  }
  function finder(global) {
    const f = $('find').value;
    if (!f) return null;
    return new RegExp(escapeRe(f), `${global ? 'g' : ''}${$('matchCase').checked ? '' : 'i'}u`);
  }
  function updateFindCount() {
    const re = finder(true);
    const n = re ? (result.value.match(re) || []).length : 0;
    $('findCount').textContent = re ? t('matches', { n }) : '';
  }
  function findNext() {
    const re = finder(true);
    if (!re) return;
    const val = result.value;
    re.lastIndex = result.selectionEnd || 0;
    let m = re.exec(val);
    if (!m) { re.lastIndex = 0; m = re.exec(val); }
    if (!m) { toast('noMatch'); return; }
    select(m.index, m.index + m[0].length);
  }
  function replaceAll() {
    const re = finder(true);
    if (!re) return;
    let n = 0;
    const repl = $('repl').value;
    const out = result.value.replace(re, () => { n += 1; return repl; });
    if (!n) { toast('noMatch'); return; }
    setText(out, 'replaced', { n });
  }

  // ---------- teacher outputs ----------
  function currentWords() { return $('wlOut').value.split('\n').map((w) => w.trim()).filter(Boolean); }
  let cloze = null;
  function renderCloze() {
    const box = $('clOut');
    box.replaceChildren();
    const reveal = $('clReveal').getAttribute('aria-pressed') === 'true';
    if (!cloze) { $('clCount').textContent = ''; return; }
    cloze.segs.forEach((seg) => {
      if (seg.text != null) { box.append(seg.text); return; }
      const span = document.createElement('span');
      span.className = `ocr-gap${reveal ? ' shown' : ''}`;
      span.textContent = reveal ? `(${seg.gap}) ${seg.answer}` : blankText(seg);
      box.append(span);
    });
    if (cloze.bankText) {
      box.append(document.createElement('br'), document.createElement('br'));
      box.append(cloze.bankText);
    }
    $('clCount').textContent = t('clCount', { n: cloze.gaps });
  }
  function clozeParts() {
    const body = cloze.segs.map((s) => (s.text != null ? s.text : blankText(s))).join('');
    const student = cloze.bankText ? `${body}\n\n${cloze.bankText}` : body;
    const key = cloze.answers.map((a, i) => `${i + 1}. ${a}`).join('\n');
    return { student, key };
  }
  function buildCloze() {
    const text = result.value;
    if (!text.trim()) { toast('noText'); return; }
    const out = makeCloze(text, {
      mode: $('clMode').value, n: Math.max(2, Math.min(20, Number($('clN').value) || 7)),
      skip: $('clSkip').checked, keepFirst: $('clFirst').checked, words: currentWords(),
    });
    if (out.error) { cloze = null; renderCloze(); toast(out.error); refresh(); return; }
    const l = guessLang(text);
    out.bankText = $('clBank').checked ? `${tl('bank', l)}${l === 'zh' ? '：' : ': '}${out.bank.join(l === 'zh' ? '　' : ' · ')}` : '';
    out.lang = l;
    cloze = out;
    renderCloze();
    refresh();
  }

  function refresh() {
    const hasPages = pages.length > 0;
    const text = result.value;
    const hasText = Boolean(text.trim());
    imageInput.disabled = cameraInput.disabled = busy;
    $('pick').disabled = $('camera').disabled = busy;
    langSel.disabled = busy;
    $('pageTools').hidden = !hasPages;
    ['rotL', 'rotR', 'remove', 'removeAll'].forEach((id) => { $(id).disabled = busy; });
    $('moveL').disabled = busy || sel <= 0;
    $('moveR').disabled = busy || sel < 0 || sel >= pages.length - 1;
    ['grey', 'contrast', 'thr', 'applyAll', 'auto', 'resetFx'].forEach((id) => { $(id).disabled = busy || !hasPages; });
    recognize.disabled = busy || !hasPages;
    cancel.disabled = !busy;
    const counts = countText(text);
    $('counts').replaceChildren();
    const parts = [[t('stWords'), counts.words], ...(counts.han ? [[t('stHan'), counts.han]] : []), [t('stChars'), counts.chars]];
    parts.forEach(([label, n]) => { const s = document.createElement('span'); const b = document.createElement('b'); b.textContent = String(n); s.append(`${label} `, b); $('counts').append(s); });
    outButtons.forEach((b) => { b.disabled = busy || !hasText || Boolean(b.dataset.target && !embedded); });
    $('transferHint').hidden = embedded;
    ['cJoin', 'cHyph', 'cTidy', 'cConf', 'clearText', 'wlMake', 'clMake'].forEach((id) => { $(id).disabled = busy || !hasText; });
    $('undo').disabled = !undoStack.length;
    const nd = doubts().length;
    $('nextDoubt').disabled = busy || !hasText || !nd;
    $('tabProof').textContent = t('tabProof', { n: nd });
    renderConf();
    if (tab === 'proof') renderProof();
    updateFindCount();
    const hasWords = Boolean($('wlOut').value.trim());
    ['wlCopy', 'wlSave', 'wlPrint'].forEach((id) => { $(id).disabled = !hasWords; });
    $('wlSend').disabled = !hasWords || !embedded;
    const hasCloze = Boolean(cloze);
    ['clReveal', 'clCopy', 'clCopyKey', 'clPrint', 'clPrintKey'].forEach((id) => { $(id).disabled = !hasCloze; });
    $('clSend').disabled = !hasCloze || !embedded;
    $('clNWrap').hidden = $('clMode').value !== 'nth';
  }

  // ---------- history ----------
  const HMAX = 8;
  function histLoad() {
    const list = store.get(HKEY, []);
    return Array.isArray(list) ? list.filter((e) => e && typeof e.text === 'string' && typeof e.id === 'string').slice(0, HMAX) : [];
  }
  function histSave(list) {
    let copy = list.slice();
    while (copy.length) {
      if (store.set(HKEY, copy)) { if (copy.length < list.length) toast('histSaved'); return; }
      copy.pop();
    }
    store.set(HKEY, []);
    toast('histSaved');
  }
  function upsertHistory() {
    clearTimeout(histTimer);
    const text = result.value.slice(0, MAX_TEXT);
    if (text.trim().length < 10) return;
    const list = histLoad();
    const found = histId && list.find((e) => e.id === histId);
    if (found) found.text = text;
    else {
      histId = `h${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
      list.unshift({ id: histId, t: Date.now(), lang: langSel.value, text });
    }
    histSave(list.slice(0, HMAX));
    renderHistory();
  }
  function scheduleHistory() { clearTimeout(histTimer); histTimer = setTimeout(upsertHistory, 1200); }
  function renderHistory() {
    const list = histLoad();
    $('histSummary').textContent = t('histSummary', { n: list.length });
    $('histClear').disabled = !list.length;
    const ul = $('histList');
    ul.replaceChildren();
    if (!list.length) { const li = document.createElement('li'); li.textContent = t('histEmpty'); ul.append(li); return; }
    list.forEach((e) => {
      const li = document.createElement('li');
      const snip = document.createElement('span');
      snip.className = 'ocr-snip';
      snip.append(e.text.replace(/\s+/g, ' ').trim().slice(0, 100));
      const small = document.createElement('small');
      small.textContent = `${new Date(e.t).toLocaleString(zh ? 'zh-CN' : undefined)} · ${t('histChars', { n: e.text.length })}`;
      snip.append(small);
      const open = document.createElement('button');
      open.type = 'button';
      open.className = 'cmc-btn quiet';
      open.textContent = t('histOpen');
      open.addEventListener('click', () => { setTab('edit', true); setText(e.text, 'histOpened'); histId = e.id; });
      const del = document.createElement('button');
      del.type = 'button';
      del.className = 'cmc-btn quiet';
      del.textContent = t('histDelete');
      del.addEventListener('click', () => { histSave(histLoad().filter((x) => x.id !== e.id)); if (histId === e.id) histId = null; renderHistory(); });
      const row = document.createElement('span');
      row.className = 'cmc-bar';
      row.append(open, del);
      li.append(snip, row);
      ul.append(li);
    });
  }

  // ---------- settings ----------
  const persisted = ['wlMax', 'wlMin', 'wlOrder', 'wlNames', 'clMode', 'clN', 'clSkip', 'clFirst', 'clBank', 'doubtLevel'];
  function restoreSettings() {
    if (['eng', 'chi_sim', 'eng+chi_sim'].includes(settings.language)) langSel.value = settings.language;
    else if (zh) langSel.value = 'chi_sim';
    persisted.forEach((id) => {
      const el = $(id);
      const v = settings[id];
      if (v == null) return;
      if (el.type === 'checkbox') el.checked = Boolean(v);
      else if (el.tagName !== 'SELECT' || [...el.options].some((o) => o.value === String(v))) el.value = v;
    });
    if (settings.board) { document.body.classList.add('cmc-board'); $('bigBtn').setAttribute('aria-pressed', 'true'); }
  }
  function rememberSettings() {
    settings.language = langSel.value;
    persisted.forEach((id) => { const el = $(id); settings[id] = el.type === 'checkbox' ? el.checked : el.value; });
    settings.board = document.body.classList.contains('cmc-board');
    saveSettings();
  }

  // ---------- events ----------
  $('pick').addEventListener('click', () => imageInput.click());
  $('camera').addEventListener('click', () => cameraInput.click());
  [imageInput, cameraInput].forEach((input) => input.addEventListener('change', () => { const files = [...input.files]; input.value = ''; addFiles(files); }));
  const drop = $('drop');
  let dragDepth = 0;
  const hasFiles = (e) => e.dataTransfer && [...(e.dataTransfer.types || [])].includes('Files');
  document.addEventListener('dragenter', (e) => { if (hasFiles(e)) { dragDepth += 1; drop.classList.add('over'); } });
  document.addEventListener('dragleave', (e) => { if (hasFiles(e)) { dragDepth = Math.max(0, dragDepth - 1); if (!dragDepth) drop.classList.remove('over'); } });
  document.addEventListener('dragover', (e) => { if (hasFiles(e)) e.preventDefault(); });
  document.addEventListener('drop', (e) => {
    if (!hasFiles(e)) return;
    e.preventDefault();
    dragDepth = 0;
    drop.classList.remove('over');
    addFiles(e.dataTransfer.files);
  });
  document.addEventListener('paste', (e) => {
    const files = [...(e.clipboardData?.files || [])].filter((f) => f.type.startsWith('image/'));
    if (!files.length) return;
    e.preventDefault();
    addFiles(files);
  });

  $('rotL').addEventListener('click', () => { const p = pages[sel]; if (p) { p.rot = (p.rot + 3) % 4; scheduleRender(); renderInfo(); refresh(); } });
  $('rotR').addEventListener('click', () => { const p = pages[sel]; if (p) { p.rot = (p.rot + 1) % 4; scheduleRender(); renderInfo(); refresh(); } });
  $('moveL').addEventListener('click', () => { if (sel > 0) { [pages[sel - 1], pages[sel]] = [pages[sel], pages[sel - 1]]; sel -= 1; renderQueue(); maybeRebuild(); refresh(); } });
  $('moveR').addEventListener('click', () => { if (sel >= 0 && sel < pages.length - 1) { [pages[sel + 1], pages[sel]] = [pages[sel], pages[sel + 1]]; sel += 1; renderQueue(); maybeRebuild(); refresh(); } });
  $('remove').addEventListener('click', () => removePage(sel));
  $('removeAll').addEventListener('click', () => { if (busy) return; pages = []; sel = -1; closeBitmap(); afterPagesChanged(); });
  $('grey').addEventListener('change', () => changeFx({ grey: $('grey').checked }));
  $('contrast').addEventListener('input', () => changeFx({ contrast: Number($('contrast').value) }));
  $('thr').addEventListener('input', () => changeFx({ thr: Number($('thr').value) }));
  $('applyAll').addEventListener('change', () => { if ($('applyAll').checked && pages[sel]) { const { grey, contrast, thr } = pages[sel]; pages.forEach((p) => Object.assign(p, { grey, contrast, thr })); } });
  $('resetFx').addEventListener('click', () => changeFx({ grey: false, contrast: 0, thr: 0 }));
  $('auto').addEventListener('click', async () => {
    const p = pages[sel];
    if (!p || !cur.bitmap) return;
    const ctx = renderPage(p, cur.bitmap, scratch, 0);
    const thr = otsu(ctx, scratch.width, scratch.height);
    scratch.width = scratch.height = 1;
    changeFx({ grey: true, thr });
  });
  langSel.addEventListener('change', () => { rememberSettings(); if (pages.some((p) => p.done)) toast('dupeLang'); });
  recognize.addEventListener('click', runRecognition);
  cancel.addEventListener('click', cancelRun);
  result.addEventListener('input', () => { refresh(); scheduleHistory(); });
  $('tabEdit').addEventListener('click', () => setTab('edit'));
  $('tabProof').addEventListener('click', () => setTab('proof'));
  $('doubtLevel').addEventListener('change', () => { rememberSettings(); refresh(); });
  $('cJoin').addEventListener('click', () => applyOp(joinLines));
  $('cHyph').addEventListener('click', () => applyOp(dehyphenate));
  $('cTidy').addEventListener('click', () => applyOp(tidy));
  $('cConf').addEventListener('click', () => applyOp(fixConfusions));
  $('undo').addEventListener('click', () => { const v = undoStack.pop(); if (v == null) return; result.value = v; refresh(); scheduleHistory(); toast('undone'); });
  $('clearText').addEventListener('click', () => { if (!result.value) return; pushUndo(); result.value = ''; histId = null; refresh(); toast('cleared'); });
  $('nextDoubt').addEventListener('click', nextDoubt);
  $('find').addEventListener('input', updateFindCount);
  $('matchCase').addEventListener('change', updateFindCount);
  $('find').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); findNext(); } });
  $('findNext').addEventListener('click', findNext);
  $('replAll').addEventListener('click', replaceAll);

  $('copy').addEventListener('click', async () => {
    if (!await copyText(result.value, 'copied')) { setTab('edit', true); result.focus(); result.select(); }
  });
  $('save').addEventListener('click', () => { download('recognized-text.txt', result.value); status('saved'); toast('saved'); });
  $('printText').addEventListener('click', () => printOut(tl('prText', guessLang(result.value)), result.value));
  document.querySelectorAll('[data-target]').forEach((button) => button.addEventListener('click', () => send(button.dataset.target, result.value)));

  $('wlMake').addEventListener('click', () => {
    const list = makeWordList(result.value, {
      max: Math.max(3, Math.min(200, Number($('wlMax').value) || 20)), min: Math.max(2, Math.min(12, Number($('wlMin').value) || 4)),
      order: $('wlOrder').value, skipNames: $('wlNames').checked,
    });
    $('wlOut').value = list.join('\n');
    $('wlCount').textContent = list.length ? t('wordsMade', { n: list.length }) : t('wordsNone');
    refresh();
  });
  $('wlOut').addEventListener('input', () => { $('wlCount').textContent = t('wordsMade', { n: currentWords().length }); refresh(); });
  $('wlCopy').addEventListener('click', () => copyText($('wlOut').value, 'listCopied'));
  $('wlSave').addEventListener('click', () => { download('word-list.txt', `${currentWords().join('\n')}\n`); toast('saved'); });
  $('wlPrint').addEventListener('click', () => printOut(tl('prWords', guessLang($('wlOut').value)), currentWords().join('\n')));
  $('wlSend').addEventListener('click', () => send('worksheet', currentWords().join('\n')));

  $('clMake').addEventListener('click', buildCloze);
  $('clMode').addEventListener('change', () => { rememberSettings(); refresh(); });
  ['clN', 'clSkip', 'clFirst', 'clBank', 'wlMax', 'wlMin', 'wlOrder', 'wlNames'].forEach((id) => $(id).addEventListener('change', rememberSettings));
  $('clReveal').addEventListener('click', () => {
    const on = $('clReveal').getAttribute('aria-pressed') !== 'true';
    $('clReveal').setAttribute('aria-pressed', String(on));
    $('clReveal').textContent = t(on ? 'clHide' : 'clReveal');
    renderCloze();
  });
  $('clCopy').addEventListener('click', () => cloze && copyText(clozeParts().student, 'clCopied'));
  $('clCopyKey').addEventListener('click', () => cloze && copyText(clozeParts().key, 'clCopied'));
  $('clPrint').addEventListener('click', () => { if (cloze) printOut(tl('prGap', cloze.lang), `${tl('prName', cloze.lang)}\n\n${clozeParts().student}`); });
  $('clPrintKey').addEventListener('click', () => { if (cloze) printOut(`${tl('prGap', cloze.lang)} — ${tl('prKey', cloze.lang)}`, clozeParts().key); });
  $('clSend').addEventListener('click', () => cloze && send('slides', clozeParts().student));

  $('histClear').addEventListener('click', () => { histId = null; store.set(HKEY, []); renderHistory(); refresh(); toast('histCleared'); });
  $('bigBtn').addEventListener('click', toggleBoard);
  function toggleBoard() {
    const on = document.body.classList.toggle('cmc-board');
    $('bigBtn').setAttribute('aria-pressed', String(on));
    rememberSettings();
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && !recognize.disabled) { e.preventDefault(); runRecognition(); }
    else if (e.key === 'Escape' && busy) cancelRun();
    else if (e.key === 'F8' && !$('nextDoubt').disabled) { e.preventDefault(); nextDoubt(); }
    else if (e.altKey && (e.key === 'b' || e.key === 'B')) { e.preventDefault(); toggleBoard(); }
  });
  window.addEventListener('message', (event) => {
    if (event.source !== window.parent || event.origin !== location.origin) return;
    if (event.data?.type !== 'cmc-language' || !['en', 'zh'].includes(event.data.lang)) return;
    applyLanguage(event.data.lang);
  });
  window.addEventListener('pagehide', (event) => {
    runToken += 1;
    viewToken += 1;
    if (active) active.close();
    active = null;
    if (busy) status('cancelled');
    busy = false;
    clearTimeout(histTimer);
    if (!event.persisted) { closeBitmap(); pages = []; } else refresh();
  });

  restoreSettings();
  applyLanguage(lang);
  renderHistory();
  status('ready');
  setTab('edit', true);
})();
