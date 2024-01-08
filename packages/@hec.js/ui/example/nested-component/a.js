import { component, templateByName } from '../../lib/index.js';

component('c-a', { text: 'Hi' }, (props) => {

  return templateByName('./a.html', props);
});