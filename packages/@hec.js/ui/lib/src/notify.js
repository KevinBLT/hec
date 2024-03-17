import { componentUpdate } from "./component.js";

/** @type { WeakMap<Node, ((value?: any) => void)[]> } */
const notifiersVisible = new WeakMap();

/** @type { WeakMap<Node, ((value?: any) => void)[]> } */
const notifiersMounted = new WeakMap();

const intersectionObserver = new IntersectionObserver((entries) => {

  for (const entry of entries) {
    
    if (entry.isIntersecting && notifiersVisible.has(entry.target)) {
      
      for (const resolve of notifiersVisible.get(entry.target)) {
        resolve();
        notifiersVisible.delete(entry.target);
        intersectionObserver.unobserve(entry.target);
      }
    }
  }
}, {
  root: document,
  rootMargin: '256px',
});

new MutationObserver((mutations) => {

  for (const mutation of mutations) {

    /** @param { NodeList } childNodes */
    const mount = (childNodes) => {

      for (const node of childNodes) {

        if (componentUpdate.has(node)) {
          node.dispatchEvent(new CustomEvent('::mount'));
        }

        if (notifiersMounted.has(node)) {
          const resolvers = notifiersMounted.get(node);

          while (resolvers.length) {
            resolvers.shift()();
          } 

          notifiersMounted.delete(node);
        }

        mount(node.childNodes);
      }
    }

    /** @param { NodeList } childNodes */
    const unmount = (childNodes) => {

      for (const node of childNodes) {
        if (componentUpdate.has(node)) {
          node.dispatchEvent(new CustomEvent('::unmount'));
        }
     
        unmount(node.childNodes);
      }
    }

    mount(mutation.addedNodes);
    unmount(mutation.removedNodes);
  }

}).observe(document, { childList: true, subtree: true });

/** @param { Element } node */
export function onVisible(node) {
  return new Promise((resolve) => {
    const resolvers = notifiersVisible.get(node) ?? [];

    resolvers.push(resolve);
    notifiersVisible.set(node, resolvers);
    intersectionObserver.observe(node);
  });
}

/** @param { Node } node */
export function onMount(node) {
  return new Promise((resolve) => {
    const resolvers = notifiersMounted.get(node) ?? [];

    if (node.getRootNode() == document) {
      queueMicrotask(() => resolve());
    }

    resolvers.push(resolve);
    notifiersMounted.set(node, resolvers);
  });
}