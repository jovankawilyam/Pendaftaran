// ====== Config ======
    const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyZ_Q2KuMgXW2UAwLw5doWK4y4IkmuarQg9p0oeVCY_gjJcA9sQP6RONPMrBTkZ2mdM/exec";
    const WA_GROUP_URL = "https://chat.whatsapp.com/BJyQDn8RejHKQimqL0ZtuE";

    // ====== Utility ======
    function uid(len = 6) {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let s = '';
      for (let i = 0; i < len; i++) {
        s += chars[Math.floor(Math.random() * chars.length)];
      }
      return s;
    }

    function generateRegistrationCode() {
      const today = new Date();
      const dd = String(today.getDate()).padStart(2, '0');
      const mm = String(today.getMonth() + 1).padStart(2, '0'); // bulan mulai dari 0
      const yy = String(today.getFullYear()).slice(-2); // ambil 2 digit terakhir tahun

      const randomId = uid(4); // 4 karakter acak
      return `SIFO-${dd}${mm}${yy}-${randomId}`; // format 2: dengan strip
    }

    // ====== Helpers ======
    function escapeHtml(unsafe) {
      return String(unsafe)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    // ====== UI: loading state on button (style B: disable + change text + spinner) ======
    function setLoading(isLoading) {
      const btn = document.getElementById('submitBtn');
      if (isLoading) {
        btn.disabled = true;
        btn.classList.add('btn-primary');
        btn.style.background = 'var(--primary)';
        btn.style.color = '#fff';
        btn.innerHTML = 'Mengirim... <span class="spinner" aria-hidden="true"></span>';
      } else {
        btn.disabled = false;
        btn.innerHTML = 'Kirim Pendaftaran';
        btn.style.background = '';
        btn.style.color = '';
      }
    }

    // ====== Form submit handler ======
    async function handleSubmit(e) {
      e.preventDefault();

      const name = document.getElementById('name').value.trim();
      const npm = document.getElementById('npm').value.trim();
      const semester = document.getElementById('semester').value.trim();
      const phone = document.getElementById('phone').value.trim();
      const email = document.getElementById('email').value.trim();

      if (!name || !npm || !semester || !phone || !email) {
        alert('Mohon lengkapi semua kolom yang wajib.');
        return false;
      }

      const code = generateRegistrationCode();
      const payload = {
        code,
        name,
        npm,
        semester,
        phone,
        email,
        mode: 'Hybrid',
        timestamp: new Date().toISOString()
      };

      // set loading UI
      setLoading(true);

      try {
        // note: using no-cors so response may be opaque; Apps Script should still receive post
        await fetch(WEB_APP_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch (err) {
        // Usually no-cors results in opaque fetch; we still proceed to show modal.
        console.error('Fetch error (ignored):', err);
      }

      // show modal with slide-up animation
      showSuccessModal(payload);

      // reset form and unset loading after short delay (so user sees success)
      document.getElementById('form').reset();

      // Give small delay before removing loading to make UX smooth
      setTimeout(() => setLoading(false), 800);

      return false;
    }

    function showSuccessModal(t) {
      const box = document.getElementById('ticketBox');

      box.innerHTML = `
        <div style="display:flex;gap:12px;align-items:center">
          <div style="flex:1">
            <div style="font-weight:600">${escapeHtml(t.name)}</div>
            <div style="font-size:13px;color:#777;margin-top:6px">Semester ${escapeHtml(t.semester)}</div>
            <div style="font-size:13px;color:#777;margin-top:6px">NPM: ${escapeHtml(t.npm)}</div>
            <div style="margin-top:8px;font-size:13px">Kode Pendaftaran: <strong>${escapeHtml(t.code)}</strong></div>
            <div style="margin-top:6px;font-size:13px;color:#555">No. WA: ${escapeHtml(t.phone)}</div>
            <div style="margin-top:6px;font-size:13px;color:#555">Email: ${escapeHtml(t.email)}</div>
            <div class="success-badge">Pendaftaran Berhasil ✅</div>
          </div>
        </div>
      `;

      const modalWrapper = document.getElementById('modal');
      const modal = modalWrapper.querySelector('.modal');

      // show backdrop then animate slide-up
      modalWrapper.style.display = 'flex';
      // allow a tick so CSS transition can run
      requestAnimationFrame(() => {
        modal.classList.add('show');
      });

      const joinBtn = document.getElementById('joinBtn');
      joinBtn.onclick = () => {
        window.open(WA_GROUP_URL, '_blank');
      };
    }

    function closeModal() {
      const modalWrapper = document.getElementById('modal');
      const modal = modalWrapper.querySelector('.modal');
      modal.classList.remove('show');
      // wait for transition out
      setTimeout(() => {
        modalWrapper.style.display = 'none';
      }, 360);
    }

    function resetForm() {
      document.getElementById('form').reset();
    }

    // Attach handlers (in case script loaded before DOM)
    document.addEventListener('DOMContentLoaded', () => {
      const form = document.getElementById('form');
      if (form) form.addEventListener('submit', handleSubmit);

      // close modal when clicking backdrop (but not when clicking modal content)
      document.getElementById('modal').addEventListener('click', (ev) => {
        if (ev.target === ev.currentTarget) closeModal();
      });
    });