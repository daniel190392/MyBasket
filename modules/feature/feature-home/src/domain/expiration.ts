import type { Product } from './product';

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

export const EXPIRING_SOON_DAYS = 7;
export const SAFE_DAYS = 30;

export type ExpirationLevel = 'expired' | 'soon' | 'upcoming' | 'safe';

export interface ExpirationStatus {
  level: ExpirationLevel;
  // Negative when the product has already expired.
  daysLeft: number;
}

function parseCalendarDate(isoDate: string): number {
  const [year, month, day] = isoDate.split('-').map(Number);
  return Date.UTC(year, month - 1, day);
}

// Both dates are reduced to a calendar day first, so the result does not
// depend on the time of day or the time zone of the device.
export function daysUntilExpiration(product: Product, now: Date): number {
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const expiration = parseCalendarDate(product.expirationDate);
  return Math.round((expiration - today) / MILLISECONDS_PER_DAY);
}

export function expirationStatus(
  product: Product,
  now: Date
): ExpirationStatus {
  const daysLeft = daysUntilExpiration(product, now);

  if (daysLeft < 0) return { level: 'expired', daysLeft };
  if (daysLeft <= EXPIRING_SOON_DAYS) return { level: 'soon', daysLeft };
  if (daysLeft < SAFE_DAYS) return { level: 'upcoming', daysLeft };
  return { level: 'safe', daysLeft };
}
