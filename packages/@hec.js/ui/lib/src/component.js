import { notifyVisible } from "./notify/visible.js";
import { f, nodeProps, prop, propsOf } from "./props.js";
import { isSignal, signal } from "./signal.js";

/**
 * @template T
 * @template V
 * @param { string } name 
 * @param { T & {[key: string]: V} } props 
 * @param { (props: { [key: string]: import("./signal.js").Signal<V> }) => Node | Promise<Node> } fn 
 */

/**
 * @typedef { { 
 *   on: (
 *     eventName: string, 
 *     fn: (event: Event) => void, 
 *     options: boolean | AddEventListenerOptions
 *   ) => void 
 * } & HTMLElement } Component
 */

/**
 * @template T
 * @param { string } name 
 * @param { T } props 
 * @param { (
 *   props: {[R in keyof T]: import("./signal.js").Signal<T[R]>}, 
 *   self: Component
 * ) => Node | Promise<Node> } fn 
 */
export function component(name, props, fn) {

  customElements.define(name, class extends HTMLElement {
    static observedAttributes = Object.keys(props).map(e => e.toLowerCase());

    /** @type { {[R in keyof T]: import("./signal.js").Signal<T[R]>} } */// @ts-ignore
    #signals = Object.fromEntries(Object.entries(props).map(e => [e[0], signal(e[1])]));

    /** @type {{ [key: string]: AbortController }} */
    #aborts = {};

    /**
     * @param { string } eventName 
     * @param { (event: Event) => void } callback 
     * @param { boolean | AddEventListenerOptions } options
     */
    on(eventName, callback, options = null) {
      this.addEventListener(eventName, callback, options);
    }

    querySelector(selector) {
      return this.shadowRoot.querySelector(selector);
    }

    querySelectorAll(selector) {
      return this.shadowRoot.querySelectorAll(selector);
    }

    async connectedCallback() {
      const hidden = this.closest('[hidden]');

      if (this.hasAttribute('data-lazy') && hidden) {
        await notifyVisible(this, hidden);
        this.removeAttribute('data-lazy');
      }

      this.dispatchEvent(new CustomEvent('::load', { bubbles: true }));

      const shadow = this.attachShadow({ mode: 'open' }),
            node   = fn(this.#signals, this);

      /** @param { Node } node */
      const append = (node) => {
        const exProps = nodeProps.get(this);
        
        nodeProps.set(
          this, Object.assign(propsOf(node), (typeof exProps === 'object' ? exProps : null) ?? {})
        );

        this.dispatchEvent(new CustomEvent('::loaded', { bubbles: true }));

        shadow.append(node);

        this.#aborts['::attributes'] = new AbortController();
        
        for (const k in this.#signals) {
          
          if (!this.hasAttribute(k)) {
            this.setAttribute(k, props[k].toString());
          }

          this.#signals[k].subscribe({ 
            next: v => this.setAttribute(k, v.toString()) 
          }, { signal: this.#aborts['::attributes'].signal });
        }

        this.dispatchEvent(new CustomEvent('::mount'));
      }

      append(node instanceof Promise ? await node : node);
    }

    disconnectedCallback() {
      nodeProps.delete(this);

      for (const k in this.#aborts) {
        this.#aborts[k].abort();
        delete this.#aborts[k];
      }

      this.dispatchEvent(new CustomEvent('::unmount'));
    }

    /** 
     * @param { string } key 
     * @returns { [ any, import("./signal.js").Signal<any> ] }
     */
    #propSignalByLowerKey(key = '') {
      key = key.toLowerCase();

      for (const k in this.#signals) {
        if (k.toLowerCase() == key) {
          return [ props[k], this.#signals[k] ];
        }
      }

      return [ null, null];
    }

    /**
     * @param { string } name 
     * @param { string } _ 
     * @param { string } value 
     */
    attributeChangedCallback(name, _, value) {
      const [ p, signal ] = this.#propSignalByLowerKey(name);

      if (value.startsWith('@parent.')) { // @ts-ignore
        const parent      = this.parentNode.host || this.parentNode,
              parentProps = propsOf(parent),
              parentProp  = prop(parentProps, value.slice(8));

        if (isSignal(parentProp)) {
          this.#aborts[p]?.abort(); 
          this.#aborts[p] = new AbortController();
          
          signal(f(parentProp));
          
          parentProp.subscribe({ next: signal }, {
            signal: this.#aborts[p].signal
          });

        } else {
          signal(parentProp);
        }
              
      } else if (typeof p == 'number') {
        // @ts-ignore
        signal(parseFloat(value));
      } else {
        // @ts-ignore
        signal(value);
      }
    }

  });

}