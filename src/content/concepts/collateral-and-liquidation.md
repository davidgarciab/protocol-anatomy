---
title: "Collateral and liquidation"
description: "How Aave, Maker, and Curve’s crvUSD decide that a position is unsafe and what the liquidator actually receives."
summary: "Collateral lets a protocol lend or mint against an asset it can seize. Liquidation is the seizure. Aave sizes it with a health factor and a close factor or target health factor. Maker uses art · rate against ink · spot and then an auction. crvUSD converts collateral gradually through LLAMMA."
status: "published"
published: "2026-10-13"
lastVerified: "2026-10-13"
order: 7
group: "credit"
tags:
  - liquidation
  - collateral
protocols:
  - aave
  - maker-sky
  - curve
glossary:
  - health-factor
  - liquidation-threshold
  - liquidation-bonus
  - vault
  - bad-debt
related:
  - lending-utilization
  - stablecoin-mechanisms
  - oracles-and-dependencies
sources:
  - title: "Aave V4 overview"
    url: "https://github.com/aave/aave-v4/blob/main/docs/overview.md"
    kind: "docs"
    publisher: "Aave"
  - title: "Aave V3 Pool"
    url: "https://www.aave.com/docs/aave-v3/smart-contracts/pool"
    kind: "docs"
    publisher: "Aave"
  - title: "Vat detailed documentation"
    url: "https://docs.makerdao.com/smart-contract-modules/core-module/vat-detailed-documentation"
    kind: "docs"
    publisher: "MakerDAO"
  - title: "dog.sol"
    url: "https://github.com/makerdao/dss/blob/master/src/dog.sol"
    kind: "code"
    publisher: "MakerDAO"
  - title: "crvUSD overview"
    url: "https://docs.curve.finance/developer/crvusd/overview/"
    kind: "docs"
    publisher: "Curve"
---

Collateral is an asset the protocol can take if a debt is not covered. Liquidation is the taking. The designs on this site do not agree on when the position is unsafe or on how much is taken in one transaction.

<diagram-placeholder name="liquidation-flow"></diagram-placeholder>

## A health factor, a vault ratio, a band

Aave computes a [health factor](/glossary#health-factor) from oracle-priced collateral, after a [liquidation threshold](/glossary#liquidation-threshold) that is less than the full price, divided by debt. The V4 docs treat 1 as the boundary. Above it, `liquidationCall` is not eligible. The threshold is not the loan-to-value. A borrower can be unable to draw more and still be safe from liquidation. That gap is deliberate. It gives the position room to move before it is closed.

Maker does not store a health factor. The Vat’s safety check is `art * rate <= ink * spot`. `spot` already includes the liquidation ratio. There is one comparison per vault, not a blended health factor across every collateral a user posted, because a vault is one collateral type. Aave blends the user’s enabled collateral. That is why an Aave account is one position and a Maker user can have many urns.

crvUSD, in Curve’s overview, does not wait for a single ratio and then auction everything. LLAMMA converts collateral toward the stablecoin as the price moves through bands. The position is being liquidated gradually. The borrower can end up partially in the stablecoin without a liquidator’s transaction at a single health-factor tick. Calling that “the same as Aave” because both involve collateral is how integrations mis-simulate losses.

## How much gets seized

V3, as the V4 overview describes it, uses a close factor: typically half the debt, or all of it if the position is deep enough underwater or small enough. The liquidator posts the repaid asset and receives collateral plus a static [bonus](/glossary#liquidation-bonus), minus a protocol fee.

V4 sizes the repayment to a target health factor and increases the bonus as health falls. The overview’s formula is linear between the liquidation threshold and a lower health factor where the maximum bonus applies. Dust rules can force a larger repayment so the remainder is not a few dollars of debt. A deficit remains only when collateral is gone and debt is not. Another spoke can then spend supplied shares to clear that deficit. That is internal loss allocation, not a magical repayment.

Maker’s `grab` removes the vault’s collateral and debt from the urn in the Vat. The sale is `dog.sol` and the auction contracts beside it, not a bonus baked into `grab`. If the auction does not raise enough stablecoin, the system keeps unbacked debt (`sin`) until surplus cancels it. There is no close factor in the safety check itself.

## Bad debt is the residual

Every one of these mechanisms can fail open. The oracle can be late. The bonus can be too small for a liquidator to bother. The auction can find no bid. The collateral can gap through the bands faster than arbitrage restores them. The residue is [bad debt](/glossary#bad-debt). Aave V4 names the accounting object a deficit. Maker names it `sin`. The lending pool’s suppliers, or the stablecoin’s holders, absorb it if governance does not recapitalize the system.

Liquidation is therefore not a punishment feature. It is the protocol’s attempt to convert a private loss into a sale before the loss is socialized. Reading a liquidator’s profit without reading the unsold remainder is half the mechanism.

The prices that feed all three designs are [oracles](/concepts/oracles-and-dependencies) or, in LLAMMA’s case, the AMM’s own price path. A liquidation rule cannot be safer than the price it believes.
