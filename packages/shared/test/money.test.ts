import Decimal from 'decimal.js';
import { describe, expect, it } from 'vitest';
import { applyDiscount, roundMoney, usdFromAmount, usdFromLbp } from '../src/money';

describe('roundMoney', () => {
  it('rounds HALF_UP to two decimals', () => {
    expect(roundMoney('1.005').toString()).toBe('1.01');
    expect(roundMoney('1.004').toString()).toBe('1');
    expect(roundMoney(new Decimal('2.675')).toString()).toBe('2.68');
  });
});

describe('usdFromLbp', () => {
  it('converts at the stored rate', () => {
    expect(usdFromLbp(895000, 89500).toString()).toBe('10');
    expect(usdFromLbp(100000, 89500).toString()).toBe('1.12');
  });

  it('rejects a non-positive rate', () => {
    expect(() => usdFromLbp(1000, 0)).toThrow('lbpPerUsd must be positive');
  });
});

describe('usdFromAmount', () => {
  it('passes USD through', () => {
    expect(usdFromAmount('12.345', 'USD', 89500).toString()).toBe('12.35');
  });

  it('converts LBP', () => {
    expect(usdFromAmount(179000, 'LBP', 89500).toString()).toBe('2');
  });
});

describe('applyDiscount', () => {
  it('returns the price when there is no discount', () => {
    expect(applyDiscount(24, null, null).toString()).toBe('24');
  });

  it('applies a percentage', () => {
    expect(applyDiscount(24, 'PERCENT', 10).toString()).toBe('21.6');
  });

  it('applies a fixed amount', () => {
    expect(applyDiscount(24, 'FIXED', 4).toString()).toBe('20');
  });

  it('clamps a fixed discount larger than the price at zero', () => {
    expect(applyDiscount(20, 'FIXED', 50).toString()).toBe('0');
  });

  it('rejects a percentage above 100', () => {
    expect(() => applyDiscount(20, 'PERCENT', 101)).toThrow('between 0 and 100');
  });
});
