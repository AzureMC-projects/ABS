const fs = require("node:fs");
const path = require("node:path");

const DEFAULT_REMOTE_CONFIG = Object.freeze({
  revision: 1,
  updatedAt: null,
  skin: {
    enabled: false,
    username: "ABS-Bot",
    textureUrl: "",
    model: "classic"
  },
  bot: {
    movementMode: "forward",
    jumpChance: 0.12,
    walkIntervalMs: 1000
  }
});

function validateRemoteConfig(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { valid: false, error: "Configuration must be a JSON object." };
  }
  const skin = input.skin;
  const bot = input.bot;
  if (!skin || typeof skin !== "object" || Array.isArray(skin)) {
    return { valid: false, error: "skin must be an object." };
  }
  if (!bot || typeof bot !== "object" || Array.isArray(bot)) {
    return { valid: false, error: "bot must be an object." };
  }
  if (typeof skin.enabled !== "boolean") {
    return { valid: false, error: "skin.enabled must be a boolean." };
  }
  if (typeof skin.username !== "string" || !/^[A-Za-z0-9_]{1,16}$/.test(skin.username)) {
    return { valid: false, error: "skin.username must be a Minecraft username (1-16 letters, digits, or underscores)." };
  }
  if (typeof skin.textureUrl !== "string" || (skin.textureUrl && !/^https:\/\/textures\.minecraft\.net\/texture\/[a-fA-F0-9]+$/.test(skin.textureUrl))) {
    return { valid: false, error: "skin.textureUrl must be a textures.minecraft.net texture URL." };
  }
  if (skin.enabled && !skin.textureUrl) {
    return { valid: false, error: "A texture URL is required when the skin is enabled." };
  }
  if (!["classic", "slim"].includes(skin.model)) {
    return { valid: false, error: "skin.model must be classic or slim." };
  }
  if (!["forward", "random", "idle"].includes(bot.movementMode)) {
    return { valid: false, error: "bot.movementMode must be forward, random, or idle." };
  }
  if (!Number.isFinite(bot.jumpChance) || bot.jumpChance < 0 || bot.jumpChance > 1) {
    return { valid: false, error: "bot.jumpChance must be between 0 and 1." };
  }
  if (!Number.isInteger(bot.walkIntervalMs) || bot.walkIntervalMs < 100 || bot.walkIntervalMs > 60000) {
    return { valid: false, error: "bot.walkIntervalMs must be an integer between 100 and 60000." };
  }
  return { valid: true };
}

function createRemoteConfigStore(filePath = process.env.ABS_CONFIG_PATH || path.join(process.cwd(), "data", "remote-config.json")) {
  let current = structuredClone(DEFAULT_REMOTE_CONFIG);
  try {
    const loaded = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const candidate = {
      revision: Number.isInteger(loaded.revision) ? loaded.revision : 1,
      updatedAt: typeof loaded.updatedAt === "string" ? loaded.updatedAt : null,
      skin: { ...DEFAULT_REMOTE_CONFIG.skin, ...loaded.skin },
      bot: { ...DEFAULT_REMOTE_CONFIG.bot, ...loaded.bot }
    };
    if (validateRemoteConfig(candidate).valid) current = candidate;
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }

  return {
    get() {
      return structuredClone(current);
    },
    update(input) {
      const candidate = {
        revision: current.revision + 1,
        updatedAt: new Date().toISOString(),
        skin: { ...current.skin, ...input.skin },
        bot: { ...current.bot, ...input.bot }
      };
      const validation = validateRemoteConfig(candidate);
      if (!validation.valid) return { ...validation, config: null };

      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      const tempPath = filePath + ".tmp";
      fs.writeFileSync(tempPath, JSON.stringify(candidate, null, 2) + "\n", { mode: 0o600 });
      fs.renameSync(tempPath, filePath);
      current = candidate;
      return { valid: true, config: this.get() };
    }
  };
}

module.exports = { DEFAULT_REMOTE_CONFIG, validateRemoteConfig, createRemoteConfigStore };
