import { notifyVisible } from '../notify/visible.js';
import { templateByNode } from '../template.js';

const loaded = new WeakSet();

/**
 * @type { import("../plugins.js").Plugin }
 */
export const dataIncludePlugin = {
  select: '[data-include]',

  run: (node, props) => {
    
    if (loaded.has(node) || node.children.length) {
      return;
    }
    
    loaded.add(node);

    const hidden = node.closest('[hidden]');

    const execute = async () => {
      const response = await fetch(node.dataset.include, {
        headers: {
          'accept': 'text/html,text/*'
        }
      });

      if (response.ok) {
        node.innerHTML = await response.text();

        for (const child of node.childNodes) {
          templateByNode(child, props);
        }
      }
    }

    if (hidden) {
      notifyVisible(node, hidden).then(execute);
    } else {
      execute();
    }    
  }
}