# Custom Skins

ABS's planned skin system uses the server-side **ABS-Skins** Paper plugin. This allows the bot's player profile to be customized on the server.

## Release setup

1. Install the released **ABS-Skins** `.jar` into the Paper server's `plugins/` directory.
2. Restart the server.
3. Open the [ABS Control Panel](https://azuremc-projects.github.io/ABS/).
4. Enter the ABS bot username.
5. Enable **custom skin**.
6. Paste a direct Minecraft texture URL into **Skin texture URL**.
7. Choose **Classic** or **Slim**.
8. Preview the texture.
9. Download the generated `config.yml`.
10. Place it at `plugins/ABS-Skins/config.yml`.
11. Run `/abs-skin reload`.
12. Start or reconnect ABS.

## Texture URL format

```text
https://textures.minecraft.net/texture/<texture-id>
```

The URL must point directly to the Minecraft texture. A NameMC page or other website page is not a texture URL.

## Example

```yaml
bot:
  name: ABS-Bot

skin:
  enabled: true
  texture: "https://textures.minecraft.net/texture/..."
  model: classic
```

## Architecture

```text
GitHub Pages Control Panel
          |
          v
ABS configuration/API
          |
          v
ABS-Skins Paper plugin
          |
          v
ABS Minecraft bot
```

The initial release uses generated configuration files. A secure API/configuration bridge is planned for future automation.

> ABS-Skins is under development. Supported Minecraft versions and implementation details may change before stable release.
