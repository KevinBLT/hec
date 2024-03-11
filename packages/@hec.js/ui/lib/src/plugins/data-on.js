import { prop } from "../props.js";

/** @type { import("../plugins.js").Plugin } */
export const dataOnPlugin = {
  select: '[data-on]',

  run: (node, props) => {

    console.log(node);

    /** @param { string } on */
    const addHander = (on) => {
      const params    = on.split(':'),
            eventName = params[0].trim(),
            funcName  = params.at(-1).trim(),
            handler   = prop(props, funcName);
      
      if (handler) {
        node.addEventListener(eventName, handler);
      }
    }
   
    for (const on of node.dataset.on.split(',')) {
      addHander(on);
    }
  }
}