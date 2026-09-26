# ABS-Skins

**ABS-Skins** is the planned server-side Paper plugin for the ABS customization system.

Its first responsibility is applying a custom skin to the ABS bot so the skin can be visible to players on the server.

## Status

Early development.

## Target

- Paper 26.3
- ABS bot
- Offline-mode compatible server setup where Paper profile updates are supported

## Planned configuration

    bot:
      name: ABS-Bot

    skin:
      enabled: true
      texture: "https://textures.minecraft.net/texture/..."
      model: classic

## Planned command

`/abs-skin reload`

## Planned control panel

The future **ABS Control Panel** will be hosted with GitHub Pages and will make skin configuration easier for server owners. The control panel will not store or expose server credentials.

See [the customization architecture](../../docs/customization.md) for the complete design and security requirements.
