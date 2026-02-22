import { makeAutoObservable } from 'mobx';
import {
  ConversionHistoryEntry,
  MAX_HISTORY_ENTRIES,
} from '../entities/ConversionHistory';
import {
  AVAILABLE_CURRENCIES,
  CurrencyCode,
  DEFAULT_CURRENCIES,
  ExchangeRates,
} from '../entities/Currency';
import { ClipboardPort } from '../ports/ClipboardPort';
import { ExchangeRatePort } from '../ports/ExchangeRatePort';
import { StoragePort } from '../ports/StoragePort';
import { evaluateExpression } from '../utils/expression';
import { formatNumber } from '../utils/format';

export class CurrencyStore {
  rates: ExchangeRates | null = null;
  selectedCurrencies: CurrencyCode[] = [...DEFAULT_CURRENCIES];
  blockCount: number = 4;
  activeCurrency: CurrencyCode = 'GEL';
  inputValue: string = '';
  baseAmountEUR: number = 0;
  loading = true;
  refreshing = false;
  conversionHistory: ConversionHistoryEntry[] = [];

  constructor(
    private exchangeRatePort: ExchangeRatePort,
    private storagePort: StoragePort,
    private clipboardPort: ClipboardPort
  ) {
    makeAutoObservable(this);
  }

  private setRates(rates: ExchangeRates | null): void {
    this.rates = rates;
  }

  private setLoading(loading: boolean): void {
    this.loading = loading;
  }

  private setRefreshing(refreshing: boolean): void {
    this.refreshing = refreshing;
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

  private setBlockCountValue(count: number): void {
    this.blockCount = count;
  }

  private setConversionHistory(entries: ConversionHistoryEntry[]): void {
    this.conversionHistory = entries;
  }

  get visibleCurrencies(): CurrencyCode[] {
    return this.selectedCurrencies.slice(0, this.blockCount);
  }

  private isCacheValid(rates: ExchangeRates): boolean {
    const today = new Date().toISOString().split('T')[0];
    if (rates.lastFetchedAt !== today) return false;
    if (rates.updatedAt < rates.lastFetchedAt) return false;

    const hasAllCurrencies = AVAILABLE_CURRENCIES.every(
      (currency) => currency in rates.rates
    );
    return hasAllCurrencies;
  }

  private parseInput(value: string): number {
    return evaluateExpression(value);
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

    return formatNumber(amount);
  }

  async copyAmount(currency: CurrencyCode): Promise<void> {
    const formatted = this.formatAmount(currency);
    if (!formatted) return;
    await this.clipboardPort.copy(formatted.replace(/\s/g, ''));
  }

  selectCurrency(currency: CurrencyCode): void {
    if (currency === this.activeCurrency) return;

    const newAmount = this.getAmount(currency);
    this.setActiveCurrency(currency);
    this.setInputValue(newAmount > 0 ? formatNumber(newAmount) : '');
  }

  private static readonly OPERATORS = ['+', '-', '*', '/'];

  private isOperator(ch: string): boolean {
    return CurrencyStore.OPERATORS.includes(ch);
  }

  private lastChar(): string {
    return this.inputValue[this.inputValue.length - 1] ?? '';
  }

  private recalculate(): void {
    const amount = this.parseInput(this.inputValue);
    this.setBaseAmountEUR(this.toEUR(amount, this.activeCurrency));
  }

  updateInput(value: string): void {
    const sanitized = value.replace(/[^0-9,\.+\-*/]/g, '');
    this.setInputValue(sanitized);
    this.recalculate();
  }

  appendDigit(digit: string): void {
    this.setInputValue(this.inputValue + digit);
    this.recalculate();
  }

  appendOperator(operator: string): void {
    if (this.inputValue === '') return;

    if (this.isOperator(this.lastChar())) {
      this.setInputValue(this.inputValue.slice(0, -1) + operator);
    } else if (this.lastChar() === ',') {
      return;
    } else {
      this.setInputValue(this.inputValue + operator);
    }

    this.recalculate();
  }

  appendDecimal(): void {
    let lastNumberStart = 0;
    for (let i = this.inputValue.length - 1; i >= 0; i--) {
      if (this.isOperator(this.inputValue[i])) {
        lastNumberStart = i + 1;
        break;
      }
    }
    const currentNumber = this.inputValue.slice(lastNumberStart);

    if (currentNumber.includes(',')) return;

    if (this.inputValue === '' || this.isOperator(this.lastChar())) {
      this.setInputValue(this.inputValue + '0,');
    } else {
      this.setInputValue(this.inputValue + ',');
    }

    this.recalculate();
  }

  backspace(): void {
    if (this.inputValue.length === 0) return;
    this.setInputValue(this.inputValue.slice(0, -1));
    this.recalculate();
  }

  clearInput(): void {
    this.setInputValue('');
    this.recalculate();
  }

  evaluate(): void {
    const result = this.parseInput(this.inputValue);
    if (result === 0 && this.inputValue === '') return;
    this.setInputValue(result === 0 ? '' : formatNumber(result));
    this.recalculate();
  }

  async replaceCurrency(
    index: number,
    newCurrency: CurrencyCode
  ): Promise<void> {
    const updated = [...this.selectedCurrencies];
    const oldCurrency = updated[index];
    updated[index] = newCurrency;
    this.setSelectedCurrencies(updated);

    if (this.activeCurrency === oldCurrency) {
      this.setActiveCurrency(newCurrency);
      const amount = this.parseInput(this.inputValue);
      this.setBaseAmountEUR(this.toEUR(amount, newCurrency));
    }

    await this.storagePort.saveSelectedCurrencies(updated);
  }

  async updateBlockCount(count: number): Promise<void> {
    this.setBlockCountValue(count);
    await this.storagePort.saveBlockCount(count);
  }

  async initialize(): Promise<void> {
    this.setLoading(true);

    const [cached, savedCurrencies, savedBlockCount, savedHistory] =
      await Promise.all([
        this.storagePort.loadRates(),
        this.storagePort.loadSelectedCurrencies(),
        this.storagePort.loadBlockCount(),
        this.storagePort.loadConversionHistory(),
      ]);

    this.setConversionHistory(savedHistory);

    if (savedCurrencies) {
      this.setSelectedCurrencies(savedCurrencies);
      this.setActiveCurrency(savedCurrencies[0]);
    }

    if (savedBlockCount) {
      this.setBlockCountValue(savedBlockCount);
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

  async refreshIfStale(): Promise<void> {
    if (this.refreshing) return;
    if (this.rates && this.isCacheValid(this.rates)) return;

    await this.refreshRates();
  }

  async refreshRates(): Promise<void> {
    if (this.refreshing) return;

    this.setRefreshing(true);

    try {
      const fresh = await this.exchangeRatePort.fetchRates('EUR');
      this.setRates(fresh);
      await this.storagePort.saveRates(fresh);
    } finally {
      this.setRefreshing(false);
    }
  }

  async saveToHistory(): Promise<void> {
    const sourceAmount = this.parseInput(this.inputValue);
    if (sourceAmount === 0) return;

    const amounts: Record<CurrencyCode, number> = {} as Record<
      CurrencyCode,
      number
    >;

    for (const currency of this.visibleCurrencies) {
      amounts[currency] = this.getAmount(currency);
    }

    const entry: ConversionHistoryEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      sourceCurrency: this.activeCurrency,
      sourceAmount,
      currencies: [...this.visibleCurrencies],
      amounts,
    };

    const updated = [entry, ...this.conversionHistory].slice(
      0,
      MAX_HISTORY_ENTRIES
    );
    this.setConversionHistory(updated);
    await this.storagePort.saveConversionHistory(updated);
  }

  restoreFromHistory(entry: ConversionHistoryEntry): void {
    this.setSelectedCurrencies(entry.currencies);
    this.setActiveCurrency(entry.sourceCurrency);

    const formattedAmount = formatNumber(entry.sourceAmount);
    this.setInputValue(formattedAmount);
    this.setBaseAmountEUR(this.toEUR(entry.sourceAmount, entry.sourceCurrency));

    this.storagePort.saveSelectedCurrencies(entry.currencies);
  }
}
