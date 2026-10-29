---
title: "Pooled lending vs vault minting: Aave and Maker/Sky"
seoTitle: "Aave vs Maker: lending pool vs vault minting"
description: "Aave lends out other suppliers' deposits at a utilization-based rate. Maker mints stablecoin against a vault at a governance-set fee. Side by side."
summary: "Aave and Maker both take collateral and issue debt, but the debt comes from different places. Aave borrowers draw tokens that suppliers deposited, and the rate follows utilization. Maker borrowers mint a stablecoin that did not exist before, and governance sets the fee. The collateral check, the accrual index, and the failure mode follow from that."
status: "published"
published: "2026-10-26"
lastVerified: "2026-10-29"
changes:
  - date: "2026-10-29"
    summary: "Added a pointer to the pooled and isolated lending comparison."
faq:
  - question: "Is a Maker vault the same thing as an Aave loan?"
    answer: "No. An Aave borrower draws tokens that other suppliers deposited into a shared pool. A Maker vault owner mints a stablecoin against locked collateral, and the stablecoin is recorded as a liability of that vault. Nobody lends the DAI or USDS out of a pool, so there is no supplier on the other side of the loan."
  - question: "Why does Aave's borrow rate change with demand while Maker's stability fee does not?"
    answer: "Aave's variable rate is a function of utilization, so it rises as more of the reserve is borrowed. Maker's stability fee is a per-collateral-type duty that governance sets. It does not move automatically because more stablecoin has been drawn, except through governance reacting."
order: 1
protocols:
  - aave
  - maker-sky
concepts:
  - lending-utilization
  - interest-rate-models
  - collateral-and-liquidation
  - on-chain-accounting
  - stablecoin-mechanisms
glossary:
  - utilization
  - atoken
  - variable-debt-token
  - health-factor
  - normalized-debt
  - stability-fee
  - sky-savings-rate
tags:
  - lending
  - stablecoins
  - interest
sources:
  - title: "Aave V4 overview"
    url: "https://github.com/aave/aave-v4/blob/main/docs/overview.md"
    kind: "docs"
    publisher: "Aave"
  - title: "Aave V3 interest rate strategy"
    url: "https://aave.com/docs/aave-v3/smart-contracts/interest-rate-strategy"
    kind: "docs"
    publisher: "Aave"
  - title: "Aave V3 tokenization"
    url: "https://aave.com/docs/aave-v3/smart-contracts/tokenization"
    kind: "docs"
    publisher: "Aave"
  - title: "Vat (core accounting)"
    url: "https://developers.skyeco.com/protocol/core/vat/"
    kind: "docs"
    publisher: "Sky"
  - title: "Jug (rates module)"
    url: "https://developers.skyeco.com/protocol/rates/jug/"
    kind: "docs"
    publisher: "Sky"
  - title: "sUSDS"
    url: "https://developers.skyeco.com/protocol/tokens/susds/"
    kind: "docs"
    publisher: "Sky"
---

Both protocols take collateral and record a debt against it. That is where the resemblance ends. The tokens a borrower receives come from different places, and almost every other difference follows from that one fact. This page sets the two mechanisms side by side. It restates what the linked [Aave](/protocols/aave) and [Maker and Sky](/protocols/maker-sky) articles establish, so the sources behind each claim are on those pages and in the list below.

## At a glance

| Question | Aave V3 | Maker / Sky |
| --- | --- | --- |
| Where do the borrowed tokens come from? | Other users’ deposits in a shared reserve | Newly minted DAI or USDS, recorded as the vault’s debt |
| Who is on the other side of a loan? | Suppliers, as a pool | Nobody. The stablecoin is a liability of the vault |
| What sets the borrow rate? | [Utilization](/glossary/utilization/) of the reserve, on a two-slope curve | A stability fee that governance sets per collateral type |
| How is debt stored? | A [variable debt token](/glossary/variable-debt-token/) whose balance includes accrued interest | `art`, normalized debt, multiplied by the collateral type’s `rate` |
| What does the safety check compare? | Risk-adjusted collateral across the user’s enabled assets against debt, as a [health factor](/glossary/health-factor/) | `art * rate <= ink * spot`, for one collateral type per vault |
| What caps growth? | Supply and borrow caps per reserve | A debt ceiling (`line`) per collateral type and a global `Line` |

## Where the debt comes from

An Aave supplier transfers an underlying token into the pool and receives an [aToken](/glossary/atoken/). A borrower locks collateral and receives a token out of that same liquidity. If every supplier tried to withdraw at once, there would not be enough, which is why utilization matters to the design.

A Maker vault owner locks collateral and draws stablecoin. The Vat records the collateral as `ink` and the debt as `art`. The ERC-20 DAI or USDS is minted by a join adapter when internal `dai` is converted out, and burned when it is converted back. There is no reserve of other people’s stablecoin to run out of. The limit is the debt ceiling and the collateralization rule.

## What sets the price of borrowing

Aave’s [interest-rate strategy](https://aave.com/docs/aave-v3/smart-contracts/interest-rate-strategy) is a two-slope model. Below an optimal utilization the variable borrow rate rises gently. Above it the second slope is steeper, so a nearly fully borrowed reserve becomes expensive quickly. The optimal point and the slopes are per reserve. A share of borrow interest goes to the treasury through the reserve factor, so suppliers do not receive the full borrow rate times utilization.

Maker’s [stability fee](/glossary/stability-fee/) is not a utilization curve. The Jug stores a per-second duty for the collateral type, and governance chooses it. A rise in drawn DAI does not raise it automatically. The [interest-rate models](/concepts/interest-rate-models) article covers the general contrast.

Aave V4 adds a [risk premium](/glossary/risk-premium/) on top of the hub’s utilization-based rate, priced by the collateral actually covering the debt. That still sets the rate by how the pool is used and by what backs the loan. It does not make the rate a governance constant.

## How accrual works in each

Neither protocol writes every account on every block. Aave keeps a liquidity index and a borrow index per reserve, and balances are scaled by them. Maker keeps one `rate` per collateral type, and `Jug.drip` folds the elapsed fee into it. A vault’s current debt is `art * rate`. Until someone calls `drip`, `rate` is stale. The [on-chain accounting](/concepts/on-chain-accounting) article explains why integrations that read the stored number instead of the computed one drift.

## Who earns what

An Aave supplier’s yield is the borrowers’ interest, routed through the liquidity index into a growing aToken balance. In Sky’s system the savings rate is a separate module. A holder deposits USDS into sUSDS, an ERC-4626 share whose value follows an accumulator, and the [Sky Savings Rate](/glossary/sky-savings-rate/) sets how fast it moves. Holding the stablecoin and earning the savings rate are two different positions there.

## How each one fails

In both designs the residual loss is bad debt. If Aave collateral is worth less than the debt after liquidation, later suppliers and the reserve’s own accounting bear the shortfall until governance does something else. If a Maker auction does not raise enough stablecoin, the system keeps unbacked debt (`sin`) until surplus cancels it. The [collateral and liquidation](/concepts/collateral-and-liquidation) article compares the two liquidation paths in detail, and [liquidation compared](/compare/liquidation-compared) sets them next to crvUSD.

## What they share

Both depend on oracle prices that the lending rule cannot check. In Maker, `spot` is a price with the liquidation ratio already applied, written by infrastructure outside the Vat. In Aave, a wrong price makes the health factor wrong. Both also leave parameters to governance: collateral lists, caps or ceilings, and risk settings. The [stablecoin mechanisms](/concepts/stablecoin-mechanisms) article puts the minted-debt model next to the other ways a token reaches a dollar.

For a third design, isolated markets that fix their parameters at creation, and for SparkLend, which forks Aave’s pool, see [pooled and isolated lending compared](/compare/pooled-vs-isolated-lending).
