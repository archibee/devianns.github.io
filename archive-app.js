(() => {
  const view = document.body.dataset.view;
  if (!view) return;

  const number = (value) => new Intl.NumberFormat('ko-KR').format(Number(value) || 0);
  const text = (value) => String(value ?? '').trim();
  const byDateDescending = (a, b) => {
    const left = a.publishedAt || '';
    const right = b.publishedAt || '';
    if (left !== right) return right.localeCompare(left);
    return String(b.publishedTimeRaw || '').localeCompare(String(a.publishedTimeRaw || ''));
  };
  const platformName = { soop: 'SOOP', youtube: 'YouTube', x: 'X' };
  const typeName = { catch: '캐치', clip: '클립', normal: 'VOD', short: 'Shorts', video: '동영상', post: '게시물' };
  const metricName = { views: '조회수', likes: '좋아요', replies: '답글', reposts: '재게시', quotes: '인용' };
  const make = (tag, className, value) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (value !== undefined && value !== null) node.textContent = value;
    return node;
  };
  const getTags = (record) => Array.isArray(record.tags) ? record.tags.filter(Boolean) : [];
  const getViews = (record) => record.latestListingObservation?.viewsRaw || record.metrics?.find((metric) => metric.label === 'views' || metric.type === 'views')?.rawValue || null;
  const getRecordText = (record) => [record.title, record.text, ...getTags(record)].filter(Boolean).join(' ').toLocaleLowerCase('ko');
  const titleOf = (record) => text(record.title || record.text || '제목 정보 없음');
  const dateOf = (record) => {
    const value = record.publishedAt || record.latestListingObservation?.relativePublishedTimeRaw || record.publishedTimeRaw;
    const match = value && value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    return match ? `${match[1]}. ${Number(match[2])}. ${Number(match[3])}.` : value || '날짜 미상';
  };

  function metricValue(record, label) {
    const metric = (record.metrics || []).find((item) => item.label === label);
    if (!metric) return null;
    if (metric.rawValue !== undefined && metric.rawValue !== null) return metric.rawValue;
    if (metric.value !== undefined && metric.value !== null) return number(metric.value);
    return null;
  }

  function renderRecord(record, listStyle = false) {
    const article = make('article', `record-card${listStyle ? ' record-card-list' : ''}`);
    const top = make('div', 'record-card-top');
    top.append(make('span', `platform-pill platform-${record.platform}`, platformName[record.platform] || text(record.platform)));
    top.append(make('span', 'type-pill', typeName[record.contentType] || text(record.contentType)));
    const date = make('time', 'record-date', dateOf(record));
    if (record.publishedAt) date.dateTime = record.publishedAt;
    top.append(date);
    article.append(top);

    const heading = make('h3', 'record-title', titleOf(record));
    article.append(heading);
    if (record.text && record.title && record.text !== record.title) article.append(make('p', 'record-body', record.text));

    const observation = record.latestListingObservation;
    const values = [];
    if (getViews(record)) values.push(['조회수', getViews(record)]);
    for (const metric of record.metrics || []) {
      if (metric.label === 'views' || metric.type === 'views' || !metric.label) continue;
      const value = metric.rawValue ?? (metric.value !== null && metric.value !== undefined ? number(metric.value) : null);
      if (value !== null) values.push([metricName[metric.label] || metric.label, value]);
    }
    if (observation?.durationRaw) values.push(['길이', observation.durationRaw]);
    else if (record.durationRaw) values.push(['길이', record.durationRaw]);
    if (record.engagement) {
      if (record.engagement.likes) values.push(['좋아요', number(record.engagement.likes)]);
      if (record.engagement.comments) values.push(['댓글', number(record.engagement.comments)]);
    }
    if (values.length) {
      const metricRow = make('div', 'record-metrics');
      for (const [label, value] of values.slice(0, 4)) {
        const item = make('span', 'record-metric');
        item.append(make('small', '', label), make('b', '', String(value)));
        metricRow.append(item);
      }
      article.append(metricRow);
    }

    const tags = getTags(record).slice(0, 5);
    if (tags.length) {
      const tagRow = make('div', 'record-tags');
      for (const tag of tags) tagRow.append(make('span', 'record-tag', tag.startsWith('#') ? tag : `#${tag}`));
      article.append(tagRow);
    }

    const footer = make('div', 'record-card-footer');
    if (record.url) {
      const link = make('a', 'record-open', '원본에서 보기 ↗');
      link.href = record.url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.setAttribute('aria-label', `${titleOf(record)} 원본에서 보기`);
      footer.append(link);
    } else {
      footer.append(make('span', 'record-no-link', '원본 링크 없음'));
    }
    article.append(footer);
    return article;
  }

  function renderFeed(records, list, status, loadButton, listStyle = false) {
    let shown = 24;
    const draw = () => {
      list.replaceChildren();
      const slice = records.slice(0, shown);
      const fragment = document.createDocumentFragment();
      for (const record of slice) fragment.append(renderRecord(record, listStyle));
      if (!slice.length) fragment.append(make('p', 'empty-message', '찾는 기록이 없어요. 다른 단어로 검색해 보세요.'));
      list.append(fragment);
      if (status) status.textContent = `${number(records.length)}개 중 ${number(slice.length)}개 표시`;
      if (loadButton) loadButton.hidden = shown >= records.length;
    };
    draw();
    if (loadButton) loadButton.onclick = () => { shown += 24; draw(); };
    return draw;
  }

  function renderTagCloud(records, target) {
    if (!target) return;
    const tally = new Map();
    for (const record of records) for (const tag of getTags(record)) tally.set(tag, (tally.get(tag) || 0) + 1);
    target.replaceChildren();
    for (const [tag, count] of [...tally.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12)) {
      const button = make('button', 'cloud-tag', `#${tag.replace(/^#/, '')} · ${number(count)}`);
      button.type = 'button';
      button.dataset.tagQuery = tag.replace(/^#/, '');
      target.append(button);
    }
  }

  function statCard(label, value, note) {
    const card = make('article', 'stat-card');
    card.append(make('span', 'stat-label', label), make('strong', 'stat-value', value), make('small', 'stat-note', note));
    return card;
  }

  function renderCollectionStats(target, records, kind) {
    if (!target) return;
    const dates = records.map((item) => item.publishedAt).filter(Boolean).sort();
    let cards = [];
    if (kind === 'soop') {
      cards = [statCard('전체 기록', number(records.length), '캐치·클립·VOD'), statCard('캐치', number(records.filter((item) => item.contentType === 'catch').length), '짧은 장면 기록'), statCard('클립·VOD', number(records.filter((item) => ['clip', 'normal'].includes(item.contentType)).length), '방송국 영상 목록'), statCard('원본 링크', number(records.filter((item) => item.url).length), 'SOOP에서 확인 가능')];
    } else if (kind === 'youtube') {
      cards = [statCard('Shorts', number(records.filter((item) => item.contentType === 'short').length), '채널의 세로 영상'), statCard('동영상', number(records.filter((item) => item.contentType === 'video').length), '채널에 올라온 영상'), statCard('원본 링크', number(records.filter((item) => item.url).length), 'YouTube에서 볼 수 있어요'), statCard('기록 기간', dates.length ? `${dates[0].slice(0, 4)} — ${dates[dates.length - 1].slice(0, 4)}` : '날짜 미상', '날짜가 확인된 기록')];
    } else if (kind === 'x') {
      cards = [statCard('게시물', number(records.length), '모아 둔 기록'), statCard('기록 기간', dates.length ? `${dates[0].slice(0, 4)} — ${dates[dates.length - 1].slice(0, 4)}` : '날짜 미상', '날짜가 확인된 게시물'), statCard('원본 링크', number(records.filter((item) => item.url).length), 'X에서 볼 수 있어요'), statCard('본문이 있는 게시물', number(records.filter((item) => item.text).length), '글 내용을 함께 볼 수 있어요')];
    } else if (kind === 'media') {
      cards = [statCard('클립', number(records.filter((item) => item.contentType === 'clip').length), 'SOOP에서 볼 수 있어요'), statCard('다시보기', number(records.filter((item) => item.contentType === 'normal').length), 'SOOP에서 볼 수 있어요'), statCard('원본 링크', number(records.filter((item) => item.url).length), '바로 이동할 수 있어요'), statCard('기록 기간', dates.length ? `${dates[0].slice(0, 4)} — ${dates[dates.length - 1].slice(0, 4)}` : '날짜 미상', '날짜가 확인된 기록')];
    } else {
      cards = [statCard('전체 기록', number(records.length), '현재 모아 둔 활동'), statCard('SOOP 캐치', number(records.filter((item) => item.platform === 'soop').length), 'SOOP에 남긴 기록'), statCard('YouTube', number(records.filter((item) => item.platform === 'youtube').length), '영상 기록'), statCard('X 게시물', number(records.filter((item) => item.platform === 'x').length), '게시물 기록')];
    }
    target.replaceChildren(...cards);
  }

  function monthKey(date) { return date && /^\d{4}-\d{2}/.test(date) ? date.slice(0, 7) : null; }
  function renderMeasureBars(target, items, formatValue = (value) => number(value)) {
    if (!target) return;
    target.replaceChildren();
    const max = Math.max(1, ...items.map((item) => item.value));
    target.setAttribute('role', 'list');
    for (const item of items) {
      const row = make('div', 'viz-row');
      row.setAttribute('role', 'listitem');
      const label = make('span', 'viz-label', item.label);
      const track = make('span', 'viz-track');
      track.setAttribute('aria-hidden', 'true');
      const fill = make('span', 'viz-fill');
      const percent = item.value ? Math.max(1, item.value / max * 100) : 0;
      fill.style.setProperty('--viz-width', `${percent}%`);
      track.append(fill);
      const value = make('strong', 'viz-value', formatValue(item.value, item));
      row.append(label, track, value);
      target.append(row);
    }
  }

  function renderPlatformDistribution(records) {
    const target = document.querySelector('[data-platform-distribution]');
    if (!target) return;
    const total = records.length;
    const labels = { soop: 'SOOP', youtube: 'YouTube', x: 'X' };
    const counts = ['soop', 'youtube', 'x'].map((platform) => ({
      label: labels[platform],
      value: records.filter((record) => record.platform === platform).length
    }));
    renderMeasureBars(target, counts, (value) => `${number(value)}개 · ${total ? (value / total * 100).toFixed(1) : '0.0'}%`);
  }

  function renderTypeDistribution(records, targetSelector, types) {
    const target = document.querySelector(targetSelector);
    if (!target) return;
    const total = records.length;
    const counts = types.map(({ type, label }) => ({
      label,
      value: records.filter((record) => record.contentType === type).length
    }));
    renderMeasureBars(target, counts, (value) => `${number(value)}개 · ${total ? (value / total * 100).toFixed(1) : '0.0'}%`);
  }

  function renderCatchRhythm(records) {
    const weekdayTarget = document.querySelector('[data-catch-weekdays]');
    const hourTarget = document.querySelector('[data-catch-hours]');
    if (!weekdayTarget && !hourTarget) return;
    const weekdays = ['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일'];
    const weekdayCounts = new Map(weekdays.map((day) => [day, 0]));
    const hourLabels = ['00–05시', '06–11시', '12–17시', '18–23시'];
    const hourCounts = new Map(hourLabels.map((label) => [label, 0]));
    for (const record of records) {
      if (record.publishedAt) {
        const date = new Date(`${record.publishedAt}T00:00:00Z`);
        const index = (date.getUTCDay() + 6) % 7;
        weekdayCounts.set(weekdays[index], weekdayCounts.get(weekdays[index]) + 1);
      }
      const match = String(record.publishedTimeRaw || '').match(/\b(\d{2}):\d{2}/);
      if (match) {
        const hour = Number(match[1]);
        const index = hour < 6 ? 0 : hour < 12 ? 1 : hour < 18 ? 2 : 3;
        hourCounts.set(hourLabels[index], hourCounts.get(hourLabels[index]) + 1);
      }
    }
    renderMeasureBars(weekdayTarget, weekdays.map((label) => ({ label, value: weekdayCounts.get(label) })));
    renderMeasureBars(hourTarget, hourLabels.map((label) => ({ label, value: hourCounts.get(label) })));
  }

  function viewCount(record) {
    const metric = record.metrics?.find((item) => item.label === 'views' || item.type === 'views');
    if (Number.isFinite(metric?.value)) return Number(metric.value);
    const raw = getViews(record);
    if (!raw) return null;
    const match = String(raw).replace(/,/g, '').match(/[\d.]+/);
    if (!match) return null;
    const multiplier = /천/.test(raw) ? 1000 : /만/.test(raw) ? 10000 : 1;
    return Number(match[0]) * multiplier;
  }

  function renderViewRanking(records, platform) {
    const target = document.querySelector(`[data-view-ranking="${platform}"]`);
    if (!target) return;
    const ranked = records
      .filter((record) => viewCount(record) !== null)
      .sort((a, b) => viewCount(b) - viewCount(a))
      .slice(0, 5);
    target.replaceChildren();
    if (!ranked.length) {
      target.append(make('p', 'empty-message', '조회수를 확인할 수 있는 기록이 아직 없어요.'));
      return;
    }
    const max = Math.max(1, ...ranked.map(viewCount));
    ranked.forEach((record, index) => {
      const row = make('article', 'viz-rank-row');
      row.append(make('span', 'viz-rank-number', String(index + 1).padStart(2, '0')));
      const content = make('div', 'viz-rank-content');
      const title = make('p', 'viz-rank-title', titleOf(record));
      title.title = titleOf(record);
      const track = make('span', 'viz-track');
      track.setAttribute('aria-hidden', 'true');
      const fill = make('span', 'viz-fill');
      fill.style.setProperty('--viz-width', `${Math.max(2, viewCount(record) / max * 100)}%`);
      track.append(fill);
      content.append(title, track);
      const metric = getViews(record) || `${number(viewCount(record))}회`;
      row.append(content, make('strong', 'viz-value', metric));
      target.append(row);
    });
  }

  function renderMonthlyChart(records, targetSelector = '[data-monthly-chart]', rangeSelector = '[data-month-range]', limit = 18) {
    const target = document.querySelector(targetSelector);
    if (!target) return;
    const counts = new Map();
    for (const record of records) {
      const month = monthKey(record.publishedAt);
      if (month) counts.set(month, (counts.get(month) || 0) + 1);
    }
    const observedMonths = [...counts.keys()].sort();
    const months = [];
    if (observedMonths.length) {
      const first = observedMonths[Math.max(0, observedMonths.length - limit)];
      const last = observedMonths[observedMonths.length - 1];
      const cursor = new Date(`${first}-01T00:00:00Z`);
      const end = new Date(`${last}-01T00:00:00Z`);
      while (cursor <= end) {
        months.push(`${cursor.getUTCFullYear()}-${String(cursor.getUTCMonth() + 1).padStart(2, '0')}`);
        cursor.setUTCMonth(cursor.getUTCMonth() + 1);
      }
    }
    const max = Math.max(1, ...months.map((month) => counts.get(month)));
    target.replaceChildren();
    target.style.setProperty('--chart-columns', String(months.length));
    for (const month of months) {
      const value = counts.get(month) || 0;
      const column = make('div', 'chart-column');
      column.setAttribute('aria-label', `${month} ${value}개`);
      const bar = make('span', 'chart-bar');
      bar.style.setProperty('--bar-height', `${value ? Math.max(5, value / max * 100) : 1}%`);
      bar.title = `${month}: ${number(value)}개`;
      column.append(bar, make('small', 'chart-value', number(value)), make('small', 'chart-month', month.slice(2).replace('-', '.')));
      target.append(column);
    }
    const range = document.querySelector(rangeSelector);
    if (range && months.length) range.textContent = `${months[0].replace('-', '.')} — ${months[months.length - 1].replace('-', '.')}`;
    if (!months.length) target.append(make('p', 'empty-message', '날짜를 확인할 수 있는 기록이 아직 없어요.'));
  }

  function insightCard(index, label, heading, description, value, detail) {
    const card = make('article', 'insight-card');
    card.append(make('span', 'insight-index', index), make('p', 'micro-label', label), make('h3', '', heading), make('p', 'insight-description', description), make('strong', 'insight-value', value), make('small', 'insight-detail', detail));
    return card;
  }

  function renderInsights(records) {
    const target = document.querySelector('[data-insights-grid]') || document.querySelector('[data-catch-insights]');
    if (!target) return;
    const apiCatches = records.filter((item) => item.platform === 'soop' && item.contentType === 'catch' && item.sourceBatch === 'soop-public-catch-api-2026-10-31');
    const titleCounts = new Map();
    for (const item of apiCatches) titleCounts.set(item.title, (titleCounts.get(item.title) || 0) + 1);
    const topTitle = [...titleCounts.entries()].sort((a, b) => b[1] - a[1])[0] || ['아직 반복 제목이 없습니다', 0];
    const tagCounts = new Map();
    for (const item of apiCatches) for (const tag of getTags(item)) tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    const topCatchTag = [...tagCounts.entries()].sort((a, b) => b[1] - a[1])[0] || ['태그 없음', 0];
    const youtube = records.filter((item) => item.platform === 'youtube');
    const ytTags = new Map();
    for (const item of youtube) for (const tag of getTags(item)) {
      const cleanTag = tag.replace(/^#+/, '');
      ytTags.set(cleanTag, (ytTags.get(cleanTag) || 0) + 1);
    }
    const topYtTag = [...ytTags.entries()].sort((a, b) => b[1] - a[1])[0] || ['태그 없음', 0];
    const xTags = new Map();
    for (const item of records.filter((record) => record.platform === 'x')) for (const tag of getTags(item)) xTags.set(tag.replace(/^#/, ''), (xTags.get(tag.replace(/^#/, '')) || 0) + 1);
    const topXTag = [...xTags.entries()].sort((a, b) => b[1] - a[1])[0] || ['태그 없음', 0];
    const cards = [
      insightCard('01', 'SOOP 캐치', '같은 제목으로 올라온 캐치', '여러 번 올라온 기록이에요.', `${number(topTitle[1])}회`, topTitle[0]),
      insightCard('02', 'SOOP 캐치', '자주 쓰인 태그', '캐치에서 많이 보인 태그예요.', `#${topCatchTag[0]} · ${number(topCatchTag[1])}`, '태그가 포함된 기록'),
      insightCard('03', 'YouTube', 'Shorts와 동영상', '현재 모아 둔 영상의 종류예요.', `${youtube.filter((item) => item.contentType === 'short').length} / ${youtube.filter((item) => item.contentType === 'video').length}`, `Shorts / 동영상 · 자주 쓰인 태그 #${topYtTag[0]}`),
      insightCard('04', 'X 게시물', '자주 보인 해시태그', '게시물에서 여러 번 등장한 태그예요.', `#${topXTag[0]} · ${number(topXTag[1])}`, '본문에 포함된 횟수')
    ];
    target.replaceChildren(...cards);
  }

  function applyView(records) {
    const viewRecords = records.filter((record) => {
      if (view === 'archive') return ['soop', 'youtube', 'x'].includes(record.platform);
      if (view === 'soop') return record.platform === 'soop';
      if (view === 'youtube') return record.platform === 'youtube';
      if (view === 'x') return record.platform === 'x';
      if (view === 'media') return record.platform === 'soop' && ['clip', 'normal'].includes(record.contentType);
      return true;
    }).sort(byDateDescending);

    if (view === 'archive') {
      const counts = {
        total: viewRecords.length,
        catch: viewRecords.filter((item) => item.contentType === 'catch').length,
        youtube: viewRecords.filter((item) => item.platform === 'youtube').length,
        x: viewRecords.filter((item) => item.platform === 'x').length,
        linked: viewRecords.filter((item) => item.url).length
      };
      for (const [key, value] of Object.entries(counts)) {
        const element = document.querySelector(`[data-stat="${key}"]`);
        if (element) element.textContent = number(value);
      }
      renderPlatformDistribution(viewRecords);
    }

    const stats = document.querySelector('[data-stats]');
    if (stats) renderCollectionStats(stats, viewRecords, stats.dataset.stats);
    if (view === 'soop' || view === 'insights') {
      const catchRecords = viewRecords.filter((item) => item.contentType === 'catch' && item.sourceBatch === 'soop-public-catch-api-2026-10-31');
      renderMonthlyChart(catchRecords);
      if (view === 'soop') {
        renderCatchRhythm(catchRecords);
        renderTypeDistribution(viewRecords, '[data-soop-format]', [
          { type: 'catch', label: '캐치' },
          { type: 'clip', label: '클립' },
          { type: 'normal', label: 'VOD' }
        ]);
      }
    }
    if (view === 'soop' || view === 'insights') renderInsights(records);
    if (view === 'youtube' || view === 'x') renderTagCloud(viewRecords, document.querySelector('[data-tag-cloud]'));
    if (view === 'youtube') {
      renderTypeDistribution(viewRecords, '[data-youtube-format]', [
        { type: 'short', label: 'Shorts' },
        { type: 'video', label: '동영상' }
      ]);
      renderViewRanking(viewRecords, view);
    }
    if (view === 'media') {
      renderTypeDistribution(viewRecords, '[data-media-format]', [
        { type: 'clip', label: '클립' },
        { type: 'normal', label: '다시보기' }
      ]);
      renderViewRanking(viewRecords, view);
    }
    if (view === 'x') renderMonthlyChart(viewRecords, '[data-x-monthly-chart]', '[data-x-month-range]', 30);

    const list = document.querySelector('[data-record-list]');
    if (!list) return;
    const search = document.querySelector('[data-search]');
    const status = document.querySelector('[data-result-count]');
    const more = document.querySelector('[data-load-more]');
    const filterButtons = [...document.querySelectorAll('[data-filter-buttons] [data-filter]')];
    for (const button of filterButtons) button.setAttribute('aria-pressed', String(button.classList.contains('is-selected')));
    let filter = 'all';
    let redraw = () => {};
    const refresh = () => {
      const query = text(search?.value).toLocaleLowerCase('ko');
      const filtered = viewRecords.filter((record) => {
        let matchesFilter = true;
        if (filter === 'soop' || filter === 'youtube' || filter === 'x') matchesFilter = record.platform === filter;
        else if (filter === 'identified') matchesFilter = Boolean(record.platformId);
        else if (filter === 'pasted') matchesFilter = !record.platformId;
        else if (['short', 'video', 'clip', 'normal'].includes(filter)) matchesFilter = record.contentType === filter;
        return matchesFilter && (!query || getRecordText(record).includes(query));
      });
      redraw = renderFeed(filtered, list, status, more, view === 'x');
    };
    search?.addEventListener('input', refresh);
    for (const button of filterButtons) button.addEventListener('click', () => {
      filter = button.dataset.filter;
      for (const item of filterButtons) {
        const selected = item === button;
        item.classList.toggle('is-selected', selected);
        item.setAttribute('aria-pressed', String(selected));
      }
      refresh();
    });
    more?.addEventListener('click', () => redraw());
    document.querySelector('[data-tag-cloud]')?.addEventListener('click', (event) => {
      const button = event.target.closest('[data-tag-query]');
      if (!button || !search) return;
      search.value = button.dataset.tagQuery;
      refresh();
      search.focus();
    });
    refresh();
  }

  fetch('./database/catalog.json')
    .then((response) => {
      if (!response.ok) throw new Error(`카탈로그 응답 ${response.status}`);
      return response.json();
    })
    .then((records) => applyView(Array.isArray(records) ? records : []))
    .catch(() => {
      const main = document.querySelector('.collection-main');
      const error = make('p', 'catalog-error', '기록을 불러오지 못했어요. 페이지를 새로고침해 주세요.');
      main?.append(error);
    });
})();
