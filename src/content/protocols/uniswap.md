---
title: "Uniswap"
seoTitle: "How Uniswap works: v2, v3 and v4 pools and swaps"
description: "How Uniswap prices swaps, tracks liquidity-provider claims, and settles trades from v2 pools through v4."
summary: "Uniswap is an automated market maker. A swap moves the reserves of a pool and the pool’s invariant sets the price. v2 spreads fungible liquidity across every price. v3 and v4 concentrate it between ticks. v4 keeps that pricing and changes the contracts around it: one PoolManager, flash settlement, and optional hooks."
status: "published"
published: "2026-10-13"
lastVerified: "2026-10-26"
changes:
  - date: "2026-10-26"
    summary: "Moved the cited documentation to its new developers.uniswap.org pages, sourced the v3 position NFT claim to the v3 liquidity-management guide, and sourced the twelve-chain v4 launch list to the Uniswap Foundation."
faq:
  - question: "What pricing rule does a Uniswap v2 pool use?"
    answer: "The protocol overview states it as `x * y = k`. After a swap, the product of the two reserves must not fall once the fee is taken into account. The spot price is the ratio of the reserves, and a trade that is large relative to the pool moves that ratio more. That movement is price impact, and it is part of the invariant, not a separate fee."
  - question: "What happens to a Uniswap v3 or v4 position when the price leaves its range?"
    answer: "It earns no fees until the price re-enters. The position is not stuck in both tokens. It has been converted entirely into one of the two tokens and is inactive, not liquidated."
  - question: "What does Uniswap v4 change compared with v3?"
    answer: "The architecture page says v4 keeps v3’s capital efficiency and adds hooks, a singleton, and flash accounting. All pools live in `PoolManager`, creating a pool writes state instead of deploying a pair contract, and a multi-pool swap records deltas and settles at the end instead of moving the intermediate token."
  - question: "Are Uniswap’s core contracts upgradeable?"
    answer: "Uniswap’s own overview says the core contracts are not upgradeable. That is a different trust model from Aave’s proxy-based pool. A v4 hook is separate code that runs inside the swap path, and the singleton does not make an arbitrary hook safe."
order: 2
category: "Automated market maker"
mechanism: "Constant-product swaps against pooled reserves, with concentrated liquidity in v3 and v4."
versionContext: "v2, v3, and v4 are all part of the protocol the current Uniswap docs describe. v4 launched on 31 January 2025. Core pools are documented as non-upgradeable."
tags:
  - amm
  - swaps
  - liquidity
concepts:
  - automated-market-makers
  - liquidity-pools
  - constant-product
  - concentrated-liquidity
  - composability
  - flash-liquidity
guides:
  - uniswap-versions
glossary:
  - constant-product
  - concentrated-liquidity
  - tick
  - hook
  - lp-share
  - flash-accounting
versions:
  - name: "v2"
    status: "active"
    note: "ERC-20 pairs with fungible LP tokens and a 0.30 percent pool fee. Still part of documented routing."
  - name: "v3"
    status: "active"
    note: "Concentrated liquidity between ticks, fee tiers, and NFT positions through NonfungiblePositionManager."
  - name: "v4"
    status: "active"
    note: "Singleton PoolManager, flash accounting, and optional hooks. Launched 31 January 2025. PositionManager mints an ERC-721. ERC-6909 claims are a separate settlement balance."
sources:
  - title: "How Uniswap works"
    url: "https://developers.uniswap.org/docs/get-started/concepts/how-uniswap-works"
    kind: "docs"
    publisher: "Uniswap"
  - title: "Understanding swaps"
    url: "https://developers.uniswap.org/docs/get-started/concepts/traders/swaps"
    kind: "docs"
    publisher: "Uniswap"
  - title: "Concentrated liquidity"
    url: "https://developers.uniswap.org/docs/get-started/concepts/liquidity-providers/concentrated-liquidity"
    kind: "docs"
    publisher: "Uniswap"
  - title: "Using flash swaps"
    url: "https://developers.uniswap.org/docs/protocols/v2/guides/flash-swaps"
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
  - title: "Managing v3 liquidity: set up your contract"
    url: "https://developers.uniswap.org/docs/protocols/v3/guides/managing-liquidity/getting-started"
    kind: "docs"
    publisher: "Uniswap"
  - title: "Uniswap v4: supercharging DeFi across chains"
    url: "https://uniswapfoundation.org/blog/uniswap-v4-supercharging-defi-across-chains"
    kind: "docs"
    publisher: "Uniswap Foundation"
  - title: "Uniswap v4 is here"
    url: "https://blog.uniswap.org/uniswap-v4-is-here"
    kind: "docs"
    publisher: "Uniswap Labs"
  - title: "TickMath.sol"
    url: "https://github.com/Uniswap/v3-core/blob/d8b1c635c275d2a9450bd6a78f3fa2484fef73eb/contracts/libraries/TickMath.sol"
    kind: "code"
    publisher: "Uniswap"
---

Uniswap replaces an order book with a pool. The pool holds two assets. A trader swaps against those reserves, and the price is the result of a formula rather than a matched bid. Liquidity providers commit assets and receive the pool’s fee. They also take the inventory risk: a swap leaves them with more of the asset traders are selling.

The current docs treat v2, v3, and v4 as one protocol family with different pool contracts. This page follows a swap and an LP position through that family. The [version guide](/guides/uniswap-versions) is the place for the contract-level differences. Uniswap’s own overview says the core contracts are not upgradeable. That is a different trust model from Aave’s proxy-based pool.

## The v2 invariant

A v2 pool is a pair of ERC-20 reserves. The [protocol overview](https://developers.uniswap.org/docs/get-started/concepts/how-uniswap-works) states the pricing rule as `x * y = k`. After a swap, the product of the reserves must not fall once the fee is taken into account. The spot price is the ratio of the reserves. A trade that is large relative to the pool moves that ratio more. That movement is price impact, and it is part of the invariant, not a separate fee.

The v2 flash-swap guide documents the pool fee as 0.30 percent, implemented as a 997/1000 factor on the input. The production quote lives in the v2 periphery library. The function below is an educational sketch of that arithmetic, not the deployed pair. It ignores the pair’s balance check, which is how v2 actually enforces the invariant: tokens are sent to the pair first, and the pair compares its balances with the stored reserves.

```solidity
// Educational sketch of the documented v2 quote. Not Uniswap source.
// Not compiled here, and not a contract to hold assets.
pragma solidity 0.8.26;

contract ConstantProductSketch {
    uint256 public reserveIn;
    uint256 public reserveOut;

    function quote(uint256 amountIn) external view returns (uint256 amountOut) {
        uint256 amountInWithFee = amountIn * 997;
        amountOut = (amountInWithFee * reserveOut) / (reserveIn * 1000 + amountInWithFee);
    }
}
```

Integer division rounds down. A real pair also requires the product check to pass after transfers, supports flash swaps that return tokens inside a callback, and mints a fungible [LP token](/glossary/lp-share/) for a pro-rata claim on both reserves. The LP token is not a claim to withdraw the same quantities that were deposited. Swaps change the mix.

<diagram-placeholder name="swap-flow"></diagram-placeholder>

The [swap documentation](https://developers.uniswap.org/docs/get-started/concepts/traders/swaps) separates three protections that routers add and that the invariant does not provide by itself: a minimum amount out, a maximum amount in, and a deadline. Those revert the transaction if the pool has moved, or if the transaction waits too long. They are user limits. They do not change `k`.

## Concentrated liquidity

v2 liquidity is active at every price from zero to infinity. The concentrated-liquidity docs use a stablecoin pair as the motivating case: most trading happens near one price, so the rest of the curve is idle capital. v3 lets a provider choose a lower and upper price. The position earns fees only while the pool’s price is inside that range. Outside it, the position has been converted entirely into one of the two tokens and is no longer active.

The v3 whitepaper divides price into [ticks](/glossary/tick/). Tick `i` is the price `1.0001^i`, so adjacent ticks are one basis point apart. The contracts store the square root of price as a Q64.96 fixed-point number. `TickMath` in v3-core states the bounds and the conversion:

```solidity
int24 internal constant MIN_TICK = -887272;
int24 internal constant MAX_TICK = -MIN_TICK;
// getSqrtRatioAtTick returns sqrt(1.0001^tick) * 2^96
```

That excerpt is from `contracts/libraries/TickMath.sol` at commit `d8b1c635c275d2a9450bd6a78f3fa2484fef73eb`. Not every tick can be initialized. The pool has a `tickSpacing`, and only multiples of that spacing are valid boundaries. The whitepaper ties tighter spacing to lower fee tiers. Crossing an initialized tick during a swap costs gas, so a finer grid is more precise and more expensive to trade across.

Inside one range, the active liquidity `L` behaves like a constant-product curve that has been shifted so the real reserves run out at the range boundaries. The [concentrated liquidity](/concepts/concentrated-liquidity) article writes that relationship without pretending a single NFT is a v2 LP token.

v3 positions are not fungible ERC-20 shares. The docs describe v3 positions as NFTs, and the v3 liquidity-management guide shows them handled as ERC-721 tokens through the `NonfungiblePositionManager` contract. Two positions in the same pool at different ranges are different claims. Fees accrue to the position and are collected; they are not continuously rebasing the NFT balance.

A v3 swap walks the current tick range, then crosses into the next initialized tick if the price limit allows it. The swap docs say the pool collects payment through `uniswapV3SwapCallback`, and that the swap enforces a price limit `sqrtPriceLimitX96`. This is the opposite order from a naive “transfer, then call” mental model: the pool tells the caller how much input to pay during the callback.

## v4: same curve, different shell

The v4 architecture page says v4 keeps v3’s capital efficiency and adds hooks, a singleton, and flash accounting. All pools live in `PoolManager`. Creating a pool writes state instead of deploying a new pair contract. A multi-pool swap does not have to transfer the intermediate token; the manager records deltas and settles at the end. The docs call that flash accounting.

[Hooks](/glossary/hook/) are optional. The hooks documentation says a pool with no hook uses the same concentrated-liquidity behavior as v3. If a hook is set, it is part of the pool key passed to `initialize` and cannot be added or swapped later. The hooks documentation lists callbacks around initialize, liquidity changes, swaps, and donate. The hook declares which of those it implements by flags in its address. The architecture page also describes custom accounting: a hook can charge a fee or opt out of the concentrated-liquidity curve. A hooked pool follows that curve only when its hook leaves the curve in place. The pool will call whatever code was hashed into the pool key.

The launch post dated 31 January 2025 says v4 was live on Ethereum, Polygon, Arbitrum, OP Mainnet, Base, BNB Chain, Blast, World Chain, Avalanche, and Zora. The [Uniswap Foundation’s announcement](https://uniswapfoundation.org/blog/uniswap-v4-supercharging-defi-across-chains) of the same day lists twelve chains, adding Ink and Soneium to that list. Treat the chain list as time-specific. The architectural claims above are about the contract design, not about which deployment an interface routes through today.

v4 liquidity positions are still NFTs. `PositionManager` in v4-periphery inherits `ERC721Permit_v4` and names the collection “Uniswap v4 Positions NFT”. The file comment says it mints and manages ERC-721 tokens associated with each position. That was the source on `main` as read on 13 October 2026. `main` can move. The v3 position contract is a different address, `NonfungiblePositionManager`, so a transfer of a v3 token id does not move a v4 position.

ERC-6909 is a different object on `PoolManager`. The ERC-6909 page says a caller can leave the underlying ERC-20 in the manager and receive a claim token, then burn that claim instead of transferring the ERC-20 on a later call. Liquidity managers can opt to receive capital as a claim. The claim is not the position NFT, and a mint of claim tokens is not proof that a tick range was opened.

## What stays outside the pool

Routing, the interface, and UniswapX are not the invariant. The launch post says the Uniswap Labs interface can route across UniswapX, v2, v3, and v4. A user-level swap can therefore touch several pool types, and an intent-based filler, in one trade. The pool that executes still checks its own accounting. The router’s split is a separate choice.

Protocol fees, when governance has turned them on, take a cut of LP fees. The overview says governance can enable them within predefined limits. Whether a given pool currently pays a protocol fee is a configuration question.

## Failure modes that are actually about the design

- **Divergence loss.** A constant-product LP is left holding more of the asset that fell in price. Concentrating liquidity increases fee income when the price stays in range and increases inventory loss when it does not.
- **Out-of-range positions.** A v3 or v4 position outside its ticks earns no fees until the price re-enters. The position is not “stuck” in both tokens; it is entirely one token.
- **Hook risk.** A v4 pool’s custom code runs inside the swap path. The singleton does not make an arbitrary hook safe.
- **Price impact and stale transactions.** The invariant will execute at the pool’s current price. Minimum-output checks exist so the user can refuse that price. They have to be set.

Uniswap does not price collateral or liquidate borrowers. A lending protocol that uses a pool price as an oracle is importing this spot price, which a trade can move. That dependency is discussed under [oracles](/concepts/oracles-and-dependencies), not as a feature of the pair.
