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
import {
  evaluateExpression,
  fromDisplayExpression,
  toDisplayExpression,
} from '../utils/expression';
import { formatNumber } from '../utils/format';
import { nearestPowerOfTen, stepNiceNumber } from '../utils/niceNumber';

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
  isEditing = false;
  private scrubOrigin: number | null = null;

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

  private setEditing(editing: boolean): void {
    this.isEditing = editing;
  }

  private setScrubOrigin(origin: number | null): void {
    this.scrubOrigin = origin;
  }

  get hasInput(): boolean {
    return this.inputValue !== '';
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
      return toDisplayExpression(this.inputValue) || '0';
    }

    const amount = this.getAmount(currency);
    if (amount === 0 && this.inputValue === '') return '0';

    return formatNumber(amount);
  }

  async copyAmount(currency: CurrencyCode): Promise<void> {
    if (!this.hasInput) return;
    const formatted = formatNumber(this.getAmount(currency));
    await this.clipboardPort.copy(formatted.replace(/\s/g, ''));
  }

  startEditing(currency: CurrencyCode): void {
    this.selectCurrency(currency);
    this.setEditing(true);
  }

  async finishEditing(): Promise<void> {
    this.evaluate();
    this.setEditing(false);
    await this.saveToHistory();
  }

  /**
   * Scrubbing: drag a number to walk through nice amounts (…, 300, 400, 500, …).
   * Starts from whatever the currency currently shows.
   */
  beginScrub(currency: CurrencyCode): void {
    const origin = this.getAmount(currency);

    this.setScrubOrigin(origin);
    this.setActiveCurrency(currency);
    this.applyAmount(origin);
  }

  scrub(steps: number): void {
    if (this.scrubOrigin === null) return;
    const unit = this.scrubUnit(this.activeCurrency);
    this.applyAmount(stepNiceNumber(this.scrubOrigin, steps, unit));
  }

  /**
   * Where scrubbing from zero starts: a round amount worth about 1 EUR,
   * so 1 USD but 100 RUB and 100 JPY — every currency moves at a useful pace.
   */
  private scrubUnit(currency: CurrencyCode): number {
    return nearestPowerOfTen(this.fromEUR(1, currency));
  }

  async endScrub(): Promise<void> {
    if (this.scrubOrigin === null) return;
    this.setScrubOrigin(null);
    await this.saveToHistory();
  }

  private applyAmount(amount: number): void {
    const value = amount > 0 ? formatNumber(amount) : '';
    this.setInputValue(value);
    this.setCursorPosition(value.length);
    this.recalculate();
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
    const sanitized = fromDisplayExpression(value).replace(
      /[^0-9,\.+\-*/]/g,
      ''
    );
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
    this.applyAmount(result);
  }

  /**
   * Puts `newCurrency` into slot `index`. If it is already selected
   * elsewhere, the two currencies swap places instead of duplicating.
   */
  async replaceCurrency(
    index: number,
    newCurrency: CurrencyCode
  ): Promise<void> {
    const updated = [...this.selectedCurrencies];
    const oldCurrency = updated[index];
    if (oldCurrency === newCurrency) return;

    const existingIndex = updated.indexOf(newCurrency);
    const isSwap = existingIndex !== -1;
    if (isSwap) {
      updated[existingIndex] = oldCurrency;
    }
    updated[index] = newCurrency;
    this.setSelectedCurrencies(updated);

    if (!isSwap && this.activeCurrency === oldCurrency) {
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

    const latest = this.conversionHistory[0];
    const isRepeat =
      latest !== undefined &&
      latest.sourceCurrency === this.activeCurrency &&
      latest.sourceAmount === sourceAmount &&
      latest.currencies.join() === this.visibleCurrencies.join();
    if (isRepeat) return;

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
