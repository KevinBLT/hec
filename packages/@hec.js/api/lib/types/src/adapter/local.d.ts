/** @typedef {{ etag: string, lastModified: string }} FileInfo */
/**
 * @template T
 * @param {{ directory: string, maxAge: number }} options
 * @returns { import('../../types/src/routing/route.js').RouteRequest<T> }
 */
export function fileFetch<T>(options?: {
    directory: string;
    maxAge: number;
}): import("../../types/src/routing/route.js").RouteRequest<T>;
export type FileInfo = {
    etag: string;
    lastModified: string;
};
