---
title: "Yield tokenization"
seoTitle: "Yield tokenization: PT, YT and fixed rates"
description: "How a yield-bearing token is split into a principal token and a yield token, why that creates fixed and variable rates, and what can go wrong."
summary: "Yield tokenization separates a yield-bearing asset into a claim on its principal at a date and a claim on everything it earns until then. Selling one and keeping the other turns a floating rate into a fixed one, or the reverse. The price of each claim states the market's expected rate."
status: "published"
published: "2026-10-29"
lastVerified: "2026-10-29"
faq:
  - question: "What is a principal token and why does it trade below its face value?"
    answer: "A principal token (PT) is redeemable one-for-one for the accounting asset at maturity and carries none of the yield in the meantime. Because the yield has been detached and sold separately, the PT trades at a discount. The move from that discount to par by maturity is the fixed return."
    featured: true
  - question: "What does a yield token (YT) give its holder?"
    answer: "All the yield, rewards and points the underlying asset earns until maturity. It costs a fraction of the asset, so a small change in the underlying rate has a large effect on its return, and its value decays toward zero at maturity. It pays off if the average underlying rate exceeds the implied rate the buyer paid."
  - question: "Can a principal token lose value if the underlying asset fails?"
    answer: "Yes. A PT is a claim on the underlying asset, so a depeg, exploit or loss in that asset reduces what the PT redeems for. Pendle's negative yield documentation also says that when an asset's exchange rate falls below its previous high, called the watermark, PT can redeem for less than expected at maturity."
order: 20
group: "markets"
tags:
  - yield
  - fixed-rate
  - pendle
protocols:
  - pendle
  - lido
  - ethena
glossary:
  - standardized-yield
  - principal-token
  - yield-token
  - implied-apy
  - erc-4626
  - rebase
related:
  - interest-rate-models
  - liquid-staking
  - automated-market-makers
  - oracles-and-dependencies
sources:
  - title: "Pendle: yield tokenization contracts"
    url: "https://docs.pendle.finance/pendle-v2-dev/Contracts/YieldTokenization"
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
  - title: "Pendle: negative yield"
    url: "https://docs.pendle.finance/pendle-v2/ProtocolMechanics/NegativeYield"
    kind: "docs"
    publisher: "Pendle"
---

Lending on Aave, staking with Lido and holding a savings vault all pay a rate that changes. A depositor who wants a known return, or a trader who wants to bet that the rate will rise, has no direct way to do either. Yield tokenization builds one by separating what an asset is worth at a future date from what it earns on the way.

[Pendle](/protocols/pendle) is the main on-chain implementation. The idea is older. Bond markets have long stripped a bond into a zero-coupon principal and a stream of coupons.

## Three tokens

1. **Standardized yield ([SY](/glossary/standardized-yield/)).** A wrapper that gives every supported yield-bearing token the same interface. [stETH](/glossary/steth/), a lending receipt or an [ERC-4626](/glossary/erc-4626/) vault share can each be wrapped. SY has no maturity and holds the underlying asset and whatever rewards and points it earns.
2. **Principal token ([PT](/glossary/principal-token/)).** The right to the underlying principal at maturity, redeemable one-for-one for the accounting asset. The accounting asset is the unit of account, not always the token: the Pendle documentation says a PT on a restaked ETH token redeems for one ETH worth of that token, not one token.
3. **Yield token ([YT](/glossary/yield-token/)).** The right to all yield, rewards and points of the asset until maturity.

Minting splits an SY into equal amounts of PT and YT. The contract's documented rule is that the amount minted is the SY deposited times the current exchange rate between SY and its accounting asset, which Pendle calls the PY index. If 1 SY is worth 1.2 of the accounting asset, depositing 100 SY mints 120 PT and 120 YT. Redeeming before maturity needs equal PT and YT. After maturity, PT alone is enough.

## Reading the price as a rate

Because a PT redeems for a known amount at a known date, its price today is a discount rate. Buy a PT at 0.96 of par with six months left and hold it, and the return is about 4.2 percent over the period, or roughly 8.5 percent annualized, regardless of what the underlying asset pays. This is the **fixed yield**.

A YT is the other side. The identity the documentation gives for pricing is that the PT price plus the YT price equals the price of the underlying. If the PT is cheap, the YT is expensive, and the reverse. The annualized rate that makes the YT's price fair is the [implied APY](/glossary/implied-apy/). Buying a YT is a bet that the actual rate, averaged over the holding period, will exceed it.

Three properties follow:

- **Leverage.** A YT costs a fraction of the asset but earns the yield on the whole of it. The documentation describes this as leveraged exposure. It applies as well to points programs that reward holders of the underlying, because the YT receives the points.
- **Decay.** A YT trends to zero at maturity because no yield remains to claim. With the implied rate constant, its price falls roughly in line with the time left.
- **Convergence.** A PT approaches par at maturity if the underlying holds, which also makes its risk of price swings smaller as the date nears.

## What the strategies look like

| Goal | Position | What it exposes you to |
| --- | --- | --- |
| Fixed return | Buy PT, hold to maturity | The underlying asset's solvency and redemption |
| Bet on rising rates | Buy YT | Decay, and the rate staying below your purchase price |
| Keep the asset, sell the next yield | Mint PT and YT, sell the YT | Giving up variable yield and points |
| Earn the fixed rate plus fees | Provide liquidity in a PT and SY pool | Pool mechanics and swap fees |

## Where risks sit

**Underlying asset risk.** Everything is a claim on the wrapped token. If a stablecoin loses its peg or a staking token is slashed, PT, YT and SY are repriced with it.

**Negative yield.** Tokens that normally appreciate can fall. Pendle's documentation defines a *watermark rate* as the highest recorded exchange rate between the token and its accounting asset. If the rate drops below it, a PT can redeem for less than one unit and a YT stops earning until the rate recovers. A temporary spike or oracle error can record an inflated watermark that lingers after the rate normalizes.

**Discrete payouts.** Some assets pay in one lump rather than continuously. Between payouts their value is flat, which would hand the entire period to whoever held at the instant of the jump. Pendle's documentation describes a time-weighted rule for these markets instead, with a claim that forfeits accrued yield if a holder sells before the payout.

**Liquidity and expiry.** Markets exist per maturity. Liquidity is thin far from the expected rate range, and a market's depth, not only its price, sets what a position costs to exit.

**Using PT as collateral.** PTs are now collateral in lending markets because their value converges to par and so is less volatile than most collateral. That makes oracle design important. See [oracles and dependencies](/concepts/oracles-and-dependencies) and the [maturity and collateral guide](/guides/pendle-maturity-and-collateral).

For the AMM that trades these tokens, see [AMM pricing curves compared](/compare/amm-pricing-curves). For the lending models that PT rates are measured against, see [interest rate models](/concepts/interest-rate-models).
