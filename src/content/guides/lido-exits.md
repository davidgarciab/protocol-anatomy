---
title: "Lido exits and Dual Governance"
description: "How Lido withdrawal requests are finalized, and how Dual Governance uses the exit queue as a check on the DAO."
summary: "Lido withdrawals are a request, an oracle finalization, and a claim. The claim is an NFT until ETH is paid. Dual Governance, live on Ethereum since 4 July 2025 by Lido’s account, lets stETH holders escrow tokens so a DAO proposal cannot finish before they have had time to exit."
status: "published"
published: "2026-10-13"
lastVerified: "2026-10-26"
changes:
  - date: "2026-10-26"
    summary: "Updated the cited AccountingOracle source to core v4.0.0, the version in force after the Staking Router v3 upgrade."
order: 5
protocol: "lido"
versionContext: "The withdrawal queue is the production exit path. Dual Governance is an additional control on DAO execution, not a replacement for the share-rate accounting."
tags:
  - lido
  - withdrawals
  - governance
concepts:
  - liquid-staking
  - governance-and-upgrades
  - oracles-and-dependencies
glossary:
  - withdrawal-request
  - steth
  - wsteth
  - share
relatedGuides: []
versions:
  - name: "Rebasing stETH without a withdrawal queue"
    status: "historical"
    note: "Before Ethereum withdrawals, stETH could be traded but not redeemed through the protocol for ETH."
  - name: "Withdrawal queue"
    status: "active"
    note: "Request, finalize by accounting report, claim ETH. Represented by the unstETH NFT."
  - name: "Dual Governance"
    status: "active"
    note: "Described by Lido as live on Ethereum mainnet on 4 July 2025. Escrow thresholds in the overview are 1 percent and 10 percent of stETH."
sources:
  - title: "WithdrawalQueue ERC-721"
    url: "https://github.com/lidofinance/docs/blob/main/docs/contracts/withdrawal-queue-erc721.md"
    kind: "docs"
    publisher: "Lido"
  - title: "Lido tokens integration guide"
    url: "https://github.com/lidofinance/docs/blob/main/docs/guides/lido-tokens-integration-guide.md"
    kind: "docs"
    publisher: "Lido"
  - title: "AccountingOracle.sol at core v4.0.0"
    url: "https://github.com/lidofinance/core/blob/v4.0.0/contracts/0.8.9/oracle/AccountingOracle.sol"
    kind: "code"
    publisher: "Lido"
  - title: "Dual Governance overview"
    url: "https://blog.lido.fi/dual-governance-overview/"
    kind: "governance"
    publisher: "Lido"
  - title: "Dual Governance guide"
    url: "https://github.com/lidofinance/docs/blob/main/docs/guides/dg-guide.md"
    kind: "docs"
    publisher: "Lido"
  - title: "stVaults technical design"
    url: "https://docs.lido.fi/run-on-lido/stvaults/concepts-and-reference/stvaults-technical-design"
    kind: "docs"
    publisher: "Lido"
  - title: "Lido withdrawal interface"
    url: "https://stake.lido.fi/withdrawals/claim"
    kind: "docs"
    publisher: "Lido"
  - title: "WstETH.sol at core v3.0.2"
    url: "https://github.com/lidofinance/core/blob/v3.0.2/contracts/0.6.12/WstETH.sol"
    kind: "code"
    publisher: "Lido"
---

For a long period, stETH was liquid only in the market sense. Holders could sell it. They could not ask the protocol for the underlying ETH, because Ethereum itself had not shipped withdrawals. Once consensus-layer withdrawals existed, Lido added a queue. Dual Governance is a later control that uses that queue. It does not change the share math in the [Lido overview](/protocols/lido).

The historical state matters for reading old integrations. A contract written when stETH could not be redeemed was pricing a token with no protocol exit. That discount, when it appeared, was not a rebase bug. It was the market’s view of an exit that did not exist yet. The queue is the protocol exit for pooled stETH. A DEX pool is still only a market exit.

Lido V3 staking vaults have a different exit for the ether in a vault. The technical design says the vault owner can request validator exits and can trigger an EIP-7002 withdrawal, because the withdrawal credentials point at the vault. That path is not a burn of pooled stETH through `unstETH`. Minted stETH still uses the queue on this page when its holder wants protocol ETH. The [Lido overview](/protocols/lido) separates the vault from the Core share.

## The queue

The withdrawal-queue contract is the entry point for exchanging stETH for ETH. The docs assign it four jobs: ordering requests, accepting finalization from the accounting report, holding stETH before finalization and ETH after it, and paying the user on claim. Each request mints an ERC-721, `unstETH`, and burns it on claim. The metadata can change when finalization status changes; the docs cite ERC-4906 for that update.

A request starts with an approval or a permit, then a `requestWithdrawals` call. wstETH is unwrapped in the process. The Lido interface says the pending amount is denominated in stETH for that reason. Finalization does not happen in the user’s transaction. The accounting oracle’s report includes withdrawal-finalization batches and a simulated share rate. The oracle contract at tag `v4.0.0` documents that rate as post-report pooled ether per share at 1e27, calculated as if the finalization batches were empty, and then used so the queue and the rebase agree.

On claim, the NFT owner receives the reserved ETH. Until finalization, the NFT is a place in line, not a balance of ETH. It can be transferred. The buyer of the NFT buys the place in line.

The interface’s “one to five days” describes normal conditions. Ethereum’s validator exit queue is the real constraint when many validators exit together. Bunker mode, a flag on the same oracle report, is the protocol’s switch for abnormal loss events. This guide does not restate bunker rules beyond what the oracle comment establishes: the committee reports whether bunker mode should be on at the reference slot. Assume finalization timing can change when that flag is set, and read the current withdrawal documentation before coding a deadline.

## Why governance and the queue collide

stETH holders are the people who suffer if a governance action is wrong. LDO holders are the people who vote. Those sets are not the same. A proposal can be queued and executed on a timelock that is shorter than a mass exit of validators. Dual Governance is Lido’s answer to that gap. The [overview](https://blog.lido.fi/dual-governance-overview/) says it went live on Ethereum mainnet on 4 July 2025, after a snapshot, audits, and an on-chain vote. The dates in that post are Lido’s account of the rollout, not an independent chain analysis performed for this page.

The mechanism uses an escrow. Holders deposit stETH, wstETH, or withdrawal NFTs. Two thresholds are described:

- At 1 percent of stETH supply in escrow, veto signalling delays governance execution. The overview says the delay runs from 5 to 45 days depending on opposition.
- At 10 percent, rage quit blocks governance motions until the escrowed tokens have exited.

The point of the long delay is Ethereum’s exit throughput. A five-day timelock would not let a large holder unstake. The escrow is how opposition becomes a timer instead of a second voting token.

The Dual Governance guide adds operational detail that the overview’s thresholds do not capture. Outside rage quit, deposits can be revoked, subject to a minimum timelock the guide puts at five hours. Inside rage quit, escrowed stETH and wstETH are queued for exit and cannot be revoked. After finalization, the guide says ETH from the rage-quit path sits behind a further timelock of 60 to 180 days. Withdrawal NFTs in that path have to be claimed, and the guide says a claim does not transfer NFT ownership. It locks the ETH for the NFT’s owner. Standard withdrawals that are not in the escrow are not given that extra timelock. The guide says they can be claimed once finalized.

Those durations and percentages are parameters described in Lido’s July 2025 materials and the current guide. They are the kind of number governance can later change. Confirm them on the deployed contracts before treating them as code.

## What Dual Governance does not do

It does not stop a slashing. It does not let stETH holders pass arbitrary protocol changes. It does not make the oracle committee unnecessary. It does not turn the withdrawal NFT into instant ETH. It gives stakers time, and at the higher threshold a block on execution, tied to actually leaving.

An integrator that accepts stETH as collateral still has the rebase, the exit queue, and this governance state as risks. A token that is mid-rage-quit is not the same liquidity story as a token in a quiet week. None of that appears in the ERC-20 `balanceOf` of wstETH. wstETH’s balance is shares. The exit and the escrow are other contracts.

The [governance and upgrades](/concepts/governance-and-upgrades) article uses this design as the example of a timelock that is sized to an external queue rather than to a fixed number of days chosen for convenience.
