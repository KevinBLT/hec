
/** @type { WeakMap<Function, (this: Document, ev: any) => any> } */
const handlers = new WeakMap();

/**
 * @param { string } eventName 
 * @param { any } data 
 */
export function emit(eventName, data = null) {
  document.dispatchEvent(new CustomEvent(eventName, { detail: data }))
}

/**
 * @template T
 * @param { string } eventName 
 * @param { (data: T) => void } handler 
 */
export function on(eventName, handler) {

  /** @param { CustomEvent } ev */
  const call = (ev) => handler(ev.detail);

  handlers.set(handler, call);

  document.addEventListener(eventName, call);
}

/**
 * @template T
 * @param { string } eventName 
 * @returns { Promise<T> }
 */
export function once(eventName) {
  return new Promise(
    (resolve) => {
      
      /** @param { CustomEvent } ev */
      const call = (ev) => resolve(ev.detail); 

      document.addEventListener(eventName, call, { once: true })
    }
  );
}

/**
 * @template T
 * @param { string } eventName 
 * @param { (data: T) => void } handler 
 */
export function off(eventName, handler) {
  document.removeEventListener(eventName, handlers.get(handler));
}
