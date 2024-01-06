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
      route.group ? `${route.path}*` : route.path
    ).replaceAll('//', '/'),
  });

  route.group?.forEach((e) => integrateRoute(e, route));
  route.group?.sort(routeCompare);
}