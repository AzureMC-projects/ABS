# Contributing to ABS

Thanks for contributing to ABS (Azures Bot Service).

## Before opening an issue

Please check existing issues and documentation first. For bugs, include the Minecraft version, server software/version, relevant logs, and clear reproduction steps. Remove secrets and private information from logs.

## Pull requests

1. Fork the repository.
2. Create a focused branch for your change.
3. Make the smallest practical change.
4. Run the available checks:
   ```bash
   npm ci
   node --check src/index.js
   ```
5. Update documentation when behavior or configuration changes.
6. Open a pull request with a clear summary and testing notes.

## Code style

Use modern Node.js-compatible JavaScript, clear names, small functions, and straightforward error handling. Avoid committing generated files, credentials, or local configuration.

## Safety and server rules

Only use ABS on Minecraft servers that permit automated clients. Contributors are responsible for respecting the rules of the servers and services they use.

## Branding

ABS source code is licensed under Apache License 2.0. The ABS name and branding are subject to the project's trademark guidance in [TRADEMARKS.md](TRADEMARKS.md).
