// Render the shell first, then the cube, then the larger chart catalog.
(() => {
  const afterPaint = () => new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(resolve));
  });

  const firstContentPaint = () => {
    if (!window.PerformanceObserver?.supportedEntryTypes?.includes('paint')) return afterPaint();
    if (performance.getEntriesByName('first-contentful-paint').length) return Promise.resolve();
    return new Promise((resolve) => {
      const observer = new PerformanceObserver((list) => {
        if (list.getEntries().some((entry) => entry.name === 'first-contentful-paint')) finish();
      });
      const finish = () => {
        observer.disconnect();
        window.clearTimeout(deadline);
        resolve();
      };
      // Some browsers suppress paint timing; keep the cube reachable in that case.
      const deadline = window.setTimeout(finish, 1000);
      observer.observe({ type: 'paint', buffered: true });
    });
  };

  const prepareImage = (image) => {
    if (typeof image.decode === 'function') return image.decode().catch(() => {});
    if (image.complete) return Promise.resolve();
    return new Promise((resolve) => {
      image.addEventListener('load', resolve, { once: true });
      image.addEventListener('error', resolve, { once: true });
    });
  };

  async function loadHome() {
    await firstContentPaint();
    await afterPaint();
    // Template contents are inert: cube images are not requested before this point.
    const template = document.querySelector('#home-cube-template');
    if (template) {
      template.replaceWith(template.content.cloneNode(true));
      document.dispatchEvent(new Event('home:cube-ready'));
    }
    // A slow or failed image must not hold up the statistics indefinitely.
    let deadline;
    await Promise.race([
      Promise.all([...document.querySelectorAll('#archive-cube img')].map(prepareImage)),
      new Promise((resolve) => { deadline = window.setTimeout(resolve, 1500); }),
    ]);
    window.clearTimeout(deadline);
    await afterPaint();

    const script = document.createElement('script');
    script.src = './home-archive-viz.js';
    script.async = true;
    script.addEventListener('error', () => {
      document.querySelector('[data-home-date-range]').textContent = '기록을 불러오지 못했습니다';
      document.querySelector('[data-home-chart-tooltip]').textContent = '누적 기록을 불러오지 못했습니다';
    }, { once: true });
    document.head.append(script);
  }

  loadHome();
})();
