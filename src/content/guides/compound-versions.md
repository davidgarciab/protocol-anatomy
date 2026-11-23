---
title: "Compound v2 and Compound III"
seoTitle: "Compound v2 vs Compound III: cTokens, Comet and risk"
description: "What changed from Compound v2's cTokens and Comptroller to Compound III's single base asset, inert collateral and absorb liquidation, and what to check on a market."
summary: "Compound v2 and Compound III share a name and a governance Timelock but little else. v2 is a multi-asset pool whose deposits are cTokens that earn, collateralize and get lent. III is a set of single-base-asset markets whose collateral earns nothing. They fail in different places, so a market's version decides which risks apply."
status: "published"
published: "2026-11-23"
lastVerified: "2026-11-23"
faq:
  - question: "Is a cToken the same thing as a Compound III balance?"
    answer: "No. A cToken is an ERC-20 whose exchange rate against the underlying rises as the market accrues interest, and holding it also lets the owner enter the market as collateral. A Compound III base-asset balance is a signed number stored inside the Comet contract, converted with an index, and it is not a transferable token."
    featured: true
  - question: "Can the same asset be both collateral and earn interest in Compound III?"
    answer: "Not in the same role. The base asset earns interest when supplied. Other assets supplied as collateral earn nothing and are not lent out. In Compound v2 a supplied asset could do both, because the cToken accrued interest while the account used it as collateral."
  - question: "Why does the exchange rate of a cToken only go up?"
    answer: "Its rate is cash plus total borrows minus total reserves, divided by cToken supply. Interest on borrows raises total borrows without minting cTokens, so the rate rises while there is no loss. If a borrower's debt were written off, borrows would fall and the rate would too."
order: 11
protocol: "compound"
versionContext: "Both designs are documented in Compound's own docs, and the v2 docs now point to Compound III as the current protocol. The comet repository main branch has moved past the earliest Comet source, so check the contract a given market actually runs."
tags:
  - compound
  - versions
  - lending
concepts:
  - lending-utilization
  - collateral-and-liquidation
  - interest-rate-models
glossary:
  - ctoken
  - comet
  - base-asset
  - absorb
  - bad-debt
relatedGuides: []
versions:
  - name: "Compound v2"
    status: "released"
    note: "cTokens per asset, a Comptroller that sets collateral factors, close factor and liquidation incentive, per-block rates, and liquidation by third parties who repay debt for collateral at a bonus."
  - name: "Compound III (Comet)"
    status: "active"
    note: "One base asset per market, inert collateral, signed principal balances, per-second rates, and absorb followed by buyCollateral."
sources:
  - title: "Compound v2: cTokens"
    url: "https://docs.compound.xyz/v2/ctokens/"
    kind: "docs"
    publisher: "Compound"
  - title: "Compound v2: Comptroller"
    url: "https://docs.compound.xyz/v2/comptroller/"
    kind: "docs"
    publisher: "Compound"
  - title: "Compound v2 documentation"
    url: "https://docs.compound.xyz/v2/"
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
  - title: "Compound III documentation"
    url: "https://docs.compound.finance/"
    kind: "docs"
    publisher: "Compound"
  - title: "Compound III: liquidation"
    url: "https://docs.compound.finance/liquidation/"
    kind: "docs"
    publisher: "Compound"
  - title: "Compound III: collateral and borrowing"
    url: "https://docs.compound.finance/collateral-and-borrowing/"
    kind: "docs"
    publisher: "Compound"
  - title: "CometWithExtendedAssetList.sol"
    url: "https://github.com/compound-finance/comet/blob/main/contracts/CometWithExtendedAssetList.sol"
    kind: "code"
    publisher: "Compound"
---

"Compound" can mean two different contract sets. The [protocol page](/protocols/compound) explains the current design. This guide maps the two, because an integrator or a reader of a risk report who writes "Compound" has not said which one.

## The map

| | Compound v2 | Compound III (Comet) |
| --- | --- | --- |
| Unit of deposit | A cToken per asset, transferable | A balance inside the market contract |
| What can be borrowed | Any listed asset | The market's single base asset |
| Collateral earns interest | Yes, it is a cToken | No |
| Who sets risk parameters | The Comptroller, per market | The Configurator, per collateral asset |
| Rates | Per block, from an interest rate model per cToken | Per second, two separate curves for supply and borrow |
| Liquidation | A third party repays part of a borrow and receives collateral at a bonus | Anyone absorbs the account, then anyone can buy the collateral |
| First loss | The suppliers of the affected markets | Protocol reserves, then suppliers |

## cTokens

In v2 each asset has its own market contract, a cToken. A supplier mints cTokens and the docs say they earn interest through the cToken's exchange rate, which increases in value relative to the underlying, and gain the ability to use cTokens as collateral. The exchange rate in `CToken.sol` is:

```text
exchangeRate = (totalCash + totalBorrows - totalReserves) / totalSupply
```

That excerpt is from `contracts/CToken.sol` on the `master` branch of `compound-protocol`, read on 23 November 2026. Borrow interest raises `totalBorrows`, so each cToken becomes worth more underlying while the cToken balance stays still. This is the same idea as an Aave aToken's liquidity index, expressed as a token price instead of a growing balance. An integration that wants the underlying value multiplies the cToken balance by the exchange rate.

The consequence of the v2 design is that deposits are both lent and collateral. A borrower's collateral is therefore also someone's lent asset, and if the market's cash is borrowed out, collateral can be hard to redeem. A depositor who is also a borrower is exposed to each asset in their basket, including the assets they only meant to hold as collateral.

## The Comptroller

The Comptroller sets, per market, the collateral factor, and sets protocol-wide a close factor and a liquidation incentive. In the code read, the close factor is bounded between 0.05 and 0.9 and the collateral factor has a maximum of 0.9. The v2 docs describe the close factor as the share of a liquidatable account's borrow that can be repaid in one liquidate transaction, applied to any single borrowed asset, not to the aggregate.

A v2 liquidator therefore repays some portion of one borrowed asset and receives the borrower's collateral, which the liquidator chooses from among what the borrower supplied, plus an incentive. Liquidation is a profitable action for the liquidator, which is why third parties perform it, and also why incentive settings are a tradeoff between speed of repair and cost to the borrower.

## Comet

Compound III replaces all of this with one contract per market. There is no cToken, no per-asset market and no close factor. The [protocol page](/protocols/compound) covers the mechanism. In terms of the comparison above, the three differences that matter are:

1. **Collateral is inert.** It earns nothing, and it cannot be borrowed by anyone else. A collateral asset's problems stay on its own balance and do not spread through a lending market.
2. **Liquidation is a protocol operation.** `absorb` takes all collateral and spends reserves to repay debt. The absorber earns no bonus. `buyCollateral` later sells the collateral at a discount, only while reserves are under their target.
3. **Parameters are constants.** Changing one means deploying a new implementation through the Configurator, which governance does by proposal.

## What to check before relying on a name

1. Does the interface call a cToken address or a Comet proxy? A proxy address that the docs list for a market is the only address to use for a Compound III instance.
2. In Compound III, which asset is the base asset, and which assets are collateral? An asset supplied as collateral is not earning.
3. Which price feed does the market use for each asset, and what are its update rules? The contract reads the answer, and the version of `getPrice` read for this site does not check its age.
4. What are the market's `targetReserves` and current reserves? That is what decides whether liquidation proceeds are being recycled or whether `buyCollateral` has been turned off.

The [liquidation comparison](/compare/liquidation-compared) sets out how other protocols liquidate, and the [collateral and liquidation concept page](/concepts/collateral-and-liquidation) explains the general trade-offs.
