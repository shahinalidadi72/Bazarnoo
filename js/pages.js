
'use strict';


const faToEn = (s) => String(s)
  .replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
  .replace(/[٬,\s]/g, '');

const parsePrice = (txt) => {
  const n = parseInt(faToEn(txt).replace(/[^\d]/g, ''), 10);
  return isNaN(n) ? 0 : n;
};

const money = (n) => n.toLocaleString('fa-IR');


(function initCartDrawer() {
  const cartBtn = document.getElementById('cartBtn');
  if (!cartBtn) return;

  
  document.body.insertAdjacentHTML('beforeend', `
    <div class="cart-drawer" id="cartDrawer" aria-hidden="true">
      <div class="cd-backdrop" data-cart-close></div>
      <aside class="cd-panel" role="dialog" aria-modal="true" aria-label="سبد خرید">
        <header class="cd-head">
          <b><i class="bi bi-basket2"></i> سبد خرید شما</b>
          <button class="cd-close" type="button" data-cart-close aria-label="بستن سبد">
            <i class="bi bi-x-lg"></i>
          </button>
        </header>
        <div class="cd-items" id="cdItems"></div>
        <div class="cd-empty" id="cdEmpty">
          <i class="bi bi-basket"></i>
          <b>سبد خریدت خالیه!</b>
          <p>یه سر به حجره‌های بازار بزن و چیزهای خوب پیدا کن.</p>
          <a href="index.html" class="btn btn-zafran">رفتن به بازار</a>
        </div>
        <footer class="cd-foot">
          <div class="cd-total"><span>مبلغ قابل پرداخت</span><b id="cdTotal">۰ تومان</b></div>
          <a href="profile-orders.html" class="btn btn-zafran"><i class="bi bi-bag-check"></i> تسویه حساب</a>
          <a href="index.html" class="cd-continue">ادامه خرید</a>
        </footer>
      </aside>
    </div>`);

  const drawer = document.getElementById('cartDrawer');
  const itemsEl = document.getElementById('cdItems');
  const emptyEl = document.getElementById('cdEmpty');
  const totalEl = document.getElementById('cdTotal');
  const badge = document.getElementById('cartBadge');
  const items = new Map();

  const isOpen = () => drawer.classList.contains('open');

  const open = () => {
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('nn-lock');
  };
  const close = () => {
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('nn-lock');
  };

  const render = () => {
    let html = '';
    let total = 0;
    let count = 0;

    items.forEach((it) => {
      total += it.price * it.qty;
      count += it.qty;
      html += `
        <div class="cd-item">
          <span class="cd-ic ${it.bg}">${it.img ? `<img src="${it.img}" alt="">` : it.emoji}</span>
          <div class="cd-inf">
            <b>${it.name}</b>
            <span>${money(it.price)} تومان</span>
            <div class="cd-qty">
              <button type="button" data-act="plus" data-id="${it.id}" aria-label="افزایش"><i class="bi bi-plus"></i></button>
              <span>${money(it.qty)}</span>
              <button type="button" data-act="minus" data-id="${it.id}" aria-label="کاهش"><i class="bi bi-dash"></i></button>
            </div>
          </div>
          <b class="cd-sum">${money(it.price * it.qty)}</b>
          <button type="button" class="cd-del" data-act="del" data-id="${it.id}" aria-label="حذف"><i class="bi bi-trash3"></i></button>
        </div>`;
    });

    itemsEl.innerHTML = html;
    emptyEl.style.display = items.size ? 'none' : 'block';
    totalEl.textContent = money(total) + ' تومان';
    if (badge) badge.textContent = money(count);
  };

  const add = (data) => {
    const id = data.name;
    if (items.has(id)) items.get(id).qty += 1;
    else items.set(id, { ...data, qty: 1 });
    render();
    open();
  };

 
  document.querySelectorAll('.add-btn, .add-big').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      let name = btn.dataset.name;
      let price = btn.dataset.price ? parseInt(btn.dataset.price, 10) : 0;
      let emoji = btn.dataset.emoji || '🛍️';
      let bg = btn.dataset.bg || 't1';
      let img = btn.dataset.img || null;

      const card = btn.closest('.p-card');
      if (!name && card) {
        name = card.querySelector('.p-body h3')?.textContent.trim() || 'محصول بازارِ نو';
        if (!price) price = parsePrice(card.querySelector('.price b')?.textContent || '');
        const thumb = card.querySelector('.thumb');
        if (thumb) {
          const timg = thumb.querySelector('img');
          if (timg) { img = timg.getAttribute('src'); }
          else {
            emoji = thumb.querySelector('span')?.textContent.trim() || emoji;
          }
          const bgClass = [...thumb.classList].find((c) => /^t\d$/.test(c));
          if (bgClass) bg = bgClass;
        }
      }
     
      const stage = document.querySelector('.pd-stage');
      if (stage) {
        const simg = stage.querySelector('img');
        if (simg) img = simg.getAttribute('src');
        else emoji = document.querySelector('#pdActive')?.textContent.trim() || emoji;
        const bgClass = [...stage.classList].find((c) => /^t\d$/.test(c));
        if (bgClass) bg = bgClass;
      }
      if (!name) {
        name = document.querySelector('.pd-info h1')?.textContent.trim() || 'محصول بازارِ نو';
        if (!price) price = parsePrice(document.querySelector('.pd-now')?.textContent || '');
      }

      add({ name, price, emoji, bg, img });
    });
  });

  cartBtn.addEventListener('click', open);

  drawer.addEventListener('click', (e) => {
    if (e.target.closest('[data-cart-close]')) { close(); return; }
    const act = e.target.closest('[data-act]');
    if (!act) return;
    const it = items.get(act.dataset.id);
    if (!it) return;
    if (act.dataset.act === 'plus') it.qty += 1;
    if (act.dataset.act === 'minus') { it.qty -= 1; if (it.qty < 1) items.delete(it.id); }
    if (act.dataset.act === 'del') items.delete(it.id);
    render();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen()) close();
  });

  render();
})();


(function initGallery() {
  const carousel = document.getElementById('pdCarousel');
  if (!carousel) return;

  const thumbs = document.querySelectorAll('.pd-thumb');
  thumbs.forEach((t) => {
    t.addEventListener('click', () => {
      const idx = parseInt(t.dataset.slide, 10);
      const inst = bootstrap.Carousel.getOrCreateInstance(carousel);
      inst.to(idx);
    });
  });

  carousel.addEventListener('slid.bs.carousel', (e) => {
    thumbs.forEach((t) => t.classList.toggle('active', parseInt(t.dataset.slide, 10) === e.to));
  });
})();


(function initOptions() {
  const nameEl = document.getElementById('pdColorName');
  document.querySelectorAll('.pd-colors button').forEach((b) => {
    b.addEventListener('click', () => {
      b.parentElement.querySelectorAll('button').forEach((x) => x.classList.remove('active'));
      b.classList.add('active');
      if (nameEl && b.dataset.name) nameEl.textContent = b.dataset.name;
    });
  });
  document.querySelectorAll('.pd-caps .pd-cap').forEach((b) => {
    b.addEventListener('click', () => {
      b.parentElement.querySelectorAll('.pd-cap').forEach((x) => x.classList.remove('active'));
      b.classList.add('active');
    });
  });
})();


(function initRating() {
  const box = document.getElementById('rateInput');
  if (!box) return;
  const btns = box.querySelectorAll('button');
  const label = document.getElementById('rateLabel');
  const labels = ['خیلی بد', 'بد', 'متوسط', 'خوب', 'عالی بود!'];
  let picked = 0;

  const paint = (v) => {
    btns.forEach((b, i) => {
      const star = b.querySelector('i');
      const on = i < v;
      star.classList.toggle('bi-star-fill', on);
      star.classList.toggle('bi-star', !on);
      b.classList.toggle('on', on);
    });
  };

  btns.forEach((b, i) => {
    b.addEventListener('mouseenter', () => paint(i + 1));
    b.addEventListener('mouseleave', () => paint(picked));
    b.addEventListener('click', () => {
      picked = i + 1;
      paint(picked);
      if (label) label.textContent = `امتیاز شما: ${money(picked)} — ${labels[i]}`;
    });
  });
})();


(function initOtp() {
  const inputs = document.querySelectorAll('.otp-in');
  if (!inputs.length) return;

  const toEn = (s) => String(s).replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d));

  inputs.forEach((inp, i) => {
    inp.addEventListener('input', () => {
      inp.value = toEn(inp.value).replace(/\D/g, '').slice(-1);
      inp.classList.toggle('filled', !!inp.value);
      if (inp.value && inputs[i + 1]) inputs[i + 1].focus();
    });
    inp.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !inp.value && inputs[i - 1]) inputs[i - 1].focus();
    });
    inp.addEventListener('paste', (e) => {
      e.preventDefault();
      const digits = toEn(e.clipboardData.getData('text')).replace(/\D/g, '').slice(0, inputs.length);
      digits.split('').forEach((d, j) => {
        if (inputs[j]) { inputs[j].value = d; inputs[j].classList.add('filled'); }
      });
      if (inputs[digits.length]) inputs[digits.length].focus();
    });
  });

  const timerEl = document.getElementById('otpTimer');
  const resend = document.getElementById('otpResend');
  if (!timerEl || !resend) return;

  let left = 110;
  resend.classList.remove('live');
  const tick = setInterval(() => {
    left -= 1;
    timerEl.textContent = `${money(Math.floor(left / 60))}:${money(left % 60).padStart(2, '۰')}`;
    if (left <= 0) {
      clearInterval(tick);
      timerEl.textContent = '';
      resend.classList.add('live');
    }
  }, 1000);
  timerEl.textContent = `۱:۵۰`;

  resend.addEventListener('click', () => {
    if (!resend.classList.contains('live')) return;
    left = 110;
    resend.classList.remove('live');
    inputs.forEach((i) => { i.value = ''; i.classList.remove('filled'); });
    inputs[0].focus();
  });
})();


(function initCountUp() {
  const els = document.querySelectorAll('[data-count]');
  if (!els.length) return;
  const run = (el) => {
    const target = Number(el.dataset.count || 0);
    const suffix = el.dataset.suffix || '';
    const t0 = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - t0) / 1500);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = money(Math.round(target * eased)) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { run(e.target); io.unobserve(e.target); }
    });
  }, { threshold: 0.4 });
  els.forEach((el) => io.observe(el));
})();


(function initRail() {
  document.querySelectorAll('[data-rail]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const rail = document.querySelector(btn.dataset.rail);
      if (rail) rail.scrollBy({ left: Number(btn.dataset.dir || -1) * 264, behavior: 'smooth' });
    });
  });

  const fills = document.querySelectorAll('.sp-progress i, .rev-bar i b, .ad-top-product .bar i');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        const el = e.target;
        el.style.width = el.dataset.w || el.style.width;
        io.unobserve(el);
      }
    });
  }, { threshold: 0.3 });
  fills.forEach((f) => {
    if (f.dataset.w) { const w = f.dataset.w; f.style.width = '0'; requestAnimationFrame(() => { f.dataset.w = w; }); io.observe(f); }
  });
})();


(function initAdminChart() {
  const cols = document.querySelectorAll('.ad-col b[data-h]');
  if (!cols.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.style.height = e.target.dataset.h;
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });
  cols.forEach((c) => io.observe(c));
})();


(function initAdminSide() {
  const burger = document.getElementById('adBurger');
  if (!burger) return;
  const backdrop = document.getElementById('adBackdrop');
  const toggle = (open) => document.body.classList.toggle('ad-open', open);
  burger.addEventListener('click', () => toggle(true));
  if (backdrop) backdrop.addEventListener('click', () => toggle(false));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') toggle(false);
  });
})();


(function initLoginPhone() {
  const form = document.querySelector('.au-card form');
  const input = document.getElementById('phone');
  if (!form || !input) return;

 
  const digits = (s) => String(s).replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/\D/g, '');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const raw = digits(input.value);

    if (/^09\d{9}$/.test(raw)) {
      try { localStorage.setItem('bn-phone', raw); } catch (err) {}
      location.href = 'auth-verify.html';   
    } else {
      input.classList.add('au-err');
      input.focus();
      form.classList.remove('shake');
      void form.offsetWidth;               
      form.classList.add('shake');
    }
  });

  input.addEventListener('input', () => input.classList.remove('au-err'));
})();


(function initOtpPhone() {
  const el = document.getElementById('otpPhone');
  if (el) {
    let p = '';
    try { p = localStorage.getItem('bn-phone') || ''; } catch (e) {}
    if (/^09\d{9}$/.test(p)) {
      el.textContent = `${p.slice(0, 4)} ··· ${p.slice(-4)}`
        .replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[d]);
    }
  }

  const form = document.querySelector('.au-card form[action="index.html"]');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const filled = [...document.querySelectorAll('.otp-in')].every((i) => i.value !== '');
    if (filled) location.href = 'index.html';
    else {
      form.classList.remove('shake');
      void form.offsetWidth;
      form.classList.add('shake');
    }
  });
})();
