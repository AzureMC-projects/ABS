const path = require("node:path");

function loadPlugins(names = [], report = () => {}) {
  const plugins = [];
  for (const name of names) {
    // Names are restricted to simple identifiers; plugins must live in this directory.
    if (!/^[a-z][a-z0-9-]{0,39}$/.test(name)) {
      report("plugin_rejected", { name, reason: "invalid_name" });
      continue;
    }

    try {
      const pluginPath = path.join(__dirname, "plugins", name);
      const plugin = require(pluginPath);
      if (
        !plugin ||
        typeof plugin !== "object" ||
        (plugin.onEvent !== undefined && typeof plugin.onEvent !== "function")
      ) {
        report("plugin_rejected", { name, reason: "invalid_interface" });
        continue;
      }
      plugins.push({ ...plugin, name: plugin.name || name });
      report("plugin_loaded", { name });
    } catch (error) {
      report("plugin_load_failed", { name, message: error.message });
    }
  }
  return plugins;
}

module.exports = { loadPlugins };
