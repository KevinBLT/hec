import { templateByNode } from '../../lib/index.js';

templateByNode(document.body, {
  colors: [
    { name: 'Rot', class: 'red' },
    { name: 'Grün', class: 'green' },
    { name: 'Blaue', class: 'blue  ' },
  ]
})