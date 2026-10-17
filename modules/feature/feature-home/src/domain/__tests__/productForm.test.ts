import {
  parseExpirationDate,
  parseQuantity,
  validateProductForm,
} from '../productForm';

import type { ProductFormValues } from '../productForm';

const validValues: ProductFormValues = {
  name: 'Arroz integral',
  category: 'food',
  quantityText: '2',
  quantityUnit: 'units',
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

describe('parseQuantity', () => {
  it.each([
    ['2', 2],
    ['0', 0],
    ['1.5', 1.5],
    ['1,5', 1.5],
    [' 3 ', 3],
  ])('reads %s as %d', (text, expected) => {
    expect(parseQuantity(text)).toBe(expected);
  });

  it.each([[''], ['-1'], ['abc'], ['1,2,3'], ['1e3']])('rejects %s', (text) => {
    expect(parseQuantity(text)).toBeNull();
  });
});

describe('validateProductForm', () => {
  it('builds a draft with units from valid values', () => {
    expect(validateProductForm(validValues)).toEqual({
      isValid: true,
      draft: {
        name: 'Arroz integral',
        category: 'food',
        quantity: { kind: 'units', count: 2 },
        expirationDate: '2026-12-01',
      },
    });
  });

  it('builds a measure when a unit is chosen', () => {
    const result = validateProductForm({
      ...validValues,
      quantityText: '1,5',
      quantityUnit: 'kg',
    });

    expect(result).toEqual(
      expect.objectContaining({
        draft: expect.objectContaining({
          quantity: { kind: 'measure', amount: 1.5, unit: 'kg' },
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

  it('accepts a zero quantity and a date in the past', () => {
    expect(
      validateProductForm({
        ...validValues,
        quantityText: '0',
        expirationText: '01/01/2020',
      }).isValid
    ).toBe(true);
  });

  it('reports every invalid field at once', () => {
    expect(
      validateProductForm({
        ...validValues,
        name: '   ',
        quantityText: '',
        expirationText: '31/02/2026',
      })
    ).toEqual({
      isValid: false,
      errors: { name: true, quantity: true, expirationDate: true },
    });
  });

  it('reports only the invalid field', () => {
    expect(validateProductForm({ ...validValues, quantityText: '-2' })).toEqual(
      { isValid: false, errors: { quantity: true } }
    );
  });
});
