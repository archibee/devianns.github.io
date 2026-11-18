// Start the cube first, without making charts wait for its image downloads.
(() => {
  const { yieldToBrowser, defer, loadScript } = window.siteLoading;
  const template = document.querySelector('#home-cube-template');
  if (template) {
    template.replaceWith(template.content.cloneNode(true));
    document.dispatchEvent(new Event('home:cube-ready'));
  }
  yieldToBrowser().then(() => defer(() => {
    loadScript('./home-archive-viz.js', () => {
      document.querySelector('[data-home-date-range]').textContent = '기록을 불러오지 못했습니다';
      document.querySelector('[data-home-chart-tooltip]').textContent = '누적 기록을 불러오지 못했습니다';
    });
  }));
})();
