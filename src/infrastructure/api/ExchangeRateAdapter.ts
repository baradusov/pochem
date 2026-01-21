import { AVAILABLE_CURRENCIES, CurrencyCode, ExchangeRates } from '../../core/entities/Currency';
import { ExchangeRatePort } from '../../core/ports/ExchangeRatePort';

const API_URL = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/eur.json';

interface ApiResponse {
  date: string;
  eur: Record<string, number>;
}

export class ExchangeRateAdapter implements ExchangeRatePort {
  async fetchRates(base: CurrencyCode): Promise<ExchangeRates> {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`Failed to fetch rates: ${response.status}`);
    }

    const data: ApiResponse = await response.json();

    const rates: Record<CurrencyCode, number> = {} as Record<CurrencyCode, number>;

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
    };
  }
}
