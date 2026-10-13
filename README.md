# Protocol Anatomy

Protocol Anatomy is a static technical publication about how major DeFi protocols account for assets, price trades, liquidate collateral, and change their contracts.

Tagline: Understand the code. Follow the money. Trace the evolution.

The initial edition covers Aave, Uniswap, MakerDAO / Sky, Curve Finance, and Lido. It is prepared for `https://protocols.davidgarciab.com`. Nothing in this repository deploys that domain.

## Stack

- [Astro](https://astro.build/) 7 renders the site to static HTML.
- TypeScript and Zod schemas in `src/content.config.ts` validate article metadata at build time.
- Markdown in `src/content/` is the article source. MDX is enabled for a future article that needs a component, but the current articles are Markdown.
- Diagrams are HTML fragments in `src/diagrams/registry.ts`, inserted by a rehype plugin wherever an article contains `<diagram-placeholder name="..."></diagram-placeholder>`.
- Search is a client-side filter over an index built from the published pages. There is no search service.
- Styling is plain CSS in `src/styles/global.css`. Type is a system font stack. There is no analytics and no remote font request.

pnpm is the package manager. The lockfile is `pnpm-lock.yaml`.

## Prerequisites

- Node.js 22.12 or newer (see `.nvmrc`)
- pnpm 10

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

Do this only when you intend to publish. This repository does not create a Cloudflare account or change DNS.

1. Push the repository to the Git host you will connect.
2. In Cloudflare Pages, create a project from that repository.
3. Set the production branch, then:
   - Build command: `pnpm build`
   - Build output directory: `dist`
   - Node.js version: 22
4. Add the custom domain `protocols.davidgarciab.com`.
5. DNS: if the zone is already on Cloudflare, Pages can add the record for you. If it is not, create a `CNAME` from `protocols` to the Pages target Cloudflare shows, or an equivalent proxied record. Do not point the name at a local server.
6. After the first deployment, open the production URL and the addresses in `scripts/verify-dist.ts`. Confirm the canonical tag is `https://protocols.davidgarciab.com/...` and that the five protocol pages render.
7. `robots.txt` and the sitemap already use that origin. They do not need a second generator.

Pages serves `404.html` for unknown paths. The site is static. It does not need a database, an API key, or a server-side runtime.

Cloudflare’s free allowance and its limits change. Check the current Pages pricing and fair-use terms before relying on them. A quiet static site is the inexpensive case. Large build minutes, many deployments, or added Workers and images can cost money later. This project does not add those.

## Known limits

- The publication is not an audit and does not track live risk parameters or balances.
- `lastVerified` is an editorial date, not a chain query.
- Link checking can be blocked by a host even when the page exists.
- Automated accessibility scans disable color-contrast because the headless DOM does not reliably compute it. Contrast was reviewed in the design tokens and should be rechecked in a browser after visual changes.
- Some historical Maker documentation URLs now redirect into Sky’s documentation shell. Prefer the `dss` source when a redirected page no longer contains the module text.
- No author biography is published, because none was supplied.
