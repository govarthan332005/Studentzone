// ========================================
// StudentsZone — User Web App Logic
// ========================================

import { db, ref, onValue } from './firebase-config.js';

// ===== Splash =====
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('splash')?.classList.add('hidden');
  }, 700);
});

// Prevent pinch-zoom
document.addEventListener('gesturestart', e => e.preventDefault());
document.addEventListener('gesturechange', e => e.preventDefault());
document.addEventListener('dblclick', e => e.preventDefault(), { passive: false });

// ========================================
// State
// ========================================
const state = {
  internships: {},
  scholarships: {},
  jobs: {},
  currentPage: 'home',
  filters: {
    internships: { search: '', chip: 'all' },
    scholarships: { search: '', chip: 'all' },
    jobs: { search: '', chip: 'all' }
  }
};

// ========================================
// Page Navigation
// ========================================
const pages = document.querySelectorAll('.page');
const bnavItems = document.querySelectorAll('.bnav-item');

function navigateTo(pageName) {
  state.currentPage = pageName;
  pages.forEach(p => p.classList.toggle('active', p.dataset.page === pageName));
  bnavItems.forEach(b => b.classList.toggle('active', b.dataset.pageTarget === pageName));
  // Scroll page to top
  const active = document.getElementById(`page-${pageName}`);
  if (active) {
    const scroll = active.querySelector('.page-scroll');
    if (scroll) scroll.scrollTop = 0;
  }
  // Close search if open
  searchStrip.classList.remove('active');
}

// Bind all elements with data-page-target
document.querySelectorAll('[data-page-target]').forEach(el => {
  el.addEventListener('click', () => navigateTo(el.dataset.pageTarget));
});

// ========================================
// Search Toggle
// ========================================
const searchToggle = document.getElementById('searchToggle');
const searchStrip = document.getElementById('searchStrip');
const searchClose = document.getElementById('searchClose');
const globalSearch = document.getElementById('globalSearch');

searchToggle.addEventListener('click', () => {
  const isActive = searchStrip.classList.toggle('active');
  if (isActive) setTimeout(() => globalSearch.focus(), 100);
});
searchClose.addEventListener('click', () => {
  searchStrip.classList.remove('active');
  globalSearch.value = '';
  // Reset all page filters search
  document.getElementById('filterInternships').value = '';
  document.getElementById('filterScholarships').value = '';
  document.getElementById('filterJobs').value = '';
  state.filters.internships.search = '';
  state.filters.scholarships.search = '';
  state.filters.jobs.search = '';
  renderAll();
});

globalSearch.addEventListener('input', e => {
  const q = e.target.value.toLowerCase();
  // Apply to all 3
  state.filters.internships.search = q;
  state.filters.scholarships.search = q;
  state.filters.jobs.search = q;
  document.getElementById('filterInternships').value = q;
  document.getElementById('filterScholarships').value = q;
  document.getElementById('filterJobs').value = q;
  renderAll();
});

// ========================================
// Helpers
// ========================================
function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function timeAgo(ts) {
  if (!ts) return '';
  const diff = Date.now() - ts;
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return 'just now';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}d ago`;
  return `${Math.floor(day / 30)}mo ago`;
}

// ========================================
// Card Builders
// ========================================
function statusBadge(status) {
  const s = (status || 'available').toLowerCase();
  if (s === 'walkin' || s === 'walk-in')
    return `<span class="card-badge badge-walkin"><i class="fa-solid fa-person-walking"></i> Walk-in</span>`;
  if (s === 'unavailable')
    return `<span class="card-badge badge-unavailable"><i class="fa-solid fa-circle-xmark"></i> Closed</span>`;
  return `<span class="card-badge badge-available"><i class="fa-solid fa-circle-check"></i> Open</span>`;
}

function applyButton(item) {
  const s = (item.applyStatus || 'available').toLowerCase();
  if (s === 'walkin' || s === 'walk-in')
    return `<button class="btn-apply walkin"><i class="fa-solid fa-person-walking"></i> Walk-in Interview</button>`;
  if (s === 'unavailable' || !item.applyLink)
    return `<button class="btn-apply disabled" disabled><i class="fa-solid fa-circle-info"></i> Not Available</button>`;
  return `<a href="${escapeHtml(item.applyLink)}" target="_blank" rel="noopener noreferrer" class="btn-apply">
    <i class="fa-solid fa-paper-plane"></i> Apply Now
  </a>`;
}

function buildMeta(item, type) {
  const m = [];
  if (item.location) m.push(`<span class="meta-tag"><i class="fa-solid fa-location-dot"></i> ${escapeHtml(item.location)}</span>`);
  if (item.duration) m.push(`<span class="meta-tag"><i class="fa-solid fa-clock"></i> ${escapeHtml(item.duration)}</span>`);
  const money = item.stipend || item.amount || item.salary;
  if (money) {
    const icon = type === 'scholarship' ? 'fa-sack-dollar' : 'fa-money-bill-wave';
    m.push(`<span class="meta-tag"><i class="fa-solid ${icon}"></i> ${escapeHtml(money)}</span>`);
  }
  if (item.deadline) m.push(`<span class="meta-tag"><i class="fa-solid fa-calendar-day"></i> ${escapeHtml(item.deadline)}</span>`);
  if (item.eligibility) m.push(`<span class="meta-tag"><i class="fa-solid fa-user-check"></i> ${escapeHtml(item.eligibility)}</span>`);
  if (item.type) m.push(`<span class="meta-tag"><i class="fa-solid fa-tag"></i> ${escapeHtml(item.type)}</span>`);
  return m.join('');
}

function buildCard(item, type) {
  const icon = type === 'scholarship' ? 'fa-award' : type === 'job' ? 'fa-building' : 'fa-briefcase';
  const company = type === 'scholarship' ? (item.provider || 'Provider') : (item.company || 'Company');

  return `
    <article class="card type-${type}" data-id="${item.id}" data-type="${type}">
      <div class="card-top">
        <div class="card-ico"><i class="fa-solid ${icon}"></i></div>
        ${statusBadge(item.applyStatus)}
      </div>
      <h3 class="card-title">${escapeHtml(item.title || 'Untitled')}</h3>
      <div class="card-company"><i class="fa-solid fa-building"></i> ${escapeHtml(company)}</div>
      <div class="card-meta">${buildMeta(item, type)}</div>
      <p class="card-desc">${escapeHtml(item.description || 'Tap to see full details.')}</p>
      <div class="card-foot">
        ${applyButton(item)}
        <button class="btn-view" data-detail="${item.id}" data-detail-type="${type}" aria-label="View details">
          <i class="fa-solid fa-arrow-up-right-from-square"></i>
        </button>
      </div>
    </article>
  `;
}

// ========================================
// Render
// ========================================
function getList(type) {
  const map = type === 'internship' ? state.internships
    : type === 'scholarship' ? state.scholarships
    : state.jobs;
  return Object.entries(map).map(([id, v]) => ({ id, ...v }))
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

function filterList(items, type) {
  const key = type + 's'; // internships, scholarships, jobs
  const f = state.filters[key];
  let result = items;

  if (f.search) {
    const q = f.search.toLowerCase();
    result = result.filter(it =>
      (it.title || '').toLowerCase().includes(q) ||
      (it.company || '').toLowerCase().includes(q) ||
      (it.provider || '').toLowerCase().includes(q) ||
      (it.location || '').toLowerCase().includes(q) ||
      (it.eligibility || '').toLowerCase().includes(q) ||
      (it.description || '').toLowerCase().includes(q)
    );
  }

  if (f.chip && f.chip !== 'all') {
    if (f.chip === 'available') result = result.filter(it => (it.applyStatus || 'available') === 'available');
    else if (f.chip === 'walkin') result = result.filter(it => (it.applyStatus || '') === 'walkin');
    else if (f.chip === 'remote') result = result.filter(it =>
      (it.location || '').toLowerCase().includes('remote') ||
      (it.type || '').toLowerCase().includes('remote'));
  }
  return result;
}

function emptyState(typeLabel, hasFilter) {
  return `<div class="empty-state">
    <i class="fa-solid ${hasFilter ? 'fa-magnifying-glass' : 'fa-folder-open'}"></i>
    <p>${hasFilter ? `No ${typeLabel} match your filters.` : `No ${typeLabel} yet. Check back soon!`}</p>
  </div>`;
}

function renderFeatured(elId, type, limit = 6) {
  const el = document.getElementById(elId);
  if (!el) return;
  const items = getList(type).slice(0, limit);
  if (items.length === 0) {
    el.innerHTML = `<div class="empty-state" style="min-width:100%"><i class="fa-solid fa-folder-open"></i><p>No ${type}s yet.</p></div>`;
    return;
  }
  el.innerHTML = items.map(it => buildCard(it, type)).join('');
  attachCardListeners(el);
}

function renderList(elId, type) {
  const el = document.getElementById(elId);
  if (!el) return;
  const all = getList(type);
  const filtered = filterList(all, type);
  const f = state.filters[type + 's'];
  const hasFilter = f.search || f.chip !== 'all';

  if (filtered.length === 0) {
    el.innerHTML = emptyState(type + 's', hasFilter);
    return;
  }
  el.innerHTML = filtered.map(it => buildCard(it, type)).join('');
  attachCardListeners(el);
}

function renderAll() {
  renderFeatured('featuredInternships', 'internship');
  renderFeatured('featuredScholarships', 'scholarship');
  renderFeatured('featuredJobs', 'job');
  renderList('listInternships', 'internship');
  renderList('listScholarships', 'scholarship');
  renderList('listJobs', 'job');
}

function attachCardListeners(container) {
  // Open detail sheet
  container.querySelectorAll('[data-detail]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      openDetail(btn.dataset.detail, btn.dataset.detailType);
    });
  });
  // Click on card body opens detail (excluding apply link)
  container.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.closest('.btn-apply') || e.target.closest('.btn-view')) return;
      openDetail(card.dataset.id, card.dataset.type);
    });
  });
}

// ========================================
// Counter Animation
// ========================================
function animateCount(el, target) {
  if (!el) return;
  const start = parseInt(el.textContent) || 0;
  const dur = 800;
  const t0 = performance.now();
  function tick(now) {
    const p = Math.min((now - t0) / dur, 1);
    const v = Math.floor(start + (target - start) * (1 - Math.pow(1 - p, 3)));
    el.textContent = v;
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// ========================================
// Detail Sheet
// ========================================
const sheetOverlay = document.getElementById('sheetOverlay');
const sheetClose = document.getElementById('sheetClose');
const sheetContent = document.getElementById('sheetContent');

function openDetail(id, type) {
  const map = type === 'internship' ? state.internships
    : type === 'scholarship' ? state.scholarships
    : state.jobs;
  const item = { id, ...map[id] };
  if (!map[id]) return;

  const icon = type === 'scholarship' ? 'fa-award' : type === 'job' ? 'fa-building' : 'fa-briefcase';
  const company = type === 'scholarship' ? (item.provider || 'Provider') : (item.company || 'Company');

  sheetContent.className = `sheet-content type-${type}`;
  sheetContent.style.setProperty('--card-grad',
    type === 'internship' ? 'var(--grad-blue)' :
    type === 'scholarship' ? 'var(--grad-purple)' : 'var(--grad-orange)');
  sheetContent.style.setProperty('--card-color',
    type === 'internship' ? '#818cf8' :
    type === 'scholarship' ? '#c084fc' : '#fb7185');

  sheetContent.innerHTML = `
    <div class="sheet-ico-large"><i class="fa-solid ${icon}"></i></div>
    <h2 class="sheet-title">${escapeHtml(item.title || 'Untitled')}</h2>
    <div class="sheet-company"><i class="fa-solid fa-building"></i> ${escapeHtml(company)}</div>
    <div class="sheet-meta">${buildMeta(item, type)} ${statusBadge(item.applyStatus)}</div>
    ${item.description ? `<div class="sheet-section">
      <h4><i class="fa-solid fa-circle-info"></i> About this opportunity</h4>
      <p class="sheet-desc">${escapeHtml(item.description)}</p>
    </div>` : ''}
    ${item.eligibility ? `<div class="sheet-section">
      <h4><i class="fa-solid fa-user-check"></i> Eligibility</h4>
      <p class="sheet-desc">${escapeHtml(item.eligibility)}</p>
    </div>` : ''}
    ${item.createdAt ? `<div class="sheet-section" style="color:var(--text-dim); font-size:0.82rem;">
      <i class="fa-regular fa-clock"></i> Posted ${timeAgo(item.createdAt)}
    </div>` : ''}
    <div class="sheet-actions">
      ${applyButton(item)}
      <button class="btn-view" id="shareBtn" aria-label="Share"><i class="fa-solid fa-share-nodes"></i></button>
    </div>
  `;
  sheetOverlay.classList.add('active');

  // Share
  const shareBtn = document.getElementById('shareBtn');
  if (shareBtn) shareBtn.addEventListener('click', () => shareItem(item, type));
}

function closeSheet() { sheetOverlay.classList.remove('active'); }
sheetClose.addEventListener('click', closeSheet);
sheetOverlay.addEventListener('click', e => { if (e.target === sheetOverlay) closeSheet(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSheet(); });

// Swipe down to close
let sheetStartY = null;
const sheetEl = document.getElementById('sheet');
sheetEl.addEventListener('touchstart', e => {
  if (e.target.closest('.sheet-content')) {
    const sc = sheetEl.querySelector('.sheet-content');
    if (sc.scrollTop > 0) { sheetStartY = null; return; }
  }
  sheetStartY = e.touches[0].clientY;
}, { passive: true });
sheetEl.addEventListener('touchmove', e => {
  if (sheetStartY == null) return;
  const dy = e.touches[0].clientY - sheetStartY;
  if (dy > 0) sheetEl.style.transform = `translateY(${dy}px)`;
}, { passive: true });
sheetEl.addEventListener('touchend', e => {
  if (sheetStartY == null) return;
  const dy = (e.changedTouches[0].clientY - sheetStartY);
  sheetEl.style.transform = '';
  if (dy > 100) closeSheet();
  sheetStartY = null;
}, { passive: true });

// ========================================
// Share
// ========================================
function shareItem(item, type) {
  const title = item.title || 'StudentsZone Opportunity';
  const text = `Check out this ${type} on StudentsZone: ${title}`;
  const url = window.location.href;
  if (navigator.share) {
    navigator.share({ title, text, url }).catch(() => {});
  } else {
    navigator.clipboard?.writeText(`${title} — ${url}`);
    showToast('Link copied to clipboard');
  }
}

// ========================================
// Toast
// ========================================
const toast = document.getElementById('toast');
const toastMsg = document.getElementById('toastMsg');
let toastTimer;
function showToast(msg) {
  toastMsg.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
}

// ========================================
// Filter Inputs & Chips
// ========================================
['Internships', 'Scholarships', 'Jobs'].forEach(label => {
  const type = label.toLowerCase();
  const input = document.getElementById(`filter${label}`);
  const chipRow = document.getElementById(`chips${label}`);

  input?.addEventListener('input', e => {
    state.filters[type].search = e.target.value.toLowerCase();
    renderList(`list${label}`, type.slice(0, -1));
  });

  chipRow?.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      chipRow.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      state.filters[type].chip = chip.dataset.filter;
      renderList(`list${label}`, type.slice(0, -1));
    });
  });
});

// ========================================
// Firebase Listeners (with error handling)
// ========================================
function bind(path, key, statId) {
  onValue(ref(db, path), snap => {
    const val = snap.val() || {};
    state[key] = val;
    renderAll();
    const count = Object.keys(val).length;
    const statEl = document.getElementById(statId);
    if (statEl) animateCount(statEl, count);
  }, err => {
    console.error(`Failed to load ${path}:`, err);
    showToast(`Couldn't load ${key}. Check connection.`);
  });
}

bind('internships', 'internships', 'statInternships');
bind('scholarships', 'scholarships', 'statScholarships');
bind('jobs', 'jobs', 'statJobs');

// ========================================
// Notification button (placeholder)
// ========================================
document.getElementById('notifBtn').addEventListener('click', () => {
  showToast('No new notifications');
  document.querySelector('.notif-dot')?.remove();
});
