# Implementation plan

Status: implemented locally. Not deployed.

## Decisions

- Astro 7, TypeScript, static output, pnpm. The repository was empty, so there was no existing stack to extend.
- Markdown collections with Zod metadata. MDX is installed and enabled, and the current articles stay in Markdown so formulas and braces do not have to be escaped.
- No database, CMS, analytics, remote fonts, or API keys.
- Canonical origin is `https://protocols.davidgarciab.com`, set in `astro.config.ts` and `src/lib/site.ts`.
- Version status vocabulary: `released`, `active`, `historical`, `deprecated`, `proposed`, `in-development`.

## Scope that landed

- Homepage, protocol directory, five protocol overviews, five version guides, fifteen concept articles, glossary, methodology, source index, search, and a 404 page.
- Diagrams for swaps, lending, liquidation, stablecoin issuance, liquid staking, the Aave V4 hub, and a conceptual StableSwap shape.
- Content validation, unit tests, production-build checks, an axe scan of key pages, and a separate network link checker.
- Cloudflare Pages instructions in the README. DNS and production were not changed.

## Research used

Primary docs, repositories, whitepapers, and governance posts linked from each article. Last verified for this edition: 2026-10-13. That date means the cited sources were read. It does not mean parameters were queried from chain.

## Verification

Run on 13 October 2026 with Node.js 22.21.1 and pnpm 10.9.0:

- `pnpm test` — 10/10 passed.
- `pnpm validate` — 26 articles, 45 glossary entries, 7 diagrams.
- `pnpm check` — 0 errors.
- `pnpm build` — 34 pages.
- `pnpm verify:dist` — 21 routes present; canonical URLs are the production origin.
- `pnpm audit:a11y` — axe passed on 8 built pages, with color-contrast and region disabled because jsdom does not measure them reliably.
- `pnpm check:assets` — built JS, CSS, and HTML stayed inside the size limits.
- `pnpm check:links` — 46 source URLs, 0 broken. This check needs a network and is not part of CI.

The production preview was opened locally. Homepage, Aave, search, glossary filter, mobile menu, copy button, and the 404 page behaved as intended. The site has not been deployed.

## Not done on purpose

- No production deployment and no DNS edit.
- No live market data.
- No claim of a full WCAG audit.
