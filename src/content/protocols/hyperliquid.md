---
title: "Hyperliquid"
seoTitle: "How Hyperliquid works: HyperCore order books, margin, HLP"
description: "How Hyperliquid runs perpetual and spot order books on its own L1, how oracle and mark prices set margin and funding, how liquidation, HLP and ADL work, and what HIP-3 changes."
summary: "Hyperliquid is a layer-1 chain whose core execution layer, HyperCore, runs onchain perpetual and spot order books with margin built in. Validators publish the oracle price, positions are liquidated through the book first and through a community vault last, and auto-deleveraging closes the solvency gap. HIP-3 lets staked deployers list their own perpetual markets."
status: "published"
published: "2026-11-23"
lastVerified: "2026-11-26"
changes:
  - date: "2026-11-26"
    summary: "Added the separate HIP-3 backstop liquidator and burned slashed stake, and cited the HIP-2 page."
faq:
  - question: "What is HyperCore and how is it different from the HyperEVM?"
    answer: "HyperCore is the part of Hyperliquid's state that holds margin accounts and the perpetual and spot order books, executed by the chain itself with no offchain book. The HyperEVM is a general-purpose smart contract environment secured by the same consensus. Contracts on the HyperEVM can read HyperCore prices through precompiles, according to the docs."
    featured: true
  - question: "How does Hyperliquid liquidate a perpetual position?"
    answer: "When account equity falls below maintenance margin, the protocol first sends market orders for the position into the order book, and any remaining collateral stays with the trader. If equity drops below two thirds of maintenance margin without a successful liquidation, the liquidator vault takes the position over, and the trader does not get the maintenance margin back."
    featured: true
  - question: "What is HLP on Hyperliquid and what does it do?"
    answer: "HLP, the Hyperliquidity Provider, is a community-owned protocol vault. Depositors share its profit and loss. It runs market making strategies, performs backstop liquidations, supplies USDC in the Earn feature and accrues a portion of trading fees. The docs give a deposit lock-up of four days from the most recent deposit."
  - question: "Who sets the price that Hyperliquid margin and funding use?"
    answer: "Validators do. Each validator publishes spot oracle prices about every three seconds as a weighted median of several centralized exchange prices, and the final oracle price is the stake-weighted median of the validators' submissions. The mark price used for margin and liquidation is a median of three separate estimates, one of which is built from the oracle."
order: 14
category: "Derivatives"
mechanism: "A layer-1 chain with an onchain order book and margin engine, a validator-published oracle, and a community vault as liquidation backstop."
versionContext: "HyperCore, the HyperEVM and the Hyperliquid Improvement Proposals are documented on one docs site. Fee schedules, leverage limits, listed markets and the HyperEVM's stage change often, and the docs describe the HyperEVM as alpha."
tags:
  - perpetuals
  - order-book
  - layer-1
concepts:
  - collateral-and-liquidation
  - oracles-and-dependencies
  - governance-and-upgrades
  - security-assumptions
  - delta-neutral-dollars
guides:
  - hyperliquid-hypercore-and-hip-3
glossary:
  - hypercore
  - hlp
  - hip-3
  - auto-deleveraging
  - mark-price
  - funding-rate
  - oracle
versions:
  - name: "HyperCore"
    status: "active"
    note: "Margin, matching and clearinghouse state, with perpetual and spot order books and one-block finality from HyperBFT."
  - name: "HyperEVM"
    status: "active"
    note: "General-purpose smart contracts secured by the same consensus. The docs I read describe it as in an alpha stage."
  - name: "HIP-3 builder-deployed perpetuals"
    status: "active"
    note: "Permissionless perpetual markets run by deployers who stake HYPE, with their own margining, order books and oracle definitions."
sources:
  - title: "HIP-2: Hyperliquidity"
    url: "https://hyperliquid.gitbook.io/hyperliquid-docs/hyperliquid-improvement-proposals-hips/hip-2-hyperliquidity"
    kind: "specification"
    publisher: "Hyperliquid"
  - title: "About Hyperliquid"
    url: "https://hyperliquid.gitbook.io/hyperliquid-docs/about-hyperliquid"
    kind: "docs"
    publisher: "Hyperliquid"
  - title: "HyperCore overview"
    url: "https://hyperliquid.gitbook.io/hyperliquid-docs/hypercore/overview"
    kind: "docs"
    publisher: "Hyperliquid"
  - title: "Clearinghouse"
    url: "https://hyperliquid.gitbook.io/hyperliquid-docs/hypercore/clearinghouse"
    kind: "docs"
    publisher: "Hyperliquid"
  - title: "Order book"
    url: "https://hyperliquid.gitbook.io/hyperliquid-docs/hypercore/order-book"
    kind: "docs"
    publisher: "Hyperliquid"
  - title: "Oracle"
    url: "https://hyperliquid.gitbook.io/hyperliquid-docs/hypercore/oracle"
    kind: "docs"
    publisher: "Hyperliquid"
  - title: "Robust price indices"
    url: "https://hyperliquid.gitbook.io/hyperliquid-docs/trading/robust-price-indices"
    kind: "docs"
    publisher: "Hyperliquid"
  - title: "Margining"
    url: "https://hyperliquid.gitbook.io/hyperliquid-docs/trading/margining"
    kind: "docs"
    publisher: "Hyperliquid"
  - title: "Funding"
    url: "https://hyperliquid.gitbook.io/hyperliquid-docs/trading/funding"
    kind: "docs"
    publisher: "Hyperliquid"
  - title: "Liquidations"
    url: "https://hyperliquid.gitbook.io/hyperliquid-docs/trading/liquidations"
    kind: "docs"
    publisher: "Hyperliquid"
  - title: "Auto-deleveraging"
    url: "https://hyperliquid.gitbook.io/hyperliquid-docs/trading/auto-deleveraging"
    kind: "docs"
    publisher: "Hyperliquid"
  - title: "Protocol vaults"
    url: "https://hyperliquid.gitbook.io/hyperliquid-docs/hypercore/vaults/protocol-vaults"
    kind: "docs"
    publisher: "Hyperliquid"
  - title: "Staking"
    url: "https://hyperliquid.gitbook.io/hyperliquid-docs/hypercore/staking"
    kind: "docs"
    publisher: "Hyperliquid"
  - title: "HyperEVM"
    url: "https://hyperliquid.gitbook.io/hyperliquid-docs/hyperevm"
    kind: "docs"
    publisher: "Hyperliquid"
  - title: "USDC on HyperCore"
    url: "https://hyperliquid.gitbook.io/hyperliquid-docs/hypercore/usdc"
    kind: "docs"
    publisher: "Hyperliquid"
  - title: "HIP-1: Native token standard"
    url: "https://hyperliquid.gitbook.io/hyperliquid-docs/hyperliquid-improvement-proposals-hips/hip-1-native-token-standard"
    kind: "specification"
    publisher: "Hyperliquid"
  - title: "HIP-3: Builder-deployed perpetuals"
    url: "https://hyperliquid.gitbook.io/hyperliquid-docs/hyperliquid-improvement-proposals-hips/hip-3-builder-deployed-perpetuals"
    kind: "specification"
    publisher: "Hyperliquid"
---

Most protocols in this publication are contracts that run on someone else's chain. Hyperliquid is the chain. It is a layer-1 network whose execution layer was built to run an exchange: margin accounts, perpetual futures and spot order books are part of the state that validators agree on every block. That changes which questions matter. There is no pool to price and no external liquidator to incentivize. The questions are who sets the price, how a position is closed when it fails, and who absorbs a loss the book cannot.

This page follows those questions in the order a position meets them. The [guide](/guides/hyperliquid-hypercore-and-hip-3) separates the pieces of the system that share the name, and [Chainlink](/protocols/chainlink) is the comparison for the oracle, since Hyperliquid does not use it.

## Two execution layers, one consensus

The docs describe Hyperliquid as a layer one written from first principles, secured by **HyperBFT**, a consensus algorithm they say is inspired by HotStuff. Its state splits into two components.

**HyperCore** holds the margin and matching state. The docs say it includes fully onchain perpetual and spot order books, and that every order, cancel, trade and liquidation happens transparently with one-block finality. A core design principle stated there is that HyperCore does not rely on offchain order books. The docs also give performance figures for the mainnet at the time of reading: roughly 200,000 orders per second, and for a co-located client a median end-to-end latency of 0.2 seconds and a 99th percentile of 0.9 seconds. Those are the operator's figures, not measurements this site made.

**The HyperEVM** is a general-purpose smart contract environment. The docs say it is not a separate chain but is secured by the same consensus, so it can interact directly with HyperCore. A contract can read prices from the HyperCore order books through a read precompile. The docs I read describe the HyperEVM as in an alpha stage and say that some features, such as write system contracts, were not yet live on mainnet. That page may be older than the current state, so treat the stage as something to check.

## The order book and its ordering rule

Each asset has a book that, in the docs' words, works similarly to those of centralized exchanges. Orders must be at integer multiples of a tick size and lot size and are matched in price-time priority. Margin checks happen when an order opens and again for the resting side at each match, so the book stays consistent when the oracle moves after an order rests.

Ordering inside a block is part of the protocol. The docs say the mempool and consensus logic are aware of actions that touch the books, and that within each consensus batch actions are sorted into three groups: actions that do not send resting or immediate orders, then cancels, then actions that send at least one such order. Within a group they keep the proposer's order. The effect is that a cancel is processed before a new aggressive order in the same batch, so a trader who submits an order and a cancel together should know which comes first.

## Margin

Collateral is USDC, which the docs say is natively minted on the Hyperliquid L1. A clearinghouse tracks each address's margin state. Deposits go first to a cross margin balance and positions default to cross mode, which shares collateral across positions. **Isolated margin** assigns collateral to one position so that its liquidation does not touch the others. Some assets are strict isolated, with margin that cannot be removed until the position closes.

The initial margin to open a position is `position_size * mark_price / leverage`. Leverage is any integer from 1 up to a per-asset maximum, and it is checked only when a position opens: afterward the trader is responsible for monitoring it. Maintenance margin is half of the initial margin at the asset's maximum leverage. The liquidations page gives the consequence: with maximum leverage between 3x and 40x, maintenance margin is between about 1.25 percent and 16.7 percent of position value, depending on the asset.

## Where the price comes from

Hyperliquid builds its own prices from two indices, and the difference between them matters.

The **oracle price** drives funding. Each validator publishes a spot oracle price for every perpetual asset about every three seconds, computed as a weighted median of the mid prices on Binance, OKX, Bybit, Kraken, Kucoin, Gate IO, MEXC and Hyperliquid spot, with weights of 3, 2, 2, 1, 1, 1, 1 and 1. The final oracle price the clearinghouse uses is the median of the validators' submissions weighted by stake. Assets whose main spot liquidity is on Hyperliquid leave external sources out of the oracle until liquidity is sufficient, and assets that trade mainly elsewhere leave Hyperliquid spot out.

The **mark price** drives margin, liquidation, TP/SL triggers and unrealized profit and loss. It is the median of three inputs: the oracle price plus a 150-second moving average of how far Hyperliquid's mid sits from the oracle, the median of the best bid, best ask and last trade on Hyperliquid, and a weighted median of perpetual mid prices on five outside venues. If exactly two of the three exist, a further input is added. Both prices update whenever validators publish, so about every three seconds.

This is an oracle with no external feed contract. The people who publish the price are the people who secure the chain, and the oracle's honesty is a property of the validator set. [Chainlink's feeds](/protocols/chainlink) are a separate node network that a protocol selects. Here the price source and the consensus are the same body, and the defense against manipulation is that, for assets that trade mainly elsewhere, the oracle leaves Hyperliquid's own spot prices out.

## Funding

A perpetual contract has no expiry, so a periodic payment keeps its price near the underlying. On Hyperliquid funding is paid every hour. Its rate follows the 8-hour formula familiar from centralized exchanges, applied at one eighth per hour:

```text
F = average premium + clamp(interest rate - premium, -0.0005, 0.0005)
```

The interest rate component is fixed at 0.01 percent per 8 hours, about 11.6 percent a year paid to shorts. The premium is sampled every five seconds and averaged over the hour, and it comes from the gap between impact bid and ask prices and the oracle price. Funding is peer to peer, and the docs say no fees are collected on it. It is capped at 0.5 percent per hour. The payment is `position_size * oracle_price * funding_rate`, using the oracle price and not the mark price.

Funding is the number that [Ethena](/protocols/ethena) and the [delta-neutral dollars](/concepts/delta-neutral-dollars) page are built on. A short earns it when it is positive. Where a market's funding is set matters to anyone hedging with that market.

## Liquidation, in three steps

<diagram-placeholder name="perp-liquidation-ladder"></diagram-placeholder>

**1. The book.** When account equity falls below maintenance margin, the protocol tries to close the positions by sending market orders to the book. The orders are for the full position and may fill fully or partly. Anything left after maintenance is met stays with the trader. For positions above 100,000 USDC, only 20 percent is sent as a market order, followed by a 30-second cooldown during which later liquidation orders for that user are for the entire position. The docs add that there is no clearance fee on liquidations, unlike on centralized exchanges.

**2. The liquidator vault.** If equity falls below two thirds of maintenance margin without a successful book liquidation, the position is taken over by the liquidator vault. A cross position and its cross margin are transferred together, so a trader with no isolated positions ends with zero equity. The maintenance margin is not returned. The docs explain why: the vault needs a buffer for backstop liquidations to be profitable on average, and the advice is to use stop losses before the mark reaches the liquidation price.

**3. Auto-deleveraging.** If an account's value or isolated position value goes negative, **auto-deleveraging** closes positions on the other side. Users in profit are ranked by `(mark_price / entry_price) * (notional_position / account_value)`, and their positions are closed at the previous mark price against the underwater user, so the platform carries no bad debt. The docs state an invariant: a user with no open positions never socializes the platform's losses.

The three steps describe who pays in order: the liquidated trader's margin, then the vault, then profitable traders on the opposite side. Compare [Compound's absorb](/protocols/compound), where reserves absorb the shortfall, and [Aave](/protocols/aave), where it falls on suppliers or a staked backstop.

## HLP

The liquidator vault is a component of **HLP**, the Hyperliquidity Provider. The docs describe HLP as a protocol vault that provides liquidity through multiple market-making strategies, performs liquidations, supplies USDC in Earn and accrues a portion of trading fees. Anyone can deposit, the vault's profit and loss is shared, and the docs call it fully community-owned. Deposits lock for four days from the most recent one.

A depositor in HLP is, in effect, the exchange's first-loss capital. The docs say backstop liquidations are on average profitable, and the vault's other strategies carry market risk too. That is a different position from a lender's. Nothing here promises that HLP cannot lose money.

## Staking and validators

HYPE staking is delegated proof of stake and happens inside HyperCore. A validator needs a self-delegation of 10,000 HYPE, locked for a year, and earns rewards in proportion to total stake. Commission cannot be raised except to 1 percent or less. Delegations lock for a day, and moving HYPE from staking back to spot goes through a 7-day queue with at most five pending withdrawals per address.

The docs give a reward rate that falls with the square root of total stake, and say at 400 million HYPE staked it is about 2.37 percent per year, paid from a future emissions reserve. The consensus requirement is that more than two thirds of stake is honest. The docs say there is currently no automatic slashing. Jailing exists for validators that do not respond adequately, and slashing is reserved for provably malicious behavior such as double signing. For a delegator this means the main protection is choosing validators, since the validators are also the oracle.

## HIP-1, HIP-2 and HIP-3

Hyperliquid Improvement Proposals define extensions inside the protocol. HIP-1 is a capped-supply token standard with onchain spot order books between pairs of tokens. [HIP-2](https://hyperliquid.gitbook.io/hyperliquid-docs/hyperliquid-improvement-proposals-hips/hip-2-hyperliquidity), Hyperliquidity, is a decentralized onchain strategy that bootstraps liquidity for new HIP-1 tokens, which the docs say is inspired by Uniswap and part of block transition logic with no operators.

**HIP-3** is the one that changes the risk model. It lets a deployer list perpetual markets permissionlessly. The deployer defines each market, including the oracle and contract specifications, and operates it by setting oracle prices, leverage limits and settlement. The docs give a staking requirement of 500,000 HYPE, expected to fall over time and held for at least 183 days after deployment. Each deployer can launch one perp dex with its own margining, order books and settings, and the first three assets need no auction.

The safety mechanism is slashing. The docs say validators can slash a deployer's stake by a stake-weighted vote for malicious market operation, even during the unstaking queue, and that slashing does not distinguish malice from incompetence, a poorly designed spec or a compromised key. For a trader this is a clear change in what "a Hyperliquid perpetual" means. A HIP-3 market inherits the clearinghouse and the book, and its oracle is the deployer's responsibility. The docs say a deployer can also settle an asset with a halt action that cancels orders and settles positions at the current mark. Slashed stake is burned, not paid to affected traders. The [HIP-3 page](https://hyperliquid.gitbook.io/hyperliquid-docs/hyperliquid-improvement-proposals-hips/hip-3-builder-deployed-perpetuals) also describes the backstop differently from core markets: each HIP-3 dex has its own onchain backstop liquidator, which takes over only assets with cross margin enabled and falls back to auto-deleveraging. The HLP step described above should not be assumed for a HIP-3 market.

## Bridges and USDC

The docs say USDC is natively minted on the Hyperliquid L1 and describe Circle's transfer protocol from Arbitrum to HyperCore. A legacy Arbitrum bridge holds, per the docs, less than 10 percent of the USDC supply on HyperCore and was audited by Zellic. That is the operator's statement as of the page I read.

## What remains trusted

The validator set, which is both consensus and oracle, and the stake distribution that decides it. The exchange weights in the oracle and the continued availability of those venues. HLP's solvency as a backstop. The HIP-3 deployers for any market they run. The bridge and the USDC issuer. And the operator of the docs, since the figures on this page, from throughput to the 2.37 percent reward rate, come from them and move.

The structural point is that Hyperliquid removes the layers that other protocols here keep separate. The chain, the exchange, the oracle and the liquidator are one system. That is the source of its speed and also what makes a failure in one part a failure of all of it.
