import { isSignal } from "../signal.js";
import { f, prop } from "../props.js";

/** @type {{ [key: string]: (node: HTMLInputElement) => any }} */
const valueByType = {
  number:   (node) => node.valueAsNumber,
  date:     (node) => node.valueAsDate,
  text:     (node) => node.value,
  checkbox: (node) => node.checked,
  ['']:     (node) => node.value 
}

/** @type { import("../plugins.js").Plugin<HTMLInputElement> } */
export const dataBindPlugin = {
  select: (node) => node.matches('[data-bind]'),

  run: (node, props) => {
    const key      = node.dataset.bind || node.getAttribute('name'),
          v        = prop(props, key),
          twoDigit = (v) => v < 10 ? `0${ v }`: v.toString();

    if (v) {

      /** @param { any } v  */
      const update = (v) => {
        
        if (node.type == 'checkbox') {
          node.checked = v;
        } else if (node.type == 'date') {

          if (typeof v === 'string') {
            v = new Date(v);
          }

          node.value = v ? `${ twoDigit(v.getFullYear()) }-${ twoDigit(v.getMonth() + 1) }-${ twoDigit(v.getDate()) }` : null;
        } else {
          node.value = v;
        }
      }

      queueMicrotask(() => update(f(v)));

      if (isSignal(v)) {
        v.subscribe({ next: update });

        node.addEventListener('input',  () => v(valueByType[node.type]?.(node) ?? node.value));
        node.addEventListener('change', () => v(valueByType[node.type]?.(node) ?? node.value));
      }
      
    }
  }
}