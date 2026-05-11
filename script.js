/* ===========================
   Waffen Frölicher — 3D Interactions
   - Mouse-Tracking 3D-Tilt für Karten & Hero-Bilder
   - Scroll-Reveal mit IntersectionObserver
   - Sanfter Parallax für Hero-Hintergrundtext
   =========================== */

(function () {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 3D MOUSE TILT ---------- */
  const tiltTargets = document.querySelectorAll(
    '.hero-main-image, .hero-thumb, .product-card, .service-card, .bahn-card, .intro-split img, .event-item, .ig-grid a'
  );

  tiltTargets.forEach((el) => {
    el.classList.add('tilt-3d');

    // Shine-Overlay nur für Bild-Container
    if (
      el.matches('.hero-main-image, .hero-thumb, .product-card, .ig-grid a')
    ) {
      const shine = document.createElement('span');
      shine.className = 'tilt-3d-shine';
      el.appendChild(shine);
    }

    if (reduced) return;

    let maxTilt = 14;
    if (el.matches('.hero-main-image, .hero-thumb')) maxTilt = 4;
    else if (el.matches('.intro-split img')) maxTilt = 8;
    let rafId = null;
    let targetRX = 0,
      targetRY = 0,
      targetTZ = 0,
      curRX = 0,
      curRY = 0,
      curTZ = 0;

    const animate = () => {
      curRX += (targetRX - curRX) * 0.18;
      curRY += (targetRY - curRY) * 0.18;
      curTZ += (targetTZ - curTZ) * 0.18;
      el.style.setProperty('--rx', curRX.toFixed(2) + 'deg');
      el.style.setProperty('--ry', curRY.toFixed(2) + 'deg');
      el.style.setProperty('--tz', curTZ.toFixed(2) + 'px');
      if (
        Math.abs(targetRX - curRX) > 0.05 ||
        Math.abs(targetRY - curRY) > 0.05 ||
        Math.abs(targetTZ - curTZ) > 0.5
      ) {
        rafId = requestAnimationFrame(animate);
      } else {
        rafId = null;
      }
    };

    el.addEventListener('mouseenter', () => {
      el.classList.add('tilt-active');
      targetTZ = el.matches('.hero-main-image, .hero-thumb') ? 6 : 18;
      if (!rafId) rafId = requestAnimationFrame(animate);
    });

    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      targetRY = (x - 0.5) * (maxTilt * 2);
      targetRX = -(y - 0.5) * (maxTilt * 2);
      el.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
      el.style.setProperty('--my', (y * 100).toFixed(1) + '%');
      if (!rafId) rafId = requestAnimationFrame(animate);
    });

    el.addEventListener('mouseleave', () => {
      el.classList.remove('tilt-active');
      targetRX = 0;
      targetRY = 0;
      targetTZ = 0;
      if (!rafId) rafId = requestAnimationFrame(animate);
    });
  });

  /* ---------- SCROLL REVEAL ---------- */
  const revealSelectors = [
    '.section-header',
    '.intro-split > *',
    '.service-card',
    '.product-card',
    '.bahn-card',
    '.event-item',
    '.ig-grid a',
    '.feature-cta .content > *',
    '.stat',
    '.stats-row',
    '.hero-stats-mini > div',
    '.contact-info > *',
    '.contact-form'
  ];

  const revealEls = document.querySelectorAll(revealSelectors.join(','));
  revealEls.forEach((el, i) => {
    el.classList.add('reveal-3d');
    const delay = i % 6;
    if (delay > 0) el.classList.add('delay-' + delay);
  });

  if (reduced) {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  } else if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- PARALLAX HERO ---------- */
  if (!reduced) {
    const hero = document.querySelector('.hero-modern');
    if (hero) {
      let scrollRaf = null;
      const onScroll = () => {
        const y = window.scrollY;
        if (y > window.innerHeight) return;
        hero.style.setProperty('--parallax-y', y * 0.3 + 'px');
        const visual = hero.querySelector('.hero-modern-visual');
        if (visual) {
          visual.style.transform =
            'translate3d(0,' + (y * -0.06).toFixed(1) + 'px, 0)';
        }
        scrollRaf = null;
      };
      window.addEventListener(
        'scroll',
        () => {
          if (!scrollRaf) scrollRaf = requestAnimationFrame(onScroll);
        },
        { passive: true }
      );
    }
  }

  /* ---------- HERO BACKGROUND-TILT (Mouse auf Hero) ---------- */
  if (!reduced) {
    const heroVisual = document.querySelector('.hero-modern-visual');
    const heroGrid = document.querySelector('.hero-modern-grid');
    if (heroVisual && heroGrid) {
      heroGrid.addEventListener('mousemove', (e) => {
        const rect = heroGrid.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        heroVisual.style.transform =
          'perspective(1400px) rotateY(' +
          (x * 1.5).toFixed(2) +
          'deg) rotateX(' +
          (-y * 1).toFixed(2) +
          'deg)';
      });
      heroGrid.addEventListener('mouseleave', () => {
        heroVisual.style.transform = '';
      });
    }
  }
})();
