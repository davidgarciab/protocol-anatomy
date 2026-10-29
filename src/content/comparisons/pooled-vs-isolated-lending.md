---
title: "Pooled and isolated lending: Aave, SparkLend and Morpho"
seoTitle: "Aave vs Morpho vs SparkLend: pooled and isolated lending"
description: "How Aave V3, SparkLend and Morpho Blue differ in who sets risk, where losses land, how rates move and how liquidation works, with a table and worked numbers."
summary: "Aave V3 and SparkLend are pools: governance lists assets and sets parameters, and all suppliers share the result. Morpho Blue is a set of isolated markets with parameters fixed at creation. The trade is depth for containment, and who chooses the risk moves from governance to market creators and curators."
status: "published"
published: "2026-10-29"
lastVerified: "2026-10-29"
faq:
  - question: "Is Morpho safer than Aave?"
    answer: "Neither is safer in general. Morpho isolates losses to one market and fixes its parameters, so a bad listing cannot hurt other markets, but each market's oracle is chosen by its creator and a depositor must trust a curator to choose. Aave pools liquidity under governance-set parameters, which gives depth and shared exposure to every listed asset."
    featured: true
  - question: "Who sets the interest rate in Aave, SparkLend and Morpho?"
    answer: "In Aave V3 and SparkLend a governance-chosen rate model reads utilization and sets a rate with a kink. In Morpho Blue the market's rate model is chosen at creation from an approved list, and the adaptive curve moves its own curve over time around a 90 percent utilization target."
  - question: "What happens to a lender when a borrower cannot repay?"
    answer: "In every design the lender shares the shortfall unless a buffer covers it. Aave leaves the loss to the reserve and suppliers until governance acts. Morpho Blue writes the leftover debt off against the suppliers of that market when collateral reaches zero. SparkLend inherits Aave's behavior and adds supply caps and first-loss capital at the Spark level."
order: 5
protocols:
  - aave
  - spark
  - morpho
concepts:
  - isolated-markets-and-curation
  - lending-utilization
  - interest-rate-models
  - collateral-and-liquidation
  - oracles-and-dependencies
glossary:
  - isolated-market
  - lltv
  - curator
  - health-factor
  - close-factor
  - liquidation-bonus
  - isolation-mode
  - efficiency-mode
  - bad-debt
tags:
  - lending
  - comparison
  - risk
sources:
  - title: "Morpho markets"
    url: "https://docs.morpho.org/learn/concepts/market"
    kind: "docs"
    publisher: "Morpho"
  - title: "Morpho liquidation"
    url: "https://docs.morpho.org/learn/concepts/liquidation"
    kind: "docs"
    publisher: "Morpho"
  - title: "Adaptive curve interest rate model"
    url: "https://docs.morpho.org/get-started/resources/contracts/irm"
    kind: "docs"
    publisher: "Morpho"
  - title: "Morpho.sol"
    url: "https://github.com/morpho-org/morpho-blue/blob/main/src/Morpho.sol"
    kind: "code"
    publisher: "Morpho"
  - title: "SparkLend"
    url: "https://docs.spark.fi/products/sparklend"
    kind: "docs"
    publisher: "Spark"
  - title: "SparkLend liquidations"
    url: "https://docs.spark.fi/products/sparklend/guides/liquidations"
    kind: "docs"
    publisher: "Spark"
  - title: "Aave V4 overview"
    url: "https://github.com/aave/aave-v4/blob/main/docs/overview.md"
    kind: "docs"
    publisher: "Aave"
  - title: "Aave V3 Pool.sol"
    url: "https://github.com/aave/aave-v3-origin/blob/main/src/contracts/protocol/pool/Pool.sol"
    kind: "code"
    publisher: "Aave"
---

All three systems let a user post collateral and borrow against it. They differ in who decides how risky that is and where the loss lands when it goes wrong. This page sets them side by side. It starts from the [Aave](/protocols/aave) pool, adds [SparkLend](/protocols/spark), which is a conservative fork of it, and contrasts both with [Morpho Blue](/protocols/morpho).

## At a glance

| | Aave V3 | SparkLend | Morpho Blue |
| --- | --- | --- | --- |
| Unit of risk | A reserve in a shared pool | A reserve in a shared pool | One market: one collateral, one loan asset |
| Who lists collateral | Governance | Sky governance, short list | Anyone, from approved LLTVs and models |
| Parameters can change? | Yes, by governance | Yes, by Sky governance | No. Immutable per market |
| Rate model | Governance-set utilization curve | Same family, governance-set | Chosen at creation. The approved one adapts its own curve |
| Oracle | Per-asset price source set by governance | Median of three sources, plus a peg killswitch | Chosen by the market creator, fixed |
| Liquidation size | 50% default, 100% below 0.95 health | The same split | Any amount up to all of the debt |
| Liquidation bonus | Per-asset, set by governance | Per-asset, set by governance | `min(1.15, 1 / (1 − 0.3 × (1 − LLTV)))` |
| Loss when collateral runs out | Shared by the reserve's suppliers until governance acts | Same, with first-loss capital above it | Written off against that market's suppliers in `liquidate` |
| Who chooses for depositors | The depositor, or governance by listing | The depositor, with Spark's allocator behind the pool | The depositor, or a curator through a vault |

## Who sets the risk

In a pool, governance takes the decision. The [Aave page](/protocols/aave) describes loan-to-value, liquidation threshold and bonus as per-reserve settings, with isolation mode and efficiency mode as ways to constrain how a risky or correlated asset is used. A supplier accepts the whole list. A new listing, or a parameter change after a market event, changes their exposure without their action.

SparkLend keeps this structure and narrows it. The documentation describes a short collateral set, supply and borrow caps that scale with market depth, a three-oracle median and a killswitch for pegged collateral. The posture is stricter, but the model is the same: one governance process decides.

Morpho Blue moves the decision to creation time. The market's five parameters are fixed, and the protocol only holds lists of approved LLTVs and rate models. Nobody can later change an oracle, add a collateral or raise an LLTV. A depositor who wants hands-off exposure delegates to a vault whose curator chooses markets, which moves the decision from governance to the curator.

## How rates move

Aave and SparkLend read utilization into a curve with a kink. Below the target the slope is gentle, and above it the rate rises steeply to pull in suppliers and push out borrowers. The [interest rate models page](/concepts/interest-rate-models) shows the arithmetic. Governance chooses the slopes and the kink, and retunes them.

The Morpho adaptive curve targets 90 percent utilization and has a fixed shape around a stored `rateAtTarget`. That stored value drifts: up while utilization is above the target, down while it is below, faster when farther away. It stays between 0.1 and 200 percent. The curve retunes itself, which removes a governance task and makes the rate depend on history.

## How liquidation differs

Take a borrower with collateral worth 100,000 and debt of 86,500 who becomes liquidatable. The three systems respond differently.

- **Aave V3 and SparkLend.** If the health factor is below 1 but at or above 0.95, a liquidator can repay up to 50 percent of the debt, so 43,250. With a 5 percent bonus they seize 45,412 of collateral. Below 0.95, up to the whole debt.
- **Morpho Blue at 86 percent LLTV.** The bonus factor is 1.0438. A liquidator can repay any amount, for example 50,000, and seize 52,190. No close factor limits it.

The bonus numbers are illustrative: Aave's bonus is a per-asset governance setting, and 5 percent is only the example used elsewhere on this site. The structural point is that Morpho derives the bonus from the LLTV by a fixed formula, so a market with a higher LLTV has a smaller bonus. Less margin for error also means less room to pay a liquidator, which is a reason to look at oracle quality before borrowing at a high LLTV.

See [liquidation compared](/compare/liquidation-compared) for Maker, Curve and Aave V4.

## Where losses land

When collateral is exhausted and debt remains, the shortfall is a [bad debt](/glossary/bad-debt/).

- In Aave the loss stays in the reserve, borne by its suppliers until governance covers it or something else changes.
- In SparkLend the same, but the documentation lists layers of capital above depositors: Spark's own junior capital for the Savings products, then a series of Sky layers. These apply to Spark Savings vaults, not to every SparkLend supplier, so read which claim you hold.
- In Morpho Blue the `liquidate` function removes the borrower's leftover debt and subtracts the same amount from the market's total supply, so every supplier in that market takes the loss immediately and pro rata. It cannot spread to another market.

## What to watch for in each

- **Aave:** governance listings and parameter changes. The pool is only as safe as its riskiest listed collateral and oracle.
- **SparkLend:** the same, plus dependence on Sky governance and on the Liquidity Layer for depth.
- **Morpho:** the oracle and LLTV of the specific market, the curator and version of any vault, and thin markets. A market with little borrowed can have a manipulable share price, as the docs warn.

For the design argument see [isolated markets and curation](/concepts/isolated-markets-and-curation). For the oracle layer all three depend on, see [oracles and dependencies](/concepts/oracles-and-dependencies).
