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
 *   id        : string | undefined,
 *   storage   : 'local' | 'session' | undefined, 
 *   subscribe : (functions: Subscriber<T>, options?: { signal: AbortSignal }) => void,
 *   map       : <V>(fn: (value: T) => V) => Signal<V>,
 *   filter    : (fn: (value: T) => boolean) => Signal<T>,
 *   set       : (value: T) => void,
 *   update    : (value: T) => void,
 * } & ((newValue?: T | undefined) => T) } Signal
 */

/** 
 * @template T
 * @typedef { (subcription: Subscriber<T>, options?: { signal: AbortSignal } | undefined) => void } SubscribeFn
 */

/** @type { Storage } */
const sharedStorage = {
  items: new Map(),
  
  setItem(key, value) {
    this.items.set(key, value?.toString());
  },

  get length() {
    return this.items.keys().length;
  },

  key(index) {
    return Array.from(this.items.values()).at(index);
  },

  clear() {
    this.items.clear();
  },

  getItem(key) {
    return this.items.get(key);
  },

  removeItem(key) {
    this.items.delete(key);
  }
}

/** @type { Map<string, Signal<any>> } */
const sharedSignals = new Map();

/**
 * @param { 'local' | 'session' } name
 * @returns { Storage }
 */
function storageByName(name) {

  try {
    const storage = window[name + 'Storage'];

    return typeof storage.length == 'number' ? storage : sharedStorage;
  } catch (error) {
    return sharedStorage;
  }
}

window.addEventListener('storage', (storageEvent) => {
  
  if (!sharedSignals.has(storageEvent.key)) {
    return;
  }

  const signal = sharedSignals.get(storageEvent.key),
        stored = storageEvent.storageArea.getItem(storageEvent.key);

  if (typeof stored === 'string' && stored !== 'undefined') {
    signal.update(JSON.parse(stored));
  } 

});

/**
 * @template T
 * @param { T } value 
 * @param {{ id?: string, storage?: 'local' | 'session' }} options 
 * @returns { Signal<T> }
 */
export function signal(value = null, options = {}) {  

  if (options.id && sharedSignals.has(options.id)) {
    const sharedSignal = sharedSignals.get(options.id);

    sharedSignal(value);

    return sharedSignal;
  }

  /** @type { Subscriber<T>[] } */
  const subscribers = [],
        storage     = options.storage && storageByName(options.storage);

  /** @param { T | undefined } v */
  const update = (v) => {
    value = v;

    if (storage) {
      if (v === null || v === undefined) {
        storage.removeItem(options.id);
      } else {
        storage.setItem(options.id, JSON.stringify(value));
      }
    }

    for (const subscriber of subscribers) {
      subscriber.next(value);
    }
  }

  function __signal() {
    
    if (arguments.length && value !== arguments[0]) {
      update(arguments[0]);
    } 

    return value;
  }

  /** @type { SubscribeFn<T> } */
  const subscribe = (subscription, options = null) => {
    subscribers.push(subscription);

    options?.signal.addEventListener('abort', () => {
      const index = subscribers.indexOf(subscription);

      if (index > -1) {
        subscribers.splice(index, 1);
      }

    }, { once: true});
  };

  if (storage) {
    const stored = storage.getItem(options.id);
     
    if (typeof stored === 'string' && stored !== 'undefined') {
      update(JSON.parse(stored));
    } else {
      update(value);
    }
  }

  const s = Object.assign(__signal, {
    id: options.id,
    storage: options.storage,
    toString: () => value?.toString(),
    set: (v) => value = v,
    update,
    subscribe,

    /**
     * @template V
     * @param { (value: T) => V } fn 
     * @returns { Signal<V> } 
     */
    map: (fn) => {
      const mapped = signal(fn(value)),
            abort  = new AbortController(),
            sub    = mapped.subscribe;

      subscribe({ next: (v) => mapped(fn(v)) }, { signal: abort.signal });

      return Object.assign(mapped, { 
        set: () => null,

        /** @type { SubscribeFn<V> } */
        subscribe: (subscription, options) => {
          sub(subscription, options);
          options?.signal.addEventListener('abort', () => abort.abort());
        }

      });
    },

    /**
     * @param { (value: T) => boolean } fn 
     * @returns { Signal<T> } 
     */
    filter: (fn) => {
      const filtered = signal(fn(value) ? value : null);
   
      subscribe({ next: (v) => fn(v) ? filtered(v) : null });

      return Object.assign(filtered, { set: () => null });
    }
  });

  if (options.id) {
    sharedSignals.set(options.id, s);
  }

  return s;
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
 *   state: Signal<'pending' | 'error' | 'loaded'>,
 *   error?: string,
 *   refetch: () => Promise<T | undefined>
 * } & Signal<T>} Resource
 */

/**
 * @typedef { Signal<'pending' | 'error' | 'loaded'> } ResourceState 
 */

/** 
 * @template T
 * @param { (param?: any) => Promise<T> | T } fetch 
 * @param { T } initialValue 
 * @returns { Resource<T> }
 * 
 * @description 
 * A signal that is given a fetch function to retrieve a value.
 * The resulting signal is then updated, once the fetch function
 * is completed.
 * 
 * The resource can have three states 
 * - `loaded`: Everything loaded
 * - `pending`: the fetcher is executing, stale data might be seen
 * - `error` an error occured and the error message is given in the error property
 */
export function resource(fetch, initialValue = null) {

  /** @type { Resource<T> } } */
  const value = Object.assign(signal(initialValue), { state: null, refetch: null, error: null });

  /** @type { ResourceState } */
  const state = signal('loaded');

  const update = async (param = null) => {

    if (state() == 'pending') {
      return;
    }
    
    try {
      state('pending');

      const data = await fetch(param);

      state('loaded');

      delete value.error;
      
      value(data);

    } catch (error) {
      console.error(error);

      state('error');

      value.error = error;
    }

    return value();
  }

  value.state   = state;
  value.refetch = update;

  update();

  return value;
}

/**
 * @template P
 * @template T
 * @param { Signal<P> | P } prop 
 * @param { (value: P) => Promise<T> | T } fetch
 * @param { T } initialValue 
 * @returns { Resource<T> }
*/
export function resourceBy(prop, fetch, initialValue = null) {
  const r = resource(() => fetch(f(prop)), initialValue);
  
  if (isSignal(prop)) {
    // @ts-ignore
    prop.subscribe({ next: (v) => r.refetch(v) });
  }

  return r;
}

/** 
 * @template T
 * @typedef { () => { 
 *   provide: (value?: any, meta?: { [key: string]: string }) => void 
 * } & Signal<T> } Provider<T> 
 */

/**
 * @template T
 * @param { any | Signal<T> } signal 
 * @returns { signal is Signal<T> } 
 */
export function isSignal(signal) {
  return signal && signal.subscribe;
}

/**
 * @template T
 * @param { (value?: any, meta?: { [key: string]: string }) => T } provide 
 * @param { Signal<any>[] } signals 
 * @returns { Provider<T> }
 */
export function provider(provide, signals = []) {

 function __provider() {

    /** @type { Signal<T> } */
    let value    = signal(null),
        provided = null,
        meta     = null;

    /** 
     * @param { any } v 
     * @param {{ [key: string]: string } | undefined} m 
     */
    const _provide = (v, m) => {
      provided = v;
      meta     = m;

      value(provide(v, meta));
    }

    for (const signal of signals) {
      signal.subscribe({ next: () => value(provide(provided, meta)) });
    }

    return Object.assign(value, { provide: _provide }); 
  }

  return __provider;
}