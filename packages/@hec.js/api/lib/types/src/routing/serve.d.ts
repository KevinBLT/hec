/**
 * @param {(Request) => Promise<Response>} fetch
 *
 * @description
 * Creates a function that can serve NodeJS http handler function with a `(req, res)` function.
 */
export function serveBy(fetch: (Request: any) => Promise<Response>): (req: import('http').IncomingMessage, res: import('http').ServerResponse) => void;
