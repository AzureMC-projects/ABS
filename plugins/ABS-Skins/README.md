# ABS-Skins

**ABS-Skins** is the server-side Paper plugin for ABS bot skin customization.

## Build

Requirements: Java 25 and Gradle 9.1+.

```bash
cd plugins/ABS-Skins
gradle test build
```

The plugin jar is created at `build/libs/abs-skins-0.1.0-SNAPSHOT.jar`. Copy it to the Paper server's `plugins/` directory and restart the server.

## Local skin settings

Edit `plugins/ABS-Skins/config.yml`:

```yaml
bot:
  name: ABS_Bot

skin:
  enabled: true
  texture: "https://textures.minecraft.net/texture/<hex-hash>"
  model: classic
```

The plugin validates the username, texture host, and model. Use `/abs-skin reload` to reload local settings.

## Remote configuration

Set `api.base-url` to the HTTPS origin of the ABS Node service and `api.token` to the same high-entropy secret as `ABS_CONTROL_TOKEN` on that service. The token must be at least 32 characters. The plugin polls `GET /api/v1/config` on a background scheduler, validates each new revision, and applies settings to the matching online player. Remote skin updates are applied on the server thread.

See [Remote Configuration and Security](../../docs/remote-configuration.md) for API setup, GitHub Pages Control Panel use, persistent storage requirements, and security limitations. Never commit the token or include it in bug reports.
