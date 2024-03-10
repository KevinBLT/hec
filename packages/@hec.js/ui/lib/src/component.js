import { notifyVisible } from "./notify/visible.js";
import { prop, propsOf, setPropsOf } from "./props.js";
import { isSignal, signal } from "./signal.js";

export const componentSelector = '[data-component], [data-view], [data-page]';

// TODO: Simplify this file?

/**
 * @param { string } name 
 * @param { Element } root
 */
const updateComponents = (name, root = document.body, exec = useComponent) => {
  const selector = componentSelector.replaceAll(']', `="${ name }"]`);

  if (root.matches(selector)) {
    exec(root, name);
  }

  for (const node of root.querySelectorAll(selector)) {
    exec(node, name);
  }
}

new MutationObserver((mutations) => {
  
  for (const mutation of mutations) {

    for (const node of mutation.addedNodes) {
      for (const key of Object.keys(registeredComponents)) {
        updateComponents(key);
      }
    }

    for (const node of mutation.removedNodes) {
      for (const key of Object.keys(registeredComponents)) {
        if (node instanceof Element) {
          updateComponents(key, node, (node) => node.dispatchEvent(new CustomEvent('::unmount')));
        }
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
*   props: {[R in keyof T]?: import("./signal.js").Signal<T[R]>}, 
*   self: Element
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
  
  if (activeComponents.has(node) || !registeredComponents[component]) {
    return;
  }
  
  registeredComponents[component].use(node);
  activeComponents.set(node, registeredComponents[component].component);
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

  /** @type { {[R in keyof T]?: import("./signal.js").Signal<T[R]>} } */
  signals = {};

  /** @type { Element } */
  node;

  /** @type {{ [key: string]: any }} */
  props;

  #lazy = null;

  /** @param { ComponentConstructor<T> } fn */
  async insert(fn) {
    this.#lazy ??= this.node.hasAttribute('data-lazy');

    if (this.#lazy) {
      this.node.dispatchEvent(new CustomEvent('::load'));
      this.node.removeAttribute('data-lazy');
      await notifyVisible(this.node);
    } else {
      this.node.dispatchEvent(new CustomEvent('::load'));
      await Promise.resolve();
    }

    const template = fn(this.signals, this.node);

    /** @param { Element | Node } node */
    const append = (node) => {
      setPropsOf(this, propsOf(node));

      const children = Array.from(this.node.childNodes);

      this.node.append(node);

      if (children.length) {
        const slot          = this.node.querySelector('slot'),
              childrenStart = document.createComment('children/'),
              childrenEnd   = document.createComment('/children');

        if (slot) {
          slot.replaceWith(childrenStart, ...children, childrenEnd);
        } else {
          this.node.append(childrenStart, ...children);
        }
      } 

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

      this.node.dispatchEvent(new CustomEvent('::loaded'));
      this.node.dispatchEvent(new CustomEvent('::mount'));
    }

    append(template instanceof Promise ? await template : template);
  }

  /**
   * @param { string } name 
   * @param { string } _ 
   * @param { string } value 
   */
  attributeChange(name, _, value) {
    const property = Object.entries(this.props).filter(e => e[0].toLowerCase() == name)[0];
    
    if (value?.startsWith('@')) { 
      const parent      = this.node.parentNode,
            key         = value.slice(1),
            parentProp  = prop(propsOf(parent), key) ?? prop(propsOf(this.node), key);

      if (isSignal(parentProp)) {
        this.signals[name] = parentProp;
      } else {
        this.signals[property[0]] ??= signal(parentProp);
        this.signals[property[0]](parentProp);
      }
            
    } else {
      this.signals[property[0]] ??= signal(value);
      this.signals[property[0]](typeof property[1] == 'number' ? parseFloat(value) : value);
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

      this.component = new Component({ props, node });

      for (const key of Object.keys(props)) {
        this.component.attributeChange(key, null, node.getAttribute(key) ?? props[key]);
      }

      this.component.insert(fn);
      
      this.observer.observe(node, {
        attributes: true,
        attributeOldValue: true,
        attributeFilter: Object.keys(props).map(e => e.toLowerCase())
      });
    }
  };

  updateComponents(name, document.body);
}

export const view = component;
export const page = component;