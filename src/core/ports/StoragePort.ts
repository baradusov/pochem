import { ExchangeRates } from '../entities/Currency';

export interface StoragePort {
  saveRates(rates: ExchangeRates): Promise<void>;
  loadRates(): Promise<ExchangeRates | null>;
}
