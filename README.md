# ABS

A Minecraft bot that runs on Render.

It can:

- Join your Minecraft server automatically.
- Reconnect if it gets disconnected.
- Respawn when it dies.
- Keep walking.
- Run 24/7 while the Render service is running.

## How to set it up

### 1. Open Render

Go to Render and create a **Web Service**.

Choose your **ABS GitHub repository**.

### 2. Set the build and start commands

Use:

- **Build Command:** `npm install`
- **Start Command:** `npm start`

### 3. Add the environment variables

In Render, open **Environment Variables** and add these:

| Variable | Required | Example |
|---|---|---|
| `MC_HOST` | Yes | `play.example.net` |
| `MC_PORT` | No | `25565` |
| `MC_USERNAME` | Yes | `ABS_Bot` |
| `MC_AUTH` | No | `offline` |
| `MC_VERSION` | No | `1.21.4` |
| `RECONNECT_MS` | No | `5000` |
| `WALK_INTERVAL_MS` | No | `1000` |

**Most people only need to set:**

- `MC_HOST` = your server IP
- `MC_PORT` = your server port
- `MC_USERNAME` = the bot's Minecraft username

### 4. Deploy

Click **Create Web Service** / **Deploy**.

Render will install the bot and start it.

### 5. Check the logs

Open the **Logs** tab in Render.

You should see messages showing the bot connecting and spawning.

## Microsoft accounts

If your server requires a Microsoft account, set:

`MC_AUTH=microsoft`

Do not put passwords or private tokens in GitHub.

## Health check

The bot has a health page at:

`/health`

Render can use this to check that the web service is running.

## Important

The bot will keep trying to reconnect while the Render service is running, but no bot can guarantee staying connected if the Minecraft server blocks, kicks, bans, or refuses it.

Only use the bot on Minecraft servers that allow automated bots.
