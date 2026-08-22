# Contributing

Thanks for helping improve this n8n community node.

## Setup

- Node.js 20.15+
- npm 10+

```bash
npm install
npm run lint
npm run build
```

## Commit messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` new ecoDMS operation or resource
- `fix:` bug fix
- `docs:` README, changelog, templates
- `chore:` tooling, CI, ignore rules
- `test:` tests only

Keep pull requests small and focused.

## Pull requests

- Do not commit secrets, tokens, `.env`, or packed `.tgz` files.
- Update [CHANGELOG.md](CHANGELOG.md) under an `Unreleased` section when behavior changes.
- Keep existing operation names so published workflows stay valid.
- This repository is public. Never add customer names, internal hosts, or credentials.

## Code style

```bash
npm run lint
npm run lint:fix
```

Biome formats and lints TypeScript (`biome.jsonc`).
