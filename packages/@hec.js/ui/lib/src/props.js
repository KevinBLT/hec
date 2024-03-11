import { isSignal, signal } from "./signal.js";

/**
 * @param { any | function(): any} v 
 * @returns { any }
 */
export const f = (v) => typeof v === 'function' ? f(v()) : v;

/**
 * @param { {[key: string]: any} } props 
 * @param { string } key 
 * @returns { any }
 */
export function prop(props, key) {
  const chain = key.split('.');

  if (!key) {
    return props;
  }

  if (!props) {
    return null;
  }

  for (const p of chain) {

    if (['state'].includes(p) && props?.state) {
      return props[p];
    } else if (isSignal(props)) {
      const value = props()?.[p];

      if (isSignal(value)) {
        let abort  = new AbortController(),
            nested = signal(value());
        
        value.subscribe({ next: nested }, { signal: abort.signal });

        const update = (v) => {
          abort.abort();

          if (isSignal(v[p])) {
            abort = new AbortController();

            v[p].subscribe({ next: nested }, { signal: abort.signal });
            
            nested(v[p]());
          } else {
            nested(v[p]);
          }
        }

        props.subscribe({ next: update });
        
        props = nested;
      } else {
        props = props.map((e) => e && e[p]);
      }

    } else if (typeof props === 'function') {
      props = f(props);
    } else if (typeof props[p] !== 'undefined') {

      if (typeof props[p] === 'function' && !isSignal(props[p])) {
        props = props[p].bind(props);
      } else {
        props = props[p];
      }
      
    } else {
      return undefined;
    }
  }

  return props;
}

/**
 * @param { {[key: string]: any} } props 
 * @param { string } key 
 * @returns { boolean }
 */
export function hasProp(props, key) {
  const chain = key.split('.');

  if (!key || !props) {
    return false;
  }

  for (const p of chain) {

    if (['loading', 'error'].includes(p) && props?.loading && props?.error) {
      return props[p];
    } else if (typeof props === 'function') {
      props = f(props);
    } else if (typeof props[p] !== 'undefined') {
      props = props[p];
    } else {
      return false;
    }

  }

  return true;
}