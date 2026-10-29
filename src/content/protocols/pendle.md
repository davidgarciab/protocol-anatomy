---
title: "Pendle"
seoTitle: "How Pendle works: SY, PT, YT and the yield AMM"
description: "How Pendle splits yield-bearing assets into principal and yield tokens, trades them in one time-aware AMM, and what sPENDLE, fees and oracles add."
summary: "Pendle wraps a yield-bearing token as SY, splits it into a principal token and a yield token that expire on a date, and trades both against SY in a single AMM that tightens as maturity approaches. A PT is a fixed rate, a YT is a leveraged variable rate. sPENDLE now receives protocol revenue."
status: "published"
published: "2026-10-29"
lastVerified: "2026-10-29"
faq:
  - question: "How does Pendle give a fixed yield?"
    answer: "You buy a principal token below its face value and hold it to maturity, when it redeems one-for-one for the accounting asset. The discount you paid, annualized, is the fixed rate, and it does not depend on what the underlying asset pays in the meantime. The risk you keep is that the underlying asset or its redemption fails."
    featured: true
  - question: "What is the difference between PT, YT and SY on Pendle?"
    answer: "SY is a wrapper that gives a yield-bearing token a standard interface and has no maturity. PT is the claim on its principal at maturity. YT is the claim on all its yield, rewards and points until maturity. Depositing SY mints equal PT and YT, and burning equal amounts redeems SY before maturity."
    featured: true
  - question: "Why does a YT lose value over time?"
    answer: "Because it earns only until maturity, so with a constant implied rate its price falls roughly with the time left and becomes zero at expiry. A buyer profits if the average underlying yield, plus any points, exceeds what the YT cost. Pendle's docs describe this decay and the leverage that comes with a low price."
  - question: "How does Pendle make money?"
    answer: "A 5 percent fee on all yield accrued by YTs, including points, and a swap fee that scales with time to maturity. Twenty percent of swap fees go to the pool's liquidity providers. The remaining swap fees and all YT fees go 80 percent to PENDLE buybacks, 10 percent to the treasury and 10 percent to operations."
  - question: "What replaced vePENDLE?"
    answer: "sPENDLE. PENDLE stakes into it one-for-one, unstaking takes 14 days or is immediate for a 5 percent fee, and it receives the buyback-funded share of protocol revenue. Pendle announced it on 20 January 2026, and vePENDLE locks were paused on 29 January."
order: 10
category: "Yield trading"
mechanism: "Yield tokenization into PT and YT, traded against SY in a pool whose curve tightens toward maturity."
versionContext: "Pendle V2 is the live protocol. sPENDLE has replaced vePENDLE as the staking and revenue token. Boros, a separate rate-trading platform, is run by the same team."
tags:
  - yield
  - pendle
  - fixed-rate
concepts:
  - yield-tokenization
  - automated-market-makers
  - interest-rate-models
  - oracles-and-dependencies
  - liquid-staking
guides:
  - pendle-maturity-and-collateral
glossary:
  - standardized-yield
  - principal-token
  - yield-token
  - implied-apy
  - spendle
  - erc-4626
  - rebase
versions:
  - name: "Pendle V2 markets"
    status: "active"
    note: "SY, PT and YT with a PT and SY pool per maturity. The AMM was adapted from Notional Finance's design."
  - name: "sPENDLE"
    status: "active"
    note: "Replaced vePENDLE for governance and revenue sharing. Announced 20 January 2026."
  - name: "vePENDLE"
    status: "deprecated"
    note: "New locks paused 29 January 2026. Existing holders received non-transferable virtual sPENDLE that expires at unlock."
  - name: "Discrete-yield markets"
    status: "active"
    note: "A time-weighted rule for assets that pay in a lump instead of continuously."
  - name: "Boros"
    status: "active"
    note: "A separate platform for trading funding rates with yield units and margin."
sources:
  - title: "Pendle: introduction"
    url: "https://docs.pendle.finance/pendle-v2/Introduction"
    kind: "docs"
    publisher: "Pendle"
  - title: "Pendle: SY"
    url: "https://docs.pendle.finance/pendle-v2/ProtocolMechanics/YieldTokenization/SY"
    kind: "docs"
    publisher: "Pendle"
  - title: "Pendle: PT"
    url: "https://docs.pendle.finance/pendle-v2/ProtocolMechanics/YieldTokenization/PT"
    kind: "docs"
    publisher: "Pendle"
  - title: "Pendle: YT"
    url: "https://docs.pendle.finance/pendle-v2/ProtocolMechanics/YieldTokenization/YT"
    kind: "docs"
    publisher: "Pendle"
  - title: "Pendle: AMM"
    url: "https://docs.pendle.finance/pendle-v2/ProtocolMechanics/LiquidityEngines/AMM"
    kind: "docs"
    publisher: "Pendle"
  - title: "Pendle: fees"
    url: "https://docs.pendle.finance/pendle-v2/ProtocolMechanics/Mechanisms/Fees"
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
  - title: "Pendle: discrete yield markets"
    url: "https://docs.pendle.finance/pendle-v2/ProtocolMechanics/DiscreteYield"
    kind: "docs"
    publisher: "Pendle"
  - title: "Pendle developer docs: yield tokenization contracts"
    url: "https://docs.pendle.finance/pendle-v2-dev/Contracts/YieldTokenization"
    kind: "docs"
    publisher: "Pendle"
  - title: "Pendle developer docs: market contracts"
    url: "https://docs.pendle.finance/pendle-v2-dev/Contracts/PendleMarket"
    kind: "docs"
    publisher: "Pendle"
  - title: "Pendle developer docs: oracle overview"
    url: "https://docs.pendle.finance/pendle-v2-dev/Oracles/OracleOverview"
    kind: "docs"
    publisher: "Pendle"
  - title: "Pendle V2 AMM whitepaper"
    url: "https://github.com/pendle-finance/pendle-v2-resources/blob/main/whitepapers/V2_AMM.pdf"
    kind: "whitepaper"
    publisher: "Pendle"
  - title: "PendleMarketV7.sol"
    url: "https://github.com/pendle-finance/pendle-core-v2-public/blob/main/contracts/core/Market/PendleMarketV7.sol"
    kind: "code"
    publisher: "Pendle"
  - title: "Introducing sPENDLE"
    url: "https://medium.com/pendle/introducing-spendle-8479744dfdf8"
    kind: "governance"
    publisher: "Pendle"
---

A lending rate is not a number. It is a series that changes every block. Pendle makes that series tradable by cutting any yield-bearing token into two pieces with a shared expiry: the principal that comes back on a date, and the yield earned until then. Each piece has its own price, and the prices together say what the market expects the rate to be.

The [yield tokenization concept page](/concepts/yield-tokenization) explains the idea and its risks. This page follows the contracts, the pool, the fee flow and the token that governs them. The [maturity and collateral guide](/guides/pendle-maturity-and-collateral) covers how a PT behaves near expiry and as collateral.

## SY, PT and YT

A yield-bearing token is first wrapped as **SY**, standardized yield. The wrapper gives staked ETH, a lending receipt or a vault share a common interface. In most cases one SY represents one unit of the underlying asset, with exceptions such as mPendle and aUSDC that the docs flag. SY has no maturity. It holds the underlying and is the direct recipient of the yield and points it earns. Most newer SY contracts are upgradable proxies, which the docs present as a feature and which is also a trust assumption. See [proxies](/concepts/proxies).

The YT contract is the core. `mintPY` mints equal amounts of PT and YT from SY already transferred to it. The documented rule is `PY minted = SY deposited × PY index`, where the index is the exchange rate between SY and its accounting asset. If 1 SY-sUSDe is worth 1.2 USDe, 100 SY mints 120 PT and 120 YT. `redeemPY` burns equal PT and YT and returns `PY burned ÷ index` in SY. After expiry, PT alone is enough. Interest and rewards are never part of that redemption. YT holders claim them separately through `redeemDueInterestAndRewards`, and a YT holder can claim before maturity.

**PT** redeems one-for-one for the *accounting asset*, shown in brackets in a market's name. A PT-ezETH (ETH) redeems for one ETH worth of ezETH, not one ezETH, because ezETH appreciates against ETH. **YT** is entitled to all yield, rewards and points until expiry, then is worth zero.

A worked example. A user holds 100 SY-sUSDe at an index of 1.2 and mints 120 PT and 120 YT with a three-month expiry. Assume the underlying earns 12 percent annualized, about 3 percent over the term. The YT holder receives roughly 3.6 USDe of yield over the period, 3 percent of 120. The PT holder redeems 120 USDe of value at maturity. If the user sells the YT and holds the PT, they have exchanged the variable yield for cash today.

## The AMM

Each market is a pool of PT and SY for one maturity. The docs say its curve was adapted from Notional Finance's design and has two differences from a constant-product pool:

- It concentrates liquidity in a **yield range**, an implied-APY band configured per market, not a price range.
- It **tightens as maturity approaches**. The curve shifts so PT's price moves toward its underlying value as time passes, which the docs say mitigates the time-dependent part of impermanent loss and leaves none at maturity.

Parameters per market are the expiry, a scalar root that trades capital efficiency against the tradeable rate range, an initial anchor that centers liquidity on an expected rate, and a fee rate root that raises fees with the interest-rate impact of a trade, not its token size. The practical consequence is that a market has a range. If the implied yield leaves it, liquidity is too thin to push it further and buying YT, or selling PT, may not be possible.

YT trades use the same pool through **flash swaps**. The docs rely on the identity that PT price plus YT price equals the price of the underlying. To buy YT, the router takes SY from the user and more SY from the pool, mints PT and YT from all of it, sends the YT to the buyer and sells the PT back to the pool to repay. Selling YT runs the same sequence in reverse by borrowing PT from the pool. One pool therefore serves both tokens, and a liquidity provider's position earns fees from both.

For comparison with other curves see [AMM pricing curves compared](/compare/amm-pricing-curves) and [automated market makers](/concepts/automated-market-makers).

<diagram-placeholder name="yield-split"></diagram-placeholder>

## What liquidity providers earn

An LP in a PT and SY pool earns four things, according to the docs: the PT's fixed yield as it appreciates toward par, the underlying SY yield, swap fees from PT and YT trades, and PENDLE incentives. If liquidity is held until maturity the position becomes equivalent to holding the underlying asset, since the PT converges to it. After expiry an LP can exit, redeem PT and claim rewards in one transaction.

## Fees and revenue

The protocol has two sources of revenue. The first is a **5 percent fee on all yield accrued by YTs**, points included, and on yield from the SYs of matured, unredeemed PTs. Points are tracked off chain, so partner protocols deduct the 5 percent when allocating them to wallets and route it to Pendle-controlled addresses. The second is a **swap fee** on PT trades, set per market as a fee tier and scaled by time to maturity: trading fee equals the tier divided by 365 times the days to maturity. A trade a year before expiry therefore pays about twelve times the fee of the same trade a month before.

Twenty percent of swap fees go to the pool's liquidity providers. The remaining swap fees and all YT fees are split 80 percent to buy back PENDLE, 10 percent to the treasury and 10 percent to operations. Redeeming a PT after maturity costs only gas. A holder who does not redeem a matured PT leaves the underlying in the SY contract, where it keeps earning, but the docs state that the yield and points from unredeemed matured positions are redirected to the Pendle treasury, an incentive to redeem and roll over promptly.

The docs say the contracts are permissionless, so anyone can create a market on chain, while the official app curates what it shows. The fees page adds that at the time of reading only the Pendle team deploys pools.

## sPENDLE

The docs describe sPENDLE as the governance token and the way revenue is shared. PENDLE stakes one-for-one, instantly. Unstaking returns PENDLE after 14 days, or immediately for a 5 percent fee. Eighty percent of Pendle V2's yield and swap fees fund PENDLE buybacks, and up to all of the repurchased PENDLE is distributed to active sPENDLE holders. Buybacks run on a one-hour TWAP across the following week and rewards are distributed every two weeks. Airdrops from points-bearing assets are distributed in kind, not turned into buybacks.

A holder is *inactive* only if they fail to vote when a Pendle Protocol Proposal is open, and sPENDLE in eligible DeFi integrations counts as active. Voting power is a snapshot of the sPENDLE balance when each proposal is created, and balances in whitelisted contracts are excluded.

sPENDLE replaced vePENDLE. Staking went live on 20 January 2026 and new vePENDLE locks were paused on 29 January. Existing lock holders received non-transferable virtual sPENDLE sized by their locked amount and time to unlock, with a multiplier of up to 4x for two years that decays to 1x at unlock. Virtual balances expire at unlock, so a holder must redeem and stake to keep the benefits.

## Oracles for PT

Pendle offers two oracle types for PT and LP tokens. The **TWAP oracle** stores cumulative implied-rate observations in a ring buffer, adapted from Uniswap V3's design, and derives a geometric-mean PT price. Its buffer must be expanded before long windows can be queried. The **Linear Discount Oracle** is the one the developer docs recommend for lending markets. It prices PT as a fraction that rises linearly to 1.0 at expiry and reads only `block.timestamp`, so it has no external feed to be late or manipulated. The docs say top curators on Aave and Morpho have adopted it. That safety has a cost, covered in the guide: it prices the PT from a rule, not from the market, so it does not reflect a real discount if the underlying is impaired. See [oracles and dependencies](/concepts/oracles-and-dependencies).

## Negative yield and discrete yield

The docs define a *watermark rate* as the highest recorded exchange rate between a yield-bearing token and its accounting asset. If the rate falls below it, a PT can redeem for less than one unit, and a YT stops earning until the rate recovers. An inflated watermark caused by a bad oracle reading or a spike can linger. Separately, *discrete-yield* markets handle assets that pay in a lump. Their rule is time-weighted, a holder who sells before the payout forfeits accrued yield, and the forfeited amount goes to the Pendle treasury, not to remaining holders.

## Limit orders and Boros

Pendle has a limit order contract: makers sign orders off chain and takers fill them on chain, with maker incentives. Boros is a separate platform from the same team for trading funding rates, with *yield units*, an order book and margin. It launched with funding rates from centralized and decentralized perpetual exchanges and lists spread markets. It is an adjacent product with its own risks, not part of the PT and YT mechanism above.

## Trust that remains

The underlying asset of every market, the SY wrapper contract and its upgrade authority, the oracle a lender chooses, the governance that sets market parameters and fee tiers, and the liquidity of the specific pool. A PT is a claim on an asset, and the quality of the claim is the quality of the asset.
