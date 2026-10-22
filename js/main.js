
'use strict';


const faDigits = (n) => String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[d]);


(function initCountdown() {
  const elH = document.getElementById('cdH');
  const elM = document.getElementById('cdM');
  const elS = document.getElementById('cdS');
  if (!elH || !elM || !elS) return;

  
  const endTime = Date.now() + (36 * 3600 + 14 * 60 + 52) * 1000;

  const setValue = (el, value) => {
    if (el.textContent !== value) {
      el.textContent = value;
      el.classList.remove('pop');
      void el.offsetWidth; // 
      el.classList.add('pop');
    }
  };

  const tick = () => {
    const diff = Math.max(0, endTime - Date.now());
    const h = Math.floor(diff / 3.6e6);
    const m = Math.floor((diff % 3.6e6) / 6e4);
    const s = Math.floor((diff % 6e4) / 1e3);
    setValue(elH, faDigits(String(h).padStart(2, '0')));
    setValue(elM, faDigits(String(m).padStart(2, '0')));
    setValue(elS, faDigits(String(s).padStart(2, '0')));
  };

  tick();
  setInterval(tick, 1000);
})();


(function initReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  document.querySelectorAll('.reveal').forEach((el) => {
    el.querySelectorAll('.auto > *').forEach((child, index) => {
      child.style.transitionDelay = `${index * 70}ms`;
    });
    observer.observe(el);
  });
})();


(function initCart() {
  let cartCount = 0;
  const badge = document.getElementById('cartBadge');
  const toastEl = document.getElementById('cartToast');
  if (!badge || !toastEl) return;

  const toast = bootstrap.Toast.getOrCreateInstance(toastEl, { delay: 2200 });

  document.querySelectorAll('.add-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      cartCount += 1;
      badge.textContent = faDigits(cartCount);

      badge.classList.remove('pulse');
      void badge.offsetWidth;
      badge.classList.add('pulse');

      toast.show();
    });
  });
})();


(function initHeader() {
  const header = document.getElementById('bazarHeader');
  if (!header) return;

  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 10);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();


(function initNightNav() {
  const nav = document.getElementById('nightNav');
  const toggle = document.getElementById('navToggle');
  const closeBtn = document.getElementById('navClose');
  if (!nav || !toggle || !closeBtn) return;

  const isOpen = () => nav.classList.contains('open');

  const setOpen = (open) => {
    nav.classList.toggle('open', open);
    nav.setAttribute('aria-hidden', String(!open));
    toggle.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('nn-lock', open);

    
    if (open) closeBtn.focus({ preventScroll: true });
    else toggle.focus({ preventScroll: true });
  };

  toggle.addEventListener('click', () => setOpen(!isOpen()));
  closeBtn.addEventListener('click', () => setOpen(false));


  nav.querySelectorAll('a[href]').forEach((a) => {
    a.addEventListener('click', () => setOpen(false));
  });

  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen()) setOpen(false);
  });
})();
