---
title: "Collateral and liquidation"
seoTitle: "How DeFi liquidation works: Aave, Maker, crvUSD"
description: "How Aave, Maker, and Curve’s crvUSD decide that a position is unsafe and what the liquidator actually receives."
summary: "Collateral lets a protocol lend or mint against an asset it can seize. Liquidation is the seizure. Aave sizes it with a health factor and a close factor or target health factor. Maker uses art · rate against ink · spot and then an auction. crvUSD converts collateral gradually through LLAMMA."
status: "published"
published: "2026-10-13"
lastVerified: "2026-10-13"
changes:
  - date: "2026-10-14"
    summary: "Added a worked Aave V3 liquidation with the repay limit, bonus, and protocol fee from `GenericLogic.sol` and `LiquidationLogic.sol`, and a health-factor calculator."
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
  - title: "GenericLogic.sol at cf4e138c"
    url: "https://github.com/aave-dao/aave-v3-origin/blob/cf4e138c5959b1434a08c72c759d422c227bd47e/src/contracts/protocol/libraries/logic/GenericLogic.sol"
    kind: "code"
    publisher: "Aave"
  - title: "LiquidationLogic.sol at 2f6a0fc9"
    url: "https://github.com/aave-dao/aave-v3-origin/blob/2f6a0fc96a957265fb38913053831e0880345d1f/src/contracts/protocol/libraries/logic/LiquidationLogic.sol"
    kind: "code"
    publisher: "Aave"
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

Aave computes a [health factor](/glossary/health-factor/) from oracle-priced collateral, after a [liquidation threshold](/glossary/liquidation-threshold/) that is less than the full price, divided by debt. The V4 docs treat 1 as the boundary. Above it, `liquidationCall` is not eligible. The threshold is not the loan-to-value. A borrower can be unable to draw more and still be safe from liquidation. That gap is deliberate. It gives the position room to move before it is closed.

Maker does not store a health factor. The Vat’s safety check is `art * rate <= ink * spot`. `spot` already includes the liquidation ratio. There is one comparison per vault, not a blended health factor across every collateral a user posted, because a vault is one collateral type. Aave blends the user’s enabled collateral. That is why an Aave account is one position and a Maker user can have many urns.

crvUSD, in Curve’s overview, does not wait for a single ratio and then auction everything. LLAMMA converts collateral toward the stablecoin as the price moves through bands. The position is being liquidated gradually. The borrower can end up partially in the stablecoin without a liquidator’s transaction at a single health-factor tick. Calling that “the same as Aave” because both involve collateral is how integrations mis-simulate losses.

## How much gets seized

V3, as the V4 overview describes it, uses a close factor: typically half the debt, or all of it if the position is deep enough underwater or small enough. The liquidator posts the repaid asset and receives collateral plus a static [bonus](/glossary/liquidation-bonus/), minus a protocol fee.

V4 sizes the repayment to a target health factor and increases the bonus as health falls. The overview’s formula is linear between the liquidation threshold and a lower health factor where the maximum bonus applies. Dust rules can force a larger repayment so the remainder is not a few dollars of debt. A deficit remains only when collateral is gone and debt is not. Another spoke can then spend supplied shares to clear that deficit. That is internal loss allocation, not a magical repayment.

Maker’s `grab` removes the vault’s collateral and debt from the urn in the Vat. The sale is `dog.sol` and the auction contracts beside it, not a bonus baked into `grab`. If the auction does not raise enough stablecoin, the system keeps unbacked debt (`sin`) until surplus cancels it. There is no close factor in the safety check itself.

## A worked Aave V3 liquidation

The numbers below follow the current V3 code in `aave-v3-origin`: the health factor in [`GenericLogic.sol` at `cf4e138c`](https://github.com/aave-dao/aave-v3-origin/blob/cf4e138c5959b1434a08c72c759d422c227bd47e/src/contracts/protocol/libraries/logic/GenericLogic.sol) and the repay limit and bonus split in [`LiquidationLogic.sol` at `2f6a0fc9`](https://github.com/aave-dao/aave-v3-origin/blob/2f6a0fc96a957265fb38913053831e0880345d1f/src/contracts/protocol/libraries/logic/LiquidationLogic.sol), both read on 14 October 2026. The risk parameters are illustrative, not a live market’s: an 80 percent liquidation threshold, a 5 percent liquidation bonus (stored as `10500`), and a protocol fee of 10 percent of the bonus. USDC is priced at 1 USD.

A borrower supplies 10 ETH at 2,000 USD and borrows 15,000 USDC. The health factor is collateral value times the liquidation threshold, divided by debt: 20,000 × 0.80 / 15,000 = 1.0667. ETH falls to 1,850 USD. The health factor is now 18,500 × 0.80 / 15,000 = 0.9867. It is below 1, so anyone may call `liquidationCall`. The boundary was crossed at 1,875 USD, where 10 × price × 0.80 equals the debt.

| Step | Value |
| --- | --- |
| Repay limit | 7,500 USDC, half the debt |
| Collateral at face value | 7,500 / 1,850 = 4.05405 ETH |
| Collateral leaving the borrower, with the 5% bonus | 4.25676 ETH |
| Bonus portion | 0.20270 ETH |
| Protocol fee, 10% of the bonus | 0.02027 ETH (37.50 USD) |
| Liquidator receives | 4.23649 ETH (7,837.50 USD) |
| Borrower after | 5.74324 ETH (10,625 USD) against 7,500 USDC |
| Health factor after | 10,625 × 0.80 / 7,500 = 1.1333 |

The repay limit is half because three conditions all hold: the health factor is above 0.95 (`CLOSE_FACTOR_HF_THRESHOLD`), and both the collateral and the debt are worth at least 2,000 in the market’s base currency (`MIN_BASE_MAX_CLOSE_FACTOR_THRESHOLD`). If any of them failed, one call could repay the whole debt. The partial liquidation is also allowed to stand because it leaves at least 1,000 of both collateral and debt behind (`MIN_LEFTOVER_BASE`). A smaller remainder would revert with `MustNotLeaveDust` unless the call cleared the debt or the collateral entirely.

The borrower gave up 7,875 USD of ETH to clear 7,500 USD of debt. The 375 USD difference is the bonus: 337.50 to the liquidator, before gas and the cost of selling the ETH, and 37.50 to the treasury. A call raises the health factor only while it is above the threshold times the bonus, 0.80 × 1.05 = 0.84 here. Below that line, for example after a price gap, a partial liquidation leaves the remaining position less healthy than before.

<diagram-placeholder name="health-factor-calculator"></diagram-placeholder>

## Bad debt is the residual

Every one of these mechanisms can fail open. The oracle can be late. The bonus can be too small for a liquidator to bother. The auction can find no bid. The collateral can gap through the bands faster than arbitrage restores them. The residue is [bad debt](/glossary/bad-debt/). Aave V4 names the accounting object a deficit. Maker names it `sin`. The lending pool’s suppliers, or the stablecoin’s holders, absorb it if governance does not recapitalize the system.

Liquidation is therefore not a punishment feature. It is the protocol’s attempt to convert a private loss into a sale before the loss is socialized. Reading a liquidator’s profit without reading the unsold remainder is half the mechanism.

The prices that feed all three designs are [oracles](/concepts/oracles-and-dependencies) or, in LLAMMA’s case, the AMM’s own price path. A liquidation rule cannot be safer than the price it believes.
