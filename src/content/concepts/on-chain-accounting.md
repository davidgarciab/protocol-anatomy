---
title: "On-chain accounting"
description: "Why these protocols store scaled balances, normalized debt, and shares instead of rewriting every account."
summary: "Aave scales aToken balances by a liquidity index. Maker stores normalized vault debt and multiplies by a rate. Lido prices shares by pooled ether. Curve accounts LP claims against the invariant D. The pattern is one global multiplier, updated lazily, instead of a transfer to every holder."
status: "published"
published: "2026-10-13"
lastVerified: "2026-10-13"
order: 13
group: "engineering"
tags:
  - accounting
  - shares
protocols:
  - aave
  - maker-sky
  - lido
  - curve
glossary:
  - liquidity-index
  - normalized-debt
  - share
  - erc-4626
related:
  - interest-rate-models
  - liquid-staking
  - liquidity-pools
sources:
  - title: "Aave V3 tokenization"
    url: "https://aave.com/docs/aave-v3/smart-contracts/tokenization"
    kind: "docs"
    publisher: "Aave"
  - title: "Vat detailed documentation"
    url: "https://docs.makerdao.com/smart-contract-modules/core-module/vat-detailed-documentation"
    kind: "docs"
    publisher: "MakerDAO"
  - title: "Lido tokens integration guide"
    url: "https://github.com/lidofinance/docs/blob/main/docs/guides/lido-tokens-integration-guide.md"
    kind: "docs"
    publisher: "Lido"
  - title: "Integrating Stableswap-NG"
    url: "https://docs.curve.finance/developer/integration/stableswap-ng"
    kind: "docs"
    publisher: "Curve"
  - title: "sUSDS"
    url: "https://developers.skyeco.com/protocol/tokens/susds/"
    kind: "docs"
    publisher: "Sky"
---

These protocols cannot write every balance on every block. They store a small position and a global index, and they compute the current value when someone looks. The bugs that follow are all the same bug: reading the stored number as if it were the current value, or updating one index and not the other.

## Three multipliers

An Aave aToken balance is a scaled balance times the reserve’s [liquidity index](/glossary#liquidity-index). The tokenization docs describe the user-visible effect: the balance grows as interest accrues, without a transfer. Variable debt uses the borrow index. If you store a user’s aToken `balanceOf` in your own contract and later assume the stored number is still their claim, you have frozen a moving target. If you try to rebase your own ledger by transferring aTokens in proportion to interest, you will fight the token that is already rebasing.

A Maker urn stores `art`, not the DAI owed. The owed amount is `art` times the ilk `rate`. `Jug.drip` changes `rate` once. Every vault is updated conceptually and none is updated in storage. A dashboard that sums `art` across vaults is summing normalized debt. It is not the stablecoin supply. The stablecoin supply is tied to `art * rate` plus the other Vat balances the documentation defines, including surplus and unbacked debt. Leaving those out is how a supply figure drifts.

A Lido share is the same pattern aimed at ether. The index is pooled ether over total shares. stETH shows the product as the balance, so it rebases. wstETH shows the share, so the balance is still and the exchange rate moves. Both are the same accounting. Picking one is an integration choice, documented in Lido’s token guide, not a different pool.

## Lazy updates

The index moves when a function accrues it. Aave accrues a reserve when the pool touches it. Maker accrues an ilk when someone calls `drip`. Lido accrues when the oracle report is applied. Between those calls the stored index is stale and the view functions are what apply the pending time. A simulation that reads storage slots and skips the pending accrual will disagree with `balanceOf`.

Rounding favors the protocol when the implementation is careful, and it favors an attacker when it is not. This site does not audit rounding. It says the public formulas are real-number sketches. The source divides integers. Quote the view method in tests.

## ERC-4626 is a standard shape for one of these

sUSDS deposits USDS and mints shares. `convertToAssets` is the index. Curve NG asset type 3 consumes that same method as a rate. The standard makes the share legible. It does not say what backs the asset. An ERC-4626 over USDS is a savings claim. An ERC-4626 over a risky credit book is a different risk that happens to expose the same four functions. Read the asset. The interface will not.

Curve’s `D` is the AMM cousin of the index. LP tokens are claims on `D`, not on a stored list of deposits. A one-coin withdrawal changes `D` and the balances together. Accounting that ignores `D` and sums the coins at face value will mis-value an imbalanced pool, which is the moment the value actually matters.
