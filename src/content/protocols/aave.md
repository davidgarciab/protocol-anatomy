---
title: "Aave"
seoTitle: "How Aave works: V3 Pool accounting and V4 hub"
description: "How Aave accounts for supply, variable debt, interest, and liquidation in V3 markets and the V4 hub."
summary: "Aave is a pooled lending protocol. Suppliers deposit assets into shared liquidity, borrowers post collateral, and interest follows utilization. V3 records that state in one Pool. V4 splits shared liquidity from user-facing markets and prices collateral risk on top of the utilization rate."
status: "published"
published: "2026-10-13"
lastVerified: "2026-10-13"
faq:
  - question: "How does Aave pay interest to suppliers without sending tokens to each lender?"
    answer: "The reserve keeps a liquidity index. aToken balances are scaled, and the underlying amount is the scaled balance times the normalized income. Touching the reserve accrues the index forward using the time since the last update and the current rate, so a quiet block does not write every account."
  - question: "How does Aave set the variable borrow rate?"
    answer: "V3 uses a two-slope utilization model per reserve. Below an optimal utilization the rate rises with the first slope. Above it the second slope is steeper, so a market that is nearly fully borrowed becomes expensive quickly. The optimal utilization and the slopes are per reserve, not one Aave-wide constant."
  - question: "When can an Aave V3 position be liquidated?"
    answer: "When its health factor falls below 1, `liquidationCall` can repay debt and seize collateral. The V4 overview says V3’s default close factor is 50 percent, and 100 percent when the health factor is under 0.95 or the position is below a value threshold. The liquidator receives a bonus set on the collateral reserve."
  - question: "What changes in Aave V4 liquidation?"
    answer: "Instead of a default 50 percent close factor, a liquidator repays enough to restore a target health factor, unless dust-handling rules force a larger repayment. The bonus increases as the health factor falls, and the overview sets the dust threshold at 1,000 USD of value."
order: 1
category: "Lending"
mechanism: "Pooled overcollateralized borrowing, with utilization-based interest and collateral liquidation."
versionContext: "V3 markets remain a production architecture. V4 activated on Ethereum mainnet on 30 March 2026 and was still being expanded, with caps, in September 2026."
tags:
  - lending
  - interest
  - liquidation
concepts:
  - lending-utilization
  - interest-rate-models
  - collateral-and-liquidation
  - on-chain-accounting
  - flash-liquidity
  - oracles-and-dependencies
  - governance-and-upgrades
guides:
  - aave-versions
glossary:
  - atoken
  - variable-debt-token
  - health-factor
  - utilization
  - hub
  - risk-premium
versions:
  - name: "V2"
    status: "historical"
    note: "The lending-pool generation before the V3 Pool. It is documented in the protocol-v2 repository, not in the V4 hub."
  - name: "V3"
    status: "active"
    note: "Pool, aToken, and variable-debt-token markets. Stable-rate borrows are deprecated in the current pool interface."
  - name: "V4"
    status: "active"
    note: "Hub-and-spoke deployment. Ethereum activation was 30 March 2026. September 2026 governance updates describe further network expansion under caps."
sources:
  - title: "Aave V4 overview"
    url: "https://github.com/aave/aave-v4/blob/main/docs/overview.md"
    kind: "docs"
    publisher: "Aave"
  - title: "Aave V3 smart contracts"
    url: "https://aave.com/docs/developers/smart-contracts"
    kind: "docs"
    publisher: "Aave"
  - title: "Aave V3 Pool"
    url: "https://www.aave.com/docs/aave-v3/smart-contracts/pool"
    kind: "docs"
    publisher: "Aave"
  - title: "Aave V3 interest rate strategy"
    url: "https://aave.com/docs/aave-v3/smart-contracts/interest-rate-strategy"
    kind: "docs"
    publisher: "Aave"
  - title: "Aave V3 tokenization"
    url: "https://aave.com/docs/aave-v3/smart-contracts/tokenization"
    kind: "docs"
    publisher: "Aave"
  - title: "Pool.sol in aave-v3-core"
    url: "https://github.com/aave/aave-v3-core/blob/master/contracts/protocol/pool/Pool.sol"
    kind: "code"
    publisher: "Aave"
  - title: "Aave V4 activation on Ethereum mainnet"
    url: "https://governance.aave.com/t/arfc-aave-v4-activation-on-ethereum-mainnet/24293"
    kind: "governance"
    publisher: "Aave Governance"
  - title: "Aave Labs development update, April 2026"
    url: "https://governance.aave.com/t/al-development-update-april-2026/24821"
    kind: "governance"
    publisher: "Aave Labs"
  - title: "Aave Labs development update, September 2026"
    url: "https://governance.aave.com/t/al-development-update-september-2026/25744"
    kind: "governance"
    publisher: "Aave Labs"
---

Aave lets an address lend assets into a shared pool and lets another address borrow from that pool without finding a specific counterparty. The protocol’s job is the accounting around that pool: who supplied what, who owes what, how interest accrues, and when collateral can be seized.

This page describes the V3 market that the current Aave developer docs still document, then the V4 hub that governance activated on Ethereum mainnet on 30 March 2026. The [version guide](/guides/aave-versions) compares the two designs. Parameter values such as loan-to-value and caps are governance settings, not constants of the mechanism, so they are not copied here.

## Who uses it

Suppliers transfer an underlying token and receive a claim on the pool plus the interest that borrowers pay. Borrowers lock collateral and receive the borrowed token. Liquidators repay someone else’s debt when a [health factor](/glossary/health-factor/) check fails and receive collateral in return. Governance, through the Aave DAO and the roles it grants, chooses reserves, risk parameters, and which contracts may change configuration. Oracle publishers provide prices. None of those prices are computed by the lending invariant itself.

In V4 there is a further split. Users call a spoke. The spoke draws liquidity from a hub. The [V4 overview](https://github.com/aave/aave-v4/blob/main/docs/overview.md) describes the hub as the liquidity and accounting core, and the spoke as the user-facing market.

## What V3 stores

A V3 market is organized around the `Pool`. The developer docs describe it as the main entry point. Supply, borrow, repay, and withdraw go through it. Configuration writes go through `PoolConfigurator`, and only addresses that hold roles in `ACLManager` can make those writes. `PoolAddressesProvider` is the registry that points at the pool, the ACL manager, and the oracle, and it can retarget proxy implementations.

The tokenization docs describe two claims:

- An [aToken](/glossary/atoken/) is minted on supply and burned on withdraw. Its balance grows with supply interest, so a transfer of aTokens transfers a growing claim, not a frozen deposit receipt.
- A [variable debt token](/glossary/variable-debt-token/) is minted on borrow. It is not transferable. Its balance is the debt plus accrued variable interest. The pool reference says new borrows should pass interest-rate mode `2`. Stable-rate mode is deprecated in that interface.

`supply` does not itself contain the interest math. In `aave-v3-core`, the pool delegates to a supply library:

```solidity
function supply(
    address asset,
    uint256 amount,
    address onBehalfOf,
    uint16 referralCode
) public virtual override {
    SupplyLogic.executeSupply(
        _reserves,
        _reservesList,
        _usersConfig[onBehalfOf],
        DataTypes.ExecuteSupplyParams({
            asset: asset,
            amount: amount,
            onBehalfOf: onBehalfOf,
            referralCode: referralCode
        })
    );
}
```

That excerpt is from `contracts/protocol/pool/Pool.sol` on the `master` branch of `aave-v3-core`, as read on 13 October 2026. `master` can move. The call is the important part: the user’s asset, the recipient of the aToken, and a referral code enter one reserve update. The referral argument is unused for rewards in the current docs; they say to pass `0`.

Interest is not paid by transferring tokens to each lender. The reserve keeps a liquidity index. aToken balances are scaled, and the underlying amount is the scaled balance times the normalized income. The same idea applies to variable debt and the borrow index. Touching the reserve accrues the index forward using the time since the last update and the current rate. A quiet block does not write every account.

<diagram-placeholder name="lending-flow"></diagram-placeholder>

## How the rate is chosen

[Utilization](/glossary/utilization/) is the fraction of available liquidity that is borrowed. The [interest-rate strategy](https://aave.com/docs/aave-v3/smart-contracts/interest-rate-strategy) is a two-slope model. Below an optimal utilization, the variable borrow rate rises with the first slope. Above it, the second slope is steeper, so a market that is nearly fully borrowed becomes expensive quickly. That cost is meant to pull liquidity back in or push borrowers to repay.

The strategy returns a liquidity rate and a variable borrow rate, both in ray units (1e27). The [reserve factor](/glossary/reserve-factor/) sends a share of borrow interest to the treasury, so suppliers do not receive the full borrow rate times utilization. The strategy’s inputs also include unbacked liquidity and, when enabled, a virtual underlying balance. Those inputs matter for integrations that assume the textbook ratio `debt / (cash + debt)` is the only definition. Read the reserve’s strategy before hard-coding a formula.

The optimal utilization and the slopes are per reserve. They are not a single Aave-wide constant.

## When a borrow is allowed, and when it is not

Before a borrow is released, the pool checks that the resulting position stays within collateral rules. Collateral value is not the raw oracle value. A liquidation threshold, lower than 100 percent for risky assets, determines how much of that value counts toward solvency. A separate, usually lower, loan-to-value limits new borrowing. A position can be blocked from borrowing more and still be above the liquidation line.

The health factor compares risk-adjusted collateral with debt. The V4 documentation, describing the V3 behavior it replaces, treats a health factor of 1 as the liquidation boundary. Below that, `liquidationCall` can repay debt and seize collateral. The V4 overview says V3’s default close factor is 50 percent, and 100 percent when the health factor is under 0.95 or the position is below a value threshold. The liquidator receives a bonus set on the collateral reserve. A protocol fee can take part of that bonus.

If the collateral cannot cover the debt, the remainder is [bad debt](/glossary/bad-debt/). The pool cannot invent assets to fill it. Later suppliers and the reserve’s own accounting bear that loss until governance does something else.

V3 also added constraints that are easy to miss from the happy-path functions:

- Efficiency mode groups correlated assets so a position can use tighter risk parameters than the general market.
- Isolation mode limits what a risky collateral can borrow against, and caps that debt.
- Supply caps and borrow caps stop a reserve from growing without a configuration change.
- A price-oracle sentinel can block some actions after an oracle outage and allow a grace period once prices return.

Those are configuration features of the V3 pool, not properties of every lending protocol. The [collateral and liquidation](/concepts/collateral-and-liquidation) article compares them with Maker’s vault rule.

## What V4 changes in the accounting

V4 does not give every market its own isolated pool of cash. The [overview](https://github.com/aave/aave-v4/blob/main/docs/overview.md) defines a hub that holds liquidity and spokes that users call. A spoke routes `supply`, `withdraw`, `borrow`, and `repay` to a hub subject to add caps and draw caps. Several spokes can share one hub. The overview says the hub is immutable and the spokes are upgradeable.

<diagram-placeholder name="hub-spoke"></diagram-placeholder>

The drawn interest rate still comes from utilization at the hub. On top of it, V4 charges a [risk premium](/glossary/risk-premium/) that depends on the collateral actually covering the debt. Collateral is sorted from lower collateral-risk to higher. The premium uses the safer collateral first. The overview is explicit that actions which can make the position riskier, such as borrowing or withdrawing collateral, refresh the premium, while `supply` and `repay` do not. Premium interest is tracked as extra debt shares plus an offset, so it accrues without being a second principal the user drew from the hub.

Liquidation changes as well. Instead of a default 50 percent close factor, a liquidator repays enough to restore a target health factor, unless dust-handling rules force a larger repayment. The bonus increases as the health factor falls. The overview sets the dust threshold used in that logic at 1,000 USD of value. Deficit accounting lets an authorized spoke cover a shortfall with supplied shares through `eliminateDeficit`.

Two further V4 behaviors are governance decisions, not automatic features of every hub:

- Dynamic risk configuration can leave existing positions on an older collateral factor when parameters change. A health-decreasing action can rebind the position to the latest configuration only if it would still be solvent.
- A reinvestment module can sweep idle hub liquidity to an external strategy. The overview says swept funds stay inside the utilization denominator, and that strategy losses are assigned to the governor rather than directly to suppliers. Suppliers opt in by choosing a reserve connected to a hub asset that has reinvestment enabled.

The April 2026 development update says the Ethereum deployment went live on 30 March 2026 with conservative caps and without an incentives program. The September 2026 update reports deposits above $1 billion and about $310 million of active loans, plus deployments beyond Ethereum, and says risk stewards were activated by AIP 523. Those figures are the update’s figures. They are not a live balance this site queries.

## Governance, upgrades, and trust

V3 market logic sits behind addresses the `PoolAddressesProvider` can change. An upgrade can alter user-facing behavior at the same pool address. V4’s hub is documented as immutable, which removes one upgrade path for the shared accounting, but spokes are upgradeable and the governor still sets caps, premiums, oracles, and emergency state. Immutability of the hub is not the absence of administration.

Solvency in both versions depends on oracle prices. A spoke in V4 uses its own oracle configuration, so two spokes can price the same asset differently. The interest model assumes that liquidators and suppliers respond to rates. If they do not, utilization can sit on the steep slope or a deficit can remain after liquidation.

The [security assumptions](/concepts/security-assumptions) page lists the general pattern. For Aave specifically, the assumptions that most often matter to an integrator are: the oracle, the upgrade keys on V3 and on V4 spokes, the governance process that sets risk parameters, and, where enabled, the external reinvestment strategy.

## What this page does not decide

Listing a reserve, a caps number, or a health-factor formula from a single market would go stale on the next governance payload. The [V3 contract docs](https://aave.com/docs/developers/smart-contracts) point at the address book for live deployments. The on-chain configurator is the place to read live parameters. This site explains the state those parameters act on.
