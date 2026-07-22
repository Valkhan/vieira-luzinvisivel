(() => {
  const sections = [document.getElementById('hero'), document.getElementById('contato')];
  const DURATION = 380; /* disparo rápido */
  const THRESHOLD_VH = 0.10; /* leve scroll manual máximo antes de disparar */

  let current = 0;
  let animating = false;
  let accumulated = 0;
  let idleTimer = null;

  function threshold() {
    return window.innerHeight * THRESHOLD_VH;
  }

  function targetY(i) {
    return sections[i].offsetTop;
  }

  function animateScrollTo(y) {
    animating = true;
    const startY = window.scrollY;
    const startTime = performance.now();

    function step(now) {
      const t = Math.min(1, (now - startTime) / DURATION);
      const ease = 1 - Math.pow(1 - t, 3);
      window.scrollTo(0, startY + (y - startY) * ease);

      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        animating = false;
        accumulated = 0;
      }
    }

    requestAnimationFrame(step);
  }

  window.addEventListener('wheel', (e) => {
    if (animating) {
      e.preventDefault();
      return;
    }

    const dir = e.deltaY > 0 ? 1 : -1;
    const next = current + dir;
    if (next < 0 || next >= sections.length) {
      return;
    }

    e.preventDefault();
    accumulated += e.deltaY;

    if (Math.abs(accumulated) < threshold()) {
      window.scrollTo(0, targetY(current) + accumulated);
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        animateScrollTo(targetY(current));
      }, 150);
    } else {
      clearTimeout(idleTimer);
      current = next;
      animateScrollTo(targetY(current));
    }
  }, { passive: false });
})();
