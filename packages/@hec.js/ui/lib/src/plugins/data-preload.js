const loaded = new WeakSet();

/**
 * @type { import("../plugins.js").Plugin }
 */
export const dataPreloadPlugin = {
  select: '[data-preload]',

  run: (node) => {
    
    if (loaded.has(node) || node.hidden) {
      return;
    }
    
    loaded.add(node);

    const hrefs = node.dataset.preload.split(',');

    const addLink = (href, as) => {
      const link = document.createElement('link');

      link.rel  = 'preload';
      link.as   = as;
      link.href = href;
  
      document.head.append(link);
    }
    
    for (const href of hrefs) {
      const v = href.split(':');

      addLink(v[0], v[1] ?? 'fetch');
    }
  }
}