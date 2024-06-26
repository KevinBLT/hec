import { expression } from './expression.js';
import { pipes } from './pipes.js';
import { plugins } from './plugins.js';
import { isSignal } from './signal.js';
import { f, prop } from './props.js';

/** @type {{ [key: string]: Promise<HTMLTemplateElement> }} */
const templatesLoading = {};

/** @type { WeakMap<Node, { [key: string]: any }> } */
export const nodeProps = new WeakMap();

/** @type { WeakSet<Node> } */
const done = new WeakSet();

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
  let tmpl = document.querySelector(`template[name="${name}"]`);

  if (!tmpl) {
    /** @type { HTMLMetaElement } */
    const meta = document.querySelector('head meta[name="template-path"]');

    templatesLoading[name] ??= new Promise(async (resolve) => {
      tmpl = document.createElement('template');

      tmpl.setAttribute('id', name.toString());
      tmpl.innerHTML = await fetch(
        meta?.content?.replaceAll('[name]', name.toString()) ?? name
      ).then((r) => r.text());

      document.body.append(tmpl);

      resolve(tmpl);
    });

    return templatesLoading[name].then(e => templateByNode(e.content.cloneNode(true), props));
  }

  return templateByNode(tmpl.content.cloneNode(true), props);
}

/**
 * @param { string } template
 * @param { {[key: string]: any } } props
 */
export function templateByString(template, props = {}) {
  const tmpl = document.createElement('template');
  
  tmpl.innerHTML = template;

  return templateByNode(tmpl.content.cloneNode(true), props);
}

/**
 * @param { Node } template
 * @param { {[key: string]: any } } props
 */
export function templateByNode(template, props = {}) {
  nodeProps.set(template, props);

  /** @param { Node } node */
  const findExpression = (node) => {
    let stopFlag = false;

    if (done.has(node)) {
      return;
    }

    if (node instanceof HTMLElement || node instanceof SVGElement) {

      for (const plugin of plugins) {
        if (plugin.select(node)) {
          plugin.run(node, props, () => stopFlag = true);    
        }
      }

      if (node.parentNode || !node.dataset.for) {
        executeNodeAttributesTemplate(node, props);
      }

      if (stopFlag) {
        return;
      }      
      
    } else if (node instanceof Text && node.textContent.includes('{{')) {
      const parts = node.textContent.split(/{{|}}/g);

      for (let i = 0, last = node, text; i < parts.length; i++) {
        text = document.createTextNode(parts[i]);

        if ((i % 2) != 0) {
          bindExpressions(`{{${parts[i]}}}`, props, (v) => text.data = v);
        }

        done.add(text);
        last.after(text);
        last = text;
      }

      node.remove();
    }

    done.add(node);

    for (const child of node.childNodes) {
      findExpression(child);
    }
  };

  findExpression(template);

  return template;
}

/**
 * @param { HTMLElement | SVGElement } node 
 * @param { {[key: string]: any } } props
 */
export const executeNodeAttributesTemplate = (node, props) => {
  const attributeNames = node.getAttributeNames();

  for (const attributeName of attributeNames) {
    const attribute = node.getAttribute(attributeName);
  
    if (attribute?.includes('{{')) {
      
      bindExpressions(attribute, props, (text) => {
        text = text.replace(/ +/, ' ').trim();

        if (text === 'undefined' || text === 'null') {
          node.removeAttribute(attributeName);
        } else {
          node.setAttribute(attributeName, text);
        }
      });
    }
  }
}

/**
 * @param { string } text
 * @param { {[key: string]: any } } props
 * @param { (value: string | any) => void } update
 * @param { boolean } [asString=true] asString 
 */
export const bindExpressions = (text, props, update, asString = true) => {

  /** @type {import("./expression.js").Expression[]} */
  let expressions = text.match(/{{[^}]+}}/g)?.map(expression) ?? [],
      sourceText  = text;

  if (!asString && !expressions.length) {
    expressions = [{ prop: text, meta: {} }];
  }

  const evaluate = () => {
    text = sourceText;

    for (const exp of expressions) {
      text = text.replace(exp.text, f(exp.value));
    }

    return text;
  };

  for (const exp of expressions) {
    let value = null;

    if (exp.prop?.[exp.prop.length - 1] === ')') {
      const propSplit = exp.prop.split('('),
            provider  = prop(props, propSplit[1].substring(0, propSplit[1].length - 1).trim()),
            propKey   = propSplit[0].trim();

      value = prop(props, propKey);
      value = value();

      value.provide(f(provider), exp.meta);

      if (isSignal(provider)) {
        provider.subscribe({ next: (v) => value.provide(f(v), exp.meta) });
      }

    } else {
      value = prop(props, exp.prop);
    }

    if (value === undefined && !Object.keys(exp.meta).length) {
      console.warn(`{{ ${exp.prop} }}: No value for this key`, { key: exp.prop, value });
    }

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

      signal.subscribe({ next: (v) => update(asString ? evaluate() : v) });

      !asString && value.update(f(value));
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
      !asString && update(v);
    }
  }

  asString && update(evaluate());
};
