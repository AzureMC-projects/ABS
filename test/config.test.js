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
});

test("accepts custom configuration", () => {
  const config = createConfig({
    MC_HOST: "example.com",
    MC_PORT: "25566",
    MC_USERNAME: "TestBot",
    MC_AUTH: "microsoft",
    MC_VERSION: "1.21.8",
    RECONNECT_MS: "7500",
    WALK_INTERVAL_MS: "1500"
  });

  assert.equal(config.port, 25566);
  assert.equal(config.username, "TestBot");
  assert.equal(config.auth, "microsoft");
  assert.equal(config.version, "1.21.8");
  assert.equal(config.reconnectMs, 7500);
  assert.equal(config.walkIntervalMs, 1500);
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
