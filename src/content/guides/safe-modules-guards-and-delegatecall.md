---
title: "Safe modules, guards and delegatecall"
seoTitle: "Safe modules, guards and delegatecall: what each can do"
description: "What a Safe module, guard, fallback handler and delegatecall operation can each do to a multisig account, which need owner approval, and what to check before signing."
summary: "A Safe's owner threshold is the default, and four things change it. A module can execute without signatures, a guard can block execution, a fallback handler answers unknown calls, and a delegatecall transaction runs foreign code in the Safe's storage. Each is a contract the owners trust, and the operation type is part of what they sign."
status: "published"
published: "2026-11-23"
lastVerified: "2026-11-23"
faq:
  - question: "Can a Safe module move funds without owner signatures?"
    answer: "Yes. Once owners enable a module, it can call execTransactionFromModule on the Safe, and the Safe executes without collecting owner signatures. The Safe docs say modules can execute arbitrary transactions, that only trusted and audited modules should be added, and that a malicious module can take over a Safe. Enabling or disabling a module needs the owner threshold."
    featured: true
  - question: "What should signers check before approving a Safe transaction?"
    answer: "The destination, the value, the calldata and above all the operation type. A transaction with operation type 1 is a delegatecall, which runs the target's code in the Safe's own storage. Signers should verify the hash on their hardware wallet against an independent decoding, since the interface that displays the transaction is not the thing being signed."
  - question: "Does a Safe guard make a Safe safer?"
    answer: "It can, by adding restrictions the owner threshold cannot express, such as limiting destinations. The docs add that a guard has full power to block execution, so a broken guard can lock the Safe permanently. A guard is more code that has to be audited and a recovery path that has to exist before it is enabled."
order: 18
protocol: "safe"
versionContext: "Guards arrived in version 1.3.0, a module guard interface and an extensible fallback handler in 1.5.0. A deployed Safe supports only what its singleton version includes, so the behavior depends on the version it points to."
tags:
  - safe
  - modules
  - delegatecall
concepts:
  - proxies
  - security-assumptions
glossary:
  - safe-module
  - safe-guard
  - delegatecall
  - proxy
relatedGuides: []
versions:
  - name: "Owner threshold execution"
    status: "active"
    note: "execTransaction with signatures from the threshold of owners over an EIP-712 hash that includes the nonce and operation type."
  - name: "Modules"
    status: "active"
    note: "Enabled by owners, then able to execute through execTransactionFromModule without signatures."
  - name: "Guards"
    status: "active"
    note: "Check each transaction before and after execution. Introduced in version 1.3.0. A module guard interface is added in 1.5.0."
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
  - title: "Safe smart account changelog"
    url: "https://github.com/safe-global/safe-smart-account/blob/main/CHANGELOG.md"
    kind: "code"
    publisher: "Safe"
  - title: "In-depth technical analysis of the Bybit hack"
    url: "https://www.nccgroup.com/research/in-depth-technical-analysis-of-the-bybit-hack/"
    kind: "security"
    publisher: "NCC Group"
---

The [protocol page](/protocols/safe) explains how a Safe approves a transaction. This guide lists the parts that change who or what can act, because a Safe described as "3 of 5" can be more or less than that depending on what has been enabled.

## The map

| Part | What it can do | Needs owner approval to add | What to check |
| --- | --- | --- | --- |
| Owners and threshold | Authorize a transaction by signing its hash | Changing owners or the threshold needs the current threshold | Who holds each key and how it is stored |
| Module | Execute transactions without owner signatures | Yes, enabling needs the threshold | Its code, its audits, what it is allowed to call |
| Guard | Check and possibly block transactions before and after | Yes | Whether it can lock the Safe, and how to recover |
| Fallback handler | Answer calls the Safe does not define | Yes | Its code and version |
| Delegatecall operation | Run another contract's code in the Safe's storage | Part of the signed transaction | The target contract and what it writes |

## Modules

The docs describe modules as extensions that run alongside the multisig. They can implement automation such as recurring payments, restrictions such as allowlists and spending caps, and recovery schemes. A Safe does not need any. A module is enabled with `enableModule` through a normal threshold-approved transaction, and from then on the Safe keeps a registry of authorized modules. When someone interacts with a module, the module validates the request and calls `execTransactionFromModule` on the Safe, which executes it.

Two consequences follow. First, a module is a standing permission: it does not need a new signature for each action. A daily allowance module that is correct is useful. A module with a bug or a malicious owner can execute anything the Safe can. Second, the signers who enabled it approved its code, not each future use, so the review has to happen when the module is enabled.

## Guards

A guard is a contract that is called before a transaction, with all its parameters, and again after it, with its final result. The docs say guards are used when there are restrictions on top of the n-out-of-m scheme. The guard can inspect everything about the transaction and reject it. The pre-check can enforce a policy such as allowed destinations. The post-check can verify the Safe's final state.

Guards fail closed. The docs warn that a broken guard can cause a denial of service, so the code must be audited and there must be a recovery mechanism. Version 1.5.0 adds a module guard interface, so module transactions can be checked as well, and the docs list guards as introduced in 1.3.0.

## Delegatecall

Every Safe transaction carries an operation type, call or delegatecall. The Safe docs describe the delegatecall as how a Safe loads instructions from other contracts and executes them through the account, which is what batching libraries rely on: one signed transaction that does several things. The cost is that the called contract's code runs with the Safe's storage. A library written to transfer tokens is harmless. A contract that writes to the proxy's implementation slot replaces the Safe's logic.

That is not a flaw in the multisig. The threshold of owners can authorize a delegatecall and the contract does what they authorized. The Bybit analysis by NCC Group shows what happens when signers authorize one they did not understand: the transaction had operation type 1, a delegatecall to an attacker-controlled contract, and the effect was to change the proxy's implementation. The amounts and the sequence are in the [protocol page](/protocols/safe).

## What changes with the version

The main branch of the contracts repository lists the differences between versions. Version 1.5.0 introduces an extensible fallback handler, a module guard interface, the updated EIP-1271 signature function, memory-safe assembly and removes `transfer` and `send` usage, and ends support for zkSync EraVM. The changelog also lists unreleased changes: no longer passing on a revert from a contract owner's signature validation, and an option to bind an approved-hash signature to one hash. A Safe on an earlier singleton does not have these.

## What to check before signing or relying on a Safe

1. The operation type. If it is delegatecall, who is the target and what does it do? Independent decoding of the calldata is the check, not the interface.
2. The hash. Compare the hash on the hardware wallet with one computed by a separate tool.
3. Which modules, guards and fallback handler are enabled, and when they were added. An enabled module is a standing permission.
4. Which singleton and version the proxy points to.
5. Who the owners are, including whether any owner is itself a contract that can be changed.

The [proxies concept page](/concepts/proxies) explains the pattern a Safe uses, and the [security assumptions](/concepts/security-assumptions) page puts signing risk with the other dependencies.
