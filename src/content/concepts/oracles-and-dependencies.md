---
title: "Oracles and external dependencies"
description: "Where Aave, Maker, Curve, and Lido take an input the chain cannot see, and what fails when that input is wrong."
summary: "Lending solvency, Maker’s spot price, some Curve coin rates, and Lido’s share rate all depend on data that is not the protocol’s own invariant. The contract will enforce the wrong number faithfully. Oracle design is the choice of who may write that number and how stale it may be."
status: "published"
published: "2026-10-13"
lastVerified: "2026-10-13"
order: 10
group: "engineering"
tags:
  - oracles
  - dependencies
protocols:
  - aave
  - maker-sky
  - curve
  - lido
glossary:
  - oracle
  - health-factor
  - share
related:
  - collateral-and-liquidation
  - liquid-staking
  - security-assumptions
sources:
  - title: "Aave V3 smart contracts"
    url: "https://aave.com/docs/developers/smart-contracts"
    kind: "docs"
    publisher: "Aave"
  - title: "Aave V4 overview"
    url: "https://github.com/aave/aave-v4/blob/main/docs/overview.md"
    kind: "docs"
    publisher: "Aave"
  - title: "Vat detailed documentation"
    url: "https://docs.makerdao.com/smart-contract-modules/core-module/vat-detailed-documentation"
    kind: "docs"
    publisher: "MakerDAO"
  - title: "Integrating Stableswap-NG"
    url: "https://docs.curve.finance/developer/integration/stableswap-ng"
    kind: "docs"
    publisher: "Curve"
  - title: "AccountingOracle.sol at core v3.0.2"
    url: "https://github.com/lidofinance/core/blob/v3.0.2/contracts/0.8.9/oracle/AccountingOracle.sol"
    kind: "code"
    publisher: "Lido"
  - title: "Understanding swaps"
    url: "https://docs.uniswap.org/concepts/protocol/swaps"
    kind: "docs"
    publisher: "Uniswap"
---

An invariant can only see the storage and the tokens it is given. Collateral value, beacon-chain balances, and the exchange rate of a wrapped staking token are not in that storage until someone writes them. That write is an oracle, even when the protocol does not use the word.

## Four writes

Aave’s `AaveOracle` is the V3 registry of price sources. Health factor is a ratio of those prices. The V3 docs also describe a sentinel that can freeze actions after an oracle outage and allow a grace period when prices return. The grace period is an admission that a fresh price after downtime would otherwise liquidate people who had no time to repay. V4’s overview says oracles are spoke-specific. Two markets sharing a hub can disagree about the price of the same asset. The hub does not reconcile them. It reconciles cash and debt shares.

Maker’s `spot` is the price the Vat trusts, already scaled by the liquidation ratio. The oracle and the contract that pokes `spot` are outside `frob`. A stale `spot` makes unsafe vaults look safe, or the reverse. `drip` being stale is a different bug: it stales the debt, not the collateral price. Both have to be current for the safety check to mean what governance thinks it means.

Curve NG asset type 1 is an external rate, used for wrapped staking tokens. Asset type 3 calls `convertToAssets` on an ERC-4626. Those calls are rate oracles with a different interface. If `convertToAssets` can be manipulated inside a transaction, the pool’s invariant will trade at the manipulated rate. Asset type 2, rebasing, is not an oracle. The balance changes in the token itself. The pool has to measure balances rather than remember them. stETH is the usual example, which is why Lido’s wrapper exists for protocols that cannot tolerate a rebase.

Lido’s accounting oracle is the bridge from consensus-layer ether to the share rate. The report at core `v3.0.2` carries balances, a simulated share rate, withdrawal batches, and a bunker-mode flag. A wrong report rebases every stETH holder. There is no pool invariant that can disagree with it. The sanity checker is a bound on the report, not a view of the beacon chain.

## Spot prices from AMMs

Uniswap does not need an oracle to settle a swap. The reserves are the price. Other protocols sometimes read that price. A swap moves it. The swap guide’s description of price impact is exactly the attack: push the reserves, borrow against the new price, push the reserves back. Time-weighted averages and medians exist because spot is a bad liquidation input. This site does not bless a particular oracle network. It says the dependency is there, and the [liquidation](/concepts/collateral-and-liquidation) rule is downstream of it.

## Dependencies that are not price feeds

Node operators, Ethereum’s exit queue, governance guardians, and peg-module inventory are external in the same practical sense. The contract will wait on them. An oracle page that only lists price feeds understates Lido, where the dominant external system is the consensus layer, and understates Maker, where the dominant external system can be the collateral’s own issuer.

When a document says a system is decentralized because users can call the contracts, check whether the solvency check still has a writer. If it does, that writer is part of the design.
