import { component, templateByName } from '../../lib/index.js';

component('c-b', { text: '' }, (props) => {

  return templateByName('./b.html', props);
});