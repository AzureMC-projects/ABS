const test = require("node:test");
const assert = require("node:assert/strict");
const { loadPlugins } = require("../src/plugins");

test("ignores invalid plugin names without loading paths", () => {
  const events = [];
  const plugins = loadPlugins(["../config", "UPPERCASE"], (event) => events.push(event));
  assert.deepEqual(plugins, []);
  assert.equal(events.filter((event) => event === "plugin_rejected").length, 2);
});

test("accepts an empty plugin list", () => {
  assert.deepEqual(loadPlugins([]), []);
});
