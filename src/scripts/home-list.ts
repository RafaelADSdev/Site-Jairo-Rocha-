const section = document.querySelector<HTMLElement>('.home-list');
const button = section?.querySelector<HTMLButtonElement>('[data-show-all]');
const label = button?.querySelector('[data-show-all-label]');
const extras = [...(section?.querySelectorAll<HTMLElement>('.property-card.extra') ?? [])];

if (section && button && label && extras.length) {
  button.addEventListener('click', () => {
    const open = !section.classList.contains('is-open');
    section.classList.toggle('is-open', open);
    extras.forEach((card) => {
      card.hidden = !open;
    });
    button.setAttribute('aria-expanded', String(open));
    label.textContent = open ? 'Mostrar menos' : 'Ver todos os imóveis';
    if (open) {
      const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
      extras[0]?.scrollIntoView({block: 'nearest', behavior: reduce ? 'auto' : 'smooth'});
    }
  });
}
