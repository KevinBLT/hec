import { notifyVisible } from '../notify/visible.js';
import { templateByNode } from '../template.js';

const loaded = new WeakSet();

/** @type { import("../plugins.js").Plugin } */
export const dataLazyPlugin = {
  select: '[data-lazy]',

  run: (node, props, stopTemplate) => {
    
    if (loaded.has(node) || !node.childNodes.length) {
      return;
    }
    
    loaded.add(node);

    const hidden    = node.closest('[hidden]'),
          className = node.dataset.lazy;

    const execute = () => {
      
      for (const child of node.childNodes) {
        templateByNode(child, props);
      }

      node.removeAttribute('data-lazy');
    }

    if (className) {
      node.addEventListener('::load',   () => node.classList.add(className),    { once: true });
      node.addEventListener('::loaded', () => node.classList.remove(className), { once: true });
    }

    notifyVisible(node).then(execute);
    stopTemplate();
  }
}