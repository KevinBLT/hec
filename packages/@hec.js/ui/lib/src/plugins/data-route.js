import { addRoute, route } from "../routing.js";


/** @type { import("../plugins.js").Plugin } */
export const dataRoutePlugin = {
  select: '[data-route]',

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
      } else if (!node.closest('head')) {
        node.remove();
      }
    }
    
    addRoute({ path: route, update, node, placeholder });
   
    node.replaceWith(placeholder);
  }
}

/** @type { import("../plugins.js").Plugin } */
export const dataMatchPlugin = {
  select: '[data-match], [href]',

  run: (node) => {

    const className = node.dataset.match ?? '--active',
          normalize = (/** @type { string } */ v) => v.replace(/index\.*[a-z0-9]*$/gm, '');

    function pathname() {
      return normalize(
        new URL(node.dataset.route || node.getAttribute('href'), location.href).pathname
      );
    } 

    const update = () => {
      if (pathname() == normalize(location.pathname)) {
        node.classList.add(className);
      } else {
        node.classList.remove(className);
      }
    }

    route.subscribe({ next: update });

    update();    

    node.removeAttribute('data-match');
  }
}