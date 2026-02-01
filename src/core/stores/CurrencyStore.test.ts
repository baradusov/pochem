import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CurrencyStore } from './CurrencyStore';
import { ExchangeRatePort } from '../ports/ExchangeRatePort';
import { StoragePort } from '../ports/StoragePort';
import { ExchangeRates } from '../entities/Currency';

const today = new Date().toISOString().split('T')[0];

const mockRates: ExchangeRates = {
  base: 'EUR',
  lastFetchedAt: today,
  rates: {
    EUR: 1,
    USD: 1.1,
    GEL: 3.0,
    RUB: 100,
    AED: 4.0,
    AMD: 430,
    ARS: 900,
    AUD: 1.6,
    AZN: 1.9,
    BDT: 120,
    BGN: 2.0,
    BRL: 5.5,
    BYN: 3.5,
    CAD: 1.5,
    CHF: 0.95,
    CLP: 1000,
    CNY: 7.8,
    COP: 4300,
    CZK: 25,
    DKK: 7.5,
    EGP: 34,
    GBP: 0.86,
    HKD: 8.5,
    HUF: 390,
    IDR: 17000,
    ILS: 4.0,
    INR: 92,
    JPY: 160,
    KGS: 98,
    KRW: 1450,
    KZT: 500,
    MDL: 19,
    MXN: 19,
    MYR: 5.1,
    NGN: 870,
    NOK: 11.5,
    NZD: 1.8,
    PEN: 4.1,
    PHP: 62,
    PKR: 305,
    PLN: 4.3,
    RON: 5.0,
    RSD: 117,
    SAR: 4.1,
    SEK: 11.3,
    SGD: 1.5,
    THB: 39,
    TRY: 32,
    TWD: 35,
    UAH: 41,
    UZS: 13500,
    VND: 27000,
    ZAR: 20,
  },
  updatedAt: new Date().toISOString().split('T')[0],
};

const createMockPorts = () => {
  const exchangeRatePort: ExchangeRatePort = {
    fetchRates: vi.fn().mockResolvedValue(mockRates),
  };

  const storagePort: StoragePort = {
    saveRates: vi.fn().mockResolvedValue(undefined),
    loadRates: vi.fn().mockResolvedValue(null),
    saveSelectedCurrencies: vi.fn().mockResolvedValue(undefined),
    loadSelectedCurrencies: vi.fn().mockResolvedValue(null),
    saveBlockCount: vi.fn().mockResolvedValue(undefined),
    loadBlockCount: vi.fn().mockResolvedValue(null),
  };

  return { exchangeRatePort, storagePort };
};

describe('CurrencyStore', () => {
  let store: CurrencyStore;
  let ports: ReturnType<typeof createMockPorts>;

  beforeEach(() => {
    ports = createMockPorts();
    store = new CurrencyStore(ports.exchangeRatePort, ports.storagePort);
  });

  describe('initialization', () => {
    it('loads rates on initialize', async () => {
      await store.initialize();

      expect(store.rates).toEqual(mockRates);
      expect(store.loading).toBe(false);
    });

    it('uses cached rates if valid', async () => {
      vi.mocked(ports.storagePort.loadRates).mockResolvedValue(mockRates);

      await store.initialize();

      expect(ports.exchangeRatePort.fetchRates).not.toHaveBeenCalled();
    });
  });

  describe('currency conversion', () => {
    beforeEach(async () => {
      await store.initialize();
    });

    it('converts input to other currencies', () => {
      store.selectCurrency('EUR');
      store.updateInput('100');

      expect(store.getAmount('USD')).toBeCloseTo(110);
      expect(store.getAmount('GEL')).toBeCloseTo(300);
      expect(store.getAmount('RUB')).toBeCloseTo(10000);
    });

    it('handles comma as decimal separator', () => {
      store.selectCurrency('EUR');
      store.updateInput('100,50');

      expect(store.getAmount('USD')).toBeCloseTo(110.55);
    });

    it('handles empty input', () => {
      store.updateInput('');

      expect(store.getAmount('USD')).toBe(0);
    });
  });

  describe('formatAmount', () => {
    beforeEach(async () => {
      await store.initialize();
    });

    it('formats numbers with spaces and comma', () => {
      store.selectCurrency('EUR');
      store.updateInput('1000');

      expect(store.formatAmount('RUB')).toBe('100 000,00');
    });

    it('returns input value for active currency', () => {
      store.selectCurrency('EUR');
      store.updateInput('123,45');

      expect(store.formatAmount('EUR')).toBe('123,45');
    });
  });

  describe('selectCurrency', () => {
    beforeEach(async () => {
      await store.initialize();
    });

    it('switches active currency and updates input', () => {
      store.selectCurrency('EUR');
      store.updateInput('100');
      store.selectCurrency('USD');

      expect(store.activeCurrency).toBe('USD');
      expect(store.inputValue).toBe('110,00');
    });
  });
});
