// ===== SENSIX Vault — Code-Based File Finder =====

let allFiles = [];

async function loadFiles() {
  let manifestFiles = [];
  let approvedFiles = [];

  try {
    const res = await fetch('manifest.json', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      manifestFiles = data.files || [];
    }
  } catch (err) {
    console.error('manifest.json load failed', err);
  }

  try {
    if (typeof window.supabase !== 'undefined' && CONFIG.SUPABASE_URL.startsWith('http')) {
      const supabaseClient = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
      const { data, error } = await supabaseClient
        .from('submissions')
        .select('*')
        .eq('status', 'approved');

      if (!error && data) {
        approvedFiles = data.map((row) => ({
          code: row.code,
          name: row.name,
          description: row.description,
          size: row.size_bytes,
          link: row.cloudinary_url,
        }));
      }
    }
  } catch (err) {
    console.error('Supabase approved files load failed', err);
  }

  allFiles = [...manifestFiles, ...approvedFiles];

  if (allFiles.length === 0) {
    showToast('⚠ No files available right now');
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

  const match = allFiles.find((f) => String(f.code) === String(q));

  if (match) {
    renderResult(match);
  } else {
    showEmpty();
  }
});

loadFiles();

// ===== Share File Form: Cloudinary Upload + Supabase Pending Record =====

const supabaseClient = (typeof window.supabase !== 'undefined' && CONFIG.SUPABASE_URL.startsWith('http'))
  ? window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY)
  : null;

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

function uploadToCloudinary(file, onProgress) {
  return new Promise((resolve, reject) => {
    const url = `https://api.cloudinary.com/v1_1/${CONFIG.CLOUDINARY_CLOUD_NAME}/auto/upload`;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CONFIG.CLOUDINARY_UPLOAD_PRESET);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        const pct = Math.round((e.loaded / e.total) * 100);
        onProgress(pct);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error(`Cloudinary upload failed (${xhr.status}): ${xhr.responseText}`));
      }
    };

    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.send(formData);
  });
}

const shareForm = document.getElementById('shareForm');
if (shareForm) {
  shareForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('fileName').value.trim();
    const description = document.getElementById('fileDescription').value.trim();
    const uploaderEmail = document.getElementById('uploaderEmail').value.trim();
    const file = fileUploadInput.files[0];
    const submitBtn = document.getElementById('submitBtn');
    const progressWrap = document.getElementById('uploadProgress');
    const progressBar = document.getElementById('uploadProgressBar');
    const progressLabel = document.getElementById('uploadProgressLabel');
    const successBox = document.getElementById('submitSuccess');

    if (!file) {
      showToast('⚠ Please choose a file first');
      return;
    }

    if (!CONFIG.CLOUDINARY_CLOUD_NAME || CONFIG.CLOUDINARY_CLOUD_NAME === 'YOUR_CLOUD_NAME') {
      showToast('⚠ Cloudinary is not configured yet');
      return;
    }

    if (!supabaseClient) {
      showToast('⚠ Database is not configured yet');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Uploading…';
    progressWrap.hidden = false;
    successBox.hidden = true;

    try {
      const result = await uploadToCloudinary(file, (pct) => {
        progressBar.style.width = pct + '%';
        progressLabel.textContent = `Uploading… ${pct}%`;
      });

      progressLabel.textContent = 'Saving submission…';

      const { error } = await supabaseClient.from('submissions').insert({
        name,
        description,
        original_filename: file.name,
        size_bytes: file.size,
        uploader_email: uploaderEmail || null,
        cloudinary_url: result.secure_url,
        cloudinary_public_id: result.public_id,
        status: 'pending',
      });

      if (error) throw error;

      shareForm.reset();
      fileDropLabel.textContent = '📎 Choose a file or drag it here';
      progressWrap.hidden = true;
      successBox.hidden = false;
      showToast('✅ Submitted for review!');
    } catch (err) {
      console.error(err);
      showToast('⚠ Upload failed. Please try again.');
      progressWrap.hidden = true;
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Upload & Submit for Review ⬆️';
    }
  });
}
