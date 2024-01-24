import { Server } from 'http';
import { API } from '@hec.js/api';
import { fileFetch } from '../lib/index.js';

const api = new API({});

api.route({ path: '/*', fetch: fileFetch({ directory: '.', maxAge: 0}) });

new Server(api.serve()).listen(8000);