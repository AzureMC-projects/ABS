# Server Compatibility

## Primary target

ABS is primarily made and manually tested for **Paper 26.3**. The CI suite tests the
Node.js runtime and unit-level behavior; it does not claim that a real Minecraft
server was contacted during CI.

| Server software | Version | Support status |
|---|---|---|
| Paper | 26.3 | Primary manual test target |
| Other Paper versions | Varies | Community reports welcome |
| Vanilla | Varies | Not currently a primary target |
| Spigot / forks | Varies | Not currently a primary target |
| Proxy networks | Varies | Requires separate validation |

Compatibility can also depend on the Minecraft protocol version, server configuration,
plugins, authentication mode, and hosting environment.

## Manual compatibility test checklist

For each server/version combination, record the exact version and run:

- [ ] Bot completes login and emits a spawn event.
- [ ] Bot stays connected for at least 15 minutes.
- [ ] Configured movement mode behaves as expected.
- [ ] Death and respawn work, if enabled by the server.
- [ ] Disconnects reconnect using backoff without a tight retry loop.
- [ ] Health and status endpoints remain responsive.
- [ ] No repeated protocol, authentication, or plugin errors appear in logs.

Do not mark a server/version as tested unless the test was run against that actual
server. Reports should include server software/version, Minecraft version, ABS commit,
auth mode, relevant plugins, expected behavior, observed behavior, and sanitized logs.

Never include passwords, access tokens, private server credentials, or other secrets in an issue.
