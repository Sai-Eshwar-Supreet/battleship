function createState(type, { enter, exit, update }) {
  if (typeof type !== 'string') {
    throw new TypeError('State type must be a string');
  }

  if (typeof enter !== 'function') {
    throw new Error(`State ${type} must implement enter()`);
  }

  return Object.freeze({ type, enter, exit, update, toString: () => type });
}

export { createState };
