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
export function routeCompare<T>(a: import("./route.js").Route<T>, b: import("./route.js").Route<T>): number;
