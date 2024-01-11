import { signal, templateByNode } from '../../lib/index.js';
import { generateRandomName } from '../nested-signal/util.js';

const persons = Array.from({ length: 500 }, () => {
  return  { name: generateRandomName }
});

templateByNode(document.body, { persons });