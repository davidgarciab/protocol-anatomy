---
title: "Curve Finance"
description: "How Curve prices pegged assets with StableSwap, volatile assets with CryptoSwap, and LP claims in Stableswap-NG."
summary: "Curve builds AMMs for assets that should trade near each other, and a second family for assets that should not. StableSwap uses an amplification coefficient to flatten the price near the peg. CryptoSwap concentrates liquidity around a moving price scale. Stableswap-NG is the current factory for plain pools and metapools."
status: "published"
published: "2026-10-13"
lastVerified: "2026-10-13"
order: 4
category: "Automated market maker"
mechanism: "StableSwap and CryptoSwap invariants, with LP tokens minted against pool liquidity rather than a constant-product share."
versionContext: "Stableswap-NG is the documented factory for pegged pools. CryptoSwap is a separate invariant. crvUSD is a collateralized stablecoin that uses LLAMMA, not a StableSwap pool."
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
  - metapool
  - lp-share
versions:
  - name: "StableSwap"
    status: "active"
    note: "The pegged-asset invariant. Stableswap-NG is the current factory form documented for integrators."
  - name: "CryptoSwap"
    status: "active"
    note: "A separate invariant for volatile pairs, with amplification and gamma around an internal price scale."
  - name: "crvUSD"
    status: "active"
    note: "A lending-and-mint system beside the AMMs. Controller blueprints are versioned, and existing markets keep the blueprint they were deployed with."
sources:
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

`x_i` is the balance of coin `i`, scaled into the pool’s math. `n` is the number of coins. `D` is the invariant, equal to the total balance when every coin is equal. `A` is the [amplification coefficient](/glossary#amplification-coefficient).

When balances are near equal and `A` is large, the curve behaves like a constant sum: a trade barely moves the price. When one coin dominates, the product term dominates and the price can move sharply, which is what gives arbitrage a reason to return the pool toward the peg. The understanding-StableSwap page describes high `A` (it gives 500 to 10,000 as examples) as deep liquidity near the peg and a sharp drop if an asset leaves the peg. Lower `A` spreads liquidity and moves the price earlier. Those ranges are illustrations of the shape, not a recommendation for a new pool.

<diagram-placeholder name="curve-shapes"></diagram-placeholder>

StableSwap is a poor fit for assets that are not meant to share a price. The same page says so and points volatile pairs at CryptoSwap. A high `A` on a volatile pair concentrates liquidity at a peg the assets will not keep.

## What a liquidity provider actually holds

In Stableswap-NG, the [integration guide](https://docs.curve.finance/developer/integration/stableswap-ng) and the factory overview say the pool contract and the LP token are the same contract. A deposit mints LP tokens. A withdrawal burns them. The LP token is a share of the pool’s liquidity, accounted against `D`, not a voucher for the exact basket deposited. If the pool is imbalanced, the coins you withdraw in a balanced removal are the current mix, and a one-coin withdrawal moves the price and pays the invariant’s slippage.

The NG factory deploys plain pools of up to eight coins and metapools. A [metapool](/glossary#metapool) pairs one coin with the LP token of a base pool, so a swap can reach the base pool’s coins without merging their reserves into one contract.

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

`A` still concentrates liquidity. `gamma` (γ) changes how the curve leaves that concentrated region. Curve’s conceptual docs and the paper do not describe gamma as a simple “higher means wider” switch that an integrator should hard-code. The understanding-CryptoSwap page also warns that CryptoSwap’s `A` is scaled differently from StableSwap’s: it says an `A` of 10,000 in CryptoSwap corresponds to an `A` of 1 in StableSwap. Read the paper and the pool’s stored parameters together. Do not copy a StableSwap `A` into a tricrypto pool.

The internal price is a `price_scale` the pool updates. Liquidity concentrates around that scale. A trade away from it pays more slippage, which is the point: the pool is not offering v2-style depth at every price, and it is not offering StableSwap’s peg.

## crvUSD is not a pool type

The [crvUSD overview](https://docs.curve.finance/developer/crvusd/overview/) describes a stablecoin minted against approved collateral. The monetary mechanism is LLAMMA, an AMM that converts collateral toward the stablecoin as the collateral price falls, instead of a single auction at a liquidation ratio. Soft liquidation is a different idea from Aave’s `liquidationCall` or Maker’s `grab`.

The same page versions the controller and AMM blueprints. V3 is described as the current blueprint on the controller factory. Existing markets keep the blueprint they were deployed with; setting a new implementation does not rewrite them. The overview lists markets on V1, V2, and V3. LlamaLend is a related lending deployment and is not the same contract family as a Stableswap-NG pool.

Savings crvUSD (`scrvUSD`) is described there as a yield-bearing wrapper that takes a portion of borrower interest. It is another tokenized claim, not the StableSwap LP token.

## Trust that remains

A StableSwap pool does not know whether a “stablecoin” will keep its peg. `A` makes the pool willing to sell the depegged asset slowly at first and then very quickly. Liquidity providers own that inventory. Governance, and in NG the pool creator, chooses coins, `A`, fees, and any rate oracle. Gauges that emit CRV are an incentives layer on top of the invariant. They do not change `D`.

An integrator pricing a pegged asset from a Curve pool is reading an invariant that assumes the peg. That price is only as good as the assumption. The [security assumptions](/concepts/security-assumptions) page puts pool-as-oracle risk next to the other external inputs these protocols take.
