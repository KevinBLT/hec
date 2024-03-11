import { isSignal } from "../signal.js";
import { f, prop } from "../props.js";

/** @type { import("../plugins.js").Plugin } */
export const dataIfPlugin = {
  select: '[data-if], [data-if-not]',

  run: (node, props) => {
    const key         = node.dataset.if || node.dataset.ifNot,
          condition   = prop(props, key),
          negate      = !!node.dataset.ifNot,
          placeholder = document.createComment((negate ? 'if not:' : 'if: ') + key);
  
    node.replaceWith(placeholder);
    
    /** @param { boolean } condition */ 
    const update = (condition) => {
      condition = negate ? !condition : condition;

      if (!node.parentNode && condition) {
        node.hidden = false;
        placeholder.replaceWith(node);
      } else if (!node.closest('head')) {
        node.replaceWith(placeholder);
      }
    }

    update(f(condition));

    if (isSignal(condition)) {
      condition.subscribe({next: update}); 
    }    
  }
}