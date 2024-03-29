import { isSignal } from "../signal.js";
import { templateByNode } from "../template.js";
import { f, prop } from "../props.js";
import { loaded } from "./data-include.js";

const done = new WeakSet();

/** @type { import("../plugins.js").Plugin } */
export const dataForPlugin = {
  select: (node) => node.matches('[data-for]'),
  
  run: (node, props, stopTemplate) => {

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

    loaded.add(node);

    const clear = () => {
      /** @type { Node } */
      let n = placeholder;

      while (n = n.nextSibling) {
        if ((n instanceof HTMLElement || n instanceof SVGElement) && n.dataset.for == node.dataset.for) {
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

      if (!list || !list[Symbol.iterator]) {
        return console.warn('data-for: The value given is not iterable.', { key: propName, value: list });
      }

      for (let i = 0, /** @type { ChildNode } */ n = placeholder; i < list.length; i++) {
        const c = node.cloneNode(true),
              p = Object.assign({}, props, { [entry]: list[i], [index]: i });

        done.add(c);
        n.after(c);
        templateByNode(c, p);
        n = n.nextSibling;
      }
    }

    queueMicrotask(() => update(f(list)));

    if (isSignal(list)) {
      list.subscribe({next: update}); 
    }

    stopTemplate();
  }
}