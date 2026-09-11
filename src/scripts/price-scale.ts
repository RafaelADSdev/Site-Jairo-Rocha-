import {scaleFor} from '../data/filters';

// Troca as faixas do seletor de preço conforme a finalidade, preservando a escolha
// quando ela ainda existe na nova escala.
export function createPriceScale(select: HTMLSelectElement, label: HTMLElement) {
  let current = scaleFor('');

  return function apply(type: string, keep = select.value) {
    const next = scaleFor(type);
    if (next !== current || !select.options.length) {
      current = next;
      label.textContent = next.label;
      select.innerHTML = '';
      for (const [value, text] of next.options) select.add(new Option(text, value));
    }
    select.value = next.options.some(([value]) => value === keep) ? keep : '';
  };
}
