import { components, componentSelector } from "../component.js";
import { on } from "../event.js";
import { onMount, onVisible } from "../notify.js";
import { lazyLoads } from "./data-lazy.js";

const loaded = new WeakSet();

/** @type { import("../plugins.js").Plugin<HTMLInputElement> } */
export const dataComponentPlugin = {
  select: (node) => node.matches(componentSelector),

  run: (node, props, stopTemplate) => {
    const type = 'component' in node.dataset ? 'component' : 'view' in node.dataset ? 'view' : 'page',
          key  = `${ type }/${ node.dataset[type] }`;

    if (loaded.has(node) || !node.parentNode) {
      return;
    }
    
    loaded.add(node);

    const execute = async () => {

      if (!components.has(key)) {
        return on('::component/' + key, execute);
      }

      node.removeAttribute('data-lazy');
      node.setAttribute('data-loading', key);
      await components.get(key)(node, props);
      node.removeAttribute('data-loading');
    }

    if (node.hasAttribute('data-lazy')) {
      lazyLoads.add(node);
      onVisible(node).then(execute);
    } else {
      onMount(node).then(execute);
    }

    stopTemplate();
  }
}