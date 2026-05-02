(function () {
  'use strict';

  var DEBOUNCE_MS = 300;

  var allEvents = [];
  var filteredEvents = [];
  var currentEvent = null;
  var currentImageIndex = 0;

  var elAllContainer = document.getElementById('all-gallery-container');
  var elEmpty = document.getElementById('gallery-empty');
  var elSearch = document.getElementById('gallery-search');
  var elYear = document.getElementById('gallery-year');
  var elCategory = document.getElementById('gallery-category');
  var elSkelAll = document.getElementById('gallery-skeleton-all');

  var elModal = document.getElementById('gallery-modal');
  var elModalImg = document.getElementById('lightbox-img');
  var elModalPrev = document.getElementById('lightbox-prev');
  var elModalNext = document.getElementById('lightbox-next');
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

  function createCollageHtml(ev) {
    var cover = ev.coverImage || 'assets/images/blog-placeholder.jpg';
    var cat = ev.category || 'Event';
    var year = ev.year || '';
    
    // Get up to 3 secondary images
    var secondaryHtml = '';
    var images = ev.images || [];
    var maxSecondary = 3;
    var count = 0;
    
    // Create the secondary grid with dynamic rows based on how many images we actually have
    for (var i = 0; i < images.length && count < maxSecondary; i++) {
      var imgSrc = `assets/images/gallery/${ev.slug}/${images[i]}`;
      // Skip if it's the exact same filename as cover image to avoid duplication
      if (cover.indexOf(images[i]) === -1) {
        secondaryHtml += `<img src="${escHtml(imgSrc)}" class="album-secondary" alt="" loading="lazy">`;
        count++;
      }
    }
    
    // Fallback if no secondary images
    if (count === 0) {
      secondaryHtml = `<img src="${escHtml(cover)}" class="album-secondary" alt="" loading="lazy">`;
      count = 1;
    }
    
    var gridStyle = count > 1 ? `grid-template-rows: repeat(${count}, 1fr);` : `grid-template-rows: 1fr;`;

    return `
      <img src="${escHtml(cover)}" alt="${escHtml(ev.title)}" class="album-primary" loading="lazy">
      <div class="album-secondary-grid" style="${gridStyle}">
        ${secondaryHtml}
      </div>
      <div class="event-title-overlay">
        <h3 style="margin:0; font-size: 1.1rem; color: #fff; line-height:1.3;">${escHtml(ev.title)}</h3>
        <div style="font-size: 0.8rem; color: var(--gold); margin-top: 4px;">${escHtml(cat)} &bull; ${ev.imageCount || images.length} Photos</div>
      </div>
      <span style="position:absolute; top:10px; right:10px; background: rgba(0,0,0,0.8); color: #fff; padding: 4px 8px; font-size: 0.75rem; border-radius: 6px; font-weight: 700; z-index:2; border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(4px);">${year}</span>
    `;
  }

  function openLightbox(eventId, index) {
    var ev = allEvents.find(function(e) { return e.id === eventId; });
    if (!ev || !ev.images || ev.images.length === 0) return;
    
    currentEvent = ev;
    currentImageIndex = index || 0;
    
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

  function renderAllEvents() {
    if (!elAllContainer) return;
    elAllContainer.innerHTML = '';
    
    var total = filteredEvents.length;

    if (total === 0) {
      if (elEmpty) elEmpty.hidden = false;
      return;
    }
    
    if (elEmpty) elEmpty.hidden = true;

    // Group by year
    var grouped = {};
    filteredEvents.forEach(function(ev) {
      var y = ev.year || 'Other';
      if (!grouped[y]) grouped[y] = [];
      grouped[y].push(ev);
    });

    // Sort years descending
    var years = Object.keys(grouped).sort(function(a, b) {
      if (a === 'Other') return 1;
      if (b === 'Other') return -1;
      return b - a;
    });

    years.forEach(function(y) {
      var section = document.createElement('div');
      section.className = 'year-section reveal';
      
      var header = document.createElement('h2');
      header.className = 'year-header';
      header.textContent = y;
      section.appendChild(header);

      var grid = document.createElement('div');
      grid.className = 'grid-3';
      
      grouped[y].forEach(function(ev) {
        var art = document.createElement('div');
        art.className = 'album-collage reveal';
        art.innerHTML = createCollageHtml(ev);
        
        art.addEventListener('click', function() { openLightbox(ev.id, 0); });
        grid.appendChild(art);
      });
      
      section.appendChild(grid);
      elAllContainer.appendChild(section);
    });

    if (window.revealObserver) {
      elAllContainer.querySelectorAll('.reveal').forEach(function(node) {
        window.revealObserver.observe(node);
      });
    }
  }

  function applyFilters() {
    var q = (elSearch.value || '').trim().toLowerCase();
    var y = elYear ? elYear.value : '';
    var c = elCategory ? elCategory.value : '';

    filteredEvents = allEvents.filter(function (ev) {
      if (y && String(ev.year) !== y) return false;
      if (c && ev.category !== c) return false;
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
    if (elSkelAll) elSkelAll.hidden = false;
    
    var url = new URL('data/gallery.json', window.location.href).href;
    fetch(url, { cache: 'no-cache' })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        allEvents = data.events || [];
        
        if (elSkelAll) elSkelAll.hidden = true;
        
        fillFilters();
        applyFilters();
      })
      .catch(function(err) {
        console.error('Failed to load gallery.json', err);
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
  if (elCategory) elCategory.addEventListener('change', applyFilters);

  fetchGalleryData();

})();
