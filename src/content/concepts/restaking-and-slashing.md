---
title: "Restaking and slashing"
seoTitle: "Restaking and slashing: how EigenLayer works"
description: "How restaking reuses staked ETH to back other services, what unique stake and operator sets change, and where slashing risk sits."
summary: "Restaking lets the same staked asset back more than one service. The price is that each service can define a way to take part of that stake. EigenLayer limits the damage with operator sets, allocation delays and unique stake, but the rule for what counts as a fault still belongs to each service."
status: "published"
published: "2026-10-29"
lastVerified: "2026-10-29"
faq:
  - question: "What is restaking in simple terms?"
    answer: "Restaking means committing an asset that is already staked, such as ETH backing Ethereum validators or a liquid staking token, to secure additional services. The staker earns extra rewards from those services and accepts extra conditions under which part of the stake can be slashed."
    featured: true
  - question: "Who decides what gets an operator slashed on EigenLayer?"
    answer: "The service, called an AVS. The AllocationManager enforces only that the operator is registered, has stake allocated to the operator set, and that the slash is a proportion of that allocation. Whether a fault actually occurred is the AVS's own logic, run through a single slasher address it sets for each operator set."
    featured: true
  - question: "Can one slashing event drain all of my restaked ETH?"
    answer: "Not through one service alone. Since unique stake, an operator allocates a share of its stake to each operator set and only that set's slasher can slash that allocation. Many allocations to different sets can still add up, and a slash of one set reduces the operator's total slashable base for every staker delegated to it."
order: 18
group: "monetary"
tags:
  - restaking
  - slashing
  - eigenlayer
protocols:
  - eigenlayer
  - lido
glossary:
  - restaking
  - avs
  - operator-set
  - unique-stake
  - slashing
  - steth
related:
  - liquid-staking
  - governance-and-upgrades
  - security-assumptions
  - composability
sources:
  - title: "Slashing goes live on mainnet"
    url: "https://www.eigenlabs.org/blog/slashing-goes-live/"
    kind: "docs"
    publisher: "Eigen Labs"
  - title: "ELIP-002: Slashing via Unique Stake and Operator Sets"
    url: "https://github.com/eigenfoundation/ELIPs/blob/main/ELIPs/ELIP-002.md"
    kind: "governance"
    publisher: "Eigen Foundation"
  - title: "AllocationManager"
    url: "https://github.com/Layr-Labs/eigenlayer-contracts/blob/main/docs/core/AllocationManager.md"
    kind: "docs"
    publisher: "Eigen Labs"
  - title: "DelegationManager"
    url: "https://github.com/Layr-Labs/eigenlayer-contracts/blob/main/docs/core/DelegationManager.md"
    kind: "docs"
    publisher: "Eigen Labs"
  - title: "EigenPod"
    url: "https://github.com/Layr-Labs/eigenlayer-contracts/blob/main/docs/core/EigenPod.md"
    kind: "docs"
    publisher: "Eigen Labs"
  - title: "Shares accounting after the slashing upgrade"
    url: "https://github.com/Layr-Labs/eigenlayer-contracts/blob/main/docs/core/accounting/SharesAccounting.md"
    kind: "docs"
    publisher: "Eigen Labs"
---

Ethereum validators lock ETH so the protocol can penalize them if they misbehave. That lock is a scarce form of trust. Restaking asks whether the same lock can vouch for something other than Ethereum, such as a data availability network, an oracle or a bridge. If it can, a new service does not have to bootstrap its own token and validator set.

The [liquid staking](/concepts/liquid-staking) page covers the first step, a pooled claim on staked ETH. Restaking is the second layer on top of it. [EigenLayer](/protocols/eigenlayer) is the largest implementation, and the one this page uses.

## The three roles

- **Stakers** deposit assets. They can point their own validators at an EigenPod, or deposit a supported token such as a liquid staking token into a strategy.
- **Operators** run the software a service requires. Stakers delegate their deposit to an operator, and the operator's weight is the sum of what was delegated to it.
- **Services**, called [AVSs](/glossary/avs/), define the work, the rewards and the penalties.

Delegation is not a custody transfer. The tokens stay in EigenLayer's contracts. What the operator receives is the right to put the delegated stake behind services.

## From shared stake to unique stake

The first design let an operator opt into services with its whole delegated balance slashable by any of them. That gave operators little control and gave each service no guarantee that the stake it counted on was not also promised elsewhere.

Slashing went live on Ethereum mainnet on 17 April 2025 with a different model, specified in ELIP-002:

1. An AVS creates **operator sets**. A set names the strategies whose stake counts and the address allowed to slash.
2. An operator **registers** for a set and **allocates** a proportion of its stake to it. That allocation is its [unique stake](/glossary/unique-stake/) for that set.
3. Only that set's slasher can slash that allocation. A fault in one service does not touch the stake allocated to another.

Allocations are expressed as magnitudes, proportions of an operator's stake that start at 1e18 and shrink when it is slashed. An operator cannot allocate more than its remaining maximum.

## The delays that make a promise credible

A promise of slashable stake is worth little if the stake can leave the moment trouble starts. Three delays on Ethereum mainnet, as the contract documentation gives them, close that gap:

| Delay | Length | Why |
| --- | --- | --- |
| Allocation configuration | 126,000 blocks, 17.5 days | A new allocation delay or slasher change takes this long to apply |
| Deallocation | 100,800 blocks, 14 days | A deallocated or deregistered stake stays slashable this long |
| Withdrawal | 100,800 blocks, 14 days | A staker's queued withdrawal cannot complete sooner |

The slashing step runs inside that window. The release notes for core contracts v1.13.0, published on 25 June 2026, add a further wait: slashed shares cannot be burned or redistributed until 50,400 blocks, about seven days, after the slash was recorded.

## What a slash does

A service calls `slashOperator` with the operator, the set, the strategies and, for each strategy, a fraction between zero and one of the allocated magnitude. The contract then:

- reduces the operator's allocation, and its maximum and encumbered magnitude, in proportion;
- reduces any pending deallocation in proportion;
- lowers the operator's delegated shares.

A staker does not see a transaction. Their deposit shares are scaled by the operator's current slashing factor when they withdraw, so what they can take out shrinks. For native ETH the beacon chain's own slashing factor is applied as well.

Slashed shares are then either burned or, in a *redistributing* operator set, sent to a recipient chosen when the set was created. The AVS can slash any fraction, up to all, of what was allocated to it.

The line the documentation draws is important: whatever fault criteria a service chooses, the contract enforces only the mechanical conditions above. It does not check that a fault happened. That judgment lives in the service's contracts or governance, behind a single slasher address.

## Rewards and the risk they price

Rewards come from services and from EIGEN emissions, paid through a rewards coordinator. Release 1.12.0 added rewards weighted by unique stake or by total stake within an operator set, and "duration vaults", time-bound commitments that act as their own operator for one set.

A staker is paid for accepting conditions that are hard to inspect. The questions that matter are:

- Which sets has my operator registered for, and how much has it allocated to each?
- Who holds the slasher address for each set, and what can they do with it?
- Do sets redistribute slashed funds, and to whom?
- Does the strategy I deposited carry its own risk, such as a liquid staking token's depeg risk?

## Risks specific to restaking

- **Correlated exposure.** A staker already carries Ethereum validator risk and, with a liquid staking token, the issuer's risk. Restaking adds service risk on top of the same capital.
- **Service quality.** Slashing conditions are code and governance written by each service. A bug or an abusable slasher is a loss for stakers that Ethereum itself would not have caused.
- **Concentration.** If delegation gathers behind a few operators, one operator fault touches many stakers at once. Check the operator's share of delegated stake before assuming it is spread out.
- **Exit friction.** The 14-day windows protect services and cost stakers liquidity.

See [security assumptions](/concepts/security-assumptions) for the general list and [governance and upgrades](/concepts/governance-and-upgrades) for the role of upgradable core contracts. The [slashing guide](/guides/eigenlayer-slashing) follows how the rules changed over releases.
