/* ============================================================
   IJMEER — papers.js
   Powers paper search, filtering, and citation tools
   across Issues, Citations, and Articles pages
   ============================================================ */
(function () {
  'use strict';

  // Cache
  let _papersCache = null;
  let _issuesCache = null;

  async function fetchPapers() {
    if (_papersCache) return _papersCache;
    const r = await fetch('data/papers.json');
    const d = await r.json();
    _papersCache = d.papers || [];
    return _papersCache;
  }

  async function fetchIssues() {
    if (_issuesCache) return _issuesCache;
    const r = await fetch('data/issues.json');
    const d = await r.json();
    _issuesCache = Array.isArray(d) ? d : d.issues || [];
    return _issuesCache;
  }

  // ── Public API ────────────────────────────────────────────
  window.IJMEER = window.IJMEER || {};

  window.IJMEER.fetchPapers = fetchPapers;
  window.IJMEER.fetchIssues = fetchIssues;

  // Format citation
  window.IJMEER.formatCitation = function(paper, format = 'APA') {
    const journal = 'INTERNATIONAL JOURNAL OF MULTIDISCIPLINARY EXPLICATION AND EMERGING RESEARCH (IJMEER)';
    const issueStr = `Vol. ${paper.volume}, Issue ${paper.issue}`;
    switch (format) {
      case 'MLA':
        return `${paper.authors}. "${paper.title}." <em>${journal}</em>, ${issueStr}, ${paper.year}.`;
      case 'BibTeX': {
        const key = (paper.authors.split(',')[0].split(' ').pop() || 'author').toLowerCase() + paper.year;
        return `@article{${key},\n  author  = {${paper.authors}},\n  title   = {${paper.title}},\n  journal = {IJMEER},\n  year    = {${paper.year}},\n  volume  = {${paper.volume}},\n  number  = {${paper.issue}},\n  doi     = {${paper.doi || 'N/A'}}\n}`;
      }
      default: // APA
        return `${paper.authors} (${paper.year}). ${paper.title}. <em>${journal}</em>, ${issueStr}.`;
    }
  };

  // Generate subject colour mapping
  const SUBJECT_COLORS = [
    '#2563EB', '#7C3AED', '#059669', '#0D9488', '#F59E0B',
    '#E11D48', '#F97316', '#06B6D4', '#6366F1', '#10B981'
  ];
  const _colorMap = {};
  let _colorIdx = 0;
  window.IJMEER.subjectColor = function(subject) {
    if (!_colorMap[subject]) {
      _colorMap[subject] = SUBJECT_COLORS[_colorIdx % SUBJECT_COLORS.length];
      _colorIdx++;
    }
    return _colorMap[subject];
  };

})();
