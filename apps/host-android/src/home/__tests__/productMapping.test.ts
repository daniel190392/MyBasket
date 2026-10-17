import { toBackendDraft, toProduct } from '../productMapping';

import type { BackendProduct } from '../productMapping';

const backendProduct: BackendProduct = {
  productId: 'a1',
  name: 'Milk',
  quantity: 2,
  expirationDate: '2026-12-01',
  packaging: 'bottle',
  size: 1,
  sizeUnit: 'L',
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

  it('maps the packages, their kind and what each holds, ignoring case', () => {
    expect(toProduct(backendProduct).quantity).toEqual({
      count: 2,
      packaging: 'bottle',
      content: { size: 1, unit: 'l' },
    });
  });

  it('keeps only the count when nothing else is set', () => {
    const bare: BackendProduct = {
      productId: 'a1',
      name: 'Milk',
      quantity: 2,
      expirationDate: '2026-12-01',
    };

    expect(toProduct(bare).quantity).toEqual({ count: 2 });
  });

  it('drops a packaging the home does not know', () => {
    expect(
      toProduct({ ...backendProduct, packaging: 'crate' }).quantity
    ).toEqual({ count: 2, content: { size: 1, unit: 'l' } });
  });

  it('drops the size together with a unit the home does not know', () => {
    expect(toProduct({ ...backendProduct, sizeUnit: 'oz' }).quantity).toEqual({
      count: 2,
      packaging: 'bottle',
    });
  });

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

  it('sends a bare count as the quantity only', () => {
    expect(toBackendDraft({ ...draft, quantity: { count: 3 } })).toEqual({
      name: 'Milk',
      category: 'dairy',
      expirationDate: '2026-12-01',
      quantity: 3,
    });
  });

  it('sends the packaging and the content as the size with its unit', () => {
    expect(
      toBackendDraft({
        ...draft,
        quantity: {
          count: 2,
          packaging: 'bottle',
          content: { size: 1.5, unit: 'l' },
        },
      })
    ).toEqual({
      name: 'Milk',
      category: 'dairy',
      expirationDate: '2026-12-01',
      quantity: 2,
      packaging: 'bottle',
      size: 1.5,
      sizeUnit: 'l',
    });
  });
});
