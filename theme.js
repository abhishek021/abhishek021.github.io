/* ============================================
   Abhishek Mishra — interactions (clean v5)
   ============================================ */
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* mobile nav */
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open);
    });
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }));
  }

  /* nav border on scroll */
  const nav = document.querySelector('header.nav');
  const onScroll = () => { if (nav) nav.classList.toggle('scrolled', scrollY > 8); };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* scrollspy for in-page hash links */
  const spyLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')]
    .filter(a => a.getAttribute('href').length > 1);
  if (spyLinks.length) {
    const sections = spyLinks.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
    const spy = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        spyLinks.forEach(a => a.classList.remove('active'));
        const link = spyLinks.find(a => a.getAttribute('href') === '#' + e.target.id);
        if (link) link.classList.add('active');
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach(s => spy.observe(s));
  }

  /* staggered scroll reveal */
  const reveals = document.querySelectorAll('.reveal');
  const ro = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const sibs = [...el.parentElement.children].filter(c => c.classList.contains('reveal'));
      el.style.transitionDelay = reduced ? '0ms' : Math.min(sibs.indexOf(el) * 70, 350) + 'ms';
      el.classList.add('in');
      ro.unobserve(el);
    });
  }, { threshold: 0.12 });
  reveals.forEach(el => ro.observe(el));

  /* counters */
  const counters = document.querySelectorAll('.n[data-count]');
  if (counters.length) {
    const co = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = +el.dataset.count;
        const suffix = el.dataset.suffix || '';
        if (reduced) { el.textContent = target + suffix; co.unobserve(el); return; }
        const dur = 1100, start = performance.now();
        const tick = now => {
          const p = Math.min((now - start) / dur, 1);
          el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        co.unobserve(el);
      });
    }, { threshold: 0.6 });
    counters.forEach(el => co.observe(el));
  }

  /* contact form → mailto */
  const form = document.getElementById('contact-form');
  if (form && form.dataset.mailto) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const g = n => (form.querySelector(`[name="${n}"]`) || {}).value || '';
      const name = g('name').trim(), email = g('email').trim(), message = g('message').trim();
      const subject = encodeURIComponent(`Website inquiry from ${name}`);
      const body = encodeURIComponent(`${message}\n\n— ${name}\n${email}`);
      const note = document.getElementById('form-note');
      if (note) note.classList.add('show');
      location.href = `mailto:${form.dataset.mailto}?subject=${subject}&body=${body}`;
    });
  }
})();


/* ============================================
   v6 — interactivity (light-tuned)
   ============================================ */
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hover = matchMedia('(hover: hover)').matches;

  /* progress bar + back-to-top */
  const progress = document.querySelector('.progress');
  const toTop = document.querySelector('.to-top');
  const onScroll2 = () => {
    const y = scrollY;
    if (progress) {
      const max = document.documentElement.scrollHeight - innerHeight;
      progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    }
    if (toTop) toTop.classList.toggle('show', y > 500);
  };
  addEventListener('scroll', onScroll2, { passive: true });
  onScroll2();

  /* cursor spotlight */
  const glow = document.querySelector('.cursor-glow');
  if (glow && !reduced && hover) {
    let gx = innerWidth / 2, gy = innerHeight / 3, tx = gx, ty = gy, raf = null;
    const lerp = () => {
      gx += (tx - gx) * 0.1; gy += (ty - gy) * 0.1;
      glow.style.left = gx + 'px'; glow.style.top = gy + 'px';
      raf = (Math.abs(tx - gx) > 0.5 || Math.abs(ty - gy) > 0.5) ? requestAnimationFrame(lerp) : null;
    };
    addEventListener('pointermove', e => {
      document.body.classList.add('has-pointer');
      tx = e.clientX; ty = e.clientY;
      if (!raf) raf = requestAnimationFrame(lerp);
    }, { passive: true });
  }

  /* card spotlight tracking */
  if (!reduced && hover) {
    document.querySelectorAll('.card').forEach(card => {
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      }, { passive: true });
    });
  }

  /* hero typing rotator */
  const typed = document.querySelector('.typed');
  if (typed) {
    let phrases = [];
    try { phrases = JSON.parse(typed.dataset.phrases || '[]'); } catch (e) {}
    if (!phrases.length) phrases = [typed.textContent];
    if (reduced || phrases.length < 2) { typed.textContent = phrases[0]; }
    else {
      let pi = 0, ci = phrases[0].length, del = false;
      typed.textContent = phrases[0];
      const T = 52, D = 28, HOLD = 2100, GAP = 320;
      const step = () => {
        const w = phrases[pi];
        if (!del) { ci++; typed.textContent = w.slice(0, ci);
          if (ci >= w.length) { del = true; setTimeout(step, HOLD); return; }
          setTimeout(step, T);
        } else { ci--; typed.textContent = w.slice(0, ci);
          if (ci <= 0) { del = false; pi = (pi + 1) % phrases.length; setTimeout(step, GAP); return; }
          setTimeout(step, D);
        }
      };
      setTimeout(step, HOLD);
    }
  }
})();
