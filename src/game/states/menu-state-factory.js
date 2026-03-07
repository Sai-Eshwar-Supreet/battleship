import { createState } from '../../core/state/state-factory.js';
import { buildMenuView } from '../../ui/views/menu-view.js';
import { DIFFICULTY } from '../config/difficulty-config.js';
import { BOARD_HEIGHT, BOARD_WIDTH } from '../config/game-config.js';
import { Player } from '../entities/player/player.js';
import createHumanInputStrategy from '../entities/player/strategies/human-input-strategy.js';
import createHuntTargetStrategy from '../entities/player/strategies/hunt-target-strategy.js';

function createMenuState(ctx) {
  let menuView = null;

  function enter() {
    menuView ??= buildMenuView();
    menuView.mount();
    menuView.onGameStart(handleGameStart);
  }

  function update() {
    // noop
  }

  function exit() {
    menuView?.unmount();
    menuView = null;
  }

  function handleGameStart({ playerName, difficultyId }) {
    const difficulty = Object.values(DIFFICULTY).find((d) => d.id === difficultyId);

    ctx.players[Player.type.human] = new Player(
      playerName,
      Player.type.human,
      createHumanInputStrategy()
    );
    ctx.players[Player.type.computer] = new Player(
      'Enemy',
      Player.type.computer,
      createHuntTargetStrategy(BOARD_WIDTH, BOARD_HEIGHT, difficulty, Date.now())
    );
    
    ctx.requestState('PLACEMENT');
  }

  return createState('MENU', { enter, exit, update });
}

export { createMenuState };
