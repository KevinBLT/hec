/**
 * @param {{
 *   directory?: string,
 *   fileProvider: (request: Request) => Promise<Response>,
 *   indexes?: string[],
 *   index?: string,
 *   errorPages?: { [key: number]: string },
 *   cacheControl?: string
 * }} options
 *
 * @returns { (request: Request) => Promise<Response> }
 *
 * @description
 * Option `fileProvder` is called to retrieve a file
 * Option `index` if this is set, it will serve all requests that don't match a file
 * Option `indexes` is used to append strings the and of a url if it's not found.
 * Option `cacheControl` is used to set a `cache-control` header to the `html` responses.
 * Example using ['.html', 'index.html']:
 *  - request: `/foobar` => /foobar.html
 *  - request: `/foobar/` => /foobar/index.html
 *
 * Option `errorPages` is used to determine a HTML page for a given error status code.
 * Example: { 404: '/404.html' }
 */
export function pages(options: {
    directory?: string;
    fileProvider: (request: Request) => Promise<Response>;
    indexes?: string[];
    index?: string;
    errorPages?: {
        [key: number]: string;
    };
    cacheControl?: string;
}): (request: Request) => Promise<Response>;
