/**
 * @param {{
 *   href: string,
 *   type?: string,
 *   as: string,
 *   crossOrigin?: string
 * }} attributes 
 */
export const preload = (attributes) => {

  /** @type { HTMLLinkElement } */
  const link = document.head.querySelector(
    `link[rel="preload"][href="${ attributes.href }"]`
  ) ?? document.createElement('link');

  Object.assign(link, attributes);

  link.rel = 'preload';

  document.head.append(link);
}