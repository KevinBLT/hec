
import { serveBy } from './routing/serve.js';
import { routeCompare } from './routing/sort.js';
import { routeMatch } from './routing/match.js';
import { integrateRoute } from './routing/routing.js';
import { ApiRequest } from './routing/request.js';
import { Route } from './routing/route.js';

/** @template T */
export class API {

  /** @type { Route<T>[] } */
  #routes = [];

  /** @type { T } */
  #context;

  /** 
   * @param { T } context 
   * @param { Partial<Route<T>>[] } routes  
   */
  constructor(context, routes = []) {
    this.#context = context;

    for (const route of routes) {
      this.route(route);
    }
  }

  /** 
   * @param { Partial<Route<T>> } route 
   * @returns { API<T> }
   * */
  route(route) {
    const r = new Route(route);

    integrateRoute(r);

    this.#routes.push(r);
    this.#routes.sort(routeCompare);

    return this;
  }

  /**
   * @param { ApiRequest | URL | string | Request } request 
   * @param { RequestInit | undefined } init 
   * @returns { Promise<Response> }
   */
  async fetch(request, init = null) {

    /** @type { ApiRequest } */
    let apiRequest;

    if (request instanceof URL) {
      apiRequest = new ApiRequest(request, init);
    } else if (request instanceof Request) {
      apiRequest = new ApiRequest(request, init);
    } else if (typeof request == 'string') {
      apiRequest = new ApiRequest(new URL(request, 'http://localhost'), init);
    } else {
      apiRequest = request;
    }

    if (!apiRequest.path.startsWith('/.well-known') && apiRequest.path.match(/\/[_.]/)) {
      return new Response(null, { status: 403 });
    }

    const context = {
      status: 404,
      url: null,
      accept: null,
      contentType: null,
      response: null,
    };

    const stack        = [],
          paramPointer = new WeakMap();

    /** @type { () => Response | Promise<Response> | null } */
    const next = () => {
      const r = stack.shift();

      apiRequest.param = paramPointer.get(r);

      return r?.(apiRequest, this.#context, next);
    }
          
    /** 
     * @param { ApiRequest } request 
     * @param { Route<T>[] } routes 
     * @returns { Promise<Route<T> | undefined>}
     */
    const findRoutes = async (request, routes) => {
      
      if (!routes) {
        return;
      }

      for (const route of routes) {

        if (routeMatch(request, route, context)) {
          let params = null;

          /**
           * @param { string } key 
           * @returns { string }
           */
          request.param = (key) => {
            params ??= route.pattern.exec(context.url + (route.group ? '/' : '')).pathname.groups;
            
            return params[key];
          }

          if (route.middlewares?.length) {
            for (const middleware of route.middlewares) {
              paramPointer.set(middleware, request.param);
              stack.push(middleware);
            }
          }
   
          
          if (route.fetch) {
            paramPointer.set(route.fetch, request.param);
            stack.push(route.fetch);
          } else {
            // @ts-ignore: Group here are always full Route<T> instances
            findRoutes(request, route.group);
          }
        }
      }  
    }
    
    findRoutes(apiRequest, this.#routes);

    try {
      return await next() ?? new Response(context.response, { status: context.status });
    } catch (error) {
      console.error(error);

      return Response.json({ error: 0, message: 'See logs for details' }, { status: 500 });
    }
  }
  
  serve() {
    return serveBy((request) => this.fetch(request));
  }
}