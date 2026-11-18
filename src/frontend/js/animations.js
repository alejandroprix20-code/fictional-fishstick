/* =============================================
   ANIMATIONS.JS — Luxury animation engine
   IntersectionObserver + rAF parallax + counters
   ============================================= */

// ---- Scroll Progress Bar ----
(function initScrollProgress() {
  const bar = document.getElementById('scrollProgress');
  if (!bar) return;
  let ticking = false;
  function update() {
    const scrolled = window.scrollY;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    const pct = total > 0 ? scrolled / total : 0;
    bar.style.transform = `scaleX(${pct})`;
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
})();

// ---- Navbar glass morphism on scroll ----
(function initNavbarScroll() {
  const nav = document.querySelector('.navbar-nazareth');
  if (!nav) return;
  let ticking = false;
  function update() {
    nav.classList.toggle('scrolled', window.scrollY > 60);
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
})();

// ---- Parallax layers ----
(function initParallax() {
  const layers = document.querySelectorAll('[data-parallax]');
  if (!layers.length) return;
  let ticking = false;
  function update() {
    const y = window.scrollY;
    layers.forEach(el => {
      const speed = parseFloat(el.dataset.parallax) || 0.3;
      el.style.transform = `translate3d(0, ${y * speed}px, 0)`;
    });
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
  update();
})();

// ---- IntersectionObserver scroll reveals ----
(function initReveal() {
  const targets = document.querySelectorAll(
    '.reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-blur, .line-reveal, .star-rating'
  );
  if (!targets.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  targets.forEach(el => observer.observe(el));
})();

// ---- Stagger children inside containers ----
(function initStaggerContainers() {
  document.querySelectorAll('[data-stagger]').forEach(container => {
    const children = container.querySelectorAll(':scope > *');
    children.forEach((child, i) => {
      child.classList.add('reveal');
      child.style.transitionDelay = `${i * 0.1}s`;
    });
  });

  // Re-observe new elements
  const targets = document.querySelectorAll('[data-stagger] .reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  targets.forEach(el => observer.observe(el));
})();

// ---- Animated number counter ----
function animateCounter(el) {
  const target = parseInt(el.dataset.count, 10);
  const duration = 1800;
  const startTime = performance.now();
  const suffix = el.dataset.suffix || '';
  const prefix = el.dataset.prefix || '';

  function step(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(eased * target);
    el.textContent = prefix + current.toLocaleString('es-PE') + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

(function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
})();

// ---- 3D tilt on product cards (desktop only) ----
(function initTilt() {
  if (window.matchMedia('(hover: none)').matches) return; // skip touch devices

  function applyTilt(el) {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      el.style.transform = `perspective(900px) rotateY(${x * 7}deg) rotateX(${-y * 7}deg) translateZ(8px) scale(1.01)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
    });
  }

  // Apply to cards as they appear
  const observer = new MutationObserver(() => {
    document.querySelectorAll('.product-card:not([data-tilt])').forEach(card => {
      card.dataset.tilt = '1';
      applyTilt(card);
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });

  // Also apply to existing cards
  document.querySelectorAll('.product-card').forEach(card => {
    card.dataset.tilt = '1';
    applyTilt(card);
  });
})();

// ---- Magnetic buttons ----
(function initMagnetic() {
  if (window.matchMedia('(hover: none)').matches) return;

  document.querySelectorAll('.btn-magnetic').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width  / 2) * 0.25;
      const y = (e.clientY - rect.top  - rect.height / 2) * 0.25;
      btn.style.transform = `translate(${x}px, ${y}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
})();

// ---- Page entrance animation ----
(function initPageEntrance() {
  const overlay = document.getElementById('pageTransitionOverlay');
  if (!overlay) return;
  requestAnimationFrame(() => {
    overlay.style.transform = 'translateY(-100%)';
    setTimeout(() => overlay.remove(), 700);
  });
})();

// ---- Smooth section scroll for anchor links ----
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
