---
title: "Delta-neutral dollars"
seoTitle: "Delta-neutral stablecoins: how USDe holds $1"
description: "How a synthetic dollar holds its value by pairing volatile collateral with short futures, where its yield comes from, and what can break it."
summary: "A delta-neutral dollar is backed by assets that move, such as ETH, and by short futures of the same size that move the other way. The pair holds a dollar value, and the income is the funding rate paid to shorts. The risks are negative funding, margin, custody and the cost of leaving."
status: "published"
published: "2026-10-29"
lastVerified: "2026-10-29"
faq:
  - question: "How can a stablecoin backed by ETH stay at one dollar?"
    answer: "By hedging. For each unit of volatile collateral the issuer opens a short futures position of the same dollar size. If the price falls, the collateral loses what the short gains, and the other way round, so the combined value stays near a fixed dollar amount. USDe is built this way, with stable assets in the portfolio needing no hedge."
    featured: true
  - question: "Where does the yield on a synthetic dollar come from?"
    answer: "Mostly from the funding rate. A perpetual futures contract keeps its price near spot with payments between longs and shorts. When demand for long leverage is higher, shorts are paid. A delta-neutral issuer is short, so it collects that payment, and it also collects staking income on collateral such as a liquid staking token."
  - question: "Can the funding rate turn negative and hurt the stablecoin?"
    answer: "Yes. When shorts outnumber longs the issuer pays funding instead of earning it. Ethena's documentation says negative funding has historically not persisted, and that its reserve fund and a shift toward stable assets are the response. Periods of negative revenue are not passed to sUSDe holders, which leaves the cost with the protocol's own buffers."
order: 19
group: "monetary"
tags:
  - stablecoins
  - derivatives
  - funding-rate
protocols:
  - ethena
  - maker-sky
glossary:
  - usde
  - susde
  - delta-neutral
  - funding-rate
  - off-exchange-settlement
  - reserve-fund
related:
  - stablecoin-mechanisms
  - collateral-and-liquidation
  - oracles-and-dependencies
  - security-assumptions
sources:
  - title: "How USDe works"
    url: "https://docs.ethena.fi/overview/how-usde-works"
    kind: "docs"
    publisher: "Ethena"
  - title: "Delta-neutral stability"
    url: "https://docs.ethena.fi/backing-assets/crypto-basis-trade/delta-neutral-stability"
    kind: "docs"
    publisher: "Ethena"
  - title: "Crypto basis trade"
    url: "https://docs.ethena.fi/backing-assets/crypto-basis-trade"
    kind: "docs"
    publisher: "Ethena"
  - title: "Funding risk"
    url: "https://docs.ethena.fi/protocol-overview/risks/funding-risk"
    kind: "docs"
    publisher: "Ethena"
  - title: "Margin collateral risks"
    url: "https://docs.ethena.fi/protocol-overview/risks/margin-collateral-risks"
    kind: "docs"
    publisher: "Ethena"
  - title: "Reserve fund"
    url: "https://docs.ethena.fi/protocol-overview/reserve-fund"
    kind: "docs"
    publisher: "Ethena"
  - title: "Off-exchange custody"
    url: "https://docs.ethena.fi/overview/off-exchange-custody"
    kind: "docs"
    publisher: "Ethena"
---

Most on-chain dollars hold their value by taking more collateral than they issue. [Maker and Sky](/protocols/maker-sky) lock assets in vaults and liquidate them if they fall short. A fiat-backed coin holds bank deposits and short-term government debt. A delta-neutral dollar uses a third method. It holds collateral that moves, offsets the movement with a derivative, and lets the pair behave like a dollar.

The [stablecoin mechanisms](/concepts/stablecoin-mechanisms) page lists the families. This page covers the third in detail, using [Ethena](/protocols/ethena) as the example.

## The hedge in numbers

Suppose a minter provides 1 ETH when ETH is worth 3,000 dollars. The issuer holds the ETH and sells short futures of 3,000 dollars notional. The table shows what each leg is worth after ETH moves.

| ETH price | Spot leg | Short leg profit or loss | Combined |
| --- | --- | --- | --- |
| 3,000 | 3,000 | 0 | 3,000 |
| 3,600 (+20%) | 3,600 | -600 | 3,000 |
| 2,400 (-20%) | 2,400 | +600 | 3,000 |

The combined value is the same in every row. The position has zero delta: no exposure to the direction of ETH's price. Ethena's documentation says it trades without effective leverage across exchanges because each short matches the size of the backing it hedges. Stable assets in the portfolio, liquid stablecoins and short-duration real-world assets, are already dollar-valued and need no hedge.

The figures are illustrative. Real hedges are never perfect: the futures price can differ from spot for a moment, and fees and slippage apply when positions are opened.

## Where the yield comes from

A perpetual future has no expiry. To keep its price near spot, longs and shorts pay each other a [funding rate](/glossary/funding-rate/) at fixed intervals. When more traders want long leverage than short, longs pay shorts. The delta-neutral holder is short, so it collects.

As a scale, a funding payment of 0.01 percent every eight hours is 0.0001 × 3 × 365, or about 10.95 percent a year. That is an illustration of the arithmetic, not a quoted rate. Ethena's page reports historical open-interest-weighted funding for ETH perpetuals of about 16 percent in 2021, 0.6 percent in 2022, about 9 percent in 2023 and about 13 percent in 2024, and says the average has a positive bias. These are the issuer's figures and past results.

The same pair also earns whatever the collateral earns. If the spot leg is a liquid staking token such as [stETH](/glossary/steth/), staking income is added. The documentation now describes a wider backing mix as well, including non-crypto basis trades, lending and tokenized real-world assets, so the yield is no longer one trade.

## What can go wrong

**Negative funding.** If shorts outnumber longs, the issuer pays. The documentation says negative funding periods have tended not to persist, and that the response is a reserve fund plus a shift into stable assets. The [reserve fund](/glossary/reserve-fund/) page states that the share of revenue directed to it is currently 0 percent, so the buffer is whatever it already holds. A reader should check the current balance on the transparency dashboard, not assume one.

**Margin and liquidation on the short leg.** A short loses when the price rises. On an exchange it needs margin, and the collateral that offsets it sits elsewhere. Ethena's design keeps assets with custodians and delegates margin value to exchanges, so the offsetting gain and the margin requirement have to be moved between venues. The mechanism is called [off-exchange settlement](/glossary/off-exchange-settlement/), with settlement generally on daily cycles, which bounds how much an exchange can owe at once.

**Counterparty and custody risk.** Exchange failure, custodian failure or a freeze affects hedges and backing even when the price math is correct.

**Basis between assets.** If the collateral is a liquid staking token and the hedge is on ETH, a depeg between them is unhedged. The documentation says it prefers tokens with a low chance of depegging for this reason.

**Quote-currency exposure.** Linear perpetuals are margined in USDT. The documentation notes the issuer is therefore long USDT with no offset, and that it could move toward inverse contracts if USDT became a problem.

**The cost of leaving.** A synthetic dollar is liquid only to the extent its holders can sell. Direct minting and redeeming is limited to approved counterparties, and everyone else exits through markets. The [mint and exit guide](/guides/ethena-mint-and-exit) covers how that works, including the staked token's cooldown.

## How this differs from an overcollateralized dollar

| | Overcollateralized (Sky, Maker) | Delta-neutral (Ethena) |
| --- | --- | --- |
| Backing | Collateral worth more than the debt | Assets and hedges worth about the same |
| Stability from | A buffer and liquidation | A hedge held in size |
| Failure mode | Collateral falls faster than liquidations clear | Hedge, funding, custody or margin fail |
| Yield source | Borrower fees and protocol income | Funding, staking and other backing income |
| Direct exit at par | Vault owners repay their own debt. Others can swap through the LitePSM | Approved market makers mint and redeem, per the docs |

For a full side-by-side see [collateralized and synthetic dollars compared](/compare/collateralized-vs-synthetic-dollars). The [oracles and dependencies](/concepts/oracles-and-dependencies) page covers the price feeds both designs rely on, and [security assumptions](/concepts/security-assumptions) lists what remains trusted.
