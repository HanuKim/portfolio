/**
 * Portfolio - Kim Hanul
 * FullPage-style scroll: JS controls all transitions via CSS transform
 */

(function () {
  'use strict';

  const scrollContainer = document.getElementById('scrollContainer');
  const sections = Array.from(scrollContainer.querySelectorAll('.section'));
  const navDots = document.querySelectorAll('.nav-dot');
  const scrollIndicator = document.getElementById('scrollIndicator');
  const indexItems = document.querySelectorAll('.index-item');

  const TOTAL = sections.length;
  let current = 0;
  let isAnimating = false;
  const DURATION = 800; // ms for transition

  // ===== Build a vertical "slide deck" via CSS transform =====
  // Wrap all sections in a single translateY container
  scrollContainer.style.position = 'relative';
  scrollContainer.style.overflow = 'hidden';

  const track = document.createElement('div');
  track.id = 'pageTrack';
  track.style.cssText = `
    position: absolute;
    top: 0; left: 0;
    width: 100%;
    will-change: transform;
    transition: transform ${DURATION}ms cubic-bezier(0.77, 0, 0.175, 1);
  `;

  // Move sections into track
  sections.forEach(s => track.appendChild(s));
  scrollContainer.appendChild(track);

  // ===== Skill Bar Rendering =====
  function renderSkillBars() {
    document.querySelectorAll('.skill-bar').forEach(bar => {
      const level = parseInt(bar.dataset.level, 10);
      const max = 7;
      bar.innerHTML = '';
      for (let i = 0; i < max; i++) {
        const block = document.createElement('span');
        block.className = 'skill-block ' + (i < level ? 'filled' : 'empty');
        bar.appendChild(block);
      }
    });
  }
  renderSkillBars();

  // ===== Go to section =====
  function goTo(index, instant = false) {
    if (index < 0 || index >= TOTAL) return;
    if (index === current && !instant) return;

    current = index;
    const offset = -index * 100;

    if (instant) {
      track.style.transition = 'none';
      track.style.transform = `translateY(${offset}vh)`;
      // Force reflow then re-enable transition
      track.getBoundingClientRect();
      track.style.transition = `transform ${DURATION}ms cubic-bezier(0.77, 0, 0.175, 1)`;
    } else {
      isAnimating = true;
      track.style.transform = `translateY(${offset}vh)`;
      setTimeout(() => { isAnimating = false; }, DURATION);
    }

    updateNavDots(index);
    triggerReveal(index);

    if (scrollIndicator) {
      scrollIndicator.style.opacity = index === 0 ? '' : '0';
      scrollIndicator.style.pointerEvents = index === 0 ? '' : 'none';
    }
  }

  // Initialize position
  goTo(0, true);

  // ===== Navigation Dots =====
  function updateNavDots(index) {
    navDots.forEach((dot, i) => dot.classList.toggle('active', i === index));
  }

  navDots.forEach(dot => {
    dot.addEventListener('click', () => {
      const idx = parseInt(dot.dataset.section, 10);
      goTo(idx);
    });
  });

  // ===== Index Items Click =====
  indexItems.forEach(item => {
    item.addEventListener('click', () => {
      const goto = parseInt(item.dataset.goto, 10);
      goTo(goto);
    });
  });

  // ===== Scroll Indicator Click =====
  if (scrollIndicator) {
    scrollIndicator.addEventListener('click', () => goTo(1));
  }

  // ===== Wheel Scroll =====
  let wheelAccum = 0;
  const WHEEL_THRESH = 50;

  scrollContainer.addEventListener('wheel', (e) => {
    e.preventDefault();

    if (isAnimating) return;

    wheelAccum += e.deltaY;

    if (Math.abs(wheelAccum) >= WHEEL_THRESH) {
      const dir = wheelAccum > 0 ? 1 : -1;
      wheelAccum = 0;
      goTo(current + dir);
    }
  }, { passive: false });

  // Reset accumulator on idle
  let wheelTimer;
  scrollContainer.addEventListener('wheel', () => {
    clearTimeout(wheelTimer);
    wheelTimer = setTimeout(() => { wheelAccum = 0; }, 200);
  }, { passive: true });

  // ===== Touch Scroll =====
  let touchStartY = 0;
  let touchDelta = 0;
  const TOUCH_THRESH = 50;

  scrollContainer.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
    touchDelta = 0;
  }, { passive: true });

  scrollContainer.addEventListener('touchmove', (e) => {
    e.preventDefault();
    touchDelta = touchStartY - e.touches[0].clientY;
  }, { passive: false });

  scrollContainer.addEventListener('touchend', () => {
    if (isAnimating) return;
    if (Math.abs(touchDelta) >= TOUCH_THRESH) {
      goTo(current + (touchDelta > 0 ? 1 : -1));
    }
    touchDelta = 0;
  }, { passive: true });

  // ===== Keyboard Navigation =====
  document.addEventListener('keydown', (e) => {
    if (isAnimating) return;
    if (e.key === 'ArrowDown' || e.key === 'PageDown') {
      e.preventDefault();
      goTo(current + 1);
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
      e.preventDefault();
      goTo(current - 1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      goTo(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      goTo(TOTAL - 1);
    }
  });

  // ===== Reveal Animations (trigger on section enter) =====
  function triggerReveal(index) {
    const section = sections[index];
    const reveals = section.querySelectorAll('.reveal:not(.visible)');
    // Stagger slightly for already-visible check
    setTimeout(() => {
      reveals.forEach(el => el.classList.add('visible'));
    }, 150);
  }

  // Pre-reveal current section on load
  triggerReveal(0);

})();
