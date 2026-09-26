# ABS

**ABS (Azures Bot Service)** is a lightweight Minecraft bot designed to run continuously as a Render Web Service.

It automatically connects to a Minecraft server, reconnects after disconnects, respawns, and continuously walks while the service is running.

---

## Features

- 🤖 Automatic Minecraft server connection
- 🔄 Automatic reconnection after disconnects
- ♻️ Automatic respawning
- 🚶 Continuous walking
- ☁️ Designed for Render Web Services
- ⚙️ Simple environment-variable configuration

---

## Setup

### 1. Fork this repository

If you are setting up your own copy of ABS:

1. Click **Fork** on GitHub.
2. Select your GitHub account.
3. Use your fork for the Render deployment.

If you already own the repository, you can skip this step.

### 2. Create a Render Web Service

Open Render and:

1. Click **New +**
2. Select **Web Service**
3. Connect your GitHub repository
4. Choose the **ABS** repository
5. Give your service a name
6. Set the build command to:

```bash
npm install
```

7. Set the start command to:

```bash
npm start
```

### 3. Configure environment variables

In your Render service, open **Environment Variables** and add the following:

| Variable | Required | Example | Description |
|---|:---:|---|---|
| `MC_HOST` | **Yes** | `play.example.net` | Minecraft server address |
| `MC_PORT` | No | `25565` | Minecraft server port |
| `MC_USERNAME` | **Yes** | `ABS_Bot` | Minecraft bot username |
| `MC_AUTH` | No | `offline` | Authentication mode |
| `MC_VERSION` | No | `1.21.4` | Minecraft version |
| `RECONNECT_MS` | No | `5000` | Reconnect delay in milliseconds |
| `WALK_INTERVAL_MS` | No | `1000` | Walking interval in milliseconds |

For a basic setup, the main variables you need are:

```text
MC_HOST=your-server-ip
MC_PORT=25565
MC_USERNAME=your-bot-name
```

### 4. Deploy

Click **Create Web Service** in Render.

Render will install the dependencies and start ABS automatically.

Once the service is running, open the **Logs** section in Render to check the bot's connection status.

---

## How ABS works

Once started, ABS will:

1. Connect to the configured Minecraft server.
2. Start walking after joining.
3. Respawn when the bot dies.
4. Reconnect if the connection is lost.
5. Continue operating while the Render service is running.

ABS cannot prevent a Minecraft server from kicking, banning, blocking, or shutting down the bot.

---

## Microsoft authentication

If your Minecraft server requires Microsoft authentication, set:

```text
MC_AUTH=microsoft
```

**Never put passwords, access tokens, or other private credentials in GitHub.**

---

## Using ABS in your own projects

ABS is licensed under the **Apache License 2.0**.

You may use, modify, and deploy ABS in your own projects and services, including commercial or hosted services, provided you comply with the license.

You may **not**:

- Claim that you created the original ABS project.
- Present your project or service as the official ABS service.
- Use ABS branding in a way that implies endorsement or official affiliation with AzureMC-projects.
- Market your service as an official ABS service without permission.

You may describe your project as **using ABS** or **being based on ABS** when that is accurate.

For the full branding rules, see [TRADEMARKS.md](TRADEMARKS.md).

---

## License

ABS is licensed under the [Apache License 2.0](LICENSE).

Copyright © 2026 AzureMC-projects.

---

## Disclaimer

ABS is provided as-is. You are responsible for ensuring that your use of ABS complies with the rules of the Minecraft server, hosting provider, and any other services you use.

Only use ABS on servers that permit automated bots.

