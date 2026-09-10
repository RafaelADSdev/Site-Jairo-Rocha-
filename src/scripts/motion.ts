function prefersReducedMotion() {
  return matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function reveal(selector: string) {
  const nodes = [...document.querySelectorAll<HTMLElement>(selector)];
  if (!nodes.length) return;
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-in');
      io.unobserve(entry.target);
    }
  }, {threshold: 0.28, rootMargin: '0px 0px -8% 0px'});
  nodes.forEach((node, i) => {
    node.style.setProperty('--delay', `${(i % 3) * 90}ms`);
    io.observe(node);
  });
}

function bindHeader() {
  const header = document.querySelector<HTMLElement>('.site-header.over');
  const hero = document.querySelector<HTMLElement>('.hero, .sopro-hero');
  if (!header || !hero) return;
  const io = new IntersectionObserver(([entry]) => {
    header.classList.toggle('is-solid', !entry.isIntersecting);
  }, {threshold: 0, rootMargin: '-72px 0px 0px 0px'});
  io.observe(hero);
}

function bindGallery() {
  const photo = document.querySelector<HTMLImageElement>('#main-photo');
  if (!photo) return;
  const dissolve = () => {
    photo.classList.remove('is-swapping');
    void photo.offsetWidth;
    photo.classList.add('is-swapping');
  };
  const dissolveSoon = () => requestAnimationFrame(dissolve);
  document.querySelectorAll<HTMLButtonElement>('[data-photo]').forEach((button) => {
    button.addEventListener('click', dissolveSoon);
  });
  document.querySelector('#previous-photo')?.addEventListener('click', dissolveSoon);
  document.querySelector('#next-photo')?.addEventListener('click', dissolveSoon);
}

let started = false;

export function initMotion() {
  if (prefersReducedMotion()) {
    document.documentElement.classList.remove('motion-on');
    return;
  }
  document.documentElement.classList.add('motion-on');
  if (started) return;
  started = true;
  bindHeader();
  reveal('.property-photo');
  reveal('.coast-image');
  reveal('.story-mark');
  reveal('.sopro-plate');
  bindGallery();
}

initMotion();
matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', () => {
  if (prefersReducedMotion()) document.documentElement.classList.remove('motion-on');
  else initMotion();
});
