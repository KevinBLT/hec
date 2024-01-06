/**
 * @typedef {Response | undefined | void} MaybeResponse
 */

import { ApiRequest } from './request.js';

/**
 * @template T
 * @typedef {function(ApiRequest, T): MaybeResponse | Promise<MaybeResponse>} RouteRequest
 */


/**
 * @typedef {Object} _ApiRequest
 * @property {(key: string) => string} param
 * @property {(key: string) => string} query
 * @property {() => Promise<Uint8Array | string | {[key: string]: any | null}>} data
 * @property {(key: string, value?: any) => string} prop
 * @property {string} path
 * @extends {Request}
 */

/**
 * @template T
 * @typedef {{
*   method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'HEAD' | 'OPTIONS' | 'DELETE' | null,
*   path?: string | null,
*   accept?: string[] | null,
*   contentType?: string | null,
*   fetch?: RouteRequest<T> | null,
*   middlewares?: RouteRequest<T>[] | null,
*   group?: Route<T>[] | null,
*   pattern?: import('urlpattern-polyfill').URLPattern | null
* }} Route
*/