/**
 * @template T
 *
 * @param {{
 *   directory?: string,
 *   fileProvider: (request: Request) => Promise<Response>,
 *   indexes?: string[],
 *   spaPath?: string,
 *   errorPages?: { [key: number]: string }
 * }} options
 *
 * @returns { import('../../types/src/routing/route.js').RouteRequest<T> }
 *
 * @description
 * Option `fileProvder` is called to retrieve a file
 * Option `spaPath` if this is set, it will serve all requests
 * Option `indexes` is used to append strings the and of a url if it's not found.
 * Example using ['.html', 'index.html']:
 *  - request: `/foobar` => /foobar.html
 *  - request: `/foobar/` => /foobar/index.html
 *
 * Option `errorPages` is used to determine a HTML page for a given error status code.
 * Example: { 404: '/404.html' }
 */
export function pages<T>(options: {
    directory?: string;
    fileProvider: (request: Request) => Promise<Response>;
    indexes?: string[];
    spaPath?: string;
    errorPages?: {
        [key: number]: string;
    };
}): import("../../types/src/routing/route.js").RouteRequest<T>;
