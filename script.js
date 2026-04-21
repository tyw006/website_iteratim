document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.brand-logo animateMotion').forEach(el => el.remove());
  }

  initScrolledNav(page);

  if (page === 'home') {
    initHomePage();
  } else if (page === 'privacy') {
    initPrivacyPage();
  } else if (page === 'terms-seshy') {
    initTermsPage();
  }
});

function initScrolledNav(page) {
  const nav = document.getElementById('nav');
  if (!nav) return;

  const thresholds = {
    home: 40,
    privacy: 40,
    support: 20,
    'terms-seshy': 20
  };
  const threshold = thresholds[page];
  if (typeof threshold !== 'number') return;

  const setNav = () => nav.classList.toggle('scrolled', window.scrollY > threshold);
  window.addEventListener('scroll', setNav, { passive: true });
  setNav();
}

function initHomePage() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    document.documentElement.classList.add('no-morph');
    document.body.style.setProperty('--op-0', '1');
    document.body.style.setProperty('--op-1', '1');
    document.body.style.setProperty('--op-2', '1');
    document.body.style.setProperty('--pointer-0', 'auto');
    document.body.style.setProperty('--pointer-1', 'auto');
    document.body.style.setProperty('--pointer-2', 'auto');
  } else {
    initStageMorph();
  }

  initProjectsSubCarousel();
  initReveal();
  initContactForm();
  initHomeAnchorScroll();
  initChapterDots();
}

function initStageMorph() {
  const stage = document.querySelector('.stage');
  const pin = document.querySelector('.stage-pin');
  if (!stage || !pin) return;

  const root = document.body;
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const bell = (p, center, width) => {
    const x = (p - center) / width;
    return Math.max(0, 1 - x * x);
  };

  // Bell-curve center/width per chapter. Inactive at p=0 and p=1.
  const CURVES = [
    { center: 0.10, width: 0.32 }, // About
    { center: 0.50, width: 0.28 }, // Projects
    { center: 0.90, width: 0.32 }, // Contact
  ];

  // Per-chapter glass shapes. Interpolated via smoothstep-lerp between
  // adjacent targets as scroll progress (p) moves through the stage.
  const TARGETS = [
    { w: 1200, h: 460, r: 16 }, // About — ultra-wide cinematic frame
    { w:  860, h: 720, r: 56 }, // Projects — tall pod, soft-cornered
    { w:  600, h: 720, r: 52 }, // Contact — narrow portrait
  ];
  const CHAPTER_P = [0.10, 0.50, 0.90];
  const smoothstep = (t) => t * t * (3 - 2 * t);
  const lerp = (a, b, t) => a + (b - a) * t;
  const shapeAt = (p) => {
    if (p <= CHAPTER_P[0]) return TARGETS[0];
    if (p >= CHAPTER_P[2]) return TARGETS[2];
    const i = p < CHAPTER_P[1] ? 0 : 1;
    const t = (p - CHAPTER_P[i]) / (CHAPTER_P[i + 1] - CHAPTER_P[i]);
    const e = smoothstep(t);
    const a = TARGETS[i], b = TARGETS[i + 1];
    return { w: lerp(a.w, b.w, e), h: lerp(a.h, b.h, e), r: lerp(a.r, b.r, e) };
  };

  const chapterButtons = Array.from(document.querySelectorAll('.stage-chapter'));

  let ticking = false;
  const compute = () => {
    const rect = stage.getBoundingClientRect();
    const total = Math.max(1, stage.offsetHeight - window.innerHeight);
    const p = clamp(-rect.top / total, 0, 1);

    const bgScale = 1 + p * 0.18;
    const bgY = -p * 180;
    const fog = 0.15 + p * 0.55;
    const winScale = 1 + 0.08 * Math.sin(p * Math.PI);

    // Projects band runs 0.30 → 0.70 in stage progress.
    const PROJ_START = 0.30, PROJ_END = 0.70;
    const projP = clamp((p - PROJ_START) / (PROJ_END - PROJ_START), 0, 1);
    root.style.setProperty('--proj-p', smoothstep(projP).toFixed(4));

    const s = shapeAt(p);
    const maxW = Math.min(s.w, window.innerWidth * 0.92);
    const scale = maxW / s.w;
    const winW = maxW;
    const winH = Math.min(s.h * scale, window.innerHeight * 0.82);

    root.style.setProperty('--p', p.toFixed(4));
    root.style.setProperty('--bg-scale', bgScale.toFixed(4));
    root.style.setProperty('--bg-y', `${bgY.toFixed(1)}px`);
    root.style.setProperty('--fog', fog.toFixed(3));
    root.style.setProperty('--win-radius', `${s.r.toFixed(2)}px`);
    root.style.setProperty('--win-scale', winScale.toFixed(4));
    root.style.setProperty('--win-w', `${winW.toFixed(1)}px`);
    root.style.setProperty('--win-h', `${winH.toFixed(1)}px`);

    CURVES.forEach((curve, i) => {
      const op = bell(p, curve.center, curve.width);
      root.style.setProperty(`--op-${i}`, op.toFixed(3));
      root.style.setProperty(`--pointer-${i}`, op > 0.5 ? 'auto' : 'none');
    });

    const active = p < 0.33 ? 0 : p < 0.66 ? 1 : 2;
    chapterButtons.forEach(button => {
      const idx = Number.parseInt(button.dataset.chapter, 10);
      const on = idx === active;
      button.classList.toggle('on', on);
      button.setAttribute('aria-selected', on ? 'true' : 'false');
    });

    ticking = false;
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(compute);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  compute();
}

function initChapterDots() {
  const stage = document.querySelector('.stage');
  if (!stage) return;

  const targets = [0.05, 0.50, 0.95];
  document.querySelectorAll('.stage-chapter, a[data-chapter]').forEach(element => {
    element.addEventListener('click', event => {
      const idx = Number.parseInt(element.dataset.chapter, 10);
      if (Number.isNaN(idx)) return;
      event.preventDefault();

      const total = Math.max(1, stage.offsetHeight - window.innerHeight);
      const targetY = stage.offsetTop + targets[idx] * total;
      window.scrollTo({ top: targetY, behavior: 'smooth' });
    });
  });
}

function initProjectsSubCarousel() {
  const carousel = document.querySelector('.stage-layer[data-layer="1"] .app-carousel');
  if (!carousel) return;

  let lastActive = -1;
  const sync = () => {
    const projP = parseFloat(getComputedStyle(document.body).getPropertyValue('--proj-p')) || 0;
    const active = projP >= 0.5 ? 1 : 0;
    if (active !== lastActive) {
      carousel.setAttribute('data-active', String(active));
      lastActive = active;
    }
  };
  window.addEventListener('scroll', sync, { passive: true });
  sync();
}

function initReveal() {
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    document.querySelectorAll('.reveal').forEach(element => revealObserver.observe(element));
  } else {
    document.querySelectorAll('.reveal').forEach(element => element.classList.add('in'));
  }
}

function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const endpoint = form.getAttribute('action') || 'https://formspree.io/f/xnnebzpo';
  form.addEventListener('submit', async event => {
    event.preventDefault();

    const button = form.querySelector('button[type="submit"]');
    if (!button) return;

    const original = button.innerHTML;
    button.innerHTML = '<span>Sending…</span>';
    button.disabled = true;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      });

      if (!response.ok) throw new Error('Form submission failed');

      button.innerHTML = '<span>Sent ✓</span>';
      form.reset();
    } catch (error) {
      console.error('Form submission failed:', error);
      button.innerHTML = '<span>Error — try again</span>';
    }

    window.setTimeout(() => {
      button.innerHTML = original;
      button.disabled = false;
    }, 2800);
  });
}

function initHomeAnchorScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    if (link.hasAttribute('data-chapter')) return;

    link.addEventListener('click', event => {
      const href = link.getAttribute('href');
      if (!href || href.length <= 1) return;

      const target = document.querySelector(href);
      if (!target) return;

      event.preventDefault();
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - 90,
        behavior: 'smooth'
      });
    });
  });
}

function initPrivacyPage() {
  const tabs = document.querySelectorAll('.tab');
  const panels = document.querySelectorAll('.panel');
  if (!tabs.length || !panels.length) return;

  const activateTab = (tabName, scrollToTop = true) => {
    tabs.forEach(tab => tab.classList.toggle('on', tab.dataset.tab === tabName));
    panels.forEach(panel => panel.classList.toggle('on', panel.dataset.panel === tabName));

    const panel = document.querySelector(`[data-panel="${tabName}"]`);
    if (!panel) return;

    panel.querySelectorAll('.acc-item').forEach((item, index) => {
      const body = item.querySelector('.acc-body');
      if (!body) return;

      if (index === 0) {
        item.classList.add('open');
        body.style.maxHeight = `${body.scrollHeight}px`;
      } else {
        item.classList.remove('open');
        body.style.maxHeight = '0px';
      }
    });

    history.replaceState(null, '', `#${tabName}`);
    if (scrollToTop) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  tabs.forEach(tab => {
    tab.addEventListener('click', () => activateTab(tab.dataset.tab));
  });

  document.querySelectorAll('.acc-head').forEach(head => {
    const item = head.closest('.acc-item');
    const body = item ? item.querySelector('.acc-body') : null;
    if (!item || !body) return;

    if (item.classList.contains('open')) {
      requestAnimationFrame(() => {
        body.style.maxHeight = `${body.scrollHeight}px`;
      });
      head.setAttribute('aria-expanded', 'true');
    } else {
      head.setAttribute('aria-expanded', 'false');
    }

    head.addEventListener('click', () => {
      const isOpen = item.classList.toggle('open');
      if (isOpen) {
        body.style.maxHeight = `${body.scrollHeight}px`;
        head.setAttribute('aria-expanded', 'true');
      } else {
        body.style.maxHeight = '0px';
        head.setAttribute('aria-expanded', 'false');
      }
    });
  });

  const tocLinks = document.querySelectorAll('.tnav');
  const sections = document.querySelectorAll('.acc-section');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        tocLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      });
    }, { rootMargin: '-20% 0px -60% 0px', threshold: 0 });

    sections.forEach(section => {
      if (section.id) observer.observe(section);
    });
  }

  tocLinks.forEach(link => {
    link.addEventListener('click', event => {
      const href = link.getAttribute('href');
      const target = href ? document.querySelector(href) : null;
      if (!target) return;

      event.preventDefault();
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - 90,
        behavior: 'smooth'
      });
    });
  });

  const hash = window.location.hash.slice(1);
  if (hash && document.querySelector(`.panel#${hash}`)) {
    activateTab(hash, false);
  }
}

function initTermsPage() {
  const links = document.querySelectorAll('.toc a');
  const sections = document.querySelectorAll('article section');
  if (!links.length || !sections.length || !('IntersectionObserver' in window)) return;

  const byId = {};
  links.forEach(link => {
    byId[link.getAttribute('href').slice(1)] = link;
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      links.forEach(link => link.classList.remove('active'));
      const activeLink = byId[entry.target.id];
      if (activeLink) activeLink.classList.add('active');
    });
  }, { rootMargin: '-20% 0px -70% 0px' });

  sections.forEach(section => observer.observe(section));
}
