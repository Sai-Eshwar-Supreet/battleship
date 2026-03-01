import { Vector2Int } from "../../../../core/math/vector2int.js";
import createHuntTargetStrategy from "../../../../game/entities/player/strategies/hunt-target-strategy.js";
import { Cell } from "../../../../game/entities/cell.js";
import { DIFFICULTY } from "../../../../game/config/difficulty-config.js";

function createStrategyHelper(overrides = {}) {
  return createHuntTargetStrategy({
    width: 4,
    height: 4,
    difficultyConfig: DIFFICULTY.HARD,
    seed: 42,
    ...overrides,
  });
}

describe("HuntTargetStrategy: construction", () => {
  test("throws for invalid board size", () => {
    expect(() =>
      createHuntTargetStrategy({ width: 0, height: 4 })
    ).toThrow(TypeError);

    expect(() =>
      createHuntTargetStrategy({ width: 4, height: -1 })
    ).toThrow(TypeError);
  });

  test("creates strategy with valid config", () => {
    const strategy = createStrategyHelper();
    expect(strategy).toHaveProperty("requestMove");
    expect(strategy).toHaveProperty("onAttackResult");
  });
});

describe("HuntTargetStrategy: requestMove", () => {

    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

  test("returns a Vector2Int within bounds", async () => {
    const strategy = createStrategyHelper();

    const promise = strategy.requestMove();
    jest.runAllTimers();

    const move = await promise;

    expect(move).toBeInstanceOf(Vector2Int);
    expect(move.x).toBeGreaterThanOrEqual(0);
    expect(move.y).toBeGreaterThanOrEqual(0);
    expect(move.x).toBeLessThan(4);
    expect(move.y).toBeLessThan(4);
  });

  test("never returns the same move twice", async () => {
    const strategy = createStrategyHelper();
    const seen = new Set();

    for (let i = 0; i < 16; i++) {
      const promise = strategy.requestMove();
      jest.runAllTimers();

      const move = await promise;
      const key = `${move.x},${move.y}`;

      expect(seen.has(key)).toBe(false);
      seen.add(key);

      strategy.onAttackResult(move, Cell.cellFlag.miss);
    }
  });
});

describe("HuntTargetStrategy: onAttackResult validation", () => {

    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

  test("throws for invalid move", () => {
    const strategy = createStrategyHelper();

    expect(() =>
      strategy.onAttackResult({}, Cell.cellFlag.hit)
    ).toThrow(TypeError);
  });

  test("throws for invalid result", () => {
    const strategy = createStrategyHelper();
    const move = new Vector2Int(0, 0);

    expect(() =>
      strategy.onAttackResult(move, "boom")
    ).toThrow(Error);
  });
});

describe('HuntTargetStrategy: onAttackResult feedback tests', () => {

    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

  test("after a hit, strategy targets neighbors", async () => {
    const strategy = createStrategyHelper();
    const hit = new Vector2Int(1, 1);

    strategy.onAttackResult(hit, Cell.cellFlag.hit);

    const promise = strategy.requestMove();
    jest.runAllTimers();

    const next = await promise;

    const isNeighbor =
        Math.abs(next.x - 1) + Math.abs(next.y - 1) === 1;

    expect(isNeighbor).toBe(true);
  });

  test("locks direction after second adjacent hit", async () => {
    const strategy = createStrategyHelper();

    const first = new Vector2Int(1, 1);
    const second = new Vector2Int(2, 1);

    strategy.onAttackResult(first, Cell.cellFlag.hit);
    strategy.onAttackResult(second, Cell.cellFlag.hit);

    const promise = strategy.requestMove();
    jest.runAllTimers();

    const next = await promise;

    // must be on same line
    expect(next.y).toBe(1);
  });

  test('should reset targeting after exceeding miss tolerance', async () => {
    
    const strategy = createStrategyHelper({
        difficultyConfig: {
            ...DIFFICULTY.NORMAL,
            memory: { rememberShots: true, maxMissTolerance: 1 }
        }
    });

    const requestMove = async () => {
        const promise = strategy.requestMove();
        jest.runAllTimers();

        return promise;
    }

    const anchor = new Vector2Int(1,1);
    strategy.onAttackResult(anchor, Cell.cellFlag.hit);

    const miss1 = await requestMove();
    strategy.onAttackResult(miss1, Cell.cellFlag.miss);

    const miss2 = await requestMove();
    strategy.onAttackResult(miss2, Cell.cellFlag.miss);

    const next =  await requestMove();

    const isNeighbor = Math.abs(next.x - anchor.x) + Math.abs(next.y - anchor.y) === 1;

    expect(isNeighbor).toBe(false);
  });
  
});
