import { Server } from 'http';
import { API, files, pages } from '@hec.js/api';

const api = new API({});

api.route({ 
  path: '/*', 
  contentType: 'text/html',
  fetch: pages({ 
    index: '/index.html',
    fileProvider: files({ 
      directory: './packages/@hec.js/api/test/assets', 
      cacheControl: 'private, max-age=0'
    }),
  })
});

api.route({ 
  path: '/*', 
  fetch: files({ 
    directory: './packages/@hec.js/api/test/assets', 
    cacheControl: 'private, max-age=0',
    cacheDuration: 0
  })
});

new Server(api.serve()).listen(8000);