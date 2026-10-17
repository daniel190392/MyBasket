import {
  parseExpirationDate,
  parseContentSize,
  parseCount,
  validateProductForm,
} from '../productForm';

import type { ProductFormValues } from '../productForm';

const validValues: ProductFormValues = {
  name: 'Arroz integral',
  category: 'food',
  countText: '2',
  packaging: null,
  contentSizeText: '',
  contentUnit: null,
  expirationText: '01/12/2026',
};

describe('parseExpirationDate', () => {
  it('turns DD/MM/YYYY into a plain date', () => {
    expect(parseExpirationDate('01/12/2026')).toBe('2026-12-01');
  });

  it('accepts days and months without the leading zero', () => {
    expect(parseExpirationDate('5/3/2026')).toBe('2026-03-05');
  });

  it('accepts the last day of a leap February', () => {
    expect(parseExpirationDate('29/02/2028')).toBe('2028-02-29');
  });

  it.each([
    ['31/02/2026'],
    ['29/02/2027'],
    ['00/01/2026'],
    ['15/13/2026'],
    ['2026-12-01'],
    ['01/12/26'],
    [''],
  ])('rejects %s', (text) => {
    expect(parseExpirationDate(text)).toBeNull();
  });
});

describe('parseCount', () => {
  it.each([
    ['2', 2],
    ['0', 0],
    [' 3 ', 3],
  ])('reads %s as %d', (text, expected) => {
    expect(parseCount(text)).toBe(expected);
  });

  it.each([[''], ['-1'], ['1.5'], ['1,5'], ['abc'], ['1e3']])(
    'rejects %s',
    (text) => {
      expect(parseCount(text)).toBeNull();
    }
  );
});

describe('parseContentSize', () => {
  it.each([
    ['1', 1],
    ['1.5', 1.5],
    ['1,5', 1.5],
    [' 500 ', 500],
  ])('reads %s as %d', (text, expected) => {
    expect(parseContentSize(text)).toBe(expected);
  });

  it.each([[''], ['0'], ['-1'], ['abc'], ['1,2,3']])('rejects %s', (text) => {
    expect(parseContentSize(text)).toBeNull();
  });
});

describe('validateProductForm', () => {
  it('builds a draft with only a count when nothing else is chosen', () => {
    expect(validateProductForm(validValues)).toEqual({
      isValid: true,
      draft: {
        name: 'Arroz integral',
        category: 'food',
        quantity: { count: 2 },
        expirationDate: '2026-12-01',
      },
    });
  });

  it('adds the packaging when one is chosen', () => {
    const result = validateProductForm({
      ...validValues,
      packaging: 'bottle',
    });

    expect(result).toEqual(
      expect.objectContaining({
        draft: expect.objectContaining({
          quantity: { count: 2, packaging: 'bottle' },
        }),
      })
    );
  });

  it('adds the content of each package when size and unit are given', () => {
    const result = validateProductForm({
      ...validValues,
      packaging: 'bottle',
      contentSizeText: '1,5',
      contentUnit: 'l',
    });

    expect(result).toEqual(
      expect.objectContaining({
        draft: expect.objectContaining({
          quantity: {
            count: 2,
            packaging: 'bottle',
            content: { size: 1.5, unit: 'l' },
          },
        }),
      })
    );
  });

  it('trims the name', () => {
    const result = validateProductForm({ ...validValues, name: '  Leche  ' });

    expect(result).toEqual(
      expect.objectContaining({
        draft: expect.objectContaining({ name: 'Leche' }),
      })
    );
  });

  it('accepts a zero count and a date in the past', () => {
    expect(
      validateProductForm({
        ...validValues,
        countText: '0',
        expirationText: '01/01/2020',
      }).isValid
    ).toBe(true);
  });

  it.each([
    ['a size without a unit', { contentSizeText: '1', contentUnit: null }],
    [
      'a unit without a size',
      { contentSizeText: '', contentUnit: 'l' as const },
    ],
    ['a zero size', { contentSizeText: '0', contentUnit: 'l' as const }],
  ])('rejects %s', (_label, content) => {
    expect(validateProductForm({ ...validValues, ...content })).toEqual({
      isValid: false,
      errors: { content: true },
    });
  });

  it('reports every invalid field at once', () => {
    expect(
      validateProductForm({
        ...validValues,
        name: '   ',
        countText: '',
        contentSizeText: '1',
        expirationText: '31/02/2026',
      })
    ).toEqual({
      isValid: false,
      errors: {
        name: true,
        count: true,
        content: true,
        expirationDate: true,
      },
    });
  });

  it('reports only the invalid field', () => {
    expect(validateProductForm({ ...validValues, countText: '1,5' })).toEqual({
      isValid: false,
      errors: { count: true },
    });
  });
});
