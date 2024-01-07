import { signal } from "./signal.js";

/**
 * @template T
 * @template V
 * @param { string } name 
 * @param { T & {[key: string]: V} } props 
 * @param { (props: { [key: string]: import("./signal.js").Signal<V> }) => Node | Promise<Node> } fn 
 */

/**
 * @template T
 * @param { string } name 
 * @param { T } props 
 * @param { (props: {[R in keyof T]: import("./signal.js").Signal<T[R]>}) => Node | Promise<Node> } fn 
 */
export function component(name, props, fn) {

  /** @type { {[R in keyof T]: import("./signal.js").Signal<T[R]>} } */// @ts-ignore
  const signals = Object.fromEntries(Object.entries(props).map(e => [e[0], signal(e[1])]));

  customElements.define(name, class extends HTMLElement {
    static observedAttributes = Object.keys(props);

    connectedCallback() {
      const shadow  = this.attachShadow({ mode: 'open' }),
            node    = fn(signals);

      /** @param { Node } node */
      const append = (node) => {
        shadow.append(node);
        this.dispatchEvent(new CustomEvent('::mount'));

        for (const k in signals) {
          
          if (!this.hasAttribute(k)) {
            this.setAttribute(k, props[k].toString());
          }

          signals[k].subscribe({ 
            next: v => this.setAttribute(k, v.toString()) 
          });
        }
      }

      node instanceof Promise ? node.then(append) : append(node);
    }

    disconnectedCallback() {
      this.dispatchEvent(new CustomEvent('::unmount'));
    }

    /**
     * @param { string } name 
     * @param { string } _ 
     * @param { string } value 
     */
    attributeChangedCallback(name, _, value) {
      if (typeof props[name] == 'number') {
        // @ts-ignore
        signals[name](parseFloat(value));
      } else {
        // @ts-ignore
        signals[name](value);
      }
    }

  });

}