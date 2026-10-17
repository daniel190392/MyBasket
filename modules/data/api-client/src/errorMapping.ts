import { ApiError } from './ApiError';

const HTTP_BAD_REQUEST = 400;
const HTTP_UNAUTHORIZED = 401;
const HTTP_FORBIDDEN = 403;
const HTTP_NOT_FOUND = 404;
const HTTP_SERVER_ERROR = 500;

// The backend answers errors with `{ error }` and API Gateway with `{ message }`.
export const extractErrorDetail = (body: unknown): string | undefined => {
  if (typeof body !== 'object' || body === null) {
    return undefined;
  }
  const { error, message } = body as Record<string, unknown>;
  if (typeof error === 'string') {
    return error;
  }
  return typeof message === 'string' ? message : undefined;
};

export const toApiError = (status: number, body: unknown): ApiError => {
  const detail = extractErrorDetail(body);
  if (status === HTTP_UNAUTHORIZED || status === HTTP_FORBIDDEN) {
    return new ApiError('unauthorized', status, detail);
  }
  if (status === HTTP_NOT_FOUND) {
    return new ApiError('not-found', status, detail);
  }
  if (status === HTTP_BAD_REQUEST) {
    return new ApiError('validation', status, detail);
  }
  if (status >= HTTP_SERVER_ERROR) {
    return new ApiError('server', status, detail);
  }
  return new ApiError('unknown', status, detail);
};
