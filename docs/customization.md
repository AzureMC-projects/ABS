# ABS Customization System

ABS is planned to support a server-side customization system for its bot, starting with custom skins.

## Planned architecture

GitHub Pages control panel -> ABS configuration/API -> ABS Paper plugin -> ABS Minecraft bot.

### ABS-Skins Paper plugin

The Paper plugin will handle server-side bot profile customization. The first feature is a custom skin for the ABS bot. The plugin is intended for the project's primary target, **Paper 26.3**.

Paper exposes player profile and texture APIs that can modify a player's profile and re-register the player to clients that can currently see them. Standard PlayerTextures skin URLs must point to the Minecraft texture server.

### ABS Control Panel

A future GitHub Pages site will provide a simple interface for server owners to configure ABS without manually editing configuration files.

Planned options include:
- Bot username
- Skin texture
- Classic or Slim skin model
- Enable/disable skin customization
- Skin preview
- Future movement and bot settings

GitHub Pages will remain a public frontend. Secrets and private credentials must never be placed in the frontend.

### ABS API/configuration bridge

A future API/configuration bridge will allow the control panel to communicate with the server-side component securely. The exact authentication and transport method is intentionally not finalized yet.

## Skin configuration

The first configuration target is expected to look like this:

    bot:
      name: ABS-Bot

    skin:
      enabled: true
      texture: "https://textures.minecraft.net/texture/..."
      model: classic

This is a planned configuration format and may change during implementation.

## Server-side behavior

1. ABS connects to the Paper server.
2. ABS-Skins detects the configured bot.
3. The plugin applies the configured player profile skin.
4. Paper re-registers the updated profile with clients that can see the bot.
5. The skin is reapplied after reconnects when necessary.
6. Administrators can reload the configuration without rebuilding ABS.

## Planned administration

The plugin is expected to provide an administrative command such as `/abs-skin reload` with a permission so normal players cannot change server configuration.

## Current status

**Early development.** The repository roadmap tracks the broader ABS Skin System and Control Panel work. The first implementation phase is the Paper plugin; the web control panel will be built after the server-side configuration contract is established.

## Compatibility

The primary compatibility target is **Paper 26.3**. Other server software, proxies, or Minecraft versions may require additional work.

Offline-mode servers and proxy networks can have additional profile/skin propagation considerations, so compatibility testing will be documented as the feature develops.

## Security

Never place Minecraft account passwords, Microsoft access tokens, Render API keys, server credentials, or private API keys inside GitHub Pages, public JavaScript, or committed configuration files.

## References

- Paper development: https://docs.papermc.io/paper/dev/
- Paper plugin configuration: https://docs.papermc.io/paper/dev/plugin-configurations/
- Paper plugin development: https://docs.papermc.io/paper/dev/getting-started/
- Paper player profiles: https://docs.papermc.io/paper/dev/command-api/arguments/entity-player/
