export const AVAILABLE_CURRENCIES = [
  'AED', 'AMD', 'ARS', 'AUD', 'AZN', 'BDT', 'BGN', 'BRL', 'BYN', 'CAD',
  'CHF', 'CLP', 'CNY', 'COP', 'CZK', 'DKK', 'EGP', 'EUR', 'GBP', 'GEL',
  'HKD', 'HUF', 'IDR', 'ILS', 'INR', 'JPY', 'KGS', 'KRW', 'KZT', 'MDL',
  'MXN', 'MYR', 'NGN', 'NOK', 'NZD', 'PEN', 'PHP', 'PKR', 'PLN', 'RON',
  'RSD', 'RUB', 'SAR', 'SEK', 'SGD', 'THB', 'TRY', 'TWD', 'UAH', 'USD',
  'UZS', 'VND', 'ZAR',
] as const;

export type CurrencyCode = (typeof AVAILABLE_CURRENCIES)[number];

export const DEFAULT_CURRENCIES: CurrencyCode[] = ['GEL', 'RUB', 'EUR', 'USD'];

export interface ExchangeRates {
  base: CurrencyCode;
  rates: Record<CurrencyCode, number>;
  updatedAt: string;
}
