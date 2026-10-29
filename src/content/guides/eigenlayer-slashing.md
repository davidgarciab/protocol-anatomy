---
title: "EigenLayer slashing: from opt-in to operator sets"
seoTitle: "EigenLayer slashing upgrades: timeline and delays"
description: "How EigenLayer's slashing rules changed, from whole-stake opt-in to unique stake, the 2026 slasher and resolution changes, and the delays a staker faces."
summary: "EigenLayer's early design exposed an operator's whole stake to every service it joined. Slashing launched in April 2025 with operator sets and unique stake. Later core releases moved the slasher into the AllocationManager, added operator-set rewards and a seven-day wait before slashed shares are cleared."
status: "published"
published: "2026-10-29"
lastVerified: "2026-10-29"
faq:
  - question: "When did EigenLayer slashing go live?"
    answer: "On Ethereum mainnet on 17 April 2025, according to Eigen Labs' announcement. The testnet came earlier, and the launch post listed redistribution of slashed funds as a feature that was not yet live."
    featured: true
  - question: "What changed in EigenLayer release 1.9.0?"
    answer: "The slashing UX release split the AllocationManager into a state-changing contract and a view contract, added a ProtocolRegistry for proxy addresses and global pause, and moved the slasher into the AllocationManager as a single address per operator set. Changing that address takes the 17.5-day configuration delay."
  - question: "What is the slash resolution delay?"
    answer: "A wait of 50,400 blocks, about seven days, introduced in release 1.13.0 between when a slash is recorded and when its burnable or redistributable shares can be cleared. It also added a dedicated pause flag for the burn and redistribution flow."
order: 7
protocol: "eigenlayer"
versionContext: "Release dates below are the dates the core contracts repository published each version. They are not necessarily the dates a version was activated on mainnet."
tags:
  - eigenlayer
  - slashing
  - versions
concepts:
  - restaking-and-slashing
  - governance-and-upgrades
  - proxies
glossary:
  - restaking
  - avs
  - operator-set
  - unique-stake
  - slashing
relatedGuides: []
versions:
  - name: "Opt-in restaking"
    status: "historical"
    note: "Operators chose services, and their entire delegated stake could in principle be slashed by any of them. Slashing was not live."
  - name: "Unique stake and operator sets"
    status: "active"
    note: "Slashing live on mainnet from 17 April 2025. Operators allocate a proportion of stake to each set and only that set's slasher can slash it."
  - name: "Slashing UX release (1.9.0)"
    status: "active"
    note: "Published as a release candidate in December 2025 and as 1.9.0 on 16 January 2026. Slasher moved into the AllocationManager."
  - name: "Rewards 2.2, duration vaults, Incentive Council (1.12.0)"
    status: "active"
    note: "Published 24 March 2026. Adds operator-set rewards, time-bound vaults and an emissions controller."
  - name: "Slash resolution delay (1.13.0)"
    status: "active"
    note: "Published 25 June 2026. Seven-day wait before slashed shares can be cleared."
sources:
  - title: "Slashing goes live on mainnet"
    url: "https://www.eigenlabs.org/blog/slashing-goes-live/"
    kind: "docs"
    publisher: "Eigen Labs"
  - title: "ELIP-002: Slashing via Unique Stake and Operator Sets"
    url: "https://github.com/eigenfoundation/ELIPs/blob/main/ELIPs/ELIP-002.md"
    kind: "governance"
    publisher: "Eigen Foundation"
  - title: "Core contracts v1.9.0 release notes"
    url: "https://github.com/Layr-Labs/eigenlayer-contracts/releases/tag/v1.9.0"
    kind: "docs"
    publisher: "Eigen Labs"
  - title: "Core contracts v1.12.0 release notes"
    url: "https://github.com/Layr-Labs/eigenlayer-contracts/releases/tag/v1.12.0"
    kind: "docs"
    publisher: "Eigen Labs"
  - title: "Core contracts v1.13.0 release notes"
    url: "https://github.com/Layr-Labs/eigenlayer-contracts/releases/tag/v1.13.0"
    kind: "docs"
    publisher: "Eigen Labs"
  - title: "AllocationManager"
    url: "https://github.com/Layr-Labs/eigenlayer-contracts/blob/main/docs/core/AllocationManager.md"
    kind: "docs"
    publisher: "Eigen Labs"
  - title: "StrategyManager"
    url: "https://github.com/Layr-Labs/eigenlayer-contracts/blob/main/docs/core/StrategyManager.md"
    kind: "docs"
    publisher: "Eigen Labs"
---

A restaking position is a bundle of promises, and the terms of those promises have changed more than once. A staker reading old articles may be describing a version of EigenLayer that no longer exists. This guide lines up the versions.

The [protocol page](/protocols/eigenlayer) explains the mechanism as it works now. The [concept page](/concepts/restaking-and-slashing) explains the trade-offs.

## Before slashing

The first model let an operator opt into several services with its whole delegated stake exposed to any of them. ELIP-002, the proposal that introduced the current model, lists the problems: operators had little control over slashing risk, and a service had no assurance that the stake it counted on was not also pledged elsewhere.

Until slashing launched, nothing could be taken. The risk was in the design, not yet in the outcomes, which is why the early period understates what a staker would face today.

## April 2025: unique stake and operator sets

Eigen Labs announced on 17 April 2025 that slashing was live on mainnet. The release introduced two primitives:

- **Operator sets**, groups of operators created by one AVS, with strategies whose stake counts.
- **Unique stake allocation**, which lets an operator earmark a proportion of its stake for exactly one set. Only the service that created the set can slash it.

The announcement was explicit about what was not yet live: redistribution, meaning slashed funds going to a recipient instead of being burned, was listed among features still to come. It also said that slashing affects a staker only if the operator opts into a slashable set.

## Release 1.9.0: slashing UX

The core contracts repository published a release candidate on 10 December 2025 and version 1.9.0 on 16 January 2026. According to its notes it upgraded every core contract. The changes that matter to a reader:

- The AllocationManager was split into a contract for state changes and one for read-only calls, to stay under the contract size limit. Calls to the old read functions still work through a delegated call.
- A **ProtocolRegistry** stores every proxy address and the global version, and can pause the entire protocol.
- The **slasher** became a single address per operator set, stored in the AllocationManager, replacing a permission held in the PermissionController. Sets created earlier were migrated. If no slasher was set, or it was the zero address, the AVS address became the slasher. If several were set, the first became the slasher.
- Creating a set now takes a slasher address. The older creation functions were announced for deprecation in the second quarter of 2026.

For a staker the effect is clarity: for any operator set there is exactly one address whose call can slash, and it can be read from the contract.

## Release 1.12.0: rewards, duration vaults, emissions

Published 24 March 2026, the release combined three tracks. Rewards 2.2 added submissions weighted by unique stake or by total stake within an operator set, with durations of up to two years. Duration vaults added a `DurationVaultStrategy`, a time-bound commitment that acts as its own operator in one set, accepts deposits in an open window, locks them, and allows withdrawal at maturity or on an arbitrator-triggered early exit. An EmissionsController replaced the earlier programmatic incentive flow for EIGEN emissions.

## Release 1.13.0: slash resolution delay

Published 25 June 2026. Slashed shares are marked burnable or redistributable, and anyone can clear them. This release adds a mandatory wait, `SLASH_RESOLUTION_DELAY_BLOCKS = 50_400`, about seven days at 12-second blocks, between recording the slash and clearing it. It adds a pause flag for the clearing and burning functions, separate from the pause on deposits. Tooling that clears slashed shares has to wait out the delay.

The reason for such a delay is not stated in the release notes beyond hardening the pipeline. Read it as time for the slashing step to be inspected and, if needed, paused before irreversible burning or transfer.

## The delays a staker faces today

| Event | Delay on mainnet | Source |
| --- | --- | --- |
| Queued withdrawal completes | 100,800 blocks, 14 days | DelegationManager |
| Operator deallocation takes effect | 100,800 blocks, 14 days | AllocationManager |
| Allocation delay or slasher change | 126,000 blocks, 17.5 days | AllocationManager |
| Slashed shares can be cleared | 50,400 blocks, about 7 days | Release 1.13.0 |

A staker who wants out cannot avoid exposure for the whole 14 days, and a slash recorded in that window still scales what they can withdraw.

## A checklist when reading about an operator

1. Which operator sets has it registered for, and how much magnitude has it allocated to each?
2. What is each set's slasher address, and is it a contract with published rules or a key?
3. Is the set redistributing, and where do the funds go?
4. Which version of the core contracts is deployed, and when was it last upgraded?
5. Is the strategy a native ETH pod, or a token that carries its own risk?

Each answer can be read on chain through the AllocationManager's view functions. A dashboard that summarizes them is convenient and is also one more thing to trust.
