# Configuration

ABS is configured through environment variables.

| Variable | Required | Default | Description |
|---|:---:|---|---|
| `MC_HOST` | Yes | — | Minecraft server hostname or IP |
| `MC_PORT` | No | `25565` | Minecraft server port |
| `MC_USERNAME` | Yes | — | Bot username |
| `MC_AUTH` | No | `offline` | Mineflayer authentication mode |
| `MC_VERSION` | No | auto | Minecraft protocol version |
| `RECONNECT_MS` | No | `5000` | Delay before reconnecting |
| `WALK_INTERVAL_MS` | No | `1000` | Walking update interval |

Keep credentials and other secrets out of Git. For Microsoft authentication, follow the authentication guidance for the environment you deploy to.
