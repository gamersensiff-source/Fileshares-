// ===== SENSIX Vault — File Loader =====

let allFiles = [];

document.getElementById('year').textContent = new Date().getFullYear();

async function loadFiles() {
  try {
    const res = await fetch('manifest.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('manifest.json not found');
    const data = await res.json();
    allFiles = data.files || [];
    renderFiles(allFiles);
  } catch (err) {
    console.error(err);
    document.getElementById('file-count').textContent = 'Could not load files.';
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

function renderFiles(files) {
  const grid = document.getElementById('fileGrid');
  const emptyState = document.getElementById('emptyState');
  const countEl = document.getElementById('file-count');

  grid.innerHTML = '';

  if (!files.length) {
    emptyState.hidden = false;
    countEl.textContent = '0 files';
    return;
  }

  emptyState.hidden = true;
  countEl.textContent = `${files.length} file${files.length !== 1 ? 's' : ''} available`;

  files.forEach((file) => {
    const card = document.createElement('div');
    card.className = 'file-card';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');

    const ext = getExt(file.name);
    const sizeLabel = file.size ? formatBytes(file.size) : '';

    card.innerHTML = `
      <div class="file-icon-row">
        <div class="file-icon">${ext.slice(0, 4)}</div>
        ${sizeLabel ? `<span class="file-size">${sizeLabel}</span>` : ''}
      </div>
      <div class="file-name">${file.name}</div>
      <div class="file-desc">${file.description || 'Click to download'}</div>
      <div class="file-download-hint">⬇ Download</div>
    `;

    const triggerDownload = () => downloadFile(file);
    card.addEventListener('click', triggerDownload);
    card.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' || e.key === ' ') triggerDownload();
    });

    grid.appendChild(card);
  });
}

function downloadFile(file) {
  const path = `assets/${file.name}`;
  const link = document.createElement('a');
  link.href = path;
  link.download = file.name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast(`Downloading ${file.name}…`);
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove('show'), 2200);
}

// ===== Search =====
document.getElementById('searchInput').addEventListener('input', (e) => {
  const q = e.target.value.trim().toLowerCase();
  const filtered = allFiles.filter(
    (f) =>
      f.name.toLowerCase().includes(q) ||
      (f.description || '').toLowerCase().includes(q)
  );
  renderFiles(filtered);
});

loadFiles();
