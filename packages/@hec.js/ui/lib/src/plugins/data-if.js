import { isSignal } from "../signal.js";
import { f, prop } from "../props.js";
import { templateByNode } from "../template.js";

/** @type { import("../plugins.js").Plugin } */
export const dataIfPlugin = {
  select: (node) => node.matches('[data-if], [data-if-not]'),

  run: (node, props) => {
    const key         = node.dataset.if || node.dataset.ifNot,
          condition   = prop(props, key),
          negate      = !!node.dataset.ifNot,
          placeholder = document.createComment((negate ? 'if not:' : 'if: ') + key),
          update      = nodeUpdater(node, placeholder, props, negate);
          
    node.replaceWith(placeholder);
    
    update(f(condition));

    node.removeAttribute('data-group');

    if (isSignal(condition)) {
      condition.subscribe({next: update}); 
    }    
  }
}

/**
 * @param { HTMLElement | SVGElement } node 
 * @param {{ [key: string]: any }} props 
 * @returns { (HTMLElement | SVGElement | ChildNode)[] }
 */
export function nodesBy(node, props) {

  if ('group' in node.dataset && node instanceof HTMLTemplateElement) {
    const nodes = Array.from(node.content.childNodes);

    for(const node of nodes) {
      templateByNode(node, props);
    }

    return nodes;
  }
  
  return [node];
}

/**
 * 
 * @param { HTMLElement } node 
 * @param { Comment } placeholder 
 * @param {{ [key: string]: any }} props 
 * @param { boolean | undefined} negate 
 * @returns 
 */
export function nodeUpdater(node, placeholder, props, negate = false) {
   const nodes = nodesBy(node, props), inHead = !!node.closest('head');

   /** @param { boolean } condition */ 
   return (condition) => {
    condition = negate ? !condition : condition;

    if (!node.parentNode && condition) {
      node.hidden = false;
      placeholder.replaceWith(...nodes);
    } else if (!placeholder.parentNode && !condition && !inHead) {
      for (const node of nodes) {
        node.replaceWith(placeholder);
      }
    }
  }
}