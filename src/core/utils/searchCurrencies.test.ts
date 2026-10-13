import { describe, it, expect } from 'vitest';
import { AVAILABLE_CURRENCIES } from '../entities/Currency';
import { searchCurrencies } from './searchCurrencies';

describe('searchCurrencies', () => {
  it('returns all currencies for an empty query', () => {
    expect(searchCurrencies('  ')).toEqual([...AVAILABLE_CURRENCIES]);
  });

  it('finds by code, case-insensitive', () => {
    expect(searchCurrencies('gel')[0]).toBe('GEL');
  });

  it('puts exact code match before code prefixes', () => {
    expect(searchCurrencies('try')[0]).toBe('TRY');
  });

  it('puts code prefixes before name matches', () => {
    const results = searchCurrencies('ge');
    expect(results[0]).toBe('GEL');
  });

  it('finds by English name', () => {
    expect(searchCurrencies('lari')).toEqual(['GEL']);
  });

  it('finds by Russian name', () => {
    expect(searchCurrencies('лари')).toEqual(['GEL']);
  });

  it('finds by country in Russian', () => {
    expect(searchCurrencies('грузия')).toEqual(['GEL']);
  });

  it('finds by city', () => {
    expect(searchCurrencies('бали')).toEqual(['IDR']);
  });

  it('finds by symbol', () => {
    expect(searchCurrencies('₾')).toEqual(['GEL']);
  });

  it('ignores diacritics', () => {
    expect(searchCurrencies('zloty')).toEqual(['PLN']);
  });

  it('treats ё and е the same', () => {
    expect(searchCurrencies('кишинев')).toEqual(['MDL']);
  });

  it('finds all currencies sharing a word', () => {
    const results = searchCurrencies('рубль');
    expect(results).toContain('RUB');
    expect(results).toContain('BYN');
  });

  it('understands Russian typed on the Latin layout', () => {
    expect(searchCurrencies('kfhb')).toEqual(['GEL']);
  });

  it('understands Latin typed on the Russian layout', () => {
    expect(searchCurrencies('ПУД')).toEqual(['GEL']);
    expect(searchCurrencies('вщдд')).toContain('USD');
  });

  it('puts direct matches before wrong-layout matches', () => {
    // "tu" → Turkish directly, "ег" (Египет) via the other layout
    const results = searchCurrencies('tu');
    expect(results.indexOf('TRY')).toBeLessThan(results.indexOf('EGP'));
  });

  it('returns nothing when nothing matches', () => {
    expect(searchCurrencies('qqq')).toEqual([]);
  });
});
