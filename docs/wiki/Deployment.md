# Deployment

## Render

ABS includes a `render.yaml` blueprint for deployment.

The Render service runs:

```text
npm install
npm start
```

Configure Minecraft connection values as Render environment variables. Do not put private credentials into committed files.

## Docker

ABS includes a Node.js 20 Alpine Dockerfile.

```bash
docker build -t abs-minecraft-bot .
docker run --env-file .env -p 3000:3000 abs-minecraft-bot
```

## GitHub Pages Control Panel

The Control Panel is stored under `docs/` so it can be published with GitHub Pages branch deployment.

Expected project URL:

```text
https://azuremc-projects.github.io/ABS/
```

For Pages, use the `main` branch and `/docs` folder.

## Production notes

- Keep secrets in environment variables.
- Configure health checks where supported.
- Test server compatibility before production use.
