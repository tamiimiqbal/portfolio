// Shared helpers for public pages
window.$ = (s, r = document) => r.querySelector(s);
window.$$ = (s, r = document) => [...r.querySelectorAll(s)];
window.esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
window.api = async (url, opts = {}) => {
  const r = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...opts });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.error || 'Request failed');
  return data;
};
window.md = (src) => {
  const html = window.marked ? marked.parse(src || '', { gfm: true, breaks: false }) : esc(src).replace(/\n/g, '<br>');
  return window.DOMPurify ? DOMPurify.sanitize(html) : esc(src);
};
window.highlight = (root) => { if (window.hljs) $$('pre code', root).forEach((b) => hljs.highlightElement(b)); };
window.toast = (msg) => {
  let t = $('.toast');
  if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
  t.textContent = msg; t.classList.add('show');
  clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 2200);
};
window.fmtDate = (d) => { const x = new Date(d); return isNaN(x) ? esc(d) : x.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }); };
window.readTime = (t) => Math.max(1, Math.round((t || '').split(/\s+/).length / 220)) + ' min read';

// Icon set (24×24, stroke or fill). Brand marks are simplified glyphs.
const s = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const f = (d) => `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${d}</svg>`;
window.ICONS = {
  github: f('<path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.4 1 .1-.8.4-1.3.8-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.3 4.6 18.3 5 18.3 5c.7 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.2c0 .3.2.7.8.6A11.5 11.5 0 0 0 23.5 12C23.5 5.7 18.3.5 12 .5Z"/>'),
  linkedin: f('<path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z"/>'),
  scholar: f('<path d="M12 2 1 9l11 7 9-5.73V17h2V9L12 2Zm-6 11.18V17c0 2.2 2.7 4 6 4s6-1.8 6-4v-3.82L12 17l-6-3.82Z"/>'),
  researchgate: f('<path d="M19.6 0H4.4A4.4 4.4 0 0 0 0 4.4v15.2A4.4 4.4 0 0 0 4.4 24h15.2a4.4 4.4 0 0 0 4.4-4.4V4.4A4.4 4.4 0 0 0 19.6 0ZM15.2 18.3c-.7.1-1.3.1-1.8 0-1.1-.3-1.9-1.1-2.8-2.4-.5-.7-1-1.7-1.4-2.3h-.9v2.9c0 1 .3 1 1.3 1.1v.6H6v-.6c1-.1 1.2-.2 1.2-1.1V8.6c0-1-.2-1.1-1.2-1.2v-.6h3.9c1.2 0 2.1.2 2.8.7.6.4 1 1.1 1 2 0 1.3-.9 2.2-2.1 2.7.3.5 1 1.6 1.5 2.3.6.9 1 1.4 1.4 1.8.5.5.9.7 1.3.8l-.6 1.2Zm-5.6-6.4c.9 0 1.5-.1 1.9-.5.4-.4.6-.9.6-1.6 0-1.4-.9-2.2-2.3-2.2-.3 0-.6 0-.8.1v4.2h.6Zm8.3-1.8c-1.4 0-2.1-.8-2.1-2.4V6.3c0-1.5.8-2.4 2.2-2.4 1 0 1.7.5 1.9 1.4l-.7.2c-.2-.5-.6-.8-1.2-.8-.8 0-1.2.6-1.2 1.6v1.5c0 1 .4 1.6 1.2 1.6.7 0 1.1-.4 1.1-1.2v-.4h-1.2v-.7h2v1.1c0 1.2-.7 1.9-2 1.9Z"/>'),
  orcid: f('<path d="M12 0a12 12 0 1 0 0 24 12 12 0 0 0 0-24ZM8.2 17.6H6.7V7.4h1.5v10.2Zm-.7-11.4a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm10.9 6.3c0 2.9-1.9 5.1-5.2 5.1h-3.6V7.4h3.6c3.3 0 5.2 2.2 5.2 5.1Zm-1.6 0c0-2.2-1.3-3.7-3.7-3.7h-2v7.4h2c2.4 0 3.7-1.5 3.7-3.7Z"/>'),
  x: f('<path d="M18.9 1.2h3.7l-8 9.2 9.4 12.4h-7.4l-5.8-7.6-6.6 7.6H.5l8.6-9.8L0 1.2h7.6l5.2 6.9 6.1-6.9Zm-1.3 19.4h2L6.5 3.2H4.3l13.3 17.4Z"/>'),
  facebook: f('<path d="M24 12a12 12 0 1 0-13.9 11.9v-8.4H7.1V12h3V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9V12h3.4l-.5 3.5h-2.9v8.4A12 12 0 0 0 24 12Z"/>'),
  instagram: s('<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".6" fill="currentColor"/>'),
  youtube: f('<path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.3 3.6-6.3 3.6Z"/>'),
  kaggle: f('<path d="M18.8 23.9c0 .1-.1.1-.3.1h-3.1c-.2 0-.3-.1-.5-.3l-5.2-6.6-1.4 1.4v5.2c0 .2-.1.3-.3.3H5.6c-.2 0-.3-.1-.3-.3V.3c0-.2.1-.3.3-.3h2.4c.2 0 .3.1.3.3V15l6.4-6.5c.2-.2.3-.2.5-.2h3.2c.1 0 .2 0 .3.1v.3l-6.7 6.5 7 8.4c.1.1.1.2 0 .3Z"/>'),
  email: s('<rect x="2.5" y="4.5" width="19" height="15" rx="3"/><path d="m3.5 6.5 8.5 6.5 8.5-6.5"/>'),
  arrow: s('<path d="M5 12h14M13 6l6 6-6 6"/>'),
  arrowUp: s('<path d="M12 19V5M6 11l6-6 6 6"/>'),
  ext: s('<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>'),
  doc: s('<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>'),
  code: s('<path d="m8 8-5 4 5 4M16 8l5 4-5 4M14 4l-4 16"/>'),
  quote: s('<path d="M8 6H5a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h3v1a3 3 0 0 1-3 3M19 6h-3a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h3v1a3 3 0 0 1-3 3"/>'),
  chevron: s('<path d="m6 9 6 6 6-6"/>'),
  pin: s('<path d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/>'),
  download: s('<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>'),
  award: s('<circle cx="12" cy="9" r="6"/><path d="m8.5 14-1.5 7 5-3 5 3-1.5-7"/>'),
  cert: s('<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M7 9h6M7 12h4"/><circle cx="17" cy="15" r="3"/><path d="m15.5 17.5-.5 3.5 2-1 2 1-.5-3.5"/>'),
  cap: s('<path d="M2 9l10-5 10 5-10 5L2 9Z"/><path d="M6 11v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5"/>'),
  spark: s('<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>'),
  close: s('<path d="M6 6l12 12M18 6 6 18"/>'),
  play: s('<circle cx="12" cy="12" r="9"/><path d="m10 8.5 5.5 3.5-5.5 3.5v-7Z"/>')
};
window.SOCIAL_META = {
  github: 'GitHub', linkedin: 'LinkedIn', scholar: 'Google Scholar', researchgate: 'ResearchGate', orcid: 'ORCID',
  x: 'X (Twitter)', facebook: 'Facebook', instagram: 'Instagram', youtube: 'YouTube', kaggle: 'Kaggle'
};
window.socialLinks = (p) => {
  const out = Object.keys(SOCIAL_META)
    .filter((k) => p.socials?.[k])
    .map((k) => `<a class="social" href="${esc(p.socials[k])}" target="_blank" rel="noopener" aria-label="${SOCIAL_META[k]}" title="${SOCIAL_META[k]}">${ICONS[k]}</a>`);
  if (p.email) out.push(`<a class="social" href="mailto:${esc(p.email)}" aria-label="Email" title="Email">${ICONS.email}</a>`);
  return out.join('');
};
