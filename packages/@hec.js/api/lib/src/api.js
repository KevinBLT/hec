
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

    const context = {
      response: null,
      status: 404,
      url: null,
      accept: null,
      contentType: null
    };
    
    /** 
     * @param { ApiRequest } request 
     * @param { Route<T>[] } routes 
     * @returns { Promise<Route<T> | undefined>}
     */
    const findRoute = async (request, routes) => {
      
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
            return (params ??= route.pattern.exec(request.url).pathname.groups)[key];
          }

          if (route.middlewares) {
            for (const middleware of route.middlewares) {
              context.response = middleware(request, this.#context);

              if (context.response instanceof Promise) {
                context.response = await context.response;
              }

              if (context.response instanceof Response) {
                return Object.assign({}, route, { fetch: () => context.response });
              }
            }
          }
   
          // @ts-ignore: Group here are always full Route<T> instances
          const matchingRoute = await (route.fetch ? route : findRoute(request, route.group));

          if (matchingRoute) {
            return matchingRoute;
          }
        }
      }  
    } 
    
    const route = await findRoute(apiRequest, this.#routes);

    if (route) {
      const response = await route.fetch(apiRequest, this.#context);
      
      if (response) {

        if (route.contentType && !route.contentType.includes('*')) {
          response.headers.set('content-type', route.contentType);
        }
        
        return response;
      }
    }
   
    return new Response(null, {status: context.status});
  }
  
  serve() {
    return serveBy((request) => this.fetch(request));
  }
}