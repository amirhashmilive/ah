// Anti-copy protection specifically for johar-gandhi.html
document.addEventListener('DOMContentLoaded', () => {

  // --- SINGLE TAB SESSION ---
  const tabId = Math.random().toString(36).substr(2, 9);
  localStorage.setItem('jg_active_tab', tabId);
  
  window.addEventListener('storage', (e) => {
    if (e.key === 'jg_active_tab' && e.newValue !== tabId) {
      document.body.innerHTML = '<div style="padding: 50px; text-align: center; font-size: 1.5rem;">Document already open in another tab. Only one active session allowed.</div>';
    }
  });

  // --- CAPTCHA ON PAGE LOAD ---
  const overlay = document.getElementById('jg-captcha-overlay');
  const questionEl = document.getElementById('jg-captcha-question');
  const inputEl = document.getElementById('jg-captcha-input');
  const submitBtn = document.getElementById('jg-captcha-submit');
  const errorEl = document.getElementById('jg-captcha-error');

  let currentAnswer = 0;

  function generateCaptcha() {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    currentAnswer = num1 + num2;
    questionEl.textContent = `What is ${num1} + ${num2}?`;
    inputEl.value = '';
    errorEl.style.display = 'none';
    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  function verifyCaptcha() {
    if (parseInt(inputEl.value) === currentAnswer) {
      sessionStorage.setItem('jg_verified', 'true');
      overlay.style.display = 'none';
      document.body.style.overflow = 'auto';
      resetInactivityTimer();
    } else {
      errorEl.style.display = 'block';
    }
  }

  submitBtn.addEventListener('click', verifyCaptcha);
  inputEl.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') verifyCaptcha();
  });

  if (sessionStorage.getItem('jg_verified') !== 'true') {
    generateCaptcha();
  } else {
    overlay.style.display = 'none';
  }

  // --- SESSION TIMEOUT (15 MINUTES) ---
  let inactivityTimer;
  const TIMEOUT_MS = 15 * 60 * 1000;

  function lockSession() {
    sessionStorage.removeItem('jg_verified');
    generateCaptcha();
  }

  function resetInactivityTimer() {
    if (sessionStorage.getItem('jg_verified') === 'true') {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(lockSession, TIMEOUT_MS);
    }
  }

  // Track activity
  ['mousemove', 'keydown', 'scroll', 'click'].forEach(evt => {
    window.addEventListener(evt, resetInactivityTimer, { passive: true });
  });

  resetInactivityTimer();


  // --- COPY PROTECTION & LIMITING ---
  let copyAttempts = 0;
  let copyTimer = null;

  // 1. Disable right-click
  document.addEventListener('contextmenu', event => event.preventDefault());

  // 2. Custom copy event: Only 1 paragraph max and add copyright
  document.addEventListener('copy', (e) => {
    e.preventDefault();
    
    // Copy attempt limiting
    copyAttempts++;
    if (!copyTimer) {
      copyTimer = setTimeout(() => {
        copyAttempts = 0;
        copyTimer = null;
      }, 60000); // Reset every minute
    }

    if (copyAttempts > 5) {
      lockSession(); // Require CAPTCHA again
      return;
    }

    const selection = window.getSelection();
    let text = selection.toString();
    
    // Limit to roughly 1 paragraph (e.g. 500 characters)
    if (text.length > 500) {
      text = text.substring(0, 500) + '... [Content truncated]';
    }
    
    text += '\n\nSource: Johar Gandhi by Amir Hashmi\nCopyright © L-108073/2021. All rights reserved.';
    
    if (e.clipboardData) {
      e.clipboardData.setData('text/plain', text);
    } else if (window.clipboardData) {
      window.clipboardData.setData('Text', text);
    }
  });

  // 3. Block keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Prevent Ctrl+A, Ctrl+C, Ctrl+U, Ctrl+Shift+I, F12
    if (
      (e.ctrlKey && (e.key === 'a' || e.key === 'A' || e.key === 'c' || e.key === 'C' || e.key === 'u' || e.key === 'U')) ||
      (e.ctrlKey && e.shiftKey && (e.key === 'i' || e.key === 'I')) ||
      e.key === 'F12'
    ) {
      e.preventDefault();
    }
  });

  // 4. DevTools detection (basic)
  const devtools = function() {};
  devtools.toString = function() {
    console.log("Welcome, Sayed Amir Mustafa Hashmi (Copyright Owner). Developer tools access granted.");
    return '';
  }
  console.log('%c', devtools);
  
});
