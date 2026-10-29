---
title: "Impermanent loss, LVR and MEV"
seoTitle: "Impermanent loss vs LVR: what AMM liquidity providers lose"
description: "What a liquidity provider gives up to price moves and to arbitrageurs, how impermanent loss and loss-versus-rebalancing differ, and how MEV touches traders."
summary: "A liquidity provider in a constant-product pool always ends up holding more of the asset that fell. Impermanent loss measures that against holding. Loss-versus-rebalancing measures the cost against a trader who rebalances at market prices, and for a constant-product pool it grows with volatility squared. Fees must beat that cost."
status: "published"
published: "2026-10-29"
lastVerified: "2026-10-29"
faq:
  - question: "What is impermanent loss in simple terms?"
    answer: "It is the difference between the value of your share of a pool and the value of the same tokens had you simply held them. In a constant-product pool, if one token's price doubles relative to the other, the pool share is worth about 5.7 percent less than holding. It is called impermanent because it shrinks if the price returns, and it becomes real when you withdraw."
    featured: true
  - question: "What is loss-versus-rebalancing (LVR)?"
    answer: "A measure of what a liquidity provider loses to arbitrageurs, defined as the gap between a rebalancing strategy that trades at market prices and the pool's value. For a constant-product pool the paper that introduced it gives an instantaneous rate of sigma squared over eight times the pool value, so at 80 percent annualized volatility the cost is about 8 percent of pool value a year, before fees."
    featured: true
  - question: "Do fees make liquidity provision profitable?"
    answer: "Only when fee income exceeds the loss to arbitrage. Higher volatility raises that loss, and trading volume raises fees, so the answer differs by pool and by period. Concentrated liquidity amplifies both: more fees while price is in range, more inventory loss when it leaves."
order: 21
group: "markets"
tags:
  - amm
  - liquidity
  - mev
protocols:
  - uniswap
  - curve
glossary:
  - constant-product
  - concentrated-liquidity
  - lp-share
  - liquidity-pool
  - tick
related:
  - constant-product
  - concentrated-liquidity
  - liquidity-pools
  - automated-market-makers
sources:
  - title: "Automated Market Making and Loss-Versus-Rebalancing"
    url: "https://arxiv.org/abs/2208.06046"
    kind: "research"
    publisher: "Milionis, Moallemi, Roughgarden and Zhang"
  - title: "Uniswap v3 whitepaper"
    url: "https://uniswap.org/whitepaper-v3.pdf"
    kind: "whitepaper"
    publisher: "Uniswap"
  - title: "Maximal extractable value (MEV)"
    url: "https://ethereum.org/developers/docs/mev/"
    kind: "docs"
    publisher: "Ethereum Foundation"
  - title: "UniswapX overview"
    url: "https://developers.uniswap.org/docs/liquidity/uniswapx/overview"
    kind: "docs"
    publisher: "Uniswap"
---

A trader who swaps on an automated market maker pays a fee and gets a price. A liquidity provider receives the fee and takes the other side of every trade. The [liquidity pools](/concepts/liquidity-pools) and [constant product](/concepts/constant-product) pages explain the mechanics. This page covers what the liquidity provider pays for that income, which is the question that decides whether providing liquidity makes money.

## Impermanent loss

In a constant-product pool the product of the two reserves stays fixed. When the price of one token rises on outside markets, traders and arbitrageurs buy it from the pool until the pool's price catches up. The pool therefore sells the rising token and accumulates the falling one.

Let `r` be the ratio of the new price to the starting price. The value of a pool share relative to holding the same tokens is `2·√r / (1 + r)`. Subtract one to get the loss.

| Price change | `r` | Pool share compared with holding |
| --- | --- | --- |
| +25% | 1.25 | −0.6% |
| +100% | 2 | −5.7% |
| +300% | 4 | −20.0% |
| −50% | 0.5 | −5.7% |
| −75% | 0.25 | −20.0% |

Two things to notice. The loss is symmetric: halving the price costs the same as doubling it. And it depends only on the final ratio, not the path, which is why it is called impermanent. If the price returns, the gap closes. If you withdraw while it is open, it is realized.

A worked case. A provider deposits 1 ETH and 2,000 USDC when ETH is 2,000 dollars, 4,000 in all, so the pool's constant is 1 × 2,000. ETH then rises to 4,000, so `r = 2`. Holding the same tokens would be worth 4,000 + 2,000 = 6,000. After arbitrageurs move the pool to the new price, it holds about 0.707 ETH and 2,828 USDC, worth 2,828 + 2,828 = 5,657. That is 94.3 percent of the holding value, a loss of 5.7 percent. The provider still has more than they put in. The loss is relative to the alternative of holding, and it excludes the fees earned along the way.

## Why impermanent loss is an incomplete measure

Impermanent loss compares against holding. A trader who wants to be market-neutral would not hold the original tokens. They would rebalance continuously to match the pool's exposure. **Loss-versus-rebalancing** (LVR), introduced by Milionis, Moallemi, Roughgarden and Zhang in 2022, makes that comparison. The paper defines it as the difference between the value of a strategy that replicates the pool's exposure by trading at market prices and the value of the pool, and describes it as the losses to arbitrageurs from price slippage.

For a constant-product pool the paper gives the instantaneous rate as `σ² / 8` times the pool value, where `σ` is the volatility of the price. That is a per-unit-time rate. At 80 percent annualized volatility, `σ² = 0.64`, so the cost is 0.08 of pool value per year, about 8 percent. At 40 percent it is 2 percent. The cost scales with the square of volatility.

The practical reading is that arbitrage is not an accident but the mechanism. The pool only updates its price when someone trades it, and the profitable trade is the one that moves the pool to the market price. The arbitrageur's profit is the provider's loss. Fees compensate for it. A pool earns money for its providers only when fees collected exceed `σ²/8` of its value over the period, plus gas costs.

The paper also reports that for the Uniswap v2 ETH-USDC pool, over 99.99 percent of the variance of LP returns comes from exposure to market risk. A provider in such a pool has a market position first and a fee business second.

## Concentrated liquidity changes the size, not the sign

[Concentrated liquidity](/concepts/concentrated-liquidity) lets a provider place capital in a price range. Within the range the position behaves like a constant-product pool with larger reserves, so each unit of capital earns more fees and loses more to arbitrage when the price moves. Outside the range the position is entirely one token and earns nothing. The [Uniswap page](/protocols/uniswap) lists out-of-range positions as a design failure mode. A narrow range magnifies both terms.

A pool for assets that should hold a price, such as the stable pools on [Curve](/protocols/curve), reduces the cost by keeping the relative price near one, as long as the peg holds. If it does not, the same concentration works against the provider. The [AMM pricing curves comparison](/compare/amm-pricing-curves) sets the shapes side by side.

## MEV and the trader's side

The same mechanism hurts traders in a different way. MEV, in the definition Ethereum documentation gives, is the maximum value extractable from block production beyond the standard block reward and gas fees, by including, excluding or reordering transactions. The documented forms that matter on an AMM:

- **Arbitrage.** Searchers close price differences between venues, often in one atomic transaction. It is the source of LVR.
- **Sandwiching.** A searcher buys before a large trade and sells after it, profiting from the price impact. The trader gets a worse price. It is riskier for the searcher than arbitrage because it is not atomic.
- **Frontrunning.** Bots copy profitable pending transactions and pay more gas.
- **Liquidations.** Searchers compete for the bonus on unhealthy positions in lending markets.

A trader's controls are a minimum-output limit, set tight enough to refuse a bad price, and the choice of how the order reaches a block. Sending a transaction privately, instead of through the public mempool, hides it from frontrunners. The Ethereum documentation notes the trade-off that private or permissioned arrangements can favor large operators. Separately, block building has been split from proposing through MEV-Boost.

Some venues change who captures the value. In UniswapX, the swapper signs an order whose price decays over time, and fillers compete in an auction to execute it. The filler pays gas and the realized price depends on when the first successful filler settles. That moves part of the competition from a transaction-ordering race to a price auction. It does not remove the need for the filler to be paid, and the swapper's protection is the decay curve they signed.

## What to take away

1. A pool share is a short-volatility position. It earns when prices move little and fees are high.
2. Impermanent loss is the loss against holding. LVR is the loss against rebalancing, and it is the one that fees have to cover.
3. Volatility enters squared. Doubling it multiplies the cost by four.
4. Concentration is leverage on both sides.
5. Traders should set minimum outputs and consider private routing for large orders.

See [liquidity pools](/concepts/liquidity-pools) for the share accounting and [oracles and dependencies](/concepts/oracles-and-dependencies) for why the pool's spot price is a weak input to other protocols.
