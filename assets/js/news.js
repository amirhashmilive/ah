(function () {
  'use strict';

  var PER_PAGE = 12;
  var DEBOUNCE_MS = 300;

  var allNews = [];
  var filtered = [];
  var page = 1;

  var elRssGrid = document.getElementById('rss-feed-grid');
  var elRssLoading = document.getElementById('rss-loading');
  var elRssError = document.getElementById('rss-error');

  var elGrid = document.getElementById('news-archive-grid');
  var elEmpty = document.getElementById('news-empty');
  var elPagination = document.getElementById('news-pagination');
  var elCount = document.getElementById('news-count');
  var elSkeleton = document.getElementById('news-skeleton');
  var elSearch = document.getElementById('news-search');
  var elYear = document.getElementById('news-year');
  var elCat = document.getElementById('news-cat');

  var elModal = document.getElementById('chronicle-modal');
  var elModalTitle = document.getElementById('chronicle-modal-title');
  var elModalMeta = document.getElementById('chronicle-modal-meta');
  var elModalBadges = document.getElementById('chronicle-modal-badges');
  var elModalBody = document.getElementById('chronicle-modal-body');
  var elModalClose = document.getElementById('chronicle-modal-close');

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

  // Check if text is related to Bolti Nadi / River
  function isRiverNews(text) {
    var lower = (text || '').toLowerCase();
    return lower.indexOf('bolti nadi') !== -1 || 
           lower.indexOf('river') !== -1 || 
           lower.indexOf('sakri') !== -1 || 
           lower.indexOf('नदी') !== -1;
  }

  function getRiverBadgeHtml() {
    return `
      <a href="initiative.html" class="bolti-nadi-badge" style="margin-top: 10px;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
        Explore Bolti Nadi
      </a>`;
  }

  // --- RSS Section ---
  var rssFeeds = [
    {
      name: 'Amir Hashmi Raipur',
      url: 'https://news.google.com/rss/search?q=Amir+Hashmi+Raipur+Chhattisgarh&hl=en-IN&gl=IN&ceid=IN:en'
    },
    {
      name: 'Bolti Nadi',
      url: 'https://news.google.com/rss/search?q=Bolti+Nadi+Chhattisgarh&hl=en-IN&gl=IN&ceid=IN:en'
    },
    {
      name: 'Sakri River Chhattisgarh',
      url: 'https://news.google.com/rss/search?q=Sakri+River+Chhattisgarh&hl=en-IN&gl=IN&ceid=IN:en'
    },
    {
      name: 'Meer Foundation Raipur',
      url: 'https://news.google.com/rss/search?q=Meer+Foundation+Raipur+Chhattisgarh+-Shah+Rukh+Khan&hl=en-IN&gl=IN&ceid=IN:en'
    }
  ];

  // Geographic validation – MUST mention Chhattisgarh or related city
  function isValidForAmirHashmi(newsItem) {
    var content = (newsItem.title + ' ' + (newsItem.description || '') + ' ' + (newsItem.content || '')).toLowerCase();
    
    // Geographic keywords (must contain at least one)
    var geoKeywords = [
      'chhattisgarh', 'छत्तीसगढ़',
      'raipur', 'रायपुर',
      'dhamtari', 'धमतरी',
      'bhilai',
      'bilaspur',
      'korba',
      'jagdalpur',
      'ambikapur',
      ' cg ',
      '-cg'
    ];
    
    // Strong identifier keywords (can override missing geo if present)
    var strongKeywords = [
      'bolti nadi',
      'sakri river',
      'meer foundation',
      'national award india',
      'mirror of the clean india'
    ];

    var exclusionKeywords = [
      'pakistan', 'uae', 'dubai', 'saudi arabia', 'karachi', 'lahore', 'islamabad', 'bangladesh'
    ];
    
    var hasGeo = geoKeywords.some(function(keyword) { return content.indexOf(keyword) !== -1; });
    var hasStrong = strongKeywords.some(function(keyword) { return content.indexOf(keyword) !== -1; });
    var hasExclusion = exclusionKeywords.some(function(keyword) { return content.indexOf(keyword) !== -1; });

    // Exclude if it has exclusion keywords and NO strong keywords
    if (hasExclusion && !hasStrong && !hasGeo) {
      return false;
    }

    // Must have either geographic marker OR strong identifier
    return hasGeo || hasStrong;
  }

  function hasGeoMarker(newsItem) {
    var content = (newsItem.title + ' ' + (newsItem.description || '') + ' ' + (newsItem.content || '')).toLowerCase();
    var geoKeywords = ['chhattisgarh', 'छत्तीसगढ़', 'raipur', 'रायपुर', 'dhamtari', 'धमतरी', 'bhilai', 'bilaspur', 'korba', 'jagdalpur', 'ambikapur', ' cg ', '-cg'];
    return geoKeywords.some(function(keyword) { return content.indexOf(keyword) !== -1; });
  }

  function fetchRSSFeeds() {
    if (!elRssGrid) return;
    
    var allRssItems = [];
    var fetches = rssFeeds.map(function(feed) {
      var apiUrl = 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(feed.url);
      
      return fetch(apiUrl)
        .then(function(res) { return res.json(); })
        .then(function(data) {
          if (data && data.status === 'ok' && data.items) {
            var validNews = data.items.filter(function(item) { return isValidForAmirHashmi(item); });
            console.log('Filtered: ' + data.items.length + ' → ' + validNews.length + ' valid news items for ' + feed.name);
            validNews.forEach(function(item) {
              allRssItems.push(item);
            });
          }
        })
        .catch(function(e) { console.error('RSS Fetch error for ' + feed.name, e); });
    });

    Promise.all(fetches).then(function() {
      if (elRssLoading) elRssLoading.hidden = true;
      
      if (allRssItems.length === 0) {
        if (elRssError) elRssError.hidden = false;
        return;
      }

      // Sort by pubDate descending
      allRssItems.sort(function(a, b) {
        return new Date(b.pubDate) - new Date(a.pubDate);
      });

      // Deduplicate by title
      var unique = [];
      var seen = {};
      allRssItems.forEach(function(item) {
        if (!seen[item.title]) {
          seen[item.title] = true;
          unique.push(item);
        }
      });

      // Take top 12
      var topItems = unique.slice(0, 12);
      
      topItems.forEach(function(item) {
        var card = document.createElement('article');
        card.className = 'rss-card';
        
        var source = item.source || 'Google News';
        var dateStr = new Date(item.pubDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        
        var locationBadge = hasGeoMarker(item) ? '<span class="location-badge">📍 Chhattisgarh</span>' : '';

        var innerHtml = \`
          <div class="rss-source">\${escHtml(source)}</div>
          <a href="\${escHtml(item.link)}" target="_blank" rel="noopener noreferrer" class="rss-title">
            \${escHtml(item.title)} \${locationBadge}
          </a>
          <div class="rss-date">\${dateStr}</div>
        \`;
        
        if (isRiverNews(item.title + ' ' + (item.description || ''))) {
          innerHtml += getRiverBadgeHtml();
        }
        
        card.innerHTML = innerHtml;
        elRssGrid.appendChild(card);
      });
      
      if (window.revealObserver) {
        window.revealObserver.observe(elRssGrid);
      }
    });
  }

  // --- Archive Section ---

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

    var bodyHtml = post.content || '';
    if (isRiverNews(post.title + ' ' + post.content + ' ' + (post.categories || []).join(' '))) {
      bodyHtml += getRiverBadgeHtml();
    }
    
    elModalBody.innerHTML = bodyHtml;

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

    filtered = allNews.filter(function (p) {
      if (y && (!p.date || p.date.indexOf(y) !== 0)) return false;
      if (c && (p.categories || []).indexOf(c) === -1) return false;
      if (q) {
        var inTitle = (p.title || '').toLowerCase().indexOf(q) !== -1;
        var inExcerpt = (p.excerpt || '').toLowerCase().indexOf(q) !== -1;
        var inContent = (p.content || '').toLowerCase().indexOf(q) !== -1;
        if (!inTitle && !inExcerpt && !inContent) return false;
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
    var url = (window.location.pathname.split('/').pop() || 'news.html') + (qs ? '?' + qs : '');
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
    allNews.forEach(function (p) {
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
      elCount.textContent = total === allNews.length
        ? total + ' items'
        : total + ' items (filtered from ' + allNews.length + ')';
    }

    if (!elGrid) return;
    elGrid.innerHTML = '';
    
    if (total === 0) {
      if (elEmpty) {
        elEmpty.hidden = false;
        elEmpty.textContent = "No news items found.";
      }
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
      img.innerHTML = '<img src=\"' + escHtml(imgSrc) + '\" alt=\"\" class=\"news-card-img\" loading=\"lazy\" width=\"400\" height=\"250\">';

      var time = document.createElement('time');
      time.className = 'news-card-date';
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
      act.style.flexDirection = 'column';
      act.style.alignItems = 'flex-start';
      
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-outline btn-sm';
      btn.textContent = 'Read more';
      btn.addEventListener('click', function () { openModal(p); });
      act.appendChild(btn);
      
      if (isRiverNews(p.title + ' ' + p.content + ' ' + (p.categories || []).join(' '))) {
        act.insertAdjacentHTML('beforeend', getRiverBadgeHtml());
      }

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
    if (show && elEmpty) {
      elEmpty.hidden = false;
      elEmpty.textContent = "Loading archive...";
    } else if (!show && elEmpty) {
      elEmpty.hidden = true;
    }
  }

  var cacheKey = 'news_archive_json_v1';
  function loadArchive() {
    var hadCache = false;
    try {
      var cached = localStorage.getItem(cacheKey);
      if (cached) {
        var data = JSON.parse(cached);
        if (data && data.news) {
          onData(data.news);
          hadCache = true;
        }
      }
    } catch (e) {}
    if (!hadCache) showSkeleton(true);

    if (window.location.protocol === 'file:') {
      showSkeleton(false);
      if (elEmpty) {
        elEmpty.hidden = false;
        elEmpty.textContent = 'Cannot load data/news.json over file:// protocol.';
      }
      return;
    }

    var postsUrl = new URL('data/news.json', window.location.href).href;
    fetch(postsUrl, { cache: 'no-cache' })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (data) {
        var items = data.news || [];
        try { localStorage.setItem(cacheKey, JSON.stringify(data)); } catch (e) {}
        onData(items);
      })
      .catch(function (err) {
        console.error('Failed to load news.json', err);
        showSkeleton(false);
        if (elEmpty) {
          elEmpty.hidden = false;
          elEmpty.textContent = 'Could not load news archive.';
        }
      });
  }

  function onData(items) {
    allNews = items;
    fillFilters();
    readUrlParams();
    applyFilters(false);
    showSkeleton(false);
  }

  // Init
  if (elModalClose) elModalClose.addEventListener('click', closeModal);
  if (elModal) {
    elModal.addEventListener('click', function (e) {
      if (e.target === elModal) closeModal();
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && elModal && elModal.getAttribute('aria-hidden') === 'false') closeModal();
  });

  if (elSearch) elSearch.addEventListener('input', function () { applyFiltersDebounced(); });
  if (elYear) elYear.addEventListener('change', function () { applyFilters(true); });
  if (elCat) elCat.addEventListener('change', function () { applyFilters(true); });

  // Fire both loaders
  fetchRSSFeeds();
  loadArchive();

})();
