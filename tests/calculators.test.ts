import { describe, expect, it } from 'vitest';
import { closeFactorLabel, constantProductQuote, healthCheck } from '../src/lib/calculators';

describe('constant-product calculator', () => {
  it('matches the worked swap in the constant-product article', () => {
    const quote = constantProductQuote(100, 300_000, 1, 30)!;
    expect(quote.amountOut).toBeCloseTo(2961.47, 2);
    expect(quote.priceGap).toBeCloseTo(1.28, 2);
    expect(quote.spotAfter).toBeCloseTo(2940.98, 2);
    expect(quote.kGrowth).toBeCloseTo(0.003, 3);
    expect(constantProductQuote(100, 300_000, 10, 30)!.amountOut).toBeCloseTo(27198.33, 2);
  });

  it('rejects inputs the v2 library would reject', () => {
    expect(constantProductQuote(0, 300_000, 1, 30)).toBeNull();
    expect(constantProductQuote(100, 300_000, 0, 30)).toBeNull();
    expect(constantProductQuote(100, 300_000, 1, 10_000)).toBeNull();
  });
});

describe('health-factor calculator', () => {
  it('matches the worked liquidation in the collateral article', () => {
    expect(healthCheck(10, 2_000, 80, 15_000)!.healthFactor).toBeCloseTo(1.0667, 4);
    const check = healthCheck(10, 1_850, 80, 15_000)!;
    expect(check.healthFactor).toBeCloseTo(0.9867, 4);
    expect(check.liquidationPrice).toBeCloseTo(1875, 6);
    expect(check.closeFactor).toBe(0.5);
  });

  it('allows the whole debt below 0.95 or below the 2,000 size threshold', () => {
    expect(healthCheck(10, 1_700, 80, 15_000)!.closeFactor).toBe(1);
    expect(healthCheck(1, 1_850, 80, 1_500)!.closeFactor).toBe(1);
    expect(closeFactorLabel(healthCheck(10, 3_000, 80, 15_000)!)).toBe('None (HF ≥ 1)');
  });
});
