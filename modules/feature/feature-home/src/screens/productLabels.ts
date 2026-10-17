import { expirationStatus } from '../domain/expiration';
import { expirationLabels, packagingCountLabel, unitsLabel } from './strings';

import type { ExpirationLevel } from '../domain/expiration';
import type { Product, Quantity } from '../domain/product';
import type { BadgeVariant } from 'ui-components';

const DAYS_PER_MONTH = 30;
const TOMORROW_DAYS = 1;

const BADGE_VARIANTS: Record<ExpirationLevel, BadgeVariant> = {
  expired: 'warning',
  soon: 'warning',
  upcoming: 'informative',
  safe: 'important',
};

// "2 botellas · 1 l": how many packages and, when known, what each holds.
export function quantityLabel({ count, packaging, content }: Quantity): string {
  const countLabel = packaging
    ? packagingCountLabel(count, packaging)
    : unitsLabel(count);
  return content
    ? `${countLabel} · ${content.size} ${content.unit}`
    : countLabel;
}

export function expirationLabel(product: Product, now: Date): string {
  const { level, daysLeft } = expirationStatus(product, now);

  if (level === 'expired') return expirationLabels.expired;
  if (daysLeft === 0) return expirationLabels.today;
  if (daysLeft === TOMORROW_DAYS) return expirationLabels.tomorrow;
  if (level === 'safe') {
    return expirationLabels.inMonths(Math.floor(daysLeft / DAYS_PER_MONTH));
  }
  return expirationLabels.inDays(daysLeft);
}

export function expirationBadgeVariant(
  product: Product,
  now: Date
): BadgeVariant {
  return BADGE_VARIANTS[expirationStatus(product, now).level];
}
