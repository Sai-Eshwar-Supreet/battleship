import { eventBus } from '../../../core/events/event-bus';

describe('EventBus: subscription (on)', () => {
  afterEach(() => {
    eventBus.clear();
  });

  test('should throw if type is not a string', () => {
    expect(() => eventBus.on(null, () => {})).toThrow(TypeError);
    expect(() => eventBus.on(undefined, () => {})).toThrow(TypeError);
    expect(() => eventBus.on({}, () => {})).toThrow(TypeError);
  });

  test('should throw if one or more handlers are not functions', () => {
    expect(() => eventBus.on('SUBSCRIBE_EVENT', null)).toThrow(TypeError);
    expect(() => eventBus.on('SUBSCRIBE_EVENT', () => {}, undefined)).toThrow(TypeError);
    expect(() => eventBus.on('SUBSCRIBE_EVENT', undefined, () => {}, null )).toThrow(TypeError);
  });

  test('should throw if no handlers are provided', () => {
    expect(() => eventBus.on('SUBSCRIBE_EVENT')).toThrow(RangeError);
  });

  test('should register a handler for a new event type', () => {
    const handler = jest.fn();

    eventBus.on('SUBSCRIBE_EVENT', handler);
    eventBus.emit('SUBSCRIBE_EVENT');

    expect(handler).toHaveBeenCalledTimes(1);
  });

  test('should allow multiple handlers for the same event', () => {
    const handlerA = jest.fn();
    const handlerB = jest.fn();

    eventBus.on('SUBSCRIBE_EVENT', handlerA, handlerB);
    eventBus.emit('SUBSCRIBE_EVENT');

    expect(handlerA).toHaveBeenCalledTimes(1);
    expect(handlerB).toHaveBeenCalledTimes(1);
  });

  test('should allow handlers to be added incrementally', () => {
    const handlerA = jest.fn();
    const handlerB = jest.fn();

    eventBus.on('SUBSCRIBE_EVENT', handlerA);
    eventBus.on('SUBSCRIBE_EVENT', handlerB);

    eventBus.emit('SUBSCRIBE_EVENT');

    expect(handlerA).toHaveBeenCalledTimes(1);
    expect(handlerB).toHaveBeenCalledTimes(1);
  });
});

describe('EventBus: un-subscription (off)', () => {
  afterEach(() => {
    eventBus.clear();
  });
  
  test('should throw if type is not a string', () => {
    expect(() => eventBus.off(null, () => {})).toThrow(TypeError);
    expect(() => eventBus.off(undefined, () => {})).toThrow(TypeError);
    expect(() => eventBus.off({}, () => {})).toThrow(TypeError);
  });
  
  test('should throw if handler is not a function', () => {
    expect(() => eventBus.off('SUBSCRIBE_EVENT', null)).toThrow(TypeError);
    expect(() => eventBus.off('SUBSCRIBE_EVENT', undefined)).toThrow(TypeError);
    expect(() => eventBus.off('SUBSCRIBE_EVENT', {} )).toThrow(TypeError);
  });

  test('should remove a specific handler', () => {
    const handlerA = jest.fn();
    const handlerB = jest.fn();

    eventBus.on('REMOVE_EVENT', handlerA, handlerB);
    eventBus.off('REMOVE_EVENT', handlerB);

    eventBus.emit('REMOVE_EVENT');

    expect(handlerA).toHaveBeenCalledTimes(1);
    expect(handlerB).not.toHaveBeenCalled();
  });

  test('should do nothing when removing from an unknown event type', () => {
    expect(() => eventBus.off('UNKNOWN_EVENT', () => {})).not.toThrow();
  });

  test('should do nothing if handler does not exist', () => {
    const handlerA = jest.fn();
    const handlerB = jest.fn();

    eventBus.on('REMOVE_EVENT', handlerA);
    eventBus.off('REMOVE_EVENT', handlerB);

    eventBus.emit('REMOVE_EVENT');

    expect(handlerA).toHaveBeenCalledTimes(1);
  });
});

describe('EventBus: emission (emit)', () => {
  
  afterEach(() => eventBus.clear());

  test('should throw if type is not a string', () => {
    expect(() => eventBus.emit(null)).toThrow(TypeError);
    expect(() => eventBus.emit(undefined)).toThrow(TypeError);
    expect(() => eventBus.emit({})).toThrow(TypeError);
  });

  test('should pass data to handlers', () => {
    const handler= jest.fn();
    const payload = {data: "emit"};

    eventBus.on('EMIT_EVENT', handler);

    eventBus.emit('EMIT_EVENT', payload);

    expect(handler).toHaveBeenCalledWith(payload);
  });

  test('should not throw when emitting an event with no handlers', () => {
    expect(() => eventBus.emit('EMIT_EVENT', {})).not.toThrow();
  });  
});

describe('EventBus: clear', () => {

  test('should remove all handlers for all events', () => {
    const handlerA = jest.fn();
    const handlerB = jest.fn();

    eventBus.on('EVENT_A', handlerA);
    eventBus.on('EVENT_B', handlerB);

    eventBus.clear();

    eventBus.emit('EVENT_A');
    eventBus.emit('EVENT_B');

    expect(handlerA).not.toHaveBeenCalled();
    expect(handlerB).not.toHaveBeenCalled();
  });

  test('should allow reuse after clear', () => {
    const handler = jest.fn();

    eventBus.on('RESET_EVENT', handler);
    eventBus.clear();

    eventBus.on('RESET_EVENT', handler);
    eventBus.emit('RESET_EVENT');

    expect(handler).toHaveBeenCalledTimes(1);
  });
});