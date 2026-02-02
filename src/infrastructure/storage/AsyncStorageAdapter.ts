import AsyncStorage from '@react-native-async-storage/async-storage';
import { ConversionHistoryEntry } from '../../core/entities/ConversionHistory';
import { CurrencyCode, ExchangeRates } from '../../core/entities/Currency';
import { StoragePort } from '../../core/ports/StoragePort';

const RATES_KEY = 'exchange_rates';
const SELECTED_CURRENCIES_KEY = 'selected_currencies';
const BLOCK_COUNT_KEY = 'block_count';
const CONVERSION_HISTORY_KEY = 'conversion_history';

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

  async saveSelectedCurrencies(currencies: CurrencyCode[]): Promise<void> {
    await AsyncStorage.setItem(
      SELECTED_CURRENCIES_KEY,
      JSON.stringify(currencies)
    );
  }

  async loadSelectedCurrencies(): Promise<CurrencyCode[] | null> {
    const data = await AsyncStorage.getItem(SELECTED_CURRENCIES_KEY);
    if (!data) return null;

    try {
      return JSON.parse(data) as CurrencyCode[];
    } catch {
      return null;
    }
  }

  async saveBlockCount(count: number): Promise<void> {
    await AsyncStorage.setItem(BLOCK_COUNT_KEY, String(count));
  }

  async loadBlockCount(): Promise<number | null> {
    const data = await AsyncStorage.getItem(BLOCK_COUNT_KEY);
    if (!data) return null;
    const count = parseInt(data, 10);
    return isNaN(count) ? null : count;
  }

  async saveConversionHistory(
    entries: ConversionHistoryEntry[]
  ): Promise<void> {
    await AsyncStorage.setItem(CONVERSION_HISTORY_KEY, JSON.stringify(entries));
  }

  async loadConversionHistory(): Promise<ConversionHistoryEntry[]> {
    const data = await AsyncStorage.getItem(CONVERSION_HISTORY_KEY);
    if (!data) return [];

    try {
      return JSON.parse(data) as ConversionHistoryEntry[];
    } catch {
      return [];
    }
  }
}
