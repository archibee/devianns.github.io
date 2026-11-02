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
  const platformName = { soop: 'SOOP', youtube: 'YouTube', x: 'X', 'naver-cafe': 'Naver Cafe' };
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
  const getRecordText = (record) => [record.title, record.text, record.authorNickname, record.cafeName, ...getTags(record)].filter(Boolean).join(' ').toLocaleLowerCase('ko');
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
    if (view === 'community' && record.cafeName) top.append(make('span', 'record-cafe', record.cafeName));
    if (record.authorNickname) top.append(make('span', 'record-author', record.authorNickname));
    const date = make('time', 'record-date', dateOf(record));
    if (record.publishedAt) date.dateTime = record.publishedAt;
    top.append(date);
    article.append(top);

    const heading = make('h3', 'record-title', titleOf(record));
    article.append(heading);
    if (record.text && record.title && record.text !== record.title && view !== 'community') article.append(make('p', 'record-body', record.text));

    const observation = record.latestListingObservation;
    const values = [];
    if (getViews(record)) values.push(['조회수', getViews(record)]);
    for (const metric of record.metrics || []) {
      if (metric.label === 'views' || metric.type === 'views' || !metric.label) continue;
      const value = metric.rawValue ?? (metric.value !== null && metric.value !== undefined ? number(metric.value) : null);
      if (value !== null) values.push([metricName[metric.label] || metric.label, value]);
    }
    if (record.platform === 'naver-cafe' && record.listingMetrics) {
      const cafeMetricNames = { readCount: '조회', likeItCount: '좋아요', commentCount: '댓글' };
      for (const [key, label] of Object.entries(cafeMetricNames)) {
        const value = record.listingMetrics[key];
        if (Number.isFinite(Number(value))) values.push([label, number(value)]);
      }
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
    if (view === 'community' && record.bodyCaptureStatus === 'captured') {
      article.classList.add('record-card-has-body');
      const bodyButton = make('button', 'record-open record-body-open', '저장된 데이터로 보기');
      bodyButton.type = 'button';
      bodyButton.dataset.openSavedBody = '';
      bodyButton.dataset.recordId = record.id;
      footer.append(bodyButton);
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

  function statCard(label, value, note) {
    const card = make('article', 'stat-card');
    card.append(make('span', 'stat-label', label), make('strong', 'stat-value', value), make('small', 'stat-note', note));
    return card;
  }

  function renderCollectionStats(target, records, kind) {
    if (!target) return;
    const dates = records.map((item) => item.publishedAt).filter(Boolean).sort();
    const period = dates.length ? `${dates[0].slice(0, 4)} — ${dates[dates.length - 1].slice(0, 4)}` : '날짜 미상';
    const views = records.filter((record) => viewCount(record) !== null);
    const viewsTotal = views.reduce((sum, record) => sum + viewCount(record), 0);
    let cards = [];
    if (kind === 'soop') {
      cards = [statCard('전체 기록', number(records.length), '캐치·클립·VOD'), statCard('기록된 조회수 합', `${number(viewsTotal)}회`, '수집 당시 항목별 수치 합'), statCard('조회수 확인 항목', number(views.length), '조회 수치가 저장된 기록'), statCard('기록 기간', period, '게시 날짜가 확인된 기록')];
    } else if (kind === 'youtube') {
      cards = [statCard('Shorts', number(records.filter((item) => item.contentType === 'short').length), '저장된 조회수 기록 포함'), statCard('동영상', number(records.filter((item) => item.contentType === 'video').length), '저장된 조회수 기록 포함'), statCard('기록된 조회수 합', `${number(viewsTotal)}회`, '수집 당시 항목별 수치 합'), statCard('조회수 확인 항목', number(views.length), '조회 수치가 저장된 영상')];
    } else if (kind === 'x') {
      const reactions = records.reduce((sum, record) => sum + ['likes', 'reposts', 'replies', 'quotes'].reduce((subtotal, label) => subtotal + (metricNumber(record, label) || 0), 0), 0);
      cards = [statCard('게시물', number(records.length), '공개 범위에서 확인한 기록'), statCard('기록된 조회수 합', `${number(viewsTotal)}회`, '수집 당시 공개 수치 합'), statCard('반응 수치 합', number(reactions), '좋아요·재게시·답글·인용'), statCard('기록 기간', period, '게시 날짜가 확인된 기록')];
    } else if (kind === 'community') {
      const reads = records.reduce((sum, record) => sum + (Number(record.listingMetrics?.readCount) || 0), 0);
      const likes = records.reduce((sum, record) => sum + (Number(record.listingMetrics?.likeItCount) || 0), 0);
      cards = [statCard('게시글', number(records.length), '저장된 카페 활동'), statCard('목록 조회 수 합', `${number(reads)}회`, '수집 당시 목록 수치'), statCard('공감 수 합', number(likes), '수집 당시 목록 수치'), statCard('기록 기간', period, '게시 날짜가 확인된 글')];
    }
    target.replaceChildren(...cards);
  }

  function monthKey(date) { return date && /^\d{4}-\d{2}/.test(date) ? date.slice(0, 7) : null; }

  function renderMeasureBars(target, items) {
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
      fill.style.setProperty('--viz-width', `${item.value ? Math.max(2, item.value / max * 100) : 0}%`);
      track.append(fill);
      row.append(label, track, make('strong', 'viz-value', `${number(item.value)}개`));
      target.append(row);
    }
  }

  function renderDateRhythm(records, config) {
    const weekdays = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    const timeBands = ['00–05시', '06–11시', '12–17시', '18–23시'];
    const weekdayCounts = new Map(weekdays.map((day) => [day, 0]));
    const hourCounts = new Map(timeBands.map((band) => [band, 0]));
    let datedCount = 0;
    let timedCount = 0;
    for (const record of records) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(record.publishedAt || '')) {
        const weekday = new Date(`${record.publishedAt}T00:00:00Z`).getUTCDay();
        weekdayCounts.set(weekdays[weekday], weekdayCounts.get(weekdays[weekday]) + 1);
        datedCount += 1;
      }
      const match = String(record.publishedTimeRaw || '').match(/(?:T|\s)(\d{2}):(\d{2})/);
      if (match) {
        const hour = Number(match[1]);
        if (hour >= 0 && hour < 24) {
          const band = timeBands[Math.floor(hour / 6)];
          hourCounts.set(band, hourCounts.get(band) + 1);
          timedCount += 1;
        }
      }
    }
    renderMeasureBars(document.querySelector(config.weekdays), weekdays.map((label) => ({ label, value: weekdayCounts.get(label) })));
    renderMeasureBars(document.querySelector(config.hours), timeBands.map((label) => ({ label, value: hourCounts.get(label) })));
    const weekdayCoverage = document.querySelector(config.weekdayCoverage);
    const hourCoverage = document.querySelector(config.hourCoverage);
    if (weekdayCoverage) weekdayCoverage.textContent = `날짜 확인 ${number(datedCount)}건`;
    if (hourCoverage) hourCoverage.textContent = `시각 확인 ${number(timedCount)}건`;
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

  function metricNumber(record, label) {
    const metric = record.metrics?.find((item) => item.label === label);
    if (Number.isFinite(metric?.value)) return Number(metric.value);
    const raw = metric?.rawValue;
    const match = raw && String(raw).replace(/,/g, '').match(/[\d.]+/);
    return match ? Number(match[0]) : null;
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
      const subtitle = make('small', 'viz-rank-subtitle', `${typeName[record.contentType] || '기록'} · ${dateOf(record)}`);
      const track = make('span', 'viz-track');
      track.setAttribute('aria-hidden', 'true');
      const fill = make('span', 'viz-fill');
      fill.style.setProperty('--viz-width', `${Math.max(2, viewCount(record) / max * 100)}%`);
      track.append(fill);
      content.append(title, subtitle, track);
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
    const max = Math.max(1, ...months.map((month) => counts.get(month) || 0));
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

  function renderCommunityVisuals(records) {
    const renderCafeRanking = (selector, metricKey, emptyLabel) => {
      const target = document.querySelector(selector);
      if (!target) return;
      const ranked = records.filter((record) => Number.isFinite(Number(record.listingMetrics?.[metricKey])))
        .sort((a, b) => Number(b.listingMetrics[metricKey]) - Number(a.listingMetrics[metricKey]))
        .slice(0, 5);
      target.replaceChildren();
      if (!ranked.length) {
        target.append(make('p', 'empty-message', `${emptyLabel} 수치를 확인할 수 있는 글이 아직 없어요.`));
        return;
      }
      const max = Math.max(1, ...ranked.map((record) => Number(record.listingMetrics[metricKey])));
      ranked.forEach((record, index) => {
        const value = Number(record.listingMetrics[metricKey]);
        const row = make('article', 'viz-rank-row');
        row.append(make('span', 'viz-rank-number', String(index + 1).padStart(2, '0')));
        const content = make('div', 'viz-rank-content');
        const title = make('p', 'viz-rank-title', titleOf(record));
        title.title = titleOf(record);
        const subtitle = make('small', 'viz-rank-subtitle', `${record.authorNickname || '작성자 미상'} · ${dateOf(record)}`);
        const track = make('span', 'viz-track');
        track.setAttribute('aria-hidden', 'true');
        const fill = make('span', 'viz-fill');
        fill.style.setProperty('--viz-width', `${Math.max(2, value / max * 100)}%`);
        track.append(fill);
        content.append(title, subtitle, track);
        row.append(content, make('strong', 'viz-value', number(value)));
        target.append(row);
      });
    };
    renderCafeRanking('[data-community-ranking]', 'readCount', '조회');
    renderCafeRanking('[data-community-likes-ranking]', 'likeItCount', '공감');
  }

  function applyView(records) {
    const selectedCafeId = document.querySelector('[data-community-cafe-select]')?.value || new URLSearchParams(window.location.search).get('cafe') || 'all';
    const viewRecords = records.filter((record) => {
      if (view === 'soop') return record.platform === 'soop';
      if (view === 'youtube') return record.platform === 'youtube';
      if (view === 'x') return record.platform === 'x';
      if (view === 'community') return record.platform === 'naver-cafe' && (selectedCafeId === 'all' || String(record.cafeId) === selectedCafeId);
      return true;
    }).sort(byDateDescending);

    const stats = document.querySelector('[data-stats]');
    if (stats) renderCollectionStats(stats, viewRecords, stats.dataset.stats);
    if (view === 'community') {
      renderMonthlyChart(viewRecords, '[data-community-monthly]', '[data-community-month-range]', 36);
      renderDateRhythm(viewRecords, {
        weekdays: '[data-community-weekdays]',
        hours: '[data-community-hours]',
        weekdayCoverage: '[data-community-weekday-coverage]',
        hourCoverage: '[data-community-hour-coverage]'
      });
      renderCommunityVisuals(viewRecords);
    }
    if (view === 'soop') {
      const catchRecords = viewRecords.filter((item) => item.contentType === 'catch');
      renderMonthlyChart(catchRecords);
      renderDateRhythm(viewRecords, {
        weekdays: '[data-soop-weekdays]',
        hours: '[data-soop-hours]',
        weekdayCoverage: '[data-soop-weekday-coverage]',
        hourCoverage: '[data-soop-hour-coverage]'
      });
      renderViewRanking(viewRecords, view);
    }
    if (view === 'youtube' || view === 'x') renderViewRanking(viewRecords, view);
    if (view === 'x') renderMonthlyChart(viewRecords, '[data-x-monthly-chart]', '[data-x-month-range]', 30);

    const list = document.querySelector('[data-record-list]');
    if (!list) return;
    const search = document.querySelector('[data-search]');
    const status = document.querySelector('[data-result-count]');
    const more = document.querySelector('[data-load-more]');
    const bodyDialog = document.querySelector('#community-body-dialog');
    const bodyTitle = bodyDialog?.querySelector('[data-body-title]');
    const bodyMeta = bodyDialog?.querySelector('[data-body-meta]');
    const bodyText = bodyDialog?.querySelector('[data-body-text]');
    const bodyEmpty = bodyDialog?.querySelector('[data-body-empty]');
    const bodyLinks = bodyDialog?.querySelector('[data-body-links]');
    const bodyLinksSection = bodyDialog?.querySelector('[data-body-links-section]');
    const bodyOriginal = bodyDialog?.querySelector('[data-body-original]');
    list?.addEventListener('click', (event) => {
      const button = event.target.closest('[data-open-saved-body]');
      if (!button || !bodyDialog) return;
      const record = viewRecords.find((item) => item.id === button.dataset.recordId);
      if (!record) return;
      if (bodyTitle) bodyTitle.textContent = titleOf(record);
      if (bodyMeta) bodyMeta.textContent = [record.cafeName, record.authorNickname, dateOf(record)].filter(Boolean).join(' · ');
      if (bodyText) bodyText.textContent = text(record.text);
      if (bodyEmpty) bodyEmpty.hidden = Boolean(text(record.text));
      if (bodyText) bodyText.hidden = !text(record.text);
      if (bodyLinks) {
        bodyLinks.replaceChildren();
        const savedLinks = Array.isArray(record.bodyLinks) ? record.bodyLinks : [];
        for (const savedLink of savedLinks) {
          if (!savedLink?.url) continue;
          const kindLabel = { image: '이미지 링크', media: '미디어 링크', file: '첨부 링크' }[savedLink.kind];
          const linkText = savedLink.label || savedLink.url;
          const link = make('a', 'body-dialog-link', kindLabel ? `${kindLabel} · ${linkText}` : linkText);
          link.href = savedLink.url;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          bodyLinks.append(link);
        }
        if (bodyLinksSection) bodyLinksSection.hidden = !bodyLinks.childElementCount;
      }
      if (bodyOriginal) {
        bodyOriginal.hidden = !record.url;
        if (record.url) bodyOriginal.href = record.url;
      }
      bodyDialog.showModal();
    });
    bodyDialog?.querySelector('[data-body-close]')?.addEventListener('click', () => bodyDialog.close());
    bodyDialog?.addEventListener('click', (event) => { if (event.target === bodyDialog) bodyDialog.close(); });
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
    refresh();
  }

  function setupCommunityCafeSelector(records) {
    const select = document.querySelector('[data-community-cafe-select]');
    if (!select) return;
    const cafes = new Map();
    for (const record of records) {
      if (record.platform !== 'naver-cafe' || !record.cafeId) continue;
      cafes.set(String(record.cafeId), text(record.cafeName) || '이름 없는 카페');
    }
    for (const [id, name] of [...cafes].sort((a, b) => a[1].localeCompare(b[1], 'ko'))) {
      const option = make('option', '', name);
      option.value = id;
      select.append(option);
    }
    const params = new URLSearchParams(window.location.search);
    const requestedCafe = params.get('cafe');
    const defaultCafe = cafes.size === 1 ? cafes.keys().next().value : 'all';
    select.value = requestedCafe === 'all' ? 'all' : cafes.has(requestedCafe) ? requestedCafe : defaultCafe;
    const selectionLabel = document.querySelector('[data-community-selection-label]');
    const selectedName = select.value === 'all' ? '전체 카페' : cafes.get(select.value);
    if (selectionLabel) selectionLabel.textContent = selectedName;
    for (const cafeHeading of document.querySelectorAll('[data-community-cafe-heading]')) {
      cafeHeading.textContent = select.value === 'all' ? '전체 카페' : selectedName;
    }
    const cafeCount = document.querySelector('[data-community-cafe-count]');
    if (cafeCount) cafeCount.textContent = `등록된 카페 ${number(cafes.size)}곳`;
    select.addEventListener('change', () => {
      window.location.search = `?cafe=${encodeURIComponent(select.value)}`;
    });
  }

  fetch('./database/catalog.json')
    .then((response) => {
      if (!response.ok) throw new Error(`카탈로그 응답 ${response.status}`);
      return response.json();
    })
    .then((records) => {
      const catalog = Array.isArray(records) ? records : [];
      if (view === 'community') setupCommunityCafeSelector(catalog);
      applyView(catalog);
    })
    .catch(() => {
      const main = document.querySelector('.collection-main');
      const error = make('p', 'catalog-error', '기록을 불러오지 못했어요. 페이지를 새로고침해 주세요.');
      main?.append(error);
    });
})();
