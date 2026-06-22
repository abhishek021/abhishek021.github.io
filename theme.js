/* ============================================
   Abhishek Mishra — interactions (v7 · dual theme)
   ============================================ */

/* theme: apply early to avoid flash (also inlined in <head>) */
(() => {
  try {
    const saved = localStorage.getItem('theme');
    const theme = saved || 'dark';
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) { document.documentElement.setAttribute('data-theme', 'dark'); }
})();

document.addEventListener('DOMContentLoaded', () => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hover = matchMedia('(hover: hover)').matches;
  const root = document.documentElement;

  /* theme toggle */
  const setIcon = btn => { btn.textContent = root.getAttribute('data-theme') === 'dark' ? '☀' : '☾'; };
  document.querySelectorAll('.theme-toggle').forEach(btn => {
    setIcon(btn);
    btn.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
      document.querySelectorAll('.theme-toggle').forEach(setIcon);
    });
  });

  /* mobile nav */
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open);
    });
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      links.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false');
    }));
  }

  /* nav border + progress + back-to-top */
  const nav = document.querySelector('header.nav');
  const progress = document.querySelector('.progress');
  const toTop = document.querySelector('.to-top');
  const onScroll = () => {
    const y = scrollY;
    if (nav) nav.classList.toggle('scrolled', y > 8);
    if (progress) { const max = document.documentElement.scrollHeight - innerHeight; progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`; }
    if (toTop) toTop.classList.toggle('show', y > 500);
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* scrollspy */
  const spyLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')].filter(a => a.getAttribute('href').length > 1);
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

  /* reveal */
  const reveals = document.querySelectorAll('.reveal');
  const ro = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const sibs = [...el.parentElement.children].filter(c => c.classList.contains('reveal'));
      el.style.transitionDelay = reduced ? '0ms' : Math.min(sibs.indexOf(el) * 70, 350) + 'ms';
      el.classList.add('in'); ro.unobserve(el);
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
        const target = +el.dataset.count, suffix = el.dataset.suffix || '', prefix = el.dataset.prefix || '';
        if (reduced) { el.textContent = prefix + target + suffix; co.unobserve(el); return; }
        const dur = 1200, start = performance.now();
        const tick = now => {
          const p = Math.min((now - start) / dur, 1);
          el.textContent = prefix + Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick); co.unobserve(el);
      });
    }, { threshold: 0.6 });
    counters.forEach(el => co.observe(el));
  }

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
      document.body.classList.add('has-pointer'); tx = e.clientX; ty = e.clientY;
      if (!raf) raf = requestAnimationFrame(lerp);
    }, { passive: true });
  }

  /* card spotlight */
  if (!reduced && hover) {
    document.querySelectorAll('.card,.demo').forEach(card => {
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      }, { passive: true });
    });
  }

  /* code panel tabs */
  document.querySelectorAll('.code-tabs').forEach(tabs => {
    const panel = tabs.closest('.code-panel');
    tabs.querySelectorAll('.code-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.querySelectorAll('.code-tab').forEach(t => t.classList.remove('on'));
        panel.querySelectorAll('.code-pane').forEach(p => p.classList.remove('on'));
        tab.classList.add('on');
        const pane = panel.querySelector('#' + tab.dataset.pane);
        if (pane) pane.classList.add('on');
      });
    });
  });

  /* demo cards: restart animations on a loop so they feel "live" */
  if (!reduced) {
    const demos = document.querySelectorAll('.demo .demo-body');
    demos.forEach((body, i) => {
      const html = body.innerHTML;
      const restart = () => { body.innerHTML = ''; void body.offsetWidth; body.innerHTML = html; };
      setInterval(restart, 7000 + i * 400);
    });
  }

  /* click-to-copy */
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const text = btn.dataset.copy || '';
      const done = () => {
        const orig = btn.textContent; btn.textContent = 'Copied ✓'; btn.classList.add('copied');
        setTimeout(() => { btn.textContent = orig; btn.classList.remove('copied'); }, 1600);
      };
      try {
        if (navigator.clipboard && isSecureContext) await navigator.clipboard.writeText(text);
        else { const ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); }
        done();
      } catch (e) {}
    });
  });

  /* contact form → mailto */
  const form = document.getElementById('contact-form');
  if (form && form.dataset.mailto) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const g = n => (form.querySelector(`[name="${n}"]`) || {}).value || '';
      const subject = encodeURIComponent(`Website inquiry from ${g('name').trim()}`);
      const body = encodeURIComponent(`${g('message').trim()}\n\n— ${g('name').trim()}\n${g('email').trim()}`);
      const note = document.getElementById('form-note'); if (note) note.classList.add('show');
      location.href = `mailto:${form.dataset.mailto}?subject=${subject}&body=${body}`;
    });
  }
});
