---
title: "Scaled, rebasing and share-priced balances: aTokens, stETH, wstETH, sUSDS"
seoTitle: "aToken vs stETH vs wstETH vs sUSDS balances"
description: "How aTokens, Maker debt, stETH, wstETH and sUSDS turn a stored number into a balance, and why copying one into your own ledger goes wrong."
summary: "Aave, Maker, Lido and Sky all avoid writing every balance on every block. They store a small number per account and one global multiplier. What differs is which number a holder sees. aTokens and stETH show the product, so the balance changes. wstETH and sUSDS show the stored share, so the balance stays and the exchange rate moves."
status: "published"
published: "2026-10-26"
lastVerified: "2026-10-29"
changes:
  - date: "2026-10-29"
    summary: "Added sUSDe’s vested rewards and cooldown, Morpho’s share accounting and EigenLayer’s slashing-factor scaling."
faq:
  - question: "What is the difference between stETH and wstETH balances?"
    answer: "stETH shows shares priced in ether, so the balance changes when the oracle report changes the pooled ether. wstETH is the same share count with a fixed balance, so the balance does not change and stEthPerToken does. Both holders earn the same reward. Only where the number changes differs."
  - question: "Why can't I store an aToken balance in my own contract?"
    answer: "An aToken's balanceOf is the scaled balance times the reserve's normalized income, so it keeps growing without a transfer. A copied number is correct for one block. The stored scaled balance and the index are the stable inputs, and the view method is what applies pending interest."
order: 3
protocols:
  - aave
  - maker-sky
  - lido
  - morpho
  - eigenlayer
  - ethena
concepts:
  - on-chain-accounting
  - liquid-staking
  - stablecoin-mechanisms
glossary:
  - atoken
  - liquidity-index
  - variable-debt-token
  - normalized-debt
  - share
  - rebase
  - steth
  - wsteth
  - erc-4626
  - susds
tags:
  - accounting
  - shares
  - integration
sources:
  - title: "Aave V3 tokenization"
    url: "https://aave.com/docs/aave-v3/smart-contracts/tokenization"
    kind: "docs"
    publisher: "Aave"
  - title: "AToken.sol at 6d6fa53d"
    url: "https://github.com/aave/aave-v3-core/blob/6d6fa53d360b43f492ff5b3c7033f95aee4f1335/contracts/protocol/tokenization/AToken.sol"
    kind: "code"
    publisher: "Aave"
  - title: "Vat (core accounting)"
    url: "https://developers.skyeco.com/protocol/core/vat/"
    kind: "docs"
    publisher: "Sky"
  - title: "Lido tokens integration guide"
    url: "https://github.com/lidofinance/docs/blob/main/docs/guides/lido-tokens-integration-guide.md"
    kind: "docs"
    publisher: "Lido"
  - title: "wstETH contract documentation"
    url: "https://github.com/lidofinance/docs/blob/main/docs/contracts/wsteth.md"
    kind: "docs"
    publisher: "Lido"
  - title: "sUSDS"
    url: "https://developers.skyeco.com/protocol/tokens/susds/"
    kind: "docs"
    publisher: "Sky"
  - title: "Integrating Stableswap-NG"
    url: "https://docs.curve.finance/developer/integration/stableswap-ng"
    kind: "docs"
    publisher: "Curve"
---

These protocols cannot write every balance on every block. Each stores a small number per account and one global multiplier, and computes the current value when someone looks. The designs differ in which number the holder sees, and that choice decides what breaks when an integration copies the number. This page compares five tokens that use the pattern. It restates what the [on-chain accounting](/concepts/on-chain-accounting) and [liquid staking](/concepts/liquid-staking) articles establish, so the sources behind each claim are there and in the list below.

## At a glance

| Token | Stored per account | Global multiplier | What the holder sees | What changes on accrual |
| --- | --- | --- | --- | --- |
| Aave [aToken](/glossary/atoken/) | Scaled balance | Reserve liquidity index | Scaled balance times normalized income | The balance |
| Aave [variable debt token](/glossary/variable-debt-token/) | Scaled debt | Reserve borrow index | Debt plus accrued variable interest, not transferable | The balance |
| Maker vault debt | `art`, [normalized debt](/glossary/normalized-debt/) | Collateral type `rate` | `art * rate`, as the debt owed | `rate`, once for every vault |
| Lido [stETH](/glossary/steth/) | Shares | Pooled ether over total shares | Shares priced in ether | The balance, as a [rebase](/glossary/rebase/) |
| Lido [wstETH](/glossary/wsteth/) | The same shares, locked in a wrapper | The same pooled-ether rate | The share count | The exchange rate, not the balance |
| Sky [sUSDS](/glossary/susds/) | ERC-4626 shares | An accumulator, `chi`, moved by the savings rate `ssr` | The share count | The conversion to USDS, not the balance |

## Showing the product: aTokens and stETH

An aToken balance is the scaled balance times the reserve’s normalized income. The tokenization docs describe the effect: the balance grows as interest accrues, without a transfer. Variable debt uses the borrow index the same way. stETH applies the same idea to ether: the balance is `shares * totalPooledEther / totalShares`. When rewards arrive the protocol does not mint a second token to each holder. It changes the pooled-ether total, and every share becomes worth more stETH. Penalties do the opposite.

A worked aToken case from the accounting article, with illustrative index values. Alice supplies 1,000 USDC when the liquidity index is 1.02 and the pool records about 980.39 scaled units. At index 1.05, `balanceOf` returns about 1,029.41 USDC. Nothing was transferred and her stored number did not change. Bob supplies 1,000 USDC at 1.05 and gets about 952.38 scaled units, fewer than Alice, because each unit is now worth more. One write to the index moved both balances.

## Showing the share: wstETH and sUSDS

Rebasing breaks integrations that store a balance and expect it to stay still. wstETH is the wrapper for that case. One wstETH is one share locked in the wrapper. Its balance does not change when the oracle reports. `stEthPerToken` does. With an illustrative ratio of 1.20 pooled ether per share, 10 stETH is about 8.3333 shares, and wrapping mints 8.3333 wstETH. After a report that moves the ratio to 1.21, the unwrapped holder’s balance becomes 10.0833 stETH, and the wstETH holder’s balance is still 8.3333, which unwraps into the same 10.0833.

sUSDS follows the share pattern through [ERC-4626](/glossary/erc-4626/). Share-to-asset conversion uses the accumulator, so a transfer of sUSDS transfers a claim whose USDS value changes, while the USDS stays in the savings module. sUSDS and the older sDAI token are not one-for-one, because each has accrued a different rate since it launched.

## Maker is the same pattern pointed at debt

A Maker urn stores `art`, not the DAI owed. `Jug.drip` changes `rate` once, and every vault of that collateral type is updated without a storage write. A dashboard that sums `art` across vaults is summing normalized debt, not the stablecoin supply. That figure also depends on surplus and unbacked debt in the Vat.

## Three more variations

**sUSDe** is an ERC-4626 share like sUSDS, with two additions. Reward payments vest linearly over eight hours, and the vault’s asset count excludes the unvested part, so the share price rises smoothly instead of jumping. Unstaking can pass through a cooldown in which the shares are burned immediately and the USDe waits in a silo contract. A reader who snapshots `convertToAssets` right after a payment will see a different number from one who reads it eight hours later. See [Ethena](/protocols/ethena).

**Morpho** stores supply shares and borrow shares per market, with asset totals that interest raises while share counts stay still. The health check rounds borrowed assets up, in the protocol’s favor. See [Morpho](/protocols/morpho).

**EigenLayer** keeps deposit shares and scales them when they are used. The amount a staker can withdraw is the deposit shares times a slashing factor, which is the operator’s current maximum magnitude, and for native ETH also a beacon chain factor. A slash does not change the staker’s share count. It changes the factor. An integration that reads deposit shares as a balance will overstate what is withdrawable. See [EigenLayer](/protocols/eigenlayer).

## Which one to integrate

- Use the view methods. Lido’s integration guide notes a rounding difference of one to two wei per stETH transfer and points to `transferShares` for exact amounts, so call the share conversions instead of reimplementing the division.
- Use wstETH or an ERC-4626 share where a rebase would corrupt your internal accounting. Do not treat the wrapper as a different asset with a different exit.
- Do not copy `balanceOf` of a rebasing token into storage. It is right for one block.
- Read what backs an ERC-4626 share. The interface makes the share legible. It does not say what backs the asset: a vault over USDS is a savings claim, and a vault over a risky credit book is a different risk behind the same functions.
- Curve’s Stableswap-NG pools consume these rates directly. Asset type 2 handles a rebasing token such as stETH, and asset type 3 reads an ERC-4626 `convertToAssets`. A wrong rate means the invariant clears trades against the wrong value.

## What stays true across all of them

The multiplier moves when something touches it: Aave when the pool touches the reserve, Maker when `drip` is called, Lido when the oracle report lands. Between those events the stored value is stale and the view function is what applies the pending time. A simulation that reads storage slots and skips the pending accrual will disagree with `balanceOf`.
