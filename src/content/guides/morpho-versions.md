---
title: "Morpho versions: Blue, Vaults V2 and Midnight"
seoTitle: "Morpho versions: Blue, Vaults V1 and V2, Midnight"
description: "How Morpho's names map to contracts: Blue markets, V1 and V2 vaults, and the fixed-rate Midnight protocol, and what each means for a lender."
summary: "'Morpho V2' is not a replacement for Blue. Blue is the variable-rate core and stays. Vaults V2 is a newer vault design that can allocate across protocols. Midnight is a separate fixed-rate, fixed-term protocol. This guide separates the three so an integrator or lender knows which contract a name points to."
status: "published"
published: "2026-10-29"
lastVerified: "2026-10-29"
faq:
  - question: "Did Morpho V2 replace Morpho Blue?"
    answer: "No. Morpho's own announcement says Midnight, the fixed-rate part of V2, is designed to complement, not replace, Morpho Blue. Blue remains the variable-rate lending core, and Vaults V2 can allocate to Blue markets, to Midnight and to other protocols."
    featured: true
  - question: "What changed between Morpho Vaults V1 and V2?"
    answer: "V2 builds on the same idea, a vault that routes one asset to lending venues, and extends it with adapters, absolute and relative caps on abstract risk ids, a sentinel role, timelocks of up to three weeks, and real-time asset reporting through realAssets(). The docs also give different bad-debt handling for V1.0 and V1.1 vaults."
  - question: "Where can I find the current Morpho contract addresses?"
    answer: "On the deployments page of the Morpho documentation, which lists Morpho Blue and the adaptive curve model per chain. At the time of reading, Morpho Blue on Ethereum was at 0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb. Midnight has separate addresses."
order: 6
protocol: "morpho"
versionContext: "Blue and Midnight are separate contract sets. Vaults V1 and V2 are different vault generations, and legacy vaults remain in use."
tags:
  - morpho
  - versions
  - vaults
concepts:
  - isolated-markets-and-curation
  - interest-rate-models
  - collateral-and-liquidation
glossary:
  - isolated-market
  - lltv
  - curator
  - allocator
  - midnight
  - bad-debt
relatedGuides: []
versions:
  - name: "Morpho Blue"
    status: "active"
    note: "Launched at the start of 2024 by the team's account. Singleton of isolated, immutable markets, variable rate."
  - name: "Vaults V1"
    status: "active"
    note: "First vault generation. V1.0 realizes bad debt when it occurs. V1.1 does not and leaves it in the market."
  - name: "Vaults V2"
    status: "active"
    note: "Adapter-based vaults with caps on risk ids, timelocks and a sentinel role. Reported to launch before Midnight."
  - name: "Midnight"
    status: "active"
    note: "Fixed-rate, fixed-term, offer-based markets. Announced with V2 and deployed as separate contracts."
sources:
  - title: "Morpho V2: liberating the potential of onchain loans"
    url: "https://morpho.org/blog/morpho-v2-liberating-the-potential-of-onchain-loans/"
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
  - title: "Midnight: get started"
    url: "https://docs.morpho.org/developers/midnight/get-started/"
    kind: "docs"
    publisher: "Morpho"
  - title: "Morpho deployed addresses"
    url: "https://docs.morpho.org/get-started/resources/addresses"
    kind: "docs"
    publisher: "Morpho"
  - title: "Morpho overview"
    url: "https://docs.morpho.org/learn/"
    kind: "docs"
    publisher: "Morpho"
---

Morpho's naming is the main source of confusion. The announcement of "Morpho V2" in 2025 introduced two things at once, and the docs now organize everything under "Variable Rate Markets (Blue)" and "Fixed Rate Markets (Midnight)". An integrator who writes "uses Morpho V2" has not said which contract is called.

The [protocol page](/protocols/morpho) explains the mechanism. This guide only maps names to contracts.

## The map

| Name | What it is | Rate | Who chooses where deposits go |
| --- | --- | --- | --- |
| Morpho Blue | Singleton contract of isolated markets | Variable, from an interest rate model | The lender, or a vault on their behalf |
| Vaults V1 | Vaults that allocate to Blue markets | Variable | A curator |
| Vaults V2 | Vaults that allocate through adapters to Blue, Midnight and other protocols | Variable at the vault level | A curator, with allocators and a sentinel |
| Midnight | Offer-based fixed-rate, fixed-term markets | Fixed at the moment a trade settles | Lenders and borrowers, through signed offers |

## Blue

Blue launched at the start of 2024 according to Morpho. It is the layer that holds the money. Its parameters are immutable per market, the governance-approved lists of LLTVs and rate models only grow, and governance cannot disable an entry. Everything in the other rows can be replaced without touching Blue.

For a lender, "using Morpho" in this sense means supplying a loan asset to a specific market and holding supply shares in it. The price of those shares rises as interest accrues.

## Vaults V1 and V2

A vault gives a depositor one asset-denominated position, and someone else picks the markets. The versions differ in how much that someone can do and how visible it is.

The docs describe Vault V2 this way:

- Roles are separated: an owner appoints a curator and sentinels, a curator configures, an allocator executes, a sentinel only reduces risk.
- Caps apply to abstract risk ids, so a limit can say "no more than this share of the vault in positions that use this collateral" instead of being tied to one market.
- Timelocks of up to three weeks delay risk-increasing curator actions, while decreases are immediate.
- Adapters let the vault reach venues other than Blue markets and report what they hold through `realAssets()`.
- Fees can include a performance fee of up to 50 percent of yield and a management fee of up to 5 percent of assets.

The legacy versions differ in a way that matters during a loss. According to the liquidation documentation, a V1.0 vault realizes bad debt when it occurs and shares it among lenders. A V1.1 vault does not realize it, and it stays in the market until someone pays it down. A V2 vault detects losses through its reported assets and lowers the share price for every depositor. If a V2 vault allocates into a V1.1 vault, it will not show that vault's loss until the V1.1 vault recognizes it.

When you read a vault page, identify the version first. It determines who can change risk settings, how long you have to react, and how a loss reaches your balance.

## Midnight

Midnight is a different protocol with a different unit. A market has one loan token, one maturity and a fixed set of accepted collateral. A lender holds *credit units*, each redeemable for one loan token at maturity. A borrower owes *debt units*. There is no utilization curve. The rate emerges from the price at which units trade, and it is locked when the trade settles.

Morpho describes the offer mechanism as signed offers published by makers. Borrowers take bids and lenders take asks, and a router returns the offers that can be taken. Early exit uses resting offers: a lender sells credit to a resting buy offer, and a borrower buys units from a resting sell offer to close the debt.

Liquidation differs from Blue. Before maturity a position can be partially liquidated when debt exceeds its limit. After maturity, unpaid debt can be partly or fully liquidated, and losses that liquidation does not cover can be socialized to lenders through a market loss factor. Lenders are exposed to the market's full accepted collateral set.

The same announcement says Vaults V2 can allocate to Blue, to Midnight and to later releases, and that a lender can earn variable yield on Blue while waiting for a Midnight offer to match. A press report at the time of reading said vaults could not yet allocate to Midnight pending DAO action. That is current state, not design, so confirm it in the documentation.

## What to check before relying on a name

1. Which contract address does the interface call? The deployments page lists Blue and Midnight separately.
2. If it is a vault, is it V1.0, V1.1 or V2, and who are its curator, allocator and sentinel?
3. If it is a Blue market, are the oracle, LLTV and interest rate model the ones you evaluated?
4. If it is Midnight, what is the maturity, which collateral is accepted, and what happens to unpaid debt after maturity?

The [isolated markets concept page](/concepts/isolated-markets-and-curation) explains why these questions change from market to market.
