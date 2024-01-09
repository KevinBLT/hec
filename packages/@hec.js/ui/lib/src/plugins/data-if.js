import { isSignal } from "../signal.js";
import { f, prop } from "../props.js";

/** @type { import("../plugins.js").Plugin } */
export const dataIfPlugin = {
  select: '[data-if]',

  run: (node, props) => {
    const condition = prop(props, node.dataset.if);
    
    /** @param { boolean } condition */ 
    const update = (condition) => {
      node.hidden = !condition;
    }

    update(f(condition));

    if (isSignal(condition)) {
      condition.subscribe({next: update}); 
    }
    
  }
}