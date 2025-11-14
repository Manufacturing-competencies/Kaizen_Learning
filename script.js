// =====================================================
// GLOBAL INIT
// =====================================================
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initIndexOverlays();
  init5RReveal();
  init5RDateWeek();
  initP5RBadges();
  initEpicSelect();

  console.log(`✅ Script aktif di halaman: ${window.location.pathname}`);
});

// =====================================================
// NAVBAR MOBILE TOGGLE
// =====================================================
function initNavbar() {
  const menuToggle = document.getElementById('menuToggle');
  const mainNav = document.getElementById('mainNav');

  if (!menuToggle || !mainNav) return;

  // Klik icon menu
  menuToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const isActive = mainNav.classList.toggle('active');
    menuToggle.setAttribute('aria-expanded', isActive ? 'true' : 'false');
  });

  // Klik di luar nav → tutup
  document.addEventListener('click', (e) => {
    if (
      mainNav.classList.contains('active') &&
      !mainNav.contains(e.target) &&
      e.target !== menuToggle &&
      !menuToggle.contains(e.target)
    ) {
      mainNav.classList.remove('active');
      menuToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

// =====================================================
// OVERLAY DASHBOARD (index.html saja)
// =====================================================
function initIndexOverlays() {
  const isDashboardPage = window.location.pathname.includes('index');
  if (!isDashboardPage) return;

  // Tombol X (tutup overlay)
  document.querySelectorAll('.page-5r-close').forEach((btn) => {
    btn.addEventListener('click', () => {
      const overlay = btn.closest('.page-5r-overlay');
      if (overlay) {
        overlay.classList.remove('active');
        overlay.setAttribute('aria-hidden', 'true');
      }
    });
  });

  // Klik area gelap → tutup overlay
  document.querySelectorAll('.page-5r-overlay').forEach((overlay) => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('active');
        overlay.setAttribute('aria-hidden', 'true');
      }
    });
  });

  // Tekan ESC → tutup semua overlay
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document
        .querySelectorAll('.page-5r-overlay.active')
        .forEach((overlay) => {
          overlay.classList.remove('active');
          overlay.setAttribute('aria-hidden', 'true');
        });
    }
  });
}

// Helper global (dipakai onclick di HTML)
function openOverlay(id) {
  const overlay = document.getElementById(id);
  if (!overlay) return;
  overlay.classList.add('active');
  overlay.setAttribute('aria-hidden', 'false');
}

// Fungsi khusus kartu dashboard (biar tetap bisa dipanggil dari HTML)
function open5ROverlay()       { openOverlay('overlay-5r'); }
function openEpicOverlay()     { openOverlay('overlay-epic'); }
function openSSOverlay()       { openOverlay('overlay-ss'); }
function openReplikasiOverlay(){ openOverlay('overlay-replikasi'); }
function openLearningOverlay() { openOverlay('overlay-learning'); }

// =====================================================
// 5R – ANIMASI FADE-IN (LIST & GAMBAR)
// =====================================================
function init5RReveal() {
  const targets = document.querySelectorAll(
    '.page-5r-text ol li, .page-5r-media'
  );
  if (!targets.length) return;

  targets.forEach((el, index) => {
    el.classList.add('reveal-item');               // class dasar dari CSS
    el.style.transitionDelay = `${index * 0.08}s`; // muncul berurutan
  });

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 } // 20% elemen masuk viewport
  );

  targets.forEach((el) => observer.observe(el));
}

// =====================================================
// 5R – TANGGAL & NOMOR MINGGU (Wxx)
// =====================================================
function init5RDateWeek() {
  const elDate = document.getElementById('p5r-date');
  const elWeek = document.getElementById('p5r-week');

  // Kalau tidak ada elemen, skip saja (bukan halaman 5R)
  if (!elDate && !elWeek) return;

  try {
    const d = new Date();
    const opt = { weekday: 'long', month: 'long', day: 'numeric' };
    const locale = 'id-ID'; // ganti ke 'en-US' kalau mau bahasa Inggris
    const dateStr = new Intl.DateTimeFormat(locale, opt).format(d);

    // Hitung minggu ke-berapa dalam tahun
    const start = new Date(d.getFullYear(), 0, 1);
    const diffDays = Math.floor((d - start) / 86400000);
    const weekNum = Math.ceil((diffDays + start.getDay() + 1) / 7);

    if (elDate) elDate.textContent = dateStr;
    if (elWeek) elWeek.textContent = 'W' + weekNum;
  } catch (e) {
    console.warn('Gagal set tanggal / week 5R:', e);
  }
}

// =====================================================
// 5R – COUNTER SUDAH / BELUM (localStorage)
// =====================================================
function initP5RBadges() {
  const btns = document.querySelectorAll('.badge-btn');
  if (!btns.length) return; // bukan halaman 5R

  const KEY_SUDAH = 'p5r_count_sudah';
  const KEY_BELUM = 'p5r_count_belum';

  const elSudah = document.getElementById('count-sudah');
  const elBelum = document.getElementById('count-belum');

  const get = (k) => Number(localStorage.getItem(k) || 0);
  const set = (k, v) => localStorage.setItem(k, String(v));

  const syncUI = () => {
    if (elSudah) elSudah.textContent = get(KEY_SUDAH);
    if (elBelum) elBelum.textContent = get(KEY_BELUM);
  };
  syncUI();

  // Klik badge → tambah 1
  btns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const t = btn.dataset.type;
      if (t === 'sudah') set(KEY_SUDAH, get(KEY_SUDAH) + 1);
      if (t === 'belum') set(KEY_BELUM, get(KEY_BELUM) + 1);
      syncUI();

      // Kalau mau otomatis scroll ke form 5R, bisa aktifkan:
      // document
      //   .querySelector('.page-5r-submit')
      //   ?.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // Long-press (1.2s) pada badge → reset counter masing-masing
  let pressTimer;
  const attachReset = (selector, key) => {
    const el = document.querySelector(selector);
    if (!el) return;

    const start = () => {
      pressTimer = setTimeout(() => {
        set(key, 0);
        syncUI();
      }, 1200);
    };
    const clear = () => clearTimeout(pressTimer);

    el.addEventListener('mousedown', start);
    el.addEventListener('touchstart', start, { passive: true });

    ['mouseup', 'mouseleave', 'touchend', 'touchcancel'].forEach((evt) =>
      el.addEventListener(evt, clear)
    );
  };

  attachReset('.badge-sudah', KEY_SUDAH);
  attachReset('.badge-belum', KEY_BELUM);
}

// =====================================================
// EPIC – DROPDOWN PILIH FORM → IFRAME
// =====================================================

// Ganti ke URL form yang benar lalu tambahkan ?embedded=true
const EPIC_FORM_URLS = {
  office:
    'https://docs.google.com/forms/d/e/XXXXX/viewform?embedded=true',
  workshop:
    'https://docs.google.com/forms/d/e/YYYYY/viewform?embedded=true',
  produksi:
    'https://docs.google.com/forms/d/e/ZZZZZ/viewform?embedded=true',
};

function initEpicSelect() {
  const select = document.getElementById('epicSelect');
  const frame = document.getElementById('epicFrame');
  if (!select || !frame) return; // bukan halaman EPIC

  const updateSrc = () => {
    frame.src = EPIC_FORM_URLS[select.value] || 'about:blank';
  };

  updateSrc();
  select.addEventListener('change', updateSrc);
}
