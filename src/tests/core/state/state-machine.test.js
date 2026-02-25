import { createState } from "../../../core/state/state-factory";
import { StateMachine } from "../../../core/state/state-machine";

describe('State machine: request state', () => {
  let stateMachine;

  beforeEach(() => stateMachine = new StateMachine())

  test('should throw when state machine is not started', () => {
    stateMachine.addState(() => createState('Init', {enter(){}}));
    expect(() => stateMachine.requestState('Init')).toThrow(Error);
  });

  test('should throw when requested state is not a string', () => {
    stateMachine.addState(() => createState('Init', {enter(){}}));
    stateMachine.start('Init');
    expect(() => stateMachine.requestState({})).toThrow(TypeError);
    expect(() => stateMachine.requestState(null)).toThrow(TypeError);
    expect(() => stateMachine.requestState(undefined)).toThrow(TypeError);
  });
  
  test('should throw when requested state is not available for transition', () => {
    stateMachine.addState(() => createState('Init', {enter(){}}));
    stateMachine.start('Init');
    expect(() => stateMachine.requestState('A')).toThrow(Error);
    expect(() => stateMachine.requestState('B')).toThrow(Error);
    expect(() => stateMachine.requestState('C')).toThrow(Error);
  });
  
  test('should succeed when requested state is available for transition', () => {
    stateMachine.addState(() => createState('A', {enter() {}}));
    stateMachine.start('A');
    stateMachine.requestState('A');
    expect(stateMachine.pendingStateType).toBe('A');
  });
  
  test('should throw when a request is raised when another request is pending', () => {
    stateMachine.addState(() => createState('A', {enter() {}}));
    stateMachine.addState(() => createState('B', {enter() {}}));
    stateMachine.start('A');
    stateMachine.requestState('A');
    expect(() => stateMachine.requestState('B')).toThrow(Error);
  });
  
  test('should resolve to a valid request', () => {
    stateMachine.addState(() => createState('A', {enter() {}}));
    stateMachine.start('A');
    stateMachine.requestState('A');
    expect(stateMachine.pendingStateType).toBe('A');
  });
});

describe('State machine: start', () => {
  let stateMachine;

  beforeEach( () => stateMachine = new StateMachine());

  test('should only start once', () => {
    stateMachine.addState(() => createState('A', {enter(){}}));

    stateMachine.start('A');
    expect(() => stateMachine.start('A')).toThrow(Error);
  });

  test('should only start an available state', () => {
    stateMachine.addState(() => createState('A', {enter(){}}));
    
    expect(() => stateMachine.start('B')).toThrow(Error);

    expect(stateMachine.currentStateType).toBe(null);
    stateMachine.start('A');
    expect(stateMachine.currentStateType).toBe('A');
  });
});

describe('State machine: Update', () => {
  let stateMachine;

  beforeEach( () => stateMachine = new StateMachine());
  
  test('should update the current state when state machine is updated', () => {
    const enter = jest.fn();
    const update = jest.fn();

    stateMachine.addState(() => createState('A', {enter, update}));
    stateMachine.start('A');

    stateMachine.update(100);

    expect(update).toHaveBeenCalledWith(100);
  });

  

  test('should switch to the requested state on the next update call', () => {
    const enterA = jest.fn();
    const updateA = jest.fn();
    const exitA = jest.fn();

    const enterB = jest.fn();
    const updateB = jest.fn();
    const exitB = jest.fn();

    stateMachine.addState(() => createState('A', {enter: enterA, exit: exitA, update: updateA}));
    stateMachine.addState(() => createState('B', {enter: enterB, exit: exitB, update: updateB}));

    stateMachine.start('A');
    expect(stateMachine.currentStateType).toBe('A');
    
    expect(enterA).toHaveBeenCalledTimes(1);
    expect(updateA).toHaveBeenCalledTimes(0);
    expect(exitA).toHaveBeenCalledTimes(0);

    expect(enterB).toHaveBeenCalledTimes(0);
    expect(updateB).toHaveBeenCalledTimes(0);
    expect(exitB).toHaveBeenCalledTimes(0);
    
    stateMachine.requestState('B');
    expect(stateMachine.pendingStateType).toBe('B');

    stateMachine.update(100);
    expect(stateMachine.currentStateType).toBe('B');
    expect(stateMachine.pendingStateType).toBe(null);

    expect(updateA).toHaveBeenCalledWith(100);
    
    expect(enterA).toHaveBeenCalledTimes(1);
    expect(updateA).toHaveBeenCalledTimes(1);
    expect(exitA).toHaveBeenCalledTimes(1);

    expect(enterB).toHaveBeenCalledTimes(1);
    expect(updateB).toHaveBeenCalledTimes(0);
    expect(exitB).toHaveBeenCalledTimes(0);
  });
});

describe('State machine: onTransition', () => {
  
  let stateMachine;

  beforeEach( () => stateMachine = new StateMachine());

  test('should throw on invalid callback', () => {
    expect(() => stateMachine.onTransition('A')).toThrow(TypeError);
    expect(() => stateMachine.onTransition(undefined)).toThrow(TypeError);
    expect(() => stateMachine.onTransition(null)).toThrow(TypeError);
    expect(() => stateMachine.onTransition({})).toThrow(TypeError);
  });

  test('should call all callbacks on transition', () => {

    stateMachine.addState(() => createState('A', {enter() {}}));
    stateMachine.addState(() => createState('B', {enter() {}}));

    stateMachine.start('A');

    const callbackA = jest.fn();
    const callbackB = jest.fn();

    stateMachine.onTransition(callbackA);
    stateMachine.onTransition(callbackB);

    stateMachine.requestState('B')
    stateMachine.update(100);
    stateMachine.requestState('A')
    stateMachine.update(100);

    expect(callbackA).toHaveBeenCalledTimes(2);
    expect(callbackA).toHaveBeenCalledWith('A', 'B');
    expect(callbackA).toHaveBeenCalledWith('B', 'A');

    expect(callbackB).toHaveBeenCalledTimes(2);
    expect(callbackB).toHaveBeenCalledWith('A', 'B');
    expect(callbackB).toHaveBeenCalledWith('B', 'A');
  });
});
