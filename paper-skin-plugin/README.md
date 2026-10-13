# ABS Skin System (Paper plugin)

This is the initial Paper plugin implementation for applying configured skins to an online player whose username matches the configured bot username.

## Requirements

- Paper 1.21.4 or a compatible build exposing the Paper profile API
- Java 21
- Maven 3.9+

## Build and install

From this directory:

```bash
mvn test package
```

Copy `target/abs-skin-system-0.1.0-SNAPSHOT.jar` to the server's `plugins/` directory and restart Paper. The plugin writes `plugins/ABSSkinSystem/config.yml` on first start.

## Remote sync

Set `api.base-url` to the HTTPS origin of the ABS Node service, and set `api.token` to the same high-entropy token used as `ABS_CONTROL_TOKEN` on that service. Do not commit the token or share it with the GitHub Pages browser. The plugin polls `GET /api/v1/config` using Bearer authentication every 30 seconds by default. Polling never runs on the main server thread; skin/profile changes are scheduled back onto the main thread.

The API accepts texture URLs only from `https://textures.minecraft.net/texture/<hash>`. The plugin applies the selected classic/slim model to an online player matching the configured username. A skin update is not a guarantee that every client immediately refreshes its cached player skin; reconnecting may be needed on some versions.

## Local fallback

If remote API settings are absent, the plugin can use its local `skin` settings for player joins. Remote sync remains disabled until an HTTPS API URL and token are supplied.

## Security

Use HTTPS, a unique random token of at least 32 characters, and keep the token out of source control. The initial API uses one shared bearer token for the operator's control panel and Paper plugin. This is a pragmatic first deployment boundary, not multi-user RBAC; rotate the token if exposed. For separate operator and plugin credentials, deploy an identity provider or split tokens before opening this service to multiple administrators.
