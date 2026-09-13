/** Purchase combines new and resale stock without including monthly rentals. */
export function matchesPropertyPurpose(category: string, purpose: string): boolean {
  if (!purpose) return true;
  if (purpose === 'venda') return category === 'novos' || category === 'seminovos';
  return category === purpose;
}
