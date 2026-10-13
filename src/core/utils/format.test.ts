import { describe, it, expect } from 'vitest';
import { formatDay, formatNumber } from './format';

describe('formatNumber', () => {
  it('groups thousands with spaces and uses a decimal comma', () => {
    expect(formatNumber(1234567.891)).toBe('1 234 567,89');
  });

  it('drops ",00" for whole amounts', () => {
    expect(formatNumber(202)).toBe('202');
    expect(formatNumber(99.999)).toBe('100');
  });
});

describe('formatDay', () => {
  const now = new Date(2026, 9, 9, 15, 0);

  it('says Today and Yesterday', () => {
    expect(formatDay('2026-10-09', now)).toBe('Today');
    expect(formatDay('2026-10-08', now)).toBe('Yesterday');
  });

  it('omits the year for dates in the current year', () => {
    expect(formatDay('2026-10-03', now)).toBe('October 3');
  });

  it('includes the year for older dates', () => {
    expect(formatDay('2025-12-31', now)).toBe('December 31, 2025');
  });
});
