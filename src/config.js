function createConfig(env = process.env) {
  return {
    host: env.MC_HOST,
    port: Number(env.MC_PORT || 25565),
    username: env.MC_USERNAME,
    auth: env.MC_AUTH || "offline",
    version: env.MC_VERSION || false,
    reconnectMs: Number(env.RECONNECT_MS || 5000),
    walkIntervalMs: Number(env.WALK_INTERVAL_MS || 1000)
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
    ["WALK_INTERVAL_MS", config.walkIntervalMs]
  ];

  for (const [name, value] of numericConfig) {
    if (!Number.isFinite(value) || value <= 0) {
      return { valid: false, error: `${name} must be a positive number.` };
    }
  }

  return { valid: true };
}

module.exports = { createConfig, validateConfig };
