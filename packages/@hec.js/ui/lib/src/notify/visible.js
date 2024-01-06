/** 
 * @param { Element } node 
 * @param { Element | undefined } hidden 
 */
export function notifyVisible(node, hidden = null) {
  hidden ??= node.closest('[hidden]');

  return new Promise((resolve, reject) => {
    const observer = new MutationObserver(() => {
      hidden = node.closest('[hidden]');
  
      if (hidden) {
        return observer.observe(hidden, {
          attributes: true, 
          attributeFilter: ['hidden']
        });
      }

      observer.disconnect();
      
      resolve();
    });
  
    observer.observe(hidden, {
      attributes: true, 
      attributeFilter: ['hidden']
    });
  });
}