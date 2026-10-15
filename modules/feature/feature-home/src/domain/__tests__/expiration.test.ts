import { daysUntilExpiration, expirationStatus } from '../expiration';
import { buildProduct, NOW } from './fixtures';

describe('daysUntilExpiration', () => {
  it('counts calendar days regardless of the time of day', () => {
    const product = buildProduct({ expirationDate: '2026-10-16' });

    expect(daysUntilExpiration(product, new Date(2026, 9, 15, 0, 1))).toBe(1);
    expect(daysUntilExpiration(product, new Date(2026, 9, 15, 23, 59))).toBe(1);
  });

  it('is zero on the expiration day and negative afterwards', () => {
    expect(
      daysUntilExpiration(buildProduct({ expirationDate: '2026-10-15' }), NOW)
    ).toBe(0);
    expect(
      daysUntilExpiration(buildProduct({ expirationDate: '2026-10-13' }), NOW)
    ).toBe(-2);
  });

  it('crosses a month boundary', () => {
    const product = buildProduct({ expirationDate: '2026-11-02' });

    expect(daysUntilExpiration(product, NOW)).toBe(18);
  });
});

describe('expirationStatus', () => {
  const statusFor = (expirationDate: string) =>
    expirationStatus(buildProduct({ expirationDate }), NOW);

  it('flags products past their date as expired', () => {
    expect(statusFor('2026-10-14')).toEqual({ level: 'expired', daysLeft: -1 });
  });

  it('flags products expiring within a week as soon, including today', () => {
    expect(statusFor('2026-10-15').level).toBe('soon');
    expect(statusFor('2026-10-22').level).toBe('soon');
  });

  it('flags products expiring within a month as upcoming', () => {
    expect(statusFor('2026-10-23').level).toBe('upcoming');
    expect(statusFor('2026-11-13').level).toBe('upcoming');
  });

  it('flags products with a month or more left as safe', () => {
    expect(statusFor('2026-11-14')).toEqual({ level: 'safe', daysLeft: 30 });
  });
});
