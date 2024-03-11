import { dataMatchPlugin } from "./plugins/data-route.js";
import { dataBindPlugin } from "./plugins/data-bind.js";
import { dataForPlugin } from "./plugins/data-for.js";
import { dataIfPlugin } from "./plugins/data-if.js";
import { dataIncludePlugin } from "./plugins/data-include.js";
import { dataLazyPlugin } from "./plugins/data-lazy.js";
import { dataOnPlugin } from "./plugins/data-on.js";
import { dataRoutePlugin } from "./plugins/data-route.js";
import { dataComponentPlugin } from "./plugins/data-component.js";

/**
 * @template [T=HTMLElement]
 * @typedef {{
 *   select: (node: HTMLElement | HTMLInputElement | SVGElement | HTMLTemplateElement) => boolean,
 *   run: (node: T, props: {[key: string]: any}, stopTemplate: () => void) => void
 * }} Plugin
 */

/** 
 * @template [T=HTMLElement]
 * @type { Plugin<HTMLElement | HTMLInputElement | SVGElement | HTMLTemplateElement>[] } 
 */
export const plugins = [ 
  dataForPlugin,
  dataComponentPlugin,
  dataIfPlugin,
  dataRoutePlugin,
  dataIncludePlugin,
  dataOnPlugin,
  dataBindPlugin,
  dataMatchPlugin,
  dataLazyPlugin,
];