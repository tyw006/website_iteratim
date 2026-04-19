document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;

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
    support: 20
  };
  const threshold = thresholds[page];
  if (typeof threshold !== 'number') return;

  const setNav = () => nav.classList.toggle('scrolled', window.scrollY > threshold);
  window.addEventListener('scroll', setNav, { passive: true });
  setNav();
}

function initHomePage() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const stage = document.querySelector('.hero-stage');
  const hero = document.getElementById('heroObject');
  const scenes = document.querySelectorAll('.scenes .scene');
  const railBtns = document.querySelectorAll('.scene-rail button');
  const bg = document.getElementById('stageBg');
  const coreShape = document.getElementById('coreShape');
  const coreGroup = document.getElementById('coreGroup');
  const coreTag = document.getElementById('coreTag');
  const trailMain = document.getElementById('trailMain');
  const trailGhost = document.getElementById('trailGhost');
  const attemptsG = document.getElementById('attempts');

  if (
    !stage ||
    !hero ||
    !scenes.length ||
    !coreShape ||
    !coreGroup ||
    !coreTag ||
    !trailMain ||
    !trailGhost ||
    !attemptsG ||
    !bg
  ) {
    return;
  }

  const N = 28;
  const attempts = [];
  for (let i = 0; i < N; i += 1) {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('class', i % 5 === 4 ? 'attempt violet' : 'attempt');
    attemptsG.appendChild(circle);
    attempts.push(circle);
  }

  const jitter = (index, seed) => {
    const value = Math.sin(index * 12.9898 + seed) * 43758.5453;
    return value - Math.floor(value);
  };

  const shapes = [
    'M 0 -34 C 19 -34 34 -19 34 0 C 34 19 19 34 0 34 C -19 34 -34 19 -34 0 C -34 -19 -19 -34 0 -34 Z',
    'M 0 -30 C 22 -30 30 -22 30 0 C 30 22 22 30 0 30 C -22 30 -30 22 -30 0 C -30 -22 -22 -30 0 -30 Z',
    'M 0 -34 L 34 0 L 0 34 L -34 0 Z',
    'M -26 -26 L 26 -26 L 26 26 L -26 26 Z'
  ];
  const tagsByScene = ['v1 · attempt', 'v∞ · found', 'v∞ · right', 'v∞ · shipped'];
  let currentScene = 0;

  if (prefersReducedMotion) {
    scenes.forEach((scene, index) => scene.classList.toggle('in', index === 0));
    railBtns.forEach((button, index) => button.classList.toggle('on', index === 0));
    hero.style.setProperty('--hox', '0px');
    hero.style.setProperty('--hoy', '0px');
    hero.style.setProperty('--hoscale', '1');
    hero.style.setProperty('--horot', '0deg');
  }

  let ticking = false;
  const tick = () => {
    const rect = stage.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const total = Math.max(1, stage.offsetHeight - viewportHeight);
    const progress = Math.min(1, Math.max(0, -rect.top / total));

    const rotation = progress * 540;
    const viewMid = viewportHeight / 2;
    let best = 0;
    let bestDist = Infinity;

    scenes.forEach((scene, index) => {
      const sceneRect = scene.getBoundingClientRect();
      const midpoint = sceneRect.top + sceneRect.height / 2;
      const distance = Math.abs(midpoint - viewMid);
      if (distance < bestDist) {
        best = index;
        bestDist = distance;
      }
    });

    if (best !== currentScene || !scenes[best].classList.contains('in')) {
      currentScene = best;
      scenes.forEach((scene, index) => scene.classList.toggle('in', index === best));
      railBtns.forEach((button, index) => button.classList.toggle('on', index === best));
    }

    const scene = scenes[currentScene];
    const align = scene ? scene.dataset.align : 'center';
    const targetX = align === 'left' ? 180 : align === 'right' ? -180 : 0;
    const targetY = align === 'center' ? Math.min(340, viewportHeight * 0.32) : 0;
    const targetScale = align === 'center' ? (viewportHeight < 700 ? 0.42 : 0.55) : 1;

    const prevX = parseFloat(hero.style.getPropertyValue('--hox')) || 0;
    const nextX = prevX + (targetX - prevX) * 0.12;
    const prevY = parseFloat(hero.style.getPropertyValue('--hoy')) || 0;
    const nextY = prevY + (targetY - prevY) * 0.12;
    const prevScale = parseFloat(hero.style.getPropertyValue('--hoscaleTarget')) || 1;
    const nextScale = prevScale + (targetScale - prevScale) * 0.12;
    const scale = (1 + Math.sin(progress * Math.PI) * 0.06) * nextScale;

    hero.style.setProperty('--hoscaleTarget', nextScale.toFixed(3));
    hero.style.setProperty('--hox', `${nextX.toFixed(1)}px`);
    hero.style.setProperty('--hoy', `${nextY.toFixed(1)}px`);
    hero.style.setProperty('--hoscale', scale.toFixed(3));
    hero.style.setProperty('--horot', `${rotation.toFixed(1)}deg`);

    const converge = Math.min(1, Math.max(0, progress * 1.05 + currentScene * 0.05));
    const startRadius = 200;
    const endRadius = 38;
    const pathPoints = [];

    for (let i = 0; i < N; i += 1) {
      const t = i / (N - 1);
      const baseAngle = t * Math.PI * 4.2 + (rotation * Math.PI / 180) * 0.08;
      const baseRadius = startRadius * (1 - t) + endRadius * t;
      const jitterRadius = (jitter(i, 1.1) - 0.5) * 60 * (1 - converge);
      const jitterAngle = (jitter(i, 2.3) - 0.5) * 0.9 * (1 - converge);
      const radius = baseRadius + jitterRadius;
      const angle = baseAngle + jitterAngle;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      pathPoints.push([x, y]);

      const dot = attempts[i];
      dot.setAttribute('cx', x.toFixed(1));
      dot.setAttribute('cy', y.toFixed(1));
      dot.setAttribute('r', (1.4 + t * 1.6).toFixed(2));
      dot.style.opacity = (0.25 + t * 0.75).toFixed(2);
      dot.classList.toggle('active', i >= N - 3);
    }

    const pathData = pathPoints
      .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point[0].toFixed(1)} ${point[1].toFixed(1)}`)
      .join(' ');
    trailMain.setAttribute('d', pathData);
    trailMain.style.opacity = (0.35 + converge * 0.55).toFixed(2);

    if (!trailGhost.getAttribute('data-init')) {
      const ghost = [];
      for (let i = 0; i < 60; i += 1) {
        const t = i / 59;
        const angle = t * Math.PI * 5 + 0.6;
        const radius = 210 * (1 - t * 0.5) + (jitter(i, 9) - 0.5) * 25;
        ghost.push(`${i === 0 ? 'M' : 'L'} ${(Math.cos(angle) * radius).toFixed(1)} ${(Math.sin(angle) * radius).toFixed(1)}`);
      }
      trailGhost.setAttribute('d', ghost.join(' '));
      trailGhost.setAttribute('data-init', '1');
    }

    trailGhost.style.opacity = (0.25 * (1 - converge)).toFixed(2);
    coreShape.setAttribute('d', shapes[currentScene] || shapes[0]);
    coreGroup.style.opacity = (0.4 + converge * 0.6).toFixed(2);
    coreGroup.setAttribute('transform', `rotate(${(rotation * 0.3).toFixed(1)})`);
    coreTag.textContent = tagsByScene[currentScene] || tagsByScene[0];

    const bgx = 50 + Math.sin(progress * Math.PI * 2) * 18;
    const bgy = 30 + progress * 40;
    const bga = 0.14 + Math.sin(progress * Math.PI) * 0.10;
    const bgb = 0.10 + (1 - Math.cos(progress * Math.PI)) * 0.10;
    bg.style.setProperty('--bgx', `${bgx}%`);
    bg.style.setProperty('--bgy', `${bgy}%`);
    bg.style.setProperty('--bga', bga.toFixed(3));
    bg.style.setProperty('--bgb', bgb.toFixed(3));

    ticking = false;
  };

  const requestTick = () => {
    if (!ticking) {
      requestAnimationFrame(tick);
      ticking = true;
    }
  };

  if (!prefersReducedMotion) {
    window.addEventListener('scroll', requestTick, { passive: true });
    window.addEventListener('resize', requestTick);

    const loop = () => {
      const rect = stage.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < window.innerHeight) {
        tick();
      }
      requestAnimationFrame(loop);
    };
    loop();
  }

  railBtns.forEach(button => {
    button.addEventListener('click', () => {
      const target = Number.parseInt(button.dataset.goto, 10);
      const scene = scenes[target];
      if (!scene) return;
      window.scrollTo({
        top: scene.getBoundingClientRect().top + window.scrollY,
        behavior: 'smooth'
      });
    });
  });

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

  initContactForm();
  initHomeAnchorScroll();
}

function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const endpoint = 'https://formspree.io/f/xnnebzpo';
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
    link.addEventListener('click', event => {
      const href = link.getAttribute('href');
      if (!href || href.length <= 1) return;

      const target = document.querySelector(href);
      if (!target) return;

      event.preventDefault();
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - 72,
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
