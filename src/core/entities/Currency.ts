export type CurrencyCode = 'GEL' | 'RUB' | 'EUR' | 'USD';

export const CURRENCIES: CurrencyCode[] = ['GEL', 'RUB', 'EUR', 'USD'];

export interface ExchangeRates {
  base: CurrencyCode;
  rates: Record<CurrencyCode, number>;
  updatedAt: string;
}
