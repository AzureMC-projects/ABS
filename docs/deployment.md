# Deployment

## Render

ABS is configured as a Render Web Service through [render.yaml](../render.yaml).

The service uses:

- Runtime: Node.js
- Build command: `npm install`
- Start command: `npm start`
- Required environment variables: `MC_HOST` and `MC_USERNAME`

Review the Render service logs after deployment. The root endpoint reports connection status, and `/health` provides a simple health response.

## Important limitation

ABS is designed to keep reconnecting while the process is running. It cannot guarantee that a Minecraft connection stays available if the hosting platform stops the service or the Minecraft server rejects the connection.
