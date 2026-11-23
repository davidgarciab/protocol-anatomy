---
title: "Chainlink"
seoTitle: "How Chainlink Data Feeds work: OCR, heartbeat, deviation"
description: "How Chainlink Data Feeds aggregate prices offchain, when they update onchain, what a consumer contract actually reads, and how Data Streams and SVR differ."
summary: "Chainlink is the oracle layer most DeFi protocols read prices from. A Data Feed is an aggregator contract behind a proxy, updated by a node network that signs one median report and posts it when a deviation or heartbeat rule fires. Data Streams pull signed reports on demand, and SVR sells the right to act on updates."
status: "published"
published: "2026-11-23"
lastVerified: "2026-11-23"
faq:
  - question: "When does a Chainlink Data Feed update its onchain price?"
    answer: "A new round starts when either of two rules fires first. The deviation threshold fires when nodes see the offchain value differ from the onchain value by more than a set percentage. The heartbeat fires after a set time since the last update. A quiet market therefore still updates, and a fast market updates sooner."
    featured: true
  - question: "What does a consumer contract actually read from a feed?"
    answer: "It calls latestRoundData on a proxy through the AggregatorV3Interface and receives a round id, an answer, two timestamps and an answered-in round. The answer is an integer scaled by the feed's decimals. Whether the answer is fresh enough is for the consumer to check, because the feed only promises the rules above."
    featured: true
  - question: "How is Data Streams different from a Data Feed?"
    answer: "A Data Feed pushes aggregated answers onto the chain whenever its rules fire, and any contract can read them. Data Streams is pull-based: the network signs reports offchain, the application fetches one and submits it, and a Verifier contract checks the signatures in the same transaction that uses the price."
  - question: "What are Smart Value Recapture feeds?"
    answer: "SVR feeds recapture oracle extractable value, the part of MEV tied to oracle updates, which is most often seen when lending protocols liquidate. They are read like standard feeds. The docs say the recaptured value gives integrating protocols an additional revenue stream and also supports the economics of the oracle network."
order: 13
category: "Oracle"
mechanism: "A decentralized oracle network signs aggregated reports, and an onchain aggregator verifies a quorum and exposes the median behind a proxy."
versionContext: "Data Feeds, Data Streams, SVR feeds, SmartData and CCIP are separate products. Feed lists, thresholds, networks and risk categories are per feed and change, and the docs say each integrator is responsible for choosing a feed."
tags:
  - oracle
  - price-feeds
  - data-streams
concepts:
  - oracles-and-dependencies
  - security-assumptions
  - composability
  - collateral-and-liquidation
guides:
  - chainlink-reading-a-feed
glossary:
  - data-feed
  - deviation-threshold
  - heartbeat
  - oev
  - oracle
versions:
  - name: "Data Feeds"
    status: "active"
    note: "Push-based aggregated answers for prices, proof of reserves, NAV and rates, read through AggregatorV3Interface."
  - name: "Smart Value Recapture feeds"
    status: "active"
    note: "Data Feeds variants that recapture oracle extractable value, available on Ethereum mainnet and on several other networks through auction providers."
  - name: "Data Streams"
    status: "active"
    note: "Pull-based signed reports verified onchain by a Verifier contract, for latency-sensitive markets."
sources:
  - title: "Chainlink Data Feeds"
    url: "https://docs.chain.link/data-feeds"
    kind: "docs"
    publisher: "Chainlink"
  - title: "Decentralized data model"
    url: "https://docs.chain.link/architecture-overview/architecture-decentralized-model"
    kind: "docs"
    publisher: "Chainlink"
  - title: "Offchain Reporting"
    url: "https://docs.chain.link/architecture-overview/off-chain-reporting"
    kind: "docs"
    publisher: "Chainlink"
  - title: "Using Data Feeds on EVM chains"
    url: "https://docs.chain.link/data-feeds/using-data-feeds"
    kind: "docs"
    publisher: "Chainlink"
  - title: "Selecting quality data feeds"
    url: "https://docs.chain.link/data-feeds/selecting-data-feeds"
    kind: "docs"
    publisher: "Chainlink"
  - title: "L2 sequencer uptime feeds"
    url: "https://docs.chain.link/data-feeds/l2-sequencer-feeds"
    kind: "docs"
    publisher: "Chainlink"
  - title: "Smart Value Recapture feeds"
    url: "https://docs.chain.link/data-feeds/svr-feeds"
    kind: "docs"
    publisher: "Chainlink"
  - title: "Data Streams"
    url: "https://docs.chain.link/data-streams"
    kind: "docs"
    publisher: "Chainlink"
  - title: "Data Streams architecture"
    url: "https://docs.chain.link/data-streams/architecture"
    kind: "docs"
    publisher: "Chainlink"
  - title: "Cross-Chain Interoperability Protocol"
    url: "https://docs.chain.link/ccip"
    kind: "docs"
    publisher: "Chainlink"
  - title: "AggregatorV3Interface.sol"
    url: "https://github.com/smartcontractkit/chainlink-evm/blob/develop/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol"
    kind: "code"
    publisher: "Chainlink"
---

A lending market cannot see a price. Neither can a stablecoin, a perpetual exchange or a vault. Every protocol that needs one has to be told, by a contract it trusts, and the protocols in this publication mostly name the same one. [Compound](/protocols/compound) configures a Chainlink-interface feed per asset, [Morpho](/protocols/morpho) markets compose Chainlink-interface feeds into their oracle, and [Spark](/protocols/spark) takes a median of Chainlink, Chronicle and RedStone. Each of those pages treats "the oracle" as a dependency. This page opens that box.

Chainlink is a network of independent node operators that publish data on chain. It sells several products over that network. The one most protocols mean by "Chainlink" is the Data Feed. The [oracles concept page](/concepts/oracles-and-dependencies) covers the general problem, and the [guide](/guides/chainlink-reading-a-feed) shows what a safe read looks like.

## The three contracts

The docs describe three parts of a feed: a consumer, a proxy and an aggregator.

- The **consumer** is any contract that reads the feed. It references `AggregatorV3Interface` and calls one of its functions.
- The **proxy** points at the aggregator for a feed. The docs say proxies let the underlying aggregator be upgraded without interrupting consumers, so the address a protocol stores is the proxy's.
- The **aggregator** receives periodic updates from the oracle network and stores the aggregated data so that consumers can read it in the same transaction.

The interface a consumer sees is small. `decimals()` and `description()` describe the feed, and `latestRoundData()` returns the round id, the answer, when the round started, when it was last updated, and the round the answer was computed in. The answer is a signed integer scaled by the feed's decimals. That is all the contract promises, which is why the next section matters.

## How an answer gets on chain

Each feed is updated by multiple independent oracle operators. The docs say the number varies by feed, and that an update happens only if the aggregator receives responses from a minimum number of them. Otherwise the last answer stays.

Collecting those responses used to take one transaction per oracle. The current design is **Offchain Reporting**. The nodes talk over a peer-to-peer network and run a lightweight consensus: a leader asks the followers for freshly signed observations, aggregates them into a report, and sends the report back. If a quorum of followers approves, the leader assembles a final report carrying the quorum's signatures. Nodes then try to transmit that report to the aggregator on a randomized schedule, and a round-robin fallback lets other nodes transmit if the designated one fails. The aggregator verifies on chain that a quorum signed the report and exposes the median value as the answer, with a block timestamp and a round id.

```text
nodes observe the offchain price from their data sources
leader collects signed observations -> builds one report
quorum of nodes signs the report
one node posts it; the aggregator checks the signatures
answer = median of the observations in the report
```

That sketch follows the docs' description and is not contract code. The design buys two things the docs name: one transaction per round instead of one per node, which lowers gas and congestion, and timeliness, because a round does not wait for many separate transactions. It keeps the trust property that matters: the chain checks signatures from a quorum, so a single node cannot post an answer by itself.

## When an answer updates

<diagram-placeholder name="oracle-update-flow"></diagram-placeholder>

A feed does not publish every block. Two rules decide, and the first to fire starts a new round.

- **Deviation threshold.** A new round starts when a node sees that the offchain value deviates by more than the feed's threshold from the onchain value.
- **Heartbeat.** A new round starts after a set time since the last update, even if the price has not moved.

Both are per feed, and the docs point to data.chain.link for each feed's heartbeat, deviation and minimum number of oracles. Two consequences follow for a reader. The onchain answer is allowed to differ from the market by up to the deviation threshold, which on a volatile asset is a real number to put in a liquidation model. And the answer can be as old as the heartbeat even when nothing is wrong, so a consumer cannot treat "old" as "broken" without knowing the feed's heartbeat.

Neither rule guarantees an update when the network is stressed. A congested chain, a halted sequencer or a market that nodes cannot price can delay an update. The docs' guidance to consumers on layer-2 networks is to check a **sequencer uptime feed** and to apply a grace period before acting on prices after the sequencer returns, to avoid mass liquidations on stale answers. The docs also say Chainlink is no longer expanding those uptime feeds to additional networks, though existing ones continue.

## Not every feed is the same feed

The docs say plainly that integrators are responsible for assessing the quality of the data they use, and that all feeds carry some inherent risk. They group standard price feeds into market pricing risk categories, from low to very high, plus labels for new token feeds, custom feeds, feeds being deprecated and unrated feeds. A feed with no category has not been evaluated and should be treated that way.

The factors behind a higher category are market facts: low or inconsistent volume, spreads between venues, volume concentrated on one exchange, and cross-rate risk when an asset trades mostly against something other than the quote asset. A feed for a major pair with deep multi-venue volume and a feed for a thin token are both "Chainlink", and they are not equally hard to move.

Some feeds are not market prices at all. The docs list SmartData feeds for reserves, net asset value and assets under management, rate and volatility feeds, and tokenized equity feeds. A proof-of-reserve value is a reported number from an attester, not an observed market price, and it has its own trust assumptions.

## Data Streams

Data Feeds push. **Data Streams** pull. The docs describe it as a design for latency-sensitive markets such as perpetuals and options. The Chainlink network signs reports offchain and stores them in an aggregation network. An application fetches a report by API or WebSocket and submits it with its transaction, and a Verifier contract checks the DON's signature in that same transaction, so the application can be sure the report was not altered.

The tradeoff is who pays and who chooses. A pushed feed spends gas on every update whether or not anyone needs it, and any contract can read it for free. A pulled report costs the user of the price, but it can be as fresh as the moment of use. A protocol that moves from feeds to streams moves the freshness decision into its own transaction flow, and with it the duty to submit a recent report.

## Smart Value Recapture

When a price update makes a position liquidatable, whoever sees the update first and acts on it first earns the liquidation bonus. The docs call the value of acting on an oracle update **oracle extractable value**, a subset of MEV, and say it is most commonly seen in lending liquidations. **Smart Value Recapture** feeds are read like standard feeds, and the docs say the recaptured value gives integrating protocols an additional revenue stream and supports the oracle network's economics. Searchers take part through auctions: on Ethereum mainnet through parallel orderflow auctions that include Flashbots and Titan, and on other networks through the Atlas auction system.

The point for an analyst is that an SVR feed changes who captures liquidation value. A protocol that switches to one has changed a property of its liquidations, not only its data source.

## CCIP

The docs also describe the Cross-Chain Interoperability Protocol for sending tokens and data across chains. It is a different product with a different risk profile, and the [Aave page](/protocols/aave) notes that GHO's steward contracts manage CCIP bridge limits. This page does not describe its mechanism.

## What remains trusted

The node operators, in the sense that a quorum of them must be honest and available, and the data sources they query. The feed's configuration: its deviation threshold, heartbeat and minimum oracle count. The party that can change the aggregator behind a proxy. For every consumer, the consumer's own checks: a feed gives an answer and a timestamp, and nothing forces a contract to look at the timestamp. And for layer-2 deployments, the sequencer.

The failure to understand is the one that looks fine on chain. A feed that has stopped updating still returns an answer. A protocol that reads it and never checks the age will keep accepting it.
