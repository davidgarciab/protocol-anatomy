---
title: "How Aave, Maker and crvUSD liquidate a position"
seoTitle: "Aave vs Maker vs crvUSD liquidation compared"
description: "Health factors, vault ratios and LLAMMA bands compared: when a position becomes unsafe, how much is taken, and who bears the loss if it falls short."
summary: "Aave closes part of a debt when a health factor falls below 1 and pays the liquidator a bonus. Maker confiscates the whole vault in the Vat and sells the collateral through a separate auction. crvUSD converts collateral gradually as the price moves through bands. The residue in each design is bad debt."
status: "published"
published: "2026-10-26"
lastVerified: "2026-10-29"
changes:
  - date: "2026-10-29"
    summary: "Added Morpho Blue, which has no close factor and a bonus derived from the LLTV, and SparkLend’s variable close factor."
faq:
  - question: "Does Maker have a close factor like Aave?"
    answer: "No. The Vat's safety check has no close factor. grab removes the vault's collateral and debt from the urn and records the debt as unbacked debt, sin. A separate auction contract sells the collateral for stablecoin so that debt can be cancelled."
  - question: "How is crvUSD liquidation different from Aave's?"
    answer: "Aave waits for the health factor to fall below 1 and then lets a liquidator repay debt and seize collateral. crvUSD's LLAMMA converts collateral toward the stablecoin as the price moves through bands, so the position is liquidated gradually and the borrower can end up partly in the stablecoin without a single liquidation transaction."
order: 4
protocols:
  - aave
  - maker-sky
  - curve
  - morpho
  - spark
concepts:
  - collateral-and-liquidation
  - oracles-and-dependencies
  - stablecoin-mechanisms
glossary:
  - health-factor
  - close-factor
  - liquidation-bonus
  - liquidation-threshold
  - bad-debt
  - dutch-auction
tags:
  - liquidation
  - collateral
  - risk
sources:
  - title: "Aave V4 overview"
    url: "https://github.com/aave/aave-v4/blob/main/docs/overview.md"
    kind: "docs"
    publisher: "Aave"
  - title: "GenericLogic.sol at cf4e138c"
    url: "https://github.com/aave-dao/aave-v3-origin/blob/cf4e138c5959b1434a08c72c759d422c227bd47e/src/contracts/protocol/libraries/logic/GenericLogic.sol"
    kind: "code"
    publisher: "Aave"
  - title: "LiquidationLogic.sol at 2f6a0fc9"
    url: "https://github.com/aave-dao/aave-v3-origin/blob/2f6a0fc96a957265fb38913053831e0880345d1f/src/contracts/protocol/libraries/logic/LiquidationLogic.sol"
    kind: "code"
    publisher: "Aave"
  - title: "Vat (core accounting)"
    url: "https://developers.skyeco.com/protocol/core/vat/"
    kind: "docs"
    publisher: "Sky"
  - title: "Collateral liquidation"
    url: "https://developers.skyeco.com/protocol/vaults/collateral-liquidation/"
    kind: "docs"
    publisher: "Sky"
  - title: "dog.sol"
    url: "https://github.com/makerdao/dss/blob/master/src/dog.sol"
    kind: "code"
    publisher: "MakerDAO"
  - title: "LLAMMA explainer"
    url: "https://docs.curve.finance/developer/crvusd/llamma-explainer"
    kind: "docs"
    publisher: "Curve"
  - title: "crvUSD overview"
    url: "https://docs.curve.finance/developer/crvusd/overview/"
    kind: "docs"
    publisher: "Curve"
---

Collateral is an asset the protocol can take if a debt is not covered, and liquidation is the taking. The three designs here disagree on when a position is unsafe, how much is taken in one transaction, and who sells the collateral. This page compares them. It restates what the [collateral and liquidation](/concepts/collateral-and-liquidation) article and the [Aave](/protocols/aave), [Maker and Sky](/protocols/maker-sky) and [Curve](/protocols/curve) articles establish, so the sources behind each claim are there and in the list below.

## At a glance

| Question | Aave V3 | Aave V4 | Maker / Sky | crvUSD |
| --- | --- | --- | --- | --- |
| What marks a position unsafe? | [Health factor](/glossary/health-factor/) below 1 across the user’s enabled collateral | The same boundary | `art * rate > ink * spot`, for one collateral type | The price moving through LLAMMA bands |
| How much is taken at once? | A [close factor](/glossary/close-factor/): half the debt by default, all of it in the cases below | Enough to restore a target health factor, unless dust rules force more | The vault is confiscated by `Dog.bark`, normally in full, or in part when the `Hole` limits on active auctions apply | Gradual, band by band |
| Who sells the collateral? | The liquidator, who repays debt and receives collateral | The liquidator | A separate auction contract, `dog.sol` and the auctions beside it | The AMM itself |
| What does the liquidator earn? | A static [bonus](/glossary/liquidation-bonus/), minus a protocol fee | A bonus that rises as health falls | The auction’s result, not a bonus inside `grab` | No liquidator transaction is needed for the conversion |
| What is the residue called? | [Bad debt](/glossary/bad-debt/) | A deficit, which another spoke can clear with supplied shares | `sin`, unbacked debt | Not covered here |

## Aave V3: a health factor and a close factor

The health factor compares risk-adjusted collateral with debt, after a [liquidation threshold](/glossary/liquidation-threshold/) below the full price. Below 1, `liquidationCall` can repay debt and seize collateral. The V4 overview says V3’s default close factor is 50 percent, and 100 percent when the health factor is under 0.95 or the position is below a value threshold. The liquidator repays an asset and receives collateral plus a bonus, minus a protocol fee.

The worked example in the collateral article uses illustrative parameters: 10 ETH supplied at 2,000 USD, 15,000 USDC borrowed, an 80 percent threshold and a 5 percent bonus. When ETH falls to 1,850 USD the health factor is 0.9867. A liquidator repays 7,500 USDC, receives about 4.24 ETH after the protocol fee, and the borrower’s health factor rises to 1.1333. The 375 USD difference between the collateral taken and the debt cleared is the bonus.

## Aave V4: a target instead of a fraction

V4 sizes the repayment to a target health factor and increases the bonus as health falls. Dust rules can force a larger repayment so that the remainder is not a few dollars of debt, and the overview sets that threshold at 1,000 USD of value. A deficit remains only when collateral is gone and debt is not. Another spoke can then spend supplied shares through `eliminateDeficit`. That is loss allocation inside the system, not a repayment from outside.

## Maker: confiscate, then auction

Maker stores no health factor. One comparison per vault decides safety, and `spot` already contains the liquidation ratio. `grab` takes the collateral and normalized debt off the urn and records the debt as `sin`. Selling the collateral is a different module: `Dog.bark` sends the collateral to a `Clipper` Dutch auction. The Vat has no close factor, but `Dog` limits how much stablecoin active auctions may need to raise through `Hole` and a per-collateral `hole`, and when a liquidation would exceed them it liquidates only part of the vault. If the auction does not raise enough stablecoin, `sin` remains until surplus or governance absorbs it.

## crvUSD: a position that converts as it falls

Curve’s LLAMMA explainer describes bands that convert collateral toward the stablecoin as the price falls, through arbitrageurs trading against the AMM, and back toward the collateral if the price recovers. A loan that stays in its range until its health reaches zero is fully liquidated. Nothing waits for one ratio and then closes everything. The borrower can end up partially in the stablecoin without a liquidator’s transaction at a single tick. Calling that “the same as Aave” because both involve collateral is how integrations mis-simulate losses.

## Morpho Blue and SparkLend: two more points on the map

[Morpho Blue](/protocols/morpho) has no close factor. A liquidator passes either the collateral to seize or the debt shares to repay, and may repay any amount up to the whole debt. The bonus is not a per-asset setting. It is `min(1.15, 1 / (1 − 0.3 × (1 − LLTV)))`, which is about 1.044 at an 86 percent LLTV and about 1.017 at 94.5 percent. A higher LLTV leaves a smaller margin to pay a liquidator. If a liquidation empties a borrower’s collateral while debt remains, the contract writes the remainder off against that market’s suppliers in the same call.

[SparkLend](/protocols/spark) keeps the Aave V3 shape, with a variable close factor of up to 50 percent of the debt while the health factor is between 0.95 and 1 and up to 100 percent at or below 0.95. It adds a killswitch oracle that halts new borrowing against pegged collateral when its market price drifts from its underlying, which acts before a liquidation is needed. The [pooled and isolated lending comparison](/compare/pooled-vs-isolated-lending) sets the three lenders side by side.

## What every design shares

Each mechanism can fail open. The oracle can be late, the bonus can be too small for a liquidator to bother, the auction can find no bid, and the collateral can gap through the bands faster than arbitrage restores them. The residue is bad debt in some form: Aave’s deficit, Maker’s `sin`, or a stablecoin that is no longer fully backed. Suppliers, stablecoin holders or governance absorb it. Liquidation is the protocol’s attempt to turn a private loss into a sale before it is socialized, so reading a liquidator’s profit without the unsold remainder is half the mechanism.

All three rules are also only as safe as the price they believe. The [oracle](/concepts/oracles-and-dependencies) article treats that dependency as a class. For LLAMMA the price is the AMM’s own path, which has its own assumptions.
