---
title: "Aerodrome, Velodrome and Aero: which is which"
seoTitle: "Aerodrome vs Velodrome vs Aero: names and token upgrade"
description: "How Aerodrome, Velodrome and Aero relate after the October 2026 upgrade, which tokens and lock names belong to which, and what to check on a position."
summary: "Aerodrome on Base inherited Velodrome V2 from Optimism, and on 21 October 2026 both became Aero. AERO, VELO, veAERO, veVELO and sAERO therefore refer to different contracts depending on the date and chain. This guide maps the names and the conversion rates the project publishes."
status: "published"
published: "2026-11-23"
lastVerified: "2026-11-26"
changes:
  - date: "2026-11-26"
    summary: "Rewrote the map for the 21 October 2026 Aero launch, using the project’s upgrade, emissions and allocation pages instead of press reports of a plan."
faq:
  - question: "Is Aerodrome a fork of Velodrome?"
    answer: "Aerodrome’s docs say it inherits the latest features from Velodrome V2. Aerodrome launched on Base on 28 August 2023, and Velodrome operated on Optimism. Dromos Labs announced in November 2025 that the two would merge, and Aero’s upgrade page says they became Aero on 21 October 2026."
    featured: true
  - question: "What happens to AERO and VELO holders in the merger?"
    answer: "Aero’s upgrade page says one old AERO becomes one new AERO and one VELO becomes 0.044 AERO, so that 94.5 percent of the new supply goes to Aerodrome holders and 5.5 percent to Velodrome holders. veAERO and veVELO upgrade to sAERO. Holders have to act, and an upgrade cannot be reversed."
  - question: "Do the old Aerodrome and Velodrome pools still work?"
    answer: "Aero’s upgrade page says the old pools stay live but stopped receiving emissions at launch, because all legacy gauges were deactivated. Liquidity can be unstaked and continue earning fees. Positions do not move to Aero automatically, and some pools need a manual withdrawal."
order: 17
protocol: "aerodrome"
versionContext: "Aero launched on 21 October 2026. Rates, networks and allocation rules here are the project’s published descriptions as read on 26 November 2026."
tags:
  - aerodrome
  - velodrome
  - aero
concepts:
  - automated-market-makers
  - governance-and-upgrades
glossary:
  - veaero
  - gauge
  - epoch
relatedGuides: []
versions:
  - name: "Velodrome V2"
    status: "historical"
    note: "The earlier vote-escrow exchange on Optimism that Aerodrome says it inherited. Emissions stopped at the Aero launch."
  - name: "Aerodrome"
    status: "historical"
    note: "Base exchange launched on 28 August 2023 with AERO emissions and veAERO voting. Emissions stopped on 21 October 2026."
  - name: "Aero"
    status: "active"
    note: "The unified exchange and token, live since 21 October 2026 by the project’s upgrade page."
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
  - title: "Aerodrome tokenomics"
    url: "https://github.com/aerodrome-finance/docs/blob/main/content/tokenomics.mdx"
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

Aerodrome and Velodrome became Aero on 21 October 2026. The [protocol page](/protocols/aerodrome) explains the design that was replaced and summarizes the change. This guide maps the names, so that a report or an integration can be dated correctly.

## The map

| Name | What it is | Chain | Status |
| --- | --- | --- | --- |
| Velodrome V2 | The vote-escrow exchange that Aerodrome inherited from | Optimism | Emissions stopped at the Aero launch |
| Aerodrome | A vote-escrow exchange with AERO emissions, launched 28 August 2023 | Base | Emissions stopped at the Aero launch; old pools stay live |
| AERO, old | Aerodrome’s ERC-20 token | Base | Upgrades one-for-one into the new AERO |
| veAERO and veVELO | Vote locks of AERO and VELO | Base and Optimism | Upgrade to sAERO |
| Aero | The exchange that replaced both | Seven networks at launch | Live since 21 October 2026 |
| AERO, new | Aero’s token | Base | Rewards on other networks are paid in xAERO |
| sAERO | Staked AERO that allocates rewards and earns exchange revenue | Held on Base | Live |

## Why the names matter

Three questions get confused when people say “AERO” or “ve”.

**Which contract?** “AERO” means one token before the upgrade and another after it. The project’s [upgrade page](https://aero.xyz/aero-upgrade/) converts the old one at one-for-one, converts VELO at 0.044 AERO, and points to its documentation for the new contract address. A report’s figures depend on its date.

**Which lock?** veAERO was a lock NFT with a linear four-year weighting. The upgrade retires the NFT and creates an sAERO position that keeps the remaining time, rounded up to the next full week. A permanent lock becomes sAERO at the maximum stake duration. Nothing converts without the holder acting, and there is no way back.

**Which emissions?** Aerodrome’s schedule started at 10 million AERO per epoch and moved through take-off, cruise and an Aero Fed phase. Aero’s [emissions page](https://app.aero.xyz/docs/about/emissions) describes something else: rewards that follow [Predictive Allocation](https://app.aero.xyz/docs/features/predictive-allocation) and per-pool caps, mint when claimed, and sit under a launch ceiling of 20 percent annualized inflation.

## The split and the announcement

The upgrade page divides the new supply 94.5 percent to Aerodrome holders and 5.5 percent to Velodrome holders. That matches the plan [ForkLog reported](https://forklog.com/en/aerodrome-and-velodrome-to-merge-into-aero/) from the 12 November 2025 announcement, which at the time expected a launch in the second quarter of 2026 and an expansion to Ethereum and Circle’s Arc. The launch came in October, with Base, Ethereum, OP Mainnet, Arc, Ink, Robinhood Chain and Arbitrum.

Velodrome continues to support trading and deposits on Celo, Fraxtal, Soneium and Unichain, without its token system.

## What to check

1. Which token contract does the interface use, old AERO, new AERO or xAERO?
2. Is a position a legacy veNFT that has not upgraded, or sAERO?
3. Is liquidity still in an Aerodrome or Velodrome pool, where it can earn fees but no emissions?
4. Is the documentation you are reading dated before or after 21 October 2026?

The [Curve generations guide](/guides/curve-generations) is a comparable case of one name covering several contract families, and the [Balancer versions guide](/guides/balancer-versions) shows the same problem after a redesign.
