// ===== SENSIX Vault — Code-Based File Finder =====

let allFiles = [];

async function loadFiles() {
  try {
    const res = await fetch('manifest.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('manifest.json not found');
    const data = await res.json();
    allFiles = data.files || [];
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

  const ext = getExt(file.name);
  const sizeLabel = file.size ? formatBytes(file.size) : '';

  const card = document.createElement('div');
  card.className = 'file-card file-card-result';

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

  grid.appendChild(card);
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

function downloadFile(file) {
  if (!file.link) {
    showToast('⚠ No link set for this file');
    return;
  }
  showToast(`Redirecting to download ${file.name}…`);
  setTimeout(() => {
    window.location.href = file.link;
  }, 400);
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

loadFiles();

// ===== Share File Form =====
// ⚠️ CHANGE THIS to the Gmail address that should receive submissions
const REVIEW_EMAIL = 'arpitkashyap2007@gmail.com';

const fileDrop = document.getElementById('fileDrop');
const fileUploadInput = document.getElementById('fileUpload');
const fileDropLabel = document.getElementById('fileDropLabel');

if (fileUploadInput) {
  fileUploadInput.addEventListener('change', () => {
    if (fileUploadInput.files.length > 0) {
      const f = fileUploadInput.files[0];
      fileDropLabel.textContent = `✅ ${f.name} (${formatBytes(f.size)})`;
    } else {
      fileDropLabel.textContent = '📎 Choose a file or drag it here';
    }
  });
}

const shareForm = document.getElementById('shareForm');
if (shareForm) {
  shareForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('fileName').value.trim();
    const description = document.getElementById('fileDescription').value.trim();
    const uploaderEmail = document.getElementById('uploaderEmail').value.trim();
    const file = fileUploadInput.files[0];

    if (!file) {
      showToast('⚠ Please choose a file first');
      return;
    }

    const sizeLabel = formatBytes(file.size);
    const suggestedCode = Math.floor(1000 + Math.random() * 9000);

    const subject = `New File Submission: ${name}`;
    const body =
`New file share request from SENSIX Vault:

File Name: ${name}
File Size: ${sizeLabel} (${file.size} bytes)
Original Filename: ${file.name}
Description: ${description}
Submitted by: ${uploaderEmail}
Suggested Code: ${suggestedCode}

--------------------------------
ACTION NEEDED:
1. Attach the file to this email (or ask sender for a Drive link) before sending, if not already attached.
2. Review the file for legality/appropriateness.
3. If APPROVED: upload to Google Drive, get shareable link, add entry to manifest.json.
4. If REJECTED: reply to the sender explaining why.
--------------------------------

⚠️ Reminder: please manually attach "${file.name}" to this email before sending, since browsers cannot auto-attach files to email links.`;

    const mailtoUrl = `mailto:${REVIEW_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    showToast('Opening your email app…');
    setTimeout(() => {
      window.location.href = mailtoUrl;
    }, 400);
  });
}
