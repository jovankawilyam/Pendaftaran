// ====== Config ======
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyMDL6SJ3s0w5wXD51rkeyI4qgk1K3CSd6_ZFzlMMniqBWL_fx2WzNPmRWBbfLqwNCF/exec";
const WA_GROUP_URL = "https://chat.whatsapp.com/BJyQDn8RejHKQimqL0ZtuE";

// ====== UI: Loading Button ======
function setLoading(isLoading) {
  const btn = document.getElementById('submitBtn');
  if (isLoading) {
    btn.disabled = true;
    btn.innerHTML = 'Mengirim... <span class="spinner" aria-hidden="true"></span>';
  } else {
    btn.disabled = false;
    btn.innerHTML = 'Kirim Pendaftaran';
  }
}

// ====== MAIN: Submit Handler ======
let isSubmitting = false;

async function handleSubmit(e) {
  e.preventDefault();
  if (isSubmitting) return;
  isSubmitting = true;

  const name = document.getElementById('name').value.trim();
  const npm = document.getElementById('npm').value.trim();
  const semester = document.getElementById('semester').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const email = document.getElementById('email').value.trim();

  if (!name || !npm || !semester || !phone || !email) {
    alert('Mohon lengkapi semua kolom.');
    isSubmitting = false;
    return;
  }

  const payload = {
    name, npm, semester, phone, email,
    timestamp: new Date().toISOString()
  };

  setLoading(true);

  try {
    await fetch(WEB_APP_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    console.error('Fetch error (ignored):', err);
  }

  showSuccessModal(payload);
  document.getElementById('form').reset();

  setTimeout(() => {
    setLoading(false);
    isSubmitting = false;
  }, 800);
}

// ====== MODAL ======
function showSuccessModal(t) {
  const box = document.getElementById('ticketBox');
  box.innerHTML = `
    <div style="font-weight:600">${t.name}</div>
    <div style="font-size:13px;color:#777;margin-top:6px">Semester ${t.semester}</div>
    <div style="font-size:13px;color:#777;margin-top:6px">NPM: ${t.npm}</div>
    <div style="margin-top:6px;font-size:13px;color:#555">No. WA: ${t.phone}</div>
    <div style="margin-top:6px;font-size:13px;color:#555">Email: ${t.email}</div>
    <div class="success-badge">Pendaftaran Berhasil ✅</div>
  `;

  const modalWrapper = document.getElementById('modal');
  const modal = modalWrapper.querySelector('.modal');

  modalWrapper.style.display = 'flex';
  requestAnimationFrame(() => {
    modal.classList.add('show');
  });

  document.getElementById('joinBtn').onclick = () => {
    window.open(WA_GROUP_URL, '_blank');
  };
}

function closeModal() {
  const modalWrapper = document.getElementById('modal');
  const modal = modalWrapper.querySelector('.modal');
  modal.classList.remove('show');
  setTimeout(() => {
    modalWrapper.style.display = 'none';
  }, 360);
}

// ====== Reset ======
function resetForm() {
  document.getElementById('form').reset();
}

// ====== Attach Event ======
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('form')?.addEventListener('submit', handleSubmit);
  document.getElementById('modal').addEventListener('click', (ev) => {
    if (ev.target === ev.currentTarget) closeModal();
  });
});
