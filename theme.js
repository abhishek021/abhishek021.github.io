/* ============================================
   Abhishek Mishra — shared interactions
   Pages: index.html, mycv.html, projects.html
   ============================================ */
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- mobile nav ---------- */
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

  /* ---------- nav scrolled state + progress bar + back-to-top ---------- */
  const nav = document.querySelector('nav');
  const progress = document.querySelector('.progress');
  const toTop = document.querySelector('.to-top');
  const onScroll = () => {
    const y = scrollY;
    if (nav) nav.classList.toggle('scrolled', y > 24);
    if (progress) {
      const max = document.documentElement.scrollHeight - innerHeight;
      progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    }
    if (toTop) toTop.classList.toggle('show', y > 600);
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- scrollspy (hash links only) ---------- */
  const spyLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')]
    .filter(a => a.getAttribute('href').length > 1);
  if (spyLinks.length) {
    const sections = spyLinks
      .map(a => document.querySelector(a.getAttribute('href')))
      .filter(Boolean);
    const spy = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
        const link = spyLinks.find(a => a.getAttribute('href') === '#' + e.target.id);
        if (link) link.classList.add('active');
      });
    }, { rootMargin: '-35% 0px -55% 0px' });
    sections.forEach(s => spy.observe(s));
  }

  /* ---------- staggered scroll reveal ---------- */
  const reveals = document.querySelectorAll('.reveal');
  const ro = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const siblings = [...el.parentElement.children].filter(c => c.classList.contains('reveal'));
      const idx = siblings.indexOf(el);
      el.style.transitionDelay = reduced ? '0ms' : Math.min(idx * 75, 450) + 'ms';
      el.classList.add('in');
      ro.unobserve(el);
    });
  }, { threshold: 0.12 });
  reveals.forEach(el => ro.observe(el));

  /* ---------- counters ---------- */
  const counters = document.querySelectorAll('.num[data-count]');
  if (counters.length) {
    const co = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = +el.dataset.count;
        const suffix = el.dataset.suffix || '';
        if (reduced) { el.textContent = target + suffix; co.unobserve(el); return; }
        const dur = 1400, start = performance.now();
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

  /* ---------- cursor aurora glow ---------- */
  const glow = document.querySelector('.cursor-glow');
  if (glow && !reduced && matchMedia('(hover: hover)').matches) {
    let gx = innerWidth / 2, gy = innerHeight / 3, tx = gx, ty = gy, raf = null;
    const lerp = () => {
      gx += (tx - gx) * 0.08;
      gy += (ty - gy) * 0.08;
      glow.style.left = gx + 'px';
      glow.style.top = gy + 'px';
      raf = (Math.abs(tx - gx) > 0.5 || Math.abs(ty - gy) > 0.5) ? requestAnimationFrame(lerp) : null;
    };
    addEventListener('pointermove', e => {
      document.body.classList.add('has-pointer');
      tx = e.clientX; ty = e.clientY;
      if (!raf) raf = requestAnimationFrame(lerp);
    }, { passive: true });
  }

  /* ---------- card spotlight ---------- */
  if (!reduced && matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.card').forEach(card => {
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      }, { passive: true });
    });
  }

  /* ---------- typing rotator (hero) ---------- */
  const typed = document.querySelector('.typed');
  if (typed) {
    let phrases = [];
    try { phrases = JSON.parse(typed.dataset.phrases || '[]'); } catch (e) {}
    if (!phrases.length) phrases = [typed.textContent];
    if (reduced || phrases.length < 2) {
      typed.textContent = phrases[0];
    } else {
      let pi = 0, ci = phrases[0].length, deleting = false;
      typed.textContent = phrases[0];
      const TYPE = 55, DELETE = 30, HOLD = 2200, GAP = 350;
      const step = () => {
        const word = phrases[pi];
        if (!deleting) {
          ci++;
          typed.textContent = word.slice(0, ci);
          if (ci >= word.length) { deleting = true; setTimeout(step, HOLD); return; }
          setTimeout(step, TYPE);
        } else {
          ci--;
          typed.textContent = word.slice(0, ci);
          if (ci <= 0) {
            deleting = false;
            pi = (pi + 1) % phrases.length;
            setTimeout(step, GAP); return;
          }
          setTimeout(step, DELETE);
        }
      };
      setTimeout(step, HOLD);
    }
  }

  /* ---------- journey rail draws on scroll ---------- */
  const journeys = document.querySelectorAll('.journey');
  if (journeys.length && !reduced) {
    const drawRails = () => {
      journeys.forEach(j => {
        const rail = j.querySelector('.rail');
        if (!rail) return;
        const r = j.getBoundingClientRect();
        const progress = (innerHeight * 0.8 - r.top) / r.height;
        rail.style.setProperty('--draw', Math.min(Math.max(progress, 0), 1));
      });
    };
    addEventListener('scroll', drawRails, { passive: true });
    drawRails();
  }
})();

/* ---------- contact form → mailto (static hosting) ---------- */
(() => {
  const form = document.getElementById('contact-form');
  if (!form || !form.dataset.mailto) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = form.querySelector('[name="name"]').value.trim();
    const email = form.querySelector('[name="email"]').value.trim();
    const message = form.querySelector('[name="message"]').value.trim();
    const subject = encodeURIComponent(`Website inquiry from ${name}`);
    const body = encodeURIComponent(`${message}\n\n— ${name}\n${email}`);
    const note = document.getElementById('form-note');
    if (note) note.classList.add('show');
    location.href = `mailto:${form.dataset.mailto}?subject=${subject}&body=${body}`;
  });
})();
