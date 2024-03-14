import path from 'path';

/**
 * @param {{
 *   directory?: string,
 *   fileProvider: (request: Request) => Promise<Response>,
 *   indexes?: string[],
 *   index?: string,
 *   errorPages?: { [key: number]: string }
 * }} options 
 * 
 * @returns { (request: Request) => Promise<Response> }
 * 
 * @description 
 * Option `fileProvder` is called to retrieve a file
 * Option `index` if this is set, it will serve all requests that don't match a file
 * Option `indexes` is used to append strings the and of a url if it's not found.
 * Example using ['.html', 'index.html']:
 *  - request: `/foobar` => /foobar.html
 *  - request: `/foobar/` => /foobar/index.html
 * 
 * Option `errorPages` is used to determine a HTML page for a given error status code.
 * Example: { 404: '/404.html' }
 */
export function pages(options) {
  options.directory ??= '.';
  options.indexes   ??= ['.html', 'index.html'];

  const fileProvider = options.fileProvider;

  return async (request) => {
    const url = new URL(request.url);

    let location = path.parse(url.pathname),
        response = location.ext ? await fileProvider(request) : new Response(null, { status: 404 }),
        origin   = url.origin;

    if (response.status == 404 && request.headers.get('accept')?.includes('html')) {

      for (const index of options.indexes) {
        response = await options.fileProvider(new Request(request.url + index, request));

        if (response.ok) {
          response.headers.set('cache-control', 'no-cache');
          
          return response;
        }
      }

      if (options.index) {
        return options.fileProvider(new Request(origin + options.index));
      }

    }

    if (!response.ok) {
      const path = options.errorPages?.[response.status];

      if (path) {
        let errorPageRequest = new Request(origin + location.dir + '/' + path, request),
            errorPage        = await options.fileProvider(errorPageRequest);

        if (errorPage.status == 404) {
          errorPageRequest = new Request(origin + path, request);
          errorPage        = await options.fileProvider(errorPageRequest);
        }

        return new Response(errorPage.body, { 
          status: response.status, 
          headers: { 
            'content-type'     : 'text/html',
            'content-location' : new URL(errorPageRequest.url).pathname  
          }
        });
      }      
    }

    return response;
  }
}