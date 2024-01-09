import { dataBindPlugin } from "./plugins/data-bind.js";
import { dataForPlugin } from "./plugins/data-for.js";
import { dataIfPlugin } from "./plugins/data-if.js";
import { dataIncludePlugin } from "./plugins/data-include.js";
import { dataLazyPlugin } from "./plugins/data-lazy.js";
import { dataOnPlugin } from "./plugins/data-on.js";
import { dataPreloadPlugin } from "./plugins/data-preload.js";
import { dataRoutePlugin } from "./plugins/data-route.js";

/**
 * @typedef {{
 *   select: string,
 *   run: (node: HTMLElement, props: {[key: string]: any}, stopTemplate: () => void) => void
 * }} Plugin
 * 
 * 
/** @type { Plugin[] } */
export const plugins = [ 
  dataForPlugin,
  dataRoutePlugin,
  dataIfPlugin,
  dataIncludePlugin,
  dataPreloadPlugin,
  dataOnPlugin,
  dataBindPlugin,
  dataLazyPlugin,
];