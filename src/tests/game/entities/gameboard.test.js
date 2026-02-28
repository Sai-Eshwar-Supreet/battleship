import { Vector2Int } from '../../../core/math/vector2int.js';
import { GameBoard } from '../../../game/entities/gameboard.js';
import { Ship } from '../../../game/entities/ship.js';


describe('GameBoard: ship placement (placeShip)', () => {

  const gameBoard = new GameBoard();

  beforeEach(() => gameBoard.reset());

  test('should throw if ship is not instance of Ship', () => {
    expect(() => gameBoard.placeShip(null, Vector2Int.origin, Vector2Int.right)).toThrow(TypeError);
    expect(() => gameBoard.placeShip(undefined, Vector2Int.origin, Vector2Int.right)).toThrow(TypeError);
    expect(() => gameBoard.placeShip({}, Vector2Int.origin, Vector2Int.right)).toThrow(TypeError);
    expect(() => gameBoard.placeShip([], Vector2Int.origin, Vector2Int.right)).toThrow(TypeError);
  });
  
  test('should throw when same ship is placed twice', () => {
    const config = {id: 'Test ship', length: 2};

    expect(() => gameBoard.placeShip(new Ship(config), Vector2Int.origin, Vector2Int.right)).not.toThrow(Error);
    expect(() => gameBoard.placeShip(new Ship(config), Vector2Int.origin, Vector2Int.right)).toThrow(Error);
  });

  test('should handle in-bounds and out-of-bounds attacks correctly', () => {
    const configA = {id: 'Test ship 1', length: 3};
    const configB = {id: 'Test ship 2', length: 3};

    expect(gameBoard.placeShip(new Ship(configA), Vector2Int.origin, Vector2Int.right)).toBe(true);
    expect(gameBoard.placeShip(new Ship(configB), new Vector2Int(9,9), Vector2Int.up)).toBe(false);
  });

  test('should return false if ship placement collides with another ship', () => {
    const configA = {id: 'Test ship 1', length: 2};
    const configB = {id: 'Test ship 2', length: 2};

    expect(gameBoard.placeShip(new Ship(configA), Vector2Int.origin, Vector2Int.right)).toBe(true);
    expect(gameBoard.placeShip(new Ship(configB), Vector2Int.origin, Vector2Int.up)).toBe(false);
  });

  test('should return true if ship placement is valid', () => {
    const configA = {id: 'Test ship 1', length: 2};
    const configB = {id: 'Test ship 2', length: 2};

    expect(gameBoard.placeShip(new Ship(configA), Vector2Int.origin, Vector2Int.right)).toBe(true);
    expect(gameBoard.placeShip(new Ship(configB), Vector2Int.one, Vector2Int.up)).toBe(true);
  });

  test('placed ship occupies cells and can be hit', () => {
    const ship = new Ship({ id: 'A', length: 2 });
    gameBoard.placeShip(ship, Vector2Int.origin, Vector2Int.right);

    expect(gameBoard.receiveAttack(Vector2Int.origin)).toBe(true);
    expect(ship.hitCount).toBe(1);
  });
  
});

describe('GameBoard: Receive Attack (receiveAttack)', () => {

  const gameBoard = new GameBoard();

  beforeEach(() => gameBoard.reset());

  test('should throw if position is invalid', () => {
    expect(() => gameBoard.receiveAttack({})).toThrow(TypeError);
    expect(() => gameBoard.receiveAttack([])).toThrow(TypeError);
    expect(() => gameBoard.receiveAttack(null)).toThrow(TypeError);
    expect(() => gameBoard.receiveAttack(undefined)).toThrow(TypeError);
    expect(() => gameBoard.receiveAttack('2,3')).toThrow(TypeError);
  });

  test('should return false if position is out of bounds', () => {
    expect(gameBoard.receiveAttack(Vector2Int.origin)).toBe(true);
    expect(gameBoard.receiveAttack(new Vector2Int(10,10))).toBe(false);
    expect(gameBoard.receiveAttack(new Vector2Int(-1,9))).toBe(false);
  });

  test('should return false if cell is already attacked', () => {
    expect(gameBoard.receiveAttack(Vector2Int.origin)).toBe(true);
    expect(gameBoard.receiveAttack(Vector2Int.origin)).toBe(false);
  });

  test('should return true if attack is valid', () => {
    expect(gameBoard.receiveAttack(Vector2Int.origin)).toBe(true);
    expect(gameBoard.receiveAttack(Vector2Int.one)).toBe(true);
  });
  
});

describe('GameBoard: Has ship sunk (allShipsSunk)', () => {

  const gameBoard = new GameBoard();

  beforeEach(() => gameBoard.reset());

  test('should throw if no ships are placed', () => {
    expect(() => gameBoard.allShipsSunk()).toThrow(Error);
  });

  test('should return false if any of the ships are not sunk', () => {
    const shipA = new Ship({id: "Ship A", length: 1});
    const shipB = new Ship({id: "Ship B", length: 1});

    gameBoard.placeShip(shipA, Vector2Int.origin, Vector2Int.right);
    gameBoard.placeShip(shipB, Vector2Int.one, Vector2Int.right);

    gameBoard.receiveAttack(Vector2Int.origin);
    expect(gameBoard.allShipsSunk()).toBe(false);

    gameBoard.receiveAttack(Vector2Int.one);
    expect(gameBoard.allShipsSunk()).toBe(true);
  });  
});

describe('GameBoard: Chain building (buildChain)', () => {
  let board = new GameBoard();

  test('Throws for invalid origin', () => {
    expect(() => board.buildChain('0,0', Vector2Int.right, 5)).toThrow(TypeError);
    expect(() => board.buildChain([0, 0], Vector2Int.right, 5)).toThrow(TypeError);
  });

  test('Throws for invalid direction', () => {
    expect(() => board.buildChain(Vector2Int.origin, '0,0', 5)).toThrow(TypeError);
    expect(() => board.buildChain(Vector2Int.origin, [0, 0], 5)).toThrow(TypeError);
  });

  test('Throws for non cardinal direction', () => {
    expect(() => board.buildChain(Vector2Int.origin, Vector2Int.one, 5)).toThrow(Error);
    expect(() => board.buildChain(Vector2Int.origin, Vector2Int.right.scale(2), 5)).toThrow(Error);
  });

  test('Throws for invalid length', () => {
    expect(() => board.buildChain(Vector2Int.origin, Vector2Int.right, 0)).toThrow(TypeError);
    expect(() => board.buildChain(Vector2Int.origin, Vector2Int.right, -1)).toThrow(TypeError);
    expect(() => board.buildChain(Vector2Int.origin, Vector2Int.right, Infinity)).toThrow(TypeError);
    expect(() => board.buildChain(Vector2Int.origin, Vector2Int.right, NaN)).toThrow(TypeError);
    expect(() => board.buildChain(Vector2Int.origin, Vector2Int.right, 1.5)).toThrow(TypeError);
    expect(() => board.buildChain(Vector2Int.origin, Vector2Int.right, '4')).toThrow(TypeError);
  });

  test('should return null if the chain runs outside bounds', () => {
    expect(board.buildChain(Vector2Int.origin, Vector2Int.down, 4)).toBe(null);
    expect(board.buildChain(new Vector2Int(8,8), Vector2Int.up, 4)).toBe(null);
    expect(board.buildChain(new Vector2Int(10,10), Vector2Int.right, 1)).toBe(null);
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
        [1, 2],
        [1, 3],
        [1, 4],
      ],
    ],
  ])('Build chain: %s', (_, origin, direction, length, expectedResult) => {
    const chain = board.buildChain(origin, direction, length).map((point) => point.toArray());

    expect(chain).toEqual(expectedResult);
  });
});
