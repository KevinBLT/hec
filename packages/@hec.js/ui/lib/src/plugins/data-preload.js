import { notifyVisible } from "../notify/visible.js";
import { preload } from "../preload.js";

const loaded = new WeakSet();

/** @type { import("../plugins.js").Plugin } */
export const dataPreloadPlugin = {
  select: '[data-preload]',

  run: (node) => {
    
    if (loaded.has(node) || node.hidden) {
      return;
    }

    loaded.add(node);

    const execute = () => {
      const hrefs = node.dataset.preload.split(',');
    
      for (const href of hrefs) {
        const v = href.split(':');
  
        preload({
          href: v[0], 
          as: v[1] ?? 'fetch',
        });
      }
    }

    if (node.hasAttribute('data-lazy')) {
      notifyVisible(node).then(execute);
    } else {
      execute();
    }  
  }
}