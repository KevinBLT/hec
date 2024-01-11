import { isSignal } from "../signal.js";
import { f, prop } from "../props.js";

/** @type { import("../plugins.js").Plugin } */
export const dataIfPlugin = {
  select: '[data-if]',

  run: (node, props) => {
    const condition   = prop(props, node.dataset.if),
          placeholder = document.createComment('if: ' + node.dataset.if);
  
    node.replaceWith(placeholder);
    
    /** @param { boolean } condition */ 
    const update = (condition) => {
      if (condition) {
        node.hidden = false;
        placeholder.after(node);
      } else {
        node.remove();
      }
    }

    update(f(condition));

    if (isSignal(condition)) {
      condition.subscribe({next: update}); 
    }
    
  }
}