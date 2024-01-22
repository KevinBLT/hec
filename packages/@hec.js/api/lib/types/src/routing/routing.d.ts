/**
 * @template T
 * @param { import('./route.js').Route<T> } route
 * @param { import('./route.js').Route<T> } parent
 *
 * @description
 * Finalizes the given route and its group if there is any.
 */
export function integrateRoute<T>(route: import("./route.js").Route<T>, parent?: import("./route.js").Route<T>): void;
