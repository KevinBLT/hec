import { component, signal, templateByNode, templateByString } from '../../lib/index.js';

component('parent', {}, () => {
  const name = signal('Little Lobby')

  console.log('PARENT');

  return templateByString(`<div><strong>PARENT</strong><slot name="@name"></slot></div>`, { name });

});


component('child', { name: '' }, (props) => {

  console.log('CHILD');
  
  return templateByString(`<div><span>CHILD: {{ name }}</span></div>`, props);

});

templateByNode(document);