# Production readiness

Updated 14 October 2026. This file records what was checked and what is actually deployed. It is not a substitute for the production site responding.

## 14 October 2026

- Search is `noindex, follow` and is omitted from the sitemap. Article pages include `TechArticle` (`datePublished`, `dateModified`) and a `BreadcrumbList` that matches the visible breadcrumbs.
- Google Search Console is not authorized from this workspace. No verification token is stored. The property owner adds `https://protocols.davidgarciab.com/` in Search Console, verifies it with the HTML file or meta tag Google displays, and submits `https://protocols.davidgarciab.com/sitemap-index.xml`. This pass does not change DNS.
- `pnpm editorial:review` watches 17 GitHub files and releases in `editorial/sources.json`. A second run against the committed baseline reported no changes. `.github/workflows/editorial-review.yml` is weekly and separate from the production check workflow.
- Local checks after the content change: `pnpm check` 0 errors, `pnpm test` 16/16, `pnpm validate` 27 articles and 49 glossary entries, `pnpm build` 35 pages, `pnpm verify:dist`, `pnpm audit:a11y` 8 pages, `pnpm check:assets`, `pnpm check:links` 61 URLs and 0 broken.

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

Checked 13 October 2026 on `https://protocols.davidgarciab.com`, served by production deployment `0665b82c-9e29-496d-be30-1a3dd52e8ad9` (commit `99a4239`).

- Pages custom domain `protocols.davidgarciab.com` status is `active`. Verification is `active`. HTTP certificate validation is `active`. Certificate authority is Google.
- Authoritative DNS and `1.1.1.1` / `8.8.8.8` resolve the hostname to Cloudflare proxy addresses `188.114.96.5` and `188.114.97.5`, plus IPv6 `2a06:98c1:3120::5` and `2a06:98c1:3121::5`. The proxied record does not return a public CNAME. The zone DNS API still returns HTTP 403 for this Wrangler login, so the raw record was not edited from here.
- TLS certificate: subject `CN=protocols.davidgarciab.com`, issuer Google Trust Services `WE1`, valid 13 October 2026 through 11 January 2027. SAN is `DNS:protocols.davidgarciab.com`.
- HTTPS routes returned 200 for `/`, the protocol directory, all five protocol overviews, all five version guides, `/concepts/`, `/concepts/constant-product/`, `/glossary/`, `/methodology/`, `/sources/`, `/search/`, `robots.txt`, `sitemap-index.xml`, and `favicon.svg`. `/does-not-exist` returned 404 with `noindex`.
- `/protocols/aave` redirects with HTTP 308 to `/protocols/aave/`. The canonical on that page is `https://protocols.davidgarciab.com/protocols/aave/`. `robots.txt` allows crawling and points at `https://protocols.davidgarciab.com/sitemap-index.xml`.
- Response headers include `nosniff`, `strict-origin-when-cross-origin`, `X-Frame-Options: DENY`, and `Permissions-Policy: camera=(), microphone=(), geolocation=()`.
- In the browser on the custom domain: homepage, Aave overview (breadcrumbs, table of contents, two figures, stylesheet HTTP 200, no failed resource responses, no script errors), and search for `liquidation` (18 results, no script errors).
- The copy button still reports `Copy failed` in this automated browser. With focus emulation on, `document.hasFocus()` was true and `clipboard.writeText` rejected with `NotAllowedError: Write permission denied`. That is the embedded browser denying clipboard write, not a missing production permission policy. No site change was made for it.
