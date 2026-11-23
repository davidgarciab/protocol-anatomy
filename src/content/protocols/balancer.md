---
title: "Balancer"
seoTitle: "How Balancer works: the V3 Vault, pools and hooks"
description: "How Balancer's Vault holds every pool's tokens, how transient accounting settles a swap, what pools and hooks add, and why the V2 exploit and BAL changes matter."
summary: "Balancer is an AMM built around one Vault that holds the tokens and accounts for all pools, while each pool contract supplies only its pricing math. V3 adds transient accounting, routers, hooks and built-in support for yield-bearing tokens. V2 pools were exploited in November 2025, and governance was restructured in 2026."
status: "published"
published: "2026-11-23"
lastVerified: "2026-11-23"
faq:
  - question: "What does the Balancer Vault do that a pool contract does not?"
    answer: "The Vault holds the tokens of every pool, mints and burns pool tokens, records the debts and credits of an operation, and enforces that they settle before a transaction ends. A pool only exposes its math, such as how much to pay for a swap. Separating the two lets pool authors skip accounting code."
    featured: true
  - question: "What is transient accounting in Balancer V3?"
    answer: "A router unlocks the Vault, then calls swap, add liquidity and similar functions, and the Vault tracks the net debt and credit for each token in transient storage. When the router finishes, the Vault checks that the count of non-zero deltas is zero. If any debt is unsettled the whole transaction reverts, so no tokens move until everything balances."
    featured: true
  - question: "Was Balancer V3 affected by the November 2025 exploit?"
    answer: "Trail of Bits, which worked with the Balancer team after the incident, says it independently confirmed that Balancer v3 was not affected. The attack targeted Balancer v2 pools, in particular Composable Stable Pools, using a rounding direction error in the stable math. Pools and the Vault of V3 are separate contracts."
  - question: "Does veBAL still direct emissions?"
    answer: "No. Balancer's governance docs say BAL emissions were halted and veBAL was discontinued after proposals ratified in the second quarter of 2026. Existing locks remain on chain until they expire, but they no longer earn protocol fees or direct emissions, and voting power is now raw BAL."
order: 12
category: "Exchange"
mechanism: "A single Vault that holds all pool tokens and settles debts and credits atomically, with pluggable pool math and hooks."
versionContext: "Balancer V3 is the architecture the current docs describe. V2 pools still exist, were the target of a November 2025 exploit, and use a different Vault design. BAL tokenomics and governance were restructured in 2026."
tags:
  - amm
  - vault
  - hooks
concepts:
  - automated-market-makers
  - liquidity-pools
  - constant-product
  - concentrated-liquidity
  - flash-liquidity
  - security-assumptions
  - governance-and-upgrades
guides:
  - balancer-versions
glossary:
  - balancer-vault
  - transient-accounting
  - bpt
  - rate-provider
  - hook
  - erc-4626
  - stableswap
versions:
  - name: "Balancer V2"
    status: "historical"
    note: "The Vault, weighted, stable and composable stable pools, with the Vault as the user interface. The docs for V3 point to a separate site for V2. Composable Stable Pools were exploited on 3 November 2025."
  - name: "Balancer V3"
    status: "active"
    note: "A new Vault with routers, transient accounting, hooks, ERC-4626 buffers and a protocol-wide Authorizer. The V3 docs describe pool types including weighted, stable, StableSurge, Gyroscope, AutoRange and liquidity bootstrapping pools."
sources:
  - title: "Balancer V3 introduction"
    url: "https://docs.balancer.fi/concepts/core-concepts/introduction.html"
    kind: "docs"
    publisher: "Balancer"
  - title: "Balancer V3 architecture"
    url: "https://docs.balancer.fi/concepts/core-concepts/architecture.html"
    kind: "docs"
    publisher: "Balancer"
  - title: "Transient accounting"
    url: "https://docs.balancer.fi/concepts/vault/transient-accounting.html"
    kind: "docs"
    publisher: "Balancer"
  - title: "ERC20MultiToken"
    url: "https://docs.balancer.fi/concepts/vault/erc20-multi-token.html"
    kind: "docs"
    publisher: "Balancer"
  - title: "ERC-4626 liquidity buffers"
    url: "https://docs.balancer.fi/concepts/vault/buffer.html"
    kind: "docs"
    publisher: "Balancer"
  - title: "Token types"
    url: "https://docs.balancer.fi/concepts/vault/token-types.html"
    kind: "docs"
    publisher: "Balancer"
  - title: "Swap fee"
    url: "https://docs.balancer.fi/concepts/vault/swap-fee.html"
    kind: "docs"
    publisher: "Balancer"
  - title: "Yield fee"
    url: "https://docs.balancer.fi/concepts/vault/yield-fee.html"
    kind: "docs"
    publisher: "Balancer"
  - title: "Hooks"
    url: "https://docs.balancer.fi/concepts/core-concepts/hooks.html"
    kind: "docs"
    publisher: "Balancer"
  - title: "Weighted pools"
    url: "https://docs.balancer.fi/concepts/explore-available-balancer-pools/weighted-pool/weighted-pool.html"
    kind: "docs"
    publisher: "Balancer"
  - title: "Stable pools"
    url: "https://docs.balancer.fi/concepts/explore-available-balancer-pools/stable-pool/stable-pool.html"
    kind: "docs"
    publisher: "Balancer"
  - title: "AutoRange pools"
    url: "https://docs.balancer.fi/concepts/explore-available-balancer-pools/autorange-pool/reclamm-pool.html"
    kind: "docs"
    publisher: "Balancer"
  - title: "Vault configuration constants"
    url: "https://docs.balancer.fi/developer-reference/contracts/vault-config.html"
    kind: "docs"
    publisher: "Balancer"
  - title: "Active permissions in the Authorizer"
    url: "https://docs.balancer.fi/developer-reference/authorizer/"
    kind: "docs"
    publisher: "Balancer"
  - title: "Liquidity bootstrapping pools"
    url: "https://docs.balancer.fi/concepts/explore-available-balancer-pools/liquidity-bootstrapping-pool/liquidity-bootstrapping-pool.html"
    kind: "docs"
    publisher: "Balancer"
  - title: "Balancer governance"
    url: "https://docs.balancer.fi/concepts/governance/"
    kind: "docs"
    publisher: "Balancer"
  - title: "Protocol fee operations"
    url: "https://docs.balancer.fi/concepts/governance/protocol-fees.html"
    kind: "docs"
    publisher: "Balancer"
  - title: "Balancer hack analysis and guidance for the DeFi ecosystem"
    url: "https://blog.trailofbits.com/2025/11/07/balancer-hack-analysis-and-guidance-for-the-defi-ecosystem/"
    kind: "security"
    publisher: "Trail of Bits"
  - title: "Understanding the Balancer V2 exploit"
    url: "https://www.openzeppelin.com/news/understanding-the-balancer-v2-exploit"
    kind: "security"
    publisher: "OpenZeppelin"
---

Balancer is an automated market maker with an unusual division of labor. In most AMMs each pool is a contract that holds its own tokens, does its own accounting and prices its own trades. In Balancer one contract, the **Vault**, holds the tokens of every pool, and a pool is only a contract that answers a pricing question. That choice shapes everything else on this page: how a swap settles, why pools can be exotic, why one bug can reach many pools, and what an integrator has to trust.

The [versions guide](/guides/balancer-versions) separates V2 from V3. This page describes V3, which is what the current documentation covers, and then the two events that changed how to read the protocol: the V2 exploit of November 2025 and the governance restructuring of 2026. The [concept pages](/concepts/automated-market-makers) cover AMMs in general, and [Uniswap](/protocols/uniswap) and [Curve](/protocols/curve) are the natural comparisons.

## Three components

The docs name three parts of the architecture. A **Router** is the user's gateway. A **Vault** centralizes liquidity operations and accounting. A **Pool** exposes its math. The Vault is part of the core protocol. Routers and pools can be written by anyone, and the docs say hooks and pools can themselves act as routers by calling the Vault.

The split is explicit about who does what. A pool does not move tokens and does not mint or burn its own pool token. The docs say pools expose `onSwap` for swaps and `calculateInvariant` or `computeBalance` for adding and removing liquidity, and the Vault turns those results into debts and credits. Proportional adds and removes are an exception: the docs say the Vault solves that math itself.

The Vault also holds the **Balancer Pool Tokens** (BPT), the shares of each pool. An `ERC20MultiToken` contract inspired by ERC-1155 gives the Vault full control over BPT accounting, so it can mint and burn directly, while each pool's token still behaves as a standard ERC-20. Centralizing both token and BPT accounting is how the docs say V3 achieves atomic updates to pool state.

## Transient accounting

The mechanism that makes this work is how an operation settles. A router calls the Vault's `unlock`. The Vault then calls back into the router, and for the duration of that callback anyone can call the Vault functions that require it to be unlocked, such as `swap`, `addLiquidity`, `removeLiquidity`, `settle`, `sendTo` and `takeFrom`. The Vault records how many tokens of each kind it is owed and how many can be pulled out of it. When the callback ends, the Vault requires that every debt and credit has been settled. The docs state the check: a count of non-zero deltas must be zero. Otherwise the transaction reverts.

```text
router.unlock
  -> vault calls router back
       swap(poolA, tokenIn, tokenOut)      credit tokenOut, debt tokenIn
       swap(poolB, tokenOut, tokenOther)   net out tokenOut, debt tokenIn
       settle / sendTo / takeFrom          clear the remaining deltas
  -> vault checks: every delta is zero, or revert
```

That sketch follows the docs' description. It is not Balancer source. Its consequence is that a multi-hop swap does not move the intermediate token. Only the net debt and credit settle at the end, and the docs describe the accounting as held in transient state, which is how the design saves gas on multi-step operations. [Uniswap v4's flash accounting](/glossary/flash-accounting/) has the same shape. The docs also describe hooks interacting with the Vault directly, because a hook is a separate contract and cannot sign the Permit2 approvals a router uses.

<diagram-placeholder name="balancer-vault-flow"></diagram-placeholder>

The router layer is where convenience lives. The docs list a basic Router, a BatchRouter, a BufferRouter and a CompositeLiquidityRouter, plus aggregator routers that take tokens prepaid to the Vault. Because the Vault is immutable and routers are not, new combinations of operations do not need a Vault upgrade. In V2 the Vault was the user interface, and the docs say that limited combining swaps and liquidity operations.

## Pools

Because accounting is out of the pool, a pool is small. The docs describe the pool types Balancer has built and audited:

| Pool | Pricing idea | Notes from the docs |
| --- | --- | --- |
| Weighted | A generalization of `x * y = k` to two or more tokens with weights that need not be equal | Suited to tokens without price correlation. Vault-level limit of 8 tokens |
| Stable | Stable math, based on StableSwap | Suited to assets near parity or at a known rate. A safe maximum of 5 tokens |
| StableSurge | A stable pool with a hook that raises the swap fee as the pool becomes more unbalanced | Fee depends on the pool's balance during a trade |
| Gyroscope | Concentrated liquidity curves, including 2-CLP and elliptic E-CLP | Liquidity concentrated in a range |
| AutoRange | A fungible concentrated-liquidity pool that moves its price range as it becomes unbalanced | Range shifts without user or governance action once a margin threshold is crossed |
| Liquidity bootstrapping | Weights that change over time, or a fixed price variant | Used for token launches and treasury operations |

The common thread is that the invariant is the author's choice. A pool's `Stable` maximum amplification in the docs' constants table is 50,000, higher than the 5,000 limit of V2, and the numbers ultimately come from the math in Curve's StableSwap, which the docs say outright. A reader who knows [Curve](/protocols/curve) will recognize the invariant and notice what is different: Curve pools hold their own tokens, and Balancer's stable pool holds only math.

Balancer's [concentrated liquidity](/concepts/concentrated-liquidity) differs from Uniswap's. A Uniswap position is an NFT with a chosen range. A Balancer AutoRange pool is fungible: its range is a pool parameter, and the pool adjusts the range itself.

## Yield-bearing tokens

The Vault has native support for tokens whose value drifts against another asset. A token marked `WITH_RATE` has an external exchange rate that the pool should use when pricing, with wstETH and a euro stablecoin as the docs' examples. A **rate provider** supplies that rate, and the docs say it can come from an oracle, a ratio of balances or another calculation. As with [Curve's asset types](/protocols/curve), the pool will clear trades against whatever the provider says, so a wrong rate is a wrong price.

ERC-4626 **liquidity buffers** let the Vault quote trades between an ERC-4626 token and its underlying, such as a wrapped lending token and its asset, without wrapping through the lending protocol each time. The docs say buffers are internal to the Vault, are not pools, and trade on `previewDeposit` and `previewMint`. They enable boosted pools, where 25 to 100 percent of the tokens earn yield elsewhere. The docs also say yield fees are charged on interactions when a token is configured to pay them and yield accrued since the last computation.

## Fees

A swap fee is charged on the amount in, and also on the non-proportional part of an add or remove liquidity. The docs' example is a user who adds 15 DAI and 10 USDC to a balanced pool: the extra 5 DAI is the non-proportional part, and it pays a swap fee. The initial fee is set at registration. V3 puts no limit on the fee at the Vault level and leaves bounds to each pool type: 0.001 to 10 percent for standard weighted pools and 0.0001 to 10 percent for stable pools.

Hooks can compute a **dynamic swap fee**, which is how StableSurge works. The docs list the hook points as `onRegister`, before and after initialize, before and after add and remove liquidity, before and after swap, and the dynamic fee computation. One hook contract can serve many pools. A hook is code the pool calls during an operation, with the same trust implications described for [Uniswap v4 hooks](/glossary/hook/).

Protocol fees are a share taken from those fees. After the 2026 governance changes covered below, the docs give a V3 swap fee share of 25 percent, a yield fee share of 10 percent, and V2 swap fees at 50 percent. All of it routes to the DAO treasury.

## The November 2025 exploit

On 3 November 2025 an attacker drained Balancer V2 pools on nine networks. Trail of Bits, which audited V2 in 2021 and worked with the team afterward, describes more than $100 million lost, through a rounding direction error in V2 pools. OpenZeppelin puts the cumulative loss at more than $120 million across Balancer and its forks and says the targeted pools were mostly Composable Stable Pools. Other reports differ, so no single figure is settled. Balancer's own post-mortem is on Medium, which blocks automated readers, so this page relies on the two independent analyses.

Trail of Bits says the issue was in code that had been present for years. In 2021 it had flagged a similar rounding issue in how Linear Pools used the stable math library, rated undetermined severity, and recommended fuzz testing for rounding directions. It says the exploited pools were reviewed in 2022 with the stable math library out of scope. It also says it independently confirmed that Balancer V3 was not affected.

Three general lessons follow, and they apply beyond Balancer. A one-wei rounding error in the wrong direction can be profitable in a low-liquidity pool with particular parameters. A shared math library is a single point of failure for every pool that imports it. And what a protocol can do in an incident depends on whether it can be paused or upgraded, which Trail of Bits lists as a design decision to make before an attack, not after. The [security assumptions](/concepts/security-assumptions) page lists toolchain and library risk with the other assumptions.

## Governance after 2026

The governance documentation states that the model was restructured by proposals ratified in the second quarter of 2026. BIP-918 consolidated operations under Balancer OpCo after the wind-down of Balancer Labs. BIP-919 halted BAL emissions, reduced the V3 protocol swap fee share from 50 to 25 percent, routed all protocol fees to the DAO treasury, discontinued veBAL economic rights and authorized a buyback-and-burn program. BIP-920 paid veBAL holders a one-off compensation of 500,000 USDC. BIP-921 replaced veBAL-based voting strategies with raw BAL votes, set quorum at 10 million BAL, and removed the veBAL proposal threshold.

The practical effects, in the docs' words: existing veBAL locks stay on chain until they expire but earn no fees and direct no emissions, and voting power is the BAL balance across production chains. Routine decisions fall to a service-provider mandate, with protocol fee parameter changes among them, and need no Snapshot vote. Major decisions, such as new pool factories, novel pool types, new chain deployments and BAL supply changes, still need a proposal. On-chain operations run through multisigs operated by Balancer Onchain Ltd, which the docs say have no decision power of their own: they enact what BAL holders vote.

An emergency subDAO, a 3-of-7 multisig per BIP-883, can kill gauges, pause pools and manage pool factories. This matters for the trust model: a small group can pause pools, and a service provider operates the multisigs. [Curve's veCRV](/protocols/curve) and Balancer's earlier veBAL are the same idea, and Balancer's version has now been wound down, which is a data point about how durable lock-based governance has been.

## What remains trusted

The Vault, which holds every pool's tokens. A bug in it, or in its accounting, reaches all V3 pools at once, which is the cost of concentration. Each pool's math, and for stable math in particular the rounding rules. Every rate provider, and every ERC-4626 token behind a buffer. Each hook that a pool registers, which runs inside the operation. The permissions in the protocol's Authorizer, which the docs list per deployment. And the governance set that is now a smaller organization than it was.

The docs say V3 bounds are set at pool level, not Vault level. A pool that accepts a fee or an amplification outside what the team audited is the pool author's responsibility. Reading a pool's registered parameters is the way to find out which math and which hooks it is actually using.
