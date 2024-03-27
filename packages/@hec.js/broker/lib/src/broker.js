


/**
 * @template [T=any]
 * @template [K=any]
 * @typedef { (data: T, next: () => any ) => K } EventHandler 
 */

/**
 * @typedef { string | number | symbol } EventName
 */

/**
 * @template [T=any]
 * @template [K=any]
*/
export class Broker {

  /** @type { Map<EventName, EventHandler[]> } */
  #handlers = new Map();


  /**
   * @template T
   * @template K
   * @type { (eventName: EventName, data?: T) => K }
   */
   emit(eventName, data = null) {
  
    if (!this.#handlers.has(eventName)) {
      return;
    }
  
    const list = Array.from(this.#handlers.get(eventName));
  
    const next = () => {
      const result = list.length ? list.shift()?.(data, next) : null;
  
      return result === undefined ? next() : result;
    }
  
    return next();
  }
  
  /**
   * @param { EventName } eventName 
   * @param { EventHandler } handler 
   */
  on(eventName, handler) {
    const list = this.#handlers.get(eventName) ?? [];
     
    list.push(handler);
  
    this.#handlers.set(eventName, list);
  }
  
  /**
   * @param { EventName } eventName 
   * @returns { Promise }
   */
  once(eventName) {
    
    return new Promise(
      (resolve) => {
  
        const handler = (data, next) => {
          resolve(data);
          this.off(eventName, handler);
        }
  
        this.on(eventName, handler);
      }
    );
  }
  
  /**
   * @param { EventName } eventName 
   * @param { AbortSignal } abort 
   * @returns { AsyncIterable<any> }
   */
  async * stream(eventName, abort = null) {
    let running = true,
        aborted = new Promise(resolve => {
          abort?.addEventListener('abort', () =>  {
            running = false; 
            
            resolve();
          })
        });
    
    while (running) {
      yield await Promise.race([this.once(eventName), aborted]);
    }
  
  }
  
  /**
   * @param { EventName } eventName 
   * @param { EventHandler } handler 
   */
  off(eventName, handler) {
    const list  = this.#handlers.get(eventName),
          index = list ? list.indexOf(handler) : -1;
  
    if (index > -1) {
      list.splice(index, 1);
  
      if (list.length === 0) {
        this.#handlers.delete(eventName);
      }
    }
  }
}  

const broker = new Broker();

export const on = broker.on.bind(broker);
export const once = broker.once.bind(broker);
export const emit = broker.emit.bind(broker);
export const stream = broker.on.bind(broker);
export const off = broker.on.bind(broker);