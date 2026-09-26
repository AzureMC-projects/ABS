# ABS Customization System

ABS includes a planned server-side customization system for its bot, starting with custom skins.

## Custom skin setup — release guide

When the ABS Skin System is released, the intended setup will be:

### 1. Install ABS-Skins on your Paper server

Download the released **ABS-Skins** plugin and place its `.jar` file in:

```text
plugins/
```

Restart the server so Paper loads the plugin.

> The first supported target is **Paper 26.3**. Other server software, proxies, or Minecraft versions may require additional compatibility work.

### 2. Open the ABS Control Panel

Open the **ABS Control Panel** on GitHub Pages.

Enter the Minecraft username used by your ABS bot.

### 3. Choose the custom skin

In **Skin texture URL**, paste a direct Minecraft texture URL:

```text
https://textures.minecraft.net/texture/<texture-id>
```

Do not paste a NameMC page, a skin website page, or an avatar URL. The value should point directly to the Minecraft texture.

Select:
- **Enable custom skin**
- **Classic** for the standard player model, or
- **Slim** for the Alex-style player model

Use the preview to check the selected texture.

### 4. Generate the configuration

Click **Download config.yml** in the Control Panel.

The generated configuration will look similar to:

```yaml
bot:
  name: ABS-Bot

skin:
  enabled: true
  texture: "https://textures.minecraft.net/texture/..."
  model: classic
```

### 5. Install the configuration

Place the generated `config.yml` in:

```text
plugins/ABS-Skins/config.yml
```

If the plugin created a default configuration file, replace or edit it with the generated values.

### 6. Reload the plugin

Run:

```text
/abs-skin reload
```

You will need the `abs.skins.admin` permission, which is granted to server operators by default.

The plugin will reload the skin settings and apply the configured profile to the ABS bot when it is present.

### 7. Connect the ABS bot

Start or restart the ABS bot using your normal Render deployment.

When the bot joins the Paper server, ABS-Skins will detect the configured bot username and apply the selected skin.

The plugin is designed to reapply the skin after reconnects when necessary.

## Planned architecture

GitHub Pages Control Panel -> ABS configuration/API -> ABS Paper plugin -> ABS Minecraft bot.

### ABS-Skins Paper plugin

The Paper plugin handles server-side bot profile customization. The first feature is a custom skin for the ABS bot.

Paper exposes player profile and texture APIs that can modify a player's profile and re-register the player to clients that can currently see them. Standard PlayerTextures skin URLs should point to the Minecraft texture server.

### ABS Control Panel

The GitHub Pages control panel provides a simple interface for configuring ABS without manually writing the skin configuration.

Current planned options include:
- Bot username
- Skin texture
- Classic or Slim skin model
- Enable/disable skin customization
- Skin preview
- Future movement and bot settings

GitHub Pages remains a public frontend. Secrets and private credentials must never be placed in the frontend.

### ABS API/configuration bridge

A future API/configuration bridge may allow the control panel to communicate with the server-side component securely. The exact authentication and transport method is intentionally not finalized yet.

For the initial release, downloading the generated `config.yml` and installing it on the server is the expected configuration path.

## Server-side behavior

1. ABS connects to the Paper server.
2. ABS-Skins detects the configured bot username.
3. The plugin applies the configured player profile skin.
4. Paper re-registers the updated profile with clients that can currently see the bot.
5. The skin is reapplied after reconnects when necessary.
6. Administrators can reload the configuration without rebuilding ABS.

## Administration

The plugin provides:

```text
/abs-skin reload
```

This command requires the `abs.skins.admin` permission so normal players cannot change the server's skin configuration.

## Offline-mode and proxy notes

The skin system is designed to work with server-side profile changes, including offline-mode deployments, but proxy networks and custom authentication/profile systems can affect how skins propagate to clients.

If the bot's skin does not appear correctly, check the [compatibility guide](compatibility.md) and server/proxy configuration.

## Current status

**Release preparation / early development.** The Control Panel can generate and preview skin configuration, while the ABS-Skins Paper plugin is the server-side component responsible for applying it.

The exact plugin release process, supported Minecraft versions, and any API/configuration bridge may change before the first stable release.

## Compatibility

The primary compatibility target is **Paper 26.3**. Other server software, proxies, or Minecraft versions may require additional work.

## Security

Never place Minecraft account passwords, Microsoft access tokens, Render API keys, server credentials, or private API keys inside GitHub Pages, public JavaScript, or committed configuration files.

## References

- Paper development: https://docs.papermc.io/paper/dev/
- Paper plugin configuration: https://docs.papermc.io/paper/dev/plugin-configurations/
- Paper plugin development: https://docs.papermc.io/paper/dev/getting-started/
- Paper player profiles: https://docs.papermc.io/paper/dev/command-api/arguments/entity-player/
