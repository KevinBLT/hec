import { addRoute, route } from "../routing.js";
import { nodeUpdater } from "./data-if.js";


/** @type { import("../plugins.js").Plugin } */
export const dataRoutePlugin = {
  select: (node) => node.matches('[data-route]'),

  run: async (node, props) => {
    const route       = node.dataset.route,
          placeholder = document.createComment('route: ' + route),
          update      = nodeUpdater(node, placeholder, props);
    
    addRoute({ path: route, update, node, placeholder });
   
    node.removeAttribute('data-group');
    node.replaceWith(placeholder);
  }
}

/** @type { import("../plugins.js").Plugin } */
export const dataMatchPlugin = {
  select: (node) => node.matches('[data-match], [href]'),

  run: (node) => {

    if (!node.parentNode || node.hasAttribute('download')) {
      return;
    }

    const className = node.dataset.match ?? '--active',
          normalize = (/** @type { string } */ v) => v.replace(/index\.*[a-z0-9]*$/gm, '');

    function pathname(href) {
      return normalize(new URL(href, location.href).pathname);
    } 

    const update = (/** @type { string } */ url) => {

      if (pathname(node.getAttribute('href')) == pathname(url)) {
        node.classList.add(className);
      } else {
        node.classList.remove(className);

        if (!node.className) {
          node.removeAttribute('class');
        }
      }
    }

    route.subscribe({ next: update });

    queueMicrotask(() => update(location.pathname));

    node.removeAttribute('data-match');
  }
}