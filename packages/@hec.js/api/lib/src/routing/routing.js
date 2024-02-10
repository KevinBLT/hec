import { URLPattern } from 'urlpattern-polyfill';
import { routeCompare } from "./sort.js";

/**
 * @template T
 * @param { import('./route.js').Route<T> } route 
 * @param { import('./route.js').Route<T> } parent
 * 
 * @description
 * Finalizes the given route and its group if there is any.
 */
export function integrateRoute(route, parent = null) {
  route.path          = (parent?.path ?? '') + (route.path?.toLowerCase() ?? '');  
  route.contentType ??= parent?.contentType;
  route.accept      ??= parent?.accept;
  route.pattern     ??= new URLPattern({
    pathname: (
      route.group ? `${route.path}/*` : route.path
    ).replaceAll('//', '/'),
  });

  if (route.group) {

    for (const childRoute of route.group){
      // @ts-ignore: Child route will be transoformed into Route<T> by the Route class
      integrateRoute(childRoute, route);
    }

    route.group?.sort(routeCompare);
  }
  
}