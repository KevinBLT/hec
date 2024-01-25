import { Server } from 'http';
import { API } from '@hec.js/api';
import { files } from '../lib/index.js';

const api = new API({});

api.route({ 
  path: '/*', 
  fetch: files({ 
    directory: './packages/@hec.js/api/test/assets', 
    cacheControl: 'private, max-age=0',
    fallbackPaths: {
      'text/html': '/index.html'
    },
    errorPages: {
      404: '/404.html'
    }
  }) 
});

new Server(api.serve()).listen(8000);