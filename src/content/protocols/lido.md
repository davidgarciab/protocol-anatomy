---
title: "Lido"
seoTitle: "How Lido works: stETH shares and withdrawals"
description: "How Lido turns staked ether into stETH shares, reports validator balances, and processes withdrawals."
summary: "Lido is a liquid staking protocol for ether. A deposit mints shares in a pool of validators. stETH rebases so balances track the pool. wstETH wraps those shares into a static balance. Exiting is a queued withdrawal finalized by an accounting report, not a transfer of the liquid token."
status: "published"
published: "2026-10-13"
lastVerified: "2026-10-26"
changes:
  - date: "2026-10-26"
    summary: "Recorded Lido V3 going live on 30 January 2026 and the Staking Router v3 upgrade of 27 July 2026, which changed the oracle report fields. Corrected the stVaults descriptions of ownership, the LazyOracle, and bad-debt handling, and added the withdrawal request limits."
faq:
  - question: "How does the stETH balance grow?"
    answer: "Internally Lido mints shares, and the visible balance is `shares * totalPooledEther / totalShares`. Rewards change the pooled-ether total, so every share becomes worth more stETH without a transfer. Penalties do the opposite. That balance change is a rebase."
    featured: true
  - question: "What is wstETH and why does it exist?"
    answer: "Rebasing breaks integrations that store a balance and expect it to stay still. wstETH is the wrapper: one wstETH is one share locked in the wrapper. Its balance does not change when the oracle reports, while `stEthPerToken` does."
  - question: "Does selling or transferring stETH unstake it?"
    answer: "No. A transfer moves the claim, and the stake stays in validators. To receive ETH from the protocol a holder requests a withdrawal, which locks stETH or wstETH and mints an `unstETH` NFT. The ETH is paid when the request is finalized. The Lido interface describes a typical wait of one to five days under normal conditions."
  - question: "Who runs the validators behind stETH?"
    answer: "Node operators do. In the basic Core deposit the user does not pick one. Governance and module rules decide which operators are admitted, and Ethereum consensus events such as rewards, downtime penalties, and slashings later show up in the share rate."
order: 5
category: "Liquid staking"
mechanism: "Share-based claims on pooled staked ether, with oracle accounting and a withdrawal queue."
versionContext: "Lido Core share accounting and the withdrawal queue remain the pooled design. Lido V3 stVaults, which Lido announced as live on Ethereum mainnet on 30 January 2026, are an isolated-vault design beside that pool. Dual Governance has been live on Ethereum mainnet since 4 July 2025, as described by Lido."
tags:
  - staking
  - shares
  - withdrawals
concepts:
  - liquid-staking
  - on-chain-accounting
  - oracles-and-dependencies
  - governance-and-upgrades
guides:
  - lido-exits
glossary:
  - steth
  - wsteth
  - share
  - withdrawal-request
  - rebase
  - node-operator
  - staking-vault
versions:
  - name: "Share accounting"
    status: "active"
    note: "stETH balances are shares priced by pooled ether. wstETH is the non-rebasing wrapper."
  - name: "Withdrawals"
    status: "active"
    note: "Request, oracle finalization, and claim. The claim is an ERC-721 until it is burned."
  - name: "Dual Governance"
    status: "active"
    note: "Live on Ethereum since 4 July 2025 according to Lido’s overview. It gives stETH holders a delay path against DAO execution."
  - name: "Lido V3 stVaults"
    status: "active"
    note: "Isolated staking vaults beside Lido Core, announced live on Ethereum mainnet on 30 January 2026. A connected vault can mint stETH against its reported value, up to a DAO-set reserve ratio."
sources:
  - title: "Lido tokens integration guide"
    url: "https://github.com/lidofinance/docs/blob/main/docs/guides/lido-tokens-integration-guide.md"
    kind: "docs"
    publisher: "Lido"
  - title: "wstETH contract documentation"
    url: "https://github.com/lidofinance/docs/blob/main/docs/contracts/wsteth.md"
    kind: "docs"
    publisher: "Lido"
  - title: "WstETH.sol at core v3.0.2"
    url: "https://github.com/lidofinance/core/blob/v3.0.2/contracts/0.6.12/WstETH.sol"
    kind: "code"
    publisher: "Lido"
  - title: "WithdrawalQueue ERC-721"
    url: "https://github.com/lidofinance/docs/blob/main/docs/contracts/withdrawal-queue-erc721.md"
    kind: "docs"
    publisher: "Lido"
  - title: "AccountingOracle.sol at core v4.0.0"
    url: "https://github.com/lidofinance/core/blob/v4.0.0/contracts/0.8.9/oracle/AccountingOracle.sol"
    kind: "code"
    publisher: "Lido"
  - title: "Lido V3 is live"
    url: "https://blog.lido.fi/lido-v3-is-live-modular-infrastructure-for-a-new-paradigm-of-ethereum-staking/"
    kind: "docs"
    publisher: "Lido"
  - title: "February validator set updates"
    url: "https://operatorportal.lido.fi/validator-set-updates/february-validator-set-updates-2"
    kind: "docs"
    publisher: "Lido"
  - title: "Staking Router v3 design and implementation proposal (LIP-35)"
    url: "https://research.lido.fi/t/staking-router-v3-design-implementation-proposal-lip-35/11621"
    kind: "governance"
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
  - title: "stVaults documentation center"
    url: "https://docs.lido.fi/run-on-lido/stvaults/"
    kind: "docs"
    publisher: "Lido"
  - title: "Lido withdrawal interface"
    url: "https://stake.lido.fi/withdrawals/claim"
    kind: "docs"
    publisher: "Lido"
---

Lido takes ETH that a user could have staked directly and pools it with other deposits. The user receives a token that can be transferred while the underlying ether sits in Ethereum validators. The protocol’s own accounting problem is the share: how much of the pooled ether, including rewards and penalties, belongs to each holder, and how that ether comes back out.

The mechanism is not an AMM and not a lending market. Nothing in the share rate prices a trade. The [exit guide](/guides/lido-exits) covers the withdrawal queue and Dual Governance in more detail. This page is the deposit, the share, and the report that changes the share’s price.

## Deposit and shares

A user submits ETH to the Lido contract and receives [stETH](/glossary/steth/). Internally the protocol mints [shares](/glossary/share/). The integration guide defines a share as the holder’s fraction of the ether the protocol controls. The balance people see is that share priced in ether:

```text
stETH balance = shares * totalPooledEther / totalShares
```

The guide documents the inverse form of this bookkeeping, and the share-conversion view methods are what an integration should call rather than reimplement the division. The guide also notes a rounding difference of one to two wei per transfer and points to `transferShares` for exact amounts. For applications that do not intentionally support rebase semantics, it says to prefer wstETH. When new ETH is deposited, new shares are minted in proportion to what that ETH adds to the pool. When rewards arrive, the protocol does not mint a second token to each holder. It changes the pooled-ether total, and every share becomes worth more stETH. Penalties do the opposite.

That balance change is a [rebase](/glossary/rebase/). The integration guide says rebases normally follow the consensus-layer accounting report. The report section below records the quorum and the sanity bounds in that guide, including its statement that daily rebases had not been negative at the time of writing. The share math still allows a penalty to reduce balances.

<diagram-placeholder name="staking-flow"></diagram-placeholder>

Submitted ETH is not instantly one validator. Ethereum requires 32 ETH to activate a validator, and Lido batches deposits into the consensus-layer deposit contract. Until then, ether can sit in a buffer. The buffer is still part of the pooled accounting. It is not a separate product.

## Who runs the validators

Lido Core does not replace Ethereum’s validator set with a single contract. [Node operators](/glossary/node-operator/) run the validators. Which operators are admitted, and under which module, is a protocol and governance choice. In the basic Core deposit the user does not pick a validator. Rewards, downtime penalties, and slashings are Ethereum consensus events that later show up in the share rate. A transfer of stETH does not move a validator key.

This is the main trust boundary of the pooled token. The token is liquid. The stake is operated by other parties, under Ethereum’s rules, with a governance process deciding the operator set.

## Staking vaults

Lido’s stVaults pages describe a second design, which the documentation center calls the core of Lido V3. Lido’s [launch post](https://blog.lido.fi/lido-v3-is-live-modular-infrastructure-for-a-new-paradigm-of-ethereum-staking/), dated 30 January 2026, says V3 is live on Ethereum mainnet after a staged rollout. The February 2026 operator-portal update says the rollout was complete, with the last phase letting vaults of non-identified node operators mint stETH under a 50 percent reserve ratio and a 5,000 ETH minting cap. Those caps are governance settings that can change. A [staking vault](/glossary/staking-vault/) has an owner and a node operator. The operator address is set when the vault is initialized and the technical design says it cannot be changed. The owner can be transferred through a two-step process, and while a vault is connected to Lido, `VaultHub` is its technical owner and records the factual owner. The vault is a `0x02` withdrawal-credentials target, so consensus rewards and exited balances are documented as flowing back to the vault. The operator does not take custody of that ether.

A vault connected to Lido can mint stETH against its reported value. `VaultHub` mints and burns that stETH against per-vault total values, and Lido fees are settled through a dedicated `VaultHub` function. `LazyOracle` receives a daily snapshot from the accounting oracle and stores only the root hash of that global state. Individual vault updates are submitted with Merkle proofs and forwarded to `VaultHub`, and a report more than two days old blocks minting and withdrawals. When a mass slashing pushes a vault’s value below its debt, the technical design describes an escalation path: the owner can add funds, the DAO can shift the uncovered liability to other vaults of the same node operator or apply coverage mechanisms, and as a last resort the DAO can write the remaining bad debt off. The amount that can be minted is capped by a reserve ratio, and the technical design says only the DAO changes that ratio. Minted stETH joins the existing token. The vault is not a second rebasing token and not a share of someone else’s Core deposit.

The same design lists a constraint rather than a measured guarantee: slashing consequences are contained within the node operator’s group of vaults, up to a level the DAO agrees, and vault users are not supposed to reduce the Core stETH APR. Read that as the stated boundary. The oracle report and the reserve ratio are what an integrator can check.

`VaultFactory` deploys the vault from a beacon proxy. The owner can irreversibly ossify the implementation and opt out of later proxy upgrades, but only after the vault has been fully disconnected from `VaultHub`. That choice is per vault. Ossifying one vault does not freeze Lido Core.

## The accounting report

The share rate does not update itself from beacon-chain state. An oracle committee submits a report. In `AccountingOracle` at core tag `v4.0.0`, the report includes the sum of consensus-layer validator balances excluding pending deposits and, separately, the pending-deposits balance. It also carries per-module exited-validator counts and validator balances, the withdrawal-vault and execution-layer reward balances, shares requested to burn, withdrawal-finalization batches, a simulated share rate, a bunker-mode flag, and the Merkle root and content identifier of the staking-vault data. Earlier tags reported a validator count and one consensus-layer balance. The change came with Staking Router v3 (LIP-35). Lido’s [governance thread](https://research.lido.fi/t/staking-router-v3-design-implementation-proposal-lip-35/11621) records on-chain vote 203 and Dual Governance proposal 12, and says the Staking Router was upgraded to v3 on 27 July 2026. The proposal moves accounting from validator counts to balances so that validators with a larger effective balance under EIP-7251 can be tracked.

The simulated share rate is documented in that contract as pooled ether per share at 1e27 precision, computed for the report before withdrawal finalization is applied. The protocol then uses it when finalizing the queue. Bunker mode is a boolean on the same report. The contract comment says it reflects whether the protocol should be in bunker mode at the reference slot. How that flag changes the queue is part of the withdrawal design; this page does not invent a second definition. Read the withdrawal docs before assuming a normal finalization during a mass slashing.

The report is a trusted input. A wrong consensus balance becomes a wrong rebase. The integration guide, as read on 26 October 2026, says the oracle set is nine daemons and that five matching reports are enough to land the update. It also states two sanity bounds: a reported APR cannot exceed 27 percent, and a reported drop in staked ether cannot exceed 5 percent. Those bounds are the guide’s account of the checker. They are not a view of the beacon chain, which the staking contract cannot read on its own. The guide also says that, at the time of its writing, daily rebases had never been negative. The share math still allows a penalty to reduce balances. The Staking Router v3 proposal suggested a different parameter set for the sanity checker, including a 10 percent annual balance-increase limit, and the thread does not confirm the values deployed. Read the deployed checker before relying on either set of bounds.

## wstETH

Rebasing breaks integrations that store a balance and expect it to stay still. [wstETH](/glossary/wsteth/) is the wrapper. At core `v3.0.2`, `wrap` does three things: it requires a non-zero amount, it converts stETH to shares with `getSharesByPooledEth`, and it mints that many wstETH while pulling the stETH in.

```solidity
function wrap(uint256 _stETHAmount) external returns (uint256) {
    require(_stETHAmount > 0, "wstETH: can't wrap zero stETH");
    uint256 wstETHAmount = stETH.getSharesByPooledEth(_stETHAmount);
    _mint(msg.sender, wstETHAmount);
    stETH.transferFrom(msg.sender, address(this), _stETHAmount);
    return wstETHAmount;
}
```

That is the wrapper’s source, not a simplification. One wstETH is one share locked in the wrapper. The wstETH balance does not change when the oracle reports. `stEthPerToken` does. Unwrapping burns wstETH and returns the stETH those shares are worth at the current rate.

The contract also accepts raw ETH in `receive` and submits it, minting wstETH for the resulting shares. Sending ETH to the wrapper is a stake-and-wrap, not a donation.

## Withdrawals are a second system

Transferring stETH sells or moves the claim. It does not unstake. To receive ETH from the protocol, a holder requests a withdrawal. The [withdrawal-queue documentation](https://github.com/lidofinance/docs/blob/main/docs/contracts/withdrawal-queue-erc721.md) says the queue locks stETH or wstETH, mints an ERC-721 (`unstETH`) that represents the claim, and later pays ETH when the request is finalized. Finalization is part of the accounting-oracle report. The NFT is burned on claim.

The Lido withdrawal interface says that under normal conditions the wait can be anywhere from one to five days, and that wstETH is unwrapped to stETH in the process. The queue documentation sets the minimum request at 100 wei and the maximum at 1,000 stETH per request, and says a requester does not earn rewards on the tokens while they wait in the queue. That interval is the interface’s description of normal operation. The consensus-layer exit queue can be longer. A request is not a redemption at the block it is submitted.

The [exit guide](/guides/lido-exits) connects this queue to Dual Governance, which Lido’s overview says went live on Ethereum on 4 July 2025. The short version: stETH holders can escrow stETH, wstETH, or withdrawal NFTs to delay a DAO proposal, because a contentious upgrade could otherwise land before a large exit finishes.

## Assumptions worth stating plainly

- The share rate is only as honest as the oracle report and the sanity checks around it.
- Validator performance is an Ethereum consensus fact, reported later. Lido cannot make a slashing not reduce pooled ether.
- The Core operator set is permissioned by governance and module rules. A staking vault fixes one operator at initialization. “Liquid” describes the token, not the validator keys.
- Withdrawal timing depends on Ethereum’s exit machinery and on whether bunker mode changes finalization.
- Governance can still change upgradeable protocol contracts, subject to the timelock and, since July 2025, the Dual Governance delay Lido documents. The delay is not the same thing as the core staking math being immutable.

stETH is also an asset inside other protocols. [Aave](/protocols/aave) can list it as collateral. [Curve](/protocols/curve) can pool it as a rebasing coin. Those integrations import this share accounting. They do not replace the withdrawal queue.
