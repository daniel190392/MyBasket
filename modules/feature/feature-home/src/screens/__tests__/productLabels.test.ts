import { quantityLabel } from '../productLabels';

describe('quantityLabel', () => {
  it('counts units when there is no packaging', () => {
    expect(quantityLabel({ count: 4 })).toBe('4 unidades');
    expect(quantityLabel({ count: 1 })).toBe('1 unidad');
  });

  it('counts the packaging when there is one', () => {
    expect(quantityLabel({ count: 2, packaging: 'bottle' })).toBe('2 botellas');
    expect(quantityLabel({ count: 1, packaging: 'box' })).toBe('1 caja');
  });

  it('adds what each package holds after the count', () => {
    expect(
      quantityLabel({
        count: 2,
        packaging: 'bottle',
        content: { size: 1, unit: 'l' },
      })
    ).toBe('2 botellas · 1 l');
  });

  it('keeps the content when there is no packaging', () => {
    expect(quantityLabel({ count: 1, content: { size: 500, unit: 'g' } })).toBe(
      '1 unidad · 500 g'
    );
  });
});
