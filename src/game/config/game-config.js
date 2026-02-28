export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 10;

function createFleetConfig(id, length) {
  return Object.freeze({ id, length});
}

export const FLEET_CONFIG = Object.freeze([
  createFleetConfig('carrier', 5),
  createFleetConfig('battleship', 4),
  createFleetConfig('destroyer', 3),
  createFleetConfig('submarine', 3),
  createFleetConfig('patrol', 2),
]);