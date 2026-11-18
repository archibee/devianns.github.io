// Critical HTML/CSS and navigation paint first; independent enhancements follow.
(() => {
  const app = document.currentScript.dataset.pageApp;
  const yieldToBrowser = () => new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(resolve));
  });
  const firstPaint = () => {
    if (!window.PerformanceObserver?.supportedEntryTypes?.includes('paint')) return yieldToBrowser();
    if (performance.getEntriesByName('first-contentful-paint').length) return Promise.resolve();
    return new Promise((resolve) => {
      const finish = () => {
        observer.disconnect();
        clearTimeout(deadline);
        resolve();
      };
      const observer = new PerformanceObserver((list) => {
        if (list.getEntries().some((entry) => entry.name === 'first-contentful-paint')) finish();
      });
      const deadline = setTimeout(finish, 1000);
      observer.observe({ type: 'paint', buffered: true });
    });
  };
  const defer = (task) => {
    if ('requestIdleCallback' in window) window.requestIdleCallback(task, { timeout: 500 });
    else setTimeout(task, 0);
  };
  const loadScript = (src, onError) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    if (onError) script.addEventListener('error', onError, { once: true });
    document.head.append(script);
  };
  const ready = firstPaint().then(yieldToBrowser);
  window.siteLoading = { ready, yieldToBrowser, defer, loadScript };

  ready.then(() => {
    // Content does not depend on the decorative background or external fonts.
    if (app) loadScript(app, () => {
      const status = document.querySelector('[data-project-status], [data-result-count], [data-home-chart-tooltip]');
      if (status) status.textContent = '정보를 불러오지 못했어요. 페이지를 새로고침해 주세요.';
    });
    if (document.body.classList.contains('archive-page')) defer(async () => {
      const image = new Image();
      image.fetchPriority = 'low';
      image.decoding = 'async';
      image.src = './dahlia-images/dahlia-background.jpg';
      try {
        await image.decode();
        document.body.style.setProperty('--archive-background', `url("${image.src}")`);
      } catch { /* Keep the CSS starfield and base color if the image fails. */ }
    });
  });
})();
