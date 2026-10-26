---
title: "Curve pool generations"
description: "How Curve’s StableSwap pools, CryptoSwap pools, Stableswap-NG factory, and crvUSD markets differ."
summary: "Curve did not ship a single V1-to-V4 exchange. It shipped an invariant for pegged assets, a later invariant for volatile assets, an FXSwap pool for externally priced markets, a factory of immutable pool instances, and a separate stablecoin whose liquidation is an AMM."
status: "published"
published: "2026-10-13"
lastVerified: "2026-10-26"
order: 4
protocol: "curve"
versionContext: "Stableswap-NG, CryptoSwap, and FXSwap are current AMM families. crvUSD controller blueprints are versioned, and a market keeps the blueprint it was deployed with."
tags:
  - curve
  - stableswap
  - versions
concepts:
  - automated-market-makers
  - constant-product
  - stablecoin-mechanisms
glossary:
  - stableswap
  - cryptoswap
  - fxswap
  - metapool
  - amplification-coefficient
relatedGuides:
  - uniswap-versions
versions:
  - name: "StableSwap"
    status: "active"
    note: "Pegged-asset invariant from the StableSwap whitepaper. Still the pricing rule inside NG pools."
  - name: "Stableswap-NG"
    status: "active"
    note: "Current factory for plain pools and metapools, including oracle, rebasing, and ERC-4626 asset types."
  - name: "CryptoSwap"
    status: "active"
    note: "Volatile-asset invariant with its own amplification scale and a gamma parameter."
  - name: "FXSwap"
    status: "active"
    note: "Externally priced two-asset pools. A StableSwap-style curve plus a refuel budget for recentering."
  - name: "crvUSD controllers"
    status: "active"
    note: "V1 through V3 blueprints. The overview calls V3 the current factory blueprint. Old markets are not rewritten in place."
sources:
  - title: "Understanding StableSwap"
    url: "https://docs.curve.finance/protocol/pool/understanding-stableswap"
    kind: "docs"
    publisher: "Curve"
  - title: "StableSwap derivations"
    url: "https://docs.curve.finance/developer/resources/derivations"
    kind: "docs"
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
  - title: "crvUSD overview"
    url: "https://docs.curve.finance/developer/crvusd/overview/"
    kind: "docs"
    publisher: "Curve"
  - title: "StableSwap whitepaper"
    url: "https://docs.curve.finance/pdf/whitepapers/whitepaper_stableswap.pdf"
    kind: "whitepaper"
    publisher: "Curve"
---

Curve’s version history is not “the AMM, but the fourth one.” The project added invariants and factories that sit beside older pools. A pool deployed years ago still runs the bytecode it was given. This guide separates the families an integrator can actually call. The [Curve overview](/protocols/curve) derives the StableSwap invariant.

## StableSwap, then factories

The StableSwap whitepaper defines the pricing rule for pegged assets. Early pools were individual deployments: a contract for a specific set of coins, often with a hand-written name such as the well-known three-pool. The idea of the invariant did not require a factory. The factory came later so a new pegged set could be deployed without a new audit of a new equation.

Stableswap-NG is the factory the current integration guide tells developers to use. It deploys plain pools and [metapools](/glossary/metapool/). The pool contract is the LP token. Asset types 0 through 3 cover a plain ERC-20, an oracle rate, a rebasing balance, and an ERC-4626 rate. That is the practical break from the earliest pools, which assumed token balances were the whole story. A rebasing liquid staking token cannot be dropped into a balance-only pool without the pool either syncing balances or mis-accounting a rebase.

NG implementations are indexed. The integration documentation says the factory can add an implementation, and an existing pool keeps its own. There is no global “Curve V4 pool” that every address silently became. When you read a pool, read its implementation, its `A`, its fee, and its asset types.

Older pools remain. Routing that only knows the NG factory will miss them. Curve’s metaregistry exists so integrators can ask one contract which ABI a pool speaks. This guide does not duplicate registry addresses. They are deployment data and belong in the docs next to the factory.

## CryptoSwap is not a higher StableSwap version

CryptoSwap’s paper changes the invariant so liquidity can sit around a moving price instead of a peg of one. The understanding-CryptoSwap page says the `A` numbers are not on the StableSwap scale: 10,000 there is described as corresponding to 1 in StableSwap. Gamma is a second parameter. Copying a stablecoin pool’s `A` into a volatile pool is a category error, not a migration.

Twocrypto and tricrypto pools are CryptoSwap deployments with two or three coins. They are not Stableswap-NG pools with the coin count changed. A metapool is a StableSwap-shaped pool whose second coin is another pool’s LP token.

[FXSwap](/glossary/fxswap/) sits beside both. The understanding-FXSwap page describes a two-asset pool that uses StableSwap-style pricing and recenters with a refuel budget because the reference price comes from outside the pool. A refuel is not an oracle write of the spot price. Branching on “Curve pool” without asking which invariant is the integration bug this guide is about.

## crvUSD versions are blueprint versions

The crvUSD overview versions the lending market, not the AMM factory. It describes controller and LLAMMA blueprints. V3 is the current blueprint set on the factory. Markets deployed earlier stay on V1 or V2. The page’s market table is the evidence: wstETH, WBTC, and WETH are listed on V1; other collateral on V2 or V3; a deprecated market can have a zero debt ceiling and still be a historical deployment.

That is the same immutability pattern as NG pools, applied to borrowers. A new controller does not liquidate an old market under new code. Anyone integrating “crvUSD” has to know which controller a collateral uses.

LLAMMA’s soft liquidation — converting collateral in bands as price moves — is not a parameter of StableSwap. It does not use amplification `A` in the stablecoin-pool sense. Savings crvUSD is a wrapper around borrower interest, documented separately from LP tokens.

## What an integrator should branch on

| If the contract is… | Price with… | Do not assume… |
| --- | --- | --- |
| A Stableswap-NG pool | The StableSwap invariant and any coin rate | A CryptoSwap `A`, or an FXSwap refuel |
| A CryptoSwap pool | `price_scale`, `A`, and gamma | A peg of one, or the StableSwap scale for `A` |
| An FXSwap pool | A StableSwap-style curve plus the refuel budget | That the pool is where the price is discovered |
| A crvUSD controller | Collateral bands and the minted stablecoin | That it is an LP position |
| An older factory pool | Whichever ABI the registry reports | NG asset types |

The [constant product](/concepts/constant-product) article is the baseline both AMM families are departing from. Curve’s departure is deliberate and partial: far from the peg or the price scale, the curve is allowed to resemble a product pool so that one coin cannot be drained at a constant price forever.
