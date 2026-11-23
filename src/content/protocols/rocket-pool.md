---
title: "Rocket Pool"
seoTitle: "How Rocket Pool works: rETH, megapools, RPL and the DAOs"
description: "How Rocket Pool pairs small node-operator bonds with pooled ETH, how rETH's rate grows, what Saturn 1 megapools and RPL revenue share changed, and who can pause or upgrade it."
summary: "Rocket Pool is a liquid staking protocol where node operators post a small bond, 4 ETH per validator after the Saturn 1 upgrade, and the rest of each 32 ETH comes from rETH depositors. rETH is a non-rebasing token whose rate rises as rewards accrue. Two DAOs and a security council hold the administrative powers."
status: "published"
published: "2026-11-23"
lastVerified: "2026-11-23"
faq:
  - question: "How does Rocket Pool let someone run a validator without 32 ETH?"
    answer: "A node operator posts a bond and the protocol adds ETH from its staking pool, which comes from rETH depositors, to make up 32 ETH. With the Saturn 1 megapools the docs give a bond of 4 ETH plus 28 ETH borrowed from the pool. On the Beacon Chain the validator looks like any other."
    featured: true
  - question: "Is rETH a rebasing token like stETH?"
    answer: "No. The docs describe rETH as a token whose value effectively rises relative to ETH, so the balance stays fixed and the exchange rate grows as Beacon Chain rewards, priority fees and MEV rewards accumulate. The rate is updated about every 24 hours. That is the same idea as wstETH, which also holds a fixed balance."
    featured: true
  - question: "What changed in the Saturn 1 upgrade?"
    answer: "Saturn 1 introduced megapools, one contract per node operator that serves many validators, and lowered the bond per validator from 8 ETH to 4 ETH. It made RPL an ETH revenue share token, added a universal adjustable revenue split, an express and standard deposit queue, guardrails on the Oracle DAO and protocol upgrade delays with a security council veto."
  - question: "Who can change how Rocket Pool works?"
    answer: "The Protocol DAO, run by RPL governance with on-chain proposals from node operators, sets protocol parameters and treasury spending. The Oracle DAO is an invite-only group of nodes that report Beacon Chain data and can vote on core changes. A security council can act without delay, and Saturn 1 added an upgrade delay and a veto power for it."
order: 15
category: "Liquid staking"
mechanism: "Pooled ETH is matched with node-operator bonds into 32 ETH validators, and rETH's exchange rate is updated from reported Beacon Chain balances."
versionContext: "The docs describe Saturn 1 and its megapools as the current design, with legacy minipools still existing and migration possible. Bond sizes, commission shares and queue rules are DAO parameters that change, and a Saturn 2 with lower bonds is described as planned."
tags:
  - liquid-staking
  - rETH
  - node-operators
concepts:
  - liquid-staking
  - governance-and-upgrades
  - security-assumptions
  - proxies
guides:
  - rocket-pool-minipools-and-megapools
glossary:
  - reth
  - megapool
  - minipool
  - rpl
  - node-operator
versions:
  - name: "Minipools"
    status: "deprecated"
    note: "One contract per validator, with 16 ETH, then 8 ETH bonds. The docs say legacy minipool deposits are disabled after Saturn 1 and that operators can migrate to megapools."
  - name: "Saturn 1 megapools"
    status: "active"
    note: "One contract per node operator for many validators, a 4 ETH bond, an RPL revenue share, a universal adjustable revenue split and a reworked deposit queue."
  - name: "Saturn 2"
    status: "proposed"
    note: "Planned bond curves of 4 ETH for the first two validators and 1.5 ETH after, described in RPIP-42. Not live as of the docs read."
sources:
  - title: "Rocket Pool staking overview"
    url: "https://docs.rocketpool.net/liquid-staking/overview"
    kind: "docs"
    publisher: "Rocket Pool"
  - title: "The Saturn 1 upgrade"
    url: "https://docs.rocketpool.net/upgrades/saturn-1/whats-new"
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
  - title: "RPL staking and claiming rewards"
    url: "https://docs.rocketpool.net/node-staking/megapools/staking-and-claiming-rewards"
    kind: "docs"
    publisher: "Rocket Pool"
  - title: "The Oracle DAO"
    url: "https://docs.rocketpool.net/odao/overview"
    kind: "docs"
    publisher: "Rocket Pool"
  - title: "The Protocol DAO"
    url: "https://docs.rocketpool.net/pdao/pdao"
    kind: "docs"
    publisher: "Rocket Pool"
---

[Lido](/protocols/lido) pools ETH and lets a governance-approved list of operators run the validators. Rocket Pool makes a different trade. Anyone can run a validator, and the protocol keeps them honest with a bond, a small amount of the operator's own ETH at risk, instead of with an approved list. That choice is the thread through this page: how the bond is sized, who is paid, how the token's price follows the validators, and who holds the controls.

The [versions guide](/guides/rocket-pool-minipools-and-megapools) maps the validator contract generations. This page describes the current design in the docs, called Saturn 1, and what it replaced. The general mechanics of pooled staking are on the [liquid staking page](/concepts/liquid-staking).

## Two kinds of participant

A **staker** deposits ETH into the protocol's deposit pool and receives rETH. The docs say a deposit can be as small as 0.01 ETH. A **node operator** runs the validator software and supplies the bond. The staker's ETH is what the docs call borrowed ETH, and it is matched with the operator's bonded ETH to reach the 32 ETH an Ethereum validator needs. In Saturn 1 the numbers are a 4 ETH bond and 28 ETH borrowed. To the Beacon Chain such a validator is the same as any other: same duties, same rewards, same penalties. The difference is how its withdrawal address works on the execution layer.

The consequence is that the loss structure is different from a plain pool. If a validator is penalized or slashed, the loss comes from the validator's balance, and the bond sits in front of the stakers' ETH only up to its size. A 4 ETH bond covers a smaller loss than a 16 ETH one did, and the docs frame the lower bond as a capital-efficiency gain for node operators. Whether the bond is enough in a severe slashing is a question the protocol's parameters and the Beacon Chain's penalty rules answer together, and the page does not state a bound.

<diagram-placeholder name="rocket-pool-flow"></diagram-placeholder>

## rETH

The docs describe rETH as representing both how much ETH you deposited and when you deposited it. Its value is set by a ratio of total ETH backing, including Beacon Chain rewards, priority fees and MEV rewards, to the rETH supply, and the docs say it effectively always rises relative to ETH. The rate is updated about every 24 hours. The page's worked example: if 128 ETH is staked and the validator balances sum to 160 ETH, one rETH is worth 1.25 ETH.

This is not a rebase. A holder's balance does not change, and the price does. For integrators it is the same pattern as [wstETH](/glossary/wsteth/): hold a fixed number of tokens and read an exchange rate. The difference from Lido is where the rate comes from. Lido's share rate moves when its accounting oracle report lands. Rocket Pool's rate is set from reports that the Oracle DAO submits, which is why the docs put so much attention on that DAO below.

Redeeming rETH for ETH with the protocol works only when the staking pool has enough ETH. That ETH comes from deposits not yet used to create validators and from ETH returned by exiting operators. Otherwise a holder sells on a market, possibly at a premium or discount to the rate. Saturn 1 changed the flow to make this less likely: a proportion of new rETH mints goes into the rETH contract as a withdrawal buffer, and ETH above a buffer of 1 percent of rETH TVL flows into the deposit pool.

## Megapools

Before Saturn 1 each validator had its own **minipool** contract. A **megapool** is one contract per node operator that serves as the withdrawal address for many validators. The docs say the ongoing and upfront gas cost of managing many validators is much lower with a single contract, and that megapool creation is automatic at the operator's first validator deposit. Legacy minipool deposits are disabled and operators can migrate.

Megapools are also what allowed the lower bond. The docs give the arithmetic: the commission rate stays at 5 percent, the matched ETH goes from 24 to 28 per validator, and commission per ETH bonded rises from 15 to 35 percent, about 2.3 times. A planned Saturn 2 would go further, with bonds of 4 ETH for each operator's first two validators and 1.5 ETH after, described in RPIP-42. That is not live.

Creation has a cost the docs flag: a megapool validator has to clear the Beacon Chain queue twice. First a 1 ETH prestake goes in when ETH is assigned, and then the rest follows. The deposit queue itself is split into a standard queue and an express queue. The express queue is faster and needs a ticket for each validator, and existing operators receive one ticket per 4 ETH bonded in legacy minipools, so an operator with an 8 ETH minipool gets two.

## Who gets paid

Saturn 1 rewrote the revenue split. The docs describe a **Universal Adjustable Revenue Split** that divides the protocol's ETH revenue from node commissions among four groups, each adjustable by pDAO vote:

| Share | Default | Goes to |
| --- | --- | --- |
| Base commission | 5 percent | Node operators |
| Voter share | 9 percent | Node operators in proportion to RPL staked on their megapool |
| pDAO share | 0 percent | The protocol treasury |
| Remainder | The rest | rETH holders |

So RPL stopped being only a collateral token. In Saturn 1 the docs call it an ETH-accrual revenue share token: an operator who stakes RPL on a megapool earns ETH in proportion. RPL inflation rewards continue alongside it, in 28-day reward periods, and staked RPL also carries voting power. The docs add that the earlier requirement of 10 percent RPL collateral was removed in Saturn 0, deployed on 28 October 2024, so all staked RPL became eligible for rewards.

The design implication is that rETH holders are the residual. The split is adjustable, and the docs say the point is competitiveness as market conditions shift. A pDAO vote can shift revenue toward operators or the treasury, and the rETH holder's yield is what remains.

## The three powers

Rocket Pool puts its administrative powers in three bodies, and Saturn 1 reduced how much one of them has to be trusted.

**The Protocol DAO (pDAO)** is run by RPL governance. Any registered node can raise an on-chain proposal if it has enough staked RPL to cover a proposal bond, and nodes with voting power vote. Since the Houston upgrade the execution is on chain, using an optimistic fraud-proof system, to adjust protocol parameters and spend treasury funds. The docs say RPL has a 5 percent inflation rate and 47.5 percent of it goes to the pDAO, set by RPIP-81.

**The Oracle DAO (oDAO)** is an invite-only group of special nodes. The docs say it handles duties that smart contracts cannot do: moving Beacon Chain information such as validator status and balances to the execution layer, checking that validator keys are not already in use and have the right withdrawal credentials, building the rewards tree each period, monitoring fee recipient compliance, and voting on core protocol changes and its own roster. It is paid a small share of RPL inflation. Because rETH's rate depends on the balances it reports, this is the group whose honesty the token's price rests on.

**The security council** can propose and execute changes without delay. The docs say the pDAO elects and can remove its members.

Saturn 1 added **guardrails** that bound these powers: a limit on how many MEV penalties the oDAO can apply per week, a limit on how often the oDAO can change the rETH exchange rate, and a delay between when a protocol upgrade passes and when it executes. That delay gives holders time to exit and gives the security council a veto over an upgrade. These are design statements in the docs. How they are set on a given day is a pDAO parameter.

## Failure modes worth naming

- **Oracle DAO reporting.** A wrong balance report becomes a wrong rETH rate, the same dependency as [Lido's accounting oracle](/protocols/lido), with a smaller reporting group.
- **Bond adequacy.** A smaller bond means less operator capital in front of a loss. Slashing and inactivity penalties come from the Ethereum protocol, not from Rocket Pool's rules.
- **Exit liquidity.** Redemption with the protocol depends on pool ETH. Otherwise rETH trades on markets, and a depeg is a market event.
- **Governance parameters.** The revenue split, bonds and queues are adjustable by a pDAO vote weighted by node operators' RPL voting power.
- **Upgradeable contracts.** Saturn 1 introduced forced delegate upgrades for megapools, which the docs present as a way for the protocol to iterate without backward compatibility. It is also an upgrade path that operators cannot decline.

The docs list audits for Saturn 1 by Cantina, Bailsec and Sigma Prime, and a bug bounty of up to $150,000 for critical vulnerabilities. Those are the operator's statements, and an audit does not remove the assumptions above.
