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
    fetch(
      new Request(`http://${req.headers.host}${req.url}`, {
        method: req.method,
        duplex: 'half',
        // @ts-ignore
        headers: Object.assign({
          'cf-connecting-ip': req.socket.remoteAddress
        }, req.headers),
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
        res.setHeader(e[0], e[1]);
      }
      
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