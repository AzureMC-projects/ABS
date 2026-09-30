# Configuration

ABS is configured through environment variables.

| Variable | Default | Purpose |
| --- | --- | --- |
| `MC_HOST` | — | Minecraft server hostname |
| `MC_PORT` | `25565` | Minecraft server port |
| `MC_USERNAME` | — | Bot username |
| `MC_AUTH` | `offline` | Mineflayer authentication mode |
| `MC_VERSION` | blank | Minecraft version override |
| `RECONNECT_MS` | `5000` | Delay before reconnecting |
| `WALK_INTERVAL_MS` | `1000` | Movement update interval |

## Example

```env
MC_HOST=your-paper-server.example.com
MC_PORT=25565
MC_USERNAME=ABS-Bot
MC_AUTH=offline
MC_VERSION=
RECONNECT_MS=5000
WALK_INTERVAL_MS=1000
```

## Security

Never commit Minecraft passwords, Microsoft tokens, Render API keys, server credentials, or private API keys.

Use environment variables or your hosting platform's secret configuration.

## Runtime endpoints

### `/`

Returns basic ABS service information.

### `/health`

Returns a health response suitable for hosting-platform monitoring.

### `/api/status`

Returns bot connection and runtime status information.
