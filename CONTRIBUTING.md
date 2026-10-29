# Contributing to Protocol Anatomy

Thanks for helping. Protocol Anatomy is a small, source-backed publication about how DeFi protocols work, and corrections and new material from people who read contracts are the most useful thing you can add.

Site: <https://protocols.davidgarciab.com> · Maintainer: [@davidgarciab](https://github.com/davidgarciab)

## Ways to help

- **Report a wrong or stale claim.** Open a [correction issue](../../issues/new?template=correction.yml) with the page, the sentence, and a primary source. This is the highest-value contribution.
- **Fix it yourself.** Fork the repository, change the article on a branch, and open a pull request. See [Propose a change](#propose-a-change-fork-and-pull-request). The `main` branch is protected, so direct edits are not possible.
- **Propose a topic.** Open a [topic proposal](../../issues/new?template=topic.yml) for a new protocol, version guide, concept, or glossary term before writing a long article.
- **Improve the tooling.** Validation, accessibility, search, and diagrams are all fair game.

Not in scope: price commentary, investment advice, token promotion, audits, or live risk parameters and balances. See the [methodology](https://protocols.davidgarciab.com/methodology/) for the editorial standard.

## Propose a change: fork and pull request

1. **Fork** the repository on GitHub and clone your fork.
2. **Create a branch** from `main`, for example `fix/aave-v3-eligibility`.
3. **Make one focused change** (the file path is shown at the bottom of each article), then run the checks below.
4. **Commit and push** the branch to your fork.
5. **Open a pull request** against `main` of this repository, filling in the template with the source that supports the change.

## Set up

Requires Node.js 24.x (`.nvmrc`) and pnpm 12.13.0 (`corepack enable`).

```bash
pnpm install
pnpm dev
```

Before opening a pull request, run what CI runs:

```bash
pnpm check && pnpm test && pnpm validate && pnpm build && pnpm verify:dist
```

`pnpm validate` is the fastest feedback loop for content: it checks frontmatter, internal links, glossary ids, diagram names, the version-status vocabulary, and placeholder text. The full command list is in the [README](README.md#checks).

## Where things live

| You want to… | Edit |
| --- | --- |
| Fix or extend an article | `src/content/{protocols,guides,concepts}/<slug>.md` |
| Add a glossary term | `src/data/glossary.ts` |
| Add or change a diagram | `src/diagrams/registry.ts` |
| Add a protocol to the required set | `src/lib/content-rules.ts` |

The filename is the URL slug. Fields are validated by the Zod schemas in `src/content.config.ts`; copy the frontmatter of an existing article of the same kind (for example `src/content/concepts/proxies.md`) as your starting point.

## Editorial rules

These are enforced partly by `pnpm validate` and partly by review.

1. **Cite primary sources.** Prefer the protocol's docs, whitepaper, source code at a named file and tag or commit, then governance posts. No secondary explainers. Put the source in the prose as a Markdown link and keep the same URL in the `sources` frontmatter. Link a section, file, or proposal, not a homepage.
2. **Explain the mechanism.** State, actors, formula or invariant, and the failure case.
3. **Separate past from present.** Use only the version statuses `released`, `active`, `historical`, `deprecated`, `proposed`, `in-development`. Do not add a version because a sequence would look complete.
4. **Label code.** Say whether a block is an excerpt (name the file and tag or commit) or an educational sketch. Never describe sketches as audited or safe for assets.
5. **Set `lastVerified` honestly.** It is the date you actually read the cited sources, in `YYYY-MM-DD`, not the date you edited the file.
6. **No placeholders.** `TODO`, `TBD`, `PLACEHOLDER`, "lorem ipsum", and "coming soon" fail validation.
7. **Keep descriptions under 180 characters** and make the article useful without the protocol's marketing page.

## Adding a protocol, article, or diagram

- **Protocol:** see [Add a protocol](README.md#add-a-protocol). A protocol needs an overview and at least one version guide.
- **Article:** see [Add an article](README.md#add-an-article).
- **Diagram:** see [Diagrams and code](README.md#diagrams-and-code). Every figure needs a caption and a text description.

## Pull requests

- Keep each PR to one topic so it can be checked against its sources.
- Say what changed, why, and which source supports it. The PR template has a checklist.
- Link the issue it resolves, if any.
- CI must pass. A maintainer may ask for a better source or a narrower claim; that is normal.

## Code of conduct

Be respectful and assume good faith. Disagree about claims by pointing at sources. Harassment or spam is not tolerated and will be removed.

## License

This repository uses two licenses: code is [MIT](LICENSE), and original articles, glossary entries, and diagrams are [CC BY 4.0](CONTENT_LICENSE.md). By opening a pull request you agree your contribution is licensed under the matching terms. Only contribute work you wrote or have the right to license, and do not paste text or code from other projects beyond a short, cited excerpt.
