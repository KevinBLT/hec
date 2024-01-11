import { templateByNode } from '../../lib/index.js';

templateByNode(document.body, {
  persons: [
    { name: 'Herbert' },
    { name: 'Klaus' },
    { name: 'Günther' },
  ]
})