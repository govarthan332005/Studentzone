// User-side app logic
import { db, ref, onValue } from './firebase-config.js';

// ===== Loader =====
window.addEventListener('load', () => {
  setTimeout(() => document.getElementById('loader').classList.add('hidden'), 600);
});

// ===== Navbar =====
const navbar = document.getElementById('navbar');
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 30);
  document.getElementById('scrollTop').classList.toggle('visible', window.scrollY > 400);
});

menuToggle.addEventListener('click', () => navLinks.classList.toggle('active'));
document.querySelectorAll('.nav-link').forEach(l => l.addEventListener('click', () => navLinks.classList.remove('active')));

// Active link on scroll
const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
  const scrollY = window.pageYOffset;
  sections.forEach(sec => {
    const top = sec.offsetTop - 100;
    const height = sec.offsetHeight;
    const id = sec.getAttribute('id');
    const link = document.querySelector(`.nav-link[href="#${id}"]`);
    if (!link) return;
    if (scrollY >= top && scrollY < top + height) {
      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    }
  });
});

document.getElementById('scrollTop').addEventListener('click', () =>
  window.scrollTo({ top: 0, behavior: 'smooth' }));

// ===== Modal =====
const modalOverlay = document.getElementById('modalOverlay');
const modalContent = document.getElementById('modalContent');
document.getElementById('modalClose').addEventListener('click', closeModal);
modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });
function closeModal() { modalOverlay.classList.remove('active'); }
function openModal(html) { modalContent.innerHTML = html; modalOverlay.classList.add('active'); }

// ===== State =====
let internshipsData = {};
let scholarshipsData = {};
let jobsData = {};

// ===== Animated Counter =====
function animateCounter(el, target) {
  const duration = 1200;
  const start = parseInt(el.textContent) || 0;
  const startTime = performance.now();
  function update(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    el.textContent = Math.floor(start + (target - start) * progress);
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

// ===== Render Helpers =====
function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function getApplyButton(item, type) {
  const status = (item.applyStatus || 'available').toLowerCase();
  if (status === 'walkin' || status === 'walk-in') {
    return `<button class="card-btn walkin"><i class="fa-solid fa-person-walking"></i> Walk-in Interview</button>`;
  }
  if (status === 'unavailable' || !item.applyLink) {
    return `<button class="card-btn disabled"><i class="fa-solid fa-circle-info"></i> Not Available</button>`;
  }
  return `<a href="${escapeHtml(item.applyLink)}" target="_blank" rel="noopener" class="card-btn">
    <i class="fa-solid fa-paper-plane"></i> Apply Now
  </a>`;
}

function createCard(item, type) {
  const cardClass = type === 'scholarship' ? 'scholarship' : type === 'job' ? 'job' : '';
  const icon = type === 'scholarship' ? 'fa-award' : type === 'job' ? 'fa-building' : 'fa-briefcase';
  const companyLabel = type === 'scholarship' ? (item.provider || 'Provider') : (item.company || 'Company');

  const metaItems = [];
  if (item.location) metaItems.push(`<span class="meta-item"><i class="fa-solid fa-location-dot"></i> ${escapeHtml(item.location)}</span>`);
  if (item.duration) metaItems.push(`<span class="meta-item"><i class="fa-solid fa-clock"></i> ${escapeHtml(item.duration)}</span>`);
  if (item.stipend) metaItems.push(`<span class="meta-item"><i class="fa-solid fa-indian-rupee-sign"></i> ${escapeHtml(item.stipend)}</span>`);
  if (item.amount) metaItems.push(`<span class="meta-item"><i class="fa-solid fa-sack-dollar"></i> ${escapeHtml(item.amount)}</span>`);
  if (item.salary) metaItems.push(`<span class="meta-item"><i class="fa-solid fa-sack-dollar"></i> ${escapeHtml(item.salary)}</span>`);
  if (item.deadline) metaItems.push(`<span class="meta-item"><i class="fa-solid fa-calendar"></i> ${escapeHtml(item.deadline)}</span>`);
  if (item.eligibility) metaItems.push(`<span class="meta-item"><i class="fa-solid fa-user-check"></i> ${escapeHtml(item.eligibility)}</span>`);
  if (item.type) metaItems.push(`<span class="meta-item"><i class="fa-solid fa-tag"></i> ${escapeHtml(item.type)}</span>`);

  return `
    <div class="card ${cardClass}" data-aos="fade-up">
      <div class="card-icon"><i class="fa-solid ${icon}"></i></div>
      <h3 class="card-title">${escapeHtml(item.title || 'Untitled')}</h3>
      <div class="card-company">${escapeHtml(companyLabel)}</div>
      <div class="card-meta">${metaItems.join('')}</div>
      <p class="card-description">${escapeHtml(item.description || 'No description available.')}</p>
      <div class="card-actions">
        ${getApplyButton(item, type)}
        <button class="card-btn-secondary" data-type="${type}" data-id="${item.id}" title="View Details">
          <i class="fa-solid fa-eye"></i>
        </button>
      </div>
    </div>`;
}

function renderGrid(gridId, dataObj, type, filter = '') {
  const grid = document.getElementById(gridId);
  const items = Object.entries(dataObj || {}).map(([id, v]) => ({ id, ...v }));

  let filtered = items;
  if (filter) {
    const f = filter.toLowerCase();
    filtered = items.filter(it =>
      (it.title||'').toLowerCase().includes(f) ||
      (it.company||'').toLowerCase().includes(f) ||
      (it.provider||'').toLowerCase().includes(f) ||
      (it.location||'').toLowerCase().includes(f) ||
      (it.eligibility||'').toLowerCase().includes(f)
    );
  }

  // Sort by createdAt desc
  filtered.sort((a,b) => (b.createdAt||0) - (a.createdAt||0));

  if (filtered.length === 0) {
    grid.innerHTML = `<div class="empty-state">
      <i class="fa-solid fa-folder-open"></i>
      <p>No ${type}s found ${filter ? 'matching your search' : 'yet. Check back soon!'}</p>
    </div>`;
    return;
  }

  grid.innerHTML = filtered.map(it => createCard(it, type)).join('');

  // Attach modal listeners
  grid.querySelectorAll('.card-btn-secondary').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const t = btn.dataset.type;
      let item;
      if (t === 'internship') item = { id, ...internshipsData[id] };
      else if (t === 'scholarship') item = { id, ...scholarshipsData[id] };
      else item = { id, ...jobsData[id] };
      showDetailsModal(item, t);
    });
  });
}

function showDetailsModal(item, type) {
  const companyLabel = type === 'scholarship' ? (item.provider || 'Provider') : (item.company || 'Company');
  const icon = type === 'scholarship' ? 'fa-award' : type === 'job' ? 'fa-building' : 'fa-briefcase';

  const metaItems = [];
  if (item.location) metaItems.push(`<span class="meta-item"><i class="fa-solid fa-location-dot"></i> ${escapeHtml(item.location)}</span>`);
  if (item.duration) metaItems.push(`<span class="meta-item"><i class="fa-solid fa-clock"></i> ${escapeHtml(item.duration)}</span>`);
  if (item.stipend) metaItems.push(`<span class="meta-item"><i class="fa-solid fa-indian-rupee-sign"></i> ${escapeHtml(item.stipend)}</span>`);
  if (item.amount) metaItems.push(`<span class="meta-item"><i class="fa-solid fa-sack-dollar"></i> ${escapeHtml(item.amount)}</span>`);
  if (item.salary) metaItems.push(`<span class="meta-item"><i class="fa-solid fa-sack-dollar"></i> ${escapeHtml(item.salary)}</span>`);
  if (item.deadline) metaItems.push(`<span class="meta-item"><i class="fa-solid fa-calendar"></i> Deadline: ${escapeHtml(item.deadline)}</span>`);
  if (item.eligibility) metaItems.push(`<span class="meta-item"><i class="fa-solid fa-user-check"></i> ${escapeHtml(item.eligibility)}</span>`);
  if (item.type) metaItems.push(`<span class="meta-item"><i class="fa-solid fa-tag"></i> ${escapeHtml(item.type)}</span>`);

  openModal(`
    <div class="card-icon" style="margin-bottom:20px"><i class="fa-solid ${icon}"></i></div>
    <h2>${escapeHtml(item.title || 'Untitled')}</h2>
    <div class="card-company" style="font-size:1.05rem; margin-top:4px">${escapeHtml(companyLabel)}</div>
    <div class="modal-meta">${metaItems.join('')}</div>
    <div class="modal-description">${escapeHtml(item.description || 'No description available.')}</div>
    <div class="modal-actions">${getApplyButton(item, type)}</div>
  `);
}

// ===== Firebase Listeners =====
onValue(ref(db, 'internships'), snap => {
  internshipsData = snap.val() || {};
  renderGrid('internshipsGrid', internshipsData, 'internship', document.getElementById('searchInternships').value);
  animateCounter(document.getElementById('statInternships'), Object.keys(internshipsData).length);
});

onValue(ref(db, 'scholarships'), snap => {
  scholarshipsData = snap.val() || {};
  renderGrid('scholarshipsGrid', scholarshipsData, 'scholarship', document.getElementById('searchScholarships').value);
  animateCounter(document.getElementById('statScholarships'), Object.keys(scholarshipsData).length);
});

onValue(ref(db, 'jobs'), snap => {
  jobsData = snap.val() || {};
  renderGrid('jobsGrid', jobsData, 'job', document.getElementById('searchJobs').value);
  animateCounter(document.getElementById('statJobs'), Object.keys(jobsData).length);
});

// ===== Search =====
document.getElementById('searchInternships').addEventListener('input', e =>
  renderGrid('internshipsGrid', internshipsData, 'internship', e.target.value));
document.getElementById('searchScholarships').addEventListener('input', e =>
  renderGrid('scholarshipsGrid', scholarshipsData, 'scholarship', e.target.value));
document.getElementById('searchJobs').addEventListener('input', e =>
  renderGrid('jobsGrid', jobsData, 'job', e.target.value));
