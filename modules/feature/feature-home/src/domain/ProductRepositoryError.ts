// Why a repository call failed, in terms the UI can explain.
export type ProductErrorCode =
  'offline' | 'unauthorized' | 'server' | 'unknown';

// The contract with the adapters: a failed call rejects with an error that
// carries one of these codes. It is a shape, not a class, so an adapter does
// not need to import code from the feature to fulfil it.
export interface ProductRepositoryError extends Error {
  code: ProductErrorCode;
}

const PRODUCT_ERROR_CODES: readonly ProductErrorCode[] = [
  'offline',
  'unauthorized',
  'server',
  'unknown',
];

// Anything without a known code says nothing about the cause.
export function productErrorCode(error: unknown): ProductErrorCode {
  if (typeof error !== 'object' || error === null) return 'unknown';
  const { code } = error as { code?: unknown };
  return PRODUCT_ERROR_CODES.find((known) => known === code) ?? 'unknown';
}
