import { signal } from "./signal.js";

export const query = signal({});
export const route = signal(location.pathname);

const _pushState    = window.history.pushState,
      _replaceState = window.history.replaceState,
      state         = { updateQueued: false };

/** 
 * @typedef {{  
 *  pattern?: URLPattern,
 *  update: (visible: boolean) => void, 
 *  group?: Route[],
 *  path: string,
 *  node: (HTMLElement | SVGElement)
 * }} Route
 * @type { Route[] }
 */
const routes = [];

/** @type { WeakMap<Node, Route> } */
const routingNodes = new WeakMap();

/**
 * @param { Route } a 
 * @param { Route } b 
 * @returns { number }
 */
export function routeCompare(a,b) {
  let ap = Array.from(a.path.matchAll(/\:/g)).length * 25,
      bp = Array.from(b.path.matchAll(/\:/g)).length * 25;

  ap += Array.from(a.path.matchAll(/\*/g)).length * 150;
  bp += Array.from(b.path.matchAll(/\*/g)).length * 150;

  return ap - bp;
}

/** @param { Route } route  */
export function addRoute(route) {
  let node         = route.node,
      path         = route.path,
      parent       = node.parentElement?.closest('[data-route]'),
      parentRoute  = routingNodes.get(parent),
      parentPath   = parentRoute?.pattern?.pathname,
      targetRoutes = parentRoute?.group ?? routes;

  route.group = [];

  routingNodes.set(node, route);

  if (parentPath) {
    path = path == '/' ? '' : path;
    path = parentPath.replaceAll(/[^\/a-zA-Z0-9]+$/gm, '') + path.replaceAll(/^[^\/a-zA-Z0-9]+/gm, '');
  }

  path = path.replaceAll(/\/+/g, '/').replace(/\/$/m, '');

  route.pattern = new URLPattern({ pathname: !path ? '/' : path });
    
  targetRoutes.push(route);
  targetRoutes.sort(routeCompare);

  if (state.updateQueued) {
    state.updateQueued = true;

    queueMicrotask(updateRouting);
  }
}

export function navigate(path = '') {
  window.history.pushState(null, null, path);
}

/** @type { HTMLMetaElement } */
const meta = document.querySelector('head meta[name="route"]') || document.createElement('meta');

meta.name    = 'route';
meta.content = location.pathname;

document.head.append(meta);

export const updateRouting = () => {
  const href = location.href.replace(/index\.*[a-z0-9]*$/gm, '');

  route(href);
  query(Object.fromEntries(new URLSearchParams(location.search)));

  let hasFullMatch = false;

  /** @param { Route[] } routes */
  const updateGroup = (routes) => {
    let hasMatch = false;

    for (const route of routes) {
      const isMatch = route.pattern.test(href);

      route.update(!hasMatch && isMatch);
      
      if (!hasMatch && isMatch) {
        hasMatch = true;

        if (route.group.length) {
          updateGroup(route.group);
        } else {
          hasFullMatch = true;
          meta.content = route.pattern.pathname;
        }
      }
    }

    return hasFullMatch;
  }

  state.updateQueued = false;

  return updateGroup(routes);
}

const onNavigate = (event) => {
  const href = event.target.closest('a')?.href,
        url  = new URL(href, location.href);

  if (href && url.hostname == location.hostname) {
    if (routes.some(e => e.pattern.test(href))) {
      _pushState.call(window.history, null, null, href);

      if (updateRouting()) {
        event.preventDefault();
      }
    }
  }

}

window.addEventListener('popstate',   updateRouting);
window.addEventListener('hashchange', updateRouting);
window.addEventListener('click',      onNavigate);

window.history.pushState = function pushState(
  /** @type {any} */ data, 
  /** @type {never} */ _, 
  /** @type {string | URL} */ url
) {
  _pushState.call(window.history, data, _, url);

  updateRouting();
}

window.history.replaceState = function replaceState(
  /** @type {any} */ data, 
  /** @type {never} */ _, 
  /** @type {string | URL} */ url
) {
  _replaceState.call(window.history, data, _, url);

  updateRouting();
}