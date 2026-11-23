---
title: "Euler"
seoTitle: "How Euler V2 works: EVK vaults, EVC, hooks and liquidation"
description: "How Euler V2 builds lending markets from single-asset vaults linked by collateral, how the Ethereum Vault Connector coordinates accounts, and how its liquidation and hooks work."
summary: "Euler V2 is modular lending infrastructure. Each EVK vault lends one asset under its own rules, vaults accept each other's shares as collateral, and the Ethereum Vault Connector coordinates accounts across them. Liquidation is a discount that grows from zero as health falls. Governance can be live, finalized, or absent per vault."
status: "published"
published: "2026-11-23"
lastVerified: "2026-11-23"
faq:
  - question: "How is an Euler market different from an Aave or Compound market?"
    answer: "An Euler market is not one shared pool with one risk model. Each vault lends a single asset, and the liability vault decides which other vaults' shares it accepts as collateral, with its own oracle route, loan-to-value limits and caps. A market can be an isolated pair, a multi-collateral borrow market or a cross-collateralized cluster."
    featured: true
  - question: "What does the Ethereum Vault Connector do?"
    answer: "The EVC authenticates calls, supports batching, sub-accounts and operators, and records which vaults an account uses as collateral and which one acts as its controller. It does not create borrowing relationships or guarantee solvency on its own. The controller vault's account checks enforce solvency at the end of a batch."
    featured: true
  - question: "How does Euler liquidation set the liquidator's bonus?"
    answer: "A reverse Dutch auction. The discount starts at zero when an account crosses its liquidation threshold and rises linearly as health worsens, up to the vault's configured maximum. The liquidator takes over debt and receives collateral at the resulting discount in one operation, so no upfront repayment asset is needed."
  - question: "Was Euler V2 affected by the 2023 exploit?"
    answer: "No. The 2023 exploit hit Euler V1, and Euler's documentation says all user funds were recovered. V2 was rebuilt around the Euler Vault Kit and the Ethereum Vault Connector, so the two are different codebases. The docs ask readers not to describe V2 as the exploited protocol, and that distinction is about the contracts, not about their risks."
order: 16
category: "Lending"
mechanism: "Single-asset ERC-4626 vaults that accept each other's shares as collateral, coordinated by an account connector and settled by controller-vault health checks."
versionContext: "Euler V2 is the architecture the current docs describe, built from the Euler Vault Kit, the Ethereum Vault Connector and EulerEarn. Euler V1 was a separate protocol exploited in March 2023. Protocol fees were set to zero in April 2026 and the DAO can reintroduce them."
tags:
  - lending
  - vaults
  - modular
concepts:
  - lending-utilization
  - collateral-and-liquidation
  - isolated-markets-and-curation
  - oracles-and-dependencies
  - composability
  - governance-and-upgrades
guides:
  - euler-vault-types
glossary:
  - evk-vault
  - evc
  - eulerearn
  - erc-4626
  - isolated-market
  - curator
versions:
  - name: "Euler V1"
    status: "historical"
    note: "The original pooled protocol, exploited in March 2023. The docs say all user funds were recovered. It is a different codebase from V2."
  - name: "Euler V2 (EVK, EVC, EulerEarn)"
    status: "active"
    note: "Modular vaults, an account connector, oracle routers, hooks and Earn vaults that allocate across strategies."
sources:
  - title: "Euler docs overview for agents and search"
    url: "https://docs.euler.finance/llms.txt"
    kind: "docs"
    publisher: "Euler"
  - title: "Euler vaults"
    url: "https://docs.euler.finance/learn/vaults"
    kind: "docs"
    publisher: "Euler"
  - title: "Euler markets"
    url: "https://docs.euler.finance/learn/markets"
    kind: "docs"
    publisher: "Euler"
  - title: "Euler vault types"
    url: "https://docs.euler.finance/learn/vault-types"
    kind: "docs"
    publisher: "Euler"
  - title: "Euler liquidations"
    url: "https://docs.euler.finance/learn/liquidations"
    kind: "docs"
    publisher: "Euler"
  - title: "Euler price oracles"
    url: "https://docs.euler.finance/learn/price-oracles"
    kind: "docs"
    publisher: "Euler"
  - title: "Euler hooks"
    url: "https://docs.euler.finance/learn/hooks"
    kind: "docs"
    publisher: "Euler"
  - title: "EulerEarn"
    url: "https://docs.euler.finance/use/euler-earn"
    kind: "docs"
    publisher: "Euler"
  - title: "Fee Flow"
    url: "https://docs.euler.finance/EUL/fee-flow"
    kind: "docs"
    publisher: "Euler"
  - title: "Ethereum Vault Connector"
    url: "https://github.com/euler-xyz/ethereum-vault-connector/blob/master/README.md"
    kind: "code"
    publisher: "Euler"
---

Aave and Compound start from a pool: many assets in one contract, one set of risk rules, one interest rate model per asset. [Morpho](/protocols/morpho) starts from the opposite end, a minimal contract of isolated markets. Euler V2 takes a third route. It defines a vault for one asset, lets vaults accept each other as collateral, and leaves the shape of the market to whoever links them. The result can be a simple isolated pair or a cluster of vaults that all back each other, with the same contracts underneath.

The [vault types guide](/guides/euler-vault-types) separates the kinds of vault. This page follows the mechanism, and uses [Aave](/protocols/aave) and [Morpho](/protocols/morpho) for comparison.

## One vault, one asset

An **EVK vault** is the building block. The docs say it creates a lending market for one underlying asset under its own configuration, issues ERC-4626 shares to suppliers, and earns from the interest that borrowers pay. Unlike a strategy vault, its yield source is borrowing from that vault, not an outside investment.

The pieces named in the docs are the underlying asset, the `EVault` contract that tracks deposits and borrows, validates position health and permits liquidations, a price oracle route, an interest rate model, a global protocol configuration, and a read-only debt token that makes debt visible in explorers. The vault is not a pool of many assets. To hold ETH collateral and borrow USDC you use two vaults.

## Markets are relationships

The docs state the point directly: a market on Euler is a set of explicit vault relationships, not one shared pool. The **liability vault**, acting as controller, decides which vault shares it accepts as collateral and applies the oracle route, loan-to-value limits, caps and account checks for debt in that vault. The collateral vault does not choose who borrows against it.

Three shapes follow. A simple pair has one collateral vault and one borrow vault, which the docs call the most isolated design. A multi-collateral market accepts several collateral vaults. A cross-collateralized cluster has vaults that both lend and serve as collateral for each other, which is more capital efficient and adds dependencies that need review. Because collateral is vault shares, an account's collateral can itself be earning interest in a lending vault.

That differs from [Aave's](/protocols/aave) design in a specific way. In Aave the risk parameters of an asset are a property of the asset in one pool. In Euler the loan-to-value of an asset is a property of each liability vault that accepts it. The same collateral can have different terms in different markets, and the collateral vault's operator does not set them.

## The Ethereum Vault Connector

Account state does not live inside each vault. The **Ethereum Vault Connector (EVC)** sits between users and vaults. The repository describes it as a foundational layer for the core functionality a lending market needs, mediating between vaults that implement ERC-4626.

The docs list what the EVC provides: authenticated calls, batching, sub-accounts, operators and simulation. It also tracks, for each account, which vaults are enabled as collateral and which vault is the **controller** for its debt. Solvency is enforced by the controller vault's checks, and the docs say the EVC does not create borrowing relationships or guarantee solvency on its own. A batch can run many operations, and the hooks documentation refers to status checks that run when the EVC completes a batch, so what has to hold is the state at the end. That is the same idea as [Balancer's transient accounting](/glossary/transient-accounting/) and [Uniswap v4's flash accounting](/glossary/flash-accounting/).

<diagram-placeholder name="euler-market-links"></diagram-placeholder>

## Liquidation

Euler's liquidation is a reverse Dutch auction on the discount. The docs compare an account's risk-adjusted collateral value with its liability value, and when collateral no longer exceeds liability the account can be liquidated. The discount starts at zero at that threshold and rises linearly with the shortfall, up to a maximum set by the vault. Competition between liquidators is meant to clear positions at the lowest bonus the market will accept, rather than at a fixed one.

The liquidator does not repay and then receive. The docs describe a position transfer: the liquidator chooses a liability and an enabled collateral asset, takes over some or all of the debt, and receives collateral at the discount in one operation. The transfer is capped by the debt and collateral actually available, and the liquidator's resulting account must pass its own checks, which means enabling the liability vault as a controller and the received shares as collateral.

Compare [Compound III's absorb](/protocols/compound), where the protocol takes everything and pays from reserves, and [Aave's](/protocols/aave) fixed bonus per asset. Euler's model puts the price discovery in the liquidation call itself.

The docs list what decides whether this works: the liquidation LTV, the maximum discount, an optional cool-off time after the account's last status check, the liquidity of both collateral and debt assets, and the oracle price. If collateral runs out and debt remains, the vault can socialize the remaining loss across depositors only when that behavior is enabled and the contract's conditions are met. A displayed health value may be rounded near the threshold.

## Oracles

Prices come from an **oracle route** configured per vault, converting balances into a common unit of account. The docs separate adapters, which each connect to one external feed or onchain source and are immutable and ungoverned, from the `EulerRouter`, which maps asset pairs to providers, can resolve vault shares through `convertToAssets` and can send unresolved pairs to a fallback provider. The router can remain governed or be finalized.

Two details in the docs matter. The fallback is not automatic failover: if a configured provider reverts, the router propagates the error and does not switch. And interface prices may come from different sources than the vault's own onchain oracle, so a number on a screen is not the number the contract uses. The adapter library supports feeds from Chainlink, Chronicle, Pyth and RedStone, as well as onchain and rate-based sources. The [Chainlink page](/protocols/chainlink) explains one of them.

## Hooks

A vault can attach a **hook**: a target contract plus a bitfield of hooked operations, such as deposit, withdraw, transfer, borrow, repay or liquidation. When a hooked operation runs, the vault calls the target with the calldata. If the hook reverts, the whole operation reverts. A separate hook can check conditions when the EVC completes a batch. The docs list uses such as access control, emergency pauses and exposure limits.

The docs are clear about the cost: the hook target becomes part of the vault's security and availability boundary. A hook that can be paused or upgraded could block repayments, withdrawals or liquidations, so its code and its privileged roles are part of the review. The same caution applies as for [Balancer](/protocols/balancer) and [Uniswap v4](/glossary/hook/) hooks.

## Governance per vault

Authority is set per vault, not for the protocol. The docs distinguish governed vaults, where a governor or curator can change parameters such as collateral, caps, the rate model, the oracle, fees, hooks and liquidation settings, from **finalized** vaults, where the vault governor has been revoked. They warn that finalization is not the end of authority: a separately governed oracle router, a connected collateral vault or a hook can still change, and a vault behind an upgradeable beacon can still depend on the factory's upgrade administrator.

The [vault types guide](/guides/euler-vault-types) lists the categories and what to check for each. It also covers **EulerEarn** vaults, which hold one asset and allocate it across ERC-4626 strategies under an owner, curator, allocators and a guardian. That is the same curator structure as [Morpho's vaults](/concepts/isolated-markets-and-curation).

## Fees and history

The docs say Euler does not currently charge protocol fees. In April 2026 Fee Flow, the auction mechanism that sold collected fees for EUL, was turned off and protocol fees were set to zero across live and future deployments, with a DAO vote able to restore them. Curators and vault operators can still set vault-level fees such as interest fees and Earn performance fees.

Euler V1 was exploited in March 2023, and the docs say all user funds were recovered. V2 is a rebuild, not a patch. The docs warn against describing V2 as the exploited protocol, and also state that audits, monitoring and bounties make risk easier to identify and do not remove contract, oracle, governance, liquidity, market or operational risk.

## What remains trusted

The curator or governor of each vault, unless it is finalized, and every role connected to it. Each oracle route and the feeds behind it. Each hook. The factory's upgrade authority where a vault sits behind a beacon. The liquidity of both assets in a market, since liquidation depends on a liquidator being able to exit. And the EVC, a shared contract that every vault relies on. The modularity that lets teams launch markets quickly is also the reason that two vaults with the same name can have very different risks, and that no single page can describe a market without reading its configuration.
