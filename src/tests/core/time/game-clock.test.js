import { GameClock } from "../../../core/time/game-clock";

describe('GameClock: delay', () => {

  let gameClock;

  beforeEach(() => gameClock = new GameClock());

  afterEach(() => {
      jest.useRealTimers();
      jest.clearAllTimers();
  });

  test('should throw if GameClock is disposed', () => {
    gameClock.dispose();
    expect(() => gameClock.delay(1000, () => {})).toThrow(Error);
  });
  
  test.each([-100, 0, NaN, null, undefined, {}, [], Infinity, false])('should throw when delay ms is %p', (ms) => {
    expect(() => gameClock.delay(ms, () => {})).toThrow(TypeError);
  });
  
  test('should throw if callback is not a function', () => {
    expect(() => gameClock.delay(1000, null)).toThrow(TypeError);
    expect(() => gameClock.delay(1000, undefined)).toThrow(TypeError);
    expect(() => gameClock.delay(1000, {})).toThrow(TypeError);
  });
  
  test('should run the callback after delay', () => {
    jest.useFakeTimers();

    const handler = jest.fn();

    gameClock.delay(500, handler);
    expect(handler).not.toHaveBeenCalled();

    jest.advanceTimersByTime(500);

    expect(handler).toHaveBeenCalledTimes(1);
  });
  
  test('should return the timer id', () => {
    const timerId = gameClock.delay(500, () => {});
    expect(timerId).toBeDefined();
  });
  
  test('should allow delay again after reset', () => {
    jest.useFakeTimers();

    const handler = jest.fn();

    gameClock.dispose();
    gameClock.reset();

    gameClock.delay(100, handler);
    jest.advanceTimersByTime(100);

    expect(handler).toHaveBeenCalledTimes(1);
  });
});

describe('GameClock: cancel', () => {
  let gameClock;
  
  beforeEach(() => gameClock = new GameClock());

  afterEach(() => {
      jest.useRealTimers();
      jest.clearAllTimers();
  });

  test('should return false for invalid timerID', () => {
    expect(gameClock.cancel(undefined)).toBe(false);
    expect(gameClock.cancel(null)).toBe(false);
    expect(gameClock.cancel({})).toBe(false);
  });
  

  test('should not call callback on successful cancellation', () => {
    jest.useFakeTimers();

    const handler = jest.fn();
    const timerID = gameClock.delay(500, handler);
    gameClock.cancel(timerID);

    jest.advanceTimersByTime(600);
    expect(handler).not.toHaveBeenCalled();
  });

  test('should return true on successful cancellation', () => {
    const timerID = gameClock.delay(500, () => {});

    expect(gameClock.cancel(timerID)).toBe(true);
  });

  test('should return false if timerID does not exist', () => {
    const timerID = gameClock.delay(500, () => {});

    expect(gameClock.cancel(timerID)).toBe(true);
    expect(gameClock.cancel(timerID)).toBe(false);
  });

  test('should throw if GameClock is disposed', () => {
    const timerId = gameClock.delay(1000, () =>  {});
    
    gameClock.dispose();

    expect(() => gameClock.cancel(timerId)).toThrow(Error);
  });

});

describe('GameClock: cancelAll', () => {
  let gameClock;

  beforeEach(() => gameClock = new GameClock());

  afterEach(() => {
      jest.useRealTimers();
      jest.clearAllTimers();
  });
  

  test('should throw if GameClock is disposed', () => {
    gameClock.dispose();
    expect(() => gameClock.cancelAll()).toThrow(Error);
  });

  test('should cancel all running timers', () => {
    jest.useFakeTimers();

    const handlerA = jest.fn();
    const handlerB = jest.fn();

    gameClock.delay(5000, handlerA);
    gameClock.delay(5000, handlerB);

    gameClock.cancelAll();
    
    jest.advanceTimersByTime(6000);

    expect(handlerA).not.toHaveBeenCalled();
    expect(handlerB).not.toHaveBeenCalled();
  });  
});

describe('GameClock: reset', () => {
  let gameClock;

  beforeEach(() => gameClock = new GameClock());

  afterEach(() => {
      jest.useRealTimers();
      jest.clearAllTimers();
  });

  test('should cancel all running timers', () => {
    jest.useFakeTimers();

    const handlerA = jest.fn();
    const handlerB = jest.fn();

    gameClock.delay(5000, handlerA);
    gameClock.delay(5000, handlerB);

    gameClock.reset();
    
    jest.advanceTimersByTime(6000);

    expect(handlerA).not.toHaveBeenCalled();
    expect(handlerB).not.toHaveBeenCalled();
  });  

  test('should not be disposed', () => {
    gameClock.reset();
    expect(gameClock.disposed).toBe(false);
  }); 

  test('should be able to reset after disposing', () => {
    gameClock.dispose();
    expect(gameClock.disposed).toBe(true);
    gameClock.reset();
    expect(gameClock.disposed).toBe(false);
  }); 
});

describe('GameClock: dispose', () => {
  let gameClock;

  beforeEach(() => gameClock = new GameClock());

  afterEach(() => {
      jest.useRealTimers();
      jest.clearAllTimers();
  });

  test('should cancel all running timers', () => {
    jest.useFakeTimers();

    const handlerA = jest.fn();
    const handlerB = jest.fn();

    gameClock.delay(5000, handlerA);
    gameClock.delay(5000, handlerB);

    gameClock.dispose();
    
    jest.advanceTimersByTime(6000);

    expect(handlerA).not.toHaveBeenCalled();
    expect(handlerB).not.toHaveBeenCalled();
  });  

  test('should be disposed', () => {
    gameClock.dispose();
    expect(gameClock.disposed).toBe(true);
  });

  test('should throw when disposing an already disposed timer', () => {
    gameClock.dispose();
    expect(() => gameClock.dispose()).toThrow(Error);
  });
});