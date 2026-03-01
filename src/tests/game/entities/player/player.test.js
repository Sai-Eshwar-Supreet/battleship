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
  
  test('creates a valid player with board and strategy', () => {
  const strategy = humanInputStrategyFactory();
  const player = new Player('Human', Player.type.human, strategy);

  expect(player.name).toBe('Human');
  expect(player.type).toBe(Player.type.human);
  expect(player.board).toBeDefined();
});
});

