---
title: "Uniswap v2, v3, and v4"
description: "How Uniswap’s pool, fee, liquidity claim, and swap settlement changed from v2 through the v4 singleton."
summary: "v2 is a fungible constant-product pair with a 0.30 percent fee. v3 keeps constant-product math inside a chosen tick range and represents positions as NFTs. v4 keeps concentrated liquidity, puts every pool in one PoolManager, settles with flash accounting, and lets a hook extend the swap."
status: "published"
published: "2026-10-13"
lastVerified: "2026-10-13"
order: 2
protocol: "uniswap"
versionContext: "All three versions are documented as live protocol surfaces. The v4 launch post is dated 31 January 2025. Core contracts are described as non-upgradeable."
tags:
  - uniswap
  - versions
  - amm
concepts:
  - constant-product
  - concentrated-liquidity
  - liquidity-pools
  - composability
  - flash-liquidity
glossary:
  - constant-product
  - tick
  - hook
  - flash-accounting
  - lp-share
relatedGuides:
  - curve-generations
versions:
  - name: "v2"
    status: "active"
    note: "Separate pair contracts, fungible LP tokens, 0.30 percent fee, balance-diff settlement."
  - name: "v3"
    status: "active"
    note: "Concentrated liquidity, fee tiers, callback payment, ERC-721 positions."
  - name: "v4"
    status: "active"
    note: "Singleton PoolManager, flash accounting, and optional hooks. Live since 31 January 2025. The LP receipt is an ERC-721 from PositionManager."
sources:
  - title: "How Uniswap works"
    url: "https://docs.uniswap.org/contracts/v2/concepts/protocol-overview/how-uniswap-works"
    kind: "docs"
    publisher: "Uniswap"
  - title: "Understanding swaps"
    url: "https://docs.uniswap.org/concepts/protocol/swaps"
    kind: "docs"
    publisher: "Uniswap"
  - title: "Concentrated liquidity"
    url: "https://docs.uniswap.org/concepts/protocol/concentrated-liquidity"
    kind: "docs"
    publisher: "Uniswap"
  - title: "Using flash swaps"
    url: "https://docs.uniswap.org/contracts/v2/guides/smart-contract-integration/using-flash-swaps"
    kind: "docs"
    publisher: "Uniswap"
  - title: "Uniswap v3 Core whitepaper"
    url: "https://uniswap.org/whitepaper-v3.pdf"
    kind: "whitepaper"
    publisher: "Uniswap"
  - title: "Uniswap v4 architecture"
    url: "https://developers.uniswap.org/docs/protocols/v4/concepts/architecture"
    kind: "docs"
    publisher: "Uniswap"
  - title: "Uniswap v4 hooks"
    url: "https://developers.uniswap.org/docs/protocols/v4/concepts/hooks"
    kind: "docs"
    publisher: "Uniswap"
  - title: "ERC-6909 in Uniswap v4"
    url: "https://developers.uniswap.org/docs/protocols/v4/concepts/erc-6909"
    kind: "docs"
    publisher: "Uniswap"
  - title: "PositionManager.sol"
    url: "https://github.com/Uniswap/v4-periphery/blob/main/src/PositionManager.sol"
    kind: "code"
    publisher: "Uniswap"
  - title: "PoolKey.sol"
    url: "https://github.com/Uniswap/v4-core/blob/main/src/types/PoolKey.sol"
    kind: "code"
    publisher: "Uniswap"
  - title: "Uniswap v4 is here"
    url: "https://blog.uniswap.org/uniswap-v4-is-here"
    kind: "docs"
    publisher: "Uniswap Labs"
---

Uniswap’s versions are easy to flatten into “v4 is newer, so it replaces v3.” The docs do not say that. v2 pairs, v3 pools, and v4 pools are different contracts, and the interface described in the January 2025 launch post can route across them. This guide is about what an integrator has to stop assuming when the version changes. The [Uniswap overview](/protocols/uniswap) explains a single swap.

## Liquidity, and the claim that represents it

v2 liquidity is uniform. The LP token is an ERC-20 claim on a share of both reserves. Any two holders of the same pair token are in the same position, scaled by balance. Fees stay in the reserves and raise the value of that token. There is no range to manage and no NFT to transfer.

v3 liquidity is a choice of range. The concentrated-liquidity documentation and the v3 whitepaper define the range by [ticks](/glossary#tick) of `1.0001^i`. A position earns fees only inside its ticks. The claim is an ERC-721 from `NonfungiblePositionManager`, because two ranges are not fungible. Fees are collected to the position. They do not rebase the NFT’s token id.

v4 keeps concentrated liquidity for a hookless pool and changes the contract that mints the receipt. `PositionManager` mints an ERC-721, “Uniswap v4 Positions NFT”, one token id per position. That is the same standard as v3 and a different contract from `NonfungiblePositionManager`. Transferring the v3 NFT does not migrate the position. ERC-6909 claims, minted by `PoolManager` when a caller leaves tokens on deposit, are settlement balances. They are not the liquidity position.

Nothing in these docs converts a v2 LP token into a v3 NFT or a v4 position. Migration is a withdraw and a new deposit, and the v4 deposit may include a hook address in the pool key.

## Settlement

v2’s pair looks at token balances. The factory documentation’s model is: transfer tokens to the pair, then call the method. The pair’s stored reserves are compared with its actual balances. Flash swaps are the exception the flash-swap guide describes: tokens leave first, and the callback must return enough that the product still holds after the 0.30 percent fee.

v3 pulls payment. The swap guide says the pool calls `uniswapV3SwapCallback` and enforces `sqrtPriceLimitX96`. The caller learns what it owes during the swap. A router that still “transfers first” as if it were a v2 pair is using the wrong sequence.

v4 batches payment. The architecture page says `PoolManager` records deltas and settles when the unlock finishes, so a route through several pools does not transfer the intermediate asset. The swap guide names `unlock` and final balance settlement as the v4 path, with hooks able to run before and after. Flash accounting is an optimization of settlement. It is not a change to the concentrated-liquidity curve inside a tick range.

## Fees and pool identity

v2’s documented pool fee is 0.30 percent, the 997/1000 factor in the flash-swap guide. A pair is identified by its two tokens. The factory will not deploy a second pair for the same two tokens.

v3 pools are identified by the two tokens and a fee tier. The whitepaper connects fee tier to tick spacing: a lower fee can use a tighter grid. The same token pair can have several pools. A router picks among them.

v4 identifies a pool by a `PoolKey`: the two currencies, a fee, a tick spacing, and a hook. Tick spacing is its own field. v3 is the version that pairs spacing with a fee tier. `PoolKey` says the fee is capped at 1,000,000, and that a dynamic-fee pool must set the fee to exactly `0x800000`. That value is a flag, not a fee of one hundred percent. The hook, when its address flags allow it, can change the fee after initialization. The hook itself is fixed at `initialize`. Two pools with different hooks are different pools. A hookless pool uses concentrated liquidity. A hook with custom accounting can opt out of that curve. The permission flags live in the hook address, so a hook cannot silently gain a callback it did not declare.

Protocol fee is a separate switch. The overview says governance can enable it within limits. It is not the LP fee, and it is not automatically on because a version number increased.

## What v4 does not discard

The constant-product relationship still prices an active range. Price impact still grows as a trade consumes in-range liquidity. Out-of-range positions still hold one asset and earn no fees. User-level limits — minimum output, maximum input, deadline — are still router concerns, as the swap guide describes them for integrations generally.

The core contracts remain, in Uniswap’s wording, non-upgradeable. A hook can be written by anyone and can itself be a proxy. That is a new place for upgrade risk, at the edge of a pool, not a reversal of the core-immutability claim.

## A practical reading of “which version”

| Question | v2 | v3 | v4 |
| --- | --- | --- | --- |
| Where is the liquidity active? | Every price | Between two ticks | Between two ticks |
| What does the LP hold? | ERC-20 | ERC-721 from `NonfungiblePositionManager` | ERC-721 from `PositionManager` |
| How is input collected? | Transfer, then balance check | Swap callback | Deltas settled at the end of unlock |
| What makes a second pool? | It does not, for the same pair | Fee tier, which selects tick spacing | Currencies, fee or dynamic-fee flag, tick spacing, and hook |
| Can pool code be extended? | Not in the pair | Not in the pool | Optional hook, fixed at creation |

ERC-6909 does not belong in the LP-receipt row. It is the claim token `PoolManager` can mint when tokens stay in the singleton between calls.

If a transaction trace shows a pair contract and a fungible LP token, it is v2 even if the user’s interface says Uniswap. If it shows `NonfungiblePositionManager`, it is v3. If it shows `PositionManager` or `PoolManager`, it is v4. A hook address of zero is still a v4 pool. The [composability](/concepts/composability) article is about why those traces get mixed inside one router call.
