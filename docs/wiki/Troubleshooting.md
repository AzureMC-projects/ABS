# Troubleshooting

## ABS does not connect

Check:

1. `MC_HOST` is correct.
2. `MC_PORT` is correct.
3. The Minecraft server is online.
4. The configured authentication mode is accepted.
5. The bot username is correct.
6. Firewall and network rules allow the connection.

Check the ABS logs for the connection error.

## ABS keeps reconnecting

Confirm that the Minecraft server is reachable and that the bot is not being kicked by server rules, plugins, authentication settings, or duplicate-login protection.

Increase `RECONNECT_MS` if the server needs more time between connection attempts.

## Custom skin does not appear

Check:

- ABS-Skins is installed and enabled.
- The configured bot name exactly matches the ABS username.
- `skin.enabled` is `true`.
- The texture URL is a direct `textures.minecraft.net` URL.
- The plugin was reloaded with `/abs-skin reload`.
- Proxy or authentication plugins are not replacing the player profile.

The primary compatibility target is Paper 26.3.

## Control Panel does not load

Confirm GitHub Pages is publishing the `main` branch's `/docs` folder. If Pages was just enabled or changed, allow time for deployment.

## More help

See the repository's main troubleshooting guide at [docs/troubleshooting.md](../troubleshooting.md).
