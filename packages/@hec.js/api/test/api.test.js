import { expect, test } from 'vitest';
import { API } from '@hec.js/api';

const api = new API(
  {
    foo: 'bar',
  },
  [
    { path: '/:a', fetch: (r) => new Response(r.param('a')) },
    { path: '/a', fetch: () => new Response('A') },
    { path: '/foo', fetch: (_, c) => new Response(c.foo) },
    { method: 'DELETE', path: '/status/delete', fetch: (_, c) => new Response(c.foo) },
    { path: '/status/html', contentType: 'text/html', fetch: (_, c) => new Response(c.foo) },
    {
      path: '/group',
      group: [
        { fetch: () => new Response('G') },
        { path: '/:a', fetch: (r) => new Response(r.param('a')) },
        { path: '/a', fetch: () => new Response('A') },
      ],
    },
    { path: '/foobar/*', fetch: (_, c) => new Response('*') },
  ]
);

const asText   = (path = '/') => api.fetch(path, { headers: { accept: 'text/plain' } }).then((r) => r.text());
const asStatus = (path = '/') => api.fetch(path, { headers: { accept: 'text/plain' } }).then((r) => r.status);

test('Single and default Routing', async () => {
  expect(await asText('/a')).toBe('A');
  expect(await asText('/b')).toBe('b');
  expect(await asText('/foo')).toBe('bar');
  expect(await asText('/foobar/bar')).toBe('*');
});

test('Routing group', async () => {
  expect(await asText('/group')).toBe('G');
  expect(await asText('/group/a')).toBe('A');
  expect(await asText('/group/b')).toBe('b');
});

test('HTTP 4xx', async () => {
  expect(await asStatus('/not/found')).toBe(404);
  expect(await asStatus('/status/delete')).toBe(405);
  expect(await asStatus('/status/html')).toBe(406);
});