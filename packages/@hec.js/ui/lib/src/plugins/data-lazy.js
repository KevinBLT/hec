import { notifyVisible } from '../notify/visible.js';
import { templateByNode } from '../template.js';

const loaded = new WeakSet();

/**
 * @type { import("../plugins.js").Plugin }
 */
export const dataLazyPlugin = {
  select: '[data-lazy]',

  run: (node, props, stopTemplate) => {
    
    if (loaded.has(node) || !node.childNodes.length) {
      return;
    }
    
    loaded.add(node);

    const hidden = node.closest('[hidden]');

    const execute = () => {
      for (const child of node.childNodes) {
        templateByNode(child, props);
      }
    }

    if (hidden) {
      notifyVisible(node, hidden).then(execute);
      stopTemplate();
    }
  }
}