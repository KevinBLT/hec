import { notifyVisible } from "./notify/visible.js";
import { deletePropsOf, f, prop, propsOf, setPropsOf } from "./props.js";
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
 *   emit: (event: string, data?: null, bubbles?: boolean) => void,
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

    #ready = false;

    #lazy  = null;

    /**
     * @param { string } eventName 
     * @param { (event: Event) => void } callback 
     * @param { boolean | AddEventListenerOptions | undefined } options
     */
    on(eventName, callback, options = null) {
      this.addEventListener(eventName, callback, options);
    }

    /**
     * @param { string } event 
     * @param { any } data 
     * @param { boolean | undefined } [bubbles=false] 
     */
    emit(event, data = null, bubbles = false) {
      this.dispatchEvent(new CustomEvent(event, { 
        detail: data, bubbles 
      }));
    }

    async connectedCallback() {
      this.#lazy ??= this.hasAttribute('data-lazy');

      if (this.#lazy && !this.#ready) {
        this.#ready = true;
        this.emit('::load', null, true);
        this.removeAttribute('data-lazy');
        await notifyVisible(this);
      } else if (this.#ready) {
        return this.emit('::mount');
      } else {
        await Promise.resolve();
        this.emit('::load', null, true);
        this.#ready = true;
      }

      const shadow = this.shadowRoot ?? this.attachShadow({ mode: 'open' }),
            node   = fn(this.#signals, this);

      /** @param { Node | Element } node */
      const append = (node) => {
        setPropsOf(this, propsOf(node));

        if ('querySelector' in node) {
          const slot = node.querySelector('slot');

          if (slot) {
            while (slot.firstChild) {
              this.append(slot.firstChild);
            }
          }
        }

        shadow.append(node);
        
        this.emit('::loaded', null, true);
        
        for (const k in props) {
          const attr = this.getAttribute(k) ?? '';
          
          if (!this.hasAttribute(k)) {
            this.setAttribute(k, props[k].toString());
          }
 
          if (!attr.startsWith('@parent.')) {
            this.#aborts[k] ??= new AbortController();
  
            this.#signals[k].subscribe({ 
              next: v => this.setAttribute(k, v.toString()) 
            }, { signal: this.#aborts[k].signal });
          }
        }

        this.dispatchEvent(new CustomEvent('::mount'));
      }

      append(node instanceof Promise ? await node : node);
    }

    disconnectedCallback() {
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

      if (value?.startsWith('@parent.')) { // @ts-ignore
        const parent      = this.parentNode.host || this.parentNode,
              key         = value.slice(8),
              parentProp  = prop(propsOf(parent), key) ?? prop(propsOf(this), key);

        if (isSignal(parentProp)) {
          this.#aborts[name]?.abort(); 
          this.#aborts[name]  = new AbortController();
          this.#signals[name] = parentProp; 
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