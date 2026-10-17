---
title: "Security assumptions"
seoTitle: "DeFi security assumptions: what is not trustless"
description: "The assumptions these protocols still require, grouped so a design is not described as trustless by default."
summary: "Each protocol enforces an invariant and leaves a set of assumptions outside it: prices, upgrades, operators, governance parameters, and the behavior of other contracts in the same transaction. Naming those assumptions is part of reading the design. It is not a finding that the design has failed."
status: "published"
published: "2026-10-13"
lastVerified: "2026-10-13"
order: 15
group: "engineering"
tags:
  - security
  - assumptions
protocols:
  - aave
  - uniswap
  - maker-sky
  - curve
  - lido
glossary:
  - oracle
  - proxy
  - bad-debt
  - hook
  - node-operator
related:
  - oracles-and-dependencies
  - governance-and-upgrades
  - composability
sources:
  - title: "Aave V4 overview"
    url: "https://github.com/aave/aave-v4/blob/main/docs/overview.md"
    kind: "docs"
    publisher: "Aave"
  - title: "How Uniswap works"
    url: "https://docs.uniswap.org/contracts/v2/concepts/protocol-overview/how-uniswap-works"
    kind: "docs"
    publisher: "Uniswap"
  - title: "Uniswap v4 hooks"
    url: "https://developers.uniswap.org/docs/protocols/v4/concepts/hooks"
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
  - title: "Dual Governance overview"
    url: "https://blog.lido.fi/dual-governance-overview/"
    kind: "governance"
    publisher: "Lido"
---

A useful way to read a protocol is to write down what the contracts check and what they assume. The checks are the invariant, the health factor, the withdrawal finalization rule. The assumptions are everything that has to be true for those checks to mean what the documentation says. This page is that list for the five protocols. It is not an audit, and it does not rank the protocols.

## Assumptions that show up in more than one design

**Prices can be wrong or late.** Aave liquidations, Maker’s `spot`, and Curve oracle rates are downstream of a writer. Lido’s share rate is downstream of an oracle report about consensus-layer balances. The contract does not have a second opinion unless a sentinel, a sanity checker, or a grace period was explicitly built. See [oracles](/concepts/oracles-and-dependencies).

**Parameters can move.** Caps, fees, amplification, stability fees, and collateral factors are governance state. Some can be changed by a steward inside bounds, as Aave’s September 2026 update describes for V4. A parameter change can liquidate users or trap liquidity without any byte of the invariant being “hacked.”

**Some code can be replaced.** Proxies on Aave V3 and on USDS, upgradeable V4 spokes, and any v4 hook that is itself a proxy are different addresses with the same kind of power. Uniswap’s core and Aave’s V4 hub are the cases this publication’s sources describe as not upgradeable. The edge around them may still be.

**The rest of the transaction can re-enter or lie.** Tokens with callbacks, hooks, and flash swaps run attacker-controlled code before the outer call finishes. Composition is the feature. It is also the path. The [composability](/concepts/composability) article separates what is atomic from what only looks atomic.

**Someone has to take the other side of a failure.** Liquidators must find it profitable to repay bad positions. Auction bidders must show up. Arbitrage must pull a StableSwap pool back toward the peg. If they do not, the protocol holds [bad debt](/glossary/bad-debt/) or a depegged inventory. The mechanism does not contain a hidden buyer of last resort unless a specific module, such as a peg stability module with inventory, was funded.

## Assumptions that belong to one protocol

Aave V4’s reinvestment module, when governance turns it on, sends idle liquidity to an external strategy. The overview says losses are assigned to the governor and that suppliers opt in by using a reserve connected to that asset. That is an extra assumption on top of borrower default. It is not part of V3’s pool.

Uniswap LPs assume the price path. Concentrated liquidity makes the assumption sharper: the range has to contain the trades. A hook adds the assumption that the hook’s code is acceptable. A hookless pool does not carry that assumption. A routed swap through a hooked pool does.

Maker assumes each collateral’s issuer and each oracle. The Vat will accept any ilk governance adds. USDS adds the assumption that the token proxy’s admin is acceptable, which DAI’s join does not phrase the same way. The savings rate assumes protocol revenue continues to fund it. The token docs describe the rate as governance-set. They do not describe it as a claim on borrower utilization the way an aToken yield is.

Curve StableSwap assumes the peg. The whitepaper’s construction is leverage on that assumption. CryptoSwap assumes its price scale tracks a market the pool can survive. crvUSD assumes LLAMMA bands and the collateral list. Those are three different bets that share a brand.

Lido assumes Ethereum consensus, the oracle committee, and the operator set. The liquid token does not reduce those to nothing. It packages them into a share. Dual Governance, as Lido describes it from July 2025, assumes that a large enough stETH escrow can delay the DAO. It assumes the delay is long enough for the exit queue. It does not assume operators stop being operators.

## How to use the list

When a sentence in a protocol’s own materials says the system is decentralized, non-custodial, or trustless, replace the adjective with the checks and the assumptions above. The checks are often real. The assumptions are often also real. Both belong in the integration. This publication’s [methodology](/methodology) is the rule for how those sentences were filtered before they reached the protocol pages.
