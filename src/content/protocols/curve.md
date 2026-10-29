---
title: "Curve Finance"
seoTitle: "How Curve works: StableSwap, CryptoSwap, NG pools"
description: "How Curve prices pegged assets with StableSwap, volatile assets with CryptoSwap, and LP claims in Stableswap-NG."
summary: "Curve runs separate AMMs for pegged assets, volatile assets, and markets priced elsewhere. StableSwap flattens the price near a peg. CryptoSwap concentrates liquidity around a moving scale. FXSwap recenters that kind of curve with a refuel budget. Stableswap-NG is the pegged-pool factory."
status: "published"
published: "2026-10-13"
lastVerified: "2026-10-29"
changes:
  - date: "2026-10-29"
    summary: "Added veCRV, gauges and the boost formula, and the July 2023 Vyper compiler incident that affected several Curve pools."
faq:
  - question: "Why does Curve StableSwap give low slippage near the peg?"
    answer: "Its invariant sits between a constant sum, which has no slippage, and a constant product, which always has a price. With balances near equal and a large amplification coefficient `A`, the curve behaves like a constant sum, so a trade barely moves the price. When one coin dominates, the product term dominates and the price moves sharply."
    featured: true
  - question: "What does a Curve liquidity provider hold?"
    answer: "In Stableswap-NG the pool contract and the LP token are the same contract. The LP token is a share of the pool’s liquidity, accounted against the invariant `D`, not a voucher for the exact basket deposited. After an imbalance, a balanced withdrawal returns the current mix."
  - question: "Is crvUSD a Curve pool?"
    answer: "No. crvUSD is a stablecoin minted against approved collateral. Its mechanism is LLAMMA, an AMM that converts collateral toward the stablecoin as the collateral price falls, which makes liquidation soft instead of a single auction at a liquidation ratio. It is not a StableSwap pool."
  - question: "Can I reuse a StableSwap amplification value in a CryptoSwap pool?"
    answer: "No, the scales differ. The understanding-CryptoSwap page says an `A` of 10,000 in CryptoSwap corresponds to an `A` of 1 in StableSwap, so copying a stablecoin pool’s `A` into a tricrypto pool uses the wrong scale."
order: 4
category: "Automated market maker"
mechanism: "StableSwap and CryptoSwap invariants, with LP tokens minted against pool liquidity rather than a constant-product share."
versionContext: "Stableswap-NG is the documented factory for pegged pools. CryptoSwap and FXSwap are separate AMM families. crvUSD is a collateralized stablecoin that uses LLAMMA, not a StableSwap pool."
tags:
  - stableswap
  - amm
  - liquidity
concepts:
  - automated-market-makers
  - constant-product
  - liquidity-pools
  - stablecoin-mechanisms
guides:
  - curve-generations
glossary:
  - stableswap
  - amplification-coefficient
  - cryptoswap
  - fxswap
  - metapool
  - lp-share
versions:
  - name: "StableSwap"
    status: "active"
    note: "The pegged-asset invariant. Stableswap-NG is the current factory form documented for integrators."
  - name: "CryptoSwap"
    status: "active"
    note: "A separate invariant for volatile pairs, with amplification and gamma around an internal price scale."
  - name: "FXSwap"
    status: "active"
    note: "A two-asset pool for externally priced markets. StableSwap-style pricing, with refuels that pay for recentering."
  - name: "crvUSD"
    status: "active"
    note: "A lending-and-mint system beside the AMMs. Controller blueprints are versioned, and existing markets keep the blueprint they were deployed with."
sources:
  - title: "What is veCRV?"
    url: "https://docs.curve.finance/user/vecrv/what-is-vecrv"
    kind: "docs"
    publisher: "Curve"
  - title: "Boosting CRV rewards"
    url: "https://docs.curve.finance/user/vecrv/boosting"
    kind: "docs"
    publisher: "Curve"
  - title: "Vyper incident post-mortem"
    url: "https://hackmd.io/@vyperlang/HJUgNMhs2"
    kind: "security"
    publisher: "Vyper"
  - title: "Understanding StableSwap"
    url: "https://docs.curve.finance/protocol/pool/understanding-stableswap"
    kind: "docs"
    publisher: "Curve"
  - title: "StableSwap mathematical derivations"
    url: "https://docs.curve.finance/developer/resources/derivations"
    kind: "docs"
    publisher: "Curve"
  - title: "StableSwap whitepaper"
    url: "https://docs.curve.finance/pdf/whitepapers/whitepaper_stableswap.pdf"
    kind: "whitepaper"
    publisher: "Curve"
  - title: "Understanding CryptoSwap"
    url: "https://docs.curve.finance/protocol/pool/understanding-cryptoswap"
    kind: "docs"
    publisher: "Curve"
  - title: "Understanding FXSwap"
    url: "https://docs.curve.finance/protocol/pool/understanding-fxswap"
    kind: "docs"
    publisher: "Curve"
  - title: "CryptoSwap whitepaper"
    url: "https://docs.curve.finance/assets/files/whitepaper_cryptoswap-de196d8f95aae3164a1226234d6d96ca.pdf"
    kind: "whitepaper"
    publisher: "Curve"
  - title: "Integrating Stableswap-NG"
    url: "https://docs.curve.finance/developer/integration/stableswap-ng"
    kind: "docs"
    publisher: "Curve"
  - title: "CurveStableSwapFactoryNG.vy"
    url: "https://github.com/curvefi/stableswap-ng/blob/main/contracts/main/CurveStableSwapFactoryNG.vy"
    kind: "code"
    publisher: "Curve"
  - title: "LLAMMA explainer"
    url: "https://docs.curve.finance/developer/crvusd/llamma-explainer"
    kind: "docs"
    publisher: "Curve"
  - title: "crvUSD overview"
    url: "https://docs.curve.finance/developer/crvusd/overview/"
    kind: "docs"
    publisher: "Curve"
---

Curve is an AMM project with more than one invariant. The one it is known for, StableSwap, prices assets that are supposed to be worth nearly the same thing: two dollar stablecoins, or an ETH derivative and ETH. A second design, CryptoSwap, prices assets that move. A third system, crvUSD, mints a stablecoin against collateral and is not a StableSwap pool at all. Treating “Curve” as a single constant-product exchange misses all three.

The [generation guide](/guides/curve-generations) separates the factory eras. This page is the mechanism.

## Why constant product is the wrong default for a peg

A [constant-product](/concepts/constant-product) pool spreads liquidity from price zero to infinity. Two assets that should both be worth a dollar do not need that. Traders want depth at one. The StableSwap whitepaper builds an invariant between a constant sum, which has no slippage and eventually runs out of one coin, and a constant product, which always has a price but wastes depth.

The derivations page writes the invariant as:

```text
A * n^n * Σ x_i + D = A * D * n^n + D^(n+1) / (n^n * Π x_i)
```

`x_i` is the balance of coin `i`, scaled into the pool’s math. `n` is the number of coins. `D` is the invariant, equal to the total balance when every coin is equal. `A` is the [amplification coefficient](/glossary/amplification-coefficient/).

When balances are near equal and `A` is large, the curve behaves like a constant sum: a trade barely moves the price. When one coin dominates, the product term dominates and the price can move sharply, which is what gives arbitrage a reason to return the pool toward the peg. The understanding-StableSwap page describes high `A` (it gives 500 to 10,000 as examples) as deep liquidity near the peg and a sharp drop if an asset leaves the peg. Lower `A` spreads liquidity and moves the price earlier. Those ranges are illustrations of the shape, not a recommendation for a new pool.

<diagram-placeholder name="curve-shapes"></diagram-placeholder>

StableSwap is a poor fit for assets that are not meant to share a price. The same page says so and points volatile pairs at CryptoSwap. A high `A` on a volatile pair concentrates liquidity at a peg the assets will not keep.

## What a liquidity provider actually holds

In Stableswap-NG, the [integration guide](https://docs.curve.finance/developer/integration/stableswap-ng) and the factory overview say the pool contract and the LP token are the same contract. A deposit mints LP tokens. A withdrawal burns them. The LP token is a share of the pool’s liquidity, accounted against `D`, not a voucher for the exact basket deposited. If the pool is imbalanced, the coins you withdraw in a balanced removal are the current mix, and a one-coin withdrawal moves the price and pays the invariant’s slippage.

The NG factory deploys plain pools of up to eight coins and metapools. A [metapool](/glossary/metapool/) pairs one coin with the LP token of a base pool, so a swap can reach the base pool’s coins without merging their reserves into one contract.

Each coin has an asset type. The factory source documents four:

| Id | Name | Rate |
| --- | --- | --- |
| 0 | Standard | No extra rate. The unit is the token balance. |
| 1 | Oracle | An external rate, used for tokens such as wrapped staked ETH. |
| 2 | Rebasing | The balance itself changes, as with stETH. |
| 3 | ERC-4626 | `convertToAssets` supplies the exchange rate. |

The pool can therefore hold a rebasing token or a vault token without pretending every ERC-20 has a static balance. That rate is an input. If the oracle or `convertToAssets` is wrong, the invariant will still clear trades against the wrong value. The [oracle](/concepts/oracles-and-dependencies) page is the general version of that dependency.

NG pools are deployed from a factory implementation index. The integration docs say a pool keeps the implementation it was deployed with when the factory later adds a new one. “The NG factory” is not a single bytecode frozen for every pool address.

Fees are pool parameters. The deploy documentation describes an off-peg fee multiplier that can raise the fee when the pool is away from balance. This page does not quote a universal admin-fee percentage. That cut is configuration.

## CryptoSwap

CryptoSwap is for assets whose price should move. The whitepaper starts from a StableSwap-like invariant and replaces the constant amplification with a dynamic `K`:

```text
K0 = Π x_i * n^n / D^n
K = A * K0 * γ^2 / (γ + 1 - K0)^2
```

`A` still concentrates liquidity. The understanding-CryptoSwap page says an `A` of 10,000 in CryptoSwap corresponds to an `A` of 1 in StableSwap. Copying a stablecoin pool’s `A` into a tricrypto pool uses the wrong scale.

`gamma` (γ) changes how the curve leaves the concentrated region. On 13 October 2026 that same page said two different things about the direction. One sentence says higher gamma pulls more liquidity in around the center. Later sentences say higher gamma spreads liquidity wider, and the parameterization note says a higher gamma with a lower `A` spreads liquidity across a wider range. Those instructions disagree. The linked CryptoSwap whitepaper is a PDF whose text did not extract reliably here, so this page does not pick a direction from the paper. Read the pool’s stored gamma against the formula above, and treat the prose page as unsettled until those sentences match.

The internal price is a `price_scale` the pool updates. Liquidity concentrates around that scale. A trade away from it pays more slippage, which is the point: the pool is not offering v2-style depth at every price, and it is not offering StableSwap’s peg. The same page says a rebalance runs only after the internal price clears an adjustment step and the cost stays under half of the trading fees earned. If fees are too small, the center of liquidity can sit away from the market. That stuck state is a documented CryptoSwap failure mode.

## FXSwap

[FXSwap](/glossary/fxswap/) is a third pool family, for a market whose price is discovered somewhere else: the understanding-FXSwap page gives fiat pairs and an externally priced BTC pair as the examples. It prices with a StableSwap-style invariant so the depth stays concentrated, and it recenters that concentration with a profit buffer plus an explicit refuel budget. The page says refuels pay for the pool’s normal recentering. They do not set the price, and they do not guarantee the pool stays balanced. The page also says FXSwap is generally not the tool for primary price discovery. It is not a CryptoSwap deployment with a new ticker, and it is not a Stableswap-NG metapool.

## crvUSD is not a pool type

The [crvUSD overview](https://docs.curve.finance/developer/crvusd/overview/) describes a stablecoin minted against approved collateral. The monetary mechanism is LLAMMA, an AMM that converts collateral toward the stablecoin as the collateral price falls, instead of a single auction at a liquidation ratio. Soft liquidation is a different idea from Aave’s `liquidationCall` or Maker’s `grab`.

The same page versions the controller and AMM blueprints. V3 is described as the current blueprint on the controller factory. Existing markets keep the blueprint they were deployed with; setting a new implementation does not rewrite them. The overview lists markets on V1, V2, and V3. LlamaLend is a related lending deployment and is not the same contract family as a Stableswap-NG pool.

Savings crvUSD (`scrvUSD`) is described there as a yield-bearing wrapper that takes a portion of borrower interest. It is another tokenized claim, not the StableSwap LP token.

## CRV, veCRV and gauges

The pool invariants above say nothing about who gets paid to provide liquidity. Curve's incentive layer is separate and has its own vocabulary.

Holders lock CRV for between one week and four years and receive **veCRV**, computed as CRV locked times years remaining divided by four. Locking one CRV for four years gives one veCRV, and for one year gives 0.25. The balance decays linearly toward the unlock date and is not transferable. Each address has one active lock, which can be topped up or extended. The Curve docs give veCRV three uses: a share of protocol fees, a boost on CRV rewards, and voting power in the DAO, including the **gauge weight votes** that direct CRV emissions between pools.

A **gauge** is the contract where a pool's LP tokens are staked to earn CRV. A pool becomes eligible for emissions when a DAO vote adds its gauge to the gauge controller, and gauge weights decide how much CRV each receives. The boost is the way veCRV reaches liquidity providers. The docs give it as `B = min(2.5, 1 + 1.5 × (your veCRV / total veCRV) / (your deposit / gauge total))`, between 1x and 2.5x. A provider with a small deposit in a large gauge and a large share of veCRV gets close to the maximum. A provider with none gets 1x. The page adds that the boost updates when a deposit, a withdrawal or a claim touches the gauge.

Three reading notes. The invariant and the emissions are independent: gauge weights change a pool's CRV income, not its prices. A reported pool yield often includes boosted CRV, so a provider without veCRV should expect the low end of a range. And lock-based influence is concentrated by design, since four-year locks cost liquidity. The same mechanism appears in other protocols' governance, and [Pendle's move from vePENDLE to sPENDLE](/protocols/pendle) is a case of a protocol dropping it.

## When the compiler was the bug: July 2023

In late July 2023 several Curve pools were exploited, and the cause was not in the invariant or in the pool's own logic. The Vyper project's post-mortem says the flaw was in compiler versions 0.2.15, 0.2.16 and 0.3.0, where a change made to the compiler in 2021 removed a check that kept one storage slot per `@nonreentrant` key. Each decorator got its own slot, so functions that were meant to share a reentrancy lock did not. A contract compiled with an affected version and with a function that made an external call before updating its storage was exposed. The Curve pools hit were affected through that guard, and the fix landed in 0.3.1. The Vyper post-mortem dates the exploit to 30 July 2023, and it notes that protocols using those compilers had not been explicitly notified.

The lesson is about where trust sits. A pool can be correct as written and wrong as compiled. Immutable contracts cannot be patched, so the compiler version is part of the audit surface. [Security assumptions](/concepts/security-assumptions) lists toolchain risk with the others. A reader auditing a Curve pool or any Vyper contract should check which compiler version produced the bytecode.

## Trust that remains

A StableSwap pool does not know whether a “stablecoin” will keep its peg. `A` makes the pool willing to sell the depegged asset slowly at first and then very quickly. Liquidity providers own that inventory. Governance, and in NG the pool creator, chooses coins, `A`, fees, and any rate oracle. Gauges that emit CRV are an incentives layer on top of the invariant. They do not change `D`.

An integrator pricing a pegged asset from a Curve pool is reading an invariant that assumes the peg. That price is only as good as the assumption. The [security assumptions](/concepts/security-assumptions) page puts pool-as-oracle risk next to the other external inputs these protocols take.
