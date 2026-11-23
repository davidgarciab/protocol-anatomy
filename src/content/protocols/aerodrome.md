---
title: "Aerodrome and Velodrome"
seoTitle: "How Aerodrome and Velodrome work: veAERO and emissions"
description: "How Aerodrome's vote-escrowed token directs weekly emissions to pools, who earns fees and bribes, how stable and volatile pools price trades, and the Aero merger."
summary: "Aerodrome, with its sibling Velodrome, is a decentralized exchange on Base that pays its liquidity providers in a token whose emissions are steered by vote-locked holders. Voters earn the fees and bribes of the pools they choose. The protocol is announced to merge with Velodrome into a single Aero exchange, and the post-merger documentation could not be read for this page."
status: "published"
published: "2026-11-23"
lastVerified: "2026-11-23"
faq:
  - question: "How does Aerodrome decide which pools get AERO emissions?"
    answer: "Holders who lock AERO receive veAERO and vote each epoch on how emissions are split. Each epoch, emissions go to liquidity pools in proportion to the veAERO votes they receive, and only liquidity staked in the protocol's gauges earns them. An epoch is seven days starting Thursday at 00:00 UTC, and votes are due an hour before the next one."
    featured: true
  - question: "What do veAERO voters earn?"
    answer: "The docs say voters receive 100 percent of the trading fees collected from the pool they voted for, plus any incentives that other protocols deposit for voters on that pool, in proportion to their voting power. Voters also receive a rebase that offsets the dilution of their locked share as new emissions are minted."
    featured: true
  - question: "Are Aerodrome and Velodrome still separate?"
    answer: "Dromos Labs announced on 12 November 2025 that they would merge into one Aero exchange with a single AERO token, split 94.5 percent to Aerodrome holders and 5.5 percent to Velodrome holders, and later coverage reports it launched across several networks in October 2026. The official post-merger documentation was not readable for this page, so confirm the current state."
  - question: "What is the difference between stable and volatile pools?"
    answer: "A stable pool prices with the invariant x cubed times y plus y cubed times x, which keeps slippage low between tokens that trade near each other, such as stablecoins. A volatile pool uses the constant product formula x times y. The router compares both pool types and uses 30-minute time-weighted average prices as a protection against flash loan attacks."
order: 17
category: "Exchange"
mechanism: "A decentralized exchange whose token emissions are directed by vote-locked holders, who in return earn the fees and bribes of the pools they favor."
versionContext: "This page describes the Aerodrome design in its public documentation repository, which was last updated in July 2026, and the Aerodrome contracts, which inherit from Velodrome V2. A merger into Aero was announced in November 2025 and reported live in October 2026, so token names, voting-lock names and chain coverage may differ."
tags:
  - dex
  - vote-escrow
  - emissions
concepts:
  - automated-market-makers
  - liquidity-pools
  - governance-and-upgrades
  - constant-product
guides:
  - aerodrome-velodrome-and-aero
glossary:
  - veaero
  - gauge
  - epoch
  - rebase
  - stableswap
versions:
  - name: "Velodrome V2"
    status: "historical"
    note: "The Optimism design that Aerodrome says it inherits. Documentation could not be read for this page."
  - name: "Aerodrome"
    status: "active"
    note: "Launched on Base on 28 August 2023, with AERO emissions, veAERO voting and gauges. Documented in a public docs repository."
  - name: "Aero merger"
    status: "proposed"
    note: "Announced on 12 November 2025 to merge Aerodrome and Velodrome into one exchange and token. Later reports describe a launch in October 2026, which this page could not confirm from primary documentation."
sources:
  - title: "About Aerodrome"
    url: "https://github.com/aerodrome-finance/docs/blob/main/content/intro.mdx"
    kind: "docs"
    publisher: "Aerodrome"
  - title: "Aerodrome emissions"
    url: "https://github.com/aerodrome-finance/docs/blob/main/content/emissions.mdx"
    kind: "docs"
    publisher: "Aerodrome"
  - title: "Aerodrome voting"
    url: "https://github.com/aerodrome-finance/docs/blob/main/content/voting.mdx"
    kind: "docs"
    publisher: "Aerodrome"
  - title: "Aerodrome voter rewards"
    url: "https://github.com/aerodrome-finance/docs/blob/main/content/feesandbribes.mdx"
    kind: "docs"
    publisher: "Aerodrome"
  - title: "Aerodrome liquidity pools"
    url: "https://github.com/aerodrome-finance/docs/blob/main/content/liquidity.mdx"
    kind: "docs"
    publisher: "Aerodrome"
  - title: "Aerodrome tokenomics"
    url: "https://github.com/aerodrome-finance/docs/blob/main/content/tokenomics.mdx"
    kind: "docs"
    publisher: "Aerodrome"
  - title: "Aerodrome Relay"
    url: "https://github.com/aerodrome-finance/docs/blob/main/content/relay.mdx"
    kind: "docs"
    publisher: "Aerodrome"
  - title: "VotingEscrow state transitions"
    url: "https://github.com/aerodrome-finance/contracts/blob/main/VOTINGESCROW.md"
    kind: "code"
    publisher: "Aerodrome"
  - title: "Aerodrome and Velodrome to merge into Aero"
    url: "https://forklog.com/en/aerodrome-and-velodrome-to-merge-into-aero/"
    kind: "research"
    publisher: "ForkLog"
---

[Uniswap](/protocols/uniswap) pays liquidity providers with trading fees. [Curve](/protocols/curve) adds a token whose emissions holders direct, through veCRV and gauges. Aerodrome is the same idea pushed further: nearly all of its incentives pass through a weekly vote, and the people who vote are paid by the pools that want their votes. This page describes that machine, the stable and volatile pools it pays for, and what is known and not known about the announced merger into a single Aero exchange.

The [guide](/guides/aerodrome-velodrome-and-aero) covers the names. A caution on sources: the mechanism below comes from Aerodrome's public docs repository, last updated in July 2026, and its contracts repository. The official documentation after the merger announcement was not readable for this page, so statements about Aero are reported ones and marked as such.

## The weekly cycle

The docs describe the protocol as a loop around a seven-day **epoch**. An epoch starts every Thursday at 00:00 UTC and ends Wednesday at 23:59 UTC, and votes, emissions, fees and incentives are all calculated per epoch.

1. Traders pay fees on pools, and the protocol tries to attract liquidity to earn them.
2. Each epoch, liquidity providers receive AERO emissions in proportion to the votes their pool accumulated. Only liquidity staked in the protocol's **gauges** earns emissions.
3. Holders lock AERO to get veAERO and vote on the next epoch's emissions.
4. Voters receive 100 percent of the trading fees from the previous epoch for the pools they voted on, plus incentives that others deposit for those voters.

<diagram-placeholder name="vote-escrow-epoch"></diagram-placeholder>

A vote for the next epoch is due by Wednesday 23:00 UTC. Votes carry over if unchanged, and each lock can vote once per epoch. The result is a market. A protocol that wants liquidity for its token deposits incentives for voters on its pool. Voters weigh those incentives and fees against what other pools offer, and emissions follow the votes.

## veAERO

AERO is an ERC-20 utility token. veAERO is the ERC-721 governance token, called a lock or veNFT, that a holder receives by locking AERO for up to four years. The docs give the linear relationship: 100 AERO locked for four years becomes 100 veAERO and 100 AERO locked for one year becomes 25. Voting power is higher for longer locks, and additional tokens can be added to a lock at any time. The VotingEscrow contract has several lock states, including a permanent lock, delegation of voting power, and managed locks used by automation.

This is the same escrow family as [veCRV](/protocols/curve) and [Pendle's retired vePENDLE](/protocols/pendle), with one difference the docs state clearly: the lock is a transferable NFT, so a position can be merged, split or moved. A voter's income is the fees and incentives of the pools they back. They are not paid in the emissions themselves, except through the rebase below.

## Emissions

The docs describe the initial AERO supply as 500 million, with 450 million distributed as vote-locked tokens. Weekly emissions start at 10 million AERO, 2 percent of the initial supply, and follow three phases. In "take-off", the first 14 epochs, emissions grow 3 percent a week. In "cruise", after epoch 14, they decay by 1 percent per epoch. In "Aero Fed", from about epoch 67 when programmatic emissions fall below 9 million, veAERO voters take over monetary policy: each epoch they choose by simple majority to increase emissions by 0.01 percent of total supply, decrease by the same, or hold, within a ceiling of 1 percent and a floor of 0.01 percent of supply per week.

Voters also receive a **rebase**, a weekly mint to veAERO holders sized by:

```text
rebase = weeklyEmissions * (1 - veAERO supply / AERO supply)^2 * 0.5
```

The docs say this rewards veAERO holders most when locking rates are low, which encourages new lockers, and that veAERO supply does not change the weekly emissions that liquidity providers get. The point is to limit dilution of lockers as new tokens are minted. These parameters are in the documents I could read and are the ones most likely to have moved with the merger.

## Fees and incentives

Fees collected by staked liquidity in the previous epoch become voter incentives for the current one, paid in the pool's own tokens: a `vAMM-AERO/USDC` pool pays AERO and USDC. Separately, any protocol can deposit incentives, called bribes elsewhere, for whitelisted tokens, and the docs say they go only to voters on that pool, in proportion to their share of the pool's votes. Rewards are claimable after the epoch changes.

The docs describe the economy as zero-leak: the protocol's two revenue streams are 100 percent of swap fees from staked liquidity, with a share of fees from unstaked liquidity in some emissions-eligible pools, and 100 percent of voting incentives. They are distributed to token operators, meaning lockers and liquidity providers, with the Aerodrome Foundation and Dromos Labs earning through participation in the system and Dromos Labs allotted a small percentage of weekly emissions, which the docs say is compounded into its max-locked position. Those are the operator's statements about its own incentives.

## Pools and routing

Aerodrome has two pool types, with custom factories supported for others. A **stable pool** prices with `x³y + y³x ≥ k`, which gives low slippage for tokens that trade close together, such as stablecoins. A **volatile pool** uses `x × y ≥ k`, the [constant product](/concepts/constant-product) rule. The docs say the router evaluates both and uses 30-minute time-weighted average prices to protect against flash loan attacks, with no external upkeep.

A liquidity provider chooses to stake in a gauge to earn AERO, or leave the position unstaked to earn a share of fees. The two roles are separate: staking converts a fee income into an emissions income, and the fees from staked positions go to voters.

## Relay

Voting every week is work, so the docs describe **Relay**, a way to automate management of locks. A holder deposits a veNFT into a strategy, which votes and claims for it. Compounders convert rewards back into the lock to raise voting power, and convertors compound the rebase but turn rewards into another asset. Depositing extends the lock to its maximum, and the docs say a withdrawal is possible only after the first week. The protocol runs a compounder called veAERO MAXI. A Relay strategy is a custodian of voting power, which makes its operator a new party to trust.

## The merger into Aero

On 12 November 2025 Dromos Labs announced Aero, which ForkLog reported would unite Aerodrome and Velodrome, merge AERO and VELO into a single AERO token with 94.5 percent going to Aerodrome holders and 5.5 percent to Velodrome holders, and expand to Ethereum and Circle's Arc network, with a launch then expected in the second quarter of 2026. Later press coverage reports a launch in October 2026, but I could not read it or the official docs, so the final token mapping, the lock rules that replace veAERO, the emissions schedule after the merger and which networks and pools survive are all unverified here. The ForkLog report is the only source cited, and it describes an announcement and a plan.

What carries over is a question for the reader to check. The mechanism above is the one Aerodrome documented and Velodrome V2 introduced. If the post-merger exchange keeps vote-locked emissions, the questions below still apply. If it changed them, this page describes the previous design.

## What remains trusted

The voters' incentives, which are paid by the pools that want votes. A vote market can concentrate emissions in pools that pay the most, which is not necessarily those that give traders the best prices. The lock-holder concentration, since the largest lockers choose where emissions go. Relay operators, where used. The contracts' upgradeability and governors, which I did not review in the sources read. The whitelisted token set for incentives. And the stable pool's invariant, whose slippage properties assume the pair stays near parity, the same assumption as [Curve's StableSwap](/protocols/curve) and [Balancer's stable pools](/protocols/balancer).
