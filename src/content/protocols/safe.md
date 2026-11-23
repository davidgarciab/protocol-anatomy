---
title: "Safe"
seoTitle: "How Safe works: multisig smart accounts, modules and guards"
description: "How Safe smart accounts turn an owner threshold into an onchain check, how proxies, modules, guards and delegatecall extend one, and what the Bybit incident showed about signing."
summary: "Safe is a widely used multisig smart account for DAO and protocol treasuries. A Safe is a proxy whose logic checks that a threshold of owner signatures matches a transaction hash. Modules can bypass that threshold, guards can restrict it, and a delegatecall can rewrite the account, which is why what signers see before signing matters as much as the contract."
status: "published"
published: "2026-11-23"
lastVerified: "2026-11-23"
faq:
  - question: "What is a Safe and how does it differ from a normal wallet?"
    answer: "A Safe is a smart contract account, not a key pair. Its address can receive funds like any other, but a transaction executes only if enough owners have signed a hash of it. The owner list and a threshold, such as 3 of 5, are stored in the contract. Owners can be externally owned accounts, other contracts or passkeys."
    featured: true
  - question: "What are Safe modules and guards?"
    answer: "A module is a contract enabled on a Safe that can call execTransactionFromModule and so execute transactions without the owner threshold, for example a spending allowance or recovery. A guard is a contract that checks every transaction before and after execution to add restrictions. Both are added by owners, and a bad one can take over or block a Safe."
    featured: true
  - question: "Did the Bybit theft break Safe's smart contracts?"
    answer: "No source read for this page says it did. NCC Group describes an attack on the signing process: malicious JavaScript injected into the Safe{Wallet} interface through a compromised developer machine altered what Bybit's signers saw, and they approved a delegatecall that replaced the wallet's implementation. The multisig threshold worked as designed on the transaction they signed."
  - question: "Why does a delegatecall matter in a Safe?"
    answer: "A Safe transaction has an operation type, call or delegatecall. A delegatecall runs another contract's code in the Safe's own storage context, which is how batching libraries work and also how a malicious contract can overwrite the Safe's implementation address. The operation type is part of the signed hash, so it is a field signers must check."
order: 18
category: "Infrastructure"
mechanism: "A proxy smart account whose logic verifies an owner threshold of signatures over a typed transaction hash, with optional modules, guards and a fallback handler."
versionContext: "Safe contracts are versioned. The main branch of the Safe smart account repository shows version 1.5.0 plus an unreleased set of changes, and deployed Safes may run 1.3.0, 1.4.1 or 1.5.0. Features such as module guards and the extensible fallback handler depend on the version."
tags:
  - multisig
  - smart-accounts
  - custody
concepts:
  - proxies
  - security-assumptions
  - governance-and-upgrades
  - composability
guides:
  - safe-modules-guards-and-delegatecall
glossary:
  - safe-module
  - safe-guard
  - delegatecall
  - multisig
  - proxy
versions:
  - name: "Safe 1.3.0"
    status: "released"
    note: "Introduced Safe guards, per the Safe docs."
  - name: "Safe 1.4.1"
    status: "released"
    note: "Listed in the contracts changelog between 1.4.0 and 1.5.0."
  - name: "Safe 1.5.0"
    status: "released"
    note: "Adds an extensible fallback handler, a module guard interface, the updated EIP-1271 signature validation function and removes zkSync EraVM support."
sources:
  - title: "How do Safe smart accounts work?"
    url: "https://docs.safe.global/advanced/smart-account-overview"
    kind: "docs"
    publisher: "Safe"
  - title: "Safe modules"
    url: "https://docs.safe.global/advanced/smart-account-modules"
    kind: "docs"
    publisher: "Safe"
  - title: "Safe guards"
    url: "https://docs.safe.global/advanced/smart-account-guards"
    kind: "docs"
    publisher: "Safe"
  - title: "Safe.sol"
    url: "https://github.com/safe-global/safe-smart-account/blob/main/contracts/Safe.sol"
    kind: "code"
    publisher: "Safe"
  - title: "ModuleManager.sol"
    url: "https://github.com/safe-global/safe-smart-account/blob/main/contracts/base/ModuleManager.sol"
    kind: "code"
    publisher: "Safe"
  - title: "GuardManager.sol"
    url: "https://github.com/safe-global/safe-smart-account/blob/main/contracts/base/GuardManager.sol"
    kind: "code"
    publisher: "Safe"
  - title: "Safe smart account changelog"
    url: "https://github.com/safe-global/safe-smart-account/blob/main/CHANGELOG.md"
    kind: "code"
    publisher: "Safe"
  - title: "In-depth technical analysis of the Bybit hack"
    url: "https://www.nccgroup.com/research/in-depth-technical-analysis-of-the-bybit-hack/"
    kind: "security"
    publisher: "NCC Group"
---

Many protocols on this site end in a multisig. [Aave](/protocols/aave) has guardians, [Balancer](/protocols/balancer) has an emergency subDAO, and [Morpho](/protocols/morpho) has a five-of-nine governance multisig. The word "multisig" hides a contract, and NCC Group calls Safe a widely used multi-signature wallet solution. This page explains what it does, where its flexibility becomes risk, and why the largest theft in crypto history involved one without breaking it.

The [guide](/guides/safe-modules-guards-and-delegatecall) covers modules, guards and delegatecall in more detail.

## An account that is a contract

An Ethereum externally owned account is one private key. The docs state the problem: that key is a single point of failure, and whoever has it has complete control. A smart account replaces the key with code that defines how a transaction is approved. Its address looks the same, and the docs note it is impossible to tell the two apart from the address alone. The difference is that a smart account cannot start a transaction by itself. Someone sends it a transaction, and its code decides whether to act.

A Safe is a smart account with multi-signature logic at its core. The docs describe two stored settings: a list of **owners** and a **threshold**, the number of owners that must confirm a transaction before it executes. Owners can be externally owned accounts, other smart accounts or a passkey. The docs list the design principles: a secure default that works without trusting any extra contract, and maximum flexibility through modules and delegatecall.

## How a transaction executes

A Safe is deployed as a proxy. The docs describe a `Safe` singleton contract holding the logic, deployed once, and a proxy for each account that delegates to it. A proxy factory creates the proxies, and a singleton factory helps deploy the contracts at the same addresses on different chains. The version of the singleton a proxy points to is the account's version.

An owner, or anyone holding the signatures, calls `execTransaction` with a destination, value, data, an operation type, gas parameters and the collected signatures. The contract computes an EIP-712 hash of those fields and the Safe's current nonce, increments the nonce, checks the signatures against the owner list and threshold, calls the guard if one is set, executes, and calls the guard again afterward. In the code, the order is:

```solidity
txHash = getTransactionHash(to, value, data, operation, safeTxGas, baseGas, gasPrice, gasToken, refundReceiver, nonce++);
checkSignatures(msg.sender, txHash, signatures);
// guard.checkTransaction(...) if a guard is set
success = execute(to, value, data, operation, ...);
// guard.checkAfterExecution(txHash, success) if a guard is set
```

<diagram-placeholder name="safe-execution"></diagram-placeholder>

That excerpt is condensed from `contracts/Safe.sol` on the `main` branch of the safe-smart-account repository, as read on 23 November 2026, and `main` can move. Three properties matter. The nonce makes each signed transaction single-use. The operation type, call or delegatecall, is part of what is hashed and signed. And signature checking has several forms: the code distinguishes contract signatures validated through EIP-1271, signatures approved on chain in advance, and standard and `eth_sign` style signatures, depending on the `v` byte.

## Modules, guards and the fallback handler

The owner threshold is the default. Three extension points change it.

A **module** is a contract that owners enable on the Safe. The docs say a module can call `execTransactionFromModule`, which executes a transaction without collecting the owner signatures. That is what allowance modules, recurring payments and recovery schemes use. The docs' warning is blunt: modules can execute arbitrary transactions, and a malicious module can take over a Safe. Enabling one takes the owners' threshold, and after that it does not need them.

A **guard** is a contract that runs before and after each transaction and can reject it. It adds restrictions on top of the owner threshold, such as an allowlist of destinations. The docs warn that because a guard has full power to block execution, a broken guard can lock a Safe, so its code and its recovery path need an audit. The 1.5.0 release adds a module guard interface so that module transactions can be checked too.

The **fallback handler** answers calls the Safe does not define, for example token callbacks. Release 1.5.0 introduced an extensible fallback handler. It is another contract the account trusts.

Each of these is a contract the Safe's owners chose. The secure default is the case with none of them enabled.

## Where the contract's job ends

A Safe's contract proves one thing: that enough owners signed this hash. It does not prove that the signers understood the hash. The ingredients of the signed hash are a destination, a value, a calldata blob and an operation type, and a human reading a screen sees a rendering of them.

The Bybit theft shows the gap. NCC Group describes, from the forensic reports, an attack on 21 February 2025 that drained more than $1.4 billion, including 401,347 ETH, from Bybit's cold wallet. Bybit's wallet required at least three signers. The attackers injected malicious JavaScript into the Safe{Wallet} interface through a compromised developer machine, in a way that changed behavior only when Bybit was about to execute a transaction from its cold wallet. What the signers saw in the interface differed from what their hardware wallets were asked to sign. The signed transaction used operation type 1, delegatecall, to a contract the attackers controlled, which wrote a new implementation address into the proxy's storage and handed them the wallet.

NCC Group notes that signers who connected a hardware wallet through a browser extension saw a structured message, and that some hardware wallets can display EIP-712 data directly so that a signer can clear-sign instead of blind-sign. It also notes that after the attack the interface's gateway was changed to reject a proposal without a matching hash and signature, and says that an attacker controlling the application's JavaScript could change the HTML shown to signers in any case.

The lesson is about layers. The contract did what it was designed to do for the transaction that was signed. The failure was in what the signers were shown and in what they were willing to approve without independent verification. The practical consequence for a reader of a "5 of 9" claim is that the number describes a threshold and says nothing about the signing environment, the interface, the hardware wallets or whether signers verify calldata themselves.

## What remains trusted

The owners and the threshold, including who holds each key and how. The interface and the signing flow, since signers rely on a rendering of the hash. Every module, guard and fallback handler enabled. The singleton the proxy points to and, if the account can change it, the process that does so. The operation types the Safe allows: a Safe that can delegatecall can be rewritten by whatever it delegatecalls to. And the version in use. The contracts changelog on the main branch lists unreleased changes, including that a revert from a contract owner's `isValidSignature` is no longer passed on to the caller, because an attacker-controlled owner address could supply arbitrary revert data, and an option to bind an approved-hash signature to one specific hash.

The docs describe Safe's own aim as becoming the standard core for smart contract wallets. That is also why its failure modes are everyone's: a protocol that lists a multisig as a safeguard is relying on this contract and on the people and screens around it.
