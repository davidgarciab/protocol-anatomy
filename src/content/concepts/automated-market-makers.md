---
title: "Automated market makers"
seoTitle: "Automated market makers: Uniswap and Curve"
description: "What an AMM prices, which state it stores, and how Uniswap and Curve implement different invariants."
summary: "An automated market maker prices a swap from the assets already in a pool. There is no order to match. Uniswap’s constant product and Curve’s StableSwap are two invariants on that idea, with different shapes and different LP claims."
status: "published"
published: "2026-10-13"
lastVerified: "2026-10-13"
order: 1
group: "markets"
tags:
  - amm
  - trading
protocols:
  - uniswap
  - curve
glossary:
  - liquidity-pool
  - constant-product
  - stableswap
related:
  - constant-product
  - liquidity-pools
  - concentrated-liquidity
sources:
  - title: "How Uniswap works"
    url: "https://docs.uniswap.org/contracts/v2/concepts/protocol-overview/how-uniswap-works"
    kind: "docs"
    publisher: "Uniswap"
  - title: "Understanding swaps"
    url: "https://docs.uniswap.org/concepts/protocol/swaps"
    kind: "docs"
    publisher: "Uniswap"
  - title: "Understanding StableSwap"
    url: "https://docs.curve.finance/protocol/pool/understanding-stableswap"
    kind: "docs"
    publisher: "Curve"
  - title: "StableSwap whitepaper"
    url: "https://docs.curve.finance/pdf/whitepapers/whitepaper_stableswap.pdf"
    kind: "whitepaper"
    publisher: "Curve"
---

An automated market maker is a contract that offers a price from its own balances. The trader does not post a bid and wait for a seller. The pool sells from inventory, and the formula decides how much inventory the next unit costs.

That is the whole departure from an order book. Uniswap’s overview says it directly: the pool replaces discrete orders, and the price moves as reserves move. Curve’s StableSwap whitepaper starts from the same object and then refuses Uniswap’s uniform curve for assets that should share a price.

## State

A pool stores balances, a fee, and enough extra data to evaluate its invariant. For Uniswap v2 the extra data is small: the two reserves and the LP-token supply. For Uniswap v3 it includes the current square-root price, the active liquidity, and the ticks where liquidity turns on or off. For Curve StableSwap it includes the amplification coefficient and, in current NG pools, a rate for coins whose unit is not the raw balance.

None of that state is a list of resting orders. A “price” read from the pool is the marginal price of the invariant at the current balances. It is not a quote someone is obliged to refresh.

## What a swap does

The trader adds one asset and removes another. The contract checks that the invariant still holds after the fee. If it does not, the transaction reverts. Uniswap’s swap guide separates that protocol check from the user’s minimum-output check. The invariant will happily trade at a worse price. The user’s limit is what stops it.

Price impact is the movement along the curve during the trade. Slippage, in the same guide’s wording, is the movement that happens while the transaction is waiting. They are different errors. A large trade has impact even in an empty mempool. A small trade can fail its limit because someone else’s trade landed first.

## Two shapes, not one AMM

[Constant product](/concepts/constant-product) spends liquidity across all prices. That is the right complaint Curve makes about using it for stablecoins, and the wrong complaint to make about a volatile pair that might trade anywhere. [StableSwap](/glossary/stableswap/) spends liquidity near a peg and becomes more product-like when the pool is imbalanced. [Concentrated liquidity](/concepts/concentrated-liquidity) lets each Uniswap v3 or v4 provider choose the interval instead of hard-coding the peg into the invariant.

Calling all three “an AMM” is fine. Calling them the same curve is not. The [Curve](/protocols/curve) and [Uniswap](/protocols/uniswap) pages keep the formulas with the protocols that published them.

## What the AMM does not know

The pool does not know the off-chain price, except where a designer adds an oracle or a price scale on purpose. Curve’s oracle and ERC-4626 asset types are such additions. Aave’s collateral pricing is not an AMM at all. Using a pool’s spot price as the only collateral oracle imports the pool’s manipulability: a large swap is a temporary price. That is an [oracle](/concepts/oracles-and-dependencies) decision sitting on top of the invariant.
