---
title: "Ethena: how USDe is minted, staked and exited"
seoTitle: "Ethena USDe: minting, sUSDe cooldown and exit paths"
description: "The three ways in and out of Ethena's USDe: direct mint for approved parties, market trades for everyone else, and sUSDe with its vesting and cooldown."
summary: "Ethena has three distinct exits. Approved counterparties mint and redeem at a signed price. Everyone else sells USDe on a market at whatever price it trades. sUSDe holders unstake through a cooldown that the contract caps at 90 days, and the documents disagree on the current length."
status: "published"
published: "2026-10-29"
lastVerified: "2026-10-29"
faq:
  - question: "Can anyone redeem USDe for a dollar?"
    answer: "Not directly. Ethena's documentation limits direct minting and redeeming to approved market-making counterparties that clear KYC and KYB checks. Other holders sell USDe on exchanges or AMM pools, so their exit price is the market price, which can differ from the value of the backing."
    featured: true
  - question: "Why does sUSDe have a cooldown?"
    answer: "The contract is an ERC-4626 vault with an added cooldown so assets cannot be staked and withdrawn within a single block, and rewards vest over eight hours to prevent sniping a payment. On unstaking the sUSDe is burned immediately and the USDe waits in a silo contract until the cooldown ends."
  - question: "Is the sUSDe cooldown 7 days or 14 days?"
    answer: "The documents differ. The contract overview mentions 14 days, the staking page says the cooldown is dynamic and currently between 1 and 7 days, and a user guide says 7 days. The code caps it at 90 days and an admin role sets it, so the staking contract's cooldownDuration variable is the one that governs."
order: 8
protocol: "ethena"
versionContext: "Figures such as cooldown length and redemption buffers are parameters that change. The contracts and the live dashboard decide, not the prose in any document."
tags:
  - ethena
  - susde
  - redemption
concepts:
  - delta-neutral-dollars
  - stablecoin-mechanisms
glossary:
  - usde
  - susde
  - off-exchange-settlement
  - reserve-fund
  - erc-4626
relatedGuides: []
versions:
  - name: "Direct mint and redeem"
    status: "active"
    note: "Signed EIP-712 orders from approved counterparties, executed by Ethena's backend."
  - name: "Market exit"
    status: "active"
    note: "Sell USDe on external AMM pools or exchanges. Price is set by the market."
  - name: "sUSDe unstaking"
    status: "active"
    note: "Burn sUSDe, wait out the cooldown in a silo contract, then withdraw USDe."
sources:
  - title: "Ethena overview"
    url: "https://docs.ethena.fi/"
    kind: "docs"
    publisher: "Ethena"
  - title: "Minting USDe"
    url: "https://docs.ethena.fi/technical-design/minting-usde"
    kind: "docs"
    publisher: "Ethena"
  - title: "Peg arbitrage mechanism"
    url: "https://docs.ethena.fi/protocol-overview/peg-arbitrage-mechanism"
    kind: "docs"
    publisher: "Ethena"
  - title: "Rewards mechanism"
    url: "https://docs.ethena.fi/protocol-overview/rewards-mechanism"
    kind: "docs"
    publisher: "Ethena"
  - title: "GitHub overview of core contracts"
    url: "https://docs.ethena.fi/technical-design/overview/github-overview"
    kind: "docs"
    publisher: "Ethena"
  - title: "StakedUSDeV2.sol"
    url: "https://github.com/ethena-labs/bbp-public-assets/blob/main/contracts/contracts/StakedUSDeV2.sol"
    kind: "code"
    publisher: "Ethena"
  - title: "StakedUSDe.sol"
    url: "https://github.com/ethena-labs/bbp-public-assets/blob/main/contracts/contracts/StakedUSDe.sol"
    kind: "code"
    publisher: "Ethena"
  - title: "Reserve fund"
    url: "https://docs.ethena.fi/protocol-overview/reserve-fund"
    kind: "docs"
    publisher: "Ethena"
---

Holding USDe or sUSDe is easy. Leaving is where the design shows. Ethena has three exits with different prices, different delays and different gatekeepers, and a holder is in only one of them at a time.

The [protocol page](/protocols/ethena) covers the mechanism. This guide follows a holder's options.

## Path 1: direct mint and redeem

The documentation says direct minting and redeeming are open to approved market-making counterparties after KYC and KYB checks. Everyone else is meant to use markets.

The mechanics, as the contract overview describes them:

1. The counterparty signs an EIP-712 order against an off-chain price from Ethena.
2. Ethena's backend runs checks and submits the order. By design only Ethena calls `mint()` and `redeem()`.
3. On a mint the incoming assets go to a registered custodian. A hedge is opened against them at an exchange.
4. On a redeem the minting contract pays out backing assets it holds, and a large redemption is spread over several blocks.

Execution costs and slippage are included in the price and Ethena states it earns no profit from minting or redeeming. On-chain controls cap how much can be minted or redeemed per block, and gatekeeper roles can halt the flow.

What this path offers is a price anchor. Because an approved party can redeem at about a dollar, a market price well below that invites arbitrage: buy cheap on a market, redeem, keep the difference. The peg page gives this exact example with USDe at 0.95 on Curve. That works only for those with access, and only as fast as backing can be unwound. The page says that about 0.5 percent of backing is typically held in stablecoin form in the minting contract for on-demand redemptions, which implies that larger redemptions depend on unwinding hedges and moving assets from custody. Treat the percentage as the documentation's own and check current figures.

## Path 2: sell on a market

For most holders this is the exit. USDe is sold on a decentralized exchange or a centralized venue. The price is whatever buyers pay, and it can deviate from the value of the backing in either direction, especially under stress or in thin pools. The documentation notes that fluctuations in external markets can cause temporary dislocations in USDe's secondary price without changing the value of the backing.

Two practical consequences. First, the quality of exit depends on pool depth and on who is arbitraging, so the same position has a different cost on a quiet day and during a rush. Second, other protocols that accept USDe as collateral, such as lending markets, price it from markets or oracles, so a dislocation can matter to a borrower even when the backing is intact. See [oracles and dependencies](/concepts/oracles-and-dependencies).

## Path 3: sUSDe and the cooldown

Staking USDe mints sUSDe from an ERC-4626 vault. There is no minimum staking period for the entry. The exit has a cooldown.

How the contract handles it, as shown in `StakedUSDeV2`:

- When cooldown is on, `withdraw` and `redeem` are disabled. The holder calls `cooldownAssets` or `cooldownShares` instead.
- The sUSDe is burned right away and the corresponding USDe is moved to a silo contract. The cooldown end time is recorded.
- After the end time, the holder calls `unstake` and the silo releases the USDe.
- An admin role can set the duration up to a maximum of 90 days. If the duration is set to zero, the ordinary ERC-4626 functions work again.

During the cooldown the holder has no sUSDe and no USDe in hand, only a pending claim. The documentation also says restricted addresses can be blacklisted and their locked amount redistributed, which it describes as legally required.

The cooldown length is an example of a figure to read from the chain. The contract overview says 14 days. The staking explainer says the cooldown is dynamic, currently between 1 and 7 days, depending on reserve conditions and set by governance. A user guide says 7 days. All three are in the documentation set at once. The safe approach is to read `cooldownDuration` on the staking contract and treat prose as a snapshot.

A common alternative to unstaking is to sell sUSDe itself on a market, since the token is transferable. That passes the wait to the buyer and exposes the seller to a market discount.

## Rewards, vesting and what you actually earn

New rewards are paid into the contract in USDe and vest linearly over eight hours. The vault's asset count excludes the unvested part, so share price rises smoothly. A reader who looks at the last eight hours of share price movement will get a different number from the published APY, because, per the documentation, rewards are calculated weekly and paid in several payments the following week, and the published APY compounds weekly.

The protocol says sUSDe accrues only positive or flat rewards, and that negative revenue is meant to be absorbed by the reserve fund. That statement is policy. A holder can verify the fund's size on the transparency dashboard.

## Comparing the exits

| | Direct mint/redeem | Market sale | sUSDe unstake |
| --- | --- | --- | --- |
| Who | Approved counterparties | Anyone | sUSDe holders in permitted jurisdictions |
| Price | Signed price, about a dollar | Market price | Value at the time of burn |
| Delay | Minutes to blocks | Immediate | Cooldown, up to 90 days by code |
| Limited by | Per-block caps, backing liquidity | Pool depth | Cooldown parameter |
| Main risk | Access, operational pause | Discount to backing | Waiting with no position |

The acquisition of sUSDe is stated as not offered to persons habitually resident in the EU or EEA, and staking is described as available only in permitted jurisdictions. Check the current terms before assuming any path is open to you.
