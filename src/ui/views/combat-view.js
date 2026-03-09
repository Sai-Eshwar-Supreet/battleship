import { eventBus } from '../../core/events/event-bus.js';
import { Vector2Int } from '../../core/math/vector2int.js';
import { assertEnum } from '../../core/validation/enum-validation.js';
import { Cell } from '../../game/entities/cell.js';
import { Player } from '../../game/entities/player/player.js';
import { createElementRecursively } from '../dom/dom-factory.js';

function buildCombatView(width, height) {
  const root = document.querySelector('#root');

  if (!root) {
    throw new Error('There is no root element in the HTML');
  }

  const blueprint = {
    type: 'section',
    classList: ['combat-screen'],
    children: [
      {
        type: 'header',
        classList: ['combat-header'],
        children: [
          {
            type: 'h1',
            textContent: 'BATTLESHIP',
          },
          {
            type: 'p',
            attributes: {
              id: 'turn-indicator',
            },
          },
        ],
      },

      {
        type: 'div',
        classList: ['combat-layout'],
        children: [
          /* PLAYER SIDE */

          {
            type: 'div',
            classList: ['fleet-panel'],
            children: [
              {
                type: 'p',
                attributes: {
                  id: 'player-name-bar',
                },
              },

              {
                type: 'div',
                classList: ['health-bar-shell'],
                children: [
                  {
                    type: 'div',
                    classList: ['health-bar-fill'],
                    attributes: {
                      id: 'player-health-bar',
                    },
                  },
                ],
              },

              {
                type: 'div',
                attributes: {
                  id: 'player-grid',
                },
                classList: ['board'],
              },
            ],
          },

          /* COMPUTER SIDE */

          {
            type: 'div',
            classList: ['fleet-panel'],
            children: [
              {
                type: 'p',
                attributes: {
                  id: 'computer-name-bar',
                },
              },

              {
                type: 'div',
                classList: ['health-bar-shell'],
                children: [
                  {
                    type: 'div',
                    classList: ['health-bar-fill'],
                    attributes: {
                      id: 'computer-health-bar',
                    },
                  },
                ],
              },

              {
                type: 'div',
                attributes: {
                  id: 'computer-grid',
                },
                classList: ['board'],
              },
            ],
          },
        ],
      },

      /* GAME OVER MODAL */

      {
        type: 'dialog',
        attributes: {
          id: 'game-over-panel',
        },
        children: [
          {
            type: 'div',
            classList: ['main-panel'],
            children: [
              {
                type: 'h2',
                attributes: {
                  id: 'game-over-title',
                },
              },

              {
                type: 'p',
                attributes: {
                  id: 'game-over-message',
                },
              },

              {
                type: 'div',
                classList: ['modal-buttons'],
                children: [
                  {
                    type: 'button',
                    textContent: 'Restart',
                    attributes: {
                      id: 'restart-game',
                    },
                  },

                  {
                    type: 'button',
                    textContent: 'Return to Menu',
                    attributes: {
                      id: 'return-to-menu',
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  };

  let ui = null;
  let playerBoardUI = null;
  let playerGrid = null;
  let playerHealthBar = null;
  let computerBoardUI = null;
  let computerGrid = null;
  let computerHealthBar = null;
  let inputActive = false;
  let currentHover = null;
  let turnIndicator = null;

  let listeners = Object.freeze({
    'return-to-menu': [],
    restart: [],
  });

  function mount() {
    if (ui) {
      throw new Error('Cannot mount the same ui twice');
    }

    ui = createElementRecursively(blueprint);
    inputActive = true;
    turnIndicator = ui.querySelector('#turn-indicator');

    // initialize player grid

    playerBoardUI = ui.querySelector('#player-grid');
    playerHealthBar = ui.querySelector('#player-health-bar');
    playerGrid = [];

    for (let rowIndex = 0; rowIndex < height; rowIndex++) {
      const row = [];
      for (let colIndex = 0; colIndex < width; colIndex++) {
        const cellElement = document.createElement('div');
        cellElement.classList.add('cell');
        cellElement.dataset.row = rowIndex;
        cellElement.dataset.col = colIndex;

        playerBoardUI.appendChild(cellElement);
        row.push(cellElement);
      }

      playerGrid.push(row);
    }

    // initialize computer grid

    computerBoardUI = ui.querySelector('#computer-grid');
    computerHealthBar = ui.querySelector('#computer-health-bar');
    computerGrid = [];

    for (let rowIndex = 0; rowIndex < height; rowIndex++) {
      const row = [];
      for (let colIndex = 0; colIndex < width; colIndex++) {
        const cellElement = document.createElement('div');
        cellElement.classList.add('cell');
        cellElement.dataset.row = rowIndex;
        cellElement.dataset.col = colIndex;

        cellElement.addEventListener('mouseenter', handleCellEnter);
        cellElement.addEventListener('mouseleave', handleCellExit);
        cellElement.addEventListener('click', handleCellClick);

        computerBoardUI.appendChild(cellElement);
        row.push(cellElement);
      }

      computerGrid.push(row);
    }

    root.appendChild(ui);
  }

  function handleCellEnter(event) {
    const trigger = event.target.closest('[data-row]');

    if (!trigger) {
      return;
    }

    const row = trigger.dataset.row;
    const col = trigger.dataset.col;

    if (!row || !col) {
      return;
    }

    if (inputActive) event.target.classList.add('hover');

    currentHover = event.target;
  }

  function handleCellExit(event) {
    const trigger = event.target.closest('[data-row]');

    if (!trigger) {
      return;
    }

    const row = trigger.dataset.row;
    const col = trigger.dataset.col;

    if (!row || !col) {
      return;
    }

    event.target.classList.remove('hover');
    currentHover = null;
  }

  function handleCellClick(event) {
    if (!inputActive) return;
    const trigger = event.target.closest('[data-row]');

    if (!trigger) {
      return;
    }

    const row = trigger.dataset.row;
    const col = trigger.dataset.col;

    if (!row || !col) {
      return;
    }

    eventBus.emit('HUMAN_ATTACK_INPUT', new Vector2Int(Number(col), Number(row)));
  }

  function unmount() {
    if (!ui) {
      throw new Error('Unmount request is invalid');
    }

    root.removeChild(ui);

    ui = null;
    playerBoardUI = null;
    playerGrid = null;
    computerBoardUI = null;
    computerGrid = null;
    inputActive = false;

    for (let listenerId of Object.keys(listeners)) {
      listeners[listenerId].length = 0;
    }
  }

  function showShipAt(position) {
    if (!Vector2Int.isValid(position)) {
      throw new TypeError('Expects position to be a Vector2Int');
    }

    const cell = playerGrid[position.y][position.x];

    if (!cell) {
      throw new TypeError('Requested cell not found');
    }

    cell.classList.add('ship-unit');
  }

  function updateCell(of, position, flag) {
    assertEnum(Player.type, of, 'Player Type');
    assertEnum(Cell.cellFlag, flag, 'Cell Flag');

    if (!Vector2Int.isValid(position)) {
      throw new TypeError('Expects position to be a Vector2Int');
    }

    const grid = of === Player.type.human ? playerGrid : computerGrid;

    const cell = grid[position.y][position.x];

    if (!cell) {
      throw new TypeError('Requested cell not found');
    }

    cell.dataset.flag = flag;
  }

  function updateTurn(playerName) {
    turnIndicator.textContent = `${playerName}'s turn`;
  }

  function updateNames(playerName, computerName) {
    ui.querySelector('#player-name-bar').textContent = playerName;
    ui.querySelector('#computer-name-bar').textContent = computerName;
  }

  function updateHealth(of, health) {
    assertEnum(Player.type, of, 'Player Type');
    if (!Number.isFinite(health)) {
      throw new TypeError('Expects health to be a finite number');
    }

    const healthBar = of === Player.type.human ? playerHealthBar : computerHealthBar;

    health = health * 100;

    healthBar.style.width = `${health}%`;
    healthBar.dataset.status = health < 25 ? 'danger' : health < 50 ? 'caution' : 'safe';
  }

  function endCombat(winner) {
    if (!(winner instanceof Player)) {
      throw new TypeError('Expects player as the winner');
    }

    const [winTitle, winMessage, status] =
      winner.type === Player.type.human
        ? ['Victory!', 'You destroyed the enemy fleet.', 'victory']
        : ['Defeat!', 'Your fleet has been sunk.', 'defeat'];

    const gameOverPanel = ui.querySelector('#game-over-panel');
    const gameOverTitle = ui.querySelector('#game-over-title');
    const gameOverMessage = ui.querySelector('#game-over-message');
    const returnToMenuButton = ui.querySelector('#return-to-menu');
    const restartButton = ui.querySelector('#restart-game');

    gameOverPanel.showModal();
    gameOverPanel.dataset.status = status;
    gameOverMessage.textContent = winMessage;
    gameOverTitle.textContent = winTitle;

    returnToMenuButton.addEventListener('click', () => callListeners('return-to-menu'));
    restartButton.addEventListener('click', () => callListeners('restart'));
  }

  function callListeners(action) {
    const listenerList = listeners[action];

    if (!listenerList) {
      return;
    }

    for (let listener of listenerList) {
      listener?.();
    }
  }

  function on(listenerId, callback) {
    const listenerList = listeners[listenerId];

    if (!listenerList) {
      return;
    }

    listenerList.push(callback);
  }

  function setInputActive(active) {
    inputActive = active;
    if (active && currentHover) {
      currentHover.classList.add('hover');
    }
  }

  return {
    mount,
    unmount,
    showShipAt,
    setInputActive,
    updateTurn,
    updateCell,
    updateHealth,
    updateNames,
    endCombat,
    on,
  };
}

export { buildCombatView };
