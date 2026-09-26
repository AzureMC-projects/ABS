const express = require("express");
const mineflayer = require("mineflayer");

const app = express();
const PORT = Number(process.env.PORT || 3000);

let bot = null;
let reconnectTimer = null;
let walkTimer = null;
let connected = false;
let stopping = false;

const config = {
  host: process.env.MC_HOST,
  port: Number(process.env.MC_PORT || 25565),
  username: process.env.MC_USERNAME,
  auth: process.env.MC_AUTH || "offline",
  version: process.env.MC_VERSION || false,
  reconnectMs: Number(process.env.RECONNECT_MS || 5000),
  walkIntervalMs: Number(process.env.WALK_INTERVAL_MS || 1000)
};

app.get("/", (_req, res) => {
  res.json({
    service: "ABS Minecraft Bot",
    status: connected ? "connected" : "connecting",
    minecraftServer: config.host || "not configured"
  });
});

app.get("/health", (_req, res) => {
  res.status(stopping ? 503 : 200).json({
    ok: !stopping,
    connected,
    bot: bot?.username || null
  });
});

app.listen(PORT, () => {
  console.log(`ABS web service listening on port ${PORT}`);
});

function validateConfig() {
  const missing = ["MC_HOST", "MC_USERNAME"].filter((key) => !process.env[key]);
  if (missing.length) {
    console.error(`Missing environment variables: ${missing.join(", ")}`);
    process.exit(1);
  }
}

function clearMovement() {
  if (walkTimer) {
    clearInterval(walkTimer);
    walkTimer = null;
  }
  if (bot) {
    for (const control of ["forward", "back", "left", "right", "jump", "sprint"]) {
      bot.setControlState(control, false);
    }
  }
}

function startWalking() {
  clearMovement();
  walkTimer = setInterval(() => {
    if (!bot || !bot.entity || !connected) return;

    // Keep moving forward. Jump occasionally so the bot can get past
    // small obstacles instead of remaining completely stationary.
    bot.setControlState("forward", true);

    if (Math.random() < 0.12) {
      bot.setControlState("jump", true);
      setTimeout(() => bot?.setControlState("jump", false), 250);
    }
  }, config.walkIntervalMs);
}

function scheduleReconnect(reason) {
  if (stopping || reconnectTimer) return;

  connected = false;
  clearMovement();

  console.log(`Disconnected: ${reason || "unknown reason"}`);
  console.log(`Reconnecting in ${config.reconnectMs} ms...`);

  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    connect();
  }, config.reconnectMs);
}

function connect() {
  if (stopping) return;

  clearMovement();
  connected = false;

  if (bot) {
    try { bot.quit("reconnecting"); } catch (_) {}
    bot = null;
  }

  console.log(`Connecting to ${config.host}:${config.port} as ${config.username}...`);

  bot = mineflayer.createBot({
    host: config.host,
    port: config.port,
    username: config.username,
    auth: config.auth,
    version: config.version || undefined
  });

  bot.once("spawn", () => {
    connected = true;
    console.log("Minecraft bot spawned.");
    startWalking();
  });

  bot.on("death", () => {
    console.log("Bot died; waiting for respawn...");
  });

  bot.on("respawn", () => {
    console.log("Bot respawned.");
    startWalking();
  });

  bot.on("kicked", (reason) => {
    console.log("Bot was kicked:", reason);
    scheduleReconnect("kicked");
  });

  bot.on("error", (err) => {
    console.error("Minecraft error:", err.message);
    scheduleReconnect("error");
  });

  bot.on("end", (reason) => {
    scheduleReconnect(reason);
  });
}

process.on("SIGTERM", () => {
  stopping = true;
  clearMovement();
  if (reconnectTimer) clearTimeout(reconnectTimer);
  try { bot?.quit("service stopping"); } catch (_) {}
  process.exit(0);
});

process.on("SIGINT", () => {
  stopping = true;
  clearMovement();
  if (reconnectTimer) clearTimeout(reconnectTimer);
  try { bot?.quit("service stopping"); } catch (_) {}
  process.exit(0);
});

validateConfig();
connect();
