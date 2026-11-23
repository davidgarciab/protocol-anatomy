---
title: "Euler vault types: governed, escrow, finalized and Earn"
seoTitle: "Euler vault types: governed, escrow, finalized, EulerEarn"
description: "What governed EVK vaults, escrow vaults, finalized vaults and EulerEarn vaults are in Euler V2, who can change each, and what to check before depositing or borrowing."
summary: "Euler V2 uses the word vault for four different configurations. A governed vault can be changed by its governor, an escrow vault is a canonical non-borrowable collateral container, a finalized vault has no active governor, and an EulerEarn vault allocates one asset across strategies. Authority is deployment-specific, so the label does not settle who controls what."
status: "published"
published: "2026-11-23"
lastVerified: "2026-11-23"
faq:
  - question: "Does a finalized Euler vault mean nothing can change?"
    answer: "No. Finalizing revokes the vault governor, so the parameters the EVault governor controls can no longer be updated. A separately governed oracle router, a connected collateral vault or a hook can still change, and a vault deployed behind an upgradeable beacon can still depend on the factory's upgrade administrator."
    featured: true
  - question: "What is an Euler escrow vault?"
    answer: "A specific, ungoverned configuration of an EVK vault that holds one asset and cannot be borrowed from, so that its shares can be used as collateral elsewhere. It is verified by an Escrowed Collateral Perspective and has no governor, oracle, interest rate model, caps or hooks. The LTV and oracle that apply to its shares are set by each liability vault that accepts them."
  - question: "How is an EulerEarn vault different from an EVK vault?"
    answer: "An EVK vault is a lending market for one asset, where yield comes from borrowers of that vault. An EulerEarn vault accepts one asset and allocates it across enabled ERC-4626 strategies, including Euler lending vaults, under an owner, curator, allocators and a guardian. Withdrawals use a queue, so available liquidity can be below the accounting value of shares."
order: 16
protocol: "euler"
versionContext: "The categories are the documented vault configurations of Euler V2. Roles, perspectives, caps and hooks are set per deployment, and the docs say these names describe how a vault is intended to operate, not who controls every connected contract."
tags:
  - euler
  - vaults
  - governance
concepts:
  - isolated-markets-and-curation
  - governance-and-upgrades
  - security-assumptions
glossary:
  - evk-vault
  - eulerearn
  - curator
  - erc-4626
relatedGuides: []
versions:
  - name: "Governed EVK vault"
    status: "active"
    note: "A lending vault for one asset whose parameters a governor can update, with separate roles possible on connected contracts."
  - name: "Escrow vault"
    status: "active"
    note: "Canonical ungoverned and non-borrowable configuration used as collateral elsewhere."
  - name: "Finalized EVK vault"
    status: "active"
    note: "No active vault governor. Dependencies and factory upgrade authority may still change."
  - name: "EulerEarn vault"
    status: "active"
    note: "One asset allocated across ERC-4626 strategies by an owner, curator, allocators and a guardian."
sources:
  - title: "Euler vault types"
    url: "https://docs.euler.finance/learn/vault-types"
    kind: "docs"
    publisher: "Euler"
  - title: "Euler vaults"
    url: "https://docs.euler.finance/learn/vaults"
    kind: "docs"
    publisher: "Euler"
  - title: "EulerEarn"
    url: "https://docs.euler.finance/use/euler-earn"
    kind: "docs"
    publisher: "Euler"
  - title: "Euler hooks"
    url: "https://docs.euler.finance/learn/hooks"
    kind: "docs"
    publisher: "Euler"
  - title: "Euler price oracles"
    url: "https://docs.euler.finance/learn/price-oracles"
    kind: "docs"
    publisher: "Euler"
---

An Euler vault page does not tell you who can change it. The [protocol page](/protocols/euler) explains the mechanism, and this guide covers the four configurations the docs name, because the docs themselves say the names describe how a vault is intended to operate and do not establish who controls every connected contract.

## The map

| Type | What it does | Who can change it | What to check |
| --- | --- | --- | --- |
| Governed EVK vault | Lends one asset under parameters that can be managed after deployment | The active vault governor and any separate roles on connected contracts | Governor, caps, collateral list, oracle, rate model, LTVs, liquidation settings, hooks, fees, timelocks |
| Escrow vault | Holds one asset, cannot be borrowed from, shares are used as collateral elsewhere | No vault governor. Each liability vault that accepts the shares sets the LTV and oracle | Perspective verification, the underlying asset, which vaults accept it and at what LTV |
| Finalized vault | An EVK vault with no active governor | Remaining factory upgrade authority and governance of dependencies | Finalization status, implementation, oracle route, caps, liquidity |
| EulerEarn vault | One asset allocated across ERC-4626 strategies | Owner, curator, allocators, guardian and strategy roles | Strategies, caps, queues, role permissions, fees, timelocks, liquidity |

## Governed vaults

A governed vault has a governor who can update supported parameters. Depending on the deployment these can include collateral relationships, supply and borrow caps, the interest rate model, oracle configuration, fees, hooks and liquidation settings. The governor controls only what the deployed `EVault` authorizes, and connected contracts can have other owners.

The docs' advice is to identify each role address, its exact permissions, any timelocks and recent or pending changes before using one. That is the same question this site asks of [Morpho curators](/concepts/isolated-markets-and-curation): the market is safe to the extent the person managing it is.

## Escrow vaults

An escrow vault is not any vault with borrowing switched off. The docs say it is a specific configuration verified by the Escrowed Collateral Perspective: the perspective-recognized singleton escrow vault for its underlying asset, with no vault governor, oracle, unit of account, interest rate model, caps, hooks, configuration flags, fee receiver, collateral LTVs or liquidation settings. It cannot be borrowed from and earns no borrower-paid interest.

Its use is as a simple, reusable collateral container. Because it has none of those settings itself, everything that matters about using its shares as collateral is set by the liability vault that accepts them.

## Finalized vaults

Finalizing revokes the governor, so the parameters controlled by `EVault` governance can no longer change and changing them generally needs a new vault. The docs list what can still move: a separately governed oracle router, a connected collateral vault, a hook, and the factory's upgrade administrator if the vault sits behind an upgradeable beacon. Oracle prices, liquidity, utilization and liquidation conditions also keep moving.

"Finalized" therefore answers one question: whether the vault governor can change the vault. It does not answer whether the market is immutable.

## EulerEarn vaults

An EulerEarn vault holds one asset and issues ERC-4626 shares, and its allocation is managed by roles. The docs describe them as hierarchical: the owner assigns roles and controls high-level settings, the curator manages strategy caps, allocators set queues and reallocate within caps, and a guardian can revoke specific pending actions. The guardian is explicitly not a general veto over all vault activity. A fee recipient receives performance-fee shares and is not a management role.

Withdrawals use a queue to recover assets from strategies, so what is available now can be lower than the accounting value of your shares. The docs list `lostAssets` among the things to check. Each strategy underneath adds its own contracts, governance, oracle and liquidity dependencies. An Earn vault is both a share vault and an allocation system, and a review has to cover both.

## What to check before depositing or borrowing

1. Which of the four configurations is it? The label is a claim, and the vault's perspective and roles confirm it.
2. Who holds each role, and is there a timelock on risk-increasing actions?
3. For a borrow market, which oracle route and which hooks apply, and can a hook block repayments or liquidations?
4. For an Earn vault, what are the strategies, queues and the available liquidity right now?
5. For a finalized vault, what remains governed in its dependencies?

The docs also say vault labels, classifications and APYs are descriptive, not recommendations, and that live configuration, liquidity, oracle routes, caps and permissions should be verified before acting. The same applies to anything this site says about a specific market.
