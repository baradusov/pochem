import AsyncStorage from '@react-native-async-storage/async-storage';
import { ExchangeRates } from '../../core/entities/Currency';
import { StoragePort } from '../../core/ports/StoragePort';

const RATES_KEY = 'exchange_rates';

export class AsyncStorageAdapter implements StoragePort {
  async saveRates(rates: ExchangeRates): Promise<void> {
    await AsyncStorage.setItem(RATES_KEY, JSON.stringify(rates));
  }

  async loadRates(): Promise<ExchangeRates | null> {
    const data = await AsyncStorage.getItem(RATES_KEY);
    if (!data) return null;

    try {
      return JSON.parse(data) as ExchangeRates;
    } catch {
      return null;
    }
  }
}
