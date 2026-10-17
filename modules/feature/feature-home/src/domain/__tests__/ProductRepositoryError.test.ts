import { productErrorCode } from '../ProductRepositoryError';

import type { ProductErrorCode } from '../ProductRepositoryError';

const errorWithCode = (code: string) =>
  Object.assign(new Error(code), { code });

describe('productErrorCode', () => {
  it.each([
    ['offline'],
    ['unauthorized'],
    ['server'],
    ['unknown'],
  ] as ProductErrorCode[][])('reads the code %s of an error', (code) => {
    expect(productErrorCode(errorWithCode(code))).toBe(code);
  });

  it('falls back to unknown for a code it does not know', () => {
    expect(productErrorCode(errorWithCode('teapot'))).toBe('unknown');
  });

  it('falls back to unknown for an error without a code', () => {
    expect(productErrorCode(new Error('crashed'))).toBe('unknown');
  });

  it.each([['offline'], [undefined], [null], [42]])(
    'falls back to unknown for the value %s',
    (value) => {
      expect(productErrorCode(value)).toBe('unknown');
    }
  );
});
