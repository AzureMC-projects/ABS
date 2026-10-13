const test = require("node:test");
const assert = require("node:assert/strict");
const { createConfig, validateConfig } = require("../src/config");

test("uses ABS defaults", () => {
  const config = createConfig({
    MC_HOST: "example.com",
    MC_USERNAME: "ABS-Bot"
  });

  assert.equal(config.port, 25565);
  assert.equal(config.auth, "offline");
  assert.equal(config.reconnectMs, 5000);
  assert.equal(config.walkIntervalMs, 1000);
  assert.equal(config.reconnectMaxMs, 60000);
  assert.equal(config.reconnectMultiplier, 2);
  assert.equal(config.reconnectJitter, 0.2);
  assert.equal(config.movementMode, "forward");
  assert.equal(config.jumpChance, 0.12);
});

test("accepts custom configuration", () => {
  const config = createConfig({
    MC_HOST: "example.com",
    MC_PORT: "25566",
    MC_USERNAME: "TestBot",
    MC_AUTH: "microsoft",
    MC_VERSION: "1.21.8",
    RECONNECT_MS: "7500",
    WALK_INTERVAL_MS: "1500",
    RECONNECT_MAX_MS: "45000",
    RECONNECT_MULTIPLIER: "1.5",
    RECONNECT_JITTER: "0.1",
    MOVEMENT_MODE: "random",
    JUMP_CHANCE: "0.25"
  });

  assert.equal(config.port, 25566);
  assert.equal(config.username, "TestBot");
  assert.equal(config.auth, "microsoft");
  assert.equal(config.version, "1.21.8");
  assert.equal(config.reconnectMs, 7500);
  assert.equal(config.walkIntervalMs, 1500);
  assert.equal(config.reconnectMaxMs, 45000);
  assert.equal(config.reconnectMultiplier, 1.5);
  assert.equal(config.reconnectJitter, 0.1);
  assert.equal(config.movementMode, "random");
  assert.equal(config.jumpChance, 0.25);
});

test("rejects missing required settings", () => {
  const result = validateConfig(createConfig({}));
  assert.equal(result.valid, false);
  assert.match(result.error, /MC_HOST/);
  assert.match(result.error, /MC_USERNAME/);
});

test("rejects invalid numeric settings", () => {
  const result = validateConfig(createConfig({
    MC_HOST: "example.com",
    MC_USERNAME: "ABS-Bot",
    MC_PORT: "0"
  }));

  assert.equal(result.valid, false);
  assert.match(result.error, /MC_PORT/);
});

test("rejects invalid movement mode and probability values", () => {
  const base = { MC_HOST: "example.com", MC_USERNAME: "ABS-Bot" };
  assert.match(
    validateConfig(createConfig({ ...base, MOVEMENT_MODE: "teleport" })).error,
    /MOVEMENT_MODE/
  );
  assert.match(
    validateConfig(createConfig({ ...base, JUMP_CHANCE: "2" })).error,
    /JUMP_CHANCE/
  );
  assert.match(
    validateConfig(createConfig({ ...base, RECONNECT_JITTER: "-0.1" })).error,
    /RECONNECT_JITTER/
  );
});

test("allows a random movement mode regardless of case", () => {
  assert.equal(createConfig({ MOVEMENT_MODE: "RANDOM" }).movementMode, "random");
});
