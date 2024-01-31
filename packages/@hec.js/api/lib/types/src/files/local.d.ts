/** @typedef {{ etag?: string, 'last-modified'?: string } & { [key: string]: string }} FileInfo */
/**
 * @template T
 * @param {{
 *   directory?: string,
 *   cacheControl?: string,
 *   cacheDuration?: number,
 *   proxy?: (request: Request) => Promise<Response>
 * }} options
 * @returns { import('../../src/routing/route.js').RouteRequest<T> }
 *
 * @description
 * Serves files from the specified `directory` with the given `cacheControl` header set.
 * Conditional requests are handled automatically. Default cacheControl is `public, 2h`.
 *
 * The option `cacheDuration` defines how long an `lastModfied/etag` pair can stay in memory before
 * recalculation for a given URL. Default value is: `10000ms`.
 *
 * If `proxy` is give, it will be used instead the local file system.
 */
export function files<T>(options?: {
    directory?: string;
    cacheControl?: string;
    cacheDuration?: number;
    proxy?: (request: Request) => Promise<Response>;
}): import("../../src/routing/route.js").RouteRequest<T>;
export type FileInfo = {
    etag?: string;
    'last-modified'?: string;
} & {
    [key: string]: string;
};
