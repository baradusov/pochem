import {
  AVAILABLE_CURRENCIES,
  CurrencyCode,
  ExchangeRates,
} from '../../core/entities/Currency';
import { ExchangeRatePort } from '../../core/ports/ExchangeRatePort';

const TIMEOUT_MS = 5000;

const SOURCES = {
  jsdelivr:
    'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/eur.min.json',
  pagesDev: 'https://latest.currency-api.pages.dev/v1/currencies/eur.json',
  cbr: 'https://www.cbr-xml-daily.ru/daily_json.js',
} as const;

interface FawazahmedResponse {
  date: string;
  eur: Record<string, number>;
}

interface CbrResponse {
  Date: string;
  Valute: Record<
    string,
    {
      CharCode: string;
      Nominal: number;
      Value: number;
    }
  >;
}

export class ExchangeRateAdapter implements ExchangeRatePort {
  async fetchRates(base: CurrencyCode): Promise<ExchangeRates> {
    const errors: Error[] = [];

    const cacheBust = new Date().toISOString().split('T')[0];
    try {
      return await this.fetchFromFawazahmed(
        `${SOURCES.jsdelivr}?d=${cacheBust}`
      );
    } catch (e) {
      errors.push(e as Error);
    }

    try {
      return await this.fetchFromFawazahmed(SOURCES.pagesDev);
    } catch (e) {
      errors.push(e as Error);
    }

    try {
      return await this.fetchFromCbr();
    } catch (e) {
      errors.push(e as Error);
    }

    throw new Error(
      `All exchange rate sources failed: ${errors.map((e) => e.message).join('; ')}`
    );
  }

  private async fetchWithTimeout(url: string): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetch(url, { signal: controller.signal });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private async fetchFromFawazahmed(url: string): Promise<ExchangeRates> {
    const response = await this.fetchWithTimeout(url);
    const data: FawazahmedResponse = await response.json();

    const rates = {} as Record<CurrencyCode, number>;

    for (const currency of AVAILABLE_CURRENCIES) {
      const code = currency.toLowerCase();
      if (code === 'eur') {
        rates[currency] = 1;
      } else if (data.eur[code]) {
        rates[currency] = data.eur[code];
      }
    }

    return {
      base: 'EUR',
      rates,
      updatedAt: data.date,
      lastFetchedAt: new Date().toISOString().split('T')[0],
    };
  }

  private async fetchFromCbr(): Promise<ExchangeRates> {
    const response = await this.fetchWithTimeout(SOURCES.cbr);
    const data: CbrResponse = await response.json();

    // CBR rates are in RUB. We need EUR-based rates.
    const eurEntry = data.Valute['EUR'];
    if (!eurEntry) {
      throw new Error('CBR response missing EUR rate');
    }

    // eurInRub = how many RUB per 1 EUR
    const eurInRub = eurEntry.Value / eurEntry.Nominal;

    const rates = {} as Record<CurrencyCode, number>;

    rates['EUR'] = 1;
    rates['RUB'] = eurInRub;

    // CBR gives us: X RUB per <Nominal> units of <Currency>
    // We need: Y units of <Currency> per 1 EUR
    // Formula: rate_per_eur = eurInRub / (Value / Nominal)
    for (const currency of AVAILABLE_CURRENCIES) {
      if (currency === 'EUR' || currency === 'RUB') continue;

      const entry = data.Valute[currency];
      if (!entry) continue;

      const currencyInRub = entry.Value / entry.Nominal;
      rates[currency] = eurInRub / currencyInRub;
    }

    // CBR Date format: "2026-02-28T11:30:00+03:00" → extract date part
    const updatedAt = data.Date.split('T')[0];

    return {
      base: 'EUR',
      rates,
      updatedAt,
      lastFetchedAt: new Date().toISOString().split('T')[0],
    };
  }
}
