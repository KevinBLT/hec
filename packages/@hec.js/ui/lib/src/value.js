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
  const chain = key.split('.');

  for (const p of chain) {

    if (['loading', 'error'].includes(p) && props?.loading && props?.error) {
      return props[p];
    } else if (props?.subscribe) {
      // TODO: Handle nested signals?
      props = props.map((e) => e && e[p]);
    } else if (typeof props === 'function') {
      props = f(props);
    } else {
      props = props[p];
    }
  }

  return props;
}