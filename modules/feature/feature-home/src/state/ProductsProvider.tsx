import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import type { Product } from '../domain/product';
import type { ProductRepository } from '../domain/ProductRepository';

import type { ReactNode } from 'react';

export type ProductsStatus = 'loading' | 'ready' | 'error';

interface ProductsContextValue {
  status: ProductsStatus;
  products: Product[];
  reload: () => void;
  toggleFavorite: (productId: string) => void;
}

const ProductsContext = createContext<ProductsContextValue | null>(null);

interface ProductsProviderProps {
  repository: ProductRepository;
  children: ReactNode;
}

export function ProductsProvider({
  repository,
  children,
}: ProductsProviderProps) {
  const [status, setStatus] = useState<ProductsStatus>('loading');
  const [products, setProducts] = useState<Product[]>([]);
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    let isCancelled = false;

    repository
      .list()
      .then((loadedProducts) => {
        if (isCancelled) return;
        setProducts(loadedProducts);
        setStatus('ready');
      })
      .catch(() => {
        if (isCancelled) return;
        setStatus('error');
      });

    return () => {
      isCancelled = true;
    };
  }, [repository, reloadCount]);

  const reload = useCallback(() => {
    setStatus('loading');
    setReloadCount((count) => count + 1);
  }, []);

  // The star answers right away; if the repository rejects the change the
  // list is loaded again, so the screen never shows a state that was not saved.
  const toggleFavorite = useCallback(
    (productId: string) => {
      const product = products.find((candidate) => candidate.id === productId);
      if (!product) return;

      const isFavorite = !product.isFavorite;
      setProducts((current) =>
        current.map((candidate) =>
          candidate.id === productId ? { ...candidate, isFavorite } : candidate
        )
      );
      repository.setFavorite(productId, isFavorite).catch(reload);
    },
    [products, repository, reload]
  );

  const value = useMemo(
    () => ({ status, products, reload, toggleFavorite }),
    [status, products, reload, toggleFavorite]
  );

  return (
    <ProductsContext.Provider value={value}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts(): ProductsContextValue {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error('useProducts must be used inside a ProductsProvider');
  }
  return context;
}
