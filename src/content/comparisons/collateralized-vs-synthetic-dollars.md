---
title: "Collateralized and synthetic dollars: Sky, Ethena and Spark"
seoTitle: "Sky USDS vs Ethena USDe: how each dollar is backed"
description: "How Sky's overcollateralized USDS, Ethena's delta-neutral USDe and Spark's savings vaults hold a dollar, where yield comes from, who can redeem, and how they fail."
summary: "Sky issues USDS against collateral worth more than the debt and liquidates when it falls short. Ethena issues USDe against hedged backing and relies on funding, custody and margin. Spark packages Sky's reserves into savings vaults. The yield is earned by different risks, and exit works differently for each."
status: "published"
published: "2026-10-29"
lastVerified: "2026-10-29"
faq:
  - question: "What is the difference between USDS and USDe?"
    answer: "USDS is issued by Sky against collateral held in vaults, with a buffer above the debt and liquidation if collateral falls short. USDe is a synthetic dollar backed by assets hedged with short futures plus stable assets, with the peg held by the hedge and by approved parties minting and redeeming. Their yields come from different places and fail in different ways."
    featured: true
  - question: "Where does the yield on sUSDS and sUSDe come from?"
    answer: "sUSDS earns the Sky Savings Rate, set by Sky governance and funded by protocol revenue. sUSDe earns reward payments of USDe funded by the revenue of Ethena's backing, mostly funding and basis, lending and real-world-asset yield. A rise in either rate does not mean the same thing, since one is a policy rate and the other follows market conditions."
  - question: "Which is more likely to lose its peg in a crash?"
    answer: "They are exposed to different crashes. An overcollateralized dollar is stressed when collateral falls faster than liquidations can clear. A delta-neutral dollar is stressed by exchange, custody or margin failure, negative funding, and the difficulty of unwinding hedges quickly. The documentation of each describes mitigations. It does not remove the risk."
order: 6
protocols:
  - maker-sky
  - ethena
  - spark
concepts:
  - stablecoin-mechanisms
  - delta-neutral-dollars
  - collateral-and-liquidation
  - oracles-and-dependencies
  - security-assumptions
glossary:
  - usds
  - susds
  - sky-savings-rate
  - vault
  - peg-stability-module
  - usde
  - susde
  - delta-neutral
  - funding-rate
  - reserve-fund
  - spark-liquidity-layer
tags:
  - stablecoins
  - comparison
  - risk
sources:
  - title: "Ethena: how USDe works"
    url: "https://docs.ethena.fi/overview/how-usde-works"
    kind: "docs"
    publisher: "Ethena"
  - title: "Ethena: risks"
    url: "https://docs.ethena.fi/protocol-overview/risks"
    kind: "docs"
    publisher: "Ethena"
  - title: "Ethena: reserve fund"
    url: "https://docs.ethena.fi/protocol-overview/reserve-fund"
    kind: "docs"
    publisher: "Ethena"
  - title: "Ethena: peg arbitrage mechanism"
    url: "https://docs.ethena.fi/protocol-overview/peg-arbitrage-mechanism"
    kind: "docs"
    publisher: "Ethena"
  - title: "Sky Vat"
    url: "https://developers.skyeco.com/protocol/core/vat/"
    kind: "docs"
    publisher: "Sky"
  - title: "Sky collateral liquidation"
    url: "https://developers.skyeco.com/protocol/vaults/collateral-liquidation/"
    kind: "docs"
    publisher: "Sky"
  - title: "Sky LitePSM"
    url: "https://developers.skyeco.com/protocol/liquidity/litepsm/"
    kind: "docs"
    publisher: "Sky"
  - title: "Spark Savings"
    url: "https://docs.spark.fi/products/spark-savings"
    kind: "docs"
    publisher: "Spark"
---

Both Sky's USDS and Ethena's USDe aim at one dollar and both pay a savings rate through a vault token. The comparison ends there. They hold the peg with different machinery, and the places they can break are different. [Spark](/protocols/spark) sits between them as an allocator that can hold either.

## At a glance

| | Sky USDS | Ethena USDe | Spark savings vaults |
| --- | --- | --- | --- |
| Backing | Collateral in vaults worth more than the debt, plus other Sky reserves | Hedged crypto and other assets, plus stable assets | A claim on Spark's allocations, supported by Sky |
| How the peg is held | A buffer, liquidation, and the PSM swap | Delta-neutral hedge, plus approved parties minting and redeeming | Redemption through the vault, backed by Sky |
| Stress trigger | Collateral falls faster than liquidations clear | Hedge, funding, custody or margin failure | A venue fails or liquidity cannot be unwound in time |
| Yield token | sUSDS | sUSDe | spUSDC, spUSDT and others |
| Yield source | Sky Savings Rate, set by governance | Funding, basis, lending, real-world assets | Liquidity Layer allocations, rate managed by Spark governance |
| Direct redemption | Vault owners repay debt. The LitePSM swaps with approved stablecoins | Approved market makers, per Ethena's docs | Vault withdrawal from an idle buffer, or a liquidity intent |
| Loss order, per the issuer | Surplus buffer, then a SKY mint to recapitalize, per Spark's description | Reserve fund, which the docs say currently gets 0 percent of revenue | Spark junior capital, then Sky layers, then a SKY mint |

## Two ways to hold a dollar

An overcollateralized dollar is a debt. A vault owner locks collateral and mints against it. The collateral must be worth more than the debt, and a [liquidation](/concepts/collateral-and-liquidation) sells it if it is not. The value of USDS comes from a buffer. See [Maker and Sky](/protocols/maker-sky) for the vault and auction mechanics.

A delta-neutral dollar is a hedged portfolio. The issuer holds assets, opens opposite positions, and leaves value close to constant. The value comes from the hedge being held in size and from the issuer's ability to keep it. See [delta-neutral dollars](/concepts/delta-neutral-dollars) for the arithmetic.

A simple test separates them. Ask what happens if ETH falls 30 percent in a day.

- In Sky, vaults with ETH collateral lose buffer. If the fall outruns liquidations, the shortfall hits Sky's surplus buffer and, in the design's order, other layers.
- In Ethena, ETH-backed positions lose value on the spot side and gain on the short side. The spot loss is offset by the short's gain, and the portfolio is intended to stay flat. The pressure falls on the settlement step: until it settles, the gain is a balance owed by the exchange, and settlement between custodian and exchange is how it reaches the assets, so its speed and the exchange's solvency matter.

The reverse test asks what happens if ETH doubles. In Sky, nothing breaks. In Ethena, the short loses and needs more margin, so the margin must be posted from the assets that gained on the spot side.

## Where the yield comes from

Sky Savings Rate is a policy rate. The Sky documentation describes it as funded by protocol revenue, and governance sets it. It can be held at a level that revenue does not strictly justify for a time.

USDe's yield comes from market structure. Funding is paid when long demand exceeds short demand. Lending revenue and real-world-asset yield add to it. Ethena's documents report historical funding for ETH of 16 percent in 2021, 0.6 percent in 2022, about 9 percent in 2023 and about 13 percent in 2024, and these are the issuer's figures and not a forecast. A rate that comes from leverage demand can disappear when leverage demand does.

Spark's vault rates are set by Spark governance for the V2 vaults and by Sky for sUSDS and stUSDS. Their source is the Liquidity Layer's allocations, which include other protocols' products, among them [Ethena](/protocols/ethena) minting and [Morpho](/protocols/morpho) vaults, according to Spark's documentation. Part of Spark's yield can therefore be Ethena's yield, one step removed, with Sky's balance sheet behind it.

## Who can redeem, and at what price

Redemption is where a stablecoin's claim meets reality.

- USDS has no direct par redemption for an arbitrary holder. The LitePSM swaps with approved stablecoins at no slippage against a limited pool, and vault owners can repay their debt. The PSM is the practical anchor.
- USDe's mint and redeem are limited to approved counterparties after KYC and KYB checks. Others sell on markets. The anchor is arbitrage by those counterparties, bounded by how fast backing can be unwound. The documentation says about 0.5 percent of backing sits in the minting contract for on-demand redemptions.
- Spark vault tokens redeem from an idle buffer of up to 10 million per vault, then through a signed liquidity intent filled by the Liquidity Layer. Spark can put a vault into recovery mode and halt withdrawals.

In each case the first line of defense is a pool of immediately available stable assets, and its size is the number to look up. For the two ways out of Ethena see the [mint and exit guide](/guides/ethena-mint-and-exit). For Spark's see the [savings guide](/guides/spark-savings-and-liquidity).

## Trust that remains

- **Sky:** collateral listing and parameter governance, oracles, the auction and PSM contracts.
- **Ethena:** custodians and exchanges, the operator of the hedge, the minting backend, the Risk Committee and the size of the reserve fund.
- **Spark:** the whitelist, rate limits and roles of the Liquidity Layer, the venues it uses, and the layered capital described by its issuer.

None of these is a fiat reserve held by a regulated bank, and none removes the need to read what stands behind the token. See [stablecoin mechanisms](/concepts/stablecoin-mechanisms) for the full family.
