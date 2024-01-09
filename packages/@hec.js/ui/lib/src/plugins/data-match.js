import { route } from "../routing.js";

/** @type { import("../plugins.js").Plugin } */
export const dataMatchPlugin = {
  select: '[data-match]',

  run: (node) => {

    const className = node.dataset.match,
          pathname  = new URL(
            node.dataset.route || node.getAttribute('href'), location.href
          ).pathname.replace(/index\.*[a-z0-9]*$/gm, '');

    const update = () => {
      if (pathname == location.pathname.replace(/index\.*[a-z0-9]*$/gm, '')) {
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