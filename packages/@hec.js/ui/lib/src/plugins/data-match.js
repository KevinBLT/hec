import { route } from "../routing.js";

/** @type { WeakMap<Node, () => void> } */
const nodeUpdates = new WeakMap();

const observer = new MutationObserver((records) => {
  
  for (const record of records) {
    if (nodeUpdates.has(record.target)) {
      nodeUpdates.get(record.target)();
    }
  }
});


/** @type { import("../plugins.js").Plugin } */
export const dataMatchPlugin = {
  select: '[data-match]',

  run: (node) => {

    const className = node.dataset.match,
          normalize = (v) => v.replace(/index\.*[a-z0-9]*$/gm, '');

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

    nodeUpdates.set(node, update);

    observer.observe(node, { 
      attributes: true, 
      attributeFilter: ['href', 'data-route'] 
    });

    update();    

    node.removeAttribute('data-match');
  }
}