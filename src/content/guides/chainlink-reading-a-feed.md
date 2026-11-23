---
title: "Reading a Chainlink feed safely"
seoTitle: "Reading a Chainlink price feed: checks a consumer must make"
description: "What latestRoundData returns, which checks a consuming contract has to add itself, and how heartbeat, deviation and L2 sequencer downtime change what a price means."
summary: "A Chainlink feed returns an answer and timestamps, and it does not stop a consumer from using an old one. A safe read checks that the answer is positive, that its age is within the feed's heartbeat plus a margin, and, on a layer 2, that the sequencer is up and past a grace period. Each protocol decides how much of this to do."
status: "published"
published: "2026-11-23"
lastVerified: "2026-11-23"
faq:
  - question: "Does latestRoundData guarantee the price is recent?"
    answer: "No. It returns the latest answer the aggregator holds, along with the time of its last update. A feed that has stopped updating keeps returning its last answer. The consumer has to compare the update time with the feed's heartbeat and decide what age is acceptable, because the interface does not revert on stale data."
    featured: true
  - question: "Why check a sequencer uptime feed on a layer 2?"
    answer: "If the sequencer is down, users cannot send normal transactions, but anyone able to use the rollup's L1 contracts can still act. Chainlink's docs say a consumer can use the uptime feed to detect downtime and apply a grace period, so that prices and liquidations are not acted on the moment the sequencer returns."
  - question: "Is a price from Compound III's getPrice checked for staleness?"
    answer: "In the version of Comet read for this site, getPrice calls latestRoundData and reverts only if the price is zero or negative. It does not compare the update time with a heartbeat. Staleness protection in that design therefore depends on the feed configured for the market, which is why feed choice is part of market risk."
order: 13
protocol: "chainlink"
versionContext: "The checks described here are the integration practices the Chainlink docs recommend and that example contracts show. They are not enforced by the feed. Feed addresses, heartbeats, thresholds and sequencer feed coverage change and are listed on the feed pages."
tags:
  - chainlink
  - oracle
  - integration
concepts:
  - oracles-and-dependencies
  - security-assumptions
  - collateral-and-liquidation
glossary:
  - data-feed
  - deviation-threshold
  - heartbeat
  - oracle
relatedGuides: []
versions:
  - name: "Data Feed read through a proxy"
    status: "active"
    note: "latestRoundData on AggregatorV3Interface. Returns the answer and timestamps and leaves freshness checks to the consumer."
  - name: "Data Streams report with a Verifier"
    status: "active"
    note: "A signed report submitted by the application and verified in the same transaction. Freshness is a property of the report the application chose to submit."
sources:
  - title: "Using Data Feeds on EVM chains"
    url: "https://docs.chain.link/data-feeds/using-data-feeds"
    kind: "docs"
    publisher: "Chainlink"
  - title: "Decentralized data model"
    url: "https://docs.chain.link/architecture-overview/architecture-decentralized-model"
    kind: "docs"
    publisher: "Chainlink"
  - title: "L2 sequencer uptime feeds"
    url: "https://docs.chain.link/data-feeds/l2-sequencer-feeds"
    kind: "docs"
    publisher: "Chainlink"
  - title: "Selecting quality data feeds"
    url: "https://docs.chain.link/data-feeds/selecting-data-feeds"
    kind: "docs"
    publisher: "Chainlink"
  - title: "Data Streams architecture"
    url: "https://docs.chain.link/data-streams/architecture"
    kind: "docs"
    publisher: "Chainlink"
  - title: "AggregatorV3Interface.sol"
    url: "https://github.com/smartcontractkit/chainlink-evm/blob/develop/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol"
    kind: "code"
    publisher: "Chainlink"
  - title: "CometWithExtendedAssetList.sol"
    url: "https://github.com/compound-finance/comet/blob/main/contracts/CometWithExtendedAssetList.sol"
    kind: "code"
    publisher: "Compound"
---

The [protocol page](/protocols/chainlink) explains how a feed produces an answer. This guide is about the other side: the contract that reads it. The feed makes a limited promise, and a consumer's safety is what the consumer adds to that promise.

## What the interface returns

`AggregatorV3Interface` exposes `decimals()`, `description()`, `version()`, `getRoundData` and `latestRoundData()`. The last returns five values: a round id, the answer as a signed integer, the time the round started, the time of the last update, and the round in which the answer was computed. The answer is scaled by `decimals()`, and the contract has to read that value from the feed instead of assuming it, since a different feed or network can use another scale.

The interface does not return a flag for "fresh". There is no revert for an old answer. The docs' example consumer contract is explicitly labelled as unaudited sample code with hardcoded values, which should not be used in production, and it shows the call, not a full set of safety checks.

## The checks a consumer adds

A careful read does four things. This is an educational sketch, not Chainlink source, not compiled here and not a contract to hold assets.

```solidity
// Educational sketch. Not Chainlink source and not audited.
function readPrice(AggregatorV3Interface feed, uint256 maxAge) internal view returns (uint256) {
    (, int256 answer, , uint256 updatedAt, ) = feed.latestRoundData();
    require(answer > 0, "bad price");
    require(updatedAt != 0 && block.timestamp - updatedAt <= maxAge, "stale price");
    return uint256(answer);   // scaled by feed.decimals(); the caller must rescale
}
```

1. **The answer is positive.** A zero or negative answer is an error for a price, and a contract that proceeds anyway will price collateral at nothing or at a negative value.
2. **The answer is recent enough.** The right `maxAge` is the feed's heartbeat plus a margin. The docs say the heartbeat is a per-feed rule that starts a new round after a set time since the last update, so a healthy feed can be as old as its heartbeat. A `maxAge` shorter than the heartbeat rejects healthy answers. A much longer one accepts answers from a dead feed.
3. **The decimals are read and applied.** Mixing a feed with 8 decimals and a token with 18 decimals is arithmetic that has to be written deliberately.
4. **The deviation is part of the model.** The answer may differ from the market by up to the feed's deviation threshold without an update. A liquidation threshold or a loan-to-value set closer to the threshold than that deviation allows has no margin for the oracle itself.

## Layer 2 and the sequencer

On an optimistic rollup or many ZK rollups, the sequencer orders transactions. The docs describe the risk: if the sequencer is down, normal users lose access to the read and write APIs, while users with enough technical ability can still act through the rollup's L1 contracts. That is an unfair advantage and can lead to liquidations that others could not defend against.

The mitigation the docs describe is a **sequencer uptime feed**, which records the last known status of the sequencer. A consumer reads it, treats a down status as a reason to pause price-sensitive actions, and after the sequencer returns waits for a grace period before acting on prices, so that borrowers have time to add collateral or repay. The docs also say Chainlink is no longer expanding these feeds to additional networks, so on a network without one, a consumer has to find another way to know whether the chain is live.

## What real protocols do

Protocols differ, and the difference is part of their risk. In the version of Compound III read for this site, the function that reads a price calls `latestRoundData` and reverts if the price is zero or negative. It does not compare the update time with a heartbeat, so the freshness of the market's prices depends on the feed the market was configured with. [Morpho](/protocols/morpho) puts the oracle inside the market's identity, so the choice of feed and its checks are fixed for that market. [Spark](/protocols/spark) takes a median of three oracle providers and falls back to an average of two or a single feed, which reduces the effect of one stale or wrong source and does not remove a failure shared by all three.

This guide does not say any of those designs is unsafe. It says that "uses Chainlink" does not tell you which of the checks above are present.

## Data Streams

A Data Streams report is different in kind. The application fetches a signed report from the network and submits it, and a Verifier contract checks the signature in the same transaction. A consumer therefore does not read a stored answer. It receives whatever report the caller supplied, subject to verification. The docs have a page on report timestamps and report windows. The consumer's duty becomes checking that the report is recent and that it is for the stream it expects, since a valid signature proves the report was produced, not that it is the latest.

## What to check before relying on a feed

1. Which proxy address does the contract read, and does the Chainlink flags registry or the feed page identify it as Chainlink's?
2. What are the feed's heartbeat, deviation threshold and minimum oracle count? They are listed per feed.
3. What risk category does the feed carry, and for a thin asset, is there a deeper market the feed does not see?
4. Does the consuming contract check for a positive answer, an age limit and the feed's decimals?
5. On a layer 2, does it consult the sequencer uptime feed and apply a grace period?

The [oracle concept page](/concepts/oracles-and-dependencies) covers the general dependency, and the [security assumptions](/concepts/security-assumptions) page lists the pattern with the others.
