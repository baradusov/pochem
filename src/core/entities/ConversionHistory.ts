import { CurrencyCode } from './Currency';

export interface ConversionHistoryEntry {
  id: string;
  timestamp: string;
  sourceCurrency: CurrencyCode;
  sourceAmount: number;
  currencies: CurrencyCode[];
  amounts: Record<CurrencyCode, number>;
}

export const MAX_HISTORY_ENTRIES = 10;
