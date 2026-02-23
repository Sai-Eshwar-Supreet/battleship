import { StateDictionary } from "../../../core/state/state-dictionary";
import { createState } from "../../../core/state/state-factory";

describe('State dictionary: state addition', () => {
  let stateDictionary;

  beforeEach(() => stateDictionary = new StateDictionary());

  test('should throw when factory is not a function', () => {
    expect(() => stateDictionary.addState(createState('A', {enter() {}}))).toThrow(TypeError);
    expect(() => stateDictionary.addState(null)).toThrow(TypeError);
    expect(() => stateDictionary.addState(undefined)).toThrow(TypeError);
  });

  test('should throw when factory returns invalid states', () => {
    expect(() => stateDictionary.addState(() => null)).toThrow(Error);
    expect(() => stateDictionary.addState(() => undefined)).toThrow(Error);
    expect(() => stateDictionary.addState(() => {})).toThrow(Error);
    expect(() => stateDictionary.addState(() => {
        return {type: "A"}
    })).toThrow(Error);
  });

  test('should contain the state after addition', () => {
    const factory = () => createState('A', {enter() {}});

    stateDictionary.addState(factory);

    expect(stateDictionary.contains('A')).toBe(true);
    expect(stateDictionary.length).toBe(1);
});

test('should return true if the state is successfully added', () => {
    const factory = () => createState('A', {enter() {}});
    expect(stateDictionary.addState(factory)).toBe(true);
    expect(stateDictionary.length).toBe(1);
});

  test('should throw on addition of duplicate states', () => {
    const factory = () => createState('A', {enter() {}});
    const factoryDuplicate = () => createState('A', {enter() {}});
    expect(stateDictionary.addState(factory)).toBe(true);
    expect(() => stateDictionary.addState(factoryDuplicate)).toThrow(Error);
  });
});


describe('State dictionary: state removal', () => {

  let stateDictionary;

  beforeEach(() => stateDictionary = new StateDictionary());

  test('should throw when type is not a string', () => {
    expect(() => stateDictionary.removeState(null)).toThrow(TypeError);
    expect(() => stateDictionary.removeState(undefined)).toThrow(TypeError);
    expect(() => stateDictionary.removeState({})).toThrow(TypeError);
  });

  test('should return true on deletion', () => {
    const factory = () => createState('A', {enter() {}});
    stateDictionary.addState(factory);

    expect(stateDictionary.removeState('A')).toBe(true);
    expect(stateDictionary.length).toBe(0);
  });
  
  test('should remove only once', () => {
    const factory = () => createState('A', {enter() {}});
    stateDictionary.addState(factory);

    expect(stateDictionary.removeState('A')).toBe(true);
    expect(stateDictionary.length).toBe(0);
    expect(stateDictionary.removeState('A')).toBe(false);
    expect(stateDictionary.length).toBe(0);
  });
  
  test('should return false if key doesn\'t exist', () => {
    expect(stateDictionary.removeState('A')).toBe(false);
  });
});

describe('State dictionary: state getter', () => {

  let stateDictionary;

  beforeEach(() => stateDictionary = new StateDictionary());

  test('should throw when type is not a string', () => {
    expect(() => stateDictionary.getState(null)).toThrow(TypeError);
    expect(() => stateDictionary.getState(undefined)).toThrow(TypeError);
    expect(() => stateDictionary.getState({})).toThrow(TypeError);
  });

  test('should return appropriate state', () => {
    const enter = jest.fn();
    const factory = () => createState('A', {enter});
    stateDictionary.addState(factory);

    const state = stateDictionary.getState('A');

    expect(state.type).toEqual('A');
    expect(state.toString()).toEqual('A');
    expect(state.enter).toBe(enter);
    expect(state.exit).toBeUndefined();
    expect(state.update).toBeUndefined();
  });

  test('should return null if state is not available', () => {
    expect(stateDictionary.getState('A')).toBe(null);
  });
});

describe('State dictionary: clear', () => {
  let stateDictionary;

  beforeEach(() => stateDictionary = new StateDictionary());

  test('should remove all states on clear', () => {
    const enter = jest.fn();

    for(let i = 0; i < 5; i++){
        const factory = () => createState(`State ${i + 1}`, {enter});
        stateDictionary.addState(factory);
    }

    expect(stateDictionary.length).toBe(5);
    stateDictionary.clear();
    expect(stateDictionary.length).toBe(0);
  });
  
});


describe('State dictionary: contains', () => {
  let stateDictionary;

  beforeEach(() => stateDictionary = new StateDictionary());

  test('should remove all states on clear', () => {
    const enter = jest.fn();

    for(let i = 0; i < 3; i++){
        const factory = () => createState(`State ${i + 1}`, {enter});
        stateDictionary.addState(factory);
    }

    expect(stateDictionary.contains('State 1')).toBe(true);
    expect(stateDictionary.contains('State 2')).toBe(true);
    expect(stateDictionary.contains('State 3')).toBe(true);
    stateDictionary.clear();
    expect(stateDictionary.contains('State 1')).toBe(false);
    expect(stateDictionary.contains('State 2')).toBe(false);
    expect(stateDictionary.contains('State 3')).toBe(false);
  });
  
});