# Changelog

All notable changes to ABS are documented here.

## [Unreleased]

- Added configurable forward, random, and idle movement modes.
- Added configurable jump probability.
- Added capped exponential reconnect backoff with jitter; successful spawns reset the failure streak.
- Expanded configuration and reliability unit tests.
- Added an optional, opt-in local runtime event plugin hook API.
- Expanded CI runtime coverage to Node.js 20 and 22.
- Added environment-variable defaults to the Render blueprint.

## [1.0.0]

- Initial ABS release.
- Minecraft connection with automatic reconnection.
- Automatic respawning.
- Continuous walking.
- Render Web Service deployment configuration.
