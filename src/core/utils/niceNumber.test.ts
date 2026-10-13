import { describe, it, expect } from 'vitest';
import { nearestPowerOfTen, stepNiceNumber } from './niceNumber';

describe('stepNiceNumber', () => {
  it('returns start when no steps', () => {
    expect(stepNiceNumber(327.29, 0)).toBe(327.29);
  });

  it('snaps up to the next nice number from an off-ladder value', () => {
    expect(stepNiceNumber(327.29, 1)).toBe(400);
  });

  it('snaps down to the previous nice number from an off-ladder value', () => {
    expect(stepNiceNumber(327.29, -1)).toBe(300);
  });

  it('walks the ladder from a nice number', () => {
    expect(stepNiceNumber(10, 1)).toBe(15);
    expect(stepNiceNumber(10, 2)).toBe(20);
    expect(stepNiceNumber(10, -1)).toBe(9);
  });

  it('crosses decades', () => {
    expect(stepNiceNumber(90, 1)).toBe(100);
    expect(stepNiceNumber(100, -1)).toBe(90);
    expect(stepNiceNumber(1, 11)).toBe(10);
  });

  it('handles fractional decades without float noise', () => {
    expect(stepNiceNumber(1, -1)).toBe(0.9);
    expect(stepNiceNumber(0.2, -1)).toBe(0.15);
  });

  it('never goes below 0.1', () => {
    expect(stepNiceNumber(1, -100)).toBe(0.1);
  });

  it('starts from 1 when scrubbing up from zero', () => {
    expect(stepNiceNumber(0, 1)).toBe(1);
    expect(stepNiceNumber(0, 2)).toBe(1.5);
  });

  it('starts from the given unit when scrubbing up from zero', () => {
    expect(stepNiceNumber(0, 1, 100)).toBe(100);
    expect(stepNiceNumber(0, 2, 100)).toBe(150);
    expect(stepNiceNumber(0, 12, 100)).toBe(1000);
  });

  it('stays at zero when scrubbing down from zero', () => {
    expect(stepNiceNumber(0, -3)).toBe(0);
  });
});

describe('nearestPowerOfTen', () => {
  it('rounds to the nearest power of ten on a log scale', () => {
    expect(nearestPowerOfTen(3)).toBe(1);
    expect(nearestPowerOfTen(95)).toBe(100);
    expect(nearestPowerOfTen(1450)).toBe(1000);
    expect(nearestPowerOfTen(27000)).toBe(10000);
  });

  it('falls back to 1 for non-positive values', () => {
    expect(nearestPowerOfTen(0)).toBe(1);
  });
});
