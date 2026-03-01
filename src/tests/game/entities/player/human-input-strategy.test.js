import { eventBus } from "../../../../core/events/event-bus.js";
import { Vector2Int } from "../../../../core/math/vector2int.js";
import humanInputStrategyFactory from "../../../../game/entities/player/strategies/human-input-strategy.js";

describe('Player: request move (requestMove)', () => {

  let humanInputStrategy;

  beforeEach(() => humanInputStrategy = humanInputStrategyFactory?.())
  afterEach(() => eventBus.clear());

  test('should return the position on player input', async () => {
    const promise  = humanInputStrategy.requestMove();
    
    const expected = Vector2Int.one;
    eventBus.emit('HUMAN_ATTACK_INPUT', expected);

    const position = await promise;    

    expect(position.equals(expected)).toBe(true);
  });
});