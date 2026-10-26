---
title: "Proxies and implementation contracts"
description: "How a stable address can delegate to replaceable logic, and which of these protocols use that pattern."
summary: "A proxy keeps an address and a storage layout while the logic lives in another contract. Aave V3 markets and Sky’s USDS token document this pattern. Uniswap’s core pools and Aave V4’s hub are documented as non-upgradeable. Reading only the proxy address does not tell you which of those you have."
status: "published"
published: "2026-10-13"
lastVerified: "2026-10-26"
order: 12
group: "engineering"
tags:
  - proxies
  - upgrades
protocols:
  - aave
  - maker-sky
  - uniswap
  - curve
  - lido
glossary:
  - proxy
  - usds
  - hub
related:
  - governance-and-upgrades
  - security-assumptions
sources:
  - title: "Aave V3 smart contracts"
    url: "https://aave.com/docs/developers/smart-contracts"
    kind: "docs"
    publisher: "Aave"
  - title: "Aave V4 overview"
    url: "https://github.com/aave/aave-v4/blob/main/docs/overview.md"
    kind: "docs"
    publisher: "Aave"
  - title: "USDS"
    url: "https://developers.skyeco.com/protocol/tokens/usds/"
    kind: "docs"
    publisher: "Sky"
  - title: "sUSDS"
    url: "https://developers.skyeco.com/protocol/tokens/susds/"
    kind: "docs"
    publisher: "Sky"
  - title: "How Uniswap works"
    url: "https://developers.uniswap.org/docs/get-started/concepts/how-uniswap-works"
    kind: "docs"
    publisher: "Uniswap"
  - title: "Integrating Stableswap-NG"
    url: "https://docs.curve.finance/developer/integration/stableswap-ng"
    kind: "docs"
    publisher: "Curve"
  - title: "stVaults technical design"
    url: "https://docs.lido.fi/run-on-lido/stvaults/concepts-and-reference/stvaults-technical-design"
    kind: "docs"
    publisher: "Lido"
---

Users and integrators store addresses. If the logic at that address can change, every earlier reading of the code is provisional. A proxy is the usual way to get that property. The proxy’s address and its storage stay. A `delegatecall` runs an implementation contract in the proxy’s context. Replacing the implementation pointer changes the code without asking holders to migrate balances.

The danger is the point. Balances survive the upgrade, including a hostile or careless one. So do storage collisions, if a new implementation writes a different layout into the same slots. ERC-1967 standardizes the slots where the implementation and the admin are stored so they do not sit on top of a token’s balances. UUPS puts the upgrade function in the implementation rather than in the proxy, and the implementation is supposed to authorize it. Sky’s USDS and sUSDS pages both say they use that pair: UUPS and ERC-1967. An upgrade of USDS is an upgrade of the token people are holding, not a new token they must opt into. The DAI converter will still say one-for-one. It will not review the new bytecode.

## Where this publication has seen the pattern

Aave’s V3 docs say `PoolAddressesProvider` can update proxy implementations. The pool address integrators call can gain new code. The roles live in `ACLManager`. An upgrade is not a user transaction.

Aave’s V4 overview says the opposite about the hub: it is immutable, and spokes are upgradeable. New behavior is supposed to arrive as a new spoke, or as a spoke upgrade, not as a rewrite of the shared liquidity contract. That is a deliberate split. It is only as strong as the immutability claim and as the process that authorizes spokes. A spoke upgrade can still change how a user’s collateral is valued before the hub sees a draw.

Uniswap’s current overview says core contracts are not upgradeable. There is no proxy admin on a v2 pair. A v4 hook is a separate contract. If that hook was deployed behind a proxy, the upgrade key is the hook author’s. The `PoolManager` does not become upgradeable because the hook is.

Lido V3 staking vaults are deployed from a beacon proxy. The technical design says the owner can irreversibly ossify that implementation and opt out of later upgrades. Until that call, the vault has an upgrade path. Ossifying the vault does not freeze the Lido Core staking contracts.

Stableswap-NG docs say the factory deploys pools as minimal proxies of a stored implementation, and that a pool is immutable once deployed: `set_pool_implementations` affects pools deployed afterward. The proxy’s target is fixed for that address. A new factory implementation is a new pool’s code. It is not an upgrade of a pool that already exists. Confirm the implementation index anyway, because two NG pools can be minimal proxies of different implementations and still share an ABI.

## What to read in the source

The implementation address, the admin, and the upgrade function tell you who can move the code. The storage gap or the ERC-1967 slots tell you whether an upgrade was structured to avoid collisions. Neither tells you whether the new code is safe. A proxy is an administrative capability. [Governance](/concepts/governance-and-upgrades) is the process that is supposed to constrain it. An immutable core plus an upgradeable edge, which is the V4 hub and the Uniswap hook, moves the capability rather than deleting it.
