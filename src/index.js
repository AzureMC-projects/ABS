const express = require("express");
const mineflayer = require("mineflayer");
const { createConfig, validateConfig } = require("./config");

const app = express();
const PORT = Number(process.env.PORT || 3000);

let bot = null;
let reconnectTimer = null;
let walkTimer = null;
let connected = false;
let stopping = false;
let reconnectCount = 0;
let lastConnectedAt = null;
let lastEvent = "starting";
const startedAt = Date.now();

const config = createConfig();

function log(level, event, details = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    event,
    ...details
  };

  if (level === "error") {
    console.error("[ABS]", JSON.stringify(entry));
  } else {
    console.log("[ABS]", JSON.stringify(entry));
  }

  lastEvent = event;
}

function uptimeSeconds() {
  return Math.floor((Date.now() - startedAt) / 1000);
}

function getStatus() {
  return {
    service: "ABS Minecraft Bot",
    name: "Azures Bot Service",
    status: connected ? "connected" : stopping ? "stopping" : "connecting",
    minecraftServer: config.host || "not configured",
    minecraftPort: config.port,
    bot: bot?.username || config.username || null,
    uptimeSeconds: uptimeSeconds(),
    reconnects: reconnectCount,
    lastConnectedAt,
    lastEvent
  };
}

app.get("/", (_req, res) => {
  res.type("html").send(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>ABS Status</title>
  <style>
    :root { color-scheme: dark; font-family: system-ui, sans-serif; }
    body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #0b1220; color: #e8eefc; }
    main { width: min(680px, calc(100% - 32px)); padding: 28px; border: 1px solid #263653; border-radius: 18px; background: #111b2d; box-shadow: 0 18px 50px #0006; }
    h1 { margin: 0 0 4px; } p { color: #aebbd2; }
    .status { display: inline-block; padding: 7px 11px; border-radius: 999px; background: #19345a; text-transform: capitalize; }
    dl { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 24px; }
    div { padding: 14px; border-radius: 12px; background: #0d1728; }
    dt { color: #8fa2c2; font-size: 13px; } dd { margin: 5px 0 0; font-weight: 700; }
    a { color: #79b7ff; }
  </style>
</head>
<body>
  <main>
    <h1>ABS</h1>
    <p>Azures Bot Service</p>
    <span id="status" class="status">loading</span>
    <dl>
      <div><dt>Bot</dt><dd id="bot">—</dd></div>
      <div><dt>Server</dt><dd id="server">—</dd></div>
      <div><dt>Uptime</dt><dd id="uptime">—</dd></div>
      <div><dt>Reconnects</dt><dd id="reconnects">—</dd></div>
      <div><dt>Last connected</dt><dd id="connectedAt">—</dd></div>
      <div><dt>Last event</dt><dd id="event">—</dd></div>
    </dl>
    <p><a href="/health">Health</a> · <a href="/api/status">JSON status</a></p>
  </main>
  <script>
    async function refresh() {
      try {
        const data = await fetch("/api/status", { cache: "no-store" }).then((r) => r.json());
        document.querySelector("#status").textContent = data.status;
        document.querySelector("#bot").textContent = data.bot || "—";
        document.querySelector("#server").textContent = data.minecraftServer + ":" + data.minecraftPort;
        document.querySelector("#uptime").textContent = data.uptimeSeconds + "s";
        document.querySelector("#reconnects").textContent = data.reconnects;
        document.querySelector("#connectedAt").textContent = data.lastConnectedAt || "—";
        document.querySelector("#event").textContent = data.lastEvent || "—";
      } catch (error) {
        document.querySelector("#status").textContent = "unavailable";
      }
    }
    refresh();
    setInterval(refresh, 5000);
  </script>
</body>
</html>`);
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
  log("info", "web_service_started", { port: PORT });
});

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

  log("warn", "reconnect_scheduled", {
    reason: reason || "unknown",
    delayMs: config.reconnectMs,
    reconnectCount
  });

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

  log("info", "minecraft_connecting", {
    host: config.host,
    port: config.port,
    username: config.username
  });

  bot = mineflayer.createBot({
    host: config.host,
    port: config.port,
    username: config.username,
    auth: config.auth,
    version: config.version || undefined
  });

  bot.once("spawn", () => {
    connected = true;
    lastConnectedAt = new Date().toISOString();
    log("info", "minecraft_spawned", { username: bot.username });
    startWalking();
  });

  bot.on("death", () => {
    connected = false;
    clearMovement();
    log("warn", "bot_died");

    setTimeout(() => {
      if (!stopping && bot?.health === 0) {
        try {
          bot.respawn();
          log("info", "respawn_requested");
        } catch (err) {
          log("error", "respawn_failed", { message: err.message });
        }
      }
    }, 1000);
  });

  bot.on("respawn", () => {
    if (stopping) return;

    connected = true;
    lastConnectedAt = new Date().toISOString();
    log("info", "bot_respawned");
    startWalking();
  });

  bot.on("kicked", (reason) => {
    log("warn", "bot_kicked", { reason });
    scheduleReconnect("kicked");
  });

  bot.on("error", (err) => {
    log("error", "minecraft_error", { message: err.message });
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

  log("info", "service_stopping", { signal });

  try {
    bot?.quit("service stopping");
  } catch (_) {}

  process.exit(0);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

const validation = validateConfig(config);

if (!validation.valid) {
  console.error(`[ABS] ${validation.error}`);
  process.exit(1);
}

connect();
