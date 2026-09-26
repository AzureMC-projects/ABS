# Docker Deployment

ABS includes a production-ready Dockerfile for Node.js 20.

## Build

```bash
docker build -t abs-minecraft-bot .
```

## Run

Provide the required environment variables when starting the container:

```bash
docker run --rm \\
  -e MC_HOST=your-paper-server.example.com \\
  -e MC_PORT=25565 \\
  -e MC_USERNAME=ABS-Bot \\
  -e MC_AUTH=offline \\
  -p 3000:3000 \\
  abs-minecraft-bot
```

The HTTP status endpoints are available on port 3000 by default.
