import { StateMachine } from '../../core/state/state-machine.js';
import { FLEET_CONFIG } from '../config/game-config.js';
import { Ship } from '../entities/ship.js';
import { createMenuState } from '../states/menu-state-factory.js';
import { createPlacementState } from '../states/placement-state-factory.js';
import { createCombatState } from '../states/combat-state-factory.js';
import { createPreGameState } from '../states/pre-game-state.js';

class GameController {
  #stateMachine;
  #players;

  constructor() {
    this.#stateMachine = new StateMachine();
    this.#players = {};

    //register states
    this.#stateMachine.addState(createMenuState, this);
    this.#stateMachine.addState(createPreGameState, this);
    this.#stateMachine.addState(createPlacementState, this);
    this.#stateMachine.addState(createCombatState, this);
  }

  start() {
    this.#stateMachine.start('MENU');
  }

  update(dt) {
    this.#stateMachine.update(dt);
  }

  requestState(type) {
    this.#stateMachine.requestState(type);
  }

  getState() {
    return this.#stateMachine.currentStateType;
  }

  get players() {
    return this.#players;
  }

  buildFleet() {
    const ships = [];
    for (let shipData of FLEET_CONFIG) {
      const ship = new Ship(shipData);

      ships.push(ship);
    }

    return ships;
  }
}

export { GameController };
