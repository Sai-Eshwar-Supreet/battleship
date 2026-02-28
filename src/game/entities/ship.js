/**
 * Represents a ship in the game.
 */

class Ship {
  /** @type {number} */
  #length;

  /** @type {number} */
  #hitCount;

  /** @type {string} */
  #id;

  /**
   * Creates a new Ship.
   *
   * @param {{ id: string, length: number }} option
   * @throws {TypeError} If length is not a positive integer
   * @throws {TypeError} If id is not a string
   */
  constructor({id, length} = {}) {
    if (!Number.isInteger(length) || length <= 0) {
      throw new TypeError('Ship length must be a positive integer');
    }

    if(typeof id !== 'string'){
      throw new TypeError('Ship id must be a string');
    }

    this.#length = length;
    this.#hitCount = 0;
    this.#id = id;
  }

  /**
   * Unique ship id.
   *
   * @returns {string}
   */
  get id() {
    return this.#id;
  }

  /**
   * The total length of the ship.
   *
   * @returns {number}
   */
  get length() {
    return this.#length;
  }

  /**
   * The number of times the ship has been hit.
   *
   * @returns {number}
   */
  get hitCount() {
    return this.#hitCount;
  }

  /**
   * The current health of the ship.
   *
   * @returns {number}
   */
  get health() {
    return (this.#length - this.#hitCount) / this.#length;
  }

  /**
   * Indicates whether the ship has been sunk.
   *
   * @returns {boolean} True if hitCount equal to length
   */
  get isSunk() {
    return this.#hitCount === this.#length;
  }

  /**
   * Registers a hit on the ship.
   *
   * If the ship is already sunk, the hit is ignored.
   *
   * @returns {boolean}
   * - True if the hit was applied
   * - False if the ship was already sunk
   */
  hit() {
    if (this.isSunk) {
      return false;
    }
    this.#hitCount++;
    return true;
  }
}

export { Ship };
