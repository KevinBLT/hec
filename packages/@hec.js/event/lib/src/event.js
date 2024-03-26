
/** 
 * @typedef { (data: any, next: () => any | Promise<any>) => any | Promise<any> } EventHandler
 * @type { Map<string, EventHandler[]> } 
 */
const handlers = new Map();

/**
 * @param { string } eventName 
 * @param { any } data 
 * @returns { Promise<any> } 
 */
export async function emit(eventName, data = null) {

  if (!handlers.has(eventName)) {
    return;
  }

  const list = Array.from(handlers.get(eventName));

  const next = () => {
    const result = list.length ? list.shift()?.(data, next) : null;

    return result === undefined ? next() : result;
  }

  return next();
}

/**
 * @param { string } eventName 
 * @param { EventHandler } handler 
 */
export function on(eventName, handler) {
  const list = handlers.get(eventName) ?? [];
   
  list.push(handler);

  handlers.set(eventName, list);
}

/**
 * @param { string } eventName 
 * @returns { Promise }
 */
export function once(eventName) {
  
  return new Promise(
    (resolve) => {

      const handler = (data, next) => {
        resolve(data);
        off(eventName, handler);
      }

      on(eventName, handler);
    }
  );
}

/**
 * @param { string } eventName 
 * @param { AbortSignal } abort 
 * @returns { AsyncIterable<any> }
 */
export async function * stream(eventName, abort = null) {
  let running = true,
      aborted = new Promise(resolve => {
        abort?.addEventListener('abort', () =>  {
          running = false; 
          
          resolve();
        })
      });
  
  while (running) {
    yield await Promise.race([once(eventName), aborted]);
  }

}

/**
 * @param { string } eventName 
 * @param { EventHandler } handler 
 */
export function off(eventName, handler) {
  const list  = handlers.get(eventName),
        index = list ? list.indexOf(handler) : -1;

  if (index > -1) {
    list.splice(index, 1);

    if (list.length === 0) {
      handlers.delete(eventName);
    }
  }
}