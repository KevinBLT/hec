import { f } from "./value.js";

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
 *   filter    : (fn: (value: T) => boolean) => Signal<T>
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
    
    if (arguments.length && value !== arguments[0]) {
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
      const mapped = signal(fn(value), { name: options.name + '#map->' });

      subscribe({ next: (v) => mapped(fn(v)) });

      return mapped;
    },

    /**
     * @param { (value: T) => boolean } fn 
     * @returns { Signal<T> } 
     */
    filter: (fn) => {
      const filtered = signal(fn(value) ? value : null, { name: options.name + '#filter->' });

      subscribe({ next: (v) => fn(v) ? filtered(v) : null });

      return filtered;
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
 * @template T
 * @typedef {{ 
 *   value: Signal<T>, 
 *   error: Signal<null | string>,
 *   loading: Signal<boolean>,
 *   refetch: () => Promise<T | undefined>
 * }} Resource 
 */

/** 
 * @template T
 * @param { () => Promise<T> } fetch 
 * @returns { Resource<T> }
 */
export function resource(fetch) {

  /** @type { Signal<T> } */
  const value   = signal(null);
  const loading = signal(true);
  const error   = signal(null);

  const update = async () => {
    
    try {
      value(await fetch());
      loading(false);
    } catch (error) {
      error(error);
    }

    return value();
  }

  update();

  return { value, loading, error, refetch: update };
}

/**
 * @template P
 * @template T
 * @param { P } prop 
 * @param { (value: P) => Promise<T> } fetch 
 * @returns { Resource<T> }
*/
export function resourceBy(prop, fetch) {
  const r = resource(() => fetch(f(prop)));
  
  if (isSignal(prop)) {
    prop.subscribe({ next: () => r.refetch() });
  }

  return r;
}

/**
 * @template T
 * @param { any | Signal<T> } s 
 * @returns { s is Signal<T> } 
 */
export const isSignal = (s) => s && s.subscribe;