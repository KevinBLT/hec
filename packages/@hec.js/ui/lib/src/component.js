import { emit } from "./event.js";
import { prop } from "./props.js";
import { isSignal, signal } from "./signal.js";

export const componentSelector = '[data-component], [data-view], [data-page]';

export const components = new Map();

/** @type { WeakMap<Node, (attribute: string) => void> } */
export const componentUpdate = new WeakMap();

const attributeObserver = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    if (componentUpdate.has(mutation.target)) {
      componentUpdate.get(mutation.target)(mutation.attributeName);
    }
  }
});

/**
 * @template T
 * @typedef { (
*   props: {[R in keyof T]?: import("./signal.js").Signal<T[R]>}, 
*   self: Element
* ) => Element | Node | Promise<Element | Node> } ComponentConstructor
*/

/**
 * @template T
 * @param { string } name 
 * @param { T } props 
 * @param { ComponentConstructor<T>} fn 
 */
export function component(name, props, fn) {
  
  components.set(name, async (
    /** @type { Element } */ node,
    /** @type {{ [key: string]: any }} */ context
  ) => {
    const signals  = {},
          children = Array.from(node.childNodes);

    const attributeUpdate = (attribute) => {
      const v = node.getAttribute(attribute);

      for (const p in signals) {
        if (p.toLowerCase() == attribute) {
          signals[p](typeof props[p] == 'number' ? parseFloat(v) : v)
        }
      }
    }

    for (const p in props) {
      const v = node.getAttribute(p);

      if (typeof v === 'string' && v.startsWith('@')) {
        const pv = prop(context, v.substring(1));
        // @ts-ignore
        signals[p] = isSignal(pv) ? pv : signal(pv);
      } else {
        // @ts-ignore
        signals[p] = signal(typeof props[p] == 'number' ? parseFloat(v) : v);
        // @ts-ignore
        signals[p].subscribe({ next: (v) => v ? node.setAttribute(p, v) : node.removeAttribute(p) });
      }
    }

    attributeObserver.observe(node, { 
      attributeFilter: Object.keys(props).map(e => e.toLowerCase()) 
    });

    componentUpdate.set(node, attributeUpdate);

    let fragment = fn(signals, node);

    if (fragment instanceof Promise) {
      fragment = await fragment;
    }

    node.append(fragment);

    if (children.length) {
      const slot          = node.querySelector('slot'),
            childrenStart = document.createComment('children/'),
            childrenEnd   = document.createComment('/children');

      if (slot) {
        slot.replaceWith(childrenStart, ...children, childrenEnd);
      } else {
        node.append(childrenStart, ...children);
      }
    }

    node.dispatchEvent(new CustomEvent('::mount'));
  });

  emit('::component/' + name);
}

export const view = component;
export const page = component;