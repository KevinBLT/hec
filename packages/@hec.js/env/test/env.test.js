import { writeFile, rm } from 'fs/promises';
import { environment } from '@hec.js/env';
import { afterAll, beforeAll, expect, test } from 'vitest';

beforeAll(async () => {
  await writeFile('.env', 'TEST=1\n\nFOO=2 # Comment\n\n# Only a comment\n\n   BAR = 3');
  await writeFile('.env.test', 'TEST=5');
});

afterAll(async () => {
  await rm('.env');
  await rm('.env.test');
});

test('Read env files correctly', async () => {
  const env = await environment('test');

  expect(env.TEST).toBe('5');
  expect(env.FOO).toBe('2');
  expect(env.BAR).toBe('3');
});