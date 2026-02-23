import { createState } from "../../../core/state/state-factory";

describe('State factory: state creation', () => {
  test.each([1, undefined, null, [], {}])('should throw when type is %p', (type) => {
    expect(() => createState(type, {enter() {}})).toThrow(TypeError);
  });
  
  test('should throw when enter handler is missing', () => {
    expect(() => createState("A", {})).toThrow(Error);
  });

  test('should allow exit and update to be omitted', () => {
    const state = createState('A', {enter(){}});


    expect(state.exit).toBeUndefined();
    expect(state.update).toBeUndefined();
  });
  
  test('should throw when enter handler is not a function', () => {
    expect(() => createState("A", {enter: 10})).toThrow(Error);
    expect(() => createState("A", {enter: null})).toThrow(Error);
    expect(() => createState("A", {enter: undefined})).toThrow(Error);
    expect(() => createState("A", {enter: []})).toThrow(Error);
    expect(() => createState("A", {enter: {}})).toThrow(Error);
  });

  test('should create a valid frozen state', () => {
    const enter = jest.fn();
    const exit = jest.fn();
    const update = jest.fn();

    const state = createState('A', { enter, exit, update });

    expect(state.type).toBe('A');
    expect(state.enter).toBe(enter);
    expect(state.exit).toBe(exit);
    expect(state.update).toBe(update);
    expect(state.toString()).toBe('A');
    expect(Object.isFrozen(state)).toBe(true);
  });

  test('should not allow mutation', () => {
    const state = createState('A', { enter() {} });
    expect(() => {
        state.type = 'B';
    }).toThrow(TypeError);
  });
});
