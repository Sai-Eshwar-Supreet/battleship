import { State } from "./state";

function createState(type, { enter, exit, update }) {
  if (typeof enter !== 'function') {
    throw new Error(`State ${type} must implement enter()`);
  }

  return Object.freeze(Object.assign(new State(type), {enter, exit, update}));
}

export { createState };
