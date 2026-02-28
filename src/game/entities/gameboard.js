import { Vector2Int } from '../../core/math/vector2int';
import { BOARD_HEIGHT, BOARD_WIDTH } from '../config/game-config';
import { Cell } from './cell';
import { Ship } from './ship';

class GameBoard {

  #grid;
  #fleet;

  #minBound;
  #maxBound;

  constructor(){
    this.#grid = [];
    this.#minBound = Vector2Int.origin;
    this.#maxBound = new Vector2Int(BOARD_WIDTH - 1, BOARD_HEIGHT - 1);

    for(let x = 0; x < BOARD_WIDTH; x++){
      const row = [];
      for(let y = 0; y < BOARD_HEIGHT; y++){
        const cell = new Cell();

        row.push(cell);
      }

      this.#grid.push(Object.freeze(row));
    }

    Object.freeze(this.#grid);

    this.#fleet = new Map();
  }

  placeShip(ship, position, direction){
    if(!(ship instanceof Ship)){
      throw new TypeError('Expects a ship object');
    }

    if(this.#fleet.has(ship.id)){
      throw new Error('Cannot place the same ship twice');
    }

    const chain = this.buildChain(position, direction, ship.length);

    if(!chain){
      return false;
    }

    if(chain.some(pos => (this.#grid[pos.x][pos.y].occupiedShipId) !== null)){
      return false;
    }

    this.#fleet.set(ship.id, ship);

    for(let pos of chain){
      this.#grid[pos.x][pos.y].occupiedShipId = ship.id;
    }

    return true;
  }

  receiveAttack(position){
    if (!Vector2Int.isValid(position)) {
      throw new TypeError('Expected position of type Vector2Int');
    }

    if(!position.isWithin(this.#minBound, this.#maxBound)){
      return false;
    }

    const cell = this.#grid[position.x][position.y];

    if(cell.flag !== Cell.cellFlag.empty){
      return false;
    }

    const id = cell.occupiedShipId;
    this.#fleet.get(id)?.hit();

    cell.flag = id !== null? Cell.cellFlag.hit : Cell.cellFlag.miss;

    return true;
  }

  allShipsSunk(){

    if(this.#fleet.size === 0){
      throw new Error('Ships are not placed');
    }

    for(const ship of this.#fleet.values()){
      if(!ship.isSunk) return false;
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

    if(!origin.isWithin(this.#minBound, this.#maxBound)){
      return null;
    }
    
    const chain = [origin];

    for (let i = 1; i < length; i++) {

      const pos = chain[i - 1].add(direction);
      
      if(!pos.isWithin(this.#minBound, this.#maxBound)){
        return null;
      }
      chain.push(pos);
    }

    return chain;
  }

  reset(){
    this.#fleet.clear();
    
    for(let x = 0; x < BOARD_WIDTH; x++){
      const row = this.#grid[x];
      for(let y = 0; y < BOARD_HEIGHT; y++){
        const cell = row[y];
        cell.reset();
      }
    }
  }
}

export { GameBoard };
