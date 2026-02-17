import { UINT32_RANGE } from "../utils/number-helper";

/**
 * Deterministic pseudo-random number generator (PRNG).
 * 
 * - Algorithm: Mulberry32
 * - Not cryptographically secure
 * - Uses a 32-bit integer state.
 * - Seeded, reproducible, and cloneable.
 * - Produces values in the range [0, 1).
 */
class RNG{
    
    /** @type {number} */
    #initialSeed;
    
    /** @type {number} */
    #seed;

    /**
     * Creates a new RNG instance.
     *
     * @param {number} seed - Integer seed used to initialize the generator.
     * @throws {TypeError} If the seed is not an integer.
     */
    constructor(seed){
        if (!Number.isInteger(seed)) {
            throw new TypeError('Requires an integer seed');
        }
        this.#initialSeed = this.#seed = seed >>> 0;
    }

    /**
     * Sets the current seed.
     *
     * @param {number} value - Integer seed value.
     * @throws {TypeError} If the value is not an integer.
     */
    set seed(value){
        if(!Number.isInteger(value)){
            throw new TypeError('Seed value must be an integer');
        }
        
        this.#initialSeed = this.#seed = value >>> 0;
    }

    /**
     * Gets the current seed.
     *
     * @returns {number} Current internal seed.
     */
    get seed(){
        return this.#seed;
    }

    /**
     * Resets the generator back to its initial seed.
     */
    reset(){
        this.#seed = this.#initialSeed;
    }

    /**
     * Generates the next pseudo-random number.
     *
     * @returns {number} Floating-point number in the range [0, 1).
     */
    next(){
        this.#seed = (this.#seed + 0x6D2B79F5) >>> 0;
        let a = this.#seed;

        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);

        return ((t ^ (t >>>   14)) >>> 0) / UINT32_RANGE;
    }

    /**
     * Generates a random floating-point number within a range.
     *
     * @param {number} min - Inclusive lower bound.
     * @param {number} max - Exclusive upper bound.
     * @returns {number} Random float in the range [min, max).
     * @throws {TypeError} If arguments are not finite numbers.
     * @throws {RangeError} If min is greater than or equal to max.
     */
    nextFloat(min, max){
        if(!Number.isFinite(min) || !Number.isFinite(max)){
            throw new TypeError('Requires finite numbers');
        }
        if(min >= max){
            throw new RangeError('Invalid range: min >= max')
        }
        
        return min + (this.next() * (max - min));
    }

    /**
     * Generates a random integer within a range.
     *
     * @param {number} min - Inclusive lower bound.
     * @param {number} max - Exclusive upper bound.
     * @returns {number} Random integer in the range [min, max).
     * @throws {TypeError} If arguments are not integers.
     * @throws {RangeError} If min is greater than or equal to max.
     */
    nextInt(min, max){
        if(!Number.isInteger(min) || !Number.isInteger(max)){
            throw new TypeError('Requires integer numbers');
        }
        
        if(min >= max){
            throw new RangeError('Invalid range: min >= max')
        }
        
        return min + Math.floor(this.next() * (max - min));
    }

    /**
     * Picks a random element from an array.
     *
     * @template T
     * @param {T[]} array - Source array.
     * @returns {T} Randomly selected element.
     * @throws {TypeError} If input is not an array.
     * @throws {RangeError} If the array is empty.
     */
    pick(array){
        if(!Array.isArray(array)){
            throw new TypeError('Requires array');
        }

        if (array.length === 0) {
            throw new RangeError('Cannot pick from empty array');
        }

        const index = this.nextInt(0, array.length);

        return array[index];
    }

    /**
     * Returns a shuffled copy of an array using Fisher–Yates.
     *
     * @template T
     * @param {T[]} array - Array to shuffle.
     * @returns {T[]} New shuffled array.
     * @throws {TypeError} If input is not an array.
     */
    shuffle(array){
        if(!Array.isArray(array)){
            throw new TypeError('Requires array');
        }

        const result = [...array];

        for(let i = result.length - 1; i > 0; i--){
            const j = this.nextInt(0, i + 1);

            [result[i], result[j]] = [result[j], result[i]]
        }

        return result;
    }

     /**
     * Creates a copy of this RNG with identical internal state.
     *
     * @returns {RNG} Cloned RNG instance.
     */
    clone() {
        const r = new RNG(this.#initialSeed);
        r.#seed = this.#seed;
        return r;
    }
}

export { RNG }