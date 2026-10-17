import { ApiError } from '../ApiError';
import { createApiClient } from '../createApiClient';

const BASE_URL = 'https://api.test/dev';
const ACCESS_TOKEN = 'access-token';

const jsonResponse = (status: number, body?: unknown) =>
  new Response(body === undefined ? null : JSON.stringify(body), { status });

const setUp = (
  fetchImpl: jest.Mock,
  getAccessToken: () => Promise<string | null> = async () => ACCESS_TOKEN
) => createApiClient({ baseUrl: BASE_URL, getAccessToken, fetchImpl });

const failureOf = async (promise: Promise<unknown>) => {
  try {
    await promise;
  } catch (error) {
    return error;
  }
  throw new Error('Expected the request to fail');
};

describe('createApiClient', () => {
  it('sends the Bearer access token to the base URL', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(jsonResponse(200, []));

    await setUp(fetchImpl).request('/products');

    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe(`${BASE_URL}/products`);
    expect(init.method).toBe('GET');
    expect(init.headers.Authorization).toBe(`Bearer ${ACCESS_TOKEN}`);
    expect(init.body).toBeUndefined();
  });

  it('sends the body as JSON', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(jsonResponse(201, {}));

    await setUp(fetchImpl).request('/products', {
      method: 'POST',
      body: { name: 'Milk' },
    });

    const [, init] = fetchImpl.mock.calls[0];
    expect(init.headers['Content-Type']).toBe('application/json');
    expect(init.body).toBe('{"name":"Milk"}');
  });

  it('returns the parsed JSON body', async () => {
    const fetchImpl = jest
      .fn()
      .mockResolvedValue(jsonResponse(200, [{ productId: '1' }]));

    expect(await setUp(fetchImpl).request('/products')).toEqual([
      { productId: '1' },
    ]);
  });

  it('returns undefined for an empty 204 response', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(jsonResponse(204));

    expect(
      await setUp(fetchImpl).request('/products/1', { method: 'DELETE' })
    ).toBeUndefined();
  });

  it('fails as unauthorized without calling the backend when there is no session', async () => {
    const fetchImpl = jest.fn();

    const error = await failureOf(
      setUp(fetchImpl, async () => null).request('/products')
    );

    expect(error).toEqual(expect.objectContaining({ code: 'unauthorized' }));
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it.each([
    [401, 'unauthorized'],
    [403, 'unauthorized'],
    [404, 'not-found'],
    [400, 'validation'],
    [500, 'server'],
    [503, 'server'],
    [418, 'unknown'],
  ])('maps HTTP %i to the %s error', async (status, code) => {
    const fetchImpl = jest.fn().mockResolvedValue(jsonResponse(status, {}));

    const error = await failureOf(setUp(fetchImpl).request('/products'));

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toEqual(expect.objectContaining({ code, status }));
  });

  it('reads the detail from the backend error shape', async () => {
    const fetchImpl = jest
      .fn()
      .mockResolvedValue(jsonResponse(400, { error: 'name is required' }));

    const error = await failureOf(setUp(fetchImpl).request('/products'));

    expect(error).toEqual(
      expect.objectContaining({ detail: 'name is required' })
    );
  });

  it('reads the detail from the API Gateway error shape', async () => {
    const fetchImpl = jest
      .fn()
      .mockResolvedValue(jsonResponse(401, { message: 'Unauthorized' }));

    const error = await failureOf(setUp(fetchImpl).request('/products'));

    expect(error).toEqual(expect.objectContaining({ detail: 'Unauthorized' }));
  });

  it('maps an error response without a JSON body by its status', async () => {
    const fetchImpl = jest.fn().mockResolvedValue(jsonResponse(502));

    const error = await failureOf(setUp(fetchImpl).request('/products'));

    expect(error).toEqual(
      expect.objectContaining({ code: 'server', detail: undefined })
    );
  });

  it('fails as network when the request gets no answer', async () => {
    const fetchImpl = jest.fn().mockRejectedValue(new TypeError('offline'));

    const error = await failureOf(setUp(fetchImpl).request('/products'));

    expect(error).toEqual(expect.objectContaining({ code: 'network' }));
  });
});
