---
title: "Isolated markets and curation"
seoTitle: "Isolated lending markets and vault curators"
description: "What changes when a lending market holds one collateral and one loan asset, and why a curator then decides where depositors' money goes."
summary: "A pooled lending market shares one risk budget across many assets. An isolated market fixes one collateral, one loan asset, one oracle and one rate model, so a failure stays inside it. The cost is that someone must choose markets for depositors, and that role, the curator, becomes the new trust assumption."
status: "published"
published: "2026-10-29"
lastVerified: "2026-10-29"
faq:
  - question: "What is the difference between an isolated market and a pooled market?"
    answer: "A pooled market lists many assets in one contract and lets governance set each asset's risk parameters, so suppliers share exposure to every listed collateral. An isolated market pairs a single collateral with a single loan asset and fixes the oracle, interest rate model and liquidation threshold at creation, so losses cannot spread to other markets."
    featured: true
  - question: "Who decides which collateral a Morpho vault lends against?"
    answer: "The curator. In Morpho Vault V2 the curator configures adapters, caps and fees, and most of those changes are timelocked so depositors can see them coming. An allocator then moves funds within those limits, and a sentinel can reduce risk but not add it."
  - question: "Can a lender lose money in an isolated market?"
    answer: "Yes. If a borrower's collateral is seized and debt remains, the remaining debt is written off against the market's suppliers. Morpho Blue does this in its liquidate function when a position's collateral reaches zero. Isolation limits the loss to that market, it does not remove it."
order: 17
group: "credit"
tags:
  - lending
  - isolated-markets
  - curation
protocols:
  - morpho
  - aave
  - spark
glossary:
  - isolated-market
  - lltv
  - curator
  - allocator
  - bad-debt
  - erc-4626
related:
  - lending-utilization
  - interest-rate-models
  - collateral-and-liquidation
  - oracles-and-dependencies
sources:
  - title: "Morpho markets"
    url: "https://docs.morpho.org/learn/concepts/market"
    kind: "docs"
    publisher: "Morpho"
  - title: "Morpho vaults"
    url: "https://docs.morpho.org/learn/concepts/vault"
    kind: "docs"
    publisher: "Morpho"
  - title: "Morpho liquidation"
    url: "https://docs.morpho.org/learn/concepts/liquidation"
    kind: "docs"
    publisher: "Morpho"
  - title: "Morpho.sol"
    url: "https://github.com/morpho-org/morpho-blue/blob/main/src/Morpho.sol"
    kind: "code"
    publisher: "Morpho"
  - title: "Spark Isolated Markets"
    url: "https://docs.spark.fi/products/isolated-markets"
    kind: "docs"
    publisher: "Spark"
---

Most lending markets are pools. One contract lists many assets, suppliers deposit into a shared reserve, and a governance process decides which assets may be collateral and how far they may be borrowed against. The [lending](/concepts/lending-utilization) page and the [Aave](/protocols/aave) page describe that design. Its strength is depth: one pool of liquidity serves every borrower. Its weakness is that every supplier is exposed to every collateral that governance listed.

An isolated market makes the opposite trade. It gives up shared depth to make each risk separate and explicit.

## What isolation fixes

A [Morpho](/protocols/morpho) market is defined by five values: the loan token, the collateral token, an oracle, an interest rate model and a liquidation loan-to-value ([LLTV](/glossary/lltv/)). The market id is the hash of those five fields. The docs describe the market as immutable. Nothing about it can be changed after deployment, including by the protocol's own governance.

That has three effects.

- **Contained losses.** If the collateral fails or the oracle is wrong, the damage stays in that market. Other markets do not share its reserve.
- **Tailored parameters.** A pair of closely correlated assets can have a high LLTV. A volatile pair can have a low one. The pooled design has to pick values that suit the whole pool.
- **Permissionless listing.** Anyone can create a market from the allowed parameters without a governance vote. The protocol keeps only two lists: the LLTVs it has approved and the interest rate models it has approved. At the time of reading, the docs list nine LLTVs from 0 percent to 98 percent and one approved model, the [adaptive curve](/concepts/interest-rate-models).

Notice what is still chosen by the market creator: the oracle. Morpho's own oracle pages say the price is only as correct as its feeds, decimals and vault inputs. Isolation does not make a bad oracle safe. It confines the consequences of using one.

## What isolation costs

Liquidity fragments. A depositor in one market cannot be lent to a borrower in another. A market with the right pair, a sound oracle and no depositors is useless to a borrower.

The reader's job also changes. In a pool the question is "do I trust this protocol's listing process?". In an isolated design it is "do I trust this collateral, this oracle, this LLTV and this model?", asked again for every market. Few depositors can do that for dozens of markets, and that gap is why curation exists.

## Curators sit between depositors and markets

A vault takes deposits in one asset and spreads them across markets. Someone chooses the markets and sizes. In Morpho Vault V2 that work is split into roles:

| Role | What it can do | What it cannot do |
| --- | --- | --- |
| Owner | Appoints the curator and sentinels | Touch assets or risk parameters directly |
| Curator | Configures adapters, caps and fees. Most changes are timelocked | Move funds on its own |
| Allocator | Moves funds between enabled adapters inside the caps | Raise caps or add adapters |
| Sentinel | Reduces risk: deallocates, lowers caps, revokes pending actions | Increase risk |

Two controls make the curator's authority bounded. Caps limit exposure either as an absolute amount or as a share of the vault, and they attach to risk factors such as a collateral asset or an oracle and LLTV configuration, not only to single markets. Timelocks, configurable from zero to three weeks in the documentation, delay harmful changes such as raising caps or enabling an adapter, so a depositor has time to leave. Some timelocks can be made permanent through `abdicate`.

Spark applies the same pattern at a different layer. Its [Liquidity Layer](/protocols/spark) lets a relayer move stablecoins only between venues that governance has already approved with a rate limit, much as an allocator can act only inside what a curator enabled.

## Where the loss lands

When a liquidation seizes all of a borrower's collateral and debt remains, the contract has to put that loss somewhere. In Morpho Blue's `liquidate` function, once a position's collateral reaches zero, the leftover borrow shares are removed and the same amount is subtracted from the market's total supply assets. Suppliers in that market absorb it pro rata.

How a vault passes that on depends on its version. The docs state that Vault V2 detects the loss through the reported value of its adapters and lowers the share price for all depositors. A legacy V1.0 vault realizes bad debt when it happens. A legacy V1.1 vault does not realize it, and the debt stays in the market until someone pays it down. A V2 vault holding a V1.1 vault will not show that loss until the V1.1 vault recognizes it.

The practical lesson is that a vault's share price can be a lagging indicator in a stress event. The market's own state is the primary record.

## Trust moves, it does not disappear

- The **oracle** is chosen at market creation and cannot be replaced. If it can revert, borrowing, collateral withdrawal and liquidation can all be blocked, as Morpho's contract documentation notes.
- The **curator** can be wrong, slow or compromised. Timelocks and caps are the defense, and a depositor who does not watch a pending action cannot use them.
- The **IRM and LLTV lists** are governance decisions. Governance cannot edit a market, but it decides which parameters are available for new ones.

For a comparison with pooled design see [lending markets compared](/compare/pooled-vs-isolated-lending). For how oracle and governance dependencies are treated across the site see [oracles and dependencies](/concepts/oracles-and-dependencies) and [security assumptions](/concepts/security-assumptions).
