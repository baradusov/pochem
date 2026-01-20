import { CurrencyCode, ExchangeRates } from '../entities/Currency';

export interface ExchangeRatePort {
  fetchRates(base: CurrencyCode): Promise<ExchangeRates>;
}
