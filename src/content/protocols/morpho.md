---
title: "Morpho"
seoTitle: "How Morpho works: isolated markets, vaults, Midnight"
description: "How Morpho Blue isolates each loan in its own immutable market, how curated vaults route deposits, and how Midnight prices fixed-rate loans."
summary: "Morpho is a lending base layer. One small immutable contract holds many isolated markets, each with one collateral, one loan asset, one oracle, one rate model and one liquidation threshold. Vaults chosen by curators route deposits, and Midnight adds fixed-rate, fixed-term loans priced by trade, not by utilization."
status: "published"
published: "2026-10-29"
lastVerified: "2026-10-29"
faq:
  - question: "How is Morpho Blue different from Aave?"
    answer: "Aave lists many assets in one pool with parameters set by governance. Morpho Blue holds many separate markets, each pairing one collateral with one loan asset and fixing the oracle, interest rate model and LLTV forever at creation. Anyone can create a market from approved parameters, and a loss in one market does not reach another."
    featured: true
  - question: "Who sets the interest rate on a Morpho market?"
    answer: "The market's interest rate model, chosen at creation from a list governance approves. At the time of reading the only approved model is the AdaptiveCurveIRM, which targets 90 percent utilization and moves the whole curve up when utilization stays above target and down when it stays below, within 0.1 percent and 200 percent at the target."
  - question: "What is a Morpho curator?"
    answer: "A curator configures a vault: which markets or adapters it can use, how much it may put in each, and what fees it charges. In Vault V2 most curator actions wait behind a timelock of up to three weeks, an allocator moves funds inside the limits, and a sentinel can only reduce risk."
    featured: true
  - question: "What is the liquidation bonus on Morpho?"
    answer: "The liquidation incentive factor is the smaller of 1.15 and 1 divided by (1 minus 0.3 times (1 minus LLTV)). At an 86 percent LLTV it is about 1.044, so a liquidator seizes about 4.4 percent more collateral value than the debt it repays. All of it goes to the liquidator and Morpho takes no cut."
  - question: "What is Morpho Midnight?"
    answer: "A fixed-rate, fixed-term lending protocol. A market has one loan token, one maturity and a fixed set of collateral. Lenders hold credit units and borrowers owe debt units, each worth one loan token at maturity, and the rate is locked by the price at which a trade settles."
order: 6
category: "Lending"
mechanism: "A singleton contract of isolated, immutable lending markets, with curated vaults on top and a separate fixed-rate market protocol."
versionContext: "Morpho Blue is the variable-rate core. Vault V2 is the current vault design, and V1 vaults remain in use. Midnight is a separate fixed-rate contract set with its own addresses."
tags:
  - lending
  - morpho
  - isolated-markets
concepts:
  - isolated-markets-and-curation
  - lending-utilization
  - interest-rate-models
  - collateral-and-liquidation
  - oracles-and-dependencies
  - flash-liquidity
guides:
  - morpho-versions
glossary:
  - isolated-market
  - lltv
  - curator
  - allocator
  - midnight
  - bad-debt
  - erc-4626
  - flash-loan
versions:
  - name: "Morpho Blue"
    status: "active"
    note: "The immutable core. Markets are created permissionlessly from governance-approved LLTVs and interest rate models."
  - name: "Vaults V1"
    status: "active"
    note: "Legacy vaults. Docs describe different bad-debt handling for V1.0 and V1.1."
  - name: "Vaults V2"
    status: "active"
    note: "Adapter-based vaults with absolute and relative caps, timelocks and a sentinel role."
  - name: "Midnight"
    status: "active"
    note: "Fixed-rate, fixed-term markets with separate contracts. Press reports said vaults could not yet allocate to it pending DAO action."
sources:
  - title: "Morpho markets"
    url: "https://docs.morpho.org/learn/concepts/market"
    kind: "docs"
    publisher: "Morpho"
  - title: "Morpho vaults"
    url: "https://docs.morpho.org/learn/concepts/vault"
    kind: "docs"
    publisher: "Morpho"
  - title: "Morpho liquidation"
    url: "https://docs.morpho.org/learn/concepts/liquidation"
    kind: "docs"
    publisher: "Morpho"
  - title: "Morpho core contract reference"
    url: "https://docs.morpho.org/get-started/resources/contracts/morpho"
    kind: "docs"
    publisher: "Morpho"
  - title: "Adaptive curve interest rate model"
    url: "https://docs.morpho.org/get-started/resources/contracts/irm"
    kind: "docs"
    publisher: "Morpho"
  - title: "Morpho oracles"
    url: "https://docs.morpho.org/get-started/resources/contracts/oracles"
    kind: "docs"
    publisher: "Morpho"
  - title: "Morpho governance and organization"
    url: "https://docs.morpho.org/learn/governance/organization/"
    kind: "governance"
    publisher: "Morpho"
  - title: "Morpho.sol"
    url: "https://github.com/morpho-org/morpho-blue/blob/main/src/Morpho.sol"
    kind: "code"
    publisher: "Morpho"
  - title: "ConstantsLib.sol"
    url: "https://github.com/morpho-org/morpho-blue/blob/main/src/libraries/ConstantsLib.sol"
    kind: "code"
    publisher: "Morpho"
  - title: "Midnight: get started"
    url: "https://docs.morpho.org/developers/midnight/get-started/"
    kind: "docs"
    publisher: "Morpho"
  - title: "Morpho deployed addresses"
    url: "https://docs.morpho.org/get-started/resources/addresses"
    kind: "docs"
    publisher: "Morpho"
  - title: "Morpho expands fixed-rate Midnight markets to Ethereum"
    url: "https://thedefiant.io/news/defi/morpho-expands-fixed-rate-midnight-markets-to-ethereum"
    kind: "research"
    publisher: "The Defiant"
---

Aave and Compound were built as pools. Many assets sit in one contract, governance decides which ones count as collateral, and every supplier shares the same risk budget. Morpho starts from a smaller question: what is the least a lending contract can do, if every risk choice is made when a market is created and cannot be changed afterward?

The answer is Morpho Blue, a compact singleton contract that holds any number of [isolated markets](/glossary/isolated-market/). Everything else in the Morpho system, vaults, curators and the fixed-rate Midnight protocol, is built on top of or beside it. The [concept page](/concepts/isolated-markets-and-curation) covers the design trade-off. This page is the mechanism. The [versions guide](/guides/morpho-versions) separates Blue, the vault generations and Midnight.

## One contract, many markets

A market is defined by five values stored in a `MarketParams` struct: `loanToken`, `collateralToken`, `oracle`, `irm` and `lltv`. The market id is the keccak256 hash of those five fields. Nothing else identifies a market and nothing about it can be edited. Creating one is permissionless: the contract only checks that the interest rate model and the LLTV have been enabled by governance and that the id does not exist yet.

The contract tracks, per market, `totalSupplyAssets`, `totalSupplyShares`, `totalBorrowAssets`, `totalBorrowShares`, the time of last accrual and a fee. Lenders and borrowers hold **shares** of those totals, not balances. Interest raises the asset totals without changing share counts, which is the same idea as [Aave's liquidity index](/concepts/on-chain-accounting) expressed in a simpler form. Conversions are rounded in the protocol's favor, for example borrowed assets are rounded up in the health check.

The main functions are `supply`, `withdraw`, `borrow`, `repay`, `supplyCollateral`, `withdrawCollateral`, `liquidate` and `flashLoan`. In the functions that take either an asset amount or a share amount, exactly one must be zero. Collateral supplied earns no interest and is not lent out.

The docs list two limits on the share arithmetic that a market creator should know. About 1e35 assets can overflow the conversions, and a market with very few borrowed assets (under 1e4 units) can have its share price manipulated. Both are the kind of edge case that curators and interfaces filter out before showing a market.

<diagram-placeholder name="morpho-structure"></diagram-placeholder>

## The rate model

A market's `irm` must be one governance has enabled, and an enabled model cannot be disabled. The documentation names one approved model, the **AdaptiveCurveIRM**. It prices borrowing as a curve around a target utilization and moves the curve itself over time.

```text
error(u)  = (u - 0.9) / 0.1        if u > 0.9
          = (u - 0.9) / 0.9        otherwise
curve(u)  = 3 * error(u) + 1       if u > 0.9
          = 0.75 * error(u) + 1    otherwise
rate(u)   = rateAtTarget * curve(u)
```

The constants are the documented ones: target utilization 90 percent, curve steepness 4, adjustment speed 50 per year, an initial rate at target of 4 percent, a floor of 0.1 percent and a ceiling of 200 percent. At 100 percent utilization the curve gives four times the rate at target.

The distinctive part is `rateAtTarget`. It is stored per market and shifts continuously: upward while utilization is above 90 percent, downward while it is below, and faster the farther utilization is from target. The documentation says that 100 percent utilization sustained for five days roughly doubles it, which is the maximum speed. A fixed-slope model like those in [interest rate models](/concepts/interest-rate-models) needs governance to retune it after a regime change. This one tunes itself, and the cost is that the rate is path-dependent.

Interest accrues when a market is touched, by compounding the borrow rate over the elapsed time with a Taylor approximation. The owner can set a per-market fee, capped at 25 percent of interest in the contract. The fee is paid as extra supply shares to a fee recipient.

## Health and liquidation

A position is healthy while its borrowed assets, rounded up, do not exceed `collateral × oracle price × LLTV`, with the arithmetic rounded in the protocol's favor. The price comes from the market's oracle, which returns the price of one collateral unit in loan-token units scaled by 1e36.

Anyone may liquidate an unhealthy position. The caller passes either the collateral to seize or the debt shares to repay, never both. The bonus is the **liquidation incentive factor**:

```text
LIF = min(1.15, 1 / (1 - 0.3 * (1 - LLTV)))
```

At an 86 percent LLTV that is 1 / (1 − 0.3 × 0.14) = 1.0438. At a 94.5 percent LLTV it is about 1.0168. The cap of 1.15 binds only below an LLTV of roughly 56.5 percent. Morpho takes no cut of the bonus.

There is no close factor. A liquidator may repay any amount up to the whole debt. A worked case at 86 percent LLTV: collateral worth 100,000, debt 86,500, so the position is unhealthy. A liquidator repays 50,000 of debt and seizes 50,000 × 1.0438 = 52,190 of collateral. What remains is 47,810 of collateral against 36,500 of debt, a loan-to-value of 76.3 percent, back below the threshold.

If a liquidation leaves a borrower with no collateral but remaining debt, the contract writes the leftover debt off in the same call. It removes the borrow shares and subtracts the amount from `totalSupplyAssets`, so suppliers in that market take the loss pro rata. This is the clearest consequence of isolation: the loss is real, but it stops at the market boundary. The liquidator can also receive the collateral first and repay inside a callback, which is how a liquidation can be funded by selling the collateral itself.

`flashLoan` lends against the contract's whole token balance, across every market, with a fee of zero. The [flash liquidity](/concepts/flash-liquidity) page covers the general pattern.

## Oracles are part of the market

The oracle is not an external setting that governance can swap. It is one of the five parameters. The interface Blue calls is a `price()` view. The docs note that an oracle can revert, which can block borrowing, collateral withdrawal and liquidation.

Morpho publishes `MorphoChainlinkOracleV2`, which composes up to two Chainlink-interface feeds on each side and can fold in an ERC-4626 vault's exchange rate, for cases like a staked token priced through its underlying. The docs state the assumptions: vaults are ERC-4626 compliant, feeds are Chainlink-interface compliant, and the decimals passed in are right. A market creator who gets any of these wrong creates a market that prices incorrectly forever. See [oracles and dependencies](/concepts/oracles-and-dependencies).

## Vaults and curators

Most depositors do not choose among markets. They deposit into a vault, and a curator chooses for them. In Vault V2 the docs define roles:

- **Owner** appoints the curator and sentinels and has no direct control of assets or risk parameters.
- **Curator** configures adapters, caps and fees. Most actions are timelocked, configurable from zero to three weeks, and the timelock can be made permanent with `abdicate`.
- **Allocator** places funds with enabled adapters, sets the `liquidityAdapter` and a maximum rate.
- **Sentinel** can reduce risk by deallocating assets, lowering caps or revoking a pending action.

Caps come in two forms, an absolute amount and a share of the vault, and attach to abstract risk ids such as a collateral asset or an oracle and LLTV pair. An *adapter* translates between the vault and a venue and reports its value through `realAssets()`. Fees can include a performance fee of up to 50 percent of yield and a management fee of up to 5 percent of assets, both set by the curator. Idle assets sit in the vault, and the liquidity adapter receives new deposits and covers withdrawals when idle assets run short.

The losses described above reach vault depositors differently by version, and the [curation concept page](/concepts/isolated-markets-and-curation) lists the differences. The practical point is that a vault's share price is a lagging record of what happened inside markets.

## Midnight

Midnight, listed in the docs as the fixed-rate protocol beside Blue, drops the utilization curve. A market has one loan token, one maturity and a fixed set of accepted collateral. Its parameters are immutable after creation. A lender holds credit units, each a claim on one loan token at maturity. A borrower owes debt units. The rate emerges from the price at which units are taken, and is locked when a take settles. Lenders take asks, borrowers take bids, and makers publish signed offers.

Before maturity a position can be partially liquidated once debt exceeds its limit. After maturity, unpaid debt can be liquidated in part or in full. If liquidation does not cover the debt, losses can be spread to lenders through a *market loss factor*. Credit is redeemable one-for-one, net of fees and losses, up to the loan tokens available to withdraw. Lenders in a market are exposed to the whole accepted collateral set, not only to what borrowers actually posted.

The addresses page lists separate Midnight contracts on Ethereum, Arc, Base, Robinhood Chain and Tempo. A press report at the time of reading said that vaults, which hold a large balance, could not yet allocate to Midnight pending DAO action. That is a governance state that can change, so check the current documentation.

## Governance and what is trusted

The documentation says the core contract is immutable and that governance is limited. Its powers are to enable new LLTVs and rate models, to switch on a fee up to 25 percent and set its recipient, and to control the MORPHO token and treasury. Approved actions are carried out by a five-of-nine multisig. The same page lists no timelock for those actions, so a depositor relies on the narrowness of the powers, not on a delay.

What remains trusted: each market's oracle and its operator, the curator of any vault, the vault's version and its adapters, the front end and the data indexers a user relies on, and, in Midnight, offer makers and the solver or router that builds a take. The core contract's small size is its argument for safety, but it does not audit a market's inputs.
