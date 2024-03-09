import { activeComponents, componentSelector, useComponent } from "../component.js";

/** @type { import("../plugins.js").Plugin<HTMLInputElement> } */
export const dataComponentPlugin = {
  select:componentSelector,

  run: (node) => {

    if (activeComponents.has(node)) {
      return;
    }

    useComponent(node, node.dataset.component ?? node.dataset.view ?? node.dataset.page);
  }
}