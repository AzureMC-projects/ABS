# Configuration

ABS is configured through environment variables.

| Variable | Required | Default | Description |
|---|:---:|---|---|
| `MC_HOST` | Yes | — | Minecraft server hostname or IP |
| `MC_PORT` | No | `25565` | Minecraft server port |
| `MC_USERNAME` | Yes | — | Bot username |
| `MC_AUTH` | No | `offline` | Mineflayer authentication mode |
| `MC_VERSION` | No | auto | Minecraft protocol version |
| `RECONNECT_MS` | No | `5000` | Initial reconnect delay in milliseconds |
| `RECONNECT_MAX_MS` | No | `60000` | Maximum reconnect delay |
| `RECONNECT_MULTIPLIER` | No | `2` | Exponential backoff multiplier |
| `RECONNECT_JITTER` | No | `0.2` | Randomized delay fraction from `0` to `1` |
| `WALK_INTERVAL_MS` | No | `1000` | Movement update interval |
| `MOVEMENT_MODE` | No | `forward` | `forward`, `random`, or `idle` |
| `JUMP_CHANCE` | No | `0.12` | Probability of a jump per movement tick, from `0` to `1` |

Reconnect delay doubles by default after consecutive failures, is randomized to avoid synchronized reconnect storms, and is capped by `RECONNECT_MAX_MS`. The failure streak resets after the bot spawns or respawns successfully. `RECONNECT_MS` is the initial delay, not a fixed delay after every failure.

Movement modes:
- `forward`: continuously walk forward with occasional jumps.
- `random`: choose a random horizontal direction each movement tick, with occasional sprinting and jumps.
- `idle`: do not initiate movement.

For example, to disable movement while retaining automatic reconnects, set `MOVEMENT_MODE=idle`.

Keep credentials and other secrets out of Git. For Microsoft authentication, follow the authentication guidance for the environment you deploy to.
