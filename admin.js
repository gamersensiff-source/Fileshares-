// ===== SENSIX Vault — Admin Panel =====

const supabaseClient = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);

const loginGate = document.getElementById('loginGate');
const adminDashboard = document.getElementById('adminDashboard');
const adminPasswordInput = document.getElementById('adminPasswordInput');
const loginBtn = document.getElementById('loginBtn');
const loginError = document.getElementById('loginError');

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove('show'), 2200);
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

function tryLogin() {
  if (adminPasswordInput.value === CONFIG.ADMIN_PASSWORD) {
    loginGate.hidden = true;
    adminDashboard.hidden = false;
    sessionStorage.setItem('sensix_admin_ok', '1');
    loadSubmissions();
  } else {
    loginError.hidden = false;
  }
}

loginBtn.addEventListener('click', tryLogin);
adminPasswordInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') tryLogin();
});

// Persist unlock for this browser tab session only
if (sessionStorage.getItem('sensix_admin_ok') === '1') {
  loginGate.hidden = true;
  adminDashboard.hidden = false;
  loadSubmissions();
}

function generateCode() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

async function loadSubmissions() {
  const { data: pending, error: pendingErr } = await supabaseClient
    .from('submissions')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  const { data: approved, error: approvedErr } = await supabaseClient
    .from('submissions')
    .select('*')
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  if (pendingErr || approvedErr) {
    console.error(pendingErr || approvedErr);
    showToast('⚠ Failed to load submissions');
    return;
  }

  renderPending(pending || []);
  renderApproved(approved || []);
}

function renderPending(items) {
  const list = document.getElementById('pendingList');
  const empty = document.getElementById('pendingEmpty');
  const count = document.getElementById('pendingCount');

  count.textContent = `${items.length} pending`;
  list.innerHTML = '';

  if (items.length === 0) {
    empty.hidden = false;
    return;
  }
  empty.hidden = true;

  items.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'admin-card';
    card.innerHTML = `
      <div class="admin-card-top">
        <div>
          <div class="admin-card-name">${escapeHtml(item.name)}</div>
          <div class="admin-card-meta">
            ${escapeHtml(item.original_filename)} · ${formatBytes(item.size_bytes)}<br>
            ${item.uploader_email ? `From: ${escapeHtml(item.uploader_email)} · ` : ''}${new Date(item.created_at).toLocaleString()}
          </div>
        </div>
      </div>
      <div class="admin-card-desc">${escapeHtml(item.description || '')}</div>
      <div class="admin-card-actions">
        <a href="${item.cloudinary_url}" target="_blank" rel="noopener" class="btn btn-sm btn-view">👁 View File</a>
        <button class="btn btn-sm btn-approve" data-id="${item.id}">✅ Approve</button>
        <button class="btn btn-sm btn-reject" data-id="${item.id}">❌ Reject</button>
      </div>
    `;

    card.querySelector('.btn-approve').addEventListener('click', () => approveSubmission(item));
    card.querySelector('.btn-reject').addEventListener('click', () => rejectSubmission(item.id));

    list.appendChild(card);
  });
}

function renderApproved(items) {
  const list = document.getElementById('approvedList');
  const empty = document.getElementById('approvedEmpty');
  const count = document.getElementById('approvedCount');

  count.textContent = `${items.length} approved`;
  list.innerHTML = '';

  if (items.length === 0) {
    empty.hidden = false;
    return;
  }
  empty.hidden = true;

  items.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'admin-card';
    card.innerHTML = `
      <div class="admin-card-top">
        <div>
          <div class="admin-card-name">${escapeHtml(item.name)}</div>
          <div class="admin-card-meta">${formatBytes(item.size_bytes)} · Approved ${new Date(item.approved_at || item.created_at).toLocaleString()}</div>
        </div>
        <span class="file-code-badge">Code: ${item.code}</span>
      </div>
      <div class="admin-card-desc">${escapeHtml(item.description || '')}</div>
      <div class="admin-card-actions">
        <a href="${item.cloudinary_url}" target="_blank" rel="noopener" class="btn btn-sm btn-view">👁 View File</a>
        <span class="status-badge status-approved">Live in Vault</span>
      </div>
    `;
    list.appendChild(card);
  });
}

async function approveSubmission(item) {
  const code = generateCode();

  const { error } = await supabaseClient
    .from('submissions')
    .update({ status: 'approved', code, approved_at: new Date().toISOString() })
    .eq('id', item.id);

  if (error) {
    console.error(error);
    showToast('⚠ Approve failed');
    return;
  }

  showToast(`✅ Approved! Code: ${code}`);
  loadSubmissions();
}

async function rejectSubmission(id) {
  if (!confirm('Reject and delete this submission? This cannot be undone.')) return;

  const { error } = await supabaseClient
    .from('submissions')
    .update({ status: 'rejected' })
    .eq('id', id);

  if (error) {
    console.error(error);
    showToast('⚠ Reject failed');
    return;
  }

  showToast('❌ Rejected');
  loadSubmissions();
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}
