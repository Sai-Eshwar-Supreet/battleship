import { Vector2Int } from '../../core/math/vector2int.js';
import { BOARD_HEIGHT, BOARD_WIDTH } from '../config/game-config.js';
import { Cell } from './cell.js';
import { Ship } from './ship.js';

class GameBoard {
  #grid;
  #fleet;
  #width;
  #height;

  #minBound;
  #maxBound;

  #totalHits;
  #totalLength;

  constructor() {
    this.#grid = [];
    this.#minBound = Vector2Int.origin;
    this.#maxBound = new Vector2Int(BOARD_WIDTH - 1, BOARD_HEIGHT - 1);
    this.#width = BOARD_WIDTH;
    this.#height = BOARD_HEIGHT;
    this.#totalHits = 0;
    this.#totalLength = 0;

    for (let y = 0; y < BOARD_HEIGHT; y++) {
      const row = [];
      for (let x = 0; x < BOARD_WIDTH; x++) {
        const cell = new Cell();

        row.push(cell);
      }

      this.#grid.push(Object.freeze(row));
    }

    Object.freeze(this.#grid);

    this.#fleet = new Map();
  }

  get width() {
    return this.#width;
  }

  get height() {
    return this.#height;
  }

  placeShip(ship, position, direction) {
    if (!(ship instanceof Ship)) {
      throw new TypeError('Expects a ship object');
    }

    if (this.#fleet.has(ship.id)) {
      throw new Error('Cannot place the same ship twice');
    }

    const chain = this.buildChain(position, direction, ship.length);

    if (!chain) {
      return false;
    }

    if (chain.some((pos) => this.#grid[pos.y][pos.x].occupiedShipId !== null)) {
      return false;
    }

    this.#fleet.set(ship.id, ship);
    this.#totalLength += ship.length;

    for (let pos of chain) {
      this.#grid[pos.y][pos.x].occupiedShipId = ship.id;
    }

    return true;
  }

  #createAttackResult(success, position, result) {
    return Object.freeze({ success, position, result });
  }

  receiveAttack(position) {
    if (!Vector2Int.isValid(position)) {
      throw new TypeError('Expected position of type Vector2Int');
    }

    if (!position.isWithin(this.#minBound, this.#maxBound)) {
      return this.#createAttackResult(false, position, null);
    }

    const cell = this.#grid[position.y][position.x];

    if (cell.flag !== Cell.cellFlag.empty) {
      return this.#createAttackResult(false, position, null);
    }

    const id = cell.occupiedShipId;
    const isHit = this.#fleet.get(id)?.hit();

    if (isHit) this.#totalHits++;

    cell.flag = id !== null ? Cell.cellFlag.hit : Cell.cellFlag.miss;

    return this.#createAttackResult(true, position, cell.flag);
  }

  allShipsSunk() {
    if (this.#fleet.size === 0) {
      throw new Error('Ships are not placed');
    }

    for (const ship of this.#fleet.values()) {
      if (!ship.isSunk) return false;
    }

    return true;
  }

  canPlaceShip(origin, direction, length) {
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

    let pos = origin;

    for (let i = 0; i < length; i++) {
      if (
        !pos.isWithin(this.#minBound, this.#maxBound) ||
        this.#grid[pos.y][pos.x].occupiedShipId !== null
      ) {
        return false;
      }
      pos = pos.add(direction);
    }

    return true;
  }

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

    const chain = [];

    let pos = origin;

    for (let i = 0; i < length; i++) {
      if (!pos.isWithin(this.#minBound, this.#maxBound)) {
        return null;
      }
      chain.push(pos);
      pos = pos.add(direction);
    }

    return chain;
  }

  buildChainClamped(origin, direction, length) {
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

    const chain = [];

    let pos = origin;

    for (let i = 0; i < length; i++) {
      if (!pos.isWithin(this.#minBound, this.#maxBound)) {
        break;
      }
      chain.push(pos);
      pos = pos.add(direction);
    }

    return chain;
  }

  getAllShipLocations() {
    const positions = [];
    for (let y = 0; y < BOARD_HEIGHT; y++) {
      for (let x = 0; x < BOARD_WIDTH; x++) {
        if (this.#grid[y][x].occupiedShipId !== null) {
          positions.push(new Vector2Int(x, y));
        }
      }
    }

    return positions;
  }

  getCumulativeHealth() {
    if (this.#totalLength === 0) return 0;

    return (this.#totalLength - this.#totalHits) / this.#totalLength;
  }

  reset() {
    this.#fleet.clear();

    for (let y = 0; y < BOARD_HEIGHT; y++) {
      const row = this.#grid[y];
      for (let x = 0; x < BOARD_WIDTH; x++) {
        const cell = row[x];
        cell.reset();
      }
    }
  }
}

export { GameBoard };
