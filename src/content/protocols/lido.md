---
title: "Lido"
seoTitle: "How Lido works: stETH shares and withdrawals"
description: "How Lido turns staked ether into stETH shares, reports validator balances, and processes withdrawals."
summary: "Lido is a liquid staking protocol for ether. A deposit mints shares in a pool of validators. stETH rebases so balances track the pool. wstETH wraps those shares into a static balance. Exiting is a queued withdrawal finalized by an accounting report, not a transfer of the liquid token."
status: "published"
published: "2026-10-13"
lastVerified: "2026-10-13"
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
versionContext: "Lido Core share accounting and the withdrawal queue remain the pooled design. Lido V3 stVaults are a documented isolated-vault design beside that pool. Dual Governance has been live on Ethereum mainnet since 4 July 2025, as described by Lido."
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
    note: "Isolated staking vaults beside Lido Core. A connected vault can mint stETH against its reported value, up to a DAO-set reserve ratio."
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
  - title: "AccountingOracle.sol at core v3.0.2"
    url: "https://github.com/lidofinance/core/blob/v3.0.2/contracts/0.8.9/oracle/AccountingOracle.sol"
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

The guide describes this as the bookkeeping model. Rounding lives in the contract, so an integration should call the view methods rather than reimplement the division. When new ETH is deposited, new shares are minted in proportion to what that ETH adds to the pool. When rewards arrive, the protocol does not mint a second token to each holder. It changes the pooled-ether total, and every share becomes worth more stETH. Penalties do the opposite.

That balance change is a [rebase](/glossary/rebase/). The integration guide says rebases normally follow the consensus-layer accounting report. The report section below records the quorum and the sanity bounds in that guide, including its statement that daily rebases had not been negative at the time of writing. The share math still allows a penalty to reduce balances.

<diagram-placeholder name="staking-flow"></diagram-placeholder>

Submitted ETH is not instantly one validator. Ethereum requires 32 ETH to activate a validator, and Lido batches deposits into the consensus-layer deposit contract. Until then, ether can sit in a buffer. The buffer is still part of the pooled accounting. It is not a separate product.

## Who runs the validators

Lido Core does not replace Ethereum’s validator set with a single contract. [Node operators](/glossary/node-operator/) run the validators. Which operators are admitted, and under which module, is a protocol and governance choice. In the basic Core deposit the user does not pick a validator. Rewards, downtime penalties, and slashings are Ethereum consensus events that later show up in the share rate. A transfer of stETH does not move a validator key.

This is the main trust boundary of the pooled token. The token is liquid. The stake is operated by other parties, under Ethereum’s rules, with a governance process deciding the operator set.

## Staking vaults

Lido’s stVaults pages describe a second live design, which the documentation center calls the core of Lido V3. A [staking vault](/glossary/staking-vault/) is one owner and one node operator. The operator address is set when the vault is initialized and the technical design says it cannot be changed. The vault is a `0x02` withdrawal-credentials target, so consensus rewards and exited balances are documented as flowing back to the vault. The operator does not take custody of that ether.

A vault connected to Lido can mint stETH against its reported value. `VaultHub` is the registry that mints and burns that stETH, settles fees, and handles bad debt. `LazyOracle` stores the per-vault report. The amount that can be minted is capped by a reserve ratio, and the technical design says only the DAO changes that ratio. Minted stETH joins the existing token. The vault is not a second rebasing token and not a share of someone else’s Core deposit.

The same design lists a constraint rather than a measured guarantee: slashing consequences are contained within the node operator’s group of vaults, up to a level the DAO agrees, and vault users are not supposed to reduce the Core stETH APR. Read that as the stated boundary. The oracle report and the reserve ratio are what an integrator can check.

`VaultFactory` deploys the vault from a beacon proxy. The owner can irreversibly ossify the implementation and opt out of later proxy upgrades. That choice is per vault. Ossifying one vault does not freeze Lido Core.

## The accounting report

The share rate does not update itself from beacon-chain state. An oracle committee submits a report. In `AccountingOracle` at core tag `v3.0.2`, the report includes the consensus-layer balance, withdrawal-vault and execution-layer reward balances, the number of validators, shares to burn, withdrawal-finalization batches, a simulated share rate, and a bunker-mode flag.

The simulated share rate is documented in that contract as pooled ether per share at 1e27 precision, computed for the report before withdrawal finalization is applied. The protocol then uses it when finalizing the queue. Bunker mode is a boolean on the same report. The contract comment says it reflects whether the protocol should be in bunker mode at the reference slot. How that flag changes the queue is part of the withdrawal design; this page does not invent a second definition. Read the withdrawal docs before assuming a normal finalization during a mass slashing.

The report is a trusted input. A wrong consensus balance becomes a wrong rebase. The integration guide, as read on 13 October 2026, says the oracle set is nine daemons and that five matching reports are enough to land the update. It also states two sanity bounds: a reported APR cannot exceed 27 percent, and a reported drop in staked ether cannot exceed 5 percent. Those bounds are the guide’s account of the checker. They are not a view of the beacon chain, which the staking contract cannot read on its own. The guide also says that, at the time of its writing, daily rebases had never been negative. The share math still allows a penalty to reduce balances.

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

The Lido withdrawal interface says that under normal conditions the wait is often one to five days, and that wstETH is unwrapped to stETH in the process. That interval is the interface’s description of normal operation. The consensus-layer exit queue can be longer. A request is not a redemption at the block it is submitted.

The [exit guide](/guides/lido-exits) connects this queue to Dual Governance, which Lido’s overview says went live on Ethereum on 4 July 2025. The short version: stETH holders can escrow stETH, wstETH, or withdrawal NFTs to delay a DAO proposal, because a contentious upgrade could otherwise land before a large exit finishes.

## Assumptions worth stating plainly

- The share rate is only as honest as the oracle report and the sanity checks around it.
- Validator performance is an Ethereum consensus fact, reported later. Lido cannot make a slashing not reduce pooled ether.
- The Core operator set is permissioned by governance and module rules. A staking vault fixes one operator at initialization. “Liquid” describes the token, not the validator keys.
- Withdrawal timing depends on Ethereum’s exit machinery and on whether bunker mode changes finalization.
- Governance can still change upgradeable protocol contracts, subject to the timelock and, since July 2025, the Dual Governance delay Lido documents. The delay is not the same thing as the core staking math being immutable.

stETH is also an asset inside other protocols. [Aave](/protocols/aave) can list it as collateral. [Curve](/protocols/curve) can pool it as a rebasing coin. Those integrations import this share accounting. They do not replace the withdrawal queue.
