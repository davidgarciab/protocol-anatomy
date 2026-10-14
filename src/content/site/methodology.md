---
title: "Methodology"
description: "How Protocol Anatomy chooses sources, dates version claims, and corrects pages when a protocol changes."
summary: "Articles are written from protocol documentation, papers, source files, and governance posts. A last-verified date means those sources were read for that page. It does not mean an audit. Figures quoted from a governance update stay attributed to that update."
status: "published"
published: "2026-10-13"
lastVerified: "2026-10-13"
order: 1
tags:
  - methodology
  - sources
sources:
  - title: "Aave V4 overview"
    url: "https://github.com/aave/aave-v4/blob/main/docs/overview.md"
    kind: "docs"
    publisher: "Aave"
  - title: "How Uniswap works"
    url: "https://docs.uniswap.org/contracts/v2/concepts/protocol-overview/how-uniswap-works"
    kind: "docs"
    publisher: "Uniswap"
  - title: "Vat detailed documentation"
    url: "https://docs.makerdao.com/smart-contract-modules/core-module/vat-detailed-documentation"
    kind: "docs"
    publisher: "MakerDAO"
  - title: "Understanding StableSwap"
    url: "https://docs.curve.finance/protocol/pool/understanding-stableswap"
    kind: "docs"
    publisher: "Curve"
  - title: "Lido tokens integration guide"
    url: "https://github.com/lidofinance/docs/blob/main/docs/guides/lido-tokens-integration-guide.md"
    kind: "docs"
    publisher: "Lido"
---

Protocol Anatomy explains how a few widely used protocols account for assets. The pages are for engineers who can read a contract and want the mechanism, the version boundary, and the source. They are not price commentary, and they are not a substitute for the protocol’s own docs when you are about to send a transaction.

## What gets cited

Sources are preferred in this order:

1. The protocol’s own technical documentation.
2. A whitepaper or formal note published by the protocol.
3. Source code in the protocol’s repository, at a file, tag, or commit named on the page.
4. Governance proposals and official development updates.
5. Security write-ups and incident reports from the protocol, when a page is actually about an incident.
6. A standard such as an ERC or an Ethereum consensus document, when the protocol depends on it.

A company blog can establish a date the organization announced, which is how the Uniswap v4 launch post and the Lido Dual Governance overview are used. A blog sentence about safety or market leadership is not treated as evidence of those qualities. Marketing pages that describe collateral mixes or “trustless” architecture are not used as proof of either.

Secondary explainers are not in the source lists for the protocol pages. If a fact is only in a secondary source, it is not stated.

## Version status

Each protocol and version guide carries a version list with a controlled status:

| Status | Meaning on this site |
| --- | --- |
| active | A production design the cited docs still describe as something users or integrators can be on |
| released | Shipped, used when the important fact is that it left development |
| historical | An earlier design, kept so the newer one has a predecessor |
| deprecated | A mechanism the protocol’s own current interface marks as deprecated |
| proposed | Discussed or voted, not established here as deployed |
| in-development | Being built, not established here as activated |

A version is not added because a number would make a tidy sequence. Aave V4 is listed because the protocol’s overview and the 2026 governance updates describe an activated deployment. Uniswap v4 is listed because the project’s launch post and current docs describe it. No page invents a V5.

“Active” does not mean “the only deployment.” Aave V3 and V4 are both active on the evidence used here. Old Curve pools stay on their original bytecode after a new factory implementation exists.

## Code examples

A fenced Solidity block is one of three things, and the paragraph around it says which.

- A short excerpt from a named file, tag, or commit. The excerpt is small. The license of that repository still applies to the original. This site does not relicense it.
- An educational sketch, marked as one, with a compiler pragma. It has not been compiled or deployed as part of publishing this site unless a page says that a command was run. None of the sketches are meant to hold assets.
- A formula in a text block, copied from a cited derivation rather than typeset as if the contracts computed real numbers.

If the excerpt and the docs disagree, the page says so. Master branches move. A citation of `master` is tied to the last-verified date, not to a promise that the file is frozen.

## What last verified means

`lastVerified` is the date the sources listed on that page were read for the claims on that page. For the first edition, that date is 13 October 2026. It is not an audit date, not a bug-bounty date, and not a claim that every parameter was read from chain that day.

Numbers that move are handled in one of two ways. They are omitted, which is the default for loan-to-value, caps, and TVL. Or they are attributed, which is how the September 2026 Aave Labs update is quoted: as that post’s report, not as a live balance this site refreshes.

## Corrections

Protocols change. A page can be wrong because a governance payload landed, because a doc URL started redirecting at a marketing page, or because an excerpt was trimmed badly. The correction path is an issue or a change on the [project repository](https://github.com/davidgarciab/protocol-anatomy) naming the page, the sentence, and the source that contradicts it. A corrected page should move `lastVerified` only after the new source has been read, and should keep the distinction between historical behavior and current behavior in the prose.

A substantive correction or addition is recorded in the page’s `changes` list with its date and a one-line summary. The page then shows an “Updated” date and a Changes section, its structured data uses that date as `dateModified`, and the change appears on [What changed](/changes/) and in the [RSS feed](/rss.xml). Re-reading sources without changing the text moves `lastVerified` only.

Automated checks in the repository catch broken internal links, missing metadata, unknown version statuses, and unfinished-article markers. They do not catch a false sentence that is grammatically fine and cites a real URL. The URL being real is not the same as the sentence being supported. That judgment stays with the person editing the page. The contributor notes in the README are the checklist for the next article.

`pnpm editorial:review` compares a bounded list of official releases and cited files with the last reviewed snapshot. A weekly GitHub Action can open one issue when that comparison changes. The issue names the source, the articles that cite it, and a review action. It does not edit articles, and it does not move `lastVerified`. A new commit can be formatting or an unrelated feature. Unavailable sources stay in the local report instead of being filed again every week.
