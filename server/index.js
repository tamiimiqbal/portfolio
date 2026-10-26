require('dotenv').config();
const path = require('path');
const crypto = require('crypto');
const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const store = require('./store');

const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');
if (!process.env.ADMIN_PASSWORD) console.warn('⚠  ADMIN_PASSWORD not set — using "admin123". Set it before deploying!');

// ── Schemas: which fields each collection accepts, and their types ──────────
const S = 'string', B = 'bool', L = 'list';
const SCHEMAS = {
  education: { degree: S, institution: S, location: S, start: S, end: S, gpa: S, details: S, highlights: L },
  scores: { name: S, score: S, detail: S, date: S },
  research: { title: S, authors: S, venue: S, year: S, status: S, type: S, abstract: S, doi: S, pdf: S, code: S, tags: L, featured: B },
  projects: { title: S, summary: S, description: S, category: S, tags: L, image: S, github: S, demo: S, year: S, featured: B },
  experience: { role: S, org: S, type: S, location: S, start: S, end: S, description: S },
  skills: { group: S, items: L },
  achievements: { title: S, issuer: S, year: S, kind: S, description: S, link: S },
  posts: { title: S, slug: S, excerpt: S, cover: S, tags: L, published: B, date: S, content: S }
};
const PROFILE_FIELDS = ['name', 'shortName', 'tagline', 'bio', 'location', 'email', 'avatar', 'cvUrl', 'availability'];
const SOCIALS = ['github', 'linkedin', 'scholar', 'researchgate', 'orcid', 'x', 'facebook', 'instagram', 'youtube', 'kaggle'];

const str = (v, max = 20000) => (v == null ? '' : String(v)).slice(0, max);
const list = (v) => (Array.isArray(v) ? v : typeof v === 'string' ? v.split(',') : []).map((x) => str(x, 200).trim()).filter(Boolean).slice(0, 50);
const safeUrl = (v) => { const s = str(v, 2000).trim(); return /^(https?:\/\/|\/|mailto:|#|$)/i.test(s) ? s : ''; };
const URL_FIELDS = new Set(['image', 'github', 'demo', 'doi', 'pdf', 'code', 'link', 'cover', 'avatar', 'cvUrl']);
const slugify = (s) => str(s, 200).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'post';

function clean(type, body) {
  const out = {};
  for (const [k, t] of Object.entries(SCHEMAS[type])) {
    if (!(k in body)) continue;
    if (t === B) out[k] = !!body[k];
    else if (t === L) out[k] = list(body[k]);
    else out[k] = URL_FIELDS.has(k) ? safeUrl(body[k]) : str(body[k]);
  }
  if (type === 'posts' && ('slug' in body || 'title' in body)) out.slug = slugify(body.slug || body.title);
  return out;
}

// ── App ─────────────────────────────────────────────────────────────────────
const app = express();
app.set('trust proxy', 1);
app.use(compression());
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", 'https://cdnjs.cloudflare.com', 'https://cdn.jsdelivr.net'],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://cdnjs.cloudflare.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
        imgSrc: ["'self'", 'data:', 'https:'],
        frameSrc: ["'self'", 'https://www.youtube.com', 'https://drive.google.com'],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: null
      }
    },
    crossOriginEmbedderPolicy: false
  })
);
app.use(express.json({ limit: '8mb' }));

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false, message: { error: 'Too many attempts. Try again in 15 minutes.' } });
const contactLimiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 8, standardHeaders: true, legacyHeaders: false, message: { error: 'Too many messages. Please try again later.' } });

function auth(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  try {
    jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
  }
}

const byOrder = (a, b) => (a.order ?? 0) - (b.order ?? 0);

// ── Public API ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ ok: true }));

app.get('/api/content', (req, res) => {
  const s = store.get();
  const out = { profile: s.profile };
  for (const k of Object.keys(SCHEMAS)) out[k] = [...s[k]].sort(byOrder);
  out.posts = out.posts
    .filter((p) => p.published)
    .map(({ content, ...p }) => p)
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  res.set('Cache-Control', 'no-cache');
  res.json(out);
});

app.get('/api/posts/:slug', (req, res) => {
  const p = store.get().posts.find((x) => x.slug === req.params.slug && x.published);
  if (!p) return res.status(404).json({ error: 'Post not found' });
  res.json({ post: p, profile: { name: store.get().profile.name, avatar: store.get().profile.avatar } });
});

app.get('/api/projects/:id', (req, res) => {
  const p = store.get().projects.find((x) => x.id === req.params.id);
  if (!p) return res.status(404).json({ error: 'Project not found' });
  res.json({ project: p });
});

app.post('/api/contact', contactLimiter, async (req, res) => {
  const { name, email, subject, message, website } = req.body || {};
  if (website) return res.json({ ok: true }); // honeypot
  if (!str(name).trim() || !/^\S+@\S+\.\S+$/.test(str(email)) || str(message).trim().length < 5)
    return res.status(400).json({ error: 'Please give your name, a valid email and a message.' });
  store.get().messages.unshift({
    id: crypto.randomUUID(),
    name: str(name, 120),
    email: str(email, 200),
    subject: str(subject, 200),
    message: str(message, 5000),
    read: false,
    createdAt: new Date().toISOString()
  });
  store.get().messages = store.get().messages.slice(0, 500);
  await store.persist();
  res.json({ ok: true });
});

// ── Auth ────────────────────────────────────────────────────────────────────
app.post('/api/auth/login', loginLimiter, (req, res) => {
  const given = Buffer.from(str(req.body?.password, 500));
  const real = Buffer.from(ADMIN_PASSWORD);
  const ok = given.length === real.length && crypto.timingSafeEqual(given, real);
  if (!ok) return res.status(401).json({ error: 'Wrong password' });
  res.json({ token: jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '7d' }) });
});

app.get('/api/auth/me', auth, (req, res) => res.json({ ok: true }));

// ── Admin API ───────────────────────────────────────────────────────────────
app.get('/api/admin/all', auth, (req, res) => {
  const s = store.get();
  const out = { ...s };
  for (const k of Object.keys(SCHEMAS)) out[k] = [...s[k]].sort(byOrder);
  res.json(out);
});

app.put('/api/admin/profile', auth, async (req, res) => {
  const b = req.body || {};
  const p = store.get().profile;
  for (const k of PROFILE_FIELDS) if (k in b) p[k] = URL_FIELDS.has(k) ? safeUrl(b[k]) : str(b[k]);
  if ('roles' in b) p.roles = list(b.roles);
  if ('researchInterests' in b) p.researchInterests = list(b.researchInterests);
  if (Array.isArray(b.stats))
    p.stats = b.stats.slice(0, 8).map((x) => ({ label: str(x.label, 60), value: str(x.value, 30) })).filter((x) => x.label);
  if (b.socials && typeof b.socials === 'object') for (const k of SOCIALS) if (k in b.socials) p.socials[k] = safeUrl(b.socials[k]);
  await store.persist();
  res.json(p);
});

function guardType(req, res, next) {
  if (!SCHEMAS[req.params.type]) return res.status(404).json({ error: 'Unknown collection' });
  next();
}

app.post('/api/admin/:type', auth, guardType, async (req, res) => {
  const { type } = req.params;
  const arr = store.get()[type];
  const item = clean(type, req.body || {});
  if (type === 'posts') {
    const base = item.slug || slugify(item.title);
    let slug = base, i = 2;
    while (arr.some((x) => x.slug === slug)) slug = `${base}-${i++}`;
    item.slug = slug;
    item.date = item.date || new Date().toISOString().slice(0, 10);
  }
  const now = new Date().toISOString();
  const doc = { id: crypto.randomUUID(), order: arr.reduce((m, x) => Math.min(m, x.order ?? 0), 0) - 1, createdAt: now, updatedAt: now, ...item };
  arr.push(doc);
  await store.persist();
  res.status(201).json(doc);
});

app.put('/api/admin/:type/reorder', auth, guardType, async (req, res) => {
  const ids = Array.isArray(req.body?.ids) ? req.body.ids : [];
  const arr = store.get()[req.params.type];
  ids.forEach((id, i) => { const x = arr.find((d) => d.id === id); if (x) x.order = i; });
  await store.persist();
  res.json({ ok: true });
});

app.put('/api/admin/:type/:id', auth, guardType, async (req, res) => {
  const { type, id } = req.params;
  const arr = store.get()[type];
  const doc = arr.find((x) => x.id === id);
  if (!doc) return res.status(404).json({ error: 'Not found' });
  const upd = clean(type, req.body || {});
  if (type === 'posts' && upd.slug && arr.some((x) => x.slug === upd.slug && x.id !== id)) upd.slug += '-' + id.slice(0, 4);
  Object.assign(doc, upd, { updatedAt: new Date().toISOString() });
  await store.persist();
  res.json(doc);
});

app.delete('/api/admin/:type/:id', auth, guardType, async (req, res) => {
  const s = store.get();
  const { type, id } = req.params;
  s[type] = s[type].filter((x) => x.id !== id);
  await store.persist();
  res.json({ ok: true });
});

app.patch('/api/admin/messages/:id', auth, async (req, res) => {
  const m = store.get().messages.find((x) => x.id === req.params.id);
  if (!m) return res.status(404).json({ error: 'Not found' });
  m.read = !!req.body?.read;
  await store.persist();
  res.json(m);
});

app.delete('/api/admin/messages/:id', auth, async (req, res) => {
  const s = store.get();
  s.messages = s.messages.filter((x) => x.id !== req.params.id);
  await store.persist();
  res.json({ ok: true });
});

app.get('/api/admin/export', auth, (req, res) => {
  res.setHeader('Content-Disposition', 'attachment; filename="portfolio-backup.json"');
  res.json(store.get());
});

app.post('/api/admin/import', auth, async (req, res) => {
  const b = req.body;
  if (!b || typeof b !== 'object' || !b.profile) return res.status(400).json({ error: 'Invalid backup file' });
  const s = store.get();
  for (const k of [...Object.keys(SCHEMAS), 'messages']) if (Array.isArray(b[k])) s[k] = b[k];
  s.profile = { ...s.profile, ...b.profile };
  await store.persist();
  res.json({ ok: true });
});

app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

// ── Static frontend ─────────────────────────────────────────────────────────
const PUB = path.join(__dirname, '..', 'public');
app.use(express.static(PUB, { extensions: ['html'], maxAge: '1h' }));
app.get('/blog/:slug', (req, res) => res.sendFile(path.join(PUB, 'post.html')));
app.get('/project/:id', (req, res) => res.sendFile(path.join(PUB, 'project.html')));
app.get('/admin*', (req, res) => res.sendFile(path.join(PUB, 'admin', 'index.html')));
app.use((req, res) => res.status(404).sendFile(path.join(PUB, '404.html')));

store
  .init()
  .then(() => app.listen(PORT, () => console.log(`\n  ✦ Portfolio running → http://localhost:${PORT}\n  ✦ Admin panel      → http://localhost:${PORT}/admin\n`)))
  .catch((e) => {
    console.error('Failed to start:', e);
    process.exit(1);
  });
