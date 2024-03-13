import { onVisible } from '../notify.js';
import { templateByNode } from '../template.js';
import { lazyLoads } from './data-lazy.js';

export const loaded = new WeakSet();

/** @type { import("../plugins.js").Plugin } */
export const dataIncludePlugin = {
  select: (node) => node.matches('[data-include]'),

  run: (node, props) => {

    if (loaded.has(node) || node.children.length) {
      return;
    }
    
    loaded.add(node);

    const execute = async () => {
      node.dispatchEvent(new CustomEvent('::load', { bubbles: true }));

      node.setAttribute('data-loading', node.dataset.include);

      const response = await fetch(node.dataset.include, {
        headers: {
          'accept': 'text/html,text/*'
        }
      });

      if (response.ok) {
        const html = await response.text(),
              temp = document.createElement('div');

        node.dispatchEvent(new CustomEvent('::loaded', { bubbles: true }));
        temp.innerHTML = html;

        for (const child of temp.childNodes) {
          templateByNode(child, props);
        }

        if ('group' in node.dataset) {
          node.replaceWith(...temp.childNodes);
        } else {
          node.append(...temp.childNodes);
        }

        node.removeAttribute('data-include');
        node.removeAttribute('data-lazy');
        node.removeAttribute('data-group');
        node.removeAttribute('data-loading');

        if (!node.className) {
          node.removeAttribute('class');
        }
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