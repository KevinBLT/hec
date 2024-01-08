import { signal, templateByNode } from '../../lib/index.js';

const listLength = signal(0),
      list       = listLength.map(e => Array.from({ length: e }, (_, e) => e));

templateByNode(document.body, {
  if: signal(false),
  listLength,
  list
});