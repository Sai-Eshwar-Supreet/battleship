import { Vector2Int } from "../../../core/math/vector2int";

describe('Vector2Int creation', () => {
  test.each([[undefined, 0], [1, undefined], [NaN, '3'], [0.25, 1]])('should throw for [%p, %p]', (x, y) => {
    expect(() => new Vector2Int(x, y)).toThrow(TypeError);
  });
});

describe('Vector2Int dot product', () => {
  test.each([
    [[1,1], [2,1], 3], 
    [[0,0], [-10,1], 0], 
    [[2,5], [5,3], 25], 
    [[-1,-10], [1, -5], 49]])('Dot product of %s and %s is %p', (a, b, result) => {
        const pointA = new Vector2Int(a[0], a[1]);
        const pointB = new Vector2Int(b[0], b[1]);
        expect(Vector2Int.dot(pointA, pointB)).toBe(result);
  });
});

describe('Vector2Int conversion APIs', () => {
    const inputs = [
        { x: 1, y: 2 },
        { x: 3, y: 1 },
        { x: 9, y: 7 },
    ];

  test.each(inputs)('new Vector2Int($x, $y).toArray() should return [$x, $y]', ({x, y}) => {
    expect(new Vector2Int(x, y).toArray()).toEqual([x,y]);
  });
  
  test.each(inputs)('new Vector2Int($x, $y).toJSON() should return { x: $x, y: $y}', ({x, y}) => {
    expect(new Vector2Int(x, y).toJSON()).toEqual({x,y});
  });

  test.each(inputs)('new Vector2Int($x, $y).toString() should return ($x, $y)', ({x, y}) => {
    expect(new Vector2Int(x, y).toString()).toBe(`(${x}, ${y})`);
  });
});

describe('Vector2Int Immutability', () => {
  test('should be immutable on addition', () => {
    const vector = new Vector2Int(1,2);
    const oldValue = vector.toString();
    vector.add(vector);
    expect(oldValue).toBe(vector.toString());
  });
  test('should be immutable on subtraction', () => {
    const vector = new Vector2Int(1,2);
    const oldValue = vector.toString();
    vector.subtract(vector);
    expect(oldValue).toBe(vector.toString());
  });
  test('should be immutable on scaling', () => {
    const vector = new Vector2Int(1,2);
    const oldValue = vector.toString();
    vector.scale(5);
    expect(oldValue).toBe(vector.toString());
  });
});

describe('Vector2Int comparison', () => {
  test('same vector should be equal', () => {
    const vector = new Vector2Int(1,2);
    expect(vector.equals(vector)).toBe(true);
  });
  
  test('vectors with same co-ordinates should be equal', () => {
    const a = new Vector2Int(1,2);
    const b = new Vector2Int(1,2);
    expect(a.equals(b)).toBe(true);
  });
});

describe('Vector2Int addition', () => {
    const inputs = [
        [
            new Vector2Int(1,2),
            new Vector2Int(2,1),
            new Vector2Int(3,3)
        ],
        [
            Vector2Int.origin,
            Vector2Int.one,
            Vector2Int.one
        ],
    ];
    
  test.each(inputs)('%s + %s = %s ', (a, b, result) => {
    expect(a.add(b).toString()).toBe(result.toString());
  });

  test('throws when input is not Vector2Int', () => {
    expect(() => Vector2Int.origin.add({x : 0, y: 1})).toThrow(TypeError);
    expect(() => Vector2Int.origin.add([0, 1])).toThrow(TypeError);
    expect(() => Vector2Int.origin.add(0, 1)).toThrow(TypeError);
  });
});

describe('Vector2Int subtraction', () => {
    const inputs = [
        [
            Vector2Int.origin,
            Vector2Int.right,
            Vector2Int.left
        ],
        [
            new Vector2Int(10,100),
            Vector2Int.one,
            new Vector2Int(9,99)
        ],
    ];
    
  test.each(inputs)('%s - %s = %s ', (a, b, result) => {
    expect(a.subtract(b).toString()).toBe(result.toString());
  });

  test('throws when input is not Vector2Int', () => {
    expect(() => Vector2Int.origin.subtract({x : 0, y: 1})).toThrow(TypeError);
    expect(() => Vector2Int.origin.subtract([0, 1])).toThrow(TypeError);
    expect(() => Vector2Int.origin.subtract(0, 1)).toThrow(TypeError);
  });
});

describe('Vector2Int scale', () => {
    const inputs = [
        [
            Vector2Int.origin,
            3,
            Vector2Int.origin
        ],
        [
            Vector2Int.one,
            3,
            new Vector2Int(3,3)
        ],
        [
            Vector2Int.one,
            -1,
            new Vector2Int(-1,-1)
        ],
    ];
    
  test.each(inputs)('%s x %p = %s ', (vector, scale, result) => {
    expect(vector.scale(scale).toString()).toBe(result.toString());
  });

  test.each([NaN, 1.5, undefined, '3'])('throws when input is %p', (scale) => {
    expect(() => Vector2Int.origin.scale(scale)).toThrow(TypeError);
  });
});

describe('Vector2Int negate', () => {
    const inputs = [
        [
            Vector2Int.origin,
            Vector2Int.origin
        ],
        [
            Vector2Int.one,
            new Vector2Int(-1,-1)
        ],
    ];
    
  test.each(inputs)('-%s = %s ', (vector, result) => {
    expect(vector.negate().toString()).toBe(result.toString());
  });
});

describe('Vector2Int Utilities', () => {
  test.each([[55,21,76], [32,54,86]])('manhattan length of (%p, %p) is %p', (x, y, length) => {
    expect(new Vector2Int(x, y).manhattanLength).toBe(length);
  });

  test.each([[[1,1], [2,2], 2], [[5,64], [56, 32], 83]])('distance between %p and %p is %p', (a, b, length) => {

    const pointA = new Vector2Int(a[0], a[1]); 
    const pointB = new Vector2Int(b[0], b[1]); 
    expect(pointA.distanceTo(pointB)).toBe(length);
    expect(pointB.distanceTo(pointA)).toBe(length);
  });

  test.each([
    [[0,0], [2,2], [1,2], true], 
    [[0,0], [1,2], [5,2], false], 
    [[-10,-5], [1,10], [-1,-10], false]])('does %s and %s contain %s: %p',
        (min, max, point, result) => {
            const minBound = new Vector2Int(min[0], min[1]);
            const maxBound = new Vector2Int(max[0], max[1]);
            const vector = new Vector2Int(point[0], point[1]);

            expect(vector.isWithin(minBound, maxBound)).toBe(result);
        }
    );
  test.each([
    [[0,0], [2,2], [1,2], [1,2]], 
    [[0,0], [10,2], [5,5], [5,2]], 
    [[-10,-5], [1,10], [-1,-10], [-1, -5]]])('does %s and %s contain %s: %p',
        (min, max, point, result) => {
            const minBound = new Vector2Int(min[0], min[1]);
            const maxBound = new Vector2Int(max[0], max[1]);
            const vector = new Vector2Int(point[0], point[1]);
            const resultVector = new Vector2Int(result[0], result[1]);

            expect(vector.clamp(minBound, maxBound).toString()).toBe(resultVector.toString());
        }
    );
});

