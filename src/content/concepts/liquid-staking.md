---
title: "Liquid staking"
description: "How a liquid staking token represents pooled validator deposits, and why a transfer is not a withdrawal."
summary: "Liquid staking gives the depositor a transferable claim while validators earn rewards. Lido’s claim is a share of pooled ether. stETH rebases. wstETH does not. Getting ETH back is a queue finalized by an oracle, and the operators running validators are a separate trust assumption."
status: "published"
published: "2026-10-13"
lastVerified: "2026-10-13"
order: 11
group: "monetary"
tags:
  - staking
  - lido
protocols:
  - lido
glossary:
  - steth
  - wsteth
  - share
  - withdrawal-request
  - node-operator
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
  - title: "AccountingOracle.sol at core v3.0.2"
    url: "https://github.com/lidofinance/core/blob/v3.0.2/contracts/0.8.9/oracle/AccountingOracle.sol"
    kind: "code"
    publisher: "Lido"
---

Staking locks an asset in a validator so the consensus protocol will pay rewards and charge penalties. Liquid staking issues a token against that lock so the depositor can transfer the claim. The lock remains. The token is not the validator key, and selling the token does not exit the validator.

[Lido](/protocols/lido) is the concrete system. The shape is general: a pool, a share, an operator set, a reporter, and an exit queue.

<diagram-placeholder name="staking-flow"></diagram-placeholder>

## The share

Lido mints shares when ETH is submitted. The stETH balance is shares times pooled ether over total shares. Rewards increase pooled ether. A slashing decreases it. Every holder is in one pool, so a penalty is socialized across shares rather than charged to “the” validator a user picked. Users do not pick a validator in the basic deposit. The protocol assigns stake to [operators](/glossary#node-operator).

That socialization is the product. It is also the risk. One operator’s slashing changes the share rate for holders who never chose that operator. Module design and operator limits are how the protocol tries to bound the blast radius. They are governance parameters. The share math will apply whatever the report contains.

wstETH is the same share with a fixed balance. The wrapper locks stETH and mints the share count. Use it where a rebase would corrupt internal accounting. Do not use it as if it were a different asset with a different exit. Unwrapping or requesting withdrawal returns to the same queue.

## The exit

A transfer finds a buyer. A withdrawal asks the protocol for ETH. Lido’s queue mints an NFT, waits for the accounting report to finalize the request, and pays ETH on claim. The wait includes Ethereum’s own exit limits. Before protocol withdrawals existed, the only exit was the market, and stETH could trade below the share value. That discount is not available as a historical curiosity only. Any time the queue is long or paused, the market price and the share rate can diverge again. A lending protocol that prices stETH at the share rate and ignores the queue is assuming an exit the seller may not have.

## What liquid staking is not

It is not a stablecoin. The token tracks ether, including penalties, not a dollar. It is not an AMM LP token. There is one underlying asset, not a pair. It is not a custody receipt for a named machine. The [oracle](/concepts/oracles-and-dependencies) that reports consensus balances, and the [governance](/concepts/governance-and-upgrades) that can upgrade the staking contracts or change operators, sit beside the ERC-20 interface. Dual Governance is Lido’s attempt to give the stakers time when those upgrades are contentious. It is described in the [exit guide](/guides/lido-exits). It does not remove the operators or the oracle.
