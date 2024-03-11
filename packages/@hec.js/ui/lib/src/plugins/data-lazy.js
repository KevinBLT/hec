import { onVisible } from '../notify.js';
import { templateByNode } from '../template.js';

export const lazyLoads = new WeakSet();

/** @type { import("../plugins.js").Plugin } */
export const dataLazyPlugin = {
  select: (node) => node.matches('[data-lazy]'),

  run: (node, props, stopTemplate) => {

    if (lazyLoads.has(node)) {
      return;
    }
    
    lazyLoads.add(node);
    
    const execute = () => {
      node.removeAttribute('data-lazy');

      for (const child of node.childNodes) {
        templateByNode(child, props);
      }
    }

    onVisible(node).then(execute);
    
    stopTemplate();
  }
}