const test = require("node:test");
const assert = require("node:assert/strict");
const { calculateReconnectDelay, chooseMovement } = require("../src/reliability");

const config = {
  reconnectMs: 5000,
  reconnectMaxMs: 30000,
  reconnectMultiplier: 2,
  reconnectJitter: 0,
  movementMode: "forward",
  jumpChance: 0.12
};

test("reconnect delay grows exponentially and respects the cap", () => {
  assert.equal(calculateReconnectDelay(config, 1, () => 0.5), 5000);
  assert.equal(calculateReconnectDelay(config, 2, () => 0.5), 10000);
  assert.equal(calculateReconnectDelay(config, 3, () => 0.5), 20000);
  assert.equal(calculateReconnectDelay(config, 4, () => 0.5), 30000);
});

test("reconnect jitter stays inside configured bounds", () => {
  const jittered = { ...config, reconnectJitter: 0.2 };
  assert.equal(calculateReconnectDelay(jittered, 1, () => 0), 4000);
  assert.equal(calculateReconnectDelay(jittered, 1, () => 1), 6000);
});

test("forward mode always moves forward and applies jump chance", () => {
  assert.deepEqual(chooseMovement(config, () => 0.5), { forward: true, jump: false });
  assert.deepEqual(chooseMovement(config, () => 0), { forward: true, jump: true });
});

test("idle mode does not request movement", () => {
  assert.deepEqual(chooseMovement({ ...config, movementMode: "idle" }, () => 0), {});
});

test("random mode chooses one direction", () => {
  const movement = chooseMovement({ ...config, movementMode: "random" }, () => 0);
  assert.equal(movement.forward, true);
  assert.equal(movement.back, undefined);
});
