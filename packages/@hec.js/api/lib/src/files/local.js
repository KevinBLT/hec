import { stat, open } from 'fs/promises';
import { lookup }     from 'mime-types';
import path           from 'path';
import md5            from 'md5-file';
import { ReadStream } from 'fs';

/** @typedef {{ etag?: string, 'last-modified'?: string } & { [key: string]: string }} FileInfo */

/**
 * @template T
 * @param {{ 
 *   directory?: string, 
 *   cacheControl?: string,
 *   cacheDuration?: number,
 *   proxy?: (request: Request) => Promise<Response>
 * }} options 
 * @returns { (request: Request) => Promise<Response> }
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

    const etag         = `W/"${ await md5(filePath) }"`,
          size         = fileStats.size,
          lastModified = new Date(fileStats.mtime).toUTCString(),
          range        = parseRangeHeader(request, size);

    if (headers.has('if-range') && ifRange !== lastModified && ifRange !== etag) {
      headers.delete('range');
    }

    const responseHeaders = {
      'content-type'   : lookup(filePath) || 'application/octect-stream',
      'content-length' : (range.end - range.start + 1).toString(),
      'cache-control'  : options.cacheControl,
      'last-modified'  : lastModified,
      'etag'           : etag,
      'accept-ranges'  : 'bytes',
    };

    if (request.headers.has('range')) {
      responseHeaders['content-range'] = `bytes ${range.start}-${range.end}/${size}`;
    }

    if (ifNoneMatch === etag || ifModifiedSince === lastModified) {
      return new Response(null, { status: 304, headers: responseHeaders });
    }

    if (options.cacheDuration) {
      cache.set(filePath, responseHeaders);
      setTimeout(() => cache.delete(filePath), options.cacheDuration);
    }

    const file       = await open(filePath),
          fileStream = file.createReadStream(range);

    return new Response(new ReadableStream({
      start(stream) {
        let isClosed = false;

        const end = async () => {
          if (!isClosed) {
            isClosed = true;
            stream.close();
            fileStream.close();
            await file.close();
          }
        }

        request.signal.addEventListener('abort', () => end());

        fileStream.on('data',  (data) => stream.enqueue(data));
        fileStream.on('close', ()     => end());
        fileStream.on('error', ()     => end());
      }
    }), { 
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
        m = size - 1,
        s = r ? r.substring(6).split('-').map(e => parseInt(e)) : [0, m];

  return { 
    start: s[0] || 0, 
    end:   Math.min(s[1] || m, m) 
  };
}