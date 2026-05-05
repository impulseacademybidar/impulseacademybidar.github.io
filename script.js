/* =========================================
   Impulse Academy — interactions
   ========================================= */

// ---- Mobile nav toggle ----
const toggle = document.getElementById('navToggle');
const drawer = document.getElementById('navDrawer');

if (toggle && drawer) {
  toggle.addEventListener('click', () => {
    const isOpen = drawer.classList.toggle('open');
    toggle.classList.toggle('open', isOpen);
    toggle.setAttribute('aria-expanded', isOpen);
    drawer.setAttribute('aria-hidden', !isOpen);
  });

  drawer.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      drawer.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      drawer.setAttribute('aria-hidden', 'true');
    });
  });
}

// ---- Footer year ----
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ---- Reveal on scroll ----
const revealEls = document.querySelectorAll(
  '.about__grid, .course-card, .batch, .director__card, .why__item, .contact__grid, .gallery__item, .results__headline, .carousel'
);

if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -50px 0px' }
  );

  revealEls.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = `opacity 0.7s ease ${(i % 6) * 0.06}s, transform 0.7s ease ${(i % 6) * 0.06}s`;
    io.observe(el);
  });
}

// ===========================================
// RESULTS CAROUSEL
// Auto-advances every 3.5s, supports manual nav
// ===========================================
(function initCarousel() {
  const carousel = document.getElementById('resultsCarousel');
  const track = document.getElementById('carouselTrack');
  const dotsContainer = document.getElementById('carouselDots');
  const prevBtn = document.getElementById('carouselPrev');
  const nextBtn = document.getElementById('carouselNext');

  if (!carousel || !track) return;

  const slides = track.querySelectorAll('.carousel__slide');
  const SLIDE_COUNT = slides.length;
  const INTERVAL_MS = 3500;
  let index = 0;
  let timer = null;

  // Build dots
  const dots = [];
  for (let i = 0; i < SLIDE_COUNT; i++) {
    const dot = document.createElement('button');
    dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
    dot.setAttribute('role', 'tab');
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goTo(i, true));
    dotsContainer.appendChild(dot);
    dots.push(dot);
  }

  function update() {
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === index));
  }

  function goTo(i, userInitiated) {
    index = (i + SLIDE_COUNT) % SLIDE_COUNT;
    update();
    if (userInitiated) restart();
  }

  function next() { goTo(index + 1); }
  function prev() { goTo(index - 1); }

  function start() {
    stop();
    timer = setInterval(next, INTERVAL_MS);
  }
  function stop() {
    if (timer) { clearInterval(timer); timer = null; }
  }
  function restart() { stop(); start(); }

  // Manual controls
  if (nextBtn) nextBtn.addEventListener('click', () => { next(); restart(); });
  if (prevBtn) prevBtn.addEventListener('click', () => { prev(); restart(); });

  // Pause on hover (desktop) for better UX
  carousel.addEventListener('mouseenter', stop);
  carousel.addEventListener('mouseleave', start);

  // Pause when tab is hidden (saves CPU)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else start();
  });

  // Touch swipe support for mobile
  let touchStartX = 0;
  let touchEndX = 0;
  carousel.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    stop();
  }, { passive: true });
  carousel.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const dx = touchEndX - touchStartX;
    if (Math.abs(dx) > 40) {
      if (dx < 0) next();
      else prev();
    }
    start();
  }, { passive: true });

  // Start auto-advance only after first slide image loads (or 800ms safety)
  const firstImg = slides[0]?.querySelector('img');
  if (firstImg && !firstImg.complete) {
    firstImg.addEventListener('load', start, { once: true });
    setTimeout(start, 800); // safety in case image fails
  } else {
    start();
  }
})();
