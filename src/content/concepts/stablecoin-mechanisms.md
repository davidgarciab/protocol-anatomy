---
title: "Stablecoin mechanisms"
seoTitle: "How DAI and USDS are minted: stablecoin design"
description: "How DAI and USDS are minted against collateral, and why a Curve stablecoin pool is a different object."
summary: "A collateralized stablecoin is debt. Maker mints it against a vault and charges a stability fee. Sky’s USDS is a one-for-one token on that same debt. A Curve StableSwap pool only trades stablecoins. crvUSD is a third design that liquidates through an AMM."
status: "published"
published: "2026-10-13"
lastVerified: "2026-10-13"
order: 8
group: "monetary"
tags:
  - stablecoin
  - dai
protocols:
  - maker-sky
  - curve
glossary:
  - dai
  - usds
  - susds
  - stableswap
  - vault
related:
  - collateral-and-liquidation
  - on-chain-accounting
  - governance-and-upgrades
sources:
  - title: "Vat detailed documentation"
    url: "https://docs.makerdao.com/smart-contract-modules/core-module/vat-detailed-documentation"
    kind: "docs"
    publisher: "MakerDAO"
  - title: "Protocol token routes"
    url: "https://developers.skyeco.com/quick-start/protocol-token-routes/"
    kind: "docs"
    publisher: "Sky"
  - title: "USDS"
    url: "https://developers.skyeco.com/protocol/tokens/usds/"
    kind: "docs"
    publisher: "Sky"
  - title: "Understanding StableSwap"
    url: "https://docs.curve.finance/protocol/pool/understanding-stableswap"
    kind: "docs"
    publisher: "Curve"
  - title: "crvUSD overview"
    url: "https://docs.curve.finance/developer/crvusd/overview/"
    kind: "docs"
    publisher: "Curve"
---

“Stablecoin” names a target price, not a mechanism. The tokens on this site get to a dollar in different ways, and one of the famous “stablecoin protocols” is not minting one in its main AMM at all.

## Debt against collateral

[Maker](/protocols/maker-sky) mints DAI by letting a vault draw it against `ink`. The stablecoin is a liability recorded as `art * rate`. Repayment burns the liability and frees collateral. The peg is not a line in the Vat. The Vat enforces collateralization. The peg is a market outcome of liquidations, of the stability fee making DAI more or less attractive to mint, and of peg modules that swap DAI or USDS with an external stablecoin at a fixed price while they have inventory.

USDS does not create a second liability ledger. The token routes say it shares issuance with DAI, and the converter is one-for-one. Holding USDS instead of DAI changes the token contract, including its upgrade proxy. It does not, by itself, change the vault that backed the unit.

sUSDS is not a stablecoin in the same sense. It is a share of a savings module. Its USDS value is supposed to rise with the savings rate. Treating sUSDS as “one dollar” double-counts the yield.

<diagram-placeholder name="stablecoin-flow"></diagram-placeholder>

## A pool is not a mint

[Curve](/protocols/curve) StableSwap lets people trade tokens that already exist. The pool does not mint DAI when someone sells USDC into the three-pool. It changes the mix of reserves. If one of those tokens breaks its peg, the invariant will sell it, slowly and then quickly, to anyone who trades. Liquidity providers own the broken token. The AMM was doing what its `A` parameter told it to do.

That is why a Curve pool can be deep and still not be a guarantee. Amplification is leverage toward the assumption that the coins belong at the same price.

## crvUSD

crvUSD is Curve’s minted stablecoin, documented separately from StableSwap. Borrowers post collateral. LLAMMA sells that collateral into the stablecoin as the price falls, which is a liquidation design, not a peg pool. Savings crvUSD takes a portion of borrower interest. A dashboard that labels every Curve contract “the stablecoin pool” will mix LP tokens, controller debt, and scrvUSD shares.

## What stability still depends on

A collateralized stablecoin depends on collateral prices, on liquidators or bands actually clearing inventory, and on governance not raising a debt ceiling past what the collateral can carry. A peg module depends on the external stablecoin and on the module’s inventory. A StableSwap pool depends on the issuers of the tokens inside it. None of these is “backed by code” in a way that removes the asset. The [security assumptions](/concepts/security-assumptions) page keeps that list short on purpose.
