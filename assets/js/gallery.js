(function () {
  'use strict';

  var PER_PAGE = 12;
  var DEBOUNCE_MS = 300;

  var allEvents = [];
  var filteredEvents = [];
  var page = 1;
  var currentEvent = null;
  var currentImageIndex = 0;

  var elFeaturedGrid = document.getElementById('featured-gallery-grid');
  var elAllGrid = document.getElementById('all-gallery-grid');
  var elEmpty = document.getElementById('gallery-empty');
  var elPagination = document.getElementById('gallery-pagination');
  var elSearch = document.getElementById('gallery-search');
  var elYear = document.getElementById('gallery-year');
  
  var elSkelFeatured = document.getElementById('gallery-skeleton-featured');
  var elSkelAll = document.getElementById('gallery-skeleton-all');

  var elModal = document.getElementById('gallery-modal');
  var elModalTitle = document.getElementById('gallery-modal-title');
  var elModalMeta = document.getElementById('gallery-modal-meta');
  var elModalImg = document.getElementById('lightbox-img');
  var elModalPrev = document.getElementById('lightbox-prev');
  var elModalNext = document.getElementById('lightbox-next');
  var elModalCounter = document.getElementById('lightbox-counter');
  var elModalClose = document.getElementById('gallery-modal-close');

  function debounce(fn, ms) {
    var t;
    return function () {
      var args = arguments;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(null, args); }, ms);
    };
  }

  function escHtml(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function createCardHtml(ev) {
    var cover = ev.coverImage || 'assets/images/blog-placeholder.jpg';
    var imgCount = ev.imageCount || 0;
    var cat = ev.category || 'Event';
    var year = ev.year || '';
    
    return `
      <div class="paper-subject-tag" style="margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
        <span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" style="width:12px;height:12px;margin-right:4px;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          ${escHtml(cat)}
        </span>
        <span style="font-size: 0.75rem; color: var(--text-3); font-weight: 600;">${year}</span>
      </div>
      <div class="gallery-card-img-wrap" style="position:relative; border-radius: var(--r-md); overflow: hidden; margin-bottom: 16px; cursor: pointer;">
        <img src="${escHtml(cover)}" alt="${escHtml(ev.title)}" loading="lazy" style="width:100%; height:200px; object-fit:cover; display:block; transition: transform 0.5s ease;">
        <span class="image-count" style="position:absolute; bottom:10px; right:10px; background: rgba(0,0,0,0.7); color: #fff; padding: 4px 8px; font-size: 0.75rem; border-radius: 6px; font-weight: 600; display:flex; align-items:center; gap:4px; backdrop-filter: blur(4px);">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:12px;height:12px;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          ${imgCount}
        </span>
      </div>
      <h3 class="paper-title" style="margin-bottom: 8px; font-size: 1.1rem; line-height: 1.4; cursor:pointer;">${escHtml(ev.title)}</h3>
      <div class="paper-meta" style="margin-top: auto; padding-top: 12px;">
        <span class="btn btn-sm btn-ghost" style="margin-left:auto; cursor: pointer;">View Gallery</span>
      </div>
    `;
  }

  function openLightbox(eventId, index) {
    var ev = allEvents.find(function(e) { return e.id === eventId; });
    if (!ev || !ev.images || ev.images.length === 0) return;
    
    currentEvent = ev;
    currentImageIndex = index || 0;
    
    elModalTitle.textContent = ev.title;
    elModalMeta.innerHTML = `<strong>${ev.year}</strong> &bull; ${escHtml(ev.category)}`;
    
    updateLightboxImage();
    
    elModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (elModalClose) elModalClose.focus();
  }

  function updateLightboxImage() {
    if (!currentEvent || !currentEvent.images) return;
    
    var imgName = currentEvent.images[currentImageIndex];
    var imgSrc = `assets/images/gallery/${currentEvent.slug}/${imgName}`;
    
    elModalImg.src = imgSrc;
    elModalCounter.textContent = `${currentImageIndex + 1} / ${currentEvent.images.length}`;
    
    elModalPrev.style.display = currentEvent.images.length > 1 ? 'flex' : 'none';
    elModalNext.style.display = currentEvent.images.length > 1 ? 'flex' : 'none';
  }

  function nextImage() {
    if (!currentEvent) return;
    currentImageIndex = (currentImageIndex + 1) % currentEvent.images.length;
    updateLightboxImage();
  }

  function prevImage() {
    if (!currentEvent) return;
    currentImageIndex = (currentImageIndex - 1 + currentEvent.images.length) % currentEvent.images.length;
    updateLightboxImage();
  }

  function closeLightbox() {
    if (!elModal) return;
    elModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    elModalImg.src = '';
    currentEvent = null;
  }

  function renderFeaturedEvents() {
    if (!elFeaturedGrid) return;
    elFeaturedGrid.innerHTML = '';
    
    var featured = allEvents.filter(function(e) { return e.isFeatured; }).slice(0, 6);
    
    featured.forEach(function(ev) {
      var art = document.createElement('article');
      art.className = 'paper-card reveal';
      art.innerHTML = createCardHtml(ev);
      
      art.addEventListener('click', function() { openLightbox(ev.id, 0); });
      
      elFeaturedGrid.appendChild(art);
    });
    
    if (window.revealObserver) {
      elFeaturedGrid.querySelectorAll('.reveal').forEach(function(node) {
        window.revealObserver.observe(node);
      });
    }
  }

  function renderAllEvents() {
    if (!elAllGrid) return;
    elAllGrid.innerHTML = '';
    
    var total = filteredEvents.length;
    var pages = Math.max(1, Math.ceil(total / PER_PAGE));
    if (page > pages) page = pages;

    if (total === 0) {
      if (elEmpty) elEmpty.hidden = false;
      if (elPagination) elPagination.innerHTML = '';
      return;
    }
    
    if (elEmpty) elEmpty.hidden = true;

    var start = (page - 1) * PER_PAGE;
    var slice = filteredEvents.slice(start, start + PER_PAGE);

    slice.forEach(function(ev) {
      var art = document.createElement('article');
      art.className = 'paper-card reveal';
      art.innerHTML = createCardHtml(ev);
      
      art.addEventListener('click', function() { openLightbox(ev.id, 0); });
      
      elAllGrid.appendChild(art);
    });

    if (window.revealObserver) {
      elAllGrid.querySelectorAll('.reveal').forEach(function(node) {
        window.revealObserver.observe(node);
      });
    }

    renderPagination(pages);
  }

  function renderPagination(pages) {
    if (!elPagination) return;
    elPagination.innerHTML = '';
    if (pages <= 1) return;

    var nav = document.createElement('div');
    nav.className = 'chronicle-pagination-inner';
    nav.style.cssText = 'display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:center;';

    function pgBtn(label, disabled, targetPage) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'btn btn-outline btn-sm';
      b.textContent = label;
      b.disabled = !!disabled;
      if (!disabled) {
        b.addEventListener('click', function () {
          page = targetPage;
          renderAllEvents();
          window.scrollTo({ top: elAllGrid.offsetTop - 120, behavior: 'smooth' });
        });
      }
      return b;
    }

    nav.appendChild(pgBtn('Previous', page <= 1, page - 1));
    var span = document.createElement('span');
    span.style.cssText = 'font-size:0.88rem;color:var(--text-3);font-weight:600;';
    span.textContent = 'Page ' + page + ' / ' + pages;
    nav.appendChild(span);
    nav.appendChild(pgBtn('Next', page >= pages, page + 1));
    elPagination.appendChild(nav);
  }

  function applyFilters() {
    page = 1;
    var q = (elSearch.value || '').trim().toLowerCase();
    var y = elYear ? elYear.value : '';

    filteredEvents = allEvents.filter(function (ev) {
      if (y && String(ev.year) !== y) return false;
      if (q) {
        var inTitle = (ev.title || '').toLowerCase().indexOf(q) !== -1;
        if (!inTitle) return false;
      }
      return true;
    });

    renderAllEvents();
  }

  var applyFiltersDebounced = debounce(function () { applyFilters(); }, DEBOUNCE_MS);

  function fillFilters() {
    var years = {};
    allEvents.forEach(function (ev) {
      if (ev.year) years[ev.year] = true;
    });
    
    if (elYear) {
      var yv = elYear.value;
      elYear.innerHTML = '<option value="">All years</option>' +
        Object.keys(years).sort(function (a, b) { return b - a; }).map(function (y) {
          return '<option value="' + y + '">' + y + '</option>';
        }).join('');
      elYear.value = yv;
    }
  }

  function fetchGalleryData() {
    if (elSkelFeatured) elSkelFeatured.hidden = false;
    if (elSkelAll) elSkelAll.hidden = false;
    
    var url = new URL('data/gallery.json', window.location.href).href;
    fetch(url, { cache: 'no-cache' })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        allEvents = data.events || [];
        
        if (elSkelFeatured) elSkelFeatured.hidden = true;
        if (elSkelAll) elSkelAll.hidden = true;
        
        fillFilters();
        applyFilters();
        renderFeaturedEvents();
      })
      .catch(function(err) {
        console.error('Failed to load gallery.json', err);
        if (elSkelFeatured) elSkelFeatured.hidden = true;
        if (elSkelAll) elSkelAll.hidden = true;
        if (elEmpty) {
          elEmpty.hidden = false;
          elEmpty.textContent = 'Could not load gallery archive.';
        }
      });
  }

  // Init
  if (elModalClose) elModalClose.addEventListener('click', closeLightbox);
  if (elModal) {
    elModal.addEventListener('click', function (e) {
      if (e.target === elModal || e.target.classList.contains('modal-overlay')) closeLightbox();
    });
  }
  
  if (elModalPrev) elModalPrev.addEventListener('click', prevImage);
  if (elModalNext) elModalNext.addEventListener('click', nextImage);
  
  document.addEventListener('keydown', function (e) {
    if (elModal && elModal.getAttribute('aria-hidden') === 'false') {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'ArrowRight') nextImage();
    }
  });

  if (elSearch) elSearch.addEventListener('input', applyFiltersDebounced);
  if (elYear) elYear.addEventListener('change', applyFilters);

  fetchGalleryData();

})();
