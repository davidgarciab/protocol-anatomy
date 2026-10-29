---
title: "Liquid staking"
seoTitle: "How liquid staking works: stETH and Lido"
description: "How a liquid staking token represents pooled validator deposits, and why a transfer is not a withdrawal."
summary: "Liquid staking gives the depositor a transferable claim while validators earn rewards. Lido’s claim is a share of pooled ether. stETH rebases. wstETH does not. Getting ETH back is a queue finalized by an oracle, and the operators running validators are a separate trust assumption."
status: "published"
published: "2026-10-13"
lastVerified: "2026-10-29"
changes:
  - date: "2026-10-29"
    summary: "Pointed to restaking and added the role of staking modules and operator bonds."
  - date: "2026-10-14"
    summary: "Added a worked example of one share count held as stETH and as wstETH across a reward and a penalty."
  - date: "2026-10-26"
    summary: "Updated the cited AccountingOracle source to core v4.0.0, the version in force after the Staking Router v3 upgrade."
faq:
  - question: "Does selling a liquid staking token exit the validator?"
    answer: "No. The lock remains, and the token is not the validator key. A transfer finds a buyer, while a withdrawal asks the protocol for ETH through a queue that mints an NFT, waits for the accounting report to finalize the request, and pays ETH on claim."
  - question: "What happens to holders if one validator operator is slashed?"
    answer: "In Lido Core every holder is in one pool, so a penalty is socialized across shares rather than charged to a validator the user picked. One operator’s slashing changes the share rate for holders who never chose that operator."
  - question: "Why use wstETH instead of stETH?"
    answer: "wstETH is the same share with a fixed balance. Use it where a rebase would corrupt internal accounting. The worked example on this page shows both holders earning the same reward, only where the number changes is different."
order: 11
group: "monetary"
tags:
  - staking
  - lido
protocols:
  - lido
  - eigenlayer
glossary:
  - steth
  - wsteth
  - share
  - withdrawal-request
  - node-operator
  - staking-vault
related:
  - on-chain-accounting
  - oracles-and-dependencies
  - governance-and-upgrades
sources:
  - title: "Lido tokens integration guide"
    url: "https://github.com/lidofinance/docs/blob/main/docs/guides/lido-tokens-integration-guide.md"
    kind: "docs"
    publisher: "Lido"
  - title: "wstETH contract documentation"
    url: "https://github.com/lidofinance/docs/blob/main/docs/contracts/wsteth.md"
    kind: "docs"
    publisher: "Lido"
  - title: "WithdrawalQueue ERC-721"
    url: "https://github.com/lidofinance/docs/blob/main/docs/contracts/withdrawal-queue-erc721.md"
    kind: "docs"
    publisher: "Lido"
  - title: "AccountingOracle.sol at core v4.0.0"
    url: "https://github.com/lidofinance/core/blob/v4.0.0/contracts/0.8.9/oracle/AccountingOracle.sol"
    kind: "code"
    publisher: "Lido"
  - title: "stVaults technical design"
    url: "https://docs.lido.fi/run-on-lido/stvaults/concepts-and-reference/stvaults-technical-design"
    kind: "docs"
    publisher: "Lido"
---

Staking locks an asset in a validator so the consensus protocol will pay rewards and charge penalties. Liquid staking issues a token against that lock so the depositor can transfer the claim. The lock remains. The token is not the validator key, and selling the token does not exit the validator.

[Lido](/protocols/lido) is the concrete system. The shape is general: a pool, a share, an operator set, a reporter, and an exit queue.

<diagram-placeholder name="staking-flow"></diagram-placeholder>

## The share

Lido Core mints shares when ETH is submitted. The stETH balance is shares times pooled ether over total shares. Rewards increase pooled ether. A slashing decreases it. Every Core holder is in one pool, so a penalty is socialized across shares rather than charged to a validator that user picked. Users do not pick a validator in the basic Core deposit. The protocol assigns stake to [operators](/glossary/node-operator/).

Lido V3 [staking vaults](/glossary/staking-vault/) are the documented exception to that socialization. One vault has one owner and one operator. It can mint stETH against its own reported value, up to a reserve ratio, and the technical design says operator-group losses are supposed to stay in that group up to a DAO-set level. The minted token is still stETH. The exit of the underlying validators is the vault’s exit, described on the [Lido](/protocols/lido) page, not a second share token.

That socialization is the product. It is also the risk. One operator’s slashing changes the share rate for holders who never chose that operator. Module design and operator limits are how the protocol tries to bound the blast radius. They are governance parameters. The share math will apply whatever the report contains.

wstETH is the same share with a fixed balance. The wrapper locks stETH and mints the share count. Use it where a rebase would corrupt internal accounting. Do not use it as if it were a different asset with a different exit. Unwrapping or requesting withdrawal returns to the same queue.

A worked example, with an illustrative ratio of 1.20 pooled ether per share. A holder with 10 stETH owns 10 / 1.20 = 8.3333 shares. Wrapping locks the 10 stETH and mints 8.3333 wstETH. An oracle report that adds rewards moves the ratio to 1.21. The unwrapped holder’s stETH balance becomes 8.3333 × 1.21 = 10.0833 without a transfer. The wstETH balance is still 8.3333, and unwrapping it now returns 10.0833 stETH. Both holders earned the same reward. Only where the number changes is different. A report in which penalties exceed rewards, moving the ratio to 1.19, takes both to 9.9167 stETH of value in the same way.

## The exit

A transfer finds a buyer. A withdrawal asks the protocol for ETH. Lido’s queue mints an NFT, waits for the accounting report to finalize the request, and pays ETH on claim. The wait includes Ethereum’s own exit limits. Before protocol withdrawals existed, the only exit was the market, and stETH could trade below the share value. That discount is not available as a historical curiosity only. Any time the queue is long or paused, the market price and the share rate can diverge again. A lending protocol that prices stETH at the share rate and ignores the queue is assuming an exit the seller may not have.

## What sits on top and beneath

Beneath the pool, a router decides which operator modules receive deposits, and a module’s rules set how much an operator has at stake. Lido’s Community Staking Module, for example, requires a bond held as stETH that covers penalties caused by the operator, so part of the first loss returns to the operator. See the [Lido page](/protocols/lido). On top of the pool, the liquid token can be restaked. That adds a service’s slashing conditions to the same capital, and the delays add up. See [restaking and slashing](/concepts/restaking-and-slashing) and [staking and restaking compared](/compare/staking-vs-restaking).

## What liquid staking is not

It is not a stablecoin. The token tracks ether, including penalties, not a dollar. It is not an AMM LP token. There is one underlying asset, not a pair. It is not a custody receipt for a named machine. The [oracle](/concepts/oracles-and-dependencies) that reports consensus balances, and the [governance](/concepts/governance-and-upgrades) that can upgrade the staking contracts or change operators, sit beside the ERC-20 interface. Dual Governance is Lido’s attempt to give the stakers time when those upgrades are contentious. It is described in the [exit guide](/guides/lido-exits). It does not remove the operators or the oracle.
