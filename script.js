// ===== SENSIX Vault — Code-Based File Finder =====

let allFiles = [];

async function loadFiles() {
  try {
    const res = await fetch('manifest.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('manifest.json not found');
    const data = await res.json();
    allFiles = data.files || [];
    renderAllFiles();
  } catch (err) {
    console.error(err);
    showToast('⚠ Failed to load manifest.json');
  }
}

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '';
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  let n = bytes;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(n < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
}

function getExt(filename) {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop().toUpperCase() : 'FILE';
}

function buildCard(file, { compact } = {}) {
  const ext = getExt(file.name);
  const sizeLabel = file.size ? formatBytes(file.size) : '';

  const card = document.createElement('div');
  card.className = compact ? 'file-card' : 'file-card file-card-result';

  card.innerHTML = `
    <div class="file-icon-row">
      <div class="file-icon">${ext.slice(0, 4)}</div>
      ${sizeLabel ? `<span class="file-size">${sizeLabel}</span>` : ''}
    </div>
    <div class="file-name">${file.name}</div>
    <div class="file-desc">${file.description || ''}</div>
    <div class="file-code-tag">Code: ${file.code}</div>
    <button class="btn btn-primary btn-download" type="button">⬇ Download</button>
  `;

  card.querySelector('.btn-download').addEventListener('click', () => downloadFile(file));

  return card;
}

function renderResult(file) {
  const grid = document.getElementById('fileGrid');
  const emptyState = document.getElementById('emptyState');
  const idleState = document.getElementById('idleState');

  grid.innerHTML = '';

  if (!file) {
    emptyState.hidden = true;
    idleState.hidden = false;
    return;
  }

  idleState.hidden = true;
  emptyState.hidden = true;

  grid.appendChild(buildCard(file));
}

function renderAllFiles() {
  const grid = document.getElementById('allFilesGrid');
  const count = document.getElementById('fileCount');
  if (!grid) return;

  grid.innerHTML = '';
  count.textContent = allFiles.length === 1 ? '1 file' : `${allFiles.length} files`;

  allFiles.forEach((file) => {
    grid.appendChild(buildCard(file, { compact: true }));
  });
}

function showEmpty() {
  const grid = document.getElementById('fileGrid');
  const emptyState = document.getElementById('emptyState');
  const idleState = document.getElementById('idleState');

  grid.innerHTML = '';
  idleState.hidden = true;
  emptyState.hidden = false;
}

function showIdle() {
  const grid = document.getElementById('fileGrid');
  const emptyState = document.getElementById('emptyState');
  const idleState = document.getElementById('idleState');

  grid.innerHTML = '';
  emptyState.hidden = true;
  idleState.hidden = false;
}

// ===== Download redirect =====
function downloadFile(file) {
  if (!file.link || file.link.includes('xxxxx')) {
    showToast('⚠ No valid link set for this file yet');
    return;
  }

  showToast(`Opening “${file.name}”…`);

  setTimeout(() => {
    window.location.assign(file.link);
  }, 350);
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove('show'), 2200);
}

// ===== Code Search =====
document.getElementById('searchInput').addEventListener('input', (e) => {
  const q = e.target.value.trim();

  if (!q) {
    showIdle();
    return;
  }

  const match = allFiles.find((f) => f.code === q);

  if (match) {
    renderResult(match);
  } else {
    showEmpty();
  }
});

// ===== Theme Toggle =====
function initThemeToggle() {
  const btn = document.getElementById('themeToggle');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('sensix-theme', next);
  });
}

initThemeToggle();
loadFiles();
        
