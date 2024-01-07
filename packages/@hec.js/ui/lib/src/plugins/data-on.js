import { prop } from "../value.js";

/** @type { import("../plugins.js").Plugin } */
export const dataOnPlugin = {
  select: '[data-on]',

  run: (node, props) => {
    const params = node.dataset.on.split(':'),
          eventName = params[0],
          funcName  = params.at(-1),
          handler   = prop(props, funcName);

    node.addEventListener(eventName, handler);
  }
}