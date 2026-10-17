---
title: "Interest-rate models"
seoTitle: "DeFi interest rate models: Aave and Maker"
description: "How Aave’s two-slope utilization curve differs from Maker’s governance-set stability fee."
summary: "Aave sets a variable borrow rate from utilization, with a kink at an optimal point and a reserve factor that skims the supplier rate. Maker sets a stability fee per collateral type and accrues it by raising a shared rate multiplier. The two are not interchangeable formulas."
status: "published"
published: "2026-10-13"
lastVerified: "2026-10-14"
changes:
  - date: "2026-10-14"
    summary: "Corrected how Aave rates compound: the liquidity index accrues linearly and the variable-borrow index uses a binomial approximation, as `MathUtils.sol` shows."
order: 6
group: "credit"
tags:
  - interest
  - rates
protocols:
  - aave
  - maker-sky
glossary:
  - utilization
  - reserve-factor
  - stability-fee
  - risk-premium
related:
  - lending-utilization
  - stablecoin-mechanisms
  - on-chain-accounting
sources:
  - title: "Aave V3 interest rate strategy"
    url: "https://aave.com/docs/aave-v3/smart-contracts/interest-rate-strategy"
    kind: "docs"
    publisher: "Aave"
  - title: "Aave V4 overview"
    url: "https://github.com/aave/aave-v4/blob/main/docs/overview.md"
    kind: "docs"
    publisher: "Aave"
  - title: "MathUtils.sol at 2437c560"
    url: "https://github.com/aave/aave-v3-core/blob/2437c5600c12ab0faefc8173fff1ca9615732ce5/contracts/protocol/libraries/math/MathUtils.sol"
    kind: "code"
    publisher: "Aave"
  - title: "ReserveLogic.sol at 6d6fa53d"
    url: "https://github.com/aave/aave-v3-core/blob/6d6fa53d360b43f492ff5b3c7033f95aee4f1335/contracts/protocol/libraries/logic/ReserveLogic.sol"
    kind: "code"
    publisher: "Aave"
  - title: "Rates module"
    url: "https://docs.makerdao.com/smart-contract-modules/rates-module"
    kind: "docs"
    publisher: "MakerDAO"
  - title: "Jug detailed documentation"
    url: "https://docs.makerdao.com/smart-contract-modules/rates-module/jug-detailed-documentation"
    kind: "docs"
    publisher: "MakerDAO"
---

“The protocol pays interest” hides the mechanism that computes it. On this site two mechanisms are documented well enough to contrast. Aave’s rate is a function of how full the reserve is. Maker’s stability fee is a parameter governance sets, accrued by a global multiplier per collateral type.

## Aave’s kink

The V3 strategy documentation describes two slopes around `OPTIMAL_USAGE_RATIO`. Below that utilization, the variable borrow rate is a base plus a fraction of the first slope. Above it, the second slope applies to the remaining distance up to full utilization. The second slope is the expensive region. It is how the pool shouts that cash is scarce.

The function returns a liquidity rate and a variable borrow rate in ray units, a fixed-point scale of 1e27. Aave treats those values as annual rates. The index update is not one shared compounding function. In `MathUtils.sol` at `2437c560` and `ReserveLogic.sol` at `6d6fa53d`, the liquidity index accrues linearly and the variable-borrow index uses a binomial approximation. The formulas, and the conditions that skip an update, are on the [accounting](/concepts/on-chain-accounting) page. The [reserve factor](/glossary/reserve-factor/) is the share of interest that does not go to suppliers. So the supply rate is not `utilization * borrow rate`. It is that product after the treasury’s cut, and only if no other adjustment is configured. The rate-strategy documentation and the Maker sources were read on 13 October 2026. The index functions were read on 14 October 2026.

Rates are stored as indexes. The borrow index grows with the variable rate. Debt-token balances are scaled by it. The liquidity index grows with the supply rate. aToken balances are scaled by it. Nobody is sent a separate interest payment. The next interaction reads a larger balance. That is why a view of `balanceOf` on an aToken can change between blocks without a transfer.

V4’s overview keeps a drawn rate from hub utilization and stacks a [risk premium](/glossary/risk-premium/) on top. The premium is not a third slope of the same curve. It depends on which collateral covers the debt. Two borrowers of the same asset can owe different total rates. Quoting “the USDC borrow rate” was already incomplete in V3 once eMode and caps existed. In V4 it is incomplete even for the interest formula.

## Maker’s duty

The Jug stores a per-second rate: a collateral-specific `duty` plus a global `base`. `drip` turns elapsed time into a multiplier and folds it into `Vat.ilks[ilk].rate`. Every vault of that ilk sees its debt, `art * rate`, rise together. The surplus from the fee is credited to the system, not to a depositor in the way an aToken balance grows. The closer analogy to an Aave supplier is a holder of sUSDS, and the [Sky Savings Rate](/glossary/sky-savings-rate/) is yet a third number, set by governance and paid from protocol revenue rather than from a utilization kink.

If nobody calls `drip`, the multiplier does not move. Fees for a vault opened and closed between calls can be missed. Aave’s index has the same laziness, but the next pool interaction accrues it. Maker needs a caller for that ilk. Keepers do it because a stale `rate` also stales the safety check.

## What not to average

A dashboard that shows one “DeFi lending rate” is averaging different contracts. Aave’s rate will move in the same block as a large borrow. Maker’s will not, until governance changes `duty` or the next `drip` applies the rate already set. crvUSD’s borrower interest, mentioned on Curve’s overview as the source of savings-crvUSD yield, is a third implementation and is not either formula. Use the protocol page before displaying a number.
