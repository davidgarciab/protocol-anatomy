---
title: "From Maker vaults to Sky tokens"
description: "Which Maker accounting Sky still uses, and which names changed with DAI, USDS, MKR, and SKY."
summary: "Sky did not replace the Vat with a new stablecoin design. DAI remains the internal stablecoin debt. USDS is a one-for-one ERC-20 path onto that debt. sUSDS is a savings vault. MKR converts to SKY at a fixed 24,000-to-1 rate. The vault safety check is still art times rate against ink times spot."
status: "published"
published: "2026-10-13"
lastVerified: "2026-10-13"
order: 3
protocol: "maker-sky"
versionContext: "Maker core contracts in the dss repository remain the collateral ledger. Sky’s 2026 integrator docs describe the USDS, sUSDS, and SKY routes around that ledger."
tags:
  - sky
  - maker
  - stablecoin
concepts:
  - stablecoin-mechanisms
  - governance-and-upgrades
  - on-chain-accounting
glossary:
  - dai
  - usds
  - susds
  - stusds
  - vault
  - stability-fee
relatedGuides: []
versions:
  - name: "MCD Vat"
    status: "active"
    note: "Multi-collateral vault ledger. The safety rule and the stability-fee rate still live here."
  - name: "DAI and MKR"
    status: "active"
    note: "Not described as deprecated. Both have documented converters to the newer tokens."
  - name: "USDS, sUSDS, and SKY"
    status: "active"
    note: "Sky’s token layer: one-for-one with DAI, an ERC-4626 savings rate, a separate stUSDS deposit, and a fixed MKR conversion."
sources:
  - title: "Vat detailed documentation"
    url: "https://docs.makerdao.com/smart-contract-modules/core-module/vat-detailed-documentation"
    kind: "docs"
    publisher: "MakerDAO"
  - title: "Rates module"
    url: "https://docs.makerdao.com/smart-contract-modules/rates-module"
    kind: "docs"
    publisher: "MakerDAO"
  - title: "vat.sol"
    url: "https://github.com/makerdao/dss/blob/master/src/vat.sol"
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

The renaming is real, and it is easy to over-read. Sky’s site is the public front of the system that MakerDAO operated. The integrator documentation does not say the vault ledger was discarded. It says DAI and USDS share an issuance source, and that a converter moves ERC-20 balances between them. This guide maps the names onto the contracts. The [protocol overview](/protocols/maker-sky) explains `ink`, `art`, and `rate`.

## What stayed

The Vat still stores vaults as urns. Collateral is `ink`. Normalized debt is `art`. The stability fee is the ilk’s `rate`, advanced by `Jug.drip`. A vault is safe while `art * rate` stays within `ink * spot`. Liquidation at the ledger is still `grab`. None of the Sky token pages replace those fields with a new formula.

`UsdsJoin`, in the `sky-ecosystem/usds` repository, mints the USDS ERC-20 against internal `vat.dai` and burns it to release that balance. That is the same shape as DAI’s join. USDS is another token window onto the same debt, which is why a one-for-one converter is possible. If the two tokens were backed by different ledgers, a fee-free unlimited converter would be a solvency bug. The route docs state the shared issuance source explicitly.

The [stability fee](/glossary#stability-fee) and the [Sky Savings Rate](/glossary#sky-savings-rate) remain different numbers. The fee accrues on vault debt. The savings rate accrues to USDS deposited in sUSDS. Governance sets both. Neither is a utilization slope.

## What the token routes actually specify

The [protocol token routes](https://developers.skyeco.com/quick-start/protocol-token-routes/) are specific, and they are narrower than a rebrand announcement.

| Route | Documented rate | Constraint worth remembering |
| --- | --- | --- |
| DAI ↔ USDS | 1:1, both directions | No fee, and the USDS page says a fee cannot be added later on this converter |
| MKR ↔ SKY | 1 MKR = 24,000 SKY | Fixed conversion, not a market price |
| USDS ↔ sUSDS | ERC-4626 share price | Not 1:1 with sDAI, because the two savings tokens have accrued different rates |
| DAI or USDS ↔ USDC | Peg-module swap | Inventory and debt-ceiling limits of LitePSM or the USDS wrapper, not a curve |

DAI is still in the table. The docs do not tell holders that DAI is frozen or that it must be converted. An integration can keep using DAI, USDS, or both, and should not assume balances are interchangeable without the converter. They are the same face value only after that conversion, not the same ERC-20 address.

The routes page does not list [stUSDS](/glossary#stusds). Sky’s stUSDS page documents a separate ERC-4626 deposit of USDS that funds SKY-backed borrowing and pays an stUSDS rate. That share price is not the sUSDS savings price and not the DAI converter.

USDS is upgradeable. The token page says it uses UUPS and ERC-1967. DAI’s join model and USDS’s proxy are different administrative surfaces. Converting to USDS moves the balance into a token that can be upgraded by its admin. That is a change in governance exposure, separate from the one-for-one rate.

sUSDS is a vault in the ERC-4626 sense. A Maker vault is not. Depositing USDS into sUSDS does not lock collateral or draw debt. It sells the USDS, temporarily, to the savings module in exchange for shares whose price is the `chi` accumulator. Withdrawing redeems USDS. The [on-chain accounting](/concepts/on-chain-accounting) article uses this pair — urn versus ERC-4626 — as the example of two objects that English calls a vault.

## What this guide will not treat as settled

Sky’s public writing describes allocators, a broader balance sheet, and a savings product funded by protocol revenue. The mechanism pages support the savings token and the converters. They do not, on the sources read for this article, provide a single on-chain object called “the Sky collateral portfolio” that replaced the ilk list. Collateral types remain ilks in the Vat until governance removes them. A new allocator is a governance and integration fact. It should be read from current governance and the chainlog Sky publishes, not from a static article.

Historical Maker docs now sit on a documentation host that Sky also uses. A page titled as Maker documentation can redirect toward Sky navigation, as happened with some module URLs checked for this publication. Prefer the `dss` source and the pages that still define `ink` and `art` when the marketing site and the module docs disagree about scope. The [methodology](/methodology) records that rule.

## Integration consequences

- Price DAI and USDS as the same unit only along the documented converter, and do not pool them one-for-one with sUSDS, stUSDS, or sDAI.
- Display vault debt as `art * rate` after `drip`, not as the stored `art`.
- Treat SKY as the governance token at the fixed conversion from MKR, and do not infer a market rate of 24,000 from the converter. The converter is the peg between the two governance tokens, in the same way the DAI converter is a peg between the two stablecoin tokens.
- Expect USDS upgradeability. Do not expect the Vat’s safety check to be upgradeable in the same way; changes there are governance actions on a live ledger, which is its own risk, documented as authorization on Vat functions rather than as a UUPS token.

The system can still fail the way a collateralized stablecoin fails: an oracle writes a bad `spot`, an auction does not cover `sin`, or governance raises a ceiling the collateral cannot support. The new tickers do not change that list.
