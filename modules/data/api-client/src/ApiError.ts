export type ApiErrorCode =
  /** No session, or the backend rejected the token. */
  | 'unauthorized'
  | 'not-found'
  /** The backend refused the request body (HTTP 400). */
  | 'validation'
  /** The request never got an answer. */
  | 'network'
  /** The backend failed (HTTP 5xx), possibly temporarily. */
  | 'server'
  | 'unknown';

/**
 * Platform-agnostic failure of a backend call. The UI maps `code` to a
 * message; `detail` is the backend text, meant for logs and never for users.
 */
export class ApiError extends Error {
  constructor(
    readonly code: ApiErrorCode,
    readonly status?: number,
    readonly detail?: string
  ) {
    super(code);
    this.name = 'ApiError';
  }
}

export const isApiError = (error: unknown): error is ApiError =>
  error instanceof ApiError;
