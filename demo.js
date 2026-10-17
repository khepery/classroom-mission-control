(() => {
  'use strict';

  const CLASS_KEY = 'mc_demo_classes';
  const DEMO_KEYS = [
    'mc_demo_classes',
    'mc_demo_retroSuite.lang',
    'mc_demo_tool_geometry_auto',
    'mc_demo_tool_geometry_saved'
  ];
  const roster = ['Alex Chen', 'Maya Patel', 'Sam Rivera', 'Jordan Lee', 'Taylor Okafor', 'Casey Morgan'];
  const allowedLanguages = ['en', 'zh', 'ru'];
  const params = new URLSearchParams(location.search);
  const requestedLanguage = allowedLanguages.includes(params.get('lang')) ? params.get('lang') : null;
  const scenario = params.get('scenario');
  const $ = id => document.getElementById(id);
  const tr = text => window.RSLang ? window.RSLang.t(text) : text;
  const localHost = location.protocol === 'file:' ||
    ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);

  let activityFrame = null;
  let activityPromise = null;
  let activityResolve = null;
  let activityReject = null;
  let activityTimer = null;
  let activityLoaded = false;
  let activityMessage = null;
  let tour = null;
  let tourStartId = 0;
  let restoreFocusOnDestroy = false;
  let tourWasActive = false;

  function setStatus(text) { $('demo-status').textContent = tr(text); }
  function currentLanguage() {
    const value = window.RSLang && window.RSLang.current;
    return allowedLanguages.includes(value) ? value : 'en';
  }
  function geometryLanguage() { return currentLanguage() === 'zh' ? 'zh' : 'en'; }
  function seedClass() {
    try {
      localStorage.setItem(CLASS_KEY, JSON.stringify({
        active: 'demo-rivera-y8',
        list: [{
          id: 'demo-rivera-y8',
          name: 'Ms. Rivera’s Year 8 Science',
          names: roster.slice()
        }]
      }));
      return true;
    } catch (error) {
      return false;
    }
  }
  function clearDemoStorage() {
    try {
      DEMO_KEYS.forEach(key => localStorage.removeItem(key));
      return true;
    } catch (error) {
      return false;
    }
  }
  function sendActivityLanguage() {
    if (!activityFrame || !activityFrame.contentWindow) return;
    activityFrame.contentWindow.postMessage({
      type: 'cmc-language',
      lang: geometryLanguage()
    }, location.origin);
  }
  function finishActivity(status, error) {
    if (!activityPromise) return;
    clearTimeout(activityTimer);
    activityTimer = null;
    const resolve = activityResolve, reject = activityReject;
    activityResolve = null;
    activityReject = null;
    activityPromise = null;
    if (status === 'ready') {
      sendActivityLanguage();
      resolve(activityFrame);
    } else {
      reject(error || new Error('unavailable'));
    }
  }
  function settleActivityWhenReady() {
    if (!activityPromise || !activityLoaded || !activityMessage) return;
    if (activityMessage.status === 'ready') finishActivity('ready');
    else finishActivity('unavailable', new Error('unavailable'));
  }
  function ensureActivity() {
    if (activityFrame && activityFrame.isConnected && activityMessage && activityMessage.status === 'ready') {
      return Promise.resolve(activityFrame);
    }
    if (activityPromise) return activityPromise;

    $('activity-host').hidden = false;
    $('activity-placeholder').hidden = true;
    activityMessage = null;
    activityLoaded = false;
    activityFrame = document.createElement('iframe');
    activityFrame.id = 'geometry-frame';
    activityFrame.title = tr('Interactive Geometry Playground demo');
    activityFrame.setAttribute('allow', "camera 'none'; microphone 'none'; geolocation 'none'");
    activityFrame.addEventListener('load', () => {
      activityLoaded = true;
      settleActivityWhenReady();
    }, { once: true });
    const url = new URL('tools/geometry.html', document.baseURI);
    url.searchParams.set('demo', '1');
    url.searchParams.set('lang', geometryLanguage());
    activityPromise = new Promise((resolve, reject) => {
      activityResolve = resolve;
      activityReject = reject;
      activityTimer = setTimeout(() => finishActivity('unavailable', new Error('timeout')), 12000);
    });
    $('activity-host').replaceChildren(activityFrame);
    activityFrame.src = url.href;
    return activityPromise;
  }
  function closeActivity() {
    if (activityTimer) clearTimeout(activityTimer);
    activityTimer = null;
    if (activityReject) activityReject(new Error('cancelled'));
    activityPromise = null;
    activityResolve = null;
    activityReject = null;
    activityLoaded = false;
    activityMessage = null;
    if (activityFrame) {
      activityFrame.src = 'about:blank';
      activityFrame.remove();
    }
    activityFrame = null;
    $('activity-host').replaceChildren();
    $('activity-host').hidden = true;
    $('activity-placeholder').hidden = false;
  }
  function receiveActivityMessage(event) {
    if (!activityFrame || event.origin !== location.origin ||
        event.source !== activityFrame.contentWindow) return;
    const data = event.data;
    if (!data || typeof data !== 'object' || Array.isArray(data) || data.version !== 1) return;
    if (data.type === 'cmc-demo-ready' && ['ready', 'unavailable'].includes(data.status)) {
      activityMessage = { status: data.status };
      settleActivityWhenReady();
    } else if (data.type === 'cmc-demo-escape') {
      if (tour && tour.isActive()) {
        restoreFocusOnDestroy = true;
        tour.destroy();
      }
    }
  }
  function demoSteps(activityAvailable) {
    const escape = value => String(tr(value)).replace(/[&<>"']/g, character => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[character]));
    const makePopover = (title, description, side) => ({
      title: escape(title),
      description: escape(description),
      side,
      showProgress: true,
      progressText: escape('Step {{current}} of {{total}}'),
      nextBtnText: escape('Next'),
      prevBtnText: escape('Back'),
      doneBtnText: escape('Done'),
      closeBtnLabel: escape('Skip tour'),
      onPopoverRender: (popover, options) => {
        popover.closeButton.textContent = tr('Skip tour');
        const progress = tr('Step {{current}} of {{total}}')
          .replace('{{current}}', String((options.index || 0) + 1))
          .replace('{{total}}', String(demoSteps(activityMessage && activityMessage.status === 'ready').length));
        setStatus(progress);
      }
    });
    return [
      { element: '#demo-intro', popover: makePopover('Welcome to Mission Control', 'This is a fictional, local demo. Explore the short tour or skip it at any time; no account is needed.', 'bottom') },
      { element: '#class-card', popover: makePopover('A class is ready to go', 'This sample roster is fictional and separate from your real class lists.', 'right') },
      {
        element: activityAvailable ? '#geometry-frame' : '#activity-card',
        popover: makePopover(
          'Try a real classroom activity',
          activityAvailable
            ? 'This is the real Geometry Playground running as an embedded tool. Move points, explore activities, and use the demo roster; saved state stays in the demo namespace.'
            : 'The activity could not load here. You can retry it with Open Geometry Playground; the rest of this demo remains available.',
          'top'
        )
      },
      { element: '#teacher-card', popover: makePopover('Teacher-ready controls', 'Try Projector, load a prepared task, or use Pick a student. The embedded activity uses only this fictional roster.', 'left') },
      { element: '#participation-card', popover: makePopover('Phone and QR participation', 'A live class can use a QR link to join. This explanation does not create a room, contact an API, or require another device. The share control links only to this demo page.', 'left') },
      { element: '#demo-controls', popover: makePopover('Your demo, your pace', 'Explore Geometry Playground freely, change language, or restart to reseed the fictional class and clear demo state.', 'bottom') }
    ];
  }
  function stopTour() {
    tourStartId++;
    const active = tour;
    tour = null;
    restoreFocusOnDestroy = false;
    if (active && active.isActive()) active.destroy();
  }
  async function startTour(at = 0) {
    stopTour();
    const request = ++tourStartId;
    if (!window.driver || !window.driver.js || typeof window.driver.js.driver !== 'function') {
      setStatus('Guided tour could not load. Use Explore freely to continue.');
      return;
    }
    setStatus('Preparing the interactive activity for the tour…');
    let available = false;
    try {
      await ensureActivity();
      available = true;
    } catch (error) {
      if (error.message === 'cancelled') return;
    }
    if (request !== tourStartId) return;
    $('start-tour').focus();
    restoreFocusOnDestroy = true;
    let instance;
    instance = window.driver.js.driver({
      steps: demoSteps(available),
      animate: !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 220,
      allowClose: true,
      allowScroll: true,
      allowKeyboardControl: true,
      overlayClickBehavior: 'none',
      skipMissingElement: true,
      waitForElement: 1800,
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      popoverClass: 'demo-tour',
      progressText: tr('Step {{current}} of {{total}}'),
      nextBtnText: tr('Next'),
      prevBtnText: tr('Back'),
      doneBtnText: tr('Done'),
      closeBtnLabel: tr('Skip tour'),
      onDestroyed: () => {
        if (tour === instance) tour = null;
        setStatus('Tour ended. Explore freely or restart the demo.');
      }
    });
    tour = instance;
    instance.drive(Math.min(at, demoSteps(available).length - 1));
  }
  function restartDemo() {
    stopTour();
    closeActivity();
    const cleared = clearDemoStorage();
    const seeded = seedClass();
    $('share-url').value = '';
    $('share-url').hidden = true;
    setStatus(cleared && seeded
      ? 'Demo restarted. Fictional class restored; demo-only data cleared.'
      : 'Browser storage is unavailable. Demo remains in memory; normal classroom storage was not used.');
    $('start-tour').focus();
  }
  function shareableUrl() {
    const url = new URL('demo.html', document.baseURI);
    url.searchParams.set('scenario', 'classroom');
    url.searchParams.set('lang', currentLanguage());
    return url.href;
  }
  async function copyShareLink() {
    if (localHost) {
      setStatus('This local demo link only works on this computer. Host demo.html before sharing it.');
      return;
    }
    const text = `${tr('Try Classroom Mission Control’s interactive demo:')} ${shareableUrl()}`;
    try {
      if (!navigator.clipboard || !navigator.clipboard.writeText) throw new Error('clipboard');
      await navigator.clipboard.writeText(text);
      $('share-url').hidden = true;
      setStatus('Demo link copied.');
    } catch (error) {
      const output = $('share-url');
      output.value = text;
      output.hidden = false;
      output.focus();
      output.select();
      let copied = false;
      try { copied = document.execCommand('copy'); } catch (copyError) {}
      setStatus(copied
        ? 'Demo link copied.'
        : 'Clipboard access was denied. The demo link is selected below; copy it manually.');
    }
  }
  function languageChanged() {
    const lang = currentLanguage();
    const group = document.querySelector('#lang-slot [role="group"]');
    if (group) group.setAttribute('aria-label', tr('Language'));
    document.title = tr('Classroom Mission Control demo');
    if (activityFrame) {
      activityFrame.title = tr('Interactive Geometry Playground demo');
      sendActivityLanguage();
    }
    if (tour && tour.isActive()) {
      const index = tour.getActiveIndex() || 0;
      const old = tour;
      tour = null;
      restoreFocusOnDestroy = false;
      old.destroy();
      startTour(index);
    }
  }

  const tourStateObserver = new MutationObserver(() => {
    const active = document.body.classList.contains('driver-active');
    if (active) {
      tourWasActive = true;
      return;
    }
    if (!tourWasActive) return;
    tourWasActive = false;
    if (!restoreFocusOnDestroy) return;
    restoreFocusOnDestroy = false;
    setStatus('Tour ended. Explore freely or restart the demo.');
    if (!tour || !tour.isActive()) {
      tour = null;
      $('start-tour').focus();
    }
  });
  tourStateObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });

  window.addEventListener('message', receiveActivityMessage);
  window.addEventListener('rslangchange', languageChanged);
  $('lang-slot').append(window.RSLang.makeSwitch());
  $('start-tour').addEventListener('click', () => startTour());
  $('explore').addEventListener('click', () => setStatus('Explore freely. Open Geometry Playground whenever you are ready.'));
  $('open-activity').addEventListener('click', () => {
    ensureActivity().then(frame => {
      setStatus('Geometry Playground is ready. Use its controls to explore the activity.');
      frame.focus();
    }).catch(error => {
      if (error.message !== 'cancelled') setStatus('The interactive activity could not load. The other demo cards are still available.');
    });
  });
  $('restart').addEventListener('click', restartDemo);
  $('copy-link').addEventListener('click', copyShareLink);

  if (scenario && scenario !== 'classroom') setStatus('Unknown demo scenario. The fictional classroom scenario was opened.');
  if (requestedLanguage && window.RSLang && requestedLanguage !== window.RSLang.current) window.RSLang.set(requestedLanguage);
  if (!seedClass()) {
    setStatus('Browser storage is unavailable. Demo changes remain in memory; normal classroom storage was not used.');
  }
})();
