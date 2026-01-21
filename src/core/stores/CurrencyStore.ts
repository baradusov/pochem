import { makeAutoObservable } from 'mobx';
import { AVAILABLE_CURRENCIES, CurrencyCode, DEFAULT_CURRENCIES, ExchangeRates } from '../entities/Currency';
import { ExchangeRatePort } from '../ports/ExchangeRatePort';
import { StoragePort } from '../ports/StoragePort';

export class CurrencyStore {
  rates: ExchangeRates | null = null;
  selectedCurrencies: CurrencyCode[] = [...DEFAULT_CURRENCIES];
  activeCurrency: CurrencyCode = 'GEL';
  inputValue: string = '';
  baseAmountEUR: number = 0;
  loading = true;

  constructor(
    private exchangeRatePort: ExchangeRatePort,
    private storagePort: StoragePort
  ) {
    makeAutoObservable(this);
  }

  private setRates(rates: ExchangeRates | null): void {
    this.rates = rates;
  }

  private setLoading(loading: boolean): void {
    this.loading = loading;
  }

  private setActiveCurrency(currency: CurrencyCode): void {
    this.activeCurrency = currency;
  }

  private setInputValue(value: string): void {
    this.inputValue = value;
  }

  private setBaseAmountEUR(amount: number): void {
    this.baseAmountEUR = amount;
  }

  private setSelectedCurrencies(currencies: CurrencyCode[]): void {
    this.selectedCurrencies = currencies;
  }

  private isCacheValid(rates: ExchangeRates): boolean {
    const today = new Date().toISOString().split('T')[0];
    if (rates.updatedAt !== today) return false;

    const hasAllCurrencies = AVAILABLE_CURRENCIES.every(
      (currency) => currency in rates.rates
    );
    return hasAllCurrencies;
  }

  private parseInput(value: string): number {
    const normalized = value.replace(/\s/g, '').replace(',', '.');
    const parsed = parseFloat(normalized);
    return isNaN(parsed) ? 0 : parsed;
  }

  private toEUR(amount: number, fromCurrency: CurrencyCode): number {
    if (!this.rates) return 0;
    const rate = this.rates.rates[fromCurrency];
    if (!rate) return 0;
    return amount / rate;
  }

  private fromEUR(eurAmount: number, toCurrency: CurrencyCode): number {
    if (!this.rates) return 0;
    const rate = this.rates.rates[toCurrency];
    if (!rate) return 0;
    return eurAmount * rate;
  }

  getAmount(currency: CurrencyCode): number {
    return this.fromEUR(this.baseAmountEUR, currency);
  }

  formatAmount(currency: CurrencyCode): string {
    if (currency === this.activeCurrency) {
      return this.inputValue;
    }

    const amount = this.getAmount(currency);
    if (amount === 0 && this.inputValue === '') return '';

    return this.formatNumber(amount);
  }

  private formatNumber(num: number): string {
    const fixed = num.toFixed(2);
    const [intPart, decPart] = fixed.split('.');
    const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return `${formattedInt},${decPart}`;
  }

  selectCurrency(currency: CurrencyCode): void {
    if (currency === this.activeCurrency) return;

    const newAmount = this.getAmount(currency);
    this.setActiveCurrency(currency);
    this.setInputValue(newAmount > 0 ? this.formatNumber(newAmount) : '');
  }

  updateInput(value: string): void {
    const sanitized = value.replace(/[^0-9,\.]/g, '');
    this.setInputValue(sanitized);

    const amount = this.parseInput(sanitized);
    this.setBaseAmountEUR(this.toEUR(amount, this.activeCurrency));
  }

  async replaceCurrency(index: number, newCurrency: CurrencyCode): Promise<void> {
    const updated = [...this.selectedCurrencies];
    const oldCurrency = updated[index];
    updated[index] = newCurrency;
    this.setSelectedCurrencies(updated);

    if (this.activeCurrency === oldCurrency) {
      this.setActiveCurrency(newCurrency);
    }

    await this.storagePort.saveSelectedCurrencies(updated);
  }

  async initialize(): Promise<void> {
    this.setLoading(true);

    const [cached, savedCurrencies] = await Promise.all([
      this.storagePort.loadRates(),
      this.storagePort.loadSelectedCurrencies(),
    ]);

    if (savedCurrencies) {
      this.setSelectedCurrencies(savedCurrencies);
      this.setActiveCurrency(savedCurrencies[0]);
    }

    if (cached) {
      this.setRates(cached);

      if (this.isCacheValid(cached)) {
        this.setLoading(false);
        return;
      }
    }

    try {
      const fresh = await this.exchangeRatePort.fetchRates('EUR');
      this.setRates(fresh);
      this.setLoading(false);
      await this.storagePort.saveRates(fresh);
    } catch {
      this.setLoading(false);
    }
  }
}
