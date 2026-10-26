---
title: "Concentrated liquidity"
seoTitle: "Concentrated liquidity: Uniswap v3 and v4 ticks"
description: "How a Uniswap v3 or v4 position holds token0, token1, or both as price moves through its tick range."
summary: "Concentrated liquidity is constant-product inventory that is only active between two prices. Below the range the position is token0. Above it, token1. Inside, both. Leaving the range stops fees. It is not a liquidation. v4 uses the same amount formulas and the opposite sign on the settled delta."
status: "published"
published: "2026-10-13"
lastVerified: "2026-10-26"
changes:
  - date: "2026-10-14"
    summary: "Added which tokens a position holds below, inside, and above its range, with excerpts from the v3 and v4 `SqrtPriceMath` and `LiquidityAmounts` libraries."
faq:
  - question: "Which tokens does a Uniswap v3 or v4 position hold at the current price?"
    answer: "It depends on three branches. At or below the lower price the position is entirely token0. Strictly inside the range it holds both tokens. At or above the upper price it is entirely token1."
    featured: true
  - question: "Is leaving the price range a liquidation?"
    answer: "No. Fee accrual stops and the position is entirely one token, but nothing in the amount functions seizes the position or charges a penalty. If the price returns, the position becomes active again without a new deposit."
  - question: "How do v3 and v4 differ in the sign of the liquidity amounts?"
    answer: "In the v3 file a positive liquidity delta returns a positive token amount, rounded up, which the user pays. In v4, adding liquidity returns a negative delta, still using the round-up path, and a negative v4 delta means the caller owes the pool. Reading a v4 delta with v3’s sign convention gets it backwards."
order: 4
group: "markets"
tags:
  - uniswap
  - ticks
protocols:
  - uniswap
glossary:
  - concentrated-liquidity
  - tick
  - lp-share
related:
  - constant-product
  - liquidity-pools
  - automated-market-makers
sources:
  - title: "Concentrated liquidity"
    url: "https://developers.uniswap.org/docs/get-started/concepts/liquidity-providers/concentrated-liquidity"
    kind: "docs"
    publisher: "Uniswap"
  - title: "Uniswap v3 Core whitepaper"
    url: "https://uniswap.org/whitepaper-v3.pdf"
    kind: "whitepaper"
    publisher: "Uniswap"
  - title: "TickMath.sol"
    url: "https://github.com/Uniswap/v3-core/blob/d8b1c635c275d2a9450bd6a78f3fa2484fef73eb/contracts/libraries/TickMath.sol"
    kind: "code"
    publisher: "Uniswap"
  - title: "How Uniswap works"
    url: "https://developers.uniswap.org/docs/get-started/concepts/how-uniswap-works"
    kind: "docs"
    publisher: "Uniswap"
  - title: "Uniswap v4 architecture"
    url: "https://developers.uniswap.org/docs/protocols/v4/concepts/architecture"
    kind: "docs"
    publisher: "Uniswap"
  - title: "PoolKey.sol"
    url: "https://github.com/Uniswap/v4-core/blob/main/src/types/PoolKey.sol"
    kind: "code"
    publisher: "Uniswap"
  - title: "SqrtPriceMath.sol at c5ccf4d2"
    url: "https://github.com/Uniswap/v3-core/blob/c5ccf4d28a73fde90f0bb9ea3fd299d7d2bcdf83/contracts/libraries/SqrtPriceMath.sol"
    kind: "code"
    publisher: "Uniswap"
  - title: "v3 LiquidityAmounts.sol at b6b88556"
    url: "https://github.com/Uniswap/v3-periphery/blob/b6b885569786a319d853acc610ed03884fda9bee/contracts/libraries/LiquidityAmounts.sol"
    kind: "code"
    publisher: "Uniswap"
  - title: "v4 SqrtPriceMath.sol at 0f17b65a"
    url: "https://github.com/Uniswap/v4-core/blob/0f17b65aa61edee384d5129b7ea080f22905faa0/src/libraries/SqrtPriceMath.sol"
    kind: "code"
    publisher: "Uniswap"
  - title: "v4 LiquidityAmounts.sol at 6601a199"
    url: "https://github.com/Uniswap/v4-periphery/blob/6601a199799294378f4df9819e6641b2391ef3c5/src/libraries/LiquidityAmounts.sol"
    kind: "code"
    publisher: "Uniswap"
---

Uniswap v2 forces every liquidity provider in a pair to cover every price. The concentrated-liquidity docs give the stablecoin example: if two dollar tokens trade between 0.99 and 1.01, almost all of a v2 pool’s capital is elsewhere. v3 lets the provider deposit only in that interval. The same capital then offers more depth where trades actually happen, and none where they do not.

v4’s architecture page says this capital-efficiency property is inherited. Hooks and the singleton do not replace the range. A hookless v4 pool is still a concentrated-liquidity pool.

## Ticks

The whitepaper sets the price at tick `i` to `1.0001^i`. One tick is one basis point. The contracts store the square root of that price as a Q64.96 number, which is what `TickMath.getSqrtRatioAtTick` returns. The published constants bound the tick at ±887272, corresponding to prices the fixed-point format can represent.

Pools do not initialize every tick. `tickSpacing` selects a grid. The whitepaper notes the trade: a finer grid is more precise, and each initialized tick a swap crosses costs gas. In v3, fee tiers and spacing are paired, so a cheap stablecoin pool can use a tight grid and a volatile pool can use a coarse one. In v4, tick spacing is its own field on the pool key, and a dynamic fee is a flag on that key rather than a tier that selects the grid.

A position is the liquidity between a lower and an upper tick on that grid. Current liquidity is the sum of positions that contain the current tick. When a swap crosses a tick, the pool adds or removes the liquidity stored at that boundary. The price does not jump over an empty region for free. It walks.

## Which tokens the position holds

The question is not “how much liquidity did the provider deposit.” It is “which tokens does that liquidity represent at this price.”

<diagram-placeholder name="range-holdings"></diagram-placeholder>

v3 periphery `LiquidityAmounts.getAmountsForLiquidity`, at commit `b6b88556`, answers it with three branches. Let the current square-root price be `sqrtPrice`, and the position’s boundaries be `sqrtLower` and `sqrtUpper`, ordered so the lower price comes first.

- If `sqrtPrice` is at or below `sqrtLower`, the position is entirely token0. The amount is the token0 delta between the two boundaries. Token1 is zero.
- If `sqrtPrice` is strictly inside the range, token0 is the delta from the current price up to `sqrtUpper`, and token1 is the delta from `sqrtLower` up to the current price.
- If `sqrtPrice` is at or above `sqrtUpper`, the position is entirely token1, measured between the two boundaries. Token0 is zero.

v4 periphery `LiquidityAmounts.getLiquidityForAmounts`, at commit `6601a199`, uses the same three branches in the other direction: given token amounts, how much liquidity they buy. Inside the range it credits the smaller of the liquidity implied by the token0 amount and the liquidity implied by the token1 amount. That file does not also contain `getAmountsForLiquidity`. The amount of a token between two square-root prices lives in core `SqrtPriceMath`.

The library comments, in v3 core at `c5ccf4d2` and in v4 core at `0f17b65a`, state the real-number shape. Token0 between two square-root prices is `liquidity / sqrt(lower) - liquidity / sqrt(upper)`. Token1 is `liquidity * (sqrt(upper) - sqrt(lower))`. The contracts evaluate those expressions in Q64.96 fixed point. They are not floating-point formulas, and the comments are the specification of the shape rather than a permission to drop the rounding.

```solidity
// Source excerpt: v3 SqrtPriceMath.getAmount0Delta at c5ccf4d28a73fde90f0bb9ea3fd299d7d2bcdf83
// @dev Calculates liquidity / sqrt(lower) - liquidity / sqrt(upper),
// i.e. liquidity * (sqrt(upper) - sqrt(lower)) / (sqrt(upper) * sqrt(lower))
```

```solidity
// Source excerpt: the same file, getAmount1Delta
// @dev Calculates liquidity * (sqrt(upper) - sqrt(lower))
```

The signed helpers decide who pays. In the v3 file, a positive liquidity delta returns a positive token amount, rounded up. A negative liquidity delta returns a negative amount, rounded down. Adding liquidity therefore costs the rounded-up token amount, and removing it pays the rounded-down amount. In the v4 file at `0f17b65a`, the signs are the other way around: adding liquidity returns a negative delta, still using the round-up path, and removing liquidity returns a positive delta, rounded down. A negative v4 delta means the caller owes the pool. Copying a v3 “positive means the user pays” check onto a v4 delta will invert the payment.

These amount functions were read on 14 October 2026. The whitepaper, tick bounds, and architecture sources already on this page were read on 13 October 2026.

While the price is inside the range, the position earns a share of fees proportional to its liquidity relative to other active liquidity. When the price leaves, the position is entirely token0 or entirely token1, as the branches above say. Fee accrual stops. If the price returns, the position becomes active again without a new deposit. The docs are explicit that this single-asset outcome is normal, not a liquidation. Nothing in the amount functions seizes the position or charges a penalty for being out of range. The loss, if the price moved against the provider, is the inventory change itself.

## What concentration costs

Capital efficiency is not free yield. The provider is leveraged to the chosen interval. A range that is wrong is a position that no longer earns and that may be entirely the asset which fell. A v2 LP in the same pair would still hold a mix. Managing a range is an extra strategy. The protocol does not rebalance it unless a v4 hook is written to do so, and that hook is someone else’s code.

The receipt differs by version, as the [LP share](/concepts/liquidity-pools) article says. The range does not. An integration that wants “the Uniswap price” still has to decide which pool, which fee tier, and whether the liquidity it is looking at is in range.
