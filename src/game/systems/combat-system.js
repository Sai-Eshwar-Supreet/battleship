import { Cell } from '../entities/cell.js';
import { Player } from '../entities/player/player.js';

class CombatSystem {
  #attacker;
  #defender;

  #started = false;

  startCombat(playerA, playerB) {
    if (this.#started) {
      throw new Error('Combat already started');
    }
    if (!(playerA instanceof Player) || !(playerB instanceof Player)) {
      throw new TypeError('Invalid players');
    }

    this.#attacker = playerA;
    this.#defender = playerB;
    this.#started = true;
  }

  reset() {
    this.#attacker = null;
    this.#defender = null;
    this.#started = false;
  }

  async executeTurn() {
    if (!this.#started) {
      throw new Error('Combat not started yet');
    }

    if (this.isCombatComplete()) {
      throw new Error('Combat already finished');
    }

    const move = await this.#attacker.requestMove();

    const response = this.#defender.board.receiveAttack(move);

    if (response.success) {
      this.#attacker.onAttackResult(response.position, response.result);
      if (response.result === Cell.cellFlag.miss)
        [this.#attacker, this.#defender] = [this.#defender, this.#attacker];
    }

    return response;
  }

  isCombatComplete() {
    if (!this.#started) {
      throw new Error('Combat not started yet');
    }

    return this.#attacker.board.allShipsSunk() || this.#defender.board.allShipsSunk();
  }

  getWinner() {
    if (!this.#started) {
      throw new Error('Combat not started yet');
    }

    if (this.#attacker.board.allShipsSunk()) return this.#defender;
    if (this.#defender.board.allShipsSunk()) return this.#attacker;

    return null;
  }

  getCurrentPlayer() {
    if (!this.#started) {
      throw new Error('Combat not started yet');
    }

    return this.#attacker;
  }

  getCurrentOpponent() {
    if (!this.#started) {
      throw new Error('Combat not started yet');
    }

    return this.#defender;
  }
}

export { CombatSystem };
