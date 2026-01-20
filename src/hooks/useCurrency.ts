import { createContext, useContext } from 'react';
import { CurrencyStore } from '../core/stores/CurrencyStore';

export const CurrencyStoreContext = createContext<CurrencyStore | null>(null);

export function useCurrency(): CurrencyStore {
  const store = useContext(CurrencyStoreContext);
  if (!store) {
    throw new Error('useCurrency must be used within CurrencyStoreContext.Provider');
  }
  return store;
}
