/**
 * Arithmetic behind the article calculators. Real numbers, not the contracts' integer math,
 * so results differ from on-chain values in the last digits.
 */

export interface SwapQuote {
  amountOut: number;
  averagePrice: number;
  spotBefore: number;
  spotAfter: number;
  /** How far the average price is below the spot price, in percent. */
  priceGap: number;
  /** Growth of x * y after the swap, in percent. It is the fee left in the pool. */
  kGrowth: number;
}

/** Uniswap v2 `getAmountOut` with a fee in basis points (30 = the v2 0.30 percent). */
export function constantProductQuote(reserveIn: number, reserveOut: number, amountIn: number, feeBps: number): SwapQuote | null {
  if (!(reserveIn > 0 && reserveOut > 0 && amountIn > 0) || !(feeBps >= 0 && feeBps < 10_000)) return null;
  const amountInWithFee = amountIn * (10_000 - feeBps);
  const amountOut = (amountInWithFee * reserveOut) / (reserveIn * 10_000 + amountInWithFee);
  const spotBefore = reserveOut / reserveIn;
  const averagePrice = amountOut / amountIn;
  const newIn = reserveIn + amountIn;
  const newOut = reserveOut - amountOut;
  return {
    amountOut,
    averagePrice,
    spotBefore,
    spotAfter: newOut / newIn,
    priceGap: (1 - averagePrice / spotBefore) * 100,
    kGrowth: ((newIn * newOut) / (reserveIn * reserveOut) - 1) * 100,
  };
}

export interface HealthCheck {
  healthFactor: number;
  /** Collateral price at which the health factor reaches 1. */
  liquidationPrice: number;
  liquidatable: boolean;
  /** Share of the debt one liquidation may repay under the V3.3 rules, or 0 if not liquidatable. */
  closeFactor: number;
}

/** Aave V3 health factor for one collateral asset and one debt valued in the same base currency. */
export function healthCheck(collateralAmount: number, collateralPrice: number, thresholdPercent: number, debtValue: number): HealthCheck | null {
  if (!(collateralAmount > 0 && collateralPrice > 0 && debtValue > 0) || !(thresholdPercent > 0 && thresholdPercent <= 100)) {
    return null;
  }
  const threshold = thresholdPercent / 100;
  const collateralValue = collateralAmount * collateralPrice;
  const healthFactor = (collateralValue * threshold) / debtValue;
  const liquidatable = healthFactor < 1;
  // LiquidationLogic: half the debt only when HF > 0.95 and both sides are at least 2,000 base units.
  const halfOnly = healthFactor > 0.95 && collateralValue >= 2_000 && debtValue >= 2_000;
  return {
    healthFactor,
    liquidationPrice: debtValue / (collateralAmount * threshold),
    liquidatable,
    closeFactor: liquidatable ? (halfOnly ? 0.5 : 1) : 0,
  };
}

export const formatNumber = (value: number, digits = 2): string =>
  value.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });

export function closeFactorLabel(check: { liquidatable: boolean; closeFactor: number }): string {
  if (!check.liquidatable) return 'None (HF ≥ 1)';
  return check.closeFactor === 1 ? '100% of debt' : '50% of debt';
}
