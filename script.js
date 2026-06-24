// ══════════════════════════════════════════════════════════════════
//  NSP — localStorage Backend (No Server Needed)
//  All data persists permanently in the browser
// ══════════════════════════════════════════════════════════════════

// ── DB LAYER ─────────────────────────────────────────────────────
const DB = {
  get(key)       { try { return JSON.parse(localStorage.getItem('nsp_'+key)) || null; } catch { return null; } },
  set(key, val)  { localStorage.setItem('nsp_'+key, JSON.stringify(val)); },
  remove(key)    { localStorage.removeItem('nsp_'+key); },
};

// ── SEED DEFAULT DATA (only runs once on first load) ──────────────
function seedData() {
  if (DB.get('seeded')) return;

  DB.set('users', [
    { id:'u1', email:'student@nsp.com', name:'Student User', role:'student', password:'student', drive:'', photo:'', joinedAt: new Date().toISOString() },
    { id:'u2', email:'admin@nsp.com',   name:'Admin User',   role:'admin',   password:'admin',   drive:'', photo:'', joinedAt: new Date().toISOString() },
  ]);

  DB.set('notes', [
    { id:'n1', title:'Data Structures Complete Notes', course:'Data Structures', semester:'3', uploader:'Student User', uploaderId:'u1', description:'Arrays, linked lists, stacks, queues, trees and graphs with examples.', drive:'', downloads:12, rating:4.5, tags:['arrays','trees','exam prep'], comments:[{id:'c1',author:'Aayan',text:'Super helpful!',time:'2 days ago'}], createdAt: new Date().toISOString() },
    { id:'n2', title:'Algorithm Design Techniques',    course:'Algorithms',       semester:'3', uploader:'Aayan',        uploaderId:'u2', description:'Divide & conquer, greedy, dynamic programming covered in detail.',   drive:'', downloads:8,  rating:4,   tags:['DP','greedy'],          comments:[], createdAt: new Date().toISOString() },
    { id:'n3', title:'Web Dev Full Stack Notes',       course:'Web Development',  semester:'4', uploader:'Moh. Noman',   uploaderId:'u2', description:'HTML, CSS, JS, Node.js, MongoDB — full MERN stack walkthrough.',   drive:'https://drive.google.com', downloads:21, rating:5, tags:['MERN','NodeJS'], comments:[{id:'c2',author:'Noman K',text:'Best notes!',time:'3 days ago'}], createdAt: new Date().toISOString() },
    { id:'n4', title:'C Programming Fundamentals',    course:'Programming',       semester:'1', uploader:'Student User', uploaderId:'u1', description:'Pointers, functions, arrays, file handling and structures.',          drive:'', downloads:6,  rating:3.5, tags:['C','pointers'],         comments:[], createdAt: new Date().toISOString() },
    { id:'n5', title:'Algebra & Calculus Basics',     course:'Math',              semester:'1', uploader:'Piyush',       uploaderId:'u2', description:'Engineering mathematics first unit covering limits and derivatives.', drive:'', downloads:4,  rating:4,   tags:['calculus','limits'],    comments:[], createdAt: new Date().toISOString() },
    { id:'n6', title:'OOP with Java',                 course:'Programming',       semester:'2', uploader:'Noman K',      uploaderId:'u2', description:'Classes, objects, inheritance, polymorphism, interfaces and more.',   drive:'', downloads:15, rating:4.5, tags:['Java','OOP'],           comments:[], createdAt: new Date().toISOString() },
    { id:'n7', title:'DSA Notes',                     course:'Data Structures',   semester:'3', uploader:'Student User', uploaderId:'u1', description:'Quick revision notes for DSA exam prep.',                            drive:'', downloads:9,  rating:4,   tags:['DSA','revision'],       comments:[], createdAt: new Date().toISOString() },
  ]);

  DB.set('activity', [
    { type:'upload',   text:'Student User uploaded "DSA Notes"',           time:'2 hrs ago' },
    { type:'download', text:'Aayan downloaded "Web Dev Full Stack Notes"', time:'4 hrs ago' },
    { type:'bookmark', text:'Piyush bookmarked "OOP with Java"',           time:'6 hrs ago' },
    { type:'rating',   text:'Moh. Noman rated "Algorithms" ⭐ 4',          time:'Yesterday' },
  ]);

  DB.set('announcement', 'Welcome to NSP! Upload your notes and help fellow students. 🎉');
  DB.set('bookmarks', []);
  DB.set('downloads', []);
  DB.set('seeded', true);
}

// ── GETTERS / SETTERS ─────────────────────────────────────────────
function getUsers()        { return DB.get('users')        || []; }
function getNotes()        { return DB.get('notes')        || []; }
function getActivity()     { return DB.get('activity')     || []; }
function getAnnouncement() { return DB.get('announcement') || ''; }
function getBookmarks()    { return DB.get('bookmarks')    || []; }
function getDownloads()    { return DB.get('downloads')    || []; }

function saveUsers(u)    { DB.set('users', u); }
function saveNotes(n)    { DB.set('notes', n); }
function saveActivity(a) { DB.set('activity', a); }
function saveBookmarks(b){ DB.set('bookmarks', b); }
function saveDownloads(d){ DB.set('downloads', d); }

function addActivity(item) {
  const a = getActivity();
  a.unshift({ ...item, time: 'Just now' });
  if (a.length > 20) a.pop();
  saveActivity(a);
}

function genId() { return '_' + Math.random().toString(36).substr(2,9); }

// ── SESSION ───────────────────────────────────────────────────────
function getUser()  { try { return JSON.parse(localStorage.getItem('nsp_session')); } catch { return null; } }
function setUser(u) { localStorage.setItem('nsp_session', JSON.stringify(u)); }
function clearUser(){ localStorage.removeItem('nsp_session'); }

// ── AUTH HELPERS ──────────────────────────────────────────────────
function findUser(email, password) {
  return getUsers().find(u => u.email === email && u.password === password) || null;
}
function emailExists(email) {
  return getUsers().some(u => u.email === email);
}
function updateUserInDB(updated) {
  const users = getUsers().map(u => u.id === updated.id ? updated : u);
  saveUsers(users);
  setUser(updated); // update session too
}

// ── TOAST ─────────────────────────────────────────────────────────
function showToast(msg, type='') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast' + (type ? ' ' + type : '');
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}
function setSafe(id, val) { const el = document.getElementById(id); if(el) el.textContent = val; }

// ── PAGE NAV ──────────────────────────────────────────────────────
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const el = document.getElementById(pageId); if(el) el.classList.add('active');
  const footer = document.getElementById('site-footer');
  if(footer) footer.style.display = (pageId === 'app-shell') ? 'block' : 'none';
}

function showSection(name) {
  document.querySelectorAll('#app-shell .section').forEach(s => s.classList.remove('active'));
  const el = document.getElementById('sec-' + name); if(el) el.classList.add('active');
  document.querySelectorAll('#app-shell .nav-item').forEach(n => n.classList.toggle('active', n.dataset.page === name));
  if(name === 'dashboard') { setGreeting(); loadDashboard(); }
  if(name === 'search')    { loadNotes('search-results', getNotes()); loadTagsBar(); }
  if(name === 'my-notes')  { loadMyNotes(); }
  if(name === 'bookmarks') { loadBookmarks(); }
  if(name === 'profile')   { loadProfile(); }
  if(name === 'api-docs')  { loadApiDocs(); }
  if(name === 'future')    { loadFutureFeatures(); }
}

function showAdminSection(name) {
  document.querySelectorAll('#admin-page .section').forEach(s => s.classList.remove('active'));
  const el = document.getElementById('sec-' + name); if(el) el.classList.add('active');
  document.querySelectorAll('#admin-page .nav-item').forEach(n => n.classList.toggle('active', n.dataset.adminPage === name));
  if(name === 'admin-dashboard') loadAdminDashboard();
  if(name === 'admin-users')     loadAdminUsers();
  if(name === 'admin-notes')     loadAdminNotes();
  if(name === 'admin-analytics') loadAnalytics();
  if(name === 'admin-moderation')loadModeration();
  if(name === 'admin-announce')  loadAdminAnnounce();
  if(name === 'admin-settings')  { loadSiteSettings(); }
}

// ── GREETING ──────────────────────────────────────────────────────
function setGreeting() {
  const user = getUser(); const h = new Date().getHours();
  const g = h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening';
  const name = user ? user.name.split(' ')[0] : 'Student';
  setSafe('dash-greeting', g + ', ' + name + '! 👋');
  const d = document.getElementById('dash-date');
  if(d) d.textContent = new Date().toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
}

// ── COLORS ────────────────────────────────────────────────────────
const CC = { 'Data Structures':'#4f6ef7','Algorithms':'#a78bfa','Web Development':'#34d399','Programming':'#fbbf24','Math':'#f87171','Science':'#22d3ee' };
function cc(c) { return CC[c] || '#8892a4'; }

// ── DASHBOARD ─────────────────────────────────────────────────────
function loadDashboard() {
  const user = getUser(); const notes = getNotes();
  const myUploads = notes.filter(n => n.uploaderId === user?.id).length;
  setSafe('s-total-notes', notes.length);
  setSafe('s-downloads', getDownloads().length);
  setSafe('s-uploads', myUploads);
  setSafe('s-bookmarks', getBookmarks().length);
  setSafe('announce-text', getAnnouncement());
  loadActivityFeed('activity-feed');
  loadNotes('notes-grid', notes.slice(0, 6));
}

function loadActivityFeed(id) {
  const feed = document.getElementById(id); if(!feed) return;
  const isAdmin = id === 'admin-activity-feed';
  let log = getActivity();
  // students only see notes-related activity, not who joined
  if(!isAdmin) {
    log = log.filter(a => !a.text.includes('joined NSP') && !a.text.includes('updated their profile'));
  }
  if(!log.length) { feed.innerHTML = '<p style="color:var(--text3);font-size:13px;padding:10px 0">No recent activity yet.</p>'; return; }
  feed.innerHTML = log.slice(0, 6).map(a =>
    `<div class="activity-item"><span class="activity-dot ${a.type}"></span><span>${a.text}</span><span class="activity-time">${a.time}</span></div>`
  ).join('');
}

// ── TAGS ──────────────────────────────────────────────────────────
function loadTagsBar() {
  const bar = document.getElementById('search-tags-bar'); if(!bar) return;
  const allTags = [...new Set(getNotes().flatMap(n => n.tags || []))].slice(0, 12);
  bar.innerHTML = allTags.map(t => `<span class="tag-chip" onclick="filterByTag('${t}')">#${t}</span>`).join('');
}
function filterByTag(tag) {
  document.getElementById('search-query').value = tag;
  const res = getNotes().filter(n => (n.tags || []).includes(tag));
  loadNotes('search-results', res);
  document.querySelectorAll('.tag-chip').forEach(c => c.classList.toggle('active', c.textContent === '#' + tag));
  showToast(res.length + ' note' + (res.length !== 1 ? 's' : '') + ' tagged #' + tag);
}

// ── NOTE CARD ─────────────────────────────────────────────────────
function loadNotes(cid, notes) {
  const c = document.getElementById(cid); if(!c) return;
  if(!notes.length) { c.innerHTML = '<div class="empty-state"><p>📭</p><p>No notes found</p></div>'; return; }
  c.innerHTML = notes.map(n => noteCard(n)).join('');
}

function noteCard(note) {
  const color = cc(note.course);
  const bookmarks = getBookmarks();
  const isBm = bookmarks.includes(note.id);
  const stars = [1,2,3,4,5].map(s =>
    `<span class="star ${s <= Math.round(note.rating) ? 'active' : ''}" onclick="rateNote('${note.id}',${s})">★</span>`
  ).join('');
  const driveBtn = note.drive
    ? `<a href="${note.drive}" target="_blank" class="drive-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Drive</a>` : '';
  const tagsHtml = (note.tags || []).slice(0,3).map(t => `<span class="note-tag">#${t}</span>`).join('');
  const commentCount = note.comments ? note.comments.length : 0;
  const timeAgo = note.createdAt ? timeSince(new Date(note.createdAt)) : '';
  return `<div class="note-card" id="nc-${note.id}">
    <div class="note-card-header"><h3>${note.title}</h3><span class="course-tag" style="color:${color};border-color:${color}22;background:${color}18">${note.course}</span></div>
    <div class="note-meta"><div class="note-meta-row"><span>Sem ${note.semester}</span><span class="meta-dot"></span><span>${note.uploader}</span><span class="meta-dot"></span><span style="color:var(--green)">${note.downloads} dl</span>${timeAgo?`<span class="meta-dot"></span><span style="color:var(--text3)">${timeAgo}</span>`:''}</div></div>
    <div class="note-tags-row">${tagsHtml}</div>
    <p class="note-desc">${note.description || 'No description.'}</p>
    <div class="note-actions">
      <button class="preview-btn" onclick="openPreview('${note.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>Preview</button>
      <button class="download-btn" onclick="downloadNote('${note.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Download</button>
      ${driveBtn}
      <button class="comment-note-btn" onclick="openComments('${note.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>${commentCount}</button>
      <button class="share-note-btn" onclick="openShare('${note.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>Share</button>
      <button class="bookmark-btn ${isBm ? 'active' : ''}" onclick="toggleBookmark('${note.id}')"><svg viewBox="0 0 24 24" fill="${isBm ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg></button>
      <div class="star-rating">${stars}</div>
    </div>
  </div>`;
}

function timeSince(date) {
  const secs = Math.floor((new Date() - date) / 1000);
  if(secs < 60)  return 'just now';
  if(secs < 3600) return Math.floor(secs/60) + 'm ago';
  if(secs < 86400) return Math.floor(secs/3600) + 'h ago';
  return Math.floor(secs/86400) + 'd ago';
}

// ── PREVIEW ───────────────────────────────────────────────────────
let activePreviewNoteId = null;
function openPreview(id) {
  const notes = getNotes(); const note = notes.find(n => n.id === id); if(!note) return;
  activePreviewNoteId = id;
  setSafe('preview-title', note.title);
  setSafe('preview-meta', 'Course: ' + note.course + ' | Semester: ' + note.semester + ' | By: ' + note.uploader);
  const tagsHtml = (note.tags || []).map(t => `<span class="note-tag">#${t}</span>`).join('');
  const toc = ['Introduction & Overview','Key Concepts & Definitions','Examples & Diagrams','Practice Questions','Summary & Revision Tips'];
  document.getElementById('preview-body').innerHTML = `
    <div class="preview-doc-header">
      <div class="preview-doc-icon">📄</div>
      <div><div class="preview-doc-title">${note.title}</div>
      <div class="preview-doc-meta">${note.course} • Semester ${note.semester} • By ${note.uploader} • ${note.downloads} downloads</div></div>
    </div>
    <div class="preview-ocr-badge">🔍 OCR Ready — Full text searchable (Coming soon)</div>
    <div class="preview-tags-row">${tagsHtml}</div>
    <div class="preview-section"><div class="preview-section-label">Description</div><div class="preview-section-text">${note.description || 'No description provided.'}</div></div>
    <div class="preview-section"><div class="preview-section-label">Table of Contents</div><ul class="preview-toc">${toc.map(t=>`<li>${t}</li>`).join('')}</ul></div>
    <div class="preview-section"><div class="preview-section-label">Document Info</div><div class="preview-section-text">Rating: ${'★'.repeat(Math.round(note.rating))} (${note.rating}/5) &nbsp;|&nbsp; Downloads: ${note.downloads} &nbsp;|&nbsp; Uploaded: ${timeSince(new Date(note.createdAt))}<br><em style="color:var(--text3);font-size:12px">Full PDF preview available after backend integration</em></div></div>`;
  document.getElementById('preview-modal').style.display = 'flex';
}
document.getElementById('close-preview-modal').addEventListener('click', () => document.getElementById('preview-modal').style.display = 'none');
document.getElementById('close-preview-btn').addEventListener('click',   () => document.getElementById('preview-modal').style.display = 'none');
document.getElementById('preview-download-btn').addEventListener('click', () => { if(activePreviewNoteId){ downloadNote(activePreviewNoteId); document.getElementById('preview-modal').style.display = 'none'; } });
document.getElementById('preview-modal').addEventListener('click', e => { if(e.target === document.getElementById('preview-modal')) document.getElementById('preview-modal').style.display = 'none'; });

// ── DOWNLOAD ──────────────────────────────────────────────────────
function downloadNote(id) {
  const notes = getNotes(); const note = notes.find(n => n.id === id); if(!note) return;
  const user = getUser();
  note.downloads++;
  saveNotes(notes);
  const dls = getDownloads();
  if(!dls.includes(id)) { dls.push(id); saveDownloads(dls); }
  addActivity({ type:'download', text: (user?.name || 'Someone') + ' downloaded "' + note.title + '"' });

  const tags = (note.tags||[]).map(t => `<span style="display:inline-block;padding:3px 10px;background:#4f6ef722;color:#4f6ef7;border:1px solid #4f6ef744;border-radius:20px;font-size:12px;margin:2px">#${t}</span>`).join(' ');
  const stars = '★'.repeat(Math.round(note.rating||0)) + '☆'.repeat(5-Math.round(note.rating||0));
  const now = new Date().toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'});

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${note.title}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:Arial,sans-serif;background:#fff;color:#1a1f2e}
.header{background:linear-gradient(135deg,#1e3a8a,#4f6ef7);padding:32px 40px;color:#fff}
.brand{font-size:13px;color:rgba(255,255,255,0.7);margin-bottom:12px;font-weight:600;letter-spacing:.05em}
.doc-title{font-size:26px;font-weight:700;color:#fff;margin-bottom:10px;line-height:1.2}
.doc-meta{font-size:12px;color:rgba(255,255,255,0.75);display:flex;gap:18px;flex-wrap:wrap}
.body{padding:32px 40px}
.section{margin-bottom:24px}
.section-label{font-size:10px;font-weight:700;color:#94a3b8;letter-spacing:.12em;text-transform:uppercase;margin-bottom:10px;padding-bottom:5px;border-bottom:1px solid #e2e8f0}
.description{font-size:13.5px;color:#334155;line-height:1.8;background:#f8faff;padding:14px 18px;border-radius:8px;border-left:4px solid #4f6ef7}
.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.info-card{background:#f8faff;border:1px solid #e2e8f0;border-radius:8px;padding:12px 16px}
.info-label{font-size:10px;color:#94a3b8;font-weight:700;text-transform:uppercase;letter-spacing:.06em;margin-bottom:3px}
.info-value{font-size:14px;font-weight:500;color:#1e293b}
.toc{list-style:none;counter-reset:item}
.toc li{counter-increment:item;padding:9px 14px;border-left:2px solid #e2e8f0;margin-bottom:6px;font-size:13px;color:#475569;display:flex;align-items:center;gap:10px}
.toc li::before{content:counter(item);min-width:22px;height:22px;background:#4f6ef7;color:#fff;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;flex-shrink:0}
.rating{color:#f59e0b;font-size:16px}
.notice{background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:12px 16px;font-size:12px;color:#92400e;margin-top:16px}
.footer{background:#f1f5f9;border-top:1px solid #e2e8f0;padding:16px 40px;display:flex;justify-content:space-between;align-items:center;font-size:11px;color:#94a3b8;margin-top:30px}
.footer-brand{color:#4f6ef7;font-weight:600}
@media print{body{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}.no-print{display:none!important}}
.print-bar{position:fixed;top:0;left:0;right:0;background:#1e293b;padding:10px 20px;display:flex;align-items:center;justify-content:space-between;z-index:9999;box-shadow:0 2px 10px rgba(0,0,0,.3)}
.print-bar span{color:#fff;font-size:13px}
.print-bar button{padding:7px 18px;border:none;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer}
.btn-pdf{background:#4f6ef7;color:#fff;margin-left:8px}
.btn-close{background:#f87171;color:#fff}
</style>
</head><body>
<div class="print-bar no-print">
  <span>📄 NSP Note Preview — ${note.title}</span>
  <div>
    <button class="btn-pdf" onclick="window.print()">🖨️ Save as PDF</button>
    <button class="btn-close" onclick="window.close()">✕ Close</button>
  </div>
</div>
<div style="margin-top:44px">
<div class="header">
  <div class="brand">🎓 NSP — Notes Sharing Platform · SDITS Khandwa</div>
  <div class="doc-title">${note.title}</div>
  <div class="doc-meta">
    <span>📚 ${note.course}</span>
    <span>🎓 Semester ${note.semester}</span>
    <span>👤 ${note.uploader}</span>
    <span>⬇ ${note.downloads} downloads</span>
    <span>📅 ${now}</span>
  </div>
</div>
<div class="body">
  <div class="section">
    <div class="section-label">Description</div>
    <div class="description">${note.description || 'No description provided.'}</div>
  </div>
  <div class="section">
    <div class="section-label">Tags</div>
    <div>${tags || '<span style="color:#94a3b8;font-size:13px">No tags added</span>'}</div>
  </div>
  <div class="section">
    <div class="section-label">Document Information</div>
    <div class="info-grid">
      <div class="info-card"><div class="info-label">Course</div><div class="info-value">${note.course}</div></div>
      <div class="info-card"><div class="info-label">Semester</div><div class="info-value">Semester ${note.semester}</div></div>
      <div class="info-card"><div class="info-label">Uploaded By</div><div class="info-value">${note.uploader}</div></div>
      <div class="info-card"><div class="info-label">Rating</div><div class="info-value"><span class="rating">${stars}</span> (${note.rating||0}/5)</div></div>
    </div>
  </div>
  <div class="section">
    <div class="section-label">Table of Contents (Preview)</div>
    <ul class="toc">
      <li>Introduction & Overview</li>
      <li>Key Concepts & Definitions</li>
      <li>Detailed Notes & Explanations</li>
      <li>Examples & Diagrams</li>
      <li>Practice Questions</li>
      <li>Summary & Revision Tips</li>
    </ul>
  </div>
  <div class="notice">⚠️ This is a demo PDF. The actual uploaded file will be available once the Node.js + MongoDB backend is connected.</div>
</div>
<div class="footer">
  <span class="footer-brand">🎓 NSP — Notes Sharing Platform</span>
  <span>Shri Dadaji Institute of Technology & Science, Khandwa</span>
  <span>Zeeshan · Aayan · Moh. Noman · Noman K · Piyush</span>
</div>
</div>
</body></html>`;

  // use blob URL + anchor download — works without popup blocker
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.target   = '_blank';
  a.rel      = 'noopener';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 3000);

  showToast('📄 PDF preview opened — click "Save as PDF"!', 'success');
  setSafe('s-downloads', getDownloads().length);
  setSafe('pstat-downloads', getDownloads().length);
  const card = document.getElementById('nc-' + id); if(card) card.outerHTML = noteCard(note);
}
// ── BOOKMARK ──────────────────────────────────────────────────────
function toggleBookmark(id) {
  const bm = getBookmarks(); const idx = bm.indexOf(id);
  const notes = getNotes(); const note = notes.find(n => n.id === id);
  if(idx > -1) { bm.splice(idx, 1); showToast('Bookmark removed'); }
  else { bm.push(id); addActivity({ type:'bookmark', text: (getUser()?.name||'Someone') + ' bookmarked "' + (note?.title||'') + '"' }); showToast('🔖 Bookmarked!','success'); }
  saveBookmarks(bm);
  setSafe('s-bookmarks', bm.length);
  setSafe('pstat-bookmarks', bm.length);
  const card = document.getElementById('nc-' + id); if(card && note) card.outerHTML = noteCard(note);
  const active = document.querySelector('#app-shell .section.active');
  if(active?.id === 'sec-bookmarks') loadBookmarks();
}
function loadBookmarks() {
  const bm = getBookmarks(); const notes = getNotes().filter(n => bm.includes(n.id));
  loadNotes('bookmarks-grid', notes);
  if(!notes.length) document.getElementById('bookmarks-grid').innerHTML = '<div class="empty-state"><p>🔖</p><p>No bookmarks yet!</p></div>';
}

// ── RATING ────────────────────────────────────────────────────────
function rateNote(id, stars) {
  const notes = getNotes(); const note = notes.find(n => n.id === id); if(!note) return;
  note.rating = stars; saveNotes(notes);
  addActivity({ type:'rating', text: (getUser()?.name||'Someone') + ' rated "' + note.title + '" ⭐ ' + stars });
  showToast('Rated ' + stars + ' star' + (stars > 1 ? 's' : '') + '! ⭐', 'success');
  const card = document.getElementById('nc-' + id); if(card) card.outerHTML = noteCard(note);
}

// ── COMMENTS ──────────────────────────────────────────────────────
let activeCommentNoteId = null;
function openComments(id) {
  activeCommentNoteId = id;
  const notes = getNotes(); const note = notes.find(n => n.id === id); if(!note) return;
  setSafe('comments-modal-title', 'Comments — ' + note.title);
  renderComments(note);
  document.getElementById('comments-modal').style.display = 'flex';
  document.getElementById('comment-input').value = '';
}
function renderComments(note) {
  const list = document.getElementById('comments-list'); if(!list) return;
  if(!note.comments || !note.comments.length) { list.innerHTML = '<div class="no-comments">💬 No comments yet. Be the first!</div>'; return; }
  list.innerHTML = note.comments.map(c =>
    `<div class="comment-item"><div class="comment-author">${c.author}</div><div class="comment-text">${c.text}</div><div class="comment-time">${c.time}</div></div>`
  ).join('');
  list.scrollTop = list.scrollHeight;
}
document.getElementById('post-comment-btn').addEventListener('click', () => {
  const input = document.getElementById('comment-input'); const text = input.value.trim(); if(!text) return;
  const user = getUser(); if(!user) { showToast('Please login','error'); return; }
  const notes = getNotes(); const note = notes.find(n => n.id === activeCommentNoteId); if(!note) return;
  if(!note.comments) note.comments = [];
  note.comments.push({ id: genId(), author: user.name, text, time: 'Just now' });
  saveNotes(notes);
  renderComments(note); input.value = '';
  showToast('Comment posted! 💬', 'success');
  const card = document.getElementById('nc-' + note.id); if(card) card.outerHTML = noteCard(note);
});
document.getElementById('close-comments-modal').addEventListener('click', () => document.getElementById('comments-modal').style.display = 'none');
document.getElementById('comments-modal').addEventListener('click', e => { if(e.target === document.getElementById('comments-modal')) document.getElementById('comments-modal').style.display = 'none'; });

// ── SHARE ─────────────────────────────────────────────────────────
function openShare(id) {
  const note = getNotes().find(n => n.id === id); if(!note) return;
  const link = window.location.href.split('?')[0] + '?note=' + id;
  setSafe('share-note-title', '"' + note.title + '" — ' + note.course + ', Sem ' + note.semester);
  document.getElementById('share-link-input').value = link;
  document.getElementById('share-whatsapp').onclick = () => {
    const msg = encodeURIComponent('Check out these notes on NSP!\n\n📚 *' + note.title + '*\nCourse: ' + note.course + ' | Sem ' + note.semester + '\nTags: ' + (note.tags||[]).map(t=>'#'+t).join(' ') + '\n\n' + link);
    window.open('https://wa.me/?text=' + msg, '_blank');
  };
  document.getElementById('share-copy').onclick = () => {
    navigator.clipboard.writeText(link).then(() => showToast('Link copied! 📋','success')).catch(() => { document.getElementById('share-link-input').select(); document.execCommand('copy'); showToast('Link copied! 📋','success'); });
  };
  document.getElementById('share-modal').style.display = 'flex';
}
document.getElementById('close-share-modal').addEventListener('click', () => document.getElementById('share-modal').style.display = 'none');
document.getElementById('share-modal').addEventListener('click', e => { if(e.target === document.getElementById('share-modal')) document.getElementById('share-modal').style.display = 'none'; });

// ── MY NOTES ──────────────────────────────────────────────────────
function loadMyNotes() {
  const user = getUser(); const mine = getNotes().filter(n => n.uploaderId === user?.id);
  loadNotes('my-notes-grid', mine);
  if(!mine.length) document.getElementById('my-notes-grid').innerHTML = '<div class="empty-state"><p>📝</p><p>You have not uploaded any notes yet</p></div>';
}

// ── PROFILE ───────────────────────────────────────────────────────
function loadProfile() {
  const user = getUser(); if(!user) return;
  const ini = user.name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
  const bigImg = document.getElementById('profile-photo-big'); const bigIni = document.getElementById('profile-initials-big');
  if(user.photo) { if(bigImg){bigImg.src=user.photo;bigImg.style.display='block';} if(bigIni) bigIni.style.display='none'; }
  else { if(bigImg) bigImg.style.display='none'; if(bigIni){bigIni.style.display='';bigIni.textContent=ini;} }
  setSafe('profile-name-big', user.name); setSafe('profile-name', user.name);
  setSafe('profile-email', user.email);   setSafe('profile-role', user.role);
  const badge = document.getElementById('profile-role-badge');
  if(badge) { badge.textContent = user.role; badge.className = 'role-badge' + (user.role==='admin' ? ' admin' : ''); }
  const driveEl = document.getElementById('profile-drive');
  if(driveEl) { if(user.drive){driveEl.href=user.drive;driveEl.textContent='Open Drive';}else{driveEl.textContent='Not set';driveEl.href='#';} }
  const notes = getNotes();
  setSafe('pstat-uploads', notes.filter(n => n.uploaderId === user.id).length);
  setSafe('pstat-downloads', getDownloads().length);
  setSafe('pstat-bookmarks', getBookmarks().length);
  const rated = notes.filter(n => n.uploaderId === user.id && n.rating);
  setSafe('pstat-rating', rated.length ? (rated.reduce((a,b)=>a+b.rating,0)/rated.length).toFixed(1) : '—');
  const en = document.getElementById('edit-name'); if(en) en.value = user.name;
  const ee = document.getElementById('edit-email'); if(ee) ee.value = user.email;
  const ed = document.getElementById('edit-drive'); if(ed) ed.value = user.drive || '';
  const ep = document.getElementById('edit-photo-preview');
  if(ep) { if(user.photo) ep.innerHTML=`<img src="${user.photo}" style="width:100%;height:100%;border-radius:50%;object-fit:cover">`; else ep.textContent=ini; }
}

function updateSidebarUser() {
  const user = getUser(); if(!user) return;
  const ini = user.name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
  const photo = document.getElementById('sidebar-photo'); const iniEl = document.getElementById('sidebar-initials');
  if(user.photo) { if(photo){photo.src=user.photo;photo.style.display='block';} if(iniEl) iniEl.style.display='none'; }
  else { if(photo) photo.style.display='none'; if(iniEl){iniEl.style.display='';iniEl.textContent=ini;} }
  setSafe('sidebar-username', user.name);
}

// ── EDIT PROFILE ──────────────────────────────────────────────────
document.getElementById('edit-photo-file').addEventListener('change', function() {
  const file = this.files[0]; if(!file) return;
  if(file.size > 2*1024*1024) { showToast('Image too large! Max 2MB','error'); return; }
  const reader = new FileReader();
  reader.onload = e => {
    const ep = document.getElementById('edit-photo-preview');
    if(ep) ep.innerHTML = `<img src="${e.target.result}" style="width:100%;height:100%;border-radius:50%;object-fit:cover">`;
    document.getElementById('edit-photo-file').dataset.preview = e.target.result;
  };
  reader.readAsDataURL(file);
});
document.getElementById('open-edit-profile').addEventListener('click', () => { loadProfile(); document.getElementById('edit-profile-modal').style.display = 'flex'; });
document.getElementById('close-edit-modal').addEventListener('click', () => document.getElementById('edit-profile-modal').style.display = 'none');
document.getElementById('edit-profile-modal').addEventListener('click', e => { if(e.target === document.getElementById('edit-profile-modal')) document.getElementById('edit-profile-modal').style.display = 'none'; });
document.getElementById('edit-profile-form').addEventListener('submit', e => {
  e.preventDefault(); const user = getUser(); if(!user) return;
  const newName  = document.getElementById('edit-name').value.trim();
  const newEmail = document.getElementById('edit-email').value.trim();
  const newPass  = document.getElementById('edit-password').value;
  const newDrive = document.getElementById('edit-drive').value.trim();
  const photoData= document.getElementById('edit-photo-file').dataset.preview || '';
  if(newName)  user.name  = newName;
  if(newEmail) user.email = newEmail;
  if(newPass)  user.password = newPass;
  user.drive = newDrive;
  if(photoData) user.photo = photoData;
  updateUserInDB(user);
  updateSidebarUser(); loadProfile();
  addActivity({ type:'upload', text: user.name + ' updated their profile' });
  document.getElementById('edit-profile-modal').style.display = 'none';
  showToast('Profile updated! ✨', 'success');
});

// ── PASSWORD TOGGLE ───────────────────────────────────────────────
function togglePass(inputId, btn) {
  const input = document.getElementById(inputId); if(!input) return;
  const isHidden = input.type === 'password';
  input.type = isHidden ? 'text' : 'password';
  btn.classList.toggle('visible', isHidden);
  btn.innerHTML = isHidden
    ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>'
    : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
}

// ── LOGIN ─────────────────────────────────────────────────────────
document.getElementById('login-form').addEventListener('submit', e => {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const pass  = document.getElementById('login-password').value;
  const user  = findUser(email, pass);
  if(user) {
    setUser(user);
    if(user.role === 'admin') { showPage('admin-page'); showAdminSection('admin-dashboard'); }
    else { showPage('app-shell'); showSection('dashboard'); updateSidebarUser(); }
    showToast('Welcome back, ' + user.name + '! 👋', 'success');
  } else { showToast('Invalid email or password','error'); }
});

// ── SIGNUP ────────────────────────────────────────────────────────
document.getElementById('signup-form').addEventListener('submit', e => {
  e.preventDefault();
  const name    = document.getElementById('signup-name').value.trim();
  const email   = document.getElementById('signup-email').value.trim();
  const pass    = document.getElementById('signup-password').value;
  const confirm = document.getElementById('signup-confirm').value;
  if(pass !== confirm) { showToast('Passwords do not match','error'); return; }
  if(pass.length < 6)  { showToast('Password must be at least 6 characters','error'); return; }
  if(emailExists(email)) { showToast('Email already registered','error'); return; }
  const newUser = { id: genId(), email, name, role:'student', password:pass, drive:'', photo:'', joinedAt: new Date().toISOString() };
  const users = getUsers(); users.push(newUser); saveUsers(users);
  addActivity({ type:'upload', text: name + ' joined NSP' });
  showToast('Account created! Please sign in. 🎉', 'success');
  showPage('login-page'); document.getElementById('signup-form').reset();
});

// ── UPLOAD ────────────────────────────────────────────────────────
document.getElementById('upload-form').addEventListener('submit', e => {
  e.preventDefault(); const user = getUser(); if(!user) return;
  const title   = document.getElementById('note-title').value.trim();
  const desc    = document.getElementById('note-description').value.trim();
  const course  = document.getElementById('note-course').value.trim();
  const sem     = document.getElementById('note-semester').value;
  const drive   = document.getElementById('note-drive').value.trim();
  const tagsRaw = document.getElementById('note-tags').value;
  const tags    = tagsRaw.split(',').map(t=>t.trim()).filter(Boolean);
  const file    = document.getElementById('note-file').files[0];
  if(!file) { showToast('Please select a file','error'); return; }
  const newNote = { id: genId(), title, description:desc, course, semester:sem, uploader:user.name, uploaderId:user.id, drive, downloads:0, rating:0, tags, comments:[], createdAt: new Date().toISOString() };
  const notes = getNotes(); notes.unshift(newNote); saveNotes(notes);
  addActivity({ type:'upload', text: user.name + ' uploaded "' + title + '"' });
  showToast('Note uploaded! 🎉', 'success');
  document.getElementById('upload-form').reset();
  setTimeout(() => showSection('dashboard'), 900);
});

// ── SEARCH ────────────────────────────────────────────────────────
document.getElementById('search-btn').addEventListener('click', runSearch);
document.getElementById('search-query').addEventListener('keydown', e => { if(e.key === 'Enter') runSearch(); });
function runSearch() {
  const q   = document.getElementById('search-query').value.toLowerCase().trim();
  const c   = document.getElementById('filter-course').value;
  const sem = document.getElementById('filter-semester').value;
  const res = getNotes().filter(n =>
    (n.title.toLowerCase().includes(q) || n.uploader.toLowerCase().includes(q) || n.course.toLowerCase().includes(q) || (n.tags||[]).some(t=>t.toLowerCase().includes(q))) &&
    (!c || n.course === c) && (!sem || n.semester === sem)
  );
  loadNotes('search-results', res);
  showToast(res.length + ' result' + (res.length !== 1 ? 's' : '') + ' found');
}

// ── THEME ─────────────────────────────────────────────────────────
document.getElementById('theme-toggle').addEventListener('click', () => {
  document.body.classList.toggle('light'); const isL = document.body.classList.contains('light');
  document.getElementById('theme-icon-dark').style.display  = isL ? 'none'  : 'block';
  document.getElementById('theme-icon-light').style.display = isL ? 'block' : 'none';
  localStorage.setItem('nsp_theme', isL ? 'light' : 'dark');
});

// ── NAV ───────────────────────────────────────────────────────────
document.querySelectorAll('#app-shell .nav-item').forEach(link => link.addEventListener('click', e => { e.preventDefault(); showSection(e.currentTarget.dataset.page); }));
document.querySelectorAll('#admin-page .nav-item').forEach(link => link.addEventListener('click', e => { e.preventDefault(); showAdminSection(e.currentTarget.dataset.adminPage); }));
function logout() { clearUser(); showPage('login-page'); showToast('Logged out successfully'); }
document.getElementById('logout-btn').addEventListener('click',   e => { e.preventDefault(); logout(); });
document.getElementById('logout-admin').addEventListener('click', e => { e.preventDefault(); logout(); });
document.getElementById('to-signup').addEventListener('click',       e => { e.preventDefault(); showPage('signup-page'); });
document.getElementById('to-login').addEventListener('click',        e => { e.preventDefault(); showPage('login-page'); });
document.getElementById('forgot-password').addEventListener('click', e => { e.preventDefault(); showToast('Password reset not available in demo'); });

// ── ADMIN ─────────────────────────────────────────────────────────
function loadAdminDashboard() {
  const notes = getNotes(); const users = getUsers();
  const subjects = [...new Set(notes.map(n => n.course))].length;
  const totalDl  = notes.reduce((a,n) => a + (n.downloads||0), 0);
  const todayNotes = notes.filter(n => n.createdAt && (new Date()-new Date(n.createdAt)) < 86400000).length;
  setSafe('a-users', users.length);  setSafe('a-notes', notes.length);
  setSafe('a-downloads', totalDl);   setSafe('a-subjects', subjects);
  setSafe('a-bookmarks', getBookmarks().length); setSafe('a-today', todayNotes);
  loadActivityFeed('admin-activity-feed');
}
function loadAdminUsers() {
  const tbody = document.getElementById('users-table-body'); if(!tbody) return;
  tbody.innerHTML = getUsers().map((u,i) => `<tr>
    <td style="color:var(--text3)">${i+1}</td>
    <td style="color:var(--text)">${u.name}</td>
    <td>${u.email}</td>
    <td><span class="table-role ${u.role}">${u.role}</span></td>
    <td>${getNotes().filter(n=>n.uploaderId===u.id).length}</td>
    <td><button class="delete-btn" onclick="deleteUser('${u.id}')">Delete</button></td>
  </tr>`).join('');
}
function loadAdminNotes() {
  const tbody = document.getElementById('notes-table-body'); if(!tbody) return;
  tbody.innerHTML = getNotes().map((n,i) => `<tr>
    <td style="color:var(--text3)">${i+1}</td>
    <td style="color:var(--text)">${n.title}</td>
    <td><span class="course-tag" style="color:${cc(n.course)};border-color:${cc(n.course)}22;background:${cc(n.course)}18">${n.course}</span></td>
    <td style="font-size:11px;color:var(--text3)">${(n.tags||[]).slice(0,2).join(', ')}</td>
    <td>${n.semester}</td><td>${n.uploader}</td>
    <td style="color:var(--green)">${n.downloads}</td>
    <td><button class="delete-btn" onclick="deleteNote('${n.id}')">Delete</button></td>
  </tr>`).join('');
}
function loadAnalytics() {
  const cont = document.getElementById('analytics-content'); if(!cont) return;
  const notes = getNotes();
  const topNotes = [...notes].sort((a,b) => b.downloads-a.downloads).slice(0,5);
  const courseStats = [...new Set(notes.map(n=>n.course))].map(c => ({ name:c, downloads:notes.filter(n=>n.course===c).reduce((a,n)=>a+n.downloads,0) }));
  const maxDl = Math.max(...courseStats.map(c=>c.downloads), 1);
  cont.innerHTML = `<div class="analytics-grid">
    <div class="analytics-card"><div class="analytics-card-title">📥 Top Notes by Downloads</div><div class="bar-chart">${topNotes.map(n=>`<div class="bar-row"><span class="bar-label" title="${n.title}">${n.title.slice(0,12)}…</span><div class="bar-track"><div class="bar-fill" style="width:${Math.round(n.downloads/topNotes[0].downloads*100)}%;background:var(--accent)"></div></div><span class="bar-val">${n.downloads}</span></div>`).join('')}</div></div>
    <div class="analytics-card"><div class="analytics-card-title">📚 Downloads by Course</div><div class="bar-chart">${courseStats.map(c=>`<div class="bar-row"><span class="bar-label">${c.name.slice(0,10)}</span><div class="bar-track"><div class="bar-fill" style="width:${Math.round(c.downloads/maxDl*100)}%;background:${cc(c.name)}"></div></div><span class="bar-val">${c.downloads}</span></div>`).join('')}</div></div>
    <div class="analytics-card"><div class="analytics-card-title">🏷️ Popular Tags</div><div style="display:flex;flex-wrap:wrap;gap:8px">${[...new Set(notes.flatMap(n=>n.tags||[]))].map(t=>`<span class="tag-chip">#${t}</span>`).join('')}</div></div>
    <div class="analytics-card"><div class="analytics-card-title">⭐ Top Rated Notes</div><div class="bar-chart">${[...notes].sort((a,b)=>b.rating-a.rating).slice(0,5).map(n=>`<div class="bar-row"><span class="bar-label" title="${n.title}">${n.title.slice(0,12)}…</span><div class="bar-track"><div class="bar-fill" style="width:${Math.round(n.rating/5*100)}%;background:var(--amber)"></div></div><span class="bar-val">${n.rating}</span></div>`).join('')}</div></div>
  </div>`;
}
function loadModeration() {
  const cont = document.getElementById('moderation-content'); if(!cont) return;
  const notes = getNotes();
  cont.innerHTML = `<div class="moderation-list">${notes.map(n=>`<div class="mod-item">
    <div class="mod-item-info"><div class="mod-item-title">${n.title}</div><div class="mod-item-meta">By ${n.uploader} • ${n.course} • Sem ${n.semester}</div></div>
    <span class="mod-status ok">✓ Approved</span>
    <div class="mod-actions"><button class="delete-btn" onclick="deleteNote('${n.id}');loadModeration()">Remove</button></div>
  </div>`).join('')}</div>`;
}
function loadAdminAnnounce() {
  const inp = document.getElementById('announce-input'); if(inp) inp.value = getAnnouncement();
  setSafe('admin-announce-preview', getAnnouncement());
}
document.getElementById('post-announce-btn').addEventListener('click', () => {
  const val = document.getElementById('announce-input').value.trim();
  if(!val) { showToast('Please type something','error'); return; }
  DB.set('announcement', val);
  setSafe('admin-announce-preview', val); setSafe('announce-text', val);
  addActivity({ type:'upload', text:'Admin posted a new announcement' });
  showToast('Announcement posted! 📢', 'success');
});
function deleteUser(id) {
  const users = getUsers().filter(u => u.id !== id); saveUsers(users);
  loadAdminUsers(); loadAdminDashboard(); showToast('User removed','success');
}
function deleteNote(id) {
  const notes = getNotes().filter(n => n.id !== id); saveNotes(notes);
  loadAdminNotes(); loadAdminDashboard(); showToast('Note removed','success');
}

// ── API DOCS ──────────────────────────────────────────────────────
const API_ENDPOINTS = [
  {method:'POST',path:'/api/auth/register',desc:'Create a new user account with email verification and secure password hashing.'},
  {method:'POST',path:'/api/auth/login',desc:'Authenticate users and generate JSON Web Tokens for secure session management.'},
  {method:'GET', path:'/api/notes',desc:'Retrieve and search notes using query parameters for filtering by course, semester, and keywords.'},
  {method:'POST',path:'/api/notes',desc:'Upload a new note with file attachment and metadata including title, course, and semester.'},
  {method:'GET', path:'/api/notes/:id',desc:'Fetch detailed note info including preview URL, ratings, comments, and download statistics.'},
  {method:'PUT', path:'/api/notes/:id',desc:'Update note metadata such as title, description, course, and tags.'},
  {method:'DELETE',path:'/api/notes/:id',desc:'Remove a note from the platform (admin or owner only).'},
  {method:'POST',path:'/api/notes/:id/comment',desc:'Add user comments to notes for community feedback and quality discussions.'},
  {method:'POST',path:'/api/notes/:id/rate',desc:'Submit a rating from 1–5 stars to help identify the most valuable study materials.'},
  {method:'GET', path:'/api/users/:id',desc:'Fetch user profile including upload history, downloads, and reputation score.'},
  {method:'PUT', path:'/api/users/:id',desc:'Update user profile info including name, email, and profile photo.'},
  {method:'GET', path:'/api/admin/stats',desc:'Retrieve platform-wide analytics: total users, notes, downloads, and activity trends.'},
];
function loadApiDocs() {
  const c = document.getElementById('api-endpoints-list'); if(!c) return;
  c.innerHTML = API_ENDPOINTS.map(ep=>`<div class="api-endpoint"><div class="api-method-row"><span class="api-method ${ep.method.toLowerCase()}">${ep.method}</span><span class="api-path">${ep.path}</span></div><div class="api-desc">${ep.desc}</div></div>`).join('');
}

// ── FUTURE FEATURES ───────────────────────────────────────────────
const FUTURE_FEATURES = [
  {icon:'🔍',title:'OCR Integration',desc:'Extract text from images and scanned PDFs, enabling full-text search across all documents.',badge:'planned'},
  {icon:'🤖',title:'Smart Recommendations',desc:'AI-powered engine that suggests similar notes based on user preferences and course history.',badge:'planned'},
  {icon:'📊',title:'Advanced Analytics',desc:'Comprehensive analytics showing download trends, popular notes, and user engagement metrics.',badge:'coming'},
  {icon:'🛡️',title:'Advanced Moderation',desc:'Role-based access control and automated tools to maintain content quality and platform safety.',badge:'coming'},
  {icon:'💬',title:'Real-time Chat',desc:'Subject-wise group chat rooms for students to discuss notes and help each other in real time.',badge:'planned'},
  {icon:'🔔',title:'Smart Notifications',desc:'Get notified when someone comments on your notes, rates them, or uploads new notes in your subjects.',badge:'planned'},
];
function loadFutureFeatures() {
  const grid = document.getElementById('future-grid'); if(!grid) return;
  grid.innerHTML = FUTURE_FEATURES.map(f=>`<div class="future-card"><div class="future-icon">${f.icon}</div><div class="future-title">${f.title}</div><div class="future-desc">${f.desc}</div><span class="future-badge ${f.badge}">${f.badge==='planned'?'🗓 Planned':'🚀 Coming Soon'}</span></div>`).join('');
}

// ── INIT ──────────────────────────────────────────────────────────
(function init() {
  // theme
  const theme = localStorage.getItem('nsp_theme');
  if(theme === 'light') {
    document.body.classList.add('light');
    document.getElementById('theme-icon-dark').style.display  = 'none';
    document.getElementById('theme-icon-light').style.display = 'block';
  }
  // seed default data
  seedData();
  // check session
  const user = getUser();
  if(user) {
    // refresh user from DB in case updated
    const freshUser = getUsers().find(u => u.id === user.id);
    if(freshUser) setUser(freshUser);
    if(freshUser?.role === 'admin') { showPage('admin-page'); showAdminSection('admin-dashboard'); }
    else { showPage('app-shell'); showSection('dashboard'); updateSidebarUser(); }
  }
})();

// ── SITE SETTINGS ────────────────────────────────────────────────
function loadSiteSettings() {
  const s = DB.get('site_settings') || {};

  // college logo
  const logoImg = document.getElementById('settings-logo-preview-img');
  const logoFb  = document.getElementById('settings-logo-fallback');
  const savedLogo = DB.get('site_logo');
  if(savedLogo && logoImg) {
    logoImg.src = savedLogo; logoImg.style.display = 'block';
    if(logoFb) logoFb.style.display = 'none';
  } else {
    if(logoImg) logoImg.style.display = 'none';
    if(logoFb)  logoFb.style.display  = 'flex';
  }

  // fill inputs
  const set = (id, val) => { const el = document.getElementById(id); if(el && val) el.value = val; };
  set('settings-college-name',    s.collegeName    || 'Shri Dadaji Institute of Technology & Science');
  set('settings-college-city',    s.collegeCity    || 'Khandwa, M.P.');
  set('settings-college-url',     s.collegeUrl     || 'https://www.sdits.ac.in');
  set('settings-platform-name',   s.platformName   || 'NSP');
  set('settings-platform-tagline',s.platformTagline|| 'Notes Sharing Platform');
  set('settings-contact-email',   s.contactEmail   || 'admin@nsp.com');
  set('settings-footer-text',     s.footerText     || '© 2025 NSP · SDITS Khandwa');
  set('settings-team',            s.team           || 'Zeeshan\nAayan\nMoh. Noman\nNoman K\nPiyush');
  set('settings-project-title',   s.projectTitle   || 'Minor Project 2025');
  set('settings-university',      s.university     || 'RGPV University');

  // accent color
  const accent = s.accentColor || '#4f6ef7';
  const hexEl  = document.getElementById('settings-color-hex');
  const colEl  = document.getElementById('settings-custom-color');
  if(hexEl) hexEl.value = accent;
  if(colEl) colEl.value = accent;
  document.querySelectorAll('.color-swatch').forEach(sw => {
    sw.classList.toggle('active', sw.dataset.color === accent);
  });
}

function applySettings() {
  const s = DB.get('site_settings') || {};

  // apply logo everywhere
  const savedLogo = DB.get('site_logo');
  document.querySelectorAll('.college-logo').forEach(img => {
    if(savedLogo) { img.src = savedLogo; img.style.display = 'block'; }
  });
  document.querySelectorAll('.college-fallback').forEach(fb => {
    if(savedLogo) fb.style.display = 'none';
    else fb.style.display = 'flex';
  });

  // apply college name
  if(s.collegeName) {
    document.querySelectorAll('.college-name').forEach(el => el.innerHTML = s.collegeName.replace(' & ',' &<br>'));
  }
  if(s.collegeCity) {
    document.querySelectorAll('.college-city').forEach(el => el.textContent = s.collegeCity);
  }

  // apply accent color
  if(s.accentColor) {
    document.documentElement.style.setProperty('--accent', s.accentColor);
    // compute glow
    document.documentElement.style.setProperty('--accent-glow', s.accentColor + '38');
  }

  // apply platform name
  if(s.platformName) {
    document.querySelectorAll('.brand-name').forEach(el => {
      if(!el.textContent.includes('Admin')) el.textContent = s.platformName;
      else el.textContent = s.platformName + ' Admin';
    });
  }

  // apply footer
  if(s.footerText) {
    const fc = document.querySelector('.footer-copy');
    if(fc) fc.textContent = s.footerText;
  }
  if(s.contactEmail) {
    const fe = document.querySelector('.footer-link[href^="mailto"]');
    if(fe) { fe.href = 'mailto:' + s.contactEmail; fe.textContent = '📧 ' + s.contactEmail; }
  }

  // apply team credits in footer
  if(s.team) {
    const members = s.team.split('\n').map(t => t.trim()).filter(Boolean);
    const footerCols = document.querySelectorAll('.footer-col');
    if(footerCols.length >= 4) {
      const devCol = footerCols[3];
      const heading = devCol.querySelector('.footer-heading');
      if(heading) {
        // remove old member spans
        devCol.querySelectorAll('.footer-link:not([href])').forEach(el => {
          if(el.textContent !== '📧 ' + (s.contactEmail||'admin@nsp.com')) el.remove();
        });
        members.forEach(m => {
          const span = document.createElement('span');
          span.className = 'footer-link'; span.textContent = m;
          devCol.insertBefore(span, devCol.querySelector('a[href^="mailto"]'));
        });
      }
    }
  }
}

// ── LOGO UPLOAD ───────────────────────────────────────────────────
document.getElementById('settings-logo-file').addEventListener('change', function() {
  const file = this.files[0]; if(!file) return;
  if(file.size > 2*1024*1024) { showToast('Logo too large! Max 2MB','error'); return; }
  const reader = new FileReader();
  reader.onload = e => {
    DB.set('site_logo', e.target.result);
    const img = document.getElementById('settings-logo-preview-img');
    const fb  = document.getElementById('settings-logo-fallback');
    if(img) { img.src = e.target.result; img.style.display = 'block'; }
    if(fb)  fb.style.display = 'none';
    applySettings();
    showToast('College logo updated! 🏫','success');
  };
  reader.readAsDataURL(file);
});

document.getElementById('settings-logo-reset').addEventListener('click', () => {
  DB.remove('site_logo');
  const img = document.getElementById('settings-logo-preview-img');
  const fb  = document.getElementById('settings-logo-fallback');
  if(img) img.style.display = 'none';
  if(fb)  fb.style.display = 'flex';
  document.querySelectorAll('.college-logo').forEach(el => { el.src = 'college-logo.png'; el.style.display = ''; });
  document.querySelectorAll('.college-fallback').forEach(el => el.style.display = '');
  showToast('Logo reset to default','success');
});

// ── SAVE COLLEGE INFO ─────────────────────────────────────────────
document.getElementById('settings-save-college').addEventListener('click', () => {
  const s = DB.get('site_settings') || {};
  s.collegeName = document.getElementById('settings-college-name').value.trim();
  s.collegeCity = document.getElementById('settings-college-city').value.trim();
  s.collegeUrl  = document.getElementById('settings-college-url').value.trim();
  DB.set('site_settings', s);
  applySettings();
  showToast('College info saved! 🏛️','success');
});

// ── SAVE PLATFORM INFO ────────────────────────────────────────────
document.getElementById('settings-save-platform').addEventListener('click', () => {
  const s = DB.get('site_settings') || {};
  s.platformName    = document.getElementById('settings-platform-name').value.trim();
  s.platformTagline = document.getElementById('settings-platform-tagline').value.trim();
  s.contactEmail    = document.getElementById('settings-contact-email').value.trim();
  s.footerText      = document.getElementById('settings-footer-text').value.trim();
  DB.set('site_settings', s);
  applySettings();
  showToast('Platform info saved! ⚙️','success');
});

// ── SAVE CREDITS ──────────────────────────────────────────────────
document.getElementById('settings-save-credits').addEventListener('click', () => {
  const s = DB.get('site_settings') || {};
  s.team         = document.getElementById('settings-team').value.trim();
  s.projectTitle = document.getElementById('settings-project-title').value.trim();
  s.university   = document.getElementById('settings-university').value.trim();
  DB.set('site_settings', s);
  applySettings();
  showToast('Credits saved! 👨‍💻','success');
});

// ── COLOR SWATCHES ────────────────────────────────────────────────
document.querySelectorAll('.color-swatch').forEach(sw => {
  sw.addEventListener('click', () => {
    const color = sw.dataset.color;
    document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
    sw.classList.add('active');
    const hexEl = document.getElementById('settings-color-hex');
    const colEl = document.getElementById('settings-custom-color');
    if(hexEl) hexEl.value = color;
    if(colEl) colEl.value = color;
    const s = DB.get('site_settings') || {};
    s.accentColor = color; DB.set('site_settings', s);
    applySettings();
    showToast('Accent color updated! 🎨','success');
  });
});

document.getElementById('settings-apply-color').addEventListener('click', () => {
  const hex = document.getElementById('settings-color-hex').value.trim();
  if(!/^#[0-9A-Fa-f]{6}$/.test(hex)) { showToast('Enter a valid hex color like #4f6ef7','error'); return; }
  const s = DB.get('site_settings') || {};
  s.accentColor = hex; DB.set('site_settings', s);
  document.getElementById('settings-custom-color').value = hex;
  document.querySelectorAll('.color-swatch').forEach(sw => sw.classList.remove('active'));
  applySettings();
  showToast('Custom color applied! 🎨','success');
});

document.getElementById('settings-custom-color').addEventListener('input', function() {
  document.getElementById('settings-color-hex').value = this.value;
});

// ── DANGER ZONE ───────────────────────────────────────────────────
document.getElementById('reset-all-notes').addEventListener('click', () => {
  if(!confirm('Delete ALL notes? This cannot be undone!')) return;
  saveNotes([]);
  showToast('All notes deleted','success');
  loadAdminDashboard();
});

document.getElementById('reset-all-users').addEventListener('click', () => {
  if(!confirm('Reset all users to default? This cannot be undone!')) return;
  DB.set('users', [
    { id:'u1', email:'student@nsp.com', name:'Student User', role:'student', password:'student', drive:'', photo:'', joinedAt: new Date().toISOString() },
    { id:'u2', email:'admin@nsp.com',   name:'Admin User',   role:'admin',   password:'admin',   drive:'', photo:'', joinedAt: new Date().toISOString() },
  ]);
  showToast('Users reset to default','success');
  loadAdminUsers();
});

document.getElementById('reset-full-db').addEventListener('click', () => {
  if(!confirm('Full factory reset? ALL data will be deleted!')) return;
  if(!confirm('Are you SURE? This deletes everything permanently!')) return;
  DB.remove('seeded');
  DB.remove('notes'); DB.remove('users'); DB.remove('activity');
  DB.remove('bookmarks'); DB.remove('downloads'); DB.remove('announcement');
  DB.remove('site_settings'); DB.remove('site_logo');
  showToast('Factory reset done! Reloading...','success');
  setTimeout(() => location.reload(), 1500);
});

// patch showAdminSection to load settings
const _origShowAdmin = showAdminSection;
// override admin-settings loading
document.querySelectorAll('#admin-page .nav-item').forEach(link => {
  link.addEventListener('click', e => {
    if(e.currentTarget.dataset.adminPage === 'admin-settings') {
      setTimeout(() => loadSiteSettings(), 50);
    }
  });
});

// apply saved settings on every page load
setTimeout(() => applySettings(), 100);
