(() => {
  const list = document.querySelector('[data-project-list]');
  const status = document.querySelector('[data-project-status]');
  if (!list || !status) return;

  const addText = (parent, tag, className, value) => {
    const node = document.createElement(tag);
    node.className = className;
    node.textContent = value;
    parent.append(node);
    return node;
  };

  function renderProject(project) {
    const card = document.createElement('article');
    card.className = 'glass-section project-card';
    addText(card, 'p', 'project-category', project.category || '프로젝트');
    addText(card, 'h2', 'project-title', project.name);
    addText(card, 'p', 'project-description', project.description);
    const details = document.createElement('dl');
    details.className = 'project-details';
    for (const [label, value] of [['만든 이유', project.purpose], ['작동 방식', project.implementation], ['사용 방법', project.howToUse]]) {
      addText(details, 'dt', '', label);
      addText(details, 'dd', '', value);
    }
    card.append(details);
    if (Array.isArray(project.features) && project.features.length) {
      const features = document.createElement('ul');
      features.className = 'project-features';
      for (const feature of project.features) addText(features, 'li', '', feature);
      card.append(features);
    }
    if (project.guideline) {
      const policy = document.createElement('aside');
      policy.className = 'project-policy';
      addText(policy, 'p', 'project-policy-label', project.guideline.noticeTitle || '배포 안내');
      addText(policy, 'p', 'project-policy-notice', project.guideline.notice);
      if (Array.isArray(project.guideline.summary) && project.guideline.summary.length) {
        const details = document.createElement('details');
        details.className = 'project-policy-details';
        addText(details, 'summary', '', '가이드라인 핵심 내용');
        const rules = document.createElement('ul');
        for (const rule of project.guideline.summary) addText(rules, 'li', '', rule);
        details.append(rules);
        policy.append(details);
      }
      if (project.guideline.sourceNote) addText(policy, 'p', 'project-policy-source-note', project.guideline.sourceNote);
      card.append(policy);
    }
    const links = document.createElement('div');
    links.className = 'project-links';
    const addLink = (label, url) => {
      if (!url) return;
      const link = addText(links, 'a', 'record-open', label);
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    };
    if (project.deploymentUrl) addLink('사용해 보기 ↗', project.deploymentUrl);
    else if (project.cafePostUrl) addLink('VLUP 카페 배포 게시글 ↗', project.cafePostUrl);
    if (project.githubUrl) {
      addLink('GitHub 저장소 ↗', project.githubUrl);
    }
    if (project.guideline?.officialSourceUrl) addLink('팬게임 지침 원문 ↗', project.guideline.officialSourceUrl);
    card.append(links);
    return card;
  }

  fetch('./database/projects/catalog.json')
    .then((response) => { if (!response.ok) throw new Error('목록을 읽지 못했습니다.'); return response.json(); })
    .then(async (catalog) => {
      const paths = Array.isArray(catalog.projects) ? catalog.projects : [];
      const projects = await Promise.all(paths.map(async (path) => {
        const projectUrl = new URL(path, new URL('./database/projects/catalog.json', location.href));
        const response = await fetch(projectUrl);
        if (!response.ok) throw new Error('프로젝트 설명 파일을 읽지 못했습니다.');
        const project = await response.json();
        if (project.guidelinePath) {
          const guidelineUrl = new URL(project.guidelinePath, projectUrl);
          const guidelineResponse = await fetch(guidelineUrl);
          if (!guidelineResponse.ok) throw new Error('프로젝트 안내 자료를 읽지 못했습니다.');
          project.guideline = await guidelineResponse.json();
        }
        return project;
      }));
      list.replaceChildren(...projects.map(renderProject));
      status.textContent = `${projects.length}개 프로젝트`;
    })
    .catch(() => { status.textContent = '프로젝트 정보를 불러오지 못했어요.'; });
})();
