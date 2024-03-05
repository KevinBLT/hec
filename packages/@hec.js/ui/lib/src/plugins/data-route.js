import { addRoute } from "../routing.js";


/** @type { import("../plugins.js").Plugin } */
export const dataRoutePlugin = {
  select: '[data-route], [data-route-not]',

  run: async (node) => {

    /* -- Polyfill safari -- */
    if (!('URLPattern' in window)) { // @ts-ignore
      await import('https://kevinblt.github.io/hec/packages/@hec.js/ui/dist/urlpattnern.min.js');
    }
    /* -- -- */

    const route       = node.dataset.route,
          placeholder = document.createComment('route: ' + route);

    /** @param { boolean } visible  */
    const update = (visible) => {

      if (visible) {
        node.hidden = false;
        
        if (node.parentNode) {
          return;
        }

        placeholder.after(node);
      } else if (node.localName != 'link') {
        node.remove();
      }
    }
    
    addRoute({ path: route, update, node });
   
    node.replaceWith(placeholder);
  }
}