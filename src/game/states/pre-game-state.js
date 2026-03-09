import { createState } from '../../core/state/state-factory.js';
import { BOARD_HEIGHT, BOARD_WIDTH } from '../config/game-config.js';
import { getSettings } from '../config/game-settings.js';
import { Player } from '../entities/player/player.js';
import createHumanInputStrategy from '../entities/player/strategies/human-input-strategy.js';
import createHuntTargetStrategy from '../entities/player/strategies/hunt-target-strategy.js';

function createPreGameState(ctx) {

  function enter() {
    initializePlayers();
  }

  function update() {
    ctx.requestState('PLACEMENT');
  }

  function exit() {
    // noop
  }

  function initializePlayers() {

    const {playerName, difficulty} = getSettings();
    ctx.players[Player.type.human] = new Player(
      playerName,
      Player.type.human,
      createHumanInputStrategy()
    );
    ctx.players[Player.type.computer] = new Player(
      'Enemy',
      Player.type.computer,
      createHuntTargetStrategy({width:BOARD_WIDTH, height:BOARD_HEIGHT, difficultyConfig: difficulty, seed: Date.now()})
    );
  }

  return createState('PRE_GAME', { enter, exit, update });
}

export { createPreGameState };
