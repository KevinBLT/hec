import { notifyVisible } from "./notify/visible.js";
import { prop, propsOf, setPropsOf } from "./props.js";
import { isSignal, signal } from "./signal.js";

export const componentSelector = '[data-component], [data-view], [data-page]';

new MutationObserver((mutations) => {
  
  for (const mutation of mutations) {

    for (const node of mutation.addedNodes) {
      const matchingType = node instanceof HTMLElement || node instanceof SVGElement;

      if (matchingType && !activeComponents.has(node) && node.matches(componentSelector)) {
        useComponent(node, node.dataset.component ?? node.dataset.view ?? node.dataset.page);
      } else if (matchingType && activeComponents.has(node)) {
        node.dispatchEvent(new CustomEvent('::mount'));
      }
    }

    for (const node of mutation.removedNodes) {
      if (activeComponents.has(node)) {
        node.dispatchEvent(new CustomEvent('::unmount'));
      }
    }
    
  }
}).observe(document, { 
  childList: true, 
  subtree: true 
});

/**
 * @template T
 * @typedef { (
*   props: {[R in keyof T]: import("./signal.js").Signal<T[R]>}, 
*   self: Component
* ) => Element | Node | Promise<Element | Node> } ComponentConstructor
*/

/** @type {{ [key: string]: { observer: MutationObserver, use: (node: Element) => void, component: Component }}} */
const registeredComponents = {};

/** @type { WeakMap<Node, Component> } */
export const activeComponents = new WeakMap();

/**
 * 
 * @param { Element } node 
 * @param { string } component 
 */
export function useComponent(node, component) {
  
  if (registeredComponents[component]) {
    registeredComponents[component].use(node);
    activeComponents.set(node, registeredComponents[component].component);
  }

}

/**
 * @template T
 * @template V
 * @param { string } name 
 * @param { T & {[key: string]: V} } props 
 * @param { (props: { [key: string]: import("./signal.js").Signal<V> }) => Node | Promise<Node> } fn 
 */

class Component {
  
  /** @param { Partial<Component> } options  */
  constructor(options) {
    Object.assign(this, options);
  }

  /** @type { {[R in keyof T]: import("./signal.js").Signal<T[R]>} } */
  signals;

  /** @type { Element } */
  node;

  /** @type {{ [key: string]: any }} */
  props;

  #ready = false;
  #lazy = null;

  /**
   * @param { string } eventName 
   * @param { (event: Event) => void } callback 
   * @param { boolean | AddEventListenerOptions | undefined } options
   */
  on(eventName, callback, options = null) {
    this.node.addEventListener(eventName, callback, options);
  }

  /**
   * @param { string } event 
   * @param { any } data 
   * @param { boolean | undefined } [bubbles=false] 
   */
  emit(event, data = null, bubbles = false) {
    this.node.dispatchEvent(new CustomEvent(event, { 
      detail: data, bubbles 
    }));
  }

  /** @param { ComponentConstructor<T> } fn */
  async insert(fn) {
    this.#lazy ??= this.node.hasAttribute('data-lazy');

    if (this.#lazy && !this.#ready) {
      this.#ready = true;
      this.emit('::load', null, true);
      this.node.removeAttribute('data-lazy');
      await notifyVisible(this.node);
    } else if (this.#ready) {
      return this.emit('::mount');
    } else {
      await Promise.resolve();
      this.emit('::load', null, true);
      this.#ready = true;
    }

    const template = fn(this.signals, this);

    /** @param { Element | Node } node */
    const append = (node) => {
      setPropsOf(this, propsOf(node));

      const slot = node instanceof Element && node.querySelector('slot');

      if (slot) {
        const placeholder = document.createComment('children');

        slot.before(placeholder);
        slot.replaceWith(...this.node.childNodes);
      }

      this.node.append(node);
      
      this.emit('::loaded', null, true);
      
      for (const k in this.props) {
        const attr = this.node.getAttribute(k) ?? '';
        
        if (!this.node.hasAttribute(k)) {
          this.node.setAttribute(k, this.props[k]?.toString());
        }

        if (!attr.startsWith('@')) {
          this.signals[k].subscribe({ 
            next: v => v == null ? this.node.removeAttribute(k) : this.node.setAttribute(k, v.toString())
          });
        }
      }

      this.node.dispatchEvent(new CustomEvent('::mount'));
    }

    append(template instanceof Promise ? await template : template);
  }

  /** 
   * @param { string } key 
   * @returns { [ any, import("./signal.js").Signal<any> ] }
   */
  propSignalByLowerKey(key = '') {
    key = key.toLowerCase();

    for (const k in this.signals) {
      if (k.toLowerCase() == key) {
        return [ this.props[k], this.signals[k] ];
      }
    }

    return [null, null];
  }

  /**
   * @param { string } name 
   * @param { string } _ 
   * @param { string } value 
   */
  attributeChange(name, _, value) {
    const [ p, signal ] = this.propSignalByLowerKey(name);

    if (value?.startsWith('@')) { // @ts-ignore
      const parent      = this.node.parentNode,
            key         = value.slice(1),
            parentProp  = prop(propsOf(parent), key) ?? prop(propsOf(this.node), key);

      if (isSignal(parentProp)) {
        this.signals[name] = parentProp;
      } else {
        signal(parentProp);
      }
            
    } else {
      // @ts-ignore
      signal(typeof p == 'number' ? parseFloat(value) : value);
    } 
  }
};

/**
 * @template T
 * @param { string } name 
 * @param { T } props 
 * @param { ComponentConstructor<T>} fn 
 */
export function component(name, props, fn) {

  registeredComponents[name] ??= {
    observer: new MutationObserver(
      (mutations) => {
        for (const mutation of mutations) {
          if (mutation.target instanceof Element) {
            activeComponents.get(mutation.target)?.attributeChange(
              mutation.attributeName,
              mutation.oldValue,
              mutation.target.getAttribute(mutation.attributeName)
            );
          }
        }
      }
    ),

    component: null,

    use(node) {

      this.component = new Component({
        signals: Object.fromEntries(Object.entries(props).map(e => [e[0], signal(e[1])])),
        props, node
      }),

      this.component.insert(fn);

      this.observer.observe(node, {
        attributes: true,
        attributeOldValue: true,
        attributeFilter: Object.keys(props).map(e => e.toLowerCase())
      });
    }
  };

  const selector = componentSelector.replaceAll(']', `="${ name }"]`);

  for (const node of document.querySelectorAll(selector)) {
    useComponent(node, name);
  }
}

export const view = component;
export const page = component;