import { isSignal } from "../signal.js";
import { templateByNode } from "../template.js";
import { f, prop } from "../value.js";

const done = new WeakSet();

/**
 * @type { import("../plugins.js").Plugin }
 */
export const dataForPlugin = {
  select: '[data-for]',
  
  run: (node, props) => {

    if (done.has(node)) {
      return;
    }

    const parts       = node.dataset.for.replace('let', '').split('of'),
          params      = parts[0].split(','),
          propName    = parts.at(-1).trim(),
          entry       = params[0].trim() == propName ? '__e' : params[0].trim(),
          index       = params[1]?.trim() ?? '__i',
          list        = prop(props, propName),
          placeholder = document.createComment(node.dataset.for);
  
    node.replaceWith(placeholder);

    const clear = () => {
      /** @type { Node } */
      let n = placeholder;

      while (n = n.nextSibling) {
        if (n instanceof HTMLElement && n.dataset.for == node.dataset.for) {
          n = n.previousSibling;
          n.nextSibling.remove();
        } else {
          break;
        }
      }
    }

    /** @param { Array } list */
    const update = (list) => {
      clear();

      for (let i = 0, /** @type { ChildNode } */ n = placeholder; i < list.length; i++) {
        const c = node.cloneNode(true),
              p = Object.assign({}, props, {
                [entry]: list[i], [index]: i
              });

        done.add(c);
    
        n.after(templateByNode(c, p));
        n = n.nextSibling;
      }
    }

    update(f(list));

    if (isSignal(list)) {
      list.subscribe({next: update}); 
    }
  }
}