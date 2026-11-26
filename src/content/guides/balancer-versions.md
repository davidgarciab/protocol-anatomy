---
title: "Balancer V2 and V3"
seoTitle: "Balancer V2 vs V3: Vault, routers, hooks and fees"
description: "What changed between Balancer V2 and V3: the Vault's role, routers, hooks, yield-bearing support, fee shares and amplification limits, and which version a pool uses."
summary: "Balancer V2 and V3 both keep tokens in a Vault and pricing math in pools, but they are separate deployments. V3 moves user interaction into routers, adds hooks and ERC-4626 buffers, and changes fee shares and limits. The November 2025 exploit hit V2 pools, so the version of a pool decides which risks apply."
status: "published"
published: "2026-11-23"
lastVerified: "2026-11-26"
changes:
  - date: "2026-11-26"
    summary: "Added the Vault page that supports the statement about where the Vault design began."
faq:
  - question: "Is Balancer V3 a new version of the same Vault?"
    answer: "No. V3 is a new Vault with a new set of contracts, and the V3 docs point to a separate site for anything about V2. Both generations share the idea of a Vault that holds tokens and pools that supply math, but a V2 pool and a V3 pool are different deployments with different accounting and different interfaces."
    featured: true
  - question: "What changed about how users interact with the Vault in V3?"
    answer: "In V2 the Vault was the user interface, and every swap and liquidity operation was a call on it. In V3 the docs introduce Routers: contracts that unlock the Vault, perform a combination of operations in a callback and settle debts and credits. Because the Vault is immutable, new operation combinations come from new routers."
  - question: "Which Balancer version should I check for a given pool?"
    answer: "Check which Vault contract holds the pool's tokens. A V2 pool is registered in the V2 Vault and is one of the pool types of that generation, such as Composable Stable. A V3 pool is registered in the V3 Vault and may use a hook. The November 2025 exploit targeted V2 pools, and Trail of Bits says V3 was not affected."
order: 12
protocol: "balancer"
versionContext: "V3 is documented on docs.balancer.fi. V2 is documented on a separate site, and V2 pools remain on chain. The governance and fee changes of 2026 apply to the protocol as a whole, with different shares per version."
tags:
  - balancer
  - versions
  - amm
concepts:
  - automated-market-makers
  - liquidity-pools
  - security-assumptions
glossary:
  - balancer-vault
  - transient-accounting
  - bpt
  - rate-provider
  - hook
relatedGuides: []
versions:
  - name: "Balancer V2"
    status: "historical"
    note: "A Vault that is also the user interface, with weighted, stable and composable stable pools. Composable Stable Pools were exploited on 3 November 2025. Documented on a separate site."
  - name: "Balancer V3"
    status: "active"
    note: "A new Vault, routers, transient accounting, hooks, ERC-4626 buffers, lower protocol fee shares and a higher amplification limit. Documented on docs.balancer.fi."
sources:
  - title: "Balancer V3 Vault"
    url: "https://docs.balancer.fi/concepts/vault/"
    kind: "docs"
    publisher: "Balancer"
  - title: "Balancer V3 introduction"
    url: "https://docs.balancer.fi/concepts/core-concepts/introduction.html"
    kind: "docs"
    publisher: "Balancer"
  - title: "Balancer routers"
    url: "https://docs.balancer.fi/build/build-a-router/existing-routers.html"
    kind: "docs"
    publisher: "Balancer"
  - title: "Vault configuration constants"
    url: "https://docs.balancer.fi/developer-reference/contracts/vault-config.html"
    kind: "docs"
    publisher: "Balancer"
  - title: "Protocol fee operations"
    url: "https://docs.balancer.fi/concepts/governance/protocol-fees.html"
    kind: "docs"
    publisher: "Balancer"
  - title: "Balancer V3 architecture"
    url: "https://docs.balancer.fi/concepts/core-concepts/architecture.html"
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

"Balancer" now names two deployments that share a design idea and little else. The [protocol page](/protocols/balancer) explains the V3 mechanism and the events of 2025 and 2026. This guide maps the two generations, because a report that says "a Balancer pool" has not said which Vault holds it.

## The shared idea

Both generations separate token accounting from pool logic. The V3 [Vault page](https://docs.balancer.fi/concepts/vault/) says the Vault architecture was first introduced in V2 and that it allows simplified pool contracts that focus on their swap, add liquidity and remove liquidity logic. In both, one Vault holds the tokens of many pools, and a pool is a contract that answers pricing questions.

## The map

| | V2 | V3 |
| --- | --- | --- |
| Who users call | The Vault itself | A router, which unlocks the Vault and settles |
| Combining operations | Relayers or extensions to pools | A custom router |
| Protocol fee share | 50 percent of swaps, 50 percent of yield | 25 percent of swaps, 10 percent of yield |
| Stable amplification maximum | 5,000 | 50,000 |
| Hooks, token types with rates, ERC-4626 buffers | Not described in the V3 docs as V2 features | Part of the Vault and pool design |
| Documentation | A separate V2 site | docs.balancer.fi |

The fee shares come from the protocol fee page, as updated after the 2026 tokenomics changes, and the amplification limits come from the V3 constants page. The V2 column lists only what the V3 documentation says about V2. It is not a full account of V2 features, which are documented on the V2 site.

## What routers change

The V3 docs say the introduction of routers is one of the major architectural changes. In V2 the Vault was the user interface: every swap and liquidity operation was a contract call on the Vault. The docs say this was limiting when users wanted to combine swaps and liquidity operations in one call, and that, since the Vault is immutable, new operations required relayers or extensions to already complex pools.

In V3 a router calls `unlock` on the Vault, the Vault calls the router back, and the router performs any combination of Vault operations inside that callback. Debts and credits are recorded and must be settled before the Vault locks again. The router is replaceable, the Vault is not. For a user the difference is invisible. For an integrator it means a V3 integration targets a router and its quote functions, and a V2 integration targets the Vault.

## What hooks and buffers change

V3 hooks extend existing pool types at fixed points: before and after initialization, add liquidity, remove liquidity and swap, plus a dynamic swap fee computation. A hook is a standalone contract that can serve many pools. This is how a pool gets behavior such as a fee that rises when it becomes unbalanced without a new invariant. The cost is that a hook is more code the pool calls during an operation.

ERC-4626 buffers are a Vault feature for pairs of an ERC-4626 token and its underlying. They let the Vault quote and execute between them without going through the lending protocol each time, and they enable boosted pools, where some or all of a pool's tokens earn yield elsewhere. Both are V3 additions in the docs.

## The exploit and the version

On 3 November 2025 V2 pools were drained across several networks through a rounding direction error. OpenZeppelin says the targeted pools were mostly Composable Stable Pools. Trail of Bits, which worked with the Balancer team afterward, says it independently confirmed that V3 was not affected. That is a statement about the vulnerability, not about every other possible risk of V3.

For a reader this means the version check is not a formality. An unmigrated V2 position sits in a Vault whose pool math has had a known failure. A V3 position sits in a newer Vault with a smaller track record and with hooks that did not exist before. Neither is safer in every way.

## What to check before relying on a name

1. Which Vault address holds the pool's tokens? That settles the version.
2. If it is V3, does the pool register a hook, and which? The pool's registration data shows it.
3. Which rate providers does the pool use, and who controls them?
4. Which fee share applies? The V2 and V3 shares differ, and governance can change them without a protocol upgrade.
5. If it is a V2 pool, has it been migrated or paused since the November 2025 incident? The V2 documentation and Balancer's announcements are the place to check.

The [AMM pricing curves comparison](/compare/amm-pricing-curves) puts the invariants of weighted, stable and concentrated pools next to each other, and the [security assumptions](/concepts/security-assumptions) page lists the dependencies a reader accepts in each case.
