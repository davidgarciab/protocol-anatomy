---
title: "Flash loans and flash accounting"
description: "How Uniswap v2 flash swaps, v3 flash, v4 deltas, and Aave V3 flash loans must be settled inside one transaction."
summary: "These mechanisms all hand a transaction liquidity it must replace before the call ends. v2 enforces that with the swap product check. v3 charges the pool fee inside flash. v4 reverts unless every delta is settled before unlock returns. Aave V3 can take a fee or, on flashLoan, open debt instead."
status: "published"
published: "2026-10-14"
lastVerified: "2026-10-26"
faq:
  - question: "Why can a flash loan be offered without collateral?"
    answer: "Because the pool sends tokens, or records a debt, and the same call has to make the pool whole. If it does not, the transaction reverts and the send never happened. Uniswap v2, v3, v4, and Aave V3 all use that atomicity, with different functions, fees, and end states."
    featured: true
  - question: "How do the flash fees differ between Uniswap v3 and Aave V3?"
    answer: "Uniswap v3 charges the pool’s own fee tier, rounded up, so a 3000 tier is 0.30 percent. Aave’s flash premium is initialized at deployment to 0.05 percent and can be changed by a governance vote, so the live value is `FLASHLOAN_PREMIUM_TOTAL`, not the initialization number."
  - question: "Can an Aave flash loan leave debt behind?"
    answer: "`flashLoan` can, if the borrower opens a variable-rate debt position backed by supplied collateral or credit delegation. That borrow is then subject to health factor and liquidation. `flashLoanSimple` takes one reserve, does not waive the fee, and cannot open a debt position."
  - question: "What makes a Uniswap v4 flash revert?"
    answer: "`unlock` reverts with `CurrencyNotSettled` if any currency still has a non-zero delta when the callback returns. `take` sends currency out and `settle` pays it back. There is no `flash` function in this `PoolManager`, and the debt is the delta."
order: 16
group: "engineering"
tags:
  - flash-loans
  - accounting
  - composability
protocols:
  - uniswap
  - aave
glossary:
  - flash-loan
  - flash-accounting
related:
  - composability
  - on-chain-accounting
  - constant-product
sources:
  - title: "Uniswap v2 flash swaps"
    url: "https://developers.uniswap.org/docs/protocols/v2/guides/flash-swaps"
    kind: "docs"
    publisher: "Uniswap"
  - title: "UniswapV3Pool.sol at c5ccf4d2"
    url: "https://github.com/Uniswap/v3-core/blob/c5ccf4d28a73fde90f0bb9ea3fd299d7d2bcdf83/contracts/UniswapV3Pool.sol"
    kind: "code"
    publisher: "Uniswap"
  - title: "PoolManager.sol at a7cf038c"
    url: "https://github.com/Uniswap/v4-core/blob/a7cf038cd568801a79a9b4cf92cd5b52c95c8585/src/PoolManager.sol"
    kind: "code"
    publisher: "Uniswap"
  - title: "Uniswap v4 flash accounting"
    url: "https://developers.uniswap.org/docs/protocols/v4/concepts/flash-accounting"
    kind: "docs"
    publisher: "Uniswap"
  - title: "Aave flash loans"
    url: "https://aave.com/docs/developers/flash-loans"
    kind: "docs"
    publisher: "Aave"
  - title: "Aave V4 overview"
    url: "https://github.com/aave/aave-v4/blob/main/docs/overview.md"
    kind: "docs"
    publisher: "Aave"
---

A flash loan is not a loan that survives the transaction. The pool sends tokens, or records a debt, and the same call has to make the pool whole. If it does not, the transaction reverts and the send never happened. Uniswap v2, Uniswap v3, Uniswap v4, and Aave V3 all use that atomicity. They do not use the same function, the same fee, or the same end state.

The scope here is the v2 flash-swap guide, `UniswapV3Pool.flash` at commit `c5ccf4d2`, `PoolManager.unlock` at commit `a7cf038c`, and the Aave V3 flash-loan docs, all read on 14 October 2026. The [Uniswap versions](/guides/uniswap-versions) guide is where the pool architectures are compared. This page is only the settlement. The Aave V4 overview read the same day does not describe a flash-loan method. This page does not infer one.

## Uniswap v2 sends tokens first

The v2 flash-swap guide says the page documents v2, and it says that under the hood every swap is a flash swap: the pair sends the output tokens before it checks that enough input tokens arrived. A normal swap is the case where the caller has already sent payment. A flash swap is the case where payment arrives from inside the callback.

The guide’s `swap` arguments are `amount0Out`, `amount1Out`, `to`, and `data`. One of the two amounts may be zero. If `data.length` is zero, the pair assumes payment has already been received and transfers the tokens to `to`. If `data.length` is greater than zero, the pair transfers the tokens and then calls `uniswapV2Call` on `to`, not on `msg.sender` unless those addresses are the same. The callback’s arguments are the sender, the two amounts, and `data`.

Repayment has to satisfy the pair’s ordinary product check, including the pool fee that guide describes. There is no separate flash fee on top of the swap fee in that description. The check is on balances, so the tokens that arrive matter, not a number the caller claims to have paid. The [Uniswap overview](/protocols/uniswap) keeps the educational sketch of the v2 fee next to that balance check. The sketch is not this callback.

## Uniswap v3 has an explicit flash

v3 still sends tokens during a swap callback. It also exposes `flash` on the pool. At commit `c5ccf4d2` the function requires current liquidity to be non-zero, or it reverts with `L`. A pool that exists but has no liquidity cannot be flashed. The fee is the pool’s own fee, rounded up:

```solidity
// Source excerpt: UniswapV3Pool.sol at c5ccf4d28a73fde90f0bb9ea3fd299d7d2bcdf83
uint256 fee0 = FullMath.mulDivRoundingUp(amount0, fee, 1e6);
uint256 fee1 = FullMath.mulDivRoundingUp(amount1, fee, 1e6);
```

`fee` is the pool fee field. Dividing by 1e6 turns a tier such as 3000 into 0.30 percent of the borrowed amount. Rounding is up, so a dust borrow still owes a fee unit when the product is not an integer.

The pool then transfers `amount0` and `amount1` to `recipient` when those amounts are non-zero, and calls `uniswapV3FlashCallback` on `msg.sender` with `fee0`, `fee1`, and `data`. After the callback it requires each balance to have grown by at least that fee:

```solidity
// Source excerpt: same function
require(balance0Before.add(fee0) <= balance0After, 'F0');
require(balance1Before.add(fee1) <= balance1After, 'F1');
```

Repayment above the fee is accounted as paid. A protocol-fee fraction can be skimmed when the pool’s protocol fee is set. The remainder increases the global fee growth paid to in-range liquidity. That split is in the same function. It is not a second loan.

v3’s flash fee is the pool fee tier. It is not Aave’s flash premium, and it is not v2’s 997/1000 input factor. A router that copies one fee onto another version is using the wrong contract.

## Uniswap v4 settles deltas

The v4 flash-accounting docs describe why the singleton can avoid intermediate transfers. In v2 and v3, a multi-hop swap moved tokens between pool contracts. v4 updates an internal net balance, called a delta, for each balance-changing operation. Only the final net change needs a token transfer. The docs attribute that design to the singleton plus transient storage.

The enforcement is in `unlock`:

```solidity
// Source excerpt: PoolManager.sol at a7cf038cd568801a79a9b4cf92cd5b52c95c8585
// the caller does everything in this callback, including paying what they owe via calls to settle
result = IUnlockCallback(msg.sender).unlockCallback(data);

if (NonzeroDeltaCount.read() != 0) CurrencyNotSettled.selector.revertWith();
```

`take` sends currency out while the manager is unlocked. `settle` pays a currency back. If any currency still has a non-zero delta when the callback returns, `unlock` reverts with `CurrencyNotSettled`. That is the flash condition. There is no `flash` function in this `PoolManager`. The debt is the delta.

This does not mean every v4 pool behaves like a vanilla concentrated-liquidity pool. Hooks run inside the unlock. A hook can change amounts before settlement. The versions guide separates the ERC-721 position minted by `PositionManager` from the ERC-6909 claims that can sit inside this settlement. Those claims are a balance the manager can settle against. They are not the liquidity position.

## Aave V3 can end in a real debt

Aave’s flash-loan docs describe a different menu. The pool will send a reserve only when borrowing is enabled for it. The amount plus a fee must come back before the transaction ends, unless the call is allowed to open a debt position instead. The docs call these one-block borrows and say they do not require collateral up front. Collateral enters only if the transaction finishes by opening a borrow.

`flashLoan` can take several reserves in one call. The borrower may open a variable-rate debt position backed by supplied collateral or credit delegation. The flash fee is waived for approved flash borrowers, which the ACL manager controls. `flashLoanSimple` takes one reserve. The docs say its fee is not waived, and that it cannot open a debt position. It is the smaller call for a borrower that will repay in full.

The fee is initialized at deployment to 0.05 percent and can be changed by a governance vote. The current value is `FLASHLOAN_PREMIUM_TOTAL`, not the initialization number. Part of that premium can go to liquidity providers and part to the protocol treasury. This page does not read the live premium from a deployment. A contract that hardcodes 0.05 percent is assuming a parameter.

If `flashLoan` opens a debt position, the transaction can succeed and leave a normal Aave borrow behind. That borrow is then subject to [health factor and liquidation](/concepts/collateral-and-liquidation). Atomicity protected the flash. It did not retire the debt. `flashLoanSimple` does not have that branch.

## What a short repayment does

| Path | Debt opens | Repayment required | If it is short |
| --- | --- | --- | --- |
| v2 `swap` with non-empty `data` | Pair sends output, then `uniswapV2Call` on `to` | Enough input for the product check, including the v2 swap fee | The transaction reverts |
| v3 `flash` | Pool sends tokens, then `uniswapV3FlashCallback` on the caller | Each balance at least the pre-flash balance plus the rounded-up pool fee | Revert `F0` or `F1` |
| v4 `unlock` | Swaps, liquidity changes, and `take` write deltas | `settle` until the non-zero delta count is zero | Revert `CurrencyNotSettled` |
| Aave V3 `flashLoan` | Pool sends reserves that have borrowing enabled | Amount plus fee, or an allowed debt position | The transaction reverts |
| Aave V3 `flashLoanSimple` | One reserve | Amount plus fee. The fee is not waived, and no debt position is opened | The transaction reverts |

A revert rolls back the sends in that transaction. It does not undo a position created by an earlier transaction, and it does not freeze the next block’s oracle. The [composability](/concepts/composability) page is about that boundary: same-call failure is free, next-block failure is not.

Two accounting mistakes follow from mixing the rows. Treating a v4 delta as an ERC-721 position confuses settlement with liquidity ownership. Treating an Aave flash that opened variable debt as if it had been repaid confuses a waived or converted fee with a closed loan. Read the function you called. The word flash does not say which row you are in.
