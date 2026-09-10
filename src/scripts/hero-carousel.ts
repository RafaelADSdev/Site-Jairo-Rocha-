const INTERVAL = 8000;

function prefersReducedMotion() {
  return matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function initHeroCarousel(hero: HTMLElement) {
  const slides = [...hero.querySelectorAll<HTMLElement>('[data-hero-slide]')];
  const buttons = [...hero.querySelectorAll<HTMLButtonElement>('[data-hero-to]')];
  if (slides.length < 2 || buttons.length < 2) return;

  let index = 0;
  let hovered = false;
  let focused = false;
  let timer = 0;
  let progress: Animation | null = null;

  const reduced = () => prefersReducedMotion();

  const go = (next: number) => {
    index = (next + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      const on = i === index;
      slide.classList.toggle('is-active', on);
      slide.setAttribute('aria-hidden', String(!on));
      slide.toggleAttribute('inert', !on);
    });
    buttons.forEach((button, i) => {
      if (i === index) button.setAttribute('aria-current', 'true');
      else button.removeAttribute('aria-current');
    });
    hero.dispatchEvent(new CustomEvent('hero:slide', {detail: index}));
    arm();
  };

  const stopProgress = () => {
    progress?.cancel();
    progress = null;
  };

  const arm = () => {
    window.clearTimeout(timer);
    stopProgress();
    if (reduced() || hovered || focused || document.hidden) return;
    const bar = buttons[index]?.querySelector<HTMLElement>('.hero-progress');
    if (bar) {
      progress = bar.animate(
        [{transform: 'scaleX(0)'}, {transform: 'scaleX(1)'}],
        {duration: INTERVAL, easing: 'linear', fill: 'forwards'}
      );
    }
    timer = window.setTimeout(() => go(index + 1), INTERVAL);
  };

  buttons.forEach((button) => {
    button.addEventListener('click', () => go(Number(button.dataset.heroTo)));
  });

  hero.addEventListener('mouseenter', () => {
    hovered = true;
    window.clearTimeout(timer);
    stopProgress();
  });
  hero.addEventListener('mouseleave', () => {
    hovered = false;
    arm();
  });
  hero.addEventListener('focusin', () => {
    focused = true;
    window.clearTimeout(timer);
    stopProgress();
  });
  hero.addEventListener('focusout', (event) => {
    focused = hero.contains((event as FocusEvent).relatedTarget as Node);
    if (!focused) arm();
  });
  hero.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    if (!(event.target instanceof HTMLElement) || !hero.contains(event.target)) return;
    if (event.target.closest('a, input, select, textarea')) return;
    event.preventDefault();
    go(index + (event.key === 'ArrowRight' ? 1 : -1));
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      window.clearTimeout(timer);
      stopProgress();
    } else arm();
  });

  const io = new IntersectionObserver((entries) => {
    const on = entries.some((entry) => entry.isIntersecting);
    if (!on) {
      window.clearTimeout(timer);
      stopProgress();
    } else arm();
  }, {threshold: 0.2});
  io.observe(hero);

  matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', () => {
    window.clearTimeout(timer);
    stopProgress();
    arm();
  });

  arm();
}

const hero = document.querySelector<HTMLElement>('.hero');
if (hero) initHeroCarousel(hero);
