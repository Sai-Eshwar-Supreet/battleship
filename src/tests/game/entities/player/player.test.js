import { eventBus } from "../../../../core/events/event-bus.js";
import { Vector2Int } from "../../../../core/math/vector2int.js";
import { Player } from "../../../../game/entities/player/player.js";
import humanInputStrategyFactory from "../../../../game/entities/player/strategies/human-input-strategy.js";

describe('Player: creation', () => {

  let humanInputStrategy;

  beforeEach(() => humanInputStrategy = humanInputStrategyFactory?.())

  test('should throw when player name is not a string', () => {
    expect(() => new Player(undefined, Player.type.human, humanInputStrategy)).toThrow(TypeError);
    expect(() => new Player(null, Player.type.human, humanInputStrategy)).toThrow(TypeError);
    expect(() => new Player({}, Player.type.human, humanInputStrategy)).toThrow(TypeError);
    expect(() => new Player([], Player.type.human, humanInputStrategy)).toThrow(TypeError);
  });
  
  test('should throw when player type is not a valid enum', () => {
    expect(() => new Player("Human", undefined, humanInputStrategy)).toThrow(Error);
    expect(() => new Player("Human", null, humanInputStrategy)).toThrow(Error);
    expect(() => new Player("Human", {}, humanInputStrategy)).toThrow(Error);
    expect(() => new Player("Human", [], humanInputStrategy)).toThrow(Error);
  });

  test('should throw when player\'s attack strategy is invalid', () => {
    expect(() => new Player("Human", Player.type.human, undefined)).toThrow(TypeError);
    expect(() => new Player("Human", Player.type.human, [])).toThrow(TypeError);
    expect(() => new Player("Human", Player.type.human, {})).toThrow(TypeError);
    expect(() => new Player("Human", Player.type.human, {requestMove: 123})).toThrow(TypeError);
    expect(() => new Player("Human", Player.type.human, {requestMove: () => {}})).toThrow(TypeError);
    expect(() => new Player("Human", Player.type.human, {requestMove: undefined, onAttackResult: () => {}})).toThrow(TypeError);
  });  
});

describe('Player: request move (requestMove)', () => {

  let humanInputStrategy;

  beforeEach(() => humanInputStrategy = humanInputStrategyFactory?.())
  afterEach(() => eventBus.clear());

  test('should return the position on player input', async () => {
    const player = new Player('Human', Player.type.human, humanInputStrategy);
    
    const promise  = player.requestMove();
    
    const expected = Vector2Int.one;
    eventBus.emit('HUMAN_ATTACK_INPUT', expected);

    const position = await promise;    

    expect(position.equals(expected)).toBe(true);
});
});
