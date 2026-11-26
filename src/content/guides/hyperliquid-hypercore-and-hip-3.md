---
title: "HyperCore, HyperEVM and HIP-3 markets"
seoTitle: "Hyperliquid HyperCore vs HyperEVM vs HIP-3: what each is"
description: "How Hyperliquid's HyperCore, HyperEVM, HIP-1 and HIP-3 differ, who controls the oracle and listing in each, and what to check before trusting a market or token."
summary: "Hyperliquid names several things alike. HyperCore is the native order book and margin engine, the HyperEVM is a smart contract layer on the same consensus, HIP-1 tokens trade on native spot books, and HIP-3 perpetual markets are run by staked deployers. Each has different listing rules, oracles and failure modes."
status: "published"
published: "2026-11-23"
lastVerified: "2026-11-26"
changes:
  - date: "2026-11-26"
    summary: "Added the separate HIP-3 backstop liquidator as a fourth difference from core perpetuals, and cited the HIP-2 page."
faq:
  - question: "Is a HIP-3 perpetual the same as a core Hyperliquid perpetual?"
    answer: "They share the clearinghouse, margining and order book engine, and a user trades both through the same API. They differ in who runs the market: a HIP-3 deployer stakes HYPE, defines the oracle and contract specification, sets oracle prices and leverage limits, and can be slashed by validator vote for malicious operation."
    featured: true
  - question: "Can a token exist on both HyperCore and the HyperEVM?"
    answer: "Yes. The docs describe deploying an ERC-20 on the HyperEVM and a corresponding spot asset on HyperCore through the spot auction, then linking them so the same token can be used in HyperEVM applications and traded on the native order book. The docs say this avoids a bridge between the two because they are one unified state."
  - question: "Who decides which perpetual markets exist?"
    answer: "The docs call HIP-3 a key milestone toward decentralizing the perp listing process, which implies core listings are decided by the protocol's own process. For HIP-3 markets any deployer that meets the staking requirement can launch a perpetual dex, and additional assets beyond the first three go through a Dutch auction. HIP-3 therefore moves listing from the protocol to deployers, with validators able to slash."
order: 14
protocol: "hyperliquid"
versionContext: "The proposals, staking requirements and auction parameters here are from the Hyperliquid docs as read on 23 November 2026. HIP parameters are designed to change as infrastructure matures, and the docs say some requirements are expected to decrease."
tags:
  - hyperliquid
  - hip-3
  - versions
concepts:
  - oracles-and-dependencies
  - collateral-and-liquidation
  - security-assumptions
glossary:
  - hypercore
  - hip-3
  - hlp
  - mark-price
relatedGuides: []
versions:
  - name: "HyperCore core perpetuals and spot"
    status: "active"
    note: "Native order books and the clearinghouse. Prices come from the validator-published oracle."
  - name: "HyperEVM"
    status: "active"
    note: "Smart contracts on the same consensus, with read access to HyperCore state. The docs describe an alpha stage."
  - name: "HIP-3 perpetual dexs"
    status: "active"
    note: "Deployer-run perpetual markets with independent margining and order books, a 500,000 HYPE staking requirement and validator slashing."
sources:
  - title: "HIP-2: Hyperliquidity"
    url: "https://hyperliquid.gitbook.io/hyperliquid-docs/hyperliquid-improvement-proposals-hips/hip-2-hyperliquidity"
    kind: "specification"
    publisher: "Hyperliquid"
  - title: "About Hyperliquid"
    url: "https://hyperliquid.gitbook.io/hyperliquid-docs/about-hyperliquid"
    kind: "docs"
    publisher: "Hyperliquid"
  - title: "HyperEVM"
    url: "https://hyperliquid.gitbook.io/hyperliquid-docs/hyperevm"
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
  - title: "Margining"
    url: "https://hyperliquid.gitbook.io/hyperliquid-docs/trading/margining"
    kind: "docs"
    publisher: "Hyperliquid"
  - title: "Funding"
    url: "https://hyperliquid.gitbook.io/hyperliquid-docs/trading/funding"
    kind: "docs"
    publisher: "Hyperliquid"
  - title: "Oracle"
    url: "https://hyperliquid.gitbook.io/hyperliquid-docs/hypercore/oracle"
    kind: "docs"
    publisher: "Hyperliquid"
---

"Hyperliquid" is a chain, an exchange, a vault, a token and a set of proposals. A statement that a position is "on Hyperliquid" does not say which of them it depends on. The [protocol page](/protocols/hyperliquid) explains the mechanism. This guide maps the names.

## The map

| Name | What it is | Who sets the price | Who lists assets |
| --- | --- | --- | --- |
| HyperCore | Margin, matching and clearinghouse state with native order books | Validators, as a stake-weighted median of oracle submissions | The protocol's own process |
| HyperEVM | Smart contracts on the same consensus | Whatever the contract reads, possibly the HyperCore books through a precompile | Anyone who deploys a contract |
| HIP-1 token | A capped-supply token with a native spot order book | The spot order book | A token deployer, through a spot auction |
| HIP-2 | A decentralized strategy that quotes liquidity for early HIP-1 tokens | The strategy's own parameters | Not a listing mechanism |
| HIP-3 perpetual | A perpetual market with its own margining and book | The deployer defines the oracle and sets oracle prices | A deployer that stakes HYPE |

## HyperCore

HyperCore is where most of the protocol's own trading happens. The clearinghouse manages margin, balances and positions per address, and the books are matched in price-time priority. The oracle is computed by validators from outside exchange prices, and the mark price used for margin and liquidation is derived from it. This is the layer the [protocol page](/protocols/hyperliquid) describes.

## HyperEVM

The docs say the HyperEVM is not a separate chain. It is secured by the same HyperBFT consensus and interacts with HyperCore directly. Their example is a lending contract that reads the price of a collateral asset from the HyperCore books to decide a liquidation threshold, and a spot asset that exists both as an ERC-20 on the HyperEVM and as a native spot token, linked so that the two are one unified state with no bridge between them.

For analysis this means a HyperEVM protocol can import HyperCore's prices. It inherits the oracle's properties: a price from a thin HIP-1 spot book is as manipulable as that book, and a price that blends outside exchanges is not. The [oracle concept page](/concepts/oracles-and-dependencies) lists the general questions.

The docs also describe the HyperEVM as being in an alpha stage with a gradual roll-out, and say higher throughput and write system contracts were not yet live on mainnet. Check the current docs for what is live.

## HIP-1 and HIP-2

HIP-1 is a token standard with a capped supply, specified by the deployer at genesis: a name, decimals, a maximum supply and optional initial balances. It comes with onchain spot order books between HIP-1 pairs. [HIP-2](https://hyperliquid.gitbook.io/hyperliquid-docs/hyperliquid-improvement-proposals-hips/hip-2-hyperliquidity), Hyperliquidity, is the liquidity bootstrapper for such tokens, a strategy that the docs say runs as part of block transition logic with no operators, secured by the same consensus.

Neither of these is a perpetual market. They matter here because a thin new spot market is where a manipulable price is most likely to come from, and a HyperEVM contract can read it.

## HIP-3

HIP-3 is where the trust model changes most. A deployer meeting a staking requirement can launch a perpetual dex. The docs describe what the deployer is responsible for: market definition, including the oracle definition and contract specifications, and market operation, including setting oracle prices, leverage limits and settling the market if needed.

The mechanism that protects traders is economic. The deployer must keep 500,000 HYPE staked, the requirement is held for at least 183 days after deployment, and validators can slash the stake by a stake-weighted vote if the market is operated maliciously. The stake stays slashable during the 7-day unstaking queue, and slashed stake is burned rather than paid to users. The docs are candid about the limits: slashing does not distinguish malicious from incompetent behavior, and it does not distinguish a deployer that deviates from a good spec from one that follows a bad spec or one whose keys are stolen.

Four differences from a core perpetual follow.

1. **The oracle is the deployer's.** The docs note that perpetuals make the most mathematical sense with a well-defined underlying that is hard to manipulate, and that most price indices are not suitable.
2. **Margin is per dex.** Cross margin positions on dexs with the same collateral share margin only for users with a unified account or portfolio margin. For the standard account mode, cross margin applies only within one dex. HIP-3 dexs also support a no-cross mode.
3. **Fees can differ.** Deployers can configure an additional fee share between 0 and 300 percent, and if it is above 100 percent the protocol fee rises to match.
4. **The backstop is separate.** Each HIP-3 dex has its own onchain backstop liquidator, which accepts only assets with cross margin enabled and falls back to auto-deleveraging. HLP is the backstop for core markets, not for these.

Settlement is also different. A deployer can halt trading on an asset, which cancels all orders and settles positions to the current mark price, and resume it later. The docs suggest this can be used to list dated contracts.

## What to check before trusting a market

1. Is it a core perpetual or a HIP-3 market? The asset id schema in the API distinguishes them, and the interface should say.
2. For a HIP-3 market, who is the deployer, what oracle does the market define and how often does the deployer update it?
3. What is the collateral asset, and does your account mode share margin across dexs?
4. For a HyperEVM contract that reads a HyperCore price, which book does it read and how deep is it?
5. For any HIP-1 token, what is the supply, who holds the genesis balances and how liquid is its book?

The [funding page](https://hyperliquid.gitbook.io/hyperliquid-docs/trading/funding) says HIP-3 perpetuals use a more responsive premium formula than core perpetuals so deployers can express a larger range of funding behaviors, which is one more reason to read a market's own specification and not assume it matches the others.
