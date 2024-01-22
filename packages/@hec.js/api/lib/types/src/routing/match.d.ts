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
export function mimeTypeMatch(mimeTypeA: string | string[], mimeTypeB: string): boolean;
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
export function routeMatch<T>(request: Request, route: import("./route.js").Route<T>, context?: {
    status: number;
    url: string;
    accept: string[];
    contentType: string;
}): boolean;
