---
title: "Staking and restaking: Lido and EigenLayer compared"
seoTitle: "Liquid staking vs restaking: Lido vs EigenLayer risks"
description: "How Lido's pooled stETH and EigenLayer's delegated, slashable stake differ in what is promised, who decides faults, how exits work, and how the risks stack."
summary: "Lido turns staked ETH into a transferable share whose value follows Ethereum's rewards and penalties. EigenLayer takes staked ETH or tokens such as stETH and lets services claim slashable portions of them. One is a claim on validators. The other adds more conditions on top of that claim."
status: "published"
published: "2026-10-29"
lastVerified: "2026-10-29"
faq:
  - question: "Is restaking the same as liquid staking?"
    answer: "No. Liquid staking gives the depositor a transferable token for pooled validator stake. Restaking commits an already staked asset, native ETH or a token like stETH, to additional services that can slash it. The two can be stacked, in which case the holder carries Ethereum validator risk, the staking token's risk, and the services' conditions."
    featured: true
  - question: "Who decides when stETH is penalized versus when restaked ETH is slashed?"
    answer: "For stETH the penalty comes from Ethereum's own rules for validators and flows through Lido's oracle report into the share rate. For restaked stake the fault definition belongs to each service, executed through its slasher address. The EigenLayer contracts check the mechanics of a slash but not whether a fault happened."
  - question: "Which exit is slower, Lido or EigenLayer?"
    answer: "They are separate waits that add up when stacked. A Lido withdrawal request waits for the oracle report and for validators to exit, and the claim is an NFT. A EigenLayer queued withdrawal cannot complete for 100,800 blocks, about 14 days, and a deallocation also takes 14 days to apply."
order: 7
protocols:
  - lido
  - eigenlayer
concepts:
  - liquid-staking
  - restaking-and-slashing
  - security-assumptions
  - governance-and-upgrades
glossary:
  - steth
  - wsteth
  - share
  - restaking
  - avs
  - operator-set
  - unique-stake
  - slashing
tags:
  - staking
  - restaking
  - comparison
sources:
  - title: "Lido tokens integration guide"
    url: "https://github.com/lidofinance/docs/blob/main/docs/guides/lido-tokens-integration-guide.md"
    kind: "docs"
    publisher: "Lido"
  - title: "WithdrawalQueue ERC-721"
    url: "https://github.com/lidofinance/docs/blob/main/docs/contracts/withdrawal-queue-erc721.md"
    kind: "docs"
    publisher: "Lido"
  - title: "Slashing goes live on mainnet"
    url: "https://www.eigenlabs.org/blog/slashing-goes-live/"
    kind: "docs"
    publisher: "Eigen Labs"
  - title: "DelegationManager"
    url: "https://github.com/Layr-Labs/eigenlayer-contracts/blob/main/docs/core/DelegationManager.md"
    kind: "docs"
    publisher: "Eigen Labs"
  - title: "AllocationManager"
    url: "https://github.com/Layr-Labs/eigenlayer-contracts/blob/main/docs/core/AllocationManager.md"
    kind: "docs"
    publisher: "Eigen Labs"
---

[Lido](/protocols/lido) and [EigenLayer](/protocols/eigenlayer) both start from ETH locked in Ethereum validators. They do different things with that fact, and they are often combined, so the risks are worth separating before they are added.

## At a glance

| | Lido (liquid staking) | EigenLayer (restaking) |
| --- | --- | --- |
| What you hold | stETH or wstETH, a share of pooled ether | Deposit shares in a strategy or a pod, delegated to an operator |
| What is promised | Ether, net of Ethereum's rewards and penalties | Extra conditions: services can slash allocated stake |
| What causes a loss | Validator penalties and slashing on Ethereum, a bad oracle report, contract faults | All of those that apply to the asset, plus an operator set's slash |
| Who defines a fault | Ethereum's consensus rules | Each service, through its slasher address |
| How a loss reaches you | Through the share rate, for all holders | Through the operator's slashing factor, for all its delegators |
| Exit | Withdrawal request, oracle finalization, claim | Queued withdrawal, 14 days, after deallocation |
| Extra income | Staking rewards | Service rewards and EIGEN emissions |
| Governance of the contracts | DAO, with Dual Governance as a check | Upgradable core contracts, with a protocol registry |

## What the token represents

Lido's stETH is a transferable claim. Its balance is shares times pooled ether over total shares, and the oracle report changes the pooled ether. Everything in it is a consequence of Ethereum's rules and of Lido's operator set. The [liquid staking page](/concepts/liquid-staking) shows the share arithmetic.

EigenLayer holds no transferable claim of its own. A staker deposits and receives deposit shares inside EigenLayer, and those shares can be delegated. The asset a staker restakes can be stETH, which is why the layers stack.

## What can be taken

On Lido a penalty is a fact about validators. The share rate falls and every holder bears it in proportion. There is no discretion.

On EigenLayer a slash is an act by a service. It chooses the fraction, up to the whole allocation, and the contracts apply it. The operator's maximum magnitude falls by the slashed amount, which lowers every delegator's slashing factor, as the [protocol page](/protocols/eigenlayer) shows with numbers. A staker who never chose that service takes the loss through their operator.

## Exit

Lido's exit is a queue whose length depends on the oracle report and on validator exits. EigenLayer's is a fixed delay: 100,800 blocks, about 14 days, for a queued withdrawal, and the same for a deallocation to take effect. A staker holding stETH inside EigenLayer who wants plain ETH has to leave EigenLayer first, then request a Lido withdrawal, or sell stETH on a market and accept its price. The two delays are in series. See the [Lido exits guide](/guides/lido-exits) and the [EigenLayer slashing guide](/guides/eigenlayer-slashing).

## How the risks stack

For an ETH holder who stakes with Lido and restakes stETH:

1. Ethereum validator risk, passed through the share rate.
2. Lido's operator, oracle and contract risk.
3. The risk of the stETH token on markets, which can trade below its backing.
4. EigenLayer's contracts and upgrade process.
5. The operator's choice of services, and each service's slashing code.

The rewards are payment for the items beyond the first. A reader should ask which of them they could evaluate. Many holders can read item 1. Few can read item 5 without checking each operator set and slasher.

See [security assumptions](/concepts/security-assumptions) for the common list of what is trusted, and [governance and upgrades](/concepts/governance-and-upgrades) for the part played by upgradable contracts.
