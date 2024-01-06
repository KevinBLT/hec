import { signal } from "./signal.js";

export const query = signal({});
export const route = signal(location.pathname);

if (!('URLPattern' in window)) { 
  // @ts-ignore
  window.URLPattern = (await import('./polyfill/urlpattern.js')).URLPattern;
}

export function navigate(path = '') {
  window.history.pushState(null, null, path);
}

/** @type { HTMLMetaElement } */
let meta = document.querySelector('head meta[name="route"]');

if (!meta) {
  meta         = document.createElement('meta');
  meta.name    = 'route';
  meta.content = location.pathname;

  document.head.append(meta);
}

const update = () => {
  meta.content = '';
  
  route(location.pathname);
  query(Object.fromEntries(new URLSearchParams(location.search)));

  meta.content = meta.content || location.pathname;
}

window.addEventListener('popstate',   update);
window.addEventListener('hashchange', update);

const _pushState    = window.history.pushState,
      _replaceState = window.history.replaceState;

window.history.pushState = function pushState(
  /** @type {any} */ data, 
  /** @type {never} */ _, 
  /** @type {string | URL} */ url
) {
  _pushState.call(window.history, data, _, url);
  update();
}

window.history.replaceState = function replaceState(
  /** @type {any} */ data, 
  /** @type {never} */ _, 
  /** @type {string | URL} */ url
) {
  _replaceState.call(window.history, data, _, url);
  update();
}
