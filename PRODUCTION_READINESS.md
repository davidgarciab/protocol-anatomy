# Production readiness

Updated 13 October 2026. This file records what was checked and what is actually deployed. It is not a substitute for the production site responding.

## Findings

- The site is static Astro output in `dist`. No server adapter is configured.
- Canonical origin is `https://protocols.davidgarciab.com`.
- `davidgarciab.com` uses Cloudflare nameservers and the zone is active on the Free plan in the same account as the existing Pages projects.
- No `protocols.davidgarciab.com` record was readable with the current token’s DNS permission before the Pages hostname was attached. Other subdomains on this zone are already Pages hostnames.
- Wrangler is authenticated for this account with `pages:write`. No API token is stored in the repository.

## Tooling

- Node.js 24.21.0, Active LTS (Krypton). Node.js 26 is still Current, so it is not the pin. Astro 7 requires Node.js `>=22.12.0`.
- pnpm 12.13.0. pnpm 10 settings in `package.json` are ignored, so `allowBuilds` and `minimumReleaseAge` live in `pnpm-workspace.yaml`.
- Astro 7.3.8 and its official integrations were already the current releases.
- Vitest 4.1.11 replaces 3.2.4 so the production install no longer depends on vulnerable `tinypool`. `pnpm audit --audit-level high` reported no known vulnerabilities after that change.
- TypeScript stays on 5.9.3. TypeScript 7 is a separate major and is not required by Astro 7.
- Direct dependencies also moved to axe-core 4.14.0, jsdom 27.4.0, and tsx 4.23.15. jsdom 30 was left alone.

## Local checks on Node 24.21.0

- `pnpm check`: 0 errors
- `pnpm test`: 10/10
- `pnpm validate`: 26 articles, 45 glossary entries, 7 diagrams
- `pnpm build`: 34 pages
- `pnpm verify:dist`: 21 routes, production canonical host
- `pnpm audit:a11y`: passed on 8 pages (color contrast and landmark region disabled in jsdom)
- `pnpm check:assets`: within limits
- `pnpm audit --audit-level high`: no known vulnerabilities

## Deployment

- Pages project `protocol-anatomy` was created on 13 October 2026, connected to `davidgarciab/protocol-anatomy`, production branch `main`, build image v3.
- Build command: `pnpm install --frozen-lockfile && pnpm build`. Output: `dist`.
- `NODE_VERSION=24.21.0` and `PNPM_VERSION=12.13.0` are plain environment variables on production and preview.
- The first production deployment is `f5fa4d25-fdf5-440b-9251-7020ef8d44a1` from commit `020f437`. `https://protocol-anatomy.pages.dev/` returned HTTP 200 with the `_headers` security headers after a short HTTP 522 while the hostname propagated.
- That deployment redirects directory URLs such as `/protocols/aave` to `/protocols/aave/` with HTTP 308, while the HTML canonical omitted the slash. The site now sets `trailingSlash: 'always'` and emits the slash in canonicals, the sitemap, and internal links.
- Custom domain and live HTTPS on `protocols.davidgarciab.com` are recorded below only after they respond.

### Live result

Checked 13 October 2026 against deployment `90b92b02-86a8-4570-8e4e-ca2e010672b2` (commit `6df2cdd`, production, Active).

- `https://protocol-anatomy.pages.dev/` and the directory routes for all five protocols, all five version guides, concepts, glossary, methodology, sources, and search returned HTTP 200.
- `/protocols/aave` redirects with HTTP 308 to `/protocols/aave/`, whose canonical is `https://protocols.davidgarciab.com/protocols/aave/`.
- `robots.txt` allows crawling and points at `https://protocols.davidgarciab.com/sitemap-index.xml`. The sitemap lists the protocol and guide URLs with trailing slashes.
- Unknown paths return HTTP 404 with `noindex`.
- Response headers include `nosniff`, `strict-origin-when-cross-origin`, `X-Frame-Options: DENY`, and `Permissions-Policy: camera=(), microphone=(), geolocation=()`.
- The `protocol-anatomy.pages.dev` certificate is valid (Let's Encrypt, issued 13 October 2026, expires 11 January 2027).
- In the browser: homepage, Aave overview (breadcrumbs, table of contents, two diagrams), search for `stETH` (16 results) and `zzznomatchtoken` (0 results), glossary filter `stETH` (5 visible terms), mobile menu open and Escape dismissal, and the 404 page. The 404 page recorded no script errors. The copy button reported `Copy failed` in the automated browser because the document was not focused and clipboard access was denied. That is the existing failure path, not a production exception.
- GitHub Actions check on `6df2cdd` succeeded.

`protocols.davidgarciab.com` is attached to the Pages project (domain id `8f1966da-f6fd-4267-93a2-1e1a6d269c11`) with status `pending`. Verification says `CNAME record not set`. `dig` returned no CNAME or A record, and HTTPS to that hostname did not connect. DNS list and create calls return HTTP 403 with the current Wrangler token, which has zone read but not DNS edit. The dashboard session used for this check was not signed in.

Required record, and nothing else: proxied CNAME `protocols` → `protocol-anatomy.pages.dev` on zone `davidgarciab.com` (`54d48c045d5bd2b1a741b2f11d980a99`). Do not change nameservers or other records.
