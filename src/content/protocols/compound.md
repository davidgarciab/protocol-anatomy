---
title: "Compound"
seoTitle: "How Compound works: cTokens, Comet and absorb"
description: "How Compound III keeps one borrowable base asset per market, how absorb and buyCollateral liquidate, and how it differs from the pooled Compound v2 design."
summary: "Compound is a pooled lending protocol with two generations. Compound v2 turns every listed asset into a lendable, collateral-eligible cToken. Compound III, called Comet, gives each market one borrowable base asset and treats collateral as inert. Liquidation is an absorption by the protocol's reserves, followed by a collateral sale."
status: "published"
published: "2026-11-23"
lastVerified: "2026-11-23"
faq:
  - question: "What is different about Compound III compared with Compound v2?"
    answer: "A Compound III market has a single borrowable base asset, such as USDC on the first Ethereum deployment. Other assets can be supplied only as collateral, and collateral earns no interest and is not lent out. In Compound v2 every listed asset could be supplied to earn interest, used as collateral and borrowed."
    featured: true
  - question: "How does liquidation work in Compound III?"
    answer: "Anyone can call absorb on an underwater account. The protocol takes all of the account's collateral, credits the account with that collateral's value minus a penalty in the base asset, and lets reserves repay the debt. If reserves then sit below a governance target, buyCollateral sells the seized collateral to anyone at a discount."
    featured: true
  - question: "Do suppliers of collateral earn interest on Compound III?"
    answer: "No. The docs say collateral assets neither earn nor pay interest. Only the base asset does: a positive balance earns the supply rate and a negative balance pays the borrow rate. Both rates are functions of the base asset's utilization, each with its own kink, and governance sets the two models separately."
  - question: "Who controls a Compound III market?"
    answer: "The Timelock that also administers Compound v2. Governance proposals call the Configurator to change parameters and then deploy a new Comet implementation, because most parameters are stored as immutable values in the contract. Markets on other chains use a bridge receiver and a local timelock with an extra delay."
order: 11
category: "Lending"
mechanism: "Pooled borrowing against inert collateral, with one base asset per market, signed balances and a reserve-funded absorb liquidation."
versionContext: "Compound III is the current documented design and its first market is USDC on Ethereum. Compound v2 remains deployed and has its own documentation. Parameters, markets and governance proposals change, so this page describes mechanisms."
tags:
  - lending
  - interest
  - liquidation
concepts:
  - lending-utilization
  - interest-rate-models
  - collateral-and-liquidation
  - on-chain-accounting
  - oracles-and-dependencies
  - governance-and-upgrades
guides:
  - compound-versions
glossary:
  - comet
  - base-asset
  - absorb
  - ctoken
  - utilization
  - health-factor
  - bad-debt
versions:
  - name: "Compound v2"
    status: "released"
    note: "The cToken and Comptroller design, where each listed asset can be lent, used as collateral and borrowed. Its documentation lists deployed networks and notes that Compound III is now live."
  - name: "Compound III (Comet)"
    status: "active"
    note: "One borrowable base asset per market, inert collateral, signed principal balances and absorb-based liquidation. The first market is USDC on Ethereum."
sources:
  - title: "Compound III documentation"
    url: "https://docs.compound.finance/"
    kind: "docs"
    publisher: "Compound"
  - title: "Compound III: interest rates"
    url: "https://docs.compound.finance/interest-rates/"
    kind: "docs"
    publisher: "Compound"
  - title: "Compound III: collateral and borrowing"
    url: "https://docs.compound.finance/collateral-and-borrowing/"
    kind: "docs"
    publisher: "Compound"
  - title: "Compound III: liquidation"
    url: "https://docs.compound.finance/liquidation/"
    kind: "docs"
    publisher: "Compound"
  - title: "Compound III: governance"
    url: "https://docs.compound.finance/governance/"
    kind: "docs"
    publisher: "Compound"
  - title: "CometWithExtendedAssetList.sol"
    url: "https://github.com/compound-finance/comet/blob/main/contracts/CometWithExtendedAssetList.sol"
    kind: "code"
    publisher: "Compound"
  - title: "CometCore.sol"
    url: "https://github.com/compound-finance/comet/blob/main/contracts/CometCore.sol"
    kind: "code"
    publisher: "Compound"
  - title: "MarketUpdateProposer.sol"
    url: "https://github.com/compound-finance/comet/blob/main/contracts/marketupdates/MarketUpdateProposer.sol"
    kind: "code"
    publisher: "Compound"
  - title: "MarketUpdateTimelock.sol"
    url: "https://github.com/compound-finance/comet/blob/main/contracts/marketupdates/MarketUpdateTimelock.sol"
    kind: "code"
    publisher: "Compound"
  - title: "Compound v2: cTokens"
    url: "https://docs.compound.xyz/v2/ctokens/"
    kind: "docs"
    publisher: "Compound"
  - title: "Compound v2: Comptroller"
    url: "https://docs.compound.xyz/v2/comptroller/"
    kind: "docs"
    publisher: "Compound"
  - title: "CToken.sol in compound-protocol"
    url: "https://github.com/compound-finance/compound-protocol/blob/master/contracts/CToken.sol"
    kind: "code"
    publisher: "Compound"
  - title: "Comptroller.sol in compound-protocol"
    url: "https://github.com/compound-finance/compound-protocol/blob/master/contracts/Comptroller.sol"
    kind: "code"
    publisher: "Compound"
---

Compound lets an address lend an asset into a shared pool and lets another address borrow from it against collateral. Aave does the same, and the two are the reference designs for pooled lending. This page is about where Compound differs: a market built around a single borrowable asset, collateral that does nothing but sit, and a liquidation that the protocol performs itself.

The [versions guide](/guides/compound-versions) compares Compound v2 and Compound III contract by contract. This page follows Compound III, called Comet, because that is what the current documentation describes. It uses [Aave](/protocols/aave) as the comparison throughout, since the differences are easiest to see side by side.

## One base asset per market

A Compound III market is built around one **base asset**. The docs say accounts can supply crypto assets as collateral in order to borrow the base asset, and that accounts can earn interest by supplying the base asset. The first deployment is on Ethereum with USDC as the base asset. A market for another base asset is a separate deployment, with its own proxy, its own collateral list and its own parameters.

That is a large simplification compared with a multi-asset pool. In a pool where every asset can be borrowed, one account can borrow several assets against a basket of collateral that is itself being lent out, and the risk of each asset depends on the others. In Comet, the only debt anyone can owe is the base asset. The risk question for a market reduces to whether its collateral list is worth enough, at the prices its oracles report, to cover base-asset debt.

Collateral does not earn interest. The docs say so directly: collateral assets neither earn nor pay interest. They sit in the contract and are counted toward borrowing capacity. Nothing lends them out. That removes the case where a collateral asset's own lending market runs out of cash and a borrower cannot get it back, which is a real failure mode of the v2 design described later.

## Signed balances and indices

Comet stores one number per account for the base asset, a signed principal. A positive principal means the account has supplied the base asset. A negative one means it has borrowed. The docs give the conversion to a present balance:

```text
Balance = Principal * BaseSupplyIndex   when Principal > 0
Balance = Principal * BaseBorrowIndex   when Principal < 0
```

The principal is, in the docs' words, what the balance would have to be at time zero to equal today's balance after accruing interest. The two indices only grow, and an interaction updates them. This is the same trick as [Aave's liquidity index](/concepts/on-chain-accounting): nothing is written for each account when interest accrues. The contract has a notable consequence of using one signed field. An account cannot be both a supplier and a borrower of the base asset at once, because its principal has one sign. Supplying the base asset to an account with a debt repays the debt first, and the docs say a supply of the maximum uint value repays the whole base borrow balance.

Collateral balances are stored separately, per asset. The `supply` function does three jobs, depending on the asset: it adds collateral, supplies the base asset, or repays a borrow. `withdraw` is the mirror. It withdraws collateral that is not supporting a debt, withdraws supplied base asset, or borrows, if the account has enough collateral. The docs say a withdraw that leaves a borrow smaller than `baseBorrowMin` reverts.

## Interest rates

[Utilization](/glossary/utilization/) is total borrows divided by total supply of the base asset. The supply rate and the borrow rate are two separate functions of it, each set by governance, each with its own kink. Below the kink the rate rises with a low slope. Above it the rate rises with a high slope:

```text
rate = base + slopeLow * utilization                                 if utilization <= kink
rate = base + slopeLow * kink + slopeHigh * (utilization - kink)     otherwise
```

The same shape applies to both rates, with `supplyPerSecond...` and `borrowPerSecond...` parameters. Rates are per second, scaled by 1e18, and interest accrues every second from the block timestamp. The docs give 317100000 as roughly one percent per year in that scale.

The consequential difference from Aave's model is that the supply rate is not derived from the borrow rate. Aave computes what suppliers earn from what borrowers pay, utilization and the reserve factor. In Comet, governance configures two curves independently. The gap between what borrowers pay and suppliers earn is not forced by a formula, so it can be negative or positive at a given utilization. The docs say that difference accrues to reserves. A governance process that sets the two curves badly can run the reserves down. This is a design choice that favors simple, inspectable curves over a derived rate.

## What a borrow is checked against

Each collateral asset has a `borrowCollateralFactor`, the fraction of its value that can be borrowed. The docs' example is a factor of 85 percent for WBTC, so an account can borrow up to 85 percent of the value of the WBTC it has supplied, in the base asset. A separate, higher `liquidationCollateralFactor` determines when an account becomes liquidatable. The docs say this separation protects borrowers and the protocol, by giving every new position a price buffer, and lets governance reduce borrow factors without triggering liquidation of existing positions.

Two further limits protect the market. Each collateral has a `supplyCap`, and a supply is accepted only while the market is below it. And an account's opening borrow must be at least `baseBorrowMin`. In the contract, `isBorrowCollateralized` reports whether an account may borrow more, and `isLiquidatable` reports whether it is below the liquidation line. A false from the first does not imply a true from the second.

The number of collateral assets is bounded in code. In `CometCore.sol` the constant `MAX_ASSETS` is 15, and the `CometWithExtendedAssetList.sol` contract on the main branch sets `MAX_ASSETS_FOR_ASSET_LIST` to 24. A market's collateral list is therefore short by construction.

## Prices

Every collateral and the base asset has a price feed address in the market's configuration. The code reads it through the Chainlink interface:

```solidity
function getPrice(address priceFeed) override public view returns (uint256) {
    (, int price, , , ) = IPriceFeed(priceFeed).latestRoundData();
    if (price <= 0) revert BadPrice();
    return uint256(price);
}
```

That excerpt is from `contracts/CometWithExtendedAssetList.sol` on the `main` branch of the comet repository, as read on 23 November 2026, and `main` can move. In that version the function reverts for a price that is zero or negative. It does not itself check the age of the answer. Any staleness protection therefore lives in the feed the market was configured with. A feed that stops updating would leave the contract reading the last answer. The [Chainlink page](/protocols/chainlink) covers how feeds update and what their update rules do and do not promise.

## Liquidation: absorb, then sell

Compound III does not let a liquidator repay a borrower's debt and take collateral at a bonus. It has two steps that different parties pay for.

<diagram-placeholder name="comet-liquidation"></diagram-placeholder>

**Absorb.** When an account's debt exceeds what its collateral supports under the liquidation factors, any address can call `absorb(absorber, accounts)`. The contract takes the account's entire collateral balance for every asset it holds. For each asset it computes the collateral's value and multiplies by that asset's `liquidationFactor`. The sum, converted to the base asset, is credited to the account. The protocol's reserves of the base asset repay the debt. The docs describe the effect: the account's collateral is relinquished and the value, less a penalty, is returned to the user in the base asset, so the liquidated account has no remaining debt and typically a small supply balance left over.

The contract code makes the loss case explicit. If the credited value does not cover the debt, the new balance is set to zero and the shortfall is absorbed by reserves. In code:

```solidity
uint256 deltaBalance = divPrice(deltaValue, basePrice, uint64(baseScale));
int256 newBalance = oldBalance + signed256(deltaBalance);
// New balance will not be negative, all excess debt absorbed by reserves
if (newBalance < 0) {
    newBalance = 0;
}
```

That is the absorb logic in `absorbInternal`, from the same file and date. The absorber receives no collateral and no bonus. The docs say the caller has their gas noted through "liquidator points", and that compensation might come later through governance. Liquidation is therefore not an open market for profit in the way it is in Aave. It is a public chore that someone has to run, with the cost paid by the protocol's own reserves.

**Buy collateral.** Absorbing leaves the protocol holding collateral and having spent base-asset reserves. If reserves are below a governance-set `targetReserves`, anyone can call `buyCollateral`, paying base asset to receive collateral at a discount. If reserves are at or above the target, the call reverts with `NotForSale`. The discount is derived from two settings:

```text
discountFactor = storeFrontPriceFactor * (1 - liquidationFactor)
price paid     = collateral price * (1 - discountFactor)
```

The buyer provides a minimum amount of collateral to bound slippage. Reserves grow when base asset flows in. The collateral sale is where the market gets its money back, and the buyer's profit is the discount.

Two properties stand out when comparing with Aave. Liquidation is all or nothing: the whole position is absorbed in one call, with no close factor and no partial repayment. And the cost of a bad outcome falls on the market's reserves first. Reserves come from the gap between interest paid by borrowers and interest earned by suppliers, and from the collateral sales. If those reserves are exhausted, the shortfall is a loss to suppliers' claims, which the docs do not describe a separate mechanism for.

## Governance and upgrades

The docs say every Compound III instance is controlled by the Timelock, the same administrator as Compound v2. Governance controls each proxy, the Configurator implementation, the Comet factory and the Comet implementation. Because Comet stores most parameters as immutable values to save gas, changing one means the Timelock calls the Configurator's setter functions and then `deployAndUpgradeTo` on the proxy admin, which deploys a new implementation and points the proxy at it. A proposal that changes a collateral factor therefore replaces the market's logic contract.

Markets on other chains need access to prices and to governance messages that originate on Ethereum. Each deployment outside mainnet has a bridge receiver and a local timelock, and the docs say local timelocks add a delay before Comet admin functions run.

The comet repository on `main` also contains a `MarketUpdateProposer` and a `MarketUpdateTimelock`. The proposer's comments describe a `marketAdmin`, expected to be a multisig, that can propose market updates, with the main governor able to replace it and a guardian able to cancel proposals. The timelock enforces a minimum delay of two days, a maximum of 30 days and a 14-day grace period. This page records that the code exists. It does not claim that any deployment uses it, which has to be checked on chain.

## What remains trusted

The oracle for the base asset and for every collateral. The Timelock and the governance that sets collateral factors, caps, the two rate curves and `targetReserves`. The proxy admin, since the implementation can be replaced. The reserves, which are the first loss. And the liquidation keepers, who must call `absorb` and who are not paid by a bonus. A market with a thin collateral asset or a slow oracle can have an underwater account that nobody absorbs in time.

Compound's own docs ask users to exercise caution and say size, visibility and time are the test of a contract's security. The protocol has been audited by OpenZeppelin and ChainSecurity according to the docs, and an audit is not a guarantee of the economic assumptions listed here.
