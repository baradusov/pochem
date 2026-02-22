import { describe, it, expect } from 'vitest';
import { evaluateExpression } from './expression';

describe('evaluateExpression', () => {
  it('returns 0 for empty string', () => {
    expect(evaluateExpression('')).toBe(0);
  });

  it('parses a single number', () => {
    expect(evaluateExpression('42')).toBe(42);
  });

  it('parses a decimal number with dot', () => {
    expect(evaluateExpression('3.14')).toBeCloseTo(3.14);
  });

  it('parses a decimal number with comma', () => {
    expect(evaluateExpression('3,14')).toBeCloseTo(3.14);
  });

  it('evaluates addition', () => {
    expect(evaluateExpression('10+5')).toBe(15);
  });

  it('evaluates subtraction', () => {
    expect(evaluateExpression('10-3')).toBe(7);
  });

  it('evaluates multiplication', () => {
    expect(evaluateExpression('4*5')).toBe(20);
  });

  it('evaluates division', () => {
    expect(evaluateExpression('20/4')).toBe(5);
  });

  it('respects operator precedence (multiplication before addition)', () => {
    expect(evaluateExpression('2+3*4')).toBe(14);
  });

  it('respects operator precedence (division before subtraction)', () => {
    expect(evaluateExpression('10-6/2')).toBe(7);
  });

  it('evaluates chained operations', () => {
    expect(evaluateExpression('250+10-25*10/2')).toBe(135);
  });

  it('evaluates decimal operations with comma', () => {
    expect(evaluateExpression('10,5+0,5')).toBeCloseTo(11);
  });

  it('handles trailing operator', () => {
    expect(evaluateExpression('100+')).toBe(100);
  });

  it('handles trailing operator with preceding expression', () => {
    expect(evaluateExpression('10+5*')).toBe(15);
  });

  it('returns 0 for division by zero', () => {
    expect(evaluateExpression('10/0')).toBe(0);
  });

  it('evaluates multiple same-precedence operations left to right', () => {
    expect(evaluateExpression('10-3-2')).toBe(5);
  });

  it('evaluates mixed precedence correctly', () => {
    expect(evaluateExpression('2+3*4-1')).toBe(13);
  });

  it('handles whitespace', () => {
    expect(evaluateExpression('10 + 5')).toBe(15);
  });

  it('handles large numbers', () => {
    expect(evaluateExpression('1000000*2')).toBe(2000000);
  });

  it('handles decimal result', () => {
    expect(evaluateExpression('10/3')).toBeCloseTo(3.3333, 3);
  });
});
