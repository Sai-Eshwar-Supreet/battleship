import { State } from "./state";

class StateDictionary {
  #cache;
  #length;

  constructor() {
    this.#cache = {};
    this.#length = 0;
  }

  get length(){
    return this.#length;
  }

  addState(stateFactory) {
    if(typeof stateFactory !== 'function'){
      throw new TypeError('Expects stateFactory to be of type function');
    }

    const state = stateFactory?.() ?? null;

    if (!state || !(state instanceof State) || typeof state.type !== 'string' || typeof state.enter !== 'function'){
      throw new Error('Invalid state returned by factory');
    }

    const key = state.type;
    if (Object.hasOwn(this.#cache, key)) {
      throw new Error(`State already exists: ${key}`);
    } else {
      this.#cache[key] = state;
      this.#length++;
      return true;
    }
  }

  removeState(type) {
    if (typeof type !== 'string') {
      throw new TypeError('Expected type to be a string');
    }
    if (Object.hasOwn(this.#cache, type)) {
      delete this.#cache[type];
      this.#length--;
      return true;
    }
    return false;
  }

  getState(type) {
    if (typeof type !== 'string') {
      throw new TypeError('Expected type to be a string');
    }
    return this.#cache[type] ?? null;
  }

  clear() {
    this.#cache = {};
    this.#length = 0;
  }

  contains(type) {
    if (typeof type !== 'string') {
      throw new TypeError('Expected type to be a string');
    }
    return Object.hasOwn(this.#cache, type);
  }
}

export { StateDictionary };
