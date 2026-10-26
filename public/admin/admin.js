(() => {
  let TOKEN = localStorage.getItem('pf_token') || '';
  let DB = null, current = 'dashboard', editing = null;

  const req = async (url, method = 'GET', body) => {
    const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + TOKEN }, body: body ? JSON.stringify(body) : undefined });
    if (r.status === 401) { logout(); throw new Error('Session expired'); }
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(d.error || 'Request failed');
    return d;
  };

  // Field types: text | textarea | md | list | bool | select:A,B,C | url | image
  const COLS = {
    projects: { label: 'Projects', title: 'title', sub: (x) => `${x.category || '—'} · ${x.year || ''}`, flag: 'featured', fields: [
      ['title', 'Title', 'text'], ['summary', 'One-line summary', 'textarea'], ['category', 'Category (used for filters)', 'text'], ['year', 'Year', 'text'],
      ['tags', 'Tags / tech (comma separated)', 'list'], ['image', 'Cover image URL', 'image'], ['github', 'GitHub / source URL', 'url'], ['demo', 'Live demo URL', 'url'],
      ['featured', 'Featured project', 'bool'], ['description', 'Full write-up (Markdown)', 'md']] },
    research: { label: 'Research', title: 'title', sub: (x) => `${x.status || ''} · ${x.venue || ''} · ${x.year || ''}`, flag: 'featured', fields: [
      ['title', 'Paper title', 'text'], ['authors', 'Authors (comma separated, your name gets bolded)', 'text'], ['venue', 'Venue (journal / conference)', 'text'],
      ['year', 'Year', 'text'], ['status', 'Status', 'select:Published,Accepted,Under Review,In Progress,Preprint'], ['type', 'Type', 'select:Journal,Conference,Preprint,Thesis,Workshop,Book Chapter,Dataset'],
      ['abstract', 'Abstract', 'textarea'], ['doi', 'DOI / paper URL', 'url'], ['pdf', 'PDF URL', 'url'], ['code', 'Code / data URL', 'url'], ['tags', 'Keywords (comma separated)', 'list'], ['featured', 'Featured', 'bool']] },
    posts: { label: 'Blog posts', title: 'title', sub: (x) => `${x.date || ''} · /blog/${x.slug || ''}`, flag: 'published', flagLabel: 'Live', fields: [
      ['title', 'Title', 'text'], ['slug', 'URL slug (auto from title if empty)', 'text'], ['date', 'Date (YYYY-MM-DD)', 'text'], ['excerpt', 'Excerpt', 'textarea'],
      ['cover', 'Cover image URL', 'image'], ['tags', 'Tags (comma separated)', 'list'], ['published', 'Published (visible on site)', 'bool'], ['content', 'Content (Markdown)', 'md']] },
    education: { label: 'Education', title: 'degree', sub: (x) => `${x.institution} · ${x.start}–${x.end}`, fields: [
      ['degree', 'Degree', 'text'], ['institution', 'Institution', 'text'], ['location', 'Location', 'text'], ['start', 'Start', 'text'], ['end', 'End (or Present)', 'text'],
      ['gpa', 'GPA / result', 'text'], ['details', 'Details', 'textarea'], ['highlights', 'Highlights (comma separated)', 'list']] },
    scores: { label: 'Test scores', title: 'name', sub: (x) => `${x.score} · ${x.date || ''}`, fields: [
      ['name', 'Test (IELTS, TOEFL, GRE…)', 'text'], ['score', 'Overall score', 'text'], ['detail', 'Breakdown', 'text'], ['date', 'Date / year', 'text']] },
    experience: { label: 'Experience', title: 'role', sub: (x) => `${x.org} · ${x.start}–${x.end}`, fields: [
      ['role', 'Role', 'text'], ['org', 'Organization', 'text'], ['type', 'Type', 'select:Research,Industry,Teaching,Leadership,Volunteer,Internship'],
      ['location', 'Location', 'text'], ['start', 'Start', 'text'], ['end', 'End', 'text'], ['description', 'Description', 'textarea']] },
    skills: { label: 'Skills', title: 'group', sub: (x) => (x.items || []).join(', '), fields: [['group', 'Group name', 'text'], ['items', 'Skills (comma separated)', 'list']] },
    achievements: { label: 'Achievements', title: 'title', sub: (x) => `${x.kind} · ${x.issuer} · ${x.year}`, fields: [
      ['title', 'Title', 'text'], ['kind', 'Kind', 'select:Award,Certification,Scholarship,Grant,Competition'], ['issuer', 'Issuer', 'text'], ['year', 'Year', 'text'],
      ['link', 'Credential / link URL', 'url'], ['description', 'Description', 'textarea']] }
  };
  const ORDER = ['projects', 'research', 'posts', 'education', 'scores', 'experience', 'skills', 'achievements'];

  // ── Auth ───────────────────────────────────────────
  $('#loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    $('#loginMsg').textContent = '';
    try {
      const { token } = await api('/api/auth/login', { method: 'POST', body: JSON.stringify({ password: $('#pw').value }) });
      TOKEN = token; localStorage.setItem('pf_token', token); boot();
    } catch (err) { $('#loginMsg').textContent = err.message; }
  });
  function logout() { TOKEN = ''; localStorage.removeItem('pf_token'); $('#app').hidden = true; $('#login').style.display = ''; }
  $('#logout').onclick = logout;
  $('#sideToggle').onclick = () => $('#side').classList.toggle('open');

  async function boot() {
    try { DB = await req('/api/admin/all'); } catch { return; }
    $('#login').style.display = 'none'; $('#app').hidden = false;
    renderNav(); go(current);
  }
  if (TOKEN) boot();

  function renderNav() {
    const unread = DB.messages.filter((m) => !m.read).length;
    $('#sideNav').innerHTML =
      btn('dashboard', 'Dashboard') + btn('profile', 'Profile & socials') + '<hr>' +
      ORDER.map((k) => btn(k, COLS[k].label, DB[k].length)).join('') + '<hr>' +
      btn('messages', 'Messages', unread ? `<span class="count new">${unread}</span>` : DB.messages.length, true) + btn('backup', 'Backup & restore');
    $$('#sideNav button').forEach((b) => (b.onclick = () => { go(b.dataset.v); $('#side').classList.remove('open'); }));
    function btn(v, l, c = '', raw) { return `<button data-v="${v}" class="${v === current ? 'on' : ''}">${l}${c !== '' ? (raw && String(c).startsWith('<') ? c : `<span class="count">${c}</span>`) : ''}</button>`; }
  }

  function go(v) {
    current = v;
    $$('#sideNav button').forEach((b) => b.classList.toggle('on', b.dataset.v === v));
    $('#pageActions').innerHTML = '';
    if (v === 'dashboard') return dashboard();
    if (v === 'profile') return profile();
    if (v === 'messages') return messages();
    if (v === 'backup') return backup();
    collection(v);
  }

  // ── Dashboard ──────────────────────────────────────
  function dashboard() {
    $('#pageTitle').textContent = 'Dashboard';
    const unread = DB.messages.filter((m) => !m.read).length;
    $('#view').innerHTML = `
      <div class="dash">
        ${[['projects', 'Projects'], ['research', 'Research works'], ['posts', 'Blog posts'], ['messages', 'Unread messages', unread]].map(([k, l, v]) => `<div class="card spot" data-go="${k}"><div class="v">${v ?? DB[k].length}</div><div class="l">${l}</div></div>`).join('')}
      </div>
      <div class="card section-card">
        <h3>Quick start</h3>
        <div class="tip">
          1. Go to <b>Profile & socials</b> — set your bio, photo URL, CV link and social links.<br>
          2. Replace the sample entries in <b>Projects</b>, <b>Research</b>, <b>Education</b> and <b>Test scores</b>.<br>
          3. Write posts in <b>Blog posts</b> using Markdown (headings, code, images, tables).<br>
          4. Use the ↑ ↓ arrows to control the order things appear on the site.<br>
          5. Download a <b>backup</b> now and then.<br><br>
          <b>Images & CV:</b> put files in <code>public/assets/</code> and use <code>/assets/photo.jpg</code>, or paste any public link (GitHub, Imgur, Cloudinary, Google Drive direct link).
        </div>
      </div>`;
    $$('[data-go]').forEach((c) => (c.onclick = () => go(c.dataset.go)));
  }

  // ── Collections ────────────────────────────────────
  function collection(k) {
    const C = COLS[k];
    $('#pageTitle').textContent = C.label;
    $('#pageActions').innerHTML = `<button class="btn primary sm" id="addBtn">+ Add new</button>`;
    $('#addBtn').onclick = () => openEditor(k, null);
    const list = DB[k];
    $('#view').innerHTML = list.length ? `<div class="rows">${list.map((x, i) => `
      <div class="card row" data-id="${x.id}">
        <div class="info"><div class="t">${esc(x[C.title] || '(untitled)')}${C.flag ? `<span class="pill ${x[C.flag] ? 'on' : ''}">${x[C.flag] ? C.flagLabel || 'Featured' : C.flag === 'published' ? 'Draft' : ''}</span>` : ''}</div><div class="s">${esc(C.sub(x))}</div></div>
        <div class="acts">
          <button class="icon-btn" data-a="up" ${i === 0 ? 'disabled' : ''} title="Move up">↑</button>
          <button class="icon-btn" data-a="down" ${i === list.length - 1 ? 'disabled' : ''} title="Move down">↓</button>
          <button class="icon-btn" data-a="edit" title="Edit">✎</button>
          <button class="icon-btn danger" data-a="del" title="Delete">🗑</button>
        </div>
      </div>`).join('')}</div>` : `<div class="empty">Nothing here yet. Click <b>+ Add new</b>.</div>`;
    $$('#view .row').forEach((r) => {
      const id = r.dataset.id;
      r.querySelector('[data-a=edit]').onclick = () => openEditor(k, list.find((x) => x.id === id));
      r.querySelector('[data-a=del]').onclick = async () => {
        if (!confirm('Delete this item permanently?')) return;
        await req(`/api/admin/${k}/${id}`, 'DELETE'); DB[k] = DB[k].filter((x) => x.id !== id); toast('Deleted'); renderNav(); collection(k);
      };
      r.querySelector('[data-a=up]').onclick = () => move(k, id, -1);
      r.querySelector('[data-a=down]').onclick = () => move(k, id, 1);
    });
  }
  async function move(k, id, dir) {
    const a = DB[k], i = a.findIndex((x) => x.id === id), j = i + dir;
    if (j < 0 || j >= a.length) return;
    [a[i], a[j]] = [a[j], a[i]];
    a.forEach((x, n) => (x.order = n));
    collection(k);
    await req(`/api/admin/${k}/reorder`, 'PUT', { ids: a.map((x) => x.id) });
  }

  function fieldHTML([key, label, type], val) {
    const id = 'f_' + key;
    if (type === 'bool') return `<label class="check"><input type="checkbox" id="${id}" ${val ? 'checked' : ''} /> ${label}</label>`;
    if (type.startsWith('select:')) {
      const opts = type.slice(7).split(',');
      if (val && !opts.includes(val)) opts.push(val);
      return `<div class="field"><label for="${id}">${label}</label><select id="${id}"><option value=""></option>${opts.map((o) => `<option ${o === val ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select></div>`;
    }
    if (type === 'textarea') return `<div class="field"><label for="${id}">${label}</label><textarea id="${id}" style="min-height:110px">${esc(val)}</textarea></div>`;
    if (type === 'md') return `<div class="field"><label>${label}</label><div class="md-wrap"><div class="md-tabs"><button type="button" class="on" data-t="w">Write</button><button type="button" data-t="p">Preview</button></div><textarea id="${id}">${esc(val)}</textarea><div class="md-prev prose" hidden></div></div></div>`;
    if (type === 'list') return `<div class="field"><label for="${id}">${label}</label><input id="${id}" value="${esc((val || []).join(', '))}" /></div>`;
    const ph = type === 'url' || type === 'image' ? 'https://… or /assets/…' : '';
    return `<div class="field"><label for="${id}">${label}</label><input id="${id}" value="${esc(val)}" placeholder="${ph}" />${type === 'image' ? `<img class="img-prev" id="${id}_prev" ${val ? `src="${esc(val)}"` : 'hidden'} alt="" />` : ''}</div>`;
  }

  function openEditor(k, item) {
    const C = COLS[k];
    editing = { k, item };
    $('#edTitle').textContent = item ? `Edit — ${C.label}` : `New — ${C.label}`;
    $('#edBody').innerHTML = C.fields.map((f) => fieldHTML(f, item ? item[f[0]] : f[2] === 'bool' && f[0] === 'published' ? true : '')).join('');
    wireFields();
    $('#drawer').classList.add('open');
    setTimeout(() => $('#edBody input, #edBody textarea')?.focus(), 50);
  }
  function wireFields() {
    $$('#edBody .md-wrap').forEach((w) => {
      const ta = $('textarea', w), pv = $('.md-prev', w);
      $$('.md-tabs button', w).forEach((b) => (b.onclick = () => {
        $$('.md-tabs button', w).forEach((x) => x.classList.toggle('on', x === b));
        const p = b.dataset.t === 'p';
        ta.hidden = p; pv.hidden = !p; if (p) pv.innerHTML = md(ta.value);
      }));
    });
    $$('#edBody .img-prev').forEach((img) => {
      const inp = $('#' + img.id.replace('_prev', ''));
      inp.addEventListener('input', () => { img.hidden = !inp.value; img.src = inp.value; });
      img.onerror = () => (img.hidden = true);
    });
  }
  const closeEditor = () => { $('#drawer').classList.remove('open'); editing = null; };
  $('#edClose').onclick = $('#edCancel').onclick = closeEditor;
  $('#drawer').addEventListener('click', (e) => e.target.id === 'drawer' && closeEditor());
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && editing) closeEditor();
    if ((e.metaKey || e.ctrlKey) && e.key === 's' && editing) { e.preventDefault(); $('#editor').requestSubmit(); }
  });

  $('#editor').addEventListener('submit', async (e) => {
    e.preventDefault();
    const { k, item } = editing;
    if (k === '__profile') return;
    const body = {};
    for (const [key, , type] of COLS[k].fields) {
      const el = $('#f_' + key);
      body[key] = type === 'bool' ? el.checked : type === 'list' ? el.value.split(',').map((s) => s.trim()).filter(Boolean) : el.value;
    }
    $('#edSave').disabled = true;
    try {
      if (item) { const d = await req(`/api/admin/${k}/${item.id}`, 'PUT', body); Object.assign(item, d); }
      else { const d = await req(`/api/admin/${k}`, 'POST', body); DB[k].unshift(d); }
      toast('Saved ✓'); closeEditor(); renderNav(); collection(k);
    } catch (err) { toast(err.message); }
    $('#edSave').disabled = false;
  });

  // ── Profile ────────────────────────────────────────
  function profile() {
    const p = DB.profile;
    $('#pageTitle').textContent = 'Profile & socials';
    $('#pageActions').innerHTML = `<button class="btn primary sm" id="saveProfile">Save changes</button>`;
    const inp = (k, l, v, ph = '') => `<div class="field"><label for="p_${k}">${l}</label><input id="p_${k}" value="${esc(v)}" placeholder="${ph}" /></div>`;
    $('#view').innerHTML = `
      <div class="card section-card"><h3>Identity</h3>
        <div class="grid2">${inp('name', 'Full name', p.name)}${inp('shortName', 'Short name (nav & footer)', p.shortName)}</div>
        ${inp('roles', 'Roles — typed in hero (comma separated)', (p.roles || []).join(', '))}
        <div class="field"><label for="p_tagline">Tagline</label><textarea id="p_tagline" style="min-height:70px">${esc(p.tagline)}</textarea></div>
        <div class="field"><label for="p_bio">Bio (blank line = new paragraph)</label><textarea id="p_bio" style="min-height:180px">${esc(p.bio)}</textarea></div>
        ${inp('researchInterests', 'Research interests (comma separated)', (p.researchInterests || []).join(', '))}
        ${inp('availability', 'Availability badge (leave empty to hide)', p.availability)}
        <div class="grid2">${inp('location', 'Location', p.location)}${inp('email', 'Public email', p.email)}</div>
        <div class="grid2">${inp('avatar', 'Profile photo URL', p.avatar, '/assets/photo.jpg')}${inp('cvUrl', 'CV / Resume URL', p.cvUrl, '/assets/cv.pdf')}</div>
      </div>
      <div class="card section-card"><h3>Headline stats</h3><div id="statRows" style="display:grid;gap:8px"></div><button class="btn sm" id="addStat" style="justify-self:start">+ Add stat</button></div>
      <div class="card section-card"><h3>Social links</h3><p class="hint" style="margin:0">Leave a field empty to hide that icon.</p>
        <div class="grid2">${Object.keys(SOCIAL_META).map((k) => `<div class="field"><label for="s_${k}">${SOCIAL_META[k]}</label><input id="s_${k}" value="${esc(p.socials?.[k] || '')}" placeholder="https://" /></div>`).join('')}</div>
      </div>`;
    let stats = (p.stats || []).map((s) => ({ ...s }));
    const drawStats = () => {
      $('#statRows').innerHTML = stats.map((s, i) => `<div class="stat-row"><input data-i="${i}" data-f="label" value="${esc(s.label)}" placeholder="Label" /><input data-i="${i}" data-f="value" value="${esc(s.value)}" placeholder="Value" /><button class="icon-btn danger" data-rm="${i}">✕</button></div>`).join('');
      $$('#statRows input').forEach((el) => (el.oninput = () => (stats[el.dataset.i][el.dataset.f] = el.value)));
      $$('#statRows [data-rm]').forEach((b) => (b.onclick = () => { stats.splice(+b.dataset.rm, 1); drawStats(); }));
    };
    drawStats();
    $('#addStat').onclick = () => { stats.push({ label: '', value: '' }); drawStats(); };
    $('#saveProfile').onclick = async () => {
      const v = (k) => $('#p_' + k).value;
      const body = {
        name: v('name'), shortName: v('shortName'), tagline: v('tagline'), bio: v('bio'), availability: v('availability'),
        location: v('location'), email: v('email'), avatar: v('avatar'), cvUrl: v('cvUrl'),
        roles: v('roles'), researchInterests: v('researchInterests'), stats,
        socials: Object.fromEntries(Object.keys(SOCIAL_META).map((k) => [k, $('#s_' + k).value.trim()]))
      };
      try { DB.profile = await req('/api/admin/profile', 'PUT', body); toast('Profile saved ✓'); } catch (e) { toast(e.message); }
    };
  }

  // ── Messages ───────────────────────────────────────
  function messages() {
    $('#pageTitle').textContent = 'Messages';
    const list = DB.messages;
    $('#view').innerHTML = list.length ? `<div class="rows">${list.map((m) => `
      <div class="card row ${m.read ? '' : 'unread'}" data-id="${m.id}" style="align-items:flex-start">
        <div class="info">
          <div class="t">${esc(m.subject || '(no subject)')}${m.read ? '' : '<span class="pill on">New</span>'}</div>
          <div class="s">${esc(m.name)} · <a href="mailto:${esc(m.email)}" style="color:var(--mint)">${esc(m.email)}</a> · ${new Date(m.createdAt).toLocaleString()}</div>
          <p class="msg-body">${esc(m.message)}</p>
        </div>
        <div class="acts">
          <a class="icon-btn" href="mailto:${esc(m.email)}?subject=${encodeURIComponent('Re: ' + (m.subject || ''))}" title="Reply">↩</a>
          <button class="icon-btn" data-a="read" title="Toggle read">${m.read ? '◯' : '✓'}</button>
          <button class="icon-btn danger" data-a="del" title="Delete">🗑</button>
        </div>
      </div>`).join('')}</div>` : '<div class="empty">No messages yet. They will appear here when someone uses the contact form.</div>';
    $$('#view .row').forEach((r) => {
      const m = list.find((x) => x.id === r.dataset.id);
      r.querySelector('[data-a=read]').onclick = async () => { await req(`/api/admin/messages/${m.id}`, 'PATCH', { read: !m.read }); m.read = !m.read; renderNav(); messages(); };
      r.querySelector('[data-a=del]').onclick = async () => { if (!confirm('Delete message?')) return; await req(`/api/admin/messages/${m.id}`, 'DELETE'); DB.messages = DB.messages.filter((x) => x.id !== m.id); renderNav(); messages(); };
    });
  }

  // ── Backup ─────────────────────────────────────────
  function backup() {
    $('#pageTitle').textContent = 'Backup & restore';
    $('#view').innerHTML = `
      <div class="card section-card"><h3>Download backup</h3><p class="tip" style="margin:0">Saves all content (profile, projects, research, posts, messages) as one JSON file.</p><button class="btn sm" id="dl" style="justify-self:start">Download backup</button></div>
      <div class="card section-card"><h3>Restore from backup</h3><p class="tip" style="margin:0">Replaces current content with the file's content. Useful when moving to a new host.</p><input type="file" id="up" accept="application/json" /></div>`;
    $('#dl').onclick = async () => {
      const d = await req('/api/admin/export');
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([JSON.stringify(d, null, 2)], { type: 'application/json' }));
      a.download = `portfolio-backup-${new Date().toISOString().slice(0, 10)}.json`; a.click();
    };
    $('#up').onchange = async (e) => {
      const f = e.target.files[0]; if (!f) return;
      if (!confirm('Replace all current content with this backup?')) return;
      try { await req('/api/admin/import', 'POST', JSON.parse(await f.text())); toast('Restored ✓'); boot(); } catch (err) { toast(err.message); }
    };
  }
})();
