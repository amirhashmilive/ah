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
  var elViewerContainer = document.getElementById('viewer-container');
  var elThumbnails = document.getElementById('viewer-thumbnails');

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
    var cat = ev.category || 'Event';
    var year = ev.year || '';
    var images = ev.images || [];

    return `
      <div style="position:relative; overflow:hidden;">
        <img src="${escHtml(cover)}" alt="${escHtml(ev.title)}" class="album-primary" loading="lazy">
        <span style="position:absolute; top:12px; right:12px; background: rgba(0,0,0,0.8); color: #fff; padding: 4px 10px; font-size: 0.75rem; border-radius: 6px; font-weight: 700; z-index:2; border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(4px);">${ev.imageCount || images.length} Photos</span>
      </div>
      <div class="album-info">
        <h3 class="album-title">${escHtml(ev.title)}</h3>
        <div class="album-meta">
          <span style="font-weight:700; color:var(--gold);">${year}</span> &bull; <span>${escHtml(cat)}</span>
        </div>
      </div>
    `;
  }

  function openLightbox(eventId, index) {
    var ev = allEvents.find(function(e) { return e.id === eventId; });
    if (!ev || !ev.images || ev.images.length === 0) return;
    
    currentEvent = ev;
    currentImageIndex = index || 0;
    
    if (elThumbnails) {
      elThumbnails.innerHTML = '';
      currentEvent.images.forEach(function(img, idx) {
        var tSrc = `assets/images/gallery/${currentEvent.slug}/${img}`;
        var tImg = document.createElement('img');
        tImg.className = 'viewer-thumbnail';
        tImg.src = tSrc;
        tImg.loading = 'lazy';
        tImg.addEventListener('click', function(e) {
          e.stopPropagation();
          currentImageIndex = idx;
          updateLightboxImage();
        });
        elThumbnails.appendChild(tImg);
      });
    }

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

    if (elThumbnails) {
      Array.from(elThumbnails.children).forEach(function(child, idx) {
        if (idx === currentImageIndex) {
          child.classList.add('active');
          child.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        } else {
          child.classList.remove('active');
        }
      });
    }

    if (currentEvent.images.length > 1) {
      var nextIdx = (currentImageIndex + 1) % currentEvent.images.length;
      var prevIdx = (currentImageIndex - 1 + currentEvent.images.length) % currentEvent.images.length;
      new Image().src = `assets/images/gallery/${currentEvent.slug}/${currentEvent.images[nextIdx]}`;
      new Image().src = `assets/images/gallery/${currentEvent.slug}/${currentEvent.images[prevIdx]}`;
    }
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
        art.className = 'album-card reveal';
        art.innerHTML = createCardHtml(ev);
        
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
      if (e.target === elModal) closeLightbox();
    });
  }
  
  if (elViewerContainer) {
    var touchStartX = 0;
    var touchEndX = 0;

    elViewerContainer.addEventListener('touchstart', function(e) {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    elViewerContainer.addEventListener('touchend', function(e) {
      touchEndX = e.changedTouches[0].screenX;
      if (touchEndX < touchStartX - 50) nextImage();
      if (touchEndX > touchStartX + 50) prevImage();
    }, { passive: true });
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

  var elScrollTop = document.getElementById('scroll-to-top');
  if (elScrollTop) {
    window.addEventListener('scroll', function() {
      if (window.scrollY > 300) {
        elScrollTop.classList.add('show');
      } else {
        elScrollTop.classList.remove('show');
      }
    });
    elScrollTop.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  fetchGalleryData();

})();
