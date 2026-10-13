---
title: "Constant-product pricing"
description: "How the x · y = k invariant sets a Uniswap v2 price, and where v3 and Curve stop using it uniformly."
summary: "Constant-product pricing keeps the product of two reserves from falling when a swap pays its fee. The spot price is the reserve ratio. The rule is uniform across all prices in v2, only inside a tick range in v3 and v4, and only the outer region of a Curve StableSwap pool."
status: "published"
published: "2026-10-13"
lastVerified: "2026-10-13"
order: 3
group: "markets"
tags:
  - pricing
  - uniswap
protocols:
  - uniswap
  - curve
glossary:
  - constant-product
  - tick
related:
  - automated-market-makers
  - concentrated-liquidity
  - liquidity-pools
sources:
  - title: "How Uniswap works"
    url: "https://docs.uniswap.org/contracts/v2/concepts/protocol-overview/how-uniswap-works"
    kind: "docs"
    publisher: "Uniswap"
  - title: "Using flash swaps"
    url: "https://docs.uniswap.org/contracts/v2/guides/smart-contract-integration/using-flash-swaps"
    kind: "docs"
    publisher: "Uniswap"
  - title: "Uniswap v3 Core whitepaper"
    url: "https://uniswap.org/whitepaper-v3.pdf"
    kind: "whitepaper"
    publisher: "Uniswap"
  - title: "StableSwap derivations"
    url: "https://docs.curve.finance/developer/resources/derivations"
    kind: "docs"
    publisher: "Curve"
---

Constant product means the pool agrees to any trade that does not shrink `x * y` after fees. `x` and `y` are the two reserves. Their product is `k`. The trader who wants more of `y` must leave more of `x`, and the last unit of `y` costs more than the first because the reserve of `y` is shrinking while the reserve of `x` is growing.

The spot price of `y` in units of `x` is `x / y` only as a marginal price, before a finite trade and before the fee. A real trade moves the reserves. The execution price is worse than the spot price by the impact along the curve, then worse again by the fee. Uniswap’s overview states the qualitative part: larger trades relative to the pool move the price more.

## The fee is inside the product check

The v2 flash-swap guide puts the fee at 0.30 percent on the input. The familiar quote multiplies the input by 997 and the reserve by 1000 so that only 99.7 percent of the input counts toward the product. The pool can therefore increase `k` slightly. It must not decrease `k` using the post-fee balances. That increase is the LP’s fee income, left in the reserves so that each LP token claims a larger inventory.

A sketch of the quote, with the rounding made obvious, is on the [Uniswap](/protocols/uniswap) page. The deployed pair does not trust the caller’s arithmetic. It measures token balances. If the product check fails, the swap reverts. There is no partial fill.

## Where the rule is local

v3 and v4 do not keep one `k` for the entire price line. The v3 whitepaper gives each range a liquidity `L` that acts like a product curve between two prices. Outside the range the position has no active liquidity. Talking about “the pool’s k” as a single number is a v2 habit.

Curve’s derivation mixes a constant-sum term with a product term. Near equal balances and with a high amplification coefficient, trades barely move the price, which is the constant-sum end. Far from balance, the product term is what still offers a price instead of letting the pool sell the last coin at one-for-one until it is gone. StableSwap is not “constant product with a different fee.” The fee is separate. The invariant is different. The picture on the [Curve](/protocols/curve) page is only a sketch of that bend.

## Rounding and the empty pool

Integer reserves round in favor of the pool when the implementation is careful. A quote that uses floating point will not match. A pool with zero of one reserve cannot sell that reserve at any finite price, because the product would require infinite input. v2’s library rejects empty reserves. A concentrated position that has been traded entirely into one asset is the same fact inside its range: there is nothing of the other asset left to buy until the price re-enters and the liquidity is active again.
