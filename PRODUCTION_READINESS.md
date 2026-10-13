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
- The project was created after commit `fbada23` was pushed, so that commit did not start a Pages build. The next push to `main` is the first production build.
- Custom domain and live HTTPS are recorded below only after they respond.

### Live result

Pending the first production deployment.
