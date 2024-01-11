/** @type { WeakMap<Node, ((value?: any) => void)[]> } */
const notifiers = new WeakMap();

const observer = new IntersectionObserver((entries) => {

  for (const entry of entries) {
    if (entry.isIntersecting && notifiers.has(entry.target)) {
      for (const resolve of notifiers.get(entry.target)) {
        resolve();
      }

      notifiers.delete(entry.target);
      observer.unobserve(entry.target);
    }
  }
}, {
  rootMargin: '256px',
});

/** @param { Element } node */
export function notifyVisible(node) {
  return new Promise((resolve) => {
    const resolvers = notifiers.get(node) ?? [];

    resolvers.push(resolve);
    notifiers.set(node, resolvers);
    observer.observe(node);
  });
}