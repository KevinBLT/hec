import { stat, readFile } from 'fs/promises';
import { ApiRequest } from '../routing/request.js';
import { lookup } from 'mime-types';
import path from 'path';

/** @typedef {{ etag: string, lastModified: string }} FileInfo */

/**
 * @template T
 * @param {{ directory: string, maxAge: number }} options 
 * @returns { import('../../types/src/routing/route.js').RouteRequest<T> }
 */
export function fileFetch(options = { directory: '.', maxAge: 14000 }) {

  /** @type { Map<string, FileInfo> } */
  const cache = new Map();

  return async (request) => {
    const headers      = request.headers,
          filePath     = path.join(options.directory, request.path),
          fileInfo     = cache.get(filePath),
          ifRange      = headers.get('if-range'),
          etag         = headers.get('if-none-match'),
          lastModified = headers.get('if-modified-since');

    if (etag === fileInfo?.etag || lastModified === fileInfo?.lastModified) {
      return new Response(null, { status: 304 });
    }

    const fileStat = await stat(filePath).catch(() => null);

    if (!fileStat) {
      return new Response(null, { status: 404 });
    }

    const data     = await readFile(filePath),
          hash     = `"${Buffer.from(await crypto.subtle.digest('SHA-1', data)).toString('hex')}"`,
          size     = fileStat.size,
          modified = new Date(fileStat.mtime).toUTCString(),
          range    = parseRangeHeader(request, size);

    if (headers.has('if-range') && ifRange != modified && !ifRange?.includes(hash)) {
      headers.delete('range');
    }

    if (etag === hash || lastModified === modified) {
      return new Response(null, { status: 304 });
    }

    cache.set(filePath, { etag: hash, lastModified: modified });

    setTimeout(() => cache.delete(filePath), 10000);

    return new Response(headers.has('range') ? data.subarray(range.start, range.end) : data, { 
      status  : headers.has('range') ? 206 : 200,
      headers : {
        'content-type'  : lookup(filePath) || 'application/octect-stream',
        'content-size'  : (range.end - range.start).toString(),
        'cache-control' : `public, max-age=${options.maxAge}, stale-while-revalidate=28800, stale-if-error=28800`,
        'last-modified' : modified,
        'etag'          : hash,
        'accept-ranges' : 'bytes',
        'content-range' : `bytes ${range.start}-${range.end - 1}/${size}`
      }
    });
  }
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