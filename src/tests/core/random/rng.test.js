import { RNG } from '../../../core/random/rng.js';

describe('RNG creation', () => {
  test.each([undefined, NaN, '3', 1.5])('should throw when input is %p', (seed) => {
    expect(() => new RNG(seed)).toThrow(TypeError);
  });
});

describe('RNG Invariants', () => {
  test('should reset properly', () => {
    const rng = new RNG(1);
    const oldStart = rng.next();
    rng.reset();
    const newStart = rng.next();
    expect(oldStart).toBe(newStart);
  });

  test('should start a new run on reseed ', () => {
    const rng = new RNG(1);
    const oldStart = rng.next();
    rng.seed = -1;
    rng.reset();
    expect(rng.next()).not.toBe(oldStart);
  });

  test('same seed produces same sequence', () => {
    const a = new RNG(1);
    const b = new RNG(1);
    for (let i = 0; i < 10; i++) {
      expect(a.next()).toBe(b.next());
    }
  });
});

describe('RNG derived methods determinism', () => {
  test('nextInt is deterministic for same seed', () => {
    const a = new RNG(7);
    const b = new RNG(7);

    for (let i = 0; i < 10; i++) {
      expect(a.nextInt(0, 10)).toBe(b.nextInt(0, 10));
    }
  });

  test('nextFloat is deterministic for same seed', () => {
    const a = new RNG(7);
    const b = new RNG(7);

    for (let i = 0; i < 10; i++) {
      expect(a.nextFloat(0, 10)).toBe(b.nextFloat(0, 10));
    }
  });

  test('pick is deterministic for same seed', () => {
    const a = new RNG(7);
    const b = new RNG(7);
    const arr = [0, 1, 2, 3, 4, 5];

    for (let i = 0; i < 10; i++) {
      expect(a.pick(arr)).toBe(b.pick(arr));
    }
  });

  test('shuffle is deterministic for same seed', () => {
    const arr = [1, 2, 3, 4, 5];

    const a = new RNG(7).shuffle(arr);
    const b = new RNG(7).shuffle(arr);

    expect(a).toEqual(b);
  });

  test('pick throws on empty array', () => {
    const rng = new RNG(1);
    expect(() => rng.pick([])).toThrow(RangeError);
  });
});

describe('RNG clone behaviors', () => {
  test('clones should produce deterministic results', () => {
    const original = new RNG(10);
    let clone = original.clone();

    expect(original.next()).toBe(clone.next());

    let newClone = original.clone();
    expect(original.next()).toBe(newClone.next());
  });

  test('clone should be independent of original', () => {
    const rng = new RNG(5);
    const clone = rng.clone();

    rng.next();
    expect(rng.next()).not.toBe(clone.next());
  });
});
