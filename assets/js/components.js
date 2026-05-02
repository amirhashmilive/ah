/* Amir Hashmi — components.js (structure matches original  inject) */
(function () {
  'use strict';

  const BOOK = 'book-now.html';

  const HEADER = `
<header class="site-header" id="site-header" role="banner">
  <div class="container header-inner">
    <a href="/" class="brand" aria-label="Amir Hashmi Home">
      <div class="brand-mark" aria-hidden="true">AH</div>
      <div class="brand-text">
        <span class="brand-name">Amir Hashmi</span>
        <span class="brand-sub">Official Portfolio</span>
      </div>
    </a>

    <nav class="main-nav" id="main-nav" aria-label="Main navigation">
      <div class="nav-item"><a href="index.html" class="nav-link">Home</a></div>
      <div class="nav-item"><a href="films.html" class="nav-link">Films</a></div>
      <div class="nav-item"><a href="music.html" class="nav-link">Music</a></div>
      <div class="nav-item"><a href="books.html" class="nav-link">Books</a></div>
      <div class="nav-item transition-all"><a href="initiative.html" class="nav-link">Initiative</a></div>
      <div class="nav-item"><a href="chronicle.html" class="nav-link">Chronicle</a></div>
      <div class="nav-item"><a href="news.html" class="nav-link">News</a></div>
    </nav>

    <div class="header-actions">
      <a href="${BOOK}" class="btn-submit desktop-only" id="nav-submit-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        Book Now
      </a>
      <button class="mobile-menu-toggle" aria-label="Open menu" aria-expanded="false">
        <span></span>
        <span></span>
        <span></span>
      </button>
    </div>
  </div>

  <div class="overlay"></div>

  <nav class="mobile-nav">
    <button class="close-menu" aria-label="Close menu">&times;</button>
    <ul>
      <li><a href="index.html">Home</a></li>
      <li><a href="films.html">Films</a></li>
      <li><a href="music.html">Music</a></li>
      <li><a href="books.html">Books</a></li>
      <li><a href="initiative.html">Initiative</a></li>
      <li><a href="chronicle.html">Chronicle</a></li>
      <li><a href="news.html">News</a></li>
      <li style="margin-top: 30px;"><a href="${BOOK}" class="submit-btn">Book Now</a></li>
    </ul>
  </nav>
</header>`;

  const FOOTER = `
<footer class="site-footer" role="contentinfo">
  <div class="container">
    <div class="footer-grid">
      <!-- Brand column -->
      <div class="footer-brand">
        <a href="/" class="brand" style="margin-bottom:16px;" aria-label="Amir Hashmi Home">
          <div class="brand-mark">AH</div>
          <div class="brand-text">
            <span class="brand-name">Amir Hashmi</span>
            <span class="brand-sub">Official Portfolio</span>
          </div>
        </a>
        <p class="footer-desc">National Award-winning filmmaker, singer, author, and founder of the Bolti Nadi river revival movement.</p>
        <div style="margin-top:20px;">
          <div style="font-size:0.82rem;font-weight:700;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">
            Location
          </div>
          <div style="font-size:0.82rem;color:rgba(255,255,255,0.7);line-height:1.7;">
            Chhattisgarh, India
          </div>
        </div>
        <div style="margin-top:16px;">
          <div style="font-size:0.72rem;font-weight:700;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Booking</div>
          <div style="font-size:0.82rem;color:rgba(255,255,255,0.7);line-height:1.7;">
            Email: <a href="mailto:events@amirhashmi.com" style="color:inherit;">events@amirhashmi.com</a>
          </div>
        </div>
        <div class="social-links" style="margin-top:36px;" aria-label="Social media links">
          <a href="https://facebook.com/amirhashmilive" class="social-link" target="_blank" rel="noopener noreferrer" aria-label="@amirhashmilive on Facebook">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
          </a>
          <a href="https://instagram.com/amirhashmilive" class="social-link" target="_blank" rel="noopener noreferrer" aria-label="@amirhashmilive on Instagram">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
          </a>
          <a href="https://twitter.com/amirhashmilive" class="social-link" target="_blank" rel="noopener noreferrer" aria-label="@amirhashmilive on X">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </a>
          <a href="https://linkedin.com/in/amirhashmilive" class="social-link" target="_blank" rel="noopener noreferrer" aria-label="@amirhashmilive on LinkedIn">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
          </a>
          <a href="https://youtube.com/@amirhashmilive" class="social-link" target="_blank" rel="noopener noreferrer" aria-label="@amirhashmilive on YouTube">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon fill="white" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></svg>
          </a>
          <a href="https://www.imdb.com/find?q=Amir+Hashmi" class="social-link" target="_blank" rel="noopener noreferrer" aria-label="Amir Hashmi on IMDb">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M2 4h20v16H2V4zm4 3v10h3l1-4h2v4h2V7H9l-1 4h-.5L7 7H6zm9 0v10h4c1.5 0 2.5-1 2.5-2.5S20.5 12 19 12h-2V7h-2zm2 5h1c.5 0 1-.3 1-.8V9.8c0-.5-.5-.8-1-.8h-1V12z"/></svg>
          </a>
        </div>
      </div>

      <!-- Journal column -->
      <div>
        <h3 class="footer-head">Explore</h3>
        <nav class="footer-links" aria-label="Site links">
          <a href="index.html">Home</a>
          <a href="films.html">Films</a>
          <a href="music.html">Music</a>
          <a href="books.html">Books</a>
          <a href="initiative.html">Initiative</a>
          <a href="chronicle.html">Chronicle</a>
          <a href="news.html">News</a>
        </nav>
      </div>

      <!-- Author Resources column -->
      <div>
        <h3 class="footer-head">Work</h3>
        <nav class="footer-links" aria-label="Featured work">
          <a href="films.html">Award films</a>
          <a href="music.html">Music &amp; albums</a>
          <a href="books.html">Johar Gandhi</a>
          <a href="initiative.html">Bolti Nadi</a>
          <a href="${BOOK}">Book an event</a>
          <a href="mailto:events@amirhashmi.com">events@amirhashmi.com</a>
        </nav>
      </div>

      <!-- Policies column -->
      <div>
        <h3 class="footer-head">Quick links</h3>
        <nav class="footer-links" aria-label="Quick links">
          <a href="${BOOK}">Book now</a>
          <a href="https://www.researchgate.net/profile/Sayed-Amir-Mustafa-Hashmi" target="_blank" rel="noopener noreferrer">ResearchGate</a>
          <a href="https://scholar.google.com/citations?hl=en&user=Y22LH5kAAAAJ" target="_blank" rel="noopener noreferrer">Google Scholar</a>
          <a href="https://www.imdb.com/find?q=Amir+Hashmi" target="_blank" rel="noopener noreferrer">IMDb</a>
          <a href="news.html">News</a>
          <a href="chronicle.html">Chronicle</a>
        </nav>
      </div>
    </div>

    <div class="footer-bottom">
      <p>
        &copy; <span data-year></span> Amir Hashmi. All rights reserved.
        &nbsp;|&nbsp; <a href="mailto:events@amirhashmi.com" style="color:inherit;">events@amirhashmi.com</a>
      </p>
    </div>
  </div>
</footer>
<div id="toast-container" class="toast-container" aria-live="polite" aria-atomic="false"></div>
<button id="backToTop" class="back-to-top" aria-label="Back to top">↑</button>`;

  function inject(id, html, position = 'before') {
    const placeholder = document.getElementById(id);
    if (!placeholder) return;
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    const parent = placeholder.parentNode;
    while (tmp.firstChild) {
      if (position === 'before') parent.insertBefore(tmp.firstChild, placeholder);
      else parent.insertBefore(tmp.firstChild, placeholder.nextSibling);
    }
    placeholder.remove();
  }

  inject('site-header-inject', HEADER);
  inject('site-footer-inject', FOOTER);

  document.dispatchEvent(new CustomEvent('headerInjected'));

  window.showToast = function (message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const icon = type === 'success'
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.style.borderLeftColor = type === 'success' ? 'var(--emerald)' : 'var(--gold)';
    toast.innerHTML = `${icon}<span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };
})();
