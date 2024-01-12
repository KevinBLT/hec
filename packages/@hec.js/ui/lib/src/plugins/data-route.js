import { route } from "../routing.js";

/** 
 * @param { HTMLElement } node 
 * @returns { string }
 */
const joinsRoutes = (node) => {
  let route = node.dataset.route;

  while (node = node.parentElement) {
    if (node.dataset.route) {
      route = node.dataset.route + route;
    }
  }

  return route.replaceAll(/\/+/g, '/');
}

/** @type { import("../plugins.js").Plugin } */
export const dataRoutePlugin = {
  select: '[data-route]',

  run: async (node) => {

    /* -- Polyfill safari -- */
    if (!('URLPattern' in window)) { // @ts-ignore
      await import('https://kevinblt.github.io/hec/packages/@hec.js/ui/dist/urlpattnern.min.js');
    }
    /* -- -- */

    const absoluteRoute = joinsRoutes(node),
          pattern       = new URLPattern({pathname: absoluteRoute}),
          placeholder   = document.createComment('route: ' + absoluteRoute);

    node.replaceWith(placeholder);
  
    const update = () => {
      const href = location.href.replace(/index\.*[a-z0-9]*$/gm, '');

      if (!node.parentNode && pattern.test(href)) {
        node.hidden = false;
        placeholder.after(node);
        
        /** @type { HTMLMetaElement } */
        const meta = document.querySelector('head meta[name="route"]');

        if (meta) {
          meta.content = pattern.pathname;
        }

      } else if (node.localName != 'link') {
        node.remove();
      }
    }

    route.subscribe({ next: update });

    update();    
  }
}