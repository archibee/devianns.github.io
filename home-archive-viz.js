(() => {
  const supportedPlatforms = new Set(['soop', 'youtube', 'x', 'naver-cafe']);
  const numberFormat = new Intl.NumberFormat('ko-KR');
  const totalViews = document.querySelector('[data-home-total-views]');
  const totalActivities = document.querySelector('[data-home-total-activities]');
  const chart = document.querySelector('[data-home-date-chart]');
  const range = document.querySelector('[data-home-date-range]');
  const note = document.querySelector('[data-home-date-note]');
  const tooltip = document.querySelector('[data-home-chart-tooltip]');
  if (!totalViews || !totalActivities || !chart || !range || !note || !tooltip) return;

  const viewCount = (record) => {
    if (record.platform === 'naver-cafe') {
      const value = record.listingMetrics?.readCount;
      return Number.isFinite(value) ? value : 0;
    }
    return (Array.isArray(record.metrics) ? record.metrics : []).reduce((sum, metric) => {
      const isViewCount = metric?.type === 'views' || /^(views?|조회수)$/i.test(metric?.label || '');
      return isViewCount && Number.isFinite(metric.value) ? sum + metric.value : sum;
    }, 0);
  };

  const validDate = (value) => {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const parsed = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
  };

  const formatMonth = (value) => value.replace('-', '.');

  const updateTooltip = (bar) => {
    chart.querySelectorAll('.home-date-chart-bar.is-active').forEach((item) => item.classList.remove('is-active'));
    if (!bar) {
      tooltip.textContent = '';
      return;
    }
    bar.classList.add('is-active');
    const entry = JSON.parse(bar.dataset.entry);
    const combined = entry.views + entry.activities;
    tooltip.textContent = `${formatMonth(entry.month)} · 조회 ${numberFormat.format(entry.views)} · 활동 ${numberFormat.format(entry.activities)} · 합계 ${numberFormat.format(combined)}`;
  };

  chart.addEventListener('pointerover', (event) => {
    const bar = event.target.closest('.home-date-chart-bar');
    if (bar && chart.contains(bar)) updateTooltip(bar);
  });
  chart.addEventListener('pointerout', (event) => {
    const nextBar = event.relatedTarget?.closest?.('.home-date-chart-bar');
    if (nextBar && chart.contains(nextBar)) updateTooltip(nextBar);
    else updateTooltip(null);
  });
  chart.addEventListener('pointerdown', (event) => {
    const bar = event.target.closest('.home-date-chart-bar');
    if (bar && chart.contains(bar)) updateTooltip(bar);
  });
  chart.addEventListener('focusin', (event) => {
    const bar = event.target.closest('.home-date-chart-bar');
    if (bar && chart.contains(bar)) updateTooltip(bar);
  });
  chart.addEventListener('focusout', (event) => {
    const nextBar = event.relatedTarget?.closest?.('.home-date-chart-bar');
    if (nextBar && chart.contains(nextBar)) updateTooltip(nextBar);
    else updateTooltip(null);
  });

  fetch('./database/catalog.json')
    .then((response) => {
      if (!response.ok) throw new Error('기록 목록을 불러오지 못했습니다.');
      return response.json();
    })
    .then((records) => {
      const activities = (Array.isArray(records) ? records : []).filter((record) => supportedPlatforms.has(record.platform));
      const months = new Map();
      let views = 0;
      let undated = 0;

      for (const record of activities) {
        const recordViews = viewCount(record);
        views += recordViews;
        if (!validDate(record.publishedAt)) {
          undated += 1;
          continue;
        }
        const month = record.publishedAt.slice(0, 7);
        const entry = months.get(month) || { month, views: 0, activities: 0 };
        entry.views += recordViews;
        entry.activities += 1;
        months.set(month, entry);
      }

      totalViews.textContent = numberFormat.format(views);
      totalActivities.textContent = numberFormat.format(activities.length);

      const monthlyRecords = [...months.values()].sort((a, b) => a.month.localeCompare(b.month));
      const maximum = Math.max(1, ...monthlyRecords.map((month) => month.views + month.activities));
      chart.replaceChildren(...monthlyRecords.map((month) => {
        const combined = month.views + month.activities;
        const bar = document.createElement('div');
        bar.className = 'home-date-chart-bar';
        bar.setAttribute('role', 'listitem');
        bar.setAttribute('tabindex', '0');
        bar.setAttribute('aria-label', `${formatMonth(month.month)}: 조회 ${numberFormat.format(month.views)}, 활동 ${numberFormat.format(month.activities)}, 합계 ${numberFormat.format(combined)}`);
        bar.dataset.entry = JSON.stringify(month);
        bar.style.setProperty('--bar-height', `${Math.max(3, combined / maximum * 100)}%`);
        bar.title = `${formatMonth(month.month)} · 조회 ${numberFormat.format(month.views)} · 활동 ${numberFormat.format(month.activities)} · 합계 ${numberFormat.format(combined)}`;
        return bar;
      }));

      if (monthlyRecords.length) {
        range.textContent = `${formatMonth(monthlyRecords[0].month)}부터 ${formatMonth(monthlyRecords[monthlyRecords.length - 1].month)}까지, ${numberFormat.format(monthlyRecords.length)}개월`;
        note.textContent = `전체 기록의 월별 조회와 활동 합계입니다. 조회 수는 저장된 수치이며 날짜가 확인되지 않은 ${numberFormat.format(undated)}건은 월별 막대에서 제외했습니다.`;
      } else {
        range.textContent = '표시할 월별 기록이 없습니다';
        note.textContent = '날짜가 확인된 기록이 아직 없습니다.';
      }
    })
    .catch(() => {
      totalViews.textContent = '—';
      totalActivities.textContent = '—';
      range.textContent = '기록을 불러오지 못했습니다';
      note.textContent = '';
      tooltip.textContent = '누적 기록을 불러오지 못했습니다.';
    });
})();
