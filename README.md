# ABS

<p align="center">
  <img src="assets/abs-logo.svg" alt="ABS logo" width="180">
</p>

<p align="center"><strong>Azures Bot Service</strong></p>

<p align="center">
  A lightweight Minecraft bot for continuous operation on Render.
</p>

<p align="center">
  <a href="https://github.com/AzureMC-projects/ABS/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-Apache--2.0-blue.svg" alt="Apache 2.0"></a>
</p>

> 🔗 **Based on ABS?**  
> This project is **Azures Bot Service (ABS)** by AzureMC-projects. If you are using a fork or derivative, please keep attribution to the original project.  
> **Original repository:** https://github.com/AzureMC-projects/ABS

**ABS (Azures Bot Service)** automatically connects to a Minecraft server, reconnects after disconnects, requests respawn after death, and continuously walks while the service is running.

---

## Community

Join the ABS Discord server for support, updates, and discussion:

**Discord:** https://discord.gg/wFVYwzAEe3

---

## Features

- 🤖 Automatic Minecraft server connection
- 🔄 Automatic reconnection after disconnects
- ♻️ Automatic respawn handling
- 🚶 Continuous walking with occasional jumping
- ☁️ Designed for Render Web Services
- ❤️ Health endpoint for service monitoring
- 📊 JSON status endpoint with uptime and reconnect count
- ⚙️ Environment-variable configuration

---

## Setup

### 1. Fork this repository

If you are setting up your own copy of ABS:

1. Click **Fork** on GitHub.
2. Select your GitHub account.
3. Use your fork for the Render deployment.

If you already own the repository, you can skip this step.

### 2. One-click Render deployment

Use the repository's Render blueprint to create the service from `render.yaml`:

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/AzureMC-projects/ABS)

After opening the deployment flow, review the service settings and add the required Minecraft environment variables.

### 3. Create a Render Web Service

If you prefer manual setup, open Render and:

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

### 4. Configure environment variables

In your Render service, open **Environment Variables** and add the following:

| Variable | Required | Default | Description |
|---|:---:|---|---|
| `MC_HOST` | **Yes** | — | Minecraft server address |
| `MC_PORT` | No | `25565` | Minecraft server port |
| `MC_USERNAME` | **Yes** | — | Minecraft bot username |
| `MC_AUTH` | No | `offline` | Authentication mode |
| `MC_VERSION` | No | auto | Minecraft version |
| `RECONNECT_MS` | No | `5000` | Reconnect delay in milliseconds |
| `WALK_INTERVAL_MS` | No | `1000` | Walking interval in milliseconds |

For a basic setup:

```text
MC_HOST=your-server-ip
MC_PORT=25565
MC_USERNAME=your-bot-name
```

### 5. Deploy

Click **Create Web Service** in Render.

Render will install the dependencies and start ABS automatically.

Once the service is running, open the **Logs** section in Render to check the bot's connection status.

---

## Monitoring

ABS exposes two simple HTTP endpoints:

- `/` — live web status dashboard with connection status, server, uptime, reconnect count, and recent event.
- `/api/status` — JSON service information for integrations and monitoring.
- `/health` — lightweight health response suitable for monitoring.

Example:

```text
GET /health
```

---

## How ABS works

Once started, ABS will:

1. Validate the required configuration.
2. Connect to the configured Minecraft server.
3. Start walking after joining.
4. Request a respawn after death.
5. Reconnect if the connection is lost.
6. Continue operating while the Render service is running.

ABS cannot prevent a Minecraft server from kicking, banning, blocking, or shutting down the bot.

---

## Forks and attribution

> **Forked ABS? Keep the source visible.**
>
> This project is an original **AzureMC-projects / ABS (Azures Bot Service)** project. If you fork, mirror, or build on ABS, please keep this attribution and link to the original repository:
>
> **Original ABS repository:** https://github.com/AzureMC-projects/ABS
>
> You are welcome to customize and deploy your fork under the Apache License 2.0. Keeping this notice helps users discover the original project and understand where the code came from.

## Documentation

- [Documentation Catalog](DOCUMENTATION.md) — index of the repository's Markdown documentation
- [Customization System](docs/customization.md) — planned skin system, Paper plugin, Control Panel, and security architecture
- [Configuration](docs/configuration.md)
- [Deployment](docs/deployment.md)
- [Docker](docs/docker.md)
- [Troubleshooting](docs/troubleshooting.md)
- [Compatibility](docs/compatibility.md)
- [Contributing](CONTRIBUTING.md)
- [Security](SECURITY.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Changelog](CHANGELOG.md)
- [Roadmap](ROADMAP.md)
- [Trademark guidance](TRADEMARKS.md)

---

## Microsoft authentication

If your Minecraft server requires Microsoft authentication, set:

```text
MC_AUTH=microsoft
```

**Never put passwords, access tokens, or other private credentials in GitHub.**

---

## Development

Install dependencies and run the validation suite:

```bash
npm install
npm run check
npm test
npm run lint
npm run format:check
```

Start the service locally:

```bash
MC_HOST=your-server-ip MC_USERNAME=your-bot-name npm start
```

---

## Using ABS in your own projects

ABS is primarily developed and tested for **Paper 26.3**. Other Minecraft server software or versions may work, but are not the primary compatibility target.

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

## Compatibility

ABS is primarily developed and tested for **Paper 26.3**. See the [compatibility guide](docs/compatibility.md) for the current support target and reporting guidance.

## Local configuration

For local development, start from [`.env.example`](.env.example) and never commit real credentials.

## Docker

ABS includes a production Dockerfile. See [`docs/docker.md`](docs/docker.md) for build and run instructions.

## Roadmap

See [`ROADMAP.md`](ROADMAP.md) for planned improvements.
