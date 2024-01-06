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
 *   map       : function(function(T): any): Signal<any>
 * } & Function } Signal
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

  function getset() {
    if (arguments.length) {
      value = arguments[0];

      for (const subscriber of subscribers) {
        subscriber.next(value);
      }

    } else {
      return value;
    }
  }

  /** @param { Subscriber<T> } sub  */
  const subscribe = (sub) => {
    subscribers.push(sub);
  };

  return Object.assign(getset, {
    signal: options.name ?? '',
    subscribe,

    /** @param { function(T): Signal<any> } fn */
    map: (fn) => {
      const mapped = signal(fn(value));

      subscribe({ next: (v) => mapped(fn(v)) });

      return mapped;
    }
  });
}

export function isSignal(s) {
  return s && s.subscribe;
}