# ABS

Render-hosted Minecraft bot that:

- Automatically connects to a configured Minecraft server.
- Reconnects after disconnects, kicks, and connection errors.
- Automatically resumes walking after spawning/respawning.
- Runs an HTTP health endpoint for Render.
- Keeps configuration and credentials in environment variables.

## Render deployment

1. Push this repository to GitHub.
2. In Render, create a **Web Service** from this repository.
3. Render can use the included `render.yaml`, or use:
   - Build command: `npm install`
   - Start command: `npm start`
4. Add these environment variables:

| Variable | Required | Example |
|---|---|---|
| `MC_HOST` | Yes | `play.example.net` |
| `MC_PORT` | No | `25565` |
| `MC_USERNAME` | Yes | `ABS_Bot` |
| `MC_AUTH` | No | `offline` |
| `MC_VERSION` | No | `1.21.4` |
| `RECONNECT_MS` | No | `5000` |
| `WALK_INTERVAL_MS` | No | `1000` |

### Microsoft-authenticated accounts

For servers that require Microsoft authentication, set:

`MC_AUTH=microsoft`

Mineflayer will handle the Microsoft login flow. Do not put passwords or tokens in the repository.

## Health endpoints

- `/` — service status
- `/health` — health check

## Notes

The bot cannot guarantee staying connected if the Minecraft server bans, blocks, rate-limits, or otherwise refuses the connection. It will keep attempting to reconnect while the Render service is running.

Use the bot only on servers where automated clients/bots are permitted.
