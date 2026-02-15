/**
 * Represents an immutable 2D integer vector using an HTML-style coordinate system
 * where +x points right and +y points down.
 */

class Vector2Int{
    /** @type {number} */
    #x;

    /** @type {number} */
    #y;

    /**
     * Creates a new Vector2Int.
     *
     * @param {number} x - X-coordinate (must be an integer)
     * @param {number} y - Y-coordinate (must be an integer)
     * @throws If either argument is not an integer
     */
    constructor(x, y){
        if(!Number.isInteger(x) || !Number.isInteger(y)){
            throw new TypeError("Expects arguments of type integer");
        }

        this.#x = x;
        this.#y = y;
    }

    /**
     * X-coordinate of the vector.
     * @returns {number}
     */
    get x(){
        return this.#x;
    }

    /**
     * Y-coordinate of the vector.
     * @returns {number}
     */
    get y(){
        return this.#y;
    }

    /**
     * Returns a human-readable string representation of the vector.
     *
     * @returns {string}
     */
    toString(){
        return `{ x: ${this.#x}, y: ${this.#y} }`;
    }

    /**
     * Converts the vector to an array.
     * Index 0 is the x-coordinate, index 1 is the y-coordinate.
     *
     * @returns {[number, number]}
     */
    toArray(){
        return [this.#x, this.#y];
    }

    /**
     * Converts the vector to a plain object suitable for JSON serialization.
     *
     * @returns {{x: number, y: number}}
     */
    toJSON(){
        return {x: this.#x, y: this.#y};
    }

    /**
     * Checks whether another vector has the same coordinates as this vector.
     *
     * @param {Vector2Int} vector - Vector to compare against
     * @returns {boolean} True if both vectors have identical coordinates
     */
    equals(vector){
        return (Vector2Int.isValid(vector) && (this.#x === vector.#x) && (this.#y === vector.#y));
    }

    /**
     * Returns a new vector that is the sum of this vector and another vector.
     *
     * @param {Vector2Int} vector - Vector to add
     * @returns {Vector2Int}
     * @throws If the argument is not a Vector2Int
     */
    add(vector){
        if(!Vector2Int.isValid(vector)){
            throw new TypeError("Expected vector to be of type Vector2Int");
        }
        return new Vector2Int(this.#x + vector.#x, this.#y + vector.#y);
    }

    /**
     * Returns a new vector that is the difference of this vector and another vector.
     *
     * @param {Vector2Int} vector - Vector to subtract
     * @returns {Vector2Int}
     * @throws If the argument is not a Vector2Int
     */
    subtract(vector){
        if(!Vector2Int.isValid(vector)){
            throw new TypeError("Expected vector to be of type Vector2Int");
        }
        return new Vector2Int(this.#x - vector.#x, this.#y - vector.#y);
    }

    /**
     * Returns a new vector scaled by an integer factor.
     *
     * @param {number} s - Integer scale factor
     * @returns {Vector2Int}
     * @throws If the scale factor is not an integer
     */
    scale(s){
        if(!Number.isInteger(s)){
            throw new TypeError("Expected scale to be an integer");
        }
        return new Vector2Int(this.#x * s, this.#y * s);
    }

    /**
     * Returns a new vector with both components negated.
     *
     * @returns {Vector2Int}
     */
    negate(){
        return new Vector2Int(-this.#x, -this.#y);
    }

    /**
     * Manhattan length of the vector.
     * Equivalent to |x| + |y|.
     *
     * @returns {number}
     */
    get manhattanLength(){
        return Math.abs(this.#x) + Math.abs(this.#y);
    }

    /**
     * Computes the Manhattan distance to another vector.
     *
     * @param {Vector2Int} other - Target vector
     * @returns {number}
     * @throws If the argument is not a Vector2Int
     */
    distanceTo(other){
        if(!Vector2Int.isValid(other)){
            throw new TypeError("Expected Vector2Int");
        }
        return Math.abs(this.#x - other.#x) + Math.abs(this.#y - other.#y);
    }

     /**
     * Determines whether this vector lies within an inclusive rectangular range.
     *
     * @param {Vector2Int} min - Minimum corner (inclusive)
     * @param {Vector2Int} max - Maximum corner (inclusive)
     * @returns {boolean}
     * @throws If either argument is not a Vector2Int
     */
    isWithin(min, max){
        if(!Vector2Int.isValid(min) || !Vector2Int.isValid(max) ){
            throw new TypeError("Expected vectors min and max to be of type Vector2Int");
        }

        return (
            this.#x >= min.#x && this.#x <= max.#x &&
            this.#y >= min.#y && this.#y <= max.#y
        );
    }

    /**
     * Returns a new vector clamped to an inclusive rectangular range.
     *
     * @param {Vector2Int} min - Minimum allowed coordinates
     * @param {Vector2Int} max - Maximum allowed coordinates
     * @returns {Vector2Int}
     * @throws If either argument is not a Vector2Int
     */
    clamp(min, max){
        if(!Vector2Int.isValid(min) || !Vector2Int.isValid(max) ){
            throw new TypeError("Expected vectors min and max to be of type Vector2Int");
        }

        return new Vector2Int(Math.min(Math.max(this.#x, min.#x), max.#x), Math.min(Math.max(this.#y, min.#y), max.#y));
    }

    /**
     * Checks whether a value is a valid Vector2Int instance.
     *
     * @param {*} vector
     * @returns {boolean}
     */
    static isValid(vector){
        return vector instanceof Vector2Int;
    }

    /** @type {Vector2Int} (0, 0) */
    static origin = Object.freeze(new Vector2Int(0,0));

    /** @type {Vector2Int} (1, 1) */
    static one = Object.freeze(new Vector2Int(1,1));

    /** @type {Vector2Int} (1, 0) */
    static right = Object.freeze(new Vector2Int(1,0));

    /** @type {Vector2Int} (-1, 0) */
    static left = Object.freeze(new Vector2Int(-1,0));

    /** @type {Vector2Int} (0, -1) */
    static up = Object.freeze(new Vector2Int(0,-1));

    /** @type {Vector2Int} (0, 1) */
    static down = Object.freeze(new Vector2Int(0,1));

    /**
     * Computes the dot product of two vectors.
     *
     * @param {Vector2Int} a
     * @param {Vector2Int} b
     * @returns {number}
     * @throws If either argument is not a Vector2Int
     */
    static dot(a, b){
        if(!Vector2Int.isValid(a) || !Vector2Int.isValid(b)){
            throw new TypeError("Expected arguments of type Vector2Int");
        }
        return ( a.#x * b.#x ) + ( a.#y * b.#y );
    }
}

Object.freeze(Vector2Int);

export { Vector2Int }