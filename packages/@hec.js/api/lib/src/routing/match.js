/**
 * @param {string | string[]} mimeTypeA
 * @param {string} mimeTypeB 
 * @returns {boolean}
 * 
 * @description
 * Matches a mime type or list of mimetypes against another mimetype.  
 * 
 * Example: `text/*` will match with `text/html` and `text/plain`
 */
export function mimeTypeMatch(mimeTypeA, mimeTypeB) {
  
  if (!mimeTypeA || !mimeTypeB) {
    return true;
  }

  if (Array.isArray(mimeTypeA)) {
    return mimeTypeA.some(
      e => e.includes(mimeTypeB) || mimeTypeB.includes(e)
    );
  }

  return mimeTypeA.includes(mimeTypeB) || mimeTypeB.includes(mimeTypeA);
}

/**
 * @template T
 * @param {Request} request Request to test (e.g. `GET /foo/bar/`)
 * @param {import("./route.js").Route<T>} route Route to check for match
 * @param {{status: number, url: string, accept: string[], contentType: string}} context Route to check for match
 * @returns {boolean}
 * 
 * @description
 * Returns wether the route matches, updates the given context from request if it was not set.  
 * Notice: This function has side effects on `context` for performance reasons.
 */
export function routeMatch(request, route, context = {status: null, url: null, accept: null, contentType: null}) {
  context.accept      ??= request.headers.get('accept')?.replace(/\*/g, '')?.split(',');
  context.contentType ??= request.headers.get('content-type')?.replace(/\*/g, '');
  context.url         ??= request.url.toLowerCase();
  context.status      ??= 404;

  if (!route.pattern.test(context.url)) {
    return false;
  }

  if (route.method && request.method != route.method) {
    context.status = context.status < 405 ? 405 : context.status;

    return false;
  }

  if (route.accept && !request.body) {
    context.status = 415;

    return false;
  }

  if (request.body && route.accept && !mimeTypeMatch(route.accept, context.contentType)) {
    context.status = 406;

    return false;
  }

  if (route.contentType && !mimeTypeMatch(context.accept, route.contentType)) {
    context.status = 406;

    return false;
  }

  return true;
}