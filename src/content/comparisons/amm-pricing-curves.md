---
title: "How Uniswap and Curve price a swap"
seoTitle: "Uniswap vs Curve: constant product vs StableSwap"
description: "Constant product, concentrated ranges, StableSwap and CryptoSwap compared: what each curve assumes about prices and where liquidity sits."
summary: "Uniswap v2 spreads liquidity over every price with a constant-product rule. Uniswap v3 and v4 let providers choose a range. Curve StableSwap blends constant sum with constant product for assets that should trade near one price, and CryptoSwap re-centers liquidity for assets that move. Each curve is a different assumption about where trades will happen."
status: "published"
published: "2026-10-26"
lastVerified: "2026-10-29"
changes:
  - date: "2026-10-29"
    summary: "Added Pendle’s yield-range AMM, which tightens toward maturity, as a fifth shape."
faq:
  - question: "Why does Curve give lower slippage than Uniswap v2 for stablecoins?"
    answer: "A constant-product pool spreads liquidity from price zero to infinity, and two dollar tokens do not need that. StableSwap's invariant sits between a constant sum, which has no slippage, and a constant product, which always has a price. Near equal balances and a high amplification coefficient it behaves like a constant sum, so a trade barely moves the price."
  - question: "Can I copy a Curve pool's A value into another pool?"
    answer: "Not safely. The amplification coefficient has a different scale in CryptoSwap, where an A of 10,000 corresponds to an A of 1 in StableSwap. A value tuned for stablecoins that should hold one price concentrates liquidity at a peg that volatile assets will not keep."
order: 2
protocols:
  - uniswap
  - curve
  - pendle
concepts:
  - automated-market-makers
  - constant-product
  - concentrated-liquidity
  - liquidity-pools
glossary:
  - constant-product
  - concentrated-liquidity
  - tick
  - stableswap
  - cryptoswap
  - amplification-coefficient
  - lp-share
tags:
  - amm
  - pricing
  - liquidity
sources:
  - title: "How Uniswap works"
    url: "https://developers.uniswap.org/docs/get-started/concepts/how-uniswap-works"
    kind: "docs"
    publisher: "Uniswap"
  - title: "UniswapV2Library.sol at 87edfdca"
    url: "https://github.com/Uniswap/v2-periphery/blob/87edfdcaf49ccc52591502993db4c8c08ea9eec0/contracts/libraries/UniswapV2Library.sol"
    kind: "code"
    publisher: "Uniswap"
  - title: "Concentrated liquidity"
    url: "https://developers.uniswap.org/docs/get-started/concepts/liquidity-providers/concentrated-liquidity"
    kind: "docs"
    publisher: "Uniswap"
  - title: "Uniswap v3 Core whitepaper"
    url: "https://uniswap.org/whitepaper-v3.pdf"
    kind: "whitepaper"
    publisher: "Uniswap"
  - title: "Understanding StableSwap"
    url: "https://docs.curve.finance/protocol/pool/understanding-stableswap"
    kind: "docs"
    publisher: "Curve"
  - title: "StableSwap mathematical derivations"
    url: "https://docs.curve.finance/developer/resources/derivations"
    kind: "docs"
    publisher: "Curve"
  - title: "Understanding CryptoSwap"
    url: "https://docs.curve.finance/protocol/pool/understanding-cryptoswap"
    kind: "docs"
    publisher: "Curve"
  - title: "Integrating Stableswap-NG"
    url: "https://docs.curve.finance/developer/integration/stableswap-ng"
    kind: "docs"
    publisher: "Curve"
---

Every automated market maker answers the same question: given the reserves, what does this trade cost? The answer is a curve, and each curve encodes an assumption about where prices will sit. This page compares the four curves that [Uniswap](/protocols/uniswap) and [Curve](/protocols/curve) use. It restates what those articles and the [constant product](/concepts/constant-product) and [concentrated liquidity](/concepts/concentrated-liquidity) concepts establish, so the sources behind each claim are there and in the list below.

## At a glance

| Curve | Where liquidity sits | Built for | What a trade does to the price |
| --- | --- | --- | --- |
| Constant product (Uniswap v2) | Every price from zero to infinity | Any pair, with no assumption about the price | Moves it along `x * y = k`; larger trades relative to the pool move it more |
| Concentrated liquidity (Uniswap v3, v4) | Only inside each provider’s chosen range | Pairs where trading stays in a known interval | Walks it across [ticks](/glossary/tick/), adding or removing liquidity at each boundary |
| StableSwap (Curve) | Densely around equal balances | Assets that should be worth nearly the same | Barely moves it near balance, sharply once one coin dominates |
| CryptoSwap (Curve) | Around an internal `price_scale` that the pool updates | Assets whose price should move | Costs more the further the trade is from that scale |

## Constant product: no assumption

The pool accepts any trade that does not shrink `x * y` after fees. The v2 flash-swap guide puts the fee at 0.30 percent on the input, applied by counting only 99.7 percent of the input toward the product check. The fee that stays in the reserves is the liquidity providers’ income.

A worked case from the [constant product](/concepts/constant-product) article: a pool of 100 ETH and 300,000 USDC quotes 3,000 USDC per ETH. Selling 1 ETH returns about 2,961.47 USDC, 1.28 percent below spot, and most of that gap is the curve. Selling 10 ETH returns an average of 2,719.83, 9.34 percent below spot, because the trade is a tenth of the ETH reserve. The curve charges for size. It has no opinion about the price.

## Concentrated liquidity: a range you choose

Uniswap’s concentrated-liquidity docs give the stablecoin example: if two dollar tokens trade between 0.99 and 1.01, almost all of a v2 pool’s capital sits elsewhere. v3 lets a provider deposit only in that interval. The whitepaper sets the price at tick `i` to `1.0001^i`, and a position is the liquidity between a lower and an upper tick. Pool liquidity is the sum of positions containing the current tick.

The curve is local. Each range acts like a constant-product curve between two prices, so “the pool’s `k`” is a v2 habit. When the price leaves a range, the position is entirely one token and earns no fees. The docs say plainly that this is not a liquidation. It is the inventory change itself. v4 inherits the range, so a hookless v4 pool is still a concentrated-liquidity pool.

## StableSwap: a blend

Curve’s derivations page writes the invariant between a constant sum and a constant product. A constant sum has no slippage and eventually runs out of one coin. A constant product always has a price but wastes depth. The amplification coefficient `A` sets the blend. The understanding-StableSwap page gives 500 to 10,000 as examples of high `A`: deep liquidity near the peg and a sharp drop if an asset leaves it.

That is the same trade Uniswap’s ranges make from the other side. A tight Uniswap range and a high-`A` StableSwap pool both concentrate depth near one price. A Uniswap provider chooses the range and manages it. A StableSwap pool bakes the concentration into the invariant.

## CryptoSwap: a center that moves

CryptoSwap replaces the constant amplification with a dynamic `K` built from a StableSwap-like invariant. Liquidity concentrates around a `price_scale` that the pool updates, and a trade away from it pays more slippage. The docs say a rebalance runs only after the internal price clears an adjustment step and the cost stays under half of the trading fees earned. With too little fee income the center can sit away from the market, which the same page documents as a failure mode.

## Pendle: a curve over a rate, not a price

[Pendle](/protocols/pendle) adapts an AMM design from Notional Finance for a pool of a principal token and a wrapped yield-bearing token. Liquidity is concentrated in a configured *yield range*, an implied-APY band, instead of a price band. The curve also changes with time: it shifts so the principal token’s price moves toward its underlying value as maturity approaches, which Pendle’s docs say mitigates the time-dependent part of impermanent loss and removes it at maturity. If the implied yield leaves the configured range, liquidity is too thin to push further. Yield tokens trade through flash swaps in the same pool. The shape suits an asset that must converge to a known value on a known date. A constant-product or StableSwap curve has no notion of a deadline. See [yield tokenization](/concepts/yield-tokenization).

## What a liquidity provider holds

The receipt differs by design. A v2 LP share claims a slice of the reserves. A v3 or v4 position is a range with its own liquidity, as the [liquidity pools](/concepts/liquidity-pools) article explains. In Stableswap-NG the pool contract and the LP token are the same contract. The token is a share of the pool’s liquidity accounted against `D`, not a voucher for the exact basket deposited. After a one-coin withdrawal from an imbalanced pool the invariant’s slippage applies.

## Mistakes the comparison prevents

- Talking about one `k` for a v3 or v4 pool. The rule is local to each range.
- Treating StableSwap as constant product with a different fee. The invariant is different. The fee is a separate parameter.
- Reusing an `A` across designs. Its scale differs between StableSwap and CryptoSwap.
- Pricing a position from “the pool price” without checking whether its liquidity is in range.
