import { toBackendDraft, toProduct } from '../productMapping';

import type { BackendProduct } from '../productMapping';

const backendProduct: BackendProduct = {
  productId: 'a1',
  name: 'Milk',
  quantity: 2,
  expirationDate: '2026-12-01',
  unit: 'L',
  category: 'Dairy',
};

describe('toProduct', () => {
  it('maps the identity, name and expiration date as they come', () => {
    expect(toProduct(backendProduct)).toEqual(
      expect.objectContaining({
        id: 'a1',
        name: 'Milk',
        expirationDate: '2026-12-01',
      })
    );
  });

  it('never marks a product as favorite', () => {
    expect(toProduct(backendProduct).isFavorite).toBe(false);
  });

  it('reads a known unit as a measure, ignoring case', () => {
    expect(toProduct(backendProduct).quantity).toEqual({
      kind: 'measure',
      amount: 2,
      unit: 'l',
    });
  });

  it.each([['units'], ['box'], [undefined]])(
    'reads the unit %s as a plain count',
    (unit) => {
      expect(toProduct({ ...backendProduct, unit }).quantity).toEqual({
        kind: 'units',
        count: 2,
      });
    }
  );

  it('normalizes the case of a known category', () => {
    expect(
      toProduct({ ...backendProduct, category: ' DRINKS ' }).category
    ).toBe('drinks');
  });

  it.each([['pantry'], [undefined]])(
    'falls back to food for the category %s',
    (category) => {
      expect(toProduct({ ...backendProduct, category }).category).toBe('food');
    }
  );
});

describe('toBackendDraft', () => {
  const draft = {
    name: 'Milk',
    category: 'dairy' as const,
    expirationDate: '2026-12-01',
  };

  it('sends a count as the quantity with the unit "units"', () => {
    expect(
      toBackendDraft({ ...draft, quantity: { kind: 'units', count: 3 } })
    ).toEqual({
      name: 'Milk',
      category: 'dairy',
      expirationDate: '2026-12-01',
      quantity: 3,
      unit: 'units',
    });
  });

  it('sends a measure as the amount with its unit', () => {
    expect(
      toBackendDraft({
        ...draft,
        quantity: { kind: 'measure', amount: 1.5, unit: 'l' },
      })
    ).toEqual(expect.objectContaining({ quantity: 1.5, unit: 'l' }));
  });
});
