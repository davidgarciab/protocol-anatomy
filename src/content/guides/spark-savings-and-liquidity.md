---
title: "Spark Savings and liquidity intents"
seoTitle: "Spark Savings vaults: spUSDC, sUSDS, sDAI and withdrawals"
description: "How Spark's savings tokens differ, which rate each one earns, how large withdrawals work through liquidity intents, and what the liquidity buffer means."
summary: "Spark lists nine savings tokens that look alike and are not. Some earn a Sky-set rate, some earn from Spark Liquidity Layer allocations at a rate Spark governance sets, and one lends against SKY. Small withdrawals use an idle buffer. Larger ones are signed requests that the Liquidity Layer fills."
status: "published"
published: "2026-10-29"
lastVerified: "2026-10-29"
faq:
  - question: "What is the difference between sUSDS, sDAI and spUSDC?"
    answer: "sUSDS and sDAI earn rates set by Sky governance, the Sky Savings Rate and the DAI Savings Rate. spUSDC is a Spark Savings V2 vault that deploys USDC through the Spark Liquidity Layer, and its rate is managed by Spark governance. All are ERC-4626 vault tokens, so the redemption rate rises over time."
    featured: true
  - question: "What happens if I withdraw more than a Spark vault holds idle?"
    answer: "You submit a Savings Liquidity Intent, a signed request for any amount. The Spark Liquidity Layer then fills it from its allocations, and the documentation says large requests are usually fulfilled within a few minutes. It cannot be cancelled in the first hour, and initially the flow covers the USDC and USDT vaults on Ethereum."
  - question: "Can Spark stop withdrawals from a savings vault?"
    answer: "The documentation says that in the event of a potential loss, Spark can put vaults into recovery mode, temporarily halting withdrawals so every user gets equal treatment and a bank run is avoided. It is an operational control that a depositor should know exists before they rely on instant liquidity."
order: 9
protocol: "spark"
versionContext: "Vault lists, buffer sizes and which chains support intents change by governance and by release. Use the Spark documentation and address registry for current values."
tags:
  - spark
  - savings
  - liquidity
concepts:
  - stablecoin-mechanisms
  - liquidity-pools
glossary:
  - erc-4626
  - sky-savings-rate
  - susds
  - stusds
  - spark-liquidity-layer
  - rate-limit
relatedGuides: []
versions:
  - name: "Sky-rate vaults: sUSDS, sDAI"
    status: "active"
    note: "Rates set by Sky governance. sDAI is listed as a legacy vault."
  - name: "Savings V1: sUSDC"
    status: "deprecated"
    note: "Deposits USDC into the Sky Savings Rate. Listed as legacy and users are encouraged to move to V2."
  - name: "Savings V2: spUSDC, spUSDT, spPYUSD, spETH, spUSDG"
    status: "active"
    note: "Yield from the Spark Liquidity Layer, rates managed by Spark governance."
  - name: "stUSDS"
    status: "active"
    note: "Sky product that lends USDS against SKY. Carries liquidity and liquidation-design risk the others do not."
sources:
  - title: "Spark Savings"
    url: "https://docs.spark.fi/products/spark-savings"
    kind: "docs"
    publisher: "Spark"
  - title: "Savings Liquidity Intents"
    url: "https://docs.spark.fi/products/spark-savings/guides/liquidity-intents"
    kind: "docs"
    publisher: "Spark"
  - title: "Spark Savings for integrators"
    url: "https://docs.spark.fi/integrators"
    kind: "docs"
    publisher: "Spark"
  - title: "Spark Liquidity Layer"
    url: "https://docs.spark.fi/products/spark-liquidity-layer"
    kind: "docs"
    publisher: "Spark"
  - title: "Spark USDT strategy"
    url: "https://docs.spark.fi/products/spark-savings/risk-architecture/usdt-strategy"
    kind: "docs"
    publisher: "Spark"
---

Spark's savings page lists nine tokens. Their names are similar, they share a standard, and they behave the same way in a wallet. The differences are in where the yield comes from and who can change the rate.

The [protocol page](/protocols/spark) places these vaults in the wider system. This guide separates them and walks through the withdrawal paths.

## The nine tokens

| Token | Asset | Yield source | Operator | Version |
| --- | --- | --- | --- | --- |
| spUSDC | USDC | Spark Liquidity Layer | Spark | V2 |
| spUSDT | USDT | Spark Liquidity Layer | Spark | V2 |
| spPYUSD | PYUSD | Spark Liquidity Layer | Spark | V2 |
| spETH | ETH | Spark Liquidity Layer | Spark | V2 |
| spUSDG | USDG | Spark Liquidity Layer | Spark | V2 |
| sUSDS | USDS | Sky Savings Rate | Sky | none |
| stUSDS | USDS | A rate from lending against SKY | Sky | none |
| sUSDC | USDC | Sky Savings Rate | Spark | V1, legacy |
| sDAI | DAI | DAI Savings Rate | Sky | legacy |

Every token follows the [ERC-4626](/glossary/erc-4626/) vault standard. Each token is a share of the vault's assets, and its redemption value rises as the vault earns. Holding one in a wallet earns without any claim action.

## Three kinds of rate

**Rates set by Sky.** The [Sky Savings Rate](/glossary/sky-savings-rate/) behind [sUSDS](/glossary/susds/) is a governance-set figure that the Sky documentation describes as funded by protocol revenue. sDAI is the older equivalent for DAI.

**Rates managed by Spark governance.** The V2 vaults earn from whatever the Liquidity Layer does with the deposits, and the vault's rate is managed by Spark governance. The documentation says the USD vaults are fully backed by USDS, a statement that links their safety to Sky's collateral base. This is why a Spark vault's risk includes the [Sky system](/protocols/maker-sky) as well as the venues the layer uses.

**A rate from lending.** stUSDS lends USDS to borrowers who post SKY as collateral. The documentation says it carries potential liquidity constraints and no automatic liquidations. Do not treat it as another savings token.

The V2 design says it minimizes exposure to riskier collateral such as perpetual futures and spreads across DeFi and real-world-asset yield. That is a stance, not a fixed rule. The composition per vault is shown in the Spark app and the Savings Data API.

## Withdrawal path 1: the idle buffer

Each vault keeps part of its assets idle, shown in the app as *Idle* on the liquidity tab. The documentation says vault contracts hold up to 10 million for atomic redemptions. A withdrawal inside the buffer is an ordinary ERC-4626 `withdraw` or `redeem`, and the Liquidity Layer refills the buffer afterward.

Beyond the buffer, the USDT vault keeps a substantial instant-liquidity position in SparkLend, and the USDC vault can use the Sky PSM, per the documentation. Those are routes the layer can use. They are not a promise of a particular size at a particular time, and the live figures are on the dashboards.

## Withdrawal path 2: a liquidity intent

For a withdrawal larger than the idle amount, the vault uses an asynchronous request called a **Savings Liquidity Intent**.

1. The user signs a request for the amount they want. In the app it appears in a *Requested withdrawal* table as pending, with an estimated completion time.
2. The Spark Liquidity Layer fills the request by moving assets into the vault from its allocations.
3. The funds are transferred to the user's wallet automatically.
4. A request cannot be cancelled in its first hour. If the layer has not filled it after an hour, cancellation becomes available.

The documentation says the flow starts on Ethereum mainnet for the USDC and USDT vaults. It says large requests are usually fulfilled within a few minutes, and that the vaults support activity of $100 million and more. Those are descriptions of normal conditions. The intent is only as good as the Liquidity Layer's ability to unwind positions, which is bounded by the same rate limits that protect against a compromised relayer. In a stress event, a rate limit that is correct for safety can be a delay for a large exit.

## Recovery mode

The documentation states that in the event of a potential loss affecting a vault, Spark can put it into recovery mode, temporarily halting withdrawals so users are treated equally and a run is avoided. It is a trade of liquidity for fairness that exists in many pooled products and is rarely mentioned on a rate page.

## Losses and the order they are meant to fall in

The documentation lists first-loss layers for USDS and the Spark Savings products, starting at the Prime level and ending with equal losses across USDS holders. The [protocol page](/protocols/spark) lists the layers. The guide-level lesson is that the savings token is a claim on Spark's allocations, which are supported by Sky's balance sheet. If a venue fails, the loss moves up the layers. A depositor does not choose which layer absorbs it.

## For integrators

The integrator documentation describes the vaults as standard ERC-4626 contracts: `deposit` and `mint` to enter, `withdraw` and `redeem` to leave, with a read-only Savings Data API for rate, TVL, depositors, liquidity and collateral composition. Integrators receive a three-digit referral code, a `uint16` between 100 and 999, to attribute deposits to their product. Because the share price rises over time, a wallet should show the value from `convertToAssets`, not the share count.
