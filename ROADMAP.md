# ABS Roadmap

ABS is primarily developed and tested for **Paper 26.3**. Other Minecraft server software or versions may work, but are not currently the primary compatibility target.

## Current

- [x] Automatic server connection
- [x] Automatic reconnection
- [x] Automatic respawn
- [x] Continuous walking
- [x] Configurable movement modes and jump probability
- [x] Exponential reconnect backoff with jitter and a maximum delay
- [x] Render deployment configuration
- [x] Health and status endpoints
- [x] GitHub issue templates and CI
- [x] Improved web status dashboard
- [x] Automated configuration and reliability unit tests
- [x] Docker deployment documentation
- [x] One-click Render deployment guidance
- [x] ABS Control Panel for local skin configuration export

## Next

### Reliability and compatibility
- [ ] Broader server compatibility testing against a real server matrix
- [x] Initial opt-in runtime event plugin hooks and documented plugin API

### Customization and control
- [x] Initial ABS Skin System — Paper plugin for server-side bot skins and remote polling
- [x] Initial authenticated remote configuration bridge between the Control Panel, ABS API, and Paper plugin
- [ ] Multi-user RBAC, separate panel/plugin credentials, and managed persistent storage

### Project and release tooling
- [x] Tag-driven GitHub Release automation

Roadmap items are plans, not guarantees. Compatibility reports and community contributions are welcome through GitHub Issues.
