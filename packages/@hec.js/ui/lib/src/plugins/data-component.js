import { components, componentSelector } from "../component.js";
import { on } from "../event.js";
import { onMount, onVisible } from "../notify.js";
import { lazyLoads } from "./data-lazy.js";

const loaded = new WeakSet();

/** @type { import("../plugins.js").Plugin<HTMLInputElement> } */
export const dataComponentPlugin = {
  select: componentSelector,

  run: (node, props) => {
    const component = node.dataset.component ?? node.dataset.view ?? node.dataset.page;

    if (loaded.has(node) || !node.parentNode) {
      return;
    }
    
    loaded.add(node);

    const execute = async () => {

      if (!components.has(component)) {
        return on('::component/' + component, execute);
      }

      node.removeAttribute('data-lazy');
      node.classList.add('--loading');
      await components.get(component)(node, props);
      node.classList.remove('--loading');
    }

    if (node.hasAttribute('data-lazy')) {
      lazyLoads.add(node);
      onVisible(node).then(execute);
    } else {
      onMount(node).then(execute);
    }
  }
}