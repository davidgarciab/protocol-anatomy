---
title: "Spark"
seoTitle: "How Spark works: SparkLend, Savings vaults, Liquidity Layer"
description: "How Spark turns Sky's stablecoin reserves into a money market, savings vaults and a rate-limited liquidity layer, and what each product leaves you trusting."
summary: "Spark is the capital allocator in the Sky ecosystem. SparkLend is an Aave V3 fork run conservatively, Spark Savings are ERC-4626 vaults that earn from allocations, and the Liquidity Layer moves stablecoins between governance-approved venues under rate limits. Governance runs through the Sky Atlas and the SPK token."
status: "published"
published: "2026-10-29"
lastVerified: "2026-10-29"
faq:
  - question: "What is Spark in DeFi?"
    answer: "Spark is the ecosystem's liquidity and yield layer for the Sky stablecoin system. It has three products: SparkLend, a money market built from Aave V3 code and centered on USDS; Spark Savings, a set of ERC-4626 vaults that earn from allocations or Sky rates; and the Spark Liquidity Layer, a non-custodial allocator that deploys Sky's stablecoin reserves across DeFi, CeFi and real-world asset venues."
    featured: true
  - question: "How is SparkLend different from Aave V3?"
    answer: "The code is a fork, but the risk posture is narrower. SparkLend lists a short collateral set, prices assets with a median of three oracles, adds a killswitch oracle for pegged collateral, sets caps through a Cap Automator, and has its liquidity topped up programmatically by the Spark Liquidity Layer. Parameters are set through Sky governance."
    featured: true
  - question: "What limits what the Spark Liquidity Layer can do?"
    answer: "Rate limits and a venue whitelist enforced in the contracts. A venue with no governance-set rate limit reverts on first use. Each limit has a ceiling and a refill slope, per-venue slippage floors apply, and a freezer role can revoke a compromised relayer. The design assumes the relayer can be fully compromised."
  - question: "Who covers losses in Spark Savings?"
    answer: "The documentation lists layers: Spark's own junior risk capital first, then risk capital from other Primes, a planned senior risk token, the Sky surplus buffer, an aggregate surplus buffer, and finally minting of SKY. Only if all of those are exhausted would remaining losses be applied across USDS holders. These are the documentation's stated layers, not guarantees."
  - question: "What is the SPK token?"
    answer: "Spark's governance token. Holders can vote directly or delegate to whitelisted delegates, and a proposal can be submitted by a holder of 1 percent of total supply, 100 million SPK. Governance edits the Spark Agent artifact in the Sky Atlas, which controls budgets, risk settings, asset onboarding and Liquidity Layer integrations."
order: 9
category: "Capital allocator and lending"
mechanism: "An Aave V3 fork funded by Sky, savings vaults backed by rate-limited allocations, and governance through the Sky Atlas."
versionContext: "Spark Savings V2 vaults are the current generation. sDAI and the V1 sUSDC remain as legacy vaults. SparkLend on Gnosis Chain has been deprecated, and Ethereum is unaffected."
tags:
  - spark
  - sky
  - lending
  - savings
concepts:
  - lending-utilization
  - collateral-and-liquidation
  - oracles-and-dependencies
  - stablecoin-mechanisms
  - isolated-markets-and-curation
  - governance-and-upgrades
guides:
  - spark-savings-and-liquidity
glossary:
  - spark-liquidity-layer
  - rate-limit
  - allocator
  - sky-savings-rate
  - susds
  - usds
  - peg-stability-module
  - erc-4626
versions:
  - name: "SparkLend"
    status: "active"
    note: "Aave V3 fork with a narrow collateral set, multi-oracle pricing and rate limits. Gnosis Chain deployment deprecated."
  - name: "Spark Savings V2"
    status: "active"
    note: "ERC-4626 vaults such as spUSDC, spUSDT and spETH that earn from the Spark Liquidity Layer."
  - name: "Savings V1 and DSR vaults"
    status: "deprecated"
    note: "sUSDC V1 and sDAI remain supported as legacy vaults. Users are encouraged to migrate."
  - name: "Spark Liquidity Layer"
    status: "active"
    note: "Operating since November 2024 by Spark's account. Non-custodial allocator under governance-set rate limits."
sources:
  - title: "Spark documentation"
    url: "https://docs.spark.fi/"
    kind: "docs"
    publisher: "Spark"
  - title: "Spark Liquidity Layer"
    url: "https://docs.spark.fi/products/spark-liquidity-layer"
    kind: "docs"
    publisher: "Spark"
  - title: "Spark Savings"
    url: "https://docs.spark.fi/products/spark-savings"
    kind: "docs"
    publisher: "Spark"
  - title: "SparkLend"
    url: "https://docs.spark.fi/products/sparklend"
    kind: "docs"
    publisher: "Spark"
  - title: "SparkLend liquidations"
    url: "https://docs.spark.fi/products/sparklend/guides/liquidations"
    kind: "docs"
    publisher: "Spark"
  - title: "SparkLend oracles"
    url: "https://docs.spark.fi/products/sparklend/guides/oracles"
    kind: "docs"
    publisher: "Spark"
  - title: "SparkLend E-Mode"
    url: "https://docs.spark.fi/products/sparklend/guides/e-mode"
    kind: "docs"
    publisher: "Spark"
  - title: "SparkLend Gnosis Chain deprecation"
    url: "https://docs.spark.fi/products/sparklend/gnosis-deprecation"
    kind: "docs"
    publisher: "Spark"
  - title: "Spark Isolated Markets"
    url: "https://docs.spark.fi/products/isolated-markets"
    kind: "docs"
    publisher: "Spark"
  - title: "Spark governance"
    url: "https://docs.spark.fi/governance"
    kind: "governance"
    publisher: "Spark"
  - title: "SPK staking"
    url: "https://docs.spark.fi/staking"
    kind: "docs"
    publisher: "Spark"
  - title: "sparklend-v1-core"
    url: "https://github.com/sparkdotfi/sparklend-v1-core"
    kind: "code"
    publisher: "Spark"
---

Spark started as a lending market for DAI. It now describes itself as a two-sided capital allocator: on one side it borrows from Sky's stablecoin reserves and deploys that money across DeFi, centralized venues and real-world assets, and on the other it packages the yield into products a user can hold. The money market is one product of three.

This page assumes the Sky background on the [Maker and Sky page](/protocols/maker-sky). The [guide](/guides/spark-savings-and-liquidity) covers the vault generations and the liquidity intent flow.

## SparkLend

SparkLend is a fork of [Aave V3](/protocols/aave): tokens such as the supply receipt spToken and the debt tokens follow the same design, and the source repository is a fork of Aave's core contracts. What differs is the operating posture and who sets the parameters. The Spark documentation describes it as USDS-centric, combining liquidity from Sky with listings of a deliberately short collateral set.

Its documented risk features form a stack, and each is meant to fail independently of the others:

- **A restricted collateral set.** ETH correlated collateral is limited to wstETH and rETH. BTC e-mode collateral was removed on a public timeline: noticed on the Sky forum, executed in the June 2026 spell, with remaining positions force-liquidated on 8 June 2026.
- **Caps.** Per-asset supply and borrow caps are set by Sky governance, and a Cap Automator scales them with market depth.
- **Minimal rehypothecation.** Collateral supplied stays in the reserve.
- **Rate limits** on cross-module flows: deposits, withdrawals, bridging and PSM swaps.
- **A three-oracle median** from RedStone, Chainlink and Chronicle. With three valid, non-stale values the median is used. With two, their average. A single-feed fallback exists.
- **A killswitch oracle for pegged collateral.** For assets priced by an exchange rate or fixed ratio, such as wstETH, rETH, weETH, cbBTC, WBTC and LBTC, a peg-ratio oracle compares market price with the underlying and halts new borrowing if the deviation passes a per-asset threshold. It stops someone posting a distressed token at stale face value.
- **A variable close factor.** If health factor is below 1 but above 0.95, up to 50 percent of debt can be covered in a liquidation. At or below 0.95, up to 100 percent. The [collateral and liquidation page](/concepts/collateral-and-liquidation) discusses what this does to liquidator incentives.
- **Granular borrowing-power control.** Governance can reduce an asset's borrowing power to zero without immediately liquidating existing borrowers.

SparkLend is also fed from the Liquidity Layer. When utilization runs high, the layer can move USDS, USDC and USDT in to let withdrawals and liquidations clear, and out when other venues offer a better risk-adjusted return. That makes Spark, in the documentation's phrase, the largest depositor in its own market, which gives its liquidity a source that ordinary suppliers' do not have. It also means SparkLend's depth depends on an allocator's decisions.

SparkLend on Gnosis Chain has been deprecated: the markets are frozen, remaining borrow positions are being liquidated, and suppliers can still withdraw. The Ethereum market is unaffected.

## The Liquidity Layer

The Spark Liquidity Layer (SLL) is the part that moves money. The documentation describes it as a non-custodial capital allocator that has operated without fault since November 2024. Its design goal is that capital movement stays constrained, predictable and bounded, including under stress.

<diagram-placeholder name="spark-allocation"></diagram-placeholder>

Four mechanisms enforce it, per the documentation:

1. **Whitelist by rate-limit key.** Every controller action is gated by a key, typically combining an action with a target address. A venue with no governance-configured limit reverts on first interaction, so there is no route to an unapproved address.
2. **Linear regeneration with a hard ceiling.** A limit has a maximum, a slope in tokens per second and a last-used amount. The available amount is the smaller of the slope-refilled balance and the maximum.
3. **Per-venue slippage floors.** Curve, Uniswap V4, Aave and OTC operations need a non-zero `maxSlippage`, written inversely: 0.999e18 means the result must be at least 99.9 percent of expected, and zero disables the venue.
4. **Bounded OTC exposure.** OTC swaps go through dedicated buffer contracts with one outstanding swap per exchange.

Two roles operate it. A `RELAYER` moves capital between approved venues, and a `FREEZER` can remove a compromised relayer. The threat model assumes a relayer can be fully compromised, so the damage is limited by limits, not by trusting the key. The same shape appears in Morpho's curator and allocator split, covered in [isolated markets and curation](/concepts/isolated-markets-and-curation).

A worked example of a rate limit. Suppose a venue has a maximum of 100 million and a slope of 10 million per day. If the relayer uses all of it, the available amount is zero. After one day it is 10 million, after five days 50 million, and after ten days it is back at the ceiling. A compromised relayer can therefore move at most the ceiling at once and the slope thereafter. These numbers are illustrative, not Spark's configuration.

The documented integrations are broad: USDS minting through the Sky allocation system and one-to-one conversion with DAI, PSM swaps between USDS and USDC, Circle's cross-chain USDC transfer and LayerZero bridging, Aave-compatible markets including SparkLend and Aave V3, ERC-4626 vaults including Spark-curated Morpho vaults, Curve pools restricted to one-to-one stablecoin pools, Uniswap V4 stablecoin pools restricted to hookless one-to-one pools, OTC desks, Ethena USDe minting and sUSDe cooldowns, Lido and ether.fi staking, Maple redemptions, Superstate subscriptions and SPK farm staking. Supported networks include Ethereum, Base, Arbitrum, Optimism, Unichain, Avalanche, Robinhood and X Layer.

Most of those venues have their own pages here: [Morpho](/protocols/morpho), [Ethena](/protocols/ethena), [Lido](/protocols/lido), [Curve](/protocols/curve), [Uniswap](/protocols/uniswap) and [Aave](/protocols/aave). Spark's yield is the sum of their risks, bounded by Spark's limits.

## Spark Savings

Savings vaults are ERC-4626 tokens. The documentation lists the current set: spUSDC, spUSDT, spPYUSD, spETH and spUSDG as Spark V2 vaults that earn through the Liquidity Layer, sUSDS and stUSDS as Sky products with rates set by Sky governance, and legacy vaults sUSDC V1 and sDAI. Different vaults have different yield sources, operators and risk profiles.

The V2 vaults hold a liquidity buffer of up to 10 million for atomic withdrawals. Larger withdrawals use *savings liquidity intents*: the user signs a request for any amount, and the Liquidity Layer fulfils it, usually within a few minutes, according to the documentation. The documentation also says a vault can be put into recovery mode, temporarily halting withdrawals so all users are treated equally.

The documented loss-absorbing layers for the USD vaults, from first to last: Spark's own junior risk capital, other Primes' junior capital, a planned senior risk token (srUSDS), Sky's surplus buffer, an aggregate surplus buffer, a SKY mint to recapitalize, and only then equal losses across USDS holders. The documentation puts Spark's stablecoin equity at over 35 million. Read that list as the intended order, written by the party that runs the vaults. spETH is described as backed by Spark's balance sheet and insurance. stUSDS lends USDS against SKY collateral and carries, per the documentation, potential liquidity constraints and no automatic liquidations.

## Isolated Markets

Spark's app also exposes Morpho-based isolated markets, each one collateral and one loan asset with its own oracle, liquidation parameters and rate model, plus a Public Allocator that can source liquidity from other markets on demand. These are Morpho's contracts, not SparkLend's, so the risks are those described on the [Morpho page](/protocols/morpho).

## Governance

Governance centers on the Spark Agent artifact in the Sky Atlas. It controls budgets, risk settings, asset onboarding, Liquidity Layer integrations and new chain deployments, and changes go through Atlas Root Edit proposals. SPK holders vote directly or delegate to whitelisted delegates. A proposal needs a proposer holding 1 percent of SPK supply, 100 million, or a nested contributor. A Spark Risk Council reviews for one week and can stop a risky or malicious proposal, and an operational facilitator checks alignment with the Atlas, before a Snapshot vote. SPK can be staked through Symbiotic's infrastructure. The airdrop claim period ended on 17 December 2025.

## What remains trusted

SparkLend inherits Aave V3's contract risk and adds the parameter choices of Sky governance. The Liquidity Layer relies on the whitelist, limits and roles being right. Savings vaults rely on every venue the layer touches, and on layers of capital whose size is stated by Spark and Sky. The oracle stack reduces single-feed failure, not common-mode failure. Everything is upgraded through a governance process that the Risk Council can stop, but that a small number of delegates can steer in its bootstrapping phase, which the documentation itself notes.
