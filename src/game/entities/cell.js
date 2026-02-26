import { assertEnum } from '../../core/validation/enum-validation.js';

class Cell {
  #occupiedShipId;
  #flag;

  constructor() {
    this.#occupiedShipId = null;
    this.#flag = Cell.cellFlag.empty;
  }

  get occupiedShipId() {
    return this.#occupiedShipId;
  }

  set occupiedShipId(value){
    if(typeof value !== 'string'){
      throw new TypeError('Expects ship id to be a string');
    }

    this.#occupiedShipId = value;
  }

  get flag() {
    return this.#flag;
  }

  set flag(value) {
    assertEnum(Cell.cellFlag, value, 'Cell Flag');
    this.#flag = value;
  }

  reset(){
    this.#occupiedShipId = null;
    this.#flag = Cell.cellFlag.empty;
  }

  static cellFlag = Object.freeze({
    hit: 'hit',
    miss: 'miss',
    empty: 'empty',
  });
}

export { Cell };
