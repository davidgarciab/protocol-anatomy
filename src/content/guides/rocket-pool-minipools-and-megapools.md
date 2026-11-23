---
title: "Rocket Pool minipools, megapools and Saturn"
seoTitle: "Rocket Pool minipools vs megapools: bonds, queues, migration"
description: "How Rocket Pool's minipools, Saturn 0 and Saturn 1 megapools differ in bond size, contract structure, deposit queues and RPL role, and what to check on a validator."
summary: "Rocket Pool's validators have changed form twice. Minipools used one contract per validator and 16 then 8 ETH bonds. Saturn 0 made RPL collateral optional. Saturn 1 introduced megapools, 4 ETH bonds, an RPL revenue share and a new queue. Which generation a validator belongs to decides its bond, its rewards and its exit path."
status: "published"
published: "2026-11-23"
lastVerified: "2026-11-23"
faq:
  - question: "What is the difference between a minipool and a megapool?"
    answer: "A minipool is one contract per validator, and each is the validator's withdrawal address. A megapool is one contract per node operator that serves as the withdrawal address for many validators. The docs say a single contract makes the ongoing and upfront gas cost of managing validators significantly lower, which is what allowed the smaller bond."
    featured: true
  - question: "Can a node operator still create minipools?"
    answer: "No, according to the Saturn 1 documentation, which says legacy minipool deposits are disabled and that operators can migrate their minipool validators to a megapool. Existing minipools keep running until they exit or migrate. The migration guide covers exiting minipools, creating megapool validators, unstaking legacy RPL and restaking it."
  - question: "What did Saturn 0 change?"
    answer: "Saturn 0, deployed on 28 October 2024 by changing parameters through the on-chain pDAO, enabled ETH-only minipools by removing the 10 percent RPL collateral requirement, so all staked RPL became eligible for RPL rewards. It was the precursor to Saturn 1, which changed the contracts themselves."
order: 15
protocol: "rocket-pool"
versionContext: "Saturn 1 is described as the current upgrade, with Saturn 2 planned. Bond sizes, queue ticket rules and revenue shares are parameters that DAO votes can change."
tags:
  - rocket-pool
  - versions
  - megapools
concepts:
  - liquid-staking
  - governance-and-upgrades
glossary:
  - megapool
  - minipool
  - rpl
  - reth
relatedGuides: []
versions:
  - name: "Minipools, 16 ETH and 8 ETH bonds"
    status: "deprecated"
    note: "One contract per validator. The docs describe a 16 ETH bond at first and an 8 ETH option later. Deposits are disabled after Saturn 1."
  - name: "Saturn 0"
    status: "released"
    note: "Deployed on 28 October 2024. Enabled ETH-only minipools and made all staked RPL eligible for RPL rewards by parameter changes."
  - name: "Saturn 1 megapools"
    status: "active"
    note: "A contract per operator, a 4 ETH bond, an RPL revenue share, forced delegate upgrades, an express and standard queue and DAO guardrails."
  - name: "Saturn 2"
    status: "proposed"
    note: "Planned bond curve of 4 ETH for the first two validators and 1.5 ETH after, per RPIP-42."
sources:
  - title: "The Saturn 1 upgrade"
    url: "https://docs.rocketpool.net/upgrades/saturn-1/whats-new"
    kind: "docs"
    publisher: "Rocket Pool"
  - title: "The Saturn 0 upgrade"
    url: "https://docs.rocketpool.net/upgrades/saturn-0/whats-new"
    kind: "docs"
    publisher: "Rocket Pool"
  - title: "Megapools overview"
    url: "https://docs.rocketpool.net/node-staking/megapools/overview"
    kind: "docs"
    publisher: "Rocket Pool"
  - title: "Creating a megapool validator"
    url: "https://docs.rocketpool.net/node-staking/megapools/create-megapool-validator"
    kind: "docs"
    publisher: "Rocket Pool"
  - title: "Exiting a megapool validator"
    url: "https://docs.rocketpool.net/node-staking/megapools/exit-megapool-validator"
    kind: "docs"
    publisher: "Rocket Pool"
  - title: "8-ETH bonded minipools"
    url: "https://docs.rocketpool.net/upgrades/atlas/lebs"
    kind: "docs"
    publisher: "Rocket Pool"
  - title: "Minipools overview"
    url: "https://docs.rocketpool.net/node-staking/minipools/overview"
    kind: "docs"
    publisher: "Rocket Pool"
---

A Rocket Pool validator is not one thing. The contract that owns it, the bond behind it and the rewards it earns depend on the generation it was created in. The [protocol page](/protocols/rocket-pool) explains the current design. This guide maps the generations.

## The map

| | Minipool | Saturn 1 megapool |
| --- | --- | --- |
| Contract | One per validator | One per node operator, for many validators |
| Bond per validator | 16 ETH at launch, 8 ETH later | 4 ETH |
| Protocol ETH matched | 24 ETH with an 8 ETH bond | 28 ETH |
| Commission per ETH bonded | 15 percent at 5 percent commission | 35 percent at 5 percent commission |
| RPL's role | Collateral earning RPL inflation, with the 10 percent requirement removed in Saturn 0 | An ETH revenue share on top of RPL inflation |
| Upgrade path | Operators choose whether to upgrade a delegate | Forced delegate upgrades |
| Status | Deposits disabled | Current |

The bond and commission figures come from the Saturn 1 page, which tabulates 8 ETH minipools against 4 ETH megapools.

## Minipools

At launch the docs say Rocket Pool supported two minipool types: a 16 ETH bond, and a temporary 32 ETH bond that was later removed by a community vote. The 16 ETH bond was the lowest because, per the docs, an operator who attacked Ethereum and lost the whole bond would lose as much as the rETH stakers and not come out ahead. An 8 ETH bond came later after community research found that reasoning conservative. Whatever the bond, each validator was owned by its own minipool contract, which also served as the withdrawal address and received skimmed rewards. A **delegate** contract held the logic, and operators could choose to upgrade to a new delegate or stay on an old one. The docs say that made future upgrades hard to design.

Minipools are legacy in the sense that the docs say deposits are disabled. The validators already running behave as they did, and the migration guide describes how to exit minipools, create megapool validators and move RPL.

## Saturn 0

Saturn 0 was deployed on 28 October 2024 and changed parameters, not contracts. Using the on-chain pDAO, it enabled ETH-only minipools and removed the 10 percent collateral requirement, so that all staked RPL became eligible for RPL rewards. It is a useful example of what a DAO parameter change can do to an existing protocol: the economics changed without any new contract.

## Saturn 1

Saturn 1 is described as the most significant upgrade in the protocol's history. For node operators the headline is the megapool and the 4 ETH bond. Five other changes matter for how a validator behaves.

1. **Forced delegate upgrades.** Megapool contracts are upgraded by the protocol, which lets it iterate without backward compatibility but removes an operator's option to stay behind.
2. **A revenue share for RPL stakers.** Staking RPL on a megapool earns a proportional share of protocol ETH revenue.
3. **A reworked queue.** There is a standard queue and an express queue, and express deposits need a ticket for each validator. Existing operators get one ticket per 4 ETH bonded in legacy minipools.
4. **Dequeuing for rETH.** In a long deposit queue, operators can dequeue a deposit in exchange for rETH.
5. **Guardrails.** Limits on the Oracle DAO's MEV penalties and rETH rate changes, and an upgrade delay with a security council veto.

The docs also describe a creation cost: a megapool validator must clear the Beacon Chain queue twice, first for a 1 ETH prestake and then for the remainder.

## What to check on a validator

1. Is it a minipool or a megapool? That sets the bond and the reward model.
2. If it is a megapool, how much RPL is staked on it, and does the operator know which RPL, legacy or megapool, earns the revenue share?
3. For a staker, how deep is the rETH withdrawal buffer, and what does the market say about the rate? The [protocol page](/protocols/rocket-pool) covers redemption.
4. Which parameters has the pDAO changed recently? The revenue split, bond and queue rules are all pDAO parameters.

The [liquid staking concept page](/concepts/liquid-staking) compares the pooled designs, and the [Lido exits guide](/guides/lido-exits) shows the withdrawal side of the other main one.
