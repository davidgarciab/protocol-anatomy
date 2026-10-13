---
title: "Liquidity pools and LP shares"
description: "How a liquidity provider’s claim is tracked in Uniswap v2, Uniswap v3 and v4, and Curve NG pools."
summary: "A liquidity pool holds the reserves a swap trades against. The LP share is the claim on those reserves and on fees. Uniswap v2 uses a fungible token, v3 an NFT, v4 ERC-6909 accounting, and Curve NG the pool contract itself."
status: "published"
published: "2026-10-13"
lastVerified: "2026-10-13"
order: 2
group: "markets"
tags:
  - liquidity
  - lp
protocols:
  - uniswap
  - curve
glossary:
  - liquidity-pool
  - lp-share
  - concentrated-liquidity
related:
  - automated-market-makers
  - constant-product
  - concentrated-liquidity
sources:
  - title: "How Uniswap works"
    url: "https://docs.uniswap.org/contracts/v2/concepts/protocol-overview/how-uniswap-works"
    kind: "docs"
    publisher: "Uniswap"
  - title: "Concentrated liquidity"
    url: "https://docs.uniswap.org/concepts/protocol/concentrated-liquidity"
    kind: "docs"
    publisher: "Uniswap"
  - title: "Integrating Stableswap-NG"
    url: "https://docs.curve.finance/developer/integration/stableswap-ng"
    kind: "docs"
    publisher: "Curve"
  - title: "Uniswap v4 architecture"
    url: "https://developers.uniswap.org/docs/protocols/v4/concepts/architecture"
    kind: "docs"
    publisher: "Uniswap"
---

The pool is the inventory. The LP share is the receipt. Confusing them causes two integration bugs: treating the receipt as if it were the original deposit, and treating every receipt as an ERC-20.

## Inventory changes underneath the receipt

A swap sells one reserve for the other. Fees, depending on the design, either stay in the reserves or accrue to the position. After enough trading, a provider who deposited equal value can withdraw mostly one asset. The receipt did not malfunction. It is a claim on the current inventory, including fees and excluding what traders took out.

That inventory risk has a name in constant-product markets, divergence or impermanent loss, but the accounting fact is simpler than the name. The LP is short the move. Fees are the compensation. If fees do not cover the inventory change, the position lost value relative to holding the deposited tokens. No invariant promises otherwise.

## Four receipts

Uniswap’s overview draws the version line clearly.

v2 mints a fungible ERC-20. Balance is proportional share. Fees increase reserve value per token. Two holders can be pooled, transferred, and composed like any other token. The cost of that simplicity is that nobody chooses a price range.

v3 mints an ERC-721 through `NonfungiblePositionManager` because a range is part of the position. The NFT is not a share of the whole pool. It is a share of liquidity between two [ticks](/glossary#tick). Two NFTs in one pool can be in different ranges and earn different fees. They should not be added together as if they were v2 LP tokens.

v4’s overview moves the receipt again, to `PositionManager` and ERC-6909. The architectural idea is the same as v3’s range. The token standard is not. ERC-6909 lets one contract track many token ids. An indexer that only listens for ERC-721 transfers will not see a v4 position.

Curve Stableswap-NG collapses pool and LP token into one contract. The integration guide says so. Transfers of the pool’s own token are transfers of LP claims. A metapool then treats some other pool’s LP token as one of its coins. That is composition of receipts: the metapool’s inventory includes a claim on a second inventory. Withdrawing one coin from the metapool can require the base pool to unwind.

## Shares are not deposits

Lido also uses the word share, for a different pool. An stETH share is a claim on pooled ether, not on an AMM’s two reserves. Aave’s scaled aToken balance is a claim on a lending reserve. The [accounting](/concepts/on-chain-accounting) article lines those up. The word “LP token” should stay with AMM receipts.

When a protocol lists an LP token as collateral, it is pricing this receipt. The price has to understand the inventory underneath, including a range that might be out of the money or a StableSwap pool that is holding a depegged coin. The ERC-20 interface will not say which of those is true.
