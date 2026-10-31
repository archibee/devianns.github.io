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
    for (const [label, value] of [['구현 목적', project.purpose], ['구현 방식', project.implementation], ['사용 방법', project.howToUse]]) {
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
    const links = document.createElement('div');
    links.className = 'project-links';
    if (project.deploymentUrl) {
      const deploy = addText(links, 'a', 'record-open', '프로젝트 열기 ↗');
      deploy.href = project.deploymentUrl;
      deploy.target = '_blank';
      deploy.rel = 'noopener noreferrer';
    } else {
      addText(links, 'span', 'record-no-link', '배포 주소 미등록');
    }
    if (project.githubUrl) {
      const source = addText(links, 'a', 'record-open', 'GitHub 저장소 ↗');
      source.href = project.githubUrl;
      source.target = '_blank';
      source.rel = 'noopener noreferrer';
    }
    card.append(links);
    return card;
  }

  fetch('./database/projects/catalog.json')
    .then((response) => { if (!response.ok) throw new Error('목록을 읽지 못했습니다.'); return response.json(); })
    .then(async (catalog) => {
      const paths = Array.isArray(catalog.projects) ? catalog.projects : [];
      const projects = await Promise.all(paths.map(async (path) => {
        const response = await fetch(new URL(path, new URL('./database/projects/catalog.json', location.href)));
        if (!response.ok) throw new Error('프로젝트 설명 파일을 읽지 못했습니다.');
        return response.json();
      }));
      list.replaceChildren(...projects.map(renderProject));
      status.textContent = `${projects.length}개 프로젝트`;
    })
    .catch(() => { status.textContent = '프로젝트 정보를 불러오지 못했습니다.'; });
})();
