(() => {
  const G = [
    'linear-gradient(135deg,#1b3a4b,#5cf2c8 140%)',
    'linear-gradient(135deg,#2a1f5c,#8b7cff 120%)',
    'linear-gradient(135deg,#3b1d34,#ff7a9a 140%)',
    'linear-gradient(135deg,#3a2a12,#ffc46b 150%)',
    'linear-gradient(135deg,#0f2a3d,#79d2ff 140%)',
    'linear-gradient(135deg,#1d2b1a,#a6f27c 150%)'
  ];
  const hash = (s) => [...String(s)].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
  const statusClass = (s) => ({ published: 'published', 'under review': 'review', 'in progress': 'progress', accepted: 'accepted' }[(s || '').toLowerCase()] || 'progress');
  let DATA = null;

  // static icons
  $('#i-arrow').innerHTML = ICONS.arrow; $('#i-dl').innerHTML = ICONS.download; $('#i-up').innerHTML = ICONS.arrowUp;
  $('#modalClose').innerHTML = ICONS.close; $('#yr').textContent = new Date().getFullYear();

  api('/api/content').then((d) => { DATA = d; render(d); }).catch(() => toast('Could not load content')).finally(() => {
    setTimeout(() => { $('#preloader').classList.add('done'); document.body.classList.add('loaded'); }, 350);
  });

  function render(d) {
    const p = d.profile;
    const parts = p.name.trim().split(/\s+/);
    const last = parts.pop();
    document.title = `${p.name} — Research · Engineering · Projects`;
    $('#brandName').textContent = p.shortName ? `${p.shortName} ${last}` : p.name;
    $('#heroName').innerHTML = `<span class="line"><span>${esc(parts.join(' ') || last)}</span></span>${parts.length ? `<span class="line"><span><em>${esc(last)}</em></span></span>` : ''}`;
    $('#footBig').textContent = (p.shortName ? `${p.shortName} ${last}` : p.name).toUpperCase();
    $('#footName').textContent = p.name;
    $('#availability').textContent = p.availability || 'Open to opportunities';
    if (!p.availability) $('#status').style.display = 'none';
    $('#tagline').textContent = p.tagline;
    typer(p.roles?.length ? p.roles : ['Engineer']);
    $('#heroSocials').innerHTML = $('#contactSocials').innerHTML = socialLinks(p);
    if (p.cvUrl) $('#cvBtn').href = p.cvUrl; else $('#cvBtn').style.display = 'none';
    const initials = (parts[parts.length - 1]?.[0] || '') + last[0];
    $('#face').innerHTML = p.avatar ? `<img src="${esc(p.avatar)}" alt="${esc(p.name)}" />` : `<span class="initials">${esc(initials)}</span>`;
    const pubCount = d.research.filter((r) => (r.status || '').toLowerCase() === 'published').length;
    $('#chip1').innerHTML = `<b>${d.research.length}</b> research works`;
    $('#chip2').innerHTML = `<b>${d.projects.length}</b> projects shipped`;
    if (pubCount) $('#chip1').innerHTML = `<b>${pubCount}</b> published · ${d.research.length} total`;

    const ints = p.researchInterests?.length ? p.researchInterests : p.roles;
    $('#marquee').innerHTML = [...ints, ...ints, ...ints, ...ints].map((t) => `<span>${esc(t)}</span>`).join('');

    // About
    $('#bio').innerHTML = (p.bio || '').split(/\n\s*\n/).map((x) => `<p>${esc(x)}</p>`).join('') +
      (p.researchInterests?.length ? `<div class="interests"><h4>Research interests</h4><div class="tags">${p.researchInterests.map((t) => `<span class="tag">${esc(t)}</span>`).join('')}</div></div>` : '');
    $('#stats').innerHTML = (p.stats || []).map((s) => `<div class="card stat spot"><div class="v" data-count="${esc(s.value)}">${esc(s.value)}</div><div class="l">${esc(s.label)}</div></div>`).join('');
    $('#metaList').innerHTML = [
      p.location && `<div>${ICONS.pin}${esc(p.location)}</div>`,
      p.email && `<div>${ICONS.email}<a href="mailto:${esc(p.email)}">${esc(p.email)}</a></div>`,
      d.education[0] && `<div>${ICONS.cap}${esc(d.education[0].degree)} · ${esc(d.education[0].institution)}</div>`
    ].filter(Boolean).join('');

    // Academics
    $('#edu').innerHTML = d.education.map((e) => `
      <article class="card spot rv">
        <div class="yr">${esc(e.start)}${e.end ? ' — ' + esc(e.end) : ''}</div>
        <div>
          <h3>${esc(e.degree)}</h3>
          <div class="inst">${esc(e.institution)}${e.location ? ' · ' + esc(e.location) : ''}</div>
          ${e.gpa ? `<span class="gpa">${esc(e.gpa)}</span>` : ''}
          ${e.details ? `<p class="det">${esc(e.details)}</p>` : ''}
          ${e.highlights?.length ? `<ul>${e.highlights.map((h) => `<li>${esc(h)}</li>`).join('')}</ul>` : ''}
        </div>
      </article>`).join('') || '<div class="empty">Education entries will appear here.</div>';
    $('#scores').innerHTML = d.scores.length ? `<p class="scores-title rv">Standardized tests</p>` + d.scores.map((s) => `
      <div class="card score spot rv"><div><div class="n">${esc(s.name)}${s.date ? ' · ' + esc(s.date) : ''}</div>${s.detail ? `<div class="d">${esc(s.detail)}</div>` : ''}</div><div class="s">${esc(s.score)}</div></div>`).join('') : '';

    renderResearch('All');
    renderProjects('All', false);

    // Experience
    $('#timeline').innerHTML = d.experience.map((x) => `
      <div class="t-item rv"><div class="card spot">
        <div class="t-head"><div><h3>${esc(x.role)}</h3><div class="org">${esc(x.org)}${x.location ? ' · ' + esc(x.location) : ''}</div></div>
        <div class="when">${esc(x.start)}${x.end ? ' — ' + esc(x.end) : ''}${x.type ? ` · ${esc(x.type)}` : ''}</div></div>
        ${x.description ? `<p>${esc(x.description)}</p>` : ''}
      </div></div>`).join('') || '<div class="empty">Experience will appear here.</div>';
    if (!d.experience.length) $('#timeline').style.paddingLeft = '0';

    $('#skillsGrid').innerHTML = d.skills.map((s) => `<div class="card skill spot rv"><h3><i></i>${esc(s.group)}</h3><div class="tags">${s.items.map((i) => `<span class="tag">${esc(i)}</span>`).join('')}</div></div>`).join('');

    $('#achGrid').innerHTML = d.achievements.map((a) => {
      const ic = /cert/i.test(a.kind) ? ICONS.cert : /scholar/i.test(a.kind) ? ICONS.cap : ICONS.award;
      const inner = `<div class="k">${ic}${esc(a.kind || 'Award')}</div><span class="yr">${esc(a.year)}</span><h3>${esc(a.title)}</h3><div class="iss">${esc(a.issuer)}</div>${a.description ? `<p>${esc(a.description)}</p>` : ''}`;
      return a.link ? `<a class="card ach spot rv" href="${esc(a.link)}" target="_blank" rel="noopener">${inner}</a>` : `<div class="card ach spot rv">${inner}</div>`;
    }).join('');
    if (!d.achievements.length) $('#achievements').style.display = 'none';

    $('#postGrid').innerHTML = d.posts.slice(0, 6).map((x) => `
      <a class="card post-card spot rv" href="/blog/${encodeURIComponent(x.slug)}">
        ${x.cover ? `<img src="${esc(x.cover)}" alt="" loading="lazy" />` : ''}
        <div class="date">${fmtDate(x.date)}${x.tags?.length ? ' · ' + esc(x.tags[0]) : ''}</div>
        <h3>${esc(x.title)}</h3><p>${esc(x.excerpt)}</p>
        <span class="read">Read article ${ICONS.arrow.replace('<svg', '<svg width="14" height="14"')}</span>
      </a>`).join('') || '<div class="empty">No articles yet.</div>';

    // Contact
    if (p.email) {
      $('#bigMail').href = `mailto:${p.email}`; $('#bigMail').textContent = p.email;
      $('#copyMail').onclick = () => navigator.clipboard.writeText(p.email).then(() => toast('Email copied'));
    } else { $('#bigMail').style.display = $('#copyMail').style.display = 'none'; }

    injectSchema(p);
    observe();
    buildPalette();
  }

  // ── Research ───────────────────────────────────────
  function renderResearch(filter) {
    const all = DATA.research;
    const statuses = ['All', ...new Set(all.map((r) => r.status).filter(Boolean))];
    $('#pubFilters').innerHTML = statuses.length > 2 ? statuses.map((s) => `<button class="filter ${s === filter ? 'on' : ''}" data-f="${esc(s)}">${esc(s)}</button>`).join('') : '';
    $$('#pubFilters .filter').forEach((b) => (b.onclick = () => renderResearch(b.dataset.f)));
    const name = DATA.profile.name;
    const list = all.filter((r) => filter === 'All' || r.status === filter);
    $('#pubs').innerHTML = list.map((r) => `
      <article class="card pub spot rv in" data-id="${r.id}">
        <div class="y">${esc(r.year)}</div>
        <div>
          <div class="pub-top">${r.status ? `<span class="badge ${statusClass(r.status)}">${esc(r.status)}</span>` : ''}${r.type ? `<span class="type">${esc(r.type)}</span>` : ''}${r.featured ? '<span class="type">★ Featured</span>' : ''}</div>
          <h3>${esc(r.title)}</h3>
          <div class="authors">${esc(r.authors).replace(esc(name), `<b>${esc(name)}</b>`)}</div>
          ${r.venue ? `<div class="venue">${esc(r.venue)}</div>` : ''}
          ${r.abstract ? `<p class="abs">${esc(r.abstract)}</p>` : ''}
          <div class="pub-actions">
            ${r.abstract ? `<button class="link-pill" data-act="abs">Abstract ${ICONS.chevron}</button>` : ''}
            ${r.doi ? `<a class="link-pill" href="${esc(r.doi)}" target="_blank" rel="noopener">${ICONS.ext} DOI</a>` : ''}
            ${r.pdf ? `<a class="link-pill" href="${esc(r.pdf)}" target="_blank" rel="noopener">${ICONS.doc} PDF</a>` : ''}
            ${r.code ? `<a class="link-pill" href="${esc(r.code)}" target="_blank" rel="noopener">${ICONS.code} Code</a>` : ''}
            <button class="link-pill" data-act="cite">${ICONS.quote} Cite</button>
            ${r.tags?.length ? `<div class="tags">${r.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join('')}</div>` : ''}
          </div>
        </div>
      </article>`).join('') || '<div class="empty">Research entries will appear here.</div>';
    $$('#pubs .pub').forEach((el) => {
      const r = all.find((x) => x.id === el.dataset.id);
      el.querySelector('[data-act=abs]')?.addEventListener('click', () => el.classList.toggle('open'));
      el.querySelector('[data-act=cite]').addEventListener('click', () => navigator.clipboard.writeText(bibtex(r)).then(() => toast('BibTeX copied to clipboard')));
    });
    spotlight();
  }
  function bibtex(r) {
    const first = (r.authors || 'author').split(',')[0].trim().split(/\s+/).pop().toLowerCase().replace(/[^a-z]/g, '');
    const key = `${first}${r.year || ''}${(r.title || '').split(/\s+/)[0].toLowerCase().replace(/[^a-z]/g, '')}`;
    const kind = /journal/i.test(r.type) ? 'article' : /conf/i.test(r.type) ? 'inproceedings' : 'misc';
    const venueField = kind === 'article' ? 'journal' : kind === 'inproceedings' ? 'booktitle' : 'howpublished';
    const authors = (r.authors || '').split(',').map((a) => a.trim()).filter(Boolean).join(' and ');
    return `@${kind}{${key},\n  title={${r.title}},\n  author={${authors}},\n  ${venueField}={${r.venue || ''}},\n  year={${r.year || ''}}${r.doi ? `,\n  url={${r.doi}}` : ''}\n}`;
  }

  // ── Projects ───────────────────────────────────────
  function renderProjects(filter, showAll) {
    const all = [...DATA.projects].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    const cats = ['All', ...new Set(all.map((p) => p.category).filter(Boolean))];
    $('#projFilters').innerHTML = cats.length > 2 ? cats.map((c) => `<button class="filter ${c === filter ? 'on' : ''}" data-f="${esc(c)}">${esc(c)}</button>`).join('') : '';
    $$('#projFilters .filter').forEach((b) => (b.onclick = () => renderProjects(b.dataset.f, false)));
    const list = all.filter((p) => filter === 'All' || p.category === filter);
    const shown = showAll ? list : list.slice(0, 6);
    $('#projGrid').innerHTML = shown.map((p) => `
      <article class="card proj spot rv in" data-id="${p.id}" tabindex="0" aria-label="Open ${esc(p.title)}">
        <div class="thumb">
          ${p.featured ? '<span class="badge feat">Featured</span>' : ''}
          ${p.image ? `<img src="${esc(p.image)}" alt="${esc(p.title)}" loading="lazy" />` : `<div class="gen" style="--g:${G[hash(p.title) % G.length]}"><span>${esc(p.title)}</span></div>`}
        </div>
        <div class="body">
          <div class="cat"><span>${esc(p.category || 'Project')}</span><span>${esc(p.year)}</span></div>
          <h3>${esc(p.title)}</h3>
          <p>${esc(p.summary)}</p>
          <div class="foot">
            <div class="tags">${(p.tags || []).slice(0, 4).map((t) => `<span class="tag">${esc(t)}</span>`).join('')}</div>
            <div class="links">
              ${p.github ? `<a class="icon-btn" href="${esc(p.github)}" target="_blank" rel="noopener" aria-label="Source code">${ICONS.github}</a>` : ''}
              ${p.demo ? `<a class="icon-btn" href="${esc(p.demo)}" target="_blank" rel="noopener" aria-label="Live demo">${ICONS.ext}</a>` : ''}
            </div>
          </div>
        </div>
      </article>`).join('') || '<div class="empty">Projects will appear here.</div>';
    $('#projMore').innerHTML = !showAll && list.length > 6 ? `<button class="btn" id="moreBtn">Show all ${list.length} projects</button>` : '';
    $('#moreBtn')?.addEventListener('click', () => renderProjects(filter, true));
    $$('#projGrid .proj').forEach((el) => {
      const open = (e) => { if (e.target.closest('a')) return; openProject(el.dataset.id); };
      el.addEventListener('click', open);
      el.addEventListener('keydown', (e) => e.key === 'Enter' && open(e));
      tilt(el);
    });
    spotlight();
  }

  function openProject(id) {
    const p = DATA.projects.find((x) => x.id === id);
    if (!p) return;
    api(`/api/projects/${id}`).then(({ project }) => {
      $('#modalContent').innerHTML = `
        <div class="hero-img thumb" style="position:relative">${project.image ? `<img src="${esc(project.image)}" alt="" style="width:100%;height:100%;object-fit:cover" />` : `<div class="gen" style="--g:${G[hash(project.title) % G.length]};position:absolute;inset:0;display:grid;place-items:center"><span style="position:relative;font-family:var(--f-serif);font-style:italic;font-size:48px;z-index:1">${esc(project.title)}</span></div>`}</div>
        <div class="modal-body">
          <div class="eyebrow">${esc(project.category || 'Project')} · ${esc(project.year)}</div>
          <h2 style="font-size:clamp(28px,4vw,40px);margin-bottom:14px">${esc(project.title)}</h2>
          <p style="color:var(--text-2);font-size:17px;margin:0 0 20px">${esc(project.summary)}</p>
          <div class="tags" style="margin-bottom:24px">${(project.tags || []).map((t) => `<span class="tag">${esc(t)}</span>`).join('')}</div>
          <div class="cta" style="margin-bottom:28px">
            ${project.demo ? `<a class="btn primary sm" href="${esc(project.demo)}" target="_blank" rel="noopener">Live demo ${ICONS.ext}</a>` : ''}
            ${project.github ? `<a class="btn sm" href="${esc(project.github)}" target="_blank" rel="noopener">${ICONS.github} Source</a>` : ''}
            <a class="btn sm" href="/project/${project.id}">Open full page ${ICONS.arrow}</a>
          </div>
          <div class="prose">${md(project.description)}</div>
        </div>`;
      $('.modal .gen')?.style.setProperty('background', 'var(--g)');
      $('#modal').classList.add('open');
      document.body.style.overflow = 'hidden';
      highlight($('#modalContent'));
    });
  }
  const closeModal = () => { $('#modal').classList.remove('open'); document.body.style.overflow = ''; };
  $('#modalClose').onclick = closeModal;
  $('#modal').addEventListener('click', (e) => e.target.id === 'modal' && closeModal());

  // ── Effects ────────────────────────────────────────
  function typer(words) {
    const el = $('#typed');
    let w = 0, i = 0, del = false;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { el.textContent = words[0]; return; }
    (function tick() {
      const word = words[w % words.length];
      el.textContent = word.slice(0, i);
      if (!del && i === word.length) { del = true; return setTimeout(tick, 1800); }
      if (del && i === 0) { del = false; w++; }
      i += del ? -1 : 1;
      setTimeout(tick, del ? 35 : 70);
    })();
  }

  function observe() {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    $$('.rv:not(.in)').forEach((el) => io.observe(el));
    // count-up for numeric stats
    const co = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      co.unobserve(e.target);
      const raw = e.target.dataset.count, m = raw.match(/^([\d.]+)(.*)$/);
      if (!m) return;
      const end = parseFloat(m[1]), dec = (m[1].split('.')[1] || '').length, t0 = performance.now();
      const step = (t) => { const k = Math.min(1, (t - t0) / 1400), v = end * (1 - Math.pow(1 - k, 3)); e.target.textContent = v.toFixed(dec) + m[2]; if (k < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    }), { threshold: 0.6 });
    $$('[data-count]').forEach((el) => co.observe(el));
    spotlight();
  }

  function spotlight() {
    $$('.card.spot').forEach((c) => {
      if (c._sp) return; c._sp = 1;
      c.addEventListener('pointermove', (e) => { const r = c.getBoundingClientRect(); c.style.setProperty('--mx', e.clientX - r.left + 'px'); c.style.setProperty('--my', e.clientY - r.top + 'px'); });
    });
  }
  function tilt(el) {
    if (!matchMedia('(hover: hover)').matches) return;
    el.addEventListener('pointermove', (e) => { const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5; el.style.transform = `perspective(900px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg) translateY(-4px)`; });
    el.addEventListener('pointerleave', () => (el.style.transform = ''));
  }

  // Neural-network canvas
  (function net() {
    const c = $('#net'), ctx = c.getContext('2d');
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let W, H, pts, mouse = { x: -999, y: -999 };
    const DPR = Math.min(2, devicePixelRatio || 1);
    const resize = () => {
      W = c.offsetWidth; H = c.offsetHeight; c.width = W * DPR; c.height = H * DPR; ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      const n = Math.min(90, Math.floor((W * H) / 16000));
      pts = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3 }));
    };
    resize(); addEventListener('resize', resize);
    c.parentElement.addEventListener('pointermove', (e) => { const r = c.getBoundingClientRect(); mouse = { x: e.clientX - r.left, y: e.clientY - r.top }; });
    let visible = true;
    new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(c);
    (function frame() {
      requestAnimationFrame(frame);
      if (!visible) return;
      ctx.clearRect(0, 0, W, H);
      for (const p of pts) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
        const dm = Math.hypot(p.x - mouse.x, p.y - mouse.y);
        if (dm < 140) { p.x += (p.x - mouse.x) / dm; p.y += (p.y - mouse.y) / dm; }
      }
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const a = pts[i], b = pts[j], d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 130) { ctx.strokeStyle = `rgba(92,242,200,${0.14 * (1 - d / 130)})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
        }
        ctx.fillStyle = i % 7 === 0 ? 'rgba(139,124,255,.8)' : 'rgba(232,235,243,.45)';
        ctx.beginPath(); ctx.arc(pts[i].x, pts[i].y, i % 7 === 0 ? 2 : 1.2, 0, Math.PI * 2); ctx.fill();
      }
    })();
  })();

  // Nav: scroll state, progress, active link, mobile menu, glow
  const nav = $('#nav'), links = $$('#navLinks a');
  addEventListener('scroll', () => {
    const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
    nav.classList.toggle('scrolled', y > 30);
    $('#progress').style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
    let cur = '';
    $$('main section[id]').forEach((s) => { if (s.offsetTop - 160 <= y) cur = s.id; });
    links.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + cur));
  }, { passive: true });
  $('#menuBtn').onclick = () => nav.classList.toggle('open');
  links.forEach((a) => a.addEventListener('click', () => nav.classList.remove('open')));
  addEventListener('pointermove', (e) => { $('#glow').style.transform = `translate(${e.clientX}px,${e.clientY}px)`; }, { passive: true });

  // Contact form
  $('#contactForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = Object.fromEntries(new FormData(e.target));
    const msg = $('#formMsg'), btn = $('#cSend');
    msg.className = 'form-msg'; btn.disabled = true; btn.textContent = 'Sending…';
    try {
      await api('/api/contact', { method: 'POST', body: JSON.stringify(fd) });
      msg.textContent = 'Thanks! Your message has been delivered.'; msg.classList.add('ok'); e.target.reset();
    } catch (err) { msg.textContent = err.message; msg.classList.add('err'); }
    btn.disabled = false; btn.textContent = 'Send message';
  });

  // Command palette
  let items = [], sel = 0;
  function buildPalette() {
    items = [
      ...links.map((a) => ({ label: a.textContent, hint: 'Section', go: () => location.assign(a.getAttribute('href')) })),
      ...DATA.projects.map((p) => ({ label: p.title, hint: 'Project', go: () => openProject(p.id) })),
      ...DATA.research.map((r) => ({ label: r.title, hint: 'Paper', go: () => { location.assign('#research'); } })),
      ...DATA.posts.map((p) => ({ label: p.title, hint: 'Article', go: () => location.assign('/blog/' + p.slug) })),
      ...(DATA.profile.cvUrl ? [{ label: 'Download CV', hint: 'Action', go: () => open(DATA.profile.cvUrl) }] : []),
      ...(DATA.profile.email ? [{ label: 'Copy email address', hint: 'Action', go: () => navigator.clipboard.writeText(DATA.profile.email).then(() => toast('Email copied')) }] : [])
    ];
  }
  const pal = $('#cmdk'), inp = $('#cmdkInput');
  const filtered = () => items.filter((i) => i.label.toLowerCase().includes(inp.value.toLowerCase())).slice(0, 12);
  const draw = () => {
    const f = filtered(); sel = Math.min(sel, Math.max(0, f.length - 1));
    $('#cmdkList').innerHTML = f.map((i, k) => `<li class="${k === sel ? 'sel' : ''}" data-k="${k}">${esc(i.label)}<small>${i.hint}</small></li>`).join('') || '<li>No results</li>';
    $$('#cmdkList li[data-k]').forEach((li) => (li.onclick = () => run(f[li.dataset.k])));
  };
  const openPal = () => { pal.classList.add('open'); inp.value = ''; sel = 0; draw(); setTimeout(() => inp.focus(), 10); };
  const closePal = () => pal.classList.remove('open');
  const run = (i) => { closePal(); i?.go(); };
  $('#cmdkBtn').onclick = openPal;
  pal.addEventListener('click', (e) => e.target === pal && closePal());
  inp.addEventListener('input', () => { sel = 0; draw(); });
  inp.addEventListener('keydown', (e) => {
    const f = filtered();
    if (e.key === 'ArrowDown') { sel = (sel + 1) % f.length; draw(); e.preventDefault(); }
    if (e.key === 'ArrowUp') { sel = (sel - 1 + f.length) % f.length; draw(); e.preventDefault(); }
    if (e.key === 'Enter') run(f[sel]);
  });
  addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); pal.classList.contains('open') ? closePal() : openPal(); }
    if (e.key === 'Escape') { closePal(); closeModal(); }
  });

  function injectSchema(p) {
    const s = document.createElement('script');
    s.type = 'application/ld+json';
    s.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'Person', name: p.name, description: p.tagline, email: p.email || undefined, address: p.location, sameAs: Object.values(p.socials || {}).filter(Boolean) });
    document.head.appendChild(s);
  }
})();
