import { f } from "./props.js";

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
 *   subscribe : (functions: Subscriber<T>, options?: { signal: AbortSignal }) => void,
 *   map       : <V>(fn: (value: T) => V) => Signal<V>
 *   filter    : (fn: (value: T) => boolean) => Signal<T>
 *   set       : (value: T) => void
 *   update    : (value: T) => void
 * } & ((newValue?: T | undefined) => T) } Signal
 */

/**
 * @template T
 * @param { T } value 
 * @param {{ name?: string }} options 
 * @returns { Signal<T> }
 */
export function signal(value = null, options = {}) {  

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

  /** 
   * @param { Subscriber<T> } subscription 
   * @param { { signal: AbortSignal } | undefined } options  
   */
  const subscribe = (subscription, options = null) => {
    subscribers.push(subscription);

    options?.signal.addEventListener('abort', () => {
      const index = subscribers.indexOf(subscription);

      if (index > -1) {
        subscribers.splice(index, 1);
      }

    }, { once: true});
  };

  return Object.assign(getset, {
    signal: options.name ?? '',
    toString: () => value.toString(),
    set: (v) => value = v,
    update,
    subscribe,

    /**
     * @template V
     * @param { (value: T) => V } fn 
     * @returns { Signal<V> } 
     */
    map: (fn) => {
      const mapped = signal(fn(value));

      subscribe({ next: (v) => mapped(fn(v)) });

      return Object.assign({ set: () => null, mapped });
    },

    /**
     * @param { (value: T) => boolean } fn 
     * @returns { Signal<T> } 
     */
    filter: (fn) => {
      const filtered = signal(fn(value) ? value : null);
   
      subscribe({ next: (v) => fn(v) ? filtered(v) : null });

      return Object.assign({ set: () => null, filtered });
    }
  });
}

/**
 * @template T
 * @param { (pre: T) => T } fn 
 * @param { Signal<any>[] } signals 
 * @param { T | undefined } value 
 * @returns { T }
 */
export function effect(fn, signals = [], value = null) {

  for (const signal of signals) {
    signal.subscribe({ 
      next: () => value = fn(value) 
    });
  }

  return fn(value);
}

/**
 * @template T
 * @param { (pre: T) => T } fn 
 * @param { Signal<any>[] } signals 
 * @param { T | undefined } value 
 * @returns { Signal<T> }
 */
export function memo(fn, signals = [], value = null) {
  const v = signal(null);
  
  v(effect((pre) => v(fn(pre)), signals, value));
  
  return v;
}

/**
 * @template T
 * @typedef {{ 
 *   error: Signal<null | string>,
 *   loading: Signal<boolean>,
 *   refetch: () => Promise<T | undefined>
 * } & Signal<T>} AsyncSignal 
 */

/** 
 * @template T
 * @param { () => Promise<T> } fetch 
 * @param { T } initialValue 
 * @returns { AsyncSignal<T> }
 */
export function resource(fetch, initialValue = null) {

  /** @type { Signal<T> } */
  const value   = signal(initialValue);
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

  return Object.assign(value, {loading, error, refetch: update });
}

/**
 * @template P
 * @template T
 * @param { P } prop 
 * @param { (value: P) => Promise<T> } fetch
 * @param { T } initialValue 
 * @returns { AsyncSignal<T> }
*/
export function resourceBy(prop, fetch, initialValue = null) {
  const r = resource(() => fetch(f(prop)), initialValue);
  
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