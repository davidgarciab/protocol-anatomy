---
title: "Lending pools and utilization"
description: "How a shared lending pool measures utilization and why that ratio, not an order book, sets borrower competition."
summary: "A lending pool holds supplied assets and lends them to borrowers who posted collateral. Utilization is borrowed liquidity over supplied liquidity. It is the input to Aave’s interest curve and the reason a nearly empty pool and a nearly full pool are different credit markets."
status: "published"
published: "2026-10-13"
lastVerified: "2026-10-13"
order: 5
group: "credit"
tags:
  - lending
  - utilization
protocols:
  - aave
glossary:
  - utilization
  - atoken
  - variable-debt-token
related:
  - interest-rate-models
  - collateral-and-liquidation
  - on-chain-accounting
sources:
  - title: "Aave V3 interest rate strategy"
    url: "https://aave.com/docs/aave-v3/smart-contracts/interest-rate-strategy"
    kind: "docs"
    publisher: "Aave"
  - title: "Aave V3 Pool"
    url: "https://www.aave.com/docs/aave-v3/smart-contracts/pool"
    kind: "docs"
    publisher: "Aave"
  - title: "Aave V3 tokenization"
    url: "https://aave.com/docs/aave-v3/smart-contracts/tokenization"
    kind: "docs"
    publisher: "Aave"
  - title: "Aave V4 overview"
    url: "https://github.com/aave/aave-v4/blob/main/docs/overview.md"
    kind: "docs"
    publisher: "Aave"
---

A lending pool is not a liquidity pool in the AMM sense. Nobody swaps through an invariant. Suppliers offer assets. Borrowers remove them and leave a debt. The pool’s risk is that the debt is not repaid and the collateral is not worth enough. The pool’s price, if the word applies, is the interest rate.

[Aave](/protocols/aave) is the worked example on this site because its docs spell out the reserve, the aToken, and the debt token. Maker is the contrast: a vault’s rate is a governance parameter, not a function of how full a cash pool is. See [interest-rate models](/concepts/interest-rate-models).

## Utilization

Utilization is borrowed amount divided by the liquidity that could be borrowed. In the textbook reserve that is `debt / (available + debt)`. Aave’s strategy function is more careful. Its documented inputs include unbacked amounts and an optional virtual balance. An integration that computes utilization from token balances alone can disagree with the rate the pool is actually charging.

At low utilization the pool is full of idle cash. Suppliers earn little, because little interest is being paid. Borrowers can expand. At high utilization a withdrawal can fail or a borrow can move the rate sharply, because the cash is already lent. The steep region of the rate curve exists so that state does not persist quietly.

V4 does not throw this away. The hub overview says the drawn rate is still a utilization rate, and that liquidity swept into a reinvestment strategy stays in the denominator. Sweeping cash out must not look like a borrow. If it did, the act of investing idle funds would raise the borrow rate. That is a deliberate accounting choice, and it means “cash in the contract” and “liquidity in the utilization ratio” can differ when reinvestment is on.

## Claims

Suppliers in V3 hold [aTokens](/glossary/atoken/). Borrowers hold non-transferable [variable debt tokens](/glossary/variable-debt-token/). The pool contract is the place those claims are minted. V4’s overview uses shares at the hub instead of that token pair. The economic positions are the same shape: a supplied claim that grows, a debt that grows faster when the rate is higher. The contract you call is not the same object. The [version guide](/guides/aave-versions) is the map.

## What utilization does not measure

Utilization does not measure collateral quality. A market can be 80 percent utilized against safe collateral or against assets that are about to gap. V3 expresses collateral quality in loan-to-value and liquidation threshold. V4 adds a risk premium on the borrow rate. Neither number appears inside the word “utilization.”

Utilization also does not measure bad debt. Debt that is no longer backed still sits in the total until the protocol accounts for it. A high utilization caused by unpayable debt is not a signal that borrow demand is healthy. It is a sign the reserve’s assets and its liabilities have come apart. Liquidation is the mechanism that is supposed to prevent that. It is the next article in this sequence only in the sense that it is a different state machine: [collateral and liquidation](/concepts/collateral-and-liquidation).
