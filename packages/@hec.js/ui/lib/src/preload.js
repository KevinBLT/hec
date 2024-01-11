/**
 * @param {{
 *   href: string,
 *   type?: string,
 *   as: string,
 *   crossOrigin?: string
 * }} attributes 
 */
export const preload = (attributes) => {
  const link = document.createElement('link');

  Object.assign(link, attributes);

  link.rel = 'preload';

  document.head.append(link);
}