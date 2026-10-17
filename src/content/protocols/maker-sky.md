---
title: "MakerDAO / Sky"
seoTitle: "How MakerDAO and Sky work: vaults, DAI, USDS"
description: "How Maker vaults account for collateral and DAI debt, and how Sky’s USDS relates to that system."
summary: "Maker’s Vat is a ledger of collateral and stablecoin debt. A vault locks collateral, draws DAI, and pays a stability fee that accrues by raising a per-collateral rate. Sky keeps a one-for-one path between DAI and USDS and adds a savings token, sUSDS, without replacing the vault ledger with an AMM."
status: "published"
published: "2026-10-13"
lastVerified: "2026-10-13"
faq:
  - question: "How does Maker track the debt of a vault?"
    answer: "The Vat stores normalized debt `art` per vault and an accumulated stability-fee multiplier `rate` per collateral type. Current debt is `art * rate`, not `art` alone. One update to `rate` reprices every vault of that collateral type."
  - question: "When is a Maker vault liquidated?"
    answer: "A vault is unsafe when `art * rate` exceeds `ink * spot`. The Vat function `grab` confiscates it, taking collateral and normalized debt off the vault and recording the debt as unbacked `sin`. Selling the collateral is a separate auction module, not a fixed close factor inside the Vat."
  - question: "Is the Maker stability fee a utilization rate like Aave’s?"
    answer: "No. Governance sets it, and it does not rise automatically because more DAI has been drawn. It reaches vaults when someone calls `Jug.drip`, which adds the elapsed-time change onto the collateral type’s `rate`. Until `drip` is called, `rate` is stale."
  - question: "What is the difference between sUSDS and stUSDS?"
    answer: "sUSDS is an ERC-4626 deposit of USDS into the Sky Savings Rate. stUSDS is another ERC-4626 deposit of USDS, described by Sky as a risk-capital token that funds SKY-backed borrowing. An integration that prices every Sky ERC-4626 share as sUSDS will mis-price stUSDS."
order: 3
category: "Collateralized stablecoin"
mechanism: "Overcollateralized stablecoin debt against vaults, with a governance-set stability fee and a savings rate."
versionContext: "The Vat, Jug, and liquidation module remain the Maker core described in the dss repository. USDS, the DAI–USDS converter, and sUSDS are the Sky token layer documented for integrators in 2026."
tags:
  - stablecoin
  - vaults
  - governance
concepts:
  - stablecoin-mechanisms
  - collateral-and-liquidation
  - on-chain-accounting
  - governance-and-upgrades
  - oracles-and-dependencies
guides:
  - maker-to-sky
glossary:
  - vault
  - normalized-debt
  - stability-fee
  - dai
  - usds
  - susds
  - stusds
  - sky-savings-rate
versions:
  - name: "Vat and Jug"
    status: "active"
    note: "Collateral and normalized-debt accounting. Still the ledger USDS joins against."
  - name: "DAI"
    status: "active"
    note: "The stablecoin balance inside the Vat. Convertible both ways with USDS at one-to-one."
  - name: "USDS and sUSDS"
    status: "active"
    note: "Sky’s ERC-20 upgrade path, the ERC-4626 savings wrapper, and stUSDS as a separate risk-capital deposit. DAI is not described as sunset."
sources:
  - title: "Vat detailed documentation"
    url: "https://docs.makerdao.com/smart-contract-modules/core-module/vat-detailed-documentation"
    kind: "docs"
    publisher: "MakerDAO"
  - title: "Rates module"
    url: "https://docs.makerdao.com/smart-contract-modules/rates-module"
    kind: "docs"
    publisher: "MakerDAO"
  - title: "Jug detailed documentation"
    url: "https://docs.makerdao.com/smart-contract-modules/rates-module/jug-detailed-documentation"
    kind: "docs"
    publisher: "MakerDAO"
  - title: "vat.sol"
    url: "https://github.com/makerdao/dss/blob/master/src/vat.sol"
    kind: "code"
    publisher: "MakerDAO"
  - title: "dog.sol"
    url: "https://github.com/makerdao/dss/blob/master/src/dog.sol"
    kind: "code"
    publisher: "MakerDAO"
  - title: "USDS"
    url: "https://developers.skyeco.com/protocol/tokens/usds/"
    kind: "docs"
    publisher: "Sky"
  - title: "sUSDS"
    url: "https://developers.skyeco.com/protocol/tokens/susds/"
    kind: "docs"
    publisher: "Sky"
  - title: "stUSDS"
    url: "https://developers.skyeco.com/protocol/tokens/stusds/"
    kind: "docs"
    publisher: "Sky"
  - title: "Protocol token routes"
    url: "https://developers.skyeco.com/quick-start/protocol-token-routes/"
    kind: "docs"
    publisher: "Sky"
  - title: "sky-ecosystem/usds"
    url: "https://github.com/sky-ecosystem/usds"
    kind: "code"
    publisher: "Sky"
  - title: "SUsds.sol"
    url: "https://github.com/sky-ecosystem/sdai/blob/susds/src/SUsds.sol"
    kind: "code"
    publisher: "Sky"
---

Maker’s protocol mints a stablecoin against collateral that a user locks in a vault. The stablecoin is a liability of that vault, not a receipt from a custodian and not a share of an AMM. Sky is the current name of the ecosystem around that system. The integrator docs add USDS as an upgrade path from DAI, and sUSDS as a savings wrapper. They do not describe USDS as a new curve or a new lending pool.

This page follows the ledger. The [transition guide](/guides/maker-to-sky) separates historical Maker names from the token routes Sky documents now. Marketing pages that list collateral sectors are not used here as evidence of what the contracts enforce.

## The ledger

The Vat is the accounting contract. The [Vat documentation](https://docs.makerdao.com/smart-contract-modules/core-module/vat-detailed-documentation) defines two structures that matter for almost every other call:

| Field | Where it lives | What it means |
| --- | --- | --- |
| `ink` | Urn, per vault | Locked collateral, in wad (1e18) |
| `art` | Urn, per vault | Normalized debt, before the stability fee |
| `rate` | Ilk, per collateral type | Accumulated stability-fee multiplier, in ray (1e27) |
| `spot` | Ilk | Collateral price with the safety margin already applied |
| `line` | Ilk | Debt ceiling for that collateral type |
| `dust` | Ilk | Minimum debt for a vault that is not fully repaid |
| `Art` | Ilk | Sum of normalized debt for the collateral type |

Current debt on a vault is `art * rate`, not `art` alone. `rate` starts at 1e27 and only increases as fees accrue. That is why the stored debt is called [normalized](/glossary/normalized-debt/). One update to `rate` reprices every vault of that collateral type.

`gem` is the Vat’s internal collateral balance. `dai` is the internal stablecoin balance, in rad (1e45), not the ERC-20 in a user’s wallet. The ERC-20 DAI and USDS tokens are minted by join adapters when internal `dai` is converted out, and burned when it is converted back. The USDS repository describes `UsdsJoin` as the adapter that mints USDS against `vat.dai`, analogous to `DaiJoin`.

<diagram-placeholder name="stablecoin-flow"></diagram-placeholder>

## Opening, drawing, and the safety check

A user locks collateral, then draws stablecoin. Both adjustments meet in `frob`. The Vat documentation and the contract require several conditions at once. The ones that define the mechanism are:

- The collateral type has been initialized (`rate != 0`).
- Drawing debt must not push the collateral type over its `line`, or the whole system over the global `Line`.
- The vault must be safe unless the call is reducing risk. Safety is `art * rate <= ink * spot`.
- Debt must be zero or at least `dust`. A tiny leftover position is rejected.
- The vault owner must authorize a call that increases risk.

`spot` is not a raw oracle price. It is the price after the liquidation ratio has been applied, so the comparison above is the collateralization rule. The oracle and the spotter that writes `spot` are outside the Vat. If they are wrong, the Vat will still enforce whatever `spot` it was given.

The rates module explains why someone must call `Jug.drip(ilk)` for fees to move. The Jug stores a per-second duty for the collateral type plus a global base. `drip` computes the multiplier for the elapsed time and calls `Vat.fold`, which adds the change onto `Ilk.rate` and credits the system surplus. Until `drip` is called, `rate` is stale. A vault opened and closed between drips does not pay the fee that would have accrued in that gap. The Jug docs treat that as a property of lazy accrual, and they note that keepers and governance have reasons to call it.

The [stability fee](/glossary/stability-fee/) is therefore not a utilization curve. Governance sets it. It does not automatically rise because more DAI has been drawn, except insofar as governance reacts. That is the main contrast with [Aave](/protocols/aave).

## Liquidation

A vault is unsafe when `art * rate` exceeds `ink * spot`. `grab` is the Vat function that confiscates it: collateral (`ink`) and normalized debt (`art`) are taken off the urn, and the debt is recorded as `sin`, the system’s unbacked debt. The Vat documentation is explicit that `grab` is how vaults are liquidated at the ledger layer.

Selling the seized collateral is a different module. `src/dog.sol` sits next to `vat.sol` in the `dss` repository. This page does not restate auction parameters from secondary write-ups. The economic point is enough: liquidation is not a fixed close-factor inside the Vat. The ledger moves the position to the protocol, and a separate auction contract sells collateral for stablecoin so the unbacked debt can be cancelled. If the auction does not cover the debt, `sin` remains until surplus or governance absorbs it.

## USDS, the converter, and savings

Sky’s token docs describe USDS as an ERC-20 with permit support, upgradeable through the UUPS pattern and ERC-1967 storage. The [DAI–USDS converter](https://developers.skyeco.com/protocol/tokens/usds/) exchanges the two tokens at one-to-one in both directions. The same page says no fee is charged and that a fee cannot be enabled later on that route. The converter is a convenience over the joins. It does not reprice DAI.

The [token routes](https://developers.skyeco.com/quick-start/protocol-token-routes/) also fix MKR to SKY at 1:24,000. They describe sUSDS as an ERC-4626 deposit of USDS into the [Sky Savings Rate](/glossary/sky-savings-rate/). sUSDS and the older sDAI token are not one-for-one, because each has accrued a different rate since it launched. The sUSDS contract stores an accumulator `chi` and a rate `ssr`. Share-to-asset conversion uses that accumulator, so a transfer of sUSDS transfers a claim whose USDS value changes, while the USDS stays in the savings module.

The routes page points DAI–USDC and USDS–USDC conversion at LitePSM-style contracts: a fixed one-to-one swap against an external stablecoin, subject to the module’s liquidity, not a Curve invariant. That is the [peg stability module](/glossary/peg-stability-module/) idea. It can hold the market price near one dollar only while it has inventory and while governance leaves it open. It does not make a vault safer.

[stUSDS](/glossary/stusds/) is another ERC-4626 deposit of USDS, and it is not sUSDS. Sky’s token page calls it a risk-capital token: supplying USDS funds SKY-backed borrowing and pays an stUSDS rate. The page documents `deposit` and `mint` plus permit. It does not document a one-for-one path with DAI, and it does not document the Sky Savings Rate. An integration that prices every Sky ERC-4626 share as sUSDS will mis-price this deposit.

## What “decentralized” does not remove

Governance sets the collateral list, the stability fee, debt ceilings, the liquidation ratio inside `spot`, and the savings rate. The USDS token itself can be upgraded by its proxy admin. Oracle infrastructure writes the prices the Vat trusts. Auction keepers have to show up. Those are the operating assumptions. The [governance](/concepts/governance-and-upgrades) and [oracle](/concepts/oracles-and-dependencies) articles treat them as a class of dependency, not as a defect unique to one brand name.

Sky’s public materials also describe allocators and real-world collateral. Whether a particular allocator is funded is a governance state. It is not something this page can honestly freeze into a collateral pie chart. The mechanism to verify is still the Vat: collateral in, debt out, fee onto `rate`, unsafe vaults into liquidation.
