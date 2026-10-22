
(function () {
  'use strict';

  
  const faDigits = (s) => String(s).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[d]);

  
  const revealEls = document.querySelectorAll('.lx-reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.16 });
    revealEls.forEach((el, i) => {
      el.style.transitionDelay = (i % 4) * 90 + 'ms'; 
      io.observe(el);
    });
  } else {
    revealEls.forEach((el) => el.classList.add('in'));
  }

  
  const counters = document.querySelectorAll('[data-count]');
  const runCounter = (el) => {
    const target = parseInt(el.dataset.count, 10) || 0;
    const suffix = el.dataset.suffix || '';
    const t0 = performance.now(), dur = 1500;
    const step = (now) => {
      const p = Math.min((now - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = faDigits(Math.round(target * eased).toLocaleString('en-US')) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if ('IntersectionObserver' in window && counters.length) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { runCounter(en.target); cio.unobserve(en.target); }
      });
    }, { threshold: 0.5 });
    counters.forEach((el) => cio.observe(el));
  } else {
    counters.forEach(runCounter);
  }

  
  const form = document.getElementById('clubForm');
  const toast = document.getElementById('lxToast');
  let toastTimer = null;
  const showToast = () => {
    if (!toast) return;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
  };
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input');
      const raw = String(input.value).replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/\D/g, '');
      const isPhone = /^09\d{9}$/.test(raw);
      const isEmail = /.+@.+\..+/.test(input.value.trim());
      if (isPhone || isEmail) {
        input.style.borderColor = 'rgba(217,179,108,.9)';
        showToast();
        input.value = '';
        setTimeout(() => (input.style.borderColor = ''), 1600);
      } else {
        input.style.borderColor = '#E8756A';
        input.focus();
      }
    });
  }
})();
