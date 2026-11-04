import Decimal from 'decimal.js';

export type DiscountType = 'PERCENT' | 'FIXED';

export const MONEY_SCALE = 2;

export function money(value: Decimal.Value): Decimal {
  return new Decimal(value);
}

/** HALF_UP to two decimals. Never use JavaScript floats for money. */
export function roundMoney(value: Decimal.Value): Decimal {
  return new Decimal(value).toDecimalPlaces(MONEY_SCALE, Decimal.ROUND_HALF_UP);
}

/** Converts an LBP amount to USD at the given rate, rounded HALF_UP. */
export function usdFromLbp(amountLbp: Decimal.Value, lbpPerUsd: Decimal.Value): Decimal {
  const rate = new Decimal(lbpPerUsd);
  if (rate.lte(0)) {
    throw new Error('lbpPerUsd must be positive');
  }
  return roundMoney(new Decimal(amountLbp).div(rate));
}

/**
 * USD value used by the ledger. USD amounts pass through; LBP amounts are
 * divided by the rate. The rate is stored on the row either way.
 */
export function usdFromAmount(
  amount: Decimal.Value,
  currency: 'USD' | 'LBP',
  lbpPerUsd: Decimal.Value,
): Decimal {
  if (currency === 'USD') {
    return roundMoney(amount);
  }
  return usdFromLbp(amount, lbpPerUsd);
}

/**
 * Applies an enrollment discount to a saved monthly price.
 * A fixed discount larger than the price produces 0, never a negative charge.
 * A percentage must be between 0 and 100.
 */
export function applyDiscount(
  price: Decimal.Value,
  type: DiscountType | null | undefined,
  value: Decimal.Value | null | undefined,
): Decimal {
  const base = new Decimal(price);

  if (type === null || type === undefined || value === null || value === undefined) {
    return roundMoney(base);
  }

  if (type === 'FIXED') {
    return roundMoney(Decimal.max(base.minus(new Decimal(value)), 0));
  }

  if (type === 'PERCENT') {
    const percent = new Decimal(value);
    if (percent.lt(0) || percent.gt(100)) {
      throw new Error('Percent discount must be between 0 and 100');
    }
    return roundMoney(Decimal.max(base.minus(base.times(percent).div(100)), 0));
  }

  throw new Error(`Unknown discount type: ${String(type)}`);
}

/** Serializes money for JSON responses without losing precision. */
export function moneyToString(value: Decimal): string {
  return roundMoney(value).toFixed(MONEY_SCALE);
}
