/* ═══════════════════════════════════════════════════════════════
   AMIR HASHMI — PORTFOLIO  |  script.js
═══════════════════════════════════════════════════════════════ */

'use strict';

/* ── DOM REFS ───────────────────────────────────────────────── */
const navbar      = document.getElementById('navbar');
const hamburger   = document.getElementById('hamburger');
const navLinks    = document.getElementById('navLinks');
const navLinkEls  = document.querySelectorAll('.nav-link:not(.nav-cta)');
const sections    = document.querySelectorAll('section[id]');
const statNums    = document.querySelectorAll('.stat-num');
const revealEls   = document.querySelectorAll('.reveal');
const galleryGrid = document.getElementById('galleryGrid');
const lightbox    = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lbCaption   = document.getElementById('lightboxCaption');
const lbClose     = document.getElementById('lightboxClose');
const lbPrev      = document.getElementById('lightboxPrev');
const lbNext      = document.getElementById('lightboxNext');
const filmCards   = document.querySelectorAll('.film-card .play-btn');
const videoModal  = document.getElementById('videoModal');
const videoEmbed  = document.getElementById('videoEmbed');
const modalClose  = document.getElementById('modalClose');
const contactForm = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');
const footerYear  = document.getElementById('footerYear');

/* ── FOOTER YEAR ────────────────────────────────────────────── */
if (footerYear) footerYear.textContent = new Date().getFullYear();

/* ── NAVBAR SCROLL ──────────────────────────────────────────── */
function onScroll() {
  /* Scrolled state */
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }

  /* Active nav link via scroll-spy */
  let current = '';
  sections.forEach(sec => {
    const top = sec.offsetTop - parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) - 40;
    if (window.scrollY >= top) current = sec.getAttribute('id');
  });
  navLinkEls.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${current}`) link.classList.add('active');
  });
}

window.addEventListener('scroll', onScroll, { passive: true });
onScroll(); // run once on load

/* ── HAMBURGER MENU ─────────────────────────────────────────── */
function toggleMenu(force) {
  const open = force !== undefined ? force : !hamburger.classList.contains('open');
  hamburger.classList.toggle('open', open);
  hamburger.setAttribute('aria-expanded', String(open));
  navLinks.classList.toggle('open', open);
  document.body.style.overflow = open ? 'hidden' : '';
}

hamburger.addEventListener('click', () => toggleMenu());

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => toggleMenu(false));
});

document.addEventListener('click', e => {
  if (!navbar.contains(e.target)) toggleMenu(false);
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') toggleMenu(false);
});

/* ── REVEAL ON SCROLL (IntersectionObserver) ────────────────── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

revealEls.forEach(el => revealObserver.observe(el));

/* ── COUNTER ANIMATION ──────────────────────────────────────── */
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const duration = 1800;
  const start = performance.now();

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target);
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

statNums.forEach(el => counterObserver.observe(el));

/* ── GALLERY LIGHTBOX ───────────────────────────────────────── */
const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
let currentLightboxIdx = 0;

function openLightbox(idx) {
  currentLightboxIdx = idx;
  const item    = galleryItems[idx];
  const img     = item.querySelector('img');
  const caption = item.querySelector('.gallery-caption');
  lightboxImg.src = img.src;
  lightboxImg.alt = img.alt;
  lbCaption.textContent = caption ? caption.textContent.trim() : '';
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
  lightboxImg.style.opacity = '0';
  lightboxImg.onload = () => {
    lightboxImg.style.transition = 'opacity 0.3s';
    lightboxImg.style.opacity = '1';
  };
  if (lightboxImg.complete) { lightboxImg.style.opacity = '1'; }
}

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
  lightboxImg.src = '';
}

function lightboxNav(dir) {
  currentLightboxIdx = (currentLightboxIdx + dir + galleryItems.length) % galleryItems.length;
  openLightbox(currentLightboxIdx);
}

galleryItems.forEach((item, idx) => {
  item.addEventListener('click', () => openLightbox(idx));
  item.setAttribute('tabindex', '0');
  item.setAttribute('role', 'button');
  item.setAttribute('aria-label', `Open photo ${idx + 1}`);
  item.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') openLightbox(idx); });
});

lbClose.addEventListener('click', closeLightbox);
lbPrev.addEventListener('click',  () => lightboxNav(-1));
lbNext.addEventListener('click',  () => lightboxNav(1));
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape')     closeLightbox();
  if (e.key === 'ArrowLeft')  lightboxNav(-1);
  if (e.key === 'ArrowRight') lightboxNav(1);
});

/* ── VIDEO MODAL ────────────────────────────────────────────── */
function openVideoModal(videoUrl) {
  videoEmbed.innerHTML = '';

  if (videoUrl && !videoUrl.includes('PLACEHOLDER')) {
    // Convert YouTube watch URL → embed URL
    const ytMatch = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (ytMatch) {
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0`;
      iframe.className = 'video-embed-iframe';
      iframe.allow = 'autoplay; encrypted-media; fullscreen';
      iframe.setAttribute('allowfullscreen', '');
      videoEmbed.appendChild(iframe);
    } else {
      videoEmbed.innerHTML = `<p style="color:var(--clr-text-muted);padding:2rem;text-align:center;">Unable to load video. <a href="${videoUrl}" target="_blank" style="color:var(--clr-gold);">Watch on YouTube →</a></p>`;
    }
  } else {
    videoEmbed.innerHTML = `
      <div style="aspect-ratio:16/9;display:flex;align-items:center;justify-content:center;padding:2rem;text-align:center;flex-direction:column;gap:1rem;">
        <p style="color:var(--clr-text-muted);font-size:.9rem;line-height:1.8;">
          Replace <code style="background:rgba(201,168,76,.15);color:var(--clr-gold);padding:.1em .4em;border-radius:4px;">PLACEHOLDER</code> 
          in the film card's <code style="background:rgba(201,168,76,.15);color:var(--clr-gold);padding:.1em .4em;border-radius:4px;">data-video</code> 
          attribute with a real YouTube URL to enable playback.
        </p>
      </div>`;
  }

  videoModal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeVideoModal() {
  videoModal.classList.remove('open');
  videoEmbed.innerHTML = ''; // Stop video playback
  document.body.style.overflow = '';
}

filmCards.forEach(btn => {
  btn.addEventListener('click', () => {
    const url = btn.dataset.video || '';
    openVideoModal(url);
  });
});

modalClose.addEventListener('click', closeVideoModal);
videoModal.addEventListener('click', e => { if (e.target === videoModal) closeVideoModal(); });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && videoModal.classList.contains('open')) closeVideoModal();
});

/* ── CONTACT FORM ───────────────────────────────────────────── */
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = document.getElementById('formSubmit');
    const btnText   = submitBtn.querySelector('.btn-text');

    // Validate
    const fields = ['formName', 'formEmail', 'formSubject', 'formMessage'];
    let valid = true;

    fields.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      el.style.borderColor = '';
      if (!el.value.trim() || (id === 'formEmail' && !el.value.includes('@'))) {
        el.style.borderColor = '#e05a5a';
        el.focus();
        valid = false;
      }
    });

    if (!valid) return;

    // Simulate submit
    submitBtn.disabled = true;
    const originalText = btnText.textContent;
    btnText.textContent = 'Sending…';

    await new Promise(r => setTimeout(r, 1400));

    // Success state
    const successMsg = document.getElementById('formSuccess');
    if (successMsg) successMsg.classList.add('show');
    contactForm.reset();

    setTimeout(() => {
      if (successMsg) successMsg.classList.remove('show');
      submitBtn.disabled = false;
      btnText.textContent = originalText;
    }, 5000);
  });
}

/* ── SMOOTH ANCHOR CLICKS ───────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

/* ── PARALLAX HERO ──────────────────────────────────────────── */
const heroBg = document.getElementById('heroBg');
if (heroBg && window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    if (scrolled < window.innerHeight) {
      heroBg.style.transform = `scale(1.05) translateY(${scrolled * 0.25}px)`;
    }
  }, { passive: true });
}

/* ── INIT ───────────────────────────────────────────────────── */
console.log('%cAmir Hashmi Portfolio | Meer Corporation', 'color:#c9a84c;font-size:12px;font-weight:600;letter-spacing:0.1em;');
