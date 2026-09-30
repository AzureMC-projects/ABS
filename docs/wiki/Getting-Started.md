# Getting Started

## Requirements

- Node.js 20 or newer for local development
- A Minecraft server reachable by the bot
- The bot's Minecraft username
- Paper 26.3 for the primary compatibility target

## Local setup

```bash
npm install
npm start
```

Use `.env.example` as the starting point for local configuration.

## Required settings

```env
MC_HOST=your-server.example.com
MC_PORT=25565
MC_USERNAME=ABS-Bot
MC_AUTH=offline
```

## Verify the service

The service exposes:

- `/` — service information
- `/health` — health check
- `/api/status` — bot runtime status

## Next steps

- Configure the [bot](Configuration.md)
- Deploy with [Render](Deployment.md)
- Configure [custom skins](Custom-Skins.md)
