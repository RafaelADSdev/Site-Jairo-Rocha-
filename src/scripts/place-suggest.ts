import {featuredPlaces, places, type Place} from '../data/places';

const LIMIT = 8;

function normalize(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function tokens(value: string) {
  return normalize(value).split(/[^a-z0-9]+/).filter(Boolean);
}

function matchPlaces(query: string): Place[] {
  const q = normalize(query.trim());
  if (!q) {
    return featuredPlaces
      .map((name) => places.find((place) => place.name === name))
      .filter((place): place is Place => Boolean(place));
  }
  return places
    .filter((place) => {
      const name = normalize(place.name);
      if (name.includes(q)) return true;
      return tokens(place.area).some((token) => token.startsWith(q));
    })
    .sort((a, b) => {
      const an = normalize(a.name).startsWith(q) ? 0 : 1;
      const bn = normalize(b.name).startsWith(q) ? 0 : 1;
      return an - bn || a.name.localeCompare(b.name, 'pt-BR');
    })
    .slice(0, LIMIT);
}

function bindSuggest(root: HTMLElement) {
  const input = root.querySelector<HTMLInputElement>('input[name="local"]');
  if (!input) return;

  const listId = `${input.id || 'place'}-suggest`;
  const list = document.createElement('ul');
  list.id = listId;
  list.className = 'place-suggest';
  list.hidden = true;
  list.setAttribute('role', 'listbox');
  list.setAttribute('aria-label', 'Sugestões de bairros e destinos');
  root.append(list);

  input.setAttribute('role', 'combobox');
  input.setAttribute('aria-autocomplete', 'list');
  input.setAttribute('aria-expanded', 'false');
  input.setAttribute('aria-controls', listId);
  input.setAttribute('autocomplete', 'off');
  input.setAttribute('spellcheck', 'false');

  let active = -1;

  const close = () => {
    list.hidden = true;
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant');
    active = -1;
  };

  const paint = () => {
    const results = matchPlaces(input.value);
    list.replaceChildren();
    if (!results.length) {
      const empty = document.createElement('li');
      empty.className = 'place-suggest-empty';
      empty.textContent = 'Nenhum lugar com esse nome. Tente Recife, Boa Viagem ou Porto de Galinhas.';
      list.append(empty);
    } else {
      results.forEach((place, index) => {
        const option = document.createElement('li');
        option.id = `${listId}-${index}`;
        option.setAttribute('role', 'option');
        option.setAttribute('aria-selected', 'false');
        const title = document.createElement('strong');
        title.textContent = place.name;
        const hint = document.createElement('small');
        hint.textContent = place.area;
        option.append(title, hint);
        option.addEventListener('mousedown', (event) => {
          event.preventDefault();
          choose(place.name);
        });
        list.append(option);
      });
    }
    list.hidden = false;
    input.setAttribute('aria-expanded', 'true');
    active = -1;
    input.removeAttribute('aria-activedescendant');
    mark();
  };

  const mark = () => {
    [...list.querySelectorAll('[role="option"]')].forEach((option, index) => {
      const on = index === active;
      option.setAttribute('aria-selected', String(on));
      if (on) input.setAttribute('aria-activedescendant', option.id);
    });
  };

  const choose = (name: string) => {
    input.value = name;
    input.dispatchEvent(new Event('input', {bubbles: true}));
    close();
    input.focus();
  };

  input.addEventListener('focus', paint);
  input.addEventListener('click', paint);
  input.addEventListener('input', paint);
  input.addEventListener('keydown', (event) => {
    if (list.hidden && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
      paint();
      event.preventDefault();
      return;
    }
    if (list.hidden) return;
    const options = [...list.querySelectorAll('[role="option"]')];
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      active = Math.min(options.length - 1, active + 1);
      mark();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      active = Math.max(0, active - 1);
      mark();
    } else if (event.key === 'Enter' && active >= 0 && options[active]) {
      event.preventDefault();
      const name = options[active].querySelector('strong')?.textContent;
      if (name) choose(name);
    } else if (event.key === 'Escape') {
      close();
    }
  });

  input.addEventListener('blur', () => {
    window.setTimeout(close, 120);
  });
}

document.querySelectorAll<HTMLElement>('[data-place-suggest]').forEach(bindSuggest);
