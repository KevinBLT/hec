/**
 * @typedef { Response | Promise<Response> } ApiResponse
 */

/**
 * @template T
 * @typedef { (request: import('./request.js').ApiRequest, context: T, next?: () => ApiResponse) => ApiResponse } RouteRequest
 */

/**
 * @typedef { Object } _ApiRequest
 * @property { (key: string) => string } param
 * @property { (key: string) => string } query
 * @property { () => Promise<Uint8Array | string | {[key: string]: any | null}> } data
 * @property { (key: string, value?: any) => string } prop
 * @property { string } path
 * @extends {Request}
 */

/** @template T */
export class Route {

  /** @param { Partial<Route<T>> } options */
  constructor(options) {
    Object.assign(this, options);

    if (this.group) {
      this.group = this.group.map(e => new Route(e));
    }
    
  }

  /** @type { 'GET' | 'POST' | 'PUT' | 'PATCH' | 'HEAD' | 'OPTIONS' | 'DELETE' | 'TRACE' | undefined } */
  method;

  /** @type { string | undefined } */
  path;

  /** @type { string[] | undefined } */
  accept;

  /** @type { string | undefined } */
  contentType;

  /** @type { RouteRequest<T> | undefined } */
  fetch;

  /** @type { RouteRequest<T>[] | undefined } */
  middlewares;

  /** @type { Partial<Route<T>>[] | undefined } */
  group;

  /** @type { import('urlpattern-polyfill').URLPattern | undefined } */
  pattern;
}