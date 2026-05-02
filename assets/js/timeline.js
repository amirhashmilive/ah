/* ============================================================
   IJMEER — timeline.js
   Renders the quarterly deadline widget on the homepage
   ============================================================ */
(function () {
  'use strict';

  const QUARTERS = [
    { id: 'Q1', label: 'Quarter 1 (Jan–Mar)', deadlineMonth: 2, deadlineDay: 15, pubMonth: 3, pubLabel: 'April 25–31' },
    { id: 'Q2', label: 'Quarter 2 (Apr–Jun)', deadlineMonth: 5, deadlineDay: 15, pubMonth: 6, pubLabel: 'July 25–31' },
    { id: 'Q3', label: 'Quarter 3 (Jul–Sep)', deadlineMonth: 8, deadlineDay: 15, pubMonth: 9, pubLabel: 'October 25–31' },
    { id: 'Q4', label: 'Quarter 4 (Oct–Dec)', deadlineMonth: 11, deadlineDay: 15, pubMonth: 0, pubLabel: 'January 25–31' },
  ];

  function pad(n) { return String(n).padStart(2, '0'); }

  function formatDeadline(month, day) {
    const y = new Date().getFullYear();
    const d = new Date(y, month, day);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  function getStatus(month, day) {
    const now = new Date();
    const y    = now.getFullYear();
    const dl   = new Date(y, month, day, 23, 59, 59);
    if (dl < now) return 'past';
    const daysLeft = Math.floor((dl - now) / 86400000);
    if (daysLeft < 14) return 'closing';
    return 'open';
  }

  function getCountdown(month, day) {
    const now = new Date();
    const y   = now.getFullYear();
    const dl  = new Date(y, month, day, 23, 59, 59);
    const ms  = dl - now;
    if (ms <= 0) return null;
    const d = Math.floor(ms / 86400000);
    const h = Math.floor((ms % 86400000) / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return { d, h, m, s, ms };
  }

  function getCurrentQuarter() {
    const now = new Date();
    const y   = now.getFullYear();
    for (const q of QUARTERS) {
      const dl = new Date(y, q.deadlineMonth, q.deadlineDay, 23, 59, 59);
      if (dl > now) return q;
    }
    return QUARTERS[0]; // fallback to Q1 next year
  }

  function renderTimeline() {
    const grid    = document.getElementById('quarters-grid');
    const tlName  = document.getElementById('tl-quarter-name');
    const tlDl    = document.getElementById('tl-deadline');
    const tlStat  = document.getElementById('tl-status');

    if (!grid) return;

    const now   = new Date();
    const year  = now.getFullYear();
    const current = getCurrentQuarter();

    // Update header
    if (tlName) tlName.textContent = current.label + ' ' + year;
    if (tlDl)   tlDl.textContent   = 'Submission deadline: ' + formatDeadline(current.deadlineMonth, current.deadlineDay);

    const status = getStatus(current.deadlineMonth, current.deadlineDay);
    if (tlStat) {
      tlStat.textContent = status === 'open' ? 'Open' : status === 'closing' ? 'Closing Soon' : 'Closed';
      tlStat.className   = 'q-status ' + status;
    }

    // Render all 4 quarters
    grid.innerHTML = '';
    QUARTERS.forEach(q => {
      const qStatus = getStatus(q.deadlineMonth, q.deadlineDay);
      const isActive = q.id === current.id;
      const dl = formatDeadline(q.deadlineMonth, q.deadlineDay);
      const pubYear  = q.pubMonth === 0 ? year + 1 : year;
      const pubMonth = new Date(pubYear, q.pubMonth).toLocaleString('en', { month: 'long' });

      const card = document.createElement('div');
      card.className = `q-item${isActive ? ' active' : ''}${qStatus === 'past' ? ' past' : ''}`;
      card.setAttribute('role', 'listitem');
      card.innerHTML = `
        <div class="q-name">${q.id} — ${year}</div>
        <div class="q-dates">
          <div>📅 Deadline: <span class="q-date-highlight">${dl}</span></div>
          <div>📖 Publication: <span class="q-date-highlight">${pubMonth} ${pubYear}</span></div>
        </div>
        <div class="q-status ${qStatus}">${qStatus === 'open' ? 'Open' : qStatus === 'closing' ? 'Closing Soon' : 'Closed'}</div>`;
      grid.appendChild(card);
    });
  }

  // Countdown ticker for timeline widget
  function updateTlCountdown() {
    const el = document.getElementById('tl-countdown');
    if (!el) return;
    const current = getCurrentQuarter();
    const cd = getCountdown(current.deadlineMonth, current.deadlineDay);
    if (!cd) { el.textContent = 'Deadline passed'; return; }
    el.textContent = `${cd.d}d ${pad(cd.h)}h ${pad(cd.m)}m ${pad(cd.s)}s`;
  }

  // Init
  document.addEventListener('DOMContentLoaded', () => {
    renderTimeline();
    updateTlCountdown();
    setInterval(updateTlCountdown, 1000);
  });
})();
