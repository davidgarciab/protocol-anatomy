---
title: "Aerodrome and Velodrome"
seoTitle: "Aerodrome, Velodrome and Aero: veAERO to sAERO"
description: "How Aerodrome’s veAERO vote directed emissions, how its pools price trades, and what changed when Aerodrome and Velodrome became Aero in October 2026."
summary: "Aerodrome on Base and its sibling Velodrome paid liquidity providers in tokens whose emissions vote-locked holders steered, in return for fees and incentives. On 21 October 2026 both became Aero, which stopped the old emissions and replaced veAERO voting with sAERO allocation. This page explains the replaced design and records the change."
status: "published"
published: "2026-11-23"
lastVerified: "2026-11-26"
changes:
  - date: "2026-11-26"
    summary: "Recorded the 21 October 2026 launch of Aero from its official pages, marked the veAERO design as replaced, and added the concentrated pools the page had omitted."
faq:
  - question: "Is Aerodrome still running its weekly veAERO vote?"
    answer: "No. Aero’s upgrade page says Aerodrome and Velodrome became Aero on 21 October 2026. Emissions on the old exchanges stopped, their gauges were deactivated, and veAERO and veVELO upgrade to sAERO, whose holders direct AERO rewards through Predictive Allocation. Old pools stay live without emissions."
    featured: true
  - question: "What did veAERO voters earn before Aero?"
    answer: "The Aerodrome docs say voters received 100 percent of the trading fees collected from the pools they voted for, plus any incentives that other protocols deposited for voters on those pools, in proportion to their voting power. They also received a rebase that offset part of the dilution from new emissions."
    featured: true
  - question: "What happens to AERO, VELO and vote locks in the upgrade?"
    answer: "Aero’s upgrade page says one AERO becomes one new AERO and one VELO becomes 0.044 AERO. veAERO and veVELO upgrade to sAERO, keeping the time remaining rounded up to the next full week, and a permanent lock becomes sAERO at the maximum stake duration. The upgrade is one-way and nothing converts automatically."
  - question: "What is the difference between stable and volatile pools?"
    answer: "In the Aerodrome docs a stable pool prices with the invariant x cubed times y plus y cubed times x, which keeps slippage low between tokens that trade near each other, such as stablecoins. A volatile pool uses the constant product formula x times y. The docs also describe concentrated pools with chosen price ranges."
order: 17
category: "Exchange"
mechanism: "A decentralized exchange whose token emissions are directed by locked or staked holders, who in return earn revenue from the pools they favor."
versionContext: "Aero replaced Aerodrome and Velodrome on 21 October 2026. The epoch, veAERO and emissions sections describe the replaced Aerodrome design from its docs repository, last updated in July 2026."
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
    note: "The Optimism design that Aerodrome says it inherits. Its emissions stopped when Aero launched."
  - name: "Aerodrome"
    status: "historical"
    note: "Launched on Base on 28 August 2023 with veAERO voting and gauges. Emissions stopped on 21 October 2026. Old pools stay live."
  - name: "Aero"
    status: "active"
    note: "Launched on 21 October 2026 with sAERO staking and Predictive Allocation, by the project’s upgrade page."
sources:
  - title: "Aero upgrade"
    url: "https://aero.xyz/aero-upgrade/"
    kind: "docs"
    publisher: "Aero"
  - title: "Predictive Allocation"
    url: "https://app.aero.xyz/docs/features/predictive-allocation"
    kind: "docs"
    publisher: "Aero"
  - title: "Aero emissions"
    url: "https://app.aero.xyz/docs/about/emissions"
    kind: "docs"
    publisher: "Aero"
  - title: "AERO and sAERO"
    url: "https://app.aero.xyz/docs/about/aero-and-saero"
    kind: "docs"
    publisher: "Aero"
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

The [guide](/guides/aerodrome-velodrome-and-aero) covers the names. **Aero replaced this design on 21 October 2026.** Most of this page explains how Aerodrome worked before then, from its public docs repository, last updated in July 2026, and its contracts repository. The next section records what Aero’s own pages say changed.

## What changed on 21 October 2026

Aero’s [upgrade page](https://aero.xyz/aero-upgrade/) says that on 21 October 2026 at 8:00 PM EDT, 22 October at 00:00 UTC, Aerodrome and Velodrome upgraded together to become Aero.

- **Old emissions stopped.** AERO and VELO emissions on Aerodrome and Velodrome ended and their gauges were deactivated. The old pools stay live and liquidity can keep earning fees, but positions do not move to Aero automatically.
- **Tokens upgrade.** One AERO becomes one new AERO and one VELO becomes 0.044 AERO, which divides the new supply 94.5 percent to Aerodrome holders and 5.5 percent to Velodrome holders. Nothing converts automatically, and an upgrade cannot be reversed.
- **Locks become sAERO.** veAERO and veVELO upgrade to **sAERO**, staked AERO. The remaining lock time carries over, rounded up to the next full week, and a permanent lock becomes sAERO at the maximum stake duration.
- **The weekly vote is gone.** Under [Predictive Allocation](https://app.aero.xyz/docs/features/predictive-allocation), sAERO holders direct AERO rewards to pools and earn a pro rata share of the exchange revenue from the pools they allocate to. The [AERO and sAERO page](https://app.aero.xyz/docs/about/aero-and-saero) says those holders earn all of the exchange revenue. At launch a position can change its allocation once per 47 hours, a limit the project says can change.
- **Emissions work differently.** The [emissions page](https://app.aero.xyz/docs/about/emissions) describes new AERO streaming continuously in response to allocation and to a cap on each pool’s rewards, minted when liquidity providers claim, under a launch ceiling of 20 percent annualized inflation.
- **More networks.** The upgrade page lists Base, Ethereum, OP Mainnet, Arc, Ink, Robinhood Chain and Arbitrum at launch. The AERO token itself lives on Base, and rewards claimed elsewhere are paid in a receipt token, xAERO, that redeems one-for-one. Velodrome keeps trading and deposits, without its token system, on Celo, Fraxtal, Soneium and Unichain.

These are the project’s own descriptions. This page has not reviewed Aero’s contracts, and it does not yet explain Aero’s mechanism in the depth it gives the design Aero replaced.

## The Aerodrome weekly cycle, before Aero

The Aerodrome docs describe a loop around a seven-day **epoch**. An epoch started every Thursday at 00:00 UTC and ended Wednesday at 23:59 UTC, and votes, emissions, fees and incentives were all calculated per epoch. The sections from here to the merger history keep the legacy documentation’s account.

1. Traders paid fees on pools, and the protocol tried to attract liquidity to earn them.
2. Each epoch, liquidity providers received AERO emissions in proportion to the votes their pool accumulated. Only liquidity staked in the protocol’s **gauges** earned emissions.
3. Holders locked AERO to get veAERO and voted on the next epoch’s emissions.
4. Voters received 100 percent of the trading fees from the previous epoch for the pools they voted on, plus incentives that others deposited for those voters.

<diagram-placeholder name="vote-escrow-epoch"></diagram-placeholder>

A vote for the next epoch was due by Wednesday 23:00 UTC. Votes carried over if unchanged, and each lock could vote once per epoch. The result was a market. A protocol that wanted liquidity for its token deposited incentives for voters on its pool. Voters weighed those incentives and fees against what other pools offered, and emissions followed the votes.

## veAERO, the lock Aero replaced

AERO is an ERC-20 utility token. veAERO is the ERC-721 governance token, called a lock or veNFT, that a holder receives by locking AERO for up to four years. The docs give the linear relationship: 100 AERO locked for four years becomes 100 veAERO and 100 AERO locked for one year becomes 25. Voting power is higher for longer locks, and additional tokens can be added to a lock at any time. The VotingEscrow contract has several lock states, including a permanent lock, delegation of voting power, and managed locks used by automation.

This is the same escrow family as [veCRV](/protocols/curve) and [Pendle's retired vePENDLE](/protocols/pendle), with one difference the docs state clearly: the lock is a transferable NFT, so a position can be merged, split or moved. A voter's income is the fees and incentives of the pools they back. They are not paid in the emissions themselves, except through the rebase below.

## Emissions before Aero

The docs describe the initial AERO supply as 500 million, with 450 million distributed as vote-locked tokens. Weekly emissions start at 10 million AERO, 2 percent of the initial supply, and follow three phases. In "take-off", the first 14 epochs, emissions grow 3 percent a week. In "cruise", after epoch 14, they decay by 1 percent per epoch. In "Aero Fed", from about epoch 67 when programmatic emissions fall below 9 million, veAERO voters take over monetary policy: each epoch they choose by simple majority to increase emissions by 0.01 percent of total supply, decrease by the same, or hold, within a ceiling of 1 percent and a floor of 0.01 percent of supply per week.

Voters also receive a **rebase**, a weekly mint to veAERO holders sized by:

```text
rebase = weeklyEmissions * (1 - veAERO supply / AERO supply)^2 * 0.5
```

The docs say this rewards veAERO holders most when locking rates are low, which encourages new lockers, and that veAERO supply does not change the weekly emissions that liquidity providers get. The point is to limit dilution of lockers as new tokens are minted. None of this schedule should be read as Aero’s.

## Fees and incentives before Aero

Fees collected by staked liquidity in the previous epoch become voter incentives for the current one, paid in the pool's own tokens: a `vAMM-AERO/USDC` pool pays AERO and USDC. Separately, any protocol can deposit incentives, called bribes elsewhere, for whitelisted tokens, and the docs say they go only to voters on that pool, in proportion to their share of the pool's votes. Rewards are claimable after the epoch changes.

The docs describe the economy as zero-leak: the protocol's two revenue streams are 100 percent of swap fees from staked liquidity, with a share of fees from unstaked liquidity in some emissions-eligible pools, and 100 percent of voting incentives. They are distributed to token operators, meaning lockers and liquidity providers, with the Aerodrome Foundation and Dromos Labs earning through participation in the system and Dromos Labs allotted a small percentage of weekly emissions, which the docs say is compounded into its max-locked position. Those are the operator's statements about its own incentives.

## Pools and routing in Aerodrome

The Aerodrome docs describe two basic pool types, with custom factories supported for others. A **stable pool** prices with `x³y + y³x ≥ k`, which gives low slippage for tokens that trade close together, such as stablecoins. A **volatile pool** uses `x × y ≥ k`, the [constant product](/concepts/constant-product) rule. The docs say the router evaluates both and uses 30-minute time-weighted average prices to protect against flash loan attacks, with no external upkeep.

The docs also describe **concentrated pools** beside the two basic types. Their liquidity sits inside a price range bounded by ticks, with tick spacing chosen for the pair, from 1 for tightly correlated assets to 2,000 for emerging tokens, and they need active or automated management.

A liquidity provider chooses to stake in a gauge to earn AERO, or leave the position unstaked to earn a share of fees. The two roles are separate: staking converts a fee income into an emissions income, and the fees from staked positions go to voters.

## Relay, the legacy automation

Voting every week is work, so the docs describe **Relay**, a way to automate management of locks. A holder deposits a veNFT into a strategy, which votes and claims for it. Compounders convert rewards back into the lock to raise voting power, and convertors compound the rebase but turn rewards into another asset. Depositing extends the lock to its maximum, and the docs say a withdrawal is possible only after the first week. The protocol runs a compounder called veAERO MAXI. A Relay strategy is a custodian of voting power, which makes its operator a new party to trust.

## How the merger was announced

On 12 November 2025 Dromos Labs announced Aero. [ForkLog reported](https://forklog.com/en/aerodrome-and-velodrome-to-merge-into-aero/) that it would unite Aerodrome and Velodrome, merge AERO and VELO into a single AERO token with 94.5 percent going to Aerodrome holders and 5.5 percent to Velodrome holders, and expand to Ethereum and Circle’s Arc network, with a launch then expected in the second quarter of 2026. The launch came in October, as described above.

## What remains trusted

The list below was written about the Aerodrome design. The incentive and concentration questions are worth asking of any system where staked holders direct emissions, but each needs to be rechecked against Aero.

The voters' incentives, which are paid by the pools that want votes. A vote market can concentrate emissions in pools that pay the most, which is not necessarily those that give traders the best prices. The lock-holder concentration, since the largest lockers choose where emissions go. Relay operators, where used. The contracts' upgradeability and governors, which I did not review in the sources read. The whitelisted token set for incentives. And the stable pool's invariant, whose slippage properties assume the pair stays near parity, the same assumption as [Curve's StableSwap](/protocols/curve) and [Balancer's stable pools](/protocols/balancer).
