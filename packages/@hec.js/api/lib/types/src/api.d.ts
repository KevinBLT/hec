/// <reference types="node" />
/** @template T */
export class API<T> {
    /**
     * @param { T } context
     * @param { Partial<Route<T>>[] } routes
     */
    constructor(context: T, routes?: Partial<Route<T>>[]);
    /**
     * @param { Partial<Route<T>> } route
     * @returns { API<T> }
     * */
    route(route: Partial<Route<T>>): API<T>;
    /**
     * @param { ApiRequest | URL | string | Request } request
     * @param { RequestInit | undefined } init
     * @returns { Promise<Response> }
     */
    fetch(request: ApiRequest | URL | string | Request, init?: RequestInit | undefined): Promise<Response>;
    serve(): (req: import("http").IncomingMessage, res: import("http").ServerResponse<import("http").IncomingMessage>) => void;
    #private;
}
import { Route } from './routing/route.js';
import { ApiRequest } from './routing/request.js';
