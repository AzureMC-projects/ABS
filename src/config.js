function createConfig(env = process.env) {
  return {
    host: env.MC_HOST,
    port: Number(env.MC_PORT || 25565),
    username: env.MC_USERNAME,
    auth: env.MC_AUTH || "offline",
    version: env.MC_VERSION || false,
    reconnectMs: Number(env.RECONNECT_MS || 5000),
    reconnectMaxMs: Number(env.RECONNECT_MAX_MS || 60000),
    reconnectMultiplier: Number(env.RECONNECT_MULTIPLIER || 2),
    reconnectJitter: Number(env.RECONNECT_JITTER ?? 0.2),
    walkIntervalMs: Number(env.WALK_INTERVAL_MS || 1000),
    movementMode: (env.MOVEMENT_MODE || "forward").toLowerCase(),
    jumpChance: Number(env.JUMP_CHANCE ?? 0.12)
  };
}

function validateConfig(config) {
  const missing = [];
  if (!config.host) missing.push("MC_HOST");
  if (!config.username) missing.push("MC_USERNAME");

  if (missing.length) {
    return { valid: false, error: `Missing environment variables: ${missing.join(", ")}` };
  }

  const numericConfig = [
    ["MC_PORT", config.port],
    ["RECONNECT_MS", config.reconnectMs],
    ["RECONNECT_MAX_MS", config.reconnectMaxMs],
    ["RECONNECT_MULTIPLIER", config.reconnectMultiplier],
    ["WALK_INTERVAL_MS", config.walkIntervalMs]
  ];

  for (const [name, value] of numericConfig) {
    if (!Number.isFinite(value) || value <= 0) {
      return { valid: false, error: `${name} must be a positive number.` };
    }
  }

  if (!Number.isFinite(config.reconnectJitter) || config.reconnectJitter < 0 || config.reconnectJitter > 1) {
    return { valid: false, error: "RECONNECT_JITTER must be between 0 and 1." };
  }

  if (!Number.isFinite(config.jumpChance) || config.jumpChance < 0 || config.jumpChance > 1) {
    return { valid: false, error: "JUMP_CHANCE must be between 0 and 1." };
  }

  if (!["forward", "random", "idle"].includes(config.movementMode)) {
    return { valid: false, error: "MOVEMENT_MODE must be one of: forward, random, idle." };
  }

  return { valid: true };
}

module.exports = { createConfig, validateConfig };
