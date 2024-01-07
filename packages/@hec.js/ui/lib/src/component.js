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

  customElements.define(name, class extends HTMLElement {
    static observedAttributes = Object.keys(props);

    /** @type { {[R in keyof T]: import("./signal.js").Signal<T[R]>} } */// @ts-ignore
    #signals = Object.fromEntries(Object.entries(props).map(e => [e[0], signal(e[1])]));

    connectedCallback() {
      const shadow  = this.attachShadow({ mode: 'open' }),
            node    = fn(this.#signals);

      /** @param { Node } node */
      const append = (node) => {
        shadow.append(node);
        this.dispatchEvent(new CustomEvent('::mount'));

        for (const k in this.#signals) {
          
          if (!this.hasAttribute(k)) {
            this.setAttribute(k, props[k].toString());
          }

          this.#signals[k].subscribe({ 
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
        this.#signals[name](parseFloat(value));
      } else {
        // @ts-ignore
        this.#signals[name](value);
      }
    }

  });

}