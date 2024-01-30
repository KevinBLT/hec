import { notifyVisible } from '../notify/visible.js';
import { executeNodeAttributesTemplate, templateByNode } from '../template.js';

const loaded = new WeakSet();

/** @type { import("../plugins.js").Plugin } */
export const dataLazyPlugin = {
  select: '[data-lazy]',

  run: (node, props, stopTemplate) => {

    if (loaded.has(node) || !node.childNodes.length) {
      return;
    }
    
    loaded.add(node);

    const className = node.dataset.lazy;

    const execute = () => {
      node.removeAttribute('data-lazy');

      executeNodeAttributesTemplate(node, props);
      
      for (const child of node.childNodes) {
        templateByNode(child, props);
      }
    }

    if (className) {
      node.addEventListener('::load',   () => node.classList.add(className),    { once: true });
      node.addEventListener('::loaded', () => node.classList.remove(className), { once: true });
    }

    notifyVisible(node).then(execute);
    stopTemplate();
  }
}