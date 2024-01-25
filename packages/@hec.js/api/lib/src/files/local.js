import { stat, readFile } from 'fs/promises';
import { lookup }         from 'mime-types';
import path               from 'path';

/** @typedef {{ etag?: string, 'last-modified'?: string } & { [key: string]: string }} FileInfo */

/**
 * @template T
 * @param {{ 
 *   directory?: string, 
 *   cacheControl?: string,
 *   cacheDuration?: number,
 *   proxy?: (request: Request) => Promise<Response>
 * }} options 
 * @returns { import('../../types/src/routing/route.js').RouteRequest<T> }
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
export function files(options = {}) {
  options.directory     ??= '.';
  options.cacheDuration ??= 10000;
  options.cacheControl  ??= `public, max-age=14400, stale-while-revalidate=28800, stale-if-error=28800`;

  /** @type { Map<string, FileInfo> } */
  const cache   = new Map(), 
        noCache = { etag: null, 'last-modfiled': null };

  /** @type { (request: Request) => Promise<Response> } */
  const localFileProxy = async (request) => {
    const headers         = request.headers,
          filePath        = path.join(options.directory, new URL(request.url).pathname),
          fileInfo        = cache.get(filePath) ?? noCache,
          ifRange         = headers.get('if-range') ?? '',
          ifNoneMatch     = headers.get('if-none-match') ?? '',
          ifModifiedSince = headers.get('if-modified-since') ?? '';

    if (ifNoneMatch === fileInfo.etag || ifModifiedSince === fileInfo['last-modified']) {
      return new Response(null, { status: 304, headers: fileInfo });
    }

    const fileStats = await stat(filePath).catch(() => null);

    if (!fileStats || fileStats.isDirectory()) {
      return new Response(null, { status: 404 });
    }

    const data         = await readFile(filePath),
          etag         = `"${Buffer.from(await crypto.subtle.digest('SHA-1', data)).toString('hex')}"`,
          size         = fileStats.size,
          lastModified = new Date(fileStats.mtime).toUTCString(),
          range        = parseRangeHeader(request, size);

    if (headers.has('if-range') && ifRange != lastModified && !ifRange?.includes(etag)) {
      headers.delete('range');
    }

    const responseHeaders = {
      'content-type'  : lookup(filePath) || 'application/octect-stream',
      'content-size'  : (range.end - range.start).toString(),
      'cache-control' : options.cacheControl,
      'last-modified' : lastModified,
      'etag'          : etag,
      'accept-ranges' : 'bytes',
      'content-range' : `bytes ${range.start}-${range.end - 1}/${size}`
    };

    if (ifNoneMatch === etag || ifModifiedSince === lastModified) {
      return new Response(null, { status: 304, headers: responseHeaders });
    }

    cache.set(filePath, responseHeaders);

    setTimeout(() => cache.delete(filePath), options.cacheDuration);

    return new Response(
      headers.has('range') ? data.subarray(range.start, range.end) : data, 
      { 
        status  : headers.has('range') ? 206 : 200,
        headers : responseHeaders
      }
    );
  }

  options.proxy ??= localFileProxy;

  return options.proxy;
}

/**
 * @param { Request } request 
 * @param { number } size 
 * @returns {{ start: number, end: number }}
 */
function parseRangeHeader(request, size) {
  const r = request.headers.get('range'),
        s = r ? r.substring(6).split('-').map(parseInt) : [0, size];

  return { start : s[0] || 0, end: Math.min(s[1] || size, size) };
}