const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { DEFAULT_REMOTE_CONFIG, validateRemoteConfig, createRemoteConfigStore } = require("../src/remote-config");

function validConfig() {
  return structuredClone(DEFAULT_REMOTE_CONFIG);
}

test("accepts default remote config", () => {
  assert.deepEqual(validateRemoteConfig(validConfig()), { valid: true });
});


test("accepts a full 64-character Minecraft texture hash", () => {
  const config = validConfig();
  config.skin.enabled = true;
  config.skin.textureUrl = "https://textures.minecraft.net/texture/" + "a".repeat(64);
  assert.deepEqual(validateRemoteConfig(config), { valid: true });
});

test("rejects shortened Minecraft texture hashes", () => {
  const config = validConfig();
  config.skin.textureUrl = "https://textures.minecraft.net/texture/abcdef012345";
  assert.match(validateRemoteConfig(config).error, /texture URL/);
});

test("rejects non-HTTPS and non-Minecraft texture URLs", () => {
  const config = validConfig();
  config.skin.textureUrl = "http://example.com/skin.png";
  assert.equal(validateRemoteConfig(config).valid, false);
});

test("requires a texture URL for an enabled skin", () => {
  const config = validConfig();
  config.skin.enabled = true;
  assert.match(validateRemoteConfig(config).error, /texture URL is required/);
});

test("rejects invalid movement settings", () => {
  const config = validConfig();
  config.bot.movementMode = "fly";
  assert.match(validateRemoteConfig(config).error, /movementMode/);
});

test("persists validated updates and increments revisions", () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "abs-config-"));
  const file = path.join(directory, "remote.json");
  try {
    const store = createRemoteConfigStore(file);
    const result = store.update({
      skin: { enabled: false, username: "Test_Bot", textureUrl: "", model: "slim" },
      bot: { movementMode: "idle", jumpChance: 0, walkIntervalMs: 1500 }
    });
    assert.equal(result.valid, true);
    assert.equal(result.config.revision, 2);
    assert.equal(createRemoteConfigStore(file).get().bot.movementMode, "idle");
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
