import { createApiProductRepository } from '../apiProductRepository';

import type { ApiClient } from 'api-client';

const createApiClientReturning = (response: unknown) => {
  const request = jest.fn().mockResolvedValue(response);
  return { apiClient: { request } as ApiClient, request };
};

describe('createApiProductRepository', () => {
  it('lists the products of the backend response', async () => {
    const { apiClient, request } = createApiClientReturning({
      products: [
        {
          productId: 'a1',
          name: 'Milk',
          quantity: 2,
          unit: 'L',
          category: 'dairy',
          expirationDate: '2026-12-01',
        },
      ],
    });

    const products = await createApiProductRepository(apiClient).list();

    expect(request).toHaveBeenCalledWith('/products');
    expect(products).toEqual([
      {
        id: 'a1',
        name: 'Milk',
        category: 'dairy',
        quantity: { kind: 'measure', amount: 2, unit: 'l' },
        expirationDate: '2026-12-01',
        isFavorite: false,
      },
    ]);
  });

  it('lists nothing for an empty inventory', async () => {
    const { apiClient } = createApiClientReturning({ products: [] });

    expect(await createApiProductRepository(apiClient).list()).toEqual([]);
  });

  it('creates a product with a POST and returns it mapped', async () => {
    const { apiClient, request } = createApiClientReturning({
      productId: 'b2',
      name: 'Rice',
      quantity: 2,
      unit: 'units',
      category: 'food',
      expirationDate: '2027-01-31',
    });

    const product = await createApiProductRepository(apiClient).create({
      name: 'Rice',
      category: 'food',
      quantity: { kind: 'units', count: 2 },
      expirationDate: '2027-01-31',
    });

    expect(request).toHaveBeenCalledWith('/products', {
      method: 'POST',
      body: {
        name: 'Rice',
        category: 'food',
        expirationDate: '2027-01-31',
        quantity: 2,
        unit: 'units',
      },
    });
    expect(product).toEqual(
      expect.objectContaining({ id: 'b2', name: 'Rice', isFavorite: false })
    );
  });

  it('rejects when the request fails', async () => {
    const apiClient = {
      request: jest.fn().mockRejectedValue(new Error('offline')),
    } as unknown as ApiClient;

    await expect(createApiProductRepository(apiClient).list()).rejects.toThrow(
      'offline'
    );
  });

  it('rejects a favorite change because the backend cannot store it', async () => {
    const { apiClient } = createApiClientReturning({ products: [] });

    await expect(
      createApiProductRepository(apiClient).setFavorite('a1', true)
    ).rejects.toThrow();
  });
});
