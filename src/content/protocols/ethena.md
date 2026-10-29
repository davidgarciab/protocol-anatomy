---
title: "Ethena"
seoTitle: "How Ethena works: USDe, sUSDe and delta-neutral backing"
description: "How Ethena's USDe stays near a dollar with hedged backing, who can mint it, how sUSDe accrues yield, and where custody, funding and cooldown risks sit."
summary: "Ethena issues USDe, a synthetic dollar backed by assets whose price risk is hedged with short futures, plus stable assets. Approved counterparties mint and redeem against signed prices. Everyone else trades it on markets, and holders can stake it as sUSDe, an ERC-4626 vault paid from protocol revenue."
status: "published"
published: "2026-10-29"
lastVerified: "2026-10-29"
faq:
  - question: "Is USDe a normal stablecoin?"
    answer: "No. Ethena's own documentation says USDe is not the same as a fiat stablecoin like USDC or USDT. It is a synthetic dollar backed by crypto assets and matching short futures positions, plus stable assets such as liquid stablecoins and short-duration real-world assets. The risks differ, and the documentation lists funding, liquidation, custodial, exchange failure and backing-asset risks."
    featured: true
  - question: "Who can mint and redeem USDe?"
    answer: "Direct minting and redeeming is limited to approved market-making counterparties that clear KYC and KYB checks. A user signs an EIP-712 order against an off-chain price, Ethena's backend runs checks and submits it, and only that backend calls mint and redeem. Anyone else acquires USDe on external AMM pools or exchanges."
    featured: true
  - question: "How does sUSDe earn yield?"
    answer: "sUSDe is an ERC-4626 vault. Reward payments of USDe are added to the staking contract and vest linearly over eight hours, which raises the USDe value of each sUSDe. The protocol states that sUSDe accrues only positive or flat rewards, with negative revenue meant to be absorbed by the reserve fund."
  - question: "How long does it take to unstake sUSDe?"
    answer: "Unstaking goes through a cooldown, a parameter the contract caps at 90 days. Ethena's documents give different current figures, including 14 days in the contract overview and between 1 and 7 days in the staking page, so read cooldownDuration on the staking contract before relying on any number."
  - question: "Where are Ethena's backing assets held?"
    answer: "With regulated custodians, named in the documentation as Copper, Ceffu, Kraken and Anchorage Digital, under an arrangement called off-exchange settlement. The custodian delegates margin value to an exchange without transferring the assets, and profit and loss settle on frequent cycles, generally daily."
order: 8
category: "Synthetic dollar"
mechanism: "Hedged backing assets, signed-order minting for approved counterparties, and a staking vault paid from backing revenue."
versionContext: "The documentation now describes a diversified backing portfolio, not only the original ETH staking and short perpetual trade. sUSDe cooldown figures differ between documents, and the contract sets the live value."
tags:
  - stablecoin
  - ethena
  - delta-neutral
concepts:
  - delta-neutral-dollars
  - stablecoin-mechanisms
  - oracles-and-dependencies
  - security-assumptions
  - governance-and-upgrades
guides:
  - ethena-mint-and-exit
glossary:
  - usde
  - susde
  - delta-neutral
  - funding-rate
  - off-exchange-settlement
  - reserve-fund
  - erc-4626
versions:
  - name: "USDe with ETH and LST backing"
    status: "historical"
    note: "The original basis trade: staked ETH or ETH against short perpetuals, with funding as the main income."
  - name: "USDe with diversified backing"
    status: "active"
    note: "The documentation lists crypto and non-crypto basis trades, on-chain and institutional lending, tokenized real-world assets and liquid stablecoins."
  - name: "sUSDe"
    status: "active"
    note: "ERC-4626 staking vault with eight-hour reward vesting and a cooldown on unstaking."
  - name: "USDtb"
    status: "active"
    note: "A separate dollar stablecoin that the documentation says is issued by Anchorage Digital Bank."
sources:
  - title: "Ethena overview"
    url: "https://docs.ethena.fi/"
    kind: "docs"
    publisher: "Ethena"
  - title: "How USDe works"
    url: "https://docs.ethena.fi/overview/how-usde-works"
    kind: "docs"
    publisher: "Ethena"
  - title: "Delta-neutral stability"
    url: "https://docs.ethena.fi/backing-assets/crypto-basis-trade/delta-neutral-stability"
    kind: "docs"
    publisher: "Ethena"
  - title: "Backing assets overview"
    url: "https://docs.ethena.fi/backing-assets/overview"
    kind: "docs"
    publisher: "Ethena"
  - title: "Off-exchange custody"
    url: "https://docs.ethena.fi/overview/off-exchange-custody"
    kind: "docs"
    publisher: "Ethena"
  - title: "Rewards mechanism"
    url: "https://docs.ethena.fi/protocol-overview/rewards-mechanism"
    kind: "docs"
    publisher: "Ethena"
  - title: "Reserve fund"
    url: "https://docs.ethena.fi/protocol-overview/reserve-fund"
    kind: "docs"
    publisher: "Ethena"
  - title: "Risks"
    url: "https://docs.ethena.fi/protocol-overview/risks"
    kind: "docs"
    publisher: "Ethena"
  - title: "Peg arbitrage mechanism"
    url: "https://docs.ethena.fi/protocol-overview/peg-arbitrage-mechanism"
    kind: "docs"
    publisher: "Ethena"
  - title: "Risk Committee"
    url: "https://docs.ethena.fi/protocol-overview/governance/risk-committee"
    kind: "governance"
    publisher: "Ethena"
  - title: "Minting USDe"
    url: "https://docs.ethena.fi/technical-design/minting-usde"
    kind: "docs"
    publisher: "Ethena"
  - title: "GitHub overview of core contracts"
    url: "https://docs.ethena.fi/technical-design/overview/github-overview"
    kind: "docs"
    publisher: "Ethena"
  - title: "Key trust assumptions"
    url: "https://docs.ethena.fi/technical-design/key-trust-assumptions"
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
  - title: "ENA and governance"
    url: "https://docs.ethena.fi/overview/ena"
    kind: "governance"
    publisher: "Ethena"
---

Maker and Sky issue a dollar against collateral worth more than the debt. Tether and Circle hold bank deposits and Treasury bills. Ethena found a third answer: hold assets that move, take the opposite position in futures so the pair does not move, and let that pair stand behind a dollar token. The result, USDe, is a different kind of promise from either of the others, and the risk list is different too.

The [delta-neutral dollars concept page](/concepts/delta-neutral-dollars) shows the hedge with numbers. This page covers how Ethena's contracts and operations implement it. The [mint and exit guide](/guides/ethena-mint-and-exit) covers how a holder gets in and out.

## What stands behind USDe

The documentation says USDe derives its relative peg stability from holding a diversified portfolio of backing assets and hedging the price risk of any volatile holdings. Volatile assets, spot crypto, tokenized equities and tokenized commodities, are paired with short futures in about the same notional size. Stable assets, liquid stablecoins and short-duration real-world assets, are already dollar-valued and need no hedge. The documentation calls the combination delta-neutral backing, and says USDe only needs one-to-one backing in most market conditions because the hedge offsets the price move.

The original design was narrower: staked ETH or ETH against short perpetuals, with the funding rate as the main income. The documentation now lists six sources of revenue:

- funding on crypto basis trades;
- funding on non-crypto basis trades, such as tokenized commodities;
- lending revenue from on-chain lending markets, naming Morpho and Aave as examples;
- lending revenue from overcollateralized loans to institutional counterparties;
- yield on tokenized real-world assets, including short-duration government debt and high-liquidity credit;
- rewards on liquid stablecoin holdings.

Weights shift between them, subject to governance and a Risk Committee. In the documentation's account, when crypto funding compresses the portfolio leans toward lending and real-world assets, and when it widens the portfolio returns to crypto basis trades. For a reader this means "USDe" no longer names one trade. The mix at any date is a fact to look up on the transparency dashboard, not a constant.

## Minting and redeeming

USDe is an ERC-20 whose contract has a single `minter` address, set by its owner and pointed at the `EthenaMinting` contract. The documentation describes the minter permission as one of the most powerful non-owner roles, since it can create an unlimited amount of USDe, which is why the surrounding controls matter.

Minting works by signed order. A user, in practice an approved market maker, signs an EIP-712 order against a price Ethena supplies off chain. The order goes to Ethena's backend, which runs checks and submits it on chain. By design, Ethena is the only caller of `mint()` and `redeem()`. A `route` parameter says where the incoming assets go and must be one of the registered custodian addresses, so funds end up with custodians within a single transaction. Redemption pays from backing assets the minting contract holds for the purpose, and a large redemption may take several blocks.

Three controls limit damage if the minter key is compromised. An on-chain limit applies to the amount minted and redeemed per block. `GATEKEEPER` roles can disable minting and redemption and remove minters. Only the default admin role can re-enable them. The documentation also says gatekeepers run in separate accounts that Ethena does not control.

Ethena states that it earns no profit from minting or redeeming, since slippage and execution costs are included in the price. Direct mint and redeem is open only to approved market-making counterparties after KYC and KYB checks. Everyone else acquires USDe on external pools and exchanges, which is also how the peg is arbitraged. The peg arbitrage page describes approved users minting when USDe trades above a dollar on an external market and redeeming when it trades below.

<diagram-placeholder name="delta-neutral-flow"></diagram-placeholder>

## Custody: off-exchange settlement

The largest historic risk to a synthetic dollar, the documentation says, is holding backing on exchanges. Ethena's answer is **off-exchange settlement**. Backing stays with regulated custodians, named as Copper, Ceffu, Kraken and Anchorage Digital. To support a short at an exchange, the custodian delegates a notional value as margin without transferring the assets. The exchange cannot withdraw them. Profit and loss settle between exchange and custodian on frequent cycles, generally daily, so the exposure to an exchange is bounded by what accumulated since the last settlement.

The documentation lists the claimed benefits: bankruptcy remoteness from the exchange, exchange-posted collateral at the custodian, bounded exposure windows, separation of custody and execution, protocol-controlled deposits and withdrawals, custodian redundancy, and verifiability through on-chain wallets or attestations published at least monthly. These are design claims by the issuer. A reader who wants to verify them should check the custodian attestations and addresses in the documentation, and note that assets in omnibus arrangements cannot be seen on chain.

## sUSDe

sUSDe is the staked form of USDe. The staking contract is the ERC-4626 vault from OpenZeppelin, modified in two ways that the code shows.

**Vested rewards.** When the rewarder role sends USDe to the contract, the amount vests linearly over eight hours. The contract's asset count excludes the unvested portion, so a staker cannot deposit just before a payment and withdraw just after it. A worked case with round numbers: 1,000,000 USDe is staked against 1,000,000 sUSDe, so each is worth 1.0000 USDe. A reward of 3,000 USDe arrives. Four hours later half has vested and each sUSDe is worth 1.0015. After eight hours each is worth 1.0030, and the value continues from there until the next payment.

**Cooldown.** The contract can require a cooldown before USDe is withdrawn. When a holder starts to unstake, their sUSDe is burned and the USDe moves to a separate silo contract. After the cooldown they call `unstake` to receive it. The contract's maximum is 90 days. The current value is an on-chain variable set by an admin role, and the documents disagree about it: one says 14 days, another says it is dynamic and currently between 1 and 7 days, and a user guide says 7 days. The only reliable figure is the contract's `cooldownDuration`.

The reward flow is partly off chain. The documentation says a subsidiary of the Ethena Foundation calculates APY weekly and distributes rewards through a StakingRewardsDistributor contract, in several smaller payments through the following week, so reward flows can differ from a rate inferred from the latest eight-hour window. The documentation also says sUSDe accrues only positive or flat rewards, and that negative revenue is meant to fall on the reserve fund. Both statements describe a policy of the protocol, not a property the contract enforces.

The staking contract also has a blacklist role and an admin function that can redistribute a restricted address's locked amount, which the documentation describes as legally required. The documentation also states that sUSDe is not offered to persons habitually resident in the EU or EEA.

## The reserve fund

The reserve fund is a pool of assets meant to absorb periods in which the cost of keeping hedges exceeds the income from backing, and to cover shortfalls from the listed risks. The documentation says it was funded from revenue during high-revenue periods and that the share of revenue now directed to it is 0 percent, with all revenue going to incentives and distribution. Its current size is shown on a transparency dashboard. A reader should look at that figure, not the existence of the fund.

## Governance, ENA and the Risk Committee

ENA is the governance token. It governs the composition of backing, the introduction of new strategies, the allocation of protocol revenue and the Risk Committee's membership and remit. The Risk Committee sets eligibility of backing assets, exposure limits, counterparty limits and conditions such as the fee switch. The documentation says it has three members whose terms lapse every six months and are put to a governance vote, and names Blockworks Advisory, LlamaRisk and Kairos Research for the term it describes. ENA can be staked as sENA, an ERC-4626 wrapper with its own unstaking cooldown. Proposals go through the governance forum and an on-chain vote.

## The risk list

The documentation names seven categories: funding, liquidation, custodial, exchange failure, backing assets, stablecoin-related, and margin collateral. In plain terms:

- **Funding.** Negative funding means paying to hold the hedge.
- **Liquidation of the short.** The short loses when prices rise and needs margin. A fast move can require more margin than can be posted in time.
- **Custody and exchange.** Custodian or exchange failure, freeze or dispute.
- **Backing assets.** A staking token used as collateral can depeg from the asset that hedges it.
- **Stablecoin and margin.** Linear perpetuals are margined in USDT, which leaves the issuer long USDT.

Liquidity is the risk that is easy to miss. A holder who cannot mint or redeem directly exits through a market, so the price on that market sets the exit, whatever the backing is worth. The same page says about 0.5 percent of backing is typically kept in stablecoin form in the minting contract for on-demand redemptions, replenished from the roughly 4 percent of backing held as stablecoins. Those percentages are the page's own and may be out of date, so treat them as a prompt to check the dashboard. Larger redemptions need the backing to be unwound first. See [stablecoin mechanisms](/concepts/stablecoin-mechanisms) for the family comparison and [collateralized and synthetic dollars compared](/compare/collateralized-vs-synthetic-dollars) for a side-by-side with Sky.
