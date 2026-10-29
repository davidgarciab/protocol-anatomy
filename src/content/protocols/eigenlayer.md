---
title: "EigenLayer"
seoTitle: "How EigenLayer works: restaking, operators, slashing"
description: "How EigenLayer lets staked ETH and tokens back other services, how delegation, operator sets and unique stake work, and what slashing does to a staker."
summary: "EigenLayer is a set of contracts for restaking. Stakers deposit ETH through an EigenPod or tokens through a strategy, delegate to an operator, and the operator allocates slices of that stake to operator sets that services define. A service can slash only the stake allocated to its own set."
status: "published"
published: "2026-10-29"
lastVerified: "2026-10-29"
faq:
  - question: "How does EigenLayer slashing work?"
    answer: "A service calls the AllocationManager with an operator, an operator set, the strategies and a fraction to slash of each allocation. The contract reduces the operator's allocation and maximum magnitude, lowers its delegated shares, and marks the slashed shares as burnable or redistributable. Stakers see the effect as a smaller amount withdrawable. Slashing went live on Ethereum mainnet on 17 April 2025."
    featured: true
  - question: "How long does it take to withdraw from EigenLayer?"
    answer: "A queued withdrawal cannot complete before 100,800 blocks, about 14 days on Ethereum mainnet, as the DelegationManager documents. An operator's deallocation also takes 14 days to apply, and during that time the stake stays slashable."
    featured: true
  - question: "What is an EigenPod?"
    answer: "A contract a staker deploys through the EigenPodManager and points validators at, so beacon chain stake can be delegated to an operator. It can serve as the validator's withdrawal credentials or as its fee recipient, and it proves balances to EigenLayer through checkpoints."
  - question: "What is an AVS on EigenLayer?"
    answer: "An actively validated service, an external network that rents stake. It creates operator sets, decides what operators must do and what they earn, and sets one slasher address per set. The core contracts do not check whether a fault occurred, only that a slash is a valid fraction of an operator's allocation."
  - question: "Is EigenLayer the same as EigenCloud?"
    answer: "No. EigenLayer is the restaking protocol and its contracts. EigenCloud is the name Eigen Labs gave in 2025 to a broader developer platform that sits on EigenLayer, together with services such as EigenDA, EigenCompute and EigenAI."
order: 7
category: "Restaking"
mechanism: "Delegated, slashable stake allocated to operator sets that external services define, with delayed allocation and withdrawal."
versionContext: "The slashing model with operator sets and unique stake has been live since April 2025. Core contracts are upgradable and have been revised several times since, most recently with a slash resolution delay in release 1.13.0."
tags:
  - restaking
  - eigenlayer
  - slashing
concepts:
  - restaking-and-slashing
  - liquid-staking
  - governance-and-upgrades
  - proxies
  - security-assumptions
guides:
  - eigenlayer-slashing
glossary:
  - restaking
  - avs
  - operator-set
  - unique-stake
  - slashing
  - steth
versions:
  - name: "Original restaking"
    status: "historical"
    note: "Operators opted into services with their whole delegated stake exposed. No slashing was live."
  - name: "Slashing with unique stake and operator sets"
    status: "active"
    note: "Live on mainnet since 17 April 2025 per Eigen Labs. Specified in ELIP-002."
  - name: "Redistributing operator sets"
    status: "active"
    note: "Sets that send slashed funds to a recipient instead of burning them. The April 2025 launch post listed redistribution as not yet live, and the current AllocationManager supports it."
  - name: "Rewards 2.2 and duration vaults"
    status: "active"
    note: "Release 1.12.0 added operator-set rewards, time-bound vault strategies and the emissions controller."
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
  - title: "StrategyManager"
    url: "https://github.com/Layr-Labs/eigenlayer-contracts/blob/main/docs/core/StrategyManager.md"
    kind: "docs"
    publisher: "Eigen Labs"
  - title: "EigenPod"
    url: "https://github.com/Layr-Labs/eigenlayer-contracts/blob/main/docs/core/EigenPod.md"
    kind: "docs"
    publisher: "Eigen Labs"
  - title: "EigenPodManager"
    url: "https://github.com/Layr-Labs/eigenlayer-contracts/blob/main/docs/core/EigenPodManager.md"
    kind: "docs"
    publisher: "Eigen Labs"
  - title: "Shares accounting after the slashing upgrade"
    url: "https://github.com/Layr-Labs/eigenlayer-contracts/blob/main/docs/core/accounting/SharesAccounting.md"
    kind: "docs"
    publisher: "Eigen Labs"
  - title: "AllocationManager.sol"
    url: "https://github.com/Layr-Labs/eigenlayer-contracts/blob/main/src/contracts/core/AllocationManager.sol"
    kind: "code"
    publisher: "Eigen Labs"
  - title: "Core contracts v1.13.0 release notes"
    url: "https://github.com/Layr-Labs/eigenlayer-contracts/releases/tag/v1.13.0"
    kind: "docs"
    publisher: "Eigen Labs"
  - title: "Core contracts v1.12.0 release notes"
    url: "https://github.com/Layr-Labs/eigenlayer-contracts/releases/tag/v1.12.0"
    kind: "docs"
    publisher: "Eigen Labs"
  - title: "Core contracts v1.9.0 release notes"
    url: "https://github.com/Layr-Labs/eigenlayer-contracts/releases/tag/v1.9.0"
    kind: "docs"
    publisher: "Eigen Labs"
  - title: "Introducing EigenCloud"
    url: "https://www.eigenlabs.org/blog/introducing-eigencloud/"
    kind: "docs"
    publisher: "Eigen Labs"
---

EigenLayer does not issue a stablecoin, price a trade or lend. It records who has promised which stake to which service, and it executes the penalty if the service calls for one. Everything else is a consequence of that ledger.

The [restaking concept page](/concepts/restaking-and-slashing) explains the idea and the risks in general terms. This page follows the contracts: how stake enters, how it is delegated, how it is allocated, how it is slashed and how it leaves. The [slashing guide](/guides/eigenlayer-slashing) covers how the rules changed over time.

## Two ways in

**Native restaking through an EigenPod.** A staker deploys an EigenPod through the EigenPodManager and sets it as the withdrawal credentials of one or more beacon chain validators. It can also be the validators' fee recipient. The contracts support validators with 0x01 and 0x02 credentials, including balances of 2,048 ETH and more. The pod proves validator state to EigenLayer, and shares in a virtual "beacon chain ETH strategy" are credited as the proofs complete. Balances are reconciled through **checkpoints**: one checkpoint is active at a time, completed by one beacon chain proof for each validator in the pod's active set.

**Token restaking through a strategy.** A staker deposits an ERC-20 into a strategy contract through the StrategyManager and receives deposit shares. Any ERC-20 can have a strategy deployed through the StrategyFactory, one per token. Older strategies for certain liquid staking tokens predate that factory and carry deposit limits. EIGEN and bEIGEN use a dedicated strategy.

Deposit shares are the staker's claim. They are what gets delegated and what a slash scales.

## Delegation

A staker delegates all their deposit shares to one operator through the DelegationManager. An operator registers with an optional *delegation approver* that must sign off on each new staker, and an allocation delay. The operator's delegated shares are the sum of its stakers'.

Delegation is not a transfer. The tokens remain in strategy contracts or in the staker's pod. What changes is who can put the stake behind a service. Once delegated, the docs state that all the staker's funds are immediately slashable if the operator has allocated slashable stake for that strategy to an operator set.

Undelegating sets the staker's operator to zero and queues a withdrawal for each strategy in which they hold shares. A queued withdrawal can complete after `MIN_WITHDRAWAL_DELAY_BLOCKS`, 100,800 blocks, about 14 days on mainnet. A completed withdrawal can return the assets or re-deposit them.

## Operator sets and unique stake

An AVS creates operator sets in the AllocationManager. A set has an id unique within its AVS, a list of strategies it counts, and a slasher. Since the 1.9.0 release the slasher is a single address stored in the AllocationManager, and changing it is subject to the 17.5-day configuration delay.

An operator registers for a set, then allocates **magnitude** from a strategy to it. Magnitude is a proportion of the operator's stake in that strategy, written with 1e18 meaning all of it. Each operator has a maximum magnitude per strategy, starting at 1e18 and reduced by slashing, and an encumbered magnitude, the sum of its allocations. It cannot allocate beyond the maximum.

Timing is asymmetric, and deliberately so:

- An **allocation** counts after the operator's allocation delay.
- A **deallocation** takes 100,800 blocks, 14 days, and stays slashable until then.
- **Deregistering** from a set also leaves the operator slashable for the deallocation delay, so it cannot misbehave and leave in one step.

The result is that an AVS can rely on stake it was promised for at least two weeks after the operator says it wants out.

<diagram-placeholder name="restaking-flow"></diagram-placeholder>

## What a slash does, with numbers

The slasher calls `slashOperator` with the operator, the set id, a list of strategies in ascending address order and, for each, a fraction `wadsToSlash` greater than zero and at most 1e18. The contract computes the slashed magnitude as the operator's current allocation to that set times that fraction, rounded up, and subtracts it from three places: the allocation, the strategy's maximum magnitude and its encumbered magnitude. A pending deallocation is cut by the same fraction. Then the DelegationManager lowers the operator's shares.

A worked case with round numbers. An operator has delegated stake of 1,000 in one strategy. It allocates 0.4 of its magnitude to a set. The set's slasher slashes 25 percent of that allocation. Slashed magnitude is 0.4 × 0.25 = 0.1. The operator's maximum magnitude falls from 1.0 to 0.9, so every staker delegated to it now has a slashing factor of 0.9. A staker with 100 deposit shares can withdraw 90. The operator's own stake and every other delegator lose the same 10 percent, even if only one set was at fault.

Two things follow that the shorthand "unique stake" can hide. The maximum falls for the whole strategy, so later allocations to other sets are drawn from a smaller base. And the loss is shared pro rata among delegators, not charged to the staker who chose the operator for the faulty service.

For native ETH there is a second factor. Inactivity and beacon chain slashing do not reduce deposit shares. They lower a *beacon chain slashing factor* that multiplies with the operator's. A deposit scaling factor, updated on each deposit, keeps a new deposit from being scaled by slashes that happened before it.

Slashed shares are marked burnable or redistributable. Burned shares are converted to tokens and sent to a dead address. A redistributing set, created with its recipients fixed at creation, sends them there. Anyone can call the clearing functions once the delay passes. Release 1.13.0 added a mandatory slash resolution delay of 50,400 blocks, about seven days, before slashed shares can be cleared, and a separate pause flag for burning and redistribution.

## What the core contracts check, and what they do not

The AllocationManager enforces that the operator is registered, that stake is allocated to the set, that the strategies are in the set and that the fraction is valid. It does not know what the AVS's rule is. Whether a fault happened is decided in the AVS's own contracts or governance, behind the slasher address. A staker who delegates is therefore trusting each set the operator joins, not only the operator.

## Rewards and the wider platform

Rewards are submitted by services to the RewardsCoordinator. Release 1.12.0 added submissions weighted by unique stake or total stake within an operator set, durations up to two years, a time-bound `DurationVaultStrategy` that acts as its own operator for one set, and an EmissionsController for programmatic EIGEN emissions.

In 2025 Eigen Labs introduced **EigenCloud**, a developer platform built on EigenLayer with EigenDA for data availability and further services such as EigenCompute and EigenAI. These are products that use the staking layer. They are not part of the core contracts described above.

## Governance and upgrades

The core contracts are upgradable, and a ProtocolRegistry, added in 1.9.0, stores their proxy addresses and can pause the protocol. Each release in the repository lists breaking changes to function signatures and ABIs. A staker's position is therefore subject to rules that can change through upgrades, which is the general risk described in [governance and upgrades](/concepts/governance-and-upgrades) and [proxies](/concepts/proxies).

## Trust that remains

The beacon chain's own validator and slashing risks still apply to native restaking. A liquid staking token strategy adds that token's risk, covered for [Lido](/protocols/lido) in its own page. Operators can fail or be compromised. Each AVS writes its own slashing code. The contracts themselves are upgradable and have been revised repeatedly since slashing launched. The 14-day delays protect services at the cost of staker liquidity, and the returns on offer are payment for exactly these risks.
