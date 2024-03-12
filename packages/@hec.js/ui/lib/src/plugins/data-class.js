import { bindExpressions } from "../template.js";

/** @type { import("../plugins.js").Plugin<HTMLElement | SVGElement> } */
export const dataClassPlugin = {
  select: (node) => Object.keys(node.dataset).some(e => e.startsWith('class.')),

  run: (node, props) => {

    if (!node.parentNode) {
      return;
    }

    const update = (condition, className) => {
      if (condition) {
        node.classList.add(className);
      } else {
        node.classList.remove(className);

        if (!node.className) {
          node.removeAttribute('class');
        }
      }
    }
    
    for (const attr of node.getAttributeNames()) {
      if (attr.startsWith('data-class.')) {
        const className = attr.split('.')[1], 
              prop      = node.getAttribute(attr);
        
        bindExpressions(prop, props, (v) => update(v, className), false);
      }
    }
  }
}