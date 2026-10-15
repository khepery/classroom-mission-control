(() => {
  'use strict';
  let zh = new URLSearchParams(location.search).get('lang') === 'zh';
  const messages = {
    en: {
      title: 'Photo → Editable Text', privacy: 'All recognition happens on this device. Images and text are never uploaded.',
      imageLabel: 'Choose a PNG, JPG or WebP image (maximum 10 MB)', languageLabel: 'Text language',
      english: 'English', chinese: 'Simplified Chinese', combined: 'English + Simplified Chinese',
      recognize: 'Recognize text', cancel: 'Cancel', resultLabel: 'Editable text — check recognition before using it',
      copy: 'Copy text', save: 'Save .txt', tip: 'Use a clear, upright photo. Large images are reduced to at most 2400 pixels per side. The first recognition may take a moment to load the bundled language model.',
      ready: 'Choose an image to begin.', selected: 'Image ready. Choose its text language, then recognize.',
      loading: 'Loading local OCR engine…', model: 'Loading local language model…', recognizing: 'Recognizing text…',
      complete: 'Recognition complete. You can edit the text below.', blank: 'No text found. Try a clearer, upright image with larger text.',
      cancelled: 'Recognition cancelled.', invalid: 'Choose a valid PNG, JPG or WebP image.',
      size: 'The image must be nonempty and no larger than 10 MB.', dimensions: 'This image is too large to decode safely (maximum 24 million pixels and 12000 pixels per side).',
      failure: 'Recognition failed. Check that the local OCR assets are available and try a smaller, clearer image.',
      copied: 'Text copied.', copyFailed: 'Could not copy automatically. Select the text and copy it manually.',
      saved: 'Text saved.', sent: 'Text sent to the classroom tool.', standalone: 'Open this tool inside Mission Control to send text.',
      preview: 'Selected image preview', progress: 'OCR progress',
    },
    zh: {
      title: '照片 → 可编辑文字', privacy: '文字识别完全在此设备上进行。图片和文字不会上传。',
      imageLabel: '选择 PNG、JPG 或 WebP 图片（最大 10 MB）', languageLabel: '图片文字语言',
      english: '英语', chinese: '简体中文', combined: '英语 + 简体中文',
      recognize: '识别文字', cancel: '取消', resultLabel: '可编辑文字 — 使用前请检查识别结果',
      copy: '复制文字', save: '保存 .txt', tip: '请使用清晰、正向的照片。大图会缩小至每边最多 2400 像素。首次识别需要稍等片刻以加载本地语言模型。',
      ready: '请选择图片。', selected: '图片已就绪。请选择文字语言，然后开始识别。',
      loading: '正在加载本地识别引擎…', model: '正在加载本地语言模型…', recognizing: '正在识别文字…',
      complete: '识别完成。您可以编辑下方文字。', blank: '未找到文字。请尝试更清晰、正向且文字更大的图片。',
      cancelled: '已取消识别。', invalid: '请选择有效的 PNG、JPG 或 WebP 图片。',
      size: '图片不能为空，且不能超过 10 MB。', dimensions: '图片过大，无法安全解码（最多 2400 万像素，每边最多 12000 像素）。',
      failure: '识别失败。请检查本地识别文件是否可用，并尝试更小、更清晰的图片。',
      copied: '文字已复制。', copyFailed: '无法自动复制。请选中文字并手动复制。',
      saved: '文字已保存。', sent: '文字已发送到课堂工具。', standalone: '请在 Mission Control 内打开此工具以发送文字。',
      preview: '所选图片预览', progress: '文字识别进度',
    },
  };
  let t = messages[zh ? 'zh' : 'en'];
  const $ = (id) => document.getElementById(id);
  const imageInput = $('image');
  const result = $('result');
  const preview = $('preview');
  const progress = $('progress');
  const recognize = $('recognize');
  const cancel = $('cancel');
  const actions = [$('copy'), $('save'), ...document.querySelectorAll('[data-target]')];
  const embedded = parent !== window && location.origin !== 'null';
  const root = new URL('../', location.href);
  let imageBlob = null;
  let previewURL = null;
  let selection = 0;
  let active = null;
  let busy = false;
  let lastStatus = 'ready';
  function applyLanguage(lang) {
    zh = lang === 'zh';
    t = messages[zh ? 'zh' : 'en'];
    document.documentElement.lang = zh ? 'zh-CN' : 'en';
    document.title = t.title;
    document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t[el.dataset.i18n]; });
    preview.alt = t.preview;
    progress.setAttribute('aria-label', t.progress);
    $('status').textContent = t[lastStatus];
  }
  applyLanguage(zh ? 'zh' : 'en');
  if (zh) $('language').value = 'chi_sim';
  $('transferHint').hidden = embedded;

  function status(key, error = false) {
    lastStatus = key;
    $('status').textContent = t[key];
    $('status').dataset.error = String(error);
  }
  function update() {
    imageInput.disabled = busy;
    $('language').disabled = busy;
    recognize.disabled = busy || !imageBlob;
    cancel.disabled = !busy;
    actions.forEach((button) => {
      button.disabled = busy || !result.value.trim() || Boolean(button.dataset.target && !embedded);
    });
  }
  function releasePreview() {
    if (previewURL) URL.revokeObjectURL(previewURL);
    previewURL = null;
    preview.removeAttribute('src');
    preview.hidden = true;
  }

  // The pinned Tesseract.js 7 worker protocol lets us terminate even during
  // initialization, before the high-level createWorker promise has resolved.
  class OCRWorker {
    constructor(onProgress) {
      this.worker = new Worker(new URL('lib/tesseract/worker.min.js', root));
      this.pending = new Map();
      this.nextJob = 0;
      this.closed = false;
      this.worker.onmessage = ({ data }) => {
        if (data.status === 'progress') {
          onProgress(data.data);
          return;
        }
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

  imageInput.addEventListener('change', async () => {
    const token = ++selection;
    imageBlob = null;
    releasePreview();
    $('imageInfo').textContent = '';
    progress.value = 0;
    update();
    const file = imageInput.files[0];
    if (!file) { status('ready'); return; }
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) { status('invalid', true); return; }
    if (!file.size || file.size > 10 * 1024 * 1024) { status('size', true); return; }
    let bitmap;
    try {
      bitmap = await createImageBitmap(file);
      if (token !== selection) return;
      if (!bitmap.width || !bitmap.height || bitmap.width > 12000 || bitmap.height > 12000 || bitmap.width * bitmap.height > 24000000) {
        status('dimensions', true);
        return;
      }
      const scale = Math.min(1, 2400 / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const context = canvas.getContext('2d');
      context.fillStyle = '#fff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (token !== selection) return;
      if (!blob) throw new Error('Image conversion failed');
      imageBlob = blob;
      previewURL = URL.createObjectURL(blob);
      preview.src = previewURL;
      preview.hidden = false;
      $('imageInfo').textContent = `${file.name} · ${canvas.width} × ${canvas.height}`;
      status('selected');
    } catch {
      if (token === selection) status('invalid', true);
    } finally {
      if (bitmap) bitmap.close();
      if (token === selection) update();
    }
  });

  recognize.addEventListener('click', async () => {
    if (!imageBlob || busy) return;
    busy = true;
    progress.value = 0;
    update();
    status('loading');
    let session;
    let watchdog;
    try {
      session = new OCRWorker((event) => {
        if (active !== session) return;
        const value = Number.isFinite(event.progress) ? Math.min(1, Math.max(0, event.progress)) : 0;
        if (event.status === 'recognizing text') {
          status('recognizing');
          progress.value = .35 + value * .65;
        } else if (event.status === 'loading language traineddata') {
          status('model');
          progress.value = .15 + value * .2;
        }
      });
      active = session;
      watchdog = setTimeout(() => session.close(new Error('Recognition timed out')), 180000);
      await session.request('load', { options: { lstmOnly: true, corePath: new URL('lib/tesseract/core/', root).href, logging: false } });
      const langs = $('language').value;
      await session.request('loadLanguage', {
        langs, options: { langPath: new URL('ai/ocr/lang/', root).href, cacheMethod: 'none', gzip: true, lstmOnly: true },
      });
      await session.request('initialize', { langs, oem: 1, config: {} });
      const image = new Uint8Array(await imageBlob.arrayBuffer());
      if (active !== session) return;
      const data = await session.request('recognize', { image, options: {}, output: { text: true } });
      if (active !== session) return;
      result.value = typeof data.text === 'string' ? data.text.trim() : '';
      progress.value = 1;
      status(result.value ? 'complete' : 'blank');
    } catch {
      if (!session || active === session) status('failure', true);
    } finally {
      clearTimeout(watchdog);
      if (session) session.close();
      if (active === session || !session) {
        active = null;
        busy = false;
        update();
      }
    }
  });
  cancel.addEventListener('click', () => {
    const session = active;
    active = null;
    if (session) session.close();
    busy = false;
    progress.value = 0;
    status('cancelled');
    update();
  });
  result.addEventListener('input', update);
  $('copy').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(result.value);
      status('copied');
    } catch {
      result.focus();
      result.select();
      status('copyFailed', true);
    }
  });
  $('save').addEventListener('click', () => {
    const url = URL.createObjectURL(new Blob([result.value], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'recognized-text.txt';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    status('saved');
  });
  document.querySelectorAll('[data-target]').forEach((button) => {
    button.addEventListener('click', () => {
      if (!result.value.trim()) return;
      if (parent === window || location.origin === 'null') { status('standalone', true); return; }
      parent.postMessage({ type: 'cmc-ocr-text', target: button.dataset.target, text: result.value }, location.origin);
      status('sent');
    });
  });
  window.addEventListener('message', (event) => {
    if (event.source !== window.parent || event.origin !== location.origin) return;
    if (event.data?.type !== 'cmc-language' || !['en', 'zh'].includes(event.data.lang)) return;
    applyLanguage(event.data.lang);
  });
  window.addEventListener('pagehide', (event) => {
    ++selection;
    if (active) active.close();
    active = null;
    if (busy) status('cancelled');
    busy = false;
    update();
    if (!event.persisted) releasePreview();
  });
  status('ready');
})();
