import { CurrencyCode, ExchangeRates } from '../entities/Currency';

export interface StoragePort {
  saveRates(rates: ExchangeRates): Promise<void>;
  loadRates(): Promise<ExchangeRates | null>;
  saveSelectedCurrencies(currencies: CurrencyCode[]): Promise<void>;
  loadSelectedCurrencies(): Promise<CurrencyCode[] | null>;
}
