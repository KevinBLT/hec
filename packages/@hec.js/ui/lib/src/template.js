import { expression } from './expression.js';
import { pipes } from './pipes.js';
import { plugins } from './plugins.js';
import { isSignal } from './signal.js';
import { f, nodeProps, prop } from './props.js';

/** @type {{ [key: string]: Promise<HTMLTemplateElement> }} */
const templatesLoading = {}

/**
 * @param { string | URL } name
 * @param { {[key: string]: any } } props
 * @returns { Node | Promise<Node> }
 */
export function templateByName(name, props = {}) {

  if (name instanceof URL) {
    name = name.host == location.host ? name.pathname : name.toString();
  }

  /** @type { HTMLTemplateElement } */
  let tmpl = document.querySelector(`template[data-name="${name}"]`);

  if (!tmpl) {
    /** @type { HTMLMetaElement } */
    const meta = document.querySelector('head meta[name="template-path"]');

    templatesLoading[name] ??= new Promise(async (resolve) => {
      tmpl = document.createElement('template');

      tmpl.dataset.name = name.toString();
      tmpl.innerHTML = await fetch(
        meta?.content?.replaceAll('[name]', name.toString()) ?? name
      ).then((r) => r.text());

      document.body.append(tmpl);

      resolve(tmpl);
    });

    return templatesLoading[name].then(e => templateByNode(e.content.cloneNode(true), props));
  }

  return templateByNode(tmpl.content.cloneNode(true).lastChild, props);
}

/**
 * @param { string } template
 * @param { {[key: string]: any } } props
 */
export function templateByString(template, props = {}) {
  const tmpl = document.createElement('template');
  
  tmpl.dataset.name = 'anonymous';
  tmpl.innerHTML = template;

  return templateByNode(tmpl.content.cloneNode(true), props);
}

/**
 * @param { Node } template
 * @param { {[key: string]: any } } props
 */
export function templateByNode(template, props = {}) {

  if (nodeProps.has(template)) {
    return;
  }

  /**
   * @param { string } text
   * @param { function(string): void } update
   */
  const bindExpressions = (text, update) => {

    /** @type {import("./expression.js").Expression[]} */
    let expressions = text.match(/{{[^}]+}}/g).map(expression),
      sourceText = text;

    const evaluate = () => {
      text = sourceText;

      for (const exp of expressions) {
        text = text.replace(exp.text, f(exp.value));
      }

      return text;
    };

    for (const exp of expressions) {
      const value = prop(props, exp.prop);

      if (isSignal(value)) {
        /** @type { import("./signal.js").Signal<any> } */
        let signal = value;

        for (const key in exp.meta) {
          if (pipes[key]) {
            const pipe = pipes[key];

            signal = signal.map((v) =>
              pipe({
                value: v,
                key: exp.prop,
                param: exp.meta[key],
                options: exp.meta,
              })
            );
          }
        }

        exp.value = signal;

        signal.subscribe({ next: () => update(evaluate()) });
      } else {
        
        let v = value;
        
        for (const key in exp.meta) {

          if (pipes[key]) {
            const pipe = pipes[key];

            v = pipe({
              value: f(value),
              key: exp.prop,
              param: exp.meta[key],
              options: exp.meta,
            });
          }
        }

        exp.value = () => v;
      }
    }

    update(evaluate());
  };

  /** @param { Node } node */
  const findExpression = (node) => {
    const parentNode = node.parentNode;

    if (node.nodeName == '#document-fragment') {
      nodeProps.set(node, props);
    }

    if (node instanceof HTMLElement) {
      
      nodeProps.set(node, props);

      for (const plugin of plugins) {
        if (node.matches(plugin.select)) {
          plugin.run(node, props);
        }
      }

      if (parentNode === node.parentNode) {
        const attributeNames = node.getAttributeNames();
        
        for (const attributeName of attributeNames) {
          const attribute = node.getAttribute(attributeName);
  
          if (attribute.includes('{{')) {
            
            bindExpressions(attribute, (text) => {
              node.setAttribute(attributeName, text.trim().replace(/ +/, ' '))
            });

          } else if (node.localName.includes('-') && props[attribute]) {
            node.setAttribute(attributeName, `@parent.${attribute}`);
          }
        }
      }
      
    } else if (node instanceof Text && node.textContent.includes('{{')) {
      bindExpressions(node.textContent, (text) => (node.textContent = text));
    }

    if (parentNode === node.parentNode) {
      for (const child of node.childNodes) {
        findExpression(child);
      }
    }
  };

  findExpression(template);

  return template;
}
