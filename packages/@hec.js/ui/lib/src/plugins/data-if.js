import { isSignal } from "../signal.js";
import { f, prop } from "../props.js";

/** @type { import("../plugins.js").Plugin } */
export const dataIfPlugin = {
  select: '[data-if], [data-if-not]',

  run: (node, props) => {
    const condition   = prop(props, (node.dataset.if || node.dataset.ifNot)),
          placeholder = document.createComment('if: ' + (node.dataset.if || node.dataset.ifNot)),
          negate      = !!node.dataset.ifNot;
  
    node.replaceWith(placeholder);
    
    /** @param { boolean } condition */ 
    const update = (condition) => {
      condition = negate ? !condition : condition;

      if (!node.parentNode && condition) {
        node.hidden = false;
        placeholder.after(node);
      } else if (node.localName != 'link') {
        node.remove();
      }
    }

    update(f(condition));

    if (isSignal(condition)) {
      condition.subscribe({next: update}); 
    }
    
  }
}