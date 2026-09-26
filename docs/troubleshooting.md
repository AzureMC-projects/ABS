# Troubleshooting

## The bot does not connect

Check that `MC_HOST`, `MC_USERNAME`, and `MC_PORT` are correct. Review the Render logs for the first Minecraft error.

## The bot repeatedly reconnects

Check whether the server is reachable, whether the account is allowed to join, and whether the configured Minecraft version matches the server.

## The bot is kicked or banned

ABS cannot bypass server rules, kicks, bans, authentication requirements, or network restrictions. Only use the bot where automated clients are permitted.

## The Render service is healthy but the bot is offline

Open the service logs and check for the latest connection, kick, error, or reconnect message. The `/health` endpoint reports whether ABS is currently connected.
