(async () => {
  const kind = document.body.dataset.kind;
  const id = decodeURIComponent(location.pathname.split('/').filter(Boolean).pop());
  const box = $('#article');
  const back = (href, label) => `<a class="back" href="${href}">← ${label}</a>`;
  addEventListener('scroll', () => { const h = document.documentElement.scrollHeight - innerHeight; $('#progress').style.width = (h > 0 ? (scrollY / h) * 100 : 0) + '%'; }, { passive: true });
  try {
    if (kind === 'post') {
      const { post, profile } = await api(`/api/posts/${encodeURIComponent(id)}`);
      document.title = `${post.title} — ${profile.name}`;
      $('#brandName').textContent = profile.name;
      box.innerHTML = `${back('/#blog', 'All articles')}
        <div class="eyebrow">${esc((post.tags || [])[0] || 'Article')}</div>
        <h1>${esc(post.title)}</h1>
        <div class="meta"><span>${esc(profile.name)}</span><span>·</span><span>${fmtDate(post.date)}</span><span>·</span><span>${readTime(post.content)}</span></div>
        ${post.cover ? `<img class="cover" src="${esc(post.cover)}" alt="" />` : ''}
        <div class="prose">${md(post.content)}</div>
        ${post.tags?.length ? `<div class="tags" style="margin-top:48px">${post.tags.map((t) => `<span class="tag">#${esc(t)}</span>`).join('')}</div>` : ''}`;
    } else {
      const [{ project: p }, { profile }] = await Promise.all([api(`/api/projects/${encodeURIComponent(id)}`), api('/api/content')]);
      document.title = `${p.title} — ${profile.name}`;
      $('#brandName').textContent = profile.name;
      box.innerHTML = `${back('/#projects', 'All projects')}
        <div class="eyebrow">${esc(p.category || 'Project')} · ${esc(p.year)}</div>
        <h1>${esc(p.title)}</h1>
        <p style="color:var(--text-2);font-size:19px;margin:0 0 24px">${esc(p.summary)}</p>
        <div class="cta">
          ${p.demo ? `<a class="btn primary sm" href="${esc(p.demo)}" target="_blank" rel="noopener">Live demo ${ICONS.ext}</a>` : ''}
          ${p.github ? `<a class="btn sm" href="${esc(p.github)}" target="_blank" rel="noopener">${ICONS.github} Source code</a>` : ''}
        </div>
        <div class="tags" style="margin-bottom:36px">${(p.tags || []).map((t) => `<span class="tag">${esc(t)}</span>`).join('')}</div>
        ${p.image ? `<img class="cover" src="${esc(p.image)}" alt="" />` : ''}
        <div class="prose">${md(p.description)}</div>`;
    }
    highlight(box);
  } catch (e) {
    box.innerHTML = `${back('/', 'Home')}<h1>Not found</h1><p style="color:var(--text-2)">This page doesn't exist or was unpublished.</p>`;
  }
})();
