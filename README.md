# Protocol Anatomy

Protocol Anatomy is a static technical publication about how major DeFi protocols account for assets, price trades, liquidate collateral, and change their contracts.

Tagline: Understand the code. Follow the money. Trace the evolution.

The initial edition covers Aave, Uniswap, MakerDAO / Sky, Curve Finance, and Lido. The canonical site is `https://protocols.davidgarciab.com`.

## Stack

- [Astro](https://astro.build/) 7 renders the site to static HTML.
- TypeScript and Zod schemas in `src/content.config.ts` validate article metadata at build time.
- Markdown in `src/content/` is the article source. MDX is enabled for a future article that needs a component, but the current articles are Markdown.
- Diagrams are HTML fragments in `src/diagrams/registry.ts`, inserted by a rehype plugin wherever an article contains `<diagram-placeholder name="..."></diagram-placeholder>`.
- Search is a client-side filter over an index built from the published pages. There is no search service.
- Styling is plain CSS in `src/styles/global.css`. Type is a system font stack. There is no analytics and no remote font request.

pnpm is the package manager. The lockfile is `pnpm-lock.yaml`.

## Prerequisites

- Node.js 24.21.0 (see `.nvmrc`). Astro accepts Node.js 22.12 and newer; this project pins the current Active LTS line, 24.x.
- pnpm 12.13.0 (`packageManager` in `package.json`; `corepack enable` selects it)

## Install and run

```bash
pnpm install
pnpm dev
```

The dev server prints a local URL. It is not the canonical site.

```bash
pnpm build
pnpm preview
```

`pnpm build` writes the static site to `dist/`.

## Checks

| Command | What it does | Network |
| --- | --- | --- |
| `pnpm check` | Typecheck the Astro project | No |
| `pnpm test` | Unit tests for validation, search, and canonical URLs | No |
| `pnpm validate` | Metadata, internal links, diagrams, version vocabulary, placeholders | No |
| `pnpm build` | Production build | No |
| `pnpm verify:dist` | Required routes, canonical host, source lists, 404 `noindex` | No |
| `pnpm audit:a11y` | axe-core on key built pages | No |
| `pnpm check:assets` | Fail if a built JS, CSS, or HTML file exceeds the review limit | No |
| `pnpm check:links` | Fetch cited https URLs and write `link-report.json` | Yes |

`pnpm check:links` is intentionally outside the default test run. A 403 or a timeout is reported as restricted or temporary. Only HTTP 404 and 410 fail the command. A successful response does not prove a sentence is supported.

GitHub Actions runs the offline commands on push and pull request. See `.github/workflows/check.yml`.

## Repository map

- `src/pages/` — routes. Collection pages use `getStaticPaths`.
- `src/layouts/` — base document and article chrome.
- `src/components/` — header, footer, contents, sources, related links.
- `src/content/protocols/` — one overview per protocol.
- `src/content/guides/` — version and architecture comparisons.
- `src/content/concepts/` — cross-protocol mechanisms.
- `src/content/site/methodology.md` — how claims are sourced.
- `src/data/glossary.ts` — glossary entries.
- `src/diagrams/registry.ts` — diagram HTML.
- `src/lib/` — pure helpers and editorial rules.
- `scripts/` — validation, link checks, build verification.
- `public/` — favicon and `robots.txt`.

## Add a protocol

1. Write `src/content/protocols/<id>.md` with the protocol schema: category, mechanism, version context, version list, concepts, guides, glossary ids, and https sources.
2. Write at least one guide in `src/content/guides/` whose `protocol` field is that id.
3. Add the id to `REQUIRED_PROTOCOLS` in `src/lib/content-rules.ts` if it should be mandatory for this edition.
4. Link the new concept and glossary ids from the article, and add any missing glossary entries.
5. Run `pnpm validate` and `pnpm build`.

Use a version status from the controlled list: `released`, `active`, `historical`, `deprecated`, `proposed`, `in-development`. Do not add a version because the sequence would look complete.

## Add an article

Put the file in the matching content directory. The filename is the URL slug. Frontmatter is validated both by Zod during the Astro build and by `pnpm validate`.

Required editorial checks before treating an article as done:

- The mechanism is explained: state, actors, formula or invariant, and the failure case.
- Version claims cite a primary source and use the status vocabulary.
- Historical behavior is distinguished from current behavior.
- Code blocks say whether they are an excerpt or an educational sketch, and excerpts name the file and tag or commit.
- Educational Solidity is not described as compiled, audited, or safe for assets.
- `lastVerified` is the date those sources were actually read, in `YYYY-MM-DD`.
- Internal links point at published pages or glossary ids.
- The article is useful without the protocol’s marketing homepage.

`pnpm validate` rejects `TODO`, `TBD`, `PLACEHOLDER`, “lorem ipsum”, and “coming soon” outside code fences. It also rejects descriptions over 180 characters, short bodies, unknown ids, and canonical-looking localhost links.

## Citations

Each article’s `sources` array is rendered at the bottom of the page and aggregated at `/sources`. A source has `title`, `url` (https only), `kind` (`docs`, `whitepaper`, `code`, `governance`, `security`, `specification`, `research`), and `publisher`.

Put the source next to the claim in the prose as a normal Markdown link, and keep the same URL in `sources`. Do not cite a homepage when a section, file, or proposal exists.

## Diagrams and code

Add a diagram by exporting a new HTML figure from `src/diagrams/registry.ts` and inserting:

```html
<diagram-placeholder name="diagram-id"></diagram-placeholder>
```

The figure needs a caption and a text description. Label simplified flows as simplified. The build fails on an unknown diagram name. Rendered Markdown is cached by file digest, so a diagram-plugin change does not rebuild articles until you delete `node_modules/.astro` and run the build again.

Code samples use fenced blocks. The article layout adds a Copy button when JavaScript is available. The code remains readable without it.

## Deploy to Cloudflare Pages

Production is the Cloudflare Pages project `protocol-anatomy` on the existing `davidgarciab@gmail.com` account. Pushes to `main` build and deploy. Other branches and pull requests get preview deployments. The site is static: no Worker, database, or API token is required at runtime.

Pages build settings:

- Build command: `pnpm install --frozen-lockfile && pnpm build`
- Output directory: `dist`
- Production branch: `main`
- `NODE_VERSION`: `24.21.0` (also `.nvmrc`)
- `PNPM_VERSION`: `12.13.0`

The v3 Pages image does not read `packageManager` or the lockfile to choose pnpm, so `PNPM_VERSION` has to be set on the project. Do not add analytics or a paid build feature.

`public/_headers` sets `nosniff`, a strict referrer policy, `X-Frame-Options: DENY`, and a permissions policy. There is no Content-Security-Policy because the navigation and copy buttons use a small inline script.

Custom domain: `protocols.davidgarciab.com`. The zone `davidgarciab.com` is already on this Cloudflare account, on the Free plan, with nameservers `shubhi.ns.cloudflare.com` and `albert.ns.cloudflare.com`. The Pages project has the hostname attached, but certificate setup stays pending until DNS has this record and no other:

- Type: `CNAME`
- Name: `protocols`
- Target: `protocol-anatomy.pages.dev`
- Proxy: on

Do not replace unrelated DNS records, and do not change nameservers. The current Wrangler login can deploy Pages and read the zone, but it cannot create DNS records. After that CNAME exists, the Pages domain should leave `pending` and the Google certificate can finish HTTP validation.

Cloudflare Pages serves each directory `index.html` at a trailing slash and redirects the slashless path with `308`. Canonical URLs, the sitemap, and internal links use that trailing slash so they match the URL that returns `200`.

Rollback: in the Pages project, open Deployments and roll back to an earlier successful production deployment. That does not rewrite Git history.

Inspect status with `npx wrangler pages deployment list --project-name protocol-anatomy`. No repository secret is required for the Git integration. A direct-upload fallback would need `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`; this project does not use that path.

Pages serves `404.html` for unknown paths. Cloudflare’s free allowance changes. Check the current Pages terms before relying on them. This project does not add Workers, images, or other paid features.

## Known limits

- The publication is not an audit and does not track live risk parameters or balances.
- `lastVerified` is an editorial date, not a chain query.
- Link checking can be blocked by a host even when the page exists.
- Automated accessibility scans disable color-contrast because the headless DOM does not reliably compute it. Contrast was reviewed in the design tokens and should be rechecked in a browser after visual changes.
- Some historical Maker documentation URLs now redirect into Sky’s documentation shell. Prefer the `dss` source when a redirected page no longer contains the module text.
- No author biography is published, because none was supplied.
