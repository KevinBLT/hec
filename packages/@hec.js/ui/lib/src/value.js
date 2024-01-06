/**
 * @param { any | function(): any} v 
 * @returns { any }
 */
export function f(v) {
  return typeof v === 'function' ? f(v()) : v;
}

/**
 * @param { {[key: string]: any} } props 
 * @param { string } key 
 * @returns { any }
 */
export function prop(props, key) {
  return new Function('$', 'return $.' + key)(props);
}

/**
 * @param { {[key: string]: any} } props 
 * @param { string } key 
 * @param { any } value
 * @returns { any }
 */
export function propUpdate(props, key, value) {
  new Function('$', 'v', `$.${key} = v`)(props, value);
}