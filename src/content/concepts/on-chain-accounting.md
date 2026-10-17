---
title: "On-chain accounting"
seoTitle: "Scaled balances and shares in DeFi accounting"
description: "Why these protocols store scaled balances, normalized debt, and shares instead of rewriting every account."
summary: "Aave scales aToken balances by a liquidity index. Maker stores normalized vault debt and multiplies by a rate. Lido prices shares by pooled ether. Curve accounts LP claims against the invariant D. The pattern is one global multiplier, updated lazily, instead of a transfer to every holder."
status: "published"
published: "2026-10-13"
lastVerified: "2026-10-14"
changes:
  - date: "2026-10-14"
    summary: "Added a worked example of two aToken balances growing with one liquidity index."
  - date: "2026-10-14"
    summary: "Added how the Aave V3 liquidity and variable-borrow indexes move, with excerpts from `MathUtils.sol`, `ReserveLogic.sol`, `AToken.sol`, and `WadRayMath.sol`."
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
  - title: "MathUtils.sol at 2437c560"
    url: "https://github.com/aave/aave-v3-core/blob/2437c5600c12ab0faefc8173fff1ca9615732ce5/contracts/protocol/libraries/math/MathUtils.sol"
    kind: "code"
    publisher: "Aave"
  - title: "ReserveLogic.sol at 6d6fa53d"
    url: "https://github.com/aave/aave-v3-core/blob/6d6fa53d360b43f492ff5b3c7033f95aee4f1335/contracts/protocol/libraries/logic/ReserveLogic.sol"
    kind: "code"
    publisher: "Aave"
  - title: "AToken.sol at 6d6fa53d"
    url: "https://github.com/aave/aave-v3-core/blob/6d6fa53d360b43f492ff5b3c7033f95aee4f1335/contracts/protocol/tokenization/AToken.sol"
    kind: "code"
    publisher: "Aave"
  - title: "WadRayMath.sol at 32f0e72b"
    url: "https://github.com/aave/aave-v3-core/blob/32f0e72bafdb5a29e5da5fdbd3539167964083a6/contracts/protocol/libraries/math/WadRayMath.sol"
    kind: "code"
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

An Aave aToken balance is a scaled balance times the reserve’s [liquidity index](/glossary/liquidity-index/). The tokenization docs describe the user-visible effect: the balance grows as interest accrues, without a transfer. Variable debt uses the borrow index. If you store a user’s aToken `balanceOf` in your own contract and later assume the stored number is still their claim, you have frozen a moving target. If you try to rebase your own ledger by transferring aTokens in proportion to interest, you will fight the token that is already rebasing. The V3 functions behind that product are quoted in the next section. They are not the same function for supply and debt.

A Maker urn stores `art`, not the DAI owed. The owed amount is `art` times the ilk `rate`. `Jug.drip` changes `rate` once. Every vault is updated conceptually and none is updated in storage. A dashboard that sums `art` across vaults is summing normalized debt. It is not the stablecoin supply. The stablecoin supply is tied to `art * rate` plus the other Vat balances the documentation defines, including surplus and unbacked debt. Leaving those out is how a supply figure drifts.

A Lido share is the same pattern aimed at ether. The index is pooled ether over total shares. stETH shows the product as the balance, so it rebases. wstETH shows the share, so the balance is still and the exchange rate moves. Both are the same accounting. Picking one is an integration choice, documented in Lido’s token guide, not a different pool.

## How the Aave V3 indexes move

The Aave excerpts in this section were read on 14 October 2026 at the latest commit for each file: `MathUtils.sol` at `2437c560`, `ReserveLogic.sol` and `AToken.sol` at `6d6fa53d`, and `WadRayMath.sol` at `32f0e72b`. The Maker, Lido, Curve, and sUSDS sources on this page were read on 13 October 2026. Nothing here is a V4 hub formula.

`AToken.balanceOf` does not return the stored word by itself:

```solidity
// Source excerpt: AToken.sol at 6d6fa53d360b43f492ff5b3c7033f95aee4f1335
return super.balanceOf(user).rayMul(POOL.getReserveNormalizedIncome(_underlyingAsset));
```

`super.balanceOf` is the scaled balance. `rayMul` in `WadRayMath` returns `(a * b + HALF_RAY) / RAY`, with `RAY` equal to 1e27 and `HALF_RAY` equal to 0.5e27. That is half-up rounding. The multiplier is the pool’s normalized income, not a raw storage read in every block. `ReserveLogic.getNormalizedIncome` returns the stored `liquidityIndex` when the reserve was already updated in this block. Otherwise it applies linear interest and then `rayMul`s that factor into the stored index.

Linear interest, from `MathUtils`, is integer arithmetic. `SECONDS_PER_YEAR` is `365 days`, and the file says this ignores leap years. For an elapsed time of `dt` seconds and an annual rate in ray, the factor is `RAY + (rate * dt) / SECONDS_PER_YEAR`. There is no squared term.

`_updateIndexes` writes that factor into `liquidityIndex` only when the cached liquidity rate is not zero. The function comments that a 100 percent reserve factor leaves the liquidity rate at zero, and then the liquidity index is not updated.

Variable debt takes the other path. The index is updated only when scaled variable debt is not zero. A non-zero base borrow rate is not sufficient: the same function comments that the index must not increase when nobody has variable debt. The update calls `calculateCompoundedInterest` on the variable borrow rate. `getNormalizedDebt` uses that function too.

The library comment gives the series it is approximating, and says full exponentiation is avoided because of gas:

```text
(1+x)^n = 1+n*x+[n/2*(n-1)]*x^2+[n/6*(n-1)*(n-2)*x^3...
```

The implementation keeps the constant term and the first three powers. `n` is the elapsed seconds. `x` is the annual rate divided by `SECONDS_PER_YEAR`, evaluated with `rayMul` rather than real-number division. The return is `RAY` plus those terms. If no time has passed, the function returns `RAY` and the index does not move. The comment says the approximation slightly underpays liquidity providers and undercharges borrowers relative to the exponentiation it replaces, and it points at the whitepaper for an error table. In this commit the liquidity index does not call the compounded function. The comment describes the variable-debt approximation. It is not a second, hidden formula inside the aToken.

The visible aToken balance can therefore change in a view because normalized income applies pending linear interest. The stored liquidity index changes when a state-changing call runs `_updateIndexes`. A simulation that reads the index slot and skips the pending linear term will disagree with `balanceOf`.

## A worked aToken balance

The index values here are illustrative, and rounding at 27 decimals is ignored. Alice supplies 1,000 USDC when the reserve’s liquidity index is 1.02. The pool records 1,000 / 1.02 = 980.3922 scaled units for her. Later the index is 1.05. `balanceOf` returns 980.3922 × 1.05 = 1,029.41 USDC. No transfer happened and her stored number did not change.

Bob supplies 1,000 USDC at that moment, at index 1.05. He gets 952.3810 scaled units, fewer than Alice for the same deposit, because each unit is now worth more. When the index reaches 1.10, Alice’s balance is 1,078.43 and Bob’s is 1,047.62. From 1.05 to 1.10 both grew by the same 4.76 percent. Alice’s larger balance is the interest she earned from 1.02 to 1.05, before Bob arrived.

One write to the reserve’s index moved both balances. That is the point of the design: interest reaches every supplier without a loop over accounts. It is also why an integration that copies `balanceOf` into its own storage is wrong one block later.

## Lazy updates

The index moves when a function accrues it. Aave accrues a reserve when the pool touches it. Maker accrues an ilk when someone calls `drip`. Lido accrues when the oracle report is applied. Between those calls the stored index is stale and the view functions are what apply the pending time. A simulation that reads storage slots and skips the pending accrual will disagree with `balanceOf`.

Rounding favors the protocol when the implementation is careful, and it favors an attacker when it is not. This site does not audit rounding. It says the public formulas are real-number sketches. The source divides integers. Quote the view method in tests.

## ERC-4626 is a standard shape for one of these

sUSDS deposits USDS and mints shares. `convertToAssets` is the index. Curve NG asset type 3 consumes that same method as a rate. The standard makes the share legible. It does not say what backs the asset. An ERC-4626 over USDS is a savings claim. An ERC-4626 over a risky credit book is a different risk that happens to expose the same four functions. Read the asset. The interface will not.

Curve’s `D` is the AMM cousin of the index. LP tokens are claims on `D`, not on a stored list of deposits. A one-coin withdrawal changes `D` and the balances together. Accounting that ignores `D` and sums the coins at face value will mis-value an imbalanced pool, which is the moment the value actually matters.
