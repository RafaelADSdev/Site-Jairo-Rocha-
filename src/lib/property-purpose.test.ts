import assert from 'node:assert/strict';
import test from 'node:test';
import { matchesPropertyPurpose } from './property-purpose.ts';

test('Comprar includes both new and resale properties, but never monthly rentals', () => {
  assert.equal(matchesPropertyPurpose('novos', 'venda'), true);
  assert.equal(matchesPropertyPurpose('seminovos', 'venda'), true);
  assert.equal(matchesPropertyPurpose('locacao', 'venda'), false);
  assert.equal(matchesPropertyPurpose('', 'venda'), false);
  assert.equal(matchesPropertyPurpose('unknown', 'venda'), false);
});

test('empty purpose retains the existing all-properties view', () => {
  for (const category of ['novos', 'seminovos', 'locacao', '', 'unknown']) {
    assert.equal(matchesPropertyPurpose(category, ''), true);
  }
});

test('specific category filters keep exact matching behavior', () => {
  const categories = ['novos', 'seminovos', 'locacao'];
  for (const purpose of categories) {
    for (const category of categories) {
      assert.equal(matchesPropertyPurpose(category, purpose), category === purpose);
    }
  }
});

test('nonempty unsupported purposes never broaden a known category search', () => {
  assert.equal(matchesPropertyPurpose('novos', 'unknown'), false);
  assert.equal(matchesPropertyPurpose('novos', 'VENDA'), false);
  assert.equal(matchesPropertyPurpose('novos', ' venda '), false);
});
