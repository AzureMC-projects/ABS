# Optional ABS runtime plugins

ABS can load optional local extension modules with the `ABS_PLUGINS` environment variable.

Example:

```text
ABS_PLUGINS=example-audit
```

Place the module at `src/plugins/example-audit.js`. Plugin names must match
`^[a-z][a-z0-9-]{0,39}$`; absolute paths and path separators are not accepted.

A plugin may export an optional `onEvent(event)` function:

```js
module.exports = {
  name: "example-audit",
  onEvent({ event, level, details, timestamp }) {
    // Keep handlers fast and non-blocking.
  }
};
```

The runtime isolates synchronous handler exceptions so a plugin cannot crash the
bot's event logger. Plugins execute with the same process permissions as ABS:
only load code you trust, and never install third-party modules from untrusted
sources. This is an early, intentionally small hook API; it is not a stable
third-party compatibility guarantee yet.
