import { prop } from "../props.js";

/** @type { import("../plugins.js").Plugin<HTMLElement | SVGElement> } */
export const dataOnPlugin = {
  select: (node) => Object.keys(node.dataset).some(e => e.startsWith('on.')),

  run: (node, props) => {
    
    for (const p in node.dataset) {
      if (p.startsWith('on.')) {
        node.addEventListener(p.split('.')[1], prop(props, node.dataset[p]));
      }
    }
  }
}