/* ============================================================
   IJMEER — core.js  (v3 — Premium Edition)
   Navigation, dark mode, scroll effects, reveal animations
   ============================================================ */

(function () {
  'use strict';

  // ── Progress bar ──────────────────────────────────────────
  const progressBar = document.getElementById('progress-bar');
  function updateProgress() {
    if (!progressBar) return;
    const doc = document.documentElement;
    const pct = (doc.scrollTop / (doc.scrollHeight - doc.clientHeight)) * 100;
    progressBar.style.width = Math.min(pct, 100) + '%';
  }

  // ── Header scroll effect ──────────────────────────────────
  const header = document.getElementById('site-header');
  function updateHeader() {
    if (!header) return;
    if (window.scrollY > 50) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  }

  // ── Scroll-to-top button ──────────────────────────────────
  const scrollTopBtn = document.getElementById('scroll-top');
  function updateScrollTop() {
    if (!scrollTopBtn) return;
    if (window.scrollY > 500) scrollTopBtn.classList.add('visible');
    else scrollTopBtn.classList.remove('visible');
  }
  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  // ── Reveal animations ─────────────────────────────────────
  const revealEls = document.querySelectorAll('.reveal');
  window.revealObserver = new IntersectionObserver(
    (entries) => entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        window.revealObserver.unobserve(e.target);
      }
    }),
    { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
  );
  revealEls.forEach(el => window.revealObserver.observe(el));

  // ── Mobile Menu System (Premium Slide-in Redesign) ─────────────────────
  window.initMobileMenu = function () {
    const toggle = document.querySelector('.mobile-menu-toggle');
    const nav = document.querySelector('.mobile-nav');
    const overlay = document.querySelector('.overlay');
    const closeBtn = document.querySelector('.close-menu');

    if (!toggle || !nav || !overlay) return;
    if (toggle._bound) return;
    toggle._bound = true;

    function openMenu() {
      nav.classList.add('active');
      overlay.classList.add('active');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
      nav.classList.remove('active');
      overlay.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    toggle.addEventListener('click', openMenu);
    if (closeBtn) closeBtn.addEventListener('click', closeMenu);
    overlay.addEventListener('click', closeMenu);

    // Close menu when clicking a link
    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMenu);
    });
  };

  // Bind to injection event
  document.addEventListener('headerInjected', () => window.initMobileMenu());
  // Also try immediate in case it's hardcoded
  window.initMobileMenu();


  // ── Accordion ─────────────────────────────────────────────
  document.querySelectorAll('.accordion-header').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.accordion-item');
      const wasOpen = item.classList.contains('open');
      document.querySelectorAll('.accordion-item').forEach(i => {
        i.classList.remove('open');
        i.querySelector('.accordion-header')?.setAttribute('aria-expanded', 'false');
      });
      if (!wasOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // ── Tabs ──────────────────────────────────────────────────
  document.querySelectorAll('.tab-bar').forEach(bar => {
    bar.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.tab;
        const container = bar.closest('[data-tabs]') || document;
        bar.querySelectorAll('.tab-btn').forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        container.querySelectorAll('.tab-panel').forEach(p => {
          const isActive = p.dataset.panel === target;
          p.classList.toggle('active', isActive);
          p.hidden = !isActive;
        });
      });
    });
  });

  // ── Dynamic footer year ───────────────────────────────────
  document.querySelectorAll('[data-year]').forEach(el => {
    el.textContent = new Date().getFullYear();
  });

  // ── Active nav highlighting ───────────────────────────────
  const currentPage = window.location.pathname.split('/').pop() || '';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href && href !== '#' && href === currentPage) {
      link.style.color = 'var(--blue)';
      link.style.background = 'rgba(37,99,235,0.07)';
    }
  });

  // ── Scroll listener ───────────────────────────────────────
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateProgress();
        updateHeader();
        updateScrollTop();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  // Initial calls
  updateHeader();
  updateScrollTop();

  // ── Copy citation helper (for citations page) ─────────────
  window.copyCitation = function(text, btn) {
    navigator.clipboard.writeText(text).then(() => {
      const original = btn.textContent;
      btn.textContent = '✓ Copied!';
      btn.classList.add('copied');
      setTimeout(() => {
        btn.textContent = original;
        btn.classList.remove('copied');
      }, 2000);
      if (window.showToast) window.showToast('Citation copied to clipboard!');
    }).catch(() => {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); ta.remove();
      btn.textContent = '✓ Copied!';
      btn.classList.add('copied');
      setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 2000);
    });
  };

})();
