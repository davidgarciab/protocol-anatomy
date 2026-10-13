---
title: "Concentrated liquidity"
description: "How Uniswap v3 and v4 confine LP capital to a tick range, and what happens when price leaves it."
summary: "Concentrated liquidity is constant-product inventory that is only active between two prices. The position earns fees inside the range and holds a single asset outside it. v3 represents the position as an NFT. v4 keeps the range and changes the position manager."
status: "published"
published: "2026-10-13"
lastVerified: "2026-10-13"
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
    url: "https://docs.uniswap.org/concepts/protocol/concentrated-liquidity"
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
    url: "https://docs.uniswap.org/contracts/v2/concepts/protocol-overview/how-uniswap-works"
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
---

Uniswap v2 forces every liquidity provider in a pair to cover every price. The concentrated-liquidity docs give the stablecoin example: if two dollar tokens trade between 0.99 and 1.01, almost all of a v2 pool’s capital is elsewhere. v3 lets the provider deposit only in that interval. The same capital then offers more depth where trades actually happen, and none where they do not.

v4’s architecture page says this capital-efficiency property is inherited. Hooks and the singleton do not replace the range. A hookless v4 pool is still a concentrated-liquidity pool.

## Ticks

The whitepaper sets the price at tick `i` to `1.0001^i`. One tick is one basis point. The contracts store the square root of that price as a Q64.96 number, which is what `TickMath.getSqrtRatioAtTick` returns. The published constants bound the tick at ±887272, corresponding to prices the fixed-point format can represent.

Pools do not initialize every tick. `tickSpacing` selects a grid. The whitepaper notes the trade: a finer grid is more precise, and each initialized tick a swap crosses costs gas. In v3, fee tiers and spacing are paired, so a cheap stablecoin pool can use a tight grid and a volatile pool can use a coarse one. In v4, tick spacing is its own field on the pool key, and a dynamic fee is a flag on that key rather than a tier that selects the grid.

A position is the liquidity between a lower and an upper tick on that grid. Current liquidity is the sum of positions that contain the current tick. When a swap crosses a tick, the pool adds or removes the liquidity stored at that boundary. The price does not jump over an empty region for free. It walks.

## Inside the range, the curve is familiar

For a fixed range, the virtual reserves follow a product curve that hits zero real balance of one token at each edge. Liquidity `L` is the scale of that curve, playing the role `k` played as a size parameter in v2. The amount of token0 between two square-root prices is `L` times the difference of their reciprocals. The amount of token1 is `L` times the difference of the square-root prices. The whitepaper and `SqrtPriceMath` are the source of those deltas. A blog primer is not required to use the idea, but it is required not to invent a third formula.

While the price is inside the range, the position earns a share of fees proportional to its `L` relative to other active liquidity. When the price leaves, the position is entirely token0 or entirely token1. Fee accrual stops. If the price returns, the position becomes active again without a new deposit. The docs are explicit that this single-asset outcome is normal, not a liquidation.

## What concentration costs

Capital efficiency is not free yield. The provider is leveraged to the chosen interval. A range that is wrong is a position that no longer earns and that may be entirely the asset which fell. A v2 LP in the same pair would still hold a mix. Managing a range is an extra strategy. The protocol does not rebalance it unless a v4 hook is written to do so, and that hook is someone else’s code.

The receipt differs by version, as the [LP share](/concepts/liquidity-pools) article says. The range does not. An integration that wants “the Uniswap price” still has to decide which pool, which fee tier, and whether the liquidity it is looking at is in range.
