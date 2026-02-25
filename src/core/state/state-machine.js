import { StateDictionary } from './state-dictionary';

// Extend this class to create concrete state machines and initialize states in the constructor
class StateMachine {
  #stateDictionary;
  #currentState;
  #pendingStateType;
  #onTransition;

  constructor() {
    this.#stateDictionary = new StateDictionary();
    this.#currentState = this.#pendingStateType = null;
    this.#onTransition = [];
  }

  get currentStateType() {
    return this.#currentState?.type ?? null;
  }

  get pendingStateType(){
    return this.#pendingStateType;
  }
  
  addState(factory) {
    this.#stateDictionary.addState(factory);
  }

  requestState(type) {
    if(!this.#currentState){
      throw new Error('State machine is not started');
    }

    if (typeof type !== 'string') {
      throw new TypeError('State type must be a string');
    }

    if (!this.#stateDictionary.contains(type)) {
      throw new Error(`Invalid transition: ${type}`);
    }

    if (this.#pendingStateType !== null) {
      throw new Error(`Transition already requested: ${this.#pendingStateType}`);
    }

    this.#pendingStateType = type;
  }

  start(initialType) {
    if (this.#currentState) {
      throw new Error('StateMachine already started');
    }

    this.#pendingStateType = null;
    this.#currentState = this.#stateDictionary.getState(initialType);
    if (!this.#currentState) {
      throw new Error(`Unknown state: ${initialType}`);
    }
    this.#currentState.enter();
  }

  update(dt) {
    if (!this.#currentState) {
      throw new Error('StateMachine not started');
    }

    this.#currentState.update?.(dt);

    if (this.#pendingStateType) {
      const next = this.#stateDictionary.getState(this.#pendingStateType);
      const from = this.#currentState.type;
      this.#currentState.exit?.();
      this.#currentState = next;
      this.#currentState.enter();
      this.#pendingStateType = null;

      this.#onTransition.forEach((fn) => fn(from, this.#currentState.type));
    }
  }
  
  onTransition(callback) {
    if (typeof callback !== 'function') {
      throw new TypeError('onTransition expects a function');
    }
    this.#onTransition.push(callback);
  }
}

export { StateMachine };
