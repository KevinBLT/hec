import { component, templateByName } from '../../lib/index.js';

component('c-a', { text: 'Hi' }, (props) => {
  
  const list = Array.from({ length: 2 }, () => ({ text: props.text }));

  return templateByName('./a.html', { list, text: props.text });
});