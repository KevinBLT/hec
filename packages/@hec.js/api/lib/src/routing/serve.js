/**
 * @param {(Request) => Promise<Response>} fetch 
 * 
 * @description
 * Creates a function that can serve NodeJS http handler function with a `(req, res)` function.
 */
export function serveBy(fetch) {

  /**
   * @param { import('http').IncomingMessage } req  
   * @param { import('http').ServerResponse } res 
   */
  return (req, res) => {
    const scheme = req.headers['x-forwarded-proto'] ?? (
      req.headers['cf-visitor']?.includes('https') ? 'https' : null
    ) ?? 'http';

    req.headers['cf-connecting-ip'] ??= req.socket.remoteAddress;
    req.headers['x-real-ip']        ??= req.socket.remoteAddress;

    const abort = new AbortController();

    req.on('close', () => abort.abort());

    fetch(
      new Request(`${ scheme }://${ req.headers.host }${ req.url }`, {
        method: req.method,
        duplex: 'half',
        signal: abort.signal,
        // @ts-ignore
        headers: req.headers,
        body: ['HEAD', 'GET', 'OPTIONS'].includes(req.method) ? null : 
          new ReadableStream({
            start(controller) {
              req.on('data', (chunk) => controller.enqueue(chunk));
              req.on('end',  () => controller.close());
            }
          })
        }
      )
    ).then(async (response) => {
      res.statusCode = response.status;
      
      for (const e of response.headers.entries()) {
        res.appendHeader(e[0], e[1]);
      }

      res.flushHeaders();
      
      if (response.body) {
        // @ts-ignore
        for await (const chunk of response.body) {
          res.write(chunk);
        }
      }
    
      res.end();
    }).catch(error => {
      res.statusCode = 500;

      console.error(error);
      
      res.end();
    });
  }
}