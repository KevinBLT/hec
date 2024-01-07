/**
 * @template T
 * @typedef {{ 
 *   next: function(T): void 
 * }} Subscriber
 */


/**
 * @template T
 * @typedef {{ 
 *   signal    : string,
 *   subscribe : function(Subscriber<T>): void,
 *   map       : <V>(fn: (value: T) => V) => Signal<V>
 *   update    : (value: T) => void
 * } & ((newValue?: T | undefined) => T) } Signal
 */

/**
 * @template T
 * @param { T } value 
 * @param {{ name?: string }} options 
 * @returns { Signal<T> }
 */
export function signal(value, options = {}) {  

  /** @type { Subscriber<T>[] } */
  const subscribers = [];

  /** @param { T } v */
  const update = (v) => {
    value = v;

    for (const subscriber of subscribers) {
      subscriber.next(value);
    }
  }

  function getset() {
    
    if (arguments.length && value != arguments[0]) {
      update(arguments[0]);
    } 

    return value;
  }

  /** @param { Subscriber<T> } sub  */
  const subscribe = (sub) => {
    subscribers.push(sub);
  };

  return Object.assign(getset, {
    signal: options.name ?? '',
    toString: () => value.toString(),
    update,
    subscribe,

    /**
     * @template V
     * @param { (value: T) => V } fn 
     * @returns { Signal<V> } 
     */
    map: (fn) => {
      const mapped = signal(fn(value), { name: options.name + '#mapped:' });

      subscribe({ next: (v) => mapped(fn(v)) });

      return mapped;
    }
  });
}

/**
 * @template T
 * @param { (pre: T) => T } fn 
 * @param { Signal<any>[] } signals 
 * @param { T | undefined } initialValue 
 * @returns { T }
 */
export function effect(fn, signals = [], initialValue = null) {

  for (const signal of signals) {
    signal.subscribe({ 
      next: () => initialValue = fn(initialValue) 
    });
  }

  return fn(initialValue);
}

/**
 * @template T
 * @param { (pre: T) => T } fn 
 * @param { Signal<any>[] } signals 
 * @returns { Signal<T> }
 */
export function memo(fn, signals = []) {
  const v = signal(null);

  v(effect(() => v(fn(v())), signals));
  
  return v;
}

/**
 * @param {any} s 
 * @returns {boolean} 
 */
export function isSignal(s) {
  return s && s.subscribe;
}