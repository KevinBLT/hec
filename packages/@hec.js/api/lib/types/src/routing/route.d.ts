/**
 * @typedef { Response | Promise<Response> } ApiResponse
 */
/**
 * @template T
 * @typedef { (request: import('./request.js').ApiRequest, context: T, next?: () => ApiResponse) => ApiResponse } RouteFetch
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
export class Route<T> {
    /** @param { Partial<Route<T>> } options */
    constructor(options: Partial<Route<T>>);
    /** @type { Partial<Route<T>>[] | undefined } */
    group: Partial<Route<T>>[] | undefined;
    /** @type { 'GET' | 'POST' | 'PUT' | 'PATCH' | 'HEAD' | 'OPTIONS' | 'DELETE' | 'TRACE' | undefined } */
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'HEAD' | 'OPTIONS' | 'DELETE' | 'TRACE' | undefined;
    /** @type { string | undefined } */
    path: string | undefined;
    /** @type { string[] | undefined } */
    accept: string[] | undefined;
    /** @type { string | undefined } */
    contentType: string | undefined;
    /** @type { RouteFetch<T> | undefined } */
    fetch: RouteFetch<T> | undefined;
    /** @type { RouteFetch<T>[] | undefined } */
    middlewares: RouteFetch<T>[] | undefined;
    /** @type { import('urlpattern-polyfill').URLPattern | undefined } */
    pattern: import('urlpattern-polyfill').URLPattern | undefined;
}
export type ApiResponse = Response | Promise<Response>;
export type RouteFetch<T> = (request: import('./request.js').ApiRequest, context: T, next?: () => ApiResponse) => ApiResponse;
export type _ApiRequest = {
    param: (key: string) => string;
    query: (key: string) => string;
    data: () => Promise<string | Uint8Array | {
        [key: string]: any;
    }>;
    prop: (key: string, value?: any) => string;
    path: string;
};
