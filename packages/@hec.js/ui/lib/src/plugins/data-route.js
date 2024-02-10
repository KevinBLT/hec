import { route } from "../routing.js";

/** 
 * @param { HTMLElement } node 
 * @returns { string }
 */
const joinsRoutes = (node) => {
  let route = node.dataset.route || node.dataset.routeNot;

  if (route[0] == '/') {
    return route;
  }

  while (node = node.parentElement) {
    const parentRoute = node.dataset.route || node.dataset.routeNot;

    if (parentRoute) {
      route = parentRoute.replaceAll('*', '') + route;
    }
  }

  return route.replaceAll(/\/+|\/\*\//g, '/');
}

/** 
 * @type {{ 
 *  node: HTMLElement, 
 *  placeholder: Comment, 
 *  pattern: URLPattern,
 *  negate: boolean
 * }[] }
 */
const routes = [];

const update = () => {
  const href = location.href.replace(/index\.*[a-z0-9]*$/gm, '');

  for (const route of routes) {
    const isMatch = route.pattern.test(href);

    if ((route.negate ? !isMatch : isMatch)) {
      route.node.hidden = false;
      
      if (route.node.parentNode) {
        continue;
      }

      route.placeholder.after(route.node);
      
      /** @type { HTMLMetaElement } */
      const meta = document.querySelector('head meta[name="route"]');
  
      if (meta) {
        meta.content = route.pattern.pathname;
      }
  
    } else if (route.node.localName != 'link') {
      route.node.remove();
    }
  }

}

route.subscribe({ next: update });

/** @type { import("../plugins.js").Plugin } */
export const dataRoutePlugin = {
  select: '[data-route], [data-route-not]',

  run: async (node) => {

    /* -- Polyfill safari -- */
    if (!('URLPattern' in window)) { // @ts-ignore
      await import('https://kevinblt.github.io/hec/packages/@hec.js/ui/dist/urlpattnern.min.js');
    }
    /* -- -- */

    const absoluteRoute = joinsRoutes(node),
          pattern       = new URLPattern({ pathname: absoluteRoute }),
          placeholder   = document.createComment('route: ' + absoluteRoute);

    node.replaceWith(placeholder);

    routes.push({ node, pattern, placeholder, negate: node.hasAttribute('data-route-not') });

    update();    
  }
}