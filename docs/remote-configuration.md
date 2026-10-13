# Remote configuration and ABS Skin System

## Architecture

- **ABS Node service** hosts the authenticated configuration API at `/api/v1/config`.
- **ABS Control Panel** (GitHub Pages) reads and writes the API using HTTPS and a Bearer token entered by the operator. The browser keeps the token in page memory only.
- **ABSSkinSystem** is a Paper plugin that polls the API on a background scheduler, validates each new configuration revision, and applies the selected skin to a matching online player.

The API configuration currently supports a skin target, texture URL and model, plus bot movement mode, jump probability, and movement interval. Skin texture URLs must use `https://textures.minecraft.net/texture/<hex-hash>`.

## 1. Configure the ABS API

Set these environment variables on the ABS Node service:

| Variable | Required | Description |
|---|---|---|
| `ABS_CONTROL_TOKEN` | Yes for remote config | Unique random secret, at least 32 characters |
| `ABS_CONTROL_ORIGIN` | No | Exact browser origin allowed to call the API; defaults to `https://azuremc-projects.github.io` |
| `ABS_CONFIG_PATH` | No | JSON configuration file path; defaults to `data/remote-config.json` |

Generate a strong token locally, for example with `openssl rand -hex 32`. Add it to the hosting provider's secret/environment settings, not to Git. Use the same token in the Paper plugin's server-local config and enter it in the control panel when connecting. Rotate it if it is exposed.

The API refuses to enable remote configuration if the token is missing or shorter than 32 characters. It checks Bearer credentials with a constant-time comparison, validates all updates, limits request bodies, and rejects browser origins other than the configured origin. Deploy behind HTTPS. CORS is a browser boundary, not a replacement for authentication.

## 2. Persistent storage

The API writes configuration atomically to `ABS_CONFIG_PATH`. Many free hosting instances have ephemeral filesystems, so configuration may reset on redeploy/restart unless the path is on a persistent mounted disk. On Render, attach a persistent disk to a supported paid service and set `ABS_CONFIG_PATH` to a location on that disk. A managed database is the better next step for multi-instance or multi-operator deployments.

## 3. Configure the Paper plugin

Build the plugin:

```bash
cd paper-skin-plugin
mvn test package
```

Copy `target/abs-skin-system-0.1.0-SNAPSHOT.jar` into the Paper server's `plugins/` directory and restart. Edit `plugins/ABSSkinSystem/config.yml`:

- `api.base-url`: HTTPS origin of the ABS service, without `/api/v1/config`.
- `api.token`: the same secret as `ABS_CONTROL_TOKEN`.
- `api.poll-seconds`: polling interval (minimum 10 seconds).
- `skin.*`: local fallback settings if remote sync is not configured.

The Paper plugin's HTTP polling is asynchronous; Bukkit profile/player modifications are scheduled on the server thread. Only the configured matching username is affected. Player skin caching varies by client/server; reconnecting may be required for a client to refresh.

## 4. Use the Control Panel

Open [the ABS Control Panel](https://azuremc-projects.github.io/ABS/control-panel.html), enter the ABS service URL and token, and choose **Connect and load**. Edit skin or movement settings, then choose **Save remote settings**. The API returns a revision number; the Paper plugin applies newer revisions on its next poll. **Clear credentials** removes the token from the page's current memory.

The downloadable `config.yml` is a local fallback only. It deliberately contains an empty API token placeholder. Never put the API token in a downloaded file, GitHub Pages source, screenshots, issue reports, or commits.

## Security boundary and limitations

This first version uses one shared bearer secret for the operator panel and Paper plugin. Anyone holding that token can read and update all settings. Keep the control API private to trusted operators, use HTTPS, and rotate the secret as needed. Before multi-user access, add separate operator/read-only credentials, audit identity, rate limiting, and role-based access control. Do not expose the token in URLs or logs.

Configuration storage is a single JSON file and is intended for one ABS service instance. It is not a multi-instance database or a high-availability control plane. Server compatibility and skin refresh behavior still require integration testing on the exact Paper build and Minecraft client versions you deploy.
