import { setSettings, getSettings } from '../config/game-settings.js';
import { createState } from '../../core/state/state-factory.js';
import { buildMenuView } from '../../ui/views/menu-view.js';

function createMenuState(ctx) {
  let menuView = null;

  function enter() {
    const { playerName, difficulty } = getSettings();
    menuView ??= buildMenuView(playerName, difficulty);
    menuView.mount();
    menuView.onGameStart(updateSettings);
  }

  function update() {
    // noop
  }

  function exit() {
    menuView?.unmount();
    menuView = null;
  }

  function updateSettings({ playerName, difficultyId }) {
    setSettings(playerName, difficultyId);

    ctx.requestState('PRE_GAME');
  }

  return createState('MENU', { enter, exit, update });
}

export { createMenuState };
