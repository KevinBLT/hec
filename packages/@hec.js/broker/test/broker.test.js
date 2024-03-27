import { expect, test } from 'vitest';
import { emit, on } from '../lib/index.js';

test('Broker', () => {
  let calls = 0;

  on('test', () => calls++);

  emit('test');
  emit('test');
  emit('test');

  console.log(calls);

  expect(calls).toBe(3);
});