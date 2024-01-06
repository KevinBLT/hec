import { expect, test } from "vitest";
import { expression } from "../lib/src/expression.js";

test('Expression parsing', () => {
  const a = expression(`{{ name fu="bar" }}`),
        b = expression(`{{ name fu='bar' }}`),
        c = expression(`{{ fu='bar' }}`),
        d = expression(`{{ name }}`);

  for (const e of [a, b]) {
    expect(e.prop).toBe('name');
    expect(e.meta.fu).toBe('bar');
    expect(e.meta.fu).toBe('bar');
  }

  expect(c.meta.fu).toBe('bar');
  expect(c.prop).toBeNull();
  expect(d.prop).toBe('name');

  expect(a.text).toBe(`{{ name fu="bar" }}`);
});