import { onVisible } from '../notify.js';
import { templateByNode } from '../template.js';
import { lazyLoads } from './data-lazy.js';

export const loaded = new WeakSet();

/** @type { import("../plugins.js").Plugin } */
export const dataIncludePlugin = {
  select: '[data-include]',

  run: (node, props) => {

    if (loaded.has(node) || node.children.length) {
      return;
    }
    
    loaded.add(node);

    const execute = async () => {
      node.dispatchEvent(new CustomEvent('::load', { bubbles: true }));

      node.classList.add('--loading');

      const response = await fetch(node.dataset.include, {
        headers: {
          'accept': 'text/html,text/*'
        }
      });

      if (response.ok) {
        const html = await response.text();

        node.dispatchEvent(new CustomEvent('::loaded', { bubbles: true }));
        node.innerHTML = html;

        for (const child of node.childNodes) {
          templateByNode(child, props);
        }

        node.removeAttribute('data-include');
        node.removeAttribute('data-lazy');
        node.classList.remove('--loading');
      }
    }

    if (node.hasAttribute('data-lazy')) {
      lazyLoads.add(node);
      onVisible(node).then(execute);
    } else {
      execute();
    }    
  }
}