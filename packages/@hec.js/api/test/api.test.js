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
    {
      path: '/group',
      group: [
        { fetch: () => new Response('G') },
        { path: '/:a', fetch: (r) => new Response(r.param('a')) },
        { path: '/a', fetch: () => new Response('A') },
      ],
    },
    { path: '/*', fetch: (_, c) => new Response('*') },
  ]
);

const asText = (path = '/') => api.fetch(path).then((r) => r.text());

test('Single and default Routing', async () => {
  expect(await asText('/a')).toBe('A');
  expect(await asText('/b')).toBe('b');
  expect(await asText('/foobar/bar')).toBe('*');
});

test('Routing group', async () => {
  expect(await asText('/group')).toBe('G');
  expect(await asText('/group/a')).toBe('A');
  expect(await asText('/group/b')).toBe('b');
});
