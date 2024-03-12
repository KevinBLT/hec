import { expect, test } from 'vitest';
import { API } from '@hec.js/api';

const api = new API(
  {
    foo: 'bar',
  },
  [
    {
      path: '/foo',
      middlewares: [
        (request, api, next) => {
          console.log('1', request.url);

          return next();
        },
        
      ],
      group: [
        { path: '/', fetch: () => new Response('bar') },
      ],
    },
    { 
      path: '/*', 
      middlewares: [
        (request, api, next) => {
          console.log('2', request.url);
          
          if (request.url.includes('say-no')) {
            return new Response('No by Middleware!', { status: 400 });
          }

          return next();
        }
      ],
      group: [
        { fetch: (_, c) => new Response('*') }
      ]
    },
  ]
);

const asText = (path = '/') => api.fetch(path).then((r) => r.text());

test('Middleware', async () => {
  expect(await asText('/foo')).toBe('bar');
  expect(await asText('/a')).toBe('*');
  expect(await asText('/say-no')).toBe('No by Middleware!');
});