
/**
 * @param {Iterable} iterable 
 * @returns {number}
 */
const count = (iterable) => Array.from(iterable).length;

 /**
  * @template T
  * @param { import("./route.js").Route<T> } a
  * @param { import("./route.js").Route<T> } b
  *
  * @description 
  * Compares routes by giving points on how specific they are.    
  * 
  * Example: `/foo` is more specific than `/:bar` although both would match.
  */
export function routeCompare(a,b) {
  let ap = count(a.path.matchAll(/\:/g)) * 25,
      bp = count(b.path.matchAll(/\:/g)) * 25;

  ap += count(a.path.matchAll(/\*/g)) * 150;
  ap += a.method ? 0 : 1;
  ap += a.accept ? a.accept.reduce((p, e) => p + count(e.matchAll(/\*/g)), 0) : 10;
  ap += a.contentType ? count(a.contentType.matchAll(/\*/g)) : 5;

  bp += count(b.path.matchAll(/\*/g)) * 150;
  bp += b.method ? 0 : 1;
  bp += b.accept ? b.accept.reduce((p, e) => p + count(e.matchAll(/\*/g)), 0) : 10;
  bp += b.contentType ? count(b.contentType.matchAll(/\*/g)) : 5;

  return ap - bp;
}