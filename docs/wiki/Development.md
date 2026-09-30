# Development

## Project structure

```text
src/                  ABS Node.js application
docs/                 Documentation and GitHub Pages site
plugins/ABS-Skins/    Paper skin plugin
assets/               Project assets
.github/              CI, issue templates, and automation
```

## Validation

```bash
npm run check
npm run lint
npm run format:check
```

## ABS-Skins

The Paper plugin is scaffolded under `plugins/ABS-Skins/` and uses Gradle Kotlin DSL.

Test the plugin against the supported Paper version before describing it as production-ready.

## Contributions

Follow the repository's contribution guidelines and issue templates. See [CONTRIBUTING.md](../../CONTRIBUTING.md).
