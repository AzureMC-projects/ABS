const express = require("express");
const mineflayer = require("mineflayer");

const app = express();
const PORT = Number(process.env.PORT || 3000);

let bot = null;
let reconnectTimer = null;
let walkTimer = null;
let connected = false;
let stopping = false;
let reconnectCount = 0;
const startedAt = Date.now();

const config = {
  host: process.env.MC_HOST,
  port: Number(process.env.MC_PORT || 25565),
  username: process.env.MC_USERNAME,
  auth: process.env.MC_AUTH || "offline",
  version: process.env.MC_VERSION || false,
  reconnectMs: Number(process.env.RECONNECT_MS || 5000),
  walkIntervalMs: Number(process.env.WALK_INTERVAL_MS || 1000)
};

function log(message, ...args) {
  const timestamp = new Date().toISOString();
  console.log(`[ABS] [${timestamp}] ${message}`, ...args);
  lastEvent = message;
}

function uptimeSeconds() {
  return Math.floor((Date.now() - startedAt) / 1000);
}

app.get("/", (_req, res) => {
  res.json({
    service: "ABS Minecraft Bot",
    name: "Azures Bot Service",
    status: connected ? "connected" : stopping ? "stopping" : "connecting",
    minecraftServer: config.host || "not configured",
    minecraftPort: config.port,
    bot: bot?.username || config.username || null,
    uptimeSeconds: uptimeSeconds(),
    reconnects: reconnectCount
  });
});

app.get("/api/status", (_req, res) => {
  res.json(getStatus());
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

  const numericConfig = [
    ["MC_PORT", config.port],
    ["RECONNECT_MS", config.reconnectMs],
    ["WALK_INTERVAL_MS", config.walkIntervalMs]
  ];

  for (const [name, value] of numericConfig) {
    if (!Number.isFinite(value) || value <= 0) {
      console.error(`${name} must be a positive number.`);
      process.exit(1);
    }
  }
}

function clearMovement() {
  if (walkTimer) {
    clearInterval(walkTimer);
    walkTimer = null;
  }

  if (bot) {
    for (const control of ["forward", "back", "left", "right", "jump", "sprint"]) {
      try {
        bot.setControlState(control, false);
      } catch (_) {}
    }
  }
}

function startWalking() {
  clearMovement();

  walkTimer = setInterval(() => {
    if (!bot || !bot.entity || !connected || stopping) return;

    bot.setControlState("forward", true);

    if (Math.random() < 0.12) {
      bot.setControlState("jump", true);
      setTimeout(() => {
        try {
          bot?.setControlState("jump", false);
        } catch (_) {}
      }, 250);
    }
  }, config.walkIntervalMs);
}

function scheduleReconnect(reason) {
  if (stopping || reconnectTimer) return;

  connected = false;
  clearMovement();
  reconnectCount += 1;

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
    try {
      bot.removeAllListeners();
      bot.quit("reconnecting");
    } catch (_) {}
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
    connected = false;
    clearMovement();
    console.log("Bot died; requesting respawn...");

    setTimeout(() => {
      if (!stopping && bot?.health === 0) {
        try {
          bot.respawn();
        } catch (err) {
          console.error("Respawn request failed:", err.message);
        }
      }
    }, 1000);
  });

  bot.on("respawn", () => {
    if (stopping) return;

    connected = true;
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
    scheduleReconnect(reason || "connection ended");
  });
}

function shutdown(signal) {
  if (stopping) return;

  stopping = true;
  connected = false;
  clearMovement();

  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }

  console.log(`Received ${signal}; shutting down ABS.`);

  try {
    bot?.quit("service stopping");
  } catch (_) {}

  process.exit(0);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

validateConfig();
connect();
