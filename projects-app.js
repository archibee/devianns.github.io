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
    if (project.summary) addText(card, 'p', 'project-summary', project.summary);
    if (Array.isArray(project.highlights) && project.highlights.length) {
      const features = document.createElement('ul');
      features.className = 'project-features';
      for (const feature of project.highlights) addText(features, 'li', '', feature);
      card.append(features);
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
    if (project.deploymentUrl) addLink('프로젝트 열기 ↗', project.deploymentUrl);
    if (project.githubUrl) {
      addLink('GitHub 저장소 ↗', project.githubUrl);
    }
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
        return response.json();
      }));
      list.replaceChildren(...projects.map(renderProject));
      status.textContent = `${projects.length}개 프로젝트`;
    })
    .catch(() => { status.textContent = '프로젝트 정보를 불러오지 못했어요.'; });
})();
