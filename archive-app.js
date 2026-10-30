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
  const typeName = { catch: 'CATCH', clip: 'CLIP', normal: 'VOD', short: 'SHORTS', video: 'VIDEO', post: 'POST' };
  const metricName = { views: '조회', likes: '좋아요', replies: '답글', reposts: '재게시', quotes: '인용' };
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
  const dateOf = (record) => record.publishedAt || record.latestListingObservation?.relativePublishedTimeRaw || record.publishedTimeRaw || '날짜 정보 없음';

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
    if (getViews(record)) values.push(['조회', getViews(record)]);
    for (const metric of record.metrics || []) {
      if (metric.label === 'views' || metric.type === 'views' || !metric.label) continue;
      const value = metric.rawValue ?? (metric.value !== null && metric.value !== undefined ? number(metric.value) : null);
      if (value !== null) values.push([metricName[metric.label] || metric.label, value]);
    }
    if (record.metrics?.some((metric) => !metric.label && metric.type !== 'views')) {
      for (const metric of record.metrics.filter((item) => !item.label && item.type !== 'views' && item.rawValue)) values.push(['이름 미상 수치', metric.rawValue]);
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
      const link = make('a', 'record-open', '원본 기록 ↗');
      link.href = record.url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.setAttribute('aria-label', `${titleOf(record)} 원본 플랫폼에서 열기`);
      footer.append(link);
    } else {
      footer.append(make('span', 'record-no-link', '원본 링크 미수록'));
    }
    footer.append(make('span', 'record-source', record.platformId ? `ID · ${record.platformId}` : '메모 발췌'));
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
      if (!slice.length) fragment.append(make('p', 'empty-message', '조건에 맞는 기록을 찾지 못했습니다. 다른 제목이나 태그로 검색해 보세요.'));
      list.append(fragment);
      if (status) status.textContent = `${number(records.length)}개 기록 중 ${number(slice.length)}개 표시`;
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
      const api = records.filter((item) => item.sourceBatch === 'soop-public-catch-api-2026-10-31');
      cards = [statCard('수집된 캐치 기록', number(records.length), '원문 발췌와 API 목록을 함께 보존'), statCard('플랫폼 ID 확인', number(api.length), '중복되지 않는 ID를 가진 API 항목'), statCard('날짜 범위', dates.length ? `${dates[0].slice(0, 4)} — ${dates[dates.length - 1].slice(0, 4)}` : '날짜 미상', '명시된 게시일 기준'), statCard('원본 링크', number(records.filter((item) => item.url).length), '직접 열 수 있는 기록')];
    } else if (kind === 'youtube') {
      cards = [statCard('SHORTS', number(records.filter((item) => item.contentType === 'short').length), '채널 Shorts 탭'), statCard('동영상', number(records.filter((item) => item.contentType === 'video').length), '채널 동영상 탭'), statCard('ID와 링크', number(records.filter((item) => item.platformId && item.url).length), '기존 기록에 원본 ID를 연결'), statCard('수치 기준', '스냅샷', '조회수는 수집 당시 표시값')];
    } else if (kind === 'x') {
      cards = [statCard('게시물 기록', number(records.length), '사용자 자료와 공개 프로필 응답'), statCard('날짜 범위', dates.length ? `${dates[0].slice(0, 4)} — ${dates[dates.length - 1].slice(0, 4)}` : '날짜 미상', '게시 시각이 확인된 항목'), statCard('ID와 링크', number(records.filter((item) => item.platformId).length), '플랫폼 ID가 확인된 항목'), statCard('게시물 원문', number(records.filter((item) => item.text).length), '텍스트 메타데이터')];
    } else if (kind === 'media') {
      cards = [statCard('클립', number(records.filter((item) => item.contentType === 'clip').length), 'SOOP 원본 링크 연결'), statCard('일반 VOD', number(records.filter((item) => item.contentType === 'normal').length), 'SOOP 원본 링크 연결'), statCard('고유 ID', number(new Set(records.map((item) => item.platformId).filter(Boolean)).size), '유형별 개별 기록'), statCard('파일 없음', '정적 링크', '미디어는 플랫폼에서 열기')];
    } else {
      cards = [statCard('활동 메타데이터', number(records.length), '정적 카탈로그의 기록 수'), statCard('ID 확인', number(records.filter((item) => item.platformId).length), '원본 ID가 있는 항목'), statCard('원본 링크', number(records.filter((item) => item.url).length), '플랫폼으로 이동 가능'), statCard('플랫폼', '3', 'SOOP · YouTube · X')];
    }
    target.replaceChildren(...cards);
  }

  function monthKey(date) { return date && /^\d{4}-\d{2}/.test(date) ? date.slice(0, 7) : null; }
  function renderMonthlyChart(records) {
    const target = document.querySelector('[data-monthly-chart]');
    if (!target) return;
    const counts = new Map();
    for (const record of records) {
      const month = monthKey(record.publishedAt);
      if (month) counts.set(month, (counts.get(month) || 0) + 1);
    }
    const months = [...counts.keys()].sort().slice(-18);
    const max = Math.max(1, ...months.map((month) => counts.get(month)));
    target.replaceChildren();
    for (const month of months) {
      const value = counts.get(month);
      const column = make('div', 'chart-column');
      column.setAttribute('aria-label', `${month} ${value}개`);
      const bar = make('span', 'chart-bar');
      bar.style.setProperty('--bar-height', `${Math.max(5, value / max * 100)}%`);
      bar.title = `${month}: ${number(value)}개`;
      column.append(bar, make('small', 'chart-value', number(value)), make('small', 'chart-month', month.slice(2).replace('-', '.')));
      target.append(column);
    }
    const range = document.querySelector('[data-month-range]');
    if (range && months.length) range.textContent = `${months[0].replace('-', '.')} — ${months[months.length - 1].replace('-', '.')}`;
    if (!months.length) target.append(make('p', 'empty-message', '날짜가 확인된 기록이 아직 없습니다.'));
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
      insightCard('01', 'SOOP · REPEATED TITLES', '다시 등장한 제목', '개별 ID를 가진 캐치에서 가장 자주 발견된 제목입니다.', `${number(topTitle[1])}회`, topTitle[0]),
      insightCard('02', 'SOOP · CATCH TAGS', '가장 자주 붙은 태그', '공개 API 캐치 목록의 태그 빈도입니다.', `#${topCatchTag[0]} · ${number(topCatchTag[1])}`, '태그가 붙은 캐치 기록 수'),
      insightCard('03', 'YOUTUBE · CHANNEL INDEX', '짧은 형식이 더 많아요', '이번 목록에서 Shorts와 일반 동영상의 구성입니다.', `${youtube.filter((item) => item.contentType === 'short').length} / ${youtube.filter((item) => item.contentType === 'video').length}`, `Shorts / 동영상 · 최다 태그 #${topYtTag[0]} (${number(topYtTag[1])})`),
      insightCard('04', 'X · POST TEXT', '반복된 해시태그', '저장된 X 게시물 본문에서 확인한 표기 빈도입니다.', `#${topXTag[0]} · ${number(topXTag[1])}`, '게시물 본문에서 추출')
    ];
    target.replaceChildren(...cards);
  }

  function applyView(records) {
    const viewRecords = records.filter((record) => {
      if (view === 'archive') return ['soop', 'youtube', 'x'].includes(record.platform);
      if (view === 'soop') return record.platform === 'soop' && record.contentType === 'catch';
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
    }

    const stats = document.querySelector('[data-stats]');
    if (stats) renderCollectionStats(stats, viewRecords, stats.dataset.stats);
    if (view === 'soop' || view === 'insights') renderMonthlyChart(viewRecords.filter((item) => item.sourceBatch === 'soop-public-catch-api-2026-10-31'));
    if (view === 'soop' || view === 'insights') renderInsights(records);
    if (view === 'youtube' || view === 'x') renderTagCloud(viewRecords, document.querySelector('[data-tag-cloud]'));

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
      const error = make('p', 'catalog-error', '기록 목록을 불러오지 못했습니다. GitHub Pages 주소에서 다시 열어 주세요.');
      main?.append(error);
    });
})();
