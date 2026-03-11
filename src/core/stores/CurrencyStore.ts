import { makeAutoObservable } from 'mobx';
import {
  ConversionHistoryEntry,
  MAX_HISTORY_ENTRIES,
} from '../entities/ConversionHistory';
import {
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
  cursorPosition: number = 1;
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

  private get displayLength(): number {
    return this.formatAmount(this.activeCurrency).length;
  }

  private setCursorPosition(position: number): void {
    this.cursorPosition = Math.max(0, Math.min(position, this.displayLength));
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
    return true;
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
      return this.inputValue || '0';
    }

    const amount = this.getAmount(currency);
    if (amount === 0 && this.inputValue === '') return '0';

    return formatNumber(amount);
  }

  async copyAmount(currency: CurrencyCode): Promise<void> {
    if (this.inputValue === '') return;
    const formatted = this.formatAmount(currency);
    await this.clipboardPort.copy(formatted.replace(/\s/g, ''));
  }

  selectCurrency(currency: CurrencyCode): void {
    if (currency === this.activeCurrency) return;

    const newAmount = this.getAmount(currency);
    this.setActiveCurrency(currency);
    const newValue = newAmount > 0 ? formatNumber(newAmount) : '';
    this.setInputValue(newValue);
    this.setCursorPosition(newValue.length);
  }

  private static readonly OPERATORS = ['+', '-', '*', '/'];

  private isOperator(ch: string): boolean {
    return CurrencyStore.OPERATORS.includes(ch);
  }

  moveCursor(position: number): void {
    this.setCursorPosition(position);
  }

  private recalculate(): void {
    const amount = this.parseInput(this.inputValue);
    this.setBaseAmountEUR(this.toEUR(amount, this.activeCurrency));
  }

  updateInput(value: string): void {
    const sanitized = value.replace(/[^0-9,\.+\-*/]/g, '');
    this.setInputValue(sanitized);
    if (this.cursorPosition > sanitized.length) {
      this.setCursorPosition(sanitized.length);
    }
    this.recalculate();
  }

  appendDigit(digit: string): void {
    const pos = this.cursorPosition;
    const before = this.inputValue.slice(0, pos);
    const after = this.inputValue.slice(pos);
    this.setInputValue(before + digit + after);
    this.setCursorPosition(pos + 1);
    this.recalculate();
  }

  appendOperator(operator: string): void {
    if (this.inputValue === '') return;

    const pos = this.cursorPosition;
    const charBefore = pos > 0 ? this.inputValue[pos - 1] : '';

    if (this.isOperator(charBefore)) {
      const before = this.inputValue.slice(0, pos - 1);
      const after = this.inputValue.slice(pos);
      this.setInputValue(before + operator + after);
    } else if (charBefore === ',') {
      return;
    } else {
      const before = this.inputValue.slice(0, pos);
      const after = this.inputValue.slice(pos);
      this.setInputValue(before + operator + after);
      this.setCursorPosition(pos + 1);
    }

    this.recalculate();
  }

  appendDecimal(): void {
    const pos = this.cursorPosition;

    let segmentStart = 0;
    for (let i = pos - 1; i >= 0; i--) {
      if (this.isOperator(this.inputValue[i])) {
        segmentStart = i + 1;
        break;
      }
    }

    let segmentEnd = this.inputValue.length;
    for (let i = pos; i < this.inputValue.length; i++) {
      if (this.isOperator(this.inputValue[i])) {
        segmentEnd = i;
        break;
      }
    }

    const segment = this.inputValue.slice(segmentStart, segmentEnd);
    if (segment.includes(',')) return;

    const charBefore = pos > 0 ? this.inputValue[pos - 1] : '';
    const before = this.inputValue.slice(0, pos);
    const after = this.inputValue.slice(pos);

    if (pos === 0 || this.isOperator(charBefore)) {
      this.setInputValue(before + '0,' + after);
      this.setCursorPosition(pos + 2);
    } else {
      this.setInputValue(before + ',' + after);
      this.setCursorPosition(pos + 1);
    }

    this.recalculate();
  }

  backspace(): void {
    if (this.cursorPosition === 0) return;
    const pos = this.cursorPosition;
    const before = this.inputValue.slice(0, pos - 1);
    const after = this.inputValue.slice(pos);
    this.setInputValue(before + after);
    this.setCursorPosition(pos - 1);
    this.recalculate();
  }

  clearInput(): void {
    this.setInputValue('');
    this.setCursorPosition(this.displayLength);
    this.recalculate();
  }

  evaluate(): void {
    const result = this.parseInput(this.inputValue);
    if (result === 0 && this.inputValue === '') return;
    const newValue = result === 0 ? '' : formatNumber(result);
    this.setInputValue(newValue);
    this.setCursorPosition(newValue.length);
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
    this.setCursorPosition(formattedAmount.length);
    this.setBaseAmountEUR(this.toEUR(entry.sourceAmount, entry.sourceCurrency));

    this.storagePort.saveSelectedCurrencies(entry.currencies);
  }
}
