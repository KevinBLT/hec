import { component, signal, templateByNode, templateByString } from '../../lib/index.js';

const p = {
  name: 'Lazy...'
}

const lazy = async () => {
  let i = 1;
  
  for (const lazy of document.querySelectorAll('[hidden]')) {
    await new Promise(r => setTimeout(r, 1000));

    p.name += ` -> ${i++}`;

    lazy.removeAttribute('hidden');
  }

}

lazy();

templateByNode(document.body, p);

component('my-test', {}, () => templateByString(new Date().toJSON()));