import { Vector2Int } from '../../../core/math/vector2int.js';
import { GameBoard } from '../../../game/entities/gameboard.js';

describe('Chain building', () => {
  let board = new GameBoard();

  test.each(['0,0', [0, 0]])('Throws for invalid origin %p', (origin) => {
    expect(() => board.buildChain(origin, Vector2Int.right, 5)).toThrow(
      'Expected origin of type Vector2Int'
    );
  });

  test.each(['0,0', [0, 0]])('Throws for invalid direction %p', (direction) => {
    expect(() => board.buildChain(Vector2Int.origin, direction, 5)).toThrow(
      'Expected direction of type Vector2Int'
    );
  });

  test.each([Vector2Int.one, Vector2Int.right.scale(2)])(
    'Throws for non cardinal direction %s',
    (direction) => {
      expect(() => board.buildChain(Vector2Int.origin, direction, 5)).toThrow(
        'Direction must be cardinal (up, down, left, right)'
      );
    }
  );

  test.each([0, -1, Infinity, NaN, 1.5, '4'])('Throws for invalid length %p', (length) => {
    expect(() => board.buildChain(Vector2Int.origin, Vector2Int.right, length)).toThrow(
      'Expected length to be a positive integer'
    );
  });

  test.each([
    [
      '(0,0) -> right x3',
      Vector2Int.origin,
      Vector2Int.right,
      3,
      [
        [0, 0],
        [1, 0],
        [2, 0],
      ],
    ],
    [
      '(1,1) -> up x4',
      Vector2Int.one,
      Vector2Int.up,
      4,
      [
        [1, 1],
        [1, 0],
        [1, -1],
        [1, -2],
      ],
    ],
  ])('Build chain: %s', (_, origin, direction, length, expectedResult) => {
    const chain = board.buildChain(origin, direction, length).map((point) => point.toArray());

    expect(chain).toEqual(expectedResult);
  });
});
