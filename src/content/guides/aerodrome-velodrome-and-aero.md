---
title: "Aerodrome, Velodrome and Aero: which is which"
seoTitle: "Aerodrome vs Velodrome vs Aero: names, tokens and merger"
description: "How Aerodrome, Velodrome V2 and the announced Aero relate, which tokens and lock names belong to which, and what to verify while the merger's documentation is in flux."
summary: "Aerodrome on Base inherits Velodrome V2 from Optimism, and Dromos Labs announced in November 2025 that both would merge into one Aero exchange with one AERO token. Names such as AERO, VELO, veAERO and veVELO therefore refer to different contracts depending on date and chain, and the official post-merger documentation was not readable for this guide."
status: "published"
published: "2026-11-23"
lastVerified: "2026-11-23"
faq:
  - question: "Is Aerodrome a fork of Velodrome?"
    answer: "Aerodrome's docs say it inherits the latest features from Velodrome V2. Aerodrome launched on Base on 28 August 2023, and Velodrome operates on Optimism. Both come from the same developer, Dromos Labs, which announced in November 2025 that the two would merge into one exchange called Aero."
    featured: true
  - question: "What happens to AERO and VELO holders in the merger?"
    answer: "ForkLog reported, from the 12 November 2025 announcement, that AERO and VELO would be merged into a single AERO token, with 94.5 percent of the new supply going to existing AERO holders and 5.5 percent to VELO holders. Whether and how lock positions convert is not documented in sources that could be read for this guide."
  - question: "Which Aero details are confirmed?"
    answer: "Only the announcement and plan are cited here: the merger of the two exchanges and tokens, the 94.5 and 5.5 percent split, an expansion to Ethereum and Circle's Arc network, and an expected second-quarter 2026 launch. Later coverage reports a launch in October 2026, but the official post-merger documentation was not readable, so the live design is unverified."
order: 17
protocol: "aerodrome"
versionContext: "The sources are the Aerodrome docs repository, last pushed in July 2026, and a November 2025 news report of the announcement. The merger changes token and lock names, and any statement about the current live system should be checked against the official documentation."
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
    note: "The earlier vote-escrow exchange on Optimism that Aerodrome says it inherits. Documentation was not readable for this guide."
  - name: "Aerodrome"
    status: "active"
    note: "Base exchange launched on 28 August 2023 with AERO emissions and veAERO voting."
  - name: "Aero"
    status: "proposed"
    note: "A unified exchange and token announced on 12 November 2025. Later coverage reports a launch, which could not be verified here."
sources:
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

The name of this exchange has changed once and is changing again. The [protocol page](/protocols/aerodrome) explains the mechanism. This guide only maps the names, and it is explicit about what could be verified.

## The map

| Name | What it is | Chain | Status in the sources read |
| --- | --- | --- | --- |
| Velodrome V2 | The vote-escrow exchange that Aerodrome inherits from | Optimism | Not documented in sources readable here |
| Aerodrome | A vote-escrow exchange with AERO emissions | Base | Documented, launched 28 August 2023 |
| AERO | Aerodrome's ERC-20 utility token | Base | Documented |
| veAERO | An ERC-721 lock of AERO, up to four years | Base | Documented |
| VELO and veVELO | The Velodrome equivalents | Optimism | Not documented here |
| Aero | The announced merger of both exchanges and tokens | Several | Announced 12 November 2025. Live state unverified |

## Why the names matter

Three questions get confused when people say "AERO" or "ve".

**Which contract?** An AERO token before the merger is Aerodrome's token on Base. After a merger that maps VELO into AERO, the same name can mean a different contract and a different supply. A report's figures depend on the date.

**Which lock?** veAERO is a lock NFT with a linear four-year weighting, per the docs. A post-merger lock may have a different name and different rules. The ForkLog report does not describe lock conversion, and this guide does not guess.

**Which emissions?** The emissions schedule documented for Aerodrome starts at 10 million AERO per epoch and moves through take-off, cruise and an Aero Fed phase. A merged exchange may change that schedule, and the final one is not documented in sources that could be read.

## What was announced

ForkLog reported that Dromos Labs announced Aero on 12 November 2025: a single exchange uniting Aerodrome and Velodrome, a merged AERO token with 94.5 percent for existing AERO holders and 5.5 percent for VELO holders, an expansion to Ethereum and Circle's Arc, and a launch expected in the second quarter of 2026. It also reported a new operating layer called MetaDEX 03. The report quotes the operator's figures for revenue and cost savings, which this guide does not repeat because they are projections made at an announcement.

Coverage from October 2026 reports that the launch happened. I did not read it or an official post, so I treat the state as unconfirmed.

## What to check

1. Which chain and which token contract does the interface use today? A block explorer shows the token's total supply and holders.
2. Is a position a veAERO NFT, a veVELO NFT or a converted lock, and what are its weighting and unlock rules?
3. Does the pool use staked gauges, and where are the emissions for it decided?
4. Is the documentation you are reading dated before or after the merger? The repository this site read was last updated in July 2026.

The [Curve generations guide](/guides/curve-generations) is a comparable case of one name covering several contract families, and the [Balancer versions guide](/guides/balancer-versions) shows the same problem after a redesign.
