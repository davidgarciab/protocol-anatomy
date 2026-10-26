---
title: "Governance and upgradeability"
description: "Which protocol changes are parameter updates, which are proxy upgrades, and which cores are documented as immutable."
summary: "Governance on these protocols sets risk parameters, and sometimes replaces contract code at a stable address. Aave V3 pools and Sky’s USDS token are upgradeable. Aave V4’s hub and Uniswap’s core pools are documented as not upgradeable. Lido’s Dual Governance exists because an exit can be slower than a vote."
status: "published"
published: "2026-10-13"
lastVerified: "2026-10-26"
order: 9
group: "engineering"
tags:
  - governance
  - upgrades
protocols:
  - aave
  - uniswap
  - maker-sky
  - lido
  - curve
glossary:
  - proxy
  - hub
related:
  - proxies
  - security-assumptions
  - oracles-and-dependencies
sources:
  - title: "Aave V3 smart contracts"
    url: "https://aave.com/docs/developers/smart-contracts"
    kind: "docs"
    publisher: "Aave"
  - title: "Aave V4 overview"
    url: "https://github.com/aave/aave-v4/blob/main/docs/overview.md"
    kind: "docs"
    publisher: "Aave"
  - title: "How Uniswap works"
    url: "https://developers.uniswap.org/docs/get-started/concepts/how-uniswap-works"
    kind: "docs"
    publisher: "Uniswap"
  - title: "USDS"
    url: "https://developers.skyeco.com/protocol/tokens/usds/"
    kind: "docs"
    publisher: "Sky"
  - title: "Dual Governance overview"
    url: "https://blog.lido.fi/dual-governance-overview/"
    kind: "governance"
    publisher: "Lido"
  - title: "Aave Labs development update, September 2026"
    url: "https://governance.aave.com/t/al-development-update-september-2026/25744"
    kind: "governance"
    publisher: "Aave Labs"
---

A protocol can be open to users and still be steerable. The steering is governance. The question for an engineer is which storage a vote can change, and whether the code at a familiar address can be replaced.

## Parameters versus code

Aave governance sets liquidation thresholds, caps, and interest-model slopes. Those are storage. The V3 pool’s code can also move, because `PoolAddressesProvider` can retarget implementations. Both actions go through roles in `ACLManager`, not through a public `setThreshold` on the pool itself. The September 2026 Aave Labs update says V4 risk stewards were given bounded parameter authority by AIP 523, so not every routine change is a full governance cycle. Bounds are still a governance object. They are not a removal of administration.

Maker governance sets `duty`, debt ceilings, and the prices that become `spot`. The Vat’s safety check is code. Changing a ceiling is not an upgrade. It can still bankrupt the system if the new number is wrong. Sky’s USDS token adds a direct upgrade path: the token page documents a UUPS proxy. The converter being one-for-one does not freeze the USDS implementation.

Curve pool instances are deployed and then left on that bytecode. The NG docs say a later factory implementation does not rewrite old pools. Governance of fees and `A` can still be wired into a pool’s admin. “Immutable pool” and “admin can change `A`” can both be true. Read which functions are permissioned.

Uniswap’s overview says the core contracts are not upgradeable, and that governance can turn on protocol fees within limits. The fee switch is the parameter. The pair or pool code is not the parameter. A v4 hook is the escape hatch: the hook is chosen at pool creation and can contain whatever upgrade pattern its author deployed. The singleton does not vouch for it.

## Timelocks and the people who need to leave

A timelock delays execution so opponents can exit or organize. Lido’s case is the sharp one. Validator exits are slow. A short timelock would let a DAO action land before stETH holders could redeem. [Dual Governance](/guides/lido-exits) escrows stETH to extend that delay, and at a higher threshold to block execution until the escrow has exited. Lido dates the Ethereum deployment to 4 July 2025. The mechanism is a check by the people who hold the pooled asset, not a second copy of the LDO vote.

Aave’s V4 dynamic risk configuration is a quieter version of the same worry. Changing a collateral factor in V3 hit everyone. V4 can leave old positions on the old key until they take a risk-increasing action. That is governance design inside the accounting, not a forum process.

## What to verify before trusting an address

- Is the address a proxy? If it is, who can change the implementation? The [proxy](/concepts/proxies) article names the patterns these protocols document.
- Which parameters can move without an upgrade, and who can send that transaction?
- Does the vote’s timelock exceed the time a user needs to withdraw? For Lido, that time includes Ethereum’s exit queue. For Aave, it includes whether the pool has cash, because a bank run on a high-utilization reserve cannot be instant for everyone.

None of the protocols in this publication is “governance-free” in the sense that no parameter matters. Uniswap comes closest at the core-pool layer, and even there the fee switch and the hook are governance-shaped decisions, one global and one per pool creator.
