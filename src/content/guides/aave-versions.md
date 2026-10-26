---
title: "Aave from the V3 Pool to the V4 hub"
description: "What changed in Aave’s accounting, risk, and liquidation between the V3 Pool and the V4 hub-and-spoke design."
summary: "V3 gathers supply and debt for a market inside one Pool and reprices every position when risk parameters change. V4 keeps utilization interest at an immutable hub, lets spokes define markets, and adds a collateral risk premium plus a target-health-factor liquidation."
status: "published"
published: "2026-10-13"
lastVerified: "2026-10-26"
changes:
  - date: "2026-10-26"
    summary: "Updated the V4 status to the September 2026 update’s network list and corrected who can refresh a position’s dynamic risk configuration."
order: 1
protocol: "aave"
versionContext: "V3 remains the documented Pool architecture. V4 has been active on Ethereum since 30 March 2026, alongside continued V3 markets."
tags:
  - aave
  - versions
  - liquidation
concepts:
  - lending-utilization
  - interest-rate-models
  - collateral-and-liquidation
  - governance-and-upgrades
glossary:
  - hub
  - spoke
  - risk-premium
  - close-factor
  - health-factor
relatedGuides:
  - maker-to-sky
versions:
  - name: "V2"
    status: "historical"
    note: "Lending-pool generation in the protocol-v2 repository, before the V3 Pool and its configurator."
  - name: "V3"
    status: "active"
    note: "Single Pool per market, aTokens, variable debt tokens, eMode, isolation mode, and a close factor."
  - name: "V4"
    status: "active"
    note: "Hub and spokes. Activated on Ethereum mainnet on 30 March 2026. The September 2026 update lists it on Ethereum, Avalanche, Base, and Arc, under caps."
sources:
  - title: "Aave V4 overview"
    url: "https://github.com/aave/aave-v4/blob/main/docs/overview.md"
    kind: "docs"
    publisher: "Aave"
  - title: "Aave V3 Pool"
    url: "https://www.aave.com/docs/aave-v3/smart-contracts/pool"
    kind: "docs"
    publisher: "Aave"
  - title: "Aave V3 smart contracts"
    url: "https://aave.com/docs/developers/smart-contracts"
    kind: "docs"
    publisher: "Aave"
  - title: "Aave V4 activation proposal"
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
  - title: "protocol-v2 repository"
    url: "https://github.com/aave/protocol-v2"
    kind: "code"
    publisher: "Aave"
---

Aave did not replace a token. It replaced the way a market shares liquidity and the way a liquidation chooses its size. V2, in the `protocol-v2` repository, is the lending-pool generation that introduced aToken interest and debt tokens before the V3 `Pool`. This guide focuses on V3 and V4, because those are the two architectures with current primary documentation. V2 is historical context, not a third design to integrate as if it were the hub.

The [Aave overview](/protocols/aave) walks through one market. The differences below are the ones that change an integration.

## One pool, or a hub with markets attached

In V3, a market’s cash, debt, and configuration live with a single `Pool`. The address provider points at that pool and can change its implementation. Listing a new asset means initializing a reserve on that pool: an aToken, a variable debt token, and an interest strategy. Liquidity does not automatically serve a second market. A separate deployment is a separate pool, which is why Ethereum, an L2, and a fork can share code and not share cash.

V4’s overview inverts that. The hub holds the liquidity and the utilization rate. Spokes are the markets. A spoke can be added, and the overview’s stated reason is to avoid migrating liquidity every time a borrowing mode is added or removed. Caps still stop a spoke from draining the hub. The activation proposal describes the hub as immutable and the spokes as upgradeable. That split is the security claim: the shared accounting is frozen, the product surface is not.

An integrator that cached “the pool address” for V3 cannot point that name at V4. Users call a spoke. The hub is not the aToken minter described in the V3 tokenization docs. V4’s overview speaks in supplied shares and drawn shares. The activation proposal also describes a Tokenized Spoke that wraps a supply position as an ERC-4626 and does not enable borrowing on that spoke. That wrapper is a spoke, not a V3 aToken and not the hub’s internal share account. Read the spoke that minted a balance before treating it as either one.

## One borrow rate, or a rate plus a premium

V3’s variable borrow rate is a property of the reserve. Two borrowers of the same asset in the same market pay the same rate for new variable debt, whatever collateral they posted. Collateral quality shows up in loan-to-value and liquidation threshold, not in the interest formula. The [interest-rate model](/concepts/interest-rate-models) is the two-slope utilization curve.

V4 keeps a drawn rate from hub utilization and adds a [risk premium](/glossary/risk-premium/) from collateral composition. The overview’s algorithm sorts collateral by a collateral-risk parameter, covers the debt with safer collateral first, and sets the premium from that weighted slice. The premium accrues as extra debt shares. It is not a second token and it is not principal that was transferred out of the hub. Refreshing it is tied to risk-increasing actions. A supplier who only repays does not, in the average case the overview describes, get a new premium automatically.

The practical consequence: a V4 borrow quote is not “the USDC draw rate.” It is the draw rate plus a premium that can change when the user’s collateral mix or the collateral-risk parameters change.

## Parameters that bind everyone, or parameters that bind a position

The V4 overview calls out a V3 limitation directly: one risk configuration per asset. Lowering a liquidation threshold hits every open position. V4 stores collateral factor, maximum liquidation bonus, and liquidation fee in dynamic configuration keys. New positions bind to the latest key. Older positions keep their key until a risk-increasing action rebinds them, and that rebind is refused if the latest configuration would leave them under-collateralized. Governance can still overwrite an old key, and the overview says the Governor or the user can refresh a position’s configuration with `updateUserDynamicConfig`. The default path is the conservative one.

This is closer to “existing loans keep their covenant unless you touch them” than V3’s “the reserve’s threshold is the position’s threshold.” It is not a promise that governance cannot touch an old key.

## Close factor, or target health factor

V3 liquidations are sized by a close factor. The V4 overview states the V3 defaults it is replacing: 50 percent of the debt in the ordinary case, and 100 percent when the health factor is below 0.95 or the position is under a value cutoff. The liquidation bonus on the collateral is a static parameter. A liquidator cannot choose “just enough to make the position healthy” as the protocol’s own target. They repay up to the close factor.

V4 removes that default. The liquidator repays what is required to reach a spoke-wide target health factor, which must be at least the liquidation threshold of 1. A Dutch-style bonus then pays more as the health factor falls, between a minimum set by `liquidationBonusFactor` and the collateral’s maximum bonus. Dust rules can enlarge the repayment so a position is not left with a tiny remainder. The overview sets that dust threshold at 1,000 USD of value. If collateral is gone and debt remains, the shortfall is a deficit. Another spoke can cover it by spending supplied shares through `eliminateDeficit`.

The bonus formula in the overview is linear between the liquidation threshold and `healthFactorForMaxBonus`. It is a function of health factor at the start of the call, not an on-chain auction that runs across blocks. “Dutch auction” in that document is the shape of the bonus, and it should not be confused with Maker’s collateral auction.

## What did not change

Borrowers still post collateral. Suppliers still earn from borrower interest, minus whatever share governance takes. Solvency still depends on oracle prices, which V4 makes spoke-specific. Interest is still lazy: indexes or share prices move when the reserve is touched, not on every block. A health factor below 1 is still the documented liquidation boundary.

V4 also did not, on the evidence of the 2026 updates, switch V3 off. The April update describes a guarded launch with caps. The September update describes deposits reported above $1 billion, about $310 million of loans, V4 on Avalanche, Base, and Arc as well as Ethereum, and risk stewards activated through AIP 523 to move routine parameters inside bounds. Caps and stewards are operational controls around the new architecture. They are not part of the invariant.

## Migration, stated narrowly

A V3 aToken is a claim on a V3 pool. It is not a V4 hub share. Moving funds is a withdraw on one system and a supply on the other, subject to caps and to whatever liquidity the V3 pool has. Nothing in the V4 overview describes an automatic conversion of aToken balances. Credit delegation, isolation mode, and efficiency mode are V3 configuration tools. V4’s equivalents, where they exist, are spoke configuration and collateral risk, and they should be read from the spoke rather than assumed to share V3’s names.
