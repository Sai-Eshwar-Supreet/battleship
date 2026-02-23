import { State } from "../../../core/state/state";

describe('State creation', () => {
  test.each([1, undefined, null, [], {}])('should throw when type is %p', (type) => {
    expect(() => new State(type)).toThrow(TypeError);
  });
});
