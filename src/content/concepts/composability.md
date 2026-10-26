---
title: "Transaction execution and composability"
description: "How one Ethereum transaction can call a router, a pool, and a lending market, and where that atomicity stops."
summary: "Composability means one transaction can move through several protocols before it commits. Uniswap routers chain pools. Flash accounting and flash swaps lend inventory for the duration of a call. The atomicity stops at anything that waits: an oracle report, a withdrawal queue, or a governance timelock."
status: "published"
published: "2026-10-13"
lastVerified: "2026-10-26"
order: 14
group: "engineering"
tags:
  - composability
  - transactions
protocols:
  - uniswap
  - aave
  - curve
  - lido
glossary:
  - flash-accounting
  - flash-loan
  - hook
related:
  - flash-liquidity
  - automated-market-makers
  - security-assumptions
  - proxies
sources:
  - title: "Understanding swaps"
    url: "https://developers.uniswap.org/docs/get-started/concepts/traders/swaps"
    kind: "docs"
    publisher: "Uniswap"
  - title: "Using flash swaps"
    url: "https://developers.uniswap.org/docs/protocols/v2/guides/flash-swaps"
    kind: "docs"
    publisher: "Uniswap"
  - title: "Uniswap v4 architecture"
    url: "https://developers.uniswap.org/docs/protocols/v4/concepts/architecture"
    kind: "docs"
    publisher: "Uniswap"
  - title: "Uniswap v4 hooks"
    url: "https://developers.uniswap.org/docs/protocols/v4/concepts/hooks"
    kind: "docs"
    publisher: "Uniswap"
  - title: "Aave V3 Pool"
    url: "https://www.aave.com/docs/aave-v3/smart-contracts/pool"
    kind: "docs"
    publisher: "Aave"
  - title: "WithdrawalQueue ERC-721"
    url: "https://github.com/lidofinance/docs/blob/main/docs/contracts/withdrawal-queue-erc721.md"
    kind: "docs"
    publisher: "Lido"
---

Ethereum transactions are atomic. If any call reverts, the whole transaction reverts, and the state from earlier calls in that transaction is discarded. DeFi composition is that rule plus contracts that call other contracts. It is not a guarantee that a position can be unwound later, or that two protocols agree about price.

## What fits in one transaction

A Uniswap router can swap through several pools, and the user’s minimum-output check can wrap the whole route. If the last pool would break the limit, none of the earlier hops remain. v2 flash swaps and v4 flash accounting are stronger versions of the same idea. Inventory leaves, or is recorded as a debt, and must be back by the end of the call. The flash-swap guide’s product check is the enforcement for v2. v4’s architecture page describes deltas settled at the end of `unlock` so intermediate tokens need not move. [Flash loans and flash accounting](/concepts/flash-liquidity) separates that v2 check, the v3 `flash` call, the v4 delta, and Aave V3’s flash loan.

Aave’s pool can be called in the same transaction as a swap. A common pattern is: flash-borrow, swap, do something, repay. The lending pool does not know it is inside a flash loan. It checks health factor at the points its own functions specify. If the transaction ends with an unsafe position, the borrow reverts. If it ends safe and the next block’s oracle moves, the position can be liquidated later. Atomicity protected the transaction. It did not protect the position.

Curve metapools are composition inside one protocol. The metapool holds another pool’s LP token and calls through to the base coins. A trader sees one swap. The state change touches two invariants. A failure in the base pool reverts the metapool swap. That is the useful kind of coupling.

v4 hooks run in the middle of this. A hook’s callback is part of the transaction. If it reverts, the swap reverts. If it calls out to a third protocol, that call is now on the swap’s critical path. The hooks documentation makes the hook optional and fixed at initialization. It does not make the hook’s callees atomic with respect to later blocks.

## What does not fit

Lido’s withdrawal queue finalizes on a later oracle report. Submitting the request and receiving ETH are different transactions, often different days. A contract that “supports stETH” and assumes `withdraw` returns ETH in the same call is describing a DEX, not the protocol exit.

Governance timelocks, Aave V4 cap changes, and Maker `spot` updates land in other transactions. A simulation of today’s state is not a simulation of the state the pending governance payload will create. The [upgrade](/concepts/governance-and-upgrades) article is about that second timeline.

Reentrancy is the failure mode of composition inside one call. A token callback or a hook can re-enter a pool before balances are final. Aave’s V4 overview says spokes use a reentrancy guard and that the design does not support tokens with callbacks. Uniswap v2’s balance check is its own defense: it does not trust the caller’s amount, it trusts the tokens that arrived. Neither defense is a reason to ignore the pattern. Read the callback list before you put a new token or a new hook in the path.

Composability is why these protocols can be one market. It is also why a bug in a hook, a pool, or a collateral token is not sealed inside the contract that contains the bug.
