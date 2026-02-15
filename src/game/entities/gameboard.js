import { Vector2Int } from '../../core/math/vector2int';

class GameBoard {
  buildChain(origin, direction, length) {
    if (!Vector2Int.isValid(origin)) {
      throw new TypeError('Expected origin of type Vector2Int');
    }
    if (!Vector2Int.isValid(direction)) {
      throw new TypeError('Expected direction of type Vector2Int');
    }

    let isCardinal = Math.abs(direction.x) + Math.abs(direction.y) === 1;

    if (!isCardinal) {
      throw new Error('Direction must be cardinal (up, down, left, right)');
    }

    if (!Number.isInteger(length) || length <= 0) {
      throw new TypeError('Expected length to be a positive integer');
    }

    const chain = [origin];

    for (let i = 1; i < length; i++) {
      chain.push(chain[i - 1].add(direction));
    }

    return chain;
  }
}

export { GameBoard };
