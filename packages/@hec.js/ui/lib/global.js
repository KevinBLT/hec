import * as global from './index.js';

for (const key in global) {
  globalThis[key] = global[key];
}