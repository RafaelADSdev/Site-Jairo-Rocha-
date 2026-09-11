// Substitui o menu nativo do sistema pelos campos da busca da home.
// O <select> permanece no formulário para envio e para a escala de preço.

const CHEVRON =
  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';

function bindChoice(select: HTMLSelectElement) {
  if (select.dataset.choiceBound) return;
  select.dataset.choiceBound = 'true';

  const field = select.parentElement;
  if (!field) return;

  field.classList.add('search-choice');
  select.classList.add('search-choice-native');
  select.tabIndex = -1;
  select.setAttribute('aria-hidden', 'true');
  select.setAttribute('inert', '');

  const label = field.querySelector(':scope > span');
  const labelId = label?.id || `${select.name || 'campo'}-rotulo`;
  if (label && !label.id) label.id = labelId;

  const listId = `${select.name || 'campo'}-lista`;
  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'search-choice-trigger';
  trigger.setAttribute('role', 'combobox');
  trigger.setAttribute('aria-haspopup', 'listbox');
  trigger.setAttribute('aria-expanded', 'false');
  trigger.setAttribute('aria-controls', listId);
  trigger.setAttribute('aria-autocomplete', 'none');
  if (label) trigger.setAttribute('aria-labelledby', labelId);

  const value = document.createElement('span');
  trigger.append(value);
  trigger.insertAdjacentHTML('beforeend', CHEVRON);

  const list = document.createElement('ul');
  list.id = listId;
  list.className = 'place-suggest search-choice-list';
  list.hidden = true;
  list.setAttribute('role', 'listbox');
  if (label) list.setAttribute('aria-labelledby', labelId);

  select.after(trigger, list);

  let active = -1;

  const options = () => [...list.querySelectorAll<HTMLElement>('[role="option"]')];

  const mark = () => {
    options().forEach((option, index) => {
      option.classList.toggle('is-active', index === active);
      if (index === active) trigger.setAttribute('aria-activedescendant', option.id);
    });
    if (active < 0) trigger.removeAttribute('aria-activedescendant');
  };

  const close = () => {
    list.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    trigger.removeAttribute('aria-activedescendant');
    field.classList.remove('is-open');
    active = -1;
    mark();
  };

  const closeOthers = () => {
    document.querySelectorAll<HTMLElement>('.search-choice.is-open').forEach((other) => {
      if (other !== field) other.dispatchEvent(new Event('search-choice-close'));
    });
  };

  field.addEventListener('search-choice-close', close);

  const paint = () => {
    list.replaceChildren();
    [...select.options].forEach((item, index) => {
      const option = document.createElement('li');
      option.id = `${listId}-${index}`;
      option.setAttribute('role', 'option');
      option.dataset.value = item.value;
      const current = item.value === select.value;
      option.setAttribute('aria-selected', String(current));
      option.classList.toggle('is-current', current);
      option.textContent = item.text;
      option.addEventListener('mousedown', (event) => {
        event.preventDefault();
        choose(item.value);
      });
      list.append(option);
    });
    value.textContent = select.selectedOptions[0]?.text || '';
  };

  const open = () => {
    closeOthers();
    paint();
    list.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    field.classList.add('is-open');
    active = Math.max(0, [...select.options].findIndex((item) => item.value === select.value));
    mark();
  };

  const choose = (next: string) => {
    if (select.value !== next) {
      select.value = next;
      select.dispatchEvent(new Event('change', {bubbles: true}));
    }
    paint();
    close();
    trigger.focus();
  };

  trigger.addEventListener('click', () => {
    if (field.classList.contains('is-open')) close();
    else open();
  });

  trigger.addEventListener('keydown', (event) => {
    const keys = ['ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter', ' '];
    if (!field.classList.contains('is-open') && keys.includes(event.key)) {
      event.preventDefault();
      open();
      if (event.key === 'ArrowUp' || event.key === 'End') active = options().length - 1;
      else if (event.key === 'Home' || event.key === 'ArrowDown') active = 0;
      mark();
      return;
    }
    if (!field.classList.contains('is-open')) return;
    const items = options();
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      active = Math.min(items.length - 1, active + 1);
      mark();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      active = Math.max(0, active - 1);
      mark();
    } else if (event.key === 'Home') {
      event.preventDefault();
      active = 0;
      mark();
    } else if (event.key === 'End') {
      event.preventDefault();
      active = items.length - 1;
      mark();
    } else if ((event.key === 'Enter' || event.key === ' ') && items[active]) {
      event.preventDefault();
      choose(items[active].dataset.value || '');
    } else if (event.key === 'Escape') {
      event.preventDefault();
      close();
    } else if (event.key === 'Tab') {
      close();
    }
  });

  document.addEventListener('pointerdown', (event) => {
    if (!field.contains(event.target as Node)) close();
  });

  new MutationObserver(paint).observe(select, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['value', 'selected']
  });

  paint();
}

document.querySelectorAll<HTMLSelectElement>('.search-fields select').forEach(bindChoice);
