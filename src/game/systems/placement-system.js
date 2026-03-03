import { Vector2Int } from '../../core/math/vector2int.js';
import { RNG } from '../../core/random/rng';
import { GameBoard } from '../entities/gameboard.js';

const DIRECTIONS = Object.freeze([Vector2Int.right, Vector2Int.up]);
const PLACEMENT_STATE = Object.freeze({
  idle: 'idle',
  placing: 'placing',
  ready: 'ready',
  complete: 'complete',
});
const MAX_RANDOM_ATTEMPTS = 1000;

class PlacementSystem {
  #rng;
  #board;
  #ships;
  #state;
  #currentShipIndex;

  constructor() {
    this.reset();
  }

  startPlacement(board, ships, seed) {
    if (this.#state !== PLACEMENT_STATE.idle) {
      throw new TypeError('Placement already in progress');
    }

    if (!(board instanceof GameBoard)) {
      throw new TypeError('Expects board to be an instance of GameBoard');
    }
    if (!Array.isArray(ships) || ships.length === 0) {
      throw new TypeError('Ships must be a non-empty array');
    }

    this.#rng = new RNG(seed);
    this.#board = board;
    this.#ships = ships;
    this.#state = PLACEMENT_STATE.placing;
    this.#currentShipIndex = 0;
  }

  resetPlacement() {
    if (this.#state === PLACEMENT_STATE.idle) {
      throw new Error('No active placement session');
    }

    this.#board.reset();
    this.#currentShipIndex = 0;
    this.#state = PLACEMENT_STATE.placing;
  }

  reset() {
    this.#rng = null;
    this.#board = null;
    this.#ships = null;
    this.#state = PLACEMENT_STATE.idle;
    this.#currentShipIndex = 0;
  }

  finalizePlacement() {
    if (this.#state === PLACEMENT_STATE.ready) {
      this.#state = PLACEMENT_STATE.complete;
      return true;
    }
    return false;
  }

  getCurrentShip() {
    if (this.#state === PLACEMENT_STATE.idle || this.#currentShipIndex === this.#ships.length) {
      return null;
    }
    const ship = this.#ships[this.#currentShipIndex];
    return { id: ship.id, length: ship.length };
  }

  canPlace(position, direction) {
    return (
      this.#state === PLACEMENT_STATE.placing &&
      this.#board.canPlaceShip(position, direction, this.#ships[this.#currentShipIndex].length)
    );
  }

  placeCurrentShip(position, direction) {
    if (this.canPlace(position, direction)) {
      const ship = this.#ships[this.#currentShipIndex];
      this.#board.placeShip(ship, position, direction);
      this.#currentShipIndex++;

      if (this.getRemainingCount() === 0) {
        this.#state = PLACEMENT_STATE.ready;
      }

      return true;
    }

    return false;
  }

  autoPlaceRemaining() {
    if (this.#state !== PLACEMENT_STATE.placing) {
      return false;
    }
    while (this.#currentShipIndex < this.#ships.length) {
      let placed = false;
      let attempts = 0;
      while (!placed && attempts < MAX_RANDOM_ATTEMPTS) {
        attempts++;
        const direction = this.#rng.pick(DIRECTIONS);

        const length = this.#ships[this.#currentShipIndex].length;

        const [colMax, rowMax] = direction.equals(Vector2Int.right)
          ? [this.#board.width - length, this.#board.height]
          : [this.#board.width, this.#board.height - length];

        const col = this.#rng.nextInt(0, colMax);
        const row = this.#rng.nextInt(0, rowMax);
        const coord = new Vector2Int(col, row);

        if (this.placeCurrentShip(coord, direction)) {
          placed = true;
        }
      }
      if (!placed) throw new Error('Failed to place ship');
    }

    return true;
  }

  autoPlaceAll() {
    if (this.#state !== PLACEMENT_STATE.placing) {
      return false;
    }
    this.resetPlacement();
    return this.autoPlaceRemaining();
  }

  isPlacementComplete() {
    return this.#state === PLACEMENT_STATE.complete;
  }

  getRemainingCount() {
    if (this.#currentShipIndex >= this.#ships.length) {
      return 0;
    }
    return this.#ships.length - this.#currentShipIndex;
  }

  getPlacementProgress() {
    if (this.#state === PLACEMENT_STATE.idle) {
      return null;
    }
    return {
      state: this.#state,
      totalShips: this.#ships.length,
      currentShipIndex: this.#currentShipIndex,
      remainingCount: this.getRemainingCount(),
    };
  }
}

export { PlacementSystem };
