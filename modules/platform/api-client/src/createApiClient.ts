import { ApiError } from './ApiError';
import { toApiError } from './errorMapping';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type RequestOptions = {
  method?: HttpMethod;
  /** Serialized as JSON. */
  body?: unknown;
};

export type ApiClient = {
  request<T>(path: string, options?: RequestOptions): Promise<T>;
};

export type ApiClientConfig = {
  baseUrl: string;
  /** `null` means there is no session; the call is not made. */
  getAccessToken: () => Promise<string | null>;
  fetchImpl?: typeof fetch;
};

const HTTP_NO_CONTENT = 204;

const readJson = async (response: Response): Promise<unknown> => {
  try {
    return await response.json();
  } catch {
    // An error response may carry no JSON body; the status says enough.
    return undefined;
  }
};

export const createApiClient = ({
  baseUrl,
  getAccessToken,
  fetchImpl = fetch,
}: ApiClientConfig): ApiClient => {
  const send = async (
    path: string,
    { method = 'GET', body }: RequestOptions
  ): Promise<Response> => {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      throw new ApiError('unauthorized');
    }
    try {
      return await fetchImpl(`${baseUrl}${path}`, {
        method,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          ...(body !== undefined && { 'Content-Type': 'application/json' }),
        },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    } catch {
      throw new ApiError('network');
    }
  };

  const request = async <T>(
    path: string,
    options: RequestOptions = {}
  ): Promise<T> => {
    const response = await send(path, options);
    if (!response.ok) {
      throw toApiError(response.status, await readJson(response));
    }
    if (response.status === HTTP_NO_CONTENT) {
      return undefined as T;
    }
    return (await response.json()) as T;
  };

  return { request };
};
