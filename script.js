// ====== Config ======
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyMDL6SJ3s0w5wXD51rkeyI4qgk1K3CSd6_ZFzlMMniqBWL_fx2WzNPmRWBbfLqwNCF/exec";
const WA_GROUP_URL = "https://chat.whatsapp.com/BJyQDn8RejHKQimqL0ZtuE";

// ====== UI: Loading Button ======
function setLoading(isLoading) {
  const btn = document.getElementById('submitBtn');
  if (!btn) return;
  if (isLoading) {
    btn.disabled = true;
    btn.innerHTML = 'Mengirim... <span class="spinner" aria-hidden="true"></span>';
  } else {
    btn.disabled = false;
    btn.innerHTML = 'Kirim Pendaftaran';
  }
}

// ====== Form Validation ======
function validateForm(name, npm, semester, phone, email) {
  if (!name || !npm || !semester || !phone || !email) {
    alert('Mohon lengkapi semua kolom.');
    return false;
  }
  
  // Validate NPM (numeric and at least 8 digits)
  if (!/^\d{8,}$/.test(npm)) {
    alert('NPM harus terdiri dari angka minimal 8 digit.');
    return false;
  }
  
  // Validate phone number (Indonesian format)
  if (!/^(\+62|62|0)8[1-9][0-9]{6,9}$/.test(phone)) {
    alert('Format nomor WhatsApp tidak valid. Gunakan format Indonesia.');
    return false;
  }
  
  // Validate email
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    alert('Format email tidak valid.');
    return false;
  }
  
  return true;
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

  if (!validateForm(name, npm, semester, phone, email)) {
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
  if (!box) return;
  box.innerHTML = `
    <div style="font-weight:600">${escapeHtml(t.name)}</div>
    <div style="font-size:13px;color:#777;margin-top:6px">Semester ${escapeHtml(t.semester)}</div>
    <div style="font-size:13px;color:#777;margin-top:6px">NPM: ${escapeHtml(t.npm)}</div>
    <div style="margin-top:6px;font-size:13px;color:#555">No. WA: ${escapeHtml(t.phone)}</div>
    <div style="margin-top:6px;font-size:13px;color:#555">Email: ${escapeHtml(t.email)}</div>
    <div class="success-badge">Pendaftaran Berhasil ✅</div>
  `;

  const modalWrapper = document.getElementById('modal');
  const modal = modalWrapper.querySelector('.modal');

  modalWrapper.style.display = 'flex';
  modalWrapper.setAttribute('aria-hidden', 'false');
  requestAnimationFrame(() => {
    modal.classList.add('show');
  });

  // focus the join button for accessibility
  const joinBtn = document.getElementById('joinBtn');
  joinBtn.onclick = () => {
    window.open(WA_GROUP_URL, '_blank');
  };
  // small delay to ensure element is visible before focusing
  setTimeout(() => joinBtn.focus(), 300);
}

function closeModal() {
  const modalWrapper = document.getElementById('modal');
  const modal = modalWrapper.querySelector('.modal');
  modal.classList.remove('show');
  modalWrapper.setAttribute('aria-hidden', 'true');
  setTimeout(() => {
    modalWrapper.style.display = 'none';
  }, 360);
}

// tiny helper to avoid inserting raw HTML from inputs
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

// ====== Reset ======
function resetForm() {
  document.getElementById('form').reset();
}

// ====== Move Aside (PEMBICARA) for Mobile <= 900px ======
// Behavior required:
// - Desktop (>900px): aside is a sibling column on the right (original layout).
// - Mobile (<=900px): aside (PEMBICARA) should appear BEFORE the .info-cards inside the left section.
function moveAsideBasedOnWidth() {
  const aside = document.getElementById('speakersAside');
  const heroLeft = document.querySelector('.hero-left');
  const infoCards = document.getElementById('infoCards');
  const mainGrid = document.getElementById('mainGrid');

  if (window.innerWidth <= 900) {
    if (aside.parentElement !== heroLeft) {
      heroLeft.insertBefore(aside, infoCards);
    }
  } else {
    if (aside.parentElement !== mainGrid) {
      mainGrid.appendChild(aside);
    }
  }
}


// ====== Attach Event ======
document.addEventListener('DOMContentLoaded', () => {
  // form handlers
  const formEl = document.getElementById('form');
  formEl?.addEventListener('submit', handleSubmit);

  document.getElementById('resetBtn')?.addEventListener('click', resetForm);

  // close modal when clicking outside content
  document.getElementById('modal')?.addEventListener('click', (ev) => {
    if (ev.target === ev.currentTarget) closeModal();
  });

  document.getElementById('closeModalBtn')?.addEventListener('click', closeModal);

  // initial placement and on resize
  moveAsideBasedOnWidth();
  window.addEventListener('resize', () => {
    // debounce-ish minimal: throttle by using requestAnimationFrame
    requestAnimationFrame(moveAsideBasedOnWidth);
  });
});
