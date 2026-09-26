# ABS

A Minecraft bot that runs on Render.

It can:

- Join Minecraft servers automatically.
- Reconnect if it gets disconnected.
- Respawn when it dies.
- Keep walking.
- Keep running while the Render service is running.

## Setup

### 1. Fork this repository

If this is someone else's ABS repository, click **Fork** on GitHub and make a copy in your own GitHub account.

If the repository is already yours, you can skip this step.

### 2. Create a Render Web Service

Go to Render and:

1. Click **New +**
2. Choose **Web Service**
3. Select your GitHub repository
4. Give the service a name
5. Keep the build command as:
   `npm install`
6. Keep the start command as:
   `npm start`

### 3. Configure the environment variables

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

For a basic setup, you mainly need:

- `MC_HOST` = your Minecraft server IP
- `MC_PORT` = your Minecraft server port
- `MC_USERNAME` = the bot's Minecraft username

### 4. Deploy it

Click **Create Web Service**.

Render will install the bot and start it.

Once it is running, open **Logs** in Render to see whether the bot connected.

## Microsoft accounts

If the server requires Microsoft authentication, set:

`MC_AUTH=microsoft`

Do not put passwords or private tokens in GitHub.

## Important

The bot will keep trying to reconnect while the Render service is running, but the Minecraft server can still block, kick, ban, or refuse the bot.

Only use the bot on servers that allow automated bots.
