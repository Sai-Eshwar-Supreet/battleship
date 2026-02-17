import { assertEnum } from '../../core/validation/enum-validation';

class Cell {
  #occupiedShipId;
  #state;

  constructor() {
    this.#occupiedShipId = null;
    this.#state = Cell.cellState.clean;
  }

  get occupiedShipId() {
    return this.#occupiedShipId;
  }

  get state() {
    return this.#state;
  }

  set state(value) {
    assertEnum(Cell.cellState, value, 'Cell State');
    this.#state = value;
  }

  static cellState = Object.freeze({
    hit: 'hit',
    miss: 'miss',
    clean: 'clean',
  });
}

export { Cell };
