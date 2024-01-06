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

  return route
}

/**
 * @type { import("../plugins.js").Plugin }
 */
export const dataRoutePlugin = {
  select: '[data-route]',

  run: (node) => {
    const pattern = new URLPattern({pathname: joinsRoutes(node)});

    const update = () => {
      node.hidden = !pattern.test(location.href);

      if (!node.hidden) {
        /** @type { HTMLMetaElement } */
        const meta = document.querySelector('head meta[name="route"]');

        if (meta) {
          meta.content = pattern.pathname;
        }
      }
    }

    route.subscribe({ next: update });

    update();    
  }
}