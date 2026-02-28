import { Ship } from '../../../game/entities/ship.js';

describe('Ship construction', () => {
  test('Create ship with valid states', () => {
    let ship = new Ship({id: 'Test ship', length: 3});
    expect(ship.length).toBe(3);
    expect(ship.hitCount).toBe(0);
    expect(ship.health).toBe(1);
    expect(ship.isSunk).toBe(false);
  });

  test.each([0, -1, 1.5, NaN, '2', Infinity])('throws for invalid length %p', (length) => {
    expect(() => new Ship({id:'Test ship', length})).toThrow(TypeError);
  });

  test.each([0, null, undefined, {}, []])('throws for invalid id %p', (id) => {
    expect(() => new Ship({id, length: 2})).toThrow(TypeError);
  });
});

describe('Ship hit behavior', () => {
  let ship;

  beforeEach(() => (ship = new Ship({id: 'Test ship', length: 2})));

  test('hit increases hitcount', () => {
    ship.hit();
    expect(ship.hitCount).toBe(1);
  });

  test('a valid hit decreases health', () => {
    ship.hit();
    expect(ship.health).toBe(0.5);
  });

  test('hit should return true if ship is afloat', () => {
    expect(ship.hit()).toBe(true);
  });

  test('ship is sunk with health 0 when hitcount equals length', () => {
    for (let i = 0; i < ship.length; i++) {
      ship.hit();
    }

    expect(ship.hitCount).toBe(ship.length);
    expect(ship.isSunk).toBe(true);
    expect(ship.health).toBe(0);
  });

  test('failed hit does not change state', () => {
    ship.hit();
    ship.hit(); // sunk

    const hitsBefore = ship.hitCount;
    const healthBefore = ship.health;

    ship.hit(); // invalid hit

    expect(ship.hitCount).toBe(hitsBefore);
    expect(ship.health).toBe(healthBefore);
  });
});

describe('Ship invariants', () => {
  let ship;

  beforeEach(() => (ship = new Ship({id: 'Test ship', length: 2})));

  test('hitcount is capped at length', () => {
    for (let i = 0; i < ship.length + 5; i++) {
      ship.hit();
    }

    expect(ship.hitCount).toBe(ship.length);
  });

  test('cannot hit a sunk ship', () => {
    for (let i = 0; i < ship.length; i++) {
      ship.hit();
    }

    expect(ship.hit()).toBe(false);
  });

  test('health remains between 0 and 1', () => {
    for (let i = 0; i < ship.length; i++) {
      ship.hit();
    }

    expect(ship.health).toBeLessThanOrEqual(1);
    expect(ship.health).toBeGreaterThanOrEqual(0);
  });
});
