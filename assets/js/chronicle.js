/**
 * Chronicle archive (modal only): loads data/posts.json, search (debounced),
 * year/category filters, pagination, and renders full post content in a modal.
 */
(function () {
  'use strict';

  var PER_PAGE = 12;
  var DEBOUNCE_MS = 300;

  var allPosts = [];
  var filtered = [];
  var page = 1;

  var elGrid = document.getElementById('chronicle-grid');
  var elEmpty = document.getElementById('chronicle-empty');
  var elPagination = document.getElementById('chronicle-pagination');
  var elCount = document.getElementById('chronicle-count');
  var elSkeleton = document.getElementById('chronicle-skeleton');
  var elSearch = document.getElementById('chronicle-search');
  var elYear = document.getElementById('chronicle-year');
  var elCat = document.getElementById('chronicle-cat');

  var elModal = document.getElementById('chronicle-modal');
  var elModalTitle = document.getElementById('chronicle-modal-title');
  var elModalMeta = document.getElementById('chronicle-modal-meta');
  var elModalBadges = document.getElementById('chronicle-modal-badges');
  var elModalBody = document.getElementById('chronicle-modal-body');
  var elModalClose = document.getElementById('chronicle-modal-close');

  if (!elGrid || !elSearch) return;

  function debounce(fn, ms) {
    var t;
    return function () {
      var args = arguments;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(null, args); }, ms);
    };
  }

  function stripHtml(s) {
    var d = document.createElement('div');
    d.innerHTML = s || '';
    return (d.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function escHtml(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function openModal(post) {
    if (!elModal || !post) return;
    elModalTitle.textContent = post.title || '';
    elModalMeta.textContent = post.formattedDate || '';

    elModalBadges.innerHTML = '';
    (post.categories || []).forEach(function (c) {
      var span = document.createElement('span');
      span.className = 'chronicle-badge';
      span.textContent = c;
      elModalBadges.appendChild(span);
    });
    (post.tags || []).slice(0, 12).forEach(function (t) {
      var span = document.createElement('span');
      span.className = 'chronicle-badge';
      span.style.opacity = '0.9';
      span.textContent = t;
      elModalBadges.appendChild(span);
    });

    // Post HTML was sanitized during import (scripts removed, event attrs stripped).
    elModalBody.innerHTML = post.content || '';

    elModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (elModalClose) elModalClose.focus();
  }

  function closeModal() {
    if (!elModal) return;
    elModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    elModalBody.innerHTML = '';
  }

  function applyFilters(resetPage) {
    if (resetPage !== false) page = 1;
    var q = (elSearch.value || '').trim().toLowerCase();
    var y = elYear ? elYear.value : '';
    var c = elCat ? elCat.value : '';

    filtered = allPosts.filter(function (p) {
      if (y && (!p.date || p.date.indexOf(y) !== 0)) return false;
      if (c && (p.categories || []).indexOf(c) === -1) return false;
      if (q) {
        var inTitle = (p.title || '').toLowerCase().indexOf(q) !== -1;
        var inExcerpt = (p.excerpt || '').toLowerCase().indexOf(q) !== -1;
        if (!inTitle && !inExcerpt) return false;
      }
      return true;
    });

    syncUrl();
    render();
  }

  var applyFiltersDebounced = debounce(function () { applyFilters(true); }, DEBOUNCE_MS);

  function syncUrl() {
    if (!window.history || !window.history.replaceState) return;
    var params = new URLSearchParams();
    if (elSearch.value.trim()) params.set('q', elSearch.value.trim());
    if (elYear && elYear.value) params.set('year', elYear.value);
    if (elCat && elCat.value) params.set('cat', elCat.value);
    if (page > 1) params.set('page', String(page));
    var qs = params.toString();
    var url = (window.location.pathname.split('/').pop() || 'chronicle.html') + (qs ? '?' + qs : '');
    window.history.replaceState(null, '', url);
  }

  function readUrlParams() {
    var params = new URLSearchParams(window.location.search);
    if (params.get('q') && elSearch) elSearch.value = params.get('q');
    if (params.get('year') && elYear) elYear.value = params.get('year');
    if (params.get('cat') && elCat) elCat.value = params.get('cat');
    var p = parseInt(params.get('page'), 10);
    if (!isNaN(p) && p > 0) page = p;
  }

  function fillFilters() {
    var years = {};
    var cats = {};
    allPosts.forEach(function (p) {
      if (p.date && p.date.length >= 4) years[p.date.slice(0, 4)] = true;
      (p.categories || []).forEach(function (c) { cats[c] = true; });
    });
    if (elYear) {
      var yv = elYear.value;
      elYear.innerHTML = '<option value=\"\">All years</option>' +
        Object.keys(years).sort(function (a, b) { return b.localeCompare(a); }).map(function (y) {
          return '<option value=\"' + y + '\">' + y + '</option>';
        }).join('');
      elYear.value = yv;
    }
    if (elCat) {
      var cv = elCat.value;
      elCat.innerHTML = '<option value=\"\">All categories</option>' +
        Object.keys(cats).sort(function (a, b) { return a.localeCompare(b); }).map(function (c) {
          return '<option value=\"' + escHtml(c) + '\">' + escHtml(c) + '</option>';
        }).join('');
      elCat.value = cv;
    }
  }

  function render() {
    var total = filtered.length;
    var pages = Math.max(1, Math.ceil(total / PER_PAGE));
    if (page > pages) page = pages;

    if (elCount) {
      elCount.textContent = total === allPosts.length
        ? total + ' posts'
        : total + ' posts (filtered from ' + allPosts.length + ')';
    }

    elGrid.innerHTML = '';
    if (total === 0) {
      if (elEmpty) elEmpty.hidden = false;
      if (elPagination) elPagination.innerHTML = '';
      return;
    }
    if (elEmpty) elEmpty.hidden = true;

    var start = (page - 1) * PER_PAGE;
    var slice = filtered.slice(start, start + PER_PAGE);

    slice.forEach(function (p) {
      var art = document.createElement('article');
      art.className = 'paper-card reveal chronicle-card';

      var imgSrc = p.featuredImage || 'assets/images/blog-placeholder.jpg';
      var img = document.createElement('div');
      img.style.marginBottom = '10px';
      img.innerHTML =
        '<img src=\"' + escHtml(imgSrc) + '\" alt=\"\" class=\"chronicle-card-img\" loading=\"lazy\" width=\"400\" height=\"250\">';

      var time = document.createElement('time');
      time.className = 'chronicle-card-date';
      time.setAttribute('datetime', p.date || '');
      time.textContent = p.formattedDate || '';

      var h = document.createElement('h2');
      h.className = 'paper-title';
      h.textContent = p.title || '';

      var ex = document.createElement('p');
      ex.className = 'paper-abstract';
      ex.textContent = p.excerpt || '';

      var act = document.createElement('div');
      act.className = 'paper-actions';
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-outline btn-sm';
      btn.textContent = 'Read more';
      btn.addEventListener('click', function () { openModal(p); });
      act.appendChild(btn);

      art.appendChild(img);
      art.appendChild(time);
      art.appendChild(h);
      art.appendChild(ex);
      art.appendChild(act);
      elGrid.appendChild(art);
    });

    if (window.revealObserver) {
      elGrid.querySelectorAll('.reveal').forEach(function (node) {
        window.revealObserver.observe(node);
      });
    }

    if (!elPagination) return;
    elPagination.innerHTML = '';
    if (pages <= 1) return;

    var nav = document.createElement('div');
    nav.className = 'chronicle-pagination-inner';
    nav.style.cssText = 'display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:center;margin-top:36px;';

    function pgBtn(label, disabled, targetPage) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'btn btn-outline btn-sm';
      b.textContent = label;
      b.disabled = !!disabled;
      if (!disabled) {
        b.addEventListener('click', function () {
          page = targetPage;
          syncUrl();
          render();
          window.scrollTo({ top: elGrid.offsetTop - 120, behavior: 'smooth' });
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

  function showSkeleton(show) {
    if (elSkeleton) elSkeleton.hidden = !show;
    if (elGrid) elGrid.style.opacity = show ? '0.5' : '1';
  }

  var cacheKey = 'chronicle_posts_json_v1';
  function load() {
    var hadCache = false;
    try {
      var cached = localStorage.getItem(cacheKey);
      if (cached) {
        var data = JSON.parse(cached);
        if (data && data.posts) {
          onData(data.posts);
          hadCache = true;
        }
      }
    } catch (e) {}
    if (!hadCache) showSkeleton(true);

    if (window.location.protocol === 'file:') {
      showSkeleton(false);
      if (elEmpty) {
        elEmpty.hidden = false;
        elEmpty.textContent =
          'Chronicle cannot load data/posts.json when opened as a file (file://). Run a local server from the project folder (for example: npx serve) and open chronicle.html over http://localhost.';
      }
      return;
    }

    var postsUrl = new URL('data/posts.json', window.location.href).href;
    fetch(postsUrl, { cache: 'no-cache' })
      .then(function (r) {
        if (!r.ok) {
          throw new Error('HTTP ' + r.status + ' ' + r.statusText + ' — ' + postsUrl);
        }
        return r.json();
      })
      .then(function (data) {
        var posts = data.posts || [];
        try { localStorage.setItem(cacheKey, JSON.stringify(data)); } catch (e) {}
        onData(posts);
      })
      .catch(function (err) {
        console.error('Chronicle: failed to load posts.json', err);
        showSkeleton(false);
        if (elEmpty) {
          elEmpty.hidden = false;
          var msg = 'Could not load posts. ';
          var details = (err && err.message) ? err.message : '';
          if (details.indexOf('HTTP 404') !== -1) {
            msg += 'The server returned 404 for data/posts.json. Add that file to your deployed site (same folder depth as chronicle.html) and redeploy—for example commit and push data/posts.json to the GitHub Pages branch.';
          } else if (details.indexOf('JSON') !== -1) {
            msg += 'data/posts.json was found but is not valid JSON. Re-export or regenerate the file.';
          } else {
            msg += 'Check the browser console (Network tab → data/posts.json) for details.';
          }
          elEmpty.textContent = msg;
        }
      });
  }

  function onData(posts) {
    allPosts = posts;
    fillFilters();
    readUrlParams();
    applyFilters(false);
    showSkeleton(false);
  }

  // Modal close events
  if (elModalClose) elModalClose.addEventListener('click', closeModal);
  if (elModal) {
    elModal.addEventListener('click', function (e) {
      if (e.target === elModal) closeModal();
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && elModal && elModal.getAttribute('aria-hidden') === 'false') closeModal();
  });

  elSearch.addEventListener('input', function () { applyFiltersDebounced(); });
  if (elYear) elYear.addEventListener('change', function () { applyFilters(true); });
  if (elCat) elCat.addEventListener('change', function () { applyFilters(true); });

  load();
})();
