---
title: "Constant-product pricing"
description: "How the x · y = k invariant sets a Uniswap v2 price, and where v3 and Curve stop using it uniformly."
summary: "Constant-product pricing keeps the product of two reserves from falling when a swap pays its fee. The spot price is the reserve ratio. The rule is uniform across all prices in v2, only inside a tick range in v3 and v4, and only the outer region of a Curve StableSwap pool."
status: "published"
published: "2026-10-13"
lastVerified: "2026-10-13"
changes:
  - date: "2026-10-14"
    summary: "Added a worked v2 swap with the fee split out, from `getAmountOut` in `UniswapV2Library.sol`, and a swap calculator."
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
  - title: "UniswapV2Library.sol at 87edfdca"
    url: "https://github.com/Uniswap/v2-periphery/blob/87edfdcaf49ccc52591502993db4c8c08ea9eec0/contracts/libraries/UniswapV2Library.sol"
    kind: "code"
    publisher: "Uniswap"
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

## A worked swap

Take a v2 pool that holds 100 ETH and 300,000 USDC, and ignore token decimals. The spot price is 300,000 / 100 = 3,000 USDC per ETH. A trader sends 1 ETH. `getAmountOut` in the v2 periphery library ([`UniswapV2Library.sol` at `87edfdca`](https://github.com/Uniswap/v2-periphery/blob/87edfdcaf49ccc52591502993db4c8c08ea9eec0/contracts/libraries/UniswapV2Library.sol), read on 14 October 2026) multiplies the input by 997 and the reserve by 1,000:

```text
Worked arithmetic for the example above, not contract code.

amountInWithFee = 1 × 997                               = 997
amountOut       = 997 × 300,000 / (100 × 1,000 + 997)
                = 299,100,000 / 100,997                 ≈ 2,961.47 USDC
```

The trader pays an average of 2,961.47 USDC per ETH, 1.28 percent below the 3,000 spot price. Without the fee the same trade would return 2,970.30 USDC, so about 0.99 percentage points of the gap is the curve and the rest is the fee. After the trade the pool holds 101 ETH and 297,038.53 USDC. The new spot price is 2,940.98, and the next buyer of ETH starts from there.

The product moved from 30,000,000 to about 30,000,891, up 0.003 percent. That growth is the 0.003 ETH of fee that the formula did not count toward the trade. It stays in the reserves and belongs to the LPs.

Size is what changes the picture. A 10 ETH input into the same pool returns 27,198.33 USDC, an average of 2,719.83: 9.34 percent below spot, of which the fee is still only a small part. The trade is a tenth of the ETH reserve, and the curve charges for that.

<diagram-placeholder name="swap-calculator"></diagram-placeholder>

## Where the rule is local

v3 and v4 do not keep one `k` for the entire price line. The v3 whitepaper gives each range a liquidity `L` that acts like a product curve between two prices. Outside the range the position has no active liquidity. Talking about “the pool’s k” as a single number is a v2 habit.

Curve’s derivation mixes a constant-sum term with a product term. Near equal balances and with a high amplification coefficient, trades barely move the price, which is the constant-sum end. Far from balance, the product term is what still offers a price instead of letting the pool sell the last coin at one-for-one until it is gone. StableSwap is not “constant product with a different fee.” The fee is separate. The invariant is different. The picture on the [Curve](/protocols/curve) page is only a sketch of that bend.

## Rounding and the empty pool

Integer reserves round in favor of the pool when the implementation is careful. A quote that uses floating point will not match. A pool with zero of one reserve cannot sell that reserve at any finite price, because the product would require infinite input. v2’s library rejects empty reserves. A concentrated position that has been traded entirely into one asset is the same fact inside its range: there is nothing of the other asset left to buy until the price re-enters and the liquidity is active again.
