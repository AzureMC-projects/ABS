function calculateReconnectDelay(config, attempt, random = Math.random) {
  const exponent = Math.max(0, Math.min(30, attempt - 1));
  const exponential = Math.min(
    config.reconnectMaxMs,
    config.reconnectMs * Math.pow(config.reconnectMultiplier, exponent)
  );
  const jitter = config.reconnectJitter || 0;
  const factor = 1 - jitter + 2 * jitter * random();
  return Math.max(1, Math.min(config.reconnectMaxMs, Math.round(exponential * factor)));
}

function chooseMovement(config, random = Math.random) {
  if (config.movementMode === "idle") return {};
  if (config.movementMode === "forward") {
    return { forward: true, jump: random() < config.jumpChance };
  }

  const directions = ["forward", "back", "left", "right"];
  const direction = directions[Math.floor(random() * directions.length)];
  return {
    [direction]: true,
    sprint: random() < 0.1,
    jump: random() < config.jumpChance
  };
}

module.exports = { calculateReconnectDelay, chooseMovement };
