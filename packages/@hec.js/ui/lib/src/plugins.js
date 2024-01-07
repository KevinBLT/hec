import { dataForPlugin } from "./plugins/data-for.js";
import { dataIfPlugin } from "./plugins/data-if.js";
import { dataIncludePlugin } from "./plugins/data-include.js";
import { dataOnPlugin } from "./plugins/data-on.js";
import { dataPreloadPlugin } from "./plugins/data-preload.js";
import { dataRoutePlugin } from "./plugins/data-route.js";

/**
 * @typedef {{
 *   select: string,
 *   run: (arg0: HTMLElement, arg1: {[key: string]: any}) => void
 * }} Plugin
 * 
/** @type { Plugin[] } */
export const plugins = [ 
  dataForPlugin,
  dataRoutePlugin,
  dataIfPlugin,
  dataIncludePlugin,
  dataPreloadPlugin,
  dataOnPlugin
];