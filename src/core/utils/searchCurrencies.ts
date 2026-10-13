import {
  AVAILABLE_CURRENCIES,
  CURRENCY_INFO,
  CurrencyCode,
} from '../entities/Currency';

const normalize = (text: string): string =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // é → e, ё → е, й → и
    .replace(/ł/g, 'l') // not decomposable by NFD
    .trim();

const LATIN_KEYS = "qwertyuiop[]asdfghjkl;'zxcvbnm,.`";
const CYRILLIC_KEYS = 'йцукенгшщзхъфывапролджэячсмитьбюё';

/** Same keys on the other keyboard layout: "kfhb" ↔ "лари" */
const switchLayout = (text: string): string =>
  [...text]
    .map((ch) => {
      const latin = LATIN_KEYS.indexOf(ch);
      if (latin !== -1) return CYRILLIC_KEYS[latin];
      const cyrillic = CYRILLIC_KEYS.indexOf(ch);
      if (cyrillic !== -1) return LATIN_KEYS[cyrillic];
      return ch;
    })
    .join('');

const words = (text: string): string[] => normalize(text).split(/[\s-]+/);

enum Rank {
  ExactCode,
  CodePrefix,
  WordPrefix,
  Substring,
  None,
}

const rank = (currency: CurrencyCode, query: string): Rank => {
  const code = currency.toLowerCase();
  if (code === query) return Rank.ExactCode;
  if (code.startsWith(query)) return Rank.CodePrefix;

  const info = CURRENCY_INFO[currency];
  const texts = [info.name, info.nameRu, info.symbol, ...info.keywords];

  if (texts.some((text) => words(text).some((w) => w.startsWith(query)))) {
    return Rank.WordPrefix;
  }
  if (texts.some((text) => normalize(text).includes(query))) {
    return Rank.Substring;
  }
  return Rank.None;
};

const search = (query: string): CurrencyCode[] =>
  AVAILABLE_CURRENCIES.map((currency) => ({
    currency,
    rank: rank(currency, query),
  }))
    .filter(({ rank }) => rank !== Rank.None)
    .sort((a, b) => a.rank - b.rank)
    .map(({ currency }) => currency);

/**
 * Finds currencies by code, English or Russian name, symbol, country or city.
 * Best matches first: exact code, code prefix, word prefix, then substring.
 * Text typed in the wrong keyboard layout is matched too, after direct hits.
 */
export const searchCurrencies = (query: string): CurrencyCode[] => {
  const lowered = query.toLowerCase().trim();
  if (lowered === '') return [...AVAILABLE_CURRENCIES];

  const direct = search(normalize(lowered));
  const switched = search(normalize(switchLayout(lowered)));

  return [...new Set([...direct, ...switched])];
};
