const express = require("express");
const crypto = require("node:crypto");
const mineflayer = require("mineflayer");
const { createConfig, validateConfig } = require("./config");
const { calculateReconnectDelay, chooseMovement } = require("./reliability");
const { loadPlugins } = require("./plugins");
const { createRemoteConfigStore, validateRemoteConfig } = require("./remote-config");

const app = express();
app.use(express.json({ limit: "16kb" }));
const PORT = Number(process.env.PORT || 3000);

let bot = null;
let reconnectTimer = null;
let walkTimer = null;
let connected = false;
let stopping = false;
let reconnectCount = 0;
let consecutiveFailures = 0;
let lastConnectedAt = null;
let lastEvent = "starting";
const startedAt = Date.now();

const config = createConfig();
const remoteConfigStore = createRemoteConfigStore();
const controlToken = process.env.ABS_CONTROL_TOKEN || "";
const allowedControlOrigin = process.env.ABS_CONTROL_ORIGIN || "https://azuremc-projects.github.io";
const plugins = loadPlugins(config.pluginNames, (event, details = {}) => {
  console.log("[ABS plugin]", JSON.stringify({ event, ...details }));
});

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
  for (const plugin of plugins) {
    try {
      plugin.onEvent?.({ event, level, details, timestamp: entry.timestamp });
    } catch (error) {
      console.error("[ABS] plugin_event_failed", JSON.stringify({
        plugin: plugin.name || "unknown",
        message: error.message
      }));
    }
  }
}


function safeTokenEquals(candidate, expected) {
  if (typeof candidate !== "string" || !expected) return false;
  const left = Buffer.from(candidate);
  const right = Buffer.from(expected);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

function controlCors(req, res, next) {
  const origin = req.get("Origin");
  if (origin && origin !== allowedControlOrigin) {
    return res.status(403).json({ error: "Origin is not allowed." });
  }
  if (origin) {
    res.set("Access-Control-Allow-Origin", allowedControlOrigin);
    res.set("Vary", "Origin");
    res.set("Access-Control-Allow-Headers", "Authorization, Content-Type");
    res.set("Access-Control-Allow-Methods", "GET, PUT, OPTIONS");
  }
  if (req.method === "OPTIONS") return res.status(204).end();
  next();
}

function requireControlToken(req, res, next) {
  if (controlToken.length < 32) {
    return res.status(503).json({ error: "Remote configuration is disabled. Configure ABS_CONTROL_TOKEN with at least 32 characters." });
  }
  const authorization = req.get("Authorization") || "";
  const match = authorization.match(/^Bearer (.+)$/i);
  if (!match || !safeTokenEquals(match[1], controlToken)) {
    return res.status(401).json({ error: "A valid Bearer token is required." });
  }
  next();
}

function applyRemoteBotSettings(remoteConfig) {
  config.movementMode = remoteConfig.bot.movementMode;
  config.jumpChance = remoteConfig.bot.jumpChance;
  config.walkIntervalMs = remoteConfig.bot.walkIntervalMs;
  if (connected && bot?.entity) startWalking();
}

app.options("/api/v1/config", controlCors);
app.get("/api/v1/config", controlCors, requireControlToken, (_req, res) => {
  res.set("Cache-Control", "no-store");
  res.json(remoteConfigStore.get());
});

app.put("/api/v1/config", controlCors, requireControlToken, (req, res) => {
  const candidate = req.body;
  const validation = validateRemoteConfig(candidate);
  if (!validation.valid) return res.status(400).json({ error: validation.error });

  const result = remoteConfigStore.update(candidate);
  if (!result.valid) return res.status(400).json({ error: result.error });
  applyRemoteBotSettings(result.config);
  log("info", "remote_config_updated", {
    revision: result.config.revision,
    movementMode: result.config.bot.movementMode
  });
  res.set("Cache-Control", "no-store");
  res.json(result.config);
});

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
    lastEvent,
    remoteConfigEnabled: controlToken.length >= 32
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
  if (controlToken.length < 32) {
    log("warn", "remote_config_disabled", { reason: "ABS_CONTROL_TOKEN must contain at least 32 characters" });
  }
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

    const movement = chooseMovement(config, Math.random);
    for (const control of ["forward", "back", "left", "right", "sprint"]) {
      bot.setControlState(control, movement[control] === true);
    }

    if (movement.jump) {
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
  consecutiveFailures += 1;
  const delayMs = calculateReconnectDelay(config, consecutiveFailures, Math.random);

  log("warn", "reconnect_scheduled", {
    reason: reason || "unknown",
    delayMs,
    reconnectCount,
    consecutiveFailures
  });

  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    connect();
  }, delayMs);
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
    consecutiveFailures = 0;
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
    consecutiveFailures = 0;
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

if (remoteConfigStore.get().updatedAt) {
  applyRemoteBotSettings(remoteConfigStore.get());
}

const validation = validateConfig(config);

if (!validation.valid) {
  console.error(`[ABS] ${validation.error}`);
  process.exit(1);
}

connect();
