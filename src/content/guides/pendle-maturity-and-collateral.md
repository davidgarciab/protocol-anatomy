---
title: "Pendle maturity, redemption and PT as collateral"
seoTitle: "Pendle PT at maturity and as collateral: oracles and risks"
description: "What happens to PT, YT and LP positions before, at and after Pendle maturity, and what a lender must check before accepting PT as collateral."
summary: "A Pendle market has three phases. Before maturity PT drifts toward par and YT decays. At maturity PT redeems for the accounting asset. After maturity unredeemed positions stop being yours to earn from. Lending markets that take PT as collateral choose between a market-derived TWAP price and a deterministic linear discount."
status: "published"
published: "2026-10-29"
lastVerified: "2026-10-29"
faq:
  - question: "What happens to my PT after maturity if I do not redeem it?"
    answer: "It stays redeemable one-for-one, with no protocol fee beyond gas. But Pendle's documentation says the underlying asset stays in the SY contract and keeps accruing yield and points, and that the yield and points from unredeemed matured positions are redirected to the Pendle treasury. Redeeming promptly keeps those returns out of the treasury."
    featured: true
  - question: "Why do lenders use PT as collateral?"
    answer: "Because a PT converges to a known value at a known date, its price swings less than most collateral and approaches par as expiry nears. Lending protocols such as Morpho, Silo and Euler are named in Pendle's docs as places PT is used, which lets users earn the fixed rate while borrowing against it."
  - question: "Which oracle should a lending market use for PT?"
    answer: "Pendle's developer docs recommend the Linear Discount Oracle, a deterministic price that rises linearly to 1.0 at expiry and depends only on block.timestamp. The TWAP oracle, which derives a manipulation-resistant price from the pool's implied-rate history, remains available for integrations that need a market-derived price."
order: 10
protocol: "pendle"
versionContext: "Pendle describes PT as redeemable one-for-one at maturity, but the quality of that redemption depends on each SY and its underlying. Market lists, oracle recommendations and sPENDLE terms change."
tags:
  - pendle
  - maturity
  - collateral
concepts:
  - yield-tokenization
  - oracles-and-dependencies
  - collateral-and-liquidation
glossary:
  - principal-token
  - yield-token
  - standardized-yield
  - implied-apy
  - spendle
relatedGuides: []
versions:
  - name: "TWAP PT oracle"
    status: "active"
    note: "Market-derived PT price from cumulative implied-rate observations. Needs sufficient buffer cardinality and pool liquidity."
  - name: "Linear Discount Oracle"
    status: "active"
    note: "Deterministic price converging to 1.0 at expiry. Recommended for lending markets in the developer docs."
  - name: "vePENDLE"
    status: "deprecated"
    note: "Locks paused on 29 January 2026. Replaced by sPENDLE."
  - name: "sPENDLE"
    status: "active"
    note: "Staking token with a 14-day exit or a 5 percent fee for immediate exit. Receives buyback-funded revenue."
sources:
  - title: "Pendle: PT"
    url: "https://docs.pendle.finance/pendle-v2/ProtocolMechanics/YieldTokenization/PT"
    kind: "docs"
    publisher: "Pendle"
  - title: "Pendle: fees"
    url: "https://docs.pendle.finance/pendle-v2/ProtocolMechanics/Mechanisms/Fees"
    kind: "docs"
    publisher: "Pendle"
  - title: "Pendle developer docs: oracle overview"
    url: "https://docs.pendle.finance/pendle-v2-dev/Oracles/OracleOverview"
    kind: "docs"
    publisher: "Pendle"
  - title: "Pendle developer docs: PT as collateral"
    url: "https://docs.pendle.finance/pendle-v2-dev/Oracles/PTAsCollateral"
    kind: "docs"
    publisher: "Pendle"
  - title: "Pendle developer docs: choosing linear discount parameters"
    url: "https://docs.pendle.finance/pendle-v2-dev/Oracles/DeterministicOracles/ChoosingLinearDiscountParams"
    kind: "docs"
    publisher: "Pendle"
  - title: "Pendle developer docs: Spark linear discount oracle"
    url: "https://docs.pendle.finance/pendle-v2-dev/Contracts/Oracle/LinearDiscountOracle/SparkLinearDiscountOracle"
    kind: "docs"
    publisher: "Pendle"
  - title: "Pendle: sPENDLE"
    url: "https://docs.pendle.finance/pendle-v2/ProtocolMechanics/Mechanisms/sPENDLE"
    kind: "governance"
    publisher: "Pendle"
  - title: "Pendle: negative yield"
    url: "https://docs.pendle.finance/pendle-v2/ProtocolMechanics/NegativeYield"
    kind: "docs"
    publisher: "Pendle"
---

The first question about a Pendle position is "what is the maturity?". Every PT and YT is a claim with a date. What the claim is worth on that date, what to do with it and how another protocol should price it are all different problems. This guide takes them in order.

The [protocol page](/protocols/pendle) explains SY, PT, YT and the pool. The [concept page](/concepts/yield-tokenization) explains the idea.

## Before maturity

**PT** trades at a discount that shrinks as expiry nears, assuming the underlying holds. The AMM supports this by tightening its curve so PT's price moves toward its underlying value over time. The expected movement is a drift toward par, plus or minus changes in the market's implied APY. A fall in implied APY lifts the PT price, and a rise lowers it. That is why a PT bought for a fixed return can show a loss on a screen along the way without having changed what it pays at maturity.

**YT** decays. With the implied rate constant, its price falls roughly with time left, and it ends at zero. Yield is paid to the YT holder as it accrues and can be claimed at any time before maturity from the dashboard.

**LP** positions earn the PT's appreciation, the underlying yield, swap fees and incentives. If held to expiry, the docs say the position becomes equivalent to holding the underlying.

## At maturity

The PT redeems one-for-one for the accounting asset. After expiry, redeeming PT needs no YT, since the YT is worth nothing. The redemption goes through the YT contract, which returns SY at the current index, and the app can unwrap that SY or swap it to another asset in one step. A matured LP can exit, redeem its PT and claim rewards in a single transaction.

Two cautions:

1. **The accounting asset is not always the token.** A PT-ezETH (ETH) redeems for one ETH worth of ezETH. Read the bracket in the market name.
2. **Redemption is a claim on the SY.** If the underlying asset has been impaired, the PT redeems for less. The docs' *watermark* rule says that when the asset's exchange rate has fallen below its previous high, PT can redeem for less than one unit and YT earns nothing until the rate recovers.

## After maturity

Redeeming costs only gas. Not redeeming costs more. According to the fee documentation, the underlying stays in the SY contract and continues to accrue yield and points, but the yield and points from unredeemed matured positions are redirected to the Pendle treasury fee wallet. The reason given is an incentive to redeem and roll into new markets. A holder who leaves a matured position for a year is donating its returns.

## PT as collateral

Lending markets accept PT because it behaves like a zero-coupon bond on the asset. The developer docs list three uses:

1. **Yield arbitrage.** Pendle's example is PT-stETH at 5 percent fixed with ETH borrowable at 3 percent. Deposit the PT, borrow ETH, buy more PT, repeat. With a collateral factor of 0.8 the loop reaches 5x exposure. The page writes the return as 5 × (5 − 3) = 10 percent. Counting the debt as 4 times the capital gives 5 × 5 − 4 × 3 = 13 percent. Both depend on the borrow rate staying at 3 percent, and it is usually variable.
2. **Shorting yield.** The same loop, as a bet that the fixed yield will fall.
3. **A leveraged long of the asset while earning the fixed rate.**

Looping makes a position more sensitive to a PT price drop, and the docs list the risks a money market should assess:

- **Pendle contract risk.** SY, the yield contract, the market and sPENDLE are decoupled components. The SY implementation for each pool needs its own review.
- **Underlying protocol risk.** Each PT is built on an underlying token whose failure loses value in the PT.
- **Oracle risk.** A manipulated PT price can inflate borrowing power, or crash and cause bad debt.
- **Insufficient liquidity to liquidate.** If the PT price drops sharply, the pool may not be deep enough to absorb the collateral that liquidators receive. The page gives a method: take the deposit cap, the collateral factor, the share of loans that could become liquidatable at once and the close factor, and check that the pool can absorb that amount of PT at the liquidation bonus.
- **Volatility that liquidates unnecessarily.** A noisy price can liquidate healthy positions.

## Choosing an oracle

Pendle offers two. The TWAP oracle derives a geometric-mean price from the pool's cumulative implied-rate observations, with windows up to 65,536 blocks, about nine days on Ethereum. A buffer must be sized in advance, and the price reflects market conditions. It is hard to manipulate in a short window if the window is long enough, and a thin pool weakens that.

The **Linear Discount Oracle** is deterministic. It returns a multiplier that rises linearly to 1.0 at expiry and reads only `block.timestamp`. It has no external dependency, no liveness risk and no buffer to prepare. The integrator chooses the discount rate. The docs' guide ties it to the market's yield range: a lower upper bound on rates makes the oracle price the PT closer to par, which is more capital efficient and less conservative. Their worked example for a USDe market that matured in September 2025 suggests an 18 percent PT discount rate and 7 percent for LP tokens.

The trade-off is plain. A deterministic price cannot be pushed by a trader, and for the same reason it does not move if the underlying becomes impaired. A lender using it relies on the discount rate being conservative enough and on the LLTV and caps absorbing a sudden impairment. A lender using the TWAP relies on pool depth and the window. Pendle also publishes a variant of the linear discount oracle for Spark.

## What to check, in order

1. Maturity date and accounting asset.
2. The SY contract, who can upgrade it, and the underlying's own risks.
3. For collateral: which oracle, what discount rate or TWAP window, what cap, and how deep the pool is compared with the cap.
4. Whether the market is inside its yield range. Outside it, the pool is thin.
5. After maturity: redeem.

Pendle's documentation names Morpho as a place PT is used as collateral and publishes an oracle variant for Spark. See the [Morpho](/protocols/morpho) and [Spark](/protocols/spark) pages for how those systems isolate and limit risk.
